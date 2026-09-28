import fs from "node:fs";
import path from "node:path";
import {
  Doc,
  ROOT,
  addDays,
  checklistOf,
  diffDays,
  isValidIso,
  load,
  loadSkills,
  parseCalendar,
  progressBar,
  skillStats,
  today,
  titleOf,
  weekdayCN,
} from "./lib";

const PRIO_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

interface QueueItem {
  doc: Doc;
  due: string;
  daysLeft: number;
  bucket: number; // 0 逾期 / 1 ≤3天 / 2 其余
}

function queue(): QueueItem[] {
  const now = today();
  return load("data/assignments")
    .filter((a) => ["todo", "doing"].includes(String(a.data.status)) && isValidIso(a.data.due))
    .map((a) => {
      const daysLeft = diffDays(now, a.data.due);
      return { doc: a, due: a.data.due, daysLeft, bucket: daysLeft < 0 ? 0 : daysLeft <= 3 ? 1 : 2 };
    })
    .sort((a, b) => {
      if (a.bucket !== b.bucket) return a.bucket - b.bucket;
      if (a.due !== b.due) return a.due < b.due ? -1 : 1;
      const pa = PRIO_RANK[String(a.doc.data.priority)] ?? 1;
      const pb = PRIO_RANK[String(b.doc.data.priority)] ?? 1;
      if (pa !== pb) return pa - pb;
      return a.doc.rel.localeCompare(b.doc.rel);
    });
}

function leftLabel(daysLeft: number): string {
  if (daysLeft < 0) return `逾期 ${-daysLeft} 天`;
  if (daysLeft === 0) return "今天";
  return `剩 ${daysLeft} 天`;
}

function flag(q: QueueItem): string {
  if (q.bucket === 0) return "🔴";
  if (q.bucket === 1) return "🟠";
  return "🟢";
}

/* ---------------- npm run next ---------------- */

export function nextCmd(limit = 10): void {
  const items = queue();
  console.log(`\n🏆 作业优先级队列（DDL 驱动，共 ${items.length} 项，显示 top ${Math.min(limit, items.length)}）\n`);
  if (items.length === 0) {
    console.log("  （没有进行中的作业，去录课或添加作业吧）\n");
    return;
  }
  items.slice(0, limit).forEach((q, i) => {
    const pri = String(q.doc.data.priority ?? "medium");
    const st = String(q.doc.data.status);
    console.log(
      `  ${String(i + 1).padStart(2)}. ${flag(q)} ${q.due} · ${leftLabel(q.daysLeft).padEnd(8)} · ${pri.padEnd(6)} · ${titleOf(q.doc)}  [${st}] ${q.doc.rel}`,
    );
  });
  console.log();
}

/* ---------------- npm run agenda ---------------- */

export function agendaCmd(horizon = 14): void {
  const now = today();
  const end = addDays(now, horizon);

  const dueItems = load("data/assignments").filter(
    (a) => isValidIso(a.data.due) && !["done", "dropped"].includes(String(a.data.status)) && a.data.due <= end,
  );
  const calItems = parseCalendar().filter((c) => c.date <= end);

  interface Row {
    date: string;
    kind: string;
    text: string;
    urgent?: string;
  }
  const rows: Row[] = [];
  for (const a of dueItems) {
    const daysLeft = diffDays(now, a.data.due);
    rows.push({
      date: a.data.due,
      kind: "作业DDL",
      text: `${titleOf(a)} (${a.rel})`,
      urgent: daysLeft < 0 ? `逾期 ${-daysLeft} 天` : daysLeft === 0 ? "今天截止" : `剩 ${daysLeft} 天`,
    });
  }
  for (const c of calItems) rows.push({ date: c.date, kind: "日程", text: c.text });

  const byDate = new Map<string, Row[]>();
  for (const r of rows) byDate.set(r.date, [...(byDate.get(r.date) ?? []), r]);

  console.log(`\n📋 日程 · ${now} ~ ${end}（逾期置顶，${rows.length} 项）\n`);
  const overdue = [...byDate.keys()].filter((d) => d < now).sort();
  if (overdue.length) {
    console.log("  —— 已逾期 ——");
    for (const d of overdue) {
      for (const r of byDate.get(d)!) console.log(`  🔴 ${d} [${r.kind}] ${r.text} — ${r.urgent ?? ""}`);
    }
    console.log();
  }
  const upcoming = [...byDate.keys()].filter((d) => d >= now).sort();
  if (!upcoming.length && !overdue.length) console.log("  （这段时间没有事项）\n");
  for (const d of upcoming) {
    console.log(`  ${d} 周${weekdayCN(d)}`);
    for (const r of byDate.get(d)!) {
      const icon = r.kind === "作业DDL" ? "⏰" : "📌";
      console.log(`    ${icon} [${r.kind}] ${r.text}${r.urgent ? ` — ${r.urgent}` : ""}`);
    }
  }
  console.log();
}

/* ---------------- npm run rollup ---------------- */

