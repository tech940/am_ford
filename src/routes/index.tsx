import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/home/HomePage";
import { dealerInfo, DELIVERY_CLAIM } from "@/lib/vehicles";

const CANONICAL = "https://amford.com/";

export const Route = createFileRoute("/")({
  head: () => ({
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
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: Index,
});

function Index() {
  return <HomePage />;
}
