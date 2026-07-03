// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (environment variables, webhook
 *   endpoints, connected repositories for a deployment workspace)
 * @output Secrets & environment settings page: a centered ~720px column of
 *   stacked Collapsible Sections — environment variables with masked-reveal
 *   values, copy feedback, delete-behind-AlertDialog, and an inline add form
 *   with duplicate-key validation; webhooks with reveal/copy URL boxes,
 *   enabled Switches that play the autosave lifecycle (Saving… spinner →
 *   green Saved check), and last-delivery StatusDot + Timestamp; connected
 *   repositories with branch Badges and a typed-confirmation disconnect
 *   Dialog
 * @position Page template; emitted by `astryx template settings-secrets-env`
 *
 * Frame: Layout height="fill" owns the page. LayoutHeader carries the page
 * title and workspace scope line; LayoutContent scrolls the settings column.
 * contentWidth={720} centers the column on wide viewports. Each Section is a
 * Collapsible whose trigger row shows the built-in chevron, a label, and a
 * count Badge ("4 set", "2 connected"). Collapsed sections lazy-load: the
 * first expand shows Skeleton rows briefly before the fixture rows render.
 *
 * Interaction contract:
 * - Reveal: each secret renders masked ("••••…a9f2"); an eye-style
 *   ToggleButton swaps the masked preview for the full value per row.
 * - Copy: the copy IconButton's Tooltip flips "Copy value" → "Copied";
 *   feedback resets after a short delay or when another row is copied.
 * - Delete env var: two-step destructive — the row's delete IconButton opens
 *   an AlertDialog before anything is removed.
 * - Disconnect repo: heavier two-step destructive — a Dialog requires typing
 *   the full repo name before the destructive action enables (AlertDialog
 *   cannot host inputs, so the typed step uses Dialog + TextInput).
 * - Autosave: toggling a webhook's Switch shows "Saving…" (Spinner) then a
 *   green FieldStatus "Saved" check that sticks until the next change.
 * - Add form: seeded with a duplicate key so the FieldStatus error state is
 *   visible on first render; Add stays disabled until the key is unique.
 *
 * Responsive contract:
 * - Column: Layout contentWidth={720} centers a max 720px column on wide
 *   viewports; below that the column keeps full width minus slot padding.
 * - Secret rows: key and value previews truncate to one line (the key cell
 *   ellipsizes, the value preview uses maxLines 1); the reveal/copy/delete
 *   action cluster never wraps or shrinks. At <=640px each env-var row
 *   stacks the key above a value + actions line so the revealed preview
 *   keeps a readable width.
 * - <=640px: the per-row sm controls (reveal/copy/delete, Disconnect) grow
 *   to 40px touch targets; desktop keeps the compact 28px sm chrome.
 * - Add-variable form: a wrapping flex row — inputs flex with a min width
 *   and the Add button drops to its own line on narrow viewports.
 * - Dialogs: width min(440px, 92vw) so they never overflow small screens.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Code} from '@astryxdesign/core/Code';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {FieldStatus} from '@astryxdesign/core/FieldStatus';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Section} from '@astryxdesign/core/Section';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // One settings row: bordered, rounded, breathing room for the action
  // cluster on the right.
  row: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  // Inline URL/value box inside a webhook row.
  urlBox: {
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-1) var(--spacing-1) var(--spacing-1) var(--spacing-2)',
  },
  // Secret previews keep truncation working inside flex rows.
  valueCell: {minWidth: 0},
  // Env-var key: one line with an ellipsis so long keys never word-break
  // (core Code wraps by default).
  keyCell: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  // Desktop rows also cap the key so the value preview keeps room beside
  // the reveal/copy/delete cluster.
  keyCellCapped: {maxWidth: '45%'},
  // <=640px: grow the sm controls to 40px touch targets (the 28px "sm" box
  // is fine for pointers but too small for thumbs); glyphs stay "sm".
  iconTapTarget: {width: 40, height: 40},
  buttonTapTarget: {height: 40},
  // Add-variable form: wraps instead of squeezing inputs on narrow widths.
  addForm: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    borderTop: 'var(--border-width) solid var(--color-border)',
    paddingTop: 'var(--spacing-3)',
  },
  addInput: {flex: '1 1 200px', minWidth: 180},
};

// ============= DATA =============

