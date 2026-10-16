#!/usr/bin/env node
/**
 * Builds a Kaya Kurrent posting plan: captions for every platform, the time slots and JPEG copies of the rendered
 * cards (Instagram and Threads need public JPEG links; the repo is public, so the images are committed and linked
 * from raw.githubusercontent.com).
 *
 *   npm run kk:plan -- <YYYY-MM-DD> <HH:MM> <slug> [slug…]            # first post at HH:MM Malawi time, then every 45 min
 *   npm run kk:plan -- <YYYY-MM-DD> 07:37,08:28,09:09 <slug> <slug> <slug>  # or one time per slug
 *   npm run kk:plan -- 2026-10-17:opportunities 11:11,12:12 opp-a opp-b    # a second plan for the same day
 *
 * News stories (stories/<slug>.ts): Facebook gets the cover + the full story; Instagram/Threads a carousel (cover +
 * news card) with the lede; X the lede. No links. Opportunities (slugs starting "opp-"): the square card on every
 * platform with the crawl report's caption from opportunities/captions.ts; the link only on Facebook and Threads.
 * Public Notices (slugs starting "notice-"): the square card everywhere, caption from notices/captions.ts, with
 * "Full notice: <link>" on Facebook and Threads only.
 *
 * The user likes "patterned" times (07:37, 08:28, 10:10, 2:22; 11:11 for Opportunities) about 45 minutes apart,
 * not a rigid grid — pick the times and pass them as a list.
 *
 * Render first (`npm run kk -- <slug…>`). Writes posting/kaya-kurrent/<name>.json (the plan, which
 * scripts/kk-post.mjs reads; edit captions there) and <name>.md (the review sheet for the user).
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const SPACING_MIN = 45;
const SWIPE = "Swipe for the full story ➡️"; // Instagram and Threads, where the post is a carousel
const TZ_OFFSET = "+02:00"; // Malawi (CAT), no daylight saving
const REPO_RAW = "https://raw.githubusercontent.com/twmp-git/Remotion";
const HASHTAGS = "#KayaKurrent #NewsNowForThen";
const OPP_HASHTAGS = "#KayaKurrent #Opportunities"; // the user's: no "OPPORTUNITY OF THE DAY" line, these tags
const NOTICE_HASHTAGS = "#KayaKurrent #PublicNotice";
// Country flag that opens each caption. Malawi unless listed here.
const FLAGS = {
  "pope-leo-surgery": "🇻🇦",
  "ethiopia-mekelle-flights": "🇪🇹",
  "un-budget-2027": "🇺🇳",
};

const [nameArg, start, ...slugs] = process.argv.slice(2);
const [date, label] = (nameArg ?? "").split(":");
const name = label ? `${date}-${label}` : date;
const times = (start ?? "").split(",");
if (
  !/^\d{4}-\d{2}-\d{2}$/.test(date ?? "") ||
  !times.every((t) => /^\d{2}:\d{2}$/.test(t)) ||
  slugs.length === 0 ||
  (times.length > 1 && times.length !== slugs.length)
) {
  console.error("Usage: npm run kk:plan -- <YYYY-MM-DD>[:label] <HH:MM | HH:MM,HH:MM,… one per slug> <slug> [slug…]");
  process.exit(1);
}

const planPath = `posting/kaya-kurrent/${name}.json`;
if (existsSync(planPath) && JSON.parse(readFileSync(planPath, "utf8")).posts.some((p) => Object.keys(p.posted).length)) {
  console.error(`${planPath} already has posted or scheduled items — use a new label instead of overwriting it.`);
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
const url = (file) => `${REPO_RAW}/${branch}/${dir}/${file}`;

const importFirst = async (file) => Object.values(await import(pathToFileURL(file).href))[0];
const OPPORTUNITIES = await importFirst("src/compositions/KayaKurrent/opportunities/index.ts");
const OPPORTUNITY_CAPTIONS = await importFirst("src/compositions/KayaKurrent/opportunities/captions.ts");
const NOTICES = await importFirst("src/compositions/KayaKurrent/notices/index.ts");
const NOTICE_CAPTIONS = await importFirst("src/compositions/KayaKurrent/notices/captions.ts");

const newsPost = async (slug) => {
  const story = await importFirst(`src/compositions/KayaKurrent/stories/${slug}.ts`);
  const flag = FLAGS[slug] ?? "🇲🇼";
  const lede = plain(story.lede);
  toJpeg(`out/kaya-kurrent/${slug}-cover-post.png`, `${dir}/${slug}-cover.jpg`);
  toJpeg(`out/kaya-kurrent/${slug}-post.png`, `${dir}/${slug}-card.jpg`);
  return {
    kind: "news",
    title: story.headline,
    // Facebook: the cover only, full story in the caption. Elsewhere: cover + news card, lede as the caption.
    images: { cover: url(`${slug}-cover.jpg`), card: url(`${slug}-card.jpg`) },
    captions: {
      facebook: [`${flag} ${lede}`, ...story.body.map(plain), HASHTAGS].join("\n\n"),
      instagram: `${flag} ${lede}\n\n${SWIPE}\n\n${HASHTAGS}`,
      threads: `${flag} ${lede}\n\n${SWIPE}\n\n${HASHTAGS}`,
      x: `${flag} ${lede}\n\n${HASHTAGS}`,
    },
  };
};

const opportunityPost = (slug) => {
  const entry = OPPORTUNITIES.find((o) => o.slug === slug);
  const info = OPPORTUNITY_CAPTIONS[slug];
  if (!entry || !info) throw new Error(`${slug}: missing from opportunities/index.ts or opportunities/captions.ts`);
  if (info.hold) throw new Error(`${slug} is on hold: ${info.hold}`);
  toJpeg(`out/kaya-kurrent/${slug}-post.png`, `${dir}/${slug}.jpg`);
  // The report's caption without its "OPPORTUNITY OF THE DAY" line and #OpportunitiesDesk tag. Links only where
  // they're clickable (Facebook, Threads); Instagram and X keep "Full details and link on our page."
  const base = info.caption.replace(/^OPPORTUNITY OF THE DAY\n/, "").replace(/\n#OpportunitiesDesk$/, "");
  const noLink = `${base}\n${OPP_HASHTAGS}`;
  const withLink = `${base.replace(/ Full details and link on our page\./, "")}\nApply: ${info.link}\n${OPP_HASHTAGS}`;
  return {
    kind: "opportunity",
    title: entry.title.replace(/\n/g, " "),
    images: { cover: url(`${slug}.jpg`) },
    captions: { facebook: withLink, instagram: noLink, threads: withLink, x: noLink },
  };
};

const noticePost = (slug) => {
  const entry = NOTICES.find((n) => n.slug === slug);
  const info = NOTICE_CAPTIONS[slug];
  if (!entry || !info) throw new Error(`${slug}: missing from notices/index.ts or notices/captions.ts`);
  toJpeg(`out/kaya-kurrent/${slug}-post.png`, `${dir}/${slug}.jpg`);
  // The card on every platform; "Full notice: <link>" only where links are clickable (Facebook, Threads).
  const withLink = `${info.caption} Full notice: ${info.link}\n\n${NOTICE_HASHTAGS}`;
  const noLink = `${info.caption}\n\n${NOTICE_HASHTAGS}`;
  return {
    kind: "notice",
    title: entry.title.replace(/\n/g, " "),
    images: { cover: url(`${slug}.jpg`) },
    captions: { facebook: withLink, instagram: noLink, threads: withLink, x: noLink },
  };
};

const toMinutes = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const posts = [];
for (const [i, slug] of slugs.entries()) {
  const minutes = times.length > 1 ? toMinutes(times[i]) : toMinutes(times[0]) + i * SPACING_MIN;
  const time = `${date}T${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:00${TZ_OFFSET}`;
  const post = slug.startsWith("opp-")
    ? opportunityPost(slug)
    : slug.startsWith("notice-")
      ? noticePost(slug)
      : await newsPost(slug);
  posts.push({ slug, time, ...post, posted: {} });
  if (xLength(post.captions.x) > 280) console.warn(`⚠ ${slug}: X caption is ${xLength(post.captions.x)} characters (limit 280)`);
  if (post.captions.threads.length > 500) console.warn(`⚠ ${slug}: Threads caption is over 500 characters`);
}

writeFileSync(planPath, JSON.stringify({ date, approved: false, posts }, null, 2) + "\n");

// Review sheet for the user.
const clock = (iso) => iso.slice(11, 16);
const quote = (s) => s.split("\n").map((l) => `> ${l}`);
const md = [
  `# Kaya Kurrent posts — ${name}`,
  "",
  "Times are Malawi time. Facebook posts are scheduled in Meta Business Suite; Instagram, Threads and X go out at the",
  "same time after you approve. News: Facebook gets the cover + full story, the others the cover + news card.",
  "Opportunities: the card everywhere, with the link on Facebook and Threads only.",
  "",
  ...posts.flatMap((p) => [
    `## ${clock(p.time)} — ${p.title}`,
    "",
    ...(p.captions.instagram === p.captions.x
      ? [`**Instagram / X** (${xLength(p.captions.x)} of 280 characters on X)`, "", ...quote(p.captions.instagram), ""]
      : ["**Instagram / Threads**", "", ...quote(p.captions.instagram), "", `**X** (${xLength(p.captions.x)} of 280)`, "", ...quote(p.captions.x), ""]),
    ...(p.captions.threads === p.captions.facebook
      ? ["**Facebook / Threads**", "", ...quote(p.captions.facebook), ""]
      : ["**Facebook**", "", ...quote(p.captions.facebook), ""]),
  ]),
].join("\n");
writeFileSync(`posting/kaya-kurrent/${name}.md`, md);

for (const p of posts) console.log(`${clock(p.time)}  ${p.slug}  (X ${xLength(p.captions.x)}/280)`);
console.log(`\nWrote ${planPath}, ${name}.md and the JPEGs in ${dir}/`);
