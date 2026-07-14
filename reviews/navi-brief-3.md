# Batch 3 brief — Mobile animations & experiences

You are authoring ONE page template for /Users/thedeej/dj-code/astryx-templates.

FIRST read `/Users/thedeej/dj-code/astryx-templates/reviews/navi-brief.md`
sections BEFORE its "TEMPLATE SPECS" heading — file/doc conventions,
naming hygiene, and the quality bar apply verbatim (ignore its spec
list). THEN read `/Users/thedeej/dj-code/astryx-templates/templates/mobile-tonight-picker.tsx`
— your canonical exemplar for the MOBILE SHELL CONTRACT (read at least
its full JSDoc header and styles/shell setup). Deliver exactly
`templates/<id>.tsx` + `templates/<id>.doc.ts`, run `pnpm typecheck`
(zero errors in YOUR files; other authors run concurrently), and
return `<id> | <Human Name> | Mobile | <one-line description ≤110 chars>`.

## Mobile shell contract (non-negotiable)

- Root `shell`: relative flex column, width 100%, minHeight '100dvh',
  overflowX 'clip'. The 390px stage IS the phone viewport — no fake OS
  chrome (no fake status bar/notch); your 52px sticky navBar at y=0 is
  the first pixel. The demo renders mobile templates in a REAL 390px
  iframe, so vw units and media queries genuinely work — but still
  measure container width with the useElementWidth ResizeObserver
  helper when you need it; at container widths >560px render the shell
  as a centered ~390-430px column on a var(--color-background-muted)
  backdrop, never a stretched relayout.
- Overlays (scrim, sheets, menus) are position:'absolute' INSIDE shell;
  `position: fixed` is BANNED. While a sheet is open, shell locks to
  {height:'100dvh', overflow:'hidden'} and restores on close.
- ONE polite toast dock (aria-live) — sticky bottom:16 (bottom:76 above
  a 64px tabBar). One toast at a time; a new toast REPLACES the old.
- Density grid: 16px screen inset · 12px card gaps · 24px section gaps ·
  8px chip gaps; navBar 52px sticky z20 with hairline border; inset-
  grouped listCards (12px radius, 1px border, hairline dividers).
