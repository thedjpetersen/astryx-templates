import type {TemplateEntry, TemplateKind} from './templateRegistry';

export type KindFilter = TemplateKind | 'all';

// Display-only merge of the legacy 'Code' category into 'Coding'.
// Template ids and stored category strings are untouched.
export function displayCategory(category: string): string {
  return category === 'Code' ? 'Coding' : category;
}

export function categorySlug(category: string): string {
  return displayCategory(category).toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

// Exact semantics of today's App.tsx matchesQuery — moved, not changed.
export function matchesQuery(template: TemplateEntry, query: string): boolean {
  const haystack = [template.name, template.id, template.category, template.description]
    .join(' ')
    .toLowerCase();
  return query.toLowerCase().split(/\s+/).filter(Boolean).every(term => haystack.includes(term));
}

export function filterTemplates(
  templates: TemplateEntry[],
  kind: KindFilter,
  query: string,
): TemplateEntry[] {
  return templates.filter(
    t => (kind === 'all' || t.kind === kind) && (query.trim() === '' || matchesQuery(t, query)),
  );
}
