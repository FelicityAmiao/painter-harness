import path from "node:path";
import {
  Doc,
  isValidIso,
  load,
  loadSkills,
  today,
  toPosix,
} from "./lib";

type Level = "error" | "warning";
interface Issue {
  level: Level;
  file: string;
  msg: string;
}

const COURSE_STATUS = ["planned", "active", "paused", "completed"];
const COURSE_TRACK = ["foundation", "illustration", "game-art"];
const ASSIGNMENT_STATUS = ["todo", "doing", "done", "dropped"];
const PRIORITY = ["high", "medium", "low"];
const RESULT = ["ok", "partial", "missed"];
const MILESTONE_STATUS = ["draft", "active", "done", "paused"];
const ID_RE = /^[a-z0-9][a-z0-9-]*$/;

export function runValidate(): number {
  const issues: Issue[] = [];
  const now = today();
  const push = (level: Level, file: string, msg: string) => issues.push({ level, file, msg });

  const skillIds = new Set(loadSkills().map((s) => s.id));
  const courses = load("data/courses");
  const sessions = load("data/sessions");
  const assignments = load("data/assignments");
  const practices = load("data/practice");
  const milestones = load("data/milestones");

  const courseIds = new Set(courses.map((c) => c.data.id));
  const coursesById = new Map(courses.map((c) => [c.data.id, c]));
  const assignmentIds = new Set(assignments.map((a) => a.data.id));
  const milestoneIds = new Set(milestones.map((m) => m.data.id));
  const sessionIds = new Set(sessions.map((s) => s.data.id));

  const base = (doc: Doc, kind: string): string | null => {
    const file = doc.rel;
    const id = doc.data.id;
    if (typeof id !== "string" || !id.trim()) {
      push("error", file, `${kind}: 缺少 id`);
      return null;
    }
    const expected = path.basename(doc.rel, ".md");
    if (id !== expected) push("error", file, `id "${id}" 必须等于文件名 "${expected}"`);
    else if (!ID_RE.test(id)) push("error", file, `id "${id}" 只允许小写字母/数字/连字符`);
    return id;
  };

  const date = (doc: Doc, field: string, required: boolean) => {
    const v = doc.data[field];
    if (v === undefined || v === null || v === "") {
      if (required) push("error", doc.rel, `缺少必填日期字段 ${field}`);
      return;
    }
    if (!isValidIso(v)) push("error", doc.rel, `${field} 不是合法 YYYY-MM-DD: ${JSON.stringify(v)}`);
  };

  const enumOf = (doc: Doc, field: string, allowed: string[], required: boolean, fallback?: string) => {
    const v = doc.data[field] ?? fallback;
    if (v === undefined || v === null || v === "") {
      if (required) push("error", doc.rel, `缺少必填枚举字段 ${field}（${allowed.join("|")}）`);
      return;
    }
    if (!allowed.includes(String(v))) push("error", doc.rel, `${field}="${v}" 不在枚举 ${allowed.join("|")} 中`);
  };

  const skillsOf = (doc: Doc) => {
    const v = doc.data.skills;
    if (v === undefined || v === null) return;
    if (!Array.isArray(v)) {
      push("error", doc.rel, `skills 必须是数组，如 [foundation/line]`);
      return;
    }
    for (const s of v) {
      const id = typeof s === "string" ? s.trim() : "";
      if (!id) push("error", doc.rel, "skills 中存在空项");
      else if (!skillIds.has(id)) push("error", doc.rel, `未知技能 id: ${id}（未定义在 painter-context/skill-tree.md）`);
    }
  };

  const ref = (doc: Doc, field: string, ids: Set<string>, what: string, required = false) => {
    const v = doc.data[field];
    if (v === undefined || v === null || v === "") {
      if (required) push("error", doc.rel, `缺少必填引用字段 ${field}`);
      return;
    }
    if (typeof v !== "string" || !ids.has(v)) push("error", doc.rel, `${field}="${v}" 指向不存在的${what}`);
  };

  if (courses.length === 0) push("warning", "data/courses/", "还没有任何课程");

  for (const c of courses) {
    const file = c.rel;
    if (!c.data.title) push("error", file, "缺少 title");
    base(c, "课程");
    if (c.data.status !== undefined && c.data.status !== null && c.data.status !== "" && !COURSE_STATUS.includes(String(c.data.status))) {
      push("error", file, `status="${c.data.status}" 不在枚举 ${COURSE_STATUS.join("|")} 中`);
    }
    enumOf(c, "track", COURSE_TRACK, true);
    date(c, "start_date", false);
    date(c, "end_date", false);
    skillsOf(c);
  }

  for (const s of sessions) {
    base(s, "上课记录");
    date(s, "date", true);
    ref(s, "course", courseIds, "课程", true);
    const course = coursesById.get(s.data.course);
    const sessionParts = s.rel.split("/");
    if (sessionParts.length !== 4 || sessionParts[0] !== "data" || sessionParts[1] !== "sessions" || sessionParts[2] !== course?.data.track) {
      push("error", s.rel, `session 必须位于关联课程 track 对应的目录：data/sessions/<track>/（当前课程 track=${course?.data.track ?? "缺失"}）`);
    }
    const sessionName = path.basename(s.rel);
    const sessionNameMatch = sessionName.match(/^(\d{4}-\d{2}-\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/);
    if (!sessionNameMatch) {
      push("error", s.rel, "文件名必须为 YYYY-MM-DD-<ascii-topic-slug>.md，主题 slug 仅使用小写 ASCII 字母、数字和连字符");
    } else {
      if (!isValidIso(sessionNameMatch[1])) push("error", s.rel, `文件名日期不是合法 YYYY-MM-DD：${sessionNameMatch[1]}`);
      if (s.data.date !== sessionNameMatch[1]) push("error", s.rel, `文件名日期 ${sessionNameMatch[1]} 必须与 date 字段 ${s.data.date ?? "缺失"} 一致`);
    }
    ref(s, "assignment", assignmentIds, "作业");
    skillsOf(s);
    if (typeof s.data.homework_due === "string" && s.data.homework_due) date(s, "homework_due", false);
    if (s.data.duration_min !== undefined && s.data.duration_min !== null && s.data.duration_min !== "" && !Number.isFinite(Number(s.data.duration_min))) {
      push("error", s.rel, "duration_min 必须是数字");
    }
  }

  for (const a of assignments) {
    base(a, "作业");
    if (!a.data.title) push("error", a.rel, "缺少 title");
    date(a, "due", true);
    enumOf(a, "status", ASSIGNMENT_STATUS, true);
    enumOf(a, "priority", PRIORITY, false, "medium");
    ref(a, "course", courseIds, "课程");
    ref(a, "session", sessionIds, "上课记录");
    skillsOf(a);
    if (a.data.estimate_hours !== undefined && a.data.estimate_hours !== null && a.data.estimate_hours !== "" && !Number.isFinite(Number(a.data.estimate_hours))) {
      push("error", a.rel, "estimate_hours 必须是数字");
    }
    if (!/^as-\d{3}-/.test(path.basename(a.rel))) {
      push("warning", a.rel, "文件名建议为 as-NNN-<slug>.md");
    }
    const status = String(a.data.status ?? "");
    if (isValidIso(a.data.due) && !["done", "dropped"].includes(status)) {
      const left = Math.round((new Date(a.data.due + "T00:00:00").getTime() - new Date(now + "T00:00:00").getTime()) / 86400000);
      if (left < 0) push("warning", a.rel, `已逾期 ${-left} 天（due=${a.data.due}）`);
      else if (left <= 3) push("warning", a.rel, `${left} 天内到期（due=${a.data.due}）`);
    }
  }

  for (const p of practices) {
    base(p, "练习记录");
    date(p, "date", true);
    if (typeof p.data.goal !== "string" || !p.data.goal.trim()) {
      push("error", p.rel, "缺少 goal（本次练习目的，必填）");
    }
    enumOf(p, "result", RESULT, true);
    ref(p, "milestone", milestoneIds, "里程碑");
    ref(p, "session", sessionIds, "上课记录");
    skillsOf(p);
    if (p.data.duration_min !== undefined && p.data.duration_min !== null && p.data.duration_min !== "" && !Number.isFinite(Number(p.data.duration_min))) {
      push("error", p.rel, "duration_min 必须是数字");
    }
  }

  for (const m of milestones) {
    base(m, "里程碑");
    if (!m.data.title) push("error", m.rel, "缺少 title");
    date(m, "target_date", false);
    enumOf(m, "status", MILESTONE_STATUS, false, "active");
    skillsOf(m);
  }

  const calFile = load("data").find((d) => d.rel === "data/calendar.md");
  if (calFile) {
    for (const [i, line] of calFile.content.split(/\r?\n/).entries()) {
      if (line.startsWith("- ") && !/^- \d{4}-\d{2}-\d{2} · .+$/.test(line)) {
        push("warning", `data/calendar.md`, `第 ${i + 1} 行不符合 "- YYYY-MM-DD · 事项" 格式`);
      }
    }
  }

  /* ---- 输出 ---- */
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");

  console.log(`\n🔎 validate：${courses.length} 课程 / ${sessions.length} 上课 / ${assignments.length} 作业 / ${practices.length} 练习 / ${milestones.length} 里程碑\n`);
  for (const i of errors) console.log(`  ❌ ${i.file} — ${i.msg}`);
  for (const i of warnings) console.log(`  ⚠️  ${i.file} — ${i.msg}`);
  if (errors.length === 0 && warnings.length === 0) console.log("  ✅ 全部通过");
  console.log(`\n${errors.length} error / ${warnings.length} warning\n`);
  return errors.length > 0 ? 1 : 0;
}
