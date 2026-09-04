# THE DEAL SHEET
### A lead dialog system for AM Ford, angled on the money

**Concept in one line:** the dialog is not a form with a car mentioned in it, it is a **quote sheet for one specific vehicle** that happens to end in a question. The visitor was looking at a price. The dialog opens holding that same price, in the same typeface, in the same navy, and adds the two things the card could not show: what is already off MSRP, and which real Ford programme is live on it today. Then it asks for a phone number.

Files this touches:
- `C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\components\lead\VehicleLeadDialog.tsx` (rewrite)
- `C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\components\lead\ModelEnquiryDialog.tsx` (same header treatment, no vehicle figure block)
- `C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\components\ledger\Dialog.tsx` (mobile anchoring, 44px close, header tone)
- `C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\components\ledger\Field.tsx` (label colour, error surface, new `ChoiceGroup`)
- `C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\components\ledger\icons.tsx` (one new icon: `IconMail`, optional)
- `C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\styles.css` (one keyframe)
- New: `src/components/lead/dealLines.ts` (pure derivation, no JSX)

---

## 1. ANATOMY

### Panel shell

| | 1200px | 375px |
|---|---|---|
| Position | `fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`, `max-w-[30rem]` (unchanged `size="form"`) | `fixed inset-x-0 bottom-0 top-auto w-full max-w-none translate-x-0 translate-y-0` |
| Height | `max-h-[92dvh]`, body scrolls | `max-h-[92dvh]`, body scrolls, footer pinned |
| Ground | `bg-white`, `border border-rule`, square (radius 0) | same, `border-x-0 border-b-0` (edges are off-screen) |
| Shadow | existing two-part overlay shadow | same |
| Overlay | `bg-ink/55` | same |

The dialog does **not** get wider to hold the deal block. It gets denser. The change in `Dialog.tsx` is CSS-only on the same node, so switching between the two anchorings on resize never remounts the form:

```
"fixed z-50 flex max-h-[92dvh] flex-col border border-rule bg-white",
"inset-x-0 bottom-0 top-auto w-full max-w-none border-x-0 border-b-0",
"sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[calc(100vw-2rem)] sm:max-w-[30rem] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:border-x sm:border-b",
```

Close button in `Dialog.tsx:60` goes `h-9 w-9` → `h-11 w-11`, icon `h-4 w-4` → `h-5 w-5`, position `right-3 top-3` → `right-2 top-2`. That matches `Sheet.tsx:61` and `Button.tsx:43` ("44px, the comfortable touch target"). Header `pr-14` still clears it.

### Top to bottom

**1. Deal band** — `DialogHeader className="bg-brand-tint"`. Padding `px-6 pb-5 pt-5 pr-14` at 1200, `px-5 pb-4 pt-4 pr-14` at 375. `border-b border-rule`. This is the only tinted region in the system's modal and it exists to say *this panel is about a specific object with a specific price*.

| # | Element | Class / token | 1200 | 375 |
|---|---|---|---|---|
| 1a | Intent eyebrow, `aria-hidden` | `font-sans text-micro font-bold uppercase tracking-[0.09em] text-brand` | shown | shown |
| 1b | `DialogTitle` | `font-sans text-h3 font-bold leading-tight text-ink`, trim in `font-normal text-ink-3` | `2025 Ford F-150 Platinum` | same, wraps to 2 lines |
| 1c | sr-only prefix inside the title | `<span className="sr-only">{cfg.eyebrow}: </span>` | accessible name becomes "Best price: 2025 Ford F-150 Platinum" | same |
| 1d | Figure row wrapper | `mt-3.5 flex items-start gap-3.5` | | `mt-3 gap-3` |
| 1e | Thumbnail box | `shrink-0 overflow-hidden bg-ink` (ink stage, matching `VehicleCard.tsx:94`) | `h-[72px] w-[96px]` | `h-[60px] w-[80px]` |
| 1f | `ResponsiveImage` | `name={imageNameFromSrc(vehicle.image)}`, `sizes="96px"`, `aspect={{width:4,height:3}}`, `className="h-full w-full object-cover"` | | |
| 1g | Price figure | `font-display font-bold tabular-nums text-brand text-h2` (Archivo Expanded, figures only, the sanctioned use) | 30px | 30px |
| 1h | Struck MSRP, only when `msrp > price` | `mt-1 font-sans text-meta tabular-nums text-ink-3 line-through` | inline right of price | own line under price |
| 1i | Saving line, only when derived `saving > 0` | `mt-1 inline-flex items-center gap-1.5 font-sans text-meta font-semibold text-available` + `IconSavings h-3.5 w-3.5` | `$3,425 below MSRP` | same |
| 1j | Condition chip | `Chip tone="condition" size="sm"` = `vehicle.condition` | top-right of figure row, `ml-auto` | moves under 1i |

