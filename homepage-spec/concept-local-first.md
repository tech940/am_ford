# AM FORD HOMEPAGE — COMPOSITION: "THE STORE"

**Angle executed:** the opening argument is not a vehicle. It is a photograph of 1059 State Route 46 North and a phone number set large enough to read from across the room. Inventory is the fourth-largest thing on the page, on purpose.

**Three corrections to the ground truth I was given, verified in the working tree just now:**
- `src/assets/images.gen.ts` has **13** keys, not 14. There is no `dealership` key and no `src/assets/dealership.jpg` on disk. The `onError` fallback in `DealershipBanner.tsx:44-46` already points at `am-ford-front-lot.jpg`, so that section has been fixed since the audit was written. It still gets deleted, for a different reason (see §4).
- `src/lib/vehicles.ts`, not `src/data/vehicles.ts`.
- The Ledger barrel is `src/components/ledger/index.ts` and exports 18 icons. This composition uses **three** of them.

---

## 1. SECTION LIST

Heights are rendered height at 1440x900 / 375x812. Left column number is the marginal index described in §2.

| # | Section | Purpose (one sentence) | Contains | Real copy / data | Height |
|---|---|---|---|---|---|
| — | `HomeNav` | Get to inventory, service, and the phone without scrolling. | Type wordmark "AM FORD" over "JEFFERSON, OHIO", five text links, phone as navy text. No filled button, no logo image. | `dealerInfo.name/locality/phone/phoneHref` (`vehicles.ts:309-319`) | 72 / 60 sticky |
| 01 | **THE STORE** | Prove this is a real place at a real address before asking for anything. | Photograph of the lot occupying columns 6-12 full-bleed right; type block in columns 1-5; one filled button. | `am-ford-front-lot` (1200x800), `dealerInfo.address`, `dealerInfo.hours`, `DELIVERY_CLAIM` (`vehicles.ts:332`) | 828 / 640 |
| 02 | **FIND ONE** | Turn intent into a search that cannot resolve to an empty page. | `FindYourRightCarCard` rewritten as one horizontal ledger strip: condition toggle, budget select, body style select, filled search button. | `FILTERABLE_CONDITIONS`, `PRICE_BANDS`, `FILTER_OPTIONS.types` (`vehicles.ts:243-301`). Existing logic at `Hero.tsx:38-167` kept whole. | 172 / 428 |
| 03 | **THE COUNTER** | Reproduce the four things the dealership itself puts first, in its own order. | Four text destinations on one rule-divided row. No icons, no cards, no descriptions. | `PRIMARY_ACTIONS` verbatim (`dealerContent.ts:20-29`): New Vehicles, Used Vehicles, Schedule Service, Value Your Trade | 132 / 272 |
| 04 | **THE LOT** | The single inventory block, replacing four. | Heading, `PRICING_STANCE` as the standing line beneath it, six `VehicleCard`s (first one `layout="row"`, five `layout="tile"` in a 2-up grid at 1024+), one text link to `/inventory`. | `vehicles`, `PRICING_STANCE` (`dealerContent.ts:197`), `VehicleCard` (`src/components/site/VehicleCard.tsx`) | 1240 / 2340 |
| 05 | **WE BRING IT TO YOU** | State the one advantage a Cleveland dealer cannot copy. | Two-line statement, the mileage/state figures set as ledger values, the qualifier in the same block, one text link to `/nationwide-vehicle-delivery`. Kept largely as built. | `DELIVERY_SHORT`, `DELIVERY_SHIPPING` (`vehicles.ts:334-335`), existing qualifier at `DeliveryHighlight.tsx:133-137` | 560 / 720 |
| 06 | **THE LINEUP** | Tell the truth that six records cannot: they sell 20 models across four groups. | Four grouped text indexes. `hasPage: true` renders a link to `/ford/$model`; `hasPage: false` renders plain ink text. One photograph (`am-ford-new-bronco`) in the right third. | `LINEUP` (`dealerContent.ts:40-90`), routes confirmed at `src/routes/ford.$model.tsx` + six slugs in `fordModels.ts` | 660 / 1180 |
| 07 | **WHAT IS RUNNING NOW** | Show the four real, programme-numbered incentives and nothing else. | Four rows: label, detail, programme number, end date. Disclaimer set at 12px beneath each. Section does not render at all when `activeIncentives()` is empty. | `INCENTIVES` + `activeIncentives(new Date())` (`dealerContent.ts:147-188`) | 470 / 760, or 0 |
| 08 | **THE OTHER FOUR COUNTERS** | Service, trade, finance and commercial, in the dealership's own published words. | Four full-width rows separated by hairline rules. Left: title. Right: body plus one text link. Row 1 carries the `service` photograph at 480x270. | `HOME_BLOCKS.service / .trade / .finance / .commercial` verbatim (`dealerContent.ts:99-124`), `service` image key | 640 / 980 |
| 09 | **AERIAL** | Change chapters from what we sell to where we are, with the one image that is unambiguously this store. | Full-bleed `am-ford-aerial` (1920x480, cropped to 1920x360). No text on it. No parallax. No veil. | `am-ford-aerial` | 300 / 180 |
| 10 | **WHERE WE ARE** | Address, hours, phone, directions, with nothing hard-coded. | Two columns: the ledger of facts, and a static bordered map placeholder that loads the Google iframe only on click. | `dealerInfo` entirely, `HOME_BLOCKS.visit` (`dealerContent.ts:120-123`). Structure from the existing `VisitUs.tsx`. | 620 / 900 |
| 11 | **AREAS WE SERVE** | Name the towns, without linking pages that do not exist. | Three tiers as text, not links. Kept as built. | `SERVED_MARKETS` (`vehicles.ts:338-368`), cross-checked against `NAMED_AREAS` | 440 / 700 |
| 12 | **THE LAST LINE** | End the page the way it opened, with a person to call. | The phone number at 72px navy Archivo Expanded as a `tel:` link, today's hours beneath at 17px, one text link "Get directions". No button, no heading, no form. | `dealerInfo.phone`, `dealerInfo.hours` | 320 / 380 |
| — | `HomeFooter` | Navigation and the legal floor. | Type wordmark, four link columns, address, phone, hours. No logo image, no "family-owned" claim. | `dealerInfo`, route list from `src/routes/` | 380 / 640 |

