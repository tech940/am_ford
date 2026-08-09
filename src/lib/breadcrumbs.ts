export const SITE_ORIGIN = "https://amford.com";

export type Crumb = {
  /** Visible label. Keep it short: this is what Google prints in the result. */
  label: string;
  /** Site-relative path. Omit on the final crumb, which is the current page. */
  href?: string;
};

/**
 * BreadcrumbList JSON-LD.
 *
 * Google requires breadcrumb structured data to match the visible trail, so both the
 * schema and the <Breadcrumbs> component are built from the same Crumb[]. Never write
 * one without the other.
 *
 * The current page is included as the last item without an `item` URL, which is the
 * documented pattern for the page you are already on.
 */
export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${SITE_ORIGIN}${c.href}` } : {}),
    })),
  };
}

/** Every trail starts at the dealership home page. */
export const HOME_CRUMB: Crumb = { label: "Home", href: "/" };

export const crumbs = (...rest: Crumb[]): Crumb[] => [HOME_CRUMB, ...rest];
