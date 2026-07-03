var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one deck outline —
 *   'customer-onboarding-playbook.pptx' as a flat ordered list of 25 rows,
 *   each {id, level, text}: 7 level-0 slide titles with nested level-1
 *   bullets and three level-2 sub-bullets; stable string ids like 'row-3-2';
 *   initial selection seeded on slide 3's title row)
 * @output Text-first slide OUTLINE editor: the left fill pane is the
 *   hierarchical outline — bold numbered slide-title rows with bullet rows
 *   indented one or two levels, each row carrying a grip glyph, inline Text
 *   that swaps to a TextInput on a second click (or the Pencil button) and
 *   commits on Enter/blur, and hover-revealed IconButtons for
 *   promote/demote (Outdent/Indent), move up/down, and delete, each disabled
 *   where the structure makes the move illegal (collapsed into one per-row
 *   MoreMenu at phone width). The right 380px panel
 *   renders the SELECTED row's slide live as a mini 4:3 white SlideShape
 *   canvas (title shape + bullets shape derived from the outline children)
 *   above a MetadataList (slide n of 7, bullets, words, characters) and an
 *   EmptyState when the slide has no bullets. Demoting a title merges its
 *   slide into the previous one; promoting a bullet to level 0 splits a new
 *   slide — both renumber and repaint the preview; 'Add slide' appends an
 *   'Untitled slide' title and opens it in edit mode
 * @position Page template; emitted by \`astryx template slide-outline-editor\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the deck chrome
 * (ListTree icon, filename Heading, derived '7 slides · 22 bullets'
 * counter, compact-mode preview toggle, primary 'Add slide' Button).
 * LayoutContent (padding 0) is the scrollable outline. LayoutPanel end 380
 * hosts the live preview + metadata. Choose over slide-editor-canvas when
 * authoring happens in a TEXT hierarchy, not on a spatial canvas; choose
 * over slide-deck-viewer because the preview is a single derived miniature,
 * not a paged stage. Archetype: structured-list-plus-detail — closest to
 * table-tree but content-authoring.
 *
 * Responsive contract:
 * - >900px: header | outline (fill, scrolls) | preview panel 380 fixed.
 * - <=900px: the preview panel collapses behind a header Eye toggle that
 *   overlays it as a bottom sheet-style block under the outline (max 46%
 *   height, its own scroll, raised shadow); the outline keeps the
 *   remaining height.
 * - <=640px: the six per-row action IconButtons (hover-revealed on
 *   desktop, but space-reserving even while hidden) collapse into one
 *   always-visible md MoreMenu per row — hover cannot reveal them on
 *   touch, and the ~168px cluster would leave the row text a sliver at
 *   375px. The menu fences the destructive Delete behind a divider.
 * - The mini slide canvas uses container-query (cqw) type sizing so the
 *   same shape fixtures paint correctly at any panel width.
 *
 * Container policy (structured-list-plus-detail archetype): frame-first
 * rows and panels; the only Card is the slide paper itself — white
 * regardless of theme (colorScheme locked to light, like real slide
 * paper). Fixtures are fixed strings; counters, numbering, the preview
 * shapes, and all metadata derive live from the edited row state — no
 * clocks, randomness, or network assets.
 */

import {useState, type CSSProperties} from 'react';

import {
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  EyeOffIcon,
  GripVerticalIcon,
  IndentIcon,
  ListTreeIcon,
  OutdentIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
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
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import type {DropdownMenuOption} from '@astryxdesign/core/DropdownMenu';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= SLIDE PAINT CONSTANTS =============
// The preview surface is "paper": literal light colors locked with
// colorScheme:'light' so the miniature looks identical in dark mode.

const SLIDE_TEXT = '#1C2733';
const SLIDE_MUTED = '#6E7D8B';
const SLIDE_ACCENT = '#0B5FAE';

// Canvas grid: classic 4:3 PowerPoint page, 960x720 virtual units.
const CANVAS_W = 960;
const CANVAS_H = 720;

/** Horizontal canvas unit -> percentage of slide width. */
const pctX = (v: number) => \`\${((v / CANVAS_W) * 100).toFixed(3)}%\`;
/** Vertical canvas unit -> percentage of slide height. */
const pctY = (v: number) => \`\${((v / CANVAS_H) * 100).toFixed(3)}%\`;
/**
 * Canvas px -> container-query width units. The canvas div is a container
 * (inline-size), so 1cqw = 1% of the rendered slide width; the derived
 * shapes paint correctly at any preview width.
 */
const cqw = (v: number) => \`\${((v / CANVAS_W) * 100).toFixed(3)}cqw\`;

// Outline indentation per level: 0 / 24 / 48 px.
const INDENT_PER_LEVEL = 24;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  fill: {height: '100%', minHeight: 0},
  outlineScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-2) var(--spacing-2) var(--spacing-6)',
  },
  // One outline row: flex line with a transparent left rail that turns
  // blue when selected (literal blue tokens — the branded accent goes
  // near-black and would read as a heavy meter); hover paints the muted
  // wash. minHeight keeps the line stable whether the action cluster or
  // the inline TextInput shows.
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minHeight: 36,
    padding: '2px var(--spacing-3) 2px var(--spacing-2)',
    borderLeft: '3px solid transparent',
    cursor: 'pointer',
  },
  numberBox: {
    width: 24,
    flexShrink: 0,
    textAlign: 'right',
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
  },
  previewCard: {
    overflow: 'hidden',
    boxShadow: 'var(--shadow-high)',
  },
  // The slide surface: white paper, container for cqw type sizing.
  canvas: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    color: SLIDE_TEXT,
    colorScheme: 'light',
    containerType: 'inline-size',
    overflow: 'hidden',
  },
  // <=900px: the preview overlays as a bottom sheet-style block under the
  // outline — raised shadow, own scroll, capped height.
  sheet: {
    flex: '0 0 auto',
    maxHeight: '46%',
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
    boxShadow: 'var(--shadow-high)',
  },
};

// ============= DATA =============
// Deterministic fixtures: one deck outline as a flat ordered row list.
// Stable string ids ('row-3-2'); every counter derives from state.

const DECK_FILE_NAME = 'customer-onboarding-playbook.pptx';
const INITIAL_SELECTED_ROW_ID = 'row-3-0'; // slide 3's title row

type OutlineLevel = 0 | 1 | 2;

interface OutlineRow {
  id: string;
  level: OutlineLevel;
  text: string;
}

const INITIAL_ROWS: OutlineRow[] = [
  // Slide 1 — title-only cover.
  {id: 'row-1-0', level: 0, text: 'Customer Onboarding Playbook'},
  // Slide 2 — 3 bullets, one with a level-2 child.
  {id: 'row-2-0', level: 0, text: 'Why onboarding matters'},
  {id: 'row-2-1', level: 1, text: 'Churn concentrates in the first 90 days'},
  {id: 'row-2-2', level: 1, text: 'Activated accounts renew at 92%'},
  {id: 'row-2-3', level: 2, text: 'NPS lift after day-30 check-in'},
  {id: 'row-2-4', level: 1, text: 'Support load drops once setup is guided'},
  // Slide 3 — 4 bullets; its title row is the initial selection.
  {id: 'row-3-0', level: 0, text: 'The first 14 days'},
  {id: 'row-3-1', level: 1, text: 'Day 0: provision workspace and invite admins'},
  {id: 'row-3-2', level: 1, text: 'Day 3: data import validated with the champion'},
  {id: 'row-3-3', level: 1, text: 'Day 7: first team workflow goes live'},
  {id: 'row-3-4', level: 1, text: 'Day 14: exec readout and success criteria'},
  // Slide 4 — 3 bullets + 2 level-2 children.
  {id: 'row-4-0', level: 0, text: 'Kickoff call script'},
  {id: 'row-4-1', level: 1, text: 'Confirm the business outcome, not the feature list'},
  {id: 'row-4-2', level: 1, text: 'Map the rollout team'},
  {id: 'row-4-3', level: 2, text: 'Champion owns weekly check-ins'},
  {id: 'row-4-4', level: 2, text: 'IT sponsor owns SSO and provisioning'},
  {id: 'row-4-5', level: 1, text: 'Book the day-14 exec readout before hanging up'},
  // Slide 5 — 3 bullets.
  {id: 'row-5-0', level: 0, text: 'Health scoring'},
  {id: 'row-5-1', level: 1, text: 'Green: weekly active admins and one live workflow'},
  {id: 'row-5-2', level: 1, text: 'Yellow: setup stalled for more than 5 days'},
  {id: 'row-5-3', level: 1, text: 'Red: no login since kickoff'},
  // Slide 6 — 2 bullets.
  {id: 'row-6-0', level: 0, text: 'Escalation paths'},
  {id: 'row-6-1', level: 1, text: 'Yellow accounts: CSM plays the stalled-setup runbook'},
  {id: 'row-6-2', level: 1, text: 'Red accounts: AE + CSM joint call within 48 hours'},
  // Slide 7 — 4 bullets.
  {id: 'row-7-0', level: 0, text: 'Rollout checklist'},
  {id: 'row-7-1', level: 1, text: 'Pilot with two CSMs through August'},
  {id: 'row-7-2', level: 1, text: 'Template library shipped to the whole team'},
  {id: 'row-7-3', level: 1, text: 'Health score wired into the CRM'},
  {id: 'row-7-4', level: 1, text: 'Playbook review every quarter'},
];

// ============= OUTLINE STRUCTURE HELPERS =============
// The outline is a flat array; a row's "block" is the row plus every
// following row with a deeper level (its children).

/** Exclusive end index of the block rooted at \`index\`. */
function blockEnd(rows: OutlineRow[], index: number): number {
  const level = rows[index].level;
  let end = index + 1;
  while (end < rows.length && rows[end].level > level) {
    end += 1;
  }
  return end;
}

/** Index of the previous sibling at the same level, or -1. */
function prevSiblingIndex(rows: OutlineRow[], index: number): number {
  const level = rows[index].level;
  for (let i = index - 1; i >= 0; i -= 1) {
    if (rows[i].level < level) {
      return -1;
    }
    if (rows[i].level === level) {
      return i;
    }
  }
  return -1;
}

/** Whether the block at \`index\` has a following sibling at the same level. */
function hasNextSibling(rows: OutlineRow[], index: number): boolean {
  const end = blockEnd(rows, index);
  return end < rows.length && rows[end].level === rows[index].level;
}

/**
 * Demote = indent one level. Titles may only demote when a previous slide
 * exists (the merge target); bullets may not indent past parent+1 — the
 * new level must not exceed the previous row's level + 1.
 */
function canIndent(rows: OutlineRow[], index: number): boolean {
  const row = rows[index];
  if (row.level >= 2 || index === 0) {
    return false;
  }
  return rows[index - 1].level >= row.level;
}

/** Promote = outdent one level; level-0 titles have nowhere to go. */
function canOutdent(rows: OutlineRow[], index: number): boolean {
  return rows[index].level > 0;
}

/**
 * Demote the row one level. Its children keep their levels, so demoting a
 * title merges the whole slide into the previous one: the title becomes a
 * bullet and its bullets append to the previous slide.
 */
function indentRow(rows: OutlineRow[], index: number): OutlineRow[] {
  return rows.map((row, i) =>
    i === index ? {...row, level: (row.level + 1) as OutlineLevel} : row,
  );
}

/**
 * Promote the row AND its children one level, so a promoted bullet becomes
 * a new slide (splitting the old one — following siblings fall under the
 * new title) and its sub-bullets become its bullets.
 */
function outdentRow(rows: OutlineRow[], index: number): OutlineRow[] {
  const end = blockEnd(rows, index);
  return rows.map((row, i) =>
    i >= index && i < end
      ? {...row, level: (row.level - 1) as OutlineLevel}
      : row,
  );
}

/** Swap the row's block with the previous sibling's block. */
function moveBlockUp(rows: OutlineRow[], index: number): OutlineRow[] {
  const prev = prevSiblingIndex(rows, index);
  if (prev < 0) {
    return rows;
  }
  const end = blockEnd(rows, index);
  return [
    ...rows.slice(0, prev),
    ...rows.slice(index, end),
    ...rows.slice(prev, index),
    ...rows.slice(end),
  ];
}

/** Swap the row's block with the next sibling's block. */
function moveBlockDown(rows: OutlineRow[], index: number): OutlineRow[] {
  if (!hasNextSibling(rows, index)) {
    return rows;
  }
  const end = blockEnd(rows, index);
  const nextEnd = blockEnd(rows, end);
  return [
    ...rows.slice(0, index),
    ...rows.slice(end, nextEnd),
    ...rows.slice(index, end),
    ...rows.slice(nextEnd),
  ];
}

// ============= DERIVED SLIDES =============

interface SlideBullet {
  id: string;
  level: 1 | 2;
  text: string;
}

interface DerivedSlide {
  key: string;
  number: number; // 1-based
  title: string;
  titleRowId: string | null;
  rowIds: string[];
  bullets: SlideBullet[];
}

/** Group the flat outline into slides at every level-0 row. */
function deriveSlides(rows: OutlineRow[]): DerivedSlide[] {
  const slides: DerivedSlide[] = [];
  for (const row of rows) {
    if (row.level === 0 || slides.length === 0) {
      slides.push({
        key: row.level === 0 ? row.id : \`orphan-\${row.id}\`,
        number: slides.length + 1,
        title: row.level === 0 ? row.text : '(untitled slide)',
        titleRowId: row.level === 0 ? row.id : null,
        rowIds: [],
        bullets: [],
      });
    }
    const slide = slides[slides.length - 1];
    slide.rowIds.push(row.id);
    if (row.level > 0) {
      slide.bullets.push({id: row.id, level: row.level as 1 | 2, text: row.text});
    }
  }
  return slides;
}

const countWords = (text: string) =>
  text.split(/\\s+/).filter(Boolean).length;

// ============= SLIDE SHAPE RENDERER =============
// Same model as the deck viewer: the slide is a list of positioned shapes
// on a 960x720 grid; here the shapes are DERIVED from the outline rows.

interface ShapeFrame {
  x: number;
  y: number;
  w: number;
}

type SlideShape =
  | (ShapeFrame & {kind: 'bar'; h: number})
  | (ShapeFrame & {kind: 'title'; text: string; size: number})
  | (ShapeFrame & {kind: 'bullets'; items: SlideBullet[]; size: number});

/** Title shape + bullets shape generated from the outline slide. */
function shapesForSlide(slide: DerivedSlide): SlideShape[] {
  if (slide.bullets.length === 0) {
    // Title-only cover layout, vertically centered.
    return [
      {kind: 'bar', x: 120, y: 252, w: 72, h: 10},
      {kind: 'title', x: 120, y: 288, w: 720, text: slide.title, size: 52},
    ];
  }
  // Shrink body type a little as the bullet list grows so it stays on the
  // paper (pure derivation — no measurement).
  const size = slide.bullets.length > 5 ? 22 : 26;
  return [
    {kind: 'title', x: 80, y: 64, w: 800, text: slide.title, size: 42},
    {kind: 'bar', x: 80, y: 136, w: 64, h: 8},
    {kind: 'bullets', x: 80, y: 196, w: 800, items: slide.bullets, size},
  ];
}

function frameStyle(shape: ShapeFrame): CSSProperties {
  return {
    position: 'absolute',
    left: pctX(shape.x),
    top: pctY(shape.y),
    width: pctX(shape.w),
  };
}

/** One positioned shape; all type sizes are cqw so the miniature scales. */
function ShapeView({shape}: {shape: SlideShape}) {
  switch (shape.kind) {
    case 'title':
      return (
        <div
          style={{
            ...frameStyle(shape),
            fontSize: cqw(shape.size),
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.015em',
          }}>
          {shape.text}
        </div>
      );
    case 'bullets':
      return (
        <div
          style={{
            ...frameStyle(shape),
            display: 'flex',
            flexDirection: 'column',
            gap: cqw(shape.size * 0.7),
            fontSize: cqw(shape.size),
            lineHeight: 1.3,
          }}>
          {shape.items.map(item => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: cqw(shape.size * 0.55),
                paddingLeft: item.level === 2 ? cqw(shape.size * 1.6) : 0,
                fontSize: item.level === 2 ? cqw(shape.size * 0.85) : undefined,
                color: item.level === 2 ? SLIDE_MUTED : undefined,
              }}>
              <span
                aria-hidden
                style={{
                  width: cqw(shape.size * 0.32),
                  height: cqw(shape.size * 0.32),
                  marginTop: cqw(shape.size * 0.44),
                  borderRadius: item.level === 2 ? 0 : '50%',
                  backgroundColor: item.level === 2 ? SLIDE_MUTED : SLIDE_ACCENT,
                  flexShrink: 0,
                }}
              />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      );
    case 'bar':
      return (
        <div
          aria-hidden
          style={{
            ...frameStyle(shape),
            height: pctY(shape.h),
            backgroundColor: SLIDE_ACCENT,
            borderRadius: cqw(4),
          }}
        />
      );
  }
}

/** The mini slide paper, repainted live from the derived shapes. */
function SlideCanvas({slide}: {slide: DerivedSlide}) {
  return (
    <div style={styles.canvas}>
      {shapesForSlide(slide).map((shape, index) => (
        <ShapeView key={\`\${slide.key}-shape-\${index}\`} shape={shape} />
      ))}
    </div>
  );
}

// ============= OUTLINE ROW =============

interface RowAbilities {
  canIndent: boolean;
  canOutdent: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

function OutlineRowView({
  row,
  slideNumber,
  isSelected,
  isEditing,
  isPhone,
  abilities,
  onRowClick,
  onStartEdit,
  onCommitEdit,
  onCancelEdit,
  onIndent,
  onOutdent,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  row: OutlineRow;
  slideNumber: number | null; // set on level-0 rows only
  isSelected: boolean;
  isEditing: boolean;
  isPhone: boolean; // <=640px: actions collapse into a MoreMenu
  abilities: RowAbilities;
  onRowClick: () => void;
  onStartEdit: () => void;
  onCommitEdit: (value: string) => void;
  onCancelEdit: () => void;
  onIndent: () => void;
  onOutdent: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  // Local draft while the inline TextInput is open; committed on Enter/blur.
  // Reset during render whenever a new edit session begins so the input
  // always opens with the row's current text.
  const [draft, setDraft] = useState(row.text);
  const [wasEditing, setWasEditing] = useState(isEditing);
  if (isEditing !== wasEditing) {
    setWasEditing(isEditing);
    if (isEditing) {
      setDraft(row.text);
    }
  }

  const showActions = isHovered || isSelected;
  const isTitle = row.level === 0;

  // <=640px: the six 28px IconButtons would reserve ~168px per row and
  // leave the outline text a few characters wide, and hover cannot reveal
  // them on touch — so they collapse into one always-visible MoreMenu.
  // The divider fences the destructive Delete off from the move actions.
  const phoneMenuItems: DropdownMenuOption[] = [
    {label: 'Edit text', icon: PencilIcon, onClick: onStartEdit},
    {
      label: isTitle ? 'Merge into previous slide' : 'Promote',
      icon: OutdentIcon,
      isDisabled: !abilities.canOutdent,
      onClick: onOutdent,
    },
    {
      label:
        row.level === 1 && abilities.canIndent
          ? 'Demote to sub-bullet'
          : 'Demote',
      icon: IndentIcon,
      isDisabled: !abilities.canIndent,
      onClick: onIndent,
    },
    {
      label: 'Move up',
      icon: ChevronUpIcon,
      isDisabled: !abilities.canMoveUp,
      onClick: onMoveUp,
    },
    {
      label: 'Move down',
      icon: ChevronDownIcon,
      isDisabled: !abilities.canMoveDown,
      onClick: onMoveDown,
    },
    {type: 'divider'},
    {
      label: isTitle ? 'Delete slide' : 'Delete row',
      icon: Trash2Icon,
      onClick: onDelete,
    },
  ];

  return (
    <div
      style={{
        ...styles.row,
        borderLeftColor: isSelected ? 'var(--color-border-blue)' : 'transparent',
        backgroundColor: isSelected
          ? 'var(--color-background-blue)'
          : isHovered
            ? 'var(--color-background-muted)'
            : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onRowClick}>
      {/* Indent: 0 / 24 / 48px by level. */}
      {row.level > 0 && (
        <span
          aria-hidden
          style={{width: row.level * INDENT_PER_LEVEL, flexShrink: 0}}
        />
      )}
      <Icon icon={GripVerticalIcon} size="sm" color="secondary" />
      <span style={styles.numberBox}>
        {slideNumber != null ? (
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {slideNumber}
          </Text>
        ) : (
          <Text type="supporting" color="secondary" aria-hidden>
            {row.level === 2 ? '–' : '•'}
          </Text>
        )}
      </span>
      <span style={styles.rowText}>
        {isEditing ? (
          <TextInput
            label={isTitle ? 'Edit slide title' : 'Edit bullet text'}
            isLabelHidden
            value={draft}
            onChange={setDraft}
            onEnter={() => onCommitEdit(draft)}
            onBlur={() => onCommitEdit(draft)}
            onKeyDown={event => {
              if (event.key === 'Escape') {
                onCancelEdit();
              }
            }}
            hasAutoFocus
            size="sm"
            width="100%"
          />
        ) : (
          <Text
            type={isTitle ? 'body' : 'supporting'}
            weight={isTitle ? 'bold' : 'normal'}
            color={row.level === 2 ? 'secondary' : 'primary'}
            maxLines={1}>
            {row.text}
          </Text>
        )}
      </span>
      {/* Hover-revealed actions; rendered hidden so row height is stable.
          stopPropagation keeps button clicks from re-selecting the row.
          On phones the cluster collapses into one md MoreMenu instead. */}
      {isPhone ? (
        !isEditing && (
          <div onClick={event => event.stopPropagation()}>
            <MoreMenu
              label={isTitle ? 'Slide actions' : 'Row actions'}
              size="md"
              items={phoneMenuItems}
            />
          </div>
        )
      ) : (
        <div
          style={{
            visibility: showActions && !isEditing ? 'visible' : 'hidden',
          }}
          onClick={event => event.stopPropagation()}>
          <HStack gap={0} vAlign="center">
            <IconButton
              label="Edit text"
              tooltip="Edit text"
              icon={<Icon icon={PencilIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              onClick={onStartEdit}
            />
            <IconButton
              label={isTitle ? 'Merge into previous slide' : 'Promote'}
              tooltip={
                isTitle
                  ? 'Demote — merge this slide into the previous one'
                  : 'Promote'
              }
              icon={<Icon icon={OutdentIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              isDisabled={!abilities.canOutdent}
              onClick={onOutdent}
            />
            <IconButton
              label="Demote"
              tooltip={
                row.level === 1 && abilities.canIndent
                  ? 'Demote to sub-bullet'
                  : 'Demote'
              }
              icon={<Icon icon={IndentIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              isDisabled={!abilities.canIndent}
              onClick={onIndent}
            />
            <IconButton
              label="Move up"
              tooltip="Move up"
              icon={<Icon icon={ChevronUpIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              isDisabled={!abilities.canMoveUp}
              onClick={onMoveUp}
            />
            <IconButton
              label="Move down"
              tooltip="Move down"
              icon={<Icon icon={ChevronDownIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              isDisabled={!abilities.canMoveDown}
              onClick={onMoveDown}
            />
            <IconButton
              label={isTitle ? 'Delete slide' : 'Delete row'}
              tooltip={
                isTitle ? 'Delete slide (and its bullets)' : 'Delete row'
              }
              icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              onClick={onDelete}
            />
          </HStack>
        </div>
      )}
    </div>
  );
}

// ============= PAGE =============

export default function SlideOutlineEditorTemplate() {
  const [rows, setRows] = useState<OutlineRow[]>(INITIAL_ROWS);
  const [selectedRowId, setSelectedRowId] = useState(INITIAL_SELECTED_ROW_ID);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  // Monotonic id source for rows added after load ('row-new-1', …).
  const [nextNewId, setNextNewId] = useState(1);
  // <=900px: preview lives behind the header Eye toggle.
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const isCompact = useMediaQuery('(max-width: 900px)');
  // <=640px: per-row actions collapse into a MoreMenu (see OutlineRowView).
  const isPhone = useMediaQuery('(max-width: 640px)');

  // ---- derived state ----
  const slides = deriveSlides(rows);
  const slideCount = slides.length;
  const bulletCount = rows.length - rows.filter(row => row.level === 0).length;

  const selectedSlide =
    slides.find(slide => slide.rowIds.includes(selectedRowId)) ??
    slides[0] ??
    null;

  // Slide number by title-row id, for the numbered level-0 rows.
  const numberByTitleRowId = new Map<string, number>();
  for (const slide of slides) {
    if (slide.titleRowId != null) {
      numberByTitleRowId.set(slide.titleRowId, slide.number);
    }
  }

  const slideWords =
    selectedSlide == null
      ? 0
      : countWords(selectedSlide.title) +
        selectedSlide.bullets.reduce(
          (sum, bullet) => sum + countWords(bullet.text),
          0,
        );
  const slideCharacters =
    selectedSlide == null
      ? 0
      : selectedSlide.title.length +
        selectedSlide.bullets.reduce(
          (sum, bullet) => sum + bullet.text.length,
          0,
        );

  // ---- outline edits ----
  const commitEdit = (id: string, value: string) => {
    const text = value.trim();
    setRows(prev =>
      prev.map(row =>
        row.id === id ? {...row, text: text === '' ? 'Untitled' : text} : row,
      ),
    );
    setEditingRowId(null);
  };

  const handleRowClick = (id: string) => {
    if (editingRowId === id) {
      return; // clicks inside the open TextInput
    }
    if (selectedRowId === id) {
      setEditingRowId(id); // second click starts editing
    } else {
      setSelectedRowId(id);
    }
  };

  const applyStructureEdit = (
    index: number,
    edit: (current: OutlineRow[], i: number) => OutlineRow[],
  ) => {
    setEditingRowId(null);
    setRows(prev => edit(prev, index));
  };

  const deleteBlock = (index: number) => {
    setEditingRowId(null);
    // Compute the next outline from render state so the selection fallback
    // stays a plain event-handler update (state updaters remain pure).
    const end = blockEnd(rows, index);
    const next = [...rows.slice(0, index), ...rows.slice(end)];
    setRows(next);
    if (next.length > 0 && !next.some(row => row.id === selectedRowId)) {
      setSelectedRowId(next[Math.min(index, next.length - 1)].id);
    }
  };

  const addSlide = () => {
    const id = \`row-new-\${nextNewId}\`;
    setNextNewId(prev => prev + 1);
    setRows(prev => [...prev, {id, level: 0, text: 'Untitled slide'}]);
    setSelectedRowId(id);
    setEditingRowId(id); // opens in edit mode
    if (isCompact) {
      setIsPreviewOpen(true);
    }
  };

  // ---- preview panel body (shared by the side panel and the sheet) ----
  const previewBody =
    selectedSlide == null ? (
      <EmptyState
        title="Nothing to preview"
        description="Add a slide to start the outline."
        isCompact
        actions={
          <Button
            label="Add slide"
            variant="primary"
            size="sm"
            icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
            onClick={addSlide}
          />
        }
      />
    ) : (
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={2}>Preview</Heading>
          </StackItem>
          <Badge
            label={\`Slide \${selectedSlide.number} of \${slideCount}\`}
            variant="neutral"
          />
        </HStack>
        <Card padding={0} style={styles.previewCard}>
          <AspectRatio ratio={4 / 3}>
            <SlideCanvas slide={selectedSlide} />
          </AspectRatio>
        </Card>
        {selectedSlide.bullets.length === 0 && (
          <EmptyState
            title="No bullets yet"
            description="Body autogenerates as you add bullets."
            isCompact
          />
        )}
        <Divider />
        <MetadataList columns="single">
          <MetadataListItem label="Slide">
            <Text type="body" hasTabularNumbers>
              {selectedSlide.number} of {slideCount}
            </Text>
          </MetadataListItem>
          <MetadataListItem label="Bullets">
            <Text type="body" hasTabularNumbers>
              {selectedSlide.bullets.length}
            </Text>
          </MetadataListItem>
          <MetadataListItem label="Words">
            <Text type="body" hasTabularNumbers>
              {slideWords}
            </Text>
          </MetadataListItem>
          <MetadataListItem label="Characters">
            <Text type="body" hasTabularNumbers>
              {slideCharacters}
            </Text>
          </MetadataListItem>
        </MetadataList>
      </VStack>
    );

  // ---- outline pane ----
  const outline =
    rows.length === 0 ? (
      <EmptyState
        title="Empty outline"
        description="Every deck starts with one slide title."
        actions={
          <Button
            label="Add slide"
            variant="primary"
            icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
            onClick={addSlide}
          />
        }
      />
    ) : (
      <VStack gap={0}>
        {rows.map((row, index) => (
          <OutlineRowView
            key={row.id}
            row={row}
            slideNumber={numberByTitleRowId.get(row.id) ?? null}
            isSelected={row.id === selectedRowId}
            isEditing={row.id === editingRowId}
            isPhone={isPhone}
            abilities={{
              canIndent: canIndent(rows, index),
              canOutdent: canOutdent(rows, index),
              canMoveUp: prevSiblingIndex(rows, index) >= 0,
              canMoveDown: hasNextSibling(rows, index),
            }}
            onRowClick={() => handleRowClick(row.id)}
            onStartEdit={() => {
              setSelectedRowId(row.id);
              setEditingRowId(row.id);
            }}
            onCommitEdit={value => commitEdit(row.id, value)}
            onCancelEdit={() => setEditingRowId(null)}
            onIndent={() => applyStructureEdit(index, (r, i) => indentRow(r, i))}
            onOutdent={() =>
              applyStructureEdit(index, (r, i) => outdentRow(r, i))
            }
            onMoveUp={() =>
              applyStructureEdit(index, (r, i) => moveBlockUp(r, i))
            }
            onMoveDown={() =>
              applyStructureEdit(index, (r, i) => moveBlockDown(r, i))
            }
            onDelete={() => deleteBlock(index)}
          />
        ))}
      </VStack>
    );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Icon icon={ListTreeIcon} size="md" color="secondary" />
                <Heading level={1}>{DECK_FILE_NAME}</Heading>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  · {slideCount} {slideCount === 1 ? 'slide' : 'slides'} ·{' '}
                  {bulletCount} {bulletCount === 1 ? 'bullet' : 'bullets'}
                </Text>
              </HStack>
            </StackItem>
            {isCompact && (
              <Tooltip
                content={isPreviewOpen ? 'Hide preview' : 'Show preview'}>
                <IconButton
                  label={isPreviewOpen ? 'Hide preview' : 'Show preview'}
                  icon={
                    <Icon
                      icon={isPreviewOpen ? EyeOffIcon : EyeIcon}
                      size="sm"
                      color="inherit"
                    />
                  }
                  variant={isPreviewOpen ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setIsPreviewOpen(prev => !prev)}
                />
              </Tooltip>
            )}
            <Button
              label="Add slide"
              variant="primary"
              size="sm"
              icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
              onClick={addSlide}
            />
          </HStack>
        </LayoutHeader>
      }
      end={
        isCompact ? undefined : (
          <LayoutPanel width={380} label="Slide preview">
            {previewBody}
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={0}>
          <VStack gap={0} style={styles.fill}>
            <div style={styles.outlineScroll}>{outline}</div>
            {isCompact && isPreviewOpen && (
              <>
                <Divider />
                {/* Bottom sheet-style preview block under the outline. */}
                <div style={styles.sheet}>{previewBody}</div>
              </>
            )}
          </VStack>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};