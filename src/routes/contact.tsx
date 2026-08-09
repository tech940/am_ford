import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, Loader2 } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionTag } from "@/components/site/Home";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { breadcrumbSchema, crumbs } from "@/lib/breadcrumbs";
import { dealerInfo } from "@/lib/vehicles";
import { CONSENT_TEXT, RESPONSE_PROMISE, submitQuickLead } from "@/lib/leads";

/** One array drives both the visible trail and the BreadcrumbList JSON-LD. */
const BREADCRUMBS = crumbs({ label: "Contact" });

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact AM Ford in ${dealerInfo.city} | Phone, Hours & Address` },
      {
        name: "description",
        content: `Reach AM Ford at ${dealerInfo.address}. Call ${dealerInfo.phone} or message us to book a test drive. Serving Ashtabula County.`,
      },
      {
        name: "keywords",
        content:
          "AM Ford contact, AM Ford address, AM Ford hours, Ford dealer Jefferson Ohio, Ford dealership Jefferson OH phone number, AM Ford location, Ford dealer Ashtabula County",
      },
      { property: "og:title", content: `Contact AM Ford | ${dealerInfo.city}` },
      {
        property: "og:description",
        content: `Visit us at ${dealerInfo.address} or call ${dealerInfo.phone}. We're open 6 days a week.`,
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://amford.com/contact" },
    ],
    links: [{ rel: "canonical", href: "https://amford.com/contact" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(breadcrumbSchema(BREADCRUMBS)),
      },
    ],
  }),
  component: ContactPage,
});

/** Built from the single source of truth so the map always matches the published address. */
const MAP_SRC = `https://www.google.com/maps?q=${encodeURIComponent(
  dealerInfo.address,
)}&output=embed`;

function ContactPage() {
  return (
    <SiteShell>
      <Breadcrumbs items={BREADCRUMBS} />

      <section className="relative overflow-hidden py-20 sm:py-24">
        <div className="absolute inset-0 bg-gradient-soft" />
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionTag>Contact</SectionTag>
          <h1 className="display mt-3 max-w-3xl text-balance text-5xl text-ink sm:text-6xl">
            Let's get you on the road.
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Call, chat, or stop by {dealerInfo.address}. Our team is here six days a week, Monday
            through Saturday.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 lg:grid-cols-12">
          {/* Form */}
          <div className="rounded-3xl bg-card p-7 ring-1 ring-border lg:col-span-7">
            <ContactForm />
          </div>

          {/* Info column */}
          <div className="space-y-4 lg:col-span-5">
            <a
              href={dealerInfo.phoneHref}
              className="block rounded-3xl bg-gradient-navy p-7 text-white shadow-glow transition hover:opacity-95"
            >
              <Phone className="h-6 w-6" />
              <p className="display mt-4 text-3xl">{dealerInfo.phone}</p>
              <p className="mt-1 text-sm text-white/70">Sales · Service · Parts</p>
            </a>
            <Info icon={MapPin} title="Visit us" body={dealerInfo.address} />
            <Info icon={Mail} title="Email" body="sales@amfordashtabula.com" />
            <div className="rounded-3xl bg-card p-6 ring-1 ring-border">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <p className="display text-lg">Hours</p>
              </div>
              <ul className="mt-4 divide-y divide-border text-sm">
                {dealerInfo.hours.map((h) => (
                  <li key={h.day} className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">{h.day}</span>
                    <span className="font-medium text-ink">{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mx-auto mt-10 max-w-7xl px-6">
          <div className="overflow-hidden rounded-3xl ring-1 ring-border">
            <iframe
              title="AM Ford map"
              src={MAP_SRC}
              className="h-[420px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  if (status === "done") {
    return (
      <div className="py-10 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
        <h2 className="display mt-5 text-3xl">Message received!</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">{RESPONSE_PROMISE}</p>
        <a
          href={dealerInfo.phoneHref}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          <Phone className="h-4 w-4" /> Or call us now
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        const phone = String(data.get("phone") ?? "");
        if (phone.replace(/\D/g, "").length < 10) {
          setError("Please enter a valid phone number.");
          return;
        }
        setStatus("sending");
        setError(null);
        const vehicle = String(data.get("vehicle") ?? "").trim();
        const result = await submitQuickLead({
          leadType: "general_contact",
          name: String(data.get("name") ?? ""),
          phone,
          email: String(data.get("email") ?? ""),
          message: `Contact form: ${String(data.get("message") ?? "").trim() || "(no message)"}${
            vehicle ? ` — Vehicle of interest: ${vehicle}` : ""
          }`,
        });
        if (result.success) {
          setStatus("done");
        } else {
          setStatus("idle");
          setError(result.message);
        }
      }}
    >
      <h2 className="display text-3xl">Send us a message.</h2>
      <p className="mt-2 text-sm text-muted-foreground">{RESPONSE_PROMISE}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="name" placeholder="Alex Morgan" required />
        <Field label="Phone" name="phone" placeholder="(440) 555-0199" type="tel" required />
        <Field label="Email" name="email" placeholder="you@example.com" type="email" />
        <Field label="Vehicle of interest" name="vehicle" placeholder="2025 Ford F-150" />
        <label className="sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            How can we help?
          </span>
          <textarea
            name="message"
            rows={5}
            placeholder="Tell us a bit about what you're looking for…"
            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
          />
        </label>
      </div>
      <label className="mt-5 flex items-start gap-2.5">
        <input type="checkbox" required className="mt-0.5 h-6 w-6 shrink-0 accent-[#002c5f]" />
        <span className="text-xs leading-relaxed text-muted-foreground">{CONSENT_TEXT}</span>
      </label>
      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {status === "sending" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  name,
  required,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  name?: string;
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
function Info({ icon: Icon, title, body }: { icon: typeof Phone; title: string; body: string }) {
  return (
    <div className="rounded-3xl bg-card p-6 ring-1 ring-border">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <p className="display text-lg">{title}</p>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
