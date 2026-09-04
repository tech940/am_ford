import { useRef, useState } from "react";
import { dealerInfo, type Vehicle } from "@/lib/vehicles";
import {
  CONSENT_TEXT,
  RESPONSE_PROMISE,
  hasSubmittedLead,
  smsLink,
  submitQuickLead,
} from "@/lib/leads";
import { leadStorageConfigured, type LeadInquiry } from "@/lib/supabase";
import { dealerStatus, dealerStatusLine } from "./dealerClock";
import {
  Button,
  ChoiceGroup,
  ConsentCheckbox,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  IconCheck,
  IconPhone,
  Input,
  Textarea,
} from "@/components/ledger";

/**
 * The exchange half of the lead dialog, and every state it can be in.
 *
 * `VehicleLeadDialog` and `ModelEnquiryDialog` are thin wrappers over this: they decide what
 * the rail says and which intent is running, and everything below — field set, validation,
 * submission, success, failure, the offline branch — is identical in all of them. That is
 * deliberate. The reason there were seven overlay components in this codebase with four
 * different consent postures is that each one re-implemented this part.
 *
 * FIELD ORDER: message, choice, name, phone, consent. The message goes first and arrives
 * pre-filled, because in a conversation you say the thing before you say who you are, and a
 * sentence to approve costs a glance where a blank box costs a paragraph. It is a `value`,
 * not a `placeholder` — a placeholder is an example and would not be sent.
 *
 * Email is asked for nowhere. Every promise this panel makes is a call or a text, nothing in
 * the system sends email, and on a 375px screen the field is 88px of panel height buying a
 * channel the dealership does not use.
 */

/** "(440) 555-0199", applied on blur only. Formatting during typing breaks the caret on backspace. */
function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length !== 10) return raw;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/**
 * Renders the dealership's phone number inside a failure message as a real link.
 *
 * Every failure path in `submitLeadInquiry` ends by telling the customer to call. On a phone
 * that instruction is only useful if it dials.
 */
function PhoneAsLink({ text }: { text: string }) {
  const parts = text.split(dealerInfo.phone);
  if (parts.length !== 2) return <>{text}</>;
  return (
    <>
      {parts[0]}
      <a href={dealerInfo.phoneHref} className="font-semibold underline underline-offset-[3px]">
        {dealerInfo.phone}
      </a>
      {parts[1]}
    </>
  );
}

/**
 * Focus the panel itself on open, not the first control inside it.
 *
 * Radix's default lands on the first tabbable node, which here is whatever the intent's
 * supporting block happens to put there — on `price` that is the "Programme terms" disclosure,
 * which is a strange place to begin. Worse on a phone: focusing the message field raises the
 * software keyboard immediately and pushes the photograph and the price out of view, which
 * destroys the premise of the whole panel.
 *
 * Focusing the content element keeps the title and the description as the announced opening,
 * and the first Tab still walks the panel in order.
 */
function focusPanel(e: Event) {
  e.preventDefault();
  (e.currentTarget as HTMLElement | null)?.focus();
}

export type LeadPanelProps = {
  /** The left column. Rendered identically in every state, including success. */
  rail: React.ReactNode;
  title: string;
  /** The intent's promise, one sentence. Becomes the accessible description. */
  lead: string;
  /** Pre-filled first draft of the customer's message. */
  draft: string;
  /** At most one supporting block, above the fields. */
  support?: React.ReactNode;
  choice?: { legend: string; name: string; options: readonly string[] };
  cta: string;
  leadType: LeadInquiry["lead_type"];
  /** Short name for this request in the CRM, e.g. "Best price request". */
  metaLabel: string;
  /** Full vehicle string for the CRM line. */
  subject: string;
  /** How the vehicle is named back to the customer, e.g. "2025 F-150 Platinum". */
  subjectShort: string;
  /** Just the model, for the offline title. */
  shortName: string;
  consentId: string;
  /** Present for a real stock record; absent for a model enquiry. */
  vehicle?: Vehicle;
  /** Send the tapped choice to `leads.preferred_time` as well as the CRM line. */
  choiceIsPreferredTime?: boolean;
  /** Payment-calculator inputs, when the visitor arrived here from the calculator. */
  financingDetails?: Record<string, unknown>;
  onClose?: () => void;
};

