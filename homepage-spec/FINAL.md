# AM FORD HOMEPAGE — FINAL BUILD SPEC

Committed structure. Not options. Synthesised from the local-first composition (spine), the lineup-first composition (the lineup index and the proven-before-linked rule), and the distance-first composition (the navy budget and the constant-height inventory selection).

All facts below were re-verified in the working tree on 2026-08-14. Three corrections to the inputs: `src/assets/images.gen.ts` has **13** keys (no `dealership` key, no `dealership.jpg` on disk); `src/lib/serviceAreas.ts` exports **8 live city pages** behind `ford-dealer.$city.tsx`, so the "city pages do not exist" comment at `AreasWeServe.tsx:16-19` is stale; `VehicleLeadDialog` takes a **required** `vehicle: Vehicle`, so the lineup's lead trigger cannot use it and needs a new sibling component (§2, S3).

---

## 1. THE THESIS

**This homepage argues that AM Ford is a real store at a real address where a person answers the phone, then shows what it actually sells: four vehicles it can prove it holds, and twenty models it can prove Ford builds, with nothing in between invented.**

Every claim on the page is either a photograph, a value read from `dealerInfo` / `vehicles` / `dealerContent`, or the dealership's own published sentence. Nothing else ships.

---

## 2. SECTION-BY-SECTION BUILD SPEC

### Global rules (bind every section)

**File layout.** `src/components/home/HomePage.tsx` renders, in order: skip link, `HomeNav`, `<main>` with S1 through S8, `HomeFooter`. `src/components/home/home.css`, `fx/AmbientBackground.tsx`, `fx/CursorGlow.tsx`, `fx/Scene3D.tsx`, `fx/ui.tsx`, `fx/Reveal.tsx` are deleted from the homepage import graph entirely.

**Suspense.** S1 and S2 ship in the route chunk (no `lazy`). S3 through S8 each get **their own** `React.lazy` + `<Suspense fallback={<div style={{minHeight: N}} />}>` with `N` = that section's stated desktop height. The single shared boundary at `HomePage.tsx:70` is removed: it currently lets one slow chunk blank twelve sections, and the twelve lazy chunks total ~22 KB gz, so it was buying nothing.

**Grid.** Content column max-width 1200px, 12 columns, 24px gutters. Page padding: 20px at <768, 40px at 768-1199, 64px at ≥1200 (or `calc((100vw - 1200px) / 2)`, whichever is larger).

**Type.** Only the eight steps in `src/styles.css:69-91`. `font-display` (Archivo Expanded 700) is permitted on exactly three things page-wide: the S1 H1, price figures inside `VehicleCard`, and the S1 phone number. Everything else is `font-sans`.

**Colour.** Ground `--background #faf8f5`. Ink `--ink`, `--ink-2`, `--ink-3`. Rules `--rule #dcd5ca`. `--surface #f2eee8` appears on exactly one section (S7).

**Navy budget (hard constraint).** `--brand #002c5f` appears in exactly four roles on the whole page and nowhere else:
1. the fill of the **single** filled control (S1 search submit),
2. the phone number type (nav, S1, S8, footer),
3. price figures (inside `VehicleCard`),
4. inline text links.

No navy rules, no navy section grounds, no navy headings, no navy icons, no navy chips. The `IconFuel`/`IconOdometer` glyphs inside `VehicleCard`'s spec band are `text-brand` today; change them to `text-ink-3` as part of the `VehicleCard` edit below.

**Buttons.** Exactly one `Button variant="primary"` renders on the page: the S1 search submit at `size="lg"`. Every other action is a text link or `variant="secondary"`. This requires two `VehicleCard` prop additions (below).

**Radius.** Structural surfaces 0. Controls 2px (`rounded-sm`, already the token value). `rounded-full` only on `Chip`, used once (S5 programme numbers).

**Motion.** **None**, page-wide, with two exceptions that are not animation: `transition-colors duration-150` on links and buttons, and `focus-visible` outlines. No `motion.*`, no `whileInView`, no `useScroll`, no `useSpring`, no autoplay, no parallax, no counters, no entrance transitions. `framer-motion` must not appear in any import in `src/components/home/`.

**Copy law.** No digit may appear inside a JSX text node in `src/components/home/**` unless it comes from an expression. Enforced by an ESLint rule (§5.9). Whitelist: programme numbers rendered from `INCENTIVES[].programme`, and the `PRICING_STANCE` / `DELIVERY_*` constants.

**Two `VehicleCard` edits** (`src/components/site/VehicleCard.tsx`), additive and defaulted so no other route changes:
```ts
showSaving?: boolean;          // default true
enquireVariant?: ButtonProps["variant"];  // default "primary"
```
- `showSaving={false}` suppresses **both** the line-through `msrp` (`:221-225`) and the "$N below MSRP" line (`:229-233`). The homepage passes `false`. Nothing in `dealerContent.ts` backs a specific saving, and the placeholder `msrp` values are not real.
- `enquireVariant="secondary"` is passed by the homepage so the four cards do not put four filled buttons on a page with a one-filled-button rule. The "Want a lower price? Ask us" strip (`:246-266`) stays exactly as built; it is a text row, not a button.

---

### S0 — `HomeNav` · 64px desktop / 56px mobile · REWRITE (light)

**Purpose.** Reach inventory, service and the phone without scrolling.

**Copy.** Left, wordmark set as type, no image: `AM FORD` (Archivo Expanded 700, 20px, tracking 0.06em, ink) over `JEFFERSON, OHIO` (`text-micro`, ink-3). Right, `PRIMARY_ACTIONS` verbatim in their own order: `New Vehicles`, `Used Vehicles`, `Schedule Service`, `Value Your Trade` at `text-ui` 500, then `dealerInfo.phone` at `text-ui` 600 in navy as a `tel:` link.

**Delete.** `HomeNav.tsx:48`, the `<img>` hotlinking `di-uploads-development.dealerinspire.com`. It is a third-party **development** bucket with no local copy, no srcset, inside the LCP viewport. The type wordmark replaces it; no logo asset is needed.

**Components.** `Sheet`, `SheetContent`, `SheetTrigger` from `@/components/ledger` for the mobile menu. `IconPhone` beside the phone on mobile only.

**Data.** `dealerInfo` (`vehicles.ts:309`), `PRIMARY_ACTIONS` (`dealerContent.ts:20`). `PRIMARY_ACTIONS[1]` carries `condition: "Certified Pre-Owned"`, which is in `FILTERABLE_CONDITIONS`, so it survives `validateInventorySearch`. Ship as-is.

