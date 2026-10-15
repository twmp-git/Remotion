#!/usr/bin/env node
/**
 * Renders the Kaya Kurrent news cards to out/kaya-kurrent/<slug>-post.png and <slug>-story.png.
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

const ids = run(["compositions", BUNDLE, "--quiet"])
  .split(/\s+/)
  .filter((id) => /^KK-.+-(Post|Story)$/.test(id))
  .filter((id) => slugs.length === 0 || slugs.includes(id.replace(/^KK-|-(Post|Story)$/g, "")));

if (ids.length === 0) {
  console.error(`No Kaya Kurrent stories found${slugs.length ? ` for: ${slugs.join(", ")}` : ""}.`);
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
for (const id of ids) {
  const slug = id.replace(/^KK-|-(Post|Story)$/g, "");
  const file = `${OUT}/${slug}-${id.endsWith("-Post") ? "post" : "story"}.png`;
  run(["still", BUNDLE, id, file, "--log=error"], { stdio: ["ignore", "pipe", "inherit"] });
  console.log(`✓ ${file}`);
}
