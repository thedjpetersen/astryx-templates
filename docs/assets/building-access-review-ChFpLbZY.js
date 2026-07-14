import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./archive-CJnjf1mw.js";import{t as i}from"./car-B7VOouDl.js";import{t as a}from"./clipboard-check-DxbTJBP8.js";import{t as o}from"./door-closed-Igr-edfl.js";import{t as s}from"./flask-conical-U5LbBOZP.js";import{t as c}from"./id-card-CF_onXa6.js";import{t as l}from"./landmark-DN6xb7eQ.js";import{t as u}from"./minus-fNqSL3S7.js";import{t as d}from"./package-C3jo0SVh.js";import{t as f}from"./rotate-ccw-CVIkSLha.js";import{t as p}from"./server-CH5q2DMq.js";import{t as m}from"./shield-alert-D2ohXXcb.js";import{t as h}from"./user-round-x-Dn2qkExw.js";import{a as g,h as _,i as v,w as y}from"./index-CcGpqB1l.js";import{n as b,t as x}from"./LayoutContent-CCL91W7X.js";import{t as S}from"./LayoutHeader-Cy2mWoMf.js";import{t as ee}from"./LayoutPanel-Cqp-l8I4.js";import{t as te}from"./useMediaQuery-BvG63aw7.js";var C=e(t(),1),w=n(),T=`tpl-building-access-review`,E=`light-dark(#2E5A80, #7FA9D4)`,D=`light-dark(rgba(46, 90, 128, 0.10), rgba(127, 169, 212, 0.16))`,O=`light-dark(#B42318, #F97066)`,k=`light-dark(rgba(180, 35, 24, 0.08), rgba(249, 112, 102, 0.14))`,A=`light-dark(#067647, #75E0A7)`,j=`light-dark(rgba(6, 118, 71, 0.10), rgba(117, 224, 167, 0.14))`,M=`light-dark(#B54708, #FDB022)`,N=`light-dark(rgba(181, 71, 8, 0.10), rgba(253, 176, 34, 0.14))`,ne=`
.${T} {
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
  height: 100dvh;
  width: 100%;
}
.${T} * { box-sizing: border-box; }
.${T} button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: start;
}
.${T} button:focus-visible {
  outline: 2px solid ${E};
  outline-offset: 2px;
  border-radius: 4px;
}
.${T} .num { font-variant-numeric: tabular-nums; }
.${T} .visuallyHidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ---- header (56) ------------------------------------------------------- */
.${T} .topbar {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  height: 56px;
  padding: 0 20px;
}
.${T} .brandBlock {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
}
.${T} .brandMark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: ${D};
  color: ${E};
  flex-shrink: 0;
}
.${T} .brandName {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  white-space: nowrap;
}
.${T} .headerDivider {
  width: var(--border-width);
  align-self: stretch;
  margin: 14px 2px;
  background: var(--color-border);
  flex-shrink: 0;
}
.${T} .cycleBlock { min-width: 0; }
.${T} .cycleTitle {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${T} .cycleSub {
  margin: 0;
  font-size: 11.5px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
}
.${T} .cycleChip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  border: var(--border-width) solid ${E};
  color: ${E};
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
.${T} .headerSpacer { flex: 1; }
.${T} .reviewer {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
}
.${T} .reviewerAvatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${E};
  /* Solid brand fill: #FFF on #2E5A80 ≈ 7.3:1 (light); dark flips the fill
     to #7FA9D4, so the glyph ink flips to a near-black pair — #14212E on
     #7FA9D4 ≈ 6.4:1. */
  color: light-dark(#FFFFFF, #14212E);
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}
.${T} .reviewerName {
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
}
.${T} .reviewerRole {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* ---- content shell ------------------------------------------------------ */
.${T} .mainScroll {
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 20px 28px;
}
.${T} .mainInner {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 980px;
}

/* ---- stat band (tiles 84) ----------------------------------------------- */
.${T} .statBand {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.${T} .statTile {
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
.${T} .statText { min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.${T} .statLabel {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${T} .statValue {
  font-size: 21px;
  font-weight: 700;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.${T} .statHint {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${T} .statGlyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  flex-shrink: 0;
}

/* ---- section headers ----------------------------------------------------- */
.${T} .sectionHead {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.${T} .sectionTitle {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.${T} .sectionMeta {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.${T} .section { display: flex; flex-direction: column; gap: 10px; }

/* ---- attestation queue ---------------------------------------------------- */
.${T} .queuePanel {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 10px);
  background: var(--color-background-surface);
  overflow: hidden;
}
/* Manager group header — 44px. */
.${T} .managerHead {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 0 14px;
  background: var(--color-background-muted);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${T} .managerGroup + .managerGroup .managerHead {
  border-top: var(--border-width) solid var(--color-border);
}
.${T} .managerAvatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${D};
  color: ${E};
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}
.${T} .managerName { font-size: 12.5px; font-weight: 700; white-space: nowrap; }
.${T} .managerTeam {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.${T} .managerSpacer { flex: 1; }
.${T} .managerProgress {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${T} .managerProgress.isDone { color: ${A}; }
.${T} .managerBar {
  width: 72px;
  height: 4px;
  border-radius: 2px;
  background: var(--color-border);
  overflow: hidden;
  flex-shrink: 0;
}
.${T} .managerBarFill {
  height: 100%;
  border-radius: 2px;
  background: ${E};
  transition: width 160ms ease;
}
.${T} .managerBarFill.isDone { background: ${A}; }

/* Person row — 52px min; grows when the chip rail wraps. */
.${T} .personRow {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 52px;
  padding: 6px 14px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${T} .personRow:last-child { border-bottom: none; }
.${T} .personRow.isAttested {
  background: light-dark(rgba(6, 118, 71, 0.04), rgba(117, 224, 167, 0.05));
}
.${T} .personIdent {
  width: 218px;
  min-width: 0;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.${T} .personName {
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${T} .personTitle {
  font-size: 11px;
  color: var(--color-text-secondary);
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${T} .personBadgeId {
  font-family: var(--font-family-code, monospace);
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${T} .chipRail {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}
.${T} .chipEmpty {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  font-style: italic;
}

/* Badge-group chip — 26px visual; ::after extends the hit area to ≥42px
   tall per the 40px+ hit-target rule without inflating the 52px row. */
.${T} .zoneChip {
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
.${T} .zoneChip::after {
  content: '';
  position: absolute;
  inset: -8px -2px;
}
.${T} .zoneChip .zoneGlyphBox {
  display: inline-flex;
  color: var(--color-text-secondary);
  transition: color 120ms ease;
}
.${T} .zoneChip.isRevoke {
  border-color: ${O};
  color: ${O};
  background: ${k};
}
.${T} .zoneChip.isRevoke .zoneGlyphBox { color: ${O}; }
.${T} .zoneChip.isRevoke .zoneChipLabel { text-decoration: line-through; }
.${T} .zoneChip.isExecuted {
  border-style: dashed;
  color: var(--color-text-secondary);
  cursor: default;
}
.${T} .zoneChip.isExecuted .zoneChipLabel { text-decoration: line-through; }
.${T} .zoneChip.isSensitive:not(.isRevoke):not(.isExecuted) {
  border-color: ${M};
}
@media (hover: hover) {
  .${T} .zoneChip:not(.isExecuted):hover { border-color: ${E}; }
}

.${T} .personTrail {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.${T} .lastIn {
  width: 104px;
  text-align: end;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${T} .lastIn.isStale { color: ${M}; font-weight: 600; }
.${T} .attestBtn {
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
.${T} .attestBtn::after { content: ''; position: absolute; inset: -6px 0; }
.${T} .attestBtn[aria-pressed='true'] {
  border-color: ${A};
  color: ${A};
  background: ${j};
}
@media (hover: hover) {
  .${T} .attestBtn:not([aria-pressed='true']):hover { border-color: ${E}; color: ${E}; }
}

/* ---- orphan detector ------------------------------------------------------ */
.${T} .detectorPanel {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 10px);
  background: var(--color-background-surface);
  overflow: hidden;
}
.${T} .orphanRow {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 72px;
  padding: 10px 14px 10px 0;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${T} .orphanRow:last-child { border-bottom: none; }
.${T} .sevSpine {
  align-self: stretch;
  width: 4px;
  border-radius: 0 2px 2px 0;
  flex-shrink: 0;
}
.${T} .sevSpine.critical { background: ${O}; }
.${T} .sevSpine.high { background: ${M}; }
.${T} .sevSpine.medium { background: var(--color-border); }
.${T} .orphanGlyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  flex-shrink: 0;
}
.${T} .orphanGlyph.critical { background: ${k}; color: ${O}; }
.${T} .orphanGlyph.high { background: ${N}; color: ${M}; }
.${T} .orphanGlyph.medium { background: var(--color-background-muted); color: var(--color-text-secondary); }
.${T} .orphanBody { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.${T} .orphanTitleRow {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-wrap: wrap;
}
.${T} .orphanTitle {
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.3;
  min-width: 0;
}
.${T} .detectorTag {
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
.${T} .orphanDetail {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  line-height: 1.35;
}
.${T} .orphanZones { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 2px; }
.${T} .zoneStatic {
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
.${T} .dormancyWrap {
  width: 128px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.${T} .dormancyLabel {
  font-size: 10px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${T} .orphanActions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.${T} .queueBtn,
.${T} .dismissBtn,
.${T} .undoBtn {
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
.${T} .queueBtn::after,
.${T} .dismissBtn::after,
.${T} .undoBtn::after { content: ''; position: absolute; inset: -6px 0; }
.${T} .queueBtn {
  border-color: ${O};
  color: ${O};
}
@media (hover: hover) {
  .${T} .queueBtn:hover { background: ${k}; }
  .${T} .dismissBtn:hover { border-color: ${E}; color: ${E}; }
  .${T} .undoBtn:hover { border-color: ${E}; color: ${E}; }
}
.${T} .orphanRow.isResolved { min-height: 44px; padding-top: 6px; padding-bottom: 6px; }
.${T} .resolvedText {
  flex: 1;
  min-width: 0;
  font-size: 11.5px;
  color: var(--color-text-secondary);
  line-height: 1.35;
}
.${T} .resolvedText .strike { text-decoration: line-through; }
.${T} .resolvedState {
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 10px;
  flex-shrink: 0;
}
.${T} .resolvedState.queued { color: ${O}; }
.${T} .resolvedState.dismissed { color: var(--color-text-secondary); }
.${T} .resolvedState.executed { color: ${A}; }

/* ---- batch tray (panel 304) ------------------------------------------------ */
.${T} .trayFill {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.${T} .trayHead {
  flex-shrink: 0;
  padding: 14px 14px 10px;
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.${T} .trayTitleRow { display: flex; align-items: center; gap: 8px; }
.${T} .trayTitle { margin: 0; font-size: 13.5px; font-weight: 700; }
.${T} .trayCountPill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 7px;
  border-radius: 999px;
  background: ${O};
  /* On the solid danger fill: #FFF on #B42318 ≈ 6.6:1; dark flips the fill
     to #F97066 so the ink flips dark — #2A100E on #F97066 ≈ 7.5:1. */
  color: light-dark(#FFFFFF, #2A100E);
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.${T} .trayCountPill.isEmpty {
  background: var(--color-background-muted);
  color: var(--color-text-secondary);
}
.${T} .trayRollup {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.${T} .trayScroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.${T} .trayEmpty {
  border: var(--border-width) dashed var(--color-border);
  border-radius: var(--radius-container, 10px);
  padding: 18px 14px;
  text-align: center;
  font-size: 11.5px;
  color: var(--color-text-secondary);
  line-height: 1.45;
}
.${T} .trayItem {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-height: 56px;
  padding: 8px 10px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 9px;
  background: var(--color-background-body);
}
.${T} .trayItemBody { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.${T} .trayItemTitle { font-size: 11.5px; font-weight: 600; line-height: 1.3; }
.${T} .trayItemMeta {
  font-size: 10.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.${T} .trayRemove {
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
.${T} .trayRemove::after { content: ''; position: absolute; inset: -8px; }
@media (hover: hover) {
  .${T} .trayRemove:hover { color: ${O}; background: ${k}; }
}
.${T} .trayFoot {
  flex-shrink: 0;
  padding: 10px 14px 14px;
  border-top: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.${T} .executeBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  border-radius: 9px;
  background: ${O};
  color: light-dark(#FFFFFF, #2A100E);
  font-size: 13px;
  font-weight: 700;
  transition: opacity 120ms ease;
}
.${T} .executeBtn:disabled {
  cursor: default;
  background: var(--color-background-muted);
  color: var(--color-text-secondary);
}
.${T} .executeHint {
  font-size: 10.5px;
  color: var(--color-text-secondary);
  line-height: 1.4;
  text-align: center;
}
.${T} .auditHead {
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
.${T} .auditRow {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 4px 0;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${T} .auditRow:last-child { border-bottom: none; }
.${T} .auditBatchId {
  font-family: var(--font-family-code, monospace);
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: ${E};
  flex-shrink: 0;
}
.${T} .auditText {
  flex: 1;
  min-width: 0;
  font-size: 10.5px;
  color: var(--color-text-secondary);
  line-height: 1.35;
  font-variant-numeric: tabular-nums;
}
.${T} .auditNew {
  display: inline-flex;
  align-items: center;
  height: 16px;
  padding: 0 6px;
  border-radius: 999px;
  background: ${j};
  color: ${A};
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

/* ---- inline tray (compact only) --------------------------------------------- */
.${T} .inlineTray {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 10px);
  background: var(--color-background-surface);
  overflow: hidden;
}
.${T} .inlineTray .trayScroll { overflow-y: visible; }

/* ---- responsive subtraction --------------------------------------------------
   The inline demo stage (~1045px) never fires these; they serve the 390px
   embed iframe and full-screen. */
@media (max-width: 760px) {
  .${T} .statBand { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .${T} .orphanRow { flex-wrap: wrap; }
  .${T} .orphanActions { width: 100%; justify-content: flex-end; padding-left: 50px; }
  .${T} .dormancyWrap { width: 104px; }
  .${T} .personIdent { width: 168px; }
  .${T} .cycleSub { display: none; }
  .${T} .reviewerRole { display: none; }
}
@media (max-width: 470px) {
  .${T} .statBand { grid-template-columns: minmax(0, 1fr); }
  .${T} .statTile { height: 72px; }
  /* Subtraction: the last-badge-in column is dropped, not squeezed — the
     value stays in the row's aria-label. */
  .${T} .lastIn { display: none; }
  .${T} .personRow { flex-wrap: wrap; }
  .${T} .personIdent { width: 100%; }
  .${T} .personTrail { width: 100%; justify-content: flex-end; }
  .${T} .managerTeam { display: none; }
  .${T} .topbar { padding: 0 12px; gap: 8px; }
  .${T} .mainScroll { padding: 12px 12px 24px; }
  .${T} .brandName { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .${T} *, .${T} *::before, .${T} *::after {
    transition: none !important;
    animation: none !important;
  }
}
`,P={"LOBBY-ALL":{id:`LOBBY-ALL`,label:`Lobby & turnstiles`,kind:`lobby`,tier:`standard`,holders:412,doors:6},"TWR-3F-ENG":{id:`TWR-3F-ENG`,label:`Tower 3F engineering`,kind:`tower`,tier:`standard`,holders:74,doors:4},"LAB-4F-WET":{id:`LAB-4F-WET`,label:`4F wet lab (BSL-2)`,kind:`lab`,tier:`sensitive`,holders:22,doors:3},"DC-CAGE-B":{id:`DC-CAGE-B`,label:`Data-center cage B`,kind:`dc`,tier:`critical`,holders:9,doors:2},"DOCK-1":{id:`DOCK-1`,label:`Loading dock 1`,kind:`dock`,tier:`standard`,holders:31,doors:3},"EXEC-6F":{id:`EXEC-6F`,label:`Executive floor 6`,kind:`exec`,tier:`sensitive`,holders:18,doors:2},"PARK-G2":{id:`PARK-G2`,label:`Garage level G2`,kind:`parking`,tier:`standard`,holders:203,doors:2}},F={lobby:o,tower:l,lab:s,dc:p,dock:d,exec:l,parking:i},I=[{id:`m-priya`,manager:`Priya Raman`,initials:`PR`,team:`Facilities Engineering`,reports:[{id:`p-omar`,name:`Omar Haddad`,title:`Building systems technician`,badgeId:`B-4471`,zoneIds:[`LOBBY-ALL`,`DOCK-1`,`PARK-G2`],lastIn:`Jul 8 · 07:42`},{id:`p-gwen`,name:`Gwen Sato`,title:`HVAC controls engineer`,badgeId:`B-3988`,zoneIds:[`LOBBY-ALL`,`TWR-3F-ENG`,`PARK-G2`],lastIn:`Jul 8 · 08:15`},{id:`p-luis`,name:`Luís Mendonça`,title:`Electrical lead`,badgeId:`B-2204`,zoneIds:[`LOBBY-ALL`,`DOCK-1`,`DC-CAGE-B`,`PARK-G2`],lastIn:`Jul 7 · 16:03`},{id:`p-ffion`,name:`Ffion Bevan`,title:`Space planner`,badgeId:`B-5127`,zoneIds:[`LOBBY-ALL`],lastIn:`Jun 30 · 11:20`}]},{id:`m-marcus`,manager:`Marcus Bell`,initials:`MB`,team:`Lab Operations`,reports:[{id:`p-ines`,name:`Inés Aguilar`,title:`Lab manager, 4F wet lab`,badgeId:`B-1830`,zoneIds:[`LOBBY-ALL`,`LAB-4F-WET`,`TWR-3F-ENG`],lastIn:`Jul 9 · 06:58`},{id:`p-dev`,name:`Dev Okafor`,title:`Research associate II`,badgeId:`B-6034`,zoneIds:[`LOBBY-ALL`,`LAB-4F-WET`],lastIn:`Jul 8 · 18:44`},{id:`p-aleks`,name:`Aleksandra Konstantinopoulou-Vayenas`,title:`Senior environmental health & safety compliance specialist (K-9)`,badgeId:`B-6702`,zoneIds:[`LOBBY-ALL`,`LAB-4F-WET`,`DOCK-1`],lastIn:`Jul 3 · 09:12`},{id:`p-theo`,name:`Theo Brandt`,title:`Cryo-storage technician (night)`,badgeId:`B-4415`,zoneIds:[`LOBBY-ALL`,`LAB-4F-WET`],lastIn:`Jul 8 · 22:10`},{id:`p-mia`,name:`Mia Chen`,title:`Analytical chemist · on leave`,badgeId:`B-2117`,zoneIds:[`LOBBY-ALL`,`LAB-4F-WET`],lastIn:`Mar 3 · 08:31`,isStale:!0}]},{id:`m-elena`,manager:`Elena Márquez`,initials:`EM`,team:`Data Center Operations`,reports:[{id:`p-noel`,name:`Noel Adeyemi`,title:`DC operations engineer`,badgeId:`B-6110`,zoneIds:[`LOBBY-ALL`,`DC-CAGE-B`,`PARK-G2`],lastIn:`Jul 9 · 05:31`},{id:`p-samira`,name:`Samira Qadir`,title:`Network hands-on tech`,badgeId:`B-5583`,zoneIds:[`LOBBY-ALL`,`DC-CAGE-B`],lastIn:`Jul 6 · 14:27`},{id:`p-jonas`,name:`Jonas Petrauskas`,title:`Critical facilities engineer`,badgeId:`B-3341`,zoneIds:[`LOBBY-ALL`,`DC-CAGE-B`,`DOCK-1`,`PARK-G2`],lastIn:`Jul 8 · 23:55`}]},{id:`m-tom`,manager:`Tom Ferreira`,initials:`TF`,team:`Vendor & Contract Services`,reports:[{id:`p-ada`,name:`Ada Nwosu`,title:`Janitorial services coordinator`,badgeId:`B-1206`,zoneIds:[`LOBBY-ALL`,`TWR-3F-ENG`,`EXEC-6F`],lastIn:`Jul 9 · 04:12`},{id:`p-rick`,name:`Rick Doyle`,title:`Catering & events vendor lead`,badgeId:`B-7719`,zoneIds:[`LOBBY-ALL`,`EXEC-6F`],lastIn:`Jul 8 · 12:02`},{id:`p-vera`,name:`Vera Stancu`,title:`Security guard supervisor`,badgeId:`B-0954`,zoneIds:[`LOBBY-ALL`,`TWR-3F-ENG`,`DOCK-1`,`PARK-G2`,`EXEC-6F`],lastIn:`Jul 9 · 07:00`},{id:`p-kai`,name:`Kai Watanabe`,title:`Elevator maintenance (escorted)`,badgeId:`B-8823`,zoneIds:[],lastIn:`No badge-ins`,isStale:!0}]}],L=I.flatMap(e=>[...e.reports]),R=L.length,re=[`p-omar`,`p-gwen`,`p-luis`,`p-ffion`,`p-ines`,`p-dev`,`p-ada`],z=[{id:`o-rui`,severity:`critical`,detector:`HRIS diff`,icon:h,title:`Rui Costa — terminated Jun 20, badge B-3092 still active`,detail:`HRIS shows separation processed Jun 20; badge retains 2 groups incl. data-center cage. No badge-in since Jun 20.`,zoneIds:[`DC-CAGE-B`,`TWR-3F-ENG`],dormantDays:19,grantCount:2,action:`Revoke both groups + deactivate badge`},{id:`o-colm`,severity:`critical`,detector:`Reader telemetry`,icon:m,title:`Colm Brady (Atlas Mechanical) — badge-in AFTER contract end`,detail:`Contract ended Jun 30; DOCK-1 reader logged badge B-9016 on Jul 7, 06:12. Recent use after end date is the finding — dormancy 2 days.`,zoneIds:[`DOCK-1`],dormantDays:2,grantCount:1,action:`Revoke DOCK-1 + flag to vendor manager`},{id:`o-park`,severity:`high`,detector:`Ownership scan`,icon:i,title:`PARK-G2 — 3 holders departed, group has no owning manager`,detail:`Group owner field empty since the Apr re-org; 3 of 203 holders no longer appear in HRIS. Unreviewable until reassigned.`,zoneIds:[`PARK-G2`],dormantDays:71,grantCount:3,action:`Revoke 3 stale grants`},{id:`o-sofia`,severity:`high`,detector:`HRIS diff`,icon:c,title:`Sofia Lindgren — transferred to Remote-EU Mar 30, holds EXEC-6F`,detail:`Role moved to Remote-EU; escort-free executive-floor access retained. No badge-in for 101 days.`,zoneIds:[`EXEC-6F`],dormantDays:101,grantCount:1,action:`Revoke EXEC-6F`},{id:`o-mia`,severity:`medium`,detector:`Reader telemetry`,icon:g,title:`Mia Chen — on leave, no badge-in for 128 days`,detail:`Leave of absence since Mar 3 (see Lab Operations row). Policy: suspend wet-lab access after 90 dormant days; restore on return.`,zoneIds:[`LAB-4F-WET`],dormantDays:128,grantCount:1,action:`Suspend LAB-4F-WET until return`},{id:`o-noel`,severity:`medium`,detector:`Badge inventory`,icon:_,title:`Noel Adeyemi — two active badges (B-5501, B-6110)`,detail:`B-5501 was reported lost in May, replaced by B-6110, never deactivated. Old badge unused 44 days but still opens cage B.`,zoneIds:[`DC-CAGE-B`],dormantDays:44,grantCount:1,action:`Deactivate duplicate badge B-5501`}],B=new Map(z.map(e=>[e.id,e])),V=[{id:`R-103`,when:`Jul 7 · 09:40`,grants:5,groups:3,by:`S. Ortiz`,isSession:!1},{id:`R-102`,when:`Jul 2 · 15:05`,grants:7,groups:4,by:`S. Ortiz`,isSession:!1}],H=V.reduce((e,t)=>e+t.grants,0),U=104;function W({size:e=18}){return(0,w.jsxs)(`svg`,{width:e,height:e,viewBox:`0 0 20 20`,fill:`none`,"aria-hidden":`true`,children:[(0,w.jsx)(`rect`,{x:`3`,y:`2.5`,width:`14`,height:`15`,rx:`2`,stroke:`currentColor`,strokeWidth:`1.6`}),(0,w.jsx)(`path`,{d:`M8 2.5 L14.5 5 V17.5 H8 Z`,fill:`currentColor`,opacity:`0.28`}),(0,w.jsx)(`path`,{d:`M8 2.5 L14.5 5 V17.5`,stroke:`currentColor`,strokeWidth:`1.4`,strokeLinejoin:`round`}),(0,w.jsx)(`circle`,{cx:`10.4`,cy:`10.4`,r:`1.15`,fill:`currentColor`})]})}function G({attested:e,total:t}){let n=t===0?0:e/t,r=2*Math.PI*15.5;return(0,w.jsxs)(`svg`,{width:44,height:44,viewBox:`0 0 44 44`,role:`img`,"aria-label":`Attestation coverage ${Math.round(n*100)} percent — ${e} of ${t} reports`,children:[(0,w.jsx)(`circle`,{cx:`22`,cy:`22`,r:`15.5`,fill:`none`,stroke:`var(--color-border)`,strokeWidth:`4.5`}),(0,w.jsx)(`circle`,{cx:`22`,cy:`22`,r:`15.5`,fill:`none`,strokeWidth:`4.5`,strokeLinecap:`round`,strokeDasharray:`${r*n} ${r}`,transform:`rotate(-90 22 22)`,style:{stroke:n>=1?A:E,transition:`stroke-dasharray 200ms ease`}}),(0,w.jsxs)(`text`,{x:`22`,y:`22`,textAnchor:`middle`,dominantBaseline:`central`,fontSize:`11`,fontWeight:`700`,fill:`var(--color-text-primary)`,style:{fontVariantNumeric:`tabular-nums`},children:[Math.round(n*100),`%`]})]})}function K({days:e}){let t=Math.min(e/130,1)*126;return(0,w.jsxs)(`svg`,{width:128,height:12,viewBox:`0 0 128 12`,"aria-hidden":`true`,children:[(0,w.jsx)(`rect`,{x:`1`,y:`4`,width:126,height:`4`,rx:`2`,fill:`var(--color-border)`}),(0,w.jsx)(`rect`,{x:`1`,y:`4`,width:Math.max(t,2),height:`4`,rx:`2`,style:{fill:e>=90?O:M}}),(0,w.jsx)(`line`,{x1:88.23076923076923,y1:`1`,x2:88.23076923076923,y2:`11`,stroke:`var(--color-text-secondary)`,strokeWidth:`1`,strokeDasharray:`2 1.5`})]})}function q({personId:e,personName:t,zoneId:n,decision:r,onToggle:i}){let a=P[n],o=F[a.kind],s=r===`executed`,c=r===`revoke`,l=a.tier===`standard`?``:` isSensitive`,d=s?`revoked`:c?`queued for revocation`:`kept`;return(0,w.jsxs)(`button`,{type:`button`,className:`zoneChip${c?` isRevoke`:``}${s?` isExecuted`:``}${l}`,"aria-pressed":c,disabled:s,title:`${a.label} · ${a.holders} holders · ${a.doors} doors`,"aria-label":`${n} for ${t} — ${d}. ${s?`Revocation executed.`:c?`Click to keep.`:`Click to queue revocation.`}`,onClick:()=>i(e,n),children:[(0,w.jsx)(`span`,{className:`zoneGlyphBox`,children:(0,w.jsx)(o,{size:12,strokeWidth:2,"aria-hidden":`true`})}),(0,w.jsx)(`span`,{className:`zoneChipLabel`,children:n}),c&&(0,w.jsx)(u,{size:11,strokeWidth:2.6,"aria-hidden":`true`}),s&&(0,w.jsx)(y,{size:11,strokeWidth:2.6,"aria-hidden":`true`})]})}function J({person:e,isAttested:t,chipDecisions:n,revokesQueued:r,onToggleChip:i,onToggleAttest:a}){let o=t?`Attested`:r>0?`Attest · ${r} revoke${r===1?``:`s`}`:`Attest`;return(0,w.jsxs)(`div`,{className:`personRow${t?` isAttested`:``}`,role:`group`,"aria-label":`${e.name}, ${e.title}, badge ${e.badgeId}, last badge-in ${e.lastIn}`,children:[(0,w.jsxs)(`div`,{className:`personIdent`,children:[(0,w.jsx)(`span`,{className:`personName`,children:e.name}),(0,w.jsxs)(`span`,{className:`personTitle`,children:[e.title,` · `,(0,w.jsx)(`span`,{className:`personBadgeId`,children:e.badgeId})]})]}),(0,w.jsx)(`div`,{className:`chipRail`,children:e.zoneIds.length===0?(0,w.jsx)(`span`,{className:`chipEmpty`,children:`No badge groups — escorted access only`}):e.zoneIds.map(t=>(0,w.jsx)(q,{personId:e.id,personName:e.name,zoneId:t,decision:n.get(`${e.id}:${t}`),onToggle:i},t))}),(0,w.jsxs)(`div`,{className:`personTrail`,children:[(0,w.jsx)(`span`,{className:`lastIn${e.isStale===!0?` isStale`:``}`,children:e.lastIn}),(0,w.jsxs)(`button`,{type:`button`,className:`attestBtn`,"aria-pressed":t,onClick:()=>a(e.id),children:[t&&(0,w.jsx)(y,{size:13,strokeWidth:2.6,"aria-hidden":`true`}),o]})]})]})}function Y({orphan:e,status:t,onQueue:n,onDismiss:i,onUndo:a}){let o=e.icon;return t===`open`?(0,w.jsxs)(`div`,{className:`orphanRow`,children:[(0,w.jsx)(`span`,{className:`sevSpine ${e.severity}`,"aria-hidden":`true`}),(0,w.jsx)(`span`,{className:`orphanGlyph ${e.severity}`,"aria-hidden":`true`,children:(0,w.jsx)(o,{size:17,strokeWidth:2})}),(0,w.jsxs)(`div`,{className:`orphanBody`,children:[(0,w.jsxs)(`div`,{className:`orphanTitleRow`,children:[(0,w.jsx)(`span`,{className:`orphanTitle`,children:e.title}),(0,w.jsx)(`span`,{className:`detectorTag`,children:e.detector})]}),(0,w.jsx)(`span`,{className:`orphanDetail`,children:e.detail}),(0,w.jsx)(`div`,{className:`orphanZones`,children:e.zoneIds.map(e=>{let t=P[e],n=F[t.kind];return(0,w.jsxs)(`span`,{className:`zoneStatic`,title:t.label,children:[(0,w.jsx)(n,{size:10,strokeWidth:2,"aria-hidden":`true`}),e]},e)})})]}),(0,w.jsxs)(`div`,{className:`dormancyWrap`,children:[(0,w.jsx)(K,{days:e.dormantDays}),(0,w.jsxs)(`span`,{className:`dormancyLabel num`,children:[e.dormantDays,`d dormant · 90d policy`]})]}),(0,w.jsxs)(`div`,{className:`orphanActions`,children:[(0,w.jsxs)(`button`,{type:`button`,className:`queueBtn`,"aria-label":`Queue revocation: ${e.action} — ${e.grantCount} grant${e.grantCount===1?``:`s`}`,onClick:()=>n(e.id),children:[(0,w.jsx)(r,{size:12,strokeWidth:2.2,"aria-hidden":`true`}),`Queue revoke`]}),(0,w.jsx)(`button`,{type:`button`,className:`dismissBtn`,"aria-label":`Dismiss finding: ${e.title}`,onClick:()=>i(e.id),children:`Dismiss`})]})]}):(0,w.jsxs)(`div`,{className:`orphanRow isResolved`,children:[(0,w.jsx)(`span`,{className:`sevSpine ${e.severity}`,"aria-hidden":`true`}),(0,w.jsx)(`span`,{className:`resolvedText`,children:(0,w.jsx)(`span`,{className:`strike`,children:e.title})}),(0,w.jsx)(`span`,{className:`resolvedState ${t}`,children:t===`queued`?`In batch`:t===`dismissed`?`Dismissed`:`Revoked`}),t!==`executed`&&(0,w.jsxs)(`button`,{type:`button`,className:`undoBtn`,onClick:()=>a(e.id),children:[(0,w.jsx)(f,{size:12,strokeWidth:2.2,"aria-hidden":`true`}),`Undo`]})]})}function ie({items:e,grantTotal:t,groupTotal:n,batches:i,onRemove:o,onExecute:s}){return(0,w.jsxs)(`div`,{className:`trayFill`,children:[(0,w.jsxs)(`div`,{className:`trayHead`,children:[(0,w.jsxs)(`div`,{className:`trayTitleRow`,children:[(0,w.jsx)(r,{size:15,strokeWidth:2.2,"aria-hidden":`true`}),(0,w.jsx)(`h2`,{className:`trayTitle`,children:`Revocation batch`}),(0,w.jsx)(`span`,{className:`trayCountPill${e.length===0?` isEmpty`:``} num`,children:e.length})]}),(0,w.jsx)(`span`,{className:`trayRollup`,children:e.length===0?`Nothing queued`:`${t} grant${t===1?``:`s`} across ${n} badge group${n===1?``:`s`}`})]}),(0,w.jsx)(`div`,{className:`trayScroll`,children:e.length===0?(0,w.jsx)(`div`,{className:`trayEmpty`,children:`Flip a badge-group chip to revoke, or queue an orphan finding — everything lands here for one auditable execution.`}):e.map(e=>(0,w.jsxs)(`div`,{className:`trayItem`,children:[(0,w.jsxs)(`div`,{className:`trayItemBody`,children:[(0,w.jsx)(`span`,{className:`trayItemTitle`,children:e.title}),(0,w.jsx)(`span`,{className:`trayItemMeta`,children:e.meta})]}),(0,w.jsx)(`button`,{type:`button`,className:`trayRemove`,"aria-label":`Remove from batch: ${e.title}`,onClick:()=>o(e),children:(0,w.jsx)(v,{size:14,strokeWidth:2.2,"aria-hidden":`true`})})]},e.key))}),(0,w.jsxs)(`div`,{className:`trayFoot`,children:[(0,w.jsxs)(`button`,{type:`button`,className:`executeBtn`,disabled:e.length===0,onClick:s,children:[(0,w.jsx)(a,{size:16,strokeWidth:2.2,"aria-hidden":`true`}),`Execute batch`,e.length>0?` (${t})`:``]}),(0,w.jsx)(`span`,{className:`executeHint`,children:`Executions apply at the next reader sync (≤ 5 min) and are logged to the Doorward audit trail.`}),(0,w.jsxs)(`div`,{className:`auditHead`,children:[(0,w.jsx)(a,{size:11,strokeWidth:2.4,"aria-hidden":`true`}),`Audit log — this cycle`]}),(0,w.jsx)(`div`,{children:i.map(e=>(0,w.jsxs)(`div`,{className:`auditRow`,children:[(0,w.jsx)(`span`,{className:`auditBatchId`,children:e.id}),(0,w.jsxs)(`span`,{className:`auditText`,children:[e.when,` · `,e.grants,` grant`,e.grants===1?``:`s`,` ·`,` `,e.groups,` group`,e.groups===1?``:`s`,` · `,e.by]}),e.isSession&&(0,w.jsx)(`span`,{className:`auditNew`,children:`New`})]},e.id))})]})]})}function X(){let e=te(`(max-width: 760px)`),[t,n]=(0,C.useState)(()=>new Set(re)),[i,o]=(0,C.useState)(()=>new Map),[s,c]=(0,C.useState)(()=>Object.fromEntries(z.map(e=>[e.id,`open`]))),[l,u]=(0,C.useState)([]),[d,f]=(0,C.useState)(``),p=t.size,h=Math.round(p/R*100),g=z.filter(e=>s[e.id]===`open`).length,_=(0,C.useMemo)(()=>{let e=[];for(let t of z)s[t.id]===`queued`&&e.push({key:`orphan:${t.id}`,title:t.action,meta:`${t.detector} · ${t.zoneIds.join(`, `)} · ${t.grantCount} grant${t.grantCount===1?``:`s`}`,grants:t.grantCount,zoneIds:t.zoneIds,source:{kind:`orphan`,orphanId:t.id}});for(let t of L)for(let n of t.zoneIds){let r=`${t.id}:${n}`;i.get(r)===`revoke`&&e.push({key:`chip:${r}`,title:`Revoke ${n} — ${t.name}`,meta:`Manager attestation · badge ${t.badgeId} · 1 grant`,grants:1,zoneIds:[n],source:{kind:`chip`,chipKey:r}})}return e},[s,i]),v=_.reduce((e,t)=>e+t.grants,0),P=new Set(_.flatMap(e=>[...e.zoneIds])).size,F=(0,C.useMemo)(()=>[...l,...V],[l]),K=H+l.reduce((e,t)=>e+t.grants,0),q=e=>{let r=L.find(t=>t.id===e),i=new Set(t),a=!i.has(e);a?i.add(e):i.delete(e);let o=Math.round(i.size/R*100);n(i),f(`${r?.name??e} ${a?`attested`:`attestation withdrawn`}. Coverage ${i.size} of ${R} — ${o} percent.`)},X=(e,t)=>{let n=`${e}:${t}`,r=L.find(t=>t.id===e),a=i.get(n);if(a===`executed`)return;let s=new Map(i);a===`revoke`?(s.delete(n),f(`${t} for ${r?.name??e} kept — removed from batch.`)):(s.set(n,`revoke`),f(`${t} for ${r?.name??e} queued for revocation.`)),o(s)},ae=e=>{let t=B.get(e);c(t=>({...t,[e]:`queued`})),f(t===void 0?`Finding queued.`:`Queued: ${t.action}. ${t.grantCount} grant${t.grantCount===1?``:`s`} added to the batch.`)},oe=e=>{let t=B.get(e);c(t=>({...t,[e]:`dismissed`})),f(t===void 0?`Finding dismissed.`:`Dismissed: ${t.title}.`)},Z=e=>{c(t=>({...t,[e]:`open`})),f(`Finding reopened.`)},se=e=>{if(e.source.kind===`orphan`){Z(e.source.orphanId);return}let t=e.source.chipKey;o(e=>{let n=new Map(e);return n.delete(t),n}),f(`Removed from batch: ${e.title}.`)},ce=()=>{if(_.length===0)return;let e=`R-${U+l.length}`,t={id:e,when:`Jul 9 · 14:0`+Math.min(l.length,9),grants:v,groups:P,by:`S. Ortiz`,isSession:!0};c(e=>{let t={...e};for(let e of z)t[e.id]===`queued`&&(t[e.id]=`executed`);return t}),o(e=>{let t=new Map(e);for(let[e,n]of t)n===`revoke`&&t.set(e,`executed`);return t}),u(e=>[t,...e]),f(`Batch ${e} executed — ${v} grant${v===1?``:`s`} across ${P} badge group${P===1?``:`s`} revoked and logged to the audit trail.`)},Q=(0,w.jsx)(S,{children:(0,w.jsxs)(`div`,{className:`topbar`,children:[(0,w.jsxs)(`div`,{className:`brandBlock`,children:[(0,w.jsx)(`span`,{className:`brandMark`,children:(0,w.jsx)(W,{size:18})}),(0,w.jsx)(`span`,{className:`brandName`,children:`Doorward`})]}),(0,w.jsx)(`span`,{className:`headerDivider`,"aria-hidden":`true`}),(0,w.jsxs)(`div`,{className:`cycleBlock`,children:[(0,w.jsx)(`h1`,{className:`cycleTitle`,children:`Q3 2026 badge review — Meridian Tower campus`}),(0,w.jsx)(`p`,{className:`cycleSub`,children:`Cycle Jul 1–24 · 4 manager queues · 7 badge groups · reader sync 14:00`})]}),(0,w.jsx)(`span`,{className:`cycleChip num`,children:`Due Jul 24 · 15 days left`}),(0,w.jsx)(`span`,{className:`headerSpacer`}),(0,w.jsxs)(`div`,{className:`reviewer`,children:[(0,w.jsx)(`span`,{className:`reviewerAvatar`,"aria-hidden":`true`,children:`SO`}),(0,w.jsxs)(`span`,{children:[(0,w.jsx)(`span`,{className:`reviewerName`,children:`Selma Ortiz`}),` `,(0,w.jsx)(`span`,{className:`reviewerRole`,children:`· Security systems admin`})]})]})]})}),le=(0,w.jsxs)(`div`,{className:`statBand`,role:`group`,"aria-label":`Review cycle status`,children:[(0,w.jsxs)(`div`,{className:`statTile`,children:[(0,w.jsx)(G,{attested:p,total:R}),(0,w.jsxs)(`div`,{className:`statText`,children:[(0,w.jsx)(`span`,{className:`statLabel`,children:`Attestation coverage`}),(0,w.jsxs)(`span`,{className:`statValue`,children:[h,`%`]}),(0,w.jsxs)(`span`,{className:`statHint`,children:[p,` of `,R,` reports attested`]})]})]}),(0,w.jsxs)(`div`,{className:`statTile`,children:[(0,w.jsx)(`span`,{className:`statGlyph`,style:{background:g>0?N:j,color:g>0?M:A},"aria-hidden":`true`,children:(0,w.jsx)(m,{size:17,strokeWidth:2})}),(0,w.jsxs)(`div`,{className:`statText`,children:[(0,w.jsx)(`span`,{className:`statLabel`,children:`Orphaned access`}),(0,w.jsx)(`span`,{className:`statValue`,children:g}),(0,w.jsx)(`span`,{className:`statHint`,children:`open findings · 4 detectors`})]})]}),(0,w.jsxs)(`div`,{className:`statTile`,children:[(0,w.jsx)(`span`,{className:`statGlyph`,style:{background:_.length>0?k:`var(--color-background-muted)`,color:_.length>0?O:`var(--color-text-secondary)`},"aria-hidden":`true`,children:(0,w.jsx)(r,{size:17,strokeWidth:2})}),(0,w.jsxs)(`div`,{className:`statText`,children:[(0,w.jsx)(`span`,{className:`statLabel`,children:`Batch tray`}),(0,w.jsx)(`span`,{className:`statValue`,children:_.length}),(0,w.jsx)(`span`,{className:`statHint`,children:_.length===0?`nothing queued`:`${v} grants · ${P} groups queued`})]})]}),(0,w.jsxs)(`div`,{className:`statTile`,children:[(0,w.jsx)(`span`,{className:`statGlyph`,style:{background:D,color:E},"aria-hidden":`true`,children:(0,w.jsx)(a,{size:17,strokeWidth:2})}),(0,w.jsxs)(`div`,{className:`statText`,children:[(0,w.jsx)(`span`,{className:`statLabel`,children:`Revoked this cycle`}),(0,w.jsx)(`span`,{className:`statValue`,children:K}),(0,w.jsxs)(`span`,{className:`statHint`,children:[`grants across `,F.length,` executed batches`]})]})]})]}),ue=(0,w.jsxs)(`section`,{className:`section`,"aria-label":`Manager attestation queue`,children:[(0,w.jsxs)(`div`,{className:`sectionHead`,children:[(0,w.jsx)(`h2`,{className:`sectionTitle`,children:`Manager attestations`}),(0,w.jsxs)(`span`,{className:`sectionMeta num`,children:[p,`/`,R,` attested · flip a badge-group chip to queue a revocation`]})]}),(0,w.jsx)(`div`,{className:`queuePanel`,children:I.map(e=>{let n=e.reports.filter(e=>t.has(e.id)).length,r=e.reports.length,a=n===r;return(0,w.jsxs)(`div`,{className:`managerGroup`,children:[(0,w.jsxs)(`div`,{className:`managerHead`,children:[(0,w.jsx)(`span`,{className:`managerAvatar`,"aria-hidden":`true`,children:e.initials}),(0,w.jsx)(`span`,{className:`managerName`,children:e.manager}),(0,w.jsxs)(`span`,{className:`managerTeam`,children:[`· `,e.team]}),(0,w.jsx)(`span`,{className:`managerSpacer`}),(0,w.jsxs)(`span`,{className:`managerProgress${a?` isDone`:``}`,children:[a&&(0,w.jsx)(y,{size:13,strokeWidth:2.6,"aria-hidden":`true`}),n,`/`,r,` attested`,(0,w.jsx)(`span`,{className:`managerBar`,"aria-hidden":`true`,children:(0,w.jsx)(`span`,{className:`managerBarFill${a?` isDone`:``}`,style:{width:`${n/r*100}%`}})})]})]}),e.reports.map(e=>{let n=e.zoneIds.filter(t=>i.get(`${e.id}:${t}`)===`revoke`).length;return(0,w.jsx)(J,{person:e,isAttested:t.has(e.id),chipDecisions:i,revokesQueued:n,onToggleChip:X,onToggleAttest:q},e.id)})]},e.id)})})]}),de=(0,w.jsxs)(`section`,{className:`section`,"aria-label":`Orphaned-access detector`,children:[(0,w.jsxs)(`div`,{className:`sectionHead`,children:[(0,w.jsx)(`h2`,{className:`sectionTitle`,children:`Orphaned-access detector`}),(0,w.jsxs)(`span`,{className:`sectionMeta num`,children:[g,` open · scanned nightly against HRIS, reader telemetry, and badge inventory`]})]}),(0,w.jsx)(`div`,{className:`detectorPanel`,children:z.map(e=>(0,w.jsx)(Y,{orphan:e,status:s[e.id],onQueue:ae,onDismiss:oe,onUndo:Z},e.id))})]}),$=(0,w.jsx)(ie,{items:_,grantTotal:v,groupTotal:P,batches:F,onRemove:se,onExecute:ce});return(0,w.jsxs)(`div`,{className:T,children:[(0,w.jsx)(`style`,{children:ne}),(0,w.jsx)(b,{height:`fill`,header:Q,content:(0,w.jsx)(x,{padding:0,children:(0,w.jsxs)(`div`,{className:`mainScroll`,children:[(0,w.jsx)(`div`,{"aria-live":`polite`,className:`visuallyHidden`,children:d}),(0,w.jsxs)(`div`,{className:`mainInner`,children:[le,ue,de,e&&(0,w.jsx)(`section`,{className:`inlineTray`,"aria-label":`Revocation batch tray`,children:$})]})]})}),end:e?void 0:(0,w.jsx)(ee,{width:304,padding:0,hasDivider:!0,label:`Revocation batch tray`,children:$})})]})}export{X as default};