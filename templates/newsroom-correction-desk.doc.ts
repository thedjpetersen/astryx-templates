import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Newsroom Correction Desk',
  description:
    'Erratum corrections-and-standards workbench for one published story: a serif article pane with inline claim annotations (open, verified, corrected-with-replacement, struck) beside a review rail holding the claim checklist (verify / apply drafted correction / strike / reopen with source notes) and a legal sign-off lane whose gates feed an auto-composed correction notice and a publish button. Resolving claims re-derives the research meter, filter counts, annotation styles, notice text, and gate verdict from one status map; reopening after sign-off revokes signatures. Deterministic fixtures.',
  category: 'Media - Newsroom Correction Desk',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'HStack',
    'StackItem',
    'Heading',
    'Text',
    'Badge',
    'Button',
    'Icon',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
