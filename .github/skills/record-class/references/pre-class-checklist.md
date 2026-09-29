# 阶段 A · 课前预览 checklist

目标：上课前用最短时间粗略浏览本次课相关内容，并落下一个合法的 session 骨架文件。

## 1. 采集

- 上课日期（ISO，缺省今天）、所属课程 id（`data/courses/` 必须已有；新课程先按 conventions 建课程文件）。
- **必问项：本次上课时刻（HH:MM）**——缺省不许，逐条问用户拿到确切时刻后再继续。
- 信息不足就逐条**问用户**，不要编造。

## 2. 日历（去重）

- 读 `data/calendar.md` 的 `## 事项`，检查同日期 + 同课程是否已有条目。
- 无则追加一行：`- YYYY-MM-DD · HH:MM <课程名> 上课`（时刻必须写在 `·` 之后，`harness/` 按此格式解析；有固定后续课时间的可一并列上）。
- 已有条目则跳过，不重复写。

## 3. 建 session 骨架

- 路径：`data/sessions/<课程 track>/YYYY-MM-DD-<ascii-topic-slug>.md`（主题 slug 使用小写 ASCII 字母、数字和连字符；已存在则进入阶段 B，不要重建）。`track` 取自关联课程，不使用 `type` 或 `provider` 分类。
- 用 `templates/session.md` 结构：
  - frontmatter 只填**事实**：`id`（= 文件名去 `.md`）、`date`、`course` 必填；`skills` 能从大纲预判就填，否则 `[]`；`instructor`/`homework` 等未知留空。
  - 正文顶部加状态标记行：`> 状态：课前预览 · 待上课后补全`，其下补一行 `> 上课时刻：HH:MM（用户提供）`。
  - `## 课堂内容` `## 疑问` `## 收获` 留空——等课后填。

## 4. 写预习（单写 session）

**主写入点：本次 session 的 `## 预习`**——写入本次的脉络图 + 速览表。课程文件只保存课程级资料；课前和课后记录都留在同一 session，课后 `### 对照` 也写在 session。

先按顺序收集素材，能查到什么写什么，查不到就跳过或问用户：

1. **本次讲什么（推测）**：`data/courses/<id>.md` 的课程大纲 + 最近一次该课程 session 的主题 → 推测本次课的位置，标"（推测）"。
2. **带着问题去**：读最近 1–3 次该课程 session 的 `## 疑问`、`## 收获`，把未解答/想巩固的列出来。
3. **课前要交的作业**：`npm run next` 里该课程的 assignment，注明 DDL 与倒计时。
4. **涉及技能现状**：对照 `painter-context/skill-tree.md`，写涉及技能 id 及当前级别。预习发现技能树缺口时，课后按 post-checklist 的技能询问步骤处理。
5. **相关笔记（必问）**：先列出 `notes/` 里已有的相关页面链接，然后**停下来问用户**："课前是否要补充/新建笔记？"——用户说要，就按 `templates/note.md` 写入（或追加到已有笔记）后再继续。

素材收齐后，组织成固定两块，写入 session 的 `## 预习`：

**块 1 · 脉络图**（mermaid `mindmap` 或 `flowchart LR`）：本课在课程大纲中的位置 → 本次主题 → 关联技能（标级别）→ 上次遗留疑问：

```mermaid
flowchart LR
  A["大纲位置：阶段 X 第 N 课"] --> B["本次主题：…（推测）"]
  B --> C["关联技能：foundation/line（L2）"]
  C --> D["上次遗留疑问：…"]
```

**块 2 · 预习速览表**：

| 维度 | 内容 | 来源 |
| --- | --- | --- |
| 本次讲什么（推测） | …（推测） | 课程大纲 / 最近 session 主题 |
| 带着问题去 | … | 上次 session 的疑问 / 收获 |
| 课前作业与 DDL | …（倒计时 X 天） | `npm run next` |
| 涉及技能现状 | `foundation/line` L2 | skill-tree |
| 相关笔记 | [[note-slug]] | `notes/` |

铁律不变：每条**注明来源**，推测标"（推测）"；写不出来源就问用户，不要编造。

## 5. 校验

- `npm run validate`：骨架 frontmatter 合法应**无 error**；有 error 修复后再汇报。
- warning（如文件名建议）按 copilot-instructions 规则向用户明说。
- 本轮确有 `data/`、`notes/`、`painter-context/` 下的 md 写入 → 追加跑 `npm run build` 生成最新 `dist/index.html`（build 失败必须报告用户，`dist` 会过期）。

## 6. 汇报

- 日历条目、骨架文件路径；
- 3 条最重要的预习要点；
- 课前要交的作业及 DDL 倒计时。