Desktop total ≈ 6,840px ≈ 7.6 viewports. Twelve numbered sections, down from sixteen.

**Structural change to `HomePage.tsx`:** sections 01, 02 and 03 ship in the route chunk, not behind `React.lazy`. Sections 04-12 each get **their own** `<Suspense>` boundary. The current single boundary at `HomePage.tsx:70` means one slow chunk blanks twelve sections; the lazy sections total only ~22 KB gz, so the boundary is buying nothing and risking everything.

---

## 2. THE OPENING

### 1440 x 900

Grid: 12 columns, 64px outer margins, 24px gutters, column = 101.3px. Ground `#FAF8F5`. Ink `#1A1714`. Navy `#002C5F` appears **twice** in this viewport and nowhere else: the phone number, and the button fill.

**Nav, 72px.** Left, the wordmark as type, no image: "AM FORD" in Archivo Expanded 600 at 20px / tracking 0.06em, with "JEFFERSON, OHIO" beneath at 11px Archivo 500 / tracking 0.1em / ink at 55%. This deletes the `di-uploads-development.dealerinspire.com` hotlink from the LCP viewport (`HomeNav.tsx:48`) without needing a logo asset that does not exist. Right, five links at 14px Archivo 500, then `(440) 998-2151` at 15px Archivo Expanded 600 in navy. Bottom edge, 1px rule at ink/12%.

**Photograph, columns 6 through 12, bleeding to the right viewport edge: 804 x 828.**
`<ResponsiveImage name="am-ford-front-lot" priority aspect={{width:804,height:828}} sizes="(min-width:1024px) 56vw, 100vw" />`, `object-cover`, `object-position: center`, radius 0. Alt text: `The AM Ford lot at 1059 State Route 46 North in Jefferson, Ohio.` That alt is true, which is the fix for `Hero.tsx:187` asserting a stock photo is "at AM Ford in Jefferson".

No overlay. No veil. No gradient. No parallax. No text on the photograph. A single 1px ink/12% rule on its left edge is the only thing separating it from the type. This is the "never share a register" rule made literal: at 1440 the photograph and the typography are adjacent, not layered.

