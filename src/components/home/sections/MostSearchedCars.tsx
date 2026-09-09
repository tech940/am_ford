import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { vehicles, type Vehicle } from "@/lib/vehicles";
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
    <section className="py-16 sm:py-24 bg-white border-b border-slate-200/80 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        {/* Header & Category Filter Tabs */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#002c5f]" />
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[#002c5f]">
                TRENDING AM FORD STOCK
              </span>
            </div>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              The most searched cars
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2 md:border-none md:pb-0">
            {CATEGORIES.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative rounded-xl px-4 py-2 text-xs font-black transition-all ${
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
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {displayVehicles.map((car) => (
              <motion.div
                key={car.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35 }}
                className="group flex flex-col overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#002c5f]/30 hover:shadow-xl"
              >
                {/* Photo & Badge */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  <img
                    src={car.image}
                    alt={`${car.year} ${car.make} ${car.model}`}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-slate-900/80 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md backdrop-blur-md">
                      {car.condition === "New" ? "IN STOCK NOW" : "CERTIFIED PRE-OWNED"}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-[#002c5f] transition-colors">
                      {car.year} {car.make} {car.model} {car.trim}
                    </h3>
                    <p className="mt-1.5 text-xs font-bold text-[#002c5f]">
                      ${car.price.toLocaleString()}{" "}
                      <span className="font-medium text-slate-500">
                        {car.msrp ? `- $${car.msrp.toLocaleString()} MSRP*` : "*"}
                      </span>
                    </p>
                  </div>

                  {/* Dealer Offers CTA Button */}
                  <div className="mt-5">
                    <button
                      onClick={() => {
                        setSelectedCar(car);
                        setOfferModalOpen(true);
                      }}
                      className="w-full rounded-2xl border-2 border-[#002c5f] bg-white py-2.5 text-xs font-black uppercase tracking-wider text-[#002c5f] transition-all hover:bg-[#002c5f] hover:text-white hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5"
                    >
                      <span>View Offers</span>
                    </button>
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
