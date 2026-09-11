import { lazy, Suspense } from "react";
import "./home.css";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ChatWidget } from "@/components/convert/ChatWidget";

// ── Above-the-fold: synchronous for instant FCP/LCP ──
import { Hero } from "./sections/Hero";
import { ShopByCategory } from "./sections/ShopByCategory";

// ── SEO-critical sections: synchronous imports ──
// All content sections MUST be synchronous so their HTML renders in-place during SSR.
// React.lazy would push them into streamed out-of-order hidden chunks that require
// inline JS to swap in — invisible to scrapers, "View Page Source", and any crawler
// not in the `isbot` UA library. Synchronous imports guarantee the full semantic HTML
// sits directly inside <main> in the initial response, exactly as Google expects.
import { WhatWeSell } from "./sections/WhatWeSell";
import { NewArrivals } from "./sections/NewArrivals";
import { FeaturedSpotlight } from "./sections/FeaturedSpotlight";
import { ExtraordinaryCarousel } from "./sections/ExtraordinaryCarousel";
import { DeliveryHighlight } from "./sections/DeliveryHighlight";
import { Stats } from "./sections/Stats";
import { WhyChooseUs } from "./sections/WhyChooseUs";
import { UnmatchedExcellence } from "./sections/UnmatchedExcellence";
import { ServiceAndParts } from "./sections/ServiceAndParts";
import { Reviews } from "./sections/Reviews";
import { Financing } from "./sections/Financing";
import { DealershipLocationAndHours } from "./sections/DealershipLocationAndHours";
import { AreasWeServe } from "./sections/AreasWeServe";
import { FinalCTA } from "./sections/FinalCTA";

// ── Decorative FX only: lazy-loaded (no SEO value, purely visual) ──
const AmbientBackground = lazy(() =>
  import("./fx/AmbientBackground").then((m) => ({ default: m.AmbientBackground })),
);
const CursorGlow = lazy(() =>
  import("./fx/CursorGlow").then((m) => ({ default: m.CursorGlow })),
);

/**
 * The homepage. Every content section is synchronously imported so the server
 * renders complete, in-place semantic HTML for search engines. Only decorative
 * visual FX (ambient gradients, cursor glow) are lazy-loaded since they carry
 * zero SEO value and their JS is purely client-side cosmetic.
 *
 * Images throughout the sections use native `loading="lazy"` and `decoding="async"`
 * for below-the-fold performance — the browser defers network requests for
 * off-screen images without removing them from the HTML document.
 */
export function HomePage() {
  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-[#002c5f] selection:text-white">
      <Suspense fallback={null}>
        <AmbientBackground />
        <CursorGlow />
      </Suspense>
      {/* The same nav and footer as every other page. Not SiteShell: its <main> top padding
          would push the full-bleed hero out from under the fixed nav. */}
      <SiteNav />
      <main id="content" className="relative">
        <Hero />

        {/* Phase 1: Immediate Inventory & Lineup Discovery */}
        <NewArrivals />
        <WhatWeSell />
        <ShopByCategory />

        {/* Phase 2: VIP Spotlight & Affordability */}
        <FeaturedSpotlight />
        <Financing />

        {/* Phase 3: Dealership Trust & Reputation */}
        <WhyChooseUs />
        <DeliveryHighlight />
        <Stats />
        <Reviews />

        {/* Phase 4: Ownership, Flagship Showcase & Regional Roots */}
        <ExtraordinaryCarousel />
        <UnmatchedExcellence />
        <DealershipLocationAndHours />
        <ServiceAndParts />
        <AreasWeServe />
        <FinalCTA />
      </main>
      <SiteFooter />

      {/* Live Chat Widget (Bottom Right) */}
      <ChatWidget />
    </div>
  );
}
