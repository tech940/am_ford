# AM Ford — Redesign Evidence Base (consolidated)

Source: 22-route page audit + 6 cross-cutting audits (ux-critique, ux-copy, a11y, modals, responsive, data-truth). All line references verified against working tree at `v2_ford`.

---

## 1. JOURNEY MAP — three highest-value journeys

### J1 — Browse-to-lead (the money journey)

**Routes touched:** `/` (`index.tsx:37` → `HomePage.tsx:55`) → `/inventory` (`inventory.tsx:818`) → `/vehicle/$id` (`vehicle.$id.tsx:464`) → one of seven capture surfaces (`OTPPopup`, `LeadCaptureModal`, `QuickEnquiryModal`, `OfferPopup`, `TradeValuatorModal`, `ExitIntentOffer`, `ChatWidget`). Side-entries: `/ford/$model` → `/inventory?model=`, `/ford-dealer/$city` chips → `/inventory?...`.

**Where it leaks, in order of traffic lost:**

| Leak | Evidence |
|---|---|
| **Homepage search returns zero.** `FindYourRightCarCard` validates each control against stock but never the *combination*. Default `condition="New"` + band `$35–45k` → 0 results, because the only sub-$45k unit is the CPO Escape (`Hero.tsx:38-56`, `vehicles.ts` PRICE_BANDS). The file comment at `Hero.tsx:30-37` asserts the opposite. | `Hero.tsx:38-167` |
| **The SRP opens with a lead wall on mobile.** The offer card is `order-1 lg:order-2`; the H1, count, search, filters and first vehicle card are `order-2 lg:order-1` — roughly two screens down. First card sits at 1554px. | `inventory.tsx:1121`, `:1261`, `:1266` |
| **That form discards everything typed into it.** Name and phone inputs carry `required` + `placeholder` and **no `value`, `onChange`, `name` or `ref`**; the submit handler reads only `offerVehicleId` and opens `OTPPopup`, which asks for first name, last name, phone, email from scratch. | `inventory.tsx:1173-1178`, `:1189-1194`, `:1157-1163`; `OTPPopup.tsx:345,374,434,468` |
| **`OTPPopup` is structurally unusable below ~700px.** `.otp-sidebar{width:320px;min-width:280px}` beats `max-width:38%`; there is **no `@media` rule for any `.otp-*` selector** in `src/styles.css`. At 375px the form panel's content box is 0px and inputs render 55px wide with 107px clipped and unreachable (`.otp-card` is `overflow:hidden` on x; `SiteShell.tsx:10` is `overflow-x-clip`, so nothing scrolls). | `styles.css:363,369-403` |
| **The gate has no payload.** "Unlock Your Instant Price" renders that same price in its own sidebar in gold before a field is filled; the success screen shows no price at all. | `OTPPopup.tsx:107,118,143-147,601-716`; price already printed at `VehicleCard.tsx:132`, `vehicle.$id.tsx:574` |
| **VDP action panel = 10 asks, 3 co-equal `bg-primary` buttons.** "Get Price" and "Request E-Price Quote" are the same intent routed to two different modals with two different consent regimes. | `vehicle.$id.tsx:601-666`, `:942`, `:945` |
| **"Get Price" on a related vehicle submits a lead for the wrong car.** `onGetPrice={(selectedCar) => { setOtpOpen(true) }}` — argument bound and discarded; `OTPPopup` is always built from page-scope `v`. | `vehicle.$id.tsx:978-980`, `:1009-1018` |
| **Converting doesn't stop the selling.** `ExitIntentOffer` suppresses on `hasSubmittedLead()`, which is only set inside `submitQuickLead`. The three heaviest surfaces call `submitLeadInquiry` directly and never set it. A $71k test-drive booking is followed by a $500 discount modal. | `ExitIntentOffer.tsx:49`; `leads.ts:62`; `LeadCaptureModal.tsx:98`, `OTPPopup.tsx:230`, `OfferPopup.tsx:182` |
| **The gallery is one photo three times.** `[v.image, v.image, v.image].map(...)`, alt "gallery view 1/2/3". | `vehicle.$id.tsx:543-557` |

**Single structural fix:** delete the SRP hero form and `OTPPopup` entirely, and replace all seven capture surfaces with **one `<VehicleLeadDialog vehicle={Vehicle} intent={LeadIntent}>`** built on the already-installed, currently-unused `src/components/ui/dialog.tsx`. `vehicle` is a **required prop** (making the J1 wrong-vehicle bug a type error, not a runtime one), `submitQuickLead` is the only exported submit path, and the SRP hero becomes a result-state header: H1, live count, active-filter summary, search.

---

### J2 — Search-to-lead (17 routes, zero forms)

**Routes touched:** organic landing on any of `/guides` + 4 leaves, `/compare` + 3 leaves, `/ford-models`, `/ford/$model` (6), `/ford-dealer/$city` (8), `/ford-dealer/county/$county` (4), `/areas-we-serve`, `/nationwide-vehicle-delivery`, `/about`, `/finance/bad-credit` → then `/inventory` or `/contact` or nothing.

**Where it leaks:** every one of these routes ends in a **flat row of 3–6 equal-weight navigation buttons and no lead capture**. Not one imports `@/lib/leads`.

