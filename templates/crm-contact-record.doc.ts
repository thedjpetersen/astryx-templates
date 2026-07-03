import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'CRM Contact Record',
  description:
    '360-degree CRM contact page for one person (Elena Marsh at Northwind Logistics): a header with back arrow, Avatar, star ToggleButton, owner chip, lifecycle Badge, and a clickable Lead → MQL → Opportunity → Customer stepper whose advance/rewind swaps the Badge and auto-logs a stage-change entry into the timeline; a left 300px panel of inline-editable field groups (email, phone, segment Selector, custom properties) with pencil-edit and Save/Cancel affordances; a center Note|Call|Email|Task TabList composer whose submissions prepend correctly typed and iconed timeline entries above a 12-entry mixed history filtered by ToggleButton chips with live counts, where task entries carry CheckboxInputs that strike the title when done; and a right 300px rail with an open-tasks counter that tracks those checkboxes, two open-deal cards with stage ProgressBars and a derived pipeline total, and a company MetadataList. Both panels collapse into single-pane Collapsible cards on narrow widths. Choose over issue-detail when the record is a PERSON with lifecycle state and logged touchpoints, not a ticket with sub-tasks and CI; choose over profile-page when fields must edit inline and activity must be authored, not just read.',
  category: 'Business - CRM Contact Record',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'CheckboxInput',
    'Collapsible',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'MetadataList',
    'ProgressBar',
    'Selector',
    'StackItem',
    'TabList',
    'Text',
    'TextArea',
    'TextInput',
    'Timestamp',
    'ToggleButton',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
