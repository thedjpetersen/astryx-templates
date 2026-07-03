var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Doc Sharing & Publish Panel — Google-Docs-style share dialog
 *   centered over a dimmed, static document preview.
 * @input Deterministic fixtures only: the Kestrel Labs "Atlas Q3 Launch
 *   Plan" doc, a five-person access list (Priya Raman owner, Dana
 *   Whitfield "you", Marcus Webb, Sofia Ortiz, Jonah Fields) plus one
 *   pending external invite (amara.chen@meridianpress.com), two group
 *   rows (atlas-core@kestrellabs.com, design-crit@kestrellabs.com), two
 *   seeded access requests, and fixed July 2026 ISO timestamps. No
 *   Date.now(), Math.random(), or network assets.
 * @output Sharing surface for a document: a 560px share dialog Card
 *   centered over an aria-hidden doc-preview backdrop under an Overlay
 *   scrim. The dialog carries a TabList with two states — "Share": an
 *   invite composer (email TextInput + role Selector, notify-people
 *   CheckboxInput that reveals a message TextArea), a "People with
 *   access" list (Avatar rows, per-row viewer/commenter/editor Selectors
 *   with a Remove access item, an Owner row and a Pending-invite Badge
 *   chip), a "Groups with access" section, a general-access Selector
 *   (Restricted / Kestrel Labs / Anyone with the link) with icon states
 *   and a link-role Selector, and a copy-link row; "Publish": a
 *   published-to-web Switch (unpublish behind an AlertDialog), published
 *   URL row, embed-snippet CodeBlock, auto-republish Switch, and an
 *   access-requests queue with approve/deny actions that feed the Share
 *   tab's people list.
 * @position Page template; emitted by \`astryx template doc-share-publish\`.
 *   The document canvas behind the scrim is a STATIC styled preview only
 *   (the real editor lives in astryx-editor) — future authors must not
 *   upgrade it into a contenteditable surface.
 *
 * Frame: full-viewport doc backdrop (Layout height="fill": doc chrome
 * header with title/menu/presence, centered 760px paper sheet) beneath an
 * Overlay scrim; the share dialog Card floats centered in the scrim layer
 * at 560px (maxHeight 84vh). Title bar, TabList, and footer are pinned
 * inside the card; only the tab body scrolls. Closing the dialog drops
 * the scrim and re-enables the backdrop's Share button, which reopens it.
 *
 * Responsive contract:
 * - >720px  — centered 560px dialog, maxHeight 84vh; backdrop shows the
 *   full doc chrome (menu row + presence avatars).
 * - <=720px — the dialog becomes a full-bleed sheet (100% x 100%, radius
 *   0); the backdrop menu row and presence avatars are hidden; per-row
 *   role Selectors narrow from 150px to 132px.
 *
 * Container policy (overlay-dialog archetype): the share dialog Card is
 * the only Card on the page; the doc "paper" is a styled div, and access
 * rows are plain hairline-divided rows, not nested cards.
 *
 * Color policy: token-pure throughout — no scheme-locked surfaces. The
 * Overlay's dark scrim force-wraps the dialog in media-dark theming, so
 * the dialog re-anchors to the page scheme via MediaTheme (useTheme mode).
 */

import {useState, type CSSProperties} from 'react';

import {
  Building2Icon,
  CheckIcon,
  CodeIcon,
  EyeIcon,
  GlobeIcon,
  Link2Icon,
  LockIcon,
  MessageSquareIcon,
  PencilIcon,
  SendIcon,
  UserPlusIcon,
  UsersIcon,
  UserXIcon,
  XIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Divider} from '@astryxdesign/core/Divider';
import {FieldStatus} from '@astryxdesign/core/FieldStatus';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Overlay} from '@astryxdesign/core/Overlay';
import {Selector} from '@astryxdesign/core/Selector';
import type {SelectorOptionType} from '@astryxdesign/core/Selector';
import {Switch} from '@astryxdesign/core/Switch';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {MediaTheme, useTheme} from '@astryxdesign/core/theme';

// ---------------------------------------------------------------------------
// STYLES — one typed inline record; tokens only (no raw hex outside
// light-dark() pairs, and none are needed on this token-pure page).
// ---------------------------------------------------------------------------

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
  // --- doc backdrop (static preview; inert while the dialog is open) ---
  backdrop: {
    height: '100%',
    userSelect: 'none',
  },
  backdropInert: {
    height: '100%',
    userSelect: 'none',
    pointerEvents: 'none',
  },
  docChromeTitleRow: {
    minWidth: 0,
  },
  docCanvas: {
    display: 'flex',
    justifyContent: 'center',
    padding: 'var(--spacing-6)',
    backgroundColor: 'var(--color-background-muted)',
    minHeight: '100%',
    boxSizing: 'border-box',
  },
  // The doc "paper": a styled preview sheet, never an editor (§ astryx-editor).
  docSheet: {
    width: 760,
    maxWidth: '100%',
    backgroundColor: 'var(--color-background-card)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    boxShadow: 'var(--shadow-low)',
    paddingBlock: 'var(--spacing-9)',
    paddingInline: 'var(--spacing-8)',
    boxSizing: 'border-box',
  },
  docGateTable: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-element)',
    overflow: 'hidden',
  },
  docGateRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, 0.8fr)',
    gap: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-3)',
  },
  docGateHeader: {
    backgroundColor: 'var(--color-background-muted)',
  },
  // --- dialog layers over the scrim ---
  dialogLayerCentered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    padding: 'var(--spacing-4)',
    boxSizing: 'border-box',
  },
  dialogLayerMobile: {
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'stretch',
    height: '100%',
    width: '100%',
  },
  dialogCard: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-high)',
  },
  titleBar: {
    flexShrink: 0,
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-3)',
  },
  tabRow: {
    flexShrink: 0,
    paddingInline: 'var(--spacing-4)',
  },
  // Only the tab body scrolls; title bar, tabs, and footer stay pinned.
  bodyScroll: {
    minHeight: 0,
    flex: 1,
    overflowY: 'auto',
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-3)',
  },
  footer: {
    flexShrink: 0,
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-3)',
  },
  sectionLabelRow: {
    paddingBlock: 'var(--spacing-1)',
  },
  accessRow: {
    paddingBlock: 'var(--spacing-2)',
  },
  // Tinted circle standing in for a group "avatar" — same 32px footprint
  // as the person Avatars so the two lists share a gridline.
  groupBubble: {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  generalAccessIconBubble: {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  linkRow: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-element)',
    paddingBlock: 'var(--spacing-1)',
    paddingInline: 'var(--spacing-3)',
    backgroundColor: 'var(--color-background-muted)',
  },
  linkText: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontSize: 'var(--font-size-supporting, 12px)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: 'var(--color-text-secondary)',
  },
  requestRow: {
    paddingBlock: 'var(--spacing-2)',
  },
  requestMessage: {
    borderInlineStart:
      'calc(var(--border-width) * 2) solid var(--color-border)',
    paddingInlineStart: 'var(--spacing-3)',
    marginBlock: 'var(--spacing-1)',
  },
  inviteComposer: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-element)',
    padding: 'var(--spacing-3)',
  },
};

// The .share-embed rule tunes CodeBlock's isWrapped mode: keep the soft
// wrap (pre-wrap) but break at spaces instead of break-all, so the iframe
// snippet never splits mid-attribute; !important outranks the library's
// atomic CSS (same idiom as schema-designer-erd's .erd-ddl).
const EMBED_WRAP_CSS = \`
.share-embed code {
  word-break: normal !important;
  overflow-wrap: anywhere !important;
}\`;

// ---------------------------------------------------------------------------
// DATA — deterministic fixtures. Kestrel Labs, Atlas Q3 program; the
// signed-in user is Dana Whitfield; "today" is fixed at 2026-07-02.
// ---------------------------------------------------------------------------

const DOC_TITLE = 'Atlas Q3 Launch Plan';
const LAST_EDITED_AT = '2026-07-02T09:58:00';
const PUBLISHED_AT = '2026-07-01T16:20:00';
const LAST_REPUBLISHED_AT = '2026-07-02T10:04:00';

const SHARE_LINK = 'https://docs.kestrellabs.com/d/atlas-q3-launch-plan';
const PUBLISHED_LINK = 'https://docs.kestrellabs.com/pub/atlas-q3-launch-plan';

// The src line stays under ~62 monospace columns so CodeBlock's soft wrap
// never engages at the 560px dialog width (no query param — the published
// URL embeds as-is).
const EMBED_SNIPPET = [
  '<iframe',
  \`  src="\${PUBLISHED_LINK}"\`,
  '  width="960"',
  '  height="720"',
  '  frameborder="0"',
  \`  title="\${DOC_TITLE}"\`,
  '></iframe>',
].join('\\n');

type Role = 'viewer' | 'commenter' | 'editor';

const ROLE_LABEL: Record<Role, string> = {
  viewer: 'Viewer',
  commenter: 'Commenter',
  editor: 'Editor',
};

interface PersonAccess {
  id: string;
  name: string;
  email: string;
  role: Role;
  isOwner?: boolean;
  isYou?: boolean;
  /** Invited but hasn't accepted yet — rendered with a Pending Badge. */
  isPending?: boolean;
  /** Outside the kestrellabs.com org — surfaced in the external Banner. */
  isExternal?: boolean;
  /** Fixed invite timestamp kept on pending rows (fixture metadata). */
  invitedAt?: string;
}

const INITIAL_PEOPLE: PersonAccess[] = [
  {
    id: 'person-priya',
    name: 'Priya Raman',
    email: 'priya.raman@kestrellabs.com',
    role: 'editor',
    isOwner: true,
  },
  {
    id: 'person-dana',
    name: 'Dana Whitfield',
    email: 'dana.whitfield@kestrellabs.com',
    role: 'editor',
    isYou: true,
  },
  {
    id: 'person-marcus',
    name: 'Marcus Webb',
    email: 'marcus.webb@kestrellabs.com',
    role: 'editor',
  },
  {
    id: 'person-sofia',
    name: 'Sofia Ortiz',
    email: 'sofia.ortiz@kestrellabs.com',
    role: 'commenter',
  },
  {
    id: 'person-jonah',
    name: 'Jonah Fields',
    email: 'jonah.fields@kestrellabs.com',
    role: 'viewer',
  },
  {
    id: 'invite-amara',
    name: 'amara.chen@meridianpress.com',
    email: 'amara.chen@meridianpress.com',
    role: 'viewer',
    isPending: true,
    isExternal: true,
    invitedAt: '2026-07-01T11:32:00',
  },
];

interface GroupAccess {
  id: string;
  name: string;
  members: number;
  role: Role;
}

const INITIAL_GROUPS: GroupAccess[] = [
  {
    id: 'group-atlas-core',
    name: 'atlas-core@kestrellabs.com',
    members: 8,
    role: 'editor',
  },
  {
    id: 'group-design-crit',
    name: 'design-crit@kestrellabs.com',
    members: 12,
    role: 'commenter',
  },
];

interface AccessRequest {
  id: string;
  name: string;
  email: string;
  requestedRole: Role;
  message: string;
  requestedAt: string;
}

const INITIAL_REQUESTS: AccessRequest[] = [
  {
    id: 'request-tomas',
    name: 'Tomás Ibarra',
    email: 'tomas.ibarra@kestrellabs.com',
    requestedRole: 'commenter',
    message:
      'Picking up the support-macros gate from Jonah this sprint — need to leave notes on section 2.',
    requestedAt: '2026-07-02T08:41:00',
  },
  {
    id: 'request-lena',
    name: 'Lena Voss',
    email: 'lena.voss@kestrellabs.com',
    requestedRole: 'viewer',
    message: 'Referenced in the QBR pre-read; view access is enough.',
    requestedAt: '2026-07-01T17:05:00',
  },
];

type GeneralAccess = 'restricted' | 'org' | 'anyone';

const GENERAL_ACCESS_META: Record<
  GeneralAccess,
  {label: string; icon: typeof LockIcon; description: string}
> = {
  restricted: {
    label: 'Restricted',
    icon: LockIcon,
    description: 'Only people and groups with access can open the link.',
  },
  org: {
    label: 'Kestrel Labs',
    icon: Building2Icon,
    description: 'Anyone in the Kestrel Labs org with the link can open it.',
  },
  anyone: {
    label: 'Anyone with the link',
    icon: GlobeIcon,
    description: 'Anyone on the internet with the link can open it.',
  },
};

/** Static menu strip on the doc-preview chrome (decorative only). */
const DOC_MENUS = ['File', 'Edit', 'View', 'Insert', 'Format', 'Tools', 'Help'];

/** Static gate table rendered on the doc-preview sheet. Owners/statuses
 *  reuse the access-list roster so the backdrop and dialog agree. */
const DOC_GATES: Array<{gate: string; owner: string; status: string}> = [
  {gate: 'Beta cohort expansion', owner: 'Marcus Webb', status: 'On track'},
  {gate: 'Pricing page refresh', owner: 'Sofia Ortiz', status: 'At risk'},
  {gate: 'Support macros localized', owner: 'Jonah Fields', status: 'On track'},
];

// ---------------------------------------------------------------------------
// HELPERS — pure and deterministic.
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
const ORG_DOMAIN = '@kestrellabs.com';

/** Guarded clipboard write: fine to no-op in sandboxed frames. */
function copyToClipboard(text: string): void {
  if (typeof navigator !== 'undefined' && navigator.clipboard != null) {
    void navigator.clipboard.writeText(text).catch(() => undefined);
  }
}

/** Selector options for a person/group row: three roles + Remove access. */
const ROW_ROLE_OPTIONS: SelectorOptionType[] = [
  {value: 'viewer', label: 'Viewer', icon: EyeIcon},
  {value: 'commenter', label: 'Commenter', icon: MessageSquareIcon},
  {value: 'editor', label: 'Editor', icon: PencilIcon},
  {type: 'divider'},
  {value: 'remove', label: 'Remove access', icon: UserXIcon},
];

/** Same three roles without the remove item (invite composer, link role). */
const ROLE_ONLY_OPTIONS: SelectorOptionType[] = [
  {value: 'viewer', label: 'Viewer', icon: EyeIcon},
  {value: 'commenter', label: 'Commenter', icon: MessageSquareIcon},
  {value: 'editor', label: 'Editor', icon: PencilIcon},
];

const GENERAL_ACCESS_OPTIONS: SelectorOptionType[] = (
  ['restricted', 'org', 'anyone'] as const
).map(value => ({
  value,
  label: GENERAL_ACCESS_META[value].label,
  icon: GENERAL_ACCESS_META[value].icon,
}));

// ---------------------------------------------------------------------------
// ACCESS ROWS — person / group / request rows share one 32px-lead grid.
// ---------------------------------------------------------------------------

function PersonRow({
  person,
  isCompact,
  onRoleChange,
  onRemove,
}: {
  person: PersonAccess;
  isCompact: boolean;
  onRoleChange: (id: string, role: Role) => void;
  onRemove: (id: string) => void;
}) {
  const displayName = person.isYou ? \`\${person.name} (you)\` : person.name;
  return (
    <div style={styles.accessRow}>
      <HStack gap={3} vAlign="center">
        <Avatar name={person.name} size={32} />
        <StackItem size="fill" style={{minWidth: 0}}>
          <VStack gap={0}>
            <HStack gap={2} vAlign="center">
              <Text type="body" weight="semibold" maxLines={1}>
                {displayName}
              </Text>
              {person.isPending && (
                <Tooltip content="Invite sent — hasn’t accepted yet">
                  <Badge label="Pending invite" variant="warning" />
                </Tooltip>
              )}
              {person.isExternal && !person.isPending && (
                <Badge label="External" variant="neutral" />
              )}
            </HStack>
            {/* Pending rows are addressed by email already — skip the echo. */}
            {person.email !== person.name && (
              <Text type="supporting" color="secondary" maxLines={1}>
                {person.email}
              </Text>
            )}
          </VStack>
        </StackItem>
        {person.isOwner ? (
          <Tooltip content="Ownership transfers from the doc’s settings menu">
            <Text type="supporting" color="secondary">
              Owner
            </Text>
          </Tooltip>
        ) : person.isYou ? (
          <Tooltip content="You can’t change your own role">
            <Text type="supporting" color="secondary">
              {ROLE_LABEL[person.role]}
            </Text>
          </Tooltip>
        ) : (
          <Selector
            label={\`Role for \${displayName}\`}
            isLabelHidden
            size="sm"
            width={isCompact ? 132 : 150}
            options={ROW_ROLE_OPTIONS}
            value={person.role}
            onChange={value => {
              if (value === 'remove') {
                onRemove(person.id);
              } else {
                onRoleChange(person.id, value as Role);
              }
            }}
          />
        )}
      </HStack>
    </div>
  );
}

function GroupRow({
  group,
  isCompact,
  onRoleChange,
  onRemove,
}: {
  group: GroupAccess;
  isCompact: boolean;
  onRoleChange: (id: string, role: Role) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div style={styles.accessRow}>
      <HStack gap={3} vAlign="center">
        <div style={styles.groupBubble}>
          <Icon icon={UsersIcon} size="sm" color="secondary" />
        </div>
        <StackItem size="fill" style={{minWidth: 0}}>
          <VStack gap={0}>
            <Text type="body" weight="semibold" maxLines={1}>
              {group.name}
            </Text>
            <Text type="supporting" color="secondary" maxLines={1}>
              Group · {group.members} members
            </Text>
          </VStack>
        </StackItem>
        <Selector
          label={\`Role for \${group.name}\`}
          isLabelHidden
          size="sm"
          width={isCompact ? 132 : 150}
          options={ROW_ROLE_OPTIONS}
          value={group.role}
          onChange={value => {
            if (value === 'remove') {
              onRemove(group.id);
            } else {
              onRoleChange(group.id, value as Role);
            }
          }}
        />
      </HStack>
    </div>
  );
}

function RequestRow({
  request,
  onApprove,
  onDeny,
}: {
  request: AccessRequest;
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
}) {
  return (
    <div style={styles.requestRow}>
      <HStack gap={3} vAlign="start">
        <Avatar name={request.name} size={32} />
        <StackItem size="fill" style={{minWidth: 0}}>
          <VStack gap={1}>
            <VStack gap={0}>
              <HStack gap={2} vAlign="center">
                <Text type="body" weight="semibold" maxLines={1}>
                  {request.name}
                </Text>
                <Badge
                  label={\`Wants \${ROLE_LABEL[request.requestedRole].toLowerCase()}\`}
                  variant="blue"
                />
              </HStack>
              <Text type="supporting" color="secondary" maxLines={1}>
                {request.email} ·{' '}
                <Timestamp
                  value={request.requestedAt}
                  format="date_time"
                  hasTooltip={false}
                />
              </Text>
            </VStack>
            <div style={styles.requestMessage}>
              <Text type="supporting" color="secondary">
                “{request.message}”
              </Text>
            </div>
            <HStack gap={2} vAlign="center">
              <Button
                label={\`Approve as \${ROLE_LABEL[request.requestedRole].toLowerCase()}\`}
                variant="secondary"
                size="sm"
                icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
                onClick={() => onApprove(request.id)}
              />
              <Button
                label="Deny"
                variant="ghost"
                size="sm"
                onClick={() => onDeny(request.id)}
              />
            </HStack>
          </VStack>
        </StackItem>
      </HStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DOC BACKDROP — static styled preview of the Atlas Q3 Launch Plan.
// STATIC PREVIEW ONLY: the real word-processor canvas lives in
// astryx-editor; nothing on the sheet is editable. While the share dialog
// is open the whole backdrop is aria-hidden and pointer-events none; when
// the dialog is dismissed, only the Share button is interactive (reopens).
// ---------------------------------------------------------------------------

function DocBackdrop({
  isInert,
  isCompact,
  onShare,
}: {
  isInert: boolean;
  isCompact: boolean;
  onShare: () => void;
}) {
  return (
    <div
      style={isInert ? styles.backdropInert : styles.backdrop}
      aria-hidden={isInert || undefined}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <VStack gap={1}>
              <HStack gap={3} vAlign="center" style={styles.docChromeTitleRow}>
                <StackItem size="fill" style={{minWidth: 0}}>
                  <VStack gap={0}>
                    <Heading level={4} accessibilityLevel={1} maxLines={1}>
                      {DOC_TITLE}
                    </Heading>
                    {!isCompact && (
                      <HStack gap={2} vAlign="center">
                        {DOC_MENUS.map(menu => (
                          <Text key={menu} type="supporting" color="secondary">
                            {menu}
                          </Text>
                        ))}
                      </HStack>
                    )}
                  </VStack>
                </StackItem>
                {!isCompact && (
                  <HStack gap={1} vAlign="center">
                    <Avatar name="Priya Raman" size={24} />
                    <Avatar name="Marcus Webb" size={24} />
                    <Avatar name="Sofia Ortiz" size={24} />
                  </HStack>
                )}
                <Button
                  label="Share"
                  variant="primary"
                  size="sm"
                  icon={<Icon icon={UserPlusIcon} size="sm" color="inherit" />}
                  onClick={onShare}
                />
              </HStack>
            </VStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.docCanvas}>
              <div style={styles.docSheet}>
                <VStack gap={4}>
                  <VStack gap={1}>
                    <Heading level={2} accessibilityLevel={2}>
                      Atlas Q3 — Launch Plan
                    </Heading>
                    <Text type="supporting" color="secondary">
                      Kestrel Labs · Atlas program · Last edited{' '}
                      <Timestamp
                        value={LAST_EDITED_AT}
                        format="date_time"
                        hasTooltip={false}
                      />
                    </Text>
                  </VStack>

                  <VStack gap={2}>
                    <Heading level={5} accessibilityLevel={3}>
                      1. Objectives
                    </Heading>
                    <Text type="body" color="secondary">
                      Ship the Atlas workspace GA on September 15 with a beta
                      cohort of 400 accounts converted ahead of launch.
                      Success is measured on activation within 7 days,
                      week-4 retention, and support contact rate — targets
                      are held in the Q3 metrics sheet and reviewed at the
                      Thursday launch review.
                    </Text>
                  </VStack>

                  <VStack gap={2}>
                    <Heading level={5} accessibilityLevel={3}>
                      2. Rollout gates
                    </Heading>
                    <div style={styles.docGateTable}>
                      <div
                        style={{...styles.docGateRow, ...styles.docGateHeader}}>
                        <Text type="label" color="secondary">
                          Gate
                        </Text>
                        <Text type="label" color="secondary">
                          Owner
                        </Text>
                        <Text type="label" color="secondary">
                          Status
                        </Text>
                      </div>
                      {DOC_GATES.map(row => (
                        <div key={row.gate}>
                          <Divider />
                          <div style={styles.docGateRow}>
                            <Text type="supporting" maxLines={1}>
                              {row.gate}
                            </Text>
                            <Text
                              type="supporting"
                              color="secondary"
                              maxLines={1}>
                              {row.owner}
                            </Text>
                            <Text
                              type="supporting"
                              color="secondary"
                              maxLines={1}>
                              {row.status}
                            </Text>
                          </div>
                        </div>
                      ))}
                    </div>
                  </VStack>

                  <VStack gap={2}>
                    <Heading level={5} accessibilityLevel={3}>
                      3. Open risks
                    </Heading>
                    <Text type="body" color="secondary">
                      Pricing page refresh is at risk on localization
                      review; Meridian Press coverage is embargoed until the
                      published summary is live; the beta-to-GA migration
                      script still needs a dry run on the staging org.
                    </Text>
                  </VStack>
                </VStack>
              </div>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

type ShareTabId = 'share' | 'publish';

export default function DocSharePublishTemplate() {
  // --- dialog chrome ---
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<ShareTabId>('share');

  // --- access lists (shared by both tabs: approvals feed the people list) ---
  const [people, setPeople] = useState<PersonAccess[]>(INITIAL_PEOPLE);
  const [groups, setGroups] = useState<GroupAccess[]>(INITIAL_GROUPS);
  const [requests, setRequests] = useState<AccessRequest[]>(INITIAL_REQUESTS);

  // --- invite composer ---
  const [inviteText, setInviteText] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('editor');
  const [notifyPeople, setNotifyPeople] = useState(true);
  const [inviteMessage, setInviteMessage] = useState(
    'Sharing the Atlas Q3 launch plan ahead of Thursday’s review.',
  );
  const [inviteError, setInviteError] = useState<string | null>(null);

  // --- general access + link ---
  const [generalAccess, setGeneralAccess] =
    useState<GeneralAccess>('restricted');
  const [linkRole, setLinkRole] = useState<Role>('viewer');
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  // --- publish tab ---
  const [isPublished, setIsPublished] = useState(true);
  const [autoRepublish, setAutoRepublish] = useState(true);
  const [isPublishedLinkCopied, setIsPublishedLinkCopied] = useState(false);
  const [isUnpublishOpen, setIsUnpublishOpen] = useState(false);

  const isCompact = useMediaQuery('(max-width: 720px)');
  // The Overlay's dark scrim force-wraps the dialog layer in media-dark
  // theming; the dialog is a page surface, so re-anchor to the page mode.
  const {mode: colorMode} = useTheme();

  // --- derived state (counts repeat across panels — always derive) ---
  const externalPeople = people.filter(person => person.isExternal);
  const pendingCount = people.filter(person => person.isPending).length;
  const accessMeta = GENERAL_ACCESS_META[generalAccess];
  const isInviteComposing = inviteText.trim() !== '';
  const summaryText = \`\${people.length} people · \${groups.length} groups have access\`;

  // --- handlers (functional setState so rapid clicks stay consistent) ---

  const changePersonRole = (id: string, role: Role) => {
    setPeople(prev =>
      prev.map(person => (person.id === id ? {...person, role} : person)),
    );
  };

  const removePerson = (id: string) => {
    setPeople(prev => prev.filter(person => person.id !== id));
  };

  const changeGroupRole = (id: string, role: Role) => {
    setGroups(prev =>
      prev.map(group => (group.id === id ? {...group, role} : group)),
    );
  };

  const removeGroup = (id: string) => {
    setGroups(prev => prev.filter(group => group.id !== id));
  };

  const clearInviteComposer = () => {
    setInviteText('');
    setInviteError(null);
    setNotifyPeople(true);
    setInviteRole('editor');
  };

  const sendInvite = () => {
    const email = inviteText.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      setInviteError(
        \`'\${inviteText.trim()}' is not a full email address — use name@company.com.\`,
      );
      return;
    }
    if (people.some(person => person.email === email)) {
      setInviteError(\`\${email} already has access to this doc.\`);
      return;
    }
    setPeople(prev => [
      ...prev,
      {
        id: \`invite-\${email}\`,
        name: email,
        email,
        role: inviteRole,
        isPending: true,
        isExternal: !email.endsWith(ORG_DOMAIN),
        invitedAt: LAST_EDITED_AT,
      },
    ]);
    clearInviteComposer();
  };

  const approveRequest = (id: string) => {
    const request = requests.find(item => item.id === id);
    if (request == null) {
      return;
    }
    setRequests(prev => prev.filter(item => item.id !== id));
    setPeople(prev =>
      prev.some(person => person.email === request.email)
        ? prev
        : [
            ...prev,
            {
              id: \`person-\${request.id}\`,
              name: request.name,
              email: request.email,
              role: request.requestedRole,
              isExternal: !request.email.endsWith(ORG_DOMAIN),
            },
          ],
    );
  };

  const denyRequest = (id: string) => {
    setRequests(prev => prev.filter(item => item.id !== id));
  };

  const changeGeneralAccess = (value: GeneralAccess) => {
    setGeneralAccess(value);
    setIsLinkCopied(false); // the copied chip refers to the old settings
  };

  // ----- Share tab: invite composer -----

  const inviteComposer = (
    <VStack gap={2}>
      <HStack gap={2} vAlign="start">
        <StackItem size="fill">
          <TextInput
            label="Add people and groups"
            isLabelHidden
            placeholder="Add people and groups by email"
            width="100%"
            value={inviteText}
            onChange={value => {
              setInviteText(value);
              setInviteError(null);
            }}
          />
        </StackItem>
        <Selector
          label="Role for new invitees"
          isLabelHidden
          size="md"
          width={isCompact ? 132 : 150}
          options={ROLE_ONLY_OPTIONS}
          value={inviteRole}
          onChange={value => setInviteRole(value as Role)}
        />
      </HStack>
      {inviteError != null && (
        <FieldStatus variant="detached" type="error" message={inviteError} />
      )}
      {/* Notify controls appear only while an invite is being composed. */}
      {isInviteComposing && (
        <div style={styles.inviteComposer}>
          <VStack gap={2}>
            <CheckboxInput
              label="Notify people"
              description="Sends an email with a link to the doc"
              value={notifyPeople}
              onChange={setNotifyPeople}
            />
            {notifyPeople && (
              <TextArea
                label="Message"
                isLabelHidden
                placeholder="Message (optional)"
                rows={2}
                width="100%"
                value={inviteMessage}
                onChange={setInviteMessage}
              />
            )}
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="supporting" color="secondary">
                  Invited as {ROLE_LABEL[inviteRole].toLowerCase()}
                </Text>
              </StackItem>
              <Button
                label="Cancel"
                variant="ghost"
                size="sm"
                onClick={clearInviteComposer}
              />
              <Button
                label={notifyPeople ? 'Send invite' : 'Add without notifying'}
                variant="primary"
                size="sm"
                icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
                onClick={sendInvite}
              />
            </HStack>
          </VStack>
        </div>
      )}
    </VStack>
  );

  // ----- Share tab: people + groups + general access + link row -----

  const shareTab = (
    <VStack gap={4}>
      {inviteComposer}

      {externalPeople.length > 0 && (
        <Banner
          status="warning"
          title="Shared outside Kestrel Labs"
          description={\`\${externalPeople
            .map(person => person.email)
            .join(', ')} \${
            externalPeople.length === 1 ? 'is' : 'are'
          } outside the org.\`}
        />
      )}

      <VStack gap={1}>
        <div style={styles.sectionLabelRow}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="label" color="secondary">
                People with access
              </Text>
            </StackItem>
            {pendingCount > 0 && (
              <Text type="supporting" color="secondary">
                {pendingCount} pending
              </Text>
            )}
          </HStack>
        </div>
        <VStack gap={0}>
          {people.map((person, index) => (
            <div key={person.id}>
              {index > 0 && <Divider />}
              <PersonRow
                person={person}
                isCompact={isCompact}
                onRoleChange={changePersonRole}
                onRemove={removePerson}
              />
            </div>
          ))}
        </VStack>
      </VStack>

      {groups.length > 0 && (
        <VStack gap={1}>
          <div style={styles.sectionLabelRow}>
            <Text type="label" color="secondary">
              Groups with access
            </Text>
          </div>
          <VStack gap={0}>
            {groups.map((group, index) => (
              <div key={group.id}>
                {index > 0 && <Divider />}
                <GroupRow
                  group={group}
                  isCompact={isCompact}
                  onRoleChange={changeGroupRole}
                  onRemove={removeGroup}
                />
              </div>
            ))}
          </VStack>
        </VStack>
      )}

      <VStack gap={1}>
        <div style={styles.sectionLabelRow}>
          <Text type="label" color="secondary">
            General access
          </Text>
        </div>
        <div style={styles.accessRow}>
          <HStack gap={3} vAlign="center">
            <div style={styles.generalAccessIconBubble}>
              <Icon icon={accessMeta.icon} size="sm" color="secondary" />
            </div>
            <StackItem size="fill" style={{minWidth: 0}}>
              <VStack gap={1}>
                <Selector
                  label="General access"
                  isLabelHidden
                  size="sm"
                  width={isCompact ? 180 : 220}
                  options={GENERAL_ACCESS_OPTIONS}
                  value={generalAccess}
                  onChange={value =>
                    changeGeneralAccess(value as GeneralAccess)
                  }
                />
                <Text type="supporting" color="secondary">
                  {accessMeta.description}
                </Text>
              </VStack>
            </StackItem>
            {generalAccess !== 'restricted' && (
              <Selector
                label="Role for anyone opening the link"
                isLabelHidden
                size="sm"
                width={isCompact ? 132 : 150}
                options={ROLE_ONLY_OPTIONS}
                value={linkRole}
                onChange={value => {
                  setLinkRole(value as Role);
                  setIsLinkCopied(false);
                }}
              />
            )}
          </HStack>
        </div>
      </VStack>

      <HStack gap={2} vAlign="center">
        <StackItem size="fill" style={{minWidth: 0}}>
          <div style={styles.linkRow}>
            <HStack gap={2} vAlign="center">
              <Icon icon={Link2Icon} size="sm" color="secondary" />
              <StackItem size="fill" style={{minWidth: 0}}>
                <div style={styles.linkText}>{SHARE_LINK}</div>
              </StackItem>
            </HStack>
          </div>
        </StackItem>
        <Button
          label={isLinkCopied ? 'Copied' : 'Copy link'}
          variant="secondary"
          size="md"
          icon={
            <Icon
              icon={isLinkCopied ? CheckIcon : Link2Icon}
              size="sm"
              color="inherit"
            />
          }
          onClick={() => {
            copyToClipboard(SHARE_LINK);
            setIsLinkCopied(true);
          }}
        />
      </HStack>
    </VStack>
  );

  // ----- Publish tab: publish-to-web controls + access-request queue -----

  const publishTab = (
    <VStack gap={4}>
      <VStack gap={2}>
        <Switch
          label="Published to the web"
          description={
            isPublished
              ? 'A read-only copy is live at the public link below.'
              : 'Publishing creates a read-only public copy of this doc.'
          }
          labelPosition="start"
          labelSpacing="spread"
          width="100%"
          value={isPublished}
          onChange={checked => {
            if (checked) {
              setIsPublished(true);
            } else {
              // Unpublishing kills a live public link — confirm first.
              setIsUnpublishOpen(true);
            }
          }}
        />
        {isPublished && (
          <Text type="supporting" color="secondary">
            First published{' '}
            <Timestamp
              value={PUBLISHED_AT}
              format="date_time"
              hasTooltip={false}
            />{' '}
            · last republished{' '}
            <Timestamp
              value={LAST_REPUBLISHED_AT}
              format="date_time"
              hasTooltip={false}
            />
          </Text>
        )}
      </VStack>

      {isPublished ? (
        <>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill" style={{minWidth: 0}}>
              <div style={styles.linkRow}>
                <HStack gap={2} vAlign="center">
                  <Icon icon={GlobeIcon} size="sm" color="secondary" />
                  <StackItem size="fill" style={{minWidth: 0}}>
                    <div style={styles.linkText}>{PUBLISHED_LINK}</div>
                  </StackItem>
                </HStack>
              </div>
            </StackItem>
            <Button
              label={isPublishedLinkCopied ? 'Copied' : 'Copy link'}
              variant="secondary"
              size="md"
              icon={
                <Icon
                  icon={isPublishedLinkCopied ? CheckIcon : Link2Icon}
                  size="sm"
                  color="inherit"
                />
              }
              onClick={() => {
                copyToClipboard(PUBLISHED_LINK);
                setIsPublishedLinkCopied(true);
              }}
            />
          </HStack>

          <VStack gap={1}>
            <div style={styles.sectionLabelRow}>
              <HStack gap={2} vAlign="center">
                <Icon icon={CodeIcon} size="sm" color="secondary" />
                <Text type="label" color="secondary">
                  Embed on a site
                </Text>
              </HStack>
            </div>
            {/* The snippet fits unwrapped at the 560px dialog width;
                isWrapped + the .share-embed word-break override (see
                EMBED_WRAP_CSS) is the narrow-width (mobile sheet) safety
                net so any forced wrap breaks at spaces, not mid-attribute. */}
            <div className="share-embed">
              <CodeBlock
                code={EMBED_SNIPPET}
                language="html"
                title="Embed snippet"
                hasLanguageLabel={false}
                size="sm"
                width="100%"
                isWrapped
                hasCopyButton
              />
            </div>
          </VStack>

          <Switch
            label="Automatically republish when changes are made"
            description="Edits go live within a few minutes; turn off to republish manually."
            labelPosition="start"
            labelSpacing="spread"
            width="100%"
            value={autoRepublish}
            onChange={setAutoRepublish}
          />
          {!autoRepublish && (
            <Banner
              status="info"
              title="Manual republish is on"
              description="The public copy stays frozen at the last republish until you publish changes again."
            />
          )}
        </>
      ) : (
        <Banner
          status="info"
          title="Not published"
          description="Turn on publishing to get a public link and embed snippet. Sharing settings on the Share tab are unaffected."
        />
      )}

      <Divider />

      <VStack gap={1}>
        <div style={styles.sectionLabelRow}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="label" color="secondary">
                Access requests
              </Text>
            </StackItem>
            <Badge
              label={String(requests.length)}
              variant={requests.length > 0 ? 'blue' : 'neutral'}
            />
          </HStack>
        </div>
        {requests.length === 0 ? (
          <div style={styles.accessRow}>
            <Text type="supporting" color="secondary">
              No pending requests — approvals land in the Share tab’s people
              list.
            </Text>
          </div>
        ) : (
          <VStack gap={0}>
            {requests.map((request, index) => (
              <div key={request.id}>
                {index > 0 && <Divider />}
                <RequestRow
                  request={request}
                  onApprove={approveRequest}
                  onDeny={denyRequest}
                />
              </div>
            ))}
          </VStack>
        )}
      </VStack>
    </VStack>
  );

  // ----- dialog card: pinned title bar + tabs + scrolling body + footer -----

  const dialogCard = (
    <Card
      padding={0}
      width={isCompact ? '100%' : 560}
      maxWidth="100%"
      style={{
        ...styles.dialogCard,
        height: isCompact ? '100%' : undefined,
        maxHeight: isCompact ? '100%' : '84vh',
        borderRadius: isCompact ? 0 : undefined,
      }}
      role="dialog"
      aria-label={\`Share "\${DOC_TITLE}"\`}>
      <div style={styles.titleBar}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill" style={{minWidth: 0}}>
            <Heading level={4} accessibilityLevel={2} maxLines={1}>
              Share “{DOC_TITLE}”
            </Heading>
          </StackItem>
          <IconButton
            label="Close sharing dialog"
            tooltip="Close"
            size="sm"
            variant="ghost"
            icon={<Icon icon={XIcon} size="sm" color="inherit" />}
            onClick={() => setIsDialogOpen(false)}
          />
        </HStack>
      </div>
      <div style={styles.tabRow}>
        <TabList
          value={activeTab}
          onChange={value => setActiveTab(value as ShareTabId)}
          size="md"
          hasDivider>
          <Tab
            value="share"
            label="Share"
            icon={<Icon icon={UserPlusIcon} size="sm" color="inherit" />}
          />
          <Tab
            value="publish"
            label="Publish"
            icon={<Icon icon={GlobeIcon} size="sm" color="inherit" />}
            endContent={
              requests.length > 0 ? (
                <Badge label={String(requests.length)} variant="blue" />
              ) : undefined
            }
          />
        </TabList>
      </div>
      <div style={styles.bodyScroll}>
        {activeTab === 'share' ? shareTab : publishTab}
      </div>
      <Divider />
      <div style={styles.footer}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill" style={{minWidth: 0}}>
            <Text type="supporting" color="secondary" maxLines={1}>
              {summaryText}
            </Text>
          </StackItem>
          <Button
            label="Done"
            variant="primary"
            size="md"
            onClick={() => setIsDialogOpen(false)}
          />
        </HStack>
      </div>
    </Card>
  );

  const dialogLayer = (
    <div
      style={
        isCompact ? styles.dialogLayerMobile : styles.dialogLayerCentered
      }>
      {/* The dark scrim flips the overlay layer into media-dark theming;
          the dialog is a page surface, so re-anchor it to the page's own
          color scheme rather than the scrim's inverted context. */}
      <MediaTheme mode={colorMode}>{dialogCard}</MediaTheme>
    </div>
  );

  return (
    <div style={styles.root}>
      <style>{EMBED_WRAP_CSS}</style>
      <Overlay
        isOpen
        // Dismissing the dialog drops the dim so the doc reads as the page
        // again; the backdrop's Share button reopens it.
        scrim={isDialogOpen ? 'dark' : false}
        position="fill"
        align="start"
        style={styles.overlay}
        content={isDialogOpen ? dialogLayer : <span />}>
        <DocBackdrop
          isInert={isDialogOpen}
          isCompact={isCompact}
          onShare={() => {
            setActiveTab('share');
            setIsDialogOpen(true);
          }}
        />
      </Overlay>

      <AlertDialog
        isOpen={isUnpublishOpen}
        onOpenChange={setIsUnpublishOpen}
        title="Unpublish this doc?"
        description={\`The public link and any embeds of "\${DOC_TITLE}" will stop working immediately. People and groups on the Share tab keep their access.\`}
        actionLabel="Unpublish"
        cancelLabel="Keep published"
        onAction={() => {
          setIsPublished(false);
          setIsPublishedLinkCopied(false);
          setIsUnpublishOpen(false);
        }}
      />
    </div>
  );
}
`;export{e as default};