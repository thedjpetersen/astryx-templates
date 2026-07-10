import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-BShJ9Z1_.js";import{t as i}from"./Icon-CbuLE4XT.js";import{t as a}from"./minus-BFL8cGWr.js";import{t as o}from"./scale-B2aqyOfK.js";import{t as s}from"./users-CunPVgI3.js";import{D as c,b as l,k as u,o as d}from"./index-CfmeJ-SX.js";import{n as ee,t as f}from"./LayoutContent-CCL91W7X.js";import{t as p}from"./LayoutHeader-Cy2mWoMf.js";import{t as m}from"./Heading-CEi_rPYM.js";import{t as te}from"./Badge-0Tj9omHc.js";import{t as ne}from"./Button-CDZT8H4B.js";import{t as h}from"./Slider-IdStKgqz.js";var g=e(t(),1),_=n(),v=`tpl-procurement-bid-evaluator`,y=`light-dark(#C2410C, #FFA94D)`,b=`light-dark(rgba(194, 65, 12, 0.10), rgba(255, 169, 77, 0.14))`,x=`light-dark(rgba(194, 65, 12, 0.16), rgba(255, 169, 77, 0.20))`,S=`light-dark(#15803D, #4ADE80)`,C=`light-dark(rgba(21, 128, 61, 0.12), rgba(74, 222, 128, 0.16))`,w=`light-dark(#B91C1C, #F87171)`,T=`light-dark(#B45309, #FBBF24)`,E=`light-dark(rgba(180, 83, 9, 0.12), rgba(251, 191, 36, 0.16))`,D=`var(--font-family-code, ui-monospace, monospace)`,re=`
.${v} {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.${v} .pbe-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  margin: 0;
  padding: 0;
  text-align: inherit;
  cursor: pointer;
}
.${v} .pbe-btn:focus-visible,
.${v} .pbe-presetChip:focus-visible {
  outline: 2px solid ${y};
  outline-offset: -2px;
}
.${v} .pbe-mono {
  font-family: ${D};
  font-variant-numeric: tabular-nums;
}
.${v} .pbe-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.${v} .pbe-overline {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

/* ---- Frame: 300px weights rail + main; hand-rolled so the <=980px restack
   is a real media query. ---- */
.${v} .pbe-frame {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  height: 100%;
  min-height: 0;
}
.${v} .pbe-rail {
  min-height: 0;
  overflow-y: auto;
  border-right: var(--border-width) solid var(--color-border);
  background: var(--color-background-card);
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}
.${v} .pbe-main {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

/* ---- Header ---- */
.${v} .pbe-headRow {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  width: 100%;
  flex-wrap: wrap;
  row-gap: var(--spacing-2);
}
.${v} .pbe-headRow .pbe-spring { flex: 1; }
.${v} .pbe-brandCol { display: flex; flex-direction: column; min-width: 0; }
.${v} .pbe-brandSub {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${v} .pbe-headStats {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  row-gap: var(--spacing-1);
  justify-content: flex-end;
}
.${v} .pbe-stat { display: flex; align-items: baseline; gap: 5px; }
.${v} .pbe-statValue {
  font-size: 15px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${v} .pbe-statLabel { font-size: 11px; color: var(--color-text-secondary); }

/* ---- Weights rail: preset chips (40px hit) + 84px criterion rows ---- */
.${v} .pbe-presetWrap { display: flex; flex-wrap: wrap; gap: var(--spacing-2); }
.${v} .pbe-presetChip {
  font: inherit;
  cursor: pointer;
  min-height: 40px;
  padding: 6px 12px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: none;
  font-size: 12px;
  color: var(--color-text-primary);
}
.${v} .pbe-presetChip:hover { background: var(--color-background-muted); }
.${v} .pbe-presetChip[aria-pressed='true'] {
  border-color: ${y};
  color: ${y};
  background: ${b};
  font-weight: 650;
}
.${v} .pbe-critList { display: flex; flex-direction: column; }
.${v} .pbe-critRow {
  min-height: 84px;
  padding-block: var(--spacing-2);
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}
.${v} .pbe-critRow:last-child { border-bottom: none; }
.${v} .pbe-critTop { display: flex; align-items: baseline; gap: var(--spacing-2); }
.${v} .pbe-critCode {
  font-family: ${D};
  font-size: 10px;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}
.${v} .pbe-critName {
  font-size: 12.5px;
  font-weight: 600;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
.${v} .pbe-critEff {
  font-size: 12.5px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${v} .pbe-critDelta {
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${v} .pbe-critDelta.is-up { color: ${S}; font-weight: 650; }
.${v} .pbe-critDelta.is-down { color: ${w}; font-weight: 650; }
.${v} .pbe-critDelta.is-flat { color: var(--color-text-secondary); }
.${v} .pbe-critBottom {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
  font-size: 10.5px;
  color: var(--color-text-secondary);
}
.${v} .pbe-critBottom .pbe-spring { flex: 1; }
.${v} .pbe-critPts { font-variant-numeric: tabular-nums; }
.${v} .pbe-sumRow {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 11px;
  color: var(--color-text-secondary);
}
.${v} .pbe-sumRow b {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
}

/* ---- Podium: blocks 116/96/84, displayed 2nd · 1st · 3rd ---- */
.${v} .pbe-podium {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}
.${v} .pbe-podiumBlock {
  flex: 1;
  min-width: 150px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  background: ${b};
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 2px;
  min-height: 96px;
}
.${v} .pbe-podiumBlock.is-first {
  min-height: 116px;
  background: ${x};
  border-color: ${y};
}
.${v} .pbe-podiumBlock.is-third { min-height: 84px; }
.${v} .pbe-podiumRank {
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${y};
  display: flex;
  align-items: center;
  gap: 6px;
}
.${v} .pbe-podiumName {
  font-size: 13.5px;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${v} .pbe-podiumTotal {
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}
.${v} .pbe-podiumMeta {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 11px;
  color: var(--color-text-secondary);
}
.${v} .pbe-podiumWarn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 650;
  color: ${T};
}

/* ---- Movement markers ---- */
.${v} .pbe-move {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${v} .pbe-move.is-up { color: ${S}; }
.${v} .pbe-move.is-down { color: ${w}; }
.${v} .pbe-move.is-flat { color: var(--color-text-secondary); }

/* ---- Section cards ---- */
.${v} .pbe-card {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  background: var(--color-background-card);
  overflow: hidden;
}
.${v} .pbe-cardHead {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${v} .pbe-cardHead .pbe-spring { flex: 1; }

/* ---- Matrix: 200px vendor + 6 × minmax(64px,1fr) + 104px total.
   Header 40px, rows 56px, min-width 688px in a scroller. ---- */
.${v} .pbe-matrixScroll { overflow-x: auto; }
.${v} .pbe-matrix {
  display: grid;
  grid-template-columns: 200px repeat(6, minmax(64px, 1fr)) 104px;
  min-width: 688px;
}
.${v} .pbe-mxColHead {
  height: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  border-bottom: var(--border-width) solid var(--color-border);
  padding-inline: 4px;
}
.${v} .pbe-colCode {
  font-family: ${D};
  font-size: 10px;
  font-weight: 650;
  letter-spacing: 0.05em;
}
.${v} .pbe-colWeight {
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${v} .pbe-mxColHead.is-vendor {
  align-items: flex-start;
  padding-inline: var(--spacing-3);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.${v} .pbe-mxColHead.is-total { align-items: flex-end; padding-inline: var(--spacing-3); }
.${v} .pbe-vendorCell {
  height: 56px;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding-inline: var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  min-width: 0;
}
.${v} .pbe-rankNum {
  font-size: 17px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  width: 18px;
  text-align: center;
  flex-shrink: 0;
}
.${v} .pbe-vendorInfo { min-width: 0; flex: 1; display: flex; flex-direction: column; }
.${v} .pbe-vendorName {
  font-size: 12.5px;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${v} .pbe-vendorBid {
  font-size: 10.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${v} .pbe-flagChip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 9.5px;
  font-weight: 650;
  color: ${T};
  white-space: nowrap;
}
.${v} .pbe-scoreCell {
  position: relative;
  height: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border-bottom: var(--border-width) solid var(--color-border);
  border-left: var(--border-width) solid var(--color-border);
}
.${v} button.pbe-scoreCell:hover { background: var(--color-background-muted); }
.${v} .pbe-scoreCell[aria-pressed='true'] {
  background: ${b};
  box-shadow: inset 0 0 0 1px ${y};
}
.${v} .pbe-scoreVal {
  font-size: 13.5px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.${v} .pbe-scoreBar {
  width: 34px;
  height: 3px;
  border-radius: 999px;
  background: var(--color-background-muted);
  overflow: hidden;
}
.${v} .pbe-scoreBarFill {
  height: 100%;
  border-radius: 999px;
  background: ${y};
}
.${v} .pbe-divergeDot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: ${T};
}
.${v} .pbe-totalCell {
  height: 56px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  padding-inline: var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  border-left: var(--border-width) solid var(--color-border);
}
.${v} .pbe-totalVal {
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.${v} .pbe-totalDelta {
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${v} .pbe-totalDelta.is-up { color: ${S}; font-weight: 650; }
.${v} .pbe-totalDelta.is-down { color: ${w}; font-weight: 650; }
.${v} .pbe-totalDelta.is-flat { color: var(--color-text-secondary); }

/* ---- Matrix footer: 34px "panel best" row ---- */
.${v} .pbe-mxFoot {
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-left: var(--border-width) solid var(--color-border);
  font-size: 10.5px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${v} .pbe-mxFoot .pbe-mxFootVendor {
  font-family: ${D};
  font-size: 9.5px;
  letter-spacing: 0.04em;
  color: ${y};
}
.${v} .pbe-mxFoot.is-label {
  border-left: none;
  justify-content: flex-start;
  padding-inline: var(--spacing-3);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 600;
  font-size: 10px;
}
.${v} .pbe-mxFoot.is-total { justify-content: flex-end; padding-inline: var(--spacing-3); }

/* ---- Award-readiness gates: 44px rows + verdict chip ---- */
.${v} .pbe-gateRow {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  min-height: 44px;
  padding-inline: var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 12.5px;
}
.${v} .pbe-gateRow:last-child { border-bottom: none; }
.${v} .pbe-gateIcon { display: flex; flex-shrink: 0; }
.${v} .pbe-gateIcon.is-pass { color: ${S}; }
.${v} .pbe-gateIcon.is-warn { color: ${T}; }
.${v} .pbe-gateName { flex: 1; min-width: 0; }
.${v} .pbe-gateDetail {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  text-align: right;
}
.${v} .pbe-verdictChip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 24px;
  padding-inline: 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 650;
  white-space: nowrap;
}
.${v} .pbe-verdictChip.is-ready { color: ${S}; background: ${C}; }
.${v} .pbe-verdictChip.is-open { color: ${T}; background: ${E}; }

/* ---- Breakdown strip ---- */
.${v} .pbe-breakdown {
  min-height: 112px;
  padding: var(--spacing-3) var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
.${v} .pbe-bdTop {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.${v} .pbe-bdTitle { font-size: 13px; font-weight: 650; }
.${v} .pbe-bdMeta {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.${v} .pbe-panelWrap { display: flex; flex-wrap: wrap; gap: var(--spacing-2); align-items: center; }
.${v} .pbe-panelChip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding-inline: 10px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  font-size: 11.5px;
}
.${v} .pbe-panelChip b {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}
.${v} .pbe-spreadChip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  padding-inline: 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}
.${v} .pbe-spreadChip.is-diverged { color: ${T}; background: ${E}; }
.${v} .pbe-spreadChip.is-tight {
  color: var(--color-text-secondary);
  background: var(--color-background-muted);
}
.${v} .pbe-bdNote {
  font-size: 12px;
  line-height: 1.45;
  color: var(--color-text-secondary);
  border-left: 2px solid var(--color-border);
  padding-left: var(--spacing-3);
  margin: 0;
}

/* ---- Responsive: restack at 980; matrix scroller persists ---- */
@media (max-width: 980px) {
  .${v} .pbe-frame { display: block; overflow-y: auto; }
  .${v} .pbe-rail {
    border-right: none;
    border-bottom: var(--border-width) solid var(--color-border);
    overflow-y: visible;
  }
  .${v} .pbe-main { overflow-y: visible; }
  .${v} .pbe-critList {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: var(--spacing-4);
  }
}
@media (max-width: 640px) {
  .${v} .pbe-critList { display: flex; flex-direction: column; }
  .${v} .pbe-podiumBlock { min-width: 120px; }
}
`,ie=`RFP-2026-014`,ae=`Fleet Telematics Platform`,oe=`Northwind Regional Transit`,O=`Aug 14, 2026`,k=`Jun 30, 2026`,A=[{id:`TECH`,name:`Technical fit`,hint:`GPS density, CAN-bus depth, API surface`},{id:`SEC`,name:`Security & compliance`,hint:`SOC 2, encryption, breach history`},{id:`IMPL`,name:`Implementation plan`,hint:`Rollout phasing across 412 vehicles`},{id:`SLA`,name:`Support & SLA`,hint:`Response tiers, uptime commitments`},{id:`COST`,name:`3-year TCO`,hint:`Licenses, hardware, install, data fees`},{id:`VIA`,name:`Vendor viability`,hint:`Financials, references, roadmap`}],se=new Map(A.map(e=>[e.id,e])),j={TECH:25,SEC:20,IMPL:15,SLA:10,COST:20,VIA:10},M=[{id:`baseline`,label:`Committee baseline`,weights:j},{id:`cost`,label:`Cost-focused`,weights:{TECH:15,SEC:15,IMPL:10,SLA:10,COST:40,VIA:10}},{id:`security`,label:`Security-first`,weights:{TECH:20,SEC:35,IMPL:10,SLA:15,COST:10,VIA:10}}],N=[{id:`okafor`,name:`Rina Okafor`,role:`Engineering lead`},{id:`whitfield`,name:`Sam Whitfield`,role:`Security architect`},{id:`paredes`,name:`Julia Paredes`,role:`Procurement officer`}],P=[{id:`novora`,name:`Novora Systems`,city:`Columbus, OH`,bid:`$1.42M`,detail:`640 fleet deployments · incumbent at two peer agencies`,flag:null},{id:`kestrel`,name:`Kestrel Dynamics`,city:`Bellevue, WA`,bid:`$1.65M`,detail:`FedRAMP Moderate · strongest security posture in the pool`,flag:null},{id:`meridian`,name:`Meridian Trackworks`,city:`Denver, CO`,bid:`$1.31M`,detail:`Balanced bid · regional install crews on staff`,flag:null},{id:`atlas`,name:`Atlas FleetIQ`,city:`Austin, TX`,bid:`$1.18M`,detail:`Aggressive pricing · support desk is US business hours only`,flag:null},{id:`orbitline`,name:`Orbitline Labs`,city:`Raleigh, NC`,bid:`$0.98M`,detail:`Lowest bid · 3-year-old company, 2 transit references`,flag:`SOC 2 Type II pending`}],ce=new Map(P.map(e=>[e.id,e])),F={novora:{TECH:[9.5,9,8.5],SEC:[8,8,8],IMPL:[9,8.5,8],SLA:[8.5,8,7.5],COST:[7,7,7],VIA:[9,9,9]},kestrel:{TECH:[9,8.5,8],SEC:[10,9.5,9],IMPL:[8,8,8],SLA:[9.5,9,8.5],COST:[6,5.5,5],VIA:[8.5,8.5,8.5]},meridian:{TECH:[8,7.5,7],SEC:[7.5,7.5,7.5],IMPL:[8.5,8,7.5],SLA:[8,8,8],COST:[7.5,7.5,7.5],VIA:[8,8,8]},atlas:{TECH:[8,7,6],SEC:[7,6.5,6],IMPL:[7,7,7],SLA:[7,6,5],COST:[9,9,9],VIA:[7,7,7]},orbitline:{TECH:[7.5,6.5,5.5],SEC:[6,5,4],IMPL:[6,6,6],SLA:[6.5,6.5,6.5],COST:[9.5,9.5,9.5],VIA:[6.5,5.5,4.5]}},le={"novora:TECH":{text:`Okafor: deepest CAN-bus signal catalog in the pool; live API sandbox handled our 412-vehicle simulation without throttling.`},"novora:COST":{text:`Paredes: mid-pack pricing, but the incumbent-adjacent integrations at two peer agencies de-risk the install line item.`},"kestrel:SEC":{text:`Whitfield: only bidder with FedRAMP Moderate and a clean 3-year breach history; keys rotate through their own HSM.`},"kestrel:COST":{text:`Paredes: premium hardware pushes the 3-year TCO 68% above the low bid — strongest candidate for a BAFO price round.`},"meridian:IMPL":{text:`Okafor: phased depot-by-depot rollout with their own regional install crews; the 14-week plan matched our blackout calendar.`},"atlas:TECH":{text:`Panel split 8/7/6: Okafor liked the driver-coaching module; Paredes scored down for the closed data-export format.`},"atlas:SLA":{text:`Panel split 7/6/5: US-business-hours support only — night-service coverage for the bus fleet is an open clarification.`},"orbitline:TECH":{text:`Panel split 7.5/6.5/5.5: slick dashboard, but the CAN-bus catalog covers only 60% of our coach models today.`},"orbitline:SEC":{text:`Whitfield: SOC 2 Type II audit still in fieldwork — score capped until the report lands; award would be conditional.`},"orbitline:VIA":{text:`Panel split 6.5/5.5/4.5: 3-year-old company, two transit references; Paredes flagged single-datacenter hosting.`}},I=2;function L(e){return Math.round((e[0]+e[1]+e[2])/3*10)/10}function R(e){return Math.round((Math.max(e[0],e[1],e[2])-Math.min(e[0],e[1],e[2]))*10)/10}function z(e){return A.reduce((t,n)=>t+e[n.id],0)}function B(e,t){let n=z(t);if(n===0)return 0;let r=0;for(let i of A)r+=L(F[e][i.id])*(t[i.id]/n)*10;return Math.round(r*10)/10}function V(e){let t=P.map(e=>({id:e.id,total:B(e.id,j)})).sort((e,t)=>t.total-e.total||e.id.localeCompare(t.id)),n=new Map(t.map((e,t)=>[e.id,t+1])),r=new Map(t.map(e=>[e.id,e.total]));return P.map(t=>({vendor:t,total:B(t.id,e)})).sort((e,t)=>t.total-e.total||e.vendor.id.localeCompare(t.vendor.id)).map((e,t)=>{let i=n.get(e.vendor.id)??t+1,a=r.get(e.vendor.id)??e.total;return{vendor:e.vendor,total:e.total,rank:t+1,baselineRank:i,baselineTotal:a,movement:i-(t+1),totalDelta:Math.round((e.total-a)*10)/10}})}function H(e,t){return A.every(n=>e[n.id]===t[n.id])}var U=e=>e.toFixed(1),W=e=>`${e>0?`+`:``}${e.toFixed(1)}`;function ue(){return(0,_.jsxs)(`svg`,{width:`26`,height:`26`,viewBox:`0 0 26 26`,"aria-hidden":!0,focusable:`false`,children:[(0,_.jsx)(`rect`,{x:`1.5`,y:`1.5`,width:`23`,height:`23`,rx:`6`,fill:`none`,stroke:y,strokeWidth:`2.2`}),(0,_.jsx)(`rect`,{x:`6.5`,y:`13`,width:`3.6`,height:`6.5`,rx:`1.2`,fill:y}),(0,_.jsx)(`rect`,{x:`11.2`,y:`8`,width:`3.6`,height:`11.5`,rx:`1.2`,fill:y}),(0,_.jsx)(`rect`,{x:`15.9`,y:`10.8`,width:`3.6`,height:`8.7`,rx:`1.2`,fill:y})]})}function G({movement:e}){return e>0?(0,_.jsxs)(`span`,{className:`pbe-move is-up`,"aria-label":`up ${e} vs baseline`,children:[(0,_.jsx)(c,{size:11,"aria-hidden":!0}),e]}):e<0?(0,_.jsxs)(`span`,{className:`pbe-move is-down`,"aria-label":`down ${Math.abs(e)} vs baseline`,children:[(0,_.jsx)(u,{size:11,"aria-hidden":!0}),Math.abs(e)]}):(0,_.jsx)(`span`,{className:`pbe-move is-flat`,"aria-label":`unchanged vs baseline`,children:(0,_.jsx)(a,{size:11,"aria-hidden":!0})})}function K(){let[e,t]=(0,g.useState)(j),[n,a]=(0,g.useState)({vendor:`atlas`,crit:`SLA`}),c=V(e),u=z(e),y=H(e,j),b=c[0],x=Math.round((c[0].total-c[1].total)*10)/10,S=M.find(t=>H(e,t.weights))?.id??null,C=t=>u===0?0:e[t]/u*100,w=z(j),T=e=>Math.round((C(e)-j[e]/w*100)*10)/10,E=(e,n)=>{t(t=>({...t,[e]:n}))},D=(e,t)=>{a(n=>n!=null&&n.vendor===e&&n.crit===t?null:{vendor:e,crit:t})},B=(0,_.jsx)(p,{hasDivider:!0,children:(0,_.jsxs)(`div`,{className:`pbe-headRow`,children:[(0,_.jsx)(ue,{}),(0,_.jsxs)(`div`,{className:`pbe-brandCol`,children:[(0,_.jsx)(m,{level:1,children:`Bidframe — Bid Evaluator`}),(0,_.jsxs)(`span`,{className:`pbe-brandSub`,children:[ie,` · `,ae,` · `,oe]})]}),(0,_.jsx)(te,{label:`Evaluation`,variant:`info`}),(0,_.jsx)(`div`,{className:`pbe-spring`}),(0,_.jsxs)(`div`,{className:`pbe-headStats`,children:[(0,_.jsxs)(`div`,{className:`pbe-stat`,children:[(0,_.jsx)(`span`,{className:`pbe-statValue`,children:P.length}),(0,_.jsxs)(`span`,{className:`pbe-statLabel`,children:[`sealed bids · opened `,k]})]}),(0,_.jsxs)(`div`,{className:`pbe-stat`,children:[(0,_.jsx)(`span`,{className:`pbe-statValue`,children:b.vendor.name}),(0,_.jsxs)(`span`,{className:`pbe-statLabel`,children:[`leads by `,U(x),` pts`]})]}),(0,_.jsxs)(`div`,{className:`pbe-stat`,children:[(0,_.jsx)(`span`,{className:`pbe-statValue`,children:O}),(0,_.jsx)(`span`,{className:`pbe-statLabel`,children:`award target`})]})]})]})}),K=(0,_.jsxs)(`aside`,{className:`pbe-rail`,"aria-label":`Evaluation weights`,children:[(0,_.jsx)(`span`,{className:`pbe-overline`,children:`Evaluation weights`}),(0,_.jsx)(`div`,{className:`pbe-presetWrap`,children:M.map(e=>(0,_.jsx)(`button`,{type:`button`,className:`pbe-presetChip`,"aria-pressed":S===e.id,onClick:()=>t(e.weights),children:e.label},e.id))}),(0,_.jsx)(`div`,{className:`pbe-critList`,children:A.map(t=>{let n=T(t.id),r=n>0?`pbe-critDelta is-up`:n<0?`pbe-critDelta is-down`:`pbe-critDelta is-flat`;return(0,_.jsxs)(`div`,{className:`pbe-critRow`,children:[(0,_.jsxs)(`div`,{className:`pbe-critTop`,children:[(0,_.jsx)(`span`,{className:`pbe-critCode`,children:t.id}),(0,_.jsx)(`span`,{className:`pbe-critName`,title:t.hint,children:t.name}),(0,_.jsxs)(`span`,{className:`pbe-critEff`,children:[C(t.id).toFixed(1),`%`]})]}),(0,_.jsx)(h,{label:`${t.name} weight (points)`,isLabelHidden:!0,value:e[t.id],min:0,max:40,step:1,valueDisplay:`none`,formatValue:e=>`${e} points`,width:`100%`,onChange:e=>E(t.id,e)}),(0,_.jsxs)(`div`,{className:`pbe-critBottom`,children:[(0,_.jsxs)(`span`,{className:`pbe-critPts`,children:[e[t.id],` pts`]}),(0,_.jsx)(`div`,{className:`pbe-spring`}),(0,_.jsx)(`span`,{className:r,children:n===0?`at baseline`:`${W(n)} pp vs baseline`})]})]},t.id)})}),(0,_.jsxs)(`div`,{className:`pbe-sumRow`,children:[(0,_.jsx)(i,{icon:o,size:`sm`,color:`secondary`}),(0,_.jsxs)(`span`,{children:[`Weight points: `,(0,_.jsx)(`b`,{children:u}),` · effective weights normalize automatically`]})]}),(0,_.jsx)(ne,{label:`Reset to committee baseline`,variant:`secondary`,size:`sm`,isDisabled:y,onClick:()=>t(j)})]}),de=(0,_.jsx)(`section`,{className:`pbe-podium`,"aria-label":`Rank podium`,children:[c[1],c[0],c[2]].map(e=>(0,_.jsxs)(`div`,{className:e.rank===1?`pbe-podiumBlock is-first`:e.rank===3?`pbe-podiumBlock is-third`:`pbe-podiumBlock`,children:[(0,_.jsxs)(`span`,{className:`pbe-podiumRank`,children:[`#`,e.rank,(0,_.jsx)(G,{movement:e.movement})]}),(0,_.jsx)(`span`,{className:`pbe-podiumName`,children:e.vendor.name}),(0,_.jsx)(`span`,{className:`pbe-podiumTotal`,children:U(e.total)}),(0,_.jsxs)(`span`,{className:`pbe-podiumMeta`,children:[(0,_.jsxs)(`span`,{children:[e.vendor.bid,` 3-yr TCO`]}),!y&&(0,_.jsxs)(`span`,{className:e.totalDelta>0?`pbe-totalDelta is-up`:e.totalDelta<0?`pbe-totalDelta is-down`:`pbe-totalDelta is-flat`,children:[W(e.totalDelta),` vs baseline`]})]}),e.vendor.flag!=null&&(0,_.jsxs)(`span`,{className:`pbe-podiumWarn`,children:[(0,_.jsx)(d,{size:11,"aria-hidden":!0}),`Conditional — `,e.vendor.flag]})]},e.vendor.id))}),fe=(0,_.jsxs)(`section`,{className:`pbe-card`,"aria-label":`Vendor by criteria scoring matrix`,children:[(0,_.jsxs)(`div`,{className:`pbe-cardHead`,children:[(0,_.jsx)(`span`,{className:`pbe-overline`,children:`Scoring matrix — vendors × criteria`}),(0,_.jsx)(`div`,{className:`pbe-spring`}),(0,_.jsxs)(r,{type:`supporting`,color:`secondary`,children:[y?`committee-baseline weights`:`adjusted weights`,` · click a cell for the panel breakdown`]})]}),(0,_.jsx)(`div`,{className:`pbe-matrixScroll`,children:(0,_.jsxs)(`div`,{className:`pbe-matrix`,children:[(0,_.jsx)(`div`,{className:`pbe-mxColHead is-vendor`,children:`Vendor / bid`}),A.map(e=>(0,_.jsxs)(`div`,{className:`pbe-mxColHead`,title:`${e.name} — ${e.hint}`,children:[(0,_.jsx)(`span`,{className:`pbe-colCode`,children:e.id}),(0,_.jsxs)(`span`,{className:`pbe-colWeight`,children:[C(e.id).toFixed(1),`%`]})]},e.id)),(0,_.jsxs)(`div`,{className:`pbe-mxColHead is-total`,children:[(0,_.jsx)(`span`,{className:`pbe-colCode`,children:`TOTAL`}),(0,_.jsx)(`span`,{className:`pbe-colWeight`,children:`of 100`})]}),c.map(e=>(0,_.jsxs)(`div`,{style:{display:`contents`},children:[(0,_.jsxs)(`div`,{className:`pbe-vendorCell`,children:[(0,_.jsx)(`span`,{className:`pbe-rankNum`,children:e.rank}),(0,_.jsx)(G,{movement:e.movement}),(0,_.jsxs)(`span`,{className:`pbe-vendorInfo`,children:[(0,_.jsx)(`span`,{className:`pbe-vendorName`,title:e.vendor.detail,children:e.vendor.name}),(0,_.jsxs)(`span`,{className:`pbe-vendorBid`,children:[e.vendor.bid,` · `,e.vendor.city]}),e.vendor.flag!=null&&(0,_.jsxs)(`span`,{className:`pbe-flagChip`,children:[(0,_.jsx)(d,{size:9,"aria-hidden":!0}),e.vendor.flag]})]})]}),A.map(t=>{let r=F[e.vendor.id][t.id],i=L(r),a=R(r),o=a>=I;return(0,_.jsxs)(`button`,{type:`button`,className:`pbe-btn pbe-scoreCell`,"aria-pressed":n!=null&&n.vendor===e.vendor.id&&n.crit===t.id,"aria-label":`${e.vendor.name}, ${t.name}: consensus ${U(i)} of 10, panel spread ${U(a)}${o?` (diverged)`:``}`,onClick:()=>D(e.vendor.id,t.id),children:[(0,_.jsx)(`span`,{className:`pbe-scoreVal`,children:U(i)}),(0,_.jsx)(`span`,{className:`pbe-scoreBar`,"aria-hidden":!0,children:(0,_.jsx)(`span`,{className:`pbe-scoreBarFill`,style:{width:`${i*10}%`}})}),o&&(0,_.jsx)(`span`,{className:`pbe-divergeDot`,title:`Panel spread ${U(a)} — scores diverge`})]},t.id)}),(0,_.jsxs)(`div`,{className:`pbe-totalCell`,children:[(0,_.jsx)(`span`,{className:`pbe-totalVal`,children:U(e.total)}),(0,_.jsx)(`span`,{className:y?`pbe-totalDelta is-flat`:e.totalDelta>0?`pbe-totalDelta is-up`:e.totalDelta<0?`pbe-totalDelta is-down`:`pbe-totalDelta is-flat`,children:y?`baseline`:W(e.totalDelta)})]})]},e.vendor.id)),(0,_.jsx)(`div`,{className:`pbe-mxFoot is-label`,children:`Panel best`}),A.map(e=>{let t=P[0],n=-1;for(let r of P){let i=L(F[r.id][e.id]);i>n&&(n=i,t=r)}return(0,_.jsxs)(`div`,{className:`pbe-mxFoot`,title:`${t.name} leads ${e.name}`,children:[U(n),(0,_.jsx)(`span`,{className:`pbe-mxFootVendor`,children:t.name.split(` `)[0].toUpperCase()})]},e.id)}),(0,_.jsxs)(`div`,{className:`pbe-mxFoot is-total`,children:[`Δ `,U(x),` pts`]})]})})]}),q=[{id:`scores`,label:`All panel scorecards recorded`,state:`pass`,detail:`30 cells × 3 scorers = 90 scores`},{id:`compliance`,label:`Leader clear of compliance conditions`,state:b.vendor.flag==null?`pass`:`warn`,detail:b.vendor.flag==null?`no conditions on ${b.vendor.name}`:`conditional — ${b.vendor.flag}`},{id:`margin`,label:`Decisive margin over runner-up (≥ 3.0 pts)`,state:x>=3?`pass`:`warn`,detail:x>=3?`${U(x)} pts vs ${c[1].vendor.name}`:`${U(x)} pts vs ${c[1].vendor.name} — recommend a BAFO round`}],J=q.reduce((e,t)=>e+(t.state===`pass`?0:1),0),Y=(0,_.jsxs)(`section`,{className:`pbe-card`,"aria-label":`Award readiness gates`,children:[(0,_.jsxs)(`div`,{className:`pbe-cardHead`,children:[(0,_.jsx)(`span`,{className:`pbe-overline`,children:`Award readiness`}),(0,_.jsx)(`div`,{className:`pbe-spring`}),(0,_.jsxs)(`span`,{className:J===0?`pbe-verdictChip is-ready`:`pbe-verdictChip is-open`,children:[J===0?(0,_.jsx)(l,{size:12,"aria-hidden":!0}):(0,_.jsx)(d,{size:12,"aria-hidden":!0}),J===0?`Ready to recommend ${b.vendor.name}`:`Not ready — ${J} gate${J===1?``:`s`} open`]})]}),(0,_.jsx)(`div`,{children:q.map(e=>(0,_.jsxs)(`div`,{className:`pbe-gateRow`,children:[(0,_.jsx)(`span`,{className:`pbe-gateIcon is-${e.state}`,children:e.state===`pass`?(0,_.jsx)(l,{size:15,"aria-hidden":!0}):(0,_.jsx)(d,{size:15,"aria-hidden":!0})}),(0,_.jsx)(`span`,{className:`pbe-gateName`,children:e.label}),(0,_.jsx)(`span`,{className:`pbe-gateDetail`,children:e.detail})]},e.id))})]}),X=n==null?void 0:ce.get(n.vendor),Z=n==null?void 0:se.get(n.crit),Q=n==null?void 0:c.find(e=>e.vendor.id===n.vendor),$=(0,_.jsx)(r,{type:`supporting`,color:`secondary`,children:`Click any score cell to see the three panelist scores behind the consensus, the spread, and this cell's weighted contribution.`});if(n!=null&&X!=null&&Z!=null&&Q!=null){let e=F[n.vendor][n.crit],t=L(e),i=R(e),a=i>=I,o=Math.round(t*(C(n.crit)/100)*10*10)/10,s=le[`${n.vendor}:${n.crit}`];$=(0,_.jsxs)(_.Fragment,{children:[(0,_.jsxs)(`div`,{className:`pbe-bdTop`,children:[(0,_.jsxs)(`span`,{className:`pbe-bdTitle`,children:[X.name,` · `,Z.name]}),(0,_.jsxs)(`span`,{className:`pbe-bdMeta`,children:[Z.id,` · effective weight `,C(n.crit).toFixed(1),`% · contributes `,U(o),` of `,U(Q.total),` pts`]})]}),(0,_.jsxs)(`div`,{className:`pbe-panelWrap`,children:[N.map((t,n)=>(0,_.jsxs)(`span`,{className:`pbe-panelChip`,title:t.role,children:[t.name,` `,(0,_.jsx)(`b`,{children:U(e[n])})]},t.id)),(0,_.jsxs)(`span`,{className:a?`pbe-spreadChip is-diverged`:`pbe-spreadChip is-tight`,children:[`spread `,U(i)]}),(0,_.jsxs)(`span`,{className:`pbe-spreadChip is-tight`,children:[`consensus `,U(t)]})]}),s==null?(0,_.jsxs)(r,{type:`supporting`,color:`secondary`,children:[`No scorer note on this cell — the panel scored within`,` `,U(i),` points of each other.`]}):(0,_.jsx)(`p`,{className:`pbe-bdNote`,children:s.text})]})}let pe=(0,_.jsxs)(`section`,{className:`pbe-card`,"aria-label":`Panel breakdown`,children:[(0,_.jsxs)(`div`,{className:`pbe-cardHead`,children:[(0,_.jsx)(i,{icon:s,size:`sm`,color:`secondary`}),(0,_.jsx)(`span`,{className:`pbe-overline`,children:`Panel breakdown`}),(0,_.jsx)(`div`,{className:`pbe-spring`}),(0,_.jsxs)(r,{type:`supporting`,color:`secondary`,children:[N.length,` scorers · consensus = panel mean`]})]}),(0,_.jsx)(`div`,{className:`pbe-breakdown`,children:$})]});return(0,_.jsxs)(`div`,{className:v,children:[(0,_.jsx)(`style`,{children:re}),(0,_.jsx)(`div`,{className:`pbe-vh`,"aria-live":`polite`,children:`${b.vendor.name} leads at ${U(b.total)} points`}),(0,_.jsx)(ee,{height:`fill`,header:B,content:(0,_.jsx)(f,{padding:0,children:(0,_.jsxs)(`div`,{className:`pbe-frame`,children:[K,(0,_.jsxs)(`main`,{className:`pbe-main`,children:[de,fe,pe,Y]})]})})})]})}export{K as default};