export function LeadPanel({
  rail,
  title,
  lead,
  draft,
  support,
  choice,
  cta,
  leadType,
  metaLabel,
  subject,
  subjectShort,
  shortName,
  consentId,
  vehicle,
  choiceIsPreferredTime = false,
  financingDetails,
}: LeadPanelProps) {
  const [message, setMessage] = useState(draft);
  const [choiceValue, setChoiceValue] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<{
    message?: string;
    name?: string;
    phone?: string;
    consent?: string;
  }>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [failure, setFailure] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const messageRef = useRef<HTMLTextAreaElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const failureRef = useRef<HTMLParagraphElement>(null);

  const clock = dealerStatus(new Date());
  const repeatVisit = hasSubmittedLead();

  const validate = () => {
    const next: typeof errors = {};
    if (!message.trim()) next.message = "Write a line about what you need and we will answer it.";
    if (!name.trim()) next.name = "We need a name to ask for when we call.";
    if (phone.replace(/\D/g, "").length < 10)
      next.phone = "That looks short. Include the area code, 10 digits.";
    if (!consent) next.consent = "Please tick the box so we are allowed to contact you.";
    return next;
  };

  /** Re-validate a field on change, but only once it has already errored. Never on first blur. */
  const clearIfFixed = (key: keyof typeof errors, ok: boolean) => {
    if (errors[key] && ok) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // A keyboard Enter can fire twice before React has re-rendered the busy state.
    if (status === "sending") return;

    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      // Move focus to the first invalid control: on a scrolled mobile body the error can
      // otherwise be entirely off screen.
      if (next.message) messageRef.current?.focus();
      else if (next.name) nameRef.current?.focus();
      else if (next.phone) phoneRef.current?.focus();
      else document.getElementById(consentId)?.focus();
      return;
    }

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setOffline(true);
      return;
    }

    setStatus("sending");
    setFailure(null);

    const res = await submitQuickLead({
      vehicle,
      leadType,
      name,
      phone,
      // The human sentence, first and alone. The old payload prefixed it with the CTA, the
      // vehicle and the price, so the sales desk read a robot before it read a person.
      message,
      meta: [
        metaLabel,
        subject,
        vehicle ? `$${vehicle.price.toLocaleString("en-US")}` : null,
        choiceValue || null,
        // Tells the desk a typed message from a tapped one, and makes the one risk this
        // design carries measurable from the CRM rather than a matter of opinion.
        message === draft ? "draft not edited" : null,
      ]
        .filter(Boolean)
        .join(" · "),
      preferredTime: choiceIsPreferredTime && choiceValue ? choiceValue : undefined,
      financingDetails,
    });

    if (res.success) {
      setStatus("done");
    } else {
      setStatus("idle");
      // `res.message` already ends with "please call or text us on ...". Appending our own
      // version of that told the customer to call twice in one sentence.
      setFailure(res.message);
      requestAnimationFrame(() => failureRef.current?.focus());
    }
  };

  // `min-h-0` matters: a grid item defaults to min-height auto, so without it a tall rail
  // grows the row instead of scrolling inside it, and the panel loses its bottom edge.
  const railColumn = "sm:col-start-1 sm:row-start-1 sm:row-span-2 sm:min-h-0";
  const exchangeColumn = "sm:col-start-2 sm:row-start-2";

  /* ---------------------------------------------------------------- offline / unconfigured */

  // Checked at RENDER, not at submit. Previously a visitor wrote a message, typed a number and
  // ticked a consent box before being told the form was never going to work.
  if (!leadStorageConfigured || offline) {
    return (
      <DialogContent size="lead" onOpenAutoFocus={focusPanel}>
        <DialogHeader className="sm:col-start-2 sm:row-start-1">
          <DialogTitle>Call us about the {shortName}</DialogTitle>
          <DialogDescription>Our message form is offline right now.</DialogDescription>
        </DialogHeader>

        <div className={railColumn}>{rail}</div>

        <div className={`flex min-h-0 flex-1 flex-col ${exchangeColumn}`}>
          <DialogBody className="px-5 sm:px-6">
            {dealerStatusLine(clock) && (
              <p className="text-meta leading-relaxed text-ink-2">{dealerStatusLine(clock)}</p>
            )}
            {import.meta.env.DEV && !leadStorageConfigured && (
              <p className="mt-4 border-l-2 border-attention bg-attention/[0.06] px-3.5 py-3 text-meta leading-relaxed text-ink">
                Development notice: this build has no VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY,
                so no form on this site can store a lead. Every visitor sees this panel.
              </p>
            )}
          </DialogBody>

          <DialogFooter className="px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pb-4">
            {vehicle && (
              <Button variant="secondary" asChild block className="sm:w-auto">
                <a href={smsLink(vehicle)}>Text us about this vehicle</a>
              </Button>
            )}
            <Button asChild block className="sm:w-auto">
              <a href={dealerInfo.phoneHref}>
                <IconPhone className="h-4 w-4" />
                Call {dealerInfo.phone}
              </a>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    );
  }

  /* ------------------------------------------------------------------------------- success */

  if (status === "done") {
    const closedLine =
      clock && !clock.open && clock.opensAt && clock.opensDay
        ? `We are closed now. The desk opens at ${clock.opensAt} ${clock.opensDay} and yours is first in.`
        : null;

    return (
      <DialogContent size="lead" onOpenAutoFocus={focusPanel}>
        <DialogHeader className="sm:col-start-2 sm:row-start-1">
          <DialogTitle>Sent to the sales desk</DialogTitle>
          <DialogDescription>
            {metaLabel} for the {subjectShort}
          </DialogDescription>
        </DialogHeader>

        {/* The rail does not move, does not fade, does not re-render. Same node, same
            photograph, same price: it was always the taller column, so the panel keeps its
            height structurally rather than by a measured minimum. */}
        <div className={railColumn}>{rail}</div>

        <div className={`flex min-h-0 flex-1 flex-col ${exchangeColumn}`}>
          <DialogBody className="px-5 sm:px-6">
            <div className="flex gap-3 duration-160 animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-backwards [animation-delay:60ms]">
              {/* 2px square, not a circle. The pill radius belongs to Chip alone. */}
              <span
                className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-available/10 text-available"
                aria-hidden
              >
                <IconCheck className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                {/* The receipt. This is the only ten seconds in which a mistyped digit is
                    still fixable, and a mistyped digit is a lead that reports as converted
                    and never converts. */}
                <p className="text-body text-ink">We will reach you on {formatPhone(phone)}.</p>
                <p className="mt-2 text-meta leading-relaxed text-ink-2">
                  {closedLine ?? RESPONSE_PROMISE}
                </p>
                <p className="mt-4 line-clamp-6 border-l-2 border-brand bg-surface px-4 py-3 text-meta leading-relaxed text-ink-2">
                  {message}
                </p>
              </div>
            </div>
          </DialogBody>

          {/* No onward link, deliberately. The visitor converted; sending them back into the
              funnel from a success panel is how a lead becomes a bounce. */}
          <DialogFooter className="px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pb-4">
            <Button variant="secondary" asChild block className="sm:w-auto">
              <a href={dealerInfo.phoneHref}>
                <IconPhone className="h-4 w-4" />
                Call {dealerInfo.phone}
              </a>
            </Button>
            <DialogClose asChild>
              <Button block autoFocus className="sm:w-auto">
                Done
              </Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    );
  }

  /* ---------------------------------------------------------------------------------- form */

  const sending = status === "sending";

  return (
    <DialogContent size="lead" onOpenAutoFocus={focusPanel}>
      <DialogHeader className="sm:col-start-2 sm:row-start-1">
        <DialogTitle>{title}</DialogTitle>
        {/* The vehicle string is gone from here; that is the rail's job now, and its removal
            is what takes the header from repetition to a single supporting sentence. */}
        <DialogDescription>{lead}</DialogDescription>
      </DialogHeader>

      <div className={railColumn}>{rail}</div>

      {/* noValidate: Field marks every control required, so without this an unstyled native
          browser bubble fires before our validator ever runs. Two validation systems, one of
          them unlocalised. Ours is the only one. */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className={`flex min-h-0 flex-1 flex-col ${exchangeColumn}`}
      >
        <DialogBody className="px-5 sm:px-6">
          {support}

          {repeatVisit && (
            <p className="mb-5 text-meta text-ink-3">
              You already sent us a message. Another is fine, we will see both.
            </p>
          )}

          <div className="grid gap-5">
            <Field label="Your message" error={errors.message}>
              <Textarea
                ref={messageRef}
                name="message"
                rows={3}
                className="min-h-[5.5rem]"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  clearIfFixed("message", Boolean(e.target.value.trim()));
                }}
              />
            </Field>

            {choice && (
              <ChoiceGroup
                legend={choice.legend}
                name={choice.name}
                options={choice.options}
                value={choiceValue}
                onChange={setChoiceValue}
              />
            )}

            <Field label="Your name" error={errors.name}>
              <Input
                ref={nameRef}
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearIfFixed("name", Boolean(e.target.value.trim()));
                }}
                placeholder="Jane Miller"
              />
            </Field>

            <Field label="Phone number" hint="Where we call or text you back." error={errors.phone}>
              <Input
                ref={phoneRef}
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearIfFixed("phone", e.target.value.replace(/\D/g, "").length >= 10);
                }}
                onBlur={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(440) 555-0199"
              />
            </Field>

            <ConsentCheckbox
              id={consentId}
              checked={consent}
              onCheckedChange={(v) => {
                setConsent(v);
                clearIfFixed("consent", v);
              }}
              error={errors.consent}
            >
              {CONSENT_TEXT}
            </ConsentCheckbox>

            {failure && (
              <p
                ref={failureRef}
                role="alert"
                tabIndex={-1}
                className="border-l-2 border-attention bg-attention/[0.06] px-3.5 py-3 text-meta leading-relaxed text-ink outline-none"
              >
                <PhoneAsLink text={failure} />
              </p>
            )}
          </div>
        </DialogBody>

        <DialogFooter className="relative flex-col gap-0 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:flex-col sm:px-6 sm:pb-4">
          {sending && (
            <span className="absolute inset-x-0 top-0 h-0.5 overflow-hidden" aria-hidden>
              {/* A rule, not a spinner: there is no spinner glyph in the system and a rule is
                  what this design draws structure with. Reduced motion gets a full-width
                  static bar, because a frozen third-width bar reads as a rendering bug. */}
              <span className="block h-full w-1/3 bg-brand [animation:leadprogress_1.1s_linear_infinite] motion-reduce:w-full motion-reduce:animate-none motion-reduce:bg-brand/30" />
            </span>
          )}

          <p className="mb-3 w-full text-meta text-ink-3">{RESPONSE_PROMISE}</p>

          <Button
            type="submit"
            block
            // Not `disabled`: that drops the element from the tab order mid-submit and the
            // opacity ramp makes the CTA look broken rather than busy.
            aria-busy={sending || undefined}
            aria-disabled={sending || undefined}
            className={sending ? "pointer-events-none" : undefined}
          >
            {sending ? "Sending" : cta}
          </Button>

          <p className="sr-only" role="status" aria-live="polite">
            {sending ? "Sending your message" : ""}
          </p>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
