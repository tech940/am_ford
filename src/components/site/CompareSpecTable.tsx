import type { Vehicle } from "@/lib/vehicles";

/**
 * Side-by-side spec table for the /compare/ pages.
 *
 * Every cell is read from a real field on a Vehicle record in @/lib/vehicles. Nothing is
 * derived, estimated, or looked up elsewhere: no towing ratings, no payload, no cargo
 * volume, no dimensions. If a figure is not on the record, it does not belong on the page.
 *
 * The table is wrapped in an overflow-x-auto container and given a min width, so three
 * columns stay readable on a 320px screen by scrolling inside the card rather than
 * stretching the document and creating horizontal page overflow.
 */

const nf = (n: number) => n.toLocaleString("en-US");

/** Column heading for a vehicle, e.g. "2025 Ford Explorer ST". */
export const vehicleLabel = (v: Vehicle) => `${v.year} ${v.make} ${v.model} ${v.trim}`;

const odometer = (v: Vehicle) =>
  v.miles < 50 ? `${nf(v.miles)} miles (delivery mileage)` : `${nf(v.miles)} miles`;

/** The mpg field carries a range string on electric vehicles, so it is printed as-is. */
const economy = (v: Vehicle) => (v.fuel === "Electric" ? v.mpg : `${v.mpg} MPG`);

const ROWS: { label: string; get: (v: Vehicle) => string }[] = [
  { label: "Condition", get: (v) => v.condition },
  { label: "Listed price", get: (v) => `$${nf(v.price)}` },
  { label: "Odometer", get: odometer },
  { label: "Body type", get: (v) => v.type },
  { label: "Fuel", get: (v) => v.fuel },
  { label: "Drivetrain", get: (v) => v.drivetrain },
  { label: "Transmission", get: (v) => v.transmission },
  { label: "Fuel economy or range", get: economy },
  { label: "Horsepower", get: (v) => `${nf(v.horsepower)} hp` },
  { label: "Exterior", get: (v) => v.exterior },
  { label: "Interior", get: (v) => v.interior },
];

export function CompareSpecTable({ a, b, caption }: { a: Vehicle; b: Vehicle; caption: string }) {
  return (
    <div className="mt-8 overflow-x-auto rounded-3xl bg-card ring-1 ring-border">
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border bg-surface-2/60">
            <th
              scope="col"
              className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground sm:px-6"
            >
              Specification
            </th>
            <th scope="col" className="px-4 py-4 font-bold text-ink sm:px-6">
              {vehicleLabel(a)}
            </th>
            <th scope="col" className="px-4 py-4 font-bold text-ink sm:px-6">
              {vehicleLabel(b)}
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label} className="border-b border-border/70 last:border-0">
              <th
                scope="row"
                className="whitespace-nowrap px-4 py-3.5 align-top text-xs font-bold uppercase tracking-wider text-muted-foreground sm:px-6"
              >
                {row.label}
              </th>
              <td className="px-4 py-3.5 align-top font-semibold text-ink sm:px-6">{row.get(a)}</td>
              <td className="px-4 py-3.5 align-top font-semibold text-ink sm:px-6">{row.get(b)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Equipment lists, again straight from the features array on each vehicle record. */
export function CompareFeatureLists({ a, b }: { a: Vehicle; b: Vehicle }) {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2">
      {[a, b].map((v) => (
        <div key={v.id} className="rounded-3xl bg-card p-7 ring-1 ring-border">
          <h3 className="text-lg font-bold text-ink">{vehicleLabel(v)}</h3>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            Equipment listed on this vehicle
          </p>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
            {v.features.map((f) => (
              <li key={f} className="flex gap-2.5">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
