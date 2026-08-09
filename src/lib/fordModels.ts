/**
 * Model-level content for the /ford/{slug} landing pages.
 *
 * This file describes the MODEL, not the individual unit sitting on the lot. Vehicle
 * records in @/lib/vehicles stay the single source of truth for price, mileage, VIN,
 * condition, and equipment; nothing here restates a number that belongs to one car.
 *
 * Content rules this file is written to (AM Ford SEO brief):
 *  - No invented towing, payload, MPG, range, or pricing figures.
 *  - No warranty specifics, inspection-point counts, APR figures, or award claims.
 *  - No invented customer stories, no exclamation marks, no em dashes.
 *  - Every page must carry information the other five pages do not.
 */

export type FordModel = {
  slug: string;
  name: string;
  bodyStyle: "Truck" | "SUV" | "Car" | "EV";
  /**
   * One line under the H1, and the lead of the meta description. Keep it at or under
   * 75 characters so the generated description stays inside the 155 character budget.
   */
  tagline: string;
  /** What the model is, who buys it, and an honest note about who it does not suit. */
  intro: string;
  strengths: string[];
  /** Why this model makes sense for drivers around Jefferson specifically. */
  localAngle: string;
  /**
   * One sentence introducing the city links on the model page. Written per model so the
   * internal-linking block carries model-specific copy instead of the same paragraph six times.
   */
  regionNote: string;
  /** Rendered verbatim on the page and emitted verbatim as FAQPage JSON-LD. */
  faqs: { q: string; a: string }[];
  /** Search params that deep link to the matching slice of /inventory. */
  inventorySearch: Record<string, string>;
  /** Vehicle ids from @/lib/vehicles. Empty is a valid state; the page says so honestly. */
  inStockVehicleIds: string[];
};