**Responsive.** 375: wordmark + navy phone (44px tap) + 44x44 menu button opening the `Sheet`; the four actions live in the sheet. 768: wordmark + four links, phone moves into the overflow. 1200: all of it inline. 1px `border-b border-rule`, no shadow, no filled button in the bar, position sticky at all widths.

**Motion.** None. No scroll-triggered background change.

---

### S1 — THE STORE · 828px / 768: 700px / 375: ~950px · REWRITE of `Hero.tsx`

**Purpose.** Prove this is a real place at a real address, give the phone, and offer one search that cannot resolve to an empty page. Full pixel spec in §3.

**Exact copy.**
- H1, two registers in one `<h1>`, no eyebrow above it:
  - Register 1: `1059 State Route 46 North` (from `dealerInfo.street`)
  - Register 2: `Ford sales and service in Jefferson, Ohio. Free home delivery within 300 miles and vehicle shipping available to all 50 states.` (assembled as `` `Ford sales and service in ${dealerInfo.locality}, Ohio. ${DELIVERY_CLAIM}` ``, so the approved wording cannot drift)
- Ledger rows, labels `text-micro` uppercase ink-3 in a 96px column:
  - `PHONE` → `dealerInfo.phone`, navy, `font-display`, `tel:` link
  - `OPEN TODAY` → computed (below)
- Search strip labels: `Condition`, `Budget`, `Body style`. Submit label: `Search inventory`.
- Text link: `Get directions` (`HOME_BLOCKS.visit.primary.label`), href = Google Maps directions URL built from `dealerInfo.address`, `target="_blank" rel="noopener"`.

**`OPEN TODAY` is computed, never typed.**
```ts
const HOURS_INDEX = [3, 0, 0, 0, 0, 1, 2]; // Sun..Sat -> index into dealerInfo.hours
const today = dealerInfo.hours[HOURS_INDEX[new Date().getDay()]];
// renders today.time; when today.time === "Closed", the row reads "Closed today"
```
Computed during SSR so the HTML a crawler receives matches the browser. It never claims open when the source says closed.

**Components.** `Button` (`variant="primary" size="lg"`), `Field` + `Select` for Budget and Body style, a hand-built segmented pair for Condition (`role="group"`, `aria-pressed`), `ResponsiveImage`, `Rule`.

**Data.** `dealerInfo`, `DELIVERY_CLAIM`, `FILTERABLE_CONDITIONS`, `PRICE_BANDS`, and body types derived exactly as `Hero.tsx:24-26` already does (`BODY_TYPES` filtered by `vehicles.some(v => v.type === t)`). The submit handler is `handleSearch` from `Hero.tsx:44-56`, kept verbatim. **Keep the logic, delete the chrome:** the `rounded-[2rem] bg-white shadow-2xl shadow-brand/15` card at `Hero.tsx:63` is a floating glass card and goes; the controls sit directly on the paper ground with a 1px `--rule` underline and a 2px focus ring.

**Image treatment.** `<ResponsiveImage name="am-ford-front-lot" priority aspect={{width:804,height:828}} sizes="(min-width:1024px) 56vw, 100vw" className="h-full w-full object-cover" />`. Intrinsic 1200x800, variants 400/640/960. Radius 0. No scrim, no gradient, no overlay, no type on the image. A single 1px `--rule` on its left edge is the only separation. Alt: `The AM Ford lot at 1059 State Route 46 North in Jefferson, Ohio.` — true, unlike `Hero.tsx:187`, which asserts a generic stock photo was shot in Jefferson.

**Responsive.** See §3 for 375 and 1440. At 768: photograph becomes a full-width 768x320 band above the type; H1 register 1 drops to `text-h1` 44px; the search strip renders as three controls in a row with the submit full-width beneath. **The three search controls render only at ≥768.** At <768 the strip is replaced by the single filled `Button` linking to `/inventory`, because three form controls cost ~250px above the fold and `/inventory` already carries a better filter instrument on a phone.

**Delete from this section.** `{vehicles.length} vehicles available` (`:155`), `Browse real-time inventory` (`:229`), `Factory warranty included` (`:260`), the family-owned line (`:220`), `AmbientBackground`, `CursorGlow`, the entrance `motion.div` (`:59-64`), and the scroll `useTransform` pair (`:170-172`).

**Motion.** None.

---

### S2 — ON THE LOT NOW · 640px / 768: 1,180px / 375: ~1,760px · REWRITE of `FeaturedCars.tsx`

**Purpose.** The page's only inventory render. Replaces four sections that showed the same six records in four layouts.

**Exact copy.**
- H2: `On the lot now`
- Lead: `Priced and specified. Call to confirm availability before you travel.`
- Standing line under the lead, `text-h3`, ink: `We will beat any deal` (`PRICING_STANCE`, verbatim, rendered once on the page and never restated in stronger words)
- Foot: one text link, `See all inventory` → `/inventory`

**Selection rule (constant height at any feed size).** New export in `src/lib/vehicles.ts`:
```ts
const HOMEPAGE_ORDER: Vehicle["type"][] = ["Truck", "SUV", "EV", "Car"];
export const homepageSelection = (all: Vehicle[] = vehicles): Vehicle[] =>
  HOMEPAGE_ORDER
    .map((t) =>
      all.filter((v) => v.type === t)
         .sort((a, b) => a.miles - b.miles || a.price - b.price || a.id.localeCompare(b.id))[0])
    .filter((v): v is Vehicle => Boolean(v));
```
One vehicle per body style actually present, lowest odometer first, fully deterministic. At today's six records it returns four: F-150 Platinum (Truck), Explorer ST (SUV), F-150 Lightning (EV), Mustang GT Premium (Car). At 400 records it returns four. Section height and total page length do not move.

**Layout.** `homepageSelection()[0]` renders as `<VehicleCard layout="row" showSaving={false} enquireVariant="secondary" />` at full width. The remaining three render as `layout="tile"` in a 3-column grid.

**Components.** `VehicleCard`, `SectionHeading`, `Rule`.

**Data.** `vehicles`, `PRICING_STANCE`.

