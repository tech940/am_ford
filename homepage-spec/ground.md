## 1. Sections the homepage renders, in order

Source of truth: `src/components/home/HomePage.tsx:64-85`. Everything from line 71 down is inside one `<Suspense fallback={null}>` (line 70), so a single slow chunk blanks all twelve.

| # | Section | File | Verdict | Why |
|---|---|---|---|---|
| — | `AmbientBackground` | `fx/AmbientBackground.tsx` | **REWRITE** | 42 permanently-animating composited layers under every section; see §2. |
| — | `CursorGlow` | `fx/CursorGlow.tsx` | **DELETE** | Two blurred divs chasing the pointer. Zero information, desktop-only, costs a rAF spring loop on every mouse move. |
| 1 | `HomeNav` | `sections/HomeNav.tsx:66` | **KEEP** | Sound. One fix: the logo at `HomeNav.tsx:48` is a hotlink to `di-uploads-**development**.dealerinspire.com` — a third-party *development* bucket, no local copy, no srcset, sitting in the LCP viewport. |
| 2 | `Hero` | `sections/Hero.tsx:68` | **REWRITE** | Three factual defects: "Browse real-time inventory" (`Hero.tsx:229`) over a hard-coded 6-item array; "{vehicles.length} vehicles available" → renders "6 vehicles available" (`Hero.tsx:155`); alt text asserts a generic stock photo is "at AM Ford in Jefferson" (`Hero.tsx:187`). The search card itself (`FindYourRightCarCard`, lines 38-167) is genuinely good — bands and conditions are derived from inventory, so no control can resolve to an empty page. Keep the card, rewrite the copy. |
| 3 | `ShopByCategory` | `sections/ShopByCategory.tsx:69` | **REWRITE** | Concrete link bug: the Trucks card copy promises "F-150 in gas **and all-electric Lightning** form" (`ShopByCategory.tsx:58`) but links `search={{ type: "Truck" }}` (`:102`), and the Lightning is `type: "EV"` (`vehicles.ts:150`) — the card advertises two vehicles and delivers one. The `Mustang` card (`:69-74`) describes one specific unit's option content as if it were a category. |
| 4 | `MostSearchedCars` | `sections/MostSearchedCars.tsx:71` | **REWRITE** | "In stock right now" / "Everything below is on the lot in Jefferson today" (`:53-58`) over placeholder data. "View offers" (`:156`) opens `OfferPopup` with `pageSource="MostSearched"` (`:188`), which `OfferPopup.tsx:23-30` labels internally **"500 off Popup"** — the exact unsourced offer `dealerContent.ts:130-134` says must not ship. |
| 5 | `FeaturedSpotlight` | `sections/FeaturedSpotlight.tsx:72` | **DELETE** | Third consecutive render of the same six records. Also hard-codes the count in prose: "Three of the six vehicles on the lot" (`:67`) while the set is `vehicles.slice(0, 3)` (`:22`) — the sentence silently lies the moment inventory changes. |
| 6 | `ExtraordinaryCarousel` | `sections/ExtraordinaryCarousel.tsx:73` | **DELETE** | Fourth render of the same six. A 460px-tall coverflow with `rotateY` on six spring-animated cards (`:117-137`), 6s autoplay `setInterval` (`:69`), a `ResizeObserver` (`:51`), and an `IntersectionObserver` (`:44`). Copy is false: "Every vehicle on the lot today… All 6 of them" (`:97-98`) and "Browse all 6 vehicles" (`:258`). Largest homepage section chunk at 7.1 KB raw / 2.6 KB gz. |
| 7 | `FeaturedCars` | `sections/FeaturedCars.tsx:74` | **REWRITE** | This should be *the* inventory block, the other three deleted into it. Fixes: "The whole lot, priced and specified" (`:176`) is false per `dealerContent.ts:13-16`; drop the six `CountUp` instances (`:106`); `Reveal` is imported at `:8` and never used (dead import — lint should be failing on this). The per-card `getBoundingClientRect()` in `onPointerMove` (`:38-39`) is a forced layout read per pointer event ×6 cards. |
| 8 | `DeliveryHighlight` | `sections/DeliveryHighlight.tsx:75` | **KEEP** | The best section on the page. Uses `DELIVERY_SHORT`/`DELIVERY_SHIPPING` verbatim (`:80-81`), never shortens to "free nationwide delivery", and carries its own qualifier ("Shipping charges may apply…", `:133-137`). |
| 9 | `WhyChooseUs` | `sections/WhyChooseUs.tsx:76` | **REWRITE** | Mounts **five separate WebGL canvases** (`:81`, one `Scene3D` per card) to draw five icons. See §2 — this is the single largest runtime item on the page. Copy is also unverifiable: "Paperwork prepared before you arrive" (`:37`), "Our advisors are car people first" (`:42`), "on-site workshop with factory-trained technicians" (`:56`) — none of it in `dealerContent.ts`. |
| 10 | `DealershipBanner` | `sections/DealershipBanner.tsx:77` | **REWRITE** | The file's own comment (`:12-20`) insists on a real photo of the store, then hotlinks it from `di-uploads-development.dealerinspire.com` (`:22-23`) as a bare `<img>` (`:47`) — no srcset, no AVIF. Meanwhile `am-ford-aerial` (1920×480) and `am-ford-lot-banner` (1920×640) are sitting in `images.gen.ts` unused. The `onError` fallback (`:50`) is `dealership.jpg`, which the same comment says shows a sign reading "Fordom". |
| 11 | `ServiceAndParts` | `sections/ServiceAndParts.tsx:78` | **REWRITE** | Nine service cards + three promises, zero imagery, while the `service` key (1600×900) exists unused. Claims not in `dealerContent.ts`: "Ford-trained technicians" (`:77`), "Genuine Ford and Motorcraft parts" (`:83`), "Ford Pickup and Delivery" (`:88-90`). The dealership's own published service line is one sentence: `dealerContent.ts:101-102`. |
| 12 | `VisitUs` | `sections/VisitUs.tsx:79` | **KEEP** | Structurally the most correct section: every fact reads from `dealerInfo`, nothing hard-coded. One caveat — the Google Maps `<iframe>` (`:114`) is a third-party embed with cookies; it is `loading="lazy"` but still a consent surface. |
| 13 | `Financing` | `sections/Financing.tsx:80` | **REWRITE** | Half the desktop section is a decorative WebGL wheel (`:108-110`) that pulls the 954 KB three.js chunk. `StaticRim` (`:43-87`) is the same thing in ~40 lines of SVG and is already written — ship it and delete the canvas. Copy claim "Ohio credit unions and national lenders" (`:24`) is not in `dealerContent.ts`. |
| 14 | `AreasWeServe` | `sections/AreasWeServe.tsx:81` | **KEEP** | Tier lists come from `SERVED_MARKETS`; all eight of `dealerContent.ts:200-209` `NAMED_AREAS` appear across the tiers. Markets render as text pills, not links, because the city pages don't exist (`:16-19`) — correct call. |
| 15 | `FinalCTA` | `sections/FinalCTA.tsx:82` | **KEEP** | Trim only: 14 `motion.span` with `repeat: Infinity` (`:43-51`) never stop. |
| 16 | `HomeFooter` | `sections/HomeFooter.tsx:85` | **REWRITE** | Same dev-bucket logo hotlink (`:33`). "A family-owned Ford dealership" (`:45`) is unverified — see §4. |

