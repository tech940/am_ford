import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, HelpCircle, Phone, Plug, Truck } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionTag } from "@/components/site/SectionTag";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CompareFeatureLists, CompareSpecTable } from "@/components/site/CompareSpecTable";
import { breadcrumbSchema, crumbs } from "@/lib/breadcrumbs";
import { articleSchema, faqSchema } from "@/lib/articleSchema";
import { dealerInfo, DELIVERY_CLAIM, getVehicle } from "@/lib/vehicles";

const PATH = "/compare/f-150-vs-f-150-lightning";
const CANONICAL = `https://amford.com${PATH}`;
const PUBLISHED = "2026-08-07";

const TITLE = "Ford F-150 vs F-150 Lightning: Gas or Electric | AM Ford";
const DESCRIPTION =
  "Gas Ford F-150 vs the electric F-150 Lightning at AM Ford in Jefferson, OH: specs side by side, home charging, towing, and how to choose.";

const BREADCRUMBS = crumbs(
  { label: "Compare", href: "/compare" },
  { label: "F-150 vs F-150 Lightning" },
);

const FAQS = [
  {
    q: "Is the F-150 Lightning really the same truck as an F-150?",
    a: "It is the same full-size pickup shape with the same bed, built around a battery pack and electric motors instead of an engine. The cab and the way you use the truck carry over. What changes is where the power comes from, how you refuel, and the large lockable front trunk where an engine used to sit.",
  },
  {
    q: "What do I need in place at home to charge a Lightning?",
    a: "A 240 volt circuit and a Level 2 charger is the setup that makes an electric truck practical. Installing one is an electrician's job, and the cost depends on your panel capacity and the distance to where you park. A standard household outlet adds charge slowly enough to suit only low daily mileage.",
  },
  {
    q: "How much range will I lose in an Ohio winter?",
    a: "Less than the listed figure, and that is true of every electric vehicle. Cold reduces battery performance and cabin heat draws real energy, so plan around your coldest month rather than a mild spring day. Preconditioning the cabin while the truck is still plugged in helps more than most other habits.",
  },
  {
    q: "Can the Lightning tow?",
    a: "Yes, and electric motors deliver torque immediately, which is noticeable pulling away with a load. The catch is range: towing reduces it substantially on any electric vehicle. What either truck is rated to pull comes from its own build documentation, so bring us your loaded trailer weight and we will check it.",
  },
  {
    q: "Which truck costs less to own over time?",
    a: "It depends almost entirely on where you refuel. Home charging at overnight rates is usually cheaper per mile than gasoline, and the Lightning has fewer routine maintenance items: no oil changes, no exhaust, and less brake wear. It also carries the higher listed price, and financing terms depend on credit, term, and lender.",
  },
];

export const Route = createFileRoute("/compare/f-150-vs-f-150-lightning")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content: [
          "Ford F-150 vs F-150 Lightning",
          "electric truck vs gas truck",
          "F-150 Lightning Ohio",
          "electric pickup Ashtabula County",
          "Ford F-150 Jefferson Ohio",
          "should I buy an electric truck",
          "Ford truck dealer Northeast Ohio",
        ].join(", "),
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          articleSchema({
            headline: "Ford F-150 vs Ford F-150 Lightning",
            description: DESCRIPTION,
            path: PATH,
            datePublished: PUBLISHED,
          }),
        ),
      },
      { type: "application/ld+json", children: JSON.stringify(faqSchema(FAQS)) },
      { type: "application/ld+json", children: JSON.stringify(breadcrumbSchema(BREADCRUMBS)) },
    ],
  }),
  component: F150VsLightningPage,
});

const GAS_REASONS = [
  {
    title: "You tow long distances more than occasionally",
    body: "Towing cuts the range of any electric vehicle sharply, which turns a long haul into a charging plan. If you pull a trailer across states, the gas truck stays the better tool.",
  },
  {
    title: "You cannot charge where you park",
    body: "Street parking, a shared lot, or a panel that cannot take another circuit all point the same way. Public fast charging is thinner here than around Cleveland.",
  },
  {
    title: "Your mileage is long and unpredictable",
    body: "If some days are forty miles and others are four hundred with no warning, refueling in five minutes anywhere is worth more than the battery offers.",
  },
  {
    title: "You want the lower purchase price of the two",
    body: "The gas F-150 in stock is listed below the Lightning. What that difference means monthly depends on credit, term, and lender rather than the sticker alone.",
  },
];

