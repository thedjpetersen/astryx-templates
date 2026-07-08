import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./activity-C9vlowks.js";import{t as i}from"./arrow-right-BLLAA4s5.js";import{t as a}from"./clock-3-DODMJbaF.js";import{t as o}from"./list-checks-Bu4Ew0cY.js";import{t as s}from"./rotate-ccw-DBitG1W1.js";import{b as c,d as l,o as u}from"./index-BKuMiS4T.js";import{n as d,t as f}from"./LayoutContent-Bf3lfkIi.js";import{t as p}from"./LayoutHeader-BT18VRE9.js";var m=e(t(),1),h=n(),g=`Frostline`,_=[{id:`item-01`,title:`Cold priority packet`,owner:`Owen Ellis`,state:`risk`,progress:57,metric:`3 blockers`,due:`Today 2:00 PM`,detail:`Needs owner confirmation, evidence refresh, and a final chain check before the handoff can leave review.`,points:[22,38,31,48,52,63]},{id:`item-02`,title:`Frostline exception sweep`,owner:`Leah Chen`,state:`review`,progress:68,metric:`9 queued`,due:`Tomorrow 10:30 AM`,detail:`Combines fresh queue movement with stale exceptions so the detail pane exposes drift instead of hiding it in aggregate totals.`,points:[18,28,44,40,58,70]},{id:`item-03`,title:`Chain readiness lane`,owner:`Iris Cole`,state:`ready`,progress:84,metric:`79% ready`,due:`Fri 4:00 PM`,detail:`All required fields reconcile; remaining work is sequencing, stakeholder acknowledgement, and export packaging.`,points:[40,52,56,67,73,86]},{id:`item-04`,title:`Frostline owner follow-up`,owner:`Drew Patel`,state:`risk`,progress:61,metric:`3 handoffs`,due:`Mon 9:15 AM`,detail:`Long-label stress case: cross-functional ownership remains visible while the row keeps actions and metrics inside fixed hit zones.`,points:[16,21,32,46,51,60]},{id:`item-05`,title:`Cold signed-off path`,owner:`Marcus Lee`,state:`ready`,progress:92,metric:`19 artifacts`,due:`Next Tue`,detail:`Serves as the stable control row: derived counts, timeline marks, and the detail chart should not move when filters change.`,points:[44,49,61,67,78,91]}],v=[{label:`Intake`,count:13,tone:`neutral`},{label:`Review`,count:7,tone:`review`},{label:`Blocked`,count:3,tone:`risk`},{label:`Ready`,count:9,tone:`ready`}],y=[{id:`all`,label:`All`},{id:`risk`,label:`At risk`},{id:`review`,label:`Review`},{id:`ready`,label:`Ready`}],b={risk:`At risk`,review:`In review`,ready:`Ready`},x={risk:`review`,review:`ready`,ready:`ready`},S=`
.tpl-cold-chain-excursion-console {
  --template-accent: light-dark(#047857, #6EE7B7);
  --template-accent-muted: light-dark(color-mix(in srgb, #047857 12%, white), color-mix(in srgb, #6EE7B7 18%, #111));
  color: var(--color-text-primary);
  font-family: var(--font-family-sans, system-ui, sans-serif);
}
.tpl-cold-chain-excursion-console.topbar {
  align-items: center;
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  gap: var(--spacing-3);
  justify-content: space-between;
  min-height: 56px;
  padding: var(--spacing-2) var(--spacing-4);
}
.tpl-cold-chain-excursion-console .titleCluster {
  align-items: center;
  display: flex;
  gap: var(--spacing-3);
  min-width: 0;
}
.tpl-cold-chain-excursion-console .mark {
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
.tpl-cold-chain-excursion-console h1,
.tpl-cold-chain-excursion-console h2,
.tpl-cold-chain-excursion-console h3,
.tpl-cold-chain-excursion-console p {
  margin: 0;
}
.tpl-cold-chain-excursion-console h1 {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tpl-cold-chain-excursion-console .eyebrow {
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.3;
}
.tpl-cold-chain-excursion-console.workspace {
  background: var(--color-background-body);
  display: grid;
  gap: var(--spacing-3);
  grid-template-columns: 264px minmax(0, 1fr) 320px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  padding: var(--spacing-3);
}
.tpl-cold-chain-excursion-console .panel,
.tpl-cold-chain-excursion-console .metricCard,
.tpl-cold-chain-excursion-console .rowButton,
.tpl-cold-chain-excursion-console .detailBlock {
  background: var(--color-background-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
}
.tpl-cold-chain-excursion-console .panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
.tpl-cold-chain-excursion-console .panelHeader {
  align-items: center;
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  gap: var(--spacing-2);
  justify-content: space-between;
  min-height: 44px;
  padding: var(--spacing-3);
}
.tpl-cold-chain-excursion-console .panelTitle {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0;
}
.tpl-cold-chain-excursion-console .railBody,
.tpl-cold-chain-excursion-console .queueBody,
.tpl-cold-chain-excursion-console .detailBody {
  display: grid;
  gap: var(--spacing-3);
  min-height: 0;
  overflow: auto;
  padding: var(--spacing-3);
}
.tpl-cold-chain-excursion-console .metricGrid {
  display: grid;
  gap: var(--spacing-2);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.tpl-cold-chain-excursion-console .metricCard {
  display: grid;
  gap: 2px;
  padding: var(--spacing-3);
}
.tpl-cold-chain-excursion-console .metricValue {
  font-size: 22px;
  font-variant-numeric: tabular-nums;
  font-weight: 750;
  line-height: 1;
}
.tpl-cold-chain-excursion-console .metricLabel {
  color: var(--color-text-secondary);
  font-size: 11px;
  line-height: 1.3;
}
.tpl-cold-chain-excursion-console .filterGrid {
  display: grid;
  gap: var(--spacing-2);
}
.tpl-cold-chain-excursion-console button {
  font: inherit;
}
.tpl-cold-chain-excursion-console .filterButton,
.tpl-cold-chain-excursion-console .actionButton,
.tpl-cold-chain-excursion-console .ghostButton {
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  gap: var(--spacing-2);
  min-height: 40px;
}
.tpl-cold-chain-excursion-console .filterButton {
  background: transparent;
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-primary);
  justify-content: space-between;
  padding: 0 var(--spacing-3);
  text-align: left;
}
.tpl-cold-chain-excursion-console .filterButton[aria-pressed="true"] {
  background: var(--template-accent-muted);
  border-color: var(--template-accent);
}
.tpl-cold-chain-excursion-console .actionButton {
  background: var(--template-accent);
  border: 0;
  color: var(--color-on-accent, #fff);
  justify-content: center;
  padding: 0 var(--spacing-3);
}
.tpl-cold-chain-excursion-console .ghostButton {
  background: transparent;
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-primary);
  justify-content: center;
  padding: 0 var(--spacing-3);
}
.tpl-cold-chain-excursion-console .stageList,
.tpl-cold-chain-excursion-console .rowList,
.tpl-cold-chain-excursion-console .timeline {
  display: grid;
  gap: var(--spacing-2);
  list-style: none;
  margin: 0;
  padding: 0;
}
.tpl-cold-chain-excursion-console .stageItem {
  align-items: center;
  display: grid;
  gap: var(--spacing-2);
  grid-template-columns: minmax(0, 1fr) auto;
}
.tpl-cold-chain-excursion-console .stageTrack {
  background: var(--color-background-muted);
  border-radius: 999px;
  height: 7px;
  overflow: hidden;
}
.tpl-cold-chain-excursion-console .stageFill {
  background: var(--template-accent);
  height: 100%;
}
.tpl-cold-chain-excursion-console .rowButton {
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
.tpl-cold-chain-excursion-console .rowButton[aria-pressed="true"] {
  border-color: var(--template-accent);
  box-shadow: inset 3px 0 0 var(--template-accent);
}
.tpl-cold-chain-excursion-console .rowGlyph {
  align-items: center;
  background: var(--color-background-muted);
  border-radius: 8px;
  display: inline-flex;
  height: 40px;
  justify-content: center;
  width: 40px;
}
.tpl-cold-chain-excursion-console .rowMain,
.tpl-cold-chain-excursion-console .detailCopy {
  display: grid;
  gap: 3px;
  min-width: 0;
}
.tpl-cold-chain-excursion-console .rowTitle {
  font-size: 14px;
  font-weight: 650;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tpl-cold-chain-excursion-console .rowMeta {
  color: var(--color-text-secondary);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tpl-cold-chain-excursion-console .statePill {
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-secondary);
  font-size: 11px;
  line-height: 1;
  padding: 5px 8px;
  white-space: nowrap;
}
.tpl-cold-chain-excursion-console .progressTrack {
  background: var(--color-background-muted);
  border-radius: 999px;
  height: 8px;
  overflow: hidden;
}
.tpl-cold-chain-excursion-console .progressFill {
  background: var(--template-accent);
  height: 100%;
}
.tpl-cold-chain-excursion-console .detailBlock {
  display: grid;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
}
.tpl-cold-chain-excursion-console .detailTitle {
  font-size: 18px;
  font-weight: 750;
  letter-spacing: 0;
}
.tpl-cold-chain-excursion-console .chart {
  background: var(--color-background-muted);
  border-radius: 8px;
  height: 118px;
  overflow: hidden;
  width: 100%;
}
.tpl-cold-chain-excursion-console .timeline li {
  border-left: 2px solid var(--color-border);
  display: grid;
  gap: 2px;
  padding: 0 0 var(--spacing-2) var(--spacing-3);
}
.tpl-cold-chain-excursion-console .timeline strong {
  font-size: 12px;
}
.tpl-cold-chain-excursion-console .timeline span {
  color: var(--color-text-secondary);
  font-size: 12px;
}
.tpl-cold-chain-excursion-console .topActions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}
@media (max-width: 980px) {
  .tpl-cold-chain-excursion-console.workspace {
    grid-template-columns: 240px minmax(0, 1fr);
    overflow: auto;
  }
  .tpl-cold-chain-excursion-console .detailPanel {
    grid-column: 1 / -1;
    min-height: 420px;
  }
}
@media (max-width: 700px) {
  .tpl-cold-chain-excursion-console.topbar {
    align-items: flex-start;
    flex-direction: column;
  }
  .tpl-cold-chain-excursion-console.workspace {
    grid-template-columns: minmax(0, 1fr);
  }
  .tpl-cold-chain-excursion-console .rowButton {
    grid-template-columns: 36px minmax(0, 1fr);
  }
  .tpl-cold-chain-excursion-console .statePill {
    grid-column: 2;
    justify-self: start;
  }
}
`;function C(e,t){return e.filter(e=>e.state===t).length}function w(e){return e===`risk`?(0,h.jsx)(u,{size:18}):e===`ready`?(0,h.jsx)(c,{size:18}):(0,h.jsx)(a,{size:18})}function T(e){return String(Math.min(100,e.count*7))+`%`}function E(){let[e,t]=(0,m.useState)(_),[n,a]=(0,m.useState)(`all`),[c,u]=(0,m.useState)(_[0].id),E=e.find(e=>e.id===c)??e[0],D=n===`all`?e:e.filter(e=>e.state===n),O=Math.round(e.reduce((e,t)=>e+t.progress,0)/e.length),k=C(e,`risk`),A=C(e,`ready`);function j(){t(e=>e.map(e=>e.id===E.id?{...e,progress:Math.min(100,e.progress+14),state:x[e.state],metric:e.state===`ready`?e.metric:`advanced `+String(e.progress+14)+`%`}:e))}return(0,h.jsxs)(d,{height:`fill`,children:[(0,h.jsx)(`style`,{children:S}),(0,h.jsx)(p,{children:(0,h.jsxs)(`div`,{className:`tpl-cold-chain-excursion-console topbar`,children:[(0,h.jsxs)(`div`,{className:`titleCluster`,children:[(0,h.jsx)(`span`,{className:`mark`,"aria-hidden":`true`,children:(0,h.jsx)(r,{size:20})}),(0,h.jsxs)(`div`,{style:{minWidth:0},children:[(0,h.jsxs)(`p`,{className:`eyebrow`,children:[g,` / Logistics`]}),(0,h.jsx)(`h1`,{children:`Cold Chain Excursion Console`})]})]}),(0,h.jsxs)(`div`,{className:`topActions`,children:[(0,h.jsxs)(`button`,{className:`ghostButton`,type:`button`,onClick:()=>t(_),children:[(0,h.jsx)(s,{size:16}),` Reset`]}),(0,h.jsxs)(`button`,{className:`actionButton`,type:`button`,onClick:j,children:[`Advance selected `,(0,h.jsx)(i,{size:16})]})]})]})}),(0,h.jsx)(f,{children:(0,h.jsxs)(`div`,{className:`tpl-cold-chain-excursion-console workspace`,children:[(0,h.jsxs)(`section`,{className:`panel`,"aria-label":`Cold Chain Excursion Console command rail`,children:[(0,h.jsxs)(`div`,{className:`panelHeader`,children:[(0,h.jsx)(`p`,{className:`panelTitle`,children:`Command rail`}),(0,h.jsx)(l,{size:16})]}),(0,h.jsxs)(`div`,{className:`railBody`,children:[(0,h.jsxs)(`div`,{className:`metricGrid`,children:[(0,h.jsxs)(`div`,{className:`metricCard`,children:[(0,h.jsxs)(`span`,{className:`metricValue`,children:[O,`%`]}),(0,h.jsx)(`span`,{className:`metricLabel`,children:`Avg readiness`})]}),(0,h.jsxs)(`div`,{className:`metricCard`,children:[(0,h.jsx)(`span`,{className:`metricValue`,children:k}),(0,h.jsx)(`span`,{className:`metricLabel`,children:`At risk`})]}),(0,h.jsxs)(`div`,{className:`metricCard`,children:[(0,h.jsx)(`span`,{className:`metricValue`,children:A}),(0,h.jsx)(`span`,{className:`metricLabel`,children:`Ready`})]}),(0,h.jsxs)(`div`,{className:`metricCard`,children:[(0,h.jsx)(`span`,{className:`metricValue`,children:D.length}),(0,h.jsx)(`span`,{className:`metricLabel`,children:`In view`})]})]}),(0,h.jsx)(`div`,{className:`filterGrid`,"aria-label":`Queue filters`,children:y.map(t=>(0,h.jsxs)(`button`,{"aria-pressed":n===t.id,className:`filterButton`,type:`button`,onClick:()=>a(t.id),children:[(0,h.jsx)(`span`,{children:t.label}),(0,h.jsx)(`span`,{children:t.id===`all`?e.length:C(e,t.id)})]},t.id))}),(0,h.jsx)(`ul`,{className:`stageList`,"aria-label":`Stage counters`,children:v.map(e=>(0,h.jsxs)(`li`,{className:`stageItem`,children:[(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`p`,{className:`rowTitle`,children:e.label}),(0,h.jsx)(`div`,{className:`stageTrack`,"aria-hidden":`true`,children:(0,h.jsx)(`div`,{className:`stageFill`,style:{width:T(e)}})})]}),(0,h.jsx)(`span`,{className:`statePill`,children:e.count})]},e.label))})]})]}),(0,h.jsxs)(`section`,{className:`panel`,"aria-label":`Cold Chain Excursion Console queue`,children:[(0,h.jsxs)(`div`,{className:`panelHeader`,children:[(0,h.jsx)(`p`,{className:`panelTitle`,children:`Work queue`}),(0,h.jsxs)(`p`,{className:`eyebrow`,children:[D.length,` rows`]})]}),(0,h.jsx)(`div`,{className:`queueBody`,children:(0,h.jsx)(`ul`,{className:`rowList`,children:D.map(e=>(0,h.jsx)(`li`,{children:(0,h.jsxs)(`button`,{"aria-pressed":E.id===e.id,className:`rowButton`,type:`button`,onClick:()=>u(e.id),children:[(0,h.jsx)(`span`,{className:`rowGlyph`,"aria-hidden":`true`,children:w(e.state)}),(0,h.jsxs)(`span`,{className:`rowMain`,children:[(0,h.jsx)(`span`,{className:`rowTitle`,children:e.title}),(0,h.jsxs)(`span`,{className:`rowMeta`,children:[e.owner,` / `,e.metric,` / `,e.due]}),(0,h.jsx)(`span`,{className:`progressTrack`,"aria-hidden":`true`,children:(0,h.jsx)(`span`,{className:`progressFill`,style:{width:String(e.progress)+`%`}})})]}),(0,h.jsx)(`span`,{className:`statePill`,children:b[e.state]})]})},e.id))})})]}),(0,h.jsxs)(`aside`,{className:`panel detailPanel`,"aria-label":`Cold Chain Excursion Console detail inspector`,children:[(0,h.jsxs)(`div`,{className:`panelHeader`,children:[(0,h.jsx)(`p`,{className:`panelTitle`,children:`Inspector`}),(0,h.jsx)(o,{size:16})]}),(0,h.jsxs)(`div`,{className:`detailBody`,children:[(0,h.jsxs)(`div`,{className:`detailBlock`,children:[(0,h.jsxs)(`div`,{className:`detailCopy`,children:[(0,h.jsxs)(`p`,{className:`eyebrow`,children:[b[E.state],` / `,E.owner]}),(0,h.jsx)(`h2`,{className:`detailTitle`,children:E.title}),(0,h.jsx)(`p`,{className:`rowMeta`,children:E.detail})]}),(0,h.jsx)(`div`,{className:`progressTrack`,"aria-label":`Selected progress`,children:(0,h.jsx)(`div`,{className:`progressFill`,style:{width:String(E.progress)+`%`}})})]}),(0,h.jsxs)(`div`,{className:`detailBlock`,children:[(0,h.jsx)(`p`,{className:`panelTitle`,children:`Signal trend`}),(0,h.jsxs)(`svg`,{className:`chart`,viewBox:`0 0 260 118`,role:`img`,"aria-label":`Six point trend`,children:[(0,h.jsx)(`polyline`,{fill:`none`,points:E.points.map((e,t)=>String(t*52)+`,`+String(100-e*.72)).join(` `),stroke:`var(--template-accent)`,strokeLinecap:`round`,strokeLinejoin:`round`,strokeWidth:`4`}),E.points.map((e,t)=>(0,h.jsx)(`circle`,{cx:t*52,cy:100-e*.72,fill:`var(--color-background-card)`,r:`4`,stroke:`var(--template-accent)`,strokeWidth:`2`},String(t)))]})]}),(0,h.jsxs)(`div`,{className:`detailBlock`,children:[(0,h.jsx)(`p`,{className:`panelTitle`,children:`Next actions`}),(0,h.jsxs)(`ul`,{className:`timeline`,children:[(0,h.jsxs)(`li`,{children:[(0,h.jsx)(`strong`,{children:`Confirm owner`}),(0,h.jsxs)(`span`,{children:[E.owner,` owns the next visible handoff.`]})]}),(0,h.jsxs)(`li`,{children:[(0,h.jsx)(`strong`,{children:`Package evidence`}),(0,h.jsxs)(`span`,{children:[E.metric,` stays attached to the selected row.`]})]}),(0,h.jsxs)(`li`,{children:[(0,h.jsx)(`strong`,{children:`Advance status`}),(0,h.jsx)(`span`,{children:`One update re-derives the rail, row, and inspector.`})]})]})]})]})]})]})})]})}export{E as default};