**Type block, columns 1 through 5 (536px), vertically centered in the 828px.**

H1, two registers inside one heading, address first so there is no kicker above anything:
- `1059 State Route 46 North` — Archivo Expanded 600, **72px / 70px line-height**, tracking -0.02em, ink. Wraps to two lines at 536px, which is correct: it reads like a sign.
- `Ford sales and service in Jefferson, Ohio. Free home delivery within 300 miles and vehicle shipping available to all 50 states.` — Archivo 400, 20px / 30px, ink at 76%, 24px below. The delivery claim in the approved wording appears in the first viewport as a sentence, not a badge.

1px rule, full width of the five columns, 32px of air above and below.

Two-row label/value ledger, labels Archivo 500 / 12px / tracking 0.12em / uppercase / ink 50%, in a 96px left column:
```
OPEN TODAY    9:00 AM to 8:00 PM        17px Archivo 500
PHONE         (440) 998-2151            24px Archivo Expanded 600, navy, tel: link
```
`OPEN TODAY` is computed against `dealerInfo.hours` and today's date, and renders `Closed today` on Sunday. It never claims open when it is closed.

**The single primary action.** One filled control in the viewport: Ledger `Button` variant primary, navy fill, white label, **2px radius**, 48px tall, 32px horizontal padding, label `Browse inventory`. Not "See the lot", not "View all 6". Beneath it, 20px down, one text link at 14px with a hover underline: `Get directions`, the verbatim label from `HOME_BLOCKS.visit.primary`.

**The scroll cue is content, not a chevron.** The 900px viewport cuts 36px into section 02, so the visitor sees the top rule and the upper edge of the three search controls. Nothing bounces, nothing pulses.

**Deleted from this viewport:** `AmbientBackground` (42 composited layers, two scroll subscriptions), `CursorGlow`, the entrance `motion.div` on the search card (`Hero.tsx:59-64`), the `{vehicles.length} vehicles available` counter, and "Browse real-time inventory".

### 375 x 812

Stacked, because at 375 "never share a register" means sequence rather than adjacency.

- **Nav, 60px.** Wordmark left. Phone as navy text at 15px, 44px tap height. Menu button 44x44 opening the Ledger `Sheet`.
- **Photograph, 375 x 280, full-bleed, radius 0**, `aspect={{width:375,height:280}}`, `priority`. Same alt. It is first because the photograph is the argument.
- **Type block, 20px side padding, 28px top.**
  - `1059 State Route 46 North` — Archivo Expanded 600, **40px / 38px**, tracking -0.02em. Three lines.
  - Descriptor — Archivo 400, 17px / 26px, ink 76%.
  - 1px rule, 24px air either side.
  - `OPEN TODAY` row: label 12px, value 16px.
  - `PHONE` row: label 12px, value **22px navy Archivo Expanded**, `tel:` link, 44px tap height.
  - Filled `Button`, full width, 52px tall, 2px radius: `Browse inventory`.
  - `Get directions` text link, 15px, 44px tap height.
- Running total 60 + 280 + ~300 = 640px, so the section 02 rule and the first select appear at ~660px, inside the fold.
- **`MobileStickyCTA` is gated on an IntersectionObserver against section 01 and contains the phone, not "browse".** Once the store scrolls away, the persistent mobile action is calling the store. That is the angle expressed as structure rather than as a sentence claiming someone answers.

---

## 3. HIERARCHY

**Largest: the photograph of the lot.** 804 x 828 = 665,712 px², 37% of the first viewport at 1440x900, and 100% of the width at 375. Nothing else on the page is given more than a third of that area. It is largest because it is the only *evidence* on the page. Every other local-dealer claim in the repo is an assertion someone typed ("family-owned", "car people first", "paperwork prepared before you arrive"), and §4H of the audit is right that they are unverified. A photograph of the actual building is the one thing that argues "small local store" without making a claim that needs sign-off.

**Second: the street address at 72px.** It is the headline because an address is a fact, it is the single most local piece of information the business owns, and no competitor's homepage uses one. It also does the SEO work the fabricated headlines were doing badly, since the H1 now contains "Ford sales and service in Jefferson, Ohio" as its second register.

