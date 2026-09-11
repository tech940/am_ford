import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Lock,
  CheckCircle2,
  HelpCircle,
  Pencil,
  Flame,
} from "lucide-react";
import { vehicles, type Vehicle, vehicleSlug } from "@/lib/vehicles";
import { OfferPopup } from "@/components/popups/OfferPopup";
import { isSaved, toggleSaved, GARAGE_EVENT } from "@/lib/garage";
import heroTruck from "@/assets/hero-truck.jpg";
import carExplorer from "@/assets/car-explorer.jpg";
import carBronco from "@/assets/car-bronco.jpg";

/** Calculate estimated 72mo payment at typical competitive APR */
const calcEstPayment = (price: number) => Math.round(price * 0.01425);

function getFallbackImage(car: Vehicle): string {
  if (car.type === "Truck" || car.model.includes("F-150") || car.model.includes("F-250") || car.model.includes("Super Duty")) {
    return heroTruck;
  }
  if (car.model.includes("Bronco")) {
    return carBronco;
  }
  return carExplorer;
}

export function NewArrivals() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Vehicle | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Sort vehicles by newest year / lowest mileage / newest inventory
  const newArrivalsList = vehicles
    .filter((v) => v.condition === "New" || v.condition === "Certified Pre-Owned" || v.year >= 2023)
    .sort((a, b) => b.year - a.year || a.miles - b.miles)
    .slice(0, 12);

  // Fallback to top vehicles if list is small
  const displayList = newArrivalsList.length >= 6 ? newArrivalsList : vehicles.slice(0, 10);

  // Sync garage saved state
  useEffect(() => {
    const syncSaved = () => {
      setSavedIds(displayList.filter((v) => isSaved(v.id)).map((v) => v.id));
    };
    syncSaved();
    window.addEventListener(GARAGE_EVENT, syncSaved);
    return () => window.removeEventListener(GARAGE_EVENT, syncSaved);
  }, []);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = 320; // approximate card width with gap
    const scrollAmount = direction === "left" ? -cardWidth * 2 : cardWidth * 2;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    setTimeout(checkScroll, 350);
  };

  const handleHeartClick = (e: React.MouseEvent, carId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaved(carId);
  };

  const handleUnlockSavings = (car: Vehicle) => {
    setSelectedCar(car);
    setOfferModalOpen(true);
  };

  return (
    <section className="relative py-10 sm:py-14 lg:py-16 bg-white border-b border-slate-200/80 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              New Arrivals
            </h2>
            {/* Main Brand Midnight Navy accent underline */}
            <div className="absolute -bottom-4 left-0 h-[3px] w-24 bg-[#002c5f]" />
          </div>

          <Link
            to="/inventory"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-bold text-[#002c5f] shadow-2xs transition-all hover:border-[#002c5f] hover:bg-[#002c5f] hover:text-white active:scale-95"
          >
            <span>All Inventory</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Carousel Container with Left/Right Nav Buttons */}
        <div className="relative mt-7 group/carousel">
          {/* Left Arrow Button */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              aria-label="Previous vehicles"
              className="absolute left-1 sm:-left-5 top-[38%] z-20 grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-full border border-slate-300 bg-white/95 text-slate-700 shadow-lg backdrop-blur-sm transition hover:bg-white hover:border-[#002c5f] hover:text-[#002c5f] active:scale-90 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}

          {/* Right Arrow Button */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              aria-label="Next vehicles"
              className="absolute right-1 sm:-right-5 top-[38%] z-20 grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-full border border-slate-300 bg-white/95 text-slate-700 shadow-lg backdrop-blur-sm transition hover:bg-white hover:border-[#002c5f] hover:text-[#002c5f] active:scale-90 cursor-pointer"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}

          {/* Scrollable Track */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 snap-x snap-mandatory"
          >
            {displayList.map((car, idx) => {
              const isVehicleSaved = savedIds.includes(car.id);
              const isHot = idx % 3 === 2; // Tag specific high-demand vehicles with hot badge
              const stockNum = car.stockNumber || car.vin?.slice(-6) || `AM${car.id.slice(0, 5).toUpperCase()}`;

              return (
                <div
                  key={car.id}
                  className="w-[280px] sm:w-[295px] lg:w-[305px] shrink-0 snap-start flex flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs transition-all duration-300 hover:shadow-md hover:border-[#002c5f]/30"
                >
                  {/* Photo Area with Reliable Fallback Handling */}
                  <Link
                    to="/vehicle/$id"
                    params={{ id: vehicleSlug(car) }}
                    className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 block group"
                  >
                    <img
                      src={car.image || getFallbackImage(car)}
                      alt={`${car.year} ${car.make} ${car.model} ${car.trim}`}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = getFallbackImage(car);
                      }}
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Hot Badge in Main Navy Style */}
                    {isHot && (
                      <div className="absolute left-2.5 top-2.5 z-10">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#002c5f] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
                          <Flame className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>Hot</span>
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col justify-between p-4 sm:p-4.5">
                    <div>
                      {/* Line 1: Stock # & Condition */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span>Stock # {stockNum}</span>
                        <span className="font-semibold text-slate-700">
                          {car.condition === "Certified Pre-Owned"
                            ? "Certified Pre-Owned"
                            : car.condition === "New"
                              ? "New Arrival"
                              : "Pre-Owned"}
                        </span>
                      </div>

                      {/* Line 2: Year Make Model + Favorite Heart */}
                      <div className="mt-1.5 flex items-start justify-between gap-2">
                        <Link
                          to="/vehicle/$id"
                          params={{ id: vehicleSlug(car) }}
                          className="font-black text-slate-900 text-sm sm:text-base leading-snug line-clamp-1 hover:text-[#002c5f] transition-colors"
                        >
                          {car.year} {car.make} {car.model}
                        </Link>
                        <button
                          onClick={(e) => handleHeartClick(e, car.id)}
                          aria-label="Save to garage"
                          className="text-slate-400 hover:text-[#002c5f] transition-colors shrink-0 cursor-pointer pt-0.5"
                        >
                          <Heart
                            className={`h-4 w-4 ${isVehicleSaved ? "fill-[#002c5f] text-[#002c5f]" : ""}`}
                          />
                        </button>
                      </div>

                      {/* Line 3: Trim & Mileage */}
                      <div className="mt-1 flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span className="truncate max-w-[150px]">{car.trim}</span>
                        <span>{car.miles.toLocaleString()} miles</span>
                      </div>

                      {/* Line 4: Price & Estimated Monthly Payment */}
                      <div className="mt-3.5 flex items-baseline justify-between border-t border-slate-100 pt-3">
                        <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                          ${car.price.toLocaleString()}
                        </span>
                        <div className="text-right">
                          <span className="block text-[10px] text-slate-400 font-medium leading-none">
                            Est. Payment
                          </span>
                          <span className="inline-flex items-center text-xs font-black text-[#002c5f] mt-0.5">
                            ${calcEstPayment(car.price)}/mo
                          </span>
                        </div>
                      </div>

                      {/* Line 5: 5-Day Guarantee */}
                      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                        <span>5-day exchange guarantee</span>
                      </div>
                    </div>

                    {/* Bottom Full-Width CTA Button in Main Brand Color (#002c5f) */}
                    <button
                      onClick={() => handleUnlockSavings(car)}
                      className="mt-4 w-full rounded-lg bg-[#002c5f] py-2.5 px-3 text-xs font-black text-white shadow-sm transition-all hover:bg-[#001f44] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>Unlock additional savings</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Offer Popup modal on unlock savings */}
      {offerModalOpen && selectedCar && (
        <OfferPopup
          pageSource="Home"
          initialCarData={{
            title: `${selectedCar.year} ${selectedCar.make} ${selectedCar.model} ${selectedCar.trim}`,
            price: `$${selectedCar.price.toLocaleString()}`,
            vin: selectedCar.vin || "",
            stock: selectedCar.stockNumber || selectedCar.id,
            pageUrl: `https://amford.com/vehicle/${vehicleSlug(selectedCar)}`,
          }}
          onClose={() => {
            setOfferModalOpen(false);
            setSelectedCar(null);
          }}
        />
      )}
    </section>
  );
}

// Re-export for backward compatibility
export const MostSearchedCars = NewArrivals;