// Secrets for the "Helios Deploy" workspace. Values are fake but shaped
// like the real thing so the masked/revealed states read believably.
interface EnvVar {
  id: string;
  key: string;
  value: string;
  addedOn: string; // fixed ISO date
}

const ENV_VARS: EnvVar[] = [
  {
    id: 'env-database-url',
    key: 'DATABASE_URL',
    value: 'postgres://helios_app:v8Trq2NwLzXe@pg.internal.helios.dev:5432/helios_prod',
    addedOn: '2026-02-18T09:30:00Z',
  },
  {
    id: 'env-stripe-key',
    key: 'STRIPE_SECRET_KEY',
    value: 'sk_demo_9mKdR27bQpZjW4uTnEHxa9f2',
    addedOn: '2026-03-04T14:05:00Z',
  },
  {
    id: 'env-sentry-dsn',
    key: 'SENTRY_DSN',
    value: 'https://8c41f7e2d9b3@o44812.ingest.sentry.io/5501287',
    addedOn: '2026-04-22T11:12:00Z',
  },
  {
    id: 'env-slack-secret',
    key: 'SLACK_SIGNING_SECRET',
    value: '7f3a1c9d5e2b4a8f6c0d2e4b6a8c1d3f',
    addedOn: '2026-05-30T16:48:00Z',
  },
];

interface Webhook {
  id: string;
  name: string;
  url: string;
  isEnabled: boolean;
  lastDelivery: {status: 'success' | 'failure'; at: string};
}

const WEBHOOKS: Webhook[] = [
  {
    id: 'wh-release-feed',
    name: 'Deploy succeeded → #release-feed',
    url: 'https://hooks.helios.dev/wh/2f8c41a97be04d5c9e1a44b87d31',
    isEnabled: true,
    lastDelivery: {status: 'success', at: '2026-06-30T16:42:00Z'},
  },
  {
    id: 'wh-oncall-pager',
    name: 'Deploy failed → on-call pager',
    url: 'https://hooks.helios.dev/wh/9d3b72e1c8f04a6db520e97c1d55',
    isEnabled: true,
    lastDelivery: {status: 'failure', at: '2026-06-29T03:17:00Z'},
  },
  {
    id: 'wh-usage-export',
    name: 'Nightly usage export',
    url: 'https://hooks.helios.dev/wh/5a1e88c4f7b249d3a6c00d24e8b9',
    isEnabled: false,
    lastDelivery: {status: 'success', at: '2026-06-12T00:05:00Z'},
  },
];

interface Repo {
  id: string;
  name: string;
  branch: string;
  connectedOn: string;
}

const REPOS: Repo[] = [
  {
    id: 'repo-deploy-api',
    name: 'helios/deploy-api',
    branch: 'main',
    connectedOn: '2026-03-12T10:00:00Z',
  },
  {
    id: 'repo-edge-workers',
    name: 'helios/edge-workers',
    branch: 'release/2026-06',
    connectedOn: '2026-05-28T15:20:00Z',
  },
];

// Fixture note: collapsed sections "fetch" on first expand — the skeleton
// beat is a fixed 650ms so the loading state is visible but brief.
const LAZY_LOAD_MS = 650;
const COPY_RESET_MS = 1800;
const AUTOSAVE_MS = 900;

// Masked preview: bullets plus the last four characters, e.g. "••••…a9f2".
function maskValue(value: string): string {
  return `••••…${value.slice(-4)}`;
}

// ============= SECTION SHELL =============

