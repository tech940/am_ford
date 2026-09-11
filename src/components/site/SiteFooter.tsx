import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Phone, MapPin, Clock, Mail, CheckCircle2 } from "lucide-react";
import { dealerInfo, DELIVERY_CLAIM } from "@/lib/vehicles";
import { buildFrequentSearchGroups, FrequentSearchRow } from "@/components/site/FrequentSearches";
import { submitQuickLead } from "@/lib/leads";

function StayUpdated() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("submitting");
    try {
      await submitQuickLead({
        leadType: "newsletter_signup",
        name: `${firstName.trim()} ${lastName.trim()}`.trim() || "Newsletter Subscriber",
        phone: "(440) 553-7072",
        email: email.trim(),
        message: `Stay Updated VIP Newsletter subscriber for special offers`,
      });
      setStatus("success");
    } catch {
      setStatus("success");
    }
  };

  return (
    <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-white/20 text-slate-900">
      <div className="relative">
        <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
          Stay Updated
        </h3>
        <div className="mt-1.5 h-[3px] w-12 bg-[#002c5f] rounded-full" />
      </div>
      <p className="mt-2 text-xs sm:text-[13px] text-slate-600 font-medium">
        Get special offers directly to your inbox.
      </p>

      {status === "success" ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-300 p-3.5 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>You&apos;re on the VIP list! Watch your inbox for special Ford offers.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="First"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002c5f] focus:border-[#002c5f]"
            />
            <input
              type="text"
              placeholder="Last"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002c5f] focus:border-[#002c5f]"
            />
          </div>
          <input
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002c5f] focus:border-[#002c5f]"
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full rounded-xl bg-[#002c5f] hover:bg-[#001f44] text-white font-extrabold text-xs sm:text-sm py-2.5 px-4 shadow-md transition active:scale-95 cursor-pointer disabled:opacity-70"
          >
            {status === "submitting" ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
      )}
    </div>
  );
}

/**
 * Site-wide footer navigation. Every page type in the SEO architecture needs at least one
 * crawlable entry point that is not the sitemap; anything reachable only by sitemap gets
 * discovered but inherits no internal link equity.
 */
const FOOTER_COLUMNS = [
  {
    heading: "Shop",
    links: [
      { to: "/inventory", label: "New & Used Inventory" },
      { to: "/ford-models", label: "Ford Models" },
      { to: "/compare", label: "Compare Ford Models" },
      { to: "/commercial", label: "Commercial & Work Vehicles" },
    ],
  },
  {
    heading: "Financing & Trade",
    links: [
      { to: "/financing", label: "Apply for Financing" },
      { to: "/finance/bad-credit", label: "Financing With Limited Credit" },
      { to: "/trade-in", label: "Value Your Trade" },
      { to: "/guides", label: "Ford Buying Guides" },
    ],
  },
  {
    heading: "Dealership Services",
    links: [
      { to: "/service", label: "Service & Parts" },
      { to: "/nationwide-vehicle-delivery", label: "Vehicle Delivery & Shipping" },
      { to: "/areas-we-serve", label: "Areas We Serve" },
      { to: "/about", label: "About AM Ford" },
      { to: "/contact", label: "Contact" },
      { to: "/sitemap", label: "HTML Sitemap" },
    ],
  },
] as const;

/**
 * Compact grouped link block under the columns above.
 *
 * The four columns are curated hub links. This block is the crawl surface: every model page,
 * every city and county page, every guide and comparison, and the body style filters, reachable
 * from the bottom of every page on the site. It is built from the same derived data the
 * "Frequent Searches" hub uses, so the two can never disagree about which routes exist.
 */
const FOOTER_LINK_GROUPS = buildFrequentSearchGroups(["models", "bodyStyle", "nearby", "research"]);

export function SiteFooter() {
  return (
    <footer className="relative mt-16 sm:mt-20 overflow-hidden bg-gradient-navy text-white">
      <div className="absolute inset-0 opacity-30 noise pointer-events-none" />
      <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 py-8 sm:py-12">
        {/* Top Header Row: Left Brand Info + Right Stay Updated Newsletter Box */}
        <div className="mb-10 grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <Link
              to="/"
              className="inline-flex items-center rounded-2xl bg-white px-6 py-3.5 shadow-xl transition hover:bg-white/95 hover:scale-[1.02]"
            >
              <img
                src="/am-ford-logo.png"
                alt="AM Ford"
                width={260}
                height={80}
                loading="lazy"
                decoding="async"
                className="h-10 sm:h-12 md:h-14 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 max-w-lg text-balance text-xs sm:text-sm font-medium text-white/80 leading-relaxed">
              A family-owned Ford dealership in Ashtabula County, Ohio serving Northeast
              Ohio, and Northwestern Pennsylvania. {DELIVERY_CLAIM}
            </p>
            <a
              href={dealerInfo.phoneHref}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-extrabold text-[#002c5f] shadow-glow transition hover:bg-slate-100"
            >
              <Phone className="h-3.5 w-3.5" /> {dealerInfo.phone}
            </a>
          </div>

          <div className="lg:col-span-5">
            <StayUpdated />
          </div>
        </div>

        <div className="grid gap-8 border-t border-white/10 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/60">
                {col.heading}
              </h2>
              <ul className="text-xs font-medium">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="block py-1.5 text-white/80 transition hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/60">
              Visit Us
            </h2>
            <ul className="space-y-2 text-xs font-medium text-white/80">
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {dealerInfo.address}
              </li>
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {dealerInfo.phone}
              </li>
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" /> sales@amfordashtabula.com
              </li>
              <li className="flex gap-2.5">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Mon to Sat · See hours
              </li>
            </ul>
          </div>
        </div>

        <nav
          aria-label="Ford models, areas served, and research"
          className="mt-8 border-t border-white/10 pt-6"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/60">
            More ways to browse AM Ford
          </h2>
          <div className="mt-4 space-y-4">
            {FOOTER_LINK_GROUPS.map((group) => (
              <FrequentSearchRow
                key={group.id}
                group={group}
                idPrefix="footer-links"
                headingClassName="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50"
                linkClassName="px-0.5 text-[11px] font-medium text-white/80 hover:text-white"
                separatorClassName="text-white/25"
              />
            ))}
          </div>
        </nav>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-4 text-[11px] font-semibold text-slate-200 sm:flex-row">
          <span>© {new Date().getFullYear()} AM Ford. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link to="/sitemap" className="text-white/60 hover:text-white transition">
              Sitemap
            </Link>
            <span>·</span>
            <span>Ashtabula County, Ohio · Serving Northeast Ohio and beyond.</span>
            <Link to="/admin" className="text-white/40 hover:text-white/80 transition text-[10px] uppercase tracking-wider font-mono">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
