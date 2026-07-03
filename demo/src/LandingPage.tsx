import type {RefObject} from 'react';

import './landing.css';

import {Suspense, useEffect, useMemo, useRef, useState} from 'react';

import {categorySlug, displayCategory, filterTemplates} from './catalog';
import type {KindFilter} from './catalog';
import type {TemplateEntry} from './templateRegistry';

export interface LandingPageProps {
  templates: TemplateEntry[];
  query: string;
  onQueryChange: (query: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  recentIds: string[];
  kind: KindFilter;
}

interface CategoryGroup {
  label: string;
  slug: string;
  count: number;
  samples: TemplateEntry[];
}

const FEATURED_IDS = [
  'dashboard-executive-summary',
  'ai-chat-artifact',
  'storefront-browse',
  'kanban-board',
  'calendar-month-grid',
  'coding-terminal-workspace',
];

/**
 * Mounts a template component only once its preview scrolls near the
 * viewport, so landing never pays for template code the visitor never sees.
 */
function FeaturedPreview({entry}: {entry: TemplateEntry}) {
  const [inView, setInView] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const Component = entry.component;

  useEffect(() => {
    const node = previewRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      {rootMargin: '200px'},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={previewRef} className="landing-featured-preview">
      {inView ? (
        <div className="landing-featured-artboard" aria-hidden="true" inert>
          <Suspense
            fallback={<div className="landing-skeleton landing-skeleton--fill" />}>
            <Component />
          </Suspense>
        </div>
      ) : (
        <div className="landing-skeleton" />
      )}
    </div>
  );
}

export function LandingPage({
  templates,
  query,
  onQueryChange,
  searchInputRef,
  recentIds,
  kind,
}: LandingPageProps) {
  const total = templates.length;

  const pageCount = useMemo(
    () => templates.filter(t => t.kind === 'page').length,
    [templates],
  );
  const blockCount = total - pageCount;

  const categories = useMemo<CategoryGroup[]>(() => {
    const byLabel = new Map<string, CategoryGroup>();
    for (const template of templates) {
      const label = displayCategory(template.category);
      let group = byLabel.get(label);
      if (!group) {
        group = {
          label,
          slug: categorySlug(template.category),
          count: 0,
          samples: [],
        };
        byLabel.set(label, group);
      }
      group.count += 1;
      if (group.samples.length < 2) group.samples.push(template);
    }
    return [...byLabel.values()];
  }, [templates]);

  const categoriesByCount = useMemo(
    () => [...categories].sort((a, b) => b.count - a.count),
    [categories],
  );

  const matchCount = useMemo(
    () =>
      query.trim() ? filterTemplates(templates, kind, query).length : null,
    [templates, kind, query],
  );

  const recentTemplates = useMemo(
    () =>
      recentIds
        .map(id => templates.find(t => t.id === id))
        .filter((t): t is TemplateEntry => t !== undefined)
        .slice(0, 5),
    [templates, recentIds],
  );

  const featured = useMemo(
    () =>
      FEATURED_IDS.map(id => templates.find(t => t.id === id)).filter(
        (t): t is TemplateEntry => t !== undefined,
      ),
    [templates],
  );

  return (
    <div className="landing-root">
      <div className="landing-inner">
        <section className="landing-hero">
          <svg
            className="landing-hero-mark"
            viewBox="0 0 40 40"
            role="img"
            aria-label="Astryx">
            <path d="M11.2002 0C14.7347 0.000105757 17.6 2.8654 17.6001 6.3999V11.2002C17.6002 12.3047 18.4956 13.2002 19.6001 13.2002H20.3999C21.5044 13.2002 22.3998 12.3047 22.3999 11.2002V6.3999C22.4 2.8654 25.2653 0.000106275 28.7998 0H37.6001C38.9255 5.15369e-05 39.9999 1.07451 40 2.3999V11.2002C39.9999 14.7347 37.1346 17.6 33.6001 17.6001H28.7998C27.6953 17.6002 26.7998 18.4956 26.7998 19.6001V20.3999C26.7998 21.5044 27.6953 22.3998 28.7998 22.3999H33.6001C37.1346 22.4 39.9999 25.2653 40 28.7998V37.6001C40 38.9255 38.9255 39.9999 37.6001 40H28.7998C25.2653 39.9999 22.3999 37.1346 22.3999 33.6001V28.7998C22.3998 27.6953 21.5044 26.7998 20.3999 26.7998H19.6001C18.4956 26.7998 17.6002 27.6953 17.6001 28.7998V33.6001C17.6001 37.1346 14.7347 39.9999 11.2002 40H2.39991C1.07449 39.9999 3.97232e-05 38.9255 0 37.6001V28.7998C0.000118127 25.2653 2.86539 22.4 6.3999 22.3999H11.2002C12.3047 22.3998 13.2002 21.5044 13.2002 20.3999V19.6001C13.2002 18.4956 12.3047 17.6002 11.2002 17.6001H6.3999C2.86538 17.6 9.39063e-05 14.7347 0 11.2002V2.3999C6.46793e-05 1.07451 1.07451 5.28641e-05 2.39991 0H11.2002Z" />
          </svg>
          <p className="landing-eyebrow">ASTRYX DESIGN SYSTEM</p>
          <h1 className="landing-hero-title">
            {total} templates. {categories.length} categories. One design
            system.
          </h1>
          <p className="landing-hero-sub">
            Production-grade React pages and blocks, built entirely on Astryx
            tokens — light and dark, desktop and phone.
          </p>

          <div className="landing-hero-search" role="search">
            <input
              ref={searchInputRef}
              type="search"
              value={query}
              aria-label="Search templates"
              placeholder={`Search ${total} templates…  ( / )`}
              onChange={e => onQueryChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') window.location.hash = '/browse';
              }}
            />
            {query !== '' ? (
              <button
                type="button"
                className="landing-search-clear"
                aria-label="Clear search"
                onClick={() => {
                  onQueryChange('');
                  searchInputRef.current?.focus();
                }}>
                ×
              </button>
            ) : null}
          </div>
          {matchCount !== null ? (
            <small className="landing-hero-hint">
              {matchCount === 0
                ? `No templates match “${query.trim()}”`
                : `${matchCount} matches — press Enter to browse`}
            </small>
          ) : null}

          <div className="landing-cta-row">
            <a className="landing-btn landing-btn-primary" href="#/browse">
              Browse all templates
            </a>
            <a
              className="landing-btn landing-btn-ghost"
              href="https://github.com/thedjpetersen/astryx-templates"
              target="_blank"
              rel="noreferrer">
              View on GitHub
            </a>
          </div>
        </section>

        {recentTemplates.length > 0 ? (
          <section className="landing-recent">
            <p className="landing-eyebrow">JUMP BACK IN</p>
            <div className="landing-recent-row">
              {recentTemplates.map(t => (
                <a
                  key={t.id}
                  className="landing-recent-chip"
                  href={'#' + t.id}>
                  <small>{displayCategory(t.category)}</small>
                  <strong>{t.name}</strong>
                </a>
              ))}
            </div>
          </section>
        ) : null}

        <section className="landing-categories">
          <p className="landing-eyebrow">START WITH A CATEGORY</p>
          <h2 className="landing-section-title">Every category, counted live.</h2>
          <div className="landing-category-grid">
            {categoriesByCount.map(category => (
              <a
                key={category.slug}
                className="landing-category-card"
                href={'#/browse/' + category.slug}>
                <span className="landing-category-head">
                  <h3>{category.label}</h3>
                  <span className="landing-count-badge">{category.count}</span>
                </span>
                <span className="landing-category-samples">
                  {category.samples.map(sample => (
                    <small key={sample.id}>{sample.name}</small>
                  ))}
                </span>
              </a>
            ))}
          </div>
        </section>

        {featured.length > 0 ? (
          <section className="landing-featured">
            <p className="landing-eyebrow">SEE THEM RUNNING</p>
            <h2 className="landing-section-title">
              Six templates, live and scaled down.
            </h2>
            <div className="landing-featured-grid">
              {featured.map(t => (
                <a
                  key={t.id}
                  className="landing-featured-card"
                  href={'#' + t.id}>
                  <FeaturedPreview entry={t} />
                  <span className="landing-featured-meta">
                    <small>{displayCategory(t.category)}</small>
                    <strong>{t.name}</strong>
                    <em className="landing-pill">{t.kind}</em>
                  </span>
                </a>
              ))}
            </div>
          </section>
        ) : null}

        <section className="landing-facts">
          <p className="landing-eyebrow">BUILT ON ASTRYX</p>
          <div className="landing-facts-grid">
            <div className="landing-fact-card">
              <strong>
                {pageCount} pages + {blockCount} blocks
              </strong>
              <p>Zero-prop components — drop one in and it renders.</p>
            </div>
            <div className="landing-fact-card">
              <strong>Source on tap</strong>
              <p>Every template ships its raw .tsx behind the source toggle.</p>
            </div>
            <div className="landing-fact-card">
              <strong>Two artboards</strong>
              <p>
                Authored against a 920px desktop stage and a 390px phone stage.
              </p>
            </div>
          </div>
          <small className="landing-facts-note">
            Some templates note required components that ship as local shims
            until release.
          </small>
        </section>

        <footer className="landing-footer">
          <p className="landing-footer-count">{total} templates and counting.</p>
          <a className="landing-btn landing-btn-primary" href="#/browse">
            Browse the catalog
          </a>
          <p className="landing-footer-hint">
            Press <kbd>/</kbd> to search ·{' '}
            <a
              href="https://github.com/thedjpetersen/astryx-templates"
              target="_blank"
              rel="noreferrer">
              GitHub
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;
