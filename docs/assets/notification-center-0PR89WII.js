var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (5 tray notifications with fixed ISO
 *   times or pre-formatted "Yesterday …"/"Jun 30 …" strings, an unread set,
 *   a pending toast record, and specimen copy for the loading/empty/capped
 *   variants)
 * @output App-chrome notification tray: a TopNav whose bell IconButton
 *   carries a red unread pill Badge (capped at "9+"), with the 320px
 *   notifications Popover pinned open below it — "Notifications" header
 *   with a "Mark read" ghost Button that disables at zero unread, then a
 *   scrolling list where each row pairs a top-aligned primary unread
 *   StatusDot (transparent once read) with a truncated title, a two-line
 *   clamped body, and a 10px muted timestamp; a transient Toast card fixed
 *   bottom-right ("Nightly repo scan finished" with body and X dismiss)
 *   that files into the tray as an unread row when dismissed; and a
 *   3-across specimen Grid showing the loading (Spinner) and empty popover
 *   variants plus a "9+" capped-badge bell
 * @position Page template; emitted by \`astryx template notification-center\`
 *
 * Frame: Layout height="fill". LayoutHeader (padding 0, divider) hosts the
 * TopNav — product mark, three nav links, right cluster of bell + badge and
 * Avatar. LayoutContent is a muted app backdrop: a dimmed, aria-hidden
 * placeholder dashboard skeleton reads as the page behind the chrome; the
 * notification Popover (width 320, list scrolls inside ~384px) is anchored
 * below the bell at the top-right and rendered pinned open. The Toast is
 * fixed bottom-right (width 352). A specimen strip at the bottom shows the
 * loading/empty/capped-badge variants as side-by-side Cards.
 *
 * Responsive contract:
 * - >768px: TopNav shows the three text links; the specimen Grid sits
 *   3-across (minWidth 260 tracks).
 * - <=768px: nav links hide (product mark, bell, and avatar remain) and
 *   the specimen Grid stacks to one column.
 * - The Popover keeps width 320 at every breakpoint (anchored to the
 *   bell); only its notification list scrolls. The Toast keeps its 352px
 *   width and bottom-right anchor.
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
import {TopNav, TopNavHeading, TopNavItem} from '@astryxdesign/core/TopNav';
import {NavIcon} from '@astryxdesign/core/NavIcon';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {Popover} from '@astryxdesign/core/Popover';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Toast} from '@astryxdesign/core/Toast';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {BellIcon, HomeIcon} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Muted app backdrop behind the pinned-open tray.
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
    minHeight: '100%',
    boxSizing: 'border-box',
  },
  // The placeholder dashboard reads as context, not content: dimmed and
  // inert so the tray + toast stay the focus.
  dimmedDashboard: {
    opacity: 0.55,
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  // Bell + pill badge: navi's -top-1/-right-1 destructive pill. The pill is
  // compacted (default Badge is a 20px pill that swallows the 16px bell
  // glyph) and anchored so it overlaps the glyph's top-right corner without
  // crowding the adjacent avatar.
  bellWrap: {
    position: 'relative',
    display: 'inline-flex',
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    pointerEvents: 'none',
    display: 'inline-flex',
  },
  bellBadgePill: {
    height: 16,
    minWidth: 16,
    paddingInline: 'var(--spacing-1)',
    fontSize: 10,
    lineHeight: 1,
  },
  // Tray internals: header row is fixed; only the list scrolls. The
  // popover itself is width 320 (set on the Popover), list caps ~384px
  // total tray height.
  trayHeader: {
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  trayList: {
    maxHeight: 336,
    overflowY: 'auto',
  },
  // Rows top-align their slots so the unread dot anchors to the title line
  // instead of centering on the whole multi-line item.
  row: {
    alignItems: 'flex-start',
  },
  // Top-aligned unread dot column; the dot is transparent (not removed)
  // when read so titles stay aligned. display:flex strips the inline-block
  // dot's baseline whitespace; paddingTop then centers the 8px dot on the
  // title's 20px line box: (20 - 8) / 2.
  dotCell: {
    display: 'flex',
    paddingTop: 6,
    width: 8,
    flexShrink: 0,
  },
  dotRead: {
    opacity: 0,
  },
  // Toast: fixed bottom-right, navi's w-[22rem].
  toastWrap: {
    position: 'fixed',
    bottom: 'var(--spacing-5)',
    right: 'var(--spacing-5)',
    width: 352,
    maxWidth: 'calc(100vw - 2 * var(--spacing-5))',
    zIndex: 40,
  },
  // Specimen cards mimic the tray frame at popover width.
  specimenBody: {
    minHeight: 132,
    display: 'grid',
    placeItems: 'center',
    padding: 'var(--spacing-4)',
  },
};

// ============= DATA =============
// Deterministic fixtures: fixed ISO times for same-day rows ("2:14 PM"),
// pre-formatted strings for older rows ("Yesterday 4:03 PM"). No clocks.

const PRODUCT_NAME = 'Navi';
const WORKSPACE_NAME = 'Acme workspace';
const CURRENT_USER = 'Dana Whitfield';

const NAV_ITEMS = ['Overview', 'Runs', 'Schedules'] as const;

// Timestamp vocabulary: same-day rows render a real Timestamp
// (format="time"); older rows use the exact "Yesterday 4:03 PM" /
// "Jun 30 11:20 AM" strings from the tray spec.
type NotificationWhen =
  | {kind: 'time'; iso: string}
  | {kind: 'text'; display: string};

interface TrayNotification {
  id: string;
  title: string;
  body: string;
  when: NotificationWhen;
  isUnread: boolean;
}

const INITIAL_NOTIFICATIONS: TrayNotification[] = [
  {
    id: 'n-1',
    title: 'Schedule "standup-digest" ran',
    body: 'Your Monday digest is ready — 4 PRs need review.',
    when: {kind: 'time', iso: '2026-07-02T14:14:00'},
    isUnread: true,
  },
  {
    id: 'n-2',
    title: 'Alicia joined Growth Pod',
    body: 'alicia@acme.dev accepted your workspace invite.',
    when: {kind: 'time', iso: '2026-07-02T11:02:00'},
    isUnread: true,
  },
  {
    id: 'n-3',
    title: 'Sandbox provisioned',
    body: 'sbx-4188 is ready: Node 22, repo checkout, and secrets mounted.',
    when: {kind: 'text', display: 'Yesterday 4:03 PM'},
    isUnread: true,
  },
  {
    id: 'n-4',
    title: 'Fork completed: smaller batches',
    body: 'Run #86 branched from step 3 with batch size 50; 240 items queued.',
    when: {kind: 'text', display: 'Jun 30 11:20 AM'},
    isUnread: false,
  },
  {
    id: 'n-5',
    title: 'Skill "pr-review" updated to v3',
    body: 'Changelog: tighter diff heuristics and Ruby support.',
    when: {kind: 'text', display: 'Jun 28 9:45 AM'},
    isUnread: false,
  },
];

// The corner toast files into the tray as an unread row when dismissed;
// it joins the badge count only once it lands in the tray, so the pill
// always matches the visible unread dots.
const TOAST_NOTIFICATION: TrayNotification = {
  id: 'n-6',
  title: 'Nightly repo scan finished',
  body: '3 stale branches found in navi-infra. Two PRs are ready for review.',
  when: {kind: 'time', iso: '2026-07-02T14:26:00'},
  isUnread: true,
};

// navi caps the pill at "9+".
function formatUnread(count: number): string {
  return count > 9 ? '9+' : String(count);
}

// ============= SHARED BITS =============

/** Bell icon button with the red unread pill pinned to its top-right. */
function BellWithBadge({
  unreadCount,
  label,
}: {
  unreadCount: number;
  label: string;
}) {
  return (
    <span style={styles.bellWrap}>
      <IconButton
        label={label}
        icon={<Icon icon={BellIcon} size="sm" />}
        variant="ghost"
      />
      {unreadCount > 0 && (
        <span style={styles.bellBadge}>
          <Badge
            variant="error"
            label={formatUnread(unreadCount)}
            style={styles.bellBadgePill}
          />
        </span>
      )}
    </span>
  );
}

function NotificationWhenText({when}: {when: NotificationWhen}) {
  // 10px muted timestamp; size="xsm" resolves to the 0.625rem token.
  if (when.kind === 'time') {
    return (
      <Timestamp
        value={when.iso}
        format="time"
        type="supporting"
        size="xsm"
        color="secondary"
      />
    );
  }
  return (
    <Text type="supporting" size="xsm" color="secondary">
      {when.display}
    </Text>
  );
}

function NotificationRow({
  notification,
  onRead,
}: {
  notification: TrayNotification;
  onRead: (id: string) => void;
}) {
  return (
    <ListItem
      label={
        <Text
          size="sm"
          weight={notification.isUnread ? 'semibold' : 'normal'}
          maxLines={1}>
          {notification.title}
        </Text>
      }
      description={
        <VStack gap={0.5}>
          <Text type="supporting" color="secondary" maxLines={2}>
            {notification.body}
          </Text>
          <NotificationWhenText when={notification.when} />
        </VStack>
      }
      startContent={
        <div style={styles.dotCell}>
          {notification.isUnread ? (
            <StatusDot variant="accent" label="Unread" />
          ) : (
            <StatusDot
              variant="accent"
              label=""
              aria-hidden
              style={styles.dotRead}
            />
          )}
        </div>
      }
      onClick={() => onRead(notification.id)}
      style={styles.row}
    />
  );
}

/** Shared tray header: title left, "Mark read" ghost button right. */
function TrayHeader({
  unreadCount,
  onMarkRead,
}: {
  unreadCount: number;
  onMarkRead?: () => void;
}) {
  return (
    <HStack gap={2} vAlign="center" style={styles.trayHeader}>
      <StackItem size="fill">
        <Text type="label">Notifications</Text>
      </StackItem>
      <Button
        label="Mark read"
        variant="ghost"
        size="sm"
        isDisabled={unreadCount === 0}
        onClick={onMarkRead}
      />
    </HStack>
  );
}

// ============= DASHBOARD SKELETON (context behind the tray) =============

function DimmedDashboard() {
  return (
    <div style={styles.dimmedDashboard} aria-hidden>
      <VStack gap={2}>
        <Skeleton width={200} height={20} index={0} />
        <Skeleton width={320} height={12} index={1} />
      </VStack>
      <Grid columns={{minWidth: 200, max: 3}} gap={3}>
        {[0, 1, 2].map(slot => (
          <Card key={slot} padding={4}>
            <VStack gap={2}>
              <Skeleton width={88} height={10} index={slot} />
              <Skeleton width={132} height={24} index={slot + 1} />
              <Skeleton width="100%" height={8} index={slot + 2} />
            </VStack>
          </Card>
        ))}
      </Grid>
      <Card padding={4}>
        <VStack gap={3}>
          <Skeleton width={160} height={12} index={0} />
          {[0, 1, 2, 3].map(row => (
            <Skeleton key={row} width="100%" height={14} index={row} />
          ))}
        </VStack>
      </Card>
    </div>
  );
}

// ============= SPECIMENS =============

function LoadingSpecimen() {
  return (
    <VStack gap={2}>
      <Text type="label" color="secondary">
        Loading
      </Text>
      <Card padding={0}>
        <TrayHeader unreadCount={0} />
        <Divider />
        <div style={styles.specimenBody}>
          <HStack gap={2} vAlign="center">
            <Spinner size="sm" aria-label="Loading notifications" />
            <Text type="supporting" color="secondary">
              Loading notifications
            </Text>
          </HStack>
        </div>
      </Card>
    </VStack>
  );
}

function EmptySpecimen() {
  return (
    <VStack gap={2}>
      <Text type="label" color="secondary">
        Empty
      </Text>
      <Card padding={0}>
        <TrayHeader unreadCount={0} />
        <Divider />
        <div style={styles.specimenBody}>
          <EmptyState
            title="No notifications yet."
            description="Activity from schedules, runs, and teammates lands here."
            isCompact
          />
        </div>
      </Card>
    </VStack>
  );
}

function CappedBadgeSpecimen() {
  return (
    <VStack gap={2}>
      <Text type="label" color="secondary">
        Capped badge
      </Text>
      <Card padding={0}>
        <div style={styles.specimenBody}>
          <VStack gap={3} hAlign="center">
            <Tooltip content="12 unread — the pill caps at 9+">
              <BellWithBadge
                unreadCount={12}
                label="Notifications (12 unread)"
              />
            </Tooltip>
            <Text type="supporting" color="secondary">
              Counts above 9 render as “9+”
            </Text>
          </VStack>
        </div>
      </Card>
    </VStack>
  );
}

// ============= PAGE =============

export default function NotificationCenterTemplate() {
  const [activeNav, setActiveNav] = useState<string>(NAV_ITEMS[0]);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  // Pinned open per the template scenario; the bell still toggles it.
  const [isTrayOpen, setIsTrayOpen] = useState(true);
  const [isToastPending, setIsToastPending] = useState(true);

  const isNarrow = useMediaQuery('(max-width: 768px)');

  // The badge mirrors the tray: 3 unread rows = 3. The pending toast only
  // counts once it files into the tray, so the pill matches the dots.
  const unreadCount = notifications.filter(item => item.isUnread).length;

  const markRead = (id: string) => {
    setNotifications(prev =>
      prev.map(item => (item.id === id ? {...item, isUnread: false} : item)),
    );
  };

  // "Mark read" also settles the pending toast: it files into the tray as
  // an already-read row and the badge drops to zero.
  const markAllRead = () => {
    setIsToastPending(false);
    setNotifications(prev => {
      const withToast = prev.some(item => item.id === TOAST_NOTIFICATION.id)
        ? prev
        : [TOAST_NOTIFICATION, ...prev];
      return withToast.map(item => ({...item, isUnread: false}));
    });
  };

  // Dismissing the toast files it into the tray as an unread row, ticking
  // the badge up until something is read.
  const dismissToast = () => {
    setIsToastPending(false);
    setNotifications(prev =>
      prev.some(item => item.id === TOAST_NOTIFICATION.id)
        ? prev
        : [TOAST_NOTIFICATION, ...prev],
    );
  };

  const trayContent = (
    <VStack gap={0}>
      <TrayHeader unreadCount={unreadCount} onMarkRead={markAllRead} />
      <Divider />
      <div style={styles.trayList}>
        {notifications.length === 0 ? (
          <div style={styles.specimenBody}>
            <EmptyState title="No notifications yet." isCompact />
          </div>
        ) : (
          <List density="compact" hasDividers>
            {notifications.map(notification => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onRead={markRead}
              />
            ))}
          </List>
        )}
      </div>
    </VStack>
  );

  return (
    <>
      <Layout
        height="fill"
        header={
          // padding 0: TopNav manages its own internal padding.
          <LayoutHeader hasDivider padding={0} role="banner">
            <TopNav
              label="Primary"
              heading={
                <TopNavHeading
                  logo={
                    <NavIcon
                      icon={<HomeIcon style={{width: 16, height: 16}} />}
                    />
                  }
                  heading={PRODUCT_NAME}
                  subheading={WORKSPACE_NAME}
                />
              }
              startContent={
                isNarrow ? undefined : (
                  <>
                    {NAV_ITEMS.map(item => (
                      <TopNavItem
                        key={item}
                        label={item}
                        href={\`#\${item.toLowerCase()}\`}
                        isSelected={item === activeNav}
                        onClick={event => {
                          event.preventDefault();
                          setActiveNav(item);
                        }}
                      />
                    ))}
                  </>
                )
              }
              endContent={
                <HStack gap={2} vAlign="center">
                  <Popover
                    label="Notifications"
                    placement="below"
                    alignment="end"
                    width={320}
                    isOpen={isTrayOpen}
                    onOpenChange={setIsTrayOpen}
                    hasAutoFocus={false}
                    content={trayContent}>
                    <BellWithBadge
                      unreadCount={unreadCount}
                      label={\`Notifications (\${unreadCount} unread)\`}
                    />
                  </Popover>
                  <Avatar name={CURRENT_USER} size="xsmall" />
                </HStack>
              }
            />
          </LayoutHeader>
        }
        content={
          <LayoutContent role="main" label="Notification center">
            <div style={styles.page}>
              {/* Dimmed placeholder dashboard: chrome context behind the
                  pinned-open tray. */}
              <DimmedDashboard />

              <Divider />

              {/* Specimen strip: the tray's other states, side by side. */}
              <VStack gap={3}>
                <VStack gap={1}>
                  <Heading level={2}>Tray states</Heading>
                  <Text type="supporting" color="secondary">
                    Loading and empty popover variants, plus the capped
                    unread pill.
                  </Text>
                </VStack>
                <Grid columns={{minWidth: 260}} gap={3}>
                  <LoadingSpecimen />
                  <EmptySpecimen />
                  <CappedBadgeSpecimen />
                </Grid>
              </VStack>
            </div>
          </LayoutContent>
        }
      />

      {/* Transient toast, fixed bottom-right; X files it into the tray. */}
      {isToastPending && (
        <div style={styles.toastWrap}>
          <Toast
            type="info"
            isAutoHide={false}
            autoHideDuration={8000}
            onDismiss={dismissToast}
            body={
              <VStack gap={0.5}>
                <Text weight="semibold">{TOAST_NOTIFICATION.title}</Text>
                <Text type="supporting">{TOAST_NOTIFICATION.body}</Text>
              </VStack>
            }
          />
        </div>
      )}
    </>
  );
}
`;export{e as default};