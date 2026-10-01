---
title: Project reviewer 失败后提供 3 次额外返工机会
status: backlog
---

# Project reviewer 失败后提供 3 次额外返工机会

## 发现来源

用户明确要求：project reviewer 审查失败后，implementer 应有 3 次 retry 返工机会；连续 3 次 retry 后仍无效，再交回用户处理。

## 当前行为

[project-orchestrator](../agents/project-orchestrator.agent.md) 当前将 reviewer 每次返回 FAILED 计为 1 次 retry，并将上限设为 3 次。该轮次定义可能被理解为总审查失败次数上限，未明确表达首轮实施失败后另有 3 次额外返工机会。

## 期望行为

明确“3 次 retry”是首轮实施失败后的额外返工次数，即最多 3 次返工轮；连续 3 次 retry 后审查仍未通过时，停止自动推进并将问题交回用户处理。具体状态机与计数定义待正式规划阶段确认，避免将额外返工次数与当前 project-orchestrator 的轮次定义混为一谈。

## 建议改动

在正式规划阶段审视 orchestrator 的重试状态机及计数定义，明确首轮实施审查失败与后续返工轮的关系、返工机会的消耗条件，以及耗尽后交回用户的条件。此提案只记录预期，不授权修改规则。

## 影响范围

- `.github/agents/project-orchestrator.agent.md` 的审查失败、返工调度与轮次计数规则。
- implementer 收到 reviewer 问题并执行返工的调度说明；是否需要调整待规划确认。

## 暂缓原因

需要 planner 对照当前 orchestrator 状态机，进一步确认“首轮实施失败”与“3 次额外返工轮”的准确计数边界后，再提出正式方案。

## 状态说明

- `backlog`：计数边界与状态机方案仍待正式规划确认；该状态不代表计划已获用户批准，也不授权实施。