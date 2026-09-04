import { activeIncentives, PRICING_STANCE, type Incentive } from "@/lib/dealerContent";
import { imageNameFromSrc } from "@/components/site/ResponsiveImage";
import { DELIVERY_SHORT, dealerInfo, type Vehicle } from "@/lib/vehicles";
import { Dialog, DialogTrigger, IconPin, type Spec } from "@/components/ledger";
import { dealerStatus, dealerStatusLine } from "./dealerClock";
import { LeadPanel } from "./LeadPanel";
import { LeadRail } from "./LeadRail";

/**
 * The one vehicle-scoped capture surface.
 *
 * `vehicle` is a REQUIRED prop, and that is the whole point. The surfaces this replaces took
 * a vehicle callback and discarded it — the related-vehicle "Get Price" on the detail page
 * bound `selectedCar` and then built its modal from the page's own vehicle, so clicking a
 * Bronco on the F-150 page filed an F-150 lead. Requiring the vehicle makes that a compile
 * error rather than a silent mis-attribution.
 *
 * Everything submits through `submitQuickLead`, which is the only path that stamps consent
 * and sets the converted-visitor flag. Three surfaces used to call `submitLeadInquiry`
 * directly and bypass it, which is why a visitor who had just booked a test drive on a
 * $71,990 truck was then shown a $500 discount modal.
 *
 * WHAT CHANGED IN THE REDESIGN. This dialog always knew the photograph, the price, the spec
 * and a paragraph of hand-written notes about that exact truck, and it rendered a title, four
 * inputs and a button. Now it is a one-page document about one vehicle, with the message to
 * the dealership already written on it. Six intents share every part of that: only the title,
 * the promise, the draft, one supporting block and the CTA differ. See `LeadPanel`.
 */
export type LeadIntent = "enquiry" | "price" | "availability" | "test_drive" | "trade" | "finance";

type IntentConfig = {
  title: (v: Vehicle) => string;
  /** The promise, one sentence, becomes the dialog's description. */
  lead: string;
  /** Pre-filled first draft of the customer's message. */
  draft: (v: Vehicle) => string;
  cta: string;
  leadType: "test_drive" | "quote_request" | "financing_preapproval" | "general_contact";
  /** How this request is labelled in the CRM and echoed back on the success screen. */
  metaLabel: string;
  choice?: { legend: string; name: string; options: readonly string[] };
  /** Which four rows the rail's spec table shows. */
  specs: (v: Vehicle) => Spec[];
};

const odometer = (v: Vehicle): Spec => ({
  label: "Odometer",
  value: v.miles < 100 ? "Delivery miles" : `${v.miles.toLocaleString("en-US")} mi`,
});
const drivetrain = (v: Vehicle): Spec => ({ label: "Drivetrain", value: v.drivetrain });
const economy = (v: Vehicle): Spec => ({
  label: v.fuel === "Electric" ? "Range" : "Economy",
  value: v.mpg,
});
const output = (v: Vehicle): Spec => ({ label: "Output", value: `${v.horsepower} hp` });

/** Every row here is drawn from a non-optional `Vehicle` field, so the table is always four. */
const DEFAULT_SPECS = (v: Vehicle): Spec[] => [odometer(v), drivetrain(v), economy(v), output(v)];

