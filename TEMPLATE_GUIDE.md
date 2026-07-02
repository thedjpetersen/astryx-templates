# Template Authoring Guide

Notes from the open Astryx template PRs in `facebook/astryx`.

## Page Pattern

Start each page source with a short product/archetype comment:

- Frame: name the durable layout regions and fixed widths.
- Responsive contract: define what hides, wraps, scrolls, or keeps width at each breakpoint.
- Container policy: decide rows, cards, panels, or widgets based on the archetype.
- Fixture policy: fixed data only; avoid clocks, randomness, and network assets.

Use `Layout height="fill"` with `LayoutHeader`, `LayoutContent`, and `LayoutPanel` before reaching for ad hoc wrappers. Dense tool surfaces usually want rows and panels. Dashboards can use Cards for widgets and metrics, but the page chrome should still be frame-first.

## Metadata

Use descriptions that teach selection:

- Name the concrete product surface: `Incident Console`, `Kanban Board`, `Messaging Shell`.
- Include the layout archetype and key components.
- Put the catalog gap in `category`, for example `Tools - Incident Console` or `Dashboard - KPI Summary`.

External integration docs under `templates/` default-export:

```ts
import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Example Console',
  description: 'Dense operations console with a list/detail frame.',
  category: 'Tools - Example Console',
  componentsUsed: ['Layout', 'List', 'LayoutPanel'],
} satisfies AstryxPageTemplate;

export default template;
```

Legacy block docs under `blocks/` use the current npm release shape:

```js
export const doc = {
  type: 'block',
  name: 'Example Block',
  description: 'Reusable block description.',
  isReady: true,
  aspectRatio: 16 / 9,
  componentsUsed: ['Card', 'Text'],
};
```

## Checks

For Astryx PRs, the repeated verification pattern is:

- `pnpm -F @astryxdesign/cli typecheck:template-docs`
- `astryx template <id> --skeleton`
- targeted vitest suites for template command/API and any new component
- sandbox/docsite typecheck when a template imports new components

For this package, run `pnpm check`.

