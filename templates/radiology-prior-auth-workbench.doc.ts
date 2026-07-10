import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Radiology Prior Auth Workbench',
  description:
    'Aperia payer pre-certification workbench for an imaging group: a 300px auth queue with live denial-risk pips beside the selected auth — a derived verdict banner, patient/order banner with a 240-degree denial-risk gauge, a weighted payer-criteria checklist (Locate / Verify / Detach per rule), and a clinical-evidence pane where note passages highlight as candidates and take inline Attach chips alongside a chart-document tray; attaching or verifying evidence re-derives the rule chips, gauge, verdict, queue pips, and header counters from one link map, and Submit is gated on all criteria.',
  category: 'Healthcare - Radiology Prior Auth Workbench',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'Heading',
    'Text',
    'Badge',
    'Button',
    'Icon',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
