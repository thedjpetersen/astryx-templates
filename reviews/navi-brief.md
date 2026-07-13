# Navi-inspired AI chat template brief

You are authoring ONE page template for the astryx-templates repo at
`/Users/thedeej/dj-code/astryx-templates`. Each template is a standalone,
deterministic React page built from `@astryxdesign/core` components. The
inspiration is "navi", an AI agent chat product (Claude-Code-style web app)
with workspaces, sessions, agents, tools, schedules, and paired devices —
but templates must be PRODUCT-NEUTRAL: invent your own product/brand names,
never use "navi", real model names, or Meta/Anthropic branding.

## Deliverables (exactly 3 file edits per template)

1. `templates/<id>.tsx` — the page component (default export).
2. `templates/<id>.doc.ts` — metadata doc.
3. DO NOT touch the demo registry — the coordinator registers all entries.

## Page file conventions (match existing templates exactly)

- First line: `// Copyright (c) Meta Platforms, Inc. and affiliates.`
- Then `'use client';`
- Then a JSDoc header block with `@file page.tsx`, `@input` (fixtures),
  `@output` (what the page shows), `@position Page template; emitted by
  \`astryx template <id>\``, then `Frame:` and `Responsive contract:` notes.
- Imports: `@astryxdesign/core/<Component>` subpath imports; icons from
  `lucide-react` using the `Icon`-suffixed aliases (`SearchIcon`, `XIcon`)
  passed as `<Icon icon={SearchIcon} size="sm" />`.
- Styles: a single `const styles: Record<string, CSSProperties>` map near
  the top; use design tokens (`var(--spacing-2)`, `var(--color-border)`,
  `var(--color-background-card)`, `var(--radius-container)`,
  `var(--color-background-muted)`, `var(--color-text-primary)`).
  NEVER use `var(--color-text)` — it does not exist (renders black on SVG).
- Data: `// ============= DATA =============` section with deterministic
  fixtures only. No `Date.now()`, no `Math.random()`, no network assets,
  no real logos. Fixed ISO timestamps around 2026-07.
- Interactivity: useState-driven; selections, toggles, expand/collapse,
  dismissals should actually work. No-op `onClick={() => {}}` only for
  actions that would leave the page.
- Default export: `export default function <PascalCase>Template() {...}`.

## Responsive rule (IMPORTANT — demo stage quirk)

The demo renders pages in an inline stage ~1045-1075px wide inside a
1440px window, so **viewport media queries never fire in the inline
stage**. For pages whose layout must adapt (sidebar collapse, column
drops), measure the page's own width with a local ResizeObserver helper
instead of `useMediaQuery`:

```tsx
function useElementWidth(ref: RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) {
        setWidth(rect.width);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}
```

Wrap the page in a measured `<div ref={wrapRef} style={{height: '100%'}}>`
and derive `isCompact = wrapWidth > 0 && wrapWidth <= 720` (pick your own
breakpoints). Mobile-first single-column pages can skip this.

## Frame conventions

- Full-page shells: `Layout height="fill"` with `LayoutHeader`,
  `LayoutContent`, `LayoutPanel` (side panels), and `SideNav` where a nav
  rail fits. Chat surfaces use `ChatLayout` / `ChatMessageList` /
  `ChatMessage` / `ChatMessageBubble` / `ChatSystemMessage` from
  `@astryxdesign/core/Chat` (see `templates/ai-chat-tool-stream.tsx` for
  a canonical example — READ IT FIRST).
- Available components (subpaths under `@astryxdesign/core/`): Layout,
  Chat, SideNav, TopNav, NavItem, NavMenu, MobileNav, AppShell, Avatar,
  AvatarGroup, Badge, Banner, Breadcrumbs, Button, ButtonGroup, Calendar,
  Card, ClickableCard, SelectableCard, Carousel, Chat, CheckboxInput,
  CheckboxList, Citation, Code, CodeBlock, Collapsible, CommandPalette,
  ContextMenu, DateInput, Dialog, AlertDialog, Divider, DropdownMenu,
  EmptyState, Field, FieldStatus, FileInput, FormLayout, Grid, Heading,
  HoverCard, HStack/VStack/StackItem (from Layout or Stack), Icon,
  IconButton, InputGroup, Item, Kbd, Link, List, Markdown, MetadataList,
  MoreMenu, MultiSelector, NumberInput, Outline, OverflowList, Pagination,
  Popover, PowerSearch, ProgressBar, RadioList, Resizable, Section,
  SegmentedControl, Selector, Skeleton, Slider, Spinner, StatusDot,
  Switch, Table, TabList, Text, TextArea, TextInput, Thumbnail, TimeInput,
  Timestamp, Toast, ToggleButton, Token, Tokenizer, Toolbar, Tooltip,
  TreeList, Typeahead. Hooks from `@astryxdesign/core/hooks`
  (useStreamingText, useEntryAnimation, useMediaQuery — but see the
  responsive rule above).
