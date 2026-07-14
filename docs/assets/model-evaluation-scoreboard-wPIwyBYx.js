import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-DgVzIcJL.js";import{t as i}from"./Icon-Bv9dUoit.js";import{t as a}from"./flask-conical-BFyOaFFI.js";import{t as o}from"./gauge-BaVWZJXX.js";import{t as s}from"./minus-Dr8OdPPS.js";import{t as c}from"./octagon-alert-CAbo1xNr.js";import{t as ee}from"./plus-DNeUY4rU.js";import{t as l}from"./rocket-PHXrk9UZ.js";import{t as te}from"./rotate-ccw-DLPUmPRU.js";import{t as u}from"./scale-BACoYSVy.js";import{t as d}from"./shield-check-BH79s8U3.js";import{t as f}from"./timer-CuSZYRQs.js";import{b as p,w as m}from"./index-784iMtOZ.js";import{t as h}from"./HStack-2WTukjNp.js";import{t as ne}from"./VStack-B8U-hI0Y.js";import{t as re}from"./StackItem-Ca9P7L2I.js";import{n as ie,t as ae}from"./LayoutContent-CCL91W7X.js";import{t as oe}from"./LayoutHeader-Cy2mWoMf.js";import{t as g}from"./Heading-DAgevMWr.js";import{t as _}from"./Button-CPJJaCfy.js";var v=e(t(),1),y=n(),b=`tpl-model-evaluation-scoreboard`,x=`light-dark(#1D4ED8, #60A5FA)`,S=`light-dark(#FFFFFF, #0B1B36)`,C=`light-dark(rgba(29, 78, 216, 0.10), rgba(96, 165, 250, 0.16))`,w=`light-dark(#15803D, #4ADE80)`,T=`light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))`,E=`light-dark(#DC2626, #F87171)`,D=`light-dark(rgba(220, 38, 38, 0.10), rgba(248, 113, 113, 0.14))`,O={candidate:`aster-2.1-rc3`,baseline:`aster-2.0`,evalRun:`#418`,when:`Tue, Jul 7, 2026`,harness:`benchline-harness 3.2`},se=[{id:`rc3`,model:`aster-2.1-rc3`,tag:`candidate`,note:`this review`,reasoning:84.2,code:78.9,retrieval:88.4,safety:99.2,p95:812,cost:.42},{id:`rc2`,model:`aster-2.1-rc2`,tag:null,note:`held Jun 30`,reasoning:83.1,code:78.2,retrieval:86.3,safety:98.4,p95:799,cost:.42},{id:`prod`,model:`aster-2.0`,tag:`baseline`,note:`production`,reasoning:82.6,code:76.1,retrieval:87.9,safety:99,p95:748,cost:.45},{id:`comet`,model:`comet-1.3`,tag:null,note:`external ref`,reasoning:85,code:74.5,retrieval:84.1,safety:97.8,p95:1040,cost:.61},{id:`mini`,model:`aster-mini-1.8`,tag:null,note:`edge tier`,reasoning:74.3,code:66,retrieval:79.2,safety:98.9,p95:388,cost:.09}];function k(e){return(e.reasoning+e.code+e.retrieval+e.safety)/4}var A=78,j=90,M=[{id:`en-us`,label:`en-US general`,n:1240,accDelta:1.8,halluc:1.6,refusal:99.4,latDelta:52,judgeLlm:88,judgeHuman:86},{id:`es-419`,label:`es-419 general`,n:640,accDelta:-.2,halluc:2.1,refusal:99,latDelta:48,judgeLlm:84,judgeHuman:81},{id:`de-de`,label:`de-DE general`,n:512,accDelta:.9,halluc:1.9,refusal:99.1,latDelta:55,judgeLlm:85,judgeHuman:83},{id:`ja-jp`,label:`ja-JP general`,n:488,accDelta:.6,halluc:4.1,refusal:98.8,latDelta:58,judgeLlm:82,judgeHuman:77},{id:`code-py`,label:`code-python`,n:900,accDelta:2.4,halluc:1.2,refusal:99.6,latDelta:31,judgeLlm:90,judgeHuman:88},{id:`code-sql`,label:`code-sql`,n:410,accDelta:1.1,halluc:1.8,refusal:99.3,latDelta:40,judgeLlm:86,judgeHuman:84},{id:`long-ctx`,label:`long-context-32k`,n:260,accDelta:.3,halluc:2.8,refusal:98.6,latDelta:142,judgeLlm:80,judgeHuman:75},{id:`adversarial`,label:`adversarial-injection`,n:350,accDelta:-.1,halluc:5.2,refusal:98.2,latDelta:36,judgeLlm:71,judgeHuman:62},{id:`low-res`,label:`low-resource-sw`,n:180,accDelta:-.3,halluc:2.9,refusal:98.4,latDelta:44,judgeLlm:77,judgeHuman:70}],ce=M.reduce((e,t)=>e+t.n,0);function N(e){return e.judgeLlm-e.judgeHuman}var P=[`acc`,`halluc`,`refusal`,`latency`,`agreement`],F={acc:{id:`acc`,label:`Accuracy floor`,icon:o,dir:`gte`,unit:`pp`,min:-3,max:1,step:.25,defaultThreshold:-.5,rule:`Δ accuracy ≥`,digits:2,signed:!0},halluc:{id:`halluc`,label:`Hallucination cap`,icon:c,dir:`lte`,unit:`%`,min:1,max:6,step:.5,defaultThreshold:3,rule:`hallucination ≤`,digits:1,signed:!1},refusal:{id:`refusal`,label:`Refusal correctness`,icon:d,dir:`gte`,unit:`%`,min:90,max:100,step:.5,defaultThreshold:98,rule:`refusal OK ≥`,digits:1,signed:!1},latency:{id:`latency`,label:`Latency budget`,icon:f,dir:`lte`,unit:`ms`,min:0,max:200,step:10,defaultThreshold:60,rule:`Δ p95 ≤`,digits:0,signed:!0},agreement:{id:`agreement`,label:`Judge agreement`,icon:u,dir:`lte`,unit:`pts`,min:2,max:12,step:1,defaultThreshold:6,rule:`judge gap ≤`,digits:0,signed:!1}},I=[`acc`,`halluc`,`refusal`,`latency`];function L(){return{acc:{threshold:F.acc.defaultThreshold,enabled:!0},halluc:{threshold:F.halluc.defaultThreshold,enabled:!0},refusal:{threshold:F.refusal.defaultThreshold,enabled:!0},latency:{threshold:F.latency.defaultThreshold,enabled:!0},agreement:{threshold:F.agreement.defaultThreshold,enabled:!0}}}function R(e,t){switch(t){case`acc`:return e.accDelta;case`halluc`:return e.halluc;case`refusal`:return e.refusal;case`latency`:return e.latDelta;case`agreement`:return N(e)}}function z(e,t,n){return F[e].dir===`gte`?n>=t:n<=t}function B(e,t){let n=F[e],r=e===`acc`?1:n.digits,i=Math.abs(t).toFixed(r);return t<0?`−${i}`:n.signed?`+${i}`:i}function V(e,t){let n=F[e],r=0;n.step===.25?r=Math.round(Math.abs(t)*100)%50==0?1:2:n.step===.5&&(r=1);let i=Math.abs(t).toFixed(r);return t<0?`−${i}`:n.signed&&t>0?`+${i}`:i}var H=`
.${b} {
  font-family: var(--font-family-sans);
}
.${b} button {
  font: inherit;
  color: inherit;
}
.${b} .mes-focusable:focus-visible {
  outline: 2px solid ${x};
  outline-offset: 2px;
}
.${b} .mes-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.${b} .mes-header-row {
  padding: var(--spacing-2) var(--spacing-4);
  min-height: 56px;
  box-sizing: border-box;
}
.${b} .mes-mark {
  display: inline-flex;
  flex-shrink: 0;
  color: ${x};
}
/* 20px header chips; the verdict chip recolors with the derived verdict. */
.${b} .mes-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  background: var(--color-background-surface);
  white-space: nowrap;
}
.${b} .mes-chip-ship { color: ${w}; border-color: ${w}; background: ${T}; }
.${b} .mes-chip-hold { color: ${E}; border-color: ${E}; background: ${D}; }
.${b} .mes-chip-candidate { color: ${x}; border-color: ${x}; background: ${C}; }

