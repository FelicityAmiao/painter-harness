# 数据规范 conventions

所有学习数据 = **Markdown 文件 + YAML frontmatter**。AI 录入、TypeScript 脚本校验/汇总都以此文件为准。修改本文件即修改契约，改动后必须同步更新 `harness/` 中的校验逻辑并跑 `npm run validate`。

## 目录职责

唯一内容根为 `painter-context/`，下列路径都相对仓库根。

| 目录 | 内容 | 命名 |
| --- | --- | --- |
| `painter-context/1-courses/` | 课程定义（长期存在） | `<course-id>.md` |
| `painter-context/2-plans/` | 逐课程目标/阶段的学习计划（软窗口） | `YYYY-MM-DD-<course-id>-<topic-slug>.md`（日期取 `window_start`） |
| `painter-context/3-sessions/<track>/` | 每次上课记录，按课程学习方向分类 | `YYYY-MM-DD-<ascii-topic-slug>.md` |
| `painter-context/4-assignments/` | 作业/待交付（DDL 驱动） | `as-NNN-<slug>.md` |
| `painter-context/5-practice/` | 每次练习记录 | `YYYY-MM-DD-<slug>.md` |
| `painter-context/6-milestones/` | 里程碑（checklist + 进度条） | `ms-<slug>.md` |
| `painter-context/notes/` | 沉淀的知识点笔记（AI 汇总，内容根内子目录） | `<slug>.md` |
| `painter-context/templates/` | 录入模板（内容根内子目录） | — |
| `painter-context/reports/` | 脚本生成的汇总，禁止手改（内容根内子目录） | — |

## 通用规则

- `id`：全局唯一、kebab-case、**必须等于文件名去掉 `.md`**（validate 强制）。
- 日期字段一律 ISO `YYYY-MM-DD`（validate 强制格式；`date`/`due` 不允许为空）。
- 未完成/未开始用字段缺省或约定默认值表示，不写中文状态。
- 技能引用一律写 skill-tree 表格里的 `id`（如 `foundation/line`），validate 会查表拦截。

## 各集合 schema

### course（`painter-context/1-courses/`）

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id`, `title` | ✅ | |
| `provider` | | 老师/平台名 |
| `type` | | `1v1` \| `online` |
| `track` | ✅ | `foundation` \| `illustration` \| `game-art`；决定 session 分类目录，不使用 `type` 或 `provider` 分类 |
| `start_date`, `end_date` | | ISO，未知留空 |
| `status` | | `planned` \| `active` \| `paused` \| `completed`（默认 active） |

课程文件只保存课程级资料；每次课的预习与课后记录统一写在对应 session，不在课程文件中建立单次课预习记录。

### session（`painter-context/3-sessions/`）

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id`, `date`, `course` | ✅ | `course` 必须是已有课程 id |
| `instructor`, `duration_min` | | |
| `homework`, `homework_due` | | 作业描述与 DDL（ISO） |
| `assignment` | | 对应 assignment 的 id（有 DDL 的作业应建 assignment 并回链） |
| `skills` | | 技能 id 数组，如 `[foundation/line]` |

路径：`painter-context/3-sessions/<关联课程 track>/YYYY-MM-DD-<ascii-topic-slug>.md`。主题 slug 使用小写 ASCII 字母、数字和连字符；中文主题保留在正文。目录必须与关联课程的 `track` 一致，文件名日期必须与 `date` 一致，`id` 必须等于文件名（不含 `.md`）。`track` 必填且仅允许 `foundation`、`illustration`、`game-art`；`type` 和 `provider` 不参与分类。

正文小节：`## 预习`（课前可选，见下） `## 课堂内容` `## 疑问` `## 收获`。

