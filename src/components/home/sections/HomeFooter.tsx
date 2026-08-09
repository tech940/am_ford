import { Link } from "@tanstack/react-router";
import { MapPin, Phone } from "lucide-react";
import { dealerInfo } from "@/lib/vehicles";

const LINKS = [
  { to: "/inventory", label: "Inventory" },
  { to: "/ford-models", label: "Ford Models" },
  { to: "/compare", label: "Compare Models" },
  { to: "/guides", label: "Buying Guides" },
  { to: "/financing", label: "Financing" },
  { to: "/trade-in", label: "Value Your Trade" },
  { to: "/commercial", label: "Commercial" },
  { to: "/service", label: "Service" },
  { to: "/areas-we-serve", label: "Areas We Serve" },
  { to: "/nationwide-vehicle-delivery", label: "Vehicle Delivery" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

/** Quiet dark footer that closes the page without competing with the CTA above it. */
export function HomeFooter() {
  return (
    <footer className="relative z-10 border-t border-[#001f44] bg-[#002c5f] text-white">
      <div className="mx-auto max-w-5xl px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:items-start">
          {/* Column 1: Centered Brand Info */}
          <div className="flex flex-col items-start">
            <Link
              to="/"
              className="inline-flex items-center rounded-2xl bg-white px-5 py-3 shadow-md transition hover:bg-white/95"
            >
              <img
                src="https://di-uploads-development.dealerinspire.com/amford/uploads/2025/08/Am-ford.png"
                alt="AM Ford"
                className="h-10 sm:h-12 w-auto object-contain transition"
              />
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-white/80 max-w-xs">
              A family-owned dealership serving Ashtabula and Northeast Ohio with hand-selected,
              inspection-certified vehicles.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/60">
              Explore
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-medium text-white/80">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="block py-1 transition-colors duration-200 hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Visit Us & Contact */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/60">
              Visit Us
            </p>
            <ul className="mt-3 space-y-2 text-xs font-medium text-white/80">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" aria-hidden />
                {dealerInfo.address}
              </li>
              <li>
                <a
                  href={dealerInfo.phoneHref}
                  className="flex items-center gap-2 py-0.5 transition-colors duration-200 hover:text-white"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-white" aria-hidden />
                  {dealerInfo.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-8 border-t border-white/10 pt-4 text-center text-[11px] font-medium text-white/50">
          © {new Date().getFullYear()} {dealerInfo.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
