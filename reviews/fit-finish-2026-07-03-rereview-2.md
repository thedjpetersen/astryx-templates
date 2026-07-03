# Re-review pass 2 (2026-07-03) — 12 templates from fix batches 3-4

All prior high-severity defects verified fixed; zero highs remain. Residual medium/low polish below.
**Residual totals: 0 high / 12 medium / 24 low across 12 templates.**


## diff-viewer (3 confirmed residual)

- **MEDIUM** [both] diff panes - wrapped added lines (right pane, hunk 2, lines 51-53): Long code lines wrap with no hanging indent: continuation text ("jitter,", "8s.", "- 1);") starts at the far-left edge of the code column, to the left of the original code indentation, and line 53's continuation "- 1);" reads like a deletion marker inside a diff, which is confusing and looks broken.
- **LOW** [dark] file header - Viewed toggle: In dark mode the off-state "Viewed" toggle track and knob are nearly the same dark gray as the file header background; the knob is barely distinguishable from the track, so the control's state is hard to read (light mode has a clear gray track / white knob).
- **LOW** [both] diff panes - inline thread icon on line 54 (right pane): The inline comment-thread icon is glued directly to the trailing semicolon of `attempt);` with no left margin and sits slightly below the text baseline like a subscript, looking tacked-on rather than a deliberate anchor.

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded first try, all 4 captures (light/dark x 2 segments) rendered non-blank, no recapture needed. Gemini call succeeded but 7 of its 8 findings were refuted by pixel-level crop inspection (hallucinated contrast/alignment issues: Unresolved badge contrast, divider through hunk headers, gutter background asymmetry, Author badge theming, button padding, icon invisibility in dark, pill centering); only the icon-spacing finding survived. Two additional confirmed defects (wrap indent, dark Viewed toggle) were found during manual verification.

## notification-center (4 confirmed residual)

- **MEDIUM** [both] notification popover list items: Unread indicator dots are vertically centered on the whole multi-line item, so they land beside the wrapped body line ("review.", "invite.") instead of aligning with the title line; reads as misalignment on every unread item.
- **LOW** [both] navbar bell badge vs popover: Unread badge on the bell shows "3" but only 2 of the 4 fully visible popover items have unread dots — demo data inconsistency.
- **LOW** [both] notification popover, 4th item: Title truncates mid-word with ellipsis ("Retry with smaller batc…"), leaving an orphaned half-word at the popover edge.
- **LOW** [both] Tray states — Capped badge card: The "9+" pill badge barely overlaps the bell icon (only grazes its top-right tip), making it look detached/floating rather than anchored to the bell.

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded first try with non-blank previews in both schemes (2 scroll segments each, not 3); gemini call succeeded first try. 5 of gemini's 8 findings were rejected after crop-based verification: the dark-toast close X is visible (dark X on white inverted toast), "Acme workspace", popover timestamps, and "Mark read" are all legible muted-gray in dark mode, and the "3" badge digit is centered. The dark-mode toast uses an intentional inverted (white) style mirroring the light mode's black toast — not a hardcoded-color bug. Finding 2 (badge count vs dot count) is my own addition; the rest originate from gemini and were visually confirmed.

## story-progress-viewer (3 confirmed residual)

- **MEDIUM** [light] story card header (avatar chip next to 'Ari Okafor'): Avatar initials 'AO' are nearly invisible in light mode — dark text on the dark maroon avatar chip over the always-dark story gradient — while dark mode shows the same initials clearly in a light color; suggests the initials use a theme foreground token on a fixed dark background.
- **LOW** [both] playback controls / footer: The stories stage is taller than the viewport, pushing the primary playback controls, frame status line, and keyboard hints below the fold; user must scroll (losing the story header and segment bars) to reach them, which undercuts the immersive full-bleed stories pattern.
- **LOW** [both] template header pill vs footer status line: Global progress is shown twice with different formats: a '2 / 16' pill in the template header and '2 of 16 viewed' in the footer status line — redundant and slightly inconsistent phrasing.

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded first try with non-blank captures in both schemes (2 scroll segments each, not 3). Gemini responded on first call but hallucinated its three most severe findings — zoomed crops (/tmp/astryx-uiux/shots/crops/) disproved 'illegible light-mode keycaps', 'dark prev/next buttons in light mode', and '3 segments vs frame 2 of 4' (there are 4 segments). Its top 'clipping' finding was the sticky-toolbar scroll-segment artifact, dropped per instructions. The confirmed medium finding (light-mode avatar initials contrast) was found during manual verification, not by gemini.

