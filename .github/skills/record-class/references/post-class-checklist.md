# 阶段 B · 课后更新 checklist

目标：把课前骨架升级为完整上课记录，或在没有骨架时完成一次完整录入。

## 1. 定位与分流

按用户给的日期（缺省今天）+ 课程 id，在 `painter-context/3-sessions/<course-id>/` 目录中找 session：

| 找到的文件 | 动作 |
| --- | --- |
| 含 `> 状态：课前预览` | 原地升级（继续第 2 步） |
| 不存在 | 走完整录入（第 2–8 步全做，骨架步骤从零建文件） |
| 已是完整记录 | 只做增量修正，禁止重建、禁止覆盖已有内容 |
| 用户说的日期与文件对不上（改期） | **先问用户确认**，再重命名文件并同步 `id` 与所有引用 |

## 2. 补全 frontmatter

- 必填已在骨架中：`id` / `date` / `course`（改期时同步改）。
- 新增/校正：`instructor`、`duration_min`（数字）、`homework`、`homework_due`（ISO）、`skills`（对照 `painter-context/skill-tree.md` 校正预判，只写表内 id）。
- 状态标记行改为 `> 状态：已完成`。

## 3. 技能树更新询问（无变化也要问）

对照 `painter-context/skill-tree.md` 检查本次涉及技能：若**没有任何级别变化、也没有新条目**，必须向用户逐条询问，每条给出：

- 当前技能点（现状级别 / 累计练习次数）；
- 建议归入的现有子技能 id（或"建议新建 `track/skill`"）；
- 依据（课堂表现、练习反思、最近 `result`）。

用户确认后才改技能树（遵守 copilot-instructions 铁律 6），改完跑 `npm run validate`。

## 4. 补全正文

- `## 课堂内容`：来自用户口述或课件，分点写，不编造。
- `## 疑问`：当场没懂的，保留原课前疑问中未解答项。
- `## 收获`：本次最值钱的 2–3 条，能落到技能 id 就落到 skills。
- 课后课堂内容、疑问、收获与 `### 对照` 都补充到本次 session；不把单次课记录回填到 `painter-context/1-courses/<id>.md`。无预习直接上课的，也只在 session 中一次性记录。

## 5. 笔记沉淀询问（必问）

对称于课前的必问：**"本次课是否要沉淀笔记？"**——列出本课程 `painter-context/notes/<course-id>/` 中相关页面链接后停下来问用户；要则按 `painter-context/templates/note.md` 写入（或追加到已有笔记，frontmatter 的 `course` 与目录一致），并在 session 回链，不要跳过直接结课。

## 6. 预习闭环

- 在 `## 预习` 末尾追加小节：

```markdown
### 对照
- 命中：…
- 没讲到：…
- 超预期：…
```

## 7. 计划匹配与原地更新

- 在 `painter-context/2-plans/` 中先按 session 的课程 id 筛选，再对照计划主题、学习内容与本次课次内容；不能只凭课程相同或日期接近判断匹配。
- 只有一个计划与课次内容明确对应时才采用。存在多个候选、没有明确对应项，或无法确认本次课对应计划中的哪个计量单位时，先询问用户，不自动选择或改动计划进度。
- 读取该计划自己的完成定义和计量单位，再核实本次课实际完成的内容。只计入有依据且符合完成定义的单位；笔记或自我练习状态未核实，不得按已完成计数。不得仅凭上完课推定计划单元已完成。
- 在该计划「完成回顾」中找到已有的进度行，并在原位置更新计数及该行已有的进度表达；不得追加新的进度行，也不得改变计划定义的分母、计量单位或完成门槛。
- 若「完成回顾」没有可更新的现有进度行，或证据不足以核实是否达成完成定义，先询问用户，不新建进度行、不猜测进度。

## 8. 作业与里程碑

- 作业带 DDL → 建 `painter-context/4-assignments/<course-id>/as-NNN-<slug>.md`：
  - 编号顺延现有最大号；frontmatter：`title`、`due`（ISO）、`status: todo`、`priority`（问用户，缺省 medium）、`course`、`skills`、`session` 回链本次 session id。
  - session 的 `assignment` 字段回填该 assignment id；`homework` / `homework_due` 与 assignment 两处**保持一致**。
- 若本节 session 属于某里程碑，把 session id append 到对应 `painter-context/6-milestones/<course-id>/<ms-id>.md` 的 `related_sessions`；course id 首次出现时 append 到 `related_courses`。

## 9. 校验

- `npm run validate`：error 必须修复；warning 向用户明说。
- 涉及汇总时顺带跑 `npm run rollup` 更新 `painter-context/reports/dashboard.md`（禁止手改 `painter-context/reports/`）。
- 本轮确有 `painter-context/` 下的 md 写入 → 追加跑 `npm run build` 生成最新 `dist/index.html`（build 失败必须报告用户，`dist` 会过期）。

## 10. 汇报

- 新写入/升级的文件路径；
- 作业 DDL 倒计时天数；
- 该作业进入 `npm run next` 队列的位置；
- 预习对照里"没讲到"的部分建议如何处理（顺延到下次 / 转为练习 goal）。
