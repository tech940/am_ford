Responsive audit complete. Findings below, ordered by severity.

---

# Responsive audit — velocity-craft-canvas-main

Stack: React 19, Tailwind v4, TanStack Start. Breakpoints are stock Tailwind (`sm:640 md:768 lg:1024 xl:1280`). Note the codebase's dominant responsive idiom is `sm:` — there is almost no `md:` usage, so layouts jump straight from 1-col to 2/3-col at 640px.

## The structural amplifier: overflow is clipped, not scrollable

`src/components/site/SiteShell.tsx:10` — `<div className="relative min-h-screen overflow-x-clip …">` wraps every page.

This means **no overflow bug on this site ever produces a horizontal scrollbar**. Every overflow below manifests as content silently cut off at the viewport edge, permanently unreachable. It also makes these bugs invisible to the usual "does the page scroll sideways?" smoke test — `document.documentElement.scrollWidth` stays equal to the viewport width while content is being destroyed. Read every finding below through this lens.

---

## P0 — OTPPopup is structurally broken below ~700px

`src/styles.css:369-403`. This is the primary lead-capture flow (the "Get Price" button on both the SRP and VDP — `inventory.tsx:2270`, `vehicle.$id.tsx:609`).

```css
.otp-flex-container { display: flex; min-height: 480px; align-items: stretch; }
.otp-sidebar       { width: 320px; min-width: 280px; max-width: 38%; padding: 32px 24px; }
.otp-form-panel    { flex: 1; padding: 36px 40px; min-width: 0; }
.otp-input-grid    { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 20px; }
```

There is **no media query anywhere in `src/styles.css` for any `.otp-*` rule**. The file has exactly three `@media` blocks: `prefers-reduced-motion` (325), `max-width: 639px` (732, font-size only), `max-width: 360px` (795, font-size only). None touch layout.

`min-width: 280px` beats `max-width: 38%` per CSS spec, so the sidebar is pinned at 280px all the way down. I reproduced the exact CSS in a browser and measured:

| viewport | card | sidebar | form panel | **panel content box** | input width | clipped & unreachable |
|---|---|---|---|---|---|---|
| 320px | 288 | 280 | 80 | **0px** | 55px | **162px** |
| 375px | 343 | 280 | 80 | **0px** | 55px | **107px** |
| 480px | 448 | 280 | 168 | 88 | 55px | 2px |
| 600px | 568 | 280 | 208 | 94px | 94px | 0 |
| 768px | 736 | 280 | 456 | 376 | 178px | 0 |

At 375px the form panel's content box is **0px wide** — the panel's 80px of horizontal padding exactly consumes its 80px width. Inputs render 55px wide with their right edge at x=391 on a 375px viewport. `.otp-card` has `overflow: hidden` on the x-axis (`styles.css:363`, only `overflow-y: auto` is re-enabled), so that content cannot be scrolled to. **On a phone, this modal shows a navy sidebar and a sliver of unusable form.**

Fix: `@media (max-width: 767px) { .otp-flex-container { flex-direction: column } .otp-sidebar { width: auto; min-width: 0; max-width: none } .otp-form-panel { padding: 24px 20px } .otp-input-grid { grid-template-columns: 1fr } }`

The same no-media-query pattern breaks two sibling popups:
- `styles.css:514` `.form-grid { grid-template-columns: 1fr 1fr }` (OfferPopup) — two 42px-tall inputs share ~232px at 320px
- `styles.css:627` `.trade-offer-hero { grid-template-columns: 1fr 1.2fr; min-height: 180px }` and `:671` `.trade-offer-grid { 1fr 1fr }` (TradeOfferPopup)
- Fixed display type immune to the mobile type scale (which only rewrites Tailwind classes): `styles.css:471` `.amount { font-size: 54px }`, `:643` `.trade-offer-promo-amount { font-size: 48px }`, `:478` `.off { 26px }`

---

## P1 — SiteNav mobile sheet does not trap focus

`src/components/site/SiteNav.tsx:232-335`. The implementation is a right-anchored sheet, always in the DOM, toggled by `open` state:

- `:234` `inert={!open}` — correctly removes the sheet from the tab order **when closed**
- `:249` `w-[min(360px,calc(100%-1.5rem))]`, `max-h-[calc(100dvh-1.5rem)]`, `overflow-y-auto overscroll-contain` — the sizing is genuinely correct and works at 320px
- `:282-323` native `<details>` disclosures for the three mega-menus — good, works without JS

