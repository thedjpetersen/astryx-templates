import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Slide Deck Viewer',
  description:
    'Presentation viewer with a header pager bar (deck icon + "q2-business-review.pptx · Slide 4 of 6" + prev/next IconButtons that disable at the ends), a fixed 112px left thumbnail rail of numbered 4:3 miniature SelectableCards (active tile gets a primary border ring), and a centered main stage rendering the active slide as a large white 4:3 AspectRatio card with shadow, its content drawn from static positioned text/image shape fixtures (big bold title, bullet lists, a two-column body, an image placeholder). Includes an "(empty slide)" state on one slide and a caption for the "Parsing presentation…" loading variant. Choose over file-browser-preview when the surface is paging through one document\'s slides with a persistent thumbnail rail, and over ai-chat-artifact when there is no chat — this is a standalone document stage.',
  category: 'Content - Slide Deck Viewer',
  componentsUsed: [
    'AspectRatio',
    'Badge',
    'Card',
    'Center',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'SelectableCard',
    'Skeleton',
    'Text',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
