import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Icon-CLHSQIsB.js";import{t as i}from"./lock-DLOnF6Bf.js";import{t as a}from"./lock-open-CQeCzNUQ.js";import{t as o}from"./pen-line-eZPvOl2E.js";import{t as s}from"./rotate-ccw-CVIkSLha.js";import{o as c,w as ee}from"./index-CcGpqB1l.js";import{n as te,t as ne}from"./LayoutContent-CCL91W7X.js";import{t as re}from"./LayoutHeader-Cy2mWoMf.js";import{t as l}from"./Badge-0Tj9omHc.js";import{t as u}from"./Button-DzizYIpc.js";import{t as ie}from"./Selector-CA3UAqwt.js";import{t as ae}from"./useToast-DRqH0ZEi.js";var d=e(t(),1),f=n(),p=`light-dark(#0369A1, #7CC7EE)`,m=`light-dark(rgba(3, 105, 161, 0.10), rgba(124, 199, 238, 0.14))`,h=`light-dark(#B91C1C, #F87171)`,g=`light-dark(#1D4ED8, #93C5FD)`,_=`light-dark(#15803D, #4ADE80)`,v=`light-dark(#B45309, #FCD34D)`,y=`light-dark(rgba(3, 105, 161, 0.08), rgba(124, 199, 238, 0.10))`,b=`ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace`,x=2,S=8,C=[{id:`ln-mem-ord`,label:`MEM → ORD`,mode:`Reefer truck`,carrier:`Polar Freight Co.`,shipments30d:42},{id:`ln-fra-jfk`,label:`FRA → JFK`,mode:`Air — active container`,carrier:`SkyChill Logistics`,shipments30d:18},{id:`ln-sea-anc`,label:`SEA → ANC`,mode:`Air — passive shipper`,carrier:`North Meridian Air`,shipments30d:11},{id:`ln-elp-dfw`,label:`ELP → DFW`,mode:`Reefer truck`,carrier:`Sun Corridor Carriers`,shipments30d:27}],w=new Map(C.map(e=>[e.id,e]));function T(e){let t=w.get(e);if(t===void 0)throw Error(`Unknown lane ${e}`);return t}var E=[{id:`lot-0412`,lotCode:`LOT 26-F0412`,product:`Ravivax quadrivalent influenza vaccine — 10-dose vials`,quantity:`1,440 vials · 12 cartons`,laneId:`ln-mem-ord`,startClock:`02:10`,sampleIntervalMin:10,tempsC:[5.2,5.6,6.1,7.4,8.9,9.8,10.4,9.6,8.3,7.1,6.2,5.4,5.1],gapAfterIndex:null,gapNote:null,freezeSensitive:!0,hardCeilingC:15,stabilityBudgetMin:120,priorTorMin:30,sensor:`TL-8841 (door-side probe)`},{id:`lot-0398`,lotCode:`LOT 26-F0398`,product:`GlucaPen U-100 insulin autoinjectors — 2-pack cartons`,quantity:`3,860 cartons · 4 pallets`,laneId:`ln-fra-jfk`,startClock:`05:35`,sampleIntervalMin:10,tempsC:[6,6.4,7.2,8.6,9.9,11.4,12.8,12.1,11,9.4,8.8,7.6,6.9,6.1],gapAfterIndex:null,gapNote:null,freezeSensitive:!0,hardCeilingC:15,stabilityBudgetMin:120,priorTorMin:60,sensor:`TL-9102 (pallet 2 core)`},{id:`lot-0405`,lotCode:`LOT 26-F0405`,product:`Novimab-CR 180 mg/mL monoclonal antibody — bulk drug substance`,quantity:`18 × 10 L cryovessels`,laneId:`ln-sea-anc`,startClock:`09:20`,sampleIntervalMin:15,tempsC:[4.8,5.5,7.9,10.2,13.6,15.4,16.2,14.9,12.3,9.7,7.8,6.5],gapAfterIndex:null,gapNote:null,freezeSensitive:!1,hardCeilingC:15,stabilityBudgetMin:240,priorTorMin:20,sensor:`TL-7719 (vessel rack)`},{id:`lot-0371`,lotCode:`LOT 26-F0371`,product:`Ravivax pediatric 0.5 mL prefilled syringes`,quantity:`9,600 syringes · 8 cartons`,laneId:`ln-mem-ord`,startClock:`07:45`,sampleIntervalMin:10,tempsC:[5,5.8,6.9,8.2,8.9,8.4,7.6,6.8,5.9,5.3],gapAfterIndex:null,gapNote:null,freezeSensitive:!0,hardCeilingC:15,stabilityBudgetMin:120,priorTorMin:25,sensor:`TL-8623 (carton top)`},{id:`lot-0388`,lotCode:`LOT 26-F0388`,product:`CryoZyme lyophilized enzyme kits — 96-well format`,quantity:`520 kits · 2 pallets`,laneId:`ln-elp-dfw`,startClock:`03:50`,sampleIntervalMin:15,tempsC:[6.2,7,8.4,9.1,8.8,8.2,7.4,6.6,6,5.7],gapAfterIndex:3,gapNote:`38-min telemetry gap 04:20–04:58 (logger reboot)`,freezeSensitive:!1,hardCeilingC:15,stabilityBudgetMin:120,priorTorMin:95,sensor:`TL-9330 (pallet 1 edge)`},{id:`lot-0360`,lotCode:`LOT 26-F0360`,product:`HepaTrig pediatric hepatitis B vaccine — single-dose vials`,quantity:`2,200 vials · 6 cartons`,laneId:`ln-fra-jfk`,startClock:`00:55`,sampleIntervalMin:10,tempsC:[4.1,3.2,2.4,1.1,.3,-.8,-.2,.9,2.2,3.5,4.4],gapAfterIndex:null,gapNote:null,freezeSensitive:!0,hardCeilingC:15,stabilityBudgetMin:120,priorTorMin:0,sensor:`TL-9017 (carton mid-stack)`}],D=new Map(E.map(e=>[e.id,e]));function O(e){let t=D.get(e);if(t===void 0)throw Error(`Unknown lot ${e}`);return t}function k(e){return Math.max(...e.tempsC)}function A(e){return Math.min(...e.tempsC)}function j(e){return e.sampleIntervalMin*e.tempsC.filter(e=>e>S).length}function M(e){return e.priorTorMin+j(e)}function N(e){return e.freezeSensitive&&A(e)<0}function oe(e){let[t,n]=e.split(`:`).map(Number);return t*60+n}function se(e){let t=e=>String(e).padStart(2,`0`),n=(e%1440+1440)%1440;return`${t(Math.floor(n/60))}:${t(n%60)}`}function P(e,t){return se(oe(e.startClock)+t*e.sampleIntervalMin)}var ce=872,le=4,F=`R. Okafor, QA-2`,I=[{id:`freeze`,question:`Freeze breach — any reading below 0.0 °C on a freeze-sensitive lot?`,continueOn:`no`,exitOutcome:`destroy`,exitLabel:`YES → potency loss is unrecoverable`},{id:`ceiling`,question:`Peak above the product hard ceiling?`,continueOn:`no`,exitOutcome:`destroy`,exitLabel:`YES → exposure beyond stability data`},{id:`budget`,question:`Cumulative TOR within the stability budget?`,continueOn:`no`,exitOutcome:`release`,exitLabel:`YES → excursion absorbed by budget`},{id:`complete`,question:`Telemetry complete — no logger gaps across the event?`,continueOn:`no`,exitOutcome:`hold`,exitLabel:`YES → hold for stability review`}];function L(e){return`${e.toFixed(1)} °C`}function R(e){let t=[],n={freeze:N(e)?{answer:`yes`,detail:`low ${L(A(e))} — freeze-sensitive`}:{answer:`no`,detail:e.freezeSensitive?`low ${L(A(e))} stayed above 0.0`:`product is not freeze-sensitive`},ceiling:k(e)>=e.hardCeilingC?{answer:`yes`,detail:`peak ${L(k(e))} ≥ ceiling ${L(e.hardCeilingC)}`}:{answer:`no`,detail:`peak ${L(k(e))} < ceiling ${L(e.hardCeilingC)}`},budget:M(e)<=e.stabilityBudgetMin?{answer:`yes`,detail:`${M(e)} of ${e.stabilityBudgetMin} min budget`}:{answer:`no`,detail:`${M(e)} min exceeds ${e.stabilityBudgetMin} min budget`},complete:e.gapAfterIndex===null?{answer:`yes`,detail:`contiguous trace, no logger gaps`}:{answer:`no`,detail:e.gapNote??`telemetry gap in trace`}};for(let e of I){let r=n[e.id],i=r.answer!==e.continueOn;if(t.push({gate:e,answer:r.answer,detail:r.detail,isExit:i}),i)return{answers:t,recommended:e.exitOutcome}}return{answers:t,recommended:`destroy`}}var z={release:{label:`Release`,verb:`released to distribution`,color:_,blurb:`Ship to forward DC; excursion logged against the stability budget.`},hold:{label:`Hold`,verb:`held for stability review`,color:v,blurb:`Quarantine cage Q-3; stability team issues a memo within 5 business days.`},destroy:{label:`Destroy`,verb:`sent to destruction`,color:h,blurb:`Witnessed destruction; file the carrier claim with the trace attached.`}},ue=[`release`,`hold`,`destroy`],B=[{value:`sm-2214`,label:`Stability memo SM-2214 covers this exposure`},{value:`bridge`,label:`Bridging study data on file with QA`},{value:`market`,label:`Market action — regulatory hold supersedes`},{value:`claim`,label:`Carrier claim requires intact lot — hold instead`}];function de(){let e={};for(let t of E)e[t.id]={disposition:null,deviationReason:null,signedOff:!1,signedClock:null};return e[`lot-0371`]={disposition:`release`,deviationReason:null,signedOff:!0,signedClock:`11:05`},e}function V(e){return e.signedOff?`closed`:e.disposition===null?`open`:`pending-qa`}function fe(e,t){let n=E.filter(t=>t.laneId===e.id),r=0,i=0,a=0,o=0;for(let e of n){let n=t[e.id];V(n)===`closed`?(i+=1,n.disposition===`destroy`&&(a+=1)):r+=1,o+=M(e)/e.stabilityBudgetMin*100}let s=n.length===0?0:Math.round(o/n.length),c=r*2+(s>=85?2:+(s>=60))+a;return{lane:e,openCount:r,closedCount:i,meanUtilPct:s,destroyedCount:a,grade:c<=1?`A`:c<=3?`B`:c<=5?`C`:`D`}}var pe=`
.tpl-cold-chain-excursion-console {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.tpl-cold-chain-excursion-console .cce-main {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr); /* rail 280 */
  height: 100%;
  min-height: 0;
}
.tpl-cold-chain-excursion-console .cce-rail {
  min-height: 0;
  overflow-y: auto;
  border-inline-end: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
}
.tpl-cold-chain-excursion-console .cce-work {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}
/* ---- header ---- */
.tpl-cold-chain-excursion-console .cce-header-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  width: 100%;
  min-width: 0;
}
.tpl-cold-chain-excursion-console .cce-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
  flex: 1;
}
.tpl-cold-chain-excursion-console .cce-brand-name {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.tpl-cold-chain-excursion-console .cce-brand-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* ---- queue rail: rows min 76 ---- */
.tpl-cold-chain-excursion-console .cce-rail-head {
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-2);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
}
.tpl-cold-chain-excursion-console .cce-queue-row {
  appearance: none;
  background: none;
  border: none;
  border-block-end: var(--border-width) solid var(--color-border);
  font: inherit;
  color: inherit;
  text-align: start;
  width: 100%;
  min-height: 76px; /* queue rows min 76 */
  padding: 10px var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
}
.tpl-cold-chain-excursion-console .cce-queue-row[aria-pressed="true"] {
  background: ${m};
  box-shadow: inset 3px 0 0 0 ${p};
}
.tpl-cold-chain-excursion-console .cce-queue-top {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
}
.tpl-cold-chain-excursion-console .cce-queue-code {
  font-family: ${b};
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
}
.tpl-cold-chain-excursion-console .cce-queue-product {
  font-size: 12px;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
.tpl-cold-chain-excursion-console .cce-queue-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.tpl-cold-chain-excursion-console .cce-peak-heat { color: ${h}; font-weight: 600; }
.tpl-cold-chain-excursion-console .cce-peak-freeze { color: ${g}; font-weight: 600; }
/* TOR budget bar: 6px track, fill % from an inline width. */
.tpl-cold-chain-excursion-console .cce-torbar {
  display: block;
  height: 6px;
  border-radius: 999px;
  background: var(--color-border);
  overflow: hidden;
  width: 100%;
}
.tpl-cold-chain-excursion-console .cce-torbar-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
}
/* ---- cards ---- */
.tpl-cold-chain-excursion-console .cce-card {
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
.tpl-cold-chain-excursion-console .cce-card-title {
  font-size: 13px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.tpl-cold-chain-excursion-console .cce-card-sub {
  font-size: 11.5px;
  color: var(--color-text-secondary);
}
/* ---- chart ---- */
.tpl-cold-chain-excursion-console .cce-chart-svg {
  width: 100%;
  height: auto;
  display: block;
}
.tpl-cold-chain-excursion-console .cce-scrub-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}
.tpl-cold-chain-excursion-console .cce-scrub {
  flex: 1;
  min-width: 180px;
  height: 40px; /* >=40px hit height */
  margin: 0;
  accent-color: ${p};
}
.tpl-cold-chain-excursion-console .cce-scrub-readout {
  font-family: ${b};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  min-width: 220px;
}
.tpl-cold-chain-excursion-console .cce-readout-heat { color: ${h}; }
.tpl-cold-chain-excursion-console .cce-readout-freeze { color: ${g}; }
/* ---- metrics strip: tiles min 72 ---- */
.tpl-cold-chain-excursion-console .cce-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--spacing-3);
}
.tpl-cold-chain-excursion-console .cce-metric {
  min-height: 72px; /* metric tiles min 72 */
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  box-sizing: border-box;
}
.tpl-cold-chain-excursion-console .cce-metric-label {
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
}
.tpl-cold-chain-excursion-console .cce-metric-value {
  font-size: 19px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.15;
}
.tpl-cold-chain-excursion-console .cce-metric-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
/* ---- decision row: tree 1.2fr / gate 0.8fr ---- */
.tpl-cold-chain-excursion-console .cce-decision-row {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: var(--spacing-3);
  align-items: start;
}
/* Tree gate rows: min 64, connector spine on the left. */
.tpl-cold-chain-excursion-console .cce-gate {
  min-height: 64px; /* tree gate rows min 64 */
  display: flex;
  gap: var(--spacing-2);
  padding: 8px 0;
  position: relative;
}
.tpl-cold-chain-excursion-console .cce-gate-spine {
  flex: none;
  width: 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.tpl-cold-chain-excursion-console .cce-gate-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  background: transparent;
  flex: none;
  margin-top: 4px;
}
.tpl-cold-chain-excursion-console .cce-gate-on .cce-gate-dot {
  border-color: ${p};
  background: ${p};
}
.tpl-cold-chain-excursion-console .cce-gate-line {
  flex: 1;
  width: 2px;
  background: var(--color-border);
  margin-top: 2px;
}
.tpl-cold-chain-excursion-console .cce-gate-on .cce-gate-line {
  background: ${p};
}
.tpl-cold-chain-excursion-console .cce-gate-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.tpl-cold-chain-excursion-console .cce-gate-q {
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.35;
}
.tpl-cold-chain-excursion-console .cce-gate-detail {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.tpl-cold-chain-excursion-console .cce-gate-off .cce-gate-q,
.tpl-cold-chain-excursion-console .cce-gate-off .cce-gate-detail {
  color: var(--color-text-secondary);
  opacity: 0.7;
}
.tpl-cold-chain-excursion-console .cce-gate-answer {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
}
/* ---- outcome cards: min 96 ---- */
.tpl-cold-chain-excursion-console .cce-outcomes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-2);
}
.tpl-cold-chain-excursion-console .cce-outcome {
  appearance: none;
  background: none;
  font: inherit;
  color: inherit;
  text-align: start;
  min-height: 96px; /* outcome cards min 96 */
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  box-sizing: border-box;
}
.tpl-cold-chain-excursion-console .cce-outcome:disabled {
  cursor: default;
  opacity: 0.6;
}
.tpl-cold-chain-excursion-console .cce-outcome-name {
  font-size: 13px;
  font-weight: 700;
}
.tpl-cold-chain-excursion-console .cce-outcome-blurb {
  font-size: 11px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}
