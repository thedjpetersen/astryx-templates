import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-DlKHZgO2.js";import{t as i}from"./Icon-DNqmP2EH.js";import{t as a}from"./archive-C5wKL-sD.js";import{t as o}from"./file-text-Ba54uQGG.js";import{t as ee}from"./funnel-x-DewVbWzU.js";import{t as te}from"./history-DjIPagvy.js";import{t as ne}from"./inbox-gpBKK_K5.js";import{t as re}from"./paperclip-7xXx3kdi.js";import{t as ie}from"./undo-2-FolzW3zf.js";import{b as ae,o as oe}from"./index-CZ0XLKUx.js";import{t as se}from"./Tooltip-XDRm9Z-w.js";import{n as ce,t as le}from"./LayoutContent-CCL91W7X.js";import{t as ue}from"./LayoutHeader-Cy2mWoMf.js";import{t as de}from"./Heading-BBqhYPTB.js";import{t as fe}from"./Badge-0Tj9omHc.js";import{t as s}from"./Button-Cj_m5AlK.js";var c=e(t(),1),l=n(),u=`tpl-audit-evidence-tracker`,d=`light-dark(#3E5C94, #8FB0E8)`,f=`light-dark(rgba(62, 92, 148, 0.10), rgba(143, 176, 232, 0.14))`,p=`light-dark(#15803D, #4ADE80)`,m=`light-dark(rgba(21, 128, 61, 0.12), rgba(74, 222, 128, 0.16))`,h=`light-dark(#B45309, #FBBF24)`,g=`light-dark(rgba(180, 83, 9, 0.12), rgba(251, 191, 36, 0.16))`,_=`light-dark(#0E7490, #22D3EE)`,v=`light-dark(rgba(14, 116, 144, 0.12), rgba(34, 211, 238, 0.14))`,y=`light-dark(#B91C1C, #F87171)`,b=`light-dark(rgba(185, 28, 28, 0.10), rgba(248, 113, 113, 0.14))`,x=`var(--font-family-code, ui-monospace, monospace)`,pe=`
.${u} {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.${u} .aet-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  margin: 0;
  padding: 0;
  text-align: inherit;
  cursor: pointer;
}
.${u} .aet-btn:focus-visible,
.${u} .aet-chipBtn:focus-visible {
  outline: 2px solid ${d};
  outline-offset: -2px;
}
.${u} .aet-mono {
  font-family: ${x};
  font-variant-numeric: tabular-nums;
}

/* ---- Frame: main column + 384px rail; hand-rolled grid so the <=980px
   restack is a real media query, not a squeezed flex row. ---- */
.${u} .aet-frame {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 384px;
  height: 100%;
  min-height: 0;
}
.${u} .aet-main {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}
.${u} .aet-rail {
  min-height: 0;
  border-left: var(--border-width) solid var(--color-border);
  background: var(--color-background-card);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
}

