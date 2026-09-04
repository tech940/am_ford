# AM Ford — data inventory and UI/data mismatch audit

## 1. Vehicles — 6 records, all Ford, all in `src/lib/vehicles.ts`

| id | year / model / trim | condition | type | fuel | drive | trans | price (MSRP) | miles | hp | badges |
|---|---|---|---|---|---|---|---|---|---|---|
| `f150-platinum-2025` | 2025 F-150 Platinum | New | Truck | Gas | 4WD | Auto | $64,995 ($68,420) | 12 | 400 | New Arrival, Best Seller |
| `mustang-gt-2025` | 2025 Mustang GT Premium | New | Car | Gas | RWD | Auto | $49,880 ($52,100) | 8 | 480 | Performance |
| `explorer-st-2025` | 2025 Explorer ST | New | SUV | Gas | AWD | Auto | $56,750 (—) | 15 | 400 | 3-Row |
| `f150-lightning-2025` | 2025 F-150 Lightning Lariat | New | EV | Electric | 4WD | Auto | $71,990 (—) | 6 | 580 | Electric, New |
| `bronco-outer-banks-2025` | 2025 Bronco Outer Banks | New | SUV | Gas | 4WD | Auto | $47,995 (—) | 22 | 330 | Off-Road |
| `escape-titanium-2024` | 2024 Escape Titanium Hybrid | **Certified Pre-Owned** | SUV | Hybrid | AWD | Auto | $36,450 ($38,990) | 8,420 | 200 | Certified Pre-Owned, Hybrid |

**Distribution:** conditions New 5 / CPO 1 / **Used 0**. Types Truck 1, SUV 3, Car 1, EV 1. Fuels Gas 4, Hybrid 1, Electric 1. Drivetrains 4WD 3, AWD 2, RWD 1, **FWD 0**. Transmissions Automatic 6, **Manual 0**. Years 2025×5, 2024×1. **Price range $36,450 – $71,990. Odometer range 6 – 8,420 mi.**

**Every record has exactly one image, and `vin` and `stockNumber` are `undefined` on all six.** The type doc says the UI must show "Contact us for the VIN" — no such UI exists anywhere in `src/`.

Derived constants: `FILTERABLE_CONDITIONS = ["New","Certified Pre-Owned"]` (Used deliberately excluded, dropped by the URL validator). `PRICE_BANDS` computes to 4 bands — $35–45k (1 car), $45–55k (2), $55–65k (2), $65–75k (1). `FILTER_OPTIONS` is a **hand-written** list including FWD, Manual, and years 2025/2024.

## 2. SERVED_MARKETS / counties / models

- **`SERVED_MARKETS`** (`vehicles.ts`): tier1 13 towns (Jefferson, Ashtabula, Austinburg, Geneva, Geneva-on-the-Lake, Conneaut, Kingsville, North Kingsville, Saybrook, Rock Creek, Orwell, Andover, Pierpont); tier2 11 (Madison, Perry, Painesville, Mentor, Chardon, Burton, Middlefield, Chesterland, Warren, Cortland, Youngstown); tier3 5 (Cleveland, Erie PA, Northwestern Pennsylvania, Akron, Canton). **29 named markets; only 8 have pages.**
- **`SERVICE_AREAS`** (8 city pages): `ashtabula-oh`, `geneva-oh`, `conneaut-oh`, `austinburg-oh` (proximity `in-county`); `madison-oh`, `chardon-oh`, `erie-pa`, `cleveland-oh` (`extended` → these four get the delivery block). Each carries fully authored per-city prose plus 3 `popularWith` deep links.
- **`COUNTIES`** (4 county pages): `ashtabula-oh` (relation `home`, seat Jefferson, 4 child cities), `lake-oh` (Painesville, 1 child), `geauga-oh` (Chardon, 1 child), `trumbull-oh` (Warren, **0 children** — renders `alternativeLinks` instead). Each has a distinct angle, 3 searches, and a 4-model lineup.
- **`FORD_MODELS`** (6): `f-150`, `mustang`, `explorer`, `f-150-lightning`, `bronco`, `escape`. Each maps to exactly **one** `inStockVehicleId` and one `inventorySearch`. `RELATED_READING` maps models to 7 typed guide/comparison paths.
- **`contentPages.ts`**: 4 guides, 3 comparisons. All 7 have routes.

