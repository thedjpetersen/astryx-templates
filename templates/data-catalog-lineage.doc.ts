import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Data Catalog & Lineage Explorer',
  description:
    'Dataset catalog and lineage explorer: a docked 320px left rail with a dataset search box, tag filter ToggleButton pills whose counts recompute live as tags are edited, and a layer-grouped dataset list (warehouse=blue, dbt=orange, BI=purple) with freshness StatusDots and owner captions; a center detail pane whose header carries a quality-score ProgressBar, owner Token, glossary-term chips, inline description editing (TextArea with Save/Cancel), and tag add/remove Tokens with undo of the last removal, above a Columns | Lineage | Usage TabList. Columns is a data-driven Table with a null-rate mini ProgressBar per row, a cycling sort control (schema order / null rate high-low / low-high), and per-dataset column pinning; Lineage renders an upstream/downstream SVG node graph where clicking any node moves the catalog selection and a Switch expands column-level edge strands between a chosen pair with a mapping list; Usage shows MetadataList query stats, an eight-week CSS bar strip, and top queriers. Choose over table-index-detail when selection needs tabs and a node graph rather than a flat metadata pane, and over memory-relation-explorer when the domain is a governed dataset catalog with editable descriptions and tags rather than typed graph facts.',
  category: 'Data - Data Catalog & Lineage Explorer',
  componentsUsed: [
    'Badge',
    'Button',
    'Divider',
    'EmptyState',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'List',
    'MetadataList',
    'ProgressBar',
    'StatusDot',
    'Switch',
    'TabList',
    'Table',
    'Text',
    'TextArea',
    'TextInput',
    'ToggleButton',
    'Token',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
