// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file table-index-detail.tsx
 * @input Deterministic fixtures only (field-service jobs for a mechanical
 *   contractor: customers, technicians, fixed ISO schedule times, quotes)
 * @output Index/detail table: a master jobs table whose selected row
 *   populates a detail pane with heading, StatusDot state, action buttons,
 *   a MetadataList, and a related-jobs list (site history) that can jump
 *   selection to another row
 * @position Page template; emitted by `astryx template table-index-detail`
 *
 * Frame: header | jobs table (fill) | detail panel 400 (end). A 100dvh root
 * div gives Layout height="fill" a definite height in auto-height hosts, so
 * the table region scrolls internally and the detail pane stays pinned.
 *
 * Selection contract: useState holds the selected job id, seeded with the
 * first fixture row so the detail pane is never empty. Rows are reachable
 * by keyboard (tabIndex 0, Enter/Space select) and carry aria-selected.
 *
 * Responsive contract:
 * - > 1024px: table keeps full remaining width; detail pane is a fixed
 *   400px LayoutPanel on the end edge with its own vertical scroll.
 * - <= 1024px: the end panel is dropped; the detail section renders below
 *   the table inside one shared vertical scroller (table on top, detail
 *   underneath), per the index-on-top pattern for narrow viewports.
 * - <= 768px: the Technician and Scheduled columns are hidden so the
 *   remaining columns keep readable widths; all data stays reachable
 *   through the detail pane's MetadataList. The same two columns are also
 *   hidden whenever the measured table region is under 900px (the 400px
 *   end panel and any host chrome shrink it independently of the
 *   viewport), so the full column set never runs out of room.
 * - <= 640px: the header "New job" button and the detail pane's action
 *   buttons keep size sm but grow to 40px tall so their tap targets meet
 *   the ~40px touch threshold; desktop keeps the 28px sm height.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type RefObject,
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
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {List, ListItem} from '@astryxdesign/core/List';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@astryxdesign/core/Table';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {PlusIcon} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Definite height so Layout height="fill" resolves even when the host
  // container is auto-height; the table region scrolls internally while the
  // detail pane stays pinned instead of the page stretching to table length.
  root: {
    height: '100dvh',
    width: '100%',
  },
  contentFill: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  // Wide: only the table region scrolls; narrow: this wraps table + detail
  // in one shared vertical scroller.
  scrollRegion: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
  },
  row: {
    cursor: 'pointer',
  },
  rowSelected: {
    cursor: 'pointer',
    backgroundColor: 'var(--color-accent-muted)',
  },
  // Numeric cells use tabular numerals so the quote column stays aligned.
  numericCell: {
    textAlign: 'end',
    fontVariantNumeric: 'tabular-nums',
  },
  numericHeader: {
    textAlign: 'end',
  },
  // Children-mode Table defaults to table-layout auto, where the cells'
  // truncation styles (max-width: 0) collapse every column to its padding.
  // Fixed layout sizes columns from the header row's widths — the flexible
  // Job column takes the remaining width.
  table: {
    tableLayout: 'fixed',
  },
  // Fixed column widths. min-width beats the truncation max-width, so each
  // fixed column sets both (matching the data-driven Table mode).
  colCustomer: {width: 190, minWidth: 190},
  colStatus: {width: 130, minWidth: 130},
  colTechnician: {width: 150, minWidth: 150},
  colScheduled: {width: 170, minWidth: 170},
  colQuoted: {width: 90, minWidth: 90},
  detail: {
    padding: 'var(--spacing-4)',
  },
  // ~40px touch targets on phones (size="sm" renders 28px).
  buttonTapTarget: {height: 40},
};

// ============= DATA =============

type JobStatus = 'scheduled' | 'in_progress' | 'on_hold' | 'overdue' | 'completed';
type Priority = 'urgent' | 'high' | 'normal';

interface ServiceJob {
  id: string;
  summary: string;
  customer: string;
  address: string;
  technician: string;
  status: JobStatus;
  priority: Priority;
  scheduledAt: string;
  quoted: string;
  equipment: string;
  /** Prior jobs at the same site — powers the related-items list. */
  relatedIds: string[];
}

const STATUS_META: Record<
  JobStatus,
  {label: string; dot: 'neutral' | 'accent' | 'warning' | 'error' | 'success'}
> = {
  scheduled: {label: 'Scheduled', dot: 'neutral'},
  in_progress: {label: 'In progress', dot: 'accent'},
  on_hold: {label: 'On hold', dot: 'warning'},
  overdue: {label: 'Overdue', dot: 'error'},
  completed: {label: 'Completed', dot: 'success'},
};

