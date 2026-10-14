---
description: 周复盘——更新进度、技能树候选、汇总笔记
---

# 周复盘

1. **跑数据**：`npm run rollup` 打开 `painter-context/reports/dashboard.md`，同时看本周 practice 与 session 记录。
2. **里程碑**：对照 checklist 与本周实际进展，只在有充分证据且用户明确确认后勾选已有 checklist；需要新里程碑时先提出建议。缺省 status 表示未完成，只有 checklist 全勾后才可在用户确认下写 `status: done`；单一 `done` 不自动完成里程碑。明显滞后的里程碑给出追赶或顺延建议。
3. **技能树**：对 rollup 给出的升级候选，逐个读相关 practice 的反思正文，按 `painter-context/skill-tree.md` 的 L0–L5 评定表判断是否升降级；只改 `级别` 列，每处升降附一句依据。不达标的不升。
4. **笔记汇总**：把本周 session/practice 中可复用的知识点提炼进对应课程的 `painter-context/notes/<course-id>/`（一个主题一页，用 `painter-context/templates/note.md`，frontmatter 填主课程 `course`，正文用标准相对 Markdown 链接关联课程与 session，并关联技能 ID），已有笔记则增量更新。涉及多门课程或归属不明确时先确认，不静默选定一门课程。
5. **周报**：保留本周练了什么（时长/目的达成率）、完成的作业、技能树变化、下周 3 件最重要的事（按 DDL 排）等事实输入，由 `npm run rollup` 生成 `painter-context/reports/` 下的报告，不手改 `reports/`。
6. **校验**：`npm run validate` 无 error；如需对外发布，提醒用户 `npm run build` 生成 `dist/index.html`。
7. **汇报**：向用户口头总结本周进度条、技能变化、下周优先级前 3 名。
