/**
 * Rebuilds src/data/vehicle_inventory.json from the live Supabase `vehicle_inventory` table.
 *
 * Why a build-time sync rather than a runtime fetch: 62 files import the `vehicles` array
 * synchronously, including the vehicle detail route loader and every JSON-LD block, so the
 * data has to exist before render for SSR and SEO to stay correct.
 *
 * The table stores one full dealer feed snapshot per run and never deletes the previous
 * run's rows (2142 rows across 19 runs on 2026-09-25). Reading it raw would show every
 * vehicle once per run, so this takes only the newest snapshot, then de-duplicates by VIN
 * as a belt-and-braces guard.
 *
 * This runs from `prebuild`, so every build bakes the current feed. It used to be a manual
 * step, which is how the deployed site ended up advertising 67 wrong prices and 13 vehicles
 * that had already left the lot.
 *
 * Uses the ANON key: the anon role has read-only SELECT on this table, so no secret is
 * involved and nothing here can write.
 *
 *   bun run inventory:sync
 */
import { writeFileSync } from "node:fs";
import { mapInventoryRowToVehicle, type InventoryRawRow } from "../src/lib/supabase";

const url = process.env.VITE_SUPABASE_URL ?? "";
const key = process.env.VITE_SUPABASE_ANON_KEY ?? "";
if (!url || !key) {
  console.error("Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env first.");
  process.exit(1);
}
const headers = { apikey: key, Authorization: `Bearer ${key}` };

const newest = (await fetch(
  `${url}/rest/v1/vehicle_inventory?select=received_at&order=received_at.desc&limit=1`,
  { headers },
).then((r) => r.json())) as { received_at: string }[];
if (!newest.length) {
  console.error("No rows visible. Does the anon role have SELECT on vehicle_inventory?");
  process.exit(1);
}

/**
 * Pin to the EXACT timestamp of the newest run, not to its calendar day. Every row the
 * ingester writes in one pass shares one received_at, so this selects precisely one feed.
 * The previous `received_at >= <day>T00:00:00` window silently merged two runs whenever the
 * vendor sent twice in a day, and the de-dupe below kept whichever row had the lower id —
 * the OLDER one. That is the exact failure this script exists to prevent.
 */
const receivedAt = String(newest[0].received_at);

const ageHours = (Date.now() - new Date(receivedAt).getTime()) / 36e5;
const STALE_AFTER_HOURS = 48;
if (ageHours > STALE_AFTER_HOURS) {
  // Not fatal: a late vendor feed is not something a build can fix, and blocking the deploy
  // would also block unrelated fixes. Loud, because shipping stale prices is a real cost.
  console.warn(
    `\n  WARNING: newest dealer feed is ${ageHours.toFixed(1)}h old (${receivedAt}).\n` +
      `  Expected a new one daily. Check the ingester before trusting these prices.\n`,
  );
}

const rows: InventoryRawRow[] = [];
for (let start = 0; ; start += 1000) {
  const res = await fetch(
    `${url}/rest/v1/vehicle_inventory?select=*&received_at=eq.${encodeURIComponent(receivedAt)}&order=id.asc`,
    { headers: { ...headers, Range: `${start}-${start + 999}` } },
  );
  const batch = (await res.json()) as InventoryRawRow[];
  rows.push(...batch);
  if (batch.length < 1000) break;
}

const seen = new Set<string>();
const out = rows
  .map(mapInventoryRowToVehicle)
  .filter((v) => {
    const k = v.vin || v.id;
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });

writeFileSync("src/data/vehicle_inventory.json", JSON.stringify(out, null, 2));

const ford = out.filter((v) => (v.make || "").toLowerCase() === "ford");
const by = (list: typeof out, c: string) => list.filter((v) => v.condition === c).length;
console.log(
  `feed ${receivedAt} (${ageHours.toFixed(1)}h old): wrote ${out.length} vehicles (${ford.length} Ford)`,
);
console.log(
  `  Ford: New ${by(ford, "New")} | Certified Pre-Owned ${by(ford, "Certified Pre-Owned")} | Used ${by(ford, "Used")}`,
);
console.log("  the site filters to Ford, so the listing page will show", ford.length, "vehicles");
