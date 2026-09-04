import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Button,
  Chip,
  CompareTable,
  ConsentCheckbox,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  Prose,
  Rule,
  SectionHeading,
  Select,
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SpecTable,
  Textarea,
} from "@/components/ledger";
import { vehicles } from "@/lib/vehicles";

/**
 * Design-system specimen. Not linked from anywhere and excluded from the sitemap; the
 * robots meta and the sitemap exclusion keep it out of the index. It exists so every primitive
 * can be exercised for keyboard order, focus visibility and screen-reader naming before a
 * page depends on it, and so regressions in the system are visible in one place.
 */
export const Route = createFileRoute("/ledger")({
  head: () => ({ meta: [{ name: "robots", content: "noindex,nofollow" }] }),
  component: LedgerSpecimen,
});

const v = vehicles[0];

function LedgerSpecimen() {
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-16">
      <SectionHeading
        as="h1"
        title="Ledger specimen"
        lead="Every primitive in the system, exercised. Tab through this page: focus must be visible on every control, in source order, and never trapped outside a dialog."
      />

      <Rule className="my-12" />

      <section aria-labelledby="s-buttons">
        <SectionHeading as="h2" title="Buttons" id="s-buttons" />
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button variant="primary" size="lg">
            Ask about this F-150
          </Button>
          <Button variant="secondary">Book a test drive</Button>
          <Button variant="quiet">Compare</Button>
          <Button variant="danger">Remove</Button>
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
        <div className="mt-4 max-w-sm bg-brand p-4">
          <Button variant="inverse" block>
            On the navy ground
          </Button>
        </div>
      </section>

      <Rule className="my-12" />

      <section aria-labelledby="s-chips">
        <SectionHeading as="h2" title="Chips" id="s-chips" />
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Chip tone="available" dot>
            In stock
          </Chip>
          <Chip tone="condition">Certified Pre-Owned</Chip>
          <Chip tone="neutral">4WD</Chip>
          <Chip tone="attention">Sold</Chip>
          <Chip tone="neutral" size="sm">
            Small
          </Chip>
        </div>
      </section>

      <Rule className="my-12" />

      <section aria-labelledby="s-form">
        <SectionHeading
          as="h2"
          title="Form controls"
          id="s-form"
          lead="Every control takes its id, label association and error wiring from Field."
        />
        <div className="mt-6 grid max-w-md gap-5">
          <Field label="Full name">
            <Input name="name" autoComplete="name" placeholder="Jane Miller" />
          </Field>
          <Field
            label="Phone number"
            hint="We only call about the vehicle you asked about."
            error={error}
          >
            <Input name="phone" type="tel" autoComplete="tel" placeholder="(440) 555-0199" />
          </Field>
          <Field label="Which vehicle">
            <Select name="vehicle" defaultValue={v.id}>
              {vehicles.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.year} {x.make} {x.model} {x.trim}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Anything we should know"
            required={false}
            hint="The only optional field here, so it is the only one marked."
          >
            <Textarea name="notes" placeholder="Trading something in, need it by a date..." />
          </Field>
          <ConsentCheckbox id="spec-consent" checked={consent} onCheckedChange={setConsent}>
            I agree to be contacted about this vehicle by phone, text or email. Consent is not a
            condition of purchase. Reply STOP to opt out.
          </ConsentCheckbox>
          <div className="flex gap-2">
            <Button onClick={() => setError("Enter a phone number we can reach you on.")}>
              Trigger error
            </Button>
            <Button variant="quiet" onClick={() => setError(null)}>
              Clear
            </Button>
          </div>
        </div>
      </section>

      <Rule className="my-12" />

      <section aria-labelledby="s-overlays">
        <SectionHeading
          as="h2"
          title="Overlays"
          id="s-overlays"
          lead="Focus moves in on open and returns to the trigger on close. Escape dismisses. The page behind does not scroll."
        />
        <div className="mt-6 flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ask about the {v.model}</DialogTitle>
                <DialogDescription>
                  {v.year} {v.make} {v.model} {v.trim} · ${v.price.toLocaleString("en-US")}
                </DialogDescription>
              </DialogHeader>
              <DialogBody>
                <div className="grid gap-5">
                  <Field label="Full name">
                    <Input name="d-name" autoComplete="name" />
                  </Field>
                  <Field label="Phone number" hint="We reply the same day.">
                    <Input name="d-phone" type="tel" autoComplete="tel" />
                  </Field>
                </div>
              </DialogBody>
              <DialogFooter>
                <Button variant="quiet">Cancel</Button>
                <Button>Send enquiry</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary">Open sheet</Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <SheetBody>
                <div className="grid gap-5">
                  <Field label="Body style">
                    <Select name="type">
                      <option>All body styles</option>
                      <option>Trucks</option>
                      <option>SUVs</option>
                    </Select>
                  </Field>
                </div>
              </SheetBody>
            </SheetContent>
          </Sheet>
        </div>
      </section>

      <Rule className="my-12" />

      <section aria-labelledby="s-specs">
        <SectionHeading as="h2" title="Specification" id="s-specs" />
        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <SpecTable
            specs={[
              { label: "Odometer", value: `${v.miles.toLocaleString("en-US")} mi` },
              { label: "Drivetrain", value: v.drivetrain },
              { label: "Transmission", value: v.transmission },
              { label: "Economy", value: `${v.mpg} mpg` },
              { label: "Output", value: `${v.horsepower} hp` },
              { label: "Exterior", value: v.exterior },
            ]}
          />
          <CompareTable
            headings={[vehicles[2].model, vehicles[4].model]}
            rows={[
              {
                label: "Price",
                values: [
                  `$${vehicles[2].price.toLocaleString("en-US")}`,
                  `$${vehicles[4].price.toLocaleString("en-US")}`,
                ],
              },
              { label: "Drivetrain", values: [vehicles[2].drivetrain, vehicles[4].drivetrain] },
              { label: "Fuel", values: [vehicles[2].fuel, vehicles[4].fuel] },
              {
                label: "Output",
                values: [`${vehicles[2].horsepower} hp`, `${vehicles[4].horsepower} hp`],
              },
            ]}
          />
        </div>
      </section>

      <Rule className="my-12" />

      <section aria-labelledby="s-prose">
        <SectionHeading as="h2" title="Prose" id="s-prose" />
        <Prose className="mt-6">
          <p>
            Running text is capped at 68 characters. On the content routes this replaces lines that
            ran the full container width, which on a wide screen put well over 120 characters on a
            line.
          </p>
          <h3>A sub-heading</h3>
          <p>
            Body copy sits at 17px with a 1.6 line height. <strong>Emphasis</strong> is carried by
            weight and ink, never by colour alone.
          </p>
        </Prose>
      </section>
    </main>
  );
}
