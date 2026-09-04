## Overlay Inventory — 11 surfaces, 7 distinct implementations, 0 using Radix

### Per-surface breakdown

| # | Surface / file | Trigger location(s) | Asks for | Overlay impl | Radius | Key colours | Type | Buttons | Close affordances | Inline style objs |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `src/components/popups/OTPPopup.tsx` | `routes/vehicle.$id.tsx:1010`, `routes/inventory.tsx:2271` | First/last name, preferred contact, phone, email, comments, SMS consent | `.otp-overlay` CSS class, `z-index:99999` | card **16px**, close 50%, consent 10px, panels 8px | `BRAND="#05214F"` const, `#ffd633` price, `#d1d5db` borders | h2 **22px/700 italic**, labels 12px/600, inputs 16px | inline, **6px** radius, flat `#05214F`, full-width | X button only — **no Esc, no scroll lock, no backdrop click, no `role="dialog"`, no focus trap** | **36** |
| 2 | `src/components/popups/OfferPopup.tsx` | `site/Home.tsx:766`, `inventory.tsx:2268`, `home/sections/FeaturedSpotlight.tsx:188`, `home/sections/MostSearchedCars.tsx:186` | First/last name, phone, email ($500 voucher) | `.offer-overlay` class **+ inline style object** on the same div; `zIndex:9999` | card **16px**, btn 10px, logo 8px, inputs 8px | header `radial(#ff6b00) + linear(#00142e→#05214f)`, `#ffd633` | h2 amount **54px/900 italic**, labels **10px/800**, inputs 14px | `.offer-btn` **10px**, gradient `135deg #05214f→#00142e`, space-between + `➜` | X, Esc, backdrop mousedown, **focus trap + restore + scroll lock** (only complete one) | 11 |
| 3 | `src/components/popups/TradeOfferPopup.tsx` | `site/Home.tsx:767` | First/last name, preferred contact, phone, email | `.trade-offer-overlay` CSS class, `z-index:99999` | shell **20px**, btns 10px, inputs 8px | `#05214f` promo, **`#38bdf8`** amount, `#cbd5e1` borders | amount **48px/900**, labels **11px/700**, inputs 14px | `.trade-offer-primary` **10px** flat `#05214f` 44px + `.trade-offer-secondary` `#f1f5f9` | `×` glyph only — **no Esc, no scroll lock, no backdrop click, no `role="dialog"`/`aria-modal` at all** | 3 |
| 4 | `src/components/convert/TradeValuatorModal.tsx` | `routes/trade-in.tsx:453`, `inventory.tsx:2269` | Year, make, model, miles, condition wizard → phone | Tailwind `fixed inset-0 z-[70]` + framer-motion backdrop sibling | card **`rounded-3xl`**, inputs `rounded-xl`, chips `rounded-xl` | hardcoded `#002c5f`, `bg-slate-900/60` | h3 `text-base font-bold`, labels `text-[11px] font-bold uppercase` | **`rounded-full`** pill, `h-12`, `bg-[#002c5f]` | X (`h-10 w-10`), Esc, backdrop click, scroll lock | 1 |
| 5 | `src/components/convert/QuickEnquiryModal.tsx` | `routes/vehicle.$id.tsx:1022` | Phone, optional name (preset message) | Tailwind `fixed inset-0 z-[70]` + motion backdrop | **`rounded-3xl`**, inner `rounded-2xl`, error `rounded-xl` | `#002c5f`, `bg-red-50/text-red-600` | h3 `text-lg font-bold`, labels `text-xs font-bold uppercase` | **`rounded-full`** `py-3` `bg-[#002c5f]` | X (`h-10 w-10`), Esc, backdrop, scroll lock | 0 |
| 6 | `src/components/convert/ExitIntentOffer.tsx` | `site/SiteShell.tsx:22` (global, exit-intent auto-fire) | Phone, optional name ($500 voucher) | Tailwind `fixed inset-0 **z-[75]**` + motion backdrop | **`rounded-3xl`** | navy gradient `from-[#002c5f] via-[#003a75] to-[#001a3d]`, `text-red-700` | `$500` `text-5xl font-extrabold`, h2 `text-base` | **`rounded-full`** `px-7 py-2.5` | X `h-10 w-10 bg-white/10` (on navy), Esc, backdrop, scroll lock | 0 |
| 7 | `src/components/site/LeadCaptureModal.tsx` | `routes/vehicle.$id.tsx:1001`, `inventory.tsx:2262` | Name, phone, email, message + 4 mode chips | Tailwind `fixed inset-0 **z-50**` + motion backdrop | **`rounded-3xl`**, chips `rounded-xl`, banner `rounded-2xl` | **only token-based one**: `bg-card`, `text-ink`, `ring-border`, `bg-primary`, `bg-ink/65` | `.display` class + `text-xl`, `text-xs uppercase` | **`rounded-full` `bg-primary`** `px-7 py-3` | X (**`h-9 w-9`**) — **no Esc, no scroll lock** | 0 |
| 8 | `src/components/convert/ChatWidget.tsx` | `site/SiteShell.tsx:21` (global FAB) | Phone capture inside chat flow | Tailwind **anchored panel, no backdrop** `fixed bottom-24 right-4 z-[70]` | **`rounded-3xl`**, FAB 50% | header `gradient from-[#002c5f] to-[#0a4a8f]` | `text-sm font-bold` | FAB `h-14 w-14`, chips | X `h-10 w-10`, Esc — **`aria-modal="true"` but no backdrop/focus trap (misleading)** | 1 |
| 9 | Inventory filter drawer — `src/routes/inventory.tsx:1904` | `inventory.tsx:1377` button | Body style, price, fuel, condition, mileage facets | Tailwind `fixed inset-0 z-50` + **`absolute` (not fixed) backdrop** + slide-in `motion.aside` | **none** (full-height panel), chips `rounded-full` | `#002c5f`, `bg-slate-900/60` | h2 `text-xl font-bold`, labels `text-xs font-bold uppercase tracking-widest` | chips `rounded-full px-3.5 py-2` | X (**`h-9 w-9`**), Esc, backdrop | 0 |
| 10 | Compare modal — `src/routes/inventory.tsx:2371` | Compare tray in inventory | Nothing — read-only spec table | Tailwind `fixed inset-0 z-50` + `absolute` motion backdrop | **`rounded-3xl`**, images `rounded-2xl` | `#002c5f`, `bg-slate-900/60` | h2 `text-2xl font-extrabold` | X only | X (**`h-9 w-9`**), Esc, backdrop, scroll lock | 0 |
| 11 | `src/components/site/SiteNav.tsx:233` mobile sheet | Hamburger `SiteNav.tsx:226` | Navigation only | **CSS visibility/`inert` toggle**, no framer-motion, `z-[60]` | **`rounded-2xl`** | `bg-slate-950/60`, `#002c5f` headings | `text-lg font-bold`, `text-[10px] tracking-[0.18em]` | `<details>` disclosures | X (**`h-9 w-9` `rounded-xl`** — square), backdrop — **no Esc, no scroll lock** | 0 |

