## Scores on the lens: distinctive, or a title + four inputs + a button?

---

### Concept 1 — THE VEHICLE — **8/10**

The only one of the three that does not reduce to a form at any point on desktop. The 280px rail is a second column with its own ground, its own ruled internals and its own foot, and the panel's silhouette (warm grey column, hairline, white column, one navy bar at the bottom) is legible as a shape before a word is parsed. That is the test and it passes it.

**Typography:** the only concept with four distinct registers doing four different jobs. 11px tracked micro eyebrow, 21px bold name with the trim dropped to `font-normal text-ink-3` inside the same line, 30px Archivo Expanded figure, then 13px hand-written prose at `leading-relaxed`. Four sizes, three colours, one width axis. That is a document.

**Photography:** decisively the best use. ~210px tall, full-bleed to three edges of the rail, on ink, with the condition chip at `left-3 top-3` exactly where `VehicleCard.tsx:117` puts it. I checked the card: the image ground is ink specifically because "a grey box on warm paper reads as a missing image; on ink it reads as a stage." Concept 1 is the only one that inherits that reasoning at a size where it matters. The dialog visually continues the card rather than citing it.

**Accent:** spent well on the price, then overspent. Count the navy in the `price` intent: the h2 figure, the submit fill, the `border-l-2 border-brand` on the programmes block, the `bg-brand-tint` behind it, and the phone link in the rail foot. That is five navy objects in a system that has one accent. The figure and the button are the two that earn it.

**Where it drops two points:** the entire concept is a desktop concept. At 375x812, the primary case, the rail becomes a 90px band, `SpecTable` goes `hidden sm:grid`, sellerNotes goes `hidden sm:block`, the delivery line and the phone go `hidden sm:block`. What remains is a header, an 88px thumbnail, a spec sentence, and a form. The §9 risk section is honest about this and its mitigation is a retreat ("if it scrolls, the band drops the photograph and becomes a 64px identity strip"). On the majority viewport this concept is roughly as distinctive as Concept 2 and less distinctive than Concept 3.

**Strongest single idea:** the two-sentence `sellerNotes` excerpt, split deterministically on `/(?<=\.)\s+/` rather than clamped. `sellerNotes` is on all six records and it is the only content in the entire dataset that a form generator could not have produced. No other concept touches it. Concept 2 explicitly rejects it. Putting a human sentence about *that specific truck* next to the field where you are about to write a human sentence back is the whole brief, answered with data that already exists.

Two errors while I am here. §9 says "two of the six records have no `msrp`"; it is three (records at `vehicles.ts:60, 90, 207` carry it, the other three do not), so the struck price and the green saving line are absent on half the fleet, not a third. And the `ModelEnquiryDialog` rail puts `model-*` cutouts on `bg-surface`, which is a 280px field of warm grey behind a cutout, precisely the failure the card's own comment warns about. Ink there too.

---

### Concept 2 — THE MESSAGE — **5/10**

The best product idea in the set and the weakest answer to this lens. Strip the prose and the anatomy is: a header band, one textarea, a grey block containing two inputs and a checkbox, a footer with two buttons. That is a title, three inputs and a button, with a warm-grey stripe. The two-ground split (white block A, `bg-surface` block B) is a real structural idea and it is the only thing here holding the panel's shape, but it is one hairline and one tint carrying the entire visual argument.

**Typography:** it throws away the one typographic signature the site owns. The price goes to `font-display text-ui text-ink`. I checked the scale: `--text-ui` is 0.9375rem. That is a 15px expanded figure in ink, sitting inside a `text-meta` description line as `$64,995 · 12 miles · New`. The codebase reserves Archivo Expanded for figures because "an extended cut earns its width on short strings where the wide forms read as weight." At 15px, in ink, in a dot-separated meta list, the width reads as nothing at all. You have paid for a second font file and rendered it invisible.

**Photography:** 64x48 in a white bordered frame, and 56x42 on mobile, with `alt=""`. It is a favicon of a truck. Defensible as a citation, indefensible as photography. Also note the frame is `bg-white` with `border-rule` around a studio cutout on a grey sweep, which is the exact combination the card avoids.

**Accent:** the single most timid spend of the three. Navy appears once, on an 11px uppercase kicker reading "Availability". Eleven pixels of the one accent, in a design system that gave you a 30px extended navy figure for free.

**A spec inconsistency worth catching before it ships.** §2 lists "a green dot and the word Open" as item four of the first three seconds. Nothing in the anatomy builds it. It exists only as `statusHint` on the phone `Field`, which renders as 13px grey text under an input, below the fold on mobile. The concept's own hero moment is not in the concept.

**Strongest single idea:** the pre-filled draft, and the payload inversion under it. `message: [visitor sentence, metadata line, consent stamp].join("\n")` with an `edited: message !== draft` flag appending `· draft not edited`. That fixes a real defect (today the sales desk reads `cfg.cta` and a price before it reads a human) and it anticipates its own failure mode. It is a better idea than anything in the other two documents. It is just not a visual one, which is what was being judged.

---

### Concept 3 — THE DEAL SHEET — **7/10**

