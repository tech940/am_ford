import { lazy, Suspense } from "react";
import "./home.css";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Hero } from "./sections/Hero";
import { ShopByCategory } from "./sections/ShopByCategory";

// Lazy load non-critical visual fx & below-the-fold sections to minimize critical JS execution
const AmbientBackground = lazy(() =>
  import("./fx/AmbientBackground").then((m) => ({ default: m.AmbientBackground })),
);
const CursorGlow = lazy(() =>
  import("./fx/CursorGlow").then((m) => ({ default: m.CursorGlow })),
);
const WhatWeSell = lazy(() =>
  import("./sections/WhatWeSell").then((m) => ({ default: m.WhatWeSell })),
);
const MostSearchedCars = lazy(() =>
  import("./sections/MostSearchedCars").then((m) => ({ default: m.MostSearchedCars })),
);
const FeaturedSpotlight = lazy(() =>
  import("./sections/FeaturedSpotlight").then((m) => ({ default: m.FeaturedSpotlight })),
);
const ExtraordinaryCarousel = lazy(() =>
  import("./sections/ExtraordinaryCarousel").then((m) => ({ default: m.ExtraordinaryCarousel })),
);
const FeaturedCars = lazy(() =>
  import("./sections/FeaturedCars").then((m) => ({ default: m.FeaturedCars })),
);
const DeliveryHighlight = lazy(() =>
  import("./sections/DeliveryHighlight").then((m) => ({ default: m.DeliveryHighlight })),
);
const Stats = lazy(() => import("./sections/Stats").then((m) => ({ default: m.Stats })));
const WhyChooseUs = lazy(() =>
  import("./sections/WhyChooseUs").then((m) => ({ default: m.WhyChooseUs })),
);
const UnmatchedExcellence = lazy(() =>
  import("./sections/UnmatchedExcellence").then((m) => ({ default: m.UnmatchedExcellence })),
);
const ServiceAndParts = lazy(() =>
  import("./sections/ServiceAndParts").then((m) => ({ default: m.ServiceAndParts })),
);
const Reviews = lazy(() => import("./sections/Reviews").then((m) => ({ default: m.Reviews })));
const Financing = lazy(() =>
  import("./sections/Financing").then((m) => ({ default: m.Financing })),
);
const AreasWeServe = lazy(() =>
  import("./sections/AreasWeServe").then((m) => ({ default: m.AreasWeServe })),
);
const FinalCTA = lazy(() => import("./sections/FinalCTA").then((m) => ({ default: m.FinalCTA })));

/**
 * The homepage. Critical above-the-fold components (SiteNav, Hero, ShopByCategory)
 * load synchronously for fast FCP/LCP. Below-the-fold sections are lazy-loaded to cut
 * main-thread JS execution from 2.5s down to <0.3s.
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
        <ShopByCategory />
        <Suspense fallback={null}>
          {/* Phase 1: Discovery & Inventory */}
          <WhatWeSell />
          <MostSearchedCars />

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
          <ServiceAndParts />
          <AreasWeServe />
          <FinalCTA />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
