import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-DoyyW0Xq.js";import{t as i}from"./Icon-Cbr2QWU5.js";import{t as a}from"./arrow-right-CkxqNtnn.js";import{t as o}from"./package-NPuFa4OQ.js";import{t as s}from"./timer-CD_UuZKI.js";import{t as c}from"./warehouse-fC8twZRy.js";import{a as l,b as ee,o as u}from"./index-BwFrdgVW.js";import{t as d}from"./Tooltip-XDRm9Z-w.js";import{t as f}from"./HStack-2WTukjNp.js";import{t as te}from"./VStack-B8U-hI0Y.js";import{t as p}from"./StackItem-Ca9P7L2I.js";import{n as ne,t as re}from"./LayoutContent-CCL91W7X.js";import{t as m}from"./LayoutHeader-Cy2mWoMf.js";import{t as ie}from"./LayoutPanel-Cqp-l8I4.js";import{t as ae}from"./Heading-CEfXHtdE.js";import{t as h}from"./Badge-0Tj9omHc.js";import{t as oe}from"./useMediaQuery-BvG63aw7.js";var g=e(t(),1),_=n(),v=`light-dark(#177245, #4FE0A1)`,y=`light-dark(#FFFFFF, #06251A)`,b=`light-dark(rgba(23, 114, 69, 0.10), rgba(79, 224, 161, 0.14))`,x={"t-priya":`var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))`,"t-marcus":`var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))`,"t-elena":`var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))`},S=`light-dark(#0B7A38, #34C759)`,C=`light-dark(#9A6A00, #F0B429)`,w=`light-dark(#DC2626, #F87171)`,T=`light-dark(rgba(154, 106, 0, 0.10), rgba(240, 180, 41, 0.16))`,E=`light-dark(rgba(220, 38, 38, 0.08), rgba(248, 113, 113, 0.14))`,D=`light-dark(rgba(11, 122, 56, 0.08), rgba(52, 199, 89, 0.14))`,O=`light-dark(rgba(11, 122, 56, 0.10), rgba(52, 199, 89, 0.12))`,k=`light-dark(rgba(1, 113, 227, 0.10), rgba(76, 158, 255, 0.14))`,se=`
.tpl-field-service-dispatch-radar {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
}
.tpl-field-service-dispatch-radar .fsd-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.tpl-field-service-dispatch-radar button:focus-visible {
  outline: 2px solid ${v};
  outline-offset: 2px;
}
.tpl-field-service-dispatch-radar .fsd-num { font-variant-numeric: tabular-nums; }
.tpl-field-service-dispatch-radar .fsd-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ---- header ----------------------------------------------------------- */
.tpl-field-service-dispatch-radar .fsd-header-row {
  min-height: 56px;
  padding: var(--spacing-2) var(--spacing-4);
  box-sizing: border-box;
}
.tpl-field-service-dispatch-radar .fsd-brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${v};
  color: ${y};
  flex-shrink: 0;
}
.tpl-field-service-dispatch-radar .fsd-clock-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  border: var(--border-width) solid ${v};
  color: ${v};
  background: ${b};
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

/* ---- map region ----------------------------------------------------------- */
.tpl-field-service-dispatch-radar .fsd-map-col {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.tpl-field-service-dispatch-radar .fsd-map-col.fsd-map-col-stacked { overflow-y: auto; }
.tpl-field-service-dispatch-radar .fsd-map-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: var(--spacing-2) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
}
.tpl-field-service-dispatch-radar .fsd-legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 14px;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.tpl-field-service-dispatch-radar .fsd-legend .fsd-swatch {
  display: inline-block;
  width: 14px;
  height: 3px;
  border-radius: 2px;
  margin-right: 5px;
  vertical-align: 3px;
}
.tpl-field-service-dispatch-radar .fsd-legend .fsd-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
}
.tpl-field-service-dispatch-radar .fsd-map-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  position: relative;
  background: var(--color-background-body);
}
/* The SVG scales to the pane; pin buttons overlay it in the SAME percent
   space so hit targets stay ≥40px at any width. min-width keeps the 390px
   embed legible by allowing a horizontal scroll instead of a squeeze. */
