import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { dealerInfo } from "@/lib/vehicles";
import {
  bodyStyleItems,
  cityItems,
  compareItems,
  countyItems,
  guideItems,
  modelItems,
  FrequentSearchLink,
  type FrequentSearchItem,
} from "@/components/site/FrequentSearches";
import { cn } from "@/lib/utils";

/**
 * Primary navigation.
 *
 * The three dropdowns exist so the model, city, county, guide, and comparison pages are
 * reachable from every page rather than from the sitemap alone. Two things about how they
 * are built are load-bearing:
 *
 *  1. The panel contents are ALWAYS in the DOM. Nothing is mounted on hover or on click, so
 *     the links are in the server rendered HTML and `curl` sees them. Only VISIBILITY is
 *     toggled, by CSS, using `group-hover` and `group-focus-within`.
 *  2. `visibility: hidden` also removes the links from the tab order, which is what stops a
 *     25 link block from becoming an invisible keyboard trap. Focusing the trigger applies
 *     `group-focus-within`, the panel becomes visible, and the next Tab lands inside it.
 *
 * Each trigger is itself a real link to that section's hub page, so the menu never depends on
 * JavaScript to be useful. On mobile the same content renders inside native `<details>`
 * disclosures: present in the HTML, collapsed by default, and usable at 320px.
 */

type NavMenu = {
  label: string;
  /** The hub page the trigger navigates to. */
  to: string;
  /** How that hub is described when it is listed as a link rather than used as the trigger. */
  hubLabel: string;
  columns: { heading: string; items: FrequentSearchItem[] }[];
  /** Related hubs that are not the trigger's own destination. */
  extraHubs: { to: string; label: string }[];
};

const MODELS_MENU: NavMenu = {
  label: "Models",
  to: "/ford-models",
  hubLabel: "Every Ford model we cover",
  columns: [
    { heading: "Ford models we stock", items: modelItems() },
    { heading: "Shop by body style", items: bodyStyleItems() },
  ],
  extraHubs: [{ to: "/inventory", label: "Every Ford in stock in Jefferson OH" }],
};

const AREAS_MENU: NavMenu = {
  label: "Areas",
  to: "/areas-we-serve",
  hubLabel: "Every area AM Ford serves",
  columns: [
    { heading: "Towns and cities we serve", items: cityItems() },
    { heading: "Counties we serve", items: countyItems() },
  ],
  extraHubs: [
    { to: "/nationwide-vehicle-delivery", label: "Ford home delivery and nationwide shipping" },
  ],
};

const RESEARCH_MENU: NavMenu = {
  label: "Research",
  to: "/guides",
  hubLabel: "All Ford buying guides",
  columns: [
    { heading: "Ford buying guides", items: guideItems() },
    { heading: "Ford model comparisons", items: compareItems() },
  ],
  extraHubs: [{ to: "/compare", label: "All Ford model comparisons" }],
};

type NavEntry = { kind: "link"; to: string; label: string } | { kind: "menu"; menu: NavMenu };

/** The six original links, in their original order, with the three menus folded in. */
const NAV_ENTRIES: NavEntry[] = [
  { kind: "link", to: "/", label: "Home" },
  { kind: "link", to: "/inventory", label: "Inventory" },
  { kind: "menu", menu: MODELS_MENU },
  { kind: "link", to: "/financing", label: "Financing" },
  { kind: "menu", menu: AREAS_MENU },
  { kind: "menu", menu: RESEARCH_MENU },
  { kind: "link", to: "/service", label: "Service" },
  { kind: "link", to: "/about", label: "About" },
  { kind: "link", to: "/contact", label: "Contact" },
];

const menuSlug = (menu: NavMenu) => menu.label.toLowerCase();

const DESKTOP_LINK =
  "rounded-lg px-3 py-2 text-[13px] font-semibold text-slate-700 transition-colors duration-300 hover:bg-slate-100 hover:text-[#002c5f]";
const DESKTOP_ACTIVE = { className: "bg-slate-100 text-[#002c5f] font-extrabold" };
const MOBILE_LINK =
  "rounded-xl px-4 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-[#002c5f]";