- Verify a component's props by reading its `.d.ts` under
  `node_modules/@astryxdesign/core/dist/<Component>/` before using
  anything you haven't seen in an existing template.

## Doc file convention

```ts
import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: '<Human Name>',
  description:
    '<2-4 sentences: concrete surface, layout archetype, key components, and when to choose it over sibling templates>',
  category: 'AI Chat - <Gap>',
  componentsUsed: ['<sorted list of Astryx components actually used>'],
} satisfies AstryxPageTemplate;

export default template;
```

## Quality bar

- Dense, real-feeling fixtures: invented but plausible session titles,
  agent/tool names, repo paths, token counts, timestamps. 8-15 list items
  where a list is the centerpiece, not 3.
- Every visible state variant present in fixtures (e.g. running / needs
  review / failed / archived rows all appear).
- Accessible: labels on IconButtons, `aria-label` on Spinners,
  `isLabelHidden` label props on inputs.
- When done, run from the repo root: `pnpm typecheck` — it must report
  zero errors in YOUR files (pre-existing errors elsewhere are not yours
  to fix).
- Return (as your final message) a single line: `<id> | <Human Name> |
  <category> | <one-sentence registry description (max 110 chars)>`.

## Naming hygiene

Rename all source-product concepts to neutral inventions: the assistant
gets a made-up product name per template (like existing templates use
"Pipeline Copilot"); "GChat" → an invented team-chat integration name
(e.g. "TeamChat"); the blue "fairy" glow → a neutral "activity glow";
model names must be invented (no Claude/GPT/Llama). Keep the *density*
of the source: 10-11px uppercase tracking-wide section eyebrows, compact
rows, hover-reveal actions, amber = locks/defaults/experimental,
glassy card chrome approximated with tokens (no backdrop-filter needed).

---

# TEMPLATE SPECS (author ONLY the one assigned to you)

## 1. ai-chat-session-sidebar — "Session Sidebar Shell"
Full app shell: pinned ~288px left sidebar + active chat on the right
(a modest transcript + composer is enough; the SIDEBAR is the star).
Sidebar top: search input ("Search chats…"), filter button with a tiny
accent dot when non-default; expanding filter reveals two segmented pill
rows — session filter (All / Personal / Shared / Workspace) and group
mode (Recent / People / Tags). Sections in order: PERSONAL, two team
workspaces, SHARED WITH ME, collapsible ARCHIVED — headers are uppercase
11px muted eyebrows with collapse chevron, icon, an accent "you are
here" mark on the active context, amber star on the default workspace,
hover kebab (Move up / Settings / Archive). Group sessions inside a
workspace by tag (Folder icon, "Uncategorized" catch-all, right-aligned
counts) with a "3 more…" expander capped at 5 rows. Session row: status
dot (accent + pulse for a processing row — use a subtle CSS opacity
animation), pin glyph on pinned rows, lineage glyph on one "forked"
row, truncated title, second line = author initial-avatar + relative
time label ("3 hours ago" as static text) + role label ("Can reply" /
"View only") on shared rows. One row expands to nested sub-agent
children with their own status dots (running=warning pulse,
complete=success, error=error) and an "Agent task" fallback title.
Hover-reveal kebab per row: Pin, Rename, Copy URL, Move to…, Archive.
Footer: "14 active · 6 archived" left, "2 running" right. Include a
sidebar-collapse toggle that narrows to an icon rail. 12-16 sessions
across sections; all states represented.

