import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { vehicles, dealerInfo, type Vehicle } from "@/lib/vehicles";
import { cn } from "@/lib/utils";

/**
 * The stock manifest: every vehicle on the lot, disclosed in full, as ruled rows.
 *
 * This is the page's thesis in one section. A six-vehicle grid reads as a thin
 * selection and invites "is that all?"; the same six as a complete, ruled manifest
 * read as total disclosure and invite trust. The count is stated openly at the top
 * for exactly that reason, rather than hidden behind a "featured" label that implies
 * more stock exists somewhere off screen.
 *
 * Rows, not cards. Cards would float six objects on a wash and say nothing; rules
 * align them into a document you can read down a column of, which is how anyone who
 * buys a truck for work already reads a spec sheet.
 */

const money = (n: number) => "$" + n.toLocaleString("en-US");

/** Odometer, in the language a manifest uses. Delivery miles are a fact, not a boast. */
const odometer = (v: Vehicle) =>
  v.miles < 100 ? `${v.miles} mi` : `${v.miles.toLocaleString("en-US")} mi`;

function ManifestRow({ v, index }: { v: Vehicle; index: number }) {
  return (
    <Link
      to="/vehicle/$id"
      params={{ id: v.id }}
      className={cn(
        "lg-row lg-rule group grid items-baseline gap-x-4 gap-y-2 border-t px-3 py-5 sm:px-4",
        // 12-column manifest on desktop; on phones it folds to two readable rows.
        "grid-cols-[1fr_auto] sm:grid-cols-[2.25rem_minmax(0,1fr)_7rem_5.5rem_6.5rem_1.25rem]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]",
        "focus-visible:outline-[var(--ink)]",
      )}
    >
      {/* The unit number is information here, not decoration: it is the reader's
          place in a list whose full length is stated above. */}
      <span className="lg-fig hidden text-[13px] font-semibold text-ink/35 sm:block">
        {String(index + 1).padStart(2, "0")}
      </span>

      <span className="min-w-0">
        <span className="block text-[17px] font-bold leading-tight text-ink sm:text-lg">
          {v.year} {v.make} {v.model}
        </span>
        <span className="mt-1 block text-[13px] leading-snug text-ink/55">
          {v.trim} · {v.exterior}
        </span>
      </span>

      <span className="lg-fig hidden text-[13px] font-medium text-ink/65 sm:block">
        {v.condition === "Certified Pre-Owned" ? "Certified" : v.condition}
      </span>

      <span className="lg-fig hidden text-[13px] font-medium text-ink/65 sm:block">
        {v.drivetrain} · {v.fuel}
      </span>

      <span className="text-right sm:text-left">
        <span className="lg-fig block text-[17px] font-bold text-ink sm:text-lg">
          {money(v.price)}
        </span>
        <span className="lg-fig mt-1 block text-[13px] text-ink/50">{odometer(v)}</span>
      </span>

      <ArrowUpRight
        className="hidden h-4 w-4 shrink-0 self-center text-ink/25 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink/70 sm:block"
        aria-hidden
      />
    </Link>
  );
}

export function StockLedger() {
  const total = vehicles.length;
  const newCount = vehicles.filter((v) => v.condition === "New").length;
  const usedCount = vehicles.filter((v) => v.condition === "Used").length;
  const cpoCount = vehicles.filter((v) => v.condition === "Certified Pre-Owned").length;
  const validPrices = vehicles.map((v) => v.price).filter((p) => p > 0);
  const low = validPrices.length ? Math.min(...validPrices) : 0;
  const high = validPrices.length ? Math.max(...validPrices) : 0;

  return (
    <section
      className="relative z-10 mx-auto max-w-6xl px-6 py-24 sm:py-32"
      aria-labelledby="stock-manifest"
    >
      <div className="lg-rule-strong flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b pb-5">
        <h2 id="stock-manifest" className="lg-display text-4xl text-ink sm:text-5xl">
          Everything on the lot
        </h2>
        <p className="lg-fig text-[13px] font-medium text-ink/55">
          {total} vehicles · {newCount} new, {usedCount} used, {cpoCount} certified · {money(low)} to {money(high)}
        </p>
      </div>

      {/* Column headers. A manifest names its columns; this is a table heading
          carrying real information, not an eyebrow stacked above a headline. */}
      <div className="hidden grid-cols-[2.25rem_minmax(0,1fr)_7rem_5.5rem_6.5rem_1.25rem] gap-x-4 px-3 pb-2 pt-5 sm:grid sm:px-4">
        <span className="lg-col">No.</span>
        <span className="lg-col">Vehicle</span>
        <span className="lg-col">Condition</span>
        <span className="lg-col">Drive</span>
        <span className="lg-col">Price</span>
        <span aria-hidden />
      </div>

      <div className="lg-rule border-b">
        {vehicles.slice(0, 8).map((v, i) => (
          <ManifestRow key={v.id} v={v} index={i} />
        ))}
      </div>

      <p className="mt-6 max-w-[68ch] text-[15px] leading-relaxed text-ink/65">
        Here is a sample of our active inventory. We are one store at {dealerInfo.address}, so
        what is listed here is what is standing on the ground in {dealerInfo.locality} today. If the
        right vehicle is not among these, explore our full inventory of {total} vehicles or tell us what you need and we will source it.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
        <Link
          to="/inventory"
          className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-ink px-7 text-sm font-bold text-white transition-colors hover:bg-ink/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Filter the full inventory
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>
        <Link
          to="/contact"
          className="text-sm font-semibold text-ink underline decoration-ink/25 underline-offset-4 transition-colors hover:decoration-ink"
        >
          Tell us what you are looking for
        </Link>
      </div>
    </section>
  );
}
