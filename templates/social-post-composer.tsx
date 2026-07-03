// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Cross-Platform Post Composer — creator-studio crosspost editor with
 *   per-platform live previews and platform-accurate truncation.
 *
 * @input Deterministic fixtures only: three platform profiles with different
 *   character limits and link accounting (Pulse — short-text, 280 chars,
 *   links wrapped to a fixed 23; Threadline — long-form, 3,000 chars, link
 *   cards are free; Lensa — image-first, 2,200-char caption, links count as
 *   plain text), one seeded draft about the design-tokens v2 launch with two
 *   attached images (one with alt text, one without), an attached link card,
 *   five hashtag suggestions with fixed usage counts, and three fixed
 *   schedule slots anchored to July 2026. No Date.now(), Math.random(), or
 *   network assets — every image is a CSS gradient placeholder.
 * @output A creator-studio composer: the left pane is the editor (crosspost
 *   bar of platform ToggleButtons, body TextArea, per-platform countdown
 *   Tokens that turn amber then red, a drag-to-reorder media strip whose
 *   tiles carry alt-text Popover editors with completeness badges, a
 *   removable link card, and clickable hashtag suggestions); the right pane
 *   is a live preview that re-renders per selected platform Tab — short-text
 *   card, long-form article, or image-first post — truncating the body at
 *   each platform's limit as you type. The header carries the account Badge,
 *   an aggregate alt-text badge, and a Schedule Popover (post now, fixed
 *   slots, or a TimeInput pick) that moves the draft into a visible queued
 *   Banner with its scheduled slot and a back-to-draft undo.
 * @position Emitted by `astryx template social-post-composer`.
 *
 * Frame (desktop, left to right):
 *   editor pane (fill, scrolls) | preview panel 400px (scrolls)
 *
 * Container policy (composer archetype): the editor pane is plain rows and
 * fields — the only Cards are artifacts (the link card in the editor and the
 * rendered post inside the preview panel), so previews read as the thing
 * being published. Media tiles are fixed 96px squares in a horizontally
 * scrolling strip; countdown chips are Tokens so tone (default/amber/red)
 * reads at a glance and each chip doubles as a preview-tab shortcut.
 *
 * Color policy: all chrome (panes, tiles, link cards, previews, text) uses
 * semantic tokens and adapts to light/dark. The ONLY raw color literals are
 * the deterministic gradient placeholders standing in for uploaded images
 * and the link-card hero/favicon art — image content is scheme-locked
 * (colorScheme: 'light' on each gradient surface) so it renders identically
 * in dark mode, exactly like a real photo would; the rgba(255,255,255,…)
 * highlight circles are part of that locked art and stay literal.
 *
 * Choose over newsletter-composer when the artifact is one social post
 * fanned out to several networks rather than a block-built email; choose
 * over mail-compose when the surface has no recipients or subject — reach
 * is decided by platform toggles; choose over form-page because the right
 * pane is a live per-platform render of the draft, not a summary of fields.
 *
 * Responsive contract:
 * - >1024px  — two-pane frame: editor fill | preview LayoutPanel 400px.
 * - <=1024px — the preview panel narrows to 340px; previews stay full
 *   fidelity (they are fluid inside the panel).
 * - <=760px  — the preview panel leaves the frame; a Compose/Preview
 *   SegmentedControl appears in the header and the two panes swap as a
 *   single-pane fallback. All state (draft, tabs, queue) persists across
 *   the swap.
 * - <=640px  — the header HStack wraps: the account Badge and the
 *   Schedule/queued controls drop to a second row; media-tile controls and
 *   hashtag Tokens grow toward ~40px tap targets (md IconButtons, md
 *   Tokens). Nothing is hover-only: drag-to-reorder is gated to fine
 *   pointers and the move-left/right IconButtons on each tile are the
 *   always-present touch/keyboard path; alt-text editing is a click-open
 *   Popover.
 * - The editor pane and preview panel scroll independently; the header
 *   never scrolls. The media strip scrolls horizontally (overflowX auto)
 *   instead of wrapping so tiles keep their reorder geometry at 375px.
 */

import {
  useState,
  type CSSProperties,
  type DragEvent,
  type ReactNode,
} from 'react';

