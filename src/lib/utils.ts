import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge has to be told about the Ledger type scale.
 *
 * Out of the box it classifies `text-*` by matching known size keywords (xs, sm, base, lg,
 * 2xl...). Our scale uses names it has never seen — `text-ui`, `text-meta`, `text-h2` — so it
 * filed them under text-COLOUR and then deduped them against real colours. The visible effect
 * was that `bg-brand text-white ... text-ui` rendered with `text-white` silently removed, so
 * every sized primary button drew ink-on-navy at roughly 1.9:1 instead of white-on-navy.
 *
 * Registering the scale as font sizes puts the two groups back in separate namespaces.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: ["micro", "meta", "ui", "body", "h3", "h2", "h1", "display", "figure", "figure-lg"],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
