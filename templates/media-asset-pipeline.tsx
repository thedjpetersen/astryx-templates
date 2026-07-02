// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (9 media assets with fixed sizes,
 *   durations, and pipeline states — uploading 42%, queued, transcoding 68%,
 *   ready, failed — plus per-asset rendition ladders, fake ast_/sum_ short
 *   ids, and a fixed 1.4 TB of 2 TB storage figure; no clocks, randomness,
 *   or network media)
 * @output Media asset & transcode operations manager: a LayoutHeader with
 *   'Library / Raw uploads' Breadcrumbs, a filename search TextInput, an
 *   All/Processing/Ready/Failed SegmentedControl, and a primary Upload
 *   Button; a 240px left rail with a folder TreeList (All assets, Raw
 *   uploads, Renditions, Archive) above a storage Card ('1.4 TB of 2 TB'
 *   ProgressBar); a center asset Table with Thumbnail placeholder art,
 *   filename, type Badge (video/audio/image), duration, size, and a
 *   pipeline-state column mixing an in-flight upload ProgressBar, a Queued
 *   Badge, a Spinner 'Transcoding 68%', a green Ready check, and a red
 *   Failed state whose Tooltip carries the transcode error; selecting a row
 *   opens a 360px right detail LayoutPanel with a 16:9 preview placeholder
 *   (gradient stage, deterministic waveform bars for audio), a renditions
 *   mini-Table (1080p / 720p / 480p / HLS ladder with codec, bitrate, size,
 *   per-rendition status), a MetadataList (codec, frame rate, uploaded-by,
 *   fake asset id + checksum), and Retry / Download / Delete actions
 * @position Page template; emitted by `astryx template media-asset-pipeline`
 *
 * Frame: Layout height="fill". LayoutHeader carries breadcrumbs, search,
 * status filter, and the Upload CTA. LayoutPanel start 240 hosts the folder
 * tree and the storage card. LayoutContent (padding 0) stacks a conditional
 * bulk-select Toolbar above the scrolling asset Table. LayoutPanel end 360
 * appears when a row is selected. The Media batch's ops surface — choose
 * over table-bulk-actions when rows carry live pipeline states and
 * renditions, and over file-browser-preview when the story is transcoding,
 * not browsing.
 *
 * Responsive contract:
 * - >1280px: rail 240 (fixed) | table (fill) | detail panel 360 as a
 *   LayoutPanel end that reserves width.
 * - 769–1280px: the detail panel overlays the table from the right
 *   (absolute, 360 wide, card background + shadow) instead of reserving
 *   width; the rail keeps its 240px.
 * - <=768px: the rail and the header search input are dropped (breadcrumbs
 *   still route back to All assets); the overlay panel caps at 100% width;
 *   the Table scrolls horizontally inside its own wrapper — proportional
 *   columns keep a 120px minimum, pixel columns keep width.
 *
 * Container policy (ops-table archetype): frame-first rows and panels; the
 * only Card is the storage widget in the rail. Fixture ids (ast_9f27c1,
 * sum_04d2aa) are obviously fake and never credential-shaped.
 */

import {useState, type CSSProperties} from 'react';

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
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Badge} from '@astryxdesign/core/Badge';
import {Breadcrumbs, BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn, TablePlugin} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Thumbnail} from '@astryxdesign/core/Thumbnail';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {TreeList} from '@astryxdesign/core/TreeList';
import type {TreeListItemData} from '@astryxdesign/core/TreeList';
import {useMediaQuery} from '@astryxdesign/core/hooks';