- `/guides` closes with six CTAs in one row, five at identical secondary weight, competing with two hero CTAs (`guides.index.tsx:206-222`, `:127-134`) — seven ways out, no next step.
- Every compare leaf's closing card is five navigation buttons while the copy asks for information: "Tell us how many seats you need" with no phone link and no form (`compare.bronco-vs-explorer.tsx:375-415`; same block copy-pasted at `compare.explorer-vs-escape.tsx:349-389`, `compare.f-150-vs-f-150-lightning.tsx:353-393`).
- Three guides state an explicit ask with no control behind it: "Bring us a listing and a VIN" (`guides.what-to-check…tsx:339-345`) — no VIN field, no form, `/contact` never linked; "send us the listing and VIN" (`guides.is-a-used-ford-f-150-reliable.tsx:330-335`); "come and try all three in one visit" (`guides.best-ford-suv-for-families.tsx:311`) with no test-drive route on the page.
- `/nationwide-vehicle-delivery` promises a written shipping quote three times (`:29,37,129`) and offers only a `tel:` link and `/contact`. It is the one page whose entire audience *cannot walk in*.
- `/commercial` asks for fleet specs and then fires a third hero CTA to `/contact`, which files `general_contact` and **discards the `special_order` lead type set at `commercial.tsx:476`** plus the platform chips.
- `/ford-dealer/$city` offers ~16 outbound choices and ends on "Showroom hours and directions are on the contact page." — a destination named without a link (`:733-734`).
- `/about` has exactly one outbound action, an internal link, no `tel:`, no form, no address (`about.tsx:140-145`).

Compounding: three of these routes send search traffic at inventory that does not exist (§4 D14), and `/finance/bad-credit` sends the site's most anxious audience to `/financing`, whose hero opens with "5.9% APR" — the exact thing `/finance/bad-credit:210` says the site will not publish.

**Single structural fix:** one shared `<ContentConversion>` block, mandatory as the last section of every non-PRIMARY route, containing a **single-field capture (phone + optional name)** posting through `submitQuickLead` with a route-derived `leadType`, plus one contextual secondary link. It replaces all 17 navigation rows. Route-derived typing also fixes the lead-classification gap: today service bookings file as `general_contact` (`service.tsx:202`) and every trade appraisal defaults to `quote_request` because `TradeValuatorModal.tsx:191` omits `leadType`.

---

### J3 — Money journey (trade + finance)

**Routes touched:** `/trade-in` → `TradeValuatorModal` → `/financing`; `/finance/bad-credit` → `/financing`; `/vehicle/$id` `PaymentCalculator` (`:1574-1650`) → `LeadCaptureModal` in `financing_preapproval` mode.

**Where it leaks:**

- **The three money pages contradict each other in a two-click radius.** `/trade-in:326` "Anyone quoting you a rate on a web page is guessing" and `/finance/bad-credit:210` "We do not publish rates or payments" both link, as their primary CTA, to `/financing`, whose hero prints a monthly figure and `5.9% APR` from a hardcoded `const apr = 5.9` with **no UI control to change it** (`financing.tsx:67`, `:157-162`). That rate is also persisted into every lead record (`financing.tsx:104`).
- **`/financing` has no `<form>` element, no autocomplete, no per-step validation.** `Continue` always advances; a visitor can reach step 4 with every field blank, and only phone is checked, at the end (`financing.tsx:375-381`, `:414-441`). On failure `submitApplication` sets `appError` then `setStep(1)`, but the error paragraph renders only in the `step === 3` branch — the user is thrown back two steps with **no message** (`:79-85` vs `:360-362`).
- **The down-payment slider is never clamped when price drops.** Price 120000 / down 60000 → drag price to 15000: the label keeps printing $60,000 while principal collapses and the hero reads "$0/mo" (`financing.tsx:114-118`, `:186-194`, `:465`).
- **Zero outbound links in `/financing`'s body** — `Link` is never imported. The hero promises "Trade-in valuation included" and "First-time buyers welcome"; `/trade-in` and `/finance/bad-credit` are unreachable from it, though both link *in*. No phone CTA anywhere on the site's highest-intent commercial page (`dealerInfo` imported at `:19`, used only in meta).
- **The trade estimator withholds a number it already computed.** `computeEstimate` runs locally with no network call, then five steps of effort are spent before the disclaimer reveals the figure "does not read your make or model, so it is not a valuation and not an offer" (`TradeValuatorModal.tsx:65-72,104-107,323-327`). Choosing "Other" from the 11-brand `MAKES` list writes the literal string `"Other"` into the lead with no follow-up field (`:12-25`, `:187`).
- **`LeadCaptureModal` in `financing_preapproval` mode renders its segmented control with nothing selected** — the header has four modes, the chip row exposes three — and any chip click silently converts the site's highest-value lead type into something else (`LeadCaptureModal.tsx:137`, `:198-235`). It also has **no consent checkbox at all**, substituting "will never be shared with third parties" (`:366-368`) while the lead goes to Supabase and financing leads go to lenders.

**Single structural fix:** collapse `/financing`, `/finance/bad-credit` and `/trade-in` into **one money funnel with one form component and zero published numbers** — delete `const apr = 5.9`, `estMonthlyPayment` (`leads.ts:70`, 7.49% APR), the VDP `PaymentCalculator`, and the trade estimator's revealed range. The form asks for phone + situation; the desk supplies every figure. That single deletion resolves the site's largest self-contradiction, the PRODUCT.md APR/payment prohibition, and the "$500 bonus" exposure in one move.

