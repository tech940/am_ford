import { SITE_ORIGIN } from "./breadcrumbs";
import { dealerInfo } from "./vehicles";

/**
 * Article JSON-LD for /guides/, /compare/, and /blog/ pages.
 *
 * Dates are passed in explicitly rather than generated at render time: a dateModified
 * that changes on every request tells Google the page is churning when it is not, and
 * it would also break SSR/client hydration parity. Update the constant in the page when
 * you actually revise the content.
 */
export function articleSchema(opts: {
  headline: string;
  description: string;
  /** Canonical path, e.g. "/guides/is-a-used-ford-f-150-reliable". */
  path: string;
  /** ISO date, e.g. "2026-08-07". */
  datePublished: string;
  dateModified?: string;
  image?: string;
}) {
  const url = `${SITE_ORIGIN}${opts.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    image: opts.image ?? `${SITE_ORIGIN}/og-default.jpg`,
    author: { "@id": `${SITE_ORIGIN}/#organization` },
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
  };
}

/** FAQPage JSON-LD. Build it from the SAME array the page renders, never a copy. */
export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export const DEALER_NAME = dealerInfo.name;
