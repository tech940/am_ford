/**
 * Generate 360 turntable frames for vehicle pages with Gemini's image model, then
 * rewrite src/lib/spin360.ts from what is actually on disk.
 *
 *   bun run spin360:generate -- --dry-run
 *   bun run spin360:generate -- --only mustang-gt-2025
 *   bun run spin360:generate -- --only mustang-gt-2025 --frame 3   # redo one bad frame
 *
 * This is a MANUAL authoring step and must never be chained into prebuild: the output
 * is AI-generated imagery of vehicles the dealership is actually selling, so every set
 * gets reviewed frame by frame by a person, and the dealer signs off, before it ships.
 * Frames and the manifest are committed together so a build never depends on this
 * script or on the API being reachable.
 *
 * Requires GEMINI_API_KEY. Never name it VITE_ANYTHING: VITE_-prefixed vars get
 * inlined into the public client bundle, which is exactly how this repo's Supabase
 * service-role key ended up exposed.
 */

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_ROOT = path.join(ROOT, "public", "360");
const MANIFEST = path.join(ROOT, "src", "lib", "spin360.ts");

const MODEL = "gemini-2.5-flash-image";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const FRAME_W = 1280;
const FRAME_H = 800;
/** Below this many contiguous frames a set is treated as broken and omitted entirely. */
const MIN_FRAMES = 8;
/** Image output runs ~1290 tokens at $30/1M. */
const USD_PER_FRAME = 0.039;
const REQUEST_GAP_MS = 1500;

/**
 * Vehicle id -> source photograph. Deliberately NOT imported from src/lib/vehicles.ts:
 * that module imports from @/assets, which only resolves inside Vite.
 */
const SOURCES = {
  "f150-platinum-2025": "src/assets/hero-truck.jpg",
  "mustang-gt-2025": "src/assets/car-mustang.jpg",
  "explorer-st-2025": "src/assets/car-explorer.jpg",
  "f150-lightning-2025": "src/assets/car-lightning.jpg",
  "bronco-outer-banks-2025": "src/assets/car-bronco.jpg",
  "escape-titanium-2024": "src/assets/car-escape.jpg",
};

// ---------------------------------------------------------------- args

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const value = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 && i + 1 < argv.length ? argv[i + 1] : undefined;
};

const only = value("only");
const singleFrame = value("frame") !== undefined ? Number(value("frame")) : undefined;
const frameCount = Number(value("frames") ?? 12);
const force = flag("force");
const dryRun = flag("dry-run");
/** Rebuild the manifest from what is already on disk. Pure file scan, needs no API key. */
const manifestOnly = flag("manifest-only");

if (only && !SOURCES[only]) {
  console.error(`Unknown vehicle id "${only}". Known ids:\n  ${Object.keys(SOURCES).join("\n  ")}`);
  process.exit(1);
}
if (singleFrame !== undefined && !only) {
  console.error("--frame requires --only <vehicleId>: it regenerates one frame of one vehicle.");
  process.exit(1);
}
if (!Number.isInteger(frameCount) || frameCount < MIN_FRAMES || frameCount > 36) {
  console.error(`--frames must be an integer between ${MIN_FRAMES} and 36.`);
  process.exit(1);
}
if (singleFrame !== undefined && (!Number.isInteger(singleFrame) || singleFrame < 0)) {
  console.error("--frame must be a non-negative integer.");
  process.exit(1);
}

const apiKey = process.env.GEMINI_API_KEY;
if (!dryRun && !manifestOnly && !apiKey) {
  console.error(
    "GEMINI_API_KEY is not set. Add it to .env or your shell (get one at https://aistudio.google.com/apikey).\n" +
      "Do NOT prefix it with VITE_: VITE_* variables are inlined into the public client bundle,\n" +
      "which is how this repo's Supabase service-role key leaked.",
  );
  process.exit(1);
}

// ---------------------------------------------------------------- helpers

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const framePath = (id, i) => path.join(OUT_ROOT, id, `frame-${String(i).padStart(2, "0")}.webp`);

function promptFor(angle) {
  return (
    `Studio turntable photo of the EXACT same vehicle as the reference image: identical paint ` +
    `color, identical trim, identical wheels, identical badges and tires. The vehicle is rotated ` +
    `to exactly ${angle} degrees clockwise on the turntable, where 0 degrees is the reference ` +
    `image's own angle. Neutral seamless light-gray studio backdrop, soft even lighting, same ` +
    `camera height and distance as the reference, full vehicle in frame and centered with ` +
    `consistent margins. No people, no text, no watermark, no logo overlays.`
  );
}

/**
 * Every frame is generated from the ORIGINAL photo at an absolute angle. Never chain
 * frame N off frame N-1: the errors compound and the car visibly morphs around the turn.
 */