Also present but not modal: `src/components/site/MobileStickyCTA.tsx` — fixed bar at `z-40`, 1 inline style object (`env(safe-area-inset-bottom)`).

---

### Consolidated inconsistency table

| Axis | Variants found | Detail |
|---|---|---|
| **Overlay mechanism** | **7** | `.otp-overlay` CSS · `.offer-overlay` CSS+inline hybrid · `.trade-offer-overlay` CSS · Tailwind+motion backdrop (×5) · Tailwind drawer w/ `absolute` backdrop · CSS `inert` toggle sheet · no-backdrop anchored panel |
| **Backdrop** | **5** | `rgba(15,23,42,.6)`+`blur(8px)` (3 CSS popups) · `bg-slate-900/60`+`blur-sm`≈4px (5 surfaces) · `bg-ink/65`+**`blur-md`≈12px** (LeadCapture) · `bg-slate-950/60` (SiteNav) · none (ChatWidget) |
| **z-index** | **8 tiers, no scale** | 99999 · 9999 · 75 · 70 · 60 · 50 · 40. **LeadCaptureModal (50) sits below SiteNav sheet (60)** — nav overlays an open lead modal |
| **Card radius** | **5** | 16px · 20px · `rounded-3xl` (24px) · `rounded-2xl` (16px) · 0 |
| **Brand navy** | **2 conflicting hexes** | `#05214F` (OTP const, all CSS popups, `--primary`, `--ink`, `--brand-color`) vs **`#002c5f`** (every Tailwind modal, hardcoded not tokenised, `--brand`). Gradient ends `#00142e` while `--brand-deep` is `#001f44` |
| **Accent** | **3** | `#ffd633` yellow (OTP/Offer) · **`#38bdf8` sky** (TradeOffer amount) · `#ff6b00` orange (Offer header radial) |
| **Success state** | **4** | `#f0fdf4`/`#bbf7d0`/`#16a34a` · `#ecfdf5` 100px ✓ · `bg-green-100 text-green-600` · `bg-primary/10 text-primary` |
| **Error state** | **4** | `#fef2f2`+`#dc2626` · `#fef2f2`+`#b91c1c` · `bg-red-50 text-red-600` · `bg-red-50 text-red-700` |
| **Field labels** | **4** | 10px/800 `#475569` · 11px/700 `#475569` · 12px/600 `#374151` · `text-xs font-bold uppercase tracking-wider slate-500` |
| **Inputs** | **4** | 42px/r8/`#e2e8f0`/bg `#f8fafc`/14px · 42px/r8/`#cbd5e1`/no bg/14px · pad 10-12/**r6**/`#d1d5db`/**16px** · `rounded-xl`/`slate-200`/`bg-slate-50`/14px |
| **Primary button** | **3 languages** | **6px** flat inline · **10px** gradient/flat CSS · **`rounded-full` pill** Tailwind |
| **Close affordance** | **6 treatments** | 32px `rgba(255,255,255,.9)` + inline SVG · 32px `rgba(255,255,255,.2)` + `✕` glyph · bare 24px `×` glyph · `h-10 w-10 rounded-full bg-slate-100` + lucide · **`h-9 w-9`** (×4 — below 44px touch target) · `h-9 w-9 rounded-xl` square |
| **Heading style** | **2** | `font-style: italic` display (OTP 22/24px, Offer 54px) vs non-italic `font-bold`/`font-extrabold` (all Tailwind) |
| **Font stack** | **2** | `ModalShell` hardcodes `"Metropolis", "Segoe UI"` inline while `--font-sans` is **Inter**; Metropolis is not loaded |
| **Body padding** | **6** | `p-5` · `px-5 pb-5 pt-4 sm:px-6` · `px-6 py-6` · `p-6` / `sm:p-8` · 24px 30px · 36px 40px · 60px (Offer success) |
| **Design tokens** | **1 of 11** | Only `LeadCaptureModal` uses `bg-card`/`text-ink`/`ring-border`/`bg-primary`; all others hardcode hex |
| **Animation** | **3** | framer-motion spring (stiffness 220/240/320/340/380 — 5 different) · CSS `transition-[opacity,transform] 300ms` · none |
| **A11y** | — | Only `OfferPopup` has focus trap + restore. **OTPPopup and TradeOfferPopup have no `role="dialog"`, no Esc, no scroll lock, no backdrop dismiss.** ChatWidget claims `aria-modal` without a modal |

---

### shadcn primitives available for adoption

`src/components/ui/` contains **46 primitives, and app code imports exactly zero of them** — the only `@/components/ui/` references are 8 internal cross-imports between primitives themselves. All 26 `@radix-ui/*` packages, plus `vaul`, `cmdk`, and `sonner`, are installed and shipping as dead weight.

Directly replacing hand-rolled markup:

| Primitive | Replaces |
|---|---|
| `dialog.tsx` (Radix) | All 6 centered modals — gives portal, focus trap, Esc, scroll lock, `aria-modal` for free |
| `sheet.tsx` | Inventory filter drawer (#9), SiteNav mobile sheet (#11) |
| `drawer.tsx` (vaul) | Mobile bottom-sheet variants of the lead modals |
| **`input-otp.tsx`** | OTPPopup's hand-rolled 6-input `otp`/`otpRefs` array — purpose-built and unused (note: that OTP step is also **dead code**; `Step="otp"` is never rendered, `handleSendOTP` jumps straight to `"success"`) |
| `form.tsx` + `label.tsx` + `input.tsx` + `textarea.tsx` + `select.tsx` + `checkbox.tsx` + `radio-group.tsx` | Every modal form — collapses the 4 label and 4 input treatments |
| `button.tsx` | Collapses the 3 button languages (6px / 10px / pill) into variants |
| `toggle-group.tsx` | LeadCapture mode chips, TradeValuator year/make/condition grids, inventory facet chips |
| `progress.tsx` | TradeValuator's hand-rolled `motion.div` step bar |
| `alert.tsx` / `sonner.tsx` | The 4 divergent inline error blocks (sonner installed, never mounted) |
| `table.tsx` | Compare modal's raw `<table>` |
| `badge.tsx` | "N active" filter count, "Exclusive online offer" eyebrow |
| `card.tsx` | Vehicle-context blocks repeated in QuickEnquiry / LeadCapture / OTP sidebar |
| `accordion.tsx` / `collapsible.tsx` | SiteNav `<details>` disclosures |
| `scroll-area.tsx` | Drawer body and chat conversation scroll regions |
| `separator.tsx` | Dashed dividers in ExitIntent / TradeOffer promo |
| `slider.tsx`, `checkbox.tsx` | Inventory price-range and facet filters |
| `popover.tsx` / `tooltip.tsx` / `hover-card.tsx` | ChatWidget prompt bubble, disclosure affordances |
| `alert-dialog.tsx` | Any confirm/destructive step |
| `skeleton.tsx`, `avatar.tsx`, `tabs.tsx`, `command.tsx`, `carousel.tsx`, `pagination.tsx` | Loading states, chat identity, mode switching, search, galleries, inventory paging |

### Answer: how many distinct overlay implementations

**7 distinct overlay implementations across 11 surfaces** (5 distinct backdrop treatments, 8 z-index tiers, 5 card radii, 3 button languages, 6 close-button treatments). **None** share a common shell, and **none** use the Radix `Dialog`/`Sheet` primitives already installed — a single `dialog.tsx` + `sheet.tsx` adoption would collapse all 7 into 2.

Two bugs worth surfacing while you're in here:
- `src/components/site/LeadCaptureModal.tsx:108` — `if (!isOpen) return null;` sits *above* the `<AnimatePresence>` at line 111, so exit animations can never run; the wrapper is inert. (Related to the known `mode="wait"` React 19 issue in memory, but this one is a plain ordering bug.)
- `src/routes/inventory.tsx:1914` — the drawer backdrop is `absolute inset-0` inside a `fixed inset-0` parent rather than `fixed`, unlike every other modal; it works only because the parent is full-viewport.