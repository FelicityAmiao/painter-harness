import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** 唯一内容根：所有学习数据、笔记、报告与模板都在此目录下 */
export const CONTENT_ROOT = "painter-context";
export const DIR_COURSES = `${CONTENT_ROOT}/1-courses`;
export const DIR_PLANS = `${CONTENT_ROOT}/2-plans`;
export const DIR_SESSIONS = `${CONTENT_ROOT}/3-sessions`;
export const DIR_ASSIGNMENTS = `${CONTENT_ROOT}/4-assignments`;
export const DIR_PRACTICE = `${CONTENT_ROOT}/5-practice`;
export const DIR_MILESTONES = `${CONTENT_ROOT}/6-milestones`;
export const DIR_NOTES = `${CONTENT_ROOT}/notes`;
export const DIR_REPORTS = `${CONTENT_ROOT}/reports`;
export const DIR_TEMPLATES = `${CONTENT_ROOT}/templates`;

export interface Doc {
  abs: string;
  rel: string; // posix, relative to ROOT
  data: Record<string, any>;
  content: string;
}

export interface SkillRow {
  id: string;
  name: string;
  track: string;
  level: number;
  desc: string;
}

const DEFAULT_SKIP = new Set(["node_modules", "dist", ".git"]);

export function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

export function walkMd(relDir: string, skip: Set<string> = DEFAULT_SKIP): string[] {
  const base = path.join(ROOT, relDir);
  if (!fs.existsSync(base)) return [];
  const out: string[] = [];
  const stack = [base];
  while (stack.length > 0) {
    const dir = stack.pop()!;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!skip.has(entry.name)) stack.push(abs);
      } else if (entry.name.endsWith(".md") && entry.name !== "README.md") {
        out.push(abs);
      }
    }
  }
  return out.sort();
}

/** YAML 会把 `2026-12-31` 解析成 Date 对象，统一归一化回 YYYY-MM-DD 字符串 */
function normalize(value: unknown): unknown {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = normalize(v);
    return out;
  }
  return value;
}

export function load(relDir: string, skip?: Set<string>): Doc[] {
  return walkMd(relDir, skip).map((abs) => {
    const parsed = matter(fs.readFileSync(abs, "utf8"));
    return {
      abs,
      rel: toPosix(path.relative(ROOT, abs)),
      data: normalize(parsed.data) as Record<string, any>,
      content: parsed.content,
    };
  });
}

/* ---------- 日期工具（一律本地时区的 YYYY-MM-DD） ---------- */

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

function fmtLocal(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function today(): string {
  return fmtLocal(new Date());
}

export function isValidIso(v: unknown): v is string {
  if (typeof v !== "string" || !ISO_RE.test(v)) return false;
  const d = new Date(v + "T00:00:00");
  return !Number.isNaN(d.getTime()) && fmtLocal(d) === v;
}

export function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return fmtLocal(d);
}

/** to - from，单位天 */
export function diffDays(from: string, to: string): number {
  const a = new Date(from + "T00:00:00").getTime();
  const b = new Date(to + "T00:00:00").getTime();
  return Math.round((b - a) / 86400000);
}

export function weekdayCN(iso: string): string {
  return "日一二三四五六"[new Date(iso + "T00:00:00").getDay()];
}

/* ---------- 展示工具 ---------- */

export function progressBar(pct: number, width = 20): string {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  const filled = Math.round((clamped / 100) * width);
  return "█".repeat(filled) + "░".repeat(width - filled) + ` ${clamped}%`;
}

export function titleOf(doc: Doc): string {
  const t = doc.data.title;
  if (typeof t === "string" && t.trim()) return t.trim();
  const m = doc.content.match(/^#\s+(.+)$/m);
  if (m) return m[1].trim();
  return path.basename(doc.rel, ".md");
}

export function checklistOf(content: string): { done: number; total: number } {
  const lines = content.match(/^\s*[-*] \[[ xX]\]/gm) ?? [];
  const done = lines.filter((l) => /\[[xX]\]/.test(l)).length;
  return { done, total: lines.length };
}

/* ---------- 技能树 ---------- */

export function loadSkills(): SkillRow[] {
  const file = path.join(ROOT, "painter-context", "skill-tree.md");
  if (!fs.existsSync(file)) return [];
  const rows: SkillRow[] = [];
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 5) continue;
    const id = cells[0];
    if (!id || id === "id" || /^-+$/.test(id)) continue;
    rows.push({
      id,
      name: cells[1],
      track: cells[2],
      level: /^\d+$/.test(cells[3]) ? Number(cells[3]) : 0,
      desc: cells[4],
    });
  }
  return rows;
}

export interface SkillStat {
  count: number;
  ok: number;
  last: string;
  lastResult: string;
}

export function skillStats(practices: Doc[]): Map<string, SkillStat> {
  const map = new Map<string, SkillStat>();
  for (const p of practices) {
    const skills: unknown = p.data.skills;
    if (!Array.isArray(skills)) continue;
    const date = isValidIso(p.data.date) ? p.data.date : "";
    const result = typeof p.data.result === "string" ? p.data.result : "";
    for (const raw of skills) {
      const id = typeof raw === "string" ? raw.trim() : "";
      if (!id) continue;
      const stat = map.get(id) ?? { count: 0, ok: 0, last: "", lastResult: "" };
      stat.count += 1;
      if (result === "ok") stat.ok += 1;
      if (date >= stat.last) {
        stat.last = date;
        stat.lastResult = result;
      }
      map.set(id, stat);
    }
  }
  return map;
}
