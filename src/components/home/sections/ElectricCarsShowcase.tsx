import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Zap, ShieldCheck, Tag } from "lucide-react";
import { vehicles } from "@/lib/vehicles";
import { OfferPopup } from "@/components/popups/OfferPopup";

export function ElectricCarsShowcase() {
  const [offerModalOpen, setOfferModalOpen] = useState(false);

  // Filter EV and Hybrid vehicles
  const evVehicles = vehicles.filter(
    (v) =>
      v.fuel === "Electric" ||
      v.fuel === "Hybrid" ||
      v.model.includes("Lightning") ||
      v.model.includes("Mach-E"),
  );

  return (
    <section className="py-16 sm:py-24 bg-slate-900 text-white overflow-hidden relative">
      {/* Background Ambient Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[25rem] w-[50rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25"
        style={{
          background: "radial-gradient(ellipse at center, rgba(14,165,233,0.3), transparent 70%)",
          filter: "blur(70px)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-sky-400">
                <Zap className="h-3.5 w-3.5" /> NEXT-GEN FORD ELECTRIFIED
              </span>
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Electric & Hybrid Fords
            </h2>
            <p className="mt-2 max-w-xl text-sm font-medium text-slate-300 sm:text-base">
              Experience instant torque, zero tailpipe emissions, and Ford's next-generation EV
              charging network in {`Jefferson, Ohio`}.
            </p>
          </div>

          <Link
            to="/inventory"
            search={{ fuel: "Electric" }}
            className="group inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-900 shadow-xl transition hover:bg-sky-400 hover:text-slate-950 active:scale-95 shrink-0"
          >
            <span>Explore All EVs</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 4-Card EV Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {evVehicles.slice(0, 4).map((car) => (
            <motion.div
              key={car.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group flex flex-col overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950/80 p-1.5 shadow-2xl transition-all duration-300 hover:border-sky-500/40 hover:bg-slate-950"
            >
              {/* Photo & Spec Badge */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.4rem] bg-slate-900">
                <img
                  src={car.image}
                  alt={`${car.year} ${car.make} ${car.model}`}
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute left-3 top-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-slate-950/85 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-sky-300 shadow-md backdrop-blur-md">
                    <Zap className="h-3 w-3 text-sky-400" />
                    {car.fuel === "Electric" ? "100% ELECTRIC" : "FULL HYBRID"}
                  </span>
                </div>
              </div>

              {/* Card Details */}
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-sky-400 transition-colors">
                    {car.year} {car.make} {car.model} {car.trim}
                  </h3>
                  <p className="mt-1.5 text-xs font-bold text-sky-300">
                    ${car.price.toLocaleString()}{" "}
                    <span className="font-medium text-slate-400">
                      {car.msrp ? `- $${car.msrp.toLocaleString()} MSRP*` : "*"}
                    </span>
                  </p>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 border-t border-slate-800/80 pt-3">
                    <span className="flex items-center gap-1 text-slate-300">
                      <ShieldCheck className="h-3.5 w-3.5 text-sky-400" /> Factory EV Warranty
                    </span>
                    <span className="text-sky-300 font-bold">{car.mpg}</span>
                  </div>

                  <button
                    onClick={() => setOfferModalOpen(true)}
                    className="w-full rounded-2xl border border-sky-400/40 bg-sky-500/10 py-2.5 text-xs font-black uppercase tracking-wider text-sky-300 transition-all hover:bg-sky-400 hover:text-slate-950 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    <Tag className="h-3.5 w-3.5" />
                    <span>View EV Savings</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {offerModalOpen && (
        <OfferPopup onClose={() => setOfferModalOpen(false)} pageSource="ElectricShowcase" />
      )}
    </section>
  );
}
