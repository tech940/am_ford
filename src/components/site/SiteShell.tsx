import { type ReactNode } from "react";
import { SiteNav } from "./SiteNav";
import { SiteFooter } from "./SiteFooter";
import { Desk } from "./Desk";
import { DeskProvider } from "./DeskContext";

/**
 * The frame every page wears. One nav, one footer, one main landmark, one skip link.
 *
 * Before this there were two frames: SiteShell on 24 routes and the homepage's own. They had
 * different navs, different footers, different grounds and different link sets, which is why
 * the site read as two products stitched together.
 *
 * `pt-20 sm:pt-24` is gone with the fixed bar it compensated for. The nav is `sticky` now, so
 * it occupies real space in the flow and nothing has to reserve room for it. That padding was
 * also 96px of dead air above the fold on every page.
 *
 * MobileStickyCTA is gone too: a floating Call/Book bar over every page duplicated the nav's
 * own phone cell, which is visible at every scroll position on a phone, and it cost a fixed
 * layer plus a 96px spacer at the bottom of every document.
 *
 * The one persistent floating object left is `Desk`, and it earns that by carrying the site's
 * most perishable fact: whether the sales desk is open right now. It replaced a chat widget
 * that asserted live presence it did not have.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <DeskProvider>
      <div className="relative min-h-screen overflow-x-clip bg-background text-ink antialiased selection:bg-brand selection:text-white">
        <a
          href="#content"
          className="sr-only bg-brand px-4 py-3 text-ui font-semibold text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-0 focus:z-50"
        >
          Skip to main content
        </a>

        <SiteNav />

        {/* scroll-mt clears the sticky bar so the skip link never lands underneath it. */}
        <main id="content" tabIndex={-1} className="scroll-mt-14 lg:scroll-mt-16">
          {children}
        </main>

        <SiteFooter />

        {/* No exit-intent overlay. It interrupted a visitor who was leaving with a "$500
          voucher is locked in" the dealership never published, on a fifth capture form with
          its own consent posture. Every ask on this site now happens where the visitor
          already is, attached to the vehicle they are looking at. */}
        <Desk />
      </div>
    </DeskProvider>
  );
}
