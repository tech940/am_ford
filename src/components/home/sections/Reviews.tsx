import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Clock, MapPin, Navigation, Phone, Star } from "lucide-react";

const REVIEWS = [
  {
    name: "Jason M.",
    location: "Jefferson, OH",
    vehicle: "F-150 Lariat",
    quote:
      "Great experience! The team at AM Ford Jefferson was professional, helpful, and made the vehicle delivery process so easy. Highly recommend!",
  },
  {
    name: "Marcus T.",
    location: "Ashtabula, OH",
    vehicle: "F-150 Platinum",
    quote:
      "Felt more like a private showroom than a dealership. They had the truck detailed and the paperwork ready — I was on the road in forty minutes.",
  },
  {
    name: "Elena R.",
    location: "Conneaut, OH",
    vehicle: "Escape Titanium Hybrid",
    quote:
      "No pressure, no games. They walked me through the inspection report line by line before I even asked. That's what earned my trust.",
  },
  {
    name: "Sarah W.",
    location: "Geneva, OH",
    vehicle: "Bronco Outer Banks",
    quote:
      "They found the exact spec I wanted in three days. Communication was constant without being pushy — genuinely impressive dealership.",
  },
];

const AUTO_MS = 5000;

export function Reviews() {
  const [[index, dir], setIndex] = useState<[number, 1 | -1]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused || reduced) return;
    timer.current = setInterval(() => {
      setIndex(([i]) => [(i + 1) % REVIEWS.length, 1]);
    }, AUTO_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, reduced, index]);

  const currentReview = REVIEWS[index];

  return (
    <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200/80 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* LEFT CARD: What Our Customers Say */}
          <div
            className="lg:col-span-5 flex flex-col justify-between rounded-[2.5rem] border border-slate-200/90 bg-white p-7 sm:p-9 shadow-xl relative min-h-[380px]"
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002c5f] tracking-tight">
                What Our Customers Say
              </h2>

              <div
                className="mt-4 flex items-center gap-1"
                role="img"
                aria-label="5 out of 5 stars rating"
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" aria-hidden />
                ))}
              </div>

              <div className="relative mt-5 min-h-[120px]">
                <AnimatePresence mode="wait" custom={dir} initial={false}>
                  <motion.blockquote
                    key={index}
                    initial={{ opacity: 0, x: dir * 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir * -30 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="text-sm sm:text-base font-medium italic leading-relaxed text-slate-700"
                  >
                    “{currentReview.quote}”
                  </motion.blockquote>
                </AnimatePresence>
              </div>
            </div>

            {/* Author Row + Pagination Dots */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#002c5f] text-sm font-extrabold text-white shadow-md">
                  {currentReview.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {currentReview.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-500">{currentReview.location}</p>
                </div>
              </div>

              {/* Indicator Dots */}
              <div className="flex items-center gap-0.5">
                {REVIEWS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(([cur]) => [i, i > cur ? 1 : -1])}
                    className="flex h-11 w-11 items-center justify-center rounded-full p-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#002c5f]/30"
                    aria-label={`Go to review slide ${i + 1}`}
                  >
                    <span
                      className={`block h-2.5 rounded-full transition-all ${
                        i === index ? "w-7 bg-[#002c5f]" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT CARD: Visit Our Dealership */}
          <div className="lg:col-span-7 rounded-[2.5rem] bg-[#002c5f] text-white shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[380px]">
            {/* Info Column */}
            <div className="md:col-span-6 p-7 sm:p-9 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Visit Our Dealership
                </h3>

                <div className="mt-6 flex flex-col gap-5">
                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sky-300 backdrop-blur-sm">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-sky-300">
                        MAIN FLAGSHIP SHOWROOM
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-200 leading-snug">
                        1999 S Lake St, Jefferson, OH 44047
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sky-300 backdrop-blur-sm">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-sky-300">
                        CALL US
                      </p>
                      <a
                        href="tel:4405761010"
                        className="mt-0.5 block text-xs font-bold text-slate-200 hover:text-white transition"
                      >
                        (440) 576-1010
                      </a>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sky-300 backdrop-blur-sm">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-sky-300">
                        BUSINESS HOURS
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-200 leading-snug">
                        Mon - Sat: 9:00 AM - 7:00 PM
                        <br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Get Directions Button */}
              <a
                href="https://www.google.com/maps/search/?api=1&query=AM+Ford+1999+S+Lake+St+Jefferson+OH+44047"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 px-6 text-xs font-black uppercase tracking-wider text-[#002c5f] shadow-lg hover:bg-slate-100 transition active:scale-95"
              >
                <Navigation className="h-4 w-4 text-[#002c5f]" />
                <span>GET DIRECTIONS</span>
              </a>
            </div>

            {/* Embedded Google Map Column */}
            <div className="md:col-span-6 relative min-h-[260px] md:min-h-full w-full bg-slate-900">
              <iframe
                src="https://maps.google.com/maps?q=1999%20S%20Lake%20St,%20Jefferson,%20OH%2044047&t=&z=14&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full object-cover min-h-[260px]"
                title="AM Ford Dealership Location Map"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