import {
  CalendarClockIcon,
  CameraIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  EyeIcon,
  GlobeIcon,
  GripVerticalIcon,
  HashIcon,
  HeartIcon,
  ImagePlusIcon,
  Link2Icon,
  MessageCircleIcon,
  PenLineIcon,
  RepeatIcon,
  ScrollTextIcon,
  SendIcon,
  Share2Icon,
  Undo2Icon,
  XIcon,
  ZapIcon,
} from 'lucide-react';

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
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Field} from '@astryxdesign/core/Field';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Popover} from '@astryxdesign/core/Popover';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TimeInput, type ISOTimeString} from '@astryxdesign/core/TimeInput';
import {useToast} from '@astryxdesign/core/Toast';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES — plain CSS properties with semantic tokens; the only literal color
// stops are the deterministic gradient placeholders standing in for images.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  editorScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  previewScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
    backgroundColor: 'var(--color-background-body)',
  },
  crosspostBar: {
    paddingBlock: 'var(--spacing-1)',
  },
  // Countdown chips read as status: default → amber → red as the platform
  // budget runs out. Tabular numbers keep the row from jittering per key.
  countdownRow: {
    paddingBlock: 'var(--spacing-1)',
  },
  // Media strip: horizontal scroll instead of wrapping so the reorder
  // geometry (left/right + drag) stays a single row even at 375px.
  mediaStrip: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    overflowX: 'auto',
    paddingBlock: 'var(--spacing-1)',
  },
  mediaTile: {
    position: 'relative',
    width: 96,
    flexShrink: 0,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    overflow: 'hidden',
  },
  mediaTileDragging: {
    opacity: 0.4,
  },
  mediaTileDropTarget: {
    outline: '2px solid var(--color-border-blue)',
    outlineOffset: 1,
  },
  // Scheme-locked: carries a gradient image fixture (see Color policy).
  mediaThumb: {
    height: 72,
    width: '100%',
    colorScheme: 'light',
  },
  mediaTileFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: 2,
  },
  mediaRemove: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  linkCard: {
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    padding: 'var(--spacing-2)',
  },
  // Scheme-locked brand art: the favicon placeholder is a fixed brand
  // gradient, identical in both schemes (see Color policy).
  linkFavicon: {
    width: 40,
    height: 40,
    borderRadius: 6,
    flexShrink: 0,
    background: 'linear-gradient(135deg, #5B6CF0 0%, #2CC7B0 100%)',
    colorScheme: 'light',
  },
  hashtagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-1)',
  },
  // ---- preview artifact styles (token colors; gradients are fixtures) ----
  previewBody: {
    fontSize: 15,
    lineHeight: 1.5,
    color: 'var(--color-text-primary)',
    whiteSpace: 'pre-line',
    overflowWrap: 'anywhere',
  },
  previewBodyLong: {
    fontSize: 16,
    lineHeight: 1.7,
    color: 'var(--color-text-primary)',
    whiteSpace: 'pre-line',
    overflowWrap: 'anywhere',
  },
  previewEllipsis: {
    color: 'var(--color-text-red)',
    fontWeight: 700,
  },
  previewImageGrid: {
    display: 'flex',
    gap: 'var(--spacing-1)',
  },
  previewImageShort: {
    flex: 1,
    height: 120,
    borderRadius: 8,
  },
  previewImageLong: {
    height: 160,
    borderRadius: 8,
  },
  previewImageHero: {
    height: 240,
    borderRadius: 8,
  },
  previewThumbStrip: {
    display: 'flex',
    gap: 'var(--spacing-1)',
  },
  previewThumb: {
    width: 56,
    height: 56,
    borderRadius: 6,
  },
  previewLinkCard: {
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewLinkBody: {
    padding: 'var(--spacing-2)',
  },
  previewPlainLink: {
    color: 'var(--color-text-accent)',
    overflowWrap: 'anywhere',
  },
  altOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
  },
  truncationNote: {
    color: 'var(--color-text-red)',
    fontSize: 12,
    lineHeight: 1.4,
  },
};

// ---------------------------------------------------------------------------
// DATA — deterministic fixtures. The signed-in account is Lumen Labs; today
// is fixed at Thursday, July 2, 2026. No clocks, randomness, or images.
// ---------------------------------------------------------------------------

const ACCOUNT_NAME = 'Lumen Labs';
const ACCOUNT_BADGE = 'Lumen Labs · 3 channels';

type PlatformId = 'pulse' | 'threadline' | 'lensa';
type PlatformStyle = 'short' | 'long' | 'image';

/** How an attached link counts against the platform's character limit. */
type LinkAccounting = 'wrapped' | 'free' | 'plain';

interface PlatformProfile {
  id: PlatformId;
  name: string;
  handle: string;
  style: PlatformStyle;
  styleLabel: string;
  limit: number;
  linkAccounting: LinkAccounting;
  linkNote: string;
  icon: typeof ZapIcon;
}

/** Fixed t.co-style wrapper length on short-text platforms. */
const WRAPPED_LINK_CHARS = 23;

const PLATFORMS: PlatformProfile[] = [
  {
    id: 'pulse',
    name: 'Pulse',
    handle: '@lumenlabs',
    style: 'short',
    styleLabel: 'Short-text · 280',
    limit: 280,
    linkAccounting: 'wrapped',
    linkNote: `Links are wrapped and count as ${WRAPPED_LINK_CHARS} characters.`,
    icon: ZapIcon,
  },
  {
    id: 'threadline',
    name: 'Threadline',
    handle: '@lumen-labs',
    style: 'long',
    styleLabel: 'Long-form · 3,000',
    limit: 3000,
    linkAccounting: 'free',
    linkNote: 'Link cards render below the post and cost no characters.',
    icon: ScrollTextIcon,
  },
  {
    id: 'lensa',
    name: 'Lensa',
    handle: 'lumen.labs',
    style: 'image',
    styleLabel: 'Image-first · 2,200',
    limit: 2200,
    linkAccounting: 'plain',
    linkNote: 'Links are plain caption text — every character counts.',
    icon: CameraIcon,
  },
];

const PLATFORM_BY_ID = new Map(PLATFORMS.map(p => [p.id, p]));

/** Seeded ~245-char draft: Pulse opens in the amber band with the link on. */
const INITIAL_BODY =
  'Design tokens v2 are live. Every color, radius, and shadow in the ' +
  'Lumen app now resolves from one published token set, so brand updates ' +
  'roll out to product, docs, and email in a single release. Full ' +
  'write-up and migration notes are linked below.';

interface ImageAttachment {
  id: string;
  name: string;
  alt: string;
  /**
   * Deterministic gradient placeholder — no network images. Literal color
   * stops (incl. rgba white highlights) are intentional: image content is
   * scheme-locked and does not adapt to dark mode (see Color policy).
   */
  gradient: string;
}

const INITIAL_IMAGES: ImageAttachment[] = [
  {
    id: 'img-palette',
    name: 'token-palette.png',
    alt: 'Grid of the twelve new core color ramps in light and dark themes',
    gradient: [
      'radial-gradient(circle at 78% 24%, rgba(255,255,255,0.32) 0 18px, transparent 19px)',
      'linear-gradient(135deg, #6D5BF0 0%, #4C7BDD 55%, #37B7E0 100%)',
    ].join(', '),
  },
  {
    id: 'img-before-after',
    name: 'before-after.png',
    alt: '',
    gradient: [
      'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.22) 0 26px, transparent 27px)',
      'linear-gradient(120deg, #1FA98C 0%, #2CC7B0 48%, #8BE3C9 100%)',
    ].join(', '),
  },
];

