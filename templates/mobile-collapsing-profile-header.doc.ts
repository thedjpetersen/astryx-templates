// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Marquee — Collapsing Profile Header',
  description:
    "MOBILE (390px shell) creator profile for Marquee driven entirely by scroll position — one rAF-throttled passive scroll listener, transforms/opacity only: a 220px hue-gradient cover parallaxes at 0.4× scroll and scales up on overscroll pull-down; the 88px avatar is position:sticky top:10 with an interpolated scale (1 → 32/88 over a 218px travel built purely from fixed heights) so it shrinks continuously and lands as a 32px chip in the 52px navBar's leading slot exactly as sticky engages; the 28px hero display name and the 17px navBar title crossfade as two elements on scroll thresholds; the stats row (Posts 248 / Followers 12,438 / Following 186, tabular-nums — followers derive from the follow state) pins at top:52 UNDER the navBar then fades as the tab row approaches; and the Posts / Clips / About tab row docks at top:52 with a hairline + shadow that appear only once docked (measured against the real scroller, never assumed). Tab switches swap the panel with a directional ±28px slide keyed by tab-index delta over a sliding 2px ink underline; the Follow button morphs to 'Following ✓' with a width transition (104 → 148, the sanctioned tiny-control exception) plus an SVG stroke-dashoffset check draw-on, increments the followers stat, and posts a toast in the single polite dock (Share posts 'Profile link copied'). Fixtures: 12 post cards (120px gradient art, kind chips, fixed likes/comments), 8 clip tiles with duration chips on an art-anchored scrim, and a 4-row About card — deterministic throughout. Reduced motion (matchMedia + change listener) removes parallax and every interpolation: the avatar stays in the hero while a 24px mini avatar crossfades into the navBar, and name/stats/hairline swap at thresholds with opacity crossfades only. At container widths >560px (useElementWidth ResizeObserver) it renders the standard centered 430px phone column on a muted backdrop. Choose over mobile-search-morph-filter when the navBar transformation is scroll-driven collapse rather than a search takeover; choose over mobile-creator-pulse when the surface is the public-facing profile with scroll choreography, not creator analytics; choose over mobile-onboarding-motion-carousel when motion follows vertical scroll position instead of paged swipes; choose over any desktop profile when the brief calls for a phone-first 390px shell with a 52px navBar, sticky collapse ladder, and 44×44 touch targets.",
  category: 'Mobile',
  componentsUsed: ['Icon'],
} satisfies AstryxPageTemplate;

export default template;
