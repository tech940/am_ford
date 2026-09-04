# AM FORD LEAD DIALOG — COMMITTED BUILD SPEC

**Decision: build the two-column vehicle document (Concept 1's rail) as the desktop spine, docked to the bottom edge on mobile (Concept 2's shell), with a pre-filled message as field one (Concept 2's angle) and a one-tap choice group where the intent needs a second fact (Concept 3's `ChoiceGroup`).** Two of three judges shipped Concept 1; every deduction they scored against it — the 90px mobile tax, the empty required textarea on `enquiry`, the date picker — is removed by the three grafts. This is one design, not a menu.

---

## 1. THE THESIS

**The dialog is a one-page document about one vehicle, and the message to the dealership is already written on it.**

---

## 2. FULL ANATOMY

### 2.0 System changes that must land first

**`src/components/ledger/Dialog.tsx`**

1. Size union becomes `size?: "form" | "wide" | "lead"`. `lead` emits, on the same node (a resize across 640px must never remount the form and discard typed values):

```
// mobile: docked to the bottom edge
"inset-x-0 bottom-0 left-auto top-auto w-full max-w-none translate-x-0 translate-y-0",
"max-h-[88dvh] border-x-0 border-b-0",
"data-[state=open]:slide-in-from-bottom data-[state=open]:duration-240",
"data-[state=closed]:slide-out-to-bottom data-[state=closed]:duration-180",
// >=640: the Ledger centred panel, two columns
"sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[calc(100vw-2rem)] sm:max-w-[44rem]",
"sm:max-h-[92dvh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:border-x sm:border-b",
"sm:grid sm:grid-cols-[17.5rem_minmax(0,1fr)] sm:grid-rows-[auto_minmax(0,1fr)]",
"sm:data-[state=open]:slide-in-from-bottom-2 sm:data-[state=open]:duration-200",
"sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:duration-150",
```

The base `flex max-h-[92dvh] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2` currently sits unconditionally on the node (`Dialog.tsx:47`); move the centring half into the `size !== "lead"` branch so `lead` is not fighting it.

2. Close button: `h-9 w-9` → `h-11 w-11`, `IconClose h-4 w-4` → `h-5 w-5`, keep `right-3 top-3`. This is verbatim `Sheet.tsx:59-68`; the modal was the one that got the 36px target while `Button.tsx:43` calls 44px "the comfortable touch target". Closes defect 5.

3. `DialogHeader`: `pr-14` → `pr-16`, matching `SheetHeader` (`Sheet.tsx:77`), to clear the wider button.

4. Overlay gets explicit durations: `data-[state=open]:duration-160 data-[state=closed]:duration-130`.

**`src/components/ledger/Field.tsx`**

5. `Field.tsx:60` label colour `text-ink-3` → `text-ink-2`. Today the label, the hint (`:67`) and the placeholder (`:88`) are one token, which is the grey mush of defect 4. Label wins; hint and placeholder stay `ink-3`.

6. `Field.tsx:74-78` and `Field.tsx:193-197` error becomes a marked block. Same `role="alert"`, same `aria-describedby` wiring, new surface:

```
"border-l-2 border-attention bg-attention/[0.06] px-2.5 py-1.5 text-meta font-medium text-attention"
```

No glyph: there is no alert icon in `icons.tsx`, and drawing an exclamation into a system whose copy rule bans exclamation marks is the wrong answer. A 2px rule in `--attention` is the marker, consistent with a system that builds structure from rules.

7. **New primitive `ChoiceGroup`** in `Field.tsx`, exported from `index.ts`. `fieldset` + `legend` styled exactly like the `Field` label (`text-micro font-bold uppercase tracking-[0.09em] text-ink-2`), containing real `sr-only` radios with `peer-checked:` labels — arrow-key navigation and grouping for free, no JS:

```
wrapper   "flex flex-col gap-1.5"
options   "grid grid-cols-2 gap-2 sm:grid-cols-4"
label     "flex h-11 cursor-pointer items-center justify-center rounded-sm border
           border-rule bg-white px-2 text-center font-sans text-ui font-semibold text-ink-2
           transition-colors hover:border-ink/25
           peer-checked:border-brand peer-checked:bg-brand/[0.06] peer-checked:text-brand
           peer-focus-visible:outline peer-focus-visible:outline-2
           peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand"
```

**`src/lib/leads.ts`**

8. `QuickLeadInput` gains `meta?: string` and `preferredTime?: string`. Message assembly changes from `` `${input.message.trim()} ${consentStamp()}` `` to:

```ts
message: [input.message.trim(), input.meta, consentStamp()].filter(Boolean).join("\n"),
preferred_time: input.preferredTime,
```

`preferred_time` already exists on `LeadInquiry` (`supabase.ts:36`) and `submitQuickLead` is the only surface that cannot reach it. `preferred_date` stays unreachable, deliberately (§5).

9. `smsLink` (`leads.ts:83-84`) contains two em dashes in the one string that lands in the customer's own SMS app. Rewrite both bodies:
   `Hi AM Ford, I am interested in the 2025 Ford F-150 Platinum listed at $64,995. Is it still available?`
   `Hi AM Ford, I have a question about your inventory.`

**`src/routes/__root.tsx:137`** — viewport meta becomes `width=device-width, initial-scale=1, interactive-widget=resizes-content`. Without it Chrome Android leaves the layout viewport at full height when the keyboard opens and the docked footer sits underneath it. This is the single line that makes the pinned CTA real.

