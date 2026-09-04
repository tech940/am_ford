import * as DialogPrimitive from "@radix-ui/react-dialog";
import { IconClose } from "./icons";
import { cn } from "@/lib/utils";

/**
 * The centred modal. One implementation for the whole site.
 *
 * Replaces six bespoke overlays that between them ran eight z-index tiers, five backdrop
 * treatments, five card radii, six close-button treatments and fifty-one inline style
 * objects — and none of which trapped focus, closed on Escape, locked body scroll or
 * announced themselves as dialogs. One of them sat at `z-50`, *below* the navigation sheet
 * at `z-60`, so the nav rendered on top of an open lead modal.
 *
 * Radix supplies every one of those behaviours. Everything below is surface only.
 *
 * Every overlay in the system shares ONE z tier. Stacking order comes from portal order,
 * which is the order things were actually opened.
 */
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  /**
   * `form` is a centred panel, `wide` the same for comparison tables, and `lead` the
   * two-column vehicle document: docked to the bottom edge on a phone, a 280px rail beside
   * the exchange from 640px up. One node across the breakpoint, never two — a resize must not
   * remount the form and throw away what the visitor has typed.
   */
  size = "form",
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  size?: "form" | "wide" | "lead";
}) {
  const isLead = size === "lead";
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          "fixed inset-0 z-50 bg-ink/55",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-160",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-130",
        )}
      />
      <DialogPrimitive.Content
        // Radix conveys modality by marking every sibling aria-hidden, which is the
        // stronger mechanism and is working. aria-modal is added on top because some
        // older screen readers still key off the attribute rather than the sibling tree.
        aria-modal="true"
        className={cn(
          "fixed z-50 border-rule bg-white shadow-[0_1px_2px_rgba(26,23,20,0.04),0_24px_60px_-24px_rgba(26,23,20,0.35)]",
          "focus:outline-none",
          !isLead && [
            "left-1/2 top-1/2 flex max-h-[92dvh] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col border",
            // Enter rises 8px and settles; exit is faster and does not move, so dismissing
            // never feels like it is fighting the pointer.
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-2 data-[state=open]:duration-200",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-150",
            size === "form" ? "max-w-[30rem]" : "max-w-[56rem]",
          ],
          isLead && [
            // Phone: a sheet on the bottom edge. Square, full width, thumb-reachable footer.
            "inset-x-0 bottom-0 flex max-h-[88dvh] w-full flex-col border-t",
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=open]:duration-240",
            "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=closed]:duration-180",
            // 640px up: the centred two-column document.
            "sm:inset-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[calc(100vw-2rem)] sm:max-w-[44rem]",
            "sm:max-h-[92dvh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:border",
            "sm:grid sm:grid-cols-[17.5rem_minmax(0,1fr)] sm:grid-rows-[auto_minmax(0,1fr)]",
            "sm:data-[state=open]:slide-in-from-bottom-2 sm:data-[state=open]:duration-200",
            "sm:data-[state=closed]:duration-150",
          ],
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn(
            // 44px, matching Sheet. The modal was the one surface still shipping a 36px
            // target while Button calls 44 "the comfortable touch target".
            "absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-sm text-ink-3",
            "transition-colors hover:bg-surface hover:text-ink",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
          )}
        >
          <IconClose className="h-5 w-5" />
          {/* The old close buttons rendered a bare glyph or a bare icon, so their accessible
              name was "✕" or empty. */}
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

/** Header. `DialogTitle` is required by Radix and becomes the dialog's accessible name. */
export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 border-b border-rule px-6 py-5 pr-16", className)}
      {...props}
    />
  );
}

export function DialogTitle({
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

export function DialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-meta leading-relaxed text-ink-2", className)}
      {...props}
    />
  );
}

/** Scrolling body. The panel is capped at 92dvh so this is what moves, not the page. */
export function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 overflow-y-auto px-6 py-5", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 border-t border-rule px-6 py-4 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}
