# Design

<!-- impeccable:design-schema 1 -->

## Platform

web

## Visual identity

A warm, rounded, game-like shell for a kid's math-practice app — built for "a kid, not a school portal." The signature move is the chunky button: a flat fill with a solid 4px offset shadow in the fill's own darker shade, which collapses flat (`translateY(4px)`, shadow removed) on press.

## Tokens

All tokens live in `:root` at the top of `index.html`'s `<style>` block.

**Surfaces**: `--paper` (#F5F7FF, page background), `--grid` (#E2E7FA, reserved for the equation-notebook's grid-paper texture), `--white`, `--sand`/`--sand-d` (unused reserve).

**Ink + lines**: `--ink` (#1B1B2F, primary text), `--ink2` (#5B6080, secondary text), `--ink3` (#9AA0BC, disabled/inactive only — does not meet body-text contrast by design), `--line` (#E4E7F2, hairline borders).

**Accent roles** (each a base/-d/-l triad): `--blue` (primary actions, selection), `--orange` (energy/hints), `--mint` (success/correct), `--sun` (coins, rewards — always paired with `--ink` text, never white: the base tone is too light for white text at any usable size), `--pink` (reserved for parent/admin surfaces), `--purple` (rare, not used as a button role), `--red` (errors, destructive actions).

The `-d` (dark) variant of each role is what actually sits behind white button text; the base tone is for lighter fills (paired with `--ink` text) and the `-l` tint is for tinted callout backgrounds (paired with the `-d` shade as text). This three-step ladder is the rule for adding any new color role.

**Type**: `--display` ('Fredoka','Rubik',system-ui,sans-serif) for headings, stat numbers, and anything numeric/Latin; `--body` ('Rubik',system-ui,sans-serif) for body text and controls. Fredoka has no Hebrew glyphs, so Hebrew text always renders in Rubik regardless of which token it's assigned — this is expected, not a bug, and means the display/body distinction is only visible on digits and Latin text (stat numbers, "Kumon" in the title, coin counts).

**Radius**: `--r-lg` (28px, the outer `.container` and large panels), `--r-md` (18px, cards/buttons), `--r-sm` (12px, small controls/pills).

**Elevation** — pick exactly one per element, never combine:
- `--lift`: the chunky button's offset shadow (most buttons use a role-specific hardcoded offset color instead, matching their own `-d` shade, so the shadow reads as "this button's own darker shade" rather than a generic gray).
- `--ring`: a 1px all-around outline for resting cards/list rows (`.teacher-row`, `.answer-section`, `.equation`, `.formula-box`).
- `--drop`: ring + soft long shadow, for the one surface that's genuinely "lifted off the page" (`.container`, `.puzzle-wrap`, floating coin-pop toasts).

## Components

- **`.btn` family** (`.btn-primary/success/warning/secondary/info`): all chunky, all `translateY(4px)` + shadow-removal on `:active`. Primary = blue/white. Success = mint base/ink text (not mint-d — kept lighter and friendlier than the saturated info/danger roles). Warning = orange base/ink text, same reasoning. Secondary = neutral/ink2. Info = orange-d/white (used for the one urgent pulsing CTA, "video help").
- **`.basics-track-card`** (the practice-track grid, ~23 variants): cycles through blue-d/orange-d/mint-d/sun as flat fills in a fixed, deterministic pattern (not per-track custom gradients, which the old design used) — committed palette over a rainbow of one-off hues.
- **`.topic-card`** (the legacy bagrut-topics menu, 5 variants): same cycling idea, blue/pink-d/mint-d/orange-d/sun.
- **Notebook/formula surfaces** (`.geq-notebook`, `.formula-box`, `.ba-*`): the grid-paper texture and Patrick Hand handwriting font are pinned, specific choices from an earlier extensive design round with the user (not a generic decorative grid) — reserved for these "show your work" surfaces only, never used as page-wide decoration.
- **Header bars** (`.topic-view-header`): solid blue fill, white Fredoka text, chunky pill actions inside.

## Known accepted deviations

- `.puzzle-wrap`'s tile grid has no inset padding — the tiles must span edge-to-edge to cleanly obscure/reveal the underlying photo; insetting them would leave gaps in the image.
- `--ink3` intentionally does not meet 4.5:1 body-text contrast — it's used only for disabled/locked controls and one small secondary caption, where reduced contrast is the correct "unavailable" signal.

## Accessibility

Every button/card color pairing in the active palette was checked against WCAG AA (4.5:1 body / 3:1 large text) and fixed where it fell short; see token comments above for which roles pair with which text color. RTL/LTR math isolation (`direction:ltr; unicode-bidi:isolate` on every equation/notebook span) was preserved exactly from the pre-redesign implementation and re-verified after the full CSS rewrite.