---

## 2. PAGE TIERING — all 26 routes

**PRIMARY = a lead is won or lost here. 8 of 26.** This overrides the per-page tiers in the page audit, which marked 11 routes PRIMARY; the compare leaves, `/commercial`, `/ford-dealer/$city` and `/nationwide-vehicle-delivery` are downgraded below because none of them contains a capture surface and none can be shown to carry commercial traffic.

| # | Route | Tier | Justification |
|---|---|---|---|
| 1 | `/` | **PRIMARY** | Brand entry; owns the search card that today can return zero results. |
| 2 | `/inventory` | **PRIMARY** | Highest-intent page on the site; every filter, facet and deep link lands here. |
| 3 | `/vehicle/$id` | **PRIMARY** | The only page describing a purchasable unit; 6 URLs carry the whole catalogue. |
| 4 | `/ford/$model` (6) | **PRIMARY** | Largest indexed surface backed by real stock; each page fronts exactly one unit. |
| 5 | `/financing` | **PRIMARY** | Only F&I capture on the site; the four-step application is the deepest form. |
| 6 | `/trade-in` | **PRIMARY** | Trade acquisition is the supply side of a 6-unit lot; owns the estimator lead. |
| 7 | `/service` | **PRIMARY** | Fixed-ops revenue and the only repeat-visit reason on a lot this small. |
| 8 | `/contact` | **PRIMARY** | Canonical NAP; the fallback destination of the global mobile sticky CTA. |
| 9 | `/ford-dealer/$city` (8) | SECONDARY | Real local-SEO value, but 16 outbound choices, no capture, no vehicle imagery. |
| 10 | `/ford-dealer/county/$county` (4) | SECONDARY | Middle tier of the same cluster; ten h2s before anything purchasable. |
| 11 | `/nationwide-vehicle-delivery` | SECONDARY | States the only genuine differentiator; converts nothing and has five different names across nav, footer, title, H1 and breadcrumb. |
| 12 | `/commercial` | SECONDARY | Honest, well-typed `special_order` funnel — but sells stock that is explicitly not held. |
| 13 | `/finance/bad-credit` | SECONDARY | Only page written for credit-rebuilding buyers; zero capture, and its CTA contradicts its own promise. |
| 14 | `/compare/bronco-vs-explorer` | SECONDARY | Best-argued content on the site; data-derived price gap is the pattern to keep. |
| 15 | `/compare/explorer-vs-escape` | SECONDARY | Same, minus the derived-price discipline (hardcodes "least expensive in our inventory"). |
| 16 | `/compare/f-150-vs-f-150-lightning` | SECONDARY | Serves the work buyer and never links `/commercial`, the page for that buyer. |
| 17 | `/guides/best-ford-suv-for-families` | SECONDARY | Only page squarely serving the family segment; salvageable. |
| 18 | `/guides/is-ford-ecoboost-reliable` | SECONDARY | Answers a real question; its "Fords we sell" section describes model ranges, not the lot. |
| 19 | `/ford-models` | UTILITY | Pure router to six model pages; its hero CTA sends visitors past the grid it exists for. |
| 20 | `/compare` | UTILITY | Router with a duplicate registry and cards carrying no comparable data. |
| 21 | `/guides` | UTILITY | Router; three framing blocks before the four links that are the page. |
| 22 | `/areas-we-serve` | UTILITY | Router; lists Jefferson — the showroom's own town — under "other communities". |
| 23 | `/about` | UTILITY | Eight of ten blocks are unsourced claims; strip them and one link remains. |
| 24 | `/guides/is-a-used-ford-f-150-reliable` | UTILITY **(delete)** | Ranks for used-truck intent against zero used stock; every CTA is a dead end. |
| 25 | `/guides/what-to-check-before-buying-a-used-ford` | UTILITY **(delete)** | Same defect; duplicates #24 across four sections, both emitting FAQPage schema. |
| 26 | `__root` | UTILITY | Shell + `#dealer` LocalBusiness entity; three PRIMARY pages fail to reference it. |

---

## 3. CONSOLIDATION OPPORTUNITIES

### A. Compare cluster: 4 routes → 1 dynamic route + 1 registry

`compare.index.tsx:24-49` defines its own `COMPARISONS` array parallel to `contentPages.ts:51-70`, which declares itself "the single source the sitemap generator and the internal-link checker read from". **The blurbs have already drifted** (`compare.index.tsx:29-30` vs `contentPages.ts:55`). The three leaves are 420/394/398 lines of which the FAQ block and closing CTA card are copy-pasted verbatim (`bronco-vs-explorer.tsx:357-417` ≡ `explorer-vs-escape.tsx:331-391` ≡ `f-150-vs-f-150-lightning.tsx:337-395`), all three hardcode `CANONICAL = "https://amford.com"` (`:12` in each) instead of importing `SITE_ORIGIN`, and all three duplicate `PUBLISHED` dates already held in `contentPages.ts`. The shared Explorer half is near-verbatim across two indexable URLs (`bronco-vs-explorer.tsx:116-118,111-114,119-122` ≡ `explorer-vs-escape.tsx:96-98,100-103,231-235`).

