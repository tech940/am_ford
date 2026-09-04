import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ShieldCheck,
  Calculator,
  Clock,
  Sparkles,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionTag } from "@/components/site/SectionTag";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { breadcrumbSchema, crumbs } from "@/lib/breadcrumbs";
import { CONSENT_TEXT, RESPONSE_PROMISE, submitQuickLead } from "@/lib/leads";
import { dealerInfo } from "@/lib/vehicles";
import { cn } from "@/lib/utils";

/** One array drives both the visible trail and the BreadcrumbList JSON-LD. */
const BREADCRUMBS = crumbs({ label: "Financing" });

export const Route = createFileRoute("/financing")({
  head: () => ({
    meta: [
      { title: `Ford Auto Finance & Loans in ${dealerInfo.city} | AM Ford` },
      {
        name: "description",
        content: `Apply online for Ford financing pre-approval with AM Ford in ${dealerInfo.city}. Soft credit check with no impact to your score. Serving Ashtabula County.`,
      },
      {
        name: "keywords",
        content:
          "Ford financing Jefferson Ohio, auto loan Jefferson OH, car pre-approval Ashtabula County, Ford lease deals, low APR auto loan, Ford dealer Northeast Ohio, AM Ford finance",
      },
      {
        property: "og:title",
        content: `Ford Auto Loans & Pre-Approval | AM Ford ${dealerInfo.city}`,
      },
      {
        property: "og:description",
        content: "Get pre-approved in 60 seconds without affecting your credit score.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://amford.com/financing" },
    ],
    links: [{ rel: "canonical", href: "https://amford.com/financing" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(breadcrumbSchema(BREADCRUMBS)),
      },
    ],
  }),
  component: FinancingPage,
});

const STEPS = ["Vehicle", "About you", "Income", "Review"] as const;

