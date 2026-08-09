import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Phone } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import {
  GuideBody,
  GuideCallout,
  GuideCta,
  GuideFaqs,
  GuideHero,
  GuideList,
  GuideSection,
  guideCtaPrimary,
  guideCtaSecondary,
  guideInlineLink,
} from "@/components/site/GuideLayout";
import { articleSchema, faqSchema } from "@/lib/articleSchema";
import { breadcrumbSchema, crumbs, SITE_ORIGIN } from "@/lib/breadcrumbs";
import { dealerInfo, DELIVERY_CLAIM } from "@/lib/vehicles";

const BREADCRUMBS = crumbs({ label: "Guides", href: "/guides" }, { label: "Used Ford Checklist" });

const PUBLISHED = "2026-08-07";
const PATH = "/guides/what-to-check-before-buying-a-used-ford";
/** One canonical drives the <link rel="canonical"> and og:url. Without og:url, social
 *  crawlers fall back to the root default, which resolves to the home page. */
const CANONICAL = `${SITE_ORIGIN}${PATH}`;
const TITLE = "What to Check Before Buying a Used Ford | AM Ford";
const DESCRIPTION =
  "A used Ford checklist in order: title and documents, recalls by VIN, service records, the walkaround, the lift, the test drive, and what certified changes.";

const FAQS = [
  {
    q: "Should I buy a used Ford with no service records?",
    a: "You can, but price the risk in and inspect harder. Missing records are common on older vehicles that changed hands a few times and are not proof of neglect. They do mean you are buying on condition alone, so an independent inspection stops being optional. If the vehicle was dealer serviced, a Ford dealer can often look up work performed under that VIN, so ask before you assume the history is gone.",
  },
  {
    q: "How do I check a used Ford for open recalls?",
    a: "Run the VIN through the recall lookup at the National Highway Traffic Safety Administration site, then ask a Ford dealer to check the manufacturer system too, since dealers also see customer satisfaction programs that are not classified as safety recalls. Safety recall repairs are performed at no charge by a franchised Ford dealer, ours included, once parts are available, so an open recall is a scheduling item rather than a reason to walk away.",
  },
  {
    q: "Do I still need an inspection on a certified pre-owned vehicle?",
    a: "A certified vehicle has already been through a manufacturer-specified inspection and reconditioning process, which is most of the value of the program. Ask to see the completed inspection sheet for that vehicle and the coverage terms in writing. Wanting an independent opinion as well is reasonable, and a dealership confident in its reconditioning will not object.",
  },
  {
    q: "Which title problems should stop a purchase?",
    a: "A branded title, such as salvage, rebuilt, or flood, changes what the vehicle is worth, what it costs to insure, and how easily you will sell it later, so treat any brand as a reason to slow down and ask questions. A title that is not in the seller's name, a VIN that does not match, or an unresolved lien should stop the transaction until it is sorted out in writing.",
  },
];

export const Route = createFileRoute("/guides/what-to-check-before-buying-a-used-ford")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content: [
          "what to check before buying a used Ford",
          "used car inspection checklist",
          "used Ford recall check VIN",
          "certified pre-owned Ford explained",
          "pre-purchase inspection used car",
          "used Ford dealer Jefferson Ohio",
        ].join(", "),
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: CANONICAL },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          articleSchema({
            headline: "What should you check before buying a used Ford?",
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
  component: UsedFordChecklistGuide,
});

