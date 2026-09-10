import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/home/HomePage";
import { dealerInfo, DELIVERY_CLAIM } from "@/lib/vehicles";

const CANONICAL = "https://amford.com/";

export const Route = createFileRoute("/")({
  head: () => {
    const dealerSchema = {
      "@context": "https://schema.org",
      "@type": "AutoDealer",
      "@id": "https://amford.com/#dealer",
      name: dealerInfo.name,
      legalName: dealerInfo.legalName,
      url: CANONICAL,
      logo: "https://amford.com/am-ford-logo.png",
      image:
        "https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&auto=format&fit=crop&q=80",
      description: `New and certified Ford dealership in ${dealerInfo.city}, OH serving Ashtabula County, Geneva, Conneaut, and Northeast Ohio.`,
      telephone: "+14409982151",
      email: "sales@amford.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: dealerInfo.street,
        addressLocality: dealerInfo.locality,
        addressRegion: dealerInfo.region,
        postalCode: dealerInfo.postalCode,
        addressCountry: "US",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 41.7389,
        longitude: -80.7684,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "09:00",
          closes: "19:00",
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: "Saturday",
          opens: "09:00",
          closes: "17:00",
        },
      ],
      priceRange: "$$$$",
      areaServed: [
        "Jefferson, OH",
        "Ashtabula County, OH",
        "Geneva, OH",
        "Conneaut, OH",
        "Austinburg, OH",
        "Erie, PA",
        "Cleveland, OH",
      ],
    };

    const ogImage =
      "https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&auto=format&fit=crop&q=80";

    return {
      meta: [
        { title: `New and Certified Ford Dealer in ${dealerInfo.city} | AM Ford` },
        {
          name: "description",
          content: `Shop new and certified Ford trucks, SUVs, and EVs at AM Ford in ${dealerInfo.city}. Browse inventory, financing, and service for Ashtabula County drivers.`,
        },
        {
          name: "keywords",
          content:
            "AM Ford, Ford dealer Jefferson Ohio, Ford dealership Jefferson OH, certified pre-owned Ford Jefferson Ohio, Ford dealer Ashtabula County, Ford dealer Northeast Ohio, new Ford F-150, Ford Mustang, Ford Bronco, Ford Explorer",
        },
        // Local geo tags for Ashtabula County & Northeast Ohio
        { name: "geo.region", content: "US-OH" },
        { name: "geo.placename", content: dealerInfo.city },
        { name: "geo.position", content: "41.7389;-80.7684" },
        { name: "ICBM", content: "41.7389, -80.7684" },
        {
          property: "og:title",
          content: `New and Certified Ford Dealer in ${dealerInfo.city} | AM Ford`,
        },
        {
          property: "og:description",
          content: `Find your next Ford truck, SUV, or EV with flexible financing at AM Ford in ${dealerInfo.city}. ${DELIVERY_CLAIM}`,
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: CANONICAL },
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        {
          property: "og:image:alt",
          content: `AM Ford Dealership showroom and lot in ${dealerInfo.city}, OH`,
        },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: ogImage },
      ],
      links: [{ rel: "canonical", href: CANONICAL }],
      scripts: [],
    };
  },
  component: Index,
});

function Index() {
  return <HomePage />;
}
