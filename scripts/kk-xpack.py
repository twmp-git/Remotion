#!/usr/bin/env python3
"""
Builds the "X pack": every planned post that still has to go on X (the user posts X by hand, using
x.com's free scheduler, until the account has API credits). One page with the time, the X caption
(copy button + 280-character count) and the images for each post.

    python3 scripts/kk-xpack.py [YYYY-MM-DD …]   # default: today and later plans
    → out/kaya-kurrent/x-pack.html (+ the images it uses, listed in out/kaya-kurrent/x-pack-files.json)
"""
import datetime as dt
import glob
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PLANS = ROOT / "posting" / "kaya-kurrent"
OUT = ROOT / "out" / "kaya-kurrent"
CAT = dt.timezone(dt.timedelta(hours=2))  # Malawi


def xlen(text):
    """Length as X counts it: links are 23, emoji and other wide characters count double."""
    text = re.sub(r"https?://\S+", "x" * 23, text)
    return sum(1 if ord(c) <= 0x10FF or 0x2000 <= ord(c) <= 0x201F else 2 for c in text)


now = dt.datetime.now(CAT)
days = sys.argv[1:] or None
posts = []
for f in sorted(glob.glob(str(PLANS / "*.json"))):
    plan = json.loads(Path(f).read_text())
    for p in plan["posts"]:
        t = dt.datetime.fromisoformat(p["time"])
        if days and t.date().isoformat() not in days:
            continue
        if not days and t.date() < now.date():
            continue
        if p.get("posted", {}).get("x"):
            continue
        kind = p.get("kind") or ("opportunity" if p["slug"].startswith("opp-") else "story")
        images = []
        for role in ("cover", "card"):
            url = p.get("images", {}).get(role)
            if url:
                local = url.split("/posting/kaya-kurrent/")[1]
                images.append({"url": url, "path": f"img/{local}", "src": f"posting/kaya-kurrent/{local}"})
        posts.append({
            "time": t, "slug": p["slug"], "kind": kind,
            "title": p.get("headline") or p.get("title") or p["slug"],
            "caption": p["captions"]["x"], "images": images,
        })
posts.sort(key=lambda p: p["time"])

KIND = {"story": "News story", "opportunity": "Opportunity", "notice": "Public notice"}


def card(p, i):
    passed = p["time"] <= now
    n = xlen(p["caption"])
    imgs = "".join(
        f'<figure><img src="{im["path"]}" alt="Image {k + 1} for {html.escape(p["title"])}" loading="lazy">'
        f'<figcaption>Image {k + 1}{" (cover)" if k == 0 and len(p["images"]) > 1 else ""} · '
        f'<a href="{im["url"]}" target="_blank" rel="noopener">Open full size</a></figcaption></figure>'
        for k, im in enumerate(p["images"])
    )
    status = (
        '<span class="pill now">Slot passed · post now</span>' if passed
        else f'<span class="pill">Schedule for {p["time"]:%H:%M}</span>'
    )
    return f"""
<article class="post{' passed' if passed else ''}" id="{p['slug']}">
  <header class="post-head">
    <time class="clock" datetime="{p['time'].isoformat()}">{p['time']:%H:%M}</time>
    <div class="meta">
      <span class="kind">{KIND.get(p['kind'], p['kind'])}</span>
      <h3>{html.escape(p['title'])}</h3>
      {status}
    </div>
    <label class="done"><input type="checkbox" id="done-{p['slug']}" data-key="{p['slug']}"> Scheduled</label>
  </header>
  <div class="body">
    <div class="caption">
      <pre id="cap-{i}">{html.escape(p['caption'])}</pre>
      <div class="cap-foot">
        <span class="count{' over' if n > 280 else ''}">{n} / 280</span>
        <button type="button" class="copy" data-target="cap-{i}">Copy caption</button>
      </div>
    </div>
    <div class="images">{imgs}</div>
  </div>
</article>"""


sections = []
for day in sorted({p["time"].date() for p in posts}):
    items = [p for p in posts if p["time"].date() == day]
    cards = "".join(card(p, posts.index(p)) for p in items)
    sections.append(
        f'<section class="day"><h2>{day:%A %d %B}</h2><p class="day-sub">{len(items)} posts</p>{cards}</section>'
    )

