import type {AstryxBlockTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'block',
  name: 'Focus & Status Sheet',
  description:
    "Status-setting focus sheet for the Kestrel Labs team workspace (focus-violet accent), shown as three phone-width specimens side by side on a soft violet-tinted stage, each under a mono state-id caption: specimen 01 is the bottom sheet OPEN inside a 360px phone frame over a dimmed channel backdrop — grab handle, six-preset emoji grid (Focusing / Lunch / Commute / PTO / Sick / Custom, Focusing selected), a focus-mode section with a DND Switch ('Notifications paused' subtext), duration chips 30m/1h/2h/until-tomorrow with 1h selected, a calendar-sync note ('busy until 3:00 PM — Atlas Q3 deep-work block'), a status TextInput with tappable emoji prefix, a clear-after Selector, and a full-width Set button; specimen 02 is the ACTIVE-FOCUS compact card — flame glyph inside an SVG remaining-time progress ring, 'Focusing · 42m left', Snooze/End buttons with live snoozed and ended branches, and a '12 held' suppressed-notifications chip; specimen 03 is the TEAMMATE VIEW — Marcus Webb's row in the #atlas-q3 member list with a violet focus badge on his Avatar and the badge tooltip pinned open ('mentions held until 3:00 PM'), plus available-presence contrast rows. Presets, chips, the DND switch, and Snooze/End are all live local state; every time (2:00 PM start, 42m left, 3:00 PM end) and count (12 held = 3 mentions + 9 pings) reconciles across specimens. Choose over member-presence-card when the surface is the FIRST-PERSON act of setting and running your own status/focus block (sheet, DND controls, durations), not the hover-card a teammate reads; choose over bottom-sheet-snap-explorer when the deliverable is a product status sheet's frozen states, not draggable snap-point sheet mechanics over a map; choose over notification-center when notifications appear only as a held-count chip on a focus card, not a chrome tray of notification rows; choose over messaging-shell when the sheet merely overlays a dimmed stand-in of a channel screen — no live message stream is rendered.",
  category: 'Team Workspace',
  componentsUsed: [
    'Avatar',
    'Button',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Selector',
    'StackItem',
    'Switch',
    'Text',
    'TextInput',
    'Token',
    'VStack',
  ],
} satisfies AstryxBlockTemplate;

export default template;
