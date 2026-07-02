// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file form-modal.tsx
 * @input Deterministic fixtures only (agency project rows, client roster,
 *   studio leads); form state lives in useState
 * @output Modal overlay form: a real projects workspace (header with search,
 *   status filter, and "New project" action above a project Table) dimmed
 *   behind a centered Dialog that is open by default and carries the
 *   create-project form — TextInput, Selector pair, Field-wrapped
 *   SegmentedControl, TextArea — with Cancel/Create footer actions.
 *   Creating inserts a real row at the top of the table behind the dialog.
 * @position Page template; emitted by `astryx template form-modal`
 *
 * Responsive contract:
 * - Dialog: width min(560px, 92vw) so the modal keeps comfortable margins on
 *   phones; maxHeight defaults to 75vh and the form body scrolls inside
 *   LayoutContent while DialogHeader and the footer actions stay pinned.
 * - Dialog form: the Client/Lead selector pair sits side by side above 640px
 *   and stacks vertically below it (useMediaQuery).
 * - Page header: title block keeps width via StackItem fill; the search
 *   input is hidden below 720px, leaving the status filter and the
 *   "New project" trigger on one row.
 * - Table: wrapped in a horizontal scroller with a 760px minimum width so
 *   numeric and avatar columns never crush; the row scrolls, columns don't.
 */

import {useId, useMemo, useState, type CSSProperties} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutFooter,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {AvatarGroup, AvatarGroupOverflow} from '@astryxdesign/core/AvatarGroup';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Field} from '@astryxdesign/core/Field';
import {Icon} from '@astryxdesign/core/Icon';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Table, proportional, pixel} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {InboxIcon, SearchIcon, PlusIcon} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // The table keeps a working minimum width; narrow viewports scroll it.
  tableScroller: {overflowX: 'auto'},
  tableInner: {minWidth: 760},
  // Dates read better with aligned digits.
  numericCell: {fontVariantNumeric: 'tabular-nums'},
  emptyWrap: {padding: 'var(--spacing-8) 0'},
};

// ============= DATA =============

type ProjectStatus = 'on-track' | 'at-risk' | 'planning' | 'complete';

interface ProjectRow extends Record<string, unknown> {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  lead: string;
  team: string[];
  target: string;
}

const STATUS_BADGE: Record<
  ProjectStatus,
  {label: string; variant: 'green' | 'orange' | 'blue' | 'neutral'}
> = {
  'on-track': {label: 'On track', variant: 'green'},
  'at-risk': {label: 'At risk', variant: 'orange'},
  planning: {label: 'Planning', variant: 'blue'},
  complete: {label: 'Complete', variant: 'neutral'},
};

const STATUS_FILTER_OPTIONS = [
  {value: 'all', label: 'All statuses'},
  {value: 'on-track', label: 'On track'},
  {value: 'at-risk', label: 'At risk'},
  {value: 'planning', label: 'Planning'},
  {value: 'complete', label: 'Complete'},
];

// Studio roster — options for the "Project lead" selector.
const LEADS = [
  'Maya Chen',
  'Tom Okafor',
  'Lena Fischer',
  'Diego Marin',
  'Aisha Bell',
];

// Active client accounts — options for the "Client" selector.
const CLIENTS = [
  'Alpine Outfitters',
  'Cobalt Financial',
  'Harbor & Vine',
  'Juniper Coffee Co.',
  'Meridian Health',
];

