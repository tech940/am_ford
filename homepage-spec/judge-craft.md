## Verification pass (three claims decide the scoring)

- **Concept 1 is right about the assets.** `src/assets/images.gen.ts` carries 13 keys; there is no `dealership` key and no `dealership.jpg` on disk. `am-ford-aerial`, `am-ford-lot-banner`, `am-ford-front-lot`, `interior`, `service` all exist and are unused.
- **Concept 2 is right about the two traps.** `validateInventorySearch` (`C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\routes\inventory.tsx`) accepts no `model` param — `q` is the only free-text hook, so `/inventory?q=Maverick` returns zero today. And 8 city pages exist (`ashtabula-oh`, `geneva-oh`, `conneaut-oh`, `austinburg-oh`, `madison-oh`, `chardon-oh`, `erie-pa`, `cleveland-oh`) behind a live `ford-dealer.$city.tsx` route.
- **Concept 3 is right about its own risk and wrong about the cities.** `dealerContent.ts` — the transcription of the live site — contains no delivery claim at all; `DELIVERY_CLAIM` lives only in `vehicles.ts`. So Concept 3 stakes the largest type on the domain on unconfirmed copy. Separately, both Concept 1 and Concept 3 render served markets as plain text on a stale assumption; that is eight real internal links thrown away.

---

## SCORES

### Concept 1 — "The Store" · **8/10**

The opening cannot be generated. An H1 that is a street address at 72px, with the second register carrying the delivery sentence, is not in any dealer template's vocabulary — templates open with a vehicle and a value proposition, and this opens with a location and a phone number. Two decisions carry real editorial weight: inventory demoted to fourth *with the cost stated*, and the mobile sticky CTA switched from "browse" to the phone once the store scrolls off. That second one is the highest-integrity move in the whole set — it expresses the angle as structure rather than as a sentence claiming someone answers.

Where it loses points, harshly: **section 08 is the banned triad with the icons filed off.** Four full-width rows, title left, body plus link right — service, trade, finance, commercial. Removing the icon does not change what an auditor sees, which is four parallel units of heading + paragraph + link. Section 03 is also four items, 07 is four rows, 06 is four groups. Four sections built on the number four is a generated rhythm even when each is individually defensible. Twelve sections at 6,840px is also one section-family too many for a page whose thesis is "one building, one phone number."

### Concept 2 — "lineup-first" · **7/10**

Split verdict. The spine is the best thinking in the set; the opening is the most template-like thing any of the three proposed. "The Ford lineup, Jefferson, Ohio" over a subhead over three search controls, with `hero-truck` bleeding off the right edge — that is the dealer hero, verbatim, in Ledger colours. It is defended as functional rather than as distinctive, which is an admission. Every visitor sees that viewport; the spine is 1,700px down.

S7 "The Three Errands" is the same failure as Concept 1's section 08 — three ruled bands of verbatim title + verbatim body + text link. It names the risk ("this is the section most at risk of becoming icon+heading+paragraph ×3, so it isn't that") and then is that, minus icons.

What pulls it back to 7: it is the only composition that closes the `q` trap before it opens, and S8 Commercial is a genuine competitive gap — no dealer homepage carries a commercial block, approved copy for it is sitting unused at `dealerContent.ts:115-119`, and it correctly refuses to attach an image because none of the 13 assets shows a commercial vehicle.

### Concept 3 — "distance-first" · **6/10**

It has the sharpest single typographic idea and the tightest page (8 sections, 5,170px), and it has the only stated accent budget I would sign: navy in exactly three places on the entire page — the search cell, the finance control, and price type. That is what makes an accent read as instruction rather than branding, and neither of the others commits to a number.

But it ships **"01 Choose online / 02 Finance and trade remotely / 03 Delivered or shipped / 04 Inspect on arrival."** That is a numbered how-it-works strip, the single most generated pattern in the DTC/dealer vocabulary. Deleting the icons does not save it; it is number + heading + sentence × 4 and it would be the first thing circled in an audit. A document that bans the triad in §4 and ships its numbered variant in §2 has a discipline problem, not a taste problem.