**Image treatment.** Handled inside `VehicleCard`: ink ground, 4:3, `imageNameFromSrc` with a plain `<img src={v.image}>` fallback when the key does not resolve. **Do not introduce `?? "hero-truck"` anywhere.** That pattern exists at four call sites today (`ExtraordinaryCarousel.tsx:25`, `FeaturedCars.tsx:63`, `FeaturedSpotlight.tsx:95`, `MostSearchedCars.tsx:114`) and all four files are deleted; against a real feed of remote URLs it would silently caption an F-150 photograph as a Bronco.

**Responsive.** 375: all four stack, `layout="tile"` for every card including the lead. 768: lead card `row` (it degrades to stacked internally below `lg`), then a 2-column grid of three tiles with the third spanning both columns. 1200: as specified.

**Motion.** None. Delete the six `CountUp` instances (`FeaturedCars.tsx:106`), the per-card `getBoundingClientRect()` in `onPointerMove` (`:38-39`), and the dead `Reveal` import (`:8`). `VehicleCard`'s existing `group-hover:scale-[1.03]` on the photograph stays; it is a hover affordance on a link, not page motion.

---

### S3 — WHAT WE SELL · 830px / 768: 900px / 375: ~700px accordion · NEW

**Purpose.** Tell the truth six placeholder records cannot: the dealership sells twenty models across four groups. This is the section that makes the whole page honest, and it is the largest internal-linking gain available.

**Exact copy.**
- H2: `What we sell`
- Lead: `Every model Ford builds, grouped the way we group them. Counts show what is on the lot today.`
- Group headings: `SUVs & Cars`, `Trucks & Vans`, `Electric & Hybrid`, `Commercial` (from `LINEUP[].group`)
- State C row action label: `Ask about it`
- Foot: two text links, `All model pages` → `/ford-models` and `See all inventory` → `/inventory`

**Row state machine.** Counts key on **slug**, never on `name`, or the three Escape rows disagree with each other on day one:
```ts
const slugifyModel = (m: string) => m.toLowerCase().replace(/\s+/g, "-");
const matches = (slug: string) => vehicles.filter((v) => slugifyModel(v.model) === slug);
```
All six placeholder records map cleanly: `F-150`→`f-150`, `F-150 Lightning`→`f-150-lightning`, `Mustang`→`mustang`, `Escape`→`escape`, `Bronco`→`bronco`, `Explorer`→`explorer`.

| State | Predicate | Renders as | Right column |
|---|---|---|---|
| **A** | `row.hasPage` | `<Link to="/ford/$model" params={{ model: row.slug }}>` navy | count when `matches(slug).length > 0` |
| **B** | `!row.hasPage && matches(slug).length > 0` | `<Link to="/inventory" search={{ q: matches(slug)[0].model }}>` navy | count |
| **C** | otherwise | plain `text-ink-2`, no link, no hover, no cursor change | `Ask about it` text button |

State B sends `q` set to the **matching record's own `model` string**, not the `LINEUP` name. `validateInventorySearch` accepts no `model` param (`inventory.tsx:225`); `q` is a substring match over `` `${year} ${make} ${model} ${trim} ${exterior} ${type} ${fuel}` `` (`:268-273`), so `?q=Maverick` returns an empty indexable results page today. Deriving `q` from a record that already matched is the only formulation that cannot produce one.

**Row order.** Within each group, sort by state rank (A=0, B=1, C=2), stable, preserving `LINEUP` order inside each rank. The eye lands on rows that go somewhere, and the section self-corrects as inventory arrives without a code change. Duplicate models across groups (Mach-E, Lightning, E-Transit, Maverick, Escape, Transit) are **kept**: that is the dealership's own grouping, and someone shopping Electric needs the Lightning in that column. Because count and destination both derive from `slug`, one model can never show two different counts.

**"Ask about it" needs a new component.** `VehicleLeadDialog` requires a `Vehicle` (`:104-105`) and there is no vehicle for a state-C model, so create `src/components/lead/ModelEnquiryDialog.tsx`:
- Props: `{ model: string; children: React.ReactNode }`
- Composes `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogBody`, `DialogFooter`, `Field`, `Input`, `Textarea`, `ConsentCheckbox`, `Button` from `@/components/ledger`
- Title: `` `Ask about the ${model}` ``. Lead: `Tell us what you need and we will come back with a straight answer.` Submit label: `Send enquiry`
- Submits through `submitQuickLead` from `@/lib/leads` with `leadType: "quote_request"`, no `vehicle`, and `message` prefixed `` `Model enquiry: ${model}. ` ``. `submitQuickLead` is the only path that stamps consent and sets the converted-visitor flag; do not call `submitLeadInquiry` directly.
- Renders `CONSENT_TEXT` and `RESPONSE_PROMISE` verbatim from `@/lib/leads`.

**Layout.** Four typographic index columns, not cards. Group name at `text-h3` over a full-width 1px `--rule`. Model rows below at `text-body`, 44px minimum height, separated by hairline rules at 60% rule opacity so the group rule reads stronger. Counts right-aligned, `text-meta`, `tabular-nums`.

**Components.** `SectionHeading`, `Rule`, `Button variant="quiet" size="sm"` for `Ask about it`, `ModelEnquiryDialog`.

**Data.** `LINEUP` (`dealerContent.ts:40-90`), `vehicles`. `LINEUP` is hand-maintained and must **never** be derived from the feed: driving it from inventory would delete the Bronco from the homepage during a month the lot sold out of Broncos.

**Image treatment.** None. The index is the visual. Twenty cards would be twelve empty cards; a typographic index degrades gracefully, a card grid advertises its own gaps.

**Responsive.** 375: accordion, one group per `<details>`, first group `open`, group name as `<summary>` at 48px. 768: two columns. 1200: four columns.

**Motion.** None. The accordion uses native `<details>`, no height animation.

---

### S4 — WE BRING IT TO YOU · 520px / 375: 700px · KEEP (port `DeliveryHighlight.tsx`)

**Purpose.** The one thing a metro competitor cannot copy, placed immediately after the visitor has seen a vehicle, which is when the distance objection forms.

**Exact copy.** `DELIVERY_SHORT` and `DELIVERY_SHIPPING` verbatim as the two statement lines (`vehicles.ts:334-335`), plus the existing qualifier paragraph at `DeliveryHighlight.tsx:133-137` kept **word for word** — it is well written and legally necessary. One text link: `How delivery works` → `/nationwide-vehicle-delivery`.

**Components.** `SectionHeading`, `Rule`. Strip the two `MagneticButton` instances (each holds two springs and calls `getBoundingClientRect()` on every pointer event) and replace with a text link.

