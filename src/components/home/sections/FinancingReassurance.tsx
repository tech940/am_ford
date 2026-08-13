import { Link } from "@tanstack/react-router";
import { dealerInfo } from "@/lib/vehicles";
import type { CSSProperties } from "react";

const STATEMENTS = [
  {
    label: "Pre-approval",
    body: "Soft-pull only. Your credit score stays intact while you explore your options.",
  },
  {
    label: "Competitive rates",
    body: "We work with 20+ Ohio credit unions and national lenders to find your best terms.",
  },
  {
    label: "Every situation",
    body: "First-time buyer, rebuilding credit, or pristine score — we'll find a path. Talk to us.",
  },
] as const;

/**
 * Financing — typographic statement row on a light background.
 * Three prose statements separated by rules. No dark backgrounds, no icons.
 */
export function FinancingReassurance() {
  return (
    <section
      className="hm-observe hm-section py-24 sm:py-36"
      style={
        {
          "--bg-start": "#f0f0ee",
          "--bg-target": "#f5f7fa",
        } as CSSProperties
      }
      aria-labelledby="financing-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-14">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-12 sm:mb-16">
          <div>
            <p className="hm-eyebrow text-slate-400 mb-3">Financing</p>
            <h2
              id="financing-heading"
              className="hm-display text-[#002c5f]"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
            >
              Straightforward.
              <br />
              No surprises.
            </h2>
          </div>
          <Link
            to="/financing"
            className="hm-arrow-link text-sm font-semibold text-[#002c5f] border-b border-[#002c5f]/30 pb-0.5 hover:border-[#002c5f] transition-colors shrink-0"
          >
            Explore financing&nbsp;&nbsp;&#8594;
          </Link>
        </div>

        {/* Three typographic statements */}
        <div className="space-y-0">
          {STATEMENTS.map((s, i) => (
            <div key={i}>
              {i > 0 && <hr className="hm-rule" />}
              <div className="grid grid-cols-1 gap-3 py-10 sm:py-12 md:grid-cols-12 md:gap-10 md:items-start">
                <p className="hm-eyebrow text-slate-400 md:col-span-3 md:pt-1">{s.label}</p>
                <p className="text-base sm:text-lg font-light leading-relaxed text-slate-700 md:col-span-9">
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <hr className="hm-rule" />
        <div className="py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm font-light text-slate-500">
            Questions about financing? Call our team directly.
          </p>
          <a
            href={dealerInfo.phoneHref}
            className="hm-arrow-link text-sm font-semibold text-[#002c5f] border-b border-[#002c5f]/30 pb-0.5 hover:border-[#002c5f] transition-colors"
          >
            {dealerInfo.phone}&nbsp;&nbsp;&#8594;
          </a>
        </div>
      </div>
    </section>
  );
}
