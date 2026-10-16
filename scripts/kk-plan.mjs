#!/usr/bin/env node
/**
 * Builds a Kaya Kurrent posting plan from the story files: captions for every platform, the time slots and
 * JPEG copies of the rendered cards (Instagram and Threads need public JPEG links; the repo is public, so the
 * images are committed and linked from raw.githubusercontent.com).
 *
 *   npm run kk:plan -- <YYYY-MM-DD> <HH:MM> <slug> [slug…]      # first post at HH:MM Malawi time, then every 45 min
 *
 * Render the stories first (`npm run kk -- <slug…>`). Writes posting/kaya-kurrent/<date>.json (the plan, which
 * scripts/kk-post.mjs reads; edit captions there) and <date>.md (the review sheet for the user).
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const SPACING_MIN = 45;
const TZ_OFFSET = "+02:00"; // Malawi (CAT), no daylight saving
const REPO_RAW = "https://raw.githubusercontent.com/twmp-git/Remotion";
const HASHTAGS = "#KayaKurrent #NewsNowForThen";
// Country flag that opens each caption. Malawi unless listed here.
const FLAGS = {
  "pope-leo-surgery": "🇻🇦",
  "ethiopia-mekelle-flights": "🇪🇹",
  "un-budget-2027": "🇺🇳",
};

const [date, start, ...slugs] = process.argv.slice(2);
if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? "") || !/^\d{2}:\d{2}$/.test(start ?? "") || slugs.length === 0) {
  console.error("Usage: npm run kk:plan -- <YYYY-MM-DD> <HH:MM> <slug> [slug…]");
  process.exit(1);
}

const branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { encoding: "utf8" }).trim();
const dir = `posting/kaya-kurrent/${date}`;
mkdirSync(dir, { recursive: true });

const plain = (s) => s.replace(/\*\*/g, "");

/** X counts most characters as 1, CJK/emoji as 2 and a flag (two regional indicators) as 2. */
const xLength = (s) => {
  let n = 0;
  for (const ch of s.replace(/\p{Regional_Indicator}{2}/gu, "🏳")) {
    const c = ch.codePointAt(0);
    n += c <= 0x10ff || (c >= 0x2000 && c <= 0x200d) || (c >= 0x2010 && c <= 0x201f) || (c >= 0x2032 && c <= 0x2037) ? 1 : 2;
  }
  return n;
};

const toJpeg = (png, jpg) => {
  if (!existsSync(png)) throw new Error(`${png} is missing — run: npm run kk -- ${slugs.join(" ")}`);
  execFileSync("python3", [
    "-c",
    "import sys; from PIL import Image; Image.open(sys.argv[1]).convert('RGB').resize((1440, 1440), Image.LANCZOS).save(sys.argv[2], quality=92, optimize=True)",
    png,
    jpg,
  ]);
};

const [h, m] = start.split(":").map(Number);
const posts = [];
for (const [i, slug] of slugs.entries()) {
  const file = `src/compositions/KayaKurrent/stories/${slug}.ts`;
  const story = Object.values(await import(pathToFileURL(file).href))[0];
  const flag = FLAGS[slug] ?? "🇲🇼";
  const lede = plain(story.lede);
  const short = `${flag} ${lede}\n\n${HASHTAGS}`;
  const full = [`${flag} ${lede}`, ...story.body.map(plain), HASHTAGS].join("\n\n");

  const minutes = h * 60 + m + i * SPACING_MIN;
  const time = `${date}T${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:00${TZ_OFFSET}`;

  for (const [png, jpg] of [
    [`out/kaya-kurrent/${slug}-cover-post.png`, `${dir}/${slug}-cover.jpg`],
    [`out/kaya-kurrent/${slug}-post.png`, `${dir}/${slug}-card.jpg`],
  ]) {
    toJpeg(png, jpg);
  }
  const url = (name) => `${REPO_RAW}/${branch}/${dir}/${name}`;
  posts.push({
    slug,
    headline: story.headline,
    time,
    // Facebook: the cover only, full story in the caption. Elsewhere: cover + news card, lede as the caption.
    images: { cover: url(`${slug}-cover.jpg`), card: url(`${slug}-card.jpg`) },
    captions: { facebook: full, instagram: short, threads: short, x: short },
    posted: {},
  });
  if (xLength(short) > 280) console.warn(`⚠ ${slug}: X caption is ${xLength(short)} characters (limit 280)`);
  if (short.length > 500) console.warn(`⚠ ${slug}: Threads caption is over 500 characters`);
}

writeFileSync(`posting/kaya-kurrent/${date}.json`, JSON.stringify({ date, approved: false, posts }, null, 2) + "\n");

// Review sheet for the user.
const clock = (iso) => iso.slice(11, 16);
const md = [
  `# Kaya Kurrent posts — ${date}`,
  "",
  `Every ${SPACING_MIN} minutes from ${start} (Malawi time). Facebook: the cover + the full story as the caption, scheduled`,
  "in Meta Business Suite. Instagram, Threads and X: cover + news card, the first paragraph as the caption, posted at the",
  "same time after you approve.",
  "",
  ...posts.flatMap((p) => [
    `## ${clock(p.time)} — ${p.headline}`,
    "",
    `**Instagram / Threads / X** (${xLength(p.captions.x)} of 280 characters on X)`,
    "",
    ...p.captions.instagram.split("\n").map((l) => `> ${l}`),
    "",
    "**Facebook**",
    "",
    ...p.captions.facebook.split("\n").map((l) => `> ${l}`),
    "",
  ]),
].join("\n");
writeFileSync(`posting/kaya-kurrent/${date}.md`, md);

for (const p of posts) console.log(`${clock(p.time)}  ${p.slug}  (X ${xLength(p.captions.x)}/280)`);
console.log(`\nWrote posting/kaya-kurrent/${date}.json, ${date}.md and ${posts.length * 2} JPEGs in ${dir}/`);
