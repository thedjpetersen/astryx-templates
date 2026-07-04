import type {AstryxBlockTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'block',
  name: 'Live Activity Widgets',
  description:
    'Small-scale live-activity specimen gallery: three lock-screen-style glance widgets stacked at phone width (maxWidth 430) on one scheme-locked blurred-gradient stage beneath a thin clock hint, each specimen under a mono caption label and each its own fictional brand — Skillet (orange food delivery: brand mark, 12-min ETA countdown, three-stop courier progress track with a bike rider marker at 66%, order summary line), Courtside (indigo live basketball score: team monogram circles, Q4 2:36 quarter clock, BONUS indicator chip), and Tidepool (teal focus timer: SVG ring countdown with 18:24 of 25:00 remaining, session label, pause glyph). Token-pure page chrome frames the stage; all widget paint is explicit dark-glass literals. Choose over dashboard-widget-grid when the deliverable is phone lock-screen glance cards on a dark stage, not a rearrangeable desktop dashboard of metric tiles; choose over kpi-strip when the widgets narrate live, in-flight activities (a courier en route, a game clock, a running timer) rather than compact operational KPIs; choose over composer-state-gallery when the specimens are three distinct branded surfaces, not one component frozen across its states.',
  category: 'Startup Showcase',
  componentsUsed: ['Badge', 'Heading', 'Icon', 'Layout', 'Text'],
} satisfies AstryxBlockTemplate;

export default template;
