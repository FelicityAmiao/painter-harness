import assert from "node:assert/strict";
import test from "node:test";
import { renderMarkdown, resolveMarkdownHref } from "./site";

test("Markdown headings produce fragment-compatible IDs", () => {
  const html = renderMarkdown("# Anchor Test\n\n# 中文标题\n\n# 中文标题\n\n# 中文 标题");

  assert.match(html, /<h1 id="anchor-test">Anchor Test<\/h1>/);
  assert.match(html, /<h1 id="中文标题">中文标题<\/h1>/);
  assert.match(html, /<h1 id="中文标题-1">中文标题<\/h1>/);
  assert.match(html, /<h1 id="中文-标题">中文 标题<\/h1>/);
});

test("same-page and cross-page heading links target rendered IDs", () => {
  const source = renderMarkdown("# Source\n\n[Same page](#source)\n\n[Other page](target.md#中文标题-1)");
  const target = renderMarkdown("# 中文标题\n\n# 中文标题");
  const content = { "painter-context/notes/target.md": target };
  const targetPath = resolveMarkdownHref("painter-context/notes/source.md", "target.md#中文标题-1", content);

  assert.match(source, /<a href="#source">Same page<\/a>/);
  assert.match(source, /<a href="target\.md#%E4%B8%AD%E6%96%87%E6%A0%87%E9%A2%98-1">Other page<\/a>/);
  assert.match(source, /<h1 id="source">Source<\/h1>/);
  assert.equal(targetPath, "painter-context/notes/target.md");
  assert.match(content[targetPath!], /<h1 id="中文标题-1">中文标题<\/h1>/);
});

test("relative Markdown links resolve to known site pages", () => {
  const content = { "painter-context/notes/learning-fatigue.md": "<h1 id=\"fatigue\">" };

  assert.equal(
    resolveMarkdownHref(
      "painter-context/3-sessions/illustration/2026-09-29-procreate-canvas-layers-brushes.md",
      "../../notes/learning-fatigue.md#fatigue",
      content,
    ),
    "painter-context/notes/learning-fatigue.md",
  );
  assert.equal(
    resolveMarkdownHref("painter-context/1-courses/course.md", "missing.md", content),
    null,
  );
});