import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Icon-CbuLE4XT.js";import{t as i}from"./arrow-left-right-3256lnDS.js";import{t as a}from"./car-qJei815B.js";import{t as o}from"./droplets-U5Nw6m8Y.js";import{t as s}from"./flame-DFe3n8Jj.js";import{t as c}from"./hard-hat-u3ssaf5q.js";import{t as l}from"./rotate-ccw-eKviIZPK.js";import{t as u}from"./zap-D0Y89tQV.js";import{D as d,k as f}from"./index-CfmeJ-SX.js";import{n as p,t as m}from"./LayoutContent-CCL91W7X.js";import{t as h}from"./LayoutHeader-Cy2mWoMf.js";import{t as g}from"./Badge-0Tj9omHc.js";import{t as _}from"./Button-CDZT8H4B.js";var v=e(t(),1),y=n(),b=`light-dark(#1F5F8F, #8FC5EE)`,x=`light-dark(rgba(31, 95, 143, 0.10), rgba(143, 197, 238, 0.16))`,S=`light-dark(#475569, #94A3B8)`,C=`light-dark(rgba(71, 85, 105, 0.10), rgba(148, 163, 184, 0.16))`,w=`light-dark(#15803D, #4ADE80)`,T=`light-dark(#B45309, #FCD34D)`,E=`light-dark(rgba(180, 83, 9, 0.10), rgba(252, 211, 77, 0.16))`,D=`light-dark(#B91C1C, #F87171)`,O=`light-dark(rgba(185, 28, 28, 0.10), rgba(248, 113, 113, 0.16))`,k={r14:{id:`r14`,badge:`R-14`,name:`Marisol Vega`,trades:`Electrical · Building · Mechanical`,color:b,tint:x},r07:{id:`r07`,badge:`R-07`,name:`Owen Tran`,trades:`Plumbing · Building · Electrical`,color:S,tint:C}},A={x:1,y:5},j=480,M=2,N=new Map([{id:`st-1192`,permit:`ELE-2026-01192`,address:`214 Birch Ave`,scope:`Rough electrical — 2nd-floor addition`,type:`electrical`,x:2,y:4,windowStart:480,windowEnd:600,durationMin:40,contact:`GC on site: Ferro Bros. (Nick, 555-0164)`},{id:`st-4471`,permit:`BLD-2026-04471`,address:`1180 3rd St`,scope:`Framing — mixed-use core & shell, floors 1–3`,type:`building`,x:5,y:4,windowStart:480,windowEnd:630,durationMin:50,contact:`Super: D. Whitaker — check shear-wall nailing at grid C`},{id:`st-2218`,permit:`PLM-2026-02218`,address:`733 Dover Ave`,scope:`Water-heater replacement — final`,type:`plumbing`,x:6,y:2,windowStart:540,windowEnd:660,durationMin:25,contact:`Homeowner: R. Castellanos (works from home)`},{id:`st-0874`,permit:`MEC-2026-00874`,address:`902 Elm Ave`,scope:`Furnace changeout — 80k BTU, new B-vent`,type:`mechanical`,x:7,y:5,windowStart:600,windowEnd:720,durationMin:35,contact:`Tenant present 10–12 only (lunch-shift worker)`},{id:`st-4502`,permit:`BLD-2026-04502`,address:`445 Cedar Ave, rear accessory structure (alley access)`,scope:`Final building — detached ADU, incl. egress + smoke/CO`,type:`building`,x:3,y:6,windowStart:600,windowEnd:660,durationMin:45,contact:`Owner-builder: P. Nakamura — dog in yard, call ahead`},{id:`st-1201`,permit:`ELE-2026-01201`,address:`88 Ash Ave`,scope:`200A service upgrade — meter release`,type:`electrical`,x:0,y:1,windowStart:660,windowEnd:780,durationMin:30,contact:`Norvale Power crew scheduled 2 PM — release before then`},{id:`st-2201`,permit:`PLM-2026-02201`,address:`316 Ash Ave`,scope:`Sewer lateral — open trench, camera on request`,type:`plumbing`,x:0,y:3,windowStart:480,windowEnd:570,durationMin:45,contact:`Trench must close today — contractor holds the plate`},{id:`st-4466`,permit:`BLD-2026-04466`,address:`501 Birch Ave`,scope:`Drywall screw inspection — units 2A/2B`,type:`building`,x:2,y:2,windowStart:510,windowEnd:630,durationMin:30,contact:`Lockbox 4471 — manager off site`},{id:`st-1188`,permit:`ELE-2026-01188`,address:`1420 6th St`,scope:`Panel swap — like-for-like 100A`,type:`electrical`,x:4,y:1,windowStart:540,windowEnd:660,durationMin:35,contact:`Electrician meets on site: Arco Electric (Sam)`},{id:`st-4490`,permit:`BLD-2026-04490`,address:`977 7th St`,scope:`Re-roof midpoint — nailing pattern, underlayment`,type:`building`,x:6,y:0,windowStart:600,windowEnd:690,durationMin:25,contact:`Crew on roof from 7 AM — ladder on north side`},{id:`st-2230`,permit:`PLM-2026-02230`,address:`640 Dover Ave`,scope:`Gas pressure test — 10 lb / 15 min witnessed`,type:`plumbing`,x:6,y:4,windowStart:660,windowEnd:750,durationMin:40,contact:`Plumber requests 11:00 sharp — gauge already pumped`}].map(e=>[e.id,e])),P={r14:[`st-1192`,`st-4471`,`st-2218`,`st-0874`,`st-4502`,`st-1201`],r07:[`st-2201`,`st-4466`,`st-1188`,`st-4490`,`st-2230`]},F={electrical:{label:`Electrical`,icon:u},building:{label:`Building`,icon:c},plumbing:{label:`Plumbing`,icon:o},mechanical:{label:`Mechanical`,icon:s}},I=660,L=560,R=e=>30+e*75,z=e=>30+e*82,B=[`Ash`,`Bay`,`Birch`,`Cedar`,`Chestnut`,`Denton`,`Dover`,`Elm`,`Fulton`],V=[`7th St`,`6th St`,`5th St`,`4th St`,`3rd St`,`2nd St`,`1st St`],H=`tpl-city-permit-inspection-route`,U=`
.${H} {
  color: var(--color-text-primary);
  font-family: var(--font-family-sans, system-ui, sans-serif);
}
.${H} *,
.${H} *::before,
.${H} *::after {
  box-sizing: border-box;
}
.${H} button {
  font: inherit;
  color: inherit;
}
.${H} :is(button):focus-visible {
  outline: 2px solid ${b};
  outline-offset: 2px;
}

