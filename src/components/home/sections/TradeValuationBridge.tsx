import { useState, type CSSProperties } from "react";
import { TradeValuatorModal } from "@/components/convert/TradeValuatorModal";

const POPULAR_MAKES = ["Ford", "Chevrolet", "Toyota", "Honda", "Ram", "Jeep", "GMC", "Other"];
const YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];

/**
 * Trade-In split section.
 * Light background bloom on scroll.
 * Zero dark backgrounds, zero Lucide icons.
 */
export function TradeValuationBridge() {
  const [modalOpen, setModalOpen] = useState(false);
  const [year, setYear] = useState<number>(2021);
  const [make, setMake] = useState<string>("Ford");
  const [model, setModel] = useState<string>("");
  const [mileageRange, setMileageRange] = useState<string>("30k_60k");

  const handleStartValuation = (e: React.FormEvent) => {
    e.preventDefault();
    setModalOpen(true);
  };

  const selectCls =
    "w-full border-b border-slate-300 bg-transparent py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#002c5f] cursor-pointer";

  return (
    <section
      className="hm-observe hm-section border-t border-slate-200/60"
      style={
        {
          "--bg-start": "#f0f0ee",
          "--bg-target": "#eef4ff",
        } as CSSProperties
      }
      aria-labelledby="trade-heading"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left — editorial headline */}
        <div className="py-24 sm:py-36 px-5 sm:px-10 lg:px-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-200/60">
          <p className="hm-eyebrow text-slate-400 mb-5">Trade-in</p>
          <h2
            id="trade-heading"
            className="hm-display text-[#002c5f]"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
          >
            Your current car
            <br />
            is worth more
            <br />
            than you think.
          </h2>
          <p className="mt-6 text-base font-light leading-relaxed text-slate-600 max-w-sm">
            Apply the real market equity of your vehicle directly toward any new or
            certified Ford in our stock. Zero obligation.
          </p>
        </div>

        {/* Right — form */}
        <div className="py-24 sm:py-36 px-5 sm:px-10 lg:px-16 flex flex-col justify-center">
          <p className="hm-eyebrow text-slate-400 mb-5">Get your value</p>
          <h3
            className="hm-display text-slate-900 mb-8"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}
          >
            Quick appraisal.
          </h3>

          <form onSubmit={handleStartValuation} className="space-y-5">
            {/* Year */}
            <div>
              <label
                htmlFor="trade-year"
                className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1"
              >
                Year
              </label>
              <select
                id="trade-year"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className={selectCls}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Make */}
            <div>
              <label
                htmlFor="trade-make"
                className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1"
              >
                Make
              </label>
              <select
                id="trade-make"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className={selectCls}
              >
                {POPULAR_MAKES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div>
              <label
                htmlFor="trade-model"
                className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1"
              >
                Model / Trim
              </label>
              <input
                id="trade-model"
                type="text"
                placeholder="e.g. F-150 XLT, Silverado, RAV4"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full border-b border-slate-300 bg-transparent py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#002c5f] placeholder:text-slate-400"
              />
            </div>

            {/* Mileage */}
            <div>
              <label
                htmlFor="trade-mileage"
                className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1"
              >
                Approximate Mileage
              </label>
              <select
                id="trade-mileage"
                value={mileageRange}
                onChange={(e) => setMileageRange(e.target.value)}
                className={selectCls}
              >
                <option value="under_30k">Under 30,000 miles</option>
                <option value="30k_60k">30,000 – 60,000 miles</option>
                <option value="60k_100k">60,000 – 100,000 miles</option>
                <option value="above_100k">100,000+ miles</option>
              </select>
            </div>

            <button
              type="submit"
              className="mt-4 w-full bg-[#002c5f] text-white py-3.5 text-sm font-semibold tracking-wide transition-colors hover:bg-[#001f44]"
            >
              Get My Trade Value &nbsp;&#8594;
            </button>

            <p className="text-[11px] text-slate-500 text-center">
              Takes less than 60 seconds &middot; Zero obligation
            </p>
          </form>
        </div>
      </div>

      {modalOpen && (
        <TradeValuatorModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onOpenChange={setModalOpen}
          initialYear={year}
          initialMake={make}
          initialModel={model}
          initialMileage={
            mileageRange === "under_30k"
              ? "25000"
              : mileageRange === "30k_60k"
                ? "45000"
                : mileageRange === "60k_100k"
                  ? "80000"
                  : "120000"
          }
        />
      )}
    </section>
  );
}
