import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";

const HERO_BANNER_IMAGE =
  "https://di-uploads-development.dealerinspire.com/amford/uploads/2025/08/am-ford-banner.webp";

/** Hero quick-filter chips. Each carries whichever /inventory search params it sets. */
type QuickFilter = {
  label: string;
  q?: string;
  priceMax?: number;
  condition?: "New" | "Used" | "Certified Pre-Owned";
};

const QUICK_TAGS: QuickFilter[] = [
  { label: "F-150", q: "F-150" },
  { label: "Super Duty", q: "Super Duty" },
  { label: "Explorer", q: "Explorer" },
  { label: "Bronco", q: "Bronco" },
  { label: "Escape", q: "Escape" },
  { label: "Mustang", q: "Mustang" },
  { label: "Under $25k", priceMax: 25000 },
  { label: "New", condition: "New" },
  { label: "Pre-Owned", condition: "Used" },
];

export function Hero() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({
        to: "/inventory",
        search: { q: searchQuery.trim() },
      });
    } else {
      navigate({ to: "/inventory" });
    }
  };

  return (
    <section
      className="relative flex min-h-[570px] sm:min-h-[640px] lg:min-h-[680px] xl:min-h-[740px] w-full items-center justify-center overflow-hidden bg-slate-950"
      aria-label="AM Ford Dealership Hero"
    >
      {/* Dealership Banner Image with Clean Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_BANNER_IMAGE}
          alt="AM Ford Dealership Showroom in Ashtabula County, Ohio"
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-slate-950/60" />
      </div>

      {/* Clean Centered Content with Optical Balance */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-24 lg:py-28 text-center">
        {/* Main Headline (Formatted in two lines) */}
        <h1 className="text-balance text-[24px] sm:text-[38px] md:text-[42px] lg:text-[46px] xl:text-[50px] font-black tracking-tight leading-[1.18] text-white drop-shadow-lg max-w-5xl">
          <span className="block">Ashtabula County&apos;s largest selection of</span>
          <span className="block">new & pre-owned cars, trucks, & SUVs</span>
        </h1>

        {/* Subtitle (Reduced by 3px) */}
        <p className="mt-3.5 sm:mt-4 text-balance text-[13px] sm:text-[17px] lg:text-[19px] font-medium text-slate-100/95 tracking-wide drop-shadow-md max-w-3xl">
          Ford F-150 • Super Duty • Explorer • Bronco • Escape • Mustang • and more
        </p>

        {/* Centered Search Bar (Height reduced by 15-20%) */}
        <div className="mt-7 sm:mt-8 w-full max-w-3xl">
          <form onSubmit={handleSearchSubmit}>
            <div className="flex items-center rounded-full bg-white p-1.5 sm:p-2 shadow-2xl ring-1 ring-black/10 transition-all focus-within:ring-2 focus-within:ring-[#002c5f] focus-within:shadow-[0_20px_60px_rgba(0,44,95,0.3)]">
              <Search className="ml-3.5 sm:ml-4 h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by make, model, feature"
                className="w-full bg-transparent px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-sm sm:text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#002c5f] px-5 sm:px-7 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-[#001f44] active:scale-95 cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Clean Quick Filter Pills (Font reduced by 1-1.5px) */}
          <div className="mt-4 sm:mt-4.5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <span className="text-[10.5px] sm:text-[12.5px] font-medium text-slate-300 mr-1">Popular:</span>
            {QUICK_TAGS.map((item) => (
              <Link
                key={item.label}
                to="/inventory"
                search={{
                  q: item.q,
                  priceMax: item.priceMax,
                  condition: item.condition,
                }}
                className="rounded-full border border-white/20 bg-white/10 px-3 sm:px-3.5 py-1 text-[10.5px] sm:text-[12.5px] font-medium text-white backdrop-blur-sm transition hover:bg-white/25 active:scale-95"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