import {
  ArchiveIcon,
  DownloadIcon,
  FolderIcon,
  HardDriveIcon,
  ImageIcon,
  LayersIcon,
  LibraryIcon,
  PlayIcon,
  RotateCcwIcon,
  SearchIcon,
  Trash2Icon,
  UploadIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  fill: {height: '100%', minHeight: 0},
  // Rail: tree scrolls, storage card pins to the bottom.
  rail: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  railTree: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3) var(--spacing-2)',
  },
  railStorage: {padding: 'var(--spacing-3)'},
  // Content column hosts the sticky bulk bar, the table scroller, and the
  // <=1280px overlay panel (hence position: relative).
  contentWrap: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  bulkBar: {position: 'sticky', top: 0, zIndex: 2},
  tableScroll: {flex: 1, minHeight: 0, overflowY: 'auto'},
  // <=1280px: the detail panel overlays the table from the right.
  overlayPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 360,
    maxWidth: '100%',
    zIndex: 3,
    backgroundColor: 'var(--color-background-card)',
    borderLeft: 'var(--border-width) solid var(--color-border)',
    boxShadow: 'var(--shadow-high)',
  },
  headerSearch: {width: 220},
  thumbBox: {width: 40, height: 40, flexShrink: 0},
  pipelineCell: {maxWidth: 220},
  // Detail pane: header row fixed, body scrolls.
  detailPane: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  detailHeader: {padding: 'var(--spacing-3) var(--spacing-4)'},
  detailBody: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  // Preview stage: literal dark gradient locked to light-on-dark text so
  // the placeholder reads identically in both themes.
  previewVideo: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-2)',
    background: 'linear-gradient(135deg, #1F2A44 0%, #0E1526 100%)',
    color: '#C7D2E4',
    borderRadius: 'var(--radius-container)',
  },
  previewMuted: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-2)',
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-4)',
  },
  previewCaption: {fontSize: 12, opacity: 0.75},
  waveformRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 2,
    height: 48,
    width: '80%',
  },
  waveformBar: {
    flex: 1,
    borderRadius: 1,
    backgroundColor: 'var(--color-accent)',
    opacity: 0.8,
  },
  mono: {fontFamily: 'var(--font-family-code, monospace)'},
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
// Deterministic fixtures only. Short ids are deliberately fake
// (ast_/sum_ prefixes, 6 hex chars) — never credential-shaped.

type AssetType = 'video' | 'audio' | 'image';
type PipelineState = 'uploading' | 'queued' | 'transcoding' | 'ready' | 'failed';
type FolderId = 'all' | 'raw' | 'renditions' | 'archive';
type StatusFilter = 'all' | 'processing' | 'ready' | 'failed';

interface AssetRow extends Record<string, unknown> {
  id: string;
  filename: string;
  type: AssetType;
  folder: Exclude<FolderId, 'all' | 'archive'>;
  duration: string;
  size: string;
  state: PipelineState;
  /** Percent complete for uploading/transcoding rows. */
  progress?: number;
  /** Human-readable failure reason for failed rows. */
  error?: string;
  codec: string;
  rate: string;
  uploadedBy: string;
  assetId: string;
  checksum: string;
}

interface Rendition extends Record<string, unknown> {
  id: string;
  name: string;
  codec: string;
  bitrate: string;
  size: string;
  status: 'done' | 'active' | 'pending' | 'failed';
}

const ASSETS: AssetRow[] = [
  {
    id: 'asset-keynote',
    filename: 'keynote_final_v3.mov',
    type: 'video',
    folder: 'raw',
    duration: '24:18',
    size: '4.2 GB',
    state: 'transcoding',
    progress: 68,
    codec: 'ProRes 422 HQ',
    rate: '29.97 fps',
    uploadedBy: 'Maya Torres',
    assetId: 'ast_9f27c1',
    checksum: 'sum_04d2aa',
  },
  {
    id: 'asset-podcast',
    filename: 'podcast-ep87-master.wav',
    type: 'audio',
    folder: 'raw',
    duration: '52:14',
    size: '812 MB',
    state: 'ready',
    codec: 'PCM 24-bit',
    rate: '48 kHz',
    uploadedBy: 'Jordan Lee',
    assetId: 'ast_b3e802',
    checksum: 'sum_9c11f4',
  },
  {
    id: 'asset-drone',
    filename: 'drone-b-roll-006.mp4',
    type: 'video',
    folder: 'raw',
    duration: '03:42',
    size: '1.1 GB',
    state: 'failed',
    error: 'Audio stream missing — remux and retry',
    codec: 'H.264',
    rate: '59.94 fps',
    uploadedBy: 'Priya Nair',
    assetId: 'ast_51d9ce',
    checksum: 'sum_e07b21',
  },
  {
    id: 'asset-teaser',
    filename: 'launch-teaser-cut2.mp4',
    type: 'video',
    folder: 'raw',
    duration: '—',
    size: '640 MB',
    state: 'uploading',
    progress: 42,
    codec: 'H.264',
    rate: '23.976 fps',
    uploadedBy: 'Maya Torres',
    assetId: 'ast_77aa10',
    checksum: 'sum_3fd58b',
  },
  {
    id: 'asset-studio',
    filename: 'studio-tour-4k.mov',
    type: 'video',
    folder: 'raw',
    duration: '—',
    size: '6.3 GB',
    state: 'queued',
    codec: 'ProRes 422',
    rate: '25 fps',
    uploadedBy: 'Sam Okafor',
    assetId: 'ast_c2481f',
    checksum: 'sum_66aa9d',
  },
  {
    id: 'asset-thumbs',
    filename: 'thumb-set-jul.zip',
    type: 'image',
    folder: 'renditions',
    duration: '—',
    size: '184 MB',
    state: 'ready',
    codec: 'JPEG bundle',
    rate: '—',
    uploadedBy: 'Jordan Lee',
    assetId: 'ast_08d374',
    checksum: 'sum_b52c70',
  },
  {
    id: 'asset-interview',
    filename: 'interview-cam-a.mxf',
    type: 'video',
    folder: 'raw',
    duration: '—',
    size: '9.8 GB',
    state: 'queued',
    codec: 'XDCAM HD422',
    rate: '29.97 fps',
    uploadedBy: 'Priya Nair',
    assetId: 'ast_e6b921',
    checksum: 'sum_1d40cf',
  },
  {
    id: 'asset-promo',
    filename: 'promo-loop-15s.mp4',
    type: 'video',
    folder: 'renditions',
    duration: '00:15',
    size: '96 MB',
    state: 'ready',
    codec: 'H.264',
    rate: '30 fps',
    uploadedBy: 'Sam Okafor',
    assetId: 'ast_3f52d8',
    checksum: 'sum_88e013',
  },
  {
    id: 'asset-ambience',
    filename: 'ambience-room-tone.flac',
    type: 'audio',
    folder: 'renditions',
    duration: '10:00',
    size: '412 MB',
    state: 'ready',
    codec: 'FLAC',
    rate: '48 kHz',
    uploadedBy: 'Jordan Lee',
    assetId: 'ast_94ac55',
    checksum: 'sum_72f9e6',
  },
];

