import {useMemo, useState} from 'react';

import {templates} from './templateRegistry';
import type {TemplateEntry, TemplateKind} from './templateRegistry';

type ViewMode = 'preview' | 'source';
type Viewport = 'desktop' | 'mobile';

function groupTemplates(entries: TemplateEntry[]) {
  return entries.reduce<Record<string, TemplateEntry[]>>((acc, template) => {
    acc[template.category] ??= [];
    acc[template.category].push(template);
    return acc;
  }, {});
}

export function DemoApp() {
  const [selectedId, setSelectedId] = useState(templates[0]?.id);
  const [kind, setKind] = useState<TemplateKind | 'all'>('all');
  const [mode, setMode] = useState<ViewMode>('preview');
  const [viewport, setViewport] = useState<Viewport>('desktop');

  const visibleTemplates = useMemo(
    () => templates.filter(template => kind === 'all' || template.kind === kind),
    [kind],
  );
  const grouped = useMemo(() => groupTemplates(visibleTemplates), [visibleTemplates]);
  const selected =
    templates.find(template => template.id === selectedId) ?? templates[0];
  const SelectedComponent = selected.component;

  return (
    <main className="demo-shell">
      <aside className="demo-sidebar" aria-label="Templates">
        <div className="demo-brand">
          <span className="demo-brand-mark" aria-hidden="true" />
          <div>
            <h1>Astryx Templates</h1>
            <p>{templates.length} local templates</p>
          </div>
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

        <nav className="template-nav">
          {Object.entries(grouped).map(([category, entries]) => (
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
                  onClick={() => setSelectedId(template.id)}>
                  <span>
                    <strong>{template.name}</strong>
                    <small>{template.description}</small>
                  </span>
                  <em>{template.kind}</em>
                </button>
              ))}
            </section>
          ))}
        </nav>
      </aside>

      <section className="demo-main" aria-label="Template preview">
        <header className="demo-toolbar">
          <div className="template-heading">
            <span>{selected.category}</span>
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
              <SelectedComponent />
            </div>
          ) : (
            <pre className="source-panel">
              <code>{selected.source}</code>
            </pre>
          )}
        </div>
      </section>
    </main>
  );
}

