**SCORES ON THE LENS (robustness to content-truth constraints and to inventory changing underneath)**

I verified the load-bearing claims in the repo before scoring. Results below cite what actually holds.

---

## Concept 1 — "The Store" (local-first): **9/10**

**Why it scores highest:** it is the only composition whose first viewport reads nothing from the feed. The opening is a photograph of the building, a street address, hours, and a phone number. At 6 vehicles it is true; at 400 it is the same page. Feed coupling is confined to one inventory section, one search band, and one lineup index — three surfaces, each independently gated. Its failure mode at 400 units is *commercial* (a 400-unit lot deserves more inventory surface than a 1,240px section in fourth position) rather than *truthful*. That is the correct failure mode to choose.

**It also found the only real code-level scale bug in the repo.** Verified: `inventory.tsx:123-124` sets `PRICE_FLOOR = 20000`, and `validateInventorySearch` accepts `priceMin` only in `PRICE_FLOOR + 1 … PRICE_CAP`. `PRICE_BANDS` (`vehicles.ts:287-301`) derives its floor from live prices. The brief states the used department includes "stock under $25,000." The moment that stock lands, band 1 emits `priceMin=15000`, the validator silently drops it, and the band no longer means what its own label says. Concepts 2 and 3 both assert the opposite — C2: "Hero controls are already correct"; C3: "stays inside the validator's $20k-$100k window." Both are wrong at 400.

**Deductions:**
- Its proposed fix is half a fix. Clamping the derived floor up to 20000 makes the sub-$25,000 department — a product line the brief names explicitly — unreachable from the homepage. The correct fix is lowering `PRICE_FLOOR` in the route to match real used stock and adding a dev assertion that every generated band round-trips through `validateInventorySearch` unchanged.
- Claims body-style options are static and need deriving. Already done: `Hero.tsx:24-26` filters `BODY_TYPES` by `vehicles.some(v => v.type === t)`.
- Keeps served markets as plain text "as built," propagating a stale source comment. Eight city pages exist (`serviceAreas.ts`: ashtabula-oh, geneva-oh, conneaut-oh, austinburg-oh, madison-oh, chardon-oh, erie-pa, cleveland-oh) behind a live `ford-dealer.$city.tsx` route. Eight real internal links thrown away.

---

## Concept 2 — "Lineup-first": **8/10**

**Strongest scale architecture, weakest n=6 state.** The three-row state machine is the right shape: state A is `hasPage`, state B is a proven inventory match, state C is plain ink text plus a lead dialog. As inventory grows, state C empties itself. The section is the only one of the nine that gets *better* with scale rather than merely surviving it. And `LINEUP` is correctly declared as the one thing that must *not* auto-scale — driving it from the feed would delete the Bronco from the homepage during a month the lot sold out of Broncos. That is the cleanest statement of the lineup-versus-lot distinction anywhere in the three.

But the lens asks about both ends of the range, and at n=6 this composition's spine is 12 of 18 rows that go nowhere. Its own risk section names this and correctly concludes the mitigation is a business bet, not a design fix.

**Two defects:**
- Its count expression contradicts its own guarantee. `vehicles.filter(v => v.model === m.name)` against `LINEUP` names like `"Escape ST-Line Elite Hybrid"`, `"Escape Plug-In Hybrid"` and `"Mustang Mach-E"` returns 0, while the CPO Escape (`model: "Escape"`) counts only under the `"Escape"` row. C2 promises "one model can never show two different counts" and then writes the expression that produces exactly that. It must key on `slug` with a normalization over the feed's `model` string, not on `name`.
- Same `PRICE_BANDS` blind spot as C3, worsened by framing the hazard backwards: it guarantees "no control can resolve to an empty page," but the actual failure is a control that silently *widens*.

---

## Concept 3 — "Distance-first": **6/10**

Best count-insulation on paper, and it breaks worst at 400 in practice.