**Data.** `DELIVERY_SHORT`, `DELIVERY_SHIPPING`.

**Image treatment.** None. Paper ground, ink type, rules. **Do not invert this band to navy** — it breaks the navy budget.

**Responsive.** 375 single column; 768 and 1200 two columns, statement left (5/12), qualifier right (7/12), vertical `--rule` between.

**Motion.** None.

---

### S5 — WHAT IS RUNNING NOW · 660px, collapsing to 300px / 375: ~1,050px · NEW

**Purpose.** The only place on the page a price-reducing claim appears, and every one carries a programme number, an end date, and its manufacturer disclaimer.

**Exact copy.**
- H2: `What is running now`
- Four rows, all values verbatim from `INCENTIVES` (`dealerContent.ts:147-183`): `label` at `text-body`, `programme` in a `Chip tone="neutral" size="md"` (the one legitimate `rounded-full` on the page), `detail` at `text-meta`, `endsOn` right-aligned as `Ends August 31, 2026` formatted from the ISO date, and `disclaimer` at `text-micro` ink-3 directly beneath each row, **always visible**. Not a tooltip, not a disclosure, not a collapsed accordion.
- Right rail, `HOME_BLOCKS.finance` verbatim: title `Start early, get approved online before you shop.`, body `Fill out our quick credit application and we will work with you to find the right vehicle that you can afford.`, text link `Apply for financing` → `/financing`, plus a second text link `Financing with bad credit` → `/finance/bad-credit`.

**Gate.** The incentive ledger renders `activeIncentives(new Date())`. When it returns `[]`, the H2, the rows and the disclaimers all stop rendering and the finance rail takes the full width; the section collapses from 660px to 300px rather than vanishing or leaving an empty heading.

**Components.** `SectionHeading`, `Chip`, `Rule`. No `Button`.

**Data.** `INCENTIVES`, `activeIncentives` (`dealerContent.ts:147-188`), `HOME_BLOCKS.finance`.

**Image treatment.** None.

**Responsive.** 375: rows stack, `endsOn` moves under `detail`, disclaimer stays beneath; finance rail below the ledger. 768: ledger full width, finance rail below. 1200: ledger 8/12, finance rail 4/12 with a vertical rule.

**Motion.** None.

**Deletes.** `OfferPopup` and every call site. Its internal source label is `"500 off Popup"` (`OfferPopup.tsx:23-30`) and `dealerContent.ts:130-134` states that offer has no voucher, code or expiry anywhere in the system. Also deletes the WebGL wheel at `Financing.tsx:108-110` and its `StaticRim` SVG substitute (neither is needed; the ledger is the visual) and the claim `Ohio credit unions and national lenders` (`Financing.tsx:24`).

---

### S6 — SERVICE AND TRADE · 560px / 375: 820px · REWRITE

**Purpose.** The two things a buyer still needs from a physical store, in the dealership's own words and only its own words.

**Exact copy, 100% verbatim from `HOME_BLOCKS`, nothing added.**
- Left: `Service for your vehicle, peace of mind for you` / `Get the most out of your vehicle from the techs who know it best.` / text link `Schedule service` → `/service`
- Right: `Sell us your car, even if you don't buy from us.` / `We are always looking for vehicles to stock our lot with. Get an easy, no obligation, online quote for your vehicle.` / text link `Appraise my vehicle` → `/trade-in`

**Layout.** One 12-column split with a single vertical `--rule` between. Service 7/12, trade 5/12. Two units side by side is a comparison; three or four stacked units is the banned triad with the icons filed off, which is why the four-row service/trade/finance/commercial band does not exist here.

**Components.** `SectionHeading` (`as="h3"` per side), `Rule`, `ResponsiveImage`.

**Data.** `HOME_BLOCKS.service`, `HOME_BLOCKS.trade`.

**Image treatment.** `<ResponsiveImage name="service" aspect={{width:16,height:9}} sizes="(min-width:1024px) 640px, 100vw" />` at 640x360 above the service copy in the left column. 1600x900 intrinsic, currently unused. Alt: `A technician working in the AM Ford service bay.` No text over it. No image on the trade side.

**Responsive.** 375 and 768: stacked, service first with the image full-bleed at 16:9, horizontal `--rule` between the two. 1200: the split above.

**Motion.** None.

**Deletes.** The nine-item service menu (`ServiceAndParts.tsx:26-72`), `Ford-trained technicians` (`:77`), `Ford diagnostic equipment` (`:79`), `Genuine Ford and Motorcraft parts` (`:83`), `Ford Pickup and Delivery` (`:88-90`). None of it appears in `dealerContent.ts`, whose entire service block is the one sentence quoted above.

---

### S7 — BUILT FOR THE ROAD FORWARD · 340px / 375: 460px · NEW

**Purpose.** The Commercial group has zero homepage presence today, `/commercial` is already linked from the footer, and approved copy has been sitting unused.

**Exact copy, verbatim from `HOME_BLOCKS.commercial`.** H2: `Built for the road forward`. Body: `Your job has never been tougher, and we will be here to help you keep working. Ford Commercial Vehicles are engineered to withstand the severity of everyday on-the-job duty.` Text link: `Commercial inventory` → `/commercial`.

Beneath, the five Commercial models as one plain comma-set text line at `text-ui` ink-2, read from `LINEUP[3].models`. All five are `hasPage: false`, so all five are plain text, consistent with state C in S3.

**Components.** `SectionHeading`, `Rule`.

**Data.** `HOME_BLOCKS.commercial`, `LINEUP`.

**Image treatment.** **None.** Ground is `--surface #f2eee8`, the only section that is not on paper. No asset in `images.gen.ts` shows a commercial vehicle, and placing an image because one exists is the reasoning that produced a fallback showing a sign reading "Fordom".

**Responsive.** Single column at every width, copy capped at 58ch.

**Motion.** None.

---

### S8 — WHERE WE ARE · 880px / 375: 1,180px · REWRITE (merges `VisitUs` + `DealershipBanner` + `AreasWeServe`)

**Purpose.** Address, hours, phone, directions, and the towns served, with nothing hard-coded and no link to a page that does not exist.

