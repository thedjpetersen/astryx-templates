# Upstream issues for @astryxdesign/core (from the 2026-07-03 fit-and-finish sweep)

Findings that are component/toolchain-level, discovered while reviewing and fixing all
192 (now 250+) templates with the screenshot → Gemini → pixel-verify pipeline. Each has
been worked around in templates, but the durable fix belongs upstream. Repro evidence
lives in the per-cycle reports in this directory.

## 1. Table: `max-width: 0` truncation clamp breaks children-mode column sizing
`overflowStyles.cell` applies `max-width: 0` to every th/td. That idiom only works under
`table-layout: fixed` (data mode), but children-mode (`TableHeader`/`TableRow` JSX)
renders with `table-layout: auto`, where the clamp defeats inline `width:` hints and
collapses fixed columns to their padding box — dates render one character per line.
**Hit 8 templates** (transactions-ledger, okr-tree, portfolio-holdings, milestone-burnup,
payout-statements, table-inline-expansion, table-index-detail, table-chart).
*Workaround:* pair every fixed header-cell `width` with `minWidth` (min beats max).
*Suggested fix:* scope the clamp to fixed-layout mode, or document the min-width contract.

## 2. Overlay: `scrim="dark"` silently force-wraps content in dark MediaTheme
Overlay content renders inside `MediaTheme mode="dark"`, so palettes/dialogs go
hardcoded-dark in light-mode apps unless the author re-anchors.
**Hit 3 templates** (mail-compose rendered a light card in dark mode via the inverse
mistake; command-palette-launcher and coding-terminal-workspace rendered dark palettes
in light mode).
*Workaround:* wrap content in `<MediaTheme mode={useTheme().mode}>`.
*Suggested fix:* scrim color should not imply a content theme; decouple, or default
content to the page scheme.

## 3. Avatar: fallback initials have no contrast guarantee and no styling prop
Initials hardcode `--color-text-secondary` on `--color-neutral`; measured 3.4–4.4:1 at
~10px across many templates (below AA for small text), and unreadable when placed on
fixed-dark stages. `AvatarProps` exposes no color/variant hook.
**Flagged in 6+ templates** (okr-tree, git-branch-graph, sprint-board-backlog,
kanban-board, table-tree, story-progress-viewer).
*Workaround:* re-pin `--color-text-secondary` via the Avatar `style` prop.
*Suggested fix:* raise fallback contrast and/or expose an `initialsColor` prop.

## 4. Switch: off-state track/knob near-invisible in dark scheme
Track-off colors are internal StyleX tokens with no override prop; in dark mode the knob
is nearly the same gray as the track. **Flagged in 5+ templates** (cpu-flame-graph,
subtitle-cue-editor, table-comparison, mail-search-builder, diff-viewer, okr-tree).
*Suggested fix:* lift the dark off-state knob/track contrast one step.

## 5. ProgressBar: undocumented `min-width: 48px` floor
Small inline bars (weight bars in table cells) silently overflow their sized wrappers.
*Workaround:* `style={{minWidth: 0}}`.
*Suggested fix:* document, or drop the floor when an explicit width is provided.

## 6. Badge: fixed 20px pill geometry breaks corner-anchoring on small glyphs
A 20px badge with 8px inline padding cannot anchor to a 16px icon corner — it either
floats detached or occludes the glyph (notification-center's bell badges).
*Suggested fix:* a `size="compact"` badge variant for count-on-icon anchoring.

## 7. Toolchain: `light-dark()` inside StyleX values is silently dropped
`@stylexjs/unplugin` 0.19's lightningcss pass rewrites `light-dark()` into
`var(--lightningcss-light/dark)` space-toggle polyfill vars whose definitions are never
emitted into `virtual:stylex.css`, invalidating the whole declaration at
computed-value time (venue-seat-picker's price ramp and two box-shadows died this way).
*Workaround:* carry scheme-conditional values on inline CSS custom properties and
reference them from StyleX.
*Suggested fix:* disable the lightningcss light-dark downleveling, or emit the polyfill
var definitions.

## 8. Demo/app-level: data-viz token layer is never injected
`--color-data-categorical-*` (dataTokenDefaults) is not loaded by the demo, so any
template referencing those tokens without fallbacks renders transparent fills / black
SVGs. ~12 templates were fixed with `var(--token, light-dark(#hex, #hex))` fallbacks and
the chart shim now defines scoped values, but a single injection at app level (or
shipping the tokens in astryx.css) removes the whole bug class. Related: the token
`--color-background` does not exist at all (only `-body`/`-surface`/`-card`), yet reads
naturally enough that a sweep introduced ~120 uses — consider an alias or a lint rule.
