# 阶段 A · 课前预览 checklist

目标：上课前用最短时间粗略浏览本次课相关内容，并落下一个合法的 session 骨架文件。

## 1. 采集

- 上课日期（ISO，缺省今天）、所属课程 id（`data/courses/` 必须已有；新课程先按 conventions 建课程文件）。
- 信息不足就逐条**问用户**，不要编造。

## 2. 日历（去重）

- 读 `data/calendar.md` 的 `## 事项`，检查同日期 + 同课程是否已有条目。
- 无则追加一行：`- YYYY-MM-DD · <课程名> 上课`（有固定后续课时间的可一并列上）。
- 已有条目则跳过，不重复写。

## 3. 建 session 骨架

- 路径：`data/sessions/YYYY-MM-DD-<course-id>.md`（已存在则进入阶段 B，不要重建）。
- 用 `templates/session.md` 结构：
  - frontmatter 只填**事实**：`id`（= 文件名去 `.md`）、`date`、`course` 必填；`skills` 能从大纲预判就填，否则 `[]`；`instructor`/`homework` 等未知留空。
  - 正文顶部加状态标记行：`> 状态：课前预览 · 待上课后补全`。
  - `## 课堂内容` `## 疑问` `## 收获` 留空——等课后填。

## 4. 写 `## 预习`（粗略浏览，每条注明来源）

按此顺序收集，能查到什么写什么，查不到就跳过或问用户：

1. **本次讲什么（推测）**：`data/courses/<id>.md` 的课程大纲 + 最近一次该课程 session 的主题 → 推测本次课的位置，标"（推测）"。
2. **带着问题去**：读最近 1–3 次该课程 session 的 `## 疑问`、`## 收获`，把未解答/想巩固的列出来。
3. **课前要交的作业**：`npm run next` 里该课程的 assignment，注明 DDL 与倒计时。
4. **涉及技能现状**：对照 `painter-context/skill-tree.md`，写涉及技能 id 及当前级别。
5. **相关笔记**：`notes/` 里已有相关页面用 wikilink 链接，提示课前扫一眼。

来源格式建议：`- <要点>（来源：课程大纲 / 上次收获 / skill-tree）`。

## 5. 校验

- `npm run validate`：骨架 frontmatter 合法应**无 error**；有 error 修复后再汇报。
- warning（如文件名建议）按 copilot-instructions 规则向用户明说。

## 6. 汇报

- 日历条目、骨架文件路径；
- 3 条最重要的预习要点；
- 课前要交的作业及 DDL 倒计时。
