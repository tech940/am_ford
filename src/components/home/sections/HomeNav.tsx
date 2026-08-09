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
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={`mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-full px-5 py-3.5 transition-all duration-500 sm:px-7 ${
          scrolled
            ? "bg-[#002c5f]/95 border border-white/25 backdrop-blur-2xl shadow-xl shadow-[#002c5f]/30 mx-4 sm:mx-auto"
            : "bg-[#002c5f]/90 border border-white/20 backdrop-blur-xl shadow-lg shadow-[#002c5f]/20 mx-4 sm:mx-auto"
        }`}
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

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-4 py-2 text-[13px] font-medium text-white/80 transition-colors duration-300 hover:text-white hover:bg-white/10"
              activeProps={{ className: "text-white font-extrabold bg-white/15" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={dealerInfo.phoneHref}
            className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-extrabold text-[#002c5f] shadow-md transition-all duration-300 hover:bg-slate-100 hover:scale-[1.02] sm:inline-flex"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden />
            {dealerInfo.phone}
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white md:hidden"
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
            className="hm-glass-strong mx-4 mt-2 rounded-3xl p-4 md:hidden"
          >
            <ul className="flex flex-col">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-[#002c5f]/10 hover:text-[#002c5f]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2 border-t border-[#002c5f]/10 pt-3">
                <a
                  href={dealerInfo.phoneHref}
                  className="flex items-center gap-2 rounded-2xl bg-[#002c5f] px-4 py-3 text-sm font-semibold text-white"
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