.tpl-cold-chain-excursion-console .cce-outcome-tag {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
/* ---- signoff gate: min 220 ---- */
.tpl-cold-chain-excursion-console .cce-gatecard {
  min-height: 220px; /* signoff gate min 220 */
}
.tpl-cold-chain-excursion-console .cce-gatecard-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 12.5px;
  flex-wrap: wrap;
}
.tpl-cold-chain-excursion-console .cce-deviation {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  border: var(--border-width) dashed ${v};
  border-radius: 8px;
  padding: 10px;
  font-size: 12px;
}
.tpl-cold-chain-excursion-console .cce-deviation-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: ${v};
}
.tpl-cold-chain-excursion-console .cce-signed {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  padding: 10px;
  font-size: 12px;
}
.tpl-cold-chain-excursion-console .cce-signed-line {
  font-family: ${b};
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
}
.tpl-cold-chain-excursion-console .cce-gate-actions {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
  flex-wrap: wrap;
}
/* ---- lane risk table: rows 44 ---- */
.tpl-cold-chain-excursion-console .cce-table-scroll { overflow-x: auto; }
.tpl-cold-chain-excursion-console .cce-table {
  width: 100%;
  min-width: 520px;
  border-collapse: collapse;
  font-size: 12px;
}
.tpl-cold-chain-excursion-console .cce-table th {
  text-align: start;
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  font-weight: 600;
  padding: 6px 10px;
  border-block-end: var(--border-width) solid var(--color-border);
  white-space: nowrap;
}
.tpl-cold-chain-excursion-console .cce-table td {
  height: 44px; /* lane table rows 44 */
  padding: 0 10px;
  border-block-end: var(--border-width) solid var(--color-border);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.tpl-cold-chain-excursion-console .cce-table tr:last-child td {
  border-block-end: none;
}
.tpl-cold-chain-excursion-console .cce-lane-label {
  font-family: ${b};
  font-weight: 600;
  font-size: 12px;
}
.tpl-cold-chain-excursion-console .cce-grade {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 12px;
}
.tpl-cold-chain-excursion-console .cce-grade-A { background: light-dark(rgba(21,128,61,0.14), rgba(74,222,128,0.18)); color: ${_}; }
.tpl-cold-chain-excursion-console .cce-grade-B { background: ${m}; color: ${p}; }
.tpl-cold-chain-excursion-console .cce-grade-C { background: light-dark(rgba(180,83,9,0.14), rgba(252,211,77,0.18)); color: ${v}; }
.tpl-cold-chain-excursion-console .cce-grade-D { background: light-dark(rgba(185,28,28,0.12), rgba(248,113,113,0.18)); color: ${h}; }
/* ---- shared ---- */
.tpl-cold-chain-excursion-console button:focus-visible,
.tpl-cold-chain-excursion-console input:focus-visible {
  outline: 2px solid ${p};
  outline-offset: 2px;
}
.tpl-cold-chain-excursion-console .cce-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@media (prefers-reduced-motion: no-preference) {
  .tpl-cold-chain-excursion-console .cce-outcome,
  .tpl-cold-chain-excursion-console .cce-gate-dot {
    transition: border-color 160ms ease, background-color 160ms ease,
      box-shadow 160ms ease;
  }
}
/* <=920px: rail stacks above the workbench; single page scroll. */
@media (max-width: 920px) {
  .tpl-cold-chain-excursion-console .cce-main {
    display: block;
    overflow-y: auto;
  }
  .tpl-cold-chain-excursion-console .cce-rail {
    overflow-y: visible;
    height: auto;
    border-inline-end: none;
    border-block-end: var(--border-width) solid var(--color-border);
  }
  .tpl-cold-chain-excursion-console .cce-work {
    overflow-y: visible;
    height: auto;
  }
  .tpl-cold-chain-excursion-console .cce-decision-row {
    grid-template-columns: minmax(0, 1fr);
  }
}
/* <=560px (390 embed): metrics 2×2; outcomes stack; header sheds sub. */
@media (max-width: 560px) {
  .tpl-cold-chain-excursion-console .cce-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .tpl-cold-chain-excursion-console .cce-outcomes {
    grid-template-columns: minmax(0, 1fr);
  }
  .tpl-cold-chain-excursion-console .cce-brand-sub {
    display: none;
  }
}
`;function me(){return(0,f.jsxs)(`svg`,{width:`24`,height:`24`,viewBox:`0 0 24 24`,"aria-hidden":!0,focusable:`false`,children:[(0,f.jsx)(`circle`,{cx:`12`,cy:`12`,r:`9.5`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.6`,opacity:`0.45`}),(0,f.jsxs)(`g`,{fill:`none`,style:{stroke:p},strokeWidth:`1.7`,strokeLinecap:`round`,children:[(0,f.jsx)(`path`,{d:`M12 5.5v13`}),(0,f.jsx)(`path`,{d:`M6.4 8.7l11.2 6.6`}),(0,f.jsx)(`path`,{d:`M17.6 8.7L6.4 15.3`}),(0,f.jsx)(`path`,{d:`M12 5.5l-1.8 1.9M12 5.5l1.8 1.9`}),(0,f.jsx)(`path`,{d:`M12 18.5l-1.8-1.9M12 18.5l1.8-1.9`})]})]})}var H=700,U=220,W={top:12,right:14,bottom:26,left:40},G=-2,K=18;function q(e,t){let n=H-W.left-W.right;return W.left+(t<=1?0:e/(t-1)*n)}function J(e){let t=U-W.top-W.bottom;return W.top+(K-e)/(K-G)*t}function he({lot:e,scrubIndex:t}){let n=e.tempsC.length,r=[0,5,10,15],i=[];if(e.gapAfterIndex===null)i.push({points:e.tempsC.map((e,t)=>`${q(t,n)},${J(e)}`).join(` `),dashed:!1});else{let t=e.gapAfterIndex;i.push({points:e.tempsC.slice(0,t+1).map((e,t)=>`${q(t,n)},${J(e)}`).join(` `),dashed:!1}),i.push({points:[t,t+1].map(t=>`${q(t,n)},${J(e.tempsC[t])}`).join(` `),dashed:!0}),i.push({points:e.tempsC.slice(t+1).map((e,r)=>`${q(r+t+1,n)},${J(e)}`).join(` `),dashed:!1})}let a=e.tempsC.indexOf(k(e)),o=e.tempsC[t];return(0,f.jsxs)(`svg`,{className:`cce-chart-svg`,viewBox:`0 0 ${H} ${U}`,role:`img`,"aria-label":`Temperature trace for ${e.lotCode}: ${n} readings every ${e.sampleIntervalMin} minutes from ${e.startClock}, peak ${L(k(e))}, low ${L(A(e))}, keep band 2 to 8 degrees.`,children:[(0,f.jsx)(`rect`,{x:W.left,y:J(S),width:H-W.left-W.right,height:J(x)-J(S),style:{fill:y}}),r.map(e=>(0,f.jsxs)(`g`,{children:[(0,f.jsx)(`line`,{x1:W.left,x2:H-W.right,y1:J(e),y2:J(e),stroke:`var(--color-border)`,strokeWidth:`1`}),(0,f.jsxs)(`text`,{x:W.left-6,y:J(e)+3.5,textAnchor:`end`,fontSize:`10`,fill:`var(--color-text-secondary)`,style:{fontVariantNumeric:`tabular-nums`},children:[e,`°`]})]},e)),[x,S].map(e=>(0,f.jsx)(`line`,{x1:W.left,x2:H-W.right,y1:J(e),y2:J(e),style:{stroke:p},strokeWidth:`1`,opacity:`0.5`},e)),(0,f.jsx)(`line`,{x1:W.left,x2:H-W.right,y1:J(e.hardCeilingC),y2:J(e.hardCeilingC),style:{stroke:h},strokeWidth:`1.2`,strokeDasharray:`5 4`}),(0,f.jsxs)(`text`,{x:H-W.right,y:J(e.hardCeilingC)-4,textAnchor:`end`,fontSize:`9.5`,style:{fill:h},children:[`hard ceiling `,e.hardCeilingC.toFixed(1),`°`]}),[0,a,n-1].filter((e,t,n)=>n.indexOf(e)===t).map(t=>(0,f.jsx)(`text`,{x:q(t,n),y:U-8,textAnchor:`middle`,fontSize:`9.5`,fill:`var(--color-text-secondary)`,style:{fontVariantNumeric:`tabular-nums`},children:P(e,t)},t)),i.map((e,t)=>(0,f.jsx)(`polyline`,{points:e.points,fill:`none`,style:{stroke:p},strokeWidth:`2`,strokeDasharray:e.dashed?`3 5`:void 0,strokeLinejoin:`round`,strokeLinecap:`round`},t)),e.tempsC.map((e,t)=>{let r=e>S?`heat`:e<x?`freeze`:null;return(0,f.jsx)(`circle`,{cx:q(t,n),cy:J(e),r:r===null?2:3.4,style:{fill:r===`heat`?h:r===`freeze`?g:`var(--color-text-secondary)`}},t)}),(0,f.jsxs)(`text`,{x:q(a,n),y:J(k(e))-8,textAnchor:`middle`,fontSize:`10`,fontWeight:`700`,style:{fill:h,fontVariantNumeric:`tabular-nums`},children:[`peak `,k(e).toFixed(1),`°`]}),(0,f.jsx)(`line`,{x1:q(t,n),x2:q(t,n),y1:W.top,y2:U-W.bottom,style:{stroke:p},strokeWidth:`1`,strokeDasharray:`2 3`}),(0,f.jsx)(`circle`,{cx:q(t,n),cy:J(o),r:`5.5`,fill:`none`,style:{stroke:p},strokeWidth:`1.6`})]})}var Y={open:{label:`open`,variant:`warning`},"pending-qa":{label:`pending QA`,variant:`info`},closed:{label:`closed`,variant:`neutral`}};function X(){let e=ae(),[t,n]=(0,d.useState)(de),[m,g]=(0,d.useState)(`lot-0412`),[y,b]=(0,d.useState)({}),[w,D]=(0,d.useState)(0),[oe,H]=(0,d.useState)(``),U=O(m),W=t[m],G=V(W),K=R(U),q=Math.min(y[m]??U.tempsC.indexOf(k(U)),U.tempsC.length-1),J=U.tempsC[q],X=J>S?`above band`:J<x?`below band`:`in band`,ge=E.filter(e=>V(t[e.id])!==`closed`).length,Z=W.disposition!==null&&W.disposition!==K.recommended,Q=Z&&W.deviationReason===null,$=W.disposition!==null&&!Q&&!W.signedOff,_e=e=>{if(W.signedOff)return;let t=e!==K.recommended;n(n=>({...n,[m]:{...n[m],disposition:e,deviationReason:t?n[m].deviationReason:null}})),H(`${U.lotCode}: ${z[e].label} selected${t?` — deviation from the recommended path; rationale required before signoff`:` — matches the recommended path`}.`)},ve=e=>{n(t=>({...t,[m]:{...t[m],deviationReason:e}})),H(`${U.lotCode}: deviation rationale recorded.`)},ye=()=>{if(!$||W.disposition===null){Q&&e({body:`${U.lotCode}: override needs a deviation rationale before QA can sign.`,isAutoHide:!0});return}let t=se(ce+w*le),r=W.disposition;n(e=>({...e,[m]:{...e[m],signedOff:!0,signedClock:t}})),D(e=>e+1),e({body:`${U.lotCode} ${z[r].verb} — signed ${t} by ${F}.`,isAutoHide:!0}),H(`${U.lotCode} closed: ${z[r].verb}, signed at ${t}. Lane risk table updated.`)},be=()=>{n(e=>({...e,[m]:{...e[m],signedOff:!1,signedClock:null}})),e({body:`${U.lotCode} reopened for QA review.`,isAutoHide:!0}),H(`${U.lotCode} reopened. Lane risk table updated.`)},xe=e=>{g(e);let t=O(e);H(`Reviewing ${t.lotCode}: recommended ${z[R(t).recommended].label}.`)};return(0,f.jsxs)(`div`,{className:`tpl-cold-chain-excursion-console`,children:[(0,f.jsx)(`style`,{children:pe}),(0,f.jsx)(te,{height:`fill`,header:(0,f.jsx)(re,{hasDivider:!0,children:(0,f.jsxs)(`div`,{className:`cce-header-row`,children:[(0,f.jsxs)(`div`,{className:`cce-brand`,children:[(0,f.jsx)(me,{}),(0,f.jsxs)(`div`,{children:[(0,f.jsxs)(`div`,{className:`cce-brand-name`,children:[(0,f.jsx)(`h1`,{className:`cce-vh`,children:`Frostline cold chain excursion console`}),(0,f.jsx)(`span`,{"aria-hidden":!0,children:`Frostline`})]}),(0,f.jsx)(`div`,{className:`cce-brand-sub`,children:`QA disposition desk · Regional cold hub CH-04 · keep band 2–8 °C`})]})]}),(0,f.jsx)(l,{label:`${ge} of ${E.length} lots unresolved`,variant:ge===0?`success`:`warning`})]})}),content:(0,f.jsxs)(ne,{padding:0,children:[(0,f.jsx)(`div`,{"aria-live":`polite`,className:`cce-vh`,children:oe}),(0,f.jsxs)(`div`,{className:`cce-main`,children:[(0,f.jsxs)(`nav`,{className:`cce-rail`,"aria-label":`Excursion lot queue`,children:[(0,f.jsx)(`div`,{className:`cce-rail-head`,children:`Excursion queue — oldest first`}),E.map(e=>{let n=t[e.id],r=V(n),i=Y[r],a=Math.round(M(e)/e.stabilityBudgetMin*100),o=N(e);return(0,f.jsxs)(`button`,{type:`button`,className:`cce-queue-row`,"aria-pressed":e.id===m,onClick:()=>xe(e.id),children:[(0,f.jsxs)(`span`,{className:`cce-queue-top`,children:[(0,f.jsx)(`span`,{className:`cce-queue-code`,children:e.lotCode}),(0,f.jsx)(l,{label:i.label,variant:r===`closed`&&n.disposition===`release`?`success`:r===`closed`&&n.disposition===`destroy`?`error`:i.variant})]}),(0,f.jsx)(`span`,{className:`cce-queue-product`,children:e.product}),(0,f.jsxs)(`span`,{className:`cce-queue-meta`,children:[(0,f.jsx)(`span`,{children:T(e.laneId).label}),(0,f.jsx)(`span`,{className:o?`cce-peak-freeze`:`cce-peak-heat`,children:o?`low ${L(A(e))}`:`peak ${L(k(e))}`}),(0,f.jsxs)(`span`,{children:[`TOR `,M(e),`/`,e.stabilityBudgetMin,` min`]})]}),(0,f.jsx)(`span`,{className:`cce-torbar`,role:`img`,"aria-label":`Stability budget ${Math.min(a,999)} percent used`,children:(0,f.jsx)(`span`,{className:`cce-torbar-fill`,style:{width:`${Math.min(a,100)}%`,background:a>100?h:a>=70?v:_}})})]},e.id)})]}),(0,f.jsxs)(`div`,{className:`cce-work`,children:[(0,f.jsxs)(`section`,{className:`cce-card`,"aria-label":`Excursion trace`,children:[(0,f.jsxs)(`h2`,{className:`cce-card-title`,children:[U.lotCode,` — `,U.product,(0,f.jsx)(l,{label:Y[G].label,variant:G===`closed`&&W.disposition===`release`?`success`:G===`closed`&&W.disposition===`destroy`?`error`:Y[G].variant})]}),(0,f.jsxs)(`div`,{className:`cce-card-sub`,children:[T(U.laneId).label,` ·`,` `,T(U.laneId).mode,` · `,T(U.laneId).carrier,` · sensor `,U.sensor,` · `,U.quantity,U.gapNote!==null&&` · ⚠ ${U.gapNote}`]}),(0,f.jsx)(he,{lot:U,scrubIndex:q}),(0,f.jsxs)(`div`,{className:`cce-scrub-row`,children:[(0,f.jsx)(`input`,{type:`range`,className:`cce-scrub`,min:0,max:U.tempsC.length-1,step:1,value:q,"aria-label":`Scrub trace readings for ${U.lotCode}`,"aria-valuetext":`${P(U,q)}, ${L(J)}, ${X}`,onChange:e=>b(t=>({...t,[m]:Number(e.target.value)}))}),(0,f.jsxs)(`span`,{className:`cce-scrub-readout${J>S?` cce-readout-heat`:J<x?` cce-readout-freeze`:``}`,"aria-hidden":!0,children:[P(U,q),` · t+`,q*U.sampleIntervalMin,` min ·`,` `,L(J),` · `,X]})]})]}),(0,f.jsxs)(`section`,{className:`cce-metrics`,"aria-label":`Excursion metrics`,children:[(0,f.jsxs)(`div`,{className:`cce-metric`,children:[(0,f.jsx)(`span`,{className:`cce-metric-label`,children:`Peak / low`}),(0,f.jsxs)(`span`,{className:`cce-metric-value`,children:[k(U).toFixed(1),`° / `,A(U).toFixed(1),`°`]}),(0,f.jsxs)(`span`,{className:`cce-metric-sub`,children:[`ceiling `,U.hardCeilingC.toFixed(1),`° ·`,` `,U.freezeSensitive?`freeze-sensitive`:`freeze-tolerant`]})]}),(0,f.jsxs)(`div`,{className:`cce-metric`,children:[(0,f.jsx)(`span`,{className:`cce-metric-label`,children:`Event TOR`}),(0,f.jsxs)(`span`,{className:`cce-metric-value`,children:[j(U),` min`]}),(0,f.jsxs)(`span`,{className:`cce-metric-sub`,children:[`readings above 8.0° × `,U.sampleIntervalMin,`-min interval`]})]}),(0,f.jsxs)(`div`,{className:`cce-metric`,children:[(0,f.jsx)(`span`,{className:`cce-metric-label`,children:`Cumulative TOR`}),(0,f.jsxs)(`span`,{className:`cce-metric-value`,children:[M(U),`/`,U.stabilityBudgetMin,` min`]}),(0,f.jsxs)(`span`,{className:`cce-metric-sub`,children:[U.priorTorMin,` min from earlier legs`]})]}),(0,f.jsxs)(`div`,{className:`cce-metric`,children:[(0,f.jsx)(`span`,{className:`cce-metric-label`,children:`Samples`}),(0,f.jsx)(`span`,{className:`cce-metric-value`,children:U.tempsC.length}),(0,f.jsxs)(`span`,{className:`cce-metric-sub`,children:[`from `,U.startClock,` ·`,` `,U.gapAfterIndex===null?`contiguous`:`telemetry gap`]})]})]}),(0,f.jsxs)(`div`,{className:`cce-decision-row`,children:[(0,f.jsxs)(`section`,{className:`cce-card`,"aria-label":`Disposition decision tree`,children:[(0,f.jsxs)(`h2`,{className:`cce-card-title`,children:[`Disposition decision tree`,(0,f.jsx)(l,{label:`recommends ${z[K.recommended].label}`,variant:K.recommended===`release`?`success`:K.recommended===`hold`?`warning`:`error`})]}),(0,f.jsxs)(`div`,{children:[I.map((e,t)=>{let n=K.answers.find(t=>t.gate.id===e.id),r=n!==void 0;return(0,f.jsxs)(`div`,{className:`cce-gate ${r?`cce-gate-on`:`cce-gate-off`}`,children:[(0,f.jsxs)(`span`,{className:`cce-gate-spine`,"aria-hidden":!0,children:[(0,f.jsx)(`span`,{className:`cce-gate-dot`}),t<I.length-1&&(0,f.jsx)(`span`,{className:`cce-gate-line`})]}),(0,f.jsxs)(`span`,{className:`cce-gate-body`,children:[(0,f.jsx)(`span`,{className:`cce-gate-q`,children:e.question}),r?(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(`span`,{className:`cce-gate-detail`,children:n.detail}),(0,f.jsxs)(`span`,{className:`cce-gate-answer`,style:{color:n.isExit?z[e.exitOutcome].color:p},children:[n.answer.toUpperCase(),n.isExit?` — exits: ${z[e.exitOutcome].label.toUpperCase()}`:` — continue`]})]}):(0,f.jsx)(`span`,{className:`cce-gate-detail`,children:`not reached — tree exited above`})]})]},e.id)}),K.answers.length===I.length&&!K.answers[I.length-1].isExit&&(0,f.jsxs)(`div`,{className:`cce-gate cce-gate-on`,children:[(0,f.jsx)(`span`,{className:`cce-gate-spine`,"aria-hidden":!0,children:(0,f.jsx)(`span`,{className:`cce-gate-dot`})}),(0,f.jsxs)(`span`,{className:`cce-gate-body`,children:[(0,f.jsx)(`span`,{className:`cce-gate-q`,children:`Budget exceeded with incomplete telemetry`}),(0,f.jsx)(`span`,{className:`cce-gate-answer`,style:{color:h},children:`FALL-THROUGH — exits: DESTROY`})]})]})]}),(0,f.jsx)(`div`,{className:`cce-outcomes`,role:`group`,"aria-label":`Choose disposition`,children:ue.map(e=>{let t=z[e],n=e===K.recommended,r=W.disposition===e;return(0,f.jsxs)(`button`,{type:`button`,className:`cce-outcome`,"aria-pressed":r,disabled:W.signedOff,style:r?{borderColor:t.color,boxShadow:`inset 0 0 0 1px ${t.color}`}:void 0,onClick:()=>_e(e),children:[(0,f.jsx)(`span`,{className:`cce-outcome-name`,style:{color:t.color},children:t.label}),(0,f.jsx)(`span`,{className:`cce-outcome-blurb`,children:t.blurb}),(0,f.jsx)(`span`,{className:`cce-outcome-tag`,style:{color:n?p:`var(--color-text-secondary)`},children:r&&n?`chosen · recommended`:r?`chosen · deviation`:n?`recommended`:`\xA0`})]},e)})})]}),(0,f.jsxs)(`section`,{className:`cce-card cce-gatecard`,"aria-label":`QA signoff gate`,children:[(0,f.jsxs)(`h2`,{className:`cce-card-title`,children:[(0,f.jsx)(r,{icon:W.signedOff?i:a,size:`sm`,color:`secondary`}),`QA signoff gate`]}),(0,f.jsx)(`div`,{className:`cce-gatecard-status`,children:W.disposition===null?(0,f.jsx)(`span`,{className:`cce-card-sub`,children:`Choose a disposition on the tree to arm the gate.`}):(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(`span`,{style:{color:z[W.disposition].color,fontWeight:700},children:z[W.disposition].label}),(0,f.jsx)(`span`,{className:`cce-card-sub`,children:Z?`deviates from recommended ${z[K.recommended].label}`:`matches the recommended path`})]})}),Z&&!W.signedOff&&(0,f.jsxs)(`div`,{className:`cce-deviation`,children:[(0,f.jsxs)(`span`,{className:`cce-deviation-title`,children:[(0,f.jsx)(r,{icon:c,size:`xsm`,color:`inherit`}),`Deviation rationale required`]}),(0,f.jsx)(ie,{label:`Rationale`,size:`sm`,placeholder:`Select a documented rationale`,options:B.map(e=>({value:e.value,label:e.label})),value:W.deviationReason??void 0,onChange:e=>ve(String(e))})]}),W.signedOff&&W.disposition!==null&&W.signedClock!==null?(0,f.jsxs)(`div`,{className:`cce-signed`,children:[(0,f.jsxs)(`span`,{children:[(0,f.jsx)(r,{icon:ee,size:`xsm`,color:`inherit`}),` `,`Lot `,z[W.disposition].verb,`.`]}),(0,f.jsxs)(`span`,{className:`cce-signed-line`,children:[`signed `,W.signedClock,` · `,F]}),W.deviationReason!==null&&(0,f.jsxs)(`span`,{className:`cce-signed-line`,children:[`deviation:`,` `,B.find(e=>e.value===W.deviationReason)?.label??W.deviationReason]})]}):(0,f.jsx)(`span`,{className:`cce-card-sub`,children:`Signing closes the lot, stamps the register, and re-grades the lane risk table below.`}),(0,f.jsxs)(`div`,{className:`cce-gate-actions`,children:[W.signedOff?(0,f.jsx)(u,{label:`Reopen lot`,variant:`ghost`,size:`sm`,icon:(0,f.jsx)(r,{icon:s,size:`sm`}),onClick:be}):(0,f.jsx)(u,{label:`Sign as QA — ${F}`,variant:`primary`,size:`sm`,icon:(0,f.jsx)(r,{icon:o,size:`sm`}),isDisabled:!$,onClick:ye}),Q&&(0,f.jsx)(`span`,{className:`cce-card-sub`,role:`status`,children:`gate locked — rationale missing`})]})]})]}),(0,f.jsxs)(`section`,{className:`cce-card`,"aria-label":`Lane risk`,children:[(0,f.jsx)(`h2`,{className:`cce-card-title`,children:`Lane risk — re-grades as lots close`}),(0,f.jsx)(`div`,{className:`cce-table-scroll`,children:(0,f.jsxs)(`table`,{className:`cce-table`,children:[(0,f.jsx)(`thead`,{children:(0,f.jsxs)(`tr`,{children:[(0,f.jsx)(`th`,{scope:`col`,children:`Lane`}),(0,f.jsx)(`th`,{scope:`col`,children:`Mode / carrier`}),(0,f.jsx)(`th`,{scope:`col`,children:`Ship 30d`}),(0,f.jsx)(`th`,{scope:`col`,children:`Unresolved`}),(0,f.jsx)(`th`,{scope:`col`,children:`Closed`}),(0,f.jsx)(`th`,{scope:`col`,children:`Mean TOR util`}),(0,f.jsx)(`th`,{scope:`col`,children:`Grade`})]})}),(0,f.jsx)(`tbody`,{children:C.map(e=>{let n=fe(e,t);return(0,f.jsxs)(`tr`,{children:[(0,f.jsx)(`td`,{children:(0,f.jsx)(`span`,{className:`cce-lane-label`,children:e.label})}),(0,f.jsxs)(`td`,{children:[e.mode,` · `,e.carrier]}),(0,f.jsx)(`td`,{children:e.shipments30d}),(0,f.jsx)(`td`,{children:n.openCount===0?`—`:(0,f.jsx)(`span`,{style:{color:v,fontWeight:600},children:n.openCount})}),(0,f.jsxs)(`td`,{children:[n.closedCount,n.destroyedCount>0&&` (${n.destroyedCount} destroyed)`]}),(0,f.jsxs)(`td`,{children:[n.meanUtilPct,`%`]}),(0,f.jsx)(`td`,{children:(0,f.jsx)(`span`,{className:`cce-grade cce-grade-${n.grade}`,children:n.grade})})]},e.id)})})]})}),(0,f.jsx)(`span`,{className:`cce-card-sub`,children:`Grade = 2 pts per unresolved excursion + budget-pressure pts (mean TOR utilisation ≥ 85% → 2, ≥ 60% → 1) + 1 pt per destroyed lot. A 0–1 · B 2–3 · C 4–5 · D 6+.`})]})]})]})]})})]})}export{X as default};