# Astryx Templates

Custom Astryx template integration for this project.

## Usage

Install this package into an Astryx consumer project, then register it in the consumer's `astryx.config.mjs`:

```js
/** @type {import('@astryxdesign/cli/config').AstryxConfig} */
const config = {
  integrations: ['astryx-templates'],
};

export default config;
```

List current-release block templates:

```sh
npx astryx template --list --type block
```

The published `@astryxdesign/cli@0.1.2` discovers external block templates through `blocks/`. The upstream integration-template API on `facebook/astryx` discovers page and block templates through `templates/` and supports package-scoped listing:

```sh
npx astryx template --list --package astryx-templates
```

This repo keeps both roots so current CLI releases and the incoming API can coexist.

Copy a current-release block template:

```sh
npx astryx template kpi-strip ./src/components
```

With the upstream integration-template API, page templates under `templates/` are copied the same way:

```sh
npx astryx template operations-dashboard ./src/app/operations
```

## Authoring

Each template is a same-stem pair under `templates/`:

```text
templates/
  operations-dashboard.doc.ts
  operations-dashboard.tsx
```

The `.doc.ts` file default-exports Astryx metadata with `type: 'page'` or `type: 'block'`. The `.tsx` file is the single self-contained source file Astryx will show or copy.

Nested template files are allowed, but the path becomes the CLI id. For example, `templates/commerce/product-grid.doc.ts` is used as `astryx template commerce/product-grid`.

Run local checks before publishing or linking:

```sh
pnpm check
```

## Demo

Run the local template browser:

```sh
pnpm demo
```

The demo imports the local template source files directly, shows preview/source tabs, and includes desktop/mobile preview sizing. It uses local shims for unreleased Astryx pieces from the open PRs, including `Stat`, `ChartV2`, and `LogStream`.

See [TEMPLATE_GUIDE.md](./TEMPLATE_GUIDE.md) for the frame-first authoring pattern used by the open Astryx template PRs.
