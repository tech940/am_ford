import type { CSSProperties } from "react";

/**
 * OfferStrip — thin $500 trade-in bonus banner.
 * Sits between Inventory Reveal and Delivery Strip.
 * Light background color transition on scroll. No dark colors.
 */
export function OfferStrip() {
  return (
    <div
      className="hm-observe hm-section border-y border-slate-200/60"
      style={
        {
          "--bg-start": "#f0f0ee",
          "--bg-target": "#eef4ff",
        } as CSSProperties
      }
      role="complementary"
      aria-label="Current offer"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-14">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-5 sm:py-6">
          <p className="text-sm font-light text-slate-700">
            <span className="font-semibold text-[#002c5f]">$500 trade-in bonus</span>
            &nbsp;&mdash;&nbsp;
            Trade any make or model at AM Ford and receive an extra $500 credited on top of your market appraisal.
          </p>
          <p className="hm-eyebrow text-slate-400 shrink-0">Limited time offer</p>
        </div>
      </div>
    </div>
  );
}
