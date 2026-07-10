import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-BShJ9Z1_.js";import{t as i}from"./Icon-CbuLE4XT.js";import{t as a}from"./building-2-YKlUJ2l1.js";import{t as o}from"./file-check-Ks5RlEJL.js";import{t as s}from"./heart-pulse-DCMxPWnH.js";import{t as ee}from"./map-pin-B2IjXT_o.js";import{t as c}from"./server-CiM-uxtp.js";import{t as l}from"./truck-zGCMJPtB.js";import{t as u}from"./warehouse-UqCgxxFG.js";import{t as d}from"./zap-D0Y89tQV.js";import{A as f}from"./index-CfmeJ-SX.js";import{t as p}from"./HStack-2WTukjNp.js";import{t as m}from"./StackItem-Ca9P7L2I.js";import{n as te,t as ne}from"./LayoutContent-CCL91W7X.js";import{t as re}from"./LayoutHeader-Cy2mWoMf.js";import{t as h}from"./Heading-CEi_rPYM.js";import{t as g}from"./Badge-0Tj9omHc.js";import{t as _}from"./Button-CDZT8H4B.js";var v=f(`factory`,[[`path`,{d:`M12 16h.01`,key:`1drbdi`}],[`path`,{d:`M16 16h.01`,key:`1f9h7w`}],[`path`,{d:`M3 19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a.5.5 0 0 0-.769-.422l-4.462 2.844A.5.5 0 0 1 15 10.5v-2a.5.5 0 0 0-.769-.422L9.77 10.922A.5.5 0 0 1 9 10.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z`,key:`1iv0i2`}],[`path`,{d:`M8 16h.01`,key:`18s6g9`}]]),y=e(t(),1),b=n(),x=`light-dark(#3F6212, #A3E635)`,S=`light-dark(#4D7C0F, #84CC16)`,C=`light-dark(#FFFFFF, #1A2E05)`,w=`light-dark(rgba(77, 124, 15, 0.14), rgba(132, 204, 22, 0.16))`,T=`light-dark(#1D4ED8, #60A5FA)`,E=`light-dark(rgba(29, 78, 216, 0.12), rgba(96, 165, 250, 0.16))`,D=`light-dark(#C2410C, #FB923C)`,O=`light-dark(rgba(194, 65, 12, 0.12), rgba(251, 146, 60, 0.16))`,k=`light-dark(#B91C1C, #F87171)`,A=`light-dark(rgba(185, 28, 28, 0.10), rgba(248, 113, 113, 0.14))`,j=`light-dark(#6D28D9, #A78BFA)`,M=`light-dark(rgba(109, 40, 217, 0.10), rgba(167, 139, 250, 0.14))`,N={A:`light-dark(#15803D, #4ADE80)`,B:`light-dark(#4D7C0F, #A3E635)`,C:`light-dark(#A16207, #FACC15)`,D:`light-dark(#C2410C, #FB923C)`,E:`light-dark(#B91C1C, #F87171)`},P=`light-dark(#FFFFFF, #18181B)`,F=`light-dark(rgba(29, 78, 216, 0.08), rgba(96, 165, 250, 0.10))`,I=`tpl-climate-risk-asset-map`,ie=`
.${I} {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
}
.${I} button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.${I} button:disabled { cursor: default; }
.${I} button:focus-visible {
  outline: 2px solid ${S};
  outline-offset: 2px;
  border-radius: 6px;
}
.${I} .crm-num { font-variant-numeric: tabular-nums; }
.${I} .crm-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ---- Header chrome ---- */
.${I} .crm-brandmark {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: ${S};
  color: ${C};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.${I} .crm-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
  row-gap: var(--spacing-1);
  justify-content: flex-end;
}
.${I} .crm-stat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding-inline: 10px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  white-space: nowrap;
}
.${I} .crm-gradechip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding-inline: 5px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  color: ${P};
}

