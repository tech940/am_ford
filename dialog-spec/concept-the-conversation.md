# AM Ford Lead Dialog — "The Message"

**Concept:** the panel is a message you are writing to the dealership about one specific vehicle, which is visible in the panel while you write it. Not a form with a car mentioned in grey text.

Three moves carry it:
1. The vehicle is an **object in the panel** (its own photo, its own price figure), not a string.
2. The **message is the first field and it is already written**. The visitor opens the dialog and there is a sentence in their own voice, referencing that exact vehicle, with the caret at the end. They edit it or they send it.
3. **Calling is a peer action, not a footnote**, and the panel says whether anyone is at the desk right now, computed from `dealerInfo.hours`.

Everything else is subtraction.

---

## 1. ANATOMY

### System changes required first (small, and they fix listed defects)

**`src/components/ledger/Dialog.tsx`** — three edits:

```tsx
// 1. New size preset. Mutually exclusive branch, so no twMerge collision at call sites.
size?: "form" | "wide" | "docked";

// inside the cn():
"fixed z-50 flex flex-col border border-rule bg-white",
"shadow-[0_1px_2px_rgba(26,23,20,0.04),0_24px_60px_-24px_rgba(26,23,20,0.35)]",
"focus:outline-none",
size === "docked"
  ? [
      // 375: bottom-docked sheet. Same Radix root, same focus trap, same z tier.
      "inset-x-0 bottom-0 max-h-[88dvh] w-full",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom data-[state=open]:duration-240",
      "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=closed]:duration-180",
      // >=640: the Ledger centred panel, unchanged.
      "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[92dvh] sm:w-[calc(100vw-2rem)] sm:max-w-[30rem]",
      "sm:-translate-x-1/2 sm:-translate-y-1/2",
      "sm:data-[state=open]:slide-in-from-bottom-2 sm:data-[state=open]:duration-200",
      "sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:duration-150",
    ]
  : [ /* existing centred classes, unchanged */ ],

// 2. Close target: 36px -> 44px, matching Sheet.tsx:61 and Button size md.
"absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-sm text-ink-3",
"transition-colors hover:bg-surface-2 hover:text-ink",   // surface-2: it now sits on bg-surface
<IconClose className="h-5 w-5" />

// 3. DialogHeader: pr-14 -> pr-16, to clear the wider button (matches SheetHeader).
```

**`src/components/ledger/Field.tsx`** — two edits:

```tsx
// L60 — label was text-ink-3, identical to the placeholder and the hint. Three roles, one grey.
"font-sans text-micro font-bold uppercase tracking-[0.09em] text-ink-2"

// L75 and L194 — error was a bare red sentence in a gap-5 stack, indistinguishable from a label.
"flex gap-2 border-l-2 border-attention bg-attention/8 px-2.5 py-1.5 text-meta font-medium text-attention"
```
Label `ink-2`, hint and placeholder stay `ink-3`. That is the whole fix for "grey mush": label, hint and placeholder stop being one colour.

**`src/routes/__root.tsx:137`** — viewport meta is `width=device-width, initial-scale=1`. Add `interactive-widget=resizes-content`. Without it, Chrome Android leaves the layout viewport at full height when the keyboard opens and the bottom-docked footer sits underneath it.

**`src/styles.css:43-50`** — the comment says Archivo Expanded's "only sanctioned use in this codebase is the price figure on VehicleCard". This design adds a second: the price figure in the dialog identity strip. Same rule (figures only, never sentences). Update the comment rather than break it silently.

---

### At 1200px

Panel: 480px wide, centred, square, `border border-rule bg-white`, existing two-part shadow, `max-h-[92dvh]`. Rendered height with all six intents lands at roughly 540 to 580px, so it never scrolls internally on a desktop viewport. Overlay `bg-ink/55`, unchanged.

