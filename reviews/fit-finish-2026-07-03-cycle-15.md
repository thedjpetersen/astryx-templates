# Fit-and-finish review — cycle 15 (2026-07-03)

Pipeline: vite demo server → Playwright headless Chromium (1440x900, light+dark, scrolling segments of `.preview-wrap`) → Gemini designer critique → Claude agent pixel-crop verification. Findings marked unconfirmed did not survive visual verification but were kept as possible nitpicks.
**Totals: 7 high / 7 medium / 18 low confirmed across 12 templates.**


Note: table-index-detail and table-chart exhibit the collapsed-table-column defect fixed in batch 1 (design-system max-width:0 clamp under table-layout:auto) — same min-width-floor fix applies.

## notification-center (5 confirmed)

- **HIGH** [both] mock app navbar (bell icon, top right of preview): Unread badge '3' is mis-anchored: it floats to the right of the bell icon instead of sitting on its top-right corner, and clips into the adjacent DW avatar.
- **HIGH** [both] Tray states section, 'Capped badge' card: The '9+' badge almost entirely covers the bell icon it should be anchored to; only tiny slivers of the bell are visible beneath the pill, so the demo of the capped badge looks broken (same badge-anchoring bug as the navbar).
- **LOW** [both] pinned notification popover (list items): Unread indicator dots are vertically centered on the whole 3-line item, so they land beside the second line of body text rather than aligning with the notification title, reading as misaligned.
- **LOW** [dark] pinned notification popover (container, dark mode): In dark mode the popover has no visible border and only a faint shadow; its surface nearly matches the mock navbar/page behind it, so the elevated panel edge almost disappears.
- **LOW** [both] pinned notification popover (item separators): Item divider lines are asymmetric: inset on the left to align with the text block but running flush to the popover's right edge with zero right margin.

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded first try with 2 scroll segments per scheme; no blank preview panels, so no recapture needed. Gemini responded on the first call with 8 findings; 4 were dropped after crop-level verification (tray-card header padding, dark-mode loading-text contrast, toast close-button padding, popover bottom padding — none visible in zoomed crops). Verified the corner toast correctly inverts between schemes (no hardcoded color). Added one finding gemini missed: the '9+' pill occluding the bell in the Capped badge card.

## table-index-detail (4 confirmed)

- **HIGH** [both] master job table: Trailing table columns (customer/status/scheduled/quoted) are crushed to ~1 character wide, so dates and currency values wrap vertically one character per line (e.g. 'J u l 2 , 2 0 2 6 ...' and '$ 1 , 4 8 0'), inflating every row to ~350px tall; the table looks completely broken. Likely the master list keeps its full column set instead of collapsing to a compact layout while the detail pane is open. Visible in all six screenshots.
- **HIGH** [both] master job table header: Column headers are truncated to single illegible letters ('C S T S Q') clustered at the right edge of the table (same column-width collapse as the row content). Visible in light/dark 1of3.
- **MEDIUM** [both] detail pane: Detail pane does not stay pinned while the master list scrolls: in scroll segments 2of3 and 3of3 the entire right half of the preview is dead empty space because the detail content scrolled out of view.
- **MEDIUM** [both] master job table rows: Status indicator dots float detached in empty space at the far right of the Job column, vertically centered in the inflated rows, not aligned to any text or column. Visible in all segments; largely a consequence of the column-collapse bug.

> Pipeline notes: Capture pipeline healthy: single shoot.mjs run produced non-blank previews in both schemes (no blank-panel flake, no recapture needed). Gemini critique succeeded on first attempt with 8 findings; 4 were dropped after visual verification — one was a root-cause restatement of the column-collapse bug (merged), and three (header/detail vertical alignment, faint pane divider, 'too subtle' selected-row highlight) were not supported by the screenshots (the selected row fill is clearly visible in both schemes). Screenshots at /tmp/astryx-uiux/shots/table-index-detail.{light,dark}.{1,2,3}of3.png.

## diff-viewer (3 confirmed)

