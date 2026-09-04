## Copy audit: forms and modals, AM Ford

Scope: 7 components plus the 3 shared string modules they render from (`src/lib/leads.ts`, `src/lib/smsConsent.ts`, `src/lib/supabase.ts`). Every string below is quoted verbatim from source.

---

# A. Banned-list violations (PRODUCT.md lines 96 to 99)

**Banned words** (`unmatched`, `premier`, `world-class`, `best-in-class`, `unbeatable`, `number one`, `lowest price`): **zero hits.** Clean across all 7 files.

**Banned generic anchors** (`learn more`, `read more`, `click here`): **zero hits.** Clean. Anchor text in use is specific: `"text us right now"`, `"Terms of use"`, `"Terms and conditions"`, `"Privacy policy"`.

**Banned punctuation: 15 violations.**

| File:line | String | Mark |
|---|---|---|
| `ChatWidget.tsx:41` | `"...including credit-rebuild programs — approvals happen at every credit level."` | em dash |
| `ChatWidget.tsx:46` | `"Most trades at AM Ford appraise higher than owners expect — plus a $500 bonus on top right now."` | em dash |
| `ChatWidget.tsx:278` | `"Absolutely — which one are you looking at?"` | em dash |
| `ChatWidget.tsx:321` | `"Good news — it's in stock as of today."` | em dash |
| `ChatWidget.tsx:37` | `"Hi! You're chatting with AM Ford in Jefferson, OH."` | exclamation |
| `ChatWidget.tsx:111` | `"Done!"` | exclamation |
| `ExitIntentOffer.tsx:170` | `"Before you go — put this toward any car in stock"` | em dash |
| `ExitIntentOffer.tsx:206` | `"Drop your number and we'll text you the voucher — no obligation."` | em dash |
| `TradeValuatorModal.tsx:29` | `{ label: "30–60k" }` | en dash |
| `TradeValuatorModal.tsx:30` | `{ label: "60–100k" }` | en dash |
| `TradeValuatorModal.tsx:188` | lead body: `` `Estimate shown: $${lo}–$${hi}` `` | en dash |
| `TradeValuatorModal.tsx:315` | on-screen estimate: `${lo} – ${hi}` | en dash |
| `OTPPopup.tsx:655` | `"Thanks, {name} — a specialist is preparing your price now."` | em dash |
| `OTPPopup.tsx:641` | `"Request Received!"` | exclamation |
| `LeadCaptureModal.tsx:159` | `"Request Submitted!"` | exclamation |

Plus two in shared modules that reach customers:
- `supabase.ts:72` `"Our online form is temporarily unavailable. Please call or text us at (440) 998-2151 — we answer fast."` (em dash) — this renders in **every** surface as `res.message`.
- `supabase.ts:91` `"Your inquiry has been submitted! We will reach out promptly."` (exclamation) — dead string, see D3.

---

# B. P0 findings: copy that is false, unverifiable, or breaks a promise

### B1. ChatWidget presents a scripted bot as a live human, with no disclosure
`ChatWidget.tsx:37` `"Hi! You're chatting with AM Ford in Jefferson, OH. What can we help with today?"`, header `:404` `"Typically replies in minutes"` beside a pulsing green `bg-emerald-400` presence dot `:402`, launcher aria-label `:377` `"Chat with AM Ford"`, and `TypingDots` simulating composition for `TYPING_MS = 650`. There is no free-text input at all: the visitor can only click 4 chips. Nothing anywhere says this is automated. The presence dot, the "replies in minutes" claim, and the fake typing indicator are three independent signals of a live agent who does not exist. **Missing entirely: any "automated assistant" disclosure.**

### B2. ChatWidget asserts inventory availability it never checks
`ChatWidget.tsx:321` `"Good news — it's in stock as of today. Want me to have a specialist confirm and hold it for you?"` — fires unconditionally for any vehicle picked, with no data lookup. It then contradicts itself by offering to "confirm" what it just asserted, and offers to "hold it", a mechanism that does not exist in the codebase. Violates Principle 1 ("Never advertise what the lot cannot deliver").

