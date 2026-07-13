import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-DlKHZgO2.js";import{t as i}from"./Icon-DNqmP2EH.js";import{t as a}from"./circle-dot-9l4kRIhX.js";import{t as o}from"./circle-CVujybKE.js";import{t as s}from"./clock-3-DQHWb0em.js";import{t as c}from"./flag-dtlKeBbB.js";import{t as l}from"./lock-BMNYblgW.js";import{t as u}from"./rotate-ccw-CoL6U6EX.js";import{t as d}from"./shield-alert-CQq3gtNR.js";import{b as f,o as p,v as m}from"./index-CZ0XLKUx.js";import{t as h}from"./Tooltip-XDRm9Z-w.js";import{n as g,t as _}from"./LayoutContent-CCL91W7X.js";import{t as v}from"./LayoutHeader-Cy2mWoMf.js";import{t as y}from"./Heading-BBqhYPTB.js";import{t as b}from"./Button-Cj_m5AlK.js";var x=e(t(),1),S=n(),C=`tpl-implementation-cutover-plan`,w=`light-dark(#C2410C, #FB923C)`,T=`light-dark(#FFFFFF, #26150B)`,E=`light-dark(rgba(194, 65, 12, 0.10), rgba(251, 146, 60, 0.14))`,D=`light-dark(#15803D, #4ADE80)`,O=`light-dark(rgba(21, 128, 61, 0.12), rgba(74, 222, 128, 0.14))`,k=`light-dark(#DC2626, #F87171)`,A=`light-dark(rgba(220, 38, 38, 0.10), rgba(248, 113, 113, 0.14))`,j=`var(--font-family-code, monospace)`,M=1560,N=-210;function P(e){let t=e<0?`−`:`+`,n=Math.abs(e);return`T${t}${String(Math.floor(n/60)).padStart(2,`0`)}:${String(n%60).padStart(2,`0`)}`}function F(e){let t=M+e;return`${t<1440?`Sat`:`Sun`} ${String(Math.floor(t%1440/60)).padStart(2,`0`)}:${String(t%60).padStart(2,`0`)}`}function I(e){return e<60?`${e}m`:`${Math.floor(e/60)}h ${String(e%60).padStart(2,`0`)}m`}var L=[{id:`ph-freeze`,code:`A`,label:`Freeze & comms`},{id:`ph-extract`,code:`B`,label:`Extract`},{id:`ph-load`,code:`C`,label:`Transform & load`},{id:`ph-gate`,code:`D`,label:`Go/No-Go gate`},{id:`ph-switch`,code:`E`,label:`Switch`},{id:`ph-validate`,code:`F`,label:`Validate & hypercare`}],R=[{id:`A1`,phaseId:`ph-freeze`,offset:-360,duration:30,label:`Change freeze in effect — lock ATLAS order entry`,owner:`Elena Voss`,system:`ATLAS`,status:`done`},{id:`A2`,phaseId:`ph-freeze`,offset:-330,duration:15,label:`Maintenance notice live on status page + storefront banner`,owner:`Jordan Blake`,system:`Statuspage`,status:`done`},{id:`A3`,phaseId:`ph-freeze`,offset:-315,duration:15,label:`Bridge open — roster check against the on-call matrix`,owner:`Elena Voss`,system:`Bridge`,status:`done`},{id:`B1`,phaseId:`ph-extract`,offset:-300,duration:45,label:`Final delta export: open orders + customer master`,owner:`Priya Nair`,system:`ATLAS`,status:`done`},{id:`B2`,phaseId:`ph-extract`,offset:-255,duration:30,label:`Checksum manifest — 1,482,905 rows vs control totals`,owner:`Priya Nair`,system:`ATLAS`,status:`done`},{id:`B3`,phaseId:`ph-extract`,offset:-225,duration:45,label:`Transfer encrypted extracts to NovaCore landing bucket`,owner:`Sam Ortiz`,system:`S3`,status:`running`},{id:`C1`,phaseId:`ph-load`,offset:-180,duration:60,label:`Run mapping jobs M-101…M-118 (orders, customers, pricing)`,owner:`Sam Ortiz`,system:`NovaCore ETL`,status:`pending`},{id:`C2`,phaseId:`ph-load`,offset:-120,duration:30,label:`Load sequence: master data → open orders → pricing rules`,owner:`Sam Ortiz`,system:`NovaCore`,status:`pending`},{id:`C3`,phaseId:`ph-load`,offset:-90,duration:30,label:`Reconciliation report RPT-4471 — spot-check 50 orders`,owner:`Priya Nair`,system:`NovaCore`,status:`pending`},{id:`D1`,phaseId:`ph-gate`,offset:-60,duration:15,label:`Go/No-Go review — exec decision recorded in Cutline`,owner:`Elena Voss`,system:`Cutline`,status:`pending`},{id:`E1`,phaseId:`ph-switch`,offset:-45,duration:15,label:`Repoint EDI + storefront APIs to NovaCore endpoints`,owner:`Kofi Mensah`,system:`Boomi`,status:`pending`},{id:`E2`,phaseId:`ph-switch`,offset:-30,duration:20,label:`DNS cutover: orders.meridianfoods.com — 60s TTL swing`,owner:`Kofi Mensah`,system:`Route 53`,status:`pending`},{id:`E3`,phaseId:`ph-switch`,offset:-10,duration:10,label:`Unlock order entry in NovaCore — go-live`,owner:`Elena Voss`,system:`NovaCore`,status:`pending`},{id:`F1`,phaseId:`ph-validate`,offset:0,duration:45,label:`Smoke suite S-01…S-12: order create, price, ship, invoice`,owner:`Mei Tanaka`,system:`NovaCore`,status:`pending`},{id:`F2`,phaseId:`ph-validate`,offset:45,duration:30,label:`First live EDI 850 from Hartwell Grocers end-to-end`,owner:`Kofi Mensah`,system:`Boomi`,status:`pending`},{id:`F3`,phaseId:`ph-validate`,offset:75,duration:45,label:`Hypercare handoff: on-call rotation + triage channel live`,owner:`Elena Voss`,system:`PagerDuty`,status:`pending`},{id:`F4`,phaseId:`ph-validate`,offset:120,duration:240,label:`Hypercare monitoring — watch order intake, allocation runs, invoice posting, and integration error queues on 15-minute checkpoints until window close`,owner:`Mei Tanaka`,system:`NovaCore`,status:`pending`}],z=new Map(R.map(e=>[e.id,e])),B=R.find(e=>e.offset>N)?.id??null,V=-60,H=[{id:`g-recon`,label:`Reconciliation variance ≤ 0.5% vs control totals`,evidence:`RPT-4471`,required:!0,auto:!1},{id:`g-tasks`,label:`All pre-gate runbook tasks complete (A1–C3)`,evidence:`Runbook`,required:!0,auto:!0},{id:`g-rollback`,label:`Rollback rehearsal RB-DRY-3 signed off ≤ 7 days old`,evidence:`CHG-20114`,required:!0,auto:!1},{id:`g-exec`,label:`Exec approver on bridge (COO — R. Calloway)`,evidence:`Bridge roster`,required:!0,auto:!1},{id:`g-sev`,label:`No open Sev-1/Sev-2 against ATLAS or NovaCore`,evidence:`PagerDuty`,required:!0,auto:!1},{id:`g-vendor`,label:`NovaCore vendor TAM on standby`,evidence:`Optional`,required:!1,auto:!1}],U={"g-rollback":!0,"g-exec":!0},W=[{id:`rb-1`,code:`RB-1`,label:`Restore ATLAS snapshot + lift change freeze`,procedure:`Snapshot SNAP-0718-1955 restores in ~40m; comms template R1.`,armedAt:-360,coverFrom:-360},{id:`rb-2`,code:`RB-2`,label:`Purge landing bucket + re-extract clean deltas`,procedure:`Drops transferred extracts; re-run B1–B2 against ATLAS.`,armedAt:-255,coverFrom:-255},{id:`rb-3`,code:`RB-3`,label:`DNS swing-back (60s TTL) + EDI repoint to ATLAS`,procedure:`Reverses E1–E2; ATLAS order entry unlocks behind it.`,armedAt:-30,coverFrom:-30}],G=new Map(W.map(e=>[e.id,e])),K=45;function q(e,t){return t[e.id]??e.status===`done`}function J(e,t,n){let r=q(e,t);return n!=null&&e.offset>=n.coverFrom?r?`reverted`:`skipped`:r?`done`:e.status===`running`?`running`:`pending`}function Y(e,t){return R.filter(e=>e.offset<V).every(n=>J(n,e,t)===`done`)}function X(e,t,n,r){return e.auto?Y(n,r):t[e.id]??!1}function Z(e,t,n){let r=H.filter(e=>e.required),i=r.filter(r=>X(r,e,t,n)).length;return n==null?i===r.length?{kind:`go`,passed:i,requiredTotal:r.length,headline:`GO`,detail:`All five required gate criteria satisfied — cleared to switch.`}:{kind:`pending`,passed:i,requiredTotal:r.length,headline:`PENDING ${i}/${r.length}`,detail:`Gate closes at T−01:00 (Sun 01:00) — outstanding criteria below.`}:{kind:`nogo`,passed:i,requiredTotal:r.length,headline:`NO-GO`,detail:`Rollback ${n.code} tripped — ${n.label}`}}var ee=`
.${C} {
  font-family: var(--font-family-sans);
}
.${C} button {
  font: inherit;
  color: inherit;
}
.${C} .icp-focusable:focus-visible {
  outline: 2px solid ${w};
  outline-offset: -2px;
}
.${C} .icp-live {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
/* --- header: 56px brand row ---------------------------------------------- */
.${C} .icp-header-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-2) var(--spacing-3);
  min-height: 56px;
  box-sizing: border-box;
  padding: var(--spacing-2) var(--spacing-4);
}
.${C} .icp-mark {
  display: inline-flex;
  flex-shrink: 0;
  color: ${w};
}
.${C} .icp-title-cluster {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
  min-width: 0;
  flex: 1 1 300px;
}
.${C} .icp-chips {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}
.${C} .icp-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${C} .icp-chip strong {
  color: var(--color-text-primary);
  font-weight: 700;
}
.${C} .icp-chip--go {
  border-color: ${D};
  background: ${O};
  color: ${D};
}
.${C} .icp-chip--nogo {
  border-color: ${k};
  background: ${A};
  color: ${k};
}
.${C} .icp-chip--pending {
  border-color: ${w};
  background: ${E};
  color: ${w};
}
/* --- body: runbook + 360px decision aside -------------------------------- */
.${C} .icp-body {
  height: 100%;
  min-height: 0;
  display: flex;
}
.${C} .icp-runbook {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
}
/* Sticky 36px phase headers: code chip · label · span · task count. */
.${C} .icp-phase {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  height: 36px;
  box-sizing: border-box;
  padding: 0 var(--spacing-4);
  background: var(--color-background-muted);
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.${C} .icp-phase-code {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  color: var(--color-text-primary);
  font-size: 10px;
}
.${C} .icp-phase-span {
  font-family: ${j};
  font-variant-numeric: tabular-nums;
  text-transform: none;
  letter-spacing: 0;
}
.${C} .icp-phase-fill {
  flex: 1;
}
/* 56px task rows — real toggle <button>s. Grid: T 88 · glyph 24 ·
   label/meta flex · duration 56 · status chip 92. */
.${C} .icp-task {
  display: grid;
  grid-template-columns: 88px 24px minmax(0, 1fr) 56px 92px;
  align-items: center;
  column-gap: var(--spacing-3);
  width: 100%;
  box-sizing: border-box;
  height: 56px;
  padding: 0 var(--spacing-4);
  border: 0;
  border-bottom: var(--border-width) solid var(--color-border);
  background: transparent;
  text-align: left;
  cursor: pointer;
}
@media (hover: hover) {
  .${C} .icp-task:hover:not(:disabled) {
    background: var(--color-background-muted);
  }
}
.${C} .icp-task:disabled {
  cursor: not-allowed;
}
.${C} .icp-tcol {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.${C} .icp-tlabel {
  font-family: ${j};
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  white-space: nowrap;
}
.${C} .icp-twall {
  font-family: ${j};
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${C} .icp-glyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.${C} .icp-glyph--done { color: ${D}; }
.${C} .icp-glyph--running { color: ${w}; }
.${C} .icp-glyph--pending { color: var(--color-text-secondary); }
.${C} .icp-glyph--skipped { color: var(--color-text-secondary); }
.${C} .icp-glyph--reverted { color: ${k}; }
.${C} .icp-task-main {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.${C} .icp-task-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${C} .icp-task-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* Rolled-back restyle: never color alone — the status chip names it too. */
.${C} .icp-task--cut .icp-task-label {
  text-decoration: line-through;
  color: var(--color-text-secondary);
}
.${C} .icp-task--cut .icp-tlabel {
  color: var(--color-text-secondary);
}
.${C} .icp-duration {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  text-align: right;
  white-space: nowrap;
}
/* 22px status chips. */
.${C} .icp-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  box-sizing: border-box;
  padding: 0 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  justify-self: end;
  color: var(--color-text-secondary);
}
.${C} .icp-status--done {
  border-color: ${D};
  background: ${O};
  color: ${D};
}
.${C} .icp-status--running {
  border-color: ${w};
  background: ${E};
  color: ${w};
}
.${C} .icp-status--skipped {
  background: var(--color-background-muted);
}
.${C} .icp-status--reverted {
  border-color: ${k};
  background: ${A};
  color: ${k};
}
/* The 2px NOW rule + solid chip, pinned between runbook rows. */
.${C} .icp-now {
  position: relative;
  height: 2px;
  background: ${w};
}
.${C} .icp-now-chip {
  position: absolute;
  right: var(--spacing-4);
  top: -9px;
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: ${w};
  color: ${T};
  font-family: ${j};
  font-size: 10px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
/* --- decision aside ------------------------------------------------------- */
.${C} .icp-aside {
  width: 360px;
  flex-shrink: 0;
  box-sizing: border-box;
  border-left: var(--border-width) solid var(--color-border);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.${C} .icp-panel {
  padding: var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${C} .icp-rail {
  padding: var(--spacing-4);
}
.${C} .icp-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 var(--spacing-2);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.${C} .icp-section-title .icp-mono {
  font-family: ${j};
  letter-spacing: 0;
  text-transform: none;
}
/* Verdict banner: min 64px, restated by the header chip. */
.${C} .icp-verdict {
  box-sizing: border-box;
  min-height: 64px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  padding: var(--spacing-2) var(--spacing-3);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  margin-bottom: var(--spacing-3);
}
.${C} .icp-verdict-head {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.03em;
  font-variant-numeric: tabular-nums;
}
.${C} .icp-verdict-detail {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.${C} .icp-verdict--go {
  border-color: ${D};
  background: ${O};
}
.${C} .icp-verdict--go .icp-verdict-head { color: ${D}; }
.${C} .icp-verdict--nogo {
  border-color: ${k};
  background: ${A};
}
.${C} .icp-verdict--nogo .icp-verdict-head { color: ${k}; }
.${C} .icp-verdict--pending {
  border-color: ${w};
  background: ${E};
}
.${C} .icp-verdict--pending .icp-verdict-head { color: ${w}; }
/* 44px gate rows: manual rows are toggle buttons; the auto row is inert. */
.${C} .icp-gate-row {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: center;
  column-gap: var(--spacing-2);
  width: 100%;
  box-sizing: border-box;
  min-height: 44px;
  padding: var(--spacing-1) 0;
  border: 0;
  border-bottom: var(--border-width) solid var(--color-border);
  background: transparent;
  text-align: left;
}
.${C} button.icp-gate-row {
  cursor: pointer;
}
@media (hover: hover) {
  .${C} button.icp-gate-row:hover {
    background: var(--color-background-muted);
  }
}
.${C} .icp-gate-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
}
.${C} .icp-gate-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
}
.${C} .icp-gate-evidence {
  font-family: ${j};
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
/* Rollback checkpoint cards: min 64px; tripped card restyles red. */
.${C} .icp-cp {
  box-sizing: border-box;
  min-height: 64px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  padding: var(--spacing-2) var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  margin-bottom: var(--spacing-2);
}
.${C} .icp-cp--tripped {
  border-color: ${k};
  background: ${A};
}
.${C} .icp-cp-top {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}
.${C} .icp-cp-code {
  font-family: ${j};
  font-size: 11px;
  font-weight: 700;
  color: ${w};
  border: var(--border-width) solid ${w};
  border-radius: 4px;
  padding: 0 5px;
}
.${C} .icp-cp--tripped .icp-cp-code {
  color: ${k};
  border-color: ${k};
}
.${C} .icp-cp-label {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}
.${C} .icp-cp-proc {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.${C} .icp-cp-foot {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}
.${C} .icp-cp-meta {
  flex: 1;
  font-family: ${j};
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${C} .icp-cp-tripped-note {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  color: ${k};
}
/* Density-grid contract: trip / stand-down are the 40px action path. */
.${C} .icp-cp-foot button {
  min-height: 40px;
}
/* Point of no return: dashed, inert. */
.${C} .icp-ponr {
  border: var(--border-width) dashed var(--color-border);
  border-radius: var(--radius-container, 8px);
  padding: var(--spacing-2) var(--spacing-3);
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  font-size: 12px;
  color: var(--color-text-secondary);
}
.${C} .icp-ponr strong {
  color: var(--color-text-primary);
  font-family: ${j};
  font-variant-numeric: tabular-nums;
}
/* --- responsive subtraction ----------------------------------------------- */
@media (max-width: 900px) {
  .${C} .icp-aside {
    width: 320px;
  }
  .${C} .icp-task {
    grid-template-columns: 88px 24px minmax(0, 1fr) 92px;
  }
  .${C} .icp-duration {
    display: none;
  }
  .${C} .icp-twall {
    display: none;
  }
}
@media (max-width: 680px) {
  .${C} .icp-body {
    flex-direction: column;
    overflow-y: auto;
  }
  .${C} .icp-runbook {
    flex: none;
    overflow-y: visible;
  }
  .${C} .icp-phase {
    position: static;
  }
  .${C} .icp-aside {
    width: auto;
    border-left: 0;
    border-top: var(--border-width) solid var(--color-border);
  }
  .${C} .icp-task {
    grid-template-columns: 64px 24px minmax(0, 1fr) 92px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .${C} * {
    transition: none !important;
  }
}
`;function te(){return(0,S.jsx)(`span`,{className:`icp-mark`,"aria-hidden":!0,children:(0,S.jsxs)(`svg`,{width:`22`,height:`22`,viewBox:`0 0 24 24`,fill:`none`,children:[(0,S.jsx)(`path`,{d:`M2 15h20`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeDasharray:`3 3`}),(0,S.jsx)(`path`,{d:`M12 6l4.5 6h-9L12 6z`,fill:`currentColor`})]})})}var Q={done:{label:`Done`,icon:f},running:{label:`Running`,icon:a},pending:{label:`Pending`,icon:o},skipped:{label:`Skipped`,icon:m},reverted:{label:`Reverted`,icon:u}};function ne({task:e,status:t,onToggle:n}){let r=t===`skipped`||t===`reverted`,a=Q[t];return(0,S.jsxs)(`button`,{type:`button`,className:`icp-task icp-focusable${r?` icp-task--cut`:``}`,disabled:r,"aria-pressed":t===`done`,"aria-label":`${e.id} ${e.label} — ${P(e.offset)} (${F(e.offset)}), ${a.label}${r?` by rollback`:``}`,onClick:()=>n(e.id),children:[(0,S.jsxs)(`span`,{className:`icp-tcol`,children:[(0,S.jsx)(`span`,{className:`icp-tlabel`,children:P(e.offset)}),(0,S.jsx)(`span`,{className:`icp-twall`,children:F(e.offset)})]}),(0,S.jsx)(`span`,{className:`icp-glyph icp-glyph--${t}`,"aria-hidden":!0,children:(0,S.jsx)(i,{icon:a.icon,size:`sm`,color:`inherit`})}),(0,S.jsxs)(`span`,{className:`icp-task-main`,children:[(0,S.jsx)(`span`,{className:`icp-task-label`,children:e.label}),(0,S.jsxs)(`span`,{className:`icp-task-meta`,children:[e.id,` · `,e.owner,` · `,e.system]})]}),(0,S.jsx)(`span`,{className:`icp-duration`,children:I(e.duration)}),(0,S.jsx)(`span`,{className:`icp-status icp-status--${t}`,children:a.label})]})}function re(){return(0,S.jsx)(`div`,{className:`icp-now`,role:`presentation`,children:(0,S.jsxs)(`span`,{className:`icp-now-chip`,children:[`NOW · `,P(N),` · `,F(N)]})})}function ie({item:e,satisfied:t,outstandingPreGate:n,onToggle:r}){let a=(0,S.jsx)(`span`,{className:`icp-glyph ${t?`icp-glyph--done`:`icp-glyph--pending`}`,"aria-hidden":!0,children:(0,S.jsx)(i,{icon:t?f:o,size:`sm`,color:`inherit`})}),s=(0,S.jsxs)(`span`,{children:[(0,S.jsxs)(`span`,{className:`icp-gate-label`,children:[e.label,!e.required&&` (optional)`]}),e.auto&&(0,S.jsxs)(`span`,{className:`icp-gate-sub`,children:[` `,`— auto:`,` `,t?`all pre-gate tasks complete`:`${n} pre-gate task${n===1?``:`s`} outstanding`]})]});return e.auto?(0,S.jsxs)(`div`,{className:`icp-gate-row`,children:[a,s,(0,S.jsx)(h,{content:`Derived from runbook rows A1–C3 — check them off in the runbook to satisfy this criterion.`,children:(0,S.jsxs)(`span`,{className:`icp-gate-evidence`,children:[(0,S.jsx)(i,{icon:l,size:`sm`,color:`secondary`}),` `,e.evidence]})})]}):(0,S.jsxs)(`button`,{type:`button`,className:`icp-gate-row icp-focusable`,"aria-pressed":t,"aria-label":`${e.label} — ${t?`satisfied`:`not satisfied`}`,onClick:()=>r(e.id),children:[a,s,(0,S.jsx)(`span`,{className:`icp-gate-evidence`,children:e.evidence})]})}function ae({checkpoint:e,isTripped:t,isArmed:n,coveredCount:r,onTrip:a,onStandDown:o}){return(0,S.jsxs)(`div`,{className:`icp-cp${t?` icp-cp--tripped`:``}`,children:[(0,S.jsxs)(`div`,{className:`icp-cp-top`,children:[(0,S.jsx)(`span`,{className:`icp-cp-code`,children:e.code}),(0,S.jsx)(`span`,{className:`icp-cp-label`,children:e.label})]}),(0,S.jsx)(`span`,{className:`icp-cp-proc`,children:e.procedure}),(0,S.jsxs)(`div`,{className:`icp-cp-foot`,children:[(0,S.jsx)(`span`,{className:`icp-cp-meta`,children:n?`armed ${P(e.armedAt)} · covers ${P(e.coverFrom)} → · ${r} tasks`:`arms at ${P(e.armedAt)} — not yet available`}),t?(0,S.jsxs)(S.Fragment,{children:[(0,S.jsxs)(`span`,{className:`icp-cp-tripped-note`,children:[(0,S.jsx)(i,{icon:d,size:`sm`,color:`inherit`}),`Tripped`]}),(0,S.jsx)(b,{label:`Stand down`,variant:`secondary`,size:`sm`,onClick:o})]}):(0,S.jsx)(b,{label:`Trip checkpoint`,variant:`ghost`,size:`sm`,isDisabled:!n,onClick:()=>a(e.id)})]})]})}function $(){let[e,t]=(0,x.useState)({}),[n,a]=(0,x.useState)(U),[o,l]=(0,x.useState)(null),[u,h]=(0,x.useState)(``),b=o==null?null:G.get(o)??null,w=(0,x.useMemo)(()=>{let t=new Map;for(let n of R)t.set(n.id,J(n,e,b));return t},[e,b]),T=R.filter(e=>w.get(e.id)===`done`).length,E=R.filter(e=>{let t=w.get(e.id);return t!==`skipped`&&t!==`reverted`}).length,D=R.filter(e=>e.offset<V&&w.get(e.id)!==`done`).length,O=Z(n,e,b),k=r=>{let i=z.get(r);if(i==null||w.get(r)===`skipped`)return;let a=!q(i,e),o={...e,[r]:a};t(o);let s=Y(o,b),c=Z(n,o,b);h(`${i.id} marked ${a?`done`:`not done`}.${i.offset<V?` Pre-gate gate criterion ${s?`satisfied`:`not satisfied`}; verdict ${c.headline}.`:``}`)},A=t=>{let r=H.find(e=>e.id===t);if(r==null||r.auto)return;let i={...n,[t]:!(n[t]??!1)};a(i);let o=Z(i,e,b);h(`${r.label} ${i[t]?`checked`:`unchecked`} — verdict ${o.headline}.`)},j=e=>{let t=G.get(e);if(t==null)return;l(e);let n=R.filter(e=>e.offset>=t.coverFrom).length;h(`Rollback ${t.code} tripped — ${n} tasks rolled back, verdict NO-GO.`)},M=()=>{b!=null&&h(`Rollback ${b.code} stood down — runbook restored, verdict ${Z(n,e,null).headline}.`),l(null)},I=O.kind===`go`?`icp-chip--go`:O.kind===`nogo`?`icp-chip--nogo`:`icp-chip--pending`,Q=(0,S.jsx)(v,{hasDivider:!0,padding:0,children:(0,S.jsxs)(`div`,{className:`icp-header-row`,children:[(0,S.jsxs)(`div`,{className:`icp-title-cluster`,children:[(0,S.jsx)(te,{}),(0,S.jsx)(y,{level:1,children:`Cutline · Meridian Foods ERP cutover`}),(0,S.jsx)(r,{type:`supporting`,color:`secondary`,children:`Runbook rev C · window Sat Jul 18 20:00 → Sun 08:00`})]}),(0,S.jsxs)(`div`,{className:`icp-chips`,children:[(0,S.jsxs)(`span`,{className:`icp-chip ${I}`,children:[(0,S.jsx)(i,{icon:c,size:`sm`,color:`inherit`}),`Gate `,(0,S.jsx)(`strong`,{children:O.headline})]}),(0,S.jsxs)(`span`,{className:`icp-chip`,children:[`Tasks`,` `,(0,S.jsxs)(`strong`,{children:[T,`/`,E]}),` `,`done`]}),(0,S.jsxs)(`span`,{className:`icp-chip`,children:[(0,S.jsx)(i,{icon:s,size:`sm`,color:`inherit`}),`T-0 Sun 02:00 · now `,(0,S.jsx)(`strong`,{children:P(N)})]})]})]})}),$=(0,S.jsx)(_,{padding:0,children:(0,S.jsxs)(`div`,{className:`icp-body`,children:[(0,S.jsx)(`div`,{className:`icp-runbook`,role:`list`,"aria-label":`Cutover runbook`,children:L.map(e=>{let t=R.filter(t=>t.phaseId===e.id),n=t[0],r=t[t.length-1];return(0,S.jsxs)(`div`,{role:`presentation`,children:[(0,S.jsxs)(`div`,{className:`icp-phase`,children:[(0,S.jsx)(`span`,{className:`icp-phase-code`,children:e.code}),e.label,(0,S.jsxs)(`span`,{className:`icp-phase-span`,children:[P(n.offset),` → `,P(r.offset)]}),(0,S.jsx)(`span`,{className:`icp-phase-fill`}),t.length,` task`,t.length===1?``:`s`]}),t.map(e=>(0,S.jsxs)(`div`,{role:`listitem`,children:[e.id===B&&(0,S.jsx)(re,{}),(0,S.jsx)(ne,{task:e,status:w.get(e.id)??`pending`,onToggle:k})]},e.id))]},e.id)})}),(0,S.jsxs)(`aside`,{className:`icp-aside`,"aria-label":`Go/No-Go gate and rollback rail`,children:[(0,S.jsxs)(`section`,{className:`icp-panel`,"aria-label":`Go/No-Go gate`,children:[(0,S.jsxs)(`h2`,{className:`icp-section-title`,children:[(0,S.jsx)(i,{icon:c,size:`sm`,color:`inherit`}),`Go / No-Go gate`,(0,S.jsxs)(`span`,{className:`icp-mono`,children:[P(V),` · `,F(V)]})]}),(0,S.jsxs)(`div`,{className:`icp-verdict icp-verdict--${O.kind}`,children:[(0,S.jsxs)(`span`,{className:`icp-verdict-head`,children:[(0,S.jsx)(i,{icon:O.kind===`go`?f:O.kind===`nogo`?m:c,size:`sm`,color:`inherit`}),O.headline]}),(0,S.jsx)(`span`,{className:`icp-verdict-detail`,children:O.detail})]}),H.map(t=>(0,S.jsx)(ie,{item:t,satisfied:X(t,n,e,b),outstandingPreGate:D,onToggle:A},t.id))]}),(0,S.jsxs)(`section`,{className:`icp-rail`,"aria-label":`Rollback checkpoints`,children:[(0,S.jsxs)(`h2`,{className:`icp-section-title`,children:[(0,S.jsx)(i,{icon:d,size:`sm`,color:`inherit`}),`Rollback checkpoints`]}),W.map(e=>(0,S.jsx)(ae,{checkpoint:e,isTripped:e.id===o,isArmed:e.armedAt<=N,coveredCount:R.filter(t=>t.offset>=e.coverFrom).length,onTrip:j,onStandDown:M},e.id)),(0,S.jsxs)(`div`,{className:`icp-ponr`,children:[(0,S.jsx)(i,{icon:p,size:`sm`,color:`secondary`}),(0,S.jsxs)(`span`,{children:[(0,S.jsxs)(`strong`,{children:[`Point of no return — `,P(K)]}),` · `,`once the first live EDI 850 posts in NovaCore (F2), swing-back is no longer clean; recovery becomes forward-fix only.`]})]})]})]})]})});return(0,S.jsxs)(`div`,{className:C,style:{height:`100dvh`,width:`100%`},children:[(0,S.jsx)(`style`,{children:ee}),(0,S.jsx)(`div`,{className:`icp-live`,"aria-live":`polite`,children:u}),(0,S.jsx)(g,{height:`fill`,header:Q,content:$})]})}export{$ as default};