// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Switchback — Onboarding Motion Carousel',
  description:
    "MOBILE (390px shell) motion-first 4-page onboarding flow for Switchback, a hiking companion: a 52px navBar (mountain mark + wordmark, 44px Skip that fades out on the last page) over a 3px progress hairline whose fill scaleX tracks overall scroll progress, then a horizontal scroll-snap pager (native touch swipe; mouse drag via pointer capture that suspends snap during the drag and settles to the nearest page on release, >48px flicks advancing one page). Each page composes a 240px illustration from 3 token-tinted layer groups that parallax against the per-page scroll offset at +8/−16/−24px — layered hills + dashed trail + floating pin, horizon + clouds + sun with an orbiting satellite, a 70% pace gauge arc + pulsing halo + '9:42 /mi' chip, and twin peaks + snowcap + swaying pennant + 6 fixed confetti dots — each carrying ONE looping idle animation (bob / orbit / pulse / sway, transform keyframes). Eyebrow/headline/body copy fades and rises in with 80/160ms staggers when its page becomes the scroll-derived active index. The footer dock is the mandatory button path: 44px Back, page dots whose active dot spring-stretches into a 20px pill, and a 48px primary that width-morphs 104→148px with a label crossfade into 'Get started' on the last page — firing a checkmark draw-on overlay (SVG ring 480ms stroke-dashoffset, check 320ms, overshoot pop) then a \"You're in\" toast in the single polite dock; Done converts the primary into 'Start over' for a full deterministic replay. prefers-reduced-motion (matchMedia + change listener) removes parallax and idle loops entirely, pages instantly, swaps dots without stretch, and renders the ring/check complete behind a crossfade. At desktop container widths (>560px via ResizeObserver) it renders the centered 430px phone column on a muted backdrop. Choose over story-progress-viewer when the surface is a swipeable FEATURE-TOUR pager with parallax illustrations and a terminal get-started commitment, not an auto-advancing segmented stories player; choose over mobile-meditation-breath-player when motion sells a product's first-run promise across pages rather than pacing one looping exercise; choose over any desktop template when the brief calls for a phone-first 390px onboarding shell with scroll-snap paging and 44×44 touch targets.",
  category: 'Mobile',
  componentsUsed: ['Icon'],
} satisfies AstryxPageTemplate;

export default template;
