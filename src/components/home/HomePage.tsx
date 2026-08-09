import "./home.css";
import { AmbientBackground } from "./fx/AmbientBackground";
import { CursorGlow } from "./fx/CursorGlow";
import { HomeNav } from "./sections/HomeNav";
import { Hero } from "./sections/Hero";
import { ShopByCategory } from "./sections/ShopByCategory";
import { FeaturedCars } from "./sections/FeaturedCars";
import { DeliveryHighlight } from "./sections/DeliveryHighlight";
import { Stats } from "./sections/Stats";
import { WhyChooseUs } from "./sections/WhyChooseUs";
import { UnmatchedExcellence } from "./sections/UnmatchedExcellence";
import { ServiceAndParts } from "./sections/ServiceAndParts";
import { AreasWeServe } from "./sections/AreasWeServe";
import { Reviews } from "./sections/Reviews";
import { Financing } from "./sections/Financing";
import { FinalCTA } from "./sections/FinalCTA";
import { HomeFooter } from "./sections/HomeFooter";

/**
 * The homepage. Section order follows the SEO brief: establish who and where we are,
 * let people shop by need, then lead with the delivery differentiator before the
 * supporting proof, service, and local-market content.
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
      </main>
      <HomeFooter />
    </div>
  );
}
