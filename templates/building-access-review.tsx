// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Doorward Q3 2026 physical access
 *   review for the Meridian Tower campus (cycle Jul 1–24 2026; the demo's
 *   internal "today" is Jul 9, so the deadline tile reads "15 days left" as
 *   a fixed string). 4 managers × 16 direct reports (4 + 5 + 3 + 4); 7
 *   attested at load → coverage 7/16 = 43.75%, displayed 44% (derived live
 *   from the attestation map, never stored). 6 open orphan findings from 4
 *   named detectors (HRIS diff, Reader telemetry, Ownership scan, Badge
 *   inventory). Prior executed batches R-102 (Jul 2 · 7 grants · 4 groups)
 *   + R-103 (Jul 7 · 5 grants · 3 groups) = 12 grants revoked this cycle,
 *   the seed for the "Revoked this cycle" tile; session executions append
 *   R-104, R-105… and the tile re-derives. Badge-group holder counts:
 *   LOBBY-ALL 412 · PARK-G2 203 · TWR-3F-ENG 74 · DOCK-1 31 · LAB-4F-WET 22
 *   · EXEC-6F 18 · DC-CAGE-B 9. No clock reads, no randomness, no timers,
 *   no network assets — all dates are fixed strings.
 * @output Doorward — Building Access Review: a quarterly badge-review
 *   console for a physical-security admin. Header (door-and-keyway brand
 *   mark, cycle title, reviewer identity, cycle chip) over a four-tile
 *   derived stat band (coverage ring, open orphan findings, batch tray
 *   size, grants revoked this cycle) and a two-region body: a scrolling
 *   main column holding the MANAGER ATTESTATION QUEUE (per-manager groups
 *   with live x/y progress, 52px person rows carrying badge-group chips
 *   that cycle keep → revoke, last-badge-in recency, an Attest toggle per
 *   row) and the ORPHANED-ACCESS DETECTOR (72px finding rows with severity
 *   spine, custom dormancy-meter SVG, Queue-revoke / Dismiss actions and
 *   session Undo); plus a 304px REVOCATION BATCH TRAY end panel (queued
 *   items with per-item remove, grants/groups rollup, Execute button, and
 *   a pre-seeded audit log the execution appends to). Signature move:
 *   every "add to batch" path — flipping a badge-group chip to revoke on
 *   an attestation row, or queueing an orphan finding — lands in the SAME
 *   tray, and the coverage ring, open-orphan tile, batch tile, and
 *   per-manager progress all re-derive in the same render; Execute batch
 *   stamps R-104 into the audit log, flips every queued chip to a struck
 *   dashed "revoked" state back in the queue, and bumps the
 *   revoked-this-cycle tile — a loop a screenshot cannot show.
 * @position Page template; emitted by `astryx template building-access-review`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header 56 (brand block · cycle block · cycle chip · reviewer) |
 *   content = scrolling main column (stat band 84 → attestation queue →
 *   orphan detector) | end LayoutPanel 304 (batch tray: scrolling item
 *   list + pinned execute footer + audit log). Below 760px (embed iframe /
 *   full-screen only — the inline demo stage never fires viewport queries)
 *   the end panel is dropped and the tray renders inline after the
 *   detector.
 * Container policy: work-surface archetype — rows, group headers, and one
 *   tray panel. The only card-shaped elements are the four stat tiles in
 *   the derived band; everything else is 44/52/72px rows under per-manager
 *   group headers. No marketing layout, no repeated Cards.
 * Color policy: token-pure chrome. ONE quarantined brand accent
 *   BRAND (Doorward graphite-blue) = light-dark(#2E5A80, #7FA9D4):
 *   #2E5A80 on #FFFFFF ≈ 7.3:1, #7FA9D4 on #1B1B1F ≈ 7.0:1 — passes AA
 *   for text in both schemes. State pairs, each with math at declaration:
 *   DANGER light-dark(#B42318, #F97066) ≈ 6.6:1 / 6.2:1; OK
 *   light-dark(#067647, #75E0A7) ≈ 5.7:1 / 10.6:1; WARN
 *   light-dark(#B54708, #FDB022) ≈ 5.4:1 / 9.3:1. The bare --color-text
 *   token does not exist and is never referenced — text uses
 *   --color-text-primary/secondary only.
 * Density grid (repeated verbatim in the CSS): header 56 · stat tiles 84 ·
 *   manager group header 44 · person rows 52 min · badge-group
 *   chips 26 visual with hit area extended to ≥42px via an ::after overlay
 *   inset -8px · orphan rows 72 · tray width 304 · tray items 56 · audit
 *   rows 44 · execute button 44 · 12px gutter inside panels · 20px page
 *   gutter. tabular-nums on every count, percent, badge id, and date
 *   column.
 * Fixture policy: one state owner in the page component — attestation map,
 *   chip-decision map, orphan-status map, executed-batch list — and every
 *   surface (stat band, group headers, chips, detector rows, tray, audit
 *   log, aria-live region) derives from it in render. Stress fixtures live
 *   in the data: a 36-char name with a 64-char contract title exercises
 *   truncation on a 52px row; Kai Watanabe holds ZERO badge groups so the
 *   chip rail renders its em-dash empty state; orphan o-colm is dormant
 *   only 2 days because RECENT use after contract end IS the finding.
 *
 * Responsive contract:
 * - ~1045px demo stage (DEFAULT, no media query): 304px tray + ~741px main
 *   column; person-row identity block is a fixed 218px that ellipsizes;
 *   chip rails wrap to a second line inside the min-52px row (row grows,
 *   page never widens).
 * - <= 760px (embed/full-screen only): end panel dropped via
 *   useMediaQuery; tray renders inline after the detector; stat band wraps
 *   2×2; orphan action buttons drop to their own line.
 * - <= 470px (390px embed): stat tiles go single-file, person rows drop
 *   the last-badge-in column (subtraction, not squeeze — the value remains
 *   in the row aria-label) and the action cluster wraps under the
 *   identity.
 */

import {useMemo, useState} from 'react';
import {
  ArchiveIcon,
  CarIcon,
  CheckIcon,
  ClipboardCheckIcon,
  CopyIcon,
  DoorClosedIcon,
  FlaskConicalIcon,
  IdCardIcon,
  LandmarkIcon,
  MinusIcon,
  PackageIcon,
  RotateCcwIcon,
  ServerIcon,
  ShieldAlertIcon,
  UserRoundXIcon,
  WrenchIcon,
  XIcon,
  type LucideIcon,
} from 'lucide-react';
import {Layout, LayoutContent, LayoutHeader, LayoutPanel} from '@astryxdesign/core/Layout';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// SCOPE + QUARANTINED COLOR LITERALS
// ---------------------------------------------------------------------------

const SCOPE = 'tpl-building-access-review';

// The ONE brand accent. #2E5A80 on #FFFFFF: L≈0.095 → 1.05/0.145 ≈ 7.3:1.
// #7FA9D4 on #1B1B1F: L≈0.377 vs 0.011 → 0.427/0.061 ≈ 7.0:1. AA both.
const BRAND = 'light-dark(#2E5A80, #7FA9D4)';
const BRAND_TINT = 'light-dark(rgba(46, 90, 128, 0.10), rgba(127, 169, 212, 0.16))';

// Revoke / critical. #B42318 on #FFF ≈ 6.6:1; #F97066 on #1B1B1F ≈ 6.2:1.
const DANGER = 'light-dark(#B42318, #F97066)';
const DANGER_TINT = 'light-dark(rgba(180, 35, 24, 0.08), rgba(249, 112, 102, 0.14))';

// Attested / clean. #067647 on #FFF ≈ 5.7:1; #75E0A7 on #1B1B1F ≈ 10.6:1.
const OK = 'light-dark(#067647, #75E0A7)';
const OK_TINT = 'light-dark(rgba(6, 118, 71, 0.10), rgba(117, 224, 167, 0.14))';

// Aging / high severity. #B54708 on #FFF ≈ 5.4:1; #FDB022 on #1B1B1F ≈ 9.3:1.
const WARN = 'light-dark(#B54708, #FDB022)';
const WARN_TINT = 'light-dark(rgba(181, 71, 8, 0.10), rgba(253, 176, 34, 0.14))';

// ---------------------------------------------------------------------------
// TEMPLATE CSS — every selector prefixed with the scope class. Density grid
// (verbatim from the header): header 56 · stat tiles 84 · manager header 44 ·
// person rows 52 min · chips 26 (hit ≥42 via ::after inset -8px) · orphan
// rows 72 · tray 304 · tray items 56 · audit rows 44 · execute button 44.
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

/* ---- header (56) ------------------------------------------------------- */
.${SCOPE} .topbar {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  height: 56px;
  padding: 0 20px;
}
.${SCOPE} .brandBlock {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
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
.${SCOPE} .cycleBlock { min-width: 0; }
.${SCOPE} .cycleTitle {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .cycleSub {
  margin: 0;
  font-size: 11.5px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
}
.${SCOPE} .cycleChip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  border: var(--border-width) solid ${BRAND};
  color: ${BRAND};
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
.${SCOPE} .headerSpacer { flex: 1; }
.${SCOPE} .reviewer {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
}
.${SCOPE} .reviewerAvatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${BRAND};
  /* Solid brand fill: #FFF on #2E5A80 ≈ 7.3:1 (light); dark flips the fill
     to #7FA9D4, so the glyph ink flips to a near-black pair — #14212E on
     #7FA9D4 ≈ 6.4:1. */
  color: light-dark(#FFFFFF, #14212E);
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}
.${SCOPE} .reviewerName {
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
}
.${SCOPE} .reviewerRole {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* ---- content shell ------------------------------------------------------ */
.${SCOPE} .mainScroll {
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 20px 28px;
}
.${SCOPE} .mainInner {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 980px;
}

/* ---- stat band (tiles 84) ----------------------------------------------- */
.${SCOPE} .statBand {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.${SCOPE} .statTile {
  height: 84px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 10px);
  background: var(--color-background-surface);
  min-width: 0;
}
.${SCOPE} .statText { min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.${SCOPE} .statLabel {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .statValue {
  font-size: 21px;
  font-weight: 700;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.${SCOPE} .statHint {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .statGlyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  flex-shrink: 0;
}

/* ---- section headers ----------------------------------------------------- */
.${SCOPE} .sectionHead {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.${SCOPE} .sectionTitle {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.${SCOPE} .sectionMeta {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.${SCOPE} .section { display: flex; flex-direction: column; gap: 10px; }

/* ---- attestation queue ---------------------------------------------------- */
.${SCOPE} .queuePanel {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 10px);
  background: var(--color-background-surface);
  overflow: hidden;
}
/* Manager group header — 44px. */
.${SCOPE} .managerHead {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 0 14px;
  background: var(--color-background-muted);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .managerGroup + .managerGroup .managerHead {
  border-top: var(--border-width) solid var(--color-border);
}
.${SCOPE} .managerAvatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${BRAND_TINT};
  color: ${BRAND};
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}
.${SCOPE} .managerName { font-size: 12.5px; font-weight: 700; white-space: nowrap; }
.${SCOPE} .managerTeam {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.${SCOPE} .managerSpacer { flex: 1; }
.${SCOPE} .managerProgress {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${SCOPE} .managerProgress.isDone { color: ${OK}; }
.${SCOPE} .managerBar {
  width: 72px;
  height: 4px;
  border-radius: 2px;
  background: var(--color-border);
  overflow: hidden;
  flex-shrink: 0;
}
.${SCOPE} .managerBarFill {
  height: 100%;
  border-radius: 2px;
  background: ${BRAND};
  transition: width 160ms ease;
}
.${SCOPE} .managerBarFill.isDone { background: ${OK}; }

/* Person row — 52px min; grows when the chip rail wraps. */
.${SCOPE} .personRow {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 52px;
  padding: 6px 14px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .personRow:last-child { border-bottom: none; }
.${SCOPE} .personRow.isAttested {
  background: light-dark(rgba(6, 118, 71, 0.04), rgba(117, 224, 167, 0.05));
}
.${SCOPE} .personIdent {
  width: 218px;
  min-width: 0;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.${SCOPE} .personName {
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .personTitle {
  font-size: 11px;
  color: var(--color-text-secondary);
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .personBadgeId {
  font-family: var(--font-family-code, monospace);
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${SCOPE} .chipRail {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}
.${SCOPE} .chipEmpty {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  font-style: italic;
}

/* Badge-group chip — 26px visual; ::after extends the hit area to ≥42px
   tall per the 40px+ hit-target rule without inflating the 52px row. */
.${SCOPE} .zoneChip {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 9px 0 7px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-body);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
}
.${SCOPE} .zoneChip::after {
  content: '';
  position: absolute;
  inset: -8px -2px;
}
.${SCOPE} .zoneChip .zoneGlyphBox {
  display: inline-flex;
  color: var(--color-text-secondary);
  transition: color 120ms ease;
}
.${SCOPE} .zoneChip.isRevoke {
  border-color: ${DANGER};
  color: ${DANGER};
  background: ${DANGER_TINT};
}
.${SCOPE} .zoneChip.isRevoke .zoneGlyphBox { color: ${DANGER}; }
.${SCOPE} .zoneChip.isRevoke .zoneChipLabel { text-decoration: line-through; }
.${SCOPE} .zoneChip.isExecuted {
  border-style: dashed;
  color: var(--color-text-secondary);
  cursor: default;
}
.${SCOPE} .zoneChip.isExecuted .zoneChipLabel { text-decoration: line-through; }
.${SCOPE} .zoneChip.isSensitive:not(.isRevoke):not(.isExecuted) {
  border-color: ${WARN};
}
@media (hover: hover) {
  .${SCOPE} .zoneChip:not(.isExecuted):hover { border-color: ${BRAND}; }
}

.${SCOPE} .personTrail {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.${SCOPE} .lastIn {
  width: 104px;
  text-align: end;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${SCOPE} .lastIn.isStale { color: ${WARN}; font-weight: 600; }
.${SCOPE} .attestBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 30px;
  min-width: 96px;
  padding: 0 12px;
  border-radius: 7px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
  position: relative;
  transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
}
.${SCOPE} .attestBtn::after { content: ''; position: absolute; inset: -6px 0; }
.${SCOPE} .attestBtn[aria-pressed='true'] {
  border-color: ${OK};
  color: ${OK};
  background: ${OK_TINT};
}
@media (hover: hover) {
  .${SCOPE} .attestBtn:not([aria-pressed='true']):hover { border-color: ${BRAND}; color: ${BRAND}; }
}

/* ---- orphan detector ------------------------------------------------------ */
.${SCOPE} .detectorPanel {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 10px);
  background: var(--color-background-surface);
  overflow: hidden;
}
.${SCOPE} .orphanRow {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 72px;
  padding: 10px 14px 10px 0;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .orphanRow:last-child { border-bottom: none; }
.${SCOPE} .sevSpine {
  align-self: stretch;
  width: 4px;
  border-radius: 0 2px 2px 0;
  flex-shrink: 0;
}
.${SCOPE} .sevSpine.critical { background: ${DANGER}; }
.${SCOPE} .sevSpine.high { background: ${WARN}; }
.${SCOPE} .sevSpine.medium { background: var(--color-border); }
.${SCOPE} .orphanGlyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  flex-shrink: 0;
}
.${SCOPE} .orphanGlyph.critical { background: ${DANGER_TINT}; color: ${DANGER}; }
.${SCOPE} .orphanGlyph.high { background: ${WARN_TINT}; color: ${WARN}; }
.${SCOPE} .orphanGlyph.medium { background: var(--color-background-muted); color: var(--color-text-secondary); }
.${SCOPE} .orphanBody { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.${SCOPE} .orphanTitleRow {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-wrap: wrap;
}
.${SCOPE} .orphanTitle {
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.3;
  min-width: 0;
}
.${SCOPE} .detectorTag {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 7px;
  border-radius: 999px;
  background: var(--color-background-muted);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
}
.${SCOPE} .orphanDetail {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  line-height: 1.35;
}
.${SCOPE} .orphanZones { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 2px; }
.${SCOPE} .zoneStatic {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 20px;
  padding: 0 7px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${SCOPE} .dormancyWrap {
  width: 128px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.${SCOPE} .dormancyLabel {
  font-size: 10px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${SCOPE} .orphanActions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.${SCOPE} .queueBtn,
.${SCOPE} .dismissBtn,
.${SCOPE} .undoBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 30px;
  padding: 0 12px;
  border-radius: 7px;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
  position: relative;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
}
.${SCOPE} .queueBtn::after,
.${SCOPE} .dismissBtn::after,
.${SCOPE} .undoBtn::after { content: ''; position: absolute; inset: -6px 0; }
.${SCOPE} .queueBtn {
  border-color: ${DANGER};
  color: ${DANGER};
}
@media (hover: hover) {
  .${SCOPE} .queueBtn:hover { background: ${DANGER_TINT}; }
  .${SCOPE} .dismissBtn:hover { border-color: ${BRAND}; color: ${BRAND}; }
  .${SCOPE} .undoBtn:hover { border-color: ${BRAND}; color: ${BRAND}; }
}
.${SCOPE} .orphanRow.isResolved { min-height: 44px; padding-top: 6px; padding-bottom: 6px; }
.${SCOPE} .resolvedText {
  flex: 1;
  min-width: 0;
  font-size: 11.5px;
  color: var(--color-text-secondary);
  line-height: 1.35;
}
.${SCOPE} .resolvedText .strike { text-decoration: line-through; }
.${SCOPE} .resolvedState {
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 10px;
  flex-shrink: 0;
}
.${SCOPE} .resolvedState.queued { color: ${DANGER}; }
.${SCOPE} .resolvedState.dismissed { color: var(--color-text-secondary); }
.${SCOPE} .resolvedState.executed { color: ${OK}; }

/* ---- batch tray (panel 304) ------------------------------------------------ */
.${SCOPE} .trayFill {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.${SCOPE} .trayHead {
  flex-shrink: 0;
  padding: 14px 14px 10px;
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.${SCOPE} .trayTitleRow { display: flex; align-items: center; gap: 8px; }
.${SCOPE} .trayTitle { margin: 0; font-size: 13.5px; font-weight: 700; }
.${SCOPE} .trayCountPill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 7px;
  border-radius: 999px;
  background: ${DANGER};
  /* On the solid danger fill: #FFF on #B42318 ≈ 6.6:1; dark flips the fill
     to #F97066 so the ink flips dark — #2A100E on #F97066 ≈ 7.5:1. */
  color: light-dark(#FFFFFF, #2A100E);
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.${SCOPE} .trayCountPill.isEmpty {
  background: var(--color-background-muted);
  color: var(--color-text-secondary);
}
.${SCOPE} .trayRollup {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.${SCOPE} .trayScroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.${SCOPE} .trayEmpty {
  border: var(--border-width) dashed var(--color-border);
  border-radius: var(--radius-container, 10px);
  padding: 18px 14px;
  text-align: center;
  font-size: 11.5px;
  color: var(--color-text-secondary);
  line-height: 1.45;
}
.${SCOPE} .trayItem {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-height: 56px;
  padding: 8px 10px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 9px;
  background: var(--color-background-body);
}
.${SCOPE} .trayItemBody { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.${SCOPE} .trayItemTitle { font-size: 11.5px; font-weight: 600; line-height: 1.3; }
.${SCOPE} .trayItemMeta {
  font-size: 10.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.${SCOPE} .trayRemove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 7px;
  color: var(--color-text-secondary);
  position: relative;
  flex-shrink: 0;
}
.${SCOPE} .trayRemove::after { content: ''; position: absolute; inset: -8px; }
@media (hover: hover) {
  .${SCOPE} .trayRemove:hover { color: ${DANGER}; background: ${DANGER_TINT}; }
}
.${SCOPE} .trayFoot {
  flex-shrink: 0;
  padding: 10px 14px 14px;
  border-top: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.${SCOPE} .executeBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  border-radius: 9px;
  background: ${DANGER};
  color: light-dark(#FFFFFF, #2A100E);
  font-size: 13px;
  font-weight: 700;
  transition: opacity 120ms ease;
}
.${SCOPE} .executeBtn:disabled {
  cursor: default;
  background: var(--color-background-muted);
  color: var(--color-text-secondary);
}
.${SCOPE} .executeHint {
  font-size: 10.5px;
  color: var(--color-text-secondary);
  line-height: 1.4;
  text-align: center;
}
.${SCOPE} .auditHead {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  padding-top: 2px;
}
.${SCOPE} .auditRow {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 4px 0;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .auditRow:last-child { border-bottom: none; }
.${SCOPE} .auditBatchId {
  font-family: var(--font-family-code, monospace);
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: ${BRAND};
  flex-shrink: 0;
}
.${SCOPE} .auditText {
  flex: 1;
  min-width: 0;
  font-size: 10.5px;
  color: var(--color-text-secondary);
  line-height: 1.35;
  font-variant-numeric: tabular-nums;
}
.${SCOPE} .auditNew {
  display: inline-flex;
  align-items: center;
  height: 16px;
  padding: 0 6px;
  border-radius: 999px;
  background: ${OK_TINT};
  color: ${OK};
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

/* ---- inline tray (compact only) --------------------------------------------- */
.${SCOPE} .inlineTray {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 10px);
  background: var(--color-background-surface);
  overflow: hidden;
}
.${SCOPE} .inlineTray .trayScroll { overflow-y: visible; }

/* ---- responsive subtraction --------------------------------------------------
   The inline demo stage (~1045px) never fires these; they serve the 390px
   embed iframe and full-screen. */
@media (max-width: 760px) {
  .${SCOPE} .statBand { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .${SCOPE} .orphanRow { flex-wrap: wrap; }
  .${SCOPE} .orphanActions { width: 100%; justify-content: flex-end; padding-left: 50px; }
  .${SCOPE} .dormancyWrap { width: 104px; }
  .${SCOPE} .personIdent { width: 168px; }
  .${SCOPE} .cycleSub { display: none; }
  .${SCOPE} .reviewerRole { display: none; }
}
@media (max-width: 470px) {
  .${SCOPE} .statBand { grid-template-columns: minmax(0, 1fr); }
  .${SCOPE} .statTile { height: 72px; }
  /* Subtraction: the last-badge-in column is dropped, not squeezed — the
     value stays in the row's aria-label. */
  .${SCOPE} .lastIn { display: none; }
  .${SCOPE} .personRow { flex-wrap: wrap; }
  .${SCOPE} .personIdent { width: 100%; }
  .${SCOPE} .personTrail { width: 100%; justify-content: flex-end; }
  .${SCOPE} .managerTeam { display: none; }
  .${SCOPE} .topbar { padding: 0 12px; gap: 8px; }
  .${SCOPE} .mainScroll { padding: 12px 12px 24px; }
  .${SCOPE} .brandName { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .${SCOPE} *, .${SCOPE} *::before, .${SCOPE} *::after {
    transition: none !important;
    animation: none !important;
  }
}
`;

// ---------------------------------------------------------------------------
// DATA — Meridian Tower campus, Q3 2026 review (cycle Jul 1–24; internal
// "today" is Jul 9 → "15 days left"). 16 reports across 4 managers
// (4 + 5 + 3 + 4); 7 attested at load → 7/16 = 43.75% ≈ 44% coverage.
// 6 open orphan findings. Prior batches R-102 (7 grants · 4 groups · Jul 2)
// and R-103 (5 grants · 3 groups · Jul 7) seed the audit log: 12 grants
// revoked this cycle before any session action.
// ---------------------------------------------------------------------------

type ZoneKind = 'lobby' | 'tower' | 'lab' | 'dc' | 'dock' | 'exec' | 'parking';
type ZoneTier = 'standard' | 'sensitive' | 'critical';

type Zone = {
  id: string;
  label: string;
  kind: ZoneKind;
  tier: ZoneTier;
  holders: number;
  doors: number;
};

const ZONES: Record<string, Zone> = {
  'LOBBY-ALL': {id: 'LOBBY-ALL', label: 'Lobby & turnstiles', kind: 'lobby', tier: 'standard', holders: 412, doors: 6},
  'TWR-3F-ENG': {id: 'TWR-3F-ENG', label: 'Tower 3F engineering', kind: 'tower', tier: 'standard', holders: 74, doors: 4},
  'LAB-4F-WET': {id: 'LAB-4F-WET', label: '4F wet lab (BSL-2)', kind: 'lab', tier: 'sensitive', holders: 22, doors: 3},
  'DC-CAGE-B': {id: 'DC-CAGE-B', label: 'Data-center cage B', kind: 'dc', tier: 'critical', holders: 9, doors: 2},
  'DOCK-1': {id: 'DOCK-1', label: 'Loading dock 1', kind: 'dock', tier: 'standard', holders: 31, doors: 3},
  'EXEC-6F': {id: 'EXEC-6F', label: 'Executive floor 6', kind: 'exec', tier: 'sensitive', holders: 18, doors: 2},
  'PARK-G2': {id: 'PARK-G2', label: 'Garage level G2', kind: 'parking', tier: 'standard', holders: 203, doors: 2},
};

const ZONE_KIND_ICON: Record<ZoneKind, LucideIcon> = {
  lobby: DoorClosedIcon,
  tower: LandmarkIcon,
  lab: FlaskConicalIcon,
  dc: ServerIcon,
  dock: PackageIcon,
  exec: LandmarkIcon,
  parking: CarIcon,
};

type Person = {
  id: string;
  name: string;
  title: string;
  badgeId: string;
  zoneIds: readonly string[];
  /** Fixed display string — the demo's internal today is Jul 9 2026. */
  lastIn: string;
  /** True when last badge-in is >30 days old — recolors the recency cell. */
  isStale?: boolean;
};

type ManagerGroup = {
  id: string;
  manager: string;
  initials: string;
  team: string;
  reports: readonly Person[];
};

// 16 reports total: 4 (Raman) + 5 (Bell) + 3 (Márquez) + 4 (Ferreira).
const MANAGER_GROUPS: readonly ManagerGroup[] = [
  {
    id: 'm-priya',
    manager: 'Priya Raman',
    initials: 'PR',
    team: 'Facilities Engineering',
    reports: [
      {id: 'p-omar', name: 'Omar Haddad', title: 'Building systems technician', badgeId: 'B-4471', zoneIds: ['LOBBY-ALL', 'DOCK-1', 'PARK-G2'], lastIn: 'Jul 8 · 07:42'},
      {id: 'p-gwen', name: 'Gwen Sato', title: 'HVAC controls engineer', badgeId: 'B-3988', zoneIds: ['LOBBY-ALL', 'TWR-3F-ENG', 'PARK-G2'], lastIn: 'Jul 8 · 08:15'},
      {id: 'p-luis', name: 'Luís Mendonça', title: 'Electrical lead', badgeId: 'B-2204', zoneIds: ['LOBBY-ALL', 'DOCK-1', 'DC-CAGE-B', 'PARK-G2'], lastIn: 'Jul 7 · 16:03'},
      {id: 'p-ffion', name: 'Ffion Bevan', title: 'Space planner', badgeId: 'B-5127', zoneIds: ['LOBBY-ALL'], lastIn: 'Jun 30 · 11:20'},
    ],
  },
  {
    id: 'm-marcus',
    manager: 'Marcus Bell',
    initials: 'MB',
    team: 'Lab Operations',
    reports: [
      {id: 'p-ines', name: 'Inés Aguilar', title: 'Lab manager, 4F wet lab', badgeId: 'B-1830', zoneIds: ['LOBBY-ALL', 'LAB-4F-WET', 'TWR-3F-ENG'], lastIn: 'Jul 9 · 06:58'},
      {id: 'p-dev', name: 'Dev Okafor', title: 'Research associate II', badgeId: 'B-6034', zoneIds: ['LOBBY-ALL', 'LAB-4F-WET'], lastIn: 'Jul 8 · 18:44'},
      // Stress fixture: 38-char name + 64-char title exercise single-line
      // ellipsis inside the fixed 218px identity column.
      {id: 'p-aleks', name: 'Aleksandra Konstantinopoulou-Vayenas', title: 'Senior environmental health & safety compliance specialist (K-9)', badgeId: 'B-6702', zoneIds: ['LOBBY-ALL', 'LAB-4F-WET', 'DOCK-1'], lastIn: 'Jul 3 · 09:12'},
      {id: 'p-theo', name: 'Theo Brandt', title: 'Cryo-storage technician (night)', badgeId: 'B-4415', zoneIds: ['LOBBY-ALL', 'LAB-4F-WET'], lastIn: 'Jul 8 · 22:10'},
      // Cross-referenced by orphan o-mia (128-day dormancy while on leave).
      {id: 'p-mia', name: 'Mia Chen', title: 'Analytical chemist · on leave', badgeId: 'B-2117', zoneIds: ['LOBBY-ALL', 'LAB-4F-WET'], lastIn: 'Mar 3 · 08:31', isStale: true},
    ],
  },
  {
    id: 'm-elena',
    manager: 'Elena Márquez',
    initials: 'EM',
    team: 'Data Center Operations',
    reports: [
      // Cross-referenced by orphan o-noel (duplicate badge B-5501).
      {id: 'p-noel', name: 'Noel Adeyemi', title: 'DC operations engineer', badgeId: 'B-6110', zoneIds: ['LOBBY-ALL', 'DC-CAGE-B', 'PARK-G2'], lastIn: 'Jul 9 · 05:31'},
      {id: 'p-samira', name: 'Samira Qadir', title: 'Network hands-on tech', badgeId: 'B-5583', zoneIds: ['LOBBY-ALL', 'DC-CAGE-B'], lastIn: 'Jul 6 · 14:27'},
      {id: 'p-jonas', name: 'Jonas Petrauskas', title: 'Critical facilities engineer', badgeId: 'B-3341', zoneIds: ['LOBBY-ALL', 'DC-CAGE-B', 'DOCK-1', 'PARK-G2'], lastIn: 'Jul 8 · 23:55'},
    ],
  },
  {
    id: 'm-tom',
    manager: 'Tom Ferreira',
    initials: 'TF',
    team: 'Vendor & Contract Services',
    reports: [
      {id: 'p-ada', name: 'Ada Nwosu', title: 'Janitorial services coordinator', badgeId: 'B-1206', zoneIds: ['LOBBY-ALL', 'TWR-3F-ENG', 'EXEC-6F'], lastIn: 'Jul 9 · 04:12'},
      {id: 'p-rick', name: 'Rick Doyle', title: 'Catering & events vendor lead', badgeId: 'B-7719', zoneIds: ['LOBBY-ALL', 'EXEC-6F'], lastIn: 'Jul 8 · 12:02'},
      {id: 'p-vera', name: 'Vera Stancu', title: 'Security guard supervisor', badgeId: 'B-0954', zoneIds: ['LOBBY-ALL', 'TWR-3F-ENG', 'DOCK-1', 'PARK-G2', 'EXEC-6F'], lastIn: 'Jul 9 · 07:00'},
      // Zero-state fixture: no badge groups → the chip rail renders its
      // em-dash empty state instead of chips.
      {id: 'p-kai', name: 'Kai Watanabe', title: 'Elevator maintenance (escorted)', badgeId: 'B-8823', zoneIds: [], lastIn: 'No badge-ins', isStale: true},
    ],
  },
];

const ALL_REPORTS: readonly Person[] = MANAGER_GROUPS.flatMap(group => [...group.reports]);
const TOTAL_REPORTS = ALL_REPORTS.length; // 16

// 7 of 16 attested at load: Raman's 4 + Aguilar + Okafor + Nwosu.
const INITIAL_ATTESTED: readonly string[] = [
  'p-omar', 'p-gwen', 'p-luis', 'p-ffion', 'p-ines', 'p-dev', 'p-ada',
];

// ---- orphan findings --------------------------------------------------------

type OrphanSeverity = 'critical' | 'high' | 'medium';
type OrphanStatus = 'open' | 'queued' | 'dismissed' | 'executed';

type Orphan = {
  id: string;
  severity: OrphanSeverity;
  detector: 'HRIS diff' | 'Reader telemetry' | 'Ownership scan' | 'Badge inventory';
  icon: LucideIcon;
  title: string;
  detail: string;
  zoneIds: readonly string[];
  /** Days since last badge-in, for the dormancy meter (domain 0–130). */
  dormantDays: number;
  /** Number of individual grants a queued revocation removes. */
  grantCount: number;
  action: string;
};

const ORPHANS: readonly Orphan[] = [
  {
    id: 'o-rui',
    severity: 'critical',
    detector: 'HRIS diff',
    icon: UserRoundXIcon,
    title: 'Rui Costa — terminated Jun 20, badge B-3092 still active',
    detail: 'HRIS shows separation processed Jun 20; badge retains 2 groups incl. data-center cage. No badge-in since Jun 20.',
    zoneIds: ['DC-CAGE-B', 'TWR-3F-ENG'],
    dormantDays: 19,
    grantCount: 2,
    action: 'Revoke both groups + deactivate badge',
  },
  {
    id: 'o-colm',
    severity: 'critical',
    detector: 'Reader telemetry',
    icon: ShieldAlertIcon,
    title: 'Colm Brady (Atlas Mechanical) — badge-in AFTER contract end',
    detail: 'Contract ended Jun 30; DOCK-1 reader logged badge B-9016 on Jul 7, 06:12. Recent use after end date is the finding — dormancy 2 days.',
    zoneIds: ['DOCK-1'],
    dormantDays: 2,
    grantCount: 1,
    action: 'Revoke DOCK-1 + flag to vendor manager',
  },
  {
    id: 'o-park',
    severity: 'high',
    detector: 'Ownership scan',
    icon: CarIcon,
    title: 'PARK-G2 — 3 holders departed, group has no owning manager',
    detail: 'Group owner field empty since the Apr re-org; 3 of 203 holders no longer appear in HRIS. Unreviewable until reassigned.',
    zoneIds: ['PARK-G2'],
    dormantDays: 71,
    grantCount: 3,
    action: 'Revoke 3 stale grants',
  },
  {
    id: 'o-sofia',
    severity: 'high',
    detector: 'HRIS diff',
    icon: IdCardIcon,
    title: 'Sofia Lindgren — transferred to Remote-EU Mar 30, holds EXEC-6F',
    detail: 'Role moved to Remote-EU; escort-free executive-floor access retained. No badge-in for 101 days.',
    zoneIds: ['EXEC-6F'],
    dormantDays: 101,
    grantCount: 1,
    action: 'Revoke EXEC-6F',
  },
  {
    id: 'o-mia',
    severity: 'medium',
    detector: 'Reader telemetry',
    icon: WrenchIcon,
    title: 'Mia Chen — on leave, no badge-in for 128 days',
    detail: 'Leave of absence since Mar 3 (see Lab Operations row). Policy: suspend wet-lab access after 90 dormant days; restore on return.',
    zoneIds: ['LAB-4F-WET'],
    dormantDays: 128,
    grantCount: 1,
    action: 'Suspend LAB-4F-WET until return',
  },
  {
    id: 'o-noel',
    severity: 'medium',
    detector: 'Badge inventory',
    icon: CopyIcon,
    title: 'Noel Adeyemi — two active badges (B-5501, B-6110)',
    detail: 'B-5501 was reported lost in May, replaced by B-6110, never deactivated. Old badge unused 44 days but still opens cage B.',
    zoneIds: ['DC-CAGE-B'],
    dormantDays: 44,
    grantCount: 1,
    action: 'Deactivate duplicate badge B-5501',
  },
];

const ORPHAN_BY_ID = new Map(ORPHANS.map(orphan => [orphan.id, orphan]));

// ---- audit seed ---------------------------------------------------------------

type BatchRecord = {
  id: string;
  when: string;
  grants: number;
  groups: number;
  by: string;
  isSession: boolean;
};

// 7 + 5 = 12 grants revoked this cycle before any session action.
const SEED_BATCHES: readonly BatchRecord[] = [
  {id: 'R-103', when: 'Jul 7 · 09:40', grants: 5, groups: 3, by: 'S. Ortiz', isSession: false},
  {id: 'R-102', when: 'Jul 2 · 15:05', grants: 7, groups: 4, by: 'S. Ortiz', isSession: false},
];
const SEED_GRANTS = SEED_BATCHES.reduce((sum, batch) => sum + batch.grants, 0); // 12
const NEXT_BATCH_NUMBER = 104;

// ---------------------------------------------------------------------------
// DOMAIN GLYPHS — tiny inline SVGs; the DS has no vocabulary for a door mark
// or a dormancy meter.
// ---------------------------------------------------------------------------

/** Doorward mark: a door leaf ajar with a keyway pip. */
function DoorwardMark({size = 18}: {size?: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="2.5" width="14" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 2.5 L14.5 5 V17.5 H8 Z" fill="currentColor" opacity="0.28" />
      <path d="M8 2.5 L14.5 5 V17.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="10.4" cy="10.4" r="1.15" fill="currentColor" />
    </svg>
  );
}

/**
 * Coverage ring — r=15.5, C = 2πr ≈ 97.39; the dash offset derives from the
 * live attested/total ratio so the ring, its center label, and the stat
 * value can never disagree.
 */
function CoverageRing({attested, total}: {attested: number; total: number}) {
  const ratio = total === 0 ? 0 : attested / total;
  const circumference = 2 * Math.PI * 15.5;
  return (
    <svg width={44} height={44} viewBox="0 0 44 44" role="img"
      aria-label={`Attestation coverage ${Math.round(ratio * 100)} percent — ${attested} of ${total} reports`}>
      <circle cx="22" cy="22" r="15.5" fill="none" stroke="var(--color-border)" strokeWidth="4.5" />
      <circle
        cx="22"
        cy="22"
        r="15.5"
        fill="none"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeDasharray={`${circumference * ratio} ${circumference}`}
        transform="rotate(-90 22 22)"
        style={{stroke: ratio >= 1 ? OK : BRAND, transition: 'stroke-dasharray 200ms ease'}}
      />
      <text
        x="22"
        y="22"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="11"
        fontWeight="700"
        fill="var(--color-text-primary)"
        style={{fontVariantNumeric: 'tabular-nums'}}>
        {Math.round(ratio * 100)}%
      </text>
    </svg>
  );
}

/**
 * Dormancy meter — 90-day policy scale (domain clamps at 130d for the two
 * long-dormant findings). The 90d policy threshold is a fixed notch; the
 * fill recolors when the value crosses it.
 */
function DormancyMeter({days}: {days: number}) {
  const DOMAIN = 130;
  const POLICY = 90;
  const width = 128;
  const barW = width - 2;
  const fill = Math.min(days / DOMAIN, 1) * barW;
  const notch = (POLICY / DOMAIN) * barW;
  const over = days >= POLICY;
  return (
    <svg width={width} height={12} viewBox={`0 0 ${width} 12`} aria-hidden="true">
      <rect x="1" y="4" width={barW} height="4" rx="2" fill="var(--color-border)" />
      <rect x="1" y="4" width={Math.max(fill, 2)} height="4" rx="2" style={{fill: over ? DANGER : WARN}} />
      <line x1={1 + notch} y1="1" x2={1 + notch} y2="11" stroke="var(--color-text-secondary)" strokeWidth="1" strokeDasharray="2 1.5" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// DERIVED-STATE TYPES — one state owner (the page); everything below is
// presentational and reports clicks upward.
// ---------------------------------------------------------------------------

/** keep (default, absent from the map) → revoke (queued) → executed. */
type ChipDecision = 'revoke' | 'executed';

type TrayItem = {
  key: string;
  title: string;
  meta: string;
  grants: number;
  zoneIds: readonly string[];
  /** Undo target: orphan id or `${personId}:${zoneId}` chip key. */
  source: {kind: 'orphan'; orphanId: string} | {kind: 'chip'; chipKey: string};
};

// ---------------------------------------------------------------------------
// SUB-COMPONENTS
// ---------------------------------------------------------------------------

function ZoneChip({
  personId,
  personName,
  zoneId,
  decision,
  onToggle,
}: {
  personId: string;
  personName: string;
  zoneId: string;
  decision: ChipDecision | undefined;
  onToggle: (personId: string, zoneId: string) => void;
}) {
  const zone = ZONES[zoneId];
  const GlyphIcon = ZONE_KIND_ICON[zone.kind];
  const isExecuted = decision === 'executed';
  const isRevoke = decision === 'revoke';
  const tierClass = zone.tier !== 'standard' ? ' isSensitive' : '';
  const stateLabel = isExecuted ? 'revoked' : isRevoke ? 'queued for revocation' : 'kept';
  return (
    <button
      type="button"
      className={`zoneChip${isRevoke ? ' isRevoke' : ''}${isExecuted ? ' isExecuted' : ''}${tierClass}`}
      aria-pressed={isRevoke}
      disabled={isExecuted}
      title={`${zone.label} · ${zone.holders} holders · ${zone.doors} doors`}
      aria-label={`${zoneId} for ${personName} — ${stateLabel}. ${
        isExecuted ? 'Revocation executed.' : isRevoke ? 'Click to keep.' : 'Click to queue revocation.'
      }`}
      onClick={() => onToggle(personId, zoneId)}>
      <span className="zoneGlyphBox">
        <GlyphIcon size={12} strokeWidth={2} aria-hidden="true" />
      </span>
      <span className="zoneChipLabel">{zoneId}</span>
      {isRevoke && <MinusIcon size={11} strokeWidth={2.6} aria-hidden="true" />}
      {isExecuted && <CheckIcon size={11} strokeWidth={2.6} aria-hidden="true" />}
    </button>
  );
}

function PersonRowView({
  person,
  isAttested,
  chipDecisions,
  revokesQueued,
  onToggleChip,
  onToggleAttest,
}: {
  person: Person;
  isAttested: boolean;
  chipDecisions: ReadonlyMap<string, ChipDecision>;
  revokesQueued: number;
  onToggleChip: (personId: string, zoneId: string) => void;
  onToggleAttest: (personId: string) => void;
}) {
  const attestLabel = isAttested
    ? 'Attested'
    : revokesQueued > 0
      ? `Attest · ${revokesQueued} revoke${revokesQueued === 1 ? '' : 's'}`
      : 'Attest';
  return (
    <div
      className={`personRow${isAttested ? ' isAttested' : ''}`}
      role="group"
      aria-label={`${person.name}, ${person.title}, badge ${person.badgeId}, last badge-in ${person.lastIn}`}>
      <div className="personIdent">
        <span className="personName">{person.name}</span>
        <span className="personTitle">
          {person.title} · <span className="personBadgeId">{person.badgeId}</span>
        </span>
      </div>
      <div className="chipRail">
        {person.zoneIds.length === 0 ? (
          <span className="chipEmpty">No badge groups — escorted access only</span>
        ) : (
          person.zoneIds.map(zoneId => (
            <ZoneChip
              key={zoneId}
              personId={person.id}
              personName={person.name}
              zoneId={zoneId}
              decision={chipDecisions.get(`${person.id}:${zoneId}`)}
              onToggle={onToggleChip}
            />
          ))
        )}
      </div>
      <div className="personTrail">
        <span className={`lastIn${person.isStale === true ? ' isStale' : ''}`}>{person.lastIn}</span>
        <button
          type="button"
          className="attestBtn"
          aria-pressed={isAttested}
          onClick={() => onToggleAttest(person.id)}>
          {isAttested && <CheckIcon size={13} strokeWidth={2.6} aria-hidden="true" />}
          {attestLabel}
        </button>
      </div>
    </div>
  );
}

function OrphanRowView({
  orphan,
  status,
  onQueue,
  onDismiss,
  onUndo,
}: {
  orphan: Orphan;
  status: OrphanStatus;
  onQueue: (id: string) => void;
  onDismiss: (id: string) => void;
  onUndo: (id: string) => void;
}) {
  const GlyphIcon = orphan.icon;
  if (status !== 'open') {
    // Collapsed 44px resolved row — stays visible this session so the
    // detector list never silently shrinks; queued/dismissed offer Undo.
    return (
      <div className={`orphanRow isResolved`}>
        <span className={`sevSpine ${orphan.severity}`} aria-hidden="true" />
        <span className="resolvedText">
          <span className="strike">{orphan.title}</span>
        </span>
        <span className={`resolvedState ${status}`}>
          {status === 'queued' ? 'In batch' : status === 'dismissed' ? 'Dismissed' : 'Revoked'}
        </span>
        {status !== 'executed' && (
          <button type="button" className="undoBtn" onClick={() => onUndo(orphan.id)}>
            <RotateCcwIcon size={12} strokeWidth={2.2} aria-hidden="true" />
            Undo
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="orphanRow">
      <span className={`sevSpine ${orphan.severity}`} aria-hidden="true" />
      <span className={`orphanGlyph ${orphan.severity}`} aria-hidden="true">
        <GlyphIcon size={17} strokeWidth={2} />
      </span>
      <div className="orphanBody">
        <div className="orphanTitleRow">
          <span className="orphanTitle">{orphan.title}</span>
          <span className="detectorTag">{orphan.detector}</span>
        </div>
        <span className="orphanDetail">{orphan.detail}</span>
        <div className="orphanZones">
          {orphan.zoneIds.map(zoneId => {
            const zone = ZONES[zoneId];
            const ZoneIcon = ZONE_KIND_ICON[zone.kind];
            return (
              <span key={zoneId} className="zoneStatic" title={zone.label}>
                <ZoneIcon size={10} strokeWidth={2} aria-hidden="true" />
                {zoneId}
              </span>
            );
          })}
        </div>
      </div>
      <div className="dormancyWrap">
        <DormancyMeter days={orphan.dormantDays} />
        <span className="dormancyLabel num">
          {orphan.dormantDays}d dormant · 90d policy
        </span>
      </div>
      <div className="orphanActions">
        <button
          type="button"
          className="queueBtn"
          aria-label={`Queue revocation: ${orphan.action} — ${orphan.grantCount} grant${orphan.grantCount === 1 ? '' : 's'}`}
          onClick={() => onQueue(orphan.id)}>
          <ArchiveIcon size={12} strokeWidth={2.2} aria-hidden="true" />
          Queue revoke
        </button>
        <button
          type="button"
          className="dismissBtn"
          aria-label={`Dismiss finding: ${orphan.title}`}
          onClick={() => onDismiss(orphan.id)}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

function TrayContents({
  items,
  grantTotal,
  groupTotal,
  batches,
  onRemove,
  onExecute,
}: {
  items: readonly TrayItem[];
  grantTotal: number;
  groupTotal: number;
  batches: readonly BatchRecord[];
  onRemove: (item: TrayItem) => void;
  onExecute: () => void;
}) {
  return (
    <div className="trayFill">
      <div className="trayHead">
        <div className="trayTitleRow">
          <ArchiveIcon size={15} strokeWidth={2.2} aria-hidden="true" />
          <h2 className="trayTitle">Revocation batch</h2>
          <span className={`trayCountPill${items.length === 0 ? ' isEmpty' : ''} num`}>
            {items.length}
          </span>
        </div>
        <span className="trayRollup">
          {items.length === 0
            ? 'Nothing queued'
            : `${grantTotal} grant${grantTotal === 1 ? '' : 's'} across ${groupTotal} badge group${groupTotal === 1 ? '' : 's'}`}
        </span>
      </div>
      <div className="trayScroll">
        {items.length === 0 ? (
          <div className="trayEmpty">
            Flip a badge-group chip to revoke, or queue an orphan finding —
            everything lands here for one auditable execution.
          </div>
        ) : (
          items.map(item => (
            <div key={item.key} className="trayItem">
              <div className="trayItemBody">
                <span className="trayItemTitle">{item.title}</span>
                <span className="trayItemMeta">{item.meta}</span>
              </div>
              <button
                type="button"
                className="trayRemove"
                aria-label={`Remove from batch: ${item.title}`}
                onClick={() => onRemove(item)}>
                <XIcon size={14} strokeWidth={2.2} aria-hidden="true" />
              </button>
            </div>
          ))
        )}
      </div>
      <div className="trayFoot">
        <button
          type="button"
          className="executeBtn"
          disabled={items.length === 0}
          onClick={onExecute}>
          <ClipboardCheckIcon size={16} strokeWidth={2.2} aria-hidden="true" />
          Execute batch{items.length > 0 ? ` (${grantTotal})` : ''}
        </button>
        <span className="executeHint">
          Executions apply at the next reader sync (≤ 5 min) and are logged to
          the Doorward audit trail.
        </span>
        <div className="auditHead">
          <ClipboardCheckIcon size={11} strokeWidth={2.4} aria-hidden="true" />
          Audit log — this cycle
        </div>
        <div>
          {batches.map(batch => (
            <div key={batch.id} className="auditRow">
              <span className="auditBatchId">{batch.id}</span>
              <span className="auditText">
                {batch.when} · {batch.grants} grant{batch.grants === 1 ? '' : 's'} ·{' '}
                {batch.groups} group{batch.groups === 1 ? '' : 's'} · {batch.by}
              </span>
              {batch.isSession && <span className="auditNew">New</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — the single state owner. Coverage, orphan counts, tray contents,
// manager progress, and the revoked-this-cycle tile are ALL derived from the
// four state maps below in the same render; nothing is double-stored.
// ---------------------------------------------------------------------------

export default function BuildingAccessReviewTemplate() {
  // Embed/full-screen only — the inline demo stage never fires viewport
  // queries, so the DEFAULT layout must already fit ~1045px (it does:
  // 304px tray + ~741px main column).
  const isCompact = useMediaQuery('(max-width: 760px)');

  const [attested, setAttested] = useState<ReadonlySet<string>>(
    () => new Set(INITIAL_ATTESTED),
  );
  const [chipDecisions, setChipDecisions] = useState<ReadonlyMap<string, ChipDecision>>(
    () => new Map(),
  );
  const [orphanStatus, setOrphanStatus] = useState<Readonly<Record<string, OrphanStatus>>>(
    () => Object.fromEntries(ORPHANS.map(orphan => [orphan.id, 'open' as OrphanStatus])),
  );
  const [sessionBatches, setSessionBatches] = useState<readonly BatchRecord[]>([]);
  const [announcement, setAnnouncement] = useState('');

  // ---- derivations (every tile/header/pill reads these) -------------------
  const attestedCount = attested.size;
  const coveragePct = Math.round((attestedCount / TOTAL_REPORTS) * 100);
  const openOrphans = ORPHANS.filter(orphan => orphanStatus[orphan.id] === 'open').length;

  const trayItems = useMemo<TrayItem[]>(() => {
    const items: TrayItem[] = [];
    for (const orphan of ORPHANS) {
      if (orphanStatus[orphan.id] === 'queued') {
        items.push({
          key: `orphan:${orphan.id}`,
          title: orphan.action,
          meta: `${orphan.detector} · ${orphan.zoneIds.join(', ')} · ${orphan.grantCount} grant${orphan.grantCount === 1 ? '' : 's'}`,
          grants: orphan.grantCount,
          zoneIds: orphan.zoneIds,
          source: {kind: 'orphan', orphanId: orphan.id},
        });
      }
    }
    for (const person of ALL_REPORTS) {
      for (const zoneId of person.zoneIds) {
        const chipKey = `${person.id}:${zoneId}`;
        if (chipDecisions.get(chipKey) === 'revoke') {
          items.push({
            key: `chip:${chipKey}`,
            title: `Revoke ${zoneId} — ${person.name}`,
            meta: `Manager attestation · badge ${person.badgeId} · 1 grant`,
            grants: 1,
            zoneIds: [zoneId],
            source: {kind: 'chip', chipKey},
          });
        }
      }
    }
    return items;
  }, [orphanStatus, chipDecisions]);

  const trayGrants = trayItems.reduce((sum, item) => sum + item.grants, 0);
  const trayGroups = new Set(trayItems.flatMap(item => [...item.zoneIds])).size;

  const allBatches = useMemo(
    () => [...sessionBatches, ...SEED_BATCHES],
    [sessionBatches],
  );
  const revokedThisCycle =
    SEED_GRANTS + sessionBatches.reduce((sum, batch) => sum + batch.grants, 0);

  // ---- mutations -----------------------------------------------------------
  const handleToggleAttest = (personId: string) => {
    const person = ALL_REPORTS.find(entry => entry.id === personId);
    // Compute the next set OUTSIDE the updater so the announcement side
    // effect never lives inside a (possibly re-invoked) pure updater.
    const next = new Set(attested);
    const nowAttested = !next.has(personId);
    if (nowAttested) {
      next.add(personId);
    } else {
      next.delete(personId);
    }
    const pct = Math.round((next.size / TOTAL_REPORTS) * 100);
    setAttested(next);
    setAnnouncement(
      `${person?.name ?? personId} ${nowAttested ? 'attested' : 'attestation withdrawn'}. Coverage ${next.size} of ${TOTAL_REPORTS} — ${pct} percent.`,
    );
  };

  const handleToggleChip = (personId: string, zoneId: string) => {
    const chipKey = `${personId}:${zoneId}`;
    const person = ALL_REPORTS.find(entry => entry.id === personId);
    const current = chipDecisions.get(chipKey);
    if (current === 'executed') {
      return;
    }
    const next = new Map(chipDecisions);
    if (current === 'revoke') {
      next.delete(chipKey);
      setAnnouncement(`${zoneId} for ${person?.name ?? personId} kept — removed from batch.`);
    } else {
      next.set(chipKey, 'revoke');
      setAnnouncement(`${zoneId} for ${person?.name ?? personId} queued for revocation.`);
    }
    setChipDecisions(next);
  };

  const handleQueueOrphan = (orphanId: string) => {
    const orphan = ORPHAN_BY_ID.get(orphanId);
    setOrphanStatus(prev => ({...prev, [orphanId]: 'queued'}));
    setAnnouncement(
      orphan !== undefined
        ? `Queued: ${orphan.action}. ${orphan.grantCount} grant${orphan.grantCount === 1 ? '' : 's'} added to the batch.`
        : 'Finding queued.',
    );
  };

  const handleDismissOrphan = (orphanId: string) => {
    const orphan = ORPHAN_BY_ID.get(orphanId);
    setOrphanStatus(prev => ({...prev, [orphanId]: 'dismissed'}));
    setAnnouncement(
      orphan !== undefined ? `Dismissed: ${orphan.title}.` : 'Finding dismissed.',
    );
  };

  const handleUndoOrphan = (orphanId: string) => {
    setOrphanStatus(prev => ({...prev, [orphanId]: 'open'}));
    setAnnouncement('Finding reopened.');
  };

  const handleRemoveTrayItem = (item: TrayItem) => {
    if (item.source.kind === 'orphan') {
      handleUndoOrphan(item.source.orphanId);
      return;
    }
    const chipKey = item.source.chipKey;
    setChipDecisions(prev => {
      const next = new Map(prev);
      next.delete(chipKey);
      return next;
    });
    setAnnouncement(`Removed from batch: ${item.title}.`);
  };

  const handleExecuteBatch = () => {
    if (trayItems.length === 0) {
      return;
    }
    const batchId = `R-${NEXT_BATCH_NUMBER + sessionBatches.length}`;
    const record: BatchRecord = {
      id: batchId,
      // Deterministic: the demo's internal "now" is fixed, so session
      // executions all stamp the same fixed cycle timestamp.
      when: 'Jul 9 · 14:0' + Math.min(sessionBatches.length, 9),
      grants: trayGrants,
      groups: trayGroups,
      by: 'S. Ortiz',
      isSession: true,
    };
    // Queued orphans → executed; queued chips → executed (struck, dashed,
    // disabled back in the attestation queue).
    setOrphanStatus(prev => {
      const next = {...prev};
      for (const orphan of ORPHANS) {
        if (next[orphan.id] === 'queued') {
          next[orphan.id] = 'executed';
        }
      }
      return next;
    });
    setChipDecisions(prev => {
      const next = new Map(prev);
      for (const [key, decision] of next) {
        if (decision === 'revoke') {
          next.set(key, 'executed');
        }
      }
      return next;
    });
    setSessionBatches(prev => [record, ...prev]);
    setAnnouncement(
      `Batch ${batchId} executed — ${trayGrants} grant${trayGrants === 1 ? '' : 's'} across ${trayGroups} badge group${trayGroups === 1 ? '' : 's'} revoked and logged to the audit trail.`,
    );
  };

  // ---- assembled regions ----------------------------------------------------
  const header = (
    <LayoutHeader>
      <div className="topbar">
        <div className="brandBlock">
          <span className="brandMark">
            <DoorwardMark size={18} />
          </span>
          <span className="brandName">Doorward</span>
        </div>
        <span className="headerDivider" aria-hidden="true" />
        <div className="cycleBlock">
          <h1 className="cycleTitle">Q3 2026 badge review — Meridian Tower campus</h1>
          <p className="cycleSub">
            Cycle Jul 1–24 · 4 manager queues · 7 badge groups · reader sync 14:00
          </p>
        </div>
        <span className="cycleChip num">Due Jul 24 · 15 days left</span>
        <span className="headerSpacer" />
        <div className="reviewer">
          <span className="reviewerAvatar" aria-hidden="true">SO</span>
          <span>
            <span className="reviewerName">Selma Ortiz</span>{' '}
            <span className="reviewerRole">· Security systems admin</span>
          </span>
        </div>
      </div>
    </LayoutHeader>
  );

  const statBand = (
    <div className="statBand" role="group" aria-label="Review cycle status">
      <div className="statTile">
        <CoverageRing attested={attestedCount} total={TOTAL_REPORTS} />
        <div className="statText">
          <span className="statLabel">Attestation coverage</span>
          <span className="statValue">{coveragePct}%</span>
          <span className="statHint">
            {attestedCount} of {TOTAL_REPORTS} reports attested
          </span>
        </div>
      </div>
      <div className="statTile">
        <span
          className="statGlyph"
          style={{
            background: openOrphans > 0 ? WARN_TINT : OK_TINT,
            color: openOrphans > 0 ? WARN : OK,
          }}
          aria-hidden="true">
          <ShieldAlertIcon size={17} strokeWidth={2} />
        </span>
        <div className="statText">
          <span className="statLabel">Orphaned access</span>
          <span className="statValue">{openOrphans}</span>
          <span className="statHint">open findings · 4 detectors</span>
        </div>
      </div>
      <div className="statTile">
        <span
          className="statGlyph"
          style={{
            background: trayItems.length > 0 ? DANGER_TINT : 'var(--color-background-muted)',
            color: trayItems.length > 0 ? DANGER : 'var(--color-text-secondary)',
          }}
          aria-hidden="true">
          <ArchiveIcon size={17} strokeWidth={2} />
        </span>
        <div className="statText">
          <span className="statLabel">Batch tray</span>
          <span className="statValue">{trayItems.length}</span>
          <span className="statHint">
            {trayItems.length === 0
              ? 'nothing queued'
              : `${trayGrants} grants · ${trayGroups} groups queued`}
          </span>
        </div>
      </div>
      <div className="statTile">
        <span
          className="statGlyph"
          style={{background: BRAND_TINT, color: BRAND}}
          aria-hidden="true">
          <ClipboardCheckIcon size={17} strokeWidth={2} />
        </span>
        <div className="statText">
          <span className="statLabel">Revoked this cycle</span>
          <span className="statValue">{revokedThisCycle}</span>
          <span className="statHint">
            grants across {allBatches.length} executed batches
          </span>
        </div>
      </div>
    </div>
  );

  const attestationQueue = (
    <section className="section" aria-label="Manager attestation queue">
      <div className="sectionHead">
        <h2 className="sectionTitle">Manager attestations</h2>
        <span className="sectionMeta num">
          {attestedCount}/{TOTAL_REPORTS} attested · flip a badge-group chip to queue a
          revocation
        </span>
      </div>
      <div className="queuePanel">
        {MANAGER_GROUPS.map(group => {
          const done = group.reports.filter(person => attested.has(person.id)).length;
          const total = group.reports.length;
          const isDone = done === total;
          return (
            <div key={group.id} className="managerGroup">
              <div className="managerHead">
                <span className="managerAvatar" aria-hidden="true">{group.initials}</span>
                <span className="managerName">{group.manager}</span>
                <span className="managerTeam">· {group.team}</span>
                <span className="managerSpacer" />
                <span className={`managerProgress${isDone ? ' isDone' : ''}`}>
                  {isDone && <CheckIcon size={13} strokeWidth={2.6} aria-hidden="true" />}
                  {done}/{total} attested
                  <span className="managerBar" aria-hidden="true">
                    <span
                      className={`managerBarFill${isDone ? ' isDone' : ''}`}
                      style={{width: `${(done / total) * 100}%`}}
                    />
                  </span>
                </span>
              </div>
              {group.reports.map(person => {
                const revokesQueued = person.zoneIds.filter(
                  zoneId => chipDecisions.get(`${person.id}:${zoneId}`) === 'revoke',
                ).length;
                return (
                  <PersonRowView
                    key={person.id}
                    person={person}
                    isAttested={attested.has(person.id)}
                    chipDecisions={chipDecisions}
                    revokesQueued={revokesQueued}
                    onToggleChip={handleToggleChip}
                    onToggleAttest={handleToggleAttest}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );

  const detector = (
    <section className="section" aria-label="Orphaned-access detector">
      <div className="sectionHead">
        <h2 className="sectionTitle">Orphaned-access detector</h2>
        <span className="sectionMeta num">
          {openOrphans} open · scanned nightly against HRIS, reader telemetry, and
          badge inventory
        </span>
      </div>
      <div className="detectorPanel">
        {ORPHANS.map(orphan => (
          <OrphanRowView
            key={orphan.id}
            orphan={orphan}
            status={orphanStatus[orphan.id]}
            onQueue={handleQueueOrphan}
            onDismiss={handleDismissOrphan}
            onUndo={handleUndoOrphan}
          />
        ))}
      </div>
    </section>
  );

  const tray = (
    <TrayContents
      items={trayItems}
      grantTotal={trayGrants}
      groupTotal={trayGroups}
      batches={allBatches}
      onRemove={handleRemoveTrayItem}
      onExecute={handleExecuteBatch}
    />
  );

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
                {statBand}
                {attestationQueue}
                {detector}
                {isCompact && (
                  <section className="inlineTray" aria-label="Revocation batch tray">
                    {tray}
                  </section>
                )}
              </div>
            </div>
          </LayoutContent>
        }
        end={
          isCompact ? undefined : (
            <LayoutPanel width={304} padding={0} hasDivider label="Revocation batch tray">
              {tray}
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}
