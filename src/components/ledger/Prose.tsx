import { cn } from "@/lib/utils";

/**
 * Long-form reading surface for guides, comparisons and area pages.
 *
 * The measure is the point. Running text on the old content routes ran the full container
 * width, which on a 1440px screen put well over 120 characters on a line. Capping at 68ch
 * is the single biggest legibility change available on seventeen content routes, and it
 * costs one class.
 */
export function Prose({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "max-w-[68ch] text-body text-ink-2",
        "[&>*+*]:mt-4",
        "[&_h2]:mt-10 [&_h2]:font-sans [&_h2]:text-h2 [&_h2]:font-bold [&_h2]:text-ink",
        "[&_h3]:mt-8 [&_h3]:font-sans [&_h3]:text-h3 [&_h3]:font-bold [&_h3]:text-ink",
        "[&_p]:leading-relaxed",
        "[&_strong]:font-bold [&_strong]:text-ink",
        "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_li]:mt-1.5 [&_li]:marker:text-ink-3",
        "[&_a]:text-brand [&_a]:underline [&_a]:underline-offset-[3px] hover:[&_a]:text-brand-deep",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Section heading with an optional lead paragraph.
 *
 * Deliberately has no eyebrow slot. The old `SectionTag` component put a small tracked label
 * above almost every heading on the site — twenty-one routes imported it — which is
 * decoration standing in for hierarchy. If a section needs explaining, the heading is wrong.
 */
export function SectionHeading({
  title,
  lead,
  as: Tag = "h2",
  align = "left",
  id,
  className,
}: {
  title: React.ReactNode;
  lead?: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  align?: "left" | "center";
  /** Set this and point the owning `<section aria-labelledby>` at it. */
  id?: string;
  className?: string;
}) {
  const size = Tag === "h1" ? "text-h1" : Tag === "h2" ? "text-h2" : "text-h3";
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      <Tag id={id} className={cn("font-sans font-bold text-balance text-ink", size)}>
        {title}
      </Tag>
      {lead && (
        <p
          className={cn(
            "mt-3 max-w-[58ch] text-body leading-relaxed text-ink-2",
            align === "center" && "mx-auto",
          )}
        >
          {lead}
        </p>
      )}
    </div>
  );
}

/**
 * Full-width horizontal rule used to separate page sections.
 * In Ledger this does the job that card borders and drop shadows used to.
 */
export function Rule({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-rule", className)} />;
}
