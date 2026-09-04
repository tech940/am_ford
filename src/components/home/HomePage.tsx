import { lazy, Suspense } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { TheStore } from "./sections/TheStore";
import { OnTheLotNow } from "./sections/OnTheLotNow";

/**
 * The homepage.
 *
 * THESIS: this page argues that AM Ford is a real store at a real address where a person
 * answers the phone, then shows what it actually sells — the vehicles it can prove it holds,
 * and the twenty models it can prove Ford builds, with nothing in between invented.
 *
 * Every claim on the page is a photograph, a value read from `dealerInfo` / `vehicles` /
 * `dealerContent`, or one of the dealership's own published sentences.
 *
 * WHAT WAS MISSING. Four real Ford programmes live in dealerContent.ts with their programme
 * numbers, stated end dates and verbatim disclaimers. The page rendered ONE of them, collapsed
 * inside a <details> in the hero. `LiveProgrammes` gives all four a surface and expires them
 * automatically; when the last one lapses the section returns null and the page closes over it.
 *
 * ONE OWNER PER FACT. The bottom of this page used to state the delivery claim four times, the
 * address four times, and "one location" twice, in four different card idioms. Now: the
 * delivery claim belongs to `WeBringItToYou`, the address to `TheStore`'s facts rule and the
 * footer record, the full week of hours to the footer alone, the served markets to
 * `WelcomeToAmFord`'s prose, and the phone to the nav. A third occurrence of any of them is a
 * defect, not a decision.
 *
 * WHAT WENT, AND WHY
 *  - `AreasWeServe`: twenty-nine town names rendered as spans that linked nothing, above a
 *    panel restating the address and the delivery claim, above a "Get Directions" button that
 *    pointed at /contact rather than at a map. The same list already ships as `areaServed`
 *    JSON-LD, as /areas-we-serve, and as eight city pages. Folding it into Welcome's prose
 *    took the homepage from six of eight city pages linked to eight of eight.
 *  - `VisitUs`: a navy rounded panel of icon rows beside a Google Maps iframe, duplicating
 *    /contact wholesale. The one fact it solely owned, the full week of hours, moved to the
 *    footer. The iframe shipped Google script and cookies to every visitor for decoration and
 *    printed "Use ctrl + scroll to zoom the map" across its own artwork.
 *  - `DeliveryHighlight` became `WeBringItToYou`: same slot, same argument, without the navy
 *    gradient panel, the blurred corner glow, or three icon-heading-paragraph tiles.
 *  - Four consecutive sections rendered the same six records in four layouts. They are now one
 *    section (`OnTheLotNow`) whose height does not change with feed size.
 *  - The whole `fx/` layer: an ambient field of 42 permanently-composited layers, a
 *    cursor-following glow, six WebGL contexts drawing five icons and a wheel, ~86 reveal
 *    wrappers and 25 scroll observers, and animated counters re-rendering prices that were
 *    already correct in the SSR HTML. None of it explained a state change.
 *  - `WhyChooseUs`: five WebGL canvases and five claims that appear in no source file. There
 *    is no honest version of that section, so there is no replacement.
 *  - `ServiceAndParts`: replaced by `ServiceRow`. It asserted "Ford-trained technicians",
 *    "Ford diagnostic equipment" and "Genuine Ford and Motorcraft parts", none of which appear
 *    in any source file. The dealership's own homepage says one sentence about service.
 *
 * Each below-fold section gets its OWN Suspense boundary with a reserved height, per
 * breakpoint. Every reservation below was MEASURED in the browser at 375 and at 1280, not
 * estimated: the first pass was out by up to 778px on one boundary in each direction. The single shared boundary this replaces let one slow chunk blank twelve
 * sections at once, and the single flat number it reserved was a desktop height applied to a
 * mobile layout that runs 1.5x to 3x taller.
 */
const WhatWeSell = lazy(() =>
  import("./sections/WhatWeSell").then((m) => ({ default: m.WhatWeSell })),
);
const LiveProgrammes = lazy(() =>
  import("./sections/LiveProgrammes").then((m) => ({ default: m.LiveProgrammes })),
);
const WeBringItToYou = lazy(() =>
  import("./sections/WeBringItToYou").then((m) => ({ default: m.WeBringItToYou })),
);
const ServiceRow = lazy(() =>
  import("./sections/ServiceRow").then((m) => ({ default: m.ServiceRow })),
);
const TradeAndFinance = lazy(() =>
  import("./sections/TradeAndFinance").then((m) => ({ default: m.TradeAndFinance })),
);
const WelcomeToAmFord = lazy(() =>
  import("./sections/WelcomeToAmFord").then((m) => ({ default: m.WelcomeToAmFord })),
);

/** Reserves the section's height so a pending chunk cannot collapse the page. */
function Hold({ className }: { className?: string }) {
  return <div className={className} aria-hidden />;
}

export function HomePage() {
  return (
    <SiteShell>
      <TheStore />
      <OnTheLotNow />

      {/* Programmes sit straight after the stock: someone who has just read the prices is who
          cares that Ford is running 0% APR against them. */}
      <Suspense fallback={<Hold className="min-h-[34rem] lg:min-h-[30rem]" />}>
        <LiveProgrammes />
      </Suspense>
      <Suspense fallback={<Hold className="min-h-[88rem] lg:min-h-[65rem]" />}>
        <WhatWeSell />
      </Suspense>
      <Suspense fallback={<Hold className="min-h-[49rem] lg:min-h-[33rem]" />}>
        <WeBringItToYou />
      </Suspense>
      <Suspense fallback={<Hold className="min-h-[26rem] lg:min-h-[25rem]" />}>
        <ServiceRow />
      </Suspense>
      <Suspense fallback={<Hold className="min-h-[69rem] lg:min-h-[46rem]" />}>
        <TradeAndFinance />
      </Suspense>
      {/* Long-form introduction sits after the commercial sections: it is what a search
          arrival reads, not what a ready buyer needs first. */}
      <Suspense fallback={<Hold className="min-h-[141rem] lg:min-h-[105rem]" />}>
        <WelcomeToAmFord />
      </Suspense>
    </SiteShell>
  );
}
