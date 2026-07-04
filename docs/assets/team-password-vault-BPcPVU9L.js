var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file team-password-vault.tsx
 * @input Deterministic fixtures only — a fixed Keyline workspace ("Keyline
 *   HQ", 6 members) with 15 vault items across a personal vault and two
 *   team vaults, fixed ISO timestamps in early July 2026, fixture
 *   passwords/TOTP codes (the countdown ring is a frozen snapshot — no
 *   clocks, no randomness, no network media).
 * @output Team Password Vault — a 1Password-style credential manager for
 *   the fictional startup Keyline. Sidebar rail of vaults (Personal /
 *   Engineering / Operations with item counts), category scopes, and a
 *   Watchtower-style "Security check" entry with an alert badge; an item
 *   list column (site monograms, favorite stars, last-used timestamps);
 *   and an item detail pane with copyable website/username rows, a
 *   concealed password row with reveal/copy and a strength chip, a TOTP
 *   row with a 30s countdown ring and current code, custom fields, a
 *   shared-with facepile, and item history. A security-report strip (3
 *   weak / 2 reused / 1 breach-exposed with fix CTAs) spans the top of
 *   the content region, and an unlock-state hint chip ("Auto-locks in
 *   8 min") sits in the header.
 * @position Page template; emitted by \`astryx template team-password-vault\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (brand, search, auto-lock chip, New item)
 *   | rail 260 (vault/category TreeList + pinned workspace strip)
 *   | content column: security-report strip (pinned, wraps) over a split
 *     row — item list column 340 (pinned search, scrolling List) | item
 *     detail pane (fill, scrolls).
 * Container policy: app-shell archetype — frame rows and panels only; no
 *   Cards. Detail field groups, the security strip, monograms, and the
 *   TOTP ring are styled divs.
 * Color policy: token-pure everywhere; ONE brand accent — Keyline deep
 *   green \`light-dark(#15803D, #4ADE80)\` — used only for the brand mark,
 *   the unlock hint chip, the TOTP countdown ring, and the strong-password
 *   emphasis. Monograms and vault dots use the data-viz categorical tokens
 *   with the repo-standard \`light-dark()\` fallback pairs (the demo does
 *   not inject them); issue severities ride semantic Token/Badge variants.
 *
 * Responsive contract:
 * - > 1180px: full three-region frame (rail | list | detail).
 * - <= 1180px: the rail is dropped; a scope Selector appears above the
 *   item-list search so every vault/category stays reachable.
 * - <= 860px: single-pane swap — the list fills the content region and
 *   opening an item swaps to the detail pane with a back IconButton.
 * - The security strip wraps its stat chips instead of clipping; the
 *   header row wraps; list and detail scroll independently
 *   (\`minHeight: 0\` down every flex chain).
 */

import {useMemo, useState, type CSSProperties, type ReactNode} from 'react';

import {
  AlertTriangleIcon,
  ArchiveIcon,
  ArrowLeftIcon,
  CheckIcon,
  CopyIcon,
  CreditCardIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  FolderInputIcon,
  GlobeIcon,
  HistoryIcon,
  KeyRoundIcon,
  LockKeyholeIcon,
  PencilIcon,
  PlusIcon,
  RotateCwIcon,
  SearchIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  StarIcon,
  StickyNoteIcon,
  TimerIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
} from 'lucide-react';

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
import {Avatar} from '@astryxdesign/core/Avatar';
import {
  AvatarGroup,
  AvatarGroupOverflow,
} from '@astryxdesign/core/AvatarGroup';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {Selector} from '@astryxdesign/core/Selector';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {TreeList} from '@astryxdesign/core/TreeList';
import type {TreeListItemData} from '@astryxdesign/core/TreeList';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// BRAND — Keyline deep green, the single brand accent (see Color policy).
// ---------------------------------------------------------------------------

const BRAND_ACCENT = 'light-dark(#15803D, #4ADE80)';
const BRAND_ACCENT_SOFT =
  'light-dark(rgba(21,128,61,0.12), rgba(74,222,128,0.16))';
const BRAND_RING_TRACK =
  'light-dark(rgba(21,128,61,0.18), rgba(74,222,128,0.22))';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  panelFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  railScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-2)'},
  railFoot: {flexShrink: 0, padding: 'var(--spacing-3)'},
  countChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '1px 7px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  vaultDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  brandMark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-container)',
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  lockChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 10px',
    borderRadius: 999,
    backgroundColor: BRAND_ACCENT_SOFT,
    color: 'var(--color-text-primary)',
    fontSize: 12,
    whiteSpace: 'nowrap',
  },
  lockChipIcon: {display: 'inline-flex', color: BRAND_ACCENT},
  contentFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  securityStrip: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2) var(--spacing-4)',
    padding: 'var(--spacing-2) var(--spacing-4)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
  },
  securityStat: {display: 'inline-flex', alignItems: 'center', gap: 8},
  issueDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  listMetaTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    height: 16,
  },
  splitRow: {flex: 1, minHeight: 0, display: 'flex'},
  listColumn: {
    width: 340,
    flexShrink: 0,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    borderInlineEnd: 'var(--border-width) solid var(--color-border)',
  },
  listColumnFill: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    borderInlineEnd: 'none',
  },
  listSearch: {flexShrink: 0, padding: 'var(--spacing-2) var(--spacing-3)'},
  listScroll: {flex: 1, minHeight: 0, overflowY: 'auto'},
  listEmpty: {padding: 'var(--spacing-4) var(--spacing-3)'},
  monogram: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-container)',
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
  },
  monogramLg: {width: 48, height: 48, fontSize: 18},
  starGlyph: {
    display: 'inline-flex',
    flexShrink: 0,
    color: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  },
  detailFill: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  detailScroll: {flex: 1, minHeight: 0, overflowY: 'auto'},
  detailInner: {
    maxWidth: 720,
    padding: 'var(--spacing-4) var(--spacing-5) var(--spacing-6)',
  },
  fieldGroup: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
  },
  fieldRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    minHeight: 48,
  },
  fieldRowDivider: {
    borderTop: 'var(--border-width) solid var(--color-border)',
  },
  fieldLabel: {width: 104, flexShrink: 0},
  fieldValue: {flex: 1, minWidth: 0},
  mono: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
  },
  passwordDots: {
    fontFamily: 'var(--font-family-code, monospace)',
    letterSpacing: 3,
  },
  totpRing: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  totpRingHole: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: 'var(--color-background-card)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totpCode: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 18,
    letterSpacing: 1,
    color: 'var(--color-text-primary)',
  },
  issueBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  noteBody: {
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    whiteSpace: 'pre-wrap',
  },
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
  },
};

// ---------------------------------------------------------------------------
// PALETTE — data-viz categorical tokens with repo-standard fallback pairs
// (the demo does not inject \`--color-data-categorical-*\`). Monograms pick a
// pair deterministically via a charCode fold of the item name.
// ---------------------------------------------------------------------------

const MONOGRAM_PALETTE: {fg: string; bg: string}[] = [
  {
    fg: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
    bg: 'light-dark(rgba(1,113,227,0.12), rgba(76,158,255,0.18))',
  },
  {
    fg: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
    bg: 'light-dark(rgba(107,30,253,0.10), rgba(157,107,255,0.18))',
  },
  {
    fg: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
    bg: 'light-dark(rgba(11,153,31,0.12), rgba(52,199,89,0.18))',
  },
  {
    fg: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
    bg: 'light-dark(rgba(235,110,0,0.12), rgba(255,147,48,0.18))',
  },
  {
    fg: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
    bg: 'light-dark(rgba(14,126,139,0.12), rgba(51,184,199,0.18))',
  },
];

/** Deterministic charCode fold — same idiom as streaming-browse-home. */
function monogramFor(name: string): {fg: string; bg: string; letter: string} {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 997;
  }
  const pick = MONOGRAM_PALETTE[hash % MONOGRAM_PALETTE.length];
  return {...pick, letter: name.charAt(0).toUpperCase()};
}

// ---------------------------------------------------------------------------
// DATA — one fictional startup: Keyline (team password manager). Signed-in
// user Rowan Ellis, workspace "Keyline HQ" (6 members). All sites, people,
// passwords, and codes are invented. Reconciliation: 15 items total =
// Personal 5 + Engineering 6 + Operations 4; categories 11 logins + 2
// secure notes + 2 cards; favorites 4; security issues 6 = 3 weak + 2
// reused + 1 breach-exposed (disjoint sets — the Security check badge, the
// strip counts, and the flagged rows all agree).
// ---------------------------------------------------------------------------

const CURRENT_USER = 'Rowan Ellis';

const PEOPLE: Record<string, {role: string}> = {
  'Rowan Ellis': {role: 'Founding engineer'},
  'Priya Nair': {role: 'Engineering lead'},
  'Devon Park': {role: 'Platform engineer'},
  'Marcus Cole': {role: 'Operations'},
  'Jules Tan': {role: 'Design'},
  'Ana Reyes': {role: 'Finance'},
};

type VaultId = 'personal' | 'eng' | 'ops';

interface VaultMeta {
  id: VaultId;
  label: string;
  kind: 'personal' | 'team';
  /** Workspace members with access to the vault. */
  members: string[];
  dotColor: string;
}

const VAULTS: Record<VaultId, VaultMeta> = {
  personal: {
    id: 'personal',
    label: 'Personal',
    kind: 'personal',
    members: ['Rowan Ellis'],
    dotColor: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  },
  eng: {
    id: 'eng',
    label: 'Engineering',
    kind: 'team',
    members: ['Rowan Ellis', 'Priya Nair', 'Devon Park', 'Marcus Cole', 'Jules Tan'],
    dotColor: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  },
  ops: {
    id: 'ops',
    label: 'Operations',
    kind: 'team',
    members: ['Rowan Ellis', 'Marcus Cole', 'Ana Reyes', 'Jules Tan'],
    dotColor: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
  },
};

const VAULT_IDS: VaultId[] = ['personal', 'eng', 'ops'];

type Category = 'login' | 'note' | 'card';
type Strength = 'weak' | 'fair' | 'strong';
type IssueKind = 'weak' | 'reused' | 'breached';

interface CustomField {
  label: string;
  value: string;
  /** Concealed fields render as dots until revealed. */
  isConcealed?: boolean;
}

interface HistoryEvent {
  id: string;
  actor: string;
  kind: 'created' | 'edited' | 'password' | 'shared';
  at: string;
  detail?: string;
}

interface VaultItem {
  id: string;
  vault: VaultId;
  category: Category;
  name: string;
  website?: string;
  username?: string;
  password?: string;
  strength?: Strength;
  isReused?: boolean;
  isBreached?: boolean;
  isFavorite: boolean;
  lastUsedAt: string;
  updatedAt: string;
  createdAt: string;
  /** Frozen TOTP snapshot — fixed code + seconds remaining of 30. */
  totp?: {code: string; secondsLeft: number};
  customFields?: CustomField[];
  /** Everyone with access besides the signed-in user. */
  sharedWith: string[];
  /** Secure notes only. */
  note?: string;
  /** Payment cards only. */
  card?: {holder: string; number: string; last4: string; expires: string};
}

// 15 items. Issue flags are disjoint: weak = Streamloft, Cratebase,
// Postgale (3); reused = Signalpath + Fernwatch, same fixture password (2);
// breach-exposed = Traventa (1).
const INITIAL_ITEMS: VaultItem[] = [
  // ---- Personal vault (5) ----
  {
    id: 'p-mailwren', vault: 'personal', category: 'login',
    name: 'Mailwren', website: 'mailwren.com',
    username: 'rowan.ellis@mailwren.com', password: 'gV7#thrush-Inlet-92',
    strength: 'strong', isFavorite: true,
    lastUsedAt: '2026-07-03T08:12:00Z', updatedAt: '2026-06-14T10:02:00Z',
    createdAt: '2024-02-09T09:00:00Z',
    totp: {code: '615 330', secondsLeft: 27},
    customFields: [{label: 'Recovery email', value: 'r.ellis@postbox.example'}],
    sharedWith: [],
  },
  {
    id: 'p-northtrail', vault: 'personal', category: 'login',
    name: 'Northtrail Bank', website: 'northtrail.example',
    username: 'rowan_ellis', password: 'Kd4!marsh-Lantern-55',
    strength: 'strong', isFavorite: true,
    lastUsedAt: '2026-07-02T19:40:00Z', updatedAt: '2026-05-30T08:15:00Z',
    createdAt: '2023-11-02T12:00:00Z',
    customFields: [{label: 'Member number', value: '4471 8820 03', isConcealed: true}],
    sharedWith: [],
  },
  {
    id: 'p-streamloft', vault: 'personal', category: 'login',
    name: 'Streamloft', website: 'streamloft.tv',
    username: 'rowan.ellis@mailwren.com', password: 'sunshine1',
    strength: 'weak', isFavorite: false,
    lastUsedAt: '2026-06-28T21:05:00Z', updatedAt: '2025-01-17T20:11:00Z',
    createdAt: '2025-01-17T20:11:00Z',
    sharedWith: [],
  },
  {
    id: 'p-wifi', vault: 'personal', category: 'note',
    name: 'Loft Wi-Fi router', isFavorite: false,
    lastUsedAt: '2026-06-30T18:22:00Z', updatedAt: '2026-06-30T18:22:00Z',
    createdAt: '2026-03-08T17:40:00Z',
    note: 'SSID: Keyline-Loft-5G\\nAdmin panel: 192.168.4.1\\nRouter admin password is in the concealed field below.',
    customFields: [{label: 'Admin password', value: 'loft-Router!7381', isConcealed: true}],
    sharedWith: [],
  },
  {
    id: 'p-visa', vault: 'personal', category: 'card',
    name: 'Personal Visa •• 4417', isFavorite: false,
    lastUsedAt: '2026-07-01T12:30:00Z', updatedAt: '2026-07-01T12:30:00Z',
    createdAt: '2025-09-20T10:00:00Z',
    card: {holder: 'Rowan Ellis', number: '4556 2901 8834 4417', last4: '4417', expires: '09/28'},
    sharedWith: [],
  },
  // ---- Engineering vault (6) ----
  {
    id: 'e-deploystack', vault: 'eng', category: 'login',
    name: 'Deploystack CI', website: 'ci.deploystack.example',
    username: 'keyline-bot', password: 'xT2$quarry-Bracken-84',
    strength: 'strong', isFavorite: true,
    lastUsedAt: '2026-07-03T09:05:00Z', updatedAt: '2026-07-01T09:30:00Z',
    createdAt: '2025-04-11T14:00:00Z',
    totp: {code: '482 916', secondsLeft: 21},
    customFields: [
      {label: 'Org slug', value: 'keyline-hq'},
      {label: 'API token', value: 'dsk_live_9f3a71c2e8b4', isConcealed: true},
    ],
    sharedWith: ['Priya Nair', 'Devon Park', 'Marcus Cole', 'Jules Tan'],
  },
  {
    id: 'e-cratebase', vault: 'eng', category: 'login',
    name: 'Cratebase Registry', website: 'cratebase.example',
    username: 'keyline-publish', password: 'crates2023',
    strength: 'weak', isFavorite: false,
    lastUsedAt: '2026-07-02T15:48:00Z', updatedAt: '2025-08-22T11:20:00Z',
    createdAt: '2025-08-22T11:20:00Z',
    sharedWith: ['Priya Nair', 'Devon Park'],
  },
  {
    id: 'e-signalpath', vault: 'eng', category: 'login',
    name: 'Signalpath Monitoring', website: 'app.signalpath.example',
    username: 'oncall@keyline.example', password: 'Harbor!2024run',
    strength: 'fair', isReused: true, isFavorite: false,
    lastUsedAt: '2026-07-03T07:20:00Z', updatedAt: '2026-02-14T09:12:00Z',
    createdAt: '2025-06-03T16:45:00Z',
    sharedWith: ['Priya Nair', 'Devon Park', 'Marcus Cole'],
  },
  {
    id: 'e-harborcloud', vault: 'eng', category: 'login',
    name: 'Harborcloud Console', website: 'console.harborcloud.example',
    username: 'infra@keyline.example', password: 'mN8@cinder-Trellis-41',
    strength: 'strong', isFavorite: false,
    lastUsedAt: '2026-07-02T22:10:00Z', updatedAt: '2026-06-20T13:05:00Z',
    createdAt: '2024-10-30T10:30:00Z',
    totp: {code: '073 254', secondsLeft: 9},
    sharedWith: ['Priya Nair', 'Devon Park'],
  },
  {
    id: 'e-fernwatch', vault: 'eng', category: 'login',
    name: 'Fernwatch Analytics', website: 'fernwatch.example',
    username: 'team@keyline.example', password: 'Harbor!2024run',
    strength: 'fair', isReused: true, isFavorite: false,
    lastUsedAt: '2026-06-29T10:55:00Z', updatedAt: '2026-01-08T15:00:00Z',
    createdAt: '2026-01-08T15:00:00Z',
    sharedWith: ['Priya Nair', 'Jules Tan'],
  },
  {
    id: 'e-stagingdb', vault: 'eng', category: 'note',
    name: 'Staging DB credentials', isFavorite: false,
    lastUsedAt: '2026-07-01T16:35:00Z', updatedAt: '2026-07-01T16:35:00Z',
    createdAt: '2026-05-19T09:25:00Z',
    note: 'Host: staging-db.internal.keyline.example:5432\\nDatabase: keyline_staging\\nRotate whenever the seed snapshot is refreshed.',
    customFields: [
      {label: 'DB user', value: 'keyline_app'},
      {label: 'DB password', value: 'stg-Pinewood!6270', isConcealed: true},
    ],
    sharedWith: ['Priya Nair', 'Devon Park'],
  },
  // ---- Operations vault (4) ----
  {
    id: 'o-ledgerline', vault: 'ops', category: 'login',
    name: 'Ledgerline Payroll', website: 'ledgerline.example',
    username: 'payroll@keyline.example', password: 'bQ6&willow-Compass-19',
    strength: 'strong', isFavorite: true,
    lastUsedAt: '2026-07-01T09:00:00Z', updatedAt: '2026-06-27T08:45:00Z',
    createdAt: '2024-07-15T11:10:00Z',
    sharedWith: ['Marcus Cole', 'Ana Reyes'],
  },
  {
    id: 'o-postgale', vault: 'ops', category: 'login',
    name: 'Postgale Newsletter', website: 'postgale.example',
    username: 'hello@keyline.example', password: 'postgale1',
    strength: 'weak', isFavorite: false,
    lastUsedAt: '2026-06-25T14:12:00Z', updatedAt: '2025-03-04T10:00:00Z',
    createdAt: '2025-03-04T10:00:00Z',
    sharedWith: ['Marcus Cole', 'Jules Tan'],
  },
  {
    id: 'o-traventa', vault: 'ops', category: 'login',
    name: 'Traventa Travel', website: 'traventa.example',
    username: 'travel@keyline.example', password: 'Fj3^gullwing-Atlas-07',
    strength: 'fair', isBreached: true, isFavorite: false,
    lastUsedAt: '2026-06-30T11:26:00Z', updatedAt: '2026-04-02T09:38:00Z',
    createdAt: '2025-10-12T13:55:00Z',
    sharedWith: ['Marcus Cole', 'Ana Reyes'],
  },
  {
    id: 'o-amex', vault: 'ops', category: 'card',
    name: 'Ops Amex •• 3005', isFavorite: false,
    lastUsedAt: '2026-07-02T10:05:00Z', updatedAt: '2026-07-02T10:05:00Z',
    createdAt: '2025-05-28T09:15:00Z',
    card: {holder: 'Keyline Inc.', number: '3742 004631 93005', last4: '3005', expires: '02/27'},
    sharedWith: ['Marcus Cole', 'Ana Reyes'],
  },
];

// ---------------------------------------------------------------------------
// ITEM HISTORY — fixed events per item; timestamps agree with each item's
// createdAt/updatedAt. Items without an entry synthesize a "created" event
// so the history section is never empty.
// ---------------------------------------------------------------------------

const HISTORY: Record<string, HistoryEvent[]> = {
  'e-deploystack': [
    {id: 'h1', actor: 'Devon Park', kind: 'password', at: '2026-07-01T09:30:00Z', detail: 'Rotated after the quarterly key sweep'},
    {id: 'h2', actor: 'Priya Nair', kind: 'shared', at: '2026-05-06T10:12:00Z', detail: 'Shared with the Engineering vault (5 members)'},
    {id: 'h3', actor: 'Rowan Ellis', kind: 'created', at: '2025-04-11T14:00:00Z'},
  ],
  'e-signalpath': [
    {id: 'h1', actor: 'Marcus Cole', kind: 'edited', at: '2026-02-14T09:12:00Z', detail: 'Updated the on-call alias username'},
    {id: 'h2', actor: 'Priya Nair', kind: 'created', at: '2025-06-03T16:45:00Z'},
  ],
  'e-harborcloud': [
    {id: 'h1', actor: 'Devon Park', kind: 'password', at: '2026-06-20T13:05:00Z', detail: 'Rotated ahead of the region migration'},
    {id: 'h2', actor: 'Devon Park', kind: 'created', at: '2024-10-30T10:30:00Z'},
  ],
  'o-traventa': [
    {id: 'h1', actor: 'Marcus Cole', kind: 'password', at: '2026-04-02T09:38:00Z', detail: 'Changed after the vendor notice — breach predates this change'},
    {id: 'h2', actor: 'Ana Reyes', kind: 'created', at: '2025-10-12T13:55:00Z'},
  ],
  'o-ledgerline': [
    {id: 'h1', actor: 'Ana Reyes', kind: 'password', at: '2026-06-27T08:45:00Z', detail: 'Scheduled 90-day rotation'},
    {id: 'h2', actor: 'Marcus Cole', kind: 'shared', at: '2024-07-15T11:20:00Z', detail: 'Shared with the Operations vault (4 members)'},
    {id: 'h3', actor: 'Marcus Cole', kind: 'created', at: '2024-07-15T11:10:00Z'},
  ],
  'p-mailwren': [
    {id: 'h1', actor: 'Rowan Ellis', kind: 'edited', at: '2026-06-14T10:02:00Z', detail: 'Added the recovery email custom field'},
    {id: 'h2', actor: 'Rowan Ellis', kind: 'created', at: '2024-02-09T09:00:00Z'},
  ],
};

const HISTORY_ICON: Record<HistoryEvent['kind'], typeof PencilIcon> = {
  created: PlusIcon,
  edited: PencilIcon,
  password: KeyRoundIcon,
  shared: UserPlusIcon,
};

const HISTORY_VERB: Record<HistoryEvent['kind'], string> = {
  created: 'created this item',
  edited: 'edited this item',
  password: 'changed the password',
  shared: 'changed sharing',
};

function historyFor(item: VaultItem): HistoryEvent[] {
  return (
    HISTORY[item.id] ?? [
      {id: 'h0', actor: CURRENT_USER, kind: 'created', at: item.createdAt},
    ]
  );
}

// ---------------------------------------------------------------------------
// HELPERS — issue classification, strength metadata, scope filtering.
// ---------------------------------------------------------------------------

/** Issue flags are disjoint in the fixtures; breach wins if ever combined. */
function issueOf(item: VaultItem): IssueKind | null {
  if (item.isBreached) {
    return 'breached';
  }
  if (item.strength === 'weak') {
    return 'weak';
  }
  if (item.isReused) {
    return 'reused';
  }
  return null;
}

const STRENGTH_META: Record<Strength, {label: string; color: 'red' | 'yellow' | 'green'}> = {
  weak: {label: 'Weak', color: 'red'},
  fair: {label: 'Fair', color: 'yellow'},
  strong: {label: 'Strong', color: 'green'},
};

const ISSUE_META: Record<IssueKind, {
  label: string;
  dotColor: string;
  banner: string;
  cta: string;
}> = {
  weak: {
    label: 'Weak passwords',
    dotColor: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
    banner: 'This password is short and easy to guess.',
    cta: 'Generate strong password',
  },
  reused: {
    label: 'Reused passwords',
    dotColor: 'light-dark(#B08A00, #E5C558)',
    banner: 'This password is used by 2 items (Signalpath Monitoring and Fernwatch Analytics).',
    cta: 'Make unique',
  },
  breached: {
    label: 'Breach-exposed',
    dotColor: 'light-dark(#DC2626, #F87171)',
    banner: 'This login appeared in the June 2026 Traventa credential exposure.',
    cta: 'Review breach',
  },
};

const ISSUE_ORDER: IssueKind[] = ['weak', 'reused', 'breached'];

type Scope =
  | 'all'
  | 'favorites'
  | 'security'
  | VaultId
  | 'logins'
  | 'notes'
  | 'cards';

const CATEGORY_SCOPE: Record<Category, Scope> = {
  login: 'logins',
  note: 'notes',
  card: 'cards',
};

function itemInScope(item: VaultItem, scope: Scope): boolean {
  if (scope === 'all') {
    return true;
  }
  if (scope === 'favorites') {
    return item.isFavorite;
  }
  if (scope === 'security') {
    return issueOf(item) !== null;
  }
  if (scope === 'logins' || scope === 'notes' || scope === 'cards') {
    return CATEGORY_SCOPE[item.category] === scope;
  }
  return item.vault === scope;
}

const SCOPE_LABEL: Record<Scope, string> = {
  all: 'All items',
  favorites: 'Favorites',
  security: 'Security check',
  personal: 'Personal',
  eng: 'Engineering',
  ops: 'Operations',
  logins: 'Logins',
  notes: 'Secure notes',
  cards: 'Payment cards',
};

const CATEGORY_GLYPH: Record<Category, typeof GlobeIcon> = {
  login: GlobeIcon,
  note: StickyNoteIcon,
  card: CreditCardIcon,
};

// ---------------------------------------------------------------------------
// SIDEBAR RAIL — vault/category TreeList with count chips plus the
// Watchtower-style "Security check" entry carrying an alert Badge. A pinned
// workspace strip sits below the tree.
// ---------------------------------------------------------------------------

function CountChip({count}: {count: number}) {
  return <span style={styles.countChip}>{count}</span>;
}

function VaultRail({
  scope,
  onScopeChange,
  counts,
}: {
  scope: Scope;
  onScopeChange: (scope: Scope) => void;
  counts: Record<Scope, number>;
}) {
  const items: TreeListItemData[] = [
    {
      id: 'all',
      label: 'All items',
      startContent: <Icon icon={KeyRoundIcon} size="sm" color="secondary" />,
      endContent: <CountChip count={counts.all} />,
      isSelected: scope === 'all',
      onClick: () => onScopeChange('all'),
    },
    {
      id: 'favorites',
      label: 'Favorites',
      startContent: <Icon icon={StarIcon} size="sm" color="secondary" />,
      endContent: <CountChip count={counts.favorites} />,
      isSelected: scope === 'favorites',
      onClick: () => onScopeChange('favorites'),
    },
    {
      id: 'vaults',
      label: 'Vaults',
      startContent: <Icon icon={LockKeyholeIcon} size="sm" color="secondary" />,
      isExpanded: true,
      children: VAULT_IDS.map(vaultId => {
        const vault = VAULTS[vaultId];
        return {
          id: vaultId,
          label: vault.label,
          startContent: (
            <span style={{...styles.vaultDot, backgroundColor: vault.dotColor}} />
          ),
          endContent: <CountChip count={counts[vaultId]} />,
          isSelected: scope === vaultId,
          onClick: () => onScopeChange(vaultId),
        };
      }),
    },
    {
      id: 'categories',
      label: 'Categories',
      startContent: <Icon icon={GlobeIcon} size="sm" color="secondary" />,
      isExpanded: true,
      children: (['logins', 'notes', 'cards'] as const).map(catScope => ({
        id: catScope,
        label: SCOPE_LABEL[catScope],
        startContent: (
          <Icon
            icon={
              catScope === 'logins'
                ? GlobeIcon
                : catScope === 'notes'
                  ? StickyNoteIcon
                  : CreditCardIcon
            }
            size="sm"
            color="secondary"
          />
        ),
        endContent: <CountChip count={counts[catScope]} />,
        isSelected: scope === catScope,
        onClick: () => onScopeChange(catScope),
      })),
    },
    {
      id: 'security',
      label: 'Security check',
      startContent: <Icon icon={ShieldAlertIcon} size="sm" color="secondary" />,
      endContent: <Badge variant="error" label={String(counts.security)} />,
      isSelected: scope === 'security',
      onClick: () => onScopeChange('security'),
    },
  ];

  return (
    <div style={styles.panelFill}>
      <div style={styles.railScroll}>
        <TreeList
          density="compact"
          items={items}
          header={
            <Text type="label" size="sm" color="secondary">
              Keyline HQ
            </Text>
          }
        />
      </div>
      <Divider />
      {/* Pinned workspace strip — member count matches the PEOPLE roster. */}
      <VStack gap={2} style={styles.railFoot}>
        <HStack gap={2} vAlign="center">
          <Icon icon={UsersIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Text type="label" size="sm">
              Keyline Teams
            </Text>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            6 members
          </Text>
        </HStack>
        <Text type="supporting" color="secondary">
          Vaults re-lock after 10 minutes idle.
        </Text>
        <Button label="Invite teammate" variant="ghost" size="sm" />
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SECURITY-REPORT STRIP — pinned across the top of the content region.
// Counts reconcile with the flagged fixture items (3 weak / 2 reused /
// 1 breach-exposed = 6, the Security check badge).
// ---------------------------------------------------------------------------

function SecurityStrip({
  issueCounts,
  onReview,
}: {
  issueCounts: Record<IssueKind, number>;
  onReview: (kind: IssueKind) => void;
}) {
  const total = ISSUE_ORDER.reduce((sum, kind) => sum + issueCounts[kind], 0);
  return (
    <div style={styles.securityStrip} role="region" aria-label="Security report">
      <HStack gap={2} vAlign="center">
        <Icon icon={ShieldAlertIcon} size="sm" color="secondary" />
        <Text type="label" size="sm">
          Security report
        </Text>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {total} issues
        </Text>
      </HStack>
      {ISSUE_ORDER.map(kind => (
        <span key={kind} style={styles.securityStat}>
          <span
            style={{...styles.issueDot, backgroundColor: ISSUE_META[kind].dotColor}}
          />
          <Text type="supporting" hasTabularNumbers>
            {issueCounts[kind]}{' '}
            {kind === 'weak'
              ? 'weak'
              : kind === 'reused'
                ? 'reused'
                : 'breach-exposed'}
          </Text>
          <Button
            label="Fix"
            variant="ghost"
            size="sm"
            onClick={() => onReview(kind)}
          />
        </span>
      ))}
      <StackItem size="fill" />
      <HStack gap={2} vAlign="center">
        <Icon icon={ShieldCheckIcon} size="sm" color="secondary" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          Security score 82 / 100
        </Text>
      </HStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ITEM LIST COLUMN — pinned search over a dense scrolling List. Rows carry
// the site monogram, name + username, favorite star, and last-used time.
// ---------------------------------------------------------------------------

function Monogram({name, isLarge}: {name: string; isLarge?: boolean}) {
  const {fg, bg, letter} = monogramFor(name);
  return (
    <span
      aria-hidden
      style={{
        ...styles.monogram,
        ...(isLarge ? styles.monogramLg : null),
        color: fg,
        backgroundColor: bg,
      }}>
      {letter}
    </span>
  );
}

function ItemList({
  items,
  activeId,
  onSelect,
}: {
  items: VaultItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div style={styles.listEmpty}>
        <EmptyState
          isCompact
          icon={<Icon icon={SearchIcon} size="lg" />}
          title="No matching items"
          description="Try a different search, vault, or category."
        />
      </div>
    );
  }
  return (
    <List density="compact" hasDividers>
      {items.map(item => {
        const issue = issueOf(item);
        return (
          <ListItem
            key={item.id}
            label={item.name}
            description={
              item.category === 'login'
                ? (item.username ?? '')
                : item.category === 'note'
                  ? 'Secure note'
                  : \`Card · expires \${item.card?.expires ?? ''}\`
            }
            startContent={<Monogram name={item.name} />}
            endContent={
              <VStack gap={1} hAlign="end">
                {/* Fixed-height slot so timestamps bottom-align even when a
                    row has no issue dot or favorite star. */}
                <div style={styles.listMetaTop}>
                  {issue !== null ? (
                    <span
                      title={ISSUE_META[issue].label}
                      style={{
                        ...styles.issueDot,
                        backgroundColor: ISSUE_META[issue].dotColor,
                      }}
                    />
                  ) : null}
                  {item.isFavorite ? (
                    <span style={styles.starGlyph} aria-label="Favorite">
                      <Icon icon={StarIcon} size="xsm" color="inherit" />
                    </span>
                  ) : null}
                </div>
                <Timestamp
                  value={item.lastUsedAt}
                  format="relative"
                  color="secondary"
                />
              </VStack>
            }
            onClick={() => onSelect(item.id)}
            isSelected={item.id === activeId}
          />
        );
      })}
    </List>
  );
}

// ---------------------------------------------------------------------------
// DETAIL FIELD ROWS — boxed field groups (styled divs, not Cards). Copy
// buttons swap to a check and announce via the page-level aria-live region;
// concealed values render as fixed-length dots until revealed.
// ---------------------------------------------------------------------------

const CONCEALED_DOTS = '••••••••••';

interface CopyControls {
  copiedKey: string | null;
  onCopy: (key: string, label: string) => void;
}

function CopyButton({
  fieldKey,
  label,
  copy,
}: {
  fieldKey: string;
  label: string;
  copy: CopyControls;
}) {
  const isCopied = copy.copiedKey === fieldKey;
  return (
    <IconButton
      label={isCopied ? \`Copied \${label}\` : \`Copy \${label}\`}
      tooltip={isCopied ? 'Copied' : \`Copy \${label.toLowerCase()}\`}
      variant="ghost"
      size="sm"
      icon={<Icon icon={isCopied ? CheckIcon : CopyIcon} size="sm" />}
      onClick={() => copy.onCopy(fieldKey, label)}
    />
  );
}

function FieldRow({
  fieldKey,
  label,
  value,
  isConcealed = false,
  isRevealed = false,
  onToggleReveal,
  isMono = false,
  isFirst = false,
  trailing,
  copy,
}: {
  fieldKey: string;
  label: string;
  value: string;
  isConcealed?: boolean;
  isRevealed?: boolean;
  onToggleReveal?: () => void;
  isMono?: boolean;
  isFirst?: boolean;
  trailing?: ReactNode;
  copy: CopyControls;
}) {
  const isHidden = isConcealed && !isRevealed;
  return (
    <div
      style={{
        ...styles.fieldRow,
        ...(isFirst ? null : styles.fieldRowDivider),
      }}>
      <div style={styles.fieldLabel}>
        <Text type="supporting" color="secondary">
          {label}
        </Text>
      </div>
      <div style={styles.fieldValue}>
        <Text
          type="body"
          maxLines={1}
          style={
            isHidden ? styles.passwordDots : isMono ? styles.mono : undefined
          }>
          {isHidden ? CONCEALED_DOTS : value}
        </Text>
      </div>
      {trailing}
      {isConcealed && onToggleReveal !== undefined ? (
        <IconButton
          label={isRevealed ? \`Conceal \${label}\` : \`Reveal \${label}\`}
          tooltip={isRevealed ? 'Conceal' : 'Reveal'}
          variant="ghost"
          size="sm"
          icon={<Icon icon={isRevealed ? EyeOffIcon : EyeIcon} size="sm" />}
          onClick={onToggleReveal}
        />
      ) : null}
      <CopyButton fieldKey={fieldKey} label={label} copy={copy} />
    </div>
  );
}

/**
 * TOTP row — frozen snapshot of a 30-second window (no clocks). The ring is
 * a conic-gradient in the Keyline accent; the hole carries the seconds left.
 */
function TotpRow({
  item,
  copy,
}: {
  item: VaultItem;
  copy: CopyControls;
}) {
  if (item.totp === undefined) {
    return null;
  }
  const {code, secondsLeft} = item.totp;
  const fraction = (secondsLeft / 30) * 100;
  return (
    <div style={{...styles.fieldRow, ...styles.fieldRowDivider}}>
      <div style={styles.fieldLabel}>
        <Text type="supporting" color="secondary">
          One-time code
        </Text>
      </div>
      <div style={styles.fieldValue}>
        <HStack gap={3} vAlign="center">
          <div
            role="img"
            aria-label={\`\${secondsLeft} seconds until the code rotates\`}
            style={{
              ...styles.totpRing,
              background: \`conic-gradient(\${BRAND_ACCENT} \${fraction}%, \${BRAND_RING_TRACK} 0)\`,
            }}>
            <div style={styles.totpRingHole}>
              <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
                {secondsLeft}
              </Text>
            </div>
          </div>
          <span style={styles.totpCode}>{code}</span>
        </HStack>
      </div>
      <CopyButton fieldKey={\`\${item.id}-totp\`} label="One-time code" copy={copy} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// DETAIL PANE — item header, security banner, field groups, shared-with
// facepile, and item history.
// ---------------------------------------------------------------------------

function LoginFields({
  item,
  copy,
  revealedKeys,
  onToggleReveal,
}: {
  item: VaultItem;
  copy: CopyControls;
  revealedKeys: ReadonlySet<string>;
  onToggleReveal: (key: string) => void;
}) {
  const passwordKey = \`\${item.id}-password\`;
  const strength = item.strength ?? 'fair';
  return (
    <div style={styles.fieldGroup}>
      <FieldRow
        isFirst
        fieldKey={\`\${item.id}-website\`}
        label="Website"
        value={item.website ?? ''}
        copy={copy}
        trailing={
          <IconButton
            label={\`Open \${item.website ?? 'website'}\`}
            tooltip="Open in browser"
            variant="ghost"
            size="sm"
            icon={<Icon icon={ExternalLinkIcon} size="sm" />}
          />
        }
      />
      <FieldRow
        fieldKey={\`\${item.id}-username\`}
        label="Username"
        value={item.username ?? ''}
        copy={copy}
      />
      <FieldRow
        fieldKey={passwordKey}
        label="Password"
        value={item.password ?? ''}
        isConcealed
        isRevealed={revealedKeys.has(passwordKey)}
        onToggleReveal={() => onToggleReveal(passwordKey)}
        isMono
        copy={copy}
        trailing={
          <Token
            size="sm"
            color={STRENGTH_META[strength].color}
            label={STRENGTH_META[strength].label}
          />
        }
      />
      <TotpRow item={item} copy={copy} />
    </div>
  );
}

function CardFields({
  item,
  copy,
  revealedKeys,
  onToggleReveal,
}: {
  item: VaultItem;
  copy: CopyControls;
  revealedKeys: ReadonlySet<string>;
  onToggleReveal: (key: string) => void;
}) {
  if (item.card === undefined) {
    return null;
  }
  const numberKey = \`\${item.id}-number\`;
  return (
    <div style={styles.fieldGroup}>
      <FieldRow
        isFirst
        fieldKey={\`\${item.id}-holder\`}
        label="Cardholder"
        value={item.card.holder}
        copy={copy}
      />
      <FieldRow
        fieldKey={numberKey}
        label="Number"
        value={item.card.number}
        isConcealed
        isRevealed={revealedKeys.has(numberKey)}
        onToggleReveal={() => onToggleReveal(numberKey)}
        isMono
        copy={copy}
      />
      <FieldRow
        fieldKey={\`\${item.id}-expires\`}
        label="Expires"
        value={item.card.expires}
        isMono
        copy={copy}
      />
    </div>
  );
}

function CustomFields({
  item,
  copy,
  revealedKeys,
  onToggleReveal,
}: {
  item: VaultItem;
  copy: CopyControls;
  revealedKeys: ReadonlySet<string>;
  onToggleReveal: (key: string) => void;
}) {
  if (item.customFields === undefined || item.customFields.length === 0) {
    return null;
  }
  return (
    <VStack gap={2}>
      <Text type="label" size="sm" color="secondary">
        Custom fields
      </Text>
      <div style={styles.fieldGroup}>
        {item.customFields.map((field, index) => {
          const key = \`\${item.id}-custom-\${index}\`;
          return (
            <FieldRow
              key={key}
              isFirst={index === 0}
              fieldKey={key}
              label={field.label}
              value={field.value}
              isConcealed={field.isConcealed ?? false}
              isRevealed={revealedKeys.has(key)}
              onToggleReveal={
                field.isConcealed === true
                  ? () => onToggleReveal(key)
                  : undefined
              }
              isMono={field.isConcealed ?? false}
              copy={copy}
            />
          );
        })}
      </div>
    </VStack>
  );
}

function SharedWith({item}: {item: VaultItem}) {
  const vault = VAULTS[item.vault];
  if (item.sharedWith.length === 0) {
    return (
      <VStack gap={2}>
        <Text type="label" size="sm" color="secondary">
          Shared with
        </Text>
        <HStack gap={2} vAlign="center">
          <Icon icon={UserIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary">
            Only you — this item lives in your Personal vault.
          </Text>
        </HStack>
      </VStack>
    );
  }
  const visible = item.sharedWith.slice(0, 4);
  const overflow = item.sharedWith.length - visible.length;
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="label" size="sm" color="secondary">
            Shared with
          </Text>
        </StackItem>
        <AvatarGroup
          size="xsmall"
          aria-label={\`Shared with \${item.sharedWith.length} people\`}>
          {visible.map(person => (
            <Avatar key={person} name={person} />
          ))}
          {overflow > 0 ? <AvatarGroupOverflow count={overflow} /> : null}
        </AvatarGroup>
      </HStack>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        Everyone in the {vault.label} vault ({vault.members.length} members)
        can use this item.
      </Text>
      <List density="compact">
        {item.sharedWith.map(person => (
          <ListItem
            key={person}
            label={person}
            description={PEOPLE[person]?.role ?? 'Keyline HQ'}
            startContent={<Avatar name={person} size="small" />}
            endContent={
              <Text type="supporting" color="secondary">
                Can use
              </Text>
            }
          />
        ))}
      </List>
    </VStack>
  );
}

function ItemHistory({item}: {item: VaultItem}) {
  const events = historyFor(item);
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <Icon icon={HistoryIcon} size="sm" color="secondary" />
        <Text type="label" size="sm" color="secondary">
          Item history
        </Text>
      </HStack>
      <List density="compact">
        {events.map(event => (
          <ListItem
            key={\`\${item.id}-\${event.id}\`}
            label={\`\${event.actor} \${HISTORY_VERB[event.kind]}\`}
            description={
              <VStack gap={0}>
                {event.detail !== undefined ? (
                  <Text type="supporting" color="secondary">
                    {event.detail}
                  </Text>
                ) : null}
                <Timestamp value={event.at} format="date_time" color="secondary" />
              </VStack>
            }
            startContent={
              <Icon icon={HISTORY_ICON[event.kind]} size="sm" color="secondary" />
            }
          />
        ))}
      </List>
    </VStack>
  );
}

function IssueBanner({
  item,
  onFix,
}: {
  item: VaultItem;
  onFix: (kind: IssueKind) => void;
}) {
  const issue = issueOf(item);
  if (issue === null) {
    return null;
  }
  return (
    <div style={styles.issueBanner}>
      <span
        style={{
          ...styles.issueDot,
          backgroundColor: ISSUE_META[issue].dotColor,
          marginTop: 5,
        }}
      />
      <StackItem size="fill">
        <VStack gap={2}>
          <Text type="supporting">{ISSUE_META[issue].banner}</Text>
          <HStack gap={2}>
            <Button
              label={ISSUE_META[issue].cta}
              variant="secondary"
              size="sm"
              icon={
                <Icon
                  icon={issue === 'breached' ? AlertTriangleIcon : RotateCwIcon}
                  size="sm"
                />
              }
              onClick={() => onFix(issue)}
            />
          </HStack>
        </VStack>
      </StackItem>
    </div>
  );
}

function ItemDetail({
  item,
  copy,
  revealedKeys,
  onToggleReveal,
  onToggleFavorite,
  onFix,
  onBack,
}: {
  item: VaultItem | null;
  copy: CopyControls;
  revealedKeys: ReadonlySet<string>;
  onToggleReveal: (key: string) => void;
  onToggleFavorite: (id: string) => void;
  onFix: (kind: IssueKind) => void;
  onBack?: () => void;
}) {
  if (item === null) {
    return (
      <div style={styles.detailScroll}>
        <div style={styles.detailInner}>
          <EmptyState
            isCompact
            icon={<Icon icon={KeyRoundIcon} size="lg" />}
            title="No item selected"
            description="Select an item in the list to see its fields, sharing, and history."
          />
        </div>
      </div>
    );
  }
  const vault = VAULTS[item.vault];
  return (
    <div style={styles.detailScroll}>
      <div style={styles.detailInner}>
        <VStack gap={4}>
          <HStack gap={3} vAlign="center" wrap="wrap">
            {onBack !== undefined ? (
              <IconButton
                label="Back to item list"
                tooltip="Back"
                variant="ghost"
                size="sm"
                icon={<Icon icon={ArrowLeftIcon} size="sm" />}
                onClick={onBack}
              />
            ) : null}
            <Monogram name={item.name} isLarge />
            <StackItem size="fill" style={{minWidth: 160}}>
              <VStack gap={1}>
                <Heading level={2}>{item.name}</Heading>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <HStack gap={1} vAlign="center">
                    <span
                      style={{...styles.vaultDot, backgroundColor: vault.dotColor}}
                    />
                    <Text type="supporting" color="secondary">
                      {vault.label} vault
                    </Text>
                  </HStack>
                  <Token
                    size="sm"
                    color="gray"
                    label={
                      item.category === 'login'
                        ? 'Login'
                        : item.category === 'note'
                          ? 'Secure note'
                          : 'Payment card'
                    }
                  />
                  <Text type="supporting" color="secondary">
                    Last used <Timestamp value={item.lastUsedAt} format="relative" />
                  </Text>
                </HStack>
              </VStack>
            </StackItem>
            <IconButton
              label={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              tooltip={item.isFavorite ? 'Unfavorite' : 'Favorite'}
              variant={item.isFavorite ? 'secondary' : 'ghost'}
              size="sm"
              icon={
                <span style={item.isFavorite ? styles.starGlyph : undefined}>
                  <Icon icon={StarIcon} size="sm" color="inherit" />
                </span>
              }
              onClick={() => onToggleFavorite(item.id)}
            />
            <Button
              label="Edit"
              variant="secondary"
              size="sm"
              icon={<Icon icon={PencilIcon} size="sm" />}
            />
            <MoreMenu
              label="Item actions"
              size="sm"
              items={[
                {
                  label: 'Move to another vault',
                  icon: <Icon icon={FolderInputIcon} size="sm" color="inherit" />,
                  onClick: () => {},
                },
                {
                  label: 'Archive item',
                  icon: <Icon icon={ArchiveIcon} size="sm" color="inherit" />,
                  onClick: () => {},
                },
              ]}
            />
          </HStack>

          <IssueBanner item={item} onFix={onFix} />

          {item.category === 'login' ? (
            <LoginFields
              item={item}
              copy={copy}
              revealedKeys={revealedKeys}
              onToggleReveal={onToggleReveal}
            />
          ) : null}
          {item.category === 'note' && item.note !== undefined ? (
            <div style={styles.noteBody}>
              <Text type="body">{item.note}</Text>
            </div>
          ) : null}
          {item.category === 'card' ? (
            <CardFields
              item={item}
              copy={copy}
              revealedKeys={revealedKeys}
              onToggleReveal={onToggleReveal}
            />
          ) : null}

          <CustomFields
            item={item}
            copy={copy}
            revealedKeys={revealedKeys}
            onToggleReveal={onToggleReveal}
          />

          <Divider />
          <SharedWith item={item} />
          <Divider />
          <ItemHistory item={item} />
        </VStack>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const SCOPE_OPTIONS = (
  ['all', 'favorites', 'personal', 'eng', 'ops', 'logins', 'notes', 'cards', 'security'] as Scope[]
).map(scope => ({value: scope, label: SCOPE_LABEL[scope]}));

export default function TeamPasswordVaultTemplate() {
  const [items, setItems] = useState<VaultItem[]>(INITIAL_ITEMS);
  const [scope, setScope] = useState<Scope>('eng');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>('e-deploystack');
  const [revealedKeys, setRevealedKeys] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  // Responsive contract: <=1180px drops the rail (scope Selector appears);
  // <=860px swaps to a single-pane list/detail flow.
  const isRailHidden = useMediaQuery('(max-width: 1180px)');
  const isSinglePane = useMediaQuery('(max-width: 860px)');

  const counts = useMemo(() => {
    const next: Record<Scope, number> = {
      all: items.length,
      favorites: 0,
      security: 0,
      personal: 0,
      eng: 0,
      ops: 0,
      logins: 0,
      notes: 0,
      cards: 0,
    };
    for (const item of items) {
      if (item.isFavorite) {
        next.favorites += 1;
      }
      if (issueOf(item) !== null) {
        next.security += 1;
      }
      next[item.vault] += 1;
      next[CATEGORY_SCOPE[item.category]] += 1;
    }
    return next;
  }, [items]);

  const issueCounts = useMemo(() => {
    const next: Record<IssueKind, number> = {weak: 0, reused: 0, breached: 0};
    for (const item of items) {
      const issue = issueOf(item);
      if (issue !== null) {
        next[issue] += 1;
      }
    }
    return next;
  }, [items]);

  // Scope + search filter, newest-used first.
  const visibleItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items
      .filter(item => {
        if (!itemInScope(item, scope)) {
          return false;
        }
        if (needle.length === 0) {
          return true;
        }
        return \`\${item.name} \${item.username ?? ''} \${item.website ?? ''}\`
          .toLowerCase()
          .includes(needle);
      })
      .sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt));
  }, [items, scope, query]);

  const activeItem = items.find(item => item.id === activeId) ?? null;

  const changeScope = (nextScope: Scope) => {
    setScope(nextScope);
    setRevealedKeys(new Set());
    setMobileView('list');
    const first = items
      .filter(item => itemInScope(item, nextScope))
      .sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt))[0];
    setActiveId(first?.id ?? null);
  };

  const selectItem = (id: string) => {
    setActiveId(id);
    setRevealedKeys(new Set());
    setMobileView('detail');
  };

  const copy: CopyControls = {
    copiedKey,
    onCopy: (key, label) => {
      setCopiedKey(key);
      setAnnouncement(\`\${label} copied — the clipboard clears in 90 seconds.\`);
    },
  };

  const toggleReveal = (key: string) => {
    setRevealedKeys(previous => {
      const next = new Set(previous);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleFavorite = (id: string) => {
    setItems(previous =>
      previous.map(item =>
        item.id === id ? {...item, isFavorite: !item.isFavorite} : item,
      ),
    );
  };

  const reviewIssue = (kind: IssueKind) => {
    setScope('security');
    setRevealedKeys(new Set());
    const first = items
      .filter(item => issueOf(item) === kind)
      .sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt))[0];
    setActiveId(first?.id ?? null);
    setMobileView('detail');
    setAnnouncement(
      \`Showing \${issueCounts[kind]} \${ISSUE_META[kind].label.toLowerCase()} in the security check.\`,
    );
  };

  // ----- header: brand, search, unlock hint chip, New item -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isSinglePane ? 'wrap' : 'nowrap'}>
        <HStack gap={2} vAlign="center">
          <span style={styles.brandMark}>
            <Icon icon={LockKeyholeIcon} size="sm" color="inherit" />
          </span>
          <Heading level={1}>Keyline</Heading>
          <Text type="supporting" color="secondary">
            Keyline HQ
          </Text>
        </HStack>
        <StackItem size="fill">
          <TextInput
            label="Search the vaults"
            isLabelHidden
            size="sm"
            width="100%"
            style={{maxWidth: 480}}
            placeholder="Search items, usernames, sites…"
            startIcon={<Icon icon={SearchIcon} size="sm" />}
            value={query}
            onChange={setQuery}
            hasClear
          />
        </StackItem>
        {/* Unlock-state hint chip — deterministic fixture, no live clock. */}
        <span style={styles.lockChip}>
          <span style={styles.lockChipIcon}>
            <Icon icon={TimerIcon} size="xsm" color="inherit" />
          </span>
          Unlocked · auto-locks in 8 min
        </span>
        <Button
          label="Lock now"
          variant="ghost"
          size="sm"
          icon={<Icon icon={LockKeyholeIcon} size="sm" />}
          isIconOnly={isSinglePane}
          tooltip={isSinglePane ? 'Lock now' : undefined}
        />
        <Button
          label="New item"
          variant="primary"
          size="sm"
          icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
        />
      </HStack>
    </LayoutHeader>
  );

  // ----- item list column (pinned scope/search over the scrolling list) ----
  const listColumn = (
    <div
      style={
        isSinglePane && mobileView === 'list'
          ? {...styles.listColumn, ...styles.listColumnFill}
          : styles.listColumn
      }>
      <VStack gap={2} style={styles.listSearch}>
        {isRailHidden ? (
          <Selector
            label="Vault scope"
            isLabelHidden
            options={SCOPE_OPTIONS}
            value={scope}
            onChange={value => changeScope(value as Scope)}
            size="sm"
            width="100%"
          />
        ) : null}
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="label" size="sm">
              {SCOPE_LABEL[scope]}
            </Text>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {visibleItems.length}{' '}
            {visibleItems.length === 1 ? 'item' : 'items'}
          </Text>
        </HStack>
      </VStack>
      <Divider />
      <div style={styles.listScroll}>
        <ItemList
          items={visibleItems}
          activeId={activeId}
          onSelect={selectItem}
        />
      </div>
    </div>
  );

  const detailPane = (
    <div style={styles.detailFill}>
      <ItemDetail
        item={activeItem}
        copy={copy}
        revealedKeys={revealedKeys}
        onToggleReveal={toggleReveal}
        onToggleFavorite={toggleFavorite}
        onFix={reviewIssue}
        onBack={isSinglePane ? () => setMobileView('list') : undefined}
      />
    </div>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        start={
          isRailHidden ? undefined : (
            <LayoutPanel width={260} padding={0} hasDivider label="Vaults">
              <VaultRail
                scope={scope}
                onScopeChange={changeScope}
                counts={counts}
              />
            </LayoutPanel>
          )
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentFill}>
              <div aria-live="polite" style={styles.visuallyHidden}>
                {announcement}
              </div>
              <SecurityStrip issueCounts={issueCounts} onReview={reviewIssue} />
              <div style={styles.splitRow}>
                {isSinglePane ? (
                  mobileView === 'list' ? (
                    listColumn
                  ) : (
                    detailPane
                  )
                ) : (
                  <>
                    {listColumn}
                    {detailPane}
                  </>
                )}
              </div>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};