# 阶段 A · 课前预览 checklist

目标：上课前用最短时间粗略浏览本次课相关内容，并落下一个合法的 session 骨架文件。

## 1. 采集

- 上课日期（ISO，缺省今天）、所属课程 id（`painter-context/1-courses/` 必须已有；新课程先按 conventions 建课程文件）。
- **必问项：本次上课时刻（HH:MM）**——缺省不许，逐条问用户拿到确切时刻后再继续。
- 信息不足就逐条**问用户**，不要编造。

## 2. 建 session 骨架

- 路径：`painter-context/3-sessions/<course-id>/YYYY-MM-DD-<ascii-topic-slug>.md`，目录名使用关联课程的 `id`；根据用户提供或有来源的本次具体主题提炼简短、小写 ASCII slug（仅用小写字母、数字和连字符），中文主题写入标题/正文。文件名日期前缀与课程日期及 `date` 字段一致，标题写成“上课 + 日期 + 课程名 + 本次具体主题”。主题信息不足时先询问，不以宽泛课程名或猜测内容代替；`id` 必须与文件名 stem 一致。已存在则进入阶段 B，不要重建。课程 `track`、`type` 和 `provider` 不用于目录分类。
- 用 `painter-context/templates/session.md` 结构：
  - frontmatter 只填**事实**：`id`（= 文件名去 `.md`）、`date`、`course` 必填；`skills` 能从大纲预判就填，否则 `[]`；`instructor`/`homework` 等未知留空。
  - 正文顶部加状态标记行：`> 状态：课前预览 · 待上课后补全`，其下补一行 `> 上课时刻：HH:MM（用户提供）`。
  - `## 课堂内容` `## 疑问` `## 收获` 留空——等课后填。

## 3. 写预习（单写 session）

**主写入点：本次 session 的 `## 预习`**——写入本次的脉络图 + 速览表。课程文件只保存课程级资料；课前和课后记录都留在同一 session，课后 `### 对照` 也写在 session。

先按顺序收集素材，能查到什么写什么，查不到就跳过或问用户：

1. **本次讲什么（推测）**：`painter-context/1-courses/<id>.md` 的课程大纲 + 最近一次该课程 session 的主题 → 推测本次课的位置，标"（推测）"。
2. **带着问题去**：读最近 1–3 次该课程 session 的 `## 疑问`、`## 收获`，把未解答/想巩固的列出来。
3. **课前要交的作业**：`npm run next` 里该课程的 assignment，注明 DDL 与倒计时。
4. **涉及技能现状**：对照 `painter-context/skill-tree.md`，写涉及技能 id 及当前级别。预习发现技能树缺口时，课后按 post-checklist 的技能询问步骤处理。
5. **相关笔记（必问）**：先列出 `painter-context/notes/<course-id>/` 里已有的相关页面链接，然后**停下来问用户**："课前是否要补充/新建笔记？"——用户说要，就按 `painter-context/templates/note.md` 写入（或追加到已有笔记，frontmatter 的 `course` 与目录一致）后再继续。

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
| 相关笔记 | [note-slug](../../../../painter-context/notes/<course-id>/note-slug.md) | `painter-context/notes/<course-id>/` |

铁律不变：每条**注明来源**，推测标"（推测）"；写不出来源就问用户，不要编造。

## 4. 校验

- `npm run validate`：骨架 frontmatter 合法应**无 error**；有 error 修复后再汇报。
- warning（如文件名建议）按 copilot-instructions 规则向用户明说。
- 本轮确有 `painter-context/` 下的 md 写入 → 追加跑 `npm run build` 生成最新 `dist/index.html`（build 失败必须报告用户，`dist` 会过期）。

## 5. 汇报

- 骨架文件路径；
- 3 条最重要的预习要点；
- 课前要交的作业及 DDL 倒计时。
