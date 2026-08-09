/**
 * Internal-linking rule checker (Ford Ashtabula SEO spec, Section 5).
 *
 * Crawls the running dev server and asserts the per-page-type link minimums. The spec
 * is explicit that these are assertions to verify, not guidance to "link naturally",
 * so this exits non-zero when a rule fails and is safe to wire into CI.
 *
 * Usage:  bun run seo:check-links            (expects a server on :3100)
 *         BASE=https://amford.com bun run seo:check-links
 */
import { SERVICE_AREAS } from "../src/lib/serviceAreas";
import { FORD_MODELS } from "../src/lib/fordModels";
import { GUIDES, COMPARISONS } from "../src/lib/contentPages";
import { COUNTIES, validChildCitySlugs } from "../src/lib/counties";

const BASE = process.env.BASE ?? "http://localhost:3100";

type Rule = {
  /** Human label for the page group. */
  group: string;
  urls: string[];
  /** Each requirement: a label, a matcher over internal hrefs, and a minimum count. */
  requires: { label: string; match: (href: string) => boolean; min: number }[];
};

const startsWith = (prefix: string) => (h: string) => h.startsWith(prefix);

const RULES: Rule[] = [
  {
    // A county page is a hub. Its whole justification is passing authority down to the town
    // pages beneath it, so "links to every one of its own children" is the load-bearing
    // assertion here, not a nicety. Trumbull has no child pages yet and is exempt.
    group: "County pages",
    urls: COUNTIES.map((c) => `/ford-dealer/county/${c.slug}`),
    requires: [
      { label: "inventory", match: startsWith("/inventory"), min: 1 },
      { label: "model pages", match: startsWith("/ford/"), min: 2 },
      { label: "finance", match: startsWith("/financing"), min: 1 },
      { label: "areas hub", match: startsWith("/areas-we-serve"), min: 1 },
    ],
  },
  {
    group: "City / area pages",
    urls: SERVICE_AREAS.map((a) => `/ford-dealer/${a.slug}`),
    requires: [
      { label: "inventory", match: startsWith("/inventory"), min: 1 },
      { label: "model pages", match: startsWith("/ford/"), min: 3 },
      { label: "finance", match: startsWith("/financing"), min: 1 },
      { label: "trade-in", match: (h) => h.startsWith("/trade-in"), min: 1 },
    ],
  },
  {
    group: "Model pages",
    urls: FORD_MODELS.map((m) => `/ford/${m.slug}`),
    requires: [
      { label: "inventory", match: startsWith("/inventory"), min: 1 },
      { label: "an areas page", match: startsWith("/ford-dealer/"), min: 1 },
    ],
  },
  {
    group: "Guides",
    urls: GUIDES.map((g) => `/guides/${g.slug}`),
    requires: [
      { label: "model pages", match: startsWith("/ford/"), min: 2 },
      { label: "inventory", match: startsWith("/inventory"), min: 1 },
      {
        label: "finance or trade-in",
        match: (h) => h.startsWith("/financing") || h.startsWith("/trade-in"),
        min: 1,
      },
    ],
  },
  {
    group: "Comparison pages",
    urls: COMPARISONS.map((c) => `/compare/${c.slug}`),
    requires: [
      { label: "model pages", match: startsWith("/ford/"), min: 2 },
      { label: "inventory", match: startsWith("/inventory"), min: 1 },
      { label: "finance", match: startsWith("/financing"), min: 1 },
    ],
  },
];

async function hrefsOf(path: string): Promise<string[] | null> {
  const res = await fetch(`${BASE}${path}`, { headers: { accept: "text/html" } });
  if (!res.ok) return null;
  const html = await res.text();
  // Strip JSON-LD so schema URLs are not counted as rendered links.
  const body = html.replace(/<script[\s\S]*?<\/script>/g, "");
  return [...new Set([...body.matchAll(/href="(\/[^"#]*)"/g)].map((m) => m[1]))];
}

let failures = 0;
let checked = 0;

for (const rule of RULES) {
  if (rule.urls.length === 0) continue;
  console.log(`\n${rule.group}`);
  for (const url of rule.urls) {
    const hrefs = await hrefsOf(url);
    if (hrefs === null) {
      console.log(`  FAIL ${url} — did not return 200`);
      failures++;
      continue;
    }
    checked++;
    const missing = rule.requires
      .map((r) => ({ ...r, count: hrefs.filter((h) => r.match(h)).length }))
      .filter((r) => r.count < r.min);
    if (missing.length === 0) {
      console.log(`  ok   ${url}`);
    } else {
      failures++;
      const detail = missing.map((m) => `${m.label} ${m.count}/${m.min}`).join(", ");
      console.log(`  FAIL ${url} — ${detail}`);
    }
  }
}

/**
 * County -> child city links, and the reverse.
 *
 * This cannot be expressed in the shared `requires` shape above because the expected links
 * differ per URL. It is checked anyway because it is the only assertion that proves the
 * geographic hierarchy actually holds together: a county hub that does not reach its own
 * towns is just another page, and a town that never points up leaves the hub orphaned.
 */
console.log("\nCounty <-> city hierarchy");
for (const county of COUNTIES) {
  const countyUrl = `/ford-dealer/county/${county.slug}`;
  const children = validChildCitySlugs(county);
  const hrefs = await hrefsOf(countyUrl);
  if (hrefs === null) {
    console.log(`  FAIL ${countyUrl} — did not return 200`);
    failures++;
    continue;
  }
  const missingDown = children.filter((c) => !hrefs.includes(`/ford-dealer/${c}`));
  // Every child must also point back up, or the hub earns nothing from them.
  const missingUp: string[] = [];
  for (const child of children) {
    const childHrefs = await hrefsOf(`/ford-dealer/${child}`);
    if (childHrefs === null || !childHrefs.includes(countyUrl)) missingUp.push(child);
  }
  checked++;
  if (missingDown.length === 0 && missingUp.length === 0) {
    console.log(
      `  ok   ${countyUrl} (${children.length} child ${children.length === 1 ? "city" : "cities"})`,
    );
  } else {
    failures++;
    const parts = [];
    if (missingDown.length) parts.push(`no link down to ${missingDown.join(", ")}`);
    if (missingUp.length) parts.push(`no link up from ${missingUp.join(", ")}`);
    console.log(`  FAIL ${countyUrl} — ${parts.join("; ")}`);
  }
}

console.log(`\n${checked} pages checked, ${failures} failing.`);
if (failures > 0) process.exit(1);
