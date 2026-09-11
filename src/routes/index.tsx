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
        "https://assets.cai-media-management.com/resize/1024x1024/common-vehicle-media/303504c6-8b4d-463b-9327-a47a0c975418.jpg",
      description: `New and certified Ford dealership in Ashtabula County, OH serving Ashtabula, Geneva, Conneaut, and Northeast Ohio.`,
      telephone: "+14405537072",
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
        "Ashtabula County, OH",
        "Ashtabula, OH",
        "Geneva, OH",
        "Conneaut, OH",
        "Austinburg, OH",
        "Erie, PA",
        "Cleveland, OH",
      ],
    };

    const ogImage =
      "https://assets.cai-media-management.com/resize/1024x1024/common-vehicle-media/303504c6-8b4d-463b-9327-a47a0c975418.jpg";

    return {
      meta: [
        { title: `Ford Dealer in Ashtabula County, OH | AM Ford` },
        {
          name: "description",
          content: `Shop new and certified Ford trucks, SUVs, and EVs at AM Ford, your dedicated Ford dealer in Ashtabula County, OH. Browse inventory, financing, and certified Ford service.`,
        },
        {
          name: "keywords",
          content:
            "Ford dealer Ashtabula County, Ford dealership Ashtabula County OH, AM Ford, certified pre-owned Ford Ashtabula County, used trucks Ashtabula County, Ford dealer Northeast Ohio, new Ford F-150, Ford Mustang, Ford Bronco, Ford Explorer",
        },
        // Local geo tags for Ashtabula County
        { name: "geo.region", content: "US-OH" },
        { name: "geo.placename", content: "Ashtabula County, OH" },
        { name: "geo.position", content: "41.7389;-80.7684" },
        { name: "ICBM", content: "41.7389, -80.7684" },
        {
          property: "og:title",
          content: `Ford Dealer in Ashtabula County, OH | AM Ford`,
        },
        {
          property: "og:description",
          content: `Find your next Ford truck, SUV, or EV with flexible financing at AM Ford in Ashtabula County, OH. ${DELIVERY_CLAIM}`,
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: CANONICAL },
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        {
          property: "og:image:alt",
          content: `AM Ford Dealership showroom and lot in Ashtabula County, OH`,
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
