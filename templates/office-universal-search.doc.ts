import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Suite Universal Search',
  description:
    "Suite-wide universal search results page — the Kestrel Labs workspace resolved for one executed query ('atlas launch'): a 64px top nav with the query in a centered search TextInput, a 280px filter rail (content-type CheckboxInputs for Docs / Sheets / Slides / Meetings / Mail, an owner facet, and a cumulative last-modified RadioList — every count derived from the same 26-result fixture so type, owner, date, group-header, and summary numbers always agree), and a scrolling 880px results column: a results summary line, a 'Best match' hero Card for the Atlas Q3 Launch Brief with typographic doc-preview lines and a hit-highlighted excerpt plus Open / Share actions, per-app result groups of rich rows (brand-tinted app glyph chip, hit-highlighted title and snippet, owner + modified metadata, shared facepile) with per-group 'Show N more' expanders, meeting rows carrying Join / View recap actions (the live standup's Join flips to 'In call'), a related-people rail of avatar ClickableCards with roles and matching-result counts, and a search-tips footer of operator chips with a Kbd hint; below 900px the rail becomes a toggle-chip row for the type facet. Choose over office-home-launcher when the surface is an executed cross-app results page with facets and grouped hits, not the suite front door of app tiles and rails; choose over mail-search-builder when search spans every app with faceted results, not a mail-only query builder; choose over command-palette-launcher when search is a full results page, not a keyboard-summoned overlay.",
  category: 'Office - Universal Search',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Button',
    'Card',
    'CheckboxInput',
    'ClickableCard',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'Kbd',
    'Layout',
    'RadioList',
    'StackItem',
    'Text',
    'TextInput',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
