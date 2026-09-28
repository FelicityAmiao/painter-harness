# 阶段 B · 课后更新 checklist

目标：把课前骨架升级为完整上课记录，或在没有骨架时完成一次完整录入。

## 1. 定位与分流

按用户给的日期（缺省今天）+ 课程 id 找 `data/sessions/YYYY-MM-DD-<course-id>.md`：

| 找到的文件 | 动作 |
| --- | --- |
| 含 `> 状态：课前预览` | 原地升级（继续第 2 步） |
| 不存在 | 走完整录入（第 2–6 步全做，骨架步骤从零建文件） |
| 已是完整记录 | 只做增量修正，禁止重建、禁止覆盖已有内容 |
| 用户说的日期与文件对不上（改期） | **先问用户确认**，再重命名文件并同步 `id` 与所有引用 |

## 2. 补全 frontmatter

- 必填已在骨架中：`id` / `date` / `course`（改期时同步改）。
- 新增/校正：`instructor`、`duration_min`（数字）、`homework`、`homework_due`（ISO）、`skills`（对照 `painter-context/skill-tree.md` 校正预判，只写表内 id）。
- 状态标记行改为 `> 状态：已完成`。

## 3. 补全正文

- `## 课堂内容`：来自用户口述或课件，分点写，不编造。
- `## 疑问`：当场没懂的，保留原课前疑问中未解答项。
- `## 收获`：本次最值钱的 2–3 条，能落到技能 id 就落到 skills。

## 4. 预习闭环

- 在 `## 预习` 末尾追加小节：

```markdown
### 对照
- 命中：…
- 没讲到：…
- 超预期：…
```

## 5. 作业与日历

- 作业带 DDL → 建 `data/assignments/as-NNN-<slug>.md`：
  - 编号顺延现有最大号；frontmatter：`title`、`due`（ISO）、`status: todo`、`priority`（问用户，缺省 medium）、`course`、`skills`、`session` 回链本次 session id。
  - session 的 `assignment` 字段回填该 assignment id；`homework` / `homework_due` 与 assignment 两处**保持一致**。
- 有固定后续上课时间 → 追加到 `data/calendar.md`（作业 DDL 不写这里）。

## 6. 校验

- `npm run validate`：error 必须修复；warning 向用户明说。
- 涉及汇总时顺带跑 `npm run rollup` 更新 `reports/dashboard.md`（禁止手改 reports/）。

## 7. 汇报

- 新写入/升级的文件路径；
- 作业 DDL 倒计时天数；
- 该作业进入 `npm run next` 队列的位置；
- 预习对照里"没讲到"的部分建议如何处理（顺延到下次 / 转为练习 goal）。
