import { Link } from "@tanstack/react-router";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import { HOME_BLOCKS } from "@/lib/dealerContent";
import { IconArrowRight } from "@/components/ledger";

/**
 * Two things a visitor can start before they have chosen a vehicle: sell us the car they have,
 * or get approved for the one they want.
 *
 * Copy and imagery are the dealership's own, verbatim from the live homepage via
 * `HOME_BLOCKS`. "Sell us your car, even if you don't buy from us" is a genuinely good line —
 * specific, generous, and impossible to mistake for anyone else's marketing — so it is
 * reproduced rather than rewritten.
 *
 * This replaces the old `Financing` section, which pitched the same finance message at greater
 * length beside a decorative wheel, and which had no trade counterpart at all. Two short
 * offers with real photographs beat one long one with an illustration, and running both on the
 * same page would have put two financing pitches in front of the same visitor.
 *
 * Actions are text links, not filled buttons: the page keeps exactly one filled control, the
 * search submit in the opening section.
 */
const CARDS = [
  {
    key: "trade",
    image: "am-ford-front-lot",
    alt: "The front lot at AM Ford in Jefferson, Ohio",
    ...HOME_BLOCKS.trade,
  },
  {
    key: "finance",
    image: "am-ford-new-bronco",
    alt: "A new Ford Bronco at AM Ford in Jefferson, Ohio",
    ...HOME_BLOCKS.finance,
  },
] as const;

export function TradeAndFinance() {
  return (
    <section aria-labelledby="trade-finance-title" className="border-b border-rule bg-sage-tint">
      <h2 id="trade-finance-title" className="sr-only">
        Sell us your car, or get approved before you shop
      </h2>

      <div className="reveal mx-auto grid max-w-[1200px] gap-6 px-5 py-14 md:grid-cols-2 md:px-10 lg:gap-8 lg:px-16 lg:py-20">
        {CARDS.map((card) => (
          <article
            key={card.key}
            className="group relative flex flex-col border border-rule bg-white transition-colors duration-200 hover:border-ink/25"
          >
            <div className="aspect-[3/2] w-full overflow-hidden bg-surface">
              <ResponsiveImage
                name={card.image}
                alt={card.alt}
                sizes="(min-width: 768px) 560px, 100vw"
                aspect={{ width: 3, height: 2 }}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col p-6 lg:p-7">
              <h3 className="max-w-[24ch] text-balance font-sans text-h3 font-bold leading-snug text-ink">
                {card.title}
              </h3>
              <p className="mt-3 font-sans text-body leading-relaxed text-ink-2">{card.body}</p>

              <p className="mt-6">
                <Link
                  to={card.primary.href}
                  className="inline-flex items-center gap-1.5 font-sans text-ui font-semibold text-brand underline-offset-4 after:absolute after:inset-0 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {card.primary.label}
                  <IconArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                </Link>
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