// Rendition ladders keyed by asset. Uploading/queued assets have no
// ladder yet — the panel shows a compact EmptyState instead.
const RENDITIONS: Record<string, Rendition[]> = {
  'asset-keynote': [
    {id: 'r-1080', name: '1080p', codec: 'H.264', bitrate: '8.5 Mbps', size: '1.5 GB', status: 'done'},
    {id: 'r-720', name: '720p', codec: 'H.264', bitrate: '5 Mbps', size: '890 MB', status: 'done'},
    {id: 'r-480', name: '480p', codec: 'H.264', bitrate: '2.5 Mbps', size: '—', status: 'active'},
    {id: 'r-hls', name: 'HLS ladder', codec: 'TS/fMP4', bitrate: 'multi', size: '—', status: 'pending'},
  ],
  'asset-podcast': [
    {id: 'r-320', name: 'AAC 320k', codec: 'AAC-LC', bitrate: '320 kbps', size: '125 MB', status: 'done'},
    {id: 'r-128', name: 'AAC 128k', codec: 'AAC-LC', bitrate: '128 kbps', size: '50 MB', status: 'done'},
    {id: 'r-hls', name: 'HLS audio', codec: 'TS', bitrate: 'multi', size: '178 MB', status: 'done'},
  ],
  'asset-drone': [
    {id: 'r-1080', name: '1080p', codec: 'H.264', bitrate: '8.5 Mbps', size: '—', status: 'failed'},
    {id: 'r-720', name: '720p', codec: 'H.264', bitrate: '5 Mbps', size: '—', status: 'pending'},
    {id: 'r-480', name: '480p', codec: 'H.264', bitrate: '2.5 Mbps', size: '—', status: 'pending'},
    {id: 'r-hls', name: 'HLS ladder', codec: 'TS/fMP4', bitrate: 'multi', size: '—', status: 'pending'},
  ],
  'asset-thumbs': [
    {id: 'r-2048', name: 'web-2048', codec: 'JPEG', bitrate: '—', size: '96 MB', status: 'done'},
    {id: 'r-1024', name: 'web-1024', codec: 'JPEG', bitrate: '—', size: '31 MB', status: 'done'},
    {id: 'r-256', name: 'thumb-256', codec: 'JPEG', bitrate: '—', size: '4.8 MB', status: 'done'},
  ],
  'asset-promo': [
    {id: 'r-1080', name: '1080p', codec: 'H.264', bitrate: '8.5 Mbps', size: '42 MB', status: 'done'},
    {id: 'r-720', name: '720p', codec: 'H.264', bitrate: '5 Mbps', size: '25 MB', status: 'done'},
    {id: 'r-480', name: '480p', codec: 'H.264', bitrate: '2.5 Mbps', size: '12 MB', status: 'done'},
    {id: 'r-hls', name: 'HLS ladder', codec: 'TS/fMP4', bitrate: 'multi', size: '84 MB', status: 'done'},
  ],
  'asset-ambience': [
    {id: 'r-256', name: 'AAC 256k', codec: 'AAC-LC', bitrate: '256 kbps', size: '19 MB', status: 'done'},
    {id: 'r-128', name: 'AAC 128k', codec: 'AAC-LC', bitrate: '128 kbps', size: '9.6 MB', status: 'done'},
    {id: 'r-hls', name: 'HLS audio', codec: 'TS', bitrate: 'multi', size: '31 MB', status: 'done'},
  ],
};