The most *document*-like of the three and the second most distinctive. The "On this vehicle today" block is a ruled ledger: `border-t border-rule` on the list, `border-b border-rule` on each row, `text-ui font-semibold` label over `text-meta` detail over `text-micro tabular-nums` programme reference. That is three type sizes inside one row, hairlines doing the structure, and real PGM numbers in tabular figures. It looks like paper from a desk. In a design system literally called Ledger, that is the most on-brief thing anyone proposed.

**Typography:** strong, and correct about the one thing that matters most. It carries the price at `text-h2` in `font-display` navy, the same size and colour `VehicleCard.tsx` sets it at, so the number reads as carried over rather than re-typed. §2 names this and it is the sharpest observation in any of the three documents.

**Photography:** 96x72 on ink, correct ground, still a thumbnail. It is a stamp on a receipt, not a photograph. Between Concept 1's 210px and Concept 2's 48px, this is the compromise, and it reads as one.

**Accent:** worst spend of the three, in the opposite direction from Concept 2. `bg-brand-tint` washes the entire header, then navy also carries the eyebrow, the price, the `IconSavings` glyphs, the "Programme terms" link, the `ChoiceGroup` selected state, and the submit fill. Seven navy surfaces. The document defends the wash as "the only tinted region in the system's modal," which is self-justification, not restraint. One accent means the eye should land in one place.

**Why it is not the ship:** §9 dismantles it. All four `INCENTIVES` end 2026-08-31, seventeen days out. `msrp` is on three of six records, and `VehicleCard.tsx:56-60` already passes `showSaving={false}` on the homepage because the msrp values are not real numbers. So the ledger, the struck price and the green saving line, which is everything that distinguishes this concept, all render conditionally on data that is half-absent today and fully expired in a fortnight. What is left on 1 September is a tinted band drawing attention to empty space above a form. The mitigation is an operational one: someone has to key in the September programme sheet. A design whose distinctiveness has a maintenance calendar is not a design, it is a subscription.

**Strongest single idea:** `ChoiceGroup`. A `fieldset` and `legend` wrapping sr-only radios with `peer-checked:` labels, asking one question per intent: trade yes/no, monthly budget, which window suits. It makes the six intents structurally different rather than differently labelled, it costs one tap instead of a keyboard, it is one row of height on mobile, and real radios keep arrow-key navigation for free. It is also the honest answer to test drive scheduling: four rough windows commits to nothing the desk did not agree to, where a date picker implies calendar availability that does not exist.

---

## Ship Concept 1.

It is the only one that is not a form at full width, the only one using the single piece of unreproducible content in the dataset, and it spends the accent on the figure the site already made its signature. Ship it with five grafts.

**Graft from Concept 2:**

1. **The bottom-docked mobile panel, verbatim, including the `interactive-widget=resizes-content` viewport fix at `__root.tsx:137`.** This is the answer to Concept 1's stated one risk, and it is a better answer than Concept 1's own. Concept 1's mitigation is to measure the band and amputate the photograph if `availability` scrolls. Docking makes the amputation unnecessary: the footer pins to the bottom edge, the CTA never leaves the thumb rest, and the 90px band is paid for out of scroll rather than out of the submit button. Take Concept 2's `size="docked"` classes as written.
2. **The pre-filled draft, on the `enquiry` intent only.** Concept 1 already makes "Your question" required and first for `enquiry`, which is its single harshest ask: an empty required textarea above the name field. Replace the empty required textarea with Concept 2's draft as `value` and it becomes a sentence to approve. Take the payload inversion with it, unconditionally, on all six intents: human sentence first, metadata on line two, consent stamp last, plus the `edited` flag. That is a bug fix, not a concept choice.
3. **Quote the message back in the success state.** Concept 1's receipt is a `SpecTable` of Name and Phone. Add Concept 2's `border-l-2 border-brand bg-surface` quote block above it. Their own words are the most conversation-like element available and they cost nothing to render.

**Graft from Concept 3:**

4. **`ChoiceGroup`, replacing Concept 1's `test_drive` date-plus-select pair and its `finance` block.** Concept 1 proposes `<Input type="date">` with a Sunday check and a widened `QuickLeadInput`, which is real work to imply availability the system cannot confirm. Four windows is one tap, one row, and no lie. Keep Concept 1's `preferred_time` passthrough so the column stops being unreachable; drop `preferred_date`.
5. **`general_contact` as the `leadType` for `enquiry` and `availability`.** It is already in the union at `supabase.ts:25-30` and unused. Both concepts 1 and 2 keep filing those as `quote_request`, which makes the CRM's own type column lie. One word.

Also take Concept 3's `import.meta.env.DEV` `console.warn` when `activeIncentives(new Date())` returns empty. Concept 1 renders nothing in that case, which is correct behaviour and invisible failure. The warning makes it visible to the next developer instead of to the customer.

**Do not graft:** Concept 3's `bg-brand-tint` header wash, Concept 2's demotion of the price figure, Concept 3's live phone formatting during typing (Concept 2 is right that caret restoration on backspace is where those break; format on blur only).

**One correction to Concept 1 before build.** Trim the accent to two navy objects: the price figure and the submit fill. The rail's phone link goes `text-ink-2` with an underline rather than `text-brand`; the programmes block keeps its `border-l-2 border-brand` and drops the `bg-brand-tint`. And put the `ModelEnquiryDialog` rail cutouts on ink, not `bg-surface`, for the reason the card already documents.