# Navi-inspired templates — BATCH 2 brief

You are authoring ONE page template for /Users/thedeej/dj-code/astryx-templates.

FIRST read `/Users/thedeej/dj-code/astryx-templates/reviews/navi-brief.md`
sections BEFORE the "TEMPLATE SPECS" heading — all file conventions,
responsive rules (useElementWidth), doc format, naming hygiene, and the
quality bar apply verbatim. IGNORE that file's batch-1 spec list; your
spec is in THIS file. Also read
`/Users/thedeej/dj-code/astryx-templates/templates/ai-chat-tool-stream.tsx`
as the canonical exemplar. Deliver exactly `templates/<id>.tsx` +
`templates/<id>.doc.ts`, run `pnpm typecheck` (zero errors in YOUR
files; other authors run concurrently — their in-progress errors are
not yours), and return the single registry line
`<id> | <Human Name> | <category> | <one-line description ≤110 chars>`.

## Batch-2 style addendum — dark fixed-palette surfaces

Specs 1-9 recreate terminal (TUI/CLI), smart-glasses HUD, and browser-
extension chrome. For these:
- A fixed dark palette via inline styles is CORRECT (real terminals and
  HUDs are dark in both themes). Suggested terminal palette: bg #0d1117,
  panel #161b22, text #e6edf3, dim #8b949e, green #3fb950, yellow
  #d29922, red #f85149, cyan #39c5cf, blue #58a6ff, magenta #bc8cff.
  Glasses palette: bg #000, accent #64dcff, accent-strong #00f0ff,
  success #78ff78, warning #f5eb78, attention #ff876e, error #ff7878.
  Extension palette: bg #0f1115, panel #171a21, blue #3b82f6, green
  #22c55e, red #ef4444.
- Monospace: `fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace'`
  on the surface root; build panes with CSS borders + border-radius (not
  literal box-drawing rows), but DO use literal glyphs inside text:
  ▸ ▾ ● ○ ✓ ✗ ⚠ ❯ 📌 ⠋ $ › ↵ etc.
- Center the surface on a token-based page backdrop
  (var(--color-background-muted)) with a caption row underneath naming
  the surface, so the template still reads in light demo chrome.
- Glasses surfaces: fixed 600×600 stage (rounded corners, subtle border)
  centered on the backdrop; 88px-ish touch targets; a focused card gets
  a cyan border + inset left bar + slight scale.
- Still use Astryx components where natural (Text, HStack/VStack,
  Tooltip, Kbd) but hand-styled divs are fine inside these dark stages.
- CSS keyframe animations: define via a <style> tag string constant if
  needed (pulse/breathe), keep subtle, no randomness.

Specs 10-20 are normal light/dark token-based product surfaces — follow
batch-1 conventions exactly (Layout height="fill", tokens, etc.).

---

# TEMPLATE SPECS (author ONLY yours)

## 1. tui-agent-console — "Terminal Agent Console"
Flagship terminal surface: a full-window TUI (dark stage, mono) with a
left Sessions panel (~34%) and right Chat panel, 1-row bottom status
bar. Sessions panel: rounded border, title ` Sessions (12) — Atlas `
(green border = focused pane; the chat pane border is dim gray);
folder headers `▾ Deploys (4)` cyan with a yellow ● unread dot,
`▸ Archived (…)` dimmed; session rows: `❯` cyan marker on the active
row, 📌 pinned, ● yellow processing, right-aligned compact times
(`14:32`, `7/12 09:15`); selected row white-on-blue. Chat panel title:
` fix flaky deploy checks │ Relay Ultra ` plus a node badge `● laptop
+2` and a 20-char context meter `████████░░░░░░░░░░░░ 42%` (fill green,
switch to yellow past 70%). Transcript: right-aligned bordered user
bubbles; assistant markdown-ish text; ONE tool-call box exactly in this
shape — rounded border, header row `▾ bash  ls -la` (yellow name, gray
preview, green ✓ + `1.5s`), divider, body lines `✓ completed`,
`$ ls -la` cyan, 3 output lines + `  ... (14 more lines)`; a collapsed
group header `▸ 3 tool calls — bash, ipython, edit  ✓`; a compaction
divider `────── ↺ context compacted ──────` (yellow label); a
processing row `● pondering...(ctrl+x to stop)` — cycle the word
through ['pondering','noodling','consulting the oracle','summoning
neurons'] on a 2s interval (setInterval in useEffect, deterministic
order); queued steering pill `› also update the runbook  ↻ queued`
italic gray. Bottom status bar: yellow key + gray label pairs `↵ send
Esc scroll  ctrl+o actions  Tab messages  ? help`, right chip
`↑ v1.2.3 (ctrl+u)` yellow. Input box at chat bottom: rounded border,
placeholder `Type a message...  ( / for commands, @ for files )`.
Interactive: session selection swaps transcript fixture, tool box
expands/collapses, typing works.

