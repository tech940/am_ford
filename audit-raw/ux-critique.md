## Journey trace

`/` (`src/routes/index.tsx:37` → `HomePage.tsx:55`) → `/inventory` (`inventory.tsx:818`) → `/vehicle/$id` (`vehicle.$id.tsx:464`) → seven distinct capture surfaces: `OTPPopup`, `LeadCaptureModal`, `QuickEnquiryModal`, `OfferPopup`, `TradeValuatorModal`, `ExitIntentOffer`, `ChatWidget`.

The funnel is not leaking at one seam. It leaks because **three different teams' conversion models are stacked on the same pages and none of them defers to the others**: an SEO/content model, a "gate the value" model, and a "discount coupon" model. Below, ranked by revenue destroyed.

---

### 1. The inventory page opens with a lead form, on mobile, that throws away everything typed into it

**What breaks.** `inventory.tsx:1121` sets the offer card `order-1 lg:order-2` and `:1261` sets the H1/description column `order-2 lg:order-1`. On a phone, the first thing under the nav on the *inventory* page is a Full Name + Phone + two-select form (`:1166–1256`). The H1 ("Vehicles for Sale in Jefferson", `:1266`), the count, the search bar, the filter button, and the first vehicle card are all below it — roughly two screens down.

Then the form discards the input. The name input (`:1173–1178`) and phone input (`:1189–1194`) have `required` and a `placeholder` but **no `value`, no `onChange`, no `name`, no `ref`**. The submit handler (`:1157–1163`) reads only `offerVehicleId` and opens `OTPPopup`. `OTPPopup` then asks for First Name (`OTPPopup.tsx:345`), Last Name (`:374`), Phone (`:434`), Email (`:468`) and a consent checkbox (`:539`) — from scratch.

**Commercially.** The SRP is the highest-intent page on a dealer site and the top of it is a wall between the shopper and the inventory they arrived to see. Everyone who does comply pays the name/phone tax twice; typing your phone number and being asked for it again immediately is the single most reliable abandonment trigger in lead forms. The "30-sec response" promise at `:1250` is made by a form that captures nothing.

**Structural fix.** The SRP hero is the wrong owner of a lead form. Delete the form; make the hero a result-state header (H1, live count, active-filter summary, search). Move the offer to a single sticky bar or an inline row inside the grid after ~6 cards, where intent is established. If the hero form survives that argument, it must be the *only* step: lift `firstName`/`phone` into state and pass them as `initialUserData` into `OTPPopup`, which opens on its consent step, not its form step.

---

### 2. "Get Price" gates a price that is printed above the button, and printed *inside* the modal that claims to be hiding it

**What breaks.** `VehicleCard.tsx:132–134` renders `$${v.price.toLocaleString()}`. `VehicleCard.tsx:158–163` renders a "Get Price" button 25px below it. `vehicle.$id.tsx:574` renders the price; `:608–613` renders "Get Price" directly under it. The modal that opens says "Unlock Your Instant Price" and "provide your contact information to reveal this vehicle's Instant Price" (`OTPPopup.tsx:107`, `:118`) — and then at `OTPPopup.tsx:143–147` **renders that same price in the sidebar, in yellow, before any field is filled.** The success state (`:601–716`) never shows a price at all; it shows "Request Received!" and echoes back the shopper's own contact details.

**Commercially.** This is a gate with nothing behind it, and the shopper can see that in under two seconds. It doesn't just fail to convert — it retro-actively discredits every honest claim on the page ("No-Hassle Transparent Pricing", `inventory.tsx:1776`; "No hidden dealer markup", `vehicle.$id.tsx:875`). A shopper who catches one bluff assumes the price itself is a bluff, which is the exact objection the transparent-pricing copy exists to defuse.