**Exact copy.**
- H2: `Located in Jefferson, OH` (`HOME_BLOCKS.visit.title`, verbatim)
- Ledger rows from `dealerInfo`: `ADDRESS` → `dealerInfo.address`; `PHONE` → `dealerInfo.phone` as a navy `tel:` link; `HOURS` → all four `dealerInfo.hours` rows as an aligned day/time ledger with `tabular-nums`
- Text link: `Get directions`
- Market band headings, kept from `AreasWeServe.tsx:20-39`: `Ashtabula County and nearby`, `Northeast Ohio`, `Regional and beyond`
- Map placeholder button label: `Load map` with the sub-line `Loading the map sets cookies from Google.`

**Served markets, proven before linked.** Same predicate as S3, second dataset:
```ts
import { SERVICE_AREAS } from "@/lib/serviceAreas";
const AREA_BY_CITY = new Map(SERVICE_AREAS.map((a) => [a.city.toLowerCase(), a]));
const areaFor = (market: string) => AREA_BY_CITY.get(market.split(",")[0].trim().toLowerCase());
```
A market renders as a navy `<Link to="/ford-dealer/$city" params={{ city: area.slug }}>` when `areaFor()` resolves, and as plain ink-2 text otherwise. Today that links 8 of 29 (Ashtabula, Geneva, Conneaut, Austinburg, Madison, Chardon, Cleveland, and Erie via the `"Erie, PA"` → `erie-pa` normalisation) and recovers eight internal links the current build throws away on a stale comment. Markets are **not** pills; they are text in three ruled columns.

**Components.** `SectionHeading`, `Rule`, `Button variant="secondary"` for `Load map`, `ResponsiveImage`.

**Data.** `dealerInfo`, `HOME_BLOCKS.visit`, `SERVED_MARKETS` (`vehicles.ts:338-368`), `SERVICE_AREAS` / `getServiceArea`.

**Image treatment.** A full-bleed band above the columns: `<ResponsiveImage name="am-ford-lot-banner" aspect={{width:1920,height:640}} sizes="100vw" />`, rendered at 380px tall with `object-cover`. 1920x640 intrinsic, local, currently unused, and a dimensional exact match for the `width={1920} height={640}` hotlink at `DealershipBanner.tsx:47-56`. Alt: `The AM Ford lot from above, Jefferson, Ohio.` This kills both the dev-bucket hotlink and its `onError` fallback. `am-ford-aerial` stays unused; one aerial is enough.

**Map.** A bordered block (1px `--rule`, radius 0) holding the address and a `Load map` button. The Google Maps `<iframe>` mounts only on click. A plain outbound Google Maps link is always present regardless, so the address is reachable without loading the embed. `loading="lazy"` does not remove a third-party cookie surface from the page; not mounting it does.

**Responsive.** 375: banner 375x240, then facts, then map placeholder, then markets as three stacked ruled lists. 768: banner full width, facts and map side by side, markets in two columns below. 1200: banner, then three columns (facts 4/12, map 4/12, markets 4/12) with markets in a single column of three ruled groups.

**Motion.** None.

---

### S9 — `HomeFooter` · 380px / 375: 640px · REWRITE (light)

**Purpose.** Navigation and the legal floor.

**Contains.** Type wordmark (same treatment as S0, no image). Four link columns built from `PRIMARY_ACTIONS` plus the real route list (`/inventory`, `/ford-models`, `/commercial`, `/service`, `/trade-in`, `/financing`, `/nationwide-vehicle-delivery`, `/areas-we-serve`, `/about`, `/contact`). `dealerInfo.address`, `dealerInfo.phone` (navy `tel:`), `dealerInfo.hours`. `DELIVERY_CLAIM` verbatim, once.

**Deletes.** The dev-bucket logo hotlink (`HomeFooter.tsx:33`) and `A family-owned Ford dealership` (`:45`) — unverified, and `dealerInfo.formerName = "Nassief Ford"` implies an ownership change.

**Motion.** None.

---

**Totals.** Nine sections plus nav and footer, down from sixteen plus two fx layers. Desktop ≈ 5,400px ≈ 6 viewports at 900px. Mobile ≈ 8,600px.

---

## 3. THE FIRST VIEWPORT

### 1440 x 900

12 columns, 64px outer margins, 24px gutters, column = 101.3px. Ground `#faf8f5`. Navy appears exactly twice in this viewport: the phone number and the submit fill.

**y = 0 to 64 — nav.** Left at x=64: `AM FORD`, Archivo Expanded 700, 20px, tracking 0.06em, ink; beneath it `JEFFERSON, OHIO`, `text-micro`, ink-3. Right, ending at x=1376: `New Vehicles  Used Vehicles  Schedule Service  Value Your Trade` at `text-ui` 500 ink-2 with 28px between, then 32px of space, then `(440) 998-2151` at `text-ui` 600 navy. 1px `border-b border-rule` at y=64.

**y = 64 to 892 — the band, 828px tall.**

*Photograph.* Columns 6 to 12, bleeding to the right viewport edge: x from 700 to 1440, width 740, height 828. `am-ford-front-lot`, `object-cover`, `object-position: center`, radius 0, `priority`. A single 1px `--rule` runs the full 828px at x=700. No overlay, no veil, no gradient, no text on it.

*Type block.* Columns 1 to 5, x=64 to x=612 (548px usable), vertically centred in the 828px, so its 566px content box starts at y=195.

| y | element |
|---|---|
| 195 | `1059 State Route 46 North`, Archivo Expanded 700, **72px / 70px**, tracking -0.02em, ink. Wraps to two lines at 548px. Block height 140. |
| 359 | `Ford sales and service in Jefferson, Ohio. Free home delivery within 300 miles and vehicle shipping available to all 50 states.` Archivo 400, 20px / 30px, ink-2, max 48ch. Four lines, height 120. |
| 511 | 1px `--rule`, full 548px. 32px of air above and below. |
| 544 | `PHONE` label, `text-micro` uppercase ink-3, in a 96px column at x=64. Value `(440) 998-2151` at x=160, Archivo Expanded 700, **28px**, navy, `tel:` link, hover underline. Row height 40. |
| 600 | `OPEN TODAY` label, same column. Value `9:00 AM to 8:00 PM` at x=160, `text-body` 500 ink. Row height 34. Renders `Closed today` on Sunday. |
| 650 | 1px `--rule`. |
| 682 | **The search strip.** Three cells across 548px, divided by 1px verticals, each with a `text-micro` uppercase ink-3 label over its control at 44px height with a 1px `--rule` underline and no border box. Cell 1 `Condition`, segmented from `FILTERABLE_CONDITIONS`, `grid-flow-col auto-cols-fr` so a third condition never wraps. Cell 2 `Budget`, `Select`, options `Any price` then the four `PRICE_BANDS` labels. Cell 3 `Body style`, `Select`, options `All body styles` then the derived `BODY_TYPES`. Strip height 76. |
| 774 | `Button variant="primary" size="lg"` (52px, 28px horizontal padding, 2px radius, navy fill, white `text-ui` 600), label `Search inventory`, `IconSearch` at 16px before the label. Width 220px. **The only filled control on the page.** |
| 846 | `Get directions`, `text-meta` navy, 1px underline offset 3px, opens Google Maps in a new tab. |
| 892 | end of band. |