.${u} .aet-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ---- Header stat cluster ---- */
.${u} .aet-headRow {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  width: 100%;
  flex-wrap: wrap;
  row-gap: var(--spacing-2);
}
.${u} .aet-headRow .aet-spring { flex: 1; }
.${u} .aet-brandCol { display: flex; flex-direction: column; min-width: 0; }
.${u} .aet-brandSub {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${u} .aet-headStats {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  row-gap: var(--spacing-1);
  justify-content: flex-end;
}
.${u} .aet-stat { display: flex; align-items: baseline; gap: 5px; }
.${u} .aet-statValue {
  font-size: 15px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}
.${u} .aet-statValue.is-late { color: ${y}; }
.${u} .aet-statLabel { font-size: 11px; color: var(--color-text-secondary); }
.${u} .aet-riskChip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 24px;
  padding-inline: 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${u} .aet-riskChip.is-late { color: ${y}; background: ${b}; }
.${u} .aet-riskChip.is-ok { color: ${p}; background: ${m}; }

/* ---- Section cards ---- */
.${u} .aet-card {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  background: var(--color-background-card);
  overflow: hidden;
}
.${u} .aet-cardHead {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${u} .aet-cardHead .aet-spring { flex: 1; }
.${u} .aet-overline {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

/* ---- PBC matrix: 176px area label + 5 status columns + 72px total.
   Rows 44px, column header 34px. ---- */
.${u} .aet-matrixScroll { overflow-x: auto; }
.${u} .aet-matrix {
  display: grid;
  grid-template-columns: 176px repeat(5, minmax(64px, 1fr)) 72px;
  min-width: 560px;
}
.${u} .aet-mxCorner {
  height: 34px;
  display: flex;
  align-items: center;
  padding-inline: var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.${u} .aet-scoreBarWrap { display: flex; align-items: center; gap: var(--spacing-2); }
.${u} .aet-scoreBarWrap .aet-scorePct {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  width: 32px;
  text-align: right;
  flex-shrink: 0;
}
.${u} .aet-scoreBarWrap .aet-scoreBarTrack { flex: 1; }
.${u} .aet-mxColHead {
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
  padding-inline: 4px;
}
.${u} button.aet-mxColHead:hover { background: var(--color-background-muted); }
.${u} .aet-mxColHead[aria-pressed='true'] {
  color: var(--color-text-primary);
  background: ${f};
  box-shadow: inset 0 -2px 0 0 ${d};
}
.${u} .aet-mxDot { width: 7px; height: 7px; border-radius: 999px; flex-shrink: 0; }
.${u} .aet-mxRowHead {
  width: 100%;
  height: 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1px;
  padding-inline: var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  min-width: 0;
}
.${u} button.aet-mxRowHead:hover { background: var(--color-background-muted); }
.${u} .aet-mxRowHead[aria-pressed='true'] {
  background: ${f};
  box-shadow: inset 2px 0 0 0 ${d};
}
.${u} .aet-mxRowName {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${u} .aet-mxRowOwner {
  font-size: 10.5px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${u} .aet-mxCell {
  position: relative;
  height: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border-bottom: var(--border-width) solid var(--color-border);
  border-left: var(--border-width) solid var(--color-border);
}
.${u} button.aet-mxCell:hover { background: var(--color-background-muted); }
.${u} .aet-mxCell[aria-pressed='true'] {
  background: ${f};
  box-shadow: inset 0 0 0 1px ${d};
}
.${u} .aet-mxCount {
  font-size: 14px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.${u} .aet-mxCount.is-zero { color: var(--color-text-secondary); opacity: 0.55; }
.${u} .aet-mxBar {
  width: 26px;
  height: 3px;
  border-radius: 999px;
  background: var(--color-background-muted);
  overflow: hidden;
}
.${u} .aet-mxBarFill { height: 100%; border-radius: 999px; }
.${u} .aet-mxTotal {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: var(--border-width) solid var(--color-border);
  border-left: var(--border-width) solid var(--color-border);
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${u} .aet-mxFoot {
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${u} .aet-mxFoot.is-label {
  border-left: none;
  justify-content: flex-start;
  padding-inline: var(--spacing-3);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 600;
}
@keyframes aet-pulse {
  0% { background: ${f}; }
  100% { background: transparent; }
}
.${u} .aet-pulse { animation: aet-pulse 900ms ease-out; }

/* ---- Burn-down + ledger two-up ---- */
.${u} .aet-twoUp {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: var(--spacing-4);
  align-items: stretch;
}
.${u} .aet-burnBody { padding: var(--spacing-3) var(--spacing-4) var(--spacing-4); }
.${u} .aet-burnSvg { width: 100%; height: auto; display: block; }
.${u} .aet-legend {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  padding-top: var(--spacing-2);
}
.${u} .aet-legendItem {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--color-text-secondary);
}
.${u} .aet-legendSwatch {
  width: 14px;
  height: 0;
  border-top-width: 2px;
  border-top-style: solid;
}

/* ---- Activity ledger: 34px rows, latest first ---- */
.${u} .aet-ledger {
  list-style: none;
  margin: 0;
  padding: var(--spacing-2) 0;
  overflow-y: auto;
  max-height: 244px;
}
.${u} .aet-ledgerRow {
  min-height: 34px;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding-inline: var(--spacing-4);
  font-size: 12px;
}
.${u} .aet-ledgerWhen {
  font-family: ${x};
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  flex-shrink: 0;
  width: 46px;
}
.${u} .aet-ledgerText {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

/* ---- Owner scorecard: 40px rows, 34px header row ---- */
.${u} .aet-scoreRow {
  display: grid;
  grid-template-columns: minmax(150px, 1.5fr) 62px 62px 52px 62px minmax(110px, 1fr);
  align-items: center;
  height: 40px;
  padding-inline: var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
  column-gap: var(--spacing-2);
}
.${u} .aet-scoreRow:last-child { border-bottom: none; }
.${u} .aet-scoreRow.is-head {
  height: 34px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.${u} .aet-scoreNum {
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
  text-align: right;
}
.${u} .aet-scoreRow.is-head .aet-scoreNum { font-size: 11px; }
.${u} .aet-scoreOwner { min-width: 0; display: flex; flex-direction: column; }
.${u} .aet-scoreOwner b {
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${u} .aet-scoreOwner span {
  font-size: 10.5px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${u} .aet-scoreBarTrack {
  height: 5px;
  border-radius: 999px;
  background: var(--color-background-muted);
  overflow: hidden;
}
.${u} .aet-scoreBarFill {
  height: 100%;
  border-radius: 999px;
  background: ${p};
  transition: width 300ms ease;
}

/* ---- Rail: filter bar / queue (64px rows) / detail ---- */
.${u} .aet-filterBar {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
  flex-wrap: wrap;
}
.${u} .aet-filterBar .aet-spring { flex: 1; }
.${u} .aet-filterChip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 22px;
  padding-inline: 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: ${f};
  color: ${d};
  white-space: nowrap;
}
.${u} .aet-queue { overflow-y: auto; min-height: 0; }
.${u} .aet-queueRow {
  width: 100%;
  min-height: 64px;
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr) auto;
  column-gap: var(--spacing-2);
  align-items: center;
  padding: var(--spacing-2) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${u} .aet-queueRow:hover { background: var(--color-background-muted); }
.${u} .aet-queueRow[aria-pressed='true'] {
  background: ${f};
  box-shadow: inset 2px 0 0 0 ${d};
}
.${u} .aet-qDot { width: 8px; height: 8px; border-radius: 999px; }
.${u} .aet-qMain { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.${u} .aet-qTop { display: flex; align-items: baseline; gap: var(--spacing-2); min-width: 0; }
.${u} .aet-qId {
  font-family: ${x};
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}
.${u} .aet-qTitle {
  font-size: 12.5px;
  font-weight: 550;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.${u} .aet-qMeta {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 11px;
  color: var(--color-text-secondary);
  min-width: 0;
}
.${u} .aet-qArea {
  font-family: ${x};
  font-size: 10px;
  letter-spacing: 0.04em;
}
.${u} .aet-dueChip {
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: var(--color-text-secondary);
}
.${u} .aet-dueChip.is-late { color: ${y}; font-weight: 650; }
.${u} .aet-dueChip.is-today { color: ${h}; font-weight: 650; }
.${u} .aet-emptyQueue {
  padding: var(--spacing-6) var(--spacing-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  text-align: center;
}

/* ---- Detail card ---- */
.${u} .aet-detail {
  border-top: var(--border-width) solid var(--color-border);
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  max-height: 46dvh;
  overflow-y: auto;
}
.${u} .aet-detailTop { display: flex; align-items: center; gap: var(--spacing-2); }
.${u} .aet-detailTop .aet-spring { flex: 1; }
.${u} .aet-statusChip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 22px;
  padding-inline: 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 650;
  white-space: nowrap;
}
.${u} .aet-metaGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2) var(--spacing-3);
  margin: 0;
}
.${u} .aet-metaItem { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.${u} .aet-metaItem dt {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.${u} .aet-metaItem dd {
  margin: 0;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${u} .aet-fileWrap { display: flex; flex-wrap: wrap; gap: var(--spacing-2); }
.${u} .aet-fileChip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding-inline: 8px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  font-size: 11px;
  max-width: 100%;
  min-width: 0;
}
.${u} .aet-fileChip span {
  font-family: ${x};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.${u} .aet-fileChip i {
  font-style: normal;
  font-size: 10px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}
.${u} .aet-note {
  font-size: 12px;
  line-height: 1.45;
  color: var(--color-text-secondary);
  border-left: 2px solid var(--color-border);
  padding-left: var(--spacing-3);
  margin: 0;
}
.${u} .aet-actions { display: flex; gap: var(--spacing-2); flex-wrap: wrap; }
.${u} .aet-reasonWrap { display: flex; flex-wrap: wrap; gap: var(--spacing-2); }
.${u} .aet-chipBtn {
  font: inherit;
  border: var(--border-width) solid var(--color-border);
  background: none;
  cursor: pointer;
  min-height: 40px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  color: var(--color-text-primary);
}
.${u} .aet-chipBtn:hover { background: var(--color-background-muted); }
.${u} .aet-chipBtn[aria-pressed='true'] {
  border-color: ${y};
  color: ${y};
  background: ${b};
  font-weight: 600;
}

/* ---- Responsive: restack at 980; matrix scroller + column drops at 640 ---- */
@media (max-width: 980px) {
  .${u} .aet-frame { display: block; overflow-y: auto; }
  .${u} .aet-main { overflow-y: visible; }
  .${u} .aet-rail {
    border-left: none;
    border-top: var(--border-width) solid var(--color-border);
  }
  .${u} .aet-queue { max-height: 336px; } /* 5 × 64px rows + hairlines */
  .${u} .aet-twoUp { grid-template-columns: minmax(0, 1fr); }
  .${u} .aet-detail { max-height: none; }
}
@media (max-width: 640px) {
  .${u} .aet-scoreRow {
    grid-template-columns: minmax(120px, 1.5fr) 62px 62px 62px minmax(90px, 1fr);
  }
  .${u} .aet-scoreReworks { display: none; }
  .${u} .aet-metaGrid { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .${u} .aet-pulse { animation: none; }
  .${u} .aet-scoreBarFill { transition: none; }
}
`,S=[{id:`REV`,name:`Revenue & Receivables`,owner:`Priya Raman`,ownerRole:`VP Revenue Ops`},{id:`TRS`,name:`Treasury & Cash`,owner:`Marcus Webb`,ownerRole:`Treasurer`},{id:`PAY`,name:`Payroll & Benefits`,owner:`Elena Sotelo`,ownerRole:`Payroll Director`},{id:`INV`,name:`Inventory & Costing`,owner:`Daniel Cho`,ownerRole:`Supply Chain Controller`},{id:`ITG`,name:`ITGC · Access & Change`,owner:`Farah Aziz`,ownerRole:`IT Compliance Lead`},{id:`FXA`,name:`Fixed Assets & Leases`,owner:`Tom Ostrander`,ownerRole:`Controller — Assets`},{id:`CLS`,name:`Financial Close & Reporting`,owner:`Grace Lindqvist`,ownerRole:`Assistant Controller`}],C=new Map(S.map(e=>[e.id,e])),w=[`requested`,`received`,`inReview`,`accepted`,`returned`],T={requested:{label:`Requested`,short:`Req`,color:`var(--color-text-secondary)`,tint:`var(--color-background-muted)`},received:{label:`Received`,short:`Rcvd`,color:_,tint:v},inReview:{label:`In review`,short:`Rev`,color:h,tint:g},accepted:{label:`Accepted`,short:`Acc`,color:p,tint:m},returned:{label:`Returned`,short:`Ret`,color:y,tint:b}},E=[`Mar 2`,`Mar 3`,`Mar 4`,`Mar 5`,`Mar 6`,`Mar 9`,`Mar 10`,`Mar 11`,`Mar 12`,`Mar 13`,`Mar 16`,`Mar 17`,`Mar 18`,`Mar 19`,`Mar 20`,`Mar 23`,`Mar 24`,`Mar 25`,`Mar 26`,`Mar 27`,`Mar 30`,`Mar 31`,`Apr 1`,`Apr 2`,`Apr 3`],D=12,O=19,k=34,A=[34,34,33,32,31,29,28,27,25,23,22,20],j=A[A.length-5],me=`Meridian Foods Co. — FY2026 ICFR audit`,M=`Jordan Ellis`,he=[`Illegible scan`,`Wrong period`,`Incomplete population`,`Missing approval`,`Stale system report`],ge=[{id:`PBC-101`,area:`REV`,controlRef:`REV-01.1`,status:`accepted`,title:`Revenue recognition policy memo + ASC 606 position papers`,sample:`Policy set · 3 documents`,files:[{name:`rev_recognition_memo_fy26.pdf`,size:`1.2 MB`}],requestedOn:`Mar 2`,receivedOn:`Mar 4`,dueIdx:4,reviewer:`Ana Duarte`,reworkCount:0,note:null,remindedOn:null},{id:`PBC-102`,area:`REV`,controlRef:`REV-03.2`,status:`accepted`,title:`Dec/Jan sales cutoff — last 5 invoices of Dec + first 5 of Jan`,sample:`10 of 10 selections`,files:[{name:`cutoff_selections_dec_jan.xlsx`,size:`412 KB`},{name:`bol_scans_batch1.pdf`,size:`8.4 MB`}],requestedOn:`Mar 2`,receivedOn:`Mar 9`,dueIdx:7,reviewer:`Jordan Ellis`,reworkCount:0,note:null,remindedOn:null},{id:`PBC-103`,area:`REV`,controlRef:`REV-04.1`,status:`inReview`,title:`Credit memo register Q4 with approval evidence for memos > $25k`,sample:`12 of 214 memos`,files:[{name:`credit_memo_register_q4.xlsx`,size:`1.8 MB`},{name:`approvals_gt25k.zip`,size:`22.1 MB`}],requestedOn:`Mar 5`,receivedOn:`Mar 16`,dueIdx:13,reviewer:`Jordan Ellis`,reworkCount:0,note:null,remindedOn:null},{id:`PBC-104`,area:`REV`,controlRef:`REV-02.3`,status:`accepted`,title:`AR aging at Dec 31 tied to GL 12000 with reconciliation`,sample:null,files:[{name:`ar_aging_1231.xlsx`,size:`2.6 MB`},{name:`ar_recon_dec.pdf`,size:`190 KB`}],requestedOn:`Mar 2`,receivedOn:`Mar 5`,dueIdx:5,reviewer:`Ravi Menon`,reworkCount:0,note:null,remindedOn:null},{id:`PBC-105`,area:`REV`,controlRef:`REV-05.2`,status:`requested`,title:`SSP analysis refresh for bundled arrangements (FY24–FY26 comparative)`,sample:null,files:[],requestedOn:`Mar 9`,receivedOn:null,dueIdx:10,reviewer:null,reworkCount:0,note:`Revenue Ops flagged a dependency on the pricing team refresh; no revised ETA yet.`,remindedOn:null},{id:`PBC-106`,area:`REV`,controlRef:`REV-03.4`,status:`received`,title:`Manual journal entries to revenue accounts in the close window (Dec 28 – Jan 8)`,sample:`All 17 entries over $50k`,files:[{name:`manual_jes_rev_close.xlsx`,size:`640 KB`}],requestedOn:`Mar 10`,receivedOn:`Mar 17`,dueIdx:14,reviewer:null,reworkCount:0,note:null,remindedOn:null},{id:`PBC-107`,area:`TRS`,controlRef:`TRS-01.2`,status:`accepted`,title:`Bank confirmations — all 9 operating and sweep accounts`,sample:`9 of 9 accounts`,files:[{name:`confirmation_control_sheet.pdf`,size:`480 KB`}],requestedOn:`Mar 2`,receivedOn:`Mar 6`,dueIdx:6,reviewer:`Ana Duarte`,reworkCount:0,note:null,remindedOn:null},{id:`PBC-108`,area:`TRS`,controlRef:`TRS-02.1`,status:`accepted`,title:`December bank reconciliations with outstanding-item aging`,sample:`Main operating account`,files:[{name:`bank_rec_dec_operating.xlsx`,size:`310 KB`}],requestedOn:`Mar 3`,receivedOn:`Mar 9`,dueIdx:7,reviewer:`Jordan Ellis`,reworkCount:0,note:null,remindedOn:null},{id:`PBC-109`,area:`TRS`,controlRef:`TRS-03.3`,status:`inReview`,title:`FX forward contract register + Dec 31 mark-to-market support`,sample:`All 14 open contracts`,files:[{name:`fx_forward_register.xlsx`,size:`220 KB`},{name:`mtm_dec31_chatham.pdf`,size:`2.9 MB`}],requestedOn:`Mar 6`,receivedOn:`Mar 13`,dueIdx:12,reviewer:`Ana Duarte`,reworkCount:0,note:null,remindedOn:null},{id:`PBC-110`,area:`TRS`,controlRef:`TRS-04.1`,status:`requested`,title:`Debt covenant compliance certificates Q2–Q4 with bank acknowledgements`,sample:null,files:[],requestedOn:`Mar 11`,receivedOn:null,dueIdx:14,reviewer:null,reworkCount:0,note:null,remindedOn:null},{id:`PBC-111`,area:`PAY`,controlRef:`PAY-01.1`,status:`accepted`,title:`Payroll register to GL tie-out — July and December cycles`,sample:`2 of 24 cycles`,files:[{name:`payroll_gl_tieout_jul_dec.xlsx`,size:`940 KB`}],requestedOn:`Mar 3`,receivedOn:`Mar 6`,dueIdx:6,reviewer:`Ravi Menon`,reworkCount:0,note:null,remindedOn:null},{id:`PBC-112`,area:`PAY`,controlRef:`PAY-02.4`,status:`accepted`,title:`New-hire onboarding approvals — 8 selections with signed offer + I-9`,sample:`8 of 112 hires`,files:[{name:`newhire_selections_fy26.zip`,size:`14.7 MB`}],requestedOn:`Mar 4`,receivedOn:`Mar 10`,dueIdx:8,reviewer:`Ana Duarte`,reworkCount:0,note:null,remindedOn:null},{id:`PBC-113`,area:`PAY`,controlRef:`PAY-03.2`,status:`received`,title:`Termination access-removal evidence for 6 December leavers`,sample:`6 of 6 leavers`,files:[{name:`term_access_removal_dec.xlsx`,size:`96 KB`}],requestedOn:`Mar 9`,receivedOn:`Mar 16`,dueIdx:13,reviewer:null,reworkCount:0,note:null,remindedOn:null},{id:`PBC-114`,area:`PAY`,controlRef:`PAY-04.1`,status:`returned`,title:`Bonus accrual calculation with CFO approval — Dec 31 balance $2.41M`,sample:null,files:[{name:`bonus_accrual_dec31_v1.xlsx`,size:`1.1 MB`}],requestedOn:`Mar 5`,receivedOn:`Mar 12`,dueIdx:11,reviewer:`Jordan Ellis`,reworkCount:1,note:`Returned Mar 16: population ties to the GL, but the workbook is missing the CFO approval tab referenced in the control description.`,remindedOn:null},{id:`PBC-115`,area:`INV`,controlRef:`INV-01.2`,status:`accepted`,title:`Physical count instructions + count-sheet index — Reno and Camden DCs`,sample:null,files:[{name:`count_instructions_fy26.pdf`,size:`2.2 MB`}],requestedOn:`Mar 2`,receivedOn:`Mar 5`,dueIdx:5,reviewer:`Ravi Menon`,reworkCount:0,note:null,remindedOn:null},{id:`PBC-116`,area:`INV`,controlRef:`INV-02.1`,status:`accepted`,title:`Count variance resolution log — Reno DC (23 variances > $5k)`,sample:`23 of 23 variances`,files:[{name:`variance_log_reno.xlsx`,size:`350 KB`}],requestedOn:`Mar 4`,receivedOn:`Mar 11`,dueIdx:9,reviewer:`Jordan Ellis`,reworkCount:0,note:null,remindedOn:null},{id:`PBC-117`,area:`INV`,controlRef:`INV-03.3`,status:`inReview`,title:`Standard cost roll-forward FY25→FY26 with PPV bridge by commodity`,sample:`Top 20 SKUs · 84% of value`,files:[{name:`std_cost_rollforward.xlsx`,size:`3.4 MB`},{name:`ppv_bridge_fy26.pptx`,size:`5.2 MB`}],requestedOn:`Mar 6`,receivedOn:`Mar 13`,dueIdx:13,reviewer:`Ravi Menon`,reworkCount:0,note:null,remindedOn:null},{id:`PBC-118`,area:`INV`,controlRef:`INV-04.2`,status:`received`,title:`E&O reserve model Dec 31 with demand-signal inputs from S&OP`,sample:null,files:[{name:`eo_reserve_model_dec31.xlsx`,size:`4.8 MB`}],requestedOn:`Mar 10`,receivedOn:`Mar 17`,dueIdx:14,reviewer:null,reworkCount:0,note:null,remindedOn:null},{id:`PBC-119`,area:`INV`,controlRef:`INV-05.1`,status:`requested`,title:`In-transit inventory support — 12 shipments open at Dec 31 (BOL + receiving)`,sample:`12 of 12 shipments`,files:[],requestedOn:`Mar 12`,receivedOn:null,dueIdx:15,reviewer:null,reworkCount:0,note:null,remindedOn:null},{id:`PBC-120`,area:`ITG`,controlRef:`ITG-01.1`,status:`accepted`,title:`AD quarterly access review certifications Q1–Q4 (Sailpoint exports)`,sample:`4 of 4 quarters`,files:[{name:`sailpoint_certs_q1_q4.zip`,size:`9.3 MB`}],requestedOn:`Mar 3`,receivedOn:`Mar 9`,dueIdx:7,reviewer:`Katya Blum`,reworkCount:0,note:null,remindedOn:null},{id:`PBC-121`,area:`ITG`,controlRef:`ITG-02.3`,status:`requested`,title:`Privileged-access roster with quarterly recert evidence — Oracle ERP + Snowflake`,sample:null,files:[],requestedOn:`Mar 5`,receivedOn:null,dueIdx:9,reviewer:null,reworkCount:0,note:`Re-requested after scope clarification — now includes Snowflake SYSADMIN role grants alongside the domain-admin roster.`,remindedOn:null},{id:`PBC-122`,area:`ITG`,controlRef:`ITG-03.2`,status:`inReview`,title:`Change tickets for 25 ERP transports sampled from the FY26 release log`,sample:`25 of 412 transports`,files:[{name:`transport_sample_25.xlsx`,size:`780 KB`},{name:`servicenow_chg_export.csv`,size:`1.6 MB`}],requestedOn:`Mar 4`,receivedOn:`Mar 12`,dueIdx:12,reviewer:`Katya Blum`,reworkCount:0,note:null,remindedOn:null},{id:`PBC-123`,area:`ITG`,controlRef:`ITG-04.1`,status:`accepted`,title:`Batch job failure monitoring — December Control-M incident queue`,sample:null,files:[{name:`controlm_incidents_dec.xlsx`,size:`270 KB`}],requestedOn:`Mar 4`,receivedOn:`Mar 10`,dueIdx:8,reviewer:`Katya Blum`,reworkCount:0,note:null,remindedOn:null},{id:`PBC-124`,area:`ITG`,controlRef:`ITG-05.4`,status:`received`,title:`Firewall rule recertification — DMZ segment, H2 review workpapers`,sample:null,files:[{name:`fw_recert_dmz_h2.pdf`,size:`3.1 MB`}],requestedOn:`Mar 11`,receivedOn:`Mar 17`,dueIdx:15,reviewer:null,reworkCount:0,note:null,remindedOn:null},{id:`PBC-125`,area:`ITG`,controlRef:`ITG-02.5`,status:`returned`,title:`Terminated-user access removal within 24h — 15 selections across ERP, AD, and Okta`,sample:`15 of 61 leavers`,files:[{name:`term_access_evidence_v2.zip`,size:`18.9 MB`}],requestedOn:`Mar 4`,receivedOn:`Mar 13`,dueIdx:13,reviewer:`Katya Blum`,reworkCount:2,note:`Second return Mar 17: Okta deprovision timestamps still missing for 4 of 15 selections; AD and ERP evidence is now complete.`,remindedOn:null},{id:`PBC-126`,area:`FXA`,controlRef:`FXA-01.1`,status:`accepted`,title:`FY26 capex additions listing tied to the fixed asset register`,sample:`Additions ≥ $10k`,files:[{name:`capex_additions_fy26.xlsx`,size:`1.5 MB`}],requestedOn:`Mar 3`,receivedOn:`Mar 9`,dueIdx:6,reviewer:`Ravi Menon`,reworkCount:0,note:null,remindedOn:null},{id:`PBC-127`,area:`FXA`,controlRef:`FXA-02.2`,status:`accepted`,title:`Lease modification memos — 3 amended DC leases with ASC 842 remeasurement`,sample:`3 of 3 amendments`,files:[{name:`lease_mod_memos.pdf`,size:`2.0 MB`}],requestedOn:`Mar 5`,receivedOn:`Mar 11`,dueIdx:9,reviewer:`Jordan Ellis`,reworkCount:0,note:null,remindedOn:null},{id:`PBC-128`,area:`FXA`,controlRef:`FXA-03.1`,status:`inReview`,title:`Impairment triggers assessment — Camden line 4 idle equipment ($3.8M NBV)`,sample:null,files:[{name:`impairment_assessment_camden.docx`,size:`410 KB`},{name:`idle_asset_register.xlsx`,size:`150 KB`}],requestedOn:`Mar 9`,receivedOn:`Mar 16`,dueIdx:14,reviewer:`Jordan Ellis`,reworkCount:0,note:null,remindedOn:null},{id:`PBC-129`,area:`FXA`,controlRef:`FXA-04.3`,status:`requested`,title:`CIP aging with capitalization-readiness notes at Dec 31`,sample:null,files:[],requestedOn:`Mar 12`,receivedOn:null,dueIdx:16,reviewer:null,reworkCount:0,note:null,remindedOn:null},{id:`PBC-130`,area:`CLS`,controlRef:`CLS-01.2`,status:`accepted`,title:`Close checklist sign-offs — December (Workiva export with reviewer stamps)`,sample:null,files:[{name:`close_checklist_dec.pdf`,size:`860 KB`}],requestedOn:`Mar 3`,receivedOn:`Mar 10`,dueIdx:7,reviewer:`Ana Duarte`,reworkCount:0,note:null,remindedOn:null},{id:`PBC-131`,area:`CLS`,controlRef:`CLS-02.1`,status:`accepted`,title:`Account reconciliation index Dec 31 — status by owner from Blackline`,sample:null,files:[{name:`blackline_recon_index.xlsx`,size:`520 KB`}],requestedOn:`Mar 4`,receivedOn:`Mar 11`,dueIdx:8,reviewer:`Jordan Ellis`,reworkCount:0,note:null,remindedOn:null},{id:`PBC-132`,area:`CLS`,controlRef:`CLS-03.4`,status:`inReview`,title:`Top-side journal entries FY26 with business rationale and CFO approval`,sample:`All 6 top-side entries`,files:[{name:`topside_je_support.xlsx`,size:`520 KB`}],requestedOn:`Mar 10`,receivedOn:`Mar 16`,dueIdx:13,reviewer:`Ana Duarte`,reworkCount:0,note:null,remindedOn:null},{id:`PBC-133`,area:`CLS`,controlRef:`CLS-04.1`,status:`received`,title:`Subsequent events support — legal letters + cash receipts through Mar 13`,sample:null,files:[{name:`subsequent_events_pack.pdf`,size:`6.7 MB`}],requestedOn:`Mar 11`,receivedOn:`Mar 16`,dueIdx:15,reviewer:null,reworkCount:0,note:null,remindedOn:null},{id:`PBC-134`,area:`CLS`,controlRef:`CLS-05.2`,status:`requested`,title:`Management representation letter draft — FY26 tailoring vs prior year`,sample:null,files:[],requestedOn:`Mar 13`,receivedOn:null,dueIdx:17,reviewer:null,reworkCount:0,note:null,remindedOn:null}],_e=[{id:5,when:`Mar 18`,text:`PBC-131 accepted by J. Ellis — recon index ties to Blackline`,undoable:!1},{id:4,when:`Mar 17`,text:`PBC-125 returned to F. Aziz — Okta timestamps missing (2nd return)`,undoable:!1},{id:3,when:`Mar 17`,text:`PBC-124 received from F. Aziz — firewall recert workpapers`,undoable:!1},{id:2,when:`Mar 16`,text:`PBC-114 returned to E. Sotelo — CFO approval tab missing`,undoable:!1},{id:1,when:`Mar 16`,text:`PBC-103 moved to review — assigned J. Ellis`,undoable:!1}];function ve(e){let t={};for(let e of S)t[e.id]={requested:0,received:0,inReview:0,accepted:0,returned:0};for(let n of e)t[n.area][n.status]+=1;return t}function N(e){return e.dueIdx<D&&e.status!==`accepted`}function ye(e){let t=(j-e)/5;if(t<=0)return{velocity:0,projIdx:E.length-1,clamped:!0,slipBd:99};let n=D+Math.ceil(e/t);return{velocity:t,projIdx:Math.min(n,E.length-1),clamped:n>E.length-1,slipBd:n-O}}function be(e){return N(e)?{text:`Late · ${E[e.dueIdx]}`,cls:`aet-dueChip is-late`}:e.dueIdx===D&&e.status!==`accepted`?{text:`Due today`,cls:`aet-dueChip is-today`}:{text:`Due ${E[e.dueIdx]}`,cls:`aet-dueChip`}}function P(e){let[t,...n]=e.split(` `);return n.length>0?`${t[0]}. ${n.join(` `)}`:e}function xe(){return(0,l.jsxs)(`svg`,{width:`26`,height:`26`,viewBox:`0 0 26 26`,"aria-hidden":!0,focusable:`false`,children:[(0,l.jsx)(`rect`,{x:`1`,y:`1`,width:`24`,height:`24`,rx:`7`,fill:d}),(0,l.jsx)(`path`,{d:`M7.5 13.4 L11.2 17 L18.5 8.8`,fill:`none`,stroke:`light-dark(#FFFFFF, #101A2C)`,strokeWidth:`2.4`,strokeLinecap:`round`,strokeLinejoin:`round`}),(0,l.jsx)(`path`,{d:`M7.5 20.4 H18.5`,fill:`none`,stroke:`light-dark(rgba(255,255,255,0.55), rgba(16,26,44,0.55))`,strokeWidth:`1.6`,strokeLinecap:`round`})]})}var F=640,I=200,L=30,R=632,z=12,B=158;function V(e){return L+e/(E.length-1)*(R-L)}function H(e){return z+(1-e/k)*(B-z)}var U=[{idx:0,label:`Mar 2`},{idx:5,label:`Mar 9`},{idx:10,label:`Mar 16`},{idx:15,label:`Mar 23`},{idx:19,label:`Mar 27`},{idx:24,label:`Apr 3`}];function Se({remaining:e,projIdx:t,clamped:n}){let r=[...A.map((e,t)=>`${V(t)},${H(e)}`),`${V(D)},${H(e)}`].join(` `),i=t<=O&&!n,a=n?`${E[t]}+`:E[t];return(0,l.jsxs)(`svg`,{className:`aet-burnSvg`,viewBox:`0 0 ${F} ${I}`,role:`img`,"aria-label":`Burn-down: ${e} of ${k} requests open; projected finish ${a} vs the Mar 27 target`,children:[[0,10,20,30].map(e=>(0,l.jsxs)(`g`,{children:[(0,l.jsx)(`line`,{x1:L,x2:R,y1:H(e),y2:H(e),stroke:`var(--color-border)`,strokeWidth:`1`}),(0,l.jsx)(`text`,{x:L-6,y:H(e)+3,textAnchor:`end`,fontSize:`9`,fill:`var(--color-text-secondary)`,children:e})]},e)),U.map(e=>(0,l.jsxs)(`g`,{children:[(0,l.jsx)(`line`,{x1:V(e.idx),x2:V(e.idx),y1:B,y2:162,stroke:`var(--color-border)`,strokeWidth:`1`}),(0,l.jsx)(`text`,{x:V(e.idx),y:173,textAnchor:`middle`,fontSize:`9`,fill:`var(--color-text-secondary)`,children:e.label})]},e.idx)),(0,l.jsx)(`line`,{x1:V(O),x2:V(O),y1:z-2,y2:B,stroke:y,strokeWidth:`1`,strokeDasharray:`2 3`,opacity:`0.7`}),(0,l.jsx)(`text`,{x:V(O),y:z-3,textAnchor:`middle`,fontSize:`9`,fontWeight:`600`,fill:y,children:`Target`}),(0,l.jsx)(`line`,{x1:V(0),y1:H(k),x2:V(O),y2:H(0),stroke:`var(--color-text-secondary)`,strokeWidth:`1.5`,strokeDasharray:`5 4`,opacity:`0.55`}),(0,l.jsx)(`line`,{x1:V(D),y1:H(e),x2:V(t),y2:H(0),stroke:d,strokeWidth:`1.5`,strokeDasharray:`4 4`}),(0,l.jsx)(`polyline`,{points:r,fill:`none`,stroke:d,strokeWidth:`2`,strokeLinejoin:`round`,strokeLinecap:`round`}),(0,l.jsx)(`circle`,{cx:V(D),cy:H(e),r:`4`,fill:d}),(0,l.jsxs)(`text`,{x:V(D)+7,y:H(e)-6,fontSize:`10`,fontWeight:`650`,fill:`var(--color-text-primary)`,children:[e,` open`]}),(0,l.jsx)(`circle`,{cx:V(t),cy:H(0),r:`3.5`,fill:`none`,stroke:i?p:y,strokeWidth:`1.8`}),(0,l.jsx)(`text`,{x:Math.min(V(t),R-34),y:H(0)-8,textAnchor:`middle`,fontSize:`9.5`,fontWeight:`650`,fill:i?p:y,children:a})]})}function W(){let[e,t]=(0,c.useState)(ge),[n,f]=(0,c.useState)({area:null,status:`inReview`}),[p,m]=(0,c.useState)(`PBC-103`),[_,v]=(0,c.useState)(!1),[x,A]=(0,c.useState)(null),[j,F]=(0,c.useState)(_e),[I,L]=(0,c.useState)(null),[R,z]=(0,c.useState)({}),B=ve(e),V=e.reduce((e,t)=>e+ +(t.status===`accepted`),0),H=k-V,U=e.reduce((e,t)=>e+ +!!N(t),0),W=Math.round(V/k*100),{velocity:Ce,projIdx:G,clamped:K,slipBd:we}=ye(H),q=we<=0,Te=K?`${E[G]}+`:E[G],Ee=O-D,J={requested:0,received:0,inReview:0,accepted:0,returned:0};for(let e of S)for(let t of w)J[t]+=B[e.id][t];let Y=e.filter(e=>(n.area==null||e.area===n.area)&&(n.status==null||e.status===n.status)).sort((e,t)=>{let n=Number(N(t))-Number(N(e));return n===0?e.dueIdx===t.dueIdx?e.id.localeCompare(t.id):e.dueIdx-t.dueIdx:n}),X=e.find(e=>e.id===p)??null,Z=X==null?void 0:C.get(X.area),De=(e,t)=>{F(n=>[{id:n[0].id+1,when:`Mar 18`,text:e,undoable:t},...n])},Oe=(e,t,n)=>{z(r=>({...r,[`${e}:${t}`]:(r[`${e}:${t}`]??0)+1,[`${e}:${n}`]:(r[`${e}:${n}`]??0)+1}))},Q=(n,r,i,a)=>{let o=e.find(e=>e.id===n);o!=null&&(t(e=>e.map(e=>e.id===n?{...e,...r}:e)),r.status!=null&&r.status!==o.status&&Oe(o.area,o.status,r.status),De(i,a),a&&L(o))},ke=e=>{m(e),v(!1),A(null)},Ae=()=>{X!=null&&(Q(X.id,{status:`accepted`,reviewer:M},`${X.id} accepted by ${P(M)} — evidence sufficient`,!0),v(!1),A(null))},je=()=>{X==null||Z==null||x==null||(Q(X.id,{status:`returned`,reviewer:M,reworkCount:X.reworkCount+1,note:`Returned Mar 18: ${x.toLowerCase()} — resubmission requested from ${Z.owner}.`},`${X.id} returned to ${P(Z.owner)} — ${x.toLowerCase()}`,!0),v(!1),A(null))},Me=()=>{X!=null&&Q(X.id,{status:`inReview`,reviewer:M},`${X.id} moved to review — assigned ${P(M)}`,!1)},Ne=()=>{X==null||Z==null||Q(X.id,{remindedOn:`Mar 18`},`Reminder sent to ${P(Z.owner)} for ${X.id}`,!1)},Pe=()=>{X==null||Z==null||Q(X.id,{status:`received`,receivedOn:`Mar 18`},`${X.id} resubmitted by ${P(Z.owner)} — back in Received`,!1)},Fe=()=>{if(I==null)return;let n=I,r=e.find(e=>e.id===n.id);t(e=>e.map(e=>e.id===n.id?n:e)),r!=null&&r.status!==n.status&&Oe(n.area,r.status,n.status),De(`Undo — ${n.id} restored to ${T[n.status].label}`,!1),L(null)},$=(e,t)=>{f(n=>n.area===e&&n.status===t?{area:null,status:null}:{area:e,status:t})},Ie=n.area!=null||n.status!=null,Le=(0,l.jsx)(ue,{hasDivider:!0,children:(0,l.jsxs)(`div`,{className:`aet-headRow`,children:[(0,l.jsx)(xe,{}),(0,l.jsxs)(`div`,{className:`aet-brandCol`,children:[(0,l.jsx)(de,{level:1,children:`Attest — Evidence Tracker`}),(0,l.jsx)(`span`,{className:`aet-brandSub`,children:me})]}),(0,l.jsx)(fe,{label:`Fieldwork`,variant:`info`}),(0,l.jsx)(`div`,{className:`aet-spring`}),(0,l.jsxs)(`div`,{className:`aet-headStats`,children:[(0,l.jsxs)(`div`,{className:`aet-stat`,children:[(0,l.jsxs)(`span`,{className:`aet-statValue`,children:[V,`/`,k]}),(0,l.jsxs)(`span`,{className:`aet-statLabel`,children:[`accepted · `,W,`%`]})]}),(0,l.jsxs)(`div`,{className:`aet-stat`,children:[(0,l.jsx)(`span`,{className:`aet-statValue`,children:H}),(0,l.jsx)(`span`,{className:`aet-statLabel`,children:`open`})]}),(0,l.jsxs)(`div`,{className:`aet-stat`,children:[(0,l.jsx)(`span`,{className:U>0?`aet-statValue is-late`:`aet-statValue`,children:U}),(0,l.jsx)(`span`,{className:`aet-statLabel`,children:`late`})]}),(0,l.jsxs)(`div`,{className:`aet-stat`,children:[(0,l.jsx)(`span`,{className:`aet-statValue`,children:Ee}),(0,l.jsx)(`span`,{className:`aet-statLabel`,children:`bd to close`})]}),(0,l.jsxs)(`span`,{className:q?`aet-riskChip is-ok`:`aet-riskChip is-late`,children:[q?(0,l.jsx)(ae,{size:12,"aria-hidden":!0}):(0,l.jsx)(oe,{size:12,"aria-hidden":!0}),q?`On track · proj ${Te}`:`At risk · proj ${Te} (+${K?`5+`:we} bd)`]})]})]})}),Re=(0,l.jsxs)(`section`,{className:`aet-card`,"aria-label":`PBC matrix by control area and status`,children:[(0,l.jsxs)(`div`,{className:`aet-cardHead`,children:[(0,l.jsx)(`span`,{className:`aet-overline`,children:`PBC matrix — control area × status`}),(0,l.jsx)(`div`,{className:`aet-spring`}),(0,l.jsxs)(r,{type:`supporting`,color:`secondary`,hasTabularNumbers:!0,children:[k,` requests · click a cell to filter the queue`]})]}),(0,l.jsx)(`div`,{className:`aet-matrixScroll`,children:(0,l.jsxs)(`div`,{className:`aet-matrix`,children:[(0,l.jsx)(`div`,{className:`aet-mxCorner`,children:`Control area`}),w.map(e=>(0,l.jsxs)(`button`,{type:`button`,className:`aet-btn aet-mxColHead`,"aria-pressed":n.status===e&&n.area==null,"aria-label":`Filter queue to ${T[e].label} (${J[e]})`,onClick:()=>$(null,e),children:[(0,l.jsx)(`span`,{className:`aet-mxDot`,style:{background:T[e].color}}),T[e].label]},e)),(0,l.jsx)(`div`,{className:`aet-mxColHead`,children:`Total`}),S.map(e=>{let t=w.reduce((t,n)=>t+B[e.id][n],0);return(0,l.jsxs)(`div`,{style:{display:`contents`},children:[(0,l.jsxs)(`button`,{type:`button`,className:`aet-btn aet-mxRowHead`,"aria-pressed":n.area===e.id&&n.status==null,"aria-label":`Filter queue to ${e.name} (${t} requests, owner ${e.owner})`,onClick:()=>$(e.id,null),children:[(0,l.jsx)(`span`,{className:`aet-mxRowName`,children:e.name}),(0,l.jsxs)(`span`,{className:`aet-mxRowOwner`,children:[e.id,` · `,e.owner]})]}),w.map(r=>{let i=B[e.id][r],a=R[`${e.id}:${r}`]??0;return(0,l.jsxs)(`button`,{type:`button`,className:a>0?`aet-btn aet-mxCell aet-pulse`:`aet-btn aet-mxCell`,"aria-pressed":n.area===e.id&&n.status===r,"aria-label":`${e.name}, ${T[r].label}: ${i} ${i===1?`request`:`requests`}`,onClick:()=>$(e.id,r),children:[(0,l.jsx)(`span`,{className:i===0?`aet-mxCount is-zero`:`aet-mxCount`,children:i===0?`–`:i}),(0,l.jsx)(`span`,{className:`aet-mxBar`,"aria-hidden":!0,children:(0,l.jsx)(`span`,{className:`aet-mxBarFill`,style:{width:`${t===0?0:i/t*100}%`,background:T[r].color}})})]},`${e.id}:${r}:${a}`)}),(0,l.jsx)(`div`,{className:`aet-mxTotal`,children:t})]},e.id)}),(0,l.jsx)(`div`,{className:`aet-mxFoot is-label`,children:`All areas`}),w.map(e=>(0,l.jsx)(`div`,{className:`aet-mxFoot`,children:J[e]},e)),(0,l.jsx)(`div`,{className:`aet-mxFoot`,children:k})]})})]}),ze=(0,l.jsxs)(`section`,{className:`aet-card`,"aria-label":`Late-close burn-down`,children:[(0,l.jsxs)(`div`,{className:`aet-cardHead`,children:[(0,l.jsx)(`span`,{className:`aet-overline`,children:`Late-close burn-down`}),(0,l.jsx)(`div`,{className:`aet-spring`}),(0,l.jsx)(r,{type:`supporting`,color:`secondary`,hasTabularNumbers:!0,children:Ce>0?`${Ce.toFixed(1)}/bd pace`:`no pace yet`})]}),(0,l.jsxs)(`div`,{className:`aet-burnBody`,children:[(0,l.jsx)(Se,{remaining:H,projIdx:G,clamped:K}),(0,l.jsxs)(`div`,{className:`aet-legend`,"aria-hidden":!0,children:[(0,l.jsxs)(`span`,{className:`aet-legendItem`,children:[(0,l.jsx)(`span`,{className:`aet-legendSwatch`,style:{borderTopColor:d}}),`Actual open`]}),(0,l.jsxs)(`span`,{className:`aet-legendItem`,children:[(0,l.jsx)(`span`,{className:`aet-legendSwatch`,style:{borderTopColor:`var(--color-text-secondary)`,borderTopStyle:`dashed`}}),`Ideal`]}),(0,l.jsxs)(`span`,{className:`aet-legendItem`,children:[(0,l.jsx)(`span`,{className:`aet-legendSwatch`,style:{borderTopColor:d,borderTopStyle:`dashed`}}),`Projection`]}),(0,l.jsxs)(`span`,{className:`aet-legendItem`,children:[(0,l.jsx)(`span`,{className:`aet-legendSwatch`,style:{borderTopColor:y,borderTopStyle:`dashed`}}),`Mar 27 target`]})]})]})]}),Be=(0,l.jsxs)(`section`,{className:`aet-card`,"aria-label":`Activity ledger`,children:[(0,l.jsxs)(`div`,{className:`aet-cardHead`,children:[(0,l.jsx)(i,{icon:te,size:`sm`,color:`secondary`}),(0,l.jsx)(`span`,{className:`aet-overline`,children:`Activity`}),(0,l.jsx)(`div`,{className:`aet-spring`}),(0,l.jsx)(s,{label:`Undo`,variant:`ghost`,size:`sm`,isDisabled:I==null,onClick:Fe})]}),(0,l.jsx)(`ol`,{className:`aet-ledger`,children:j.map(e=>(0,l.jsxs)(`li`,{className:`aet-ledgerRow`,children:[(0,l.jsx)(`span`,{className:`aet-ledgerWhen`,children:e.when}),(0,l.jsx)(`span`,{className:`aet-ledgerText`,title:e.text,children:e.text}),e.undoable&&e.id===j[0].id&&I!=null&&(0,l.jsx)(i,{icon:ie,size:`sm`,color:`secondary`})]},e.id))})]}),Ve=(0,l.jsxs)(`section`,{className:`aet-card`,"aria-label":`Control-owner scorecard`,children:[(0,l.jsxs)(`div`,{className:`aet-cardHead`,children:[(0,l.jsx)(`span`,{className:`aet-overline`,children:`Control-owner scorecard`}),(0,l.jsx)(`div`,{className:`aet-spring`}),(0,l.jsx)(r,{type:`supporting`,color:`secondary`,children:`derived live from the request set`})]}),(0,l.jsxs)(`div`,{children:[(0,l.jsxs)(`div`,{className:`aet-scoreRow is-head`,"aria-hidden":!0,children:[(0,l.jsx)(`span`,{children:`Owner`}),(0,l.jsx)(`span`,{className:`aet-scoreNum`,children:`Assigned`}),(0,l.jsx)(`span`,{className:`aet-scoreNum`,children:`Accepted`}),(0,l.jsx)(`span`,{className:`aet-scoreNum aet-scoreReworks`,children:`Reworks`}),(0,l.jsx)(`span`,{className:`aet-scoreNum`,children:`Open`}),(0,l.jsx)(`span`,{children:`Complete`})]}),S.map(t=>{let n=e.filter(e=>e.area===t.id),r=n.reduce((e,t)=>e+ +(t.status===`accepted`),0),i=n.reduce((e,t)=>e+t.reworkCount,0),a=n.length-r,o=n.length===0?0:Math.round(r/n.length*100);return(0,l.jsxs)(`div`,{className:`aet-scoreRow`,children:[(0,l.jsxs)(`span`,{className:`aet-scoreOwner`,children:[(0,l.jsx)(`b`,{children:t.owner}),(0,l.jsxs)(`span`,{children:[t.name,` · `,t.ownerRole]})]}),(0,l.jsx)(`span`,{className:`aet-scoreNum`,children:n.length}),(0,l.jsx)(`span`,{className:`aet-scoreNum`,children:r}),(0,l.jsx)(`span`,{className:`aet-scoreNum aet-scoreReworks`,children:i}),(0,l.jsx)(`span`,{className:`aet-scoreNum`,children:a}),(0,l.jsxs)(`span`,{className:`aet-scoreBarWrap`,children:[(0,l.jsx)(`span`,{className:`aet-scoreBarTrack`,role:`img`,"aria-label":`${o}% of ${t.owner}'s requests accepted`,children:(0,l.jsx)(`span`,{className:`aet-scoreBarFill`,style:{width:`${o}%`}})}),(0,l.jsxs)(`span`,{className:`aet-scorePct`,children:[o,`%`]})]})]},t.id)})]})]}),He=(0,l.jsxs)(`div`,{className:`aet-filterBar`,children:[(0,l.jsx)(i,{icon:ne,size:`sm`,color:`secondary`}),(0,l.jsx)(r,{type:`body`,weight:`semibold`,children:`Reviewer queue`}),(0,l.jsx)(r,{type:`supporting`,color:`secondary`,hasTabularNumbers:!0,children:Y.length}),(0,l.jsx)(`div`,{className:`aet-spring`}),n.status!=null&&(0,l.jsx)(`span`,{className:`aet-filterChip`,children:T[n.status].label}),n.area!=null&&(0,l.jsx)(`span`,{className:`aet-filterChip`,children:n.area}),Ie&&(0,l.jsx)(se,{content:`Clear filter`,children:(0,l.jsx)(s,{label:`Clear`,variant:`ghost`,size:`sm`,onClick:()=>f({area:null,status:null})})})]}),Ue=(0,l.jsxs)(`div`,{className:`aet-queue`,role:`list`,"aria-label":`Evidence requests`,children:[Y.length===0&&(0,l.jsxs)(`div`,{className:`aet-emptyQueue`,children:[(0,l.jsx)(i,{icon:ee,size:`md`,color:`secondary`}),(0,l.jsx)(r,{type:`body`,weight:`semibold`,children:`No requests match this cell`}),(0,l.jsx)(r,{type:`supporting`,color:`secondary`,children:`Clear the matrix filter to see the full queue.`}),(0,l.jsx)(s,{label:`Clear filter`,variant:`secondary`,size:`sm`,onClick:()=>f({area:null,status:null})})]}),Y.map(e=>{let t=be(e);return(0,l.jsxs)(`button`,{type:`button`,role:`listitem`,className:`aet-btn aet-queueRow`,"aria-pressed":e.id===p,onClick:()=>ke(e.id),children:[(0,l.jsx)(`span`,{className:`aet-qDot`,style:{background:T[e.status].color},"aria-hidden":!0}),(0,l.jsxs)(`span`,{className:`aet-qMain`,children:[(0,l.jsxs)(`span`,{className:`aet-qTop`,children:[(0,l.jsx)(`span`,{className:`aet-qId`,children:e.id}),(0,l.jsx)(`span`,{className:`aet-qTitle`,children:e.title})]}),(0,l.jsxs)(`span`,{className:`aet-qMeta`,children:[(0,l.jsx)(`span`,{className:`aet-qArea`,children:e.controlRef}),(0,l.jsx)(`span`,{children:C.get(e.area)?.owner}),e.files.length>0&&(0,l.jsxs)(`span`,{children:[(0,l.jsx)(re,{size:10,"aria-hidden":!0,style:{verticalAlign:`-1px`}}),` `,e.files.length]}),e.reworkCount>0&&(0,l.jsxs)(`span`,{style:{color:y,fontWeight:650},children:[`×`,e.reworkCount,` rework`]})]})]}),(0,l.jsx)(`span`,{className:t.cls,children:t.text})]},e.id)})]}),We=X!=null&&Z!=null&&(0,l.jsxs)(`div`,{className:`aet-detail`,"aria-label":`Detail for ${X.id}`,children:[(0,l.jsxs)(`div`,{className:`aet-detailTop`,children:[(0,l.jsx)(`span`,{className:`aet-mono`,children:X.id}),(0,l.jsx)(`span`,{className:`aet-statusChip`,style:{color:T[X.status].color,background:T[X.status].tint},children:T[X.status].label}),X.reworkCount>0&&(0,l.jsxs)(`span`,{className:`aet-statusChip`,style:{color:y,background:b},children:[`Rework ×`,X.reworkCount]}),X.remindedOn!=null&&(0,l.jsxs)(`span`,{className:`aet-statusChip`,style:{color:h,background:g},children:[`Reminded `,X.remindedOn]}),(0,l.jsx)(`div`,{className:`aet-spring`})]}),(0,l.jsx)(r,{type:`body`,weight:`semibold`,children:X.title}),(0,l.jsxs)(`dl`,{className:`aet-metaGrid`,children:[(0,l.jsxs)(`div`,{className:`aet-metaItem`,children:[(0,l.jsx)(`dt`,{children:`Control ref`}),(0,l.jsx)(`dd`,{className:`aet-mono`,children:X.controlRef})]}),(0,l.jsxs)(`div`,{className:`aet-metaItem`,children:[(0,l.jsx)(`dt`,{children:`Owner`}),(0,l.jsx)(`dd`,{children:Z.owner})]}),(0,l.jsxs)(`div`,{className:`aet-metaItem`,children:[(0,l.jsx)(`dt`,{children:`Requested`}),(0,l.jsx)(`dd`,{children:X.requestedOn})]}),(0,l.jsxs)(`div`,{className:`aet-metaItem`,children:[(0,l.jsx)(`dt`,{children:`Received`}),(0,l.jsx)(`dd`,{children:X.receivedOn??`—`})]}),(0,l.jsxs)(`div`,{className:`aet-metaItem`,children:[(0,l.jsx)(`dt`,{children:`Due`}),(0,l.jsxs)(`dd`,{style:N(X)?{color:y,fontWeight:650}:void 0,children:[E[X.dueIdx],N(X)?` · late`:``]})]}),(0,l.jsxs)(`div`,{className:`aet-metaItem`,children:[(0,l.jsx)(`dt`,{children:`Reviewer`}),(0,l.jsx)(`dd`,{children:X.reviewer??`Unassigned`})]}),X.sample!=null&&(0,l.jsxs)(`div`,{className:`aet-metaItem`,children:[(0,l.jsx)(`dt`,{children:`Sample`}),(0,l.jsx)(`dd`,{children:X.sample})]})]}),X.files.length>0?(0,l.jsx)(`div`,{className:`aet-fileWrap`,children:X.files.map(e=>(0,l.jsxs)(`span`,{className:`aet-fileChip`,children:[(0,l.jsx)(i,{icon:o,size:`sm`,color:`secondary`}),(0,l.jsx)(`span`,{children:e.name}),(0,l.jsx)(`i`,{children:e.size})]},e.name))}):(0,l.jsx)(r,{type:`supporting`,color:`secondary`,children:`No files yet — the client has not uploaded evidence.`}),X.note!=null&&(0,l.jsx)(`p`,{className:`aet-note`,children:X.note}),!_&&X.status===`inReview`&&(0,l.jsxs)(`div`,{className:`aet-actions`,children:[(0,l.jsx)(s,{label:`Accept evidence`,variant:`primary`,onClick:Ae}),(0,l.jsx)(s,{label:`Return…`,variant:`secondary`,onClick:()=>v(!0)})]}),_&&X.status===`inReview`&&(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(`span`,{className:`aet-overline`,children:`Return reason (required)`}),(0,l.jsx)(`div`,{className:`aet-reasonWrap`,children:he.map(e=>(0,l.jsx)(`button`,{type:`button`,className:`aet-chipBtn`,"aria-pressed":x===e,onClick:()=>A(t=>t===e?null:e),children:e},e))}),(0,l.jsxs)(`div`,{className:`aet-actions`,children:[(0,l.jsx)(s,{label:`Confirm return`,variant:`primary`,isDisabled:x==null,onClick:je}),(0,l.jsx)(s,{label:`Cancel`,variant:`ghost`,onClick:()=>{v(!1),A(null)}})]})]}),X.status===`received`&&(0,l.jsxs)(`div`,{className:`aet-actions`,children:[(0,l.jsx)(s,{label:`Start review`,variant:`primary`,onClick:Me}),(0,l.jsxs)(r,{type:`supporting`,color:`secondary`,children:[`Assigns `,M,` and moves it to In review.`]})]}),X.status===`requested`&&(0,l.jsx)(`div`,{className:`aet-actions`,children:(0,l.jsx)(s,{label:X.remindedOn==null?`Send reminder`:`Reminder sent`,variant:`secondary`,isDisabled:X.remindedOn!=null,onClick:Ne})}),X.status===`returned`&&(0,l.jsxs)(`div`,{className:`aet-actions`,children:[(0,l.jsx)(s,{label:`Log resubmission`,variant:`primary`,onClick:Pe}),(0,l.jsx)(r,{type:`supporting`,color:`secondary`,children:`Moves it back to Received for a fresh review pass.`})]}),X.status===`accepted`&&(0,l.jsxs)(`div`,{className:`aet-actions`,children:[(0,l.jsx)(i,{icon:a,size:`sm`,color:`secondary`}),(0,l.jsxs)(r,{type:`supporting`,color:`secondary`,children:[`Filed to the audit binder`,X.reviewer==null?``:` by ${X.reviewer}`,`. Use Undo in the activity ledger to reverse the latest decision.`]})]})]});return(0,l.jsxs)(`div`,{className:u,children:[(0,l.jsx)(`style`,{children:pe}),(0,l.jsx)(`div`,{className:`aet-vh`,"aria-live":`polite`,children:j[0].text}),(0,l.jsx)(ce,{height:`fill`,header:Le,content:(0,l.jsx)(le,{padding:0,children:(0,l.jsxs)(`div`,{className:`aet-frame`,children:[(0,l.jsxs)(`main`,{className:`aet-main`,children:[Re,(0,l.jsxs)(`div`,{className:`aet-twoUp`,children:[ze,Be]}),Ve]}),(0,l.jsxs)(`aside`,{className:`aet-rail`,"aria-label":`Reviewer queue and detail`,children:[He,Ue,We]})]})})})]})}export{W as default};