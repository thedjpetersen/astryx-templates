var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Offline Sync Outbox — a mobile-first field-notes app framed
 *   beside its own sync internals: an optimistic-mutation outbox queue
 *   and a client-vs-server ledger.
 *
 * @input Deterministic fixtures only: five field notes seeded as the
 *   server truth, three mutations pre-queued from an earlier offline
 *   stretch, and an eight-entry SYNC_SCRIPT fixture array that scripts
 *   every drain outcome — ack, ack, retry, ack, conflict (with the
 *   server's competing field values), ack, reject (with the rejection
 *   reason), ack — cycled by drain tick. No Date.now, no Math.random,
 *   no network assets; op ids and log ids come from monotonic counters,
 *   and sync state is a pure function of (server notes, queue, tick).
 * @output A two-surface sync inspector: the center column holds a
 *   natively 375px-shaped app pane (the "Fieldbook" notes app with a
 *   connectivity strip, editable note rows, and a new-note composer)
 *   above an Outbox tray of pending mutation chips, each wearing a
 *   cloud-slash badge while offline. The header carries an
 *   airplane-mode Switch plus play / pause / step drain controls;
 *   reconnecting and playing drains one mutation per tick with per-op
 *   outcomes from the script. A conflict pauses playback and opens a
 *   resolver Dialog showing client-versus-server field diffs with
 *   keep-mine, take-server, and merge-per-field choices; a rejected op
 *   strikes through its chip, visibly rolls the optimistic edit back
 *   out of the app pane, and offers an undo-of-the-rollback Toast that
 *   re-enqueues the mutation. The end panel renders the mutation log
 *   as a two-column client-state / server-state ledger under a lag
 *   counter ("3 ops ahead of server").
 * @position Emitted by \`astryx template offline-sync-outbox\`. Choose
 *   over webhook-delivery-debugger when the subject is CLIENT-side
 *   optimistic state — an offline queue, rollback, and conflict
 *   resolution — rather than inspecting server-side deliveries after
 *   the fact; choose over a plain notes app when the sync machinery
 *   itself is the design surface.
 *
 * Frame: Layout height="fill". LayoutHeader carries the title, the lag
 * Badge, the airplane-mode Switch, and the play / pause / step drain
 * controls. LayoutContent centers a column holding the 375px phone
 * pane (app header strip, scrolling note list, composer) and the
 * Outbox chip tray beneath it. The ledger lives in a 360px end
 * LayoutPanel; center and ledger scroll independently.
 *
 * Responsive contract:
 * - >960px  — phone pane (375px) + Outbox tray in the center column,
 *   ledger in a fixed 360px end panel.
 * - <=960px — the end panel unmounts and the ledger stacks beneath
 *   the Outbox tray in the same scrolling column (app first, sync
 *   internals second), matching the mobile-first framing.
 * - Usable at 375px: the phone pane is min(375px, 100%), the header
 *   sheds its subtitle text, drain buttons and note-row controls grow
 *   to ~40px hit areas, chips wrap, and the ledger's two-column grid
 *   keeps two columns (client / server) since each cell is short.
 *   Nothing is hover-only — edit, resolve, undo, and drain are all
 *   click/tap buttons.
 *
 * Container policy (sync-inspector archetype): frame-first rows and
 * panels, zero Cards. The phone pane is one bordered surface with flat
 * note rows; the Outbox tray is a wrap-row of chip pills; the ledger
 * is a grid of flat two-column rows. Dialog is used once, for the
 * conflict resolver sheet.
 *
 * Color policy: token-pure. Every color is a \`var(--color-*)\` token,
 * a \`color-mix()\` over tokens, or an explicit \`light-dark()\` pair —
 * the pending-amber / acked-green / conflict-red status text colors
 * are light-dark() pairs so both schemes keep contrast on the tinted
 * chip surfaces. Motion (chip entry, head-chip pulse, reject strike)
 * is keyframe-based, gated by play state via animationPlayState, and
 * disabled entirely under prefers-reduced-motion.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Switch} from '@astryxdesign/core/Switch';
import {TextInput} from '@astryxdesign/core/TextInput';
import {useToast} from '@astryxdesign/core/Toast';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

import {
  CheckIcon,
  CloudIcon,
  CloudOffIcon,
  GitMergeIcon,
  NotebookPenIcon,
  PauseIcon,
  PencilLineIcon,
  PlaneIcon,
  PlayIcon,
  PlusIcon,
  StepForwardIcon,
  TriangleAlertIcon,
  Undo2Icon,
  WifiIcon,
  XIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// MOTION — chip entry, head-of-queue pulse while draining, and the reject
// strike-through. All three are disabled under prefers-reduced-motion; the
// pulse additionally freezes via animationPlayState when playback pauses.
// ---------------------------------------------------------------------------

const KEYFRAMES = \`
@keyframes oso-chip-in {
  0% { transform: translateY(6px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
@keyframes oso-syncing-pulse {
  0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-accent) 45%, transparent); }
  70% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--color-accent) 0%, transparent); }
  100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-accent) 0%, transparent); }
}
@keyframes oso-strike {
  0% { transform: scaleX(0); }
  100% { transform: scaleX(1); }
}\`;

// ---------------------------------------------------------------------------
// STATUS COLORS — pending amber / acked green / conflict red. Text colors
// are explicit light-dark() pairs (contrast on the tinted chip surfaces);
// fills and borders are color-mix() over semantic tokens.
// ---------------------------------------------------------------------------

type SyncTone = 'pending' | 'acked' | 'conflict' | 'retry' | 'rejected';

const TONE: Record<SyncTone, {fg: string; bg: string; border: string}> = {
  pending: {
    fg: 'light-dark(#7a5300, #f0c464)',
    bg: 'color-mix(in srgb, var(--color-warning) 12%, transparent)',
    border: 'color-mix(in srgb, var(--color-warning) 45%, transparent)',
  },
  acked: {
    fg: 'light-dark(#116329, #7ee2a8)',
    bg: 'color-mix(in srgb, var(--color-success) 12%, transparent)',
    border: 'color-mix(in srgb, var(--color-success) 45%, transparent)',
  },
  conflict: {
    fg: 'light-dark(#a40e26, #ff8f9e)',
    bg: 'color-mix(in srgb, var(--color-error) 12%, transparent)',
    border: 'color-mix(in srgb, var(--color-error) 55%, transparent)',
  },
  retry: {
    fg: 'light-dark(#7a5300, #f0c464)',
    bg: 'color-mix(in srgb, var(--color-warning) 8%, transparent)',
    border: 'color-mix(in srgb, var(--color-warning) 35%, transparent)',
  },
  rejected: {
    fg: 'light-dark(#a40e26, #ff8f9e)',
    bg: 'color-mix(in srgb, var(--color-error) 8%, transparent)',
    border: 'color-mix(in srgb, var(--color-error) 40%, transparent)',
  },
};

const MONO_FONT =
  "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  centerColumn: {
    maxWidth: 720,
    marginInline: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  // The app pane is natively phone-shaped: mobile is the default framing.
  phone: {
    width: 'min(375px, 100%)',
    marginInline: 'auto',
    border: '1px solid var(--color-border)',
    borderRadius: 20,
    background: 'var(--color-background-body)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  phoneHeader: {
    padding: 'var(--spacing-3)',
    borderBottom: '1px solid var(--color-border)',
    background: 'var(--color-background-muted)',
  },
  // Connectivity strip inside the app: offline amber, online green.
  connectivityOffline: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-1) var(--spacing-3)',
    background: TONE.pending.bg,
    borderBottom: \`1px solid \${TONE.pending.border}\`,
    color: TONE.pending.fg,
    fontSize: 12,
    minHeight: 28,
  },
  connectivityOnline: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-1) var(--spacing-3)',
    background: TONE.acked.bg,
    borderBottom: \`1px solid \${TONE.acked.border}\`,
    color: TONE.acked.fg,
    fontSize: 12,
    minHeight: 28,
  },
  noteRow: {
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  noteRowDirty: {
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    background: 'color-mix(in srgb, var(--color-warning) 5%, transparent)',
  },
  // Cloud-slash mini badge on rows with queued (unsynced) edits.
  dirtyBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '1px 8px',
    borderRadius: 999,
    border: \`1px solid \${TONE.pending.border}\`,
    background: TONE.pending.bg,
    color: TONE.pending.fg,
    fontSize: 11,
    whiteSpace: 'nowrap',
  },
  composer: {
    padding: 'var(--spacing-3)',
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-muted)',
  },
  // Outbox tray: wrap-row of mutation chip pills.
  tray: {
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: 'var(--spacing-3)',
    background: 'var(--color-background-muted)',
  },
  chipsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
    alignItems: 'center',
  },
  chip: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    minHeight: 32,
    padding: '4px 12px',
    borderRadius: 999,
    fontSize: 12,
    fontFamily: MONO_FONT,
    whiteSpace: 'nowrap',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  chipLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 220,
  },
  // Reject rollback: a strike line grows across the chip before removal.
  strikeLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: '50%',
    height: 2,
    background: 'var(--color-error)',
    transformOrigin: 'left center',
  },
  chipResolveButton: {
    minHeight: 24,
    padding: '2px 8px',
    borderRadius: 999,
    border: \`1px solid \${TONE.conflict.border}\`,
    background: 'transparent',
    color: TONE.conflict.fg,
    fontSize: 11,
    cursor: 'pointer',
  },
  // Ledger: two-column client-state / server-state grid rows.
  ledgerPane: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  ledgerScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  ledgerHeaderBlock: {
    padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-2)',
  },
  lagCounter: {
    fontVariantNumeric: 'tabular-nums',
  },
  ledgerRow: {
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    padding: 'var(--spacing-2)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
  },
  ledgerGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--spacing-1)',
  },
  ledgerCell: {
    borderRadius: 6,
    padding: '4px 8px',
    background: 'var(--color-background-muted)',
    fontFamily: MONO_FONT,
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    overflowWrap: 'anywhere',
  },
  ledgerCellLive: {
    borderRadius: 6,
    padding: '4px 8px',
    background: 'color-mix(in srgb, var(--color-accent) 8%, transparent)',
    fontFamily: MONO_FONT,
    fontSize: 11,
    color: 'var(--color-text-primary)',
    overflowWrap: 'anywhere',
  },
  tick: {
    fontFamily: MONO_FONT,
    fontSize: 11,
    color: 'var(--color-text-secondary)',
  },
  // Stacked (<=960px) ledger surface beneath the tray.
  stackedLedger: {
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  // Conflict resolver: mine / server value boxes per field.
  diffBox: {
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    padding: 'var(--spacing-2)',
    fontFamily: MONO_FONT,
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    overflowWrap: 'anywhere',
  },
  diffBoxChosen: {
    border: '1px solid var(--color-accent)',
    borderRadius: 8,
    padding: 'var(--spacing-2)',
    background: 'color-mix(in srgb, var(--color-accent) 8%, transparent)',
    fontFamily: MONO_FONT,
    fontSize: 12,
    color: 'var(--color-text-primary)',
    overflowWrap: 'anywhere',
  },
  diffGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--spacing-2)',
  },
  // ~40px touch targets in compact mode (size="sm" renders 28px).
  buttonTapTarget: {height: 40},
  iconTapTarget: {width: 40, height: 40},
  headerTitle: {minWidth: 0},
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

// ---------------------------------------------------------------------------
// DATA MODEL + FIXTURES — deterministic only. The app is "Fieldbook", a
// ranger's site-survey notes app. Server truth is NOTES_SEED; three ops are
// already queued from an earlier offline stretch; every drain outcome is
// scripted in SYNC_SCRIPT and cycled by drain tick.
// ---------------------------------------------------------------------------

type NoteStatus = 'draft' | 'review' | 'final';
type FieldKey = 'title' | 'body' | 'status';

interface Note {
  id: string;
  title: string;
  body: string;
  status: NoteStatus;
}

/** Partial note patch — the payload of an update mutation. */
interface FieldPatch {
  title?: string;
  body?: string;
  status?: NoteStatus;
}

type OpStatus = 'pending' | 'conflict' | 'rejected';

interface Mutation {
  id: string;
  kind: 'update' | 'create';
  noteId: string;
  /** Short human label for the chip and ledger ('status → review'). */
  label: string;
  /** Note title at enqueue time, for chips and the resolver subtitle. */
  noteTitle: string;
  fields: FieldPatch;
  /** Present only for kind 'create'. */
  note?: Note;
  attempts: number;
  status: OpStatus;
  /** Server's competing values for the op's fields (conflict only). */
  conflictServer?: FieldPatch;
  reason?: string;
}

type Outcome = 'ack' | 'retry' | 'conflict' | 'reject' | 'resolved';

interface LogEntry {
  id: string;
  tick: number;
  outcome: Outcome;
  opLabel: string;
  noteTitle: string;
  clientValue: string;
  serverValue: string;
  reason?: string;
}

type ScriptRule =
  | {outcome: 'ack'}
  | {outcome: 'retry'; reason: string}
  | {outcome: 'conflict'; server: FieldPatch; reason: string}
  | {outcome: 'reject'; reason: string};

const NOTES_SEED: Note[] = [
  {
    id: 'n1',
    title: 'Creek gauge #4',
    body: 'Flow 2.3 cfs; silt building on the lower weir plate.',
    status: 'review',
  },
  {
    id: 'n2',
    title: 'Bridge deck — mile 7',
    body: 'Hairline cracks on the north joist; photo set 12 attached.',
    status: 'draft',
  },
  {
    id: 'n3',
    title: 'Osprey nest platform',
    body: 'Two chicks visible; guano heavy on the camera dome.',
    status: 'final',
  },
  {
    id: 'n4',
    title: 'Trailhead kiosk',
    body: 'Map panel faded; QR plate missing two screws.',
    status: 'draft',
  },
  {
    id: 'n5',
    title: 'Culvert 19',
    body: 'Debris rack 40% blocked after the storm cell.',
    status: 'review',
  },
];

/** Ops queued during the earlier offline stretch (already optimistic). */
const INITIAL_QUEUE: Mutation[] = [
  {
    id: 'op-1',
    kind: 'update',
    noteId: 'n2',
    label: 'status → review',
    noteTitle: 'Bridge deck — mile 7',
    fields: {status: 'review'},
    attempts: 0,
    status: 'pending',
  },
  {
    id: 'op-2',
    kind: 'update',
    noteId: 'n1',
    label: 'body updated',
    noteTitle: 'Creek gauge #4',
    fields: {
      body: 'Flow 2.1 cfs after gate adjust; weir plate cleared of silt.',
    },
    attempts: 0,
    status: 'pending',
  },
  {
    id: 'op-3',
    kind: 'update',
    noteId: 'n4',
    label: 'title → "Trailhead kiosk (north lot)"',
    noteTitle: 'Trailhead kiosk',
    fields: {title: 'Trailhead kiosk (north lot)'},
    attempts: 0,
    status: 'pending',
  },
];

/**
 * The whole drama, scripted: the Nth drained op takes SYNC_SCRIPT[N % 8].
 * Conflicts carry the server's competing values; rejects carry the reason.
 * (A scripted conflict landing on a create op downgrades to an ack — a
 * brand-new note has no server copy to conflict with.)
 */
const SYNC_SCRIPT: ScriptRule[] = [
  {outcome: 'ack'},
  {outcome: 'ack'},
  {outcome: 'retry', reason: 'HTTP 503 from sync API — backed off, requeued'},
  {outcome: 'ack'},
  {
    outcome: 'conflict',
    server: {status: 'final'},
    reason: 'Server version changed while this edit was queued',
  },
  {outcome: 'ack'},
  {
    outcome: 'reject',
    reason: 'Validation failed — workflow forbids this transition',
  },
  {outcome: 'ack'},
];

/** Drain cadence while playing; pause clears the interval entirely. */
const DRAIN_TICK_MS = 1100;
/** Fixed-length strike-through beat before a rejected op is swept. */
const REJECT_SWEEP_MS = 900;

const STATUS_OPTIONS: Array<{value: NoteStatus; label: string}> = [
  {value: 'draft', label: 'Draft'},
  {value: 'review', label: 'Review'},
  {value: 'final', label: 'Final'},
];

// ---------------------------------------------------------------------------
// PURE HELPERS
// ---------------------------------------------------------------------------

/** Apply one mutation to a note array (create appends, update patches). */
function applyOp(notes: Note[], op: Mutation): Note[] {
  if (op.kind === 'create' && op.note !== undefined) {
    const note = op.note;
    return notes.some(entry => entry.id === note.id)
      ? notes
      : [...notes, note];
  }
  return notes.map(note =>
    note.id === op.noteId ? {...note, ...op.fields} : note,
  );
}

/** Apply a bare field patch to one note. */
function applyPatch(notes: Note[], noteId: string, patch: FieldPatch): Note[] {
  return notes.map(note =>
    note.id === noteId ? {...note, ...patch} : note,
  );
}

/**
 * Optimistic client state = server truth + every live queued op, in
 * order. Rejected ops are skipped, which is exactly what makes the
 * rollback visible the instant an op is marked rejected.
 */
function deriveClientNotes(server: Note[], queue: Mutation[]): Note[] {
  let notes = server;
  for (const op of queue) {
    if (op.status !== 'rejected') {
      notes = applyOp(notes, op);
    }
  }
  return notes;
}

/** 'status: review · body: "Flow 2.1 cfs…"' — short ledger cell text. */
function patchSummary(patch: FieldPatch): string {
  const parts: string[] = [];
  if (patch.title !== undefined) {
    parts.push(\`title: "\${truncate(patch.title, 26)}"\`);
  }
  if (patch.status !== undefined) {
    parts.push(\`status: \${patch.status}\`);
  }
  if (patch.body !== undefined) {
    parts.push(\`body: "\${truncate(patch.body, 26)}"\`);
  }
  return parts.length === 0 ? '—' : parts.join(' · ');
}

function truncate(value: string, max: number): string {
  return value.length > max ? \`\${value.slice(0, max - 1)}…\` : value;
}

/** The server's current values for exactly the fields an op touches. */
function serverValuesFor(
  server: Note[],
  op: Mutation,
): FieldPatch | undefined {
  const note = server.find(entry => entry.id === op.noteId);
  if (note === undefined) {
    return undefined;
  }
  const values: FieldPatch = {};
  if (op.fields.title !== undefined) {
    values.title = note.title;
  }
  if (op.fields.status !== undefined) {
    values.status = note.status;
  }
  if (op.fields.body !== undefined) {
    values.body = note.body;
  }
  return values;
}

/**
 * Build the server's competing values for a scripted conflict. The rule
 * supplies preferred values; any field where the rule matches the client's
 * own value (or supplies none) falls back to a deterministic alternate so
 * the resolver always has a real diff to show.
 */
function buildConflictServer(
  op: Mutation,
  current: Note,
  rule: Extract<ScriptRule, {outcome: 'conflict'}>,
): FieldPatch {
  const server: FieldPatch = {};
  if (op.fields.status !== undefined) {
    const preferred = rule.server.status ?? 'final';
    server.status =
      preferred === op.fields.status
        ? preferred === 'final'
          ? 'review'
          : 'final'
        : preferred;
  }
  if (op.fields.title !== undefined) {
    const preferred = rule.server.title ?? \`\${current.title} (site lead edit)\`;
    server.title =
      preferred === op.fields.title ? \`\${preferred} — server copy\` : preferred;
  }
  if (op.fields.body !== undefined) {
    const preferred =
      rule.server.body ?? \`\${current.body} Re-verified by the site lead.\`;
    server.body =
      preferred === op.fields.body ? \`\${preferred} (server)\` : preferred;
  }
  return server;
}

const OUTCOME_META: Record<
  Outcome,
  {label: string; tone: SyncTone}
> = {
  ack: {label: 'acked', tone: 'acked'},
  retry: {label: 'retry', tone: 'retry'},
  conflict: {label: 'conflict', tone: 'conflict'},
  reject: {label: 'rejected', tone: 'rejected'},
  resolved: {label: 'resolved', tone: 'acked'},
};

const FIELD_LABEL: Record<FieldKey, string> = {
  title: 'Title',
  body: 'Body',
  status: 'Status',
};

function fieldsOf(patch: FieldPatch): FieldKey[] {
  const keys: FieldKey[] = [];
  if (patch.title !== undefined) {
    keys.push('title');
  }
  if (patch.status !== undefined) {
    keys.push('status');
  }
  if (patch.body !== undefined) {
    keys.push('body');
  }
  return keys;
}

function fieldValue(patch: FieldPatch, key: FieldKey): string {
  const value = patch[key];
  return value === undefined ? '—' : value;
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function OfflineSyncOutboxTemplate() {
  const toast = useToast();

  // Connectivity + playback. Airplane mode ON = offline (the app opens
  // offline, mid-stretch, with three ops already queued).
  const [isOffline, setIsOffline] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // Server truth, the outbox queue, and the drained-op counter (the tick
  // that indexes SYNC_SCRIPT — all sync state is a pure function of these).
  const [serverNotes, setServerNotes] = useState<Note[]>(NOTES_SEED);
  const [queue, setQueue] = useState<Mutation[]>(INITIAL_QUEUE);
  const [drainCount, setDrainCount] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);

  // Phone-pane editing state.
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState('');
  const [composerDraft, setComposerDraft] = useState('');

  // Conflict resolver sheet.
  const [resolverOpId, setResolverOpId] = useState<string | null>(null);
  const [resolverChoices, setResolverChoices] = useState<
    Record<string, 'mine' | 'server'>
  >({});

  const [announcement, setAnnouncement] = useState('');

  // Monotonic counters — deterministic ids, no clocks or randomness.
  const opSeqRef = useRef(4);
  const noteSeqRef = useRef(6);
  const logSeqRef = useRef(1);
  const sweepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (sweepTimerRef.current !== null) {
        clearTimeout(sweepTimerRef.current);
      }
    },
    [],
  );

  // Responsive contract (see header): ledger stacks beneath the tray at
  // <=960px; controls grow to ~40px hit areas at <=640px.
  const isStacked = useMediaQuery('(max-width: 960px)');
  const isCompact = useMediaQuery('(max-width: 640px)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const isOnline = !isOffline;

  // ---- derived state (client view is a pure function of server + queue) --

  const clientNotes = useMemo(
    () => deriveClientNotes(serverNotes, queue),
    [serverNotes, queue],
  );

  const liveOps = queue.filter(op => op.status !== 'rejected');
  const lag = liveOps.length;
  const conflictCount = queue.filter(op => op.status === 'conflict').length;
  const headPendingId = queue.find(op => op.status === 'pending')?.id ?? null;
  const dirtyNoteIds = useMemo(() => {
    const ids = new Set<string>();
    for (const op of liveOps) {
      ids.add(op.noteId);
    }
    return ids;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue]);

  const resolverOp = queue.find(op => op.id === resolverOpId) ?? null;

  // ---- log + toast helpers ----

  const pushLog = (
    tick: number,
    outcome: Outcome,
    op: Mutation,
    clientValue: string,
    serverValue: string,
    reason?: string,
  ) => {
    const entry: LogEntry = {
      id: \`log-\${logSeqRef.current}\`,
      tick,
      outcome,
      opLabel: op.label,
      noteTitle: op.noteTitle,
      clientValue,
      serverValue,
      reason,
    };
    logSeqRef.current += 1;
    setLog(prev => [entry, ...prev]);
  };

  const showUndoToast = (body: string, onUndo: () => void) => {
    let dismiss: (() => void) | undefined;
    dismiss = toast({
      body,
      endContent: (
        <Button
          label="Undo"
          size="sm"
          variant="secondary"
          icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
          onClick={() => {
            onUndo();
            dismiss?.();
          }}
        />
      ),
    });
  };

  // ---- enqueue (the optimistic write path) ----

  const enqueue = (op: Omit<Mutation, 'id' | 'attempts' | 'status'>) => {
    const id = \`op-\${opSeqRef.current}\`;
    opSeqRef.current += 1;
    setQueue(prev => [...prev, {...op, id, attempts: 0, status: 'pending'}]);
    setAnnouncement(
      \`\${op.noteTitle}: \${op.label} applied locally and queued for sync\`,
    );
  };

  const setNoteStatus = (note: Note, status: NoteStatus) => {
    if (note.status === status) {
      return;
    }
    enqueue({
      kind: 'update',
      noteId: note.id,
      label: \`status → \${status}\`,
      noteTitle: note.title,
      fields: {status},
    });
  };

  const startTitleEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setTitleDraft(note.title);
  };

  const commitTitleEdit = (note: Note) => {
    const next = titleDraft.trim();
    setEditingNoteId(null);
    if (next === '' || next === note.title) {
      return;
    }
    enqueue({
      kind: 'update',
      noteId: note.id,
      label: \`title → "\${truncate(next, 22)}"\`,
      noteTitle: note.title,
      fields: {title: next},
    });
  };

  const addNote = () => {
    const title = composerDraft.trim();
    if (title === '') {
      return;
    }
    const noteId = \`n\${noteSeqRef.current}\`;
    noteSeqRef.current += 1;
    const note: Note = {
      id: noteId,
      title,
      body: 'Logged in the field — details to follow.',
      status: 'draft',
    };
    setComposerDraft('');
    enqueue({
      kind: 'create',
      noteId,
      label: 'create note',
      noteTitle: title,
      fields: {title, status: 'draft'},
      note,
    });
  };

  // ---- the drain engine: one scripted outcome per tick ----

  const step = () => {
    const opIndex = queue.findIndex(entry => entry.status === 'pending');
    if (opIndex === -1) {
      setIsPlaying(false);
      if (conflictCount > 0) {
        setAnnouncement('Drain paused — resolve the conflicted op to finish');
      } else if (lag === 0) {
        setAnnouncement('Outbox drained — client and server are in sync');
        toast({body: 'Outbox drained — client and server are in sync'});
      }
      return;
    }
    const op = queue[opIndex];
    const tick = drainCount + 1;
    let rule = SYNC_SCRIPT[drainCount % SYNC_SCRIPT.length];
    // A create op has no server copy to conflict with; downgrade to ack so
    // the script stays meaningful regardless of what the user queued.
    if (rule.outcome === 'conflict' && op.kind === 'create') {
      rule = {outcome: 'ack'};
    }
    setDrainCount(tick);

    if (rule.outcome === 'ack') {
      const nextServer = applyOp(serverNotes, op);
      setServerNotes(nextServer);
      setQueue(prev => prev.filter(entry => entry.id !== op.id));
      pushLog(
        tick,
        'ack',
        op,
        patchSummary(op.fields),
        patchSummary(op.fields),
      );
      setAnnouncement(\`\${op.noteTitle}: \${op.label} acknowledged by server\`);
      return;
    }

    if (rule.outcome === 'retry') {
      const reason = rule.reason;
      setQueue(prev => {
        const retried = prev.find(entry => entry.id === op.id);
        if (retried === undefined) {
          return prev;
        }
        const rest = prev.filter(entry => entry.id !== op.id);
        return [...rest, {...retried, attempts: retried.attempts + 1}];
      });
      pushLog(
        tick,
        'retry',
        op,
        patchSummary(op.fields),
        patchSummary(serverValuesFor(serverNotes, op) ?? {}),
        reason,
      );
      setAnnouncement(\`\${op.noteTitle}: \${op.label} — \${reason}\`);
      return;
    }

    if (rule.outcome === 'conflict') {
      const current = serverNotes.find(entry => entry.id === op.noteId);
      if (current === undefined) {
        return;
      }
      const serverSide = buildConflictServer(op, current, rule);
      // The server moved on while this op was queued: its competing values
      // land in server truth NOW, so the ledger shows a real divergence.
      setServerNotes(prev => applyPatch(prev, op.noteId, serverSide));
      setQueue(prev =>
        prev.map(entry =>
          entry.id === op.id
            ? {
                ...entry,
                status: 'conflict',
                conflictServer: serverSide,
                reason: rule.reason,
              }
            : entry,
        ),
      );
      pushLog(
        tick,
        'conflict',
        op,
        patchSummary(op.fields),
        patchSummary(serverSide),
        rule.reason,
      );
      // Open the resolver sheet and pause so the drain never races it.
      setIsPlaying(false);
      const choices: Record<string, 'mine' | 'server'> = {};
      for (const key of fieldsOf(op.fields)) {
        choices[key] = 'mine';
      }
      setResolverChoices(choices);
      setResolverOpId(op.id);
      setAnnouncement(
        \`\${op.noteTitle}: \${op.label} conflicts with a server edit — resolver opened\`,
      );
      return;
    }

    // reject: strike the chip, roll the optimistic edit back, offer undo.
    const reason = rule.reason;
    setQueue(prev =>
      prev.map(entry =>
        entry.id === op.id ? {...entry, status: 'rejected', reason} : entry,
      ),
    );
    pushLog(
      tick,
      'reject',
      op,
      'rolled back',
      patchSummary(serverValuesFor(serverNotes, op) ?? {}),
      reason,
    );
    setAnnouncement(
      \`\${op.noteTitle}: \${op.label} rejected — change rolled back\`,
    );
    if (sweepTimerRef.current !== null) {
      clearTimeout(sweepTimerRef.current);
    }
    // Fixed-length beat (not a clock read): the strike-through plays, then
    // the chip is swept and the undo-of-the-rollback toast appears.
    sweepTimerRef.current = setTimeout(
      () => {
        setQueue(prev => prev.filter(entry => entry.id !== op.id));
        showUndoToast(
          \`Rolled back "\${op.label}" on \${op.noteTitle} — \${reason}\`,
          () => {
            const id = \`op-\${opSeqRef.current}\`;
            opSeqRef.current += 1;
            setQueue(prev => [
              ...prev,
              {...op, id, attempts: 0, status: 'pending', reason: undefined},
            ]);
            setAnnouncement(
              \`\${op.noteTitle}: \${op.label} restored and re-queued\`,
            );
          },
        );
      },
      reducedMotion ? 0 : REJECT_SWEEP_MS,
    );
  };

  // Playback cadence only; every outcome comes from the fixture script.
  const stepRef = useRef(step);
  stepRef.current = step;
  useEffect(() => {
    if (!isPlaying || isOffline) {
      return undefined;
    }
    const timer = setInterval(() => stepRef.current(), DRAIN_TICK_MS);
    return () => clearInterval(timer);
  }, [isPlaying, isOffline]);

  const toggleAirplane = (offline: boolean) => {
    setIsOffline(offline);
    if (offline) {
      setIsPlaying(false);
      setAnnouncement('Airplane mode on — edits keep applying locally');
    } else {
      setAnnouncement(
        lag > 0
          ? \`Reconnected — \${lag} queued op\${lag === 1 ? '' : 's'} ready to sync\`
          : 'Reconnected — nothing queued',
      );
    }
  };

  // ---- conflict resolution ----

  const resolveConflict = (
    op: Mutation,
    choices: Record<string, 'mine' | 'server'>,
  ) => {
    const minePatch: FieldPatch = {};
    for (const key of fieldsOf(op.fields)) {
      if (choices[key] === 'mine') {
        minePatch[key] = op.fields[key] as never;
      }
    }
    const mineKeys = fieldsOf(minePatch);
    if (mineKeys.length > 0) {
      setServerNotes(prev => applyPatch(prev, op.noteId, minePatch));
    }
    setQueue(prev => prev.filter(entry => entry.id !== op.id));
    setResolverOpId(null);
    const allKeys = fieldsOf(op.fields);
    const summary =
      mineKeys.length === allKeys.length
        ? 'kept mine'
        : mineKeys.length === 0
          ? 'took server'
          : \`merged (\${mineKeys.join(', ')} mine)\`;
    const finalPatch: FieldPatch = {...(op.conflictServer ?? {}), ...minePatch};
    pushLog(
      drainCount,
      'resolved',
      op,
      patchSummary(finalPatch),
      patchSummary(finalPatch),
      \`Conflict resolved — \${summary}\`,
    );
    toast({body: \`Conflict resolved — \${summary}\`});
    setAnnouncement(\`\${op.noteTitle}: conflict resolved — \${summary}\`);
  };

  const keepMine = (op: Mutation) => {
    const choices: Record<string, 'mine' | 'server'> = {};
    for (const key of fieldsOf(op.fields)) {
      choices[key] = 'mine';
    }
    resolveConflict(op, choices);
  };

  const takeServer = (op: Mutation) => {
    const choices: Record<string, 'mine' | 'server'> = {};
    for (const key of fieldsOf(op.fields)) {
      choices[key] = 'server';
    }
    resolveConflict(op, choices);
  };

  const openResolver = (op: Mutation) => {
    const choices: Record<string, 'mine' | 'server'> = {};
    for (const key of fieldsOf(op.fields)) {
      choices[key] = 'mine';
    }
    setResolverChoices(choices);
    setResolverOpId(op.id);
  };

  // ---- phone pane (the Fieldbook app, natively 375px) ----

  const renderNoteRow = (note: Note, index: number) => {
    const isDirty = dirtyNoteIds.has(note.id);
    const isEditing = editingNoteId === note.id;
    return (
      <div key={note.id}>
        {index > 0 && <Divider />}
        <div style={isDirty ? styles.noteRowDirty : styles.noteRow}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill" style={styles.headerTitle}>
              {isEditing ? (
                <TextInput
                  label={\`Edit title for \${note.title}\`}
                  isLabelHidden
                  size="sm"
                  value={titleDraft}
                  onChange={setTitleDraft}
                  onEnter={() => commitTitleEdit(note)}
                />
              ) : (
                <HStack gap={2} vAlign="center">
                  <Text type="body" weight="semibold" maxLines={1}>
                    {note.title}
                  </Text>
                  {isDirty && (
                    <Tooltip content="Queued locally — not on the server yet">
                      <span style={styles.dirtyBadge}>
                        <Icon icon={CloudOffIcon} size="xsm" color="inherit" />
                        queued
                      </span>
                    </Tooltip>
                  )}
                </HStack>
              )}
            </StackItem>
            {isEditing ? (
              <HStack gap={1} vAlign="center">
                <IconButton
                  label="Save title"
                  tooltip="Save title"
                  size="sm"
                  variant="primary"
                  style={isCompact ? styles.iconTapTarget : undefined}
                  icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
                  onClick={() => commitTitleEdit(note)}
                />
                <IconButton
                  label="Cancel title edit"
                  tooltip="Cancel"
                  size="sm"
                  variant="ghost"
                  style={isCompact ? styles.iconTapTarget : undefined}
                  icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                  onClick={() => setEditingNoteId(null)}
                />
              </HStack>
            ) : (
              <IconButton
                label={\`Rename \${note.title}\`}
                tooltip="Rename note"
                size="sm"
                variant="ghost"
                style={isCompact ? styles.iconTapTarget : undefined}
                icon={<Icon icon={PencilLineIcon} size="sm" color="inherit" />}
                onClick={() => startTitleEdit(note)}
              />
            )}
          </HStack>
          <Text type="supporting" color="secondary" maxLines={2}>
            {note.body}
          </Text>
          <Selector
            label={\`Status for \${note.title}\`}
            isLabelHidden
            size="sm"
            options={STATUS_OPTIONS.map(option => ({
              value: option.value,
              label: option.label,
            }))}
            value={note.status}
            onChange={value => setNoteStatus(note, value as NoteStatus)}
            style={isCompact ? styles.buttonTapTarget : undefined}
          />
        </div>
      </div>
    );
  };

  const phonePane = (
    <section aria-label="Fieldbook app (client state)" style={styles.phone}>
      <div style={styles.phoneHeader}>
        <HStack gap={2} vAlign="center">
          <Icon icon={NotebookPenIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Heading level={4} accessibilityLevel={2}>
              Fieldbook
            </Heading>
          </StackItem>
          <Badge
            label={\`\${clientNotes.length} notes\`}
            variant="neutral"
          />
        </HStack>
      </div>
      <div
        style={isOffline ? styles.connectivityOffline : styles.connectivityOnline}
        role="status">
        <Icon
          icon={isOffline ? CloudOffIcon : WifiIcon}
          size="xsm"
          color="inherit"
        />
        {isOffline
          ? 'Offline — edits apply instantly and queue in the outbox'
          : lag > 0
            ? \`Online — \${lag} queued op\${lag === 1 ? '' : 's'} waiting to sync\`
            : 'Online — everything synced'}
      </div>
      <div>{clientNotes.map(renderNoteRow)}</div>
      <div style={styles.composer}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <TextInput
              label="New field note title"
              isLabelHidden
              placeholder="New field note…"
              size="sm"
              value={composerDraft}
              onChange={setComposerDraft}
              onEnter={addNote}
            />
          </StackItem>
          <Button
            label="Add"
            size="sm"
            variant="primary"
            style={isCompact ? styles.buttonTapTarget : undefined}
            icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
            isDisabled={composerDraft.trim() === ''}
            onClick={addNote}
          />
        </HStack>
      </div>
    </section>
  );

  // ---- outbox tray: the queue as chips, drain animated + play-gated ----

  const chipToneOf = (op: Mutation): SyncTone => {
    if (op.status === 'conflict') {
      return 'conflict';
    }
    if (op.status === 'rejected') {
      return 'rejected';
    }
    return op.attempts > 0 ? 'retry' : 'pending';
  };

  const renderChip = (op: Mutation, index: number) => {
    const tone = TONE[chipToneOf(op)];
    const isHead = op.id === headPendingId;
    const isSyncing = isHead && isPlaying && isOnline;
    const chipStyle: CSSProperties = {
      ...styles.chip,
      background: tone.bg,
      border: \`1px solid \${tone.border}\`,
      color: tone.fg,
      // Staggered entry + head pulse, both disabled under reduced motion;
      // the pulse's play-state is gated so pause truly freezes the sync.
      animation: reducedMotion
        ? 'none'
        : isSyncing
          ? 'oso-chip-in 240ms ease both, oso-syncing-pulse 1.1s ease-out infinite'
          : 'oso-chip-in 240ms ease both',
      animationDelay: reducedMotion ? '0ms' : \`\${Math.min(index, 6) * 45}ms\`,
      animationPlayState: isSyncing && !isPlaying ? 'paused' : 'running',
      textDecoration: op.status === 'rejected' ? 'line-through' : 'none',
      opacity: op.status === 'rejected' ? 0.75 : 1,
    };
    return (
      <span key={op.id} style={chipStyle}>
        <Icon
          icon={
            op.status === 'conflict'
              ? TriangleAlertIcon
              : op.status === 'rejected'
                ? XIcon
                : CloudOffIcon
          }
          size="xsm"
          color="inherit"
        />
        <span style={styles.chipLabel}>
          {truncate(op.noteTitle, 18)} · {op.label}
        </span>
        {op.attempts > 0 && op.status === 'pending' && (
          <span aria-label={\`retry attempt \${op.attempts + 1}\`}>
            ×{op.attempts + 1}
          </span>
        )}
        {op.status === 'conflict' && (
          <button
            type="button"
            style={styles.chipResolveButton}
            onClick={() => openResolver(op)}>
            Resolve
          </button>
        )}
        {op.status === 'rejected' && !reducedMotion && (
          <span
            aria-hidden
            style={{
              ...styles.strikeLine,
              animation: \`oso-strike \${REJECT_SWEEP_MS * 0.6}ms ease-out both\`,
            }}
          />
        )}
      </span>
    );
  };

  const outboxTray = (
    <section aria-label="Outbox queue" style={styles.tray}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Icon icon={CloudIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Text type="label" size="sm" color="secondary">
              Outbox — drains front-to-back, one op per tick
            </Text>
          </StackItem>
          <Badge
            label={lag === 0 ? 'empty' : \`\${lag} queued\`}
            variant={lag === 0 ? 'success' : 'warning'}
          />
        </HStack>
        {queue.length === 0 ? (
          <Text type="supporting" color="secondary">
            Every local edit lands here first. Flip airplane mode on, make
            edits, then reconnect and play to watch them drain.
          </Text>
        ) : (
          <div style={styles.chipsRow}>{queue.map(renderChip)}</div>
        )}
        {conflictCount > 0 && (
          <Text type="supporting" style={{color: TONE.conflict.fg}}>
            {conflictCount} op{conflictCount === 1 ? '' : 's'} blocked on a
            conflict — resolve to keep draining.
          </Text>
        )}
      </VStack>
    </section>
  );

  // ---- ledger: two-column client-state / server-state mutation log ----

  const ledgerBody = (
    <VStack gap={2}>
      <div style={styles.ledgerGrid} aria-hidden>
        <Text type="label" size="sm" color="secondary">
          Client state
        </Text>
        <Text type="label" size="sm" color="secondary">
          Server state
        </Text>
      </div>
      {log.length === 0 ? (
        <EmptyState
          isCompact
          icon={<Icon icon={CloudIcon} size="lg" />}
          title="No sync activity yet"
          description="Reconnect and press play (or step) to drain the outbox — every op logs its client and server state here."
        />
      ) : (
        log.map(entry => {
          const meta = OUTCOME_META[entry.outcome];
          const tone = TONE[meta.tone];
          const diverged = entry.clientValue !== entry.serverValue;
          return (
            <div key={entry.id} style={styles.ledgerRow}>
              <HStack gap={2} vAlign="center">
                <span style={styles.tick}>t{entry.tick}</span>
                <StackItem size="fill" style={styles.headerTitle}>
                  <Text type="supporting" maxLines={1}>
                    {entry.noteTitle} · {entry.opLabel}
                  </Text>
                </StackItem>
                <span
                  style={{
                    ...styles.dirtyBadge,
                    border: \`1px solid \${tone.border}\`,
                    background: tone.bg,
                    color: tone.fg,
                  }}>
                  {meta.label}
                </span>
              </HStack>
              <div style={styles.ledgerGrid}>
                <div
                  style={diverged ? styles.ledgerCellLive : styles.ledgerCell}>
                  {entry.clientValue}
                </div>
                <div style={styles.ledgerCell}>{entry.serverValue}</div>
              </div>
              {entry.reason !== undefined && (
                <Text type="supporting" color="secondary" maxLines={2}>
                  {entry.reason}
                </Text>
              )}
            </div>
          );
        })
      )}
    </VStack>
  );

  const ledgerHeader = (
    <div style={styles.ledgerHeaderBlock}>
      <VStack gap={1}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={4} accessibilityLevel={2}>
              Mutation ledger
            </Heading>
          </StackItem>
          <Badge label={\`tick \${drainCount}\`} variant="neutral" />
        </HStack>
        <Text
          type="body"
          weight="semibold"
          style={{
            ...styles.lagCounter,
            color: lag > 0 ? TONE.pending.fg : TONE.acked.fg,
          }}>
          {lag > 0
            ? \`\${lag} op\${lag === 1 ? '' : 's'} ahead of server\`
            : 'Client and server in sync'}
        </Text>
        <Text type="supporting" color="secondary">
          Left column is what the app shows (optimistic); right is what the
          server has acknowledged.
        </Text>
      </VStack>
    </div>
  );

  const ledgerPanel = (
    <div style={styles.ledgerPane}>
      {ledgerHeader}
      <Divider />
      <div style={styles.ledgerScroll}>{ledgerBody}</div>
    </div>
  );

  const stackedLedger = (
    <section aria-label="Mutation ledger" style={styles.stackedLedger}>
      {ledgerHeader}
      <Divider />
      <div style={{padding: 'var(--spacing-3)'}}>{ledgerBody}</div>
    </section>
  );

  // ---- conflict resolver sheet ----

  const resolverDialog = resolverOp !== null &&
    resolverOp.status === 'conflict' && (
      <Dialog
        isOpen
        onOpenChange={isOpen => {
          if (!isOpen) {
            setResolverOpId(null);
          }
        }}
        width="min(520px, 94vw)">
        <Layout
          header={
            <DialogHeader
              title="Resolve sync conflict"
              subtitle={\`\${resolverOp.noteTitle} · \${resolverOp.label}\`}
              onOpenChange={isOpen => {
                if (!isOpen) {
                  setResolverOpId(null);
                }
              }}
              hasDivider
            />
          }
          content={
            <LayoutContent>
              <VStack gap={4}>
                <Text type="supporting" color="secondary">
                  {resolverOp.reason ??
                    'The server version changed while this edit was queued.'}{' '}
                  Pick a side per field, or resolve all at once below.
                </Text>
                {fieldsOf(resolverOp.fields).map(key => {
                  const choice = resolverChoices[key] ?? 'mine';
                  const mineValue = fieldValue(resolverOp.fields, key);
                  const serverValue = fieldValue(
                    resolverOp.conflictServer ?? {},
                    key,
                  );
                  return (
                    <VStack key={key} gap={2}>
                      <HStack gap={2} vAlign="center">
                        <StackItem size="fill">
                          <Text type="label" size="sm" color="secondary">
                            {FIELD_LABEL[key]}
                          </Text>
                        </StackItem>
                        <SegmentedControl
                          label={\`Resolution for \${FIELD_LABEL[key]}\`}
                          size="sm"
                          value={choice}
                          onChange={value =>
                            setResolverChoices(prev => ({
                              ...prev,
                              [key]: value as 'mine' | 'server',
                            }))
                          }>
                          <SegmentedControlItem value="mine" label="Mine" />
                          <SegmentedControlItem value="server" label="Server" />
                        </SegmentedControl>
                      </HStack>
                      <div style={styles.diffGrid}>
                        <div
                          style={
                            choice === 'mine'
                              ? styles.diffBoxChosen
                              : styles.diffBox
                          }>
                          {mineValue}
                        </div>
                        <div
                          style={
                            choice === 'server'
                              ? styles.diffBoxChosen
                              : styles.diffBox
                          }>
                          {serverValue}
                        </div>
                      </div>
                    </VStack>
                  );
                })}
                <Divider />
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Button
                    label="Take server"
                    size="sm"
                    variant="secondary"
                    style={isCompact ? styles.buttonTapTarget : undefined}
                    onClick={() => takeServer(resolverOp)}
                  />
                  <Button
                    label="Keep mine"
                    size="sm"
                    variant="secondary"
                    style={isCompact ? styles.buttonTapTarget : undefined}
                    onClick={() => keepMine(resolverOp)}
                  />
                  <StackItem size="fill" />
                  <Button
                    label="Apply merge"
                    size="sm"
                    variant="primary"
                    style={isCompact ? styles.buttonTapTarget : undefined}
                    icon={<Icon icon={GitMergeIcon} size="sm" color="inherit" />}
                    onClick={() => resolveConflict(resolverOp, resolverChoices)}
                  />
                </HStack>
              </VStack>
            </LayoutContent>
          }
        />
      </Dialog>
    );

  // ---- header drain controls ----

  const canDrain = isOnline && headPendingId !== null;

  const drainControls = (
    <HStack gap={1} vAlign="center">
      <Tooltip
        content={
          isOffline
            ? 'Reconnect first — airplane mode is on'
            : isPlaying
              ? 'Pause the drain (freezes chips mid-sync)'
              : 'Drain the outbox, one op per tick'
        }>
        <IconButton
          label={isPlaying ? 'Pause sync' : 'Play sync'}
          size="sm"
          variant={isPlaying ? 'secondary' : 'primary'}
          style={isCompact ? styles.iconTapTarget : undefined}
          icon={
            <Icon
              icon={isPlaying ? PauseIcon : PlayIcon}
              size="sm"
              color="inherit"
            />
          }
          isDisabled={!canDrain && !isPlaying}
          onClick={() => setIsPlaying(prev => !prev)}
        />
      </Tooltip>
      <Tooltip content="Sync exactly one op">
        <IconButton
          label="Step one sync tick"
          size="sm"
          variant="ghost"
          style={isCompact ? styles.iconTapTarget : undefined}
          icon={<Icon icon={StepForwardIcon} size="sm" color="inherit" />}
          isDisabled={!canDrain}
          onClick={() => step()}
        />
      </Tooltip>
    </HStack>
  );

  // ---- frame ----

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill" style={styles.headerTitle}>
              <HStack gap={2} vAlign="center">
                <Icon
                  icon={isOffline ? CloudOffIcon : CloudIcon}
                  size="md"
                  color="secondary"
                />
                <Heading level={1} maxLines={1}>
                  Offline Sync Outbox
                </Heading>
                {!isCompact && (
                  <Badge
                    label={
                      lag > 0 ? \`\${lag} ahead of server\` : 'in sync'
                    }
                    variant={lag > 0 ? 'warning' : 'success'}
                  />
                )}
              </HStack>
            </StackItem>
            <HStack gap={3} vAlign="center">
              <HStack gap={1} vAlign="center">
                <Icon icon={PlaneIcon} size="sm" color="secondary" />
                <Switch
                  label="Airplane mode"
                  value={isOffline}
                  onChange={toggleAirplane}
                />
              </HStack>
              {drainControls}
            </HStack>
          </HStack>
        </LayoutHeader>
      }
      end={
        !isStacked ? (
          <LayoutPanel hasDivider width={360} padding={0} label="Mutation ledger">
            {ledgerPanel}
          </LayoutPanel>
        ) : undefined
      }
      content={
        <LayoutContent padding={4} role="main" label="Offline sync outbox">
          <style>{KEYFRAMES}</style>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          <div style={styles.centerColumn}>
            {phonePane}
            {outboxTray}
            {isStacked && stackedLedger}
          </div>
          {resolverDialog}
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};