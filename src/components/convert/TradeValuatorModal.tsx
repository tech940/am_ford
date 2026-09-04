import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CONSENT_TEXT, RESPONSE_PROMISE, submitQuickLead } from "@/lib/leads";
import { IconCheck, IconChevronRight, IconClose, IconPhone } from "@/components/ledger";
import { cn } from "@/lib/utils";

/** Reads the token, so a palette swap reaches inline styles too. */
const NAVY = "var(--brand)";
const TOTAL_STEPS = 6;

const YEARS = Array.from({ length: 17 }, (_, i) => 2026 - i);

const MAKES = [
  "Ford",
  "Chevrolet",
  "Toyota",
  "Honda",
  "Jeep",
  "Ram",
  "GMC",
  "Nissan",
  "Hyundai",
  "Kia",
  "Subaru",
  "Other",
];

const MILEAGE_CHIPS = [
  { label: "Under 30k", value: 25000 },
  { label: "30 to 60k", value: 45000 },
  { label: "60-100k", value: 80000 },
  { label: "100k+", value: 120000 },
];

type Condition = "Excellent" | "Good" | "Fair" | "Rough";

const CONDITIONS: { key: Condition; blurb: string }[] = [
  { key: "Excellent", blurb: "Looks & runs like new" },
  { key: "Good", blurb: "Normal wear, no major issues" },
  { key: "Fair", blurb: "Some cosmetic/mechanical needs" },
  { key: "Rough", blurb: "Significant repairs needed" },
];

const CONDITION_MULT: Record<Condition, number> = {
  Excellent: 1.08,
  Good: 1.0,
  Fair: 0.85,
  Rough: 0.65,
};

/** Everything a keyboard user can land on, used to trap Tab inside the dialog. */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/**
 * Deliberately narrow: this is a depreciation curve over age, mileage, and condition.
 * It does not read make or model, so nothing in the UI may describe it as market-based
 * or as a valuation. See the disclaimer on the reveal step.
 */
function computeEstimate(year: number, miles: number, condition: Condition) {
  const base = Math.max(1500, 32000 * Math.pow(0.88, Math.max(0, 2026 - year)));
  const mileageFactor = 1 - (Math.min(miles, 150000) / 150000) * 0.35;
  const est = base * mileageFactor * CONDITION_MULT[condition];
  const lo = Math.round((est * 0.9) / 100) * 100;
  const hi = Math.round((est * 1.1) / 100) * 100;
  return { lo, hi };
}

const STEP_TITLES = [
  "What year is your vehicle?",
  "What make?",
  "What model?",
  "How many miles on it?",
  "What condition is it in?",
  "Your estimate is ready",
];

