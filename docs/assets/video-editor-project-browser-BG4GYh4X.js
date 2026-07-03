var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (five studio projects — the documentary
 *   'Harbor Light' plus 'Spring Launch', 'Alpine Trail Diaries', 'Night
 *   Market', and 'Studio Sessions Vol. 2' — each with a fixed SVG gradient
 *   poster motif, media size, collaborator roster, and per-sequence rows
 *   carrying name/resolution/fps/SMPTE duration/track counts/modified
 *   stamps; four new-project format presets; fixed scratch-drive and backup
 *   figures; no clocks, no Math.random, no network media)
 * @output Front-door project & sequence browser for an NLE suite: a 52px
 *   header (ClapperboardIcon + 'Astryx Studio' brand, project/sequence count
 *   readout, project search TextInput, primary New Project Button), a 300px
 *   left Open-recent rail (sequence rows with mono names and duration ·
 *   tracks · last-edit metadata), a scrolling content column with the
 *   defining region — a poster grid of project cards (16:9 inline-SVG
 *   gradient posters with per-project motifs, kind Badges, sequence/media
 *   readouts, collaborator AvatarGroups, inset accent ring on the open
 *   project) over a sequences Table for the open project (mono sequence
 *   names with StatusDots, resolution, right-aligned fps/duration/track
 *   columns, modified stamps, row-click selection) — plus a 48px
 *   storage/backup status strip (scratch-drive ProgressBar, last-backup
 *   StatusDot, auto-backup Switch) and a scrim New-Project Overlay whose
 *   panel offers name TextInput and format-preset SelectableCards (4K UHD
 *   24, HD 25, HD 29.97, Vertical 9:16 30) that append a real project card.
 * @position Page template; emitted by \`astryx template
 *   video-editor-project-browser\`
 *
 * Frame: root div at 100dvh wrapping Layout height="fill" (the demo stage
 * auto-heights, so the wrapper pins the frame — see
 * webhook-delivery-debugger). LayoutHeader carries brand + search + New
 * Project. LayoutPanel start 300 is the Open-recent rail (scrolls
 * independently). LayoutContent owns the page scroll: projects toolbar
 * (sort Selector, card-size Slider), poster grid (repeat auto-fill,
 * minmax(cardSize px, 1fr)), then the open project band and its sequences
 * Table. LayoutFooter is the 48px storage/backup strip. The front door of
 * the Video Studio suite — choose over video-editor-media-bin when the user
 * picks a project/sequence to open rather than browses source assets inside
 * one project, and over video-editor-workspace when nothing is on a
 * timeline yet.
 *
 * Responsive contract:
 * - >960px: header | recent rail 300 | content (fill) | footer 48.
 * - <=960px: the Open-recent rail drops out (its sequences stay reachable
 *   through the open project's table); the sequences table becomes a
 *   deliberate horizontal-scroll surface (the column grid keeps a 708px
 *   minWidth so numeric columns never truncate mid-token — the scroll
 *   container owns the overflow).
 * - <=768px: the header hides the project/sequence count readout, the
 *   projects toolbar hides the card-size Slider (grid falls back to 220px
 *   posters), and the footer keeps drive meter + backup dot but drops the
 *   auto-backup Switch. Header and toolbar rows wrap (flexWrap) instead of
 *   clipping.
 * - The New-Project Overlay panel is width-capped at 560px and scrolls
 *   internally below 640px of viewport height.
 *
 * Container policy (front-door browser archetype): frame-first rows and
 * panels for the rail, toolbars, and footer strip; the poster grid uses
 * genuine Card-like tiles (styled button surfaces, not design-system Cards,
 * so the whole tile is one click target) and SelectableCards only inside
 * the New-Project panel where the preset choice is a true radio-style
 * widget.
 *
 * Color policy: poster stages are deliberately scheme-locked dark
 * (colorScheme: 'dark' in \`styles.poster\`) — they stand in for graded
 * footage frames, which stay dark in both schemes, so each project's SVG
 * gradient stops, motif fills, and the bottom scrim/label literals are
 * intentional literals. Everything outside the posters is var(--color-*)
 * token-pure or an explicit light-dark() pair (kind-badge tints, the
 * dashed New-Project tile accent) whose dark side shifts to the lighter
 * 400-weight hue.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  ClapperboardIcon,
  CloudUploadIcon,
  FilmIcon,
  FolderOpenIcon,
  HardDriveIcon,
  PlusIcon,
  SearchIcon,
  UsersIcon,
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
import {Avatar} from '@astryxdesign/core/Avatar';
import {AvatarGroup, AvatarGroupOverflow} from '@astryxdesign/core/AvatarGroup';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Overlay} from '@astryxdesign/core/Overlay';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {SelectableCard} from '@astryxdesign/core/SelectableCard';
import {Selector} from '@astryxdesign/core/Selector';
import {Slider} from '@astryxdesign/core/Slider';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn, TablePlugin} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {MediaTheme, useTheme} from '@astryxdesign/core/theme';

// ============= STUDIO CONSTANTS =============

const STUDIO_NAME = 'Astryx Studio';
const MONO = 'var(--font-family-code, monospace)';
const DRIVE_TOTAL_GB = 2000; // 2 TB scratch drive, shared with the media bin
const DRIVE_USED_GB = 1284;
const LAST_BACKUP = 'Jul 3 · 06:00';
const INITIAL_OPEN_PROJECT = 'harbor-light';
const INITIAL_SELECTED_SEQUENCE = 'hl-fine-cut';

// ============= FIXTURES =============
// Fixed rosters, SMPTE durations, and modified stamps — no clocks, no
// randomness. Figures shared with sibling Video Studio templates stay
// consistent: 'harbor-light_rough-cut_v7' is 00:02:48:00 (the workspace
// sequence), 'harbor-light_final-cut_v12' is the export queue's 84-minute
// UHD master, and 'spring-launch-cut_v4' is the clip-timeline sequence.

type ProjectKind =
  | 'documentary'
  | 'commercial'
  | 'series'
  | 'short'
  | 'music'
  | 'draft'; // newly created projects before a kind is assigned
type PosterMotif = 'harbor' | 'beams' | 'ridge' | 'city' | 'meter' | 'blank';
type SequenceStatus = 'editing' | 'locked' | 'archived';
type SortKey = 'recent' | 'name' | 'size';

// Type alias (not interface) so Table's Record<string, unknown> row
// constraint is satisfied via the implicit index signature.
type Sequence = {
  id: string;
  name: string;
  resolution: string; // e.g. '3840 × 2160'
  fps: string; // display string, e.g. '24.00'
  duration: string; // SMPTE HH:MM:SS:FF at the sequence timebase
  videoTracks: number;
  audioTracks: number;
  modified: string; // fixed stamp, e.g. 'Jul 2 · 18:42'
  status: SequenceStatus;
};

interface Project {
  id: string;
  name: string;
  kind: ProjectKind;
  kindLabel: string;
  client: string;
  mediaGb: number;
  lastOpened: string; // fixed stamp for the card meta row
  recencyRank: number; // 1 = most recently opened; drives the default sort
  motif: PosterMotif;
  /** Poster gradient stops — intentional literals on a scheme-locked
   * dark stage (see the header Color policy). */
  posterFrom: string;
  posterMid: string;
  posterTo: string;
  collaborators: string[];
  sequences: Sequence[];
}

// Compact row builder keeps the fixture block scannable. Order: id, name,
// resolution, fps, SMPTE duration, V tracks, A tracks, modified, status.
const seq = (
  id: string, name: string, resolution: string, fps: string,
  duration: string, videoTracks: number, audioTracks: number,
  modified: string, status: SequenceStatus = 'editing',
): Sequence => ({
  id, name, resolution, fps, duration, videoTracks, audioTracks,
  modified, status,
});

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'harbor-light',
    name: 'Harbor Light',
    kind: 'documentary',
    kindLabel: 'Documentary',
    client: 'Meridian Films',
    mediaGb: 612,
    lastOpened: 'Today · 09:12',
    recencyRank: 1,
    motif: 'harbor',
    posterFrom: '#0B2233',
    posterMid: '#155A78',
    posterTo: '#0E3550',
    collaborators: [
      'Mara Ellison',
      'Theo Okafor',
      'June Park',
      'Sam Whitaker',
      'Iris Delacroix',
    ],
    sequences: [
      seq('hl-final-cut', 'harbor-light_final-cut_v12', '3840 × 2160', '24.00', '01:24:36:12', 4, 8, 'Jul 1 · 17:20', 'locked'),
      seq('hl-fine-cut', 'harbor-light_fine-cut_v7', '3840 × 2160', '24.00', '01:26:02:11', 4, 6, 'Jul 2 · 18:42'),
      seq('hl-rough-cut', 'harbor-light_rough-cut_v7', '3840 × 2160', '24.00', '00:02:48:00', 2, 2, 'Jul 2 · 11:05'),
      seq('hl-teaser', 'harbor-light_teaser_socials', '1080 × 1920', '30.00', '00:00:45:00', 2, 2, 'Jun 24 · 15:31'),
    ],
  },
  {
    id: 'spring-launch',
    name: 'Spring Launch',
    kind: 'commercial',
    kindLabel: 'Commercial',
    client: 'Northwind Retail',
    mediaGb: 148,
    lastOpened: 'Yesterday · 16:48',
    recencyRank: 2,
    motif: 'beams',
    posterFrom: '#241344',
    posterMid: '#6D28D9',
    posterTo: '#3B1D77',
    collaborators: ['Priya Nair', 'Mara Ellison'],
    sequences: [
      seq('sl-cut-v4', 'spring-launch-cut_v4', '1920 × 1080', '24.00', '00:01:32:00', 2, 2, 'Jul 2 · 16:48'),
      seq('sl-bumper', 'spring-launch_15s_bumper', '1920 × 1080', '24.00', '00:00:15:00', 2, 1, 'Jun 30 · 10:14'),
    ],
  },
  {
    id: 'alpine-trail',
    name: 'Alpine Trail Diaries',
    kind: 'series',
    kindLabel: 'Series',
    client: 'Summitline Media',
    mediaGb: 421,
    lastOpened: 'Jun 27 · 14:03',
    recencyRank: 3,
    motif: 'ridge',
    posterFrom: '#122B22',
    posterMid: '#1F6A4A',
    posterTo: '#0D3B2E',
    collaborators: ['Theo Okafor', 'Lena Marsh', 'Ravi Chandrasekhar'],
    sequences: [
      seq('at-ep01', 'alpine-trail_ep01_locked', '3840 × 2160', '25.00', '00:22:14:16', 3, 6, 'Jun 12 · 09:40', 'locked'),
      seq('at-ep02', 'alpine-trail_ep02_fine-cut', '3840 × 2160', '25.00', '00:23:41:03', 3, 6, 'Jun 27 · 14:03'),
      seq('at-ep03', 'alpine-trail_ep03_assembly', '3840 × 2160', '25.00', '00:31:07:22', 2, 4, 'Jun 26 · 17:55'),
    ],
  },
  {
    id: 'night-market',
    name: 'Night Market',
    kind: 'short',
    kindLabel: 'Short film',
    client: 'Independent',
    mediaGb: 96,
    lastOpened: 'Jun 19 · 20:26',
    recencyRank: 4,
    motif: 'city',
    posterFrom: '#26102E',
    posterMid: '#9D2463',
    posterTo: '#3A1140',
    collaborators: ['June Park', 'Iris Delacroix'],
    sequences: [
      seq('nm-cut-v2', 'night-market_cut_v2', '1920 × 1080', '23.98', '00:11:26:07', 2, 4, 'Jun 19 · 20:26'),
      seq('nm-festival', 'night-market_fest_master', '1920 × 1080', '23.98', '00:11:24:00', 2, 4, 'Jun 3 · 12:12', 'archived'),
    ],
  },
  {
    id: 'studio-sessions',
    name: 'Studio Sessions Vol. 2',
    kind: 'music',
    kindLabel: 'Music',
    client: 'Bluewire Records',
    mediaGb: 233,
    lastOpened: 'Jun 8 · 11:37',
    recencyRank: 5,
    motif: 'meter',
    posterFrom: '#141243',
    posterMid: '#2563EB',
    posterTo: '#101A4A',
    collaborators: ['Sam Whitaker', 'Priya Nair', 'Lena Marsh', 'Devon Aoki'],
    sequences: [
      seq('ss-take3', 'studio-sessions_take3_mix', '1920 × 1080', '24.00', '00:04:18:12', 2, 8, 'Jun 8 · 11:37'),
      seq('ss-livecut', 'studio-sessions_multicam', '1920 × 1080', '24.00', '00:42:55:04', 4, 8, 'Jun 5 · 19:02'),
      seq('ss-loop', 'studio-sessions_viz_loop', '1080 × 1080', '30.00', '00:00:30:00', 1, 1, 'May 28 · 16:44', 'archived'),
    ],
  },
];

/** Open-recent rail entries reference real project/sequence ids so the
 * duration · tracks · last-edit metadata always matches the table. */
const RECENT_REFS: {projectId: string; sequenceId: string}[] = [
  {projectId: 'harbor-light', sequenceId: 'hl-fine-cut'},
  {projectId: 'harbor-light', sequenceId: 'hl-rough-cut'},
  {projectId: 'spring-launch', sequenceId: 'sl-cut-v4'},
  {projectId: 'harbor-light', sequenceId: 'hl-final-cut'},
  {projectId: 'alpine-trail', sequenceId: 'at-ep02'},
  {projectId: 'night-market', sequenceId: 'nm-cut-v2'},
  {projectId: 'studio-sessions', sequenceId: 'ss-take3'},
];

// ---- New-project format presets ----

interface FormatPreset {
  id: string;
  label: string;
  resolution: string;
  fps: string;
  aspect: string; // e.g. '16:9'
  use: string;
  /** Mini aspect-chip proportions (px inside a 44×28 box). */
  chipW: number;
  chipH: number;
}

const FORMAT_PRESETS: FormatPreset[] = [
  {id: 'uhd-24', label: '4K UHD · 24', resolution: '3840 × 2160', fps: '24.00', aspect: '16:9', use: 'Doc & film masters', chipW: 42, chipH: 24},
  {id: 'hd-25', label: 'HD 1080p · 25', resolution: '1920 × 1080', fps: '25.00', aspect: '16:9', use: 'Broadcast PAL delivery', chipW: 42, chipH: 24},
  {id: 'hd-2997', label: 'HD 1080p · 29.97', resolution: '1920 × 1080', fps: '29.97', aspect: '16:9', use: 'Broadcast NTSC delivery', chipW: 42, chipH: 24},
  {id: 'vert-30', label: 'Vertical · 30', resolution: '1080 × 1920', fps: '30.00', aspect: '9:16', use: 'Social teasers & shorts', chipW: 15, chipH: 26},
];

const SORT_OPTIONS: {value: SortKey; label: string}[] = [
  {value: 'recent', label: 'Recently opened'},
  {value: 'name', label: 'Name A–Z'},
  {value: 'size', label: 'Media size'},
];

const KIND_BADGE_VARIANT: Record<
  ProjectKind,
  'info' | 'success' | 'warning' | 'neutral' | 'error'
> = {
  documentary: 'info', commercial: 'warning', series: 'success',
  short: 'error', music: 'neutral', draft: 'neutral',
};

const STATUS_META: Record<
  SequenceStatus,
  {label: string; dot: 'success' | 'accent' | 'neutral'}
> = {
  editing: {label: 'Editing', dot: 'success'},
  locked: {label: 'Locked', dot: 'accent'},
  archived: {label: 'Archived', dot: 'neutral'},
};

/** 'Mara Ellison' -> 'mara-ellison' for slug-ish generated sequence names. */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatGb(gb: number): string {
  return gb >= 1000 ? \`\${(gb / 1000).toFixed(2)} TB\` : \`\${Math.round(gb)} GB\`;
}

/** '01:24:36:12' -> '1h 24m' / '00:02:48:00' -> '2m 48s' for compact meta. */
function formatDurationShort(smpte: string): string {
  const [hh, mm, ss] = smpte.split(':').map(Number);
  if (hh > 0) {
    return \`\${hh}h \${String(mm).padStart(2, '0')}m\`;
  }
  if (mm > 0) {
    return \`\${mm}m \${String(ss).padStart(2, '0')}s\`;
  }
  return \`\${ss}s\`;
}

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Demo stage auto-heights; the wrapper pins the frame at 100dvh so the
  // rail and content scroll independently (see webhook-delivery-debugger).
  root: {height: '100dvh', width: '100%'},
  mono: {fontFamily: MONO},
  // Header controls wrap onto a second row instead of clipping.
  headerRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-2)'},
  // ---- Open-recent rail ----
  railScroll: {height: '100%', overflowY: 'auto', padding: 'var(--spacing-3)'},
  recentRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    width: '100%',
    padding: 'var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    font: 'inherit',
    color: 'inherit',
  },
  recentRowActive: {
    backgroundColor: 'var(--color-accent-muted)',
    // Inset ring stays inside the row so it never bleeds onto neighbors.
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
  },
  recentName: {
    fontFamily: MONO,
    fontSize: 12,
    lineHeight: '16px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  recentIconWell: {
    width: 28,
    height: 28,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // ---- Content column ----
  contentScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-5)',
    backgroundColor: 'var(--color-background-muted)',
  },
  contentColumn: {width: '100%', maxWidth: 1160, marginInline: 'auto'},
  toolbarRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-2)'},
  // Poster grid: column floor comes from the card-size Slider.
  projectGrid: {display: 'grid', gap: 'var(--spacing-4)'},
  projectCard: {
    position: 'relative', // anchors the open-project ring overlay
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
    cursor: 'pointer',
    textAlign: 'left',
    font: 'inherit',
    color: 'inherit',
    boxShadow: 'var(--shadow-low, none)',
  },
  projectCardOpen: {
    borderColor: 'var(--color-accent)',
  },
  // Inset accent ring marks the open project without shifting layout. It
  // lives on an overlay span painted after the poster/body children — an
  // inset box-shadow on the card itself would be covered by the poster,
  // leaving the ring thick around the body but invisible over the stage.
  projectCardRing: {
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    boxShadow: 'inset 0 0 0 2px var(--color-accent)',
    pointerEvents: 'none',
  },
  projectCardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
  },
  // New-project tile: dashed affordance, same footprint as a card.
  newProjectTile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-2)',
    minHeight: 220,
    borderRadius: 'var(--radius-container)',
    border: '2px dashed light-dark(#94A3B8, #475569)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
  },
  // ---- Poster stage (scheme-locked dark; see header Color policy) ----
  poster: {
    position: 'relative',
    aspectRatio: '16 / 9',
    overflow: 'hidden',
    colorScheme: 'dark',
    backgroundColor: '#0B1120',
  },
  posterSvg: {display: 'block', width: '100%', height: '100%'},
  posterScrim: {
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '14px 10px 6px',
    background: 'linear-gradient(180deg, rgba(2, 6, 23, 0) 0%, rgba(2, 6, 23, 0.72) 100%)',
  },
  posterScrimText: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: '0.04em',
    color: 'rgba(226, 232, 240, 0.85)',
    whiteSpace: 'nowrap',
  },
  // ---- Open project band + sequences table ----
  sequencesPanel: {
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
  },
  sequencesHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    flexWrap: 'wrap',
    rowGap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  // Below ~708px of panel width the table scrolls horizontally; the 708px
  // floor keeps every column intact (never truncate mid-token).
  tableScroll: {overflowX: 'auto'},
  tableMinWidth: {minWidth: 708},
  numCell: {
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    textAlign: 'end',
    display: 'block',
    width: '100%',
  },
  // ---- Storage/backup footer strip ----
  footerRow: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-4)',
    paddingInline: 'var(--spacing-3)',
    overflow: 'hidden',
  },
  footerMeterWrap: {width: 180, flexShrink: 0},
  // ---- New-project overlay panel ----
  // Pins the Overlay's fill layer to the 100dvh root — without it the layer
  // grows to the demo stage's document height and the panel centers below
  // the fold (same idiom as command-palette-launcher's styles.overlay).
  overlay: {display: 'block', height: '100%', width: '100%'},
  overlayViewport: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: 'var(--spacing-4)',
  },
  newProjectPanel: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '100%',
    overflowY: 'auto',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-high)',
    padding: 'var(--spacing-4)',
  },
  presetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 'var(--spacing-2)',
  },
  // Mini aspect chip inside a fixed 44×28 well so 16:9 / 9:16 / 1:1 read
  // at a glance; accent pair shifts to the 400-weight hue on dark.
  aspectChipWell: {
    width: 44,
    height: 28,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aspectChip: {
    borderRadius: 2,
    border: '1.5px solid light-dark(#0171E3, #4C9EFF)',
    backgroundColor: 'light-dark(rgba(1, 113, 227, 0.12), rgba(76, 158, 255, 0.16))',
  },
};

// ============= POSTER =============

/** Deterministic bar heights for the 'city' and 'meter' motifs (SVG units
 * in a 160×90 viewBox); fixed fixtures, not randomness. */
const CITY_BARS = [22, 34, 18, 40, 27, 45, 20, 36, 30, 48, 24, 38];
const METER_BARS = [18, 30, 42, 55, 38, 61, 47, 33, 52, 40, 26, 44, 58, 35, 21];

/** Motif overlays draw on top of the gradient with translucent literals —
 * the poster stage is scheme-locked dark, so these never flip. */
function PosterMotifShapes({motif}: {motif: PosterMotif}) {
  switch (motif) {
    case 'harbor':
      return (
        <g>
          <circle cx={116} cy={30} r={13} fill="rgba(252, 211, 77, 0.5)" />
          <rect x={0} y={54} width={160} height={36} fill="rgba(2, 6, 23, 0.35)" />
          <path d="M0 54 H160" stroke="rgba(226, 232, 240, 0.35)" strokeWidth={0.8} />
          <path d="M8 64 Q20 61 32 64 T56 64 T80 64 T104 64 T128 64 T152 64" stroke="rgba(148, 197, 222, 0.4)" strokeWidth={1.2} fill="none" />
          <path d="M16 74 Q28 71 40 74 T64 74 T88 74 T112 74 T136 74" stroke="rgba(148, 197, 222, 0.28)" strokeWidth={1.2} fill="none" />
          <path d="M112 54 V38 M112 38 L104 46 H112" stroke="rgba(226, 232, 240, 0.55)" strokeWidth={1.2} fill="none" />
        </g>
      );
    case 'beams':
      return (
        <g>
          <polygon points="0,90 42,0 74,0 22,90" fill="rgba(196, 181, 253, 0.22)" />
          <polygon points="52,90 98,0 118,0 66,90" fill="rgba(233, 213, 255, 0.16)" />
          <polygon points="96,90 138,0 160,0 160,14 112,90" fill="rgba(167, 139, 250, 0.2)" />
          <circle cx={30} cy={22} r={3} fill="rgba(250, 245, 255, 0.6)" />
          <circle cx={128} cy={64} r={2} fill="rgba(250, 245, 255, 0.45)" />
        </g>
      );
    case 'ridge':
      return (
        <g>
          <polygon points="0,90 34,34 62,66 92,22 126,58 160,36 160,90" fill="rgba(2, 6, 23, 0.4)" />
          <polygon points="0,90 26,58 54,78 88,44 122,74 160,54 160,90" fill="rgba(134, 239, 172, 0.18)" />
          <circle cx={36} cy={16} r={8} fill="rgba(226, 232, 240, 0.35)" />
          <path d="M88 44 L92 22 L98 40" stroke="rgba(226, 232, 240, 0.4)" strokeWidth={1} fill="none" />
        </g>
      );
    case 'city':
      return (
        <g>
          {CITY_BARS.map((h, i) => (
            <rect
              // Fixed fixture array — index keys are stable.
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              x={4 + i * 13}
              y={90 - h}
              width={9}
              height={h}
              fill={i % 3 === 0 ? 'rgba(251, 207, 232, 0.3)' : 'rgba(2, 6, 23, 0.45)'}
            />
          ))}
          <circle cx={26} cy={20} r={5} fill="rgba(253, 224, 71, 0.5)" />
          <circle cx={92} cy={14} r={2.5} fill="rgba(251, 207, 232, 0.55)" />
        </g>
      );
    case 'meter':
      return (
        <g>
          {METER_BARS.map((h, i) => (
            <rect
              // Fixed fixture array — index keys are stable.
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              x={6 + i * 10}
              y={(90 - h) / 2 + 12}
              width={6}
              height={h}
              rx={2}
              fill="rgba(147, 197, 253, 0.38)"
            />
          ))}
          <path d="M6 57 H150" stroke="rgba(226, 232, 240, 0.25)" strokeWidth={0.8} />
        </g>
      );
    case 'blank':
      return (
        <g>
          <path d="M0 30 H160 M0 60 H160 M53 0 V90 M107 0 V90" stroke="rgba(148, 163, 184, 0.14)" strokeWidth={0.8} />
          <circle cx={80} cy={45} r={14} fill="none" stroke="rgba(226, 232, 240, 0.3)" strokeWidth={1.4} />
          <polygon points="76,39 88,45 76,51" fill="rgba(226, 232, 240, 0.4)" />
        </g>
      );
  }
}

/** 16:9 SVG gradient poster — a styled stand-in for a graded frame; the
 * gradient id is namespaced per project so defs never collide. */
function ProjectPoster({project}: {project: Project}) {
  const gradId = \`vpb-poster-\${project.id}\`;
  return (
    <div style={styles.poster} aria-hidden>
      <svg
        style={styles.posterSvg}
        viewBox="0 0 160 90"
        preserveAspectRatio="xMidYMid slice"
        role="presentation"
        focusable="false">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={project.posterFrom} />
            <stop offset="55%" stopColor={project.posterMid} />
            <stop offset="100%" stopColor={project.posterTo} />
          </linearGradient>
        </defs>
        <rect width={160} height={90} fill={\`url(#\${gradId})\`} />
        <PosterMotifShapes motif={project.motif} />
      </svg>
      <div style={styles.posterScrim}>
        <span style={styles.posterScrimText}>
          {project.sequences.length}{' '}
          {project.sequences.length === 1 ? 'sequence' : 'sequences'}
        </span>
        <span style={{...styles.posterScrimText, marginLeft: 'auto'}}>
          {formatGb(project.mediaGb)}
        </span>
      </div>
    </div>
  );
}

// ============= PROJECT CARD =============

function ProjectCard({
  project,
  isOpen,
  onOpen,
}: {
  project: Project;
  isOpen: boolean;
  onOpen: (projectId: string) => void;
}) {
  const cardStyle: CSSProperties = isOpen
    ? {...styles.projectCard, ...styles.projectCardOpen}
    : styles.projectCard;
  const shown = project.collaborators.slice(0, 3);
  const overflow = project.collaborators.length - shown.length;
  return (
    <button
      type="button"
      style={cardStyle}
      aria-pressed={isOpen}
      aria-label={\`Open project \${project.name}, \${project.kindLabel}, \${project.sequences.length} sequences\`}
      onClick={() => onOpen(project.id)}>
      <ProjectPoster project={project} />
      <span style={styles.projectCardBody}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill" style={{minWidth: 0}}>
            <Text type="body" weight="semibold" maxLines={1}>
              {project.name}
            </Text>
          </StackItem>
          <Badge
            label={project.kindLabel}
            variant={KIND_BADGE_VARIANT[project.kind]}
          />
        </HStack>
        <Text type="supporting" color="secondary" maxLines={1}>
          {project.client} · opened {project.lastOpened}
        </Text>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <AvatarGroup size="xsmall">
              {shown.map(name => (
                <Avatar key={name} name={name} size="xsmall" />
              ))}
              {overflow > 0 ? <AvatarGroupOverflow count={overflow} /> : null}
            </AvatarGroup>
          </StackItem>
          {isOpen ? (
            <HStack gap={1} vAlign="center">
              <Icon icon={FolderOpenIcon} size="sm" color="accent" />
              <Text type="supporting" color="accent" weight="semibold">
                Open
              </Text>
            </HStack>
          ) : null}
        </HStack>
      </span>
      {isOpen ? <span style={styles.projectCardRing} aria-hidden /> : null}
    </button>
  );
}

// ============= OPEN-RECENT ROW =============

interface RecentEntry {
  project: Project;
  sequence: Sequence;
}

function RecentRow({
  entry,
  isActive,
  onSelect,
}: {
  entry: RecentEntry;
  isActive: boolean;
  onSelect: (projectId: string, sequenceId: string) => void;
}) {
  const {project, sequence} = entry;
  const rowStyle: CSSProperties = isActive
    ? {...styles.recentRow, ...styles.recentRowActive}
    : styles.recentRow;
  const tracksLabel = \`\${sequence.videoTracks}V · \${sequence.audioTracks}A\`;
  return (
    <button
      type="button"
      style={rowStyle}
      aria-pressed={isActive}
      aria-label={\`Open \${sequence.name} in \${project.name}\`}
      onClick={() => onSelect(project.id, sequence.id)}>
      <span style={styles.recentIconWell}>
        <Icon icon={FilmIcon} size="sm" color="secondary" />
      </span>
      <span style={{minWidth: 0, flex: 1}}>
        <VStack gap={0.5}>
          <span style={styles.recentName}>{sequence.name}</span>
          <Text type="supporting" color="secondary" maxLines={1}>
            {project.name} · {formatDurationShort(sequence.duration)} ·{' '}
            {tracksLabel}
          </Text>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            Edited {sequence.modified}
          </Text>
        </VStack>
      </span>
    </button>
  );
}

// ============= NEW-PROJECT PANEL =============

/** Modal-style card inside the scrim Overlay: name field + format-preset
 * SelectableCards. Rendered under MediaTheme so it follows the page scheme
 * (the dark scrim would otherwise flip it into media-dark). */
function NewProjectPanel({
  name,
  presetId,
  onNameChange,
  onPresetChange,
  onCancel,
  onCreate,
}: {
  name: string;
  presetId: string;
  onNameChange: (value: string) => void;
  onPresetChange: (presetId: string) => void;
  onCancel: () => void;
  onCreate: () => void;
}) {
  const preset =
    FORMAT_PRESETS.find(p => p.id === presetId) ?? FORMAT_PRESETS[0];
  const canCreate = name.trim().length > 0;
  return (
    <div style={styles.overlayViewport}>
      <div
        style={styles.newProjectPanel}
        role="dialog"
        aria-modal
        aria-label="New project">
        <VStack gap={4}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <VStack gap={0.5}>
                <Heading level={2}>New project</Heading>
                <Text type="supporting" color="secondary">
                  Pick a delivery format — you can add more sequence presets
                  later.
                </Text>
              </VStack>
            </StackItem>
            <IconButton
              label="Close new project"
              icon={<Icon icon={XIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              onClick={onCancel}
            />
          </HStack>

          <TextInput
            label="Project name"
            placeholder="e.g. Lighthouse Keepers"
            value={name}
            onChange={onNameChange}
            hasClear
          />

          <VStack gap={2}>
            <Text type="label" color="secondary">
              Format preset
            </Text>
            <div style={styles.presetGrid}>
              {FORMAT_PRESETS.map(p => (
                <SelectableCard
                  key={p.id}
                  label={\`\${p.label} — \${p.resolution} at \${p.fps} fps\`}
                  isSelected={presetId === p.id}
                  onChange={() => onPresetChange(p.id)}
                  padding={3}>
                  <HStack gap={3} vAlign="center">
                    <span style={styles.aspectChipWell} aria-hidden>
                      <span
                        style={{
                          ...styles.aspectChip,
                          width: p.chipW,
                          height: p.chipH,
                        }}
                      />
                    </span>
                    <StackItem size="fill" style={{minWidth: 0}}>
                      <VStack gap={0.5}>
                        <Text type="body" weight="semibold">
                          {p.label}
                        </Text>
                        {/* Two deliberate short lines — one long spec line
                            wraps mid-phrase at the ~230px card width. */}
                        <Text
                          type="supporting"
                          color="secondary"
                          hasTabularNumbers
                          style={styles.mono}>
                          {p.resolution}
                        </Text>
                        <Text
                          type="supporting"
                          color="secondary"
                          hasTabularNumbers
                          style={styles.mono}>
                          {p.fps} fps · {p.aspect}
                        </Text>
                        <Text type="supporting" color="secondary" maxLines={1}>
                          {p.use}
                        </Text>
                      </VStack>
                    </StackItem>
                  </HStack>
                </SelectableCard>
              ))}
            </div>
          </VStack>

          <Divider />

          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="supporting" color="secondary" hasTabularNumbers>
                Starter sequence: {preset.resolution} · {preset.fps} fps
              </Text>
            </StackItem>
            <Button label="Cancel" variant="ghost" size="sm" onClick={onCancel} />
            <Button
              label="Create project"
              variant="primary"
              size="sm"
              isDisabled={!canCreate}
              onClick={onCreate}
            />
          </HStack>
        </VStack>
      </div>
    </div>
  );
}

// ============= PAGE =============

export default function VideoEditorProjectBrowserTemplate() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [openProjectId, setOpenProjectId] = useState(INITIAL_OPEN_PROJECT);
  const [selectedSequenceId, setSelectedSequenceId] = useState(
    INITIAL_SELECTED_SEQUENCE,
  );
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [cardMinPx, setCardMinPx] = useState(240);
  const [isAutoBackupOn, setIsAutoBackupOn] = useState(true);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newPresetId, setNewPresetId] = useState(FORMAT_PRESETS[0].id);

  const isNarrow = useMediaQuery('(max-width: 960px)');
  const isCompact = useMediaQuery('(max-width: 768px)');
  // Resolved page scheme — re-anchors the overlay panel under the dark
  // scrim (scrim="dark" otherwise flips it into media-dark theming).
  const {mode: colorMode} = useTheme();

  const openProject =
    projects.find(p => p.id === openProjectId) ?? projects[0];
  const totalSequences = projects.reduce(
    (sum, p) => sum + p.sequences.length,
    0,
  );

  const visibleProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered =
      q === ''
        ? projects
        : projects.filter(
            p =>
              p.name.toLowerCase().includes(q) ||
              p.client.toLowerCase().includes(q) ||
              p.kindLabel.toLowerCase().includes(q),
          );
    const sorted = [...filtered];
    if (sortKey === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortKey === 'size') {
      sorted.sort((a, b) => b.mediaGb - a.mediaGb);
    } else {
      sorted.sort((a, b) => a.recencyRank - b.recencyRank);
    }
    return sorted;
  }, [projects, query, sortKey]);

  // Recents resolve against live project state so metadata always matches
  // the sequences table (created projects can appear here too).
  const recentEntries: RecentEntry[] = useMemo(() => {
    const entries: RecentEntry[] = [];
    for (const ref of RECENT_REFS) {
      const project = projects.find(p => p.id === ref.projectId);
      const sequence = project?.sequences.find(s => s.id === ref.sequenceId);
      if (project != null && sequence != null) {
        entries.push({project, sequence});
      }
    }
    return entries;
  }, [projects]);

  const handleOpenProject = (projectId: string) => {
    setOpenProjectId(projectId);
    const project = projects.find(p => p.id === projectId);
    setSelectedSequenceId(project?.sequences[0]?.id ?? '');
  };

  const handleSelectRecent = (projectId: string, sequenceId: string) => {
    setOpenProjectId(projectId);
    setSelectedSequenceId(sequenceId);
  };

  const openNewProject = () => {
    setNewProjectName('');
    setNewPresetId(FORMAT_PRESETS[0].id);
    setIsNewProjectOpen(true);
  };

  const handleCreateProject = () => {
    const name = newProjectName.trim();
    if (name === '') {
      return;
    }
    const preset =
      FORMAT_PRESETS.find(p => p.id === newPresetId) ?? FORMAT_PRESETS[0];
    const slug = slugify(name);
    const id = \`proj-\${slug}\`;
    const starter: Sequence = {
      id: \`\${id}-seq-1\`,
      name: \`\${slug}_cut_v1\`,
      resolution: preset.resolution,
      fps: preset.fps,
      duration: '00:00:00:00',
      videoTracks: 1,
      audioTracks: 2,
      modified: 'Just now',
      status: 'editing',
    };
    const project: Project = {
      id,
      name,
      kind: 'draft',
      kindLabel: 'Draft',
      client: 'Unassigned',
      mediaGb: 0,
      lastOpened: 'Just now',
      recencyRank: 0, // sorts first under "Recently opened"
      motif: 'blank',
      posterFrom: '#1E293B',
      posterMid: '#334155',
      posterTo: '#0F172A',
      collaborators: ['Mara Ellison'],
      sequences: [starter],
    };
    setProjects(prev => [project, ...prev]);
    setOpenProjectId(id);
    setSelectedSequenceId(starter.id);
    setIsNewProjectOpen(false);
  };

  // ----- Sequences table -----
  const columns: TableColumn<Sequence>[] = [
    {
      key: 'name',
      header: 'Sequence',
      width: proportional(2, {minWidth: 262}),
      renderCell: row => (
        <HStack gap={2} vAlign="center">
          <StatusDot
            variant={STATUS_META[row.status].dot}
            label={STATUS_META[row.status].label}
          />
          <Text type="code" maxLines={1} style={styles.mono}>
            {row.name}
          </Text>
        </HStack>
      ),
    },
    {
      key: 'resolution',
      header: 'Resolution',
      width: pixel(104),
      renderCell: row => (
        <Text type="supporting" hasTabularNumbers style={styles.mono}>
          {row.resolution}
        </Text>
      ),
    },
    {
      key: 'fps',
      header: 'FPS',
      width: pixel(56),
      align: 'end',
      renderCell: row => (
        <Text type="supporting" hasTabularNumbers style={styles.mono}>
          {row.fps}
        </Text>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      width: pixel(112),
      align: 'end',
      renderCell: row => (
        <Text type="code" hasTabularNumbers style={styles.mono}>
          {row.duration}
        </Text>
      ),
    },
    {
      key: 'tracks',
      header: 'Tracks',
      width: pixel(72),
      align: 'end',
      renderCell: row => (
        <Text type="supporting" hasTabularNumbers style={styles.mono}>
          {row.videoTracks}V · {row.audioTracks}A
        </Text>
      ),
    },
    {
      key: 'modified',
      header: 'Modified',
      width: pixel(102),
      align: 'end',
      renderCell: row => (
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {row.modified}
        </Text>
      ),
    },
  ];

  // Row click selects the sequence; the selected row carries the accent
  // wash (same idiom as subtitle-cue-editor's rowSeek plugin).
  const rowSelectPlugin: TablePlugin<Sequence> = {
    transformBodyRow: (props, item) => ({
      ...props,
      htmlProps: {
        ...props.htmlProps,
        onClick: () => setSelectedSequenceId(item.id),
        style: {
          ...props.htmlProps.style,
          cursor: 'pointer',
          backgroundColor:
            item.id === selectedSequenceId
              ? 'var(--color-accent-muted)'
              : undefined,
        },
      },
    }),
  };

  const selectedSequence =
    openProject.sequences.find(s => s.id === selectedSequenceId) ?? null;

  // ----- Header -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={2} vAlign="center" style={styles.headerRow}>
        <StackItem size="fill">
          <HStack gap={2} vAlign="center">
            <Icon icon={ClapperboardIcon} size="md" color="secondary" />
            <Heading level={1}>{STUDIO_NAME}</Heading>
            <Badge label="Video Suite" variant="neutral" />
            {!isCompact && (
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {projects.length} projects · {totalSequences} sequences
              </Text>
            )}
          </HStack>
        </StackItem>
        <TextInput
          label="Search projects"
          isLabelHidden
          size="sm"
          width={isCompact ? 168 : 240}
          placeholder="Search name, client, kind…"
          startIcon={SearchIcon}
          hasClear
          value={query}
          onChange={setQuery}
        />
        <Button
          label="New Project"
          variant="primary"
          size="sm"
          icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
          onClick={openNewProject}
        />
      </HStack>
    </LayoutHeader>
  );

  // ----- Open-recent rail (300px, drops out <=960px) -----
  const recentRail = !isNarrow ? (
    <LayoutPanel width={300} padding={0} hasDivider label="Open recent">
      <div style={styles.railScroll}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="label" color="secondary">
                Open recent
              </Text>
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {recentEntries.length}
            </Text>
          </HStack>
          <VStack gap={1}>
            {recentEntries.map(entry => (
              <RecentRow
                key={entry.sequence.id}
                entry={entry}
                isActive={
                  entry.project.id === openProjectId &&
                  entry.sequence.id === selectedSequenceId
                }
                onSelect={handleSelectRecent}
              />
            ))}
          </VStack>
        </VStack>
      </div>
    </LayoutPanel>
  ) : undefined;

  // ----- Content: projects grid + sequences table -----
  const gridMin = isCompact ? 220 : cardMinPx;
  const collaboratorsShown = openProject.collaborators.slice(0, 4);
  const collaboratorsOverflow =
    openProject.collaborators.length - collaboratorsShown.length;

  const content = (
    <LayoutContent padding={0}>
      <div style={styles.contentScroll}>
        <div style={styles.contentColumn}>
          <VStack gap={5}>
            {/* Projects toolbar */}
            <HStack gap={3} vAlign="center" style={styles.toolbarRow}>
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Heading level={2}>Projects</Heading>
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {visibleProjects.length} of {projects.length}
                  </Text>
                </HStack>
              </StackItem>
              {!isCompact && (
                <HStack gap={2} vAlign="center">
                  <Text type="supporting" color="secondary">
                    Card size
                  </Text>
                  <Slider
                    label="Project card size"
                    isLabelHidden
                    value={cardMinPx}
                    min={200}
                    max={320}
                    step={20}
                    width={140}
                    valueDisplay="none"
                    onChange={(v: number) => setCardMinPx(v)}
                  />
                </HStack>
              )}
              <Selector
                label="Sort projects"
                isLabelHidden
                size="sm"
                options={SORT_OPTIONS}
                value={sortKey}
                onChange={v => setSortKey(v as SortKey)}
              />
            </HStack>

            {/* Poster grid; the New Project tile always renders last. */}
            <div
              style={{
                ...styles.projectGrid,
                gridTemplateColumns: \`repeat(auto-fill, minmax(\${gridMin}px, 1fr))\`,
              }}>
              {visibleProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isOpen={project.id === openProjectId}
                  onOpen={handleOpenProject}
                />
              ))}
              <button
                type="button"
                style={styles.newProjectTile}
                onClick={openNewProject}>
                <Icon icon={PlusIcon} size="lg" color="secondary" />
                <Text type="body" weight="semibold">
                  New Project
                </Text>
                <Text type="supporting" color="secondary">
                  4K UHD · HD · Vertical presets
                </Text>
              </button>
            </div>

            {/* Open project band + sequences table */}
            <div style={styles.sequencesPanel}>
              <div style={styles.sequencesHeader}>
                <VStack gap={0.5}>
                  <HStack gap={2} vAlign="center">
                    <Heading level={3}>{openProject.name}</Heading>
                    <Badge
                      label={openProject.kindLabel}
                      variant={KIND_BADGE_VARIANT[openProject.kind]}
                    />
                  </HStack>
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {openProject.sequences.length} sequences ·{' '}
                    {formatGb(openProject.mediaGb)} media · {openProject.client}
                  </Text>
                </VStack>
                <StackItem size="fill">
                  <span />
                </StackItem>
                <Tooltip content={openProject.collaborators.join(' · ')}>
                  <HStack gap={2} vAlign="center">
                    <Icon icon={UsersIcon} size="sm" color="secondary" />
                    <AvatarGroup size="small">
                      {collaboratorsShown.map(name => (
                        <Avatar key={name} name={name} size="small" />
                      ))}
                      {collaboratorsOverflow > 0 ? (
                        <AvatarGroupOverflow count={collaboratorsOverflow} />
                      ) : null}
                    </AvatarGroup>
                  </HStack>
                </Tooltip>
                <Tooltip
                  content={
                    selectedSequence != null
                      ? \`Opens \${selectedSequence.name}\`
                      : 'Select a sequence first'
                  }>
                  <Button
                    label="Open in Editor"
                    variant="secondary"
                    size="sm"
                    icon={<Icon icon={FolderOpenIcon} size="sm" color="inherit" />}
                    isDisabled={selectedSequence == null}
                    onClick={() => {}}
                  />
                </Tooltip>
              </div>
              <div style={styles.tableScroll}>
                <div style={styles.tableMinWidth}>
                  <Table<Sequence>
                    data={openProject.sequences}
                    columns={columns}
                    idKey="id"
                    density="compact"
                    hasHover
                    plugins={{rowSelect: rowSelectPlugin}}
                    emptyState={
                      <Text type="supporting" color="secondary">
                        No sequences yet — open the editor to create one.
                      </Text>
                    }
                  />
                </div>
              </div>
            </div>
          </VStack>
        </div>
      </div>
    </LayoutContent>
  );

  // ----- Storage/backup status strip (48px) -----
  const footer = (
    <LayoutFooter hasDivider height={48} padding={0} label="Storage and backup">
      <div style={styles.footerRow}>
        <HStack gap={2} vAlign="center">
          <Icon icon={HardDriveIcon} size="sm" color="secondary" />
          {!isCompact && (
            <Text type="supporting" color="secondary">
              Scratch
            </Text>
          )}
          <div style={styles.footerMeterWrap}>
            <ProgressBar
              value={DRIVE_USED_GB}
              max={DRIVE_TOTAL_GB}
              label="Scratch drive usage"
              isLabelHidden
            />
          </div>
          <Text type="supporting" hasTabularNumbers style={styles.mono}>
            {formatGb(DRIVE_USED_GB)} / {formatGb(DRIVE_TOTAL_GB)}
          </Text>
        </HStack>
        <HStack gap={2} vAlign="center">
          <StatusDot variant="success" label="Backup healthy" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            Last backup {LAST_BACKUP}
          </Text>
        </HStack>
        {!isNarrow && (
          <HStack gap={2} vAlign="center">
            <Icon icon={CloudUploadIcon} size="sm" color="secondary" />
            <Text type="supporting" color="secondary">
              Cloud sync up to date
            </Text>
          </HStack>
        )}
        <StackItem size="fill">
          <span />
        </StackItem>
        {!isNarrow && (
          <Text type="supporting" color="secondary">
            {isAutoBackupOn ? 'Nightly at 06:00' : 'Manual backups only'}
          </Text>
        )}
        {!isCompact && (
          <Switch
            label="Auto-backup"
            value={isAutoBackupOn}
            onChange={setIsAutoBackupOn}
          />
        )}
      </div>
    </LayoutFooter>
  );

  const page = (
    <Layout
      height="fill"
      header={header}
      start={recentRail}
      content={content}
      footer={footer}
    />
  );

  return (
    <div style={styles.root}>
      {isNewProjectOpen ? (
        <Overlay
          isOpen
          scrim="dark"
          position="fill"
          align="center"
          style={styles.overlay}
          // The dark scrim flips the overlay layer into media-dark theming;
          // the panel should follow the page scheme, so re-anchor it.
          content={
            <MediaTheme mode={colorMode}>
              <NewProjectPanel
                name={newProjectName}
                presetId={newPresetId}
                onNameChange={setNewProjectName}
                onPresetChange={setNewPresetId}
                onCancel={() => setIsNewProjectOpen(false)}
                onCreate={handleCreateProject}
              />
            </MediaTheme>
          }>
          {page}
        </Overlay>
      ) : (
        page
      )}
    </div>
  );
}
`;export{e as default};