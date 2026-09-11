import { useEffect, useState } from "react";
import { X, CheckCircle2, ChevronDown } from "lucide-react";
import {
  SMS_CONSENT_DISCLOSURE,
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

interface TradeOfferPopupProps {
  onClose?: () => void;
  onSubmitted?: () => void;
  apiBase?: string;
  pageSource?: string;
  initialCarData?: CarData | null;
}

const TRADE_HERO_IMAGE =
  "https://vehicle-images.carscommerce.inc/9d49-110013336/1FTEW3LP7TKD22464/844985e1845dbb3c196e6a196fe08341.webp";

function formatE164(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return "+" + digits;
}

export default function TradeOfferPopup({
  onClose,
  onSubmitted,
  pageSource = "",
  initialCarData,
}: TradeOfferPopupProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [preferredContact, setPreferredContact] = useState("Text");
  const [phone, setPhone] = useState("+1");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [carData, setCarData] = useState<CarData>(() => {
    if (initialCarData) return initialCarData;
    if (typeof window === "undefined") {
      return { title: "", price: "", vin: "", stock: "", pageUrl: "" };
    }
    const params = new URLSearchParams(window.location.search);
    return {
      title: params.get("vehicle") || params.get("title") || "",
      price: params.get("price") || "",
      vin: params.get("vin") || "",
      stock: params.get("stock") || "",
      pageUrl: params.get("page_url") || params.get("pageUrl") || window.location.href,
      vehicleSnapshot: null,
    };
  });

  useEffect(() => {
    if (initialCarData) setCarData(initialCarData);
  }, [initialCarData]);

  const handlePhoneChange = (value: string) => {
    let next = value;
    if (!next.startsWith("+1")) {
      next = "+1" + next.replace(/\D/g, "");
    }
    const digits = next.slice(2).replace(/\D/g, "").slice(0, 10);
    setPhone("+1" + digits);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim()) {
      setError("Please enter your first name.");
      return;
    }
    if (phone.length < 12) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    try {
      const res = await submitLeadInquiry({
        lead_type: "quote_request",
        full_name: `${firstName} ${lastName}`.trim(),
        email: email,
        phone: formatE164(phone),
        message: `Submitted $500 More For Your Trade request on ${carData.title || "Vehicle"}. Preferred contact: ${preferredContact}. Source: ${pageSource || "Trade Offer Popup"}`,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-4 overflow-y-auto overflow-x-hidden backdrop-blur-xs animate-in fade-in duration-200">
        <div className="relative w-full max-w-[460px] max-h-[calc(100dvh-1.5rem)] my-auto overflow-y-auto rounded-2xl bg-white p-6 sm:p-8 text-center shadow-2xl border border-slate-200">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close popup"
            className="absolute top-3.5 right-3.5 grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer z-10"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-mono font-bold text-slate-700">
            CERTIFICATE #AMF-500-TRADE
          </div>
          <h2 className="mt-2.5 text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            $500 Trade Bonus Registered!
          </h2>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Your $500 trade-in bonus voucher has been registered with AM Ford in Ashtabula County, OH. A sales advisor will follow up via your preferred contact method ({preferredContact}).
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#002c5f] py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#001f44] cursor-pointer"
          >
            Done & Return to Site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-4 overflow-y-auto overflow-x-hidden backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-[620px] max-h-[calc(100dvh-1.5rem)] sm:max-h-[92vh] my-auto flex flex-col overflow-y-auto overflow-x-hidden rounded-2xl bg-white shadow-2xl border border-slate-200/90 animate-in zoom-in-95 duration-200">
        {/* Top Hero Banner (Side-by-side on all screens to stay compact and within screen bounds) */}
        <div className="grid grid-cols-12 shrink-0 bg-[#002c5f] overflow-hidden">
          {/* Left Promo Half - Main Brand Navy */}
          <div className="col-span-7 sm:col-span-6 flex flex-col justify-center p-3.5 sm:p-6 text-white">
            {/* Top Accent Line */}
            <div className="h-[2.5px] sm:h-[3px] w-10 sm:w-14 bg-white/90 mb-1.5 sm:mb-2.5" />
            
            {/* $500 Text */}
            <div className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-none">
              $500
            </div>

            {/* MORE FOR YOUR TRADE* */}
            <div className="mt-1.5 sm:mt-2.5">
              <span className="inline-block border-b sm:border-b-2 border-white pb-0.5 sm:pb-1 text-xs sm:text-base font-black uppercase tracking-tight text-white leading-tight">
                MORE FOR YOUR TRADE*
              </span>
            </div>

            {/* Footnote */}
            <p className="mt-1.5 sm:mt-2 text-[8.5px] sm:text-[9.5px] leading-tight text-white/75 font-normal line-clamp-2 sm:line-clamp-none">
              Cannot be combined with any other discounts or promotions. Please contact dealer for details.
            </p>
          </div>

          {/* Right Hero Image Half */}
          <div className="col-span-5 sm:col-span-6 relative min-h-[95px] sm:min-h-full bg-slate-100 overflow-hidden">
            <img
              src={TRADE_HERO_IMAGE}
              alt="AM Ford Dealership & Truck"
              className="h-full w-full object-cover object-center"
            />
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close popup"
              className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 grid h-7 w-7 place-items-center rounded-full bg-white/95 text-slate-800 hover:bg-white shadow-md transition cursor-pointer z-20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Bottom Form Body */}
        <div className="p-4 sm:p-6 bg-white overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3.5 gap-y-3 sm:gap-y-3.5">
              {/* First Name */}
              <div className="relative rounded-lg border border-slate-300 bg-white focus-within:border-[#002c5f] focus-within:ring-1 focus-within:ring-[#002c5f] transition-all">
                <label className="absolute -top-2.5 left-2.5 bg-white px-1 text-[10px] font-semibold text-slate-500">
                  First Name <span className="text-slate-400">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full bg-transparent px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none"
                />
              </div>

              {/* Last Name */}
              <div className="relative rounded-lg border border-slate-300 bg-white focus-within:border-[#002c5f] focus-within:ring-1 focus-within:ring-[#002c5f] transition-all">
                <label className="absolute -top-2.5 left-2.5 bg-white px-1 text-[10px] font-semibold text-slate-500">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-transparent px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none"
                />
              </div>

              {/* Preferred Contact */}
              <div className="relative rounded-lg border border-slate-300 bg-white focus-within:border-[#002c5f] focus-within:ring-1 focus-within:ring-[#002c5f] transition-all">
                <label className="absolute -top-2.5 left-2.5 bg-white px-1 text-[10px] font-semibold text-slate-500">
                  Preferred Contact
                </label>
                <div className="relative">
                  <select
                    value={preferredContact}
                    onChange={(e) => setPreferredContact(e.target.value)}
                    className="w-full appearance-none bg-transparent px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none cursor-pointer pr-8"
                  >
                    <option value="Text">Text</option>
                    <option value="Call">Call</option>
                    <option value="Email">Email</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-700" />
                </div>
              </div>

              {/* Phone */}
              <div className="relative rounded-lg border border-slate-300 bg-white focus-within:border-[#002c5f] focus-within:ring-1 focus-within:ring-[#002c5f] transition-all">
                <label className="absolute -top-2.5 left-2.5 bg-white px-1 text-[10px] font-semibold text-slate-500">
                  Phone <span className="text-slate-400">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  required
                  placeholder="+1"
                  className="w-full bg-transparent px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none"
                />
              </div>

              {/* Email (Full width) */}
              <div className="sm:col-span-2 relative rounded-lg border border-slate-300 bg-white focus-within:border-[#002c5f] focus-within:ring-1 focus-within:ring-[#002c5f] transition-all">
                <label className="absolute -top-2.5 left-2.5 bg-white px-1 text-[10px] font-semibold text-slate-500">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-2 text-center text-xs font-semibold text-red-600 border border-red-100">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-0.5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition px-2 py-1.5 cursor-pointer"
              >
                Not Interested
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-[#002c5f] px-8 sm:px-9 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-[#001f44] active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>

            {/* Legal SMS / Terms Disclaimer */}
            <p className="mt-2 text-center text-[10px] sm:text-[11px] text-slate-500 leading-tight">
              {SMS_CONSENT_DISCLOSURE}{" "}
              <a
                href={TERMS_OF_USE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline text-slate-900 hover:text-[#002c5f]"
              >
                Terms of use
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
