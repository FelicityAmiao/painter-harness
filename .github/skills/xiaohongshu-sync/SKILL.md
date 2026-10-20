---
name: xiaohongshu-sync
description: 只读调研小红书账号内容，并在逐帖确认后将提炼结果交给 painter 学习记录流程。Use when 用户要求拉取、同步或查看该小红书账号的最新内容。
---

# 小红书同步

## 目标与边界

- 通过工作区 MCP 配置中的 `xiaohongshu` 服务只读访问小红书；优先使用免登录能力，只有 MCP 明确要求时才使用登录态备用能力。
- `.mcp.json` 仅注册 `http://localhost:18060/mcp`；用户需先启动 `xpzouying/xiaohongshu-mcp` 本地服务。当前仓库不验证连接，也不自动安装或启动该服务。
- MCP 只用于外部参考调研，不把小红书帖子直接当作 `painter-context/` 事实源。
- 不保存帖子原文、媒体、评论、cookies 或 token；只在用户逐帖确认后保存提炼出的 painter 记录。
- 不绕过 `painter-orchestrator` 的 researcher → planner → 用户确认 → implementer → reviewer 流程。

## 获取与发现

1. 先读取账号主页：[`小红书账号主页`](https://www.xiaohongshu.com/user/profile/6a52119f000000000f03ac02?xsec_token=ABWw_ZDYvpvZMFkWaB5ur6DOOrE1RnNCaLTrNqxzVnzig=&xsec_source=pc_user)。
2. 通过主页结果发现帖子，再逐条读取候选帖子的详情；每条候选必须保留可核对的 `post_id`、来源 URL、发布时间和标题 / 摘要事实。
3. 若主页发现或单帖读取失败，报告失败原因和不确定项，不用猜测内容，也不推进同步游标。

## 增量窗口

- 首次 `sync_after = 2026-10-17T00:00:00+08:00`。
- 后续同步以下次查询起点为“上次成功同步时间减去重叠窗口”：`sync_after = last_sync_at - overlap_window`，其中 `overlap_window = 48h`。
- 只纳入严格满足 `published_at > sync_after` 的帖子；使用发布时间判断，不使用抓取时间或排序位置替代。
- 以 `post_id` 去重。已确认或已拒绝的 `post_id` 不重复提交确认；同一帖子不得因重叠窗口生成多条 painter 记录。
- 只有候选读取完成、用户逐帖确认结果已记录且对应写入流程成功后，才更新 `last_sync_at`。任何失败都保持原游标不变。

## 逐帖确认协议

对每篇候选单独展示：

- `post_id`、来源 URL、发布时间；
- 帖子事实摘要和明确标注的不确定项；
- 建议归类：`session`、`assignment`、`practice` 或 `note`；
- 建议关联课程、技能和记录目标；缺少课程或 `practice` 的 `goal` 时必须询问。

等待用户对每篇帖子逐条明确确认、拒绝或要求修改。批量同意、沉默、继续对话和“看起来可以”都不算确认。确认前不得写入 `painter-context/`。

## 状态元数据

默认运行时状态路径为 `.github/state/xiaohongshu-sync.json`，只保存主页 URL、首次基准、成功游标、重叠小时数和已确认 / 拒绝的 `post_id`。不得把帖子正文或媒体写入状态文件。若状态文件不可写，仍可只读调研，但不得声称已成功同步或推进游标。