page = f"""<title>Kaya Kurrent X Pack</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,600&family=DM+Mono:wght@400;500&display=swap">
<style>
/* Layout: one column of post cards per day, time on the left like a running order. */
:root {{
  --bg: #f6f5f3; --surface: #ffffff; --ink: #141414; --muted: #5f5a57; --line: #e2dedb;
  --red: #be292d; --red-ink: #ffffff; --soft: #f9e9e9; --ok: #2f7a4b;
  --display: "Barlow Condensed", "Arial Narrow", sans-serif;
  --body: "DM Sans", system-ui, sans-serif;
  --mono: "DM Mono", ui-monospace, monospace;
}}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{
  --bg: #121111; --surface: #1c1b1a; --ink: #f1efed; --muted: #a8a29e; --line: #33302e;
  --red: #e0474b; --red-ink: #ffffff; --soft: #3a1d1e; --ok: #6fc28f; color-scheme: dark; }} }}
:root[data-theme="dark"] {{
  --bg: #121111; --surface: #1c1b1a; --ink: #f1efed; --muted: #a8a29e; --line: #33302e;
  --red: #e0474b; --red-ink: #ffffff; --soft: #3a1d1e; --ok: #6fc28f; color-scheme: dark; }}
body {{ background: var(--bg); color: var(--ink); font-family: var(--body); font-size: 15px; line-height: 1.5;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px));
  padding-block: 24px 48px; }}
.wrap {{ max-width: 960px; margin: 0 auto; display: grid; gap: 28px; }}
.top h1 {{ font-family: var(--display); font-size: 2.4rem; line-height: 1; margin: 0 0 6px; letter-spacing: .01em;
  text-transform: uppercase; text-wrap: balance; }}
.top h1 span {{ color: var(--red); }}
.top p {{ margin: 0; color: var(--muted); max-width: 65ch; }}
.how {{ background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 14px 18px; }}
.how h2 {{ font-family: var(--display); text-transform: uppercase; letter-spacing: .04em; font-size: 1.05rem; margin: 0 0 6px; }}
.how ol {{ margin: 0; padding-left: 1.2em; display: grid; gap: 2px; }}
.day {{ display: grid; gap: 14px; }}
.day h2 {{ font-family: var(--display); text-transform: uppercase; font-size: 1.6rem; margin: 0; letter-spacing: .02em; }}
.day-sub {{ margin: -12px 0 0; color: var(--muted); font-size: .9rem; }}
.post {{ background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 16px; display: grid; gap: 14px; }}
.post.passed {{ border-color: var(--red); }}
.post.is-done {{ opacity: .55; }}
.post-head {{ display: flex; gap: 14px; align-items: flex-start; flex-wrap: wrap; }}
.clock {{ font-family: var(--mono); font-size: 1.6rem; font-weight: 500; font-variant-numeric: tabular-nums; line-height: 1;
  padding-top: 2px; min-width: 3.4ch; }}
.meta {{ flex: 1 1 260px; min-width: 0; display: grid; gap: 4px; justify-items: start; }}
.kind {{ font-size: .72rem; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); font-weight: 600; }}
.meta h3 {{ margin: 0; font-family: var(--display); text-transform: uppercase; font-size: 1.25rem; line-height: 1.1; text-wrap: balance; }}
.pill {{ font-size: .78rem; border: 1px solid var(--line); border-radius: 999px; padding: 1px 10px; color: var(--muted); }}
.pill.now {{ background: var(--red); color: var(--red-ink); border-color: var(--red); font-weight: 600; }}
.done {{ display: flex; gap: 6px; align-items: center; font-size: .9rem; font-weight: 600; cursor: pointer; }}
.done input {{ width: 18px; height: 18px; accent-color: var(--ok); }}
.body {{ display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 16px; }}
@media (max-width: 720px) {{ .body {{ grid-template-columns: minmax(0, 1fr); }} }}
.caption {{ display: grid; gap: 8px; align-content: start; min-width: 0; }}
.caption pre {{ margin: 0; white-space: pre-wrap; word-break: break-word; font-family: var(--body); font-size: .95rem;
  background: var(--bg); border: 1px solid var(--line); border-radius: 8px; padding: 12px; }}
.cap-foot {{ display: flex; justify-content: space-between; align-items: center; gap: 10px; }}
.count {{ font-family: var(--mono); font-size: .8rem; color: var(--muted); font-variant-numeric: tabular-nums; }}
.count.over {{ color: var(--red); font-weight: 600; }}
.copy {{ font: 600 .9rem var(--body); background: var(--ink); color: var(--bg); border: 0; border-radius: 6px;
  padding: 8px 14px; cursor: pointer; }}
.copy:focus-visible, .done input:focus-visible, a:focus-visible {{ outline: 2px solid var(--red); outline-offset: 2px; }}
.copy.ok {{ background: var(--ok); }}
.images {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; min-width: 0; }}
figure {{ margin: 0; display: grid; gap: 4px; }}
figure img {{ width: 100%; height: auto; border-radius: 6px; border: 1px solid var(--line); background: var(--bg); }}
figcaption {{ font-size: .8rem; color: var(--muted); }}
figcaption a {{ color: var(--red); }}
</style>
<div class="wrap">
  <div class="top">
    <h1>Kaya Kurrent <span>X Pack</span></h1>
    <p>Every planned post that still needs to go on X, at the same times as Facebook, Instagram and Threads.
    Built {now:%A %d %B, %H:%M} (Malawi time). Red cards are slots that have already passed: post those now.</p>
  </div>
  <div class="how">
    <h2>Scheduling on x.com (free)</h2>
    <ol>
      <li>Save the images (right-click → Save image, or “Open full size” first).</li>
      <li>On x.com, start a post, press <b>Copy caption</b> here and paste it in, then add the images in order.</li>
      <li>Click the calendar icon under the post box, pick the date and time shown, then <b>Schedule</b>.</li>
      <li>Tick <b>Scheduled</b> here so you know where you got to.</li>
    </ol>
  </div>
  {''.join(sections)}
</div>
<script>
(function () {{
  var store = {{ get: function (k) {{ try {{ return localStorage.getItem(k); }} catch (e) {{ return null; }} }},
               set: function (k, v) {{ try {{ localStorage.setItem(k, v); }} catch (e) {{}} }} }};
  document.querySelectorAll('.done input').forEach(function (box) {{
    var key = 'kk-x-done-' + box.dataset.key, post = box.closest('.post');
    box.checked = store.get(key) === '1';
    post.classList.toggle('is-done', box.checked);
    box.addEventListener('change', function () {{
      store.set(key, box.checked ? '1' : '0');
      post.classList.toggle('is-done', box.checked);
    }});
  }});
  document.querySelectorAll('.copy').forEach(function (btn) {{
    btn.addEventListener('click', function () {{
      var pre = document.getElementById(btn.dataset.target);
      var done = function () {{ btn.textContent = 'Copied'; btn.classList.add('ok');
        setTimeout(function () {{ btn.textContent = 'Copy caption'; btn.classList.remove('ok'); }}, 1600); }};
      var select = function () {{ var r = document.createRange(); r.selectNodeContents(pre);
        var s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = 'Selected: press Ctrl+C'; }};
      if (navigator.clipboard && navigator.clipboard.writeText) {{
        navigator.clipboard.writeText(pre.textContent).then(done, select);
      }} else {{ select(); }}
    }});
  }});
}})();
</script>
"""

OUT.mkdir(parents=True, exist_ok=True)
(OUT / "x-pack.html").write_text(page)
files = {im["path"]: im["src"] for p in posts for im in p["images"]}
(OUT / "x-pack-files.json").write_text(json.dumps(files, indent=2))
print(f"{len(posts)} posts, {len(files)} images → {OUT / 'x-pack.html'}")
for p in posts:
    print(f"  {p['time']:%a %H:%M}  {p['slug']}  ({xlen(p['caption'])} chars)")
