#!/usr/bin/env node
/**
 * Posts a Kaya Kurrent plan (made by scripts/kk-plan.mjs) to Facebook, Instagram, Threads and X.
 *
 *   npm run kk:post -- <plan.json> check                        # images reachable, caption limits, times
 *   npm run kk:post -- <plan.json> schedule-facebook [--dry-run] # every post → Facebook, scheduled at its time
 *   npm run kk:post -- <plan.json> publish <slug> [instagram|threads|x …] [--dry-run]   # posts now (default: all three)
 *
 * Facebook: the cover only, the full story as the caption, scheduled so the user can edit it in Meta Business Suite.
 * Instagram/Threads/X can't be scheduled through their APIs, so they are published at the slot time.
 * Nothing is sent unless the plan has "approved": true (the user approved the captions). Results (post ids) are
 * written back into the plan, and a platform that already has an id is never posted twice.
 *
 * Auth: the network proxy adds the Page token to graph.facebook.com and the Threads token to graph.threads.com
 * (Node's fetch only goes through that proxy with NODE_USE_ENV_PROXY=1, which `npm run kk:post` sets).
 * X uses OAuth 1.0a with X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET from the environment.
 */
import crypto from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const FB = "https://graph.facebook.com/v26.0";
const THREADS = "https://graph.threads.com/v1.0";
const PAGE_ID = "1428667776996790";
const IG_ID = "17841426611925261";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const [planPath, command, ...rest] = args.filter((a) => a !== "--dry-run");
if (!planPath || !command) {
  console.error("Usage: npm run kk:post -- <plan.json> check | schedule-facebook | publish <slug> [platform…] [--dry-run]");
  process.exit(1);
}
const plan = JSON.parse(readFileSync(planPath, "utf8"));
const save = () => writeFileSync(planPath, JSON.stringify(plan, null, 2) + "\n");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const call = async (method, url, params = {}) => {
  const body = new URLSearchParams(params);
  const res = await fetch(method === "GET" ? `${url}?${body}` : url, method === "GET" ? {} : { method, body });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(`${method} ${url.split("?")[0]} → ${res.status} ${JSON.stringify(json.error ?? json)}`);
  return json;
};

/** "approved": true covers every platform; {"facebook": true} approves one (e.g. scheduling for review in Business Suite). */
const requireApproved = (platform) => {
  if (!dryRun && plan.approved !== true && plan.approved?.[platform] !== true) {
    console.error(`${platform} is not approved in this plan yet. Set "approved" once the user has approved the captions.`);
    process.exit(1);
  }
};
/** News: cover + news card (a carousel). Opportunities: one image. */
const imagesOf = (post) => [post.images.cover, post.images.card].filter(Boolean);

// --- Facebook ------------------------------------------------------------------------------------------------
const scheduleFacebook = async (post) => {
  const when = Math.floor(new Date(post.time).getTime() / 1000);
  if (when < Date.now() / 1000 + 11 * 60) throw new Error(`${post.slug}: ${post.time} is less than 11 minutes away`);
  if (dryRun) return console.log(`[dry run] Facebook ${post.slug} at ${post.time}: cover + ${post.captions.facebook.length}-character caption`);
  // A Page post with the photo attached, not a scheduled photo (POST /photos with a schedule): Meta Business Suite
  // hides scheduled photos, but lists these under Content → Scheduled and in Planner, where the user reviews them.
  const photo = await call("POST", `${FB}/${PAGE_ID}/photos`, { url: post.images.cover, published: "false", temporary: "true" });
  const { id } = await call("POST", `${FB}/${PAGE_ID}/feed`, {
    message: post.captions.facebook,
    "attached_media[0]": JSON.stringify({ media_fbid: photo.id }),
    published: "false",
    scheduled_publish_time: String(when),
  });
  post.posted.facebook = { scheduled: post.time, post_id: id };
  save();
  console.log(`✓ Facebook ${post.slug} scheduled for ${post.time} (${id})`);
};