async function generateFrame(sourceB64, sourceMime, angle) {
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { inline_data: { mime_type: sourceMime, data: sourceB64 } },
          { text: promptFor(angle) },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: "16:9" },
    },
  };

  const attempt = async (payload) => {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res;
  };

  let delay = 2000;
  for (let tries = 0; tries < 5; tries++) {
    let res;
    try {
      res = await attempt(body);
    } catch (err) {
      // Network-level failure. Worth a retry.
      if (tries === 4) throw err;
      await sleep(delay);
      delay *= 2;
      continue;
    }

    if (res.status === 429 || res.status >= 500) {
      const text = await res.text().catch(() => "");
      // Honour RetryInfo when the API tells us how long to wait.
      const m = /"retryDelay"\s*:\s*"(\d+)s"/.exec(text);
      const wait = m ? Number(m[1]) * 1000 : delay + Math.floor(Math.random() * 500);
      if (tries === 4) throw new Error(`HTTP ${res.status} after 5 attempts: ${text.slice(0, 200)}`);
      console.log(`      HTTP ${res.status}, retrying in ${Math.round(wait / 1000)}s`);
      await sleep(wait);
      delay *= 2;
      continue;
    }

    if (res.status === 400 || res.status === 401 || res.status === 403) {
      // Bad key or bad request. Retrying only burns money and time.
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} (not retryable): ${text.slice(0, 300)}`);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
    }

    const json = await res.json();
    if (json.promptFeedback?.blockReason) {
      throw new Error(`blocked: ${json.promptFeedback.blockReason}`);
    }
    const cand = json.candidates?.[0];
    if (!cand) throw new Error("no candidates in response");
    if (cand.finishReason && cand.finishReason !== "STOP") {
      throw new Error(`finishReason ${cand.finishReason}`);
    }
    const parts = cand.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData?.mimeType?.startsWith("image/"));
    if (!imagePart) {
      const note = parts.find((p) => p.text)?.text;
      throw new Error(`no image part${note ? `: ${note.slice(0, 160)}` : ""}`);
    }
    return Buffer.from(imagePart.inlineData.data, "base64");
  }
  throw new Error("exhausted retries");
}

/** Atomic: a crash never leaves a truncated frame that passes the skip-if-exists check. */
async function writeFrame(buf, dest) {
  const normalized = await sharp(buf)
    .resize(FRAME_W, FRAME_H, { fit: "cover", position: "centre" })
    .webp({ quality: 72 })
    .toBuffer();
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const tmp = `${dest}.tmp`;
  fs.writeFileSync(tmp, normalized);
  fs.renameSync(tmp, dest);
  return normalized.length;
}

// ---------------------------------------------------------------- manifest

/**
 * Rebuilt from disk on every run, including failed and zero-work ones, so the manifest
 * can never claim frames that are not there. A gapped or thin set is omitted rather
 * than published broken: omission is what hides the 360 UI on the page.
 */
function rewriteManifest() {
  const entries = [];
  const dirs = fs.existsSync(OUT_ROOT)
    ? fs
        .readdirSync(OUT_ROOT, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort()
    : [];

  for (const id of dirs) {
    let n = 0;
    const buffers = [];
    for (;;) {
      const f = framePath(id, n);
      if (!fs.existsSync(f)) break;
      const buf = fs.readFileSync(f);
      if (buf.length === 0) {
        console.warn(`  ! ${id}: frame-${String(n).padStart(2, "0")}.webp is empty, stopping scan`);
        break;
      }
      buffers.push(buf);
      n++;
    }
    if (n < MIN_FRAMES) {
      console.warn(
        `  ! ${id}: only ${n} contiguous frames (need ${MIN_FRAMES}) — omitted, so this vehicle shows no 360 UI`,
      );
      continue;
    }
    const hash = createHash("sha1");
    for (const b of buffers) hash.update(b);
    entries.push({ id, frames: n, rev: hash.digest("hex").slice(0, 8) });
  }

  const rows = entries
    .map(
      (e) =>
        `  ${JSON.stringify(e.id)}: { frames: ${e.frames}, width: ${FRAME_W}, height: ${FRAME_H}, rev: ${JSON.stringify(e.rev)} },`,
    )
    .join("\n");

  const out = `// GENERATED FILE — do not edit by hand. Rebuilt by \`bun run spin360:generate\`
// (scripts/generate-360.mjs). Edits are lost on the next generation run.
//
// A vehicle appears here only when public/360/<id>/ holds a contiguous
// frame-00..frame-(N-1).webp run (N >= ${MIN_FRAMES}). An absent id means the vehicle page
// renders no 360 UI at all — identically on the server and the client, because
// this is a build-time module read and never a runtime probe.

export type SpinManifest = {
  /** Contiguous frame count starting at frame-00. */
  frames: number;
  /** Always ${FRAME_W} — every frame is normalized to this by the generator. */
  width: number;
  /** Always ${FRAME_H} — matches the photo-mode hero img, so object-cover crops alike. */
  height: number;
  /**
   * First 8 hex of sha1 over all frame bytes in index order. A CONTENT hash, not
   * an mtime: git clone/checkout rewrites mtimes, which would churn this value on
   * every fresh machine and bust caches for no reason.
   */
  rev: string;
};

export const SPIN_360: Record<string, SpinManifest> = {${entries.length ? `\n${rows}\n` : ""}};

export function getSpin(id: string): SpinManifest | undefined {
  return SPIN_360[id];
}

export function spinFrameUrl(id: string, m: SpinManifest, i: number): string {
  return \`/360/\${id}/frame-\${String(i).padStart(2, "0")}.webp?v=\${m.rev}\`;
}
`;
  fs.writeFileSync(MANIFEST, out);
  return entries;
}

// ---------------------------------------------------------------- main

const targets = only ? [only] : Object.keys(SOURCES);
const indices =
  singleFrame !== undefined
    ? [singleFrame]
    : Array.from({ length: frameCount }, (_, i) => i);

if (singleFrame !== undefined && singleFrame >= frameCount) {
  console.error(`--frame ${singleFrame} is out of range for a ${frameCount}-frame set (0..${frameCount - 1}).`);
  process.exit(1);
}

// Work plan first, so --dry-run can price the run before anything is spent.
const plan = [];
for (const id of targets) {
  for (const i of indices) {
    const dest = framePath(id, i);
    const exists = fs.existsSync(dest);
    const willWrite = force || singleFrame !== undefined || !exists;
    if (willWrite) plan.push({ id, i, dest });
  }
}

if (manifestOnly) {
  const entries = rewriteManifest();
  console.log(`Manifest rebuilt from disk: ${entries.length} vehicle(s) with 360 frames.`);
  for (const e of entries) console.log(`  ${e.id}  ${e.frames} frames  rev ${e.rev}`);
  process.exit(0);
}

console.log(`360 frame generation`);
console.log(`  vehicles:  ${targets.length} (${targets.join(", ")})`);
console.log(`  frames:    ${frameCount} per vehicle (${360 / frameCount} degree steps)`);
console.log(`  to render: ${plan.length}`);
console.log(`  estimate:  $${(plan.length * USD_PER_FRAME).toFixed(2)}`);

if (dryRun) {
  console.log("\n--dry-run: nothing generated, nothing written.");
  process.exit(0);
}
if (plan.length === 0) {
  console.log("\nNothing to render (all frames exist; pass --force to redo them).");
  const entries = rewriteManifest();
  console.log(`Manifest rewritten: ${entries.length} vehicle(s) with 360 frames.`);
  process.exit(0);
}

let failed = 0;
let written = 0;
let bytes = 0;

for (const id of targets) {
  const rel = SOURCES[id];
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) {
    console.error(`  ! ${id}: source photo missing at ${rel} — skipping vehicle`);
    failed++;
    continue;
  }
  const work = plan.filter((p) => p.id === id);
  if (work.length === 0) continue;

  const sourceB64 = fs.readFileSync(abs).toString("base64");
  const sourceMime = rel.endsWith(".png") ? "image/png" : "image/jpeg";
  console.log(`\n${id}  (source: ${rel})`);

  for (const { i, dest } of work) {
    const angle = Math.round(i * (360 / frameCount));
    process.stdout.write(`  frame ${String(i).padStart(2, "0")}  ${String(angle).padStart(3)}deg  `);
    try {
      const buf = await generateFrame(sourceB64, sourceMime, angle);
      const size = await writeFrame(buf, dest);
      bytes += size;
      written++;
      console.log(`ok  ${(size / 1024).toFixed(0)}KB`);
    } catch (err) {
      failed++;
      console.log(`FAILED  ${err.message}`);
    }
    await sleep(REQUEST_GAP_MS);
  }
}

console.log(`\nRendered ${written} frame(s), ${(bytes / 1024 / 1024).toFixed(2)}MB total.`);
if (failed) console.log(`${failed} frame(s) failed.`);
console.log(`Spent roughly $${(written * USD_PER_FRAME).toFixed(2)}.`);

const entries = rewriteManifest();
console.log(`\nManifest: ${entries.length} vehicle(s) with 360 frames.`);
for (const e of entries) console.log(`  ${e.id}  ${e.frames} frames  rev ${e.rev}`);

console.log(
  `\nReview every frame before committing. The model drifts on angle and mutates wheels,\n` +
    `grilles and badges between frames; fix a single bad one with --only <id> --frame <n>.\n` +
    `These are illustrative renders, not photographs of the physical unit, and the\n` +
    `dealership signs off before they go live.`,
);

process.exit(failed ? 1 : 0);
