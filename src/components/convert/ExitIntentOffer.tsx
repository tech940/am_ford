import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeDollarSign, CheckCircle2, Phone, Send, User, X } from "lucide-react";
import { CONSENT_TEXT, RESPONSE_PROMISE, hasSubmittedLead, submitQuickLead } from "@/lib/leads";
import { cn } from "@/lib/utils";

const SHOWN_KEY = "am:exit-offer-shown";
const SUPPRESS_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
const DESKTOP_ARM_MS = 8_000;
const MOBILE_ARM_MS = 12_000;
const MOBILE_SCROLL_DEPTH = 0.7;

function shownRecently(): boolean {
  try {
    const raw = localStorage.getItem(SHOWN_KEY);
    if (!raw) return false;
    const shownAt = Date.parse(raw);
    return Number.isFinite(shownAt) && Date.now() - shownAt < SUPPRESS_MS;
  } catch {
    return false;
  }
}

function markShown() {
  try {
    localStorage.setItem(SHOWN_KEY, new Date().toISOString());
  } catch {
    /* best effort */
  }
}

/**
 * The site's only interruption surface: a one-shot $500 exit-intent offer.
 * Desktop fires on mouse-leave toward the tab bar; mobile fires past 70% scroll
 * depth. Never shown to converted visitors or within 3 days of a prior showing.
 */
export function ExitIntentOffer() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const firedRef = useRef(false);

  // Arming: decide once per mount whether (and how) the offer may fire.
  useEffect(() => {
    if (firedRef.current || hasSubmittedLead() || shownRecently()) return;

    const mountedAt = Date.now();
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    // The SEO brief's mobile rules forbid intrusive popups covering inventory.
    // On small screens the scroll-depth trigger would drop a full-screen modal
    // over the results grid, so it is disabled while browsing inventory.
    const onInventory = window.location.pathname.startsWith("/inventory");
    if (!finePointer && onInventory) return;

    const removeListeners = () => {
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
    };

    const fire = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      markShown();
      removeListeners();
      setOpen(true);
    };

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && Date.now() - mountedAt >= DESKTOP_ARM_MS) fire();
    };

    const onScroll = () => {
      if (Date.now() - mountedAt < MOBILE_ARM_MS) return;
      const scrollHeight = Math.max(document.documentElement.scrollHeight, 1);
      const depth = (window.scrollY + window.innerHeight) / scrollHeight;
      if (depth >= MOBILE_SCROLL_DEPTH) fire();
    };

    if (finePointer) {
      document.addEventListener("mouseleave", onMouseLeave);
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    return removeListeners;
  }, []);

  // While open: lock body scroll and close on Escape.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const phoneValid = phone.replace(/\D/g, "").length >= 10;
  const canSubmit = consent && phoneValid && !submitting;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setErrorMessage("");
    const result = await submitQuickLead({
      phone,
      name: name.trim() || undefined,
      message: `Exit-intent $500 offer claim from ${window.location.pathname}`,
    });
    setSubmitting(false);
    if (result.success) {
      setSubmitted(true);
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center overflow-y-auto p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Offer ticket */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-offer-headline"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative z-10 my-8 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* Navy gradient header */}
            <div className="relative bg-gradient-to-br from-[#002c5f] via-[#003a75] to-[#001a3d] px-6 pb-5 pt-7 text-white">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close offer"
                className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                <BadgeDollarSign className="h-4 w-4" aria-hidden="true" />
                Exclusive online offer
              </div>
              <p className="mt-2 text-5xl font-extrabold leading-none tracking-tight">$500</p>
              <h2 id="exit-offer-headline" className="mt-2 text-base font-semibold text-white/90">
                Before you go — put this toward any car in stock
              </h2>

              <div className="mt-5 border-t border-dashed border-white/30 pt-3">
                <p className="text-[11px] font-medium text-white/60">
                  One per customer · Valid on any in-stock vehicle at AM Ford
                </p>
              </div>
            </div>

            {/* White form / success area */}
            <div className="px-6 py-6">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-4 text-center"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-slate-900">
                    Your $500 voucher is locked in
                  </h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">{RESPONSE_PROMISE}</p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="mt-6 min-h-10 rounded-full bg-[#002c5f] px-7 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
                  >
                    Done
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Drop your number and we'll text you the voucher — no obligation.
                  </p>

                  {errorMessage && (
                    <div
                      role="alert"
                      className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700"
                    >
                      {errorMessage}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="exit-offer-name"
                      className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
                    >
                      Name (optional)
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="exit-offer-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        autoComplete="name"
                        className="min-h-10 w-full rounded-xl bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 ring-1 ring-slate-200 outline-none transition focus:ring-2 focus:ring-[#002c5f]"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="exit-offer-phone"
                      className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
                    >
                      Phone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="exit-offer-phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(440) 555-0199"
                        autoComplete="tel"
                        className="min-h-10 w-full rounded-xl bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 ring-1 ring-slate-200 outline-none transition focus:ring-2 focus:ring-[#002c5f]"
                      />
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-start gap-2.5 py-1">
                    <input
                      type="checkbox"
                      required
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#002c5f]"
                    />
                    <span className="text-xs leading-relaxed text-slate-500">{CONSENT_TEXT}</span>
                  </label>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={cn(
                      "flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#002c5f] py-3.5",
                      "text-sm font-semibold text-white shadow-md transition hover:opacity-90",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                  >
                    {submitting ? (
                      "Claiming..."
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Claim my $500
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
