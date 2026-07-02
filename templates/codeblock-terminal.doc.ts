import type {AstryxBlockTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'block',
  name: 'Code - Terminal',
  description:
    'Dark terminal-style command block using CodeBlock inside a SyntaxTheme dark preset.',
  category: 'Code',
  componentsUsed: ['CodeBlock', 'SyntaxTheme'],
} satisfies AstryxBlockTemplate;

export default template;

