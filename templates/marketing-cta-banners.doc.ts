import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'CTA & Banner Showcase',
  description:
    "Two-part marketing showcase for banners and CTA sections. The top region demos three announcement banners: a slim full-bleed top bar with a changelog link and a 40px dismiss, a gradient promo panel whose d/h/m/s countdown ticks live from a fixed 3d 07:42:18 fixture budget (claim Button plus a LAUNCH20 code Token, flipping to an offer-ended state at zero), and a floating bottom privacy banner with Accept all / Manage preferences — Manage expands an inline consent panel of Switches (Essential locked on) with a Save choices action. Dismissals actually remove each banner, leaving a dashed placeholder, and a demo toolbar in the LayoutHeader carries a dismissed-count Badge plus per-banner restore Buttons. The lower region stacks four CTA section variants: a centered dark panel with dual buttons, a split CTA pairing a Check-bullet feature list with a CSS-drawn browser screenshot mock, a gradient brand panel whose email capture validates (empty/format errors inline) and swaps to a confirmed you're-on-the-list state with a reset, and a boxed trial CTA over a fine-print terms line. Every banner and CTA button fires a corner Toast naming its variant so the wiring is provable. Below 760px the split rows stack; below 640px toolbar labels drop to icons and the email form stacks. Choose over pricing-plans when the page sells with banners and CTA panels, not a tier comparison; choose over notification-center when banners are marketing surfaces on the page, not an app-chrome notification tray; choose over event-detail-rsvp when the conversion target is a product signup, not event attendance.",
  category: 'Marketing - CTA & Banner Showcase',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'StackItem',
    'Switch',
    'Text',
    'TextInput',
    'Toast',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
