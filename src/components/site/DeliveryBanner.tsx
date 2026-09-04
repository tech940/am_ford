import { Link } from "@tanstack/react-router";
import { IconArrowRight, IconPin } from "@/components/ledger";
import { DELIVERY_DISCLAIMER, DELIVERY_SHIPPING, DELIVERY_SHORT, dealerInfo } from "@/lib/vehicles";

/**
 * The delivery differentiator, in the brief's approved wording.
 * Per the brief this must appear on the homepage, inventory, vehicle detail,
 * finance, trade, city and contact pages. Never shorten the claim to
 * "free nationwide delivery" — shipping outside 300 miles may carry a charge.
 */
export function DeliveryBanner({ variant = "full" }: { variant?: "full" | "compact" }) {
  if (variant === "compact") {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-sm bg-brand/5 px-4 py-3 text-sm ring-1 ring-brand/15">
        <span className="inline-flex items-center gap-2 font-semibold text-brand">
          {DELIVERY_SHORT}
        </span>
        <span className="inline-flex items-center gap-2 font-medium text-ink-2">
          <IconPin className="h-4 w-4 text-brand" /> {DELIVERY_SHIPPING}
        </span>
      </div>
    );
  }

  return (
    <section className="border-y border-rule bg-sage-tint py-14">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-brand">
            Shop from wherever you live
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {DELIVERY_SHORT}, and {DELIVERY_SHIPPING.toLowerCase()}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-2">
            You do not have to live in Ashtabula County to buy from AM Ford. Choose your vehicle
            online, complete much of the financing and paperwork remotely, and we will bring it to
            your driveway free of charge within 300 miles of our {dealerInfo.locality}, Ohio
            dealership. Farther away? We can arrange shipping to any of the 50 states.
          </p>
          {/* The constant, not a paraphrase of it. Its own doc comment forbids rewording, and
              this file was shipping a second version of the same disclaimer. */}
          <p className="mt-3 text-xs text-ink-3">{DELIVERY_DISCLAIMER}</p>
        </div>
        <div className="lg:col-span-4">
          <Link
            to="/nationwide-vehicle-delivery"
            className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-brand px-6 py-4 text-sm font-bold text-white transition hover:bg-brand-deep"
          >
            Learn About Free Home Delivery
            <IconArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={dealerInfo.phoneHref}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-brand/20 bg-white px-6 py-4 text-sm font-bold text-brand transition hover:bg-surface"
          >
            Request a Shipping Quote
          </a>
        </div>
      </div>
    </section>
  );
}
