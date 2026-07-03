# Fit-and-finish review — cycle 12 (2026-07-03)

Pipeline: vite demo server → Playwright headless Chromium (1440x900, light+dark, scrolling segments of `.preview-wrap`) → Gemini designer critique → Claude agent pixel-crop verification. Findings marked unconfirmed did not survive visual verification but were kept as possible nitpicks.
**Totals: 0 high / 11 medium / 16 low confirmed across 12 templates.**


Pipeline health: zero blank-capture flakes this cycle (raised pixel-probe threshold + explicit agent recapture policy).

## podcast-episode-player (3 confirmed)

- **MEDIUM** [both] header pill / transcript cue / docked player bar: Contradictory playback state in the demo data: breadcrumb header shows a 'Paused' pill and the docked player shows a play (not pause) button, but the active transcript cue (Maya Chen 16:35) carries a blue 'Playing' badge at the same time.
- **MEDIUM** [both] chapters/show-notes rail (right column): The Chapters/Show notes rail is not sticky, so once the user scrolls past segment 1 the entire right third of the template is an empty blank column while the transcript stays at fixed width (visible in 2of3 and 3of3 of both schemes).
- **LOW** [dark] docked player bar, playback-speed segmented control: In dark mode the unselected speed options (1x, 1.5x, 2x) are mid-grey text on a mid-grey pill background, noticeably lower contrast than their light-mode counterparts; still legible but under-contrasted for small text.

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded on the first run, all six captures (light/dark x 3 segments) rendered non-blank, and the gemini call succeeded on the first attempt. Gemini returned 8 findings; 5 were dropped after zoomed-crop verification (chapter progress track exists, breadcrumb is vertically centered, Auto-scroll label has a normal gap, Signal Path icon is aligned, Now badge is flush with the checkmark column, and the active-message avatar tint is intentional active styling). The Playing-vs-Paused state contradiction was found during my own verification pass, not by gemini.

## streaming-browse-home (3 confirmed)

