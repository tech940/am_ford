/**
 * Generates public/og-default.jpg, the site-wide Open Graph / Twitter card image.
 * 1200x630 is the size Facebook, LinkedIn, and X all crop cleanly.
 * Run via `bun run images:optimize` (chained) or directly.
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
mkdirSync(join(root, "public"), { recursive: true });

await sharp(join(root, "src", "assets", "dealership.jpg"))
  .resize(1200, 630, { fit: "cover", position: "centre" })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(join(root, "public", "og-default.jpg"));

console.log("public/og-default.jpg 1200x630");