| # | Element | Component / classes | Notes |
|---|---|---|---|
| 1 | **Identity strip** | `DialogHeader className="flex-row items-center gap-4 bg-surface py-4 pr-16"` | Base `flex flex-col gap-1.5 border-b border-rule px-6 py-5 pr-14` overridden cleanly by twMerge (`flex-col`→`flex-row`, `gap-1.5`→`gap-4`, `py-5`→`py-4`, `pr-14`→`pr-16`). The `bg-surface` band is the whole reason the panel has a shape: two grounds instead of one flat white. 88px tall. |
| 2 | Thumbnail frame | `div.h-12.w-16.shrink-0.overflow-hidden.border.border-rule.bg-white` | 64×48. Square. |
| 3 | Thumbnail | `<ResponsiveImage name={imageNameFromSrc(vehicle.image)} alt="" sizes="64px" aspect={{width:4,height:3}} priority className="h-full w-full object-cover" />` | `alt=""`: the title next to it names the car, so the image is decorative. `priority` because it is the same asset the card already loaded, so it paints with the panel instead of fading in. If `imageNameFromSrc` returns `undefined`, render frame 2 with `bg-surface-2` and no `<img>`. Never a broken image. |
| 4 | Text column | `div.min-w-0.flex.flex-col.gap-0.5` | |
| 5 | **Kicker**, inside `DialogTitle` | `span` `text-micro font-bold uppercase tracking-[0.09em] text-brand` | The intent. `Availability`, `Price`, `Test drive`, `Trade`, `Financing`, `Question`. This is the only place the accent appears besides the focus ring. |
| 6 | **Vehicle line**, inside `DialogTitle` | `DialogTitle className="flex flex-col gap-0.5"` → `span.text-h3.font-bold.text-ink.text-pretty.line-clamp-2` | `{year} {model} {trim}` — `make` is dropped from display (every record is Ford) and kept in the lead payload. Accessible name becomes "Availability 2025 F-150 Platinum", which reads correctly when announced and makes mis-attribution visible rather than silent. |
| 7 | **Price line** | `DialogDescription` (`text-meta leading-relaxed text-ink-2`) | `$64,995 · 12 miles · New`. The figure is `<span className="font-display text-ui text-ink">` — Archivo Expanded, 15px, ink. It is the heaviest thing on the line and the only figure in the panel. Remove `aria-describedby={undefined}` from `DialogContent`; there is now a real description. |
| 8 | Close | from `DialogContent`, 44×44 at `right-2 top-2` | |
| 9 | **Body** | `DialogBody className="p-0"` | Padding moves into the two blocks so they can carry different grounds. |
| 10 | *Block A — what you say* | `div.bg-white.px-6.pt-5.pb-6` | |
| 11 | Message field | `<Field label="Your message" hint={cfg.hint}>` | |
| 12 | Message control | `<Textarea rows={3} className="min-h-[5.5rem]" value={draft}>` | **`value`, not `placeholder`.** Placeholders are examples (Field's own rule) and would not be sent. |
| 13 | *finance only* | `p.mt-3.text-meta.text-ink-2` | "This is a message, not a credit application. No credit is pulled here." |
| 14 | *finance only* | `p.mt-1.5.text-micro.leading-relaxed.tracking-normal.normal-case.text-ink-3` | `activeIncentives(new Date())[0]`: `{label}. {programme}. Ends {endsOn}.` then `{disclaimer}` in full. Renders nothing when the array is empty. `text-micro` carries `0.09em` tracking by default and must be reset for sentences. |
| 15 | *Block B — how we reach you* | `div.border-t.border-rule.bg-surface.px-6.py-5` `role="group" aria-labelledby="reply-heading"` | The second ground. Everything administrative lives here. |
| 16 | Group heading | `p#reply-heading` `text-micro font-bold uppercase tracking-[0.09em] text-ink-3` | "So we can reply". |
| 17 | Phone | `<Field label="Phone number" hint={statusHint} error={errors.phone}>` → `<Input type="tel" inputMode="tel" autoComplete="tel" placeholder="(440) 555-0199" />` | `statusHint` is the live open/closed line. See §4. |
| 18 | Name | `mt-4` · `<Field label="Your name" required={false}>` → `<Input autoComplete="name" placeholder="Jane Miller" />` | |
| 19 | Consent | `mt-4` · `<ConsentCheckbox id={\`lead-consent-${vehicle.id}\`}>{CONSENT_TEXT}</ConsentCheckbox>` | Verbatim, unchanged, still required. Stays at `text-ink-2`: on `--surface` `#f2eee8`, ink-3 measures 4.12:1 and fails AA at 13px, so the legal text is separated by ground and position, never by making it fainter. |
| 20 | Submit failure | `mt-4` · see §6 | |
| 21 | **Footer** | `DialogFooter className="sm:flex-row-reverse sm:justify-start"` | With `flex-row-reverse`, `justify-start` packs right, so the primary lands rightmost on desktop and bottom-most on mobile from a single DOM order. |
| 22 | Primary | `<Button type="submit" className="sm:min-w-[10rem] aria-disabled:bg-brand-deep aria-disabled:cursor-wait aria-disabled:opacity-100">` | Label: "Send message". No `disabled` attribute; see §7. |
| 23 | Secondary | `<Button variant="secondary" asChild><a href={dealerInfo.phoneHref}><IconPhone className="h-4 w-4" />Call (440) 998-2151</a></Button>` | A real second path, at real size, on every intent. |
| 24 | Live region | `p.sr-only` `role="status" aria-live="polite"` | "Sending your message" while in flight. |

### At 375×812

Same DOM, same component tree, `size="docked"`. Deltas only:

- Panel docks to the bottom edge, full width, `max-h-[88dvh]` (714px). No side gutters. Square.
- Horizontal padding `px-5` throughout instead of `px-6` (`DialogHeader className="... px-5 sm:px-6"`, same on both blocks and the footer).
- Thumbnail 56×42 (`h-[42px] w-14`, `sizes="56px"`). Vehicle line stays `text-h3`; the mobile type-scale block at `styles.css:822` only touches legacy `text-xl`/`text-2xl` utilities, so `text-h3` is unaffected.
- Footer: `flex-col-reverse gap-2 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]`, both buttons `block`. **Call sits above Send**; Send is the bottom-most element, in the thumb rest.
- **No autofocus.** Radix focuses the Content container, the keyboard stays down, and the first thing on screen is the car. At `sm` and up the message textarea is autofocused with the caret at `value.length` (`setSelectionRange(len, len)` in `onOpenAutoFocus`, never select-all).
- Body height budget with the keyboard open (~370px visible): header 84 + footer 116 pinned, message field and reply block scroll inside `DialogBody`'s `flex-1 overflow-y-auto`. The footer never scrolls away, which is the entire reason the panel is docked rather than centred.

---

## 2. THE FIRST THREE SECONDS

Before a single word is read:

1. **A photograph of the vehicle they were just looking at**, cropped the same, in the top-left corner, on a warm grey band. The panel visually continues from the card they tapped. The old panel could have been a newsletter signup.
2. **One large figure**, `$64,995`, in the wide face. The only figure in the panel. It says "this is the specific thing, at the specific price" without a sentence.
3. **A box with writing already in it.** The eye reads "there is text there" before it reads what the text is, and the cost estimate drops from "fill out a form" to "check a sentence".
4. **A green dot and the word Open**, or its absence. Whether a human is at the desk right now.
5. On mobile, the panel **rises from the bottom edge**, which is the compose gesture, not the marketing-interrupt gesture.

What they understand without reading: *this is about my truck, someone is there, and it is one box and a phone number.*

---

## 3. FIELDS

Three visible inputs plus consent. In this order.

| Order | Field | Required | Why it survives |
|---|---|---|---|
| 1 | **Message** (`Textarea`, pre-filled) | No, but never empty in practice | This is the angle. It is the only field that carries what the visitor actually wants, it is the only field the sales desk reads first, and pre-filling it converts the panel from a form into a draft. It goes first because in a conversation you say the thing before you say who you are. |
| 2 | **Phone** (`type="tel"`) | **Yes** | The only field the business genuinely needs. `RESPONSE_PROMISE` commits to "a call or text within 15 minutes"; the phone number is what makes that promise executable. Everything else is optional by definition. |
| 3 | **Name** | **No** (`required={false}`) | Demoted from required. `submitQuickLead` already writes `"Not provided"` when it is absent (`leads.ts:56`) — the pipeline was built for a missing name. Kept visible because a name is what makes the callback feel like a person calling a person rather than a queue dialling a number, and it costs one tap. Not worth blocking a lead over. |
| 4 | **Consent** (`ConsentCheckbox`) | **Yes** | Non-negotiable, TCPA. `CONSENT_TEXT` verbatim. |

**Dropped: Email.** It was optional already and it earns nothing. The product's stated response channel is phone or text; `submitLeadInquiry` accepts `email: ""` without complaint; nothing in the system sends email. An optional field that changes no downstream behaviour is pure friction on a 375px screen. If email capture is later needed for a nurture sequence, it belongs on the success screen as a second, separate ask, after the lead is already banked.

**Deferred, not dropped: preferred date/time.** `LeadInquiry` has real `preferred_date` and `preferred_time` columns (`supabase.ts:34-35`) that `submitQuickLead` does not pass. A date picker in the `test_drive` intent would imply live calendar availability that does not exist in this system. The prefilled draft asks "When can I come in?" and the dealership answers with real times. If a picker is ever added, widen `QuickLeadInput` first; do not fake availability.

**Dropped: preferred contact method** (Text / Call / Email, from `TradeOfferPopup`). `CONSENT_TEXT` already covers both phone and text, and the selection changes nothing about what the desk does.

**Dropped: first name / last name split** (from `OfferPopup`, four required fields). One name field, optional.

---

## 4. HOW THE SIX INTENTS DIFFER

The old `INTENT` map differentiated by **six button labels over one identical layout**. This inverts it: **one button label over six different messages.** The button always does the same thing, which is send a message. What differs is the message.

```ts
const INTENT: Record<LeadIntent, {
  kicker: string;
  draft: (v: Vehicle) => string;
  hint: (v: Vehicle) => string;
  leadType: "test_drive" | "quote_request" | "financing_preapproval";
  extra?: "finance";
}>
```

| intent | kicker | pre-filled draft (`{y} {model} {trim}`) | message hint | leadType | extra block |
|---|---|---|---|---|---|
| `enquiry` | Question | `I have a question about the 2025 F-150 Platinum.` | Tell us what you need to know. | quote_request | none |
| `price` | Price | `What is the best you can do on the 2025 F-150 Platinum?` | If you have a trade or a payment in mind, say so and we will work from that. | quote_request | none |
| `availability` | Availability | `Is the 2025 F-150 Platinum still on the lot?` | We will confirm before you drive out. | quote_request | none |
| `test_drive` | Test drive | `I would like to drive the 2025 F-150 Platinum. When can I come in?` | Say roughly when suits. Open today {todayHours}. | test_drive | none |
| `trade` | Trade | `I want to trade against the 2025 F-150 Platinum.` | Add the year, make, model and rough mileage of what you drive now. | quote_request | none |
| `finance` | Financing | `I would like to know what I can be approved for on the 2025 F-150 Platinum.` | Tell us anything that helps, or nothing at all. | financing_preapproval | yes |

**Identical across all six:** panel, identity strip, field set, field order, consent, both footer buttons, the CTA label ("Send message"), success state, every error state, motion.

**`finance` is the only intent with an extra block** (rows 13 and 14 in the anatomy): the "no credit is pulled here" line, and one real dated programme from `activeIncentives(new Date())` with its PGM number and full manufacturer disclaimer, or nothing if none is active. This is the only place a factual claim is added to any dialog, and it is added because financing is the only intent where the visitor's actual anxiety is not about the car.

**`price` deliberately gets no discount claim and no incentive line.** `PRICING_STANCE` is the dealership's published "We will beat any deal" and the brief says it must not be restated in stronger words. The draft asks the real question and nothing asserts a lower number exists.

**Payload change (`src/lib/leads.ts:59`).** Today the message is prefixed with machine text: `` `${cfg.cta} — ${title} ($${price}). ${message}` ``, so the sales desk reads a robot before it reads the human. Invert it, and add `intent` to `QuickLeadInput`:

```ts
message: [
  input.message.trim(),
  `${input.intentLabel} · ${vehicleLine} · $${price.toLocaleString("en-US")}${input.edited ? "" : " · draft not edited"}`,
  consentStamp(),
].join("\n"),
```
Human sentence first, machine metadata on its own line, consent stamp last. `edited` is a boolean the dialog sets when the visitor's message differs from the generated draft — see §9.

---

## 5. SUCCESS STATE

Today the success branch renders header plus body and stops (`VehicleLeadDialog.tsx:178-208`). No `DialogFooter`, so the panel visibly shrinks and loses its bottom rule at the exact moment it should feel most settled, and the only exit is a 36px grey cross.

The new success state **keeps the identity strip and keeps the footer**. The header does not change at all, so the panel does not appear to rebuild — only the body cross-fades. Add `sm:min-h-[26rem]` to the `DialogContent` so the height delta between form and receipt is near zero.

**Body, top to bottom:**

1. `div.flex.gap-3.px-6.pt-5` — the existing 32px `bg-available/10` disc with `IconCheck`, then:
2. `p.text-body.text-ink` — **"Sent."** Nothing more on that line.
3. `p.mt-1.text-meta.text-ink-2` — `We will reach you on (440) 555-0199.` The number they typed, formatted back. This is the only moment a typo is still fixable and it costs one line.
4. **Their own message, quoted back**, in a `mt-4 border-l-2 border-brand bg-surface px-4 py-3 text-meta leading-relaxed text-ink-2` block. This is the single most conversation-like element available and it is free: it is their words, and it proves the panel is not a black hole. Clamped to 6 lines.
5. `p.mt-4.text-meta.leading-relaxed.text-ink-2` — what happens next, from the real clock:
   - open now → `RESPONSE_PROMISE` **verbatim**.
   - closed → `The desk opens at 9:00 AM Monday. Yours is first in the queue when it does.` (day and time from `dealerStatus`, never hardcoded)
   - hours unparseable → `RESPONSE_PROMISE` verbatim, no clock claim.

**Footer (now present):**
- Primary: `<DialogClose asChild><Button>Done</Button></DialogClose>`
- Secondary: the same `Call (440) 998-2151` button as the form state. Unchanged position, unchanged label. Someone who just sent a message and immediately wants to talk should not have to hunt.

**Reopening in the same session.** `hasSubmittedLead()` already exists. If true when the dialog opens on a form state, render one quiet line above the message field: `You already sent us a message. Another is fine, we will see both.` True (both rows land in `leads`), no guilt, no block.

---

## 6. ERROR AND FAILURE

### a. Lead storage unconfigured at build time — checked at open, not at submit

`leadStorageConfigured` (`supabase.ts:21`) is a build-time constant. Today the visitor discovers the form is dead only after writing a message, typing a phone number and ticking consent. **Check it at render.** When false, the dialog never shows a form:

- Identity strip: unchanged, kicker becomes the intent as usual.
- Body: `Our message form is offline right now. Call or text us and we will pick it up from there.`
- Footer, both `block` on mobile:
  - Primary: `<Button asChild><a href={dealerInfo.phoneHref}><IconPhone/>Call (440) 998-2151</a></Button>`
  - Secondary: `<Button variant="secondary" asChild><a href={smsLink(vehicle)}>Text us about this vehicle</a></Button>`

`smsLink(vehicle)` (`leads.ts:81`) already composes `Hi AM Ford — I'm interested in the 2025 Ford F-150 Platinum listed at $64,995. Is it still available?`. The vehicle attribution survives a broken backend, which is the whole point. Two notes: that prefilled SMS body contains an em dash, which the copy rule forbids — change it to a comma. And a dead form is a deploy defect, so under `import.meta.env.DEV` also render an `border border-attention bg-attention/8` strip naming the two missing env vars, so it is caught in build QA rather than in production.

### b. Field errors

Both use the new bordered error strip from `Field.tsx`. Copy says what to do, not what went wrong:

| condition | message |
|---|---|
| phone empty | `We need a number to reply to.` |
| phone digits < 10 | `That looks short. Include the area code, 10 digits.` |
| consent unticked | `Please tick the box so we are allowed to contact you.` |

Validation runs on submit only, then re-validates that field on change once it has errored. Never on first blur.

Phone formatting: on **blur only**, if exactly 10 digits, rewrite to `(440) 998-2151`. Never during typing; caret restoration on backspace is where those implementations break.

### c. Submit failure

`role="alert"` block above the footer inside Block B: `border border-attention/40 bg-attention/8 px-3.5 py-3 text-meta leading-relaxed text-ink`.

Content: `res.message` **alone**, with the phone number rendered as a real `<a href={dealerInfo.phoneHref}>` rather than as plain text.

> **Bug to fix while here.** `VehicleLeadDialog.tsx:161-163` and `ModelEnquiryDialog.tsx:79-81` both append `You can also call us on ${dealerInfo.phone}...` to `res.message`, but every one of `submitLeadInquiry`'s three failure paths already ends with `callInstead` (`supabase.ts:44`). The visitor is currently told to call, twice, in one sentence. Drop the appended clause.

On failure the message, phone, name and consent are all preserved. Status returns to `idle`, the primary button returns to its normal state, and focus moves to the alert (`ref.focus()` on a `tabIndex={-1}` container).

### d. Not an error

`imageNameFromSrc` returning `undefined` renders an empty framed box, never a broken `<img>`. `activeIncentives` returning `[]` renders nothing. `dealerStatus` failing to parse renders no clock line anywhere.

> **Build blocker, unrelated to design.** `vehicles.ts:326` states the phone number is not from the brief and needs verification with the dealership. This design puts that number on two buttons, one hint, one success line and one SMS deep link in every dialog. Verify it before shipping.

---

## 7. MOTION

`styles.css:415-424` already zeroes every animation and transition duration globally under `prefers-reduced-motion: reduce`. Everything below therefore gets reduced-motion for free, and Radix's presence-based unmount still fires at `0.001ms`. Nothing in this design listens for `animationend` or `transitionend`, so nothing depends on that duration.

| What | Property | Duration | Easing | Reduced motion |
|---|---|---|---|---|
| Overlay enter | opacity 0→1 | 160ms | ease-out | instant |
| Overlay exit | opacity 1→0 | 140ms | ease-out | instant |
| Panel enter, ≥640px | opacity 0→1, translateY 8px→0 | 200ms | `cubic-bezier(0.16, 1, 0.3, 1)` | instant |
| Panel exit, ≥640px | opacity 1→0, **no translate** | 150ms | ease-out | instant |
| Panel enter, <640px | translateY 100%→0 | 240ms | `cubic-bezier(0.16, 1, 0.3, 1)` | instant |
| Panel exit, <640px | translateY 0→100% | 180ms | ease-out | instant |
| Form → success body | opacity cross-fade | 160ms | ease-out | instant |
| Control focus | `border-color` | 150ms | linear (existing `transition-colors duration-150`) | instant |
| Button hover | `background-color` | 150ms | linear (existing) | instant |

Exit does not move on desktop, only fades. That is the existing Dialog rule (`Dialog.tsx:50-51`) and it is right: dismissing should never look like it is fighting the pointer.

**Nothing else moves.** No staggered field entrance. No thumbnail fade (it is `priority`, off a cached asset, and paints with the panel). No height animation on the success transition — the `sm:min-h-[26rem]` floor removes most of the delta and animating height is jank.

**The sending state has no spinner and no progress bar.** There is no spinner in `icons.tsx` and inventing one would be the only piece of decorative motion in the system. A determinate bar would be a lie about a request whose duration is unknown; an indeterminate loop is exactly the kind of perpetual motion this system avoids. Instead:

```tsx
<Button
  type="submit"
  aria-busy={status === "sending"}
  aria-disabled={status === "sending"}
  className="aria-disabled:cursor-wait aria-disabled:bg-brand-deep aria-disabled:opacity-100"
>
  {status === "sending" ? "Sending" : "Send message"}
</Button>
```
The label changes, the fill deepens one step to `--brand-deep`, and an `aria-live="polite"` region announces "Sending your message". Note `aria-disabled` rather than `disabled`: a real `disabled` attribute drops the element from the tab order and the visitor's focus falls to the body mid-submit. The handler guards on `status === "sending"` and returns early. This also removes `disabled:opacity-45` (`Button.tsx:22`), which currently makes the CTA look broken rather than busy.

---

## 8. DELIBERATELY LEFT OUT

- **A named person, a photo of a salesperson, "Dave will call you".** There is no person data anywhere in the repo. Inventing one is fabrication, and the moment a different person calls, the whole panel was a lie.
- **Star ratings, review counts, "12 people are viewing this", countdown timers, "3 left".** Explicitly forbidden and none of it is backed by data.
- **The $500 claim** carried by `OfferPopup`, `ExitIntentOffer` and `TradeValuatorModal` in four contradictory wordings. There is no programme, voucher, code or expiry behind it anywhere in the system. `INCENTIVES` has four real dated programmes with PGM numbers; if an offer appears, it is one of those.
- **A drag handle on the mobile sheet.** A handle that does not drag is a broken affordance, and drag-to-dismiss fights a scrolling body. The `bg-surface` identity band already reads as the top of a sheet.
- **`sellerNotes` in the panel.** It is the best prose in the dataset and it belongs on the page the visitor just came from. Five sentences, truncation is ugly, and the dialog's job is to be short.
- **A `SpecTable` or the `features[]` list.** Same reason. The dialog is not a second detail page.
- **`estMonthlyPayment`.** A 7.49% / 72-month estimate inside a lead capture would need its own disclaimer, and it is already on the card.
- **A `Chip` in the identity strip.** `New` is already legible from "12 miles" and the price line. One less thing.
- **A multi-step wizard.** Three inputs do not need steps, and steps raise perceived cost.
- **A date and time picker on `test_drive`.** See §3.
- **Any per-intent layout change.** Six layouts is six things to maintain and six chances to drift. Six drafts is one thing to maintain.
- **Dark mode.** `.dark` tokens exist in `styles.css:249` and nothing on the site toggles them.
- **Auto-growing textarea, inline phone masking during typing, and select-all-on-focus.** Each is a small win and a caret bug on mobile Safari.

---

## 9. THE ONE RISK

**The pre-filled message is the whole angle, and most visitors will send it unedited.**

If they do, the dealership receives a stream of near-identical sentences and loses the one high-signal thing it gets from the current form: a message someone actually typed. It gets worse when compounded with today's payload, where `cfg.cta`, the vehicle line, the price and the consent stamp are all machine-written around the visitor's text — an unedited send produces a row that is 100% generated and reads to the sales desk as a bot. A desk that starts treating leads as bot traffic is a worse outcome than a plain form.

Three mitigations, all in the design above:

1. **The metadata moves below the human sentence** and the machine prefix is deleted (§4), so the first line the desk reads is always the visitor's, edited or not.
2. **The payload marks it.** `submitQuickLead` receives `edited: message !== draft` and appends `· draft not edited` to the metadata line when false. The desk can tell a typed message from a tapped one, and treat them differently, which is exactly the signal the prefill would otherwise destroy.
3. **It is measurable and reversible.** If the edit rate sits below roughly 20% after a few hundred leads, the field is theatre: collapse it to a single-line `Input` with the same draft, or drop it to optional and let the kicker plus `leadType` carry the intent. Nothing else in the design depends on the message field being large.

The risk is not that the draft is wrong. It is that it is good enough that nobody changes it.