const INTENT: Record<LeadIntent, IntentConfig> = {
  enquiry: {
    title: (v) => `Ask about the ${v.model}`,
    lead: "Tell us what you need to know and we will come back with a straight answer.",
    draft: (v) => `I have a question about the ${v.year} ${v.model} ${v.trim}.`,
    cta: "Send enquiry",
    leadType: "general_contact",
    metaLabel: "Enquiry",
    specs: DEFAULT_SPECS,
  },

  /**
   * The price ask.
   *
   * The listed price stays visible on the card and in this dialog's rail — gating a number we
   * are already printing is what made the old "Unlock Your Instant Price" modal dishonest: it
   * showed that same price in gold in its own sidebar while claiming to withhold it.
   *
   * What is genuinely not knowable until someone asks is the *negotiated* number: what a
   * trade, a finance package, or a current factory programme does to it. So the question is
   * real, and the copy promises a conversation rather than a discount. Do not change this to
   * assert that a lower price exists, or by how much, without written sign-off.
   */
  price: {
    title: (v) => `Best price on the ${v.model}`,
    lead: "The listed price is beside this. What a trade, a finance package or a current Ford programme does to it is the part we work out with you.",
    draft: (v) => `What is the best you can do on the ${v.year} ${v.model} ${v.trim}?`,
    cta: "Ask for the best price",
    leadType: "quote_request",
    metaLabel: "Best price request",
    specs: DEFAULT_SPECS,
  },

  availability: {
    title: (v) => `Is the ${v.model} still available?`,
    lead: "We will confirm it is still on the lot and hold it while you decide whether to come in.",
    draft: (v) => `Is the ${v.year} ${v.model} ${v.trim} still on the lot?`,
    cta: "Check availability",
    leadType: "general_contact",
    metaLabel: "Availability check",
    specs: (v) => [
      odometer(v),
      { label: "Exterior", value: v.exterior },
      { label: "Interior", value: v.interior },
      drivetrain(v),
    ],
  },

  test_drive: {
    title: (v) => `Drive the ${v.model}`,
    lead: "Tell us roughly when suits and we will have it ready and warmed up.",
    draft: (v) => `I would like to drive the ${v.year} ${v.model} ${v.trim}. When can I come in?`,
    cta: "Book a test drive",
    leadType: "test_drive",
    metaLabel: "Test drive request",
    // Four rough windows, not a date picker. A picker implies live diary availability the
    // desk never agreed to, and there is no calendar anywhere in this system.
    choice: {
      legend: "When suits?",
      name: "preferred-window",
      options: ["This week", "Next week", "Weekend", "Evening"],
    },
    specs: DEFAULT_SPECS,
  },

  trade: {
    title: (v) => `Trade against the ${v.model}`,
    lead: "Our used vehicle manager sets the number, not a web page.",
    draft: (v) => `I want to trade against the ${v.year} ${v.model} ${v.trim}.`,
    cta: "Send trade details",
    leadType: "quote_request",
    metaLabel: "Trade enquiry",
    choice: {
      legend: "Trade or sell?",
      name: "trade-or-sell",
      options: ["Trade against this", "Sell it outright"],
    },
    specs: DEFAULT_SPECS,
  },

  finance: {
    title: (v) => `Finance the ${v.model}`,
    lead: "We take one application to Ohio credit unions and national lenders, then bring you the terms they come back with.",
    draft: (v) =>
      `I would like to know what I can be approved for on the ${v.year} ${v.model} ${v.trim}.`,
    cta: "Start an application",
    leadType: "financing_preapproval",
    metaLabel: "Finance enquiry",
    specs: (v) => [
      { label: "Listed price", value: `$${v.price.toLocaleString("en-US")}` },
      odometer(v),
      drivetrain(v),
      output(v),
    ],
  },
};

/**
 * Live Ford programmes, with the programme number, the stated end date and the disclaimer
 * verbatim.
 *
 * Gated on `condition === "New"`: Ford new-vehicle programmes do not apply to used stock, and
 * printing one under a used truck is the same class of defect as a fabricated VIN. Renders
 * nothing when nothing is active, and the Floor line takes its place.
 */
function Programmes({ items }: { items: Incentive[] }) {
  return (
    <div className="mb-5 border-l-2 border-brand py-1 pl-4">
      <p className="font-sans text-micro font-bold uppercase tracking-[0.09em] text-ink-3">
        Live Ford programmes
      </p>
      {items.map((i) => (
        <p key={i.id} className="mt-1.5 text-meta leading-relaxed text-ink">
          {i.label} <span className="text-ink-3">{i.programme}.</span>
        </p>
      ))}
      <details className="group mt-2">
        <summary className="cursor-pointer list-none text-meta text-ink-3 underline underline-offset-[3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
          <span className="group-open:hidden">Programme terms</span>
          <span className="hidden group-open:inline">Hide terms</span>
        </summary>
        {items.map((i) => (
          <p key={i.id} className="mt-2 text-meta leading-relaxed text-ink-3">
            {i.disclaimer}
          </p>
        ))}
      </details>
    </div>
  );
}

/**
 * What we say when there is no live programme. Both facts are dateless and dealership-owned,
 * so the position is never a hole waiting for marketing to refill it.
 */