.tpl-field-service-dispatch-radar .fsd-map-stage {
  position: relative;
  min-width: 560px;
}
.tpl-field-service-dispatch-radar .fsd-map-stage svg { display: block; width: 100%; height: auto; }
.tpl-field-service-dispatch-radar .fsd-pin {
  position: absolute;
  width: 40px;
  height: 40px;
  transform: translate(-50%, -50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
.tpl-field-service-dispatch-radar .fsd-pin-core {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 2.5px solid var(--color-text-secondary);
  background: var(--color-background-surface);
  box-sizing: border-box;
}
.tpl-field-service-dispatch-radar .fsd-pin[aria-pressed='true'] .fsd-pin-core {
  box-shadow: 0 0 0 3px ${b}, 0 0 0 5px ${v};
}
@media (hover: hover) {
  .tpl-field-service-dispatch-radar .fsd-pin:hover .fsd-pin-core {
    box-shadow: 0 0 0 4px ${b};
  }
}
.tpl-field-service-dispatch-radar .fsd-pin-label {
  position: absolute;
  top: 34px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-secondary);
  background: var(--color-background-body);
  padding: 0 4px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  font-variant-numeric: tabular-nums;
}

/* ---- dispatch column -------------------------------------------------------- */
.tpl-field-service-dispatch-radar .fsd-dispatch {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.tpl-field-service-dispatch-radar .fsd-dispatch-stacked {
  height: auto;
  border-top: var(--border-width) solid var(--color-border);
}
.tpl-field-service-dispatch-radar .fsd-posture {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 32px;
  padding: var(--spacing-2) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
  flex-wrap: wrap;
}
.tpl-field-service-dispatch-radar .fsd-posture-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.tpl-field-service-dispatch-radar .fsd-dispatch-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-3) var(--spacing-4) var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.tpl-field-service-dispatch-radar .fsd-dispatch-stacked .fsd-dispatch-scroll { overflow-y: visible; }

/* ---- lanes ------------------------------------------------------------------ */
.tpl-field-service-dispatch-radar .fsd-lane {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  background: var(--color-background-surface);
  overflow: hidden;
}
.tpl-field-service-dispatch-radar .fsd-lane-header {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  box-sizing: border-box;
  padding: 4px 12px;
  border-bottom: var(--border-width) solid var(--color-border);
  border-left: 4px solid transparent;
}
.tpl-field-service-dispatch-radar .fsd-lane-title {
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-field-service-dispatch-radar .fsd-lane-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
}
.tpl-field-service-dispatch-radar .fsd-skill-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 7px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
/* Stop rows — 56px, the whole row is the select button. */
.tpl-field-service-dispatch-radar .fsd-stop {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 56px;
  box-sizing: border-box;
  padding: 6px 12px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.tpl-field-service-dispatch-radar .fsd-lane .fsd-stop:last-child { border-bottom: none; }
.tpl-field-service-dispatch-radar .fsd-stop[aria-pressed='true'] { background: ${b}; }
@media (hover: hover) {
  .tpl-field-service-dispatch-radar .fsd-stop:hover { background: var(--color-background-muted); }
  .tpl-field-service-dispatch-radar .fsd-stop[aria-pressed='true']:hover { background: ${b}; }
}
.tpl-field-service-dispatch-radar .fsd-seq {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  color: var(--color-text-secondary);
  border: var(--border-width) solid var(--color-border);
  font-variant-numeric: tabular-nums;
}
.tpl-field-service-dispatch-radar .fsd-stop-main { min-width: 0; flex: 1; }
.tpl-field-service-dispatch-radar .fsd-stop-site {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-field-service-dispatch-radar .fsd-stop-meta {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
}
.tpl-field-service-dispatch-radar .fsd-stop-end {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  flex-shrink: 0;
}
.tpl-field-service-dispatch-radar .fsd-sla-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.tpl-field-service-dispatch-radar .fsd-sla-ok { color: ${S}; background: ${D}; }
.tpl-field-service-dispatch-radar .fsd-sla-tight { color: ${C}; background: ${T}; }
.tpl-field-service-dispatch-radar .fsd-sla-miss { color: ${w}; background: ${E}; }
.tpl-field-service-dispatch-radar .fsd-parts-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.tpl-field-service-dispatch-radar .fsd-parts-depot { color: ${C}; border-color: ${C}; }

/* ---- reroute row -------------------------------------------------------------- */
.tpl-field-service-dispatch-radar .fsd-reroute {
  padding: 8px 12px 10px;
  border-bottom: var(--border-width) solid var(--color-border);
  background: var(--color-background-muted);
}
.tpl-field-service-dispatch-radar .fsd-reroute-title {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
}
.tpl-field-service-dispatch-radar .fsd-reroute-targets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tpl-field-service-dispatch-radar .fsd-target {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
}
.tpl-field-service-dispatch-radar .fsd-target-blocked {
  color: var(--color-text-secondary);
  border-style: dashed;
}
.tpl-field-service-dispatch-radar .fsd-target-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.tpl-field-service-dispatch-radar .fsd-refusal {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 6px;
  font-size: 11px;
  font-weight: 600;
  color: ${w};
}
.tpl-field-service-dispatch-radar .fsd-refusal svg { flex-shrink: 0; margin-top: 1px; }

/* ---- responsive subtraction (fires in fullscreen + the 390px embed) ------- */
@media (max-width: 480px) {
  .tpl-field-service-dispatch-radar .fsd-parts-chip { display: none; }
  .tpl-field-service-dispatch-radar .fsd-stop-site { max-width: 150px; }
}
@media (prefers-reduced-motion: no-preference) {
  .tpl-field-service-dispatch-radar .fsd-stop,
  .tpl-field-service-dispatch-radar .fsd-target,
  .tpl-field-service-dispatch-radar .fsd-pin-core {
    transition: background-color 140ms ease, box-shadow 140ms ease;
  }
}
`,ce=`13:05`,A=785,j=2,M=14,N=20;function P(e){let[t,n]=e.split(`:`);return Number(t)*60+Number(n)}function F(e){let t=Math.floor(e/60),n=e%60;return`${t}:${String(n).padStart(2,`0`)}`}function I(e){return e<0?`−${Math.abs(e)}m`:`+${e}m`}var L={hvac:`HVAC`,refrigeration:`Refrigeration`,electrical:`Electrical`},R=[{id:`t-priya`,name:`Priya Raman`,unit:`FB-07`,skills:[`hvac`,`refrigeration`],pos:{x:3,y:3},vanParts:[`CR-220`,`FM-4`],closedToday:3},{id:`t-marcus`,name:`Marcus Bell`,unit:`FB-03`,skills:[`hvac`,`electrical`],pos:{x:14,y:4},vanParts:[`CT-40`,`FM-4`],closedToday:2},{id:`t-elena`,name:`Elena Sosa`,unit:`FB-11`,skills:[`refrigeration`,`electrical`],pos:{x:8,y:11},vanParts:[`CR-220`,`TX-9`],closedToday:2}],z=new Map(R.map(e=>[e.id,e]));function B(e,t,n,r,i,a,o,s,c){return{id:e,site:t,symptom:n,pos:{x:r,y:i},due:a,dueMin:P(a),serviceMin:o,skill:s,part:c}}var V=[B(`J-1841`,`Marlowe & Finch Bakery`,`display case at 52°F`,5,4,`13:50`,35,`refrigeration`,`CR-220`),B(`J-1846`,`Northgate Dental Suites`,`RTU short-cycling`,7,7,`15:30`,40,`hvac`,`FM-4`),B(`J-1843`,`Beacon Storage — Unit 4`,`gate controller dead`,16,6,`13:40`,25,`electrical`,`CT-40`),B(`J-1847`,`Aldergate Offices RTU-2`,`no cooling, floors 3–5`,18,9,`16:00`,45,`hvac`,`FM-4`),B(`J-1842`,`Verano Grocery walk-in`,`walk-in at 46°F, rising`,9,9,`13:45`,45,`refrigeration`,`CR-220`),B(`J-1845`,`Pier 9 Icehouse`,`brine loop pressure fault`,4,12,`14:30`,30,`refrigeration`,`TX-9`),B(`J-1849`,`Cobalt Labs server room`,`CRAC unit breaker trips`,13,12,`15:00`,35,`electrical`,`CT-40`),B(`J-1850`,`The Wintergarden Conservatory at Halloran Municipal Park — Annex B`,`misting chiller offline`,11,3,`16:30`,30,`refrigeration`,`CR-220`)],le=new Map(V.map(e=>[e.id,e])),ue={"J-1841":`t-priya`,"J-1846":`t-priya`,"J-1843":`t-marcus`,"J-1847":`t-marcus`,"J-1842":`t-elena`,"J-1845":`t-elena`,"J-1849":`t-elena`,"J-1850":`incoming`};function H(e){return e<0?`miss`:e<N?`tight`:`ok`}function U(e,t){let n=[...t].sort((e,t)=>e.dueMin-t.dueMin),r=e.pos,i=A;return n.map((t,n)=>{let a=(Math.abs(r.x-t.pos.x)+Math.abs(r.y-t.pos.y))*j,o=!e.vanParts.includes(t.part),s=i+a+(o?M:0),c=s+t.serviceMin,l=t.dueMin-s;return r=t.pos,i=c,{job:t,seq:n+1,travelMin:a,needsDepot:o,arriveMin:s,departMin:c,slackMin:l,risk:H(l)}})}function de(e){let t={},n=new Map,r={ok:0,tight:0,miss:0};for(let i of R){let a=U(i,V.filter(t=>e[t.id]===i.id));t[i.id]=a;for(let e of a)n.set(e.job.id,{techId:i.id,stop:e}),r[e.risk]+=1}return{routes:t,incoming:V.filter(t=>e[t.id]===`incoming`),stopByJobId:n,counts:r}}function W(e,t,n){return U(e,V.filter(r=>r.id===t.id||n[r.id]===e.id)).find(e=>e.job.id===t.id)}var G=800,K=560,q=38,J=20;function Y(e){return J+e*q}function fe(e){return`${(Y(e)/G*100).toFixed(3)}%`}function pe(e){return`${(Y(e)/K*100).toFixed(3)}%`}var X={x:10,y:7};function me(e,t){let n=[],r=e.pos;for(let e of t)e.needsDepot?(n.push({x1:r.x,y1:r.y,x2:X.x,y2:X.y,dashed:!0}),n.push({x1:X.x,y1:X.y,x2:e.job.pos.x,y2:e.job.pos.y,dashed:!0})):n.push({x1:r.x,y1:r.y,x2:e.job.pos.x,y2:e.job.pos.y,dashed:!1}),r=e.job.pos;return n}var he={ok:S,tight:C,miss:w};function ge(){return(0,_.jsxs)(`svg`,{width:`18`,height:`18`,viewBox:`0 0 18 18`,"aria-hidden":`true`,focusable:`false`,children:[(0,_.jsx)(`circle`,{cx:`9`,cy:`9`,r:`7`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`}),(0,_.jsx)(`path`,{d:`M9 9 L9 2 A7 7 0 0 1 15.06 5.5 Z`,fill:`currentColor`,opacity:`0.85`}),(0,_.jsx)(`circle`,{cx:`12.1`,cy:`11.8`,r:`1.7`,fill:`currentColor`})]})}function _e({board:e,selectedJobId:t,onSelectJob:n}){return(0,_.jsxs)(`div`,{className:`fsd-map-stage`,children:[(0,_.jsxs)(`svg`,{viewBox:`0 0 ${G} ${K}`,role:`img`,"aria-label":`Schematic map of sector NE-4 with technician routes and job pins`,children:[Array.from({length:21},(e,t)=>(0,_.jsx)(`line`,{x1:Y(t),y1:J,x2:Y(t),y2:K-J,stroke:`var(--color-border)`,strokeWidth:t%5==0?1.4:.6},`v${t}`)),Array.from({length:15},(e,t)=>(0,_.jsx)(`line`,{x1:J,y1:Y(t),x2:G-J,y2:Y(t),stroke:`var(--color-border)`,strokeWidth:t%5==0?1.4:.6},`h${t}`)),(0,_.jsx)(`rect`,{x:Y(9.5),y:Y(1.5),width:3*q,height:3*q,rx:12,fill:O}),(0,_.jsx)(`text`,{x:Y(11),y:Y(1.5)+16,textAnchor:`middle`,fontSize:`10`,fontWeight:`600`,fill:`var(--color-text-secondary)`,children:`Halloran Park`}),(0,_.jsx)(`rect`,{x:J,y:Y(12.8),width:G-J*2,height:1.2*q,fill:k}),(0,_.jsx)(`text`,{x:30,y:Y(12.8)+26,fontSize:`10`,fontWeight:`600`,fill:`var(--color-text-secondary)`,children:`Quayle Canal`}),R.map(t=>me(t,e.routes[t.id]).map((e,n)=>(0,_.jsx)(`line`,{x1:Y(e.x1),y1:Y(e.y1),x2:Y(e.x2),y2:Y(e.y2),stroke:x[t.id],strokeWidth:2.5,strokeLinecap:`round`,strokeDasharray:e.dashed?`7 5`:void 0},`${t.id}-leg${n}`))),(0,_.jsxs)(`g`,{children:[(0,_.jsx)(`rect`,{x:Y(X.x)-9,y:Y(X.y)-9,width:18,height:18,rx:4,fill:`var(--color-background-surface)`,stroke:`var(--color-text-secondary)`,strokeWidth:1.6}),(0,_.jsx)(`path`,{d:`M ${Y(X.x)-5} ${Y(X.y)+4} V ${Y(X.y)-1} H ${Y(X.x)+5} V ${Y(X.y)+4} M ${Y(X.x)-8} ${Y(X.y)-1} L ${Y(X.x)} ${Y(X.y)-6} L ${Y(X.x)+8} ${Y(X.y)-1}`,fill:`none`,stroke:`var(--color-text-secondary)`,strokeWidth:1.4,strokeLinejoin:`round`}),(0,_.jsx)(`text`,{x:Y(X.x),y:Y(X.y)+24,textAnchor:`middle`,fontSize:`10`,fontWeight:`600`,fill:`var(--color-text-secondary)`,children:`Parts depot`})]}),R.map(e=>(0,_.jsxs)(`g`,{children:[(0,_.jsx)(`rect`,{x:Y(e.pos.x)-7,y:Y(e.pos.y)-7,width:14,height:14,rx:3,transform:`rotate(45 ${Y(e.pos.x)} ${Y(e.pos.y)})`,fill:x[e.id],stroke:`var(--color-background-body)`,strokeWidth:2}),(0,_.jsx)(`text`,{x:Y(e.pos.x),y:Y(e.pos.y)-14,textAnchor:`middle`,fontSize:`10`,fontWeight:`700`,fill:`var(--color-text-secondary)`,children:e.unit})]},`marker-${e.id}`))]}),V.map(r=>{let i=e.stopByJobId.get(r.id),a=i===void 0?`var(--color-text-secondary)`:he[i.stop.risk],o=i===void 0?`incoming, unassigned`:`assigned to ${z.get(i.techId)?.name??``}, arrives ${F(i.stop.arriveMin)}, ${i.stop.slackMin<0?`${Math.abs(i.stop.slackMin)} minutes past SLA`:`${i.stop.slackMin} minutes inside SLA`}`;return(0,_.jsxs)(`button`,{type:`button`,className:`fsd-btn fsd-pin`,style:{left:fe(r.pos.x),top:pe(r.pos.y)},"aria-pressed":t===r.id,"aria-label":`${r.id} — ${r.site}: ${o}. Select to reroute.`,onClick:()=>n(r.id),children:[(0,_.jsx)(`span`,{className:`fsd-pin-core`,style:{borderColor:a}}),(0,_.jsx)(`span`,{className:`fsd-pin-label`,"aria-hidden":`true`,children:r.id})]},`pin-${r.id}`)})]})}function Z({dueMin:e,slackMin:t,risk:n}){return(0,_.jsxs)(`span`,{className:n===`miss`?`fsd-sla-chip fsd-sla-miss`:n===`tight`?`fsd-sla-chip fsd-sla-tight`:`fsd-sla-chip fsd-sla-ok`,children:[n===`miss`&&(0,_.jsx)(i,{icon:u,size:`xsm`,color:`inherit`}),`due `,F(e),` · `,I(t)]})}function Q({partId:e,onVan:t,needsDepot:n}){return n?(0,_.jsx)(d,{content:`${e} is not on this van — the route doglegs through the parts depot (+${M}m).`,children:(0,_.jsxs)(`span`,{className:`fsd-parts-chip fsd-parts-depot`,children:[(0,_.jsx)(i,{icon:o,size:`xsm`,color:`inherit`}),e,` · depot +`,M,`m`]})}):(0,_.jsxs)(`span`,{className:`fsd-parts-chip`,children:[(0,_.jsx)(i,{icon:o,size:`xsm`,color:`inherit`}),e,` · `,t?`on van`:`needed`]})}function $({jobItem:e,currentTechId:t,assignments:n,refusal:r,onReroute:o}){let s=R.filter(e=>e.id!==t);return(0,_.jsxs)(`div`,{className:`fsd-reroute`,children:[(0,_.jsxs)(`div`,{className:`fsd-reroute-title`,children:[t===null?`Assign to`:`Reroute to`,` — `,e.id,` ·`,` `,L[e.skill],` · needs `,e.part]}),(0,_.jsx)(`div`,{className:`fsd-reroute-targets`,children:s.map(t=>{if(!t.skills.includes(e.skill))return(0,_.jsxs)(`button`,{type:`button`,className:`fsd-target fsd-target-blocked`,"aria-label":`${t.name} is not ${L[e.skill]}-certified — selecting explains the refusal`,onClick:()=>o(e.id,t.id),children:[(0,_.jsx)(`span`,{className:`fsd-target-dot`,style:{background:x[t.id]}}),t.name,` · not `,L[e.skill],`-certified`]},t.id);let r=W(t,e,n),s=r===void 0?``:`arr ${F(r.arriveMin)} · ${I(r.slackMin)}${r.needsDepot?` · depot +${M}m`:``}`;return(0,_.jsxs)(`button`,{type:`button`,className:`fsd-target`,"aria-label":`Move ${e.id} to ${t.name} — projected arrival ${r===void 0?`unknown`:F(r.arriveMin)}`,onClick:()=>o(e.id,t.id),children:[(0,_.jsx)(`span`,{className:`fsd-target-dot`,style:{background:x[t.id]}}),t.name,(0,_.jsx)(i,{icon:a,size:`xsm`,color:`inherit`}),(0,_.jsx)(`span`,{className:`fsd-num`,children:s})]},t.id)})}),r!==null&&r.jobId===e.id&&(0,_.jsxs)(`div`,{className:`fsd-refusal`,role:`status`,children:[(0,_.jsx)(i,{icon:u,size:`xsm`,color:`inherit`}),r.reason]})]})}function ve({stop:e,isSelected:t,onVan:n,onSelect:r}){return(0,_.jsxs)(`button`,{type:`button`,className:`fsd-btn fsd-stop`,"aria-pressed":t,"aria-expanded":t,"aria-label":`${e.job.id} — ${e.job.site}: arrives ${F(e.arriveMin)}, due ${e.job.due}, ${e.slackMin<0?`${Math.abs(e.slackMin)} minutes past SLA`:`${e.slackMin} minutes of slack`}. Select to reroute.`,onClick:()=>r(e.job.id),children:[(0,_.jsx)(`span`,{className:`fsd-seq`,children:e.seq}),(0,_.jsxs)(`span`,{className:`fsd-stop-main`,children:[(0,_.jsx)(`span`,{className:`fsd-stop-site`,children:e.job.site}),(0,_.jsxs)(`span`,{className:`fsd-stop-meta`,children:[e.job.id,` · `,e.job.symptom,` · svc `,e.job.serviceMin,`m · travel`,` `,e.travelMin,`m`]})]}),(0,_.jsxs)(`span`,{className:`fsd-stop-end`,children:[(0,_.jsxs)(`span`,{className:`fsd-num`,style:{fontSize:12,fontWeight:700},children:[`arr `,F(e.arriveMin)]}),(0,_.jsx)(Z,{dueMin:e.job.dueMin,slackMin:e.slackMin,risk:e.risk}),(0,_.jsx)(Q,{partId:e.job.part,onVan:n,needsDepot:e.needsDepot})]})]})}function ye({jobItem:e,isSelected:t,onSelect:n}){let r=e.dueMin-A;return(0,_.jsxs)(`button`,{type:`button`,className:`fsd-btn fsd-stop`,"aria-pressed":t,"aria-expanded":t,"aria-label":`${e.id} — ${e.site}: unassigned, due ${e.due}. Select to assign a tech.`,onClick:()=>n(e.id),children:[(0,_.jsx)(`span`,{className:`fsd-seq`,children:`·`}),(0,_.jsxs)(`span`,{className:`fsd-stop-main`,children:[(0,_.jsx)(`span`,{className:`fsd-stop-site`,children:e.site}),(0,_.jsxs)(`span`,{className:`fsd-stop-meta`,children:[e.id,` · `,e.symptom,` · `,L[e.skill],` · svc`,` `,e.serviceMin,`m`]})]}),(0,_.jsxs)(`span`,{className:`fsd-stop-end`,children:[(0,_.jsxs)(`span`,{className:`fsd-num`,style:{fontSize:12,fontWeight:700},children:[`due in `,r,`m`]}),(0,_.jsx)(Z,{dueMin:e.dueMin,slackMin:r,risk:H(r)}),(0,_.jsx)(Q,{partId:e.part,onVan:!1,needsDepot:!1})]})]})}function be(){let e=oe(`(max-width: 920px)`),[t,n]=(0,g.useState)(ue),[a,o]=(0,g.useState)(`J-1849`),[d,v]=(0,g.useState)(null),[y,b]=(0,g.useState)(``),S=(0,g.useMemo)(()=>de(t),[t]),C=R.reduce((e,t)=>e+t.closedToday,0),T=e=>{v(null),o(t=>t===e?null:e)},E=(e,r)=>{let i=le.get(e),a=z.get(r);if(i===void 0||a===void 0)return;if(!a.skills.includes(i.skill)){let t=`${a.name} (${a.unit}) is not ${L[i.skill]}-certified — reroute blocked. ${i.id} stays put.`;v({jobId:e,techId:r,reason:t}),b(t);return}let o=t[e]===`incoming`,s=W(a,i,t);n(t=>({...t,[e]:r})),v(null),s!==void 0&&b(`${e} ${o?`assigned`:`rerouted`} to ${a.name} — arrives ${F(s.arriveMin)}, ${s.slackMin<0?`${Math.abs(s.slackMin)} minutes past SLA`:`${s.slackMin} minutes inside SLA`}${s.needsDepot?`, includes a ${M}-minute depot pickup`:``}. Routes redrawn.`)},D=a===null?void 0:t[a],O=(0,_.jsx)(m,{children:(0,_.jsx)(`div`,{className:`fsd-header-row`,children:(0,_.jsxs)(f,{gap:3,vAlign:`center`,wrap:`wrap`,children:[(0,_.jsx)(`span`,{className:`fsd-brand-mark`,children:(0,_.jsx)(ge,{})}),(0,_.jsx)(p,{size:`fill`,style:{minWidth:0},children:(0,_.jsxs)(te,{gap:0,children:[(0,_.jsxs)(f,{gap:2,vAlign:`center`,wrap:`wrap`,children:[(0,_.jsx)(ae,{level:1,children:`Fieldbeam`}),(0,_.jsx)(h,{label:`Sector NE-4`,variant:`neutral`}),(0,_.jsx)(h,{label:`Harborline grid`,variant:`neutral`})]}),(0,_.jsxs)(r,{type:`supporting`,color:`secondary`,hasTabularNumbers:!0,children:[`3 techs on shift · `,V.length,` open jobs · `,C,` closed today`]})]})}),(0,_.jsxs)(`span`,{className:`fsd-clock-chip`,children:[(0,_.jsx)(i,{icon:s,size:`xsm`,color:`inherit`}),`Board `,ce]})]})})}),k=(0,_.jsxs)(`div`,{className:`fsd-map-toolbar`,children:[(0,_.jsx)(r,{type:`label`,children:`Territory — schematic`}),(0,_.jsx)(p,{size:`fill`}),(0,_.jsxs)(`div`,{className:`fsd-legend`,"aria-label":`Map legend`,children:[R.map(e=>(0,_.jsxs)(`span`,{children:[(0,_.jsx)(`span`,{className:`fsd-swatch`,style:{background:x[e.id]}}),e.unit]},`legend-${e.id}`)),(0,_.jsxs)(`span`,{children:[(0,_.jsx)(`span`,{className:`fsd-dot`,style:{background:w}}),`SLA risk`]}),(0,_.jsxs)(`span`,{children:[(0,_.jsx)(i,{icon:c,size:`xsm`,color:`inherit`}),`\xA0dashed = depot pickup +`,M,`m`]})]})]}),j=(0,_.jsx)(`div`,{className:`fsd-map-scroll`,children:(0,_.jsx)(_e,{board:S,selectedJobId:a,onSelectJob:T})}),N=(0,_.jsxs)(`div`,{className:`fsd-posture`,children:[(0,_.jsxs)(`span`,{className:`fsd-posture-chip fsd-sla-ok`,children:[(0,_.jsx)(i,{icon:ee,size:`xsm`,color:`inherit`}),S.counts.ok,` on track`]}),(0,_.jsxs)(`span`,{className:`fsd-posture-chip fsd-sla-tight`,children:[(0,_.jsx)(i,{icon:s,size:`xsm`,color:`inherit`}),S.counts.tight,` tight`]}),(0,_.jsxs)(`span`,{className:`fsd-posture-chip fsd-sla-miss`,children:[(0,_.jsx)(i,{icon:u,size:`xsm`,color:`inherit`}),S.counts.miss,` at risk`]}),(0,_.jsx)(p,{size:`fill`}),(0,_.jsxs)(r,{type:`supporting`,color:`secondary`,hasTabularNumbers:!0,children:[S.incoming.length,` incoming`]})]}),P=(0,_.jsxs)(`div`,{className:`fsd-dispatch${e?` fsd-dispatch-stacked`:``}`,children:[N,(0,_.jsxs)(`div`,{className:`fsd-dispatch-scroll`,children:[S.incoming.length>0&&(0,_.jsxs)(`div`,{className:`fsd-lane`,children:[(0,_.jsxs)(`div`,{className:`fsd-lane-header`,children:[(0,_.jsxs)(p,{size:`fill`,style:{minWidth:0},children:[(0,_.jsx)(`div`,{className:`fsd-lane-title`,children:`Incoming — unassigned`}),(0,_.jsxs)(`div`,{className:`fsd-lane-sub`,children:[S.incoming.length,` job`,S.incoming.length===1?``:`s`,` awaiting dispatch`]})]}),(0,_.jsx)(h,{label:String(S.incoming.length),variant:`neutral`})]}),S.incoming.map(e=>(0,_.jsxs)(`div`,{children:[(0,_.jsx)(ye,{jobItem:e,isSelected:a===e.id,onSelect:T}),a===e.id&&(0,_.jsx)($,{jobItem:e,currentTechId:null,assignments:t,refusal:d,onReroute:E})]},e.id))]}),R.map(e=>{let n=S.routes[e.id],o=n.length>0?n[n.length-1].departMin:A;return(0,_.jsxs)(`div`,{className:`fsd-lane`,children:[(0,_.jsxs)(`div`,{className:`fsd-lane-header`,style:{borderLeftColor:x[e.id]},children:[(0,_.jsxs)(p,{size:`fill`,style:{minWidth:0},children:[(0,_.jsxs)(f,{gap:2,vAlign:`center`,children:[(0,_.jsx)(`span`,{className:`fsd-lane-title`,children:e.name}),(0,_.jsx)(h,{label:e.unit,variant:`neutral`})]}),(0,_.jsxs)(`div`,{className:`fsd-lane-sub`,children:[n.length,` stop`,n.length===1?``:`s`,` · clear`,` `,F(o),` · `,e.closedToday,` closed today`]})]}),(0,_.jsx)(f,{gap:1,vAlign:`center`,children:e.skills.map(e=>(0,_.jsxs)(`span`,{className:`fsd-skill-chip`,children:[(0,_.jsx)(i,{icon:l,size:`xsm`,color:`inherit`}),L[e]]},e))})]}),n.length===0?(0,_.jsx)(`div`,{style:{padding:`12px`},children:(0,_.jsx)(r,{type:`supporting`,color:`secondary`,children:`No stops — available for dispatch.`})}):n.map(n=>(0,_.jsxs)(`div`,{children:[(0,_.jsx)(ve,{stop:n,isSelected:a===n.job.id,onVan:e.vanParts.includes(n.job.part),onSelect:T}),a===n.job.id&&D===e.id&&(0,_.jsx)($,{jobItem:n.job,currentTechId:e.id,assignments:t,refusal:d,onReroute:E})]},n.job.id))]},`lane-${e.id}`)})]})]});return(0,_.jsxs)(`div`,{className:`tpl-field-service-dispatch-radar`,children:[(0,_.jsx)(`style`,{children:se}),(0,_.jsx)(ne,{height:`fill`,header:O,content:(0,_.jsx)(re,{padding:0,children:(0,_.jsxs)(`div`,{className:`fsd-map-col${e?` fsd-map-col-stacked`:``}`,children:[(0,_.jsx)(`div`,{"aria-live":`polite`,className:`fsd-visually-hidden`,children:y}),k,j,e&&P]})}),end:e?void 0:(0,_.jsx)(ie,{width:400,padding:0,hasDivider:!0,label:`Dispatch queues`,children:P})})]})}export{be as default};