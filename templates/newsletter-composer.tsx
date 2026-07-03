// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Newsletter Block Composer — block-based email builder with a
 *   palette, live canvas, and per-block settings inspector.
 *
 * @input Deterministic fixtures only: issue 'Astryx Weekly #47 — July 2,
 *   2026' for an audience of 2,418 subscribers, seeded with six canvas
 *   blocks (Heading 'Ship notes: July', a two-sentence Paragraph, the
 *   'Design tokens v2 are live' Article card, a center-aligned Button
 *   block, a Divider, and the Lumen Labs Footer). Palette entries carry
 *   lucide glyphs and one-line hints. No Date.now(), Math.random(), or
 *   network assets — the article thumbnail is a CSS gradient placeholder.
 * @output A Mailchimp-style three-pane newsletter editor: a 240px block
 *   palette whose entries append a default block of that type to the
 *   canvas, a centered 600px 'email body' Card rendering the issue as a
 *   stack of selectable blocks (the selected block gets a ring plus a
 *   floating move-up / move-down / delete IconButton cluster), and a
 *   300px settings inspector whose controlled fields depend on the
 *   selected block type and write through to the canvas per keystroke.
 *   LayoutHeader carries the inline-editable issue name, the audience
 *   Badge, a Desktop/Mobile SegmentedControl that narrows the canvas to
 *   360px, a 'Send test' Button that fires a Toast, and a Schedule
 *   DropdownMenu.
 * @position Emitted by `astryx template newsletter-composer`.
 *
 * Frame (desktop, left to right):
 *   block palette 240px | canvas backdrop (fill, scrolls) | inspector 300px
 *
 * Container policy (WYSIWYG-editor archetype): the only Card is the email
 * body artifact on the canvas; each block inside it is a SelectableCard so
 * selection reads as a ring with zero layout jitter. Palette entries are
 * List rows; the inspector is a plain scrolling panel of controlled fields.
 *
 * Choose over form-page / form-wizard when the center pane is a WYSIWYG
 * artifact assembled from blocks with a palette and inspector; choose over
 * slide-deck-viewer because the canvas is editable, not presented. This is
 * the only mail surface where the email itself is the editable document —
 * inbox and messaging-shell read/triage inbound mail, and table-split-pane
 * pairs a record list with a detail pane rather than a composed artifact.
 *
 * Responsive contract:
 * - >1100px  — full three-pane frame (palette 240 | canvas | inspector 300).
 * - <=1100px — the palette collapses to a 64px icon-only rail; every icon
 *   keeps its label as a tooltip and still appends on click.
 * - <=860px  — the inspector leaves the frame and overlays the canvas from
 *   the right edge whenever a block is selected (with an explicit close
 *   button); the header drops the 'Send test' button to stay one row.
 * - <=640px  — the header HStack wraps instead of clipping: the viewport
 *   SegmentedControl and Schedule menu drop to a second row under the
 *   title, and the rename TextInput goes fluid (full row) instead of a
 *   fixed 280px. The rename/save IconButtons and the floating block-action
 *   cluster grow from sm (28px) to lg (36px) touch targets.
 * - The palette, canvas backdrop, and inspector scroll independently; the
 *   header never scrolls. The viewport SegmentedControl only changes the
 *   email body width (600px vs 360px), never the frame.
 *
 * Color policy: token-pure except the article thumbnail (styles.articleThumb),
 * a deterministic brand-gradient placeholder (indigo→teal linear gradient with
 * white/navy rgba() blobs) that stands in for hero art. Brand artwork renders
 * identically in both schemes, so its literals stay raw and the surface pins
 * colorScheme: 'light'. It is aria-hidden and carries no text, so no literals
 * sit on it. Every other color in the file is a var(--color-*) token.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  CalendarClockIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  HeadingIcon,
  MailIcon,
  MinusIcon,
  MonitorIcon,
  MousePointerClickIcon,
  NewspaperIcon,
  PanelBottomIcon,
  PencilLineIcon,
  PilcrowIcon,
  PlusIcon,
  SendIcon,
  SmartphoneIcon,
  SquareMousePointerIcon,
  Trash2Icon,
  XIcon,
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
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {ButtonGroup} from '@astryxdesign/core/ButtonGroup';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Field} from '@astryxdesign/core/Field';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {SelectableCard} from '@astryxdesign/core/SelectableCard';
import {Selector} from '@astryxdesign/core/Selector';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {useToast} from '@astryxdesign/core/Toast';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES — plain CSS properties with semantic tokens; the one exception is
// the article thumbnail's fixed gradient stops (deterministic placeholder,
// no network images).
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  paletteColumn: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    paddingBlock: 'var(--spacing-3)',
    paddingInline: 'var(--spacing-2)',
  },
  paletteHint: {
    paddingInline: 'var(--spacing-2)',
    paddingBottom: 'var(--spacing-2)',
  },
  paletteCompact: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    paddingBlock: 'var(--spacing-3)',
    alignItems: 'center',
  },
  // Canvas backdrop: muted body color so the email Card reads as paper.
  canvasWrap: {
    position: 'relative',
    height: '100%',
    minHeight: 0,
  },
  canvasScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-body)',
    padding: 'var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emailCard: {
    boxShadow: 'var(--shadow-med)',
  },
  emailBody: {
    paddingBlock: 'var(--spacing-5)',
    paddingInline: 'var(--spacing-4)',
  },
  blockWrap: {
    position: 'relative',
  },
  // Floating move/delete cluster on the selected block: sits half over the
  // block's top-right corner on its own surface so it never reflows content.
  blockActions: {
    position: 'absolute',
    top: -14,
    right: 8,
    zIndex: 2,
    borderRadius: 8,
    backgroundColor: 'var(--color-background-surface)',
    boxShadow: 'var(--shadow-med)',
  },
  // Rename mode on phones: the edit row claims the full header line so the
  // fluid TextInput and save button never push past the viewport.
  titleEditPhone: {
    width: '100%',
  },
  // Inspector: fixed 300px end panel on desktop; overlays the canvas <=860px.
  inspectorColumn: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  inspectorOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 300,
    zIndex: 3,
    backgroundColor: 'var(--color-background-surface)',
    borderLeft: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-high)',
  },
  // ---- email artifact styles (WYSIWYG content, token colors only) ----
  emailHeading: {
    fontWeight: 700,
    lineHeight: 1.25,
    color: 'var(--color-text-primary)',
  },
  emailParagraph: {
    lineHeight: 1.6,
    color: 'var(--color-text-primary)',
    whiteSpace: 'pre-line',
  },
  // Scheme-locked brand artwork: the thumbnail is a fixed indigo→teal brand
  // gradient placeholder that must look identical in light and dark mode, so
  // colorScheme is pinned and the gradient stops stay raw literals (see the
  // "Color policy" note in the file header). No text sits on this surface.
  articleThumb: {
    colorScheme: 'light',
    height: 140,
    borderRadius: 6,
    background: [
      'radial-gradient(circle at 82% 30%, rgba(255,255,255,0.30) 0 26px, rgba(255,255,255,0.14) 27px 44px, transparent 45px)',
      'radial-gradient(circle at 24% 78%, rgba(255,255,255,0.16) 0 34px, transparent 35px)',
      'radial-gradient(circle at 58% 112%, rgba(16,34,94,0.16) 0 56px, transparent 57px)',
      'linear-gradient(120deg, #5B6CF0 0%, #4C96DD 52%, #2CC7B0 100%)',
    ].join(', '),
  },
  articleTitle: {
    fontSize: 17,
    fontWeight: 600,
    lineHeight: 1.35,
    color: 'var(--color-text-primary)',
  },
  articleBlurb: {
    fontSize: 14,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
  },
  articleLink: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-accent)',
    textDecoration: 'underline',
  },
  ctaButton: {
    display: 'inline-block',
    paddingBlock: 10,
    paddingInline: 22,
    borderRadius: 6,
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-accent)',
    fontSize: 14,
    fontWeight: 600,
  },
  emailFooter: {
    fontSize: 12,
    lineHeight: 1.6,
    textAlign: 'center',
    color: 'var(--color-text-secondary)',
  },
  emailFooterLink: {
    textDecoration: 'underline',
  },
  dividerPad: {
    paddingBlock: 'var(--spacing-2)',
  },
};