**Recommendation:** one `compare.$pair.tsx` route + a `comparisons.ts` registry holding slug, the two vehicle ids, published date, the per-side argument blocks, and FAQs. `CompareSpecTable` is already correctly extracted — extend the same discipline to the CTA and FAQ. Move the `{a && b && (...)}` gate to wrap the *entire* section including its header, so a sold unit unpublishes the section rather than orphaning a heading (`bronco-vs-explorer.tsx:196-230`, and the identical bug at `explorer-vs-escape.tsx:179-213`, `f-150-vs-f-150-lightning.tsx:182-217`). Delete `compare.index.tsx`'s local array.

### B. Guides cluster: 5 routes → 1 hub + 2 leaves

Delete `/guides/is-a-used-ford-f-150-reliable` and `/guides/what-to-check-before-buying-a-used-ford`. They target used-Ford intent against a lot with **zero used vehicles**, they duplicate each other across four sections and two near-identical FAQ pairs (both emitting FAQPage schema on the same site), and their CTAs deliver a used-truck shopper to a $64,995 F-150 Platinum and a $71,990 Lightning. Keep the family-SUV and EcoBoost guides as `guides.$slug.tsx` driven by `contentPages.ts` — which already carries `published` dates the cards and ItemList schema currently drop (`guides.index.tsx:43-56`, `contentPages.ts:25,32,39,46`). Delete `CARD_COPY` (`guides.index.tsx:19-36`), the hand-maintained map that silently degrades any new guide to a generic pill and a fallback anchor.

### C. Local-SEO cluster: 2 templates → 1

`ford-dealer.$city.tsx` (739 lines) and `ford-dealer.county.$county.tsx` (475) are the same page at two zoom levels built on opposite architectures: the city route inlines ~160 lines of editorial copy (`MODEL_PICKS:81-226`, `FALLBACK_PICKS:229-242`, `COUNTY_LINK_COPY:266-291`) while the county route keeps the equivalent in `counties.ts`. `toInventorySearch` + `NUMERIC_SEARCH_KEYS`/`STRING_SEARCH_KEYS` is copy-pasted verbatim (`$city.tsx:48-67` ≡ `county.$county.tsx:49-68`), and `"Compare every Ford model AM Ford sells"` is byte-identical across all 12 pages (`$city.tsx:685-687`, `county.$county.tsx:357`).

**Recommendation:** one `ford-dealer.$area.tsx` with `area.kind: "city" | "county"`; all prose moves to data; all headings move to data (the county file already did this at `counties.ts:14-17` and its own component then writes prose anyway). Add `"condition"` to `STRING_SEARCH_KEYS` so CPO chips stop landing on `noindex,follow` badge URLs (`serviceAreas.ts:156,384`, `counties.ts:163-166` → `inventory.tsx:568-573`) instead of the indexable `?condition=` facet the site already built at `inventory.tsx:538-551`. Reconcile `county.alsoServed.towns` with `SERVED_MARKETS` (`vehicles.ts:338-368`) — they currently advertise different footprints.

### D. Finance cluster: 3 routes → 1

Merge `/finance/bad-credit` into `/financing` as a section. `/finance` is a URL prefix with no page behind it — truncating the URL 404s, and the file comment concedes the breadcrumb was repointed at `/financing` to work around it (`finance.bad-credit.tsx:21,29-32`). The slug itself reintroduces the deficit framing the body copy carefully avoids. `/trade-in` stays as a route but shares the merged funnel's form component; its "these are the models people trade into most often" block duplicates `finance.bad-credit.tsx:340-384` in structure and destinations (`trade-in.tsx:359-402`).

### E. Overlay layer: 7 implementations → 2 primitives

11 overlay surfaces, 7 distinct implementations, **8 z-index tiers (99999 / 9999 / 75 / 70 / 60 / 50 / 40)**, 5 backdrop treatments, 5 card radii, 3 button languages, 6 close-button treatments, 51 inline style objects. `LeadCaptureModal` at `z-50` sits **below** the SiteNav sheet at `z-[60]` — the nav overlays an open lead modal. `src/components/ui/` holds 46 shadcn primitives with **zero imports outside itself**; all 26 `@radix-ui/*` packages plus `vaul`, `cmdk` and `sonner` ship as dead weight.

**Recommendation:** adopt `ui/dialog.tsx` for the six centered modals and `ui/sheet.tsx` for the filter drawer and nav sheet — 7 implementations → 2, with focus trap, Escape, scroll lock, portal and `aria-modal` for free. `ui/input-otp.tsx` exists and is purpose-built for the hand-rolled 6-input array in `OTPPopup` — which is itself dead code, since `Step = "otp"` is never rendered.

### F. Delete outright

- `OTPPopup.tsx` (§4 D2).
- `fetchVehicles()` in `supabase.ts:34+` — no caller anywhere in `src/`.
- `DELIVERY_SHIPPING` import at `nationwide-vehicle-delivery.tsx:17` — imported, never used.
- `supabase.ts:89-92` success message — no component renders it; carries a banned exclamation.
- `<Field>` — three byte-identical local copies at `service.tsx:368-395`, `contact.tsx:214-241`, `commercial.tsx:599-626`.
- Local `SITE_ORIGIN` redeclarations at `ford-models.tsx:10`, `ford.$model.tsx:22`, `ford-dealer.$city.tsx:28`, `ford-dealer.county.$county.tsx:22`, plus string literals at `areas-we-serve.tsx:21`, `financing.tsx:47,49`, `nationwide-vehicle-delivery.tsx:80,82`, and the three compare leaves — **11 copies of a domain PRODUCT.md flags as unresolved and blocking.**

