import { lazy, Suspense, useState } from "react";
import { motion } from "framer-motion";
import "./home.css";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ChatWidget } from "@/components/convert/ChatWidget";
import { OfferPopup } from "@/components/popups/OfferPopup";

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
  const [offerOpen, setOfferOpen] = useState(false);

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

      {/* Floating Special Offer Button (Bottom-Left on Mobile to avoid blocking content; Mid-Right on Desktop) */}
      <motion.button
        type="button"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOfferOpen(true)}
        aria-label="Claim $500 Special Offer"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        className="fixed bottom-6 left-3.5 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:right-6 sm:left-auto z-40 group flex items-center gap-2 sm:gap-3 rounded-full bg-[#002c5f] pl-2.5 pr-3.5 py-2 sm:pl-3.5 sm:pr-5 sm:py-3 text-white shadow-xl ring-2 ring-white/80 backdrop-blur-md transition-[background-color,ring-color,box-shadow] hover:bg-[#001f44] hover:shadow-[0_15px_35px_rgba(0,44,95,0.4)] cursor-pointer select-none"
      >
        <span className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xs pointer-events-none">
          %
        </span>
        <div className="flex flex-col text-left leading-tight pointer-events-none">
          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
            Claim $500 OFF
          </span>
          <span className="text-[11px] sm:text-xs font-black tracking-tight text-white">
            Special Offer
          </span>
        </div>
      </motion.button>

      {/* Live Chat Widget (Bottom Right) */}
      <ChatWidget />

      {/* Special Offer Modal Popup */}
      {offerOpen && (
        <OfferPopup
          pageSource="Home"
          onClose={() => setOfferOpen(false)}
        />
      )}
    </div>
  );
}
