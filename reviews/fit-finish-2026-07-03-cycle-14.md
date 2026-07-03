# Fit-and-finish review — cycle 14 (2026-07-03)

Pipeline: vite demo server → Playwright headless Chromium (1440x900, light+dark, scrolling segments of `.preview-wrap`) → Gemini designer critique → Claude agent pixel-crop verification. Findings marked unconfirmed did not survive visual verification but were kept as possible nitpicks.
**Totals: 3 high / 12 medium / 20 low confirmed across 12 templates.**


## notebook-report (4 confirmed)

- **HIGH** [both] Onboarding step conversion table (last notebook block): Table is clipped by a fixed-height container: the column header row (Onboarding step / Self-serve / Sales-assisted / vs. W22) is vertically cut off at the top, and the last data row (Activated (3+ reports, 7d)) is sliced mid-glyph at the bottom with its +3.2 pts badge half-clipped, colliding visually with the 'Run 4 · 1.2 s · prod-warehouse' footer.
- **LOW** [both] Published badge and +/- pts delta pills: White text on saturated green badges/pills is marginal contrast (~3:1) for small text, and the badge/pill colors are pixel-identical in light and dark mode, suggesting hardcoded status colors rather than scheme-aware tokens.
- **LOW** [dark] Notebook header (right side, next to Run all): The 'prod-warehouse · idle' status text renders in a dim mid-gray on the near-black background in dark mode, making this metadata barely legible.
- **LOW** [both] Week-one activation by cohort chart block: Chart renders with no axis tick labels, axis titles, or series legend in either scheme — just two lines over gridlines — so the visualization reads as unfinished (this matches the disclosed local ChartV2 shim).

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded on first run, all 6 captures (light/dark x 3 segments) rendered non-blank, gemini responded on first attempt with 8 findings. Dropped after verification: gemini #3 (SQL results table '0px padding' — actual crop shows ~24px left padding matching prose blocks), #6 (missing footer separator — symptom of the confirmed table-clipping defect, folded into finding 1), #7 (row-divider inconsistency between SQL output and onboarding table — intentional raw-monospace-output vs formatted-table styling), #8 (chart gridlines 'crash into borders' — gridlines visibly end well inside the plot area). The '← TOOLS' portion of gemini #5 was gallery chrome and excluded. Verification crops saved under /tmp/astryx-uiux/shots/crops/ (light3-table.png, dark3-table.png, light2-results.png, dark1-header.png).

## table-inline-expansion (4 confirmed)

- **HIGH** [both] table body (metrics + owner columns): Table column widths collapse catastrophically: request-count, error-rate, latency, and owner columns wrap one character per line (e.g. '8 1 2 , 4 4 0' stacked vertically, 'Payments Core' as a letter-per-line column), blowing row heights to ~250px and making every row unreadable. Visible in all 6 screenshots.
- **HIGH** [both] table header + right edge: Table overflows the preview card with no horizontal scroll: column headers are truncated to useless fragments ('Re', 'Er', 'P...', 'St', 'Ow') and the Owner column is cut off by the card's right edge (1of3 segments, both schemes).
- **MEDIUM** [both] table rows, left edge (expand toggle): The per-row expand/collapse control is crushed to a stray glyph fragment (renders as a tiny ':' or '`' before the GET/POST/DELETE method badge), so the row toggle looks broken and unclickable (all segments, both schemes).
- **MEDIUM** [both] table rows, status column: Circular status badges (green/yellow/purple letter dots) are clipped on their right edge by the adjacent collapsed column boundary in every row (all segments, both schemes).

> Pipeline notes: Capture and gemini pipeline healthy on first attempt; both schemes rendered non-blank. Two gemini findings were dropped after pixel-level verification: (a) claimed illegible dark-mode 'Retrieve a created charge' text — actual text is rgb(~169,174,180) on rgb(23,23,26), roughly 7.7:1 contrast, clearly legible; (b) claimed missing expanded-region background tint in dark mode — the expanded region is measurably darker (23,23,26) than rows (31,31,34), mirroring the light-mode tint. Remaining findings all stem from one root cause: the table's column layout collapses under the preview panel width (no min-width/overflow-x handling), which likely warrants a single code fix.

## product-list (4 confirmed)