## storefront-browse (4 confirmed residual)

- **MEDIUM** [both] filter rail — In stock only row: The 'In stock only' toggle sits at the far left while its label and 'Hide backordered items' helper text are right-aligned to the panel edge, leaving a large empty gap that detaches the label from its control; every other filter row (checkboxes, radios) is left-aligned, so this row looks broken.
- **MEDIUM** [both] filter rail — Price section: The horizontal section divider below the price slider sits flush against the '$0' and '$600' range labels (pixel-verified: divider at y=640 touches the bottom of the '$' glyph), reading as a stray underline; other section dividers have generous spacing on both sides.
- **LOW** [both] product grid header and footer: 'Showing 8 of 16 products' is duplicated: it appears top-left above the grid and again centered above the 'Load 8 more' button on the same page.
- **LOW** [both] filter rail — Rating facet: The '4.0 & up' option shows count 16, identical to 'Any rating' (16), making the facet look redundant/broken since selecting it would filter nothing (demo data plausibility issue).

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded first try, 4 non-blank captures (2 scroll segments per scheme, not 3), gemini returned 8 findings on the first call. 4 of gemini's 8 findings were disproved on pixel-level verification (divider truncation, dark-mode card flatness inconsistency, New-badge dark contrast, green rating-pill contrast) and 1 (strikethrough baseline) was not visible at 4x zoom; those were dropped. Finding about price-label spacing was corrected (collision is with the divider, not the Rating header). One finding gemini missed was added (rating facet count).

## video-call-layout (3 confirmed residual)

- **MEDIUM** [both] video grid, top-left Presenting tile name plate: Label truncates to "Priya Raman is presenti..." even though roughly 40px of free space remains between the pill and the tile edge, indicating an overly tight max-width; seen in all screenshots (e.g. light.1of2 and dark.1of2).
- **LOW** [light] chat panel footer, send button: Circular send button uses the same dark-gray fill in light mode as in dark mode (compare light.1of2 vs dark.1of2 input rows), reading as a hardcoded dark-theme color that looks muddy/disabled against the white light-mode chat panel.
- **LOW** [both] video grid, last row (Ana Duarte tile): The 10th participant tile sits alone, left-aligned on the fourth row leaving two-thirds of the row empty; a centered or redistributed last row would look more polished (all screenshots).

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded first try producing 2 segments per scheme (not 3); no blank-panel flake, all four captures rendered. Gemini returned 8 findings; 5 were dropped on zoom verification (misread mic/camera icon system, nonexistent missing mic on Riley Quinn tile, avatar misalignment not visible, control-bar padding claim contradicted by measurement, Grid toggle active state clearly distinguishable). Dark-mode theming of header/chat panel verified correct.

## schema-designer-erd (4 confirmed residual)

- **MEDIUM** [both] SQL DDL panel (right detail pane): Code lines are hard-clipped at the right edge mid-token (e.g. 'numeric(10,2) NOT NU', '-- WARNING: ... (int', 'orders_shipping_address_id_fke') with no wrapping, ellipsis, or visible horizontal scrollbar, making parts of the DDL unreadable.
- **LOW** [both] ERD canvas / detail-pane boundary: The FK arrow into orders.id is clipped at the canvas right edge where the detail panel overlays it, so the arrowhead appears from nowhere (its source table order_items is off-screen under the panel); a faint clipped arc also pokes out at the canvas left edge near the users card.
- **LOW** [both] Relationships list (right detail pane): The orders.shipping_address_id -> addresses.id entry wraps to two lines, pushing the red 'type mismatch' badge onto the second line and breaking the vertical rhythm of the otherwise single-line relationship rows.
- **LOW** [dark] Right detail pane secondary text: In dark mode the muted labels ('outgoing'/'incoming') and the footnote 'Click a relationship to jump to the other table.' render quite dim against the dark panel, giving borderline-low contrast (still legible).

