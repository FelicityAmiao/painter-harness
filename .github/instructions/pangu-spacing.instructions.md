---
description: "Use when writing or editing Markdown files (.md) in this repo. Enforces 盘古之白 (Pangu Spacing): insert a space between CJK characters and Latin letters/numbers."
applyTo: "**/*.md"
---
# 盘古之白（Pangu Spacing）

本仓库所有 Markdown 文件遵循「盘古之白」规范：**中文与英文、数字、半角标点相邻时，两侧各加一个半角空格**。

## 规则

1. 中文 ⇄ 英文之间加空格：
   - ✅ `使用 TypeScript 编写`
   - ❌ `使用TypeScript编写`
2. 中文 ⇄ 数字之间加空格：
   - ✅ `共 3 个文件，耗时 15 分钟`
   - ❌ `共3个文件，耗时15分钟`
3. 中文 ⇄ 半角标点（`( ) / % + - =` 等）之间加空格：
   - ✅ `运行 validate 命令（见 conventions.md 第 2 节）`
4. 连续的英文/数字内部不加空格：`VS Code`、`2026-09-29`、`L0–L5` 保持原样（专有名词如 `VS Code` 自带的空格照常保留）。
5. 全角标点（`，。；：、「」`）前后的英文数字同样按上述规则留空格，但全角标点本身紧贴前文，不额外加空格：`目标是 3 张，已完成 1 张。`

## 例外

- 代码块（``` 围栏）、行内代码（`code`）、YAML frontmatter 内的值、URL、文件路径不适用本规则，保持原样。
- 引用的命令输出、日志片段不做改写。

## 适用动作

- 新建或修改任何 `.md` 文件（含 `painter-context/` 及其 `notes/`、`reports/`、`templates/` 子目录）时，写出的中文内容必须已符合本规范。
- 修改既有文件时，顺手修正改动行附近的违规空格，不必一次性全仓清理。
