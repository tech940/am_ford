/**
 * Registry of the editorial (non-inventory) pages: guides and model comparisons.
 *
 * This is the single source the sitemap generator and the internal-link checker read
 * from, so adding a guide means adding one entry here rather than editing three files
 * and discovering later that the sitemap never listed it.
 */

export type ContentPage = {
  slug: string;
  title: string;
  /** Short blurb for hub pages and ItemList schema. */
  blurb: string;
  /** ISO date the page was published. */
  published: string;
};

/** /guides/{slug} — informational, top-of-funnel. */
export const GUIDES: ContentPage[] = [
  {
    slug: "is-a-used-ford-f-150-reliable",
    title: "Is a Used Ford F-150 Reliable?",
    blurb:
      "What to research on a used F-150 before you buy, from maintenance records to engine choice.",
    published: "2026-08-07",
  },
  {
    slug: "is-ford-ecoboost-reliable",
    title: "Is the Ford EcoBoost Engine Reliable?",
    blurb:
      "How EcoBoost turbocharged engines differ from a V8, and what to inspect before buying one.",
    published: "2026-08-07",
  },
  {
    slug: "what-to-check-before-buying-a-used-ford",
    title: "What to Check Before Buying a Used Ford",
    blurb:
      "The documentation, mechanical checks, and history questions that protect a used purchase.",
    published: "2026-08-07",
  },
  {
    slug: "best-ford-suv-for-families",
    title: "Best Ford SUV for Families",
    blurb:
      "Comparing the Explorer, Escape, and Bronco on space, seating, and everyday practicality.",
    published: "2026-08-07",
  },
];

/** /compare/{slug} — head-to-head, mid-funnel. Both sides must have a /ford/{slug} page. */
export const COMPARISONS: ContentPage[] = [
  {
    slug: "explorer-vs-escape",
    title: "Ford Explorer vs Ford Escape",
    blurb: "Three-row capability against a smaller, more efficient SUV for daily driving.",
    published: "2026-08-07",
  },
  {
    slug: "f-150-vs-f-150-lightning",
    title: "Ford F-150 vs Ford F-150 Lightning",
    blurb: "The same truck, two powertrains. How gas and electric change the ownership math.",
    published: "2026-08-07",
  },
  {
    slug: "bronco-vs-explorer",
    title: "Ford Bronco vs Ford Explorer",
    blurb: "Off-road hardware against family-focused space, and who each one actually suits.",
    published: "2026-08-07",
  },
];

export const guidePath = (p: ContentPage) => `/guides/${p.slug}`;
export const comparePath = (p: ContentPage) => `/compare/${p.slug}`;