export const FORD_MODELS: FordModel[] = [
  {
    slug: "f-150",
    name: "Ford F-150",
    bodyStyle: "Truck",
    tagline: "A full-size pickup that covers the work week and the weekend.",
    intro:
      "The F-150 is Ford's full-size half-ton pickup, built in a range of cab sizes, bed lengths, powertrains, and trim levels, so the same model can be a plain work truck or a leather-lined family vehicle. Around Ashtabula County it tends to land in three kinds of driveways: trades and contractors who need a bed and a hitch every working day, farm and property owners who need four-wheel drive on gravel and field access roads, and households that want one vehicle that can tow a boat in July and get down an unplowed township road in February. Because the spread between configurations is so wide, the useful conversation is rarely the F-150 against some other truck; it is which F-150 matches the work you actually do.",
    strengths: [
      "Configurations run from basic work trucks to fully equipped family vehicles, so you can match the truck to the job instead of compromising on one end.",
      "Four-wheel drive is offered across most of the lineup, which matters on gravel, on boat ramps, and on roads that have not seen a plow yet.",
      "A separate bed and frame make it straightforward to add a cap, a liner, or upfitted equipment after you buy.",
      "Because the F-150 is everywhere in this region, service knowledge, parts, and accessories are easy to find close to home.",
      "Full-size trucks tend to hold their value in a county where demand for them stays steady, which usually helps the conversation at trade-in time.",
    ],
    localAngle:
      "Jefferson sits in the middle of a county where a lot of miles happen on township roads: gravel, chip and seal, and pavement that gets cleared after the state routes do. State Route 46 runs past our lot and connects north toward Ashtabula and Interstate 90 and south toward Route 322, which is the loop most of our truck buyers drive every week. That mix, slow rough surfaces on weekdays and loaded highway running on weekends, is why four-wheel drive and a properly wired factory tow package come up in nearly every F-150 conversation here. Owners who haul to Lake Erie ramps in summer and pull equipment trailers through spring mud usually put a crew cab and the right hitch setup ahead of everything else on the window sticker.",
    regionNote:
      "Most F-150 buyers who make the drive here work out of the harbor and snowbelt towns, where a hitch and four-wheel drive get used in every month of the year.",
    faqs: [
      {
        q: "Which F-150 cab and bed combination should I choose?",
        a: "It is a trade between rear seat space and bed length, and the two move in opposite directions. A SuperCrew gives four adults real rear legroom and usually pairs with a shorter bed. A SuperCab keeps a shorter overall length with rear seats that suit occasional passengers or gear. A regular cab with a long bed carries the most material and parks the worst. Measure your garage or your usual parking spot before you decide, because the longest combinations are noticeably harder to place.",
      },
      {
        q: "How do I know whether an F-150 can tow my trailer?",
        a: "Towing capacity is set by the specific combination of engine, axle ratio, cab, bed, and factory tow equipment on that individual truck, not by the model name. The figures that apply come from that truck's own door jamb label and build documentation. Tell us the loaded weight and tongue weight of what you pull, and we will check it against the actual truck you are considering rather than a general number.",
      },
      {
        q: "What should I inspect on a used F-150 in a salt-belt state?",
        a: "Look underneath first. Check the frame, the brake and fuel lines, and the bed floor for corrosion, because road salt does its damage where you cannot see it from the driver seat. On a truck that has towed, look at the hitch and receiver for wear and ask about brake and transmission service history. Ask us to put a truck you are considering on a lift so you can see the underside for yourself before you commit.",
      },
    ],
    inventorySearch: { type: "Truck", q: "F-150" },
    inStockVehicleIds: ["f150-platinum-2025"],
  },
  {
    slug: "mustang",
    name: "Ford Mustang",
    bodyStyle: "Car",
    tagline: "A rear-wheel-drive coupe with a V8 option and a long history.",
    intro:
      "The Mustang is Ford's rear-wheel-drive sports car, sold as a coupe and a convertible, with a turbocharged four-cylinder EcoBoost version and a V8 GT version at the center of most model years. Buyers here are usually one of three people: someone who has wanted one since high school and finally has the driveway space, someone replacing a tired second car with something they will enjoy driving, or a driver stepping out of a crossover who misses steering feel and a low seat. It is worth being plain about what it is. The Mustang is a two-door with a small back seat and rear-wheel drive, which makes it a very good three-season car in Northeast Ohio and a demanding one in February.",
    strengths: [
      "Rear-wheel drive and a low seating position give it a character no crossover reproduces.",
      "The gap between the EcoBoost and the V8 GT is real, in sound, in fuel use, and in running cost, so there is a genuine decision to make rather than a trim box to tick.",
      "The trunk holds luggage for two people, which is more than most two-door cars manage.",
      "Decades of continuous production mean parts, independent specialists, and owner knowledge are easy to come by.",
      "Coupe and convertible share the same mechanical package, so choosing the open version does not cost you capability.",
    ],
    localAngle:
      "Most Mustang owners in Ashtabula County run the car seasonally. Salt and rear-wheel drive are a poor combination on a county road in January, so the common local pattern is spring through late fall on the road and winter under a cover. That suits the driving that makes the car worth owning here: the two-lane routes through the Grand River valley, the run out to Geneva-on-the-Lake on a summer evening, and the wine country roads that fill up on fall weekends. If you do intend to drive one year round, talk to us about a dedicated set of winter tires before the first freeze, because that single change alters the car more than anything else you can do to it.",
    regionNote:
      "Mustang buyers usually come in from the lake towns and from the Cleveland side, and most of them are shopping a car that will be on the road spring through fall and parked in winter.",
    faqs: [
      {
        q: "Can a Mustang be driven year round in Northeast Ohio?",
        a: "It can, but it asks something of you. Rear-wheel drive on all-season tires is not enough on a snow-covered county road; a proper set of winter tires, ideally on their own wheels, is the change that matters most. Even then, road salt is hard on any vehicle here, which is why many owners park theirs from December through March and keep a second vehicle for winter driving.",
      },
      {
        q: "How do the EcoBoost and GT versions differ?",
        a: "The EcoBoost uses a turbocharged four-cylinder and the GT uses a 5.0L V8. The V8 is the reason most people buy a GT: the sound and the way it delivers power. The EcoBoost costs less to fuel and is often cheaper to insure, so it makes sense if you want the car's handling and looks more than its engine. Drive both back to back if you can, because the difference is much easier to feel than to read about.",
      },
      {
        q: "Does a Mustang work as a family car?",
        a: "As an only car, rarely. The back seat is short on legroom and getting a child seat through a coupe door is awkward. As a second car it works well: two adults, luggage in the trunk, and occasional rear seat use on short trips. Households that make it work almost always pair it with an SUV or a truck that handles everything else.",
      },
    ],
    inventorySearch: { type: "Car", q: "Mustang" },
    inStockVehicleIds: ["mustang-gt-2025"],
  },
  {
    slug: "explorer",
    name: "Ford Explorer",
    bodyStyle: "SUV",
    tagline: "A mid-size three-row SUV for families that need the extra seats.",
    intro:
      "The Explorer is Ford's mid-size three-row SUV, and it is the vehicle most families look at when a compact crossover has stopped being big enough and a minivan is not on the list. Recent generations use a rear-drive-based platform with all-wheel drive widely available, and the trim ladder runs from practical family versions up to the ST, which is the performance-tuned one. Buyers here are typically households with two or more children, families who carry other people's children as often as their own, and drivers who want a tow-capable vehicle without stepping up to a full-size pickup. The third row is the reason most people choose it, so it is worth being clear-eyed about how often you will really use it.",
    strengths: [
      "A third row that folds flat when you do not need it, which for most owners is most days.",
      "All-wheel drive is available across most of the range, and it earns its keep between November and March.",
      "Factory tow equipment is offered on many versions, so a small trailer or a boat stays on the table.",
      "Cargo space behind the second row is genuinely useful, and that is where the difference from a compact crossover shows up.",
      "The trim range is wide enough that a practical family version and a driver-focused ST are the same vehicle underneath.",
    ],
    localAngle:
      "Ashtabula County families cover a lot of ground: school and practice runs inside the county, then the longer hauls that come with travel teams and specialist appointments, west on Interstate 90 toward Mentor and Cleveland or east toward Erie. That pattern is what an Explorer suits, because the third row matters on the trips where you carry someone else's kids and the flat load floor matters the rest of the week. Winter is the other half of the argument: all-wheel drive plus proper tires is what makes the difference on a lake-effect morning when the state routes are clear and the township roads are not. Families planning to tow a small camper to Pymatuning or Geneva State Park should say so early, because the tow equipment fitted to a specific vehicle decides what is possible.",
    regionNote:
      "Explorer buyers are typically households running school and practice trips inside the county and longer drives west on Interstate 90 or east toward Erie, which is the pattern the third row is bought for.",
    faqs: [
      {
        q: "How usable is the Explorer's third row?",
        a: "It is a real third row rather than a token one, and adults can ride back there for a reasonable trip, though children and teenagers fit more comfortably on long drives. The trade is cargo space: with all three rows up, the area behind the third row holds groceries and backpacks rather than a family's luggage. Households that would use the third row daily should sit in it before buying; households that use it a few times a month rarely find it a compromise.",
      },
      {
        q: "What does the ST trim actually change?",
        a: "The ST is the performance version, with a more powerful EcoBoost V6 and suspension, steering, and brake tuning to match, plus its own interior and exterior treatment. It is still a three-row family SUV; it simply responds differently and sounds different. If most of your driving is around town and fuel use is a priority, a lower trim covers the same practical ground and costs less to run.",
      },
      {
        q: "Is all-wheel drive worth paying for on an Explorer in Ohio?",
        a: "For most drivers here, yes, though tires matter more than the drivetrain. All-wheel drive helps you get moving on a snow-covered road; it does not help you stop. The combination that works through a lake-effect winter is all-wheel drive plus winter or good all-weather tires. If you garage your vehicles, drive mostly on state routes that get cleared early, and can wait out the worst mornings, a two-wheel-drive version on the right tires is a defensible choice.",
      },
    ],
    inventorySearch: { type: "SUV", q: "Explorer" },
    inStockVehicleIds: ["explorer-st-2025"],
  },
  {
    slug: "f-150-lightning",
    name: "Ford F-150 Lightning",
    bodyStyle: "EV",
    tagline: "The electric F-150, at its best where charging happens at home.",
    intro:
      "The F-150 Lightning is the battery-electric version of Ford's full-size pickup. It keeps the truck's proportions and bed while replacing the engine with a battery pack and electric motors, which frees up a large lockable front trunk and lets the truck export power to tools, appliances, and, with the right equipment installed, a house. The buyers it suits are specific: households with a driveway or garage where the truck can charge overnight, drivers whose daily mileage is predictable, and trades who value silent onboard power at a job site. The buyers it does not suit are equally specific: people who tow heavy loads long distances, drivers who regularly cover several hundred miles in a day, and anyone who cannot charge where they park.",
    strengths: [
      "Overnight home charging replaces fuel stops for the large majority of local driving.",
      "Onboard power export runs tools on a site and, with the right equipment installed, useful loads during an outage.",
      "The front trunk adds a large lockable storage space that a gas pickup does not have.",
      "Electric motors deliver torque immediately, which is noticeable when pulling away with a load behind you.",
      "Routine maintenance is simpler: no oil changes, no exhaust system, and less brake wear thanks to regenerative braking.",
    ],
    localAngle:
      "Two local realities decide whether the Lightning makes sense in Ashtabula County. The first is charging. Public fast charging is thinner here than it is around Cleveland, so home charging is not a convenience with this truck, it is the plan. Most driveways here have room for it and most households park overnight, which works in its favor. The second is winter. Cold weather reduces the usable range of every electric vehicle, so the number that matters is not the rating on a mild day, it is what you need on the coldest week of the year. The flip side is that rural townships lose power in storms, and a truck that can keep a furnace fan, a freezer, and some lights running through an outage is worth something here that it is not worth in a city.",
    regionNote:
      "Lightning buyers tend to come from the interchange and commuter towns, where a driveway charger and a route that repeats every weekday are what make an electric truck workable.",
    faqs: [
      {
        q: "How much range will I actually get in an Ohio winter?",
        a: "Less than the rating, and that is true of every electric vehicle rather than a fault of this one. Cold reduces battery performance and cabin heat draws real energy, so plan around your coldest month rather than a mild spring day. Two habits help: precondition the cabin while the truck is still plugged in, and treat the rated range as a warm-weather figure when you are deciding whether the truck fits your commute.",
      },
      {
        q: "What do I need in place to charge at home?",
        a: "A 240 volt circuit and a Level 2 charger is the setup that makes an electric truck practical, and installing one is an electrician's job that depends on your panel capacity and the distance to where you park. A standard household outlet will add charge, but slowly enough that it only suits low daily mileage. Work the home charging plan out before you buy the truck, not after it is in the driveway.",
      },
      {
        q: "Should I buy the Lightning or a gas F-150?",
        a: "Answer three questions. Can you charge where you park overnight? Is your daily mileage predictable and mostly local? Do you tow long distances more than occasionally? If the first two are yes and the third is no, the Lightning fits, and the quiet and the running costs tend to win people over. If you tow heavy loads across states, or you cannot charge at home, a gas F-150 remains the better tool for the job.",
      },
    ],
    inventorySearch: { type: "EV", q: "Lightning" },
    inStockVehicleIds: ["f150-lightning-2025"],
  },
  {
    slug: "bronco",
    name: "Ford Bronco",
    bodyStyle: "SUV",
    tagline: "Body-on-frame capability with a roof and doors you can remove.",
    intro:
      "The Bronco is Ford's body-on-frame off-road SUV, sold in two-door and four-door versions with removable roof panels and removable doors. It is a different kind of vehicle from a crossover: a separate frame, real ground clearance, four-wheel drive with selectable terrain modes, and a shape designed for trails and open air rather than for quiet highway miles. Buyers here tend to be people who hunt or own land, people who camp and tow something small, and people who simply want an open vehicle for the months when Ohio cooperates. It rewards that use and asks for some tolerance in return: a firmer ride, more wind noise, and fuel use that reflects its shape.",
    strengths: [
      "Removable roof panels and doors, which no unibody crossover offers.",
      "Four-wheel drive with selectable terrain modes that make low-traction driving straightforward rather than a skill you have to acquire.",
      "Ground clearance and approach angles suited to trails, field access, and deep snow.",
      "The four-door version stays usable as an everyday vehicle while keeping the open-air features.",
      "A large accessory and aftermarket ecosystem, so the vehicle can be adapted long after you buy it.",
    ],
    localAngle:
      "Open-air season in Ashtabula County is short, and that shapes how people here own a Bronco. The common pattern is doors on and roof panels off from late May into September, then buttoned up for the rest of the year, when the same vehicle turns into a genuinely capable snow truck. There is enough nearby to justify the capability: state park land at Pymatuning and Geneva, hunting ground and private trails across the county's southern townships, and gravel access roads that turn to mud every spring. If you are shopping a Bronco for winter as much as for summer, tell us early, because tire choice pulls in two directions and the right answer depends on which season you are optimizing for.",
    regionNote:
      "Bronco buyers drive in from the higher-snow townships inland and from the lake towns, generally looking for one vehicle that handles trails in August and unplowed roads in January.",
    faqs: [
      {
        q: "Should I get the two-door or the four-door Bronco?",
        a: "The two-door is shorter, easier on tight trails, and the more single-minded version. The four-door adds rear doors, much better rear seat access, and more cargo room behind the seats, which is why most families end up there. If the vehicle has to carry passengers or gear regularly, the four-door is the practical answer. If it is a weekend vehicle and trail width matters, the two-door earns its keep.",
      },
      {
        q: "How much work is taking the roof and doors off?",
        a: "The roof panels come off by hand in a few minutes once you have done it once. The doors take tools, and the bigger issue is storage: doors need somewhere padded to sit so they do not get scratched, and hardtop panels take up real garage space. Work out where the parts will live before your first warm weekend, and leave yourself time to put everything back on before the weather turns.",
      },
      {
        q: "What is the difference between the Bronco and the Bronco Sport?",
        a: "They are different vehicles that share a name. The Bronco is body-on-frame, with removable doors and roof panels, and is built for serious off-pavement use. The Bronco Sport is a unibody crossover with all-wheel drive that handles gravel roads, snow, and light trails while driving like a car on the highway. If you want the open-air features and trail capability, you want the Bronco. If you want a comfortable small crossover with more capability than average, the Bronco Sport is the sensible pick.",
      },
    ],
    inventorySearch: { type: "SUV", q: "Bronco" },
    inStockVehicleIds: ["bronco-outer-banks-2025"],
  },
  {
    slug: "escape",
    name: "Ford Escape",
    bodyStyle: "SUV",
    tagline: "A compact crossover with a hybrid version suited to mixed driving.",
    intro:
      "The Escape is Ford's compact crossover, and the version people ask about most here is the hybrid. It is a unibody vehicle with front-wheel drive or all-wheel drive, sized to carry a small household comfortably and to park without a second thought, and its hybrid powertrain recovers energy under braking and runs on the electric motor at low speeds. It suits commuters, couples, small families, and drivers stepping down from something larger who want a higher seating position without a big vehicle to place in a parking lot. A hybrid Escape is not an electric car and needs no charging; it runs on gasoline and simply uses less of it in the driving where a conventional engine is least efficient.",
    strengths: [
      "Easy to park and easy to see out of, which is the benefit owners notice first and keep noticing.",
      "The hybrid does its best work in town, where stop-and-go driving is exactly what the electric motor is for.",
      "All-wheel drive is available, so making the winter case does not require moving up a size.",
      "Cargo space behind the rear seats is more useful than the vehicle's footprint suggests.",
      "Running costs stay modest, and the hybrid adds no charging routine and no electrical work at home.",
    ],
    localAngle:
      "The commute that defines this part of the county, Jefferson out to Ashtabula, Geneva, or Painesville and back, mixes town speeds with open road, and that mix is where a hybrid earns the most. Around town the electric motor handles the driving that wastes fuel in a conventional car, and on the open stretch the gasoline engine takes over. Winter here still argues for all-wheel drive and good tires, and a hybrid asks nothing special of you in the cold beyond expecting somewhat lower fuel economy while the engine is warming the cabin. For drivers who like the idea of electrification but have nowhere to install a charger, the Escape Hybrid is the version of that idea that asks nothing new of your house.",
    regionNote:
      "Escape buyers are mostly commuters running the mix of town speeds and open road that a hybrid handles well, coming from the interchange towns and from along the lake.",
    faqs: [
      {
        q: "Does the Escape Hybrid need to be plugged in?",
        a: "No. The standard hybrid charges its own battery from the engine and from braking, so you fuel it exactly like any other car. Ford has also sold a plug-in hybrid version of the Escape, which does plug in and can cover short trips on electricity alone. The two look similar, so confirm which one you are looking at before you compare fuel figures or purchase costs.",
      },
      {
        q: "How does a hybrid hold up through a cold Ohio winter?",
        a: "Normally, with one honest caveat: fuel economy drops in the cold for every vehicle, and a hybrid is no exception, because the engine runs more often to produce cabin heat. The battery and its cooling system are designed for the full range of temperatures a Northeast Ohio winter produces, and there is no special starting procedure and nothing to plug in. Tires still matter more than anything else once there is snow on the road.",
      },
      {
        q: "Escape or Explorer: which one should I be looking at?",
        a: "Count how often you carry more than four people. If the answer is more than a few times a year, or if you tow, start with the Explorer and its third row. If you mostly move two to four people, park in tight spots, and care about fuel use, the Escape is the better fit and the easier vehicle to live with day to day. Sit in both on the same visit, because the size difference reads very differently in person than it does on a screen.",
      },
    ],
    inventorySearch: { type: "SUV", q: "Escape" },
    inStockVehicleIds: ["escape-titanium-2024"],
  },
];