### B3. ChatWidget fabricates statistics and promises approval
`ChatWidget.tsx:40-43` `"We work with 12+ lenders including credit-rebuild programs — approvals happen at every credit level. A soft pull takes 60 seconds and won't affect your score. Want a specialist to text you the next steps?"`
- `"12+ lenders"` — fabricated statistic (PRODUCT.md line 102: never fabricate statistics).
- `"approvals happen at every credit level"` — reads as a guarantee of approval. Requires management approval and is the single riskiest sentence in the financing copy.
- `"A soft pull takes 60 seconds and won't affect your score"` — specific unverified claim.

`ChatWidget.tsx:45-47` `"Most trades at AM Ford appraise higher than owners expect — plus a $500 bonus on top right now. Fastest path: our 60-second valuator, or a specialist can call you."`
- `"Most trades ... appraise higher than owners expect"` — fabricated statistic with no source.
- `"60-second valuator"` — the valuator it links to is a 6-step wizard (`TOTAL_STEPS = 6`). Wrong on its face.

### B4. OTPPopup promises a price it never reveals, and gates a price already on screen
- `OTPPopup.tsx:108` `"Unlock Your Instant Price"`
- `:118` `"Please provide your contact information to reveal this vehicle's Instant Price"`
- `:582` CTA `"Unlock Instant Price"`
- Success `:641` `"Request Received!"` / `:654` `"Thanks, {name} — a specialist is preparing your price now."`

No price is ever revealed. The entire value exchange the modal sells is not delivered. Worse, the sidebar renders `${formatListPrice(carData.price)}` at `:144-146` in gold, **in the same modal**, so the copy asks the visitor to unlock a number visible three inches away. `"Instant Price"` is also dealer jargon that means nothing to a buyer.

Related dead promise: the component declares `type Step = "form" | "otp" | "success"` (`:161`), holds `const [otp, setOtp] = useState(["","","","","",""])` (`:181`) and `otpRefs` (`:187`), and the handler is named `handleSendOTP` (`:204`) — but **no `step === "otp"` branch is ever rendered**. There is no verification step. The name of the entire component describes a flow that does not exist.

### B5. OfferPopup displays a fabricated 5-star rating
`OfferPopup.tsx:267-269`:
```jsx
<div className="stars" aria-hidden>
  <span></span>★★★★★<span></span>
</div>
```
Five filled stars with no source, no count, no attribution, rendered directly under the `$500 OFF` headline where it reads as a dealership rating. PRODUCT.md line 102 bans fabricated review counts and testimonials outright. `aria-hidden` removes it from screen readers but it is fully visible, which is where the claim lands.

### B6. LeadCaptureModal has no consent copy at all, and makes an absolute privacy claim it cannot keep
This is the only capture surface with **zero TCPA consent**: no checkbox, no disclosure, no `CONSENT_TEXT`, no `SMS_CONSENT_DISCLOSURE`, no terms link, no privacy link. It collects name, email, phone, date and time, and submits. Every other surface on the site has consent.

In its place, `:366-368`:
> `"Your information is confidential and will never be shared with third parties."`

`"never be shared with third parties"` is an absolute, unverifiable promise. The lead goes to Supabase (a third party) and financing leads by definition go to lenders. This is worse than having no privacy copy.

### B7. Two incompatible consent standards run side by side
`convert/*` renders `CONSENT_TEXT` (`leads.ts:5-7`):
> `"I agree that AM Ford may contact me by phone or text at the number provided about my inquiry. Consent is not a condition of purchase. Msg & data rates may apply. Reply STOP to opt out."`

`popups/*` renders `SMS_CONSENT_DISCLOSURE` (`smsConsent.ts:13-14`):
> `"By submitting, you agree that AM Ford in Jefferson, OH may contact you. Message/data rates may apply."`

The popups version drops "consent is not a condition of purchase", drops the STOP opt-out, drops "by phone or text", and drops "at the number provided". It is also **passive** in `OfferPopup` (`:352-358`) and `TradeOfferPopup` (`:280-298`) — a paragraph, not a checkbox, so no affirmative act is recorded. `OTPPopup` at least uses a checkbox (`:539`). Three different consent postures across four modals.

Also: `smsConsent.ts:19-23` exports `SMS_MARKETING_CONSENT_DISCLOSURE`, `SMS_TRANSACTIONAL_CONSENT_DISCLOSURE`, and `TERMS_CONSENT_DISCLOSURE` as **aliases of the same string**. Marketing and transactional consent are legally distinct and are worded identically. `OTPPopup` and `TradeOfferPopup` both import all four and render one.

