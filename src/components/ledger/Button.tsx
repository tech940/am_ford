import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * The single button in the system.
 *
 * The audit found four border radii, three button languages and six close-button treatments
 * across the overlay layer alone, plus a vehicle page stacking three co-equal filled buttons.
 * Hierarchy here is carried by exactly one filled variant: if two `primary` buttons appear in
 * the same view, that is the design error, not a styling choice.
 *
 * Sentence case, not uppercase. The old surfaces shouted every label in tracked caps, which
 * flattens "Book test drive" and "No thanks" into the same register.
 */
const button = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm active:translate-y-px",
    "font-sans font-semibold transition-colors duration-150",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
    "disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        /** One per view. The thing we want the visitor to do. */
        primary: "bg-brand text-white hover:bg-brand-deep",
        /** Real alternatives that are not the main path. */
        secondary: "border border-ink/25 bg-transparent text-ink hover:border-ink hover:bg-ink/5",
        /** Tertiary, inline, or repeated-in-a-list actions. */
        quiet: "bg-transparent text-ink-2 hover:bg-ink/5 hover:text-ink",
        /** Destructive only. Never used for emphasis. */
        danger: "bg-attention text-white hover:brightness-110",
        /** Sits on a photograph or the navy ground. */
        inverse: "bg-white text-brand hover:bg-surface",
      },
      size: {
        /** 36px. Dense rows and toolbars only, never a primary action. */
        sm: "h-9 px-3 text-meta",
        /** 44px. The default, and the comfortable touch target. */
        md: "h-11 px-5 text-ui",
        /** 52px. Page-level primary actions. */
        lg: "h-13 px-7 text-ui",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", block: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof button> {
  /** Render as the child element (a Link, an anchor) while keeping button styling. */
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, block, asChild = false, type, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      // A button inside a form defaults to submit. The audit found service-page day and time
      // chips omitting this, so choosing an appointment time submitted the booking.
      type={asChild ? undefined : (type ?? "button")}
      className={cn(button({ variant, size, block }), className)}
      {...props}
    />
  );
});

export { button as buttonVariants };
