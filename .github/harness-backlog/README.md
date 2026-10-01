# Harness 改进提案

此目录保存暂未纳入实施计划的具体 harness 改进。每条提案单独建一个 Markdown 文件，命名为 `YYYY-MM-DD-<小写 ASCII slug>.md`，并按 [TEMPLATE.md](TEMPLATE.md) 填写。

## 命名与标题

- 文件名 slug 必须匹配 `YYYY-MM-DD-<小写 ASCII slug>.md`，slug 为小写 ASCII。
- 提案的 frontmatter `title`、正文 H1 标题与文件名 slug 三者都必须具体描述待修复的内容与范围。
- 禁止使用 `fix-agent`、`session-topic-slug` 这类无法看出问题的泛指词。

## 状态

- `backlog`：提案已记录，仍需澄清、评估或等待时机。
- `ready-for-planning`：信息足以交给 planner 制定计划；它仅表示可进入规划，不代表计划已获用户批准，更不授权实施。

## 生命周期

- 提案没有“已完成”状态，也不根据 `backlog` 或 `ready-for-planning` 状态判断是否可删除。与提案对应的改动实施或审查未通过时，保留提案。
- 对应改动通过 reviewer `PASSED` 后，由 `project-orchestrator` 向 `harness-backlog-maintainer` 发出明确指定完整路径的定向清理任务；maintainer 只删除该条提案，删除完成后才结束流程。
- 删除范围仅限该条明确关联的提案，不得波及其他提案或用户数据。`harness-backlog-maintainer` 负责创建、更新提案及按授权定向删除。

## 边界

- 记录提案不改变当前任务范围，也不改变任何 orchestrator 的确认、实施或审查状态机。
- 实际 harness 修改必须进入 `project-orchestrator` 的计划展示、用户确认、实施与审查流程。
- 提案记录不得修改或替代 `painter-context/` 中的学习事实，不得改动 `painter-context/conventions.md`。
- `harness-backlog-maintainer` 仅可新增或更新本目录根目录下符合日期主题命名的提案记录；删除必须通过 guard 的精确命令并有 reviewer `PASSED` 后的明确清理指令。单条记录授权不等于 harness 修改授权。