// Seed rows for the projects table behind the dialog. Keys continue the
// PRJ-1xx sequence so created projects slot in deterministically.
const SEED_PROJECTS: ProjectRow[] = [
  {
    id: 'PRJ-101',
    name: 'Spring campaign refresh',
    client: 'Alpine Outfitters',
    status: 'on-track',
    lead: 'Maya Chen',
    team: ['Maya Chen', 'Tom Okafor', 'Aisha Bell', 'Diego Marin'],
    target: 'Jul 24, 2026',
  },
  {
    id: 'PRJ-102',
    name: 'Packaging redesign, core range',
    client: 'Harbor & Vine',
    status: 'at-risk',
    lead: 'Tom Okafor',
    team: ['Tom Okafor', 'Lena Fischer'],
    target: 'Aug 07, 2026',
  },
  {
    id: 'PRJ-103',
    name: 'Investor site replatform',
    client: 'Cobalt Financial',
    status: 'on-track',
    lead: 'Lena Fischer',
    team: ['Lena Fischer', 'Diego Marin', 'Maya Chen', 'Aisha Bell', 'Tom Okafor'],
    target: 'Aug 28, 2026',
  },
  {
    id: 'PRJ-104',
    name: 'Patient portal design system',
    client: 'Meridian Health',
    status: 'planning',
    lead: 'Aisha Bell',
    team: ['Aisha Bell', 'Maya Chen', 'Lena Fischer'],
    target: 'Sep 18, 2026',
  },
  {
    id: 'PRJ-105',
    name: 'Cafe loyalty app pilot',
    client: 'Juniper Coffee Co.',
    status: 'on-track',
    lead: 'Diego Marin',
    team: ['Diego Marin', 'Tom Okafor', 'Aisha Bell'],
    target: 'Sep 25, 2026',
  },
  {
    id: 'PRJ-106',
    name: 'Annual report 2025',
    client: 'Cobalt Financial',
    status: 'complete',
    lead: 'Maya Chen',
    team: ['Maya Chen', 'Lena Fischer'],
    target: 'May 29, 2026',
  },
  {
    id: 'PRJ-107',
    name: 'Trailhead signage system',
    client: 'Alpine Outfitters',
    status: 'planning',
    lead: 'Tom Okafor',
    team: ['Tom Okafor', 'Diego Marin', 'Maya Chen', 'Aisha Bell'],
    target: 'Oct 09, 2026',
  },
  {
    id: 'PRJ-108',
    name: 'Tasting room booking flow',
    client: 'Harbor & Vine',
    status: 'at-risk',
    lead: 'Lena Fischer',
    team: ['Lena Fischer', 'Aisha Bell'],
    target: 'Aug 14, 2026',
  },
];

const PROJECT_COLUMNS: TableColumn<ProjectRow>[] = [
  {
    key: 'name',
    header: 'Project',
    width: proportional(2),
    renderCell: (item: ProjectRow) => (
      <VStack gap={0.5}>
        <Text type="body">{item.name}</Text>
        <Text type="supporting" color="secondary">
          {item.id}
        </Text>
      </VStack>
    ),
  },
  {
    key: 'client',
    header: 'Client',
    width: proportional(1.5),
    renderCell: (item: ProjectRow) => <Text type="body">{item.client}</Text>,
  },
  {
    key: 'status',
    header: 'Status',
    width: pixel(110),
    renderCell: (item: ProjectRow) => (
      <Badge
        label={STATUS_BADGE[item.status].label}
        variant={STATUS_BADGE[item.status].variant}
      />
    ),
  },
  {
    key: 'lead',
    header: 'Lead',
    width: pixel(160),
    renderCell: (item: ProjectRow) => (
      <HStack gap={2} vAlign="center">
        <Avatar name={item.lead} size="xsmall" />
        <Text type="body" maxLines={1}>
          {item.lead}
        </Text>
      </HStack>
    ),
  },
  {
    key: 'team',
    header: 'Team',
    width: pixel(120),
    renderCell: (item: ProjectRow) => (
      <AvatarGroup size="xsmall" aria-label={`${item.team.length} teammates`}>
        {item.team.slice(0, 3).map(member => (
          <Avatar key={member} name={member} />
        ))}
        {item.team.length > 3 ? (
          <AvatarGroupOverflow count={item.team.length - 3} />
        ) : null}
      </AvatarGroup>
    ),
  },
  {
    key: 'target',
    header: 'Target',
    width: pixel(120),
    renderCell: (item: ProjectRow) => (
      <span style={styles.numericCell}>
        <Text type="body">{item.target}</Text>
      </span>
    ),
  },
];

// ============= DIALOG FORM =============

/**
 * Create-project form inside the Dialog. Owns its field state so every
 * dialog open starts from a clean draft (the parent remounts it via `key`).
 */
