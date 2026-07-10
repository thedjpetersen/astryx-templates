// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file restaurant-shift-swap-console.tsx
 * @input Deterministic Shiftly fixtures only: a hand-authored week of
 *   service (Mon Jul 6 – Sun Jul 12) for the fictional restaurant Juniper &
 *   Vine — 12 roster members and 52 shifts across five role lines (9 host,
 *   14 server, 8 bar, 14 line-cook, 7 dish; 50 assigned + 2 open dish
 *   shifts). Per-staff hours are NEVER hand-captioned — they derive live
 *   from the shift set — but the initial sums cross-check by hand:
 *   Priya 6+6+6+6.5 = 24.5 · Marcus 6×3 = 18.0 · Tess 6×4 = 24.0 ·
 *   Jordan 6+6+6.5 = 18.5 · Dana 8×4+4.5 = 36.5 · Cole 8×3 = 24.0 ·
 *   Ren 7×3+8×3 = 45.0 · Sofia 7×2+8×2 = 30.0 · Gabe 7×2+8×2 = 30.0 ·
 *   June 5.5×3+6×2 = 28.5 · Nia 5.5×4 = 22.0 · Alvaro 6.5×5 = 32.5;
 *   total scheduled = 333.5 h, open (uncovered) = 6.5×2 = 13.0 h, and
 *   exactly ONE person starts over 40 h (Ren, +5.0 OT). Four pending
 *   requests (three swaps, one drop) reference those shifts by id. No
 *   clock reads, no randomness, no timers, no network assets.
 * @output Shiftly — Restaurant Shift Swap Console: a manager's approval
 *   surface. A brand header (swap-loop mark, week scope, four derived stat
 *   tiles: pending requests, open shifts, staff over 40 h, scheduled
 *   hours) sits over a two-region body: the WEEK GRID — five role lines ×
 *   seven day columns of 34px-min shift chips (assignee + compact time),
 *   where chips carrying a pending request wear a dashed paprika overlay
 *   + swap glyph and uncovered shifts render as dashed OPEN slots — beside
 *   a 316px rail stacking the swap-request queue (each card names giver →
 *   taker, shows the shift, the reason, and a LIVE before → after hours
 *   preview for both parties with an over-40 warning chip) over the
 *   overtime meter list (per-staff 8px hour bars on a fixed 0–48 h scale
 *   with a 40 h tick; the over-40 segment burns red) and a decision log.
 *   Signature move: approving a swap re-assigns the grid chip to the new
 *   owner, strips its overlay, and re-derives BOTH parties' meters, the
 *   over-40 stat, and the header in the same render — approving Ren's
 *   Saturday shed drops the over-40 count to zero, while approving Cole's
 *   Thursday give would push Dana to 44.5 h and the card says so before
 *   you click. Approving the drop request empties the chip to an OPEN
 *   slot and bumps the open-shift stat. Tapping any chip or meter
 *   highlights that person's whole week across both surfaces
 *   (aria-pressed); Escape clears. Every decision appends to the log and
 *   announces through a visually hidden live region.
 * @position Page template; emitted by `astryx template restaurant-shift-swap-console`
 *
 * Frame: Layout height="fill" → LayoutHeader (brand + stat strip) →
 *   LayoutContent padding 0 → `.ssc-body` hand-rolled grid
 *   `minmax(0, 1fr) 316px` (hand-rolled rather than LayoutPanel so the
 *   <=900px restructure — rail content re-stacks BELOW the grid — is pure
 *   CSS; a DS panel would pin the rail width inline and defeat the media
 *   query). Left cell scrolls the week grid (horizontally too, below the
 *   breakpoint); right cell scrolls the request queue + meters + log. ONE
 *   state owner: `shifts`, `requests`, `log`, `focusStaffId`,
 *   `announcement` — approve, deny, and highlight all flow through the
 *   same setState reducers, so chips, meters, stat tiles, card previews,
 *   and the log can never disagree.
 * Container policy: rows, rails, chips, and cards-with-a-job (request
 *   cards carry actions) — no decorative card grids. Shift chips and
 *   overtime meters are real <button>s: the displayed owner IS the
 *   affordance for highlighting their week. Stat tiles are static derived
 *   readouts.
 * Color policy: token-pure chrome. ONE quarantined brand accent (Shiftly
 *   paprika) as a light-dark() pair with contrast math at the
 *   declaration; overtime red, caution amber, and cleared green are also
 *   light-dark() pairs, each with math. The nonexistent bare text token
 *   is never used — text is --color-text-primary /
 *   --color-text-secondary throughout.
 * Density grid (repeated verbatim): 12px page gutter · 16px section gap ·
 *   84px role-label column · day columns minmax(84px, 1fr) · 32px day
 *   header row · role rows min 76px · shift chips min 34px on a 4px
 *   stack gap · 316px rail · 40px meter rows · request cards 12px
 *   padding · 56px stat tiles · 40px minimum hit targets · 2px focus
 *   ring at 2px offset. Type: 13px/600 names and card titles · 12px body
 *   meta · 11px/600 chips, overlines, and day headers — nothing under
 *   11px; tabular-nums on every hour figure, count, and time.
 * Fixture policy: fixed strings for every clock ("Submitted Tue 9:14
 *   AM"); shift records carry dual fields (display `time` "5:00 PM –
 *   11:30 PM", compact `short` "5p–11:30p", numeric `hours` 6.5) so
 *   display and math never drift. Stress rows live in the data: Alvaro
 *   Reyes-Santamaría's 23-character name exercises meter truncation, the
 *   drop request carries a 2-sentence reason to exercise card wrapping,
 *   and the two OPEN dish slots make the gap path visible before any
 *   mutation.
 *
 * Responsive contract:
 * - >= 901px (including the ~1045px inline demo stage, where viewport
 *   media queries never fire — this default IS the stage layout): week
 *   grid + 316px rail side by side; day columns are minmax(84px, 1fr)
 *   so the grid tracks the stage width with no breakpoint.
 * - <= 900px: the body drops to one column (subtraction + reorder, not a
 *   squeeze): the request queue re-stacks ABOVE the grid as a horizontal
 *   scroll strip of 300px cards, the week grid keeps a 648px minimum
 *   width inside its own horizontal scroller, and meters + log follow
 *   below full-width.
 * - <= 560px (the 390px embed iframe): stat tiles wrap two-up, the
 *   header subtitle drops, day columns pin at 92px inside the scroller,
 *   and every control keeps a >= 40px hit target.
 * - prefers-reduced-motion collapses the approval flash to a static
 *   outline.
 */

import {useMemo, useState, type KeyboardEvent as ReactKeyboardEvent} from 'react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Icon} from '@astryxdesign/core/Icon';
import {
  ArrowLeftRightIcon,
  ArrowRightIcon,
  CheckIcon,
  ClipboardListIcon,
  FlameIcon,
  InboxIcon,
  UserRoundMinusIcon,
  XIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color is a light-dark() pair with math.
// ---------------------------------------------------------------------------

// THE quarantined Shiftly brand accent (paprika). #A63A11 on #FFFFFF ≈ 5.6:1
// (passes 4.5:1 for 11px+ text); #FF9B72 on the dark body (~#17191C) ≈ 8.3:1.
const BRAND_ACCENT = 'light-dark(#A63A11, #FF9B72)';
// Text/glyphs over a BRAND_ACCENT fill: #FFFFFF on #A63A11 ≈ 5.6:1;
// #3B1204 on #FF9B72 ≈ 8.9:1 (white on #FF9B72 would fail at ≈1.9:1).
const BRAND_ON = 'light-dark(#FFFFFF, #3B1204)';
// Brand wash for highlighted chips / armed cards. Text on the wash is
// BRAND_ACCENT: #A63A11 on rgba(166,58,17,.10)-over-white (≈ #F5E9E4)
// ≈ 5.0:1; #FF9B72 on rgba(255,155,114,.14)-over-#17191C ≈ 7.1:1.
const BRAND_TINT = 'light-dark(rgba(166, 58, 17, 0.10), rgba(255, 155, 114, 0.14))';

// Overtime / open-shift red. Text on card surfaces: #B42318 on #FFFFFF
// ≈ 6.4:1; #FF8A7A on #17191C ≈ 7.4:1. The tint is a wash only.
const HOT_TEXT = 'light-dark(#B42318, #FF8A7A)';
const HOT_TINT = 'light-dark(rgba(180, 35, 24, 0.10), rgba(255, 138, 122, 0.14))';
// Caution amber (pushes-past-40 previews): #92400E on #FFFFFF ≈ 7.3:1;
// #F2B84B on #17191C ≈ 9.8:1.
const WARN_TEXT = 'light-dark(#92400E, #F2B84B)';
const WARN_TINT = 'light-dark(rgba(180, 83, 9, 0.12), rgba(242, 184, 75, 0.14))';
// Cleared / approved green: #15803D on #FFFFFF ≈ 4.9:1; #6FDB96 on
// #17191C ≈ 9.4:1.
const GOOD_TEXT = 'light-dark(#15803D, #6FDB96)';
const GOOD_TINT = 'light-dark(rgba(21, 128, 61, 0.10), rgba(111, 219, 150, 0.14))';

// ---------------------------------------------------------------------------
// DOMAIN TYPES + FIXTURES
// ---------------------------------------------------------------------------

type RoleId = 'host' | 'server' | 'bar' | 'cook' | 'dish';

interface StaffMember {
  id: string;
  name: string;
  /** Compact chip label — first name + last initial. */
  short: string;
  role: RoleId;
}

interface Shift {
  id: string;
  role: RoleId;
  /** 0 = Mon … 6 = Sun. */
  day: number;
  /** Full display time, used in cards and aria labels. */
  time: string;
  /** Compact chip time. */
  short: string;
  /** Numeric hours — the ONLY field arithmetic ever touches. */
  hours: number;
  /** null = uncovered OPEN slot. */
  staffId: string | null;
  /** Sort key within a cell (0 = earlier shift). */
  slot: number;
}

interface SwapRequest {
  id: string;
  kind: 'swap' | 'drop';
  shiftId: string;
  fromId: string;
  /** Present only on kind === 'swap'. */
  toId?: string;
  submitted: string;
  reason: string;
}

interface LogEntry {
  id: string;
  text: string;
  tone: 'approve' | 'deny';
}

const WEEK_LABEL = 'Week of Mon Jul 6 – Sun Jul 12';
const DAYS = [
  {short: 'MON', date: '7/6'},
  {short: 'TUE', date: '7/7'},
  {short: 'WED', date: '7/8'},
  {short: 'THU', date: '7/9'},
  {short: 'FRI', date: '7/10'},
  {short: 'SAT', date: '7/11'},
  {short: 'SUN', date: '7/12'},
] as const;

const ROLES: Array<{id: RoleId; label: string}> = [
  {id: 'host', label: 'Host'},
  {id: 'server', label: 'Server'},
  {id: 'bar', label: 'Bartender'},
  {id: 'cook', label: 'Line Cook'},
  {id: 'dish', label: 'Dish'},
];

// prettier-ignore
const STAFF: StaffMember[] = [
  {id: 'priya',  name: 'Priya Shah',              short: 'Priya S.',  role: 'server'},
  {id: 'marcus', name: 'Marcus Bell',             short: 'Marcus B.', role: 'server'},
  {id: 'tess',   name: 'Tess Nguyen',             short: 'Tess N.',   role: 'server'},
  {id: 'jordan', name: 'Jordan Ellis',            short: 'Jordan E.', role: 'server'},
  {id: 'dana',   name: 'Dana Whitfield',          short: 'Dana W.',   role: 'bar'},
  {id: 'cole',   name: 'Cole Barrera',            short: 'Cole B.',   role: 'bar'},
  {id: 'ren',    name: 'Ren Okafor',              short: 'Ren O.',    role: 'cook'},
  {id: 'sofia',  name: 'Sofia Marin',             short: 'Sofia M.',  role: 'cook'},
  {id: 'gabe',   name: 'Gabe Lindqvist',          short: 'Gabe L.',   role: 'cook'},
  {id: 'june',   name: 'June Park',               short: 'June P.',   role: 'host'},
  {id: 'nia',    name: 'Nia Thompson',            short: 'Nia T.',    role: 'host'},
  // 23-character stress name — exercises overtime-meter truncation.
  {id: 'alvaro', name: 'Alvaro Reyes-Santamaría', short: 'Alvaro R.', role: 'dish'},
];

const STAFF_BY_ID = new Map(STAFF.map(person => [person.id, person]));

/**
 * The whole week, one literal per shift. Header cross-check: 9 host +
 * 14 server + 8 bar + 14 cook + 7 dish = 52 shifts; the two `null`
 * assignees are the Wed/Sat dish OPEN slots (6.5 h each = 13.0 h open).
 */
// prettier-ignore
const INITIAL_SHIFTS: Shift[] = [
  // Host — door 4:30 PM – 10:00 PM (5.5 h) daily; brunch host Sat + Sun.
  {id: 'host-0-door',   role: 'host', day: 0, time: '4:30 PM – 10:00 PM',  short: '4:30p–10p',   hours: 5.5, staffId: 'june',   slot: 1},
  {id: 'host-1-door',   role: 'host', day: 1, time: '4:30 PM – 10:00 PM',  short: '4:30p–10p',   hours: 5.5, staffId: 'nia',    slot: 1},
  {id: 'host-2-door',   role: 'host', day: 2, time: '4:30 PM – 10:00 PM',  short: '4:30p–10p',   hours: 5.5, staffId: 'june',   slot: 1},
  {id: 'host-3-door',   role: 'host', day: 3, time: '4:30 PM – 10:00 PM',  short: '4:30p–10p',   hours: 5.5, staffId: 'nia',    slot: 1},
  {id: 'host-4-door',   role: 'host', day: 4, time: '4:30 PM – 10:00 PM',  short: '4:30p–10p',   hours: 5.5, staffId: 'june',   slot: 1},
  {id: 'host-5-brunch', role: 'host', day: 5, time: '9:30 AM – 3:30 PM',   short: '9:30a–3:30p', hours: 6.0, staffId: 'june',   slot: 0},
  {id: 'host-5-door',   role: 'host', day: 5, time: '4:30 PM – 10:00 PM',  short: '4:30p–10p',   hours: 5.5, staffId: 'nia',    slot: 1},
  {id: 'host-6-brunch', role: 'host', day: 6, time: '9:30 AM – 3:30 PM',   short: '9:30a–3:30p', hours: 6.0, staffId: 'june',   slot: 0},
  {id: 'host-6-door',   role: 'host', day: 6, time: '4:30 PM – 10:00 PM',  short: '4:30p–10p',   hours: 5.5, staffId: 'nia',    slot: 1},
  // Server — lunch 11:00 AM – 5:00 PM (6 h); dinner 5:00 PM – 11:00 PM
  // (6 h), stretching to 11:30 PM (6.5 h) on Fri + Sat.
  {id: 'server-0-lunch',  role: 'server', day: 0, time: '11:00 AM – 5:00 PM', short: '11a–5p',     hours: 6.0, staffId: 'priya',  slot: 0},
  {id: 'server-0-dinner', role: 'server', day: 0, time: '5:00 PM – 11:00 PM', short: '5p–11p',     hours: 6.0, staffId: 'marcus', slot: 1},
  {id: 'server-1-lunch',  role: 'server', day: 1, time: '11:00 AM – 5:00 PM', short: '11a–5p',     hours: 6.0, staffId: 'tess',   slot: 0},
  {id: 'server-1-dinner', role: 'server', day: 1, time: '5:00 PM – 11:00 PM', short: '5p–11p',     hours: 6.0, staffId: 'priya',  slot: 1},
  {id: 'server-2-lunch',  role: 'server', day: 2, time: '11:00 AM – 5:00 PM', short: '11a–5p',     hours: 6.0, staffId: 'priya',  slot: 0},
  {id: 'server-2-dinner', role: 'server', day: 2, time: '5:00 PM – 11:00 PM', short: '5p–11p',     hours: 6.0, staffId: 'tess',   slot: 1},
  {id: 'server-3-lunch',  role: 'server', day: 3, time: '11:00 AM – 5:00 PM', short: '11a–5p',     hours: 6.0, staffId: 'jordan', slot: 0},
  {id: 'server-3-dinner', role: 'server', day: 3, time: '5:00 PM – 11:00 PM', short: '5p–11p',     hours: 6.0, staffId: 'marcus', slot: 1},
  {id: 'server-4-lunch',  role: 'server', day: 4, time: '11:00 AM – 5:00 PM', short: '11a–5p',     hours: 6.0, staffId: 'tess',   slot: 0},
  {id: 'server-4-dinner', role: 'server', day: 4, time: '5:00 PM – 11:30 PM', short: '5p–11:30p',  hours: 6.5, staffId: 'priya',  slot: 1},
  {id: 'server-5-lunch',  role: 'server', day: 5, time: '11:00 AM – 5:00 PM', short: '11a–5p',     hours: 6.0, staffId: 'marcus', slot: 0},
  {id: 'server-5-dinner', role: 'server', day: 5, time: '5:00 PM – 11:30 PM', short: '5p–11:30p',  hours: 6.5, staffId: 'jordan', slot: 1},
  {id: 'server-6-lunch',  role: 'server', day: 6, time: '11:00 AM – 5:00 PM', short: '11a–5p',     hours: 6.0, staffId: 'jordan', slot: 0},
  {id: 'server-6-dinner', role: 'server', day: 6, time: '5:00 PM – 11:00 PM', short: '5p–11p',     hours: 6.0, staffId: 'tess',   slot: 1},
  // Bartender — night bar 4:00 PM – 12:00 AM (8 h) daily; Sat day bar.
  {id: 'bar-0-night', role: 'bar', day: 0, time: '4:00 PM – 12:00 AM',  short: '4p–12a',      hours: 8.0, staffId: 'dana', slot: 1},
  {id: 'bar-1-night', role: 'bar', day: 1, time: '4:00 PM – 12:00 AM',  short: '4p–12a',      hours: 8.0, staffId: 'cole', slot: 1},
  {id: 'bar-2-night', role: 'bar', day: 2, time: '4:00 PM – 12:00 AM',  short: '4p–12a',      hours: 8.0, staffId: 'dana', slot: 1},
  {id: 'bar-3-night', role: 'bar', day: 3, time: '4:00 PM – 12:00 AM',  short: '4p–12a',      hours: 8.0, staffId: 'cole', slot: 1},
  {id: 'bar-4-night', role: 'bar', day: 4, time: '4:00 PM – 12:00 AM',  short: '4p–12a',      hours: 8.0, staffId: 'dana', slot: 1},
  {id: 'bar-5-day',   role: 'bar', day: 5, time: '11:30 AM – 4:00 PM',  short: '11:30a–4p',   hours: 4.5, staffId: 'dana', slot: 0},
  {id: 'bar-5-night', role: 'bar', day: 5, time: '4:00 PM – 12:00 AM',  short: '4p–12a',      hours: 8.0, staffId: 'cole', slot: 1},
  {id: 'bar-6-night', role: 'bar', day: 6, time: '4:00 PM – 12:00 AM',  short: '4p–12a',      hours: 8.0, staffId: 'dana', slot: 1},
  // Line cook — prep 9:00 AM – 4:00 PM (7 h); line 3:00 PM – 11:00 PM (8 h).
  {id: 'cook-0-prep', role: 'cook', day: 0, time: '9:00 AM – 4:00 PM',  short: '9a–4p',  hours: 7.0, staffId: 'ren',   slot: 0},
  {id: 'cook-0-line', role: 'cook', day: 0, time: '3:00 PM – 11:00 PM', short: '3p–11p', hours: 8.0, staffId: 'sofia', slot: 1},
  {id: 'cook-1-prep', role: 'cook', day: 1, time: '9:00 AM – 4:00 PM',  short: '9a–4p',  hours: 7.0, staffId: 'sofia', slot: 0},
  {id: 'cook-1-line', role: 'cook', day: 1, time: '3:00 PM – 11:00 PM', short: '3p–11p', hours: 8.0, staffId: 'ren',   slot: 1},
  {id: 'cook-2-prep', role: 'cook', day: 2, time: '9:00 AM – 4:00 PM',  short: '9a–4p',  hours: 7.0, staffId: 'ren',   slot: 0},
  {id: 'cook-2-line', role: 'cook', day: 2, time: '3:00 PM – 11:00 PM', short: '3p–11p', hours: 8.0, staffId: 'gabe',  slot: 1},
  {id: 'cook-3-prep', role: 'cook', day: 3, time: '9:00 AM – 4:00 PM',  short: '9a–4p',  hours: 7.0, staffId: 'gabe',  slot: 0},
  {id: 'cook-3-line', role: 'cook', day: 3, time: '3:00 PM – 11:00 PM', short: '3p–11p', hours: 8.0, staffId: 'ren',   slot: 1},
  {id: 'cook-4-prep', role: 'cook', day: 4, time: '9:00 AM – 4:00 PM',  short: '9a–4p',  hours: 7.0, staffId: 'ren',   slot: 0},
  {id: 'cook-4-line', role: 'cook', day: 4, time: '3:00 PM – 11:00 PM', short: '3p–11p', hours: 8.0, staffId: 'gabe',  slot: 1},
  {id: 'cook-5-prep', role: 'cook', day: 5, time: '9:00 AM – 4:00 PM',  short: '9a–4p',  hours: 7.0, staffId: 'sofia', slot: 0},
  {id: 'cook-5-line', role: 'cook', day: 5, time: '3:00 PM – 11:00 PM', short: '3p–11p', hours: 8.0, staffId: 'ren',   slot: 1},
  {id: 'cook-6-prep', role: 'cook', day: 6, time: '9:00 AM – 4:00 PM',  short: '9a–4p',  hours: 7.0, staffId: 'gabe',  slot: 0},
  {id: 'cook-6-line', role: 'cook', day: 6, time: '3:00 PM – 11:00 PM', short: '3p–11p', hours: 8.0, staffId: 'sofia', slot: 1},
  // Dish — 5:00 PM – 11:30 PM (6.5 h); Wed + Sat are the OPEN slots.
  {id: 'dish-0', role: 'dish', day: 0, time: '5:00 PM – 11:30 PM', short: '5p–11:30p', hours: 6.5, staffId: 'alvaro', slot: 0},
  {id: 'dish-1', role: 'dish', day: 1, time: '5:00 PM – 11:30 PM', short: '5p–11:30p', hours: 6.5, staffId: 'alvaro', slot: 0},
  {id: 'dish-2', role: 'dish', day: 2, time: '5:00 PM – 11:30 PM', short: '5p–11:30p', hours: 6.5, staffId: null,     slot: 0},
  {id: 'dish-3', role: 'dish', day: 3, time: '5:00 PM – 11:30 PM', short: '5p–11:30p', hours: 6.5, staffId: 'alvaro', slot: 0},
  {id: 'dish-4', role: 'dish', day: 4, time: '5:00 PM – 11:30 PM', short: '5p–11:30p', hours: 6.5, staffId: 'alvaro', slot: 0},
  {id: 'dish-5', role: 'dish', day: 5, time: '5:00 PM – 11:30 PM', short: '5p–11:30p', hours: 6.5, staffId: null,     slot: 0},
  {id: 'dish-6', role: 'dish', day: 6, time: '5:00 PM – 11:30 PM', short: '5p–11:30p', hours: 6.5, staffId: 'alvaro', slot: 0},
];

/**
 * The pending queue. rq-cole is the deliberate trap: approving it pushes
 * Dana from 36.5 h to 44.5 h, and the card's live preview says so before
 * the manager clicks. rq-tess is the drop path — approval CREATES an open
 * slot. rq-tess's reason is the 2-sentence wrap stress fixture.
 */
const INITIAL_REQUESTS: SwapRequest[] = [
  {
    id: 'rq-priya',
    kind: 'swap',
    shiftId: 'server-4-dinner',
    fromId: 'priya',
    toId: 'marcus',
    submitted: 'Tue 9:14 AM',
    reason:
      'My sister’s graduation dinner is Friday night — Marcus already confirmed he can cover.',
  },
  {
    id: 'rq-ren',
    kind: 'swap',
    shiftId: 'cook-5-line',
    fromId: 'ren',
    toId: 'gabe',
    submitted: 'Wed 7:02 AM',
    reason:
      'GM flagged my week at 45 hours. Shedding Saturday line keeps me under 40 and Gabe wants the hours.',
  },
  {
    id: 'rq-cole',
    kind: 'swap',
    shiftId: 'bar-3-night',
    fromId: 'cole',
    toId: 'dana',
    submitted: 'Wed 3:40 PM',
    reason:
      'My band got booked for a Thursday gig. Dana said she’d take the bar if you approve it.',
  },
  {
    id: 'rq-tess',
    kind: 'drop',
    shiftId: 'server-6-dinner',
    fromId: 'tess',
    submitted: 'Thu 11:26 AM',
    reason:
      'Moving apartments that weekend and the freight elevator is only reserved for Sunday evening. I asked the whole server thread and nobody can take it, so I’m requesting a straight drop.',
  },
];

/** Weekly hour scale for the meters; the 40 h line sits at 40/48 ≈ 83.3%. */
const METER_MAX = 48;
const OT_LINE = 40;

// ---------------------------------------------------------------------------
// PURE HELPERS
// ---------------------------------------------------------------------------

/** "24.5h" / "18h" — one decimal only when the half hour exists. */
function fmtHours(hours: number): string {
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
}

/** Live per-staff totals — THE derivation every surface reads. */
function hoursByStaff(shifts: Shift[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const person of STAFF) {
    totals.set(person.id, 0);
  }
  for (const shift of shifts) {
    if (shift.staffId != null) {
      totals.set(shift.staffId, (totals.get(shift.staffId) ?? 0) + shift.hours);
    }
  }
  return totals;
}

function dayName(day: number): string {
  const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return names[day];
}

function roleLabel(role: RoleId): string {
  return ROLES.find(entry => entry.id === role)?.label ?? role;
}

/** "Fri Server 5:00 PM – 11:30 PM" — the shift named for cards + log. */
function shiftPhrase(shift: Shift): string {
  return `${dayName(shift.day)} ${roleLabel(shift.role)} ${shift.time}`;
}

// ---------------------------------------------------------------------------
// TEMPLATE CSS — every selector scoped under .tpl-restaurant-shift-swap-console
// ---------------------------------------------------------------------------
// Density grid (verbatim from the header): 12px page gutter · 16px section
// gap · 84px role-label column · day columns minmax(84px, 1fr) · 32px day
// header row · role rows min 76px · shift chips min 34px on a 4px stack
// gap · 316px rail · 40px meter rows · request cards 12px padding · 56px
// stat tiles · 40px minimum hit targets · 2px focus ring at 2px offset.

const TEMPLATE_CSS = `
.tpl-restaurant-shift-swap-console {
  --ssc-accent: ${BRAND_ACCENT};
  --ssc-on-accent: ${BRAND_ON};
  --ssc-accent-tint: ${BRAND_TINT};
  --ssc-hot-text: ${HOT_TEXT};
  --ssc-hot-tint: ${HOT_TINT};
  --ssc-warn-text: ${WARN_TEXT};
  --ssc-warn-tint: ${WARN_TINT};
  --ssc-good-text: ${GOOD_TEXT};
  --ssc-good-tint: ${GOOD_TINT};
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
  height: 100%;
  min-height: 0;
}
.tpl-restaurant-shift-swap-console *,
.tpl-restaurant-shift-swap-console *::before,
.tpl-restaurant-shift-swap-console *::after {
  box-sizing: border-box;
}
.tpl-restaurant-shift-swap-console button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.tpl-restaurant-shift-swap-console button:focus-visible {
  outline: 2px solid var(--ssc-accent);
  outline-offset: 2px;
}
.tpl-restaurant-shift-swap-console .ssc-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ---- header ---- */
.tpl-restaurant-shift-swap-console .ssc-head {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  width: 100%;
  min-width: 0;
}
.tpl-restaurant-shift-swap-console .ssc-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.tpl-restaurant-shift-swap-console .ssc-brand-name {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.2;
}
.tpl-restaurant-shift-swap-console .ssc-brand-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.tpl-restaurant-shift-swap-console .ssc-stats {
  display: flex;
  gap: 8px;
  margin-left: auto;
  flex-wrap: wrap;
}
.tpl-restaurant-shift-swap-console .ssc-stat {
  min-height: 56px;
  min-width: 108px;
  padding: 8px 12px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  background: var(--color-background-body);
}
.tpl-restaurant-shift-swap-console .ssc-stat-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.tpl-restaurant-shift-swap-console .ssc-stat-value {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.tpl-restaurant-shift-swap-console .ssc-stat-value.is-accent {
  color: var(--ssc-accent);
}
.tpl-restaurant-shift-swap-console .ssc-stat-value.is-hot {
  color: var(--ssc-hot-text);
}
.tpl-restaurant-shift-swap-console .ssc-stat-value.is-good {
  color: var(--ssc-good-text);
}

/* ---- body split: week grid | 316px rail ---- */
.tpl-restaurant-shift-swap-console .ssc-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 316px;
  gap: 16px;
  padding: 12px;
  height: 100%;
  min-height: 0;
}
.tpl-restaurant-shift-swap-console .ssc-grid-scroll {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  border: var(--border-width) solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background-body);
}
.tpl-restaurant-shift-swap-console .ssc-rail {
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 2px;
}

/* ---- week grid ---- */
.tpl-restaurant-shift-swap-console .ssc-week {
  min-width: 648px;
}
.tpl-restaurant-shift-swap-console .ssc-week-row {
  display: grid;
  grid-template-columns: 84px repeat(7, minmax(84px, 1fr));
  border-bottom: var(--border-width) solid var(--color-border);
}
.tpl-restaurant-shift-swap-console .ssc-week-row:last-child {
  border-bottom: none;
}
.tpl-restaurant-shift-swap-console .ssc-dayhead-row {
  position: sticky;
  top: 0;
  z-index: 3;
  background: var(--color-background-muted);
}
.tpl-restaurant-shift-swap-console .ssc-dayhead {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  border-left: var(--border-width) solid var(--color-border);
}
.tpl-restaurant-shift-swap-console .ssc-dayhead:first-child {
  border-left: none;
  justify-content: flex-start;
  padding-left: 10px;
}
.tpl-restaurant-shift-swap-console .ssc-role-label {
  padding: 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  display: flex;
  align-items: flex-start;
}
.tpl-restaurant-shift-swap-console .ssc-cell {
  min-height: 76px;
  padding: 6px;
  border-left: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* ---- shift chips (real buttons) ---- */
.tpl-restaurant-shift-swap-console .ssc-chip {
  min-height: 34px;
  width: 100%;
  border-radius: 8px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-muted);
  padding: 4px 6px;
  display: flex;
  flex-direction: column;
  gap: 1px;
  transition: border-color 120ms ease, background-color 120ms ease;
}
@media (hover: hover) {
  .tpl-restaurant-shift-swap-console .ssc-chip:hover {
    border-color: var(--ssc-accent);
  }
}
.tpl-restaurant-shift-swap-console .ssc-chip-name {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.15;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}
.tpl-restaurant-shift-swap-console .ssc-chip-time {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-restaurant-shift-swap-console .ssc-chip.is-pending {
  border: 1.5px dashed var(--ssc-accent);
  background: var(--ssc-accent-tint);
}
.tpl-restaurant-shift-swap-console .ssc-chip.is-open {
  border: 1.5px dashed var(--ssc-hot-text);
  background: var(--ssc-hot-tint);
}
.tpl-restaurant-shift-swap-console .ssc-chip.is-open .ssc-chip-name {
  color: var(--ssc-hot-text);
  letter-spacing: 0.04em;
}
.tpl-restaurant-shift-swap-console .ssc-chip.is-focus {
  border: 1.5px solid var(--ssc-accent);
  background: var(--ssc-accent-tint);
}
.tpl-restaurant-shift-swap-console .ssc-chip.is-dim {
  opacity: 0.45;
}
.tpl-restaurant-shift-swap-console .ssc-chip.is-flash {
  animation: ssc-approve-flash 900ms ease-out 1;
}
@keyframes ssc-approve-flash {
  0% { box-shadow: 0 0 0 3px var(--ssc-accent); }
  100% { box-shadow: 0 0 0 0 transparent; }
}
@media (prefers-reduced-motion: reduce) {
  .tpl-restaurant-shift-swap-console .ssc-chip.is-flash {
    animation: none;
    box-shadow: 0 0 0 2px var(--ssc-accent);
  }
  .tpl-restaurant-shift-swap-console .ssc-chip,
  .tpl-restaurant-shift-swap-console .ssc-meter-fill,
  .tpl-restaurant-shift-swap-console .ssc-meter-over {
    transition: none;
  }
}
.tpl-restaurant-shift-swap-console .ssc-chip-swapglyph {
  color: var(--ssc-accent);
  display: inline-flex;
  flex-shrink: 0;
}

/* ---- rail sections ---- */
.tpl-restaurant-shift-swap-console .ssc-section {
  border: var(--border-width) solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background-body);
  display: flex;
  flex-direction: column;
}
.tpl-restaurant-shift-swap-console .ssc-section-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.tpl-restaurant-shift-swap-console .ssc-section-title {
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.tpl-restaurant-shift-swap-console .ssc-section-count {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--ssc-accent);
  background: var(--ssc-accent-tint);
  border-radius: 999px;
  padding: 2px 8px;
}
.tpl-restaurant-shift-swap-console .ssc-section-body {
  display: flex;
  flex-direction: column;
}

/* ---- request cards ---- */
.tpl-restaurant-shift-swap-console .ssc-req {
  padding: 12px;
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tpl-restaurant-shift-swap-console .ssc-req:last-child {
  border-bottom: none;
}
.tpl-restaurant-shift-swap-console .ssc-req.is-linked {
  background: var(--ssc-accent-tint);
}
.tpl-restaurant-shift-swap-console .ssc-req-top {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.tpl-restaurant-shift-swap-console .ssc-req-kind {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-radius: 6px;
  padding: 2px 6px;
  flex-shrink: 0;
}
.tpl-restaurant-shift-swap-console .ssc-req-kind.is-swap {
  color: var(--ssc-accent);
  background: var(--ssc-accent-tint);
}
.tpl-restaurant-shift-swap-console .ssc-req-kind.is-drop {
  color: var(--ssc-hot-text);
  background: var(--ssc-hot-tint);
}
.tpl-restaurant-shift-swap-console .ssc-req-when {
  margin-left: auto;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.tpl-restaurant-shift-swap-console .ssc-req-title {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.tpl-restaurant-shift-swap-console .ssc-req-shift {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.tpl-restaurant-shift-swap-console .ssc-req-reason {
  font-size: 12px;
  line-height: 1.45;
  color: var(--color-text-secondary);
  margin: 0;
}
.tpl-restaurant-shift-swap-console .ssc-req-preview {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  padding: 6px 8px;
  background: var(--color-background-muted);
}
.tpl-restaurant-shift-swap-console .ssc-req-preview-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  min-width: 0;
}
.tpl-restaurant-shift-swap-console .ssc-req-preview-name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.tpl-restaurant-shift-swap-console .ssc-req-preview-delta {
  margin-left: auto;
  white-space: nowrap;
  color: var(--color-text-secondary);
}
.tpl-restaurant-shift-swap-console .ssc-req-preview-delta.is-warn {
  color: var(--ssc-warn-text);
  font-weight: 600;
}
.tpl-restaurant-shift-swap-console .ssc-req-preview-delta.is-good {
  color: var(--ssc-good-text);
  font-weight: 600;
}
.tpl-restaurant-shift-swap-console .ssc-req-warnchip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--ssc-warn-text);
  background: var(--ssc-warn-tint);
  border-radius: 6px;
  padding: 3px 6px;
  width: fit-content;
}
.tpl-restaurant-shift-swap-console .ssc-req-gapchip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--ssc-hot-text);
  background: var(--ssc-hot-tint);
  border-radius: 6px;
  padding: 3px 6px;
  width: fit-content;
}
.tpl-restaurant-shift-swap-console .ssc-req-actions {
  display: flex;
  gap: 8px;
}
.tpl-restaurant-shift-swap-console .ssc-btn {
  min-height: 40px;
  flex: 1;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  border: var(--border-width) solid var(--color-border);
  transition: background-color 120ms ease, border-color 120ms ease;
}
.tpl-restaurant-shift-swap-console .ssc-btn.is-approve {
  background: var(--ssc-accent);
  border-color: transparent;
  color: var(--ssc-on-accent);
}
@media (hover: hover) {
  .tpl-restaurant-shift-swap-console .ssc-btn.is-approve:hover {
    filter: brightness(1.06);
  }
  .tpl-restaurant-shift-swap-console .ssc-btn.is-deny:hover {
    border-color: var(--ssc-hot-text);
    color: var(--ssc-hot-text);
  }
}

/* ---- overtime meters ---- */
.tpl-restaurant-shift-swap-console .ssc-meter-row {
  min-height: 40px;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 96px;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-bottom: var(--border-width) solid var(--color-border);
  transition: background-color 120ms ease;
}
.tpl-restaurant-shift-swap-console .ssc-meter-row:last-child {
  border-bottom: none;
}
@media (hover: hover) {
  .tpl-restaurant-shift-swap-console .ssc-meter-row:hover {
    background: var(--color-background-muted);
  }
}
.tpl-restaurant-shift-swap-console .ssc-meter-row.is-focus {
  background: var(--ssc-accent-tint);
}
.tpl-restaurant-shift-swap-console .ssc-meter-id {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.tpl-restaurant-shift-swap-console .ssc-meter-name {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.15;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-restaurant-shift-swap-console .ssc-meter-track {
  position: relative;
  height: 8px;
  border-radius: 4px;
  background: var(--color-background-muted);
  overflow: hidden;
}
.tpl-restaurant-shift-swap-console .ssc-meter-fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 4px;
  background: var(--ssc-accent);
  opacity: 0.75;
  transition: width 240ms ease;
}
.tpl-restaurant-shift-swap-console .ssc-meter-over {
  position: absolute;
  inset: 0 auto 0 0;
  background: var(--ssc-hot-text);
  transition: width 240ms ease, left 240ms ease;
}
.tpl-restaurant-shift-swap-console .ssc-meter-tick {
  position: absolute;
  top: -2px;
  bottom: -2px;
  width: 2px;
  background: var(--color-text-secondary);
  /* sits OUTSIDE .ssc-meter-track so overflow:hidden cannot clip it */
}
.tpl-restaurant-shift-swap-console .ssc-meter-scale {
  position: relative;
}
.tpl-restaurant-shift-swap-console .ssc-meter-hours {
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
}
.tpl-restaurant-shift-swap-console .ssc-meter-hours .is-ot {
  color: var(--ssc-hot-text);
}
.tpl-restaurant-shift-swap-console .ssc-meter-role {
  font-size: 11px;
  color: var(--color-text-secondary);
  text-align: right;
}

/* ---- decision log ---- */
.tpl-restaurant-shift-swap-console .ssc-log-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 8px 12px;
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 12px;
  line-height: 1.4;
}
.tpl-restaurant-shift-swap-console .ssc-log-row:last-child {
  border-bottom: none;
}
.tpl-restaurant-shift-swap-console .ssc-log-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
}
.tpl-restaurant-shift-swap-console .ssc-log-dot.is-approve {
  background: var(--ssc-good-text);
}
.tpl-restaurant-shift-swap-console .ssc-log-dot.is-deny {
  background: var(--ssc-hot-text);
}
.tpl-restaurant-shift-swap-console .ssc-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px 12px;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 12px;
}
.tpl-restaurant-shift-swap-console .ssc-empty-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ssc-good-text);
}

/* ---- responsive: <= 900px re-stack (subtraction + reorder) ---- */
@media (max-width: 900px) {
  .tpl-restaurant-shift-swap-console .ssc-body {
    grid-template-columns: minmax(0, 1fr);
    overflow-y: auto;
  }
  .tpl-restaurant-shift-swap-console .ssc-grid-scroll {
    order: 2;
    overflow: visible;
    overflow-x: auto;
    min-height: auto;
  }
  .tpl-restaurant-shift-swap-console .ssc-rail {
    display: contents;
  }
  .tpl-restaurant-shift-swap-console .ssc-section.is-queue {
    order: 1;
  }
  .tpl-restaurant-shift-swap-console .ssc-section.is-queue .ssc-section-body {
    flex-direction: row;
    overflow-x: auto;
    gap: 8px;
    padding: 8px;
  }
  .tpl-restaurant-shift-swap-console .ssc-section.is-queue .ssc-req {
    flex: 0 0 300px;
    border: var(--border-width) solid var(--color-border);
    border-radius: 10px;
  }
  .tpl-restaurant-shift-swap-console .ssc-section.is-meters {
    order: 3;
  }
  .tpl-restaurant-shift-swap-console .ssc-section.is-log {
    order: 4;
  }
}

/* ---- responsive: <= 560px (390px embed) ---- */
@media (max-width: 560px) {
  .tpl-restaurant-shift-swap-console .ssc-brand-sub {
    display: none;
  }
  .tpl-restaurant-shift-swap-console .ssc-stats {
    margin-left: 0;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .tpl-restaurant-shift-swap-console .ssc-stat {
    min-width: 0;
  }
  .tpl-restaurant-shift-swap-console .ssc-week-row {
    grid-template-columns: 84px repeat(7, 92px);
  }
  .tpl-restaurant-shift-swap-console .ssc-week {
    min-width: 728px;
  }
  .tpl-restaurant-shift-swap-console .ssc-section.is-queue .ssc-req {
    flex-basis: 272px;
  }
}
`;

// ---------------------------------------------------------------------------
// BRAND MARK — Shiftly: two counter-rotating swap arrows forming a loop.
// ---------------------------------------------------------------------------

function BrandMark() {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 28 28"
      role="img"
      aria-label="Shiftly"
      style={{flexShrink: 0}}>
      <rect width={28} height={28} rx={8} fill="var(--ssc-accent)" />
      {/* Two half-loops with arrowheads — the swap glyph. */}
      <path
        d="M8.5 12.5a6 6 0 0 1 10.2-3.4"
        fill="none"
        stroke="var(--ssc-on-accent)"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <path d="M19.8 5.4l-.4 4.4-4.2-1.5z" fill="var(--ssc-on-accent)" />
      <path
        d="M19.5 15.5a6 6 0 0 1-10.2 3.4"
        fill="none"
        stroke="var(--ssc-on-accent)"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <path d="M8.2 22.6l.4-4.4 4.2 1.5z" fill="var(--ssc-on-accent)" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// SHIFT CHIP — one shift in one grid cell; a real <button>.
// ---------------------------------------------------------------------------

interface ShiftChipProps {
  shift: Shift;
  person: StaffMember | null;
  hasPending: boolean;
  isFocus: boolean;
  isDim: boolean;
  isFlash: boolean;
  onActivate: (shift: Shift) => void;
}

function ShiftChip({
  shift,
  person,
  hasPending,
  isFocus,
  isDim,
  isFlash,
  onActivate,
}: ShiftChipProps) {
  const classes = [
    'ssc-chip',
    person == null ? 'is-open' : '',
    hasPending ? 'is-pending' : '',
    isFocus ? 'is-focus' : '',
    isDim ? 'is-dim' : '',
    isFlash ? 'is-flash' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const label =
    person == null
      ? `Open ${roleLabel(shift.role)} shift, ${dayName(shift.day)} ${shift.time}, ${fmtHours(shift.hours)} uncovered`
      : `${person.name}, ${dayName(shift.day)} ${shift.time}, ${fmtHours(shift.hours)}${
          hasPending ? ' — swap requested' : ''
        }${isFocus ? ' — highlighted' : ''}`;
  return (
    <button
      type="button"
      className={classes}
      aria-label={label}
      aria-pressed={person != null ? isFocus : undefined}
      onClick={() => onActivate(shift)}>
      <span className="ssc-chip-name">
        {hasPending && (
          <span className="ssc-chip-swapglyph" aria-hidden>
            <Icon icon={ArrowLeftRightIcon} size="xsm" color="inherit" />
          </span>
        )}
        {person == null ? 'OPEN' : person.short}
      </span>
      <span className="ssc-chip-time">
        {shift.short} · {fmtHours(shift.hours)}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// OVERTIME METER ROW — fixed 0–48 h scale, 40 h tick at 83.3%.
// ---------------------------------------------------------------------------

interface MeterRowProps {
  person: StaffMember;
  hours: number;
  isFocus: boolean;
  onToggle: (staffId: string) => void;
}

function MeterRow({person, hours, isFocus, onToggle}: MeterRowProps) {
  const basePct = (Math.min(hours, OT_LINE) / METER_MAX) * 100;
  const overPct = hours > OT_LINE ? ((hours - OT_LINE) / METER_MAX) * 100 : 0;
  const tickPct = (OT_LINE / METER_MAX) * 100;
  const overHours = hours > OT_LINE ? hours - OT_LINE : 0;
  return (
    <button
      type="button"
      className={`ssc-meter-row${isFocus ? ' is-focus' : ''}`}
      aria-pressed={isFocus}
      aria-label={`${person.name}, ${roleLabel(person.role)}, ${fmtHours(hours)} scheduled${
        overHours > 0 ? `, ${fmtHours(overHours)} over 40` : ''
      } — highlight their week`}
      onClick={() => onToggle(person.id)}>
      <span className="ssc-meter-id">
        <span className="ssc-meter-name">{person.name}</span>
        <span className="ssc-meter-scale">
          <span className="ssc-meter-track" aria-hidden>
            <span className="ssc-meter-fill" style={{width: `${basePct}%`}} />
            {overPct > 0 && (
              <span
                className="ssc-meter-over"
                style={{left: `${tickPct}%`, width: `${overPct}%`}}
              />
            )}
          </span>
          <span
            className="ssc-meter-tick"
            style={{left: `${tickPct}%`}}
            aria-hidden
          />
        </span>
      </span>
      <span>
        <span className="ssc-meter-hours">
          {fmtHours(hours)}
          {overHours > 0 && <span className="is-ot"> +{fmtHours(overHours)} OT</span>}
        </span>
        <span className="ssc-meter-role" style={{display: 'block'}}>
          {roleLabel(person.role)}
        </span>
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// REQUEST CARD — live before → after hours preview for both parties.
// ---------------------------------------------------------------------------

interface RequestCardProps {
  request: SwapRequest;
  shift: Shift;
  totals: Map<string, number>;
  isLinked: boolean;
  onResolve: (requestId: string, verdict: 'approve' | 'deny') => void;
}

function RequestCard({request, shift, totals, isLinked, onResolve}: RequestCardProps) {
  const from = STAFF_BY_ID.get(request.fromId);
  const to = request.toId != null ? STAFF_BY_ID.get(request.toId) : null;
  if (from == null) {
    return null;
  }
  const fromNow = totals.get(from.id) ?? 0;
  const fromAfter = fromNow - shift.hours;
  const toNow = to != null ? (totals.get(to.id) ?? 0) : 0;
  const toAfter = toNow + shift.hours;
  const pushesOver = to != null && toAfter > OT_LINE && toNow <= OT_LINE;
  const stillOver = to != null && toNow > OT_LINE;
  const clearsOver = fromNow > OT_LINE && fromAfter <= OT_LINE;
  return (
    <article
      className={`ssc-req${isLinked ? ' is-linked' : ''}`}
      aria-label={`${request.kind === 'swap' ? 'Swap' : 'Drop'} request from ${from.name}`}>
      <div className="ssc-req-top">
        <span className={`ssc-req-kind ${request.kind === 'swap' ? 'is-swap' : 'is-drop'}`}>
          {request.kind === 'swap' ? 'Swap' : 'Drop'}
        </span>
        <span className="ssc-req-when">Submitted {request.submitted}</span>
      </div>
      <div className="ssc-req-title">
        {from.name}
        {to != null && (
          <>
            <Icon icon={ArrowRightIcon} size="xsm" color="secondary" />
            {to.name}
          </>
        )}
        {to == null && (
          <>
            <Icon icon={UserRoundMinusIcon} size="xsm" color="secondary" />
            no taker
          </>
        )}
      </div>
      <div className="ssc-req-shift">{shiftPhrase(shift)} · {fmtHours(shift.hours)}</div>
      <p className="ssc-req-reason">“{request.reason}”</p>
      <div className="ssc-req-preview">
        <div className="ssc-req-preview-row">
          <span className="ssc-req-preview-name">{from.short}</span>
          <span
            className={`ssc-req-preview-delta${clearsOver ? ' is-good' : ''}`}>
            {fmtHours(fromNow)} → {fmtHours(fromAfter)}
            {clearsOver ? ' · clears OT' : ''}
          </span>
        </div>
        {to != null && (
          <div className="ssc-req-preview-row">
            <span className="ssc-req-preview-name">{to.short}</span>
            <span
              className={`ssc-req-preview-delta${
                pushesOver || stillOver ? ' is-warn' : ''
              }`}>
              {fmtHours(toNow)} → {fmtHours(toAfter)}
            </span>
          </div>
        )}
      </div>
      {pushesOver && to != null && (
        <span className="ssc-req-warnchip">
          <Icon icon={FlameIcon} size="xsm" color="inherit" />
          Pushes {to.short} to {fmtHours(toAfter)} (+{fmtHours(toAfter - OT_LINE)} OT)
        </span>
      )}
      {request.kind === 'drop' && (
        <span className="ssc-req-gapchip">
          <Icon icon={UserRoundMinusIcon} size="xsm" color="inherit" />
          Approval leaves {dayName(shift.day)} {roleLabel(shift.role).toLowerCase()} uncovered
        </span>
      )}
      <div className="ssc-req-actions">
        <button
          type="button"
          className="ssc-btn is-approve"
          onClick={() => onResolve(request.id, 'approve')}>
          <Icon icon={CheckIcon} size="sm" color="inherit" />
          Approve
        </button>
        <button
          type="button"
          className="ssc-btn is-deny"
          onClick={() => onResolve(request.id, 'deny')}>
          <Icon icon={XIcon} size="sm" color="inherit" />
          Deny
        </button>
      </div>
    </article>
  );
}



// ---------------------------------------------------------------------------
// PAGE — one state owner; every mutation flows through resolveRequest.
// ---------------------------------------------------------------------------

export default function RestaurantShiftSwapConsoleTemplate() {
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [requests, setRequests] = useState<SwapRequest[]>(INITIAL_REQUESTS);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [focusStaffId, setFocusStaffId] = useState<string | null>(null);
  const [linkedRequestId, setLinkedRequestId] = useState<string | null>(null);
  const [flashShiftId, setFlashShiftId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const shiftById = useMemo(
    () => new Map(shifts.map(shift => [shift.id, shift])),
    [shifts],
  );
  const totals = useMemo(() => hoursByStaff(shifts), [shifts]);
  const pendingByShiftId = useMemo(
    () => new Map(requests.map(request => [request.shiftId, request])),
    [requests],
  );

  // ---- derived header stats (every tile is a derivation, not a caption) ----
  const openShifts = useMemo(
    () => shifts.filter(shift => shift.staffId == null),
    [shifts],
  );
  const overStaff = useMemo(
    () => STAFF.filter(person => (totals.get(person.id) ?? 0) > OT_LINE),
    [totals],
  );
  const scheduledHours = useMemo(
    () =>
      shifts.reduce(
        (sum, shift) => (shift.staffId != null ? sum + shift.hours : sum),
        0,
      ),
    [shifts],
  );

  /** Meters sorted heaviest-first so the OT problem is always on top. */
  const meterOrder = useMemo(
    () =>
      [...STAFF].sort(
        (a, b) =>
          (totals.get(b.id) ?? 0) - (totals.get(a.id) ?? 0) ||
          a.name.localeCompare(b.name),
      ),
    [totals],
  );

  /** Cell index: `${role}:${day}` → shifts sorted by slot. */
  const cellIndex = useMemo(() => {
    const map = new Map<string, Shift[]>();
    for (const shift of shifts) {
      const key = `${shift.role}:${shift.day}`;
      const list = map.get(key);
      if (list) {
        list.push(shift);
      } else {
        map.set(key, [shift]);
      }
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.slot - b.slot);
    }
    return map;
  }, [shifts]);

  // ---- THE mutation: approve / deny a request ----
  const resolveRequest = (requestId: string, verdict: 'approve' | 'deny') => {
    const request = requests.find(entry => entry.id === requestId);
    if (request == null) {
      return;
    }
    const shift = shiftById.get(request.shiftId);
    if (shift == null) {
      return;
    }
    const from = STAFF_BY_ID.get(request.fromId);
    const to = request.toId != null ? STAFF_BY_ID.get(request.toId) : null;
    setRequests(prev => prev.filter(entry => entry.id !== requestId));
    setLinkedRequestId(prev => (prev === requestId ? null : prev));
    if (verdict === 'deny') {
      const text = `Denied · ${from?.name ?? request.fromId} keeps ${shiftPhrase(shift)}`;
      setLog(prev => [
        {id: `log-${requestId}-deny`, text, tone: 'deny'},
        ...prev,
      ]);
      setAnnouncement(
        `Denied ${from?.name ?? 'the'} request — ${shiftPhrase(shift)} is unchanged.`,
      );
      return;
    }
    // Approve: reassign (swap) or vacate (drop) the shift in the one store.
    const nextOwner = request.kind === 'swap' ? (request.toId ?? null) : null;
    setShifts(prev =>
      prev.map(entry =>
        entry.id === shift.id ? {...entry, staffId: nextOwner} : entry,
      ),
    );
    setFlashShiftId(shift.id);
    if (request.kind === 'swap' && to != null) {
      const text = `Approved · ${from?.short ?? request.fromId} → ${to.short} · ${shiftPhrase(shift)}`;
      setLog(prev => [
        {id: `log-${requestId}-ok`, text, tone: 'approve'},
        ...prev,
      ]);
      setAnnouncement(
        `Approved — ${to.name} now works ${shiftPhrase(shift)}. Overtime meters updated.`,
      );
    } else {
      const text = `Approved drop · ${shiftPhrase(shift)} is now OPEN`;
      setLog(prev => [
        {id: `log-${requestId}-ok`, text, tone: 'approve'},
        ...prev,
      ]);
      setAnnouncement(
        `Approved drop — ${shiftPhrase(shift)} is now an open shift.`,
      );
    }
  };

  // ---- highlight plumbing (chips + meters share one focusStaffId) ----
  const toggleStaffFocus = (staffId: string) => {
    setFocusStaffId(prev => {
      const next = prev === staffId ? null : staffId;
      const person = STAFF_BY_ID.get(staffId);
      setAnnouncement(
        next == null
          ? 'Cleared the week highlight.'
          : `Highlighting ${person?.name ?? staffId}'s week — ${fmtHours(totals.get(staffId) ?? 0)} scheduled.`,
      );
      return next;
    });
  };

  const activateChip = (shift: Shift) => {
    const pending = pendingByShiftId.get(shift.id);
    if (pending != null) {
      setLinkedRequestId(prev => (prev === pending.id ? null : pending.id));
    }
    if (shift.staffId != null) {
      toggleStaffFocus(shift.staffId);
    } else {
      setAnnouncement(
        `${shiftPhrase(shift)} is uncovered — ${fmtHours(shift.hours)} with no assignee.`,
      );
    }
  };

  const handleRootKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && (focusStaffId != null || linkedRequestId != null)) {
      event.stopPropagation();
      setFocusStaffId(null);
      setLinkedRequestId(null);
      setAnnouncement('Cleared highlights.');
    }
  };

  // ---- render ----
  return (
    <div className="tpl-restaurant-shift-swap-console" onKeyDown={handleRootKeyDown}>
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <div className="ssc-head">
              <div className="ssc-brand">
                <BrandMark />
                <div>
                  <h1 className="ssc-brand-name">Shiftly · Juniper &amp; Vine</h1>
                  <div className="ssc-brand-sub">
                    Swap console · {WEEK_LABEL} · {STAFF.length} on roster
                  </div>
                </div>
              </div>
              <div className="ssc-stats">
                <div className="ssc-stat">
                  <span className="ssc-stat-label">Pending requests</span>
                  <span className="ssc-stat-value is-accent">{requests.length}</span>
                </div>
                <div className="ssc-stat">
                  <span className="ssc-stat-label">Open shifts</span>
                  <span
                    className={`ssc-stat-value${openShifts.length > 0 ? ' is-hot' : ' is-good'}`}>
                    {openShifts.length}
                  </span>
                </div>
                <div className="ssc-stat">
                  <span className="ssc-stat-label">Over 40 h</span>
                  <span
                    className={`ssc-stat-value${overStaff.length > 0 ? ' is-hot' : ' is-good'}`}>
                    {overStaff.length}
                  </span>
                </div>
                <div className="ssc-stat">
                  <span className="ssc-stat-label">Scheduled</span>
                  <span className="ssc-stat-value">{fmtHours(scheduledHours)}</span>
                </div>
              </div>
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0} role="main" label="Shift swap console">
            <div aria-live="polite" className="ssc-vh">
              {announcement}
            </div>
            <div className="ssc-body">
              {/* ---- week grid ---- */}
              <div
                className="ssc-grid-scroll"
                role="region"
                aria-label={`Week schedule grid, ${WEEK_LABEL}`}>
                <div className="ssc-week">
                  <div className="ssc-week-row ssc-dayhead-row" aria-hidden>
                    <div className="ssc-dayhead">Role</div>
                    {DAYS.map(day => (
                      <div key={day.short} className="ssc-dayhead">
                        {day.short} <span>{day.date}</span>
                      </div>
                    ))}
                  </div>
                  {ROLES.map(role => (
                    <div key={role.id} className="ssc-week-row">
                      <div className="ssc-role-label">{role.label}</div>
                      {DAYS.map((day, dayIdx) => {
                        const cellShifts =
                          cellIndex.get(`${role.id}:${dayIdx}`) ?? [];
                        return (
                          <div key={day.short} className="ssc-cell">
                            {cellShifts.map(shift => {
                              const person =
                                shift.staffId != null
                                  ? (STAFF_BY_ID.get(shift.staffId) ?? null)
                                  : null;
                              return (
                                <ShiftChip
                                  key={shift.id}
                                  shift={shift}
                                  person={person}
                                  hasPending={pendingByShiftId.has(shift.id)}
                                  isFocus={
                                    focusStaffId != null &&
                                    shift.staffId === focusStaffId
                                  }
                                  isDim={
                                    focusStaffId != null &&
                                    shift.staffId !== focusStaffId &&
                                    shift.staffId != null
                                  }
                                  isFlash={flashShiftId === shift.id}
                                  onActivate={activateChip}
                                />
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* ---- rail: queue · meters · log ---- */}
              <div className="ssc-rail">
                <section
                  className="ssc-section is-queue"
                  aria-label="Pending swap and drop requests">
                  <div className="ssc-section-head">
                    <Icon icon={ArrowLeftRightIcon} size="sm" color="secondary" />
                    <h2 className="ssc-section-title">Requests</h2>
                    <span className="ssc-section-count">{requests.length}</span>
                  </div>
                  <div className="ssc-section-body">
                    {requests.length === 0 ? (
                      <div className="ssc-empty">
                        <Icon icon={InboxIcon} size="md" color="secondary" />
                        <span className="ssc-empty-title">Queue clear</span>
                        <span>
                          Every request is decided. New asks from the crew land
                          here.
                        </span>
                      </div>
                    ) : (
                      requests.map(request => {
                        const shift = shiftById.get(request.shiftId);
                        if (shift == null) {
                          return null;
                        }
                        return (
                          <RequestCard
                            key={request.id}
                            request={request}
                            shift={shift}
                            totals={totals}
                            isLinked={linkedRequestId === request.id}
                            onResolve={resolveRequest}
                          />
                        );
                      })
                    )}
                  </div>
                </section>

                <section
                  className="ssc-section is-meters"
                  aria-label="Projected weekly hours per staff member">
                  <div className="ssc-section-head">
                    <Icon icon={FlameIcon} size="sm" color="secondary" />
                    <h2 className="ssc-section-title">Weekly hours · 40 h line</h2>
                    <span className="ssc-section-count">
                      {overStaff.length} over
                    </span>
                  </div>
                  <div className="ssc-section-body">
                    {meterOrder.map(person => (
                      <MeterRow
                        key={person.id}
                        person={person}
                        hours={totals.get(person.id) ?? 0}
                        isFocus={focusStaffId === person.id}
                        onToggle={toggleStaffFocus}
                      />
                    ))}
                  </div>
                </section>

                <section className="ssc-section is-log" aria-label="Decision log">
                  <div className="ssc-section-head">
                    <Icon icon={ClipboardListIcon} size="sm" color="secondary" />
                    <h2 className="ssc-section-title">Decision log</h2>
                    <span className="ssc-section-count">{log.length}</span>
                  </div>
                  <div className="ssc-section-body">
                    {log.length === 0 ? (
                      <div className="ssc-empty">
                        <span>
                          Approvals and denials land here as an audit trail.
                        </span>
                      </div>
                    ) : (
                      log.map(entry => (
                        <div key={entry.id} className="ssc-log-row">
                          <span
                            className={`ssc-log-dot is-${entry.tone}`}
                            aria-hidden
                          />
                          <span>{entry.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
