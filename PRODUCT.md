# Product

<!-- impeccable:product-schema 1 -->

> **Provenance note.** The init interview was sent and went unanswered, so this record was
> written from repository evidence and the AM Ford Website and SEO Master Content Brief.
> Facts drawn directly from code or the brief are stated plainly. Anything inferred is marked
> `[INFERRED]`, and anything genuinely undecided is marked `[OPEN]`. Confirm the `[OPEN]` items
> before building on them; they are the questions that change future product decisions most.

## Platform

web

## Users

Vehicle buyers within driving distance of Jefferson, Ohio, plus remote buyers who purchase
without visiting. The brief names five groups the site must serve:

- **Local Ashtabula County buyers.** Reach the store on Route 46, Route 20, Route 11, or I-90.
  Rural and small-town, lake-effect winters, so traction and durability lead the conversation.
- **First-time buyers and credit-rebuilding buyers.** Explicitly a target group. The brief
  requires a respectful, non-judgmental tone; no "bad credit" framing that shames the reader.
- **Work and commercial buyers.** Contractors, farms, landscapers, trades, and small fleets.
- **Families.** Three-row seating, car seats, winter safety.
- **Remote and out-of-state buyers.** Buy by phone and email, then take delivery or shipping.

## Product Purpose

Sell and service Ford vehicles from a single dealership, and capture qualified leads
(test drive, trade appraisal, financing application, service booking, vehicle enquiry) from
buyers who mostly begin the process online before ever visiting.

Success is a contactable lead, not a session. Every page carries a route to phone, form, or
appointment. Site-wide organic visibility for local Ford intent is the acquisition strategy.

## Positioning

A family-owned, single-location Ford franchise in Jefferson, Ohio, formerly Nassief Ford,
that removes distance as a reason not to buy. The delivery offer is the differentiator a
neighbouring dealer cannot copy without matching the commitment.

**Approved delivery wording, used verbatim and never shortened** (`DELIVERY_CLAIM` in
`src/lib/vehicles.ts`):

> Free home delivery within 300 miles and vehicle shipping available to all 50 states.

## Operating Context

- **One location, no branches.** 1059 State Route 46 North, Jefferson, OH 44047. Jefferson is
  the Ashtabula County seat. The dealership is _located in_ Jefferson and _serves_ Ashtabula;
  earlier copy wrongly placed it in Ashtabula and that must not return.
- **Service area:** Ashtabula County, Northeast Ohio, Northwestern Pennsylvania, then
  nationwide by shipping. Cross-border buyers (Erie, PA) purchase in Ohio and title at home.
- **Seasonality:** lake-effect snow drives four-wheel and all-wheel drive demand.
- **Remote purchase path:** credit application, trade appraisal by photo, and paperwork can all
  be completed without a showroom visit.
- **Contact:** sales@amfordashtabula.com. Phone `(440) 998-2151` — **[OPEN]** the code carries a
  note to verify this with the dealership; it has never been confirmed.

## Capabilities and Constraints

**Inventory today** (`src/lib/vehicles.ts`, the single source of truth): 6 vehicles.
5 New plus 1 Certified Pre-Owned. **Zero used vehicles. Ford only, no other brands.**
Price range $36,450 to $71,990. Body styles: Truck, SUV, Car, EV.
Models: F-150, Mustang, Explorer, F-150 Lightning, Bronco, Escape.

- **[OPEN] Is this dataset real or placeholder, and is used or multi-brand stock coming?**
  This is the highest-leverage unknown in the product. Six vehicles is the ceiling on every
  commercial surface. It is why price-tier pages (`under-10000` … `under-25000`), used-model
  pages, and the transactional half of the informational/transactional page split were
  deliberately not built: they would rank for queries the lot cannot fulfil.
- No page may advertise used stock, a non-Ford brand, or a model not held. A control that
  returns nothing is treated as a defect, not a placeholder.

