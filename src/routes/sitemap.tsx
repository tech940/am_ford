import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Car,
  Compass,
  FileText,
  MapPin,
  Layers,
  ArrowUpRight,
  Search,
  Copy,
  Check,
  List,
  Grid,
  ExternalLink,
} from "lucide-react";
import { useState, useMemo } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionTag } from "@/components/site/Home";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { breadcrumbSchema, crumbs } from "@/lib/breadcrumbs";
import {
  vehicles,
  vehicleSlug,
  FILTER_OPTIONS,
  FILTERABLE_CONDITIONS,
} from "@/lib/vehicles";
import { FORD_MODELS } from "@/lib/fordModels";
import { COUNTIES } from "@/lib/counties";
import { SERVICE_AREAS } from "@/lib/serviceAreas";
import { GUIDES, COMPARISONS } from "@/lib/contentPages";

const SITE_ORIGIN = "https://amford.com";
const BREADCRUMBS = crumbs({ label: "Sitemap" });

export const Route = createFileRoute("/sitemap")({
  head: () => ({
    meta: [
      { title: "Website Sitemap & Full URL Directory | AM Ford" },
      {
        name: "description",
        content:
          "Browse the complete list of 280+ URLs and pages across AM Ford, including live vehicle inventory listings, Ford model showrooms, county/city service areas, financing, and buyer guides.",
      },
      {
        name: "keywords",
        content:
          "AM Ford sitemap, Ford dealer sitemap, Ashtabula County Ford directory, AM Ford URLs, vehicle inventory URLs",
      },
      { property: "og:title", content: "Website Sitemap & URL Directory | AM Ford" },
      {
        property: "og:description",
        content:
          "Complete list of all pages, URLs, vehicle listings, and research guides on the AM Ford website.",
      },
      { property: "og:url", content: "https://amford.com/sitemap" },
    ],
    links: [{ rel: "canonical", href: "https://amford.com/sitemap" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(breadcrumbSchema(BREADCRUMBS)),
      },
    ],
  }),
  component: SitemapPage,
});

type UrlItem = {
  category: string;
  label: string;
  path: string;
  url: string;
  extra?: string;
};

