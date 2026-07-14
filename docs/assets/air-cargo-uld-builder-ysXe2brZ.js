import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-BnkU7x5-.js";import{t as i}from"./Icon-BmUexiPD.js";import{t as a}from"./list-checks-xzv9zOo3.js";import{t as o}from"./lock-CAxym6LF.js";import{t as s}from"./package-BijGbkNh.js";import{t as ee}from"./scale-1GBNsk-3.js";import{t as te}from"./send-BlpVdoyO.js";import{A as c,b as ne,o as l,v as re}from"./index-Z40q0Y4M.js";import{t as ie}from"./HStack-2WTukjNp.js";import{t as u}from"./StackItem-Ca9P7L2I.js";import{n as ae,t as oe}from"./LayoutContent-CCL91W7X.js";import{t as se}from"./LayoutHeader-Cy2mWoMf.js";import{t as ce}from"./Heading-Tiw04pWH.js";import{t as d}from"./Badge-0Tj9omHc.js";import{t as f}from"./Button-C1oieFea.js";var le=c(`plane-takeoff`,[[`path`,{d:`M2 22h20`,key:`272qi7`}],[`path`,{d:`M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12 5 6l.9-.45a2 2 0 0 1 2.09.2l4.02 3a2 2 0 0 0 2.1.2l4.19-2.06a2.41 2.41 0 0 1 1.73-.17L21 7a1.4 1.4 0 0 1 .87 1.99l-.38.76c-.23.46-.6.84-1.07 1.08L7.58 17.2a2 2 0 0 1-1.22.18Z`,key:`fkigj9`}]]),p=e(t(),1),m=n(),h=`tpl-air-cargo-uld-builder`,g=`light-dark(#1D4ED8, #7CA9FF)`,_=`light-dark(#FFFFFF, #0B1B3A)`,v=`light-dark(rgba(29, 78, 216, 0.10), rgba(124, 169, 255, 0.16))`,y=`light-dark(#B91C1C, #F87171)`,b=`light-dark(rgba(185, 28, 28, 0.10), rgba(248, 113, 113, 0.14))`,x=`light-dark(#B45309, #FBBF24)`,S=`light-dark(#15803D, #4ADE80)`,C=`light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))`,w=`var(--font-family-code, ui-monospace, monospace)`,T=86e3,E=24.22,D=22.6,ue=6,de=14e4,fe=54e3,O=50;function k(e){let t=Math.min(1,Math.max(0,(e-T)/(de-T)));return{fwdPct:11+3*t,aftPct:32-4*t}}var A=(e,t,n)=>({id:e,deck:`main`,armM:t,limitKg:n,hold:`Main deck`}),j=(e,t,n)=>({id:e,deck:`lower`,armM:t,limitKg:1588,hold:n}),pe=[A(`P1`,7,4500),A(`P2`,11,7200),A(`P3`,15,7200),A(`P4`,19,7200),A(`P5`,23,7200),A(`P6`,27,7200),A(`P7`,31,7200),A(`P8`,35,7200),A(`P9`,39,7200),A(`P10`,43,4500),j(`L1`,10,`Fwd hold`),j(`L2`,13,`Fwd hold`),j(`L3`,16,`Fwd hold`),j(`L4`,33,`Aft hold`),j(`L5`,36,`Aft hold`),j(`L6`,39,`Aft hold`)],M=Object.fromEntries(pe.map(e=>[e.id,e])),N=[[`P1`,`P2`],[`P2`,`P3`],[`P3`,`P4`],[`P4`,`P5`],[`P5`,`P6`],[`P6`,`P7`],[`P7`,`P8`],[`P8`,`P9`],[`P9`,`P10`],[`L1`,`L2`],[`L2`,`L3`],[`L4`,`L5`],[`L5`,`L6`]],P=[{id:`s-stampings`,awb:`618-4027 1013`,commodity:`Automotive stampings, returnable racks`,weightKg:4860,uld:`PMC`,hazClass:null,hazLabel:null,priority:`General`},{id:`s-salmon`,awb:`618-4027 1155`,commodity:`Salmon, fresh chilled — keep cool`,weightKg:3240,uld:`PMC`,hazClass:null,hazLabel:null,priority:`Express`},{id:`s-drill`,awb:`618-4030 2211`,commodity:`Oil-field drill collars, steel`,weightKg:5410,uld:`PMC`,hazClass:null,hazLabel:null,priority:`General`},{id:`s-ecomm`,awb:`618-4031 0088`,commodity:`E-commerce mixed parcels`,weightKg:1420,uld:`AKE`,hazClass:null,hazLabel:null,priority:`Express`},{id:`s-tires`,awb:`618-4029 7754`,commodity:`Mining truck tires, 63-inch`,weightKg:4150,uld:`PMC`,hazClass:null,hazLabel:null,priority:`General`},{id:`s-lithium`,awb:`618-4032 4406`,commodity:`Lithium-ion battery modules`,weightKg:2640,uld:`PMC`,hazClass:`9`,hazLabel:`UN 3480 · Lithium ion batteries`,priority:`General`},{id:`s-paint`,awb:`618-4032 4590`,commodity:`Paint & lacquer drums`,weightKg:1980,uld:`PMC`,hazClass:`3`,hazLabel:`UN 1263 · Paint, flammable`,priority:`General`},{id:`s-peroxide`,awb:`618-4033 0127`,commodity:`Hydrogen peroxide 50%, drums`,weightKg:1420,uld:`PMC`,hazClass:`5.1`,hazLabel:`UN 2014 · Oxidizing liquid`,priority:`General`},{id:`s-isotopes`,awb:`618-4033 0312`,commodity:`Medical isotopes, time-critical`,weightKg:310,uld:`AKE`,hazClass:`7`,hazLabel:`UN 2915 · Radioactive, Type A`,priority:`Express`},{id:`s-machine`,awb:`618-4034 6621`,commodity:`Machine tools, crated lathe bed`,weightKg:6850,uld:`PMC`,hazClass:null,hazLabel:null,priority:`General`},{id:`s-apparel`,awb:`618-4034 6702`,commodity:`Apparel cartons, hanging garments`,weightKg:1180,uld:`AKE`,hazClass:null,hazLabel:null,priority:`General`},{id:`s-aog`,awb:`618-4035 1198`,commodity:`Aerospace AOG — IGT combustor spares for Meridian Line MRO, tail N417MC recovery`,weightKg:940,uld:`AKE`,hazClass:null,hazLabel:null,priority:`AOG`}],F=Object.fromEntries(P.map(e=>[e.id,e])),me={P4:`s-stampings`,P5:`s-drill`,P6:`s-salmon`,P7:`s-tires`,L2:`s-ecomm`},I=[`13:11 · Placed 618-4029 7754 → P7 (4,150 kg) · CG 25.3 %MAC`,`13:08 · Placed 618-4031 0088 → L2 (1,420 kg) · CG 25.0 %MAC`,`13:05 · Placed 618-4027 1155 → P6 (3,240 kg) · CG 25.2 %MAC`,`13:03 · Placed 618-4030 2211 → P5 (5,410 kg) · CG 24.7 %MAC`,`13:02 · Placed 618-4027 1013 → P4 (4,860 kg) · CG 25.0 %MAC`],he=794,L=[{a:`3`,b:`5.1`,code:`IATA 9.3.A`,text:`Flammable liquids (3) may not load adjacent to oxidizers (5.1)`},{a:`9`,b:`3`,code:`MC-DG-12`,text:`Lithium batteries (9) not adjacent to flammable liquids (3)`}];function R(e){let t=0,n=T*E;for(let[r,i]of Object.entries(e)){let e=M[r],a=F[i];t+=a.weightKg,n+=a.weightKg*e.armM}let r=T+t,i=n/r,a=(i-D)/ue*100,{fwdPct:o,aftPct:s}=k(r);return{payloadKg:t,zfwKg:r,armM:i,macPct:a,fwdPct:o,aftPct:s,verdict:a<o?`fwd`:a>s?`aft`:`ok`}}function ge(e){let t=[];for(let[n,r]of N){let i=e[n],a=e[r];if(i==null||a==null)continue;let o=F[i],s=F[a];if(!(o.hazClass==null||s.hazClass==null))for(let e of L)(o.hazClass===e.a&&s.hazClass===e.b||o.hazClass===e.b&&s.hazClass===e.a)&&t.push({posA:n,posB:r,shipA:o,shipB:s,rule:e})}return t}var z=e=>e.toLocaleString(`en-US`),B=e=>`${e.toFixed(1)} %MAC`,_e=e=>{let t=Math.floor(e/60)%24,n=e%60;return`${String(t).padStart(2,`0`)}:${String(n).padStart(2,`0`)}`},ve=e=>e/O*100,ye=`
.${h} {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.${h} .acu-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.${h} .acu-btn:disabled { cursor: not-allowed; }
.${h} button:focus-visible {
  outline: 2px solid ${g};
  outline-offset: 2px;
}
.${h} .acu-num { font-variant-numeric: tabular-nums; }
.${h} .acu-mono { font-family: ${w}; }

/* Body: hand-rolled grid instead of LayoutPanel — the 320px queue column
   must drop BELOW the map at phone widths, which a fixed DS rail cannot do.
   Default (stage ~1045px) needs no media query: 1fr + 320. */
.${h} .acu-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  height: 100%;
  min-height: 0;
}
.${h} .acu-main {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}
.${h} .acu-queue {
  min-height: 0;
  border-inline-start: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  background: var(--color-background-card);
}