---

## 4. TOP 15 DEFECTS, ranked by commercial impact

**D1 — The SRP hero form blocks the inventory grid on mobile and throws away everything typed into it.**
`inventory.tsx:1121` `order-1 lg:order-2` puts a Full Name + Phone + 2-select form above the H1, count, search, filters and first card (`:1261`, `:1266`). Inputs at `:1173-1178` and `:1189-1194` have no `value`/`onChange`/`name`/`ref`; `:1157-1163` reads only `offerVehicleId`. The "30-sec response" promise at `:1250` is made by a form that captures nothing, and `OTPPopup` re-asks for the same fields.
**Fix:** delete the form. Hero becomes a result-state header. If an offer must appear on the SRP, it goes inline after ~6 cards or into one sticky bar.

**D2 — `OTPPopup` is the primary capture surface, unusable on a phone, and gates a price it displays.**
No `@media` rule exists for any `.otp-*` selector in `src/styles.css`; `min-width:280px` (`:369-403`) beats `max-width:38%`, so at 375px the form panel's content box is 0px and 107px is clipped and unreachable behind `overflow:hidden` (`:363`). The modal shows the price it claims to be hiding (`OTPPopup.tsx:143-147` vs `:107,118`), the success screen reveals nothing (`:601-716`), and the OTP step is dead code (`:161,181,187,204`). No `role="dialog"`, no Escape, no scroll lock, no focus trap, and six `<label>`s with no `htmlFor` — **not one field has an accessible name**.
**Fix:** delete the component. Route both call sites (`inventory.tsx:2270`, `vehicle.$id.tsx:1009`) to the single `<VehicleLeadDialog>`.

**D3 — A VIN is fabricated into every SRP lead payload.**
`inventory.tsx:2279`: `` vin: `1FT${selectedVehicleForOtp.id.toUpperCase()}2025` ``. `vehicles.ts:31` states in capitals that a fabricated VIN is a legal risk; all six records have `vin: undefined`; and no page ever *displays* a VIN, which the same type comment says the brief requires.
**Fix:** delete the field from the payload. Render "Contact us for the VIN" on the VDP as the type doc specifies.

**D4 — APR and monthly payments are published in three places against an explicit written prohibition.**
`VehicleCard.tsx:141` prints `~$X/mo est.` on every card from `estMonthlyPayment` (10% down / 72 mo / **7.49% APR**, `leads.ts:70`); `financing.tsx:67` hardcodes `apr = 5.9` with no control and persists it into every lead (`:104`); `vehicle.$id.tsx:1642-1650` lets the shopper dial APR to 2.9% and then click "Get pre-approved for this payment". Against `inventory.tsx:129` and `:2699`, which assert no rate or payment is published anywhere on the site. **Two different fabricated rates in one product, one of which the code claims does not exist.**
**Fix:** delete all three. No number the desk cannot honour appears in the UI.

**D5 — "Lifetime warranty" is hardcoded on every vehicle.**
`vehicle.$id.tsx:582`, present on all six VDPs, not in the data, not approved, and contradicted by the inventory FAQ's own 3yr/36k + 5yr/60k text (`inventory.tsx:86`) and by the CPO copy's rule that terms are documented per vehicle, never printed.
**Fix:** delete. Warranty is a per-vehicle data field or it is absent.

**D6 — The entire lead pipeline dies silently if a deploy build lacks two env vars.**
`supabase.ts` builds the client at module load from `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`; Vite inlines these at **build** time, so a bundle built without them fails every lead for its whole life. 15 files funnel through this one path. No retry, no queue, no email fallback, no server route.
**Fix:** a server route (`createServerFn`) as the submit target with the key server-side, plus a build-time assertion that fails the build when the vars are absent.

**D7 — `LeadCaptureModal` collects a phone number with no consent and an absolute privacy claim it cannot keep.**
The only capture surface with zero TCPA consent — no checkbox, no `CONSENT_TEXT`, no disclosure. In its place, `:366-368`: "Your information is confidential and will never be shared with third parties," while leads go to Supabase and financing leads go to lenders. Reached from four entry points including "Book test drive" (`vehicle.$id.tsx:614`), the highest-value event on the site. Also no `role="dialog"`, no Escape, no scroll lock, no focus trap; close button is a bare lucide `<X/>` with **empty accessible name** (`:140-145`).
**Fix:** one `CONSENT_TEXT` constant, one checkbox, rendered structurally by the shared dialog — not per component. The site currently runs **three consent postures**: `CONSENT_TEXT` (checkbox), `SMS_CONSENT_DISCLOSURE` (passive paragraph, drops "consent is not a condition of purchase" and the STOP opt-out), and none. `smsConsent.ts:19-23` exports marketing and transactional disclosures as **aliases of the same string**.