Missing privacy policy link: `OTPPopup` and `TradeOfferPopup` import `PRIVACY_POLICY_URL` and never render it. Only `OfferPopup` links it (`:403`).

### B8. Four conflicting $500 offers, one of which calls itself exclusive
| Surface | String |
|---|---|
| `ExitIntentOffer.tsx:167` | `"Exclusive online offer"` / `:175` `"One per customer · Valid on any in-stock vehicle at AM Ford"` |
| `OfferPopup.tsx:261-265` | `"$500" "OFF"` / `"Your new vehicle purchase"` (no terms at all) |
| `TradeOfferPopup.tsx:176-186` | `"$500 MORE FOR YOUR TRADE*"` / `"Cannot be combined with any other discounts or promotions."` |
| `TradeValuatorModal.tsx:321` | `"+ $500 AM Ford trade bonus on top when you trade toward any vehicle in stock"` |

`"Exclusive"` is false when the same $500 appears on three other surfaces. `TradeOfferPopup` says the $500 cannot be combined with other promotions; `TradeValuatorModal` says the $500 stacks "on top". A buyer who sees both is told opposite things. `OfferPopup` carries no terms, no exclusions, and no expiry on any of the four.

### B9. ExitIntentOffer promises a voucher that no system issues
`:191-193` `"Your $500 voucher is locked in"` and `:206` `"Drop your number and we'll text you the voucher"`. Nothing generates a voucher, code, or expiry. The lead body is `` `Exit-intent $500 offer claim from ${window.location.pathname}` ``. `"locked in"` asserts a binding state that does not exist.

### B10. TradeValuatorModal CTA contradicts its own disclaimer
CTA `:538` `"Reveal My Trade-In Value"`, step heading `:80` `"Your estimate is ready"`, subhead `:476` `"Tell us where to send it and we'll unlock your estimate"`.

The disclaimer directly below (`:323-327`) says:
> `"Rough starting range based on age, mileage, and condition only. It does not read your make or model, so it is not a valuation and not an offer. The real figure comes from an appraisal."`

The disclaimer is genuinely excellent and is the best-written copy in the whole set. But the CTA sells "**Your** Trade-In **Value**", the heading calls it "**your estimate**", and the modal title is `"Trade-In Value Estimator"` (`:248`) — all three assert exactly what the disclaimer retracts. The `"unlock"` / `"Unlocking your estimate..."` (`:538`) gating metaphor also implies the number is being fetched from somewhere, when `computeEstimate` runs locally with no network call.

Also `:476` `"Tell us where to send it"` is false: the estimate is not sent anywhere, it is revealed on screen.

---

# C. CTA audit: every generic Submit / Send / OK / Close

| File:line | CTA string | Verdict |
|---|---|---|
| `TradeOfferPopup.tsx:276` | **`"Submit"`** | **Flagged.** Banned generic. Names nothing. Should name the outcome, e.g. "Get my trade value". |
| `TradeOfferPopup.tsx:276` | **`"Submitting..."`** | **Flagged.** Loading state inherits the same non-outcome. |
| `LeadCaptureModal.tsx:381` | **`"Submit Request"`** | **Flagged.** One generic CTA serves 4 different modes (test drive, quote, special order, pre-approval). Should switch with `mode`, e.g. "Book my test drive" / "Send me a price". |
| `LeadCaptureModal.tsx:378` | **`"Submitting..."`** | **Flagged.** |
| `ChatWidget.tsx:189` | **`"Send my number"`** | **Flagged.** Names the mechanic, not the outcome. The visitor gets a callback, not a delivered number. |
| `ChatWidget.tsx:186` | **`"Sending..."`** | **Flagged.** |
| `QuickEnquiryModal.tsx:293` | **`"Sending..."`** | **Flagged.** The three real CTAs are good (below) but the loading state discards the outcome the CTA just named. |
| `OfferPopup.tsx:363` | **`"Sending..."`** | **Flagged.** Same problem: "Claim my $500 off" becomes "Sending...". |
| `OTPPopup.tsx:579` | **`"Please wait"`** | **Flagged.** Says nothing about what is happening or how long. |
| `OfferPopup.tsx:236` | **`"Close"`** (success) | **Flagged.** Dismiss-only after a conversion; no next step offered. |
| `TradeOfferPopup.tsx:155` | **`"Close"`** (success) | **Flagged.** Same. |
| `QuickEnquiryModal.tsx:195`, `TradeValuatorModal.tsx:339`, `ExitIntentOffer.tsx:200`, `LeadCaptureModal.tsx:170`, `OTPPopup.tsx:711` | **`"Done"`** ×5 | **Flagged (lower).** Acceptable as a dismiss, but five success screens all end in a dead end. None offers "Browse inventory", "Call now", or "Text us" as a next action. Only `QuickEnquiryModal:182-187` keeps a live channel (`"text us right now"`) on its success screen. |
| `TradeOfferPopup.tsx:273` | **`"Not Interested"`** | **Flagged.** Confirmshaming-adjacent: the decline is phrased as a statement about the customer, at equal visual weight to the submit button. Should be "Close" or "Maybe later". |
| `OfferPopup.tsx:422` | **`"No thanks"`** | **Flagged (lower).** Styled in `#b91c1c` red with `fontWeight: 700`, i.e. the decline is painted as an error. |

