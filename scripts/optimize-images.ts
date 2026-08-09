/**
 * Generates responsive AVIF/WebP/JPEG variants for every source photograph.
 *
 * Run with `bun run images:optimize`. Output goes to src/assets/generated/, which the
 * ResponsiveImage component consumes through a generated manifest. Source files in
 * src/assets/ stay untouched so the originals remain the master copies.
 *
 * Why this exists: the site shipped single-resolution JPEGs with no modern format and
 * no srcset, so a phone downloaded the same 1920px hero as a desktop. That is the
 * largest remaining Core Web Vitals cost on the site.
 */
import { readdirSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, parse } from "node:path";
import sharp from "sharp";

const SRC = join(import.meta.dirname, "..", "src", "assets");
const OUT = join(SRC, "generated");
const WIDTHS = [400, 640, 960, 1280, 1920];

mkdirSync(OUT, { recursive: true });

type Variant = { w: number; avif: string; webp: string; jpg: string };
type Manifest = Record<string, { width: number; height: number; variants: Variant[] }>;

const manifest: Manifest = {};

const sources = readdirSync(SRC).filter((f) => /\.(jpe?g|png)$/i.test(f));
if (sources.length === 0) {
  console.warn("No source images found in", SRC);
}

for (const file of sources) {
  const { name } = parse(file);
  const input = join(SRC, file);
  const meta = await sharp(input).metadata();
  const intrinsicW = meta.width ?? 1920;
  const intrinsicH = meta.height ?? 1080;

  const variants: Variant[] = [];
  // Never upscale: skip widths larger than the source.
  const widths = WIDTHS.filter((w) => w <= intrinsicW);
  if (widths.length === 0) widths.push(intrinsicW);

  for (const w of widths) {
    const base = `${name}-${w}`;
    const pipeline = sharp(input).resize({ width: w, withoutEnlargement: true });

    const jobs: Promise<unknown>[] = [];
    if (!existsSync(join(OUT, `${base}.avif`)))
      jobs.push(
        pipeline
          .clone()
          .avif({ quality: 52 })
          .toFile(join(OUT, `${base}.avif`)),
      );
    if (!existsSync(join(OUT, `${base}.webp`)))
      jobs.push(
        pipeline
          .clone()
          .webp({ quality: 72 })
          .toFile(join(OUT, `${base}.webp`)),
      );
    if (!existsSync(join(OUT, `${base}.jpg`)))
      jobs.push(
        pipeline
          .clone()
          .jpeg({ quality: 76, mozjpeg: true })
          .toFile(join(OUT, `${base}.jpg`)),
      );
    await Promise.all(jobs);

    variants.push({
      w,
      avif: `${base}.avif`,
      webp: `${base}.webp`,
      jpg: `${base}.jpg`,
    });
  }

  manifest[name] = { width: intrinsicW, height: intrinsicH, variants };
  console.log(`${file}: ${variants.length} widths`);
}

// Emit a typed module that imports every generated file so Vite fingerprints and
// serves them. Static imports keep the URLs correct in both dev and production.
const names = Object.keys(manifest).sort();
const lines: string[] = [
  "// GENERATED FILE. Run `bun run images:optimize` to rebuild. Do not edit by hand.",
  "",
];

let importIndex = 0;
const importMap = new Map<string, string>();
for (const n of names) {
  for (const v of manifest[n].variants) {
    for (const f of [v.avif, v.webp, v.jpg]) {
      const ident = `i${importIndex++}`;
      importMap.set(f, ident);
      lines.push(`import ${ident} from "./generated/${f}";`);
    }
  }
}

lines.push(
  "",
  "export type ImageVariant = { w: number; avif: string; webp: string; jpg: string };",
  "export type ImageAsset = { width: number; height: number; variants: ImageVariant[] };",
  "",
  "export const IMAGES: Record<string, ImageAsset> = {",
);

for (const n of names) {
  const a = manifest[n];
  lines.push(`  "${n}": {`);
  lines.push(`    width: ${a.width},`);
  lines.push(`    height: ${a.height},`);
  lines.push(`    variants: [`);
  for (const v of a.variants) {
    lines.push(
      `      { w: ${v.w}, avif: ${importMap.get(v.avif)}, webp: ${importMap.get(v.webp)}, jpg: ${importMap.get(v.jpg)} },`,
    );
  }
  lines.push(`    ],`);
  lines.push(`  },`);
}
lines.push("};", "");

writeFileSync(join(SRC, "images.gen.ts"), lines.join("\n"));
console.log(`\nmanifest: ${names.length} images -> src/assets/images.gen.ts`);
