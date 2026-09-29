---
description: "Use when writing or editing Markdown links and images in this repository."
applyTo: "**/*.md"
---
# Markdown 链接与图片

所有 Markdown 文件中的可访问链接统一使用标准 Markdown 语法，确保 Obsidian 以外的 Markdown 查看器也能识别。

## 链接

- 内部页面使用带 `.md` 扩展名的相对路径：`[显示文字](../notes/example.md)`。
- 相对路径以当前 Markdown 文件所在目录为起点；需要访问同页标题时使用 `[标题](#标题锚点)`，跨页锚点使用 `[标题](../notes/example.md#标题锚点)`。
- 外部网页使用完整 URL：`[网站](https://example.com)`。
- 禁止使用 Obsidian wikilink：`[[页面]]`；禁止使用 Obsidian 嵌入：`![[图片]]`。

## 图片

- 图片使用标准 Markdown 语法，并填写有意义的替代文本：`![图片说明](assets/example.png)`。
- 图片路径相对于当前 Markdown 文件；避免绝对本机路径。
- 不用 HTML、wikilink 或 Obsidian 嵌入语法替代标准 Markdown 图片。

## 自查

- 修改或新增链接后，确认相对路径从当前文件位置可达，并保留目标文件扩展名。
- 页面正文中的来源、关联笔记等引用应是可点击链接；frontmatter 中的来源字段保留为纯路径或来源描述，不写 wikilink。