**D8 — Related-vehicle "Get Price" files a lead for the wrong car.**
`vehicle.$id.tsx:978-980` binds `selectedCar` and discards it; `OTPPopup` is always constructed from page-scope `v` (`:1009-1018`). A shopper on the F-150 page clicking the Bronco card generates an F-150 lead with the F-150's title, price and stock number. The lead survives; the intent and the cross-sell signal do not.
**Fix:** `vehicle` becomes a required prop on every capture component, so this is a compile error.

**D9 — Four unreconciled $500 offers, one of which fires at people who already converted.**
`inventory.tsx:131-153` (a *select* forcing the shopper to pick an incentive before knowing its value, `:1221-1231`), `OfferPopup.tsx:260-265` (no terms at all), `ExitIntentOffer.tsx:168-175` ("one per customer"), `TradeOfferPopup.tsx:176-186` ("cannot be combined"), `TradeValuatorModal.tsx:321` ("on top" — the direct opposite). `ExitIntentOffer.tsx:192` states "Your $500 voucher is locked in" with no voucher, code, expiry or record anywhere in the system. And the suppression flag `hasSubmittedLead` is set only inside `submitQuickLead` (`leads.ts:62`), which `LeadCaptureModal.tsx:98`, `OTPPopup.tsx:230` and `OfferPopup.tsx:182` bypass — so a committed $71k buyer is invited to renegotiate.
**Fix:** one incentive object in `lib/`, one wording, one set of terms, rendered by every surface; `submitLeadInquiry` removed from component code so the conversion flag is unconditional.

**D10 — `ChatWidget` presents a scripted bot as a live human, asserts stock it never checks, and promises approval.**
`:37` "You're chatting with AM Ford", `:404` "Typically replies in minutes" beside a pulsing `bg-emerald-400` presence dot (`:402`), plus a 650ms fake typing indicator — with no free-text input and **no automated-assistant disclosure anywhere**. `:321` "Good news — it's in stock as of today… Want me to have a specialist confirm and hold it for you?" fires unconditionally with no lookup, and offers a hold mechanism that does not exist. `:40-43` "12+ lenders… approvals happen at every credit level… soft pull takes 60 seconds and won't affect your score". `:46` "Most trades at AM Ford appraise higher than owners expect". `:31` chip "Financing with imperfect credit?" is echoed as a **user bubble** (`:276`), making the visitor appear to have said it about themselves, and reaches the CRM as `"Chat: financing question (imperfect credit)"` (`:291`).
**Fix:** disclose it as automated in the header; delete the stock assertion, the lender count, the approval promise and the trade statistic; reframe the chip as "What are my financing options?".

**D11 — The homepage search card can return zero results on its default state.**
`Hero.tsx:38-167`. Each control validates individually; the combination does not. `New` + `$35,000–$45,000` → 0. `Certified Pre-Owned` + any body style except SUV → 0.
**Fix:** live facet counts computed from `vehicles` against the current selection; options with zero results are disabled and counted, never clickable.

**D12 — Filters and sliders that no vehicle stands behind, on the page that claims otherwise.**
`inventory.tsx:2060` FWD (0 vehicles) and `:2086` Manual (0) are clickable pills from a **hand-written** `FILTER_OPTIONS`, while `LOT.drivetrains` at `:2512` already derives correctly. Price slider spans $20k–$100k against a $36,450–$71,990 lot (`:2040-2051`); mileage slider spans 0–50,000 mi against 6–8,420 mi — **the top ~83% of the track is dead** (`:2142-2153`). Model years hardcoded (`:2112`). The Lightning's `"New"` badge (`vehicles.ts:159`) has no matching filter. `scripts/generate-sitemap.ts:27-38` builds facet URLs from `FILTER_OPTIONS` rather than `vehicles`, so the day the F-150 sells, `/inventory?type=Truck` becomes a sitemap-submitted, self-canonical, **indexed empty page**. All of this contradicts `inventory.tsx:2619`: "wherever a control exists, there is at least one vehicle standing behind it."
**Fix:** derive every option list, slider bound and sitemap facet from `vehicles`. One helper, applied everywhere.

**D13 — `/service` books nothing, at hours the store is closed, and its own chips submit the form.**
Day and Time chips omit `type="button"` inside the `<form>` opened at `:190`, so their default is `submit` — **once Name and Phone are filled, picking a time submits the booking** (`:266-278`, `:287-299`; the service chips at `:241` do set it). Days are hardcoded `["Today","Tomorrow","Thu","Fri","Sat"]` — on a Thursday two chips mean the same day; on Saturday "Tomorrow" is Sunday, which `dealerInfo.hours` lists as Closed. Times include 8:00 AM, an hour before opening. Both pickers are pre-selected (`:126-127`), so an untouched visitor books a slot they never chose. Button says "Confirm appointment" (`:324`), success says "We've got your request" (`:184`), and it files as `general_contact` (`:202`). Six invented prices ship live (`:65-88`) with a "starting from" disclaimer that is `hidden sm:inline` — invisible on mobile — and wrong for the three exact figures it qualifies. No address, hours, map or directions anywhere on the page.
**Fix:** `type="button"` on all chips; derive days and times from `dealerInfo.hours`; no default selection; a `service_booking` lead type in `supabase.ts:15-20`; prices removed until signed off.

