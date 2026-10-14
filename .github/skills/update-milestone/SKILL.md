---
name: update-milestone
description: '扫描已明确完成的课程学习记录，核对对应课程的既有里程碑并输出带证据的更新建议。Use when 用户明确说“更新 milestone”“更新里程碑”等，或 orchestrator 在当前工作流边界检测到新的 status: done。'
argument-hint: '[课程 id、记录路径或完成事件，可省]'
---

# 更新里程碑

本 skill 负责里程碑对账的唯一规则来源。数据字段、状态枚举、目录归属和 checklist 约束仍以 `painter-context/conventions.md` 为准。

## 触发条件

- 用户明确提出“更新 milestone”“更新里程碑”等意图时触发。
- `painter-orchestrator` 在当前工作流边界检测到 `painter-context/1-courses/`、`2-plans/`、`3-sessions/`、`4-assignments/` 或 `5-practice/` 中的新完成记录时触发。
- 完成事件由 orchestrator 在工作流边界传入；本 skill 不声明或执行后台监听。

## 对账步骤

1. 扫描上述 5 个集合，只纳入 frontmatter 中明确写有 `status: done` 的记录；`new`、`ing`、`closed` 和缺省状态不纳入本次完成对账。
2. 读取每条记录的 `course`，按主课程分组，并核对文件所在目录与 `course` 是否一致。课程归属缺失、跨课程或目录归属冲突时，列为待确认问题，不静默归类。
3. 对每条明确的 `status: done`，将该完成记录所代表的里程碑视为已达成；这项判断不因技能提升证据不足而撤回。读取对应主课程的 `painter-context/6-milestones/<course-id>/`，优先匹配已有 milestone 及其 checklist，避免重复提出；没有合适的已有 milestone 时，提出新增记录建议。不得据此自动勾选 checklist。
4. 结合该主课程的阶段与相关 `done` 记录，逐项对照 `painter-context/skill-tree.md` 的技能 id、能力描述和 L0–L5 判据，拟定具体的技能提升记录。说明提升体现在哪项能力以及记录中的证据；不能只复述课程主题或完成记录。技能映射或级别判定证据不足时，保留里程碑已达成的结论，只将具体技能提升标为“待确认”或“证据不足”，并说明缺少什么证据；不得补写事实。
5. 按记录证据判断是否足以支持技能树级别建议。分别写清技能提升内容和级别判断；不得把里程碑达成直接等同于技能级别提升，也不得在证据不足时推定升级。
6. 只提出里程碑与技能提升建议，不执行写入。即使已有 `status: done` 记录，也必须先取得用户明确确认，才可勾选 checklist、创建 milestone、写入 milestone 的 `status: done` 或调整技能树级别。

## 输出要求

使用中文，按主课程分组输出：

- **扫描结果**：扫描范围、发现的明确 `done` 记录、跳过或冲突项。
- **已达成里程碑**：列出每条 `done` 记录所代表的已达成里程碑，并注明匹配的已有 milestone；若没有匹配项，说明建议新增 milestone 记录，不得先行创建。
- **技能提升建议**：列出技能 id 与名称、具体能力提升、技能树级别判断（如有）及对应记录证据。无法判断具体提升时，明确标注“待确认”或“证据不足”，并说明缺失证据；不得影响已达成里程碑的判断。
- **待确认写入项**：列出用户确认后才可执行的具体文件、字段、checklist、milestone 或技能树级别变化；没有建议写入时说明无需修改。

输出后交回调用方展示给用户。未取得用户明确确认前，不得勾选 checklist、创建 milestone、写入 `status: done` 或执行其他写入。