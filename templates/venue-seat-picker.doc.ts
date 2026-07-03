import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Venue Seat Map Picker',
  description:
    'Ticketing seat-selection page: an SVG floor plan of a 581-seat theater (fanned orchestra, two curved balconies, four side boxes — every coordinate derived from arc/grid section descriptors, zero randomness) with a four-step pricing ramp and collapsible legend, section tap-to-zoom via a transition-wrapped transform with a persistent mini-overview that taps back out, seats that toggle into a tier-grouped cart rail with subtotals, a fees line, and remove buttons, a party-size "best available" finder that deterministically picks the best contiguous block and pulses it with a stagger, a hover/focus row-seat-price HUD, and arrow-key seat walking with focus-visible rings; at 375px the legend and cart collapse into a snap bottom sheet and zoom moves to +/− buttons with drag panning. NOTE: this is the StyleX pilot template — the hand-rolled seat map is styled with @stylexjs/stylex, so consumers need @stylexjs/unplugin (or another StyleX compiler) in their build. Choose over booking-availability-picker when the surface is picking physical seats on a spatial map rather than time slots; choose over org-chart-explorer when the canvas is a fixed venue geometry to buy from, not a hierarchy to reorganize.',
  category: 'Spatial - Venue Seat Map Picker',
  componentsUsed: [
    'Badge',
    'Button',
    'Divider',
    'EmptyState',
    'IconButton',
    'Layout',
    'LayoutPanel',
  ],
} satisfies AstryxPageTemplate;

export default template;
