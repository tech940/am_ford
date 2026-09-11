import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Banknote,
  Briefcase,
  Building2,
  Car,
  FileText,
  HelpCircle,
  Home,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionTag } from "@/components/site/Home";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { breadcrumbSchema, crumbs, SITE_ORIGIN } from "@/lib/breadcrumbs";
import { dealerInfo } from "@/lib/vehicles";

const PATH = "/finance/bad-credit";
const CANONICAL = `${SITE_ORIGIN}${PATH}`;

/**
 * The trail points at /financing rather than a bare /finance segment, because /finance
 * is a URL prefix here and not a page. Every href in a Crumb has to resolve to a route
 * that actually exists.
 */
const BREADCRUMBS = crumbs(
  { label: "Financing", href: "/financing" },
  { label: "Every Credit Situation" },
);

/**
 * Service node referencing the single dealership by @id. Deliberately free of any
 * rate, term, payment, or approval-odds claim: those are lender decisions, they are
 * not approved marketing, and structured data is exactly where a stale number does
 * the most damage.
 */
const SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${CANONICAL}#credit-challenged-financing`,
  name: "Ford Financing for Every Credit Situation",
  serviceType: "Auto loan assistance for first-time buyers, limited credit, and credit rebuilding",
  description:
    "AM Ford in Jefferson, Ohio submits one application to multiple lenders on behalf of first-time buyers, drivers with limited credit history, and people rebuilding credit. We explain what lenders look at, which documents help, and how a down payment or trade affects the outcome.",
  url: CANONICAL,
  provider: { "@id": "https://amford.com/#dealer" },
  areaServed: [
    { "@type": "AdministrativeArea", name: "Ashtabula County" },
    { "@type": "AdministrativeArea", name: "Northeast Ohio" },
    { "@type": "AdministrativeArea", name: "Northwestern Pennsylvania" },
  ],
};