**Headline structural finding:** `HomePage.tsx:71-74` renders four consecutive sections — `MostSearchedCars`, `FeaturedSpotlight`, `ExtraordinaryCarousel`, `FeaturedCars` — that all display the same six `vehicles` records in four different layouts. Collapsing to one is the largest single improvement available.

## 2. fx/ components — usage and cost

Built chunk sizes are real, measured from `dist/client/assets` (build of Aug 14 11:32; `DealershipBanner` postdates it).

**`AmbientBackground.tsx`** — used, eager (`HomePage.tsx:3`, lands in `main-DsBZun4r.js`, 1,058,735 B raw / 319,161 B gz).
Renders a `position: fixed` layer holding 3 blurred blobs at `blur(70/80/90px)` on 46rem/40rem/36rem boxes (`:59-84`), 2 beams at `blur(26/30px)` (`:90-112`), 2 breathing radial gradients (`:46-54`), a vignette (`:138-144`), and **34 dust spans** each with its own infinite CSS animation (`:31`, `:116-135`). That is ~42 permanently-composited layers plus two `useTransform` scroll subscriptions (`:26-27`) driving parallax on a fixed element — i.e. compositor work on every scroll frame for the whole session. Large-radius blur is the expensive part on integrated GPUs.

**`CursorGlow.tsx`** — used, eager (`HomePage.tsx:4`). 4 `useSpring`s (`:15-18`) + a `pointermove` listener (`:27`), driving two blurred radial divs (520px and 160px). Gated to `(pointer: fine)` and non-reduced-motion (`:21`, `:31`). Cost: a rAF spring loop for as long as the pointer moves; negligible bundle.