If `imageNameFromSrc` returns undefined, 1e–1f do not render at all and the price block takes the full width. No grey placeholder box.

**2. Deal ledger** — first block inside `DialogBody` (`px-6 py-5` / `px-5 py-4`). Rendered only when `vehicle.condition === "New"` **and** `activeIncentives(new Date())` is non-empty. Ford new-vehicle programmes do not apply to used stock, and asserting otherwise is the same class of error as the fabricated VIN.

```
<section aria-labelledby="deal-lines">
  <h3 id="deal-lines" className="font-sans text-micro font-bold uppercase tracking-[0.09em] text-ink-2">
    On this vehicle today
  </h3>
  <ul className="mt-2 border-t border-rule">
    {picked.map(i => (
      <li className="flex gap-2.5 border-b border-rule py-2.5">
        <IconSavings className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" aria-hidden />
        <div className="min-w-0">
          <p className="font-sans text-ui font-semibold text-ink">{i.label}</p>
          <p className="mt-0.5 font-sans text-meta leading-relaxed text-ink-2">{i.detail}</p>
          <p className="mt-1 font-sans text-micro tabular-nums text-ink-3">
            {i.programme} · Ends {fmt(i.endsOn)}
          </p>
        </div>
      </li>
    ))}
  </ul>
  <button type="button" aria-expanded={open} className="mt-2 text-meta font-semibold text-brand underline underline-offset-[3px]">
    Programme terms
  </button>
  {open && <div className="mt-2 space-y-2 text-meta leading-relaxed text-ink-3">{disclaimers}</div>}
</section>
```

Maximum **two** programmes. `endsOn` formatted as `8/31/26`, stated flatly, never as a countdown.

**3. Stance line** — `price` and `trade` intents only. `border-l-2 border-brand pl-3 py-0.5 mt-5`:
> AM Ford publishes one pricing stance: "We will beat any deal". Send the number you are working with and we will answer it.

`PRICING_STANCE` is quoted, not restated stronger. The second sentence promises a reply, not a discount.

