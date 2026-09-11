import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Eye } from "lucide-react";
import { vehicles, type Vehicle, vehicleSlug } from "@/lib/vehicles";
import { OfferPopup } from "@/components/popups/OfferPopup";
import { cn } from "@/lib/utils";

// Select flagship spotlight vehicles across different models with rich photo sets
function getSpotlightVehicles(allVehicles: Vehicle[]): Vehicle[] {
  const priorityModels = ["Explorer", "F-150", "Bronco", "F-250", "Expedition", "Mustang"];
  const list: Vehicle[] = [];

  for (const modelName of priorityModels) {
    const match = allVehicles.find(
      (v) =>
        v.model.toLowerCase().includes(modelName.toLowerCase()) &&
        Array.isArray(v.images) &&
        v.images.length >= 4,
    );
    if (match && !list.some((item) => item.id === match.id)) {
      list.push(match);
    }
  }

  // Backfill with any other vehicles that have at least 4 photos if fewer than 5
  if (list.length < 5) {
    for (const v of allVehicles) {
      if (list.length >= 5) break;
      if (!list.some((item) => item.id === v.id) && Array.isArray(v.images) && v.images.length >= 4) {
        list.push(v);
      }
    }
  }

  return list.length > 0 ? list : allVehicles.slice(0, 5);
}

