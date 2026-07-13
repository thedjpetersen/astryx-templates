var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (boot-checklist stages with a fixed
 *   mid-boot cursor, workspace directory with hashtags and a starred
 *   default, suggested-action pills with one confidence score, four
 *   recent-session cards with fixed relative-time labels)
 * @output Signed-in assistant landing (empty state before the first
 *   message): a centered ~640px column with a workspace context pill
 *   whose Popover lists Personal, three team workspaces (mono #hashtags,
 *   amber-star default), an Archived mini-section, and a "Create team
 *   workspace" footer; a greeting heading; a boot-checklist state strip
 *   rendered mid-boot ("Tools configured" spinning with a mono status
 *   line); a dismissible "Determining workspace…" routing banner; the
 *   composer card (TextArea, attach, model pill, send); up to three
 *   dismissable suggested-action pills (one with a 92% confidence tag);
 *   and a recent-sessions strip of four ClickableCards
 * @position Page template; emitted by \`astryx template ai-chat-workspace-landing\`
 *
 * Frame: Layout height="fill". A slim LayoutHeader carries the product
 * wordmark and account avatar; LayoutContent scrolls a single centered
 * column. No transcript and no side panels — unlike ai-chat-tool-stream
 * this surface is the moment *before* the conversation exists, so the
 * composer and workspace routing are the stars.
 *
 * Responsive contract:
 * - Single centered column, maxWidth 640 — mobile-first, no measured
 *   breakpoints needed (no sidebar or column drops).
 * - Boot-stage chips and suggestion pills flexWrap onto extra lines at
 *   narrow widths; the recent-sessions grid uses auto-fit minmax(240px)
 *   so it drops from 2 columns to 1 on its own.
 * - The composer control row keeps the send button pinned right via a
 *   fill spacer; the model Selector keeps intrinsic width.
 */

import {useState, type CSSProperties} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Item} from '@astryxdesign/core/Item';
import {Popover} from '@astryxdesign/core/Popover';
import {Selector} from '@astryxdesign/core/Selector';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextArea} from '@astryxdesign/core/TextArea';
import {
  ArchiveIcon,
  BoxIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  PaperclipIcon,
  PlusIcon,
  SendIcon,
  ServerIcon,
  SparklesIcon,
  StarIcon,
  TrendingUpIcon,
  UserIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Single centered landing column; the page scrolls as one unit.
  landingColumn: {
    maxWidth: 640,
    marginInline: 'auto',
    paddingBlock: 'var(--spacing-8)',
  },
  contextPillRow: {justifyContent: 'center'},
  // Workspace context pill — a native button so the Popover render-prop
  // trigger can carry icon + name + chevron in one rounded chip.
  contextPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 999,
    backgroundColor: 'var(--color-background-card)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-1)',
    cursor: 'pointer',
    font: 'inherit',
    color: 'var(--color-text-primary)',
  },
  greetingBlock: {textAlign: 'center'},
  // Boot checklist strip: stage chips wrap at narrow widths; the mono
  // status line for the active stage sits under a divider.
  bootStrip: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  bootStageRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-1)'},
  bootStage: {flexShrink: 0},
  composerCard: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-3)',
  },
  suggestionWrap: {flexWrap: 'wrap', justifyContent: 'center'},
  // 10-11px uppercase tracking-wide section eyebrow.
  eyebrow: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  // Recent sessions: auto-fit grid drops 2 -> 1 columns on its own.
  recentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 'var(--spacing-2)',
  },
  recentTitleCell: {minWidth: 0},
  // Icon tile for workspace rows in the switcher Popover.
  workspaceTile: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
    flexShrink: 0,
  },
  popoverBody: {padding: 'var(--spacing-2)'},
  popoverEyebrowRow: {
    paddingInline: 'var(--spacing-2)',
    paddingTop: 'var(--spacing-2)',
  },
};

// ============= DATA =============
// Deterministic fixtures: fixed labels, no clocks, no randomness.

const PRODUCT_NAME = 'Waypoint';
const ASSISTANT_NAME = 'Waypoint Assistant';
const USER_NAME = 'Priya Raman';
const GREETING = 'Good morning, Priya';

const MODEL_OPTIONS = [
  {value: 'horizon-5', label: 'horizon-5'},
  {value: 'horizon-5-mini', label: 'horizon-5-mini'},
  {value: 'horizon-reason-2', label: 'horizon-reason-2'},
];

// Boot checklist rendered mid-boot: three stages done, "Tools
// configured" is the live stage with a mono status message, "Ready"
// still pending.
type BootState = 'done' | 'active' | 'pending';

interface BootStage {
  id: string;
  label: string;
  state: BootState;
}

const BOOT_STAGES: BootStage[] = [
  {id: 'env', label: 'Environment ready', state: 'done'},
  {id: 'workspace', label: 'Workspace restored', state: 'done'},
  {id: 'skills', label: 'Skills loaded', state: 'done'},
  {id: 'tools', label: 'Tools configured', state: 'active'},
  {id: 'ready', label: 'Ready', state: 'pending'},
];

const BOOT_STATUS_LINE =
  'tool-host: probing node cli:mac-studio — browser_capture v2.3 (4/6 ready)';

// Workspace directory for the context-pill Popover. "Atlas Core" is the
// amber-star default; "Personal" is the current context on load.
interface WorkspaceEntry {
  id: string;
  name: string;
  hashtag: string;
  icon: typeof BoxIcon;
  isDefault: boolean;
}

const PERSONAL_ID = 'personal';

const WORKSPACES: WorkspaceEntry[] = [
  {
    id: 'ws-atlas',
    name: 'Atlas Core',
    hashtag: '#atlas-core',
    icon: BoxIcon,
    isDefault: true,
  },
  {
    id: 'ws-growth',
    name: 'Growth Pod',
    hashtag: '#growth-pod',
    icon: TrendingUpIcon,
    isDefault: false,
  },
  {
    id: 'ws-infra',
    name: 'Infra Guild',
    hashtag: '#infra-guild',
    icon: ServerIcon,
    isDefault: false,
  },
];

const ARCHIVED_WORKSPACES = [
  {id: 'ws-hack', name: 'Hack Week 25', hashtag: '#hack-week-25'},
  {id: 'ws-onboard', name: 'Onboarding 24H2', hashtag: '#onboarding-24h2'},
];

// Suggested actions under the composer; the first carries the routing
// classifier's confidence score. Pills dismiss on click.
interface Suggestion {
  id: string;
  label: string;
  confidence?: string;
}

const INITIAL_SUGGESTIONS: Suggestion[] = [
  {
    id: 'sg-1',
    label: 'Resume the checkout rollback plan',
    confidence: '92%',
  },
  {id: 'sg-2', label: "Summarize yesterday's incident thread"},
  {id: 'sg-3', label: 'Draft the weekly metrics digest'},
];

// Recent sessions strip: all visible status variants represented
// (running / needs review / complete / archived).
interface RecentSession {
  id: string;
  title: string;
  when: string;
  dot: 'accent' | 'warning' | 'success' | 'neutral';
  dotLabel: string;
}

const RECENT_SESSIONS: RecentSession[] = [
  {
    id: 'rs-1',
    title: 'Rollback plan for checkout deploy',
    when: '12 minutes ago',
    dot: 'accent',
    dotLabel: 'Running',
  },
  {
    id: 'rs-2',
    title: 'Q3 headcount scenarios',
    when: '3 hours ago',
    dot: 'warning',
    dotLabel: 'Needs review',
  },
  {
    id: 'rs-3',
    title: 'Refactor billing webhooks',
    when: 'Yesterday',
    dot: 'success',
    dotLabel: 'Complete',
  },
  {
    id: 'rs-4',
    title: 'Weekly metrics digest',
    when: '2 days ago',
    dot: 'neutral',
    dotLabel: 'Archived',
  },
];

// ============= BOOT STRIP =============

function BootStageChip({stage}: {stage: BootStage}) {
  return (
    <HStack gap={1} vAlign="center" style={styles.bootStage}>
      {stage.state === 'done' && (
        <Icon icon={CircleCheckIcon} size="sm" color="success" />
      )}
      {stage.state === 'active' && (
        <Spinner size="sm" aria-label={\`\${stage.label} in progress\`} />
      )}
      {stage.state === 'pending' && (
        <Icon icon={CircleDashedIcon} size="sm" color="disabled" />
      )}
      <Text
        type="supporting"
        size="sm"
        color={stage.state === 'pending' ? 'disabled' : 'secondary'}>
        {stage.label}
      </Text>
    </HStack>
  );
}

// ============= WORKSPACE SWITCHER =============

function WorkspaceTile({icon}: {icon: typeof BoxIcon}) {
  return (
    <span style={styles.workspaceTile}>
      <Icon icon={icon} size="sm" color="secondary" />
    </span>
  );
}

function WorkspaceMenu({
  currentId,
  onSelect,
}: {
  currentId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={styles.popoverBody}>
      <VStack gap={0}>
        <Item
          label="Personal"
          description="Private to you"
          density="compact"
          startContent={<WorkspaceTile icon={UserIcon} />}
          endContent={
            currentId === PERSONAL_ID ? (
              <Icon icon={CheckIcon} size="sm" color="accent" />
            ) : undefined
          }
          isSelected={currentId === PERSONAL_ID}
          onClick={() => onSelect(PERSONAL_ID)}
        />
        <div style={styles.popoverEyebrowRow}>
          <Text type="label" size="sm" color="secondary" style={styles.eyebrow}>
            Workspaces
          </Text>
        </div>
        {WORKSPACES.map(workspace => (
          <Item
            key={workspace.id}
            label={workspace.name}
            description={
              <Text type="code" size="sm" color="secondary">
                {workspace.hashtag}
              </Text>
            }
            density="compact"
            startContent={<WorkspaceTile icon={workspace.icon} />}
            endContent={
              <HStack gap={1} vAlign="center">
                {workspace.isDefault && (
                  <Icon
                    icon={StarIcon}
                    size="sm"
                    color="warning"
                    aria-label="Default workspace"
                  />
                )}
                {currentId === workspace.id && (
                  <Icon icon={CheckIcon} size="sm" color="accent" />
                )}
              </HStack>
            }
            isSelected={currentId === workspace.id}
            onClick={() => onSelect(workspace.id)}
          />
        ))}
        <div style={styles.popoverEyebrowRow}>
          <Text type="label" size="sm" color="secondary" style={styles.eyebrow}>
            Archived
          </Text>
        </div>
        {ARCHIVED_WORKSPACES.map(workspace => (
          <Item
            key={workspace.id}
            label={workspace.name}
            description={
              <Text type="code" size="sm" color="secondary">
                {workspace.hashtag}
              </Text>
            }
            density="compact"
            startContent={<WorkspaceTile icon={ArchiveIcon} />}
            isDisabled
          />
        ))}
        <Divider />
        <Button
          label="Create team workspace"
          variant="ghost"
          size="sm"
          icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
          onClick={() => {}}
        />
      </VStack>
    </div>
  );
}

// ============= PAGE =============

export default function AiChatWorkspaceLandingTemplate() {
  const [model, setModel] = useState('horizon-5');
  const [draft, setDraft] = useState('');
  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS);
  const [contextId, setContextId] = useState(PERSONAL_ID);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const currentWorkspace = WORKSPACES.find(
    workspace => workspace.id === contextId,
  );
  const contextName = currentWorkspace?.name ?? 'Personal';
  const contextIcon = currentWorkspace?.icon ?? UserIcon;

  const selectContext = (id: string) => {
    setContextId(id);
    setIsSwitcherOpen(false);
  };

  const dismissSuggestion = (id: string) => {
    setSuggestions(prev => prev.filter(item => item.id !== id));
  };

  // Sending would open a session (leave this page); clearing the draft
  // is the only local effect.
  const sendDraft = () => {
    if (draft.trim().length === 0) {
      return;
    }
    setDraft('');
  };

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <Icon icon={SparklesIcon} size="sm" color="accent" />
            <Text type="label">{PRODUCT_NAME}</Text>
            <StackItem size="fill" />
            <Button label="New chat" variant="ghost" size="sm" />
            <Avatar name={USER_NAME} size="small" />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <div style={styles.landingColumn}>
            <VStack gap={6}>
              {/* Workspace context pill above the greeting. */}
              <HStack gap={2} style={styles.contextPillRow}>
                <Popover
                  label="Switch workspace"
                  placement="below"
                  alignment="center"
                  width={300}
                  isOpen={isSwitcherOpen}
                  onOpenChange={setIsSwitcherOpen}
                  content={
                    <WorkspaceMenu
                      currentId={contextId}
                      onSelect={selectContext}
                    />
                  }>
                  {triggerProps => (
                    <button
                      ref={triggerProps.ref}
                      onClick={triggerProps.onClick}
                      aria-haspopup={triggerProps['aria-haspopup']}
                      aria-expanded={triggerProps['aria-expanded']}
                      style={styles.contextPill}
                      type="button">
                      <Icon icon={contextIcon} size="sm" color="secondary" />
                      <Text type="label" size="sm">
                        {contextName}
                      </Text>
                      <Icon
                        icon={ChevronDownIcon}
                        size="sm"
                        color="secondary"
                      />
                    </button>
                  )}
                </Popover>
              </HStack>

              {/* Greeting. */}
              <div style={styles.greetingBlock}>
                <VStack gap={1}>
                  <Heading level={1}>{GREETING}</Heading>
                  <Text type="supporting" color="secondary">
                    {ASSISTANT_NAME} is warming up your workspace.
                  </Text>
                </VStack>
              </div>

              {/* Boot checklist strip, rendered mid-boot. */}
              <div style={styles.bootStrip}>
                <VStack gap={2}>
                  <HStack gap={3} vAlign="center" style={styles.bootStageRow}>
                    {BOOT_STAGES.map(stage => (
                      <BootStageChip key={stage.id} stage={stage} />
                    ))}
                  </HStack>
                  <Divider />
                  <Text type="code" size="sm" color="secondary">
                    {BOOT_STATUS_LINE}
                  </Text>
                </VStack>
              </div>

              {/* Pre-routing state: the assistant hasn't picked a
                  workspace yet. Banner manages its own dismissal. */}
              <Banner
                status="info"
                title="Determining workspace…"
                description="Reading your first message to route this chat."
                isDismissable
              />

              {/* Composer card. */}
              <div style={styles.composerCard}>
                <VStack gap={2}>
                  <TextArea
                    label={\`Message \${ASSISTANT_NAME}\`}
                    isLabelHidden
                    rows={3}
                    placeholder="Type a message…"
                    value={draft}
                    onChange={setDraft}
                  />
                  <HStack gap={2} vAlign="center">
                    <IconButton
                      label="Attach file"
                      tooltip="Attach file"
                      icon={
                        <Icon icon={PaperclipIcon} size="sm" color="inherit" />
                      }
                      variant="ghost"
                      size="sm"
                      onClick={() => {}}
                    />
                    <Selector
                      label="Model"
                      isLabelHidden
                      size="sm"
                      options={MODEL_OPTIONS}
                      value={model}
                      onChange={setModel}
                    />
                    <StackItem size="fill" />
                    <IconButton
                      label="Send message"
                      tooltip="Send"
                      icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
                      size="sm"
                      onClick={sendDraft}
                    />
                  </HStack>
                </VStack>
              </div>

              {/* Suggested actions: dismiss on click; one pill carries
                  the classifier's confidence percent. */}
              {suggestions.length > 0 && (
                <HStack gap={2} style={styles.suggestionWrap}>
                  {suggestions.map(suggestion => (
                    <Button
                      key={suggestion.id}
                      label={
                        suggestion.confidence != null
                          ? \`\${suggestion.label} · \${suggestion.confidence}\`
                          : suggestion.label
                      }
                      variant="secondary"
                      size="sm"
                      onClick={() => dismissSuggestion(suggestion.id)}
                    />
                  ))}
                </HStack>
              )}

              {/* Recent sessions strip. */}
              <VStack gap={2}>
                <Text
                  type="label"
                  size="sm"
                  color="secondary"
                  style={styles.eyebrow}>
                  Recent sessions
                </Text>
                <div style={styles.recentGrid}>
                  {RECENT_SESSIONS.map(session => (
                    <ClickableCard
                      key={session.id}
                      label={session.title}
                      padding={3}
                      onClick={() => {}}>
                      <VStack gap={1}>
                        <HStack gap={2} vAlign="center">
                          <StatusDot
                            variant={session.dot}
                            label={session.dotLabel}
                          />
                          <StackItem size="fill" style={styles.recentTitleCell}>
                            <Text type="label" size="sm" maxLines={1}>
                              {session.title}
                            </Text>
                          </StackItem>
                        </HStack>
                        <Text type="supporting" size="sm" color="secondary">
                          {session.when}
                        </Text>
                      </VStack>
                    </ClickableCard>
                  ))}
                </div>
              </VStack>
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};