> Pipeline notes: Capture succeeded on first attempt (2 scroll segments per scheme, all non-blank; no blank-preview flake). Gemini critique succeeded on first attempt and returned 8 findings; 4 were dropped after crop-level verification: canvas-grid 'void' (intentional canvas boundary/gutter with rounded corners), warning-strip padding imbalance (looked balanced in crop), table-card right padding 'almost zero' (measured ~12px, adequate), and SQL block top-padding (minor, within norms). Screenshots at /tmp/astryx-uiux/shots/, verification crops at /tmp/astryx-uiux/shots/crops/ (sqlblock.png, erd-arrow.png, darkrel.png, warnstrip.png, usercard.png, dark-boundary.png).

## memory-relation-explorer (2 confirmed residual)

- **MEDIUM** [both] Relations table (bottom of middle column): The Relation column truncates aggressively (e.g. 'Portland trip pl...', 'Sarah's birth...', 'Weekend hike i...') while the adjacent Type column has large unused whitespace between the type pill and the weight bar; column widths should be redistributed so relation names are readable.
- **LOW** [both] Panel header ('Memory' title): The metadata text '8 memories on file' is vertically center-aligned to the large 'Memory' heading instead of baseline-aligned, so the small text floats above the heading's baseline.

> Pipeline notes: Capture succeeded on first attempt; no blank-panel flake in any of the 4 screenshots (2 scroll segments per scheme, not 3). Gemini returned 8 findings but 6 were disproven under zoomed crop inspection (claimed dark-mode-colored entity pills and 'filters active' badge in light mode, selected-row padding shift, bullet/divider collision, zero section gap, and badge spacing were all incorrect). Only the Relations-column truncation and the heading baseline nitpick survived verification. No additional defects found beyond gemini's list.

## video-watch-page (3 confirmed residual)

- **MEDIUM** [both] Up next rail thumbnails: Watched-progress overlay at the bottom of thumbnails (red bar plus gray track, e.g. the 8:31 and 9:58 items) has square corners and is not clipped by the thumbnail's rounded corners, so it visibly bleeds past the rounded bottom-left and bottom-right edges.
- **MEDIUM** [both] Video description box: Metadata column wraps awkwardly: '41,208 views' breaks onto two lines and the date renders as 'Jun 12,' with a dangling '2026' on the next line, looking broken next to the single-line collapsed description.
- **LOW** [dark] Comments section (Maya Okafor comment): The 'by Fieldcraft Films' creator-heart badge in dark mode uses muted rose text on a dark maroon pill, giving noticeably lower contrast than its crisp light-mode counterpart (dark red on pink); legible but dim.

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded on first run with 4 non-blank captures (2 segments per scheme) in /tmp/astryx-uiux/shots; no blank-panel flake, no recapture needed. Gemini returned 8 findings; 5 were dropped after zoomed verification (claims of near-invisible light-mode description text, unreadable avatar initials, broken description layout, mis-styled Autoplay toggle, and jammed expand chevron did not match the pixels). No additional defects found beyond the 3 confirmed.

## kpi-dashboard (5 confirmed residual)

- **MEDIUM** [dark] KPI stat card sparklines: Sparkline stroke in the four KPI cards uses the same purple hex as light mode, rendering dim and low-contrast against the near-black card background; the whole chart palette (purple/blue/orange/green) is identical across schemes, suggesting hardcoded chart colors instead of theme tokens.
- **LOW** [both] Top endpoints table card: Last table row (GET /api/v2/exports) sits nearly flush against the card's bottom border (~4-6px gap), inconsistent with the generous padding above the 'Top endpoints' title and on the sides.
- **LOW** [both] Traffic vs Signups charts: Y-axis label alignment is inconsistent between the two charts: Traffic labels (250k/200k...) sit with their baseline on top of the gridlines while Signups labels (600/400/200/0) are vertically centered on the gridlines, indicating two different chart configurations side by side.
- **LOW** [both] Signups by channel bar chart: Bars have rounded corners on the bottom as well as the top, so they do not sit flat on the 0 baseline (clearly visible on the shorter Partner/Other bars).
- **LOW** [dark] Muted secondary text (chart axes, neutral KPI delta): Dark-mode muted text — chart axis/category labels and the neutral '0.0% vs. previous 30 days' delta on the Active users card — is dim gray near the contrast floor; legible on close inspection but noticeably weaker than the equivalent light-mode gray.

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded on first run (2 scroll segments per scheme, none blank), gemini responded on first call. Three gemini findings were rejected on zoom verification: status pills are correctly theme-aware in dark mode (dark-tinted backgrounds, not pale light-mode colors), the time-range toggle and refresh icon have adequate dark-mode contrast, and the KPI sparklines are not clipped (visible padding below the stroke). The orange errors line overlapping the 0k baseline is data-driven (near-zero series), not a defect. One finding gemini missed was added (rounded bar bottoms). Verification crops saved under /tmp/astryx-uiux/shots/crops/.

## deployment-detail (3 confirmed residual)

- **MEDIUM** [both] build logs terminal, warn entry detail lines: The multi-line warning detail text ('./app/logs/page.tsx' and '42:9 Warning: "range" is assigned...') is rendered in a very dim gray on the dark navy terminal background, making the actual warning body — arguably the most important content of the row — noticeably harder to read than ordinary info lines. Visible in light.2of2 and dark.2of2 (the terminal is dark-themed in both schemes).
- **LOW** [both] metadata grid (Branch/Commit/Duration/Created/Domains/Framework card): In every row of the metadata grid, the value text baseline sits ~2-3px higher than its row label (e.g. 'main' rides visibly above 'Branch', '9f3c2ab — fix(logs)...' above 'Commit'), so label and value never share a baseline. Consistent across all six rows in both light.1of2 and dark.1of2.
- **LOW** [both] build logs terminal, warn entry detail lines: The eslint rule identifier '@typescript-eslint/no-unused-vars' wraps mid-token at the hyphen, splitting into '@typescript-' and 'eslint/no-unused-vars' on separate lines; a code identifier should not break across lines. Visible in light.2of2 and dark.2of2.

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded on first run with 2 scroll segments per scheme (not 3), and all four captures rendered non-blank — no recapture needed. Gemini returned 7 findings but zoomed verification falsified most: (1) 'build' in the warn row aligns exactly with the stage column of other rows; (2) wrapped warn lines keep message-column indentation; (3) the dark-mode card container is present with visible border/radius, not missing; (4) card bottom padding (~20px) is consistent with side padding; (5) dark-mode metadata labels are legible; (6) warn row vertical padding is balanced (~28px top and bottom); (7) the '← TOOLS' breadcrumb is gallery chrome, out of scope. Only the dim warn detail lines survived (kept, reframed as a contrast issue affecting both schemes); the baseline misalignment and mid-token wrap findings are mine from direct screenshot inspection.

## step-sequencer-groovebox (2 confirmed residual)

- **LOW** [light] pattern chain slots (bottom of preview): In light mode, the gold/amber 'C' letter in pattern-chain slot 4 sits on a light gray slot background with noticeably lower contrast than the near-black 'A'/'B' letters in the other slots; it reads as faded rather than accent-colored. Dark mode renders it fine.
- **LOW** [light] sequencer grid mute/solo column: The M and S button glyphs are muted slate-gray on light gray circles in light mode — legible but soft, likely below AA contrast at that small size; dark mode uses white-on-dark-gray with clearly better contrast.

> Pipeline notes: Capture succeeded first try; all 4 screenshots (light/dark x 2 segments) rendered with no blank-panel flake. Gemini returned 8 findings but 6 were hallucinated or not visible under pixel-level zoom (claimed invisible white text in light mode, invisible dark-mode slider fill, grid padding asymmetry, step-number misalignment, and two optical-centering nitpicks); only the slot-C gold contrast survived, plus a corrected mild version of the M/S contrast claim. Template is otherwise clean in both schemes — dark mode appears fully tokenized.

## status-feedback-gallery (0 confirmed residual)


> Pipeline notes: Capture succeeded on first attempt with non-blank previews in both schemes (6 files in /tmp/astryx-uiux/shots). The gemini call succeeded but produced 8 findings that were ALL hallucinations: it claimed dark-mode alert banners kept light pastel backgrounds, progress fills were invisible black, primary buttons were camouflaged, filter pills/stepper kept light-mode colors, cramped CTA padding, stepper footer misalignment, and off-center tag-pill text. I verified each against the PNGs, including 4x zoomed crops of the exact regions (dark slider/bars, tag pill, stepper footer, CTA button, dark filter pills) — every element is correctly token-adapted in dark mode (light fills on dark tracks, inverted light primary buttons, dark navy pills with light blue text) and properly aligned/padded. Gemini appears to have misread which screenshots were dark or invented the light-mode carryover. No defects of my own found; zero confirmed findings.
