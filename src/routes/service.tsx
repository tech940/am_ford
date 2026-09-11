import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wrench,
  Calendar,
  Check,
  Clock,
  ShieldCheck,
  Phone,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { CONSENT_TEXT, RESPONSE_PROMISE, submitQuickLead } from "@/lib/leads";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionTag } from "@/components/site/Home";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { breadcrumbSchema, crumbs } from "@/lib/breadcrumbs";
import { dealerInfo } from "@/lib/vehicles";
import service from "@/assets/service.jpg";
import { cn } from "@/lib/utils";

/** One array drives both the visible trail and the BreadcrumbList JSON-LD. */
const BREADCRUMBS = crumbs({ label: "Service & Parts" });

export const Route = createFileRoute("/service")({
  head: () => ({
    meta: [
      { title: `Certified Ford Service & Auto Repair in Ashtabula County, OH | AM Ford` },
      {
        name: "description",
        content: `Ford-certified service center in Ashtabula County (${dealerInfo.city}). Oil changes, brakes, tires, batteries, warranty diagnostics, and recall repairs. Schedule online.`,
      },
      {
        name: "keywords",
        content:
          "Ford service Ashtabula County, Ford repair Ashtabula County OH, Ford oil change Ashtabula, Ford parts Ashtabula County, Ford service Jefferson Ohio, Ford brake repair, Ford dealer Northeast Ohio",
      },
      // Local geo tags
      { name: "geo.region", content: "US-OH" },
      { name: "geo.placename", content: "Ashtabula County, OH" },
      { name: "geo.position", content: "41.7389;-80.7684" },
      { name: "ICBM", content: "41.7389, -80.7684" },
      {
        property: "og:title",
        content: `Certified Ford Service Center in Ashtabula County, OH | AM Ford`,
      },
      {
        property: "og:description",
        content: "Schedule certified Ford service, oil changes, tires, and maintenance online.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://amford.com/service" },
    ],
    links: [{ rel: "canonical", href: "https://amford.com/service" }],
    // head() runs after module evaluation, so SERVICE_SCHEMA below is already defined.
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(breadcrumbSchema(BREADCRUMBS)),
      },
      { type: "application/ld+json", children: JSON.stringify(SERVICE_SCHEMA) },
    ],
  }),
  component: ServicePage,
});

const SERVICES = [
  {
    t: "The Works® Oil Change",
    p: "$59.95",
    d: "Synthetic blend oil, multi-point inspection, fluid top-off, tire rotation.",
  },
  {
    t: "Brake Service",
    p: "From $199",
    d: "Pads, rotors, fluid, and a full inspection, all using genuine Ford OEM parts.",
  },
  {
    t: "Tire Sale & Rotation",
    p: "Price-matched",
    d: "Major brands. We'll match any local tire price for 30 days.",
  },
  {
    t: "Battery & Alternator",
    p: "From $149",
    d: "Free battery test. Replacement with Motorcraft® batteries.",
  },
  { t: "Diagnostics", p: "$129", d: "Computer diagnostics by Ford-certified technicians." },
  {
    t: "Recall Service",
    p: "Free",
    d: "Active recall work covered under Ford manufacturer programs.",
  },
];

/**
 * Service (not AutoRepair) on purpose: AutoRepair is a LocalBusiness subtype, and emitting
 * one here would read as a second business. Instead this node references the single
 * dealership defined in __root.tsx by @id, so Google keeps one dealership with one
 * service offering attached.
 *
 * The offer catalog is derived from SERVICES so it can never drift from what the page
 * renders. Names only — prices are deliberately excluded as unapproved claims.
 */
const SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://amford.com/service#ford-service",
  name: "Ford-Certified Service and Parts",
  serviceType: "Ford-certified vehicle service, repair, and parts",
  description:
    "Ford-certified service and repair from factory-trained technicians using genuine Ford and Motorcraft OEM parts, including oil changes, brakes, tires, batteries, diagnostics, and recall work.",
  url: "https://amford.com/service",
  provider: { "@id": "https://amford.com/#dealer" },
  areaServed: [
    { "@type": "AdministrativeArea", name: "Ashtabula County" },
    { "@type": "AdministrativeArea", name: "Northeast Ohio" },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Ford Service and Repair",
    itemListElement: SERVICES.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s.t },
    })),
  },
};