/* --- body frame: main column + gate rail 336 ------------------------------ */
.${b} .mes-body {
  display: flex;
  height: 100%;
  min-height: 0;
}
.${b} .mes-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-3) var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}
.${b} .mes-rail {
  width: 336px;
  flex-shrink: 0;
  min-height: 0;
  overflow-y: auto;
  border-left: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  padding: var(--spacing-3);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

/* --- panels: bordered, 32px uppercase heads -------------------------------- */
.${b} .mes-panel {
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-surface);
  overflow: hidden;
  flex-shrink: 0;
}
.${b} .mes-panel-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 32px;
  box-sizing: border-box;
  padding: 0 12px;
  border-bottom: var(--border-width) solid var(--color-border);
  background: var(--color-background-muted);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${b} .mes-panel-scroll {
  overflow-x: auto;
}

/* --- leaderboard: 40px rows · 180 + 72 + 6×68 grid ------------------------- */
.${b} .mes-lb {
  display: grid;
  grid-template-columns: 180px 72px repeat(6, 68px);
  min-width: max-content;
}
.${b} .mes-lb-head {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 28px;
  box-sizing: border-box;
  padding: 0 10px;
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 10px;
  font-weight: 650;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${b} .mes-lb-head:first-child { justify-content: flex-start; }
.${b} .mes-lb-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 40px;
  box-sizing: border-box;
  padding: 0 10px;
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  white-space: nowrap;
}
.${b} .mes-lb-row-candidate .mes-lb-cell { background: ${C}; }
.${b} .mes-lb-model {
  justify-content: flex-start;
  gap: 6px;
  min-width: 0;
}
.${b} .mes-lb-model .mes-model-name {
  font-weight: 650;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${b} .mes-lb-model .mes-model-note {
  font-size: 10px;
  color: var(--color-text-secondary);
}
.${b} .mes-tag {
  flex-shrink: 0;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 1px 5px;
  border-radius: 4px;
}
.${b} .mes-tag-candidate { color: ${S}; background: ${x}; }
.${b} .mes-tag-baseline {
  color: var(--color-text-secondary);
  border: var(--border-width) solid var(--color-border);
}
/* Composite cell: value over an inline bar scaled on the 78–90 domain. */
.${b} .mes-composite {
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
  font-weight: 650;
}
.${b} .mes-composite-bar {
  width: 52px;
  height: 4px;
  border-radius: 2px;
  background: var(--color-background-muted);
  overflow: hidden;
}
.${b} .mes-composite-bar > span {
  display: block;
  height: 100%;
  border-radius: 2px;
  background: ${x};
}

/* --- slice regression matrix: 36px rows · 172 + 4×92 grid ------------------ */
.${b} .mes-mx {
  display: grid;
  grid-template-columns: 172px repeat(4, 92px);
  min-width: max-content;
}
.${b} .mes-mx-head {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  min-height: 40px;
  box-sizing: border-box;
  padding: 3px 10px;
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 10px;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${b} .mes-mx-head:first-child { align-items: flex-start; }
.${b} .mes-mx-head .mes-mx-rule {
  font-size: 10px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  font-variant-numeric: tabular-nums;
}
.${b} .mes-mx-head .mes-mx-rule-off { text-decoration: line-through; opacity: 0.7; }
/* Slice rows are buttons: the whole row is the selection affordance. */
.${b} .mes-mx-slice {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  box-sizing: border-box;
  padding: 0 10px;
  border: none;
  border-bottom: var(--border-width) solid var(--color-border);
  background: transparent;
  text-align: left;
  cursor: pointer;
  min-width: 0;
}
@media (hover: hover) {
  .${b} .mes-mx-slice:hover { background: var(--color-background-muted); }
}
.${b} .mes-mx-slice[aria-pressed='true'] {
  background: ${C};
  box-shadow: inset 3px 0 0 0 ${x};
}
.${b} .mes-mx-slice .mes-slice-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${b} .mes-mx-slice .mes-slice-n {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${b} .mes-mx-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  min-height: 36px;
  box-sizing: border-box;
  padding: 0 10px;
  border-bottom: var(--border-width) solid var(--color-border);
  border-left: var(--border-width) solid var(--color-border);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  white-space: nowrap;
}
.${b} .mes-mx-cell-fail {
  background: ${D};
  color: ${E};
  font-weight: 650;
}
.${b} .mes-mx-cell-off { color: var(--color-text-secondary); }
.${b} .mes-mx-cell .mes-cell-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.${b} .mes-cell-dot-pass { background: ${w}; }
.${b} .mes-cell-dot-fail { background: ${E}; }
/* Selected-slice detail strip under the matrix. */
.${b} .mes-mx-detail {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  min-height: 32px;
  box-sizing: border-box;
  padding: 4px 12px;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  background: var(--color-background-muted);
}

/* --- judge-disagreement dumbbell plot: 28px rows --------------------------- */
.${b} .mes-db {
  padding: 6px 12px 10px;
}
.${b} .mes-db-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 28px;
}
.${b} .mes-db-label {
  width: 160px;
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${b} .mes-db-row-selected .mes-db-label { color: ${x}; }
.${b} .mes-db-track {
  position: relative;
  flex: 1;
  min-width: 120px;
  height: 16px;
}
.${b} .mes-db-track::before {
  content: '';
  position: absolute;
  inset: 7px 0;
  background: var(--color-border);
  border-radius: 1px;
}
.${b} .mes-db-link {
  position: absolute;
  top: 6px;
  height: 4px;
  border-radius: 2px;
  background: color-mix(in srgb, var(--color-text-secondary) 45%, transparent);
}
.${b} .mes-db-link-flag { background: ${E}; }
.${b} .mes-db-dot {
  position: absolute;
  top: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-sizing: border-box;
}
.${b} .mes-db-dot-llm { background: ${x}; }
.${b} .mes-db-dot-human {
  background: var(--color-background-surface);
  border: 2px solid var(--color-text-secondary);
}
.${b} .mes-db-gap {
  width: 44px;
  flex-shrink: 0;
  text-align: right;
  font-size: 11px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${b} .mes-db-gap-flag { color: ${E}; }
.${b} .mes-db-axis {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 20px;
}
.${b} .mes-db-axis .mes-db-scale {
  position: relative;
  flex: 1;
  min-width: 120px;
  height: 14px;
  font-size: 9px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${b} .mes-db-scale span { position: absolute; transform: translateX(-50%); }
.${b} .mes-db-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 10px;
  color: var(--color-text-secondary);
  padding: 2px 0 6px;
}
.${b} .mes-db-legend .mes-db-dot { position: static; transform: none; }

/* --- release gate rail ------------------------------------------------------ */
.${b} .mes-verdict {
  border-radius: 10px;
  border: var(--border-width) solid;
  min-height: 72px;
  box-sizing: border-box;
  padding: 10px 12px;
}
.${b} .mes-verdict-ship { border-color: ${w}; background: ${T}; }
.${b} .mes-verdict-hold { border-color: ${E}; background: ${D}; }
.${b} .mes-verdict-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.01em;
}
.${b} .mes-verdict-ship .mes-verdict-title { color: ${w}; }
.${b} .mes-verdict-hold .mes-verdict-title { color: ${E}; }
.${b} .mes-verdict-reasons {
  margin: 6px 0 0;
  padding: 0 0 0 18px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--color-text-secondary);
}
/* Gate rows: min 76px — title line + 40px control line. */
.${b} .mes-gate {
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-body);
  min-height: 76px;
  box-sizing: border-box;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.${b} .mes-gate-off { opacity: 0.72; }
.${b} .mes-gate-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 650;
  color: var(--color-text-primary);
  white-space: nowrap;
}
.${b} .mes-gate-count {
  margin-left: auto;
  flex-shrink: 0;
}
.${b} .mes-gate-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
/* 40px ± steppers around a tabular threshold readout. */
.${b} .mes-step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  cursor: pointer;
  color: ${x};
}
@media (hover: hover) {
  .${b} .mes-step:hover:not(:disabled) { background: var(--color-background-muted); }
}
.${b} .mes-step:disabled { opacity: 0.4; cursor: default; }
.${b} .mes-threshold {
  min-width: 76px;
  text-align: center;
  font-size: 13px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  white-space: nowrap;
}
/* Gate enable toggle: aria-pressed pill, 40px hit height. */
.${b} .mes-toggle {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 10px;
  border-radius: 8px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  font-size: 11px;
  font-weight: 650;
  color: var(--color-text-secondary);
  cursor: pointer;
  white-space: nowrap;
}
@media (hover: hover) {
  .${b} .mes-toggle:hover { background: var(--color-background-muted); }
}
.${b} .mes-toggle[aria-pressed='true'] {
  color: ${x};
  border-color: ${x};
  background: ${C};
}
/* Promote: the rail's one primary action; arms only on SHIP. */
.${b} .mes-promote {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  border-radius: 10px;
  border: var(--border-width) solid ${x};
  background: ${x};
  color: ${S};
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
}
@media (hover: hover) {
  .${b} .mes-promote:hover:not(:disabled) {
    background: color-mix(in srgb, ${x} 88%, var(--color-text-primary));
  }
}
.${b} .mes-promote:disabled { opacity: 0.45; cursor: default; }
.${b} .mes-log {
  display: flex;
  flex-direction: column;
}
.${b} .mes-log-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-height: 32px;
  padding: 6px 0;
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 11px;
  color: var(--color-text-secondary);
}
.${b} .mes-log-row:last-child { border-bottom: none; }
.${b} .mes-log-verdict { font-weight: 700; flex-shrink: 0; }
.${b} .mes-log-verdict.mes-log-ship { color: ${w}; }
.${b} .mes-log-verdict.mes-log-hold { color: ${E}; }
.${b} .mes-log-when { margin-left: auto; flex-shrink: 0; font-variant-numeric: tabular-nums; }

