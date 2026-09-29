# data/ 学习数据

唯一事实源，schema 见 `painter-context/conventions.md`。

- `courses/` 课程 · `sessions/<track>/` 按课程学习方向分类的上课记录 · `assignments/` 作业（DDL） · `practice/` 练习 · `milestones/` 里程碑 · `calendar.md` 日期事项

每次课的文件名为 `YYYY-MM-DD-<ascii-topic-slug>.md`；课前预习与课后课堂记录写在同一份 session 中。分类目录取关联课程的 `track`，不根据 `type` 或 `provider` 分类。

录入方式：让 AI 执行 `.github/prompts/` 下的 prompt，或直接复制 `templates/` 模板填写。写完跑 `npm run validate`。