export const getFordModel = (slug: string): FordModel | undefined =>
  FORD_MODELS.find((m) => m.slug === slug);

/**
 * The comparison and guide routes the model cluster is allowed to link into.
 *
 * Kept as a literal union rather than plain strings so a renamed or deleted route fails the
 * type check instead of shipping a dead link, and so <Link to={...}> keeps its route typing.
 */
export type RelatedReadingPath =
  | "/compare/explorer-vs-escape"
  | "/compare/f-150-vs-f-150-lightning"
  | "/compare/bronco-vs-explorer"
  | "/guides/is-a-used-ford-f-150-reliable"
  | "/guides/is-ford-ecoboost-reliable"
  | "/guides/what-to-check-before-buying-a-used-ford"
  | "/guides/best-ford-suv-for-families";

export type RelatedReading = {
  to: RelatedReadingPath;
  kind: "Comparison" | "Guide";
  /** Descriptive anchor that names the destination page. Never a generic filler phrase. */
  label: string;
  /** Why this page helps someone shopping THIS model. Written fresh for each model. */
  why: string;
};

/**
 * Comparison and guide pages worth reading alongside each model page.
 *
 * Keyed by model slug and deliberately partial: a model with nothing relevant gets no block
 * rather than a padded one. The `why` lines are written per model, so the two pages that both
 * link to a shared comparison describe it from their own side of the decision.
 */
