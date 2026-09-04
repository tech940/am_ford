import { createContext, forwardRef, useContext, useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Form field primitive: persistent label, optional hint, and an error that is announced.
 *
 * This exists because the audit found roughly twenty form controls across the site with no
 * accessible name at all — six `<label>` elements in the lead modal alone had no `htmlFor`,
 * and several inputs had no `id`, no `name`, and no `aria-label`. Wiring that by hand at
 * every call site is what produced the gap, so the wiring lives here instead: `Field`
 * generates the id and hands it to the control through context.
 *
 *   <Field label="Phone number" hint="We only call about this vehicle." error={errors.phone}>
 *     <Input name="phone" type="tel" autoComplete="tel" />
 *   </Field>
 *
 * Placeholders are examples, never labels. The label does not disappear on focus.
 */
type FieldContextValue = {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
};

const FieldContext = createContext<FieldContextValue | null>(null);

function useFieldContext() {
  return useContext(FieldContext);
}

export interface FieldProps {
  label: string;
  /** Format or eligibility information. Rendered before the control, not after it. */
  hint?: string;
  /** When present the control is marked invalid and this is announced. */
  error?: string | null;
  /**
   * Defaults to true. Lead forms ask for very little, and nearly all of it is needed, so
   * "(optional)" is the exception worth marking — not the rule. Defaulting this to false
   * put the marker on every field at once, which is noise rather than information.
   */
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, hint, error, required = true, className, children }: FieldProps) {
  const base = useId();
  const id = `${base}-control`;
  const hintId = hint ? `${base}-hint` : undefined;
  const errorId = error ? `${base}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <FieldContext.Provider value={{ id, describedBy, invalid: Boolean(error), required }}>
      <div className={cn("flex flex-col gap-1.5", className)}>
        <label
          htmlFor={id}
          className="font-sans text-micro font-bold uppercase tracking-[0.09em] text-ink-2"
        >
          {label}
          {!required && <span className="ml-1.5 normal-case tracking-normal">(optional)</span>}
        </label>

        {hint && (
          <p id={hintId} className="text-meta text-ink-3">
            {hint}
          </p>
        )}

        {children}

        {error && (
          <p
            id={errorId}
            role="alert"
            className="border-l-2 border-attention bg-attention/[0.06] px-2.5 py-1.5 text-meta font-medium text-attention"
          >
            {error}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
}

/** Shared control surface. Square-ish, 2px, rule border, brand focus ring. */
const controlClass = [
  "w-full rounded-sm border bg-white px-3.5 font-sans text-ui text-ink",
  "transition-colors duration-150 outline-none",
  "placeholder:text-ink-3",
  "focus-visible:border-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand",
  "disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-3",
  "aria-[invalid=true]:border-attention",
].join(" ");

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    const f = useFieldContext();
    return (
      <input
        ref={ref}
        id={f?.id}
        aria-describedby={f?.describedBy}
        aria-invalid={f?.invalid || undefined}
        required={f?.required}
        className={cn(controlClass, "h-11", className)}
        {...props}
      />
    );
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, rows = 4, ...props }, ref) {
  const f = useFieldContext();
  return (
    <textarea
      ref={ref}
      id={f?.id}
      rows={rows}
      aria-describedby={f?.describedBy}
      aria-invalid={f?.invalid || undefined}
      required={f?.required}
      className={cn(controlClass, "resize-y py-2.5 leading-relaxed", className)}
      {...props}
    />
  );
});

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    const f = useFieldContext();
    return (
      <select
        ref={ref}
        id={f?.id}
        aria-describedby={f?.describedBy}
        aria-invalid={f?.invalid || undefined}
        required={f?.required}
        className={cn(controlClass, "h-11 cursor-pointer appearance-none pr-9", className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' stroke='%237a7268' stroke-width='1.6' fill='none' stroke-linecap='round'/></svg>\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.85rem center",
        }}
        {...props}
      >
        {children}
      </select>
    );
  },
);

/**
 * Consent checkbox. Rendered structurally rather than per component, because the audit found
 * three different consent postures in one product — a real checkbox, a passive paragraph that
 * dropped both "consent is not a condition of purchase" and the STOP opt-out, and none at all
 * on the surface that books test drives.
 */
export function ConsentCheckbox({
  id,
  checked,
  onCheckedChange,
  children,
  error,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  children: React.ReactNode;
  error?: string | null;
}) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-2.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          aria-describedby={errorId}
          aria-invalid={Boolean(error) || undefined}
          // 24px, not 20px: WCAG 2.5.8 sets 24x24 as the minimum target and a consent
          // checkbox is the last control that should be fiddly to hit.
          className="mt-px h-6 w-6 shrink-0 cursor-pointer accent-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
        <label htmlFor={id} className="cursor-pointer text-meta leading-relaxed text-ink-2">
          {children}
        </label>
      </div>
      {error && (
        <p
          id={errorId}
          role="alert"
          className="border-l-2 border-attention bg-attention/[0.06] px-2.5 py-1.5 text-meta font-medium text-attention"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * One-tap choice, for the single extra fact an intent needs before the desk can call.
 *
 * Real radios in a fieldset, visually hidden and driven by `peer-checked:` — so arrow-key
 * navigation, grouping and the accessible name all come from the platform rather than from
 * JavaScript. No `role="radiogroup"` to half-implement.
 */
export function ChoiceGroup({
  legend,
  name,
  options,
  value,
  onChange,
  className,
}: {
  legend: string;
  name: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <fieldset className={cn("flex flex-col gap-1.5", className)}>
      <legend className="font-sans text-micro font-bold uppercase tracking-[0.09em] text-ink-2">
        {legend}
      </legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {options.map((opt) => (
          <div key={opt}>
            <input
              type="radio"
              id={`${name}-${opt.replace(/\s+/g, "-").toLowerCase()}`}
              name={name}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="peer sr-only"
            />
            <label
              htmlFor={`${name}-${opt.replace(/\s+/g, "-").toLowerCase()}`}
              className={cn(
                "flex h-11 cursor-pointer items-center justify-center rounded-sm border border-rule",
                "bg-white px-2 text-center font-sans text-ui font-semibold text-ink-2",
                "transition-colors hover:border-ink/25",
                "peer-checked:border-brand peer-checked:bg-brand/[0.06] peer-checked:text-brand",
                "peer-focus-visible:outline peer-focus-visible:outline-2",
                "peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand",
              )}
            >
              {opt}
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
