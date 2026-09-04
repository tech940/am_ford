import { Link } from "@tanstack/react-router";
import { IconChevronRight } from "@/components/ledger";
import type { Crumb } from "@/lib/breadcrumbs";

/**
 * Visible breadcrumb trail. Pair it with breadcrumbSchema(crumbs) in the route's
 * head() so the rendered trail and the structured data always agree, which is what
 * Google requires before it will show breadcrumbs in place of the raw URL.
 *
 * The last crumb is the current page: rendered as text, marked aria-current.
 */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  if (items.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className={className ?? "mx-auto max-w-7xl px-6  pb-2"}>
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs font-medium text-ink-3">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1">
              {c.href && !last ? (
                <Link
                  to={c.href}
                  className="inline-block py-1.5 transition-colors hover:text-primary hover:underline"
                >
                  {c.label}
                </Link>
              ) : (
                <span className="inline-block py-1.5 text-ink" aria-current="page">
                  {c.label}
                </span>
              )}
              {!last && (
                <IconChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