function CreateProjectDialog({
  isOpen,
  nextKey,
  onOpenChange,
  onCreate,
}: {
  isOpen: boolean;
  nextKey: string;
  onOpenChange: (isOpen: boolean) => void;
  onCreate: (project: ProjectRow) => void;
}) {
  const [name, setName] = useState('');
  const [client, setClient] = useState<string | undefined>(undefined);
  const [lead, setLead] = useState('Maya Chen');
  const [visibility, setVisibility] = useState('team');
  const [brief, setBrief] = useState('');
  const visibilityId = useId();
  const isStacked = useMediaQuery('(max-width: 640px)');

  const canCreate = name.trim().length > 0 && client !== undefined;

  const handleCreate = () => {
    if (!canCreate || client === undefined) {
      return;
    }
    onCreate({
      id: nextKey,
      name: name.trim(),
      client,
      status: 'planning',
      lead,
      team: [lead],
      target: 'Oct 30, 2026',
    });
    onOpenChange(false);
  };

  // Selector pair sits side by side on wide viewports, stacks on narrow.
  const selectorPair = (
    <>
      <StackItem size="fill">
        <Selector
          label="Client"
          isRequired
          options={CLIENTS}
          value={client}
          onChange={setClient}
          placeholder="Choose a client..."
          width="100%"
        />
      </StackItem>
      <StackItem size="fill">
        <Selector
          label="Project lead"
          options={LEADS}
          value={lead}
          onChange={setLead}
          width="100%"
        />
      </StackItem>
    </>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      purpose="form"
      width="min(560px, 92vw)">
      <Layout
        header={
          <DialogHeader
            title="New project"
            subtitle="Set up the brief, client, and owner. Files and approvals come next."
            onOpenChange={onOpenChange}
          />
        }
        content={
          <LayoutContent>
            <VStack gap={4}>
              <TextInput
                label="Project name"
                isRequired
                value={name}
                onChange={setName}
                placeholder="e.g. Fall lookbook microsite"
                hasAutoFocus
              />
              {isStacked ? (
                <VStack gap={4}>{selectorPair}</VStack>
              ) : (
                <HStack gap={3} vAlign="start">
                  {selectorPair}
                </HStack>
              )}
              <Field
                label="Visibility"
                description="Who can find this project in the workspace."
                inputID={visibilityId}>
                <SegmentedControl
                  id={visibilityId}
                  label="Visibility"
                  value={visibility}
                  onChange={setVisibility}
                  layout="fill">
                  <SegmentedControlItem value="private" label="Private" />
                  <SegmentedControlItem value="team" label="Team" />
                  <SegmentedControlItem value="everyone" label="Everyone" />
                </SegmentedControl>
              </Field>
              <TextArea
                label="Brief"
                isOptional
                value={brief}
                onChange={setBrief}
                rows={4}
                maxLength={280}
                placeholder="Goals, deliverables, and anything the team should know on day one."
              />
            </VStack>
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="supporting" color="secondary">
                  Assigned key: {nextKey}
                </Text>
              </StackItem>
              <Button
                label="Cancel"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              />
              <Button
                label="Create project"
                variant="primary"
                isDisabled={!canCreate}
                onClick={handleCreate}
              />
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}

// ============= PAGE =============

export default function FormModalTemplate() {
  // The dialog is open on first render — the project list is the dimmed
  // backdrop. `dialogSession` remounts the form so re-opens start clean.
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [dialogSession, setDialogSession] = useState(0);
  const [projects, setProjects] = useState<ProjectRow[]>(SEED_PROJECTS);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const isNarrow = useMediaQuery('(max-width: 720px)');

  const nextKey = `PRJ-${101 + projects.length}`;

  const visibleProjects = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return projects.filter(project => {
      if (statusFilter !== 'all' && project.status !== statusFilter) {
        return false;
      }
      if (needle === '') {
        return true;
      }
      return (
        project.name.toLowerCase().includes(needle) ||
        project.client.toLowerCase().includes(needle)
      );
    });
  }, [projects, query, statusFilter]);

  const openDialog = () => {
    setDialogSession(session => session + 1);
    setIsDialogOpen(true);
  };

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>Projects</Heading>
                <Text type="supporting" color="secondary">
                  {visibleProjects.length} of {projects.length}
                </Text>
              </HStack>
            </StackItem>
            {!isNarrow && (
              <TextInput
                label="Search projects"
                isLabelHidden
                size="sm"
                width={220}
                startIcon={<Icon icon={SearchIcon} size="sm" />}
                value={query}
                onChange={setQuery}
                placeholder="Search projects or clients"
                hasClear
              />
            )}
            <Selector
              label="Status"
              isLabelHidden
              size="sm"
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <Button
              label="New project"
              variant="primary"
              icon={<Icon icon={PlusIcon} size="sm" />}
              onClick={openDialog}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={6}>
          {visibleProjects.length === 0 ? (
            <div style={styles.emptyWrap}>
              <EmptyState
                icon={<Icon icon={InboxIcon} size="lg" />}
                title="No matching projects"
                description="Try a different search or clear the status filter."
              />
            </div>
          ) : (
            <div style={styles.tableScroller}>
              <div style={styles.tableInner}>
                <Table<ProjectRow>
                  data={visibleProjects}
                  columns={PROJECT_COLUMNS}
                  idKey="id"
                  density="balanced"
                  dividers="rows"
                  hasHover
                />
              </div>
            </div>
          )}
          <CreateProjectDialog
            key={dialogSession}
            isOpen={isDialogOpen}
            nextKey={nextKey}
            onOpenChange={setIsDialogOpen}
            onCreate={project => setProjects(prev => [project, ...prev])}
          />
        </LayoutContent>
      }
    />
  );
}