**I verified every `popularWith` search on all 8 city pages and all 4 county pages, plus all 6 model `inventorySearch` objects, against the vehicle array: all 42 return ≥1 result today.** So do all 9 `POPULAR_SEARCHES` in `InventoryInterlinks` and all links `FrequentSearches` generates (it filters against `vehicles` before rendering).

## 3. Lead pipeline and its failure mode

`src/lib/leads.ts` → `submitQuickLead()` stamps `consentStamp()` onto the message, attaches `vehicle.id`, calls `submitLeadInquiry()` in `src/lib/supabase.ts`, and on success writes `sessionStorage["am:lead-submitted"]` to suppress later popups. `submitLeadInquiry` does a plain `supabase.from("leads").insert([lead])` (no `.select()`, so INSERT-only RLS suffices).

**The client is built at module load from `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, and is `null` if either is absent. Vite inlines those at BUILD time — so if the deploy build lacks them, every lead on the site fails for the life of that bundle.** The failure is at least honest: it returns `{success:false}` with "Our online form is temporarily unavailable. Please call or text us at (440) 998-2151." There is no retry, no queue, no email fallback, no server route. **15 files funnel through this single path.** The phone number is hard-coded as a string literal in all three error messages rather than read from `dealerInfo`.

`fetchVehicles()` in the same file is **dead code — nothing in `src/` calls it.** Every route imports the static `vehicles` array. The inventory is entirely build-time despite the hero copy "Browse real-time inventory" and `changefreq: daily` in the sitemap.

## 4. garage / recentlyViewed persistence

All `localStorage`, client-only, best-effort (silent try/catch), no server sync, no expiry, no cross-device.

- `garage.ts` — `am:garage` (saved cars) and `am:price-watch` (watched cars), both **string arrays of vehicle ids capped at 20**. Writes dispatch a `am:garage-change` window event so hearts/badges stay in sync. `toggleSaved`, `watchVehicle`, `isSaved`, `isWatched`.
- `recentlyViewed.ts` — `am:recently-viewed`, ids, **capped at 6**, most-recent-first, deduped, written by `recordRecentlyViewed()` on the VDP.
- `leads.ts` — `am:lead-submitted` in **sessionStorage** (timestamp).

Both garage and recently-viewed render as strips on `/inventory` and resolve ids through `vehicles.find()`, so a sold-and-removed vehicle silently drops out (good). **But nothing consumes `am:price-watch` beyond showing a "Watching" pill — there is no price-change detection, no notification, and no price history in the data. "Watch price" is a lead form with a persistence side effect.**

---

# Places the UI advertises what the data cannot fulfil

Ordered by how directly they hit a user. This is the constraint list for the redesign's IA.

### A. Filters and search controls that resolve to nothing

1. **`src/routes/inventory.tsx:2060` and `:2086` — FWD and Manual filter pills.** `FILTER_OPTIONS.drivetrains` and `.transmissions` are hand-written and include `FWD` (0 vehicles) and `Manual` (0 vehicles). The drawer renders them with a live `(0)` count but they stay clickable and land on the empty state. **This directly contradicts the same file's own buying-guide copy at line 2619: "No filter or link on this page leads to a search this lot cannot answer, so wherever a control exists, there is at least one vehicle standing behind it."** Fix: derive the option lists from `vehicles` the way `LOT.drivetrains` (line 2512) already does.

2. **`src/components/home/sections/Hero.tsx:38-167` — the homepage "Find your right car" card. The single most likely dead end on the site.** Each control is individually validated against stock, but the **combination is not**. Concretely, with the default `condition="New"` selected: budget "$35,000 to $45,000" → **0 results** (the only sub-$45k car is the CPO Escape). And `Certified Pre-Owned` + any body style except SUV → 0; CPO + any band except the first → 0. The file's own comment claims "Every control here has to resolve to real stock." It doesn't, once two controls are combined. This needs live facet counts or disabled/hidden options driven by the current selection.

3. **`src/routes/inventory.tsx:2040-2051` — price slider spans $20,000–$100,000** against a $36,450–$71,990 lot. Roughly half the track returns nothing, with no zero-region indication.

4. **`src/routes/inventory.tsx:2142-2153` — mileage slider spans 0–50,000 mi** against a 6–8,420 mi lot. **The top ~83% of the track is dead**, and the label says "50,000+ mi".

5. **`src/routes/inventory.tsx:2112` — model-year pills are hard-coded** `["All", 2025, 2024]` rather than derived. Correct today; wrong the first time a year sells out or a 2026 arrives.

6. **`src/lib/vehicles.ts:159` — the Lightning carries badge `"New"`, which is not in `FILTER_OPTIONS.badges`.** The badge is visible on the card and VDP but has no corresponding filter, and `slugToBadge("new")` returns undefined.

7. **`scripts/generate-sitemap.ts:27-38`** builds `/inventory?type=X` and `?fuel=Y` from `FILTER_OPTIONS`, **not from `vehicles`** — unlike `FrequentSearches`, which does filter. Every facet has stock today, but the day the F-150 sells, `/inventory?type=Truck` becomes a sitemap-submitted, self-canonical, indexed **empty page**.

8. **`src/routes/ford-dealer.$city.tsx:49` — `STRING_SEARCH_KEYS` omits `condition`.** Any future city `popularWith` entry using `{condition: ...}` would be silently stripped and land on unfiltered inventory. Latent, not live.

### B. Content pages / links that promise inventory the lot doesn't hold

9. **`src/components/site/SiteFooter.tsx:15` — footer link reads "New & Used Inventory".** There is no used stock and the URL contract explicitly rejects `?condition=Used`. Every other surface on the site was scrubbed of "used"; this one wasn't.

10. **`src/components/site/SiteFooter.tsx:18` — "Commercial & Work Vehicles" sits under the heading "Shop".** `/commercial` is admirably honest (its FAQ literally says "Do you have commercial vehicles in stock right now? No") but the nav framing sells it as shoppable stock, and its `SERVICE_SCHEMA` advertises Transit / Super Duty / chassis cab / E-Series to Google.

11. **`src/routes/ford.$model.tsx`** model pages discuss configurations the lot cannot show — F-150 SuperCrew vs SuperCab vs regular cab, EcoBoost vs V8 Mustang, two-door vs four-door Bronco, Escape plug-in hybrid, Bronco Sport. Each page has exactly **one** unit behind it. The empty-state branch (line 296) is well-written; the problem is that "Browse {model} listings" and "Filter our inventory to {model} listings" both lead to a one-card grid.

12. **`src/components/site/SiteFooter.tsx:117` — `sales@amfordashtabula.com`.** The dealership is in **Jefferson**, not Ashtabula, and every page on the site is built around that distinction.

### C. Claims and controls with no data or system behind them

13. **`src/routes/vehicle.$id.tsx:543-557` — a fake three-shot gallery.** `[v.image, v.image, v.image].map(...)` renders the same single photo three times, alt-texted "gallery view 1", "2", "3". The data holds one image per vehicle.

14. **`src/routes/vehicle.$id.tsx:582` — a hard-coded "Lifetime warranty" badge on every vehicle.** Not in the data, not approved, and it contradicts the inventory FAQ (line 86: "3-year/36,000-mile Bumper-to-Bumper… 5-year/60,000-mile Powertrain") and the CPO copy's own rule that terms are documented per vehicle, never printed.

15. **`src/routes/inventory.tsx:2279` — a fabricated VIN.** `vin: \`1FT${selectedVehicleForOtp.id.toUpperCase()}2025\`` is passed into the lead payload for every SRP "Get Price" submission. `vehicles.ts:31` says in capitals: *"NEVER generate a VIN — a fabricated one is a legal risk."* Meanwhile no page ever **displays** a VIN, which the type comment says the brief requires.