function ServicePage() {
  const [day, setDay] = useState("Tomorrow");
  const [time, setTime] = useState("10:00 AM");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const toggleService = (t: string) =>
    setSelectedServices((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  return (
    <SiteShell>
      <Breadcrumbs items={BREADCRUMBS} />

      {/* Hero — split */}
      <section className="relative overflow-hidden">
        <div className="grid lg:grid-cols-2">
          <div className="relative px-6 py-20 sm:px-12 lg:py-28">
            <div className="mx-auto max-w-xl">
              <SectionTag>Service</SectionTag>
              <h1 className="display mt-3 text-balance text-5xl text-ink sm:text-6xl">
                Certified Ford service, <span className="text-primary">done right.</span>
              </h1>
              <p className="mt-4 text-muted-foreground">
                Factory-trained technicians, OEM Motorcraft® parts, and a no-surprise quote. Every
                time. Same-day appointments often available.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3 text-xs">
                <Badge icon={ShieldCheck} t="Ford Certified" />
                <Badge icon={Clock} t="Same-day" />
                <Badge icon={Check} t="OEM Parts" />
              </div>
            </div>
          </div>
          <div className="relative h-72 lg:h-auto">
            <img src={service} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent lg:from-background/30" />
          </div>
        </div>
      </section>

      {/* Booking */}
      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="display text-4xl">Book your appointment.</h2>
            <p className="mt-3 text-muted-foreground">
              Tell us what you need; we'll confirm by text within minutes.
            </p>
            <a
              href={dealerInfo.phones.serviceHref}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
            >
              <Phone className="h-4 w-4" /> Or call {dealerInfo.phones.service}
            </a>
          </div>
          <div className="rounded-3xl bg-card p-7 ring-1 ring-border lg:col-span-7">
            {status === "done" ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
                <h3 className="display mt-5 text-3xl">We've got your request.</h3>
                <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
                  {day} at {time}. {RESPONSE_PROMISE}
                </p>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget);
                  const phone = String(data.get("phone") ?? "");
                  if (phone.replace(/\D/g, "").length < 10) {
                    setError("Please enter a valid phone number.");
                    return;
                  }
                  setStatus("sending");
                  setError(null);
                  const result = await submitQuickLead({
                    leadType: "general_contact",
                    name: String(data.get("name") ?? ""),
                    phone,
                    message: `Service booking: ${
                      selectedServices.length > 0 ? selectedServices.join(" + ") : "General service"
                    } for ${String(data.get("vehicle") ?? "").trim() || "unspecified vehicle"}${
                      String(data.get("mileage") ?? "").trim()
                        ? ` (${String(data.get("mileage"))} mi)`
                        : ""
                    } — Requested: ${day} at ${time}`,
                  });
                  if (result.success) setStatus("done");
                  else {
                    setStatus("idle");
                    setError(result.message);
                  }
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name" name="name" placeholder="Alex Morgan" required />
                  <Field
                    label="Phone"
                    name="phone"
                    placeholder="(440) 555-0199"
                    type="tel"
                    required
                  />
                  <Field label="Vehicle" name="vehicle" placeholder="2023 F-150" />
                  <Field label="Mileage" name="mileage" placeholder="42,500" />
                </div>
                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Service needed
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SERVICES.map((s) => {
                      const active = selectedServices.includes(s.t);
                      return (
                        <button
                          key={s.t}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleService(s.t)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition",
                            active
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-surface-2 text-ink hover:bg-surface",
                          )}
                        >
                          {active && <Check className="h-3.5 w-3.5" />}
                          {s.t}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Day
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["Today", "Tomorrow", "Thu", "Fri", "Sat"].map((d) => (
                        <button
                          key={d}
                          onClick={() => setDay(d)}
                          className={cn(
                            "rounded-full px-3 py-1.5 text-sm transition",
                            day === d
                              ? "bg-primary text-primary-foreground"
                              : "bg-surface-2 text-ink",
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Time
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setTime(t)}
                          className={cn(
                            "rounded-full px-3 py-1.5 text-sm transition",
                            time === t
                              ? "bg-primary text-primary-foreground"
                              : "bg-surface-2 text-ink",
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <label className="mt-6 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    required
                    className="mt-0.5 h-6 w-6 shrink-0 accent-[#002c5f]"
                  />
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    {CONSENT_TEXT}
                  </span>
                </label>
                {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {status === "sending" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Calendar className="h-4 w-4" />
                  )}
                  {status === "sending" ? "Booking…" : "Confirm appointment"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Service grid */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between">
            <h2 className="display text-4xl">What we service.</h2>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              Pricing shown is starting from.
            </span>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => (
              <motion.div
                key={s.t}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="group rounded-3xl bg-card p-6 ring-1 ring-border transition hover:-translate-y-1 hover:shadow-elevated"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Wrench className="h-5 w-5" />
                  </span>
                  <span className="display text-primary">{s.p}</span>
                </div>
                <h3 className="display mt-4 text-xl text-ink">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function Field({
  label,
  placeholder,
  name,
  type = "text",
  required,
}: {
  label: string;
  placeholder?: string;
  name?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
      />
    </label>
  );
}
function Badge({ icon: Icon, t }: { icon: typeof ShieldCheck; t: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl bg-surface-2 px-3 py-2.5 text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-primary" /> {t}
    </div>
  );
}
