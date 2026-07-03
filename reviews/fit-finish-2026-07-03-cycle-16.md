# Fit-and-finish review — cycle 16 (2026-07-03) — FINAL: full 192-template sweep complete

Pipeline: vite demo server → Playwright headless Chromium (1440x900, light+dark, scrolling segments of `.preview-wrap`) → Gemini designer critique → Claude agent pixel-crop verification.
**Totals: 2 high / 12 medium / 15 low confirmed across 12 templates.**


## kpi-dashboard (5 confirmed)

- **HIGH** [both] Operations overview KPI stat row: Stat cards do not fill the container width: the first row of 3 fixed-width cards stops ~2/3 across, misaligned with the full-width charts below and the time-range toggle above, and the 4th card (Active users) wraps alone onto a second row leaving two empty slots and a large blank region.
- **MEDIUM** [both] Top endpoints table: Numeric columns (Requests, Error rate, P95) are left-aligned instead of right-aligned, so magnitudes do not line up vertically (e.g. 61,435 vs 412,908) and values are hard to scan/compare.
- **MEDIUM** [dark] KPI stat cards - delta text: The green delta text (+12.4%, -0.08%, +18 ms) uses the same dark green in dark mode as in light mode, producing low contrast against the near-black card background; the success color appears hardcoded rather than theme-adjusted.
- **MEDIUM** [both] P95 latency stat card: The delta '+18 ms vs. previous 30 days' is colored green (positive/good) even though a latency increase is a regression; delta coloring appears keyed to sign rather than metric direction, contradicting the error-rate card where a negative value is green.
- **LOW** [both] Traffic chart: The Traffic chart plots two series (blue and orange lines, 'Requests vs. errors') but has no legend or series labels, so users must guess which line is which.

> Pipeline notes: Capture succeeded on first attempt; all 4 screenshots (light/dark x 2 segments) rendered non-blank. Gemini critique succeeded on first attempt and returned 8 findings; 3 survived verification (numeric alignment, broken stat grid, missing legend). Refuted and dropped: light-mode status badges retaining dark styling (badges correctly use pale backgrounds with dark text in light mode), table right-edge misalignment, low-contrast chart axis labels (standard muted gray, legible in both schemes), sparkline bottom padding (adequate), and x-axis labels crowding the card edge (ample margin). Two findings added from my own inspection: dark-mode delta green contrast and the semantically inverted green on the P95 latency delta.

## deployment-detail (3 confirmed)

- **HIGH** [both] Build logs terminal (bottom edge): Last visible log line is sliced horizontally in half at the terminal container's bottom rounded edge — container clips content with no bottom padding and no visible scrollbar; header claims '19 lines' but only ~14 render before the cutoff. Seen in both light.2of2 and dark.2of2.
- **MEDIUM** [light] Build logs terminal (level labels): 'info'/'debug' level labels render noticeably darker (lower contrast) in light mode than in dark mode on the same fixed dark terminal background, indicating a theme-dependent muted-text token instead of a scheme-agnostic terminal color. Seen comparing light.1of2 vs dark.1of2.
- **LOW** [dark] Build logs terminal (row striping): Log rows show visible lighter-navy zebra banding / row dividers in dark mode but the terminal is uniformly dark in light mode — a theme border/surface token leaking into the fixed-dark terminal, making its appearance inconsistent between schemes. (Gemini reported the inverse — bright stripes in light mode — which is not what the pixels show; corrected here.)

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded first try producing 2 segments per scheme (not 3), no blank-preview flake in any capture. Gemini call succeeded and returned 3 findings (under the 8 max). Gemini finding #1 was moderated (timestamps are readable; only level labels are low-contrast) and finding #3 was inverted relative to the actual screenshots (striping is visible in dark mode, not light) — reported the corrected version. Verified via upscaled crops in /tmp/astryx-uiux/crops. Source screenshots: /tmp/astryx-uiux/shots/deployment-detail.{light,dark}.{1of2,2of2}.png.

## logs-explorer (2 confirmed)

