import { cn } from "@/lib/utils";

/**
 * Specification as a description list, ruled and set in tabular figures.
 *
 * A vehicle's specification is reference data, and reference data belongs in a ledger, not
 * in a grid of shadowed boxes. The previous surfaces rendered odometer, drivetrain, economy
 * and output as four separate bordered cards with icons, which spent a lot of ink to say
 * very little and made two vehicles impossible to scan against each other.
 *
 * `tabular-nums` matters more here than it looks: it is what lets a column of prices and
 * mileages line up digit-for-digit down the page.
 */
export type Spec = {
  label: string;
  value: React.ReactNode;
  /** Marks a value that differs from the vehicle being compared against. */
  emphasis?: boolean;
};

export function SpecTable({
  specs,
  columns = 1,
  className,
}: {
  specs: Spec[];
  /** Two columns on wide surfaces; always one below sm. */
  columns?: 1 | 2;
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid border-t border-rule",
        columns === 2 ? "sm:grid-cols-2 sm:gap-x-10" : "grid-cols-1",
        className,
      )}
    >
      {specs.map((s) => (
        <div
          key={s.label}
          className="flex items-baseline justify-between gap-6 border-b border-rule py-2.5"
        >
          <dt className="font-sans text-meta text-ink-3">{s.label}</dt>
          <dd
            className={cn(
              "text-right font-sans text-ui tabular-nums",
              s.emphasis ? "font-bold text-ink" : "font-medium text-ink",
            )}
          >
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Side-by-side comparison. Rows are attributes, columns are vehicles, and values that differ
 * are the only ones set in bold — so the eye lands on the difference rather than re-reading
 * everything the two have in common.
 */
export function CompareTable({
  headings,
  rows,
  className,
}: {
  headings: string[];
  rows: { label: string; values: React.ReactNode[] }[];
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[32rem] border-collapse font-sans">
        <thead>
          <tr>
            <th scope="col" className="w-[9rem] border-b-2 border-ink px-3 py-2.5 text-left">
              <span className="sr-only">Specification</span>
            </th>
            {headings.map((h) => (
              <th
                key={h}
                scope="col"
                className="border-b-2 border-ink px-3 py-2.5 text-left text-ui font-bold text-ink"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            // A row where every value is identical carries no decision information.
            const distinct = new Set(r.values.map((v) => String(v))).size > 1;
            return (
              <tr key={r.label}>
                <th
                  scope="row"
                  className="border-b border-rule px-3 py-2.5 text-left text-meta font-medium text-ink-3"
                >
                  {r.label}
                </th>
                {r.values.map((v, i) => (
                  <td
                    key={i}
                    className={cn(
                      "border-b border-rule px-3 py-2.5 text-ui tabular-nums",
                      distinct ? "font-bold text-ink" : "font-normal text-ink-2",
                    )}
                  >
                    {v}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
