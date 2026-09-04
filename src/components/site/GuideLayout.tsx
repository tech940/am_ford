import { type ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { SectionTag } from "@/components/site/SectionTag";

/**
 * Presentation shell for the /guides articles (spec Template F).
 *
 * The guides are long-form editorial pages, so they share one narrow measure, one heading
 * scale, and one FAQ treatment. Keeping that here means a change to the reading experience
 * happens in one file instead of four, and it keeps each route file as prose plus links
 * rather than repeated markup.
 *
 * Nothing in here holds content. Every word a guide publishes lives in its own route file,
 * because the brief requires each page to carry information the others do not.
 */

export type GuideFaq = { q: string; a: string };

/** Shared button styling so guide CTAs match the model and delivery pages. */
export const guideCtaPrimary =
  "inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-bold " +
  "text-white transition hover:bg-brand-deep";

export const guideCtaSecondary =
  "inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 " +
  "text-sm font-bold text-ink transition hover:bg-slate-50";

/** Inline anchor inside body copy. Anchor text is always descriptive, never "learn more". */
export const guideInlineLink =
  "font-semibold text-brand underline decoration-brand/30 underline-offset-2 " +
  "transition hover:decoration-brand";

/** The single H1 on the page, plus the direct answer that follows it. */
export function GuideHero({
  tag,
  title,
  published,
  children,
}: {
  tag: string;
  title: string;
  /** Human-readable publication date, e.g. "August 7, 2026". */
  published: string;
  children: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 py-14 sm:py-20">
      <div className="absolute inset-0 bg-gradient-soft" />
      <div className="relative mx-auto max-w-3xl px-6">
        <SectionTag>{tag}</SectionTag>
        <h1 className="display mt-3 text-balance text-3xl text-ink sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {children}
        </div>
        <p className="mt-7 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Published {published} by the AM Ford sales team
        </p>
      </div>
    </section>
  );
}

/** Wrapper for the body of an article. Sections inside space themselves. */
export function GuideBody({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-3xl px-6 py-14 sm:py-20">{children}</div>;
}

/** One H2 section of an article. */
export function GuideSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="mt-12 first:mt-0">
      <h2 className="display text-2xl text-ink sm:text-3xl">{heading}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {children}
      </div>
    </section>
  );
}

/** Bulleted list inside a section. */
export function GuideList({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2.5 pl-5 marker:text-brand/50">{children}</ul>;
}

/** A pulled-out checklist card, used where a section is a list of things to verify. */
export function GuideCallout({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl bg-card p-6 ring-1 ring-border sm:p-7">
      <h3 className="text-base font-bold text-ink">{heading}</h3>
      <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

/**
 * Visible FAQ block. Always pass the same array the route feeds to faqSchema(), never a
 * copy: Google treats FAQ structured data that is not visible on the page as a violation.
 */
export function GuideFaqs({ faqs, heading }: { faqs: GuideFaq[]; heading: string }) {
  return (
    <section className="border-t border-border bg-surface-2/60 py-14 sm:py-20">
      <div className="mx-auto max-w-3xl px-6">
        <SectionTag>Frequently Asked</SectionTag>
        <h2 className="display mt-3 text-2xl sm:text-3xl">{heading}</h2>
        <dl className="mt-8 space-y-4">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-2xl bg-card p-6 ring-1 ring-border">
              <dt className="flex items-start gap-3 text-base font-bold text-ink">
                <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                {f.q}
              </dt>
              <dd className="mt-2 pl-7 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** Closing call to action. Pass the links as children so each guide sends people onward. */
export function GuideCta({
  heading,
  body,
  children,
}: {
  heading: string;
  body: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-3xl px-6">
        <div className="rounded-3xl bg-card p-7 ring-1 ring-border sm:p-9">
          <h2 className="display text-xl text-ink sm:text-2xl">{heading}</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">{body}</div>
          <div className="mt-6 flex flex-wrap gap-3">{children}</div>
        </div>
      </div>
    </section>
  );
}
