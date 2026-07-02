import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Presenter View',
  description:
    "Presenter/speaker console for a live talk: a header status bar (pulsing StatusDot + 'Presenting · Room 4A' that flips to 'Paused' via a pause/resume ToggleButton, 'series-b-pitch.pptx' deck name, a fixed elapsed-timer chip '12:47' in tabular numerals with a 'Started 14:05' tooltip, and a 'Slide 3 of 8' Badge), a dark console body with the large current slide on a white 4:3 AspectRatio paper card (~62%) and a fixed 360px right column stacking a smaller muted 'Next' preview (slide n+1, or an 'End of deck' EmptyState on the last slide), a scrollable speaker-notes panel with A−/A+ font-size steps that disable at the ends, and Kbd shortcut hints ('→ Next', '← Prev', 'G Grid'); a footer control strip holds big Previous/Next Buttons that disable at the deck ends, a centered 'Slide x of 8' counter, and a LayoutGridIcon IconButton opening a slide-jump Dialog of 8 numbered SelectableCard mini thumbnails where the current slide carries a CheckIcon Badge and choosing a tile jumps and closes. Choose over slide-deck-viewer when the surface is the SPEAKER's two-slide + notes cockpit (next preview, timer, jump grid), not an audience-style single document stage; choose over slide-editor-canvas when nothing is editable — the whole chrome is dark-console styled while slide papers stay white.",
  category: 'Slides - Presenter View',
  componentsUsed: [
    'AspectRatio',
    'Badge',
    'Button',
    'Card',
    'Dialog',
    'Divider',
    'EmptyState',
    'Grid',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Kbd',
    'Layout',
    'SelectableCard',
    'StackItem',
    'StatusDot',
    'Text',
    'ToggleButton',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
