import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShieldCheck, Tag } from "lucide-react";
import { vehicles, type Vehicle } from "@/lib/vehicles";
import { OfferPopup } from "@/components/popups/OfferPopup";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";

const SPOTLIGHT_ITEMS = [
  {
    vehicle: vehicles[0], // Ford F-150 Lariat
    mainImageName: "hero-truck" as const,
    gallery: [
      { label: "COCKPIT INTERIOR", imageName: "car-mustang" as const },
      { label: "REAR PROFILE", imageName: "car-explorer" as const },
      { label: "ENGINE POWERTRAIN", imageName: "car-lightning" as const },
      { label: "LUXURY SEATING", imageName: "car-bronco" as const },
    ],
  },
  {
    vehicle: vehicles[1], // Ford Explorer
    mainImageName: "car-explorer" as const,
    gallery: [
      { label: "COCKPIT INTERIOR", imageName: "car-lightning" as const },
      { label: "REAR PROFILE", imageName: "hero-truck" as const },
      { label: "ENGINE POWERTRAIN", imageName: "car-mustang" as const },
      { label: "LUXURY SEATING", imageName: "car-bronco" as const },
    ],
  },
  {
    vehicle: vehicles[3], // Ford Bronco
    mainImageName: "car-bronco" as const,
    gallery: [
      { label: "COCKPIT INTERIOR", imageName: "hero-truck" as const },
      { label: "REAR PROFILE", imageName: "car-mustang" as const },
      { label: "ENGINE POWERTRAIN", imageName: "car-explorer" as const },
      { label: "LUXURY SEATING", imageName: "car-lightning" as const },
    ],
  },
];

export function FeaturedSpotlight() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [offerModalOpen, setOfferModalOpen] = useState(false);

  const currentSpotlight = SPOTLIGHT_ITEMS[currentIndex];
  const { vehicle, mainImageName, gallery } = currentSpotlight;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SPOTLIGHT_ITEMS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SPOTLIGHT_ITEMS.length) % SPOTLIGHT_ITEMS.length);
  };

  return (
    <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200/80 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        {/* Header Row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#002c5f] px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
              VIP SPOTLIGHT FLEET
            </span>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Featured Vehicle Spotlight
            </h2>
          </div>

          <button
            onClick={() => setOfferModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#002c5f] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-[#002c5f]/20 hover:bg-[#001f44] transition active:scale-95 shrink-0"
          >
            <Tag className="h-4 w-4" />
            <span>CLAIM DEALER PRICE</span>
          </button>
        </div>

        {/* Bento Grid Layout (Left Large Hero + Right 2x2 Tiles) */}
        <div className="mt-8 rounded-[2.5rem] border border-slate-200 bg-white p-3 sm:p-4 shadow-xl">
          <div className="grid gap-4 lg:grid-cols-12">
            {/* LEFT MAIN TILE (7 Columns) */}
            <div className="relative aspect-[16/10] lg:aspect-auto w-full overflow-hidden rounded-[2rem] bg-slate-900 lg:col-span-7">
              <AnimatePresence mode="wait">
                <ResponsiveImage
                  name={mainImageName}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  sizes="(max-width: 1024px) 100vw, 640px"
                  className="h-full w-full object-cover object-center"
                />
              </AnimatePresence>

              {/* Top Left Badge */}
              <div className="absolute left-4 top-4 z-10">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#002c5f] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
                  FEATURED SPOTLIGHT
                </span>
              </div>

              {/* Top Right Pill */}
              <div className="absolute right-4 top-4 z-10">
                <span className="inline-flex items-center gap-2 rounded-xl bg-slate-950/80 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md border border-white/10 shadow-lg">
                  <span>
                    {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-sky-300 font-extrabold">
                    {vehicle.miles.toLocaleString()} Miles
                  </span>
                </span>
              </div>

              {/* Bottom Left Dealer Price Badge */}
              <div className="absolute bottom-4 left-4 z-10">
                <div className="inline-flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-2.5 shadow-2xl backdrop-blur-md border border-slate-200">
                  <ShieldCheck className="h-4 w-4 text-[#002c5f]" />
                  <span className="text-xs font-bold text-slate-700">Special Dealer Price:</span>
                  <span className="text-sm font-black text-[#002c5f]">
                    ${vehicle.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT 2x2 GALLERY TILES (5 Columns) */}
            <div className="grid grid-cols-2 gap-3 lg:col-span-5">
              {gallery.map((tile, idx) => {
                const isLast = idx === gallery.length - 1;
                return (
                  <div
                    key={tile.label + idx}
                    className="relative aspect-square w-full overflow-hidden rounded-[1.75rem] bg-slate-900 group"
                  >
                    <ResponsiveImage
                      name={tile.imageName}
                      alt={tile.label}
                      sizes="(max-width: 640px) 50vw, 300px"
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    {/* Label Badge */}
                    <div className="absolute bottom-3 left-3 z-10">
                      <span className="inline-flex rounded-lg bg-slate-950/85 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white backdrop-blur-sm border border-white/10">
                        {tile.label}
                      </span>
                    </div>

                    {/* Carousel Controls on bottom right tile */}
                    {isLast && (
                      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5">
                        <button
                          onClick={handlePrev}
                          className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-slate-900 shadow-lg backdrop-blur-md transition hover:bg-white active:scale-90"
                          aria-label="Previous Spotlight"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleNext}
                          className="grid h-8 w-8 place-items-center rounded-full bg-[#002c5f] text-white shadow-lg backdrop-blur-md transition hover:bg-[#001f44] active:scale-90"
                          aria-label="Next Spotlight"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {offerModalOpen && (
        <OfferPopup
          onClose={() => setOfferModalOpen(false)}
          pageSource="FeaturedSpotlight"
          initialCarData={{
            title: `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`,
            price: `$${vehicle.price.toLocaleString()}`,
            vin: vehicle.vin || "",
            stock: vehicle.stockNumber || "",
            pageUrl: typeof window !== "undefined" ? window.location.href : "",
          }}
        />
      )}
    </section>
  );
}
