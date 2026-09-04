I read the real sources before designing. Key constraints I verified in code, which shape everything below:

- `validateInventorySearch` (`src/routes/inventory.tsx:187-242`) accepts **no `model` param**. Free-text `q` matches `${year} ${make} ${model} ${trim} ${exterior} ${type} ${fuel}` (`:268-273`). So `/inventory?q=Maverick` against today's data returns **zero results**.
- Only **6 of 18 unique lineup models** have a page. Every `hasPage: true` slug in `LINEUP` resolves against `FORD_MODELS` — the flag is accurate and safe to trust.
- **8 city pages now exist** (`src/lib/serviceAreas.ts`: ashtabula-oh, geneva-oh, conneaut-oh, austinburg-oh, madison-oh, chardon-oh, erie-pa, cleveland-oh). The comment at `AreasWeServe.tsx:16-19` saying they don't is **stale**.
- Type scale is fixed at 8 steps (`src/styles.css:69-91`): display 64px, h1 44px, h2 30px, h3 21px, body 17px, ui 15px, meta 13px, micro 11px/0.09em. Ground `#faf8f5`, surface `#f2eee8`, surface-2 `#e7e1d8`, rule `#dcd5ca`, ink `#1a1714`/`#4a443d`/`#7a7268`, brand `#002c5f`. Radius 2px at every step.
- `src/components/ledger/index.ts` encodes the law: **one filled button per view**, `rounded-full` belongs to `Chip` alone.

---

# 1. SECTION LIST

Ten sections, down from sixteen. Total ≈ 6,200px desktop.

### S0 — HomeNav · 64px / 56px mobile · KEEP

Persistent access to the four primary actions and the phone.

Renders `PRIMARY_ACTIONS` (`dealerContent.ts:20-29`) in the dealership's own order: New Vehicles, Used Vehicles, Schedule Service, Value Your Trade. `PRIMARY_ACTIONS[1]` uses `condition: "Certified Pre-Owned"`, which is in `FILTERABLE_CONDITIONS`, so it survives the validator — ships as-is. One fix: `HomeNav.tsx:48` hotlinks the logo from `di-uploads-**development**.dealerinspire.com`; replace with a local asset through `ResponsiveImage`.

### S1 — OPENING · 836px / ~700px mobile · REWRITE

Detailed in §2. H1 + derived search controls + one photograph. The page's single filled button lives here.

### S2 — PRICING STANCE · 88px · NEW

Their own published banner, currently unused anywhere in the repo.

One horizontal band, 1px `--rule` above and below, paper ground. `PRICING_STANCE` ("We will beat any deal", `dealerContent.ts:197`) at h3/21px on the left; `DELIVERY_SHORT` at meta/13px ink-3 on the right. No icon, no box, no fill. This is the "rules and ground do the work cards used to" move at its cheapest.

### S3 — THE LINEUP · ~830px / ~700px mobile · NEW — **the spine**

Lets a visitor who already knows they want a Ford find *which* Ford, across the real 20-model lineup instead of six placeholder records.

Data: `LINEUP` (`dealerContent.ts:40-90`), four groups. Counts derived: `vehicles.filter(v => v.model === m.name).length`.

Layout is a **four-column typographic index**, not cards. One column per group at ≥1280px, two at 768–1279, an accordion at <768 with the first group open. Group name at h3/21px Archivo Expanded over a full-width 1px `--rule`. Model rows below at body/17px, 44px min height, hairline rules between at 60% rule opacity so the group rule reads stronger.

**Three row states, decided by data, never by hand:**

| State | Condition | Destination | Right side |
|---|---|---|---|
| A | `hasPage: true` (6 models) | `/ford/{slug}` | count, meta/13px, when > 0 |
| B | `hasPage: false` **and** a `vehicles` record matches the model name | `/inventory?q={name}` | count |
| C | `hasPage: false` **and** no match (12 models today) | **not a link** | text button "Ask about it" |

State B links only after a match is proven, so it can never resolve to an empty page — this is the specific trap `q` sets. State C names are set in ink-2 `#4a443d` rather than ink, carry no hover and no link affordance, and their "Ask about it" opens the existing `VehicleLeadDialog` with the model pre-filled and `pageSource="Homepage lineup"`. Not a dead link, not a fake link, not hidden. It is the same pattern `AreasWeServe` already chose correctly for cities.

