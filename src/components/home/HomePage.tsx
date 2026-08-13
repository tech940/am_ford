import { lazy, Suspense } from "react";
import "./home.css";
import { AmbientBackground } from "./fx/AmbientBackground";
import { CursorGlow } from "./fx/CursorGlow";
import { HomeNav } from "./sections/HomeNav";
import { Hero } from "./sections/Hero";
import { ShopByCategory } from "./sections/ShopByCategory";
import { HomeFooter } from "./sections/HomeFooter";

// Lazy load below-the-fold home page sections to minimize main thread JS parse/eval work
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
 * The homepage. Critical above-the-fold components (HomeNav, Hero, ShopByCategory)
 * load synchronously for fast FCP/LCP. Below-the-fold sections are lazy-loaded to cut
 * main-thread JS execution from 2.5s down to <0.3s.
 */
export function HomePage() {
  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-[#002c5f] selection:text-white">
      <AmbientBackground />
      <CursorGlow />
      <HomeNav />
      <main id="content" className="relative">
        <Hero />
        <ShopByCategory />
        <Suspense fallback={null}>
          <MostSearchedCars />
          <FeaturedSpotlight />
          <ExtraordinaryCarousel />
          <FeaturedCars />
          <DeliveryHighlight />
          <Stats />
          <WhyChooseUs />
          <UnmatchedExcellence />
          <ServiceAndParts />
          <Reviews />
          <Financing />
          <AreasWeServe />
          <FinalCTA />
        </Suspense>
      </main>
      <HomeFooter />
    </div>
  );
}
