import { dealerInfo } from "@/lib/vehicles";

/**
 * Dealer Identity — full-width editorial image stacked above an info strip.
 * Image takes 100% width at a generous height, info sits in a clean row below.
 */
export function HeritageAndProof() {
  return (
    <section className="hm-observe" aria-labelledby="dealer-heading">
      {/* Full-width banner image */}
      <div className="relative w-full overflow-hidden" style={{ height: "clamp(320px, 55vw, 680px)" }}>
        <img
          src="https://di-uploads-development.dealerinspire.com/amford/uploads/2025/08/am-ford-banner.webp"
          alt="AM Ford dealership lot in Jefferson, Ohio"
          loading="lazy"
          className="h-full w-full object-cover object-center"
        />
        {/* Subtle bottom scrim so the strip reads cleanly beneath */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.30) 100%)",
          }}
          aria-hidden
        />
        {/* Eyebrow overlaid top-left */}
        <div className="absolute top-0 left-0 px-5 sm:px-10 lg:px-14 py-6">
          <p className="hm-eyebrow text-white/70">Visit us</p>
        </div>
      </div>

      {/* Info strip below image */}
      <div
        className="hm-observe hm-section"
        style={
          {
            "--bg-start": "#ebebea",
            "--bg-target": "#f5f5f3",
          } as React.CSSProperties
        }
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-14 py-12 sm:py-16">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">

            {/* Col 1: Name + headline */}
            <div className="lg:col-span-1">
              <h2
                id="dealer-heading"
                className="hm-display text-slate-900"
                style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}
              >
                AM Ford.
                <br />
                Jefferson, Ohio.
              </h2>
            </div>

            {/* Col 2: Address + Phone */}
            <div>
              <p className="hm-eyebrow text-slate-400 mb-4">Address</p>
              <address className="not-italic text-[14px] leading-relaxed text-slate-600">
                {dealerInfo.street}
                <br />
                {dealerInfo.locality}, {dealerInfo.region} {dealerInfo.postalCode}
              </address>
              <a
                href={dealerInfo.phoneHref}
                className="mt-3 inline-block text-[14px] font-semibold text-[#002c5f] hover:text-[#001f44] transition-colors"
              >
                {dealerInfo.phone}
              </a>
              <div className="mt-4">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dealerInfo.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hm-arrow-link text-[13px] font-semibold text-slate-500 border-b border-slate-300 pb-0.5 hover:text-[#002c5f] hover:border-[#002c5f] transition-colors"
                >
                  Get directions&nbsp;&nbsp;&#8594;
                </a>
              </div>
            </div>

            {/* Col 3: Hours */}
            <div>
              <p className="hm-eyebrow text-slate-400 mb-4">Hours</p>
              <ul className="space-y-2">
                {dealerInfo.hours.map((h) => (
                  <li key={h.day} className="flex justify-between gap-6 text-[14px]">
                    <span className="text-slate-500">{h.day}</span>
                    <span className="font-medium text-slate-800 text-right">{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: CTA */}
            <div className="flex flex-col justify-between">
              <div>
                <p className="hm-eyebrow text-slate-400 mb-4">Contact</p>
                <p className="text-[14px] font-light text-slate-500 leading-relaxed">
                  Walk in, call ahead, or buy entirely from home.
                  We're open six days a week.
                </p>
              </div>
              <a
                href={dealerInfo.phoneHref}
                className="mt-6 inline-block bg-[#002c5f] text-white text-[13px] font-semibold px-6 py-3 text-center hover:bg-[#001f44] transition-colors"
              >
                Call {dealerInfo.phone}
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
