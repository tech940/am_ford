import { useEffect, useId, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  MessageCircle,
  Phone,
  Send,
  User,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import { type Vehicle } from "@/lib/vehicles";
import { CONSENT_TEXT, RESPONSE_PROMISE, smsLink, submitQuickLead } from "@/lib/leads";
import { watchVehicle } from "@/lib/garage";
import { cn } from "@/lib/utils";

export type QuickEnquiryPreset = "availability" | "video_tour" | "price_watch";

type PresetCopy = {
  heading: string;
  message: string;
  cta: string;
  successHeadline: string;
  icon: LucideIcon;
};

function buildCopy(preset: QuickEnquiryPreset, vehicle: Vehicle): PresetCopy {
  const carName = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`;
  switch (preset) {
    case "availability":
      return {
        heading: "Is this still available?",
        message: `Is the ${carName} ($${vehicle.price.toLocaleString()}) still available?`,
        cta: "Ask now",
        successHeadline: "Your question is on its way",
        icon: MessageCircle,
      };
    case "video_tour":
      return {
        heading: "Get a personal video walkaround",
        message: `Please send me a personal video walkaround of the ${carName}.`,
        cta: "Request video",
        successHeadline: "Your walkaround video is on the way",
        icon: Video,
      };
    case "price_watch":
      return {
        heading: "Watch this car",
        message: `Please alert me if the price changes or availability changes on the ${carName}.`,
        cta: "Start watching",
        successHeadline: "You're watching this car",
        icon: Bell,
      };
  }
}

const inputClasses =
  "w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 " +
  "placeholder:text-slate-400 outline-none transition focus:border-[#002c5f] " +
  "focus:ring-2 focus:ring-[#002c5f]/15";

/**
 * The lowest-friction enquiry on the site: the question is pre-written, the
 * shopper only adds a phone number. One modal, three presets.
 */
export function QuickEnquiryModal({
  vehicle,
  preset,
  onClose,
}: {
  vehicle: Vehicle;
  preset: QuickEnquiryPreset;
  onClose: () => void;
}) {
  const headingId = useId();
  const copy = useMemo(() => buildCopy(preset, vehicle), [preset, vehicle]);
  const Icon = copy.icon;

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Escape closes; body scroll locks while the modal is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Please enter a valid phone number (at least 10 digits).");
      return;
    }
    setError("");
    setSubmitting(true);
    const result = await submitQuickLead({
      vehicle,
      phone,
      name: name.trim() || undefined,
      message: copy.message,
    });
    setSubmitting(false);
    if (result.success) {
      if (preset === "price_watch") watchVehicle(vehicle.id);
      setSubmitted(true);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Card */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="relative z-10 my-8 w-full max-w-md rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pb-0 pt-5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#002c5f]/10 text-[#002c5f]">
              <Icon className="h-4.5 w-4.5" />
            </span>
            <h3 id={headingId} className="text-lg font-bold leading-snug text-slate-900">
              {copy.heading}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6 text-center"
            >
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-100 text-green-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h4 className="mt-4 text-xl font-bold text-slate-900">{copy.successHeadline}</h4>
              <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">{RESPONSE_PROMISE}</p>
              <p className="mt-3 text-xs text-slate-500">
                Or{" "}
                <a
                  href={smsLink(vehicle)}
                  className="inline-flex min-h-10 items-center font-semibold text-[#002c5f] underline underline-offset-2"
                >
                  text us right now
                </a>
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 w-full rounded-full bg-[#002c5f] py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
              >
                Done
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Vehicle context */}
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                <img
                  src={vehicle.image}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className="h-[54px] w-[72px] shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {vehicle.year} {vehicle.make} {vehicle.model}{" "}
                    <span className="font-medium text-slate-500">{vehicle.trim}</span>
                  </p>
                  <p className="text-sm font-bold text-[#002c5f]">
                    ${vehicle.price.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Pre-written question (display only) */}
              <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm italic leading-relaxed text-slate-600">
                &ldquo;{copy.message}&rdquo;
              </p>

              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor={`${headingId}-phone`}
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id={`${headingId}-phone`}
                    type="tel"
                    required
                    autoComplete="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(440) 555-0199"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={`${headingId}-name`}
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  Name <span className="font-medium normal-case">(optional)</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id={`${headingId}-name`}
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className={inputClasses}
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-2.5 py-1">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-6 w-6 shrink-0 accent-[#002c5f]"
                />
                <span className="text-[11px] leading-relaxed text-slate-500">{CONSENT_TEXT}</span>
              </label>

              <button
                type="submit"
                disabled={!consent || submitting}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-full bg-[#002c5f] py-3.5",
                  "text-sm font-semibold text-white shadow-md transition hover:opacity-90",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                {submitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4" /> {copy.cta}
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-500">
                Or{" "}
                <a
                  href={smsLink(vehicle)}
                  className="inline-flex min-h-10 items-center font-semibold text-[#002c5f] underline underline-offset-2"
                >
                  text us right now
                </a>
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