**Good CTAs, keep as-is:** `QuickEnquiryModal` presets `"Ask now"` / `"Request video"` / `"Start watching"` (`:36,45,53`), `ExitIntentOffer:285` `"Claim my $500"`, `OfferPopup:363` `"Claim my $500 off"`, `OTPPopup:582` `"Unlock Instant Price"` (well-formed, but see B4 — it names an outcome that never arrives), `TradeValuatorModal:398,437` `"Next"`.

---

# D. Missing error and success states

### D1. Silent validation failure: TradeOfferPopup
`:99-110`:
```js
if (!firstName.trim()) errors.push("firstName");
if (phone.length < 12) errors.push("phone");
if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("email");
if (errors.length > 0) {
  setInvalidFields(errors);
  setTimeout(() => setInvalidFields([]), 410);
  return;
}
```
**No message is ever set.** The only feedback is a CSS class `is-invalid` that self-clears after 410 milliseconds. A visitor who submits with a short phone number sees a red flash and nothing else, then the form sits there. There is no `role="alert"`, no text, no persistent state. This is the most severe missing-error-state in the audit.

### D2. Near-silent validation failure: OTPPopup
`:208-224`: same pattern, same 410ms self-clearing flash for `firstName`, `phone`, and `email`. Only the consent branch gets a string:
> `:221` `"Please tick the consent box so we can send your price."`

So an empty first name or a 3-digit phone produces no words at all. Two further issues with the one message that exists: `"tick"` is British English for a US audience (should be "check"), and `"so we can send your price"` repeats the B4 promise that is never kept.

Also `:258` fallback `"Something went wrong"` — generic, no recovery path, and inconsistent with every other error in the codebase, which hands over `(440) 998-2151`.

### D3. The shared success message is dead code
`supabase.ts:89-92` returns `message: "Your inquiry has been submitted! We will reach out promptly."` on success. **No component renders it** — all seven write their own success copy. It carries a banned exclamation mark and `"promptly"` (vague), and it is the string a future integration would most likely surface. Either delete it or fix it.

### D4. Vague or conflicting success promises
| Surface | Success copy | Problem |
|---|---|---|
| `leads.ts:10-11` (`RESPONSE_PROMISE`, used by all 4 `convert/*`) | `"Expect a call or text within 15 minutes during business hours (Mon to Sat)."` | Best of the set. But applied unchanged to the `price_watch` preset, where the customer asked to be alerted **if the price changes**, not called in 15 minutes. Wrong promise for that flow. |
| `OTPPopup.tsx:657` | `"Expect a call or text within 15 minutes during business hours."` | Hardcoded duplicate of `RESPONSE_PROMISE` with `"(Mon to Sat)"` dropped. Will drift. |
| `OfferPopup.tsx:230-232` | `"Your $500 off voucher request has been submitted. A member of our team will contact you shortly."` | `"shortly"` is vague and contradicts the 15-minute promise made elsewhere on the same site. |
| `TradeOfferPopup.tsx:149-152` | `"Your trade value request has been submitted successfully. A representative will contact you shortly."` | `"successfully"` is redundant filler. `"shortly"` again. Never says the customer will receive a trade value, which is the one thing the popup promised. |
| `LeadCaptureModal.tsx:160-164` | `"Thank you, {name}. A representative from AM Ford in Jefferson, OH will reach out to you shortly via phone ({phone}) or email."` | `"shortly"` again. Echoing the phone number back is good; no timeframe is not. |
| `ChatWidget.tsx:111` | `"Done!"` | Says nothing about what was done. Banned exclamation. |
| `OTPPopup.tsx:641` | `"Request Received!"` | Contradicts the CTA `"Unlock Instant Price"`. Banned exclamation. |
| `LeadCaptureModal.tsx:159` | `"Request Submitted!"` | System-centric ("submitted" is what the form did, not what the customer gets). Banned exclamation. |

