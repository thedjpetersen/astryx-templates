import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Event RSVP',
  description:
    "Event detail page built around a live RSVP flow: a fixture-gradient hero band (event chips, title, date/time/venue meta rows, hosted-by Avatars), a sticky 340px end-panel RSVP Card with a Going/Maybe/Cannot-go SegmentedControl, a 0–4 guest-count stepper that only counts while Going, a capacity ProgressBar ('N spots left', flipping to warning near capacity), and an Add-to-calendar confirmation; an attendee section whose AvatarGroup + overflow and per-response count rows (Going/Maybe/Cannot go, your row tagged with a 'You +N' Token) all recompute from your choice; an agenda of sessions with time ranges, track Tokens, speaker Avatars, and working save-to-my-schedule bookmark toggles feeding a saved-count Badge; a location block pairing a schematic CSS-drawn map placeholder (street grid, park, water, venue pin — no tiles or imagery) with a venue MetadataList and directions/copy-address Buttons; and a small discussion thread with Avatars, Timestamps, and a TextArea composer that appends comments. Below 900px the panel stacks under the hero as a single pane with the RSVP card first in reading order. Choose over profile-page when the document is an EVENT with a response funnel, not a person; choose over pricing-plans when the choice is attendance (Going/Maybe/Cannot go + guests), not a purchase tier; choose over deck-review-comments when discussion is a light comment thread on a page, not anchored review markers on a stage.",
  category: 'Calendar - Event RSVP',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Breadcrumbs',
    'Button',
    'Card',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'MetadataList',
    'MoreMenu',
    'ProgressBar',
    'SegmentedControl',
    'StackItem',
    'Text',
    'TextArea',
    'Timestamp',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