**But when open, nothing is managed.** The only `useEffect` in the component is the scroll listener at `:112-117`. Concretely:

1. **No focus trap.** The `<header>` at `:121` is a sibling of the sheet, outside the `inert` container and never made inert. With the sheet open, Tab walks straight out of it into the nine desktop nav links, the three dropdown triggers, the phone CTA, and the hamburger — all sitting behind a `bg-slate-950/60 backdrop-blur-sm` scrim at `:242`, invisible and un-clickable but fully focusable. Everything in the page `<main>` behind it is likewise reachable.
2. **No Escape handler.** No `keydown` listener exists in the file. Keyboard users can only close by tabbing blind to the X at `:255`.
3. **No initial focus move.** `setOpen(true)` at `:222` leaves focus on the hamburger in the header. The first Tab lands on the *next header element*, not inside the sheet.
4. **No focus restore** on close.
5. **No body scroll lock.** `overscroll-contain` at `:249` only stops scroll chaining once the panel's own scroll is exhausted; the page behind still scrolls under the scrim on touch.
6. **No `role="dialog"` / `aria-modal="true"`** on `:247`.

For comparison, this codebase already contains two correct implementations to copy: `src/components/popups/OfferPopup.tsx:52-95` (focus save/restore via `restoreTo` ref, Tab cycling, Escape, scroll lock) and `src/components/convert/TradeValuatorModal.tsx:100-161`.

### Overlay focus-management matrix

| Overlay | Escape | Scroll lock | Focus trap | `role=dialog` |
|---|---|---|---|---|
| `OfferPopup.tsx:52` | ✅ | ✅ | ✅ | ✅ |
| `TradeValuatorModal.tsx:100` | ✅ | ✅ | ✅ | ✅ |
| `QuickEnquiryModal.tsx:88` | ✅ | ✅ | ❌ | ✅ |
| `ExitIntentOffer.tsx:93` | ✅ | ✅ | ❌ | ✅ |
| `ChatWidget.tsx:231` | ✅ | ❌ | ❌ | ✅ |
| `inventory.tsx:2360` CompareModal | ✅ | ✅ | ❌ | ✅ |
| `inventory.tsx:1905` filter drawer | ✅ `:932` | ✅ `:941` | ❌ | ❌ none |
| **`SiteNav.tsx:232` mobile sheet** | ❌ | ❌ | ❌ | ❌ |
| **`OTPPopup.tsx:284`** | ❌ | ❌ | ❌ | ❌ |
| **`LeadCaptureModal.tsx:112`** | ❌ | ❌ | ❌ | ❌ |
| **`TradeOfferPopup.tsx`** | ❌ | ❌ | ❌ | ❌ |

---

## P1 — inventory.tsx

**Hero offer card header overflows at ≤414px.** `inventory.tsx:1130` — `flex items-center justify-between gap-3` holding two pills: `"Exclusive Dealer Savings"` with an icon (`:1131`) and `"Available today"` with a dot (`:1134`), both `text-xs`, neither `shrink-0` nor wrapping. At 320px the available width is 184px (viewport − `px-6` 48 − card `p-6` 48 − header `p-5` 40); the two pills need roughly 290px of min-content. Parent at `:1129` is `overflow-hidden`, so the right pill is cut, not wrapped. Needs `flex-wrap` or `flex-col sm:flex-row`.

**Offer value row, same card.** `:1140` `flex items-baseline justify-between gap-3` — `text-4xl sm:text-5xl font-black` value (`:1142`) against a `max-w-[140px]` right-aligned paragraph (`:1149`). The hard `max-w-[140px]` is the only sizing on the right column and it doesn't shrink proportionally; at 184px available this collides. Make it `max-w-[140px]` → `sm:max-w-[140px]` and let it go full width below.

**Sticky toolbar sits 16px too low at ≥640px.** `:1313` `sticky top-16 … sm:top-20`. The header (`SiteNav.tsx:129`) is `py-3` (24px) around a tallest child of 40px (hamburger `h-10 w-10` at `:223`, logo `sm:h-10` at `:139`) = **64px at every breakpoint**. `top-16` (64px) is right; `sm:top-20` (80px) leaves a 16px band where page content scrolls visibly between the header and the toolbar. Drop the `sm:top-20`.

