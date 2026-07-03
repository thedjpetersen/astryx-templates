import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'API Request Explorer',
  description:
    'Postman-style API client: a collection sidebar with a two-folder request tree (color-coded methods, dirty-state dots) and a history rail that restores past sends, beside a request builder with a method Selector, URL bar, live resolved-request strip that substitutes dev/staging/prod {{base_url}} variables, and Params/Headers/Body tabs of add/toggle/delete key-value rows — Send animates into a canned status/latency/size readout over pretty-printed JSON with collapsible nodes.',
  category: 'Operations - API Request Explorer',
  componentsUsed: [
    'Badge',
    'Button',
    'CheckboxInput',
    'Icon',
    'IconButton',
    'Layout',
    'LayoutPanel',
    'List',
    'SegmentedControl',
    'Selector',
    'Spinner',
    'TabList',
    'TextArea',
    'TextInput',
    'Tooltip',
    'TreeList',
  ],
} satisfies AstryxPageTemplate;

export default template;
