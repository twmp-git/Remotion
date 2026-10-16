#!/usr/bin/env node
/**
 * Renders the Kaya Kurrent news cards to out/kaya-kurrent/<slug>-post.png and <slug>-story.png
 * (plus <slug>-cover-post.png / -cover-story.png when the slug has a cover).
 *
 *   npm run kk                       # every story
 *   npm run kk -- milk-price-relief  # one or more slugs
 */
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const BUNDLE = "out/.kk-bundle";
const OUT = "out/kaya-kurrent";
const slugs = process.argv.slice(2);

const run = (args, opts = {}) => {
  const res = spawnSync("npx", ["remotion", ...args], { encoding: "utf8", ...opts });
  if (res.status !== 0) {
    console.error(res.stdout, res.stderr);
    process.exit(res.status ?? 1);
  }
  return res.stdout;
};

console.log("Bundling…");
run(["bundle", `--out-dir=${BUNDLE}`, "--log=error"]);

// KK-<slug>-Post / -Story, and covers: KK-<slug>-Cover-Post / -Cover-Story.
const parse = (id) => {
  const m = /^KK-(.+?)(-Cover)?-(Post|Story)$/.exec(id);
  return m && { slug: m[1], cover: Boolean(m[2]), kind: m[3].toLowerCase() };
};

const ids = run(["compositions", BUNDLE, "--quiet"])
  .split(/\s+/)
  .filter((id) => parse(id))
  .filter((id) => slugs.length === 0 || slugs.includes(parse(id).slug));

if (ids.length === 0) {
  console.error(`No Kaya Kurrent stories found${slugs.length ? ` for: ${slugs.join(", ")}` : ""}.`);
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
for (const id of ids) {
  const { slug, cover, kind } = parse(id);
  const file = `${OUT}/${slug}${cover ? "-cover" : ""}-${kind}.png`;
  run(["still", BUNDLE, id, file, "--log=error"], { stdio: ["ignore", "pipe", "inherit"] });
  console.log(`✓ ${file}`);
}
