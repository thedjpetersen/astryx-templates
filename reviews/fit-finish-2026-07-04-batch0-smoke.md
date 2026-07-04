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

# Batch 2 analyze pass (workflow wf_48255d4d-321, 2026-07-04)

4 confirmed / 25 refuted (86%). Full refutations in the workflow output; confirmed:

- **HIGH** trial-site-monitor [both]: matrix scroll viewport misses fitting all 8 columns by 18px (clientWidth 690 vs scrollWidth 708) — final column hard-clips mid-glyph with no affordance; "FU-30" reads as the plausible-but-wrong "FU-3". DOM-proved via scroll-to-end crop.
- **HIGH** ramp-turnaround-console [both]: orange fuel drag handle layers over the green Board pill ("Bo■d") on rows A4/D5 and over lock icons on B1/B3.
- **MEDIUM** vertical-farm-rack-console [dark]: far-red 730nm (#FB7185) indistinguishable from deep-red 660nm (#F87171); source comment "kept distinct from the 660nm band" fails in dark.
- **MEDIUM→WONT-FIX** kds-expo-line: mid-name ellipsis on ticket rows — RULED BY-DESIGN: 244px column + single-line row is the spec'd density law; distinguishing info carried by modifier microrows; full names in the all-day aside.

## Batch 2 fix outcomes (2026-07-04)

- trial-site-monitor: FIXED — mid-band rail 260→240 (688 ≤ 690, all 8 columns fit; DOM-proved clientWidth==scrollWidth 690) + MatrixScrollport fade/chevron affordance on a non-scrolling wrapper for the 1000-1057 band slices, hidden at scroll end.
- ramp-turnaround-console: FIXED — fuel grip now an 8×9px tab protruding outside the 14px lane band (parity-driven side), hit area widened 16×14→24×24, slider semantics untouched; 4x crops show "Board" + locks fully legible on A4/B1/B3/D5 both themes.
- vertical-farm-rack-console: FIXED — far-red dark half #FB7185→#F472B6, validated ΔE 37.9/37.3 deutan/12.1 tritan vs 660nm salmon, ≥3:1 on dark surface; fill-only constant.
- kds-expo-line: WONT-FIX (by design), recorded above.

Batch 2 closed: 29 claims → 3 fixed, 1 ruled by-design, 25 refuted.

# Batch 3 analyze pass (workflow wf_af1a7d85-01d, 2026-07-04)

6 confirmed / 25 refuted (81%). ev-site-power-console CLEAN (0/8 survived).

- **HIGH** pharmacy [both]: vertical matrix column header clips "trim/sulf"→"im/sulf" (44px header box too short) — fix agent dispatched.
- **HIGH** pharmacy [both]: audit-ticker pill flat-cut mid-glyph while ~290px footer space idles — aria-hidden flex:1 spacer competes with tickerList flex:1 — fix agent dispatched.
- **LOW** pharmacy ×2: duplicated "JT" initials in header identity; flat keycap legend — same agent.
- **MEDIUM→FIXED** festival [both]: blockMeta spans flat-cut mid-glyph ("220 seat|") — added blockMetaText (minWidth 0 + overflow hidden + ellipsis) to the runtime/seats spans; verified "1h 27… DCP 220 sea…" at 4x zoom (/tmp/vfix-fest2.png).
- **LOW→FIXED** ttrpg [light]: HIT ledger label 3.76:1 — added HP_OK_TEXT light-dark(#0B7F1B, #34C759) (≈5.5:1 light) per the fill-vs-text split convention; fills keep HP_OK. Verified in re-shoot.

Notable refutations: pharmacy VERIFY chip "burns in dark" (properly inverted), festival z-index inversion (stacking parity intact both themes), ttrpg 8/8 and ev 8/8 wholesale hallucinations.

## Batch 3 fix outcomes (2026-07-04)

- pharmacy: FIXED ×4 — column-header box 44→64px (full "trim/sulf"); collapsed-only spacer so tickerList owns the free width (pill #103 complete with rounded cap); identity label deduped to "J. Tan, PharmD"; keycap legend now DS Kbd chips (matching workforce-approvals-inbox idiom). Crop proofs in /tmp/astryx-uiux/b3-pharm-fix/.
- festival + ttrpg: fixed inline earlier this pass (recorded above).

Batch 3 closed: 31 claims → 6 fixed, 25 refuted. Day total across 3 batches: 84 claims adjudicated, 23 fixed, 1 by-design, 60 refuted (71%).

# Batch 4 analyze pass (workflow wf_ddb8c576-163, 2026-07-04)

4 confirmed / 28 refuted (87.5%). court-docketing-console CLEAN (0/8).

- **HIGH→FIXED** election [both]: gauge panel content (~148px: wrapped caption 43 + SVG 36 + baseline-inflated readouts 46) overflowed the 132px panel — GAUGE_H 132→152, readouts row made font-metric-deterministic (flex-end + explicit line heights = exactly 32px); DOM-proved 3.3px slack.
- **MEDIUM→FIXED** election [both]: 92px county label column at exactly zero slack flipped truncation onto the percent under harness font metrics — LABEL_W 92→96, pct nowrap+flexShrink:0, name owns the ellipsis; DOM-proved pct scrollWidth==clientWidth.
- **MEDIUM→FIXED** rundown [both]: ghost backtime ran under RESTORE — ghostHit now shrinkable (minWidth 0 + ellipsis); verified "was 18…" clear of the button.
- **LOW→FIXED** degree [both]: scaleX squashed the meter fill's right cap — switched to translateX of a full-width pill (still transform-animated); rounded cap verified at 6x zoom.

Day totals (4 batches): 116 claims adjudicated — 27 fixed, 1 by-design, 88 refuted (76%).

# Batch 5 analyze pass (workflow wf_2a6dc12e-edc, completed post-pivot 2026-07-04)

3 confirmed / 22 refuted (88%). public-records-console CLEAN (0/6, incl. a DOM-proof that all queue right-rail labels sit flush at x=692.0). magazine-flatplan-board CLEAN (0/6).

- **HIGH** crane [dark]: rigging-stack SVG payload label "Transformer T-2 · 41,800 lb net" renders rgb(0,0,0) on rgb(24,24,26) (~1.0:1) — fill="var(--color-text)" on SVG <text> not resolving to the dark token. Fix agent dispatched.
- **LOW** crane [both]: CL corner tag overlaps the Required pill by 3.0x14.8px (translucent ambers stack darker). Same agent.
- **HIGH** elevator [both]: schedule grid 416px vs 404px card clip — "Regulatory windo" flat-cut header, every row's window band sheared flat at the card edge (DOM-verified 12px overflow). Fix agent dispatched.

NOTE: fixes run as a low-priority side pass — the session has pivoted to the MOBILE KIT (user directive).

## Batch 5 fix outcomes + phantom-token sweep (2026-07-04, post-pivot side pass)

- crane: FIXED ×2 — root cause of the black label: `--color-text` DOES NOT EXIST (real tokens are --color-text-primary/-secondary/...). In CSS `color:` the invalid var degrades to inherited color and silently looks right; on SVG fill/stroke it collapses to initial black. All 9 SVG uses in crane replaced with --color-text-primary (pixel-proved rgb(223,226,229) on dark); CL tag/pill overlap cleared (2.0px clearance, DOM-proved).
- elevator: FIXED — mid-band columns 104/92/76/minmax(80,1fr) = 400 ≤ 404 card (DOM-proved 404==404); bands end with rounded caps; header ellipsizes honestly.
- REPO SWEEP for the phantom token: 71 `var(--color-text)` occurrences across 20+ templates, but only 3 in SVG fill/stroke contexts (all vertical-farm-rack-console dial/glyph) — fixed those; the CSS `color:` uses inherit correctly and were deliberately left (a blanket rename could CHANGE rendering where the inherited color is secondary).

# Mobile batch 1 analyze pass (workflow wf_b108b075-c45, 2026-07-04)

1 confirmed / 25 refuted (96% — cleanest batch of the session; the mobile foundations discipline held). parking 0/8, transit 0/6, p2p 0/5 all CLEAN — several refutations were gallery-harness scroll-padding artifacts around the sticky nav/tab bars, correctly identified as impossible-on-device; verifiers used live-DOM measurement at the demo's new port 5176.

- **MEDIUM→FIXED** mobile-cycle-phase-wheel [both]: active tab used var(--color-brand) (demo-logo blue) inside the single-accent Lunara rose app — tabItemActive now uses BRAND_ACCENT; re-shot, rose confirmed.

Foundations amendments recorded in /tmp/astryx-mobile-brief.md (sticky toast docks; preventScroll sheet focus) — discovered independently by 3 of 4 authors.

# Mobile batch 2 analyze pass (workflow wf_a46241db-5c3, 2026-07-04)

2 confirmed / 28 refuted (93%). mobile-camera-roll-organizer 0/8 and mobile-sleep-morning-report 0/8 CLEAN.

- **MEDIUM→FIXED** mobile-prescription-pickup [dark]: unchecked checkGlyph border used the hairline token (1.31:1 on the dark row) — now light-dark(#73737D, #98989F); DOM-proved rgb(152,152,159) on rgb(31,31,34) ≈ 5.3:1.
- **MEDIUM→FIXED** mobile-meditation-breath-player [both]: unplayed track + future beads ~1.2:1 against the chapter-tint hero — explicit in-family rest pair light-dark(#7A928D, #5F7370) (≥3:1 both schemes); crop-verified visible timeline structure.

Recurring lesson: the hairline/muted tokens are for passive separators only — INTERACTIVE control boundaries and meaningful rest-state fills need explicit ≥3:1 pairs (candidates for a primitiveContracts addendum).