/* ----- header bits (LayoutHeader owns the 56px band) ----- */
.${h} .acu-cutoff {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  height: 28px;
  padding-inline: var(--spacing-2);
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  color: ${x};
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

/* ----- stat strip: five 72px tiles ----- */
.${h} .acu-stats {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--spacing-2);
}
.${h} .acu-stat {
  height: 72px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  background: var(--color-background-card);
  padding: var(--spacing-2) var(--spacing-3);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  min-width: 0;
}
.${h} .acu-stat-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${h} .acu-stat-value {
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${h} .acu-stat-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${h} .acu-stat.is-danger .acu-stat-value { color: ${y}; }
.${h} .acu-stat.is-ok .acu-stat-value { color: ${S}; }

/* ----- section bars: 34px label rows over each region ----- */
.${h} .acu-section {
  height: 34px;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}
.${h} .acu-section h2 {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  margin: 0;
}
.${h} .acu-section .acu-section-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

/* ----- deck canvas: fixed 250px stage; slots are absolute buttons whose
   x-centers derive from physical arms (arm / 50 m → %), so the map stays
   registered with the stretched fuselage SVG at every width. ----- */
.${h} .acu-deck-wrap {
  position: relative;
  height: 250px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  background: var(--color-background-muted);
  overflow: hidden;
}
.${h} .acu-deck-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.${h} .acu-slot {
  position: absolute;
  transform: translateX(-50%);
  border: var(--border-width) solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background-card);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  font: inherit;
  padding: 0;
  cursor: pointer;
  line-height: 1.2;
}
/* main-deck slots 48 tall / lower-deck slots 36 tall */
.${h} .acu-slot--main { top: 74px; height: 48px; width: 7.2%; }
.${h} .acu-slot--lower { top: 150px; height: 36px; width: 5.4%; }
.${h} .acu-slot-id {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
}
.${h} .acu-slot-wt {
  font-size: 10px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  max-width: 92%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${h} .acu-slot.is-occupied {
  background: light-dark(rgba(29, 78, 216, 0.06), rgba(124, 169, 255, 0.10));
  border-color: light-dark(#93A8E8, #4A5E8F);
}
.${h} .acu-slot.is-eligible {
  border: 2px dashed ${g};
  background: ${v};
}
.${h} .acu-slot.is-eligible .acu-slot-id { color: ${g}; }
.${h} .acu-slot.is-inspected {
  border-color: ${g};
  box-shadow: inset 0 0 0 1px ${g};
}
.${h} .acu-slot.is-violation {
  border-color: ${y};
  box-shadow: inset 0 0 0 1px ${y};
  background: ${b};
}
.${h} .acu-slot:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.${h} .acu-slot-flag {
  position: absolute;
  top: -7px;
  right: -6px;
  color: ${y};
  display: inline-flex;
}
/* hazmat diamond glyph — rotated square, class number set upright */
.${h} .acu-haz {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  flex: none;
}
.${h} .acu-deck-legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-3);
  font-size: 11px;
  color: var(--color-text-secondary);
  align-items: center;
}
.${h} .acu-legend-swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  margin-inline-end: 4px;
  vertical-align: -2px;
}

