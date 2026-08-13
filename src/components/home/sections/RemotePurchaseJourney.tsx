import { DELIVERY_CLAIM, DELIVERY_SHORT, DELIVERY_SHIPPING } from "@/lib/vehicles";
import type { CSSProperties } from "react";

/**
 * Delivery Strip — full-width light blue band.
 * One massive number, prose explanation. No icons, no steps, no dark backgrounds.
 */
export function RemotePurchaseJourney() {
  return (
    <section
      className="hm-observe hm-section py-24 sm:py-36"
      style={
        {
          "--bg-start": "#f0f0ee",
          "--bg-target": "#deeaf8",
        } as CSSProperties
      }
      aria-labelledby="delivery-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          {/* Large ghost number */}
          <div className="lg:col-span-4">
            <p
              className="hm-display leading-none select-none"
              aria-hidden
              style={{
                fontSize: "clamp(7rem, 18vw, 14rem)",
                color: "rgba(0,44,95,0.08)",
              }}
            >
              300
            </p>
          </div>

          {/* Prose */}
          <div className="lg:col-span-8">
            <p className="hm-eyebrow text-slate-400 mb-6">Free delivery</p>
            <h2
              id="delivery-heading"
              className="hm-display text-[#002c5f]"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
            >
              Your driveway
              <br />
              is our showroom.
            </h2>
            <p className="mt-7 text-base sm:text-lg font-light leading-relaxed text-slate-600 max-w-lg">
              {DELIVERY_CLAIM}
            </p>
            <p className="mt-3 text-sm font-light text-slate-400">
              {DELIVERY_SHORT}.&nbsp;&nbsp;{DELIVERY_SHIPPING}.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