- **HIGH** [both] detail pane - diff table, right (new-file) column line-number gutter: Right-pane line numbers are computed incorrectly: after added lines 15-17 the unchanged 'export interface RetryDecision {' rows show 16/17 instead of 18/19 (hunk header says +12,8); in the second hunk the right column reads 46-48 for unchanged lines that should be 48-50, and the sequence visibly runs 55 -> 51, 52, 53, 54, 55 after the inline thread, going backwards within one column.
- **MEDIUM** [both] detail pane - diff table, right code column: Long code lines in the right pane (lines 51-54: '// Exponential backoff with deterministic jitter', 'const backoff = BASE_DELAY_MS * 2 ** (attempt -', 'jitterSeed(ctx.re', 'Math.min(backoff + jitter, MAX_D') are hard-clipped mid-word at the panel edge with no right padding, no ellipsis, and no horizontal scrollbar.
- **LOW** [both] detail pane - diff table code cells: All code renders as monochrome plain text with no syntax highlighting for keywords/strings/comments, reducing scannability versus the polished look of the rest of the component (a fit-and-finish nit, may be intentional).

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded first try producing 2 segments per scheme (not 3), all four captures rendered non-blank in both schemes, gemini responded on first call. However, gemini hallucinated heavily: 4 of its 8 findings (black-on-dark unreadable text in dark mode, inverted dark comment thread in light mode, widespread dark-mode meta-text contrast failure, inconsistent disabled Reply button) were contradicted by direct inspection and corner crops, and 1 (border-radius bleed at bottom-left gutter corner) could not be observed and was dropped. Only 3 findings survived verification; the line-numbering defect is a template logic bug visible in the rendered UI.

## table-chart (4 confirmed)

- **HIGH** [both] Product sales table - numeric columns: All numeric columns (Revenue, Units, Return rate, Trend) are crushed to ~1 character wide; every value wraps vertically digit-by-digit (e.g. '$14,931' renders as a vertical stack of single characters), rows balloon to ~3x normal height, and the Product column occupies ~75% of the card as empty space. Table is unreadable.
- **HIGH** [both] Product sales table - header row: Right-aligned numeric column headers are truncated to single letters, rendering as 'C R U R Tre' with the last header clipped mid-word at the card edge.
- **MEDIUM** [both] Product sales table - trend/delta cells: Trend delta pills (green '+' / red '-' badges) and sparkline ovals overflow and are clipped by the card's right edge in every row; the badges are cut roughly in half.
- **LOW** [both] Weekly revenue chart - bars: Chart bar blue is pixel-identical between light and dark schemes, suggesting a hardcoded color rather than a theme token (mildly heavy against the dark background).
- unconfirmed/low [dark] Product sales card - helper text: Gemini flagged 'Select a row to compare it against the store total' as excessively low-contrast in dark mode; in the capture it is faint but comparable to other secondary text, so not visually confirmed as a defect.

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded on first run, all 6 captures (3 light + 3 dark segments) rendered non-blank, gemini critique returned on first attempt. Dropped 3 gemini findings on verification: x-axis label misalignment (labels are correctly centered under alternating bars, standard tick thinning), dark-mode table-header contrast, and bottom-padding imbalance (neither visible as a real defect). The dominant issue is a single layout bug — numeric columns collapsing/overflowing the card — which produces findings 1-3.

## dashboard-filterable (4 confirmed)

- **MEDIUM** [both] KPI stat card row: Stat cards are fixed-width and do not stretch or grid evenly: three cards sit on row 1 with a ragged empty gap at the right, and the fourth card (Active accounts) wraps alone onto row 2 leaving ~55% of that row blank, making the KPI section look unbalanced and unfinished.
- **LOW** [both] Monthly revenue bar chart: Only the topmost $1500k gridline is rendered; the $1000k, $500k, and $0k tick labels have no gridlines and there is no baseline axis, so the labels float and the bars end in empty space.
- **LOW** [both] Monthly revenue bar chart y-axis: Y-axis tick formatting is awkward: "$1500k"/"$1000k" instead of "$1.5M" or plain "1,500", and the $-plus-k notation is redundant with the subtitle's "($ thousands)" unit note.
- **LOW** [both] Top accounts table: Numeric columns (Revenue, Orders) are left-aligned rather than right-aligned, which weakens vertical scanning of values; alignment is internally consistent with the headers, so this is a convention nitpick rather than a misalignment.

> Pipeline notes: Pipeline healthy. shoot.mjs produced 2 segments per scheme (not 3) on first run with no blank preview panels, so no recapture was needed. Gemini call succeeded on first attempt and returned 8 findings; 5 were dropped after pixel-level verification against crops (card collision, dark-mode helper-text contrast, title/subtitle crowding, table header padding, and dark badge contrast were not visible or factually wrong), 1 was reframed (bars do not clip below an axis line — there is no baseline/gridlines at all below $1500k), and 1 finding (y-axis label formatting) was added during manual review. Screenshots: /tmp/astryx-uiux/shots/dashboard-filterable.{light,dark}.{1,2}of2.png; verification crops in /tmp/astryx-uiux/crops/.

