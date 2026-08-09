import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { dealerInfo } from "@/lib/vehicles";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/inventory", label: "Inventory" },
  { to: "/financing", label: "Financing" },
  { to: "/service", label: "Service" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
        <nav
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between rounded-full px-5 py-3.5 transition-all duration-500 sm:px-7",
            scrolled
              ? "bg-[#002c5f]/95 border border-white/25 backdrop-blur-2xl shadow-xl shadow-[#002c5f]/30"
              : "bg-[#002c5f]/90 border border-white/20 backdrop-blur-xl shadow-lg shadow-[#002c5f]/20",
          )}
        >
          <Link
            to="/"
            className="inline-flex items-center rounded-2xl bg-white px-3.5 py-1.5 shadow-sm transition hover:bg-white/95 hover:scale-[1.02]"
          >
            <img
              src="https://di-uploads-development.dealerinspire.com/amford/uploads/2025/08/Am-ford.png"
              alt="AM Ford"
              className="h-7 sm:h-9 w-auto object-contain transition"
            />
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-full px-4 py-2 text-[13px] font-medium text-white/80 transition-colors duration-300 hover:bg-white/10 hover:text-white"
                activeProps={{ className: "bg-white/15 text-white font-extrabold" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a
              href={dealerInfo.phoneHref}
              className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-extrabold text-[#002c5f] shadow-md transition-all duration-300 hover:bg-slate-100 hover:scale-[1.02] sm:inline-flex"
            >
              <Phone className="h-3.5 w-3.5" /> {dealerInfo.phone}
            </a>
            <button
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white shadow-sm lg:hidden"
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
          "fixed inset-0 z-[60] lg:hidden",
          open ? "visible pointer-events-auto" : "invisible pointer-events-none",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            "absolute right-3 top-3 w-[min(360px,calc(100%-1.5rem))] rounded-3xl border border-white/20 bg-[#002c5f] p-6 text-white shadow-2xl transition-[opacity,transform] duration-300",
            open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
          )}
        >
          <div className="mb-6 flex items-center justify-between">
            <span className="text-lg font-bold text-white">Menu</span>
            <button
              onClick={() => setOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
                activeProps={{ className: "bg-white/20 text-white font-extrabold" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <a
            href={dealerInfo.phoneHref}
            className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-center text-sm font-extrabold text-[#002c5f] shadow-lg transition hover:bg-slate-100"
          >
            <Phone className="h-4 w-4" /> Call {dealerInfo.phone}
          </a>
        </div>
      </div>
    </>
  );
}
