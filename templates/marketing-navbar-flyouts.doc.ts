import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Navbars & Flyout Menus',
  description:
    'Interactive marketing showcase of three navbar treatments stacked in framed viewports, all driven by one shared Nimbus nav fixture so the variants compare directly. Variant one is a light navbar with centered links and a trailing Sign in / Get started CTA pair whose Product item opens a five-link dropdown with icon discs and one-line descriptions. Variant two floats a dark transparent navbar over a gradient hero and gains a solid background, hairline border, and shadow as a Simulated scroll Slider advances (with a parallax nudge on the hero copy); its Product item opens a full-width mega menu with Platform/Solutions/Resources columns plus a featured-post cell. Variant three is a two-tier navbar with an eyebrow utility row (docs/support links, status dot, phone, locale) whose Product item opens a compact two-column flyout with a footer action bar. Every flyout opens on click/tap — never hover — and dismisses on Escape (focus returns to the trigger) or outside click, with focus moved to the first link on open. A per-frame 375px preview Switch plus a preview-all toolbar Button collapse each bar into a 40px hamburger that opens a real slide-in drawer over a scrim, with 44px nav rows, a Product accordion, and the CTA pair; below 900px the frames auto-collapse and below 640px the eyebrow trims and control rows wrap. Nav links set per-bar active state and every link, CTA, and hero button fires a corner Toast naming its bar, so the wiring is provable. Choose over shell-top-nav when the surface is a marketing site header with flyout menus, not an app shell with sections; choose over marketing-hero-showcase when the navbar and its menus are the exhibit, not the hero sections; choose over marketing-header-newsletter when you need three comparable navbar treatments with working flyouts, not a single header over page content.',
  category: 'Marketing - Marketing Navbars & Flyout Menus',
  componentsUsed: [
    'Badge',
    'Button',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'Slider',
    'StackItem',
    'Switch',
    'Text',
    'Toast',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
