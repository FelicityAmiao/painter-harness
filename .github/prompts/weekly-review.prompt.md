---
description: 周复盘——更新进度、技能树候选、汇总笔记
---

# 周复盘

1. **跑数据**：`npm run rollup` 打开 `painter-context/reports/dashboard.md`，同时看本周 practice 与 session 记录。
2. **里程碑**：调用 `update-milestone` skill 对账本周新增的明确 `status: done` 记录，并展示其证据、建议和待确认写入项。未获用户明确确认不得勾选 checklist、创建 milestone 或写入 `status: done`；明显滞后的里程碑给出追赶或顺延建议。
3. **技能树**：对 rollup 给出的升级候选，逐个读相关 practice 的反思正文，按 `painter-context/skill-tree.md` 的 L0–L5 评定表判断是否升降级；只改 `级别` 列，每处升降附一句依据。不达标的不升。
4. **笔记汇总**：调用 `write-notes` skill 处理本周用户主动输入的可复用知识点，按其原文保真流程创建或追加对应课程的 `painter-context/notes/<course-id>/` 笔记。用户原文必须完整保留在 `## 用户原文`，提炼、链接和扩写只写入 `## AI 整理与补充`；已有笔记只增量追加，不覆盖旧原文。session/practice 仅可作为 AI 整理区的来源，不得伪装成用户原文。涉及多门课程、归属不明确或敏感信息时先确认，不静默选定一门课程或落盘。笔记写入仍须经过 planner、用户确认、implementer、reviewer，且不绕过现有 milestone 或 skill-tree 确认逻辑。
5. **周报**：保留本周练了什么（时长/目的达成率）、完成的作业、技能树变化、下周 3 件最重要的事（按 DDL 排）等事实输入，由 `npm run rollup` 生成 `painter-context/reports/` 下的报告，不手改 `reports/`。
6. **校验**：`npm run validate` 无 error；如需对外发布，提醒用户 `npm run build` 生成 `dist/index.html`。
7. **汇报**：向用户口头总结本周进度条、技能变化、下周优先级前 3 名。