const PRIORITY_TOKEN: Record<Priority, {label: string; color: 'red' | 'orange' | 'gray'}> = {
  urgent: {label: 'Urgent', color: 'red'},
  high: {label: 'High', color: 'orange'},
  normal: {label: 'Normal', color: 'gray'},
};

// Deterministic fixtures: fixed ISO timestamps, no clocks, no randomness.
// Active work first, then recent completed jobs referenced as site history.
const JOBS: ServiceJob[] = [
  {
    id: 'SJ-2148',
    summary: 'No cooling — rooftop unit 3',
    customer: 'Harborview Grand Hotel',
    address: '1200 Harbor Blvd, Bayside',
    technician: 'Luis Camarena',
    status: 'in_progress',
    priority: 'urgent',
    scheduledAt: '2026-07-02T08:00:00Z',
    quoted: '$1,480',
    equipment: 'Trane RTU-3, 25-ton (2019)',
    relatedIds: ['SJ-2101', 'SJ-2044'],
  },
  {
    id: 'SJ-2147',
    summary: 'Quarterly preventive maintenance',
    customer: 'Northgate Dental Group',
    address: '88 Northgate Mall, Suite 210',
    technician: 'Dana Whitfield',
    status: 'scheduled',
    priority: 'normal',
    scheduledAt: '2026-07-02T10:30:00Z',
    quoted: '$420',
    equipment: 'Carrier split system, 5-ton',
    relatedIds: ['SJ-2019'],
  },
  {
    id: 'SJ-2146',
    summary: 'Walk-in freezer overshooting setpoint',
    customer: 'Beacon Street Bistro',
    address: '412 Beacon St',
    technician: 'Marcus Osei',
    status: 'on_hold',
    priority: 'high',
    scheduledAt: '2026-07-01T13:00:00Z',
    quoted: '$2,150',
    equipment: 'Kolpak walk-in, Copeland compressor',
    relatedIds: ['SJ-2088'],
  },
  {
    id: 'SJ-2145',
    summary: 'Thermostat replacement, suite 400',
    customer: 'Pinnacle Property Mgmt',
    address: '500 Commerce Tower, Floor 4',
    technician: 'Dana Whitfield',
    status: 'scheduled',
    priority: 'normal',
    scheduledAt: '2026-07-02T14:00:00Z',
    quoted: '$310',
    equipment: 'Honeywell T6 Pro (2 units)',
    relatedIds: ['SJ-2067'],
  },
  {
    id: 'SJ-2144',
    summary: 'Boiler pilot fails to stay lit',
    customer: 'Elm & 5th Lofts',
    address: '501 Elm St',
    technician: 'Luis Camarena',
    status: 'overdue',
    priority: 'high',
    scheduledAt: '2026-07-01T09:00:00Z',
    quoted: '$760',
    equipment: 'Weil-McLain CGa boiler (2011)',
    relatedIds: [],
  },
  {
    id: 'SJ-2101',
    summary: 'Compressor contactor replacement',
    customer: 'Harborview Grand Hotel',
    address: '1200 Harbor Blvd, Bayside',
    technician: 'Marcus Osei',
    status: 'completed',
    priority: 'high',
    scheduledAt: '2026-06-24T09:00:00Z',
    quoted: '$640',
    equipment: 'Trane RTU-3, 25-ton (2019)',
    relatedIds: ['SJ-2044'],
  },
  {
    id: 'SJ-2088',
    summary: 'Refrigerant leak diagnostic',
    customer: 'Beacon Street Bistro',
    address: '412 Beacon St',
    technician: 'Luis Camarena',
    status: 'completed',
    priority: 'normal',
    scheduledAt: '2026-06-18T11:00:00Z',
    quoted: '$390',
    equipment: 'Kolpak walk-in, Copeland compressor',
    relatedIds: [],
  },
  {
    id: 'SJ-2067',
    summary: 'RTU belt and filter service',
    customer: 'Pinnacle Property Mgmt',
    address: '500 Commerce Tower, Floor 4',
    technician: 'Dana Whitfield',
    status: 'completed',
    priority: 'normal',
    scheduledAt: '2026-06-12T08:30:00Z',
    quoted: '$280',
    equipment: 'York RTU, 15-ton (2016)',
    relatedIds: [],
  },
  {
    id: 'SJ-2044',
    summary: 'Cooling tower fan bearing replacement',
    customer: 'Harborview Grand Hotel',
    address: '1200 Harbor Blvd, Bayside',
    technician: 'Marcus Osei',
    status: 'completed',
    priority: 'high',
    scheduledAt: '2026-05-28T07:30:00Z',
    quoted: '$1,120',
    equipment: 'BAC cooling tower, cell 2',
    relatedIds: [],
  },
  {
    id: 'SJ-2019',
    summary: 'Spring maintenance visit',
    customer: 'Northgate Dental Group',
    address: '88 Northgate Mall, Suite 210',
    technician: 'Dana Whitfield',
    status: 'completed',
    priority: 'normal',
    scheduledAt: '2026-04-15T10:00:00Z',
    quoted: '$420',
    equipment: 'Carrier split system, 5-ton',
    relatedIds: [],
  },
];

