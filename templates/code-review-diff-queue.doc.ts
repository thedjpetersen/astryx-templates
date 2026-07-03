import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Review Queue',
  description:
    'PR review QUEUE surface for working through a multi-file change: a top bar with the PR Heading ("Harden webhook signature verification" #482) + "Open" Badge + branch → base meta and Approve / Request-changes Buttons that open a summary-comment Dialog (RadioList verdict + TextArea, submit disabled for an empty request-changes summary; the submitted verdict paints an Approved / Changes-requested Badge), a CI checks strip of StatusDots (pass/running/warning) under the title row, a 280px directory-grouped file-tree rail whose rows carry per-file +added/−removed counts, open-thread markers, and viewed CheckIcons above a files-viewed ProgressBar, and a diff panel for the active file — unified/split SegmentedControl, old/new line-number gutters, token-tinted add/remove rows, inline comment threads anchored to lines with reply/resolve, a "Viewed" collapse Switch, and a "Mark viewed & next" queue advance. At <=640px the rail collapses to a single-pane fallback of ProgressBar + file Selector + prev/next steppers. Choose over diff-viewer when the surface is a MULTI-FILE review queue — tree rail, viewed progress, verdict dialog, CI strip — not a single-file compare.',
  category: 'Coding - Review Queue',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Code',
    'Dialog',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'ProgressBar',
    'RadioList',
    'SegmentedControl',
    'Selector',
    'StackItem',
    'StatusDot',
    'Switch',
    'Text',
    'TextArea',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