## 2. ai-chat-workspace-landing — "Assistant Landing"
The signed-in empty-state landing. Centered column (~640px): greeting
heading, then a state strip showing the boot checklist (setup stages:
"Environment ready" ✓, "Workspace restored" ✓, "Skills loaded" ✓,
"Tools configured" spinner + mono status message, then "Ready") that
you render mid-boot. Below: the composer card (TextArea, attach, model
pill, send) with placeholder "Type a message…". Under the composer: up
to 3 rounded suggested-action pill Buttons, one carrying a small
confidence percent ("92%"), dismiss-on-click. Above the greeting: a
workspace context pill (workspace icon + name + chevron) opening a
Popover listing Personal (check), 3 workspaces with icon + name + mono
#hashtag, an amber-star default marker, an "Archived" mini-section, and
a "Create team workspace" footer action. Also render a dismissible
"Determining workspace…" banner variant ("Reading your first message to
route this chat") as the pre-routing state near the composer. Recent
sessions strip at the bottom: 4 ClickableCards with title, relative
time, status dot.

## 3. ai-chat-composer-suite — "Agent Composer"
A chat page whose centerpiece is a maximal composer; keep the
transcript short (2 turns). Composer card (rounded, bordered, max-width
~680 centered): TOP — queued follow-up rows (CornerDownRight icon,
text, status label Queued / Sending / Failed, stale hint "Queued 5m ago
— send now?", Send + Delete actions); attachment chips (icon by type,
name + "PDF · 1.2 MB", X remove, one error-state chip). MIDDLE —
TextArea with an active slash-command chip ("/compact") floating above
it. BELOW the field, the control row: attach menu (DropdownMenu: Upload
file / Paste from clipboard / Capture screenshot), mic IconButton,
model selector Popover (trigger pill "Relay Ultra (High)"; panel lists
4 invented models, one with an amber "experimental" Badge, a
"REASONING EFFORT" SegmentedControl row with a "your default" dot, an
"EXTENDED THINKING" Switch, Done footer), NODE SELECTOR Popover
(trigger pill Globe "All nodes"; panel header "Node lock", then node
rows: icon by type (terminal/browser/desktop), name, status dot,
specs line "8 vCPU · 32 GB", AND a pricing column — e.g. "$0.42/hr"
for sandbox tiers, "Included" for your own CLI nodes, plus a $-scale
glyph row (like $$$◦◦) indicating relative session cost; one row
locked by another session with an amber lock glyph), context meter
(mini ProgressBar + "16%" opening the token-breakdown Popover), then
Stop (outline) + a destructive "Force stop" AlertDialog, and the round
Send button whose split menu offers "Send" / "Send in Fork". Include a
slash-command menu Popover rendered open above the field: grouped
Commands / Model / Session / Tools rows with /help, /compact, /fork,
/model, /aside, /stop descriptions and one emerald "Skill" badge. A
Kbd hint row: Enter to send · Shift+Enter newline · ⌘Enter queue.

## 4. ai-workspace-settings-modal — "Assistant Settings Modal"
A page with a dimmed backdrop and a large open Dialog (~896px wide,
takes most of the stage): left 240px aside = "Settings" header, a
settings search TextInput, grouped nav (APP: General, Appearance,
Storage, Notifications · CONNECTIONS: Team chat & nodes · AUTOMATION:
Automation, Sub-Agents · INTERFACE: Shortcuts, Experiments) with the
active item highlighted; right pane = the Notifications panel rendered
in full: push-level SegmentedControl Off / Important / Done / All with
a description line per level, a status line ("Subscribed on this
browser"), Test button, a Devices list ("Chrome · macOS — This
browser", "Updated Jul 2", Remove buttons), and a team-chat
acknowledgment section: emoji preset row (👀 ⚙️ ✅ 📝 👍 ⚡ as
selectable ToggleButtons) over condition rows (New sessions / Continued
threads / Busy follow-ups / Done) each with a Selector. Clicking other
nav items swaps panels — implement at least Experiments too (checkbox
rows with uppercase alpha/amber, beta/info, stable/success Badges and
descriptions). Mobile/compact: nav collapses to a horizontal strip
(use useElementWidth).

## 5. workspace-switcher-hub — "Workspace Switcher"
Focused page on workspace management. Left: the switcher list (
Personal on top with check; 4 workspaces each with a distinctive icon
tile, name, mono #hashtag, member count; amber star default toggle with
tooltip copy "Always start new chats in this workspace"; kebab: Move
up / Move down / Settings / Archive; an Archived section with restore
buttons). Right panel swaps between: (a) "Create team workspace" form —
Name ("e.g. My Team"), Description "(optional)", Hashtag field with
live preview "/ws #my-team" and a validation warning state; (b) routing
mode card — RadioList tri-state: Auto-routing ("The assistant reads the
first message of each new chat and places it in the workspace it most
likely belongs to"), Personal default, Fixed workspace default, with a
confirm-switch AlertDialog when changing; (c) a "Move session to…"
demo menu with a ✨ "Suggested" section ("Finding best match…" spinner
state on open, then the classifier's pick) above the full list.

## 6. workspace-icon-studio — "Workspace Icon Studio"
An avatar/icon design studio. Left: live preview tile at 4 sizes
(xs/sm/md/lg) + the workspace name. Right: TabList across 4 icon types
— Icon (5 glyph options × 4 tones as a swatch grid), Emoji (preset grid
+ tone backdrop selector), Gradient (8 named presets as swatches:
Aurora, Dawn, Lagoon, Orchid, Moss, Copper, Midnight, Prism — plus a
generator panel: style SegmentedControl Mesh / Linear / Radial / Conic,
Zoom + Angle Sliders, 3 color-stop swatch pickers, a named-template
Selector with 6+ invented evocative names, and a "Generate" button that
cycles a deterministic preset sequence), Upload (FileInput + crop
preview placeholder + "Downscaled to 256px WebP" note). All controls
actually update the preview (build gradients from inline CSS
linear/radial/conic-gradient strings driven by state).

## 7. ai-chat-context-manager — "Context Window Manager"
A focused panel page (~720px centered column). Top: the meter — a
stacked horizontal bar with 5 category segments (System / Context
files / Skills / Tool results / Messages) in distinct variants, and
"32k / 200k tokens (16%) · compaction at 70%" caption. Sections below:
"LOADED EVERY TURN" (rows: label, token count, mini ProgressBar;
footer "Fixed: 9.4K (5%)"), "THIS SESSION", "CONTEXT FILES" and
"SKILLS" (rows clickable-looking with chevrons, "Show 4 more"
expander, "~" prefix + footnote "Estimated — not yet refined with API
token counts"). Then "Compaction boundary": a Slider 10-90% with help
text and a "Set as default" Button. Then the expense scale: five $
glyphs partially lit with caption "Session so far · rough
model-weighted estimate · 1.2M tokens", and a per-model cost breakdown
mini-table (3 rows with tabular numbers). Interactive: slider moves,
sections collapse, "Show more" works.

## 8. ai-chat-compaction-inspector — "Compaction Inspector"
A chat transcript containing two inline compaction marker chips between
messages (Archive icon; states "Memory compacted" with mono subtitle
"12 messages summarized · 45,000 tokens (38%) removed", and a
"Compaction failed" error variant with Retry). "Inspect" opens a large
Dialog "Compaction Details" with a TabList: Diff (two-column
before/after of a context manifest — use CodeBlock with a diff
language fixture), Tree (TreeList of model-context/… paths with
per-node kept/dropped Badges), Stats (4 stat Cards: Messages "120 →
64", Tokens "120,000 → 60,000", Reduction "50%", Boundary "message
42"). Keep the dialog rendered open by default.

## 9. ai-chat-session-search — "Chat History Search"
Search overlay page: a dimmed chat behind, centered search panel
(~640px) rendered open. Header input with typed query ("deploy
rollback"), spinner slot, and a "Local + remote · merged 12 results"
caption. Filter pill rows with counts: status All / Active / Archived,
role Both / Your prompts / Responses, and a CheckboxInput "Include
sub-agent threads". Results (8-10): icon, title (archive glyph on
archived rows), relative time, snippet line where the match is
highlighted (accent-tinted <mark>-style span) and prefixed by a role
chip ("you" info / "assistant" accent / "session" neutral). One result
is keyboard-active (visible focus ring); footer hint row: ↑↓ to move ·
Enter to open · Esc to close. Empty-state variant card below as a
specimen: 'No results for "quarterly OKRs"'.

## 10. session-tag-manager — "Session Tag Manager"
Two-pane tool. Left: scope Selector (Personal / two workspaces) above
the tag list (8 tags: name, session count, color dot, Wand icon on
auto-tagged ones, inline rename on click, delete with confirm). Right:
the selected tag's auto-tagging rule editor — AND-matched condition
rows, each a Selector (Title contains / Message contains / Touches
file path / Uses tool) + TextInput with per-type placeholder ("launch /
deploy", "app/api/", "bash"), add/remove row buttons, a "Matches 7 of
last 50 sessions" preview line, and a preview list of 4 matching
session rows. Include an "Uncategorized" pseudo-tag pinned at top with
count and no editor (explanatory EmptyState instead).

## 11. ai-chat-minimap-recap — "Chat Navigator Furniture"
A long chat transcript (12+ short messages) demonstrating navigation
furniture: (a) right-edge minimap — a thin column of bars (user bars
short + accent-tinted, assistant bars longer; one thicker bar for a
long message) that on hover expands into a navigator listing 64-char
text previews, click scrolls to the message (use element refs +
scrollIntoView); (b) an aria-live recap Card pinned above the composer
— Clock icon, uppercase "RECAP" eyebrow, 2-sentence recap text, X
dismiss; (c) a floating bottom-right session-changes pill that renders
collapsed as a diff icon and expands to "4 files changed" on hover,
clicking opens a Dialog listing changed files (path, +12/-3 counts,
per-file status dots) with the dismiss X deliberately on the LEFT.

## 12. workspace-files-browser — "Workspace Files Browser"
Dialog-style page (large open Dialog over dimmed chat): left rail =
scope TabList (Personal / Atlas team), search input, TreeList built
from file paths (memory/MEMORY.md, notes/2026-07-10.md, scripts/…),
size + relative-date metadata under each; right = viewer pane with
path Breadcrumbs, view-mode SegmentedControl (Rendered / Source), a
Markdown render of the selected note (or CodeBlock in Source mode), a
History Popover (3 versions with "Restore" buttons + RotateCcw icon),
and a Share button with copied-state feedback. Selecting tree nodes
swaps the viewer content (3-4 distinct file fixtures).

## 13. agent-hooks-automation — "Agent Hooks Console"
Master-detail automation console for lifecycle hooks. Left list
(searchable): 7 hooks with name, event Badge (PreToolUse / PostToolUse
/ SessionStart), enabled Switch, error count on one. Detail pane:
metadata grid (Event, Matcher mono chip, On failure: block/warn,
Timeout "30s", Version), a TRIGGERS editor — rows with a type dot +
Selector (tool_call / tool_pattern / keyword / channel / node / event),
a mode chip toggle ("activates" / "invokes"), and a value TextInput
with per-type CSV placeholder ("bash, ipython, edit", "\brm -rf\b",
"web, teamchat"); add/remove trigger rows; then a CodeBlock of the
hook script with a copy button, and a run-history strip (last 5 runs:
status dot + duration + relative time).

## 14. ai-chat-slash-commands — "Slash Command Library"
Manager page for chat slash commands. Header: count caption ("18
commands · 12 built-in · 6 custom"), scope SegmentedControl (All /
Personal / Workspace), search. Table/List of commands: mono /name,
aliases as small Tokens, category Badge (Commands / Model / Session /
Tools), an emerald "Skill" Badge on two, usage string in mono
("/goal [objective|status|pause]"), description, scope, a "hidden"
eye-off glyph on one, per-row enable Switch and kebab (Edit /
Duplicate / Delete). Detail/editor drawer (rendered open for one
custom command): name field with "/" prefix InputGroup, description,
prompt-template TextArea with {input} placeholder note, scope
RadioList, a collision warning Banner ("Conflicts with built-in /fork
— your command wins in this workspace"), usage counter caption ("Used
34 times · max 50 custom commands per user").

## 15. ai-chat-quick-settings — "Sandbox Quick Settings"
The gear-menu popover as a focused surface: a ~320px settings Card
column (rendered as an open Popover anchored to a gear in a slim top
bar) containing: Refresh sandbox row (with tooltip copy "Your files
and memories are preserved"), Re-sync files row with result caption
("Restored 12 files"), THEME segmented icon row (Light / Dark / System
/ Custom), "Verbosity (team chat)" 3-option RadioList with the playful
level descriptions (Level 0 pure signal / Level 1 highlights only /
Level 2 everything), Auto-archive row (NumberInput + "days" + Switch),
Auto-dismiss agents row (NumberInput + "min" + Switch), Default model
Selector, and a danger zone: "Reset sandbox" destructive Button
opening the 2-step AlertDialog/Dialog — bullet list of everything
destroyed (workspace files, backups, conversations, memory index), red
"There is no undo" note, then a type-RESET-to-confirm TextInput gating
the final "Permanently delete everything" destructive Button (disabled
until the input matches). Footer: version string + Log out.

## 16. ai-chat-message-collab — "Message Collaboration"
A shared chat transcript with collaboration affordances: hover action
row on messages (thumbs up/down with counts, copy, copy-link, fork);
one message shows a fork Popover listing 2 existing forks ("View
fork · 2h ago") plus "Fork from here"; margin comment threads on the
right gutter (two Cards aligned to their anchor messages: author
avatar + name, 1-2 comment bubbles, reply TextInput with @mention
Typeahead rendered open on one showing 3 candidates including an
@assistant bot row); a reactions summary strip under one message
(👍 3 · 🎉 1 as ToggleButtons). Compact width folds margin comments
inline below their message (useElementWidth).

## 17. ai-chat-sheet-stack — "Session Sheet Stack"
A main chat with two stacked right-side sheets: outer sheet (~440px) =
a forked session ("fork" variant header Badge, its own mini transcript
+ composer); inner sheet (~380px) = an "aside" variant ("ASIDE"
eyebrow, copy "Side question with full context — kept out of the main
chat", single Q&A exchange). Each sheet header: title, variant Badge,
collapse-to-rail button and X. Collapsing turns a sheet into a 44px
vertical rail with a rotated title label; clicking restores it. The
main chat dims progressively under the stack. Escape-key closes the
top sheet (keyboard handler).

## 18. agent-events-dashboard — "Agent Events Dashboard"
Server-events dashboard with the glassy floating navbar motif: a
centered floating pill navbar (Chat / Events / Status round icon
buttons, active = accent tint ring). Content: 4 stat blocks (2xl
tabular numbers, left-border dividers): Subscriptions 12 · Dispatches
(24h) 482 · Failures 3 · P95 latency 840ms, tone-coded Badges.
SUBSCRIPTIONS table: event pattern (mono), channel Badge, target
session, enabled Switch, last dispatch relative time, status dot.
DISPATCH HISTORY list (12 rows): event name mono, payload preview
truncated, result Badge (delivered / retried / failed with tone),
duration, timestamp; a failed row expands (Collapsible) to an error
CodeBlock. Empty-state specimen panel with dashed border at the
bottom ("No subscriptions in this workspace yet").

## 19. workspace-home-overview — "Workspace Home"
The workspace home surface behind the landing: header with workspace
icon + name + member AvatarGroup + a layout preference SegmentedControl
(Overview / Recent sessions). Overview mode: a BRIEFING card (dated
digest paragraph + 3 bullet highlights + "Generated 7:00 AM" caption),
a NEWSFEED column (5 activity rows: actor avatar, action text, object,
relative time), a RESOURCES panel (pinned links list with favicons-as-
Icon tiles and descriptions), and a WIDGETS grid (4 small cards: open
sessions count, scheduled jobs next-run, nodes online, weekly token
sparkline drawn as a tiny inline SVG polyline with fixed points).
Recent-sessions mode: a clean launchpad list of 6 session rows (title,
status dot, participants, relative time). SegmentedControl actually
switches modes.

## 20. agent-device-registry — "Devices & Nodes"
Personal device management page (settings archetype, ~720px column).
PAIRED CLIENTS section: rows typed CLI / Glasses / Voice with icon
tile, device name, "Paired Jul 8 · 3h left" TTL caption (one expiring
row in warning tone), Revoke button with confirm AlertDialog. ACTIVE
NODES section: rows "cli:mac-studio", "browser:chrome-work",
"computer:devbox-04" with type icon, green online / blue provisioned
dot, version, last-seen; one row carries an amber lock glyph +
"Locked by session: perf-triage" tooltip; a lock Banner above the list
("Locked: cli:mac-studio" + Clear button). CONNECT section: "Connect a
node" card with a copyable install Code line and a "Waiting for a node
to connect…" spinner row, plus a green just-connected row specimen
("cli:new-laptop ✓ Connected"). Footer note about node locks TTL
("Stale locks clear after 20 minutes").