## 2. tui-kanban-board — "Terminal Kanban"
Terminal-styled kanban (dark stage, mono). Header: `⌘ Kanban` cyan bold
+ key-hint strip `wasd: move  1-4: lanes  /: search  n: new  enter:
open  q: quit` (yellow keys / gray labels). Four bordered lane columns:
Backlog (dim gray), Active (green), Your Turn (yellow), Archived
(blue) — focused lane gets a thick colored border and colored title;
2-line cards `▸ ● Ship context meter` / `    3h ago  ● ↳2` (green dot =
processing, `↳2` = active sub-agents), selected card highlighted; an
`empty` placeholder in one lane. Right Detail panel (~30%): bold title,
`Status  ● Active`, `Updated 2h ago`, `Model   relay-ultra`,
`Sub-agents (2)` with ●/◦ rows, `Last response` 6-line dim preview,
footer `enter: open chat  esc: back to kanban`. Keyboard: arrow keys /
1-4 actually move focus between lanes and cards (onKeyDown on the
stage, tabIndex 0); clicking a card selects it and fills the detail
panel. 3-5 cards per lane, all states shown.

## 3. tui-command-overlays — "Terminal Overlay Dialogs"
A dimmed terminal chat (simplified, background) with THREE overlay
dialog specimens rendered as centered rounded boxes (show one at a
time via a SegmentedControl in normal page chrome above the stage:
Help / Actions / Settings). HELP: 54-col box titled ` Help ` cyan,
yellow section headers Navigation / Chat / Session Management / Tools
& Settings, rows of cyan 20-char key column + white description (`n
New session`, `K Fork conversation`, `Z Schedules`, `m Change model /
yap level`, ~14 rows). ACTIONS: 40-col `Actions` palette — `n New
session`, `w Switch workspace`, `S Share link`, `R Rename`, `e Export
as Markdown`, `a Archive`, `p Pin / unpin`, `F Browse files`, `?
About`, hint row `key/↵ select  esc close`; arrow-key + click
selection highlight. SETTINGS: 52-col dialog, 13 rows with right-
aligned values — `Environment Variables — 3 set`, `Connected Repos —
2 connected`, `Active Nodes — cli:laptop ●` green, `Bell on Done —
on`, `Scroll Step — 5 lines`, `Kanban Refresh — 30s`, separator, then
`Refresh Sandbox / Reset Sandbox / Create Backup`; selecting Reset
shows the red confirm line `Wipe all files, memories, and context?
y/n`. All three navigable by keyboard.

## 4. cli-node-doctor — "CLI Node Doctor"
A terminal stage stacking three CLI specimens vertically (scrollable):
(a) startup hero — ASCII fairy mark (cyan/magenta, 3-4 lines of
punctuation art), `relay-node v1.2.3`, `mac-studio · ~/dev/atlas`,
`proxy: http://fwdproxy:8080`, italic tagline `Hey! Listen!`;
(b) live log + status line — 6 scrolled log lines (`#3 bash ls -la`
blue, `#3 ✓ (exit 0)` green, `#4 edit src/app.ts`, `#4 ✗ patch failed`
red, `Loaded 12 skills`, `↑ update available`) above an in-place
status line `● Connected · 12 skills · 4 cmds · heartbeat 3:42:07 PM`
(green dot; a Selector in page chrome switches the fixture to
Connecting.../Disconnected states); (c) `relay-node doctor` checklist —
rows `✓/✗/!/-` + bold label + detail + dim fix hint: `✓ Binary
version — v1.2.3 (latest)`, `✗ PATH — ~/.relay/bin is NOT in PATH`
with dim `export PATH="$HOME/.relay/bin:$PATH"`, `✓ Credentials —
~/.relay/credentials.json`, `! Proxy — git proxy differs from env`,
`✓ Connectivity — relaybot.dev reachable (123ms)`, `- Daemon — not
installed (optional)`. Copy buttons on fix lines.

