import {useEffect, useMemo, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

import {displayCategory} from './catalog';
import type {TemplateEntry} from './templateRegistry';

type SchemePref = 'system' | 'light' | 'dark';

interface CommandResult {
  id: string;
  label: string;
  description: string;
  meta: string;
  keywords: string;
  run: () => void;
  template?: TemplateEntry;
}

interface CommandMenuProps {
  templates: TemplateEntry[];
  recentIds: string[];
  scheme: SchemePref;
  onSchemeChange: (scheme: SchemePref) => void;
  onBeforeOpen?: () => void;
  disabled?: boolean;
}

export const FEEDBACK_BUCKET_ID = 'feedback_bucket_astryx_templates';
export const FEEDBACK_URL =
  'https://stitchdash.com/app/feedback?bucket=' +
  FEEDBACK_BUCKET_ID +
  '&source=astryx-templates';

function isApplePlatform() {
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}

function openFeedback() {
  window.open(FEEDBACK_URL, '_blank', 'noopener,noreferrer');
}

function templateScore(template: TemplateEntry, query: string) {
  const name = template.name.toLowerCase();
  const id = template.id.toLowerCase();
  const category = displayCategory(template.category).toLowerCase();
  const description = template.description.toLowerCase();

  if (name === query || id === query) return 0;
  if (name.startsWith(query) || id.startsWith(query)) return 1;
  if (name.includes(query)) return 2;
  if (id.includes(query)) return 3;
  if (category.includes(query)) return 4;
  if (description.includes(query)) return 5;
  return Number.POSITIVE_INFINITY;
}

export function FeedbackLink({compact = false}: {compact?: boolean}) {
  return (
    <a
      className={compact ? 'site-action site-action-compact' : 'site-action'}
      href={FEEDBACK_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Send feedback in Stitchdash">
      <span aria-hidden="true">↗</span>
      <span>Feedback</span>
    </a>
  );
}

export function CommandMenu({
  templates,
  recentIds,
  scheme,
  onSchemeChange,
  onBeforeOpen,
  disabled = false,
}: CommandMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
  const shortcut = isApplePlatform() ? '⌘ K' : 'Ctrl K';

  const open = () => {
    if (disabled) return;
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    onBeforeOpen?.();
    setQuery('');
    setActiveIndex(0);
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const results = useMemo<CommandResult[]>(() => {
    const normalized = query.trim().toLowerCase();
    const actions: CommandResult[] = [
      {
        id: 'browse',
        label: 'Browse all templates',
        description: 'Open the complete template catalog.',
        meta: 'Navigate',
        keywords: 'browse catalog all templates blocks',
        run: () => {
          window.location.hash = '/browse';
        },
      },
      {
        id: 'home',
        label: 'Go home',
        description: 'Return to the Astryx Templates landing page.',
        meta: 'Navigate',
        keywords: 'home landing start',
        run: () => {
          window.location.hash = '';
        },
      },
      {
        id: 'feedback',
        label: 'Send feedback',
        description: 'Open the Astryx Templates feedback bucket in Stitchdash.',
        meta: 'Stitchdash',
        keywords: 'feedback report issue bug idea stitchdash',
        run: openFeedback,
      },
      ...(['system', 'light', 'dark'] as const).map(nextScheme => ({
        id: `theme-${nextScheme}`,
        label: `Use ${nextScheme} theme`,
        description:
          nextScheme === scheme
            ? 'This theme is currently active.'
            : `Switch the gallery to the ${nextScheme} color scheme.`,
        meta: nextScheme === scheme ? 'Active theme' : 'Theme',
        keywords: `appearance color theme ${nextScheme}`,
        run: () => onSchemeChange(nextScheme),
      })),
    ];

    const matchingActions = normalized
      ? actions.filter(action =>
          `${action.label} ${action.keywords}`.toLowerCase().includes(normalized),
        )
      : actions;

    const templatePool = normalized
      ? templates
          .map(template => ({template, score: templateScore(template, normalized)}))
          .filter(result => Number.isFinite(result.score))
          .sort(
            (left, right) =>
              left.score - right.score ||
              left.template.name.localeCompare(right.template.name),
          )
          .map(result => result.template)
      : recentIds
          .map(id => templates.find(template => template.id === id))
          .filter((template): template is TemplateEntry => template !== undefined);

    const templateResults = templatePool.map<CommandResult>(template => ({
      id: `template-${template.id}`,
      label: template.name,
      description: template.description,
      meta: `${displayCategory(template.category)} · ${template.kind}`,
      keywords: '',
      template,
      run: () => {
        window.location.hash = template.id;
      },
    }));

    return [...matchingActions, ...templateResults].slice(0, 12);
  }, [onSchemeChange, query, recentIds, scheme, templates]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (disabled && isOpen) close();
  }, [disabled, isOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        disabled ||
        !(event.metaKey || event.ctrlKey) ||
        event.key.toLowerCase() !== 'k'
      ) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.closest('.template-stage, .fullscreen-preview')) return;

      event.preventDefault();
      if (isOpen) close();
      else open();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [disabled, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      if (wasOpenRef.current) {
        wasOpenRef.current = false;
        requestAnimationFrame(() => returnFocusRef.current?.focus());
      }
      return;
    }

    wasOpenRef.current = true;
    const root = document.getElementById('root');
    const rootWasInert = root?.inert ?? false;
    const previousOverflow = document.body.style.overflow;
    if (root) root.inert = true;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => inputRef.current?.focus());

    return () => {
      cancelAnimationFrame(frame);
      if (root) root.inert = rootWasInert;
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const run = (result: CommandResult) => {
    close();
    result.run();
  };

  const handleDialogKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === 'ArrowDown' && results.length > 0) {
      event.preventDefault();
      setActiveIndex(index => (index + 1) % results.length);
      return;
    }
    if (event.key === 'ArrowUp' && results.length > 0) {
      event.preventDefault();
      setActiveIndex(index => (index - 1 + results.length) % results.length);
      return;
    }
    if (event.key === 'Enter' && results[activeIndex]) {
      event.preventDefault();
      run(results[activeIndex]);
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'input, button:not([disabled]), a[href]',
      ) ?? [],
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <button
        type="button"
        className="command-trigger"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={open}>
        <span aria-hidden="true">⌕</span>
        <span>Commands</span>
        <kbd>{shortcut}</kbd>
      </button>
      {isOpen
        ? createPortal(
            <div
              className="command-backdrop"
              onMouseDown={event => {
                if (event.target === event.currentTarget) close();
              }}>
              <div
                ref={dialogRef}
                className="command-dialog"
                role="dialog"
                aria-modal="true"
                aria-label="Command menu"
                onKeyDown={handleDialogKeyDown}>
                <div className="command-search">
                  <span aria-hidden="true">⌕</span>
                  <input
                    ref={inputRef}
                    type="search"
                    role="combobox"
                    aria-label="Search commands and templates"
                    aria-expanded="true"
                    aria-controls="command-results"
                    aria-autocomplete="list"
                    aria-activedescendant={
                      results[activeIndex]
                        ? `command-option-${results[activeIndex].id}`
                        : undefined
                    }
                    value={query}
                    placeholder="Search templates and commands…"
                    onChange={event => setQuery(event.target.value)}
                  />
                  <button type="button" aria-label="Close command menu" onClick={close}>
                    Esc
                  </button>
                </div>
                <div
                  id="command-results"
                  className="command-results"
                  role="listbox"
                  aria-label="Commands and templates">
                  {results.length === 0 ? (
                    <p className="command-empty">
                      No templates or commands match “{query.trim()}”.
                    </p>
                  ) : (
                    results.map((result, index) => (
                      <button
                        key={result.id}
                        id={`command-option-${result.id}`}
                        type="button"
                        role="option"
                        aria-selected={index === activeIndex}
                        className={
                          index === activeIndex
                            ? 'command-result is-active'
                            : 'command-result'
                        }
                        title={result.description}
                        onPointerEnter={() => {
                          setActiveIndex(index);
                          if (result.template) {
                            void result.template.preload().catch(() => {});
                          }
                        }}
                        onClick={() => run(result)}>
                        <span className="command-result-icon" aria-hidden="true">
                          {result.template ? '◇' : '→'}
                        </span>
                        <span className="command-result-copy">
                          <strong>{result.label}</strong>
                          <small>{result.description}</small>
                        </span>
                        <span className="command-result-meta">{result.meta}</span>
                      </button>
                    ))
                  )}
                </div>
                <div className="command-footer" aria-hidden="true">
                  <span>↑↓ Navigate</span>
                  <span>↵ Open</span>
                  <span>Esc Close</span>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
