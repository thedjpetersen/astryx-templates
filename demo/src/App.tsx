import {Suspense, startTransition, useEffect, useMemo, useRef, useState} from 'react';

import {BrowseView} from './BrowseView';
import {categorySlug, displayCategory, filterTemplates} from './catalog';
import type {KindFilter} from './catalog';
import {LandingPage} from './LandingPage';
import {templates} from './templateRegistry';
import type {TemplateEntry} from './templateRegistry';

type ViewMode = 'preview' | 'source';
type Viewport = 'desktop' | 'mobile';
type SchemePref = 'system' | 'light' | 'dark';

export type Route =
  | {view: 'landing'}
  | {view: 'browse'; categorySlug?: string}
  | {view: 'detail'; templateId: string; requestedId?: string};

function parseRoute(hash: string): Route {
  const raw = decodeURIComponent(hash.replace(/^#/, ''));
  if (raw === '') return {view: 'landing'};
  if (raw.startsWith('/')) {
    const [, seg1, seg2] = raw.split('/');
    if (seg1 === 'browse') return seg2 ? {view: 'browse', categorySlug: seg2} : {view: 'browse'};
    return {view: 'landing'}; // unknown app route
  }
  const exists = templates.some(t => t.id === raw);
  // Unknown ids still render templates[0] (preserved fallback), but carry the
  // requested id along so the app can reconcile the URL and say so.
  return exists
    ? {view: 'detail', templateId: raw}
    : {view: 'detail', templateId: templates[0].id, requestedId: raw};
}

const RECENT_KEY = 'astryx-templates:recent';
const THEME_KEY = 'astryx-templates:theme';
const SCHEME_OPTIONS = ['system', 'light', 'dark'] as const;

function readSchemePref(): SchemePref {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // localStorage may be unavailable (private mode) — fall back to system.
  }
  return 'system';
}

/**
 * Three-state color-scheme toggle (System / Light / Dark), shared across
 * landing, browse, and detail. Floating variant pins to the viewport corner
 * on the views whose chrome App does not own.
 */
function SchemeToggle({
  value,
  onChange,
  floating = false,
}: {
  value: SchemePref;
  onChange: (next: SchemePref) => void;
  floating?: boolean;
}) {
  const next =
    SCHEME_OPTIONS[(SCHEME_OPTIONS.indexOf(value) + 1) % SCHEME_OPTIONS.length];
  return (
    <div
      className={
        floating
          ? 'segmented scheme-toggle scheme-toggle-floating'
          : 'segmented scheme-toggle'
      }
      role="group"
      aria-label="Color scheme">
      {SCHEME_OPTIONS.map(option => (
        <button
          key={option}
          type="button"
          className={value === option ? 'is-active' : ''}
          aria-pressed={value === option}
          aria-label={`${option} color scheme`}
          onClick={() => onChange(option)}>
          {option}
        </button>
      ))}
      {/* Mobile-only compact cycler: CSS swaps the three-label pill for this
          single 44px control below 860px. */}
      <button
        type="button"
        className="scheme-cycle"
        aria-label={`Color scheme: ${value}. Switch to ${next}.`}
        onClick={() => onChange(next)}>
        {value === 'system' ? '◐' : value === 'light' ? '☀' : '☾'}
      </button>
    </div>
  );
}

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

// Highlighted HTML keyed by the source text itself, so a stale text/template
// pairing during a switch can never poison the cache. Shiki loads lazily —
// visitors who never open Source never pay for it — and emits light-dark()
// colors, so the code follows the scheme toggle exactly like the rest of the
// chrome. Fine-grained core imports (one grammar, two themes, JS regex
// engine) keep this to a handful of chunks instead of the full language
// bundle plus wasm.
const highlightCache = new Map<string, string>();

let highlighterPromise: Promise<
  import('shiki/core').HighlighterCore
> | null = null;

function getHighlighter() {
  highlighterPromise ??= (async () => {
    const [core, engine, light, dark, tsx] = await Promise.all([
      import('shiki/core'),
      import('shiki/engine/javascript'),
      import('shiki/dist/themes/github-light.mjs'),
      import('shiki/dist/themes/github-dark.mjs'),
      import('shiki/dist/langs/tsx.mjs'),
    ]);
    return core.createHighlighterCore({
      themes: [light.default, dark.default],
      langs: [tsx.default],
      engine: engine.createJavaScriptRegexEngine({forgiving: true}),
    });
  })();
  return highlighterPromise;
}

async function highlightSource(code: string): Promise<string> {
  const cached = highlightCache.get(code);
  if (cached !== undefined) return cached;
  const highlighter = await getHighlighter();
  const html = highlighter.codeToHtml(code, {
    lang: 'tsx',
    themes: {light: 'github-light', dark: 'github-dark'},
    defaultColor: 'light-dark()',
  });
  highlightCache.set(code, html);
  return html;
}

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
  const [scheme, setScheme] = useState<SchemePref>(readSchemePref);
  const [recentIds, setRecentIds] = useState<string[]>(readRecentIds);
  const [sourceText, setSourceText] = useState<string | null>(null);
  const [sourceHtml, setSourceHtml] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia('(max-width: 860px)').matches,
  );
  // Lazy initializer on purpose: pointer class never changes mid-session on
  // the devices that matter, and this avoids effect churn.
  const [coarsePointer] = useState(
    () => window.matchMedia('(hover: none) and (pointer: coarse)').matches,
  );
  const [descExpanded, setDescExpanded] = useState(false);
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const previewWrapRef = useRef<HTMLDivElement>(null);
  const navToggleRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const prevBtnRef = useRef<HTMLButtonElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const prevNavOpenRef = useRef<boolean | null>(null);
  const fullscreenBtnRef = useRef<HTMLButtonElement>(null);
  const fullscreenExitRef = useRef<HTMLButtonElement>(null);
  const prevFullscreenRef = useRef(false);

  useEffect(() => {
    // startTransition keeps the current template rendered while the next
    // lazy chunk resolves, so pager steps don't flash the skeleton.
    const onHashChange = () =>
      startTransition(() => setRoute(parseRoute(window.location.hash)));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 860px)');
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
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
      if (event.key === 'Escape') {
        setIsNavOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Apply the scheme preference to <html> (the Astryx theme scope root):
  // an explicit choice forces both the browser color-scheme (so light-dark()
  // tokens resolve) and data-astryx-media (so the theme's own overrides
  // follow); 'system' removes both and lets the OS decide.
  useEffect(() => {
    const rootEl = document.documentElement;
    if (scheme === 'system') {
      rootEl.style.removeProperty('color-scheme');
      rootEl.removeAttribute('data-astryx-media');
    } else {
      rootEl.style.setProperty('color-scheme', scheme);
      rootEl.setAttribute('data-astryx-media', scheme);
    }
    try {
      localStorage.setItem(THEME_KEY, scheme);
    } catch {
      // Persistence is best-effort; the choice still applies this session.
    }
  }, [scheme]);

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
    // Warm the highlighter in parallel with the source fetch instead of
    // serially after it; getHighlighter memoizes so repeat calls are free.
    void getHighlighter().catch(() => {});
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

  // Highlight loaded source. Plain text renders immediately; the highlighted
  // markup swaps in when Shiki (lazy chunk) finishes tokenizing.
  useEffect(() => {
    if (mode !== 'source' || sourceText === null) {
      setSourceHtml(null);
      return;
    }
    const cached = highlightCache.get(sourceText);
    setSourceHtml(cached ?? null);
    if (cached !== undefined) return;
    let cancelled = false;
    void highlightSource(sourceText)
      .then(html => {
        if (!cancelled) setSourceHtml(html);
      })
      .catch(() => {
        // Highlighting is progressive enhancement — plain text stays up.
      });
    return () => {
      cancelled = true;
    };
  }, [mode, sourceText]);

  const selectTemplate = (id: string) => {
    setIsNavOpen(false);
    window.location.hash = id;
  };

  const visibleTemplates = useMemo(
    () => filterTemplates(templates, kind, query),
    [kind, query],
  );
  const grouped = useMemo(() => groupTemplates(visibleTemplates), [visibleTemplates]);

  // Prev/next steps through the filtered list when the current template is in
  // it (so search/kind scope the walk), otherwise the full catalog order.
  const pagerList = visibleTemplates.some(t => t.id === selected.id)
    ? visibleTemplates
    : templates;
  const pagerIndex = pagerList.findIndex(t => t.id === selected.id);
  const prevTemplate = pagerIndex > 0 ? pagerList[pagerIndex - 1] : null;
  const nextTemplate =
    pagerIndex >= 0 && pagerIndex < pagerList.length - 1
      ? pagerList[pagerIndex + 1]
      : null;

  // Arrow keys page between templates on the detail view. Skipped while
  // typing or when focus is inside the rendered template, which may have its
  // own arrow-key behavior (lists, sliders, calendars).
  const isDetail = route.view === 'detail';
  useEffect(() => {
    if (!isDetail) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      const target = event.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;
      if (isTyping || target?.closest('.template-stage, .fullscreen-preview')) {
        return;
      }
      const dest = event.key === 'ArrowLeft' ? prevTemplate : nextTemplate;
      if (dest) window.location.hash = dest.id;
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isDetail, prevTemplate, nextTemplate]);

  // Warm the pager neighbors so steps are near-instant. The 250ms delay keeps
  // the current template's own chunk first in line; prefetch is best-effort
  // and deduped by the module cache, so StrictMode double-invoke is harmless.
  useEffect(() => {
    if (!isDetail) return;
    const timer = setTimeout(() => {
      if (prevTemplate) prefetch(prevTemplate);
      if (nextTemplate) prefetch(nextTemplate);
    }, 250);
    return () => clearTimeout(timer);
  }, [isDetail, prevTemplate, nextTemplate]);

  // Full-screen preview lives on the detail view only; leaving it (or
  // landing elsewhere via deep link) drops the flag so returning to a detail
  // page never re-opens an overlay the user has already left.
  useEffect(() => {
    if (!isDetail) setIsFullscreen(false);
  }, [isDetail]);

  // Escape exits the full-screen preview (the global handler above only
  // closes the nav overlay).
  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen]);

  // The overlay owns scrolling while it's up; lock the document behind it
  // (matters on mobile, where the document itself scrolls).
  useEffect(() => {
    if (!isFullscreen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Hand focus to the exit control on open and back to the toolbar toggle on
  // close. Prev-value comparison (not a "mounted" flag) keeps StrictMode's
  // double invoke harmless.
  useEffect(() => {
    const prev = prevFullscreenRef.current;
    prevFullscreenRef.current = isFullscreen;
    if (prev === isFullscreen) return;
    if (isFullscreen) {
      fullscreenExitRef.current?.focus();
    } else {
      fullscreenBtnRef.current?.focus();
    }
  }, [isFullscreen]);

  // Copy-button state: reset when the template or view mode changes, and
  // revert "Copied" back to "Copy" after 2s.
  useEffect(() => {
    setCopied(false);
  }, [selectedId, mode]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  // Each template starts at the top of its preview, not wherever the last
  // one was scrolled to. On mobile the document itself scrolls, so reset
  // both (idempotent — safe under StrictMode double-invoke).
  useEffect(() => {
    previewWrapRef.current?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, [selectedId]);

  // Collapse the description clamp when switching templates.
  useEffect(() => {
    setDescExpanded(false);
  }, [selectedId]);

  // Per-route document titles for history/tabs/screen readers.
  const selectedName = selected.name;
  useEffect(() => {
    document.title =
      route.view === 'detail'
        ? `${selectedName} — Astryx Templates`
        : route.view === 'browse'
          ? 'Browse — Astryx Templates'
          : 'Astryx Templates';
  }, [route.view, selectedName]);

  // Unknown detail ids: reconcile the address bar to the template actually
  // rendered (replaceState fires no hashchange, so no re-render loop) and
  // surface a dismissible notice while this in-memory route persists.
  const requestedId = route.view === 'detail' ? route.requestedId : undefined;
  useEffect(() => {
    if (requestedId === undefined) return;
    setNoticeDismissed(false);
    history.replaceState(null, '', '#' + templates[0].id);
  }, [requestedId]);

  // Mobile overlay transitions: opening centers the selected item inside the
  // list (container-scoped scroll); closing returns focus to the toggle so
  // Escape/selection never drops focus to <body>. Compares the previous
  // isNavOpen value (never a boolean "mounted" flag) so StrictMode's double
  // invoke is harmless; the initial run pre-scrolls the desktop sidebar for
  // deep links.
  useEffect(() => {
    const centerSelected = () => {
      const nav = navRef.current;
      const sel = nav?.querySelector<HTMLElement>('.template-nav-item.is-selected');
      if (nav && sel) {
        nav.scrollTop =
          sel.getBoundingClientRect().top -
          nav.getBoundingClientRect().top +
          nav.scrollTop -
          nav.clientHeight / 2 +
          sel.clientHeight / 2;
      }
    };
    const prevOpen = prevNavOpenRef.current;
    prevNavOpenRef.current = isNavOpen;
    if (prevOpen === null) {
      if (!isMobile) centerSelected();
      return;
    }
    if (prevOpen === isNavOpen) return;
    if (isNavOpen) {
      centerSelected();
    } else if (isMobile) {
      navToggleRef.current?.focus();
    }
  }, [isNavOpen, isMobile]);

  // The document scrolls on mobile, so lock it while the overlay is up.
  useEffect(() => {
    if (!(isNavOpen && isMobile)) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isNavOpen, isMobile]);

  if (route.view === 'landing') {
    return (
      <>
        <LandingPage
          templates={templates}
          query={query}
          onQueryChange={setQuery}
          searchInputRef={searchRef}
          recentIds={recentIds}
          kind={kind}
        />
        <SchemeToggle value={scheme} onChange={setScheme} floating />
      </>
    );
  }

  if (route.view === 'browse') {
    return (
      <>
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
        <SchemeToggle value={scheme} onChange={setScheme} floating />
      </>
    );
  }

  const SelectedComponent = selected.component;

  return (
    <>
    <main
      className="demo-shell"
      // The full-screen overlay replaces the page: pull the shell out of the
      // tab order and a11y tree while it's up.
      inert={isFullscreen ? true : undefined}>
      <aside
        className={isNavOpen ? 'demo-sidebar is-open' : 'demo-sidebar'}
        aria-label="Templates"
        // Only the mobile full-screen overlay is a dialog; the desktop
        // sidebar is plain layout and the main pane stays interactive.
        role={isNavOpen && isMobile ? 'dialog' : undefined}
        aria-modal={isNavOpen && isMobile ? true : undefined}>
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
            ref={navToggleRef}
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
              placeholder={
                coarsePointer
                  ? 'Search templates…'
                  : 'Search templates…  ( / )'
              }
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
                aria-pressed={kind === nextKind}
                onClick={() => setKind(nextKind)}>
                {nextKind}
              </button>
            ))}
          </div>

          <nav className="template-nav" aria-label="Template list" ref={navRef}>
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

      <section
        className="demo-main"
        aria-label="Template preview"
        // While the mobile overlay is up, remove the background from the tab
        // order and the a11y tree (React 19 inert prop).
        inert={isNavOpen && isMobile ? true : undefined}>
        {requestedId && !noticeDismissed ? (
          <div className="route-notice" role="status">
            &ldquo;{requestedId}&rdquo; isn&rsquo;t in the catalog — showing the
            first template. <a href="#/browse">Browse all</a>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setNoticeDismissed(true)}>
              ×
            </button>
          </div>
        ) : null}
        <header className="demo-toolbar">
          <div
            className={
              descExpanded ? 'template-heading is-expanded' : 'template-heading'
            }>
            <a
              className="crumb-back"
              href={'#/browse/' + categorySlug(selected.category)}>
              ← {displayCategory(selected.category)}
            </a>
            <h2>{selected.name}</h2>
            <p>{selected.description}</p>
            {selected.description.length > 140 ? (
              <button
                type="button"
                className="desc-toggle"
                aria-expanded={descExpanded}
                onClick={() => setDescExpanded(v => !v)}>
                {descExpanded ? 'Less' : 'More'}
              </button>
            ) : null}
            {selected.requires ? <p className="template-note">{selected.requires}</p> : null}
          </div>

          <div className="toolbar-controls">
            <div className="pager" aria-label="Template pager">
              <button
                type="button"
                ref={prevBtnRef}
                disabled={prevTemplate === null}
                aria-label={
                  prevTemplate ? `Previous: ${prevTemplate.name}` : 'Previous template'
                }
                title={prevTemplate?.name}
                onPointerEnter={() => prevTemplate && prefetch(prevTemplate)}
                onClick={() => {
                  if (!prevTemplate) return;
                  window.location.hash = prevTemplate.id;
                  // Landing on the first template disables this button; hand
                  // keyboard focus to its still-enabled sibling.
                  if (pagerIndex - 1 === 0) nextBtnRef.current?.focus();
                }}>
                ←
              </button>
              <span className="pager-count" aria-live="polite">
                {pagerIndex + 1} / {pagerList.length}
                <span className="visually-hidden">: {selected.name}</span>
              </span>
              <button
                type="button"
                ref={nextBtnRef}
                disabled={nextTemplate === null}
                aria-label={
                  nextTemplate ? `Next: ${nextTemplate.name}` : 'Next template'
                }
                title={nextTemplate?.name}
                onPointerEnter={() => nextTemplate && prefetch(nextTemplate)}
                onClick={() => {
                  if (!nextTemplate) return;
                  window.location.hash = nextTemplate.id;
                  if (pagerIndex + 1 === pagerList.length - 1) {
                    prevBtnRef.current?.focus();
                  }
                }}>
                →
              </button>
            </div>
            <div className="segmented" aria-label="View mode">
              {(['preview', 'source'] as const).map(nextMode => (
                <button
                  key={nextMode}
                  type="button"
                  className={mode === nextMode ? 'is-active' : ''}
                  aria-pressed={mode === nextMode}
                  onClick={() => setMode(nextMode)}>
                  {nextMode}
                </button>
              ))}
            </div>
            {mode === 'source' ? (
              <button
                type="button"
                className="copy-source"
                disabled={sourceText === null}
                onClick={() => {
                  if (sourceText === null) return;
                  // Clipboard API needs a secure context (localhost/https);
                  // elsewhere the catch keeps the tap a silent no-op.
                  navigator.clipboard
                    .writeText(sourceText)
                    .then(() => setCopied(true))
                    .catch(() => {});
                }}>
                {copied ? 'Copied' : 'Copy'}
              </button>
            ) : null}
            <div className="segmented viewport-toggle" aria-label="Viewport">
              {(['desktop', 'mobile'] as const).map(nextViewport => (
                <button
                  key={nextViewport}
                  type="button"
                  className={viewport === nextViewport ? 'is-active' : ''}
                  aria-pressed={viewport === nextViewport}
                  onClick={() => setViewport(nextViewport)}>
                  {nextViewport}
                </button>
              ))}
            </div>
            <button
              type="button"
              ref={fullscreenBtnRef}
              className="fullscreen-toggle"
              aria-haspopup="dialog"
              onClick={() => setIsFullscreen(true)}>
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                <path
                  d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Full screen
            </button>
            <SchemeToggle value={scheme} onChange={setScheme} />
          </div>
        </header>

        <div className="preview-wrap" ref={previewWrapRef}>
          {mode === 'preview' ? (
            isFullscreen ? (
              // The overlay owns the only mounted instance while it's up —
              // rendering the stage too would double every template mount.
              <div className="stage-skeleton" aria-hidden="true" />
            ) : viewport === 'mobile' && !isMobile ? (
              // An iframe, not a narrowed div: templates size themselves with
              // window media queries and vw units, which only resolve to
              // phone values inside a real 390px viewport. Re-keyed on scheme
              // so the artboard follows the toggle (EmbedStage reads ?scheme).
              <iframe
                key={selected.id + ':' + scheme}
                className="template-stage template-stage-mobile"
                title={`${selected.name} at phone width`}
                src={`${import.meta.env.BASE_URL}?embed=1&scheme=${scheme}#${selected.id}`}
              />
            ) : (
              <div className="template-stage">
                <Suspense fallback={<div className="stage-skeleton" aria-hidden="true" />}>
                  <SelectedComponent />
                </Suspense>
              </div>
            )
          ) : (
            <div className="source-panel">
              {sourceHtml !== null ? (
                <div
                  className="source-highlighted"
                  dangerouslySetInnerHTML={{__html: sourceHtml}}
                />
              ) : (
                <pre className="source-plain">
                  <code>{sourceText ?? 'Loading source…'}</code>
                </pre>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
    {isFullscreen ? (
      // Full-viewport preview: the template gets the REAL window as its
      // viewport, so media queries and vw units resolve against the actual
      // device — the easiest way to sanity-check a template on a phone (or
      // an uncluttered desktop) without the gallery chrome around it.
      <div
        className="fullscreen-preview"
        role="dialog"
        aria-modal="true"
        aria-label={`${selected.name} — full screen preview`}>
        <Suspense fallback={<div className="stage-skeleton" aria-hidden="true" />}>
          <SelectedComponent />
        </Suspense>
        <button
          type="button"
          ref={fullscreenExitRef}
          className="fullscreen-exit"
          onClick={() => setIsFullscreen(false)}>
          ✕ Exit full screen
        </button>
      </div>
    ) : null}
    </>
  );
}
