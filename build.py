#!/usr/bin/env python3
"""
Vista Coffee static site builder (Python 3 standard library only).

Edit files in src/ and run:   python3 build.py
The finished .html pages are written to the project root.

Page files (src/pages/*.html) start with a meta block:

    <!--meta
    title: Vista Coffee | Premium Rwandan Coffee
    description: One or two sentences for search engines.
    nav: home
    -->

Shortcodes available inside pages and partials:
    {{> header}}  {{> footer}}         shared partials from src/partials/
    {{icon:leaf}}                      outline icon from the sprite (add .icon--lg etc. with {{icon:leaf|icon--lg}})
    {{img:name|Alt text|sizes|eager}}  responsive <img> using images/name.webp + images/name-sm.webp
"""
import html
import json
import re
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
IMAGES = ROOT / "images"


def webp_size(path):
    """Return (width, height) of a WebP file, or None."""
    try:
        data = path.read_bytes()[:40]
    except OSError:
        return None
    if data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        return None
    chunk = data[12:16]
    if chunk == b"VP8 ":
        w, h = struct.unpack("<HH", data[26:30])
        return w & 0x3FFF, h & 0x3FFF
    if chunk == b"VP8L":
        b = data[21:25]
        w = 1 + (((b[1] & 0x3F) << 8) | b[0])
        h = 1 + (((b[3] & 0xF) << 10) | (b[2] << 2) | ((b[1] & 0xC0) >> 6))
        return w, h
    if chunk == b"VP8X":
        w = 1 + int.from_bytes(data[24:27], "little")
        h = 1 + int.from_bytes(data[27:30], "little")
        return w, h
    return None


def render_img(args):
    parts = args.split("|")
    name = parts[0].strip()
    alt = parts[1].strip() if len(parts) > 1 else ""
    sizes = parts[2].strip() if len(parts) > 2 and parts[2].strip() else "(min-width: 900px) 50vw, 100vw"
    eager = len(parts) > 3 and parts[3].strip() == "eager"
    big, small = IMAGES / f"{name}.webp", IMAGES / f"{name}-sm.webp"
    if not big.exists():
        raise SystemExit(f"Missing image: {big}")
    attrs = [f'src="images/{name}-sm.webp"']
    srcset = []
    if small.exists():
        srcset.append(f"images/{name}-sm.webp {webp_size(small)[0]}w")
    srcset.append(f"images/{name}.webp {webp_size(big)[0]}w")
    attrs.append(f'srcset="{", ".join(srcset)}"')
    attrs.append(f'sizes="{sizes}"')
    w, h = webp_size(big)
    attrs.append(f'width="{w}" height="{h}"')
    attrs.append(f'alt="{html.escape(alt, quote=True)}"')
    attrs.append('fetchpriority="high"' if eager else 'loading="lazy"')
    attrs.append('decoding="async"')
    return f"<img {' '.join(attrs)}>"


def render_icon(args):
    parts = args.split("|")
    cls = "icon" + (" " + parts[1].strip() if len(parts) > 1 else "")
    return f'<svg class="{cls}" aria-hidden="true"><use href="#i-{parts[0].strip()}"/></svg>'


def parse_meta(text):
    m = re.match(r"\s*<!--meta\n(.*?)-->\n?", text, re.S)
    if not m:
        raise SystemExit("Page is missing its <!--meta ... --> block")
    meta = {}
    for line in m.group(1).strip().splitlines():
        key, _, value = line.partition(":")
        meta[key.strip()] = value.strip()
    return meta, text[m.end():]


def expand(text, partials):
    text = re.sub(r"\{\{>\s*(\w+)\s*\}\}", lambda m: partials[m.group(1)], text)
    text = re.sub(r"\{\{icon:([^}]+)\}\}", lambda m: render_icon(m.group(1)), text)
    text = re.sub(r"\{\{img:([^}]+)\}\}", lambda m: render_img(m.group(1)), text)
    return text


def strip_tags(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()


def main():
    partials = {p.stem: p.read_text(encoding="utf-8") for p in (SRC / "partials").glob("*.html")}
    layout = partials.pop("layout")
    search_index = []

    for page in sorted((SRC / "pages").glob("*.html")):
        meta, body = parse_meta(page.read_text(encoding="utf-8"))
        out = layout
        for key in ("title", "description"):
            out = out.replace("{{" + key + "}}", html.escape(meta.get(key, ""), quote=True))
        out = out.replace("{{head_extra}}", meta.get("head_extra", ""))
        out = out.replace("{{body}}", body)
        out = expand(out, partials)
        nav = meta.get("nav")
        if nav:
            out = out.replace(f'data-nav="{nav}"', f'data-nav="{nav}" aria-current="page"')
        (ROOT / page.name).write_text(out, encoding="utf-8")

        if meta.get("search", "yes") != "no":
            main_html = re.search(r"<main.*?</main>", out, re.S).group(0)
            headings = [strip_tags(h) for h in re.findall(r"<h[1-3][^>]*>(.*?)</h[1-3]>", main_html, re.S)]
            search_index.append({
                "url": page.name,
                "title": meta.get("title", page.stem).split("|")[0].strip(),
                "description": meta.get("description", ""),
                "text": " ".join(headings + [strip_tags(main_html)])[:4000],
            })
        print(f"built {page.name}")

    (ROOT / "js" / "search-index.js").write_text(
        "/* Generated by build.py — do not edit by hand. */\nwindow.VISTA_SEARCH = "
        + json.dumps(search_index, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    print("built js/search-index.js")


if __name__ == "__main__":
    main()
