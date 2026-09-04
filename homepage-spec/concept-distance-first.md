# AM FORD HOMEPAGE — COMPOSITION, DELIVERY-FIRST ANGLE

Design premise: this store's addressable market is not Ashtabula County. The page is written for someone 200 miles away who will never stand on the lot, and it degrades correctly for the person who lives eight minutes up SR-46. Distance is answered in the largest type on the site, then never mentioned decoratively again.

Tokens referenced throughout are the ones already in `C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\styles.css`: `text-micro` 11px / `text-meta` 13 / `text-ui` 15 / `text-body` 17 / `text-h3` 21 / `text-h2` 30 / `text-h1` 44 / `text-display` 64. Ground `#FAF8F5`, surface `#F2EEE8`, rule `#DCD5CA`, ink `#1A1714`, ink-2 `#4A443D`, ink-3 `#7A7268`, brand `#002C5F`. Archivo everywhere, Archivo Expanded at `text-display` and on prices only.

---

## 1. SECTION LIST

Eight sections. Total page height at 1440x900 is about 5,170px, roughly 5.7 viewports. The current build is sixteen sections and renders the same six vehicle records four times.

**0. HomeNav** — `src/components/home/sections/HomeNav.tsx`, KEEP with one fix.
Purpose: identity, the four actions the dealership itself puts first, and the phone.
Contains: local logo asset (the `di-uploads-development.dealerinspire.com` hotlink at `HomeNav.tsx:48` is replaced by an `am-ford-*` key through `ResponsiveImage`), the four `PRIMARY_ACTIONS` from `dealerContent.ts:20-29` as text links in their own order (New Vehicles, Used Vehicles, Schedule Service, Value Your Trade), `dealerInfo.phone` right-aligned at `text-ui` 600. One 1px bottom rule, no shadow, no filled button in the bar.
Height: 64px fixed desktop, 56px mobile.

**1. Masthead** — rewrite of `Hero.tsx`.
Purpose: state the differentiator as fact, put one real vehicle and one search control in the same viewport.
Contains: `<h1>` built from `DELIVERY_SHORT` + locality, standfirst built from `DELIVERY_SHIPPING` plus the approved remote-purchase sentence, a full-bleed 88px search band ending in the page's single primary action, and a photograph in an ink well captioned with a real record.
Data: `DELIVERY_SHORT`, `DELIVERY_SHIPPING` (`vehicles.ts:334-335`), `dealerInfo.locality`, `FILTERABLE_CONDITIONS`, `PRICE_BANDS`, live body types. The photograph and its caption come from a feed record, not a literal image name.
Height: 688px desktop (76% of viewport, so the next rule and heading are visible), ~980px mobile.

**2. Where we deliver** — absorbs `DeliveryHighlight.tsx` (KEEP) and `AreasWeServe.tsx` (KEEP) into one section.
Purpose: convert the headline claim into something checkable, so the objection dies here rather than being repeated four more times down the page.
Contains: `<h2>` "Vehicle shipping available to all 50 states" verbatim; left column 5/12 carries the approved paragraph from `DeliveryHighlight.tsx:85-89` and the qualifier from `:133-137` at `text-micro`; right column 7/12 carries the served-market ledger, three labelled groups from `SERVED_MARKETS` under the band labels already written at `AreasWeServe.tsx:20-39` ("Ashtabula County and nearby", "Northeast Ohio", "Regional and beyond"), rendered as plain text in three columns with 1px rules, not pills, not links, because the city pages do not exist. Beneath, four numbered process lines (01 Choose online / 02 Finance and trade remotely / 03 Delivered or shipped / 04 Inspect on arrival), one sentence each, no icons, no boxes. One text link, "How delivery works", to `/nationwide-vehicle-delivery`.
Height: 760px.

