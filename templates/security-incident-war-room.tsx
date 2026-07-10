// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Sitrep incident INC-2417 ("Credential
 *   stuffing → lateral movement via svc-backup"), detected Jul 9 2026 14:05
 *   UTC; the war-room clock is the FIXED string T+4:12 (252 min on a 0–270
 *   min axis → now-line at 93.3%). 15 tasks across three workstream lanes
 *   (containment 6 + forensics 5 + comms 4); 5 done at load (2 + 2 + 1) →
 *   33% overall, each with a fixed T+ completion stamp. 8 blast-radius
 *   assets, 3 critical (svc-backup · DC-CORE-02 · VPN-EDGE-1); exactly 1 of
 *   3 criticals contained at load, so the derived posture opens at SEV-1.
 *   10 seeded timeline events at fixed minute offsets (0, 8, 14, 22, 38,
 *   48, 65, 96, 130, 205). Session completions stamp the fixed now (T+4:12)
 *   — the demo's internal clock never moves. No clock reads, no randomness,
 *   no timers, no network assets.
 * @output Sitrep — Security Incident War Room: a live incident-command
 *   surface. Header (pulse brand mark, INC id + title, derived posture
 *   chip, fixed T+4:12 clock, commander block) over a derived POSTURE BAND
 *   (severity block, auto-composed executive summary sentence, lane
 *   scoreboard, "Log exec update" action that posts the summary to the
 *   timeline); a horizontal INCIDENT TIMELINE SPINE (phase spans →
 *   Detection / Escalation / Active containment as background bands, four
 *   lane-coded pip rows, 30-min T+ ticks, dashed now-line at 93.3%); three
 *   parallel WORKSTREAM LANE columns (Containment / Forensics / Comms) —
 *   56px lane headers with derived phase chip and progress bar over
 *   task cards in done / ACTIVE / blocked / pending states, where only the
 *   active card carries a Mark-complete button and blocked cards name
 *   their dependency; and a 304px BLAST-RADIUS end panel (derived
 *   containment tally, 64px asset rows with custom type glyphs,
 *   criticality tags, and per-asset state pills). Signature move:
 *   completing a containment task flips its card, appends a pip to the
 *   spine at the now-line, advances the lane's phase chip and bar,
 *   un-blocks any dependent task in OTHER lanes, flips its linked assets
 *   to contained in the blast-radius panel — and when the third critical
 *   asset is contained the posture chip drops SEV-1 → SEV-2 and the
 *   executive summary recomposes itself, announced politely. A screenshot
 *   cannot show that cascade.
 * @position Page template; emitted by `astryx template security-incident-war-room`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header 56 | content = scrolling main column (posture band 92 →
 *   timeline spine 128 → three-column lane grid) | end LayoutPanel 304
 *   (blast radius: tally header, asset list, bridge footer). Below 760px
 *   (embed iframe / full-screen only — the inline demo stage never fires
 *   viewport queries) the end panel is dropped and blast radius renders
 *   inline after the lanes, and the lane grid stacks to one column.
 * Container policy: command-surface archetype — bands, one spine strip,
 *   lane columns of task rows, and one asset panel. No repeated Cards; the
 *   posture band is the single hero block and earns it by being 100%
 *   derived state.
 * Color policy: token-pure chrome. ONE quarantined brand accent — Sitrep
 *   alert red BRAND = light-dark(#B42318, #F97066): #B42318 on #FFFFFF ≈
 *   6.6:1, #F97066 on #1B1B1F ≈ 6.2:1 (the containment lane and SEV-1
 *   posture deliberately share it — alert red IS the brand). Lane label
 *   hexes with math: forensics violet light-dark(#6D28D9, #C4B5FD) ≈
 *   7.1:1 / 9.3:1; comms blue light-dark(#0B6BCB, #7CC0FF) ≈ 5.3:1 /
 *   8.9:1. State pairs: OK light-dark(#067647, #75E0A7) ≈ 5.7:1 / 10.6:1;
 *   WARN light-dark(#B54708, #FDB022) ≈ 5.4:1 / 9.3:1. The bare
 *   --color-text token does not exist and is never referenced — text uses
 *   --color-text-primary/secondary only.
 * Density grid (repeated verbatim in the CSS): header 56 · posture band 92
 *   min · spine strip 128 (18 phase band + 62 pip field [4 rows × 14 +
 *   margins] + 20 axis labels + padding) · lane header 56 · task cards 72
 *   min (done cards 56) · asset rows 64 · end panel 304 · buttons ≥30
 *   visual with ::after hit extension to ≥42 · 12px panel gutter · 20px
 *   page gutter. tabular-nums on every T+ stamp, count, and percent.
 * Fixture policy: ONE state owner (the page) — a done-task set plus a
 *   session-event list. Task status is DERIVED per lane: done ∈ set;
 *   blocked = any unmet dependency; the first task neither done nor
 *   blocked is ACTIVE; the rest are pending. Asset containment, posture,
 *   phase chips, the exec summary, lane scoreboard, and spine pips all
 *   derive from the same set in the same render. Stress fixtures live in
 *   the data: a 72-char task title wraps two lines in a 225px lane; comms
 *   m4 stays conditional ("only if customer impact confirmed") so its
 *   pending state has real copy; PAY-DB-PROD is a monitoring-only asset no
 *   task touches, so the tally never reads 8/8 by containment alone.
 *
 * Responsive contract:
 * - ~1045px demo stage (DEFAULT, no media query): 304px panel + ~741px
 *   main; the lane grid is repeat(3, minmax(0, 1fr)) → ≈225px columns;
 *   task titles wrap, never clip; the spine is fluid percent-positioned so
 *   it renders correctly at any width ≥ 600px without a breakpoint.
 * - <= 760px (embed/full-screen only): end panel dropped via
 *   useMediaQuery, blast radius renders inline after the lanes; lane grid
 *   stacks to one column; posture band wraps (flex-wrap); spine axis
 *   labels thin to hourly only (the 30-min minors drop).
 * - <= 470px (390px embed): header drops the commander block and brand
 *   wordmark (the commander remains named in the bridge footer and the
 *   posture band stays complete); asset rows drop the type column (kept in
 *   aria-labels).
 */

import {useMemo, useState} from 'react';
import {
  ActivityIcon,
  CheckIcon,
  DatabaseIcon,
  FingerprintIcon,
  GlobeLockIcon,
  KeyRoundIcon,
  LaptopIcon,
  LockIcon,
  MegaphoneIcon,
  ServerIcon,
  ShieldCheckIcon,
  SendIcon,
  UserRoundCogIcon,
  type LucideIcon,
} from 'lucide-react';
import {Layout, LayoutContent, LayoutHeader, LayoutPanel} from '@astryxdesign/core/Layout';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// SCOPE + QUARANTINED COLOR LITERALS
// ---------------------------------------------------------------------------

const SCOPE = 'tpl-security-incident-war-room';

// The ONE brand accent — Sitrep alert red. #B42318 on #FFFFFF: L≈0.110 →
// 1.05/0.160 ≈ 6.6:1. #F97066 on #1B1B1F: L≈0.327 vs 0.011 → ≈ 6.2:1.
// The containment lane and SEV-1 posture share it on purpose: alert red
// IS the brand.
const BRAND = 'light-dark(#B42318, #F97066)';
const BRAND_TINT = 'light-dark(rgba(180, 35, 24, 0.08), rgba(249, 112, 102, 0.14))';

// Forensics lane. #6D28D9 on #FFF: L≈0.098 → ≈ 7.1:1; #C4B5FD on #1B1B1F ≈ 9.3:1.
const FORENSICS = 'light-dark(#6D28D9, #C4B5FD)';
const FORENSICS_TINT = 'light-dark(rgba(109, 40, 217, 0.09), rgba(196, 181, 253, 0.15))';

// Comms lane. #0B6BCB on #FFF: L≈0.149 → ≈ 5.3:1; #7CC0FF on #1B1B1F ≈ 8.9:1.
const COMMS = 'light-dark(#0B6BCB, #7CC0FF)';
const COMMS_TINT = 'light-dark(rgba(11, 107, 203, 0.09), rgba(124, 192, 255, 0.15))';

// Contained / done. #067647 on #FFF ≈ 5.7:1; #75E0A7 on #1B1B1F ≈ 10.6:1.
const OK = 'light-dark(#067647, #75E0A7)';
const OK_TINT = 'light-dark(rgba(6, 118, 71, 0.10), rgba(117, 224, 167, 0.14))';

// Blocked / monitoring caution. #B54708 on #FFF ≈ 5.4:1; #FDB022 on #1B1B1F ≈ 9.3:1.
const WARN = 'light-dark(#B54708, #FDB022)';
const WARN_TINT = 'light-dark(rgba(181, 71, 8, 0.10), rgba(253, 176, 34, 0.14))';

// ---------------------------------------------------------------------------
// TEMPLATE CSS — every selector prefixed with the scope class. Density grid
// (verbatim from the header): header 56 · posture band 92 min · spine strip
// 128 · lane header 56 · task cards 72 min (done 56) · asset rows 64 · end
// panel 304 · buttons ≥30 visual with ::after hit extension to ≥42.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = `
.${SCOPE} {
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
  height: 100dvh;
  width: 100%;
}
.${SCOPE} * { box-sizing: border-box; }
.${SCOPE} button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: start;
}
.${SCOPE} button:focus-visible {
  outline: 2px solid ${BRAND};
  outline-offset: 2px;
  border-radius: 4px;
}
.${SCOPE} .num { font-variant-numeric: tabular-nums; }
.${SCOPE} .visuallyHidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ---- header (56) --------------------------------------------------------- */
.${SCOPE} .topbar {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  height: 56px;
  padding: 0 20px;
}
.${SCOPE} .brandMark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: ${BRAND_TINT};
  color: ${BRAND};
  flex-shrink: 0;
}
.${SCOPE} .brandName {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  white-space: nowrap;
}
.${SCOPE} .headerDivider {
  width: var(--border-width);
  align-self: stretch;
  margin: 14px 2px;
  background: var(--color-border);
  flex-shrink: 0;
}
.${SCOPE} .incBlock { min-width: 0; }
.${SCOPE} .incTitle {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .incTitle .incId {
  font-family: var(--font-family-code, monospace);
  font-variant-numeric: tabular-nums;
  color: ${BRAND};
}
.${SCOPE} .incSub {
  margin: 0;
  font-size: 11.5px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
}
.${SCOPE} .headerSpacer { flex: 1; }
.${SCOPE} .clockChip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 10px;
  border-radius: 7px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  font-family: var(--font-family-code, monospace);
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  flex-shrink: 0;
}
.${SCOPE} .commander {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
}
.${SCOPE} .commanderAvatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${BRAND};
  /* Solid brand fill: #FFF on #B42318 ≈ 6.6:1; dark flips the fill to
     #F97066 so the ink flips dark — #2A100E on #F97066 ≈ 7.5:1. */
  color: light-dark(#FFFFFF, #2A100E);
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}
.${SCOPE} .commanderName { font-size: 12.5px; font-weight: 600; white-space: nowrap; }
.${SCOPE} .commanderRole { font-size: 11px; color: var(--color-text-secondary); white-space: nowrap; }

/* ---- posture chip (shared header + band) ----------------------------------- */
.${SCOPE} .postureChip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
  flex-shrink: 0;
  border: var(--border-width) solid transparent;
  transition: color 160ms ease, border-color 160ms ease, background 160ms ease;
}
.${SCOPE} .postureChip.sev1 { border-color: ${BRAND}; color: ${BRAND}; background: ${BRAND_TINT}; }
.${SCOPE} .postureChip.sev2 { border-color: ${WARN}; color: ${WARN}; background: ${WARN_TINT}; }
.${SCOPE} .postureChip.stable { border-color: ${OK}; color: ${OK}; background: ${OK_TINT}; }

/* ---- content shell --------------------------------------------------------- */
.${SCOPE} .mainScroll {
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 20px 28px;
}
.${SCOPE} .mainInner {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1000px;
}

/* ---- posture band (92 min) -------------------------------------------------- */
.${SCOPE} .postureBand {
  display: flex;
  align-items: stretch;
  gap: 14px;
  min-height: 92px;
  padding: 12px 14px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 10px);
  background: var(--color-background-surface);
  flex-wrap: wrap;
}
.${SCOPE} .postureBlock {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding-right: 14px;
  border-right: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}
