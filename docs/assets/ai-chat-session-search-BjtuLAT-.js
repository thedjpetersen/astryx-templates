var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (12 merged search hits with fixed ISO
 *   timestamps, role/status/sub-agent flags, a short background transcript —
 *   no clocks, no randomness, no network assets)
 * @output Chat history search overlay: a dimmed agent chat behind a dark
 *   scrim, with a centered ~640px search panel rendered open — query
 *   "deploy rollback" typed, a remote-merge Spinner in the input, a
 *   "Local + remote · merged N results" caption, status + role filter pill
 *   rows with live counts, an "Include sub-agent threads" CheckboxInput,
 *   result rows (role chip, accent-highlighted snippet match, archive glyph,
 *   relative time) with one keyboard-active row carrying a visible focus
 *   ring, a Kbd hint footer, and an empty-state specimen card below
 * @position Page template; emitted by \`astryx template ai-chat-session-search\`
 *
 * Frame: full-height background chat (Layout height="fill" + ChatLayout)
 * wrapped in an Overlay with a dark scrim while the search panel is open.
 * The panel is a Card pinned at ~14vh, re-anchored to the page color scheme
 * with MediaTheme (the dark scrim would otherwise flip it to media-dark).
 *
 * Interaction contract:
 * - Typing refilters results live (any query term matches title or snippet;
 *   snippet occurrences get the accent <mark> highlight) and resets the
 *   keyboard highlight to the first row.
 * - ArrowUp/ArrowDown move the keyboard-active ring (wrapping); Enter opens
 *   the row (announced via a visually-hidden aria-live region) and closes;
 *   Escape or a scrim click closes to reveal the chat; mod+K (and the
 *   header "Search history" button) reopens.
 * - Status pills (All/Active/Archived) and role pills (Both/Your prompts/
 *   Responses) filter the list; their counts recompute against the merged,
 *   query-matched pool. The sub-agent checkbox adds two "Agent task" rows.
 *
 * Responsive contract:
 * - Panel: 640px wide, capped at 100% minus a spacing-4 gutter; the result
 *   list scrolls internally beyond 44vh; filter pill rows wrap.
 * - The empty-state specimen card shares the 640px column below the panel.
 * - Background chat column: maxWidth 880, centered; header drops the
 *   sandbox caption via flex wrap naturally at narrow widths.
 */

import {useEffect, useMemo, useState, type CSSProperties} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {
  ChatLayout,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
  ChatMessageMetadata,
  ChatSystemMessage,
} from '@astryxdesign/core/Chat';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {
  CommandPaletteEmpty,
  CommandPaletteFooter,
  CommandPaletteInput,
  CommandPaletteItem,
  CommandPaletteList,
} from '@astryxdesign/core/CommandPalette';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {Overlay} from '@astryxdesign/core/Overlay';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {MediaTheme, useTheme} from '@astryxdesign/core/theme';
import {
  ArchiveIcon,
  BotIcon,
  MessageSquareTextIcon,
  MessagesSquareIcon,
  SearchIcon,
  SearchXIcon,
  SendIcon,
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
  // Panel column pinned at ~14vh; clicking the empty scrim area closes.
  overlayLayer: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    paddingTop: '14vh',
    paddingInline: 'var(--spacing-4)',
    boxSizing: 'border-box',
    overflowY: 'auto',
  },
  panelColumn: {
    width: 640,
    maxWidth: '100%',
    paddingBottom: 'var(--spacing-6)',
  },
  panelCard: {overflow: 'hidden'},
  filterBlock: {
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  // 10-11px uppercase tracking-wide section eyebrows (fixed width so the
  // two pill rows align into columns).
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    width: 44,
    flexShrink: 0,
  },
  pillRow: {flexWrap: 'wrap'},
  resultList: {
    maxHeight: '44vh',
    overflowY: 'auto',
    paddingBottom: 'var(--spacing-2)',
  },
  // Keyboard-active row: visible focus ring drawn inside the row bounds so
  // the list's overflow clipping never slices it.
  activeRing: {
    boxShadow: 'inset 0 0 0 2px var(--color-accent)',
    borderRadius: 'var(--radius-element)',
  },
  rowIcon: {marginTop: 'var(--spacing-0-5)'},
  rowTitleCell: {minWidth: 0},
  rowSnippetCell: {minWidth: 0},
  // Anchor the relative time to the title line of a two-line row.
  rowTimestamp: {marginTop: 'var(--spacing-0-5)', flexShrink: 0},
  // Accent-tinted <mark> highlight; inherits the snippet's text color.
  matchHighlight: {
    backgroundColor: 'var(--color-accent-muted)',
    color: 'inherit',
  },
  // 10px uppercase role chips prefixing each snippet line.
  chip: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    lineHeight: 1.6,
    paddingInline: 'var(--spacing-1)',
    borderRadius: 'var(--radius-element)',
    flexShrink: 0,
  },
  chipYou: {
    backgroundColor: 'var(--color-background-blue)',
    color: 'var(--color-text-blue)',
  },
  chipAssistant: {
    backgroundColor: 'var(--color-accent-muted)',
    color: 'var(--color-text-accent)',
  },
  chipSession: {
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  chipSubAgent: {
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  // Empty-state specimen shown below the live panel.
  specimenCard: {marginTop: 'var(--spacing-3)'},
  specimenBody: {paddingBlock: 'var(--spacing-4)'},
  // Background chat column (dimmed under the scrim while searching).
  chatColumn: {
    height: '100%',
    maxWidth: 880,
    marginInline: 'auto',
  },
  composerCard: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-3)',
    marginTop: 'var(--spacing-2)',
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
// Deterministic fixtures: fixed ISO timestamps, no clocks, no randomness.

const ASSISTANT_NAME = 'Relay Copilot';
const SESSION_TITLE = 'checkout-api canary rollback';
const SEEDED_QUERY = 'deploy rollback';

type ResultRole = 'you' | 'assistant' | 'session';
type ResultStatus = 'active' | 'archived';

interface SearchResult {
  id: string;
  title: string;
  role: ResultRole;
  status: ResultStatus;
  isSubAgent: boolean;
  /** Fixed ISO timestamp — rendered relatively via <Timestamp>. */
  timestamp: string;
  snippet: string;
}

const ROLE_ICON: Record<ResultRole, typeof BotIcon> = {
  you: MessageSquareTextIcon,
  assistant: BotIcon,
  session: MessagesSquareIcon,
};

const ROLE_CHIP: Record<ResultRole, {label: string; style: CSSProperties}> = {
  you: {label: 'you', style: styles.chipYou},
  assistant: {label: 'assistant', style: styles.chipAssistant},
  session: {label: 'session', style: styles.chipSession},
};

// Merged local + remote hits, already relevance-ordered. Every row matches
// the seeded query so the panel opens full; two sub-agent threads hide
// behind the checkbox, three rows are archived.
const RESULTS: SearchResult[] = [
  {
    id: 'sr-01',
    title: 'Roll back checkout-api canary',
    role: 'assistant',
    status: 'active',
    isSubAgent: false,
    timestamp: '2026-07-13T08:52:00',
    snippet:
      'Halted the deploy at 25% and started a rollback to build 4127 — error budget recovering.',
  },
  {
    id: 'sr-02',
    title: 'payments-api release train (week 28)',
    role: 'you',
    status: 'active',
    isSubAgent: false,
    timestamp: '2026-07-12T17:41:00',
    snippet:
      'can you deploy the hotfix branch to staging and prep a rollback script just in case',
  },
  {
    id: 'sr-03',
    title: 'deploy-rollback runbook rewrite',
    role: 'session',
    status: 'active',
    isSubAgent: false,
    timestamp: '2026-07-11T09:15:00',
    snippet:
      'Rewrote the deploy rollback runbook with staged canary gates and an abort checklist.',
  },
  {
    id: 'sr-04',
    title: 'Migrate cron jobs to scheduler v2',
    role: 'assistant',
    status: 'archived',
    isSubAgent: false,
    timestamp: '2026-07-08T14:03:00',
    snippet:
      'Second deploy attempt failed on the lock table; rollback completed in 90 seconds.',
  },
  {
    id: 'sr-05',
    title: 'Incident 4211 follow-ups',
    role: 'you',
    status: 'active',
    isSubAgent: false,
    timestamp: '2026-07-08T09:27:00',
    snippet:
      'list every service where rollback is still manual after a failed deploy',
  },
  {
    id: 'sr-06',
    title: 'Blue/green for search-indexer',
    role: 'assistant',
    status: 'active',
    isSubAgent: false,
    timestamp: '2026-07-06T15:48:00',
    snippet:
      'Blue/green removes the rollback step entirely — traffic flips back to green instantly.',
  },
  {
    id: 'sr-07',
    title: 'Agent task — verify rollback script',
    role: 'assistant',
    status: 'active',
    isSubAgent: true,
    timestamp: '2026-07-06T15:12:00',
    snippet:
      'Dry-ran rollback.sh against staging; exit 0, 14 resources reverted cleanly.',
  },
  {
    id: 'sr-08',
    title: 'checkout-service CI failure',
    role: 'session',
    status: 'active',
    isSubAgent: false,
    timestamp: '2026-07-01T14:10:00',
    snippet:
      'Diagnosed lockfile drift, pinned Node via .nvmrc, then reran the deploy job green.',
  },
  {
    id: 'sr-09',
    title: 'Q2 infra retro notes',
    role: 'you',
    status: 'archived',
    isSubAgent: false,
    timestamp: '2026-06-30T11:05:00',
    snippet:
      'why did the June 12 deploy sit half-reverted for an hour before anyone paged?',
  },
  {
    id: 'sr-10',
    title: 'Feature flags cleanup',
    role: 'you',
    status: 'active',
    isSubAgent: false,
    timestamp: '2026-06-27T16:33:00',
    snippet:
      'before we deploy, disable the legacy_cart flag everywhere it still reads true',
  },
  {
    id: 'sr-11',
    title: 'Postmortem draft: cart outage',
    role: 'assistant',
    status: 'archived',
    isSubAgent: false,
    timestamp: '2026-06-24T10:19:00',
    snippet:
      'Root cause: a deploy raced the schema migration; the rollback restored writes at 09:41.',
  },
  {
    id: 'sr-12',
    title: 'Agent task — canary watch',
    role: 'assistant',
    status: 'active',
    isSubAgent: true,
    timestamp: '2026-06-23T13:56:00',
    snippet:
      'Watching error budget through the deploy; will trigger rollback at 2% 5xx for 5 minutes.',
  },
];

type StatusFilter = 'all' | 'active' | 'archived';
type RoleFilter = 'both' | 'you' | 'assistant';

const STATUS_FILTERS: ReadonlyArray<{value: StatusFilter; label: string}> = [
  {value: 'all', label: 'All'},
  {value: 'active', label: 'Active'},
  {value: 'archived', label: 'Archived'},
];

const ROLE_FILTERS: ReadonlyArray<{value: RoleFilter; label: string}> = [
  {value: 'both', label: 'Both'},
  {value: 'you', label: 'Your prompts'},
  {value: 'assistant', label: 'Responses'},
];

// ============= MATCH HIGHLIGHTING =============

interface MatchSegment {
  text: string;
  isMatch: boolean;
}

/** Query terms: whitespace-split, lowercased, 2+ characters. */
function extractTerms(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\\s+/)
    .filter(term => term.length >= 2);
}

function resultMatches(result: SearchResult, terms: string[]): boolean {
  if (terms.length === 0) {
    return true;
  }
  const haystack = \`\${result.title} \${result.snippet}\`.toLowerCase();
  return terms.some(term => haystack.includes(term));
}

/**
 * Splits text into segments, marking every occurrence of every term.
 * Overlapping term ranges merge into one highlighted run.
 */
function highlightSegments(text: string, terms: string[]): MatchSegment[] {
  if (terms.length === 0) {
    return [{text, isMatch: false}];
  }
  const lower = text.toLowerCase();
  const marked = new Array<boolean>(text.length).fill(false);
  for (const term of terms) {
    let from = 0;
    let index = lower.indexOf(term, from);
    while (index >= 0) {
      for (let i = index; i < index + term.length; i++) {
        marked[i] = true;
      }
      from = index + term.length;
      index = lower.indexOf(term, from);
    }
  }
  const segments: MatchSegment[] = [];
  let run = text[0];
  let runIsMatch = marked[0];
  for (let i = 1; i < text.length; i++) {
    if (marked[i] === runIsMatch) {
      run += text[i];
    } else {
      segments.push({text: run, isMatch: runIsMatch});
      run = text[i];
      runIsMatch = marked[i];
    }
  }
  segments.push({text: run, isMatch: runIsMatch});
  return segments;
}

function HighlightedSnippet({segments}: {segments: MatchSegment[]}) {
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

// ============= RESULT ROW =============

function SearchResultRow({
  result,
  terms,
}: {
  result: SearchResult;
  terms: string[];
}) {
  const chip = ROLE_CHIP[result.role];
  return (
    <HStack gap={3} vAlign="start" width="100%">
      <Icon
        icon={ROLE_ICON[result.role]}
        size="sm"
        color="secondary"
        style={styles.rowIcon}
      />
      <StackItem size="fill" style={styles.rowTitleCell}>
        <VStack gap={0}>
          <HStack gap={2} vAlign="center">
            {result.status === 'archived' && (
              <Icon icon={ArchiveIcon} size="sm" color="secondary" />
            )}
            <StackItem size="fill" style={styles.rowTitleCell}>
              <Text type="body" maxLines={1}>
                {result.title}
              </Text>
            </StackItem>
            {result.isSubAgent && (
              <span style={{...styles.chip, ...styles.chipSubAgent}}>
                sub-agent
              </span>
            )}
          </HStack>
          <HStack gap={2} vAlign="center">
            <span style={{...styles.chip, ...chip.style}}>{chip.label}</span>
            <StackItem size="fill" style={styles.rowSnippetCell}>
              <Text type="supporting" color="secondary" maxLines={1}>
                <HighlightedSnippet
                  segments={highlightSegments(result.snippet, terms)}
                />
              </Text>
            </StackItem>
          </HStack>
        </VStack>
      </StackItem>
      <Timestamp
        value={result.timestamp}
        format="relative"
        type="supporting"
        color="secondary"
        style={styles.rowTimestamp}
      />
    </HStack>
  );
}

// ============= PAGE =============

export default function AiChatSessionSearchTemplate() {
  const [isSearchOpen, setIsSearchOpen] = useState(true);
  // Seeded mid-search: query typed, keyboard ring on the second row.
  const [query, setQuery] = useState(SEEDED_QUERY);
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('both');
  const [includeSubAgents, setIncludeSubAgents] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [draft, setDraft] = useState('');
  // Resolved page scheme — re-anchors the panel under the dark scrim.
  const {mode: colorMode} = useTheme();

  const terms = useMemo(() => extractTerms(query), [query]);

  // Merged pool: everything the local + remote search matched, before the
  // UI filters trim it. The caption counts this pool.
  const mergedResults = useMemo(
    () => RESULTS.filter(result => resultMatches(result, terms)),
    [terms],
  );

  const subAgentFiltered = useMemo(
    () =>
      mergedResults.filter(result => includeSubAgents || !result.isSubAgent),
    [mergedResults, includeSubAgents],
  );

  const statusCount = (value: StatusFilter) =>
    value === 'all'
      ? subAgentFiltered.length
      : subAgentFiltered.filter(result => result.status === value).length;

  const roleCount = (value: RoleFilter) =>
    value === 'both'
      ? subAgentFiltered.length
      : subAgentFiltered.filter(result => result.role === value).length;

  const visibleResults = useMemo(
    () =>
      subAgentFiltered.filter(
        result =>
          (statusFilter === 'all' || result.status === statusFilter) &&
          (roleFilter === 'both' || result.role === roleFilter),
      ),
    [subAgentFiltered, statusFilter, roleFilter],
  );

  // Derived clamp (no effect): filters can shrink the list under the index.
  const highlightedIndex = Math.min(
    Math.max(selectedIndex, 0),
    Math.max(visibleResults.length - 1, 0),
  );

  // mod+K toggles the search overlay from anywhere on the page.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsSearchOpen(previous => !previous);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openResult = (result: SearchResult) => {
    setAnnouncement(\`Opened "\${result.title}"\`);
    setIsSearchOpen(false);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (visibleResults.length === 0) {
        return;
      }
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setSelectedIndex(
        (highlightedIndex + step + visibleResults.length) %
          visibleResults.length,
      );
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const result = visibleResults[highlightedIndex];
      if (result) {
        openResult(result);
      }
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setIsSearchOpen(false);
    }
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(0);
  };

  // ----- Background chat (dimmed while the search panel is open) -----

  const composer = (
    <div style={styles.composerCard}>
      <VStack gap={2}>
        <TextArea
          label={\`Message \${ASSISTANT_NAME}\`}
          isLabelHidden
          rows={2}
          placeholder="Type a message…"
          value={draft}
          onChange={setDraft}
        />
        <HStack gap={2} vAlign="center">
          <Text type="supporting" color="secondary">
            Canary paused at 25% — rollback armed
          </Text>
          <StackItem size="fill" />
          <IconButton
            label="Send message"
            tooltip="Send"
            icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
            size="sm"
            onClick={() => setDraft('')}
          />
        </HStack>
      </VStack>
    </div>
  );

  const chatPage = (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>{SESSION_TITLE}</Heading>
                <StatusDot variant="accent" label="Agent running" isPulsing />
              </HStack>
            </StackItem>
            <Button
              label="Search chat history"
              variant="secondary"
              size="sm"
              icon={<Icon icon={SearchIcon} size="sm" />}
              endContent={<Kbd keys="mod+k" />}
              onClick={() => setIsSearchOpen(true)}>
              Search history
            </Button>
            <Avatar name="Priya Nair" size="small" />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0}>
          <div style={styles.chatColumn}>
            <ChatLayout composer={composer}>
              <ChatMessageList density="balanced">
                <ChatSystemMessage variant="divider">
                  Monday, July 13
                </ChatSystemMessage>
                <ChatMessage sender="user">
                  <ChatMessageBubble
                    metadata={
                      <ChatMessageMetadata
                        timestamp={
                          <Timestamp
                            value="2026-07-13T08:47:00"
                            format="time"
                          />
                        }
                      />
                    }>
                    The checkout-api canary is throwing 5xx again. Pause the
                    deploy and get a rollback ready — same play as the
                    payments incident.
                  </ChatMessageBubble>
                </ChatMessage>
                <ChatMessage
                  sender="assistant"
                  avatar={<Avatar name={ASSISTANT_NAME} size="small" />}>
                  <ChatMessageBubble name={ASSISTANT_NAME}>
                    Paused the canary at 25% and staged a rollback to build
                    4127. Before I pull the trigger — we handled a nearly
                    identical failure a few weeks ago; searching past sessions
                    for the abort checklist we wrote then.
                  </ChatMessageBubble>
                  <ChatMessageMetadata
                    timestamp={
                      <Timestamp value="2026-07-13T08:49:00" format="time" />
                    }
                  />
                </ChatMessage>
              </ChatMessageList>
            </ChatLayout>
          </div>
        </LayoutContent>
      }
    />
  );

  // ----- Foreground search panel, pinned at ~14vh over the scrim -----

  const searchPanel = (
    // Clicking the dimmed area (not the panel itself) closes.
    <div
      style={styles.overlayLayer}
      onClick={event => {
        if (event.target === event.currentTarget) {
          setIsSearchOpen(false);
        }
      }}>
      <div style={styles.panelColumn}>
        <Card
          padding={0}
          style={styles.panelCard}
          role="dialog"
          aria-label="Search chat history">
          <CommandPaletteInput
            value={query}
            onValueChange={handleQueryChange}
            placeholder="Search sessions and messages…"
            onKeyDown={handleInputKeyDown}
            endContent={
              <Spinner size="sm" aria-label="Searching remote sessions" />
            }
          />
          <Divider />
          <div style={styles.filterBlock}>
            <VStack gap={2}>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                Local + remote · merged {mergedResults.length} results
              </Text>
              <HStack gap={2} vAlign="center" style={styles.pillRow}>
                <span style={styles.eyebrow}>Status</span>
                {STATUS_FILTERS.map(filter => (
                  <ToggleButton
                    key={filter.value}
                    label={\`\${filter.label} · \${statusCount(filter.value)}\`}
                    size="sm"
                    isPressed={statusFilter === filter.value}
                    onPressedChange={() => setStatusFilter(filter.value)}
                  />
                ))}
              </HStack>
              <HStack gap={2} vAlign="center" style={styles.pillRow}>
                <span style={styles.eyebrow}>Role</span>
                {ROLE_FILTERS.map(filter => (
                  <ToggleButton
                    key={filter.value}
                    label={\`\${filter.label} · \${roleCount(filter.value)}\`}
                    size="sm"
                    isPressed={roleFilter === filter.value}
                    onPressedChange={() => setRoleFilter(filter.value)}
                  />
                ))}
                <StackItem size="fill" />
                <CheckboxInput
                  label="Include sub-agent threads"
                  size="sm"
                  value={includeSubAgents}
                  onChange={setIncludeSubAgents}
                />
              </HStack>
            </VStack>
          </div>
          <Divider />
          <CommandPaletteList label="Search results" style={styles.resultList}>
            {visibleResults.length === 0 ? (
              <CommandPaletteEmpty>
                No results for “{query.trim()}” with these filters.
              </CommandPaletteEmpty>
            ) : (
              visibleResults.map((result, index) => (
                <CommandPaletteItem
                  key={result.id}
                  value={result.id}
                  isHighlighted={index === highlightedIndex}
                  style={
                    index === highlightedIndex ? styles.activeRing : undefined
                  }
                  onSelect={() => openResult(result)}
                  onMouseEnter={() => setSelectedIndex(index)}>
                  <SearchResultRow result={result} terms={terms} />
                </CommandPaletteItem>
              ))
            )}
          </CommandPaletteList>
          <Divider />
          <CommandPaletteFooter>
            <HStack gap={3} vAlign="center">
              <HStack gap={1} vAlign="center">
                <Kbd keys="up" />
                <Kbd keys="down" />
                <Text type="inherit">to move</Text>
              </HStack>
              <HStack gap={1} vAlign="center">
                <Kbd keys="enter" />
                <Text type="inherit">to open</Text>
              </HStack>
              <HStack gap={1} vAlign="center">
                <Kbd keys="escape" />
                <Text type="inherit">to close</Text>
              </HStack>
              <StackItem size="fill" />
              <Text type="inherit" hasTabularNumbers>
                {visibleResults.length} shown
              </Text>
            </HStack>
          </CommandPaletteFooter>
        </Card>

        {/* Empty-state variant, rendered below as a specimen. */}
        <Card padding={0} style={styles.specimenCard}>
          <div style={styles.filterBlock}>
            <span style={styles.eyebrow}>Empty</span>
          </div>
          <Divider />
          <div style={styles.specimenBody}>
            <EmptyState
              isCompact
              icon={<Icon icon={SearchXIcon} size="lg" color="secondary" />}
              title='No results for "quarterly OKRs"'
              description="Nothing in local or remote sessions matched. Try fewer words, or clear the status and role filters."
              actions={
                <Button
                  label="Clear filters"
                  variant="secondary"
                  size="sm"
                  onClick={() => {}}
                />
              }
            />
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div style={styles.root}>
      <div aria-live="polite" style={styles.visuallyHidden}>
        {announcement}
      </div>
      {isSearchOpen ? (
        <Overlay
          isOpen
          scrim="dark"
          position="fill"
          align="start"
          style={styles.overlay}
          // The dark scrim flips the overlay layer into media-dark theming;
          // the panel should follow the page scheme, so re-anchor it.
          content={<MediaTheme mode={colorMode}>{searchPanel}</MediaTheme>}>
          {chatPage}
        </Overlay>
      ) : (
        chatPage
      )}
    </div>
  );
}
`;export{e as default};