// ---------------------------------------------------------------------------
// DATA — deterministic fixtures. Issue 'Astryx Weekly #47 — July 2, 2026'
// from Lumen Labs; six seeded blocks; no clocks, randomness, or images.
// ---------------------------------------------------------------------------

const AUDIENCE_LABEL = '2,418 subscribers';
const TEST_RECIPIENT = 'alex.chen@lumenlabs.io';

type BlockType =
  | 'heading'
  | 'paragraph'
  | 'article'
  | 'button'
  | 'divider'
  | 'footer';

type HeadingSize = 'sm' | 'md' | 'lg';
type Alignment = 'left' | 'center' | 'right';

interface HeadingBlock {
  id: string;
  type: 'heading';
  text: string;
  size: HeadingSize;
}

interface ParagraphBlock {
  id: string;
  type: 'paragraph';
  text: string;
  size: HeadingSize; // small / normal / large body copy
}

interface ArticleBlock {
  id: string;
  type: 'article';
  title: string;
  blurb: string;
  linkLabel: string;
  linkUrl: string;
}

interface ButtonBlock {
  id: string;
  type: 'button';
  label: string;
  url: string;
  align: Alignment;
}

interface DividerBlock {
  id: string;
  type: 'divider';
}

interface FooterBlock {
  id: string;
  type: 'footer';
  text: string;
  unsubscribeLabel: string;
}