**Structural fix.** Either the gate has a payload or it doesn't exist. If AM Ford has a real e-price below the listed number, the listed number becomes MSRP/list, the button becomes "See your out-the-door price", and the success state *renders the number*. If there is no second number — which is what the code says — delete `OTPPopup` from both call sites and let `QuickEnquiryModal` (one required field, `QuickEnquiryModal.tsx:237–248`) carry the ask.

---

### 3. The VDP action panel presents ten asks at three weights and no hierarchy

**What breaks.** `vehicle.$id.tsx:601–666` stacks eight controls: "Is this still available?" (`:602`), "Get Price" (`:608`), "Book test drive" (`:614`), "Request E-Price Quote" (`:623`), Text us / Call us (`:633`, `:639`), Video tour / Watch price (`:647`, `:653`). Three of them (`:604`, `:619`, and the enquiry button) are `bg-primary` at the same size — the page has three co-equal primary buttons, which means it has none. `InspectionUnlock` (`:942`) and the calculator's "Get pre-approved" (`:945`) add two more further down.

Worse, "Get Price" (`:612`) and "Request E-Price Quote" (`:630`) are the same request under two names, routed to two *different* modals with two different field sets and two different consent regimes.

**Commercially.** Hick's law with money attached: ten roughly-equal options on the decision screen converts worse than three ranked ones. And the split between two price-request paths fragments the lead data — the same intent lands in Supabase as `quote_request` from `OTPPopup` and as `quote_request` from `LeadCaptureModal` with an incompatible payload shape, so the sales desk cannot tell which shoppers asked for what.