**3. Current listings** — rewrite of `FeaturedCars.tsx`; deletes `MostSearchedCars`, `FeaturedSpotlight`, `ExtraordinaryCarousel`, and the card layer of `ShopByCategory`.
Purpose: the page's only inventory render.
Contains: `<h2>` "Current listings"; lead with a computed count and no claim about the lot; one `VehicleCard layout="row"` at full width, then three `VehicleCard layout="tile"` in a 3-column grid; a rule; four facet links (Trucks, SUVs, Electric, Certified Pre-Owned) each rendered only when `vehicles.some()` matches and each carrying params `validateInventorySearch` accepts; one text link "View all {count} listings".
Data: `vehicles`, `VehicleCard` (`src/components/site/VehicleCard.tsx`), which already derives saving from `msrp - price` and never authors a discount.
Height: 980px.

**4. The lineup** — new; there is no equivalent today.
Purpose: the only place on the page that tells the truth about what the dealership sells, and the single biggest internal-linking gain available.
Contains: four columns, one per `LINEUP` group (SUVs & Cars, Trucks & Vans, Electric & Hybrid, Commercial). Group name at `text-micro` caps over a 1px rule, then model names at `text-ui` on 40px rows. A model is a navy link only when `hasPage === true`; otherwise plain `ink-2` text with no hover, no cursor change, no affordance. Under the columns, `HOME_BLOCKS.commercial` verbatim ("Built for the road forward" plus its body) and one link to `/commercial`, which the footer already points at.
Data: `LINEUP` (`dealerContent.ts:40-90`), `HOME_BLOCKS.commercial`.
Height: 520px.

**5. We will beat any deal** — replaces `Financing.tsx` and every trace of `OfferPopup`.
Purpose: put the four real, programme-numbered incentives on the page and remove the unsourced $500.
Contains: `<h2>` `PRICING_STANCE` verbatim; an incentive ledger driven by `activeIncentives(new Date())`, one row per incentive, columns label (`text-h3`) / detail (`text-ui`) / programme number (`text-meta` tabular, navy) / "Ends 8/31/26" (`text-meta` tabular, ink-3), rows divided by 1px rules; the four `disclaimer` strings printed in full at `text-micro` under a rule, two columns, visible not collapsed. Right rail carries `HOME_BLOCKS.finance` verbatim ("Start early, get approved online before you shop.") and the filled control "Apply for financing" to `/financing`. If `activeIncentives()` returns empty the ledger and disclaimers do not render and the finance block takes the full width. The WebGL wheel at `Financing.tsx:108-110` is deleted; `StaticRim` is not needed either, since the ledger is the visual.
Height: 660px, 300px in the expired state.

**6. Service and trade** — replaces `ServiceAndParts.tsx` (nine cards, three unverifiable claims) and `WhyChooseUs.tsx` (five WebGL canvases).
Purpose: the two things a remote buyer still needs from a physical store.
Contains: 12-column split with a vertical rule. Left 7: the unused `service` asset (1600x900) at 640x360, then `HOME_BLOCKS.service` verbatim ("Service for your vehicle, peace of mind for you" / "Get the most out of your vehicle from the techs who know it best.") and the link "Schedule service". Right 5: `HOME_BLOCKS.trade` verbatim ("Sell us your car, even if you don't buy from us." / "We are always looking for vehicles to stock our lot with. Get an easy, no obligation, online quote for your vehicle.") and the link "Appraise my vehicle". Nothing about Ford-trained technicians, Motorcraft parts, Pickup and Delivery, or a nine-item menu, because none of it is in `dealerContent.ts`.
Height: 560px.

**7. Located in Jefferson, OH** — rewrite of `VisitUs.tsx` (KEEP, one substitution).
Purpose: for the minority who will drive in, and for local search.
Contains: `HOME_BLOCKS.visit.title` verbatim as the `<h2>`; the unused `am-ford-aerial` (1920x480) at container width, which is the real store, replacing the Google Maps iframe at `VisitUs.tsx:114` and its cookie surface; `dealerInfo` address, `dealerInfo.hours` as an aligned ledger, phone as a `tel:` link, and an outbound "Get directions" link. No claim about I-90, Route 11, or family ownership.
Height: 600px.