function Floor() {
  return (
    <p className="mb-5 text-meta leading-relaxed text-ink-2">
      {DELIVERY_SHORT}. AM Ford publishes one pricing stance: {`"${PRICING_STANCE}"`}.
    </p>
  );
}

function Support({ intent, vehicle }: { intent: LeadIntent; vehicle: Vehicle }) {
  if (intent === "test_drive") {
    const line = dealerStatusLine(dealerStatus(new Date()));
    return (
      <div className="mb-5 flex gap-2 text-meta leading-relaxed text-ink-2">
        <IconPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-3" />
        <span>
          {dealerInfo.address}
          {line && (
            <>
              <br />
              {line}
            </>
          )}
        </span>
      </div>
    );
  }

  if (intent === "trade") {
    // The dealership's own published line. No dollar figure appears anywhere near it.
    return (
      <p className="mb-5 bg-surface px-4 py-3 text-body text-ink">
        Sell us your car, even if you don&apos;t buy from us.
      </p>
    );
  }

  if (intent !== "price" && intent !== "finance") return null;

  const active = vehicle.condition === "New" ? activeIncentives(new Date()) : [];
  if (import.meta.env.DEV && activeIncentives(new Date()).length === 0) {
    console.warn("No live incentives: every INCENTIVES row has passed its endsOn date.");
  }

  const items =
    intent === "finance"
      ? active.filter((i) => i.id === "apr-0-36" || i.id === "defer-90")
      : active.slice(0, 2);

  return (
    <>
      {items.length > 0 ? <Programmes items={items.slice(0, 2)} /> : <Floor />}
      {intent === "finance" && (
        // Removes the largest hesitation on a finance CTA, and it is true of this form.
        <p className="-mt-2 mb-5 text-meta leading-relaxed text-ink-2">
          We do not ask for a social security number or a date of birth on this form. The credit
          application happens with a person.
        </p>
      )}
    </>
  );
}

export function VehicleLeadDialog({
  vehicle,
  intent = "enquiry",
  showSaving = true,
  financingDetails,
  children,
  open,
  onOpenChange,
}: {
  /** Required. The lead is always attributed to this exact vehicle. */
  vehicle: Vehicle;
  intent?: LeadIntent;
  /** Forwarded from the card, so its distrust of a placeholder MSRP propagates here. */
  showSaving?: boolean;
  /** Payment-calculator inputs, when the visitor arrived from the calculator. */
  financingDetails?: Record<string, unknown>;
  /** Trigger element. Omit when driving the dialog with `open`/`onOpenChange`. */
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const cfg = INTENT[intent];
  const subject = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`;

  const rail = (
    <LeadRail
      imageName={imageNameFromSrc(vehicle.image)}
      imageSrc={vehicle.image}
      condition={vehicle.condition}
      eyebrow={`${vehicle.year} ${vehicle.make}`}
      name={vehicle.model}
      sub={vehicle.trim}
      price={vehicle.price}
      msrp={vehicle.msrp}
      showSaving={showSaving}
      specs={cfg.specs(vehicle)}
      mobileSpec={[
        vehicle.miles < 100 ? "Delivery miles" : `${vehicle.miles.toLocaleString("en-US")} mi`,
        vehicle.drivetrain,
        `${vehicle.horsepower} hp`,
      ].join(" · ")}
      notes={vehicle.sellerNotes}
    />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}

      {/* Keyed on the intent so switching intents on the same card starts a clean draft
          rather than showing the previous intent's sentence. */}
      <LeadPanel
        key={intent}
        rail={rail}
        title={cfg.title(vehicle)}
        lead={cfg.lead}
        draft={cfg.draft(vehicle)}
        support={<Support intent={intent} vehicle={vehicle} />}
        choice={cfg.choice}
        cta={cfg.cta}
        leadType={cfg.leadType}
        metaLabel={cfg.metaLabel}
        subject={subject}
        subjectShort={`${vehicle.year} ${vehicle.model} ${vehicle.trim}`}
        shortName={vehicle.model}
        consentId={`lead-consent-${vehicle.id}`}
        vehicle={vehicle}
        choiceIsPreferredTime={intent === "test_drive"}
        financingDetails={financingDetails}
      />
    </Dialog>
  );
}
