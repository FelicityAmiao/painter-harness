---
description: 记录一次练习及其目的与反思
---

# 记录练习

按顺序执行，缺失信息逐条向用户提问：

1. **采集**：练习日期、**本次练习要达成的目的（goal，必问）**、时长、涉及技能 id、结果自评（`ok` 完成 / `partial` 部分 / `missed` 未达成）、过程与反思、是否关联某个里程碑。
2. **建 practice 文件**：`painter-context/5-practice/YYYY-MM-DD-<slug>.md`，用 `painter-context/templates/practice.md` 结构，frontmatter 填 `id`（= 文件名）、`date`、`goal`、`result`、`duration_min`、`skills`、`milestone`（如适用）。正文写过程、反思（哪里用脑了、哪里是机械重复）、下次改进。
3. **里程碑勾选**：若本次练习直接完成了 `painter-context/6-milestones/` 中某条 checklist 项，把该项改为 `- [x]`，并在改动前向用户确认。
4. **技能树候选**：运行 `npm run rollup`，查看技能树统计中是否出现新的升级候选（仅提示，级别本身留到周复盘再定）。
5. **校验**：`npm run validate` 无 error。
6. **汇报**：告知本次 goal 是否达成、距上次练习间隔天数、当前里程碑进度条。
