import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Ported with the WhatWeSell section: stock tailwind-merge classifies unknown `text-*`
 * utilities as COLOURS, so `cn("text-ui", ..., "text-ink")` silently deletes the size. The
 * v2 branch hit this as a live bug (it erased `text-white` off every sized button); this
 * teaches the merger this theme's custom font-size tokens.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["micro", "meta", "ui", "h3"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
