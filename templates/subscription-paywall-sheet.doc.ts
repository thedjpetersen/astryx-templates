import type {AstryxBlockTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'block',
  name: 'Subscription Paywall Sheet',
  description:
    'Mobile bottom-sheet paywall specimen for the fictional meditation app Lumo (single lavender accent): two phone-width frames side by side under mono caption Tokens, each a scrimmed app-peek band with the sheet rising over it (grab handle, close button). Specimen 01 is the live paywall — hero glyph + value prop, monthly/annual plan toggle cards with reconciling per-week math ($12.49/mo = $2.88/wk vs $89.99/yr = $1.73/wk) and a SAVE 40% badge on annual, four icon benefit rows, a star-rating strip (4.8 · 210K ratings), a vertical free-trial timeline stepper (today Jul 3 unlock / day 5 Jul 7 reminder / day 7 Jul 9 charge), a brand-accent CTA whose trial fine print and day-7 charge line re-derive from the selected plan, and restore/terms/privacy links. Specimen 02 is the post-trial-started confirmation: success glyph, plan summary rows, the same stepper with today completed, and session/manage actions. Choose over pricing-plans when the deliverable is an in-app upgrade sheet rather than a marketing pricing page; over subscription-billing-portal when the user has not subscribed yet (conversion, not self-serve management); and over bottom-sheet-snap-explorer when the point is paywall content and trial mechanics, not sheet drag/snap interaction physics.',
  category: 'Startup Showcase',
  componentsUsed: [
    'Divider',
    'Heading',
    'Icon',
    'IconButton',
    'Stack',
    'Text',
    'Token',
  ],
} satisfies AstryxBlockTemplate;

export default template;