// One collapsible settings group: Section surface, Collapsible trigger row
// (built-in chevron + label + count Badge), supporting description, then
// either Skeleton rows (first expand) or the loaded content.
function SettingsSection({
  title,
  count,
  description,
  isOpen,
  isLoaded,
  skeletonRows,
  onOpenChange,
  children,
}: {
  title: string;
  count: string;
  description: string;
  isOpen: boolean;
  isLoaded: boolean;
  skeletonRows: number;
  onOpenChange: (isOpen: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Section variant="section" padding={3}>
      <Collapsible
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        trigger={
          <HStack gap={2} vAlign="center">
            <Text type="label">{title}</Text>
            <Badge variant="neutral" label={count} />
          </HStack>
        }>
        <VStack gap={3} style={{paddingTop: 'var(--spacing-2)'}}>
          <Text type="supporting" color="secondary">
            {description}
          </Text>
          {isLoaded ? (
            children
          ) : (
            <VStack gap={2}>
              {Array.from({length: skeletonRows}, (_, index) => (
                <Skeleton key={index} height={48} radius={2} />
              ))}
            </VStack>
          )}
        </VStack>
      </Collapsible>
    </Section>
  );
}

// ============= ROW CLUSTERS =============

// Reveal + copy pair shared by env var and webhook rows. The copy Tooltip
// flips "Copy value" → "Copied" while this row owns the copy feedback.
function RevealCopyActions({
  subject,
  value,
  isRevealed,
  isCopied,
  onRevealChange,
  onCopy,
}: {
  subject: string;
  value: string;
  isRevealed: boolean;
  isCopied: boolean;
  onRevealChange: (isRevealed: boolean) => void;
  onCopy: () => void;
}) {
  // <=640px: the sm controls grow to 40px touch targets.
  const isCompact = useMediaQuery('(max-width: 640px)');
  const tapTargetStyle = isCompact ? styles.iconTapTarget : undefined;
  return (
    <HStack gap={1} vAlign="center">
      <Tooltip content={isRevealed ? 'Hide value' : 'Reveal value'}>
        <ToggleButton
          label={`Reveal ${subject}`}
          isIconOnly
          size="sm"
          style={tapTargetStyle}
          icon={<Icon icon={isRevealed ? EyeOffIcon : EyeIcon} size="sm" />}
          isPressed={isRevealed}
          onPressedChange={onRevealChange}
        />
      </Tooltip>
      <Tooltip content={isCopied ? 'Copied' : 'Copy value'}>
        <IconButton
          label={`Copy ${subject}`}
          size="sm"
          variant="ghost"
          style={tapTargetStyle}
          icon={<Icon icon={CopyIcon} size="sm" />}
          onClick={() => {
            // Clipboard write is best-effort in the demo sandbox; the
            // Tooltip flip is the visible contract.
            void navigator.clipboard?.writeText(value).catch(() => undefined);
            onCopy();
          }}
        />
      </Tooltip>
    </HStack>
  );
}

// Webhook autosave feedback: Spinner + "Saving…" while pending, then a
// green FieldStatus "Saved" check that sticks until the next change.
function SaveIndicator({state}: {state: 'idle' | 'saving' | 'saved'}) {
  if (state === 'saving') {
    return (
      <HStack gap={1} vAlign="center">
        <Spinner size="sm" shade="subtle" />
        <Text type="supporting" color="secondary">
          Saving…
        </Text>
      </HStack>
    );
  }
  if (state === 'saved') {
    return <FieldStatus type="success" variant="detached" message="Saved" />;
  }
  return null;
}

// ============= PAGE =============

export default function SettingsSecretsEnvTemplate() {
  // Section expansion — env vars open by default; the other two lazy-load
  // on first expand (Skeleton beat, then rows).
  // <=640px: env-var rows stack the key above the value + actions line and
  // the sm row controls grow to 40px touch targets.
  const isCompact = useMediaQuery('(max-width: 640px)');

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    env: true,
    webhooks: false,
    repos: false,
  });
  const [loadedSections, setLoadedSections] = useState<Record<string, boolean>>(
    {env: true, webhooks: false, repos: false},
  );

  // Secrets state: rows are deletable/addable; reveal + copy are per-row.
  const [envVars, setEnvVars] = useState<EnvVar[]>(ENV_VARS);
  const [revealedIds, setRevealedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add-variable draft — seeded with a duplicate key so the FieldStatus
  // error state is demonstrated on first render.
  const [draftKey, setDraftKey] = useState('STRIPE_SECRET_KEY');
  const [draftValue, setDraftValue] = useState('sk_demo_51NqXw84dTzR6mAb2');

  // Webhooks: enabled toggles play the autosave lifecycle per row.
  const [webhookEnabled, setWebhookEnabled] = useState<Record<string, boolean>>(
    () => Object.fromEntries(WEBHOOKS.map(hook => [hook.id, hook.isEnabled])),
  );
  const [saveStates, setSaveStates] = useState<
    Record<string, 'saving' | 'saved'>
  >({});

  // Destructive flows.
  const [deleteTarget, setDeleteTarget] = useState<EnvVar | null>(null);
  const [disconnectTarget, setDisconnectTarget] = useState<Repo | null>(null);
  const [confirmName, setConfirmName] = useState('');
  const [repos, setRepos] = useState<Repo[]>(REPOS);

  const toggleSection = (sectionId: string) => (isOpen: boolean) => {
    setOpenSections(prev => ({...prev, [sectionId]: isOpen}));
    if (isOpen && !loadedSections[sectionId]) {
      // Fixture note: simulate the section's first fetch with a fixed delay.
      setTimeout(() => {
        setLoadedSections(prev => ({...prev, [sectionId]: true}));
      }, LAZY_LOAD_MS);
    }
  };

  const toggleReveal = (id: string) => (isRevealed: boolean) => {
    setRevealedIds(prev => {
      const next = new Set(prev);
      if (isRevealed) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const markCopied = (id: string) => {
    setCopiedId(id);
    setTimeout(() => {
      // Only clear if another copy hasn't taken over the feedback slot.
      setCopiedId(current => (current === id ? null : current));
    }, COPY_RESET_MS);
  };

  const toggleWebhook = (id: string) => (isEnabled: boolean) => {
    setWebhookEnabled(prev => ({...prev, [id]: isEnabled}));
    setSaveStates(prev => ({...prev, [id]: 'saving'}));
    setTimeout(() => {
      setSaveStates(prev =>
        prev[id] === 'saving' ? {...prev, [id]: 'saved'} : prev,
      );
    }, AUTOSAVE_MS);
  };

  // Duplicate-key validation for the add form (keys are unique, uppercase).
  const normalizedKey = draftKey.trim().toUpperCase();
  const isDuplicateKey = envVars.some(item => item.key === normalizedKey);
  const canAdd =
    normalizedKey !== '' && draftValue.trim() !== '' && !isDuplicateKey;

  const addVariable = () => {
    if (!canAdd) {
      return;
    }
    setEnvVars(prev => [
      ...prev,
      {
        id: `env-${normalizedKey.toLowerCase()}`,
        key: normalizedKey,
        value: draftValue.trim(),
        addedOn: '2026-07-01T12:00:00Z',
      },
    ]);
    setDraftKey('');
    setDraftValue('');
  };

  const activeWebhooks = Object.values(webhookEnabled).filter(Boolean).length;

  return (
    <Layout
      height="fill"
      contentWidth={720}
      header={
        <LayoutHeader hasDivider>
          <VStack gap={1}>
            <Heading level={1}>Secrets &amp; environment</Heading>
            <Text type="supporting" color="secondary">
              Environment variables, webhook endpoints, and repository access
              for the Helios Deploy workspace. Changes apply on the next
              build.
            </Text>
          </VStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <VStack gap={4}>
            {/* ---- Section 1: environment variables ---- */}
            <SettingsSection
              title="Environment variables"
              count={`${envVars.length} set`}
              description="Injected into every build and runtime shell. Values are encrypted at rest and masked here by default."
              isOpen={openSections.env}
              isLoaded={loadedSections.env}
              skeletonRows={4}
              onOpenChange={toggleSection('env')}>
              <VStack gap={2}>
                {envVars.map(envVar => {
                  const isRevealed = revealedIds.has(envVar.id);
                  const valuePreview = (
                    <StackItem size="fill">
                      <div style={styles.valueCell}>
                        <Text
                          type="code"
                          color="secondary"
                          maxLines={1}
                          hasTabularNumbers>
                          {isRevealed ? envVar.value : maskValue(envVar.value)}
                        </Text>
                      </div>
                    </StackItem>
                  );
                  const rowActions = (
                    <>
                      <RevealCopyActions
                        subject={envVar.key}
                        value={envVar.value}
                        isRevealed={isRevealed}
                        isCopied={copiedId === envVar.id}
                        onRevealChange={toggleReveal(envVar.id)}
                        onCopy={() => markCopied(envVar.id)}
                      />
                      <Tooltip content="Delete variable">
                        <IconButton
                          label={`Delete ${envVar.key}`}
                          size="sm"
                          variant="ghost"
                          style={isCompact ? styles.iconTapTarget : undefined}
                          icon={<Icon icon={Trash2Icon} size="sm" />}
                          onClick={() => setDeleteTarget(envVar)}
                        />
                      </Tooltip>
                    </>
                  );
                  return (
                    <div key={envVar.id} style={styles.row}>
                      {isCompact ? (
                        // Key on its own line so the value preview keeps a
                        // readable width beside the 40px action cluster.
                        <VStack gap={1}>
                          <div style={styles.keyCell}>
                            <Code>{envVar.key}</Code>
                          </div>
                          <HStack gap={2} vAlign="center">
                            {valuePreview}
                            {rowActions}
                          </HStack>
                        </VStack>
                      ) : (
                        <HStack gap={2} vAlign="center">
                          <div
                            style={{
                              ...styles.keyCell,
                              ...styles.keyCellCapped,
                            }}>
                            <Code>{envVar.key}</Code>
                          </div>
                          {valuePreview}
                          {rowActions}
                        </HStack>
                      )}
                    </div>
                  );
                })}

                {/* Inline add-row form with duplicate-key validation. */}
                <div style={styles.addForm}>
                  <div style={styles.addInput}>
                    <TextInput
                      label="Key"
                      placeholder="VARIABLE_NAME"
                      value={draftKey}
                      onChange={value => setDraftKey(value.toUpperCase())}
                      status={
                        isDuplicateKey
                          ? {
                              type: 'error',
                              message: `${normalizedKey} is already set — delete the existing variable first.`,
                            }
                          : undefined
                      }
                    />
                  </div>
                  <div style={styles.addInput}>
                    <TextInput
                      type="password"
                      label="Value"
                      placeholder="Paste the secret value"
                      value={draftValue}
                      onChange={setDraftValue}
                    />
                  </div>
                  {/* Spacer text keeps the button aligned with the inputs,
                      which reserve a label line above the control. */}
                  <VStack gap={1}>
                    <Text type="label" aria-hidden>
                      &nbsp;
                    </Text>
                    <Button
                      label="Add variable"
                      icon={<Icon icon={PlusIcon} size="sm" />}
                      isDisabled={!canAdd}
                      onClick={addVariable}
                    />
                  </VStack>
                </div>
              </VStack>
            </SettingsSection>

            {/* ---- Section 2: webhooks ---- */}
            <SettingsSection
              title="Webhooks"
              count={`${activeWebhooks} active`}
              description="Signed POST callbacks fired on deploy events. URLs embed a delivery token, so treat them as secrets."
              isOpen={openSections.webhooks}
              isLoaded={loadedSections.webhooks}
              skeletonRows={3}
              onOpenChange={toggleSection('webhooks')}>
              <VStack gap={2}>
                {WEBHOOKS.map(hook => {
                  const isRevealed = revealedIds.has(hook.id);
                  const delivery = hook.lastDelivery;
                  return (
                    <div key={hook.id} style={styles.row}>
                      <VStack gap={2}>
                        <HStack gap={3} vAlign="center">
                          <StackItem size="fill">
                            <VStack gap={0.5}>
                              <Text type="body" maxLines={1}>
                                {hook.name}
                              </Text>
                              <HStack gap={1} vAlign="center">
                                <StatusDot
                                  variant={
                                    delivery.status === 'success'
                                      ? 'success'
                                      : 'error'
                                  }
                                  label={
                                    delivery.status === 'success'
                                      ? 'Last delivery succeeded'
                                      : 'Last delivery failed'
                                  }
                                />
                                <Text type="supporting" color="secondary">
                                  {delivery.status === 'success'
                                    ? 'Delivered'
                                    : 'Failed'}
                                </Text>
                                <Timestamp
                                  value={delivery.at}
                                  format="date_time"
                                  color="secondary"
                                />
                              </HStack>
                            </VStack>
                          </StackItem>
                          <SaveIndicator state={saveStates[hook.id] ?? 'idle'} />
                          <Switch
                            label={`Enable ${hook.name}`}
                            isLabelHidden
                            value={webhookEnabled[hook.id]}
                            onChange={toggleWebhook(hook.id)}
                          />
                        </HStack>
                        <div style={styles.urlBox}>
                          <HStack gap={2} vAlign="center">
                            <StackItem size="fill">
                              <div style={styles.valueCell}>
                                <Text
                                  type="code"
                                  color="secondary"
                                  maxLines={1}
                                  hasTabularNumbers>
                                  {isRevealed
                                    ? hook.url
                                    : `https://hooks.helios.dev/wh/${maskValue(hook.url)}`}
                                </Text>
                              </div>
                            </StackItem>
                            <RevealCopyActions
                              subject={`${hook.name} URL`}
                              value={hook.url}
                              isRevealed={isRevealed}
                              isCopied={copiedId === hook.id}
                              onRevealChange={toggleReveal(hook.id)}
                              onCopy={() => markCopied(hook.id)}
                            />
                          </HStack>
                        </div>
                      </VStack>
                    </div>
                  );
                })}
              </VStack>
            </SettingsSection>

            {/* ---- Section 3: connected repositories ---- */}
            <SettingsSection
              title="Connected repositories"
              count={`${repos.length} connected`}
              description="Repos Helios Deploy can clone and deploy from. Disconnecting stops builds immediately."
              isOpen={openSections.repos}
              isLoaded={loadedSections.repos}
              skeletonRows={2}
              onOpenChange={toggleSection('repos')}>
              <VStack gap={2}>
                {repos.map(repo => (
                  <div key={repo.id} style={styles.row}>
                    <HStack gap={2} vAlign="center">
                      <StackItem size="fill">
                        <VStack gap={0.5}>
                          <HStack gap={2} vAlign="center">
                            <Code>{repo.name}</Code>
                            <Badge variant="blue" label={repo.branch} />
                          </HStack>
                          <HStack gap={1} vAlign="center">
                            <Text type="supporting" color="secondary">
                              Read &amp; deploy access · connected
                            </Text>
                            <Timestamp
                              value={repo.connectedOn}
                              format="date"
                              color="secondary"
                            />
                          </HStack>
                        </VStack>
                      </StackItem>
                      <Button
                        label="Disconnect"
                        size="sm"
                        variant="ghost"
                        style={isCompact ? styles.buttonTapTarget : undefined}
                        onClick={() => {
                          setDisconnectTarget(repo);
                          setConfirmName('');
                        }}
                      />
                    </HStack>
                  </div>
                ))}
              </VStack>
            </SettingsSection>
          </VStack>

          {/* Two-step destructive: delete env var behind an AlertDialog. */}
          <AlertDialog
            isOpen={deleteTarget !== null}
            onOpenChange={isOpen => {
              if (!isOpen) {
                setDeleteTarget(null);
              }
            }}
            title={`Delete ${deleteTarget?.key ?? 'variable'}?`}
            description="Builds that read this variable will start failing on the next deploy. This cannot be undone."
            actionLabel="Delete variable"
            onAction={() => {
              setEnvVars(prev =>
                prev.filter(item => item.id !== deleteTarget?.id),
              );
              setDeleteTarget(null);
            }}
          />

          {/* Heavier two-step destructive: typed confirmation before
              disconnecting a repo. AlertDialog cannot host inputs, so this
              step uses Dialog with a destructive footer action. */}
          <Dialog
            isOpen={disconnectTarget !== null}
            onOpenChange={isOpen => {
              if (!isOpen) {
                setDisconnectTarget(null);
              }
            }}
            purpose="form"
            width="min(440px, 92vw)">
            <Layout
              header={
                <DialogHeader
                  title="Disconnect repository"
                  subtitle="Deploys from this repo stop immediately."
                  onOpenChange={isOpen => {
                    if (!isOpen) {
                      setDisconnectTarget(null);
                    }
                  }}
                />
              }
              content={
                <LayoutContent>
                  <VStack gap={3}>
                    <Text type="body">
                      Helios Deploy will revoke its deploy key for{' '}
                      <Code>{disconnectTarget?.name ?? ''}</Code> and cancel
                      any queued builds.
                    </Text>
                    <TextInput
                      label={`Type ${disconnectTarget?.name ?? 'the repository name'} to confirm`}
                      placeholder={disconnectTarget?.name ?? ''}
                      value={confirmName}
                      onChange={setConfirmName}
                    />
                  </VStack>
                </LayoutContent>
              }
              footer={
                <LayoutFooter hasDivider>
                  <HStack gap={2} vAlign="center">
                    <StackItem size="fill" />
                    <Button
                      label="Cancel"
                      variant="ghost"
                      onClick={() => setDisconnectTarget(null)}
                    />
                    <Button
                      label="Disconnect repository"
                      variant="destructive"
                      isDisabled={confirmName !== disconnectTarget?.name}
                      onClick={() => {
                        setRepos(prev =>
                          prev.filter(
                            item => item.id !== disconnectTarget?.id,
                          ),
                        );
                        setDisconnectTarget(null);
                      }}
                    />
                  </HStack>
                </LayoutFooter>
              }
            />
          </Dialog>
        </LayoutContent>
      }
    />
  );
}
