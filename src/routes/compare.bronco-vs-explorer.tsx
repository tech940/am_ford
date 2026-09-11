import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, HelpCircle, Mountain, Phone, Users } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionTag } from "@/components/site/Home";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CompareFeatureLists, CompareSpecTable } from "@/components/site/CompareSpecTable";
import { breadcrumbSchema, crumbs } from "@/lib/breadcrumbs";
import { articleSchema, faqSchema } from "@/lib/articleSchema";
import { dealerInfo, DELIVERY_CLAIM, getVehicle, type Vehicle } from "@/lib/vehicles";

const PATH = "/compare/bronco-vs-explorer";
const CANONICAL = `https://amford.com${PATH}`;
const PUBLISHED = "2026-08-07";

const TITLE = "Ford Bronco vs Ford Explorer: Which SUV to Buy | AM Ford";
const DESCRIPTION =
  "Ford Bronco vs Ford Explorer at AM Ford in Jefferson, OH: removable roof and trail capability against a third row, compared spec by spec.";

const BREADCRUMBS = crumbs({ label: "Compare", href: "/compare" }, { label: "Bronco vs Explorer" });

const FAQS = [
  {
    q: "What is the real difference between a Bronco and an Explorer?",
    a: "The Bronco is a body-on-frame off-road SUV with removable roof panels and doors, built for trails, field access, and deep snow. The Explorer is a mid-size three-row family SUV on a rear-drive-based platform, built for passengers and highway miles. They share a category name and almost nothing else.",
  },
  {
    q: "Can a Bronco work as an everyday family vehicle?",
    a: "The four-door version can, and that is where most families who want one end up. It keeps the removable roof panels and doors while giving real rear seat access and usable cargo room. What it will not do is seat a third row, and it asks for tolerance: a firmer ride and more wind noise.",
  },
  {
    q: "Is four-wheel drive better than all-wheel drive for an Ohio winter?",
    a: "For most drivers here, no, and tires matter more than either. All-wheel drive works continuously and decides where power goes, which suits plowed roads and daily driving. Four-wheel drive with low range and a lockable differential is built for deep snow and mud. Neither system helps you stop.",
  },
  {
    q: "How much work is taking the Bronco's roof and doors off?",
    a: "The roof panels come off by hand in a few minutes once you have done it once. The doors take tools, and the bigger issue is storage: doors need somewhere padded to sit and hardtop panels take up real garage space. Work out where the parts will live first.",
  },
  {
    q: "Which one should I choose if I want to tow?",
    a: "The Explorer in stock lists factory tow equipment among its features, which puts a trailer squarely on the table. Towing capacity is set by a vehicle's engine, axle, and factory equipment rather than by the model name, so tell us the loaded weight of what you pull and we will check it.",
  },
];

export const Route = createFileRoute("/compare/bronco-vs-explorer")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content: [
          "Ford Bronco vs Ford Explorer",
          "Bronco or Explorer",
          "off-road SUV vs family SUV",
          "Ford Bronco Ashtabula County",
          "Ford Explorer Ashtabula County",
          "three row SUV Ashtabula County",
          "Ford SUV dealer Ashtabula County",
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
            headline: "Ford Bronco vs Ford Explorer",
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
  component: BroncoVsExplorerPage,
});

const BRONCO_REASONS = [
  {
    title: "You want the roof and doors off in summer",
    body: "No unibody crossover offers this. Open-air season here is short, so most owners run it open from late May into September and buttoned up the rest of the year.",
  },
  {
    title: "You leave pavement on purpose",
    body: "Trail Control, selectable terrain modes, and a lockable differential are listed equipment on the Bronco in stock. That is a different toolkit from all-wheel drive.",
  },
  {
    title: "You hunt, camp, or own land",
    body: "State park ground at Pymatuning and Geneva, trails across the county's southern townships, and access roads that turn to mud every spring are why that capability gets used here.",
  },
  {
    title: "You want a vehicle you can keep changing",
    body: "A large accessory ecosystem means a Bronco can be adapted years after you buy it. Racks, bumpers, lighting, and tire choices are all straightforward.",
  },
];

