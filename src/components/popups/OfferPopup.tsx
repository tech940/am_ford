import { useState, useEffect } from "react";
import {
  PRIVACY_POLICY_URL,
  SMS_CONSENT_DISCLOSURE,
  SMS_MARKETING_CONSENT_DISCLOSURE,
  SMS_TRANSACTIONAL_CONSENT_DISCLOSURE,
  TERMS_CONSENT_DISCLOSURE,
  TERMS_OF_USE_URL,
} from "@/lib/smsConsent";
import { submitLeadInquiry } from "@/lib/supabase";

interface CarData {
  title: string;
  price: string;
  vin: string;
  stock: string;
  pageUrl: string;
  vehicleSnapshot?: Record<string, unknown> | null;
}

interface OfferPopupProps {
  onClose?: () => void;
  onSubmitted?: () => void;
  apiBase?: string;
  pageSource?: string;
  initialCarData?: CarData | null;
}

function buildSourceLabel(pageSource: string): string {
  if (!pageSource) return "500 off Popup";
  const labels: Record<string, string> = {
    Home: "Home page",
    SRP: "Listing page",
    VDP: "VDP page",
  };
  return "500 off Popup (" + (labels[pageSource] || pageSource) + ")";
}

export function OfferPopup({
  onClose,
  onSubmitted,
  pageSource = "",
  initialCarData,
}: OfferPopupProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [carData, setCarData] = useState<CarData>(() => {
    if (initialCarData) return initialCarData;
    if (typeof window === "undefined")
      return { title: "", price: "", vin: "", stock: "", pageUrl: "" };
    const p = new URLSearchParams(window.location.search);
    return {
      title: p.get("vehicle") || p.get("title") || "General Offer Inquiry",
      price: p.get("price") || "",
      vin: p.get("vin") || "",
      stock: p.get("stock") || "",
      pageUrl: p.get("pageUrl") || window.location.href,
    };
  });

  useEffect(() => {
    if (initialCarData) {
      setCarData(initialCarData);
    }
  }, [initialCarData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await submitLeadInquiry({
        lead_type: "quote_request",
        full_name: `${firstName} ${lastName}`.trim(),
        email: email,
        phone: phone,
        message: `Claimed $500 OFF Offer on ${carData.title || "Vehicle"}. Source: ${buildSourceLabel(pageSource)}`,
      });

      if (res.success) {
        setSubmitted(true);
        onSubmitted?.();
      } else {
        setError(res.message);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="offer-overlay">
        <div className="relative w-full max-w-[460px] overflow-hidden rounded-3xl bg-white p-8 text-center shadow-2xl border border-slate-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 text-3xl font-bold">
            ✓
          </div>
          <h2 className="mt-5 text-2xl font-black text-slate-900">
            Voucher Claimed!
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Your $500 vehicle voucher has been generated. Our sales department will confirm your redemption details shortly.
          </p>
          <button
            onClick={onClose}
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#002c5f] py-3 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-[#001f44] active:scale-95"
          >
            Return to Inventory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="offer-overlay">
      <div className="relative w-full max-w-[500px] overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3.5 top-3.5 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white/90 backdrop-blur-md transition hover:bg-white/25 hover:text-white"
        >
          <span className="text-lg leading-none">×</span>
        </button>

        {/* HEADER */}
        <div className="relative bg-[#002c5f] px-6 pt-7 pb-6 text-center text-white overflow-hidden">
          {/* Subtle warm glow background accent */}
          <div
            className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-44 w-72 rounded-full bg-amber-400/20 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10">
            {/* Dealer Logo Pill */}
            <div className="inline-flex items-center justify-center rounded-xl bg-white px-3 py-1.5 shadow-sm mb-3">
              <img
                src="https://di-uploads-development.dealerinspire.com/amford/uploads/2025/08/Am-ford.png"
                alt="AM Ford"
                className="h-6 w-auto object-contain"
              />
            </div>

            {/* Main Value Proposition */}
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                $500
              </span>
              <span className="rounded-lg bg-amber-400 px-2 py-0.5 text-xl sm:text-2xl font-black tracking-wide text-slate-950">
                OFF
              </span>
            </div>

            <p className="mt-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
              Your Next Vehicle Purchase
            </p>

            {/* Trust rating */}
            <div className="mt-2 flex items-center justify-center gap-1 text-amber-400 text-xs">
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span className="ml-1 text-[11px] font-semibold text-slate-300">
                Authorized Ohio Dealership
              </span>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  First Name <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none transition focus:border-[#002c5f] focus:bg-white focus:ring-2 focus:ring-[#002c5f]/15"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Last Name <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none transition focus:border-[#002c5f] focus:bg-white focus:ring-2 focus:ring-[#002c5f]/15"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Phone Number <span className="text-amber-600">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="(440) 555-0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none transition focus:border-[#002c5f] focus:bg-white focus:ring-2 focus:ring-[#002c5f]/15"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Email Address <span className="text-amber-600">*</span>
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none transition focus:border-[#002c5f] focus:bg-white focus:ring-2 focus:ring-[#002c5f]/15"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-2.5 text-center text-xs font-semibold text-red-600 border border-red-200">
                {error}
              </div>
            )}

            <div className="rounded-xl bg-slate-50 p-2.5 text-center">
              <p className="text-[10px] leading-relaxed text-slate-500">
                {SMS_CONSENT_DISCLOSURE}{" "}
                <a
                  href={TERMS_OF_USE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#002c5f] hover:underline"
                >
                  Terms of use
                </a>
              </p>
            </div>

            {/* CTA BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#002c5f] py-3.5 px-4 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-[#001f44] active:scale-95 disabled:opacity-50"
            >
              <span>{loading ? "Processing..." : "Claim My $500 Voucher"}</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          </form>

          {/* TRUST BADGES INLINE */}
          <div className="mt-4 flex items-center justify-center gap-3 border-t border-slate-100 pt-3 text-[11px] font-medium text-slate-500">
            <span className="flex items-center gap-1">🔒 100% Secure</span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1">✓ No Obligation</span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1">⚡ Instant Delivery</span>
          </div>

          {/* FOOTER */}
          <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
            <div className="flex gap-2">
              <a
                href={TERMS_OF_USE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Terms
              </a>
              <span>·</span>
              <a
                href={PRIVACY_POLICY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Privacy
              </a>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="font-medium text-slate-400 hover:text-slate-600 hover:underline"
            >
              No, thank you
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfferPopup;