const EV_REASONS = [
  {
    title: "You can charge overnight where you park",
    body: "This is the single question that decides it. Most driveways in Ashtabula County have room for a Level 2 charger, and most households park overnight.",
  },
  {
    title: "Your daily driving is local and predictable",
    body: "A regular run between Jefferson, Ashtabula, Geneva, and Conneaut sits well inside a full charge, and you start every morning full instead of planning a fuel stop.",
  },
  {
    title: "Onboard power is worth something to you",
    body: "The Lightning in stock lists Pro Power Onboard at 9.6kW. That runs tools on a job site, and rural townships here lose power in storms often enough for it to matter.",
  },
  {
    title: "You want less routine maintenance",
    body: "No oil changes, no exhaust system, and less brake wear thanks to regenerative braking. The front trunk is the other thing owners notice quickly.",
  },
];

function F150VsLightningPage() {
  const gas = getVehicle("f150-platinum-2025");
  const ev = getVehicle("f150-lightning-2025");

  return (
    <SiteShell>
      <Breadcrumbs items={BREADCRUMBS} />

      <section className="relative overflow-hidden border-b border-slate-200 py-14 sm:py-20">
        <div className="absolute inset-0 bg-gradient-soft" />
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionTag>Model Comparison</SectionTag>
          <h1 className="display mt-3 max-w-4xl text-balance text-3xl text-ink sm:text-5xl lg:text-6xl">
            Ford F-150 vs Ford F-150 Lightning
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Same truck, same bed, two completely different ways of filling it up. The F-150 is
            Ford's gas-powered full-size pickup; the Lightning is the battery-electric version of
            it. Most of what people expect to matter, cab space, bed, and four-wheel drive, turns
            out to be shared. The decision comes down to one practical question about your house and
            one honest question about your week.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/inventory"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-brand-deep"
            >
              See both trucks in our inventory <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a
              href={dealerInfo.phoneHref}
              className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-white px-6 py-3.5 text-sm font-bold text-brand transition hover:bg-slate-50"
            >
              <Phone className="h-4 w-4" aria-hidden /> Call {dealerInfo.phone}
            </a>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="display text-2xl sm:text-3xl">The short version</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Answer three questions. Can you charge where you park overnight? Is your daily mileage
            predictable and mostly local? Do you tow long distances more than occasionally? If the
            first two are yes and the third is no, the Lightning fits. If you cannot charge at home,
            or you regularly pull a trailer across states, the gas F-150 remains the better tool and
            we will tell you so rather than sell you the newer thing.
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2/60 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <SectionTag>Side by Side</SectionTag>
          <h2 className="display mt-3 text-2xl sm:text-3xl">Specifications compared</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Configuration changes what a pickup is, so the table compares the two trucks we actually
            have rather than the model ranges. Inventory moves, so confirm availability first.
          </p>

          {gas && ev && (
            <>
              <CompareSpecTable
                a={gas}
                b={ev}
                caption="Specification comparison of the gas Ford F-150 and the electric F-150 Lightning currently in stock at AM Ford"
              />
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                The gas truck's figures are its listed city and highway MPG. The Lightning's is a
                range rating, and range falls in cold weather and when towing. Listed prices apply
                to these units and can change. Financing terms depend on credit, term, and lender;
                see our{" "}
                <Link to="/financing" className="font-semibold text-primary hover:underline">
                  vehicle financing page
                </Link>
                .
              </p>

              <h2 className="display mt-14 text-2xl sm:text-3xl">
                Equipment on the two trucks in stock
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Both trucks list hands-free driving assistance and onboard power export, which shows
                how much these two share. The Lightning adds the front trunk and a larger power
                export figure.
              </p>
              <CompareFeatureLists a={gas} b={ev} />
            </>
          )}
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Truck className="h-6 w-6" aria-hidden />
          </div>
          <h2 className="display mt-5 text-2xl sm:text-3xl">Choose the gas F-150 if</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {GAS_REASONS.map((r) => (
              <div key={r.title} className="rounded-3xl bg-card p-7 ring-1 ring-border">
                <h3 className="text-base font-bold text-ink">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm leading-relaxed text-muted-foreground sm:text-base">
            None of that is a knock on electric trucks. It describes a working life a lot of people
            in this county live: township roads on weekdays, a loaded trailer on Interstate 90 at
            the weekend, and no way to know on Monday how far Thursday will take you. Our{" "}
            <Link
              to="/ford/$model"
              params={{ model: "f-150" }}
              className="font-semibold text-primary hover:underline"
            >
              Ford F-150 model page
            </Link>{" "}
            covers cab and bed choices and what to inspect underneath a truck in a salt-belt state.
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2/60 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Plug className="h-6 w-6" aria-hidden />
          </div>
          <h2 className="display mt-5 text-2xl sm:text-3xl">Choose the F-150 Lightning if</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {EV_REASONS.map((r) => (
              <div key={r.title} className="rounded-3xl bg-card p-7 ring-1 ring-border">
                <h3 className="text-base font-bold text-ink">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm leading-relaxed text-muted-foreground sm:text-base">
            The Lightning suits a specific household rather than an average one. Where it fits, it
            fits very well: you stop visiting fuel stations for local driving, and the truck is
            quiet enough to change how a long day feels. Where it does not fit, enthusiasm does not
            make up the difference. The{" "}
            <Link
              to="/ford/$model"
              params={{ model: "f-150-lightning" }}
              className="font-semibold text-primary hover:underline"
            >
              Ford F-150 Lightning model page
            </Link>{" "}
            goes deeper into home charging and what winter does to usable range here.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="display text-2xl sm:text-3xl">Charging is the whole decision</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Two local realities settle this, and neither appears on a spec sheet. The first is
            charging. Public fast charging is thinner in Ashtabula County than around Cleveland, so
            home charging is not a convenience with an electric truck, it is the plan. Work out
            where the charger goes and what your panel can take before you commit, not after.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            The second is winter. Cold reduces the usable range of every electric vehicle, so the
            number that matters is what you need on the coldest week of the year with the heat
            running. The flip side is worth weighing too: townships here lose power in storms, and a
            truck that can keep a furnace fan and a freezer running is worth something in a rural
            county.
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2/60 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <SectionTag>The Verdict</SectionTag>
          <h2 className="display mt-3 text-2xl sm:text-3xl">Which truck should you actually buy</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            This is not one truck being better than the other; it is one of them matching your
            driveway and your week. If you park overnight at home and drive a predictable local
            route, the Lightning is hard to argue against. If you tow across states or have nowhere
            to plug in, the gas F-150 is not a compromise, it is the right tool.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            If you are on the fence, keep a week of honest notes: your miles each day, where you
            parked overnight, and every time you towed. Bring that to us at {dealerInfo.address} and
            the answer usually falls out of the page. Drive both back to back while you are here. If
            you would rather not make the drive, we can bring the truck to you. {DELIVERY_CLAIM}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            If a used truck is the alternative to either of these, our{" "}
            <Link
              to="/guides/is-a-used-ford-f-150-reliable"
              className="font-semibold text-primary hover:underline"
            >
              guide to used F-150 reliability
            </Link>{" "}
            covers what to inspect and which records to ask for, and our{" "}
            <Link
              to="/guides/is-ford-ecoboost-reliable"
              className="font-semibold text-primary hover:underline"
            >
              guide to EcoBoost engine reliability
            </Link>{" "}
            explains what the turbocharged engines ask of an owner.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <SectionTag>Common Questions</SectionTag>
          <h2 className="display mt-3 text-2xl sm:text-3xl">Gas and electric F-150s, answered</h2>
          <dl className="mt-8 space-y-4">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-2xl bg-card p-6 ring-1 ring-border">
                <dt className="flex items-start gap-3 text-base font-bold text-ink">
                  <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {f.q}
                </dt>
                <dd className="mt-2 pl-7 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 rounded-3xl bg-card p-7 ring-1 ring-border">
            <h2 className="display text-xl sm:text-2xl">Take the next step</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Tell us where you park overnight, what you tow, and how far you drive in a normal
              week.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/ford/$model"
                params={{ model: "f-150" }}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-deep"
              >
                Read the Ford F-150 buying guide <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                to="/ford/$model"
                params={{ model: "f-150-lightning" }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-ink"
              >
                Read the Ford F-150 Lightning buying guide
              </Link>
              <Link
                to="/inventory"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-ink"
              >
                Browse every Ford truck in stock
              </Link>
              <Link
                to="/financing"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-ink"
              >
                Apply for vehicle financing
              </Link>
              <Link
                to="/compare"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-ink"
              >
                See all Ford model comparisons
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
