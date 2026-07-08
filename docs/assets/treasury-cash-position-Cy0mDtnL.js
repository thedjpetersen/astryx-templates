import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./activity-B3TDuTjP.js";import{t as i}from"./arrow-right-qErICciv.js";import{t as a}from"./clock-3-T7m7ogV2.js";import{t as o}from"./list-checks-BvUtZmcB.js";import{t as s}from"./rotate-ccw-Dt5cZFDX.js";import{b as c,d as l,o as u}from"./index-Do4FOL-W.js";import{n as d,t as f}from"./LayoutContent-CCL91W7X.js";import{t as p}from"./LayoutHeader-Cy2mWoMf.js";var m=e(t(),1),h=n(),g=`Floatdesk`,_=[{id:`item-01`,title:`Treasury priority packet`,owner:`Theo Grant`,state:`risk`,progress:69,metric:`5 blockers`,due:`Today 2:00 PM`,detail:`Needs owner confirmation, evidence refresh, and a final cash check before the handoff can leave review.`,points:[22,34,31,48,52,63]},{id:`item-02`,title:`Floatdesk exception sweep`,owner:`Ana Ito`,state:`review`,progress:80,metric:`9 queued`,due:`Tomorrow 10:30 AM`,detail:`Combines fresh queue movement with stale exceptions so the detail pane exposes drift instead of hiding it in aggregate totals.`,points:[18,28,44,46,58,70]},{id:`item-03`,title:`Cash readiness lane`,owner:`Caleb Moss`,state:`ready`,progress:96,metric:`78% ready`,due:`Fri 4:00 PM`,detail:`All required fields reconcile; remaining work is sequencing, stakeholder acknowledgement, and export packaging.`,points:[40,52,56,67,73,86]},{id:`item-04`,title:`Floatdesk owner follow-up`,owner:`Eli Stone`,state:`risk`,progress:73,metric:`5 handoffs`,due:`Mon 9:15 AM`,detail:`Long-label stress case: cross-functional ownership remains visible while the row keeps actions and metrics inside fixed hit zones.`,points:[16,21,32,48,51,60]},{id:`item-05`,title:`Treasury signed-off path`,owner:`Jon Bell`,state:`ready`,progress:100,metric:`19 artifacts`,due:`Next Tue`,detail:`Serves as the stable control row: derived counts, timeline marks, and the detail chart should not move when filters change.`,points:[44,49,61,63,78,91]}],v=[{label:`Intake`,count:13,tone:`neutral`},{label:`Review`,count:9,tone:`review`},{label:`Blocked`,count:5,tone:`risk`},{label:`Ready`,count:5,tone:`ready`}],y=[{id:`all`,label:`All`},{id:`risk`,label:`At risk`},{id:`review`,label:`Review`},{id:`ready`,label:`Ready`}],b={risk:`At risk`,review:`In review`,ready:`Ready`},x={risk:`review`,review:`ready`,ready:`ready`},S=`
.tpl-treasury-cash-position {
  --template-accent: light-dark(#0E7490, #67E8F9);
  --template-accent-muted: light-dark(color-mix(in srgb, #0E7490 12%, white), color-mix(in srgb, #67E8F9 18%, #111));
  color: var(--color-text-primary);
  font-family: var(--font-family-sans, system-ui, sans-serif);
}
.tpl-treasury-cash-position.topbar {
  align-items: center;
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  gap: var(--spacing-3);
  justify-content: space-between;
  min-height: 56px;
  padding: var(--spacing-2) var(--spacing-4);
}
.tpl-treasury-cash-position .titleCluster {
  align-items: center;
  display: flex;
  gap: var(--spacing-3);
  min-width: 0;
}
.tpl-treasury-cash-position .mark {
  align-items: center;
  background: var(--template-accent);
  border-radius: 8px;
  color: var(--color-on-accent, #fff);
  display: inline-flex;
  flex: none;
  height: 36px;
  justify-content: center;
  width: 36px;
}
.tpl-treasury-cash-position h1,
.tpl-treasury-cash-position h2,
.tpl-treasury-cash-position h3,
.tpl-treasury-cash-position p {
  margin: 0;
}
.tpl-treasury-cash-position h1 {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tpl-treasury-cash-position .eyebrow {
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.3;
}
.tpl-treasury-cash-position.workspace {
  background: var(--color-background-body);
  display: grid;
  gap: var(--spacing-3);
  grid-template-columns: 264px minmax(0, 1fr) 320px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  padding: var(--spacing-3);
}
.tpl-treasury-cash-position .panel,
.tpl-treasury-cash-position .metricCard,
.tpl-treasury-cash-position .rowButton,
.tpl-treasury-cash-position .detailBlock {
  background: var(--color-background-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
}
.tpl-treasury-cash-position .panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
.tpl-treasury-cash-position .panelHeader {
  align-items: center;
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  gap: var(--spacing-2);
  justify-content: space-between;
  min-height: 44px;
  padding: var(--spacing-3);
}
.tpl-treasury-cash-position .panelTitle {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0;
}
.tpl-treasury-cash-position .railBody,
.tpl-treasury-cash-position .queueBody,
.tpl-treasury-cash-position .detailBody {
  display: grid;
  gap: var(--spacing-3);
  min-height: 0;
  overflow: auto;
  padding: var(--spacing-3);
}
.tpl-treasury-cash-position .metricGrid {
  display: grid;
  gap: var(--spacing-2);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.tpl-treasury-cash-position .metricCard {
  display: grid;
  gap: 2px;
  padding: var(--spacing-3);
}
.tpl-treasury-cash-position .metricValue {
  font-size: 22px;
  font-variant-numeric: tabular-nums;
  font-weight: 750;
  line-height: 1;
}
.tpl-treasury-cash-position .metricLabel {
  color: var(--color-text-secondary);
  font-size: 11px;
  line-height: 1.3;
}
.tpl-treasury-cash-position .filterGrid {
  display: grid;
  gap: var(--spacing-2);
}
.tpl-treasury-cash-position button {
  font: inherit;
}
.tpl-treasury-cash-position .filterButton,
.tpl-treasury-cash-position .actionButton,
.tpl-treasury-cash-position .ghostButton {
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  gap: var(--spacing-2);
  min-height: 40px;
}
.tpl-treasury-cash-position .filterButton {
  background: transparent;
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-primary);
  justify-content: space-between;
  padding: 0 var(--spacing-3);
  text-align: left;
}
.tpl-treasury-cash-position .filterButton[aria-pressed="true"] {
  background: var(--template-accent-muted);
  border-color: var(--template-accent);
}
.tpl-treasury-cash-position .actionButton {
  background: var(--template-accent);
  border: 0;
  color: var(--color-on-accent, #fff);
  justify-content: center;
  padding: 0 var(--spacing-3);
}
.tpl-treasury-cash-position .ghostButton {
  background: transparent;
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-primary);
  justify-content: center;
  padding: 0 var(--spacing-3);
}
.tpl-treasury-cash-position .stageList,
.tpl-treasury-cash-position .rowList,
.tpl-treasury-cash-position .timeline {
  display: grid;
  gap: var(--spacing-2);
  list-style: none;
  margin: 0;
  padding: 0;
}
.tpl-treasury-cash-position .stageItem {
  align-items: center;
  display: grid;
  gap: var(--spacing-2);
  grid-template-columns: minmax(0, 1fr) auto;
}
.tpl-treasury-cash-position .stageTrack {
  background: var(--color-background-muted);
  border-radius: 999px;
  height: 7px;
  overflow: hidden;
}
.tpl-treasury-cash-position .stageFill {
  background: var(--template-accent);
  height: 100%;
}
.tpl-treasury-cash-position .rowButton {
  align-items: center;
  color: inherit;
  cursor: pointer;
  display: grid;
  gap: var(--spacing-3);
  grid-template-columns: 40px minmax(0, 1fr) auto;
  min-height: 64px;
  padding: var(--spacing-2) var(--spacing-3);
  text-align: left;
  width: 100%;
}
.tpl-treasury-cash-position .rowButton[aria-pressed="true"] {
  border-color: var(--template-accent);
  box-shadow: inset 3px 0 0 var(--template-accent);
}
.tpl-treasury-cash-position .rowGlyph {
  align-items: center;
  background: var(--color-background-muted);
  border-radius: 8px;
  display: inline-flex;
  height: 40px;
  justify-content: center;
  width: 40px;
}
.tpl-treasury-cash-position .rowMain,
.tpl-treasury-cash-position .detailCopy {
  display: grid;
  gap: 3px;
  min-width: 0;
}
.tpl-treasury-cash-position .rowTitle {
  font-size: 14px;
  font-weight: 650;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tpl-treasury-cash-position .rowMeta {
  color: var(--color-text-secondary);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tpl-treasury-cash-position .statePill {
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-secondary);
  font-size: 11px;
  line-height: 1;
  padding: 5px 8px;
  white-space: nowrap;
}
.tpl-treasury-cash-position .progressTrack {
  background: var(--color-background-muted);
  border-radius: 999px;
  height: 8px;
  overflow: hidden;
}
.tpl-treasury-cash-position .progressFill {
  background: var(--template-accent);
  height: 100%;
}
.tpl-treasury-cash-position .detailBlock {
  display: grid;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
}
.tpl-treasury-cash-position .detailTitle {
  font-size: 18px;
  font-weight: 750;
  letter-spacing: 0;
}
.tpl-treasury-cash-position .chart {
  background: var(--color-background-muted);
  border-radius: 8px;
  height: 118px;
  overflow: hidden;
  width: 100%;
}
.tpl-treasury-cash-position .timeline li {
  border-left: 2px solid var(--color-border);
  display: grid;
  gap: 2px;
  padding: 0 0 var(--spacing-2) var(--spacing-3);
}
.tpl-treasury-cash-position .timeline strong {
  font-size: 12px;
}
.tpl-treasury-cash-position .timeline span {
  color: var(--color-text-secondary);
  font-size: 12px;
}
.tpl-treasury-cash-position .topActions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}
@media (max-width: 980px) {
  .tpl-treasury-cash-position.workspace {
    grid-template-columns: 240px minmax(0, 1fr);
    overflow: auto;
  }
  .tpl-treasury-cash-position .detailPanel {
    grid-column: 1 / -1;
    min-height: 420px;
  }
}
@media (max-width: 700px) {
  .tpl-treasury-cash-position.topbar {
    align-items: flex-start;
    flex-direction: column;
  }
  .tpl-treasury-cash-position.workspace {
    grid-template-columns: minmax(0, 1fr);
  }
  .tpl-treasury-cash-position .rowButton {
    grid-template-columns: 36px minmax(0, 1fr);
  }
  .tpl-treasury-cash-position .statePill {
    grid-column: 2;
    justify-self: start;
  }
}
`;function C(e,t){return e.filter(e=>e.state===t).length}function w(e){return e===`risk`?(0,h.jsx)(u,{size:18}):e===`ready`?(0,h.jsx)(c,{size:18}):(0,h.jsx)(a,{size:18})}function T(e){return String(Math.min(100,e.count*7))+`%`}function E(){let[e,t]=(0,m.useState)(_),[n,a]=(0,m.useState)(`all`),[c,u]=(0,m.useState)(_[0].id),E=e.find(e=>e.id===c)??e[0],D=n===`all`?e:e.filter(e=>e.state===n),O=Math.round(e.reduce((e,t)=>e+t.progress,0)/e.length),k=C(e,`risk`),A=C(e,`ready`);function j(){t(e=>e.map(e=>e.id===E.id?{...e,progress:Math.min(100,e.progress+14),state:x[e.state],metric:e.state===`ready`?e.metric:`advanced `+String(e.progress+14)+`%`}:e))}return(0,h.jsxs)(d,{height:`fill`,children:[(0,h.jsx)(`style`,{children:S}),(0,h.jsx)(p,{children:(0,h.jsxs)(`div`,{className:`tpl-treasury-cash-position topbar`,children:[(0,h.jsxs)(`div`,{className:`titleCluster`,children:[(0,h.jsx)(`span`,{className:`mark`,"aria-hidden":`true`,children:(0,h.jsx)(r,{size:20})}),(0,h.jsxs)(`div`,{style:{minWidth:0},children:[(0,h.jsxs)(`p`,{className:`eyebrow`,children:[g,` / Finance`]}),(0,h.jsx)(`h1`,{children:`Treasury Cash Position`})]})]}),(0,h.jsxs)(`div`,{className:`topActions`,children:[(0,h.jsxs)(`button`,{className:`ghostButton`,type:`button`,onClick:()=>t(_),children:[(0,h.jsx)(s,{size:16}),` Reset`]}),(0,h.jsxs)(`button`,{className:`actionButton`,type:`button`,onClick:j,children:[`Advance selected `,(0,h.jsx)(i,{size:16})]})]})]})}),(0,h.jsx)(f,{children:(0,h.jsxs)(`div`,{className:`tpl-treasury-cash-position workspace`,children:[(0,h.jsxs)(`section`,{className:`panel`,"aria-label":`Treasury Cash Position command rail`,children:[(0,h.jsxs)(`div`,{className:`panelHeader`,children:[(0,h.jsx)(`p`,{className:`panelTitle`,children:`Command rail`}),(0,h.jsx)(l,{size:16})]}),(0,h.jsxs)(`div`,{className:`railBody`,children:[(0,h.jsxs)(`div`,{className:`metricGrid`,children:[(0,h.jsxs)(`div`,{className:`metricCard`,children:[(0,h.jsxs)(`span`,{className:`metricValue`,children:[O,`%`]}),(0,h.jsx)(`span`,{className:`metricLabel`,children:`Avg readiness`})]}),(0,h.jsxs)(`div`,{className:`metricCard`,children:[(0,h.jsx)(`span`,{className:`metricValue`,children:k}),(0,h.jsx)(`span`,{className:`metricLabel`,children:`At risk`})]}),(0,h.jsxs)(`div`,{className:`metricCard`,children:[(0,h.jsx)(`span`,{className:`metricValue`,children:A}),(0,h.jsx)(`span`,{className:`metricLabel`,children:`Ready`})]}),(0,h.jsxs)(`div`,{className:`metricCard`,children:[(0,h.jsx)(`span`,{className:`metricValue`,children:D.length}),(0,h.jsx)(`span`,{className:`metricLabel`,children:`In view`})]})]}),(0,h.jsx)(`div`,{className:`filterGrid`,"aria-label":`Queue filters`,children:y.map(t=>(0,h.jsxs)(`button`,{"aria-pressed":n===t.id,className:`filterButton`,type:`button`,onClick:()=>a(t.id),children:[(0,h.jsx)(`span`,{children:t.label}),(0,h.jsx)(`span`,{children:t.id===`all`?e.length:C(e,t.id)})]},t.id))}),(0,h.jsx)(`ul`,{className:`stageList`,"aria-label":`Stage counters`,children:v.map(e=>(0,h.jsxs)(`li`,{className:`stageItem`,children:[(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`p`,{className:`rowTitle`,children:e.label}),(0,h.jsx)(`div`,{className:`stageTrack`,"aria-hidden":`true`,children:(0,h.jsx)(`div`,{className:`stageFill`,style:{width:T(e)}})})]}),(0,h.jsx)(`span`,{className:`statePill`,children:e.count})]},e.label))})]})]}),(0,h.jsxs)(`section`,{className:`panel`,"aria-label":`Treasury Cash Position queue`,children:[(0,h.jsxs)(`div`,{className:`panelHeader`,children:[(0,h.jsx)(`p`,{className:`panelTitle`,children:`Work queue`}),(0,h.jsxs)(`p`,{className:`eyebrow`,children:[D.length,` rows`]})]}),(0,h.jsx)(`div`,{className:`queueBody`,children:(0,h.jsx)(`ul`,{className:`rowList`,children:D.map(e=>(0,h.jsx)(`li`,{children:(0,h.jsxs)(`button`,{"aria-pressed":E.id===e.id,className:`rowButton`,type:`button`,onClick:()=>u(e.id),children:[(0,h.jsx)(`span`,{className:`rowGlyph`,"aria-hidden":`true`,children:w(e.state)}),(0,h.jsxs)(`span`,{className:`rowMain`,children:[(0,h.jsx)(`span`,{className:`rowTitle`,children:e.title}),(0,h.jsxs)(`span`,{className:`rowMeta`,children:[e.owner,` / `,e.metric,` / `,e.due]}),(0,h.jsx)(`span`,{className:`progressTrack`,"aria-hidden":`true`,children:(0,h.jsx)(`span`,{className:`progressFill`,style:{width:String(e.progress)+`%`}})})]}),(0,h.jsx)(`span`,{className:`statePill`,children:b[e.state]})]})},e.id))})})]}),(0,h.jsxs)(`aside`,{className:`panel detailPanel`,"aria-label":`Treasury Cash Position detail inspector`,children:[(0,h.jsxs)(`div`,{className:`panelHeader`,children:[(0,h.jsx)(`p`,{className:`panelTitle`,children:`Inspector`}),(0,h.jsx)(o,{size:16})]}),(0,h.jsxs)(`div`,{className:`detailBody`,children:[(0,h.jsxs)(`div`,{className:`detailBlock`,children:[(0,h.jsxs)(`div`,{className:`detailCopy`,children:[(0,h.jsxs)(`p`,{className:`eyebrow`,children:[b[E.state],` / `,E.owner]}),(0,h.jsx)(`h2`,{className:`detailTitle`,children:E.title}),(0,h.jsx)(`p`,{className:`rowMeta`,children:E.detail})]}),(0,h.jsx)(`div`,{className:`progressTrack`,"aria-label":`Selected progress`,children:(0,h.jsx)(`div`,{className:`progressFill`,style:{width:String(E.progress)+`%`}})})]}),(0,h.jsxs)(`div`,{className:`detailBlock`,children:[(0,h.jsx)(`p`,{className:`panelTitle`,children:`Signal trend`}),(0,h.jsxs)(`svg`,{className:`chart`,viewBox:`0 0 260 118`,role:`img`,"aria-label":`Six point trend`,children:[(0,h.jsx)(`polyline`,{fill:`none`,points:E.points.map((e,t)=>String(t*52)+`,`+String(100-e*.72)).join(` `),stroke:`var(--template-accent)`,strokeLinecap:`round`,strokeLinejoin:`round`,strokeWidth:`4`}),E.points.map((e,t)=>(0,h.jsx)(`circle`,{cx:t*52,cy:100-e*.72,fill:`var(--color-background-card)`,r:`4`,stroke:`var(--template-accent)`,strokeWidth:`2`},String(t)))]})]}),(0,h.jsxs)(`div`,{className:`detailBlock`,children:[(0,h.jsx)(`p`,{className:`panelTitle`,children:`Next actions`}),(0,h.jsxs)(`ul`,{className:`timeline`,children:[(0,h.jsxs)(`li`,{children:[(0,h.jsx)(`strong`,{children:`Confirm owner`}),(0,h.jsxs)(`span`,{children:[E.owner,` owns the next visible handoff.`]})]}),(0,h.jsxs)(`li`,{children:[(0,h.jsx)(`strong`,{children:`Package evidence`}),(0,h.jsxs)(`span`,{children:[E.metric,` stays attached to the selected row.`]})]}),(0,h.jsxs)(`li`,{children:[(0,h.jsx)(`strong`,{children:`Advance status`}),(0,h.jsx)(`span`,{children:`One update re-derives the rail, row, and inspector.`})]})]})]})]})]})]})})]})}export{E as default};