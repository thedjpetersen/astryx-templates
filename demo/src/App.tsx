import {Suspense, useEffect, useMemo, useRef, useState} from 'react';

import {BrowseView} from './BrowseView';
import {categorySlug, displayCategory, filterTemplates} from './catalog';
import type {KindFilter} from './catalog';
import {LandingPage} from './LandingPage';
import {templates} from './templateRegistry';
import type {TemplateEntry} from './templateRegistry';

type ViewMode = 'preview' | 'source';
type Viewport = 'desktop' | 'mobile';

export type Route =
  | {view: 'landing'}
  | {view: 'browse'; categorySlug?: string}
  | {view: 'detail'; templateId: string};

function parseRoute(hash: string): Route {
  const raw = decodeURIComponent(hash.replace(/^#/, ''));
  if (raw === '') return {view: 'landing'};
  if (raw.startsWith('/')) {
    const [, seg1, seg2] = raw.split('/');
    if (seg1 === 'browse') return seg2 ? {view: 'browse', categorySlug: seg2} : {view: 'browse'};
    return {view: 'landing'}; // unknown app route
  }
  const exists = templates.some(t => t.id === raw);
  return {view: 'detail', templateId: exists ? raw : templates[0].id}; // preserved fallback
}

const RECENT_KEY = 'astryx-templates:recent';

function readRecentIds(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}

// Warm a template's chunk on hover/focus so opening it feels instant.
const prefetch = (entry: TemplateEntry) => {
  void entry.preload().catch(() => {
    // Prefetch is best-effort; a failed warm-up just means the chunk loads
    // normally on navigation.
  });
};

const sourceCache = new Map<string, string>();

// Grouped by display label so legacy 'Code' entries fold under 'Coding'.
function groupTemplates(entries: TemplateEntry[]) {
  return entries.reduce<Record<string, TemplateEntry[]>>((acc, template) => {
    const label = displayCategory(template.category);
    acc[label] ??= [];
    acc[label].push(template);
    return acc;
  }, {});
}

export function DemoApp() {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));
  const [kind, setKind] = useState<KindFilter>('all');
  const [mode, setMode] = useState<ViewMode>('preview');
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [query, setQuery] = useState(
    () => new URLSearchParams(window.location.search).get('q') ?? '',
  );
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [recentIds, setRecentIds] = useState<string[]>(readRecentIds);
  const [sourceText, setSourceText] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;
      if (event.key === '/' && !isTyping) {
        event.preventDefault();
        setIsNavOpen(true);
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Record detail visits for the landing page's "Jump back in" row.
  const detailId = route.view === 'detail' ? route.templateId : null;
  useEffect(() => {
    if (detailId === null) return;
    setRecentIds(prev => {
      if (prev[0] === detailId) return prev;
      const next = [detailId, ...prev.filter(id => id !== detailId)].slice(0, 8);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        // localStorage may be unavailable (private mode, quota) — recents
        // still work in-memory for this session.
      }
      return next;
    });
  }, [detailId]);

  const selected =
    (route.view === 'detail'
      ? templates.find(template => template.id === route.templateId)
      : undefined) ?? templates[0];

  // Load template source on demand when source mode opens; cache per id.
  const selectedId = selected.id;
  useEffect(() => {
    if (detailId === null || mode !== 'source') return;
    const entry = templates.find(template => template.id === selectedId);
    if (!entry) return;
    const cached = sourceCache.get(selectedId);
    if (cached !== undefined) {
      setSourceText(cached);
      return;
    }
    setSourceText(null);
    let cancelled = false;
    void entry
      .loadSource()
      .then(text => {
        sourceCache.set(selectedId, text);
        if (!cancelled) setSourceText(text);
      })
      .catch(() => {
        if (!cancelled) {
          setSourceText('// Failed to load source — check your connection and switch tabs to retry.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [detailId, mode, selectedId]);

  const selectTemplate = (id: string) => {
    setIsNavOpen(false);
    window.location.hash = id;
  };

  const visibleTemplates = useMemo(
    () => filterTemplates(templates, kind, query),
    [kind, query],
  );
  const grouped = useMemo(() => groupTemplates(visibleTemplates), [visibleTemplates]);

  if (route.view === 'landing') {
    return (
      <LandingPage
        templates={templates}
        query={query}
        onQueryChange={setQuery}
        searchInputRef={searchRef}
        recentIds={recentIds}
        kind={kind}
      />
    );
  }

  if (route.view === 'browse') {
    return (
      <BrowseView
        templates={templates}
        categorySlug={route.categorySlug}
        query={query}
        onQueryChange={setQuery}
        kind={kind}
        onKindChange={setKind}
        searchInputRef={searchRef}
        onPrefetch={prefetch}
      />
    );
  }

  const SelectedComponent = selected.component;

  return (
    <main className="demo-shell">
      <aside className="demo-sidebar" aria-label="Templates">
        <div className="demo-brand">
          <a className="demo-brand-link" href="#" aria-label="Astryx Templates home">
            <svg
              className="demo-brand-mark"
              viewBox="0 0 40 40"
              role="img"
              aria-label="Astryx">
              <path d="M11.2002 0C14.7347 0.000105757 17.6 2.8654 17.6001 6.3999V11.2002C17.6002 12.3047 18.4956 13.2002 19.6001 13.2002H20.3999C21.5044 13.2002 22.3998 12.3047 22.3999 11.2002V6.3999C22.4 2.8654 25.2653 0.000106275 28.7998 0H37.6001C38.9255 5.15369e-05 39.9999 1.07451 40 2.3999V11.2002C39.9999 14.7347 37.1346 17.6 33.6001 17.6001H28.7998C27.6953 17.6002 26.7998 18.4956 26.7998 19.6001V20.3999C26.7998 21.5044 27.6953 22.3998 28.7998 22.3999H33.6001C37.1346 22.4 39.9999 25.2653 40 28.7998V37.6001C40 38.9255 38.9255 39.9999 37.6001 40H28.7998C25.2653 39.9999 22.3999 37.1346 22.3999 33.6001V28.7998C22.3998 27.6953 21.5044 26.7998 20.3999 26.7998H19.6001C18.4956 26.7998 17.6002 27.6953 17.6001 28.7998V33.6001C17.6001 37.1346 14.7347 39.9999 11.2002 40H2.39991C1.07449 39.9999 3.97232e-05 38.9255 0 37.6001V28.7998C0.000118127 25.2653 2.86539 22.4 6.3999 22.3999H11.2002C12.3047 22.3998 13.2002 21.5044 13.2002 20.3999V19.6001C13.2002 18.4956 12.3047 17.6002 11.2002 17.6001H6.3999C2.86538 17.6 9.39063e-05 14.7347 0 11.2002V2.3999C6.46793e-05 1.07451 1.07451 5.28641e-05 2.39991 0H11.2002Z" />
            </svg>
            <div>
              <h1>Astryx Templates</h1>
              <p>{templates.length} templates &amp; blocks</p>
            </div>
          </a>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={isNavOpen}
            aria-controls="template-browser"
            onClick={() => setIsNavOpen(open => !open)}>
            {isNavOpen ? 'Close' : 'Browse'}
          </button>
        </div>

        <div
          id="template-browser"
          className={isNavOpen ? 'sidebar-body is-open' : 'sidebar-body'}>
          <div className="template-search" role="search">
            <input
              ref={searchRef}
              type="search"
              value={query}
              placeholder="Search templates…  ( / )"
              aria-label="Search templates"
              onChange={event => setQuery(event.target.value)}
            />
            {query !== '' ? (
              <button
                type="button"
                className="search-clear"
                aria-label="Clear search"
                onClick={() => {
                  setQuery('');
                  searchRef.current?.focus();
                }}>
                ×
              </button>
            ) : null}
          </div>

          <div className="segmented" aria-label="Template type">
            {(['all', 'page', 'block'] as const).map(nextKind => (
              <button
                key={nextKind}
                type="button"
                className={kind === nextKind ? 'is-active' : ''}
                onClick={() => setKind(nextKind)}>
                {nextKind}
              </button>
            ))}
          </div>

          <nav className="template-nav" aria-label="Template list">
            {visibleTemplates.length === 0 ? (
              <p className="nav-empty">
                No templates match &ldquo;{query.trim()}&rdquo;.
              </p>
            ) : (
              Object.entries(grouped).map(([category, entries]) => (
                <section key={category}>
                  <h2>{category}</h2>
                  {entries.map(template => (
                    <button
                      key={template.id}
                      type="button"
                      className={
                        template.id === selected.id
                          ? 'template-nav-item is-selected'
                          : 'template-nav-item'
                      }
                      onPointerEnter={() => prefetch(template)}
                      onClick={() => selectTemplate(template.id)}>
                      <span>
                        <strong>{template.name}</strong>
                        <small>{template.description}</small>
                      </span>
                      <em>{template.kind}</em>
                    </button>
                  ))}
                </section>
              ))
            )}
          </nav>
        </div>
      </aside>

      <section className="demo-main" aria-label="Template preview">
        <header className="demo-toolbar">
          <div className="template-heading">
            <a
              className="crumb-back"
              href={'#/browse/' + categorySlug(selected.category)}>
              ← {displayCategory(selected.category)}
            </a>
            <h2>{selected.name}</h2>
            <p>{selected.description}</p>
            {selected.requires ? <p className="template-note">{selected.requires}</p> : null}
          </div>

          <div className="toolbar-controls">
            <div className="segmented" aria-label="View mode">
              {(['preview', 'source'] as const).map(nextMode => (
                <button
                  key={nextMode}
                  type="button"
                  className={mode === nextMode ? 'is-active' : ''}
                  onClick={() => setMode(nextMode)}>
                  {nextMode}
                </button>
              ))}
            </div>
            <div className="segmented" aria-label="Viewport">
              {(['desktop', 'mobile'] as const).map(nextViewport => (
                <button
                  key={nextViewport}
                  type="button"
                  className={viewport === nextViewport ? 'is-active' : ''}
                  onClick={() => setViewport(nextViewport)}>
                  {nextViewport}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="preview-wrap">
          {mode === 'preview' ? (
            <div
              className={
                viewport === 'mobile'
                  ? 'template-stage template-stage-mobile'
                  : 'template-stage'
              }>
              <Suspense fallback={<div className="stage-skeleton" aria-hidden="true" />}>
                <SelectedComponent />
              </Suspense>
            </div>
          ) : (
            <pre className="source-panel">
              <code>{sourceText ?? 'Loading source…'}</code>
            </pre>
          )}
        </div>
      </section>
    </main>
  );
}
