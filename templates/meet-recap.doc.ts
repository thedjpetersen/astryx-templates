import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Meeting Recap & Transcript',
  description:
    "Post-meeting recap surface for the Kestrel Labs 'Atlas Q3 · Launch Readiness Review': a header with meeting title, date/duration/organizer metadata, a 10-of-12 attendance Token (absentees on hover) and Share / download-transcript / linked-doc actions; a recording player strip pairing a colorScheme-locked dark CSS-gradient thumbnail stage (play/pause button, chapter-title chip, tabular elapsed/total readout, progress rail) with a scrub Slider flanked by timecodes, categorical chapter markers registered under the track on the same percent scale, and a clickable chapter-chip row; a transcript pane with a search box (light-dark tinted hit highlights plus a matches-in-segments count), per-speaker ToggleButton filter chips with color dots, and 24 speaker-attributed segments whose timecode buttons seek the player while the playhead-synced segment carries a Now-playing Badge and inset accent outline; and a 380px end panel with the AI summary Card (key points, decision Badges, copy and thumbs feedback), the action-items Card (CheckboxInput completion with strikethrough, assignee Avatar, due-date Token, source-timecode deep link, per-row and add-all Add-to-Tasks buttons), and attendance/talk-time analytics (attendee AvatarGroup facepile with +4 overflow, per-person horizontal bars on one labeled 0–30% shared scale with right-aligned mm:ss · share readouts). Choose over video-call-layout when the surface is the after-the-meeting recording, transcript, and summary review rather than the live in-call tile grid, control bar, and chat rail.",
  category: 'Office - Meeting Recap',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Button',
    'Card',
    'CheckboxInput',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'Slider',
    'Text',
    'TextInput',
    'ToggleButton',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
