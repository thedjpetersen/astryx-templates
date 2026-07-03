import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Booking Picker',
  description:
    'Calendly-style scheduling page: a docked host/service rail (Avatar over a gradient cover band, duration and video-call Badges, description, agenda) beside a pick → confirm → booked flow — a horizontal two-week date strip with availability dots and week paging, a timezone Selector that re-labels UTC fixture slots through fixed offsets (including cross-midnight +1d markers), a time-slot grid with a confirm bar, a details form (name, email, notes) with validation, and a green success panel with add-to-calendar and book-another actions. Choose over form-wizard when the surface is picking a time from availability rather than a multi-step data-entry form; choose over scheduled-send-outbox when the axis is booking a future meeting with a host, not managing already-scheduled mail; choose over form-side-sheet when the whole page IS the booking flow, not a list with an attached editor.',
  category: 'Calendar - Booking Picker',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'FormLayout',
    'IconButton',
    'Layout',
    'LayoutPanel',
    'Selector',
    'TextArea',
    'TextInput',
  ],
} satisfies AstryxPageTemplate;

export default template;