Duplicates (Mach-E, Lightning, E-Transit, Maverick, Escape, Transit each appear in two groups) are **preserved** — that is the dealership's grouping, and someone shopping Electric needs the Lightning in that column. Count and destination compute per model, so one model can never show two different counts.

Section heading at h2/30px: **"What we sell"**. One body line under it: *"Every model Ford builds, grouped the way we group them. Counts show what is on the lot today."*

That sentence is load-bearing. It separates *lineup* from *lot* once, at the top of the spine, and every one of the seven false claims catalogued in the audit is that same conflation.

Foot of section: two text links, `/ford-models` ("All model pages") and `/inventory`.

### S4 — ON THE LOT NOW · ~640px / ~1,250px mobile · REWRITE

The one place vehicles appear as vehicles. Collapses `MostSearchedCars` + `FeaturedSpotlight` + `ExtraordinaryCarousel` + `FeaturedCars` — four sections rendering the same six records in four layouts.

`VehicleCard` (site/) at 3-up ≥1024, 2-up 640–1023, 1-up below. Heading h2/30px "On the lot now", sub-line *"Priced and specified. Call to confirm availability before you travel."*

Three deletions that matter:
- **Struck-through MSRP goes.** `msrp` exists on 3 of 6 records; nothing backs a specific saving. In its place, `PRICING_STANCE` as a text link opening the lead dialog — the same conversion job, using their published claim instead of an invented discount.
- All six `CountUp` instances (`ui.tsx:19-57`, ~650 React re-renders for prices already correct in SSR HTML).
- The per-card `getBoundingClientRect()` in `onPointerMove` (`FeaturedCars.tsx:38-39`) and the dead `Reveal` import at `:8`.

### S5 — OFFERS · ~772px / ~1,050px mobile · NEW

The only place on the page a price-reducing claim appears, and every claim carries a programme number and an end date.

Data: `activeIncentives(new Date())` (`dealerContent.ts:186-188`). **If it returns empty, the section does not render.** That is why the helper exists.

Four ruled rows, not four cards. Per row: `label` at body/17px, `programme` in a `Chip` (the one legitimate `rounded-full` on the page) at micro/11px, `detail` at meta/13px, `endsOn` right-aligned as "Ends August 31, 2026". The `disclaimer` sits directly under each row at micro/11px ink-3, **always visible** — not a tooltip, not a disclosure. Hidden manufacturer disclaimers are how this section gets a dealer in trouble.

This replaces `OfferPopup`, whose internal source label is `"500 off Popup"` (`OfferPopup.tsx:23-30`) — the exact offer `dealerContent.ts:130-134` says must not ship.

### S6 — DELIVERY · ~520px · KEEP, MOVE

The one claim a metro competitor cannot copy. `DELIVERY_SHORT` and `DELIVERY_SHIPPING` verbatim, plus the existing qualifier paragraph (`DeliveryHighlight.tsx:133-137`) — genuinely well-written and legally necessary, keep every word.

Moved from position 8 to here because it answers "Jefferson is ninety minutes from me", and that objection only forms *after* someone has seen a vehicle they want. The only inverted band on the page: `--brand` ground with paper type. One link to `/nationwide-vehicle-delivery`.

### S7 — THE THREE ERRANDS · ~830px · REWRITE

Service, trade, finance — in the dealership's own words, and only their own words.

This is the section most at risk of becoming icon+heading+paragraph ×3, so it isn't that. Three stacked full-width ruled bands, each a two-column line: verbatim title left at h3/21px, verbatim body right at max 52ch, action as a text link on the right edge. No icons. No boxes. Three rules across the page. Copy is 100% `HOME_BLOCKS.service` / `.trade` / `.finance` (`dealerContent.ts:99-114`), untouched. The finance row carries a second text link to `/finance/bad-credit`.

Under the three rules, one 320px full-bleed band of the `service` image (1600×900, currently unused). No text over it — photography sells, typography informs, they never share a register.

This single section deletes: the nine-item service menu, "Ford-trained technicians", "Genuine Ford and Motorcraft parts", "Ford Pickup and Delivery", "Ohio credit unions and national lenders", "First-time buyers... welcome", the decorative WebGL wheel, `StaticRim`, and all five `WhyObject` canvases. Nine unverifiable claims and 954 KB of three.js, replaced by three sentences the dealership published themselves.

