import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-o6Mx44T8.js";import{t as i}from"./Icon-CLHSQIsB.js";import{t as a}from"./archive-CJnjf1mw.js";import{t as o}from"./clipboard-check-DxbTJBP8.js";import{t as s}from"./droplets-CAJHh9SY.js";import{t as c}from"./lock-DLOnF6Bf.js";import{t as l}from"./lock-open-CQeCzNUQ.js";import{t as u}from"./truck-DP-dHpRe.js";import{A as d,o as f,w as p}from"./index-CcGpqB1l.js";import{t as ee}from"./Tooltip-XDRm9Z-w.js";import{n as te,t as ne}from"./LayoutContent-CCL91W7X.js";import{t as re}from"./LayoutHeader-Cy2mWoMf.js";import{t as ie}from"./Heading-D2LUKpOk.js";import{t as m}from"./Button-DzizYIpc.js";import{t as ae}from"./TextInput-B_grOnyR.js";import{t as oe}from"./Avatar-DyaNw-yT.js";var h=d(`brush`,[[`path`,{d:`m11 10 3 3`,key:`fzmg1i`}],[`path`,{d:`M6.5 21A3.5 3.5 0 1 0 3 17.5a2.62 2.62 0 0 1-.708 1.792A1 1 0 0 0 3 21z`,key:`p4q2r7`}],[`path`,{d:`M9.969 17.031 21.378 5.624a1 1 0 0 0-3.002-3.002L6.967 14.031`,key:`wy6l02`}]]),g=e(t(),1),_=n(),v=`tpl-museum-exhibit-condition-log`,y=`light-dark(#7C2437, #E58BA0)`,b=`light-dark(rgba(124, 36, 55, 0.08), rgba(229, 139, 160, 0.14))`,x=`light-dark(#15803D, #4ADE80)`,S=`light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))`,C=`light-dark(#1D4ED8, #93C5FD)`,w=`light-dark(rgba(29, 78, 216, 0.09), rgba(147, 197, 253, 0.14))`,T=`light-dark(#B45309, #FBBF24)`,E=`light-dark(rgba(180, 83, 9, 0.10), rgba(251, 191, 36, 0.14))`,D=`light-dark(#B91C1C, #F87171)`,O=`light-dark(rgba(185, 28, 28, 0.10), rgba(248, 113, 113, 0.14))`,k=`light-dark(#0E7490, #22D3EE)`,A=`light-dark(rgba(14, 116, 144, 0.10), rgba(34, 211, 238, 0.14))`,se=`light-dark(rgba(185, 28, 28, 0.22), rgba(248, 113, 113, 0.26))`,j=`light-dark(rgba(60, 60, 67, 0.16), rgba(235, 235, 245, 0.18))`,ce=`light-dark(rgba(21, 128, 61, 0.07), rgba(74, 222, 128, 0.09))`,M=`var(--font-family-code, ui-monospace, monospace)`,le=`
.${v} {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.${v} .mel-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.${v} .mel-mono {
  font-family: ${M};
  font-variant-numeric: tabular-nums;
}
.${v} button:focus-visible {
  outline: 2px solid ${y};
  outline-offset: 1px;
}
.${v} .mel-fade {
  transition: background-color 160ms ease, border-color 160ms ease,
    color 160ms ease, opacity 160ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .${v} .mel-fade { transition: none; }
}

/* ---- Header bar 48px ---- */
.${v} .mel-headRow {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  width: 100%;
  min-height: 48px;
  min-width: 0;
}
.${v} .mel-brandCol { display: flex; flex-direction: column; min-width: 0; }
.${v} .mel-brandLine {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}
.${v} .mel-brandName { font-size: 14px; font-weight: 650; letter-spacing: 0.01em; }
.${v} .mel-brandGallery {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${v} .mel-brandSub {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
}
.${v} .mel-spring { flex: 1; }
.${v} .mel-headChip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding-inline: 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  border: var(--border-width) solid transparent;
}
.${v} .mel-headChip.is-locked { color: var(--color-text-secondary); border-color: var(--color-border); }
.${v} .mel-headChip.is-ready { color: ${x}; background: ${S}; }
.${v} .mel-headChip.is-requested { color: ${y}; background: ${b}; }
.${v} .mel-headChip.is-hold { color: ${D}; background: ${O}; }
.${v} .mel-rhChip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding-inline: 10px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: ${k};
  white-space: nowrap;
}

/* ---- Frame: main column + 376px rail. Hand-rolled grid so the <=980px
   restack is a real media query, not a squeezed flex row. ---- */
.${v} .mel-frame {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 376px;
  height: 100%;
  min-height: 0;
}
.${v} .mel-main {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
}
.${v} .mel-mainScroll {
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}
.${v} .mel-rail {
  min-height: 0;
  border-left: var(--border-width) solid var(--color-border);
  background: var(--color-background-card);
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
}

/* ---- Object wall ---- */
.${v} .mel-caseSection { display: flex; flex-direction: column; gap: var(--spacing-2); }
.${v} .mel-caseHead {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  height: 30px;
  min-width: 0;
}
.${v} .mel-caseName {
  font-size: 11px;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${v} .mel-caseRule { flex: 1; height: 1px; background: var(--color-border); }
.${v} .mel-caseMeta {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.${v} .mel-caseMeta.is-exc { color: ${k}; }
.${v} .mel-wall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--spacing-3);
}
.${v} .mel-tile {
  font: inherit;
  color: inherit;
  text-align: left;
  margin: 0;
  cursor: pointer;
  height: 128px;
  padding: 9px 10px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  background: var(--color-background-card);
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  position: relative;
}
.${v} .mel-tile.is-overdue { border-style: dashed; border-color: ${T}; }
.${v} .mel-tile.is-selected {
  border-color: ${y};
  border-style: solid;
  box-shadow: inset 0 0 0 1px ${y};
  background: ${b};
}
@media (hover: hover) {
  .${v} .mel-tile:hover { background: var(--color-background-muted); }
  .${v} .mel-tile.is-selected:hover { background: ${b}; }
}
.${v} .mel-tileTop {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}
.${v} .mel-tileAcc {
  font-family: ${M};
  font-variant-numeric: tabular-nums;
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
}
.${v} .mel-tileMid {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  flex: 1;
  min-height: 0;
  min-width: 0;
}
.${v} .mel-tileGlyph { flex-shrink: 0; color: var(--color-text-secondary); }
.${v} .mel-tile.is-selected .mel-tileGlyph { color: ${y}; }
.${v} .mel-tileTitle {
  font-size: 12px;
  line-height: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-width: 0;
}
.${v} .mel-tileFoot {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 20px;
  min-width: 0;
}
.${v} .mel-tileDate {
  font-size: 10px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
}
.${v} .mel-dueChip {
  display: inline-flex;
  align-items: center;
  height: 16px;
  padding-inline: 5px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  color: ${T};
  background: ${E};
  white-space: nowrap;
  flex-shrink: 0;
}
.${v} .mel-dropBadge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  color: ${k};
  background: ${A};
  flex-shrink: 0;
}

