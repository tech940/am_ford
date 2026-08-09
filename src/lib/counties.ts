import { dealerInfo, DELIVERY_CLAIM } from "@/lib/vehicles";
import { SERVICE_AREAS } from "@/lib/serviceAreas";

/**
 * Content source for the "Areas We Serve" COUNTY pages at /ford-dealer/county/{slug}.
 *
 * This file exists for the same reason serviceAreas.ts does, and it is written under the
 * same discipline. The eight city pages were rebuilt after they turned out to be 41%
 * verbatim identical, carrying one unbroken 244 word block that appeared on all of them.
 * That is the doorway page pattern, and the fix was structural rather than editorial:
 * every sentence a visitor reads lives in the data file, written once per area, and the
 * route renders it. The route never supplies prose of its own.
 *
 * The rule that keeps that true here: if a paragraph would render identically on all four
 * county pages, it does not belong in the route component. Section HEADINGS live in this
 * file too, not just section bodies, because a heading rendered as `Why {county} drivers
 * choose us` is still one template stamped four times.
 *
 * Four rules are load-bearing for every entry:
 *  1. AM Ford has ONE location, in Jefferson, Ohio, which is the Ashtabula County seat.
 *     Every entry says so in its own words. A county page must be impossible to read as a
 *     branch office in Painesville, Chardon, or Warren.
 *  2. Address and delivery wording are interpolated from `@/lib/vehicles`, never retyped,
 *     so DELIVERY_CLAIM cannot be shortened or paraphrased by an edit here.
 *  3. Each county has an ANGLE, and the angles do not blend. Ashtabula is the home county.
 *     Lake is about commuting mileage, so efficiency leads instead of four-wheel drive.
 *     Geauga is about traction, clearance, and tires. Trumbull is about work vehicles.
 *     Writing all four in one house voice would rebuild the problem in a new place.
 *  4. Facts are limited to geography, road names, seasonal weather, and driving behaviour.
 *     No populations, no county rankings, no snowfall figures, no market share, no
 *     dealership history, no awards, no review counts.
 */
export type County = {
  slug: string;
  /** Full name as it should appear in copy, e.g. "Ashtabula County". */
  county: string;
  state: "OH";
  /** County seat. Named because it is the one place name every county reader recognises. */
  countySeat: string;
  /**
   * Whether the showroom stands inside this county.
   *
   * "home" is Ashtabula County only, and it changes the framing of the whole page: that
   * page is not "we serve you from a distance", it is "we are in the county with you".
   * The route reads this field rather than testing the slug, so the distinction survives.
   */
  relation: "home" | "neighboring";
  /** One hedged line about the trip. Never a promised drive time. */
  approach: string;
  /** The <title>. Authored per county, under 60 characters WITH the brand appended. */
  title: string;
  /** The <h1>. There is exactly one per page and this is it. */
  h1: string;
  /** Meta description under 155 characters, leading with this county's own angle. */
  metaDescription: string;
  /** og:description. Separate from metaDescription so neither is a truncation of the other. */
  ogDescription: string;
  /** Opening paragraph about the county itself, not about the dealership. */
  intro: string;
  /** The land and how it drives. Different subject in every entry. */
  landscape: { heading: string; body: string };
  /** The roads, from this county specifically, to Jefferson. */
  directions: { heading: string; body: string };
  /** The county's angle, written at length. This is the section that earns the page. */
  angle: { heading: string; body: string };
  /** A fifth section, on a subject no other county entry raises. */
  extra: { heading: string; body: string };
  /** Requirements that genuinely follow from living in this county. */
  needs: { heading: string; items: string[] };
  /** Lead-in for the saved-search block, framed the way this county shops. */
  searches: { heading: string; body: string };
  /**
   * Deep links into /inventory. Every search here returns results against the current
   * dataset, which is 5 new vehicles plus 1 certified pre-owned. Nothing may imply a used
   * truck inventory, because there is not one.
   */
  popularWith: { label: string; search: Record<string, string> }[];
  /**
   * The model lineup for this county, including the reason each model is here. Kept in the
   * data file rather than the route so no two counties can end up sharing a lineup or a
   * rationale. Slugs resolve against FORD_MODELS; an unknown slug drops out silently.
   */
  models: { heading: string; intro: string; picks: { slug: string; why: string }[] };
  /**
   * City pages that sit inside this county. The route derives its down-links from this
   * field, so adding a city page is a one line change here and nothing in the route.
   * Anchor text and drive times for these links come from the matching ServiceArea record,
   * which means the anchors stay descriptive and stay unique per city for free.
   */
  childCitySlugs: string[];
  /** Lead-in for the child link block, or, where there are no children, for the block that replaces it. */
  childBlock: { heading: string; body: string };
  /**
   * Rendered INSTEAD of child city links when childCitySlugs is empty. Trumbull County has
   * no city page and must never appear to have one, so it points sideways and upwards
   * rather than down. Paths are plain strings resolved by the router at runtime.
   */
  alternativeLinks?: { to: string; label: string }[];
  /**
   * Towns in this county that we serve and that have no page. Named as plain text, never
   * linked. Fabricating a link to a page that does not exist is worse than not linking.
   */
  alsoServed: { heading: string; body: string; towns: string[] };
  closing: { heading: string; body: string };
  cta: { heading: string; body: string; inventoryLabel: string };
};