// --- Instagram -----------------------------------------------------------------------------------------------
const waitFor = async (check, label) => {
  for (let i = 0; i < 30; i++) {
    const status = await check();
    if (status === "FINISHED") return;
    if (status === "ERROR" || status === "EXPIRED") throw new Error(`${label}: container status ${status}`);
    await sleep(5000);
  }
  throw new Error(`${label}: still processing after 150 s`);
};

const publishInstagram = async (post) => {
  const images = imagesOf(post);
  if (dryRun) return console.log(`[dry run] Instagram ${post.slug}: ${images.length} image(s), caption ${post.captions.instagram.length} characters`);
  let id;
  if (images.length === 1) {
    ({ id } = await call("POST", `${FB}/${IG_ID}/media`, { image_url: images[0], caption: post.captions.instagram }));
  } else {
    const children = [];
    for (const image_url of images) {
      const child = (await call("POST", `${FB}/${IG_ID}/media`, { image_url, is_carousel_item: "true" })).id;
      // Each slide must finish processing before the carousel is made from it.
      await waitFor(async () => (await call("GET", `${FB}/${child}`, { fields: "status_code" })).status_code, "Instagram slide");
      children.push(child);
    }
    ({ id } = await call("POST", `${FB}/${IG_ID}/media`, {
      media_type: "CAROUSEL",
      children: children.join(","),
      caption: post.captions.instagram,
    }));
  }
  await waitFor(async () => (await call("GET", `${FB}/${id}`, { fields: "status_code" })).status_code, "Instagram");
  const media = await call("POST", `${FB}/${IG_ID}/media_publish`, { creation_id: id });
  const { permalink } = await call("GET", `${FB}/${media.id}`, { fields: "permalink" });
  post.posted.instagram = { id: media.id, permalink };
  save();
  console.log(`✓ Instagram ${post.slug}: ${permalink}`);
};

// --- Threads -------------------------------------------------------------------------------------------------
const publishThreads = async (post) => {
  const images = imagesOf(post);
  if (dryRun) return console.log(`[dry run] Threads ${post.slug}: ${images.length} image(s), text ${post.captions.threads.length}/500 characters`);
  let id;
  if (images.length === 1) {
    ({ id } = await call("POST", `${THREADS}/me/threads`, { media_type: "IMAGE", image_url: images[0], text: post.captions.threads }));
  } else {
    const children = [];
    for (const image_url of images) {
      const child = (await call("POST", `${THREADS}/me/threads`, { media_type: "IMAGE", image_url, is_carousel_item: "true" })).id;
      // Threads rejects a carousel whose items haven't finished processing ("Invalid Carousel Children").
      await waitFor(async () => (await call("GET", `${THREADS}/${child}`, { fields: "status" })).status, "Threads slide");
      children.push(child);
    }
    ({ id } = await call("POST", `${THREADS}/me/threads`, {
      media_type: "CAROUSEL",
      children: children.join(","),
      text: post.captions.threads,
    }));
  }
  await waitFor(async () => (await call("GET", `${THREADS}/${id}`, { fields: "status" })).status, "Threads");
  const thread = await call("POST", `${THREADS}/me/threads_publish`, { creation_id: id });
  const { permalink } = await call("GET", `${THREADS}/${thread.id}`, { fields: "permalink" });
  post.posted.threads = { id: thread.id, permalink };
  save();
  console.log(`✓ Threads ${post.slug}: ${permalink}`);
};

