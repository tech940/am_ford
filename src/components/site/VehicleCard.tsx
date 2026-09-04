import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { modelAccent, paintSwatch, type Vehicle } from "@/lib/vehicles";
import { ResponsiveImage, imageNameFromSrc } from "@/components/site/ResponsiveImage";
import { GARAGE_EVENT, isSaved, toggleSaved } from "@/lib/garage";
import {
  Button,
  Chip,
  IconCheck,
  IconCompare,
  IconTag,
  IconArrowRight,
  IconSavings,
} from "@/components/ledger";
import { VehicleLeadDialog } from "@/components/lead/VehicleLeadDialog";
import { cn } from "@/lib/utils";

/**
 * A vehicle, in the Ledger language: photography carries the car, typography carries the deal.
 *
 * Two layouts, one component.
 *
 *  - `row` (inventory): full-width. The photograph gets 5 of 12 columns and real scale; the
 *    right side is an actual ledger — price set large in Archivo Expanded, then an aligned
 *    label/value spec band in tabular figures. Six vehicles is a considered selection, not a
 *    search result, and a uniform 3-up grid of identical tiles says the opposite.
 *  - `tile` (related vehicles, model pages): the same hierarchy compressed into a column.
 *
 * The image ground is ink, not grey. The photography is studio cutouts on a grey sweep, and a
 * grey box on warm paper reads as a missing image; on ink it reads as a stage.
 *
 * Deliberately absent: any monthly payment (derived from a hardcoded 7.49% APR the site
 * elsewhere swears it does not publish), the amber "Get Price" that gated a price printed
 * beside it, and the second badge cluster that made the Escape say "Certified Pre-Owned"
 * twice.
 */
