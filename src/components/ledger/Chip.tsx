import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Status chip. The ONLY component in the system allowed a pill radius.
 *
 * In Ledger, roundness means state rather than structure: everything structural is square,
 * so a fully rounded shape reads as "this is a status" without needing colour to say it.
 * That rule is also what stops chips being used as decoration, which is how the old cards
 * ended up double-badged — the Escape carried "Certified Pre-Owned" twice and the Lightning
 * showed "Electric" and "EV" simultaneously.
 *
 * A chip states one fact about the thing it sits on. If it is not a fact about state,
 * it is not a chip.
 */
const chip = cva(
  "inline-flex items-center gap-1.5 rounded-full font-sans font-bold uppercase tracking-[0.07em] whitespace-nowrap",
  {
    variants: {
      tone: {
        /** In stock, ready, delivered. */
        available: "bg-available/10 text-available",
        /** Condition and provenance: New, Certified Pre-Owned. */
        condition: "bg-brand/10 text-brand",
        /** High-value highlights, special rates, savings callouts. */
        /** Everything factual and unemphatic: body style, fuel, drivetrain. */
        neutral: "bg-surface text-ink-2",
        /** Sold, unavailable, action required. Never used for emphasis. */
        attention: "bg-attention/10 text-attention",
        /** On a photograph or the navy ground. */
        /* 90% white is already opaque enough to hold ink on any photograph; the blur was
           glassmorphism doing nothing but costing a composite layer. */
        onDark: "bg-white/95 text-ink",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-1 text-micro",
      },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  },
);

export interface ChipProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof chip> {
  /** Renders a filled dot before the label. Availability only. */
  dot?: boolean;
}

export function Chip({ className, tone, size, dot = false, children, ...props }: ChipProps) {
  return (
    <span className={cn(chip({ tone, size }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}
