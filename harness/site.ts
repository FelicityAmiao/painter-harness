import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked, type Tokens } from "marked";
import { ROOT, toPosix, walkMd } from "./lib";

/** 站点收录的目录（harness 本身、模板、配置不上站） */
const SITE_SKIP = new Set(["node_modules", "dist", ".git", "harness", ".github", "templates"]);
const ROOT_FILES = ["README.md"];
const DIRS = ["painter-context"];

interface Entry {
  p: string;
  t: string;
}

export function resolveMarkdownHref(
  from: string,
  href: string,
  content: Record<string, unknown>,
): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(href);
  } catch {
    decoded = href;
  }
  decoded = decoded.split(/[?#]/, 1)[0].replace(/\\/g, "/");
  const segments = decoded.charAt(0) === "/" ? [] : from.split("/").slice(0, -1);
  decoded.split("/").forEach((part) => {
    if (!part || part === ".") return;
    if (part === "..") segments.pop();
    else segments.push(part);
  });
  const target = segments.join("/");
  return content[target] ? target : null;
}

function headingSlugger() {
  const used = new Set<string>();
  const nextByBase = new Map<string, number>();

  return (heading: string): string => {
    const base =
      heading
        .toLowerCase()
        .replace(/[^\p{L}\p{N}_\s-]/gu, "")
        .trim()
        .replace(/\s+/g, "-") || "section";
    let index = nextByBase.get(base) ?? 0;
    let slug = index === 0 ? base : `${base}-${index}`;
    while (used.has(slug)) {
      index += 1;
      slug = `${base}-${index}`;
    }
    nextByBase.set(base, index + 1);
    used.add(slug);
    return slug;
  };
}

function headingText(tokens: Tokens.Generic[]): string {
  return tokens
    .map((token) => {
      const value = token as Tokens.Generic & { text?: string; tokens?: Tokens.Generic[] };
      return value.tokens ? headingText(value.tokens) : value.text ?? "";
    })
    .join("");
}

export function renderMarkdown(markdown: string): string {
  const slug = headingSlugger();
  const renderer = new marked.Renderer();
  renderer.heading = function ({ tokens, depth }: Tokens.Heading): string {
    const id = slug(headingText(tokens));
    return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
  };
  return marked.parse(markdown, { async: false, renderer }) as string;
}

function embedMarkdownImages(markdown: string, sourcePath: string): string {
  const mimeTypes: Record<string, string> = {
    ".avif": "image/avif",
    ".bmp": "image/bmp",
    ".gif": "image/gif",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
  };
  const sourceDir = path.dirname(path.join(ROOT, sourcePath));

  return markdown.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
    (image, alt: string, href: string, title?: string) => {
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(href)) return image;

      let imagePath: string;
      try {
        imagePath = decodeURIComponent(href).split(/[?#]/, 1)[0];
      } catch {
        return image;
      }

      const abs = path.resolve(sourceDir, imagePath);
      const relative = path.relative(ROOT, abs);
      if (relative.startsWith("..") || path.isAbsolute(relative) || !fs.existsSync(abs)) {
        return image;
      }

      const mimeType = mimeTypes[path.extname(abs).toLowerCase()];
      if (!mimeType) return image;

      const data = fs.readFileSync(abs).toString("base64");
      const dataUri = `data:${mimeType};base64,${data}`;
      const escapedAlt = alt.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
      const titleAttribute = title
        ? ` title="${title.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")}"`
        : "";
      return `<img src="${dataUri}" alt="${escapedAlt}"${titleAttribute}>`;
    },
  );
}

export function buildSite(): void {
  const content: Record<string, string> = {};
  const manifest: Entry[] = [];

  const add = (abs: string) => {
    const rel = toPosix(path.relative(ROOT, abs));
    const parsed = matter(fs.readFileSync(abs, "utf8"));
    const data = parsed.data as Record<string, any>;
    let title =
      typeof data.title === "string" && data.title.trim() ? data.title.trim() : "";
    if (!title) {
      const m = parsed.content.match(/^#\s+(.+)$/m);
      title = m ? m[1].trim() : path.basename(rel, ".md");
    }
    if (rel === "README.md") title = "总览 · painter-harness";
    const markdown = embedMarkdownImages(parsed.content, rel);
    content[rel] = renderMarkdown(markdown);
    manifest.push({ p: rel, t: title });
  };

  for (const f of ROOT_FILES) {
    const abs = path.join(ROOT, f);
    if (fs.existsSync(abs)) add(abs);
  }
  for (const d of DIRS) {
    if (!fs.existsSync(path.join(ROOT, d))) continue;
    for (const abs of walkMd(d, SITE_SKIP)) add(abs);
  }
  manifest.sort((a, b) => {
    if (a.p === "README.md") return -1;
    if (b.p === "README.md") return 1;
    return a.p.localeCompare(b.p);
  });

  const json = JSON.stringify({ manifest, content })
    .replace(/<\//g, "<\\/")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

  const html = TEMPLATE.replace("/*__DATA__*/", json).replace(
    "/*__RESOLVER__*/",
    resolveMarkdownHref.toString(),
  );
  const outDir = path.join(ROOT, "dist");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");
  console.log(`✅ 已生成 dist/index.html（${manifest.length} 页，单文件，可直接部署）`);
}

const TEMPLATE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>painter-harness · 学习数据库</title>
<style>
:root{
  --bg:#0f1117; --panel:#141824; --panel2:#1a1f30; --line:#242a3d;
  --text:#d8dce8; --muted:#8b93a7; --accent:#8b5cf6; --accent2:#22d3ee;
}
*{box-sizing:border-box}
html,body{height:100%}
body{margin:0;background:var(--bg);color:var(--text);
  font-family:system-ui,-apple-system,"Segoe UI","Microsoft YaHei",sans-serif;font-size:15px;line-height:1.7}
#app{display:flex;height:100vh}
aside{width:300px;min-width:300px;background:var(--panel);border-right:1px solid var(--line);
  display:flex;flex-direction:column}
.brand{padding:18px 18px 10px;font-size:17px;font-weight:700;
  background:linear-gradient(90deg,var(--accent),var(--accent2));
  -webkit-background-clip:text;background-clip:text;color:transparent}
#search{margin:0 14px 10px;padding:8px 12px;border-radius:8px;border:1px solid var(--line);
  background:var(--panel2);color:var(--text);outline:none;font-size:13px}
#search:focus{border-color:var(--accent)}
#tree{overflow-y:auto;padding:4px 10px 30px;flex:1}
.dir{margin:2px 0}
.dir>summary{cursor:pointer;padding:5px 8px;border-radius:7px;font-size:13px;color:var(--muted);
  list-style:none;user-select:none}
.dir>summary::-webkit-details-marker{display:none}
.dir>summary:hover{background:var(--panel2);color:var(--text)}
.dir-body{padding-left:12px;border-left:1px solid var(--line);margin-left:8px}
.file{display:block;width:100%;text-align:left;background:none;border:0;border-radius:7px;
  color:var(--text);padding:6px 9px;font-size:13.5px;cursor:pointer;margin:1px 0;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.file:hover{background:var(--panel2)}
.file.active{background:rgba(139,92,246,.18);box-shadow:inset 2px 0 0 var(--accent)}
main{flex:1;overflow-y:auto}
#crumb{position:sticky;top:0;padding:14px 34px;font-size:13px;color:var(--muted);
  background:rgba(15,17,23,.92);backdrop-filter:blur(6px);border-bottom:1px solid var(--line);z-index:2}
#view{max-width:880px;margin:0 auto;padding:26px 34px 80px}
#view h1{font-size:26px;margin:.4em 0 .6em;line-height:1.3}
#view h2{font-size:20px;margin:1.6em 0 .6em;padding-bottom:.35em;border-bottom:1px solid var(--line)}
#view h3{font-size:16.5px;margin:1.4em 0 .5em}
#view a{color:var(--accent2);text-decoration:none}
#view a:hover{text-decoration:underline}
#view code{background:var(--panel2);padding:2px 6px;border-radius:5px;font-size:.9em;
  color:#9fd0ff;font-family:Consolas,"Cascadia Mono",monospace}
#view pre{background:var(--panel2);border:1px solid var(--line);padding:14px 16px;border-radius:10px;overflow-x:auto}
#view pre code{background:none;padding:0;color:#c9d3ea}
#view blockquote{margin:1em 0;padding:6px 16px;border-left:3px solid var(--accent);
  background:rgba(139,92,246,.07);color:var(--muted);border-radius:0 8px 8px 0}
#view table{border-collapse:collapse;width:100%;margin:1em 0;font-size:13.5px;display:block;overflow-x:auto}
#view th,#view td{border:1px solid var(--line);padding:7px 11px;text-align:left}
#view th{background:var(--panel2);color:var(--accent2);font-weight:600}
#view tr:nth-child(even) td{background:rgba(255,255,255,.015)}
#view ul,#view ol{padding-left:1.5em}
#view li{margin:.25em 0}
#view hr{border:0;border-top:1px solid var(--line);margin:2em 0}
#view input[type=checkbox]{accent-color:var(--accent);margin-right:6px}
#view img{max-width:100%;border-radius:10px;cursor:zoom-in}
.empty{color:var(--muted);padding:60px 0;text-align:center}
@media (max-width:820px){#app{flex-direction:column}aside{width:100%;min-width:0;max-height:40vh}
  #view{padding:20px}}
</style>
</head>
<body>
<div id="app">
  <aside>
    <div class="brand">🎨 painter-harness</div>
    <input id="search" placeholder="搜索标题 / 路径…">
    <nav id="tree"></nav>
  </aside>
  <main>
    <div id="crumb">加载中…</div>
    <article id="view"><div class="empty">从左侧选择一页</div></article>
  </main>
</div>
<script>window.__DATA__ = /*__DATA__*/;</script>
<script>
var D = window.__DATA__;
var treeEl = document.getElementById('tree');
var viewEl = document.getElementById('view');
var crumbEl = document.getElementById('crumb');
var searchEl = document.getElementById('search');
var titleMap = {};
D.manifest.forEach(function (e) { titleMap[e.p] = e.t; });

function buildTree() {
  var root = { dirs: {}, files: [] };
  D.manifest.forEach(function (e) {
    if (e.p === 'README.md') { root.files.unshift(e); return; }
    var parts = e.p.split('/'); var name = parts.pop(); var node = root;
    parts.forEach(function (seg) {
      if (!node.dirs[seg]) node.dirs[seg] = { dirs: {}, files: [] };
      node = node.dirs[seg];
    });
    node.files.push({ p: e.p, t: e.t, name: name });
  });
  return root;
}

function makeFileBtn(p, t) {
  var btn = document.createElement('button');
  btn.className = 'file'; btn.dataset.path = p; btn.textContent = '📄 ' + t;
  btn.title = p;
  btn.addEventListener('click', function () { show(p); });
  return btn;
}

function renderTree() {
  treeEl.innerHTML = '';
  var root = buildTree();
  root.files.forEach(function (f) { treeEl.appendChild(makeFileBtn(f.p, f.t)); });
  Object.keys(root.dirs).sort().forEach(function (dir) {
    treeEl.appendChild(makeDir(dir, root.dirs[dir], 0));
  });
}

function makeDir(name, node, depth) {
  var det = document.createElement('details');
  det.className = 'dir'; det.open = depth < 1;
  var sum = document.createElement('summary');
  sum.textContent = '📁 ' + name;
  det.appendChild(sum);
  var body = document.createElement('div');
  body.className = 'dir-body';
  node.files.forEach(function (f) { body.appendChild(makeFileBtn(f.p, f.t)); });
  Object.keys(node.dirs).sort().forEach(function (d) {
    body.appendChild(makeDir(d, node.dirs[d], depth + 1));
  });
  det.appendChild(body);
  return det;
}

function highlight(p) {
  Array.prototype.forEach.call(document.querySelectorAll('.file'), function (b) {
    b.classList.toggle('active', b.dataset.path === p);
  });
}

var currentPath = '';

function decodePart(value) {
  try { return decodeURIComponent(value); } catch (_) { return value; }
}

var resolveHref = /*__RESOLVER__*/;

function readRoute() {
  var parts = location.hash.slice(1).split('#');
  return { path: decodePart(parts[0]), anchor: parts.length > 1 ? decodePart(parts.slice(1).join('#')) : '' };
}

function show(p, push, anchor) {
  var html = D.content[p];
  if (!html) return;
  currentPath = p;
  viewEl.innerHTML = html;
  crumbEl.textContent = (titleMap[p] || p) + '  ·  ' + p;
  var route = '#' + encodeURIComponent(p) + (anchor ? '#' + encodeURIComponent(anchor) : '');
  if (push !== false && location.hash !== route) {
    history.replaceState(null, '', route);
  }
  highlight(p);
  document.querySelector('main').scrollTop = 0;
  if (anchor) {
    requestAnimationFrame(function () {
      var target = document.getElementById(anchor);
      if (target) target.scrollIntoView();
    });
  }
}

viewEl.addEventListener('click', function (e) {
  var image = e.target.closest ? e.target.closest('img') : null;
  if (image) { window.open(image.currentSrc || image.src, '_blank', 'noopener'); return; }
  var a = e.target.closest ? e.target.closest('a') : null;
  if (!a) return;
  var href = a.getAttribute('href') || '';
  if (href.charAt(0) === '#') {
    e.preventDefault();
    show(currentPath, true, decodePart(href.slice(1)));
  } else if (/\.md(?:[?#].*)?$/i.test(href)) {
    var parts = href.split('#');
    var target = resolveHref(currentPath, parts[0], D.content);
    var anchor = parts.length > 1 ? decodePart(parts.slice(1).join('#')) : '';
    if (target) { e.preventDefault(); show(target, true, anchor); }
  } else if (/^https?:/.test(href)) { a.target = '_blank'; a.rel = 'noopener'; }
});

searchEl.addEventListener('input', function () {
  var q = searchEl.value.trim().toLowerCase();
  if (!q) { renderTree(); highlight(currentPath); return; }
  treeEl.innerHTML = '';
  D.manifest.filter(function (e) {
    return e.t.toLowerCase().indexOf(q) >= 0 || e.p.toLowerCase().indexOf(q) >= 0;
  }).forEach(function (e) { treeEl.appendChild(makeFileBtn(e.p, e.t)); });
});

window.addEventListener('hashchange', function () {
  var route = readRoute();
  if (D.content[route.path]) show(route.path, false, route.anchor);
});

renderTree();
var initial = readRoute();
show(D.content[initial.path] ? initial.path : D.manifest[0].p, false, initial.anchor);
</script>
</body>
</html>
`;
