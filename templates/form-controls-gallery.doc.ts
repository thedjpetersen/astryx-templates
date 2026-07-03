import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Form Controls Gallery',
  description:
    'Form-controls reference gallery: a sticky section rail (Selector jump menu on mobile) beside eight labeled Card panels, each showing 3-5 live variants of one control family — input groups (leading icon, https://-prefix/.astryx.app-suffix add-ons, inline validation that clears on fix, pill search with clear), select menus (native-styled Selector, custom Popover listbox with descriptions, avatar option rows), textareas (basic, autogrow with a 280-character counter, toolbar-attached with Bold/Italic/List toggles), radio groups (stacked with descriptions, tier card selector, pricing-table radios with end-pinned prices), checkboxes (indeterminate parent derived from four children, card checkboxes), toggles (simple, Monthly/Annual flanked labels, per-row settings list), comboboxes (Typeahead over 30 fixture users with keyboard navigation and an empty-result state, multi-select Tokenizer chips), and action panels (enable/disable, destructive delete gated by an AlertDialog with undo Banner, input-embedded invite). Every control is genuinely stateful, a mono JSON readout strip closes each panel, and a header Reset-all returns the gallery to fixture state. Choose over form-page or form-wizard when the deliverable is the control catalog itself — a UI-kit reference sheet, not one real form.',
  category: 'UI Kit - Form Controls Gallery',
  componentsUsed: [
    'AlertDialog',
    'Avatar',
    'Badge',
    'Banner',
    'Button',
    'Card',
    'CheckboxInput',
    'Code',
    'Divider',
    'FieldStatus',
    'Heading',
    'Icon',
    'Layout',
    'Popover',
    'RadioList',
    'Section',
    'SelectableCard',
    'Selector',
    'Switch',
    'Text',
    'TextArea',
    'TextInput',
    'ToggleButton',
    'Token',
    'Tokenizer',
    'Toolbar',
    'Typeahead',
  ],
} satisfies AstryxPageTemplate;

export default template;