**8. Footer** — rewrite of `HomeFooter.tsx`.
Purpose: NAP, the four primary actions again, the lineup groups, one disclaimer.
Contains: local logo, address, phone, hours, `PRIMARY_ACTIONS`, four lineup group headings linking to `/inventory` facets and `/commercial`, `DELIVERY_CLAIM` verbatim once, and the offers end-date line. "A family-owned Ford dealership" (`HomeFooter.tsx:45`) is removed pending sign-off.
Height: 400px.

Deleted outright and not replaced: `MostSearchedCars`, `FeaturedSpotlight`, `ExtraordinaryCarousel`, `WhyChooseUs`, `DealershipBanner`, `ShopByCategory`, `FinalCTA`, `fx/AmbientBackground`, `fx/CursorGlow`, `fx/Scene3D` and both its consumers, `CountUp`, `MagneticButton`.

---

## 2. THE OPENING

**At 1440x900.** Content column 1200px, 12 columns, 32px gutters.

Nav occupies the top 64px. The masthead begins at y=128.

Left column, cols 1-6 (570px):

- `<h1>`, three lines inside one element. Lines one and two are Archivo Expanded 700 at `text-display` 64px / 0.98 / -0.03em, ink: "Free home delivery" then "within 300 miles". Line three is Archivo 400 at `text-h2` 30px, ink-2: "of Jefferson, Ohio". The locality stays inside the H1 for local search without the claim being diluted; the weight drop does the subordinating, not a colour change and not a gradient. Block height 161px.
- Standfirst, `text-body` 17/1.6, ink-2, capped at 58ch: "Vehicle shipping available to all 50 states. Choose the vehicle online, handle financing and your trade from home, and we bring it to your driveway. Shipping charges may apply outside the complimentary 300 mile delivery area." Three lines, 82px. Every sentence is either verbatim from `vehicles.ts:334-335` or from the already-approved qualifier.
- One text link, `text-meta` navy with a 1px underline offset 3px: "How delivery works".

Right column, cols 7-12 (570px): the photograph, in a square ink `#1A1714` well at 3:2, 570x380, no radius, no shadow, no scrim, no text over it. The studio cutouts read as missing images on warm paper and as a stage on ink, which is the rule `VehicleCard.tsx:81` already established. `ResponsiveImage` with `priority`, `sizes="(min-width:1024px) 570px, 100vw"`; the 640w AVIF variant is the LCP resource. Caption sits outside the well, `text-micro` caps tracking 0.09em, ink-3, linked to the VDP: "2025 FORD F-150 PLATINUM. $64,995." Alt text is assembled from the record (`year make model trim` plus `exterior`) and never asserts a location, which kills the defect at `Hero.tsx:187`.

Below both columns, spanning all 12: the search band, 88px tall, 1px rules top and bottom, four cells divided by 1px verticals. Cells 1-3 sit on ground and carry a `text-micro` caps label over a `text-ui` control: Condition (segmented, from `FILTERABLE_CONDITIONS`), Budget (select, from `PRICE_BANDS`), Body style (select, from types actually present). Cell 4 is the whole cell filled `#002C5F`, white Archivo 600 `text-ui`, label "Search inventory". That filled cell is the single primary action in the viewport. There is no second button, no "Get financed", no floating white card with a 2rem radius and a `shadow-2xl`.

Masthead ends at y=816. At 900px tall the visitor sees 84px of section 2, which is its top rule and the first line of its heading.

**At 375px.** Gutters 16px, content 343px.

Nav 56px. Order changes deliberately: type, then search, then photograph. The primary action must be reachable without a scroll; the photograph is the reward for the first one.

