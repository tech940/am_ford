import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Car,
  DollarSign,
  CheckCircle2,
  Tag,
  ShieldCheck,
  Send,
} from "lucide-react";
import { submitLeadInquiry, type LeadInquiry } from "@/lib/supabase";
import { type Vehicle, dealerInfo } from "@/lib/vehicles";
import { cn } from "@/lib/utils";

export type ModalMode = "test_drive" | "quote_request" | "special_order" | "financing_preapproval";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle;
  initialMode?: ModalMode;
  /** Structured payload stored in the lead's financing_details column (e.g. calculator state). */
  financingDetails?: Record<string, unknown>;
}

export function LeadCaptureModal({
  isOpen,
  onClose,
  vehicle,
  initialMode = "test_drive",
  financingDetails,
}: LeadCaptureModalProps) {
  const [mode, setMode] = useState<ModalMode>(initialMode);

  // The modal stays mounted between opens, so sync the mode whenever the caller
  // re-opens it with a different intent (fixes "Get Quote" opening as test_drive).
  useEffect(() => {
    if (isOpen) setMode(initialMode);
  }, [isOpen, initialMode]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("10:00 AM");
  const [tradeInDetails, setTradeInDetails] = useState("");
  const [message, setMessage] = useState("");

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setPreferredDate("");
    setPreferredTime("10:00 AM");
    setTradeInDetails("");
    setMessage("");
    setSubmitted(false);
    setErrorMessage("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) {
      setErrorMessage("Please fill in your name, email, and phone number.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    const payload: LeadInquiry = {
      lead_type: mode,
      vehicle_id: vehicle?.id,
      full_name: fullName,
      email: email,
      phone: phone,
      preferred_date: preferredDate || undefined,
      preferred_time: preferredTime || undefined,
      message: message || tradeInDetails || undefined,
      financing_details: financingDetails,
    };

    const res = await submitLeadInquiry(payload);
    setSubmitting(false);

    if (res.success) {
      setSubmitted(true);
    } else {
      setErrorMessage(res.message);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-ink/65 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-3xl bg-card shadow-2xl ring-1 ring-border my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-surface/80 px-6 py-5">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              <h3 className="display text-xl text-ink">
                {mode === "test_drive" && "Schedule a Test Drive"}
                {mode === "quote_request" && "Request E-Price Quote"}
                {mode === "special_order" && "Request Special Vehicle Order"}
                {mode === "financing_preapproval" && "Get Pre-Approved Online"}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-ink hover:bg-surface"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="display mt-4 text-2xl font-bold text-ink">Request Submitted!</h4>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Thank you, <strong className="text-ink">{fullName}</strong>. A representative from{" "}
                  {dealerInfo.name} in {dealerInfo.city} will reach out to you shortly via phone (
                  {phone}) or email.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-6 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-90"
                >
                  Done
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Vehicle Banner Summary if vehicle is provided */}
                {vehicle && (
                  <div className="flex items-center gap-4 rounded-2xl bg-surface-2 p-3.5 ring-1 ring-border">
                    <img
                      src={vehicle.image}
                      alt={`${vehicle.year} ${vehicle.model}`}
                      className="h-16 w-24 rounded-xl object-cover"
                    />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {vehicle.year} · {vehicle.make}
                      </p>
                      <h4 className="display text-base font-bold text-ink">
                        {vehicle.model}{" "}
                        <span className="text-muted-foreground">{vehicle.trim}</span>
                      </h4>
                      <p className="display text-sm font-bold text-primary">
                        ${vehicle.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Mode Selector Chips */}
                <div className="flex flex-wrap gap-1.5 rounded-2xl bg-surface-2 p-1.5 ring-1 ring-border">
                  <button
                    type="button"
                    onClick={() => setMode("test_drive")}
                    className={cn(
                      "flex-1 rounded-xl py-2 text-xs font-semibold transition-all text-center",
                      mode === "test_drive"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-ink",
                    )}
                  >
                    Test Drive
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("quote_request")}
                    className={cn(
                      "flex-1 rounded-xl py-2 text-xs font-semibold transition-all text-center",
                      mode === "quote_request"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-ink",
                    )}
                  >
                    Get Quote
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("special_order")}
                    className={cn(
                      "flex-1 rounded-xl py-2 text-xs font-semibold transition-all text-center",
                      mode === "special_order"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-ink",
                    )}
                  >
                    Special Order
                  </button>
                </div>

                {errorMessage && (
                  <div className="rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                    {errorMessage}
                  </div>
                )}

                {/* Personal Information */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(440) 555-0199"
                        className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-primary"
                    />
                  </div>
                </div>

                {/* Conditional Fields for Test Drive Mode */}
                {mode === "test_drive" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Preferred Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="date"
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="lead-preferred-time-select"
                        className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground"
                      >
                        Preferred Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <select
                          id="lead-preferred-time-select"
                          aria-label="Preferred Time"
                          value={preferredTime}
                          onChange={(e) => setPreferredTime(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-primary"
                        >
                          <option>09:30 AM</option>
                          <option>11:00 AM</option>
                          <option>01:30 PM</option>
                          <option>03:30 PM</option>
                          <option>05:30 PM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message / Trade-In / Special Request Notes */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {mode === "quote_request"
                      ? "Trade-In & Offer Details (Optional)"
                      : mode === "special_order"
                        ? "Desired Vehicle Model, Color, or Features"
                        : "Additional Questions or Notes"}
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      mode === "quote_request"
                        ? "I have a 2019 Ford F-150 to trade in..."
                        : "Tell us what you're looking for..."
                    }
                    className="w-full rounded-xl border border-border bg-card p-3 text-sm outline-none transition focus:border-primary"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                  <span>
                    Your information is confidential and will never be shared with third parties.
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-90 disabled:opacity-50"
                  >
                    {submitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Submit Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