- Touch law: every interactive target ≥44×44.
- Color: token-pure chrome. You may quarantine ONE brand accent literal
  as `light-dark(#hex, #hex)` with a contrast-math comment (see the
  exemplar's Color policy block). Never `var(--color-text)`.
- Deterministic: no Date.now(), no Math.random(), no network media.
  Fixture art = hue-gradient tiles + monograms.

## Animation contract (the point of this batch)

Every template here is motion-first. Rules:

- Animate ONLY transform and opacity (plus SVG stroke-dashoffset and
  background-position for shimmer); never layout properties. CSS
  transitions/keyframes via a `<style>` string constant with a unique
  per-template class prefix. Springy feel = cubic-bezier(0.34, 1.56,
  0.64, 1) for overshoot, cubic-bezier(0.22, 1, 0.36, 1) for
  decelerate; state-driven class swaps, `animationend`/`transitionend`
  to chain phases. Stagger via per-index animationDelay.
- Gesture physics: pointer events (setPointerCapture) driving inline
  transform during drag, then a transition-based settle on release.
  NO physics libraries.
- MANDATORY accessibility pair: every gesture has a visible ≥44×44
  button path that commits through the SAME state update (galleries
  call this the "mandatory button path" — follow it). Announce
  outcomes through the toast dock or an aria-live region.
- MANDATORY reduced motion: read `prefers-reduced-motion` once via
  matchMedia in a useEffect (with change listener); when reduced,
  swap animations for instant state changes or opacity crossfades —
  shimmer/confetti/loops are REMOVED entirely, not slowed.
- Deterministic "randomness": confetti/particle fields use a fixed
  const array of {x, y, rotation, delay, color-token} entries.
- Timers: setInterval/setTimeout for choreography are fine (cleaned up
  in effects); never wall-clock reads.

## Do NOT rebuild (already in the catalog)

Bottom-sheet snap mechanics (bottom-sheet-snap-explorer), tinder-style
swipe card stack (swipe-triage-stack), list drag-rank (drag-rank-list),
wheel pickers (wheel-picker-scheduler), segmented stories player
(story-progress-viewer), breathing-orb player (mobile-meditation-
breath-player), rolling-digit money keypad + receipt stagger
(mobile-p2p-payment-flow), and the frozen specimen galleries
(mobile-chrome-gallery, mobile-overlay-gallery, mobile-list-input-
gallery — swipe-reveal rows, skeletons, scroll-snap carousel, index
scrubber, toasts, action sheets live there). Your template may USE
these patterns incidentally but its centerpiece must be its own spec.

---

# TEMPLATE SPECS (author ONLY yours)

## 1. mobile-pull-refresh-inbox — "Pull to Refresh Inbox"
A parcel-updates inbox whose centerpiece is pull-to-refresh physics.
Drag down from rest (pointer capture on the list when scrollTop=0):
the list translates with rubber-band damping (translate = drag *
0.5 capped ~110px), a 28px indicator arrow rotates with progress and
crosses an "armed" threshold at 72px (arrow flips, hairline halo
pops); release below threshold springs back; release past it snaps
to a 64px holding position, the arrow morphs to a spinner (rotation
keyframe), and after a 1.4s staged timer three new rows insert with
a stagger (each slides down + fades from -8px, 60ms apart) while a
toast announces `3 new updates`. A 44×44 Refresh button in the
navBar is the button path (same choreography, no drag). Second
refresh yields `You're all caught up` with a settle bounce. Rows:
carrier monogram tile, title, status line, relative time; 9 rows.
Reduced motion: no rubber-band (instant refresh + instant rows).

## 2. mobile-live-activity-island — "Live Activity Island"
A lock-ish home surface (dimmed wallpaper gradient, big clock text
fixture `9:41`) demonstrating a morphing live-activity capsule pinned
below the navBar: COMPACT (a 120×36 pill: courier monogram + ETA
`12 min` ticking down via interval + pulsing dot) ⇄ EXPANDED (tap:
pill morphs to a 358×132 card — width/height/radius transition with
overshoot bezier — showing route progress bar with a moving dot,
driver row, two 44px action buttons Track / Message) ⇄ ALERT state
(auto-fires at a staged moment: capsule flashes warning tint, text
swaps to `Driver arriving`, subtle shake keyframe ×1). A
SegmentedControl in a settings card below (still inside the shell)
lets you force each of the 4 states (compact/expanded/alert/ended —
ended collapses to a checkmark pill then fades out). All morphs are
transform/opacity + width/height on the capsule only (it's tiny —
allowed here as the single sanctioned exception, note it in the
header). Reduced motion: crossfade between states.

## 3. mobile-lockscreen-stack — "Notification Stack"
Lock-screen notification choreography. Wallpaper gradient + clock
fixture. A collapsed stack of 6 notifications (3 visible: front card
full, two behind peeking with scale .96/.92 and translateY offsets)
with a count chip `6 notifications`. Tap the stack → fan-out: cards
expand into a full list with a staggered spring (each card animates
scale+translateY into place, 45ms stagger). Swipe a card left
(pointer drag, translate follows finger, past 96px reveals a clear
affordance) to dismiss with a slide-out + the list closing the gap
via transform transition; a 44×44 `×` per card is the button path.
`Clear All` collapses survivors back into the stack with reverse
stagger then fades them out, leaving `No notifications` + a settle.
Grouped app sections (2 apps), unread dots, timestamps. Reduced
motion: fan-out/dismiss become instant with opacity fades.

## 4. mobile-app-switcher-deck — "App Switcher Deck"
An app-switcher surface: 6 app cards (hue-gradient screenshots with
monogram + fake app chrome rows) in a horizontal scroll-snap deck,
center card at scale 1, neighbors at .92 with parallax (their inner
content translates ±12px against scroll — drive via onScroll reading
scrollLeft, transform-only). Swipe a card upward (pointer drag on a
card: follows finger with slight rotation, past 140px it flies out
with opacity fade and the deck closes the gap); each card also has a
44×44 close `×` (button path). Card header row: app icon tile + name
+ `2h ago`. Under the deck: a dock row of 4 app tiles; tapping a
dock tile "opens" it — the matching card animates scale-up toward
full-stage then a Banner `Opened Ledger` appears and it settles
back (demo affordance). An `Undo close` toast restores the last
closed card to its original index. Reduced motion: no parallax, no
fly-out (instant removal), snap without scale.

## 5. mobile-fab-morph-compose — "FAB Morph Composer"
A notes-list screen with a 56px FAB (bottom-right, above the toast
dock). Tap 1 (short): FAB morphs into a compose sheet — the circle
expands via transform scale + border-radius transition into a
bottom-anchored 320px card (scrim fades in behind, inside shell)
containing title input, body TextArea, and Post/Discard; Post
collapses the sheet back into the FAB, then the new note card
inserts at the top of the list with a highlight pulse that decays.
Long-press the FAB (450ms hold with a filling ring around the FAB;
pointerdown/up timing): a speed-dial arc fans out 3 mini-actions
(Photo note / Voice note / Checklist) with staggered overshoot; each
mini has a label chip; Escape/scrim tap retracts in reverse. A 44×44
`⋯` next to the FAB is the button path for the speed dial. 8 fixture
notes. Reduced motion: sheet appears/disappears with opacity only;
speed dial pops in without stagger.

## 6. mobile-collapsing-profile-header — "Collapsing Profile Header"
A creator-profile screen driven entirely by scroll position (onScroll
reading scrollTop, transforms only): a 220px cover (hue gradient)
with parallax (cover translates at 0.4× scroll and scales on
overscroll pull-down), an 88px avatar that shrinks/translates into
the 52px navBar slot (interpolated transform), the display name
morphing from 28px hero text to the navbar title (crossfade between
two elements as thresholds pass), stats row (Posts / Followers /
Following with tabular numbers) that pins then fades under the
navbar, and a sticky segmented tab row (Posts / Clips / About) that
docks under the navBar with a hairline + shadow appearing only once
docked. Below: 12 post cards so there is real scroll travel; tab
switches swap the list with a directional slide (left/right based on
tab index delta). A `Follow` button in the header morphs to
`Following ✓` with a width transition + check draw-on. Reduced
motion: no parallax/interpolation — elements swap at thresholds with
opacity crossfades only.

## 7. mobile-onboarding-motion-carousel — "Onboarding Motion Carousel"
A 4-page onboarding flow with scroll-snap paging (pointer swipe or
the Next button — button path). Each page: a composed illustration
built from 3-4 layered token-tinted shapes that PARALLAX at
different rates against page scroll progress (read scrollLeft,
transform layers ±24/16/8px) plus one looping idle animation per
page (floating bob, slow orbit, pulse — all transform keyframes);
headline + body copy fade/rise in when their page becomes active
(IntersectionObserver or scroll-derived active index). Page dots
morph: active dot stretches into a 20px pill with a spring; on the
last page the Next button morphs into a wider `Get started` primary
(width + label crossfade), which fires a checkmark draw-on overlay
then a toast `You're in`. Skip link top-right (44px). A progress
hairline under the navBar fills with scroll progress. Reduced
motion: parallax and idle loops removed; pages change instantly;
dots swap without stretch.

## 8. mobile-success-celebration — "Success Celebration Flow"
A transfer-confirmation experience: opening state shows a `Confirm
transfer` card (recipient row, amount `$248.00`, Send button with a
brief hold-to-send affordance — press fills the button with an
inset progress sweep in 600ms; releasing early cancels; a plain
`Send now` text button is the alternate path). On commit: (1) the
card flips away (rotateX exit), (2) a 96px circle draws its ring
(SVG stroke-dashoffset 480ms) then the check strokes in (dashoffset,
overshoot scale pop), (3) a deterministic confetti burst — 18 fixed
particles (const array of offsets/rotations/delays, 4 token colors)
animating outward with gravity-ish keyframes over 900ms, removed
from DOM after, (4) the amount counts up 0→248.00 with tabular
numerals over 700ms (interval-driven, fixed steps), (5) a receipt
card slides up with 4 rows staggering in, (6) `Done` + `Send again`
(resets the whole choreography — fully replayable). Toast announces
`Transfer sent`. Reduced motion: skip flip/confetti/count-up; show
final state with a single crossfade (ring/check appear complete).

## 9. mobile-wiggle-grid-editor — "Wiggle Grid Editor"
Home-screen-style app grid (4×5, 20 tiles: hue-gradient icon tiles +
labels, 2 with badges). Long-press any tile (450ms) → EDIT MODE: all
tiles wiggle (two alternating rotate keyframes ±1.6deg with
per-index negative animationDelay so phases differ), each grows a
28px `−` remove chip (still ≥44px hit via padding). Drag a tile
(pointer capture, tile scales 1.08 with shadow, follows finger;
other tiles reflow around the hovered slot via transform transitions
computed from a slot-index model — order actually changes on drop
with a settle spring). Tapping `−` shrinks the tile away and the
grid reflows closed. An Edit/Done 44px navBar button is the button
path (Done exits wiggle mode with a synchronized settle). A dock row
of 4 tiles accepts drops too (max 4 — a full dock bounces the
rejected tile back with a shake). Selection order persists in state.
Reduced motion: no wiggle (chips just appear), reorder via a per-
tile `Move ▸` menu fallback, reflows instant.

## 10. mobile-chat-micro-motion — "Chat Micro-Motion"
A DM thread showcasing message micro-interactions: (a) typing
indicator — three dots with staggered bounce keyframes inside a
ghost bubble; after a staged 2.2s it morphs into the arriving
message (bubble expands from the dot pill with an overshoot spring,
content fades in); (b) sending — composer Send flies the draft text
in a pill along a slight arc to its slot (transform keyframe), then
the real bubble pops in and a `Delivered → Read` receipt line
transitions with a tiny avatar slide; (c) double-tap any incoming
bubble → a heart pops (scale 0→1.3→1 with a 6-particle micro-burst,
fixed offsets) and a reaction chip counts up; a long-press (450ms)
opens the reaction bar (5 emoji, staggered rise) — a 44×44 `+` chip
on each bubble is the button path; (d) an unsend: tap your last
bubble's `⋯` → `Unsend` — the bubble implodes (scale+fade) and a
`Message unsent` placeholder ghosts in; (e) new-day divider pins
briefly while scrolling. 14 fixture messages. Reduced motion: all
pops/arcs become instant/opacity-only; typing dots become a static
`typing…` label.

## 11. mobile-radial-quick-menu — "Radial Quick Menu"
A map-ish canvas screen (schematic token-tinted city blocks) where
long-pressing anywhere (450ms, a filling ring cursor at the press
point) spawns a radial menu at the touch point: 5 action petals
(Pin, Note, Photo, Share, Route) fan out along a 96px arc with
staggered overshoot; the arc auto-flips to stay inside the shell
near edges (compute quadrant from press coords). Dragging from the
center toward a petal highlights it (hit-testing by angle+distance,
petal scales 1.15 with label chip); release commits — the petal
flies to a bottom `Recent actions` tray row that slides in and logs
the action + coordinates. Tapping elsewhere retracts with reverse
stagger. A persistent 44×44 `+` FAB opens the SAME menu centered
(button path); ArrowKeys+Enter navigate petals when opened via FAB.
5 logged fixture actions pre-seeded. Reduced motion: petals appear
in place without fan/stagger; drag-highlight still works.

## 12. mobile-photo-gesture-viewer — "Photo Gesture Viewer"
A 3×4 photo grid (hue-gradient compositions with monogram overlays +
tiny caption chips). Tapping a tile expands it into a full-stage
viewer via a FLIP-style shared-element move: measure tile rect,
animate a clone from tile rect → letterboxed stage rect (transform
only), then reveal the viewer chrome (caption bar, index `4 of 12`,
close). In the viewer: swipe horizontally to page with snap +
neighbor peek; double-tap toggles 2× zoom centered on the tap point
(transform-origin math), when zoomed pointer-drag pans with clamped
bounds and a rubber-band edge; swipe DOWN when unzoomed drags the
photo with scale falloff and backdrop-opacity falloff — past 120px
it dismisses via the reverse FLIP back into its grid tile; below
threshold it springs back. 44×44 close button + prev/next chevrons =
button paths. A filmstrip row at the bottom mirrors the index with
an active-thumb underline that slides. Reduced motion: FLIP becomes
crossfade, zoom toggles instantly, no rubber-band.

## 13. mobile-activity-rings-close — "Activity Rings Close"
A fitness day-summary: three concentric SVG rings (Move 78%, Exercise
100%, Stand 58% — token accent/success/info) that animate closed on
mount via stroke-dashoffset transitions with sequential 220ms delays;
the Exercise ring closing to 100% fires an overshoot glow pulse +
ring-cap dot spark, and a `Goal hit` chip drops in with a spring.
Center: big tabular count-up of Move calories (0→486 over 800ms).
Below: a week strip of 7 mini-ring days (S–S, today highlighted) —
tapping a day RE-RUNS the ring choreography with that day's fixture
values (all three rings retarget with transitions); one rest day
shows the empty-ring state with a dashed hint. Then three metric
cards (Steps 9,214 / Distance 4.8 mi / Flights 12) whose numbers
tick up only when they first scroll into view (IntersectionObserver,
once). A `Replay` 44px button re-triggers everything. Reduced
motion: rings render at final values, no count-ups, `Goal hit`
appears statically.

## 14. mobile-slide-to-confirm — "Slide to Confirm"
A checkout screen whose payment control is a slide-to-pay track:
a 358×56 rounded track with a shimmering hint label (`Slide to pay
$86.40` — background-position shimmer loop), a 48px thumb that
follows pointer drag with resistance near the end, snaps back with
a spring on early release, and past 92% locks to the end, morphs
into a spinner, then the whole track contracts into a success pill
(width transition + check draw-on) while the order card above
stamps `PAID` with a rotate-in badge. A second specimen below:
HOLD-to-confirm — a destructive `Cancel order` button with a
conic-gradient ring that fills over 900ms while held (press-and-
hold; releasing early rewinds the ring fast), completing fires an
undo toast. Both controls have explicit button paths (`Pay with
button instead` text button; a confirm AlertDialog for cancel).
Fixture order summary card (3 items, totals). A Reset link restores
the whole screen. Reduced motion: shimmer removed, slide still
drag-able but settles without spring, hold-ring fills stepwise.

## 15. mobile-flip-countdown-timer — "Flip Countdown Timer"
A focus-timer experience: four split-flap digits (MM:SS) — each
digit is a two-half card; on change the top half rotates down
(rotateX 0→-90) revealing the next value, then the bottom half
completes (−90→0), with perspective + a hairline crease; digits
tick via a 1s interval while running (deterministic: starts at
25:00 fixture). Controls: a 64px play/pause morph button (icon
crossfades, ring pulses while running), +5:00 / −5:00 chips (digits
cascade-flip through the change, 60ms stagger per affected digit),
and a preset row (Pomodoro 25 / Break 5 / Deep 50) as selectable
chips. A session-progress arc wraps the clock (stroke-dashoffset
synced to remaining/total). At 00:00 (reachable via a `Skip to
last 5s` demo chip): digits flip to zero, the arc completes, a
gentle three-pulse halo plays, and a `Session complete · 25 min`
card slides up with a streak row (5 dots, today's fills with a
pop). Stats row below: Today 2 sessions · 50 min (tabular).
Reduced motion: flips become instant digit swaps, no halo, arc
steps discretely.

## 16. mobile-biometric-checkout — "Biometric Checkout"
An Apple-Pay-style payment sheet experience: a store screen (cart
summary card) with a `Buy with FacePay` button that raises the
payment sheet (slides up inside shell, scrim); the sheet shows a
card stack (2 cards, tapping swaps with a tilt/slide shuffle),
merchant + total rows, and a `Confirm with Face` panel: a 72px
face glyph (SVG strokes) that on confirm runs a scan choreography —
a scanning bar sweeps twice (translateY loop ×2), the face strokes
progressively tint, then the glyph MORPHS into a ring+check
(crossfade + draw-on) with a success haptic-style double-pulse
scale, the sheet header stamps `Done`, and after 600ms the sheet
drops away revealing a confirmation banner + order card update. A
`Use passcode instead` 44px path swaps the panel for a 4-dot
passcode pad (dots fill with pops; fixed correct code 1-1-2-2,
wrong entries shake the dot row and clear). A failure demo chip
makes the first scan fail (glyph shakes, `Try again` appears, second
attempt succeeds). Reduced motion: scan sweep/morph replaced by
static state swaps with opacity.

## 17. mobile-search-morph-filter — "Search Morph & Filter"
A places-list screen whose navBar search icon morphs into a full
search takeover: the 44px icon expands into a 358px field (width
transition with overshoot; navbar title fades/slides out; a Cancel
button slides in), a recent-chips row staggers up, and the keyboard
area is suggested by the list dimming. Typing live-filters 14 venue
rows with ANIMATED LIST RE-FLOW: leaving rows collapse (height via
transform-scaled wrapper + opacity) while surviving rows glide to
their new positions using a FLIP pass (measure before/after tops,
apply inverse transforms, transition to identity); match substrings
highlight with a tinted underline that draws in. Filter chips
(Open now / ≤ $$ / Rooftop) toggle with a fill transition and
re-run the same FLIP re-flow; an active-filter count badge pops on
the filter icon. Clearing (Cancel) reverses the navbar morph and
restores the full list with a gentle stagger. Empty state (`No
places for "xq"`) fades in with a shrug glyph. Reduced motion: no
FLIP glides — rows appear/disappear instantly; morph is a crossfade.

## 18. mobile-route-tracking-live — "Live Route Tracking"
A courier-tracking experience: top 46% is a schematic map (token-
tinted blocks + streets as an SVG) with a route polyline that draws
in on mount (stroke-dashoffset), a pickup pin that pulses, and a
courier dot that EASES along the polyline between fixture waypoints
(animate progress 0→1 per leg with a decelerate bezier via CSS
offset-path? No — use getPointAtLength sampled into a keyframe-free
rAF-less approach: precompute 40 sampled points per leg as CSS
keyframes in the <style> constant; advance legs on staged timers).
The dot carries a heading-rotated chevron; passing each waypoint
pops a checkpoint chip on the timeline below. Bottom card: driver
row (avatar, name, ★4.9, Contact 44px buttons), an ETA that ticks
down and RECALCULATES once (staged event at leg 3: ETA chip flashes
amber, `Rerouted +2 min` toast, polyline redraws a detour segment),
and a 4-step progress timeline (Picked up → In transit → Nearby →
Delivered) whose active segment fills with a moving sheen. A
`Simulate arrival` demo chip fast-forwards to the Delivered state:
map dims, a delivered card with check draw-on slides up. Reduced
motion: dot jumps between waypoints, no pulses/sheen, polyline
renders complete.

## 19. mobile-poll-reveal — "Poll Reveal Motion"
A group-chat poll experience: a poll card (`Where for team lunch?`,
4 options, 23 votes). Tapping an option: your selection ring pops,
then ALL bars reveal — each option's fill springs from 0 to its
percentage with a shared decelerate bezier and 70ms stagger,
percentages count up in sync (interval-driven, tabular), the
leading option gets a crown that drops in with a bounce, and voter
avatar chips (3-5 per option, fixed) slide into each row with
stagger. Changing your vote animates both affected bars re-targeting
(width transitions) and live-updates the counts; an `Undo vote`
toast appears. A second poll below in the pre-vote state shows the
hint shimmer on `Tap to vote`; a third, CLOSED poll shows the final
state with the winner banded and a `Poll ended · 41 votes` caption.
A results/percentage toggle (44px) switches labels between counts
and % with a flip transition per label. Reduced motion: bars set
instantly, no crown bounce/stagger; counts render final.

## 20. mobile-gesture-coach — "Gesture Coach"
An interactive gesture-tutorial overlay experience: a mock inbox
screen sits beneath a coach layer that teaches 4 gestures in steps,
each with an animated DEMO GHOST — a 44px translucent finger dot
that replays the gesture path on loop (CSS keyframes: swipe-left
arc over a row, long-press with a growing ring, pull-down with a
rubber-band, two-finger indicated by twin dots pinching — transform
only): step card at the bottom names the gesture (`Swipe left to
archive`), the target row glows with a soft halo, and the user must
PERFORM it on the real row (same pointer handlers as production
patterns; performing it fires the row's actual effect + a success
pop + the step card flips to the next step with a horizontal card
turn). A progress row of 4 step dots fills; `Skip gesture` (44px)
is the button path and advances honestly (marks the step `skipped`).
Finishing all steps: the coach layer lifts (opacity + slight zoom),
a completion card with check draw-on + `4 of 4 gestures — 1 skipped`
summary, and a `Practice again` reset. Reduced motion: ghost loops
become static diagram arrows (SVG) with a `Show me` step-through
button; halos static.
