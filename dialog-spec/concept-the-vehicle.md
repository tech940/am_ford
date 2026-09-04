# THE VEHICLE IS THE DIALOG
Complete specification for the AM Ford lead dialog system. Angle: the panel is a vehicle document that happens to contain a form.

Repo root `C:\Users\sahil\Downloads\velocity-craft-canvas-main`. Files to change: `src\components\lead\VehicleLeadDialog.tsx`, `src\components\lead\ModelEnquiryDialog.tsx`, `src\components\ledger\Dialog.tsx`, `src\components\ledger\Field.tsx`, `src\lib\leads.ts`.

---

## 0. THE STRUCTURAL MOVE

One panel, two columns. Column 1 is **the vehicle** and never changes for the life of the dialog, including through submit, success and failure. Column 2 is **the exchange** and is the only thing that swaps.

That single decision fixes four of the eleven listed defects for free: the panel cannot shrink at success (defect 1), the dialog looks like a car (defect 2), the panel has a shape of its own (defect 10), and `ModelEnquiryDialog`'s lone-title header gets a body (defect 11) because `LINEUP[].image` keys (`model-f-150`, `model-bronco`, all 17 at `src/assets/images.gen.ts:434-570`, 640x480) resolve through `IMAGES` exactly like vehicle photographs do.

New width preset in `Dialog.tsx`:

```ts
size === "lead"  ? "max-w-[44rem]"   // 704px: 280px rail + 424px form column
: size === "wide" ? "max-w-[56rem]"
: "max-w-[30rem]"
```

DOM order is one order for both breakpoints, placed by grid on desktop:

```
DialogContent size="lead"
  className="sm:grid sm:grid-cols-[17.5rem_minmax(0,1fr)] sm:grid-rows-[auto_minmax(0,1fr)]"
├ DialogHeader       sm:col-start-2 sm:row-start-1
├ <section> RAIL     sm:col-start-1 sm:row-start-1 sm:row-span-2  (order-2 on mobile is DOM order)
└ <form noValidate>  sm:col-start-2 sm:row-start-2  "flex min-h-0 flex-col"
   ├ DialogBody      "flex-1 overflow-y-auto"
   └ DialogFooter
```

The `<form>` wraps only body and footer, so grid placement needs no `display:contents`. `min-h-0` on the form is what keeps `DialogBody` the scrolling element rather than the panel.

Screen reader order becomes: dialog name (the intent question) → vehicle section → lead paragraph → fields. Which is the reading order the design wants.

---

## 1. ANATOMY

### 1200px viewport (panel 704 x ~560, centred)

**Panel** — `DialogContent size="lead"`. Unchanged from today: `border border-rule bg-white`, the two-level shadow, square, `max-h-[92dvh]`, `z-50`, one tier.

**Close** — `Dialog.tsx:60`, raised from `h-9 w-9` to `h-11 w-11` with `IconClose h-5 w-5`, matching `Sheet.tsx:61`. Closes defect 5 in one line. Stays `absolute right-3 top-3`; `DialogHeader` keeps `pr-14`.