const FOLDERS: {id: FolderId; label: string; icon: typeof FolderIcon}[] = [
  {id: 'all', label: 'All assets', icon: LibraryIcon},
  {id: 'raw', label: 'Raw uploads', icon: FolderIcon},
  {id: 'renditions', label: 'Renditions', icon: LayersIcon},
  {id: 'archive', label: 'Archive', icon: ArchiveIcon},
];

const TYPE_BADGE: Record<AssetType, {label: string; variant: 'info' | 'neutral' | 'success'}> = {
  video: {label: 'video', variant: 'info'},
  audio: {label: 'audio', variant: 'neutral'},
  image: {label: 'image', variant: 'success'},
};

// Deterministic waveform silhouette for audio previews (fixed heights in
// percent — no Math.random).
const WAVEFORM = [
  34, 58, 46, 72, 60, 38, 66, 80, 52, 44, 70, 62, 40, 74, 56, 48, 68, 36,
  64, 58, 42, 76, 50, 60, 44, 66, 54, 38,
];

const STORAGE_USED_TB = 1.4;
const STORAGE_TOTAL_TB = 2;

function matchesStatusFilter(state: PipelineState, filter: StatusFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'processing':
      return state === 'uploading' || state === 'queued' || state === 'transcoding';
    case 'ready':
      return state === 'ready';
    case 'failed':
      return state === 'failed';
  }
}

// ============= PIPELINE STATE CELL =============

/**
 * The pipeline-state column: one cell renderer covering all five states —
 * in-flight upload ProgressBar, Queued Badge, Spinner + percent while
 * transcoding, green Ready check, red Failed with the error in a Tooltip.
 */
function PipelineCell({asset}: {asset: AssetRow}) {
  switch (asset.state) {
    case 'uploading':
      return (
        <div style={styles.pipelineCell}>
          <ProgressBar
            label="Uploading"
            value={asset.progress ?? 0}
            hasValueLabel
          />
        </div>
      );
    case 'queued':
      return <Badge label="Queued" variant="neutral" />;
    case 'transcoding':
      return (
        <HStack gap={2} vAlign="center">
          <Spinner size="sm" aria-label="Transcoding" />
          <Text type="body" hasTabularNumbers>
            Transcoding {asset.progress ?? 0}%
          </Text>
        </HStack>
      );
    case 'ready':
      return (
        <HStack gap={2} vAlign="center">
          <Icon icon="success" size="sm" color="success" aria-label="Ready" />
          <Text type="body">Ready</Text>
        </HStack>
      );
    case 'failed':
      return (
        <Tooltip content={asset.error ?? 'Transcode failed'}>
          <HStack gap={2} vAlign="center">
            <StatusDot variant="error" label="Transcode failed" />
            <Text type="body" style={{color: 'var(--color-error)'}}>
              Failed
            </Text>
          </HStack>
        </Tooltip>
      );
  }
}

// ============= DETAIL PANEL PIECES =============

/** 16:9 preview stage — gradient + play glyph for video, deterministic
 * waveform bars for audio, framed glyph for image bundles. No media
 * elements, no network assets. */