**`Reveal.tsx`** — used by 9 sections. Counting rendered instances: ~16 `Stagger`, ~61 `StaggerItem`, ~9 `Reveal` ≈ **86 extra `motion.div` wrappers** on the page, of which the 25 `Stagger`/`Reveal` each register a `whileInView` IntersectionObserver. Every one also injects a wrapper `<div>` into the DOM in both the mounted and pre-mount branches (`:69-71`, `:102`, `:129`). Two things it gets right and should not be regressed: transform-only variants so a missed observer can never strand content invisible (`:19-27`), and plain visible markup on the server so crawlers read the copy (`:9-13`).

**`ui.tsx`** — used by 5 sections.
- `CountUp` (`:19-57`) — 6 instances, all in `FeaturedCars`. Each runs `animate()` with `onUpdate: setText` for 1.8 s ≈ 60 fps → roughly **650 React re-renders** for six price labels that are already correct in the SSR HTML (`:38`).
- `MagneticButton` (`:63-99`) — 9 instances (DeliveryHighlight 2, ServiceAndParts 2, Financing 1, AreasWeServe 2, FinalCTA 2). Each holds 2 springs and calls `getBoundingClientRect()` inside `onPointerMove` (`:86`) — a forced synchronous layout per pointer event.
- `ctaPrimary` / `ctaGhost` (`:101-111`) — class strings, free.

**`Scene3D.tsx`** — used by `WhyChooseUs.tsx:81` and `Financing.tsx:108`. This is the big one.
The gate itself (`hooks.ts:33-61`) is well built: ≥1024px, ≥4 cores, no Save-Data, no reduced-motion, and it reports *why* it declined via `data-scene3d` (`Scene3D.tsx:78-87`). When it passes, the homepage instantiates **six WebGL contexts** — five `WhyObject` (one per `REASONS` card) plus one `RimScene` — each a separate `<Canvas>` with `antialias: true`, `powerPreference: "high-performance"`, `dpr [1, 1.75]` (`WhyObject.tsx:361-366`, `RimScene.tsx:255-259`), each building its own `Environment` cubemap (`WhyObject.tsx:309`, `RimScene.tsx:285`). Browsers cap live contexts around 8–16; six on one route is close to the wall. `WhyObject`'s `ContactShadows` (`:342-350`) omits `frames`, so drei defaults to `Infinity` — a depth pass re-rendered **every frame, five times over**. `RimScene` sets it explicitly (`:280`).
Bundle: `Lightformer-BhmflQVw.js` = **954,102 B raw / 260,259 B gz** (three + fiber + drei), plus `RimScene-CdzxrByC.js` 8,677 B / 3,103 B gz and `WhyObject-BuzRsDOI.js` 8,040 B / 2,581 B gz. Desktop-only, and only for decorative geometry. `Financing.tsx` already ships `StaticRim` as a pure-SVG equivalent (`:43-87`), and `WhyChooseUs` already ships lucide icon fallbacks (`:13-30`).

Per-section chunk sizes (raw / gz): ExtraordinaryCarousel 7,149/2,617 · ServiceAndParts 6,675/2,787 · FeaturedSpotlight 6,231/2,257 · MostSearchedCars 5,285/2,090 · FeaturedCars 4,654/2,012 · DeliveryHighlight 4,598/1,997 · Financing 4,541/1,981 · AreasWeServe 4,132/1,864 · VisitUs 4,062/1,412 · WhyChooseUs 3,184/1,621 · FinalCTA 2,323/1,194 · DealershipBanner 1,329/786. Homepage route chunk `index-DDeZkL13.js` = 29,315/8,676. All twelve lazy sections together are ~22 KB gz — **the lazy-loading is not where the weight is**; `main` (319 KB gz) and the three.js chunk (260 KB gz) are.

## 3. Image keys in `images.gen.ts`

`src/assets/images.gen.ts` is 312 lines with **14 keys** (a stale 9-key version exists in some caches — the current file, regenerated Aug 14 14:21, has five `am-ford-*` keys the old one lacked).

