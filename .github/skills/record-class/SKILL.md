---
name: record-class
description: '录课两阶段工作流：课前预览（追加日历、建 session 骨架、写 ## 预习粗略浏览）与课后更新（补全课堂内容、建 assignment、validate）。Use when 用户说"要上课了""课前预习""先看看这节课讲什么""下课了帮我记录""录入一次上课""record class"，或要升级 data/sessions/ 里带"课前预览"标记的骨架文件。'
argument-hint: '[课前|课后] [课程id或日期，可省]'
---

# 录课（课前预览 → 课后更新）

把"一次上课"拆成两个阶段：**课前**先建骨架做粗略预习，**课后**原地升级为完整记录。数据规范以 `painter-context/conventions.md` 为准，技能 id 以 `painter-context/skill-tree.md` 为准，全程中文。

## 第 0 步：判断阶段

| 情况 | 阶段 |
| --- | --- |
| 用户明说"要上课了 / 课前 / 预习" | A · 课前预览 |
| 用户明说"下课了 / 课后 / 记录今天的课" | B · 课后更新 |
| 没明说 | 查 `data/sessions/YYYY-MM-DD-<course-id>.md`：文件不存在 → 向用户确认；文件含 `> 状态：课前预览` → B；已是完整记录 → 只做增量修正，禁止重建 |

日期、课程 id 以用户说的为准，缺省取今天；课程必须已存在于 `data/courses/`，新课程先按 conventions 建课程文件。

## 阶段 A · 课前预览（粗略浏览）

按 [pre-class-checklist.md](./references/pre-class-checklist.md) 执行。要点：

1. 询问本次**上课时刻（HH:MM）**后，`data/calendar.md` **去重后**追加上课条目（格式 `- YYYY-MM-DD · HH:MM <课程名> 上课`，时刻写在 `·` 之后）；
2. 用 `templates/session.md` 建骨架 `data/sessions/YYYY-MM-DD-<course-id>.md`，frontmatter 只填事实（id/date/course，技能可预判才填），正文顶部加 `> 状态：课前预览 · 待上课后补全`，其下补 `> 上课时刻：HH:MM（用户提供）`；
3. 预习**主写入** `data/courses/<id>.md` 的 `## 预习记录`（`### YYYY-MM-DD` 小节：脉络图 + 速览表），session 的 `## 预习` 只留精简版——只写**有来源的**推测（大纲、上次疑问、课前作业、技能级别、相关笔记），每条标来源，推测标"（推测）"；笔记是否补充要**必问**用户；
4. `npm run validate` → 汇报 3 条预习要点 + 课前要交的作业。

## 阶段 B · 课后更新（详细内容）

按 [post-class-checklist.md](./references/post-class-checklist.md) 执行。要点：

1. 找到课前骨架**原地升级**（不存在才走完整录入流程；日期对不上先问用户再重命名，`id` 必须跟随文件名）；
2. 补全 `## 课堂内容` / `## 疑问` / `## 收获` 与 frontmatter（`instructor`、`duration_min`、`homework`、`homework_due`、校正 `skills`）；
3. `## 预习` 末尾追加 `### 对照`：预告命中 / 没讲到 / 超预期；
4. 作业带 DDL → 建 `data/assignments/as-NNN-<slug>.md` 并与 session **双向回链**；固定后续课 → calendar 追加；
5. 状态标记改为 `> 状态：已完成` → `npm run validate` → 汇报 DDL 倒计时与 `npm run next` 队列位置。

## 铁律

- **不编造**：课堂内容只来自用户口述或课件；预习只能是有来源的推测，写不清来源就问用户。
- `id` = 文件名去 `.md`；日期一律 ISO `YYYY-MM-DD`；技能只写 skill-tree 表里的 id。
- 每次写入后必跑 `npm run validate`：error 必须修复，warning 必须向用户明说。
- 不删除、不覆盖已有上课记录；改期、归档前先征求确认。
