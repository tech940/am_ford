import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { breadcrumbSchema, crumbs, SITE_ORIGIN } from "@/lib/breadcrumbs";
import { dealerInfo } from "@/lib/vehicles";

/**
 * DRAFT FOR ATTORNEY REVIEW.
 *
 * The clauses that matter commercially are the inventory, pricing, and photography ones.
 * They are written against what the site really does: prices and specifications come from a
 * daily dealer feed and can be stale or wrong, 17 of the vehicles currently carry a generic
 * placeholder photo rather than their own, payment figures on the site are calculator output
 * and not credit offers, and the 360 viewer renders illustrative frames rather than
 * photographs of the specific unit. Every disclaimer below points at a real behaviour of
 * this site; do not add ones that do not.
 */

const PATH = "/terms";
const CANONICAL = `${SITE_ORIGIN}${PATH}`;
const BREADCRUMBS = crumbs({ label: "Terms of Use" });
const UPDATED = "September 25, 2026";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use | AM Ford" },
      {
        name: "description",
        content:
          "The terms that apply to this website, including how to read vehicle pricing, availability, photography, and payment estimates.",
      },
      { property: "og:title", content: "Terms of Use | AM Ford" },
      { property: "og:url", content: CANONICAL },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(breadcrumbSchema(BREADCRUMBS)) },
    ],
  }),
  component: TermsPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="display text-xl text-slate-900 sm:text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
        {children}
      </div>
    </section>
  );
}

const LINK = "font-semibold text-[#002c5f] underline underline-offset-2";

function TermsPage() {
  return (
    <SiteShell>
      <Breadcrumbs items={BREADCRUMBS} />
      <div className="mx-auto max-w-3xl px-6 pb-20 pt-6">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Terms of Use
        </h1>
        <p className="mt-3 text-sm text-slate-500">Last updated {UPDATED}</p>

        <Section title="Using this site">
          <p>
            This website is operated by {dealerInfo.name}, {dealerInfo.address}. By using it you
            accept these terms. If you do not accept them, please do not use the site.
          </p>
        </Section>

        <Section title="Vehicle listings and availability">
          <p>
            Our inventory listings are built from a dealer feed that updates daily. A vehicle
            shown here may already be sold, may be on hold for another customer, or may be in
            transit rather than on the lot. Listing a vehicle is not an offer to sell it, and
            availability is confirmed only when you speak with us.
          </p>
        </Section>

        <Section title="Pricing">
          <p>
            Prices shown are the advertised price of the vehicle. They do not include tax, title,
            registration, documentary or dealer service fees, or optional products you choose to
            add. Manufacturer rebates and incentive programs change, and many require you to
            qualify, so not every advertised figure will be available to every buyer.
          </p>
          <p>
            We take care to publish accurate figures, but errors happen in data feeds and in
            typing. Where a price or specification shown here is wrong, it does not bind us, and
            we will tell you the correct figure before you commit to anything. Please confirm the
            price of a specific vehicle with us before relying on it.
          </p>
        </Section>

        <Section title="Photographs and vehicle images">
          <p>
            Where we have photographs of a specific vehicle, we show them. Some listings do not
            yet have their own photographs and display a generic image instead, which will not
            match the actual vehicle. Where the site shows a rotating view generated to
            illustrate a model rather than photographed on our lot, it is labelled as
            illustrative. Colours can look different between screens. Ask us for current photos
            of a particular vehicle and we will take them.
          </p>
        </Section>

        <Section title="Payment estimates and financing">
          <p>
            Any monthly payment, rate, or affordability figure shown on this site is an estimate
            produced by a calculator using the numbers entered. It is not an offer of credit, not
            a quote, and not a promise of terms. Actual financing depends on lender approval, your
            credit, the final deal structure, and the documents you sign.
          </p>
        </Section>

        <Section title="Trade-in figures">
          <p>
            A trade-in figure produced on this site is an estimate based on what you tell us. The
            amount we can actually apply to your purchase depends on an inspection of the vehicle
            and its title and history.
          </p>
        </Section>

        <Section title="Trademarks">
          <p>
            Ford, the Ford oval, and Ford model names are trademarks of Ford Motor Company. Other
            marks that appear on this site belong to their owners. Our use of them identifies the
            vehicles we sell and service.
          </p>
        </Section>

        <Section title="Links to other sites">
          <p>
            Some pages link to sites we do not run, such as lenders or the manufacturer. We are
            not responsible for their content or their privacy practices.
          </p>
        </Section>

        <Section title="No warranty for the site itself">
          <p>
            We provide this website as it is. We do not promise it will be uninterrupted or error
            free. Nothing in this section limits the written warranties that come with a vehicle
            you buy from us, or any rights you have under consumer protection law.
          </p>
        </Section>

        <Section title="Limitation of liability">
          <p>
            To the extent the law allows, {dealerInfo.name} is not liable for indirect or
            consequential losses arising from your use of this website. Nothing here excludes
            liability that cannot lawfully be excluded.
          </p>
        </Section>

        <Section title="Governing law">
          <p>These terms are governed by the laws of the State of Ohio.</p>
        </Section>

        <Section title="Changes">
          <p>
            We may update these terms. The date at the top shows when they last changed. Continued
            use of the site means you accept the current version.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about these terms: call{" "}
            <a href={dealerInfo.phoneHref} className={LINK}>
              {dealerInfo.phone}
            </a>
            , or read our{" "}
            <Link to="/privacy" className={LINK}>
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link to="/accessibility" className={LINK}>
              Accessibility Statement
            </Link>
            .
          </p>
        </Section>
      </div>
    </SiteShell>
  );
}