| Key | Intrinsic W×H | Variant widths | Used on homepage? |
|---|---|---|---|
| `am-ford-aerial` | 1920 × 480 | 400, 640, 960, 1280, 1920 | **No** |
| `am-ford-front` | 768 × 576 | 400, 640 | **No** |
| `am-ford-front-lot` | 1200 × 800 | 400, 640, 960 | **No** |
| `am-ford-lot-banner` | 1920 × 640 | 400, 640, 960, 1280, 1920 | **No** |
| `am-ford-new-bronco` | 1200 × 800 | 400, 640, 960 | **No** |
| `car-bronco` | 1280 × 800 | 400, 640, 960, 1280 | Yes (via `imageNameFromSrc`) |
| `car-escape` | 1280 × 800 | 400, 640, 960, 1280 | Yes |
| `car-explorer` | 1280 × 800 | 400, 640, 960, 1280 | Yes |
| `car-lightning` | 1280 × 800 | 400, 640, 960, 1280 | Yes |
| `car-mustang` | 1280 × 800 | 400, 640, 960, 1280 | Yes |
| `dealership` | 1600 × 900 | 400, 640, 960, 1280 | Only as a raw `onError` fallback (`DealershipBanner.tsx:50`), not via `ResponsiveImage` |
| `hero-truck` | 1920 × 1080 | 400, 640, 960, 1280, 1920 | Yes — the only literal `name=` on the page (`Hero.tsx:186`) |
| `interior` | 1600 × 900 | 400, 640, 960, 1280 | **No** |
| `service` | 1600 × 900 | 400, 640, 960, 1280 | **No** |

Three notes. (a) `am-ford-lot-banner` at 1920×640 is dimensionally an exact match for the `width={1920} height={640}` hotlinked banner in `DealershipBanner.tsx:47-56` — the local asset the section should be using already exists. (b) `images.gen.ts` statically imports all 165 generated files (`i0`–`i164`), so every URL string for the 8 unused keys ships in `main`. (c) `imageNameFromSrc` (`ResponsiveImage.tsx:74-77`) matches by longest-key `startsWith`, which correctly keeps `am-ford-front-lot` from being shadowed by `am-ford-front`.

## 4. Factually wrong or unverifiable against `dealerContent.ts`

**`dealerContent.ts` has zero importers.** `grep -rn "dealerContent\|PRIMARY_ACTIONS\|HOME_BLOCKS\|INCENTIVES\|PRICING_STANCE\|NAMED_AREAS\|LINEUP" src/ scripts/` returns nothing outside the file itself. The one file in the repo containing the dealership's actual published copy is dead code, and the homepage is written entirely against `vehicles.ts`.

**A. The "six vehicles = the lot" claim is false, and the homepage states it seven times.**
`dealerContent.ts:13-16` is explicit: *"`vehicles.ts` holds six vehicles. The live site sells the full Ford lineup and a used department including certified pre-owned, used trucks, and stock under $25,000. The six records are placeholder, not the lot."* Against that:
- `Hero.tsx:155` — "6 vehicles available"
- `Hero.tsx:229` — "Browse **real-time** inventory" (a static array)
- `MostSearchedCars.tsx:56-57` — "Everything below is on the lot in Jefferson today"
- `FeaturedSpotlight.tsx:67` — "Three of the **six** vehicles on the lot"
- `ExtraordinaryCarousel.tsx:97-98` — "Every vehicle on the lot today… All 6 of them"
- `ExtraordinaryCarousel.tsx:258` — "Browse all 6 vehicles"
- `FeaturedCars.tsx:176` — "The whole lot, priced and specified"

**B. Two in-repo comments assert a "no used inventory" fact that `dealerContent.ts` contradicts.** `ShopByCategory.tsx:49-54` ("an inventory that is Ford only and **has no used vehicles at all**") and `vehicles.ts:233-236` ("the lot holds zero used units and the brief forbids advertising used stock"). `dealerContent.ts:16-17` calls those conclusions *"wrong about the business, though still correct about the data."* These comments are steering future edits off a false premise and should be corrected first.

**C. The lineup shown is a fraction of the real one.** `dealerContent.ts:40-90` lists Maverick, Ranger, Super Duty, Transit, E-Transit, Mach-E, Edge, Expedition, Bronco Sport, Chassis Cab. The homepage's categories (`ShopByCategory.tsx:55-81`) name only F-150, Lightning, Explorer, Bronco, Escape, Mustang — the six placeholder units. No commercial/Transit presence anywhere, despite `HomeFooter.tsx:12` linking `/commercial` and `dealerContent.ts:115-119` carrying approved commercial copy.