function FinancingPage() {
  const [step, setStep] = useState(0);
  const [price, setPrice] = useState(45000);
  const [down, setDown] = useState(5000);
  const [term, setTerm] = useState(60);
  const apr = 5.9;

  // The application survives step changes here (step fields unmount on navigation)
  const [app, setApp] = useState<Record<string, string>>({});
  const bind = (key: string) => ({
    value: app[key] ?? "",
    onChange: (val: string) => setApp((prev) => ({ ...prev, [key]: val })),
  });
  const [consent, setConsent] = useState(false);
  const [appStatus, setAppStatus] = useState<"idle" | "sending" | "done">("idle");
  const [appError, setAppError] = useState<string | null>(null);

  const submitApplication = async () => {
    const phone = (app.phone ?? "").replace(/\D/g, "");
    if (phone.length < 10) {
      setAppError("Please add a valid phone number in the About You step.");
      setStep(1);
      return;
    }
    setAppStatus("sending");
    setAppError(null);
    const result = await submitQuickLead({
      leadType: "financing_preapproval",
      name: `${app.firstName ?? ""} ${app.lastName ?? ""}`.trim(),
      phone: app.phone ?? "",
      email: app.email,
      message: `Financing pre-approval application for ${[app.year, app.make, app.model, app.trim]
        .filter(Boolean)
        .join(" ")}`,
      financingDetails: {
        vehicle: { make: app.make, model: app.model, year: app.year, trim: app.trim },
        employment: {
          employer: app.employer,
          annualIncome: app.income,
          yearsEmployed: app.yearsEmployed,
          monthlyHousing: app.housing,
        },
        calculator: { price, down, term, apr, estimatedMonthly: Math.round(monthly) },
      },
    });
    if (result.success) setAppStatus("done");
    else {
      setAppStatus("idle");
      setAppError(result.message);
    }
  };

  const monthly = useMemo(() => {
    const p = Math.max(0, price - down);
    const r = apr / 100 / 12;
    return (p * r) / (1 - Math.pow(1 + r, -term));
  }, [price, down, term]);

  return (
    <SiteShell>
      <Breadcrumbs items={BREADCRUMBS} />

      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="absolute inset-0 bg-gradient-soft" />
        <div className="absolute -right-20 -top-10 h-96 w-96 rounded-full bg-radial-navy" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <SectionTag>Financing</SectionTag>
            <h1 className="display mt-3 text-balance text-5xl text-ink sm:text-6xl">
              Pre-approved in <span className="text-primary">60 seconds.</span>
            </h1>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Soft credit pull only: no impact to your score. Get a real number you can shop with,
              from real lenders.
            </p>
            <ul className="mt-8 grid gap-3 text-sm text-ink sm:grid-cols-2">
              {[
                "Won't affect your credit score",
                "Bank-grade encryption",
                "First-time buyers welcome",
                "Trade-in valuation included",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5">
            <div className="glass-strong rounded-3xl p-7 text-center">
              <Calculator className="mx-auto h-7 w-7 text-primary" />
              <p className="mt-3 text-sm uppercase tracking-widest text-muted-foreground">
                Estimated payment
              </p>
              <p className="display mt-1 text-5xl text-primary">
                ${Math.round(monthly).toLocaleString()}
                <span className="text-lg text-muted-foreground">/mo</span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {term} mo · {apr}% APR · ${down.toLocaleString()} down
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator + step flow */}
      <section className="pb-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-12">
          {/* Calc */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-card p-7 ring-1 ring-border">
              <h3 className="display text-2xl">Loan calculator</h3>
              <div className="mt-6 space-y-6">
                <Range
                  label="Vehicle price"
                  value={price}
                  min={15000}
                  max={120000}
                  step={500}
                  onChange={setPrice}
                  fmt={(n) => `$${n.toLocaleString()}`}
                />
                <Range
                  label="Down payment"
                  value={down}
                  min={0}
                  max={Math.round(price * 0.5)}
                  step={500}
                  onChange={setDown}
                  fmt={(n) => `$${n.toLocaleString()}`}
                />
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Term
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[36, 48, 60, 72, 84].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTerm(t)}
                        className={cn(
                          "rounded-full px-4 py-2 text-sm font-medium transition",
                          term === t
                            ? "bg-primary text-primary-foreground"
                            : "bg-surface-2 text-ink",
                        )}
                      >
                        {t} mo
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step flow */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-gradient-navy p-1 shadow-glow">
              <div className="rounded-[calc(1.5rem-4px)] bg-background p-7">
                {appStatus === "done" ? (
                  <div className="py-14 text-center">
                    <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
                    <h3 className="display mt-5 text-3xl text-ink">Your application is in.</h3>
                    <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
                      A finance specialist is reviewing it now. {RESPONSE_PROMISE}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      {STEPS.map((s, i) => (
                        <div key={s} className="flex flex-1 items-center gap-2">
                          <div
                            className={cn(
                              "grid h-8 w-8 place-items-center rounded-full text-xs font-semibold transition",
                              i <= step
                                ? "bg-primary text-primary-foreground"
                                : "bg-surface-2 text-muted-foreground",
                            )}
                          >
                            {i < step ? <Check className="h-4 w-4" /> : i + 1}
                          </div>
                          {i < STEPS.length - 1 && (
                            <div
                              className={cn(
                                "h-0.5 flex-1 rounded transition",
                                i < step ? "bg-primary" : "bg-border",
                              )}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
                      Step {step + 1} of {STEPS.length}
                    </p>
                    <h3 className="display mt-1 text-3xl text-ink">{STEPS[step]}</h3>

                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4 }}
                      className="mt-6 grid gap-4 sm:grid-cols-2"
                    >
                      {step === 0 && (
                        <>
                          <Field label="Make" placeholder="Ford" {...bind("make")} />
                          <Field label="Model" placeholder="F-150" {...bind("model")} />
                          <Field label="Year" placeholder="2025" {...bind("year")} />
                          <Field label="Trim" placeholder="Lariat" {...bind("trim")} />
                        </>
                      )}
                      {step === 1 && (
                        <>
                          <Field label="First name" placeholder="Alex" {...bind("firstName")} />
                          <Field label="Last name" placeholder="Morgan" {...bind("lastName")} />
                          <Field
                            label="Email"
                            placeholder="you@example.com"
                            type="email"
                            {...bind("email")}
                          />
                          <Field
                            label="Phone"
                            placeholder="(440) 555-0199"
                            type="tel"
                            {...bind("phone")}
                          />
                        </>
                      )}
                      {step === 2 && (
                        <>
                          <Field
                            label="Employer"
                            placeholder="Acme Industries"
                            {...bind("employer")}
                          />
                          <Field label="Annual income" placeholder="$72,000" {...bind("income")} />
                          <Field
                            label="Years employed"
                            placeholder="3"
                            {...bind("yearsEmployed")}
                          />
                          <Field
                            label="Monthly housing"
                            placeholder="$1,200"
                            {...bind("housing")}
                          />
                        </>
                      )}
                      {step === 3 && (
                        <div className="sm:col-span-2 space-y-4">
                          <div className="rounded-2xl bg-surface-2 p-6">
                            <p className="display text-xl">Review & submit</p>
                            <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                              <div className="flex justify-between gap-3">
                                <dt className="text-muted-foreground">Vehicle</dt>
                                <dd className="font-medium text-ink">
                                  {[app.year, app.make, app.model].filter(Boolean).join(" ") || "—"}
                                </dd>
                              </div>
                              <div className="flex justify-between gap-3">
                                <dt className="text-muted-foreground">Applicant</dt>
                                <dd className="font-medium text-ink">
                                  {`${app.firstName ?? ""} ${app.lastName ?? ""}`.trim() || "—"}
                                </dd>
                              </div>
                              <div className="flex justify-between gap-3">
                                <dt className="text-muted-foreground">Phone</dt>
                                <dd className="font-medium text-ink">{app.phone || "—"}</dd>
                              </div>
                              <div className="flex justify-between gap-3">
                                <dt className="text-muted-foreground">Est. payment</dt>
                                <dd className="font-medium text-ink">
                                  ${Math.round(monthly).toLocaleString()}/mo · {term} mo
                                </dd>
                              </div>
                            </dl>
                            <p className="mt-4 text-sm text-muted-foreground">
                              Soft credit pull only. This will not affect your score.{" "}
                              {RESPONSE_PROMISE}
                            </p>
                          </div>
                          <label className="flex items-start gap-2.5">
                            <input
                              type="checkbox"
                              checked={consent}
                              onChange={(e) => setConsent(e.target.checked)}
                              className="mt-0.5 h-6 w-6 shrink-0 accent-brand"
                            />
                            <span className="text-xs leading-relaxed text-muted-foreground">
                              {CONSENT_TEXT}
                            </span>
                          </label>
                          {appError && (
                            <p className="text-sm font-medium text-red-600">{appError}</p>
                          )}
                        </div>
                      )}
                    </motion.div>

                    <div className="mt-6 flex items-center justify-between">
                      <button
                        disabled={step === 0}
                        onClick={() => setStep((s) => Math.max(0, s - 1))}
                        className="rounded-full px-4 py-2.5 text-sm font-medium text-ink disabled:opacity-40"
                      >
                        Back
                      </button>
                      {step < STEPS.length - 1 ? (
                        <button
                          onClick={() => setStep((s) => s + 1)}
                          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
                        >
                          Continue <ArrowRight className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={submitApplication}
                          disabled={!consent || appStatus === "sending"}
                          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                        >
                          {appStatus === "sending" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ArrowRight className="h-4 w-4" />
                          )}
                          {appStatus === "sending" ? "Submitting…" : "Submit application"}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
              <Trust icon={ShieldCheck} t="Bank-grade encryption" />
              <Trust icon={Sparkles} t="Soft pull only" />
              <Trust icon={Clock} t="60-second form" />
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (val: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none transition focus:border-primary"
      />
    </label>
  );
}
function Range({
  label,
  value,
  min,
  max,
  step,
  onChange,
  fmt,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
  fmt: (n: number) => string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <span className="display text-sm text-primary">{fmt(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-6 w-full cursor-pointer accent-[oklch(0.21_0.06_256)]"
      />
    </div>
  );
}
function Trust({ icon: Icon, t }: { icon: typeof ShieldCheck; t: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl bg-surface px-3 py-3 text-center text-muted-foreground ring-1 ring-border">
      <Icon className="h-3.5 w-3.5 text-primary" /> {t}
    </div>
  );
}
