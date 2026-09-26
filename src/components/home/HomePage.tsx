import { lazy, Suspense, useEffect, useState } from "react";
import "./home.css";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ChatWidget } from "@/components/convert/ChatWidget";
import { MobileStickyCTA } from "@/components/site/MobileStickyCTA";
import TradeOfferPopup from "@/components/popups/TradeOfferPopup";
import { hasSubmittedLead } from "@/lib/leads";

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
/** How long a visitor reads the page before the trade offer opens itself. */
const AUTO_OFFER_DELAY_MS = 20_000;

export function HomePage() {
  const [tradeOpen, setTradeOpen] = useState(false);

  // Open the trade offer once, 20s in. Skipped for anyone who has already sent us a lead —
  // interrupting someone who just converted costs goodwill and gains nothing.
  useEffect(() => {
    if (hasSubmittedLead()) return;
    const timer = setTimeout(() => setTradeOpen(true), AUTO_OFFER_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

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
        {/* Stats intentionally not rendered: 2,500+ delivered, 98% satisfaction and
            1,200+ five-star reviews are unsourced, and the review figure contradicts the
            2,400+ claimed elsewhere on the same page. Restore with numbers the dealership
            can evidence from its DMS and its Google Business Profile. */}
        {/* Reviews intentionally not rendered: the four testimonials in Reviews.tsx are
            invented, carry a "Verified Buyer" badge, and sit under a fabricated 4.9 star /
            2,400+ Google Reviews figure. Publishing invented endorsements is an FTC matter,
            not a style one. Restore this once the section reads real reviews. */}

        {/* Phase 4: Ownership, Flagship Showcase & Regional Roots */}
        <ExtraordinaryCarousel />
        <UnmatchedExcellence />
        <DealershipLocationAndHours />
        <ServiceAndParts />
        <AreasWeServe />
        <FinalCTA />
      </main>
      <SiteFooter />
      {/* Every SiteShell page has the Call/Book bar; the homepage builds its own shell and never
          got it, so on a phone the only route to a call was through the menu. Same spacer as
          SiteShell so the bar never covers the footer's last rows. */}
      <div
        aria-hidden
        className="h-24 sm:hidden"
        style={{ height: "calc(6rem + env(safe-area-inset-bottom))" }}
      />
      <MobileStickyCTA />

      {/* Live Chat Widget (Bottom Right) */}
      <ChatWidget />

      {tradeOpen && <TradeOfferPopup onClose={() => setTradeOpen(false)} pageSource="Home" />}
    </div>
  );
}