export const COUNTIES: County[] = [
  {
    slug: "ashtabula-oh",
    county: "Ashtabula County",
    state: "OH",
    countySeat: "Jefferson",
    relation: "home",
    approach:
      "No county line to cross. Jefferson sits near the middle of the county and our address is on Route 46.",
    title: "Ashtabula County Ford Dealer in Jefferson | AM Ford",
    h1: "Buying a Ford Without Leaving Ashtabula County",
    metaDescription:
      "AM Ford is in Jefferson, the Ashtabula County seat, on Route 46. New Ford trucks and SUVs, certified pre-owned, and service inside the county.",
    ogDescription: `AM Ford sells and services from ${dealerInfo.address}, in the Ashtabula County seat. New Ford trucks, SUVs, and cars plus certified pre-owned, with service that never takes you out of the county.`,
    intro: `Ashtabula County covers a lot of ground and it does not behave like one place. The north end is lakefront: harbors, beaches, vineyards, and communities that fill up through the summer and empty again in October. Drive south and the same county turns into row crops, covered bridges, township roads, and long quiet stretches between villages. Jefferson sits near the middle of all of it as the county seat, and Jefferson is the town AM Ford is in. Our address is ${dealerInfo.address}, and it is the only one we have, so nothing on this page is a claim about a branch somewhere else in the county.`,
    landscape: {
      heading: "The north half and the south half do not ask for the same vehicle",
      body: "Lakefront driving here is about salt and short trips. Roads near the water are treated heavily through a long winter, the older harbor neighborhoods are laid out tight, and a lot of the mileage gets measured in minutes rather than miles. The southern townships are the opposite problem. Distances are longer, the pavement runs out sooner, farm equipment shares the road through planting and harvest, and the plow finishes the state routes long before it reaches a gravel township road. Households near the middle often do both in the same week. When somebody tells us which end of the county they live at, that answers most of the question about which vehicle suits them before anyone has said the word trim.",
    },
    directions: {
      heading: "The four roads that hold the county together",
      body: "Route 11 runs north and south along the western side and carries most of what comes up from Trumbull County. Route 20 crosses east to west a few miles inland from the lake, and Interstate 90 runs roughly parallel further north, with the Austinburg interchange as the usual way onto it from the middle of the county. Route 46 is the north to south spine and our address sits on it. Whichever of those you start on, the last stretch is Route 46 into Jefferson rather than a highway exit into a retail strip.",
    },
    angle: {
      heading: "What changes when the dealership is in your county",
      body: "The sale is the short part of owning a vehicle. Everything after it is where the address matters. A recall notice, a warranty repair, a check engine light on a Tuesday morning, the first oil change, a tire that picked up a screw on a gravel road: all of that is a local errand rather than a highway trip and a lost afternoon. It also means the people looking at your vehicle drive the same roads it does, so salt on the frame or dust in the cabin filter does not need explaining. The trade-off in the other direction deserves saying out loud. A large metro store will have more units standing on the ground on any given day than we do, and if the thing that matters most to you is choosing between a dozen of the same model in different colors, that is a genuine argument for driving toward Cleveland. What we can offer instead is a vehicle specified properly, ordered if it needs to be, and then serviced for years without anyone crossing a county line.",
    },
    extra: {
      heading: "Living with a salted road for half the year",
      body: "Roads here get treated hard and for a long stretch of the year, and the vehicles show it. That has practical consequences worth knowing before you buy anything, new or certified pre-owned. Salt does its work from underneath, so brake and fuel lines, their clips, subframes, exhaust hangers, and the pinch welds along the sills are where to look rather than at the paint. On a certified pre-owned vehicle, ask to see the underside on a lift instead of in a parking space, and look at whether corrosion is surface scale or has started to flake and lift. On a new vehicle the useful habits are cheap and dull: rinse the underside on the days the temperature climbs above freezing, keep the drain holes in the doors and sills clear, and deal with a stone chip before the winter rather than after it. None of that is exotic. It is most of the difference between a truck that is still working on these roads years from now and one that quietly rots from the bottom up.",
    },
    needs: {
      heading: "What Ashtabula County drivers come in for",
      items: [
        "Four-wheel drive that earns its keep on a township road before the plow has been down it",
        "Undercarriage and paint looked at properly, because the salt season here is long",
        "Towing setups for boat trailers heading north and equipment trailers heading south",
        "Vehicles that live outdoors all year rather than in a heated garage",
        "Service booked around planting, harvest, and the summer rush on the lakefront",
        "Trade appraisals on older vehicles that spent their working life on county roads",
      ],
    },
    searches: {
      heading: "Start from the lot as it stands today",
      body: "Each link opens the current inventory with one filter already set, so what comes back is what is standing in Jefferson rather than a regional listing that sends you somewhere else to look at it.",
    },
    popularWith: [
      {
        label: "Four-wheel drive trucks and SUVs for county roads",
        search: { drive: "4WD" },
      },
      {
        label: "SUVs for households that drive both ends of the county",
        search: { type: "SUV" },
      },
      {
        label: "Certified pre-owned Ford models in Jefferson",
        search: { badges: "certified-pre-owned" },
      },
    ],
    models: {
      heading: "Ford models that suit a county with two halves",
      intro:
        "Picked for the split described above: something for the gravel and the trailer, something for the school run, and something small enough for a tight street near the water.",
      picks: [
        {
          slug: "f-150",
          why: "The usual answer when the job involves a trailer, a load of feed, or a driveway that has never been graded. Four-wheel drive is available across most of the lineup, which counts for more here than any styling choice.",
        },
        {
          slug: "explorer",
          why: "Three rows and available all-wheel drive for the households that run between the lakefront and the southern townships in the same week.",
        },
        {
          slug: "bronco",
          why: "Real ground clearance and a body-on-frame layout for people who leave the pavement on purpose, with removable roof panels for the short part of the year that rewards them.",
        },
        {
          slug: "escape",
          why: "The easiest of these to place in an older harbor neighborhood, and the hybrid version does its best work on the short local trips that make up most of a week here.",
        },
      ],
    },
    childCitySlugs: ["ashtabula-oh", "geneva-oh", "conneaut-oh", "austinburg-oh"],
    childBlock: {
      heading: "Communities in Ashtabula County with their own page",
      body: "Four towns in the county have a page of their own, covering the drive, the roads out of that town specifically, and what people from there usually shop for. If yours is not among them, that means the page has not been written yet rather than that we do not sell there.",
    },
    alsoServed: {
      heading: "Elsewhere in the county",
      towns: [
        "Andover",
        "Orwell",
        "Rock Creek",
        "Kingsville",
        "North Kingsville",
        "Saybrook",
        "Pierpont",
      ],
      body: "These are all inside the same county lines and a short drive from Jefferson. None of them has a page of its own, so they are listed as places we serve rather than as pages that do not exist.",
    },
    closing: {
      heading: "The county seat, and the whole trip inside the county",
      body: "Whichever corner you start from, the drive finishes on Route 46 in Jefferson without crossing a county line. That is worth more at the first service appointment than it is on the day you sign anything.",
    },
    cta: {
      heading: "Come and look at what is on the lot",
      body: "Tell us which end of the county you live at and what the last vehicle gave up on, and we will start from there instead of from a brochure.",
      inventoryLabel: "See what is on the lot in Jefferson today",
    },
  },
  {
    slug: "lake-oh",
    county: "Lake County",
    state: "OH",
    countySeat: "Painesville",
    relation: "neighboring",
    approach:
      "Roughly half an hour from the eastern end of the county, longer from Painesville and points west.",
    title: "Ford Dealer for Lake County Commuters | AM Ford",
    h1: "A Ford Dealer for the Lake County Commute",
    metaDescription:
      "Lake County runs on Interstate 90 mileage, which makes efficiency the honest place to start. New Ford hybrids, SUVs, and trucks in Jefferson, Ohio.",
    ogDescription: `Lake County is the densest, highest mileage part of the region we serve, so this page leads with running cost rather than four-wheel drive. AM Ford sells and services from one address, ${dealerInfo.address}. ${DELIVERY_CLAIM}`,
    intro: `Lake County is the most built-up part of the region we serve. Painesville is the county seat, Mentor is the largest city anywhere in our area, and the stretch between them is continuous in a way that nothing in Ashtabula or Geauga County is. What shapes daily life here is not the weather. It is distance. Plenty of Lake County households point a vehicle west in the morning and bring it back east at night, five days a week, and that pattern quietly decides what the vehicle costs to own. AM Ford has no Lake County location. We sell and service from one address, ${dealerInfo.address}, east of the county line.`,
    landscape: {
      heading: "Three roads running the same direction",
      body: "Interstate 90, Route 2, and Route 20 all cross the county east to west within a few miles of one another, which is unusual and useful, because when one of them is closed or crawling the other two are generally moving. What the county has less of is north to south. Getting between the lakeshore and the southern townships means local roads, and those are the trips that take longer than the map suggests they should. Toward the eastern end, out past Perry and Madison, the density falls away and the county starts behaving like the one next door: fewer lights, longer gaps between things, and shore roads where ice turns up before snow does.",
    },
    directions: {
      heading: "Driving east is driving against the flow",
      body: "From the eastern half of the county it is Route 20 east, or Interstate 90 east to the Austinburg interchange and then Route 45 southeast. From Painesville, Mentor, or anywhere west of them it is the same two choices with more miles in front of them. The part worth knowing is that both point away from the direction everyone else is going at either end of the day, so a trip out this way frequently moves better than a shorter one toward the city.",
    },
    angle: {
      heading: "Working out what the commute costs before you shop",
      body: "Fuel efficiency gets treated as a nice-to-have and then turns into one of the largest running costs a Lake County household carries. It is worth doing that arithmetic with your own numbers rather than a brochure figure. Start with the round trip you drive on a working day, add the errands you forget to count, and multiply across a year. Then work out what that distance costs in each vehicle on your shortlist at the fuel price you actually pay. Two things usually surprise people. The first is where a hybrid's advantage comes from. It is strongest in the stop-and-go at both ends of a commute, where the engine can rest and braking puts charge back, and it narrows on a long steady run at highway speed. If your day is mostly the former, the case is strong. If it is one uninterrupted highway hour, be honest about that and let the comparison say so. The second is tires. Highway miles are gentle on brakes and hard on tires, so ask what a replacement set costs in the wheel size you are considering before the wheel package quietly decides itself. And if you tow anything with any regularity, efficiency is the wrong thing to lead with, and we would rather say that early than sell around it.",
    },
    extra: {
      heading: "Why this page does not lead with four-wheel drive",
      body: "Every other county we write about here gets a traction argument, and this one deliberately does not. Lake County gets real winters, and nobody should read this as a suggestion that a Lake County driver never needs grip. The point is narrower than that. When the majority of a vehicle's life is spent on a plowed and treated four-lane, the number of days a year that a drive system is the deciding factor is small, and the number of days that fuel consumption is the deciding factor is every single one of them. All-wheel drive still makes obvious sense for the shore roads at the eastern end of the county, for households with a steep or long driveway, and for anyone whose work does not stop when the weather does. What it does not do is justify itself automatically, and it does carry a running cost in fuel and in tires. The honest version is that traction is a requirement to be assessed rather than a default to be assumed, and on this side of the region the assessment quite often comes back the other way.",
    },
    needs: {
      heading: "What Lake County drivers ask us about",
      items: [
        "Cost per year rather than cost per tank, worked out against a real weekly distance",
        "Hybrids for the household where one vehicle heads west five days a week",
        "Seats and driver assistance that hold up through an hour of Interstate 90",
        "All-wheel drive for the shore roads east of Painesville, where ice beats the snow",
        "A second vehicle that spends nearly all of its life on short local trips",
        "An early service slot, so the vehicle is back before the evening flow builds",
      ],
    },
    searches: {
      heading: "Efficiency first, traction second",
      body: "That is the order the arithmetic above suggests for most of this county, so the filters below follow it. Each one opens the current stock with that setting applied.",
    },
    popularWith: [
      {
        label: "Hybrid vehicles for Interstate 90 mileage",
        search: { fuel: "Hybrid" },
      },
      {
        label: "Electric vehicles for households that charge overnight",
        search: { fuel: "Electric" },
      },
      {
        label: "All-wheel drive SUVs for the shore road stretch",
        search: { type: "SUV", drive: "AWD" },
      },
    ],
    models: {
      heading: "Ford models that suit a high-mileage week",
      intro:
        "Ordered by what a year of driving costs rather than by sticker price, because that is the sum most of this county is quietly running in the background anyway.",
      picks: [
        {
          slug: "escape",
          why: "A compact crossover with a hybrid drivetrain, at its best in the stop-and-go at both ends of a commute rather than in the middle of one.",
        },
        {
          slug: "f-150-lightning",
          why: "If the driveway can take a charger and the daily distance is predictable, an electric pickup converts the commute into an overnight cost instead of a weekly stop at the pump.",
        },
        {
          slug: "explorer",
          why: "Three rows and available all-wheel drive for the households covering a school run and a highway hour before nine in the morning.",
        },
        {
          slug: "f-150",
          why: "Still the right answer when the commute ends at a job site, or when there is a trailer in the picture often enough that fuel economy is the wrong first question.",
        },
      ],
    },
    childCitySlugs: ["madison-oh"],
    childBlock: {
      heading: "The Lake County community with its own page",
      body: "Madison sits at the eastern edge of the county and is the one Lake County community with a page here so far. It covers the drive east, the shore roads north of Route 20, and what households there tend to shop for.",
    },
    alsoServed: {
      heading: "The rest of Lake County",
      towns: ["Painesville", "Mentor", "Perry", "Concord", "Willoughby", "Kirtland"],
      body: "All of these are places we sell to and none of them has a page here yet, so they are named rather than linked. Sending you to a page that has not been written would waste the click.",
    },
    closing: {
      heading: "Or skip the drive altogether",
      body: `A long commute is exactly the thing that makes a Saturday spent at a dealership hard to justify. ${DELIVERY_CLAIM} Most Lake County buyers still come out once to drive the vehicle they have narrowed it down to, and leave the rest of it to us.`,
    },
    cta: {
      heading: "Run the numbers with us",
      body: "Bring your weekly distance and the fuel price you actually pay, and we will compare the specific vehicles standing on the lot instead of quoting a generic estimate at you.",
      inventoryLabel: "See the hybrids, SUVs, and trucks in stock",
    },
  },
  {
    slug: "geauga-oh",
    county: "Geauga County",
    state: "OH",
    countySeat: "Chardon",
    relation: "neighboring",
    approach:
      "About an hour from Chardon, by Route 322 east or by Interstate 90 when the weather is doing something.",
    title: "Geauga County Snowbelt Ford Dealer | AM Ford",
    h1: "Ford Trucks and SUVs for the Geauga County Snowbelt",
    metaDescription:
      "Traction, ground clearance, and tires all decide a Geauga County winter. New Ford four-wheel and all-wheel drive stock in Jefferson, Ohio.",
    ogDescription: `Geauga County sits high enough that winter decides the vehicle rather than qualifying it. AM Ford stocks four-wheel and all-wheel drive Fords at ${dealerInfo.address}, our only location. ${DELIVERY_CLAIM}`,
    intro: `Geauga County sits high. Air coming inland off Lake Erie climbs the plateau, cools, and unloads, which is why snow here behaves differently from snow twenty minutes north on the flat. Add hills, heavy woodland, ridge roads, long private drives, and a plow order that reaches township roads last, and winter stops being a footnote to the vehicle choice and becomes the thing that decides it. Chardon is the county seat. Around Middlefield there is a large Amish community, and horse-drawn traffic on the county roads is an ordinary part of driving here. AM Ford is not in Geauga County. We have one dealership, at ${dealerInfo.address}, east of the highest ground.`,
    landscape: {
      heading: "Elevation, woodland, and the order the plows run in",
      body: "The practical effect of the terrain is that conditions change over very short distances. A road along a ridge can be blowing and drifting while a valley a mile away is merely wet. Woodland shades long stretches of pavement so they stay frozen well after open road has thawed, and those shaded patches are where most of the surprises happen. Then there is the plow order, which is not a complaint but a fact of a rural county: state routes first, then the busier county roads, then the township roads, then the gravel. If the house is near the end of that list, the vehicle has to cover the gap on its own. That is a different requirement from simply wanting to feel sure-footed on a treated highway.",
    },
    directions: {
      heading: "Two ways east, and the weather picks between them",
      body: "Route 322 east is the direct line from Chardon and the pleasanter drive on a clear day. Interstate 90 by way of the Austinburg interchange is the better call when conditions are poor, because the highway gets cleared long before the township roads do and the snow usually thins out well before Jefferson anyway. From Middlefield and the southern townships, Route 87 and Route 88 head east toward Route 11 and then north. Checking conditions at both ends before setting off is worth the minute it takes, because what is happening on the plateau is frequently not what is happening here.",
    },
    angle: {
      heading: "Sharing a Geauga County road in winter",
      body: "Two things about these roads deserve thought before you choose a vehicle, and neither of them is drivetrain. The first is that you will regularly come up behind something moving far slower than you are: a buggy, a tractor, a plow, a school bus. On a hill or a blind curve, on a surface that is packed rather than clear, the only safe response is patience and a great deal more following distance than the road feels like it needs. Braking distance on packed snow is a multiple of what it is on dry pavement, and no drive system shortens it by a single foot. The second is visibility, in both directions. Winter afternoons here go dark early and the light goes flat, so headlight quality, aim, and clean lenses matter far more than they do under streetlights. Being seen matters just as much: running lamps, clean glass all round, and the discipline to clear the whole vehicle rather than a porthole in the windshield. When we work through options with buyers from this county, headlights, sightlines, mirrors, and brake feel come up before four-wheel drive does, because those are the things that keep you out of the situation traction is supposed to rescue you from.",
    },
    extra: {
      heading: "The wheel and tire choice does more work than the drivetrain badge",
      body: "A drive system helps a vehicle get moving. Tires decide whether it stops and whether it turns, and on these roads that is the larger half of the problem. Two decisions follow. The first is compound. Winter rubber stays soft as the temperature falls, while an all-season tire that felt fine in November stiffens up and gives away grip in January, whatever is driving it. A front-wheel drive car on proper winter tires will out-brake a four-wheel drive truck on worn all-seasons, every time. The second is the wheel package, which is easy to pick for looks and easy to regret in February. A large wheel with a short sidewall cuts through slush poorly, leaves less cushion against a pothole hidden under snow, and costs more to replace. A smaller wheel with a taller sidewall is the quieter, cheaper, more capable winter choice on nearly every vehicle we sell. Ground clearance is the other half of it, because an unplowed township road stops a low vehicle by packing snow underneath it long before grip becomes the limiting factor. Ask us for ride height and tire sizes on anything on the lot and you will get the figures rather than an adjective.",
    },
    needs: {
      heading: "What Geauga County buyers ask for",
      items: [
        "Ground clearance for a township road that has not seen a plow yet",
        "Four-wheel drive for hill starts on packed snow and for long private drives",
        "Straight tire advice, because all-wheel drive on worn all-seasons is not a winter setup",
        "Headlights and mirrors that hold up through a dark afternoon of flat light",
        "All-wheel drive in something smaller, for households that do not want a full-size truck",
        "Remote start and heated glass for a season that runs long up on the plateau",
      ],
    },
    searches: {
      heading: "Capability leads every one of these",
      body: "That is the order shoppers from this county use without being prompted, so it is the order the filters are in. Each opens what is standing on the lot now.",
    },
    popularWith: [
      {
        label: "Off-road rated SUVs for unplowed township roads",
        search: { badges: "off-road" },
      },
      {
        label: "Four-wheel drive trucks and SUVs for snowbelt hills",
        search: { drive: "4WD" },
      },
      {
        label: "All-wheel drive without stepping up to a full-size truck",
        search: { drive: "AWD" },
      },
    ],
    models: {
      heading: "Ford models that suit the plateau",
      intro:
        "Chosen for clearance and traction first, then for how they behave on a shaded curve in flat afternoon light, which is the part that decides more winters than the tailgate lettering does.",
      picks: [
        {
          slug: "bronco",
          why: "Body-on-frame with genuine ground clearance, which is the specification that matters most on a road the plow has not reached.",
        },
        {
          slug: "f-150",
          why: "Four-wheel drive, weight over the rear axle once it is loaded, and a system that will pull away on a hill without hunting for grip.",
        },
        {
          slug: "explorer",
          why: "Three rows and available all-wheel drive for families who want winter capability without moving up to a pickup.",
        },
        {
          slug: "escape",
          why: "The smallest all-wheel drive option here, for drivers who would rather place a shorter vehicle on a narrow, banked county road.",
        },
      ],
    },
    childCitySlugs: ["chardon-oh"],
    childBlock: {
      heading: "The Geauga County community with its own page",
      body: "Chardon has a page of its own, covering the drive east, what the elevation does to a winter, and what the county seat's own drivers usually arrive asking for.",
    },
    alsoServed: {
      heading: "Elsewhere in Geauga County",
      towns: [
        "Burton",
        "Middlefield",
        "Chesterland",
        "Newbury",
        "Parkman",
        "Huntsburg",
        "Montville",
      ],
      body: "All of these sit inside the area we sell to. None has a page of its own, and we would rather name them plainly than manufacture a link to something that is not there.",
    },
    closing: {
      heading: "About an hour east, or no drive at all",
      body: `A lot of buyers from this county build the shortlist by phone and photographs first, then choose between one morning here and having the vehicle turn up at the house instead. ${DELIVERY_CLAIM}`,
    },
    cta: {
      heading: "Ask for the figures, not the adjectives",
      body: "Tell us where you live, how the drive out looks in February, and what your current vehicle struggled with last winter. That is a more useful starting point than a feature list.",
      inventoryLabel: "See the four-wheel and all-wheel drive stock",
    },
  },
  {
    slug: "trumbull-oh",
    county: "Trumbull County",
    state: "OH",
    countySeat: "Warren",
    relation: "neighboring",
    approach:
      "Roughly an hour from Warren, almost all of it straight north on Route 11 before the turn into Jefferson.",
    title: "Trumbull County Ford Work Trucks | AM Ford",
    h1: "Ford Trucks for Trumbull County Trades and Job Sites",
    metaDescription:
      "Route 11 runs almost straight north from Warren to our door. New Ford F-150 and commercial vehicles, sold and serviced in Jefferson, Ohio.",
    ogDescription: `Trumbull County buys trucks that have to earn their keep, so this page is about payload, upfit, and specification rather than styling. AM Ford sells and services from ${dealerInfo.address}, our only location. ${DELIVERY_CLAIM}`,
    intro: `Trumbull County works for a living. Warren is the county seat, the Mahoning River valley through Niles and Girard carries the manufacturing history, and the trades that grew up around all of it are still the reason most trucks here get bought. A vehicle in this county is more often a tool than a taste, and the questions we get from Trumbull County buyers show it: payload before styling, upfit before trim, and what the thing costs to keep on the road rather than what it looks like parked on one. AM Ford is not in Trumbull County. There is one dealership, at ${dealerInfo.address}, and it sits north of the county line.`,
    landscape: {
      heading: "Why Route 11 makes this trip worth making",
      body: "Route 11 leaves Warren pointed north and stays that way until it is well inside Ashtabula County. It is a highway rather than a string of village speed limits, and that is genuinely the reason a Trumbull County buyer would look this far north for a truck at all. There is no city to cross, no lakefront traffic, and no seasonal bottleneck sitting in the middle of it. Route 45 and Route 46 run roughly parallel a little to the east if you would rather take a slower road, while Route 5 and Route 82 handle the east to west movement down at the southern end. The practical version is short: if you can get onto Route 11, you can get here, and a truck that has to come back for warranty work can make the same run again without costing anyone a working day.",
    },
    directions: {
      heading: "From Warren, and from the rest of the county",
      body: "From Warren it is Route 11 north and then east into Jefferson on Route 46, roughly an hour depending on which side of the city you start from. From Cortland and the Mosquito Lake area, Route 46 runs north almost the whole way on its own. From Niles, Girard, and the southern end, add the run up to Warren first. Coming home with a loaded trailer behind you is the same road in reverse, which is a reasonable thing to weigh up before buying a truck the same distance away in a direction that has a city in the middle of it.",
    },
    angle: {
      heading: "Specifying a truck for work rather than for a driveway",
      body: "The number that sells trucks is the tow rating, and the number that decides most jobs is payload. They are not the same thing and they do not move together. Payload is what remains of the truck's rated weight once the truck itself, its fuel, the people in it, and everything bolted to it have been accounted for. A crew cab, a larger engine, four-wheel drive, a ladder rack, a cross box, a bed liner, and a hitch all come out of that figure before a single item has been loaded. So do the passengers. Tongue weight from a trailer lands on the rear axle and comes out of payload as well, which is where plenty of trucks quietly end up over their rating without the owner ever being told. Cab and bed configuration is the next honest trade-off, because a crew cab with a short bed carries people well and carries sheet goods badly, and no single configuration is best at both. After that come axle ratio, cooling, whether the truck has an integrated trailer brake controller, and whether it has the upfitter switches your equipment is going to need. Bring the weights, the trailer, and a plain description of what goes in the bed on a working day, and we will specify backwards from those rather than forwards from a brochure.",
    },
    extra: {
      heading: "Buying more than one, or buying in a business name",
      body: "A vehicle bought for a business is a different conversation from a vehicle bought for a household, and it goes better when it starts early. Titling and registration in the company name, the paperwork your accountant is going to ask for, whether the truck gets upfitted before it goes to work or after, and how much time the equipment you want adds to the timeline are all easier to settle before an order is placed than after one lands. Where more than one vehicle is involved, sequencing matters as much as specification, because taking three trucks off the road in the same week is rarely something a working business can absorb. Our commercial page covers how that side of it is handled, and it is the right place to start if the vehicle is going to be an entry on a balance sheet rather than a car in a driveway.",
    },
    needs: {
      heading: "What Trumbull County buyers come in for",
      items: [
        "Payload figures for the truck as it will actually be built, not for the base configuration",
        "Cab and bed combinations chosen for the load rather than for the parking space",
        "Integrated trailer brake control and a hitch matched to the loaded trailer",
        "Upfitter provisions for racks, boxes, plows, and the wiring all of that needs",
        "Service scheduling that keeps the truck off the road for as little time as possible",
        "Titling and paperwork handled in a business name where that is what is required",
      ],
    },
    searches: {
      heading: "Straight to the trucks",
      body: "Each of these drops you into the pickup end of the current stock rather than making you filter your way there. Everything they return is standing in Jefferson.",
    },
    popularWith: [
      { label: "Ford F-150 trucks currently in stock", search: { q: "F-150" } },
      { label: "New Ford pickups on the lot today", search: { type: "Truck" } },
      {
        label: "Electric pickups with onboard power for tools",
        search: { fuel: "Electric" },
      },
    ],
    models: {
      heading: "Ford models that earn their keep here",
      intro:
        "Trucks lead, because trucks are what this county buys. What follows them is picked on the same basis: vehicles that carry people and gear without pretending to be a pickup.",
      picks: [
        {
          slug: "f-150",
          why: "The truck this page is really about. It is built across enough combinations of cab, bed, drivetrain, and axle ratio that the right specification almost always exists, which is exactly why the specification conversation is worth having properly.",
        },
        {
          slug: "f-150-lightning",
          why: "Onboard power is the argument here rather than fuel cost. A truck that can run tools on site without a generator changes what has to be carried, and overnight charging suits a vehicle that comes back to the same yard every night.",
        },
        {
          slug: "explorer",
          why: "For the part of the business that is not hauling: three rows, all-wheel drive available, and a load floor that takes samples, tools, or a site visit's worth of gear.",
        },
        {
          slug: "bronco",
          why: "Ground clearance and short overhangs for sites where the access road is mud and stone rather than pavement.",
        },
      ],
    },
    childCitySlugs: [],
    childBlock: {
      heading: "Where to go next from here",
      body: "No Trumbull County town has a page of its own on this site, and inventing one for Warren would help nobody. The four links below are what a Trumbull County buyer is usually actually here for.",
    },
    alternativeLinks: [
      { to: "/inventory", label: "Every Ford truck, SUV, and car in stock in Jefferson" },
      { to: "/ford/f-150", label: "Ford F-150 trims, configurations, and current stock" },
      { to: "/commercial", label: "Ford commercial and work vehicles for trades and fleets" },
      {
        to: "/ford-dealer/ashtabula-oh",
        label: "Ford dealer near Ashtabula, at the north end of Route 11",
      },
    ],
    alsoServed: {
      heading: "Across Trumbull County",
      towns: ["Warren", "Niles", "Girard", "Cortland", "Champion", "Bristolville", "Hubbard"],
      body: "Every one of these is inside the area we sell and deliver to. There is no page for any of them, so this page points at the vehicles and the departments instead of at a town name with nothing behind it.",
    },
    closing: {
      heading: "An hour of Route 11, once",
      body: `A good share of the trucks we sell into this county get specified over the phone and then collected or delivered rather than browsed on a Saturday. ${DELIVERY_CLAIM} If the truck does need to come back in, the same road works in both directions, which is the part that counts when it is booked out on jobs.`,
    },
    cta: {
      heading: "Tell us what the truck has to do",
      body: "Weights, the trailer, what goes in the bed, what gets bolted on, and how many days a year it can afford to be off the road. We will work from that.",
      inventoryLabel: "See the trucks and EV pickups in stock",
    },
  },
];

