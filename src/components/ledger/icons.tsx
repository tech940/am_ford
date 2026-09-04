import { cn } from "@/lib/utils";

/**
 * Ledger iconography — drawn for this site, not imported from a set.
 *
 * lucide is on nearly every generated interface, and its rounded caps and 2px stroke read as
 * "default UI" rather than as this dealership. These are built to sit with Archivo: a 1.5px
 * stroke, BUTT caps and MITER joins, mostly straight runs and right angles, curves only where
 * the object is genuinely round. The reference is a technical drawing on a service sheet, not
 * a UI kit.
 *
 * 24x24 grid, 2px keyline margin, so glyphs optically match Archivo's cap height at 1em.
 */
type IconProps = React.SVGProps<SVGSVGElement> & { title?: string };

function Svg({ className, title, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      className={cn("shrink-0", className)}
      {...props}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

/** Odometer: a sweep dial with a needle. Straight needle, flat tick marks. */
export function IconOdometer(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 17a9 9 0 0 1 18 0" />
      <path d="M3 17h2M19 17h2M12 6V4M6.2 8.2 4.8 6.8M17.8 8.2l1.4-1.4" />
      <path d="M12 17 16 11" />
    </Svg>
  );
}

/** Fuel: a pump body with a hose arm. All right angles. */
export function IconFuel(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 21V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16" />
      <path d="M3 21h11" />
      <path d="M4 11h9" />
      <path d="M16 8h3a1 1 0 0 1 1 1v8a1.5 1.5 0 0 1-3 0v-4h-4" />
    </Svg>
  );
}

/** Electric: a bolt cut as straight segments, no curve. */
export function IconBolt(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M13 3 5 14h6l-1 7 8-11h-6z" />
    </Svg>
  );
}

/** Drivetrain: an axle between two wheels. */
export function IconDrivetrain(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="6" cy="12" r="3.5" />
      <circle cx="18" cy="12" r="3.5" />
      <path d="M9.5 12h5" />
      <path d="M6 5.5v3M18 5.5v3M6 15.5v3M18 15.5v3" />
    </Svg>
  );
}

/** Output: a piston in a bore. */
export function IconOutput(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M7 3h10v7H7z" />
      <path d="M7 6.5h10" />
      <path d="M12 10v4" />
      <path d="M9 14h6v7H9z" />
    </Svg>
  );
}

/** Save: a hanging tag, not a heart. A dealership tags a car; it does not love it. */
export function IconTag({ filled, ...p }: IconProps & { filled?: boolean }) {
  return (
    <Svg {...p}>
      <path d="M3 4h9l9 8-9 8H3z" fill={filled ? "currentColor" : "none"} />
      <path
        d="M7 12h.01"
        strokeWidth={2.5}
        stroke={filled ? "var(--background)" : "currentColor"}
      />
    </Svg>
  );
}

/** Compare: two stacked measures of different length. */
export function IconCompare(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 7h14M3 7v-2M3 7v2" />
      <path d="M3 17h8M3 17v-2M3 17v2" />
      <path d="M17 5v4M11 15v4" />
    </Svg>
  );
}

/** Check: a hard angle, no easing. */
export function IconCheck(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 12.5 9.5 18 20 6" />
    </Svg>
  );
}

/** Close. */
export function IconClose(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 5 19 19M19 5 5 19" />
    </Svg>
  );
}

/** Phone: a handset drawn as a rectangle at an angle. */
export function IconPhone(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 3H4v4c0 7.2 5.8 13 13 13h4v-4l-4.5-1.5-2 2.5a15.5 15.5 0 0 1-5.5-5.5l2.5-2z" />
    </Svg>
  );
}

/** Location: a pin with a flat point. */
export function IconPin(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </Svg>
  );
}

/** Search. */
export function IconSearch(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21" />
    </Svg>
  );
}

/** Filter: three sliders at different positions. */
export function IconFilter(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 7h18M3 12h18M3 17h18" />
      <path d="M8 5v4M15 10v4M6 15v4" />
    </Svg>
  );
}

/** Arrow: a straight shaft with a flat chevron head. */
export function IconArrowRight(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 12h15" />
      <path d="M13 6l6 6-6 6" />
    </Svg>
  );
}

export function IconChevronDown(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 9l7 7 7-7" />
    </Svg>
  );
}

export function IconChevronRight(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9 5l7 7-7 7" />
    </Svg>
  );
}

/** Lock: a square body with a squared shackle. Used on the price-enquiry affordance. */
export function IconLock(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 10h16v11H4z" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M12 14v3" />
    </Svg>
  );
}

/** Price tag turned down-right, for the savings marker. */
export function IconSavings(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3H3v9l9 9 9-9z" />
      <path d="M7 7h.01" strokeWidth={2.5} />
    </Svg>
  );
}