- **MEDIUM** [light] log stream rows (level column): The 'warn' level label renders in bright amber/yellow (var(--color-warning)) on a white row background in light mode, giving roughly 2:1 contrast; it is hard to read compared to the same label in dark mode.
- **LOW** [both] facet rail (Level / Service checkbox pills): The circular checkmark icon sits completely flush against the left edge of each pill's background with zero left padding, while the count badge on the right has normal inset — asymmetric and unpolished in both schemes.

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded first try, all 4 captures (2 light + 2 dark) rendered non-blank. Gemini call succeeded and returned 8 findings, but 6 were rejected after pixel-level crop verification: JSON payload text is a readable slate secondary color (not invisible), JSON uses a monospace font, closing braces align correctly with opening braces, the log container does have a right border (confirmed via 4x-upscaled corner crop and the shim source in demo/src/compat/lab.tsx), the Live-tail toggle track is clearly visible in light mode, and the header-control alignment is acceptable at full size. Also verified that only 6 of 14 rows being visible is not a bug — LogStream is an internal scroll container with maxHeight=520 (templates/logs-explorer.tsx:477).

## dashboard-split (3 confirmed)

- **MEDIUM** [both] Net revenue chart card: Chart plots two series (blue and purple) but has no legend or series labels anywhere in the card; the subtitle says 'vs. the prior month' yet the user cannot tell which line is the current period and which is the prior month.
- **MEDIUM** [both] Net revenue chart card: Card is stretched to match the right column's height, leaving a large empty region (roughly the bottom half of the card) below the chart's x-axis; the chart does not scale to fill the container. Visible in the 2of2 segments of both schemes.
- **LOW** [both] Revenue by plan card: Bottom inner padding (~12px below the Marketplace progress bar) is noticeably tighter than the card's top padding (~23px), making the last row look cramped against the bottom border. Visible in the 2of2 segments of both schemes.
- unconfirmed/low [dark] Net revenue chart card subtitle: Gemini flagged the dark-mode subtitle ('Net revenue per 3-day bucket...') as failing contrast; on inspection it is dim but legible and consistent with the muted-text treatment in light mode, so this is at most a minor contrast concern.

> Pipeline notes: Capture succeeded on first run; all 4 screenshots (light/dark x 2 segments) rendered non-blank, no recapture needed. Gemini returned 8 findings; 5 were dropped after pixel-level crop verification: stat-card top padding, refresh-icon misalignment, segmented-control corner cramping, x-axis label margins, and Revenue title/subtitle spacing all look fine on close inspection (gemini overstated them). The 'Marketplace flush against border' claim was downgraded — there is visible padding, just asymmetric vs the top. The missing-legend finding is mine, not gemini's. Light-vs-dark token usage looks correct (progress bars, card surfaces, green deltas all invert consistently).

## shell-left-sidebar (1 confirmed)

- **MEDIUM** [both] main content, 'Finish setting up' card grid: Setup card grid does not fill the content width: the two top cards end at ~x1172 while the 'Inbox content region' placeholder below spans the full width to ~x1398, leaving a large empty column on the right; the third card ('Set up assignment rules') wraps to a lone second row even though visible space remains in row one, so the grid's right edge misaligns with the container directly beneath it.

> Pipeline notes: Capture succeeded on first attempt; all 4 screenshots (light/dark x 2 segments) rendered with content, no blank-panel flake. Gemini call succeeded and returned 8 findings, but 7 were rejected on pixel-level verification: the light-mode sidebar footer is light (not hardcoded dark), the active '24' badge is a black pill matching siblings (not white-on-light), the 16/5/3 badges align with the 24 badge right edge, the Recommended badge is optically centered with its icon, card title/body spacing is normal, Queues/Admin section gaps are equal, and the dark-mode subtitle contrast measures 7.4:1 (rgb 170,175,181 on 31,31,34), passing WCAG AAA. Only the card-grid width/wrap issue survived; no additional defects were found on independent review.

## form-page (3 confirmed)

