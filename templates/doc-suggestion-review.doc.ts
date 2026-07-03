import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Doc Suggestions & Comments',
  description:
    'Collaborative doc REVIEW surface with inline tracked changes and a comment margin: a toolbar header (doc Heading "Atlas Launch Readiness Brief" + "Draft · edited Jun 30 by Alex Rivera" note + live pending-changes Badge + Undo Button + Suggesting/Viewing SegmentedControl), a centered light-locked paper canvas whose 6 paragraphs interleave <ins>-underlined and <del>-struck suggestion spans in per-author ink (10 suggestions from 3 authors) with amber-underlined comment anchors, and a right 360px margin rail ordering suggestion Cards (author Avatar + Insert/Delete/Replace Badge + paper diff chip + rationale + Accept/Reject Buttons) and thread Cards (Avatar + Timestamp, @mentions as Tokens, indented replies, reply TextArea + Send, Resolve/Reopen) by document position behind an author legend with per-author "Accept all" batching and a Show-resolved Switch. Accepting rewrites the span in place and decrements the counter, rejecting reverts it cleanly, every decision is undoable, clicking marked-up text highlights and scrolls to its rail card and vice versa, and Viewing mode hides all markup for a clean read while preserving state. Choose over deck-review-comments when the artifact is a TEXT DOCUMENT with inline tracked changes, not slides with positional markers; choose over diff-viewer when edits are prose suggestions negotiated accept/reject one at a time, not code hunks compared side by side.',
  category: 'Social - Doc Suggestions & Comments',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'SegmentedControl',
    'StackItem',
    'Switch',
    'Text',
    'TextArea',
    'Timestamp',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
