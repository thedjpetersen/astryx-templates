# Fit-and-finish — Vertical Ops batch smoke pass (2026-07-04)

Pipeline: fresh vite server → shoot.mjs (1440×900, light+dark, 2 segments) → my own inspection → sips crop confirmation. Gemini pass not yet run — these are the pre-review smoke findings, all pixel-confirmed via crops (`/tmp/crop-claims-header.png`, `/tmp/crop-grid-diagram.png`).

Batch context: the first capture round silently screenshotted the fallback template for all four ids — the demo needs a `templateRegistry.tsx` entry per template and the running vite server predated the files. Registry entries added (new "Vertical Ops" category), server restarted, re-shot. **Lesson for future batches: authoring isn't done until the registry entry exists; the hash fallback makes the failure silent.**

## claims-adjudication-workbench (2 confirmed)

- **HIGH** [both] claim header region at preview width (~1075px inner): the claim meta text ("2026-06-11 · Lakeview Orthopedic") renders ON TOP of the All/Pended/Denied/Approved segmented filter and collides with the DX strip; the DX chip row also overlaps ("Z79,899" / "Orthopedic" collide). The <1200px subtraction step isn't handling this band — content overlaps instead of subtracting.
- **MEDIUM** [both] claim-lines table, DESCRIPTION column: cells flat-clip mid-word ("Office visit, established pa", "Arthrocentesis, major join", "Hyaluronan (Synvisc-One") — no ellipsis, and the column continues under the aside edge.

## grid-feeder-console (1 confirmed)

- **HIGH** [both] one-line diagram pane: the entire 960×620 diagram renders at roughly 250px wide, pinned low-left in an otherwise empty pane — the SVG does not scale to fill its container. Legend chip at pane bottom is fine; the diagram itself is illegibly small (breaker glyphs ~8px).

## lims-plate-workbench (1 confirmed)

- **MEDIUM** [both] chain-of-custody rail rows: role label, person name, and timestamp concatenate with no separator or spacing — "COLLECTORThandi Mbeki07 Apr 2026, 09:14Draw at Ward 4B", "13:41Received — SEVERED: temp excursion". Reads as broken text runs; needs explicit gaps/separators between role chip, name, timestamp, and note.

## ham-contest-logger

Swept header, entry bar, log rows, multiplier grid, dial, footer in dark 1of2 — nothing confirmed; entry-bar helper text ("Enter logs · Esc …") clips at the segment boundary but stayed below confirmation threshold at this zoom. Re-check in the full Gemini pass.

## ham-contest-logger — full Vera pass (cycle 2026-07-04)

Gemini returned 7 findings; 3 survived pixel crops (4 refuted: pill cap intact, MULT chips are dark-orange-on-cream not white-on-amber, grid digits centered within 1px, entry-bar column "drift" is the form's own grid by design).

- **MEDIUM** [both] entry bar helper text: `Enter logs · Esc wipes` flat-clips after "Esc " at the left pane's right edge — no ellipsis, no wrap (crop /tmp/vham-2-helper.png; source line 1590).
- **MEDIUM** [both] QSO table TIME column: data cells carry the selected-row indicator inset (~10px) but the TIME header does not, so the header sits left of its column's data axis (crop /tmp/vham-4-time.png).
- **MEDIUM** [light] selected QSO row (VP8/G4XYZ/P): no background fill distinguishes it from unselected rows — selection reads only from the 2px orange left bar and bold call (crop /tmp/vham-6-selected.png). Needs the pressed-overlay/selected token fill in both themes.

Sound: contest pill truncation, band/mode segment states, MULT chip contrast, multiplier-grid cell rhythm, beam-dial subtitle ellipsis, rate-card theming.

## claims-adjudication-workbench — post-fix Vera pass (2026-07-04)

Gemini returned 7; 2 survived crops (5 refuted: segmented-tab cap is rounded, dark trace amounts legible, Pended badge is dark-on-cream, totals strip is a label-over-value KPI footer by design, Pend/Approve baselines align).

- **LOW** [both] rule-trace ladder: vertical connector overshoots ABOVE the first rung's icon into the "Rule trace" heading area (crop /tmp/vcl-5t.png) — line should start at the first icon's center.
- **LOW** [both] filter-row meta: one-line truncation lands as "6 lines · …" — ellipsis right after the separator reads ragged (crop /tmp/vcl-1-tabs.png). Better: drop whole meta segments (subtraction) instead of mid-string ellipsis at this band.

Sound: rail grid/alignment, member-responsibility card theming, EOB waterfall bars, sticky footers through scroll.

## lims-plate-workbench — post-fix Vera pass (2026-07-04)

Gemini returned 6; 4 survived (2 refuted: the red-dashed custody segment above ACCESSIONER is the severed-link design, not a state failure; dark Sign-handoff button is clearly bounded).

- **HIGH** [both] manifest table starved by the custody panel at demo-stage width (~1045px): every Sample ID truncates to "S-…", the Type header clips to "Ty"/hidden, B1/CA chips flat-cut at the panel edge. Root cause family: viewport useMediaQuery breakpoints never fire inside the demo stage — needs the ResizeObserver container-width pattern (see grid-feeder-console fix / media-asset-pipeline).
- **MEDIUM** [both] plate-panel footer: right-side counters collapse vertically ("3 / blank ·", "No / holds" stacked word-per-line) when squeezed — same width root cause; needs nowrap + subtraction.
- **MEDIUM** [light] ACCESSIONER severed note: orange alert text on white is borderline (<4.5:1 at 12-13px, crop /tmp/vlm-4-severed.png) — darken the light side of the light-dark pair (e.g. #B45309-class).
- **LOW** [both] plate legend maps only the 5-step purple fill ramp; the hollow "unmeasured" wells (column 12) have no legend entry.

Sound: 96-well grid alignment/selection ring, canvas theming, custody node typography post-fix.

## ham-contest-logger — fix outcome (2026-07-04)

- Helper text: FIXED — entryHint given minWidth:0 + overflow hidden + maxLines={1}; reads "Enter logs · …" in both themes.
- Selected-row fill: FIXED — logRowNewest adds `var(--color-overlay-pressed)` (light-dark overlay token); measured bg (230,235,239) vs (255,255,255) light, (52,52,55) vs (31,31,34) dark; orange bar kept.
- TIME header offset: REFUTED ON FIX — live-DOM measurement showed header/data first cells both at x=377 (sub-1px glyph side-bearing, not layout drift); my crop-based confirmation was wrong; no change made. Reviewer note: DOM measurement outranks crop eyeballing for alignment claims under ~3px.

## grid-feeder-console — post-fix Vera pass (2026-07-04)

Gemini returned 4; ALL FOUR refuted against pixels/source — its entire dark-theme-failure narrative was hallucinated:
- "header metadata hardcoded black in dark" — header text is light-on-dark and fully legible in the dark capture.
- "closed breakers vanish black-on-dark" — breakers render as light-gray squares; feeder lines continuous.
- "legend hardcoded white in dark" — legend crop shows dark surface, light text (/tmp/vgf-legend.png).
- "bus line bleeds through T1 coils" — source (grid-feeder-console.tsx:1173-1176) stops connector stubs at circle tangents; 4x zoom (/tmp/vgf-t1-zoom.png) shows the interior marks are the two coils' intentional IEC overlap.

grid-feeder-console is CLEAN post-fix. Analyze pass now complete across all four batch templates. Running refute tally for the day: 19 of 24 Gemini claims refuted (79% on this batch — worse than the historical 60%; the crop-verify discipline is earning its cost).