// Primary detail action per state — keeps the pane feeling like a real tool.
const NEXT_ACTION: Record<JobStatus, string> = {
  scheduled: 'Dispatch technician',
  in_progress: 'Mark complete',
  on_hold: 'Check parts order',
  overdue: 'Reschedule',
  completed: 'Create follow-up',
};

// ============= MASTER TABLE =============

function JobsTable({
  jobs,
  selectedId,
  isCompact,
  onSelect,
}: {
  jobs: ServiceJob[];
  selectedId: string;
  isCompact: boolean;
  onSelect: (id: string) => void;
}) {
  const handleRowKeyDown = (event: KeyboardEvent, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(id);
    }
  };

  return (
    <Table
      density="compact"
      dividers="rows"
      hasHover
      tableProps={{style: styles.table}}>
      <TableHeader>
        <TableRow isHeaderRow>
          <TableHeaderCell scope="col">Job</TableHeaderCell>
          <TableHeaderCell scope="col" style={styles.colCustomer}>
            Customer
          </TableHeaderCell>
          <TableHeaderCell scope="col" style={styles.colStatus}>
            Status
          </TableHeaderCell>
          {!isCompact && (
            <TableHeaderCell scope="col" style={styles.colTechnician}>
              Technician
            </TableHeaderCell>
          )}
          {!isCompact && (
            <TableHeaderCell scope="col" style={styles.colScheduled}>
              Scheduled
            </TableHeaderCell>
          )}
          <TableHeaderCell
            scope="col"
            style={{...styles.numericHeader, ...styles.colQuoted}}>
            Quoted
          </TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map(job => {
          const isSelected = job.id === selectedId;
          const status = STATUS_META[job.status];
          return (
            <TableRow
              key={job.id}
              tabIndex={0}
              aria-selected={isSelected}
              onClick={() => onSelect(job.id)}
              onKeyDown={event => handleRowKeyDown(event, job.id)}
              style={isSelected ? styles.rowSelected : styles.row}>
              <TableCell scope="row">
                <VStack gap={0.5}>
                  <Text type="body" maxLines={1}>
                    {job.summary}
                  </Text>
                  <Text type="supporting" color="secondary">
                    {job.id}
                  </Text>
                </VStack>
              </TableCell>
              <TableCell>
                <Text type="body" maxLines={1}>
                  {job.customer}
                </Text>
              </TableCell>
              <TableCell>
                <HStack gap={2} vAlign="center">
                  <StatusDot variant={status.dot} label={status.label} />
                  <Text type="body">{status.label}</Text>
                </HStack>
              </TableCell>
              {!isCompact && (
                <TableCell>
                  <Text type="body" maxLines={1}>
                    {job.technician}
                  </Text>
                </TableCell>
              )}
              {!isCompact && (
                <TableCell>
                  <Timestamp value={job.scheduledAt} format="date_time" />
                </TableCell>
              )}
              <TableCell style={styles.numericCell}>
                <Text type="body">{job.quoted}</Text>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

// ============= DETAIL PANE =============

function JobDetail({
  job,
  relatedJobs,
  tapTargetStyle,
  onSelect,
}: {
  job: ServiceJob;
  relatedJobs: ServiceJob[];
  tapTargetStyle?: CSSProperties;
  onSelect: (id: string) => void;
}) {
  const status = STATUS_META[job.status];
  const priority = PRIORITY_TOKEN[job.priority];

  return (
    <VStack gap={4} style={styles.detail}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StatusDot
            variant={status.dot}
            label={status.label}
            isPulsing={job.status === 'overdue'}
          />
          <Text type="supporting" color="secondary">
            {job.id} · {status.label}
          </Text>
          <Token size="sm" color={priority.color} label={priority.label} />
        </HStack>
        <Heading level={2}>{job.summary}</Heading>
      </VStack>

      <HStack gap={2}>
        <Button label={NEXT_ACTION[job.status]} size="sm" style={tapTargetStyle} />
        <Button
          label="Edit job"
          variant="secondary"
          size="sm"
          style={tapTargetStyle}
        />
      </HStack>

      <Divider />

      <MetadataList columns="single" label={{position: 'start', width: 104}}>
        <MetadataListItem label="Customer">
          <Text type="body">{job.customer}</Text>
        </MetadataListItem>
        <MetadataListItem label="Site address">
          <Text type="body">{job.address}</Text>
        </MetadataListItem>
        <MetadataListItem label="Technician">
          <Text type="body">{job.technician}</Text>
        </MetadataListItem>
        <MetadataListItem label="Scheduled">
          <Timestamp value={job.scheduledAt} format="date_time" />
        </MetadataListItem>
        <MetadataListItem label="Equipment">
          <Text type="body">{job.equipment}</Text>
        </MetadataListItem>
        <MetadataListItem label="Quoted">
          <Text type="body">{job.quoted}</Text>
        </MetadataListItem>
      </MetadataList>

      <Divider />

      <VStack gap={2}>
        <Heading level={3}>Site history</Heading>
        {relatedJobs.length === 0 ? (
          <Text type="supporting" color="secondary">
            No previous visits on file for this site.
          </Text>
        ) : (
          <List density="compact" hasDividers>
            {relatedJobs.map(related => (
              <ListItem
                key={related.id}
                label={related.summary}
                description={`${related.id} · ${related.technician}`}
                startContent={
                  <StatusDot
                    variant={STATUS_META[related.status].dot}
                    label={STATUS_META[related.status].label}
                  />
                }
                endContent={
                  <Timestamp
                    value={related.scheduledAt}
                    format="date"
                    color="secondary"
                  />
                }
                onClick={() => onSelect(related.id)}
              />
            ))}
          </List>
        )}
      </VStack>
    </VStack>
  );
}

// ============= PAGE =============

/**
 * Observe the table region's real width. The end panel (400px) and any
 * host chrome shrink the table independently of the viewport, so viewport
 * media queries alone cannot tell when the full column set is out of room.
 */
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

export default function TableIndexDetailPage() {
  // First row selected by default so the detail pane is never empty.
  const [selectedId, setSelectedId] = useState(JOBS[0].id);

  // Responsive contract: <=1024px drops the end panel and stacks the detail
  // below the table; <=768px also hides two table columns.
  const isNarrow = useMediaQuery('(max-width: 1024px)');
  const isCompact = useMediaQuery('(max-width: 768px)');
  // Under ~900px of measured table width the six-column set runs out of
  // room (the fixed columns alone need 730px); drop Technician + Scheduled
  // there too — the data stays reachable through the detail MetadataList.
  const tableRegionRef = useRef<HTMLDivElement | null>(null);
  const tableRegionWidth = useElementWidth(tableRegionRef);
  const hidesSecondaryColumns =
    isCompact || (tableRegionWidth > 0 && tableRegionWidth < 900);
  // <=640px: sm buttons (28px) are too short to tap; grow the primary
  // actions to ~40px touch targets while keeping the sm type scale.
  const isPhone = useMediaQuery('(max-width: 640px)');
  const tapTargetStyle = isPhone ? styles.buttonTapTarget : undefined;

  const selected = useMemo(
    () => JOBS.find(job => job.id === selectedId) ?? JOBS[0],
    [selectedId],
  );

  const relatedJobs = useMemo(
    () =>
      selected.relatedIds
        .map(id => JOBS.find(job => job.id === id))
        .filter((job): job is ServiceJob => job !== undefined),
    [selected],
  );

  const openCount = JOBS.filter(job => job.status !== 'completed').length;

  const detail = (
    <JobDetail
      job={selected}
      relatedJobs={relatedJobs}
      tapTargetStyle={tapTargetStyle}
      onSelect={setSelectedId}
    />
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center">
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Heading level={1}>Service jobs</Heading>
                  <Text type="supporting" color="secondary">
                    {openCount} open
                  </Text>
                </HStack>
              </StackItem>
              <Button
                label="New job"
                icon={<Icon icon={PlusIcon} size="sm" />}
                size="sm"
                style={tapTargetStyle}
              />
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div ref={tableRegionRef} style={styles.contentFill}>
              <div style={styles.scrollRegion}>
                <JobsTable
                  jobs={JOBS}
                  selectedId={selected.id}
                  isCompact={hidesSecondaryColumns}
                  onSelect={setSelectedId}
                />
                {isNarrow && (
                  <>
                    <Divider />
                    {detail}
                  </>
                )}
              </div>
            </div>
          </LayoutContent>
        }
        end={
          isNarrow ? undefined : (
            <LayoutPanel width={400} padding={0} hasDivider label="Job details">
              {detail}
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}
