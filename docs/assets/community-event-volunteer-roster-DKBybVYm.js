import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-DoyyW0Xq.js";import{t as i}from"./Icon-Cbr2QWU5.js";import{t as a}from"./user-check-SOP0RyPt.js";import{t as o}from"./users-DfoCx9NM.js";import{b as s,i as c,o as l}from"./index-BwFrdgVW.js";import{t as u}from"./HStack-2WTukjNp.js";import{t as d}from"./StackItem-Ca9P7L2I.js";import{n as f,t as p}from"./LayoutContent-CCL91W7X.js";import{t as m}from"./LayoutHeader-Cy2mWoMf.js";import{t as h}from"./Heading-CEfXHtdE.js";import{t as g}from"./Badge-0Tj9omHc.js";import{t as _}from"./Button-DdhUiDLb.js";var v=e(t(),1),y=n(),b=`light-dark(#854D0E, #FACC15)`,x=`light-dark(#A16207, #FACC15)`,S=`light-dark(#FFFFFF, #422006)`,C=`light-dark(rgba(161, 98, 7, 0.12), rgba(250, 204, 21, 0.14))`,w=`light-dark(#15803D, #4ADE80)`,T=`light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))`,E=`light-dark(#B91C1C, #F87171)`,D=`light-dark(rgba(185, 28, 28, 0.10), rgba(248, 113, 113, 0.14))`,O=`tpl-community-event-volunteer-roster`,ee=`
.${O} {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
}
.${O} button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.${O} button:disabled { cursor: default; }
.${O} button:focus-visible,
.${O} a:focus-visible {
  outline: 2px solid ${x};
  outline-offset: 2px;
  border-radius: 4px;
}
.${O} .cevr-num { font-variant-numeric: tabular-nums; }

/* ---- Header chrome ---- */
.${O} .cevr-brandmark {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: ${x};
  color: ${S};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.${O} .cevr-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
  row-gap: var(--spacing-1);
  justify-content: flex-end;
}
.${O} .cevr-stat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding-inline: 10px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  white-space: nowrap;
}
.${O} .cevr-stat--gap { border-color: ${E}; background: ${D}; }
.${O} .cevr-stat--ok { border-color: ${w}; background: ${T}; }

