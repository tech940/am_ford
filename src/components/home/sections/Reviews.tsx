import { Star, Quote, CheckCircle2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

const REVIEWS = [
  {
    name: "Jason M.",
    location: "Ashtabula County, OH",
    vehicle: "2024 Ford F-150 Lariat",
    date: "Verified Buyer · 2 weeks ago",
    quote:
      "Great experience from start to finish! The team at AM Ford was professional, helpful, and made the vehicle delivery process so easy. No hidden fees, no pressure.",
  },
  {
    name: "Marcus T.",
    location: "Ashtabula, OH",
    vehicle: "2025 Ford F-150 Platinum",
    date: "Verified Buyer · 1 month ago",
    quote:
      "Felt more like a private showroom than a high-pressure dealership. They had the truck detailed and the paperwork ready — I was on the road in forty minutes.",
  },
  {
    name: "Elena R.",
    location: "Conneaut, OH",
    vehicle: "2024 Ford Escape Titanium Hybrid",
    date: "Verified Buyer · 1 month ago",
    quote:
      "No pressure, no games. They walked me through the multi-point inspection report line by line before I even asked. That is what earned my trust.",
  },
  {
    name: "Sarah W.",
    location: "Geneva, OH",
    vehicle: "2025 Ford Bronco Outer Banks",
    date: "Verified Buyer · 2 months ago",
    quote:
      "They found the exact spec and color I wanted in three days. Communication was transparent and constant without being pushy — genuinely impressive local dealership.",
  },
];

export function Reviews() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white border-b border-slate-200/80 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#002c5f]">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>Customer Satisfaction</span>
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
              What Our Drivers Say
            </h2>
          </div>

          {/* Rating Summary Pill */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5">
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <div className="text-left leading-tight">
              <span className="text-sm font-black text-slate-900">4.9 ★ Rating</span>
              <span className="block text-[11px] text-slate-500 font-medium">2,400+ Google Reviews</span>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {REVIEWS.map((r, i) => (
            <article
              key={r.name + i}
              className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-slate-50/50 p-5 sm:p-6 shadow-xs hover:border-[#002c5f]/30 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400 gap-0.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">{r.date}</span>
                </div>

                <p className="mt-3.5 text-xs sm:text-sm font-medium leading-relaxed text-slate-700 italic">
                  "{r.quote}"
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3 border-t border-slate-200/70 pt-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#002c5f] text-xs font-bold text-white shadow-2xs">
                  {r.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{r.name}</h4>
                    <span className="text-[10px] text-slate-400">· {r.location}</span>
                  </div>
                  <p className="text-[11px] font-medium text-[#002c5f] truncate">{r.vehicle}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