Four different response-time promises on one site: "within 15 minutes (Mon to Sat)", "within 15 minutes", "shortly" ×3, "promptly", plus `ChatWidget:404` "Typically replies in minutes" and `OfferPopup:394` "Fast response".

### D5. Errors are not announced to assistive tech
`role="alert"` present: `ExitIntentOffer:211`, `OfferPopup:335`, `TradeOfferPopup:266`.
`role="alert"` **missing**: `QuickEnquiryModal:222`, `TradeValuatorModal:328` and `:480`, `ChatWidget:179`, `OTPPopup:509`, `LeadCaptureModal:237`. Six error regions render silently for screen reader users. None of the eight uses `aria-describedby` or `aria-invalid` to tie the message to the offending field.

### D6. Disabled submit buttons with no explanation
`QuickEnquiryModal:285`, `ExitIntentOffer:274`, `TradeValuatorModal:535`, `ChatWidget:182` all render `disabled={!consent || submitting}`. A visitor who fills the form and skips the checkbox sees a 40 to 50 percent opacity button that does nothing, with **no text explaining why**. No helper text, no on-click hint. `OTPPopup` is the only surface that tells the visitor the consent box is the blocker.

### D7. Unreachable validation copy
`LeadCaptureModal:78-81`:
```js
if (!fullName || !email || !phone) {
  setErrorMessage("Please fill in your name, email, and phone number.");
```
All three inputs carry `required`, so the browser blocks submission first and this branch is close to unreachable. When it does fire it names all three fields rather than the missing one. There is also **no email format validation anywhere** in this modal, so `"a@b"` passes and the lead is uncontactable by email.

---

# E. Missing, unclear, or jargon labels (per field)

### `OTPPopup.tsx` — all six labels are orphaned
`:334`, `:363`, `:392`, `:423`, `:457`, `:486` render `<label style={...}>First Name *</label>` as a **sibling** of the input, with no `htmlFor` and no `id` on the input. Not one field label is programmatically associated. Every input also has `placeholder=""` (`:349`, `:377`, `:438`, `:472`), so there is no format hint anywhere:
- `"First Name *"` / `"Last Name"` / `"Phone *"` / `"Email"` — the asterisk convention is never explained (no "* required" legend).
- `"Preferred Contact"` (`:401`) — unclear. Preferred contact *method*? *Time*? Options are `Text` / `Call` / `Email`, so the label should be "How should we reach you?".
- `"Comments"` (`:495`) with placeholder `"Any additional info..."` — both generic. Nothing tells the buyer what would actually help (trade-in, timing, financing).
- `"Selected Vehicle"` (`:141`) — system language. And the default `carData.title` is `"2025 Ford Vehicle"` (`:190`), a placeholder shown to the customer as their selection.

### `TradeValuatorModal.tsx` — six data inputs, zero labels
The only `<label>` in the file is the consent checkbox (`:519`).
- Step 3 model input (`:383-391`): no label, no `aria-label`. Placeholder `"e.g. F-150, Silverado, RAV4"` is the only hint and it disappears on typing. It also carries `required` (`:385`) while sitting **outside any `<form>`** until step 6, so the attribute is inert.
- Step 4 mileage input (`:404-413`): no label, no `aria-label`. Placeholder `"e.g. 45000"`. Same inert `required`.
- Step 6 name (`:492-499`): **placeholder-as-label**, `placeholder="Name (optional)"`.
- Step 6 phone (`:506-515`): **placeholder-as-label**, `placeholder="Phone number *"`. The required marker lives in a placeholder that vanishes the moment the field is used.
- `"How many miles on it?"` (`:78`) is good plain copy; the chips beneath it use banned en dashes (`"30–60k"`, `"60–100k"`).
- Condition blurbs (`:36-41`) are genuinely good and non-judgmental: `"Looks & runs like new"`, `"Normal wear, no major issues"`, `"Some cosmetic/mechanical needs"`, `"Significant repairs needed"`.