type EmailBlock =
  | HeadingBlock
  | ParagraphBlock
  | ArticleBlock
  | ButtonBlock
  | DividerBlock
  | FooterBlock;

const HEADING_PX: Record<HeadingSize, number> = {sm: 20, md: 26, lg: 32};
const PARAGRAPH_PX: Record<HeadingSize, number> = {sm: 13, md: 15, lg: 17};

const BLOCK_LABELS: Record<BlockType, string> = {
  heading: 'Heading',
  paragraph: 'Paragraph',
  article: 'Article card',
  button: 'Button',
  divider: 'Divider',
  footer: 'Footer',
};

const PALETTE: Array<{
  type: BlockType;
  label: string;
  hint: string;
  icon: typeof HeadingIcon;
}> = [
  {
    type: 'heading',
    label: 'Heading',
    hint: 'Section title in three sizes',
    icon: HeadingIcon,
  },
  {
    type: 'paragraph',
    label: 'Paragraph',
    hint: 'Body copy with a size control',
    icon: PilcrowIcon,
  },
  {
    type: 'article',
    label: 'Article card',
    hint: 'Thumbnail, blurb, and link',
    icon: NewspaperIcon,
  },
  {
    type: 'button',
    label: 'Button',
    hint: 'Call-to-action with alignment',
    icon: MousePointerClickIcon,
  },
  {
    type: 'divider',
    label: 'Divider',
    hint: 'Thin rule between sections',
    icon: MinusIcon,
  },
  {
    type: 'footer',
    label: 'Footer',
    hint: 'Address and unsubscribe row',
    icon: PanelBottomIcon,
  },
];