**D14 — The site advertises used inventory it does not have, in six places.**
`SiteFooter.tsx:15` "New & Used Inventory" (the URL contract explicitly rejects `?condition=Used`); `nationwide-vehicle-delivery.tsx:220` "View Used Vehicles" — the **filled primary CTA** of the closing conversion card — plus `:109` "Browse our new Ford and used inventory online" and `:72` keywords targeting "used cars delivered to your home"; `guides.index.tsx:41,84-92` selling used-F-150 and used-inspection intent; `trade-in.tsx:99` "Our used vehicle manager sets the number"; `compare.explorer-vs-escape.tsx:319-326` and `compare.f-150-vs-f-150-lightning.tsx:317-333` routing late-funnel visitors at used-buying guides. Plus the two used guides in §3B. `guides.is-a-used-ford-f-150-reliable.tsx:332-334` hedges "our stock leans toward new Fords rather than used trucks" — implying some exists. There is none.
**Fix:** one grep-able rule enforced in CI: the string "used" may not appear in any customer-facing label, keyword or CTA. The one honest bridge — the CPO Escape — is currently never linked from the CPO section that discusses it (`guides.what-to-check…tsx:255-273`).

**D15 — `/about` is ten blocks of unsourced claims and one link.**
`:82-85` "60+ Years", "20k+ Vehicles delivered", "**4.9★ Average review score**", "30+ Team members"; `:109` "Since 1962" shipped as a decorative `SectionTag`; `:122-125` "Ford President's Award"; `:115-116` "one of the top-rated Ford dealers in Northeast Ohio"; `:129` "Sponsoring local schools and youth sports for decades" naming no school, team or year. No review, award or history data exists anywhere in `src/lib`. `:70-74` asserts in alt text that a bundled template asset is this dealership. The page has no `tel:`, no form, no address, and never imports `@/lib/leads` — the only route with no contactable action at all. `dealerInfo.formerName` "Nassief Ford" (`vehicles.ts:311`) is imported and never rendered on the one page where the rename belongs.
**Fix:** delete every unsourced figure; render `formerName`; add the shared `<ContentConversion>` block.

**Runners-up** (real, ranked below the 15 only because their traffic is smaller): 20 form controls with no accessible name across `OTPPopup`, `inventory.tsx:1168-1221`, `TradeValuatorModal`, `InspectionUnlock`, `PaymentCalculator`; `ExitIntentOffer` declaring `aria-modal` while never receiving focus (`:143-151`); `TradeOfferPopup`'s validation failure that produces **no message at all**, only a 410ms colour flash (`:99-110`); the mobile sticky "Book" CTA linking to `/contact` from a VDP that knows exactly which car is on screen, and rendering as a permanent no-op *on* `/contact` (`MobileStickyCTA.tsx:21-27`); the chat FAB at `bottom-24 z-[60]` sitting on top of the compare tray at `bottom-24 z-40` (`ChatWidget.tsx:342`, `inventory.tsx:2213`); 15 banned-punctuation violations; four different response-time promises ("15 minutes (Mon to Sat)", "15 minutes", "shortly" ×3, "promptly", "typically replies in minutes", "30-sec response").

---

## 5. CONTENT TRUTH CONSTRAINTS

The lot is **6 vehicles: 5 New + 1 Certified Pre-Owned, all Ford, all Automatic, $36,450–$71,990, 6–8,420 miles, one photo each, zero VINs, zero stock numbers.** Everything below follows from that.

### A. Inventory the UI may not imply
1. **No "used".** Zero used vehicles. No label, CTA, keyword, breadcrumb, footer link, meta description or guide title may contain it. `?condition=Used` is rejected by the validator; a control offering it is a defect by definition.
2. **No FWD, no Manual, no year outside {2025, 2024}, no price below $36,450 or above $71,990, no odometer above 8,420.** Every filter option, slider bound, chip and sitemap facet must be **derived from `vehicles`**, never hand-written.
3. **No plural framing over a singular unit.** Six models × exactly one unit each. "Ford trucks in stock", "Fords with an EcoBoost", "Certified pre-owned vehicles", "{Model} listings" all resolve to one card. Use the count, or the vehicle.
4. **No commercial stock.** No Transit, Super Duty, chassis cab, E-Series or fleet unit exists. `/commercial` may sell *ordering*; it may not link "Every Ford Vehicle In Stock Now" (`commercial.tsx:396`) and its `SERVICE_SCHEMA` may not enumerate platforms as inventory.
5. **No configuration that isn't on the lot.** Four-door Bronco, EcoBoost Mustang (the stocked one is the 5.0L V8 GT), plug-in-hybrid Escape (the stocked one is the CPO hybrid), SuperCrew/SuperCab. Discuss the model range only where the page cannot be read as describing stock.
6. **No hardcoded stock assertions in prose.** "the two units on our lot", "the least expensive vehicle in our current inventory", "1 in stock; when it's gone, it's gone", "Three of the six vehicles on the lot", "Four counties have a page" — all must be derived. The `priceGapSentence` pattern at `compare.bronco-vs-explorer.tsx:127-140` is the reference implementation.