/* ---- topbar (56px) ------------------------------------------------------ */
.${H}.topbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-3);
  min-height: 56px;
  padding: var(--spacing-2) var(--spacing-4);
}
.${H} .brandMark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  flex-shrink: 0;
  background: ${x};
  color: ${b};
}
.${H} .titleBlock {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.${H} .eyebrow {
  margin: 0;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${b};
}
.${H} .pageTitle {
  margin: 0;
  font-size: 16px;
  font-weight: 650;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${H} .titleMeta {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.${H} .cityChip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  padding: 2px 10px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  font-size: 12px;
  white-space: nowrap;
  background: var(--color-background-body);
  font-variant-numeric: tabular-nums;
}
.${H} .cityChip strong {
  font-weight: 650;
}
.${H} .cityChip.hasMiss {
  border-color: ${D};
  color: ${D};
  background: ${O};
}
.${H} .cityChip.isClean {
  border-color: ${w};
  color: ${w};
}
.${H} .topbarActions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-shrink: 0;
}

/* ---- shell + grid ------------------------------------------------------- */
.${H}.shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.${H} .grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 424px minmax(0, 1fr);
}
.${H} .listCol {
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-inline-end: var(--border-width) solid var(--color-border);
}
.${H} .mapCol {
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: var(--spacing-4);
  gap: var(--spacing-3);
  background: var(--color-background-body);
}