- `<h1>` at `clamp(28px, 7.4vw, 64px)`, so 28px here. Three lines at 28/1.02 plus the 19px third line: 115px.
- Standfirst at `text-ui` 15/1.5, five lines, 110px.
- Search band stacks to four full-width rows: condition segmented 44px, budget 48px, body style 48px, submit 52px filled navy, total 192px plus 24px of rules and gaps.
- Filled action bottom edge lands at about y=560, inside a 667px viewport.
- Photograph follows, full-bleed edge to edge at 4:3 (375x281) on ink, the only full-bleed image on the page, caption beneath at `text-micro`.

Mobile masthead total about 980px. A sticky bottom bar carrying phone plus "Search inventory" mounts only after the masthead leaves the viewport, so two filled controls are never on screen at once.

---

## 3. HIERARCHY

**Largest: the H1 at 64px Archivo Expanded.** It is the only use of `text-display` on the page; nothing else comes within 20px of it. It is the largest thing because it is the only sentence on the site a metro competitor with more inventory, more staff, and a bigger ad budget cannot print. Inventory is table stakes and price is contestable; a 300 mile free radius from a store in a town of 3,000 is a structural fact about the business.

**Second: photography, at exactly two scales.** The 570x380 masthead well and the row-layout vehicle in section 3, each about 380px of image on ink. Photography is the second register because the visitor is buying an object, and after the delivery question is settled the only remaining question is which one. The two sizes are deliberate: the masthead photograph and the listing row are the same weight, which stops the page having a decorative image and a functional image competing.

**Third: the navy search band and the 44px Expanded prices in the listing rows.** These are the same rank on purpose. Navy is spent in exactly three places on the whole page: the search cell, the "Apply for financing" control, and price type. Everything else that would have been navy is a 1px rule or a text link. That is what makes the accent read as instruction rather than as branding.

Everything below third is set at 30px or smaller and separated by rules, which is the point of the Ledger direction: after the third rank, hierarchy comes from position and whitespace, not from another size.

---

## 4. WHAT I DELIBERATELY LEFT OUT

- **Three of the four inventory renders.** `MostSearchedCars`, `FeaturedSpotlight`, and `ExtraordinaryCarousel` display the same six records as `FeaturedCars` in different clothes. Four renders of one dataset is the single largest structural defect on the current page.
- **A "why choose us" section.** It was five WebGL canvases drawing five icons, and its five claims (paperwork prepared before you arrive, advisors are car people first, on-site workshop with factory-trained technicians) are in no source file. It is also the exact icon + heading + paragraph triad the brief bans. There is no honest version of it, so there is no replacement.
- **All six WebGL contexts**, which pull the 954KB / 260KB gz three.js chunk for decorative geometry, and the `ContactShadows` at `WhyObject.tsx:342-350` that re-render a depth pass every frame five times over.
- **`AmbientBackground` and `CursorGlow`**: 42 permanently composited layers plus a spring loop, for zero information.
- **Six `CountUp` instances**, roughly 650 React re-renders to animate price labels that are already correct in the SSR HTML, and nine `MagneticButton`s each calling `getBoundingClientRect()` inside `onPointerMove`.
- **The $500 popup.** `OfferPopup`'s internal source label is "500 off Popup" and `dealerContent.ts:130-134` says there is no voucher, code, or expiry behind it anywhere in the system. It is replaced by four programme numbers with manufacturer disclaimers.
- **Testimonials, review scores, stats, counters, awards, a founding date, inspection-point counts, and "family-owned".** None are in `dealerContent.ts` or `vehicles.ts`. "Family-owned" currently appears in five places against a record that also carries `formerName: "Nassief Ford"`.
- **The Google Maps iframe**, replaced by the real aerial and an outbound directions link. A third-party cookie surface on the homepage is a consent problem that buys nothing a photograph and a link do not.
- **A final CTA section.** Section 7 ends in a phone number and a directions link, and the footer carries the four primary actions. A ninth section that repeats them is the template move the brief names.
- **Any eyebrow, kicker, gradient text, glass panel, or rounded card.** The ledger `SectionHeading` at `src/components/ledger/Prose.tsx:40` has no eyebrow slot, which enforces this at the type level rather than by discipline.