const EXPLORER_REASONS = [
  {
    title: "You need a third row",
    body: "This is the cleanest reason to pick the Explorer. The Bronco has two rows, and if you carry more than five people even a few times a month, the comparison ends here.",
  },
  {
    title: "Most of your miles are highway miles",
    body: "Interstate 90 west toward Mentor and Cleveland or east toward Erie is where a lower, quieter, unibody vehicle is simply more pleasant to sit in.",
  },
  {
    title: "You want factory tow equipment",
    body: "The Explorer in stock lists a tow package among its features. Bring us your loaded trailer weight and we will check it against that vehicle's own build documentation.",
  },
  {
    title: "You want the more powerful of the two",
    body: "The Explorer here is the ST, the performance version of the model. If you want the third row without the performance tuning, tell us and we will watch for a lower trim.",
  },
];

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

/**
 * The spec table further down this page is built from these same two records, so the
 * intro sentence is derived from them too. A hand-written "they cost roughly the same"
 * contradicted the table on the same screen, and would go stale again the next time a
 * listing changed.
 */
function priceGapSentence(a: Vehicle, b: Vehicle): string {
  const dearer = a.price >= b.price ? a : b;
  const cheaper = dearer === a ? b : a;
  const listings = `${a.trim} ${a.model} at ${usd(a.price)} and the ${b.trim} ${b.model} at ${usd(b.price)}`;
  return dearer.price === cheaper.price
    ? `The two on our lot are listed at the same price: the ${listings}.`
    : `They are not priced the same: the ${listings}, which puts the ${dearer.model} ${usd(dearer.price - cheaper.price)} above the ${cheaper.model}.`;
}