**It manufactures a false claim at scale through the very mechanism it invented to be honest.** C3 makes the masthead photograph feed-derived: pick a record, resolve the asset with `imageNameFromSrc(v.image)`, build alt text and caption from `year/make/model/trim/exterior/price`. Verified: `imageNameFromSrc` (`ResponsiveImage.tsx:74`) maps a *bundled asset src* to an `images.gen.ts` key. A real 400-unit feed carries remote URLs. It returns `undefined`, and every call site in the repo falls back to `?? "hero-truck"`. C3's LCP slot then shows the F-150 photograph captioned **"2025 FORD BRONCO BADLANDS. $47,995."** with matching alt text — a fabricated statement, in the largest photograph on the domain, generated automatically, by the section written to kill `Hero.tsx:187`. This hazard is latent in all three via `VehicleCard`, but only C3 promotes it into the hero and attaches a price to it.

**Also:** asserts the price bands already scale (false); renders served markets as plain text "because the city pages do not exist" (eight do); and its own risk section concedes the page is spine-loaded on `DELIVERY_CLAIM`, which — correctly, and this is its best catch — lives in `vehicles.ts` sourced from the brief, not in `dealerContent.ts`, the transcription of what the dealership actually publishes. "Nothing here degrades gracefully into a conventional dealer homepage." Under a content-truth lens that is a self-issued failing grade.

**Credit where due:** one-per-body-type selection with a deterministic sort gives a genuinely constant section height from 6 to 400, and facet links gated on `vehicles.some()` structurally prevent the `ShopByCategory` class of bug.

---

## STRONGEST SINGLE IDEA IN EACH

- **C1:** structurally decoupling the LCP viewport from the feed. The opening argument is a building, an address, and a phone number — three facts that do not change when the lot changes, cannot be falsified by a placeholder record, and need no sign-off because a photograph is evidence rather than a claim.
- **C2 (not picked):** **link only after proof.** `validateInventorySearch` accepts no `model` param, and `q` is a free-text match over `` `${year} ${make} ${model} ${trim} ${exterior} ${type} ${fuel}` `` — so `/inventory?q=Maverick` is an empty, indexable results page today. Rendering the link only when a match exists is the single insight in all three that generalizes to every dataset on the page, and C2 is the only one that applies it twice (models *and* cities).
- **C3 (not picked):** **"no digit inside a JSX text node in `src/components/home`" as a lint rule.** The only mechanical, CI-enforceable version of the count-truth constraint proposed anywhere. It survives every future edit by someone who never read the brief, which is the only kind of guarantee that actually holds.

---

## SHIP

**Ship Concept 1.** Graft onto it:

1. **C2's three-state lineup row** replacing C1's binary link/plain-text section 06 — but keyed on `slug` with a `model → slug` normalization over the feed, not on `name`, or the Escape rows disagree with each other on day one.
2. **C2's proven-before-linked rule**, and its second application: the eight `SERVICE_AREAS` slugs become `/ford-dealer/{slug}` links in C1's section 11; the other twenty-one stay plain text. Same predicate, second dataset. This corrects C1's stale-comment inheritance and recovers eight internal links.
3. **C3's no-digit lint rule**, scoped to `src/components/home`, with `PRICING_STANCE` and programme numbers whitelisted. This is what makes C1's "no component renders a count as prose" enforceable instead of aspirational.
4. **C3's expired-state spec.** C1 says section 07 renders at 0px when `activeIncentives()` empties. C3 specs what takes its place (660px → 300px, finance block goes full width). Adopt the collapse behaviour, not the vanish.
5. **C3's provenance flag on `DELIVERY_CLAIM`** — it is brief-sourced, absent from `dealerContent.ts`, and C1 puts it in the H1 descriptor. Lower stakes than C3's version, but it still needs the signature before ship, alongside `dealerInfo.phone` (flagged unverified at `vehicles.ts:307`) and `dealerInfo.hours`.

**Two fixes none of the three got right, required before 400 units:**

- Lower `PRICE_FLOOR` in `inventory.tsx:123` to match real used stock rather than clamping the band floor up, and assert in dev that every `PRICE_BANDS` entry survives `validateInventorySearch` unchanged. C1 found the drift; its clamp would hide the under-$25,000 department the brief names.
- Replace `imageNameFromSrc(v.image) ?? "hero-truck"` with a feed-URL path before any real feed lands. Today it silently substitutes an F-150 photograph for any unrecognized vehicle. C1 is least exposed because its hero is a fixed real photograph of the store, but `VehicleCard` carries it into every composition here.