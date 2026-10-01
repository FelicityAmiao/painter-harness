---
title: Session 文件名体现本次上课内容
status: backlog
---

# Session 文件名体现本次上课内容

## 发现来源

用户维护 Procreate session 时指出，模板没有说明 session 文件名如何精准体现此次上课内容。Researcher 核对了 `painter-context/conventions.md` 与 `templates/session.md`。

## 当前行为

`painter-context/conventions.md` 已规定 session 路径格式为 `data/sessions/<track>/YYYY-MM-DD-<ascii-topic-slug>.md`，slug 使用小写 ASCII，且 `id` 与文件名 stem 相同。`templates/session.md` 只有 `id` 占位符和中文标题占位符，没有指导 slug 应按本次实际上课内容命名；schema 没有 `desc` 字段。

## 期望行为

创建 session 时，模板应明确引导用户依据本次实际上课内容选择准确、具体的 topic slug，同时遵守已有的路径、字符大小写及 `id` 命名规则。不要求新增 schema 字段。

## 建议改动

在 `templates/session.md` 的命名说明或相关占位提示中，补充如何将本次课程内容概括为小写 ASCII slug，并说明 `id` 必须与文件名 stem 一致。可由 planner 决定是否附上简短示例；不改动 schema，也不增加 `desc` 字段。

## 影响范围

- `templates/session.md`：session 模板中的命名指引。
- 使用 session 模板创建记录的流程：文件名与记录内容的一致性。

## 暂缓原因

当前仅记录模板改进方向，具体提示文案及示例仍待 planner 评估；提案记录不代表计划已获批准或已实施。

## 状态说明

- `backlog`：提案仍需澄清、评估或等待时机。
- 本提案尚未进入实施，也不授权修改提案范围之外的文件。