**Structural fix.** One primary, one secondary, one tertiary, everything else demoted to a text link or moved out of the panel. Proposed: primary = "Book a test drive" (the action that actually moves metal); secondary = "Check availability" (`QuickEnquiryModal`, one field); tertiary = call/text row. Kill "Get Price" (see #2). Move Video tour / Watch price into the gallery and the price block respectively, where they're contextual instead of competing. The panel should be a decision, not a menu.

---

### 4. The gallery is one photograph, three times

**What breaks.** `vehicle.$id.tsx:543–557`: `{[v.image, v.image, v.image].map((src, i) => ...)}` with alt text "gallery view 1", "gallery view 2", "gallery view 3". The hero (`:522`) is the fourth instance of the same file.

**Commercially.** Photography is the highest-engagement element on any VDP and the primary substitute for physical inspection — it is what a shopper trades a 40-minute drive to Jefferson against. Presenting three identical thumbnails as a gallery reads as either broken or evasive; on a used/CPO unit (the Escape at `vehicles.ts:198`) "why won't they show me the interior?" is a purchase-stopping question. This also starves every downstream trust asset: the seller's notes (`:733`) describe a car the shopper cannot see, and the inspection section (`:942`) claims a 172-point check with no visual evidence.

**Structural fix.** Add `images: string[]` to the `Vehicle` type with a required minimum set (front 3/4, rear 3/4, interior/dash, odometer, wheels) and render a real gallery with a lightbox. Where a unit has only one photo, render one photo and a labelled "More photos on request" action — an honest single image outperforms a fake gallery. This is a data-model change, not a component change.

---

### 5. "Get Price" on a related vehicle submits a lead for the wrong car

**What breaks.** `vehicle.$id.tsx:978–980`:

```
onGetPrice={(selectedCar) => {
  setOtpOpen(true);
}}
```

`selectedCar` is bound and discarded. `OTPPopup` at `:1009–1018` is always constructed from `v` — the vehicle the page is about. A shopper on the F-150 page who clicks "Get Price" on the Bronco card in "You might also like" gets a modal titled with the F-150, and the lead is stamped with the F-150's title, price and stock number.

**Commercially.** The lead survives; the *intent* doesn't. A salesperson calls back about the wrong vehicle, which reads to the customer as "they weren't listening," and the recorded cross-sell signal is destroyed. This is also silently corrupting whatever attribution the dealership uses to decide what to stock.

**Structural fix.** Hoist the OTP/enquiry target into state: `const [priceTarget, setPriceTarget] = useState<Vehicle>(v)` and have every `onGetPrice` set it. More durably: no capture component should ever read a vehicle from enclosing page scope — make `vehicle` a required prop on every modal so this class of mismatch is a type error rather than a runtime one.

---

### 6. Converting doesn't stop the selling — high-intent leads get hit with the exit discount

**What breaks.** `ExitIntentOffer.tsx:49` correctly suppresses on `hasSubmittedLead()`. That flag is only ever set inside `submitQuickLead` (`leads.ts:62`), which is used by `QuickEnquiryModal` and `InspectionUnlock`. The three heaviest surfaces call `submitLeadInquiry` directly and never set it: `LeadCaptureModal.tsx:98`, `OTPPopup.tsx:230`, `OfferPopup.tsx:182`.

**Commercially.** A shopper books a test drive on a $71k Platinum — the most valuable event on the site — and is then interrupted by a modal offering $500 off to a stranger. It reframes a committed buyer as an un-won prospect, invites them to renegotiate a deal they already entered, and hands them a discount the dealership had not conceded. It also means `hasSubmittedLead` is silently unreliable for any future suppression logic built on it.

**Structural fix.** Delete `submitLeadInquiry` from component code entirely. `submitQuickLead` in `lib/leads.ts` is already the funnel that stamps consent, attaches `vehicle_id`, and records conversion — make it the only export components can reach, and give it the `preferred_date`/`preferred_time`/`financing_details` fields `LeadCaptureModal` currently needs the raw call for. One funnel, one conversion flag, one consent stamp.

---

### 7. Four unreconciled "$500" offers, and the shopper is asked to pick between three of them

**What breaks.** `inventory.tsx:131–153` defines a $500 Trade-In Bonus / Rate Quote / VIP Price Match set and puts it in a **select** (`:1221–1231`) — the shopper must choose which incentive they want before knowing what any of them are worth. `inventory.tsx:1486–1492` adds a "Claim $500 OFF" chip opening `OfferPopup`, whose headline is a flat "$500 OFF your new vehicle purchase" (`OfferPopup.tsx:260–265`). `ExitIntentOffer.tsx:168–175` offers "$500 … one per customer, valid on any in-stock vehicle." The homepage opens the same `OfferPopup` from two more places (`MostSearchedCars.tsx:151`, `FeaturedSpotlight.tsx:73`).

**Commercially.** The shopper cannot answer the only question that matters — *is this one $500 or several, and does it stack with my trade?* — so the rational move is to assume it's marketing noise and ignore all of them. Meanwhile "one per customer" is asserted by one surface and contradicted by the other three, which is a written-offer problem, not just a UX one. And the offer *select* is a decision point placed before the value is established: nobody can choose between a trade bonus and a price-match promise at the top of a listing page.

**Structural fix.** One incentive object in `lib/`, one canonical wording, one set of terms, rendered by every surface that mentions it — the same discipline `FAQ_ITEMS` (`inventory.tsx:63`) already applies to FAQ text. Stop asking the shopper to pick an incentive; capture the lead and let the desk apply whichever is worth more. Cap it to one interruption per session by routing all offer surfaces through the `hasSubmittedLead` / `shownRecently` gate that `ExitIntentOffer` already implements.

---

### 8. `LeadCaptureModal` re-opens a decision the shopper already made, drops the fourth mode, and collects a phone number with no consent

**What breaks.** The shopper clicks "Book test drive" (`vehicle.$id.tsx:614`). The modal opens (`LeadCaptureModal.tsx:198–235`) showing three chips — Test Drive / Get Quote / Special Order — inviting them to reconsider the choice they just made. When the calculator opens it in `financing_preapproval` mode (`vehicle.$id.tsx:949`), the header reads "Get Pre-Approved Online" (`:137`) but **no chip matches**, so the segmented control renders with nothing selected — it reads as an unanswered required question, and any chip click silently converts a financing lead into a different `lead_type`.

Then: three required fields (`:78–81` — name, email, *and* phone) against `QuickEnquiryModal`'s one. And no consent checkbox anywhere — `:364–369` substitutes "Your information is confidential and will never be shared with third parties," while `CONSENT_TEXT` (`leads.ts:6`) appears on `QuickEnquiryModal`, `ExitIntentOffer`, `OTPPopup`, and `InspectionUnlock`. It also has no Escape handler, no scroll lock, no `role="dialog"` and no focus trap, all four of which `OfferPopup`'s `ModalShell` (`:43–98`) implements correctly.

**Commercially.** Each extra required field costs conversion; email is the least useful of the three for a dealership that promises a call or text in 15 minutes (`leads.ts:11`). The unselected chip state on the financing path loses the highest-value lead type on the site. And collecting a phone number for follow-up with no consent record, on the one surface that omits it, is TCPA exposure on the path that generates the most calls.

**Structural fix.** Mode is context, not a question — render the chosen mode as a non-interactive header row with a small "not what you wanted?" link, and add the missing `financing_preapproval` case so no state renders as unselected. Reduce required fields to phone + name, email optional. Extract `OfferPopup`'s `ModalShell` into a shared `<Modal>` and mount every capture surface inside it, so dialog semantics and consent are structural rather than per-component.

---

### Also found, below the top eight

- **The homepage shows the same six cars four times** — `MostSearchedCars` (4), `FeaturedSpotlight.tsx:22` (3), `ExtraordinaryCarousel.tsx:20` (all 6), `FeaturedCars.tsx:179` (all 6). ~19 card impressions of 6 unique vehicles before `/inventory`, which makes "Browse all 6 vehicles" (`ExtraordinaryCarousel.tsx:258`) an invitation to see what you've already seen. Repetition without new information is the definition of weak scent.
- **Monthly payments are published against an explicit prohibition.** `inventory.tsx:125–129` states the brief forbids APR figures and monthly payments; `VehicleCard.tsx:141` prints `~$X/mo est.` on every card via `estMonthlyPayment` (7.49% APR, `leads.ts:70`), and `PaymentCalculator` (`vehicle.$id.tsx:1642–1650`) lets the shopper dial APR down to 2.9% and then click "Get pre-approved for this payment" — anchoring a number the finance desk will have to walk back.
- **Hard-coded scarcity on every vehicle** — "1 in stock; when it's gone, it's gone" (`vehicle.$id.tsx:596–599`) renders identically for all six units, and reads as boilerplate the moment a shopper opens a second tab.
- **The inspection gate has no payload.** `INSPECTION_AREAS` (`vehicle.$id.tsx:1382–1390`) is a static const — the "unlocked" reward is byte-identical for all six vehicles, and the copy admits the real document is only available in person (`:1411–1412`).
- **The mobile sticky CTA discards vehicle context** — `MobileStickyCTA.tsx:21–27` sends "Book" to `/contact`, a generic form, from a VDP that knows exactly which car the shopper is looking at.
- **Mobile z-index collision** — the chat FAB sits at `bottom-24 right-4 z-[60]` (`ChatWidget.tsx:342`) directly on top of the compare tray at `bottom-24 z-40` (`inventory.tsx:2213`), above the sticky CTA bar at `bottom-0 z-40`. Three fixed layers competing for the same thumb zone.
- **Scent breaks between hero search and SRP headline** — the hero card (`Hero.tsx:44–56`) sends condition + price band + body style, but `landingLabel` (`inventory.tsx:580`) only names a filter when *exactly one* is active, so a three-facet search lands on a page headlined "Vehicles for Sale in Jefferson" that acknowledges none of it.
- **`Verified / Pre-Owned Stock`** as one of two hero trust stats (`inventory.tsx:1294–1304`) on a lot that is five New and one CPO — the stat advertises the thing the inventory has least of.