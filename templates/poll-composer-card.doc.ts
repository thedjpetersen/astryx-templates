import type {AstryxBlockTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'block',
  name: 'Poll Composer & Results',
  description:
    "Inline channel-poll block for Kestrel Labs' #atlas-q3, shown as three side-by-side specimens of one card on a soft accent-tinted stage, mono caption rows above each: specimen 01 is the composer — Dana Whitfield drafting 'Team lunch Thursday?' with three drag-grip option rows (inline TextInputs, remove buttons, add-option affordance up to 6), a settings row (Multi-select and Anonymous Switches, Closes-in Selector pinned to 24 hours), and a Post button gated on a question plus two filled options; specimen 02 is the open poll — 9 of 12 voted, per-option accent tally bars with right-aligned tabular counts and percentages, named-voter facepiles (anonymous polls would show counts only), an accent 'Your vote' check with inset ring on Thai Basil, and a 'Closes in 21h' countdown chip, where tapping another row moves your vote and recomputes every tally; specimen 03 is the closed state — Souvla ringed and crowned with a Winner chip at 5 votes · 56%, losing bars muted, close timestamp chip, and the order-thread follow-up line. Choose over messaging-shell when the deliverable is the poll block's own compose-to-closed anatomy, not the Slack-style workspace/channel/thread shell such a block would embed in; choose over poll-survey-builder when the surface is one lightweight single-question channel poll card, not the two-pane multi-question survey authoring app with live respondent preview and branch rules; choose over team-decision-log when the vote is an ephemeral channel pulse whose winner merely gets a follow-up line, not the structured register of decision records with approvers and superseded-by links.",
  category: 'Team Workspace',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Button',
    'Card',
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
