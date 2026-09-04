import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { dealerStatus, dealerStatusLine } from "@/components/lead/dealerClock";
import { VehicleLeadDialog, type LeadIntent } from "@/components/lead/VehicleLeadDialog";
import { ModelEnquiryDialog } from "@/components/lead/ModelEnquiryDialog";
import { RESPONSE_PROMISE, smsLink } from "@/lib/leads";
import { dealerInfo } from "@/lib/vehicles";
import {
  Button,
  IconChevronRight,
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ledger";
import { useDesk } from "./DeskContext";
import { cn } from "@/lib/utils";

/**
 * The desk. A ruled tab in the corner that states whether the sales desk is open.
 *
 * WHAT IT REPLACES, AND WHY THAT THING WAS WRONG.
 * A 462-line floating chat widget: navy header bar, a green PULSING dot, "Typically replies in
 * minutes", a grey speech bubble reading "Hi! You're chatting with AM Ford", four rounded-full
 * suggestion pills, a circular FAB, a fake 650ms typing delay and a `TypingDots` component.
 *
 * None of it was true. There is no agent, no socket and no inbox: it is a form. The dot
 * asserted presence that does not exist, "replies in minutes" was an unsourced response-time
 * claim that kept promising at 2am on a Sunday, "you're chatting with" was false, and "Hi!"
 * broke the exclamation-mark rule. It also carried four invented claims of its own and a
 * second `submitQuickLead` path with its own consent posture.
 *
 * The dishonesty is why it read as generic: it borrowed the Intercom shape without the thing
 * that shape means.
 *
 * WHY A PERSISTENT OBJECT STILL EARNS ITS PLACE. The nav phone serves callers during hours,
 * the Enquire button serves someone already on a vehicle, the footer serves someone who
 * reached the bottom. None of them answers "is anyone there right now", and `dealerStatus` is
 * the most perishable fact on this site while appearing nowhere persistent. So this stops
 * being a launcher pretending to be an inbox and becomes a clock that also routes.
 *
 * It sits at `z-40`, under the Sheet and Dialog overlays at `z-50`, so an open lead dialog is
 * never fought by it.
 */

const ROW =
  "flex min-h-13 w-full items-center justify-between gap-4 px-5 text-left font-sans text-ui " +
  "font-semibold text-ink transition-colors duration-150 hover:bg-surface " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand";

const VEHICLE_ROWS: { intent: LeadIntent; label: string }[] = [
  { intent: "availability", label: "Is it still available?" },
  { intent: "price", label: "Ask for the best price" },
  { intent: "trade", label: "Trade against this" },
  { intent: "test_drive", label: "Book a test drive" },
];

export function Desk() {
  const [open, setOpen] = useState(false);
  const { subject } = useDesk();

  // Computed per render, not cached: the tab is on screen while the clock crosses closing time.
  const status = dealerStatus(new Date());
  const line = dealerStatusLine(status);

  // Unparseable hours means no claim at all, anywhere. The tab collapses to one line.
  const tabStatus = status
    ? status.open && status.closesAt
      ? `Open until ${status.closesAt}`
      : status.opensAt && status.opensDay
        ? `Opens ${status.opensAt} ${status.opensDay}`
        : null
    : null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {/* Flush into the corner: no gap, no circle, no shadow, no radius. It reads as a tab
            on the document rather than an object hovering over it. */}
        <button
          type="button"
          aria-expanded={open}
          className={cn(
            "fixed bottom-0 right-0 z-40 flex w-60 flex-col justify-center gap-0.5",
            "border-l-4 border-t border-t-white/10 border-l-brand bg-asphalt px-4 text-left",
            "transition-colors duration-150 hover:bg-ink",
            "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-bright",
            tabStatus ? "h-14" : "h-11",
          )}
        >
          {tabStatus && (
            <span
              className={cn(
                "font-mono text-micro uppercase tabular-nums",
                status?.open ? "text-brand-bright" : "text-white/60",
              )}
            >
              {tabStatus}
            </span>
          )}
          <span className="font-display text-ui font-extrabold uppercase tracking-tight text-white">
            The AM desk
          </span>
        </button>
      </SheetTrigger>

      <SheetContent side="bottom" className="sm:max-w-[24rem]">
        <SheetHeader>
          <SheetTitle>The AM desk</SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0">
          {/* State is reported, never performed: this band does not transition or animate
              between open and closed. */}
          {line && (
            <div className="border-b border-rule bg-surface px-5 py-3">
              <p className="font-mono text-figure tabular-nums text-ink">{line}</p>
              {/* No response-time claim outside business hours. RESPONSE_PROMISE is itself
                  conditional on them, and repeating it at 2am is the old widget's lie. */}
              {status?.open && (
                <p className="mt-1 font-sans text-meta leading-relaxed text-ink-2">
                  {RESPONSE_PROMISE}
                </p>
              )}
            </div>
          )}

          {subject?.kind === "vehicle" && (
            <p className="border-b border-rule px-5 py-3 font-mono text-figure tabular-nums text-brand">
              {subject.vehicle.year} {subject.vehicle.model} · $
              {subject.vehicle.price.toLocaleString("en-US")}
            </p>
          )}

          <ul className="divide-y divide-rule border-b border-rule">
            {subject?.kind === "vehicle" &&
              VEHICLE_ROWS.map((r) => (
                <li key={r.intent}>
                  <VehicleLeadDialog vehicle={subject.vehicle} intent={r.intent}>
                    <button type="button" className={ROW}>
                      {r.label}
                      <IconChevronRight className="h-[18px] w-[18px] shrink-0 text-ink-2" />
                    </button>
                  </VehicleLeadDialog>
                </li>
              ))}

            {subject?.kind === "model" &&
              ["Is one in stock?", "Ask about pricing", "Book a test drive"].map((label) => (
                <li key={label}>
                  <ModelEnquiryDialog model={subject.model}>
                    <button type="button" className={ROW}>
                      {label}
                      <IconChevronRight className="h-[18px] w-[18px] shrink-0 text-ink-2" />
                    </button>
                  </ModelEnquiryDialog>
                </li>
              ))}

            {/* No vehicle and no model: route to the pages that already do this job rather
                than becoming a fifth general contact form. */}
            {!subject &&
              [
                { to: "/inventory", label: "Find a vehicle" },
                { to: "/financing", label: "Ask about financing" },
                { to: "/trade-in", label: "What is my trade worth?" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={ROW} onClick={() => setOpen(false)}>
                    {l.label}
                    <IconChevronRight className="h-[18px] w-[18px] shrink-0 text-ink-2" />
                  </Link>
                </li>
              ))}
          </ul>

          {/* Out of hours the text link is promoted above the call button: a message waits, a
              ringing phone does not. */}
          {subject?.kind === "vehicle" && !status?.open && (
            <p className="border-b border-rule px-5 py-3">
              <a
                href={smsLink(subject.vehicle)}
                className="font-sans text-ui font-semibold text-brand underline underline-offset-[3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Text about this vehicle
              </a>
            </p>
          )}
        </SheetBody>

        <SheetFooter className="flex-col items-stretch gap-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <Button variant={status?.open ? "primary" : "secondary"} size="lg" block asChild>
            <a href={dealerInfo.phoneHref} className="font-mono tabular-nums">
              {dealerInfo.phone}
            </a>
          </Button>
          <p className="font-mono text-micro uppercase tabular-nums text-ink-2">
            {dealerInfo.address}
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
