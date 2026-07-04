var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file invite-teammates-modal.tsx
 * @input Deterministic fixtures only: the Kestrel Labs "Atlas Q3 team
 *   space" (9 members — the established roster), three typed invite chips
 *   (noor.hassan@ and ava.lindqvist@kestrellabs.com valid,
 *   'ben.okafor@kestrel' invalid), a prefilled welcome message naming the
 *   "Atlas Q3 Launch Plan" doc and #atlas-q3, a fixed invite link
 *   kestrel.team/join/atlas-q3-8f3k2 with a 7-day expiry, and the
 *   guest-variant invitee lena.fischer@brightloop.io (beta-cohort
 *   customer). No clocks, no randomness, no network assets.
 * @output Invite Teammates Modal — three side-by-side specimens of the
 *   Kestrel Labs workspace-invite dialog, each frozen at one point in the
 *   flow: specimen 01 is the open compose state — email chips input (two
 *   valid Tokens, one invalid chip with a red wavy underline and a
 *   detached FieldStatus hint), per-invite Member/Guest role Selectors,
 *   the workspace-preview row (icon tile, name, '9 members'), a prefilled
 *   personal-message TextArea, the invite-link section (mono link, Copy
 *   button with Copied state, link-role Selector, 'Expires in 7 days'
 *   chip, regenerate affordance), and a count-bearing primary action
 *   ('Send 3 invites' that tracks chip removal live); specimen 02 is the
 *   sent confirmation — two success rows with Pending badges and Resend
 *   affordances plus one row converted to an 'Already in workspace'
 *   status with a 'Joined Jul 1' note (Ava Lindqvist); specimen 03 is the
 *   guest-warning
 *   variant — Guest selected on the role Selector reveals a limited-access
 *   note and a warning Banner spelling out what guests cannot see.
 * @position Block template; emitted by \`astryx template invite-teammates-modal\`
 *
 * Frame: no app shell — this is an INDIVIDUAL SMALL EXPERIENCE per the
 * specimen-gallery idiom. A full-bleed stage div (minHeight 100dvh, token
 * muted wash with ONE soft warm radial tint) centers a small header and a
 * wrapping specimen row; each specimen is a 440px-wide modal card at its
 * true dialog width, with a caption row (mono state-id Token + one-line
 * note) ABOVE the card. The dialogs render statically pinned — no Overlay
 * scrim — so all three states sit side by side and stay comparable.
 *
 * Responsive contract:
 * - >=1440px: the three specimens sit side by side, top-aligned, centered.
 * - <1440px: the specimen row flex-wraps (2+1, then a single stacked
 *   column); each card keeps width:min(440px, 100%) so nothing clips at
 *   375px.
 * - Inside the card: chips wrap inside the input box; the invite-link row,
 *   role rows, and footer wrap (flexWrap) instead of clipping; the mono
 *   link truncates with ellipsis, never mid-layout overflow.
 *
 * Container policy (specimen-gallery archetype): the modal card is
 * hand-rolled dialog chrome in the repo style-object idiom (card surface,
 * token radius, shadow-high) because it IS the product surface being
 * specimened — no design-system Card. Astryx supplies text primitives,
 * stacks, Avatar/Badge/Banner/Token, Selector, TextArea, FieldStatus, and
 * the buttons.
 *
 * Color policy: token-pure throughout — accent arrives via the primary
 * Button, Selectors, Tokens, and the workspace tile
 * (var(--color-accent-muted) wash); error state via var(--color-error) on
 * the invalid chip's wavy underline and the FieldStatus hint; warning and
 * success via Banner/Badge semantics. The stage adds ONE soft warm radial
 * tint (explicit light-dark literal) over the token muted background. No
 * scheme-locked surfaces.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {HStack, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {FieldStatus} from '@astryxdesign/core/FieldStatus';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Selector} from '@astryxdesign/core/Selector';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {
  CheckIcon,
  CompassIcon,
  CopyIcon,
  LinkIcon,
  RefreshCwIcon,
  SendIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

// ONE soft warm tint over the muted stage — Team Workspace's collaborative
// warmth; matches the repo-standard categorical-orange hue pair.
const STAGE_TINT = 'light-dark(rgba(235,110,0,0.08), rgba(255,147,48,0.10))';

const styles: Record<string, CSSProperties> = {
  // Full-bleed muted stage; centers header + wrapping specimen row.
  stage: {
    minHeight: '100dvh',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-background-muted)',
    backgroundImage: \`radial-gradient(1200px 480px at 50% -100px, \${STAGE_TINT}, transparent 70%)\`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-6)',
    paddingBlock: 'var(--spacing-8)',
    paddingInline: 'var(--spacing-4)',
  },
  stageHeader: {textAlign: 'center', maxWidth: 640},
  specimenRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 'var(--spacing-6)',
  },
  // Each specimen renders at true dialog width; caption row sits above.
  specimen: {
    width: 'min(440px, 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  // Hand-rolled dialog chrome — the surface being specimened.
  modalCard: {
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-background-card)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    boxShadow: 'var(--shadow-high)',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-4)',
    paddingBottom: 'var(--spacing-3)',
  },
  modalBody: {
    padding: 'var(--spacing-4)',
    paddingTop: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  modalFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-4)',
    paddingTop: 'var(--spacing-3)',
    flexWrap: 'wrap',
  },
  // Workspace-preview row: icon tile + name + member count.
  workspaceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
  },
  workspaceTile: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'var(--color-accent-muted)',
    color: 'var(--color-accent)',
    flexShrink: 0,
  },
  memberCount: {flexShrink: 0},
  // Chips input box: wraps Tokens + the invalid chip + placeholder text.
  chipsBox: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    padding: 'var(--spacing-2)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    cursor: 'text',
  },
  // Invalid chip: red wavy underline on the label + error border.
  invalidChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 3,
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-error)',
  },
  invalidChipLabel: {
    fontSize: 12,
    textDecorationLine: 'underline',
    textDecorationStyle: 'wavy',
    textDecorationColor: 'var(--color-error)',
    textUnderlineOffset: 2,
  },
  chipRemoveButton: {
    appearance: 'none',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    padding: 0,
    color: 'var(--color-text-secondary)',
  },
  chipsPlaceholder: {paddingInline: 'var(--spacing-1)'},
  // Per-invite role rows: avatar + email fill, Selector keeps width.
  roleRowText: {minWidth: 0},
  roleSelect: {width: 132, flexShrink: 0},
  guestNote: {paddingInlineStart: 'calc(24px + var(--spacing-2))'},
  // Invite-link section.
  linkBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
  },
  linkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  mono: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
    flex: 1,
  },
  // Sent-confirmation rows.
  sentRowText: {minWidth: 0},
  alreadyMemberIcon: {flexShrink: 0},
};

// ============= FIXTURES =============
// Kestrel Labs / Atlas Q3 world (suite anchor: Wed Jul 15, 2026). The
// 9-member count matches the established roster (7 veterans + Ava + Ken);
// Ava Lindqvist joined Jul 1, so her invite resolves to already-a-member.

const WORKSPACE = {
  name: 'Atlas Q3 team space',
  org: 'Kestrel Labs',
  memberCount: 9,
};

const INVITE_LINK = 'kestrel.team/join/atlas-q3-8f3k2';
const REGENERATED_LINK = 'kestrel.team/join/atlas-q3-1c9d7';
const LINK_EXPIRY_LABEL = '7 days';

const WELCOME_MESSAGE =
  "Welcome to Atlas Q3! Start with the 'Atlas Q3 Launch Plan' doc and say hi in #atlas-q3 — the daily standup is async.";

type InviteRole = 'member' | 'guest';

const ROLE_OPTIONS = [
  {value: 'member', label: 'Member'},
  {value: 'guest', label: 'Guest'},
];

const GUEST_LIMIT_NOTE = 'Guests only see channels and docs shared with them.';

interface InviteChip {
  id: string;
  email: string;
  name: string;
  isValid: boolean;
}

const COMPOSE_CHIPS: InviteChip[] = [
  {
    id: 'inv-noor',
    email: 'noor.hassan@kestrellabs.com',
    name: 'Noor Hassan',
    isValid: true,
  },
  {
    id: 'inv-ava',
    email: 'ava.lindqvist@kestrellabs.com',
    name: 'Ava Lindqvist',
    isValid: true,
  },
  {
    id: 'inv-ben',
    email: 'ben.okafor@kestrel',
    name: 'Ben Okafor',
    isValid: false,
  },
];

const INVALID_HINT =
  "'ben.okafor@kestrel' isn't a valid email — did you mean ben.okafor@kestrellabs.com?";

// Specimen 02: the same batch after the typo was fixed and Send pressed.
interface SentRow {
  id: string;
  email: string;
  name: string;
  outcome: 'pending' | 'alreadyMember';
  detail: string;
}

const SENT_ROWS: SentRow[] = [
  {
    id: 'sent-noor',
    email: 'noor.hassan@kestrellabs.com',
    name: 'Noor Hassan',
    outcome: 'pending',
    detail: 'Member · sent Jul 15 · expires Jul 22',
  },
  {
    id: 'sent-ben',
    email: 'ben.okafor@kestrellabs.com',
    name: 'Ben Okafor',
    outcome: 'pending',
    detail: 'Member · sent Jul 15 · expires Jul 22',
  },
  {
    id: 'sent-ava',
    email: 'ava.lindqvist@kestrellabs.com',
    name: 'Ava Lindqvist',
    outcome: 'alreadyMember',
    detail: 'Joined Jul 1 · no invite sent',
  },
];

// Specimen 03: external beta-cohort guest (cohort expands Jul 21).
const GUEST_CHIP: InviteChip = {
  id: 'inv-lena',
  email: 'lena.fischer@brightloop.io',
  name: 'Lena Fischer',
  isValid: true,
};

const GUEST_MESSAGE =
  "Hi Lena — excited to have Brightloop in the Atlas beta! I've shared 'Beta Feedback Themes' so you can see what we're hearing before the cohort expands on Jul 21.";

const GUEST_BANNER_DESCRIPTION =
  "Guests can't browse the member roster, workspace search, or the pinned docs rail — they see only what you explicitly share. Lena will land in #atlas-q3-beta with view access to 'Beta Feedback Themes'.";

// ============= SHARED PIECES =============

/** Caption row (mono state-id Token + one-line note) above each dialog. */
function Specimen({
  stateId,
  note,
  children,
}: {
  stateId: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <div style={styles.specimen}>
      <HStack gap={2} vAlign="center">
        {/* flexShrink 0 so a wrapping note never truncates the state id. */}
        <span style={{flexShrink: 0}}>
          <Token label={stateId} size="sm" color="gray" />
        </span>
        <Text type="supporting" color="secondary">
          {note}
        </Text>
      </HStack>
      {children}
    </div>
  );
}

/** Hand-rolled dialog chrome: title row + close, body stack, footer. */
function ModalShell({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <div style={styles.modalCard} role="group" aria-label={title}>
      <div style={styles.modalHeader}>
        <StackItem size="fill">
          <VStack gap={0}>
            <Heading level={2}>{title}</Heading>
            <Text type="supporting" color="secondary">
              {subtitle}
            </Text>
          </VStack>
        </StackItem>
        <IconButton
          label={\`Close \${title}\`}
          tooltip="Close"
          icon={<Icon icon={XIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          onClick={() => {}}
        />
      </div>
      <div style={styles.modalBody}>{children}</div>
      <Divider />
      <div style={styles.modalFooter}>{footer}</div>
    </div>
  );
}

/** Workspace-preview row: icon tile, name/org, member count. */
function WorkspaceRow() {
  return (
    <div style={styles.workspaceRow}>
      <span style={styles.workspaceTile} aria-hidden>
        <Icon icon={CompassIcon} size="sm" color="inherit" />
      </span>
      <StackItem size="fill" style={styles.roleRowText}>
        <VStack gap={0}>
          <Text type="label" size="sm" maxLines={1}>
            {WORKSPACE.name}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {WORKSPACE.org}
          </Text>
        </VStack>
      </StackItem>
      <HStack gap={1} vAlign="center" style={styles.memberCount}>
        <Icon icon={UsersIcon} size="xsm" color="secondary" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {WORKSPACE.memberCount} members
        </Text>
      </HStack>
    </div>
  );
}

/**
 * Invite-link section: mono link + Copy (Copied state), link-role
 * Selector, expiry chip, and a regenerate affordance that swaps to the
 * fixed alternate link (deterministic — no randomness).
 */
function InviteLinkSection() {
  const [link, setLink] = useState(INVITE_LINK);
  const [hasCopied, setHasCopied] = useState(false);
  const [linkRole, setLinkRole] = useState<string>('member');
  const isRegenerated = link === REGENERATED_LINK;

  return (
    <div style={styles.linkBox}>
      <HStack gap={2} vAlign="center" style={{flexWrap: 'wrap'}}>
        <Icon icon={LinkIcon} size="xsm" color="secondary" />
        <Text type="label" size="sm">
          Or share an invite link
        </Text>
        <StackItem size="fill" />
        <Token label={\`Expires in \${LINK_EXPIRY_LABEL}\`} size="sm" color="gray" />
      </HStack>
      <div style={styles.linkRow}>
        <span style={styles.mono} title={link}>
          {link}
        </span>
        <Button
          label={hasCopied ? 'Copied' : 'Copy'}
          variant="secondary"
          size="sm"
          icon={
            <Icon
              icon={hasCopied ? CheckIcon : CopyIcon}
              size="sm"
              color="inherit"
            />
          }
          onClick={() => setHasCopied(true)}
        />
        <Tooltip content="Regenerate — the old link stops working">
          <IconButton
            label="Regenerate invite link"
            icon={<Icon icon={RefreshCwIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            onClick={() => {
              setLink(prev =>
                prev === INVITE_LINK ? REGENERATED_LINK : INVITE_LINK,
              );
              setHasCopied(false);
            }}
          />
        </Tooltip>
      </div>
      <HStack gap={2} vAlign="center" style={{flexWrap: 'wrap'}}>
        <Text type="supporting" color="secondary">
          Anyone with the link joins as
        </Text>
        <div style={styles.roleSelect}>
          <Selector
            label="Link role"
            isLabelHidden
            size="sm"
            options={ROLE_OPTIONS}
            value={linkRole}
            onChange={setLinkRole}
          />
        </div>
        {isRegenerated ? (
          <Text type="supporting" color="secondary">
            New link — previous link revoked
          </Text>
        ) : null}
      </HStack>
    </div>
  );
}

/**
 * Per-invite role row: avatar + email fill the row; the Member/Guest
 * Selector keeps fixed width. Guest selection reveals the limited-access
 * note; the invalid chip's row is disabled until the address is fixed.
 */
function InviteRoleRow({
  chip,
  role,
  onRoleChange,
}: {
  chip: InviteChip;
  role: InviteRole;
  onRoleChange: (next: InviteRole) => void;
}) {
  return (
    <VStack gap={1}>
      <HStack gap={2} vAlign="center">
        <Avatar name={chip.name} size="xsmall" />
        <StackItem size="fill" style={styles.roleRowText}>
          <VStack gap={0}>
            <Text size="sm" maxLines={1}>
              {chip.email}
            </Text>
            {!chip.isValid && (
              <Text type="supporting" style={{color: 'var(--color-error)'}}>
                Fix the address to set a role
              </Text>
            )}
          </VStack>
        </StackItem>
        <div style={styles.roleSelect}>
          <Selector
            label={\`Role for \${chip.email}\`}
            isLabelHidden
            size="sm"
            options={ROLE_OPTIONS}
            value={role}
            onChange={next => onRoleChange(next as InviteRole)}
            isDisabled={!chip.isValid}
          />
        </div>
      </HStack>
      {chip.isValid && role === 'guest' ? (
        <div style={styles.guestNote}>
          <Text type="supporting" color="secondary">
            {GUEST_LIMIT_NOTE}
          </Text>
        </div>
      ) : null}
    </VStack>
  );
}

// ============= SPECIMEN 01 · COMPOSE =============

function ComposeSpecimen() {
  const [chips, setChips] = useState<InviteChip[]>(COMPOSE_CHIPS);
  const [roles, setRoles] = useState<Record<string, InviteRole>>({
    'inv-noor': 'member',
    'inv-ava': 'member',
    'inv-ben': 'member',
  });
  const [message, setMessage] = useState(WELCOME_MESSAGE);

  const hasInvalid = chips.some(chip => !chip.isValid);
  const inviteCount = chips.length;
  const removeChip = (id: string) => {
    setChips(prev => prev.filter(chip => chip.id !== id));
  };

  return (
    <Specimen
      stateId="01 · compose"
      note="Open modal: 3 chips (one invalid), per-invite roles, link section.">
      <ModalShell
        title="Invite teammates"
        subtitle="They'll get an email with your note and a join link."
        footer={
          <>
            <Text type="supporting" color="secondary">
              Invites expire in {LINK_EXPIRY_LABEL}
            </Text>
            <StackItem size="fill" />
            <Button
              label="Cancel"
              variant="secondary"
              size="sm"
              onClick={() => {}}
            />
            <Button
              label={\`Send \${inviteCount} invite\${inviteCount === 1 ? '' : 's'}\`}
              size="sm"
              icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
              isDisabled={inviteCount === 0}
              onClick={() => {}}
            />
          </>
        }>
        <VStack gap={2}>
          <Text type="label" size="sm">
            Invite by email
          </Text>
          <div style={styles.chipsBox}>
            {chips.map(chip =>
              chip.isValid ? (
                <Token
                  key={chip.id}
                  label={chip.email}
                  size="sm"
                  onRemove={() => removeChip(chip.id)}
                />
              ) : (
                <span key={chip.id} style={styles.invalidChip}>
                  <span style={styles.invalidChipLabel}>{chip.email}</span>
                  <button
                    type="button"
                    style={styles.chipRemoveButton}
                    aria-label={\`Remove \${chip.email}\`}
                    onClick={() => removeChip(chip.id)}>
                    <Icon icon={XIcon} size="xsm" color="inherit" />
                  </button>
                </span>
              ),
            )}
            <span style={styles.chipsPlaceholder}>
              <Text type="supporting" color="secondary">
                Add more emails…
              </Text>
            </span>
          </div>
          {hasInvalid ? (
            <FieldStatus
              variant="detached"
              type="error"
              message={INVALID_HINT}
            />
          ) : null}
        </VStack>

        {chips.length > 0 && (
          <VStack gap={2}>
            <Text type="label" size="sm">
              Roles
            </Text>
            <VStack gap={2}>
              {chips.map(chip => (
                <InviteRoleRow
                  key={chip.id}
                  chip={chip}
                  role={roles[chip.id] ?? 'member'}
                  onRoleChange={next =>
                    setRoles(prev => ({...prev, [chip.id]: next}))
                  }
                />
              ))}
            </VStack>
          </VStack>
        )}

        <WorkspaceRow />

        <TextArea
          label="Personal message"
          rows={3}
          width="100%"
          value={message}
          onChange={setMessage}
        />

        <InviteLinkSection />
      </ModalShell>
    </Specimen>
  );
}

// ============= SPECIMEN 02 · SENT CONFIRMATION =============

function SentRowItem({row}: {row: SentRow}) {
  const [hasResent, setHasResent] = useState(false);
  const isPending = row.outcome === 'pending';

  return (
    <HStack gap={2} vAlign="center">
      <Avatar name={row.name} size="xsmall" />
      <StackItem size="fill" style={styles.sentRowText}>
        <VStack gap={0}>
          <Text size="sm" maxLines={1}>
            {row.email}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {row.detail}
          </Text>
        </VStack>
      </StackItem>
      {isPending ? (
        <>
          <Badge label="Pending" variant="warning" />
          {hasResent ? (
            <HStack gap={1} vAlign="center">
              <Icon icon={CheckIcon} size="xsm" color="success" />
              <Text type="supporting" color="secondary">
                Resent
              </Text>
            </HStack>
          ) : (
            <Button
              label="Resend"
              variant="ghost"
              size="sm"
              onClick={() => setHasResent(true)}
            />
          )}
        </>
      ) : (
        <HStack gap={1} vAlign="center" style={styles.alreadyMemberIcon}>
          <Icon icon={CheckIcon} size="xsm" color="success" />
          <Text type="supporting" color="secondary">
            Already in workspace
          </Text>
        </HStack>
      )}
    </HStack>
  );
}

function SentSpecimen() {
  return (
    <Specimen
      stateId="02 · sent"
      note="Confirmation: 2 pending invites with resend; Ava was already in.">
      <ModalShell
        title="Invites sent"
        subtitle="2 invites sent · 1 already a member"
        footer={
          <>
            <Button
              label="Invite more"
              variant="secondary"
              size="sm"
              onClick={() => {}}
            />
            <StackItem size="fill" />
            <Button label="Done" size="sm" onClick={() => {}} />
          </>
        }>
        <Banner
          status="success"
          title="Invites on their way"
          description={\`Noor and Ben will get an email with your welcome note and a join link that expires in \${LINK_EXPIRY_LABEL}.\`}
        />
        <VStack gap={3}>
          {SENT_ROWS.map(row => (
            <SentRowItem key={row.id} row={row} />
          ))}
        </VStack>
        <WorkspaceRow />
      </ModalShell>
    </Specimen>
  );
}

// ============= SPECIMEN 03 · GUEST WARNING =============

function GuestSpecimen() {
  const [role, setRole] = useState<InviteRole>('guest');
  const [message, setMessage] = useState(GUEST_MESSAGE);

  return (
    <Specimen
      stateId="03 · guest-warning"
      note="Guest role selected: limited-access note plus warning banner.">
      <ModalShell
        title="Invite teammates"
        subtitle="Beta-cohort guest · Brightloop"
        footer={
          <>
            <Text type="supporting" color="secondary">
              Invites expire in {LINK_EXPIRY_LABEL}
            </Text>
            <StackItem size="fill" />
            <Button
              label="Cancel"
              variant="secondary"
              size="sm"
              onClick={() => {}}
            />
            <Button
              label="Send 1 invite"
              size="sm"
              icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
              onClick={() => {}}
            />
          </>
        }>
        <VStack gap={2}>
          <Text type="label" size="sm">
            Invite by email
          </Text>
          <div style={styles.chipsBox}>
            <Token
              label={GUEST_CHIP.email}
              size="sm"
              onRemove={() => {}}
            />
            <span style={styles.chipsPlaceholder}>
              <Text type="supporting" color="secondary">
                Add more emails…
              </Text>
            </span>
          </div>
        </VStack>
        <VStack gap={2}>
          <Text type="label" size="sm">
            Roles
          </Text>
          <InviteRoleRow chip={GUEST_CHIP} role={role} onRoleChange={setRole} />
        </VStack>
        {role === 'guest' ? (
          <Banner
            status="warning"
            title="Inviting as a guest"
            description={GUEST_BANNER_DESCRIPTION}
          />
        ) : null}
        <WorkspaceRow />
        <TextArea
          label="Personal message"
          rows={3}
          width="100%"
          value={message}
          onChange={setMessage}
        />
      </ModalShell>
    </Specimen>
  );
}

// ============= PAGE =============

export default function InviteTeammatesModalTemplate() {
  return (
    <div style={styles.stage}>
      <div style={styles.stageHeader}>
        <VStack gap={1} hAlign="center">
          <Heading level={1}>Invite Teammates Modal — 3 specimens</Heading>
          <Text type="supporting" color="secondary">
            Kestrel Labs · Atlas Q3 team space · deterministic fixtures
          </Text>
        </VStack>
      </div>
      <div style={styles.specimenRow}>
        <ComposeSpecimen />
        <SentSpecimen />
        <GuestSpecimen />
      </div>
    </div>
  );
}
`;export{e as default};