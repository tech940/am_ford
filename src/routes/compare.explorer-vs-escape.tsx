import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, HelpCircle, Phone, Snowflake, Users } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionTag } from "@/components/site/Home";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CompareFeatureLists, CompareSpecTable } from "@/components/site/CompareSpecTable";
import { breadcrumbSchema, crumbs } from "@/lib/breadcrumbs";
import { articleSchema, faqSchema } from "@/lib/articleSchema";
import { dealerInfo, DELIVERY_CLAIM, getVehicle } from "@/lib/vehicles";

const PATH = "/compare/explorer-vs-escape";
const CANONICAL = `https://amford.com${PATH}`;
const PUBLISHED = "2026-08-07";

const TITLE = "Ford Explorer vs Ford Escape: Which SUV Fits? | AM Ford";
const DESCRIPTION =
  "Ford Explorer vs Ford Escape compared at AM Ford in Jefferson, OH: size, drivetrain, hybrid economy, and which Ohio driver each SUV actually suits.";

const BREADCRUMBS = crumbs({ label: "Compare", href: "/compare" }, { label: "Explorer vs Escape" });

const FAQS = [
  {
    q: "Is the Explorer worth buying if I rarely use the third row?",
    a: "It depends how rare is rare. If you seat more than four people a few times a month, the third row earns its place and folds flat the rest of the time. If it would sit folded for eleven months of the year, you are paying to fuel capability you do not use.",
  },
  {
    q: "Does the Escape Hybrid have to be plugged in?",
    a: "No. The standard hybrid charges its own battery from the engine and from braking, so you fuel it like any other vehicle and nothing changes at your house. Ford has also sold a plug-in hybrid Escape, which does plug in, and the two look similar. Confirm which one you are looking at before you compare figures.",
  },
  {
    q: "Which of the two is cheaper to run day to day?",
    a: "The Escape Hybrid, and the gap is widest in town. Its listed city figure is far higher than the Explorer's, because stop-and-go driving is what a hybrid powertrain is built for. On a long run at highway speed the two move closer together. Insurance, tires, and consumables also tend to cost less on the smaller vehicle.",
  },
  {
    q: "Can either of these SUVs tow a small trailer?",
    a: "Towing depends on the specific vehicle rather than the model name. The Explorer in stock lists factory tow equipment among its features, which puts a trailer on the table. What it is rated to pull comes from its own build documentation, so tell us the loaded weight of what you tow and we will check it.",
  },
  {
    q: "Do I need all-wheel drive on an SUV in Ashtabula County?",
    a: "Both vehicles we currently stock are all-wheel drive, so that decision is already made here. It is worth knowing what it does: all-wheel drive helps you get moving on a snow-covered road and does nothing to help you stop. Tires decide braking distance, so budget for them as part of the purchase.",
  },
];

export const Route = createFileRoute("/compare/explorer-vs-escape")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content: [
          "Ford Explorer vs Ford Escape",
          "Explorer or Escape",
          "Ford SUV comparison",
          "three row SUV vs compact SUV",
          "Ford Explorer Ashtabula County",
          "Ford Escape Ashtabula County",
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
            headline: "Ford Explorer vs Ford Escape",
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
  component: ExplorerVsEscapePage,
});

const EXPLORER_REASONS = [
  {
    title: "You need a third row more than a handful of times a year",
    body: "The Explorer's third row is a real one, and it folds flat when you do not need it. A compact crossover cannot be argued into seating six.",
  },
  {
    title: "You carry other people's children",
    body: "Carpools, travel teams, and weekend trips are where a two-row SUV runs out of seats first. That is the clearest case for the larger vehicle.",
  },
  {
    title: "You want factory tow equipment on the table",
    body: "The Explorer in stock lists a tow package among its equipment. Bring us the loaded weight of your trailer and we will check it against that vehicle's own build documentation.",
  },
  {
    title: "Most of your miles are open road",
    body: "Interstate 90 west toward Mentor and Cleveland, or east toward Erie, is where the Explorer's size costs you least and its power is easiest to appreciate.",
  },
];

const ESCAPE_REASONS = [
  {
    title: "Four seats covers your household",
    body: "Two adults and two children fit comfortably, and the cargo area behind the rear seats is more useful than the vehicle's footprint suggests.",
  },
  {
    title: "Most of your driving happens in town",
    body: "The hybrid does its best work in stop-and-go traffic, where a conventional engine wastes the most fuel. The Jefferson to Ashtabula or Geneva commute is exactly that mix.",
  },
  {
    title: "You want electrification without changing your house",
    body: "The standard hybrid charges itself from the engine and from braking. No charger, no electrician, and no new habits at the end of the day.",
  },
  {
    title: "Parking and visibility matter to you",
    body: "It is easy to place in a tight spot and easy to see out of, and it is the least expensive vehicle in our current inventory.",
  },
];

