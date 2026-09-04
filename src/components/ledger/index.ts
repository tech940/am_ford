/**
 * Ledger — the AM Ford design system.
 *
 * Behaviour from Radix, surface from our tokens. Every page composes from this barrel and
 * nothing else; a page that reaches for a raw `<button>` or hand-rolls an overlay is the
 * drift this layer exists to prevent.
 *
 * The rules the components encode, so they do not have to be remembered:
 *   - One filled button per view. Two `primary` buttons in one screen is a design error.
 *   - Structure is square. `rounded-full` belongs to Chip and nothing else.
 *   - Every form control gets its label, id and error wiring from Field, not by hand.
 *   - Every overlay shares one z tier; stacking comes from the order things were opened.
 *   - Specification is a ledger, not a grid of cards.
 */
export { Button, buttonVariants, type ButtonProps } from "./Button";
export {
  Field,
  Input,
  Textarea,
  Select,
  ConsentCheckbox,
  ChoiceGroup,
  type FieldProps,
} from "./Field";
export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "./Dialog";
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
} from "./Sheet";
export { Chip, type ChipProps } from "./Chip";
export { SpecTable, CompareTable, type Spec } from "./SpecTable";
export { Prose, SectionHeading, Rule } from "./Prose";
export * from "./icons";