---

## 5. HOW IT SCALES FROM 6 TO 400

The rule the current page breaks seven times is that no count, and no statement about the lot, is ever written as a literal. Everything below is mechanical.

- **The masthead photograph is a feed record, not an image name.** The section picks a vehicle by a deterministic sort, resolves its asset with `imageNameFromSrc(v.image)`, and builds both alt text and caption from `year/make/model/trim/exterior/price`. At 400 vehicles the hero changes with the feed and the alt text stays true. `Hero.tsx:186` is the only literal `name=` on the page today and it is attached to a sentence claiming a stock photo was shot in Jefferson.
- **The listing selection is one per body type present**, ordered Truck, SUV, EV, Car, tie-broken by lowest odometer. At six records it returns four distinct vehicles; at 400 it returns four distinct vehicles. The section height is therefore constant, and so is total page length.
- **Facet links render only when the facet has matches.** `vehicles.some(v => v.type === "EV")` gates the Electric link. This structurally prevents the `ShopByCategory.tsx:58` bug where copy advertised the Lightning and the link filtered `type: "Truck"`, since the Lightning is `type: "EV"`.
- **Counts are computed in the render, never in prose.** "View all {count} listings" and the lineup's model count come from `.length` and a `Set` over `LINEUP` slugs. The lint rule worth adding: no digit inside a JSX text node in `src/components/home`.
- **Price bands already scale.** `PRICE_BANDS` derives from the real min and max rounded to $5,000 and stays inside the validator's $20k-$100k window, so at 400 vehicles the bands widen and the count stays at four. Body styles come from types present. Conditions come from `FILTERABLE_CONDITIONS`, which is also what the sitemap generator reads, so adding used inventory is one edit in `vehicles.ts:243` rather than three that drift.
- **The lineup index is model-level, not inventory-level**, so it does not move with feed size at all. `hasPage` gates every link, which is the mechanism that keeps a 400-vehicle feed from linking a Maverick page that does not exist.
- **Offers self-expire.** `activeIncentives(new Date())` empties the ledger on 2026-09-01 and the section collapses to the finance block. No dated offer can outlive its programme sheet.
- **Suspense boundaries are per section, not one for all twelve.** Sections 1 and 2 are eager; the rest are lazy with their own fallbacks, so a slow chunk no longer blanks the whole page below the nav the way `HomePage.tsx:70` does now.

What genuinely has to change at 400: the one-per-body-type rule becomes a `featured` flag on the feed, and `/inventory` becomes the sole owner of pagination, which it already is at `PAGE_SIZE = 9`.

---

## 6. THE ONE RISK

**The entire page is built on a claim the dealership has never published.** `DELIVERY_CLAIM` comes from the brief, not from their site: `dealerContent.ts`, which is a transcription of the live homepage, contains no delivery claim at all. This composition takes that sentence and makes it the largest type on the domain, the second section, and the spine of the argument for buying from a store in a town of 3,000. If the 300 mile radius turns out to be conditional, discretionary, or limited to certain vehicles, the failure is not one bad sentence, it is the page. Nothing here degrades gracefully into a conventional dealer homepage, because the conventional sections were removed rather than demoted.

The mitigation is a signature, not a design change: `DELIVERY_CLAIM`, `dealerInfo.phone` (flagged unverified at `vehicles.ts:307`), `dealerInfo.hours`, and "family-owned" all need confirming before this ships, and delivery needs confirming first because the other three only cost a line each.

The second face of the same risk is cheaper to fix. A shopper in Ashtabula, eight minutes away, meets a headline about a benefit they do not need, and a 300 mile promise can read as a distribution warehouse rather than a neighbour. Three things hold that: the H1's third line says "of Jefferson, Ohio", the search band and a priced vehicle are in the same viewport, and section 7 is their store photographed from the air. If analytics show local intent dominating, the correction is swapping sections 2 and 3 in `HomePage.tsx`, which changes the argument order without touching a single component.