/** The media-library queue behind the 'Add image' button. */
const LIBRARY_IMAGES: ImageAttachment[] = [
  ...INITIAL_IMAGES,
  {
    id: 'img-adoption',
    name: 'adoption-graph.png',
    alt: 'Line chart of token adoption climbing to 92 percent of screens',
    gradient: [
      'radial-gradient(circle at 70% 78%, rgba(255,255,255,0.24) 0 22px, transparent 23px)',
      'linear-gradient(120deg, #F0855B 0%, #E85D8A 60%, #B44CD0 100%)',
    ].join(', '),
  },
];

const MAX_IMAGES = 4;

const LINK_URL = 'https://lumenlabs.example/blog/design-tokens-v2';
const LINK_TITLE = 'Design tokens v2: one source of truth';
const LINK_DOMAIN = 'lumenlabs.example';

interface HashtagSuggestion {
  tag: string;
  usage: string;
}

const HASHTAG_SUGGESTIONS: HashtagSuggestion[] = [
  {tag: '#designtokens', usage: '1.2k posts'},
  {tag: '#designsystem', usage: '48k posts'},
  {tag: '#a11y', usage: '31k posts'},
  {tag: '#shipnotes', usage: '640 posts'},
  {tag: '#lumenlabs', usage: '210 posts'},
];

/** Fixed schedule slots anchored to the fixture date (Thu, Jul 2 2026). */
const SCHEDULE_SLOTS = [
  {id: 'slot-peak', label: 'Today 6:00 PM', hint: 'Peak engagement'},
  {id: 'slot-morning', label: 'Tomorrow 9:00 AM', hint: 'Morning commute'},
  {id: 'slot-weekend', label: 'Sat, Jul 4 · 11:00 AM', hint: 'Weekend scroll'},
];

/** ISOTimeString is a branded string — brand the fixed picker default. */
const DEFAULT_PICK_TIME = '17:30' as ISOTimeString;

// ---------------------------------------------------------------------------
// HELPERS — pure and deterministic (string math over fixture arrays only).
// ---------------------------------------------------------------------------

/** Characters the attached link costs on this platform. */
function linkCost(platform: PlatformProfile, hasLink: boolean): number {
  if (!hasLink) {
    return 0;
  }
  switch (platform.linkAccounting) {
    case 'wrapped':
      return WRAPPED_LINK_CHARS;
    case 'free':
      return 0;
    case 'plain':
      return LINK_URL.length;
  }
}

/** Total characters the draft occupies on this platform. */
function usedChars(
  platform: PlatformProfile,
  body: string,
  hasLink: boolean,
): number {
  return body.length + linkCost(platform, hasLink);
}

/** How much of the limit the body itself may use once the link is paid. */
function bodyBudget(platform: PlatformProfile, hasLink: boolean): number {
  return Math.max(0, platform.limit - linkCost(platform, hasLink));
}

type CountdownTone = 'ok' | 'amber' | 'red';

/** Amber inside the last 10% of the budget; red once over. */
function countdownTone(platform: PlatformProfile, remaining: number): CountdownTone {
  if (remaining < 0) {
    return 'red';
  }
  return remaining <= Math.ceil(platform.limit * 0.1) ? 'amber' : 'ok';
}

const TONE_TOKEN_COLOR: Record<CountdownTone, 'gray' | 'orange' | 'red'> = {
  ok: 'gray',
  amber: 'orange',
  red: 'red',
};