- **MEDIUM** [both] filter rail - price slider: The 'S0 - $500' value label collides with the right slider thumb; the thumb visually overlaps the '$' character, leaving zero gap between control and text.
- **MEDIUM** [both] filter rail - in-stock toggle: The 'In stock only' toggle is pinned to the far left while its label and 'Hide backordered items' subtitle are pushed to the right edge, leaving a large dead gap that visually detaches the control from its label (flex justify bug).
- **MEDIUM** [dark] filter rail - in-stock toggle: In dark mode the inactive toggle switch is dark gray on a dark gray panel; the knob and track nearly blend into the background and the control is hard to see, unlike light mode where it reads clearly.
- **LOW** [both] product card grid - status badges: Status badges have no consistent slot: 'Sale' renders inline on the price row while 'Backordered' renders right-aligned on the rating row, so card layouts shift unpredictably between products (compare Ridgeline UL 1P Shelter vs Basin 6P Cabin Tent).

> Pipeline notes: Pipeline healthy: shoot.mjs produced 4 non-blank captures (2 scroll segments x 2 schemes) on the first run; gemini responded on the first call. Four of gemini's eight findings were rejected on visual verification: the dark-mode 'Sale' badge (pink on maroon) and 'Backordered' badge (light gray on medium gray) are legible and properly themed; the price-slider active track is white in dark mode (black in light), i.e. correctly tokenized, not hardcoded black; the last card row has normal bottom padding; and the results-toolbar text is vertically centered with its controls.

## dashboard-executive-summary (3 confirmed)

- **MEDIUM** [both] hero Net revenue card: Large empty void (~250px) at the bottom of the hero card below the '97% of the $50.0M quarterly plan...' caption; the card is stretched far taller than its content (apparently to match the right-hand stat column), leaving a big blank region visible in the 2of2 segment of both schemes.
- **LOW** [both] hero Net revenue card bar chart: Quarterly bar chart has no baseline, axis line, or category labels — eight bars float in whitespace with no indication of which quarters/months they represent, which reads as unfinished for a board-review hero chart.
- **LOW** [both] right-column KPI stat cards (ARR, NRR, Gross churn, Qualified pipeline): All four sparklines render as nearly perfectly flat straight lines despite deltas like +14.2% YoY and +6.8% QoQ; they convey no trend shape and look like decorative rules or placeholder data rather than sparklines.

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded first try, all 4 captures (light/dark x 2 segments) rendered non-blank, no recaptures needed. Gemini critique returned 8 findings but 5 were dropped after visual verification: its top finding (status-badge contrast failure) was backwards — badges are legible and correctly themed in both schemes; the 'hardcoded dark progress bar' claim is wrong since the fill inverts between schemes (token-based); 'clipped sparklines' and 'subtext jammed at card bottom' contradicted the actual crops; table-width/gutter claims were sub-perceptual. Verified via close-up crops of badges, hero card bottom, ARR/NRR cards, and gutters.

## table-comparison (5 confirmed)

- **MEDIUM** [both] Compare plans card header (subtitle + table right edge): Subtitle says "21 features · 5 plans" but only 4 plan columns (Free, Starter, Team, Business) are visible; the Business column sits flush against the table's right edge with no partially visible column, edge shadow, or scrollbar, so there is zero affordance that a 5th plan exists or that the plan columns scroll horizontally.
- **MEDIUM** [dark] Card toolbar, "Differences only" toggle: In dark mode the off-state toggle thumb is nearly the same dark gray as the track, making the control's state almost impossible to read; in light mode the white thumb on gray track is clearly visible, suggesting the dark-mode thumb color is under-contrasted.
- **LOW** [both] Recommended (Team) column highlight, table top and bottom edges: The highlighted Team column band paints over and slightly protrudes past the table container's outer border: the black/white accent bar sticks out ~2px above the top outline (1of3), and at the bottom (3of3) the shaded band interrupts the bottom border stroke and overshoots it, breaking the container's continuous rounded outline in both schemes.
- **LOW** [both] Table header, top-left frozen cell: The "Relay / Workflow automation" label in the frozen header cell is pinned to the bottom of the tall plan-header row, leaving a large empty void above it and putting "Relay" on the same baseline as the plan taglines rather than the plan names; the cell reads as unbalanced.
- **LOW** [dark] Frozen feature column, secondary sub-labels: Feature sub-labels in dark mode (e.g. "Changes require approval before deploy", "Successful and failed runs both count") are a dim muddy gray on the dark row background — legible but noticeably lower contrast than their light-mode counterparts.

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded on first run with non-blank previews in all 6 captures (no blank-panel flake), and the single gemini call returned 8 findings on the first attempt. Two gemini findings were rejected on verification: (1) claim that the Team column uses a dark, unreadable background in light mode — crops show a light gray highlight with fully legible black text; (7) claim that the column highlight bleeds into section header rows — the Usage/Collaboration bands are uniform across the Team column. Gemini's top/bottom border-clipping findings were merged into one confirmed finding. Crops used for verification are in /tmp/astryx-uiux/crops/.