export function VehicleCard({
  v,
  layout = "tile",
  compared,
  onToggleCompare,
  showSaving = true,
  enquireVariant = "primary",
}: {
  v: Vehicle;
  layout?: "row" | "tile";
  compared?: boolean;
  onToggleCompare?: (v: Vehicle) => void;
  /**
   * Suppresses BOTH the struck-through MSRP and the "$N below MSRP" line. The homepage passes
   * false: nothing in dealerContent.ts backs a specific per-vehicle saving, and the msrp
   * values in the placeholder records are not real numbers.
   */
  showSaving?: boolean;
  /**
   * The homepage runs a one-filled-button rule, so four cards there pass "secondary" rather
   * than putting four primaries on a page whose single primary is the search submit.
   */
  enquireVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const imageName = imageNameFromSrc(v.image);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(isSaved(v.id));
    sync();
    window.addEventListener(GARAGE_EVENT, sync);
    return () => window.removeEventListener(GARAGE_EVENT, sync);
  }, [v.id]);

  const title = `${v.year} ${v.make} ${v.model} ${v.trim}`;
  const isRow = layout === "row";
  const saving = v.msrp && v.msrp > v.price ? v.msrp - v.price : 0;

  /**
   * Window-sticker rows. Label left, figure right, ruled between, figures monospaced.
   *
   * This is the one structural decision specific to buying a car. A Monroney label is the
   * document every buyer already meets at the glass, it exists in exactly one industry, and
   * it cannot be lifted onto another business. The card is that sticker cropped to three
   * rows; the lead dialog rail is four; the vehicle page is the whole thing.
   *
   * Icons are gone from here. Each one restated the word next to it, which is decoration.
   */
  const paint = paintSwatch(v.exterior);
  const accent = modelAccent(v.model);
  const specs: { label: string; value: string }[] = [
    {
      label: "Odometer",
      value: v.miles < 100 ? "Delivery miles" : `${v.miles.toLocaleString("en-US")} mi`,
    },
    { label: "Drivetrain", value: v.drivetrain },
    { label: v.fuel === "Electric" ? "Range" : "Economy", value: v.mpg },
    { label: "Output", value: `${v.horsepower} hp` },
  ];

  const photograph = (
    <div className={cn("relative overflow-hidden bg-ink", isRow ? "lg:h-full" : "")}>
      <div className={cn(isRow ? "aspect-[4/3] lg:h-full lg:aspect-auto" : "aspect-[4/3]")}>
        {imageName ? (
          <ResponsiveImage
            name={imageName}
            alt={`${v.condition} ${title} for sale at AM Ford`}
            sizes={isRow ? "(min-width: 1024px) 500px, 100vw" : "(min-width: 640px) 33vw, 100vw"}
            aspect={{ width: 4, height: 3 }}
            className="h-full w-full object-cover transition-transform duration-600 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <img
            src={v.image}
            alt={`${v.condition} ${title} for sale at AM Ford`}
            width={1280}
            height={960}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="absolute left-4 top-4">
        <Chip tone="onDark" size="sm">
          {v.condition}
        </Chip>
      </div>
      {accent && (
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1"
          style={{ backgroundColor: accent }}
        />
      )}
    </div>
  );

  const actions = (
    <div className="relative z-10 flex flex-wrap items-center gap-x-1 gap-y-2">
      <VehicleLeadDialog vehicle={v} intent="enquiry" showSaving={showSaving}>
        <Button variant={enquireVariant} size={isRow ? "md" : "sm"}>
          Enquire
          <span className="sr-only"> about the {title}</span>
        </Button>
      </VehicleLeadDialog>

      <button
        type="button"
        onClick={() => toggleSaved(v.id)}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${v.year} ${v.model} from saved` : `Save ${v.year} ${v.model}`}
        className={cn(
          "ml-1 inline-flex h-9 items-center gap-1.5 rounded-sm px-2.5 font-sans text-meta font-semibold transition-colors",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
          saved ? "text-brand" : "text-ink-3 hover:bg-surface hover:text-ink",
        )}
      >
        <IconTag filled={saved} className="h-4 w-4" />
        {saved ? "Saved" : "Save"}
      </button>

      {onToggleCompare && (
        <button
          type="button"
          onClick={() => onToggleCompare(v)}
          aria-pressed={compared}
          aria-label={
            compared
              ? `Remove ${v.year} ${v.model} from comparison`
              : `Add ${v.year} ${v.model} to comparison`
          }
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-sm px-2.5 font-sans text-meta font-semibold transition-colors",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
            compared ? "text-brand" : "text-ink-3 hover:bg-surface hover:text-ink",
          )}
        >
          {compared ? <IconCheck className="h-4 w-4" /> : <IconCompare className="h-4 w-4" />}
          Compare
        </button>
      )}
    </div>
  );

  const sticker = (
    <dl className={cn("border-t border-rule", isRow && "sm:grid sm:grid-cols-2 sm:gap-x-8")}>
      {(isRow ? specs : specs.slice(0, 3)).map((spec) => (
        <div
          key={spec.label}
          className={cn(
            "flex items-baseline justify-between gap-4 border-b border-rule py-2",
            isRow ? "px-6 sm:odd:border-r sm:odd:pr-8" : "px-4",
          )}
        >
          <dt className="font-sans text-meta text-ink-3">{spec.label}</dt>
          <dd className="font-mono text-figure font-medium tabular-nums text-ink">{spec.value}</dd>
        </div>
      ))}

      {/* Paint. The one row whose value IS a colour, so it renders as one. A swatch is drawn
          only for a name we have mapped: an unknown paint shows the name alone rather than a
          guessed colour, because a red chip on a white truck is worse than no chip. */}
      <div
        className={cn(
          "flex items-baseline justify-between gap-4 border-b border-rule py-2",
          isRow ? "px-6" : "px-4",
        )}
      >
        <dt className="font-sans text-meta text-ink-3">Paint</dt>
        <dd className="flex items-center gap-2 font-sans text-ui font-medium text-ink">
          {paint && (
            <span
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 rounded-sm border border-ink/15"
              style={{ backgroundColor: paint }}
            />
          )}
          {v.exterior}
        </dd>
      </div>
    </dl>
  );

  return (
    <article
      className={cn(
        "group relative border border-rule bg-white transition-colors duration-200 hover:border-ink/25",
        isRow ? "grid lg:grid-cols-12" : "flex flex-col",
      )}
    >
      <div className={cn(isRow && "lg:col-span-5")}>{photograph}</div>

      <div className={cn("flex flex-col", isRow ? "lg:col-span-7 lg:justify-center" : "flex-1")}>
        <div className={cn(isRow ? "px-6 pb-4 pt-6" : "px-4 pb-3 pt-4")}>
          <div className="flex items-center justify-between font-sans text-micro font-bold uppercase tracking-[0.09em] text-ink-3">
            <span>
              {v.year} {v.make}
            </span>
            {v.stockNumber && (
              <span className="font-mono normal-case tracking-normal">Stock {v.stockNumber}</span>
            )}
          </div>

          {/* Fixed height, deliberately. Model names run from "Bronco" to "Mustang Mach-E GT",
              and letting the name push the price down means a column of cards has its prices
              at five different offsets. Pinning it is what makes the grid scan as a price
              list, which is how someone actually shops a lot. */}
          <h3
            className={cn(
              "mt-1 flex items-start font-sans font-bold leading-tight text-ink",
              isRow ? "text-h2" : "min-h-[3.25rem] text-h3",
            )}
          >
            <span>
              <Link
                to="/vehicle/$id"
                params={{ id: v.id }}
                className="after:absolute after:inset-0 focus-visible:outline-none"
              >
                {v.model}
              </Link>{" "}
              <span className="font-normal text-ink-3">{v.trim}</span>
            </span>
          </h3>
        </div>

        {/* The price sits on its own ruled row, the way it sits at the top of a sticker. */}
        <div
          className={cn(
            "flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-rule",
            isRow ? "px-6 py-3" : "px-4 py-2.5",
          )}
        >
          <p
            className={cn(
              "font-mono font-semibold tabular-nums text-brand",
              isRow ? "text-figure-lg" : "text-figure-lg",
            )}
          >
            ${v.price.toLocaleString("en-US")}
          </p>
          {showSaving && saving > 0 && (
            <>
              <p className="font-mono text-figure tabular-nums text-ink-3 line-through">
                ${v.msrp!.toLocaleString("en-US")}
              </p>
              {/* Derived (msrp - price), never authored. No msrp on the record, no claim. */}
              <p className="ml-auto inline-flex items-center gap-1.5 rounded-sm bg-sage-tint px-2 py-1 font-sans text-meta font-semibold text-sage-deep">
                <IconSavings className="h-3.5 w-3.5" />${saving.toLocaleString("en-US")} below MSRP
              </p>
            </>
          )}
        </div>

        {/* THE PRICE ASK, and it belongs to the price.
            It used to sit forty pixels lower in its own band at bg-brand/[0.04] — a 4% tint,
            the same height and weight as a spec row, so the highest-intent action on the card
            read as a fourth row of data and got skipped. It also carried a padlock, which
            implies the lower price is gated behind the form. The price is printed two rows
            above it. That is the "Unlock Your Instant Price" premise we deleted, in miniature.

            Now it is navy, semibold, underlined, 44px, and directly under the number it is
            asking about. The listed price stays visible: what is genuinely unknown until
            someone asks is the NEGOTIATED number, which is why the question is honest. */}
        <div className={cn("relative z-10", isRow ? "px-6 pb-4" : "px-4 pb-3")}>
          <VehicleLeadDialog vehicle={v} intent="price" showSaving={showSaving}>
            <button
              type="button"
              className="group/price inline-flex min-h-11 items-center gap-1.5 font-sans text-ui font-semibold text-brand underline decoration-brand/30 underline-offset-4 transition-colors hover:text-brand-deep hover:decoration-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Ask for a better price
              <IconArrowRight className="h-4 w-4 transition-transform duration-150 group-hover/price:translate-x-0.5" />
              <span className="sr-only">on the {title}</span>
            </button>
          </VehicleLeadDialog>
        </div>

        {sticker}

        <div className={cn(isRow ? "px-6 py-4" : "mt-auto p-4")}>{actions}</div>
      </div>
    </article>
  );
}