**Technical constraints.** TanStack Start (React 19, Vite 7), SSR, deployed as a Cloudflare
Worker via `wrangler`; `wrangler.jsonc` at root, build emits `dist/client` + `dist/server`.
There is **no static HTML entry**, so static-host deploys 404 on every route. TypeScript strict.
Tailwind v4 (CSS-first, no `tailwind.config`). Leads go to Supabase from the client using the
**anon** key only; `VITE_*` vars are inlined at build time, so a build without them ships forms
that fail silently. The service-role key must never reach a `VITE_` variable.

`AnimatePresence mode="wait"` is broken under this React 19 + framer-motion pairing and
silently freezes whatever it wraps. It is banned in this codebase.

**[OPEN] Canonical domain.** Code uses `https://amford.com` (`SITE_ORIGIN` in
`src/lib/breadcrumbs.ts`), which drives every canonical, `og:url`, sitemap URL, and JSON-LD
`@id`. The contact email uses `amfordashtabula.com`. The live deploy is
`https://tanstack-start-app.tech-305.workers.dev`, which is crawlable while canonicalising to a
domain that does not yet serve the site. Unresolved and blocking.

## Brand Commitments

- **Name:** AM Ford. `alternateName` / former name: Nassief Ford. Family-owned.
- **Voice, from the brief and binding:** plain, direct, non-judgmental. Write about what a buyer
  should check and why, not invented verdicts.
- **Prohibited in customer-facing copy:** em dashes; en dashes; exclamation marks; the words
  _unmatched, premier, world-class, best-in-class, unbeatable, number one, lowest price_;
  generic anchors (_learn more, read more, click here_).
- **Requires management approval before publication:** any specific APR figure, monthly payment,
  warranty specific, or inspection-point count.
- **Never fabricate:** statistics, customer stories, testimonials, review counts, awards, or
  vehicle specifications absent from the vehicle records.

## Evidence on Hand

**Real:** the 6 vehicle records with genuine trims, prices, mileage, drivetrain, fuel,
horsepower, MPG, colours, and feature lists; dealership NAP; service and parts offering;
8 service-area records; 4 county records; 6 Ford model records.

**Not real, and must not be treated as evidence — [OPEN], pending dealership sign-off:**

| Claim                                                | Where it renders                                    |
| ---------------------------------------------------- | --------------------------------------------------- |
| "172-point inspection"                               | homepage, `/inventory`, vehicle detail pages        |
| Specific APRs (4.9%, 0.9%, 5.9%)                     | homepage, `/inventory`, `/financing`, vehicle pages |
| Monthly payment figures ($771–$1,128/mo)             | `/inventory`, `/financing`, vehicle pages           |
| "Lifetime Powertrain Warranty"                       | vehicle detail pages                                |
| 4.9★ average, 20k+ delivered, 30+ team               | `/about`                                            |
| "Ford President's Award", "Since 1962", "60+ years"  | `/about`                                            |
| Six specific service prices, 30-day tire price match | `/service`                                          |
| Four named customer testimonials                     | homepage Reviews section                            |

The APR figures and payment quotes are the urgent ones: unless backed by a real lender program
they carry Regulation Z exposure independent of any SEO concern.

## Product Principles

1. **Never advertise what the lot cannot deliver.** A filter, tab, or landing page that returns
   nothing is a defect. Inventory truth constrains the information architecture, not the reverse.
2. **Unverifiable is unpublishable.** Numbers, awards, rates, and stories require a source. When
   a topic needs a figure we do not have, describe what the buyer should check instead.
3. **Distance is solved, not ignored.** Delivery and remote purchase are the position; state the
   approved claim verbatim where it genuinely changes the decision, and not where it does not.
4. **Every page ends in a contactable action.** Phone, form, or appointment. Design serves the
   lead, and leads must never fail silently.
5. **Local pages earn their place or do not exist.** A community page must say something true and
   specific about that community. Templated pages with a swapped proper noun are doorway pages.

## Accessibility & Inclusion

WCAG 2.5.8 (24×24px minimum target) is enforced across the site. Keyboard operability,
visible focus, correct heading order, and inert hidden navigation are treated as defects when
missing, not enhancements. Content must remain legible at 320px with no horizontal overflow.
Reduced-motion preferences disable decorative WebGL entirely.

The credit-rebuilding audience is an inclusion commitment, not just a segment: financing copy is
written to avoid shame framing.