- **MEDIUM** [both] Billing address section, State / ZIP code row: State select and ZIP code input are vertically misaligned in the two-column row: the ZIP field's helper text ('5-digit code; extensions are added automatically.') sits between its label and input, pushing the ZIP input ~30px lower than the State select, breaking the shared input baseline.
- **LOW** [dark] Sticky footer: In dark mode the Cancel button's dim gray text on a dark gray pill is low-contrast; readable on close inspection but well below comfortable contrast for an action button.
- **LOW** [light] Sticky footer: In light mode the 'Save changes' button uses a warm taupe-gray fill with white text that is off-palette versus the neutral black primary pills used elsewhere in the design system, making the primary action read as disabled/unpolished (possibly an intentional disabled state given the 'All changes saved.' status, but the warm tint still clashes with the neutral grayscale).

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded on the first run (2 scroll segments per scheme, not 3), all four captures rendered non-blank in both schemes, and the single gemini call succeeded. Gemini returned 8 findings; 5 were dropped after crop-level verification: dark-mode 'Required/Optional' labels are dim but legible, dropdown chevrons do adapt to dark mode, the sticky footer content aligns with the form column, the 'Product news' off row is legible in dark mode, and the full-bleed header divider is a consistent intentional band pattern matching the footer. One kept finding (Save changes color) was reframed since the button is not actually the same color in both schemes.

## operations-dashboard (1 confirmed)

- **MEDIUM** [dark] KPI cards (Revenue / Active deals / At risk) trend text: The green trend text (e.g. "+12.4% from previous period") uses the same mid-green in dark mode as in light mode, so it sits dim and low-contrast against the near-black card background; the success color is not swapped to a lighter dark-mode variant, suggesting a hardcoded color or missing dark token.

> Pipeline notes: Capture succeeded on first attempt with non-blank previews in both schemes (2 scroll segments each, not 3). Gemini returned 8 findings but mislabeled which images were light vs dark; on pixel-level verification (cropped/zoomed inspection) 7 of 8 were false: no clipped button, kicker text is standard muted-but-legible, no Queued-pill light/dark leak, dividers are consistently inset, header actions align with the card grid, list spacing has proper 2:1 grouping, and KPI pills are centered on the title line. Only the dark-mode green trend-text contrast finding survived. No additional defects found beyond gemini's list.

## codeblock-terminal (3 confirmed)

- **MEDIUM** [dark] CodeBlock container vs preview panel background (dark mode): In dark mode the terminal block background rgb(13,17,23) sits on the preview panel background rgb(31,31,34) at ~1.15:1 contrast with no border or elevation shadow, so the component's edges nearly disappear; light mode shows a crisp black-on-white card, suggesting a hardcoded near-black terminal background with no dark-scheme border/outline token.
- **MEDIUM** [both] Code text inside the terminal block: Zero syntax/output color differentiation: the $ prompts, the ✓ success line, commands, flags, and file paths are all the identical rgb(230,237,243), even though the template is billed as 'Dark terminal-style CodeBlock with a syntax theme wrapper' — the wrapper appears to have no visible effect in either scheme.
- **LOW** [both] Template demo composition within the preview panel: The single ~480px-wide terminal block is anchored to the top-left corner of the large preview card, leaving roughly 90% of the panel as empty background in both schemes; the demo looks sparse and uncentered compared to other block templates.

> Pipeline notes: Capture healthy on first attempt: 4 shots (light/dark x 2 segments), no blank-panel flake. Gemini returned 8 findings; 5 were refuted by pixel/geometry measurement (label and copy-icon contrast is actually ~6.2:1 AA-pass, not 'nearly invisible'; top/bottom padding is balanced at ~14px each; horizontal insets 18px vs 14px; monospace columns align at x=383 on all three lines) and 1 (missing header divider) was dropped as a subjective style call — the 21px gap gives adequate separation. Findings 7 and 8 were confirmed via pixel sampling; the composition finding is my own addition.

## infinite-scroll-feed (2 confirmed)

- **LOW** [both] post card footer row: The comment icon in each card's footer is indented ~13px right of the card's left content axis (avatar, title, body, and tag pills all align at x~567; the comment icon sits at ~x580), while the right side stays aligned (ellipsis and bookmark both at x~1199). The footer row's left edge looks optically off-axis on every card.
- **LOW** [both] skeleton loading cards at feed bottom: Skeleton placeholder lines (name bar plus two body bars) all start in the avatar-right column (~x612), but in real loaded cards the title and body align to the card's left padding (~x567, flush with the avatar). The skeleton does not mirror the loaded card structure, so content shifts left when a real post replaces it.