## 5. glasses-ambient-home — "Glasses Ambient Home"
600×600 black HUD stage. A page-chrome SegmentedControl switches
between two screens: PAIR — brand icon + `Relay` h1, `Visit on your
phone or laptop:` chip `relaybot.dev/pair`, `Enter code:` giant
spaced mono code `A 7 K 2 9 X` (48px, cyan underline), `Waiting for
authorization…` pulsing, plus small state chips row (Connecting… /
Paired! green / Pairing failed red + `Tap to retry`); corner pill
`Demo`. HOME — centered glowing brand orb (radial gradient + soft
breathing animation) + `Relay`, then 4 icon cards (58px icon column,
title + subtitle): `New Conversation / Ask Relay now`, `✨ Attention
needed / 2 need attention · updated 3m ago`, `Sessions / Browse all
sessions`, `⌁ Unpair / Disconnect this device`; one card focused
(cyan border + inset bar + scale). Footer version chip
`relay-webapp-v97`. Arrow keys move focus between cards.

## 6. glasses-triage-hud — "Glasses Triage Card"
600×600 black HUD. Header: orange pulsing dot + `Needs you 1/3`
stepper pill (‹ › chevrons actually page through 3 fixture items) +
`· 2 working`. Meta row: effort pill `QUICK YES/NO` (green) or
`NEEDS REVIEW` (amber, on item 2) + `asked 12m ago`. Big 24px
question text, cyan-bordered `Recommended` panel with the suggested
answer, workspace badge + mono session id, `You last said …` anchor
line, `AGENT FOUND` bullet list (2-3 `• conclusion` lines), decision
chips row (the recommended chip glows cyan; selection state works).
Bottom: selected-action caption, 3 page dots, 5-icon glass toolbar
(56px round buttons): Read context, Speak response, Open session,
Snooze, Archive — snooze/archive fire a toast (`Snoozed until Tue
9:30 AM`, `Archived`) and advance to the next item. Include the
empty state as the 4th step: big `✓ All clear` + `Nothing needs your
attention`.

## 7. glasses-voice-chat — "Glasses Voice Chat"
600×600 black HUD chat. 52px header (session title `deploy triage`,
meta `atlas · a1b2c3d4`, mic-state chip `listening` cyan). Scrolling
log with top/bottom fade gradients: message cards `You` (cyan label)
and `Relay`, latest highlighted; one tool chip row — terminal icon,
`bash`, node pill `laptop` cyan, phase `RESULT`, green check + green
left inset bar; an `↑ load older messages` notice at top. Bottom 96px
glass record bar: glowing orb (three states cycled by clicking:
idle `Record / Tap to speak`, listening `Listening… / tap to stop`
with animated pulse rings, sending `Sending…`), pending photo thumb
square, live transcript text when listening. Include the full-screen
capture overlay as a toggleable state (page-chrome button): blurred
scrim, 154px orb with expanding pulse rings, uppercase `LISTENING`,
live-caption box. Toast specimens: `Photo attached`, `Top of
conversation`.

