/**
 * Section eyebrow. The small label that sits above a section heading.
 *
 * It used to live in `site/Home.tsx` — a dead, unmounted file that survived only because
 * twenty-one routes imported this one function out of it. Moving it here let that file go.
 *
 * It also used to be a pill: `rounded-full bg-primary/10 text-primary uppercase
 * tracking-widest`. In Ledger a pill radius belongs to `Chip` and nothing else, because
 * roundness means "this is a status" — and a section eyebrow is not a status, it is a label.
 * So it is set the way every other micro label in the system is set, and the tinted capsule
 * is gone.
 */
export function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-sans text-micro font-bold uppercase tracking-[0.09em] text-ink-3">
      {children}
    </span>
  );
}
