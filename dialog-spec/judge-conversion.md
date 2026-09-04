## Scores on the lens

**Concept 1 — "The Vehicle": 5/10**

It builds a document and then charges the form for it. At 375 with the keyboard open the doc itself budgets ~380px of usable height and spends ~90px of it (24%) re-showing a photograph and a price the visitor tapped past three seconds ago. Its own §9 admits this and says the mitigation is "measure it." That is a design betting its conversion on a build-time discipline that never survives contact with a feed.

The tap count is the real problem. It makes **name required on all six intents** and makes the message textarea **required on `enquiry`** — which is the default intent (`VehicleLeadDialog.tsx:99`, `intent = "enquiry"`). A blank required `rows={4}` textarea, positioned above the name field, is the single most expensive input in any of the three designs: it is free composition with no seed, on a phone keyboard, from someone who has not yet decided they trust you. A mildly reluctant rural buyer does not compose a paragraph. They close the panel.

`test_drive` compounds it with `<input type="date">` (a native wheel, ~3 taps) plus a `Select` (~2 more), and `trade` adds three text inputs. It removes email on five intents and then spends the savings four times over.

What it gets right and nobody should lose: the rail never re-renders through submit, so the panel physically cannot shrink at success; and it correctly refuses autofocus for exactly the right reason.

**Concept 2 — "The Message": 9/10**

Lowest tap count in the set, and it is not close. Phone, consent, Send. Three taps and one typed value. Name is demoted to optional, correctly justified against `leads.ts:56` where `submitQuickLead` already writes `"Not provided"` — the pipeline was built for a missing name and C1/C3 both block a lead over it anyway.

The prefilled draft is the move. It does not just save typing, it inverts the order of commitment: the visitor reads a sentence in their own voice about their truck *before* the panel asks for anything. By the time the phone field appears, there is already a message on screen that is theirs. That is the only mechanism in any of the three that addresses reluctance rather than decorating around it.

Three more things that directly protect submissions:
- Bottom-docked sheet with a pinned footer. Send is in the thumb rest and never scrolls away with the keyboard up. C1's centred panel puts the CTA below a scrolling body.
- `interactive-widget=resizes-content` on the viewport meta. Without it Chrome Android leaves the layout viewport full height and the docked footer sits *under* the keyboard. This is the kind of detail that costs 5% of mobile submits and appears in exactly one of the three documents.
- Open/closed status computed from `dealerInfo.hours`. The reluctant buyer's actual question is not "who gets my number," it is "will anyone actually call." This answers it with a fact.

Deductions: `sm:min-h-[26rem]` is a weaker anti-collapse guarantee than C1's structural rail. And its `finance` incentive block is not gated on `condition === "New"`, so it will print a Ford new-vehicle programme under a used truck.

**Concept 3 — "The Deal Sheet": 6/10**

Structurally the best mobile shell of the three (bottom sheet, pinned footer, `safe-area-inset-bottom`, `RESPONSE_PROMISE` directly above the CTA), wrapped around the worst field ordering for this buyer.

**Phone number is field one.** After a tinted band of money, the first thing the panel does is demand the one thing they are reluctant to give, before anything has been exchanged. It reads as a toll gate. C3 defends this as "being honest about what happens next," which is true and is also why it converts worse.

Then it adds ~228px above the fields on the `price` intent (172px ledger + 56px stance line) and its own vertical budget comes to 868px in an 812px viewport, before the keyboard. Name is required again. The `finance` chips ask a rural buyer to self-select a monthly budget bracket in public, which is a qualifying question dressed as a convenience.

And §9 is fatal on its own terms: all four `INCENTIVES` end 2026-08-31. In seventeen days the strongest block in the dialog renders nothing and the design degrades to "a price figure over a form, with a tinted band drawing attention to the empty space."

## Single strongest idea in each

- **C1 (would not ship):** the immutable rail. One node owns the panel's height and does not re-render across submit, so the success-state collapse is not fixed, it is made structurally impossible. Every other solution to that defect is a `min-height` guess.
- **C2 (ship):** the message is field one and it is already written. It removes the only free-composition cost in the system and buys commitment before the phone ask.
- **C3 (would not ship):** `ChoiceGroup` — one tap replaces a keyboard. The per-intent question that actually changes the callback ("When suits?" / "Trade, yes or no?") answered without the keyboard ever appearing.

## Ship Concept 2. Graft these, in order.

**1. `<form noValidate>` (from C1). Non-optional, do this first.** C2 makes name optional via `required={false}`, but `Field.tsx:103` sets `required` on every control it wraps. Without `noValidate` the native browser bubble fires on the empty name field and blocks the submit — C2's headline friction saving silently does not exist, and the failure is an unstyled OS tooltip. Also take C1's rule that on validation failure focus moves to the first invalid control.

**2. C3's `ChoiceGroup`, on `test_drive` and `trade` only.** Placed below the message field, optional, always. Not on `price` and not on `finance`; the budget-bracket question stays cut. This is the one place C2's "one layout, six drafts" purity costs a real tap: "When suits? This week / Next week / Weekend / Evening" is one tap versus typing a sentence, and it is the answer the desk needs anyway.

**3. C1's `QuickLeadInput` widening, fed by graft 2.** `preferredTime?: string` through to `preferred_time`. The columns already exist at `supabase.ts:35-36`. C3's chip windows plus C1's payload widening gives structured test-drive data for one tap and no calendar lie. C2 deferred this because a *picker* implies live availability; four rough windows do not.

**4. C3's `RESPONSE_PROMISE` in the footer, above the CTA.** `text-meta text-ink-3`, directly over the button. "A call or text within 15 minutes" is worth more one line above the commit than three lines into a success screen the reluctant buyer has not reached yet. C2 spends it only on success; that is the wrong moment.

**5. C3's `condition === "New"` gate on every incentive render.** C2's finance block calls `activeIncentives()` unconditionally. Ford new-vehicle programmes do not apply to used stock and printing one under a used truck is the same class of defect as the mis-attributed vehicle this component exists to prevent.

**6. C1's receipt rows on success, merged with C2's phone echo.** C2 already prints the number back, which is the load-bearing half. Add vehicle and, when supplied, name, as a two or three row `SpecTable`. The ten seconds the panel is still open is the only window a mistyped digit gets caught, and a mistyped digit is a lead that reports as converted and never converts.

**7. Hold C2's mobile ceiling to a testable rule, borrowed from C1's §9 discipline:** at 375x812 with the keyboard open, on every intent, phone + consent + Send must be reachable with zero scrolling. If the identity strip is what breaks it, the strip drops the thumbnail before the form drops anything.

**Do not graft:** C1's rail (it is the right idea for a desktop document and the wrong 90px on the phone that matters), C1's required name, C1's required enquiry textarea, C3's phone-first ordering, C3's deal ledger, C3's finance budget chips.

**Shared bug fixes all three found, all real, all confirmed in the repo:** the duplicated call-us sentence (`VehicleLeadDialog.tsx:161-164` appends its own copy of what `supabase.ts:44` already ends with); the machine-first message payload at `VehicleLeadDialog.tsx:153-154` that makes the desk read a robot before a human; `leadStorageConfigured` checked at render rather than at submit, with `smsLink()` (`leads.ts:81`, currently dead code) as the fallback; the 36px close button; `Field.tsx:60` label at `text-ink-3`. Plus the em dash in `leads.ts:83` and `:84`, which C2 alone caught and which violates the copy rule in the one string that gets sent to the customer's own SMS app.