function SitemapPage() {
  const [filterQuery, setFilterQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"directory" | "url_list">("url_list");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // 1. Core pages
  const corePages: UrlItem[] = [
    { category: "Dealership & Core Hubs", label: "Home Page", path: "/", url: SITE_ORIGIN + "/" },
    { category: "Dealership & Core Hubs", label: "Vehicle Inventory Search", path: "/inventory", url: SITE_ORIGIN + "/inventory" },
    { category: "Dealership & Core Hubs", label: "Value Your Trade-In", path: "/trade-in", url: SITE_ORIGIN + "/trade-in" },
    { category: "Dealership & Core Hubs", label: "Apply for Financing", path: "/financing", url: SITE_ORIGIN + "/financing" },
    { category: "Dealership & Core Hubs", label: "Bad Credit Auto Financing", path: "/finance/bad-credit", url: SITE_ORIGIN + "/finance/bad-credit" },
    { category: "Dealership & Core Hubs", label: "Commercial & Fleet Vehicles", path: "/commercial", url: SITE_ORIGIN + "/commercial" },
    { category: "Dealership & Core Hubs", label: "Certified Ford Service & Parts", path: "/service", url: SITE_ORIGIN + "/service" },
    { category: "Dealership & Core Hubs", label: "Nationwide Delivery & Shipping", path: "/nationwide-vehicle-delivery", url: SITE_ORIGIN + "/nationwide-vehicle-delivery" },
    { category: "Dealership & Core Hubs", label: "Areas We Serve Hub", path: "/areas-we-serve", url: SITE_ORIGIN + "/areas-we-serve" },
    { category: "Dealership & Core Hubs", label: "About AM Ford", path: "/about", url: SITE_ORIGIN + "/about" },
    { category: "Dealership & Core Hubs", label: "Contact Us & Directions", path: "/contact", url: SITE_ORIGIN + "/contact" },
    { category: "Dealership & Core Hubs", label: "HTML Sitemap", path: "/sitemap", url: SITE_ORIGIN + "/sitemap" },
  ];

  // 2. Inventory facets
  const facetPages: UrlItem[] = [
    ...FILTER_OPTIONS.types
      .filter((t) => t !== "All")
      .map((t) => ({
        category: "Inventory Categories",
        label: "Ford " + t + "s Inventory",
        path: "/inventory?type=" + t,
        url: SITE_ORIGIN + "/inventory?type=" + t,
      })),
    ...FILTER_OPTIONS.fuels
      .filter((f) => f !== "All")
      .map((f) => ({
        category: "Inventory Categories",
        label: f + " Powertrain Inventory",
        path: "/inventory?fuel=" + f,
        url: SITE_ORIGIN + "/inventory?fuel=" + f,
      })),
    ...FILTERABLE_CONDITIONS.map((c) => ({
      category: "Inventory Categories",
      label: c + " Inventory",
      path: "/inventory?condition=" + encodeURIComponent(c).replace(/%20/g, "+"),
      url: SITE_ORIGIN + "/inventory?condition=" + encodeURIComponent(c).replace(/%20/g, "+"),
    })),
  ];

  // 3. Model pages
  const modelPages: UrlItem[] = [
    { category: "Ford Model Showrooms", label: "Ford Models Lineup Hub", path: "/ford-models", url: SITE_ORIGIN + "/ford-models" },
    ...FORD_MODELS.map((m) => ({
      category: "Ford Model Showrooms",
      label: m.name + " Showroom & Overview",
      path: "/ford/" + m.slug,
      url: SITE_ORIGIN + "/ford/" + m.slug,
      extra: m.tagline,
    })),
  ];

  // 4. County pages
  const countyPages: UrlItem[] = COUNTIES.map((c) => ({
    category: "Counties Served",
    label: c.county + " Ford Dealer",
    path: "/ford-dealer/county/" + c.slug,
    url: SITE_ORIGIN + "/ford-dealer/county/" + c.slug,
    extra: "Seat: " + c.countySeat + ", OH",
  }));

  // 5. City pages
  const cityPages: UrlItem[] = SERVICE_AREAS.map((a) => ({
    category: "Cities & Communities Served",
    label: "Ford Dealer in " + a.city + ", " + a.state,
    path: "/ford-dealer/" + a.slug,
    url: SITE_ORIGIN + "/ford-dealer/" + a.slug,
    extra: (a.county ? a.county + " County · " : "") + a.driveTime,
  }));

  // 6. Research & Guides
  const researchPages: UrlItem[] = [
    { category: "Research & Buyer Guides", label: "Vehicle Comparison Hub", path: "/compare", url: SITE_ORIGIN + "/compare" },
    ...COMPARISONS.map((c) => ({
      category: "Research & Buyer Guides",
      label: c.title,
      path: "/compare/" + c.slug,
      url: SITE_ORIGIN + "/compare/" + c.slug,
    })),
    { category: "Research & Buyer Guides", label: "Ford Buyer Guides Hub", path: "/guides", url: SITE_ORIGIN + "/guides" },
    ...GUIDES.map((g) => ({
      category: "Research & Buyer Guides",
      label: g.title,
      path: "/guides/" + g.slug,
      url: SITE_ORIGIN + "/guides/" + g.slug,
    })),
  ];

  // 7. All Live Vehicle Detail Listings
  const vehiclePages: UrlItem[] = vehicles.map((v) => ({
    category: "Live Vehicle Inventory Detail Pages",
    label: v.year + " " + v.make + " " + v.model + " " + v.trim,
    path: "/vehicle/" + vehicleSlug(v),
    url: SITE_ORIGIN + "/vehicle/" + vehicleSlug(v),
    extra: "$" + v.price.toLocaleString() + " · " + v.condition + " · " + v.miles.toLocaleString() + " mi · VIN: " + v.vin,
  }));

  // Combine all
  const allUrls: UrlItem[] = useMemo(
    () => [
      ...corePages,
      ...facetPages,
      ...modelPages,
      ...countyPages,
      ...cityPages,
      ...researchPages,
      ...vehiclePages,
    ],
    []
  );

  const categories = [
    { id: "all", label: "All Pages & URLs (" + allUrls.length + ")" },
    { id: "Dealership & Core Hubs", label: "Core Hubs (" + corePages.length + ")" },
    { id: "Inventory Categories", label: "Inventory Facets (" + facetPages.length + ")" },
    { id: "Ford Model Showrooms", label: "Model Showrooms (" + modelPages.length + ")" },
    { id: "Counties Served", label: "Counties (" + countyPages.length + ")" },
    { id: "Cities & Communities Served", label: "Cities (" + cityPages.length + ")" },
    { id: "Research & Buyer Guides", label: "Guides & Compare (" + researchPages.length + ")" },
    { id: "Live Vehicle Inventory Detail Pages", label: "Vehicles in Stock (" + vehiclePages.length + ")" },
  ];

  const q = filterQuery.toLowerCase().trim();

  const filteredList = useMemo(() => {
    return allUrls.filter((item) => {
      const matchCategory = activeCategory === "all" || item.category === activeCategory;
      if (!matchCategory) return false;
      if (!q) return true;
      return (
        item.label.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q) ||
        item.path.toLowerCase().includes(q) ||
        (item.extra && item.extra.toLowerCase().includes(q))
      );
    });
  }, [allUrls, activeCategory, q]);

  const handleCopySingle = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleCopyAll = () => {
    const urlsText = filteredList.map((i) => i.url).join("\n");
    navigator.clipboard.writeText(urlsText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <SiteShell>
      <Breadcrumbs items={BREADCRUMBS} />

      {/* Hero Header */}
      <section className="relative overflow-hidden py-10 sm:py-14 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="relative mx-auto max-w-6xl px-6">
          <SectionTag>Site Directory & URL Index</SectionTag>
          <h1 className="mt-2.5 text-2xl sm:text-4xl font-black text-[#002c5f] tracking-tight">
            AM Ford Sitemap & Complete URL List
          </h1>
          <p className="mt-2 max-w-2xl text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Index of all {allUrls.length} pages and live vehicle URLs across amford.com. Browse by category, filter in real-time, or copy any URL directly.
          </p>

          {/* Controls Bar */}
          <div className="mt-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by URL path, model, city, VIN..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002c5f] focus:border-[#002c5f] shadow-2xs"
              />
              {filterQuery && (
                <button
                  type="button"
                  onClick={() => setFilterQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Actions: View Mode Switcher + Copy All */}
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("url_list")}
                  className={
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition cursor-pointer " +
                    (viewMode === "url_list"
                      ? "bg-white text-[#002c5f] shadow-xs"
                      : "text-slate-600 hover:text-slate-900")
                  }
                >
                  <List className="h-3.5 w-3.5" />
                  <span>URL Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("directory")}
                  className={
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition cursor-pointer " +
                    (viewMode === "directory"
                      ? "bg-white text-[#002c5f] shadow-xs"
                      : "text-slate-600 hover:text-slate-900")
                  }
                >
                  <Grid className="h-3.5 w-3.5" />
                  <span>Grid Cards</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyAll}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-[#002c5f] transition active:scale-95 shadow-2xs cursor-pointer"
              >
                {copiedAll ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied {filteredList.length} URLs!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Filtered ({filteredList.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategory(c.id)}
                className={
                  "rounded-md px-2.5 py-1 text-xs font-semibold transition cursor-pointer " +
                  (activeCategory === c.id
                    ? "bg-[#002c5f] text-white shadow-2xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200")
                }
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-4 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            Showing <strong className="text-slate-900 font-bold">{filteredList.length}</strong> of{" "}
            {allUrls.length} total URLs
          </span>
          <div className="flex items-center gap-3">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#002c5f] hover:underline font-bold"
            >
              sitemap.xml ↗
            </a>
            <span>·</span>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#002c5f] hover:underline font-bold"
            >
              robots.txt ↗
            </a>
          </div>
        </div>

        {/* 1. URL List / Table View */}
        {viewMode === "url_list" ? (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xs">
            <div className="divide-y divide-slate-100">
              {filteredList.map((item, idx) => (
                <div
                  key={item.url + idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:px-4 hover:bg-slate-50/80 transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 shrink-0">
                        {item.category}
                      </span>
                      <Link
                        to={item.path}
                        className="font-bold text-xs sm:text-sm text-slate-900 hover:text-[#002c5f] truncate"
                      >
                        {item.label}
                      </Link>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                      <code className="rounded bg-slate-50 border border-slate-200/80 px-1.5 py-0.5 font-mono text-[11px] text-[#002c5f] break-all">
                        {item.url}
                      </code>
                      {item.extra && (
                        <span className="text-[11px] text-slate-500 font-medium">
                          {item.extra}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleCopySingle(item.url)}
                      title="Copy URL"
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 transition cursor-pointer"
                    >
                      {copiedUrl === item.url ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3 text-slate-500" />
                      )}
                      <span>{copiedUrl === item.url ? "Copied" : "Copy"}</span>
                    </button>
                    <Link
                      to={item.path}
                      title="Open page"
                      className="inline-flex items-center gap-1 rounded-md bg-[#002c5f] hover:bg-[#001f44] px-2 py-1 text-[11px] font-bold text-white transition"
                    >
                      <span>Visit</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* 2. Grid Cards View */
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredList.map((item, idx) => (
              <div
                key={item.url + idx}
                className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-3.5 hover:border-[#002c5f] hover:shadow-xs transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-slate-600">
                      {item.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopySingle(item.url)}
                      className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedUrl === item.url ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <h3 className="mt-2 font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                    <Link to={item.path} className="hover:text-[#002c5f]">
                      {item.label}
                    </Link>
                  </h3>
                  <p className="mt-1 font-mono text-[10.5px] text-[#002c5f] truncate">
                    {item.url}
                  </p>
                  {item.extra && (
                    <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                      {item.extra}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">{item.path}</span>
                  <Link
                    to={item.path}
                    className="inline-flex items-center gap-0.5 text-xs font-bold text-[#002c5f] hover:underline"
                  >
                    <span>View</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredList.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
            <p className="text-sm font-bold text-slate-800">No URLs found</p>
            <p className="mt-1 text-xs text-slate-500">
              No matching pages found for &ldquo;{filterQuery}&rdquo;. Try clearing your search.
            </p>
            <button
              type="button"
              onClick={() => {
                setFilterQuery("");
                setActiveCategory("all");
              }}
              className="mt-4 rounded-md bg-[#002c5f] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#001f44] cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </SiteShell>
  );
}