**y = 892 to 900.** The visitor sees 8px of S2's top rule. Nothing bounces, nothing pulses, there is no chevron. The cut edge is the scroll cue.

### 375 x 812 (≈667px usable after browser chrome)

Order is photograph, address, phone, hours, action. The photograph is first because it is the argument; the phone is above the fold because it is the conversion.

| y | element |
|---|---|
| 0 | nav, 56px. Wordmark left. `(440) 998-2151` navy `text-ui`, 44px tap height. 44x44 menu button opening the `Sheet`. 1px rule at 56. |
| 56 | photograph, 375 x 211 (16:9), full-bleed, radius 0, `priority`, `sizes="100vw"`, same alt. Ends 267. |
| 287 | `1059 State Route 46 North`, Archivo Expanded 700, **36px / 35px**, tracking -0.02em. Three lines, height 105. Ends 392. |
| 402 | `Ford sales and service in Jefferson, Ohio. Free home delivery within 300 miles and vehicle shipping available to all 50 states.` `text-ui` 15px / 23px, ink-2. Five lines, height 115. Ends 517. |
| 535 | 1px `--rule`. |
| 551 | `PHONE` label `text-micro`; value `(440) 998-2151` Archivo Expanded 700 **24px** navy, `tel:` link, 44px tap height. Row ends **at 610.** |
| 624 | `OPEN TODAY` label; value `9:00 AM to 8:00 PM` at `text-ui`. Row ends **at 664.** |
| 684 | `Button variant="primary" size="lg" block`, 52px, label `Search inventory`, linking to `/inventory`. **The three search controls do not render below 768px.** |
| 756 | `Get directions`, `text-meta` navy, 44px tap height. |
| ~800 | end of section. |

**Fold guarantee:** the photograph, the full address H1, the delivery sentence, the phone number and today's hours are all complete above 667px. The filled button sits 17px below it, deliberately: on a phone the primary action for this business is the phone number, not a form.

**`MobileStickyCTA` is rewritten** (`src/components/site/MobileStickyCTA.tsx`). Current version is `glass-strong` with `rounded-2xl` and `rounded-xl` children, which violates both the glassmorphism ban and the radius rule. Replacement: a square bar, `bg-ink` ground, 1px top rule, 56px tall, `sm:hidden`, holding `Call (440) 998-2151` as a `tel:` link at `text-ui` 600 white with `IconPhone`, plus a `Directions` text link. **One item, one link, no second CTA.** It mounts only when S1 has left the viewport, via a single `IntersectionObserver` on the S1 element. The `Calendar`/`Phone` lucide imports go; use `IconPhone` and `IconPin` from `@/components/ledger`.

---

## 4. WHAT IS DELETED

**Files deleted outright** from `src/components/home/`:

| File | Why |
|---|---|
| `fx/AmbientBackground.tsx` | 42 permanently-composited layers: 3 blurred blobs at 70-90px, 2 beams, 2 breathing radials, a vignette and 34 dust spans on infinite CSS animations, plus two scroll `useTransform` subscriptions driving parallax on a fixed element. A paper ground with navy blobs drifting across it is not a paper ground. |
| `fx/CursorGlow.tsx` | Four springs and a `pointermove` listener driving two blurred divs. Zero information, desktop only. |
| `fx/Scene3D.tsx`, `WhyObject.tsx`, `RimScene.tsx` | Six WebGL contexts on one route to draw five icons and a wheel. Pulls `Lightformer-BhmflQVw.js` at 954,102 B raw / 260,259 B gz. `WhyObject`'s `ContactShadows` omits `frames`, so drei defaults to `Infinity`: a depth pass every frame, five times over. |
| `fx/ui.tsx` | `CountUp` (6 instances, roughly 650 React re-renders to animate prices already correct in the SSR HTML) and `MagneticButton` (9 instances, a forced synchronous layout read per pointer event). |
| `fx/Reveal.tsx` | ~86 extra `motion.div` wrappers and 25 `whileInView` observers, for a page whose brief bans unnecessary animation. |
| `sections/MostSearchedCars.tsx` | Second of four renders of the same six records. `Everything below is on the lot in Jefferson today` is false per `dealerContent.ts:13-16`. |
| `sections/FeaturedSpotlight.tsx` | Third render. Hard-codes `Three of the six vehicles on the lot` against `vehicles.slice(0, 3)`. |
| `sections/ExtraordinaryCarousel.tsx` | Fourth render. 460px coverflow, `rotateY` on six spring cards, 6s autoplay interval, a `ResizeObserver` and an `IntersectionObserver`. `All 6 of them` and `Browse all 6 vehicles` are hard-coded counts. |
| `sections/WhyChooseUs.tsx` | Five WebGL canvases for five icons, and five claims that appear in no source file: `Paperwork prepared before you arrive`, `Our advisors are car people first`, `on-site workshop with factory-trained technicians`. Rewriting it produces the banned icon + heading + paragraph triad. There is no honest version, so there is no replacement: the photograph, the phone, delivery and the pricing stance already answer "why us", each as its own section. |
| `sections/DealershipBanner.tsx` | Not wrong any more, redundant. S1 already carries a real photograph of the store at four times the prominence and S8 carries the aerial. |
| `sections/ShopByCategory.tsx` | The Trucks card promises `F-150 in gas and all-electric Lightning form` (`:58`) but links `search={{ type: "Truck" }}` (`:102`) while the Lightning is `type: "EV"`. The Mustang card describes one unit's option content as a category. S3 replaces category cards with the real lineup. |
| `sections/FinalCTA.tsx` | 14 `motion.span` with `repeat: Infinity`. A closing section that restates the four primary actions already in the nav and footer is the template move the brief names. S8 ends on the phone number. |
| `components/home/home.css` | Only fx layers consumed it. |
| `OfferPopup` and every call site | Internal source label is `"500 off Popup"`; `dealerContent.ts:130-134` states the offer has no voucher, code or expiry anywhere in the system. |