const HUB_LINK =
  "inline-flex min-h-6 items-center rounded-sm text-[12px] font-bold text-[#002c5f] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/95 border-b border-slate-200/90 backdrop-blur-md shadow-md"
            : "bg-white border-b border-slate-200/80 shadow-sm",
        )}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-7"
        >
          <Link to="/" className="inline-flex items-center transition hover:opacity-90">
            <img
              src="https://di-uploads-development.dealerinspire.com/amford/uploads/2025/08/Am-ford.png"
              alt="AM Ford"
              width={260}
              height={80}
              className="h-8 sm:h-10 w-auto object-contain transition"
            />
          </Link>

          <div className="hidden items-center gap-0.5 xl:flex">
            {NAV_ENTRIES.map((entry) =>
              entry.kind === "link" ? (
                <Link
                  key={entry.to}
                  to={entry.to}
                  className={DESKTOP_LINK}
                  activeProps={DESKTOP_ACTIVE}
                  activeOptions={{ exact: entry.to === "/" }}
                >
                  {entry.label}
                </Link>
              ) : (
                <div key={entry.menu.label} className="group relative">
                  <Link
                    to={entry.menu.to}
                    className={cn(DESKTOP_LINK, "inline-flex items-center gap-1")}
                    activeProps={DESKTOP_ACTIVE}
                  >
                    {entry.menu.label}
                    <ChevronDown
                      aria-hidden="true"
                      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
                    />
                  </Link>

                  {/*
                    Rendered on the server, always. `invisible` is the only thing hiding it,
                    so the links below are in the HTML a crawler receives.
                  */}
                  <div className="invisible absolute top-full left-1/2 z-50 w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2 pt-3 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
                      <div className="grid gap-5 sm:grid-cols-2">
                        {entry.menu.columns.map((column, columnIndex) => {
                          const headingId = `nav-${menuSlug(entry.menu)}-${columnIndex}`;
                          return (
                            <div key={column.heading}>
                              <h2
                                id={headingId}
                                className="text-[10px] font-bold tracking-[0.18em] text-[#002c5f] uppercase"
                              >
                                {column.heading}
                              </h2>
                              <ul aria-labelledby={headingId} className="mt-2">
                                {column.items.map((item) => (
                                  <li key={item.key}>
                                    <FrequentSearchLink
                                      item={item}
                                      className="text-[12px] font-medium text-slate-700 hover:text-[#002c5f]"
                                    />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-slate-200 pt-3">
                        {entry.menu.extraHubs.map((hub) => (
                          <Link key={hub.to} to={hub.to} className={HUB_LINK}>
                            {hub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>

          <div className="flex items-center gap-3">
            <a
              href={dealerInfo.phoneHref}
              className="hidden items-center gap-2 rounded-xl bg-[#002c5f] px-4 py-2 text-[13px] font-extrabold text-white shadow-md transition-all duration-300 hover:bg-[#002c5f]/90 hover:scale-[1.02] sm:inline-flex"
            >
              <Phone className="h-3.5 w-3.5" /> {dealerInfo.phone}
            </a>
            <button
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-slate-100 text-slate-800 shadow-sm xl:hidden hover:bg-slate-200"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile sheet */}
      <div
        inert={!open}
        className={cn(
          "fixed inset-0 z-[60] xl:hidden",
          open ? "visible pointer-events-auto" : "invisible pointer-events-none",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={close}
        />
        <div
          className={cn(
            "absolute right-3 top-3 max-h-[calc(100dvh-1.5rem)] w-[min(360px,calc(100%-1.5rem))] overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl transition-[opacity,transform] duration-300",
            open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
          )}
        >
          <div className="mb-6 flex items-center justify-between">
            <span className="text-lg font-bold text-slate-900">Menu</span>
            <button
              onClick={close}
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav aria-label="Site sections" className="flex flex-col gap-1">
            {NAV_ENTRIES.map((entry) =>
              entry.kind === "link" ? (
                <Link
                  key={entry.to}
                  to={entry.to}
                  onClick={close}
                  className={MOBILE_LINK}
                  activeProps={DESKTOP_ACTIVE}
                  activeOptions={{ exact: entry.to === "/" }}
                >
                  {entry.label}
                </Link>
              ) : (
                /*
                  A native disclosure: the links are in the HTML whether it is open or shut,
                  and nothing is dumped into the sheet until the reader asks for it.
                */
                <details key={entry.menu.label} className="rounded-xl border border-slate-200">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100 [&::-webkit-details-marker]:hidden">
                    <span>{entry.menu.label}</span>
                    <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0" />
                  </summary>
                  <div className="space-y-4 px-4 pt-1 pb-4">
                    {entry.menu.columns.map((column, columnIndex) => {
                      const headingId = `sheet-${menuSlug(entry.menu)}-${columnIndex}`;
                      return (
                        <div key={column.heading}>
                          <h2
                            id={headingId}
                            className="text-[10px] font-bold tracking-[0.18em] text-[#002c5f] uppercase"
                          >
                            {column.heading}
                          </h2>
                          <ul aria-labelledby={headingId} className="mt-1.5">
                            {column.items.map((item) => (
                              <li key={item.key}>
                                <FrequentSearchLink
                                  item={item}
                                  onNavigate={close}
                                  className="py-1.5 text-[13px] font-medium text-slate-700 hover:text-[#002c5f]"
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                    <div className="flex flex-col gap-1.5 border-t border-slate-200 pt-3">
                      <Link to={entry.menu.to} onClick={close} className={HUB_LINK}>
                        {entry.menu.hubLabel}
                      </Link>
                      {entry.menu.extraHubs.map((hub) => (
                        <Link key={hub.to} to={hub.to} onClick={close} className={HUB_LINK}>
                          {hub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </details>
              ),
            )}
          </nav>

          <a
            href={dealerInfo.phoneHref}
            className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-[#002c5f] py-3.5 text-center text-sm font-extrabold text-white shadow-lg transition hover:bg-[#002c5f]/90"
          >
            <Phone className="h-4 w-4" /> Call {dealerInfo.phone}
          </a>
        </div>
      </div>
    </>
  );
}
