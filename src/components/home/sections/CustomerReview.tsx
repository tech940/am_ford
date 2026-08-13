import type { CSSProperties } from "react";

/**
 * CustomerReview — large editorial pull-quote on a clean white background.
 * CPO trust signal appended below. No dark backgrounds.
 */
export function CustomerReview() {
  return (
    <section
      className="hm-observe hm-section py-24 sm:py-36"
      style={
        {
          "--bg-start": "#f0f0ee",
          "--bg-target": "#ffffff",
        } as CSSProperties
      }
      aria-label="Customer review"
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-14">
        {/* Opening quote mark */}
        <p
          className="select-none leading-none mb-6 sm:mb-8"
          aria-hidden
          style={{
            fontSize: "clamp(5rem, 14vw, 10rem)",
            fontFamily: "Georgia, serif",
            lineHeight: 1,
            color: "rgba(0,44,95,0.08)",
          }}
        >
          &ldquo;
        </p>

        {/* The quote */}
        <blockquote>
          <p
            className="font-light text-slate-800 leading-snug"
            style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.6rem)" }}
          >
            Felt more like a private showroom than a traditional dealership.
            They had the truck detailed and the paperwork ready&nbsp;—
            I was on the road in forty minutes.
          </p>

          {/* Attribution */}
          <footer className="mt-8 sm:mt-10 flex items-center gap-5">
            <div className="h-px flex-1 bg-slate-200" />
            <cite className="not-italic text-[13px] text-slate-400 font-medium tracking-wide">
              Marcus T.&nbsp;&nbsp;·&nbsp;&nbsp;Ashtabula, OH&nbsp;&nbsp;·&nbsp;&nbsp;2025 Ford F-150 Platinum
            </cite>
          </footer>
        </blockquote>

        {/* CPO trust signal */}
        <div className="mt-16 sm:mt-20 pt-8 border-t border-slate-100">
          <p className="text-[13px] font-light text-slate-400 max-w-2xl leading-relaxed">
            Every certified pre-owned vehicle at AM Ford passes a 139-point inspection,
            includes a CARFAX history report, and carries a CPO limited warranty.
            Transparent paperwork, no obligation.
          </p>
        </div>
      </div>
    </section>
  );
}
