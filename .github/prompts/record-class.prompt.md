---
description: 录入一次上课记录，含作业与 DDL
---

# 录入课程记录

按顺序执行，缺失信息逐条向用户提问，不要编造：

1. **采集**：上课日期、所属课程（`data/courses/` 中已有课程，若新课程先建课程文件）、课堂内容要点、留了什么作业、作业 DDL、涉及哪些技能 id（对照 `painter-context/skill-tree.md`）。
2. **建 session 文件**：`data/sessions/YYYY-MM-DD-<course-id>.md`，用 `templates/session.md` 的结构，frontmatter 填 `id`（= 文件名）、`date`、`course`、`skills`，正文写课堂内容、疑问、收获，`homework` 字段写作业描述。
3. **建 assignment 文件**（若作业带 DDL）：`data/assignments/as-NNN-<slug>.md`，编号顺延现有最大号，frontmatter 填 `title`、`due`、`status: todo`、`priority`（问用户或默认 medium）、`course`、`skills`；`session` 字段回链 session 的 id。若作业已写在 session 的 `homework`/`homework_due`，保持两处一致。
4. **日历**：该课有固定后续上课时间的，追加到 `data/calendar.md` 对应条目。
5. **校验**：运行 `npm run validate`，修复所有 error。
6. **汇报**：告诉用户新文件路径、作业 DDL 倒计时天数、进入 `npm run next` 队列的位置。