/* ---- Hint bar (44px, above the working frame) ---- */
.${O} .cevr-hintbar {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding-inline: var(--spacing-3);
  padding-block: 4px;
  border-bottom: var(--border-width) solid var(--color-border);
  background: var(--color-background-muted);
}
.${O} .cevr-hintbar--armed { background: ${C}; }
.${O} .cevr-hintbar--refused { background: ${D}; }
.${O} .cevr-hint-text {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${O} .cevr-hint-text strong { font-weight: 600; }

/* ---- Working frame: board | 304px pool rail ---- */
.${O} .cevr-frame {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 304px;
}
.${O} .cevr-body {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.${O} .cevr-board {
  min-width: 0;
  min-height: 0;
  overflow-x: auto;
  overflow-y: hidden;
  display: flex;
  gap: 12px;
  padding: var(--spacing-3);
  align-items: stretch;
}

/* ---- Wave columns (248px fixed; own vertical scroll) ---- */
.${O} .cevr-wave {
  width: 248px;
  flex: 0 0 248px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 10px);
  background: var(--color-background-body);
}
.${O} .cevr-wave-head {
  min-height: 64px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-inline: 12px;
  padding-block: 8px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${O} .cevr-wave-title {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.${O} .cevr-wave-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${O} .cevr-wave-time {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${O} .cevr-wave-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
}

/* ---- Role cards ---- */
.${O} .cevr-role {
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--color-background-muted);
}
.${O} .cevr-role--eligible { border-color: ${x}; }
.${O} .cevr-role--refused {
  border-color: ${E};
  background: ${D};
}
.${O} .cevr-role-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.${O} .cevr-role-name {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.25;
}
.${O} .cevr-req {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 20px;
  padding-inline: 6px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
  white-space: nowrap;
  align-self: flex-start;
}
.${O} .cevr-req--missing {
  border-color: ${E};
  color: ${E};
  background: ${D};
}
.${O} .cevr-assignees {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.${O} .cevr-assignee {
  height: 32px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding-inline: 8px;
  border-radius: 6px;
  background: var(--color-background-body);
  border: var(--border-width) solid var(--color-border);
}
.${O} .cevr-assignee-name {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${O} .cevr-gapchip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 18px;
  padding-inline: 5px;
  border-radius: 999px;
  background: ${C};
  color: ${b};
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  white-space: nowrap;
}
.${O} .cevr-unassign {
  width: 24px;
  height: 24px;
  min-width: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: var(--color-text-secondary);
}
@media (hover: hover) {
  .${O} .cevr-unassign:hover {
    background: ${D};
    color: ${E};
  }
}
.${O} .cevr-target {
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px dashed var(--color-border);
  border-radius: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
  transition: background-color 140ms ease, border-color 140ms ease;
}
.${O} .cevr-target--eligible {
  border-color: ${x};
  border-style: solid;
  color: ${b};
  background: ${C};
}
.${O} .cevr-target--full {
  border-style: solid;
  border-color: ${w};
  color: ${w};
  background: ${T};
}
@media (hover: hover) {
  .${O} .cevr-target--eligible:hover {
    background: ${x};
    color: ${S};
  }
}

/* ---- Pool rail (304px) ---- */
.${O} .cevr-pool {
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-left: var(--border-width) solid var(--color-border);
  background: var(--color-background-body);
}
.${O} .cevr-pool-head {
  padding: var(--spacing-3);
  padding-bottom: var(--spacing-2);
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${O} .cevr-pool-filters {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.${O} .cevr-filter {
  height: 28px;
  padding-inline: 10px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.${O} .cevr-filter[aria-pressed='true'] {
  background: ${x};
  border-color: ${x};
  color: ${S};
}
.${O} .cevr-pool-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.${O} .cevr-pool-row {
  min-height: 60px;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-inline: var(--spacing-3);
  padding-block: 8px;
  border-bottom: var(--border-width) solid var(--color-border);
}
@media (hover: hover) {
  .${O} .cevr-pool-row:hover { background: var(--color-background-muted); }
}
.${O} .cevr-pool-row[aria-pressed='true'] {
  background: ${C};
  box-shadow: inset 3px 0 0 ${x};
}
.${O} .cevr-pool-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.${O} .cevr-pool-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${O} .cevr-badges {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.${O} .cevr-training {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding-inline: 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${O} .cevr-training--none {
  border-style: dashed;
  font-weight: 400;
  letter-spacing: 0;
  font-size: 10px;
}
.${O} .cevr-dots { display: flex; gap: 3px; flex-shrink: 0; }
.${O} .cevr-dot {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
}
.${O} .cevr-dot--on {
  background: ${C};
  border-color: ${x};
  color: ${b};
}
.${O} .cevr-refusal {
  font-size: 12px;
  line-height: 1.35;
  color: ${E};
}
.${O} .cevr-pool-empty {
  padding: var(--spacing-5) var(--spacing-3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
}

/* ---- Rings share one SVG anatomy; sizes 44 (wave) / 40 (role) ---- */
.${O} .cevr-ring { flex-shrink: 0; display: inline-flex; }
.${O} .cevr-ring-label {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

/* ---- Responsive: stack the rail above the board on small screens ---- */
@media (max-width: 760px) {
  .${O} .cevr-frame {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
  }
  .${O} .cevr-pool {
    order: -1;
    border-left: none;
    border-bottom: var(--border-width) solid var(--color-border);
    max-height: 320px;
  }
  .${O} .cevr-board { scroll-snap-type: x mandatory; }
  .${O} .cevr-wave {
    width: 84vw;
    flex: 0 0 84vw;
    scroll-snap-align: start;
  }
}
@media (prefers-reduced-motion: reduce) {
  .${O} .cevr-target { transition: none; }
}
`,k={lift:{id:`lift`,code:`LIFT`,label:`Lift & rigging certification`},firstaid:{id:`firstaid`,code:`FA`,label:`First aid / CPR`},alcohol:{id:`alcohol`,code:`TIPS`,label:`Alcohol service (TIPS)`},crowd:{id:`crowd`,code:`CRWD`,label:`Crowd management`},youth:{id:`youth`,code:`YSC`,label:`Youth safety clearance`}},A=[{id:`w1`,short:`W1`,name:`Setup`,time:`6:30 – 9:00 AM`},{id:`w2`,short:`W2`,name:`Gates open`,time:`9:00 AM – 1:00 PM`},{id:`w3`,short:`W3`,name:`Peak & main stage`,time:`1:00 – 5:30 PM`},{id:`w4`,short:`W4`,name:`Teardown`,time:`5:30 – 8:00 PM`}],j=[{id:`r-rig1`,waveId:`w1`,name:`Stage rigging`,needed:3,requires:`lift`,note:`Truss & line-array assist, north stage`},{id:`r-vend`,waveId:`w1`,name:`Vendor check-in`,needed:2,requires:null,note:`Load-in gate C, booth map handout`},{id:`r-sign`,waveId:`w1`,name:`Signage & wayfinding`,needed:2,requires:null,note:`A-frames along River Walk loop`},{id:`r-gate`,waveId:`w2`,name:`Gate scanning & wristbands`,needed:4,requires:null,note:`Main gate, two scanner lanes`},{id:`r-aid2`,waveId:`w2`,name:`First-aid tent (AM)`,needed:2,requires:`firstaid`,note:`Tent 1 beside the boathouse`},{id:`r-kids`,waveId:`w2`,name:`Kids zone & craft tables`,needed:3,requires:`youth`,note:`Two-adult rule at all times`},{id:`r-beer`,waveId:`w3`,name:`Beer garden ID check`,needed:3,requires:`alcohol`,note:`Wristband + ID at both garden gates`},{id:`r-aid3`,waveId:`w3`,name:`First-aid tent (PM)`,needed:2,requires:`firstaid`,note:`Heat plan in effect after 2 PM`},{id:`r-crowd`,waveId:`w3`,name:`Main stage crowd line`,needed:4,requires:`crowd`,note:`Barricade line for the 4 PM headliner`},{id:`r-info`,waveId:`w3`,name:`Info booth & lost kids`,needed:2,requires:null,note:`Radio channel 3; reunite protocol card`},{id:`r-waste`,waveId:`w4`,name:`Waste sort & recycling`,needed:4,requires:null,note:`Three-stream sort at both corrals`},{id:`r-rig4`,waveId:`w4`,name:`Rigging strike & load-out`,needed:3,requires:`lift`,note:`Reverse of morning build; truck at 6 PM`},{id:`r-lost`,waveId:`w4`,name:`Lost & found sweep`,needed:1,requires:null,note:`Full grounds walk, log to the binder`}],M=[{id:`v-owen`,name:`Owen Faulkner`,trainings:[`lift`],availability:[`w1`,`w4`]},{id:`v-ibrahim`,name:`Ibrahim Diallo`,trainings:[`lift`,`crowd`],availability:[`w1`,`w3`]},{id:`v-renata`,name:`Renata Cruz`,trainings:[],availability:[`w1`,`w2`]},{id:`v-sam`,name:`Sam Okafor`,trainings:[`alcohol`],availability:[`w1`,`w3`]},{id:`v-june`,name:`June Park`,trainings:[],availability:[`w1`]},{id:`v-malik`,name:`Malik Reyes`,trainings:[],availability:[`w2`,`w3`]},{id:`v-harper`,name:`Harper Quinn`,trainings:[`crowd`],availability:[`w2`,`w3`]},{id:`v-sofia`,name:`Sofia Andrade`,trainings:[],availability:[`w2`]},{id:`v-alexandria`,name:`Alexandria Whitfield-Baumgartner`,trainings:[`firstaid`],availability:[`w2`,`w3`,`w4`]},{id:`v-nia`,name:`Nia Solomon`,trainings:[`firstaid`],availability:[`w2`]},{id:`v-peter`,name:`Peter Vance`,trainings:[`firstaid`,`lift`],availability:[`w2`,`w4`]},{id:`v-dana`,name:`Dana Whitcomb`,trainings:[`youth`],availability:[`w2`]},{id:`v-grace`,name:`Grace Liu`,trainings:[`firstaid`],availability:[`w3`]},{id:`v-theo`,name:`Theo Marsh`,trainings:[],availability:[`w3`,`w4`]},{id:`v-rosa`,name:`Rosa Jimenez`,trainings:[`crowd`],availability:[`w3`]},{id:`v-kofi`,name:`Kofi Mensah`,trainings:[`crowd`,`alcohol`],availability:[`w3`]},{id:`v-elena`,name:`Elena Petrova`,trainings:[],availability:[`w3`,`w4`]},{id:`v-miguel`,name:`Miguel Santos`,trainings:[],availability:[`w4`]},{id:`v-priti`,name:`Priti Shah`,trainings:[],availability:[`w4`]},{id:`v-jonas`,name:`Jonas Weber`,trainings:[`lift`],availability:[`w1`,`w4`]},{id:`v-tessa`,name:`Tessa Bright`,trainings:[],availability:[`w4`]},{id:`v-priya`,name:`Priya Raman`,trainings:[`alcohol`,`firstaid`],availability:[`w2`,`w3`]},{id:`v-caleb`,name:`Caleb Ortiz`,trainings:[`lift`],availability:[`w1`,`w4`]},{id:`v-moses`,name:`Moses Kariuki`,trainings:[`crowd`],availability:[`w3`]},{id:`v-lena`,name:`Lena Fischer`,trainings:[],availability:[`w2`,`w3`,`w4`]},{id:`v-arjun`,name:`Arjun Patel`,trainings:[`youth`],availability:[`w2`]},{id:`v-yuki`,name:`Yuki Tanaka`,trainings:[`firstaid`],availability:[`w3`,`w4`]},{id:`v-bernadette`,name:`Bernadette Oyelaran-Whitfield`,trainings:[`youth`,`firstaid`],availability:[`w2`]},{id:`v-hank`,name:`Hank Dooley`,trainings:[],availability:[`w4`]},{id:`v-zoe`,name:`Zoe Nakamura`,trainings:[`alcohol`],availability:[`w3`]}],N=new Map(M.map(e=>[e.id,e])),P=new Map(j.map(e=>[e.id,e])),F=new Map(A.map(e=>[e.id,e])),te=[{volunteerId:`v-owen`,roleId:`r-rig1`,isOverride:!1},{volunteerId:`v-ibrahim`,roleId:`r-rig1`,isOverride:!1},{volunteerId:`v-renata`,roleId:`r-vend`,isOverride:!1},{volunteerId:`v-sam`,roleId:`r-vend`,isOverride:!1},{volunteerId:`v-june`,roleId:`r-sign`,isOverride:!1},{volunteerId:`v-malik`,roleId:`r-gate`,isOverride:!1},{volunteerId:`v-harper`,roleId:`r-gate`,isOverride:!1},{volunteerId:`v-sofia`,roleId:`r-gate`,isOverride:!1},{volunteerId:`v-alexandria`,roleId:`r-gate`,isOverride:!1},{volunteerId:`v-nia`,roleId:`r-aid2`,isOverride:!1},{volunteerId:`v-peter`,roleId:`r-aid2`,isOverride:!1},{volunteerId:`v-dana`,roleId:`r-kids`,isOverride:!1},{volunteerId:`v-grace`,roleId:`r-aid3`,isOverride:!1},{volunteerId:`v-theo`,roleId:`r-crowd`,isOverride:!0},{volunteerId:`v-rosa`,roleId:`r-crowd`,isOverride:!1},{volunteerId:`v-kofi`,roleId:`r-crowd`,isOverride:!1},{volunteerId:`v-elena`,roleId:`r-info`,isOverride:!1},{volunteerId:`v-miguel`,roleId:`r-waste`,isOverride:!1},{volunteerId:`v-priti`,roleId:`r-waste`,isOverride:!1},{volunteerId:`v-jonas`,roleId:`r-rig4`,isOverride:!1},{volunteerId:`v-tessa`,roleId:`r-lost`,isOverride:!1}];function I(e,t,n){if(n>=t.needed)return{kind:`full`};if(!e.availability.includes(t.waveId)){let e=F.get(t.waveId);return{kind:`unavailable`,waveName:e?e.name:t.waveId}}return t.requires!=null&&!e.trainings.includes(t.requires)?{kind:`training`,training:k[t.requires]}:{kind:`ok`}}function L(e,t){return t>0&&e>=t?w:e===0?E:x}function R({filled:e,needed:t,size:n,label:r}){let i=n>=44?5:4,a=(n-i)/2,o=2*Math.PI*a,s=t===0?0:Math.min(1,e/t),c=L(e,t),l=n>=44?11:10;return(0,y.jsx)(`span`,{className:`cevr-ring`,role:`img`,"aria-label":`${r}: ${e} of ${t} filled`,children:(0,y.jsxs)(`svg`,{width:n,height:n,viewBox:`0 0 ${n} ${n}`,"aria-hidden":!0,children:[(0,y.jsx)(`circle`,{cx:n/2,cy:n/2,r:a,fill:`none`,stroke:`var(--color-border)`,strokeWidth:i}),(0,y.jsx)(`circle`,{cx:n/2,cy:n/2,r:a,fill:`none`,stroke:c,strokeWidth:i,strokeLinecap:`round`,strokeDasharray:`${o*s} ${o*(1-s)}`,transform:`rotate(-90 ${n/2} ${n/2})`}),(0,y.jsxs)(`text`,{x:`50%`,y:`50%`,dominantBaseline:`central`,textAnchor:`middle`,className:`cevr-ring-label`,fontSize:l,fill:`var(--color-text-primary)`,children:[e,`/`,t]})]})})}function ne(){return(0,y.jsx)(`span`,{className:`cevr-brandmark`,"aria-hidden":!0,children:(0,y.jsx)(`svg`,{width:`18`,height:`18`,viewBox:`0 0 24 24`,fill:`none`,children:(0,y.jsx)(`path`,{d:`M8 12.5V6.8a1.3 1.3 0 0 1 2.6 0V11M10.6 10.8V5.2a1.3 1.3 0 0 1 2.6 0v5.6M13.2 10.8V6.2a1.3 1.3 0 0 1 2.6 0v6.3M15.8 12.5v-1.3l1.6-2.2a1.4 1.4 0 0 1 2.3 1.6l-2.7 4.9a6 6 0 0 1-5.3 3.2h-.6a5.6 5.6 0 0 1-5.6-5.6v-2.3a1.3 1.3 0 0 1 2.6 0`,stroke:`currentColor`,strokeWidth:`1.7`,strokeLinecap:`round`,strokeLinejoin:`round`})})})}function z({ids:e}){return e.length===0?(0,y.jsx)(`span`,{className:`cevr-training cevr-training--none`,children:`no certs`}):(0,y.jsx)(y.Fragment,{children:e.map(e=>{let t=k[e];return(0,y.jsx)(`span`,{className:`cevr-training`,title:t.label,"aria-label":t.label,children:t.code},e)})})}function B({availability:e}){return(0,y.jsx)(`span`,{className:`cevr-dots`,"aria-hidden":!0,children:A.map(t=>(0,y.jsx)(`span`,{className:e.includes(t.id)?`cevr-dot cevr-dot--on`:`cevr-dot`,children:t.short.slice(1)},t.id))})}function V(e){return e.map(e=>{let t=F.get(e);return t?`${t.name} (${t.time})`:e}).join(`, `)}function re({view:e,armed:t,refusalRoleId:n,refusalText:o,onAssign:l,onUnassign:u}){let{role:d,assignees:f}=e,p=f.length,m=p>=d.needed,h=t==null?null:I(t,d,p),g=h!=null&&h.kind===`ok`,_=n===d.id,v=d.requires==null?null:k[d.requires],b=v!=null&&t!=null&&!t.trainings.includes(v.id),x=[`cevr-role`,g?`cevr-role--eligible`:``,_?`cevr-role--refused`:``].filter(Boolean).join(` `),S=`${d.needed-p} open`;return m?S=`Fully staffed`:t!=null&&(S=g?`Assign ${t.name.split(` `)[0]} here`:`Assign here`),(0,y.jsxs)(`div`,{className:x,children:[(0,y.jsxs)(`div`,{className:`cevr-role-head`,children:[(0,y.jsx)(R,{filled:p,needed:d.needed,size:40,label:d.name}),(0,y.jsxs)(`span`,{className:`cevr-role-name`,children:[d.name,d.note!=null&&(0,y.jsx)(r,{type:`supporting`,color:`secondary`,maxLines:1,children:d.note})]})]}),v!=null&&(0,y.jsxs)(`span`,{className:b&&t!=null?`cevr-req cevr-req--missing`:`cevr-req`,title:v.label,children:[`requires `,v.code]}),f.length>0&&(0,y.jsx)(`div`,{className:`cevr-assignees`,children:f.map(({assignment:e,volunteer:t})=>(0,y.jsxs)(`div`,{className:`cevr-assignee`,children:[(0,y.jsx)(`span`,{className:`cevr-assignee-name`,title:t.name,children:t.name}),e.isOverride&&(0,y.jsx)(`span`,{className:`cevr-gapchip`,title:v==null?`Training gap`:`Assigned without ${v.label}`,children:`GAP`}),(0,y.jsx)(`button`,{type:`button`,className:`cevr-unassign`,"aria-label":`Unassign ${t.name} from ${d.name}`,onClick:()=>u(t.id),children:(0,y.jsx)(i,{icon:c,size:`sm`,color:`inherit`})})]},t.id))}),(0,y.jsxs)(`button`,{type:`button`,className:[`cevr-target`,g?`cevr-target--eligible`:``,m?`cevr-target--full`:``].filter(Boolean).join(` `),disabled:m&&t==null,"aria-label":t==null?`${d.name}: ${p} of ${d.needed} filled`:`Assign ${t.name} to ${d.name}`,onClick:()=>l(d.id),children:[m?(0,y.jsx)(i,{icon:s,size:`sm`,color:`inherit`}):(0,y.jsx)(i,{icon:a,size:`sm`,color:`inherit`}),(0,y.jsx)(`span`,{className:`cevr-num`,children:S})]}),_&&o!=null&&(0,y.jsx)(`span`,{className:`cevr-refusal`,role:`alert`,children:o})]})}function H(){let[e,t]=(0,v.useState)(te),[n,a]=(0,v.useState)(null),[c,b]=(0,v.useState)(null),[x,S]=(0,v.useState)(null),[C,w]=(0,v.useState)(`Select a volunteer from the pool, then click a role slot to place them.`),[T,E]=(0,v.useState)(`all`),D=(0,v.useMemo)(()=>new Set(e.map(e=>e.volunteerId)),[e]),L=(0,v.useMemo)(()=>{let t=new Map;for(let e of j)t.set(e.id,{role:e,assignees:[]});for(let n of e){let e=t.get(n.roleId),r=N.get(n.volunteerId);e!=null&&r!=null&&e.assignees.push({assignment:n,volunteer:r})}return t},[e]),H=(0,v.useMemo)(()=>{let e=new Map;for(let t of A)e.set(t.id,{filled:0,needed:0});for(let t of j){let n=e.get(t.waveId),r=L.get(t.id);n!=null&&r!=null&&(n.needed+=t.needed,n.filled+=r.assignees.length)}return e},[L]),U=j.reduce((e,t)=>e+t.needed,0),W=e.length,G=e.filter(e=>e.isOverride).length,K=j.filter(e=>{let t=L.get(e.id);return t!=null&&t.assignees.length>=e.needed}).length,q=(0,v.useMemo)(()=>M.filter(e=>!D.has(e.id)),[D]),J=T===`all`?q:q.filter(e=>e.availability.includes(T)),Y=e=>q.filter(t=>t.availability.includes(e)).length,X=n==null?null:N.get(n)??null,Z=()=>{b(null),S(null)},ie=e=>{if(Z(),n===e){a(null),w(`Assignment cancelled.`);return}a(e);let t=N.get(e);t!=null&&w(`available ${V(t.availability)}. Click a role slot.`)},Q=()=>{a(null),Z(),w(`Assignment cancelled.`)},$=(e,n,r)=>{t(t=>[...t,{volunteerId:e.id,roleId:n.id,isOverride:r}]),a(null),Z();let i=F.get(n.waveId);w(`${e.name} assigned to ${n.name} (${i?i.name:n.waveId})${r?` with a training-gap override`:``}.`)},ae=e=>{let t=P.get(e),n=L.get(e);if(t==null||n==null)return;if(X==null){w(`Select a volunteer from the pool first.`);return}let r=I(X,t,n.assignees.length);switch(r.kind){case`ok`:{let n=c!=null&&c.roleId===e&&c.volunteerId===X.id;$(X,t,n);break}case`full`:b(null),S({roleId:e,text:`${t.name} is fully staffed (${t.needed}/${t.needed}). Unassign someone first.`}),w(`refused — ${t.name} is fully staffed.`);break;case`unavailable`:b(null),S({roleId:e,text:`${X.name} didn't sign up for the ${r.waveName} wave — availability can't be overridden.`}),w(`refused — not signed up for the ${r.waveName} wave.`);break;case`training`:c!=null&&c.roleId===e&&c.volunteerId===X.id?$(X,t,!0):(b({volunteerId:X.id,roleId:e}),S({roleId:e,text:`Needs ${r.training.code} — ${X.name} hasn't logged ${r.training.label}. Click again to override and log a training gap.`}),w(`missing ${r.training.label} — click the slot again to override.`));break}},oe=e=>{let n=N.get(e);t(t=>t.filter(t=>t.volunteerId!==e)),Z(),n!=null&&w(`${n.name} returned to the pool.`)},se=[`cevr-hintbar`,X==null?``:`cevr-hintbar--armed`,x==null?``:`cevr-hintbar--refused`].filter(Boolean).join(` `),ce=(0,y.jsx)(m,{hasDivider:!0,children:(0,y.jsxs)(u,{gap:3,vAlign:`center`,children:[(0,y.jsx)(ne,{}),(0,y.jsx)(d,{size:`fill`,children:(0,y.jsxs)(u,{gap:2,vAlign:`center`,children:[(0,y.jsx)(h,{level:1,children:`Alder Creek River Festival`}),(0,y.jsx)(g,{label:`Sat Jun 20, 2026`,variant:`neutral`})]})}),(0,y.jsxs)(`div`,{className:`cevr-stats`,children:[(0,y.jsxs)(`span`,{className:`cevr-stat`,title:`Filled slots across all waves and roles`,children:[(0,y.jsx)(R,{filled:W,needed:U,size:28,label:`Overall readiness`}),(0,y.jsxs)(r,{type:`supporting`,hasTabularNumbers:!0,children:[Math.round(W/U*100),`% ready`]})]}),(0,y.jsxs)(`span`,{className:`cevr-stat`,title:`Unassigned volunteers`,children:[(0,y.jsx)(i,{icon:o,size:`sm`,color:`secondary`}),(0,y.jsxs)(r,{type:`supporting`,hasTabularNumbers:!0,children:[q.length,` in pool`]})]}),(0,y.jsxs)(`span`,{className:G>0?`cevr-stat cevr-stat--gap`:`cevr-stat`,title:`Assignments made without the required training`,children:[(0,y.jsx)(i,{icon:l,size:`sm`,color:`inherit`}),(0,y.jsxs)(r,{type:`supporting`,hasTabularNumbers:!0,children:[G,` training gap`,G===1?``:`s`]})]}),(0,y.jsxs)(`span`,{className:`cevr-stat cevr-stat--ok`,title:`Roles at full headcount`,children:[(0,y.jsx)(i,{icon:s,size:`sm`,color:`inherit`}),(0,y.jsxs)(r,{type:`supporting`,hasTabularNumbers:!0,children:[K,`/`,j.length,` roles staffed`]})]})]})]})});return(0,y.jsxs)(`div`,{className:O,children:[(0,y.jsx)(`style`,{children:ee}),(0,y.jsx)(f,{height:`fill`,header:ce,content:(0,y.jsx)(p,{padding:0,children:(0,y.jsxs)(`div`,{className:`cevr-body`,children:[(0,y.jsxs)(`div`,{className:se,children:[(0,y.jsx)(`span`,{className:`cevr-hint-text`,role:`status`,"aria-live":`polite`,children:X==null?C:(0,y.jsxs)(y.Fragment,{children:[`Assigning `,(0,y.jsx)(`strong`,{children:X.name}),` — `,C]})}),X!=null&&(0,y.jsx)(_,{label:`Cancel`,variant:`ghost`,size:`sm`,onClick:Q})]}),(0,y.jsxs)(`div`,{className:`cevr-frame`,children:[(0,y.jsx)(`div`,{className:`cevr-board`,role:`list`,"aria-label":`Arrival waves`,children:A.map(e=>{let t=H.get(e.id)??{filled:0,needed:0},n=j.filter(t=>t.waveId===e.id);return(0,y.jsxs)(`section`,{className:`cevr-wave`,role:`listitem`,"aria-label":`${e.name} wave, ${t.filled} of ${t.needed} filled`,children:[(0,y.jsxs)(`div`,{className:`cevr-wave-head`,children:[(0,y.jsx)(R,{filled:t.filled,needed:t.needed,size:44,label:`${e.name} coverage`}),(0,y.jsxs)(`div`,{className:`cevr-wave-title`,children:[(0,y.jsxs)(`span`,{className:`cevr-wave-name`,children:[e.short,` · `,e.name]}),(0,y.jsx)(`span`,{className:`cevr-wave-time`,children:e.time})]})]}),(0,y.jsx)(`div`,{className:`cevr-wave-body`,children:n.map(e=>{let t=L.get(e.id);return t==null?null:(0,y.jsx)(re,{view:t,armed:X,refusalRoleId:x?.roleId??null,refusalText:x?.text??null,onAssign:ae,onUnassign:oe},e.id)})})]},e.id)})}),(0,y.jsxs)(`aside`,{className:`cevr-pool`,"aria-label":`Volunteer pool`,children:[(0,y.jsxs)(`div`,{className:`cevr-pool-head`,children:[(0,y.jsxs)(u,{gap:2,vAlign:`center`,children:[(0,y.jsx)(d,{size:`fill`,children:(0,y.jsx)(h,{level:2,children:`Volunteer pool`})}),(0,y.jsx)(g,{label:`${q.length} unassigned`,variant:q.length>0?`info`:`success`})]}),(0,y.jsxs)(`div`,{className:`cevr-pool-filters`,role:`group`,"aria-label":`Filter pool by wave availability`,children:[(0,y.jsxs)(`button`,{type:`button`,className:`cevr-filter`,"aria-pressed":T===`all`,onClick:()=>E(`all`),children:[`All · `,q.length]}),A.map(e=>(0,y.jsxs)(`button`,{type:`button`,className:`cevr-filter`,"aria-pressed":T===e.id,title:`${e.name} · ${e.time}`,onClick:()=>E(t=>t===e.id?`all`:e.id),children:[e.short,` · `,Y(e.id)]},e.id))]})]}),(0,y.jsxs)(`div`,{className:`cevr-pool-list`,children:[J.map(e=>(0,y.jsxs)(`button`,{type:`button`,className:`cevr-pool-row`,"aria-pressed":n===e.id,"aria-label":`${e.name}; trainings: ${e.trainings.length>0?e.trainings.map(e=>k[e].label).join(`, `):`none`}; available: ${V(e.availability)}`,onClick:()=>ie(e.id),children:[(0,y.jsxs)(`div`,{className:`cevr-pool-main`,children:[(0,y.jsx)(`span`,{className:`cevr-pool-name`,title:e.name,children:e.name}),(0,y.jsx)(`span`,{className:`cevr-badges`,children:(0,y.jsx)(z,{ids:e.trainings})})]}),(0,y.jsx)(B,{availability:e.availability})]},e.id)),J.length===0&&(0,y.jsxs)(`div`,{className:`cevr-pool-empty`,children:[(0,y.jsx)(i,{icon:o,size:`md`,color:`secondary`}),(0,y.jsx)(r,{type:`body`,weight:`semibold`,children:q.length===0?`Pool is empty`:`No one matches this wave`}),(0,y.jsx)(r,{type:`supporting`,color:`secondary`,children:q.length===0?`Every signup is placed. Unassign a chip on the board to free someone up.`:`Clear the wave filter to see the rest of the pool.`})]})]})]})]})]})})})]})}export{H as default};