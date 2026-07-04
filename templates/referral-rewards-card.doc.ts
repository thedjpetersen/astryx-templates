import type {AstryxBlockTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'block',
  name: 'Referral & Rewards Card',
  description:
    "Phone-width referral card for Perch, a fictional teal-accent consumer bank, presented as two captioned specimens centered on a muted stage. The active specimen stacks the brand row, a '$30 for you, $30 for them' headline, a dashed referral-code pill (PERCH-JULE30) whose copy button pops a transient Copied toast chip in a fixed-height slot, a brand-teal tier ProgressBar (2 of 3 friends joined, $60 earned, +$25 bonus at 3), an invited-friends list with Joined/Pending/Expired Badge chips and a one-shot Nudge button on the pending row, a Message/Email/More share row of 44px icon buttons, and a referral-terms Link. The second specimen freezes the reward-unlocked celebration: a deterministic confetti-dot pattern over the card, a 3-of-3 recap, a reconciling earnings breakdown (3 × $30 = $90 + $25 = $115), and a solid-accent Claim button with a claimed confirmation state. Choose over wallet-card-fan when the deliverable is a single growth/referral card widget, not an interactive fan of payment cards with a transaction ledger; choose over payout-statements when reward math is a lightweight in-card breakdown rather than a gross-to-net statements archive; choose over composer-state-gallery when the specimen pair showcases a product reward card, not chat-input anatomy.",
  category: 'Startup Showcase',
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
    'Link',
    'ProgressBar',
    'StackItem',
    'Text',
    'Token',
    'VStack',
  ],
} satisfies AstryxBlockTemplate;

export default template;