### `TradeOfferPopup.tsx`
Labels wrap their inputs correctly (`:197-262`), which is the right pattern. But:
- No placeholders and no format hints on any field. Phone is pre-seeded `"+1"` (`:50`) with nothing telling the visitor what to type next.
- `"Preferred Contact"` (`:225`) — same ambiguity as OTPPopup.
- The form has **no heading and no intro sentence**. The visitor sees a `$500` graphic and four bare fields with no statement of what submitting does or what they receive.
- `alt="Trade-in vehicle"` (`:189`) on a specific stock photo — generic alt for an image that is decorative.

### `ChatWidget.tsx`
- Phone input (`:159-169`) has `aria-label="Phone number"` but **no visible label**; `placeholder="(440) 555-0199"` is the only sighted hint.
- `"Best number for a quick call or text?"` (`:156-157`) — good, conversational, keep.
- Chip `"Financing with imperfect credit?"` (`:31`) — see F1.
- Teaser `"Questions? We answer fast"` (`:352`) — generic and an unverifiable speed claim.

### `LeadCaptureModal.tsx`
- All four labels are bare `<label>` with **no `htmlFor`** (`:246`, `:263`, `:281`, `:301`, `:344`); only the Preferred Time select (`:316-321`) is wired correctly. Same orphan-label defect as OTPPopup.
- `"Request E-Price Quote"` (`:136`) — **dealer jargon.** "E-Price" is meaningless to a buyer.
- `"Request Special Vehicle Order"` (`:137`) / chip `"Special Order"` (`:233`) — jargon; a buyer would say "order one from the factory".
- Mode mismatch: the header handles four modes including `"Get Pre-Approved Online"` (`:137`), but the chip row (`:198-235`) exposes only three. A visitor who opens in `financing_preapproval` and taps any chip **can never get back**, and the CTA still reads "Submit Request".
- `"Trade-In & Offer Details (Optional)"` (`:346`) — `&` in a label, and "Offer Details" is ambiguous (the dealer's offer? the customer's?).
- `"Additional Questions or Notes"` (`:349`) with placeholder `"Tell us what you're looking for..."` — the label and placeholder ask for different things.
- Placeholder `"John Doe"` (`:256`) — filler name. Also in `QuickEnquiryModal:266` and `ExitIntentOffer:232`.

### `OfferPopup.tsx`
- Labels correctly wired with `htmlFor` (`:277`, `:291`, `:305`, `:319`). Best-labelled form in the set.
- All four fields are `required` but **none is marked** as such in the label text. Inconsistent with every other surface, which marks required with `*`.
- `"Your new vehicle purchase"` (`:265`) — sentence fragment under `$500 OFF`; states no condition, no eligibility, no expiry.
- Trust row (`:371-395`): `"Secure"`, `"No obligation"`, `"Fast response"` — three unverifiable one-word claims. "Secure" says nothing about what is secured.
- `"We respect your privacy"` (`:407`) — filler that adds nothing next to the actual privacy policy link two lines above it.

### `QuickEnquiryModal.tsx` — strongest of the set
Real labels with `htmlFor` and matching `id` (`:229-234`, `:252-257`), format-bearing placeholders, an optional field explicitly marked `"Name (optional)"` (`:256`), the pre-written question shown verbatim before sending (`:218-220`), and a live fallback channel on both the form and the success screen (`"text us right now"`, `:186`, `:307`). Remaining issues: `"Phone Number *"` asterisk unexplained, `"John Doe"` placeholder, missing `role="alert"`, and the `price_watch` success promise mismatch (D4).

---

# F. Shame framing and the credit-rebuilding commitment

PRODUCT.md line 22-23 and line 147-148 make non-judgmental financing copy an inclusion commitment, not a preference.