const INITIAL_BLOCKS: EmailBlock[] = [
  {id: 'blk-1', type: 'heading', text: 'Ship notes: July', size: 'lg'},
  {
    id: 'blk-2',
    type: 'paragraph',
    text: 'The 2.4 release landed on every workspace this morning, headlined by the new shared theming pipeline. Below is what changed, what it unlocks, and one date worth putting on your calendar.',
    size: 'md',
  },
  {
    id: 'blk-3',
    type: 'article',
    title: 'Design tokens v2 are live',
    blurb:
      'Every color, radius, and shadow now resolves from a single published token set, so brand updates roll out to product and email in one release.',
    linkLabel: 'Read the changelog',
    linkUrl: 'https://lumenlabs.example/changelog/tokens-v2',
  },
  {
    id: 'blk-4',
    type: 'button',
    label: 'Register for the July webinar',
    url: 'https://lumenlabs.example/webinar/july',
    align: 'center',
  },
  {id: 'blk-5', type: 'divider'},
  {
    id: 'blk-6',
    type: 'footer',
    text: 'Lumen Labs · 500 Harbor Blvd',
    unsubscribeLabel: 'Unsubscribe',
  },
];

/** Default block appended when a palette entry is clicked. */
function defaultBlock(type: BlockType, id: string): EmailBlock {
  switch (type) {
    case 'heading':
      return {id, type, text: 'New section heading', size: 'md'};
    case 'paragraph':
      return {
        id,
        type,
        text: 'Write a short update for your readers here.',
        size: 'md',
      };
    case 'article':
      return {
        id,
        type,
        title: 'New article',
        blurb: 'One or two sentences that sell the click.',
        linkLabel: 'Read more',
        linkUrl: 'https://lumenlabs.example/blog',
      };
    case 'button':
      return {
        id,
        type,
        label: 'Call to action',
        url: 'https://lumenlabs.example',
        align: 'center',
      };
    case 'divider':
      return {id, type};
    case 'footer':
      return {
        id,
        type,
        text: 'Lumen Labs · 500 Harbor Blvd',
        unsubscribeLabel: 'Unsubscribe',
      };
  }
}

// ---------------------------------------------------------------------------
// EMAIL BLOCK RENDERING — the WYSIWYG artifact inside the 600px body Card.
// ---------------------------------------------------------------------------