16. **Monthly payments and APR are published in three places, against an explicit written policy that they are not.**
    - `src/components/site/VehicleCard.tsx:141` prints `~$XXX/mo est.` from `estMonthlyPayment()` (`leads.ts:70`: hard-coded 10% down / 72 mo / **7.49% APR**) on every card.
    - `src/routes/financing.tsx:67` hard-codes `apr = 5.9` and renders "5.9% APR" plus a live monthly figure.
    - `src/routes/vehicle.$id.tsx:1574-1592` runs a second calculator with its own APR.
    - Against: `inventory.tsx:129` ("The client brief forbids publishing APR figures or monthly payments") and `inventory.tsx:2699` ("No rate and no monthly payment is published anywhere on this site"). Two different rates, in the same product, one of which is asserted not to exist.

17. **`src/routes/financing.tsx` — capability claims with no implementation.** "Pre-approved in 60 seconds", "Soft credit pull only: no impact to your score", "Won't affect your credit score", "Bank-grade encryption", "Trade-in valuation included", and the same claims in the meta description and og:description. The form does one Supabase insert. There is no bureau call, no lender integration, no pre-approval, and nothing that would substantiate an encryption claim. Same copy repeats at `src/components/site/Home.tsx:663`. The calculator's price range ($15,000–$120,000) also has no relationship to the lot.

