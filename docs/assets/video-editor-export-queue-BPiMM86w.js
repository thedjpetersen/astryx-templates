var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one 01:24:36:12, 24fps UHD documentary
 *   sequence 'harbor-light_final-cut_v12'; four delivery presets — YouTube 4K
 *   H.264 45 Mbps, ProRes 422 HQ master 707 Mbps, H.264 1080p review 8 Mbps,
 *   podcast WAV 24-bit — each with fixed codec/bitrate/size math; three
 *   destination volumes with fixed free-space numbers; five seeded render
 *   jobs at fixed progress values including one failed ProRes job with a
 *   disk-full error string)
 * @output Delivery/export surface for an NLE: a 52px header (project name,
 *   sequence timecode + fps meta, queue tally, primary Add to Queue Button),
 *   a scrolling settings column with four SelectableCard export presets
 *   (mini scheme-locked 16:9 thumbnail, codec line, bitrate + estimated-size
 *   Badges), a Custom settings Collapsible accordion (format/codec/
 *   resolution/frame-rate Selectors, CBR/VBR-1/VBR-2 bitrate-mode
 *   SegmentedControl, target-bitrate Slider with live size re-estimate),
 *   a destination row (volume Selector with free-space captions, filename
 *   TextInput, mono output-path readout), a 320px sticky Export summary
 *   panel that recomputes container/codec/size/encode-time rows from the
 *   live settings — and the defining region: a 320px bottom render-queue
 *   dock whose children-mode Table lists per-job ProgressBars, ETA and
 *   throughput readouts, rendering/queued/done/failed/paused status Badges,
 *   pause/retry/remove IconButtons, and a full-width inline error row under
 *   the failed ProRes job (disk-full message + Retry render Button), plus
 *   queue controls (Pause queue ToggleButton, Clear finished, GPU encode
 *   Switch)
 * @position Page template; emitted by \`astryx template video-editor-export-queue\`
 *
 * Frame: Layout height="fill" inside a 100dvh root div (the demo stage is
 * auto-height; footgun 6), zero page scroll outside the two deliberate
 * scroll bodies. LayoutHeader carries project chrome + Add to Queue.
 * Middle band: LayoutContent (presets, accordion, destination; vertical
 * scroll) and LayoutPanel end 320 (Export summary, sticky). LayoutFooter
 * height 320 hosts the render-queue dock: a queue Toolbar and a
 * children-mode Table whose body scrolls vertically inside the dock.
 * Choose over video-clip-timeline when the user configures and monitors
 * renders rather than arranges clips on lanes.
 *
 * Responsive contract:
 * - >1160px: header | settings (fill, presets in an auto-fit >=230px grid)
 *   | summary 320 | queue dock 320.
 * - <=1160px: the summary panel drops out; its size/encode-time estimate
 *   resurfaces as an inline readout row under the destination section so
 *   the number never disappears.
 * - <=768px: the header hides the sequence timecode/fps meta; the queue
 *   table drops the Preset and Size columns (COLUMN_COUNT_COMPACT keeps
 *   the error row's colSpan in sync) and the preset grid stacks 1-up.
 * - Header and destination rows wrap (flexWrap) instead of clipping.
 * - The queue table body scrolls vertically inside the fixed-height dock
 *   at every width; the dock toolbar never scrolls away.
 *
 * Container policy (tool-dock archetype): frame-first rows and panels;
 * Cards only for the genuine widgets — the four SelectableCard presets and
 * the Export summary card. The queue is a bare Table inside the footer
 * dock, not a Card.
 *
 * Color policy: each preset card's mini thumbnail is a deliberately
 * scheme-locked dark 16:9 stage (colorScheme: 'dark' in
 * \`styles.presetThumb\`) — it stands in for graded documentary footage,
 * which stays dark in both schemes, so its gradient and slate label
 * literals are intentional. Everything else is var(--color-*) tokens or
 * explicit light-dark() pairs (the four preset tint hues shift to their
 * 400-weight values on dark).
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  AudioLinesIcon,
  ClapperboardIcon,
  ClockIcon,
  CloudUploadIcon,
  FilmIcon,
  FolderOpenIcon,
  HardDriveIcon,
  ListVideoIcon,
  MonitorPlayIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  RotateCcwIcon,
  Settings2Icon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {SelectableCard} from '@astryxdesign/core/SelectableCard';
import {Selector} from '@astryxdesign/core/Selector';
import {Slider} from '@astryxdesign/core/Slider';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= SEQUENCE CONSTANTS =============

const PROJECT_NAME = 'Harbor Light';
const SEQUENCE_NAME = 'harbor-light_final-cut_v12';
const FPS = 24;
/** 01:24:36:12 at 24fps — every size/ETA estimate derives from this. */
const DURATION_SEC = 5076.5;
const SEQUENCE_TIMECODE = '01:24:36:12';

const MONO = 'var(--font-family-code, monospace)';

// Queue dock geometry.
const DOCK_H = 320;
const SUMMARY_PANEL_W = 320;

// Queue table column counts keep the inline error row's colSpan in sync
// when the compact breakpoint drops the Preset and Size columns.
const COLUMN_COUNT = 7;
const COLUMN_COUNT_COMPACT = 5;

/** Seconds -> SMPTE HH:MM:SS:FF at 24fps. */
function formatTimecode(sec: number): string {
  const totalFrames = Math.round(sec * FPS);
  const frames = totalFrames % FPS;
  const totalSec = Math.floor(totalFrames / FPS);
  const pad = (n: number) => String(n).padStart(2, '0');
  return \`\${pad(Math.floor(totalSec / 3600))}:\${pad(
    Math.floor(totalSec / 60) % 60,
  )}:\${pad(totalSec % 60)}:\${pad(frames)}\`;
}

/** Seconds -> compact duration, e.g. 1362 -> "22m 42s", 38 -> "38s". */
function formatDuration(sec: number): string {
  const whole = Math.round(sec);
  const h = Math.floor(whole / 3600);
  const m = Math.floor((whole % 3600) / 60);
  const s = whole % 60;
  if (h > 0) {
    return \`\${h}h \${String(m).padStart(2, '0')}m\`;
  }
  if (m > 0) {
    return \`\${m}m \${String(s).padStart(2, '0')}s\`;
  }
  return \`\${s}s\`;
}

/** Total stream bitrate -> size over the fixed sequence duration. */
function estimateSizeGB(videoMbps: number, audioKbps: number): number {
  const totalMbps = videoMbps + audioKbps / 1000;
  return (totalMbps / 8) * DURATION_SEC * 0.001; // Mb/s -> GB
}

/** 28.758 -> "28.8 GB", 0.62 -> "635 MB". */
function formatSizeGB(gb: number): string {
  if (gb >= 100) {
    return \`\${gb.toFixed(0)} GB\`;
  }
  if (gb >= 1) {
    return \`\${gb.toFixed(1)} GB\`;
  }
  return \`\${Math.round(gb * 1024)} MB\`;
}

// ============= FIXTURES =============
// Fixed presets, destinations, and seeded queue jobs — no clocks, no
// randomness. Every size figure is estimateSizeGB() over the same 5076.5s
// sequence so repeated numbers stay consistent across panels.

type BitrateMode = 'cbr' | 'vbr1' | 'vbr2';

interface ExportSettings {
  format: string; // container option label
  codec: string;
  resolution: string;
  frameRate: string;
  bitrateMode: BitrateMode;
  videoMbps: number;
  audio: string;
  audioKbps: number;
}

interface ExportPreset {
  id: string;
  name: string;
  caption: string;
  icon: typeof FilmIcon;
  /** Thumbnail overlay label, e.g. "2160p". */
  stageLabel: string;
  /** Preset tint for the thumbnail keyline + icon chip. */
  tint: string;
  tintBg: string;
  settings: ExportSettings;
  /** Encode speed vs realtime on the fixture workstation (fps ~ speed*24). */
  encodeSpeed: number;
  filenameSuffix: string;
}

const PRESETS: ExportPreset[] = [
  {
    id: 'youtube-4k',
    name: 'YouTube 4K',
    caption: 'Upload master · UHD',
    icon: MonitorPlayIcon,
    stageLabel: '2160p',
    tint: 'light-dark(#DC2626, #F87171)',
    tintBg: 'light-dark(rgba(220, 38, 38, 0.12), rgba(248, 113, 113, 0.16))',
    settings: {
      format: 'MP4 (.mp4)',
      codec: 'H.264 — High 5.2',
      resolution: '3840 × 2160 (UHD)',
      frameRate: '23.976',
      bitrateMode: 'vbr2',
      videoMbps: 45,
      audio: 'AAC stereo · 48 kHz',
      audioKbps: 320,
    },
    encodeSpeed: 0.9,
    filenameSuffix: 'youtube-4k',
  },
  {
    id: 'prores-master',
    name: 'ProRes Master',
    caption: 'Archive · broadcast hand-off',
    icon: FilmIcon,
    stageLabel: '2160p',
    tint: 'light-dark(#6B1EFD, #9D6BFF)',
    tintBg: 'light-dark(rgba(107, 30, 253, 0.10), rgba(157, 107, 255, 0.16))',
    settings: {
      format: 'QuickTime (.mov)',
      codec: 'Apple ProRes 422 HQ',
      resolution: '3840 × 2160 (UHD)',
      frameRate: '23.976',
      bitrateMode: 'cbr',
      videoMbps: 707,
      audio: 'PCM 24-bit · 48 kHz',
      audioKbps: 2304,
    },
    encodeSpeed: 1.6,
    filenameSuffix: 'prores-master',
  },
  {
    id: 'h264-review',
    name: 'H.264 Review',
    caption: 'Client review · 1080p',
    icon: ListVideoIcon,
    tint: 'light-dark(#0171E3, #4C9EFF)',
    tintBg: 'light-dark(rgba(1, 113, 227, 0.10), rgba(76, 158, 255, 0.16))',
    stageLabel: '1080p',
    settings: {
      format: 'MP4 (.mp4)',
      codec: 'H.264 — Main 4.2',
      resolution: '1920 × 1080 (HD)',
      frameRate: '23.976',
      bitrateMode: 'vbr1',
      videoMbps: 8,
      audio: 'AAC stereo · 48 kHz',
      audioKbps: 192,
    },
    encodeSpeed: 3.2,
    filenameSuffix: 'review-1080p',
  },
  {
    id: 'podcast-audio',
    name: 'Podcast Audio',
    caption: 'Dialog mixdown · WAV',
    icon: AudioLinesIcon,
    stageLabel: 'AUDIO',
    tint: 'light-dark(#0B991F, #34C759)',
    tintBg: 'light-dark(rgba(11, 153, 31, 0.10), rgba(52, 199, 89, 0.16))',
    settings: {
      format: 'WAV (.wav)',
      codec: 'PCM 24-bit',
      resolution: 'Audio only',
      frameRate: '—',
      bitrateMode: 'cbr',
      videoMbps: 0,
      audio: 'PCM 24-bit · 48 kHz',
      audioKbps: 2304,
    },
    encodeSpeed: 18,
    filenameSuffix: 'podcast-audio',
  },
];

const FORMAT_OPTIONS = [
  'MP4 (.mp4)',
  'QuickTime (.mov)',
  'MXF OP1a (.mxf)',
  'WAV (.wav)',
];
const CODEC_OPTIONS = [
  'H.264 — High 5.2',
  'H.264 — Main 4.2',
  'H.265 (HEVC) — Main 10',
  'Apple ProRes 422 HQ',
  'Apple ProRes 4444',
  'DNxHR HQX',
  'PCM 24-bit',
];
const RESOLUTION_OPTIONS = [
  '3840 × 2160 (UHD)',
  '2560 × 1440 (QHD)',
  '1920 × 1080 (HD)',
  '1280 × 720 (HD)',
  'Audio only',
];
const FRAME_RATE_OPTIONS = ['23.976', '24', '25', '29.97', '59.94', '—'];

interface Destination {
  id: string;
  label: string;
  path: string;
  freeLabel: string;
  icon: typeof HardDriveIcon;
}

const DESTINATIONS: Destination[] = [
  {
    id: 'raid',
    label: 'HL_RAID-01 · 212.4 GB free',
    path: '/Volumes/HL_RAID-01/Exports',
    freeLabel: '212.4 GB free of 16 TB',
    icon: HardDriveIcon,
  },
  {
    id: 'local',
    label: 'Macintosh HD · 1.1 TB free',
    path: '~/Movies/Harbor Light/Exports',
    freeLabel: '1.1 TB free of 2 TB',
    icon: HardDriveIcon,
  },
  {
    id: 'frameio',
    label: 'Frame.io · Harbor Light',
    path: 'frame.io/harbor-light/delivery',
    freeLabel: 'Uploads after encode completes',
    icon: CloudUploadIcon,
  },
];
const DESTINATION_OPTIONS = DESTINATIONS.map(d => ({
  value: d.id,
  label: d.label,
}));

type JobStatus = 'rendering' | 'paused' | 'queued' | 'done' | 'failed';

interface RenderJob {
  id: string;
  filename: string;
  presetName: string;
  codecLine: string; // e.g. "H.264 · 45 Mbps VBR-2"
  status: JobStatus;
  /** 0–100; fixture-frozen for the seeded jobs. */
  progressPct: number;
  /** Remaining encode seconds at the frozen progress point. */
  etaSec: number | null;
  /** Encoder throughput readout, frames per second. */
  fps: number | null;
  sizeGB: number;
  /** Human note for the terminal states. */
  note: string;
  error: string | null;
}

const INITIAL_JOBS: RenderJob[] = [
  {
    id: 'job-1',
    filename: 'harbor-light_v12_review-1080p.mp4',
    presetName: 'H.264 Review',
    codecLine: 'H.264 · 8 Mbps VBR-1',
    status: 'done',
    progressPct: 100,
    etaSec: null,
    fps: null,
    sizeGB: estimateSizeGB(8, 192),
    note: 'Finished 14:02 · 26m 24s',
    error: null,
  },
  {
    id: 'job-2',
    filename: 'harbor-light_v12_youtube-4k.mp4',
    presetName: 'YouTube 4K',
    codecLine: 'H.264 · 45 Mbps VBR-2',
    status: 'rendering',
    progressPct: 67,
    etaSec: 1862, // 31m 02s remaining at 21.4 fps
    fps: 21.4,
    sizeGB: estimateSizeGB(45, 320),
    note: 'Pass 2 of 2',
    error: null,
  },
  {
    id: 'job-3',
    filename: 'harbor-light_v12_prores-master.mov',
    presetName: 'ProRes Master',
    codecLine: 'ProRes 422 HQ · 707 Mbps CBR',
    status: 'failed',
    progressPct: 41,
    etaSec: null,
    fps: null,
    sizeGB: estimateSizeGB(707, 2304),
    note: 'Failed at 00:34:41:08',
    error:
      'Disk full on HL_RAID-01 — 450 GB required, 212.4 GB free. Free space or pick another destination, then retry. (code -34)',
  },
  {
    id: 'job-4',
    filename: 'harbor-light_v12_podcast-audio.wav',
    presetName: 'Podcast Audio',
    codecLine: 'PCM 24-bit · 48 kHz',
    status: 'queued',
    progressPct: 0,
    etaSec: 282, // ~18x realtime
    fps: null,
    sizeGB: estimateSizeGB(0, 2304),
    note: 'Position 1 in queue',
    error: null,
  },
  {
    id: 'job-5',
    filename: 'harbor-light_teaser_socials.mp4',
    presetName: 'H.264 Review',
    codecLine: 'H.264 · 8 Mbps VBR-1',
    status: 'queued',
    progressPct: 0,
    etaSec: 1587,
    fps: null,
    sizeGB: estimateSizeGB(8, 192),
    note: 'Position 2 in queue',
    error: null,
  },
];

const STATUS_META: Record<
  JobStatus,
  {
    label: string;
    badge: 'info' | 'warning' | 'neutral' | 'success' | 'error';
    bar: 'accent' | 'warning' | 'neutral' | 'success' | 'error';
  }
> = {
  rendering: {label: 'Rendering', badge: 'info', bar: 'accent'},
  paused: {label: 'Paused', badge: 'warning', bar: 'warning'},
  queued: {label: 'Queued', badge: 'neutral', bar: 'neutral'},
  done: {label: 'Done', badge: 'success', bar: 'success'},
  failed: {label: 'Failed', badge: 'error', bar: 'error'},
};

const BITRATE_MODE_LABEL: Record<BitrateMode, string> = {
  cbr: 'CBR',
  vbr1: 'VBR-1',
  vbr2: 'VBR-2',
};

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Footgun 6: the demo stage is auto-height, so Layout height="fill"
  // needs a fixed-height root to push against.
  root: {height: '100dvh', width: '100%'},
  mono: {fontFamily: MONO},
  timecode: {
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Header controls wrap onto a second row instead of clipping.
  headerRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-2)'},
  // Settings column: the page's single vertical scroll body.
  contentScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-5)',
    backgroundColor: 'var(--color-background-muted)',
  },
  contentColumn: {maxWidth: 980, marginInline: 'auto'},
  // Preset cards: auto-fit grid, 1-up at compact widths.
  presetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(215px, 1fr))',
    gap: 'var(--spacing-3)',
  },
  presetGridCompact: {display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-3)'},
  // Mini 16:9 thumbnail — scheme-locked dark (see header Color policy):
  // it stands in for graded footage, so the gradient and slate label are
  // deliberate literals; the keyline picks up the preset tint.
  presetThumb: {
    position: 'relative',
    aspectRatio: '16 / 9',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
    background:
      'linear-gradient(140deg, #33415C 0%, #1B2436 52%, #0C1322 100%)',
    colorScheme: 'dark',
  },
  presetThumbHorizon: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '58%',
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.4)',
  },
  presetThumbBeacon: {
    position: 'absolute',
    top: '30%',
    left: '68%',
    width: 6,
    height: '28%',
    borderRadius: 2,
    backgroundColor: 'rgba(226, 232, 240, 0.5)',
  },
  presetThumbLabel: {
    position: 'absolute',
    right: 8,
    bottom: 6,
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: '0.08em',
    color: 'rgba(226, 232, 240, 0.85)',
  },
  presetIconChip: {
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-control)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  // Destination path readout row.
  pathReadout: {
    fontFamily: MONO,
    fontSize: 12,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: 'var(--color-text-secondary)',
  },
  destinationRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-3)'},
  // Export summary panel (sticky per payout-statements idiom).
  summarySticky: {
    position: 'sticky',
    insetBlockStart: 0,
    maxHeight: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  summaryRow: {display: 'flex', gap: 'var(--spacing-2)', alignItems: 'baseline'},
  // Queue dock: toolbar row fixed, table body scrolls (minHeight: 0 chain).
  dock: {height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0},
  dockScroll: {flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'auto'},
  // Right-aligned numeric cells: tabular numerals, never truncated.
  numericCell: {textAlign: 'end'},
  // Inline error row under the failed job — error-tinted band spanning
  // every column.
  errorCell: {
    backgroundColor: 'var(--color-background-error-muted, light-dark(#FEF2F2, #2A1214))',
    borderInlineStart: '3px solid light-dark(#DC2626, #F87171)',
  },
  progressCellInner: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minWidth: 0,
  },
  progressTrackFill: {flex: 1, minWidth: 0},
  // Error copy: same red pair as the failed-row keyline (400-weight on dark).
  errorText: {color: 'light-dark(#DC2626, #F87171)'},
};

// ============= PRESET CARDS =============

/** One delivery preset: mini dark stage, name/caption, codec + size line. */
function PresetCard({
  preset,
  isSelected,
  onSelect,
}: {
  preset: ExportPreset;
  isSelected: boolean;
  onSelect: (presetId: string) => void;
}) {
  const {settings} = preset;
  const sizeGB = estimateSizeGB(settings.videoMbps, settings.audioKbps);
  const bitrateLabel =
    settings.videoMbps > 0
      ? \`\${settings.videoMbps} Mbps \${BITRATE_MODE_LABEL[settings.bitrateMode]}\`
      : \`\${(settings.audioKbps / 1000).toFixed(1)} Mbps PCM\`;
  return (
    <SelectableCard
      label={\`\${preset.name} preset — \${settings.codec}, estimated \${formatSizeGB(sizeGB)}\`}
      isSelected={isSelected}
      onChange={() => onSelect(preset.id)}
      padding={3}>
      <VStack gap={2}>
        <div style={{...styles.presetThumb, boxShadow: \`inset 0 0 0 1px \${preset.tint}\`}}>
          <div style={styles.presetThumbHorizon} />
          <div style={styles.presetThumbBeacon} />
          <span style={styles.presetThumbLabel}>{preset.stageLabel}</span>
        </div>
        <HStack gap={2} vAlign="center">
          <div style={{...styles.presetIconChip, backgroundColor: preset.tintBg}}>
            <Icon icon={preset.icon} size="sm" color="secondary" />
          </div>
          <VStack gap={0}>
            <Text type="body" weight="semibold">
              {preset.name}
            </Text>
            <Text type="supporting" color="secondary">
              {preset.caption}
            </Text>
          </VStack>
        </HStack>
        <Divider />
        <VStack gap={1}>
          <Text type="supporting" color="secondary" maxLines={1}>
            {settings.codec}
          </Text>
          <HStack gap={2} vAlign="center" style={{flexWrap: 'wrap', rowGap: 4}}>
            <Badge label={bitrateLabel} variant="neutral" />
            <Badge label={\`≈ \${formatSizeGB(sizeGB)}\`} variant="info" />
          </HStack>
        </VStack>
      </VStack>
    </SelectableCard>
  );
}

// ============= EXPORT SUMMARY =============

/** Label/value line in the Export summary card. */
function SummaryRow({
  label,
  value,
  isMono = false,
}: {
  label: string;
  value: ReactNode;
  isMono?: boolean;
}) {
  return (
    <div style={styles.summaryRow}>
      <StackItem size="fill">
        <Text type="supporting" color="secondary">
          {label}
        </Text>
      </StackItem>
      <Text
        type="supporting"
        weight="semibold"
        hasTabularNumbers
        style={isMono ? styles.mono : undefined}>
        {value}
      </Text>
    </div>
  );
}

/** Free space per destination, GB — drives the summary disk warning. */
const DEST_FREE_GB: Record<string, number> = {
  raid: 212.4,
  local: 1126.4,
  frameio: Number.POSITIVE_INFINITY,
};

// ============= PAGE =============

export default function VideoEditorExportQueueTemplate() {
  const [selectedPresetId, setSelectedPresetId] = useState('youtube-4k');
  // Custom-settings edits fork from the active preset; isModified flips
  // the summary badge to "Custom" until another preset is picked.
  const [settings, setSettings] = useState<ExportSettings>(
    PRESETS[0].settings,
  );
  const [isModified, setIsModified] = useState(false);
  const [destinationId, setDestinationId] = useState('raid');
  const [filename, setFilename] = useState('harbor-light_v12_youtube-4k');
  const [addAfterEncode, setAddAfterEncode] = useState(true);
  const [useGpuEncode, setUseGpuEncode] = useState(true);
  const [isQueuePaused, setIsQueuePaused] = useState(false);
  const [jobs, setJobs] = useState<RenderJob[]>(INITIAL_JOBS);
  // Monotonic id for jobs added during the session.
  const [nextJobNumber, setNextJobNumber] = useState(6);

  const isNarrow = useMediaQuery('(max-width: 1160px)');
  const isCompact = useMediaQuery('(max-width: 768px)');
  const columnCount = isCompact ? COLUMN_COUNT_COMPACT : COLUMN_COUNT;

  const activePreset =
    PRESETS.find(p => p.id === selectedPresetId) ?? PRESETS[0];
  const destination =
    DESTINATIONS.find(d => d.id === destinationId) ?? DESTINATIONS[0];

  // ----- derived estimates (recompute on every settings edit) -----
  const isAudioOnly = settings.resolution === 'Audio only';
  const estSizeGB = estimateSizeGB(settings.videoMbps, settings.audioKbps);
  const estEncodeSec = DURATION_SEC / activePreset.encodeSpeed;
  const freeGB = DEST_FREE_GB[destinationId] ?? Number.POSITIVE_INFINITY;
  const exceedsFreeSpace = estSizeGB > freeGB;
  const extension = settings.format.slice(
    settings.format.indexOf('(.') + 1,
    settings.format.indexOf(')'),
  );
  const outputName = \`\${filename}\${extension}\`;

  const selectPreset = (presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset == null) {
      return;
    }
    setSelectedPresetId(presetId);
    setSettings(preset.settings);
    setIsModified(false);
    setFilename(\`harbor-light_v12_\${preset.filenameSuffix}\`);
  };

  const patchSettings = (patch: Partial<ExportSettings>) => {
    setSettings(prev => ({...prev, ...patch}));
    setIsModified(true);
  };

  // ----- queue mutations -----
  const addToQueue = () => {
    const presetLabel = isModified
      ? \`\${activePreset.name} *\`
      : activePreset.name;
    const codecShort = settings.codec.split(' — ')[0];
    const bitrateLine = isAudioOnly
      ? \`\${settings.audio.split(' · ')[0]} · 48 kHz\`
      : \`\${codecShort} · \${settings.videoMbps} Mbps \${BITRATE_MODE_LABEL[settings.bitrateMode]}\`;
    const queuedCount = jobs.filter(j => j.status === 'queued').length;
    const job: RenderJob = {
      id: \`job-\${nextJobNumber}\`,
      filename: outputName,
      presetName: presetLabel,
      codecLine: bitrateLine,
      status: 'queued',
      progressPct: 0,
      etaSec: estEncodeSec,
      fps: null,
      sizeGB: estSizeGB,
      note: \`Position \${queuedCount + 1} in queue\`,
      error: null,
    };
    setNextJobNumber(n => n + 1);
    setJobs(prev => [...prev, job]);
  };

  const patchJob = (jobId: string, patch: Partial<RenderJob>) => {
    setJobs(prev =>
      prev.map(job => (job.id === jobId ? {...job, ...patch} : job)),
    );
  };

  const toggleJobPause = (jobId: string) => {
    setJobs(prev =>
      prev.map(job =>
        job.id === jobId
          ? {
              ...job,
              status: job.status === 'paused' ? 'rendering' : 'paused',
              note:
                job.status === 'paused' ? 'Pass 2 of 2' : 'Paused by editor',
            }
          : job,
      ),
    );
  };

  const retryJob = (jobId: string) => {
    patchJob(jobId, {
      status: 'queued',
      progressPct: 0,
      error: null,
      note: 'Requeued · will retry from 00:00:00:00',
      etaSec: DURATION_SEC / 1.6,
    });
  };

  const removeJob = (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const clearFinished = () => {
    setJobs(prev => prev.filter(job => job.status !== 'done'));
  };

  const tally = {
    rendering: jobs.filter(
      j => j.status === 'rendering' || j.status === 'paused',
    ).length,
    queued: jobs.filter(j => j.status === 'queued').length,
    done: jobs.filter(j => j.status === 'done').length,
    failed: jobs.filter(j => j.status === 'failed').length,
  };

  // ----- Header -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={2} vAlign="center" style={styles.headerRow}>
        <StackItem size="fill">
          <HStack gap={2} vAlign="center">
            <Icon icon={ClapperboardIcon} size="md" color="secondary" />
            <Heading level={1}>{PROJECT_NAME} — Delivery</Heading>
            <Badge label={SEQUENCE_NAME} variant="neutral" />
            {!isCompact && (
              <Text
                type="supporting"
                color="secondary"
                hasTabularNumbers
                style={styles.timecode}>
                {SEQUENCE_TIMECODE} · {FPS} fps
              </Text>
            )}
          </HStack>
        </StackItem>
        <HStack gap={2} vAlign="center">
          <StatusDot
            variant={tally.failed > 0 ? 'error' : 'accent'}
            label={
              tally.failed > 0 ? 'Queue has a failed job' : 'Queue active'
            }
            isPulsing={tally.rendering > 0 && !isQueuePaused}
          />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {tally.rendering} rendering · {tally.queued} queued ·{' '}
            {tally.failed} failed
          </Text>
        </HStack>
        <Button
          label="Add to Queue"
          variant="primary"
          size="sm"
          icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
          onClick={addToQueue}
        />
      </HStack>
    </LayoutHeader>
  );

  // ----- Presets section -----
  const presetsSection = (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Heading level={2}>Export preset</Heading>
        </StackItem>
        {isModified && <Badge label="Custom — modified" variant="warning" />}
      </HStack>
      <div style={isCompact ? styles.presetGridCompact : styles.presetGrid}>
        {PRESETS.map(preset => (
          <PresetCard
            key={preset.id}
            preset={preset}
            isSelected={preset.id === selectedPresetId && !isModified}
            onSelect={selectPreset}
          />
        ))}
      </div>
    </VStack>
  );

  // ----- Custom settings accordion -----
  const settingsAccordion = (
    <Card padding={4}>
      <Collapsible
        defaultIsOpen
        trigger={
          <HStack gap={2} vAlign="center">
            <Icon icon={Settings2Icon} size="sm" color="secondary" />
            <Text type="body" weight="semibold">
              Custom settings
            </Text>
            <Text type="supporting" color="secondary">
              {isAudioOnly
                ? \`\${settings.codec} · audio only\`
                : \`\${settings.codec.split(' — ')[0]} · \${settings.resolution.split(' (')[0]} · \${settings.videoMbps} Mbps\`}
            </Text>
          </HStack>
        }>
        <VStack gap={4}>
          <HStack gap={3} style={{flexWrap: 'wrap', rowGap: 'var(--spacing-3)'}}>
            <Selector
              label="Format"
              options={FORMAT_OPTIONS}
              value={settings.format}
              onChange={value => patchSettings({format: value})}
              size="sm"
              width={190}
            />
            <Selector
              label="Codec"
              options={CODEC_OPTIONS}
              value={settings.codec}
              onChange={value => patchSettings({codec: value})}
              size="sm"
              width={220}
            />
            <Selector
              label="Resolution"
              options={RESOLUTION_OPTIONS}
              value={settings.resolution}
              onChange={value => patchSettings({resolution: value})}
              size="sm"
              width={190}
            />
            <Selector
              label="Frame rate"
              options={FRAME_RATE_OPTIONS}
              value={settings.frameRate}
              onChange={value => patchSettings({frameRate: value})}
              size="sm"
              width={120}
            />
          </HStack>
          <Divider />
          <HStack
            gap={5}
            vAlign="start"
            style={{flexWrap: 'wrap', rowGap: 'var(--spacing-3)'}}>
            <VStack gap={2}>
              <Text type="label" color="secondary">
                Bitrate mode
              </Text>
              <SegmentedControl
                value={settings.bitrateMode}
                onChange={value =>
                  patchSettings({bitrateMode: value as BitrateMode})
                }
                label="Bitrate encoding mode"
                size="sm"
                isDisabled={isAudioOnly}>
                <SegmentedControlItem value="cbr" label="CBR" />
                <SegmentedControlItem value="vbr1" label="VBR-1" />
                <SegmentedControlItem value="vbr2" label="VBR-2" />
              </SegmentedControl>
              <Text type="supporting" color="secondary">
                {settings.bitrateMode === 'cbr'
                  ? 'Constant rate — predictable size, best for masters.'
                  : settings.bitrateMode === 'vbr1'
                    ? 'Single pass — fastest encode, good for reviews.'
                    : 'Two passes — best quality per bit for uploads.'}
              </Text>
            </VStack>
            <StackItem size="fill">
              <VStack gap={2}>
                <Slider
                  label="Target bitrate"
                  value={settings.videoMbps}
                  min={0}
                  max={720}
                  step={1}
                  isDisabled={isAudioOnly}
                  valueDisplay="text"
                  formatValue={v => \`\${v} Mbps\`}
                  onChange={(v: number) => patchSettings({videoMbps: v})}
                />
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  Audio: {settings.audio} · {settings.audioKbps} kbps
                </Text>
              </VStack>
            </StackItem>
          </HStack>
        </VStack>
      </Collapsible>
    </Card>
  );

  // ----- Destination section -----
  const destinationSection = (
    <Card padding={4}>
      <VStack gap={3}>
        <Heading level={2}>Destination</Heading>
        <HStack gap={3} vAlign="end" style={styles.destinationRow}>
          <Selector
            label="Save to"
            options={DESTINATION_OPTIONS}
            value={destinationId}
            onChange={value => setDestinationId(value)}
            size="sm"
            width={250}
            startIcon={destination.icon}
          />
          <StackItem size="fill">
            <TextInput
              label="Filename"
              description={\`Extension \${extension} comes from the container format.\`}
              value={filename}
              onChange={setFilename}
              size="sm"
            />
          </StackItem>
          <Button
            label="Browse…"
            variant="secondary"
            size="sm"
            icon={<Icon icon={FolderOpenIcon} size="sm" color="inherit" />}
            onClick={() => {}}
          />
        </HStack>
        <HStack gap={2} vAlign="center" style={{flexWrap: 'wrap', rowGap: 4}}>
          <Icon icon={destination.icon} size="sm" color="secondary" />
          <span style={styles.pathReadout}>
            {destination.path}/{outputName}
          </span>
          <StackItem size="fill">
            <span />
          </StackItem>
          <Text type="supporting" color="secondary">
            {destination.freeLabel}
          </Text>
        </HStack>
        <Divider />
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <VStack gap={0}>
              <Text type="body">Upload to Frame.io after encode</Text>
              <Text type="supporting" color="secondary">
                Sends the finished file to the Harbor Light delivery folder
                for client review.
              </Text>
            </VStack>
          </StackItem>
          <Switch
            label="Upload to Frame.io after encode"
            isLabelHidden
            value={addAfterEncode}
            onChange={setAddAfterEncode}
          />
        </HStack>
      </VStack>
    </Card>
  );

  // <=1160px: the summary panel is gone — keep the size estimate on the
  // page as an inline readout so the number never disappears.
  const inlineEstimate = isNarrow ? (
    <Card padding={3} variant="muted">
      <HStack gap={3} vAlign="center" style={{flexWrap: 'wrap', rowGap: 4}}>
        <Icon icon={ClockIcon} size="sm" color="secondary" />
        <Text type="supporting" hasTabularNumbers>
          Estimated file: <strong>{formatSizeGB(estSizeGB)}</strong> · encode ≈{' '}
          {formatDuration(estEncodeSec)}
        </Text>
        {exceedsFreeSpace && (
          <Badge label="Exceeds free space" variant="error" />
        )}
      </HStack>
    </Card>
  ) : null;

  // ----- Export summary panel (320px, sticky) -----
  const summaryPanel = !isNarrow ? (
    <LayoutPanel
      width={SUMMARY_PANEL_W}
      padding={0}
      hasDivider
      label="Export summary">
      <div style={styles.summarySticky}>
        <VStack gap={3}>
          <Card padding={4}>
            <VStack gap={3}>
              <HStack gap={2} vAlign="center">
                <StackItem size="fill">
                  <Heading level={2}>Export summary</Heading>
                </StackItem>
                <Badge
                  label={isModified ? 'Custom' : activePreset.name}
                  variant={isModified ? 'warning' : 'info'}
                />
              </HStack>
              <VStack gap={2}>
                <SummaryRow label="Container" value={settings.format} />
                <SummaryRow label="Codec" value={settings.codec} />
                <SummaryRow
                  label="Frame size"
                  value={settings.resolution.split(' (')[0]}
                  isMono
                />
                <SummaryRow
                  label="Frame rate"
                  value={
                    settings.frameRate === '—'
                      ? '—'
                      : \`\${settings.frameRate} fps\`
                  }
                  isMono
                />
                <SummaryRow
                  label="Bitrate"
                  value={
                    isAudioOnly
                      ? \`\${settings.audioKbps} kbps PCM\`
                      : \`\${settings.videoMbps} Mbps \${BITRATE_MODE_LABEL[settings.bitrateMode]}\`
                  }
                  isMono
                />
                <SummaryRow label="Audio" value={settings.audio} />
              </VStack>
              <Divider />
              <VStack gap={2}>
                <SummaryRow
                  label="Duration"
                  value={SEQUENCE_TIMECODE}
                  isMono
                />
                <SummaryRow
                  label="Estimated size"
                  value={formatSizeGB(estSizeGB)}
                  isMono
                />
                <SummaryRow
                  label="Encode time"
                  value={\`≈ \${formatDuration(estEncodeSec)}\`}
                  isMono
                />
              </VStack>
              {exceedsFreeSpace && (
                <HStack gap={2} vAlign="start">
                  <Icon icon={TriangleAlertIcon} size="sm" color="error" />
                  <Text type="supporting" style={styles.errorText}>
                    Estimated size exceeds the {formatSizeGB(freeGB)} free on
                    this volume. Pick another destination before queueing.
                  </Text>
                </HStack>
              )}
              <Button
                label="Add to Queue"
                variant="primary"
                icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
                onClick={addToQueue}
              />
            </VStack>
          </Card>
          <Card padding={3} variant="muted">
            <VStack gap={1}>
              <Text type="label" color="secondary">
                Output
              </Text>
              <Text type="supporting" style={styles.mono} maxLines={2}>
                {destination.path}/{outputName}
              </Text>
              <Text type="supporting" color="secondary">
                {addAfterEncode
                  ? 'Will upload to Frame.io when the encode completes.'
                  : 'Local export only — no upload step.'}
              </Text>
            </VStack>
          </Card>
        </VStack>
      </div>
    </LayoutPanel>
  ) : undefined;

  // ----- Content column -----
  const content = (
    <LayoutContent padding={0}>
      <div style={styles.contentScroll}>
        <div style={styles.contentColumn}>
          <VStack gap={5}>
            {presetsSection}
            {settingsAccordion}
            {destinationSection}
            {inlineEstimate}
          </VStack>
        </div>
      </div>
    </LayoutContent>
  );

  // ----- Render queue dock (320px) -----
  const queueToolbar = (
    <Toolbar
      label="Render queue controls"
      size="sm"
      gap={1}
      dividers={['bottom']}
      startContent={
        <>
          <Text type="body" weight="semibold">
            Render queue
          </Text>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {jobs.length} jobs · {tally.done} done · {tally.failed} failed
          </Text>
        </>
      }
      endContent={
        <>
          {!isCompact && (
            <HStack gap={2} vAlign="center">
              <Text type="supporting" color="secondary">
                GPU encode
              </Text>
              <Switch
                label="Encode on GPU"
                isLabelHidden
                value={useGpuEncode}
                onChange={setUseGpuEncode}
              />
            </HStack>
          )}
          <Button
            label="Clear finished"
            variant="ghost"
            size="sm"
            isDisabled={tally.done === 0}
            onClick={clearFinished}
          />
          <ToggleButton
            label={isQueuePaused ? 'Resume queue' : 'Pause queue'}
            size="sm"
            isPressed={isQueuePaused}
            onPressedChange={setIsQueuePaused}
            icon={<Icon icon={PauseIcon} size="sm" color="inherit" />}
            pressedIcon={<Icon icon={PlayIcon} size="sm" color="inherit" />}>
            {isQueuePaused ? 'Resume' : 'Pause'}
          </ToggleButton>
        </>
      }
    />
  );

  const queueTableHeader = (
    <TableHeader>
      <TableRow isHeaderRow>
        <TableHeaderCell style={{width: 240, minWidth: 240}}>
          Output file
        </TableHeaderCell>
        {!isCompact && (
          <TableHeaderCell style={{width: 196, minWidth: 196}}>
            Preset
          </TableHeaderCell>
        )}
        <TableHeaderCell style={{width: 110, minWidth: 110}}>
          Status
        </TableHeaderCell>
        {/* Proportional column soaks up spare width; footgun 4 gives every
            fixed column both width and minWidth. Fixed + min widths total
            ~1006px so the Actions column never clips at the 1440px stage. */}
        <TableHeaderCell style={{minWidth: 180}}>Progress</TableHeaderCell>
        <TableHeaderCell
          style={{...styles.numericCell, width: 110, minWidth: 110}}>
          ETA
        </TableHeaderCell>
        {!isCompact && (
          <TableHeaderCell
            style={{...styles.numericCell, width: 100, minWidth: 100}}>
            Size
          </TableHeaderCell>
        )}
        <TableHeaderCell style={{width: 96, minWidth: 96}}>
          <span style={{position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)'}}>
            Actions
          </span>
        </TableHeaderCell>
      </TableRow>
    </TableHeader>
  );

  const queueRows = jobs.map(job => {
    // A paused queue holds the actively rendering job without touching
    // per-job state; per-job pause still wins for its own row.
    const effectiveStatus: JobStatus =
      isQueuePaused && job.status === 'rendering' ? 'paused' : job.status;
    const meta = STATUS_META[effectiveStatus];
    const isActive = job.status === 'rendering' || job.status === 'paused';
    return [
      <TableRow key={job.id}>
        <TableCell>
          <VStack gap={0}>
            <Text type="supporting" weight="semibold" maxLines={1} style={styles.mono}>
              {job.filename}
            </Text>
            <Text type="supporting" color="secondary" maxLines={1}>
              {isQueuePaused && job.status === 'rendering'
                ? 'Queue paused'
                : job.note}
            </Text>
          </VStack>
        </TableCell>
        {!isCompact && (
          <TableCell>
            <VStack gap={0}>
              <Text type="supporting" maxLines={1}>
                {job.presetName}
              </Text>
              <Text type="supporting" color="secondary" maxLines={1}>
                {job.codecLine}
              </Text>
            </VStack>
          </TableCell>
        )}
        <TableCell>
          <Badge label={meta.label} variant={meta.badge} />
        </TableCell>
        <TableCell>
          <div style={styles.progressCellInner}>
            <div style={styles.progressTrackFill}>
              <ProgressBar
                label={\`\${job.filename} render progress\`}
                isLabelHidden
                value={job.progressPct}
                max={100}
                variant={meta.bar}
              />
            </div>
            <Text
              type="supporting"
              color="secondary"
              hasTabularNumbers
              style={{width: 42, textAlign: 'end', flexShrink: 0}}>
              {job.progressPct}%
            </Text>
          </div>
        </TableCell>
        <TableCell style={styles.numericCell}>
          {/* Stack ETA over throughput so the two readouts never run
              together on one line. */}
          <VStack gap={0}>
            <Text type="supporting" hasTabularNumbers style={styles.timecode}>
              {effectiveStatus === 'rendering' && job.etaSec != null
                ? formatDuration(job.etaSec)
                : job.status === 'queued' && job.etaSec != null
                  ? \`≈ \${formatDuration(job.etaSec)}\`
                  : '—'}
            </Text>
            {effectiveStatus === 'rendering' && job.fps != null && (
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {job.fps.toFixed(1)} fps
              </Text>
            )}
          </VStack>
        </TableCell>
        {!isCompact && (
          <TableCell style={styles.numericCell}>
            <Text type="supporting" hasTabularNumbers>
              {job.status === 'done'
                ? formatSizeGB(job.sizeGB)
                : \`≈ \${formatSizeGB(job.sizeGB)}\`}
            </Text>
          </TableCell>
        )}
        <TableCell>
          <HStack gap={1} vAlign="center">
            {isActive && (
              <IconButton
                label={
                  job.status === 'paused'
                    ? \`Resume \${job.filename}\`
                    : \`Pause \${job.filename}\`
                }
                tooltip={job.status === 'paused' ? 'Resume' : 'Pause'}
                icon={
                  <Icon
                    icon={job.status === 'paused' ? PlayIcon : PauseIcon}
                    size="sm"
                    color="inherit"
                  />
                }
                variant="ghost"
                size="sm"
                onClick={() => toggleJobPause(job.id)}
              />
            )}
            {job.status === 'failed' && (
              <IconButton
                label={\`Retry \${job.filename}\`}
                tooltip="Retry render"
                icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
                variant="ghost"
                size="sm"
                onClick={() => retryJob(job.id)}
              />
            )}
            {job.status === 'done' && (
              <IconButton
                label={\`Reveal \${job.filename} in Finder\`}
                tooltip="Reveal in Finder"
                icon={<Icon icon={FolderOpenIcon} size="sm" color="inherit" />}
                variant="ghost"
                size="sm"
                onClick={() => {}}
              />
            )}
            <IconButton
              label={
                isActive
                  ? \`Cancel \${job.filename}\`
                  : \`Remove \${job.filename} from queue\`
              }
              tooltip={isActive ? 'Cancel render' : 'Remove'}
              icon={<Icon icon={XIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              onClick={() => removeJob(job.id)}
            />
          </HStack>
        </TableCell>
      </TableRow>,
      // Inline error band directly under the failed job — spans every
      // visible column (colSpan tracks the compact breakpoint).
      job.error != null ? (
        <TableRow key={\`\${job.id}-error\`}>
          <TableCell colSpan={columnCount} style={styles.errorCell}>
            <HStack gap={2} vAlign="center" style={{flexWrap: 'wrap', rowGap: 4}}>
              <Icon icon={TriangleAlertIcon} size="sm" color="error" />
              <StackItem size="fill">
                <Text type="supporting" style={styles.errorText}>
                  {job.error}
                </Text>
              </StackItem>
              <Button
                label="Retry render"
                variant="secondary"
                size="sm"
                icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
                onClick={() => retryJob(job.id)}
              />
            </HStack>
          </TableCell>
        </TableRow>
      ) : null,
    ];
  });

  const queueDock = (
    <LayoutFooter hasDivider height={DOCK_H} padding={0} label="Render queue">
      <div style={styles.dock}>
        {queueToolbar}
        <div style={styles.dockScroll}>
          <Table<Record<string, unknown>> density="compact" dividers="rows">
            {queueTableHeader}
            <TableBody>{queueRows}</TableBody>
          </Table>
        </div>
      </div>
    </LayoutFooter>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        content={content}
        end={summaryPanel}
        footer={queueDock}
      />
    </div>
  );
}
`;export{e as default};