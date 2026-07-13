import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-DlKHZgO2.js";import{t as i}from"./Icon-DNqmP2EH.js";import{t as a}from"./archive-C5wKL-sD.js";import{t as o}from"./calendar-days-D4ZY5way.js";import{t as s}from"./database-DlFh3VN-.js";import{t as c}from"./gavel-ezKqK6Xt.js";import{t as l}from"./history-DjIPagvy.js";import{t as u}from"./scale-Bb212Kl3.js";import{t as d}from"./trash-2-BB36VjEs.js";import{t as f}from"./undo-2-FolzW3zf.js";import{b as p,v as m}from"./index-CZ0XLKUx.js";import{t as h}from"./HStack-2WTukjNp.js";import{t as g}from"./StackItem-Ca9P7L2I.js";import{n as ee,t as te}from"./LayoutContent-CCL91W7X.js";import{t as ne}from"./LayoutHeader-Cy2mWoMf.js";import{t as _}from"./Heading-BBqhYPTB.js";import{t as v}from"./Badge-0Tj9omHc.js";import{t as y}from"./Button-Cj_m5AlK.js";var b=e(t(),1),x=n(),S=`tpl-data-retention-policy-center`,C=`light-dark(#92400E, #E5A54B)`,w=`light-dark(#FFFFFF, #2A1B04)`,T=`light-dark(rgba(146, 64, 14, 0.10), rgba(229, 165, 75, 0.14))`,E=`light-dark(#B91C1C, #F87171)`,D=`light-dark(rgba(185, 28, 28, 0.10), rgba(248, 113, 113, 0.14))`,O=`light-dark(#15803D, #4ADE80)`,k=`light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))`,A=`ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace`,j=[{id:`grp-customer`,label:`Customer data`,scopes:[{id:`cd-tickets`,name:`Support tickets`,rule:`3y after close`,records:1284300,overdue:41200},{id:`cd-chat`,name:`Chat transcripts`,rule:`18m after session`,records:862110,overdue:96400,holdId:`lh-011`},{id:`cd-calls`,name:`Call recordings`,rule:`12m after call`,records:214800,overdue:58300,holdId:`lh-011`}]},{id:`grp-employee`,label:`Employee data`,scopes:[{id:`emp-hr`,name:`HR case files`,rule:`7y after separation`,records:18240,overdue:1120},{id:`emp-payroll`,name:`Payroll stubs`,rule:`7y after issue`,records:96500,overdue:0}]},{id:`grp-telemetry`,label:`Product telemetry`,scopes:[{id:`tel-events`,name:`Event logs`,rule:`13m rolling`,records:9412e3,overdue:388e3},{id:`tel-crash`,name:`Crash dumps`,rule:`6m rolling`,records:122400,overdue:9850,holdId:`lh-019`}]},{id:`grp-financial`,label:`Financial`,scopes:[{id:`fin-inv`,name:`Invoices`,rule:`10y after issue`,records:402300,overdue:12700,holdId:`lh-003`},{id:`fin-tax`,name:`Tax filings`,rule:`permanent`,records:8050,overdue:0}]}],M=j.flatMap(e=>e.scopes),N=[{id:`lh-011`,ref:`LH-2024-011`,shortRef:`LH-011`,matter:`Delgado v. Nortech Ltd. — N.D. Cal. 3:24-cv-04412`,custodian:`Meyer & Bloch LLP`,scopeIds:[`cd-chat`,`cd-calls`]},{id:`lh-003`,ref:`LH-2025-003`,shortRef:`LH-003`,matter:`FY23 state tax audit — Franchise Tax Board`,custodian:`Internal tax counsel`,scopeIds:[`fin-inv`]},{id:`lh-019`,ref:`LH-2026-019`,shortRef:`LH-019`,matter:`Crashloop incident review (eng litigation hold)`,custodian:`Meyer & Bloch LLP`,scopeIds:[`tel-crash`]}],P=[{id:`EX-341`,holdId:`lh-011`,scopeId:`cd-chat`,records:96400,requestedBy:`A. Okafor · Legal Ops`,requestedOn:`Jul 13`,basis:`Stipulated order (Dkt. 84) narrows discovery to post-2023 sessions; transcripts past retention fall outside the preserved class.`},{id:`EX-342`,holdId:`lh-011`,scopeId:`cd-calls`,records:58300,requestedBy:`A. Okafor · Legal Ops`,requestedOn:`Jul 14`,basis:`Outside-counsel memo M-2216 extends the Dkt. 84 carve-out to call recordings; audio past the 12m rule is releasable.`},{id:`EX-347`,holdId:`lh-019`,scopeId:`tel-crash`,records:9850,requestedBy:`D. Reyes · SRE governance`,requestedOn:`Jul 12`,basis:`Incident review closed Jul 10; counsel drafted the release — no claim was filed within the notice period.`}],F={id:`EX-338`,holdRef:`LH-2025-003`,scopeName:`Invoices`,records:12700,verdict:`denied`,decidedOn:`Jul 9`,decidedBy:`R. Whitfield · Deputy GC`,reason:`Audit fieldwork extended to Sep 30 — hold must stand.`},I=[{id:`W-2607`,day:3,scopeIds:[`emp-payroll`],kind:`completed`,purged:4180},{id:`W-2608`,day:11,scopeIds:[`cd-tickets`],kind:`completed`,purged:38600,note:`41,200 re-queued to Aug 8`},{id:`W-2609`,day:18,scopeIds:[`cd-chat`,`cd-calls`],kind:`scheduled`},{id:`W-2610`,day:22,scopeIds:[`tel-crash`],kind:`scheduled`},{id:`W-2611`,day:25,scopeIds:[`tel-events`,`emp-hr`],kind:`scheduled`},{id:`W-2612`,day:31,scopeIds:[`fin-inv`],kind:`scheduled`,note:`EX-338 denied Jul 9 — remains blocked`}],L=15,re=3,ie=31,ae=[`Sun`,`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`],R=904,z=3;function B(e){return M.find(t=>t.id===e)??M[0]}function V(e){return N.find(t=>t.id===e)??N[0]}function H(e){return e.toLocaleString(`en-US`)}function U(e){let t=R+e*z,n=Math.floor(t/60)%24,r=t%60;return`${String(n).padStart(2,`0`)}:${String(r).padStart(2,`0`)}`}function W(e,t){let n=B(e);if(n.holdId===void 0)return{kind:`none`};let r=V(n.holdId),i=P.find(r=>r.scopeId===e&&r.holdId===n.holdId&&t[r.id]===`approved`);return i===void 0?{kind:`held`,hold:r}:{kind:`released`,hold:r,exceptionId:i.id}}function G(e,t){return e.scopeIds.filter(e=>W(e,t).kind===`held`).length}function K(e,t){return e.kind===`completed`?`completed`:G(e,t)>0?`blocked`:`clear`}function q(e){return e.scopeIds.reduce((e,t)=>e+B(t).overdue,0)}function J(e){return M.reduce((t,n)=>W(n.id,e).kind===`held`?t+n.overdue:t,0)}function oe(e){return I.find(t=>t.kind===`scheduled`&&t.day>L&&K(t,e)===`clear`)}var se=M.reduce((e,t)=>e+t.records,0),ce=M.reduce((e,t)=>e+t.overdue,0),le=`
.${S} {
  font-family: var(--font-family-sans);
}
.${S} button {
  font: inherit;
  color: inherit;
}
.${S} .rpc-focusable:focus-visible {
  outline: 2px solid ${C};
  outline-offset: -2px;
}
.${S} .rpc-num {
  font-variant-numeric: tabular-nums;
}
.${S} .rpc-mono {
  font-family: ${A};
}
.${S} .rpc-header-row {
  padding: var(--spacing-2) var(--spacing-4);
  min-height: 56px;
  box-sizing: border-box;
}
.${S} .rpc-mark {
  display: inline-flex;
  flex-shrink: 0;
  color: ${C};
}
.${S} .rpc-content {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
/* --- stat strip: 44px of derived governance chips ------------------------- */
.${S} .rpc-stats {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  min-height: 44px;
  box-sizing: border-box;
  padding: var(--spacing-1) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
  overflow-x: auto;
  white-space: nowrap;
}
.${S} .rpc-stat {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}
.${S} .rpc-stat strong {
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
}
.${S} .rpc-stat--risk strong {
  color: ${E};
}
.${S} .rpc-stat--clear strong {
  color: ${O};
}
/* --- body grid: 288 | fill | 316 ------------------------------------------- */
/* Hand-rolled grid (not the DS grid) so the <=900px media query can restack
   the three panes — the DS grid would inline the track list. */
.${S} .rpc-body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 288px minmax(0, 1fr) 316px;
}
.${S} .rpc-pane {
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.${S} .rpc-pane + .rpc-pane {
  border-inline-start: var(--border-width) solid var(--color-border);
}
.${S} .rpc-pane-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.${S} .rpc-pane-title {
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-1);
}
/* --- policy scope tree: 32px group headers, 40px scope rows ---------------- */
.${S} .rpc-group-head {
  min-height: 32px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  padding: 0 var(--spacing-3);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.${S} .rpc-scope-row {
  width: 100%;
  min-height: 40px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: 2px var(--spacing-3) 2px var(--spacing-4);
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: start;
  min-width: 0;
}
.${S} .rpc-scope-row[aria-pressed='true'] {
  background: ${T};
  box-shadow: inset 2px 0 0 0 ${C};
}
.${S} .rpc-scope-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.${S} .rpc-scope-name {
  font-size: 12.5px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${S} .rpc-scope-rule {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${S} .rpc-scope-counts {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
}
.${S} .rpc-scope-records {
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
}
.${S} .rpc-scope-overdue {
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${S} .rpc-scope-overdue--held {
  color: ${E};
}
/* Hold / released badges: 18px pills shared by tree, calendar, and detail. */
.${S} .rpc-hold-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 18px;
  box-sizing: border-box;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
  color: ${E};
  background: ${D};
  border: var(--border-width) solid ${E};
}
.${S} .rpc-hold-badge--released {
  color: ${O};
  background: ${k};
  border-color: ${O};
}
/* --- legal-hold ledger: 56px rows ------------------------------------------ */
.${S} .rpc-hold-row {
  min-height: 56px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: var(--spacing-1) var(--spacing-3);
  border-top: var(--border-width) solid var(--color-border);
  min-width: 0;
}
.${S} .rpc-hold-top {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
}
.${S} .rpc-hold-matter {
  flex: 1;
  min-width: 0;
  font-size: 11.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-text-primary);
}
.${S} .rpc-hold-meta {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* --- purge calendar: 24px weekday row, 64px-min day cells ------------------ */
.${S} .rpc-cal {
  padding: var(--spacing-2) var(--spacing-3) var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}
.${S} .rpc-cal-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.${S} .rpc-weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  min-height: 24px;
  align-items: center;
}
.${S} .rpc-weekday {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  text-align: center;
}
.${S} .rpc-cal-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 2px;
}
.${S} .rpc-day {
  min-height: 64px;
  box-sizing: border-box;
  border: var(--border-width) solid var(--color-border);
  border-radius: 6px;
  padding: 3px 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  background: transparent;
  text-align: start;
}
.${S} .rpc-day--blank {
  border-color: transparent;
}
.${S} .rpc-day--window {
  cursor: pointer;
}
.${S} .rpc-day--window[aria-pressed='true'] {
  border-color: ${C};
  background: ${T};
}
.${S} .rpc-day--scope-hit {
  box-shadow: inset 0 0 0 1px ${C};
}
.${S} .rpc-day--today {
  box-shadow: inset 0 2px 0 0 ${C};
}
.${S} .rpc-day-num {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${S} .rpc-day-num--today {
  color: ${C};
  font-weight: 700;
}
.${S} .rpc-day-pill {
  display: flex;
  align-items: center;
  gap: 3px;
  border-radius: 4px;
  padding: 1px 4px;
  font-size: 10px;
  font-weight: 600;
  min-width: 0;
}
.${S} .rpc-day-pill--completed {
  color: var(--color-text-secondary);
  background: var(--color-background-secondary, ${T});
}
.${S} .rpc-day-pill--blocked {
  color: ${E};
  background: ${D};
}
.${S} .rpc-day-pill--clear {
  color: ${C};
  background: ${T};
}
/* Selected clear window: pill flips to a solid brand fill (BRAND_ON text). */
.${S} .rpc-day--window[aria-pressed='true'] .rpc-day-pill--clear {
  color: ${w};
  background: ${C};
}
.${S} .rpc-day-pill-id {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${S} .rpc-day-sub {
  font-size: 9.5px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* --- window / scope detail bar: min 112 ------------------------------------ */
.${S} .rpc-detail {
  flex-shrink: 0;
  min-height: 112px;
  box-sizing: border-box;
  border-top: var(--border-width) solid var(--color-border);
  padding: var(--spacing-2) var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  overflow-y: auto;
  max-height: 200px;
}
.${S} .rpc-detail-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.${S} .rpc-detail-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 24px;
  font-size: 12px;
  min-width: 0;
}
.${S} .rpc-detail-row-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* --- exceptions rail: cards with 40px actions ------------------------------- */
.${S} .rpc-exc-card {
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  margin: 0 var(--spacing-3) var(--spacing-2);
  padding: var(--spacing-2);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
}
.${S} .rpc-exc-top {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
}
.${S} .rpc-exc-id {
  font-family: ${A};
  font-size: 12px;
  font-weight: 700;
}
.${S} .rpc-exc-records {
  margin-inline-start: auto;
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}
.${S} .rpc-exc-basis {
  font-size: 11.5px;
  line-height: 1.45;
  color: var(--color-text-secondary);
}
.${S} .rpc-exc-actions {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
/* --- decision log ----------------------------------------------------------- */
.${S} .rpc-log-row {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  padding: var(--spacing-1) var(--spacing-3);
  font-size: 12px;
}
.${S} .rpc-log-clock {
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}
.${S} .rpc-log-body {
  min-width: 0;
  flex: 1;
}
.${S} .rpc-verdict {
  font-weight: 700;
}
.${S} .rpc-verdict--approved {
  color: ${O};
}
.${S} .rpc-verdict--denied {
  color: ${E};
}
/* --- responsive subtraction -------------------------------------------------- */
@media (max-width: 900px) {
  .${S} .rpc-body {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  .${S} .rpc-pane {
    flex: none;
  }
  .${S} .rpc-pane + .rpc-pane {
    border-inline-start: none;
    border-top: var(--border-width) solid var(--color-border);
  }
  .${S} .rpc-pane-scroll {
    overflow-y: visible;
    flex: none;
  }
  .${S} .rpc-detail {
    max-height: none;
  }
}
@media (max-width: 600px) {
  .${S} .rpc-day-pill-id {
    display: none;
  }
  .${S} .rpc-day-sub {
    display: none;
  }
}
@media (prefers-reduced-motion: no-preference) {
  .${S} .rpc-scope-row,
  .${S} .rpc-day--window {
    transition: background-color 120ms ease, border-color 120ms ease;
  }
}
`;function ue(){return(0,x.jsx)(`span`,{className:`rpc-mark`,"aria-hidden":!0,children:(0,x.jsxs)(`svg`,{width:`20`,height:`20`,viewBox:`0 0 20 20`,fill:`none`,children:[(0,x.jsx)(`rect`,{x:`3`,y:`4`,width:`14`,height:`12`,rx:`2`,stroke:`currentColor`,strokeWidth:`1.6`}),(0,x.jsx)(`path`,{d:`M3 9.2h14`,stroke:`currentColor`,strokeWidth:`1.6`}),(0,x.jsx)(`path`,{d:`M10 4v12`,stroke:`currentColor`,strokeWidth:`1.2`}),(0,x.jsx)(`circle`,{cx:`10`,cy:`9.2`,r:`1.9`,fill:`currentColor`})]})})}function Y({state:e}){return e.kind===`none`?null:e.kind===`held`?(0,x.jsxs)(`span`,{className:`rpc-hold-badge`,title:e.hold.matter,children:[(0,x.jsx)(i,{icon:c,size:`xsm`,color:`inherit`}),e.hold.shortRef]}):(0,x.jsxs)(`span`,{className:`rpc-hold-badge rpc-hold-badge--released`,title:`${e.hold.matter} — released via ${e.exceptionId}`,children:[(0,x.jsx)(i,{icon:p,size:`xsm`,color:`inherit`}),`released`]})}function X(){let[e,t]=(0,b.useState)({}),[n,C]=(0,b.useState)([]),[w,T]=(0,b.useState)(0),[E,D]=(0,b.useState)({kind:`window`,id:`W-2609`}),[O,k]=(0,b.useState)(``),A=J(e),M=oe(e),R=P.filter(t=>e[t.id]===void 0),z=N.reduce((t,n)=>t+n.scopeIds.filter(t=>W(t,e).kind===`held`).length,0),X=(n,r)=>{let i=P.find(e=>e.id===n);if(i===void 0||e[n]!==void 0)return;let a={...e,[n]:r},o=B(i.scopeId),s=V(i.holdId),c=I.find(e=>e.scopeIds.includes(i.scopeId)),l=U(w),u,d;if(r===`approved`){let e=c===void 0?0:G(c,a),t=c===void 0?``:e===0?` ${c.id} (Jul ${c.day}) is now CLEAR — ${H(q(c))} records purge-eligible.`:` ${c.id} still has ${e} active hold${e===1?``:`s`}.`;u=`${n} approved — ${s.shortRef} released for ${o.name} (${H(i.records)} records unblocked).${t}`,d=`${n} approved. Hold badge lifted on ${o.name}; records at risk now ${H(J(a))}.${t}`}else u=`${n} denied — ${s.shortRef} stands on ${o.name}; window stays blocked.`,d=`${n} denied. ${s.shortRef} remains active on ${o.name}.`;t(a),T(e=>e+1),C(e=>[{id:`dec-${l}-${n}`,clockLabel:l,exceptionId:n,verdict:r,summary:u},...e]),k(d)},de=()=>{let e=n[0];e!==void 0&&(t(t=>{let n={...t};return delete n[e.exceptionId],n}),C(e=>e.slice(1)),k(`Decision on ${e.exceptionId} undone — every derived surface reverted.`))},fe=e=>{D({kind:`scope`,id:e}),k(`Inspecting scope ${B(e).name}.`)},pe=e=>{D({kind:`window`,id:e})},me=(0,x.jsx)(`div`,{className:`rpc-pane`,"aria-label":`Policy scopes`,children:(0,x.jsxs)(`div`,{className:`rpc-pane-scroll`,children:[(0,x.jsx)(`div`,{className:`rpc-pane-title`,children:(0,x.jsxs)(h,{gap:1,vAlign:`center`,children:[(0,x.jsx)(i,{icon:a,size:`sm`,color:`secondary`}),(0,x.jsx)(r,{type:`label`,size:`sm`,color:`secondary`,children:`Policy scopes`})]})}),j.map(t=>{let n=t.scopes.reduce((e,t)=>e+t.records,0);return(0,x.jsxs)(`div`,{role:`group`,"aria-label":t.label,children:[(0,x.jsxs)(`div`,{className:`rpc-group-head`,children:[(0,x.jsx)(`span`,{children:t.label}),(0,x.jsx)(`span`,{className:`rpc-num`,children:H(n)})]}),t.scopes.map(t=>{let n=W(t.id,e);return(0,x.jsxs)(`button`,{type:`button`,className:`rpc-scope-row rpc-focusable`,"aria-pressed":E.kind===`scope`&&E.id===t.id,onClick:()=>fe(t.id),children:[(0,x.jsxs)(`span`,{className:`rpc-scope-main`,children:[(0,x.jsx)(`span`,{className:`rpc-scope-name`,children:t.name}),(0,x.jsx)(`span`,{className:`rpc-scope-rule`,children:t.rule})]}),(0,x.jsx)(Y,{state:n}),(0,x.jsxs)(`span`,{className:`rpc-scope-counts`,children:[(0,x.jsx)(`span`,{className:`rpc-scope-records`,children:H(t.records)}),(0,x.jsx)(`span`,{className:n.kind===`held`&&t.overdue>0?`rpc-scope-overdue rpc-scope-overdue--held`:`rpc-scope-overdue`,children:t.overdue>0?`${H(t.overdue)} overdue`:`none overdue`})]})]},t.id)})]},t.id)}),(0,x.jsx)(`div`,{className:`rpc-pane-title`,children:(0,x.jsxs)(h,{gap:1,vAlign:`center`,children:[(0,x.jsx)(i,{icon:u,size:`sm`,color:`secondary`}),(0,x.jsxs)(r,{type:`label`,size:`sm`,color:`secondary`,children:[`Legal holds (`,N.length,`)`]})]})}),N.map(t=>{let n=t.scopeIds.filter(t=>W(t,e).kind===`released`).length,r=t.scopeIds.length-n;return(0,x.jsxs)(`div`,{className:`rpc-hold-row`,children:[(0,x.jsxs)(`div`,{className:`rpc-hold-top`,children:[(0,x.jsxs)(`span`,{className:r===0?`rpc-hold-badge rpc-hold-badge--released`:`rpc-hold-badge`,children:[(0,x.jsx)(i,{icon:c,size:`xsm`,color:`inherit`}),t.shortRef]}),(0,x.jsx)(`span`,{className:`rpc-hold-matter`,title:t.matter,children:t.matter})]}),(0,x.jsxs)(`span`,{className:`rpc-hold-meta`,children:[t.custodian,` ·`,` `,(0,x.jsx)(`span`,{className:`rpc-num`,children:r===0?`fully released this session`:`${r} of ${t.scopeIds.length} scope${t.scopeIds.length===1?``:`s`} still held`})]})]},t.id)})]})}),Z=[...Array.from({length:re},()=>null),...Array.from({length:ie},(e,t)=>t+1)];for(;Z.length%7!=0;)Z.push(null);let Q=E.kind===`window`?I.find(e=>e.id===E.id):void 0,$=E.kind===`scope`?B(E.id):void 0,he=(0,x.jsxs)(`div`,{className:`rpc-pane`,"aria-label":`Purge-window calendar`,children:[(0,x.jsx)(`div`,{className:`rpc-pane-scroll`,children:(0,x.jsxs)(`div`,{className:`rpc-cal`,children:[(0,x.jsxs)(`div`,{className:`rpc-cal-head`,children:[(0,x.jsxs)(h,{gap:1,vAlign:`center`,children:[(0,x.jsx)(i,{icon:o,size:`sm`,color:`secondary`}),(0,x.jsx)(_,{level:4,accessibilityLevel:2,children:`July 2026 purge windows`})]}),(0,x.jsx)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:`today: Wed Jul 15 · windows run 01:00–05:00 UTC`})]}),(0,x.jsx)(`div`,{className:`rpc-weekdays`,"aria-hidden":!0,children:ae.map(e=>(0,x.jsx)(`span`,{className:`rpc-weekday`,children:e},e))}),(0,x.jsx)(`div`,{className:`rpc-cal-grid`,children:Z.map((t,n)=>{if(t===null)return(0,x.jsx)(`div`,{className:`rpc-day rpc-day--blank`,"aria-hidden":!0},`blank-${n}`);let r=t===L,a=I.find(e=>e.day===t),o=(0,x.jsxs)(`span`,{className:r?`rpc-day-num rpc-day-num--today`:`rpc-day-num`,children:[t,r?` · today`:``]});if(a===void 0)return(0,x.jsx)(`div`,{className:r?`rpc-day rpc-day--today`:`rpc-day`,children:o},`day-${t}`);let s=K(a,e),l=G(a,e),u=E.kind===`window`&&E.id===a.id,f=E.kind===`scope`&&a.scopeIds.includes(E.id),m=[`rpc-day`,`rpc-day--window`,`rpc-focusable`,r?`rpc-day--today`:``,f?`rpc-day--scope-hit`:``].filter(Boolean).join(` `),h=s===`completed`?`${H(a.purged??0)} purged`:`${H(q(a))} eligible`;return(0,x.jsxs)(`button`,{type:`button`,className:m,"aria-pressed":u,"aria-label":`Jul ${t}: ${a.id}, ${s===`blocked`?`blocked by ${l} active hold${l===1?``:`s`}`:s}, ${h}`,onClick:()=>pe(a.id),children:[o,(0,x.jsxs)(`span`,{className:`rpc-day-pill rpc-day-pill--${s}`,children:[(0,x.jsx)(i,{icon:s===`completed`?p:s===`blocked`?c:d,size:`xsm`,color:`inherit`}),(0,x.jsx)(`span`,{className:`rpc-day-pill-id`,children:a.id}),s===`blocked`&&(0,x.jsxs)(`span`,{className:`rpc-num`,children:[`×`,l]})]}),(0,x.jsx)(`span`,{className:`rpc-day-sub`,children:h})]},a.id)})})]})}),(0,x.jsxs)(`div`,{className:`rpc-detail`,"aria-label":`Selection detail`,children:[Q!==void 0&&(0,x.jsxs)(x.Fragment,{children:[(0,x.jsxs)(`div`,{className:`rpc-detail-head`,children:[(0,x.jsxs)(_,{level:5,accessibilityLevel:3,children:[Q.id,` · Jul `,Q.day]}),(0,x.jsx)(v,{label:Q.kind===`completed`?`completed · ${H(Q.purged??0)} purged`:K(Q,e)===`blocked`?`blocked · ${G(Q,e)} active hold${G(Q,e)===1?``:`s`}`:`clear · ${H(q(Q))} purge-eligible`,variant:Q.kind===`completed`?`neutral`:K(Q,e)===`blocked`?`error`:`success`}),Q.note!==void 0&&(0,x.jsx)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:Q.note})]}),Q.scopeIds.map(t=>{let n=B(t),r=W(t,e);return(0,x.jsxs)(`div`,{className:`rpc-detail-row`,children:[(0,x.jsx)(`span`,{className:`rpc-detail-row-name`,children:n.name}),(0,x.jsxs)(`span`,{className:`rpc-num`,children:[H(n.overdue),` overdue`]}),r.kind===`none`?(0,x.jsx)(v,{label:`no hold`,variant:`neutral`}):(0,x.jsx)(Y,{state:r})]},t)}),Q.kind===`scheduled`&&K(Q,e)===`blocked`&&(0,x.jsx)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:`Unblocks when every hold above is released — approvals live in the exception queue.`})]}),$!==void 0&&(0,x.jsxs)(x.Fragment,{children:[(0,x.jsxs)(`div`,{className:`rpc-detail-head`,children:[(0,x.jsx)(_,{level:5,accessibilityLevel:3,children:$.name}),(0,x.jsx)(v,{label:$.rule,variant:`neutral`}),(0,x.jsx)(Y,{state:W($.id,e)})]}),(0,x.jsxs)(`div`,{className:`rpc-detail-row`,children:[(0,x.jsx)(`span`,{className:`rpc-detail-row-name`,children:`Records governed`}),(0,x.jsx)(`span`,{className:`rpc-num`,children:H($.records)})]}),(0,x.jsxs)(`div`,{className:`rpc-detail-row`,children:[(0,x.jsx)(`span`,{className:`rpc-detail-row-name`,children:`Past retention`}),(0,x.jsx)(`span`,{className:`rpc-num`,children:H($.overdue)})]}),(0,x.jsxs)(`div`,{className:`rpc-detail-row`,children:[(0,x.jsx)(`span`,{className:`rpc-detail-row-name`,children:`Next purge window`}),(0,x.jsx)(`span`,{className:`rpc-num`,children:(()=>{let e=I.find(e=>e.kind===`scheduled`&&e.scopeIds.includes($.id));return e===void 0?`none scheduled`:`${e.id} · Jul ${e.day}`})()})]})]})]})]}),ge=(0,x.jsx)(`div`,{className:`rpc-pane`,"aria-label":`Purge exceptions`,children:(0,x.jsxs)(`div`,{className:`rpc-pane-scroll`,children:[(0,x.jsx)(`div`,{className:`rpc-pane-title`,children:(0,x.jsxs)(h,{gap:2,vAlign:`center`,children:[(0,x.jsx)(r,{type:`label`,size:`sm`,color:`secondary`,children:`Purge exceptions`}),(0,x.jsx)(v,{label:`${R.length} pending`,variant:R.length>0?`warning`:`success`})]})}),R.length===0?(0,x.jsx)(`div`,{className:`rpc-log-row`,children:(0,x.jsx)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:`Queue clear — every pending exception has a decision. Undo from the log below to revisit one.`})}):R.map(e=>{let t=B(e.scopeId),n=V(e.holdId);return(0,x.jsxs)(`div`,{className:`rpc-exc-card`,children:[(0,x.jsxs)(`div`,{className:`rpc-exc-top`,children:[(0,x.jsx)(`span`,{className:`rpc-exc-id`,children:e.id}),(0,x.jsxs)(`span`,{className:`rpc-hold-badge`,children:[(0,x.jsx)(i,{icon:c,size:`xsm`,color:`inherit`}),n.shortRef]}),(0,x.jsxs)(`span`,{className:`rpc-exc-records`,children:[H(e.records),` rec`]})]}),(0,x.jsxs)(r,{type:`body`,size:`sm`,children:[`Release `,(0,x.jsx)(`strong`,{children:t.name}),` from `,n.ref]}),(0,x.jsx)(`span`,{className:`rpc-exc-basis`,children:e.basis}),(0,x.jsxs)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:[e.requestedBy,` · requested `,e.requestedOn]}),(0,x.jsxs)(`div`,{className:`rpc-exc-actions`,children:[(0,x.jsx)(y,{label:`Approve release`,variant:`primary`,size:`md`,icon:(0,x.jsx)(i,{icon:p,size:`sm`}),onClick:()=>X(e.id,`approved`)}),(0,x.jsx)(y,{label:`Deny`,variant:`secondary`,size:`md`,icon:(0,x.jsx)(i,{icon:m,size:`sm`}),onClick:()=>X(e.id,`denied`)})]})]},e.id)}),(0,x.jsx)(`div`,{className:`rpc-pane-title`,children:(0,x.jsxs)(h,{gap:1,vAlign:`center`,children:[(0,x.jsx)(i,{icon:l,size:`sm`,color:`secondary`}),(0,x.jsx)(r,{type:`label`,size:`sm`,color:`secondary`,children:`Decision log`})]})}),n.map((e,t)=>(0,x.jsxs)(`div`,{className:`rpc-log-row`,children:[(0,x.jsx)(`span`,{className:`rpc-log-clock`,children:e.clockLabel}),(0,x.jsxs)(`div`,{className:`rpc-log-body`,children:[(0,x.jsxs)(r,{type:`body`,size:`sm`,children:[(0,x.jsx)(`span`,{className:`rpc-verdict rpc-verdict--${e.verdict}`,children:e.verdict}),` `,`— `,e.summary]}),t===0&&(0,x.jsx)(y,{label:`Undo`,variant:`ghost`,size:`sm`,icon:(0,x.jsx)(i,{icon:f,size:`sm`}),onClick:de})]})]},e.id)),(0,x.jsxs)(`div`,{className:`rpc-log-row`,children:[(0,x.jsx)(`span`,{className:`rpc-log-clock`,children:F.decidedOn}),(0,x.jsx)(`div`,{className:`rpc-log-body`,children:(0,x.jsxs)(r,{type:`body`,size:`sm`,color:`secondary`,children:[(0,x.jsx)(`span`,{className:`rpc-verdict rpc-verdict--denied`,children:`denied`}),` —`,` `,F.id,` (`,F.holdRef,` ·`,` `,F.scopeName,`,`,` `,(0,x.jsx)(`span`,{className:`rpc-num`,children:H(F.records)}),` `,`rec) by `,F.decidedBy,`: `,F.reason]})})]})]})});return(0,x.jsxs)(`div`,{className:S,style:{height:`100dvh`,width:`100%`},children:[(0,x.jsx)(`style`,{children:le}),(0,x.jsx)(ee,{height:`fill`,header:(0,x.jsx)(ne,{hasDivider:!0,children:(0,x.jsx)(`div`,{className:`rpc-header-row`,children:(0,x.jsxs)(h,{gap:3,vAlign:`center`,wrap:`wrap`,children:[(0,x.jsx)(g,{size:`fill`,style:{minWidth:0},children:(0,x.jsxs)(h,{gap:2,vAlign:`center`,children:[(0,x.jsx)(ue,{}),(0,x.jsx)(_,{level:1,maxLines:1,children:`Retainer — Data Retention Policy Center`}),(0,x.jsx)(v,{label:`Nortech Home · FY26`,variant:`neutral`})]})}),(0,x.jsxs)(h,{gap:2,vAlign:`center`,wrap:`wrap`,children:[(0,x.jsx)(v,{label:`${R.length} exception${R.length===1?``:`s`} pending`,variant:R.length>0?`warning`:`success`}),(0,x.jsx)(v,{label:`${z} hold-scope pair${z===1?``:`s`} active`,variant:z>0?`error`:`success`})]})]})})}),content:(0,x.jsx)(te,{padding:0,children:(0,x.jsxs)(`div`,{className:`rpc-content`,children:[(0,x.jsx)(`div`,{"aria-live":`polite`,style:{position:`absolute`,width:1,height:1,margin:-1,padding:0,overflow:`hidden`,clipPath:`inset(50%)`,whiteSpace:`nowrap`},children:O}),(0,x.jsxs)(`div`,{className:`rpc-stats`,role:`status`,"aria-label":`Governance stats`,children:[(0,x.jsxs)(`span`,{className:`rpc-stat`,children:[(0,x.jsx)(i,{icon:s,size:`sm`,color:`secondary`}),(0,x.jsx)(`strong`,{children:H(se)}),` records governed`]}),(0,x.jsxs)(`span`,{className:`rpc-stat`,children:[(0,x.jsx)(i,{icon:d,size:`sm`,color:`secondary`}),(0,x.jsx)(`strong`,{children:H(ce)}),` past retention`]}),(0,x.jsxs)(`span`,{className:`rpc-stat rpc-stat--risk`,children:[(0,x.jsx)(i,{icon:c,size:`sm`,color:`secondary`}),(0,x.jsx)(`strong`,{children:H(A)}),` blocked by holds`]}),(0,x.jsxs)(`span`,{className:`rpc-stat rpc-stat--clear`,children:[(0,x.jsx)(i,{icon:o,size:`sm`,color:`secondary`}),(0,x.jsx)(`strong`,{children:M===void 0?`—`:`Jul ${M.day} · ${M.id}`}),` `,`next clear window`]})]}),(0,x.jsxs)(`div`,{className:`rpc-body`,children:[me,he,ge]})]})})})]})}export{X as default};