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

test("relative Markdown links resolve to known site pages", () => {
  const content = { "notes/learning-fatigue.md": "<h1 id=\"fatigue\">" };

  assert.equal(
    resolveMarkdownHref(
      "data/sessions/illustration/2026-09-29-procreate-software.md",
      "../../../notes/learning-fatigue.md#fatigue",
      content,
    ),
    "notes/learning-fatigue.md",
  );
  assert.equal(
    resolveMarkdownHref("data/courses/course.md", "missing.md", content),
    null,
  );
});