**Claims deleted (each currently rendered as fact):**
- All seven "six vehicles are the lot" statements: `Hero.tsx:155`, `:229`, `MostSearchedCars.tsx:56-57`, `FeaturedSpotlight.tsx:67`, `ExtraordinaryCarousel.tsx:97-98`, `:258`, `FeaturedCars.tsx:176`.
- Every struck-through MSRP and derived saving on the homepage (`showSaving={false}`). Replaced by `PRICING_STANCE`, rendered once.
- `A family-owned Ford dealership` and `one store`, all five occurrences.
- `Ford-trained technicians`, `Ford diagnostic equipment`, `Genuine Ford and Motorcraft parts`, `Ford Pickup and Delivery`, the nine-item service menu.
- `Ohio credit unions and national lenders`, `First-time buyers and buyers rebuilding credit are welcome`.
- `a few minutes from the Route 11 and I-90 interchanges`.
- `Factory warranty included`, unqualified on a page listing a 2024 Certified Pre-Owned Escape.

**Also to fix, same change set (not homepage components, but the homepage depends on them):**
- `vehicles.ts:232-236` and `ShopByCategory.tsx:49-54` both assert "the lot holds zero used units". `dealerContent.ts:14-16` calls that conclusion wrong about the business. The second file is deleted; correct the comment in the first before it steers another edit.
- `VehicleLeadDialog`'s `finance` intent lead (`:87`) contains `Ohio credit unions and national lenders`. Same unverified claim, same treatment: rewrite to `We take one application to our lending panel, then bring you the terms they come back with.` pending sign-off.
- The Google Maps `<iframe>` no longer mounts at load.

**Net.** The homepage stops importing `framer-motion`, `three`, `@react-three/fiber`, `@react-three/drei` and `lucide-react` entirely. That removes 260 KB gz of three.js plus the bulk of what `main` was carrying for this route.

---

## 5. SCALE PLAN: 6 VEHICLES VS 400

**1. S1 is structurally decoupled from the feed.** The first viewport reads `dealerInfo` and one fixed local photograph. It is byte-identical at 6 and at 400. The only feed-derived elements are the three search controls.

**2. S1 search controls.** `FILTERABLE_CONDITIONS` drives Condition; `PRICE_BANDS` drives Budget; `vehicles.some(v => v.type === t)` drives Body style. No control can offer a facet with no stock. Condition uses `grid-flow-col auto-cols-fr`, so adding `"Used"` to `FILTERABLE_CONDITIONS` (which also updates the route validator and `scripts/generate-sitemap.ts`, since all three read the same array) produces three even cells instead of a lopsided second row.

**3. `PRICE_BANDS` must be fixed before real used stock lands.** `inventory.tsx:123` sets `PRICE_FLOOR = 20000` and `validateInventorySearch` accepts `priceMin` only in `PRICE_FLOOR + 1 … PRICE_CAP`. `PRICE_BANDS` (`vehicles.ts:287-301`) derives its floor from live prices. The brief names a sub-$25,000 used department. The moment that stock arrives, band 1 emits `priceMin=15000`, the validator silently drops it, and the band silently **widens** to the whole lot. **The fix is to lower `PRICE_FLOOR` to `10000`, not to clamp the band floor up** — clamping would make the under-$25,000 department unreachable from the homepage. Add a dev-only assertion that every `PRICE_BANDS` entry survives `validateInventorySearch` unchanged, so the two can never drift again.

**4. S2 has constant height at any n.** `homepageSelection()` returns one vehicle per body style present, ordered Truck, SUV, EV, Car, tie-broken by odometer then price then id. Four cards at 6 records, four at 400. Section height and total page length do not move, so the feed migration cannot change the page's proportions. When the feed supplies a `featured` flag, change only the sort key inside `homepageSelection`; the layout is untouched.

**5. S3 improves with scale and breaks at neither end.** `LINEUP` is hand-maintained and never derived. Counts are `vehicles.filter(v => slugifyModel(v.model) === row.slug).length`. At 6 records, roughly five rows carry a count and twelve sit in state C; at 400, nearly every row carries a count and **state C empties itself**. No code change, no copy change. The one prose sentence in the section, `Counts show what is on the lot today`, is true at both ends because it separates lineup from lot explicitly.

**6. State B is proven before it is rendered.** `q` is set from the matching record's own `model` string, so `/inventory?q=…` cannot be an empty indexable results page. Same predicate, second dataset: S8 links a market only when `areaFor(market)` resolves. Ship a ninth city page and the ninth link appears by itself.

**7. S5 is date-driven, not count-driven.** `activeIncentives(new Date())` gates the ledger. On 2026-09-01 all four programmes expire, the ledger stops rendering, and the finance rail takes the full width. No dated offer can outlive its programme sheet.

**8. Zero counts in prose.** No component renders `vehicles.length`, no hard-coded "six" or "three" or "6". The only rendered integers on the page are per-model counts in S3 and programme numbers in S5, both from expressions.

**9. Enforce it.** Add an ESLint rule scoped to `src/components/home/**`: no numeric literal inside a JSX text node (`no-restricted-syntax` on `JSXText` matching `/\d/`). Whitelist the `INCENTIVES[].programme` and `PRICING_STANCE` / `DELIVERY_*` constant renders. This is the only version of the count-truth constraint that survives an edit by someone who never read the brief.

**10. Images at feed scale.** `imageNameFromSrc` maps a **bundled** asset src to an `images.gen.ts` key; a real feed carries remote URLs and it returns `undefined`. `VehicleCard` already handles that correctly with a plain `<img src={v.image}>` fallback (`:93-102`). **Never write `imageNameFromSrc(x) ?? "hero-truck"`** — that pattern exists at four call sites today, all in files this spec deletes, and against a real feed it would caption an F-150 photograph as a Bronco. Before the feed lands, add a remote-URL path to `ResponsiveImage` or keep the `<img>` fallback; do not add a default key.

**11. Everything is computed during SSR** so the HTML a crawler receives carries the same counts, bands, hours and offer set the browser does.

**What genuinely has to change at 400:** `/inventory` remains the sole owner of pagination (`PAGE_SIZE = 9`, already correct), and `homepageSelection`'s sort key becomes the feed's `featured` flag. Nothing else.

---