**Toolbar clips instead of scrolling on narrow phones.** `:1314` `flex … flex-nowrap overflow-hidden`. The sort `<select>` at `:1360` is `shrink-0` and takes its intrinsic width from its longest option, `"Price: Low to High"` (`:118`) — roughly 150-165px with padding. Add the filter button (~40px), `px-3` (24px) and gaps, and the `flex-1 min-w-0` search input at `:1316` is squeezed to ~70px against 48px of its own `pl-9 pr-3` padding. The `overflow-hidden` means the excess is destroyed rather than scrollable. Either move the select to a second row below `sm`, or icon-only it like the filter button already does at `:1387`.

**`no-scrollbar` is not defined.** `:1485` uses `overflow-x-auto no-scrollbar`. I grepped `src/styles.css`, `src/components/home/home.css`, and all of `src/` — the class appears only at this one usage site, and `styles.css` declares no matching `@utility` (its Tailwind v4 blocks are `@theme inline` :9, `@layer base` :176, `@layer utilities` :196). A scrollbar renders under the three CTA chips on desktop and Android.

**Filter drawer, `inventory.tsx:1905-2208`** — sizing is actually fine (`:1923` `w-full max-w-md` goes full-bleed on phones) and Escape + scroll lock are wired. Remaining gaps:
- No `role="dialog"` / `aria-modal` / focus trap on `:1918`, and no focus move to the drawer or back to the trigger at `:1376`
- `:2006` `grid grid-cols-2 gap-2` for fuel type, no mobile variant. At 320px each cell is ~132px minus `px-4` (32px) = 100px for strings like `"Plug-in Hybrid (3)"` — wraps to three lines
- `:2111` `flex gap-2` for model year has no `flex-wrap`, but `FILTER_OPTIONS.years` is only `["All", 2025, 2024]` (`src/lib/vehicles.ts:250`), so three `flex-1` buttons fit. Safe today, fragile if a year is added
- `:2338` slider thumbs are `h-4 w-4` (16px) — well under the 24px WCAG 2.2 target-size minimum and hard to grab on touch. The `SliderPrimitive.Root` at `:2329` has `touch-none`, so a mis-grab scrolls nothing and just fails silently

**Comparison modal, `inventory.tsx:2359-2455`** — the table itself is handled correctly: `:2400` `overflow-x-auto` wrapping `:2401` `min-w-[560px]`, so it scrolls rather than clips. Two issues: no focus trap despite `aria-modal="true"` at `:2380`, and the `overflow-x-auto` div is nested inside the `overflow-y-auto` panel at `:2385`, which on iOS Safari makes the inner horizontal drag fight the outer vertical one.

**Compare tray collides with the chat FAB.** `:2213` `fixed inset-x-0 bottom-24 z-40 flex justify-center` vs `ChatWidget.tsx:342` `fixed bottom-24 right-4 z-[60]`. Same `bottom-24` on mobile. The tray content at `:2219` is `flex-wrap`, so with three vehicles it grows to near-full width and runs under the chat button, which wins on z-index and eats the taps.

---

## P1 — vehicle.$id.tsx

**Buy box price row overflows at ≤375px.** `:572` `flex items-end justify-between` (no `gap`, no `flex-wrap`) holding a `display text-4xl` price at `:574` against a `"Lifetime warranty"` pill at `:581`. Inside `p-7` at `:563`, content width at 320px is ~216px. `"$102,995"` is a single unbreakable token whose min-content at 34px (the `max-width:639px` scale reduces `text-4xl` to 2.125rem, `styles.css:778`) is ~150px; the pill's min-content is ~75px. 225px into 216px, clipped by `SiteShell`'s `overflow-x-clip`.

**H1 never scales down.** `:568` `className="display mt-1 text-balance text-4xl text-ink"` — no `sm:`/`lg:` variant anywhere on the page's primary heading. The global `max-width:639px` rule shaves it 36→34px, which is not enough for `"2025 Ford F-150 Lightning Platinum"` in a 216px column.

**"You might also like" header overflows at 320px.** `:957` `mb-10 flex items-end justify-between` — an `h2.text-3xl sm:text-4xl` against two inline links (`"More SUVs →"`, `"All inventory →"`, `gap-4`) at `:959-969`. No wrap, no gap on the outer flex. The right cluster alone needs ~196px of the 272px available; the h2 needs ~85px min-content. Wants `flex-col gap-4 sm:flex-row sm:items-end sm:justify-between`.

