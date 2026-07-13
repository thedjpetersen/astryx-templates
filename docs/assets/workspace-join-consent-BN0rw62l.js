var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (workspace invite with member roster,
 *   OAuth client permission list, device-authorization code and requesting
 *   CLI metadata; fixed dates around 2026-07)
 * @output Centered auth-flow page presenting three sequential consent cards
 *   switched by a numbered stepper in page chrome: a workspace INVITE card
 *   (workspace tile + mono hashtag, description, MEMBERS AvatarGroup with a
 *   crown-marked admin, Decline/Join — joining animates through staged
 *   Spinner text to a success check), an OAUTH consent card (requesting-app
 *   tile, PERMISSIONS REQUESTED rows with check icons, Deny/Authorize with
 *   denied and granted terminal states), and a DEVICE card (giant tracked
 *   mono pairing code, requesting-CLI metadata, Cancel/Authorize with
 *   success and canceled states). Completed flows tick their stepper step.
 * @position Page template; emitted by \`astryx template workspace-join-consent\`
 *
 * Frame: Layout height="fill". LayoutContent (padding 0) hosts a muted
 * backdrop that vertically centers a single ~460px column: brand row,
 * stepper, the active consent Card, and a signed-in footer caption. No
 * header chrome — these surfaces render outside the signed-in app shell.
 *
 * Responsive contract:
 * - Mobile-first single centered column: the Card is width 100% with
 *   maxWidth 460, so no ResizeObserver is needed — the column simply
 *   narrows with the page.
 * - The stepper keeps short labels (Invite / OAuth / Device) so all three
 *   steps fit at 320px; connector lines flex-shrink.
 * - Action rows are right-aligned pairs that keep intrinsic width; the
 *   device code scales its tracking, not its glyph count, so it never
 *   wraps above ~300px.
 */

import {useEffect, useState, type CSSProperties} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {AvatarGroup} from '@astryxdesign/core/AvatarGroup';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Spinner} from '@astryxdesign/core/Spinner';
import {
  BotIcon,
  Building2Icon,
  CheckCircle2Icon,
  CheckIcon,
  CrownIcon,
  FeatherIcon,
  TerminalIcon,
} from 'lucide-react';

// ============= STYLES =============

const MONO_FONT = 'ui-monospace, SFMono-Regular, Menlo, monospace';

const styles: Record<string, CSSProperties> = {
  // Muted backdrop; the column is vertically centered but still scrolls
  // when the viewport is shorter than the card (margin auto, not fixed).
  backdrop: {
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-6) var(--spacing-4)',
  },
  column: {
    width: '100%',
    maxWidth: 460,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-accent-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  // Stepper: numbered circles joined by hairlines; completed steps tick.
  stepButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 'var(--spacing-1)',
    borderRadius: 'var(--radius-container)',
    font: 'inherit',
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'var(--border-width) solid var(--color-border)',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  stepCircleActive: {
    borderColor: 'var(--color-accent)',
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-accent)',
  },
  stepCircleDone: {
    borderColor: 'var(--color-success)',
    color: 'var(--color-success)',
  },
  stepConnector: {
    height: 1,
    flex: '1 1 12px',
    minWidth: 8,
    maxWidth: 32,
    backgroundColor: 'var(--color-border)',
  },
  // 11px uppercase tracked section eyebrows.
  eyebrow: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  tile: {
    width: 40,
    height: 40,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-accent-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  memberNames: {minWidth: 0},
  // Giant tracked device code; trailing letter-spacing is trimmed via
  // paddingLeft so the glyph run stays optically centered.
  deviceCode: {
    fontFamily: MONO_FONT,
    fontSize: 38,
    fontWeight: 600,
    letterSpacing: '0.22em',
    paddingLeft: '0.22em',
    color: 'var(--color-text-primary)',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
  deviceCodeBox: {
    border: 'var(--border-width) dashed var(--color-border-emphasized)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    paddingBlock: 'var(--spacing-4)',
    paddingInline: 'var(--spacing-3)',
  },
  monoText: {fontFamily: MONO_FONT},
  outcomeRow: {paddingBlock: 'var(--spacing-1)'},
};

// ============= DATA =============
// Deterministic fixtures: fixed dates, no clocks, no randomness.

const PLATFORM_NAME = 'Skylark';
const SIGNED_IN_AS = 'maya.chen@skylark.dev';

type StepId = 'invite' | 'oauth' | 'device';

const STEPS: ReadonlyArray<{id: StepId; ordinal: number; label: string}> = [
  {id: 'invite', ordinal: 1, label: 'Invite'},
  {id: 'oauth', ordinal: 2, label: 'OAuth'},
  {id: 'device', ordinal: 3, label: 'Device'},
];

const INVITE = {
  workspaceName: 'Meridian Labs',
  workspaceTag: '#meridian-labs',
  invitedBy: 'Priya Raman',
  expiresNote: 'expires Jul 20, 2026',
  description:
    'Shared agent workspace for the Meridian platform team — deploy ' +
    'sessions, incident runbooks, and the shared skill set for the atlas ' +
    'monorepo live here.',
  members: [
    {id: 'mb-1', name: 'Priya Raman', isAdmin: true},
    {id: 'mb-2', name: 'Marcus Chen', isAdmin: false},
    {id: 'mb-3', name: 'Sofia Alvarez', isAdmin: false},
    {id: 'mb-4', name: 'Devon Park', isAdmin: false},
  ],
};

const OAUTH = {
  appName: 'DeployBot',
  appMeta: 'deploybot.example.com · first authorization',
  permissions: [
    {
      id: 'perm-1',
      label: 'Create and send messages to sessions',
      detail: 'Post prompts and replies into sessions in your workspaces',
    },
    {
      id: 'perm-2',
      label: 'Access sandbox and skill APIs',
      detail: 'Run commands in your sandboxes and invoke installed skills',
    },
  ],
};

const DEVICE = {
  code: 'WXK4-92LF',
  client: 'skylark-cli v2.4.1',
  host: 'mac-studio · 192.0.2.44',
  requestedNote: 'requested Jul 12, 2026 at 09:41',
};

// Staged join animation timings (ms). Deterministic order, fixed delays.
const JOIN_STAGE_MS = 1100;
const SETUP_STAGE_MS = 1400;

type InvitePhase = 'idle' | 'declined' | 'joining' | 'setting-up' | 'ready';
type OauthPhase = 'idle' | 'denied' | 'authorized';
type DevicePhase = 'idle' | 'canceled' | 'authorized';

// ============= SHARED PIECES =============

function Eyebrow({children}: {children: string}) {
  return (
    <Text type="label" size="sm" color="secondary" style={styles.eyebrow}>
      {children}
    </Text>
  );
}

/** Terminal success line: green check + message (+ optional caption). */
function SuccessRow({text, caption}: {text: string; caption?: string}) {
  return (
    <VStack gap={1} style={styles.outcomeRow}>
      <HStack gap={2} vAlign="center">
        <Icon icon={CheckCircle2Icon} size="md" color="success" />
        <Text type="label">{text}</Text>
      </HStack>
      {caption != null && (
        <Text type="supporting" color="secondary">
          {caption}
        </Text>
      )}
    </VStack>
  );
}

/** In-flight line: Spinner + staged status text. */
function PendingRow({text}: {text: string}) {
  return (
    <HStack gap={2} vAlign="center" style={styles.outcomeRow}>
      <Spinner size="sm" aria-label={text} />
      <Text type="label" color="secondary">
        {text}
      </Text>
    </HStack>
  );
}

// ============= INVITE CARD =============

function InviteCard({
  phase,
  onJoin,
  onDecline,
  onReset,
}: {
  phase: InvitePhase;
  onJoin: () => void;
  onDecline: () => void;
  onReset: () => void;
}) {
  const admin = INVITE.members.find(member => member.isAdmin);
  const others = INVITE.members.filter(member => !member.isAdmin);

  return (
    <Card padding={5}>
      <VStack gap={4}>
        <VStack gap={1}>
          <Heading level={2}>You've been invited to join a workspace</Heading>
          <Text type="supporting" color="secondary">
            Invited by {INVITE.invitedBy} · {INVITE.expiresNote}
          </Text>
        </VStack>

        <VStack gap={2}>
          <Eyebrow>Workspace</Eyebrow>
          <HStack gap={3} vAlign="center">
            <div style={styles.tile}>
              <Icon icon={Building2Icon} size="md" color="accent" />
            </div>
            <VStack gap={0}>
              <Text type="label">{INVITE.workspaceName}</Text>
              <Text
                type="code"
                size="sm"
                color="secondary"
                style={styles.monoText}>
                {INVITE.workspaceTag}
              </Text>
            </VStack>
          </HStack>
        </VStack>

        <VStack gap={2}>
          <Eyebrow>Description</Eyebrow>
          <Text type="body" color="secondary">
            {INVITE.description}
          </Text>
        </VStack>

        <VStack gap={2}>
          <Eyebrow>{\`Members (\${INVITE.members.length})\`}</Eyebrow>
          <HStack gap={3} vAlign="center">
            <AvatarGroup size="small" aria-label="Workspace members">
              {INVITE.members.map(member => (
                <Avatar key={member.id} name={member.name} />
              ))}
            </AvatarGroup>
            <VStack gap={0} style={styles.memberNames}>
              {admin != null && (
                <HStack gap={1} vAlign="center">
                  <Text type="supporting">{admin.name}</Text>
                  <Icon icon={CrownIcon} size="sm" color="warning" />
                  <Text type="supporting" color="secondary">
                    (admin)
                  </Text>
                </HStack>
              )}
              <Text type="supporting" color="secondary" maxLines={1}>
                {others.map(member => member.name).join(' · ')}
              </Text>
            </VStack>
          </HStack>
        </VStack>

        <Divider />

        {phase === 'idle' && (
          <HStack gap={2} vAlign="center">
            <StackItem size="fill" />
            <Button label="Decline" variant="ghost" onClick={onDecline} />
            <Button label="Join Workspace" variant="primary" onClick={onJoin} />
          </HStack>
        )}
        {phase === 'declined' && (
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                Invitation declined. You can still join until it expires.
              </Text>
            </StackItem>
            <Button label="Reconsider" variant="secondary" onClick={onReset} />
          </HStack>
        )}
        {phase === 'joining' && <PendingRow text="Joining workspace…" />}
        {phase === 'setting-up' && <PendingRow text="Setting up workspace…" />}
        {phase === 'ready' && (
          <SuccessRow
            text="Workspace ready — redirecting…"
            caption={\`You are now a member of \${INVITE.workspaceName}.\`}
          />
        )}
      </VStack>
    </Card>
  );
}

// ============= OAUTH CARD =============

function OauthCard({
  phase,
  onAuthorize,
  onDeny,
  onReset,
}: {
  phase: OauthPhase;
  onAuthorize: () => void;
  onDeny: () => void;
  onReset: () => void;
}) {
  return (
    <Card padding={5}>
      <VStack gap={4}>
        <VStack gap={1}>
          <Heading level={2}>Authorize Application</Heading>
          <Text type="body" color="secondary">
            <strong>{OAUTH.appName}</strong> is requesting access to your{' '}
            {PLATFORM_NAME} account
          </Text>
        </VStack>

        <HStack gap={3} vAlign="center">
          <div style={styles.tile}>
            <Icon icon={BotIcon} size="md" color="accent" />
          </div>
          <VStack gap={0}>
            <Text type="label">{OAUTH.appName}</Text>
            <Text type="supporting" color="secondary">
              {OAUTH.appMeta}
            </Text>
          </VStack>
        </HStack>

        <VStack gap={2}>
          <Eyebrow>Permissions requested</Eyebrow>
          <VStack gap={2}>
            {OAUTH.permissions.map(permission => (
              <HStack key={permission.id} gap={2} vAlign="start">
                <Icon icon={CheckIcon} size="sm" color="success" />
                <VStack gap={0}>
                  <Text type="body">{permission.label}</Text>
                  <Text type="supporting" color="secondary">
                    {permission.detail}
                  </Text>
                </VStack>
              </HStack>
            ))}
          </VStack>
        </VStack>

        <Text type="supporting" color="secondary">
          {OAUTH.appName} will never see your {PLATFORM_NAME} credentials, and
          you can revoke this access at any time from workspace settings.
        </Text>

        <Divider />

        {phase === 'idle' && (
          <HStack gap={2} vAlign="center">
            <StackItem size="fill" />
            <Button label="Deny" variant="ghost" onClick={onDeny} />
            <Button label="Authorize" variant="primary" onClick={onAuthorize} />
          </HStack>
        )}
        {phase === 'denied' && (
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                Authorization denied. No access was granted.
              </Text>
            </StackItem>
            <Button label="Start over" variant="secondary" onClick={onReset} />
          </HStack>
        )}
        {phase === 'authorized' && (
          <SuccessRow
            text={\`\${OAUTH.appName} authorized\`}
            caption="Returning you to the application…"
          />
        )}
      </VStack>
    </Card>
  );
}

// ============= DEVICE CARD =============

function DeviceCard({
  phase,
  onAuthorize,
  onCancel,
  onReset,
}: {
  phase: DevicePhase;
  onAuthorize: () => void;
  onCancel: () => void;
  onReset: () => void;
}) {
  return (
    <Card padding={5}>
      <VStack gap={4}>
        <VStack gap={1}>
          <Heading level={2}>Authorize CLI</Heading>
          <Text type="body" color="secondary">
            A command-line client is asking to sign in to your{' '}
            {PLATFORM_NAME} account.
          </Text>
        </VStack>

        <VStack gap={2} style={styles.deviceCodeBox}>
          <div style={styles.deviceCode}>{DEVICE.code}</div>
          <Text type="supporting" color="secondary" justify="center">
            Verify the code matches what you see in your terminal
          </Text>
        </VStack>

        <HStack gap={3} vAlign="center">
          <div style={styles.tile}>
            <Icon icon={TerminalIcon} size="md" color="accent" />
          </div>
          <VStack gap={0}>
            <Text type="code" size="sm" style={styles.monoText}>
              {DEVICE.client} · {DEVICE.host}
            </Text>
            <Text type="supporting" color="secondary">
              {DEVICE.requestedNote}
            </Text>
          </VStack>
        </HStack>

        <Text type="supporting" color="secondary">
          Only continue if you started this sign-in yourself. Anyone with
          this code can act as your account from that terminal.
        </Text>

        <Divider />

        {phase === 'idle' && (
          <HStack gap={2} vAlign="center">
            <StackItem size="fill" />
            <Button label="Cancel" variant="ghost" onClick={onCancel} />
            <Button label="Authorize" variant="primary" onClick={onAuthorize} />
          </HStack>
        )}
        {phase === 'canceled' && (
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                Request canceled. Run{' '}
                <span style={styles.monoText}>skylark login</span> to start
                again.
              </Text>
            </StackItem>
            <Button label="Start over" variant="secondary" onClick={onReset} />
          </HStack>
        )}
        {phase === 'authorized' && (
          <SuccessRow
            text="CLI authorized successfully."
            caption="You can return to your terminal — no further steps here."
          />
        )}
      </VStack>
    </Card>
  );
}

// ============= PAGE =============

export default function WorkspaceJoinConsentTemplate() {
  const [step, setStep] = useState<StepId>('invite');
  const [invitePhase, setInvitePhase] = useState<InvitePhase>('idle');
  const [oauthPhase, setOauthPhase] = useState<OauthPhase>('idle');
  const [devicePhase, setDevicePhase] = useState<DevicePhase>('idle');

  // Staged join animation: joining → setting-up → ready on fixed delays.
  useEffect(() => {
    if (invitePhase === 'joining') {
      const timer = setTimeout(
        () => setInvitePhase('setting-up'),
        JOIN_STAGE_MS,
      );
      return () => clearTimeout(timer);
    }
    if (invitePhase === 'setting-up') {
      const timer = setTimeout(() => setInvitePhase('ready'), SETUP_STAGE_MS);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [invitePhase]);

  const isStepDone: Record<StepId, boolean> = {
    invite: invitePhase === 'ready',
    oauth: oauthPhase === 'authorized',
    device: devicePhase === 'authorized',
  };

  return (
    <Layout
      height="fill"
      content={
        <LayoutContent padding={0}>
          <div style={styles.backdrop}>
            <div style={styles.column}>
              {/* Brand row */}
              <HStack gap={2} vAlign="center" hAlign="center">
                <div style={styles.brandMark}>
                  <Icon icon={FeatherIcon} size="sm" color="accent" />
                </div>
                <Text type="label">{PLATFORM_NAME}</Text>
                <Text type="supporting" color="secondary">
                  · workspace access
                </Text>
              </HStack>

              {/* Stepper (page chrome): switches the visible consent card. */}
              <nav aria-label="Consent flow steps">
                <HStack gap={1} vAlign="center" hAlign="center">
                  {STEPS.map((item, index) => {
                    const isActive = step === item.id;
                    const isDone = isStepDone[item.id];
                    return (
                      <HStack key={item.id} gap={1} vAlign="center">
                        {index > 0 && (
                          <div style={styles.stepConnector} aria-hidden />
                        )}
                        <button
                          type="button"
                          style={styles.stepButton}
                          aria-current={isActive ? 'step' : undefined}
                          onClick={() => setStep(item.id)}>
                          <span
                            style={{
                              ...styles.stepCircle,
                              ...(isActive ? styles.stepCircleActive : {}),
                              ...(isDone && !isActive
                                ? styles.stepCircleDone
                                : {}),
                            }}>
                            {isDone && !isActive ? (
                              <Icon
                                icon={CheckIcon}
                                size="sm"
                                color="success"
                              />
                            ) : (
                              item.ordinal
                            )}
                          </span>
                          <Text
                            type="label"
                            size="sm"
                            color={isActive ? 'primary' : 'secondary'}>
                            {item.label}
                          </Text>
                        </button>
                      </HStack>
                    );
                  })}
                </HStack>
              </nav>

              {step === 'invite' && (
                <InviteCard
                  phase={invitePhase}
                  onJoin={() => setInvitePhase('joining')}
                  onDecline={() => setInvitePhase('declined')}
                  onReset={() => setInvitePhase('idle')}
                />
              )}
              {step === 'oauth' && (
                <OauthCard
                  phase={oauthPhase}
                  onAuthorize={() => setOauthPhase('authorized')}
                  onDeny={() => setOauthPhase('denied')}
                  onReset={() => setOauthPhase('idle')}
                />
              )}
              {step === 'device' && (
                <DeviceCard
                  phase={devicePhase}
                  onAuthorize={() => setDevicePhase('authorized')}
                  onCancel={() => setDevicePhase('canceled')}
                  onReset={() => setDevicePhase('idle')}
                />
              )}

              {/* Signed-in footer */}
              <HStack gap={1} vAlign="center" hAlign="center">
                <Text type="supporting" color="secondary">
                  Signed in as {SIGNED_IN_AS}
                </Text>
                <Button
                  label="Switch account"
                  variant="ghost"
                  size="sm"
                  onClick={() => {}}
                />
              </HStack>
            </div>
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};