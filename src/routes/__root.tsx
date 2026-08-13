import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import { IMAGES } from "@/assets/images.gen";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

const autoDealerSchema = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  // Stable identity: every other AutoDealer node on the site reuses this @id so
  // Google merges them into ONE dealership rather than reading several.
  "@id": "https://amford.com/#dealer",
  name: "AM Ford",
  alternateName: "Nassief Ford",
  description:
    "Family-owned Ford dealership in Jefferson, Ohio serving Ashtabula County, Northeast Ohio, and Northwestern Pennsylvania with new Ford trucks and SUVs, used vehicles, commercial vehicles, financing, and Ford-certified service. Free home delivery within 300 miles and vehicle shipping available to all 50 states.",
  url: "https://amford.com",
  telephone: "+14409982151",
  priceRange: "$$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "1059 State Route 46 North",
    addressLocality: "Jefferson",
    addressRegion: "OH",
    postalCode: "44047",
    addressCountry: "US",
  },
  areaServed: [
    { "@type": "AdministrativeArea", name: "Ashtabula County, Ohio" },
    { "@type": "AdministrativeArea", name: "Lake County, Ohio" },
    { "@type": "AdministrativeArea", name: "Geauga County, Ohio" },
    { "@type": "AdministrativeArea", name: "Trumbull County, Ohio" },
    { "@type": "Place", name: "Northeast Ohio" },
    { "@type": "Place", name: "Northwestern Pennsylvania" },
    { "@type": "Country", name: "United States" },
  ],
  geo: {
    "@type": "GeoCoordinates",
    latitude: 41.7392,
    longitude: -80.7698,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "09:00",
      closes: "20:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Friday",
      opens: "09:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:00",
      closes: "17:00",
    },
  ],
};

/**
 * The publisher entity. Separate from AutoDealer (the storefront) and joined to it by
 * @id, which is how Google resolves "who runs this site" for knowledge panels.
 * Add real sameAs profile URLs once the client confirms their social accounts.
 */
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://amford.com/#organization",
  name: "AM Ford",
  alternateName: "Nassief Ford",
  url: "https://amford.com",
  logo: "https://amford.com/og-default.jpg",
  telephone: "+14409982151",
  address: {
    "@type": "PostalAddress",
    streetAddress: "1059 State Route 46 North",
    addressLocality: "Jefferson",
    addressRegion: "OH",
    postalCode: "44047",
    addressCountry: "US",
  },
};

/**
 * Declares the site itself. The SearchAction is what makes a sitelinks search box
 * eligible in Google results, pointed at the inventory search param the route accepts.
 */
const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://amford.com/#website",
  url: "https://amford.com",
  name: "AM Ford",
  publisher: { "@id": "https://amford.com/#organization" },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://amford.com/inventory?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#002c5f" },
      { title: "AM Ford | Ford Dealer in Jefferson, OH Serving Ashtabula County" },
      {
        name: "description",
        content:
          "Family-owned Ford dealership in Jefferson, Ohio. Shop new Ford trucks and SUVs, quality used vehicles, and commercial vehicles with financing, trade-ins, and Ford-certified service. Free home delivery within 300 miles and vehicle shipping available to all 50 states.",
      },
      {
        name: "keywords",
        content:
          "Ford dealer Jefferson Ohio, Ford dealership Jefferson OH, Ford dealer Ashtabula County, used trucks Ashtabula County, Ford service Jefferson Ohio, used cars Jefferson Ohio, Ford dealer Northeast Ohio",
      },
      { name: "author", content: "AM Ford" },
      { property: "og:site_name", content: "AM Ford" },
      {
        property: "og:title",
        content: "AM Ford | Ford Dealer in Jefferson, OH Serving Ashtabula County",
      },
      {
        property: "og:description",
        content:
          "Shop new Ford trucks and SUVs, quality used vehicles, and commercial vehicles. Financing for many credit situations, trade-in appraisals, and Ford-certified service. Free home delivery within 300 miles and vehicle shipping available to all 50 states.",
      },
      { property: "og:type", content: "website" },
      // Matches the homepage canonical exactly (with trailing slash). Every other route
      // overrides this in its own head(); a page that forgets would otherwise tell social
      // crawlers it IS the homepage.
      { property: "og:url", content: "https://amford.com/" },
      // Site-wide social card. Routes with a better image (vehicle pages) override
      // it; without this every other page shared to Facebook or LinkedIn renders
      // as a bare text link, which measurably suppresses click-through.
      { property: "og:image", content: "https://amford.com/og-default.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "AM Ford dealership in Jefferson, Ohio",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://amford.com/og-default.jpg" },
    ],
    links: [
      {
        rel: "icon",
        type: "image/png",
        href: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQliImsHZ3as1_rCrG6O6KHQSFLPgBkVthMNugVUvEw4Wf65GWivtz41Hg&s=10",
      },
      {
        rel: "shortcut icon",
        href: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQliImsHZ3as1_rCrG6O6KHQSFLPgBkVthMNugVUvEw4Wf65GWivtz41Hg&s=10",
      },
      {
        rel: "apple-touch-icon",
        href: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQliImsHZ3as1_rCrG6O6KHQSFLPgBkVthMNugVUvEw4Wf65GWivtz41Hg&s=10",
      },
      {
        rel: "preload",
        as: "image",
        href: IMAGES["hero-truck"]?.variants[3]?.avif || "",
        type: "image/avif",
        fetchPriority: "high",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "preload",
        as: "style",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(autoDealerSchema),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(organizationSchema),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(webSiteSchema),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