function BroncoVsExplorerPage() {
  const bronco = getVehicle("bronco-outer-banks-2025");
  const explorer = getVehicle("explorer-st-2025");

  return (
    <SiteShell>
      <Breadcrumbs items={BREADCRUMBS} />

      <section className="relative overflow-hidden border-b border-slate-200 py-14 sm:py-20">
        <div className="absolute inset-0 bg-gradient-soft" />
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionTag>Model Comparison</SectionTag>
          <h1 className="display mt-3 max-w-4xl text-balance text-3xl text-ink sm:text-5xl lg:text-6xl">
            Ford Bronco vs Ford Explorer
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            These two get shopped against each other constantly, mostly because both say SUV on the
            window sticker. {bronco && explorer ? `${priceGapSentence(bronco, explorer)} ` : null}
            Underneath they are barely related. The Bronco is a body-on-frame off-road vehicle with
            a roof and doors you can take off; the Explorer is a mid-size three-row family SUV built
            for passengers and highway miles. Both are on the lot in {dealerInfo.locality}.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/inventory"
              className="inline-flex items-center gap-2 rounded-full bg-[#002c5f] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#001f44]"
            >
              See both SUVs in our inventory <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a
              href={dealerInfo.phoneHref}
              className="inline-flex items-center gap-2 rounded-full border border-[#002c5f]/25 bg-white px-6 py-3.5 text-sm font-bold text-[#002c5f] transition hover:bg-slate-50"
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
            Two rows against three rows, and trail capability against highway comfort. If you need
            to seat six, or your vehicle spends most of its life on Interstate 90, the Explorer is
            the answer. If the appeal is open-air driving, gravel and mud, deep snow on a township
            road, or a vehicle you can keep modifying, the Bronco does things the Explorer cannot do
            at any trim level.
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2/60 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <SectionTag>Side by Side</SectionTag>
          <h2 className="display mt-3 text-2xl sm:text-3xl">Specifications compared</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Trim changes a lot on both, so the table compares the two vehicles we have rather than
            the model ranges. Confirm availability before you visit.
          </p>

          {bronco && explorer && (
            <>
              <CompareSpecTable
                a={bronco}
                b={explorer}
                caption="Specification comparison of the Ford Bronco and Ford Explorer currently in stock at AM Ford"
              />
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Fuel economy figures are the listed city and highway numbers and vary with how you
                drive. Note the drivetrain row: these are two different systems, not two names for
                the same thing. Listed prices apply to these units and can change. Financing terms
                depend on credit, term, and lender; see our{" "}
                <Link to="/financing" className="font-semibold text-primary hover:underline">
                  vehicle financing page
                </Link>
                .
              </p>

              <h2 className="display mt-14 text-2xl sm:text-3xl">
                Equipment on the two vehicles in stock
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                The equipment lists tell the story better than the numbers do: one vehicle is
                specified around traction and open air, the other around passengers and towing.
              </p>
              <CompareFeatureLists a={bronco} b={explorer} />
            </>
          )}
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Mountain className="h-6 w-6" aria-hidden />
          </div>
          <h2 className="display mt-5 text-2xl sm:text-3xl">Choose the Ford Bronco if</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {BRONCO_REASONS.map((r) => (
              <div key={r.title} className="rounded-3xl bg-card p-7 ring-1 ring-border">
                <h3 className="text-base font-bold text-ink">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm leading-relaxed text-muted-foreground sm:text-base">
            What you give up is comfort and capacity, and you should expect it rather than be
            annoyed by it. A separate frame and a tall square shape mean a firmer ride and more wind
            noise. The payoff is a vehicle that turns into a genuinely capable snow truck once the
            panels are back on. Our{" "}
            <Link
              to="/ford/$model"
              params={{ model: "bronco" }}
              className="font-semibold text-primary hover:underline"
            >
              Ford Bronco model page
            </Link>{" "}
            covers the two-door and four-door decision and how tire choice pulls in two directions.
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2/60 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Users className="h-6 w-6" aria-hidden />
          </div>
          <h2 className="display mt-5 text-2xl sm:text-3xl">Choose the Ford Explorer if</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {EXPLORER_REASONS.map((r) => (
              <div key={r.title} className="rounded-3xl bg-card p-7 ring-1 ring-border">
                <h3 className="text-base font-bold text-ink">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm leading-relaxed text-muted-foreground sm:text-base">
            What you give up is the open-air experience and serious off-pavement capability. An
            Explorer with all-wheel drive and proper tires handles a snow-covered county road well,
            but it is not built for a rutted trail. For most families here that is a trade worth
            making. The{" "}
            <Link
              to="/ford/$model"
              params={{ model: "explorer" }}
              className="font-semibold text-primary hover:underline"
            >
              Ford Explorer model page
            </Link>{" "}
            has more on how usable the third row really is and what the ST trim changes.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="display text-2xl sm:text-3xl">
            Four-wheel drive, all-wheel drive, and a lake-effect winter
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            The spec table shows four-wheel drive on the Bronco and all-wheel drive on the Explorer,
            and the difference matters more than the similar-sounding names suggest. All-wheel drive
            works continuously and decides for itself where power goes, which is what you want on a
            plowed road on a Tuesday morning. Four-wheel drive with selectable modes and a lockable
            differential gives you direct control where traction is genuinely poor.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Neither system helps you stop. That is where people get caught out: drivetrain gets you
            moving, tires get you slowed down. Where the state routes are cleared before the
            township roads, a set of winter tires changes either vehicle more than the badge on the
            tailgate.
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2/60 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <SectionTag>The Verdict</SectionTag>
          <h2 className="display mt-3 text-2xl sm:text-3xl">Which one should you actually buy</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Declaring a winner here would be dishonest, because the two solve different problems and
            only one of those is probably yours. Start with seats. If you need more than five, the
            Explorer wins by default. If five is enough, ask the second question: in the last year,
            how many days did you actually leave pavement or wish the roof came off? If the answer
            is a real number rather than a daydream, the Bronco earns its keep.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            The buyers who regret their choice bought the Bronco for a life they aspire to rather
            than one they live, or bought the Explorer and spent three winters wishing they had the
            capability. Both mistakes are avoidable in an afternoon. Drive them back to back out of{" "}
            {dealerInfo.locality}, and put your passengers in the Explorer's third row rather than
            looking at it. If you would rather not make the drive, we can bring the vehicle to you.{" "}
            {DELIVERY_CLAIM}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            If the decision is really about carrying a family rather than about capability, our{" "}
            <Link
              to="/guides/best-ford-suv-for-families"
              className="font-semibold text-primary hover:underline"
            >
              guide to choosing a family Ford SUV
            </Link>{" "}
            covers car seats and third-row access across all three, and our{" "}
            <Link
              to="/compare/explorer-vs-escape"
              className="font-semibold text-primary hover:underline"
            >
              comparison of the Ford Explorer and Ford Escape
            </Link>{" "}
            is the one to read if a smaller crossover is the alternative rather than a trail
            vehicle.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <SectionTag>Common Questions</SectionTag>
          <h2 className="display mt-3 text-2xl sm:text-3xl">
            Bronco and Explorer, answered plainly
          </h2>
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
              Tell us how many seats you need and how often you leave pavement, and we will point
              you at the right one of these two.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/ford/$model"
                params={{ model: "bronco" }}
                className="inline-flex items-center gap-2 rounded-full bg-[#002c5f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#001f44]"
              >
                Read the Ford Bronco buying guide <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                to="/ford/$model"
                params={{ model: "explorer" }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-ink"
              >
                Read the Ford Explorer buying guide
              </Link>
              <Link
                to="/inventory"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-ink"
              >
                Browse every Ford SUV in stock
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