export function FeaturedSpotlight() {
  const spotlightVehicles = useMemo(() => getSpotlightVehicles(vehicles), []);
  const [currentVehicleIndex, setCurrentVehicleIndex] = useState(0);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [offerModalOpen, setOfferModalOpen] = useState(false);

  const vehicle = spotlightVehicles[currentVehicleIndex] || vehicles[0];
  const allPhotos = useMemo(() => {
    if (Array.isArray(vehicle.images) && vehicle.images.length > 0) {
      return vehicle.images;
    }
    return [vehicle.image];
  }, [vehicle]);

  const activePhoto = allPhotos[selectedPhotoIndex] || vehicle.image;

  // 4 real gallery tiles for this exact vehicle
  const galleryTiles = useMemo(() => {
    return [
      { label: "PROFILE VIEW", photoUrl: allPhotos[1] || allPhotos[0], photoIndex: 1 },
      { label: "COCKPIT / INTERIOR", photoUrl: allPhotos[2] || allPhotos[0], photoIndex: 2 },
      { label: "REAR & CARGO", photoUrl: allPhotos[3] || allPhotos[0], photoIndex: 3 },
      { label: "DETAILS & TRIM", photoUrl: allPhotos[4] || allPhotos[0], photoIndex: 4 },
    ];
  }, [allPhotos]);

  const handleNextVehicle = () => {
    setCurrentVehicleIndex((prev) => (prev + 1) % spotlightVehicles.length);
    setSelectedPhotoIndex(0);
  };

  const handlePrevVehicle = () => {
    setCurrentVehicleIndex((prev) => (prev - 1 + spotlightVehicles.length) % spotlightVehicles.length);
    setSelectedPhotoIndex(0);
  };

  return (
    <section className="py-8 sm:py-16 bg-slate-50 border-b border-slate-200/80 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        {/* Top Header Row */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#002c5f] px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
                VIP SPOTLIGHT FLEET
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Live Lot Stock · Updated Daily
              </span>
            </div>
            <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              Featured Vehicle Spotlight
            </h2>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setOfferModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#002c5f] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-[#001f44] transition active:scale-95 cursor-pointer"
            >
              CLAIM DEALER PRICE
            </button>
            <Link
              to="/inventory"
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100 transition shadow-xs"
            >
              <span>View All ({vehicles.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Vehicle Switcher Tabs */}
        <div className="mt-5 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {spotlightVehicles.map((v, idx) => {
            const isSelected = idx === currentVehicleIndex;
            return (
              <button
                key={v.id}
                onClick={() => {
                  setCurrentVehicleIndex(idx);
                  setSelectedPhotoIndex(0);
                }}
                className={cn(
                  "rounded-md px-3.5 py-1.5 text-xs font-bold transition-all shrink-0 cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                  isSelected
                    ? "bg-[#002c5f] text-white shadow-sm"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                )}
              >
                <span>{v.year} {v.model}</span>
                {v.trim && <span className="opacity-80 text-[11px] font-normal">{v.trim}</span>}
              </button>
            );
          })}
        </div>

        {/* Bento Grid Layout: Left Large Hero Tile + Right 2x2 Real Gallery Tiles */}
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-2.5 sm:p-4 shadow-xl">
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-12">
            {/* LEFT MAIN TILE (7 Columns) */}
            <div className="relative aspect-[16/10] lg:aspect-auto w-full overflow-hidden rounded-lg bg-slate-950 lg:col-span-7 group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={`${vehicle.id}-${selectedPhotoIndex}`}
                  src={activePhoto}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`}
                  initial={{ opacity: 0.7, scale: 1.01 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.8 }}
                  transition={{ duration: 0.25 }}
                  className="h-full w-full object-cover object-center"
                />
              </AnimatePresence>

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/35 pointer-events-none" />

              {/* Top Left Badges */}
              <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5">
                <span className="inline-flex items-center rounded-md bg-[#002c5f] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
                  FEATURED SPOTLIGHT
                </span>
                <span className="inline-flex items-center rounded-md bg-white/95 px-2.5 py-1 text-[10px] font-bold text-slate-900 shadow-md">
                  {vehicle.condition}
                </span>
              </div>

              {/* Top Right Spec Pill */}
              <div className="absolute right-3 top-3 z-10">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-950/80 px-2.5 py-1 text-[10px] sm:text-xs font-bold text-white backdrop-blur-md border border-white/10 shadow-lg">
                  <span>{vehicle.year} {vehicle.make} {vehicle.model}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-amber-300 font-semibold">{vehicle.miles.toLocaleString()} Mi</span>
                </span>
              </div>

              {/* Bottom Card Content: Specs & Link */}
              <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2.5">
                <div className="inline-flex flex-col gap-1 rounded-md bg-white/95 px-3.5 py-2 shadow-xl backdrop-blur-md border border-slate-200/80">
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-600">
                    Special Dealer Price:
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base sm:text-lg font-black text-[#002c5f]">
                      ${vehicle.price.toLocaleString()}
                    </span>
                    {vehicle.msrp && vehicle.msrp > vehicle.price && (
                      <span className="text-[11px] text-slate-500 line-through">
                        MSRP: ${vehicle.msrp.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                    <span>{vehicle.drivetrain}</span>
                    <span>·</span>
                    <span>{vehicle.fuel}</span>
                    <span>·</span>
                    <span>{vehicle.transmission}</span>
                  </div>
                </div>

                <Link
                  to="/vehicle/$id"
                  params={{ id: vehicleSlug(vehicle) }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#002c5f] px-3.5 py-2 text-xs font-bold text-white shadow-lg hover:bg-[#001f44] transition shrink-0"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View Details & {allPhotos.length} Photos</span>
                </Link>
              </div>
            </div>

            {/* RIGHT 2x2 REAL GALLERY TILES (5 Columns) */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:col-span-5">
              {galleryTiles.map((tile, idx) => {
                const isSelected = selectedPhotoIndex === tile.photoIndex;
                const isLast = idx === galleryTiles.length - 1;

                return (
                  <div
                    key={tile.label + idx}
                    onClick={() => setSelectedPhotoIndex(tile.photoIndex)}
                    className={cn(
                      "relative aspect-square w-full overflow-hidden rounded-lg bg-slate-900 group cursor-pointer transition-all",
                      isSelected ? "ring-2 ring-[#002c5f] shadow-md" : "hover:opacity-95"
                    )}
                  >
                    <img
                      src={tile.photoUrl}
                      alt={`${vehicle.model} - ${tile.label}`}
                      loading="lazy"
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                    {/* Label Badge */}
                    <div className="absolute bottom-2.5 left-2.5 z-10 max-w-[calc(100%-3.5rem)]">
                      <span className="inline-flex rounded-md bg-slate-950/85 px-2 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white backdrop-blur-sm border border-white/10 truncate">
                        {tile.label}
                      </span>
                    </div>

                    {/* Carousel Controls on bottom right tile */}
                    {isLast && (
                      <div
                        className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={handlePrevVehicle}
                          className="grid h-7 w-7 place-items-center rounded-md bg-white/95 text-slate-900 shadow-lg backdrop-blur-md transition hover:bg-white active:scale-90 cursor-pointer"
                          aria-label="Previous Spotlight Vehicle"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={handleNextVehicle}
                          className="grid h-7 w-7 place-items-center rounded-md bg-[#002c5f] text-white shadow-lg backdrop-blur-md transition hover:bg-[#001f44] active:scale-90 cursor-pointer"
                          aria-label="Next Spotlight Vehicle"
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
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
