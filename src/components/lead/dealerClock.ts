import { dealerInfo } from "@/lib/vehicles";

/**
 * Is the sales desk open right now, and when does it next change.
 *
 * Parsed from `dealerInfo.hours`, never hardcoded. The hours strings are content the
 * dealership can edit, and a dialog that says "we open at 9:00 AM" because a developer typed
 * it there will keep saying it the day those hours change.
 *
 * Returns `null` when a row does not parse. Every consumer renders NOTHING in that case
 * rather than guessing: a wrong claim about whether a business is open is worse than no claim,
 * because the visitor plans around it.
 */
export type DealerStatus = {
  open: boolean;
  /** Present when open: the time the desk closes today, e.g. "8:00 PM". */
  closesAt?: string;
  /** Present when closed: the next day with hours, e.g. "Monday" or "today". */
  opensDay?: string;
  /** Present when closed: that day's opening time, e.g. "9:00 AM". */
  opensAt?: string;
};

/** Sun..Sat -> index into dealerInfo.hours (Mon-Thu, Fri, Sat, Sun). Mirrors TheStore. */
const HOURS_INDEX = [3, 0, 0, 0, 0, 1, 2];

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** "9:00 AM" -> minutes since midnight. `null` on anything that is not that shape. */
function toMinutes(clock: string): number | null {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(clock.trim());
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 1 || h > 12 || min > 59) return null;
  const pm = m[3].toUpperCase() === "PM";
  if (h === 12) h = 0;
  return (pm ? h + 12 : h) * 60 + min;
}

/** "9:00 AM - 8:00 PM" -> the pair, or `null` for "Closed" and for anything unparseable. */
function parseRow(time: string): { open: number; close: number; openLabel: string } | null {
  const parts = time.split("-");
  if (parts.length !== 2) return null;
  const open = toMinutes(parts[0]);
  const close = toMinutes(parts[1]);
  if (open === null || close === null || close <= open) return null;
  return { open, close, openLabel: parts[0].trim() };
}

export function dealerStatus(now: Date): DealerStatus | null {
  const day = now.getDay();
  const todayRow = dealerInfo.hours[HOURS_INDEX[day]];
  if (!todayRow) return null;

  const minutes = now.getHours() * 60 + now.getMinutes();
  const today = parseRow(todayRow.time);

  // Unparseable and not the literal "Closed" means the content changed shape. Say nothing.
  if (!today && todayRow.time.trim().toLowerCase() !== "closed") return null;

  if (today && minutes >= today.open && minutes < today.close) {
    return { open: true, closesAt: todayRow.time.split("-")[1].trim() };
  }

  // Before opening on a day that has hours: the desk opens later today.
  if (today && minutes < today.open) {
    return { open: false, opensDay: "today", opensAt: today.openLabel };
  }

  // Otherwise walk forward to the next day that has hours at all.
  for (let step = 1; step <= 7; step++) {
    const next = (day + step) % 7;
    const row = dealerInfo.hours[HOURS_INDEX[next]];
    const parsed = row ? parseRow(row.time) : null;
    if (parsed) {
      return {
        open: false,
        opensDay: step === 1 ? "tomorrow" : DAY_NAMES[next],
        opensAt: parsed.openLabel,
      };
    }
  }

  // Seven closed days. Impossible for a dealership, but returning a claim here would be one.
  return null;
}

/** "Open until 8:00 PM today." / "Closed today. We open at 9:00 AM Monday." */
export function dealerStatusLine(status: DealerStatus | null): string | null {
  if (!status) return null;
  if (status.open && status.closesAt) return `Open until ${status.closesAt} today.`;
  if (!status.open && status.opensAt && status.opensDay) {
    // "Closed today" would be false before opening on a day that does have hours.
    const lead = status.opensDay === "today" ? "Closed right now" : "Closed today";
    return `${lead}. We open at ${status.opensAt} ${status.opensDay}.`;
  }
  return null;
}
