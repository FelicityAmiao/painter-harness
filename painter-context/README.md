# data/ 学习数据

`data/` 是唯一事实源，schema 见 `painter-context/conventions.md`。`reports/` 只生成，不是事实来源；课程大纲、平台说明、聊天记录、草稿与其他参考材料都只是参考，不等于事实。

- `courses/` 课程
- `sessions/<track>/` 按课程学习方向分类的上课记录
- `assignments/` 作业（真实 DDL，硬截止）
- `plans/` 逐课程目标/阶段的学习计划（软窗口，可分次录入）
- `practice/` 练习记录（已发生事实）
- `milestones/` 里程碑 checklist
- `calendar.md` 非作业类日期事项

事实与计划分层：

- 真实 DDL：`data/assignments/` 中每个 assignment 的 `due`
- 非作业事项：`data/calendar.md`，每行必须以 ISO 日期开头
- 规划日期 / 排期日期：软安排，不等于硬截止，也不写进 `due`
- 课程计划的硬截止只从关联 assignment 的 `due` 读取；未关联作业时显示为无硬截止
- 课程大纲与学习规划只是参考，不能代替真实的 `due`、`date` 或 `calendar` 事实

每次课的文件名为 `YYYY-MM-DD-<ascii-topic-slug>.md`；课前预习与课后课堂记录写在同一份 session 中。分类目录取关联课程的 `track`，不根据 `type` 或 `provider` 分类。

录入方式：让 AI 执行 `.github/prompts/` 下的 prompt，或直接复制 `templates/` 模板填写。写完跑 `npm run validate`。

课程目标或阶段计划按项新建 `plans/` 中的文件，窗口日期可按实际情况调整；计划总览由 `npm run rollup` 生成，不手改报告。
