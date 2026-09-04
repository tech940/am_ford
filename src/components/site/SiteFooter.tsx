import { Link } from "@tanstack/react-router";
import { MAPS_DIRECTIONS_HREF, dealerInfo } from "@/lib/vehicles";
import logo from "@/assets/am-ford-logo.png";

/**
 * The site frame, bottom. Rendered on every page: where the store is, when it is open, how to reach it, every route.
 * It closes nothing and sells nothing. It is the one surface on the page made of a different
 * material, which is how a document ends.
 *
 * No wordmark image. The artwork is dark on light, which the version this replaces proved by
 * mounting the logo on a white plate, and there is no knockout asset. On an ink ground the
 * choice is a white plate or type, and the plate is the thing we deleted. The nav's wordmark is
 * a home link at every scroll position, so a second link with the same accessible name was
 * noise anyway.
 *
 * The ground is `ink`, not `brand`. The navy footer was the largest accent area on the site,
 * spent on the one region that carries no argument. Ink terminates the page and costs the
 * accent budget nothing, which is also why the phone here is paper rather than navy: brand on
 * ink measures 1.30:1.
 *
 * The address is the directions link. There is no directions button, because the page has one
 * and it is in TheStore's facts rule.
 */
const INDEX = [
  { to: "/inventory", label: "Inventory" },
  { to: "/ford-models", label: "Ford Models" },
  { to: "/compare", label: "Compare Models" },
  { to: "/guides", label: "Buying Guides" },
  { to: "/areas-we-serve", label: "Areas We Serve" },
  { to: "/nationwide-vehicle-delivery", label: "Vehicle Delivery" },
  { to: "/financing", label: "Financing" },
  { to: "/trade-in", label: "Value Your Trade" },
  { to: "/commercial", label: "Commercial" },
  { to: "/service", label: "Service" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background";

export function SiteFooter() {
  return (
    <footer className="bg-ink">
      <div className="mx-auto max-w-[1200px] px-5 py-12 md:px-10 md:py-14 lg:px-16">
        <div className="grid gap-y-10 md:grid-cols-2 md:gap-x-10 lg:flex lg:items-start lg:justify-between lg:gap-x-16">
          {/* THE RECORD */}
          <div className="lg:max-w-[18rem]">
            {/* The client-supplied lockup. Navy on transparency, so it rides a white plate
                on the ink ground, same treatment as the nav. */}
            <span className="inline-flex items-center bg-white px-3 py-2">
              <img src={logo} alt="AM Ford" width={520} height={161} className="h-8 w-auto" />
            </span>
            <p className="mt-3 font-sans text-meta text-background/70">
              Formerly {dealerInfo.formerName}.
            </p>

            <address className="mt-6 not-italic">
              <a
                href={MAPS_DIRECTIONS_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className={`block max-w-[15rem] font-sans text-ui leading-relaxed text-background underline-offset-4 hover:underline ${FOCUS}`}
              >
                {dealerInfo.address}
              </a>
              <a
                href={dealerInfo.phoneHref}
                className={`mt-4 inline-flex min-h-11 items-center font-sans text-h3 font-semibold tabular-nums text-background underline-offset-4 hover:underline ${FOCUS}`}
              >
                {dealerInfo.phone}
              </a>
            </address>
          </div>

          {/* THE HOURS. The page's only complete week, absorbed from the deleted VisitUs. */}
          <div className="lg:min-w-[13rem]">
            <h2 className="font-sans text-ui font-semibold text-background">Hours</h2>
            <dl className="mt-3">
              {dealerInfo.hours.map((h) => (
                <div
                  key={h.day}
                  className="flex items-baseline justify-between gap-6 border-b border-background/15 py-2 last:border-b-0"
                >
                  <dt className="font-sans text-meta text-background/70">{h.day}</dt>
                  <dd
                    className={`font-sans text-meta tabular-nums ${
                      h.time === "Closed" ? "text-background/70" : "text-background"
                    }`}
                  >
                    {h.time}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* THE INDEX. Column-major so the browse group and the transact group stay whole.
              No heading: twelve route names need no label, and the landmark is named. */}
          <nav aria-label="Site index" className="md:col-span-2 lg:col-auto">
            <ul className="grid grid-flow-col grid-rows-6 gap-x-8 md:grid-rows-4 lg:grid-rows-6 lg:gap-x-10">
              {INDEX.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className={`flex min-h-11 items-center font-sans text-meta font-medium text-background/70 transition-colors duration-150 hover:text-background lg:min-h-8 ${FOCUS}`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-background/15 pt-6">
          <p className="font-sans text-meta text-background/70">
            © {new Date().getFullYear()} {dealerInfo.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
