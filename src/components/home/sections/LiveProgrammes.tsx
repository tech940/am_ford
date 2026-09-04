import { Link } from "@tanstack/react-router";
import { activeIncentives } from "@/lib/dealerContent";
import { Button, IconArrowRight } from "@/components/ledger";

/**
 * S3 — the Ford programmes that are actually running.
 *
 * WHY THIS EXISTS. Four real incentives live in `dealerContent.ts`, each with the programme
 * number Ford issued, the end date Ford stated, and Ford's own disclaimer verbatim. The
 * homepage rendered exactly ONE of them, inside a collapsed `<details>` in the hero. Three
 * sourced, dated, evidenced offers appeared nowhere on the site.
 *
 * That is the rarest thing on a dealership homepage: promotional content that is completely
 * true. Most of what a dealer site says about offers is invented, which is why this project
 * spent so long deleting "$500 off" in four contradictory wordings. These four are the
 * opposite, and they were the content being left on the floor.
 *
 * IT EXPIRES BY ITSELF. `activeIncentives` filters on each row's stated `endsOn`, so the day a
 * programme lapses it stops rendering, and when the last one lapses the whole section returns
 * null rather than leaving an empty heading over a rule. Nothing in the page layout depends on
 * it being here, which is the condition for putting dated content on a homepage at all.
 *
 * Every disclaimer is reachable, verbatim, in the row it belongs to. A programme number with
 * no terms attached is the thing regulators object to.
 */
export function LiveProgrammes() {
  const offers = activeIncentives(new Date());
  if (offers.length === 0) return null;

  const fmt = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return (
    <section aria-labelledby="programmes-title" className="border-b border-rule bg-brand-tint">
      <div className="reveal mx-auto max-w-[1280px] px-5 py-14 sm:px-10 lg:px-16 lg:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-sans text-micro font-bold uppercase tracking-[0.09em] text-ink-3">
              From Ford, not from us
            </p>
            <h2 id="programmes-title" className="mt-2 font-display text-h2 font-bold text-ink">
              Programmes running right now
            </h2>
          </div>
          <p className="font-mono text-figure tabular-nums text-ink-2">{offers.length} active</p>
        </div>

        <ul className="mt-8 border-t border-ink/10">
          {offers.map((o) => (
            <li key={o.id} className="border-b border-ink/10 py-5">
              <div className="flex flex-col gap-x-8 gap-y-2 lg:flex-row lg:items-baseline">
                <h3 className="min-w-0 flex-1 font-sans text-h3 font-bold leading-snug text-ink">
                  {o.label}
                </h3>
                <p className="font-mono text-figure tabular-nums text-ink-2 lg:w-40 lg:shrink-0">
                  {o.programme}
                </p>
                <p className="font-mono text-figure tabular-nums text-ink-2 lg:w-52 lg:shrink-0 lg:text-right">
                  Ends {fmt(o.endsOn)}
                </p>
              </div>

              <p className="mt-2 max-w-[68ch] font-sans text-body leading-relaxed text-ink-2">
                {o.detail}
              </p>

              {/* The terms travel with the offer. A programme number printed without its
                  disclaimer is the part that gets a dealership in trouble. */}
              <details className="group mt-2">
                <summary className="inline-flex min-h-8 cursor-pointer list-none items-center font-sans text-meta font-semibold text-brand underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
                  <span className="group-open:hidden">Programme terms</span>
                  <span className="hidden group-open:inline">Hide terms</span>
                </summary>
                <p className="mt-2 max-w-[74ch] font-sans text-meta leading-relaxed text-ink-3">
                  {o.disclaimer}
                </p>
              </details>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Button asChild variant="secondary" size="lg">
            <Link to="/inventory" search={{ condition: "New" }}>
              See the new vehicles these apply to
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