/* ---- Frame: map column | 340px rail ---- */
.${I} .crm-frame {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
}
.${I} .crm-mapcol {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* ---- Toolbar (48px, wraps) ---- */
.${I} .crm-toolbar {
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  row-gap: var(--spacing-1);
  flex-wrap: wrap;
  padding-inline: var(--spacing-3);
  padding-block: 6px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${I} .crm-toolbar-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${I} .crm-chip {
  height: 28px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding-inline: 10px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${I} .crm-chip[aria-pressed='true'] {
  background: ${S};
  border-color: ${S};
  color: ${C};
}
.${I} .crm-chip-swatch {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

/* ---- Map stage: SVG schematic + overlaid pin buttons ---- */
.${I} .crm-map {
  position: relative;
  margin: var(--spacing-3);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 10px);
  overflow: hidden;
  background: var(--color-background-muted);
}
.${I} .crm-map svg { display: block; width: 100%; height: auto; }
.${I} .crm-pin {
  position: absolute;
  width: 40px;
  height: 40px;
  transform: translate(-50%, -50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
.${I} .crm-pin-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: ${P};
  border: 2px solid light-dark(#FFFFFF, #18181B);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.30);
  transition: transform 140ms ease;
}
.${I} .crm-pin[aria-pressed='true'] .crm-pin-dot {
  transform: scale(1.25);
  border-color: ${S};
}
@media (hover: hover) {
  .${I} .crm-pin:hover .crm-pin-dot { transform: scale(1.15); }
  .${I} .crm-pin[aria-pressed='true']:hover .crm-pin-dot {
    transform: scale(1.25);
  }
}

/* ---- Legend strip ---- */
.${I} .crm-legend {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  row-gap: var(--spacing-1);
  padding-inline: var(--spacing-3);
  padding-bottom: var(--spacing-2);
}
.${I} .crm-legend-item {
  height: 24px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${I} .crm-legend-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: 700;
  color: ${P};
}

/* ---- Selected-asset detail band ---- */
.${I} .crm-detail {
  border-top: var(--border-width) solid var(--color-border);
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.${I} .crm-detail-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  row-gap: 4px;
}
.${I} .crm-hazard-row {
  min-height: 32px;
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr) 112px;
  align-items: center;
  gap: 10px;
}
.${I} .crm-hazard-name {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.${I} .crm-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--color-border);
  overflow: hidden;
}
.${I} .crm-bar-fill {
  position: absolute;
  inset-block: 0;
  left: 0;
  border-radius: 999px;
}
.${I} .crm-bar-eased {
  position: absolute;
  inset-block: 0;
  background: ${w};
  border-inline-start: 2px solid ${S};
}
.${I} .crm-hazard-meta {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  text-align: end;
  white-space: nowrap;
}
.${I} .crm-eased-note { color: ${x}; font-weight: 600; }
.${I} .crm-detail-projects {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.${I} .crm-projchip {
  height: 24px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding-inline: 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${I} .crm-projchip--active {
  border-color: ${S};
  background: ${w};
  color: ${x};
}
.${I} .crm-detail-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-secondary);
}

/* ---- Tracker rail (340px) ---- */
.${I} .crm-rail {
  min-height: 0;
  overflow-y: auto;
  border-left: var(--border-width) solid var(--color-border);
  background: var(--color-background-body);
  display: flex;
  flex-direction: column;
}
.${I} .crm-rail-section {
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${I} .crm-meter {
  height: 10px;
  border-radius: 999px;
  background: var(--color-border);
  overflow: hidden;
}
.${I} .crm-meter-fill {
  height: 100%;
  border-radius: 999px;
  background: ${S};
  transition: width 200ms ease;
}
.${I} .crm-meter-caption {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${I} .crm-project {
  min-height: 96px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.${I} .crm-project--funded { border-color: ${S}; }
.${I} .crm-project-top {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.${I} .crm-project-name {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-text-primary);
}
.${I} .crm-project-asset {
  font-size: 11px;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${I} .crm-project-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  row-gap: 6px;
}
.${I} .crm-hazardchip {
  height: 20px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding-inline: 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.${I} .crm-project-cost {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  font-weight: 600;
  white-space: nowrap;
}
.${I} .crm-project-delta {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: ${x};
  font-weight: 700;
  white-space: nowrap;
}
.${I} .crm-project-refusal {
  font-size: 11px;
  line-height: 1.35;
  color: ${k};
}
.${I} .crm-evidence {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-block: 6px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${I} .crm-evidence:last-child { border-bottom: none; }
.${I} .crm-evidence-label {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: var(--color-text-primary);
  line-height: 1.3;
}
.${I} .crm-evidence--new { background: ${w}; border-radius: 6px; padding-inline: 6px; }

/* ---- Responsive: stack rail below the map column ---- */
@media (max-width: 880px) {
  .${I} .crm-frame {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: none;
    overflow-y: auto;
    display: block;
  }
  .${I} .crm-mapcol { overflow-y: visible; }
  .${I} .crm-rail {
    border-left: none;
    border-top: var(--border-width) solid var(--color-border);
    overflow-y: visible;
  }
}
@media (max-width: 460px) {
  .${I} .crm-hazard-row { grid-template-columns: 64px minmax(0, 1fr) 96px; }
  .${I} .crm-hazard-caption { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .${I} .crm-pin-dot,
  .${I} .crm-meter-fill { transition: none; }
}
`,L=[{id:`flood`,label:`Flood`,short:`FLD`,hue:T,tint:E,weight:.35},{id:`heat`,label:`Extreme heat`,short:`HEAT`,hue:D,tint:O,weight:.2},{id:`wildfire`,label:`Wildfire`,short:`WUI`,hue:k,tint:A,weight:.25},{id:`outage`,label:`Grid outage`,short:`OUT`,hue:j,tint:M,weight:.2}],R=new Map(L.map(e=>[e.id,e])),z={warehouse:{label:`Warehouse`,icon:u},"data-center":{label:`Data center`,icon:c},clinic:{label:`Clinic`,icon:s},substation:{label:`Substation`,icon:d},depot:{label:`Depot`,icon:l},plant:{label:`Treatment plant`,icon:v},office:{label:`Office`,icon:a}},B=[{id:`a-tidewater`,name:`Tidewater Data Center`,type:`data-center`,x:150,y:210,valueM:86,scores:{flood:78,heat:41,wildfire:12,outage:55}},{id:`a-pier`,name:`Carraway Pier Depot`,type:`depot`,x:118,y:322,valueM:22,scores:{flood:84,heat:30,wildfire:8,outage:47}},{id:`a-northgate`,name:`Northgate Clinic`,type:`clinic`,x:330,y:118,valueM:18,scores:{flood:22,heat:63,wildfire:10,outage:38}},{id:`a-millrace`,name:`Millrace Substation`,type:`substation`,x:298,y:296,valueM:34,scores:{flood:71,heat:35,wildfire:18,outage:66}},{id:`a-eastridge`,name:`Eastridge Logistics Hub`,type:`warehouse`,x:600,y:178,valueM:29,scores:{flood:14,heat:44,wildfire:72,outage:41}},{id:`a-foothill`,name:`Foothill Cold Storage`,type:`warehouse`,x:642,y:300,valueM:31,scores:{flood:9,heat:57,wildfire:66,outage:52}},{id:`a-civic`,name:`Civic Center Annex`,type:`office`,x:392,y:228,valueM:12,scores:{flood:18,heat:74,wildfire:6,outage:29}},{id:`a-harborline`,name:`Harborline Fulfillment`,type:`warehouse`,x:202,y:420,valueM:41,scores:{flood:62,heat:38,wildfire:9,outage:33}},{id:`a-ridgeview`,name:`Ridgeview Water Treatment`,type:`plant`,x:556,y:92,valueM:54,scores:{flood:26,heat:31,wildfire:58,outage:61}},{id:`a-southbank`,name:`Southbank Micro-DC`,type:`data-center`,x:422,y:352,valueM:23,scores:{flood:44,heat:68,wildfire:11,outage:49}},{id:`a-alderflats`,name:`Alder Flats Clinic`,type:`clinic`,x:312,y:402,valueM:16,scores:{flood:57,heat:49,wildfire:13,outage:36}},{id:`a-gateway`,name:`Gateway Fleet Yard`,type:`depot`,x:470,y:468,valueM:9,scores:{flood:12,heat:52,wildfire:31,outage:24}}],V=new Map(B.map(e=>[e.id,e])),H=B.reduce((e,t)=>e+t.valueM,0),U=[{id:`P-101`,name:`Flood barrier & dry floodproofing`,assetId:`a-pier`,hazard:`flood`,costK:310,delta:26,initialStatus:`complete`},{id:`P-102`,name:`Cool-roof retrofit`,assetId:`a-civic`,hazard:`heat`,costK:145,delta:21,initialStatus:`complete`},{id:`P-103`,name:`Switchgear elevation +2.4 m`,assetId:`a-tidewater`,hazard:`flood`,costK:420,delta:24,initialStatus:`funded`,isLockedFunding:!0},{id:`P-104`,name:`Backup microgrid + 72 h battery`,assetId:`a-millrace`,hazard:`outage`,costK:640,delta:32,initialStatus:`proposed`},{id:`P-105`,name:`Defensible-space clearing, 30 m`,assetId:`a-eastridge`,hazard:`wildfire`,costK:90,delta:28,initialStatus:`proposed`},{id:`P-106`,name:`Stormwater bioswales + check dam`,assetId:`a-harborline`,hazard:`flood`,costK:260,delta:19,initialStatus:`proposed`},{id:`P-107`,name:`Ember-resistant vents & IR sensors`,assetId:`a-foothill`,hazard:`wildfire`,costK:130,delta:22,initialStatus:`proposed`},{id:`P-108`,name:`District chiller loop tie-in`,assetId:`a-southbank`,hazard:`heat`,costK:380,delta:25,initialStatus:`proposed`}],W=new Map(U.map(e=>[e.id,e])),G=2300,K=[{id:`EV-01`,label:`Elevation certificate — Tidewater Data Center`,status:`on file`},{id:`EV-02`,label:`P-101 completion report — flood barrier, Carraway Pier Depot`,status:`on file`},{id:`EV-03`,label:`P-102 cool-roof spec & thermal scan — Civic Center Annex`,status:`on file`},{id:`EV-04`,label:`P-103 funding memo — switchgear elevation, Tidewater DC`,status:`pending review`},{id:`EV-05`,label:`Wildland-urban interface survey — Eastridge corridor`,status:`on file`}],ae=Object.fromEntries(U.map(e=>[e.id,e.initialStatus]));function q(e){return e===`funded`||e===`complete`}function J(e,t,n){let r=e.scores[t];for(let i of U)i.assetId===e.id&&i.hazard===t&&q(n[i.id])&&(r=Math.max(0,r-i.delta));return r}function Y(e,t){let n=0;for(let r of L)n+=r.weight*J(e,r.id,t);return Math.round(n*10)/10}function X(e){return e<20?`A`:e<35?`B`:e<50?`C`:e<70?`D`:`E`}function Z(e){let t=0;for(let n of B)t+=Y(n,e)*n.valueM;return Math.round(t/H*10)/10}var oe=Z(Object.fromEntries(U.map(e=>[e.id,`proposed`])));function se(e){return U.reduce((t,n)=>q(e[n.id])?t+n.costK:t,0)}var Q=e=>e>=1e3?`$${(e/1e3).toFixed(e%1e3==0?1:2)}M`:`$${e}k`;function ce(){return(0,b.jsx)(`span`,{className:`crm-brandmark`,"aria-hidden":!0,children:(0,b.jsxs)(`svg`,{width:`18`,height:`18`,viewBox:`0 0 24 24`,fill:`none`,children:[(0,b.jsx)(`path`,{d:`M12 4.5c4.7 0 8 2.6 8 6.2 0 4.3-3.9 8.8-8 8.8s-8-4.5-8-8.8c0-3.6 3.3-6.2 8-6.2Z`,stroke:`currentColor`,strokeWidth:`1.6`}),(0,b.jsx)(`path`,{d:`M12 8c2.9 0 5 1.5 5 3.6 0 2.5-2.4 5.2-5 5.2s-5-2.7-5-5.2C7 9.5 9.1 8 12 8Z`,stroke:`currentColor`,strokeWidth:`1.4`}),(0,b.jsx)(`circle`,{cx:`12`,cy:`12.4`,r:`1.7`,fill:`currentColor`})]})})}function le({layers:e}){return(0,b.jsxs)(`svg`,{viewBox:`0 0 760 560`,role:`presentation`,"aria-hidden":!0,children:[(0,b.jsx)(`path`,{d:`M0 0 H96 C124 70 88 150 118 235 C146 315 66 395 104 470 C122 508 96 536 88 560 H0 Z`,fill:F,stroke:T,strokeOpacity:`0.35`,strokeWidth:`1.5`}),(0,b.jsx)(`path`,{d:`M436 0 C404 88 344 138 332 218 C322 282 262 320 242 378 C224 430 164 448 118 468`,fill:`none`,stroke:T,strokeOpacity:`0.45`,strokeWidth:`9`,strokeLinecap:`round`}),(0,b.jsx)(`path`,{d:`M540 60 C610 40 700 70 752 120`,fill:`none`,stroke:`var(--color-border)`,strokeWidth:`1.5`}),(0,b.jsx)(`path`,{d:`M528 140 C606 112 706 150 756 214`,fill:`none`,stroke:`var(--color-border)`,strokeWidth:`1.5`}),(0,b.jsx)(`path`,{d:`M540 236 C620 204 716 250 758 320`,fill:`none`,stroke:`var(--color-border)`,strokeWidth:`1.5`}),(0,b.jsx)(`path`,{d:`M180 60 L720 520 M120 250 H744 M300 8 L470 552 M540 20 L360 548`,fill:`none`,stroke:`var(--color-border)`,strokeOpacity:`0.55`,strokeWidth:`1`}),e.flood&&(0,b.jsx)(`path`,{d:`M96 0 C128 70 92 150 122 235 C150 315 70 395 108 470 C126 508 100 536 92 560 H210 C186 500 232 452 268 402 C300 356 348 306 362 244 C376 180 448 92 470 0 Z`,fill:E,stroke:T,strokeOpacity:`0.5`,strokeWidth:`1.5`,strokeDasharray:`6 4`}),e.heat&&(0,b.jsx)(`path`,{d:`M330 170 C388 148 470 168 486 232 C500 292 470 372 416 392 C356 412 306 366 296 300 C288 240 296 192 330 170 Z`,fill:O,stroke:D,strokeOpacity:`0.5`,strokeWidth:`1.5`,strokeDasharray:`6 4`}),e.wildfire&&(0,b.jsx)(`path`,{d:`M520 30 C610 6 716 44 760 96 V368 C700 344 626 356 566 320 C518 290 508 216 520 150 Z`,fill:A,stroke:k,strokeOpacity:`0.5`,strokeWidth:`1.5`,strokeDasharray:`6 4`}),e.outage&&(0,b.jsxs)(`g`,{children:[(0,b.jsx)(`path`,{d:`M758 424 L560 380 L422 332 L298 296 L150 210`,fill:`none`,stroke:j,strokeOpacity:`0.7`,strokeWidth:`2.5`,strokeDasharray:`10 6`}),[[560,380],[422,332],[298,296]].map(([e,t])=>(0,b.jsx)(`path`,{d:`M${e-7} ${t+9} L${e} ${t-9} L${e+7} ${t+9}`,fill:`none`,stroke:j,strokeOpacity:`0.7`,strokeWidth:`2`},`${e}-${t}`))]}),(0,b.jsx)(`text`,{x:`46`,y:`290`,fill:`var(--color-text-secondary)`,fontSize:`12`,fontWeight:`600`,letterSpacing:`2`,transform:`rotate(-78 46 290)`,children:`CARRAWAY SOUND`}),(0,b.jsx)(`text`,{x:`352`,y:`150`,fill:`var(--color-text-secondary)`,fontSize:`11`,fontStyle:`italic`,transform:`rotate(58 352 150)`,children:`Alder River`}),(0,b.jsx)(`text`,{x:`600`,y:`52`,fill:`var(--color-text-secondary)`,fontSize:`11`,children:`Eastridge Hills`}),(0,b.jsx)(`text`,{x:`366`,y:`264`,fill:`var(--color-text-secondary)`,fontSize:`11`,children:`Civic core`}),(0,b.jsx)(`text`,{x:`196`,y:`472`,fill:`var(--color-text-secondary)`,fontSize:`11`,children:`Harbor flats`})]})}function ue({hazard:e,raw:t,effective:n}){let r=t-n;return(0,b.jsxs)(`div`,{className:`crm-hazard-row`,children:[(0,b.jsx)(`span`,{className:`crm-hazard-name`,style:{color:e.hue},children:e.label}),(0,b.jsxs)(`div`,{className:`crm-bar`,role:`img`,"aria-label":r>0?`${e.label} score ${n} after mitigation, down from ${t}`:`${e.label} score ${t}`,children:[(0,b.jsx)(`span`,{className:`crm-bar-fill`,style:{width:`${n}%`,background:e.hue}}),r>0&&(0,b.jsx)(`span`,{className:`crm-bar-eased`,style:{left:`${n}%`,width:`${r}%`}})]}),(0,b.jsx)(`span`,{className:`crm-hazard-meta`,children:r>0?(0,b.jsxs)(b.Fragment,{children:[(0,b.jsxs)(`span`,{className:`crm-num`,children:[t,` → `,n]}),` `,(0,b.jsxs)(`span`,{className:`crm-eased-note crm-num`,children:[`−`,r,` pts`]})]}):(0,b.jsx)(`span`,{className:`crm-num`,children:t})})]})}function $(){let[e,t]=(0,y.useState)(ae),[n,a]=(0,y.useState)([]),[s,c]=(0,y.useState)(`a-tidewater`),[l,u]=(0,y.useState)(`composite`),[d,f]=(0,y.useState)({flood:!0,heat:!1,wildfire:!0,outage:!1}),[v,x]=(0,y.useState)(null),[S,C]=(0,y.useState)(`Groundtruth portfolio loaded. Select a pin or fund a mitigation project.`),w=(0,y.useMemo)(()=>B.map(t=>{let n=Y(t,e);return{asset:t,composite:n,grade:X(n),effective:Object.fromEntries(L.map(n=>[n.id,J(t,n.id,e)]))}}),[e]),T=(0,y.useMemo)(()=>new Map(w.map(e=>[e.asset.id,e])),[w]),E=(0,y.useMemo)(()=>Z(e),[e]),D=Math.round((oe-E)*10)/10,O=(0,y.useMemo)(()=>se(e),[e]),k=G-O,A=(0,y.useMemo)(()=>{let e=n.map((e,t)=>{let n=W.get(e),r=n==null?null:V.get(n.assetId);return n==null||r==null?null:{id:`EV-${String(K.length+t+1).padStart(2,`0`)}`,label:`${n.id} funding memo — ${n.name.toLowerCase()}, ${r.name}`,status:`pending review`,isNew:!0}}).filter(e=>e!=null);return[...K,...e]},[n]),j=s==null?null:T.get(s)??null,M=n=>{let r=W.get(n);if(r==null||e[n]!==`proposed`)return;if(r.costK>k){let e=r.costK-k;x({projectId:n,text:`Needs ${Q(r.costK)} but only ${Q(k)} remains — short ${Q(e)}. Undo another funding or raise the capex envelope.`}),C(`Refused: ${r.id} exceeds the remaining budget by ${Q(e)}.`);return}let i=V.get(r.assetId);t(e=>({...e,[n]:`funded`})),a(e=>[...e,n]),x(null),c(r.assetId),C(`${r.id} funded — ${i?i.name:r.assetId} ${R.get(r.hazard)?.label??r.hazard} eases by ${r.delta} pts; funding memo added to evidence.`)},P=e=>{let r=W.get(e);r==null||!n.includes(e)||(t(t=>({...t,[e]:`proposed`})),a(t=>t.filter(t=>t!==e)),x(null),C(`${r.id} funding reverted — scores, budget, and evidence restored.`))},F=e=>{f(t=>({...t,[e]:!t[e]}))},$=X(E),de=(0,b.jsx)(re,{hasDivider:!0,children:(0,b.jsxs)(p,{gap:3,vAlign:`center`,children:[(0,b.jsx)(ce,{}),(0,b.jsx)(m,{size:`fill`,children:(0,b.jsxs)(p,{gap:2,vAlign:`center`,children:[(0,b.jsx)(h,{level:1,children:`Meridian Coast Holdings`}),(0,b.jsx)(g,{label:`Carraway Sound region`,variant:`neutral`})]})}),(0,b.jsxs)(`div`,{className:`crm-stats`,children:[(0,b.jsxs)(`span`,{className:`crm-stat`,title:`Value-weighted composite across all 12 assets`,children:[(0,b.jsx)(r,{type:`supporting`,color:`secondary`,children:`Portfolio risk`}),(0,b.jsx)(r,{type:`supporting`,weight:`semibold`,hasTabularNumbers:!0,children:E.toFixed(1)}),(0,b.jsx)(`span`,{className:`crm-gradechip`,style:{background:N[$]},children:$})]}),(0,b.jsxs)(`span`,{className:`crm-stat`,title:`Points eased vs the unmitigated baseline`,children:[(0,b.jsx)(r,{type:`supporting`,color:`secondary`,children:`Eased`}),(0,b.jsxs)(r,{type:`supporting`,weight:`semibold`,hasTabularNumbers:!0,children:[`−`,D.toFixed(1),` pts`]})]}),(0,b.jsx)(`span`,{className:`crm-stat`,title:`Total insured value`,children:(0,b.jsxs)(r,{type:`supporting`,hasTabularNumbers:!0,children:[`$`,H,`M · `,B.length,` assets`]})}),(0,b.jsxs)(`span`,{className:`crm-stat`,title:`Capex budget remaining`,children:[(0,b.jsx)(r,{type:`supporting`,color:`secondary`,children:`Budget`}),(0,b.jsxs)(r,{type:`supporting`,weight:`semibold`,hasTabularNumbers:!0,children:[Q(k),` left`]})]})]})]})});return(0,b.jsxs)(`div`,{className:I,children:[(0,b.jsx)(`style`,{children:ie}),(0,b.jsx)(te,{height:`fill`,header:de,content:(0,b.jsxs)(ne,{padding:0,children:[(0,b.jsx)(`div`,{className:`crm-vh`,role:`status`,"aria-live":`polite`,children:S}),(0,b.jsxs)(`div`,{className:`crm-frame`,children:[(0,b.jsxs)(`div`,{className:`crm-mapcol`,children:[(0,b.jsxs)(`div`,{className:`crm-toolbar`,children:[(0,b.jsx)(`span`,{className:`crm-toolbar-label`,children:`Pin lens`}),(0,b.jsxs)(`div`,{role:`group`,"aria-label":`Color pins by`,style:{display:`contents`},children:[(0,b.jsx)(`button`,{type:`button`,className:`crm-chip`,"aria-pressed":l===`composite`,onClick:()=>u(`composite`),children:`Composite grade`}),L.map(e=>(0,b.jsxs)(`button`,{type:`button`,className:`crm-chip`,"aria-pressed":l===e.id,onClick:()=>u(e.id),children:[(0,b.jsx)(`span`,{className:`crm-chip-swatch`,style:{background:e.hue},"aria-hidden":!0}),e.label]},e.id))]}),(0,b.jsx)(`span`,{className:`crm-toolbar-label`,children:`Layers`}),(0,b.jsx)(`div`,{role:`group`,"aria-label":`Hazard overlays`,style:{display:`contents`},children:L.map(e=>(0,b.jsx)(`button`,{type:`button`,className:`crm-chip`,"aria-pressed":d[e.id],title:`${d[e.id]?`Hide`:`Show`} the ${e.label.toLowerCase()} overlay`,onClick:()=>F(e.id),children:e.short},e.id))})]}),(0,b.jsxs)(`div`,{className:`crm-map`,children:[(0,b.jsx)(le,{layers:d}),w.map(e=>{let{asset:t}=e,n=l===`composite`?e.composite:e.effective[l],r=X(n),i=l===`composite`?e.grade:String(n),a=l===`composite`?`composite ${e.composite.toFixed(1)} (grade ${e.grade})`:`${R.get(l)?.label??l} score ${n}`;return(0,b.jsx)(`button`,{type:`button`,className:`crm-pin`,style:{left:`${t.x/760*100}%`,top:`${t.y/560*100}%`},"aria-pressed":s===t.id,"aria-label":`${t.name}: ${a}`,title:`${t.name} — ${a}`,onClick:()=>c(e=>e===t.id?null:t.id),children:(0,b.jsx)(`span`,{className:`crm-pin-dot`,style:{background:N[r]},children:i})},t.id)})]}),(0,b.jsxs)(`div`,{className:`crm-legend`,"aria-label":`Grade legend`,children:[[`A`,`B`,`C`,`D`,`E`].map(e=>(0,b.jsxs)(`span`,{className:`crm-legend-item`,children:[(0,b.jsx)(`span`,{className:`crm-legend-dot`,style:{background:N[e]},children:e}),e===`A`&&`< 20`,e===`B`&&`20–34`,e===`C`&&`35–49`,e===`D`&&`50–69`,e===`E`&&`≥ 70`]},e)),(0,b.jsx)(`span`,{className:`crm-legend-item`,children:l===`composite`?`Pins show composite grade`:`Pins show ${R.get(l)?.label.toLowerCase()??l} score`})]}),(0,b.jsx)(`div`,{className:`crm-detail`,"aria-label":`Selected asset detail`,children:j==null?(0,b.jsxs)(`div`,{className:`crm-detail-empty`,children:[(0,b.jsx)(i,{icon:ee,size:`sm`,color:`secondary`}),(0,b.jsx)(r,{type:`supporting`,color:`secondary`,children:`Select an asset pin to inspect its hazard profile and linked mitigation projects.`})]}):(0,b.jsxs)(b.Fragment,{children:[(0,b.jsxs)(`div`,{className:`crm-detail-head`,children:[(0,b.jsx)(i,{icon:z[j.asset.type].icon,size:`sm`,color:`secondary`}),(0,b.jsx)(h,{level:2,children:j.asset.name}),(0,b.jsx)(`span`,{className:`crm-gradechip`,style:{background:N[j.grade]},children:j.grade}),(0,b.jsxs)(r,{type:`supporting`,hasTabularNumbers:!0,children:[`composite `,j.composite.toFixed(1)]}),(0,b.jsxs)(r,{type:`supporting`,color:`secondary`,hasTabularNumbers:!0,children:[z[j.asset.type].label,` · insured $`,j.asset.valueM,`M`]})]}),(0,b.jsx)(r,{type:`supporting`,color:`secondary`,children:(0,b.jsx)(`span`,{className:`crm-hazard-caption`,children:`Bars show the mitigated score; the tinted tail is what active projects removed.`})}),L.map(e=>(0,b.jsx)(ue,{hazard:e,raw:j.asset.scores[e.id],effective:j.effective[e.id]},e.id)),(0,b.jsxs)(`div`,{className:`crm-detail-projects`,children:[U.filter(e=>e.assetId===j.asset.id).map(t=>(0,b.jsxs)(`span`,{className:q(e[t.id])?`crm-projchip crm-projchip--active`:`crm-projchip`,children:[t.id,` · `,e[t.id],` · −`,t.delta,` pts`]},t.id)),U.every(e=>e.assetId!==j.asset.id)&&(0,b.jsx)(`span`,{className:`crm-projchip`,children:`No mitigation projects proposed yet`})]})]})})]}),(0,b.jsxs)(`aside`,{className:`crm-rail`,"aria-label":`Mitigation tracker`,children:[(0,b.jsxs)(`div`,{className:`crm-rail-section`,children:[(0,b.jsxs)(p,{gap:2,vAlign:`center`,children:[(0,b.jsx)(m,{size:`fill`,children:(0,b.jsx)(h,{level:2,children:`Capex budget`})}),(0,b.jsx)(r,{type:`supporting`,hasTabularNumbers:!0,children:Q(G)})]}),(0,b.jsx)(`div`,{className:`crm-meter`,role:`img`,"aria-label":`${Q(O)} committed of ${Q(G)}`,children:(0,b.jsx)(`div`,{className:`crm-meter-fill`,style:{width:`${O/G*100}%`}})}),(0,b.jsxs)(`div`,{className:`crm-meter-caption`,children:[(0,b.jsxs)(`span`,{children:[Q(O),` committed`]}),(0,b.jsxs)(`span`,{children:[Q(k),` remaining`]})]})]}),(0,b.jsxs)(`div`,{className:`crm-rail-section`,children:[(0,b.jsxs)(p,{gap:2,vAlign:`center`,children:[(0,b.jsx)(m,{size:`fill`,children:(0,b.jsx)(h,{level:2,children:`Mitigation projects`})}),(0,b.jsx)(g,{label:`${U.filter(t=>q(e[t.id])).length}/${U.length} active`,variant:`info`})]}),U.map(t=>{let i=e[t.id],a=R.get(t.hazard),o=V.get(t.assetId),s=n.includes(t.id);return(0,b.jsxs)(`div`,{className:q(i)?`crm-project crm-project--funded`:`crm-project`,children:[(0,b.jsxs)(`div`,{className:`crm-project-top`,children:[(0,b.jsxs)(`div`,{style:{flex:1,minWidth:0},children:[(0,b.jsxs)(`div`,{className:`crm-project-name`,children:[t.id,` · `,t.name]}),(0,b.jsx)(`div`,{className:`crm-project-asset`,title:o?.name,children:o?.name})]}),(0,b.jsx)(g,{label:i===`complete`?`Complete`:i===`funded`?`Funded`:`Proposed`,variant:i===`complete`?`success`:i===`funded`?`info`:`neutral`})]}),(0,b.jsxs)(`div`,{className:`crm-project-row`,children:[a!=null&&(0,b.jsx)(`span`,{className:`crm-hazardchip`,style:{background:a.tint,color:a.hue},children:a.short}),(0,b.jsxs)(`span`,{className:`crm-project-delta`,children:[`−`,t.delta,` pts`]}),(0,b.jsx)(`span`,{className:`crm-project-cost`,children:Q(t.costK)}),(0,b.jsx)(m,{size:`fill`,children:(0,b.jsx)(`span`,{})}),i===`proposed`&&(0,b.jsx)(_,{label:`Fund`,variant:`primary`,size:`sm`,onClick:()=>M(t.id)}),i===`funded`&&s&&(0,b.jsx)(_,{label:`Undo`,variant:`ghost`,size:`sm`,onClick:()=>P(t.id)}),i===`funded`&&!s&&t.isLockedFunding&&(0,b.jsx)(r,{type:`supporting`,color:`secondary`,children:`In carrier review`})]}),v!=null&&v.projectId===t.id&&(0,b.jsx)(`span`,{className:`crm-project-refusal`,role:`alert`,children:v.text})]},t.id)})]}),(0,b.jsxs)(`div`,{className:`crm-rail-section`,children:[(0,b.jsxs)(p,{gap:2,vAlign:`center`,children:[(0,b.jsx)(m,{size:`fill`,children:(0,b.jsx)(h,{level:2,children:`Insurance evidence`})}),(0,b.jsx)(g,{label:`${A.length} items`,variant:`neutral`})]}),(0,b.jsx)(`div`,{children:A.map(e=>(0,b.jsxs)(`div`,{className:e.isNew?`crm-evidence crm-evidence--new`:`crm-evidence`,children:[(0,b.jsx)(i,{icon:o,size:`sm`,color:`secondary`}),(0,b.jsxs)(`span`,{className:`crm-evidence-label`,children:[(0,b.jsx)(`span`,{className:`crm-num`,children:e.id}),` ·`,` `,e.label]}),(0,b.jsx)(g,{label:e.status,variant:e.status===`on file`?`success`:`info`})]},e.id))})]})]})]})]})})]})}export{$ as default};