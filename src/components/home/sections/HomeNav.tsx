import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Phone, X } from "lucide-react";
import { dealerInfo } from "@/lib/vehicles";

const LINKS = [
  { to: "/inventory", label: "Inventory" },
  { to: "/financing", label: "Financing" },
  { to: "/service", label: "Service" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

/** Dark glass navigation for the premium homepage. */
export function HomeNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <motion.header
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.15 }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 border-b border-slate-200/90 backdrop-blur-md shadow-md"
          : "bg-white border-b border-slate-200/80 shadow-sm"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-7">
        <Link to="/" className="inline-flex items-center transition hover:opacity-90">
          <img
            src="https://di-uploads-development.dealerinspire.com/amford/uploads/2025/08/Am-ford.png"
            alt="AM Ford"
            width={260}
            height={80}
            className="h-8 sm:h-10 w-auto object-contain transition"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-lg px-4 py-2 text-[13px] font-semibold text-slate-700 transition-colors duration-300 hover:bg-slate-100 hover:text-[#002c5f]"
              activeProps={{ className: "text-[#002c5f] font-extrabold bg-slate-100" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={dealerInfo.phoneHref}
            className="hidden items-center gap-2 rounded-xl bg-[#002c5f] px-4 py-2 text-[13px] font-extrabold text-white shadow-md transition-all duration-300 hover:bg-[#002c5f]/90 hover:scale-[1.02] sm:inline-flex"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden />
            {dealerInfo.phone}
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-800 md:hidden hover:bg-slate-200"
            aria-expanded={open}
            aria-controls="hm-mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X className="h-4 w-4" aria-hidden />
            ) : (
              <Menu className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="hm-mobile-menu"
            aria-label="Mobile"
            initial={{ opacity: 0, y: -12, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            className="bg-white border-b border-slate-200 p-4 md:hidden shadow-xl"
          >
            <ul className="flex flex-col">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-[#002c5f]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2 border-t border-slate-100 pt-3">
                <a
                  href={dealerInfo.phoneHref}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#002c5f] px-4 py-3 text-sm font-bold text-white shadow-md"
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  {dealerInfo.phone}
                </a>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
