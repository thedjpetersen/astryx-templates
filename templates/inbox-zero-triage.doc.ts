import type {AstryxBlockTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'block',
  name: 'Inbox Zero Triage',
  description:
    "Swipeable email triage stack for the fictional email app 'Postlight' (coral accent), presented as a SMALL centered experience: two phone-frame specimens at 390px on a muted stage. Specimen 01 freezes the triage screen mid-gesture — faux status bar, coral wordmark glyph beside a '14 of 32 triaged' progress chip, a swipe-action legend row (amber '← Snooze' clock chip, green 'Archive →' chip), the top email card (sender Avatar row, subject, two-line snippet, mono attachment chip) translated right past the threshold with a rotated green ARCHIVE stamp over a revealed success-tinted archive underlay, two scaled-and-offset peek cards behind, and a floating undo snackbar pill whose coral Undo action flips it to a moved-back notice. Specimen 02 freezes the completed state: an 'Inbox zero' celebration with a coral sparkle medallion, a three-cell stat grid whose 18 archived + 9 snoozed + 5 replied tallies sum exactly to the 32-email session, a flame streak chip (6-day streak), and a coral 'Back to inbox' pill CTA. Mono state-id Token captions label the pair; swipe semantics stay on warning/success tokens and the replied stat on the categorical blue, so only the coral is brand. Choose over swipe-triage-stack when the deliverable is a phone-width EMAIL triage specimen sheet — frozen mid-swipe pose, snooze/archive legend, undo snackbar, and an inbox-zero celebration — rather than a live full-page keep-or-discard triage loop with real pointer physics, a history rail, and keyboard dispatch.",
  category: 'Startup Showcase',
  componentsUsed: [
    'Avatar',
    'Button',
    'Heading',
    'HStack',
    'Icon',
    'StackItem',
    'Text',
    'Token',
    'VStack',
  ],
} satisfies AstryxBlockTemplate;

export default template;
