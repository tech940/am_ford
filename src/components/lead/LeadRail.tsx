import { useState } from "react";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import { DELIVERY_SHORT, dealerInfo } from "@/lib/vehicles";
import { Chip, IconPhone, IconPin, IconSavings, SpecTable, type Spec } from "@/components/ledger";
import { cn } from "@/lib/utils";

/**
 * The left column of the lead dialog: the vehicle the message is about.
 *
 * THE IDEA. The old lead surfaces knew everything about the vehicle — the photograph, the
 * price, the spec, a paragraph of hand-written notes about that exact truck — and rendered a
 * title, four inputs and a button. This is the correction. The dialog is a one-page document
 * about one vehicle, and the rail is the document half.
 *
 * It is also the anchor. The same node renders through idle, sending, success and failure, so
 * the panel cannot change height when the form is replaced by the receipt, and the customer
 * can see what they asked about while they read what happens next.
 *
 * On a phone it collapses to a band across the top: photo, name, price, one line of spec.
 * Everything below `mobileSpec` is `hidden sm:block`, and the band is capped at 96px, because
 * the form must never be the thing that gives up height first.
 */
/** Whole sentences up to `budget` characters, and always at least the first one. */
function excerptOf(notes: string, budget: number): string {
  const sentences = notes.split(/(?<=\.)\s+/);
  const out = [sentences[0]];
  for (const s of sentences.slice(1)) {
    if (out.join(" ").length + 1 + s.length > budget) break;
    out.push(s);
  }
  return out.join(" ");
}

export function LeadRail({
  imageName,
  imageSrc,
  condition,
  eyebrow,
  name,
  sub,
  price,
  msrp,
  showSaving = true,
  specs,
  mobileSpec,
  notes,
  className,
}: {
  /** Manifest key for a bundled asset. Preferred. */
  imageName?: string;
  /** Raw URL, for feed images that are not in the bundle. Used only when `imageName` is unset. */
  imageSrc?: string;
  condition?: string;
  eyebrow: string;
  name: string;
  /** Trim, set in the same line at normal weight. */
  sub?: string;
  price?: number;
  msrp?: number;
  /** The homepage's distrust of placeholder MSRP values propagates in here. */
  showSaving?: boolean;
  specs?: Spec[];
  mobileSpec?: string;
  notes?: string;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasPhoto = Boolean(imageName || imageSrc) && !imageFailed;

  const saving = showSaving && msrp && price && msrp > price ? msrp - price : 0;

  // Whole sentences, not `line-clamp`. Clamping cuts hand-written prose mid-word and the
  // ellipsis reads as truncated data rather than as an excerpt.
  //
  // Two sentences was the original rule and it was wrong for this data: the F-150's first two
  // run to 280 characters, which is 169px in a 240px column and pushes the rail past the
  // panel. So the budget is characters, and the sentence is the unit that fits inside it.
  const excerpt = notes ? excerptOf(notes, 180) : undefined;

  return (
    <section
      aria-label="Vehicle you are asking about"
      className={cn(
        "flex flex-row items-center gap-3 border-b border-rule bg-surface px-4 py-2.5",
        "sm:h-full sm:flex-col sm:items-stretch sm:gap-0 sm:overflow-hidden",
        "sm:border-b-0 sm:border-r sm:px-0 sm:py-0",
        className,
      )}
    >
      {hasPhoto && (
        // Always ink behind the photograph. A grey box on warm paper reads as a missing image;
        // on ink it reads as a stage, and the model renders are cutouts.
        <div className="relative aspect-[4/3] w-[5.5rem] shrink-0 overflow-hidden bg-ink sm:w-full">
          {imageName ? (
            <ResponsiveImage
              name={imageName}
              alt=""
              sizes="(min-width: 640px) 280px, 88px"
              aspect={{ width: 4, height: 3 }}
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src={imageSrc}
              alt=""
              width={1280}
              height={960}
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover"
            />
          )}

          {condition && (
            <Chip tone="onDark" size="sm" className="absolute left-3 top-3 hidden sm:inline-flex">
              {condition}
            </Chip>
          )}
        </div>
      )}

      <div className={cn("min-w-0 sm:shrink-0 sm:px-5 sm:pb-3", hasPhoto ? "sm:pt-4" : "sm:pt-5")}>
        {/* The band has a hard 96px ceiling, so on a phone the year and make ride inside the
            heading rather than taking a line of their own above it. */}
        <p className="hidden font-sans text-micro font-bold uppercase tracking-[0.09em] text-ink-3 sm:block">
          {eyebrow}
        </p>

        <h3 className="truncate font-sans text-ui font-bold leading-snug text-ink sm:mt-0.5 sm:overflow-visible sm:whitespace-normal sm:text-h3">
          <span className="sm:hidden">{eyebrow} </span>
          {name}
          {sub && <span className="font-normal text-ink-3"> {sub}</span>}
        </h3>

        {price !== undefined && (
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2 sm:mt-1.5">
            {/* Overpass Mono. The largest saturated object in the panel, and set as data. */}
            <span className="font-mono text-figure-lg font-semibold tabular-nums text-brand">
              ${price.toLocaleString("en-US")}
            </span>
            {saving > 0 && (
              <span className="text-meta tabular-nums text-ink-3 line-through">
                ${msrp!.toLocaleString("en-US")}
              </span>
            )}
          </p>
        )}

        {saving > 0 && (
          <p className="mt-1 hidden items-center gap-1.5 text-meta font-semibold text-available sm:flex">
            <IconSavings className="h-3.5 w-3.5" />${saving.toLocaleString("en-US")} below MSRP
          </p>
        )}

        {mobileSpec && <p className="mt-1 text-meta text-ink-2 sm:hidden">{mobileSpec}</p>}
      </div>

      {specs && specs.length > 0 && (
        <SpecTable specs={specs} className="mx-5 hidden shrink-0 sm:grid" />
      )}

      {excerpt && (
        <div className="mt-4 hidden min-h-0 shrink overflow-y-auto sm:block">
          <p className="px-5 font-sans text-micro font-bold uppercase tracking-[0.09em] text-ink-3">
            Notes on this vehicle
          </p>
          <p className="mt-1.5 px-5 text-meta leading-relaxed text-ink-2">{excerpt}</p>
        </div>
      )}

      <div className="mt-auto hidden shrink-0 border-t border-rule px-5 py-3.5 sm:block">
        <p className="flex items-start gap-2 text-meta text-ink-2">
          <IconPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-3" />
          {DELIVERY_SHORT}
        </p>
        <p className="mt-2 flex items-center gap-2 text-meta">
          <IconPhone className="h-3.5 w-3.5 shrink-0 text-ink-3" />
          {/* Not `text-brand`: the accent budget in this panel is the price, the submit fill,
              one supporting rule and the focus rings. Nothing else. */}
          <a
            href={dealerInfo.phoneHref}
            className="font-semibold text-ink-2 underline underline-offset-[3px] hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {dealerInfo.phone}
          </a>
        </p>
      </div>
    </section>
  );
}