**Third: the phone number.** 24px navy in the first viewport, 72px navy in section 12, navy in the nav, navy in the footer, and the sole content of the mobile sticky bar. Third by size but first by repetition. The angle is "a person answers the phone", and the only honest way to say that is to make the number impossible to miss rather than to write a sentence asserting it. Navy is spent on exactly two things per viewport, so the number is always one of the two most saturated marks on screen.

**Fourth, deliberately: inventory.** The lot section is physically the tallest (1,240px) but it is below two full screens, its cards are on the ink ground rather than paper so they read as a separate register, and its heading is 40px against the opening's 72px. A visitor whose primary need is a 900-unit selection is not a visitor this composition wins, and pretending otherwise with six placeholder records is what produced seven false statements in the current build.

---

## 4. WHAT I DELIBERATELY LEFT OUT

**Three of the four inventory sections.** `MostSearchedCars`, `FeaturedSpotlight` and `ExtraordinaryCarousel` render the same six records `vehicles` in three more layouts. Collapsing to one section is the largest single improvement available and it removes six of the seven "the six vehicles are the lot" falsehoods in one edit.

**`WhyChooseUs` entirely, not rewritten.** Five WebGL canvases to draw five icons, and all five copy claims are unverifiable against `dealerContent.ts`. Rewriting it would produce an icon-plus-heading-plus-paragraph triad, which is explicitly banned. Its job is done better by the photograph and the phone. Deleting it also removes one of the two importers of the 954 KB three.js chunk.

**The three.js dependency, both call sites.** `Financing.tsx:43-87` already contains `StaticRim`, an SVG equivalent, written and unused. `WhyChooseUs` already ships lucide fallbacks. Shipping those and deleting both `<Canvas>` mounts removes 260 KB gz, six WebGL contexts, and five `ContactShadows` depth passes that re-render every frame because `frames` is omitted at `WhyObject.tsx:342-350`.

**`DealershipBanner`.** It is not wrong any more, it is redundant. Section 01 already carries a real photograph of the store at four times the prominence. Two full-bleed photographs of the same building on one page halves the impact of both.

**`AmbientBackground` and `CursorGlow`.** 42 permanently-composited layers with large-radius blur, plus a spring loop on pointer move, under a page whose brief bans unnecessary animation and glassmorphism. Section 09 replaces the entire ambient layer with one photograph that means something.

**`CountUp` (6 instances, ~650 React re-renders) and `MagneticButton` (9 instances, a forced layout read per pointer event).** Prices are already correct in the SSR HTML. Animating a number that is not changing is decoration pretending to be data.

**Struck-through MSRP.** Rendered in three sections today against placeholder records. Nothing in `dealerContent.ts` backs a specific saving. The replacement is `PRICING_STANCE`, "We will beat any deal", set once under the lot heading. It is their claim, published by them, and it is stronger than a $3,425 strike-through anyway.

**`OfferPopup`.** Its internal source label is "500 off Popup" and `dealerContent.ts:130-134` says the offer has no voucher, code, or expiry anywhere in the system. Section 07 replaces it with four incentives that carry PGM numbers, end dates, and manufacturer disclaimer text.

**The Google Maps iframe as a load-time embed.** Section 10 renders a bordered block holding the address and hours, and loads the iframe only after a click. That removes a third-party cookie surface from initial load, and the consent banner question with it.

**"Family-owned", in all four places.** Unverified, and `dealerInfo.formerName = "Nassief Ford"` implies an ownership change that makes it exactly the claim worth confirming first. The composition does not need it: a photograph of a one-building lot in a town of 3,000 says "small and local" without anyone signing off on a sentence.

**Every eyebrow, kicker, gradient, glass panel, stat counter, testimonial, review score and decorative icon.** The page uses three icons total: `IconSearch` in the search button, `IconChevronDown` on the two selects, `IconArrowRight` on the two text links in section 04. The left-margin section numbers ("01" through "12", Archivo 500 / 12px / ink 35%, in the left gutter at 1280+) sit *beside* their headings on the same baseline, never above them. That is a marginal index, not a kicker, and it disappears below 1280.

