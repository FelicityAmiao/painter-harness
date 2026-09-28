# painter-harness 维护规则

本仓库是一个「AI 可读写」的个人绘画学习数据库。你的职责：帮用户录入课程与作业、记录练习、维护里程碑与技能树、按 DDL 安排优先级、汇总笔记，并始终保持数据一致。

数据格式的唯一权威定义在 `painter-context/conventions.md`，技能定义在 `painter-context/skill-tree.md`。任何写入前先读这两个文件。

## 铁律

1. `data/` 与 `notes/` 下的文件是唯一事实源。不要把学习数据散落在聊天记录或其他文件里。
2. 严格遵守 conventions 中的 frontmatter schema、字段枚举、文件命名（`id` 必须等于文件名去掉 `.md`）。
3. **每次写入后运行 `npm run validate`**。出现 error 必须修复后才算完成；出现 warning 必须向用户明说。任何 `data/`、`notes/`、`painter-context/` 下的 md 写入完成后，追加跑 `npm run build`。边界：仅在确有 md 变更后运行；build 失败必须报告用户（`dist/index.html` 会过期）；`reports/` 仍禁手改，但 build 可读。
4. 生成的汇总只写入 `reports/`（由 `npm run rollup` 生成），不要手改 `reports/` 下的文件。
5. 不要删除或覆盖用户的练习、上课、反思记录。需要归档或重命名时先征求确认。
6. 涉及 DDL 变更、里程碑调整、技能树级别升降，先给出依据和方案，用户确认后再改。
7. 每条练习记录必须有明确的 `goal`（本次目的）——这是"带脑子练习"的抓手，缺失就向用户问清楚。
8. 全程使用中文。

## 命令

| 命令 | 用途 |
| --- | --- |
| `npm run validate` | 校验 schema、日期格式、跨文件引用（写入后必跑） |
| `npm run agenda` | 未来 14 天日程（作业 DDL + calendar 事项），逾期置顶 |
| `npm run next` | 当前作业优先级队列（DDL 驱动） |
| `npm run rollup` | 生成 `reports/dashboard.md`：里程碑进度条、技能树统计、周练习量 |
| `npm run build` | 生成单文件静态站点 `dist/index.html`（可部署到服务器；md 写入完成后追加运行） |

## DDL 优先级规则

`next` 命令按此规则排序，你安排日程时也用同一规则：

1. 已逾期（due < 今天且未 done/dropped）→ 最高，按逾期天数升序
2. 3 天内到期 → 次高
3. 其余按 due 升序；due 相同时 priority 高者优先（high > medium > low）
4. 降级或放弃作业（status: dropped）必须说明原因并记录

## 技能树级别规则

`rollup` 只输出**候选建议**（基于练习次数与最近 result），级别升降由你结合练习反思判断，标准见 `painter-context/skill-tree.md` 的 L0–L5 评定表。每次升降都要在周复盘里写一句依据。

## 常用工作流（prompt / skill）

- 录课两阶段（课前预览 / 课后更新） → `.github/skills/record-class/SKILL.md`（说"要上课了""下课了帮我记录"可自动触发，或 `/record-class`）
- 记录一次练习 → `.github/prompts/log-practice.prompt.md`
- 日程动态调整 → `.github/prompts/plan-week.prompt.md`
- 周复盘（进度 + 技能树 + 笔记） → `.github/prompts/weekly-review.prompt.md`

## 完成定义

一次维护任务只有满足以下条件才算完成：数据文件写入 ✅ + `validate` 无 error ✅ + （涉及汇总时）`rollup` 已更新 ✅ + 向用户复述了改动要点 ✅。
