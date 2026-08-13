import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronRight, Search, ShieldCheck, Tag } from "lucide-react";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import { dealerInfo, vehicles } from "@/lib/vehicles";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * "Find your right car" Quick Search Widget (Aligned with AM Ford Brand System)
 * Styled in Ford Midnight Navy (#002c5f) and slate typography, positioned on the right side.
 */
function FindYourRightCarCard() {
  const navigate = useNavigate();
  const [conditionTab, setConditionTab] = useState<"New" | "Used">("New");
  const [filterBy, setFilterBy] = useState<"budget" | "body">("budget");
  const [budget, setBudget] = useState<string>("all");
  const [bodyType, setBodyType] = useState<string>("All");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams: Record<string, string | number | undefined> = {
      condition: conditionTab === "New" ? "New" : "Used",
      type: bodyType !== "All" ? bodyType : undefined,
    };

    if (budget === "under_30k") {
      searchParams.priceMax = 30000;
    } else if (budget === "30k_45k") {
      searchParams.priceMin = 30000;
      searchParams.priceMax = 45000;
    } else if (budget === "45k_60k") {
      searchParams.priceMin = 45000;
      searchParams.priceMax = 60000;
    } else if (budget === "above_60k") {
      searchParams.priceMin = 60000;
    }

    navigate({
      to: "/inventory",
      search: searchParams,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.25 }}
      className="relative w-full overflow-hidden rounded-[2rem] border border-[#002c5f]/15 bg-white p-6 sm:p-7 shadow-2xl shadow-[#002c5f]/15"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Find your right car</h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#002c5f]/10 px-2.5 py-0.5 text-[10px] font-extrabold text-[#002c5f] uppercase tracking-wider">
          AM FORD
        </span>
      </div>

      {/* New / Used Car Tabs */}
      <div className="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setConditionTab("New")}
          className={cn(
            "rounded-xl py-2.5 text-xs font-black transition-all",
            conditionTab === "New"
              ? "bg-[#002c5f] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900",
          )}
        >
          NEW CAR
        </button>
        <button
          type="button"
          onClick={() => setConditionTab("Used")}
          className={cn(
            "rounded-xl py-2.5 text-xs font-black transition-all",
            conditionTab === "Used"
              ? "bg-[#002c5f] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900",
          )}
        >
          USED CAR
        </button>
      </div>

      {/* Radio Filter Toggle: By Budget / By Body Style */}
      <div className="mt-4 flex items-center gap-6 text-xs font-extrabold text-slate-700">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="radio"
            name="filterBy"
            checked={filterBy === "budget"}
            onChange={() => setFilterBy("budget")}
            className="h-4 w-4 accent-[#002c5f] cursor-pointer"
          />
          <span>By Budget</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="radio"
            name="filterBy"
            checked={filterBy === "body"}
            onChange={() => setFilterBy("body")}
            className="h-4 w-4 accent-[#002c5f] cursor-pointer"
          />
          <span>By Body Style</span>
        </label>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mt-4 flex flex-col gap-3.5">
        {/* Dropdown 1: Select Budget */}
        <div>
          <label
            htmlFor="hero-budget-select"
            className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500"
          >
            Select Budget
          </label>
          <select
            id="hero-budget-select"
            aria-label="Select Budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-xs font-bold text-slate-900 outline-none transition focus:border-[#002c5f] focus:ring-2 focus:ring-[#002c5f]/20 shadow-sm"
          >
            <option value="all">All Budget Ranges</option>
            <option value="under_30k">Under $30,000</option>
            <option value="30k_45k">$30,000 – $45,000</option>
            <option value="45k_60k">$45,000 – $60,000</option>
            <option value="above_60k">$60,000+</option>
          </select>
        </div>

        {/* Dropdown 2: Vehicle Types */}
        <div>
          <label
            htmlFor="hero-body-type-select"
            className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500"
          >
            Vehicle Type / Body Style
          </label>
          <select
            id="hero-body-type-select"
            aria-label="Vehicle Type or Body Style"
            value={bodyType}
            onChange={(e) => setBodyType(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-xs font-bold text-slate-900 outline-none transition focus:border-[#002c5f] focus:ring-2 focus:ring-[#002c5f]/20 shadow-sm"
          >
            <option value="All">All Vehicle Types</option>
            <option value="Truck">Trucks (F-150, Super Duty)</option>
            <option value="SUV">SUVs (Explorer, Bronco, Escape)</option>
            <option value="Car">Cars & Muscle (Mustang)</option>
            <option value="Commercial">Commercial & Work Trucks</option>
          </select>
        </div>

        {/* Primary Ford Midnight Navy Search CTA Button */}
        <button
          type="submit"
          className="group relative mt-1 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#002c5f] py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-[#002c5f]/25 hover:bg-[#001f44] active:scale-[0.98] transition-all"
        >
          <Search className="h-4 w-4 transition-transform group-hover:scale-110" />
          <span>SEARCH INVENTORY</span>
        </button>

        {/* Footer Link */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-slate-500 font-medium">{vehicles.length} Vehicles Available</span>
          <Link
            to="/inventory"
            className="inline-flex items-center gap-1 font-bold text-[#002c5f] hover:underline"
          >
            <span>Advanced Search</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </form>
    </motion.div>
  );
}

/**
 * Hero section: Left Text Overlay + Right "Find your right car" Search Widget.
 */
export function Hero() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const stageY = useTransform(scrollYProgress, [0, 0.18], [0, 50]);
  const stageOpacity = useTransform(scrollYProgress, [0, 0.16], [1, 0.4]);

  return (
    <section
      className="relative flex min-h-[92svh] lg:min-h-[105svh] flex-col justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Background HD Ford Vehicle Stage */}
      <motion.div
        style={reduced ? undefined : { y: stageY, opacity: stageOpacity }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0">
          <ResponsiveImage
            name="hero-truck"
            alt={`New Ford F-150 at AM Ford in ${dealerInfo.locality}, Ohio`}
            sizes="100vw"
            priority
            className="h-full w-full object-cover object-center"
          />
          {/* Scrim for text legibility & crisp vehicle visibility */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(248,250,252,0.70) 0%, rgba(248,250,252,0.40) 45%, rgba(248,250,252,0.10) 75%, transparent 100%), linear-gradient(180deg, rgba(248,250,252,0.15) 0%, transparent 45%, rgba(248,250,252,0.65) 88%, #F8FAFC 100%)",
            }}
          />
        </div>
      </motion.div>

      {/* Main hero grid: Left Text Headline + Right "Find your right car" Search Widget */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 sm:px-8 lg:px-12 pb-24 pt-24 sm:pt-32 sm:pb-32 lg:pt-36 lg:pb-36">
        <div className="grid items-center gap-8 lg:grid-cols-12">
          {/* LEFT SIDE (col-span-7): Headline & Brand Messaging */}
          <div className="flex flex-col items-start lg:col-span-7 xl:col-span-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#002c5f]/20 bg-white/80 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.3em] text-[#002c5f] shadow-sm backdrop-blur-md">
              Family-owned · {dealerInfo.locality}, Ohio
            </p>

            <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Your Ford dealership in{" "}
              <span className="bg-gradient-to-r from-[#002c5f] via-[#004085] to-[#0056b3] bg-clip-text text-transparent">
                {dealerInfo.locality}, Ohio
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-slate-700 sm:text-lg drop-shadow-sm">
              Browse real-time inventory at AM Ford in {dealerInfo.city}, serving Ashtabula County
              and Northeast Ohio. New Ford trucks and SUVs, certified pre-owned stock, transparent
              pricing, and instant trade-in valuations.
            </p>

            {/* CTAs & Trust Badges Row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: EASE_OUT, delay: 0.65 }}
              className="mt-6 flex flex-wrap items-center gap-4"
            >
              <Link
                to="/inventory"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#002c5f] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-[#002c5f]/25 hover:bg-[#001f44] transition active:scale-95"
              >
                <span>Browse Inventory</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/financing"
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#002c5f]/20 bg-white/90 px-5 py-3 text-xs font-black uppercase tracking-wider text-[#002c5f] shadow-md hover:bg-white transition active:scale-95"
              >
                <Tag className="h-4 w-4 text-[#002c5f]" />
                <span>Get Financed</span>
              </Link>
            </motion.div>

            {/* Quick Feature Pills */}
            <div className="mt-8 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-900/10 w-full">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <ShieldCheck className="h-4 w-4 text-[#002c5f]" /> Factory Warranty Included
              </span>
              <span className="text-slate-400">·</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Tag className="h-4 w-4 text-[#002c5f]" /> Real Trade-In Appraisals
              </span>
              <span className="text-slate-400">·</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                Home Delivery Available
              </span>
            </div>
          </div>

          {/* RIGHT SIDE (col-span-5): "Find your right car" Search Widget */}
          <div className="lg:col-span-5 xl:col-span-5">
            <FindYourRightCarCard />
          </div>
        </div>
      </div>
    </section>
  );
}
