#!/usr/bin/env python3
"""Ingest paste-form artifacts DIRECTLY from the published tool pages.

Source:  ../nikbearbrown_com/public/artifacts/*.html  (the originals)
Output:  data/catalog/artifact-pages.json

The contract: KEEP THE STRUCTURE, DROP THE PRESENTATION. The full tag
skeleton survives — h1-h6, sections' heading hierarchy, lists, tables,
code blocks — with every class, style, and attribute stripped, so the
site's stylesheet (artifact-doc.css, built on the site's CSS variables)
owns typography and color. Source-page chrome (breadcrumbs, in-page nav,
anything before the <h1>) is dropped.

Why Python: the site ships no HTML parser and the sandbox has no network
for installs; the stdlib parser is battle-tested. Run locally, commit the
JSON — same ingest-to-file pattern as the ledger.

Usage: python3 scripts/ingest-artifact-pages.py [artifacts-dir]
"""
import json
import re
import sys
from datetime import date
from html import escape
from html.parser import HTMLParser
from pathlib import Path

SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("../nikbearbrown_com/public/artifacts")
OUT = Path("data/catalog/artifact-pages.json")

KEEP = {"h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "li",
        "table", "thead", "tbody", "tr", "th", "td",
        "pre", "code", "strong", "em", "b", "i", "hr", "blockquote", "br"}
SKIP = {"script", "style", "head", "nav", "footer", "svg", "iframe",
        "noscript", "form", "button", "select", "input"}
VOID = {"hr", "br"}


class Clean(HTMLParser):
    """Emit cleaned HTML: KEEP tags attribute-free, unwrap the rest."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out = []
        self.skip = 0
        self.pre = 0
        self.title = ""
        self.in_title = False
        self.meta_desc = ""
        self.span_gap = False  # chip heuristic: adjacent spans get a separator

    def handle_starttag(self, tag, attrs):
        if tag == "title":
            self.in_title = True
        if tag == "meta":
            a = dict(attrs)
            if a.get("name") == "description":
                self.meta_desc = a.get("content", "")
        if tag in SKIP:
            self.skip += 1
            return
        if self.skip:
            return
        if tag == "span" and self.span_gap:
            self.out.append(" · ")
        if tag != "span":
            self.span_gap = False
        if tag in KEEP:
            self.out.append(f"<{tag}>")
            if tag == "pre":
                self.pre += 1

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if tag in SKIP:
            self.skip = max(0, self.skip - 1)
            return
        if self.skip:
            return
        if tag == "span":
            self.span_gap = True
            return
        self.span_gap = False
        if tag in KEEP and tag not in VOID:
            if tag == "pre":
                self.pre = max(0, self.pre - 1)
            self.out.append(f"</{tag}>")

    def handle_data(self, data):
        if self.in_title:
            self.title += data
            return
        if self.skip:
            return
        if data.strip():
            self.span_gap = False
        text = data if self.pre else re.sub(r"\s+", " ", data)
        if text:
            self.out.append(escape(text, quote=False))

    def html(self):
        h = "".join(self.out)
        # drop source-page chrome: everything before the first <h1>
        i = h.find("<h1>")
        if i > 0:
            h = h[i:]
        # prune empty elements produced by unwrapped decoration
        for _ in range(3):
            h = re.sub(r"<(p|li|ul|ol|h[1-6]|strong|em|code)>\s*</\1>", "", h)
        return h.strip()


def to_text(html):
    """Cleaned HTML -> markdown-ish clipboard text (the actual paste)."""
    s = html
    for n in range(1, 7):
        s = s.replace(f"<h{n}>", "\n\n" + "#" * n + " ").replace(f"</h{n}>", "\n")
    s = re.sub(r"<pre><code>|<pre>", "\n```\n", s)
    s = re.sub(r"</code></pre>|</pre>", "\n```\n", s)
    s = s.replace("<li>", "\n- ").replace("</li>", "")
    s = s.replace("<tr>", "\n").replace("</tr>", "")
    s = re.sub(r"</t[dh]><t[dh]>", " | ", s)
    s = s.replace("<hr>", "\n\n---\n\n").replace("<br>", "\n")
    s = s.replace("<p>", "\n\n").replace("</p>", "")
    s = re.sub(r"</?[a-z0-6]+>", "", s)
    s = s.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    return re.sub(r"\n{3,}", "\n\n", s).strip()


pages = []
for f in sorted(SRC.glob("*.html")):
    c = Clean()
    c.feed(f.read_text(errors="replace"))
    html = c.html()
    if len(html) < 500:
        print(f"  skip {f.name}: {len(html)} chars after cleaning")
        continue
    slug = re.sub(r"-(tool|reference(-v\d+)?)$", "", f.stem)
    if any(p["slug"] == slug for p in pages):
        prev = next(p for p in pages if p["slug"] == slug)
        if len(html) <= len(prev["html"]):
            continue
        pages.remove(prev)
    title = re.split(r"\s+[—–]\s+", c.title.strip())[0].strip() or f.stem
    raw = to_text(html)
    pages.append({
        "slug": slug, "title": title,
        "description": c.meta_desc.strip(),
        "chars": len(raw), "tokensApprox": round(len(raw) / 4),
        "source": f"public/artifacts/{f.name}",
        "html": html, "raw": raw,
    })
    print(f"  {slug:26s} {title:14s} h2×{html.count('<h2>')} h3×{html.count('<h3>')} "
          f"table×{html.count('<table>')} ~{round(len(raw)/4/1000,1)}k tok")

pages.sort(key=lambda p: p["slug"])
OUT.write_text(json.dumps({"generated": str(date.today()), "pages": pages}, indent=1))
print(f"\n{len(pages)} artifact pages -> {OUT}")