### F1. `ChatWidget.tsx:31` puts a deficit label in the customer's own mouth
```js
{ label: "Financing with imperfect credit?", flow: "financing" }
```
Two problems. First, `"imperfect credit"` is deficit framing: it defines the visitor by a flaw. It is softer than "bad credit" but it is the same move. Second, `startFlow` calls `sendUser(label)` (`:276`), so the chip renders as a **blue user bubble on the right** — the interface makes the visitor appear to have said "Financing with imperfect credit?" about themselves, in a transcript, in a public-feeling chat. That is the exact self-labelling the brief forbids.

The internal lead body repeats it: `:291` `message: "Chat: financing question (imperfect credit)"`. This string reaches the CRM and could be read back to the customer by a salesperson.

Recommended reframe (situation, not person): `"What are my financing options?"` or `"Can I get financed?"`.

### F2. The word `"credit-rebuild"` is used well
`ChatWidget.tsx:41` `"credit-rebuild programs"` is correctly framed as a program the dealership offers, not a label for the buyer. Keep this construction and apply it to the chip. (The rest of that sentence still fails on B3.)

### F3. Nothing else in the seven files uses shame framing
No hits for `bad credit`, `poor credit`, `credit challenged`, `no credit`, `subprime`. The condition selector in `TradeValuatorModal` (`"Rough"` / `"Significant repairs needed"`) describes the vehicle, not the owner, and reads as neutral. `TradeValuatorModal`'s disclaimer is a model for the tone the brief asks for.

### F4. Two decline buttons frame the customer negatively
`TradeOfferPopup:273` `"Not Interested"` and `OfferPopup:422` `"No thanks"` in red bold. Neither is severe, but on a site whose brief calls for a non-judgmental tone, making the visitor click a self-characterising negative is the wrong default. `"Close"` or `"Maybe later"` costs nothing.

---

# G. Priority order

**Fix before ship (P0):** B1 bot disclosure, B2 fabricated availability, B3 fabricated stats and approval promise, B4 unfulfilled price promise, B5 fabricated stars, B6 missing consent + false privacy absolute, D1 silent validation.

**Fix next (P1):** B7 consent inconsistency, B8 offer conflicts, B9 phantom voucher, B10 CTA/disclaimer contradiction, D2 near-silent validation, D4 response-time conflicts, F1 shame framing, all `Submit`/`Send`/`Please wait` CTAs in section C.

**Cleanup (P2):** 15 punctuation violations in section A, orphan labels and placeholder-as-label in section E, D3 dead string, D5 `role="alert"`, D6 disabled-button silence, D7 unreachable validation, F4 decline buttons, `"John Doe"` placeholders, jargon (`"E-Price"`, `"Instant Price"`, `"Special Order"`, `"Preferred Contact"`).

**Files:**
`C:/Users/sahil/Downloads/velocity-craft-canvas-main/src/components/convert/ChatWidget.tsx`
`C:/Users/sahil/Downloads/velocity-craft-canvas-main/src/components/convert/ExitIntentOffer.tsx`
`C:/Users/sahil/Downloads/velocity-craft-canvas-main/src/components/convert/QuickEnquiryModal.tsx`
`C:/Users/sahil/Downloads/velocity-craft-canvas-main/src/components/convert/TradeValuatorModal.tsx`
`C:/Users/sahil/Downloads/velocity-craft-canvas-main/src/components/popups/OTPPopup.tsx`
`C:/Users/sahil/Downloads/velocity-craft-canvas-main/src/components/popups/OfferPopup.tsx`
`C:/Users/sahil/Downloads/velocity-craft-canvas-main/src/components/popups/TradeOfferPopup.tsx`
`C:/Users/sahil/Downloads/velocity-craft-canvas-main/src/components/site/LeadCaptureModal.tsx`
`C:/Users/sahil/Downloads/velocity-craft-canvas-main/src/lib/leads.ts` (`CONSENT_TEXT`, `RESPONSE_PROMISE`)
`C:/Users/sahil/Downloads/velocity-craft-canvas-main/src/lib/smsConsent.ts` (4 aliased disclosures)
`C:/Users/sahil/Downloads/velocity-craft-canvas-main/src/lib/supabase.ts` (3 error strings + 1 dead success string)