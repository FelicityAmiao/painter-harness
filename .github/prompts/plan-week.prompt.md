---
description: 按 DDL 动态调整本周优先级
---

# 周计划动态调整

1. **采集现状**：运行 `npm run next`。
2. **诊断**，并向用户逐条呈现：
   - 逾期作业（几天了）
   - 3 天内到期但 `status: new` 且未开始的
   - 练习断档（距上次 practice 超过 4 天）
3. **给方案**：按 DDL 优先级规则（见 copilot-instructions）排出"本周每天做什么"的建议表，冲突时给出取舍理由（如：轻微课作业 DDL 硬性 > 一对一课后作业 > 自主练习）。
4. **确认后执行**：修改对应课程目录 `painter-context/4-assignments/<course-id>/` 中 assignment 的 `due` / `priority` / `status`；状态只可为 `new` / `ing` / `done` / `closed`。DDL 延期必须让用户明确说出新日期，并在该 assignment 正文追加一行变更记录（日期 + 原因）。assignment 明确 `done` 时先由 planner 对账 milestone；任何里程碑写入仍须证据与用户明确确认。
5. **校验并汇报**：`npm run validate` 无 error，输出调整前后的差异摘要。
