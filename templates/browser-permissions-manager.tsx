// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (allow/block/action regex rule lists,
 *   history-derived suggested additions with approval/decline notes, fixed
 *   counts — no clocks, no randomness)
 * @output Browser-control permissions manager (~960px column): header with
 *   the page purpose, an intro Card explaining that rules are checked as
 *   local regular expressions before the browser is driven, a toolbar with
 *   live rule counts and a "Reset to defaults" Button, a green-tinted
 *   "Suggested from history" panel whose two-column preview of proposed
 *   allow/block patterns can be applied (rows move into the columns below)
 *   or dismissed, three rule columns (Allowed pages / Blocked pages /
 *   Actions) as Cards with count Badges, mono pattern rows (one "required"
 *   row without a remove button), a dashed-border empty state, and per-
 *   column add rows with invalid-regex inline errors, plus a regex-tips
 *   footer caption
 * @position Page template; emitted by `astryx template browser-permissions-manager`
 *
 * Frame: Layout height="fill". LayoutHeader carries the title + purpose
 * caption; LayoutContent scrolls a centered maxWidth-960 column (intro,
 * toolbar, suggestion panel, rule grid, footer tips). Unlike
 * extension-popup-style surfaces this is a full token-based settings page
 * that follows the app's light/dark theme.
 *
 * Responsive contract (container width via useElementWidth — viewport
 * media queries never fire in the inline demo stage):
 * - >820px: the three rule columns render as a 3-across Grid and the
 *   suggestion preview is 2-across.
 * - <=820px: rule columns and the suggestion preview stack vertically;
 *   the toolbar count caption drops so Reset keeps a full-width row.
 * - Pattern rows truncate with maxLines={1}; remove buttons keep fixed
 *   size so long regexes never crush the controls.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {TextInput} from '@astryxdesign/core/TextInput';
import {
  BanIcon,
  GlobeIcon,
  InfoIcon,
  MousePointerClickIcon,
  ShieldCheckIcon,
  SparklesIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  page: {height: '100%'},
  column: {
    maxWidth: 960,
    marginInline: 'auto',
  },
  // 10-11px uppercase tracking-wide section eyebrow.
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  patternCell: {minWidth: 0},
  patternRow: {paddingBlock: 'var(--spacing-1)'},
  // Dashed placeholder for a column with no rules yet.
  emptyState: {
    border: '1px dashed var(--color-border)',
    borderRadius: 'var(--radius-container)',
    paddingBlock: 'var(--spacing-5)',
    paddingInline: 'var(--spacing-3)',
    textAlign: 'center',
  },
  suggestionPreview: {
    backgroundColor: 'var(--color-background-card)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3)',
  },
  suggestionActions: {flexWrap: 'wrap'},
  addInput: {minWidth: 0},
};

// ============= DATA =============
// Deterministic fixtures: fixed counts and notes, no Date.now(), no
// randomness. The product is "Herald", an agent that drives the browser
// through a local extension node.

const AGENT_NAME = 'Herald';

type ColumnKey = 'allowed' | 'blocked' | 'actions';

interface PatternRule {
  id: string;
  pattern: string;
  /** Built-in rule: rendered with a `required` Badge and no remove button. */
  isRequired?: boolean;
}

const INITIAL_ALLOWED: PatternRule[] = [
  {
    id: 'al-1',
    pattern: '^https://console\\.heraldhq\\.dev/.*',
    isRequired: true,
  },
  {id: 'al-2', pattern: '^https://github\\.com/.*'},
  {id: 'al-3', pattern: '^https://app\\.lintrack\\.io/team/atlas/.*'},
  {id: 'al-4', pattern: '^https://docs\\.acmecloud\\.io/.*'},
  {id: 'al-5', pattern: '^http://localhost:3000/.*'},
];

// Blocked starts empty on purpose: the dashed empty state is the resting
// look, and applying the history suggestions below fills this column.
const INITIAL_BLOCKED: PatternRule[] = [];

const INITIAL_ACTIONS: PatternRule[] = [
  {id: 'ac-1', pattern: '^navigate$', isRequired: true},
  {id: 'ac-2', pattern: '^click$'},
  {id: 'ac-3', pattern: '^fill\\.(text|select)$'},
  {id: 'ac-4', pattern: '^scroll$'},
  {id: 'ac-5', pattern: '^screenshot$'},
  {id: 'ac-6', pattern: '^read\\.dom$'},
];

