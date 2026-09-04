## Scores on the lens

**Concept 1 "The Store" — 6/10**

Mobile first viewport: nav 60 + lot photo 280 + address H1 at 40px over three lines (~120) = 460 of ~660 usable pixels spent before a single commercial word. The filled action lands at ~640, and the search controls are in the next section. That is the most wasted first viewport of the three, and it is wasted on the one question a rural buyer does not have. Nobody in Ashtabula County arrives at amfordashtabula.com asking where Jefferson is. The photograph and the address are answers to a trust question that a returning local already has, and the shopper who does not have it (the Cleveland or Erie visitor) reads a one-building lot in a town of 3,000 as a reason to leave. The concept's own §3 concedes it: "A visitor whose primary need is a 900-unit selection is not a visitor this composition wins."

What saves it from lower is the phone. Making `dealerInfo.phone` the persistent mobile sticky action once the store scrolls away is the single highest-converting mechanic on any of the three sheets for this market. Rural Ford buyers call. But you do not need to spend the whole masthead to earn that sticky bar.

Also: 7.6 viewports desktop, and a 2,340px mobile inventory section. Longest page, latest actions.

**Concept 2 "lineup-first" — 8/10**

Highest lead yield, and it is not close. State C ("Ask about it" opening `VehicleLeadDialog` pre-filled with the model, `pageSource="Homepage lineup"`) converts the single biggest weakness in the data (12 of 18 unique models have no page and no unit) into a lead form instead of a bounce. Every other composition renders those twelve models as dead ink-2 text. Concept 2 is the only one that gets paid for not having a Maverick on the lot, which is exactly the condition a rural single-point store lives in.

Second, the navigation model is right for the device. A ruled index of model names as an accordion is a list of 44px tap targets that costs no images and no layout shift. Truck buyers shop by name, not by facet. On a 375px screen, a name list beats a card grid every time.

Costs: the mobile primary action sits at ~700px by its own arithmetic, which is below the fold on any phone once browser chrome is counted. And "The Ford lineup, Jefferson, Ohio." is the weakest headline of the three. It is honest, it is verifiable, and it tells the visitor nothing they did not know from the wordmark 56px above it. S2, an 88px band holding only `PRICING_STANCE`, is a whole scroll spent on six words.

**Concept 3 "distance-first" — 7/10**

Wins the first-viewport question outright. Mobile order is type, search band, then photograph, with the filled navy Search cell at y≈560 inside a 667px viewport. Zero image tax above the fold, and the photo positioned as the reward for the first scroll is the correct mobile call that the other two both get wrong. Shortest page at 5.7 viewports, eight sections.

But on lead volume from *this* buyer it is aimed at the wrong person and says so: it makes "Free home delivery within 300 miles" the largest type on the domain for a market whose densest lead source lives eight minutes up SR-46. It also spends the whole page on the one claim that is not in `dealerContent.ts` at all. I checked: `DELIVERY_CLAIM` exists only in `vehicles.ts` sourced from the brief, and `dealerContent.ts`, the transcription of the live site, has no delivery claim anywhere. Concept 3's own risk section names this and it is correct that nothing degrades gracefully if the radius turns out conditional. And its lineup section renders every `hasPage: false` model as plain text with "no hover, no cursor change" — twelve dead ends, no lead path.

## Strongest single idea in each

- **Concept 1:** the mobile sticky CTA gated on an IntersectionObserver against the masthead, carrying the phone number rather than "browse". The angle expressed as structure instead of as an unverifiable sentence claiming someone answers.
- **Concept 2:** state C. `hasPage: false` and no matching unit produces a lead dialog, not a dead link and not a fake one. It is the only mechanic on any sheet that monetizes missing inventory.
- **Concept 3:** the mobile stack order. Type, then the full search band with its filled cell, then the photograph. The primary action clears the fold on a 667px viewport because nothing decorative is allowed above it.

## Ship

**Concept 2, with four grafts.** It is the only composition whose spine is the thing the visitor came to do (pick a Ford) and the only one with a lead path for the fourteen models the lot does not hold.

Grafts, specific:

1. **Concept 3's mobile masthead order into S1.** Move `hero-truck` below the type and below all three controls on <768. Kill the 220px image tax. The filled "Search inventory" then lands around y≈540 instead of ~700. This is the single highest-value change on the sheet and costs one flex-order rule.
2. **Concept 1's phone sticky bar.** `MobileStickyCTA.tsx` already exists in `src/components/site/`. Gate it on S1 leaving the viewport and load it with `dealerInfo.phoneHref`, not with a browse link. Also add Concept 1's computed `OPEN TODAY` row against `dealerInfo.hours`, which renders "Closed today" on Sunday. A phone CTA that dials into a closed store on Sunday afternoon burns the lead.
3. **Delete S2 and demote Concept 3's thesis into the masthead.** `PRICING_STANCE` becomes a meta/13px line directly under the search button. `DELIVERY_CLAIM` verbatim becomes the second standfirst sentence at body/17px. Both audiences are then answered in the first viewport, delivery is ranked correctly as a supporting fact rather than as the argument, and you recover an 88px scroll.
4. **Concept 3's "one per body type present" selection rule into S4.** Ordered Truck, SUV, EV, Car, tie-broken by lowest odometer. It returns four distinct vehicles at n=6 and four at n=400, so section height and total page length are constant across the feed migration. Better than `slice(0, 6)`.

One fix Concept 2 needs that no sheet proposes: **sort each lineup group so `hasPage: true` and in-stock rows render first, state C last.** Its own stated risk is that a visitor taps three models in a row and gets three lead forms. Data-decided ordering means the eye lands on rows that go somewhere, and the section self-corrects as inventory arrives without a code change.

**Blocker before any of this ships, and it is not a design question.** Concept 2 bets the page on lead capture, and the lead pipeline in this repo silently drops leads when the build-time env vars are absent. Verify that path end to end before "Ask about it" appears twelve times on the homepage, or the strongest idea on the strongest sheet becomes the most expensive bug on the site. Also unresolved and rendered as fact: `dealerInfo.phone` is flagged unverified in its own source at `src/lib/vehicles.ts:307`, the `hours` array appears in neither the brief nor `dealerContent.ts`, and `DELIVERY_CLAIM` is absent from the live-site transcription. Concept 3 is right that delivery needs confirming first; under Concept 2 it costs one sentence rather than the whole page.

Files: `C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\lib\dealerContent.ts`, `C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\lib\vehicles.ts`, `C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\components\site\MobileStickyCTA.tsx`, `C:\Users\sahil\Downloads\velocity-craft-canvas-main\src\components\lead\VehicleLeadDialog.tsx`