## ai-chat-artifact (3 confirmed)

- **MEDIUM** [both] artifact code pane: Long SQL lines are clipped at the right edge of the code container with no wrapping, horizontal scrollbar, or right padding — line 17 is cut mid-identifier ('... AS weight' where the alias is 'weighted_events'), and line 2's comment runs flush against the border. Content is visually lost in both schemes (1of3 segments).
- **LOW** [both] artifact header: The 'Open in editor' button sits alone on a second row below the filename, disconnected from the version dropdown / Copy cluster on the right, leaving a large empty gap across the rest of its row; reads as orphaned rather than integrated into the header actions (1of3 segments).
- **LOW** [both] artifact code pane: Bottom inner padding of the code block is tighter than the top: line 49 ('ORDER BY churn_risk DESC;') sits ~10px above the container's bottom border while the top of the block has noticeably more breathing room (3of3 segments).

> Pipeline notes: Capture succeeded on first attempt; both schemes rendered non-blank across all 6 segments. Gemini call succeeded but 5 of its 8 findings were rejected on verification: findings 1-4 claimed hardcoded white text on light backgrounds in light mode (code keywords, user chat bubbles, header controls, badges) — zoomed crops show dark, fully legible text everywhere, so these were hallucinations; finding 8 (SQL badge text vertically off-center) was not visible at 2x zoom in either scheme. Dark mode was swept independently for hardcoded colors and looks clean.

## table-bulk-actions (4 confirmed)

- **MEDIUM** [both] table selection column: Multi-select controls are perfect circles that read as radio buttons rather than checkboxes, contradicting the template's own description ('Checkbox selection with a sticky action bar') and standard multi-select convention; affects header select-all and every row.
- **LOW** [both] Assignee column: 'Unassigned' text is left-aligned to the avatar edge (x of the avatar circle) instead of aligning with the assignee name text in adjacent rows, breaking the column's vertical scan line; a placeholder avatar or matching indent would fix it (rows 1, 4, 7).
- **LOW** [both] card footer / below last row: Roughly 90px of empty dead space inside the card below the last table row in the idle (nothing selected) state, visible in the full-card 2of2 captures; presumably reserved for the sticky bulk-action bar but reads as an unpolished blank band when no selection is active.
- **LOW** [both] Status column badges: The neutral 'Open' badge uses full-inversion styling (solid black pill in light, solid white pill in dark), making the default state the highest-contrast element in the table and visually heavier than the semantic Pending (yellow) and Resolved (green) badges.
- unconfirmed/low [dark] row secondary text (ticket IDs, company names, 'Unassigned', '10 tickets' count): Muted secondary text in dark mode is on the dim side (mid-gray on near-black); readable at zoom and appears near the ~4.5:1 boundary rather than clearly failing, so flagged as a borderline nitpick only.

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded on the first run with 4 non-blank captures (light/dark x 2 scroll segments) and gemini returned a full critique on the first call. Three of gemini's seven findings were refuted by zoomed crop inspection and dropped: (a) 'Last update' header/data misalignment — both are left-aligned at the same x; (b) invisible Active/Archived toggle track in dark mode — the gray track and bordered Active pill are clearly visible; (c) invisible 'Normal' priority dot — it is a clearly visible medium gray in both schemes. The sticky bulk-action bar itself was never captured (no rows selected in the screenshots), so it could not be evaluated. Screenshots: /tmp/astryx-uiux/shots/table-bulk-actions.{light,dark}.{1of2,2of2}.png; verification crops in /tmp/astryx-uiux/tba/.

## form-wizard (1 confirmed)

- **LOW** [dark] wizard footer button row (Back button): Disabled Back button text in dark mode is dark gray on a dark gray pill and is barely legible; the light-mode disabled state is faint too but readable. Intentional disabled styling, yet the dark variant is at the edge of illegibility.

> Pipeline notes: Capture succeeded first try; shoot.mjs produced 2 scroll segments per scheme (not 3) and segments 1of2/2of2 are near-duplicates (~19px scroll) since the template fits one viewport. No blank-preview flake occurred. Gemini returned 8 findings but 7 were disproven by 3x zoomed crop verification (claimed input text/chevron misalignment, Cancel misalignment, label/helper collision, and cramped bottom padding are not present; card elevation and muted "Step 1 of 4" text are intentional design-token behavior). Only the dark-mode disabled Back button legibility survived, downgraded to low because it is a disabled state. Template is otherwise clean in both schemes.

