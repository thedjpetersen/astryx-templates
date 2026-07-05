import './browse.css';

import {useEffect, useMemo, useRef, useState} from 'react';
import type {CSSProperties, ReactNode, RefObject} from 'react';

import {categorySlug, displayCategory, filterTemplates} from './catalog';
import type {TemplateEntry, TemplateKind} from './templateRegistry';

export interface BrowseViewProps {
  templates: TemplateEntry[];
  categorySlug?: string;                        // from route '#/browse/<slug>'; undefined = all templates
  query: string;                                // owned by App (same state the landing hero edits)
  onQueryChange: (query: string) => void;
  kind: TemplateKind | 'all';                   // owned by App
  onKindChange: (kind: TemplateKind | 'all') => void;
  searchInputRef: RefObject<HTMLInputElement | null>;  // attach to the top-bar search input ('/' shortcut target)
  onPrefetch?: (entry: TemplateEntry) => void;  // call on card pointerenter/focus; may be a no-op
}

const RETURN_SCROLL_KEY = 'astryx-templates:browse-return';

// Window-level matchMedia is correct here: this is the demo's own chrome at
// real viewport width, not a staged template inside the demo stage.
function useIsPhone(): boolean {
  const [isPhone, setIsPhone] = useState(
    () => window.matchMedia('(max-width: 860px)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 860px)');
    const onChange = () => setIsPhone(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isPhone;
}

// Wraps every query-term hit in <mark>. Mirrors matchesQuery's tokenization
// (catalog.ts); split with a capturing group alternates text/match, so odd
// indices are always the hits. Empty/whitespace queries return the plain
// string, keeping the no-search render path allocation-light.
function highlightTerms(text: string, query: string): ReactNode {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return text;
  // Users can type regex metacharacters ('(', '.', …) — escape them.
  const escaped = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const parts = text.split(new RegExp('(' + escaped.join('|') + ')', 'ig'));
  return parts.map((part, i) =>
    i % 2 === 1 ? <mark key={i}>{part}</mark> : part,
  );
}

interface RailCategory {
  label: string;
  slug: string;
  count: number;
}

export function BrowseView({
  templates,
  categorySlug: activeSlug,
  query,
  onQueryChange,
  kind,
  onKindChange,
  searchInputRef,
  onPrefetch,
}: BrowseViewProps) {
  // Lazy initializer on purpose: pointer class never changes mid-session on
  // the devices that matter, and this avoids effect churn.
  const [coarsePointer] = useState(
    () => window.matchMedia('(hover: none) and (pointer: coarse)').matches,
  );
  // Jump to the top when the visitor switches categories, but NOT on mount:
  // coming back from a template detail remounts this view, and stomping the
  // scroll there would throw away the restored position — brutal in a
  // 400+ card catalog.
  // Tracking the previous slug (rather than a "mounted" flag) keeps this
  // idempotent under StrictMode's double effect invocation.
  const prevSlug = useRef(activeSlug);
  useEffect(() => {
    if (prevSlug.current !== activeSlug) {
      prevSlug.current = activeSlug;
      window.scrollTo(0, 0);
    }
  }, [activeSlug]);

  // Native scroll restoration can't help across the detail round-trip: the
  // browser restores while the DOM still shows the (viewport-locked) detail
  // shell, clamping to 0 before React swaps the grid back in. So the card
  // click saves the position (synchronously, before navigation — by unmount
  // time the document has already collapsed and scrollY reads 0), and a
  // return to the same browse route restores it.
  const saveReturnScroll = (entry: TemplateEntry, el: HTMLElement) => {
    const hash = activeSlug ? '#/browse/' + activeSlug : '#/browse';
    try {
      sessionStorage.setItem(
        RETURN_SCROLL_KEY,
        JSON.stringify({
          hash,
          y: window.scrollY,
          // Anchor on the clicked card: content-visibility height estimates
          // lie (~2.3x off on phones), so a raw pixel offset lands on the
          // wrong cards. Re-aligning the anchor card fixes that.
          anchorId: entry.id,
          anchorTop: el.getBoundingClientRect().top,
        }),
      );
    } catch {
      // Best-effort only.
    }
  };
  // Ref guard is mandatory: StrictMode's second invocation reads a now-empty
  // sessionStorage and the scrollTo(0, 0) fallback would wipe the restore.
  const initialScrollDone = useRef(false);
  useEffect(() => {
    if (initialScrollDone.current) return;
    initialScrollDone.current = true;
    interface SavedReturn {
      hash?: unknown;
      y?: unknown;
      anchorId?: unknown;
      anchorTop?: unknown;
    }
    let saved: SavedReturn | null = null;
    try {
      const raw = sessionStorage.getItem(RETURN_SCROLL_KEY);
      if (raw !== null) {
        sessionStorage.removeItem(RETURN_SCROLL_KEY);
        saved = JSON.parse(raw) as SavedReturn | null;
      }
    } catch {
      // sessionStorage may be unavailable — fall through to top.
    }
    const valid =
      saved !== null &&
      typeof saved === 'object' &&
      saved.hash === window.location.hash &&
      typeof saved.y === 'number';
    if (!valid) {
      // No detail round-trip to restore: entering browse from a scrolled
      // landing page must not keep the stale window scroll.
      window.scrollTo(0, 0);
      return;
    }
    const settle = () => {
      const el =
        typeof saved!.anchorId === 'string' && typeof saved!.anchorTop === 'number'
          ? document.querySelector<HTMLElement>(
              '.browse-card[href="#' + saved!.anchorId + '"]',
            )
          : null;
      if (el) {
        window.scrollTo(
          0,
          window.scrollY + el.getBoundingClientRect().top - (saved!.anchorTop as number),
        );
      } else {
        window.scrollTo(0, saved!.y as number);
      }
    };
    settle();
    // content-visibility sections re-lay-out around the new position; correct
    // once more after the browser has had a frame to do so.
    requestAnimationFrame(settle);
  }, []);

  // Keep the active category chip visible in the mobile chip row (and the
  // active link visible in a long desktop rail). scrollIntoView is off the
  // table: on phones it also scrolls the WINDOW (the rail is not the only
  // scrollable ancestor), stomping the sessionStorage scroll restore above.
  // Rect-delta math scoped to the rail element only ever moves the rail's own
  // scrollLeft/scrollTop, and is idempotent under StrictMode double-invoke
  // (the second run computes zero deltas).
  const railRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const rail = railRef.current;
    const link = rail?.querySelector<HTMLElement>('.browse-rail-link.is-active');
    if (!rail || !link) return;
    const lr = link.getBoundingClientRect();
    const rr = rail.getBoundingClientRect();
    // Horizontal for the mobile chip row, vertical for the desktop rail.
    rail.scrollLeft += Math.max(0, lr.right - rr.right) + Math.min(0, lr.left - rr.left);
    rail.scrollTop += Math.max(0, lr.bottom - rr.bottom) + Math.min(0, lr.top - rr.top);
  }, [activeSlug]);

  // Floating back-to-top affordance once the visitor is deep in the grid.
  const [showTopButton, setShowTopButton] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTopButton(window.scrollY > 640);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Rail counts always come from ALL templates so the rail is stable
  // navigation, not a result readout.
  const railCategories = useMemo(() => {
    const order: RailCategory[] = [];
    const index = new Map<string, number>();
    for (const template of templates) {
      const label = displayCategory(template.category);
      const at = index.get(label);
      if (at === undefined) {
        index.set(label, order.length);
        order.push({label, slug: categorySlug(template.category), count: 1});
      } else {
        order[at].count += 1;
      }
    }
    return order;
  }, [templates]);

  // On phones the rail is a horizontal chip scroller ~13 viewport-widths
  // wide; surface the biggest categories first so they are reachable.
  // Reordering the DOM (not CSS `order`) keeps tab order matching visual
  // order. Desktop keeps registry order exactly.
  const isPhone = useIsPhone();
  const chipCategories = useMemo(
    () =>
      isPhone ? [...railCategories].sort((a, b) => b.count - a.count) : railCategories,
    [isPhone, railCategories],
  );

  const activeCategory = activeSlug
    ? railCategories.find(c => c.slug === activeSlug)
    : undefined;

  const scoped = useMemo(() => {
    if (!activeSlug) return templates;
    const matched = templates.filter(
      template => categorySlug(template.category) === activeSlug,
    );
    // An unknown slug is treated as "no scope" rather than an empty gallery.
    return matched.length > 0 ? matched : templates;
  }, [templates, activeSlug]);

  const visible = useMemo(
    () => filterTemplates(scoped, kind, query),
    [scoped, kind, query],
  );

  const grouped = useMemo(() => {
    const labels: string[] = [];
    const byLabel = new Map<string, TemplateEntry[]>();
    for (const template of visible) {
      const label = displayCategory(template.category);
      const bucket = byLabel.get(label);
      if (bucket === undefined) {
        labels.push(label);
        byLabel.set(label, [template]);
      } else {
        bucket.push(template);
      }
    }
    return labels.map(
      label => [label, byLabel.get(label)!] as [string, TemplateEntry[]],
    );
  }, [visible]);

  // Empty-state inputs: name every active constraint, and offer the
  // catalog-wide match count when a category scope is hiding results.
  const trimmedQuery = query.trim();
  const allScopeCount =
    visible.length === 0 && activeCategory
      ? filterTemplates(templates, kind, query).length
      : 0;

  return (
    <div className="browse-root">
      <header className="browse-topbar">
        <div className="browse-topbar-inner">
          <a className="browse-brand" href="#" aria-label="Astryx Templates home">
            <svg
              className="browse-brand-mark"
              viewBox="0 0 40 40"
              role="img"
              aria-hidden="true">
              <path d="M11.2002 0C14.7347 0.000105757 17.6 2.8654 17.6001 6.3999V11.2002C17.6002 12.3047 18.4956 13.2002 19.6001 13.2002H20.3999C21.5044 13.2002 22.3998 12.3047 22.3999 11.2002V6.3999C22.4 2.8654 25.2653 0.000106275 28.7998 0H37.6001C38.9255 5.15369e-05 39.9999 1.07451 40 2.3999V11.2002C39.9999 14.7347 37.1346 17.6 33.6001 17.6001H28.7998C27.6953 17.6002 26.7998 18.4956 26.7998 19.6001V20.3999C26.7998 21.5044 27.6953 22.3998 28.7998 22.3999H33.6001C37.1346 22.4 39.9999 25.2653 40 28.7998V37.6001C40 38.9255 38.9255 39.9999 37.6001 40H28.7998C25.2653 39.9999 22.3999 37.1346 22.3999 33.6001V28.7998C22.3998 27.6953 21.5044 26.7998 20.3999 26.7998H19.6001C18.4956 26.7998 17.6002 27.6953 17.6001 28.7998V33.6001C17.6001 37.1346 14.7347 39.9999 11.2002 40H2.39991C1.07449 39.9999 3.97232e-05 38.9255 0 37.6001V28.7998C0.000118127 25.2653 2.86539 22.4 6.3999 22.3999H11.2002C12.3047 22.3998 13.2002 21.5044 13.2002 20.3999V19.6001C13.2002 18.4956 12.3047 17.6002 11.2002 17.6001H6.3999C2.86538 17.6 9.39063e-05 14.7347 0 11.2002V2.3999C6.46793e-05 1.07451 1.07451 5.28641e-05 2.39991 0H11.2002Z" />
            </svg>
            <span>Astryx Templates</span>
          </a>

          <div className="browse-search" role="search">
            <input
              ref={searchInputRef}
              type="search"
              value={query}
              placeholder={
                coarsePointer
                  ? 'Search templates…'
                  : 'Search templates…  ( / )'
              }
              aria-label="Search templates"
              onChange={event => onQueryChange(event.target.value)}
            />
            {query !== '' ? (
              <button
                type="button"
                className="browse-search-clear"
                aria-label="Clear search"
                onClick={() => {
                  onQueryChange('');
                  searchInputRef.current?.focus();
                }}>
                ×
              </button>
            ) : null}
          </div>

          <div className="browse-segmented" aria-label="Template type">
            {(['all', 'page', 'block'] as const).map(nextKind => (
              <button
                key={nextKind}
                type="button"
                className={kind === nextKind ? 'is-active' : ''}
                aria-pressed={kind === nextKind}
                onClick={() => onKindChange(nextKind)}>
                {nextKind}
              </button>
            ))}
          </div>

          <p className="browse-count" aria-live="polite">
            {visible.length} of {scoped.length}
            {activeCategory ? ` in ${activeCategory.label}` : ' templates'}
          </p>
        </div>
      </header>

      <div className="browse-body">
        <nav className="browse-rail" aria-label="Categories" ref={railRef}>
          <a
            href="#/browse"
            className={
              !activeSlug ? 'browse-rail-link is-active' : 'browse-rail-link'
            }>
            All <span>{templates.length}</span>
          </a>
          {chipCategories.map(category => (
            <a
              key={category.slug}
              href={'#/browse/' + category.slug}
              className={
                category.slug === activeSlug
                  ? 'browse-rail-link is-active'
                  : 'browse-rail-link'
              }>
              {category.label} <span>{category.count}</span>
            </a>
          ))}
        </nav>

        <div className="browse-main">
          {visible.length === 0 ? (
            <div className="browse-empty">
              <p>
                {trimmedQuery !== '' ? (
                  <>
                    No templates match &ldquo;{trimmedQuery}&rdquo;
                    {activeCategory ? ` in ${activeCategory.label}` : ''}
                    {kind !== 'all' ? ` (${kind}s only)` : ''}.
                  </>
                ) : (
                  <>
                    No {kind} templates
                    {activeCategory ? ` in ${activeCategory.label}` : ''}.
                  </>
                )}
              </p>
              {activeCategory && allScopeCount > 0 ? (
                <p>
                  {allScopeCount} match{allScopeCount === 1 ? '' : 'es'} in all
                  categories.
                </p>
              ) : null}
              <div className="browse-empty-actions">
                {trimmedQuery !== '' ? (
                  <button type="button" onClick={() => onQueryChange('')}>
                    Clear search
                  </button>
                ) : null}
                {kind !== 'all' ? (
                  <button type="button" onClick={() => onKindChange('all')}>
                    Show all types
                  </button>
                ) : null}
                {activeCategory ? (
                  <a className="browse-empty-link" href="#/browse">
                    Browse all categories
                  </a>
                ) : null}
              </div>
            </div>
          ) : (
            grouped.map(([label, entries]) => (
              <section
                key={label}
                className="browse-section"
                // Lets the phone stylesheet derive a truthful
                // contain-intrinsic-size from the card count.
                style={{'--browse-cards': entries.length} as CSSProperties}>
                <div className="browse-section-head">
                  <h2>
                    {label} · {entries.length}
                  </h2>
                </div>
                <div className="browse-grid">
                  {entries.map(t => (
                    <a
                      key={t.id}
                      className="browse-card"
                      href={'#' + t.id}
                      onClick={event => saveReturnScroll(t, event.currentTarget)}
                      onPointerEnter={() => onPrefetch?.(t)}
                      onFocus={() => onPrefetch?.(t)}>
                      <div className="browse-card-top">
                        <strong className="browse-card-name">
                          {highlightTerms(t.name, query)}
                          {/* AT hears 'Name, kind'; the visual pill is
                              aria-hidden so kind is not announced twice. */}
                          <span className="browse-visually-hidden">
                            , {t.kind}
                          </span>
                        </strong>
                        <em className="browse-pill" aria-hidden="true">
                          {t.kind}
                        </em>
                      </div>
                      <p className="browse-card-desc">
                        {highlightTerms(t.description, query)}
                      </p>
                      <div className="browse-card-foot">
                        {/* Developer chrome: already encoded in the href, so
                            keep the kebab-case id out of the accessible name. */}
                        <code className="browse-card-id" aria-hidden="true">
                          {highlightTerms(t.id, query)}
                        </code>
                        {t.requires ? (
                          <span
                            className="browse-req-dot"
                            title={t.requires}
                            aria-label="Requires shim components"
                            role="img"
                          />
                        ) : null}
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      {showTopButton ? (
        <button
          type="button"
          className="browse-top-btn"
          aria-label="Back to top"
          onClick={() => window.scrollTo(0, 0)}>
          ↑ Top
        </button>
      ) : null}
    </div>
  );
}

export default BrowseView;