**4. Lead paragraph** — `cfg.lead`, promoted from `text-meta text-ink-2` to `mt-5 font-sans text-ui leading-relaxed text-ink-2`. This is the sentence that carries the offer, so it must not be the same size as the consent boilerplate (current weakness #3).

**5. Field stack** — `mt-6 grid gap-5` (1200) / `mt-5 grid gap-4` (375). See section 3.

**6. Footer** — `DialogFooter`, `border-t border-rule`, `px-6 py-4` / `px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]`. Column, not row:
- Failure alert (when present), see section 6
- `RESPONSE_PROMISE` in `text-meta text-ink-3` — the promise sits directly above the commit, not three screens away on the success state
- `Button type="submit" block` = `cfg.cta`
- `text-meta text-ink-3`: `In a hurry? <a href={dealerInfo.phoneHref}>` (440) 998-2151 `</a>` — always available, so a stalled form is never a dead end

Vertical budget at 375x812 with the keyboard closed, `price` intent: band 176, ledger 172, stance 56, lead 48, fields 268, footer 148 = 868. The body scrolls about 60px, the CTA is always pinned and visible. With the keyboard open (`dvh` collapses to ~420) the band scrolls away, the footer stays. That is correct: once you are typing, the price has done its job.

---

## 2. THE FIRST THREE SECONDS

Before a word is read, at 375px, the visitor sees a panel rise from the bottom of the screen carrying:

1. **The photograph of the car they were just looking at**, on the same ink ground the card used.
2. **The same price figure**, in Archivo Expanded, in Ford navy, at the same size the inventory row set it. Typographic continuity is the whole trick: the number does not look re-typed, it looks *carried over*. The dialog reads as the same object continuing, not a new document interrupting.
3. **Two more numbers next to it**: one struck through, one in green. Nobody needs to read the labels to know that means the price already moved once.
4. **A navy band under a white body**, which separates "what this is" from "what you do" without a single heading.
5. **One filled button**, navy, full width, at thumb height.

The comprehension in three seconds is: *this car, this money, one question*. Compare the current dialog, which in three seconds reads: *a form*.

---

## 3. FIELDS

### Default form, in order

| Order | Field | Required | Control | Why it survives |
|---|---|---|---|---|
| 1 | **Phone number** | Yes | `Field` + `Input type="tel" inputMode="tel" autoComplete="tel"`, live-formatted to `(440) 555-0199`, digits held raw in state | The only field that makes the lead actionable. `RESPONSE_PROMISE` commits to a call or text in 15 minutes, and nothing else in the form can deliver that. It goes first because a dealership asking for a phone number first is being honest about what happens next. |
| 2 | **Your name** | Yes | `Field` + `Input autoComplete="name"` | Someone is going to dial this number within the hour. "Not provided" is what `submitQuickLead` writes when it is blank, and a salesperson opening a call with no name starts from behind. Note: it is *already* natively required today via `Field`'s `required` default, while the JS validator at `VehicleLeadDialog.tsx:137-143` never checks it. Fix the validator to agree with the DOM. |
| 3 | **The one deal question** | No | `ChoiceGroup`, see below | One tap, and it is the only input that changes the number being discussed. |
| 4 | **Add a note** | No | Quiet toggle button revealing `Textarea rows={2}` | Progressive disclosure. A 3-row textarea in the default state pushes the CTA below the fold on a 375px screen and asks an open-ended question of someone who wanted to press a button. |
| 5 | **Consent** | Yes | `ConsentCheckbox` + `CONSENT_TEXT`, unchanged | Non-negotiable. |

Five rows, three of them one tap or zero taps.

### The one deal question, by intent

`ChoiceGroup` is a new primitive in `Field.tsx`: a `fieldset` + `legend` (styled exactly like the `Field` label) containing sr-only radios with `peer-checked:` labels. Real radios mean arrow-key navigation, a proper group name, and no JS. Selected: `border-brand bg-brand/[0.06] text-brand`. Unselected: `border-rule bg-white text-ink-2 hover:border-ink/25`. Each `h-11`, `rounded-sm`, `text-ui font-semibold`.

- `price` → **"Do you have a vehicle to trade?"** Yes / No
- `finance` → **"Roughly what works per month?"** Under $500 / $500 to $700 / $700 plus / Not sure
- `test_drive` → **"When suits?"** This week / Next week / Weekend / Evening
- `trade` → no chips, a required 2-row `Textarea` labelled "What are you trading", placeholder "Year, make, model and rough mileage."
- `availability`, `enquiry` → no chips

### Dropped

- **Email, everywhere except `finance`.** `submitQuickLead` accepts an empty string. Every promise the dialog makes is a call or a text. An email field on a phone keyboard is the most expensive keystrokes in the form for the least valuable data. It survives on `finance` only, marked optional, because a written approval has to land somewhere.
- **The always-visible message textarea.** Folded behind "Add a note" or replaced by chips.
- **Anything else.** No last name, no preferred contact method, no ZIP, no date picker, no vehicle-you-currently-drive on non-trade intents.

For reference, the surfaces being replaced ask for: first name, last name, preferred contact, phone, email, comments, date, time, trade details (`LeadCaptureModal`, `OTPPopup`). This asks for three things and a checkbox.

---

## 4. HOW THE SIX INTENTS DIFFER

**Identical across all six:** the deal band (photograph, title, price figure, MSRP, saving, condition chip), phone + name + consent, the footer promise and phone link, success state, every error path, all motion, `submitQuickLead` as the only submit path, `vehicle` required.

| Intent | Eyebrow | `cfg.lead` | Deal ledger | Extra control | CTA | `leadType` |
|---|---|---|---|---|---|---|
| `price` | BEST PRICE | keep current wording | `sse-down-payment`, `apr-0-36` + stance line | Trade Yes/No | Ask for the best price | `quote_request` |
| `enquiry` | ENQUIRY | keep current | none | none | Send enquiry | `general_contact` * |
| `availability` | AVAILABILITY | keep current | none | none | Check availability | `general_contact` * |
| `test_drive` | TEST DRIVE | keep current | none | When suits, 4 options | Book a test drive | `test_drive` |
| `trade` | TRADE | keep current | `sse-down-payment` + stance line | Required trade textarea | Send trade details | `quote_request` |
| `finance` | FINANCE | keep current | `apr-0-36`, `defer-90` | Monthly budget, 4 options + optional email | Start an application | `financing_preapproval` |

\* `general_contact` is already in the `LeadInquiry` union at `supabase.ts:25-30` and is unused. Two intents currently file as `quote_request` when no quote was requested, which makes the CRM's own type column lie. One-word fix.

Programme selection is by id from `activeIncentives(new Date())`, gated on `condition === "New"`, capped at two, and silently empty when nothing matches. Never a fallback to "ask us about offers".

`test_drive` and `availability` get no ledger on purpose. A test drive is not a money conversation, and padding it with an APR programme is the exact move that made the old overlays feel like a sales floor.

---

## 5. SUCCESS STATE

The single most important rule: **the deal band does not change.** Same photograph, same price, same tint, same height. Only the body and footer swap. The panel does not shrink, does not lose its bottom rule, and does not turn into a different, smaller object at the moment the visitor most needs confidence. To guarantee that, capture `bodyRef.current.offsetHeight` at submit time and apply it as `minHeight` to the success body. Six lines, no layout animation, and it removes the current "panel collapses" defect entirely.

Body:
1. Check dot, existing treatment: `h-8 w-8 rounded-full bg-available/10 text-available` + `IconCheck`
2. `text-body text-ink`: "Your request is with our sales desk."
3. `RESPONSE_PROMISE` verbatim, `text-meta text-ink-2`
4. **The receipt.** `SpecTable` with three rows, because a deal sheet that goes nowhere is not a deal sheet:
   - Request → "Best price"
   - Vehicle → "2025 F-150 Platinum"
   - Listed at → "$64,995" (tabular figures, right aligned)
5. `DELIVERY_SHORT` verbatim, `text-meta text-ink-3`. The question after "what does it cost" is "how does it get to me", and this is approved wording.

Footer, two actions, one filled:
- `Button variant="primary"` as `DialogClose` → **"Done"**. The lead is in; the thing we want next is nothing.
- `Button variant="secondary" asChild` → `<a href={dealerInfo.phoneHref}>` with `IconPhone` → **"Call (440) 998-2151"**

This is the fix for the current state having no footer and no exit but a grey ✕.

---

## 6. ERROR AND FAILURE

**Tier 1, field level.** `Field.tsx:75` and `Field.tsx:194` change from bare red text to a marked block, so an error never reads as another label:

```
<p role="alert" className="flex items-start gap-2 rounded-sm bg-attention/[0.08] px-2.5 py-1.5 text-meta font-medium text-attention">
  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-attention" aria-hidden />
  {error}
</p>
```

No new icon needed. Also change `Field.tsx:60` label colour from `text-ink-3` to `text-ink-2`: today the label, the hint and the placeholder are all one colour, which is why the form reads as grey mush.

**Tier 2, submit failure.** `submitLeadInquiry` returns one of three customer-safe messages and logs the real one. The alert moves out of the field stack and into the **top of the footer**, so the eye that just pressed the button finds it without scrolling:

```
<div ref={alertRef} tabIndex={-1} role="alert"
     className="mb-3 border border-attention/40 bg-attention/[0.08] px-4 py-3">
  <p className="text-meta font-medium text-attention">{res.message}</p>
  <Button variant="secondary" size="sm" asChild className="mt-2.5">
    <a href={dealerInfo.phoneHref}><IconPhone className="h-4 w-4" />Call (440) 998-2151</a>
  </Button>
</div>
```

On failure, `alertRef.current.focus()`. The form keeps every value the visitor typed. Retrying is one tap.

**Tier 3, lead storage unconfigured at build time.** `leadStorageConfigured` is exported from `supabase.ts:21` and is known at module scope, so the dialog must never show a form it knows cannot submit. This gets its **own branch, before the form**:

- Deal band renders unchanged. The money still informs, and that is still worth showing.
- Body: "Our online form is temporarily unavailable." (the same sentence `submitLeadInquiry` would have returned), then `dealerInfo.hours` rendered as a `SpecTable`, so a visitor at 11pm understands why the phone will not be answered.
- Footer, two actions:
  - `Button size="lg" block asChild` → `dealerInfo.phoneHref`, "Call (440) 998-2151"
  - `Button variant="secondary" block asChild` → `smsLink(vehicle)` from `lib/leads.ts:81`, "Text us about this vehicle". That link is already pre-filled with the exact year, make, model, trim and price.

This turns the worst failure mode in the codebase, a deploy built without env vars that silently eats every lead for the life of the bundle, into the second-best conversion path. It also fires locally the moment `.env` is missing, which makes the misconfiguration impossible to miss.

**Guards.** Ignore submits while `status === "sending"`. Do not run `reset()` on close while sending, only when idle or done.

---

## 7. MOTION

| What | Duration | Curve | Reduced motion |
|---|---|---|---|
| Overlay fade in | 160ms | default ease-out | unchanged, opacity is safe |
| Overlay fade out | 120ms | linear | unchanged |
| Panel in, ≥640px | 200ms, `fade-in-0 slide-in-from-bottom-2` (8px rise) | existing | `motion-reduce:animate-none`, opacity only |
| Panel out, ≥640px | 150ms, fade only, no movement | existing | as above |
| Panel in, <640px | 240ms, `slide-in-from-bottom` full translate | `cubic-bezier(0.32,0.72,0,1)` | opacity only, no translate |
| Panel out, <640px | 180ms, slide out to bottom | ease-in | opacity only |
| Form → success swap | form `fade-out 120ms`, success `fade-in 160ms` + 4px rise, panel height pinned by captured `minHeight` | ease-out | both cross-fade at 0ms, no rise, height still pinned |
| Field error appear | 120ms fade only, **no slide, no shake** | ease-out | none |
| Sending indicator | 2px rule sweeping the CTA's bottom edge, `deal-progress 1.1s ease-in-out infinite` | see below | `motion-reduce:animate-none motion-reduce:scale-x-100`, renders as a static 2px `bg-white/40` bar |
| Thumbnail hover | nothing. It is a fact, not a link. | | |

The sending indicator replaces `disabled:opacity-45`, which currently makes the primary CTA look broken rather than busy. On `status === "sending"` the button keeps `bg-brand` at full opacity, gains `aria-busy="true"` and `pointer-events-none`, and the label reads "Sending". There is no spinner in `icons.tsx` and none is being added: a rule is more Ledger than a wheel.

```css
@keyframes deal-progress {
  0%   { transform: scaleX(0); transform-origin: left; }
  50%  { transform: scaleX(1); transform-origin: left; }
  51%  { transform: scaleX(1); transform-origin: right; }
  100% { transform: scaleX(0); transform-origin: right; }
}
```

The global `prefers-reduced-motion` block at `styles.css:415` already collapses every animation to 0.001ms, which is why the reduced-motion path needs the explicit static-bar fallback rather than relying on the animation simply not running.

Nothing else moves. No parallax on the photograph, no staggered field entrance, no number count-up on the price.

---

## 8. WHAT I DELIBERATELY LEFT OUT

- **A countdown on `endsOn`.** The date is real and it is stated: "Ends 8/31/26". A ticking clock converts a fact into pressure, and pressure is what the client's existing popups already do badly.
- **`estMonthlyPayment`.** It exists at `leads.ts:70` and hardcodes 7.49% APR, which is not a programme in `INCENTIVES`. `VehicleCard` already refuses to print it (`VehicleCard.tsx:38-41`). A payment figure inside a *deal* dialog would be the most believable number on screen and the least sourced.
- **Any stock or scarcity signal.** There is no `status` or `sold` field on `Vehicle`. "In stock as of today" (`ChatWidget.tsx:321`) and "12 people viewing" are the same fabrication.
- **The $500 voucher, in all four wordings.** No programme number, no code, no expiry anywhere in the system. `sse-down-payment` at $1,000 is real, carries PGM #14196, and is the thing that should be shown instead.
- **A price gate or "unlock" framing.** The price is printed in the band. That is the point.
- **A date and time picker for `test_drive`.** There is no calendar or clock icon in `icons.tsx`, and more importantly a slot chosen in a web form is a commitment the desk never agreed to. Four rough windows is an honest amount of precision.
- **A multi-step wizard.** `TradeValuatorModal` earns its six steps because it computes a range at the end. A three-field form that paginates itself is theatre.
- **A drag handle on the mobile sheet.** No drag gesture is implemented, and an affordance that does nothing is a small lie in a system built to stop telling them.
- **The trade valuation range inside this dialog.** That is `TradeValuatorModal`'s job. Two estimators for one car will eventually disagree, in writing, in front of a customer.
- **A second filled button, anywhere, in any state.**
- **Success animation beyond the existing check.** No confetti, no expanding circle. A receipt is the reward.
- **Cross-session form persistence, an inline chat handoff, and "see similar vehicles" on success.** All three are new exits out of a dialog the visitor opened to do one thing.
- **Archivo Expanded on anything but figures.** The price, and nothing else.

---

## 9. THE ONE RISK

**The entire visual payload of this angle is derived data, and both sources are fragile.**

Every one of the four entries in `INCENTIVES` has `endsOn: "2026-08-31"`. Today is 14 August 2026. In seventeen days `activeIncentives(new Date())` correctly returns `[]`, the deal ledger renders nothing, and the strongest block in the dialog disappears without anyone deploying anything. Separately, the saving line depends on `msrp`, and the homepage already distrusts that field: `VehicleCard` is passed `showSaving={false}` there precisely because "the msrp values in the placeholder records are not real numbers" (`VehicleCard.tsx:56-60`). Real inventory arriving from a feed without `msrp` produces the same blank.

Worst case, on 1 September with feed data, this design degrades to a price figure over a form, which is where it started, except now with a tinted band drawing attention to the empty space where the deal used to be.

Two mitigations, both required:

1. **The deal block is furniture, not structure.** The band, the figure, the fields and the footer must all read as complete with the ledger absent. And there is a floor: when there is no derived saving and no active programme, the ledger is replaced by exactly one line built from two dateless, dealership-owned facts, `DELIVERY_SHORT` and `PRICING_STANCE`. Both are true in September, both are true next year, and neither needs a programme sheet.
2. **This is an operational dependency, not a code one.** Someone has to enter the September Ford programme sheet into `dealerContent.ts` before 31 August. Build it so the failure is visible: in `import.meta.env.DEV`, `console.warn` when `activeIncentives(new Date()).length === 0`, so the next developer to open the site finds out before the customer does.