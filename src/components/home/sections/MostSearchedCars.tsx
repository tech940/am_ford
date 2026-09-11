import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { vehicles, type Vehicle, vehicleSlug } from "@/lib/vehicles";
import { OfferPopup } from "@/components/popups/OfferPopup";

const CATEGORIES = [
  { id: "SUV", label: "SUV" },
  { id: "Truck", label: "TRUCK" },
  { id: "Car", label: "MUSTANG & MUSCLE" },
  { id: "Commercial", label: "COMMERCIAL" },
  { id: "Electric", label: "HYBRID & EV" },
] as const;

export function MostSearchedCars() {
  const [activeTab, setActiveTab] = useState<string>("SUV");
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Vehicle | null>(null);

  // Filter vehicles matching active category tab
  const categoryVehicles = vehicles
    .filter((v) => {
      if (activeTab === "Electric") return v.fuel === "Electric" || v.fuel === "Hybrid";
      if (activeTab === "Car") return v.type === "Car" || v.model.includes("Mustang");
      return v.type === activeTab;
    })
    .slice(0, 4);

  // Fallback if less than 4
  const displayVehicles = categoryVehicles.length >= 4 ? categoryVehicles : vehicles.slice(0, 4);

  return (
    <section className="py-8 sm:py-16 lg:py-20 bg-white border-b border-slate-200/80 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        {/* Header & Category Filter Tabs */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#002c5f]" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#002c5f]">
                TRENDING AM FORD STOCK
              </span>
            </div>
            <h2 className="mt-1.5 text-xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              The most searched cars
            </h2>
          </div>

          {/* Category Tabs: single line horizontally scrollable */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap border-b border-slate-200 pb-2 md:border-none md:pb-0">
            {CATEGORIES.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative shrink-0 rounded-md px-3 py-1.5 text-[11px] sm:text-xs font-black transition-all ${
                    isActive
                      ? "text-[#002c5f]"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#002c5f]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4-Card Vehicles Grid */}
        <div className="mt-5 sm:mt-8 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {displayVehicles.map((car) => (
              <motion.div
                key={car.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35 }}
                className="group flex flex-col overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#002c5f]/30 hover:shadow-lg"
              >
                {/* Photo & Badge with increased 4:3 size for full vehicle fit */}
                <Link
                  to="/vehicle/$id"
                  params={{ id: vehicleSlug(car) }}
                  className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 block"
                >
                  <img
                    src={car.image}
                    alt={`${car.year} ${car.make} ${car.model}`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-2.5 top-2.5 z-10">
                    <span className="inline-flex items-center gap-1 rounded-md border border-white/40 bg-slate-900/80 px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs backdrop-blur-md">
                      {car.condition === "New"
                        ? "IN STOCK NOW"
                        : car.condition === "Used"
                          ? "PRE-OWNED"
                          : "CERTIFIED CPO"}
                    </span>
                  </div>
                </Link>

                {/* Card Content */}
                <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-5">
                  <div>
                    <Link
                      to="/vehicle/$id"
                      params={{ id: vehicleSlug(car) }}
                      className="block"
                    >
                      <h3 className="text-[13.5px] sm:text-[15px] font-black text-slate-900 group-hover:text-[#002c5f] transition-colors leading-snug line-clamp-1">
                        {car.year} {car.make} {car.model} {car.trim}
                      </h3>
                    </Link>
                    <p className="mt-1 text-xs sm:text-sm font-black text-[#002c5f]">
                      ${car.price.toLocaleString()}{" "}
                      {car.msrp && car.msrp > car.price ? (
                        <span className="font-normal text-slate-500 text-[11px]">
                          - ${car.msrp.toLocaleString()} MSRP*
                        </span>
                      ) : (
                        <span className="font-medium text-slate-500 text-[11px]">*</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                      {car.miles.toLocaleString()} Mi · {car.drivetrain}
                    </p>
                  </div>

                  <div className="mt-3.5 sm:mt-5 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedCar(car);
                        setOfferModalOpen(true);
                      }}
                      className="flex-1 rounded-md border border-[#002c5f]/50 bg-white py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#002c5f] transition-all hover:border-[#002c5f] hover:bg-[#002c5f] hover:text-white hover:shadow-xs active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>View Offers</span>
                    </button>
                    <Link
                      to="/vehicle/$id"
                      params={{ id: vehicleSlug(car) }}
                      className="rounded-md border border-slate-200 bg-slate-50 p-2 text-slate-700 hover:bg-[#002c5f] hover:text-white hover:border-[#002c5f] transition-all flex items-center justify-center shrink-0"
                      aria-label={`View ${car.year} ${car.model}`}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer Link & Carousel Controls */}
        <div className="mt-10 flex items-center justify-between pt-4 border-t border-slate-200/80">
          <Link
            to="/inventory"
            search={{
              type:
                activeTab !== "Electric" && activeTab !== "Car"
                  ? (activeTab as Vehicle["type"])
                  : undefined,
            }}
            className="group inline-flex items-center gap-2 text-sm font-extrabold text-[#002c5f] hover:underline"
          >
            <span>View All {activeTab} Vehicles</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const currentIndex = CATEGORIES.findIndex((c) => c.id === activeTab);
                const prev = (currentIndex - 1 + CATEGORIES.length) % CATEGORIES.length;
                setActiveTab(CATEGORIES[prev].id);
              }}
              className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-[#002c5f] hover:text-[#002c5f]"
              aria-label="Previous Category"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                const currentIndex = CATEGORIES.findIndex((c) => c.id === activeTab);
                const next = (currentIndex + 1) % CATEGORIES.length;
                setActiveTab(CATEGORIES[next].id);
              }}
              className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-[#002c5f] hover:text-[#002c5f]"
              aria-label="Next Category"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {offerModalOpen && (
        <OfferPopup onClose={() => setOfferModalOpen(false)} pageSource="MostSearched" />
      )}
    </section>
  );
}