const BY_SLUG: Record<string, County> = Object.fromEntries(
  COUNTIES.map((county) => [county.slug, county]),
);

/**
 * Reverse index from city page slug to the county that claims it.
 *
 * Built from childCitySlugs rather than maintained by hand, so a city can never be listed
 * under a county in one direction and resolve to a different one in the other.
 */
const BY_CITY_SLUG: Record<string, County> = Object.fromEntries(
  COUNTIES.flatMap((county) => county.childCitySlugs.map((city) => [city, county])),
);

export const getCounty = (slug: string): County | undefined => BY_SLUG[slug];

/**
 * The county page a given city page belongs under, or undefined for a city outside the four
 * counties that have pages. City routes use this to link back up the hierarchy.
 *
 * Note that "ashtabula-oh" is deliberately both a county slug and a city slug: the county
 * page lives at /ford-dealer/county/ashtabula-oh and the city page at /ford-dealer/ashtabula-oh,
 * so the two never collide. This lookup is keyed on CITY slugs only.
 */
export const getCountyForCity = (citySlug: string): County | undefined => BY_CITY_SLUG[citySlug];

/**
 * Guards the data above against a city slug that does not exist in serviceAreas.ts. A child
 * link built from a typo would render an anchor pointing at a 404, so it is dropped instead.
 */
export const validChildCitySlugs = (county: County): string[] =>
  county.childCitySlugs.filter((slug) => SERVICE_AREAS.some((area) => area.slug === slug));
