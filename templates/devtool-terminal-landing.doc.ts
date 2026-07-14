import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Dev Tool Landing',
  description:
    'Dark-first marketing landing page for a fictional CLI build tool ("Quarry"): a sticky navbar with smooth-scrolling scroll-spy anchors and a Star-on-GitHub CTA, a scheme-locked dark hero whose terminal window types the install command, stages installer output to a success check, and loops with a Replay button (reduced motion renders the final frame), a 3-up "why" card grid, a before/after benchmark band with reveal-triggered growing bars and count-up seconds against invented competitors, a Config/Cache/CI TabList swapping annotated diff CodeBlocks, an invented-company monogram logo strip, a 3-step quickstart with copyable commands, and a dark footer with a v3.2 · MIT version badge. Choose it over saas-landing-page when the product is a developer tool whose hero moment is a terminal, not an app screenshot.',
  category: 'Marketing - Dev Tool Landing',
  componentsUsed: [
    'Badge',
    'Button',
    'CodeBlock',
    'Grid',
    'Icon',
    'Layout',
    'TabList',
    'Toast',
  ],
} satisfies AstryxPageTemplate;

export default template;
