var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (workspace sessions, slash commands,
 *   help topics — fixed ISO timestamps, no network assets)
 * @output Command palette launcher: a minimal AI-workspace page (TopNav with
 *   workspace Selector + nav links, a grid of session Cards) dimmed under an
 *   Overlay scrim, with a keyboard-driven CommandPalette open at ~18vh —
 *   typed query with fuzzy-match highlighting, grouped results (Recent
 *   sessions / Commands / Help), an async "searching remote" row, and a
 *   footer with Kbd navigation hints and prefix cheatsheet
 * @position Page template; emitted by \`astryx template command-palette-launcher\`
 *
 * Interaction contract:
 * - The palette opens by default with the query "dep" typed and the second
 *   result carrying the keyboard-selection highlight.
 * - ArrowUp/ArrowDown move the highlight (wrapping); Enter runs the entry
 *   (announced via a visually-hidden aria-live region) and closes; Escape
 *   or a scrim click closes to reveal the background page; mod+K (and the
 *   header Search button) reopens.
 * - Typing filters sections live. Prefixes scope the search the way the
 *   footer hints advertise: plain text fuzzy-matches session titles,
 *   ":" filters sessions by workspace, "/" filters commands, "?" filters
 *   help topics. Typing resets the highlight to the first row.
 *
 * Responsive contract:
 * - Palette: 640px wide, capped at 100vw minus a spacing-4 gutter; top edge
 *   pinned at 18vh at every breakpoint; result list scrolls internally
 *   beyond 48vh.
 * - <=640px: the footer's prefix cheatsheet is hidden; the Kbd navigation
 *   hints keep the row.
 * - <=640px TopNav: the header Search button collapses to an icon-only
 *   IconButton (the "Search" text and mod+k Kbd are dropped) so the
 *   tap target that reopens the palette stays on screen, and the
 *   workspace Selector and inline nav links (Sessions/Deploys/Models/
 *   Docs) are hidden to keep the bar from overflowing.
 * - Background session cards: Grid columns={{minWidth: 280, max: 3}} —
 *   3-up on wide viewports, reflowing to 2-up and 1-up as space narrows.
 */

import {useEffect, useMemo, useState, type CSSProperties} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {
  CommandPaletteEmpty,
  CommandPaletteFooter,
  CommandPaletteGroup,
  CommandPaletteInput,
  CommandPaletteItem,
  CommandPaletteList,
} from '@astryxdesign/core/CommandPalette';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {Overlay} from '@astryxdesign/core/Overlay';
import {Selector} from '@astryxdesign/core/Selector';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {TopNav, TopNavHeading, TopNavItem} from '@astryxdesign/core/TopNav';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {MediaTheme, useTheme} from '@astryxdesign/core/theme';
import {
  CommandIcon,
  EraserIcon,
  HashIcon,
  KeyboardIcon,
  RocketIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  root: {
    height: '100dvh',
    width: '100%',
  },
  overlay: {
    display: 'block',
    height: '100%',
    width: '100%',
  },
  // Positions the palette at ~18vh; clicking the empty area closes it.
  paletteLayer: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    paddingTop: '18vh',
    paddingInline: 'var(--spacing-4)',
    boxSizing: 'border-box',
  },
  paletteCard: {
    overflow: 'hidden',
  },
  resultList: {
    maxHeight: '48vh',
    overflowY: 'auto',
    // Breathing room so the last row is not sliced flush against the footer.
    paddingBottom: 'var(--spacing-3)',
  },
  // Fade mask lives on this NON-scrolling wrapper: a mask on the scroll
  // container itself stretches over the full scrollHeight and scrolls with
  // the content, so the fade would sit at the content bottom instead of the
  // visible clip edge. On the static wrapper it pins to the footer divider,
  // dissolving whichever row the scroll edge clips.
  resultListMask: {
    maskImage:
      'linear-gradient(to bottom, black calc(100% - var(--spacing-5)), transparent 100%)',
    WebkitMaskImage:
      'linear-gradient(to bottom, black calc(100% - var(--spacing-5)), transparent 100%)',
  },
  // Non-selectable async row at the bottom of the sessions section.
  searchingRow: {
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  // Anchor the 8px status dot to the center of the 20px title line.
  sessionDot: {
    marginTop: 'var(--spacing-1-5)',
  },
  // Align the 16px-leading timestamp with the 20px title line.
  sessionTimestamp: {
    marginTop: 'var(--spacing-0-5)',
  },
  // Fuzzy-match highlight — token background, inherits the row's text color.
  matchHighlight: {
    backgroundColor: 'var(--color-accent-muted)',
    color: 'inherit',
  },
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },
};

// ============= DATA =============

type SessionStatus = 'running' | 'complete' | 'error';

interface WorkspaceSession {
  id: string;
  title: string;
  workspace: string;
  model: string;
  status: SessionStatus;
  /** Fixed ISO timestamp — rendered relatively via <Timestamp>. */
  updatedAt: string;
  preview: string;
}

interface SlashCommand {
  id: string;
  name: string;
  description: string;
  icon: typeof RocketIcon;
  keys: string;
}

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  icon: typeof KeyboardIcon;
}

const STATUS_DOT: Record<
  SessionStatus,
  {variant: 'accent' | 'success' | 'error'; label: string; isPulsing: boolean}
> = {
  running: {variant: 'accent', label: 'Running', isPulsing: true},
  complete: {variant: 'success', label: 'Complete', isPulsing: false},
  error: {variant: 'error', label: 'Failed', isPulsing: false},
};

const WORKSPACE_OPTIONS = [
  {value: 'platform', label: 'Platform Eng'},
  {value: 'growth', label: 'Growth'},
  {value: 'personal', label: 'Personal'},
];

// Session titles are chosen so the seeded query "dep" exercises both match
// paths: contiguous ("depot", "dependency") and subsequence ("Debug
// payment…"), while the last two rows fall out of the filtered list.
const SESSIONS: WorkspaceSession[] = [
  {
    id: 'ses-401',
    title: 'Deploy checkout-api to staging',
    workspace: 'Platform Eng',
    model: 'loom-4',
    status: 'running',
    updatedAt: '2026-07-02T08:47:00',
    preview: 'Canary at 25% — watching error budget before full rollout.',
  },
  {
    id: 'ses-398',
    title: 'Debug payment webhook retries',
    workspace: 'Platform Eng',
    model: 'loom-4',
    status: 'complete',
    updatedAt: '2026-07-02T07:12:00',
    preview: 'Traced duplicate retries to a stale idempotency key TTL.',
  },
  {
    id: 'ses-395',
    title: 'Rollback depot-sync deploy',
    workspace: 'Platform Eng',
    model: 'loom-4-mini',
    status: 'error',
    updatedAt: '2026-07-01T22:30:00',
    preview: 'Rollback halted — schema migration is not reversible.',
  },
  {
    id: 'ses-390',
    title: 'Update dependency audit workflow',
    workspace: 'Growth',
    model: 'loom-4-mini',
    status: 'complete',
    updatedAt: '2026-07-01T18:05:00',
    preview: 'Weekly audit now opens one rollup PR instead of twelve.',
  },
  {
    id: 'ses-386',
    title: 'Summarize churn cohort analysis',
    workspace: 'Growth',
    model: 'loom-4',
    status: 'complete',
    updatedAt: '2026-07-01T15:40:00',
    preview: 'Q2 cohorts churn 2.1pp less after the onboarding rework.',
  },
  {
    id: 'ses-382',
    title: 'Rewrite onboarding email sequence',
    workspace: 'Personal',
    model: 'loom-4-mini',
    status: 'complete',
    updatedAt: '2026-06-30T11:20:00',
    preview: 'Five-touch sequence drafted; day-3 nudge still needs copy.',
  },
];

const COMMANDS: SlashCommand[] = [
  {
    id: 'cmd-deploy',
    name: '/deploy',
    description: 'Ship the active session branch to an environment',
    icon: RocketIcon,
    keys: 'mod+shift+d',
  },
  {
    id: 'cmd-model',
    name: '/model',
    description: 'Switch the model for this session',
    icon: SettingsIcon,
    keys: 'mod+shift+m',
  },
  {
    id: 'cmd-clear',
    name: '/clear',
    description: 'Clear the session transcript and context window',
    icon: EraserIcon,
    keys: 'mod+shift+x',
  },
  {
    id: 'cmd-share',
    name: '/share',
    description: 'Invite workspace members to this session',
    icon: UsersIcon,
    keys: 'mod+shift+s',
  },
];

const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'help-shortcuts',
    title: 'Keyboard shortcuts',
    description: 'Every palette and session hotkey',
    icon: KeyboardIcon,
  },
  {
    id: 'help-syntax',
    title: 'Search syntax',
    description: 'Prefixes, workspace filters, and fuzzy matching',
    icon: HashIcon,
  },
];

// ============= FUZZY MATCHING =============

interface MatchSegment {
  text: string;
  isMatch: boolean;
}

/**
 * Contiguous match first (indexOf), then character subsequence. Returns the
 * text split into highlight segments, or null when the term does not match.
 */
function fuzzySegments(text: string, term: string): MatchSegment[] | null {
  if (!term) {
    return [{text, isMatch: false}];
  }
  const lower = text.toLowerCase();
  const query = term.toLowerCase();

  const start = lower.indexOf(query);
  if (start >= 0) {
    const segments: MatchSegment[] = [];
    if (start > 0) {
      segments.push({text: text.slice(0, start), isMatch: false});
    }
    segments.push({text: text.slice(start, start + query.length), isMatch: true});
    if (start + query.length < text.length) {
      segments.push({text: text.slice(start + query.length), isMatch: false});
    }
    return segments;
  }

  // Subsequence pass — mark each matched character, then merge runs.
  const matched = new Array<boolean>(text.length).fill(false);
  let queryIndex = 0;
  for (let i = 0; i < text.length && queryIndex < query.length; i++) {
    if (lower[i] === query[queryIndex]) {
      matched[i] = true;
      queryIndex++;
    }
  }
  if (queryIndex < query.length) {
    return null;
  }
  const segments: MatchSegment[] = [];
  let run = text[0];
  let runIsMatch = matched[0];
  for (let i = 1; i < text.length; i++) {
    if (matched[i] === runIsMatch) {
      run += text[i];
    } else {
      segments.push({text: run, isMatch: runIsMatch});
      run = text[i];
      runIsMatch = matched[i];
    }
  }
  segments.push({text: run, isMatch: runIsMatch});
  return segments;
}

function HighlightedText({segments}: {segments: MatchSegment[]}) {
  return (
    <>
      {segments.map((segment, index) =>
        segment.isMatch ? (
          <mark key={index} style={styles.matchHighlight}>
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </>
  );
}

// ============= RESULT MODEL =============

type PaletteEntry =
  | {kind: 'session'; id: string; session: WorkspaceSession; segments: MatchSegment[]}
  | {kind: 'command'; id: string; command: SlashCommand; segments: MatchSegment[]}
  | {kind: 'help'; id: string; topic: HelpTopic};

interface PaletteSection {
  id: string;
  heading: string;
  entries: PaletteEntry[];
  /** Async-state row: remote search still in flight for this section. */
  isSearchingRemote?: boolean;
}

/**
 * Prefix-scoped filtering, matching the footer cheatsheet: plain text
 * fuzzy-matches session titles (commands and help stay listed as quick
 * actions), ":" filters sessions by workspace, "/" filters commands,
 * "?" filters help topics.
 */
function buildSections(query: string): PaletteSection[] {
  const trimmed = query.trim();
  const prefix =
    trimmed.startsWith('/') || trimmed.startsWith(':') || trimmed.startsWith('?')
      ? trimmed[0]
      : '';
  const term = prefix ? trimmed.slice(1).trim() : trimmed;
  const sections: PaletteSection[] = [];

  if (prefix === '' || prefix === ':') {
    const entries: PaletteEntry[] = [];
    for (const session of SESSIONS) {
      if (prefix === ':') {
        if (session.workspace.toLowerCase().includes(term.toLowerCase())) {
          entries.push({
            kind: 'session',
            id: session.id,
            session,
            segments: [{text: session.title, isMatch: false}],
          });
        }
        continue;
      }
      const segments = fuzzySegments(session.title, term);
      if (segments) {
        entries.push({kind: 'session', id: session.id, session, segments});
      }
    }
    if (entries.length > 0) {
      sections.push({
        id: 'sessions',
        heading: 'Recent sessions',
        entries,
        isSearchingRemote: true,
      });
    }
  }

  if (prefix === '' || prefix === '/') {
    const entries: PaletteEntry[] = [];
    for (const command of COMMANDS) {
      // Plain queries keep every command listed as a quick action; only the
      // "/" prefix narrows this section.
      const segments =
        prefix === '/'
          ? fuzzySegments(command.name.slice(1), term)
          : fuzzySegments(command.name.slice(1), '');
      if (segments) {
        entries.push({kind: 'command', id: command.id, command, segments});
      }
    }
    if (entries.length > 0) {
      sections.push({id: 'commands', heading: 'Commands', entries});
    }
  }

  if (prefix === '' || prefix === '?') {
    const entries: PaletteEntry[] = HELP_TOPICS.filter(
      topic =>
        prefix === '' ||
        topic.title.toLowerCase().includes(term.toLowerCase()) ||
        topic.description.toLowerCase().includes(term.toLowerCase()),
    ).map(topic => ({kind: 'help' as const, id: topic.id, topic}));
    if (entries.length > 0) {
      sections.push({id: 'help', heading: 'Help', entries});
    }
  }

  return sections;
}

// ============= ROWS =============

function SessionRow({
  session,
  segments,
}: {
  session: WorkspaceSession;
  segments: MatchSegment[];
}) {
  const dot = STATUS_DOT[session.status];
  return (
    // width 100% + vAlign start: timestamps share the row's right edge and
    // dot/timestamp anchor to the title line instead of floating mid-row.
    <HStack gap={3} vAlign="start" width="100%">
      <StatusDot
        variant={dot.variant}
        label={dot.label}
        isPulsing={dot.isPulsing}
        style={styles.sessionDot}
      />
      <StackItem size="fill">
        <VStack gap={0}>
          <Text type="body" maxLines={1}>
            <HighlightedText segments={segments} />
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {session.workspace} · {session.model}
          </Text>
        </VStack>
      </StackItem>
      <Timestamp
        value={session.updatedAt}
        format="relative"
        type="supporting"
        color="secondary"
        style={styles.sessionTimestamp}
      />
    </HStack>
  );
}

function CommandRow({
  command,
  segments,
}: {
  command: SlashCommand;
  segments: MatchSegment[];
}) {
  return (
    <HStack gap={3} vAlign="center" width="100%">
      <Icon icon={command.icon} size="sm" color="secondary" />
      <StackItem size="fill">
        <VStack gap={0}>
          <Text type="code">
            /<HighlightedText segments={segments} />
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {command.description}
          </Text>
        </VStack>
      </StackItem>
      <Kbd keys={command.keys} />
    </HStack>
  );
}

function HelpRow({topic}: {topic: HelpTopic}) {
  return (
    <HStack gap={3} vAlign="center" width="100%">
      <Icon icon={topic.icon} size="sm" color="secondary" />
      <StackItem size="fill">
        <Text type="body">{topic.title}</Text>
      </StackItem>
      <Text type="supporting" color="secondary" maxLines={1}>
        {topic.description}
      </Text>
    </HStack>
  );
}

// ============= PAGE =============

export default function CommandPaletteLauncherPage() {
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);
  // Seeded mid-search: "dep" typed, keyboard highlight on the second row.
  const [query, setQuery] = useState('dep');
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [workspace, setWorkspace] = useState('platform');
  const [announcement, setAnnouncement] = useState('');
  const isNarrow = useMediaQuery('(max-width: 640px)');
  // Resolved page scheme — re-anchors the palette under the dark scrim.
  const {mode: colorMode} = useTheme();

  const sections = useMemo(() => buildSections(query), [query]);
  const flatEntries = useMemo(
    () => sections.flatMap(section => section.entries),
    [sections],
  );
  // Derived clamp (no effect): filters can shrink the list under the index.
  const highlightedIndex = Math.min(
    Math.max(selectedIndex, 0),
    Math.max(flatEntries.length - 1, 0),
  );

  // mod+K toggles the palette from anywhere on the page.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsPaletteOpen(previous => !previous);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const runEntry = (entry: PaletteEntry) => {
    if (entry.kind === 'session') {
      setAnnouncement(\`Opened session "\${entry.session.title}"\`);
    } else if (entry.kind === 'command') {
      setAnnouncement(\`Ran \${entry.command.name}\`);
    } else {
      setAnnouncement(\`Opened help: \${entry.topic.title}\`);
    }
    setIsPaletteOpen(false);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (flatEntries.length === 0) {
        return;
      }
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setSelectedIndex(
        (highlightedIndex + step + flatEntries.length) % flatEntries.length,
      );
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const entry = flatEntries[highlightedIndex];
      if (entry) {
        runEntry(entry);
      }
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setIsPaletteOpen(false);
    }
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(0);
  };

  // ----- Background workspace page (dimmed while the palette is open) -----

  const workspacePage = (
    <Layout
      height="fill"
      header={
        <LayoutHeader padding={0} hasDivider>
          <TopNav
            label="Workspace navigation"
            heading={<TopNavHeading heading="Waypoint" headingHref="#" />}
            startContent={
              // Phone fallback: four labeled links plus the end cluster
              // cannot fit a 375px bar, and endContent (the only tap target
              // that reopens the palette) must stay on screen.
              isNarrow ? undefined : (
                <>
                  <TopNavItem label="Sessions" href="#" isSelected />
                  <TopNavItem label="Deploys" href="#" />
                  <TopNavItem label="Models" href="#" />
                  <TopNavItem label="Docs" href="#" />
                </>
              )
            }
            endContent={
              <HStack gap={3} vAlign="center">
                {!isNarrow && (
                  <Selector
                    label="Workspace"
                    isLabelHidden
                    size="sm"
                    options={WORKSPACE_OPTIONS}
                    value={workspace}
                    onChange={setWorkspace}
                  />
                )}
                {isNarrow ? (
                  <IconButton
                    label="Search sessions and commands"
                    variant="secondary"
                    size="sm"
                    icon={<Icon icon={SearchIcon} size="sm" />}
                    onClick={() => setIsPaletteOpen(true)}
                  />
                ) : (
                  <Button
                    label="Search sessions and commands"
                    variant="secondary"
                    size="sm"
                    icon={<Icon icon={SearchIcon} size="sm" />}
                    endContent={<Kbd keys="mod+k" />}
                    onClick={() => setIsPaletteOpen(true)}>
                    Search
                  </Button>
                )}
                <Avatar name="Ana Weiss" size="small" />
              </HStack>
            }
          />
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <VStack gap={4}>
            <HStack gap={2} vAlign="center">
              <Heading level={2}>Today</Heading>
              <Text type="supporting" color="secondary">
                {SESSIONS.length} sessions
              </Text>
            </HStack>
            <Grid columns={{minWidth: 280, max: 3}} gap={3}>
              {SESSIONS.slice(0, 3).map(session => {
                const dot = STATUS_DOT[session.status];
                return (
                  <Card key={session.id} padding={4}>
                    <VStack gap={2}>
                      <HStack gap={2} vAlign="center">
                        <StatusDot
                          variant={dot.variant}
                          label={dot.label}
                          isPulsing={dot.isPulsing}
                        />
                        <StackItem size="fill">
                          <Text type="label" maxLines={1}>
                            {session.title}
                          </Text>
                        </StackItem>
                      </HStack>
                      <Text type="supporting" color="secondary" maxLines={2}>
                        {session.preview}
                      </Text>
                      <HStack gap={2} vAlign="center">
                        <Text type="code" size="sm" color="secondary">
                          {session.model}
                        </Text>
                        <StackItem size="fill" />
                        <Timestamp
                          value={session.updatedAt}
                          format="relative"
                          type="supporting"
                          color="secondary"
                        />
                      </HStack>
                    </VStack>
                  </Card>
                );
              })}
            </Grid>
            <HStack gap={2} vAlign="center">
              <Icon icon={CommandIcon} size="sm" color="secondary" />
              <Text type="supporting" color="secondary">
                Press <Kbd keys="mod+k" /> to search sessions or run a command.
              </Text>
            </HStack>
          </VStack>
        </LayoutContent>
      }
    />
  );

  // ----- Foreground palette, pinned at ~18vh over the scrim -----

  let flatIndex = -1;
  const palette = (
    // Clicking the dimmed area (not the palette itself) closes.
    <div
      style={styles.paletteLayer}
      onClick={event => {
        if (event.target === event.currentTarget) {
          setIsPaletteOpen(false);
        }
      }}>
      <Card
        width={640}
        maxWidth="100%"
        padding={0}
        style={styles.paletteCard}
        role="dialog"
        aria-label="Command palette">
        <CommandPaletteInput
          value={query}
          onValueChange={handleQueryChange}
          placeholder="Search sessions, : workspace, / commands, ? help…"
          onKeyDown={handleInputKeyDown}
          endContent={<Kbd keys="mod+k" />}
        />
        <Divider />
        <div style={styles.resultListMask}>
          <CommandPaletteList label="Search results" style={styles.resultList}>
            {flatEntries.length === 0 ? (
              <CommandPaletteEmpty>
                No sessions, commands, or help topics match “{query.trim()}”.
              </CommandPaletteEmpty>
            ) : (
              sections.map(section => (
                <CommandPaletteGroup key={section.id} heading={section.heading}>
                  {section.entries.map(entry => {
                    flatIndex += 1;
                    const index = flatIndex;
                    return (
                      <CommandPaletteItem
                        key={entry.id}
                        value={entry.id}
                        isHighlighted={index === highlightedIndex}
                        onSelect={() => runEntry(entry)}
                        onMouseEnter={() => setSelectedIndex(index)}>
                        {entry.kind === 'session' ? (
                          <SessionRow
                            session={entry.session}
                            segments={entry.segments}
                          />
                        ) : entry.kind === 'command' ? (
                          <CommandRow
                            command={entry.command}
                            segments={entry.segments}
                          />
                        ) : (
                          <HelpRow topic={entry.topic} />
                        )}
                      </CommandPaletteItem>
                    );
                  })}
                  {section.isSearchingRemote && (
                    <div style={styles.searchingRow}>
                      <HStack gap={2} vAlign="center">
                        <Spinner size="sm" shade="subtle" />
                        <Text type="supporting" color="secondary">
                          Searching remote sessions…
                        </Text>
                      </HStack>
                    </div>
                  )}
                </CommandPaletteGroup>
              ))
            )}
          </CommandPaletteList>
        </div>
        <Divider />
        <CommandPaletteFooter>
          <HStack gap={3} vAlign="center">
            <HStack gap={1} vAlign="center">
              <Kbd keys="up" />
              <Kbd keys="down" />
              <Text type="inherit">navigate</Text>
            </HStack>
            <HStack gap={1} vAlign="center">
              <Kbd keys="enter" />
              <Text type="inherit">select</Text>
            </HStack>
            <HStack gap={1} vAlign="center">
              <Kbd keys="escape" />
              <Text type="inherit">close</Text>
            </HStack>
            <StackItem size="fill" />
            {!isNarrow && (
              <>
                <HStack gap={1} vAlign="center">
                  <Kbd keys=":" />
                  <Text type="inherit">workspace</Text>
                </HStack>
                <HStack gap={1} vAlign="center">
                  <Kbd keys="/" />
                  <Text type="inherit">commands</Text>
                </HStack>
                <HStack gap={1} vAlign="center">
                  <Kbd keys="?" />
                  <Text type="inherit">help</Text>
                </HStack>
              </>
            )}
          </HStack>
        </CommandPaletteFooter>
      </Card>
    </div>
  );

  return (
    <div style={styles.root}>
      <div aria-live="polite" style={styles.visuallyHidden}>
        {announcement}
      </div>
      {isPaletteOpen ? (
        <Overlay
          isOpen
          scrim="dark"
          position="fill"
          align="start"
          style={styles.overlay}
          // The dark scrim flips the overlay layer into media-dark theming;
          // the palette should follow the page scheme, so re-anchor it.
          content={<MediaTheme mode={colorMode}>{palette}</MediaTheme>}>
          {workspacePage}
        </Overlay>
      ) : (
        workspacePage
      )}
    </div>
  );
}
`;export{e as default};