**Any `LINEUP` model with `hasPage: false` as a link.** Fourteen of the twenty models render as plain ink text in section 06. They still appear, because the business sells them and the current homepage pretends it sells six.

---

## 5. HOW IT SCALES FROM 6 TO 400

**No component renders a count as prose.** Zero instances of `vehicles.length` in copy, zero hard-coded "six" or "three". Section 04's heading is followed by "A selection from current stock", which is true at 6 and true at 400.

**Section 06 is the section that carries the truth at n=6.** `THE LINEUP` is driven by `LINEUP` from `dealerContent.ts`, not by inventory, so it is correct today with six placeholder records and correct with a 400-unit feed. When the feed can supply per-model counts, each model name gains a tabular figure on the right. When it cannot, the column is absent, never "0".

**Three concrete changes the current data layer needs before 400 units arrive:**

1. **`PRICE_BANDS` will silently break.** `vehicles.ts:287-301` derives floor and ceiling from the live prices, but `/inventory`'s validator drops anything outside $20,000 to $100,000. At 400 units including sub-$25,000 used stock, band 1 becomes `$15,000 to $25,000`, `priceMin=15000` is dropped, and the band returns the entire lot. Clamp the derived floor to 20000 and the ceiling to 100000 inside the IIFE.
2. **The condition toggle is `grid-cols-2`** (`Hero.tsx:74`). `FILTERABLE_CONDITIONS` gains `"Used"` the moment real used stock exists, per its own comment at `vehicles.ts:236-243`, and a third child then wraps into a lopsided second row. Make it `grid-flow-col auto-cols-fr`.
3. **Body style options are static** (`FILTER_OPTIONS.types`). Derive them from the feed the way `PRICE_BANDS` derives bands, and omit any body style with zero matching units, so no control can resolve to an empty result page a crawler could index.

**Section 04's layout is count-agnostic.** One `layout="row"` card plus a 2-up grid of `layout="tile"`. Feed it 6 or 12 and neither the grid nor the copy changes. When the feed supplies a `featured` flag it selects on that; otherwise `slice(0, 6)`.

**Section 07 is date-driven, not count-driven.** `activeIncentives(new Date())` gates the whole section including its heading. On 2026-09-01 all four programmes expire and the section vanishes rather than rendering an empty heading over nothing.

**Everything above is computed during SSR** so the HTML a crawler receives carries the same counts, bands and offer set the browser does.

---

## 6. THE ONE RISK

**This composition tells an Ashtabula County buyer "this is your store" and tells a Cleveland buyer "this store is small."**

Leading with a photograph of a single rural building and an address in a town of 3,000 is the whole point of the angle, and it is also the whole risk. `SERVED_MARKETS` reaches Cleveland, Akron, Canton, Youngstown and Erie in tiers 2 and 3. For a visitor in any of those, the first viewport reads as a reason to keep scrolling toward a metro dealer's site, and the one argument that changes their mind, free home delivery within 300 miles and shipping to all 50 states, currently sits in section 05, roughly 2,200px down.

The mitigation is already built into the opening rather than bolted on: the delivery claim appears in the H1's descriptor line, in approved wording, in the first viewport at 20px. If analytics show that most sessions originate outside tier 1, the fix is a **promotion, not a rewrite**: pull `DELIVERY_SHORT` and `DELIVERY_SHIPPING` out of the descriptor sentence into their own two-row ledger directly beneath the `PHONE` row, at the same 24px navy weight the phone number gets. That single change converts the opening from "we are here" to "we are here and we come to you" without touching the photograph, the address, or the button.

What cannot be mitigated is the search-intent concession. A visitor who wants to filter 900 units will be better served elsewhere, and this page does not fight for them. That is the trade the angle makes.

**Files referenced:**
`C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\lib\dealerContent.ts`
`C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\lib\vehicles.ts`
`C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\assets\images.gen.ts`
`C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\components\home\HomePage.tsx`
`C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\components\home\sections\Hero.tsx`
`C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\components\home\sections\DealershipBanner.tsx`
`C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\components\site\ResponsiveImage.tsx`
`C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\components\site\VehicleCard.tsx`
`C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\components\ledger\index.ts`