/* ----- inspect strip: 56px, appears under the map for an occupied slot ----- */
.${h} .acu-inspect {
  min-height: 56px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  background: var(--color-background-card);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding-inline: var(--spacing-3);
  padding-block: var(--spacing-2);
}
.${h} .acu-inspect-main {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.${h} .acu-inspect-title {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${h} .acu-inspect-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ----- envelope band: 340px chart + readiness panel ----- */
.${h} .acu-band {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: var(--spacing-3);
  align-items: stretch;
}
.${h} .acu-envelope,
.${h} .acu-readiness {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  background: var(--color-background-card);
  padding: var(--spacing-3);
  min-width: 0;
}
.${h} .acu-envelope svg { display: block; width: 100%; height: auto; }
.${h} .acu-chart-grid { stroke: var(--color-border); stroke-width: 1; }
.${h} .acu-chart-label {
  fill: var(--color-text-secondary);
  font-size: 9px;
  font-family: ${w};
}
.${h} .acu-chart-env {
  fill: ${v};
  stroke: ${g};
  stroke-width: 1.5;
}
.${h} .acu-verdict {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  height: 24px;
  padding-inline: var(--spacing-2);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.${h} .acu-verdict.is-ok { color: ${S}; background: ${C}; }
.${h} .acu-verdict.is-bad { color: ${y}; background: ${b}; }

/* readiness rows + violations + build log */
.${h} .acu-check-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 32px;
  font-size: 13px;
}
.${h} .acu-check-row .acu-check-detail {
  color: var(--color-text-secondary);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  margin-inline-start: auto;
  text-align: end;
}
.${h} .acu-viol {
  border: var(--border-width) solid ${y};
  background: ${b};
  border-radius: 6px;
  padding: var(--spacing-2);
  font-size: 12px;
  display: flex;
  gap: var(--spacing-2);
  align-items: flex-start;
}
.${h} .acu-viol strong { font-variant-numeric: tabular-nums; }
.${h} .acu-log {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-family: ${w};
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.${h} .acu-log li {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ----- queue panel: 320px, 64px rows ----- */
.${h} .acu-queue-head {
  height: 34px;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding-inline: var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  flex: none;
}
.${h} .acu-queue-list {
  overflow-y: auto;
  min-height: 0;
  flex: 1;
}
.${h} .acu-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  width: 100%;
  min-height: 64px;
  padding-inline: var(--spacing-3);
  padding-block: var(--spacing-2);
  border-bottom: var(--border-width) solid var(--color-border);
  cursor: pointer;
}
@media (hover: hover) {
  .${h} .acu-row:hover:not(:disabled) {
    background: var(--color-background-muted);
  }
}
.${h} .acu-row.is-selected {
  box-shadow: inset 3px 0 0 ${g};
  background: ${v};
}
.${h} .acu-row:disabled { opacity: 0.55; cursor: not-allowed; }
.${h} .acu-row-main {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.${h} .acu-row-awb {
  font-family: ${w};
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  white-space: nowrap;
}
.${h} .acu-row-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${h} .acu-row-wt {
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${h} .acu-uld-chip {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  border: var(--border-width) solid var(--color-border);
  border-radius: 4px;
  padding: 1px 4px;
  color: var(--color-text-secondary);
  flex: none;
}
.${h} .acu-queue-hint {
  padding: var(--spacing-3);
  font-size: 12px;
  color: var(--color-text-secondary);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${h} .acu-queue-empty {
  padding: var(--spacing-5) var(--spacing-3);
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.${h} .acu-aog {
  color: ${y};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

/* panel titles inside envelope/readiness panels */
.${h} .acu-panel-title {
  margin: 0 0 var(--spacing-2) 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.${h} .acu-deck-label {
  position: absolute;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--color-text-secondary);
  pointer-events: none;
}

/* live status line under the map */
.${h} .acu-status {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  min-height: 18px;
}

/* ----- responsive: subtraction, not squeeze ----- */
@media (max-width: 880px) {
  .${h} { height: auto; min-height: 100dvh; }
  .${h} .acu-body { grid-template-columns: minmax(0, 1fr); height: auto; }
  .${h} .acu-main { overflow-y: visible; }
  .${h} .acu-queue {
    border-inline-start: none;
    border-top: var(--border-width) solid var(--color-border);
  }
  .${h} .acu-queue-list { max-height: 380px; }
  .${h} .acu-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 480px) {
  .${h} .acu-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .${h} .acu-band { grid-template-columns: minmax(0, 1fr); }
  /* subtraction: slots keep only their id at phone widths */
  .${h} .acu-slot-wt { display: none; }
  .${h} .acu-leg-readout { display: none; }
}
@media (prefers-reduced-motion: no-preference) {
  .${h} .acu-slot { transition: background-color 150ms ease, border-color 150ms ease; }
  .${h} .acu-cg-marker { transition: cx 220ms ease, cy 220ms ease; }
}
`;function be(){return(0,m.jsxs)(`svg`,{width:22,height:22,viewBox:`0 0 22 22`,"aria-hidden":!0,focusable:`false`,children:[(0,m.jsx)(`rect`,{x:1,y:1,width:20,height:20,rx:5,fill:g}),(0,m.jsx)(`rect`,{x:4.5,y:6,width:13,height:4,rx:1,fill:_,opacity:.92}),(0,m.jsx)(`rect`,{x:4.5,y:12.5,width:8,height:3,rx:1,fill:_,opacity:.6}),(0,m.jsx)(`circle`,{cx:16,cy:14,r:2.1,fill:_})]})}function V({cls:e}){return(0,m.jsx)(`span`,{className:`acu-haz`,title:`DG class ${e}`,children:(0,m.jsxs)(`svg`,{width:14,height:14,viewBox:`0 0 14 14`,"aria-hidden":!0,focusable:`false`,children:[(0,m.jsx)(`rect`,{x:2.4,y:2.4,width:9.2,height:9.2,rx:1.2,transform:`rotate(45 7 7)`,fill:`none`,stroke:x,strokeWidth:1.5}),(0,m.jsx)(`text`,{x:7,y:9.1,textAnchor:`middle`,fontSize:e.length>1?4.6:6,fontWeight:700,fill:x,fontFamily:`var(--font-family-sans)`,children:e})]})})}function xe(){return(0,m.jsxs)(`svg`,{className:`acu-deck-svg`,viewBox:`0 0 1000 250`,preserveAspectRatio:`none`,"aria-hidden":!0,focusable:`false`,children:[(0,m.jsx)(`path`,{d:`M 14 130
           C 22 84 60 58 116 54
           L 852 54
           C 916 58 962 84 990 118
           L 990 126
           C 946 168 892 194 820 200
           L 100 200
           C 48 194 20 166 14 138
           Z`,fill:`var(--color-background-card)`,stroke:`var(--color-border)`,strokeWidth:1.5,vectorEffect:`non-scaling-stroke`}),(0,m.jsx)(`path`,{d:`M 872 56 L 948 8 L 972 8 L 934 62 Z`,fill:`var(--color-background-muted)`,stroke:`var(--color-border)`,strokeWidth:1.5,vectorEffect:`non-scaling-stroke`}),(0,m.jsx)(`path`,{d:`M 44 92 L 86 78 L 96 92 L 52 104 Z`,fill:`var(--color-border)`,opacity:.7}),(0,m.jsx)(`line`,{x1:30,y1:140,x2:968,y2:140,stroke:`var(--color-border)`,strokeDasharray:`5 4`,strokeWidth:1,vectorEffect:`non-scaling-stroke`}),(0,m.jsx)(`path`,{d:`M 400 140 L 620 140 L 592 200 L 428 200 Z`,fill:`var(--color-background-muted)`,stroke:`var(--color-border)`,strokeWidth:1,vectorEffect:`non-scaling-stroke`}),(0,m.jsx)(`circle`,{cx:520,cy:216,r:9,fill:`none`,stroke:`var(--color-border)`,strokeWidth:1.5,vectorEffect:`non-scaling-stroke`}),(0,m.jsx)(`circle`,{cx:548,cy:216,r:9,fill:`none`,stroke:`var(--color-border)`,strokeWidth:1.5,vectorEffect:`non-scaling-stroke`}),(0,m.jsx)(`circle`,{cx:92,cy:216,r:7,fill:`none`,stroke:`var(--color-border)`,strokeWidth:1.5,vectorEffect:`non-scaling-stroke`})]})}var H=e=>46+(e-8)*(284/28),U=e=>230-(e-8e4)*216/65e3;function Se({balance:e}){let t=[[11,86e3],[14,14e4],[28,14e4],[32,86e3]].map(([e,t])=>`${H(e).toFixed(1)},${U(t).toFixed(1)}`).join(` `),n=H(e.macPct),r=U(e.zfwKg),i=H(27),a=U(T),o=e.verdict!==`ok`,s=o?y:g;return(0,m.jsxs)(`svg`,{viewBox:`0 0 340 260`,role:`img`,"aria-label":`Weight and balance envelope: zero-fuel weight ${z(e.zfwKg)} kilograms at ${e.macPct.toFixed(1)} percent MAC, ${o?`outside`:`inside`} limits`,children:[[9e4,1e5,11e4,12e4,13e4,14e4].map(e=>(0,m.jsxs)(`g`,{children:[(0,m.jsx)(`line`,{className:`acu-chart-grid`,x1:46,y1:U(e),x2:330,y2:U(e),opacity:e===14e4?.9:.45}),(0,m.jsxs)(`text`,{className:`acu-chart-label`,x:40,y:U(e)+3,textAnchor:`end`,children:[e/1e3,`t`]})]},e)),[10,15,20,25,30,35].map(e=>(0,m.jsxs)(`g`,{children:[(0,m.jsx)(`line`,{className:`acu-chart-grid`,x1:H(e),y1:230,x2:H(e),y2:234}),(0,m.jsxs)(`text`,{className:`acu-chart-label`,x:H(e),y:245,textAnchor:`middle`,children:[e,`%`]})]},e)),(0,m.jsx)(`text`,{className:`acu-chart-label`,x:188,y:257,textAnchor:`middle`,children:`CG · %MAC`}),(0,m.jsx)(`polygon`,{className:`acu-chart-env`,points:t}),(0,m.jsx)(`text`,{className:`acu-chart-label`,x:330,y:U(14e4)-4,textAnchor:`end`,children:`MZFW 140t`}),(0,m.jsx)(`line`,{x1:i,y1:a,x2:n,y2:r,stroke:s,strokeWidth:1,strokeDasharray:`3 3`,opacity:.7}),(0,m.jsx)(`rect`,{x:i-3.5,y:a-3.5,width:7,height:7,fill:`var(--color-background-card)`,stroke:`var(--color-text-secondary)`,strokeWidth:1.2}),(0,m.jsx)(`text`,{className:`acu-chart-label`,x:i+8,y:a+3,children:`OEW`}),(0,m.jsx)(`circle`,{className:`acu-cg-marker`,cx:n,cy:r,r:5.5,fill:s,stroke:`var(--color-background-card)`,strokeWidth:1.5})]})}function Ce({shipment:e,isSelected:t,isDisabled:n,onSelect:r}){return(0,m.jsxs)(`button`,{type:`button`,className:`acu-btn acu-row${t?` is-selected`:``}`,"aria-pressed":t,disabled:n,"aria-label":`${e.awb}, ${e.commodity}, ${z(e.weightKg)} kilograms, ${e.uld} unit${e.hazClass==null?``:`, dangerous goods class ${e.hazClass}`}`,onClick:()=>r(e.id),children:[(0,m.jsxs)(`div`,{className:`acu-row-main`,children:[(0,m.jsxs)(`span`,{className:`acu-row-awb`,children:[e.awb,e.hazClass!=null&&(0,m.jsx)(V,{cls:e.hazClass}),e.priority===`AOG`&&(0,m.jsx)(`span`,{className:`acu-aog`,children:`AOG`})]}),(0,m.jsx)(`span`,{className:`acu-row-desc`,children:e.commodity}),e.hazLabel!=null&&(0,m.jsx)(`span`,{className:`acu-row-desc`,children:e.hazLabel})]}),(0,m.jsx)(`span`,{className:`acu-uld-chip`,children:e.uld}),(0,m.jsxs)(`span`,{className:`acu-row-wt acu-num`,children:[z(e.weightKg),` kg`]})]})}function W(){let[e,t]=(0,p.useState)(me),[n,c]=(0,p.useState)(`s-lithium`),[_,x]=(0,p.useState)(null),[C,w]=(0,p.useState)(!1),[D,ue]=(0,p.useState)(I),O=(0,p.useMemo)(()=>R(e),[e]),k=(0,p.useMemo)(()=>ge(e),[e]),A=(0,p.useMemo)(()=>new Set(Object.values(e)),[e]),j=(0,p.useMemo)(()=>P.filter(e=>!A.has(e.id)),[A]),N=j.reduce((e,t)=>e+t.weightKg,0),L=Object.keys(e).length,H=Object.keys(e).filter(e=>M[e].deck===`main`).length,U=n==null?null:F[n],W=(0,p.useMemo)(()=>{let e=new Set;for(let t of k)e.add(t.posA),e.add(t.posB);return e},[k]),G=j.length===0,K=O.verdict===`ok`,q=k.length===0,we=G&&K&&q&&!C,J=()=>_e(he+(D.length-I.length)),Y=e=>ue(t=>[e,...t]),X=t=>C||U==null||e[t.id]!=null?!1:(U.uld===`PMC`&&t.deck===`main`||U.uld===`AKE`&&t.deck===`lower`)&&U.weightKg<=t.limitKg,Te=n=>{if(e[n.id]!=null){x(e=>e===n.id?null:n.id);return}if(C||U==null||!X(n))return;let r={...e,[n.id]:U.id},i=R(r);t(r),c(null),x(n.id),Y(`${J()} · Placed ${U.awb} → ${n.id} (${z(U.weightKg)} kg) · CG ${i.macPct.toFixed(1)} %MAC`)},Ee=n=>{let r=e[n];if(r==null||C)return;let i=F[r],a={...e};delete a[n];let o=R(a);t(a),x(null),Y(`${J()} · Removed ${i.awb} ← ${n} · back to queue · CG ${o.macPct.toFixed(1)} %MAC`)},De=()=>{we&&(w(!0),c(null),Y(`${J()} · Loadsheet finalized — ${z(O.payloadKg)} kg / CG ${O.macPct.toFixed(1)} %MAC sent to MC 482 crew`))},Z=_==null?null:M[_],Q=Z!=null&&e[Z.id]!=null?F[e[Z.id]]:null,Oe=t=>{let n=e[t.id];if(n!=null){let e=F[n],r=W.has(t.id)?`, segregation violation`:``;return`Position ${t.id}, ${t.hold}, arm ${t.armM} meters, loaded with ${e.awb}, ${z(e.weightKg)} kilograms${r}. Activate to inspect.`}return X(t)?`Position ${t.id}, ${t.hold}, empty, limit ${z(t.limitKg)} kilograms. Activate to place ${U?.awb??``}.`:`Position ${t.id}, ${t.hold}, empty, limit ${z(t.limitKg)} kilograms.`},ke=O.verdict===`ok`?`IN LIMITS`:O.verdict===`fwd`?`FWD LIMIT EXCEEDED`:`AFT LIMIT EXCEEDED`,Ae=(0,m.jsx)(se,{hasDivider:!0,children:(0,m.jsxs)(ie,{gap:2,vAlign:`center`,children:[(0,m.jsx)(be,{}),(0,m.jsx)(ce,{level:1,children:`Deckload`}),(0,m.jsx)(d,{label:`ULD build`,variant:`neutral`}),(0,m.jsx)(`span`,{className:`acu-leg-readout`,children:(0,m.jsx)(r,{type:`supporting`,color:`secondary`,hasTabularNumbers:!0,children:`MC 482 · ORD → ANC · B767-300F · N417MC`})}),(0,m.jsx)(u,{size:`fill`,children:(0,m.jsx)(`span`,{})}),(0,m.jsxs)(`span`,{className:`acu-cutoff acu-num`,children:[(0,m.jsx)(i,{icon:le,size:`sm`,color:`inherit`}),`Cutoff 14:45L`]}),C?(0,m.jsx)(d,{label:`Loadsheet sent`,variant:`success`}):(0,m.jsx)(f,{label:`Finalize loadsheet`,variant:`primary`,size:`sm`,isDisabled:!we,onClick:De})]})}),je=(0,m.jsxs)(`div`,{className:`acu-stats`,children:[(0,m.jsxs)(`div`,{className:`acu-stat`,children:[(0,m.jsx)(`span`,{className:`acu-stat-label`,children:`Payload`}),(0,m.jsxs)(`span`,{className:`acu-stat-value`,children:[z(O.payloadKg),` kg`]}),(0,m.jsxs)(`span`,{className:`acu-stat-sub`,children:[`of `,z(fe),` kg max`]})]}),(0,m.jsxs)(`div`,{className:`acu-stat`,children:[(0,m.jsx)(`span`,{className:`acu-stat-label`,children:`Zero-fuel weight`}),(0,m.jsxs)(`span`,{className:`acu-stat-value`,children:[z(O.zfwKg),` kg`]}),(0,m.jsxs)(`span`,{className:`acu-stat-sub`,children:[`MZFW `,z(de),` kg`]})]}),(0,m.jsxs)(`div`,{className:`acu-stat ${K?`is-ok`:`is-danger`}`,children:[(0,m.jsx)(`span`,{className:`acu-stat-label`,children:`CG`}),(0,m.jsx)(`span`,{className:`acu-stat-value`,children:B(O.macPct)}),(0,m.jsxs)(`span`,{className:`acu-stat-sub`,children:[`limits `,O.fwdPct.toFixed(1),`–`,O.aftPct.toFixed(1)]})]}),(0,m.jsxs)(`div`,{className:`acu-stat`,children:[(0,m.jsx)(`span`,{className:`acu-stat-label`,children:`Positions`}),(0,m.jsxs)(`span`,{className:`acu-stat-value`,children:[L,` / 16`]}),(0,m.jsxs)(`span`,{className:`acu-stat-sub`,children:[`main `,H,`/10 · lower `,L-H,`/6`]})]}),(0,m.jsxs)(`div`,{className:`acu-stat${q?``:` is-danger`}`,children:[(0,m.jsx)(`span`,{className:`acu-stat-label`,children:`Queue`}),(0,m.jsxs)(`span`,{className:`acu-stat-value`,children:[j.length,` AWB`]}),(0,m.jsx)(`span`,{className:`acu-stat-sub`,children:q?`${z(N)} kg to build`:`${k.length} DG conflict${k.length>1?`s`:``}`})]})]}),Me=(0,m.jsxs)(`div`,{className:`acu-deck-wrap`,children:[(0,m.jsx)(xe,{}),(0,m.jsx)(`span`,{className:`acu-deck-label`,style:{top:58,left:`3%`},children:`MAIN DECK · PMC`}),(0,m.jsx)(`span`,{className:`acu-deck-label`,style:{top:190,left:`3%`},children:`LOWER HOLDS · AKE`}),pe.map(t=>{let n=e[t.id],r=n==null?null:F[n],a=X(t),o=W.has(t.id),s=r==null&&!a;return(0,m.jsxs)(`button`,{type:`button`,className:[`acu-btn`,`acu-slot`,t.deck===`main`?`acu-slot--main`:`acu-slot--lower`,r==null?``:`is-occupied`,a?`is-eligible`:``,o?`is-violation`:``,_===t.id?`is-inspected`:``].filter(Boolean).join(` `),style:{left:`${ve(t.armM)}%`},"aria-label":Oe(t),"aria-pressed":_===t.id,disabled:s&&U!=null,title:s&&U!=null?U.uld===(t.deck===`main`?`PMC`:`AKE`)?`Over station limit ${z(t.limitKg)} kg`:`${U.uld} units load ${U.uld===`PMC`?`main deck`:`lower holds`} only`:void 0,onClick:()=>Te(t),children:[(0,m.jsx)(`span`,{className:`acu-slot-id`,children:t.id}),(0,m.jsx)(`span`,{className:`acu-slot-wt`,children:r==null?`≤${z(t.limitKg)}`:`${z(r.weightKg)}`}),r?.hazClass!=null&&(0,m.jsx)(V,{cls:r.hazClass}),o&&(0,m.jsx)(`span`,{className:`acu-slot-flag`,"aria-hidden":!0,children:(0,m.jsx)(i,{icon:l,size:`sm`,color:`inherit`})})]},t.id)})]}),Ne=(0,m.jsxs)(`div`,{className:`acu-deck-legend`,children:[(0,m.jsxs)(`span`,{children:[(0,m.jsx)(`span`,{className:`acu-legend-swatch`,style:{background:`light-dark(rgba(29,78,216,0.06), rgba(124,169,255,0.10))`,border:`1px solid light-dark(#93A8E8, #4A5E8F)`}}),`Loaded`]}),(0,m.jsxs)(`span`,{children:[(0,m.jsx)(`span`,{className:`acu-legend-swatch`,style:{background:v,border:`2px dashed ${g}`}}),`Takes armed AWB`]}),(0,m.jsxs)(`span`,{children:[(0,m.jsx)(`span`,{className:`acu-legend-swatch`,style:{background:b,border:`1px solid ${y}`}}),`DG segregation conflict`]}),(0,m.jsxs)(`span`,{children:[(0,m.jsx)(V,{cls:`9`}),` DG class aboard`]}),(0,m.jsx)(`span`,{className:`acu-num`,children:`P1/P10 taper limit 4,500 kg · AKE max 1,588 kg`})]}),$=(e,t,n,r)=>(0,m.jsxs)(`div`,{className:`acu-check-row`,children:[(0,m.jsx)(`span`,{style:{color:e?S:y,display:`inline-flex`},children:(0,m.jsx)(i,{icon:e?ne:re,size:`sm`,color:`inherit`})}),(0,m.jsx)(`span`,{children:t}),(0,m.jsx)(`span`,{className:`acu-check-detail`,children:n})]},r),Pe=(0,m.jsxs)(`div`,{className:`acu-readiness`,children:[(0,m.jsxs)(`h3`,{className:`acu-panel-title`,children:[(0,m.jsx)(i,{icon:a,size:`sm`,color:`inherit`}),` Cutoff readiness`]}),$(G,`Queue built out`,G?`all 12 AWBs loaded`:`${j.length} AWB remaining`,`gate-queue`),$(K,`CG within ZFW envelope`,`${B(O.macPct)} · ${O.fwdPct.toFixed(1)}–${O.aftPct.toFixed(1)} legal`,`gate-cg`),$(q,`DG segregation clear`,q?`no adjacency conflicts`:`${k.length} conflict${k.length>1?`s`:``}`,`gate-dg`),k.map(e=>(0,m.jsxs)(`div`,{className:`acu-viol`,children:[(0,m.jsx)(`span`,{style:{color:y,display:`inline-flex`},children:(0,m.jsx)(i,{icon:l,size:`sm`,color:`inherit`})}),(0,m.jsxs)(`span`,{children:[(0,m.jsxs)(`strong`,{children:[e.posA,` ↔ `,e.posB]}),` `,`· `,e.rule.text,` `,(0,m.jsxs)(`em`,{children:[`(`,e.rule.code,`)`]}),` — move `,e.shipB.awb,` or`,` `,e.shipA.awb,`.`]})]},`${e.posA}-${e.posB}-${e.rule.code}`)),(0,m.jsx)(r,{type:`supporting`,color:`secondary`,children:`Class 7 (radioactive) is NOTOC-notified; no adjacency rule applies on this leg.`}),(0,m.jsx)(`h3`,{className:`acu-panel-title`,style:{marginTop:`var(--spacing-3)`},children:`Build log`}),(0,m.jsx)(`ul`,{className:`acu-log`,children:D.slice(0,6).map(e=>(0,m.jsx)(`li`,{children:e},e))})]}),Fe=(0,m.jsxs)(`aside`,{className:`acu-queue`,"aria-label":`Shipment queue`,children:[(0,m.jsxs)(`div`,{className:`acu-queue-head`,children:[(0,m.jsx)(i,{icon:s,size:`sm`,color:`secondary`}),(0,m.jsx)(r,{type:`body`,weight:`semibold`,children:`Shipment queue`}),(0,m.jsx)(u,{size:`fill`,children:(0,m.jsx)(`span`,{})}),(0,m.jsxs)(r,{type:`supporting`,color:`secondary`,hasTabularNumbers:!0,children:[j.length,` AWB · `,z(N),` kg`]})]}),(0,m.jsx)(`div`,{className:`acu-queue-hint`,children:C?(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(i,{icon:o,size:`sm`,color:`secondary`}),` Build frozen — loadsheet sent at `,D[0]?.slice(0,5),`.`]}):`Select an AWB, then tap a cobalt-dashed position on the map. PMC pallets load the main deck; AKE cans load the lower holds.`}),(0,m.jsxs)(`div`,{className:`acu-queue-list`,children:[j.map(e=>(0,m.jsx)(Ce,{shipment:e,isSelected:n===e.id,isDisabled:C,onSelect:e=>c(t=>t===e?null:e)},e.id)),j.length===0&&(0,m.jsxs)(`div`,{className:`acu-queue-empty`,children:[`Queue clear — all 12 shipments assigned.`,!C&&` Review the map, then finalize the loadsheet.`]})]})]});return(0,m.jsxs)(`div`,{className:h,children:[(0,m.jsx)(`style`,{children:ye}),(0,m.jsx)(ae,{height:`fill`,header:Ae,content:(0,m.jsx)(oe,{padding:0,children:(0,m.jsxs)(`div`,{className:`acu-body`,children:[(0,m.jsxs)(`div`,{className:`acu-main`,children:[je,(0,m.jsxs)(`div`,{className:`acu-section`,children:[(0,m.jsx)(i,{icon:ee,size:`sm`,color:`secondary`}),(0,m.jsx)(`h2`,{children:`Deck plan — MC 482`}),(0,m.jsx)(`span`,{className:`acu-section-meta`,children:`slot x-centers derive from station arms (0–50 m)`})]}),Me,Ne,(0,m.jsx)(`div`,{className:`acu-status`,role:`status`,"aria-live":`polite`,children:D[0]}),Z!=null&&Q!=null&&(0,m.jsxs)(`div`,{className:`acu-inspect`,children:[(0,m.jsx)(d,{label:Z.id,variant:`neutral`}),(0,m.jsxs)(`div`,{className:`acu-inspect-main`,children:[(0,m.jsxs)(`span`,{className:`acu-inspect-title acu-mono`,children:[Q.awb,` · `,Q.commodity]}),(0,m.jsxs)(`span`,{className:`acu-inspect-sub`,children:[Z.hold,` · arm `,Z.armM.toFixed(1),` m ·`,` `,z(Q.weightKg),` kg of`,` `,z(Z.limitKg),` kg limit`,Q.hazLabel!=null&&` · ${Q.hazLabel}`]})]}),(0,m.jsx)(f,{label:`Return to queue`,variant:`secondary`,size:`sm`,isDisabled:C,onClick:()=>Ee(Z.id)})]}),(0,m.jsxs)(`div`,{className:`acu-section`,children:[(0,m.jsx)(i,{icon:te,size:`sm`,color:`secondary`}),(0,m.jsx)(`h2`,{children:`Weight & balance`}),(0,m.jsxs)(`span`,{className:`acu-section-meta`,children:[`OEW `,z(T),` kg @ `,E.toFixed(2),` m`]})]}),(0,m.jsxs)(`div`,{className:`acu-band`,children:[(0,m.jsxs)(`div`,{className:`acu-envelope`,children:[(0,m.jsxs)(ie,{gap:2,vAlign:`center`,children:[(0,m.jsx)(`h3`,{className:`acu-panel-title`,style:{margin:0},children:`ZFW envelope`}),(0,m.jsx)(u,{size:`fill`,children:(0,m.jsx)(`span`,{})}),(0,m.jsx)(`span`,{className:`acu-verdict ${K?`is-ok`:`is-bad`}`,children:ke})]}),(0,m.jsx)(Se,{balance:O}),(0,m.jsxs)(r,{type:`supporting`,color:`secondary`,hasTabularNumbers:!0,children:[`CG `,B(O.macPct),` · arm`,` `,O.armM.toFixed(2),` m · ZFW`,` `,z(O.zfwKg),` kg`]})]}),Pe]})]}),Fe]})})})]})}export{W as default};