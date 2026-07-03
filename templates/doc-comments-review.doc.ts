import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Document Comments & Review',
  description:
    'Document comments & review surface for a word-processor file: a toolbar header (doc Heading "Atlas Q3 Launch Plan" + review-only Preview Badge + program note + a review-progress summary chip pairing "n of 11 reviewed" with a compact ProgressBar + reviewer AvatarGroup), a centered light-locked paper canvas rendering a STATIC styled document preview (title, section headings, body paragraphs) whose prose interleaves amber comment-anchored highlight spans with green-insertion/red-deletion suggestion spans, and a right 380px margin comment rail driven by Open/Resolved/Suggestions filter pills: threaded comment Cards (Avatar + Timestamp, @mentions as Tokens, emoji-reaction chips that toggle for the current reviewer plus an add-reaction Popover, indented replies, reply TextArea + Send on the active thread, Resolve/Reopen) and a suggestions queue with paper diff chips, per-card Accept/Reject Buttons, an "Accept all" toolbar, and decided suggestions settling to compact undoable receipt rows. Clicking a highlighted doc span flips the rail to the matching pill and scrolls to its card and vice versa; accepting rewrites the span in the preview, and every count (pills, chip, queue) recomputes live and agrees across panels. Choose over doc-suggestion-review when the surface centers the COMMENT WORKFLOW — threaded margin comments with reactions and @mentions, filter pills, and a review-progress chip — with suggestions as a compact triage queue, rather than per-author inline tracked-change negotiation with undo history and a Suggesting/Viewing mode switch; choose over deck-review-comments when the artifact is a text document, not slides with positional markers.',
  category: 'Office - Doc Comments & Review',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'Popover',
    'ProgressBar',
    'StackItem',
    'Text',
    'TextArea',
    'Timestamp',
    'ToggleButton',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
