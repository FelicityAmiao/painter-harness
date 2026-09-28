---
description: 周复盘——更新进度、技能树候选、汇总笔记
---

# 周复盘

1. **跑数据**：`npm run rollup` 打开 `reports/dashboard.md`，同时看本周 practice 与 session 记录。
2. **里程碑**：对照 checklist 与本周实际进展，该勾的勾（勾选前确认）；明显滞后的里程碑给出追赶或顺延建议。
3. **技能树**：对 rollup 给出的升级候选，逐个读相关 practice 的反思正文，按 `painter-context/skill-tree.md` 的 L0–L5 评定表判断是否升降级；只改 `级别` 列，每处升降附一句依据。不达标的不升。
4. **笔记汇总**：把本周 session/practice 中可复用的知识点提炼进 `notes/`（一个主题一页，用 `templates/note.md`，加 wikilink 关联课程与技能 id），已有笔记则增量更新。
5. **周报**：在 `reports/` 追加 `YYYY-Www.md`：本周练了什么（时长/目的达成率）、完成的作业、技能树变化、下周 3 件最重要的事（按 DDL 排）。
6. **校验**：`npm run validate` 无 error；如需对外发布，提醒用户 `npm run build` 生成 `dist/index.html`。
7. **汇报**：向用户口头总结本周进度条、技能变化、下周优先级前 3 名。