- **MEDIUM** [both] carousel next-arrow buttons (Continue Watching, Trending Now, New Releases, Because you watched rows): Circular next-arrow buttons are positioned half outside the template's right edge with no overflow clipping: they render on the light gallery background beyond the panel border, and in scroll segment 3 one arrow floats on top of the gallery toolbar next to the Dark toggle. In a real app this would cause horizontal overflow or clipped controls.
- **LOW** [both] hero billboard CTA row: The add-to-list '+' next to the Play and More info pill buttons is a bare glyph with no circular border or background, so it reads as an unstyled floating character rather than a button, inconsistent with the adjacent pill treatments.
- **LOW** [both] Continue Watching card progress bars: The unfilled portion of the progress track is nearly indistinguishable from the card background, so short fills (e.g. 'The Pastry Court', 39 min left) look like a floating red chip with no track to gauge progress against.

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded first try, all 6 captures non-blank in both schemes, gemini responded on first call. Template is intentionally dark-themed and renders identically in light and dark app schemes (token-pure, no hardcoded-color divergence). Gemini returned 8 findings; 5 were dropped as false after pixel-level verification (match text is #4ade80 at ~11:1 contrast, badges are inset ~12px, rank numbers respect the content margin, ellipsis menus have ~15px padding, nav icon spacing is even) and 1 (empty Pastry Court progress) was corrected to the near-invisible-track finding. The arrow-overflow finding was reframed: arrows are not clipped, they escape the template bounds. Screenshots at /tmp/astryx-uiux/shots/, verification crops at /tmp/astryx-uiux/crops/.

## feature-gate-console (3 confirmed)

- **MEDIUM** [both] All gates table — Sentry query column: Query strings (e.g. tags[gate]:fix_tool_r) are hard-clipped mid-glyph with no ellipsis or fade, and the clipped text ends with essentially zero gap before the toggle switch, on every row. Visible in light/dark 2of3 and 3of3.
- **LOW** [both] All gates table — Health column, fix_scroll_anchor row: Pluralization bug: shows "1 events / 24h" instead of "1 event / 24h" (other rows correctly use counts >1). Visible in light/dark 3of3.
- **LOW** [dark] Gate State KPI card: In dark mode the unfilled portion of the 11/14 progress bar track is barely distinguishable from the card background, whereas light mode shows a clear gray track; the bar's total capacity is hard to read. Visible in dark 1of3.
- unconfirmed/low [both] Gate telemetry bar chart: The tallest bars appear to touch the top of the chart area with zero vertical headroom (flat tops at the visible top edge in light/dark 2of3); could not be fully verified because the chart spans a scroll-segment boundary, so the flat tops may be viewport clipping.

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded first try, all 6 captures non-blank in both schemes (no harness flake), single gemini call returned 8 findings. 4 gemini findings were rejected on crop verification: the \"stray artifact\" under admin_update is the row's intentional tiny progress bar; the dark-mode Saving... pill uses dark (not white) text on yellow and is readable; dark-mode Disabled pills are legible (light-gray on mid-gray); the dark warning banner title/subtext are readable on the olive background. Gemini's claim that active rows truncate with ellipsis was also wrong — no row uses an ellipsis, which is part of the confirmed query-column finding. The pluralization finding was added by manual review. Crops saved under /tmp/astryx-uiux/shots/crops/ (byevent.*, saving.*, query.*, disabled.dark, banner.dark, chart.light, gatestate.dark).

## transcript-annotator (4 confirmed)

- **MEDIUM** [both] labeling panel - Failure categories list: The last visible row ('Unsafe Command') is clipped in half by the bottom edge of the card: checkbox circle and text are cut off against the rounded border with no scroll fade or affordance, so the list looks broken rather than scrollable (visible in both 2of2 screenshots, and at panel bottom in 1of2).
- **MEDIUM** [both] labeling panel - Labeling guide section: The 'Failure' guide description is truncated mid-word with an ellipsis ('Pick every category that applies; note the first ba…') and there is no way to read the rest; the sibling 'Golden' and 'Neutral' descriptions fit fine, making the truncation look like a layout bug (both 2of2 screenshots).
- **LOW** [both] transcript header - session metadata columns: In the User/Surface/Model/Messages stat row, the long value 'claude-sonnet-4-5' extends to within roughly two characters of the '42' under Messages, leaving almost no column gap and making the two values read as one string (both 1of2 screenshots).
- **LOW** [both] labeling panel - Failure categories selected rows: The highlight pill behind selected rows (e.g. 'Tool Error (Unrecovered)', 'Premature Termination') has very tight left padding — the checkbox circle nearly touches the pill's left edge while the right side has generous space, so the highlight looks off-balance (both schemes).

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded first try with 4 non-blank captures (2 scroll segments per scheme, not 3), and gemini responded on the first call. Gemini produced 8 findings; 5 were dropped after crop-level verification because they were not visible in the screenshots: dark-mode contrast claims on the Failure button, footer 'Tagged by' text, and attachment pill (all render legible light-on-dark text), a claimed flush-bottom JSON code block (padding is present), and a claimed misaligned green status dot (it is centered with the session-id pill). The clipped 'Unsafe Command' row is a finding I added myself and confirmed in both schemes.

## fleet-node-status (3 confirmed)

- **MEDIUM** [both] filter band (platform chips + version distribution row): Version-distribution filters are interactive ToggleButtons but render as bare monospace text with no pill/border/background, directly beside pill-shaped platform Token chips (e.g. 'Mac · 8'); they read as static text rather than clickable filters, and the mono type is visibly larger than the adjacent sans chip/label text, making the row look unfinished and creating the impression of a broken layout gap.
- **LOW** [both] status markers (filter counts vs legend vs density grid): Same three statuses use three marker treatments: filter counts next to 'All 48' use 8px circular dots, the legend uses 10px rounded squares, and the grid uses 12px rounded squares — inconsistent shape language for identical semantics (countDot borderRadius 50% vs legendSwatch/square borderRadius 3 in source).
- **LOW** [both] density grid hover tooltip: The instance-detail tooltip for the first grid square opens upward and fully covers the 'Platform' label, the first platform chip, and the first legend entry, and extends roughly 50px past the left edge of the template preview panel over the gallery sidebar — no collision/containment padding against the panel boundary.

> Pipeline notes: Capture succeeded first try; both schemes rendered non-blank (no blank-panel flake). A hover tooltip (devvm2183.prn0) from the capture harness is open in all four screenshots, occluding the 'Platform' label and first chip — this occlusion caused gemini to hallucinate a 'missing chip label' finding. Gemini ran successfully but 5 of its 8 findings were rejected on pixel verification: light-mode chip text is dark and legible (not hardcoded light), the Grid/Table/Users segmented control has a clear active pill in both schemes, grid-panel padding is ~16px (not cramped), and '48 of 48 shown' is vertically centered with the search row. The large empty area below the grid is the gallery preview frame's min-height, not template whitespace, so it was not reported. Tooltip does correctly restyle for dark mode.

## scheduled-send-outbox (2 confirmed)

- **MEDIUM** [dark] detail rows - countdown pills (right column): Same-day countdown pills ("in 3h 15m", "in 3h 45m", "in 5h 30m") in dark mode use muted steel-blue text on a dark navy pill, noticeably dimmer than the bright near-white text on the gray "in 1d"/"in 4d"/"in 6d" pills in the same column and than the light-mode equivalents; legible but low-contrast and inconsistent within the scheme.
- **LOW** [both] "Sending in 30s" banner - Undo action: The Undo button is top-aligned with the banner's title line rather than vertically centered in the banner, sitting roughly 7px above the banner's vertical center while the two-line text block is centered; leaves an empty band under the button on the right side.

> Pipeline notes: Capture succeeded on first run (4 files, 2 segments per scheme, no blank-panel flake). First gemini call timed out at 180s; retry after 20s wait succeeded. Gemini returned 8 findings; 6 were refuted on pixel-level verification with 4x crops (bottom padding present, no snippet overflow, symmetric body insets, banner text properly centered, dark toggle active state clearly distinguishable, avatars correctly themed per scheme, no visible Undo icon misalignment). Finding 1 kept with severity downgraded from gemini's \"severe contrast failure\" to medium; the Undo vertical-centering issue was discovered during verification of gemini's (refuted) banner-centering claim.

## composer-state-gallery (2 confirmed)

- **MEDIUM** [both] specimens 02 (slash-command) and 03 (mentions): The 'People matching @' popover from specimen 03 overlays specimen 02's composer, completely hiding the '/research' chip and locked input that specimen 02's caption describes, and it also covers most of specimen 03's own caption text ('03 · me…' is truncated behind the popover). For a frozen-states reference sheet, two of six specimens are partially unreadable.
- **LOW** [both] specimen 06 (force-stop) inline AlertDialog: The 'Force stop sandboxes?' dialog renders left-anchored below the composer, roughly 500px away from the right-aligned Force stop button that triggers it, with no visual connection (arrow/alignment) to the trigger; it looks detached rather than anchored.

> Pipeline notes: Captures were clean on the first shoot.mjs run — no blank-panel flake in either scheme, no recapture needed. Gemini responded but all 8 of its findings were refuted on verification against zoomed crops (it hallucinated theme inversions: claimed the light-mode warning banner had white-on-yellow text, that the light-mode dialog and mentions popover were hardcoded dark, that the drop-zone dashed border cut through the trace.json chip, and several dark-mode contrast failures that are actually readable muted-gray text). None passed; both reported findings are my own from direct screenshot inspection. Screenshots: /tmp/astryx-uiux/shots/composer-state-gallery.{light,dark}.{1,2,3}of3.png; verification crops in /tmp/astryx-uiux/shots/crops/csg-*.png.

## skill-package-detail (2 confirmed)

- **MEDIUM** [both] header (Enabled toggle, top right of preview panel): Helper text 'Loads in new sessions' is squeezed into a very narrow column beside the toggle and wraps awkwardly onto three lines ('Loads in' / 'new' / 'sessions'), looking cramped and unpolished in both color schemes.
- **LOW** [dark] header metadata row (author avatar): In dark mode the 'JD' avatar initials are light gray on a medium-dark gray circle; readable but noticeably lower contrast than the adjacent 'Jane Doe' text.

> Pipeline notes: Capture succeeded on first attempt; 2 scroll segments per scheme (not 3), both schemes rendered non-blank. Gemini critique ran successfully and returned 8 findings, but 6 were hallucinations or overstatements rejected during pixel-level verification (crops read directly): no dark code block in light mode, v3/count badges legible, chevron correctly centered, code-block corners rounded, dark line numbers and eye-slash icon adequately visible. Only the toggle helper-text wrap survived at medium; avatar contrast downgraded to low.

## live-stream-viewer (2 confirmed)

- **MEDIUM** [both] stream info action row (below video player): "Gift a sub" secondary button has very low contrast: dim gray text on a dark gray pill that barely separates from the card background in dark mode, and faint gray text on a near-white pill in light mode; it reads as disabled/near-invisible next to the high-contrast Follow button.
- **LOW** [both] chat rail footer (send-message input): Circular send button uses the same mid-gray fill in both color schemes and does not invert with the theme the way the adjacent Follow primary button does, suggesting a hardcoded color; still legible in both modes so impact is minor.

> Pipeline notes: Capture pipeline healthy: shoot.mjs produced 2 segments per scheme (not 3) on both runs. The dark 1of2 capture initially looked light-themed at thumbnail scale, so I recaptured to /tmp/astryx-uiux/shots-retry-live-stream-viewer and verified via full-resolution pixel crops that the preview panel is in fact properly dark-themed in both runs — no blank-panel flake occurred. Gemini returned 8 findings; 6 were dropped after visual verification (claims of illegible avatar initials, unreadable dark chat pills, and four misalignment/padding issues were not visible in full-resolution crops). No gallery-chrome findings needed filtering. Screenshots used: /tmp/astryx-uiux/shots/live-stream-viewer.{light,dark}.{1of2,2of2}.png.

## album-tracklist-player (1 confirmed)

- **LOW** [both] track table header: Duration column header (clock icon) is not right-aligned with its column values: the icon sits centered over the whitespace between the heart column and the durations, while values like 3:12 right-align ~40px further right, so the header does not visually anchor to its data (both schemes, 1of2 screenshots).

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded first try with 4 non-blank captures (2 scroll segments per scheme, not 3). Gemini returned 8 findings but 7 were disproven under pixel-level crop verification (claims of illegible active-row contrast, off-center pause icon, left-aligned track numbers, Plays header misalignment, avatar theming inconsistency, missing now-playing-bar separation, and timestamp misalignment were all contradicted by the screenshots). Only the clock-header alignment finding survived. The half-clipped 'Meridian Lights' row at the top of the 2of2 segments is a scroll-capture artifact, not a template defect.

## ai-chat-tool-stream (1 confirmed)

- **LOW** [both] composer / reply textarea in sticky footer: Native browser textarea resize handle (diagonal grip lines) is visible in the bottom-right corner of the reply input, overlapping the custom rounded border; should be resize:none or styled

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded first try, no blank-panel flake in either scheme. Gemini returned 8 findings but 7 failed visual verification (including two hallucinated hardcoded-color claims that contradicted the screenshots); verified via enlarged sips crops of header, tool-output blocks, composer, and dark footer button. Template is otherwise very clean in both schemes.

## inbox (1 confirmed)

- **LOW** [both] reading pane action toolbar (Reply / Archive / Snooze): Horizontal gap between the Reply pill and the Archive action (~18px) is noticeably tighter than the gap between Archive and Snooze (~28px), making the action group spacing look uneven.
- unconfirmed/low [dark] reading pane header metadata and folder-rail storage indicator: Muted secondary text in dark mode (sender email, 'to Dana Whitfield <...>' line, 'Jul 2, 2026, 9:42 AM' timestamp, '2.1 GB of 15 GB used') is on the dim side against the dark background; legible on inspection but close to the comfortable-contrast floor.

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded first try with 2 scroll segments per scheme (not 3), all four captures non-blank; gemini call succeeded first try. Gemini returned 8 findings but 6 were rejected on pixel-level verification: search-field icon padding, message-list snippet right padding, 'Mail / 4 unread' baseline, dark avatar 'PR' contrast, timestamp margin breakout, and unread-dot misalignment all look correct in enlarged crops (snippets and timestamps share the same right margin; dot is optically centered). Its 'nearly illegible / hardcoded light-mode tokens' claim for dark-mode metadata was overstated — text is a consistent muted token and readable, so it is reported only as an unconfirmed low. Overall the inbox template is in very good fit-and-finish shape.