.${SCOPE} .postureLabel {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.${SCOPE} .execBlock {
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}
.${SCOPE} .execSummary {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.45;
  font-variant-numeric: tabular-nums;
}
.${SCOPE} .execMeta {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.${SCOPE} .scoreBlock {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  flex-shrink: 0;
  padding-left: 14px;
  border-left: var(--border-width) solid var(--color-border);
}
.${SCOPE} .scoreRow {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${SCOPE} .scoreDot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.${SCOPE} .scoreCount { font-weight: 700; color: var(--color-text-primary); }
.${SCOPE} .logUpdateBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  align-self: center;
  height: 34px;
  padding: 0 14px;
  border-radius: 8px;
  border: var(--border-width) solid ${BRAND};
  color: ${BRAND};
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  position: relative;
  flex-shrink: 0;
  transition: background 120ms ease;
}
.${SCOPE} .logUpdateBtn::after { content: ''; position: absolute; inset: -5px 0; }
@media (hover: hover) {
  .${SCOPE} .logUpdateBtn:hover { background: ${BRAND_TINT}; }
}

/* ---- timeline spine (128) ----------------------------------------------------
   Percent-positioned on a 0–270 min domain so it is fluid at any width;
   now-line fixed at 252/270 = 93.3%. */
.${SCOPE} .spine {
  position: relative;
  height: 128px;
  padding: 8px 12px 6px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 10px);
  background: var(--color-background-surface);
  overflow: hidden;
}
.${SCOPE} .spineTrack { position: relative; height: 100%; }
.${SCOPE} .phaseBand {
  position: absolute;
  top: 0;
  height: 18px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  background: var(--color-background-muted);
  white-space: nowrap;
  overflow: hidden;
}
.${SCOPE} .phaseBand.hot { background: ${BRAND_TINT}; color: ${BRAND}; }
.${SCOPE} .pipField { position: absolute; top: 26px; left: 0; right: 0; height: 62px; }
.${SCOPE} .pipRowLine {
  position: absolute;
  left: 0;
  right: 0;
  height: var(--border-width);
  background: var(--color-border);
  opacity: 0.6;
}
.${SCOPE} .pipRowTag {
  position: absolute;
  left: 0;
  transform: translateY(-50%);
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  background: var(--color-background-surface);
  padding-right: 5px;
  line-height: 1;
}
.${SCOPE} .pip {
  position: absolute;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 2px var(--color-background-surface);
}
.${SCOPE} .pip.isSession {
  width: 11px;
  height: 11px;
  outline: 2px solid ${OK};
  outline-offset: 1px;
}
.${SCOPE} .axis { position: absolute; left: 0; right: 0; bottom: 18px; height: var(--border-width); background: var(--color-border); }
.${SCOPE} .axisTick {
  position: absolute;
  bottom: 14px;
  width: var(--border-width);
  height: 5px;
  background: var(--color-border);
  transform: translateX(-50%);
}
.${SCOPE} .axisLabel {
  position: absolute;
  bottom: 0;
  transform: translateX(-50%);
  font-size: 9.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${SCOPE} .axisLabel.minor { display: block; }
.${SCOPE} .nowLine {
  position: absolute;
  top: 22px;
  bottom: 16px;
  width: 0;
  border-left: 2px dashed ${BRAND};
  transform: translateX(-1px);
}
.${SCOPE} .nowTag {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  font-size: 9.5px;
  font-weight: 700;
  color: ${BRAND};
  font-variant-numeric: tabular-nums;
  background: var(--color-background-surface);
  padding: 0 4px;
  white-space: nowrap;
}

/* ---- workstream lanes --------------------------------------------------------- */
.${SCOPE} .laneGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  align-items: start;
}
.${SCOPE} .lane {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 10px);
  background: var(--color-background-surface);
  overflow: hidden;
}
.${SCOPE} .laneHead {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  min-height: 56px;
  padding: 8px 12px;
  border-bottom: var(--border-width) solid var(--color-border);
  background: var(--color-background-muted);
}
.${SCOPE} .laneTitleRow { display: flex; align-items: center; gap: 8px; min-width: 0; }
.${SCOPE} .laneGlyph { display: inline-flex; flex-shrink: 0; }
.${SCOPE} .laneName { font-size: 12.5px; font-weight: 700; white-space: nowrap; }
.${SCOPE} .laneCount {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${SCOPE} .lanePhaseRow { display: flex; align-items: center; gap: 8px; }
.${SCOPE} .phaseChip {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
  transition: color 160ms ease, background 160ms ease;
}
.${SCOPE} .laneBar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--color-border);
  overflow: hidden;
  min-width: 40px;
}
.${SCOPE} .laneBarFill { height: 100%; border-radius: 2px; transition: width 180ms ease; }

