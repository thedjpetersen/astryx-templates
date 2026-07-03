import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Transcript-Linked Podcast Splicer',
  description:
    "Descript-style text-first audio editor: a transcript pane where every word is a timed span inside speaker-tinted turn blocks — drag-selecting words (pointer capture, with Shift+arrow keyboard parity and enlarged extend-handle buttons on phones) highlights the exact matching span in a two-speaker waveform strip docked in the footer, and Cut strikes the words through while their per-word waveform bars ripple-close via an animated flex collapse, visibly shortening the runtime readout in the LayoutHeader (edited runtime, struck original, −removed Badge). Every cut lands in an Edits | Chapters TabList rail (LayoutPanel end 300, stacked Card below 1024px) with tap-to-restore and restore-all; detected fillers carry dashed underlines and a 'Remove all 14 fillers' sweep cascades the strikes with staggered delays. A play/step transport walks the playhead word-by-word with a karaoke highlight, skipping cut spans seamlessly — sentence-step buttons, a kept-word scrub Slider, and chapter rows whose timestamps re-derive live from the edit list prove all times are computed, never stored. Choose over podcast-episode-player when the transcript is an editing surface (select/cut/restore), not synced listening, and over transcript-annotator when words carry time and the artifact is a spliced timeline, not labels.",
  category: 'Creative - Transcript-Linked Podcast Splicer',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Kbd',
    'Layout',
    'LayoutFooter',
    'LayoutPanel',
    'List',
    'Slider',
    'TabList',
    'Text',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