**Gallery.** `:528` `h-[420px] w-full object-cover sm:h-[520px]` — 420px is over half the height of a 375×812 phone before the buy box is reached. `:543` `grid grid-cols-3 gap-3` thumbnails is fine at 3 across. Worth noting `:544` maps `[v.image, v.image, v.image]` — the gallery is the same image three times.

**Buy box `sticky top-28` applies on mobile.** `:562` has no `lg:` prefix, so the sticky context is active at all widths where it stacks below the gallery. Harmless in practice (the panel is taller than the viewport) but the 112px offset doesn't match the 64px header at any breakpoint.

**Spec tables are sound.** `:691` `grid grid-cols-2 gap-px … sm:grid-cols-3` at 2-up on mobile, and `Spec` (`:1544-1551`) / `Stat` use `truncate`, so values degrade rather than overflow. `:1331` and `:1354` are the correct `min-w-0` + `truncate` pattern — worth citing as the in-repo reference for the fixes above.

**Payment calculator is the best-behaved block on the page.** `:1572` `grid gap-10 px-6 lg:grid-cols-12`, `:1624` term chips `flex flex-wrap gap-2`, `:1683` native `input[type=range]` at `h-6 w-full`. One issue: `:1581` `<p className="display mt-2 text-6xl">` renders `${monthly}/mo` — the global scale takes `text-6xl` to 58px (`styles.css:784`), and a four-digit payment plus the `/mo` span at `:1583` runs ~200px against 216px of content inside `p-8` at `:1579`. It fits, but with no margin; a five-figure vehicle at a low down payment clips.

---

## P2 — Components

- `VehicleCard.tsx:122` — `flex items-start justify-between gap-4` with neither column carrying `min-w-0`. Left is `h3.text-xl` model + trim, right is `text-2xl tabular-nums` price plus a `~$X/mo est.` line. In the 1-col grid at 320px the card content is ~224px; right column min-content ~115px + `gap-4` leaves ~93px for a `text-xl` model name. Overflows.
- `VehicleCard.tsx:148` — `grid grid-cols-3 gap-2 text-xs`. Cells are ~69px, and `Stat` (`:180`) spends 20px on `px-2.5` plus 20px on icon+gap, leaving ~29px of text. The `truncate` at `:182` saves the layout but renders `"50,..."` — the odometer becomes unreadable exactly where the comment at `:146-147` says it must stay legible. Wants `grid-cols-1 sm:grid-cols-3` or a wrapping flex.
- `TradeValuatorModal.tsx:345` — `grid grid-cols-4 gap-2` for the year picker, no mobile variant, inside a modal. Four cells across ~272px = 62px each before button padding.
- `financing.tsx:402` and `service.tsx:151` — `grid grid-cols-3 gap-3 text-xs`, same shape as the VehicleCard stat row, same squeeze.
- `home/sections/ExtraordinaryCarousel.tsx:133-136` — a hand-rolled coverflow on `w-[250px]/w-[200px]/w-[180px]` fixed pixel cards inside `h-[440px] w-full max-w-5xl` (`:110`). The 180px tier is `hidden … md:block` so it's excluded below 768px, but the two visible tiers total 450px against a 320px viewport. (Per your memory note, `src/components/home` is hands-off — flagging for awareness only, not proposing an edit.)

---

## Suggested order

1. `styles.css` — one `@media (max-width: 767px)` block stacking `.otp-flex-container`, `.trade-offer-hero`, `.otp-input-grid`, `.form-grid`, `.trade-offer-grid`. Single highest-value change; unblocks the lead-capture flow on every phone.
2. `SiteNav.tsx` — lift the focus trap from `OfferPopup.tsx:52-95` into a shared `useModalDialog` hook and apply it to SiteNav, OTPPopup, LeadCaptureModal, TradeOfferPopup, and the inventory filter drawer.
3. Replace `overflow-x-clip` in `SiteShell.tsx:10` with `overflow-x-hidden` **temporarily** while fixing the rest — it makes the remaining overflows visible as scrollbars during QA instead of silently eating content. Revert once clean.
4. The `justify-between` rows: `inventory.tsx:1130`, `:1140`; `vehicle.$id.tsx:572`, `:957`.
5. `inventory.tsx:1313` `sm:top-20` → drop; `:1314` toolbar reflow; define or remove `no-scrollbar`.