### S8 — COMMERCIAL · ~340px · NEW

The entire Commercial lineup group has zero homepage presence today, `/commercial` is already linked from the footer, and approved copy sits unused at `dealerContent.ts:115-119`.

`HOME_BLOCKS.commercial` verbatim: "Built for the road forward" at h2/30px, body, one link to `/commercial`. Under it, the five Commercial models as a plain comma-set text line — all five are `hasPage: false`, so all five are plain text, consistent with state C in the lineup. Type on `--surface` `#f2eee8`. **No image**: nothing in `images.gen.ts` shows a commercial vehicle, and using an image because it exists is exactly how you end up with a fallback showing a sign reading "Fordom".

### S9 — WHERE WE ARE · ~880px · REWRITE (merge)

Merges `VisitUs` + `DealershipBanner` + `AreasWeServe`, three sections making overlapping location claims.

Top: `am-ford-lot-banner` (1920×640, local, unused) as a full-bleed 380px band. It is a dimensional exact match for the `width={1920} height={640}` hotlink at `DealershipBanner.tsx:47-56` — the correct local asset already exists. This kills both the dev-bucket hotlink and the `dealership.jpg` fallback.

Below, three columns: address and hours from `dealerInfo`; the map; the served markets. **Change from today:** the 8 markets with pages become links to `/ford-dealer/{slug}`; the other 21 stay plain text. Same data-decided rule as the lineup, applied to a second dataset. The Google Maps iframe goes behind a click-to-load placeholder with a plain Google Maps link always available — it is a third-party cookie surface and `loading="lazy"` doesn't change that.

### S10 — Footer · ~420px · REWRITE

Fix the same dev-bucket logo hotlink (`HomeFooter.tsx:33`). Drop "A family-owned Ford dealership" (`:45`) until confirmed — `dealerInfo.formerName = "Nassief Ford"` implies an ownership change.

---

# 2. THE OPENING

## At 1440 × 900

Nav 64px. Opening band 836px, so the fold lands at exactly 900 and cuts the pricing-stance rule mid-band — the page visibly continues.

**Left column** — 560px wide, 96px left margin, vertically centred:

- **H1**, Archivo Expanded, `--text-display` **64px / 0.98 / -0.03em**, ink `#1a1714`, two lines: **"The Ford lineup, Jefferson, Ohio."** A label, not a slogan. Typography informs. Every word is verifiable.
- **Subhead**, `--text-body` **17px / 1.6**, ink-2 `#4a443d`, max 46ch: *"SUVs and cars, trucks and vans, electric and hybrid, commercial. Plus certified pre-owned, used trucks, and stock under $25,000."* Straight from what the business actually sells.
- **The search controls** — `FindYourRightCarCard`'s logic, kept; its chrome, deleted. The current version is `rounded-[2rem]` white with `shadow-2xl shadow-brand/15` (`Hero.tsx:63`), which is a card floating on a photo — dead against Ledger. Rebuilt as a **form on the paper ground**: three controls in a row, each a 44px field with a 1px `--rule` underline only (no border box, no fill, 2px radius on the focus ring). Condition as a two-item segmented pair from `FILTERABLE_CONDITIONS`; budget from `PRICE_BANDS`; body style from `BODY_TYPES`. All three derived from `vehicles`, so no control can resolve to an empty page — that guarantee is the reason this card survives at all.
- **The single primary action**: submit, `Button variant="primary"`, 48px tall, 2px radius, `--brand` fill, white, `--text-ui` 15px/600, 28px horizontal padding. Label **"Search inventory"**. This is the **only filled button on the entire page**; every other action is a text link or ghost.
- Below it, one text link: **"See the whole lineup"** (anchor to S3).
- **Deleted from this block**: `"{vehicles.length} vehicles available"` (`Hero.tsx:155`, renders "6 vehicles available"), `"Browse real-time inventory"` (`:229`, a static array), `"Factory warranty included"` (`:260`, unqualified on a page listing a 2024 CPO), and the "family-owned" line (`:220`).

**Right column** — occupies the right 45%, bleeds to the right edge and to the band's full 836px height:

- `hero-truck` (1920×1080) through `ResponsiveImage`, `sizes="(min-width: 1024px) 45vw, 100vw"`, `object-fit: cover` into a tall portrait crop. **Radius 0. No scrim, no gradient, no overlay, no type on the image.**
- **Alt text fixed.** Current alt asserts a generic photo is "at AM Ford in Jefferson" (`Hero.tsx:187`). New: *"Ford F-150 Platinum in Oxford White"* — derivable from the record it illustrates, no location claim.
- Flush under the image, meta/13px ink-3: **"2025 F-150 Platinum"**, linked to `/vehicle/f150-platinum-2025`. If you show one specific truck, that truck should be clickable. The link renders only if the id resolves in `vehicles` — derived, never hard-coded.

## At 375px

Nav 56px. Image first (LCP), then type.

- `hero-truck` at the 400w variant, full-bleed **220px** tall, 16:9-ish crop.
- H1 drops to `--text-h1` **44px / 1.05 / -0.025em**, three lines at 335px content width (20px margins). Deliberate, not accidental.
- Subhead 17px, three lines.
- Three controls stacked full-width, 48px each, underline-only.
- Filled submit full-width, 52px.

First viewport at 375×812: 56 + 220 + 24 + 138 + 16 + 82 + 24 + 144 (two controls) lands the third control and the button at ~700px — **the primary action is inside the fold**, with the "See the whole lineup" link just under it.

---

# 3. HIERARCHY

**First — the lineup index (S3).** ~830px, roughly 13% of a 6,200px page, and the tallest single element. It is first because it is what the page is *for*: the visitor already knows they want a Ford, so the page's job is model selection, and the largest allocation of space should go to the actual job. Every other section is a support for it or a consequence of it.

**Second — the hero photograph.** ~648,000px² (780 × 836), the largest single element by area and the only full-bleed image above the fold. Second, not first, because the direction is explicit that photography sells while typography informs: the photo earns attention, the lineup spends it. It also carries the LCP, so its size is functional, not decorative.

**Third — the H1 at 64px display.** The largest type on the page by a factor of 2.1 over the next step (h2/30px). Third because it does one job in six words and then gets out of the way. Nothing else on the page exceeds 30px, which means the type scale itself enforces the hierarchy — there is no second display-size element to compete.

The consequence is what ranks *below*: offers, delivery, service, finance and location are all set at h2/30px or smaller in ruled bands of similar weight. They are peers, deliberately. A dealership homepage that makes financing shout as loud as the vehicles is a dealership homepage that has forgotten what it sells.

---

# 4. WHAT I DELIBERATELY LEFT OUT

- **Testimonials, review scores, star ratings, awards.** Banned by brief, and there is no review data anywhere in the repo. Fabricating them was never on the table; the point is that no section was designed to have a hole shaped like them.
- **Stats and counters.** All six `CountUp` instances deleted. There is no verifiable number on this business other than inventory count, and that number now appears exactly once, derived.
- **"Why choose us".** Five unverifiable promises rendered by five separate WebGL canvases. The *verifiable* answer to "why choose us" is delivery, the pricing stance, and the lineup — each of which is already its own section. A section that restates other sections in adjective form is the template pattern the brief bans.
- **All six WebGL contexts and the 954 KB three.js chunk** (`Lightformer-BhmflQVw.js`, 260 KB gz). Five decorative icons and one decorative wheel. `WhyObject`'s `ContactShadows` omits `frames`, so drei defaults to `Infinity` — a depth pass every frame, five times over. Nothing here survives.
- **`AmbientBackground` and `CursorGlow`.** 42 permanently-composited layers including 34 infinitely-animating dust spans, two scroll-driven `useTransform` subscriptions on a fixed element, and a rAF spring loop chasing the pointer. Ledger's ground is `#faf8f5` paper. A paper ground with blurred navy blobs drifting across it is not a paper ground.
- **The coverflow carousel.** 460px of `rotateY` on six spring-animated cards with a 6s autoplay interval, a `ResizeObserver` and an `IntersectionObserver`, showing records already shown three times above it.
- **The "$500 off" popup** and **every struck-through MSRP.** Replaced by four real programme-numbered incentives and one published pricing stance.
- **Any eyebrow or kicker.** The type scale has a micro step at 11px/0.09em; it is used for programme numbers and disclaimers only, never as a label above a heading.
- **A 20-model card grid.** The obvious execution of "lineup as spine" is twenty cards. Twelve of them would have no image, no page, and no vehicle. Twenty cards means twelve empty cards. A typographic index degrades gracefully; a card grid advertises its own gaps.
- **The `interior` and `am-ford-new-bronco` images.** No section needs them. Placing an image because it exists is precisely the reasoning that produced a fallback showing a sign reading "Fordom".
- **A payment calculator.** The only rate in the system is the 0% APR programme, which is in Offers with its disclaimer. A calculator would need rates nobody has approved.