## 6. SELF-CHECK AGAINST THE BAN LIST

| Ban | Status | Evidence |
|---|---|---|
| No generic AI layout | **Clear** | The opening H1 is a street address at 72px over a photograph of the building. No dealer template opens with a location. |
| No excessive cards | **Clear** | Four `VehicleCard`s on the entire page, in S2. Every other section is rules and ground. S3 is a typographic index specifically to avoid twenty cards, twelve of which would be empty. |
| No excessive rounded rectangles | **Clear** | Radius tokens are all 2px. Structural surfaces are 0. `rounded-full` appears once, on `Chip`, for programme numbers. `MobileStickyCTA`'s `rounded-2xl`/`rounded-xl` are removed as part of this spec. |
| No random gradients | **Clear** | Zero gradients. The three blurred blobs, two beams and two breathing radials in `AmbientBackground` are deleted. |
| No unnecessary icons | **Clear, with one flag** | Page-wide: `IconSearch` (submit), `IconChevronDown` (two selects, via the `Select` background image), `IconPhone` and `IconPin` (mobile sticky bar). **Flag:** `VehicleCard`'s spec band renders five glyphs per card (`:170`), which is 20 icons in S2. They are labels in a data ledger, not decoration, so they stay, but they are recoloured from `text-brand` to `text-ink-3` to respect the navy budget. If the client objects, delete the `Icon` field from the `specs` array; nothing else changes. |
| No icon + heading + paragraph repeated as a section pattern | **Clear, and this was the closest call** | S6 is deliberately **two** units side by side, not three or four. The four-row service/trade/finance/commercial band was designed and then rejected: removing the icon does not change that an auditor sees four parallel heading + paragraph + link units. Finance moved into S5 as a rail beside the incentive ledger; commercial became S7 on its own ground with a model list instead of a paragraph. No section on the page contains three or more parallel copy units. |
| No glassmorphism | **Clear** | `CursorGlow` deleted, `AmbientBackground` deleted, `Hero.tsx:63`'s `bg-white shadow-2xl shadow-brand/15` card deleted, `MobileStickyCTA`'s `glass-strong` replaced with a flat ink bar. `Chip tone="onDark"` carries `backdrop-blur-sm` inside `VehicleCard`; it sits on a photograph as a legibility scrim on a 1-line status chip, which is the one place it is defensible. |
| No template sections | **Clear** | No hero-with-value-props, no "why choose us", no stats bar, no testimonial row, no numbered how-it-works strip, no logo wall, no newsletter block, no final-CTA repeat. A numbered 01/02/03/04 delivery process strip was considered and rejected as the numbered variant of the banned triad. |
| No unnecessary animation | **Clear** | Motion budget page-wide is `transition-colors duration-150` on links and buttons, `VehicleCard`'s existing hover scale on the photograph, and focus rings. No `framer-motion` import anywhere in `src/components/home/`. |
| No eyebrow / kicker above headings | **Clear** | `SectionHeading` has no eyebrow slot by design (`Prose.tsx:33-36`), which enforces this at the type level. The S1 H1 carries its second register **below** the address, not above. No section numbers, no marginal index, no tracked label above any heading. `VehicleCard`'s `{v.year} {v.make}` micro line sits above the model name inside a card; it is a data field, not a section kicker. |
| No gradient text | **Clear** | Zero. |
| No fabricated statistics, testimonials, review scores, awards, founding dates, inspection-point counts or APR figures | **Clear** | Zero counters, zero reviews, zero awards, zero founding date. The only APR on the page is `0% APR for 36 months` rendered from `INCENTIVES[0]` with `PGM #21624` and its full manufacturer disclaimer visible. The only integers are per-model inventory counts and programme numbers, both from expressions. |
| No em dashes, en dashes or exclamation marks in customer copy | **Clear** | Every string in §2 was checked. `dealerInfo.hours` uses `"Mon - Thu"` with a hyphen-minus, which is not an en dash. `Ends August 31, 2026` is formatted, not typed with a range dash. |
| No "learn more" / "read more" / "click here" | **Clear** | Full link inventory: `Get directions`, `Search inventory`, `See all inventory`, `All model pages`, `Ask about it`, `How delivery works`, `Apply for financing`, `Financing with bad credit`, `Schedule service`, `Appraise my vehicle`, `Commercial inventory`, `Load map`, `Call (440) 998-2151`, `Directions`. |

---

## BLOCKERS BEFORE SHIP (not design questions)

1. **`DELIVERY_CLAIM` needs a signature.** It is brief-sourced (`vehicles.ts:332-335`) and appears nowhere in `dealerContent.ts`, the transcription of the live site. This spec puts it in the H1's second register. Under this composition it costs one sentence if it turns out conditional, rather than the whole page, but it still needs confirming.
2. **`dealerInfo.phone` is flagged unverified in its own source** (`vehicles.ts:307`) and this spec renders it in the nav, S1 at 28px, S8, the footer and the mobile sticky bar. Verify before ship.
3. **`dealerInfo.hours` appears in neither the brief nor `dealerContent.ts`** and this spec publishes it as fact, including a computed `OPEN TODAY` row. Verify before ship.
4. **The lead pipeline must be verified end to end before S3 ships.** `ModelEnquiryDialog` will be the most-used lead surface on the page, and the pipeline in this repo silently drops leads when the build-time environment variables are absent. Confirm `submitQuickLead` reaches the destination in a production build before `Ask about it` renders twelve times on the homepage.
5. **`PRICE_FLOOR` (`src/routes/inventory.tsx:123`) must be lowered to `10000`** before any real sub-$25,000 used stock lands, with the dev round-trip assertion in §5.3. This is a one-line change that prevents a price band silently returning the entire lot.

**Files this spec touches:**
`C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\components\home\HomePage.tsx`
`C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\components\home\sections\` (S0-S9 rewritten; nine files deleted)
`C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\components\home\fx\` (deleted)
`C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\components\site\VehicleCard.tsx` (two props)
`C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\components\site\MobileStickyCTA.tsx` (rewritten)
`C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\components\lead\ModelEnquiryDialog.tsx` (new)
`C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\components\lead\VehicleLeadDialog.tsx` (one copy fix)
`C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\lib\vehicles.ts` (`homepageSelection`, comment correction)
`C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\routes\inventory.tsx` (`PRICE_FLOOR`)
`C:\Users\sahil\Downloads\velocity-craft-canvas-main\eslint.config.js` (no-digit rule)