function UsedFordChecklistGuide() {
  return (
    <SiteShell>
      <Breadcrumbs items={BREADCRUMBS} />

      <GuideHero
        tag="Buying Guide"
        title="What should you check before buying a used Ford?"
        published="August 7, 2026"
      >
        <p>
          Check the documents before you check the vehicle: title status, a VIN that matches
          everywhere it appears, open recalls looked up by that VIN, and a service record set you
          can read. Then do the physical work in order, a walkaround, time under the vehicle on a
          lift, and a long test drive that starts from cold. If the vehicle is not certified
          pre-owned, pay for an independent pre-purchase inspection, because it is the cheapest
          money you will spend in the whole process.
        </p>
      </GuideHero>

      <GuideBody>
        <GuideSection heading="Start with the paperwork, not the paint">
          <p>
            Paint is what people look at first and it is the least informative thing on the vehicle.
            The documents decide whether the sale can proceed cleanly, and they take ten minutes.
          </p>
          <GuideList>
            <li>
              <strong className="text-ink">Title status.</strong> Confirm whether the title is clean
              or branded. Brands such as salvage, rebuilt, or flood follow the vehicle and affect
              value, insurance, and resale, and branding rules vary by state, so a vehicle that
              crossed state lines deserves a closer look.
            </li>
            <li>
              <strong className="text-ink">Name on the title.</strong> The seller should be the
              titled owner or a licensed dealer. If there is a lien, the payoff process needs to be
              clear before money changes hands.
            </li>
            <li>
              <strong className="text-ink">VIN match.</strong> Compare the VIN on the dash, the
              driver door jamb label, and the paperwork. They should agree exactly.
            </li>
            <li>
              <strong className="text-ink">Odometer disclosure.</strong> The reading should match
              the service records and the wear on the pedals, seat, and steering wheel.
            </li>
            <li>
              <strong className="text-ink">Remaining factory coverage.</strong> Ask for the original
              in-service date and have a Ford dealer confirm what coverage still applies to that VIN
              and what transfers to you, rather than trusting a listing's summary.
            </li>
          </GuideList>
        </GuideSection>

        <GuideSection heading="Check recalls by VIN, not by model">
          <p>
            Recalls apply to build ranges, not to whole model years, so the only answer that means
            anything is the one attached to that VIN. Run it through the recall lookup at the
            National Highway Traffic Safety Administration site, and ask a Ford dealer to check the
            manufacturer system too, because dealers also see field service actions and customer
            satisfaction programs that never appear in the public lookup.
          </p>
          <p>
            An open recall is not a reason to walk away. Safety recall repairs are performed at no
            charge by a franchised Ford dealer, so it becomes a scheduling question. What you want
            to avoid is buying from an owner who ignored a campaign for years and assuming the rest
            was maintained more carefully.
          </p>
        </GuideSection>

        <GuideSection heading="Read the service records the way a technician would">
          <p>
            Ask for everything the seller has and look for a pattern rather than a pile. An orderly
            set of records from one or two shops tells you more than a thick folder with a
            three-year gap in the middle.
          </p>
          <GuideList>
            <li>
              Oil changes with dates and mileage, at intervals that make sense for how it drove.
            </li>
            <li>
              Transmission, transfer case, and differential service, skipped more often than oil
              changes and important on anything that towed.
            </li>
            <li>Coolant and brake fluid service, both time-based as well as mileage-based.</li>
            <li>Spark plugs, especially on a turbocharged engine, where they work harder.</li>
            <li>Tires and alignments, which show whether wear problems were chased or ignored.</li>
            <li>
              Any warranty repairs, recall work, or accident repairs, including who performed the
              bodywork.
            </li>
          </GuideList>
          <p>
            If the engine is a turbocharged EcoBoost, the oil records carry extra weight, and our{" "}
            <Link to="/guides/is-ford-ecoboost-reliable" className={guideInlineLink}>
              guide to EcoBoost engine reliability
            </Link>{" "}
            explains what those engines specifically ask of an owner.
          </p>
        </GuideSection>

        <GuideSection heading="The walkaround">
          <p>
            Do this in daylight, on a dry day, with the vehicle clean and cool. Wet paint hides a
            great deal.
          </p>
          <GuideCallout heading="Body, glass, and tires">
            <p>
              <strong className="text-ink">Panel fit and paint.</strong> Look down the side of the
              vehicle for reflections that break at a panel edge, and check for overspray on trim
              and texture differences between panels. Both suggest repair work.
            </p>
            <p>
              <strong className="text-ink">Rust.</strong> Rockers, wheel arches, cab corners on
              trucks, tailgate seams, and the metal hidden under door seals. Note that a magnet is a
              poor test on newer F-150s, which use aluminum body panels from the 2015 model year on.
            </p>
            <p>
              <strong className="text-ink">Tires.</strong> Check that all four match, read the tread
              depth and the date codes on the sidewall. Uneven wear points at alignment or
              suspension issues, and four aging tires are a real cost.
            </p>
            <p>
              <strong className="text-ink">Glass and lights.</strong> Mismatched glass brands
              usually mean a replacement, which raises the question of whether the cameras behind
              the windshield were recalibrated afterward. Look for moisture inside light housings.
            </p>
          </GuideCallout>
        </GuideSection>

        <GuideSection heading="Under the hood and under the vehicle">
          <p>
            Open the hood before the engine is warm. Check the oil on the dipstick and under the
            filler cap, the coolant level and color in the expansion tank, the battery terminals and
            date, and look for leaks, cracked or glazed belts, and any area that has been cleaned
            when it should not be clean.
          </p>
          <p>
            Then get it on a lift, which is the step most private buyers skip and the one that finds
            the expensive problems. Look at the frame or subframe, the brake and fuel lines along
            their whole run, exhaust condition, CV boots, ball joints and bushings, shock seepage,
            and any differential or transmission weeping. Be skeptical of thick fresh undercoating,
            which hides corrosion as well as it prevents it.
          </p>
        </GuideSection>

        <GuideSection heading="The test drive is a test, not a lap around the block">
          <p>
            Insist on starting the vehicle from genuinely cold. A seller who warms it up before you
            arrive may just be being polite, but a cold start is where noises, smoke, and rough
            running show themselves.
          </p>
          <p>
            Drive it for at least twenty minutes over a mix of surfaces and speeds. Get to highway
            speed, feel for vibration and steering pull, and brake firmly where it is safe to do so.
            Find a rough road and listen for suspension noise with the radio off. Let the
            transmission work through its full range and note any harshness, hunting, or shudder.
            Engage four-wheel drive or all-wheel drive if it has it, run the heat and the air
            conditioning to their extremes, then work through every switch, screen, and camera. A
            dead module is much easier to discuss before the sale.
          </p>
        </GuideSection>

        <GuideSection heading="Certified pre-owned versus a regular used vehicle">
          <p>
            Certified pre-owned is a manufacturer-backed program rather than a dealer's opinion of
            its own stock. In general terms, a vehicle has to fall within program limits on age and
            mileage, pass a manufacturer-specified inspection, and be reconditioned to that
            standard, after which it carries limited warranty coverage defined by the program.
          </p>
          <p>
            We are deliberately not publishing an inspection point count or a coverage length here,
            because those are set by the program in force at the time. Ask for two documents on any
            certified vehicle: the completed inspection sheet for that VIN, and the coverage terms
            in writing. If a seller cannot produce both, the word certified is doing no work.
          </p>
          <p>
            On a non-certified vehicle, budget for an independent pre-purchase inspection. A good
            one includes time on a lift, a scan for stored and pending codes, a road test, and a
            written list of what needs attention now versus later. That list also helps in the
            negotiation, because it turns a vague worry into a specific figure.
          </p>
        </GuideSection>

        <GuideSection heading="If you are buying from a distance">
          <p>
            Buying outside your area is normal now, and it works as long as you replace what you
            cannot do in person. Ask for the VIN first, then for extra photos of the areas listed
            above and a walkaround video that includes the cold start. Arrange an inspection by a
            shop near the seller, and get what you were told in writing.
          </p>
          <p>
            We deal with this from the other side every week. {DELIVERY_CLAIM} If you want to see
            how remote purchasing works before you start,{" "}
            <Link to="/nationwide-vehicle-delivery" className={guideInlineLink}>
              our page on home delivery and nationwide shipping
            </Link>{" "}
            walks through the steps in order.
          </p>
        </GuideSection>

        <GuideSection heading="Then match the vehicle to the job">
          <p>
            Condition is half the decision. The other half is whether the vehicle suits what you
            need, which is easier to judge before you fall for a listing. For trucks, the{" "}
            <Link to="/ford/$model" params={{ model: "f-150" }} className={guideInlineLink}>
              Ford F-150 model page
            </Link>{" "}
            covers how cab, bed, and drivetrain choices change what the truck can do, and our{" "}
            <Link to="/guides/is-a-used-ford-f-150-reliable" className={guideInlineLink}>
              used F-150 reliability guide
            </Link>{" "}
            adds the truck-specific checks. For a family vehicle, the{" "}
            <Link to="/ford/$model" params={{ model: "explorer" }} className={guideInlineLink}>
              Ford Explorer model page
            </Link>{" "}
            and the{" "}
            <Link to="/ford/$model" params={{ model: "escape" }} className={guideInlineLink}>
              Ford Escape model page
            </Link>{" "}
            are the two most people compare, and our{" "}
            <Link to="/compare/explorer-vs-escape" className={guideInlineLink}>
              side-by-side comparison of the Ford Explorer and Ford Escape
            </Link>{" "}
            sets the two we have in stock against each other. If the household question is really
            about seats and car seats rather than condition, start with our{" "}
            <Link to="/guides/best-ford-suv-for-families" className={guideInlineLink}>
              guide to choosing a family Ford SUV
            </Link>
            .
          </p>
          <p>
            Buying a truck instead, and weighing whether to go electric? Our{" "}
            <Link to="/compare/f-150-vs-f-150-lightning" className={guideInlineLink}>
              comparison of the gas Ford F-150 and the electric F-150 Lightning
            </Link>{" "}
            works through home charging, towing, and winter range before you commit either way.
          </p>
        </GuideSection>
      </GuideBody>

      <GuideFaqs faqs={FAQS} heading="Used Ford buying questions" />

      <GuideCta
        heading="Want us to look at it with you?"
        body={
          <>
            <p>
              Bring us a listing and a VIN and we will tell you what we would check and what the
              recall status is. If you would rather shop vehicles that have already been through our
              shop, start with our inventory. Financing terms depend on credit, term length, and the
              lender, so start that conversation early.
            </p>
          </>
        }
      >
        <Link to="/inventory" className={guideCtaPrimary}>
          Browse current Ford inventory <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <Link to="/financing" className={guideCtaSecondary}>
          See how financing works at AM Ford
        </Link>
        <Link to="/service" className={guideCtaSecondary}>
          Ask our service team about an inspection
        </Link>
        <a href={dealerInfo.phoneHref} className={guideCtaSecondary}>
          <Phone className="h-4 w-4" aria-hidden /> Call {dealerInfo.phone}
        </a>
      </GuideCta>
    </SiteShell>
  );
}