**Column 1, the rail** — `<section aria-label="Vehicle you are asking about">`, `border-r border-rule bg-surface` (#F2EEE8, so the rail reads as a distinct leaf against the white form), `flex flex-col`.

| # | Element | Token / component |
|---|---|---|
| 1 | Photograph, full-bleed to the rail's three edges | `div.relative.aspect-[4/3].bg-ink` (`bg-surface` instead when the source is a `model-*` render, which is a cutout on white) |
| 2 | `ResponsiveImage` | `name={imageNameFromSrc(vehicle.image)}`, `sizes="280px"`, `aspect={{width:4,height:3}}`, `className="h-full w-full object-cover"`. No hover scale. Not a link. |
| 3 | Condition chip, over the photo | `Chip tone="onDark" size="sm"` at `absolute left-3 top-3`. Same as `VehicleCard.tsx:117` so the dialog is visibly the card's continuation |
| 4 | Identity block | `px-5 pt-4 pb-3` |
| 5 | Eyebrow `2025 Ford` | `text-micro font-bold uppercase tracking-[0.09em] text-ink-3` |
| 6 | `F-150` + `Platinum` | `text-h3 font-bold text-ink` with trim as `span.font-normal.text-ink-3` |
| 7 | Price `$64,995` | `font-display text-h2 font-bold tabular-nums text-brand`. Archivo Expanded, figures only, sanctioned use |
| 8 | Struck MSRP, only when `msrp > price` | `text-meta tabular-nums text-ink-3 line-through`, baseline-aligned beside 7 |
| 9 | `$3,425 below MSRP`, only when derived > 0 | `text-meta font-semibold text-available` + `IconSavings h-3.5 w-3.5`. Derived, never authored, same rule as `VehicleCard.tsx:241-247` |
| 10 | `SpecTable` | `columns={1}`, `px-5`. Four rows, selected per intent (§4) |
| 11 | Seller notes label | `mt-4 px-5 text-micro font-bold uppercase tracking-[0.09em] text-ink-3` reading `Notes on this vehicle` |
| 12 | Seller notes excerpt | `mt-1.5 px-5 text-meta leading-relaxed text-ink-2`. First **two sentences** of `vehicle.sellerNotes`, split deterministically on `/(?<=\.)\s+/`, not `line-clamp` — clamping cuts hand-written prose mid-word and the ellipsis reads as broken data. Whole block omitted when `sellerNotes` is undefined |
| 13 | Rail foot | `mt-auto border-t border-rule px-5 py-3.5` |
| 14 | `Free home delivery within 300 miles` | `DELIVERY_SHORT` verbatim, `text-meta text-ink-2`, `IconPin h-3.5 w-3.5 text-ink-3` |
| 15 | `(440) 998-2151` | `a href={dealerInfo.phoneHref}` `text-meta font-semibold text-brand underline underline-offset-[3px]`, `IconPhone h-3.5 w-3.5`. A second real channel, not a button, so the one-filled-button rule holds |

Rail height at the F-150: 210 photo + ~104 identity + ~130 spec table + ~76 notes + 52 foot ≈ 572px. The rail sets the panel height, which is why the success state cannot shrink the panel on desktop.

**Column 2, the exchange**

| # | Element | Token / component |
|---|---|---|
| 16 | `DialogHeader` | unchanged: `border-b border-rule px-6 py-5 pr-14` |
| 17 | `DialogTitle` | `cfg.title(vehicle)`, `text-h3 font-bold text-ink`. The accessible name |
| 18 | `DialogDescription` | **changed**: no longer the vehicle string, that is now the rail's job. It carries the intent promise instead, so the header stops repeating what column 1 already shows. `text-meta leading-relaxed text-ink-2` |
| 19 | `DialogBody` | `flex-1 overflow-y-auto px-6 py-5` |
| 20 | Intent block, 3 of 6 intents | see §4 |
| 21 | Field stack | `grid gap-5`, fields per §3 |
| 22 | `ConsentCheckbox` | unchanged wiring, `id={`lead-consent-${vehicle.id}`}`, 24px native control, `CONSENT_TEXT` verbatim |
| 23 | Failure banner | see §6 |
| 24 | `DialogFooter` | `border-t border-rule px-6 py-4`, `relative` so the progress rule can pin to its top edge |
| 25 | Submit | `Button type="submit" block`, `bg-brand`, `h-11`, label `cfg.cta` |

The `cfg.lead` paragraph at `VehicleLeadDialog.tsx:219` is **deleted**. It was the third grey `text-meta` paragraph in a row (defect 3); its content moves into `DialogDescription` (#18) where it is the only supporting sentence in the header, and the body opens directly on a field. That takes the panel from four same-weight grey blocks to two.

### 375 x 812 (mobile)

Panel is `w-[calc(100vw-2rem)]` = 343px, `max-h-[92dvh]`.

Order: header, then the rail collapsed to a horizontal **band**, then the form.

Rail classes toggle at `sm`:
```
"flex flex-row items-center gap-3 border-b border-rule bg-surface px-4 py-3
 sm:flex-col sm:items-stretch sm:gap-0 sm:border-b-0 sm:border-r sm:px-0 sm:py-0"
```
- photo: `w-[5.5rem] shrink-0 aspect-[4/3] sm:w-full` (88 x 66)
- identity: eyebrow `text-micro`, model `text-ui font-bold`, price `font-display text-h3 text-brand`
- **spec line replaces the SpecTable**: `Delivery miles · 4WD · 400 hp`, one line, `text-meta text-ink-2`, `sm:hidden`. The `SpecTable` is `hidden sm:grid`
- rows 11-15 (notes, delivery, phone) are `hidden sm:block`

Band height: 66px photo, 90px including padding and border. Hard ceiling of 96px, see §9.

The band sits **below** the header, not above it, so it never collides with the 44px close button and the header keeps its `pr-14`.

Everything else stacks unchanged. `DialogFooter` keeps `flex-col-reverse ... sm:flex-row`, so where the success state has two actions, the primary is the bottom one on mobile and the right one on desktop.

---

## 2. THE FIRST THREE SECONDS

Before a word is read, at both widths, in this order:

1. **A photograph of the exact truck**, at real scale, on ink. Not an icon, not an illustration, not a logo. This is the only thing at that size and the eye goes there.
2. **One navy figure**, `$64,995`, in the only extended typeface on the site. It is the second largest thing and the only saturated colour outside the submit button. Nothing else in the panel is Archivo Expanded, so the price is unmistakably a price.
3. **A visible split**: a warm grey column against a white column, divided by a hairline. The shape says "this side is the car, this side is what you do about it" before any label is parsed.
4. **A short white column with one filled navy button at the bottom.** The form's silhouette is three or four short bars, which reads as small.

The understanding delivered without reading: *this is about that specific truck, at that price, and it will take a moment.*

What is deliberately not in the first three seconds: any red, any badge cluster, any offer, any headline larger than the price. On mobile item 3 becomes a horizontal band rather than a column, and items 1, 2 and 4 are unchanged.

---

## 3. FIELDS

Ordering rule everywhere except `enquiry`: **who you are, then what is specific to the ask, then anything else, then consent.**

| Field | Control | Required | Intents | Justification |
|---|---|---|---|---|
| Your name | `Input autoComplete="name"` | yes | all 6 | The dealership calls within 15 minutes. A call that opens "am I speaking with the person who enquired about the F-150" fails. `submitQuickLead` currently substitutes `"Not provided"` (`leads.ts:57`), which is a salesperson opening blind. Cost: one field, autofilled on nearly every device |
| Phone number | `Input type="tel" autoComplete="tel"` | yes | all 6 | It is the entire product. `RESPONSE_PROMISE` promises a call or a text and nothing else. Hint text drops to `Where we call or text you back.` |
| Your question | `Textarea rows={4}` | **yes** | `enquiry` only, **first field** | For enquiry the question *is* the lead. Promoting it above the name is the difference between a form and a message |
| Preferred day | `Input type="date"` | no | `test_drive` | A test drive is an appointment. Without it the first call back is spent scheduling. `min` = today, `max` = today + 60d, Sunday rejected client-side against `dealerInfo.hours` |
| Time | `Select` | no | `test_drive` | Three windows derived from `dealerInfo.hours`, not invented: `Morning`, `Afternoon`, `Evening (Mon to Thu)`. Paired with the date in a `sm:grid-cols-2 gap-4` row so the two cost one row of height |
| Year | `Input inputMode="numeric" maxLength={4}` | no | `trade` | Three real fields replace the placeholder hack at `VehicleLeadDialog.tsx:264-268`, which asked for year, make, model and mileage inside one free-text box and therefore got them back unparsed |
| Make and model | `Input` | no | `trade` | as above |
| Mileage | `Input inputMode="numeric"` | no | `trade` | as above. Year and Mileage share a `grid-cols-2` row |
| Email | `Input type="email"` | no | **`finance` only** | Kept exactly where it produces paperwork. A credit application generates documents; a phone number cannot receive them |
| Anything we should know | `Textarea rows={2}` | no | `price`, `test_drive`, `trade`, `finance` | Demoted from 3 rows to 2 and moved last. It is the escape hatch, not a prompt |
| Consent | `ConsentCheckbox` | yes | all 6 | TCPA. `CONSENT_TEXT` verbatim, never paraphrased, never reduced to a passive paragraph the way `OfferPopup.tsx:352-359` does |

**Dropped: email on five of six intents.** It is a fourth typed field on a form that promises a call or a text, `submitQuickLead` is happy with `""` (`leads.ts:57`), and no downstream surface uses it. On a 375px screen it is roughly 88px of panel height buying a channel the dealership does not promise to use.

**Dropped: availability's message field.** `availability` becomes name, phone, consent. Three controls, the shortest form in the system, and that shortness is the intent's design rather than a copy variation.

**Never asked, ever:** SSN, date of birth, income, address, driver licence number, card details, or a password. `finance` states this explicitly in its intent block (§4) because saying it converts.

**Validation changes** (`VehicleLeadDialog.tsx:137-143`):
- `<form noValidate>`. `Field` sets `required` on every control it wraps (`Field.tsx:103`), so today the browser's native bubble fires on an empty name while the JS validator does not check it. Two validation systems, one of them unstyled and unlocalised. Ours is the only one.
- Add `if (!name.trim()) next.name = "We need a name to ask for when we call."`
- Keep phone: `< 10` digits → `"Enter a phone number we can reach you on, including area code."`
- Keep consent: `"Please tick the box so we are allowed to contact you."`
- Add Sunday check on `test_drive`: `"We are closed on Sundays. Pick another day and we will have it ready."`
- On failure, move focus to the first invalid control. Today nothing moves and on a scrolled mobile body the error can be off screen.

---

## 4. HOW THE SIX INTENTS DIFFER

**Identical in all six:** panel geometry, rail structure, photograph treatment, price treatment, consent, footer, submit, success state, error handling, motion, `submitQuickLead` as the only path.

**Varies:** title, description, CTA, `leadType`, the four `SpecTable` rows, the optional intent block, and the note placeholder.

| | title | description (replaces `cfg.lead`) | rail spec rows | intent block | CTA | leadType |
|---|---|---|---|---|---|---|
| **enquiry** | Ask about the {model} | Tell us what you need to know and we will come back with a straight answer. | Odometer, Drivetrain, Economy/Range, Output | none | Send enquiry | `quote_request` |
| **price** | Best price on the {model} | The listed price is above. What a trade, a finance package or a current Ford programme does to it is the part we work out with you. | Listed price, MSRP, Below MSRP, Odometer | **Programmes** | Ask for the best price | `quote_request` |
| **availability** | Is the {model} still available? | We will confirm it is still on the lot and hold it while you decide whether to come in. | Odometer, Exterior, Interior, Drivetrain | none | Check availability | `quote_request` |
| **test_drive** | Drive the {model} | Tell us roughly when suits and we will have it ready and warmed up. | Odometer, Drivetrain, Economy/Range, Output | **Where and when** | Book a test drive | `test_drive` |
| **trade** | Trade against the {model} | Our used vehicle manager sets the number, not a web page. | Listed price, Odometer, Drivetrain, Output | **Their line** | Send trade details | `quote_request` |
| **finance** | Finance the {model} | We take one application to Ohio credit unions and national lenders, then bring you the terms they come back with. | Listed price, MSRP, Odometer, Output | **Programmes + what we do not ask** | Start an application | `financing_preapproval` |

Rail spec selection is the quiet half of this. On `availability` the rail answers "which one is it" with colour rows. On `price` it becomes a price ledger. Same component, same rules, different question.

**Intent block: Programmes** (`price`, `finance`)
```
<div className="mb-5 border-l-2 border-brand bg-brand-tint px-4 py-3">
  <p className="text-micro font-bold uppercase tracking-[0.09em] text-ink-3">Live Ford programmes</p>
  <ul className="mt-2 space-y-1.5">
    {activeIncentives(new Date()).slice(0, 2).map(i => (
      <li className="text-meta text-ink">
        {i.label}
        <span className="text-ink-3"> {i.programme}. Ends {fmt(i.endsOn)}.</span>
      </li>
    ))}
  </ul>
  <details className="mt-2">
    <summary className="cursor-pointer text-meta text-ink-3 ...">Programme terms</summary>
    …each i.disclaimer verbatim, text-meta text-ink-3…
  </details>
</div>
```
`finance` filters to `apr-0-36` and `defer-90`; `price` takes the first two active. **The whole block renders nothing when `activeIncentives()` is empty** (all four currently end `2026-08-31`, which is 17 days out). The disclaimers are required and go in verbatim; `<details>` keeps them out of the reading path without hiding them.

**Intent block: Where and when** (`test_drive`) — the rail gains a fifth line under the spec table, `IconPin` + `dealerInfo.address`, `text-meta text-ink-2`, plus today's closing time from `dealerInfo.hours`. In the body, the date and time pair.

**Intent block: Their line** (`trade`) — one sentence, `HOME_BLOCKS.trade.title` verbatim: *"Sell us your car, even if you don't buy from us."* `text-body text-ink` on `bg-surface px-4 py-3`. It is the dealership's own published copy and it is the best sentence on their site. No dollar figure appears anywhere near it.

**Intent block: What we do not ask** (`finance`, below the programmes) — *"We do not ask for a social security number or a date of birth on this form. The credit application happens with a person."* `text-meta text-ink-2`. True of this form, and it removes the single largest hesitation on a finance CTA.

`PRICING_STANCE` is **not** reprinted in the dialog. It runs as a banner on their homepage; restating "We will beat any deal" next to a form that cannot honour it is where an honest claim turns into a promise.

---

## 5. SUCCESS STATE

The rail does not move, does not fade, does not re-render. Same node, same photograph, same price. The panel keeps its height on desktop because the rail was always the taller column.

Column 2 only:

| # | Element | Token |
|---|---|---|
| 1 | `DialogTitle` `We have your request` | `text-h3 font-bold text-ink` |
| 2 | `DialogDescription` | `{cfg.cta} for the {year} {model} {trim}` |
| 3 | Marker + promise, `DialogBody` | `flex gap-3` |
| 4 | Check marker | `grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-available/10 text-available` + `IconCheck h-4 w-4`. **2px square, not `rounded-full`** — the pill radius belongs to `Chip` alone (`index.ts:10`) |
| 5 | `RESPONSE_PROMISE` | **promoted** to `text-body text-ink`. It is now the largest sentence in the column, because it is the only one that still matters |
| 6 | Today's hours | derived from `dealerInfo.hours` and the current weekday: `We are open until 8:00 PM today.` / `We are closed today. Yours is first in on Monday.` `text-meta text-ink-2`. Makes "within 15 minutes during business hours" checkable rather than decorative |
| 7 | **The receipt** | `SpecTable columns={1}` with `Name`, `Phone`, and for `test_drive` `Day` and `Time`. This is what lets someone catch a mistyped digit in the ten seconds they are still looking at the panel |
| 8 | `DialogFooter` | **now exists**, which closes defect 1. `flex-col-reverse gap-2 sm:flex-row sm:justify-end` |
| 9 | Secondary action | `Button asChild variant="secondary"` around `<a href={dealerInfo.phoneHref}>` + `IconPhone`, label `Call (440) 998-2151` |
| 10 | Primary action | `DialogClose asChild` around `Button` labelled `Done`, `autoFocus` |

Focus lands on `Done`. One filled button, as everywhere. Escape and the close button still work; they are no longer the only exits.

Deliberately absent: any onward link. No "see similar vehicles", no "browse inventory", no "book a test drive too". The visitor converted. Sending them back into the funnel from a success panel is how a dealership site turns a lead into a bounce.

---

## 6. ERROR AND FAILURE

**Field errors** — `Field.tsx:74-78` gains a container, closing defect 6:
```
border-l-2 border-attention bg-attention/[0.06] px-2.5 py-1.5 text-meta font-medium text-attention
```
`role="alert"` and the `aria-describedby` wiring are untouched. No icon: `icons.tsx` has no alert glyph and drawing an exclamation into a system whose copy bans exclamation marks is the wrong answer. A 2px rule in `--attention` is the marker, which is consistent with a system that builds structure from rules.

While we are in the file, defect 4: the label at `Field.tsx:60` moves from `text-ink-3` to `text-ink-2`. Label, hint and placeholder are currently one colour; the label is the one that has to win.

**Submit failure** — full-width banner in the same treatment, placed as the last child of the field stack, `role="alert"`:
```
We could not send that just now.
Call or text us on (440) 998-2151 and we will pick it up from there.
```
with the number as a real `tel:` link. **Bug to fix while building:** `VehicleLeadDialog.tsx:161-164` appends its own "You can also call us on {phone}" to `res.message`, which already ends with `callInstead` from `supabase.ts:44`. The customer currently sees the same phone number twice in one paragraph. Use `res.message` alone, and linkify the number.

**Lead storage unconfigured at build time** — this is the important one, and it is knowable at render, not at submit. `leadStorageConfigured` (`supabase.ts:21`) is a build-time constant. When it is `false`, **the dialog never renders a form**:

- rail: unchanged, full, exactly as always
- title: `Call us about the {model}`
- description: `Our online form is not available right now.`
- body: the vehicle identity plus `We are open until 8:00 PM today.`
- footer, two real actions:
  - primary `Button asChild` → `<a href={dealerInfo.phoneHref}>` `Call (440) 998-2151`
  - secondary `Button asChild variant="secondary"` → `<a href={smsLink(vehicle)}>` `Text us about this truck`. `smsLink` (`leads.ts:81-86`) already pre-fills year, make, model, trim and price for this exact vehicle. It exists and nothing calls it.
- `console.error` at `supabase.ts:52-54` still fires

This is strictly better than the current behaviour, which lets someone fill four fields and press send before telling them it failed. Same branch handles `navigator.onLine === false` at submit time, minus the console noise.

**Double submit** — `if (status === "sending") return;` as the first line of `handleSubmit`, in addition to the button state. A keyboard Enter can fire twice before React re-renders.

**Busy state** — `disabled:opacity-45` (`Button.tsx:22`) makes the CTA look broken rather than busy (defect 7). Replace with `aria-disabled={true}` plus `pointer-events-none`, keeping the brand fill, and add a 2px progress rule pinned to the top edge of `DialogFooter`:
```
absolute inset-x-0 top-0 h-0.5 overflow-hidden
  › span "block h-full w-1/3 bg-brand animate-[leadprogress_1.1s_linear_infinite]"
```
Label reads `Sending`, not `Sending...`.

---

## 7. MOTION

| What | Duration | Curve | Notes |
|---|---|---|---|
| Overlay fade in | 160ms | `ease-out` | Explicit now; `Dialog.tsx:37` currently inherits an unstated default |
| Overlay fade out | 130ms | `ease-out` | |
| Panel enter | 200ms | `cubic-bezier(0.16, 1, 0.3, 1)` | fade + `translateY(8px → 0)`. Unchanged from `Dialog.tsx:52` |
| Panel exit | 150ms | linear | fade only, **no movement**, per the existing comment at `Dialog.tsx:50-51`. Dismissal must never feel like it is fighting the pointer |
| Photograph | 0 | — | No scale, no ken-burns, no hover. `VehicleCard.tsx:102` scales its image because it is a link; this one is not |
| Rail, on submit | 0 | — | The rail is the anchor. If it moves, the whole idea collapses |
| Form → success | 180ms in, 60ms delay | `ease-out` | Success block only: `animate-in fade-in-0 slide-in-from-bottom-1`. The form unmounts, so no exit animation and **no `AnimatePresence`**. `mode="wait"` freezes carousels and wizards under React 19; there are zero live uses left in this repo and reintroducing one here is a defect, not a choice |
| Field error appearing | 0 | — | It is `role="alert"`. Moving text while a screen reader announces it is hostile |
| Submit progress rule | 1.1s loop | linear | `translateX(-100% → 300%)` on a `w-1/3` bar |
| Consent checkbox | 0 | — | Native control, OS behaviour |

**Reduced motion.** `styles.css:415-424` already forces `animation-duration` and `transition-duration` to `0.001ms !important` globally. So every row above is neutralised without additional work, including the enter and exit. Two consequences to build for deliberately:

1. **No state may be carried by motion alone.** The progress rule must change *appearance*, not just stop: `motion-reduce:animate-none motion-reduce:w-full motion-reduce:bg-brand/30`. A frozen third-width bar is indistinguishable from a rendering bug.
2. Hover colour changes become instant, since the global rule kills transitions too. That is already true site-wide and is acceptable.

Nothing in the dialog loops, pulses, breathes, or draws attention to itself after settling. The only recurring animation in the entire system is the progress rule, and it exists only while a network request is in flight.

---

## 8. WHAT I DELIBERATELY LEFT OUT

- **A gallery.** `Vehicle` has one `image` (`vehicles.ts:25`). A carousel of one photograph is a lie about the data, and horizontal swipe inside a modal at 375px fights the page underneath.
- **Any monthly payment.** `estMonthlyPayment` exists (`leads.ts:70-78`) at a hardcoded 7.49% over 72 months. `VehicleCard.tsx:38-41` already dropped it on purpose. A payment figure beside a lead form reads as a quote, and this one is not.
- **Urgency of every kind.** No countdown, no "3 people viewing", no "last one at this price", no stock counter. Not in the data, banned by the brief, and `ExitIntentOffer.tsx:168` already shows what happens when a "$500 voucher is locked in" is written against no programme.
- **Any $500.** Four surfaces claim it in four wordings with no voucher, code or expiry anywhere in the system. The `INCENTIVES` array has real numbers with real PGM references. If an offer appears, it is one of those or it is nothing.
- **A wizard.** Three to six fields do not need steps. `TradeValuatorModal` is the one place where a wizard genuinely earns its place, and it stays where it is.
- **Autofocus on the first input.** On mobile that raises the keyboard immediately and pushes the photograph and price out of view, which destroys the entire premise. Radix's default of focusing the panel is correct here. Desktop matches, for consistency.
- **A review score, a star row, a testimonial.** Nothing in the repo sources a single review.
- **A contact-preference selector** (call / text / email), as `TradeOfferPopup.tsx:197-262` asks. Consent covers call and text together; the answer changes nothing about what happens next.
- **Save and Compare inside the dialog.** They are card actions. Inside the panel they are a second exit competing with the one thing we want.
- **A dark variant.** `.dark` exists in `styles.css:249` but nothing on this site toggles it.
- **A new z tier.** One tier, portal order, per `Dialog.tsx:16-18`.
- **A hours table or embedded map.** One address line, on `test_drive` only, where a physical appointment makes it load-bearing.

---

## 9. THE ONE RISK

**The rail is a second visual centre, and on mobile it is paid for out of the form's height.**

At 375 x 812 with the keyboard open, the panel has roughly 380px of usable height. The vehicle band costs about 90 of it, which is 24% of what remains, spent re-showing a photograph and a price the visitor just tapped past on the card. If that band is the reason a thumb has to scroll to reach the consent checkbox and the submit button, the design has traded conversion for atmosphere, and the client's "plain popups" complaint will have been answered by making the form measurably worse. That is a worse outcome than the plain white box, because the plain white box at least converts.

There is a second edge on the same risk: the rail assumes a good photograph and a written `sellerNotes`. Two of the six records have no `msrp`, and any real feed will carry units with neither notes nor a decent image. The rail degrades to a grey 4:3 rectangle and a price, which is a large empty column, and empty space in the loudest position reads as broken.

Mitigation, concrete and testable, in build order:

1. Mobile band ceiling: **96px including its border**. Enforce it, measure it, do not eyeball it.
2. On `availability` at 375 x 812 with a keyboard open, `DialogBody` must not scroll at all. Three controls plus consent plus the footer must fit under the band. If it scrolls, the band drops the photograph and becomes a 64px identity strip on mobile only.
3. `sellerNotes` absent → the notes block and its label are omitted and the rail foot rises via `mt-auto`. No placeholder, no "no notes available".
4. `imageNameFromSrc` returns `undefined` → fall back to the raw `<img src={vehicle.image}>` exactly as `VehicleCard.tsx:105-113` already does, and if there is no usable image at all, the rail drops the photograph and leads with the identity block. It must still look deliberate with only a name, a price and four spec rows.

---

## REQUIRED CODE CHANGES OUTSIDE THE DIALOG

1. `src\components\ledger\Dialog.tsx` — add `size="lead"` → `max-w-[44rem]`; close button `h-9 w-9` → `h-11 w-11`, `IconClose h-4 w-4` → `h-5 w-5` (defect 5); explicit `duration-160` on the overlay.
2. `src\components\ledger\Field.tsx` — error container (defect 6); label `text-ink-3` → `text-ink-2` (defect 4).
3. `src\lib\leads.ts` — `QuickLeadInput` gains `preferredDate?: string; preferredTime?: string;` passed through as `preferred_date` / `preferred_time`. The columns already exist on `LeadInquiry` (`supabase.ts:35-36`); `submitQuickLead` is currently the only surface that cannot reach them, which is exactly why `test_drive` has no date field today.
4. `src\components\lead\VehicleLeadDialog.tsx` — remove the duplicated `callInstead` sentence at L161-164; import `leadStorageConfigured` for the unconfigured branch; import `smsLink` and `activeIncentives`.
5. `src\components\lead\ModelEnquiryDialog.tsx` — same shell, rail sourced from `LINEUP[].image` (`model-*` keys, 640x480, on `bg-surface` since they are cutouts), spec table and notes omitted, price omitted. Its lone-title header (defect 11) disappears because the rail gives the panel its second column.