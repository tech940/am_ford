import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { breadcrumbSchema, crumbs, SITE_ORIGIN } from "@/lib/breadcrumbs";
import { dealerInfo } from "@/lib/vehicles";

/**
 * DRAFT FOR ATTORNEY REVIEW.
 *
 * Deliberately does NOT claim conformance with WCAG. Dealership websites are a frequent ADA
 * web-accessibility target in the US, and a page claiming full compliance is evidence against
 * you the moment a tester finds a failure. This states the standard we work toward, gives a
 * staffed way to report a barrier, and offers a human alternative for anything on the site.
 * Keep it that way unless an audit actually certifies conformance.
 */

const PATH = "/accessibility";
const CANONICAL = `${SITE_ORIGIN}${PATH}`;
const BREADCRUMBS = crumbs({ label: "Accessibility" });
const UPDATED = "September 25, 2026";
const CONTACT_EMAIL = "sales@amfordashtabula.com";

export const Route = createFileRoute("/accessibility")({
  head: () => ({
    meta: [
      { title: "Accessibility Statement | AM Ford" },
      {
        name: "description",
        content:
          "How to reach AM Ford if any part of this website is difficult to use, and what we do to keep the site usable with a keyboard or screen reader.",
      },
      { property: "og:title", content: "Accessibility Statement | AM Ford" },
      { property: "og:url", content: CANONICAL },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(breadcrumbSchema(BREADCRUMBS)) },
    ],
  }),
  component: AccessibilityPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
        {children}
      </div>
    </section>
  );
}

const LINK = "font-semibold text-[#002c5f] underline underline-offset-2";

function AccessibilityPage() {
  return (
    <SiteShell>
      <Breadcrumbs items={BREADCRUMBS} />
      <div className="mx-auto max-w-3xl px-6 pb-20 pt-6">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Accessibility Statement
        </h1>
        <p className="mt-3 text-sm text-slate-500">Last updated {UPDATED}</p>

        <Section title="Our aim">
          <p>
            We want anyone to be able to browse our inventory, ask us a question, and book a
            service visit, including people who use a screen reader, navigate by keyboard, rely on
            captions, or need larger text. We work toward the Web Content Accessibility Guidelines
            version 2.1 at level AA as our standard.
          </p>
        </Section>

        <Section title="What we do">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Label form fields so a screen reader announces what each one is for.</li>
            <li>Keep text and background colours at a readable contrast.</li>
            <li>Make menus, filters, and buttons reachable and operable with a keyboard.</li>
            <li>Describe meaningful images, and keep decoration out of the reading order.</li>
            <li>Review new pages and features before they go live.</li>
          </ul>
        </Section>

        <Section title="Where we know we fall short">
          <p>
            This is an ongoing effort rather than a finished job. Some third-party content we
            embed, such as the map on our contact page and photographs supplied by the
            manufacturer feed, is not fully under our control. If any of it blocks you, tell us
            and we will give you the same information another way.
          </p>
        </Section>

        <Section title="Tell us about a problem">
          <p>
            If any part of this site is hard to use, we want to hear about it, and we will help
            you directly in the meantime. Call{" "}
            <a href={dealerInfo.phoneHref} className={LINK}>
              {dealerInfo.phone}
            </a>{" "}
            or email {CONTACT_EMAIL}. Please tell us the page and what happened, and we will get
            back to you.
          </p>
          <p>
            You can also visit us at {dealerInfo.address}, where a member of staff can look up any
            vehicle, price, or appointment for you in person.
          </p>
        </Section>

        <Section title="Related pages">
          <p>
            Read our{" "}
            <Link to="/privacy" className={LINK}>
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link to="/terms" className={LINK}>
              Terms of Use
            </Link>
            .
          </p>
        </Section>
      </div>
    </SiteShell>
  );
}
