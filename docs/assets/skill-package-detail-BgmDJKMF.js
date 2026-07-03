var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one installable agent skill with three
 *   package files, two trigger definitions, and a three-entry version
 *   changelog whose newest edit carries per-file diff hunks with fixed line
 *   numbers and +N/−N counters)
 * @output Registry-style detail page for a single agent skill: an identity
 *   header (back IconButton, skill name with "default" blue Badge, "private"
 *   amber lock Badge, and mono "v3" version Badge, description, owner /
 *   installs / node meta line, right-aligned Enabled Switch), a collapsible
 *   "2 triggers" summary row backed by a MetadataList, and a Content|History
 *   TabList. Content is a mini read-only code browser — a mono file tab
 *   strip with extension-tinted file icons (.md blue, .sh green + "exec"
 *   Badge, .json yellow) over a line-numbered CodeBlock — plus a visibility
 *   footer Card with a "Make public" Button that live-swaps the header
 *   badge. History is a version changelog of expandable edit Cards headed
 *   by "v2 → v3" mono Badges that open into per-file diff rows with
 *   Added/Removed/Modified Badges, green +N / red −N counters, dual
 *   line-number gutters, and "···" hunk separators
 * @position Page template; emitted by \`astryx template skill-package-detail\`
 *
 * Frame: Layout height="fill". No LayoutHeader — the identity block is
 * content, not chrome, so the whole surface is one centered scrolling
 * column (maxWidth 760) inside LayoutContent: header block, Divider,
 * triggers Collapsible, TabList, then the active tab body. Unlike
 * settings-extension-catalog this is one package's detail, not a catalog
 * grid; unlike diff-viewer the diffs live *inside* the version history.
 *
 * Responsive contract:
 * - Column: maxWidth 760, centered; the page scrolls as one column.
 * - >720px: the Enabled Switch sits right-aligned on the identity row and
 *   the meta line renders inline.
 * - <=720px: the Switch drops to its own row under the meta line; header
 *   badges and meta segments wrap instead of truncating.
 * - File tab strip scrolls horizontally at every width (overflowX auto);
 *   the code area is capped at 420px and scrolls vertically inside the
 *   bordered panel.
 *
 * Container policy (package-detail archetype): the code browser is one
 * bordered panel (tab strip + CodeBlock in a single frame); visibility is
 * a footer Card; each changelog edit is a Card wrapping a Collapsible;
 * per-file diffs render as rows, not nested cards.
 */

import {useState, type CSSProperties} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge, type BadgeVariant} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Code} from '@astryxdesign/core/Code';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon, type IconColor} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import {Switch} from '@astryxdesign/core/Switch';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

import {FileTextIcon} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Single centered scrolling column; the page has no fixed chrome.
  column: {
    maxWidth: 760,
    marginInline: 'auto',
    paddingBlock: 'var(--spacing-4)',
  },
  badgeWrap: {flexWrap: 'wrap'},
  metaWrap: {flexWrap: 'wrap', rowGap: 'var(--spacing-1)'},
  monoBadge: {fontFamily: 'var(--font-family-code)'},
  // Code browser: tab strip + code area share one bordered frame.
  browserPanel: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
  },
  fileTabStrip: {
    display: 'flex',
    overflowX: 'auto',
    backgroundColor: 'var(--color-background-muted)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  fileTab: {
    appearance: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    flexShrink: 0,
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: 'var(--spacing-2) var(--spacing-3)',
    cursor: 'pointer',
    fontFamily: 'var(--font-family-code)',
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  fileTabActive: {
    borderBottomColor: 'var(--color-text-accent)',
    backgroundColor: 'var(--color-background-card)',
    color: 'var(--color-text-primary)',
  },
  codeArea: {
    maxHeight: 420,
    overflowY: 'auto',
  },
  // Diff rows: dual line-number gutters + marker + mono text.
  diffLines: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-inner)',
    overflow: 'hidden',
    marginTop: 'var(--spacing-2)',
  },
  diffRow: {
    display: 'flex',
    alignItems: 'baseline',
    fontFamily: 'var(--font-family-code)',
    fontSize: 12,
    lineHeight: '20px',
  },
  diffRowAdded: {backgroundColor: 'var(--color-background-green)'},
  diffRowRemoved: {backgroundColor: 'var(--color-background-red)'},
  diffRowHunk: {backgroundColor: 'var(--color-background-muted)'},
  diffGutter: {
    width: 40,
    flexShrink: 0,
    textAlign: 'right',
    paddingInlineEnd: 'var(--spacing-2)',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    userSelect: 'none',
  },
  diffMarker: {
    width: 16,
    flexShrink: 0,
    textAlign: 'center',
    userSelect: 'none',
  },
  diffMarkerAdded: {color: 'var(--color-text-green)'},
  diffMarkerRemoved: {color: 'var(--color-text-red)'},
  diffText: {
    whiteSpace: 'pre',
    overflowX: 'auto',
    paddingInlineEnd: 'var(--spacing-2)',
  },
  diffHunkText: {color: 'var(--color-text-secondary)'},
  counterAdded: {color: 'var(--color-text-green)'},
  counterRemoved: {color: 'var(--color-text-red)'},
  diffFileCell: {minWidth: 0},
  legacyNote: {fontStyle: 'italic'},
};

// ============= DATA =============
// Deterministic fixtures: fixed dates and line numbers, no clocks, no
// randomness, no real credentials.

const SKILL_NAME = 'PR Review';
const SKILL_SLUG = 'pr-review';
const SKILL_VERSION = 'v3';
const SKILL_OWNER = 'Jane Doe';
const SKILL_DESCRIPTION =
  'Reviews an open pull request against the team checklist: fetches the ' +
  'diff, walks correctness and test coverage, and posts inline comments.';

type FileExt = 'md' | 'sh' | 'json';

interface SkillFile {
  id: string;
  path: string;
  ext: FileExt;
  isExecutable: boolean;
  language: string;
  code: string;
}

// Extension tint vocabulary: .md=blue, .sh=green, .json=yellow.
const EXT_COLOR: Record<FileExt, IconColor> = {
  md: 'blue',
  sh: 'green',
  json: 'yellow',
};

const SKILL_FILES: SkillFile[] = [
  {
    id: 'skill-md',
    path: 'SKILL.md',
    ext: 'md',
    isExecutable: false,
    language: 'markdown',
    code: \`# PR Review

When the user asks for a review of an open pull request,
run scripts/fetch-diff.sh first, then work through the
checklist below on the fetched diff.

## Checklist

- Correctness: does the change do what the PR title says?
- Tests: new behavior needs new coverage.
- Naming: no abbreviations in exported APIs.\`,
  },
  {
    id: 'fetch-diff-sh',
    path: 'scripts/fetch-diff.sh',
    ext: 'sh',
    isExecutable: true,
    language: 'bash',
    code: \`#!/bin/bash
# Fetch the diff for the PR under review.
set -euo pipefail
pr="$1"
gh pr diff "$pr" || retry 3 gh pr diff "$pr"
echo "fetched diff for pr #$pr" >&2\`,
  },
  {
    id: 'config-json',
    path: 'config.json',
    ext: 'json',
    isExecutable: false,
    language: 'json',
    code: \`{
  "maxFiles": 40
}\`,
  },
];

interface SkillTrigger {
  id: string;
  kind: string;
  kindColor: 'purple' | 'cyan';
  detail: string; // mono expression
  summary: string;
}

const SKILL_TRIGGERS: SkillTrigger[] = [
  {
    id: 'trg-schedule',
    kind: 'schedule',
    kindColor: 'purple',
    detail: '0 9 * * 1',
    summary: 'Every Monday 9:00 AM',
  },
  {
    id: 'trg-command',
    kind: 'command',
    kindColor: 'cyan',
    detail: '/pr-review',
    summary: 'On demand in any chat',
  },
];

type DiffLineKind = 'context' | 'added' | 'removed' | 'hunk';
type FileStatus = 'Added' | 'Removed' | 'Modified';

interface DiffLine {
  kind: DiffLineKind;
  oldNo?: number;
  newNo?: number;
  text: string;
}

interface FileDiff {
  id: string;
  path: string;
  ext: FileExt;
  status: FileStatus;
  added: number;
  removed: number;
  lines?: DiffLine[]; // omitted when the diff body is not expandable
}

interface EditRecord {
  id: string;
  fromVersion: string;
  toVersion: string;
  editor: string;
  date: string; // pre-formatted, deterministic
  summary: string;
  files?: FileDiff[];
  legacyNote?: string; // shown italic when file-level diffs are unavailable
}

const STATUS_BADGE: Record<FileStatus, BadgeVariant> = {
  Added: 'green',
  Removed: 'red',
  Modified: 'yellow',
};

const EDITS: EditRecord[] = [
  {
    id: 'edit-v3',
    fromVersion: 'v2',
    toVersion: 'v3',
    editor: 'Jane Doe',
    date: '6/28/2026',
    summary: 'Added retry logic to fetch script',
    files: [
      {
        id: 'diff-fetch',
        path: 'scripts/fetch-diff.sh',
        ext: 'sh',
        status: 'Modified',
        added: 3,
        removed: 1,
        lines: [
          {kind: 'hunk', text: '···'},
          {kind: 'added', newNo: 3, text: 'set -euo pipefail'},
          {kind: 'context', oldNo: 3, newNo: 4, text: 'pr="$1"'},
          {kind: 'removed', oldNo: 4, text: 'gh pr diff "$pr"'},
          {
            kind: 'added',
            newNo: 5,
            text: 'gh pr diff "$pr" || retry 3 gh pr diff "$pr"',
          },
          {
            kind: 'added',
            newNo: 6,
            text: 'echo "fetched diff for pr #$pr" >&2',
          },
        ],
      },
      {
        id: 'diff-retry',
        path: 'RETRY.md',
        ext: 'md',
        status: 'Added',
        added: 12,
        removed: 0,
        lines: [
          {kind: 'added', newNo: 1, text: '# Retry policy'},
          {kind: 'added', newNo: 2, text: ''},
          {
            kind: 'added',
            newNo: 3,
            text: 'Retries use exponential backoff with a 3-try cap.',
          },
          {kind: 'added', newNo: 4, text: ''},
          {
            kind: 'added',
            newNo: 5,
            text: 'Give up and report the raw \`gh\` error after the',
          },
          {kind: 'added', newNo: 6, text: 'final attempt fails.'},
          {kind: 'hunk', text: '···'},
        ],
      },
    ],
  },
  {
    id: 'edit-v2',
    fromVersion: 'v1',
    toVersion: 'v2',
    editor: 'Jane Doe',
    date: '6/25/2026',
    summary: 'Rewrote description',
    legacyNote: 'File-level diffs not available for this edit',
  },
  {
    id: 'edit-v1',
    fromVersion: 'v0',
    toVersion: 'v1',
    editor: 'Jane Doe',
    date: '6/24/2026',
    summary: 'Created skill',
    files: [
      {
        id: 'init-skill',
        path: 'SKILL.md',
        ext: 'md',
        status: 'Added',
        added: 11,
        removed: 0,
      },
      {
        id: 'init-fetch',
        path: 'scripts/fetch-diff.sh',
        ext: 'sh',
        status: 'Added',
        added: 4,
        removed: 0,
      },
      {
        id: 'init-config',
        path: 'config.json',
        ext: 'json',
        status: 'Added',
        added: 3,
        removed: 0,
      },
    ],
  },
];

// ============= SHARED BITS =============

/** Green +N / red −N counters with tabular numerals. */
function DiffCounters({added, removed}: {added: number; removed: number}) {
  return (
    <HStack gap={1} vAlign="center">
      <Text
        type="supporting"
        size="sm"
        hasTabularNumbers
        style={styles.counterAdded}>
        +{added}
      </Text>
      <Text
        type="supporting"
        size="sm"
        hasTabularNumbers
        style={styles.counterRemoved}>
        −{removed}
      </Text>
    </HStack>
  );
}

/** Extension-tinted file icon (.md blue, .sh green, .json yellow). */
function FileIcon({ext}: {ext: FileExt}) {
  return <Icon icon={FileTextIcon} size="sm" color={EXT_COLOR[ext]} />;
}

// ============= CONTENT TAB =============

function FileTabStrip({
  files,
  activeFileId,
  onSelect,
}: {
  files: SkillFile[];
  activeFileId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={styles.fileTabStrip} role="tablist" aria-label="Skill files">
      {files.map(file => {
        const isActive = file.id === activeFileId;
        return (
          <button
            key={file.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            style={
              isActive
                ? {...styles.fileTab, ...styles.fileTabActive}
                : styles.fileTab
            }
            onClick={() => onSelect(file.id)}>
            <FileIcon ext={file.ext} />
            {file.path}
            {file.isExecutable && (
              <Tooltip content="Marked executable — runs in the sandbox">
                <Badge variant="green" label="exec" />
              </Tooltip>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ContentTab({
  isPublic,
  onToggleVisibility,
}: {
  isPublic: boolean;
  onToggleVisibility: () => void;
}) {
  const [activeFileId, setActiveFileId] = useState(SKILL_FILES[0].id);
  const activeFile =
    SKILL_FILES.find(file => file.id === activeFileId) ?? SKILL_FILES[0];

  return (
    <VStack gap={3}>
      <div style={styles.browserPanel}>
        <FileTabStrip
          files={SKILL_FILES}
          activeFileId={activeFileId}
          onSelect={setActiveFileId}
        />
        <div style={styles.codeArea}>
          <CodeBlock
            code={activeFile.code}
            language={activeFile.language}
            hasLineNumbers
            hasLanguageLabel={false}
            size="sm"
            width="100%"
            container="section"
          />
        </div>
      </div>

      {/* Visibility footer: owner-only control, flips the header badge. */}
      <Card padding={3}>
        <HStack gap={3} vAlign="center">
          <Icon
            icon={isPublic ? 'externalLink' : 'eyeSlash'}
            size="md"
            color="secondary"
          />
          <StackItem size="fill">
            <VStack gap={0}>
              <Text type="label">
                {isPublic ? 'Public skill' : 'Private skill'}
              </Text>
              <Text type="supporting" color="secondary">
                {isPublic
                  ? 'Anyone in the workspace can find and install this skill.'
                  : 'Only visible to you.'}
              </Text>
            </VStack>
          </StackItem>
          <Button
            label={isPublic ? 'Make private' : 'Make public'}
            variant="secondary"
            size="sm"
            onClick={onToggleVisibility}
          />
        </HStack>
      </Card>
    </VStack>
  );
}

// ============= HISTORY TAB =============

function DiffLineRow({line}: {line: DiffLine}) {
  if (line.kind === 'hunk') {
    return (
      <div style={{...styles.diffRow, ...styles.diffRowHunk}}>
        <span style={styles.diffGutter} aria-hidden />
        <span style={styles.diffGutter} aria-hidden />
        <span style={styles.diffMarker} aria-hidden />
        <span style={{...styles.diffText, ...styles.diffHunkText}}>···</span>
      </div>
    );
  }

  const rowStyle =
    line.kind === 'added'
      ? {...styles.diffRow, ...styles.diffRowAdded}
      : line.kind === 'removed'
        ? {...styles.diffRow, ...styles.diffRowRemoved}
        : styles.diffRow;
  const marker = line.kind === 'added' ? '+' : line.kind === 'removed' ? '−' : ' ';
  const markerStyle =
    line.kind === 'added'
      ? {...styles.diffMarker, ...styles.diffMarkerAdded}
      : line.kind === 'removed'
        ? {...styles.diffMarker, ...styles.diffMarkerRemoved}
        : styles.diffMarker;

  return (
    <div style={rowStyle}>
      <span style={styles.diffGutter}>{line.oldNo ?? ''}</span>
      <span style={styles.diffGutter}>{line.newNo ?? ''}</span>
      <span style={markerStyle}>{marker}</span>
      <span style={styles.diffText}>{line.text}</span>
    </div>
  );
}

/**
 * One file inside an edit: status Badge + counters in the row header;
 * files with recorded hunks expand into dual-gutter diff lines.
 */
function FileDiffRow({
  diff,
  defaultIsOpen = false,
}: {
  diff: FileDiff;
  defaultIsOpen?: boolean;
}) {
  const header = (
    <HStack gap={2} vAlign="center">
      <FileIcon ext={diff.ext} />
      <StackItem size="fill" style={styles.diffFileCell}>
        <Text type="code" size="sm" maxLines={1}>
          {diff.path}
        </Text>
      </StackItem>
      <Badge variant={STATUS_BADGE[diff.status]} label={diff.status} />
      <DiffCounters added={diff.added} removed={diff.removed} />
    </HStack>
  );

  if (diff.lines == null) {
    return header;
  }

  return (
    <Collapsible trigger={header} defaultIsOpen={defaultIsOpen}>
      <div style={styles.diffLines}>
        {diff.lines.map((line, index) => (
          <DiffLineRow key={\`\${diff.id}-\${index}\`} line={line} />
        ))}
      </div>
    </Collapsible>
  );
}

/** Expandable changelog Card: "v2 → v3" mono Badge, editor, date, files. */
function EditCard({
  edit,
  defaultIsOpen = false,
}: {
  edit: EditRecord;
  defaultIsOpen?: boolean;
}) {
  const totalAdded = (edit.files ?? []).reduce(
    (sum, file) => sum + file.added,
    0,
  );
  const totalRemoved = (edit.files ?? []).reduce(
    (sum, file) => sum + file.removed,
    0,
  );

  return (
    <Card padding={3}>
      <Collapsible
        defaultIsOpen={defaultIsOpen}
        trigger={
          <HStack gap={2} vAlign="center">
            <Badge
              variant="neutral"
              label={\`\${edit.fromVersion} → \${edit.toVersion}\`}
              style={styles.monoBadge}
            />
            <StackItem size="fill" style={styles.diffFileCell}>
              <VStack gap={0}>
                <Text type="label" maxLines={1}>
                  {edit.summary}
                </Text>
                <Text type="supporting" color="secondary">
                  {edit.editor} · {edit.date}
                </Text>
              </VStack>
            </StackItem>
            {edit.files != null && (
              <>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {edit.files.length}{' '}
                  {edit.files.length === 1 ? 'file' : 'files'}
                </Text>
                <DiffCounters added={totalAdded} removed={totalRemoved} />
              </>
            )}
          </HStack>
        }>
        {edit.legacyNote != null ? (
          <Text type="supporting" color="secondary" style={styles.legacyNote}>
            {edit.legacyNote}
          </Text>
        ) : (edit.files ?? []).every(file => file.lines == null) ? (
          // No recorded hunks (initial import): plain Added-file list.
          <List density="compact" hasDividers>
            {(edit.files ?? []).map(file => (
              <ListItem
                key={file.id}
                label={
                  <Text type="code" size="sm" maxLines={1}>
                    {file.path}
                  </Text>
                }
                startContent={<FileIcon ext={file.ext} />}
                endContent={
                  <HStack gap={2} vAlign="center">
                    <Badge
                      variant={STATUS_BADGE[file.status]}
                      label={file.status}
                    />
                    <DiffCounters added={file.added} removed={file.removed} />
                  </HStack>
                }
              />
            ))}
          </List>
        ) : (
          <VStack gap={2}>
            {(edit.files ?? []).map((file, index) => (
              <VStack key={file.id} gap={2}>
                <FileDiffRow diff={file} defaultIsOpen={index === 0} />
                {index < (edit.files ?? []).length - 1 && <Divider />}
              </VStack>
            ))}
          </VStack>
        )}
      </Collapsible>
    </Card>
  );
}

function HistoryTab() {
  return (
    <VStack gap={3}>
      {EDITS.map((edit, index) => (
        <EditCard key={edit.id} edit={edit} defaultIsOpen={index === 0} />
      ))}
    </VStack>
  );
}

// ============= PAGE =============

export default function SkillPackageDetailTemplate() {
  const [activeTab, setActiveTab] = useState('content');
  const [isEnabled, setIsEnabled] = useState(true);
  const [isPublic, setIsPublic] = useState(false);

  // Responsive contract: the Enabled control drops below the identity
  // block at narrow widths instead of squeezing the badge cluster.
  const isCompact = useMediaQuery('(max-width: 720px)');

  const enabledControl = (
    <Switch
      label="Enabled"
      description={isCompact ? undefined : 'Loads in new sessions'}
      value={isEnabled}
      onChange={setIsEnabled}
    />
  );

  const identityHeader = (
    <HStack gap={3} vAlign="start">
      <IconButton
        label="Back to skills"
        tooltip="Back to skills"
        icon={<Icon icon="chevronLeft" size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        onClick={() => {}}
      />
      <StackItem size="fill">
        <VStack gap={2}>
          <HStack gap={2} vAlign="center" style={styles.badgeWrap}>
            <Heading level={1}>{SKILL_NAME}</Heading>
            <Tooltip content="Loads by default in every new session">
              <Badge variant="blue" label="default" />
            </Tooltip>
            {isPublic ? (
              <Tooltip content="Anyone in the workspace can install">
                <Badge
                  variant="green"
                  label="public"
                  icon={
                    <Icon icon="externalLink" size="xsm" color="inherit" />
                  }
                />
              </Tooltip>
            ) : (
              <Tooltip content="Only visible to you">
                <Badge
                  variant="warning"
                  label="private"
                  icon={<Icon icon="eyeSlash" size="xsm" color="inherit" />}
                />
              </Tooltip>
            )}
            <Badge
              variant="neutral"
              label={SKILL_VERSION}
              style={styles.monoBadge}
            />
          </HStack>
          <Text color="secondary">{SKILL_DESCRIPTION}</Text>
          <HStack gap={2} vAlign="center" style={styles.metaWrap}>
            <Avatar name={SKILL_OWNER} size="tiny" />
            <Text type="supporting" color="secondary">
              {SKILL_OWNER}
            </Text>
            <Text type="supporting" color="secondary">
              ·
            </Text>
            <Tooltip content="Installs across all workspaces">
              <Text type="supporting" color="secondary" hasTabularNumbers>
                42 installs
              </Text>
            </Tooltip>
            <Text type="supporting" color="secondary">
              ·
            </Text>
            <Text type="supporting" color="secondary">
              node: <Code>cli</Code>
            </Text>
            <Text type="supporting" color="secondary">
              ·
            </Text>
            <Code>{SKILL_SLUG}</Code>
          </HStack>
        </VStack>
      </StackItem>
      {!isCompact && enabledControl}
    </HStack>
  );

  const triggersRow = (
    <Collapsible
      defaultIsOpen={false}
      trigger={
        <HStack gap={2} vAlign="center">
          <Icon icon="clock" size="sm" color="secondary" />
          <Text type="label">{SKILL_TRIGGERS.length} triggers</Text>
          {SKILL_TRIGGERS.map(trigger => (
            <Token
              key={trigger.id}
              label={trigger.kind}
              size="sm"
              color={trigger.kindColor}
            />
          ))}
        </HStack>
      }>
      <MetadataList label={{position: 'start', width: 96}}>
        {SKILL_TRIGGERS.map(trigger => (
          <MetadataListItem key={trigger.id} label={trigger.kind}>
            <HStack gap={2} vAlign="center">
              <Code>{trigger.detail}</Code>
              <Text type="supporting" color="secondary">
                {trigger.summary}
              </Text>
            </HStack>
          </MetadataListItem>
        ))}
      </MetadataList>
    </Collapsible>
  );

  return (
    <Layout
      height="fill"
      content={
        <LayoutContent>
          <div style={styles.column}>
            <VStack gap={4}>
              {identityHeader}
              {isCompact && enabledControl}
              <Divider />
              {triggersRow}
              <TabList value={activeTab} onChange={setActiveTab} hasDivider>
                <Tab
                  value="content"
                  label="Content"
                  endContent={
                    <Badge
                      variant="neutral"
                      label={String(SKILL_FILES.length)}
                    />
                  }
                />
                <Tab
                  value="history"
                  label="History"
                  endContent={
                    <Badge variant="neutral" label={String(EDITS.length)} />
                  }
                />
              </TabList>
              {activeTab === 'content' ? (
                <ContentTab
                  isPublic={isPublic}
                  onToggleVisibility={() => setIsPublic(prev => !prev)}
                />
              ) : (
                <HistoryTab />
              )}
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};