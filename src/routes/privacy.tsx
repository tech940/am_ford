import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { breadcrumbSchema, crumbs, SITE_ORIGIN } from "@/lib/breadcrumbs";
import { dealerInfo } from "@/lib/vehicles";

/**
 * DRAFT FOR ATTORNEY REVIEW. Written to describe what this site actually does, verified
 * against the code rather than copied from a template: the lead fields in LeadInquiry
 * (src/lib/supabase.ts), the financing form in src/routes/financing.tsx (which collects
 * employer and annual income, making this a GLBA matter), the browser storage in
 * src/lib/garage.ts and src/lib/recentlyViewed.ts, and the fact that NO analytics or
 * advertising trackers are loaded anywhere in the app.
 *
 * If a tracker is ever added (Google Analytics, a Meta pixel, a chat tool that profiles
 * visitors), the "Cookies and browser storage" section stops being true and both this page
 * and the consent approach have to change on the same day.
 */

const PATH = "/privacy";
const CANONICAL = `${SITE_ORIGIN}${PATH}`;
const BREADCRUMBS = crumbs({ label: "Privacy Policy" });
const UPDATED = "September 25, 2026";
const CONTACT_EMAIL = "sales@amfordashtabula.com";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | AM Ford" },
      {
        name: "description",
        content:
          "How AM Ford collects, uses, and protects the information you provide through this website, including inquiry and financing details.",
      },
      { property: "og:title", content: "Privacy Policy | AM Ford" },
      { property: "og:url", content: CANONICAL },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(breadcrumbSchema(BREADCRUMBS)) },
    ],
  }),
  component: PrivacyPage,
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

function PrivacyPage() {
  return (
    <SiteShell>
      <Breadcrumbs items={BREADCRUMBS} />
      <div className="mx-auto max-w-3xl px-6 pb-20 pt-6">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-slate-500">Last updated {UPDATED}</p>

        <Section title="Who this policy covers">
          <p>
            This policy explains how {dealerInfo.name} handles information collected through this
            website. Our dealership is at {dealerInfo.address}. You can reach us on{" "}
            <a href={dealerInfo.phoneHref} className={LINK}>
              {dealerInfo.phone}
            </a>{" "}
            or at {CONTACT_EMAIL}.
          </p>
        </Section>

        <Section title="Information you give us">
          <p>When you submit a form on this site, we collect what you type into it:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Your name, phone number, and email address.</li>
            <li>The vehicle you are asking about, and any message or question you include.</li>
            <li>A preferred day or time, when you are booking a test drive or service visit.</li>
            <li>
              For a financing pre-qualification, the employment and income details you enter on
              the financing form, such as your employer, annual income, and current housing
              payment. This is financial information and we treat it as confidential.
            </li>
            <li>Details you provide about a vehicle you want to trade in.</li>
          </ul>
          <p>
            This website does not ask for a Social Security number, a date of birth, or bank
            account details. A full credit application is handled separately by our finance
            office, and anything you submit there is covered by the disclosures you receive at
            that time.
          </p>
        </Section>

        <Section title="Information collected automatically">
          <p>
            Our hosting provider keeps standard server logs, which include your IP address,
            browser type, and the pages you request. Those logs exist to keep the site running and
            secure.
          </p>
        </Section>

        <Section title="Cookies and browser storage">
          <p>
            This site does not load advertising cookies, analytics tags, or third-party tracking
            pixels. We do not build a profile of you across other websites.
          </p>
          <p>
            The site does keep a small amount of information inside your own browser so that
            features work: the vehicles you save, the vehicles you recently viewed, and a note
            that you already sent us an inquiry so we stop repeating the same offer. That
            information stays on your device. Clearing your browser data removes it.
          </p>
        </Section>

        <Section title="How we use your information">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>To answer your question and follow up about the vehicle you asked about.</li>
            <li>To book test drives, service appointments, and delivery.</li>
            <li>
              To prepare financing options and, when you ask us to, to seek terms from lenders.
            </li>
            <li>To value a vehicle you want to trade in.</li>
            <li>To keep a record of your request and of the consent you gave us to contact you.</li>
          </ul>
        </Section>

        <Section title="Calls and text messages">
          <p>
            If you tick the consent box on a form, you agree that we may contact you by phone or
            text at the number you gave us, about the inquiry you made. Consent to receive texts
            is not a condition of buying anything. Message and data rates may apply. Reply STOP to
            any text to opt out, or tell us on a call and we will stop.
          </p>
        </Section>

        <Section title="Who we share information with">
          <p>
            We do not sell your personal information, and we do not share it for cross-context
            behavioural advertising. We share it only as follows:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>With lenders and finance sources, when you ask us to arrange or quote financing.</li>
            <li>
              With service providers who run this website and store our records for us, under
              agreements that limit them to that purpose.
            </li>
            <li>
              With Ford Motor Company where a request concerns a factory order, warranty, recall,
              or a manufacturer program.
            </li>
            <li>When the law requires it, or to protect our rights, our staff, or our customers.</li>
          </ul>
        </Section>

        <Section title="Financial information">
          <p>
            Because we help arrange vehicle financing, the information you give us for that
            purpose is treated as nonpublic personal financial information. We limit access to
            staff who need it to work on your deal, and we share it with lenders only to obtain
            terms for you. You receive our financing privacy notice when you complete a credit
            application.
          </p>
        </Section>

        <Section title="How long we keep it">
          <p>
            We keep inquiry records for as long as we need them to serve you and to meet the
            record keeping obligations that apply to a licensed dealer, then dispose of them
            securely.
          </p>
        </Section>

        <Section title="Your choices">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Ask what information we hold about you, and ask us to correct or delete it.</li>
            <li>Opt out of texts by replying STOP, or ask us to stop calling.</li>
            <li>
              Residents of states with consumer privacy laws, including California, may have
              further rights, including the right to know what we hold, to have it deleted, and
              not to be treated differently for asking.
            </li>
          </ul>
          <p>
            To make a request, call{" "}
            <a href={dealerInfo.phoneHref} className={LINK}>
              {dealerInfo.phone}
            </a>{" "}
            or email {CONTACT_EMAIL}. We may need to verify who you are before we act on a
            request.
          </p>
        </Section>

        <Section title="Security">
          <p>
            We use reasonable administrative and technical measures to protect what you send us.
            No website can be guaranteed completely secure, so please do not send sensitive
            documents by email.
          </p>
        </Section>

        <Section title="Children">
          <p>
            This site is meant for adults shopping for a vehicle. We do not knowingly collect
            information from children.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            If we change how this site handles information, including adding analytics or
            advertising tools, we will update this page and change the date above.
          </p>
        </Section>

        <Section title="Contact us">
          <p>
            {dealerInfo.name}, {dealerInfo.address}. Phone{" "}
            <a href={dealerInfo.phoneHref} className={LINK}>
              {dealerInfo.phone}
            </a>
            . See also our{" "}
            <Link to="/terms" className={LINK}>
              Terms of Use
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