function ExplorerVsEscapePage() {
  const explorer = getVehicle("explorer-st-2025");
  const escape = getVehicle("escape-titanium-2024");

  return (
    <SiteShell>
      <Breadcrumbs items={BREADCRUMBS} />

      <section className="relative overflow-hidden border-b border-slate-200 py-14 sm:py-20">
        <div className="absolute inset-0 bg-gradient-soft" />
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionTag>Model Comparison</SectionTag>
          <h1 className="display mt-3 max-w-4xl text-balance text-3xl text-ink sm:text-5xl lg:text-6xl">
            Ford Explorer vs Ford Escape
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Both are Ford SUVs with all-wheel drive, and both are on the lot in{" "}
            {dealerInfo.locality}. That is roughly where the similarity ends. The Explorer is a
            mid-size three-row vehicle; the Escape is a compact crossover, and the one we stock is a
            hybrid. Choosing comes down to two honest questions: how often you carry more than four
            people, and how much of your driving happens in town.
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
            If your household regularly seats more than four people, or you tow, start with the
            Explorer; the Escape will not stretch to cover it. If you mostly move two to four people
            and care what the vehicle costs to run every week, the Escape Hybrid is easier to live
            with and cheaper to own. What usually needs settling is whether the extra seats are
            worth the extra size and fuel, and the rest of this page works through that.
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2/60 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <SectionTag>Side by Side</SectionTag>
          <h2 className="display mt-3 text-2xl sm:text-3xl">Specifications compared</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Trim and drivetrain change what an SUV is, so the table compares the two units we
            actually have rather than the model ranges. Inventory moves, so confirm availability
            first.
          </p>

          {explorer && escape && (
            <>
              <CompareSpecTable
                a={explorer}
                b={escape}
                caption="Specification comparison of the Ford Explorer and Ford Escape currently in stock at AM Ford"
              />
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Fuel economy figures are the listed city and highway numbers and vary with how you
                drive. Listed prices apply to these units and can change. Financing terms depend on
                credit, term, and lender; see our{" "}
                <Link to="/financing" className="font-semibold text-primary hover:underline">
                  vehicle financing page
                </Link>
                .
              </p>

              <h2 className="display mt-14 text-2xl sm:text-3xl">
                Equipment on the two vehicles in stock
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Equipment separates these two as much as size does. One is a performance-tuned
                three-row SUV; the other is a hybrid built around running costs.
              </p>
              <CompareFeatureLists a={explorer} b={escape} />
            </>
          )}
        </div>
      </section>

      <section className="py-14 sm:py-20">
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
            The honest trade is running cost and footprint. The Explorer ST in stock is the
            performance version of the model, and a longer, wider vehicle to place in a parking
            space. If you want the third row without the performance tuning, say so and we will
            watch for a lower trim. Our{" "}
            <Link
              to="/ford/$model"
              params={{ model: "explorer" }}
              className="font-semibold text-primary hover:underline"
            >
              Ford Explorer model page
            </Link>{" "}
            covers how the model behaves in everyday use.
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2/60 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="display text-2xl sm:text-3xl">Choose the Ford Escape if</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {ESCAPE_REASONS.map((r) => (
              <div key={r.title} className="rounded-3xl bg-card p-7 ring-1 ring-border">
                <h3 className="text-base font-bold text-ink">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm leading-relaxed text-muted-foreground sm:text-base">
            The trade here is capacity and pace. Two rows means two rows on the weekend you need six
            seats. A hybrid also gives back some fuel economy in a cold Ohio winter, because the
            engine runs more often to produce cabin heat. The Escape in stock is certified pre-owned
            with recorded mileage rather than delivery miles. Our{" "}
            <Link
              to="/ford/$model"
              params={{ model: "escape" }}
              className="font-semibold text-primary hover:underline"
            >
              Ford Escape model page
            </Link>{" "}
            goes further into how the hybrid behaves on the commute most people here drive.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Snowflake className="h-6 w-6" aria-hidden />
          </div>
          <h2 className="display mt-5 text-2xl sm:text-3xl">Winter, tires, and all-wheel drive</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Both vehicles in stock are all-wheel drive, so that part of the decision is already made
            here. It is still worth being clear about what it does. All-wheel drive helps you get
            moving on a snow-covered road, and it does nothing to help you stop. On a lake-effect
            morning, when the state routes are clear and the township roads are not, tires decide
            the outcome. Treat them as part of the purchase rather than a problem for December.
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2/60 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <SectionTag>The Verdict</SectionTag>
          <h2 className="display mt-3 text-2xl sm:text-3xl">Which one should you actually buy</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            There is no winner here, because these two answer different questions. Count how many
            times in the last twelve months you needed more than four seats. If that number is more
            than a handful, the Explorer is the vehicle and the fuel bill is the price of the seats.
            If it is close to zero, a three-row SUV is an expensive way to cover a rare exception.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            The genuinely hard case is the household in the middle: two children now, a third row
            that might matter later, and a commute long enough that fuel is a real line in the
            budget. If that is you, sit in both on the same visit with your car seats in hand and
            drive them back to back out of {dealerInfo.locality}. The size difference reads very
            differently in person than it does on a screen. If you would rather not make the drive,
            we can bring the vehicle to you. {DELIVERY_CLAIM}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Still weighing the wider question of which Ford SUV suits a household? Our{" "}
            <Link
              to="/guides/best-ford-suv-for-families"
              className="font-semibold text-primary hover:underline"
            >
              guide to choosing a family Ford SUV
            </Link>{" "}
            brings the Bronco into the same conversation and works through car seats, third-row
            access, and winter traction. If the vehicle you are considering is used, our{" "}
            <Link
              to="/guides/what-to-check-before-buying-a-used-ford"
              className="font-semibold text-primary hover:underline"
            >
              checklist for buying a used Ford
            </Link>{" "}
            covers the documents and the inspection.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <SectionTag>Common Questions</SectionTag>
          <h2 className="display mt-3 text-2xl sm:text-3xl">
            Explorer and Escape, answered plainly
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
              Tell us how many people you carry and how far you drive each week, and we will point
              you at the right one of these two rather than the more expensive one.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/ford/$model"
                params={{ model: "explorer" }}
                className="inline-flex items-center gap-2 rounded-full bg-[#002c5f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#001f44]"
              >
                Read the Ford Explorer buying guide <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                to="/ford/$model"
                params={{ model: "escape" }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-ink"
              >
                Read the Ford Escape buying guide
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
