# 数据规范 conventions

所有学习数据 = **Markdown 文件 + YAML frontmatter**。AI 录入、TypeScript 脚本校验/汇总都以此文件为准。修改本文件即修改契约，改动后必须同步更新 `harness/` 中的校验逻辑并跑 `npm run validate`。

## 目录职责

| 目录 | 内容 | 命名 |
| --- | --- | --- |
| `data/courses/` | 课程定义（长期存在） | `<course-id>.md` |
| `data/sessions/` | 每次上课记录 | `YYYY-MM-DD-<course-id>.md` |
| `data/assignments/` | 作业/待交付（DDL 驱动） | `as-NNN-<slug>.md` |
| `data/practice/` | 每次练习记录 | `YYYY-MM-DD-<slug>.md` |
| `data/milestones/` | 里程碑（checklist + 进度条） | `ms-<slug>.md` |
| `data/calendar.md` | 非作业类日期事项（上课、考试、平台截止） | 固定文件 |
| `notes/` | 沉淀的知识点笔记（AI 汇总） | `<slug>.md` |
| `templates/` | 录入模板 | — |
| `reports/` | 脚本生成的汇总，禁止手改 | — |

## 通用规则

- `id`：全局唯一、kebab-case、**必须等于文件名去掉 `.md`**（validate 强制）。
- 日期字段一律 ISO `YYYY-MM-DD`（validate 强制格式；`date`/`due` 不允许为空）。
- 未完成/未开始用字段缺省或约定默认值表示，不写中文状态。
- 技能引用一律写 skill-tree 表格里的 `id`（如 `foundation/line`），validate 会查表拦截。

## 各集合 schema

### course（`data/courses/`）

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id`, `title` | ✅ | |
| `provider` | | 老师/平台名 |
| `type` | | `1v1` \| `online` |
| `track` | | `foundation` \| `illustration` \| `game-art` |
| `start_date`, `end_date` | | ISO，未知留空 |
| `status` | | `planned` \| `active` \| `paused` \| `completed`（默认 active） |

### session（`data/sessions/`）

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id`, `date`, `course` | ✅ | `course` 必须是已有课程 id |
| `instructor`, `duration_min` | | |
| `homework`, `homework_due` | | 作业描述与 DDL（ISO） |
| `assignment` | | 对应 assignment 的 id（有 DDL 的作业应建 assignment 并回链） |
| `skills` | | 技能 id 数组，如 `[foundation/line]` |

正文小节：`## 预习`（课前可选，见下） `## 课堂内容` `## 疑问` `## 收获`。

- **两阶段录课**：课前可先建骨架文件（frontmatter 只填事实），正文顶部加状态标记行 `> 状态：课前预览 · 待上课后补全`，`## 预习` 写有来源的粗略浏览；课后原地升级，状态标记改为 `> 状态：已完成`，并在 `## 预习` 末尾追加 `### 对照`（命中 / 没讲到 / 超预期）。状态标记与 `## 预习` 都只在正文，validate 只校验 frontmatter。

### assignment（`data/assignments/`）

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id`, `title`, `due` | ✅ | `due` 为 ISO |
| `status` | ✅ | `todo` \| `doing` \| `done` \| `dropped` |
| `priority` | | `high` \| `medium`（默认）\| `low` |
| `course`, `session` | | 关联 id |
| `skills`, `estimate_hours` | | |

DDL 变更时在正文追加变更记录行：`- YYYY-MM-DD 调整为 X，原因：…`。

### practice（`data/practice/`）

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id`, `date`, `goal`, `result` | ✅ | `goal` = 本次练习目的；`result`: `ok` \| `partial` \| `missed` |
| `duration_min` | | 数字 |
| `skills`, `milestone`, `session` | | 关联 id |

正文小节：`## 过程` `## 反思` `## 下次改进`。反思必须写"脑子怎么用的"，不能只记流水账。

### milestone（`data/milestones/`）

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id`, `title` | ✅ | |
| `target_date` | | ISO |
| `status` | | `draft` \| `active` \| `done` \| `paused`（默认 active） |

进度 = 正文 checklist 中 `- [x]` 占比（rollup 统计，不用手填百分比）。

### calendar（`data/calendar.md`）

只记**非作业类**事项，每行一条，必须以 ISO 日期开头：

```markdown
- 2026-10-05 · Procreate 第 3 课
- 2026-10-12 · [平台] 轻微课阶段作业提交截止
```

作业 DDL 不写这里（在 assignment 的 `due`），agenda 会自动合并两边。

## 文件流转

```text
上课 ──▶ session ──(有DDL)──▶ assignment ──done──▶ notes/ 沉淀
练习 ──▶ practice ──▶ 关联 milestone（勾 checklist）
                       └──▶ 累积技能次数 ──▶ skill-tree 级别（周复盘定）
npm run validate ──▶ 一致性
npm run rollup   ──▶ reports/dashboard.md
npm run build    ──▶ dist/index.html（部署用单文件站点）
```