export const Route = createFileRoute("/finance/bad-credit")({
  head: () => ({
    meta: [
      { title: "Ford Financing for All Credit Situations | Ashtabula County, OH | AM Ford" },
      {
        name: "description",
        content:
          "First-time buyer, limited credit history, or rebuilding credit in Ashtabula County, OH? AM Ford in Jefferson works with multiple lenders. Apply online with no obligation.",
      },
      {
        name: "keywords",
        content:
          "no credit auto financing Ashtabula County, bad credit car loan Ashtabula County, first time car buyer Ashtabula County OH, rebuilding credit auto loan, second chance financing Ford, buy here pay here alternative Northeast Ohio, car loan after bankruptcy Ohio",
      },
      // Local geo tags
      { name: "geo.region", content: "US-OH" },
      { name: "geo.placename", content: "Ashtabula County, OH" },
      { name: "geo.position", content: "41.7389;-80.7684" },
      { name: "ICBM", content: "41.7389, -80.7684" },
      { property: "og:title", content: "Ford Financing for All Credit Situations | Ashtabula County, OH | AM Ford" },
      {
        property: "og:description",
        content:
          "One application, multiple lenders, and a straight answer about where you stand. No judgement and no guarantees we cannot keep.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(breadcrumbSchema(BREADCRUMBS)) },
      { type: "application/ld+json", children: JSON.stringify(SERVICE_SCHEMA) },
    ],
  }),
  component: BadCreditFinancePage,
});

const AUDIENCES = [
  {
    icon: Users,
    title: "First-time buyers",
    body: "No credit history is not the same as poor credit history, and lenders treat the two differently. If this is your first vehicle loan, what usually carries the application is steady income, time at your job, and money down.",
  },
  {
    icon: FileText,
    title: "Thin or limited credit files",
    body: "Some people simply have not borrowed much. A short file with a couple of accounts on it gives a lender less to read, so the rest of the picture, income and stability, counts for more.",
  },
  {
    icon: ShieldCheck,
    title: "Rebuilding after a setback",
    body: "Medical bills, a divorce, a layoff, a discharged bankruptcy, a repossession years back. These are ordinary events that show up in a credit file. What lenders want to see is what has happened since.",
  },
  {
    icon: Briefcase,
    title: "Self-employed and variable income",
    body: "If you are paid on a 1099, run your own trade, or your hours swing with the season, your income is real but harder for a lender to read from a pay stub. Documentation is what closes that gap.",
  },
];

const LENDER_FACTORS = [
  {
    icon: Banknote,
    title: "Income you can prove",
    body: "Not just how much, but how steady and how verifiable. A lender is deciding whether the payment fits your month, so consistent, documented income does more for an application than a high figure that is hard to confirm.",
  },
  {
    icon: Home,
    title: "Stability at work and at home",
    body: "Time with the same employer and time at the same address both count. If you have moved recently or changed jobs, it helps to be able to show the history that came before the change.",
  },
  {
    icon: Car,
    title: "The vehicle itself",
    body: "Lenders secure the loan against the vehicle, so its age, mileage, and value shape what they will approve and over what term. Sometimes a different model or trim is what turns a maybe into a yes.",
  },
  {
    icon: Building2,
    title: "How much you are borrowing against it",
    body: "The gap between what you are financing and what the vehicle is worth matters to every lender. Money down or trade equity closes that gap, which is why it moves applications more reliably than anything else you control.",
  },
];

const DOCUMENTS = [
  "A valid driver license, and proof of insurance or the name of your insurer",
  "Recent pay stubs, usually covering the last month, showing year-to-date earnings",
  "Bank statements, 1099s, or the last two tax returns if you are self-employed",
  "Proof of where you live, such as a utility bill, lease, or mortgage statement",
  "Details of your down payment and where it is coming from",
  "Your trade vehicle title, or the lender name and a current payoff figure",
  "Several personal references with working phone numbers, which some lenders ask for",
];

const FAQS = [
  {
    q: "Can you guarantee I will be approved?",
    a: "No, and you should be careful with any dealership that says otherwise. Approval is a lender decision based on your credit, your income, the vehicle, and the structure of the deal. What we can promise is that we will present your application properly, send it to lenders who actually work with your situation, and tell you honestly and quickly where it lands.",
  },
  {
    q: "What rate or payment should I expect?",
    a: "We will not put a number on this page, because it would not be true for you. Rates and terms depend on your credit, the length of the loan, and which lender approves it. Once your application has been through, we come back with the actual figures you can decide on.",
  },
  {
    q: "Will applying at several dealerships hurt my credit?",
    a: "Auto loan shopping is generally treated differently from opening several unrelated accounts, and scoring models tend to group inquiries made in a short window. The practical advice is to do your shopping inside a tight period rather than spreading it over months. One application with us goes out to multiple lenders, so you are not filing separately with each one.",
  },
  {
    q: "How much of a down payment do I need?",
    a: "There is no single figure, and any dealership quoting one without seeing your application is guessing. More down means less financed, which improves how the loan looks to a lender and usually widens your options. Tell us what you can comfortably put in and we will build the request around it.",
  },
  {
    q: "I filed bankruptcy. Is it too soon to apply?",
    a: "Not necessarily. Lenders look at whether the bankruptcy is discharged, how long ago it was, and what your payment record looks like since. Bring your discharge paperwork if you have it. This is a common situation and it is not one you need to feel awkward about raising with us.",
  },
  {
    q: "Can a co-signer help?",
    a: "Often, yes. A co-signer with stronger credit gives the lender a second party responsible for the loan, which can change both the approval and the terms. It is a serious commitment for them, since missed payments affect their credit too, so it is worth a proper conversation before anyone signs.",
  },
  {
    q: "Will an auto loan help me rebuild credit?",
    a: "An auto loan reported to the credit bureaus builds payment history as you pay it, and payment history is the part of a credit file that carries the most weight. The condition is that the payment has to be one you can make every month without strain, which is why we would rather put you in a vehicle you can comfortably afford than the most expensive one you qualify for.",
  },
];

function BadCreditFinancePage() {
  return (
    <SiteShell>
      <Breadcrumbs items={BREADCRUMBS} />

      <section className="relative overflow-hidden border-b border-slate-200 py-16 sm:py-20">
        <div className="absolute inset-0 bg-gradient-soft" />
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionTag>Financing</SectionTag>
          <h1 className="display mt-3 max-w-3xl text-balance text-4xl text-ink sm:text-5xl lg:text-6xl">
            Ford Financing for Every Credit Situation
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            A credit score is a snapshot of one part of your life, not a verdict on you. If you are
            buying your first vehicle, have barely used credit, or are working your way back from a
            rough stretch, there is a conversation to be had here. We will tell you what lenders are
            looking at, what helps, and where your application actually stands.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/financing"
              className="inline-flex items-center gap-2 rounded-full bg-[#002c5f] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#001f44]"
            >
              Start Your Financing Application <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={dealerInfo.phoneHref}
              className="inline-flex items-center gap-2 rounded-full border border-[#002c5f]/25 bg-white px-6 py-3.5 text-sm font-bold text-[#002c5f] transition hover:bg-slate-50"
            >
              <Phone className="h-4 w-4" /> Talk to a Finance Specialist
            </a>
          </div>
          <p className="mt-5 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            We do not publish rates or payments, because they depend on your credit, your term, and
            the lender who approves the deal. Anything printed on a web page would be a guess.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="display text-3xl sm:text-4xl">Situations we work with every week</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            None of these is unusual, and none of them needs an apology. Say which one sounds like
            you and we will start from there.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {AUDIENCES.map((item) => (
              <div key={item.title} className="rounded-3xl bg-card p-7 ring-1 ring-border">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2/60 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTag>How Lenders Decide</SectionTag>
          <h2 className="display mt-3 text-3xl sm:text-4xl">
            What actually gets read on your application
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Your score is one input among several. Knowing the others is useful, because two of them
            are things you can change before you apply.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {LENDER_FACTORS.map((f) => (
              <div key={f.title} className="rounded-3xl bg-card p-7 ring-1 ring-border">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2">
          <div>
            <SectionTag>Come Prepared</SectionTag>
            <h2 className="display mt-3 text-3xl sm:text-4xl">Documents that strengthen a file</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              A lender approves what it can verify. Every item here replaces an assumption with a
              fact, and a well-documented application from a modest credit file often does better
              than a thin one from a stronger file.
            </p>
            <ul className="mt-6 space-y-3">
              {DOCUMENTS.map((d) => (
                <li key={d} className="flex items-start gap-3 text-sm text-ink">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="leading-relaxed">{d}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              If something on that list is missing, tell us rather than delaying the application. In
              most cases there is another way to evidence the same thing.
            </p>
          </div>

          <div>
            <SectionTag>Money Down and Trade Equity</SectionTag>
            <h2 className="display mt-3 text-3xl sm:text-4xl">The part you control</h2>
            <div className="mt-6 space-y-5">
              <div className="rounded-3xl bg-card p-7 ring-1 ring-border">
                <h3 className="text-lg font-bold text-ink">A down payment does three things</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  It reduces the amount you borrow, it narrows the gap between the loan and what the
                  vehicle is worth, and it shows a lender that you have committed something of your
                  own to the purchase. For applications sitting on the line, that last point matters
                  more than people expect.
                </p>
              </div>
              <div className="rounded-3xl bg-card p-7 ring-1 ring-border">
                <h3 className="text-lg font-bold text-ink">
                  Your current vehicle may be the answer
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  If your vehicle is worth more than you owe on it, that equity works exactly like
                  cash down. Plenty of buyers who assumed they had nothing to put in discover they
                  had it parked outside the whole time. An appraisal costs nothing and is not a
                  credit check.
                </p>
                <Link
                  to="/trade-in"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                >
                  Value your trade at AM Ford <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="rounded-3xl bg-card p-7 ring-1 ring-border">
                <h3 className="text-lg font-bold text-ink">One application, multiple lenders</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  We are not tied to a single bank. Your application goes to a range of lenders,
                  including ones that specialize in limited and rebuilding credit, and we work the
                  structure until we know what is genuinely available. If the answer is no
                  everywhere, we tell you that too, along with what would need to change.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2/60 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTag>Matching the Vehicle to the Approval</SectionTag>
          <h2 className="display mt-3 text-3xl sm:text-4xl">
            Sometimes the vehicle is what unlocks the deal
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Because the loan is secured against the vehicle, the one you pick is part of the credit
            decision. Moving to a different model, trim, or model year can change the terms a lender
            will write, and it can also bring the monthly commitment down to something that leaves
            room in your budget.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl bg-card p-7 ring-1 ring-border">
              <h3 className="text-lg font-bold text-ink">Start with running costs</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Fuel, insurance, and tires are part of what you pay every month even though they are
                not on the loan. A compact hybrid crossover is often the sensible first vehicle for
                exactly that reason.
              </p>
              <Link
                to="/ford/$model"
                params={{ model: "escape" }}
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                Ford Escape buying guide <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-3xl bg-card p-7 ring-1 ring-border">
              <h3 className="text-lg font-bold text-ink">When the truck is the job</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                If your income depends on the vehicle, say so. A pickup used for work is a different
                conversation from a pickup bought for the weekend, and lenders understand that.
              </p>
              <Link
                to="/ford/$model"
                params={{ model: "f-150" }}
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                Ford F-150 buying guide <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-3xl bg-card p-7 ring-1 ring-border">
              <h3 className="text-lg font-bold text-ink">Carrying a family</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                If you need three rows, we would rather find the version of that vehicle your
                approval supports than talk you into something that does not fit the household.
              </p>
              <Link
                to="/ford/$model"
                params={{ model: "explorer" }}
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                Ford Explorer buying guide <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <Link
            to="/inventory"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            Browse Available Ford Vehicles
          </Link>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <SectionTag>Straight Answers</SectionTag>
          <h2 className="display mt-3 text-3xl sm:text-4xl">Questions people are nervous to ask</h2>
          <dl className="mt-8 space-y-4">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-2xl bg-card p-6 ring-1 ring-border">
                <dt className="flex items-start gap-3 text-base font-bold text-ink">
                  <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {f.q}
                </dt>
                <dd className="mt-2 pl-7 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 rounded-3xl bg-card p-7 ring-1 ring-border">
            <h3 className="display text-xl">Find out where you stand</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Applying costs nothing and commits you to nothing. Our finance team in{" "}
              {dealerInfo.locality} reads every application personally before it goes anywhere, and
              you will hear back either way.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/financing"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
              >
                Start Your Financing Application
              </Link>
              <Link
                to="/trade-in"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-ink"
              >
                Value Your Trade First
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-ink"
              >
                Ask a Finance Question
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
