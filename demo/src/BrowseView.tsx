import './browse.css';

import {useEffect, useMemo} from 'react';
import type {RefObject} from 'react';

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
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeSlug]);

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
              placeholder="Search templates…  ( / )"
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
                onClick={() => onKindChange(nextKind)}>
                {nextKind}
              </button>
            ))}
          </div>

          <p className="browse-count" aria-live="polite">
            {visible.length} of {templates.length} templates
          </p>
        </div>
      </header>

      <div className="browse-body">
        <nav className="browse-rail" aria-label="Categories">
          <a
            href="#/browse"
            className={
              !activeSlug ? 'browse-rail-link is-active' : 'browse-rail-link'
            }>
            All <span>{templates.length}</span>
          </a>
          {railCategories.map(category => (
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
              <p>No templates match &ldquo;{query.trim()}&rdquo;.</p>
              <button type="button" onClick={() => onQueryChange('')}>
                Clear search
              </button>
            </div>
          ) : (
            grouped.map(([label, entries]) => (
              <section key={label} className="browse-section">
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
                      onPointerEnter={() => onPrefetch?.(t)}
                      onFocus={() => onPrefetch?.(t)}>
                      <div className="browse-card-top">
                        <strong className="browse-card-name">{t.name}</strong>
                        <em className="browse-pill">{t.kind}</em>
                      </div>
                      <p className="browse-card-desc">{t.description}</p>
                      <div className="browse-card-foot">
                        <code className="browse-card-id">{t.id}</code>
                        {t.requires ? (
                          <span
                            className="browse-req-dot"
                            title={t.requires}
                            aria-label={t.requires}
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
    </div>
  );
}

export default BrowseView;