**D. Offers.** `dealerContent.ts:147-183` holds four real incentives with PGM numbers and manufacturer disclaimers (0% APR / PGM #21624; 90-day deferral; $1,000 SSE down-payment assistance / PGM #14196; 2-year maintenance / PGM #76324), each with `endsOn: "2026-08-31"` and an `activeIncentives()` helper (`:186-188`). **None appear on the homepage.** Instead, `MostSearchedCars.tsx:156` ("View offers") and `FeaturedSpotlight.tsx:78` ("Ask about this vehicle") open `OfferPopup`, whose internal source label is `"500 off Popup"` (`OfferPopup.tsx:23-30`) — precisely the offer `dealerContent.ts:130-134` flags as having "no voucher, code or expiry anywhere in the system."

**E. Struck-through MSRPs are unbacked discount claims.** `MostSearchedCars.tsx:140-144`, `FeaturedSpotlight.tsx:106-110`, `FeaturedCars.tsx:111-115` all render `price` against a line-through `msrp` from placeholder records (e.g. `vehicles.ts:59-60`, $64,995 vs $68,420). Nothing in `dealerContent.ts` supports any specific saving. The dealership's own published pricing stance is `PRICING_STANCE = "We will beat any deal"` (`dealerContent.ts:197`) — their claim, publishable, and completely unused.

**F. Phone and hours are flagged-unverified in their own source file.** `vehicles.ts:307` — *"NOTE: phone number is not stated in the brief — verify with the dealership."* `(440) 998-2151` is rendered four times (`HomeNav.tsx:75`, `HomeNav.tsx:123`, `VisitUs.tsx:74`, `HomeFooter.tsx:87`). The `hours` array (`vehicles.ts:320-325`) appears in neither the brief nor `dealerContent.ts` and is published as fact at `VisitUs.tsx:89-94`.

**G. `DELIVERY_CLAIM` is brief-sourced, not corroborated by the dealership's published copy.** "Free home delivery within 300 miles and vehicle shipping available to all 50 states" (`vehicles.ts:332-335`) appears at `ShopByCategory.tsx:128`, `DeliveryHighlight.tsx:80-87`, `VisitUs.tsx:41`, `AreasWeServe.tsx:103`. `dealerContent.ts` — the transcription of the live homepage — contains no delivery claim at all. The wording is used correctly and consistently and carries a qualifier at `DeliveryHighlight.tsx:133-137`; flagging it as needing confirmation, not correction.

**H. "Family-owned" and "one store" are unverified.** `Hero.tsx:220`, `DealershipBanner.tsx:69-74`, `HomeFooter.tsx:45`, `VisitUs.tsx:40`, `AreasWeServe.tsx:98`. Neither claim appears in `dealerContent.ts`; `HOME_BLOCKS.visit` (`:120-123`) says only "Located in Jefferson, OH". `dealerInfo.formerName = "Nassief Ford"` (`vehicles.ts:311`) implies a change of ownership, which makes "family-owned" the kind of claim worth confirming before it appears in four places.

**I. Unverifiable service, finance, and process claims** (none in `dealerContent.ts`, whose entire service block is one sentence at `:101-102`): "Ford-trained technicians" / "Ford diagnostic equipment" (`ServiceAndParts.tsx:77-79`), "Genuine Ford and Motorcraft parts" (`:83`), "Ford Pickup and Delivery… for eligible service customers" (`:88-90`), the nine-item service menu (`:26-72`), "Ohio credit unions and national lenders" (`Financing.tsx:24`), "First-time buyers and buyers rebuilding credit are welcome" (`:32`), "Paperwork prepared before you arrive" (`WhyChooseUs.tsx:37`), "on-site workshop with factory-trained technicians" (`:56`), "a few minutes from the Route 11 and I-90 interchanges" (`VisitUs.tsx:40-41`).

**J. Minor.** `Hero.tsx:260` states "Factory warranty included" unqualified in a page that also lists a 2024 CPO Escape (`vehicles.ts:198-226`). `AreasWeServe`'s `SERVED_MARKETS` (`vehicles.ts:338-368`) names 29 places against `NAMED_AREAS`' 8 (`dealerContent.ts:200-209`) — all 8 are covered, the other 21 are uncorroborated but low-risk for a "we serve" list.