**`src/styles.css`** — one keyframe, and one comment correction at `:43-50` (Archivo Expanded gains a second sanctioned figure site: the dialog price):

```css
@keyframes leadprogress {
  from { transform: translateX(-100%); }
  to   { transform: translateX(300%); }
}
```

**New file `src/components/lead/dealerClock.ts`** — pure, no JSX. `dealerStatus(now: Date)` parses `dealerInfo.hours` and returns `{ open: boolean; closesAt?: string; opensDay?: string; opensAt?: string } | null`. Returns `null` if the strings do not parse, and every consumer renders nothing in that case. Never hardcode a time anywhere in the dialog.

---

### 2.1 At 1200px — panel 704 × ~570, centred

DOM order is one order for both breakpoints; grid places it on desktop.

```
DialogContent size="lead"                       (no aria-describedby override; a real description exists now)
├ DialogHeader   sm:col-start-2 sm:row-start-1
├ <section>      sm:col-start-1 sm:row-start-1 sm:row-span-2     ← the rail
└ <form noValidate>  sm:col-start-2 sm:row-start-2  "flex min-h-0 flex-col"
   ├ DialogBody
   └ DialogFooter
└ (Radix Close, absolutely positioned, rendered last by DialogContent)
```

The `<form>` wraps only body and footer, so grid placement needs no `display:contents`. `min-h-0` on the form is what keeps `DialogBody` the scrolling element rather than the panel.

**Column 1 — the rail.** `<section aria-label="Vehicle you are asking about">`, classes `flex flex-row items-center gap-3 border-b border-rule bg-surface px-4 py-3 sm:flex-col sm:items-stretch sm:gap-0 sm:border-b-0 sm:border-r sm:px-0 sm:py-0`.

| # | Element | Exact treatment |
|---|---|---|
| 1 | Photo frame | `div.relative.aspect-[4/3].overflow-hidden.bg-ink` (**always ink**, never `bg-surface`; `VehicleCard.tsx:35-36` — "a grey box on warm paper reads as a missing image; on ink it reads as a stage"). `w-[5.5rem] shrink-0 sm:w-full` |
| 2 | Image | `ResponsiveImage name={imageNameFromSrc(vehicle.image)} alt="" sizes="(min-width:640px) 280px, 88px" aspect={{width:4,height:3}} className="h-full w-full object-cover"`. `alt=""` — the title names the vehicle. No hover, no scale, not a link |
| 3 | Condition chip | `Chip tone="onDark" size="sm"` at `absolute left-3 top-3`, `hidden sm:inline-flex`. Same placement as `VehicleCard.tsx:116-120`, so the dialog is visibly the card's continuation. The only chip anywhere in the dialog |
| 4 | Identity block | `min-w-0 sm:px-5 sm:pt-4 sm:pb-3` |
| 5 | Eyebrow | `text-micro font-bold uppercase tracking-[0.09em] text-ink-3` → `2025 Ford` |
| 6 | Name | `text-ui font-bold text-ink sm:text-h3` → `F-150` + `<span className="font-normal text-ink-3">Platinum</span>` |
| 7 | Price | `font-display text-h3 font-bold tabular-nums text-brand sm:text-h2` → `$64,995`. Archivo Expanded, figures only. **The single largest saturated thing in the panel** |
| 8 | Struck MSRP | only when `showSaving && msrp > price`: `text-meta tabular-nums text-ink-3 line-through`, baseline-aligned beside 7 |
| 9 | Saving | only when the same gate and derived `> 0`: `IconSavings h-3.5 w-3.5` + `text-meta font-semibold text-available` → `$3,425 below MSRP`. Derived, never authored |
| 10 | `SpecTable` | `columns={1}`, `className="mx-5 hidden sm:grid"`, four rows per §3. **Every row is drawn from a non-optional `Vehicle` field** |
| 10m | Mobile spec line | `sm:hidden text-meta text-ink-2` → `Delivery miles · 4WD · 400 hp`, one line |
| 11 | Notes label | `mt-4 px-5 text-micro font-bold uppercase tracking-[0.09em] text-ink-3 hidden sm:block` → `Notes on this vehicle` |
| 12 | Notes excerpt | `mt-1.5 px-5 text-meta leading-relaxed text-ink-2 hidden sm:block`. **First two sentences** of `sellerNotes`, split on `/(?<=\.)\s+/`, not `line-clamp` — clamping cuts hand-written prose mid-word and the ellipsis reads as broken data. This is the only content in the dataset a form generator could not have produced |
| 13 | Rail foot | `mt-auto border-t border-rule px-5 py-3.5 hidden sm:block` |
| 14 | Delivery | `IconPin h-3.5 w-3.5 text-ink-3` + `DELIVERY_SHORT` **verbatim**, `text-meta text-ink-2` |
| 15 | Phone | `IconPhone h-3.5 w-3.5` + `<a href={dealerInfo.phoneHref}>` `text-meta font-semibold text-ink-2 underline underline-offset-[3px] hover:text-ink`. **Not `text-brand`** — accent budget, §2.3 |