/** '17:30' → '5:30 PM' (string math only — no locale, no clock). */
function formatTime12h(iso: ISOTimeString): string {
  const [hourRaw, minute] = iso.split(':');
  const hour = Number(hourRaw);
  const meridiem = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${meridiem}`;
}

/** Append a hashtag to the body with exactly one separating space. */
function appendHashtag(body: string, tag: string): string {
  const trimmed = body.replace(/\s+$/, '');
  return trimmed === '' ? tag : `${trimmed} ${tag}`;
}

/** Remove a hashtag (and one adjacent space) wherever it appears. */
function removeHashtag(body: string, tag: string): string {
  return body
    .split(tag)
    .join('')
    .replace(/ {2,}/g, ' ')
    .replace(/\s+$/, '');
}

// ---------------------------------------------------------------------------
// PREVIEW — one artifact card per platform style; the body truncates hard
// at the platform's remaining budget, exactly like the network would.
// ---------------------------------------------------------------------------

/**
 * The body text as the platform will actually render it: cut at the
 * post-link budget with a red ellipsis marking the truncation point.
 */
function TruncatedBody({
  platform,
  body,
  hasLink,
  long,
}: {
  platform: PlatformProfile;
  body: string;
  hasLink: boolean;
  long?: boolean;
}) {
  const budget = bodyBudget(platform, hasLink);
  const isTruncated = body.length > budget;
  const shown = isTruncated ? body.slice(0, budget) : body;
  return (
    <div style={long ? styles.previewBodyLong : styles.previewBody}>
      {shown}
      {isTruncated && (
        <span style={styles.previewEllipsis} aria-label="Truncated here">
          …
        </span>
      )}
    </div>
  );
}

function GradientImage({
  image,
  style,
}: {
  image: ImageAttachment;
  style: CSSProperties;
}) {
  const hasAlt = image.alt.trim() !== '';
  return (
    <div
      role="img"
      aria-label={hasAlt ? image.alt : `${image.name} (no alt text)`}
      // Scheme-locked image fixture (see Color policy): renders the same
      // in dark mode, exactly like a real uploaded photo.
      style={{
        ...style,
        background: image.gradient,
        position: 'relative',
        colorScheme: 'light',
      }}>
      <div style={styles.altOverlay}>
        <Badge
          label={hasAlt ? 'ALT' : 'No alt'}
          variant={hasAlt ? 'success' : 'warning'}
        />
      </div>
    </div>
  );
}

function PreviewLinkCard({compact}: {compact: boolean}) {
  return (
    <div style={styles.previewLinkCard}>
      {!compact && (
        <div
          aria-hidden
          // Scheme-locked brand art: fixed link-card hero gradient, identical
          // in both schemes (see Color policy).
          style={{
            height: 96,
            background: 'linear-gradient(135deg, #5B6CF0 0%, #2CC7B0 100%)',
            colorScheme: 'light',
          }}
        />
      )}
      <div style={styles.previewLinkBody}>
        <VStack gap={1}>
          <Text type="body" weight="semibold" maxLines={1}>
            {LINK_TITLE}
          </Text>
          <HStack gap={1} vAlign="center">
            <Icon icon={GlobeIcon} size="xsm" color="secondary" />
            <Text type="supporting" color="secondary">
              {LINK_DOMAIN}
            </Text>
          </HStack>
        </VStack>
      </div>
    </div>
  );
}

function PlatformPreview({
  platform,
  body,
  images,
  hasLink,
}: {
  platform: PlatformProfile;
  body: string;
  images: ImageAttachment[];
  hasLink: boolean;
}) {
  const used = usedChars(platform, body, hasLink);
  const over = used - platform.limit;
  const header = (
    <HStack gap={2} vAlign="center">
      <Avatar name={ACCOUNT_NAME} size="xsmall" />
      <StackItem size="fill">
        <VStack gap={0}>
          <Text type="body" weight="semibold" maxLines={1}>
            {ACCOUNT_NAME}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {platform.handle} · Jul 2
          </Text>
        </VStack>
      </StackItem>
      <Icon icon={platform.icon} size="sm" color="secondary" />
    </HStack>
  );

  let content: ReactNode;
  if (platform.style === 'short') {
    content = (
      <VStack gap={2}>
        {header}
        <TruncatedBody platform={platform} body={body} hasLink={hasLink} />
        {images.length > 0 && (
          <div style={styles.previewImageGrid}>
            {images.slice(0, 2).map(image => (
              <GradientImage
                key={image.id}
                image={image}
                style={styles.previewImageShort}
              />
            ))}
          </div>
        )}
        {hasLink && <PreviewLinkCard compact />}
        <HStack gap={4} vAlign="center">
          <HStack gap={1} vAlign="center">
            <Icon icon={MessageCircleIcon} size="xsm" color="secondary" />
            <Text type="supporting" color="secondary">
              18
            </Text>
          </HStack>
          <HStack gap={1} vAlign="center">
            <Icon icon={RepeatIcon} size="xsm" color="secondary" />
            <Text type="supporting" color="secondary">
              42
            </Text>
          </HStack>
          <HStack gap={1} vAlign="center">
            <Icon icon={HeartIcon} size="xsm" color="secondary" />
            <Text type="supporting" color="secondary">
              310
            </Text>
          </HStack>
        </HStack>
      </VStack>
    );
  } else if (platform.style === 'long') {
    content = (
      <VStack gap={3}>
        {header}
        <TruncatedBody platform={platform} body={body} hasLink={hasLink} long />
        {images.map(image => (
          <GradientImage
            key={image.id}
            image={image}
            style={styles.previewImageLong}
          />
        ))}
        {hasLink && <PreviewLinkCard compact={false} />}
        <Text type="supporting" color="secondary">
          6 min read · 128 followers reached last post
        </Text>
      </VStack>
    );
  } else {
    // Image-first: the first attachment leads; the caption follows.
    content = (
      <VStack gap={2}>
        {header}
        {images.length === 0 ? (
          <EmptyState
            isCompact
            icon={<Icon icon={CameraIcon} size="lg" />}
            title="Lensa needs an image"
            description="Attach at least one image — this network is image-first."
          />
        ) : (
          <>
            <GradientImage image={images[0]} style={styles.previewImageHero} />
            {images.length > 1 && (
              <div style={styles.previewThumbStrip}>
                {images.slice(1).map(image => (
                  <GradientImage
                    key={image.id}
                    image={image}
                    style={styles.previewThumb}
                  />
                ))}
              </div>
            )}
          </>
        )}
        <div style={styles.previewBody}>
          <Text type="body" weight="semibold">
            {platform.handle}
          </Text>{' '}
          <TruncatedBody platform={platform} body={body} hasLink={hasLink} />
          {hasLink && <span style={styles.previewPlainLink}>{LINK_URL}</span>}
        </div>
      </VStack>
    );
  }

  return (
    <VStack gap={2}>
      <Card padding={3}>{content}</Card>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {used.toLocaleString('en-US')} / {platform.limit.toLocaleString('en-US')}{' '}
        characters · {platform.linkNote}
      </Text>
      {over > 0 && (
        <div style={styles.truncationNote} role="status">
          Truncated at {platform.limit.toLocaleString('en-US')} characters —{' '}
          {over.toLocaleString('en-US')} over.
        </div>
      )}
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// MEDIA TILE — draggable on fine pointers; move buttons are the universal
// path; the ALT Token opens the alt-text editor Popover.
// ---------------------------------------------------------------------------

function MediaTile({
  image,
  index,
  count,
  canDrag,
  isDragging,
  isDropTarget,
  isQueued,
  isPhone,
  altEditor,
  onDragStart,
  onDragEnd,
  onDragOverTile,
  onDropOnTile,
  onDragLeaveTile,
  onMove,
  onRemove,
}: {
  image: ImageAttachment;
  index: number;
  count: number;
  canDrag: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
  isQueued: boolean;
  isPhone: boolean;
  altEditor: ReactNode;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onDragOverTile: (event: DragEvent<HTMLDivElement>) => void;
  onDropOnTile: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeaveTile: (event: DragEvent<HTMLDivElement>) => void;
  onMove: (delta: -1 | 1) => void;
  onRemove: () => void;
}) {
  const controlSize = isPhone ? ('md' as const) : ('sm' as const);
  return (
    <div
      draggable={(canDrag && !isQueued) || undefined}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOverTile}
      onDrop={onDropOnTile}
      onDragLeave={onDragLeaveTile}
      style={{
        ...styles.mediaTile,
        ...(isDragging ? styles.mediaTileDragging : undefined),
        ...(isDropTarget ? styles.mediaTileDropTarget : undefined),
      }}
      aria-label={`${image.name}, position ${index + 1} of ${count}`}>
      <div
        aria-hidden
        style={{...styles.mediaThumb, background: image.gradient}}
      />
      {!isQueued && (
        <div style={styles.mediaRemove}>
          <IconButton
            label={`Remove ${image.name}`}
            tooltip="Remove image"
            size={controlSize}
            variant="secondary"
            icon={<Icon icon={XIcon} size="sm" color="inherit" />}
            onClick={onRemove}
          />
        </div>
      )}
      <div style={styles.mediaTileFooter}>
        <IconButton
          label={`Move ${image.name} earlier`}
          tooltip="Move left"
          size={controlSize}
          variant="ghost"
          isDisabled={isQueued || index === 0}
          icon={<Icon icon={ChevronLeftIcon} size="sm" color="inherit" />}
          onClick={() => onMove(-1)}
        />
        {canDrag && !isQueued ? (
          <Tooltip content="Drag to reorder">
            <Icon icon={GripVerticalIcon} size="sm" color="secondary" />
          </Tooltip>
        ) : (
          <Icon icon={GripVerticalIcon} size="sm" color="secondary" />
        )}
        <IconButton
          label={`Move ${image.name} later`}
          tooltip="Move right"
          size={controlSize}
          variant="ghost"
          isDisabled={isQueued || index === count - 1}
          icon={<Icon icon={ChevronRightIcon} size="sm" color="inherit" />}
          onClick={() => onMove(1)}
        />
      </div>
      <div style={{paddingInline: 4, paddingBottom: 4}}>{altEditor}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function SocialPostComposerTemplate() {
  const toast = useToast();

  // --- draft ---
  const [body, setBody] = useState(INITIAL_BODY);
  const [images, setImages] = useState<ImageAttachment[]>(INITIAL_IMAGES);
  const [hasLink, setHasLink] = useState(true);

  // --- crosspost + preview ---
  const [enabled, setEnabled] = useState<Record<PlatformId, boolean>>({
    pulse: true,
    threadline: true,
    lensa: true,
  });
  const [previewTab, setPreviewTab] = useState<PlatformId>('pulse');

  // --- media strip: drag + alt editor ---
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [altEditorFor, setAltEditorFor] = useState<string | null>(null);
  const [altDraft, setAltDraft] = useState('');

  // --- scheduling ---
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [pickTime, setPickTime] = useState<ISOTimeString>(DEFAULT_PICK_TIME);
  const [queuedSlot, setQueuedSlot] = useState<string | null>(null);

  // --- responsive contract (see file header) ---
  const isNarrowPanel = useMediaQuery('(max-width: 1024px)');
  const isSinglePane = useMediaQuery('(max-width: 760px)');
  const isPhone = useMediaQuery('(max-width: 640px)');
  // Drag-to-reorder needs a fine pointer; touch always has move buttons.
  const canDrag = useMediaQuery('(hover: hover) and (pointer: fine)');
  const [mobilePane, setMobilePane] = useState<'compose' | 'preview'>(
    'compose',
  );

  // --- derived state ---
  const enabledPlatforms = PLATFORMS.filter(platform => enabled[platform.id]);
  const activePlatform =
    enabledPlatforms.find(platform => platform.id === previewTab) ??
    enabledPlatforms[0] ??
    null;
  const isQueued = queuedSlot !== null;
  const altDone = images.filter(image => image.alt.trim() !== '').length;
  const pendingLibrary = LIBRARY_IMAGES.filter(
    item => !images.some(image => image.id === item.id),
  );
  const overPlatforms = enabledPlatforms.filter(
    platform => usedChars(platform, body, hasLink) > platform.limit,
  );
  const lensaBlocked = enabled.lensa && images.length === 0;
  const queueBlocker =
    enabledPlatforms.length === 0
      ? 'Turn on at least one platform first'
      : overPlatforms.length > 0
        ? `Over the limit on ${overPlatforms.map(p => p.name).join(', ')}`
        : lensaBlocked
          ? 'Lensa needs at least one image'
          : null;

  // ---- crosspost bar ----

  const togglePlatform = (id: PlatformId) => {
    const turningOff = enabled[id];
    setEnabled(prev => ({...prev, [id]: !prev[id]}));
    if (turningOff && previewTab === id) {
      const next = PLATFORMS.find(p => p.id !== id && enabled[p.id]);
      if (next != null) {
        setPreviewTab(next.id);
      }
    }
  };

  // ---- hashtags ----

  const toggleHashtag = (tag: string) => {
    if (body.includes(tag)) {
      setBody(prev => removeHashtag(prev, tag));
    } else {
      setBody(prev => appendHashtag(prev, tag));
    }
  };

  // ---- media strip ----

  const moveImage = (id: string, delta: -1 | 1) => {
    setImages(prev => {
      const index = prev.findIndex(image => image.id === id);
      const target = index + delta;
      if (index === -1 || target < 0 || target >= prev.length) {
        return prev;
      }
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const reorderImage = (dragId: string, targetId: string) => {
    if (dragId === targetId) {
      return;
    }
    setImages(prev => {
      const dragged = prev.find(image => image.id === dragId);
      const targetIndex = prev.findIndex(image => image.id === targetId);
      if (dragged == null || targetIndex === -1) {
        return prev;
      }
      const without = prev.filter(image => image.id !== dragId);
      const insertAt = without.findIndex(image => image.id === targetId);
      without.splice(insertAt === -1 ? targetIndex : insertAt, 0, dragged);
      return without;
    });
  };

  const removeImage = (id: string) => {
    const removed = images.find(image => image.id === id);
    setImages(prev => prev.filter(image => image.id !== id));
    if (altEditorFor === id) {
      setAltEditorFor(null);
    }
    if (removed != null) {
      toast({
        body: `Removed ${removed.name} — add it back with 'Add image'.`,
        uniqueID: 'composer-media',
      });
    }
  };

  const addImage = () => {
    // Pick inside the updater so rapid clicks never append a duplicate.
    setImages(prev => {
      if (prev.length >= MAX_IMAGES) {
        return prev;
      }
      const next = LIBRARY_IMAGES.find(
        item => !prev.some(image => image.id === item.id),
      );
      return next == null ? prev : [...prev, next];
    });
  };

  const commitAlt = (id: string) => {
    const value = altDraft.trim();
    setImages(prev =>
      prev.map(image => (image.id === id ? {...image, alt: value} : image)),
    );
    setAltEditorFor(null);
  };

  // ---- scheduling ----

  const queueDraft = (slot: string) => {
    setQueuedSlot(slot);
    setIsScheduleOpen(false);
    toast({
      body:
        slot === 'Posting now'
          ? `Posting to ${enabledPlatforms.map(p => p.name).join(', ')}`
          : `Queued for ${slot}`,
      uniqueID: 'composer-schedule',
    });
  };

  const unqueueDraft = () => {
    setQueuedSlot(null);
    toast({body: 'Back to draft — nothing was posted.', uniqueID: 'composer-schedule'});
  };

  // ---- alt-text popover per tile ----

  const renderAltEditor = (image: ImageAttachment) => {
    const hasAlt = image.alt.trim() !== '';
    return (
      <Popover
        isOpen={altEditorFor === image.id}
        onOpenChange={open => {
          if (open) {
            setAltDraft(image.alt);
            setAltEditorFor(image.id);
          } else {
            setAltEditorFor(null);
          }
        }}
        width={280}
        placement="below"
        alignment="start"
        label={`Alt text for ${image.name}`}
        content={
          <div style={{padding: 'var(--spacing-3)'}}>
            <VStack gap={2}>
              <Text type="body" weight="semibold" maxLines={1}>
                {image.name}
              </Text>
              <TextArea
                label="Alt text"
                value={altDraft}
                onChange={setAltDraft}
                rows={3}
                width="100%"
                placeholder="Describe the image for screen readers"
              />
              <HStack gap={2}>
                <StackItem size="fill">
                  <span />
                </StackItem>
                <Button
                  label="Cancel"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAltEditorFor(null)}
                />
                <Button
                  label="Save alt"
                  variant="primary"
                  size="sm"
                  onClick={() => commitAlt(image.id)}
                />
              </HStack>
            </VStack>
          </div>
        }>
        {/* Token consumes InteractiveRoleContext, so it is the popover's
            button trigger; color doubles as the completeness badge. */}
        <Token
          label={hasAlt ? 'ALT ✓' : 'No alt'}
          size={isPhone ? 'md' : 'sm'}
          color={hasAlt ? 'green' : 'orange'}
          icon={
            <Icon
              icon={hasAlt ? CheckIcon : PenLineIcon}
              size="xsm"
              color="inherit"
            />
          }
        />
      </Popover>
    );
  };

  // ---- editor pane ----

  const crosspostBar = (
    <div style={styles.crosspostBar}>
      <VStack gap={1}>
        <Text type="label">Crosspost to</Text>
        <HStack gap={1} vAlign="center" wrap="wrap">
          {PLATFORMS.map(platform => (
            <ToggleButton
              key={platform.id}
              label={platform.name}
              size={isPhone ? 'md' : 'sm'}
              icon={<Icon icon={platform.icon} size="sm" color="inherit" />}
              isPressed={enabled[platform.id]}
              isDisabled={isQueued}
              onPressedChange={() => togglePlatform(platform.id)}
            />
          ))}
          <Text type="supporting" color="secondary">
            {enabledPlatforms.length === 0
              ? 'No platforms selected'
              : `${enabledPlatforms.length} of ${PLATFORMS.length} on`}
          </Text>
        </HStack>
      </VStack>
    </div>
  );

  const countdownRow = (
    <div style={styles.countdownRow}>
      <HStack gap={1} vAlign="center" wrap="wrap">
        {enabledPlatforms.length === 0 ? (
          <Text type="supporting" color="secondary">
            Turn a platform on to see its character budget.
          </Text>
        ) : (
          enabledPlatforms.map(platform => {
            const remaining =
              platform.limit - usedChars(platform, body, hasLink);
            const tone = countdownTone(platform, remaining);
            return (
              <Tooltip
                key={platform.id}
                content={`${platform.name}: ${remaining.toLocaleString('en-US')} characters left · ${platform.linkNote}`}>
                <Token
                  label={`${platform.name} ${remaining.toLocaleString('en-US')}`}
                  size={isPhone ? 'md' : 'sm'}
                  color={TONE_TOKEN_COLOR[tone]}
                  icon={
                    <Icon icon={platform.icon} size="xsm" color="inherit" />
                  }
                  onClick={() => {
                    // Chips double as preview shortcuts.
                    setPreviewTab(platform.id);
                    if (isSinglePane) {
                      setMobilePane('preview');
                    }
                  }}
                />
              </Tooltip>
            );
          })
        )}
      </HStack>
    </div>
  );

  const mediaStrip = (
    <Field
      label={`Media (${images.length}/${MAX_IMAGES}) · alt ${altDone}/${images.length}`}
      inputID="composer-media-strip">
      <div id="composer-media-strip" style={styles.mediaStrip}>
        {images.map((image, index) => (
          <MediaTile
            key={image.id}
            image={image}
            index={index}
            count={images.length}
            canDrag={canDrag}
            isDragging={draggingId === image.id}
            isDropTarget={dropTargetId === image.id && draggingId !== image.id}
            isQueued={isQueued}
            isPhone={isPhone}
            altEditor={renderAltEditor(image)}
            onDragStart={event => {
              event.dataTransfer.setData('text/plain', image.id);
              event.dataTransfer.effectAllowed = 'move';
              setDraggingId(image.id);
            }}
            onDragEnd={() => {
              setDraggingId(null);
              setDropTargetId(null);
            }}
            onDragOverTile={event => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              setDropTargetId(image.id);
            }}
            onDragLeaveTile={event => {
              if (
                !event.currentTarget.contains(
                  event.relatedTarget as Node | null,
                )
              ) {
                setDropTargetId(current =>
                  current === image.id ? null : current,
                );
              }
            }}
            onDropOnTile={event => {
              event.preventDefault();
              const dragId = event.dataTransfer.getData('text/plain');
              if (dragId !== '') {
                reorderImage(dragId, image.id);
              }
              setDraggingId(null);
              setDropTargetId(null);
            }}
            onMove={delta => moveImage(image.id, delta)}
            onRemove={() => removeImage(image.id)}
          />
        ))}
        <Button
          label="Add image"
          size={isPhone ? 'md' : 'sm'}
          variant="secondary"
          icon={<Icon icon={ImagePlusIcon} size="sm" color="inherit" />}
          isDisabled={
            isQueued || pendingLibrary.length === 0 || images.length >= MAX_IMAGES
          }
          tooltip={
            pendingLibrary.length === 0
              ? 'All fixture images attached'
              : `Attach ${pendingLibrary[0].name}`
          }
          onClick={addImage}
        />
      </div>
    </Field>
  );

  const linkRow = hasLink ? (
    <div style={styles.linkCard}>
      <HStack gap={2} vAlign="center">
        <div style={styles.linkFavicon} aria-hidden />
        <StackItem size="fill" style={{minWidth: 0}}>
          <VStack gap={0}>
            <Text type="body" weight="semibold" maxLines={1}>
              {LINK_TITLE}
            </Text>
            <Text type="supporting" color="secondary" maxLines={1}>
              {LINK_DOMAIN}
            </Text>
          </VStack>
        </StackItem>
        <IconButton
          label="Remove link card"
          tooltip="Remove link"
          size={isPhone ? 'md' : 'sm'}
          variant="ghost"
          isDisabled={isQueued}
          icon={<Icon icon={XIcon} size="sm" color="inherit" />}
          onClick={() => setHasLink(false)}
        />
      </HStack>
    </div>
  ) : (
    <Button
      label="Re-attach link card"
      size={isPhone ? 'md' : 'sm'}
      variant="secondary"
      isDisabled={isQueued}
      icon={<Icon icon={Link2Icon} size="sm" color="inherit" />}
      tooltip={LINK_URL}
      onClick={() => setHasLink(true)}
    />
  );

  const hashtagRow = (
    <VStack gap={1}>
      <HStack gap={1} vAlign="center">
        <Icon icon={HashIcon} size="sm" color="secondary" />
        <Text type="label">Suggested hashtags</Text>
      </HStack>
      <div style={styles.hashtagRow}>
        {HASHTAG_SUGGESTIONS.map(suggestion => {
          const isUsed = body.includes(suggestion.tag);
          return (
            <Tooltip
              key={suggestion.tag}
              content={
                isUsed
                  ? `${suggestion.usage} · click to remove from the draft`
                  : `${suggestion.usage} · click to append`
              }>
              <Token
                label={suggestion.tag}
                size={isPhone ? 'md' : 'sm'}
                color={isUsed ? 'green' : 'default'}
                isDisabled={isQueued}
                icon={
                  isUsed ? (
                    <Icon icon={CheckIcon} size="xsm" color="inherit" />
                  ) : undefined
                }
                onClick={() => toggleHashtag(suggestion.tag)}
              />
            </Tooltip>
          );
        })}
      </div>
    </VStack>
  );

  const queuedBanner = isQueued && (
    <Banner
      status="info"
      title={
        queuedSlot === 'Posting now'
          ? 'Posting now'
          : `Queued for ${queuedSlot}`
      }
      description={`Posting to ${
        enabledPlatforms.map(platform => platform.name).join(', ') || 'no platforms'
      } · ${images.length} ${images.length === 1 ? 'image' : 'images'}${
        hasLink ? ' · link card' : ''
      }. The draft is locked while queued.`}
      endContent={
        <Button
          label="Back to draft"
          size="sm"
          variant="secondary"
          icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
          onClick={unqueueDraft}
        />
      }
    />
  );

  const editorPane = (
    <div style={styles.editorScroll}>
      <VStack gap={4}>
        {queuedBanner}
        {crosspostBar}
        <TextArea
          label="Post text"
          isLabelHidden
          placeholder="What are you shipping?"
          rows={isPhone ? 7 : 6}
          width="100%"
          value={body}
          onChange={setBody}
          isDisabled={isQueued}
        />
        {countdownRow}
        <Divider />
        {mediaStrip}
        {linkRow}
        <Divider />
        {hashtagRow}
      </VStack>
    </div>
  );

  // ---- preview pane ----

  const previewPane = (
    <div style={styles.previewScroll}>
      <VStack gap={3}>
        {enabledPlatforms.length === 0 || activePlatform == null ? (
          <EmptyState
            isCompact
            icon={<Icon icon={Share2Icon} size="lg" />}
            title="Nothing to preview"
            description="Turn on a platform in the crosspost bar to see its preview."
          />
        ) : (
          <>
            <TabList
              value={activePlatform.id}
              onChange={value => setPreviewTab(value as PlatformId)}
              size={isPhone ? 'lg' : 'md'}
              layout="fill">
              {enabledPlatforms.map(platform => (
                <Tab
                  key={platform.id}
                  value={platform.id}
                  label={platform.name}
                  icon={<Icon icon={platform.icon} size="sm" color="inherit" />}
                />
              ))}
            </TabList>
            <Text type="supporting" color="secondary">
              {activePlatform.styleLabel} · {activePlatform.handle}
            </Text>
            <PlatformPreview
              platform={activePlatform}
              body={body}
              images={images}
              hasLink={hasLink}
            />
          </>
        )}
      </VStack>
    </div>
  );

  // ---- schedule popover ----

  const scheduleContent = (
    <div style={{padding: 'var(--spacing-3)'}}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <Icon icon={CalendarClockIcon} size="sm" color="secondary" />
          <Text type="body" weight="semibold">
            Publish
          </Text>
        </HStack>
        <Button
          label="Post now"
          variant="primary"
          size="sm"
          icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
          onClick={() => queueDraft('Posting now')}
        />
        <Divider />
        <VStack gap={1}>
          {SCHEDULE_SLOTS.map(slot => (
            <Button
              key={slot.id}
              label={`${slot.label} · ${slot.hint}`}
              variant="secondary"
              size="sm"
              icon={<Icon icon={ClockIcon} size="sm" color="inherit" />}
              onClick={() => queueDraft(slot.label)}
            />
          ))}
        </VStack>
        <Divider />
        <TimeInput
          label="Pick a time today"
          size="sm"
          value={pickTime}
          onChange={value => setPickTime(value ?? DEFAULT_PICK_TIME)}
          increment={15}
        />
        <Button
          label={`Queue for today ${formatTime12h(pickTime)}`}
          variant="secondary"
          size="sm"
          onClick={() => queueDraft(`Today ${formatTime12h(pickTime)}`)}
        />
      </VStack>
    </div>
  );

  const scheduleControl = isQueued ? (
    <HStack gap={1} vAlign="center">
      <Badge
        label={
          queuedSlot === 'Posting now' ? 'Posting now' : `Queued · ${queuedSlot}`
        }
        variant="success"
      />
      <IconButton
        label="Cancel queued post"
        tooltip="Back to draft"
        size={isPhone ? 'md' : 'sm'}
        variant="ghost"
        icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
        onClick={unqueueDraft}
      />
    </HStack>
  ) : (
    <Popover
      isOpen={isScheduleOpen}
      onOpenChange={setIsScheduleOpen}
      placement="below"
      alignment="end"
      width={300}
      label="Schedule post"
      content={scheduleContent}>
      <Button
        label="Schedule"
        size="sm"
        variant="primary"
        icon={<Icon icon={CalendarClockIcon} size="sm" color="inherit" />}
        isDisabled={queueBlocker != null}
        tooltip={queueBlocker ?? 'Post now or pick a slot'}
      />
    </Popover>
  );

  // ---- header ----

  const header = (
    <LayoutHeader hasDivider>
      {/* Phone tier: the row wraps so the pane switch and schedule controls
          drop under the title instead of clipping. */}
      <HStack gap={3} vAlign="center" wrap={isPhone ? 'wrap' : 'nowrap'}>
        <Icon icon={Share2Icon} size="md" color="secondary" />
        <StackItem size="fill">
          <HStack gap={2} vAlign="center" wrap={isPhone ? 'wrap' : 'nowrap'}>
            <Heading level={1}>New post</Heading>
            <Tooltip content="Pulse, Threadline, and Lensa are connected">
              <Badge label={ACCOUNT_BADGE} variant="blue" />
            </Tooltip>
            <Tooltip content="Images with alt text out of images attached">
              <Badge
                label={`Alt ${altDone}/${images.length}`}
                variant={
                  images.length > 0 && altDone === images.length
                    ? 'success'
                    : 'warning'
                }
              />
            </Tooltip>
          </HStack>
        </StackItem>
        {isSinglePane && (
          <SegmentedControl
            label="Pane"
            value={mobilePane}
            onChange={value => setMobilePane(value as 'compose' | 'preview')}
            size="sm">
            <SegmentedControlItem
              value="compose"
              label="Compose"
              icon={<Icon icon={PenLineIcon} size="sm" color="inherit" />}
            />
            <SegmentedControlItem
              value="preview"
              label="Preview"
              icon={<Icon icon={EyeIcon} size="sm" color="inherit" />}
            />
          </SegmentedControl>
        )}
        {scheduleControl}
      </HStack>
    </LayoutHeader>
  );

  // ---- frame ----

  if (isSinglePane) {
    return (
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            {mobilePane === 'compose' ? editorPane : previewPane}
          </LayoutContent>
        }
      />
    );
  }

  return (
    <Layout
      height="fill"
      header={header}
      content={<LayoutContent padding={0}>{editorPane}</LayoutContent>}
      end={
        <LayoutPanel
          width={isNarrowPanel ? 340 : 400}
          padding={0}
          hasDivider
          label="Platform previews">
          {previewPane}
        </LayoutPanel>
      }
    />
  );
}
