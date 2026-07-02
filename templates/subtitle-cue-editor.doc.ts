import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Subtitle Cue Editor',
  description:
    "Subtitle/caption editing workbench synced to a mock player: top-left, a 16:9 stage renders the active cue as a real caption overlay (black scrim pill, two-line max) above a transport row, a cue strip that maps every cue as a colored block (amber/red when the cue carries an issue) under a playhead line, and a scrub Slider; top-right, a cue inspector Card with In/Out timecode TextInputs, ±100ms nudge IconButtons, duration and CPS readouts, a character-count FieldStatus that turns error past 42 chars/line, and the cue text TextArea; bottom, a full-width scrolling cue Table (#, in, out, dur, speaker, text, issue Badges) where the row containing the playhead is highlighted and two rows carry live validation flags — 'CPS 23' amber and a red 'Overlaps next by 300ms' between cues 11–12 — plus a footer Toolbar with Add cue / Split / Merge / Shift all ±100ms and a header language Selector that swaps the text track. Choose over transcript-annotator when the user edits timing/text of caption cues against a playhead, and over video-clip-timeline when the timeline is a cue table, not multi-track lanes.",
  category: 'Media - Subtitle Cue Editor',
  componentsUsed: [
    'AspectRatio',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Field',
    'FieldStatus',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Kbd',
    'Layout',
    'SegmentedControl',
    'Selector',
    'Slider',
    'StackItem',
    'Switch',
    'Table',
    'Text',
    'TextArea',
    'TextInput',
    'Toolbar',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