## shell-top-nav-sidebar (4 confirmed)

- **MEDIUM** [both] shell layout (top nav + side nav): The shell scrolls as one flat document: the global top nav scrolls completely out of view and the side nav scrolls with the page, leaving the active 'Instances' pill clipped at the top edge (visible in segment 2of2 of both schemes). For a 'Top Nav + Left Sidebar' shell template, the nav chrome should stay fixed while only the content pane scrolls.
- **LOW** [dark] top nav avatar: Dark mode 'PR' avatar renders light-grey initials on a mid-grey circle — noticeably lower contrast than the light-mode equivalent (dark text on pale blue). Legible but below comfortable contrast.
- **LOW** [dark] content cards (Summary / Usage / Recent events): In dark mode the card background is nearly identical to the page background and the outline border is very faint, so cards lose definition as containers.
- **LOW** [both] content card grid: The two-column card grid places 'Recent events' alone in the second row, leaving a large empty cell to its right; the asymmetric gap reads slightly unfinished on the placeholder page.

> Pipeline notes: Capture succeeded on first attempt (2 scroll segments per scheme, no blank-panel flake). Gemini critique succeeded on first attempt and returned 8 findings; 4 were refuted by zoomed crop verification (skeleton right-padding claim, rounded-corner 'hole', secondary-text contrast, refresh-icon misalignment) and gemini's 'unanchored sidebar footer' was folded into the non-sticky-shell finding as the same root cause. Crops saved under /tmp/astryx-uiux/crops/stn-*.png; screenshots at /tmp/astryx-uiux/shots/shell-top-nav-sidebar.*.png.

## messaging-shell (3 confirmed)

- **MEDIUM** [both] main message stream (center column): The main channel stream has no message composer/input at the bottom; the column simply ends after the last message while the thread panel gets a 'Reply in thread…' input, leaving no way to post to the channel (visible in both 2of2 segments).
- **MEDIUM** [both] channel header (center column): Channel name 'design-systems' wraps to two lines ('design-' / 'systems') in the header despite available horizontal space — the name container is too narrow and breaks at the hyphen in both light and dark.
- **LOW** [both] header seam between stream and thread panel: Bottom borders of the channel header and thread panel header do not align: the channel header is taller (a side effect of the wrapped two-line channel name), so the horizontal border line steps up where the thread panel begins.

> Pipeline notes: Capture succeeded first try (2 scroll segments per scheme, no blank-panel flake). Gemini call succeeded but was unreliable: 5 of its 8 findings were hallucinated or misread (two 'critical contrast failure' claims were false — light-mode own-message text is dark and readable, dark-mode thread text is light and readable; the message-grouping and zero-margin/clipping claims also did not survive crop inspection). Only the missing main-stream composer and the header height mismatch verified; the channel-name line-wrap finding was added from my own inspection.

## search-results (2 confirmed)

- **MEDIUM** [both] filter rail (Content type / Product area facet groups): Multi-select facets use circular radio-style controls; facet counts in each group sum to the full result total (16), implying multi-select behavior that conventionally requires square checkboxes. Radio circles suggest mutually exclusive choice.
- **LOW** [both] header band above filter rail and results list: The 'Filters' heading sits ~6-8px higher than the '16 results for "webhook retries"' line in the same horizontal band, so the two column headers do not share a baseline.

> Pipeline notes: Capture succeeded first try (2 scroll segments per scheme, none blank). Gemini call succeeded and returned 7 findings, but 5 were dropped on visual verification: light-mode highlight text is legible gray-on-gray (not white-on-white), metadata separator is already a mid-dot, the 'independent scroll' claim was a misreading of the scroll segments, bottom-anchored pagination is standard for a 5-per-page list, and the search-bar clear icon has adequate spacing. No additional defects found in my own sweep; dark mode appears fully token-driven.

## cli-pairing-console (1 confirmed)