export function rollupCmd(): void {
  const now = today();
  const courses = load("data/courses");
  const sessions = load("data/sessions");
  const assignments = load("data/assignments");
  const practices = load("data/practice");
  const milestones = load("data/milestones");
  const notes = load("notes").filter((n) => !n.rel.endsWith("README.md"));
  const skills = loadSkills();
  const stats = skillStats(practices);
  const queueItems = queue();

  const weekStart = addDays(now, -6);
  const weekPractices = practices.filter((p) => isValidIso(p.data.date) && p.data.date >= weekStart);
  const weekSessions = sessions.filter((s) => isValidIso(s.data.date) && s.data.date >= weekStart);
  const weekNotes = notes.filter((n) => {
    const c = n.data.created;
    return typeof c === "string" && c >= weekStart;
  });
  const minutes = weekPractices.reduce((sum, p) => sum + (Number(p.data.duration_min) || 0), 0);
  const okCount = weekPractices.filter((p) => p.data.result === "ok").length;
  const partialCount = weekPractices.filter((p) => p.data.result === "partial").length;
  const missedCount = weekPractices.filter((p) => p.data.result === "missed").length;
  const goalRate = weekPractices.length ? Math.round((okCount / weekPractices.length) * 100) : 0;
  const lastPracticeDate = practices
    .filter((p) => isValidIso(p.data.date))
    .map((p) => p.data.date as string)
    .sort()
    .pop();
  const gap = lastPracticeDate ? diffDays(lastPracticeDate, now) : null;

  const overdue = queueItems.filter((q) => q.bucket === 0);
  const soon = queueItems.filter((q) => q.bucket === 1);

  const L: string[] = [];
  L.push("# 学习仪表盘");
  L.push("");
  L.push(`> ⏱ ${now} 生成 · \`npm run rollup\` · ${courses.length} 课程 · ${sessions.length} 上课 · ${assignments.length} 作业 · ${practices.length} 练习 · ${notes.length} 篇笔记`);
  L.push("");

  L.push("## 总体进度（里程碑）");
  L.push("");
  if (milestones.length === 0) {
    L.push("（暂无里程碑，见 `templates/milestone.md`）");
  } else {
    L.push("| 里程碑 | 状态 | 目标日期 | 进度 |");
    L.push("| --- | --- | --- | --- |");
    for (const m of milestones) {
      const { done, total } = checklistOf(m.content);
      const pct = total ? (done / total) * 100 : 0;
      const status = String(m.data.status ?? "active");
      L.push(
        `| ${titleOf(m)} | ${status} | ${m.data.target_date ?? "—"} | ${total ? `${progressBar(pct)} (${done}/${total})` : "（无 checklist）"} |`,
      );
    }
  }
  L.push("");

  L.push("## 作业队列（DDL 驱动）");
  L.push("");
  if (queueItems.length === 0) {
    L.push("（没有进行中的作业）");
  } else {
    L.push("| # | DDL | 剩余 | 优先级 | 标题 | 状态 | 文件 |");
    L.push("| --- | --- | --- | --- | --- | --- | --- |");
    queueItems.forEach((q, i) => {
      L.push(
        `| ${i + 1} | ${flag(q)} ${q.due} | ${leftLabel(q.daysLeft)} | ${q.doc.data.priority ?? "medium"} | ${titleOf(q.doc)} | ${q.doc.data.status} | \`${q.doc.rel}\` |`,
      );
    });
  }
  L.push("");

  L.push("## 技能树（含练习统计）");
  L.push("");
  L.push("| id | 技能 | 轨道 | 级别 | 练习次数 | 最近练习 | 候选建议 |");
  L.push("| --- | --- | --- | --- | --- | --- | --- |");
  for (const s of skills) {
    const st = stats.get(s.id);
    let advice = "—";
    if (st) {
      if (s.level === 0 && st.count >= 1) advice = "→ 候选 L1";
      else if (s.level === 1 && st.count >= 3 && st.lastResult === "ok") advice = "→ 候选 L2";
      else if (s.level >= 2) advice = "（升 L3+ 需周复盘读反思判断）";
      else advice = "继续积累";
    }
    L.push(
      `| ${s.id} | ${s.name} | ${s.track} | L${s.level} | ${st?.count ?? 0} | ${st?.last ?? "—"} | ${advice} |`,
    );
  }
  L.push("");
  L.push("> 级别升降只在周复盘确认后修改 `painter-context/skill-tree.md`，评定表见该文件。");
  L.push("");

  L.push("## 本周练习（近 7 天）");
  L.push("");
  L.push(`- 练习 **${weekPractices.length} 次** · 累计 **${minutes} 分钟** · goal 达成率 **${goalRate}%**（ok ${okCount} / partial ${partialCount} / missed ${missedCount}）`);
  L.push(`- 上课 ${weekSessions.length} 次 · 新笔记 ${weekNotes.length} 篇`);
  if (gap === null) L.push("- ⚠️ 还没有任何练习记录");
  else if (gap > 4) L.push(`- ⚠️ 距上次练习已 **${gap} 天**，建议今天排一次`);
  else L.push(`- 距上次练习 ${gap} 天`);
  L.push("");

  L.push("## 提醒");
  L.push("");
  if (overdue.length) L.push(`- 🔴 逾期作业 **${overdue.length} 项**：${overdue.map((q) => titleOf(q.doc)).join("、")}`);
  if (soon.length) L.push(`- 🟠 3 天内到期 **${soon.length} 项**：${soon.map((q) => `${titleOf(q.doc)}（${q.due}）`).join("、")}`);
  if (!overdue.length && !soon.length) L.push("- ✅ 无逾期、无临期作业");
  const stalled = milestones.filter((m) => {
    if (String(m.data.status) !== "active") return false;
    return !practices.some((p) => p.data.milestone === m.data.id);
  });
  for (const m of stalled) L.push(`- ⏳ 里程碑「${titleOf(m)}」还没有任何练习关联，考虑拆小第一步`);
  L.push("");
  L.push("---");
  L.push("");
  L.push("日程合并视图：`npm run agenda` · 优先队列：`npm run next` · 发布站点：`npm run build`");
  L.push("");

  const outDir = path.join(ROOT, "reports");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "dashboard.md");
  fs.writeFileSync(outFile, L.join("\n"), "utf8");
  console.log(`✅ 已生成 ${path.relative(ROOT, outFile).split(path.sep).join("/")}`);
}
