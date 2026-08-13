import { useState, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { TradeValuatorModal } from "@/components/convert/TradeValuatorModal";
import { dealerInfo, vehicles } from "@/lib/vehicles";

/**
 * FinalNextStep — simple typographic CTA close.
 * Light background bloom on scroll. No dark colors.
 * No cards, no icons.
 */
export function FinalNextStep() {
  const [tradeModalOpen, setTradeModalOpen] = useState(false);

  return (
    <section
      className="hm-observe hm-section border-t border-slate-200/60 py-28 sm:py-40"
      style={
        {
          "--bg-start": "#f0f0ee",
          "--bg-target": "#deeaf8",
        } as CSSProperties
      }
      aria-labelledby="final-cta-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-14 text-center">
        <p className="hm-eyebrow text-slate-400 mb-6">Ready?</p>
        <h2
          id="final-cta-heading"
          className="hm-display text-[#002c5f] mx-auto"
          style={{ fontSize: "clamp(2.8rem, 7vw, 6rem)", maxWidth: "16ch" }}
        >
          Find yours.
        </h2>
        <p className="mt-5 text-base sm:text-lg font-light text-slate-600 max-w-md mx-auto leading-relaxed">
          {vehicles.length} vehicles in stock in Jefferson, Ohio.
          Browse online or talk to someone directly.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
          <Link
            to="/inventory"
            className="hm-arrow-link text-base font-semibold text-[#002c5f] border-b border-[#002c5f]/40 pb-0.5 hover:border-[#002c5f] transition-colors"
          >
            Browse inventory&nbsp;&nbsp;&#8594;
          </Link>

          <button
            type="button"
            onClick={() => setTradeModalOpen(true)}
            className="hm-arrow-link text-base font-semibold text-slate-600 border-b border-slate-300 pb-0.5 hover:text-[#002c5f] hover:border-[#002c5f] transition-colors cursor-pointer"
          >
            Value my trade&nbsp;&nbsp;&#8594;
          </button>

          <a
            href={dealerInfo.phoneHref}
            className="hm-arrow-link text-base font-semibold text-slate-600 border-b border-slate-300 pb-0.5 hover:text-[#002c5f] hover:border-[#002c5f] transition-colors"
          >
            Call us&nbsp;&nbsp;&#8594;
          </a>
        </div>
      </div>

      {tradeModalOpen && (
        <TradeValuatorModal
          open={tradeModalOpen}
          onClose={() => setTradeModalOpen(false)}
          onOpenChange={setTradeModalOpen}
        />
      )}
    </section>
  );
}
