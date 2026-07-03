import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Suite Home & App Launcher',
  description:
    "Productivity-suite home / app launcher — the suite front door for the Kestrel Labs workspace: a 64px top nav (grid brand mark, centered 640px global search TextInput whose recent-queries + quick-open dropdown is rendered open on load with removable recent-search rows, per-app file matches, and Kbd hints), a greeting row with the day's headline counts, a six-tile app launcher grid of ClickableCards (Docs / Sheets / Slides / Meet / Mail / Drive) with brand-tinted glyph squares, a corner unread Badge on Mail and a live meeting dot on Meet, an upcoming-meetings strip whose live standup carries a success Badge and a primary Join button that flips to 'Return / In call', a 'Jump back in' recent-files rail with per-app faux-document preview art, editor + last-edited metadata, star toggles, and a MoreMenu with a working 'Remove from recents', a 'Start a new file' templates gallery row with a selection outline and Create action, and a storage meter Card with a stacked per-app usage bar and tabular legend that sums to the 38.4 / 100 GB readout. Choose over command-palette-launcher when the launcher is a full suite-home page of app tiles, file rails, and meetings rather than a keyboard-summoned overlay; choose over file-browser-preview when the surface is a cross-app dashboard front door, not a folder tree with a file preview pane; choose over calendar-week-agenda when meetings are one join-strip among launcher sections, not the scheduling grid itself.",
  category: 'Office - Suite Home',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Button',
    'Card',
    'ClickableCard',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Kbd',
    'Layout',
    'MoreMenu',
    'SegmentedControl',
    'StackItem',
    'Text',
    'TextInput',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
