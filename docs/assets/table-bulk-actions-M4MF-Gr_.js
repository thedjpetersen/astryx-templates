var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file table-bulk-actions.tsx
 * @input Deterministic fixtures only (support tickets, teammate roster)
 * @output Support inbox: full-bleed data table with a checkbox selection
 *   column and header select-all; when the selection is non-empty a sticky
 *   Toolbar action bar appears above the table with the selected count,
 *   Clear, Archive, Assign (teammate menu), and a destructive Delete
 * @position Page template; emitted by \`astryx template table-bulk-actions\`
 *
 * Frame: Layout height="fill" owns the page. LayoutHeader carries the
 * inbox title + visible ticket count and an Active/Archived segmented
 * view switch. LayoutContent (padding 0) stacks the conditional action
 * bar (position: sticky, top 0 — in the frame, not floating) above the
 * full-bleed Table. Selection lives in useState via the Table selection
 * plugin (useTableSelectionState + useTableSelection), so the checkbox
 * column, header select-all/indeterminate state, and the action bar all
 * derive from one Set of row ids. Bulk actions mutate row state:
 * Archive moves tickets to the Archived view, Assign rewrites the
 * assignee from a DropdownMenu of teammates, Delete removes rows.
 * Every bulk action is announced through a visually hidden aria-live
 * region and clears the selection.
 *
 * Responsive contract:
 * - Table: horizontal scroll inside Table's own scroll wrapper on narrow
 *   viewports; proportional columns keep a 120px minimum so text cells
 *   never collapse, pixel columns (status, priority, updated) keep width.
 * - Action bar: sticky at the top of the content scroller at every
 *   width, so bulk actions stay reachable while the table scrolls
 *   vertically underneath; its buttons keep size sm and do not wrap out
 *   of the Toolbar's end slot.
 * - ≤640px: the action bar collapses to fit without horizontal
 *   overflow — the count label drops the ticket word, and Clear,
 *   Archive, Assign, and Delete become icon-only buttons (Delete gains
 *   a trash icon) with tooltips carrying the labels.
 * - Header: title block keeps width via StackItem fill; the segmented
 *   view switch stays pinned right.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {
  Table,
  proportional,
  pixel,
  useTableSelection,
  useTableSelectionState,
} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ArchiveIcon,
  InboxIcon,
  Trash2Icon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Sticky bulk-action bar: pinned to the top of the content scroller so
  // it stays visible while the table scrolls underneath. The Toolbar's
  // "section" variant supplies an opaque background.
  actionBar: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
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

type TicketStatus = 'open' | 'pending' | 'resolved';
type TicketPriority = 'urgent' | 'high' | 'normal';

interface TicketRow extends Record<string, unknown> {
  id: string;
  subject: string;
  category: string;
  requester: string;
  company: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string | null;
  updated: string;
  isArchived: boolean;
}

// Teammates offered by the bulk Assign menu.
const TEAMMATES = [
  'Dana Whitfield',
  'Omar Haddad',
  'Renee Alvarez',
  'Sasha Kim',
];

const STATUS_BADGE: Record<
  TicketStatus,
  {variant: 'info' | 'warning' | 'success'; label: string}
> = {
  open: {variant: 'info', label: 'Open'},
  pending: {variant: 'warning', label: 'Pending'},
  resolved: {variant: 'success', label: 'Resolved'},
};

const PRIORITY_DOT: Record<
  TicketPriority,
  {variant: 'error' | 'warning' | 'neutral'; label: string}
> = {
  urgent: {variant: 'error', label: 'Urgent'},
  high: {variant: 'warning', label: 'High'},
  normal: {variant: 'neutral', label: 'Normal'},
};

// Support queue fixture — a billing-heavy week for a payments SaaS.
// Two rows start archived so the Archived view is populated.
const TICKETS: TicketRow[] = [
  {
    id: 'SUP-2381',
    subject: 'Duplicate charge on June invoice',
    category: 'Billing',
    requester: 'Anna Kowalski',
    company: 'Meridian Labs',
    status: 'open',
    priority: 'urgent',
    assignee: null,
    updated: 'Jun 30, 9:42 AM',
    isArchived: false,
  },
  {
    id: 'SUP-2379',
    subject: 'Webhook signatures failing after key rotation',
    category: 'API',
    requester: 'Terrence Cole',
    company: 'Bluefin Data',
    status: 'open',
    priority: 'high',
    assignee: 'Dana Whitfield',
    updated: 'Jun 30, 8:15 AM',
    isArchived: false,
  },
  {
    id: 'SUP-2376',
    subject: 'Upgrade to annual plan mid-cycle',
    category: 'Billing',
    requester: 'Marisol Vega',
    company: 'Harborview Clinic',
    status: 'pending',
    priority: 'normal',
    assignee: 'Omar Haddad',
    updated: 'Jun 29, 4:51 PM',
    isArchived: false,
  },
  {
    id: 'SUP-2374',
    subject: 'SSO login loop for two seats',
    category: 'Access',
    requester: 'Elliot Marsh',
    company: 'Northwind Freight',
    status: 'open',
    priority: 'high',
    assignee: null,
    updated: 'Jun 29, 2:08 PM',
    isArchived: false,
  },
  {
    id: 'SUP-2371',
    subject: 'CSV export missing tax column',
    category: 'Reports',
    requester: 'Priya Nair',
    company: 'Cobalt Ventures',
    status: 'pending',
    priority: 'normal',
    assignee: 'Dana Whitfield',
    updated: 'Jun 29, 11:34 AM',
    isArchived: false,
  },
  {
    id: 'SUP-2368',
    subject: 'API rate limit increase request',
    category: 'API',
    requester: 'Jonas Berg',
    company: 'Stackpine',
    status: 'open',
    priority: 'normal',
    assignee: 'Omar Haddad',
    updated: 'Jun 28, 5:27 PM',
    isArchived: false,
  },
  {
    id: 'SUP-2366',
    subject: 'Refund request — cancelled within trial',
    category: 'Billing',
    requester: 'Callie Brooks',
    company: 'Fernwood Studio',
    status: 'open',
    priority: 'normal',
    assignee: null,
    updated: 'Jun 28, 3:02 PM',
    isArchived: false,
  },
  {
    id: 'SUP-2362',
    subject: 'Sandbox keys not provisioning',
    category: 'Onboarding',
    requester: 'Marcus Tan',
    company: 'Quill & Co.',
    status: 'pending',
    priority: 'high',
    assignee: 'Renee Alvarez',
    updated: 'Jun 28, 10:19 AM',
    isArchived: false,
  },
  {
    id: 'SUP-2359',
    subject: 'Update billing contact email',
    category: 'Billing',
    requester: 'Grace Obi',
    company: 'Halcyon Health',
    status: 'resolved',
    priority: 'normal',
    assignee: 'Renee Alvarez',
    updated: 'Jun 27, 4:44 PM',
    isArchived: false,
  },
  {
    id: 'SUP-2355',
    subject: 'Invoice PDF shows wrong currency',
    category: 'Billing',
    requester: 'Anna Kowalski',
    company: 'Meridian Labs',
    status: 'open',
    priority: 'urgent',
    assignee: 'Dana Whitfield',
    updated: 'Jun 27, 1:12 PM',
    isArchived: false,
  },
  {
    id: 'SUP-2340',
    subject: 'Password reset emails delayed',
    category: 'Access',
    requester: 'Noah Feldman',
    company: 'Stackpine',
    status: 'resolved',
    priority: 'normal',
    assignee: 'Omar Haddad',
    updated: 'Jun 24, 9:03 AM',
    isArchived: true,
  },
  {
    id: 'SUP-2333',
    subject: 'Add PO number to invoices',
    category: 'Billing',
    requester: 'Grace Obi',
    company: 'Halcyon Health',
    status: 'resolved',
    priority: 'normal',
    assignee: 'Renee Alvarez',
    updated: 'Jun 23, 2:37 PM',
    isArchived: true,
  },
];

// ============= COLUMNS =============

const TICKET_COLUMNS: TableColumn<TicketRow>[] = [
  {
    key: 'subject',
    header: 'Ticket',
    width: proportional(2),
    renderCell: (item: TicketRow) => (
      <VStack gap={0}>
        <Text type="label" maxLines={1}>
          {item.subject}
        </Text>
        <Text type="supporting" color="secondary">
          {item.id} · {item.category}
        </Text>
      </VStack>
    ),
  },
  {
    key: 'requester',
    header: 'Requester',
    width: proportional(1),
    renderCell: (item: TicketRow) => (
      <HStack gap={2} vAlign="center">
        <Avatar name={item.requester} size="xsmall" />
        <VStack gap={0}>
          <Text type="body" maxLines={1}>
            {item.requester}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {item.company}
          </Text>
        </VStack>
      </HStack>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: pixel(110),
    renderCell: (item: TicketRow) => (
      <Badge
        label={STATUS_BADGE[item.status].label}
        variant={STATUS_BADGE[item.status].variant}
      />
    ),
  },
  {
    key: 'priority',
    header: 'Priority',
    width: pixel(110),
    renderCell: (item: TicketRow) => (
      <HStack gap={2} vAlign="center">
        <StatusDot
          variant={PRIORITY_DOT[item.priority].variant}
          label={\`\${PRIORITY_DOT[item.priority].label} priority\`}
        />
        <Text type="body">{PRIORITY_DOT[item.priority].label}</Text>
      </HStack>
    ),
  },
  {
    key: 'assignee',
    header: 'Assignee',
    width: proportional(1),
    renderCell: (item: TicketRow) =>
      item.assignee === null ? (
        <Text type="body" color="secondary">
          Unassigned
        </Text>
      ) : (
        <HStack gap={2} vAlign="center">
          <Avatar name={item.assignee} size="xsmall" />
          <Text type="body" maxLines={1}>
            {item.assignee}
          </Text>
        </HStack>
      ),
  },
  {
    key: 'updated',
    header: 'Last update',
    width: pixel(130),
    renderCell: (item: TicketRow) => (
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {item.updated}
      </Text>
    ),
  },
];

// ============= PAGE =============

export default function TableBulkActionsTemplate() {
  const [rows, setRows] = useState<TicketRow[]>(TICKETS);
  const [view, setView] = useState('active');
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [announcement, setAnnouncement] = useState('');

  // ≤640px the Toolbar's slots cannot fit full button labels, so the
  // action bar collapses to icon-only buttons (labels move to tooltips
  // and aria labels) instead of overflowing horizontally.
  const isCompact = useMediaQuery('(max-width: 640px)');

  // Select-all must operate on the visible rows only, so the selection
  // state is fed the filtered view, not the full dataset.
  const visibleRows = useMemo(
    () => rows.filter(row => row.isArchived === (view === 'archived')),
    [rows, view],
  );

  const {selectionConfig} = useTableSelectionState<TicketRow>({
    data: visibleRows,
    idKey: 'id',
    selectedKeys,
    setSelectedKeys,
  });
  const selectionPlugin = useTableSelection(selectionConfig);

  const selectedCount = selectedKeys.size;
  const ticketWord = selectedCount === 1 ? 'ticket' : 'tickets';

  const clearSelection = () => setSelectedKeys(new Set());

  // Switching views also clears the selection so the action bar never
  // reports rows the user can no longer see.
  const handleViewChange = (nextView: string) => {
    setView(nextView);
    clearSelection();
  };

  const archiveSelected = () => {
    setRows(prev =>
      prev.map(row =>
        selectedKeys.has(row.id) ? {...row, isArchived: true} : row,
      ),
    );
    setAnnouncement(\`Archived \${selectedCount} \${ticketWord}\`);
    clearSelection();
  };

  const assignSelected = (teammate: string) => {
    setRows(prev =>
      prev.map(row =>
        selectedKeys.has(row.id) ? {...row, assignee: teammate} : row,
      ),
    );
    setAnnouncement(\`Assigned \${selectedCount} \${ticketWord} to \${teammate}\`);
    clearSelection();
  };

  const deleteSelected = () => {
    setRows(prev => prev.filter(row => !selectedKeys.has(row.id)));
    setAnnouncement(\`Deleted \${selectedCount} \${ticketWord}\`);
    clearSelection();
  };

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>Support inbox</Heading>
                <Text type="supporting" color="secondary">
                  {visibleRows.length}{' '}
                  {visibleRows.length === 1 ? 'ticket' : 'tickets'}
                </Text>
              </HStack>
            </StackItem>
            <SegmentedControl
              label="Inbox view"
              value={view}
              onChange={handleViewChange}
              size="sm">
              <SegmentedControlItem label="Active" value="active" />
              <SegmentedControlItem label="Archived" value="archived" />
            </SegmentedControl>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0}>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          {/* Bulk action bar — rendered in the frame (not floating) and
              sticky at the top of the content scroller while any row is
              selected. */}
          {selectedCount === 0 ? null : (
            <div style={styles.actionBar}>
              <Toolbar
                label="Bulk actions"
                size="sm"
                gap={2}
                variant="section"
                dividers={['bottom']}
                startContent={
                  <HStack gap={2} vAlign="center">
                    <Text type="label">
                      {isCompact
                        ? \`\${selectedCount} selected\`
                        : \`\${selectedCount} \${ticketWord} selected\`}
                    </Text>
                    <Button
                      label="Clear"
                      variant="ghost"
                      icon={<Icon icon={XIcon} size="sm" />}
                      isIconOnly={isCompact}
                      tooltip={isCompact ? 'Clear selection' : undefined}
                      onClick={clearSelection}
                    />
                  </HStack>
                }
                endContent={
                  <HStack gap={2} vAlign="center">
                    <Button
                      label="Archive"
                      variant="secondary"
                      icon={<Icon icon={ArchiveIcon} size="sm" />}
                      isIconOnly={isCompact}
                      tooltip={isCompact ? 'Archive' : undefined}
                      onClick={archiveSelected}
                      isDisabled={view === 'archived'}
                    />
                    <DropdownMenu
                      button={{
                        label: 'Assign',
                        variant: 'secondary',
                        icon: <Icon icon={UsersIcon} size="sm" />,
                        isIconOnly: isCompact,
                        tooltip: isCompact ? 'Assign' : undefined,
                      }}
                      hasChevron
                      items={TEAMMATES.map(teammate => ({
                        label: teammate,
                        onClick: () => assignSelected(teammate),
                      }))}
                    />
                    {/* Delete is text-only on wide viewports; compact mode
                        adds the trash icon so the icon-only collapse never
                        yields an unlabeled destructive button. */}
                    <Button
                      label="Delete"
                      variant="destructive"
                      icon={
                        isCompact ? (
                          <Icon icon={Trash2Icon} size="sm" />
                        ) : undefined
                      }
                      isIconOnly={isCompact}
                      tooltip={isCompact ? 'Delete' : undefined}
                      onClick={deleteSelected}
                    />
                  </HStack>
                }
              />
            </div>
          )}
          <Table<TicketRow>
            data={visibleRows}
            columns={TICKET_COLUMNS}
            idKey="id"
            density="balanced"
            dividers="rows"
            hasHover
            plugins={{selection: selectionPlugin}}
            emptyState={
              <EmptyState
                isCompact
                icon={<Icon icon={InboxIcon} size="lg" />}
                title={
                  view === 'archived' ? 'No archived tickets' : 'Inbox zero'
                }
                description={
                  view === 'archived'
                    ? 'Tickets you archive from the active queue land here.'
                    : 'Every ticket in the queue has been handled.'
                }
              />
            }
          />
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};