export function TradeValuatorModal(props: { onClose: () => void }) {
  const { onClose } = props;

  const [step, setStep] = useState(1);
  const [year, setYear] = useState<number | null>(null);
  const [make, setMake] = useState<string | null>(null);
  const [model, setModel] = useState("");
  const [milesText, setMilesText] = useState("");
  const [condition, setCondition] = useState<Condition | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [revealed, setRevealed] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);

  const miles = milesText ? parseInt(milesText, 10) : 0;

  const estimate = useMemo(() => {
    if (year === null || condition === null) return null;
    return computeEstimate(year, miles, condition);
  }, [year, miles, condition]);

  // Body scroll lock while the modal is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Move focus into the dialog on mount and hand it back to the trigger on unmount,
  // so a keyboard user is not left tabbing through the page behind the modal.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => {
      previouslyFocused?.focus?.();
    };
  }, []);

  // Escape closes; Tab and Shift+Tab cycle within the dialog rather than escaping it.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const root = dialogRef.current;
      if (!root) return;

      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.getClientRects().length > 0,
      );
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) {
        e.preventDefault();
        root.focus();
        return;
      }

      const active = document.activeElement;
      const outside = !root.contains(active);

      if (e.shiftKey) {
        if (outside || active === first || active === root) {
          e.preventDefault();
          last.focus();
        }
      } else if (outside || active === last || active === root) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const goBack = () => {
    setErrorMessage("");
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (year === null || make === null || condition === null || estimate === null) return;

    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setErrorMessage("Please enter a valid phone number (at least 10 digits).");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    const message =
      `Trade-in valuation: ${year} ${make} ${model.trim()}, ~${miles.toLocaleString()} miles, ` +
      `${condition} condition. Estimate shown: $${estimate.lo.toLocaleString()}-` +
      `$${estimate.hi.toLocaleString()}.`;

    const result = await submitQuickLead({ phone, name: name || undefined, message });
    setSubmitting(false);

    // The estimate is computed locally, so the customer always gets the value they
    // just paid for with their details. If storage failed, reveal it anyway and say
    // so plainly with a channel that works, and never swallow their effort.
    setRevealed(true);
    if (!result.success) setErrorMessage(result.message);
  };

  const gridButton = (selected: boolean) =>
    cn(
      "flex min-h-11 items-center justify-center rounded-sm px-2 py-2.5 text-sm font-semibold",
      "ring-1 transition",
      selected
        ? "bg-brand text-white ring-brand"
        : "bg-surface text-ink-2 ring-rule hover:ring-brand/50 hover:text-brand",
    );

  const inputClass =
    "w-full rounded-sm border border-rule bg-surface px-4 py-3 text-sm text-ink " +
    "outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15";

  const primaryButton =
    "flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-brand text-sm " +
    "font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed " +
    "disabled:opacity-40";

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto p-4 outline-none"
      role="dialog"
      aria-modal="true"
      aria-label="Trade-in value estimator"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="fixed inset-0 bg-surface/60"
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative z-10 my-8 w-full max-w-md overflow-hidden rounded-sm bg-white
          ring-1 ring-rule"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rule px-5 py-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-ink">Trade-In Value Estimator</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-10 w-10 place-items-center rounded-sm bg-surface text-ink-2
              transition hover:bg-surface"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>

        {/* Progress */}
        {!revealed && (
          <div className="px-5 pt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-3">
                Step {step} of {TOTAL_STEPS}
              </span>
              {step > 1 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="flex min-h-10 items-center gap-1 rounded-sm px-2 text-xs
                    font-semibold text-ink-3 transition hover:text-brand"
                >
                  <IconChevronRight className="h-4 w-4" /> Back
                </button>
              )}
            </div>
            <div className="h-1 w-full overflow-hidden rounded-sm bg-surface">
              <motion.div
                animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                className="h-full rounded-sm"
                style={{ backgroundColor: NAVY }}
              />
            </div>
          </div>
        )}

        {/* Body: keyed remount per step (no AnimatePresence, since mode="wait" strands
            the exiting child under React 19, freezing the wizard on step 1). */}
        <div className="p-5">
          {(() => (
            <motion.div
              key={revealed ? "revealed" : step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18 }}
            >
              {revealed && estimate !== null ? (
                <div className="py-2 text-center">
                  <div
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-sm
                      bg-green-100 text-green-600"
                  >
                    <IconCheck className="h-8 w-8" />
                  </div>
                  <h4 className="mt-4 text-xl font-bold text-ink">
                    Here&rsquo;s your trade-in estimate
                  </h4>
                  <p className="mt-1 text-sm text-ink-3">
                    {year} {make} {model.trim()} · {miles.toLocaleString()} miles · {condition}
                  </p>
                  <p className="mt-4 text-3xl font-extrabold tracking-tight text-brand">
                    ${estimate.lo.toLocaleString()} - ${estimate.hi.toLocaleString()}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-ink-3">
                    Rough starting range based on age, mileage, and condition only. It does not read
                    your make or model, so it is not a valuation and not an offer. The real figure
                    comes from an appraisal.
                  </p>
                  {errorMessage ? (
                    <p
                      className="mt-3 rounded-sm bg-amber-50 px-4 py-3 text-sm font-medium
                        text-amber-800 ring-1 ring-amber-200"
                    >
                      {errorMessage}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm font-medium text-ink-2">{RESPONSE_PROMISE}</p>
                  )}
                  <button type="button" onClick={onClose} className={cn(primaryButton, "mt-5")}>
                    Done
                  </button>
                </div>
              ) : step === 1 ? (
                <div>
                  <h4 className="mb-3 text-lg font-bold text-ink">{STEP_TITLES[0]}</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {YEARS.map((y) => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => {
                          setYear(y);
                          setStep(2);
                        }}
                        className={gridButton(year === y)}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              ) : step === 2 ? (
                <div>
                  <h4 className="mb-3 text-lg font-bold text-ink">{STEP_TITLES[1]}</h4>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {MAKES.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setMake(m);
                          setStep(3);
                        }}
                        className={gridButton(make === m)}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              ) : step === 3 ? (
                <div>
                  <h4 className="mb-3 text-lg font-bold text-ink">{STEP_TITLES[2]}</h4>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. F-150, Silverado, RAV4"
                    autoFocus
                    className={inputClass}
                  />
                  <button
                    type="button"
                    disabled={!model.trim()}
                    onClick={() => setStep(4)}
                    className={cn(primaryButton, "mt-4")}
                  >
                    Next <IconChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : step === 4 ? (
                <div>
                  <h4 className="mb-3 text-lg font-bold text-ink">{STEP_TITLES[3]}</h4>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    required
                    value={milesText}
                    onChange={(e) => setMilesText(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="e.g. 45000"
                    className={inputClass}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {MILEAGE_CHIPS.map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => setMilesText(String(chip.value))}
                        className={cn(
                          "min-h-10 rounded-sm px-4 py-2 text-xs font-semibold ring-1 transition",
                          milesText === String(chip.value)
                            ? "bg-brand text-white ring-brand"
                            : "bg-surface text-ink-2 ring-rule hover:text-brand",
                        )}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={!milesText}
                    onClick={() => setStep(5)}
                    className={cn(primaryButton, "mt-4")}
                  >
                    Next <IconChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : step === 5 ? (
                <div>
                  <h4 className="mb-3 text-lg font-bold text-ink">{STEP_TITLES[4]}</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {CONDITIONS.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => {
                          setCondition(c.key);
                          setStep(6);
                        }}
                        className={cn(
                          "w-full rounded-sm p-4 text-left transition",
                          condition === c.key
                            ? "bg-brand/5 ring-2 ring-brand"
                            : "bg-surface ring-1 ring-rule hover:ring-brand/50",
                        )}
                      >
                        <span
                          className={cn(
                            "block text-sm font-bold",
                            condition === c.key ? "text-brand" : "text-ink",
                          )}
                        >
                          {c.key}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-3">{c.blurb}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h4 className="text-lg font-bold text-ink">{STEP_TITLES[5]}</h4>
                  <p className="mt-1 text-sm text-ink-3">
                    Tell us where to send it and we&rsquo;ll unlock your estimate for your {year}{" "}
                    {make} {model.trim()}.
                  </p>

                  {errorMessage && (
                    <div className="mt-3 rounded-sm bg-red-50 p-3 text-xs font-semibold text-red-600">
                      {errorMessage}
                    </div>
                  )}

                  <div className="mt-4 space-y-3">
                    <div className="relative">
                      <IconCheck
                        className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2
                          text-ink-3"
                      />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name (optional)"
                        autoComplete="name"
                        className={cn(inputClass, "pl-10")}
                      />
                    </div>
                    <div className="relative">
                      <IconPhone
                        className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2
                          text-ink-3"
                      />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone number *"
                        autoComplete="tel"
                        inputMode="tel"
                        className={cn(inputClass, "pl-10")}
                      />
                    </div>
                  </div>

                  <label
                    className="mt-3 flex cursor-pointer items-start gap-3 rounded-sm bg-surface
                      p-3 ring-1 ring-rule"
                  >
                    <input
                      type="checkbox"
                      required
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-brand"
                    />
                    <span className="text-xs leading-relaxed text-ink-3">{CONSENT_TEXT}</span>
                  </label>

                  <button
                    type="submit"
                    disabled={!consent || submitting}
                    className={cn(primaryButton, "mt-4")}
                  >
                    {submitting ? "Unlocking your estimate..." : "Reveal My Trade-In Value"}
                  </button>
                </form>
              )}
            </motion.div>
          ))()}
        </div>
      </motion.div>
    </div>
  );
}
