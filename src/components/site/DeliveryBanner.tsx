import { Link } from "@tanstack/react-router";
import { Truck, MapPin, ArrowRight } from "lucide-react";
import { DELIVERY_SHORT, DELIVERY_SHIPPING, dealerInfo } from "@/lib/vehicles";

/**
 * The delivery differentiator, in the brief's approved wording.
 * Per the brief this must appear on the homepage, inventory, vehicle detail,
 * finance, trade, city and contact pages. Never shorten the claim to
 * "free nationwide delivery" — shipping outside 300 miles may carry a charge.
 */
export function DeliveryBanner({ variant = "full" }: { variant?: "full" | "compact" }) {
  if (variant === "compact") {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-[#002c5f]/5 px-4 py-3 text-sm ring-1 ring-[#002c5f]/15">
        <span className="inline-flex items-center gap-2 font-semibold text-[#002c5f]">
          <Truck className="h-4 w-4" /> {DELIVERY_SHORT}
        </span>
        <span className="inline-flex items-center gap-2 font-medium text-slate-600">
          <MapPin className="h-4 w-4 text-[#002c5f]" /> {DELIVERY_SHIPPING}
        </span>
      </div>
    );
  }

  return (
    <section className="border-y border-slate-200 bg-white py-14">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#002c5f]">
            Shop from wherever you live
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {DELIVERY_SHORT}, and {DELIVERY_SHIPPING.toLowerCase()}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
            You do not have to live in Ashtabula County to buy from AM Ford. Choose your vehicle
            online, complete much of the financing and paperwork remotely, and we will bring it to
            your driveway free of charge within 300 miles of our {dealerInfo.locality}, Ohio
            dealership. Farther away? We can arrange shipping to any of the 50 states.
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Shipping charges may apply outside the complimentary 300-mile delivery area. Delivery
            timing depends on your location, vehicle availability, completed documentation, and
            financing approval. Confirm terms with the dealership before purchase.
          </p>
        </div>
        <div className="lg:col-span-4">
          <Link
            to="/nationwide-vehicle-delivery"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#002c5f] px-6 py-4 text-sm font-bold text-white shadow-md transition hover:bg-[#001f44]"
          >
            Learn About Free Home Delivery
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={dealerInfo.phoneHref}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#002c5f]/20 bg-white px-6 py-4 text-sm font-bold text-[#002c5f] transition hover:bg-slate-50"
          >
            Request a Shipping Quote
          </a>
        </div>
      </div>
    </section>
  );
}
