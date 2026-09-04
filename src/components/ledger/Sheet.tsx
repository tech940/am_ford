import * as DialogPrimitive from "@radix-ui/react-dialog";
import { IconClose } from "./icons";
import { cn } from "@/lib/utils";

/**
 * Edge-anchored panel: the mobile navigation and the inventory filter drawer.
 *
 * Same Radix root as Dialog, so it inherits the same focus trap, Escape handling, scroll
 * lock and `aria-modal`. It shares Dialog's single z tier deliberately — the previous nav
 * sheet sat at `z-60` above a lead modal at `z-50`, which meant opening the menu covered a
 * form the visitor was mid-way through.
 *
 * Filters apply live rather than on a Save button; the footer offers Clear and Done, and
 * Done is a dismissal, not a commit.
 */
export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  side?: "left" | "right" | "bottom";
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          "fixed inset-0 z-50 bg-ink/55",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        )}
      />
      <DialogPrimitive.Content
        // Radix conveys modality by marking every sibling aria-hidden, which is the
        // stronger mechanism and is working. aria-modal is added on top because some
        // older screen readers still key off the attribute rather than the sibling tree.
        aria-modal="true"
        className={cn(
          "fixed z-50 flex flex-col border-rule bg-white",
          "shadow-[0_1px_2px_rgba(26,23,20,0.04),0_24px_60px_-24px_rgba(26,23,20,0.35)]",
          "focus:outline-none",
          "data-[state=open]:animate-in data-[state=open]:duration-250",
          "data-[state=closed]:animate-out data-[state=closed]:duration-180",
          side === "right" &&
            "inset-y-0 right-0 w-[min(24rem,calc(100vw-3rem))] border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
          side === "left" &&
            "inset-y-0 left-0 w-[min(24rem,calc(100vw-3rem))] border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
          side === "bottom" &&
            "inset-x-0 bottom-0 max-h-[85dvh] border-t data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn(
            "absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-sm text-ink-3",
            "transition-colors hover:bg-surface hover:text-ink",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
          )}
        >
          <IconClose className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-1 border-b border-rule px-5 py-4 pr-16", className)}
      {...props}
    />
  );
}

export function SheetTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("font-sans text-h3 font-bold text-ink", className)}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description className={cn("text-meta text-ink-2", className)} {...props} />
  );
}

export function SheetBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 overflow-y-auto px-5 py-4", className)} {...props} />;
}

export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex gap-2 border-t border-rule px-5 py-4", className)} {...props} />;
}
