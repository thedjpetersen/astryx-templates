import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Schema Designer (ERD)',
  description:
    'Visual schema editor for a relational database: a pannable dot-grid canvas of five draggable entity cards (users, orders, order_items, products, addresses) with table-name drag handles, PK key / FK link icons, and `type?` nullable shorthand on 40px column rows, connected by SVG bezier relationship lines that re-anchor per column as cards move; tapping a column opens an in-card editor (rename TextInput with duplicate/empty validation, type Selector, nullable and primary-key Switches, two-step delete with an Undo chip) and every edit re-derives the docked 360px right panel — CREATE TABLE DDL in a copyable CodeBlock, column/PK/FK stats line, and a clickable relationship List — plus a validation strip of warning chips (missing primary key, FK type mismatch, duplicate or unnamed column) that select and pulse the offending card. Choose over table-index-detail when the domain is spatial entity-relationship modeling with live derived output, and over form pages when edits must reflect into generated code and cross-entity validation rather than saved fields.',
  category: 'Data - Schema Designer (ERD)',
  componentsUsed: [
    'Badge',
    'Button',
    'CodeBlock',
    'Dialog',
    'Divider',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'List',
    'Selector',
    'StatusDot',
    'Switch',
    'Text',
    'TextInput',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