/* ---- inspector switch (44px row) ---------------------------------------- */
.${H} .tabRow {
  flex-shrink: 0;
  display: flex;
  gap: var(--spacing-2);
  min-height: 44px;
  padding: var(--spacing-2) var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${H} .inspectorTab {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
  padding: 4px 10px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  background: none;
  cursor: pointer;
  text-align: start;
}
@media (hover: hover) {
  .${H} .inspectorTab:hover {
    background: var(--color-background-muted);
  }
}
.${H} .inspectorTab[aria-pressed='true'] {
  border-color: var(--tab-color, ${b});
  background: var(--tab-tint, ${x});
}
.${H} .tabBadge {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--tab-color, ${b});
  border: var(--border-width) solid var(--tab-color, ${b});
  border-radius: 6px;
  padding: 1px 6px;
}
.${H} .tabName {
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.${H} .tabName b {
  font-size: 12.5px;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${H} .tabName span {
  font-size: 10.5px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---- stat tiles (64px) ---------------------------------------------------- */
.${H} .statRow {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-bottom: var(--border-width) solid var(--color-border);
}
.${H} .statTile {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1px;
  min-height: 64px;
  padding: var(--spacing-2) var(--spacing-3);
  border-inline-end: var(--border-width) solid var(--color-border);
}
.${H} .statTile:last-child {
  border-inline-end: none;
}
.${H} .statValue {
  font-size: 17px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  line-height: 1.15;
}
.${H} .statValue.isMiss {
  color: ${D};
}
.${H} .statValue.isClean {
  color: ${w};
}
.${H} .statLabel {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* ---- stop list (rows 76px) ------------------------------------------------ */
.${H} .stopScroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.${H} .stopList {
  list-style: none;
  margin: 0;
  padding: 0;
}
.${H} .stopList li {
  border-bottom: var(--border-width) solid var(--color-border);
}
.${H} .stopRow {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  align-items: center;
  column-gap: var(--spacing-3);
  width: 100%;
  min-height: 76px;
  padding: var(--spacing-2) var(--spacing-4);
  border: none;
  background: none;
  text-align: start;
  cursor: pointer;
}
@media (hover: hover) {
  .${H} .stopRow:hover {
    background: var(--color-background-muted);
  }
}
.${H} .stopRow[aria-expanded='true'] {
  background: var(--row-tint, ${x});
}
.${H} .seqBadge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: light-dark(#FFFFFF, #1B1B1F);
  background: var(--seq-color, ${b});
}
.${H} .stopMain {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.${H} .permitRow {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.${H} .permitId {
  font-family: var(--font-family-code, monospace);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${H} .typeTag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10.5px;
  font-weight: 650;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
/* The address is the ONE segment allowed to ellipsize. */
.${H} .stopAddress {
  font-size: 13.5px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${H} .driveNote {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${H} .timeCell {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  flex-shrink: 0;
}
.${H} .windowLabel {
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
/* ETA chip: 22px, state-colored, never color-only (verb in the label). */
.${H} .etaChip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 22px;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  border: var(--border-width) solid ${w};
  color: ${w};
}
.${H} .etaChip.isWait {
  border-color: ${T};
  color: ${T};
  background: ${E};
}
.${H} .etaChip.isMiss {
  border-color: ${D};
  color: ${D};
  background: ${O};
}
.${H} .stopExpand {
  padding: 0 var(--spacing-4) var(--spacing-3) calc(28px + var(--spacing-3) + var(--spacing-4));
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
.${H} .stopScope {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--color-text-primary);
}
.${H} .stopContact {
  margin: 0;
  font-size: 11.5px;
  color: var(--color-text-secondary);
}
.${H} .actionBar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}
.${H} .actionBtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 var(--spacing-3);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  background: var(--color-background-body);
  cursor: pointer;
  font-size: 12.5px;
  font-weight: 600;
}
@media (hover: hover) {
  .${H} .actionBtn:hover:not(:disabled) {
    background: var(--color-background-muted);
  }
}
.${H} .actionBtn:disabled {
  opacity: 0.45;
  cursor: default;
}
.${H} .actionBtn.isReassign {
  border-color: ${b};
  color: ${b};
}

/* ---- map column ------------------------------------------------------------ */
.${H} .mapFrame {
  position: relative;
  width: 100%;
  aspect-ratio: ${I} / ${L};
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 10px);
  background: var(--color-background-surface);
  overflow: hidden;
}
.${H} .mapSvg {
  display: block;
  width: 100%;
  height: 100%;
}
/* Pin buttons: 40px hit target centered on the intersection, 26px visible
   dot. Overlay percentages share the SVG's viewBox math exactly because the
   frame's aspect-ratio pins the same 660/560 geometry. */
.${H} .pinBtn {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
}
.${H} .pinDot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: light-dark(#FFFFFF, #1B1B1F);
  background: var(--pin-color, ${b});
  box-shadow: 0 0 0 2px var(--color-background-surface);
}
.${H} .pinBtn.isDim .pinDot {
  opacity: 0.4;
}
.${H} .pinBtn.isSelected .pinDot {
  box-shadow:
    0 0 0 2px var(--color-background-surface),
    0 0 0 4px var(--pin-color, ${b});
}
/* Miss ring: dashed red halo so the late pin reads without color vision. */
.${H} .pinBtn.isMiss::after {
  content: '';
  position: absolute;
  inset: 1px;
  border: 2px dashed ${D};
  border-radius: 50%;
  pointer-events: none;
}
.${H} .legendRow {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  flex-wrap: wrap;
  font-size: 11.5px;
  color: var(--color-text-secondary);
}
.${H} .legendItem {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.${H} .legendSwatch {
  width: 18px;
  height: 3px;
  border-radius: 2px;
}
.${H} .legendSwatch.isDashed {
  height: 0;
  border-top: 3px dashed ${D};
  background: none;
}
.${H} .mapFootnote {
  margin: 0;
  font-size: 11px;
  line-height: 1.45;
  color: var(--color-text-secondary);
}
.${H} .srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ---- responsive subtraction ---------------------------------------------- */
/* <=900px: one scrolling column — map first, list after. */
@media (max-width: 900px) {
  .${H} .grid {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  .${H} .mapCol {
    order: 0;
    overflow-y: visible;
  }
  .${H} .listCol {
    order: 1;
    border-inline-end: none;
    border-top: var(--border-width) solid var(--color-border);
  }
  .${H} .stopScroll {
    overflow-y: visible;
  }
}
/* <=600px: stat tiles wrap 2x2; nothing else squeezes. */
@media (max-width: 600px) {
  .${H} .statRow {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .${H} .statTile {
    border-bottom: var(--border-width) solid var(--color-border);
  }
  .${H} .statTile:nth-child(n + 3) {
    border-bottom: none;
  }
  .${H} .statTile:nth-child(2n) {
    border-inline-end: none;
  }
}
@media (prefers-reduced-motion: no-preference) {
  .${H} .pinDot {
    transition: box-shadow 0.15s ease, opacity 0.15s ease;
  }
}
`;function W(e){let t=[],n=j,r=A,i=0,a=0;for(let[o,s]of e.entries()){let e=N.get(s);if(e===void 0)continue;let c=(Math.abs(e.x-r.x)+Math.abs(e.y-r.y))*M,l=n+c,u=Math.max(0,e.windowStart-l),d=Math.max(0,l-e.windowEnd),f=l+u,p=f+e.durationMin;t.push({stop:e,seq:o+1,driveMin:c,arriveMin:l,waitMin:u,missMin:d,beginMin:f,departMin:p}),i+=c,a+=e.durationMin,n=p,r=e}return{legs:t,totalDriveMin:i,totalInspectMin:a,endMin:n,missCount:t.filter(e=>e.missMin>0).length,waitCount:t.filter(e=>e.waitMin>0).length}}function G(e){let t=Math.floor(e/60)%24,n=e%60,r=t>=12?`PM`:`AM`;return`${t%12==0?12:t%12}:${String(n).padStart(2,`0`)} ${r}`}function K(e){if(e<60)return`${e}m`;let t=Math.floor(e/60),n=e%60;return n===0?`${t}h`:`${t}h ${String(n).padStart(2,`0`)}m`}function q(e,t){let n=e=>{let t=Math.floor(e/60)%24,n=e%60,r=t%12==0?12:t%12;return n===0?`${r}`:`${r}:${String(n).padStart(2,`0`)}`};return`${n(e)}–${n(t)}`}function J(e){let t=`M ${R(A.x)} ${z(A.y)}`,n=A;for(let r of e){let{stop:e}=r;e.x!==n.x&&(t+=` L ${R(e.x)} ${z(n.y)}`),e.y!==n.y&&(t+=` L ${R(e.x)} ${z(e.y)}`),n=e}return t}function Y(){return(0,y.jsxs)(`svg`,{width:`20`,height:`20`,viewBox:`0 0 24 24`,fill:`none`,"aria-hidden":`true`,children:[(0,y.jsx)(`path`,{d:`M4 4v12a4 4 0 0 0 4 4h12`,stroke:`currentColor`,strokeWidth:`2.4`,strokeLinecap:`round`}),(0,y.jsx)(`path`,{d:`M9 9h6v-4`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`}),(0,y.jsx)(`circle`,{cx:`15`,cy:`3.6`,r:`2`,fill:`currentColor`})]})}function X({r14Legs:e,r07Legs:t,activeInspector:n}){let r=[{id:`r07`,legs:t,color:S},{id:`r14`,legs:e,color:b}];return r.sort(e=>e.id===n?1:-1),(0,y.jsxs)(`svg`,{className:`mapSvg`,viewBox:`0 0 ${I} ${L}`,preserveAspectRatio:`xMidYMid meet`,"aria-hidden":`true`,children:[B.map((e,t)=>(0,y.jsxs)(`g`,{children:[(0,y.jsx)(`line`,{x1:R(t),y1:z(0)-12,x2:R(t),y2:z(V.length-1)+12,stroke:`var(--color-border)`,strokeWidth:1.25}),(0,y.jsx)(`text`,{x:R(t),y:14,textAnchor:`middle`,fontSize:9,fontFamily:`var(--font-family-sans, system-ui, sans-serif)`,fill:`var(--color-text-secondary)`,children:e})]},e)),V.map((e,t)=>(0,y.jsxs)(`g`,{children:[(0,y.jsx)(`line`,{x1:R(0)-12,y1:z(t),x2:R(B.length-1)+12,y2:z(t),stroke:`var(--color-border)`,strokeWidth:1.25}),(0,y.jsx)(`text`,{x:R(B.length-1)+16,y:z(t)+3,textAnchor:`start`,fontSize:9,fontFamily:`var(--font-family-sans, system-ui, sans-serif)`,fill:`var(--color-text-secondary)`,children:e})]},e)),r.map(e=>(0,y.jsx)(`path`,{d:J(e.legs),fill:`none`,stroke:e.color,strokeWidth:e.id===n?3:1.75,opacity:e.id===n?1:.45,strokeLinejoin:`round`,strokeLinecap:`round`},e.id)),(0,y.jsx)(`rect`,{x:R(A.x)-7,y:z(A.y)-7,width:14,height:14,rx:3,fill:`var(--color-text-secondary)`}),(0,y.jsx)(`text`,{x:R(A.x),y:z(A.y)+24,textAnchor:`middle`,fontSize:9,fontWeight:700,fontFamily:`var(--font-family-sans, system-ui, sans-serif)`,fill:`var(--color-text-secondary)`,children:`YARD`})]})}function Z({leg:e}){return e.missMin>0?(0,y.jsxs)(`span`,{className:`etaChip isMiss`,children:[`ETA `,G(e.arriveMin),` · misses window by `,e.missMin,`m`]}):e.waitMin>0?(0,y.jsxs)(`span`,{className:`etaChip isWait`,children:[`ETA `,G(e.arriveMin),` · waits `,e.waitMin,`m`]}):(0,y.jsxs)(`span`,{className:`etaChip`,children:[`ETA `,G(e.arriveMin),` · on time`]})}function Q({leg:e,inspector:t,otherInspector:n,isSelected:o,isFirst:s,isLast:c,onSelect:l,onMove:u,onReassign:p}){let{stop:m}=e,h=F[m.type],g=`cpir-stop-${m.id}`;return(0,y.jsxs)(`li`,{children:[(0,y.jsxs)(`button`,{type:`button`,className:`stopRow`,style:{"--seq-color":t.color,"--row-tint":t.tint},"aria-expanded":o,"aria-controls":g,onClick:()=>l(m.id),children:[(0,y.jsx)(`span`,{className:`seqBadge`,children:e.seq}),(0,y.jsxs)(`span`,{className:`stopMain`,children:[(0,y.jsxs)(`span`,{className:`permitRow`,children:[(0,y.jsx)(`span`,{className:`permitId`,children:m.permit}),(0,y.jsxs)(`span`,{className:`typeTag`,children:[(0,y.jsx)(r,{icon:h.icon,size:`xsm`,color:`inherit`}),h.label]})]}),(0,y.jsx)(`span`,{className:`stopAddress`,children:m.address}),(0,y.jsxs)(`span`,{className:`driveNote`,children:[(0,y.jsx)(r,{icon:a,size:`xsm`,color:`inherit`}),` `,e.driveMin,`m drive ·`,` `,m.durationMin,`m on site`]})]}),(0,y.jsxs)(`span`,{className:`timeCell`,children:[(0,y.jsxs)(`span`,{className:`windowLabel`,children:[`Window `,q(m.windowStart,m.windowEnd)]}),(0,y.jsx)(Z,{leg:e})]})]}),o&&(0,y.jsxs)(`div`,{className:`stopExpand`,id:g,children:[(0,y.jsx)(`p`,{className:`stopScope`,children:m.scope}),(0,y.jsx)(`p`,{className:`stopContact`,children:m.contact}),(0,y.jsxs)(`div`,{className:`actionBar`,children:[(0,y.jsxs)(`button`,{type:`button`,className:`actionBtn`,disabled:s,onClick:()=>u(m.id,-1),children:[(0,y.jsx)(r,{icon:d,size:`sm`,color:`inherit`}),`Move up`]}),(0,y.jsxs)(`button`,{type:`button`,className:`actionBtn`,disabled:c,onClick:()=>u(m.id,1),children:[(0,y.jsx)(r,{icon:f,size:`sm`,color:`inherit`}),`Move down`]}),(0,y.jsxs)(`button`,{type:`button`,className:`actionBtn isReassign`,onClick:()=>p(m.id),children:[(0,y.jsx)(r,{icon:i,size:`sm`,color:`inherit`}),`Reassign to `,n.badge,` `,n.name]})]})]})]})}function $(){let[e,t]=(0,v.useState)(P),[n,i]=(0,v.useState)(`r14`),[o,s]=(0,v.useState)(`st-4502`),[c,u]=(0,v.useState)(``),d=(0,v.useMemo)(()=>({r14:W(e.r14),r07:W(e.r07)}),[e]),f=t=>e.r14.includes(t)?`r14`:`r07`,x=e.r14.length+e.r07.length,C=d.r14.missCount+d.r07.missCount,w=d.r14.totalDriveMin+d.r07.totalDriveMin,T=d[n],E=k[n],D=k[n===`r14`?`r07`:`r14`],O=e=>{let t=o===e?null:e;if(s(t),t!==null){let t=f(e);i(t);let n=N.get(e);u(`${n?.address??e} selected on ${k[t].badge}.`)}},A=(e,t)=>`${k[e].badge} now ends ${G(t.endMin)} with ${t.missCount===0?`no window misses`:`${t.missCount} window miss${t.missCount>1?`es`:``}`}.`,j=(n,r)=>{let i=f(n),a=e[i],o=a.indexOf(n),s=o+r;if(o<0||s<0||s>=a.length)return;let c=[...a];c[o]=c[s],c[s]=n;let l={...e,[i]:c};t(l);let d=W(c),p=d.legs.find(e=>e.stop.id===n),m=N.get(n);u(`${m?.permit??n} moved to stop ${s+1} — new ETA ${p===void 0?`—`:G(p.arriveMin)}. ${A(i,d)}`)},M=n=>{let r=f(n),a=r===`r14`?`r07`:`r14`,o={...e,[r]:e[r].filter(e=>e!==n),[a]:[...e[a],n]};t(o),i(a);let s=W(o[a]),c=W(o[r]),l=s.legs.find(e=>e.stop.id===n),d=N.get(n);u(`${d?.permit??n} reassigned to ${k[a].badge} as stop ${l?.seq??o[a].length} — ETA ${l===void 0?`—`:G(l.arriveMin)}${l!==void 0&&l.missMin>0?` (misses window by ${l.missMin}m)`:``}. ${A(r,c)}`)},F=(0,y.jsx)(h,{children:(0,y.jsxs)(`div`,{className:`${H} topbar`,children:[(0,y.jsx)(`span`,{className:`brandMark`,children:(0,y.jsx)(Y,{})}),(0,y.jsxs)(`div`,{className:`titleBlock`,children:[(0,y.jsx)(`p`,{className:`eyebrow`,children:`Curbside · Dispatch board`}),(0,y.jsx)(`h1`,{className:`pageTitle`,children:`Thursday routes — Jul 16, 2026`}),(0,y.jsxs)(`div`,{className:`titleMeta`,children:[(0,y.jsx)(`span`,{children:`City of Norvale · Building & Safety`}),(0,y.jsx)(g,{label:`AM block · 8:00–1:00`,variant:`neutral`})]})]}),(0,y.jsxs)(`div`,{className:`topbarActions`,children:[(0,y.jsxs)(`span`,{className:`cityChip`,children:[(0,y.jsx)(`strong`,{children:x}),` stops`]}),(0,y.jsxs)(`span`,{className:C>0?`cityChip hasMiss`:`cityChip isClean`,children:[(0,y.jsx)(`strong`,{children:C}),` window miss`,C===1?``:`es`]}),(0,y.jsxs)(`span`,{className:`cityChip`,children:[(0,y.jsx)(r,{icon:a,size:`xsm`,color:`inherit`}),(0,y.jsx)(`strong`,{children:K(w)}),` combined drive`]}),(0,y.jsx)(_,{label:`Reset plan`,variant:`ghost`,size:`sm`,icon:(0,y.jsx)(r,{icon:l,size:`sm`}),onClick:()=>{t(P),i(`r14`),s(`st-4502`),u(`Routes reset to the 7:40 AM dispatch plan.`)}})]})]})}),B=e=>{let t=k[e],r=d[e];return(0,y.jsxs)(`button`,{type:`button`,className:`inspectorTab`,style:{"--tab-color":t.color,"--tab-tint":t.tint},"aria-pressed":n===e,onClick:()=>i(e),children:[(0,y.jsx)(`span`,{className:`tabBadge`,children:t.badge}),(0,y.jsxs)(`span`,{className:`tabName`,children:[(0,y.jsx)(`b`,{children:t.name}),(0,y.jsxs)(`span`,{children:[d[e].legs.length,` stops · ends `,G(r.endMin)]})]})]})},V=(0,y.jsxs)(`section`,{className:`listCol`,"aria-label":`Ordered stop list`,children:[(0,y.jsxs)(`div`,{className:`tabRow`,role:`group`,"aria-label":`Inspector routes`,children:[B(`r14`),B(`r07`)]}),(0,y.jsxs)(`div`,{className:`statRow`,"aria-label":`${E.badge} route totals`,children:[(0,y.jsxs)(`div`,{className:`statTile`,children:[(0,y.jsx)(`span`,{className:`statValue`,children:K(T.totalDriveMin)}),(0,y.jsx)(`span`,{className:`statLabel`,children:`Drive`})]}),(0,y.jsxs)(`div`,{className:`statTile`,children:[(0,y.jsx)(`span`,{className:`statValue`,children:K(T.totalInspectMin)}),(0,y.jsx)(`span`,{className:`statLabel`,children:`On site`})]}),(0,y.jsxs)(`div`,{className:`statTile`,children:[(0,y.jsx)(`span`,{className:`statValue`,children:G(T.endMin)}),(0,y.jsx)(`span`,{className:`statLabel`,children:`Ends`})]}),(0,y.jsxs)(`div`,{className:`statTile`,children:[(0,y.jsx)(`span`,{className:T.missCount>0?`statValue isMiss`:`statValue isClean`,children:T.missCount}),(0,y.jsx)(`span`,{className:`statLabel`,children:`Window misses`})]})]}),(0,y.jsx)(`div`,{className:`stopScroll`,children:(0,y.jsx)(`ul`,{className:`stopList`,children:T.legs.map((e,t)=>(0,y.jsx)(Q,{leg:e,inspector:E,otherInspector:D,isSelected:o===e.stop.id,isFirst:t===0,isLast:t===T.legs.length-1,onSelect:O,onMove:j,onReassign:M},e.stop.id))})})]}),q=[`r14`,`r07`].flatMap(e=>d[e].legs.map(t=>{let r=k[e];return(0,y.jsx)(`button`,{type:`button`,className:[`pinBtn`,e===n?``:`isDim`,t.missMin>0?`isMiss`:``,o===t.stop.id?`isSelected`:``].filter(Boolean).join(` `),style:{"--pin-color":r.color,left:`${R(t.stop.x)/I*100}%`,top:`${z(t.stop.y)/L*100}%`},"aria-label":`${t.stop.address} — ${r.badge} stop ${t.seq}, ETA ${G(t.arriveMin)}${t.missMin>0?`, misses window by ${t.missMin} minutes`:``}`,onClick:()=>O(t.stop.id),children:(0,y.jsx)(`span`,{className:`pinDot`,children:t.seq})},`${e}-${t.stop.id}`)})),J=(0,y.jsxs)(`section`,{className:`mapCol`,"aria-label":`Schematic route map`,children:[(0,y.jsxs)(`div`,{className:`mapFrame`,children:[(0,y.jsx)(X,{r14Legs:d.r14.legs,r07Legs:d.r07.legs,activeInspector:n}),q]}),(0,y.jsxs)(`div`,{className:`legendRow`,children:[(0,y.jsxs)(`span`,{className:`legendItem`,children:[(0,y.jsx)(`span`,{className:`legendSwatch`,style:{background:b}}),`R-14 Marisol Vega`]}),(0,y.jsxs)(`span`,{className:`legendItem`,children:[(0,y.jsx)(`span`,{className:`legendSwatch`,style:{background:S}}),`R-07 Owen Tran`]}),(0,y.jsxs)(`span`,{className:`legendItem`,children:[(0,y.jsx)(`span`,{className:`legendSwatch isDashed`}),`missed window`]}),(0,y.jsx)(`span`,{className:`legendItem`,children:`■ Yard — 120 Bay Ave, gates 8:00 AM`})]}),(0,y.jsx)(`p`,{className:`mapFootnote`,children:`Schematic grid, not to scale: one block = 2 minutes at posted AM speeds (Norvale DOT Thursday profile). Select a pin to open its stop row; the polylines, ETAs, and totals re-derive from the current order on every change.`})]});return(0,y.jsxs)(`div`,{style:{height:`100dvh`,width:`100%`},children:[(0,y.jsx)(`style`,{children:U}),(0,y.jsx)(p,{height:`fill`,header:F,content:(0,y.jsx)(m,{padding:0,children:(0,y.jsxs)(`div`,{className:`${H} shell`,children:[(0,y.jsx)(`div`,{"aria-live":`polite`,className:`srOnly`,children:c}),(0,y.jsxs)(`div`,{className:`grid`,children:[V,J]})]})})})]})}export{$ as default};