- **两阶段录课**：课前可先建骨架文件（frontmatter 只填事实），正文顶部加状态标记行 `> 状态：课前预览 · 待上课后补全`，`## 预习` 写有来源的粗略浏览；课前与课后内容都写入同一 session。课后原地升级，状态标记改为 `> 状态：已完成`，并在 `## 预习` 末尾追加 `### 对照`（命中 / 没讲到 / 超预期）。单次课内容不回填 course。状态标记与 `## 预习` 都只在正文，validate 只校验 frontmatter。

### assignment（`painter-context/4-assignments/`）

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id`, `title`, `due` | ✅ | `due` 为 ISO |
| `status` | ✅ | `todo` \| `doing` \| `done` \| `dropped` |
| `priority` | | `high` \| `medium`（默认）\| `low` |
| `course`, `session` | | 关联 id |
| `skills`, `estimate_hours` | | |

DDL 变更时在正文追加变更记录行：`- YYYY-MM-DD 调整为 X，原因：…`。

### plan（`painter-context/2-plans/`）

每项课程目标或阶段单独建文件，可分次录入；计划窗口是软安排，不是硬截止。真实作业 DDL 只读取关联 assignment 的 `due`，不得复制到计划中。

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id`, `title`, `course` | ✅ | `id` = 文件名（不含 `.md`）；`course` 必须是已有课程 id |
| `assignment` | | 已有关联作业的 id；允许为空，非空时必须引用已有 assignment |
| `window_start`, `window_end` | ✅ | 软安排窗口，均为合法 ISO 日期；开始日期不得晚于结束日期 |
| `status` | ✅ | `planned` \| `active` \| `paused` \| `completed` |

文件名使用 `YYYY-MM-DD-<course-id>-<topic-slug>.md`，日期取 `window_start`，主题 slug 稳定且使用小写 ASCII 字母、数字和连字符。正文记录计划依据、学习窗口安排、缓冲与调整及完成回顾。仪表盘依据关联 assignment 的真实 `due` 升序排列并计算剩余天数；没有关联 assignment 的计划排在有 DDL 项之后，标记为无硬截止，并按课程标题、窗口起始日、文件路径稳定排序，不推导或伪造 DDL。

### practice（`painter-context/5-practice/`）

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id`, `date`, `goal`, `result` | ✅ | `goal` = 本次练习目的；`result`: `ok` \| `partial` \| `missed` |
| `duration_min` | | 数字 |
| `skills`, `milestone`, `session` | | 关联 id |

正文小节：`## 过程` `## 反思` `## 下次改进`。反思必须写"脑子怎么用的"，不能只记流水账。

### milestone（`painter-context/6-milestones/`）

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id`, `title` | ✅ | |
| `target_date` | | ISO |
| `status` | | `draft` \| `active` \| `done` \| `paused`（默认 active） |
| `related_sessions` | | session id 数组；辅助达成该里程碑的课次，可跨 track，缺省视为 `[]` |
| `related_courses` | | course id 数组；相关课程，缺省视为 `[]` |

进度 = 正文 checklist 中 `- [x]` 占比（rollup 统计，不用手填百分比）。`related_sessions` 与 `related_courses` 是 milestone 指向 session / course 的反向关联，validate 会逐项校验 id 是否存在；缺省即空数组，不报错。

## 文件流转

```text
上课 ──▶ 3-sessions/<track>/ ──(有 DDL)──▶ 4-assignments/ ──done──▶ notes/ 沉淀
课程 ──▶ 2-plans/（软窗口）──(可选关联)──▶ 4-assignments/（唯一硬 DDL）
练习 ──▶ 5-practice/ ──▶ 关联 6-milestones/（勾 checklist）
                       └──▶ 累积技能次数 ──▶ skill-tree 级别（周复盘定）
session ──(辅助达成)──▶ milestone（反向关联写在 milestone 的 related_sessions / related_courses）
npm run validate ──▶ 一致性
npm run rollup   ──▶ painter-context/reports/dashboard.md
npm run build    ──▶ dist/index.html（部署用单文件站点）
```
