# AM Ford — Current Visual Language (pre-redesign baseline)

Captured 2026-08-14 at 1440×900 from the running app. Three surfaces analysed: `/` (bespoke shell), `/inventory` and `/vehicle/f150-platinum-2025` (SiteShell). Findings marked **[system]** appear on 2+ surfaces; **[local]** on one.

---

## Design Map

### Color

| Role | Value | Notes |
|---|---|---|
| Page ground | `#F8FAFC` slate-50 | **63.4% of painted area** [system] |
| Brand navy (home) | `#002C5F` | 44 background uses, 82 text uses [local to home] |
| Brand navy (theme) | `#05214F` | `--primary`, unused by the homepage [system] |
| Surface | `#FFFFFF` / `rgba(255,255,255,.85)` | 11.4% + 9.6% area [system] |
| **Action orange** | `~#F59E0B` | "Get Price" only, on `/inventory` + VDP. **Absent from tokens and from the homepage** [local] |
| Accent sky | `#38BDF8` | squiggle underline, badge dots [local to inventory] |
| Body text | `oklch(0.446 …)` slate-600 | 68 uses [system] |

Two navies is the headline defect. `#002C5F` and `#05214F` are 4% apart in lightness — close enough that nobody notices the inconsistency, far enough that no rule reconciles them.

### Typography

Single family: **Inter**, 1,227 computed uses, zero fallbacks in play.

| Level | Size / weight / tracking |
|---|---|
| h1 | 60px / 700 / −1.5px |
| h2 | 24px / 600 / −0.6px *(and 44px elsewhere)* |
| h3 | 15px / 700 / normal |
| Body | 14px / 400–500 |

Size distribution is the tell: **14px (77), 12px (67), 13px (52), 11px (39), 18px, 15px, 16px, 10px**. Eight sizes crammed between 10 and 18px. That is not a scale, it is per-component improvisation. Weight distribution shows the same: 600 (134), 500 (90), 400 (68), 700 (52) — four weights doing undifferentiated work.

### Radius

`999px` pill (147 uses) · 22px · 28px · 26px · 18px · 36px · 32px · 14px

**Eight distinct radii.** Buttons alone measure 18px, 22px, 36px, and full-pill across five sampled variants.

### Spacing

4px (108) · 16px (88) · 8px (74) · 20px (62) · 6px (48) · 12px (41) · 24px (37) · 14px (27) · 28px (18)

A 4px base is implied but 6px, 14px, and 20px break it. Section rhythm on the homepage is 144px (14 uses) — generous and consistent, which is the one spacing decision that holds.

### Grid & container

`max-width: none`, container measured at **1425px** — effectively full-bleed at 1440. 16 grid containers on the homepage alone; largest is a 2-col `524px 524px` with 56px gap.

### Shadow

Dominant: `rgba(0,44,95,0.08) 0 20px 50px -20px, rgba(0,44,95,0.04) 0 4px 16px -4px` (36 uses) — brand-tinted, offset, soft. This is the strongest single piece of craft in the current system.

### Motion

Transitions are Tailwind defaults: `0.15s`/`0.3s cubic-bezier(0.4,0,0.2,1)`. `prefers-reduced-motion` **is** honoured; `:focus-visible` **is** defined. Both confirmed present in stylesheets.

### Imagery

Two incompatible treatments. Homepage uses **lifestyle photography** (truck at dusk, mountains, 1.78:1). Inventory uses **studio cutouts on grey gradient** (1.60:1). The VDP gallery renders the *same* photograph as hero and all three thumbnails.

---

## Taste DNA

### 1. The lot is a landing page, not a catalogue
**Trigger:** A visitor lands on `/inventory` wanting to see cars.
**Decision:** The entire first viewport is a hero photograph plus a `$500 Trade-In Bonus` capture form. The first vehicle card sits at **1554px** — nearly two full viewports down.
**Reason:** Lead volume was optimised over browsing. Every surface is instrumented to intercept: chat widget, exit-intent, mobile sticky CTA, offer popup, OTP popup, trade popup.
**Evidence:** `firstVehicleCardAt: 1554px` on an 11,242px page. Homepage is 14,225px. Six vehicles are buried under ~26,000px of combined page height.
**Verdict:** Replace. Inventory must open on inventory.

### 2. Colour is a per-page decision, not a system
**Trigger:** A CTA needs to feel urgent on a product page.
**Decision:** Orange was introduced for "Get Price" on `/inventory` and the VDP. It exists in no token, appears on no other surface, and sits beside navy CTAs of equal visual weight.
**Reason:** Each page was designed in isolation and reached for whatever read as "buy now" at that moment.
**Evidence:** Orange has zero occurrences in `styles.css`; the VDP stacks a navy, an orange, a navy, an outline, and two greys as six consecutive full-width buttons.
**Verdict:** Replace. One accent, one meaning.

### 3. Restraint where it was cheapest, excess where it counted
**Trigger:** Choosing how hard to work on ambient craft versus conversion surfaces.
**Decision:** The homepage's `fx/` layer is careful, considered engineering — SSR-safe reveals, a WebGL capability gate that never ships 930KB to a phone, transform-only animation, brand-tinted shadows with real offset. The conversion surfaces it sits beside are hand-rolled inline styles with no focus management.
**Reason:** The ambient layer was authored once by someone thinking systemically; the modals were each added under delivery pressure.
**Evidence:** `Scene3D` implements an error boundary, viewport gating, Save-Data and reduced-motion checks. `OTPPopup`, 720 lines away, carries 36 inline `style={{}}` objects and a verification step that never executes.
**Verdict:** **Keep the `fx/` thinking, discard its surface.** This is the one part of the existing work whose *approach* should survive the redesign.

### 4. Hierarchy dissolved into equal-weight options
**Trigger:** A vehicle page needs to convert.
**Decision:** Seven calls to action stack vertically in the buy box — *Is this still available? / Get Price / Book test drive / Request E-Price Quote / Text us / Video tour / Watch price* — in four different visual treatments.
**Reason:** No single next step was ever chosen, so every proposed step was added.
**Evidence:** Screenshot shows all seven above 900px, with the chat widget overlapping the last two. Card badges duplicate too: the Escape carries "Certified Pre-Owned" twice, the Lightning shows "Electric"+"New" left and "EV"+"New" right.
**Verdict:** Replace. One primary action per page.

---

## Carry forward

1. **`#002C5F`** — Ford Midnight Navy is correct for this brand. Keep the value, kill `#05214F`.
2. **The brand-tinted shadow ramp** — `rgba(0,44,95,.08) 0 20px 50px -20px` is genuinely well-judged depth.
3. **144px section rhythm** on the homepage.
4. **The `fx/` engineering posture** — capability gating, SSR-safe motion, reduced-motion respect.
5. **The content layer** — `vehicles.ts`, `serviceAreas.ts`, `counties.ts` are real, sourced, and carefully commented.

## Replace

1. Two navies, orange-from-nowhere, sky accent → one accent with one meaning.
2. Eight radii → three.
3. Eight type sizes between 10–18px → one scale.
4. Two shells, two navs, two footers → one.
5. Six bespoke modals → one dialog primitive.
6. Lead-capture-before-content IA → content first, capture at intent.
7. Two photographic treatments → one.