interface SuggestedChange {
  id: string;
  kind: 'allow' | 'block';
  pattern: string;
  note: string;
}

const SUGGESTED_CHANGES: SuggestedChange[] = [
  {
    id: 'sg-1',
    kind: 'allow',
    pattern: '^https://vault\\.acmecloud\\.io/status/.*',
    note: 'approved 6× in the last 30 days',
  },
  {
    id: 'sg-2',
    kind: 'allow',
    pattern: '^https://staging\\.acmecloud\\.io/.*',
    note: 'approved 3× — always by you',
  },
  {
    id: 'sg-3',
    kind: 'block',
    pattern: '^https://mail\\.corpmail\\.com/.*',
    note: 'declined every time (4×)',
  },
  {
    id: 'sg-4',
    kind: 'block',
    pattern: '^https://.*\\.payroll\\.acmecloud\\.io/.*',
    note: 'matches the payroll deny heuristic',
  },
];

interface ColumnSpec {
  key: ColumnKey;
  title: string;
  icon: typeof GlobeIcon;
  description: string;
  emptyText: string;
  placeholder: string;
  inputLabel: string;
}

const COLUMN_SPECS: ColumnSpec[] = [
  {
    key: 'allowed',
    title: 'Allowed pages',
    icon: GlobeIcon,
    description: `${AGENT_NAME} may drive pages matching any pattern here.`,
    emptyText:
      'No allow patterns — every page will pause for manual approval.',
    placeholder: '^https://example\\.com/.*',
    inputLabel: 'New allowed page pattern',
  },
  {
    key: 'blocked',
    title: 'Blocked pages',
    icon: BanIcon,
    description: 'Never driven, even when an allow pattern also matches.',
    emptyText:
      'No block patterns. Pages outside the allow list still pause for ' +
      'your approval — blocking makes the refusal automatic.',
    placeholder: '^https://example\\.com/.*',
    inputLabel: 'New blocked page pattern',
  },
  {
    key: 'actions',
    title: 'Actions',
    icon: MousePointerClickIcon,
    description: `Browser commands ${AGENT_NAME} may issue on allowed pages.`,
    emptyText: 'No action patterns — every command will be rejected.',
    placeholder: '^screenshot$',
    inputLabel: 'New action pattern',
  },
];

// ============= HELPERS =============

/**
 * Validates a draft pattern for the add rows. Returns an error message or
 * null when the pattern compiles. Deterministic: RegExp construction only,
 * no matching against live data.
 */
function getPatternError(
  value: string,
  existing: PatternRule[],
): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return 'Enter a pattern before adding.';
  }
  try {
    // eslint-disable-next-line no-new
    new RegExp(trimmed);
  } catch {
    return 'Invalid regular expression — check for unbalanced ( ), [ ], or a trailing \\.';
  }
  if (existing.some(rule => rule.pattern === trimmed)) {
    return 'That pattern is already in this list.';
  }
  return null;
}

