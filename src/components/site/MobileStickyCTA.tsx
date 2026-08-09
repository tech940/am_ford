import { Link } from "@tanstack/react-router";
import { Phone, Calendar } from "lucide-react";
import { dealerInfo } from "@/lib/vehicles";

export function MobileStickyCTA() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 px-3 sm:hidden"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <div className="glass-strong flex items-center gap-2 rounded-2xl p-2">
        <a
          href={dealerInfo.phoneHref}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
        >
          <Phone className="h-4 w-4" /> Call
        </a>
        <Link
          to="/contact"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/80 py-3 text-sm font-semibold text-ink"
        >
          <Calendar className="h-4 w-4" /> Book
        </Link>
      </div>
    </div>
  );
}