> Pipeline notes: Capture succeeded on first attempt; all 6 screenshots (light/dark x 3 segments) rendered non-blank, no harness flake. Gemini returned 8 findings but 6 were rejected on pixel-level verification (hallucinated contrast failures on tags and the Pinned badge, a nonexistent right-edge misalignment, a nonexistent missing skeleton name bar, normal title/body spacing, and near-equal header gaps described backwards). The two reported findings are corrected/verified versions of gemini's alignment and skeleton observations, confirmed via 2-3x zoomed crops. Dark mode is clean: all tag pill colors (purple, green, orange, blue, magenta) are properly dark-tinted with readable text, indicating tokenized colors throughout.

## profile-page (1 confirmed)

- **LOW** [both] activity list card: A divider line is rendered after the last activity item ('Announced Meridian 4.0 release candidate'), leaving a stray empty band between that divider and the card's rounded bottom border; dividers should be between items only.

> Pipeline notes: Pipeline healthy. shoot.mjs produced 4 non-blank captures (2 scroll segments per scheme) on the first run; the dark 1of2 initially looked light at thumbnail scale but pixel-level crops confirmed a proper dark render, so no recapture was needed. Gemini returned 8 findings but 7 were rejected on zoomed verification: activity icons and 'MC' avatar initials are light-on-dark and legible in dark mode, dark-mode dates have adequate contrast, the Active badge / tab '8' badge / '+ Follow' icon are all vertically centered, and button padding is balanced. Gemini's 'uneven container padding' claim was narrowed to the one concrete, verifiable defect reported: a trailing divider after the final activity list item. Screenshots: /tmp/astryx-uiux/shots/, verification crops: /tmp/astryx-uiux/crops/.

## shell-top-nav (2 confirmed)

- **LOW** [both] shell content area below the placeholder slot: The dashed 'Overview content region' placeholder does not stretch to fill the shell's content height, leaving roughly 280-300px of empty card space between the placeholder's bottom edge and the card's bottom edge in both color schemes; the shell looks half-empty rather than like a full app frame.
- **LOW** [both] top nav right cluster (search / bell / avatar): Horizontal gaps in the right nav cluster are uneven: the search-field-to-bell gap is visibly wider than the bell-to-avatar gap, making the bell/avatar pair look slightly crowded relative to the search input.

> Pipeline notes: Pipeline healthy: shoot.mjs succeeded on the first run (2 scroll segments per scheme, 4 PNGs, no blank-preview flake) and the single gemini call returned 8 findings. However, 6 of gemini's 8 findings were disproved on zoomed verification crops (claimed illegible 'DW' avatar, clipped search icon, dark-mode WCAG failures, misaligned Live badge, misaligned + icons, and nav-link misalignment were all not visible at 3x zoom); one spacing finding was kept in softened form. The template renders cleanly and consistently in both schemes with no hardcoded-color artifacts; only the two low-severity polish items above survived.

## kpi-strip (3 confirmed)

- **LOW** [both] KPI card status badges: Badge chip colors are pixel-identical between light and dark modes (green sampled (26,140,49) in both; yellow/red near-identical), suggesting hardcoded semantic colors rather than theme-adaptive tokens.
- **LOW** [both] KPI card surfaces: Card background is the exact same color as the preview canvas in both schemes (white-on-white in light, (31,31,34)-on-(31,31,34) in dark), so cards rely solely on a 1px border for definition; dark mode gets no surface elevation. Consistent across schemes, so likely intentional flat styling.
- **LOW** [both] 'On track' badge, first card: White text on green (26,140,49) measures ~4.3:1 contrast, marginally below WCAG AA 4.5:1 for its small (~11px) text size; the 'Review' badge uses dark-on-yellow and passes comfortably.

> Pipeline notes: Pipeline healthy: single shoot.mjs run produced 4 non-blank captures (2 segments per scheme), no blank-panel flake, no recapture needed. Gemini call succeeded on first attempt and returned 8 findings, but 6 were disproven by direct pixel inspection (BMP-converted pixel sampling + edge crops): no clipping/overflow of the SLA card, padding is symmetric, light-mode secondary text is (84,102,116) on white ~5.9:1 (passes AA), and inter-card gaps are proportionate to card padding. Only the token/theming-related observations survived, all at nitpick severity. Template overall renders clean and well-aligned in both schemes.
