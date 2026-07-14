// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'App Switcher Deck',
  description:
    "MOBILE (390px shell) motion-first app-switcher surface for the invented Slate OS: a 52px navBar ('Switcher' + a derived '6 open' count chip) over a horizontal scroll-snap deck of six 286×404 app cards (Ledger / Waypoint / Perch / Pantry / Trellis / Skylark), each a header row (32px gradient icon tile + name + frozen '2h ago' label + 44×44 ✕) above a hue-gradient fake screenshot (translucent chrome bars, stat line, monogram watermark — no network media). The centerpiece is the deck physics: onScroll reads scrollLeft to scale the center card to 1 and neighbors to 0.92 while each screenshot's inner content parallaxes ±12px against the scroll (transform-only); swiping a card upward (pointer capture, touchAction pan-x so the snap stays native) follows the finger with slight rotation and opacity falloff, flies out past 140px via a decelerate transition chained on transitionend, and the deck closes the gap with a ±298px translateX keyframe — the per-card ✕ commits through the SAME close path, and 44×44 prev/next chevrons back the snap gesture. A 4-tile dock 'opens' apps: the matching card scroll-centers, runs a scale-1.24 zoom keyframe toward full stage, settles back, and a dismissible success Banner ('Opened Ledger') drops in under the navBar (absolute inside the shell, 4s auto-clear). The single polite toast dock posts 'Closed Waypoint' with an 'Undo close' action that reinserts the card at its original index with a restore pop and reverse gap shift; closing all six reveals a 'Nothing open' empty state with a Restore path. Reduced motion (matchMedia + change listener, plus a CSS media block) removes parallax, scale falloff, fly-outs, and the zoom — closes become instant, snap stays. At container widths >560px it renders the standard centered 430px phone column on a muted backdrop. Choose over swipe-triage-stack when cards live in a horizontal scroll-snap deck with vertical fling-to-dismiss (an OS switcher anatomy) rather than a stacked tinder pile with left/right verdicts; choose over mobile-chrome-gallery when the scroll-snap carousel IS the product surface with real dismiss/restore state, not a frozen specimen; choose over story-progress-viewer when paging is card-scaled snap with parallax, not a segmented full-bleed stories player.",
  category: 'Mobile',
  componentsUsed: ['Banner', 'Icon'],
} satisfies AstryxPageTemplate;

export default template;