/**
 * Container-width hook: the demo renders pages in an inline stage narrower
 * than the window, so viewport media queries never fire there. Measure the
 * page's own width instead.
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

// ============= RULE COLUMN =============

function PatternRow({
  rule,
  onRemove,
}: {
  rule: PatternRule;
  onRemove: (id: string) => void;
}) {
  return (
    <HStack gap={2} vAlign="center" style={styles.patternRow}>
      <StackItem size="fill" style={styles.patternCell}>
        <Text type="code" size="sm" maxLines={1}>
          {rule.pattern}
        </Text>
      </StackItem>
      {rule.isRequired ? (
        <Badge label="required" variant="warning" />
      ) : (
        <IconButton
          label={`Remove pattern ${rule.pattern}`}
          tooltip="Remove"
          icon={<Icon icon={XIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          onClick={() => onRemove(rule.id)}
        />
      )}
    </HStack>
  );
}

function RuleColumn({
  spec,
  rules,
  draft,
  error,
  onDraftChange,
  onAdd,
  onRemove,
}: {
  spec: ColumnSpec;
  rules: PatternRule[];
  draft: string;
  error: string | null;
  onDraftChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <Card padding={3} height="100%">
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <Icon icon={spec.icon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Text type="label">{spec.title}</Text>
          </StackItem>
          <Badge label={String(rules.length)} variant="neutral" />
        </HStack>
        <Text type="supporting" color="secondary">
          {spec.description}
        </Text>
        {rules.length === 0 ? (
          <div style={styles.emptyState}>
            <Text type="supporting" color="secondary">
              {spec.emptyText}
            </Text>
          </div>
        ) : (
          <VStack gap={0}>
            {rules.map(rule => (
              <PatternRow key={rule.id} rule={rule} onRemove={onRemove} />
            ))}
          </VStack>
        )}
        <Divider />
        <HStack gap={2} vAlign="start">
          <StackItem size="fill" style={styles.addInput}>
            <TextInput
              label={spec.inputLabel}
              isLabelHidden
              size="sm"
              placeholder={spec.placeholder}
              value={draft}
              onChange={onDraftChange}
              onEnter={onAdd}
              status={
                error != null ? {type: 'error', message: error} : undefined
              }
            />
          </StackItem>
          <Button label="Add" variant="secondary" size="sm" onClick={onAdd} />
        </HStack>
      </VStack>
    </Card>
  );
}

// ============= SUGGESTION PANEL =============

function SuggestionList({
  title,
  items,
}: {
  title: string;
  items: SuggestedChange[];
}) {
  return (
    <VStack gap={2} style={styles.suggestionPreview}>
      <div style={styles.eyebrow}>{title}</div>
      {items.map(item => (
        <HStack key={item.id} gap={2} vAlign="center">
          <Badge
            label={item.kind}
            variant={item.kind === 'block' ? 'error' : 'success'}
          />
          <StackItem size="fill" style={styles.patternCell}>
            <Text type="code" size="sm" maxLines={1}>
              {item.pattern}
            </Text>
          </StackItem>
          <Text type="supporting" color="secondary" maxLines={1}>
            {item.note}
          </Text>
        </HStack>
      ))}
    </VStack>
  );
}

// ============= PAGE =============

export default function BrowserPermissionsManagerTemplate() {
  const [allowed, setAllowed] = useState(INITIAL_ALLOWED);
  const [blocked, setBlocked] = useState(INITIAL_BLOCKED);
  const [actions, setActions] = useState(INITIAL_ACTIONS);
  const [suggestionState, setSuggestionState] = useState<
    'shown' | 'applied' | 'dismissed'
  >('shown');
  const [drafts, setDrafts] = useState<Record<ColumnKey, string>>({
    allowed: '',
    blocked: '',
    actions: '',
  });
  const [errors, setErrors] = useState<Record<ColumnKey, string | null>>({
    allowed: null,
    blocked: null,
    actions: null,
  });
  // Deterministic id counter for user-added rules.
  const [nextId, setNextId] = useState(1);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isCompact = wrapWidth > 0 && wrapWidth <= 820;

  const lists: Record<ColumnKey, PatternRule[]> = {
    allowed,
    blocked,
    actions,
  };
  const setters: Record<
    ColumnKey,
    React.Dispatch<React.SetStateAction<PatternRule[]>>
  > = {
    allowed: setAllowed,
    blocked: setBlocked,
    actions: setActions,
  };

  const setDraft = (key: ColumnKey, value: string) => {
    setDrafts(prev => ({...prev, [key]: value}));
    // Typing clears the inline error until the next Add attempt.
    setErrors(prev => ({...prev, [key]: null}));
  };

  const addRule = (key: ColumnKey) => {
    const error = getPatternError(drafts[key], lists[key]);
    if (error != null) {
      setErrors(prev => ({...prev, [key]: error}));
      return;
    }
    const trimmed = drafts[key].trim();
    setters[key](prev => [...prev, {id: `custom-${nextId}`, pattern: trimmed}]);
    setNextId(prev => prev + 1);
    setDrafts(prev => ({...prev, [key]: ''}));
    setErrors(prev => ({...prev, [key]: null}));
  };

  const removeRule = (key: ColumnKey) => (id: string) => {
    setters[key](prev => prev.filter(rule => rule.id !== id));
  };

  // Applying moves the previewed rows into the allow/block columns below.
  const applySuggestions = () => {
    setAllowed(prev => [
      ...prev,
      ...SUGGESTED_CHANGES.filter(item => item.kind === 'allow').map(item => ({
        id: item.id,
        pattern: item.pattern,
      })),
    ]);
    setBlocked(prev => [
      ...prev,
      ...SUGGESTED_CHANGES.filter(item => item.kind === 'block').map(item => ({
        id: item.id,
        pattern: item.pattern,
      })),
    ]);
    setSuggestionState('applied');
  };

  const resetToDefaults = () => {
    setAllowed(INITIAL_ALLOWED);
    setBlocked(INITIAL_BLOCKED);
    setActions(INITIAL_ACTIONS);
    setSuggestionState('shown');
    setDrafts({allowed: '', blocked: '', actions: ''});
    setErrors({allowed: null, blocked: null, actions: null});
  };

  const allowSuggestions = SUGGESTED_CHANGES.filter(
    item => item.kind === 'allow',
  );
  const blockSuggestions = SUGGESTED_CHANGES.filter(
    item => item.kind === 'block',
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <VStack gap={1}>
            <Heading level={1}>Browser permissions</Heading>
            <Text type="supporting" color="secondary">
              Control which pages and actions the agent may drive in this
              browser.
            </Text>
          </VStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <div ref={wrapRef} style={styles.page}>
            <div style={styles.column}>
              <VStack gap={4}>
                {/* Intro: how the checks work. */}
                <Card padding={4}>
                  <HStack gap={3} vAlign="start">
                    <Icon icon={ShieldCheckIcon} size="md" color="secondary" />
                    <VStack gap={1}>
                      <Text type="label">
                        Checked locally, before the browser moves
                      </Text>
                      <Text type="supporting" color="secondary">
                        Every command {AGENT_NAME} sends is matched against
                        these regular expressions inside the extension —
                        before Chrome is driven. A page must match an allow
                        pattern and no block pattern, and the command must
                        match an action pattern. Rules never leave this
                        machine.
                      </Text>
                    </VStack>
                  </HStack>
                </Card>

                {/* Toolbar: live counts + reset. */}
                <HStack gap={3} vAlign="center">
                  {!isCompact && (
                    <Text
                      type="supporting"
                      color="secondary"
                      hasTabularNumbers>
                      {allowed.length} allowed · {blocked.length} blocked ·{' '}
                      {actions.length} actions · local to this profile
                    </Text>
                  )}
                  <StackItem size="fill" />
                  <Button
                    label="Reset to defaults"
                    variant="secondary"
                    size="sm"
                    onClick={resetToDefaults}
                  />
                </HStack>

                {/* Suggested from history: green seed panel. */}
                {suggestionState === 'shown' && (
                  <Card padding={4} variant="green">
                    <VStack gap={3}>
                      <HStack
                        gap={2}
                        vAlign="center"
                        style={styles.suggestionActions}>
                        <Icon
                          icon={SparklesIcon}
                          size="sm"
                          color="secondary"
                        />
                        <Text type="label">Suggested from history</Text>
                        <Badge
                          label={`${SUGGESTED_CHANGES.length} proposals`}
                          variant="success"
                        />
                        <StackItem size="fill" />
                        <Button
                          label="Apply shown changes"
                          size="sm"
                          onClick={applySuggestions}
                        />
                        <Button
                          label="Dismiss"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSuggestionState('dismissed')}
                        />
                      </HStack>
                      <Text type="supporting" color="secondary">
                        Based on 30 days of approvals and declines in this
                        profile. Nothing changes until you apply.
                      </Text>
                      <Grid columns={isCompact ? 1 : 2} gap={3}>
                        <SuggestionList
                          title="Add to allowed pages"
                          items={allowSuggestions}
                        />
                        <SuggestionList
                          title="Add to blocked pages"
                          items={blockSuggestions}
                        />
                      </Grid>
                    </VStack>
                  </Card>
                )}

                {/* Rule columns. */}
                <Grid columns={isCompact ? 1 : 3} gap={3}>
                  {COLUMN_SPECS.map(spec => (
                    <RuleColumn
                      key={spec.key}
                      spec={spec}
                      rules={lists[spec.key]}
                      draft={drafts[spec.key]}
                      error={errors[spec.key]}
                      onDraftChange={value => setDraft(spec.key, value)}
                      onAdd={() => addRule(spec.key)}
                      onRemove={removeRule(spec.key)}
                    />
                  ))}
                </Grid>

                {/* Regex tips footer. */}
                <HStack gap={2} vAlign="center">
                  <Icon icon={InfoIcon} size="sm" color="secondary" />
                  <Text type="supporting" color="secondary">
                    Patterns are JavaScript regular expressions matched
                    against the full URL — escape literal dots and anchor
                    with ^.
                  </Text>
                  <Text type="code" size="sm" color="secondary">
                    {'^https://app\\.example\\.com/.*'}
                  </Text>
                  <Text type="supporting" color="secondary">
                    matches every page on that host.
                  </Text>
                </HStack>
              </VStack>
            </div>
          </div>
        </LayoutContent>
      }
    />
  );
}