18. **`src/components/popups/OTPPopup.tsx` — "Unlock Your Instant Price" / "provide your contact information to reveal this vehicle's Instant Price".** The sidebar of that same modal already displays the price (line 143-147), the success screen reveals nothing (line 641: "Request Received!"), and the `otp` state and `"otp"` step are dead code — no code is ever sent or verified. A gate over information the visitor already has.

19. **`$500` offers with no offer behind them.** `inventory.tsx:131-153` `ACTIVE_OFFERS` ($500 Trade-In Bonus, "VIP Price Match Promise — we match any written local offer"), `OfferPopup` ("Claim my $500 off", "$500 off voucher request"), `TradeOfferPopup`, `TradeValuatorModal:321`, `Home.tsx:117`, and most pointedly **`ExitIntentOffer.tsx:192` — "Your $500 voucher is locked in"**, a completed-transaction statement with no voucher, code, expiry, or record. `ChatWidget.tsx:46` adds "Most trades at AM Ford appraise higher than owners expect", an unsupportable statistical claim.

20. **`src/routes/service.tsx` — a booking UI that books nothing, at hours the store isn't open.** Day chips are hard-coded `["Today","Tomorrow","Thu","Fri","Sat"]` (on a Thursday, "Thu" *is* today; "Tomorrow" can be Sunday, when `dealerInfo.hours` says **Closed**). Time chips include **8:00 AM**, an hour before the 9:00 AM opening on every day of the week. The button says "Confirm appointment" and the success screen says "We've got your request" — it submits a `general_contact` lead. Prices are invented (`The Works® $59.95`, `Brake From $199`, `Diagnostics $129`, "match any local tire price for 30 days"); the page's own `SERVICE_SCHEMA` comment (line 99) says prices are "deliberately excluded as unapproved claims" from the schema — while the visible page prints them.

21. **`src/routes/about.tsx:82-85, 109, 123, 131` — an entire page of unsourced numbers.** "60+ Years", "20k+ Vehicles delivered", "**4.9★ Average review score**", "30+ Team members", "Since 1962", "Ford President's Award", "one of the top-rated Ford dealers in Northeast Ohio", "Three generations". No review data, no award data, and no dealership-history data exists anywhere in `src/lib`. This is the only page that never got the data-derivation treatment the rest of the site received.

22. **`src/components/home/sections/FeaturedSpotlight.tsx:67` — "Three of the six vehicles on the lot"** hard-codes the count, while the neighbouring `ExtraordinaryCarousel` and `Hero` both interpolate `vehicles.length`.

23. **`src/routes/inventory.tsx:1296-1302` — a "Verified / Pre-Owned Stock" stat card** on a lot with a single pre-owned unit, and `:2280` "Available today" / `:1250` "30-sec response" (against `RESPONSE_PROMISE`'s 15 minutes, business hours only).

24. **`src/routes/vehicle.$id.tsx:596-599` — "1 in stock; when it's gone, it's gone"** is hard-coded, not derived. True for all six today by accident of the data shape, not by construction.

### What is already correct (do not regress it in the redesign)

`FrequentSearches`, `SiteNav`, `SiteFooter`'s link block, `MostSearchedCars`, `ExtraordinaryCarousel`, `ShopByCategory`, `InventoryInterlinks`, the inventory pager, the inventory landing-page/canonical/robots logic, the `/commercial` FAQ, `ford.$model` empty state, `counties.alternativeLinks` for Trumbull, and `alsoServed` towns rendered as plain text rather than fake links — all derive from or defend against the data correctly, and several carry comments recording the exact bug they were built to prevent. The failures above are the surfaces that pass never reached: the **homepage hero search card**, the **inventory filter drawer's hand-written option lists**, the **VDP hero panel**, **service**, **financing**, **about**, and the **popup/offer layer**.