/* --- responsive subtraction ------------------------------------------------ */
@media (max-width: 900px) {
  .${b} .mes-body { flex-direction: column; overflow-y: auto; }
  .${b} .mes-main { overflow-y: visible; flex: none; }
  .${b} .mes-rail {
    width: 100%;
    border-left: none;
    border-top: var(--border-width) solid var(--color-border);
    overflow-y: visible;
  }
}
@media (max-width: 620px) {
  .${b} .mes-db-label { width: 108px; }
  .${b} .mes-gate-controls { row-gap: 6px; }
}
`;function U(){return(0,y.jsx)(`span`,{className:`mes-mark`,"aria-hidden":!0,children:(0,y.jsxs)(`svg`,{width:22,height:22,viewBox:`0 0 22 22`,fill:`none`,children:[(0,y.jsx)(`rect`,{x:3,y:11,width:4,height:8,rx:1,fill:`var(--color-text-secondary)`}),(0,y.jsx)(`rect`,{x:9,y:7,width:4,height:12,rx:1,fill:`currentColor`}),(0,y.jsx)(`rect`,{x:15,y:13,width:4,height:6,rx:1,fill:`var(--color-text-secondary)`}),(0,y.jsx)(`line`,{x1:2,y1:5.5,x2:20,y2:5.5,stroke:`currentColor`,strokeWidth:1.8,strokeDasharray:`3 2`,strokeLinecap:`round`})]})})}var W=55,G=95,le=[60,70,80,90];function K(e){return(e-W)/(G-W)*100}function q(e){let t={};for(let n of P){let r=e[n];t[n]={def:F[n],state:r,failing:r.enabled?M.filter(e=>!z(n,r.threshold,R(e,n))):[]}}return t}var ue=[{model:`aster-2.1-rc2`,verdict:`hold`,note:`ja-JP hallucination 6.1% over the 3.0% cap`,when:`Jun 30`},{model:`aster-2.0`,verdict:`ship`,note:`all gates green · full rollout`,when:`May 12`}],J={acc:`Δ acc pp`,halluc:`halluc %`,refusal:`refusal %`,latency:`Δ p95 ms`,agreement:`judge gap`};function Y(){let[e,t]=(0,v.useState)(L),[n,d]=(0,v.useState)(`adversarial`),[f,x]=(0,v.useState)(ue),[S,C]=(0,v.useState)(!1),[w,T]=(0,v.useState)(``),E=q(e),D=P.filter(e=>E[e].state.enabled&&E[e].failing.length>0),Y=D.length===0?`ship`:`hold`,de=D.reduce((e,t)=>e+E[t].failing.length,0),X=M.find(e=>e.id===n)??null,Z=e=>{let t=P.filter(t=>e[t].state.enabled&&e[t].failing.length>0);return t.length===0?`Verdict: CLEAR TO SHIP.`:`Verdict: HOLD, ${t.length} gate${t.length===1?``:`s`} blocking.`},Q=(n,r)=>{let i=F[n],a=e[n].threshold,o=Math.min(i.max,Math.max(i.min,Math.round((a+i.step*r)*100)/100));if(o===a)return;let s={...e,[n]:{...e[n],threshold:o}};t(s);let c=q(s);T(`${i.label} now ${i.rule} ${V(n,o)} ${i.unit} — ${c[n].failing.length} slice${c[n].failing.length===1?``:`s`} failing. `+Z(c))},fe=n=>{let r={...e,[n]:{...e[n],enabled:!e[n].enabled}};t(r);let i=q(r);T(`${F[n].label} gate ${r[n].enabled?`enabled`:`disabled`}. ${Z(i)}`)},pe=()=>{let e=L();t(e),T(`Thresholds reset to release policy defaults. ${Z(q(e))}`)},me=()=>{Y!==`ship`||S||(C(!0),x(e=>[{model:O.candidate,verdict:`ship`,note:`staged 25% rollout · gates green at review thresholds`,when:`now`},...e]),T(`${O.candidate} promoted to a staged 25% rollout and logged.`))},he=(0,y.jsx)(oe,{hasDivider:!0,children:(0,y.jsx)(`div`,{className:`mes-header-row`,children:(0,y.jsxs)(h,{gap:3,vAlign:`center`,wrap:`wrap`,children:[(0,y.jsx)(U,{}),(0,y.jsx)(re,{size:`fill`,children:(0,y.jsxs)(ne,{gap:0,children:[(0,y.jsx)(g,{level:1,children:`Benchline — release review`}),(0,y.jsxs)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:[O.candidate,` vs `,O.baseline,` · eval run `,O.evalRun,` · `,O.when,` · `,O.harness]})]})}),(0,y.jsxs)(`span`,{className:`mes-chip`,children:[M.length,` slices · `,ce.toLocaleString(`en-US`),` items`]}),(0,y.jsx)(`span`,{className:`mes-chip mes-chip-candidate`,children:O.candidate}),(0,y.jsxs)(`span`,{className:`mes-chip mes-chip-${Y}`,children:[(0,y.jsx)(i,{icon:Y===`ship`?p:c,size:`xsm`,color:`inherit`}),Y===`ship`?`Clear to ship`:`Hold · ${D.length} gates`]})]})})}),ge=(0,y.jsxs)(`section`,{className:`mes-panel`,"aria-label":`Benchmark leaderboard`,children:[(0,y.jsxs)(`div`,{className:`mes-panel-head`,children:[(0,y.jsx)(i,{icon:a,size:`xsm`,color:`secondary`}),`Benchmark leaderboard`,(0,y.jsx)(`span`,{style:{marginLeft:`auto`,fontWeight:400,textTransform:`none`,letterSpacing:0},children:`composite = mean of 4 quality suites`})]}),(0,y.jsx)(`div`,{className:`mes-panel-scroll`,children:(0,y.jsxs)(`div`,{className:`mes-lb`,role:`table`,"aria-label":`Five runs across seven benchmark columns`,children:[(0,y.jsx)(`div`,{role:`row`,style:{display:`contents`},children:[`Model`,`Comp`,`Reason`,`Code`,`Retr`,`Safety`,`p95 ms`,`$/1k`].map(e=>(0,y.jsx)(`div`,{className:`mes-lb-head`,role:`columnheader`,children:e},e))}),se.map(e=>{let t=k(e),n=Math.min(100,Math.max(0,(t-A)/(j-A)*100));return(0,y.jsxs)(`div`,{role:`row`,style:{display:`contents`},className:e.tag===`candidate`?`mes-lb-row-candidate`:void 0,children:[(0,y.jsxs)(`div`,{className:`mes-lb-cell mes-lb-model`,role:`rowheader`,children:[(0,y.jsxs)(`span`,{style:{minWidth:0},children:[(0,y.jsx)(`span`,{className:`mes-model-name`,style:{display:`block`},children:e.model}),(0,y.jsx)(`span`,{className:`mes-model-note`,style:{display:`block`},children:e.note})]}),e.tag!=null&&(0,y.jsx)(`span`,{className:`mes-tag mes-tag-${e.tag}`,children:e.tag})]}),(0,y.jsxs)(`div`,{className:`mes-lb-cell mes-composite`,role:`cell`,children:[t.toFixed(1),(0,y.jsx)(`span`,{className:`mes-composite-bar`,children:(0,y.jsx)(`span`,{style:{width:`${n}%`}})})]}),[e.reasoning,e.code,e.retrieval,e.safety].map((e,t)=>(0,y.jsx)(`div`,{className:`mes-lb-cell`,role:`cell`,children:e.toFixed(1)},t)),(0,y.jsx)(`div`,{className:`mes-lb-cell`,role:`cell`,children:e.p95.toLocaleString(`en-US`)}),(0,y.jsx)(`div`,{className:`mes-lb-cell`,role:`cell`,children:e.cost.toFixed(2)})]},e.id)})]})})]}),_e=(0,y.jsxs)(`section`,{className:`mes-panel`,"aria-label":`Slice regression matrix`,children:[(0,y.jsxs)(`div`,{className:`mes-panel-head`,children:[(0,y.jsx)(i,{icon:o,size:`xsm`,color:`secondary`}),`Slice regressions · `,O.candidate,` vs `,O.baseline,(0,y.jsx)(`span`,{style:{marginLeft:`auto`,fontWeight:400,textTransform:`none`,letterSpacing:0},children:`cells re-check against live gate thresholds`})]}),(0,y.jsx)(`div`,{className:`mes-panel-scroll`,children:(0,y.jsxs)(`div`,{className:`mes-mx`,role:`grid`,"aria-label":`Nine slices across four gated metrics`,children:[(0,y.jsxs)(`div`,{role:`row`,style:{display:`contents`},children:[(0,y.jsx)(`div`,{className:`mes-mx-head`,role:`columnheader`,children:`Slice · n`}),I.map(e=>{let{def:t,state:n}=E[e];return(0,y.jsxs)(`div`,{className:`mes-mx-head`,role:`columnheader`,children:[J[e],(0,y.jsxs)(`span`,{className:`mes-mx-rule${n.enabled?``:` mes-mx-rule-off`}`,children:[t.rule.split(` `).pop(),` `,V(e,n.threshold),n.enabled?``:` · off`]})]},e)})]}),M.map(e=>(0,y.jsxs)(`div`,{role:`row`,style:{display:`contents`},children:[(0,y.jsxs)(`button`,{type:`button`,role:`rowheader`,className:`mes-mx-slice mes-focusable`,"aria-pressed":e.id===n,onClick:()=>d(t=>t===e.id?null:e.id),children:[(0,y.jsx)(`span`,{className:`mes-slice-name`,children:e.label}),(0,y.jsx)(`span`,{className:`mes-slice-n`,children:e.n.toLocaleString(`en-US`)})]}),I.map(t=>{let{state:n}=E[t],r=R(e,t),i=n.enabled,a=z(t,n.threshold,r),o=i?a?`mes-mx-cell`:`mes-mx-cell mes-mx-cell-fail`:`mes-mx-cell mes-mx-cell-off`,s=i?a?`passes`:`FAILS`:`ungated`;return(0,y.jsxs)(`div`,{role:`gridcell`,className:o,"aria-label":`${e.label} ${J[t]}: ${B(t,r)} — ${s}`,children:[i&&(0,y.jsx)(`span`,{className:`mes-cell-dot mes-cell-dot-${a?`pass`:`fail`}`,"aria-hidden":!0}),B(t,r)]},t)})]},e.id))]})}),X!=null&&(0,y.jsxs)(`div`,{className:`mes-mx-detail`,children:[(0,y.jsx)(`strong`,{style:{color:`var(--color-text-primary)`},children:X.label}),(0,y.jsxs)(`span`,{children:[X.n.toLocaleString(`en-US`),` items`]}),(0,y.jsxs)(`span`,{children:[`Δ acc `,B(`acc`,X.accDelta),` pp`]}),(0,y.jsxs)(`span`,{children:[`halluc `,X.halluc.toFixed(1),`%`]}),(0,y.jsxs)(`span`,{children:[`refusal `,X.refusal.toFixed(1),`%`]}),(0,y.jsxs)(`span`,{children:[`Δ p95 `,B(`latency`,X.latDelta),` ms`]}),(0,y.jsxs)(`span`,{children:[`judges `,X.judgeLlm,` vs `,X.judgeHuman,` · gap `,N(X)]})]})]}),$=E.agreement,ve=(0,y.jsxs)(`section`,{className:`mes-panel`,"aria-label":`Judge disagreement`,children:[(0,y.jsxs)(`div`,{className:`mes-panel-head`,children:[(0,y.jsx)(i,{icon:u,size:`xsm`,color:`secondary`}),`Judge disagreement · LLM judge vs human panel`,(0,y.jsx)(`span`,{style:{marginLeft:`auto`,fontWeight:400,textTransform:`none`,letterSpacing:0},children:$.state.enabled?`gap ≤ ${V(`agreement`,$.state.threshold)} pts`:`agreement gate off`})]}),(0,y.jsxs)(`div`,{className:`mes-db`,children:[(0,y.jsxs)(`div`,{className:`mes-db-legend`,children:[(0,y.jsx)(`span`,{className:`mes-db-dot mes-db-dot-llm`,"aria-hidden":!0}),` LLM judge`,(0,y.jsx)(`span`,{className:`mes-db-dot mes-db-dot-human`,"aria-hidden":!0}),` human panel`,(0,y.jsxs)(`span`,{style:{marginLeft:`auto`},children:[`rubric score, `,W,`–`,G]})]}),M.map(e=>{let t=N(e),r=$.state.enabled&&!z(`agreement`,$.state.threshold,t),i=K(e.judgeLlm),a=K(e.judgeHuman),o=Math.min(i,a),s=Math.abs(i-a);return(0,y.jsxs)(`div`,{className:`mes-db-row${e.id===n?` mes-db-row-selected`:``}`,"aria-label":`${e.label}: LLM judge ${e.judgeLlm}, human panel ${e.judgeHuman}, gap ${t}${r?` — over the agreement gate`:``}`,children:[(0,y.jsx)(`span`,{className:`mes-db-label`,children:e.label}),(0,y.jsxs)(`span`,{className:`mes-db-track`,"aria-hidden":!0,children:[(0,y.jsx)(`span`,{className:`mes-db-link${r?` mes-db-link-flag`:``}`,style:{left:`${o}%`,width:`${s}%`}}),(0,y.jsx)(`span`,{className:`mes-db-dot mes-db-dot-human`,style:{left:`${a}%`}}),(0,y.jsx)(`span`,{className:`mes-db-dot mes-db-dot-llm`,style:{left:`${i}%`}})]}),(0,y.jsxs)(`span`,{className:`mes-db-gap${r?` mes-db-gap-flag`:``}`,children:[`Δ`,t]})]},e.id)}),(0,y.jsxs)(`div`,{className:`mes-db-axis`,"aria-hidden":!0,children:[(0,y.jsx)(`span`,{className:`mes-db-label`}),(0,y.jsx)(`span`,{className:`mes-db-scale`,children:le.map(e=>(0,y.jsx)(`span`,{style:{left:`${K(e)}%`},children:e},e))}),(0,y.jsx)(`span`,{className:`mes-db-gap`})]})]})]}),ye=(0,y.jsxs)(`aside`,{className:`mes-rail`,"aria-label":`Release gates`,children:[(0,y.jsxs)(`div`,{className:`mes-verdict mes-verdict-${Y}`,role:`status`,children:[(0,y.jsxs)(`span`,{className:`mes-verdict-title`,children:[(0,y.jsx)(i,{icon:Y===`ship`?p:c,size:`sm`,color:`inherit`}),Y===`ship`?`CLEAR TO SHIP ${O.candidate}`:`HOLD — ${D.length} gate${D.length===1?``:`s`} blocking`]}),Y===`hold`?(0,y.jsx)(`ul`,{className:`mes-verdict-reasons`,children:D.map(e=>{let{def:t,state:n,failing:r}=E[e];return(0,y.jsxs)(`li`,{children:[t.label,`: `,r.length,` slice`,r.length===1?``:`s`,` past `,t.rule,` `,V(e,n.threshold),` `,t.unit,` —`,` `,r.map(t=>`${t.label} ${B(e,R(t,e))}`).join(`, `)]},e)})}):(0,y.jsx)(`ul`,{className:`mes-verdict-reasons`,children:(0,y.jsxs)(`li`,{children:[`All enabled gates green across `,M.length,` slices (`,de,` violations at current thresholds).`]})})]}),P.map(e=>{let{def:t,state:n,failing:r}=E[e];return(0,y.jsxs)(`div`,{className:`mes-gate${n.enabled?``:` mes-gate-off`}`,children:[(0,y.jsxs)(`span`,{className:`mes-gate-title`,children:[(0,y.jsx)(i,{icon:t.icon,size:`sm`,color:`secondary`}),t.label,(0,y.jsx)(`span`,{className:`mes-gate-count`,children:n.enabled?r.length>0?(0,y.jsxs)(`span`,{className:`mes-chip mes-chip-hold`,children:[r.length,` failing`]}):(0,y.jsx)(`span`,{className:`mes-chip mes-chip-ship`,children:`pass`}):(0,y.jsx)(`span`,{className:`mes-chip`,children:`off`})})]}),(0,y.jsxs)(`span`,{className:`mes-gate-controls`,children:[(0,y.jsx)(`button`,{type:`button`,className:`mes-step mes-focusable`,"aria-label":`Tighten ${t.label} (lower threshold)`,disabled:!n.enabled||n.threshold<=t.min,onClick:()=>Q(e,-1),children:(0,y.jsx)(i,{icon:s,size:`sm`,color:`inherit`})}),(0,y.jsxs)(`span`,{className:`mes-threshold`,children:[t.rule,` `,V(e,n.threshold),` `,t.unit]}),(0,y.jsx)(`button`,{type:`button`,className:`mes-step mes-focusable`,"aria-label":`Loosen ${t.label} (raise threshold)`,disabled:!n.enabled||n.threshold>=t.max,onClick:()=>Q(e,1),children:(0,y.jsx)(i,{icon:ee,size:`sm`,color:`inherit`})}),(0,y.jsxs)(`button`,{type:`button`,className:`mes-toggle mes-focusable`,"aria-pressed":n.enabled,onClick:()=>fe(e),children:[n.enabled&&(0,y.jsx)(i,{icon:m,size:`xsm`,color:`inherit`}),n.enabled?`Gating`:`Off`]})]})]},e)}),(0,y.jsx)(h,{gap:2,vAlign:`center`,children:(0,y.jsx)(_,{label:`Reset thresholds`,variant:`ghost`,size:`sm`,icon:(0,y.jsx)(i,{icon:te,size:`sm`}),onClick:pe})}),(0,y.jsxs)(`button`,{type:`button`,className:`mes-promote mes-focusable`,disabled:Y!==`ship`||S,onClick:me,children:[(0,y.jsx)(i,{icon:l,size:`sm`,color:`inherit`}),S?`${O.candidate} staged at 25%`:`Promote ${O.candidate} to staged rollout`]}),(0,y.jsxs)(`div`,{children:[(0,y.jsx)(r,{type:`label`,size:`sm`,color:`secondary`,children:`Decision log`}),(0,y.jsx)(`div`,{className:`mes-log`,children:f.map(e=>(0,y.jsxs)(`div`,{className:`mes-log-row`,children:[(0,y.jsx)(`span`,{className:`mes-log-verdict mes-log-${e.verdict}`,children:e.verdict===`ship`?`SHIP`:`HOLD`}),(0,y.jsxs)(`span`,{children:[(0,y.jsx)(`strong`,{style:{color:`var(--color-text-primary)`},children:e.model}),` — `,e.note]}),(0,y.jsx)(`span`,{className:`mes-log-when`,children:e.when})]},`${e.model}-${e.when}`))})]})]});return(0,y.jsxs)(`div`,{className:b,style:{height:`100dvh`,width:`100%`},children:[(0,y.jsx)(`style`,{children:H}),(0,y.jsx)(ie,{height:`fill`,header:he,content:(0,y.jsxs)(ae,{padding:0,children:[(0,y.jsx)(`div`,{"aria-live":`polite`,className:`mes-vh`,children:w}),(0,y.jsxs)(`div`,{className:`mes-body`,children:[(0,y.jsxs)(`div`,{className:`mes-main`,children:[ge,_e,ve]}),ye]})]})})]})}export{Y as default};