// --- X (OAuth 1.0a) ------------------------------------------------------------------------------------------
const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
const oauthHeader = (method, url) => {
  const { X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET } = process.env;
  if (!X_API_KEY || !X_API_SECRET || !X_ACCESS_TOKEN || !X_ACCESS_SECRET) throw new Error("X keys are not set");
  const o = {
    oauth_consumer_key: X_API_KEY,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_token: X_ACCESS_TOKEN,
    oauth_version: "1.0",
  };
  // JSON and multipart bodies are not part of the signature.
  const params = Object.keys(o).sort().map((k) => `${enc(k)}=${enc(o[k])}`).join("&");
  const base = [method, enc(url), enc(params)].join("&");
  o.oauth_signature = crypto.createHmac("sha1", `${enc(X_API_SECRET)}&${enc(X_ACCESS_SECRET)}`).update(base).digest("base64");
  return "OAuth " + Object.keys(o).sort().map((k) => `${enc(k)}="${enc(o[k])}"`).join(", ");
};
const xCall = async (url, body) => {
  const res = await fetch(url, { method: "POST", headers: { Authorization: oauthHeader("POST", url) }, body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`POST ${url} → ${res.status} ${JSON.stringify(json)}`);
  return json;
};

const publishX = async (post) => {
  if (dryRun) return console.log(`[dry run] X ${post.slug}: ${imagesOf(post).length} image(s), text "${post.captions.x.slice(0, 40)}…"`);
  const media_ids = [];
  for (const image of imagesOf(post)) {
    const form = new FormData();
    form.append("media", new Blob([await (await fetch(image)).arrayBuffer()], { type: "image/jpeg" }), "image.jpg");
    form.append("media_category", "tweet_image");
    const json = await xCall("https://api.x.com/2/media/upload", form);
    media_ids.push(json.data?.id ?? json.media_id_string);
  }
  const url = "https://api.x.com/2/tweets";
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: oauthHeader("POST", url), "Content-Type": "application/json" },
    body: JSON.stringify({ text: post.captions.x, media: { media_ids } }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`POST ${url} → ${res.status} ${JSON.stringify(json)}`);
  post.posted.x = { id: json.data.id, permalink: `https://x.com/kayakurrent/status/${json.data.id}` };
  save();
  console.log(`✓ X ${post.slug}: ${post.posted.x.permalink}`);
};

// --- Commands ------------------------------------------------------------------------------------------------
const PUBLISHERS = { instagram: publishInstagram, threads: publishThreads, x: publishX };

if (command === "check") {
  let ok = true;
  for (const post of plan.posts) {
    for (const url of Object.values(post.images)) {
      const res = await fetch(url, { method: "HEAD" });
      if (!res.ok || !String(res.headers.get("content-type")).startsWith("image/jpeg")) {
        ok = false;
        console.log(`✗ ${post.slug}: ${url} → ${res.status} ${res.headers.get("content-type")}`);
      }
    }
    if (post.captions.threads.length > 500) {
      ok = false;
      console.log(`✗ ${post.slug}: Threads caption over 500 characters`);
    }
    console.log(`${post.time}  ${post.slug}  posted: ${Object.keys(post.posted).join(", ") || "nothing yet"}`);
  }
  console.log(ok ? "✓ all images reachable" : "✗ problems above");
  console.log(`Approved: ${JSON.stringify(plan.approved)}`);
} else if (command === "schedule-facebook") {
  requireApproved("facebook");
  for (const post of plan.posts) if (!post.posted.facebook) await scheduleFacebook(post);
} else if (command === "publish") {
  const [slug, ...platforms] = rest;
  const post = plan.posts.find((p) => p.slug === slug);
  if (!post) throw new Error(`No post "${slug}" in ${planPath}`);
  for (const platform of platforms.length ? platforms : Object.keys(PUBLISHERS)) {
    requireApproved(platform);
    if (post.posted[platform]) {
      console.log(`- ${platform} ${slug}: already posted`);
      continue;
    }
    try {
      await PUBLISHERS[platform](post);
    } catch (e) {
      console.error(`✗ ${platform} ${slug}: ${e.message}`);
      process.exitCode = 1;
    }
  }
} else {
  console.error(`Unknown command "${command}"`);
  process.exit(1);
}
