import { Link } from "@tanstack/react-router";
import { dealerInfo } from "@/lib/vehicles";
import logo from "@/assets/am-ford-logo.png";
import {
  Button,
  IconPhone,
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ledger";

/**
 * The site frame, top. Four routes and the phone, on their own plane.
 *
 * ONE NAV FOR EVERY PAGE. This replaces two: a 338-line bar with three mega-menus on 24
 * routes, and this one on the homepage. The mega-menus are not ported. The brief asks for
 * "logo, a handful of nav links, a phone number", and every destination those menus reached
 * has a hub page that the footer links to directly: /ford-models, /areas-we-serve, /guides
 * and /compare. A nav should not be the only path to forty links.
 *
 * It sells nothing, it has no headline, and it never changes on scroll. The bar is opaque and
 * ruled from the first frame, so there is nothing for a scroll listener to reveal: the
 * server HTML is the final HTML, with zero client state and zero effects outside the Sheet.
 *
 * CELL carries structure only. TanStack concatenates `activeProps.className` onto `className`
 * with a plain space and no tailwind-merge, so any property set in both is decided by
 * generated-CSS order rather than by us. That is why rest colour and weight live in
 * `inactiveProps`. The bar this replaces had the same latent bug, setting `text-brand` on the
 * active link over a `text-slate-700` base.
 *
 * The logo is still hotlinked from the dealership's CDN. Vendoring it into src/assets is the
 * one item of this rebuild left open, and the `preconnect` in __root.tsx stays until it lands.
 */
const CELL =
  "relative inline-flex h-full items-center whitespace-nowrap border-l border-white/10 px-2.5 " +
  "font-sans text-meta transition-colors duration-150 hover:bg-white/10 hover:text-white " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-bright " +
  "lg:px-4 lg:text-ui xl:px-5";

const CELL_REST = "font-medium text-white/70";

/** Current route: a 2px Ford-blue bar at the cell's bottom edge AND a weight change, never
    colour alone. brand-bright, because Ford blue proper is 2.4:1 on asphalt. */
const CELL_ACTIVE =
  "font-semibold text-white after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-brand-bright";

const SHEET_ROW =
  "flex min-h-14 items-center border-b border-rule px-5 font-sans text-h3 font-semibold text-ink " +
  "transition-colors duration-150 hover:bg-surface " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand";

const SHEET_SUB =
  "flex min-h-12 items-center border-b border-rule px-5 font-sans text-ui font-medium text-ink-2 " +
  "transition-colors duration-150 hover:bg-surface hover:text-ink " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-asphalt">
      <div className="mx-auto flex h-14 max-w-[1200px] items-stretch px-5 md:px-6 lg:h-16 lg:px-16">
        <Link
          to="/"
          className="mr-auto flex items-center pr-3 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-bright md:pr-4"
        >
          {/* The dealership's own lockup, client-supplied. Navy artwork on transparency, so it
              rides a white plate on the asphalt bar. */}
          <span className="flex items-center bg-white px-2.5 py-1.5">
            <img src={logo} alt="AM Ford" width={520} height={161} className="h-6 w-auto lg:h-7" />
          </span>
          <span className="sr-only">AM Ford home</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-stretch md:flex">
          <Link
            to="/inventory"
            search={{ condition: "New" }}
            className={CELL}
            activeProps={{ className: CELL_ACTIVE }}
            inactiveProps={{ className: CELL_REST }}
          >
            New Vehicles
          </Link>
          {/* Unfiltered on purpose: FILTERABLE_CONDITIONS is New and Certified Pre-Owned, the
              feed holds no `Used`, and the search validator would drop condition: "Used". */}
          <Link
            to="/inventory"
            activeOptions={{ exact: true, includeSearch: true }}
            className={CELL}
            activeProps={{ className: CELL_ACTIVE }}
            inactiveProps={{ className: CELL_REST }}
          >
            Used Vehicles
          </Link>
          <Link
            to="/service"
            className={CELL}
            activeProps={{ className: CELL_ACTIVE }}
            inactiveProps={{ className: CELL_REST }}
          >
            Schedule Service
          </Link>
          <Link
            to="/trade-in"
            className={CELL}
            activeProps={{ className: CELL_ACTIVE }}
            inactiveProps={{ className: CELL_REST }}
          >
            Value Your Trade
          </Link>
        </nav>

        <a
          href={dealerInfo.phoneHref}
          className="inline-flex h-full min-w-11 items-center justify-center border-l border-white/10 px-3 font-mono text-meta font-semibold tabular-nums text-brand-bright transition-colors duration-150 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-bright lg:px-5 lg:text-ui"
        >
          <span className="sr-only">Call AM Ford at {dealerInfo.phone}</span>
          {/* Below 360px the digits do not fit beside the wordmark and the menu trigger, so
              the icon carries the whole action rather than the number being truncated. */}
          <IconPhone className="h-[18px] w-[18px] min-[360px]:hidden" />
          <span aria-hidden className="hidden min-[360px]:inline">
            {dealerInfo.phone}
          </span>
        </a>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="secondary"
              size="md"
              className="ml-3 self-center border-white/30 text-white hover:border-white hover:bg-white/10 md:hidden"
            >
              Menu
            </Button>
          </SheetTrigger>

          {/* Bottom sheet: the rows land where the thumb is, and Radix supplies the focus trap,
              scroll lock, Escape and aria-modal the hand-rolled dropdown never had. */}
          <SheetContent side="bottom">
            <SheetHeader className="py-3.5">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>

            <SheetBody className="p-0">
              <nav aria-label="Primary">
                <ul>
                  <li>
                    <SheetClose asChild>
                      <Link to="/inventory" search={{ condition: "New" }} className={SHEET_ROW}>
                        New Vehicles
                      </Link>
                    </SheetClose>
                  </li>
                  <li>
                    <SheetClose asChild>
                      <Link to="/inventory" className={SHEET_ROW}>
                        Used Vehicles
                      </Link>
                    </SheetClose>
                  </li>
                  <li>
                    <SheetClose asChild>
                      <Link to="/service" className={SHEET_ROW}>
                        Schedule Service
                      </Link>
                    </SheetClose>
                  </li>
                  <li>
                    <SheetClose asChild>
                      <Link to="/trade-in" className={SHEET_ROW}>
                        Value Your Trade
                      </Link>
                    </SheetClose>
                  </li>
                </ul>
              </nav>

              {/* One ruled column, one grammar. The separation is a heavier rule, not a label. */}
              <nav aria-label="Secondary" className="border-t border-ink/15">
                <ul>
                  <li>
                    <SheetClose asChild>
                      <Link to="/ford-models" className={SHEET_SUB}>
                        Ford Models
                      </Link>
                    </SheetClose>
                  </li>
                  <li>
                    <SheetClose asChild>
                      <Link to="/financing" className={SHEET_SUB}>
                        Financing
                      </Link>
                    </SheetClose>
                  </li>
                  <li>
                    <SheetClose asChild>
                      <Link to="/about" className={SHEET_SUB}>
                        About
                      </Link>
                    </SheetClose>
                  </li>
                  <li>
                    <SheetClose asChild>
                      <Link to="/contact" className={SHEET_SUB}>
                        Contact
                      </Link>
                    </SheetClose>
                  </li>
                </ul>
              </nav>
            </SheetBody>

            <SheetFooter className="pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <Button asChild variant="primary" size="lg" block>
                <a href={dealerInfo.phoneHref}>Call {dealerInfo.phone}</a>
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