Rail height at the F-150: 210 photo + ~104 identity + ~130 spec + ~76 notes + 52 foot ≈ 572px. **The rail sets the panel height, and it is the same DOM node through idle, sending, success and failure.** That is why the success state cannot shrink the panel on desktop — structurally, not by a measured `minHeight`.

**Column 2 — the exchange.**

| # | Element | Exact treatment |
|---|---|---|
| 16 | `DialogHeader` | `border-b border-rule px-6 py-5 pr-16` |
| 17 | `DialogTitle` | `cfg.title(vehicle)`, `text-h3 font-bold text-ink`. The accessible name |
| 18 | `DialogDescription` | `cfg.lead` — the intent's promise. **The vehicle string is gone from here**; that is the rail's job now, and its removal is what takes the header from repetition to a single supporting sentence |
| 19 | `DialogBody` | `flex-1 overflow-y-auto px-5 py-5 sm:px-6` |
| 20 | Supporting block | 0 or 1 per intent, §3. `mb-5` |
| 21 | Field stack | `grid gap-5`, §4 |
| 22 | `ConsentCheckbox` | unchanged wiring, `id={`lead-consent-${vehicle.id}`}`, 24px control, `CONSENT_TEXT` **verbatim** |
| 23 | Failure banner | last child of the stack, §6 |
| 24 | `DialogFooter` | `relative border-t border-rule px-5 py-4 sm:px-6` — `relative` so the progress rule pins to its top edge |
| 25 | Promise line | `mb-3 text-meta text-ink-3` → `RESPONSE_PROMISE` verbatim, directly above the commit, not three lines into a success screen the visitor has not reached |
| 26 | Submit | `Button type="submit" block`, label `cfg.cta`, `h-11` |
| 27 | Live region | `p.sr-only role="status" aria-live="polite"` → `Sending your message` while in flight |

The old `cfg.lead` paragraph at `VehicleLeadDialog.tsx:219` is deleted from the body. Four same-weight grey blocks (description, lead, phone hint, consent) become two.

Focus order note: the rail's phone link is the only focusable node in column 1, and it sits at the rail foot, so a keyboard user's first Tab lands on `Call (440) 998-2151` before the message field. That is accepted: it is one stop and it is a real alternative action. It does not exist on mobile.

### 2.2 At 375 × 812 — the primary case

Same DOM, same tree, `size="lead"`. Deltas only:

- Panel docks to the bottom edge, full width, `max-h-[88dvh]` (714px), square, no side gutters, `border-x-0 border-b-0`.
- Order on screen: header → **vehicle band** → form. The band sits *below* the header so it never collides with the 44px close button.
- Band: 88 × 66 photo, identity (eyebrow / name / price / one spec line). Rows 10, 11, 12, 13, 14, 15 are `hidden sm:block`. **Height ceiling: 96px including its border. Enforce it, measure it, do not eyeball it.**
- `DialogFooter`: `flex-col-reverse gap-2 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]`. Both buttons `block` where there are two. Submit is the bottom-most element, in the thumb rest, and it never scrolls away because `DialogBody` is the only scrolling element.
- **No autofocus, at any breakpoint.** Radix's default of focusing the panel is correct: autofocusing the message on mobile raises the keyboard immediately and pushes the photograph and the price out of view, which destroys the premise. Desktop matches for consistency.

**Vertical budget, `test_drive`, keyboard open (~370px visible):** header 84 + band 90 + footer 116 pinned; message, choice group, name, phone and consent scroll inside `DialogBody`. The CTA and the promise line above it are always visible.

### 2.3 Accent budget — binding