function PreviewPlaceholder({asset}: {asset: AssetRow}) {
  if (asset.type === 'audio') {
    return (
      <AspectRatio ratio={16 / 9}>
        <div style={styles.previewMuted}>
          <div style={styles.waveformRow} aria-hidden>
            {WAVEFORM.map((height, index) => (
              <div
                key={index}
                style={{...styles.waveformBar, height: `${height}%`}}
              />
            ))}
          </div>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {asset.rate} · {asset.duration}
          </Text>
        </div>
      </AspectRatio>
    );
  }
  if (asset.type === 'image') {
    return (
      <AspectRatio ratio={16 / 9}>
        <div style={styles.previewMuted}>
          <Icon icon={ImageIcon} size="lg" color="secondary" />
          <Text type="supporting" color="secondary">
            Contact sheet renders after unpack
          </Text>
        </div>
      </AspectRatio>
    );
  }
  return (
    <AspectRatio ratio={16 / 9}>
      <div style={styles.previewVideo}>
        <Icon icon={PlayIcon} size="lg" color="inherit" />
        <span style={styles.previewCaption}>
          {asset.state === 'ready'
            ? '1920 × 1080 · poster frame'
            : 'Poster generates after transcode'}
        </span>
      </div>
    </AspectRatio>
  );
}

function RenditionStatusCell({rendition}: {rendition: Rendition}) {
  switch (rendition.status) {
    case 'done':
      return <Icon icon="success" size="sm" color="success" aria-label="Done" />;
    case 'active':
      return <Spinner size="sm" aria-label="Encoding" />;
    case 'failed':
      return <StatusDot variant="error" label="Failed" tooltip="Failed" />;
    case 'pending':
      return <StatusDot variant="neutral" label="Pending" tooltip="Pending" />;
  }
}

// Mini-table columns fit the 360px panel: 120 + 72 + 64 + 44 + padding.
const RENDITION_COLUMNS: TableColumn<Rendition>[] = [
  {
    key: 'name',
    header: 'Rendition',
    width: proportional(1),
    renderCell: rendition => (
      <VStack gap={0}>
        <Text type="label" maxLines={1}>
          {rendition.name}
        </Text>
        <Text type="supporting" color="secondary" maxLines={1}>
          {rendition.codec}
        </Text>
      </VStack>
    ),
  },
  {
    key: 'bitrate',
    header: 'Bitrate',
    width: pixel(72),
    align: 'end',
    renderCell: rendition => (
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {rendition.bitrate}
      </Text>
    ),
  },
  {
    key: 'size',
    header: 'Size',
    width: pixel(64),
    align: 'end',
    renderCell: rendition => (
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {rendition.size}
      </Text>
    ),
  },
  {
    key: 'status',
    header: '',
    width: pixel(44),
    align: 'center',
    resizable: false,
    renderCell: rendition => <RenditionStatusCell rendition={rendition} />,
  },
];

