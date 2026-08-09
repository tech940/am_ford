/**
 * Generates public/sitemap.xml and public/robots.txt from the live route + vehicle data.
 * Run directly (`bun run seo:generate`) or automatically via the `prebuild` hook.
 *
 * Indexing policy (mirrors the meta-robots logic in src/routes/inventory.tsx):
 *  - Static pages and vehicle detail pages: indexed, in the sitemap.
 *  - Single type/fuel inventory filters: indexable landing pages with self-canonicals, in the sitemap.
 *  - Deeper filter combinations, search, and pagination: meta noindex,follow — never listed here.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { vehicles, FILTER_OPTIONS } from "../src/lib/vehicles";
import { SERVICE_AREAS } from "../src/lib/serviceAreas";
import { FORD_MODELS } from "../src/lib/fordModels";
import { GUIDES, COMPARISONS } from "../src/lib/contentPages";
import { COUNTIES } from "../src/lib/counties";

const ORIGIN = "https://amford.com";
const today = new Date().toISOString().slice(0, 10);

type Entry = { path: string; priority: string; changefreq: string };

const entries: Entry[] = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/inventory", priority: "0.9", changefreq: "daily" },
  ...FILTER_OPTIONS.types
    .filter((t) => t !== "All")
    .map((t) => ({ path: `/inventory?type=${t}`, priority: "0.7", changefreq: "daily" })),
  ...FILTER_OPTIONS.fuels
    .filter((f) => f !== "All")
    .map((f) => ({ path: `/inventory?fuel=${f}`, priority: "0.7", changefreq: "daily" })),
  ...vehicles.map((v) => ({
    path: `/vehicle/${v.id}`,
    priority: "0.8",
    changefreq: "weekly",
  })),
  // Model pages: high intent, one per model we actually stock.
  { path: "/ford-models", priority: "0.8", changefreq: "weekly" },
  ...FORD_MODELS.map((m) => ({
    path: `/ford/${m.slug}`,
    priority: "0.8",
    changefreq: "weekly",
  })),
  // Local landing pages: the geographic strategy from the brief.
  // The hierarchy is /areas-we-serve -> county -> city, and counties rank slightly above the
  // individual towns because a county query has real volume where a 1,500-person village does not.
  { path: "/areas-we-serve", priority: "0.8", changefreq: "monthly" },
  ...COUNTIES.map((c) => ({
    path: `/ford-dealer/county/${c.slug}`,
    priority: "0.75",
    changefreq: "monthly",
  })),
  ...SERVICE_AREAS.map((a) => ({
    path: `/ford-dealer/${a.slug}`,
    priority: "0.7",
    changefreq: "monthly",
  })),
  { path: "/nationwide-vehicle-delivery", priority: "0.8", changefreq: "monthly" },
  // Editorial pages: they earn the informational rankings that feed the transactional ones.
  { path: "/guides", priority: "0.6", changefreq: "monthly" },
  ...GUIDES.map((g) => ({ path: `/guides/${g.slug}`, priority: "0.6", changefreq: "monthly" })),
  { path: "/compare", priority: "0.6", changefreq: "monthly" },
  ...COMPARISONS.map((c) => ({
    path: `/compare/${c.slug}`,
    priority: "0.6",
    changefreq: "monthly",
  })),
  { path: "/trade-in", priority: "0.8", changefreq: "monthly" },
  { path: "/finance/bad-credit", priority: "0.7", changefreq: "monthly" },
  { path: "/commercial", priority: "0.7", changefreq: "monthly" },
  { path: "/financing", priority: "0.6", changefreq: "monthly" },
  { path: "/service", priority: "0.6", changefreq: "monthly" },
  { path: "/contact", priority: "0.6", changefreq: "monthly" },
  { path: "/about", priority: "0.5", changefreq: "monthly" },
];

const xmlEscape = (s: string) => s.replace(/&/g, "&amp;");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${xmlEscape(ORIGIN + e.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${ORIGIN}/sitemap.xml
`;

const publicDir = join(import.meta.dirname, "..", "public");
mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, "sitemap.xml"), sitemap);
writeFileSync(join(publicDir, "robots.txt"), robots);

console.log(`sitemap.xml: ${entries.length} URLs written to public/ (origin ${ORIGIN})`);
