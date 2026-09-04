import { LINEUP } from "@/lib/dealerContent";
import { Dialog, DialogTrigger } from "@/components/ledger";
import { LeadPanel } from "./LeadPanel";
import { LeadRail } from "./LeadRail";

/**
 * Enquiry for a MODEL the dealership sells but has no record of on the lot right now.
 *
 * `VehicleLeadDialog` requires a `Vehicle`, deliberately, so that a lead can never be filed
 * against the wrong car. There is no `Vehicle` for a model with no current stock, so this is
 * its sibling rather than a loosening of that rule.
 *
 * The dealership sells twenty models; the placeholder feed holds six. Without this, every
 * model the lot does not currently stock is a dead row.
 *
 * Same shell, same rail, same field set, same consent, same success screen. The rail keeps
 * the photograph, the name and the dealership's two standing facts, and drops everything the
 * dealership cannot state about a vehicle it does not have in hand: no price, no MSRP, no
 * spec table, no condition chip, no notes. What is absent is absent, not filled with a
 * placeholder.
 */

/** Official Ford render for this model, if the lineup has one. */
function renderKey(model: string): string | undefined {
  const wanted = model.trim().toLowerCase();
  for (const group of LINEUP) {
    const hit = group.models.find((m) => m.name.toLowerCase() === wanted);
    if (hit) return hit.image;
  }
  return undefined;
}

export function ModelEnquiryDialog({
  model,
  children,
  open,
  onOpenChange,
}: {
  model: string;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const rail = (
    // A model with no LINEUP entry loses the photograph and leads with the name plus the two
    // standing facts in the rail foot. It still has to look deliberate with only that.
    <LeadRail imageName={renderKey(model)} eyebrow="Ford" name={model} />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}

      <LeadPanel
        rail={rail}
        title={`Ask about the ${model}`}
        lead="Tell us what you need to know and we will come back with a straight answer."
        draft={`I have a question about the ${model}.`}
        cta="Send enquiry"
        leadType="general_contact"
        metaLabel="Model enquiry"
        subject={`Ford ${model}`}
        subjectShort={`Ford ${model}`}
        shortName={model}
        consentId={`model-consent-${model.toLowerCase().replace(/\s+/g, "-")}`}
      />
    </Dialog>
  );
}