Navy (`--brand` #002C5F) appears on exactly these, and nothing else: **the price figure**, **the submit fill**, **the 2px left rule on the supporting block when one renders**, and **focus rings**. The rail phone link is `text-ink-2`. There is no `bg-brand-tint` wash anywhere. In the default case (no supporting block) the panel has two navy objects, which is what "one accent" means.

---

## 3. THE INTENT MATRIX

`INTENT` keeps its shape and gains four keys: `draft`, `hint`, `choice`, `support`.

| | title | lead sentence (`DialogDescription`) | pre-filled draft | supporting block | choice group | CTA | leadType | rail spec rows |
|---|---|---|---|---|---|---|---|---|
| **enquiry** | Ask about the {model} | Tell us what you need to know and we will come back with a straight answer. | `I have a question about the {y} {model} {trim}.` | none | none | Send enquiry | `general_contact` | Odometer, Drivetrain, Economy/Range, Output |
| **price** | Best price on the {model} | The listed price is beside this. What a trade, a finance package or a current Ford programme does to it is the part we work out with you. | `What is the best you can do on the {y} {model} {trim}?` | **Programmes**, else **Floor** | none | Ask for the best price | `quote_request` | Odometer, Drivetrain, Economy/Range, Output |
| **availability** | Is the {model} still available? | We will confirm it is still on the lot and hold it while you decide whether to come in. | `Is the {y} {model} {trim} still on the lot?` | none | none | Check availability | `general_contact` | Odometer, Exterior, Interior, Drivetrain |
| **test_drive** | Drive the {model} | Tell us roughly when suits and we will have it ready and warmed up. | `I would like to drive the {y} {model} {trim}. When can I come in?` | **Where** | **When suits?** | Book a test drive | `test_drive` | Odometer, Drivetrain, Economy/Range, Output |
| **trade** | Trade against the {model} | Our used vehicle manager sets the number, not a web page. | `I want to trade against the {y} {model} {trim}.` | **Their line** | **Trade or sell?** | Send trade details | `quote_request` | Odometer, Drivetrain, Economy/Range, Output |
| **finance** | Finance the {model} | We take one application to Ohio credit unions and national lenders, then bring you the terms they come back with. | `I would like to know what I can be approved for on the {y} {model} {trim}.` | **Programmes + what we do not ask**, else **Floor** | none | Start an application | `financing_preapproval` | Listed price, Odometer, Drivetrain, Output |

`enquiry` and `availability` move to `general_contact`, already in the union at `supabase.ts:25-30` and currently unused. Filing them as `quote_request` makes the CRM's own type column lie.

**Identical in all six:** panel geometry, rail structure, photograph, price treatment, field set and field order, consent, footer, promise line, success state, every error path, all motion, `submitQuickLead` as the only path, `vehicle` required.

**Supporting blocks, in full:**

**Programmes** (`price`, `finance`). `mb-5 border-l-2 border-brand pl-4 py-1`:
```
Live Ford programmes                        text-micro font-bold uppercase tracking-[0.09em] text-ink-3
{label}  {programme}. Ends 8/31/26.         text-meta text-ink / span text-ink-3, max 2 items
<details><summary>Programme terms</summary> each disclaimer VERBATIM, text-meta text-ink-3
```
Source: `activeIncentives(new Date())`. `finance` filters to `apr-0-36` and `defer-90`; `price` takes the first two active. **Gated on `vehicle.condition === "New"`** — Ford new-vehicle programmes do not apply to used stock, and printing one under a used truck is the same class of defect as the fabricated VIN at `inventory.tsx:2059`. Renders nothing when the list is empty. In `import.meta.env.DEV`, `console.warn` when `activeIncentives(new Date()).length === 0`, so the next developer finds out before the customer does. All four incentives currently end `2026-08-31`, seventeen days out.

**Floor** (`price`, `finance`, when Programmes renders nothing). One line, `mb-5 text-meta leading-relaxed text-ink-2`:
> Free home delivery within 300 miles. AM Ford publishes one pricing stance: "We will beat any deal".

`DELIVERY_SHORT` verbatim and `PRICING_STANCE` quoted, not restated stronger. Both dateless, both dealership-owned, both true next September. The position is never a hole.

**Where** (`test_drive`). `mb-5 flex gap-2 text-meta text-ink-2` → `IconPin` + `dealerInfo.address`, and if `dealerStatus()` parses, a second line: `Open until 8:00 PM today.` / `Closed today. We open at 9:00 AM Monday.`

**Their line** (`trade`). `mb-5 bg-surface px-4 py-3 text-body text-ink`, one sentence, the dealership's own published copy: *"Sell us your car, even if you don't buy from us."* No dollar figure appears anywhere near it.

**What we do not ask** (`finance`, under Programmes or Floor). `mt-3 text-meta leading-relaxed text-ink-2`:
> We do not ask for a social security number or a date of birth on this form. The credit application happens with a person.

True of this form, and it removes the largest hesitation on a finance CTA.

---

## 4. FIELD LIST

Order on every intent: **message, choice (when present), name, phone, consent.**

| Order | Field | Control | Required | Why it earns its place |
|---|---|---|---|---|
| 1 | **Your message** | `Textarea rows={3} className="min-h-[5.5rem]"`, **`value={draft}`, not `placeholder`** | Effectively yes; validated non-empty | This is the angle. It goes first because in a conversation you say the thing before you say who you are, and it is pre-filled because a sentence to approve costs a glance where a blank box costs a paragraph. Placeholders are examples (`Field.tsx:17`) and would not be sent |
| 2 | **Choice** | `ChoiceGroup` | No | `test_drive`: *When suits?* → This week / Next week / Weekend / Evening, passed as `preferredTime`. `trade`: *Trade or sell?* → Trade against this vehicle / Sell it outright. One tap, one row, no keyboard, and it is the fact the desk needs before it calls. Not on `price` or `finance` — a monthly-budget bracket is a qualifying question dressed as a convenience |
| 3 | **Your name** | `Input autoComplete="name"` | **Yes** | Someone dials this number within fifteen minutes. `submitQuickLead` writes `"Not provided"` (`leads.ts:56`), which is a salesperson opening blind on a $64,995 call. It is one autofilled tap, it sits *after* the message so it is asked of someone who has already committed a sentence, and it is the one decision here with an explicit kill criterion: if abandonment measurably concentrates on this field, make it `required={false}` — nothing downstream breaks |
| 4 | **Phone number** | `Input type="tel" inputMode="tel" autoComplete="tel"` | **Yes** | It is the entire product. `RESPONSE_PROMISE` commits to a call or a text and nothing else. Hint: `Where we call or text you back.` Formatted to `(440) 555-0199` **on blur only**, never during typing — caret restoration on backspace is where those break |
| 5 | **Consent** | `ConsentCheckbox` + `CONSENT_TEXT` | **Yes** | TCPA. Verbatim, never paraphrased, never reduced to a passive paragraph the way `OfferPopup.tsx:352-359` does |

**Dropped: email, on all six intents.** `submitQuickLead` accepts `""` (`leads.ts:57`), every promise the dialog makes is a call or a text, and nothing in the system sends email. On a 375px screen it is ~88px of panel height buying a channel the dealership does not use. If email is ever needed for nurture, it belongs on the success screen as a separate ask after the lead is banked.

**Dropped: preferred date.** There is no calendar in this system and no clock icon in `icons.tsx`. A picker implies live availability the desk never agreed to; four rough windows is an honest amount of precision. `preferred_date` stays unreachable by design.

**Dropped:** preferred-contact selector (consent covers call and text together, and the answer changes nothing), first/last name split, ZIP, the separate trade year/make/model/mileage inputs (the draft plus the hint gets them in one field), Save and Compare (card actions, and inside the panel they are a second exit).

**Never asked, ever:** SSN, date of birth, income, address, licence number, card details, password.

**Validation** — replaces `VehicleLeadDialog.tsx:137-143`:
- **`<form noValidate>`.** `Field` sets `required` on every control it wraps (`Field.tsx:103`), so today an unstyled native browser bubble fires before our validator runs. Two validation systems, one of them unlocalised. Ours is the only one.
- `message.trim()` empty → `Write a line about what you need and we will answer it.`
- `name.trim()` empty → `We need a name to ask for when we call.`
- `phone` digits `< 10` → `That looks short. Include the area code, 10 digits.`
- consent unticked → `Please tick the box so we are allowed to contact you.`
- On failure, **move focus to the first invalid control.** Today nothing moves and on a scrolled mobile body the error can be off screen.
- Validate on submit only; re-validate a field on change once it has errored. Never on first blur.

**Payload.** `VehicleLeadDialog.tsx:153-154` currently prefixes the message with `` `${cfg.cta} — ${title} ($${price}). ` ``, so the sales desk reads a robot before it reads a human — and it contains an em dash. Inverted:

```ts
await submitQuickLead({
  vehicle, leadType: cfg.leadType, name, phone,
  message,                                   // the human sentence, first, alone
  meta: [cfg.metaLabel, title, `$${vehicle.price.toLocaleString("en-US")}`,
         choice, message === draft ? "draft not edited" : null]
        .filter(Boolean).join(" · "),
  preferredTime: intent === "test_drive" ? choice : undefined,
});
```

The `draft not edited` marker is the mitigation for the one risk this angle carries: if most visitors send the draft untouched, the desk must be able to tell a typed message from a tapped one. It also makes the risk measurable from the CRM, and if the edit rate sits below roughly 20% after a few hundred leads, collapse the field to a single-line `Input` with the same draft. Nothing else in the design depends on it being large.

**If `hasSubmittedLead()` is true when the dialog opens**, render one quiet line above the message field, `text-meta text-ink-3`: `You already sent us a message. Another is fine, we will see both.` True, no guilt, no block.

---

## 5. SUCCESS AND FAILURE STATES

### 5.1 Success

**The rail does not move, does not fade, does not re-render.** Same node, same photograph, same price. Only column 2 swaps. The panel keeps its height on desktop because the rail was always the taller column; on mobile the footer is pinned and the delta is one short block.

| # | Element | Copy / treatment |
|---|---|---|
| 1 | `DialogTitle` | **Sent to the sales desk** |
| 2 | `DialogDescription` | `{cfg.metaLabel} for the 2025 F-150 Platinum` |
| 3 | Marker | `grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-available/10 text-available` + `IconCheck h-4 w-4`. **2px square, not `rounded-full`** — the pill radius belongs to `Chip` alone (`index.ts:10`) |
| 4 | Confirmation | `text-body text-ink` → **We will reach you on (440) 555-0199.** The number they typed, formatted back. This is the receipt: it is the only ten seconds in which a mistyped digit is still fixable, and a mistyped digit is a lead that reports as converted and never converts. No `SpecTable` is needed beside it — the vehicle is in the rail and the intent is in the description |
| 5 | Timing | `mt-2 text-meta leading-relaxed text-ink-2`. Open now → `RESPONSE_PROMISE` **verbatim**. Closed → **We are closed now. The desk opens at 9:00 AM Monday and yours is first in.** (day and time from `dealerStatus`, never hardcoded). Unparseable → `RESPONSE_PROMISE` verbatim, no clock claim |
| 6 | Their words | `mt-4 border-l-2 border-brand bg-surface px-4 py-3 text-meta leading-relaxed text-ink-2 line-clamp-6` → the message they sent, quoted back. Free, theirs, and it proves the panel is not a black hole |
| 7 | `DialogFooter` | **Now exists**, which is defect 1. `flex-col-reverse gap-2 sm:flex-row sm:justify-end` |
| 8 | Secondary | `Button variant="secondary" asChild` → `<a href={dealerInfo.phoneHref}>` + `IconPhone` → **Call (440) 998-2151** |
| 9 | Primary | `DialogClose asChild` → `Button` → **Done**, `autoFocus` |

Focus lands on Done. One filled button. Escape and the close button still work; they are no longer the only exits.

**Deliberately absent:** any onward link. No "see similar vehicles", no "browse inventory", no "book a test drive too". The visitor converted; sending them back into the funnel from a success panel is how a dealership site turns a lead into a bounce.

### 5.2 Submit failure

Last child of the field stack, `role="alert"`, `tabIndex={-1}`, focused on failure:
```
border-l-2 border-attention bg-attention/[0.06] px-3.5 py-3 text-meta leading-relaxed text-ink
```
Content is **`res.message` alone**, with the phone number rendered as a real `<a href={dealerInfo.phoneHref}>`.

> **Bug fixed here.** `VehicleLeadDialog.tsx:161-164` and `ModelEnquiryDialog.tsx:79-82` append `You can also call us on {phone}...` to `res.message`, but all three failure paths in `submitLeadInquiry` already end with `callInstead` (`supabase.ts:44`). The customer is currently told to call, twice, in one sentence. Drop the appended clause.

Message, choice, name, phone and consent are all preserved. Status returns to `idle`; the button returns to normal. Retrying is one tap.

### 5.3 Lead storage unconfigured — checked at render, not at submit

`leadStorageConfigured` (`supabase.ts:21`) is a build-time constant. **When it is false the dialog never renders a form.** Today a visitor writes a message, types a number and ticks consent before being told it failed.

- Rail: unchanged, full, exactly as always. The vehicle attribution survives a broken backend, which is the whole point.
- Title: **Call us about the {model}**
- Description: **Our message form is offline right now.**
- Body: today's hours from `dealerStatus` (`text-meta text-ink-2`), nothing else.
- Footer, two real actions:
  - Primary `Button asChild` → `<a href={dealerInfo.phoneHref}>` + `IconPhone` → **Call (440) 998-2151**
  - Secondary `Button variant="secondary" asChild` → `<a href={smsLink(vehicle)}>` → **Text us about this vehicle**. `smsLink` (`leads.ts:81`) already pre-fills year, make, model, trim and price for this exact vehicle. It exists and nothing calls it.
- In `import.meta.env.DEV` only, a `border-l-2 border-attention bg-attention/[0.06]` strip naming `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, so the deploy defect is caught in build QA rather than in production. `console.error` at `supabase.ts:52-54` still fires.

The same branch handles `navigator.onLine === false` at submit time, minus the DEV strip.

### 5.4 Guards

- `if (status === "sending") return;` as the first line of `handleSubmit`. A keyboard Enter can fire twice before React re-renders.
- `reset()` on close runs only when status is `idle` or `done`, never mid-send.

---

## 6. FALLBACK RULES

| Case | What renders |
|---|---|
| **No `msrp`** (3 of the 6 records: only `vehicles.ts:60, 90, 207` carry one) | Rows 8 and 9 are simply absent. The rail's `SpecTable` rows are drawn from **non-optional fields only**, so the table is always four rows. `VehicleLeadDialog` takes a `showSaving?: boolean` prop defaulting `true`, and `VehicleCard` forwards its own (`VehicleCard.tsx:48`) into the dialog — the homepage's existing distrust of the placeholder msrp values propagates instead of being re-litigated |
| **`imageNameFromSrc` returns `undefined`** (every remote feed URL will, since it matches against bundled `IMAGE_KEYS`) | Raw `<img src={vehicle.image} alt="" width={1280} height={960} loading="lazy" decoding="async" className="h-full w-full object-cover">`, exactly as `VehicleCard.tsx:105-113` already does |
| **That `<img>` errors** | `onError` sets a flag; the photo frame unmounts entirely and the rail leads with the identity block, `sm:pt-5`. On mobile the band drops to a 64px identity strip. Never a grey rectangle, never a broken image icon |
| **No `sellerNotes`** | Rows 11 and 12 are omitted and the rail foot rises via `mt-auto`. No placeholder, no "no notes available" |
| **`badges[]`** | **Never rendered, in any state.** The only chip in the dialog is `condition`. Badge clusters are what made the old cards double-badge |
| **`activeIncentives()` empty, or `condition !== "New"`** | Programmes renders nothing; the **Floor** line takes its place on `price` and `finance`; other intents show nothing. DEV `console.warn` on the empty case |
| **`dealerStatus()` unparseable** | No clock line renders anywhere — not in **Where**, not on success, not in the offline branch. `RESPONSE_PROMISE` verbatim carries success on its own |
| **No vehicle: `ModelEnquiryDialog`** | Same shell, same rail, same everything. Rail photo comes from the `LINEUP` entry for that model (`dealerContent.ts:40-42`, keys `model-f-150`, `model-bronco`, 17 of them, 640×480, resolved through `IMAGES` exactly like a photograph). **On `bg-ink`, not `bg-surface`** — they are cutouts, and 280px of warm grey behind a cutout is the failure `VehicleCard.tsx:35-36` documents. Omitted from the rail: price (row 7), MSRP pair (8, 9), `SpecTable` (10), notes (11, 12), condition chip (3). Kept: photo, eyebrow (`Ford`), name (the model), rail foot with delivery and phone. This gives the panel its second column and defect 11 — the lone-title header over an empty rule — disappears. Only `enquiry` exists here; `leadType` is `general_contact`; the draft is `I have a question about the Bronco Sport.` |
| **Model has no `LINEUP` entry** | The rail drops the photograph and leads with the identity block: model name, delivery line, phone. It must still look deliberate with only a name and two facts |

---

## 7. MOTION SPEC

| What | Duration | Curve | Notes |
|---|---|---|---|
| Overlay fade in | 160ms | ease-out | explicit; `Dialog.tsx:37` currently inherits an unstated default |
| Overlay fade out | 130ms | ease-out | |
| Panel enter, ≥640px | 200ms | `cubic-bezier(0.16,1,0.3,1)` | fade + `translateY(8px → 0)` |
| Panel exit, ≥640px | 150ms | ease-out | **fade only, no movement** — `Dialog.tsx:50-51`. Dismissal must never feel like it is fighting the pointer |
| Panel enter, <640px | 240ms | `cubic-bezier(0.16,1,0.3,1)` | `translateY(100% → 0)`. The compose gesture, not the marketing-interrupt gesture |
| Panel exit, <640px | 180ms | ease-out | `translateY(0 → 100%)` |
| Photograph | 0 | — | no scale, no hover, no ken-burns. `VehicleCard.tsx:102` scales because it is a link; this is not |
| Rail, on submit | 0 | — | the rail is the anchor. If it moves the idea collapses |
| Form → success | 160ms, 60ms delay | ease-out | success block only: `animate-in fade-in-0 slide-in-from-bottom-1`. The form unmounts, so no exit animation and **no `AnimatePresence`** — `mode="wait"` freezes carousels and wizards under React 19, there are zero live uses left in this repo, and reintroducing one here is a defect |
| Field error appearing | 0 | — | it is `role="alert"`. Moving text while a screen reader announces it is hostile |
| Submit progress rule | 1.1s loop | linear | `absolute inset-x-0 top-0 h-0.5 overflow-hidden` on `DialogFooter`, containing `span.block.h-full.w-1/3.bg-brand` running `leadprogress` |
| Consent checkbox | 0 | — | native control, OS behaviour |

**Busy state.** `disabled:opacity-45` (`Button.tsx:22`) makes the CTA look broken rather than busy (defect 7), and a real `disabled` attribute drops the element from the tab order so focus falls to the body mid-submit. Instead: `aria-busy`, `aria-disabled`, `pointer-events-none`, keep the brand fill, label reads **Sending** (not "Sending..."), and the progress rule appears. No spinner: none exists in `icons.tsx` and a rule is more Ledger than a wheel.

**Reduced motion.** `styles.css:415-424` already forces `animation-duration` and `transition-duration` to `0.001ms !important` globally, so every row above is neutralised without extra work. Two consequences built for deliberately:

1. **No state may be carried by motion alone.** The progress rule carries `motion-reduce:animate-none motion-reduce:w-full motion-reduce:bg-brand/30` — a frozen third-width bar is indistinguishable from a rendering bug.
2. Hover colour changes become instant. Already true site-wide, acceptable.

Nothing loops, pulses or breathes after settling. The only recurring animation in the system is the progress rule, and only while a request is in flight.

---

## 8. MIGRATION

**Delete now, no new capability needed (~1,400 lines):**

| File | Call sites | Becomes |
|---|---|---|
| `popups/TradeOfferPopup.tsx` (306) | only `site/Home.tsx:766`, and `Home()` is unmounted — `routes/index.tsx:2,37` renders `HomePage` | Delete, plus the dead 5-second timer at `Home.tsx:745-750` |
| `popups/OTPPopup.tsx` (~700) | `routes/vehicle.$id.tsx:608`, `routes/inventory.tsx:2050` | `<VehicleLeadDialog vehicle={v} intent="price">`. Deleting it removes the fabricated VIN at `inventory.tsx:2059` (`` `1FT${id.toUpperCase()}2025` ``), which contradicts `vehicles.ts:28-32`, and removes the "unlock your instant price" premise that printed the price it claimed to withhold |
| `popups/OfferPopup.tsx` (431) | `routes/inventory.tsx:1272`, `site/Home.tsx:765` | `intent="price"`. The unevidenced $500 goes with it; `sse-down-payment` ($1,000, PGM #14196) is the real programme |
| `convert/QuickEnquiryModal.tsx` (317) | `routes/vehicle.$id.tsx:602, 647, 653`, rendered `:1017` | `availability` → `intent="availability"`. `video_tour` and `price_watch` are **cut**, not ported: neither is a lead intent, and `price_watch`'s only unique behaviour is `watchVehicle(vehicle.id)`, which belongs on a card affordance, not in a lead dialog |
| `site/LeadCaptureModal.tsx` | `routes/vehicle.$id.tsx:615, 624, 948`, `routes/inventory.tsx:2042` | `test_drive` / `price` / `finance`. **This is the largest TCPA hole left**: no consent checkbox and no consent text anywhere in the file, calling `submitLeadInquiry` directly at `:98`. `special_order` (`inventory.tsx:2045`) maps to `intent="enquiry"` with the draft seeded `I would like to order a {model} to spec.` — no new intent |
| `convert/ExitIntentOffer.tsx` (298) | self-triggering from `site/SiteShell.tsx:22` | The form is redundant; only the interruption is unique. If the trigger is kept, it becomes a `Dialog` driven by `open`/`onOpenChange` wrapping `VehicleLeadDialog`. The "$500 voucher is locked in" copy (`:168, :192`) does not survive either way |

**Keep, but port:** `convert/TradeValuatorModal.tsx` — the six-step wizard and the estimator are genuinely unique and earn their steps; render it inside `Dialog` rather than its hand-rolled focus trap (`:129-166`) and `z-[70]`, and delete the "+$500 AM Ford trade bonus" at `:321`. `convert/ChatWidget.tsx` — a launcher, not a dialog; keep it, but every flow terminates in `VehicleLeadDialog` rather than its own `PhoneCaptureForm`, and the unsourced assertions go: "it's in stock as of today" (`:321`), "We work with 12+ lenders" (`:41`), "Most trades appraise higher than owners expect" (`:46`).

**Result:** all four remaining `submitLeadInquiry` bypasses (`LeadCaptureModal:98`, `OTPPopup:230`, `OfferPopup:182`, `TradeOfferPopup:114`) are gone, which is precisely the defect `VehicleLeadDialog.tsx:30-34` documents as fixed.

**Files changed:** `ledger/Dialog.tsx`, `ledger/Field.tsx`, `ledger/index.ts`, `lib/leads.ts`, `lead/VehicleLeadDialog.tsx`, `lead/ModelEnquiryDialog.tsx`, `site/VehicleCard.tsx` (forward `showSaving`), `routes/__root.tsx`, `styles.css`. **New:** `lead/dealerClock.ts`.

**Build blocker, unrelated to design:** `vehicles.ts:326` states the phone number is not from the brief and needs verification. This design puts it on two buttons, one success line, one failure banner and one SMS deep link in every dialog. Verify before shipping.

---

## 9. SELF-CHECK AGAINST EVERY HARD CONSTRAINT

| Constraint | Status |
|---|---|
| `role=dialog`, `aria-modal`, focus in and returned to trigger, Escape closes, body scroll locks | **Met.** Radix `Dialog.Root`/`Content` unchanged; `aria-modal="true"` retained. Nothing in this spec touches the primitive's behaviour — only surface, and one added `sm:grid` display |
| Every field has a bound label | **Met.** Every control goes through `Field`, which generates the id and hands it down by context. `ChoiceGroup` uses `fieldset` + `legend` with real radios sharing a `name` |
| Errors are `role="alert"` | **Met.** `Field.tsx:75` and `:194` keep `role="alert"` and the `aria-describedby` wiring; only the visual container changes. The submit banner and the sending status region are additions, not replacements |
| Accessibility strictly not weakened | **Met, and improved in five places:** close target 36px → 44px; `aria-disabled` instead of `disabled` so focus is not dropped mid-submit; focus moves to the first invalid control; `aria-live` status on send; a real `DialogDescription` restored (the `aria-describedby={undefined}` override is removed) |
| `vehicle` prop stays REQUIRED | **Met.** Signature unchanged. `ModelEnquiryDialog` remains the separate sibling for the no-vehicle case rather than a loosening |
| Everything submits through `submitQuickLead` | **Met.** One `await submitQuickLead(...)` in each dialog, and §8 deletes all four surviving `submitLeadInquiry` bypasses |
| No fabricated content | **Met.** Every figure is `Vehicle` data or derived from it; every programme is an `INCENTIVES` row with its PGM number, its stated end date and its disclaimer verbatim; every hour is parsed from `dealerInfo.hours`; delivery wording is `DELIVERY_SHORT` verbatim; `PRICING_STANCE` is quoted, not restated. No review scores, no viewer counts, no countdowns, no stock claims, no $500, no APR that is not a programme. `estMonthlyPayment` is not used |
| No em dashes, en dashes or exclamation marks in customer copy | **Met**, and it fixes two live violations: the machine prefix at `VehicleLeadDialog.tsx:154` (deleted by the payload inversion) and both em dashes in `smsLink` (`leads.ts:83-84`), which is the one string that lands in the customer's own SMS app. All new copy in §3, §4 and §5 is checked |
| Motion minimal, respects `prefers-reduced-motion` | **Met.** Nine rows in §7, six of them zero. The global `styles.css:415-424` block neutralises the rest, and the one looping element carries an explicit static reduced-motion appearance so no state is carried by motion alone |
| Mobile 375×812 is the primary case | **Met.** The panel docks to the bottom edge with a pinned footer, the vehicle band is capped at 96px, `interactive-widget=resizes-content` keeps the CTA above the Android keyboard, `env(safe-area-inset-bottom)` on the footer, no autofocus so the keyboard stays down, and the ChoiceGroup replaces a date wheel plus a select with one tap |
| Compose from Ledger, never bypass it | **Met.** `Dialog`, `DialogHeader/Title/Description/Body/Footer`, `Button`, `Field`, `Input`, `Textarea`, `ConsentCheckbox`, `SpecTable`, `Chip`, `IconCheck/Phone/Pin/Savings/Close`. Two additions live *inside* the system: `size="lead"` on `DialogContent`, and `ChoiceGroup` in `Field.tsx`. No new z tier, no new radius, no new colour, no lucide, no hand-rolled overlay |
| Radius: 0 structural, 2px controls, pill for chips only | **Met.** The panel is square; the success marker is `rounded-sm`, not `rounded-full`; the only pill is the condition `Chip` |
| Archivo Expanded is figures only | **Met.** One use per panel: the price. `styles.css:43-50`'s comment is updated to record the second sanctioned site rather than being broken silently |
| One accent, one filled button | **Met.** §2.3 caps navy at the price figure, the submit fill, one 2px rule on the supporting block, and focus rings. Every state — form, sending, success, failure, offline — has exactly one `primary` button |

**Acceptance test, run before merge, not eyeballed:** at 375×812 with the software keyboard open, on all six intents, the promise line and the submit button are visible without scrolling, and the vehicle band measures ≤96px including its border. If the band is what breaks it, the band drops the photograph and becomes a 64px identity strip — the form never gives up height first.