### B. Money the UI may not state
7. **No APR figure. No monthly payment. No estimated payment. No "from $X/mo".** No exceptions, including calculators, cards, and lead payloads.
8. **No trade value, range, or estimate.** The estimator reads neither make nor model; its own disclaimer says so. A number may not be shown, and may not be named "your value" or "your estimate".
9. **No $500 offer** — or exactly one, defined in a single `lib/` object with one wording, one set of terms, one expiry, rendered identically everywhere. "Exclusive", "one per customer", "cannot be combined" and "on top" cannot all be true.
10. **No price-match, no "VIP", no "no hidden dealer markup", no "we match any written local offer"** until signed off.
11. **No service prices** ($59.95, From $199, $129, From $149, Free, 30-day tire price match) until signed off. The page's own schema already excludes them as unapproved.

### C. Warranty, inspection, credit
12. **No warranty specific.** No "Lifetime warranty", no 3yr/36k, no 5yr/60k, no CPO coverage length. Per-vehicle documented terms only.
13. **No inspection-point count.** Not 172, not any number. `guides.what-to-check…tsx:265-267` already refuses correctly — keep that behaviour and give it a destination.
14. **No credit outcome promised.** No "approvals happen at every credit level", no "pre-approved in 60 seconds", no "soft credit pull, no impact to your score", no "12+ lenders", no "bank-grade encryption". The form does one database insert; there is no bureau call, no lender integration, no pre-approval.
15. **No recall-cost or free-repair commitment naming the dealership** ("performed at no charge by a Ford dealer, ours included") until approved.

### D. Reputation, history, people
16. **No review score, review count, star graphic or testimonial.** No review data exists. The 5-star row at `OfferPopup.tsx:267-269` is fabricated.
17. **No award.** No "Ford President's Award", no "top-rated in Northeast Ohio", no superlative of any kind.
18. **No founding date, tenure, delivery total, or headcount.** "Since 1962", "60+ years", "20k+ delivered", "30+ team members", "three generations" — no source exists for any of them.
19. **No staff credential claims** ("factory-trained technicians", "Ford-certified", "our used vehicle manager") until verified.

### E. Behaviour, statistics, provenance
20. **No customer-behaviour statistic.** "the pairs we get asked about most", "the hybrid is the one families ask us about most", "most of our walk-in traffic comes from these communities", "Conneaut buyers almost always price Ohio and Pennsylvania dealers against each other", "nearly everyone who walks in from Austinburg…", "most trades appraise higher than owners expect", "most Mustang owners here run the car seasonally".
21. **No fabricated customer story.** "The buyers who regret their choice bought the Bronco for a life they aspire to" (`compare.bronco-vs-explorer.tsx:329-331`), "Seasonal owners tell us that timing matters more than anything else" (`serviceAreas.ts:128`).
22. **No fabricated provenance.** "the questions our sales team gets asked most", "these are the answers our sales and service teams give in person, written down", "based on what comes through our service drive" — the copy is authored in `src/lib`, and presenting it as captured is the same defect as a fabricated number.
23. **No local infrastructure or weather statistic.** "Most driveways in Ashtabula County have room for a Level 2 charger", "public fast charging is thinner here than around Cleveland", "state routes are cleared before the township roads", "rural townships lose power in storms often enough to matter", "Chardon regularly sees far more snow".
24. **No competitor comparison.** "A large metro store will have more units standing on the ground than we do."

### F. Capability and system promises
25. **No promise the system cannot execute.** No "hold it for you", no "$500 voucher locked in", no "price watch" alerting (nothing reads `am:price-watch` beyond a pill; there is no price history in the data), no "Confirm appointment", no "we'll text you the voucher", no "unlock your instant price".
26. **No VIN — displayed or generated.** Fabricating one is a legal risk; the correct UI is "Contact us for the VIN".
27. **One response-time promise, site-wide.** `RESPONSE_PROMISE` — "Expect a call or text within 15 minutes during business hours (Mon to Sat)" — and it may not be applied to a price-watch flow, where the customer asked to be told *if the price changes*.
28. **No multi-photo gallery on single-photo data.** Render one image honestly, plus "More photos on request", until `Vehicle` gains `images: string[]`.
29. **No "real-time inventory".** The array is static and build-time; `fetchVehicles()` is dead code.
30. **No undisclosed automation.** Any chat surface states it is automated before its first message.

### G. What the site *may* say — the approved set
`DELIVERY_CLAIM` verbatim and unshortened (never paraphrased, never trimmed); `dealerInfo` address, phone, hours, `formerName`; real prices, mileage, MSRP, condition, badges and feature strings from `vehicles.ts`; the two verified engine specs (Explorer ST "3.0L EcoBoost V6", Mustang "5.0L V8"); the Escape's listed 42/36 city/highway against the Explorer's 18/24; the Lightning's 9.6kW Pro Power Onboard; `CONSENT_TEXT`; `RESPONSE_PROMISE`; and check-based editorial guidance that tells a buyer what to verify rather than delivering a verdict.

**Enforcement, not vigilance.** Every constraint above is violated *somewhere* despite comments in the code asserting the rule — `inventory.tsx:2619`, `Hero.tsx:30-37`, `ford-dealer.county.$county.tsx:32-38`, `service.tsx:99`, `vehicles.ts:31`. Prose that asserts a data fact is the failure mode. The redesign's structural answer is that **no customer-facing string may state an inventory fact, a price, a count or a claim unless it is interpolated from `src/lib` at render time** — plus a CI grep for the banned vocabulary in `§A.1`, `§B.7`, `§C.12-13` and `§D.16-17`.