## 8. extension-connection-popup — "Browser Node Popup"
A 360px extension popup card centered on the backdrop (extension
palette). Header: gradient rounded "N" logo mark with status dot +
`Relay / Browser node` + `v1.4.2`. A page-chrome Selector cycles
status states and updates the dot + label: Connected (blue glow),
Connecting (pulse), Delegating to Relay (pulse+glow), Controlling
(glowing ring around logo), Needs attention (red), Disconnected.
Body stack: ✨ update banner (`Update available` + mono `v1.4.3` +
"Update from chrome://extensions" + × dismiss); pending-access panel
(`Relay needs page access`, the URL, `Suggested pattern:
^https://app\.example\.com/.*` mono, Approve / Block buttons —
approving collapses the panel); node id row `browser:7f3a92c1` mono +
Copy with copied feedback; connect form (`Relay URL` input prefilled
`https://relaybot.dev`, Connect button); Stop + Disconnect (danger)
row; `Annotate page` button; `Relay cursor` toggle card ("Show a
Relay-blue pointer where Relay clicks and focuses.") with Switch;
Permissions card row + Manage; footer caption `Commands are checked
locally before Chrome is controlled.` + `Open Relay` button.

## 9. browser-permissions-manager — "Browser Permissions Manager"
Full light/dark token page (~960px): header `Browser permissions` +
"Control which pages and actions the agent may drive in this
browser."; intro card explaining local regex checks; toolbar with
`Reset to defaults` Button; a green-tinted "Suggested from history"
seed panel — two-column preview of proposed allow/block additions
(mono patterns, red `block` chips) with `Apply shown changes` /
`Dismiss` (applying moves rows into the columns below); then three
columns (stack when compact): **Allowed pages** / **Blocked pages** /
**Actions**, each a Card with count pill, mono pattern rows
(`^https://github\.com/.*`, one with a `required` Badge and no remove)
+ × remove buttons, dashed-border empty state in one column, and an
add-row (TextInput placeholder `^https://example\.com/.*` + Add) with
invalid-regex inline error state. Footer: regex tips caption row.

## 10. system-status-page — "System Status Page"
Public status/observability page. Top band: status dot + heading `All
systems operational` (a page-chrome Selector flips to "Some systems
experiencing issues"/amber and "Major systems outage"/red, retinting
the band), `Updated 2 min ago`. HeaderStat strip (left-border divided,
big tabular numbers): `Sessions (24h) 4,812 · Users 1,209 · Error
sessions 38 (0.8%) · Agent runs 12,430`. TabList: Errors / Health /
Performance / Usage. ERRORS tab (default): **Top Errors** Table
(title, count, users), **By Error Type** list with proportional thin
bars, **By Release** rows (mono `gitSha` 7-char + branch + pct).
HEALTH tab: 90-day uptime bar row per service (thin segment bars,
green/amber/red segments, `99.97%` right-aligned) for 4 services
(API, Realtime, Sandbox pool, Model gateway). PERFORMANCE tab: TTFT
percentile mini-table (p50/p90/p99 across 3 models, period
SegmentedControl 1h/24h/7d changes fixture values). USAGE tab: 4 stat
cards + a 14-day inline SVG bar chart. All tabs switch content.

## 11. error-events-monitor — "Error Events Monitor"
Sentry-style issue monitor page. Header: `Error events` + period
SegmentedControl (24h / 7d). Issue rows (8): category chip (Model API
info / Stream Timeout warning / Database accent / Access Denied error
/ Context Overflow neutral / Unknown), issue title mono-ish, counts
`events · users · sessions` tabular, `last seen 4m ago`, a 64×16
7-day trend polyline SVG, and an expandable (Collapsible) detail with
a 24h sparkline that shows a hover crosshair + tooltip (`14:00 · 12
events` — implement with onMouseMove over the SVG, fixed buckets),
`first seen Jul 2`, mono issue id, and an `Open in tracker` ghost
Button. Sort Selector (Events / Recency). One resolved row rendered
dimmed with a `resolved` Badge.

## 12. mission-control-kanban — "Mission Control Board"
Live agent-work kanban (token-based, NOT terminal). Header bar:
`Mission Control` Heading, workspace Selector (All Workspaces /
Atlas / Personal), live counter strip `3 active` (pulsing green dot)
`· 2 review` (pulsing amber) `· 4 ideas · 1 inbox · 6 done`, Chat
toggle Button. Five lanes (Ideas blue / Inbox neutral / In Progress
green glow / Review amber glow / Done muted), uppercase lane headers
+ tabular counts, 2-4 TaskCards each: title, `relay-ultra · 12m ago`,
priority chip (high error / medium warning / low neutral), workspace
Token, and on in-progress cards a live activity line `⌨️ bash —
running tests on laptop` or `✏️ edit — Editing api.ts` with a tool
count Badge; one card shows an error tint. Card kebab ContextMenu:
Open in Chat / Rename / Copy Session ID / Move to Lane… / Set
Priority… / Archive. Clicking a card opens the right 380px chat
drawer: session title + `relay-ultra · 12m ago`, Open + TeamChat
ghost Buttons, mini thread (You/Agent bubbles, one tool chip with
`✔ exit 0` footer), Approve / Reject buttons when the card is in
Review, composer `Reply to agent…`. Selection state drives the
drawer; lane moves via the menu actually move cards.

## 13. admin-users-directory — "User Admin Directory"
Admin users table page. Header `Users` + caption `1,248 total · 312
active today · 741 active this week · 89,412 total sessions`; search
TextInput `Search by email, userId, or role...`. Table columns:
Email (admins get a shield Icon tinted info), Role, Created,
Sessions (tabular), Last Active (`Just now` / `5m ago` / `Never`
dimmed), Sandboxes, Groups (removable X Tokens + an inline `Add
group…` Selector on the selected row), Integrations (wrap of tiny
Badges from: GitHub, MM, BYOT, Opus, Ecto, Jarvis, SAM, StyleX,
Hatch). 10 fixture rows covering all states; search actually
filters; a row-count footer; empty-state message when a search
misses (`No users match your search.`). Compact: drop
Sandboxes/Created columns.

## 14. eval-triage-workbench — "Eval Triage Workbench"
Session-labeling workbench. Top: 4 stat cards — Total tagged 214,
Golden 58 (warning tint, award icon), Failure 121 (error tint),
Neutral 35. Left: sessions Table (Session title, User, Channel Badge
web/teamchat/api, Model, Msgs, Label Badge, Date) with a channel
Selector filter and `Filter by user ID...` input; pagination caption
`1–30 of 214`. Right detail panel for the selected row: transcript
snippet Card, then the LABEL picker — a RadioList-like chip grid of
the 16-item failure taxonomy (Tool Error (Unrecovered), Wrong Tool,
Wrong Parameters, Skill Misroute, Skill Not Triggered, False Success
Claim, Hallucination, Premature Termination, Clarification Stall,
Repeated Action, Context Overflow, Verbose Waste, Off Topic, No
Failure, + 2 more), a Golden/Failure/Neutral SegmentedControl, a
notes TextArea, and Save with FieldStatus autosave feedback; a `By
Skill` mini-table below the stats (skill, tagged count, failure %).

## 15. pr-verification-dashboard — "PR Verification Dashboard"
CI verification dashboard for PRs. Header: repo Selector
(`atlas/api · 6 open`, `atlas/web · 4 open`) + status summary chips.
PR cards list: author Avatar, `#482 Fix sandbox cold start retries`,
`by mchen · a1b2c3d`, verification StatusBadge (Verified success /
Pending warning with pulsing dot / Failed error / No Tests neutral),
`12 passed / 2 failed` caption, and a PassRateBar (thin ProgressBar
tinted by threshold: ≥95 success, ≥80 warning, else error).
Selecting a PR fills a right detail panel: per-test rows (`✓ passed`
/ `✗ failed` / `⚠ error` / `⊘ skipped` with mono test names and
durations), a failed test expands to an error CodeBlock, and a
`Daily Trend (30d)` stacked mini bar chart (inline SVG, green/red
segments, fixed data). Empty-state specimen (`No open pull
requests`) under a divider.

## 16. shared-file-viewer — "Shared File Viewer"
Public shared-file page. Sticky header: file Icon + mono filepath
`memory/RUNBOOK.md`, `Shared file` Badge, a **Live** pill with
pulsing success dot (Tooltip `Last checked 30s ago`; a page-chrome
toggle flips it to the amber `Live refresh failed` state), view-mode
SegmentedControl (Rendered / Diff / Code), `Open Relay` ghost Button.
Body by mode: Rendered = Markdown component with headings, a table,
a code fence; Diff = 2 file cards with unified-diff rows (dual
line-number gutters, +/- tinted lines); Code = CodeBlock with line
numbers. Footer caption: `Shared by mchen · expires in 6 days`.
Signed-out specimen Card below: `Sign in to view this shared file.`

## 17. workspace-join-consent — "Join & Consent Cards"
Centered auth-flow page presenting three sequential cards (a stepper
in page chrome switches: Invite / OAuth / Device). INVITE: "You've
been invited to join a workspace" Dialog-style Card — WORKSPACE row
(icon + name + mono #hashtag), DESCRIPTION, MEMBERS (4) with
AvatarGroup + crown glyph `(admin)` on one, Decline ghost + Join
Workspace primary; clicking Join animates through `Joining
workspace…` → `Setting up workspace…` (Spinner + staged text via
setTimeout) → success check `Workspace ready — redirecting…`. OAUTH:
`Authorize Application` consent card — `**DeployBot** is requesting
access to your Relay account`, PERMISSIONS REQUESTED list (`Create
and send messages to sessions`, `Access sandbox and skill APIs`)
with check icons, Deny / Authorize, denied state text (`Authorization
denied. No access was granted.`). DEVICE: `Authorize CLI` — giant
tracked mono code `WXK4-92LF`, caption `Verify the code matches what
you see in your terminal`, Cancel / Authorize, success state `CLI
authorized successfully.`

## 18. agent-feedback-triage — "Feedback Triage Board"
Bug-report/feedback triage page. Header: `User feedback` + count +
a 14-day daily-count SVG bar chart (compact, right-aligned). Filter
row: category chips with counts (Model Error / UI Bug / Performance /
Sandbox / Tool Failure / Feature Request / Other) as ToggleButtons,
status Selector (All / Open / Ongoing investigation / Resolved).
Report rows (10): category chip, 2-line description, reporter +
relative time, screenshot count glyph (`2 📎`-style with paperclip
Icon), status Badge, fix-owner Avatar on claimed rows. Selecting a
row opens a detail panel: full text, mono session id link, screenshot
Thumbnail placeholders (2 gray tiles), a status Selector + `Assign to
me` Button, and an activity log (3 timestamped entries). Filters
actually filter; status changes update the row Badge.

## 19. agent-tool-renderer-gallery — "Tool Renderer Gallery"
A chat transcript showcasing rich per-tool result renderers (the
complement of ai-chat-tool-stream's piles — here each tool gets its
OWN specialized card): (a) bash — terminal-tinted block with cyan
`$ pnpm test --filter api` and truncated output + `View full output`
opening a Dialog; (b) edit — `Edit api/routes.ts` card with `+12 -3`
stats and a unified diff body (tinted add/remove rows, +/- gutters);
(c) image generation — a square shimmer placeholder card (animated
soft radial glow, CSS keyframes) with caption `Generating image…`,
next to the finished-state card; (d) browser — `Chrome navigate —
app.example.com/checkout` with an embedded schematic screenshot
placeholder (gray page mock with a highlighted rectangle); (e) a
background-process pill (`Background process succeeded · Command:
pnpm build · Log: build.log`) expanding to a mono log; (f) a
sub-agent result pill row (`✓ security-review — no blocking findings`
with Open button) + a group header `2 sub-agents — 1 completed, 1
failed`; (g) an error block — destructive-tinted collapsible with
one-line summary and mono detail. Each assistant turn introduces one
renderer; every card carries the shared wrapper row: tool icon, node
chip (`laptop`), summary, duration `Ran in 1.5s`, status icon, and on
TWO cards a hook pill (`block` warning-tinted with shield icon ring;
`rewrite` info-tinted) — auto-expanded per the hook rule.

## 20. sessions-attention-dashboard — "Sessions Attention Split"
Two-bucket live sessions dashboard. Header: `Sessions` + caption
`18 running · refreshed 15s ago` + workspace Selector. Two column
sections with cheeky headers: **Inference Bound** (info dot,
caption `The agent is working — nothing needed from you`) and
**You're in the Way** (warning dot, caption `Waiting on your reply
or review`). Session cards (5-6 per bucket): title, workspace Token,
node label mono (`devvm1234 ~/repos/atlas`), state line (`⚙ running
bash — 2m` with Spinner on inference-bound cards; `waiting 42m —
last message from agent` with amber Timestamp tone on
you're-in-the-way cards), sub-agent count Badge, and a `Nudge` /
`Open` Button pair on waiting cards. A classification legend
Collapsible at the bottom explains the split rules (3 bullet rows).
Moving a card: the Open button no-ops, but a `Mark handled` action
on waiting cards moves the card to Inference Bound (state update).
Compact: buckets stack vertically.
