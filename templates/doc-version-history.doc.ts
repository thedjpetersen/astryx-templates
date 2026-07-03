import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Doc Version History',
  description:
    'Document VERSION HISTORY surface for browsing and restoring saved snapshots of a doc ("Atlas Q3 Launch Plan" at Kestrel Labs): a header (doc icon + title Heading + "Version history" note + live version-count Badge + Back-to-document Button), a right 320px version rail grouping 14 versions by day — named versions starred, surplus autosaves collapsed behind per-day "Show N more autosaves" toggles, every row carrying an author facepile (AvatarGroup) and a change-size sparkbar on one shared px-per-word scale — and a main canvas rendering the selected version as a STATIC light-locked paper preview (non-editable by design; the word processor lives elsewhere) with green-wash added and red-strike removed highlight spans, framed by a toolbar (version name + star + inline-rename pencil that swaps to a TextInput, Show-changes Switch, +412/−168-words diff-stats chips) and a floating sticky "Restore this version" Card on any non-current selection. Selecting a rail row swaps the canvas, stats, and restore bar; hiding changes settles the paper to clean prose; naming an autosave promotes it to a starred named version; Restore prepends a new current "Restored: …" version at a fixed literal time and selects it. Choose over doc-suggestion-review when the job is browsing and restoring SAVED SNAPSHOTS of a document, not accepting/rejecting live tracked-change suggestions one at a time.',
  category: 'Office - Doc Version History',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'StackItem',
    'Switch',
    'Text',
    'TextInput',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