Then the two factual costs: it discards eight live city pages on a stale assumption, and it makes an unverified claim the largest type on the domain while stating that nothing on the page degrades gracefully if the claim is conditional. Naming the risk honestly is worth credit; building all eight sections on top of it anyway is not.

---

## STRONGEST SINGLE IDEA IN EACH

- **Concept 1 (picked):** the mobile sticky bar carrying the phone number instead of "browse inventory," gated on an IntersectionObserver against the store photograph. The angle is "a person answers"; the honest expression of that is making the number unavoidable, not writing a sentence asserting it.
- **Concept 2 (not picked):** the three-state lineup row — link to `/ford/{slug}` when `hasPage`, link to `/inventory?q={name}` **only after a matching record is proven**, plain ink-2 text plus an "Ask about it" lead trigger otherwise. It turns an editorial embarrassment (we sell 20, we stock 6) into a rendering rule that gets *better* as the feed grows, and the refusal that justifies it — "twenty cards means twelve empty cards; a typographic index degrades gracefully, a card grid advertises its own gaps" — is the most audit-proof sentence in all three documents.
- **Concept 3 (not picked):** the three-register H1 where "of Jefferson, Ohio" drops from 64px Expanded to 30px regular *inside the same heading element*, so subordination is done by weight rather than by colour, a kicker, or a second element. Paired with the ink well for studio cutouts — reasoned from the rule `VehicleCard` already established, not invented.

---

## SHIP

**Concept 1, with four grafts.**

The reason is asymmetry of graftability. A lineup index can be lifted into any composition; an opening viewport cannot, because the opening *is* the argument. Concept 1 owns the only first viewport of the three that an auditor could not have generated, and its weakest sections are precisely the ones the other two wrote better versions of.

Graft, specifically:

1. **Replace Concept 1's section 06 with Concept 2's S3 wholesale** — the four-column index, the three data-decided row states, the per-model count from `vehicles.filter(...)`, the "Ask about it" lead trigger with `pageSource="Homepage lineup"`, and the sentence *"Counts show what is on the lot today."* Keep Concept 2's rule that `LINEUP` stays hand-maintained and never derives from the feed. Drop Concept 1's `am-ford-new-bronco` photograph from that section — the index is the visual.
2. **Kill Concept 1's section 08 outright and rebuild it as Concept 3's §6 split.** One 12-column division with a vertical rule: service left with the `service` asset, trade right, both verbatim from `HOME_BLOCKS`. Two units side by side is a comparison; four units stacked is a template. Finance moves into the incentives section (07) as Concept 3 does, and commercial becomes Concept 2's S8 as its own short band on `--surface`.
3. **Adopt Concept 2's served-markets rule in section 11.** Link the 8 markets where `getServiceArea(slug)` resolves to `/ford-dealer/{slug}`; leave the other 21 as plain text. Same data-decided pattern as the lineup, applied to a second dataset — which is what makes it read as a system rather than as two coincidences.
4. **Take Concept 3's navy budget as a hard constraint on the whole page:** navy appears in the phone number, the single filled control, and price type. Nothing else. Concept 1 already commits to two navy marks in the first viewport; extend that policy to all twelve sections and write it into the section spec so it survives implementation.

Also apply on ship, from Concept 1's own analysis: per-section `<Suspense>` boundaries instead of the single one at `HomePage.tsx:70`, and the `PRICE_BANDS` clamp to the validator's $20k–$100k window before real sub-$25,000 used stock arrives.

**Do not ship any version until `DELIVERY_CLAIM`, `dealerInfo.phone` (flagged unverified in its own source), `dealerInfo.hours`, and "family-owned" are signed off.** All three concepts flag this; Concept 3 is the only one whose page collapses without it, which is the clearest argument against shipping Concept 3.