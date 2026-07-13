var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (workspace roster with hashtags and
 *   member counts, archived workspaces, routing-mode options, move-target
 *   session, classifier suggestion with fixed confidence)
 * @output Workspace management hub for an AI assistant: left column is the
 *   switcher list (Personal with a "current" check, four workspaces with
 *   icon tiles, mono #hashtags, member counts, an amber default star with
 *   tooltip, reorder/archive kebabs, and an Archived section with restore
 *   buttons); right panel swaps between a create-workspace form with live
 *   "/ws #hashtag" preview and collision warning, a routing-mode RadioList
 *   guarded by a confirm AlertDialog, and a "Move session to…" menu whose
 *   Suggested section resolves from a spinner to the classifier's pick
 * @position Page template; emitted by \`astryx template workspace-switcher-hub\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the page title, live
 * active/archived counts, and a "New workspace" shortcut that focuses the
 * create panel. LayoutContent hosts a two-column body: fixed ~340px switcher
 * list on the left, the swappable panel column on the right. No chat surface
 * — unlike ai-chat-workspace-landing this page is *about managing* the
 * workspace roster, not starting a conversation.
 *
 * Responsive contract:
 * - The demo stage never resizes the viewport, so adaptation is driven by a
 *   local ResizeObserver (useElementWidth) on the page wrapper, not
 *   useMediaQuery.
 * - >780px: two columns side by side; the switcher list keeps a fixed 340px
 *   rail and the panel column fills the rest (maxWidth 560).
 * - <=780px: columns stack vertically — switcher list first, panel below at
 *   full width; the panel SegmentedControl stretches (layout "fill").
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

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
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Item} from '@astryxdesign/core/Item';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Spinner} from '@astryxdesign/core/Spinner';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {
  ArchiveRestoreIcon,
  BoxIcon,
  CheckIcon,
  CompassIcon,
  HashIcon,
  PenToolIcon,
  ServerIcon,
  SparklesIcon,
  StarIcon,
  TrendingUpIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  body: {
    display: 'flex',
    gap: 'var(--spacing-4)',
    alignItems: 'flex-start',
    maxWidth: 960,
    marginInline: 'auto',
  },
  bodyStacked: {flexDirection: 'column'},
  switcherRail: {width: 340, flexShrink: 0},
  switcherRailStacked: {width: '100%'},
  panelColumn: {flex: 1, minWidth: 0, maxWidth: 560},
  panelColumnStacked: {maxWidth: 'none', width: '100%'},
  // 10-11px uppercase tracking-wide section eyebrow.
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  // Workspace icon tile: tinted square, glyph in the full icon color.
  iconTile: {
    width: 32,
    height: 32,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
  },
  workspaceRow: {paddingBlock: 'var(--spacing-1)'},
  rowLabelCell: {minWidth: 0},
  monoTag: {whiteSpace: 'nowrap'},
  archivedName: {minWidth: 0},
  previewLine: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-1)',
  },
  suggestedSlot: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
  },
};

// Tinted tile backgrounds keyed by workspace tone.
const TILE_TONE: Record<string, {background: string; color: string}> = {
  blue: {
    background: 'color-mix(in srgb, var(--color-icon-blue) 14%, transparent)',
    color: 'var(--color-icon-blue)',
  },
  green: {
    background: 'color-mix(in srgb, var(--color-icon-green) 14%, transparent)',
    color: 'var(--color-icon-green)',
  },
  purple: {
    background: 'color-mix(in srgb, var(--color-icon-purple) 14%, transparent)',
    color: 'var(--color-icon-purple)',
  },
  orange: {
    background: 'color-mix(in srgb, var(--color-icon-orange) 14%, transparent)',
    color: 'var(--color-icon-orange)',
  },
  neutral: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
};

// ============= DATA =============
// Deterministic fixtures: fixed counts and names, no clocks, no randomness.

const ASSISTANT_NAME = 'Beacon Assistant';
const MOVE_SESSION_TITLE = 'quarterly-billing-audit';

type WorkspaceTone = 'blue' | 'green' | 'purple' | 'orange' | 'neutral';

interface Workspace {
  id: string;
  name: string;
  hashtag: string; // without the leading '#'
  memberCount: number;
  icon: typeof BoxIcon;
  tone: WorkspaceTone;
}

const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: 'ws-atlas',
    name: 'Atlas Core',
    hashtag: 'atlas-core',
    memberCount: 14,
    icon: BoxIcon,
    tone: 'blue',
  },
  {
    id: 'ws-growth',
    name: 'Growth Pod',
    hashtag: 'growth-pod',
    memberCount: 6,
    icon: TrendingUpIcon,
    tone: 'green',
  },
  {
    id: 'ws-design',
    name: 'Design Crit',
    hashtag: 'design-crit',
    memberCount: 9,
    icon: PenToolIcon,
    tone: 'purple',
  },
  {
    id: 'ws-infra',
    name: 'Infra Guild',
    hashtag: 'infra-guild',
    memberCount: 11,
    icon: ServerIcon,
    tone: 'orange',
  },
];

const INITIAL_ARCHIVED: Workspace[] = [
  {
    id: 'ws-hackweek',
    name: 'Hack Week 24',
    hashtag: 'hack-week-24',
    memberCount: 22,
    icon: CompassIcon,
    tone: 'neutral',
  },
  {
    id: 'ws-onboarding',
    name: 'Onboarding Legacy',
    hashtag: 'onboarding-legacy',
    memberCount: 4,
    icon: UsersIcon,
    tone: 'neutral',
  },
];

type PanelId = 'create' | 'routing' | 'move';
type RoutingMode = 'auto' | 'personal' | 'fixed';

const ROUTING_LABELS: Record<RoutingMode, string> = {
  auto: 'Auto-routing',
  personal: 'Personal default',
  fixed: 'Fixed workspace default',
};

// The classifier's pick for the move-session demo (fixed confidence).
const SUGGESTED_WORKSPACE_ID = 'ws-growth';
const SUGGESTED_CONFIDENCE = '87% match';

// ============= HELPERS =============

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

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\\s-]/g, '')
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-');
}

function WorkspaceTile({workspace}: {workspace: Workspace}) {
  const tone = TILE_TONE[workspace.tone];
  return (
    <div
      style={{
        ...styles.iconTile,
        backgroundColor: tone.background,
        color: tone.color,
      }}
      aria-hidden>
      <Icon icon={workspace.icon} size="sm" color="inherit" />
    </div>
  );
}

// ============= SWITCHER LIST =============

function WorkspaceRow({
  workspace,
  index,
  total,
  isDefault,
  onSetDefault,
  onMove,
  onArchive,
}: {
  workspace: Workspace;
  index: number;
  total: number;
  isDefault: boolean;
  onSetDefault: (id: string, pressed: boolean) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onArchive: (id: string) => void;
}) {
  return (
    <HStack gap={2} vAlign="center" style={styles.workspaceRow}>
      <WorkspaceTile workspace={workspace} />
      <StackItem size="fill" style={styles.rowLabelCell}>
        <VStack gap={0}>
          <Text type="label" maxLines={1}>
            {workspace.name}
          </Text>
          <HStack gap={2} vAlign="center">
            <Text type="code" size="sm" color="secondary" style={styles.monoTag}>
              #{workspace.hashtag}
            </Text>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {workspace.memberCount} members
            </Text>
          </HStack>
        </VStack>
      </StackItem>
      <ToggleButton
        label={
          isDefault
            ? \`Unset \${workspace.name} as default workspace\`
            : \`Make \${workspace.name} the default workspace\`
        }
        tooltip="Always start new chats in this workspace"
        isIconOnly
        size="sm"
        icon={<Icon icon={StarIcon} size="sm" color="inherit" />}
        pressedIcon={
          <Icon icon={StarIcon} size="sm" color="warning" fill="currentColor" />
        }
        isPressed={isDefault}
        onPressedChange={pressed => onSetDefault(workspace.id, pressed)}
      />
      <MoreMenu
        label={\`Options for \${workspace.name}\`}
        size="sm"
        items={[
          {
            label: 'Move up',
            isDisabled: index === 0,
            onClick: () => onMove(workspace.id, -1),
          },
          {
            label: 'Move down',
            isDisabled: index === total - 1,
            onClick: () => onMove(workspace.id, 1),
          },
          {label: 'Settings', onClick: () => {}},
          {type: 'divider'},
          {label: 'Archive', onClick: () => onArchive(workspace.id)},
        ]}
      />
    </HStack>
  );
}

// ============= PAGE =============

export default function WorkspaceSwitcherHubTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isStacked = wrapWidth > 0 && wrapWidth <= 780;

  const [workspaces, setWorkspaces] = useState(INITIAL_WORKSPACES);
  const [archived, setArchived] = useState(INITIAL_ARCHIVED);
  const [defaultId, setDefaultId] = useState<string | null>('ws-atlas');
  const [activePanel, setActivePanel] = useState<PanelId>('create');

  // Create-workspace form. The seeded hashtag collides with Growth Pod so
  // the warning state is visible on first paint.
  const [draftName, setDraftName] = useState('Growth Pod EMEA');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftHashtag, setDraftHashtag] = useState('growth-pod');

  // Routing mode with confirm-before-switch.
  const [routingMode, setRoutingMode] = useState<RoutingMode>('auto');
  const [pendingRouting, setPendingRouting] = useState<RoutingMode | null>(
    null,
  );

  // Move-session demo: the Suggested slot resolves after a short beat.
  const [isSuggestionReady, setIsSuggestionReady] = useState(false);
  const [movedTo, setMovedTo] = useState<string | null>(null);

  useEffect(() => {
    if (activePanel !== 'move') {
      return undefined;
    }
    setIsSuggestionReady(false);
    const timer = setTimeout(() => setIsSuggestionReady(true), 1400);
    return () => clearTimeout(timer);
  }, [activePanel]);

  const defaultWorkspace = workspaces.find(ws => ws.id === defaultId) ?? null;

  const setDefault = (id: string, pressed: boolean) => {
    setDefaultId(pressed ? id : null);
  };

  const moveWorkspace = (id: string, direction: -1 | 1) => {
    setWorkspaces(prev => {
      const index = prev.findIndex(ws => ws.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const [row] = next.splice(index, 1);
      next.splice(target, 0, row);
      return next;
    });
  };

  const archiveWorkspace = (id: string) => {
    const row = workspaces.find(ws => ws.id === id);
    if (row == null) {
      return;
    }
    setWorkspaces(prev => prev.filter(ws => ws.id !== id));
    setArchived(prev => [row, ...prev]);
    if (defaultId === id) {
      setDefaultId(null);
    }
  };

  const restoreWorkspace = (id: string) => {
    const row = archived.find(ws => ws.id === id);
    if (row == null) {
      return;
    }
    setArchived(prev => prev.filter(ws => ws.id !== id));
    setWorkspaces(prev => [...prev, row]);
  };

  // ----- Create form derivations -----
  const hashtagSlug = slugify(
    draftHashtag.length > 0 ? draftHashtag : draftName,
  );
  const collision = [...workspaces, ...archived].find(
    ws => ws.hashtag === hashtagSlug && hashtagSlug.length > 0,
  );
  const canCreate =
    draftName.trim().length > 0 && hashtagSlug.length > 0 && collision == null;

  const createWorkspace = () => {
    if (!canCreate) {
      return;
    }
    setWorkspaces(prev => [
      ...prev,
      {
        id: \`ws-new-\${prev.length + 1}\`,
        name: draftName.trim(),
        hashtag: hashtagSlug,
        memberCount: 1,
        icon: UsersIcon,
        tone: 'neutral',
      },
    ]);
    setDraftName('');
    setDraftDescription('');
    setDraftHashtag('');
  };

  const resetForm = () => {
    setDraftName('');
    setDraftDescription('');
    setDraftHashtag('');
  };

  const requestRoutingChange = (value: string) => {
    const next = value as RoutingMode;
    if (next !== routingMode) {
      setPendingRouting(next);
    }
  };

  const moveSessionTo = (name: string) => {
    setMovedTo(name);
  };

  const suggestedWorkspace =
    workspaces.find(ws => ws.id === SUGGESTED_WORKSPACE_ID) ?? workspaces[0];

  // ----- Panels -----

  const createPanel = (
    <Card padding={4}>
      <VStack gap={3}>
        <VStack gap={1}>
          <div style={styles.eyebrow}>New workspace</div>
          <Heading level={2}>Create team workspace</Heading>
          <Text type="supporting" color="secondary">
            Workspaces share sessions, files, and memory with every member.
          </Text>
        </VStack>
        <TextInput
          label="Name"
          placeholder="e.g. My Team"
          value={draftName}
          onChange={setDraftName}
        />
        <TextArea
          label="Description"
          isOptional
          rows={2}
          placeholder="What this team uses the assistant for"
          value={draftDescription}
          onChange={setDraftDescription}
        />
        <TextInput
          label="Hashtag"
          description="Used to reference the workspace in chat commands"
          startIcon={<Icon icon={HashIcon} size="sm" color="secondary" />}
          placeholder="my-team"
          value={draftHashtag}
          onChange={setDraftHashtag}
          status={
            collision != null
              ? {
                  type: 'warning',
                  message: \`#\${hashtagSlug} is already used by \${collision.name} — hashtags must be unique.\`,
                }
              : undefined
          }
        />
        <div style={styles.previewLine}>
          <HStack gap={2} vAlign="center">
            <Text type="supporting" color="secondary">
              Preview
            </Text>
            <Text type="code" size="sm">
              /ws #{hashtagSlug.length > 0 ? hashtagSlug : 'my-team'}
            </Text>
          </HStack>
        </div>
        <HStack gap={2}>
          <Button
            label="Create workspace"
            isDisabled={!canCreate}
            onClick={createWorkspace}
          />
          <Button label="Cancel" variant="ghost" onClick={resetForm} />
        </HStack>
      </VStack>
    </Card>
  );

  const routingPanel = (
    <Card padding={4}>
      <VStack gap={3}>
        <VStack gap={1}>
          <div style={styles.eyebrow}>Chat routing</div>
          <Heading level={2}>Where new chats start</Heading>
          <Text type="supporting" color="secondary">
            {ASSISTANT_NAME} applies this when you open a chat without picking
            a workspace first.
          </Text>
        </VStack>
        <RadioList
          label="Routing mode"
          isLabelHidden
          value={routingMode}
          onChange={requestRoutingChange}>
          <RadioListItem
            label="Auto-routing"
            value="auto"
            description="The assistant reads the first message of each new chat and places it in the workspace it most likely belongs to."
          />
          <RadioListItem
            label="Personal default"
            value="personal"
            description="Every new chat starts in Personal until you move it."
          />
          <RadioListItem
            label="Fixed workspace default"
            value="fixed"
            description={
              defaultWorkspace != null
                ? \`New chats always start in \${defaultWorkspace.name} (your starred default).\`
                : 'New chats always start in your starred default workspace. Star a workspace to use this mode.'
            }
          />
        </RadioList>
      </VStack>
    </Card>
  );

  const movePanel = (
    <Card padding={4}>
      <VStack gap={3}>
        <VStack gap={1}>
          <div style={styles.eyebrow}>Move session to…</div>
          <Heading level={2}>Move session</Heading>
          <HStack gap={2} vAlign="center">
            <Text type="supporting" color="secondary">
              Moving:
            </Text>
            <Text type="code" size="sm">
              {MOVE_SESSION_TITLE}
            </Text>
          </HStack>
        </VStack>
        {movedTo != null && (
          <Banner
            status="success"
            title={\`Moved to \${movedTo}\`}
            description="Members of that workspace can now see this session."
            isDismissable
            onDismiss={() => setMovedTo(null)}
          />
        )}
        <VStack gap={1}>
          <HStack gap={1} vAlign="center">
            <Icon icon={SparklesIcon} size="xsm" color="secondary" />
            <div style={styles.eyebrow}>Suggested</div>
          </HStack>
          <div style={styles.suggestedSlot}>
            {!isSuggestionReady ? (
              <HStack gap={2} vAlign="center">
                <Spinner size="sm" aria-label="Finding best match" />
                <Text type="supporting" color="secondary">
                  Finding best match…
                </Text>
              </HStack>
            ) : (
              <StackItem size="fill">
                <Item
                  label={suggestedWorkspace.name}
                  description={\`#\${suggestedWorkspace.hashtag} · \${suggestedWorkspace.memberCount} members\`}
                  startContent={<WorkspaceTile workspace={suggestedWorkspace} />}
                  endContent={
                    <Badge label={SUGGESTED_CONFIDENCE} variant="info" />
                  }
                  density="compact"
                  onClick={() => moveSessionTo(suggestedWorkspace.name)}
                />
              </StackItem>
            )}
          </div>
        </VStack>
        <Divider />
        <VStack gap={1}>
          <div style={styles.eyebrow}>All destinations</div>
          <Item
            label="Personal"
            description="Only you"
            startContent={
              <div
                style={{
                  ...styles.iconTile,
                  backgroundColor: TILE_TONE.neutral.background,
                  color: TILE_TONE.neutral.color,
                }}
                aria-hidden>
                <Icon icon={UserIcon} size="sm" color="inherit" />
              </div>
            }
            density="compact"
            onClick={() => moveSessionTo('Personal')}
          />
          {workspaces.map(ws => (
            <Item
              key={ws.id}
              label={ws.name}
              description={\`#\${ws.hashtag} · \${ws.memberCount} members\`}
              startContent={<WorkspaceTile workspace={ws} />}
              endContent={
                ws.id === defaultId ? (
                  <Icon
                    icon={StarIcon}
                    size="xsm"
                    color="warning"
                    fill="currentColor"
                  />
                ) : undefined
              }
              density="compact"
              onClick={() => moveSessionTo(ws.name)}
            />
          ))}
        </VStack>
      </VStack>
    </Card>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>Workspaces</Heading>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {workspaces.length} active · {archived.length} archived
                </Text>
              </HStack>
            </StackItem>
            <Button
              label="New workspace"
              size="sm"
              onClick={() => setActivePanel('create')}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <div ref={wrapRef} style={{height: '100%'}}>
            <div
              style={{
                ...styles.body,
                ...(isStacked ? styles.bodyStacked : undefined),
              }}>
              {/* ----- Switcher list ----- */}
              <div
                style={{
                  ...styles.switcherRail,
                  ...(isStacked ? styles.switcherRailStacked : undefined),
                }}>
                <Card padding={4}>
                  <VStack gap={3}>
                    <div style={styles.eyebrow}>Switch workspace</div>

                    {/* Personal: always on top, marked as current. */}
                    <HStack gap={2} vAlign="center" style={styles.workspaceRow}>
                      <div
                        style={{
                          ...styles.iconTile,
                          backgroundColor: TILE_TONE.neutral.background,
                          color: TILE_TONE.neutral.color,
                        }}
                        aria-hidden>
                        <Icon icon={UserIcon} size="sm" color="inherit" />
                      </div>
                      <StackItem size="fill" style={styles.rowLabelCell}>
                        <VStack gap={0}>
                          <Text type="label">Personal</Text>
                          <Text type="supporting" color="secondary">
                            Private sessions and files
                          </Text>
                        </VStack>
                      </StackItem>
                      <Icon
                        icon={CheckIcon}
                        size="sm"
                        color="primary"
                        aria-label="Current workspace"
                      />
                    </HStack>

                    <Divider />

                    {workspaces.map((ws, index) => (
                      <WorkspaceRow
                        key={ws.id}
                        workspace={ws}
                        index={index}
                        total={workspaces.length}
                        isDefault={ws.id === defaultId}
                        onSetDefault={setDefault}
                        onMove={moveWorkspace}
                        onArchive={archiveWorkspace}
                      />
                    ))}

                    <Divider />

                    <div style={styles.eyebrow}>Archived</div>
                    {archived.length === 0 ? (
                      <Text type="supporting" color="secondary">
                        Nothing archived.
                      </Text>
                    ) : (
                      archived.map(ws => (
                        <HStack
                          key={ws.id}
                          gap={2}
                          vAlign="center"
                          style={styles.workspaceRow}>
                          <WorkspaceTile workspace={ws} />
                          <StackItem size="fill" style={styles.archivedName}>
                            <VStack gap={0}>
                              <Text type="label" color="secondary" maxLines={1}>
                                {ws.name}
                              </Text>
                              <Text
                                type="code"
                                size="sm"
                                color="secondary"
                                style={styles.monoTag}>
                                #{ws.hashtag}
                              </Text>
                            </VStack>
                          </StackItem>
                          <Button
                            label="Restore"
                            variant="ghost"
                            size="sm"
                            icon={
                              <Icon
                                icon={ArchiveRestoreIcon}
                                size="sm"
                                color="inherit"
                              />
                            }
                            onClick={() => restoreWorkspace(ws.id)}
                          />
                        </HStack>
                      ))
                    )}
                  </VStack>
                </Card>
              </div>

              {/* ----- Swappable right panel ----- */}
              <div
                style={{
                  ...styles.panelColumn,
                  ...(isStacked ? styles.panelColumnStacked : undefined),
                }}>
                <VStack gap={3}>
                  <SegmentedControl
                    label="Workspace panel"
                    value={activePanel}
                    onChange={value => setActivePanel(value as PanelId)}
                    layout={isStacked ? 'fill' : 'hug'}>
                    <SegmentedControlItem value="create" label="Create" />
                    <SegmentedControlItem value="routing" label="Routing" />
                    <SegmentedControlItem value="move" label="Move session" />
                  </SegmentedControl>
                  {activePanel === 'create' && createPanel}
                  {activePanel === 'routing' && routingPanel}
                  {activePanel === 'move' && movePanel}
                </VStack>
              </div>
            </div>
          </div>

          {/* Confirm before switching routing modes. */}
          <AlertDialog
            isOpen={pendingRouting != null}
            onOpenChange={isOpen => {
              if (!isOpen) {
                setPendingRouting(null);
              }
            }}
            title="Change routing mode?"
            description={
              pendingRouting != null
                ? \`New chats will use "\${ROUTING_LABELS[pendingRouting]}" from now on. Chats already in progress keep their current workspace.\`
                : ''
            }
            actionLabel="Switch mode"
            actionVariant="primary"
            onAction={() => {
              if (pendingRouting != null) {
                setRoutingMode(pendingRouting);
              }
              setPendingRouting(null);
            }}
          />
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};