## incident-console (2 confirmed)

- **LOW** [both] incident list search input: Asymmetric horizontal padding inside the search input: the left inset before the 'Search incidents...' placeholder is roughly 18px while the '7 results' suffix sits only ~8px from the right border, making the right side look cramped.
- **LOW** [both] template panel body (below list and inspector): Content does not fill the preview card: the incident list ends ~y697 and the inspector timeline ~y730 while the card extends to ~y890, leaving a large empty band at the bottom that makes the console layout look unfinished; a console-style template would normally stretch columns to full height.

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded first try with 4 non-blank captures (2 segments per scheme); gemini responded on first call. Gemini returned 8 findings but 7 were dropped on verification: the 'Declare incident' button is correctly right-anchored; dark-mode secondary text measured 7.44:1 contrast via pixel sampling and the template source (templates/incident-console.tsx) contains no hardcoded colors (token-pure per the cycle-4 dark-mode sweep); the selected-row badge, severity dots, Impact wrap, inspector dot alignment, and selection-edge claims were all contradicted by zoomed crops. Only the search-input padding asymmetry survived, plus one self-found low-severity layout observation.

## shell-breadcrumb (1 confirmed)

- **LOW** [both] team header meta row (below the Camera Firmware description): Inconsistent separators in the meta text: 'Lead · Kenji Morita' uses a middot, but between 'Kenji Morita' and 'Portland, OR' there is only a small gap, so the string reads as 'Kenji Morita Portland, OR' run together. Needs a matching middot or a clearer structural gap.

> Pipeline notes: Pipeline healthy. shoot.mjs succeeded on first run; all 4 captures (light/dark x 2 segments) rendered non-blank, no recapture needed. Gemini call succeeded and returned 8 findings, but 7 were rejected on verification: two claimed misalignments (avatars hanging into gutter, truncated row dividers) were disproven with 8x zoom crops showing correct grid alignment and matching divider extents; two contrast claims were disproven by pixel measurement (green '1 open role' pill = 4.71:1 white-on-green, passes AA; light-mode back link = 18.8:1); the remaining icon/button/baseline alignment claims were not visible in zoomed crops. Extra measurements: light/dark muted text 6.41:1 / 7.28:1 (pass); dark avatar initials 4.39:1, marginally under AA 4.5 but visually legible and typical for decorative avatar fallbacks, so not reported as a defect.

## timeline (1 confirmed)

- **LOW** [both] event rows and detail-card metadata: Mixed time formats: event timestamps use 12-hour format (9:42 AM, 12:14 PM) while detail-card metadata uses 24-hour format (Fired 16:42, Fired 19:14 - resolved 19:26); the alert row stamped 9:42 AM even says it fired at 16:42, contradicting its own timestamp.

> Pipeline notes: Capture pipeline healthy: shoot.mjs succeeded first try, all four screenshots (light/dark x 2 segments) rendered non-blank. Gemini call succeeded and returned 6 findings, but all 6 were rejected on zoom verification with cropped/upscaled regions: (1) dark-mode comment text is light-on-dark and readable, not hardcoded dark; (2) the rail gap at date headers is clean intentional per-day-group segmentation; (3) no dangling rail below the last node; (4) no dangling rail above the first node; (5) inner card padding is balanced; (6) dark sev-3 pill is legible amber-on-brown (~4:1+). The single reported finding is one I added myself. Screenshots at /tmp/astryx-uiux/shots/, verification crops at /tmp/astryx-uiux/crops/.

## form-modal (0 confirmed)


> Pipeline notes: Capture succeeded on first attempt (4 shots: light/dark x 2 segments, no blank-panel flake). Gemini critique returned 8 findings, but all 8 failed visual verification against zoomed crops (segmented-control text is legible, dark footer key text is readable muted gray, disabled Create button is consistent across schemes, footer divider exists in light mode, placeholder/value and label/subtext hierarchies are correct, input borders visible, close button centered). Independent review of all four screenshots found no additional defects, so the findings list is empty. Screenshots at /tmp/astryx-uiux/shots/form-modal.*.png, verification crops in /tmp/astryx-uiux/crops/.
