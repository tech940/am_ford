import { useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { OfferPopup } from "@/components/popups/OfferPopup";

export function FloatingOfferButton() {
  const [offerOpen, setOfferOpen] = useState(false);
  const location = useLocation();

  // Hide on admin portal
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {/* Floating Special Offer Button (Bottom-Left on Mobile to avoid blocking content; Mid-Right on Desktop) */}
      <motion.button
        type="button"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOfferOpen(true)}
        aria-label="Claim $500 Special Offer"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        className="fixed bottom-6 left-3.5 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:right-6 sm:left-auto z-40 group flex items-center gap-2 sm:gap-3 rounded-full bg-[#002c5f] pl-2.5 pr-3.5 py-2 sm:pl-3.5 sm:pr-5 sm:py-3 text-white shadow-xl ring-2 ring-white/80 backdrop-blur-md transition-[background-color,ring-color,box-shadow] hover:bg-[#001f44] hover:shadow-[0_15px_35px_rgba(0,44,95,0.4)] cursor-pointer select-none"
      >
        <span className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xs pointer-events-none">
          %
        </span>
        <div className="flex flex-col text-left leading-tight pointer-events-none">
          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
            Claim $500 OFF
          </span>
          <span className="text-[11px] sm:text-xs font-black tracking-tight text-white">
            Special Offer
          </span>
        </div>
      </motion.button>

      {/* Special Offer Modal Popup */}
      {offerOpen && (
        <OfferPopup
          pageSource={location.pathname}
          onClose={() => setOfferOpen(false)}
        />
      )}
    </>
  );
}

export default FloatingOfferButton;