export const RELATED_READING: Record<string, RelatedReading[]> = {
  "f-150": [
    {
      to: "/compare/f-150-vs-f-150-lightning",
      kind: "Comparison",
      label: "Compare the F-150 and the F-150 Lightning",
      why: "Worth reading before you rule the electric truck in or out on towing and charging.",
    },
    {
      to: "/guides/is-a-used-ford-f-150-reliable",
      kind: "Guide",
      label: "Our guide to used F-150 reliability",
      why: "Covers the service history and corrosion checks that decide whether a used truck is worth the money.",
    },
    {
      to: "/guides/is-ford-ecoboost-reliable",
      kind: "Guide",
      label: "Our guide to EcoBoost engine reliability",
      why: "Useful if the F-150 you are looking at has a turbocharged EcoBoost engine rather than a V8.",
    },
  ],
  mustang: [
    {
      to: "/guides/is-ford-ecoboost-reliable",
      kind: "Guide",
      label: "Our guide to EcoBoost engine reliability",
      why: "Read this while you are weighing the turbocharged EcoBoost Mustang against the V8 GT.",
    },
    {
      to: "/guides/what-to-check-before-buying-a-used-ford",
      kind: "Guide",
      label: "Our checklist for buying a used Ford",
      why: "Seasonal cars need different questions than daily drivers, and storage history is one of them.",
    },
  ],
  explorer: [
    {
      to: "/compare/explorer-vs-escape",
      kind: "Comparison",
      label: "Compare the Explorer and the Escape",
      why: "Settles the size question if you are not sure the third row earns the space it takes.",
    },
    {
      to: "/compare/bronco-vs-explorer",
      kind: "Comparison",
      label: "Compare the Bronco and the Explorer",
      why: "For families weighing quiet highway miles against removable doors and trail capability.",
    },
    {
      to: "/guides/best-ford-suv-for-families",
      kind: "Guide",
      label: "Our guide to choosing a Ford SUV for a family",
      why: "Puts the Explorer next to the rest of the Ford SUV range on seats, cargo, and winter driving.",
    },
  ],
  "f-150-lightning": [
    {
      to: "/compare/f-150-vs-f-150-lightning",
      kind: "Comparison",
      label: "Compare the F-150 Lightning and the gas F-150",
      why: "Lays out the charging, towing, and daily mileage questions that decide between the two.",
    },
    {
      to: "/guides/what-to-check-before-buying-a-used-ford",
      kind: "Guide",
      label: "Our checklist for buying a used Ford",
      why: "Still the right checklist if you are cross-shopping a used gas truck alongside the Lightning.",
    },
  ],
  bronco: [
    {
      to: "/compare/bronco-vs-explorer",
      kind: "Comparison",
      label: "Compare the Bronco and the Explorer",
      why: "The plain version of the body-on-frame against three-row family SUV question.",
    },
    {
      to: "/guides/best-ford-suv-for-families",
      kind: "Guide",
      label: "Our guide to choosing a Ford SUV for a family",
      why: "Shows where the four-door Bronco lands against the rest of the Ford SUV range for family use.",
    },
  ],
  escape: [
    {
      to: "/compare/explorer-vs-escape",
      kind: "Comparison",
      label: "Compare the Escape and the Explorer",
      why: "The seat-count comparison, written for households deciding between two rows and three.",
    },
    {
      to: "/guides/best-ford-suv-for-families",
      kind: "Guide",
      label: "Our guide to choosing a Ford SUV for a family",
      why: "Places the Escape and its hybrid against the larger Ford SUVs on running costs and space.",
    },
  ],
};

/** Empty array for a model with nothing mapped, so the page can skip the block entirely. */
export const getRelatedReading = (slug: string): RelatedReading[] => RELATED_READING[slug] ?? [];