function AssetDetailPane({
  asset,
  onClose,
  onRetry,
  onDownload,
  onDelete,
}: {
  asset: AssetRow;
  onClose: () => void;
  onRetry: (assetId: string) => void;
  onDownload: (assetId: string) => void;
  onDelete: (assetId: string) => void;
}) {
  const renditions = RENDITIONS[asset.id] ?? [];

  return (
    <div style={styles.detailPane}>
      <div style={styles.detailHeader}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <VStack gap={0}>
              <Heading level={4} accessibilityLevel={2} maxLines={1}>
                {asset.filename}
              </Heading>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {TYPE_BADGE[asset.type].label} · {asset.size} · {asset.duration}
              </Text>
            </VStack>
          </StackItem>
          <IconButton
            label="Close details"
            tooltip="Close details"
            icon={<Icon icon={XIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            onClick={onClose}
          />
        </HStack>
      </div>
      <Divider />
      <div style={styles.detailBody}>
        <VStack gap={4}>
          <PreviewPlaceholder asset={asset} />

          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="label">Pipeline</Text>
            </StackItem>
            <PipelineCell asset={asset} />
          </HStack>

          <Divider />

          <VStack gap={2}>
            <Heading level={5} accessibilityLevel={3}>
              Renditions
            </Heading>
            {renditions.length === 0 ? (
              <EmptyState
                isCompact
                icon={<Icon icon={LayersIcon} size="lg" />}
                title="No renditions yet"
                description="The ladder appears once the transcode pipeline picks this asset up."
              />
            ) : (
              <Table<Rendition>
                data={renditions}
                columns={RENDITION_COLUMNS}
                idKey="id"
                density="compact"
                dividers="rows"
              />
            )}
          </VStack>

          <Divider />

          <MetadataList title="Source details">
            <MetadataListItem label="Codec">{asset.codec}</MetadataListItem>
            <MetadataListItem label="Frame rate">{asset.rate}</MetadataListItem>
            <MetadataListItem label="Uploaded by">
              {asset.uploadedBy}
            </MetadataListItem>
            <MetadataListItem label="Asset id">
              <span style={styles.mono}>{asset.assetId}</span>
            </MetadataListItem>
            <MetadataListItem label="Checksum">
              <span style={styles.mono}>{asset.checksum}</span>
            </MetadataListItem>
          </MetadataList>

          <Divider />

          <HStack gap={2}>
            <Button
              label="Retry"
              variant="secondary"
              size="sm"
              icon={<Icon icon={RotateCcwIcon} size="sm" />}
              isDisabled={asset.state !== 'failed'}
              onClick={() => onRetry(asset.id)}
            />
            <Button
              label="Download"
              variant="secondary"
              size="sm"
              icon={<Icon icon={DownloadIcon} size="sm" />}
              isDisabled={asset.state !== 'ready'}
              onClick={() => onDownload(asset.id)}
            />
            <StackItem size="fill">
              <span />
            </StackItem>
            <Button
              label="Delete"
              variant="destructive"
              size="sm"
              icon={<Icon icon={Trash2Icon} size="sm" />}
              onClick={() => onDelete(asset.id)}
            />
          </HStack>
        </VStack>
      </div>
    </div>
  );
}

// ============= PAGE =============

export default function MediaAssetPipelineTemplate() {
  const [rows, setRows] = useState<AssetRow[]>(ASSETS);
  const [folder, setFolder] = useState<FolderId>('raw');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(
    'asset-keynote',
  );
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract: <=1280px the detail panel overlays the table;
  // <=768px the rail and the header search input are dropped.
  const isOverlay = useMediaQuery('(max-width: 1280px)');
  const isCompact = useMediaQuery('(max-width: 768px)');

  const normalizedQuery = query.trim().toLowerCase();
  const visibleRows = rows.filter(
    row =>
      (folder === 'all' || row.folder === folder) &&
      matchesStatusFilter(row.state, statusFilter) &&
      (normalizedQuery === '' ||
        row.filename.toLowerCase().includes(normalizedQuery)),
  );

  const selectedAsset =
    selectedAssetId != null
      ? rows.find(row => row.id === selectedAssetId) ?? null
      : null;

  const checkedVisible = visibleRows.filter(row => checkedIds.has(row.id));
  const checkedCount = checkedVisible.length;
  const allChecked = visibleRows.length > 0 && checkedCount === visibleRows.length;
  const headerCheckValue: boolean | 'indeterminate' = allChecked
    ? true
    : checkedCount > 0
      ? 'indeterminate'
      : false;

  const folderLabel = FOLDERS.find(entry => entry.id === folder)?.label ?? '';

  // ---- Mutations ----

  const toggleChecked = (assetId: string, isChecked: boolean) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (isChecked) {
        next.add(assetId);
      } else {
        next.delete(assetId);
      }
      return next;
    });
  };

  const toggleAllChecked = (isChecked: boolean) => {
    setCheckedIds(
      isChecked ? new Set(visibleRows.map(row => row.id)) : new Set(),
    );
  };

  const retryAsset = (assetId: string) => {
    setRows(prev =>
      prev.map(row =>
        row.id === assetId && row.state === 'failed'
          ? {...row, state: 'queued' as const, error: undefined}
          : row,
      ),
    );
    setAnnouncement('Transcode re-queued');
  };

  const deleteAsset = (assetId: string) => {
    setRows(prev => prev.filter(row => row.id !== assetId));
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.delete(assetId);
      return next;
    });
    if (selectedAssetId === assetId) {
      setSelectedAssetId(null);
    }
    setAnnouncement('Asset deleted');
  };

  const downloadAsset = (assetId: string) => {
    const asset = rows.find(row => row.id === assetId);
    setAnnouncement(
      asset != null
        ? `Preparing download for ${asset.filename}`
        : 'Preparing download',
    );
  };

  const deleteChecked = () => {
    const doomed = new Set(checkedVisible.map(row => row.id));
    setRows(prev => prev.filter(row => !doomed.has(row.id)));
    if (selectedAssetId != null && doomed.has(selectedAssetId)) {
      setSelectedAssetId(null);
    }
    setCheckedIds(new Set());
    setAnnouncement(
      `Deleted ${doomed.size} ${doomed.size === 1 ? 'asset' : 'assets'}`,
    );
  };

  const selectFolder = (nextFolder: FolderId) => {
    setFolder(nextFolder);
    setCheckedIds(new Set());
  };

  // ---- Table columns (need render-time selection state) ----

  const assetColumns: TableColumn<AssetRow>[] = [
    {
      key: 'select',
      header: (
        <CheckboxInput
          label="Select all visible assets"
          isLabelHidden
          size="sm"
          value={headerCheckValue}
          onChange={toggleAllChecked}
        />
      ),
      width: pixel(44),
      resizable: false,
      renderCell: item => (
        <CheckboxInput
          label={`Select ${item.filename}`}
          isLabelHidden
          size="sm"
          value={checkedIds.has(item.id)}
          onChange={isChecked => toggleChecked(item.id, isChecked)}
        />
      ),
    },
    {
      key: 'filename',
      header: 'Asset',
      width: proportional(2),
      renderCell: item => (
        <HStack gap={2} vAlign="center">
          <div style={styles.thumbBox}>
            <Thumbnail label={item.filename} />
          </div>
          <VStack gap={0}>
            <Text type="label" maxLines={1}>
              {item.filename}
            </Text>
            <Text type="supporting" color="secondary" maxLines={1}>
              <span style={styles.mono}>{item.assetId}</span>
            </Text>
          </VStack>
        </HStack>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      width: pixel(90),
      renderCell: item => (
        <Badge
          label={TYPE_BADGE[item.type].label}
          variant={TYPE_BADGE[item.type].variant}
        />
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      width: pixel(96),
      align: 'end',
      renderCell: item => (
        <Text type="body" color="secondary" hasTabularNumbers>
          {item.duration}
        </Text>
      ),
    },
    {
      key: 'size',
      header: 'Size',
      width: pixel(88),
      align: 'end',
      renderCell: item => (
        <Text type="body" color="secondary" hasTabularNumbers>
          {item.size}
        </Text>
      ),
    },
    {
      key: 'state',
      header: 'Pipeline',
      width: proportional(1.4),
      renderCell: item => <PipelineCell asset={item} />,
    },
  ];

  // Row click opens the detail panel; clicks that land on the checkbox
  // (input/label) or a button keep their own behavior.
  const rowClickPlugin: TablePlugin<AssetRow> = {
    transformBodyRow: (props, item) => ({
      ...props,
      htmlProps: {
        ...props.htmlProps,
        onClick: event => {
          const target = event.target as HTMLElement;
          if (target.closest('input, label, button, a') != null) {
            return;
          }
          setSelectedAssetId(item.id);
        },
        'aria-selected': item.id === selectedAssetId,
        style: {
          ...props.htmlProps.style,
          cursor: 'pointer',
          ...(item.id === selectedAssetId
            ? {backgroundColor: 'var(--color-background-muted)'}
            : null),
        },
      },
    }),
  };

  // ---- Rail: folder tree + storage card ----

  const treeItems: TreeListItemData[] = FOLDERS.map(entry => ({
    id: entry.id,
    label: entry.label,
    startContent: <Icon icon={entry.icon} size="sm" color="secondary" />,
    endContent: (
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {entry.id === 'all'
          ? rows.length
          : rows.filter(row => row.folder === entry.id).length}
      </Text>
    ),
    isSelected: entry.id === folder,
    onClick: () => selectFolder(entry.id),
  }));

  const rail = (
    <div style={styles.rail}>
      <div style={styles.railTree}>
        <TreeList
          density="compact"
          items={treeItems}
          header={
            <Text type="label" size="sm" color="secondary">
              Library
            </Text>
          }
        />
      </div>
      <Divider />
      <div style={styles.railStorage}>
        <Card padding={3}>
          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              <Icon icon={HardDriveIcon} size="sm" color="secondary" />
              <Text type="label">Storage</Text>
            </HStack>
            <ProgressBar
              label="Storage used"
              isLabelHidden
              value={STORAGE_USED_TB}
              max={STORAGE_TOTAL_TB}
              variant="accent"
            />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {STORAGE_USED_TB} TB of {STORAGE_TOTAL_TB} TB
            </Text>
            <Text type="supporting" color="secondary">
              Renditions auto-expire after 90 days.
            </Text>
          </VStack>
        </Card>
      </div>
    </div>
  );

  // ---- Detail pane (LayoutPanel end >1280px, overlay below) ----

  const detailPane =
    selectedAsset != null ? (
      <AssetDetailPane
        asset={selectedAsset}
        onClose={() => setSelectedAssetId(null)}
        onRetry={retryAsset}
        onDownload={downloadAsset}
        onDelete={deleteAsset}
      />
    ) : null;

  // ---- Empty-state copy tracks the active filters ----

  const emptyTitle =
    folder === 'archive'
      ? 'Nothing archived'
      : normalizedQuery !== ''
        ? 'No matching assets'
        : 'No assets here';
  const emptyDescription =
    folder === 'archive'
      ? 'Assets you archive from the library land here, out of the active pipeline.'
      : normalizedQuery !== ''
        ? `Nothing in ${folderLabel.toLowerCase()} matches "${query.trim()}".`
        : 'Upload media or switch folders to see pipeline activity.';

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <Breadcrumbs label="Library location">
                <BreadcrumbItem onClick={() => selectFolder('all')}>
                  Library
                </BreadcrumbItem>
                <BreadcrumbItem isCurrent>{folderLabel}</BreadcrumbItem>
              </Breadcrumbs>
            </StackItem>
            {!isCompact && (
              <div style={styles.headerSearch}>
                <TextInput
                  label="Search assets"
                  isLabelHidden
                  size="sm"
                  placeholder="Search filenames..."
                  startIcon={SearchIcon}
                  hasClear
                  value={query}
                  onChange={setQuery}
                />
              </div>
            )}
            <SegmentedControl
              label="Pipeline status filter"
              size="sm"
              value={statusFilter}
              onChange={value => setStatusFilter(value as StatusFilter)}>
              <SegmentedControlItem value="all" label="All" />
              <SegmentedControlItem value="processing" label="Processing" />
              <SegmentedControlItem value="ready" label="Ready" />
              <SegmentedControlItem value="failed" label="Failed" />
            </SegmentedControl>
            <Button
              label="Upload"
              variant="primary"
              size="sm"
              icon={<Icon icon={UploadIcon} size="sm" />}
              onClick={() =>
                setAnnouncement('Upload is disabled in this demo')
              }
            />
          </HStack>
        </LayoutHeader>
      }
      start={
        isCompact ? undefined : (
          <LayoutPanel width={240} padding={0} label="Library folders">
            {rail}
          </LayoutPanel>
        )
      }
      end={
        !isOverlay && detailPane != null ? (
          <LayoutPanel width={360} padding={0} label="Asset details">
            {detailPane}
          </LayoutPanel>
        ) : undefined
      }
      content={
        <LayoutContent padding={0}>
          <div style={styles.contentWrap}>
            <div aria-live="polite" style={styles.visuallyHidden}>
              {announcement}
            </div>
            {checkedCount > 0 && (
              <div style={styles.bulkBar}>
                <Toolbar
                  label="Bulk actions"
                  size="sm"
                  gap={2}
                  variant="section"
                  dividers={['bottom']}
                  startContent={
                    <HStack gap={2} vAlign="center">
                      <Text type="label" hasTabularNumbers>
                        {checkedCount} selected
                      </Text>
                      <Button
                        label="Clear"
                        variant="ghost"
                        icon={<Icon icon={XIcon} size="sm" />}
                        onClick={() => setCheckedIds(new Set())}
                      />
                    </HStack>
                  }
                  endContent={
                    <HStack gap={2} vAlign="center">
                      <Button
                        label="Download"
                        variant="secondary"
                        icon={<Icon icon={DownloadIcon} size="sm" />}
                        onClick={() =>
                          setAnnouncement(
                            `Preparing download for ${checkedCount} ${
                              checkedCount === 1 ? 'asset' : 'assets'
                            }`,
                          )
                        }
                      />
                      <Button
                        label="Delete"
                        variant="destructive"
                        icon={<Icon icon={Trash2Icon} size="sm" />}
                        onClick={deleteChecked}
                      />
                    </HStack>
                  }
                />
              </div>
            )}
            <div style={styles.tableScroll}>
              <Table<AssetRow>
                data={visibleRows}
                columns={assetColumns}
                idKey="id"
                density="balanced"
                dividers="rows"
                hasHover
                plugins={{rowClick: rowClickPlugin}}
                emptyState={
                  <EmptyState
                    isCompact
                    icon={<Icon icon={ArchiveIcon} size="lg" />}
                    title={emptyTitle}
                    description={emptyDescription}
                  />
                }
              />
            </div>
            {isOverlay && detailPane != null && (
              <div style={styles.overlayPanel}>{detailPane}</div>
            )}
          </div>
        </LayoutContent>
      }
    />
  );
}