---

# 5. HOW IT SCALES FROM 6 TO 400

Every number and every link target is an expression, not a literal.

1. **Lineup row state** — `hasPage` is static; the count is `vehicles.filter(v => v.model === m.name).length`. At 6, about five rows show a count and twelve sit in state C. At 400, nearly every row shows a count and **state C empties itself out**. The section improves with scale and breaks at neither end.
2. **State B's link is proven before it is rendered.** `/inventory?q={name}` only appears when a match exists. This is the single most important scaling guarantee on the page, because `q` matches a concatenated title string and would otherwise hand a visitor an empty results page for any of the twelve models Ford builds and this lot doesn't hold today.
3. **Hero controls are already correct.** `PRICE_BANDS` computes min/max from `vehicles`, rounds outward to $5,000 and cuts into four (`vehicles.ts:287-301`); `BODY_TYPES` filters by `vehicles.some(v => v.type === t)`; conditions come from `FILTERABLE_CONDITIONS`. At 400 vehicles with real used stock, adding `"Used"` to that one array updates the toggle, the route validator **and** `scripts/generate-sitemap.ts`, because all three read the same list — that shared-list decision is already made and documented at `vehicles.ts:229-242`.
4. **On-the-lot grid** — `vehicles.slice(0, 6)`, with a seventh link tile that renders only when `vehicles.length > 6` and carries `vehicles.length - 6`. At six, there is no seventh tile.
5. **Zero hard-coded inventory counts in prose.** The four that exist today (`Hero.tsx:155`, `FeaturedSpotlight.tsx:67`, `ExtraordinaryCarousel.tsx:97` and `:258`) leave with their sections. The only rendered count is the seventh-tile remainder.
6. **Offers self-expire.** `activeIncentives(new Date())` returns `[]` after 2026-08-31 and the section stops rendering with no code change and no stale APR on the page.
7. **Served markets link iff `getServiceArea(slug)` resolves.** Ship a ninth city page and the ninth link appears by itself.
8. **The one thing that deliberately does not auto-scale: `LINEUP` itself.** It is a hand-maintained list, and it should stay one. Driving it from the inventory feed would delete the Bronco from the homepage during any month the lot sold out of Broncos. The lineup is what Ford builds; the counts are what is on the lot. Those must come from different places, which is the same distinction the copy makes out loud.

---

# 6. THE ONE RISK

**Leading with the lineup means the page's spine is, today, mostly unclickable.**

Twelve of eighteen unique models land in state C. A visitor who taps three models in a row and is offered a lead form three times will conclude this is a brochure site with no inventory behind it — and that is a *worse* first impression than the current page's dishonest one, which at least shows six cars confidently and says nothing about the other fourteen models.

The mitigations are real but partial: the group sentence separates lineup from lot before the first row is read, state-C rows are visually de-emphasised so the eye lands on rows that go somewhere, and "Ask about it" is a genuine service from a rural dealer who orders and locates vehicles rather than a dead end.

But the mitigation only holds **if the dealership answers those leads quickly**. This angle bets on the business, not on the website. If inventory arrives and state C shrinks, the bet pays and the page gets stronger every month without a code change. If leads go unanswered, the honest lineup is commercially worse than the dishonest one was, and the fallback is to collapse S3 to the four group names with their counts only and push model-level discovery entirely into `/inventory`.

That risk is worth naming explicitly to the client before this ships, because it is the one thing in the design that no amount of front-end work can fix.

---

**Two blockers that are not design decisions and need sign-off before any of this ships:** the phone number is flagged unverified in its own source (`vehicles.ts:307`) and renders four times, and the `hours` array (`vehicles.ts:320-325`) appears in neither the brief nor `dealerContent.ts` yet is published as fact. Both land in S9.