/* Task cards — 72 min; done cards collapse to 56. */
.${SCOPE} .task {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  min-height: 72px;
  padding: 9px 12px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .task:last-child { border-bottom: none; }
.${SCOPE} .task.isDone { min-height: 56px; }
.${SCOPE} .task.isActive {
  background: light-dark(rgba(180, 35, 24, 0.035), rgba(249, 112, 102, 0.06));
  box-shadow: inset 3px 0 0 0 ${BRAND};
}
.${SCOPE} .lane.forensics .task.isActive {
  background: light-dark(rgba(109, 40, 217, 0.04), rgba(196, 181, 253, 0.07));
  box-shadow: inset 3px 0 0 0 ${FORENSICS};
}
.${SCOPE} .lane.comms .task.isActive {
  background: light-dark(rgba(11, 107, 203, 0.04), rgba(124, 192, 255, 0.07));
  box-shadow: inset 3px 0 0 0 ${COMMS};
}
.${SCOPE} .taskGlyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 1px;
}
.${SCOPE} .taskGlyph.done { background: ${OK_TINT}; color: ${OK}; }
.${SCOPE} .taskGlyph.active { border: 2px solid currentColor; }
.${SCOPE} .taskGlyph.blocked { background: ${WARN_TINT}; color: ${WARN}; }
.${SCOPE} .taskGlyph.pending { border: var(--border-width) dashed var(--color-border); color: var(--color-text-secondary); }
.${SCOPE} .taskBody { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.${SCOPE} .taskTitle { font-size: 12px; font-weight: 600; line-height: 1.3; }
.${SCOPE} .task.isDone .taskTitle { color: var(--color-text-secondary); font-weight: 500; }
.${SCOPE} .task.isPending .taskTitle { color: var(--color-text-secondary); }
.${SCOPE} .taskMeta {
  font-size: 10.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  line-height: 1.35;
}
.${SCOPE} .taskMeta .doneStamp { color: ${OK}; font-weight: 700; }
.${SCOPE} .taskMeta .blockNote { color: ${WARN}; font-weight: 600; }
.${SCOPE} .assetRefs { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 2px; }
.${SCOPE} .assetRef {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 17px;
  padding: 0 6px;
  border-radius: 4px;
  border: var(--border-width) solid var(--color-border);
  font-family: var(--font-family-code, monospace);
  font-size: 9.5px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${SCOPE} .assetRef.isContained { border-color: ${OK}; color: ${OK}; }
.${SCOPE} .completeBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  align-self: flex-start;
  margin-top: 4px;
  height: 30px;
  padding: 0 12px;
  border-radius: 7px;
  background: ${BRAND};
  color: light-dark(#FFFFFF, #2A100E);
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
  position: relative;
  transition: opacity 120ms ease;
}
.${SCOPE} .completeBtn::after { content: ''; position: absolute; inset: -6px 0; }
.${SCOPE} .lane.forensics .completeBtn { background: ${FORENSICS}; color: light-dark(#FFFFFF, #201436); }
.${SCOPE} .lane.comms .completeBtn { background: ${COMMS}; color: light-dark(#FFFFFF, #0B1B2A); }
@media (hover: hover) {
  .${SCOPE} .completeBtn:hover { opacity: 0.88; }
}

/* ---- blast-radius panel (304) --------------------------------------------------- */
.${SCOPE} .blastFill { height: 100%; min-height: 0; display: flex; flex-direction: column; }
.${SCOPE} .blastHead {
  flex-shrink: 0;
  padding: 14px 14px 10px;
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.${SCOPE} .blastTitleRow { display: flex; align-items: center; gap: 8px; }
.${SCOPE} .blastTitle { margin: 0; font-size: 13.5px; font-weight: 700; }
.${SCOPE} .blastTally {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.${SCOPE} .blastTallyBar {
  display: flex;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  background: var(--color-border);
}
.${SCOPE} .blastTallySeg { height: 100%; transition: width 180ms ease; }
.${SCOPE} .blastScroll { flex: 1; min-height: 0; overflow-y: auto; }
.${SCOPE} .assetRow {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 64px;
  padding: 8px 14px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .assetRow:last-child { border-bottom: none; }
.${SCOPE} .assetRow.isCriticalRisk {
  box-shadow: inset 3px 0 0 0 ${BRAND};
}
.${SCOPE} .assetGlyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  flex-shrink: 0;
  background: var(--color-background-muted);
  color: var(--color-text-secondary);
}
.${SCOPE} .assetRow.isContainedRow .assetGlyph { background: ${OK_TINT}; color: ${OK}; }
.${SCOPE} .assetRow.isCriticalRisk .assetGlyph { background: ${BRAND_TINT}; color: ${BRAND}; }
.${SCOPE} .assetBody { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.${SCOPE} .assetIdRow { display: flex; align-items: center; gap: 6px; min-width: 0; }
.${SCOPE} .assetId {
  font-family: var(--font-family-code, monospace);
  font-size: 11.5px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .critTag {
  display: inline-flex;
  align-items: center;
  height: 15px;
  padding: 0 5px;
  border-radius: 4px;
  background: ${BRAND_TINT};
  color: ${BRAND};
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  flex-shrink: 0;
}
.${SCOPE} .assetType {
  font-size: 10.5px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .assetNote {
  font-size: 10px;
  color: var(--color-text-secondary);
  line-height: 1.3;
}
.${SCOPE} .statePill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
  transition: color 160ms ease, background 160ms ease;
}
.${SCOPE} .statePill.contained { background: ${OK_TINT}; color: ${OK}; }
.${SCOPE} .statePill.atRisk { background: ${BRAND_TINT}; color: ${BRAND}; }
.${SCOPE} .statePill.monitoring { background: ${WARN_TINT}; color: ${WARN}; }
.${SCOPE} .blastFoot {
  flex-shrink: 0;
  padding: 10px 14px 14px;
  border-top: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.${SCOPE} .bridgeLine {
  font-size: 10.5px;
  color: var(--color-text-secondary);
  line-height: 1.4;
  font-variant-numeric: tabular-nums;
}
.${SCOPE} .bridgeLine strong { color: var(--color-text-primary); }

/* ---- inline blast radius (compact only) ------------------------------------------ */
.${SCOPE} .inlineBlast {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 10px);
  background: var(--color-background-surface);
  overflow: hidden;
}
.${SCOPE} .inlineBlast .blastScroll { overflow-y: visible; }

/* ---- responsive subtraction -------------------------------------------------------
   The inline demo stage (~1045px) never fires these; they serve the 390px
   embed iframe and full-screen. */
@media (max-width: 760px) {
  .${SCOPE} .laneGrid { grid-template-columns: minmax(0, 1fr); }
  .${SCOPE} .axisLabel.minor { display: none; }
  .${SCOPE} .incSub { display: none; }
  .${SCOPE} .scoreBlock { border-left: none; padding-left: 0; }
}
@media (max-width: 470px) {
  .${SCOPE} .commander { display: none; }
  .${SCOPE} .topbar { padding: 0 12px; gap: 8px; }
  .${SCOPE} .mainScroll { padding: 12px 12px 24px; }
  .${SCOPE} .brandName { display: none; }
  .${SCOPE} .postureBlock { border-right: none; padding-right: 0; }
  /* Subtraction: the asset type column is dropped, not squeezed — the
     value stays in the row's aria-label. */
  .${SCOPE} .assetType { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .${SCOPE} *, .${SCOPE} *::before, .${SCOPE} *::after {
    transition: none !important;
    animation: none !important;
  }
}
`;

// ---------------------------------------------------------------------------
// DATA — INC-2417, detected Jul 9 2026 14:05 UTC. Axis domain 0–270 min;
// the fixed now is 252 min = T+4:12 (93.3%). 15 tasks (6 + 5 + 4), 5 done
// at load (2 + 2 + 1). 8 assets, 3 critical, 1/3 critical contained at
// load → derived posture opens at SEV-1.
// ---------------------------------------------------------------------------

const AXIS_MAX_MIN = 270; // T+4:30
const NOW_MIN = 252; // T+4:12 — the demo's internal clock, fixed
const NOW_LABEL = 'T+4:12';

const pct = (minutes: number) => (minutes / AXIS_MAX_MIN) * 100;

type LaneId = 'containment' | 'forensics' | 'comms';
type PipRow = 'incident' | LaneId;

const LANE_META: Record<LaneId, {
  label: string;
  icon: LucideIcon;
  color: string;
  tint: string;
  owner: string;
  /** Phase label indexed by done-count (length = task count + 1). */
  phases: readonly string[];
}> = {
  containment: {
    label: 'Containment',
    icon: LockIcon,
    color: BRAND,
    tint: BRAND_TINT,
    owner: 'N. Okwuosa',
    phases: [
      'Standing up',
      'Initial actions',
      'Active containment',
      'Active containment',
      'Closing gaps',
      'Eradication ready',
      'Contained',
    ],
  },
  forensics: {
    label: 'Forensics',
    icon: FingerprintIcon,
    color: FORENSICS,
    tint: FORENSICS_TINT,
    owner: 'H. Abadi',
    phases: ['Collecting', 'Collecting', 'Analyzing', 'Analyzing', 'Attributing', 'Complete'],
  },
  comms: {
    label: 'Comms & Legal',
    icon: MegaphoneIcon,
    color: COMMS,
    tint: COMMS_TINT,
    owner: 'J. Tran',
    phases: ['Drafting', 'Holding statement out', 'Notifying', 'Notifying', 'Complete'],
  },
};

const LANE_ORDER: readonly LaneId[] = ['containment', 'forensics', 'comms'];

// ---- assets ------------------------------------------------------------------

type AssetKind = 'account' | 'host' | 'server' | 'network' | 'identity' | 'data';

type Asset = {
  id: string;
  kind: AssetKind;
  type: string;
  isCritical: boolean;
  /** Contained before the session opened (by a pre-seeded done task). */
  seedContained: boolean;
  /** 'monitoring' assets have no containment task — watch-only. */
  isMonitoring: boolean;
  note: string;
};

const ASSETS: readonly Asset[] = [
  {id: 'svc-backup', kind: 'account', type: 'Service account · AD', isCritical: true, seedContained: true, isMonitoring: false, note: 'Initial foothold — disabled T+0:22'},
  {id: 'DC-CORE-02', kind: 'server', type: 'Domain controller · DC-2', isCritical: true, seedContained: false, isMonitoring: false, note: 'Anomalous LDAP reads observed T+1:02'},
  {id: 'VPN-EDGE-1', kind: 'network', type: 'VPN gateway · perimeter', isCritical: true, seedContained: false, isMonitoring: false, note: 'Source ASN 202425 still routable'},
  {id: 'FIN-LT-0342', kind: 'host', type: 'Laptop · patient zero', isCritical: false, seedContained: false, isMonitoring: false, note: 'Finance analyst laptop, EDR quarantine pending'},
  {id: 'WKS-HR-0117', kind: 'host', type: 'Workstation · lateral hop', isCritical: false, seedContained: false, isMonitoring: false, note: 'Second host touched via SMB at T+0:51'},
  {id: 'FS-FIN-01', kind: 'data', type: 'File share · finance', isCritical: false, seedContained: true, isMonitoring: false, note: 'Share ACL frozen with svc-backup disable'},
  {id: 'OKTA-TENANT', kind: 'identity', type: 'Identity provider', isCritical: false, seedContained: false, isMonitoring: true, note: 'No anomalous grants; sign-on policy tightened'},
  {id: 'PAY-DB-PROD', kind: 'data', type: 'Payroll database', isCritical: false, seedContained: false, isMonitoring: true, note: 'No access observed; query audit running'},
];

const ASSET_KIND_ICON: Record<AssetKind, LucideIcon> = {
  account: KeyRoundIcon,
  host: LaptopIcon,
  server: ServerIcon,
  network: GlobeLockIcon,
  identity: UserRoundCogIcon,
  data: DatabaseIcon,
};

// ---- tasks --------------------------------------------------------------------

type Task = {
  id: string;
  lane: LaneId;
  title: string;
  owner: string;
  /** Fixed completion stamp for pre-seeded done tasks. */
  doneAt?: string;
  /** Minute offset for the pre-seeded done pip on the spine. */
  doneAtMin?: number;
  /** Task ids that must be done before this one can start. */
  deps?: readonly string[];
  /** Human name of the dependency, for the blocked-card copy. */
  depLabel?: string;
  /** Assets flipped to contained when this task completes. */
  containsAssets?: readonly string[];
  eta?: string;
};

// Lane order below IS execution order — status derivation walks each lane
// top-to-bottom (done → blocked → first eligible is ACTIVE → pending).
const TASKS: readonly Task[] = [
  // Containment (6) — 2 done at load.
  {id: 'c1', lane: 'containment', title: 'Disable svc-backup service account', owner: 'N. Okwuosa', doneAt: 'T+0:22', doneAtMin: 22, containsAssets: ['svc-backup', 'FS-FIN-01']},
  {id: 'c2', lane: 'containment', title: 'Force MFA re-auth on all admin sessions', owner: 'R. Beaulieu', doneAt: 'T+0:48', doneAtMin: 48},
  {id: 'c3', lane: 'containment', title: 'Isolate patient-zero hosts FIN-LT-0342 + WKS-HR-0117', owner: 'N. Okwuosa', containsAssets: ['FIN-LT-0342', 'WKS-HR-0117'], eta: 'EDR isolate queued'},
  {id: 'c4', lane: 'containment', title: 'Isolate DC-CORE-02 and freeze replication outbound', owner: 'R. Beaulieu', containsAssets: ['DC-CORE-02'], eta: 'Change record CHG-88412 open'},
  {id: 'c5', lane: 'containment', title: 'Block ASN 202425 source ranges at the VPN edge', owner: 'K. Silva', containsAssets: ['VPN-EDGE-1'], eta: 'Netops on bridge'},
  {id: 'c6', lane: 'containment', title: 'Rotate KRBTGT secret twice (staggered)', owner: 'R. Beaulieu', deps: ['c4'], depLabel: 'DC-CORE-02 isolated'},
  // Forensics (5) — 2 done at load. f4 is cross-lane blocked on c3.
  {id: 'f1', lane: 'forensics', title: 'Memory capture — FIN-LT-0342', owner: 'H. Abadi', doneAt: 'T+0:38', doneAtMin: 38},
  {id: 'f2', lane: 'forensics', title: 'Collect EDR triage package (12 hosts)', owner: 'M. Grieve', doneAt: 'T+1:36', doneAtMin: 96},
  // Stress fixture: 71-char title wraps two lines in a ~225px lane column.
  {id: 'f3', lane: 'forensics', title: 'Timeline svc-backup lateral hops from 4624/4648 events across both hosts', owner: 'H. Abadi', eta: 'Splunk query running'},
  {id: 'f4', lane: 'forensics', title: 'Disk image FIN-LT-0342', owner: 'M. Grieve', deps: ['c3'], depLabel: 'host isolation (containment)'},
  {id: 'f5', lane: 'forensics', title: 'Fleet-wide IOC sweep — hashes + 3 C2 domains', owner: 'M. Grieve'},
  // Comms (4) — 1 done at load.
  {id: 'm1', lane: 'comms', title: 'Internal notice to #security-announce', owner: 'J. Tran', doneAt: 'T+2:10', doneAtMin: 130},
  {id: 'm2', lane: 'comms', title: 'Draft customer-impact assessment', owner: 'J. Tran', eta: 'Awaiting forensics scope'},
  {id: 'm3', lane: 'comms', title: 'Legal / regulatory notification decision', owner: 'P. Whitmore', deps: ['m2'], depLabel: 'impact assessment drafted'},
  {id: 'm4', lane: 'comms', title: 'Status-page update — only if customer impact confirmed', owner: 'J. Tran'},
];

const TASK_BY_ID = new Map(TASKS.map(task => [task.id, task]));
const INITIAL_DONE: readonly string[] = ['c1', 'c2', 'f1', 'f2', 'm1'];

// ---- seeded timeline events ------------------------------------------------------

type SpineEvent = {
  id: string;
  min: number;
  row: PipRow;
  label: string;
};

const SEED_EVENTS: readonly SpineEvent[] = [
  {id: 'e0', min: 0, row: 'incident', label: 'T+0:00 — EDR flags anomalous logins (detection)'},
  {id: 'e1', min: 8, row: 'incident', label: 'T+0:08 — Triage confirms credential stuffing'},
  {id: 'e2', min: 14, row: 'incident', label: 'T+0:14 — SEV-2 declared, IC paged'},
  {id: 'e3', min: 22, row: 'containment', label: 'T+0:22 — svc-backup disabled'},
  {id: 'e4', min: 38, row: 'forensics', label: 'T+0:38 — Memory capture FIN-LT-0342'},
  {id: 'e5', min: 48, row: 'containment', label: 'T+0:48 — Admin MFA re-auth forced'},
  {id: 'e6', min: 65, row: 'incident', label: 'T+1:05 — Upgraded to SEV-1 (DC touch observed)'},
  {id: 'e7', min: 96, row: 'forensics', label: 'T+1:36 — EDR triage package collected'},
  {id: 'e8', min: 130, row: 'comms', label: 'T+2:10 — Internal notice posted'},
  {id: 'e9', min: 205, row: 'forensics', label: 'T+3:25 — IOC list v2 distributed'},
];

// Phase spans (background bands): Detection 0–14 · Escalation 14–65 ·
// Active containment 65–252 (the fixed now).
const PHASES: readonly {id: string; from: number; to: number; label: string; hot?: boolean}[] = [
  {id: 'ph-detect', from: 0, to: 14, label: 'Detection'},
  {id: 'ph-escalate', from: 14, to: 65, label: 'Escalation'},
  {id: 'ph-contain', from: 65, to: NOW_MIN, label: 'Active containment', hot: true},
];

// Hourly axis ticks; the 30-min minors carry the `minor` class so the 760px
// breakpoint can thin them out.
const AXIS_TICKS: readonly {min: number; label: string; minor?: boolean}[] = [
  {min: 0, label: 'T+0'},
  {min: 30, label: 'T+0:30', minor: true},
  {min: 60, label: 'T+1:00'},
  {min: 90, label: 'T+1:30', minor: true},
  {min: 120, label: 'T+2:00'},
  {min: 150, label: 'T+2:30', minor: true},
  {min: 180, label: 'T+3:00'},
  {min: 210, label: 'T+3:30', minor: true},
  {min: 240, label: 'T+4:00'},
];

const PIP_ROW_Y: Record<PipRow, number> = {incident: 8, containment: 23, forensics: 38, comms: 53};
const PIP_ROW_COLOR: Record<PipRow, string> = {
  incident: 'var(--color-text-secondary)',
  containment: BRAND,
  forensics: FORENSICS,
  comms: COMMS,
};
const PIP_ROW_TAG: Record<PipRow, string> = {
  incident: 'INC',
  containment: 'CTN',
  forensics: 'FOR',
  comms: 'COM',
};

// ---------------------------------------------------------------------------
// DOMAIN GLYPH — Sitrep mark: a radar pulse (arc pair around a hot pip).
// ---------------------------------------------------------------------------

function SitrepMark({size = 18}: {size?: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="2.1" fill="currentColor" />
      <path d="M4.6 4.6 A 7.6 7.6 0 0 1 15.4 4.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M4.6 15.4 A 7.6 7.6 0 0 0 15.4 15.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" opacity="0.45" />
      <path d="M10 10 L 15.2 6.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// DERIVATION — one done-set in, everything out. Status per lane: done ∈ set;
// blocked = unmet dep; first neither-done-nor-blocked task is ACTIVE; rest
// pending.
// ---------------------------------------------------------------------------

type TaskStatus = 'done' | 'active' | 'blocked' | 'pending';

function deriveLaneStatuses(done: ReadonlySet<string>): Map<string, TaskStatus> {
  const statuses = new Map<string, TaskStatus>();
  for (const lane of LANE_ORDER) {
    let activeAssigned = false;
    for (const task of TASKS) {
      if (task.lane !== lane) {
        continue;
      }
      if (done.has(task.id)) {
        statuses.set(task.id, 'done');
        continue;
      }
      const isBlocked = (task.deps ?? []).some(dep => !done.has(dep));
      if (isBlocked) {
        statuses.set(task.id, 'blocked');
        continue;
      }
      if (!activeAssigned) {
        statuses.set(task.id, 'active');
        activeAssigned = true;
        continue;
      }
      statuses.set(task.id, 'pending');
    }
  }
  return statuses;
}

type Posture = {
  key: 'sev1' | 'sev2' | 'stable';
  label: string;
  detail: string;
};

function derivePosture(criticalUncontained: number, atRisk: number, containmentOpen: number): Posture {
  if (criticalUncontained > 0) {
    return {
      key: 'sev1',
      label: 'SEV-1',
      detail: `${criticalUncontained} critical asset${criticalUncontained === 1 ? '' : 's'} uncontained`,
    };
  }
  if (atRisk > 0 || containmentOpen > 0) {
    return {
      key: 'sev2',
      label: 'SEV-2 · de-escalated',
      detail: 'criticals contained — cleanup running',
    };
  }
  return {key: 'stable', label: 'Stabilized', detail: 'monitoring only'};
}

// ---------------------------------------------------------------------------
// SUB-COMPONENTS — purely presentational; all state lives in the page.
// ---------------------------------------------------------------------------

function SpineStrip({sessionEvents}: {sessionEvents: readonly SpineEvent[]}) {
  // Session pips all land at the fixed now (252 min). When two land on the
  // SAME row they would overlap exactly, so each later pip on a row nudges
  // 12px left — deterministic, order = completion order.
  const rowCounts: Record<string, number> = {};
  const sessionWithOffset = sessionEvents.map(event => {
    const seen = rowCounts[event.row] ?? 0;
    rowCounts[event.row] = seen + 1;
    return {event, offsetPx: seen * 12};
  });
  return (
    <div className="spine" role="img" aria-label={`Incident timeline, ${SEED_EVENTS.length + sessionEvents.length} events from T+0:00 to ${NOW_LABEL}`}>
      <div className="spineTrack">
        {PHASES.map(phase => (
          <div
            key={phase.id}
            className={`phaseBand${phase.hot === true ? ' hot' : ''}`}
            style={{left: `${pct(phase.from)}%`, width: `${pct(phase.to - phase.from)}%`}}>
            {phase.label}
          </div>
        ))}
        <div className="pipField">
          {(Object.keys(PIP_ROW_Y) as PipRow[]).map(row => (
            <div key={row}>
              <div className="pipRowLine" style={{top: PIP_ROW_Y[row]}} />
              <span className="pipRowTag" style={{top: PIP_ROW_Y[row]}}>
                {PIP_ROW_TAG[row]}
              </span>
            </div>
          ))}
          {SEED_EVENTS.map(event => (
            <span
              key={event.id}
              className="pip"
              title={event.label}
              style={{
                left: `${pct(event.min)}%`,
                top: PIP_ROW_Y[event.row],
                background: PIP_ROW_COLOR[event.row],
              }}
            />
          ))}
          {sessionWithOffset.map(({event, offsetPx}) => (
            <span
              key={event.id}
              className="pip isSession"
              title={event.label}
              style={{
                left: `calc(${pct(event.min)}% - ${offsetPx}px)`,
                top: PIP_ROW_Y[event.row],
                background: PIP_ROW_COLOR[event.row],
              }}
            />
          ))}
        </div>
        <div className="axis" />
        {AXIS_TICKS.map(tick => (
          <div key={tick.min}>
            <span className="axisTick" style={{left: `${pct(tick.min)}%`}} />
            <span
              className={`axisLabel${tick.minor === true ? ' minor' : ''}`}
              style={{left: `${pct(tick.min)}%`}}>
              {tick.label}
            </span>
          </div>
        ))}
        <div className="nowLine" style={{left: `${pct(NOW_MIN)}%`}} />
        <span className="nowTag" style={{left: `${pct(NOW_MIN)}%`}}>
          {NOW_LABEL}
        </span>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  status,
  containedAssets,
  onComplete,
}: {
  task: Task;
  status: TaskStatus;
  containedAssets: ReadonlySet<string>;
  onComplete: (taskId: string) => void;
}) {
  const glyph =
    status === 'done' ? (
      <span className="taskGlyph done" aria-hidden="true">
        <CheckIcon size={13} strokeWidth={2.8} />
      </span>
    ) : status === 'blocked' ? (
      <span className="taskGlyph blocked" aria-hidden="true">
        <LockIcon size={12} strokeWidth={2.4} />
      </span>
    ) : status === 'active' ? (
      <span className="taskGlyph active" style={{color: LANE_META[task.lane].color}} aria-hidden="true" />
    ) : (
      <span className="taskGlyph pending" aria-hidden="true" />
    );

  return (
    <div
      className={`task is${status.charAt(0).toUpperCase()}${status.slice(1)}`}
      role="group"
      aria-label={`${LANE_META[task.lane].label}: ${task.title} — ${status}${
        status === 'blocked' && task.depLabel !== undefined ? `, waiting on ${task.depLabel}` : ''
      }`}>
      {glyph}
      <div className="taskBody">
        <span className="taskTitle">{task.title}</span>
        <span className="taskMeta">
          {status === 'done' && task.doneAt !== undefined && (
            <>
              <span className="doneStamp num">{task.doneAt}</span> · {task.owner}
            </>
          )}
          {status === 'done' && task.doneAt === undefined && (
            <>
              <span className="doneStamp num">{NOW_LABEL}</span> · {task.owner} · this session
            </>
          )}
          {status === 'active' && (
            <>
              {task.owner}
              {task.eta !== undefined ? ` · ${task.eta}` : ''}
            </>
          )}
          {status === 'blocked' && (
            <span className="blockNote">Blocked — needs {task.depLabel ?? 'dependency'}</span>
          )}
          {status === 'pending' && <>{task.owner} · queued</>}
        </span>
        {task.containsAssets !== undefined && (
          <span className="assetRefs">
            {task.containsAssets.map(assetId => (
              <span
                key={assetId}
                className={`assetRef${containedAssets.has(assetId) ? ' isContained' : ''}`}>
                {assetId}
              </span>
            ))}
          </span>
        )}
        {status === 'active' && (
          <button type="button" className="completeBtn" onClick={() => onComplete(task.id)}>
            <CheckIcon size={13} strokeWidth={2.8} aria-hidden="true" />
            Mark complete
          </button>
        )}
      </div>
    </div>
  );
}

function LaneColumn({
  lane,
  statuses,
  containedAssets,
  onComplete,
}: {
  lane: LaneId;
  statuses: ReadonlyMap<string, TaskStatus>;
  containedAssets: ReadonlySet<string>;
  onComplete: (taskId: string) => void;
}) {
  const meta = LANE_META[lane];
  const laneTasks = TASKS.filter(task => task.lane === lane);
  const doneCount = laneTasks.filter(task => statuses.get(task.id) === 'done').length;
  const phase = meta.phases[Math.min(doneCount, meta.phases.length - 1)];
  const LaneIcon = meta.icon;
  return (
    <section className={`lane ${lane}`} aria-label={`${meta.label} workstream — ${doneCount} of ${laneTasks.length} done, phase ${phase}`}>
      <div className="laneHead">
        <div className="laneTitleRow">
          <span className="laneGlyph" style={{color: meta.color}}>
            <LaneIcon size={14} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <span className="laneName">{meta.label}</span>
          <span className="laneCount num">
            {doneCount}/{laneTasks.length}
          </span>
        </div>
        <div className="lanePhaseRow">
          <span className="phaseChip" style={{background: meta.tint, color: meta.color}}>
            {phase}
          </span>
          <span className="laneBar" aria-hidden="true">
            <span
              className="laneBarFill"
              style={{width: `${(doneCount / laneTasks.length) * 100}%`, background: meta.color}}
            />
          </span>
        </div>
      </div>
      {laneTasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          status={statuses.get(task.id) ?? 'pending'}
          containedAssets={containedAssets}
          onComplete={onComplete}
        />
      ))}
    </section>
  );
}

function BlastRadius({containedAssets}: {containedAssets: ReadonlySet<string>}) {
  const contained = ASSETS.filter(asset => containedAssets.has(asset.id));
  const monitoring = ASSETS.filter(
    asset => !containedAssets.has(asset.id) && asset.isMonitoring,
  );
  const atRisk = ASSETS.filter(
    asset => !containedAssets.has(asset.id) && !asset.isMonitoring,
  );
  return (
    <div className="blastFill">
      <div className="blastHead">
        <div className="blastTitleRow">
          <ShieldCheckIcon size={15} strokeWidth={2.2} aria-hidden="true" />
          <h2 className="blastTitle">Blast radius</h2>
        </div>
        <span className="blastTally num">
          {contained.length} contained · {atRisk.length} at risk · {monitoring.length} monitoring
        </span>
        <div className="blastTallyBar" aria-hidden="true">
          <span
            className="blastTallySeg"
            style={{width: `${(contained.length / ASSETS.length) * 100}%`, background: OK}}
          />
          <span
            className="blastTallySeg"
            style={{width: `${(atRisk.length / ASSETS.length) * 100}%`, background: BRAND}}
          />
          <span
            className="blastTallySeg"
            style={{width: `${(monitoring.length / ASSETS.length) * 100}%`, background: WARN}}
          />
        </div>
      </div>
      <div className="blastScroll">
        {ASSETS.map(asset => {
          const isContained = containedAssets.has(asset.id);
          const state = isContained ? 'contained' : asset.isMonitoring ? 'monitoring' : 'atRisk';
          const stateLabel =
            state === 'contained' ? 'Contained' : state === 'monitoring' ? 'Monitoring' : 'At risk';
          const AssetIcon = ASSET_KIND_ICON[asset.kind];
          const isCriticalRisk = asset.isCritical && state === 'atRisk';
          return (
            <div
              key={asset.id}
              className={`assetRow${isCriticalRisk ? ' isCriticalRisk' : ''}${isContained ? ' isContainedRow' : ''}`}
              role="group"
              aria-label={`${asset.id}, ${asset.type}${asset.isCritical ? ', critical' : ''} — ${stateLabel}`}>
              <span className="assetGlyph" aria-hidden="true">
                <AssetIcon size={15} strokeWidth={2} />
              </span>
              <div className="assetBody">
                <span className="assetIdRow">
                  <span className="assetId">{asset.id}</span>
                  {asset.isCritical && <span className="critTag">Crit</span>}
                </span>
                <span className="assetType">{asset.type}</span>
                <span className="assetNote">{asset.note}</span>
              </div>
              <span className={`statePill ${state}`}>{stateLabel}</span>
            </div>
          );
        })}
      </div>
      <div className="blastFoot">
        <span className="bridgeLine">
          <strong>Bridge</strong> #inc-2417-bridge · 14 responders · IC D. Vance · scribe L. Martins
        </span>
        <span className="bridgeLine num">Retro doc opens at incident close · SEV policy v6</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — the single state owner: a done-task set + session spine events.
// Task statuses, asset containment, posture, phase chips, the exec summary,
// and the lane scoreboard all derive from the same set in the same render.
// ---------------------------------------------------------------------------

function deriveContainedAssets(done: ReadonlySet<string>): Set<string> {
  const contained = new Set<string>();
  for (const asset of ASSETS) {
    if (asset.seedContained) {
      contained.add(asset.id);
    }
  }
  for (const taskId of done) {
    const task = TASK_BY_ID.get(taskId);
    for (const assetId of task?.containsAssets ?? []) {
      contained.add(assetId);
    }
  }
  return contained;
}

function postureFor(done: ReadonlySet<string>): Posture {
  const contained = deriveContainedAssets(done);
  const criticalUncontained = ASSETS.filter(
    asset => asset.isCritical && !contained.has(asset.id),
  ).length;
  const atRisk = ASSETS.filter(
    asset => !contained.has(asset.id) && !asset.isMonitoring,
  ).length;
  const containmentOpen = TASKS.filter(
    task => task.lane === 'containment' && !done.has(task.id),
  ).length;
  return derivePosture(criticalUncontained, atRisk, containmentOpen);
}

export default function SecurityIncidentWarRoomTemplate() {
  // Embed/full-screen only — the inline demo stage never fires viewport
  // queries; the DEFAULT layout already fits ~1045px (304px panel + ~741px
  // main with ~225px lanes).
  const isCompact = useMediaQuery('(max-width: 760px)');

  const [done, setDone] = useState<ReadonlySet<string>>(() => new Set(INITIAL_DONE));
  const [sessionEvents, setSessionEvents] = useState<readonly SpineEvent[]>([]);
  const [updatesLogged, setUpdatesLogged] = useState(0);
  const [announcement, setAnnouncement] = useState('');

  // ---- derivations ---------------------------------------------------------
  const statuses = useMemo(() => deriveLaneStatuses(done), [done]);
  const containedAssets = useMemo(() => deriveContainedAssets(done), [done]);
  const posture = useMemo(() => postureFor(done), [done]);

  const laneDone: Record<LaneId, number> = {containment: 0, forensics: 0, comms: 0};
  const laneTotal: Record<LaneId, number> = {containment: 0, forensics: 0, comms: 0};
  for (const task of TASKS) {
    laneTotal[task.lane] += 1;
    if (done.has(task.id)) {
      laneDone[task.lane] += 1;
    }
  }
  const doneCount = done.size;
  const blockedCount = TASKS.filter(task => statuses.get(task.id) === 'blocked').length;
  const criticalContained = ASSETS.filter(
    asset => asset.isCritical && containedAssets.has(asset.id),
  ).length;
  const criticalTotal = ASSETS.filter(asset => asset.isCritical).length;

  const execSummary =
    `${posture.label}: ${criticalContained}/${criticalTotal} critical assets contained. ` +
    `Containment ${laneDone.containment}/${laneTotal.containment} · forensics ` +
    `${laneDone.forensics}/${laneTotal.forensics} · comms ${laneDone.comms}/${laneTotal.comms}` +
    `${blockedCount > 0 ? ` · ${blockedCount} blocked` : ''}. Next exec update 18:30 UTC.`;

  // ---- mutations -------------------------------------------------------------
  const handleComplete = (taskId: string) => {
    const task = TASK_BY_ID.get(taskId);
    if (task === undefined || statuses.get(taskId) !== 'active') {
      return;
    }
    const before = posture.key;
    const nextDone = new Set(done);
    nextDone.add(taskId);
    const after = postureFor(nextDone);

    const unblocked = TASKS.filter(
      other =>
        statuses.get(other.id) === 'blocked' &&
        (other.deps ?? []).every(dep => nextDone.has(dep)),
    );

    setDone(nextDone);
    setSessionEvents(prev => [
      ...prev,
      {
        id: `s-${taskId}`,
        min: NOW_MIN, // the demo's internal clock is fixed at T+4:12
        row: task.lane,
        label: `${NOW_LABEL} — ${task.title} complete`,
      },
    ]);

    const parts: string[] = [`${task.title} complete.`];
    for (const assetId of task.containsAssets ?? []) {
      parts.push(`${assetId} contained.`);
    }
    for (const other of unblocked) {
      parts.push(`Unblocked: ${other.title}.`);
    }
    if (after.key !== before) {
      parts.push(
        after.key === 'stable'
          ? 'Posture: incident stabilized — monitoring only.'
          : `Posture improved: SEV-1 de-escalated to SEV-2 — all ${criticalTotal} critical assets contained.`,
      );
    }
    setAnnouncement(parts.join(' '));
  };

  const handleLogUpdate = () => {
    const n = updatesLogged + 1;
    setUpdatesLogged(n);
    setSessionEvents(prev => [
      ...prev,
      {
        id: `u-${n}`,
        min: NOW_MIN,
        row: 'incident',
        label: `${NOW_LABEL} — Exec update #${n} logged: ${execSummary}`,
      },
    ]);
    setAnnouncement(`Executive update #${n} logged to the incident timeline.`);
  };

  // ---- assembled regions --------------------------------------------------------
  const header = (
    <LayoutHeader>
      <div className="topbar">
        <span className="brandMark">
          <SitrepMark size={18} />
        </span>
        <span className="brandName">Sitrep</span>
        <span className="headerDivider" aria-hidden="true" />
        <div className="incBlock">
          <h1 className="incTitle">
            <span className="incId">INC-2417</span> — Credential stuffing → lateral movement via
            svc-backup
          </h1>
          <p className="incSub">
            Detected Jul 9 · 14:05 UTC · bridge #inc-2417-bridge · scribe L. Martins
          </p>
        </div>
        <span className={`postureChip ${posture.key}`}>
          <ShieldCheckIcon size={12} strokeWidth={2.4} aria-hidden="true" />
          {posture.label}
        </span>
        <span className="clockChip" aria-label={`Incident elapsed time ${NOW_LABEL}`}>
          <ActivityIcon size={12} strokeWidth={2.4} aria-hidden="true" />
          {NOW_LABEL}
        </span>
        <span className="headerSpacer" />
        <div className="commander">
          <span className="commanderAvatar" aria-hidden="true">DV</span>
          <span>
            <span className="commanderName">Dara Vance</span>{' '}
            <span className="commanderRole">· Incident commander</span>
          </span>
        </div>
      </div>
    </LayoutHeader>
  );

  const postureBand = (
    <div className="postureBand" role="group" aria-label="Incident posture and executive status">
      <div className="postureBlock">
        <span className="postureLabel">Posture</span>
        <span className={`postureChip ${posture.key}`}>{posture.label}</span>
        <span className="execMeta">{posture.detail}</span>
      </div>
      <div className="execBlock">
        <span className="postureLabel">Executive status — auto-composed</span>
        <p className="execSummary">{execSummary}</p>
        <span className="execMeta num">
          {doneCount}/{TASKS.length} tasks done · {updatesLogged} update
          {updatesLogged === 1 ? '' : 's'} logged this session
        </span>
      </div>
      <div className="scoreBlock" aria-label="Lane scoreboard">
        {LANE_ORDER.map(lane => (
          <span key={lane} className="scoreRow">
            <span className="scoreDot" style={{background: LANE_META[lane].color}} aria-hidden="true" />
            {LANE_META[lane].label}
            <span className="scoreCount num">
              {laneDone[lane]}/{laneTotal[lane]}
            </span>
          </span>
        ))}
      </div>
      <button type="button" className="logUpdateBtn" onClick={handleLogUpdate}>
        <SendIcon size={13} strokeWidth={2.2} aria-hidden="true" />
        Log exec update
      </button>
    </div>
  );

  const blastPanel = <BlastRadius containedAssets={containedAssets} />;

  return (
    <div className={SCOPE}>
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div className="mainScroll">
              <div aria-live="polite" className="visuallyHidden">
                {announcement}
              </div>
              <div className="mainInner">
                {postureBand}
                <SpineStrip sessionEvents={sessionEvents} />
                <div className="laneGrid">
                  {LANE_ORDER.map(lane => (
                    <LaneColumn
                      key={lane}
                      lane={lane}
                      statuses={statuses}
                      containedAssets={containedAssets}
                      onComplete={handleComplete}
                    />
                  ))}
                </div>
                {isCompact && (
                  <section className="inlineBlast" aria-label="Blast radius">
                    {blastPanel}
                  </section>
                )}
              </div>
            </div>
          </LayoutContent>
        }
        end={
          isCompact ? undefined : (
            <LayoutPanel width={304} padding={0} hasDivider label="Blast radius">
              {blastPanel}
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}