function EmailBlockContent({block}: {block: EmailBlock}) {
  switch (block.type) {
    case 'heading':
      return (
        <div style={{...styles.emailHeading, fontSize: HEADING_PX[block.size]}}>
          {block.text}
        </div>
      );
    case 'paragraph':
      return (
        <div
          style={{...styles.emailParagraph, fontSize: PARAGRAPH_PX[block.size]}}>
          {block.text}
        </div>
      );
    case 'article':
      return (
        <VStack gap={2}>
          {/* CSS gradient placeholder — no network images. */}
          <div style={styles.articleThumb} aria-hidden />
          <div style={styles.articleTitle}>{block.title}</div>
          <div style={styles.articleBlurb}>{block.blurb}</div>
          <span style={styles.articleLink}>{block.linkLabel} →</span>
        </VStack>
      );
    case 'button':
      return (
        <div style={{textAlign: block.align}}>
          <span style={styles.ctaButton}>{block.label}</span>
        </div>
      );
    case 'divider':
      return (
        <div style={styles.dividerPad}>
          <Divider />
        </div>
      );
    case 'footer':
      return (
        <div style={styles.emailFooter}>
          {block.text} ·{' '}
          <span style={styles.emailFooterLink}>{block.unsubscribeLabel}</span>
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function NewsletterComposerTemplate() {
  const toast = useToast();

  const [issueTitle, setIssueTitle] = useState(
    'Astryx Weekly #47 — July 2, 2026',
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  const [blocks, setBlocks] = useState<EmailBlock[]>(INITIAL_BLOCKS);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    'blk-1',
  );
  const [nextBlockNumber, setNextBlockNumber] = useState(7);
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [scheduleLabel, setScheduleLabel] = useState<string | null>(null);

  // Responsive contract (see file header).
  const isPaletteCompact = useMediaQuery('(max-width: 1100px)');
  const isInspectorOverlay = useMediaQuery('(max-width: 860px)');
  // Phone tier: the header wraps onto a second row and the sm (28px)
  // rename/save + block-action controls grow to lg (36px) touch targets.
  const isPhone = useMediaQuery('(max-width: 640px)');
  const touchControlSize = isPhone ? ('lg' as const) : ('sm' as const);

  const selectedIndex = blocks.findIndex(block => block.id === selectedBlockId);
  const selectedBlock = selectedIndex === -1 ? null : blocks[selectedIndex];
  const canvasWidth = viewport === 'desktop' ? 600 : 360;

  // ---- block operations ----

  const patchBlock = (id: string, patch: object) => {
    setBlocks(prev =>
      prev.map(block =>
        block.id === id ? ({...block, ...patch} as EmailBlock) : block,
      ),
    );
  };

  const appendBlock = (type: BlockType) => {
    const id = `blk-${nextBlockNumber}`;
    setNextBlockNumber(n => n + 1);
    setBlocks(prev => [...prev, defaultBlock(type, id)]);
    setSelectedBlockId(id);
  };

  const moveBlock = (id: string, delta: -1 | 1) => {
    setBlocks(prev => {
      const index = prev.findIndex(block => block.id === id);
      const target = index + delta;
      if (index === -1 || target < 0 || target >= prev.length) {
        return prev;
      }
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const deleteBlock = (id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id));
    setSelectedBlockId(null);
  };

  // ---- header actions ----

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed !== '') {
      setIssueTitle(trimmed);
    }
    setIsEditingTitle(false);
  };

  const sendTest = () => {
    toast({body: `Test sent to ${TEST_RECIPIENT}`});
  };

  const schedule = (label: string) => {
    setScheduleLabel(label);
    toast({
      body:
        label === 'Send now'
          ? `Issue queued — sending to ${AUDIENCE_LABEL}`
          : `Scheduled: ${label}`,
      uniqueID: 'newsletter-schedule',
    });
  };

  // ---- palette ----

  const palette = isPaletteCompact ? (
    <VStack gap={1} style={styles.paletteCompact}>
      {PALETTE.map(entry => (
        <IconButton
          key={entry.type}
          label={`Add ${entry.label.toLowerCase()} block`}
          tooltip={`${entry.label} — ${entry.hint.toLowerCase()}`}
          icon={<Icon icon={entry.icon} size="sm" color="inherit" />}
          variant="ghost"
          onClick={() => appendBlock(entry.type)}
        />
      ))}
    </VStack>
  ) : (
    <div style={styles.paletteColumn}>
      <div style={styles.paletteHint}>
        <Text type="supporting" color="secondary">
          Click a block to add it to the end of the issue.
        </Text>
      </div>
      <List density="compact" hasDividers={false}>
        {PALETTE.map(entry => (
          <ListItem
            key={entry.type}
            label={entry.label}
            description={entry.hint}
            onClick={() => appendBlock(entry.type)}
            startContent={
              <Icon icon={entry.icon} size="sm" color="secondary" />
            }
            endContent={<Icon icon={PlusIcon} size="sm" color="secondary" />}
          />
        ))}
      </List>
    </div>
  );

  // ---- canvas ----

  const canvas = (
    <div style={styles.canvasScroll}>
      <VStack gap={2} style={{width: canvasWidth, maxWidth: '100%'}}>
        <Text type="supporting" color="secondary">
          {viewport === 'desktop' ? 'Desktop · 600px' : 'Mobile · 360px'} ·{' '}
          {blocks.length} {blocks.length === 1 ? 'block' : 'blocks'}
        </Text>
        <Card padding={0} style={styles.emailCard}>
          <div style={styles.emailBody}>
            {blocks.length === 0 ? (
              <EmptyState
                isCompact
                icon={<Icon icon={MailIcon} size="lg" />}
                title="Empty issue"
                description="Add blocks from the palette to start the email."
              />
            ) : (
              <VStack gap={1}>
                {blocks.map((block, index) => {
                  const isSelected = block.id === selectedBlockId;
                  return (
                    <div key={block.id} style={styles.blockWrap}>
                      <SelectableCard
                        label={`${BLOCK_LABELS[block.type]} block ${index + 1}`}
                        isSelected={isSelected}
                        onChange={next =>
                          setSelectedBlockId(next ? block.id : null)
                        }
                        variant="transparent"
                        padding={3}>
                        <EmailBlockContent block={block} />
                      </SelectableCard>
                      {isSelected && (
                        <div
                          style={{
                            ...styles.blockActions,
                            // Keep the cluster half over the block's top
                            // edge when the buttons grow to 36px on phones.
                            ...(isPhone ? {top: -18} : null),
                          }}>
                          <ButtonGroup
                            label="Block actions"
                            size={touchControlSize}>
                            <IconButton
                              label="Move block up"
                              tooltip="Move up"
                              size={touchControlSize}
                              variant="secondary"
                              icon={
                                <Icon
                                  icon={ChevronUpIcon}
                                  size="sm"
                                  color="inherit"
                                />
                              }
                              isDisabled={index === 0}
                              onClick={() => moveBlock(block.id, -1)}
                            />
                            <IconButton
                              label="Move block down"
                              tooltip="Move down"
                              size={touchControlSize}
                              variant="secondary"
                              icon={
                                <Icon
                                  icon={ChevronDownIcon}
                                  size="sm"
                                  color="inherit"
                                />
                              }
                              isDisabled={index === blocks.length - 1}
                              onClick={() => moveBlock(block.id, 1)}
                            />
                            <IconButton
                              label="Delete block"
                              tooltip="Delete block"
                              size={touchControlSize}
                              variant="secondary"
                              icon={
                                <Icon
                                  icon={Trash2Icon}
                                  size="sm"
                                  color="inherit"
                                />
                              }
                              onClick={() => deleteBlock(block.id)}
                            />
                          </ButtonGroup>
                        </div>
                      )}
                    </div>
                  );
                })}
              </VStack>
            )}
          </div>
        </Card>
      </VStack>
    </div>
  );

  // ---- inspector ----

  const inspectorFields = (block: EmailBlock) => {
    switch (block.type) {
      case 'heading':
        return (
          <VStack gap={3}>
            <TextInput
              label="Text"
              value={block.text}
              onChange={value => patchBlock(block.id, {text: value})}
              size="sm"
            />
            <Field label="Size" inputID="heading-size-control">
              <div id="heading-size-control">
                <SegmentedControl
                  label="Heading size"
                  value={block.size}
                  onChange={value =>
                    patchBlock(block.id, {size: value as HeadingSize})
                  }
                  size="sm">
                  <SegmentedControlItem value="sm" label="S" />
                  <SegmentedControlItem value="md" label="M" />
                  <SegmentedControlItem value="lg" label="L" />
                </SegmentedControl>
              </div>
            </Field>
          </VStack>
        );
      case 'paragraph':
        return (
          <VStack gap={3}>
            <TextArea
              label="Text"
              value={block.text}
              onChange={value => patchBlock(block.id, {text: value})}
              rows={5}
            />
            <Selector
              label="Text size"
              options={[
                {value: 'sm', label: 'Small'},
                {value: 'md', label: 'Normal'},
                {value: 'lg', label: 'Large'},
              ]}
              value={block.size}
              onChange={value =>
                patchBlock(block.id, {size: value as HeadingSize})
              }
              size="sm"
            />
          </VStack>
        );
      case 'article':
        return (
          <VStack gap={3}>
            <TextInput
              label="Title"
              value={block.title}
              onChange={value => patchBlock(block.id, {title: value})}
              size="sm"
            />
            <TextArea
              label="Blurb"
              value={block.blurb}
              onChange={value => patchBlock(block.id, {blurb: value})}
              rows={4}
            />
            <TextInput
              label="Link label"
              value={block.linkLabel}
              onChange={value => patchBlock(block.id, {linkLabel: value})}
              size="sm"
            />
            <TextInput
              label="Link URL"
              value={block.linkUrl}
              onChange={value => patchBlock(block.id, {linkUrl: value})}
              size="sm"
            />
          </VStack>
        );
      case 'button':
        return (
          <VStack gap={3}>
            <TextInput
              label="Label"
              value={block.label}
              onChange={value => patchBlock(block.id, {label: value})}
              size="sm"
            />
            <TextInput
              label="URL"
              value={block.url}
              onChange={value => patchBlock(block.id, {url: value})}
              size="sm"
            />
            <Field label="Alignment" inputID="button-align-control">
              <div id="button-align-control">
                <SegmentedControl
                  label="Button alignment"
                  value={block.align}
                  onChange={value =>
                    patchBlock(block.id, {align: value as Alignment})
                  }
                  size="sm">
                  <SegmentedControlItem
                    value="left"
                    label="Align left"
                    isLabelHidden
                    icon={<Icon icon={AlignLeftIcon} size="sm" color="inherit" />}
                  />
                  <SegmentedControlItem
                    value="center"
                    label="Align center"
                    isLabelHidden
                    icon={
                      <Icon icon={AlignCenterIcon} size="sm" color="inherit" />
                    }
                  />
                  <SegmentedControlItem
                    value="right"
                    label="Align right"
                    isLabelHidden
                    icon={
                      <Icon icon={AlignRightIcon} size="sm" color="inherit" />
                    }
                  />
                </SegmentedControl>
              </div>
            </Field>
          </VStack>
        );
      case 'divider':
        return (
          <Text type="supporting" color="secondary">
            Dividers have no settings. Use the floating controls on the canvas
            to move or delete this block.
          </Text>
        );
      case 'footer':
        return (
          <VStack gap={3}>
            <TextArea
              label="Address line"
              value={block.text}
              onChange={value => patchBlock(block.id, {text: value})}
              rows={2}
            />
            <TextInput
              label="Unsubscribe label"
              value={block.unsubscribeLabel}
              onChange={value =>
                patchBlock(block.id, {unsubscribeLabel: value})
              }
              size="sm"
            />
          </VStack>
        );
    }
  };

  const inspector: ReactNode = (
    <div style={styles.inspectorColumn}>
      {selectedBlock === null ? (
        <EmptyState
          isCompact
          icon={<Icon icon={SquareMousePointerIcon} size="lg" />}
          title="Select a block to edit"
          description="Click any block on the canvas, or add one from the palette."
        />
      ) : (
        <VStack gap={3}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Heading level={2}>{BLOCK_LABELS[selectedBlock.type]}</Heading>
            </StackItem>
            <Badge
              label={`Block ${selectedIndex + 1} of ${blocks.length}`}
              variant="neutral"
            />
            {isInspectorOverlay && (
              <IconButton
                label="Close inspector"
                size="sm"
                variant="ghost"
                icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                onClick={() => setSelectedBlockId(null)}
              />
            )}
          </HStack>
          <Divider />
          {inspectorFields(selectedBlock)}
        </VStack>
      )}
    </div>
  );

  // ---- header ----

  const titleArea = isEditingTitle ? (
    // On phones the rename row goes full width so the fluid TextInput and
    // save button share the row instead of clipping at a fixed 280px.
    <HStack
      gap={1}
      vAlign="center"
      style={isPhone ? styles.titleEditPhone : undefined}>
      <StackItem size={isPhone ? 'fill' : 'static'}>
        <TextInput
          label="Issue name"
          isLabelHidden
          size="sm"
          width={isPhone ? '100%' : 280}
          value={titleDraft}
          onChange={setTitleDraft}
          onEnter={commitTitle}
          hasAutoFocus
        />
      </StackItem>
      <IconButton
        label="Save issue name"
        tooltip="Save name"
        size={touchControlSize}
        variant="secondary"
        icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
        onClick={commitTitle}
      />
    </HStack>
  ) : (
    <HStack gap={1} vAlign="center">
      <Heading level={1}>{issueTitle}</Heading>
      <IconButton
        label="Rename issue"
        tooltip="Rename issue"
        size={touchControlSize}
        variant="ghost"
        icon={<Icon icon={PencilLineIcon} size="sm" color="inherit" />}
        onClick={() => {
          setTitleDraft(issueTitle);
          setIsEditingTitle(true);
        }}
      />
    </HStack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          {/* Phone tier: both header rows wrap so the viewport control and
              Schedule menu drop below the title instead of clipping. */}
          <HStack gap={3} vAlign="center" wrap={isPhone ? 'wrap' : 'nowrap'}>
            <Icon icon={MailIcon} size="md" color="secondary" />
            <StackItem size="fill">
              <HStack
                gap={2}
                vAlign="center"
                wrap={isPhone ? 'wrap' : 'nowrap'}>
                {titleArea}
                <Tooltip content="Audience: all subscribers · synced July 1, 2026">
                  <Badge label={AUDIENCE_LABEL} variant="blue" />
                </Tooltip>
                {scheduleLabel !== null && (
                  <Badge label={`Scheduled · ${scheduleLabel}`} variant="green" />
                )}
              </HStack>
            </StackItem>
            <SegmentedControl
              label="Canvas viewport"
              value={viewport}
              onChange={value => setViewport(value as 'desktop' | 'mobile')}
              size="sm">
              <SegmentedControlItem
                value="desktop"
                label="Desktop"
                isLabelHidden
                icon={<Icon icon={MonitorIcon} size="sm" color="inherit" />}
              />
              <SegmentedControlItem
                value="mobile"
                label="Mobile"
                isLabelHidden
                icon={<Icon icon={SmartphoneIcon} size="sm" color="inherit" />}
              />
            </SegmentedControl>
            {!isInspectorOverlay && (
              <Button
                label="Send test"
                size="sm"
                variant="secondary"
                icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
                tooltip={`Send a test to ${TEST_RECIPIENT}`}
                onClick={sendTest}
              />
            )}
            <DropdownMenu
              button={{
                label: 'Schedule',
                size: 'sm',
                variant: 'primary',
                icon: <Icon icon={CalendarClockIcon} size="sm" color="inherit" />,
              }}
              items={[
                {
                  label: 'Send now',
                  icon: SendIcon,
                  onClick: () => schedule('Send now'),
                },
                {
                  label: 'Tomorrow 8:00 AM',
                  icon: ClockIcon,
                  onClick: () => schedule('Tomorrow 8:00 AM'),
                },
                {
                  label: 'Custom…',
                  icon: CalendarClockIcon,
                  onClick: () => schedule('Custom'),
                },
              ]}
            />
          </HStack>
        </LayoutHeader>
      }
      start={
        <LayoutPanel
          width={isPaletteCompact ? 64 : 240}
          padding={0}
          hasDivider
          label="Block palette">
          {palette}
        </LayoutPanel>
      }
      content={
        <LayoutContent padding={0}>
          <div style={styles.canvasWrap}>
            {canvas}
            {isInspectorOverlay && selectedBlock !== null && (
              <div style={styles.inspectorOverlay}>{inspector}</div>
            )}
          </div>
        </LayoutContent>
      }
      end={
        isInspectorOverlay ? undefined : (
          <LayoutPanel width={300} padding={0} hasDivider label="Block settings">
            {inspector}
          </LayoutPanel>
        )
      }
    />
  );
}
