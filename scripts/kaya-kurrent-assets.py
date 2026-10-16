#!/usr/bin/env python3
"""
Builds the Kaya Kurrent template assets in public/kaya-kurrent/ from the user's reference
templates in assets-src/kaya-kurrent/. Baked-in text is removed (filled from the surrounding
pixels) so the templates can draw new text in code.

    python3 scripts/kaya-kurrent-assets.py
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src" / "kaya-kurrent"
OUT = ROOT / "public" / "kaya-kurrent"
(OUT / "photos").mkdir(parents=True, exist_ok=True)


def load(name):
    return np.array(Image.open(SRC / name).convert("RGB")).astype(np.float64)


def box_blur(a, r):
    """Mean filter of radius r (separable, via cumulative sums)."""
    def blur1(x, axis):
        pad = [(0, 0)] * x.ndim
        pad[axis] = (r + 1, r)
        c = np.cumsum(np.pad(x, pad, mode="edge"), axis=axis)
        n = x.shape[axis]
        hi = np.take(c, range(2 * r + 1, 2 * r + 1 + n), axis=axis)
        lo = np.take(c, range(0, n), axis=axis)
        return (hi - lo) / (2 * r + 1)

    return blur1(blur1(a, 0), 1)


def dilate(mask, r):
    return box_blur(mask.astype(np.float64), r) > 1e-6


def fill(img, mask):
    """Replace masked pixels with a smooth estimate from nearby unmasked pixels."""
    known = (~mask).astype(np.float64)
    out = img.copy()
    todo = mask.copy()
    for r in (2, 4, 8, 16, 32, 64, 128):
        w = box_blur(known, r)
        ok = todo & (w > 0.02)
        if ok.any():
            for ch in range(3):
                est = box_blur(img[:, :, ch] * known, r) / np.maximum(w, 1e-9)
                out[:, :, ch][ok] = est[ok]
            todo &= ~ok
        if not todo.any():
            break
    return out


def box_mask(shape, boxes, test):
    m = np.zeros(shape[:2], bool)
    for x0, y0, x1, y1 in boxes:
        m[y0:y1, x0:x1] = True
    return m & test


def save(arr, name, quality=None):
    im = Image.fromarray(np.clip(np.round(arr), 0, 255).astype(np.uint8))
    if name.endswith(".jpg"):
        im.save(OUT / name, quality=quality or 92, optimize=True)
    else:
        im.save(OUT / name, optimize=True)
    print("wrote", OUT / name)


# --- Breaking News: black panel with a large, faint geometric "k" and dot ---------------------
# The panel is two flat tones. Text in the reference covers parts of the shape, so the square
# version is repaired with its straight edges (stem + crossbar), and the vertical version reuses
# the square's shape for its upper half (same "k", scaled 0.783) and its own pixels below.
def two_tone(img):
    lum = img.mean(axis=2)
    tone = np.median(img[(lum > 6) & (lum < 30)], axis=0)
    foreign = dilate(lum > tone.mean() + 8, 9)
    out = fill(img, foreign)
    return box_blur(out.mean(axis=2), 1) > tone.mean() / 2, tone


sq = load("breaking-post-reference.jpg")[1287:]
st = load("breaking-story-reference.jpg")[1126:]
sq_mask, sq_tone = two_tone(sq)
st_mask, st_tone = two_tone(st)

STEM = (953, 1193)  # square panel coords
CROSSBAR = (822, 953, 133, 262)
yy, xx = np.mgrid[0 : sq_mask.shape[0], 0 : sq_mask.shape[1]]
stem = (xx >= STEM[0]) & (xx < STEM[1])
crossbar = (xx >= CROSSBAR[0]) & (xx < CROSSBAR[1]) & (yy >= CROSSBAR[2]) & (yy < CROSSBAR[3])
zone = (yy < 46) & (xx >= 560) & (xx < 1440)  # under the Breaking/News tab
sq_mask[zone] = stem[zone]
zone = (yy >= 120) & (yy < 310) & (xx >= 790) & (xx < STEM[1])  # under the headline
sq_mask[zone] = (stem | crossbar)[zone]

# Vertical: map story pixels into square coordinates for the upper part of the "k".
S, (SX, SY), (TX, TY) = 0.783, (1529, 100), (791, 105)
k_only = sq_mask.copy()
k_only[:, :700] = False
sy, sx = np.mgrid[0 : st_mask.shape[0], 0 : st_mask.shape[1]]
qx = np.clip(((sx - TX) / S + SX).round().astype(int), 0, k_only.shape[1] - 1)
qy = ((sy - TY) / S + SY).round().astype(int)
inside = (qy >= 0) & (qy < k_only.shape[0])
upper = np.zeros_like(st_mask)
upper[inside] = k_only[qy[inside], qx[inside]]
SPLIT = 520
st_mask[:SPLIT] = upper[:SPLIT]


def erode(mask, r):
    return box_blur(mask.astype(np.float64), r) > 1 - 1e-6


def save_panel(mask, tone, name):
    # Close then open: removes hairline seams left where text halos were filled in.
    mask = erode(dilate(mask, 2), 2)
    mask = dilate(erode(mask, 2), 2)
    soft = box_blur(mask.astype(np.float64), 1)[..., None]
    save(soft * tone, name)


save_panel(sq_mask, sq_tone, "breaking-post-panel.png")
save_panel(st_mask, st_tone, "breaking-story-panel.png")

# Sample photo (the Speaker), cropped from each reference.
for src, (x0, y0, x1, y1), name in [
    ("breaking-post-reference.jpg", (101, 90, 1899, 1287), "photos/speaker-post.jpg"),
    ("breaking-story-reference.jpg", (87, 83, 1038, 1126), "photos/speaker-story.jpg"),
]:
    save(load(src)[y0:y1, x0:x1], name)


# --- Celebration (calendar): remove the dates, message, sticky-note year and wordmark ------
def celebration(src, boxes, name):
    """boxes: (x0, y0, x1, y1, kind); kind "dark:<lum>" removes darker pixels, "light:<lum>" brighter ones."""
    img = load(src)
    lum = img.mean(axis=2)
    m = np.zeros(lum.shape, bool)
    for x0, y0, x1, y1, kind in boxes:
        test, level = kind.split(":")
        sel = lum < float(level) if test == "dark" else lum > float(level)
        part = np.zeros(lum.shape, bool)
        part[y0:y1, x0:x1] = sel[y0:y1, x0:x1]
        part = dilate(part, 3)
        part[:y0, :] = part[y1:, :] = False
        part[:, :x0] = part[:, x1:] = False
        m |= part
    save(fill(img, m), name, quality=94)


celebration(
    "celebration-story-reference.jpg",
    [
        (140, 185, 660, 325, "dark:60"),  # 28 October (black on red)
        (140, 1685, 730, 1820, "dark:60"),  # 01 November
        (296, 540, 735, 970, "dark:110"),  # HAPPY NEW YEAR (black on paper)
        (140, 505, 262, 650, "dark:90"),  # 2027 (sticky note)
        (928, 368, 944, 396, "light:120"),  # stray mark in the template
    ],
    "celebration-story-bg.jpg",
)
celebration(
    "celebration-post-reference.jpg",
    [
        (180, 245, 850, 415, "dark:60"),  # 28 October
        (425, 575, 1190, 1335, "dark:110"),  # HAPPY NEW YEAR
        (205, 525, 360, 705, "dark:90"),  # 2027 (sticky note)
        (210, 1815, 670, 1915, "light:120"),  # kaya kurrent wordmark
        (1298, 345, 1314, 385, "light:120"),  # stray mark in the template
    ],
    "celebration-post-bg.jpg",
)

# --- "kaya kurrent" blackletter wordmark (white on red in the calendar post) -----------------
img = load("celebration-post-reference.jpg")
x0, y0, x1, y1 = 212, 1818, 668, 1912
crop = img[y0:y1, x0:x1]
red_g = 41.0
alpha = np.clip((crop[:, :, 1] - red_g) / (255 - red_g), 0, 1)
ys, xs = np.where(alpha > 0.1)
alpha = alpha[ys.min() - 2 : ys.max() + 3, xs.min() - 2 : xs.max() + 3]
rgba = np.zeros(alpha.shape + (4,), np.uint8)
rgba[..., 3] = (alpha * 255).astype(np.uint8)
Image.fromarray(rgba, "RGBA").save(OUT / "wordmark.png", optimize=True)
print("wrote", OUT / "wordmark.png", rgba.shape[1], "x", rgba.shape[0])


# --- Logos supplied by the user (transparent 2000×2000 webp) ---------------------------------
def logo_alpha(src):
    a = np.array(Image.open(SRC / src).convert("RGBA")).astype(np.float64)
    ink = a[..., 3] / 255 * np.clip((250 - a[..., :3].mean(axis=2)) / 245, 0, 1)
    ys, xs = np.where(ink > 0.05)
    m = 8
    return ink[ys.min() - m : ys.max() + m + 1, xs.min() - m : xs.max() + m + 1]


def save_alpha(alpha, name):
    rgba = np.zeros(alpha.shape + (4,), np.uint8)
    rgba[..., 3] = (np.clip(alpha, 0, 1) * 255).round().astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(OUT / name, optimize=True)
    print("wrote", OUT / name, rgba.shape[1], "x", rgba.shape[0])


for src, name in [
    ("logo-k-lowercase.webp", "logo-k-lowercase.png"),
    ("logo-K-uppercase.webp", "logo-K-uppercase.png"),
    ("logo-wordmark-stacked.webp", "logo-wordmark-stacked.png"),
]:
    save_alpha(logo_alpha(src), name)

# "k." as used on the templates: the lowercase k plus the dot (position/size measured from
# the templates, scale 2.707 relative to the 180 px glyph cut from the vertical News template).
from PIL import ImageDraw  # noqa: E402

k = logo_alpha("logo-k-lowercase.webp")
S4 = 4
dcx, dcy, r = 9 + (136.5 - 6) * 2.707, 8 + (174 - 6) * 2.707, 11.3 * 2.707
W = int(np.ceil(dcx + r + 10))
big = Image.new("L", (W * S4, k.shape[0] * S4), 0)
big.paste(Image.fromarray((k * 255).astype(np.uint8)).resize((k.shape[1] * S4, k.shape[0] * S4), Image.LANCZOS), (0, 0))
ImageDraw.Draw(big).ellipse([(dcx - r) * S4, (dcy - r) * S4, (dcx + r) * S4, (dcy + r) * S4], fill=255)
save_alpha(np.array(big.resize((W, k.shape[0]), Image.LANCZOS)).astype(np.float64) / 255, "logo-k.png")


# --- Cover (photo + headline) -------------------------------------------------------------------
# Vertical: the user's frame template with its black shapes. The photo, black panel, logo and
# handle are drawn in code, so the logo and the handle ("@kayacurrent" in the reference) are removed.
st = load("cover-story-reference.jpg").mean(axis=2)
st[82:282, 100:262] = 255  # logo (on white)
st[:, -1] = st[:, -2]  # JPEG edge column
# Handle: white text on the black curve. Only clear pixels right of the curve's edge.
ys = np.array([1775, 1800, 1825, 1850, 1915, 1940, 1965, 1990])
xs = np.array([np.argmax(st[y, 560:] < 128) + 560 for y in ys])
edge = np.polyfit(ys, xs, 2)
for y in range(1845, 1912):
    st[y, int(np.polyval(edge, y)) + 2 : 975] = 0
save(np.repeat(st[..., None], 3, axis=2), "cover-story-bg.png")

# Reference photos for the regression items (the panel area is covered again in the render).
save(load("cover-post-reference.jpg")[84:1332, 69:1432], "photos/cover-reference-photographer.jpg")
save(load("cover-story-reference.jpg")[91:1706, 110:1003], "photos/cover-reference-united.jpg")
