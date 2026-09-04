import { Link } from "@tanstack/react-router";
import { DELIVERY_CLAIM, DELIVERY_DISCLAIMER, dealerInfo } from "@/lib/vehicles";
import { SectionHeading } from "@/components/ledger";

/**
 * S5 — delivery. Replaces DeliveryHighlight and absorbs what survived AreasWeServe.
 *
 * The approved sentence is stated once, intact, as the lead. The version this replaces split
 * it across two type weights, which is a wording change made with typography. The three
 * process cards are gone: icon plus heading plus paragraph, three times, is the client's
 * named ban, and the process is /nationwide-vehicle-delivery's job.
 *
 * No figures set at display scale. A big numeral over an uppercase unit label beside a heading
 * beside a paragraph is a stats band, which is the banned row with the icon slot upgraded.
 * "50" is how many states exist, not something this dealership earned.
 *
 * No photograph: the hero above and ServiceRow directly below are both veiled photographs.
 * The ground change to `surface` is what stops this reading as a seam.
 *
 * The address is not here. This surface names Jefferson as the origin of the radius and
 * nothing more; the address belongs to TheStore's facts rule and the footer record.
 */
export function WeBringItToYou() {
  return (
    <section aria-labelledby="delivery-title" className="bg-surface">
      <div className="reveal mx-auto max-w-[1200px] px-5 py-14 md:px-10 lg:px-16 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              id="delivery-title"
              title={`${dealerInfo.locality} to your driveway`}
              lead={DELIVERY_CLAIM}
            />
          </div>

          <div className="lg:col-span-7">
            <p className="max-w-[62ch] font-sans text-body leading-relaxed text-ink-2">
              Choose the vehicle online, apply for financing and send your trade details from home,
              and we prepare the documents and tell you what your state requires. Then we schedule a
              delivery window with you and bring the vehicle out on a dealership transport, and you
              sign whatever is left at the handover. Past the 300-mile area we arrange transport
              with an established carrier instead, quoted in writing before you commit.
            </p>

            <p className="mt-4 max-w-[62ch] font-sans text-body leading-relaxed text-ink-2">
              What we need from you, and when, is set out in full on{" "}
              <Link
                to="/nationwide-vehicle-delivery"
                className="text-brand underline underline-offset-[3px] hover:text-brand-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                the delivery and shipping page
              </Link>
              .
            </p>
          </div>
        </div>

        {/* The section ends on its fine print, which is what a real dealership page does. */}
        <p className="mt-10 max-w-[74ch] border-t border-rule pt-6 font-sans text-meta leading-relaxed text-ink-2">
          {DELIVERY_DISCLAIMER}
        </p>
      </div>
    </section>
  );
}