- **LOW** [both] Browser authorization column - authorizing state card: The authorizing-state card drops the instructional sentence shown in the idle card ('Enter this code? No — confirm it matches your terminal, then Authorize.'), so the KXTR-92FD code block sits noticeably higher than in the idle card; in a real idle-to-authorizing transition this would cause a visible height/layout jump of the card contents.

> Pipeline notes: Capture succeeded first try; all 4 screenshots (light/dark x 2 segments) rendered non-blank, no harness flake. Gemini returned 8 findings but 7 failed pixel-level verification via zoomed crops: no spinner/button overlap in the authorizing card, no bottom-clipping of 'Try again', the navi inline-code badge is legible and correctly themed in dark mode, status pills are consistently positioned/aligned (no overlap, no x-inset drift), status-line-variants panel padding is balanced, and the dark terminal panels in light mode are intentional terminal mockups (matching the daemon console), not hardcoded colors. Only the state-card height inconsistency survived. My own independent pass found no additional defects; template looks token-pure and well finished in both schemes.

## table-tree (2 confirmed)

- **LOW** [both] table Owner column avatars: Avatar initials fall below WCAG AA small-text contrast in both schemes (measured ~3.9:1 slate-on-gray in light, ~3.4:1 in dark at ~10px); mitigated by the full name rendered beside each avatar.
- **LOW** [both] card header actions (right of search box): "Expand all" and "Collapse all" are styled as plain body text with no button/link affordance, visually indistinguishable from static labels next to the filled Upload button.

> Pipeline notes: Capture succeeded first try (2 segments per scheme, no blank-panel flake). Gemini call succeeded but 6 of its 8 findings were dropped after pixel-level verification: row borders actually span full width, the Logos chevron state is correct (the two files are siblings under Brand assets, matching its \"3 items\" count), the root-level file aligns with folder icons, the Size header is right-aligned with its values, and two findings targeted the gallery page header (\"← TABLE\" eyebrow) which is chrome, not the template preview. The avatar-contrast finding was kept but corrected (text is slate, not white as gemini claimed) and confirmed by sampling pixels with Pillow. Template is otherwise clean and token-consistent across light/dark.

## kanban-board (2 confirmed)

- **LOW** [both] board scroll viewport / Done column (right edge of preview panel): Partially visible Done column is clipped dead-flush at the panel's right edge: card titles are sliced mid-glyph ('Depot check', 'CSV order in', 'Route summ') with zero right inset, while the left side of the board has ~18px padding; no scrollbar, fade, or other affordance indicates the column continues off-screen.
- **LOW** [dark] task card footer avatars: Avatar initials in dark mode are low contrast — light gray letters (e.g. 'PR', 'MW') on a medium gray circle read dim at 1x, noticeably weaker than the crisp slate-on-light-gray light-mode equivalent.

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded on first run (2 scroll segments per scheme, no blank-panel flake). Gemini call succeeded on first attempt and returned 6 findings, but 5 were rejected on visual verification against 4x crops: (1) 'In review column missing background' — background is present in both schemes; (2) 'sticky header clips panel corner radius' — no breakage visible; (4) 'Done column squished/narrower' — it is viewport clipping of a fixed-width column, not shrinking; (5) 'hardcoded light tag colors in dark mode' — tags render proper dark variants; (6) 'nearly illegible inactive filters' — Mine/High priority are legible in both schemes. Finding 3 (asymmetric padding) was kept only in reduced form as the right-edge clipping note. Added one defect gemini missed (dark avatar initial contrast).

## form-inline-edit (1 confirmed)

- **LOW** [both] Plan & identifiers section, Plan row action: The "Manage plan" action is styled as plain body text with no icon, accent color, or underline, while every other row action uses the icon+label "Edit" button treatment, so it reads as static text rather than a clickable action.

> Pipeline notes: Capture succeeded on first run (4 files, 2 segments per scheme, no blank-panel flake). First gemini call timed out at 180s (exit 124); retry after 20s succeeded. Gemini returned 8 findings but 7 failed visual verification against 1x and 4x crops: claims of a hardcoded light code-chip in dark mode, non-monospace Workspace ID, Plan-row baseline misalignment, badge text off-center, inconsistent section spacing, cramped badge spacing, and asymmetric bottom padding were all contradicted by the screenshots. Only the Manage-plan affordance inconsistency survived. Template otherwise looks clean and dark-mode token-pure. Screenshots: /tmp/astryx-uiux/shots/form-inline-edit.{light,dark}.{1of2,2of2}.png