/* ---- Grade badge (20px, letter is the shape channel) ---- */
.${v} .mel-grade {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}
.${v} .mel-grade.is-a { color: ${x}; background: ${S}; }
.${v} .mel-grade.is-b { color: ${C}; background: ${w}; }
.${v} .mel-grade.is-c { color: ${T}; background: ${E}; }
.${v} .mel-grade.is-d { color: ${D}; background: ${O}; }

/* ---- Environment section ---- */
.${v} .mel-envCard {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  background: var(--color-background-card);
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
.${v} .mel-envHead {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
  flex-wrap: wrap;
}
.${v} .mel-envTitle { font-size: 12px; font-weight: 650; white-space: nowrap; }
.${v} .mel-envLegend {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-left: auto;
  flex-wrap: wrap;
}
.${v} .mel-legendKey {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${v} .mel-chartScroll { overflow-x: auto; }
.${v} .mel-chartWrap { position: relative; min-width: 0; }
.${v} .mel-chartSvg { display: block; width: 100%; height: auto; }
.${v} .mel-winBtn {
  position: absolute;
  top: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}
.${v} .mel-winBtn[aria-pressed='true'] {
  outline: 2px solid ${y};
  outline-offset: -2px;
  border-radius: 3px;
}
.${v} .mel-excRow {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  min-height: 64px;
  padding: var(--spacing-2) var(--spacing-2);
  border-top: var(--border-width) solid var(--color-border);
  flex-wrap: wrap;
}
.${v} .mel-excIcon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  flex-shrink: 0;
}
.${v} .mel-excIcon.is-open { color: ${D}; background: ${O}; }
.${v} .mel-excIcon.is-acked { color: var(--color-text-secondary); background: var(--color-background-muted); }
.${v} .mel-excBody { flex: 1; min-width: 180px; display: flex; flex-direction: column; gap: 2px; }
.${v} .mel-excTitle { font-size: 12px; font-weight: 650; }
.${v} .mel-excMeta {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.${v} .mel-excAck {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: ${x};
  white-space: nowrap;
}

/* ---- Movement gate bar 56px, pinned under the main scroller ---- */
.${v} .mel-gateBar {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  min-height: 56px;
  padding: var(--spacing-2) var(--spacing-3);
  border-top: var(--border-width) solid var(--color-border);
  background: var(--color-background-card);
  flex-wrap: wrap;
}
.${v} .mel-gateTitle { display: flex; flex-direction: column; min-width: 0; }
.${v} .mel-gateName { font-size: 12px; font-weight: 650; white-space: nowrap; }
.${v} .mel-gateSub {
  font-size: 10px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${v} .mel-req {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding-inline: 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
}
.${v} .mel-req.is-pass { color: ${x}; background: ${S}; border-color: transparent; }
.${v} .mel-req.is-fail { color: ${T}; background: ${E}; border-color: transparent; }
.${v} .mel-req.is-block { color: ${D}; background: ${O}; border-color: transparent; }
.${v} .mel-gateAction { margin-left: auto; display: flex; align-items: center; gap: var(--spacing-2); }

/* ---- Rail: identity, composer, ledger ---- */
.${v} .mel-idBlock {
  padding: var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.${v} .mel-idTop { display: flex; align-items: center; gap: 7px; min-width: 0; }
.${v} .mel-idAcc {
  font-family: ${M};
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.${v} .mel-idFacts {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2px 10px;
  font-size: 11px;
}
.${v} .mel-idFactLabel {
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 10px;
  align-self: baseline;
  white-space: nowrap;
}
.${v} .mel-idFactValue { font-variant-numeric: tabular-nums; min-width: 0; }
.${v} .mel-emptyRail {
  padding: var(--spacing-4) var(--spacing-3);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  border-bottom: var(--border-width) solid var(--color-border);
}

/* ---- Composer ---- */
.${v} .mel-composer {
  padding: var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
.${v} .mel-overline {
  font-size: 11px;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
}
.${v} .mel-gradeRow { display: flex; gap: 6px; }
.${v} .mel-gradeBlock {
  font: inherit;
  margin: 0;
  cursor: pointer;
  width: 44px;
  height: 40px;
  border-radius: var(--radius-container, 8px);
  border: var(--border-width) solid var(--color-border);
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-secondary);
}
.${v} .mel-gradeBlock[aria-checked='true'].is-a { color: ${x}; background: ${S}; border-color: ${x}; }
.${v} .mel-gradeBlock[aria-checked='true'].is-b { color: ${C}; background: ${w}; border-color: ${C}; }
.${v} .mel-gradeBlock[aria-checked='true'].is-c { color: ${T}; background: ${E}; border-color: ${T}; }
.${v} .mel-gradeBlock[aria-checked='true'].is-d { color: ${D}; background: ${O}; border-color: ${D}; }
.${v} .mel-gradeDesc {
  min-height: 30px;
  font-size: 11px;
  line-height: 15px;
  color: var(--color-text-secondary);
}
.${v} .mel-tagRow { display: flex; flex-wrap: wrap; gap: 6px; }
.${v} .mel-tagChip {
  font: inherit;
  margin: 0;
  cursor: pointer;
  height: 26px;
  padding-inline: 9px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: transparent;
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${v} .mel-tagChip[aria-pressed='true'] {
  color: ${y};
  background: ${b};
  border-color: ${y};
}
.${v} .mel-composeActions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  justify-content: flex-end;
}

/* ---- Ledger ---- */
.${v} .mel-ledger {
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}
.${v} .mel-ledgerHead {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 36px;
  padding: 0 var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${v} .mel-ledgerScope {
  font: inherit;
  margin: 0;
  cursor: pointer;
  height: 24px;
  padding-inline: 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: transparent;
  font-size: 10px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  margin-left: auto;
}
.${v} .mel-ledgerScope[aria-pressed='true'] {
  color: ${y};
  border-color: ${y};
  background: ${b};
}
.${v} .mel-ledgerList {
  min-height: 0;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0 0 var(--spacing-3);
}
.${v} .mel-ledgerRow {
  display: flex;
  gap: 9px;
  min-height: 64px;
  padding: 9px var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${v} .mel-ledgerRow.is-new { background: ${b}; }
.${v} .mel-ledgerGlyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: var(--color-background-muted);
  color: var(--color-text-secondary);
  flex-shrink: 0;
  margin-top: 1px;
}
.${v} .mel-ledgerBody { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.${v} .mel-ledgerTopLine {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex-wrap: wrap;
}
.${v} .mel-ledgerObj {
  font-family: ${M};
  font-variant-numeric: tabular-nums;
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${v} .mel-ledgerKind { font-size: 11px; font-weight: 650; white-space: nowrap; }
.${v} .mel-ledgerDate {
  font-size: 10px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  margin-left: auto;
}
.${v} .mel-ledgerNote {
  font-size: 11px;
  line-height: 15px;
  color: var(--color-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.${v} .mel-ledgerTags { display: flex; flex-wrap: wrap; gap: 4px; }
.${v} .mel-ledgerTag {
  font-size: 10px;
  color: var(--color-text-secondary);
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  padding: 0 6px;
  line-height: 15px;
  white-space: nowrap;
}

/* ---- <=980px: rail restacks under the main column ---- */
@media (max-width: 980px) {
  .${v} .mel-frame { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto auto; }
  .${v} .mel-rail { border-left: none; border-top: var(--border-width) solid var(--color-border); }
  .${v} .mel-ledgerList { max-height: 384px; }
}

/* ---- <=640px (390px embed): subtraction, not squeeze ---- */
@media (max-width: 640px) {
  .${v} .mel-wall { grid-template-columns: repeat(auto-fill, minmax(132px, 1fr)); }
  .${v} .mel-chartWrap { min-width: 560px; }
  .${v} .mel-brandSub { display: none; }
  .${v} .mel-brandGallery { display: none; }
  .${v} .mel-gateAction { margin-left: 0; width: 100%; justify-content: flex-start; }
}
`,ue=`Fri 12 Jun 2026`,N=`12 Jun 2026`,P=30,F={id:`LN-2026-031`,borrower:`Corning Museum of Glass`,deinstall:`26 Jun 2026`},I=`Mara Ellison`,L=`Tomás Reyes`,R={A:{cls:`is-a`,label:`Grade A`,desc:`Excellent — stable; no change since the previous report.`},B:{cls:`is-b`,label:`Grade B`,desc:`Good — minor, stable wear or old repairs noted.`},C:{cls:`is-c`,label:`Grade C`,desc:`Fair — active or newly observed deterioration; monitor closely.`},D:{cls:`is-d`,label:`Grade D`,desc:`Poor — unstable; movement blocked pending registrar review.`}},z=[`A`,`B`,`C`,`D`],de=[`No change`,`New chip / loss`,`Crizzling active`,`Gilding flaking`,`Old repair stable`,`Surface dust`,`Mount contact abrasion`],fe=[{id:`C1`,label:`Case C1 — Cristallo`},{id:`C2`,label:`Case C2 — Filigrana`},{id:`C3`,label:`Case C3 — Lattimo & Enamel`},{id:`W1`,label:`Wall W1 — Mirrors`}],B=[{id:`1952.7.14`,title:`Goblet with serpent stem`,maker:`Venice`,dated:`ca. 1600`,material:`Cristallo glass`,glyph:`goblet`,caseId:`C1`,grade:`A`,lastChecked:`28 May 2026`,daysSinceCheck:15},{id:`1952.7.19`,title:`Covered goblet with diamond-point engraved arms of the Contarini family`,maker:`Venice`,dated:`ca. 1620`,material:`Cristallo glass, diamond-point engraving`,glyph:`goblet`,caseId:`C1`,grade:`B`,lastChecked:`21 May 2026`,daysSinceCheck:22},{id:`1961.3.8`,title:`Wineglass with ladder stem`,maker:`Venice or façon de Venise`,dated:`ca. 1660`,material:`Colorless glass`,glyph:`wineglass`,caseId:`C1`,grade:`A`,lastChecked:`30 May 2026`,daysSinceCheck:13},{id:`1948.11.2`,title:`Tazza with millefiori canes`,maker:`Venice`,dated:`ca. 1550`,material:`Millefiori glass`,glyph:`tazza`,caseId:`C1`,grade:`B`,lastChecked:`26 May 2026`,daysSinceCheck:17},{id:`1978.4.61`,title:`Ewer, vetro a fili`,maker:`Venice`,dated:`ca. 1575`,material:`Filigrana glass, gilt handle terminal`,glyph:`ewer`,caseId:`C2`,grade:`C`,lastChecked:`4 May 2026`,daysSinceCheck:39},{id:`1978.4.66`,title:`Flask, vetro a retorti`,maker:`Venice`,dated:`ca. 1580`,material:`Filigrana glass`,glyph:`flask`,caseId:`C2`,grade:`B`,lastChecked:`6 May 2026`,daysSinceCheck:37},{id:`1955.2.31`,title:`Bowl, vetro a reticello`,maker:`Venice`,dated:`ca. 1560`,material:`Filigrana glass`,glyph:`bowl`,caseId:`C2`,grade:`B`,lastChecked:`29 May 2026`,daysSinceCheck:14},{id:`1949.9.5`,title:`Dish with folded rim, vetro a fili`,maker:`Venice`,dated:`ca. 1570`,material:`Filigrana glass`,glyph:`dish`,caseId:`C2`,grade:`A`,lastChecked:`31 May 2026`,daysSinceCheck:12},{id:`1960.6.22`,title:`Lattimo beaker with enameled portrait`,maker:`Venice`,dated:`ca. 1500`,material:`Opaque white glass, enamel`,glyph:`beaker`,caseId:`C3`,grade:`B`,lastChecked:`27 May 2026`,daysSinceCheck:16},{id:`1946.1.77`,title:`Pilgrim flask with gilt enamel`,maker:`Venice`,dated:`ca. 1510`,material:`Blue glass, enamel, gilding`,glyph:`flask`,caseId:`C3`,grade:`B`,lastChecked:`25 May 2026`,daysSinceCheck:18},{id:`1972.8.3`,title:`Armorial plate with enamel decoration`,maker:`Venice`,dated:`ca. 1520`,material:`Colorless glass, enamel, gilding`,glyph:`dish`,caseId:`C3`,grade:`A`,lastChecked:`1 Jun 2026`,daysSinceCheck:11},{id:`2003.5.1`,title:`Mirror in carved and gilt frame`,maker:`Venice`,dated:`ca. 1680`,material:`Mirror plate, carved giltwood`,glyph:`mirror`,caseId:`W1`,grade:`B`,lastChecked:`30 Apr 2026`,daysSinceCheck:43}],V=[50.1,49.8,50.4,50,49.6,49.2,50.3,50.6,49.9,48.7,47.9,46.8,44.1,41.9,41.2,43.6,46.4,47.8,48.9,49.4,49.8,50.2,50.7,50.3,50,49.5,49.1,49.7,50.4,50.9,51.3,50.8,50.2,49.8,50.5,51.1,53.9,58.6,63.4,56.2,52.8,51.6,50.9,50.4,50.1,49.7,50.2,50.6,50.9,51.2,50.8,50.5,50.7,51,50.8,50.6],H=[{idx:0,label:`30 May`},{idx:8,label:`1 Jun`},{idx:16,label:`3 Jun`},{idx:24,label:`5 Jun`},{idx:32,label:`7 Jun`},{idx:40,label:`9 Jun`},{idx:48,label:`11 Jun`}],U=45,W=55,pe=[{id:`E-201`,kind:`low`,startIdx:12,endIdx:15,dateLabel:`2 Jun 2026`,peakLabel:`trough 41.2% RH`,durationLabel:`11h below 45%`,cause:`HVAC economizer fault; work order WO-8841 closed 3 Jun.`,caseIds:[`C1`,`C3`],state:`acknowledged`,ackLine:`Acknowledged by M. Ellison — 3 Jun 2026`},{id:`E-207`,kind:`high`,startIdx:36,endIdx:39,dateLabel:`8 Jun 2026`,peakLabel:`peak 63.4% RH`,durationLabel:`9h above 55%`,cause:`Case C2 opened during gallery deep-clean; reseated gasket suspected.`,caseIds:[`C2`],state:`open`}],me=[{id:`LE-230`,kind:`accession`,objectId:`2003.5.1`,date:`12 Mar 2026`,author:`${L} (Registrar)`,note:`Baseline condition report for loan LN-2026-031 packing list: carved giltwood frame stable; scattered foxing to mirror plate; two age cracks in the lower member, unchanged since the 2019 survey.`},{id:`LE-231`,kind:`treatment`,objectId:`1978.4.61`,date:`22 May 2026`,author:I,note:`Consolidated flaking gilding at the handle terminal with 2% Paraloid B-72 in acetone; 24h re-check clean. Grade held at C pending a stability window.`},{id:`LE-232`,kind:`check`,objectId:`1955.2.31`,date:`29 May 2026`,author:I,grade:`B`,tags:[`Old repair stable`],note:`Historic rim repair unchanged since the March report; adhesive line stable under UV.`},{id:`LE-233`,kind:`check`,objectId:`1961.3.8`,date:`30 May 2026`,author:I,grade:`A`,tags:[`No change`,`Surface dust`],note:`Light dust on the foot; removed with soft brush. No new condition issues.`},{id:`LE-234`,kind:`check`,objectId:`1949.9.5`,date:`31 May 2026`,author:I,grade:`A`,tags:[`No change`],note:`Fili canes crisp, rim fold intact.`},{id:`LE-235`,kind:`check`,objectId:`1972.8.3`,date:`1 Jun 2026`,author:I,grade:`A`,tags:[`No change`],note:`Enamel and gilding stable under raking light; no new losses.`},{id:`LE-236`,kind:`excursion`,objectId:null,date:`3 Jun 2026`,author:I,note:`E-201 acknowledged: overnight RH trough 41.2% (11h below 45%) from an HVAC economizer fault. Cases C1 and C3 spot-checked — no crizzling response observed. WO-8841 closed.`},{id:`LE-237`,kind:`excursion`,objectId:null,date:`8 Jun 2026`,author:`Vitrine environment monitor`,note:`E-207 detected: RH above 55% in Case C2 for 9h (peak 63.4%) during the gallery deep-clean. Acknowledgement with a case spot-check is required before movement approval.`}],he=238;function ge(){return(0,_.jsxs)(`svg`,{width:22,height:22,viewBox:`0 0 22 22`,"aria-hidden":!0,style:{flexShrink:0},children:[(0,_.jsx)(`rect`,{x:4.5,y:2.5,width:13,height:12,rx:1.5,fill:`none`,stroke:y,strokeWidth:1.8}),(0,_.jsx)(`circle`,{cx:11,cy:9.5,r:2.2,fill:y}),(0,_.jsx)(`path`,{d:`M3 17.5h16M8 17.5v2.5M14 17.5v2.5`,fill:`none`,stroke:y,strokeWidth:1.8,strokeLinecap:`round`})]})}var G={goblet:`M8 3h8c0 4.5-1.6 7.5-4 7.5S8 7.5 8 3ZM12 10.5V18M8.5 20.5h7M12 18c0 1.4-1.2 2.5-3.5 2.5M12 18c0 1.4 1.2 2.5 3.5 2.5`,wineglass:`M9 3h6c0 5-1.2 8-3 8s-3-3-3-8ZM12 11v8M9 20.5h6`,tazza:`M5.5 6h13c-1 3.2-3.4 5-6.5 5S6.5 9.2 5.5 6ZM12 11v6.5M8.5 20.5h7M12 17.5c0 1.5-1.3 3-3.5 3M12 17.5c0 1.5 1.3 3 3.5 3`,ewer:`M10 3.5h4l1 3c1.8 1.2 3 3.2 3 5.5 0 3.5-2.7 6.5-6 6.5s-6-3-6-6.5c0-2.3 1.2-4.3 3-5.5l1-3ZM8.5 20.5h7M15 7l3.5-2v4`,flask:`M10.5 3h3v4.5c2.6 1 4.5 3.4 4.5 6.3 0 3.7-2.7 6.7-6 6.7s-6-3-6-6.7c0-2.9 1.9-5.3 4.5-6.3V3Z`,bowl:`M4.5 9.5h15a7.5 7.5 0 0 1-15 0ZM9 20.5h6M12 17v3.5`,dish:`M3.5 11.5h17M5.5 11.5c0 2.5 2.9 4.5 6.5 4.5s6.5-2 6.5-4.5M8 20.5h8M12 16v4.5`,beaker:`M8.5 3.5h7l-1 17h-5l-1-17ZM8.8 8h6.4`,mirror:`M6.5 2.5h9a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 5 18V4a1.5 1.5 0 0 1 1.5-1.5ZM8 5.5h6v11H8ZM9.5 8l3 3`};function _e({kind:e}){return(0,_.jsx)(`svg`,{className:`mel-tileGlyph`,width:24,height:24,viewBox:`0 0 24 24`,"aria-hidden":!0,fill:`none`,stroke:`currentColor`,strokeWidth:1.4,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,_.jsx)(`path`,{d:G[e]})})}function K({grade:e}){return(0,_.jsx)(`span`,{className:`mel-grade ${R[e].cls}`,"aria-hidden":!0,children:e})}function ve({object:e,isSelected:t,inOpenExcursion:n,onSelect:r}){let i=e.daysSinceCheck>P,a=[e.id,e.title,`grade ${e.grade}`,`last checked ${e.lastChecked}`];return i&&a.push(`check overdue by ${e.daysSinceCheck-P} days`),n&&a.push(`inside an open humidity excursion`),(0,_.jsxs)(`button`,{type:`button`,className:`mel-tile mel-fade${i?` is-overdue`:``}${t?` is-selected`:``}`,"aria-pressed":t,"aria-label":a.join(`, `),onClick:r,children:[(0,_.jsxs)(`span`,{className:`mel-tileTop`,children:[(0,_.jsx)(`span`,{className:`mel-tileAcc`,children:e.id}),n?(0,_.jsx)(ee,{content:`Case inside an open humidity excursion`,children:(0,_.jsx)(`span`,{className:`mel-dropBadge`,children:(0,_.jsx)(s,{size:11,"aria-hidden":!0})})}):null,(0,_.jsx)(K,{grade:e.grade})]}),(0,_.jsxs)(`span`,{className:`mel-tileMid`,children:[(0,_.jsx)(_e,{kind:e.glyph}),(0,_.jsx)(`span`,{className:`mel-tileTitle`,children:e.title})]}),(0,_.jsxs)(`span`,{className:`mel-tileFoot`,children:[(0,_.jsxs)(`span`,{className:`mel-tileDate`,children:[`Checked `,e.lastChecked]}),i?(0,_.jsxs)(`span`,{className:`mel-dueChip`,children:[e.daysSinceCheck,`d`]}):null]})]})}var q=672,ye=152,J=34,Y=664,X=12,Z=130,be=70,xe=35;function Q(e){return J+e*(Y-J)/(V.length-1)}function $(e){return X+(be-e)*(Z-X)/(be-xe)}var Se=V.map((e,t)=>`${Q(t).toFixed(1)},${$(e).toFixed(1)}`).join(` `);function Ce({excursions:e,selectedExcursionId:t,onSelectExcursion:n}){return(0,_.jsx)(`div`,{className:`mel-chartScroll`,children:(0,_.jsxs)(`div`,{className:`mel-chartWrap`,children:[(0,_.jsxs)(`svg`,{className:`mel-chartSvg`,viewBox:`0 0 ${q} ${ye}`,role:`img`,"aria-label":`Relative humidity, 30 May to 12 June, 6-hourly. Safe band 45 to 55 percent. `+e.map(e=>`Excursion ${e.id} on ${e.dateLabel}, ${e.peakLabel}, ${e.state}.`).join(` `),children:[(0,_.jsx)(`rect`,{x:J,y:$(W),width:Y-J,height:$(U)-$(W),fill:ce}),(0,_.jsx)(`line`,{x1:J,x2:Y,y1:$(W),y2:$(W),stroke:`var(--color-border)`,strokeDasharray:`3 3`}),(0,_.jsx)(`line`,{x1:J,x2:Y,y1:$(U),y2:$(U),stroke:`var(--color-border)`,strokeDasharray:`3 3`}),[70,55,45,35].map(e=>(0,_.jsx)(`text`,{x:J-6,y:$(e)+3.5,textAnchor:`end`,fontSize:9,fill:`var(--color-text-secondary)`,style:{fontVariantNumeric:`tabular-nums`},children:e},e)),e.map(e=>{let t=Q(e.startIdx),n=Q(e.endIdx),r=e.state===`open`;return(0,_.jsxs)(`g`,{children:[(0,_.jsx)(`rect`,{x:t,y:X,width:n-t,height:Z-X,fill:r?`url(#mel-hatch-open)`:`none`,stroke:r?D:`var(--color-text-secondary)`,strokeDasharray:r?void 0:`3 3`}),(0,_.jsx)(`text`,{x:(t+n)/2,y:X-3,textAnchor:`middle`,fontSize:9,fontWeight:650,fill:r?D:`var(--color-text-secondary)`,style:{fontVariantNumeric:`tabular-nums`},children:e.id}),r?null:(0,_.jsx)(`path`,{d:`M${n-10} 21 l3 3 l5 -6`,fill:`none`,stroke:x,strokeWidth:1.8,strokeLinecap:`round`,strokeLinejoin:`round`})]},e.id)}),(0,_.jsxs)(`defs`,{children:[(0,_.jsxs)(`pattern`,{id:`mel-hatch-open`,width:6,height:6,patternTransform:`rotate(45)`,patternUnits:`userSpaceOnUse`,children:[(0,_.jsx)(`rect`,{width:6,height:6,fill:`transparent`}),(0,_.jsx)(`rect`,{width:2,height:6,fill:se})]}),(0,_.jsxs)(`pattern`,{id:`mel-hatch-grey`,width:6,height:6,patternTransform:`rotate(45)`,patternUnits:`userSpaceOnUse`,children:[(0,_.jsx)(`rect`,{width:6,height:6,fill:`transparent`}),(0,_.jsx)(`rect`,{width:2,height:6,fill:j})]})]}),(0,_.jsx)(`polyline`,{points:Se,fill:`none`,stroke:k,strokeWidth:1.6,strokeLinejoin:`round`}),H.map(e=>(0,_.jsxs)(`g`,{children:[(0,_.jsx)(`line`,{x1:Q(e.idx),x2:Q(e.idx),y1:Z,y2:134,stroke:`var(--color-border)`}),(0,_.jsx)(`text`,{x:Q(e.idx),y:145,textAnchor:`middle`,fontSize:9,fill:`var(--color-text-secondary)`,style:{fontVariantNumeric:`tabular-nums`},children:e.label})]},e.idx)),(0,_.jsx)(`line`,{x1:J,x2:Y,y1:Z,y2:Z,stroke:`var(--color-border)`})]}),e.map(e=>{let r=Q(Math.max(e.startIdx-.5,0)),i=Q(Math.min(e.endIdx+.5,V.length-1));return(0,_.jsx)(`button`,{type:`button`,className:`mel-winBtn`,style:{left:`${r/q*100}%`,width:`${(i-r)/q*100}%`},"aria-pressed":t===e.id,"aria-label":`Excursion ${e.id}, ${e.dateLabel}, ${e.peakLabel}, ${e.state===`open`?`open — acknowledgement required`:`acknowledged`}`,onClick:()=>n(e.id)},e.id)})]})})}var we={accession:{label:`Condition report`,icon:a},check:{label:`Condition check`,icon:o},treatment:{label:`Treatment`,icon:h},excursion:{label:`Environment`,icon:s},movement:{label:`Movement`,icon:u}};function Te({event:e,isNew:t}){let n=we[e.kind],r=n.icon;return(0,_.jsxs)(`li`,{className:`mel-ledgerRow mel-fade${t?` is-new`:``}`,children:[(0,_.jsx)(`span`,{className:`mel-ledgerGlyph`,"aria-hidden":!0,children:(0,_.jsx)(r,{size:13})}),(0,_.jsxs)(`div`,{className:`mel-ledgerBody`,children:[(0,_.jsxs)(`div`,{className:`mel-ledgerTopLine`,children:[(0,_.jsx)(`span`,{className:`mel-ledgerObj`,children:e.objectId??`Gallery 4`}),(0,_.jsx)(`span`,{className:`mel-ledgerKind`,children:n.label}),e.grade==null?null:(0,_.jsx)(K,{grade:e.grade}),(0,_.jsxs)(`span`,{className:`mel-ledgerDate`,children:[e.date,` · `,e.author]})]}),e.tags!=null&&e.tags.length>0?(0,_.jsx)(`div`,{className:`mel-ledgerTags`,children:e.tags.map(e=>(0,_.jsx)(`span`,{className:`mel-ledgerTag`,children:e},e))}):null,(0,_.jsx)(`p`,{className:`mel-ledgerNote`,style:{margin:0},children:e.note})]})]})}function Ee({object:e,onLogCheck:t}){let[n,a]=(0,g.useState)(e.grade),[s,c]=(0,g.useState)([]),[l,u]=(0,g.useState)(``),d=e=>{c(t=>t.includes(e)?t.filter(t=>t!==e):[...t,e])},f=()=>{t(n,s,l.trim()),c([]),u(``)};return(0,_.jsxs)(`div`,{className:`mel-composer`,children:[(0,_.jsxs)(`span`,{className:`mel-overline`,children:[`Log condition check — `,N]}),(0,_.jsx)(`div`,{className:`mel-gradeRow`,role:`radiogroup`,"aria-label":`Condition grade`,children:z.map(e=>(0,_.jsx)(`button`,{type:`button`,role:`radio`,"aria-checked":n===e,"aria-label":`${R[e].label}: ${R[e].desc}`,className:`mel-gradeBlock mel-fade ${R[e].cls}`,onClick:()=>a(e),children:e},e))}),(0,_.jsx)(`div`,{className:`mel-gradeDesc`,children:`${R[n].label} — ${R[n].desc}`}),(0,_.jsx)(`div`,{className:`mel-tagRow`,role:`group`,"aria-label":`Observations`,children:de.map(e=>(0,_.jsx)(`button`,{type:`button`,className:`mel-tagChip mel-fade`,"aria-pressed":s.includes(e),onClick:()=>d(e),children:e},e))}),(0,_.jsx)(ae,{label:`Check note`,isLabelHidden:!0,size:`sm`,placeholder:`Note (optional) — e.g. raking-light result`,value:l,onChange:u,onEnter:f}),(0,_.jsxs)(`div`,{className:`mel-composeActions`,children:[n===`D`?(0,_.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Grade D blocks the movement gate`}):null,(0,_.jsx)(m,{label:`Log check for ${e.id}`,variant:`primary`,size:`sm`,icon:(0,_.jsx)(i,{icon:o,size:`sm`}),onClick:f,children:`Log check`})]})]})}var De={objects:B,excursions:pe,ledger:me,approvalRequested:!1,nextEventNum:he};function Oe(){let[e,t]=(0,g.useState)(De),[n,a]=(0,g.useState)(null),[d,ae]=(0,g.useState)(null),[h,y]=(0,g.useState)(!1),[b,x]=(0,g.useState)(``),{objects:S,excursions:C,ledger:w,approvalRequested:T}=e,E=S.filter(e=>e.daysSinceCheck<=P).length,O=C.filter(e=>e.state===`open`),k=new Set(O.flatMap(e=>e.caseIds)),A=S.filter(e=>e.grade===`D`),j=E===S.length&&O.length===0&&A.length===0,M=+(E===S.length)+ +(O.length===0)+ +(A.length===0),z=T?j?`requested`:`hold`:j?`ready`:`locked`,de=V[V.length-1],B=S.find(e=>e.id===n)??null,H=C.find(e=>e.id===d)??O[0]??null,U=(n,r,i,a)=>{let o=`LE-${e.nextEventNum}`,s=e.objects.map(e=>e.id===n?{...e,grade:r,lastChecked:N,daysSinceCheck:0}:e),c={id:o,kind:`check`,objectId:n,date:N,author:I,grade:r,tags:i.length>0?i:void 0,note:a.length>0?a:`Routine pre-movement check ahead of ${F.id}; graded ${r}.`};t(e=>({...e,objects:s,ledger:[...e.ledger,c],nextEventNum:e.nextEventNum+1}));let l=s.filter(e=>e.daysSinceCheck<=P).length;x(`Check logged for ${n}, grade ${r}. Checks current ${l} of ${s.length}.`+(r===`D`?` Grade D blocks the movement gate pending registrar review.`:``))},W=n=>{let r=e.excursions.find(e=>e.id===n);if(r==null||r.state!==`open`)return;let i={id:`LE-${e.nextEventNum}`,kind:`excursion`,objectId:null,date:N,author:I,note:`${r.id} acknowledged: ${r.peakLabel}, ${r.durationLabel} on ${r.dateLabel} (cases ${r.caseIds.join(`, `)}). ${r.cause} Case spot-check clean — no condition response observed.`};t(e=>({...e,excursions:e.excursions.map(e=>e.id===n?{...e,state:`acknowledged`,ackLine:`Acknowledged by M. Ellison — ${N}`}:e),ledger:[...e.ledger,i],nextEventNum:e.nextEventNum+1}));let a=e.excursions.filter(e=>e.state===`open`&&e.id!==n).length;x(`Excursion ${n} acknowledged. ${a} open excursion${a===1?``:`s`} remaining.`)},pe=()=>{if(!j||e.approvalRequested)return;let n={id:`LE-${e.nextEventNum}`,kind:`movement`,objectId:null,date:N,author:I,note:`Movement approval requested for ${F.id} (${e.objects.length} objects, deinstall ${F.deinstall}) — sent to ${L} for registrar countersign.`};t(e=>({...e,approvalRequested:!0,ledger:[...e.ledger,n],nextEventNum:e.nextEventNum+1})),x(`Movement approval requested for loan ${F.id}.`)},me=B!=null&&!h,G=[...w].reverse().filter(e=>me?e.objectId===B.id:!0),_e=e=>Number(e.slice(3))>=he,q=e=>{a(t=>t===e?null:e),y(!1)},ye=z===`locked`?(0,_.jsxs)(`span`,{className:`mel-headChip is-locked mel-fade`,children:[(0,_.jsx)(c,{size:12,"aria-hidden":!0}),`Gate `,M,`/3`]}):z===`ready`?(0,_.jsxs)(`span`,{className:`mel-headChip is-ready mel-fade`,children:[(0,_.jsx)(l,{size:12,"aria-hidden":!0}),`Ready to request`]}):z===`requested`?(0,_.jsxs)(`span`,{className:`mel-headChip is-requested mel-fade`,children:[(0,_.jsx)(p,{size:12,"aria-hidden":!0}),`Approval requested`]}):(0,_.jsxs)(`span`,{className:`mel-headChip is-hold mel-fade`,children:[(0,_.jsx)(f,{size:12,"aria-hidden":!0}),`Approval on hold`]});return(0,_.jsxs)(`div`,{className:v,children:[(0,_.jsx)(`style`,{children:le}),(0,_.jsx)(`div`,{className:`mel-vh`,"aria-live":`polite`,children:b}),(0,_.jsx)(te,{height:`fill`,header:(0,_.jsx)(re,{hasDivider:!0,children:(0,_.jsxs)(`div`,{className:`mel-headRow`,children:[(0,_.jsx)(ge,{}),(0,_.jsxs)(`div`,{className:`mel-brandCol`,children:[(0,_.jsxs)(`div`,{className:`mel-brandLine`,children:[(0,_.jsx)(`span`,{className:`mel-brandName`,children:`Vitrine`}),(0,_.jsx)(`span`,{className:`mel-brandGallery`,children:`Halloran Museum · Gallery 4 — Fire & Sand: Venetian Glass 1500–1700`})]}),(0,_.jsxs)(`span`,{className:`mel-brandSub`,children:[`Loan `,F.id,` → `,F.borrower,` · deinstall `,F.deinstall,` · today `,ue]})]}),(0,_.jsx)(`div`,{className:`mel-spring`}),ye,(0,_.jsx)(ee,{content:`Gallery 4 relative humidity — latest 6-hour sample`,children:(0,_.jsxs)(`span`,{className:`mel-rhChip`,children:[(0,_.jsx)(s,{size:12,"aria-hidden":!0}),de.toFixed(1),`% RH`]})}),(0,_.jsx)(oe,{name:I,size:`small`})]})}),content:(0,_.jsx)(ne,{padding:0,children:(0,_.jsxs)(`div`,{className:`mel-frame`,children:[(0,_.jsxs)(`main`,{className:`mel-main`,children:[(0,_.jsxs)(`div`,{className:`mel-mainScroll`,children:[fe.map(e=>{let t=S.filter(t=>t.caseId===e.id),r=t.filter(e=>e.daysSinceCheck<=P).length,i=O.find(t=>t.caseIds.includes(e.id));return(0,_.jsxs)(`section`,{className:`mel-caseSection`,"aria-label":e.label,children:[(0,_.jsxs)(`div`,{className:`mel-caseHead`,children:[(0,_.jsx)(`h2`,{className:`mel-caseName`,style:{margin:0},children:e.label}),(0,_.jsx)(`span`,{className:`mel-caseRule`,"aria-hidden":!0}),i==null?null:(0,_.jsxs)(`span`,{className:`mel-caseMeta is-exc`,children:[(0,_.jsx)(s,{size:11,"aria-hidden":!0}),i.id,` open`]}),(0,_.jsxs)(`span`,{className:`mel-caseMeta`,children:[r,`/`,t.length,` checks current`]})]}),(0,_.jsx)(`div`,{className:`mel-wall`,children:t.map(e=>(0,_.jsx)(ve,{object:e,isSelected:n===e.id,inOpenExcursion:k.has(e.caseId),onSelect:()=>q(e.id)},e.id))})]},e.id)}),(0,_.jsxs)(`section`,{className:`mel-envCard`,"aria-label":`Gallery 4 environment`,children:[(0,_.jsxs)(`div`,{className:`mel-envHead`,children:[(0,_.jsx)(s,{size:14,"aria-hidden":!0,style:{flexShrink:0}}),(0,_.jsx)(`span`,{className:`mel-envTitle`,children:`Relative humidity — 14 days, 6-hourly`}),(0,_.jsxs)(`div`,{className:`mel-envLegend`,"aria-hidden":!0,children:[(0,_.jsxs)(`span`,{className:`mel-legendKey`,children:[(0,_.jsx)(`span`,{style:{width:14,height:8,background:ce,border:`var(--border-width) solid var(--color-border)`}}),`45–55% safe band`]}),(0,_.jsxs)(`span`,{className:`mel-legendKey`,children:[(0,_.jsx)(`span`,{style:{width:14,height:8,border:`1px solid ${D}`,backgroundImage:`repeating-linear-gradient(45deg, ${se} 0 2px, transparent 2px 5px)`}}),`Open excursion`]}),(0,_.jsxs)(`span`,{className:`mel-legendKey`,children:[(0,_.jsx)(`span`,{style:{width:14,height:8,border:`1px dashed var(--color-text-secondary)`}}),`Acknowledged`]})]})]}),(0,_.jsx)(Ce,{excursions:C,selectedExcursionId:H?.id??null,onSelectExcursion:e=>ae(t=>t===e?null:e)}),H==null?null:(0,_.jsxs)(`div`,{className:`mel-excRow`,children:[(0,_.jsx)(`span`,{className:`mel-excIcon ${H.state===`open`?`is-open`:`is-acked`}`,"aria-hidden":!0,children:H.state===`open`?(0,_.jsx)(f,{size:15}):(0,_.jsx)(p,{size:15})}),(0,_.jsxs)(`div`,{className:`mel-excBody`,children:[(0,_.jsxs)(`span`,{className:`mel-excTitle`,children:[H.id,` —`,` `,H.kind===`high`?`High RH`:`Low RH`,` ·`,` `,H.dateLabel]}),(0,_.jsxs)(`span`,{className:`mel-excMeta`,children:[H.peakLabel,` · `,H.durationLabel,` · Cases`,` `,H.caseIds.join(`, `)]}),(0,_.jsx)(`span`,{className:`mel-excMeta`,children:H.cause})]}),H.state===`open`?(0,_.jsx)(m,{label:`Acknowledge excursion ${H.id}`,variant:`secondary`,size:`sm`,icon:(0,_.jsx)(i,{icon:p,size:`sm`}),onClick:()=>W(H.id),children:`Acknowledge`}):(0,_.jsxs)(`span`,{className:`mel-excAck`,children:[(0,_.jsx)(p,{size:12,"aria-hidden":!0}),H.ackLine]})]})]})]}),(0,_.jsxs)(`div`,{className:`mel-gateBar`,children:[z===`requested`?(0,_.jsx)(l,{size:16,"aria-hidden":!0,style:{flexShrink:0}}):(0,_.jsx)(c,{size:16,"aria-hidden":!0,style:{flexShrink:0}}),(0,_.jsxs)(`div`,{className:`mel-gateTitle`,children:[(0,_.jsxs)(`span`,{className:`mel-gateName`,children:[`Movement gate — `,F.id]}),(0,_.jsxs)(`span`,{className:`mel-gateSub`,children:[`Deinstall `,F.deinstall,` · `,F.borrower]})]}),(0,_.jsxs)(`span`,{className:`mel-req mel-fade ${E===S.length?`is-pass`:`is-fail`}`,children:[E===S.length?(0,_.jsx)(p,{size:11,"aria-hidden":!0}):(0,_.jsx)(o,{size:11,"aria-hidden":!0}),`Checks ≤`,P,`d · `,E,`/`,S.length]}),(0,_.jsxs)(`span`,{className:`mel-req mel-fade ${O.length===0?`is-pass`:`is-fail`}`,children:[O.length===0?(0,_.jsx)(p,{size:11,"aria-hidden":!0}):(0,_.jsx)(s,{size:11,"aria-hidden":!0}),`Open excursions · `,O.length]}),(0,_.jsxs)(`span`,{className:`mel-req mel-fade ${A.length===0?`is-pass`:`is-block`}`,children:[A.length===0?(0,_.jsx)(p,{size:11,"aria-hidden":!0}):(0,_.jsx)(f,{size:11,"aria-hidden":!0}),`Grade D · `,A.length,A.length>0?` (${A.map(e=>e.id).join(`, `)})`:``]}),(0,_.jsx)(`div`,{className:`mel-gateAction`,children:z===`requested`?(0,_.jsxs)(r,{type:`supporting`,size:`xsm`,color:`secondary`,hasTabularNumbers:!0,children:[`Requested `,N,` · awaiting registrar countersign (`,L,`)`]}):z===`hold`?(0,_.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Request on hold — clear the failed requirement to resume`}):(0,_.jsx)(m,{label:`Request movement approval`,variant:`primary`,size:`sm`,icon:(0,_.jsx)(i,{icon:u,size:`sm`}),isDisabled:!j,onClick:pe})})]})]}),(0,_.jsxs)(`aside`,{className:`mel-rail`,"aria-label":`Selected object and conservation ledger`,children:[B==null?(0,_.jsxs)(`div`,{className:`mel-emptyRail`,children:[(0,_.jsx)(ie,{level:2,children:`No object selected`}),(0,_.jsxs)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:[`Select a tile on the object wall to review its ledger and log a condition check. `,S.length-E,` of `,S.length,` `,`loan-listed objects still need a check inside the `,P,`-day window.`]})]}):(0,_.jsxs)(`div`,{className:`mel-idBlock`,children:[(0,_.jsxs)(`div`,{className:`mel-idTop`,children:[(0,_.jsx)(`span`,{className:`mel-idAcc`,children:B.id}),(0,_.jsx)(K,{grade:B.grade}),B.daysSinceCheck>P?(0,_.jsxs)(`span`,{className:`mel-dueChip`,children:[`check overdue · `,B.daysSinceCheck,`d`]}):null]}),(0,_.jsx)(ie,{level:2,maxLines:2,children:B.title}),(0,_.jsxs)(`div`,{className:`mel-idFacts`,children:[(0,_.jsx)(`span`,{className:`mel-idFactLabel`,children:`Maker`}),(0,_.jsxs)(`span`,{className:`mel-idFactValue`,children:[B.maker,`, `,B.dated]}),(0,_.jsx)(`span`,{className:`mel-idFactLabel`,children:`Material`}),(0,_.jsx)(`span`,{className:`mel-idFactValue`,children:B.material}),(0,_.jsx)(`span`,{className:`mel-idFactLabel`,children:`Location`}),(0,_.jsx)(`span`,{className:`mel-idFactValue`,children:fe.find(e=>e.id===B.caseId)?.label??B.caseId}),(0,_.jsx)(`span`,{className:`mel-idFactLabel`,children:`Last check`}),(0,_.jsxs)(`span`,{className:`mel-idFactValue`,children:[B.lastChecked,` · `,B.daysSinceCheck,`d ago ·`,` `,R[B.grade].label]})]})]}),B==null?(0,_.jsx)(`div`,{}):(0,_.jsx)(Ee,{object:B,onLogCheck:(e,t,n)=>U(B.id,e,t,n)},B.id),(0,_.jsxs)(`div`,{className:`mel-ledger`,children:[(0,_.jsxs)(`div`,{className:`mel-ledgerHead`,children:[(0,_.jsx)(`span`,{className:`mel-overline`,children:`Conservation ledger`}),(0,_.jsx)(`span`,{className:`mel-caseMeta`,children:G.length}),B==null?null:(0,_.jsx)(`button`,{type:`button`,className:`mel-ledgerScope mel-fade`,"aria-pressed":h,onClick:()=>y(e=>!e),children:h?`All gallery`:`Only ${B.id}`})]}),(0,_.jsx)(`ul`,{className:`mel-ledgerList`,"aria-label":`Conservation events, newest first`,children:G.length===0?(0,_.jsx)(`li`,{className:`mel-ledgerRow`,children:(0,_.jsxs)(`div`,{className:`mel-ledgerBody`,children:[(0,_.jsx)(`span`,{className:`mel-ledgerKind`,children:`No events yet`}),(0,_.jsx)(`p`,{className:`mel-ledgerNote`,style:{margin:0},children:B==null?`No ledger events.`:`No ledger events for ${B.id}. Log the first condition check above.`})]})}):G.map(e=>(0,_.jsx)(Te,{event:e,isNew:_e(e.id)},e.id))})]})]})]})})})]})}export{Oe as default};