import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-zBEZLbyF.js";import{t as i}from"./Icon-C7Tu044I.js";import{t as a}from"./clipboard-check-ZRlm-gyh.js";import{t as o}from"./droplets-CO9DpJis.js";import{t as s}from"./flask-conical-BQgAcWHb.js";import{t as c}from"./map-pin-CXsIypeB.js";import{t as l}from"./snowflake-1UMaiK84.js";import{t as u}from"./timer-CeYvWfww.js";import{t as ee}from"./truck-C0CCZbTc.js";import{t as d}from"./undo-BuV8H4w6.js";import{b as f,o as p}from"./index-Csn9cgK2.js";import{t as te}from"./HStack-2WTukjNp.js";import{t as m}from"./VStack-B8U-hI0Y.js";import{t as h}from"./StackItem-Ca9P7L2I.js";import{n as g,t as _}from"./LayoutContent-CCL91W7X.js";import{t as ne}from"./LayoutHeader-Cy2mWoMf.js";import{t as re}from"./Heading-7iAMrwFB.js";import{t as v}from"./Button-DSFH9r96.js";var y=e(t(),1),b=n(),x=`tpl-water-quality-sampling-map`,S=`light-dark(#0E7490, #53DDF2)`,C=`light-dark(#FFFFFF, #06272C)`,w=`light-dark(rgba(14, 116, 144, 0.10), rgba(83, 221, 242, 0.14))`,T=`light-dark(#15803D, #4ADE80)`,E=`light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))`,D=`light-dark(#B45309, #FBBF24)`,O=`light-dark(rgba(180, 83, 9, 0.10), rgba(251, 191, 36, 0.14))`,k=`light-dark(#DC2626, #F87171)`,A=`light-dark(rgba(220, 38, 38, 0.09), rgba(248, 113, 113, 0.14))`,j=`light-dark(rgba(14, 116, 144, 0.10), rgba(83, 221, 242, 0.08))`,M=582,N=810,P=835,F=12;function I(e){let t=Math.floor(e/60)%24,n=e%60;return`${String(t).padStart(2,`0`)}:${String(n).padStart(2,`0`)}`}function L(e){let t=Math.abs(e),n=Math.floor(t/60),r=t%60;return n===0?`${e<0?`−`:``}${r}m`:`${e<0?`−`:``}${n}h ${String(r).padStart(2,`0`)}m`}var R={BAC:{id:`BAC`,label:`E. coli (Colilert)`,method:`SM 9223B`,container:`250 mL sterile poly`,preservative:`Na₂S₂O₃ · ≤10 °C`,holdMin:360,holdLabel:`6 h`},NUT:{id:`NUT`,label:`Nitrate + nitrite`,method:`EPA 353.2`,container:`500 mL poly`,preservative:`H₂SO₄ to pH <2 · ≤6 °C`,holdMin:2880,holdLabel:`48 h`},TP:{id:`TP`,label:`Total phosphorus`,method:`SM 4500-P E`,container:`125 mL poly`,preservative:`H₂SO₄ to pH <2`,holdMin:40320,holdLabel:`28 d`},TSS:{id:`TSS`,label:`Total suspended solids`,method:`SM 2540 D`,container:`1 L poly`,preservative:`≤6 °C`,holdMin:10080,holdLabel:`7 d`},ME:{id:`ME`,label:`Dissolved metals (Cu, Zn, Pb)`,method:`EPA 200.8`,container:`500 mL poly · field-filtered 0.45 µm`,preservative:`HNO₃ to pH <2`,holdMin:259200,holdLabel:`6 mo`}},z={id:`WQ-2026-081`,title:`Alder Creek watershed · Thu Jul 9, 2026`,crew:`Crew 2 — R. Okafor · D. Whitfield`,cooler:`Cooler C2 · wet ice · 3.8 °C at 09:30 check`,lab:`Cascade Analytical, Fairhaven`},B=[{id:`S-01`,order:1,name:`Alder Creek at River Rd bridge`,kind:`mainstem`,x:100,y:452,panel:[`BAC`,`NUT`,`TP`],seedCollectedMin:425},{id:`S-02`,order:2,name:`Alder Creek below Barlow weir`,kind:`mainstem`,x:215,y:388,panel:[`BAC`,`NUT`,`TSS`],seedCollectedMin:484},{id:`S-03`,order:3,name:`Millrace Slough confluence`,kind:`confluence`,x:330,y:300,panel:[`BAC`,`NUT`,`TP`,`ME`],seedCollectedMin:511},{id:`S-04`,order:4,name:`Millrace Slough at Quarry Rd culvert`,kind:`tributary`,x:228,y:208,panel:[`BAC`,`TSS`],seedCollectedMin:538},{id:`S-05`,order:5,name:`Alder Creek at Fairhaven gauge (USGS 14211814)`,kind:`mainstem`,x:432,y:243,panel:[`BAC`,`NUT`,`TP`]},{id:`S-06`,order:6,name:`Cold Spring Branch at Larkin Meadow`,kind:`tributary`,x:565,y:272,panel:[`BAC`,`NUT`,`ME`],note:`Access gate locked — call ranger dispatch before entry.`},{id:`S-07`,order:7,name:`Cold Spring Branch headwater spring box`,kind:`tributary`,x:698,y:312,panel:[`BAC`,`BACFD`,`NUT`,`TP`],note:`QA plan requires a field duplicate for E. coli at this site.`},{id:`S-08`,order:8,name:`Unnamed trib below Fairhaven WWTP Outfall 002 (right bank)`,kind:`outfall`,x:512,y:168,panel:[`BAC`,`NUT`,`TP`,`TSS`,`ME`],note:`Expanded panel — permit compliance point downstream of Outfall 002.`},{id:`S-09`,order:9,name:`Alder Creek headwaters at Forest Rd 23`,kind:`mainstem`,x:662,y:78,panel:[`BAC`,`NUT`]}],V=new Map(B.map(e=>[e.id,e])),H={mainstem:`Mainstem`,tributary:`Tributary`,confluence:`Confluence`,outfall:`Outfall reach`};function ie(e,t){let n=t.find(t=>t.siteId===e.id);return n==null?e.seedCollectedMin==null?{state:`pending`}:{state:`collected`,stamp:e.seedCollectedMin,viaEvent:!1}:{state:n.kind,stamp:n.stamp,viaEvent:!0}}function U(e,t){return e.panel.map(n=>{let r=n===`BACFD`,i=R[r?`BAC`:n],a=`WQ-081-${e.id.replace(`-`,``)}-${r?`BAC-FD`:i.id}`;if(t.state===`dry`)return{bottleId:a,siteId:e.id,analyte:i,isFieldDup:r,hold:`nosample`};if(t.state===`pending`)return{bottleId:a,siteId:e.id,analyte:i,isFieldDup:r,hold:`awaiting`};let o=t.stamp+i.holdMin,s=o-P,c=s<0?`expiring`:s<45?`tight`:`ok`;return{bottleId:a,siteId:e.id,analyte:i,isFieldDup:r,hold:c,expiresMin:o,labMarginMin:s,collectedMin:t.stamp}})}var W={awaiting:{label:`Awaiting collection`,color:`var(--color-text-secondary)`,tint:`transparent`},ok:{label:`On ice · OK`,color:T,tint:E},tight:{label:`Tight hold`,color:D,tint:O},expiring:{label:`Expires pre-receipt`,color:k,tint:A},nosample:{label:`No sample — site dry`,color:k,tint:A}},ae=`
.${x} {
  height: 100dvh;
  min-height: 0;
  display: flex;
  flex-direction: column;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
  background: var(--color-background-body);
}
.${x} .wqs-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.${x} button {
  font: inherit;
  color: inherit;
}
.${x} :is(button, [role='button']):focus-visible {
  outline: 2px solid ${S};
  outline-offset: 2px;
}
/* ---- header chips (22px) ------------------------------------------------ */
.${x} .wqs-brandmark {
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: ${w};
  flex-shrink: 0;
}
.${x} .wqs-chiprow {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.${x} .wqs-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 22px;
  padding: 0 8px;
  border-radius: 11px;
  border: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  background: var(--color-background-body);
}
.${x} .wqs-chip[data-tone='brand'] { color: ${S}; background: ${w}; border-color: transparent; }
.${x} .wqs-chip[data-tone='ok'] { color: ${T}; background: ${E}; border-color: transparent; }
.${x} .wqs-chip[data-tone='tight'] { color: ${D}; background: ${O}; border-color: transparent; }
.${x} .wqs-chip[data-tone='expire'] { color: ${k}; background: ${A}; border-color: transparent; }
/* ---- frame: 1fr work column + 380px custody rail ------------------------ */
.${x} .wqs-frame {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
}
.${x} .wqs-work {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-right: var(--border-width) solid var(--color-border);
}
/* ---- map stage (330px) --------------------------------------------------- */
.${x} .wqs-mapstage {
  position: relative;
  height: 330px;
  flex-shrink: 0;
  border-bottom: var(--border-width) solid var(--color-border);
  background: var(--color-background-muted);
  overflow: hidden;
}
.${x} .wqs-mapsvg {
  display: block;
  width: 100%;
  height: 100%;
}
.${x} .wqs-pin {
  cursor: pointer;
}
.${x} .wqs-pin circle,
.${x} .wqs-pin path,
.${x} .wqs-pin polygon {
  transition: transform 150ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .${x} .wqs-pin circle,
  .${x} .wqs-pin path,
  .${x} .wqs-pin polygon,
  .${x} .wqs-runleg { transition: none; }
}
.${x} .wqs-maplegend {
  position: absolute;
  bottom: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 8px;
  border: var(--border-width) solid var(--color-border);
  background: color-mix(in srgb, var(--color-background-body) 90%, transparent);
  pointer-events: none;
}
.${x} .wqs-legendrow {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
/* ---- manifest table ------------------------------------------------------ */
.${x} .wqs-manifest {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.${x} .wqs-manifesthead {
  position: sticky;
  top: 0;
  z-index: 2;
  display: grid;
  grid-template-columns: 148px minmax(0, 1fr) minmax(0, 1fr) 168px;
  gap: var(--spacing-2);
  align-items: center;
  height: 32px;
  padding: 0 var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
  background: var(--color-background-body);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
/* Site group header: a full-row 32px button; aria-pressed = selected site. */
.${x} .wqs-grouprow {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  width: 100%;
  min-height: 32px;
  padding: 2px var(--spacing-4);
  border: none;
  border-bottom: var(--border-width) solid var(--color-border);
  background: var(--color-background-muted);
  text-align: left;
  cursor: pointer;
}
.${x} .wqs-grouprow[aria-pressed='true'] {
  background: ${w};
  box-shadow: inset 2px 0 0 0 ${S};
}
.${x} .wqs-groupcode {
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: ${S};
  flex-shrink: 0;
  width: 34px;
}
.${x} .wqs-groupname {
  min-width: 0;
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${x} .wqs-groupmeta {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  flex-shrink: 0;
}
/* Bottle rows: 40px, four columns matching the sticky head. */
.${x} .wqs-bottlerow {
  display: grid;
  grid-template-columns: 148px minmax(0, 1fr) minmax(0, 1fr) 168px;
  gap: var(--spacing-2);
  align-items: center;
  min-height: 40px;
  padding: 0 var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${x} .wqs-bottlerow[data-selected='true'] {
  background: color-mix(in srgb, var(--color-background-muted) 60%, transparent);
}
.${x} .wqs-bottleid {
  font-size: 12px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${x} .wqs-analyte {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.${x} .wqs-analyte .wqs-primary {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${x} .wqs-analyte .wqs-secondary,
.${x} .wqs-container {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${x} .wqs-holdcell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}
.${x} .wqs-holdchip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 22px;
  padding: 0 8px;
  border-radius: 11px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.${x} .wqs-holdsub {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
/* ---- custody rail (380px) ------------------------------------------------ */
.${x} .wqs-rail {
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}
.${x} .wqs-railsection {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
.${x} .wqs-railtitle {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}
.${x} .wqs-overline {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.${x} .wqs-notebox {
  padding: 8px 10px;
  border-radius: 8px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-muted);
  font-size: 12px;
  line-height: 1.45;
  color: var(--color-text-secondary);
}
.${x} .wqs-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}
/* Custody spine: 52px events with a rail dot + connector. */
.${x} .wqs-spine {
  display: flex;
  flex-direction: column;
}
.${x} .wqs-event {
  position: relative;
  display: flex;
  gap: var(--spacing-3);
  min-height: 52px;
  padding-left: 2px;
}
.${x} .wqs-eventdot {
  position: relative;
  width: 12px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}
.${x} .wqs-eventdot::before {
  content: '';
  position: absolute;
  top: 16px;
  bottom: -4px;
  width: 2px;
  background: var(--color-border);
}
.${x} .wqs-event:last-child .wqs-eventdot::before { display: none; }
.${x} .wqs-eventdot::after {
  content: '';
  position: absolute;
  top: 4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  background: var(--color-background-body);
}
.${x} .wqs-event[data-done='true'] .wqs-eventdot::after {
  border-color: ${S};
  background: ${S};
}
.${x} .wqs-event[data-alert='true'] .wqs-eventdot::after {
  border-color: ${k};
  background: ${k};
}
.${x} .wqs-eventbody {
  min-width: 0;
  padding-bottom: var(--spacing-2);
}
.${x} .wqs-eventtitle { font-size: 13px; font-weight: 500; }
.${x} .wqs-event[data-done='false'] .wqs-eventtitle { color: var(--color-text-secondary); font-weight: 400; }
.${x} .wqs-eventmeta {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
/* Deadline board: 44px rows sorted by lab margin. */
.${x} .wqs-deadline {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 44px;
  padding: 4px 8px;
  border-radius: 8px;
}
.${x} .wqs-deadline + .wqs-deadline { margin-top: 4px; }
.${x} .wqs-deadlinebody { min-width: 0; flex: 1; }
.${x} .wqs-deadlineid {
  font-size: 12px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${x} .wqs-deadlinemeta {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${x} .wqs-margin {
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
/* ---- responsive subtraction ---------------------------------------------- */
@media (max-width: 980px) {
  .${x} { height: auto; min-height: 100dvh; }
  .${x} .wqs-frame { grid-template-columns: minmax(0, 1fr); }
  .${x} .wqs-work { border-right: none; }
  .${x} .wqs-manifest { flex: none; max-height: 480px; }
  .${x} .wqs-rail { border-top: var(--border-width) solid var(--color-border); }
}
@media (max-width: 640px) {
  .${x} .wqs-manifesthead,
  .${x} .wqs-bottlerow { grid-template-columns: minmax(0, 1fr) 148px; }
  .${x} .wqs-bottleid, .${x} .wqs-container,
  .${x} .wqs-manifesthead > :nth-child(1),
  .${x} .wqs-manifesthead > :nth-child(3) { display: none; }
  .${x} .wqs-groupmeta { display: none; }
  .${x} .wqs-actions > * { width: 100%; }
  .${x} .wqs-mapstage { height: 300px; }
}
`;function oe(){return(0,b.jsxs)(`svg`,{width:20,height:20,viewBox:`0 0 20 20`,"aria-hidden":!0,focusable:`false`,children:[(0,b.jsx)(`path`,{d:`M3 3 C 5 8, 7 10, 10 11.5`,fill:`none`,stroke:S,strokeWidth:2,strokeLinecap:`round`}),(0,b.jsx)(`path`,{d:`M17 3 C 15 8, 13 10, 10 11.5`,fill:`none`,stroke:S,strokeWidth:2,strokeLinecap:`round`}),(0,b.jsx)(`path`,{d:`M10 5.5 V 11.5`,fill:`none`,stroke:S,strokeWidth:2,strokeLinecap:`round`}),(0,b.jsx)(`path`,{d:`M10 11.5 C 10 14.5, 10 16, 10 17.5`,fill:`none`,stroke:S,strokeWidth:2.6,strokeLinecap:`round`})]})}var G=[{id:`mainstem`,label:`Alder Creek`,d:`M 690 50 C 620 120 560 170 470 220 C 380 270 300 330 230 380 C 170 424 120 450 60 480`,width:9},{id:`millrace`,label:`Millrace Slough`,d:`M 150 110 C 200 180 260 240 330 300`,width:5.5},{id:`coldspring`,label:`Cold Spring Branch`,d:`M 720 316 C 640 300 555 280 462 236`,width:5.5},{id:`unnamed`,label:``,d:`M 545 118 C 530 142 512 172 480 210`,width:3.5}],K=[{x:520,y:196,angle:208},{x:292,y:336,angle:216},{x:128,y:446,angle:222}];function se({statuses:e,selectedId:t,onSelect:n}){let r=[...B].sort((e,t)=>e.order-t.order);return(0,b.jsxs)(`svg`,{className:`wqs-mapsvg`,viewBox:`0 0 760 520`,preserveAspectRatio:`xMidYMid meet`,role:`group`,"aria-label":`Schematic map of the Alder Creek watershed with nine sampling sites`,children:[(0,b.jsx)(`path`,{d:`M 690 50 C 620 120 560 170 470 220 C 380 270 300 330 230 380 C 170 424 120 450 60 480 L 60 520 L 760 520 L 760 50 Z`,fill:j,opacity:.35}),G.map(e=>(0,b.jsx)(`path`,{d:e.d,fill:`none`,stroke:S,strokeOpacity:.55,strokeWidth:e.width,strokeLinecap:`round`},e.id)),(0,b.jsx)(`text`,{x:352,y:452,fontSize:12,fontStyle:`italic`,fill:`var(--color-text-secondary)`,children:`Alder Creek`}),(0,b.jsx)(`text`,{x:132,y:158,fontSize:11,fontStyle:`italic`,fill:`var(--color-text-secondary)`,children:`Millrace Slough`}),(0,b.jsx)(`text`,{x:556,y:320,fontSize:11,fontStyle:`italic`,fill:`var(--color-text-secondary)`,children:`Cold Spring Branch`}),K.map(e=>(0,b.jsx)(`g`,{transform:`translate(${e.x} ${e.y}) rotate(${e.angle})`,"aria-hidden":!0,children:(0,b.jsx)(`polyline`,{points:`-5,-4 3,0 -5,4`,fill:`none`,stroke:S,strokeWidth:2,strokeLinecap:`round`,strokeLinejoin:`round`,opacity:.8})},`${e.x}-${e.y}`)),(0,b.jsxs)(`g`,{"aria-hidden":!0,children:[(0,b.jsx)(`rect`,{x:536,y:92,width:18,height:18,rx:3,fill:`var(--color-background-body)`,stroke:`var(--color-text-secondary)`,strokeWidth:1.5}),(0,b.jsx)(`path`,{d:`M 540 106 v -6 h 3 v 6 m 2 0 v -8 h 3 v 8`,fill:`none`,stroke:`var(--color-text-secondary)`,strokeWidth:1.4}),(0,b.jsx)(`text`,{x:560,y:100,fontSize:10,fill:`var(--color-text-secondary)`,children:`WWTP Outfall 002`})]}),r.slice(0,-1).map((t,n)=>{let i=r[n+1],a=e.get(i.id),o=a!=null&&a.state!==`pending`;return(0,b.jsx)(`line`,{className:`wqs-runleg`,x1:t.x,y1:t.y,x2:i.x,y2:i.y,stroke:o?S:`var(--color-text-secondary)`,strokeOpacity:o?.9:.35,strokeWidth:o?2.5:1.5,strokeDasharray:o?void 0:`4 5`},`leg-${t.id}`)}),r.map(r=>{let i=e.get(r.id)??{state:`pending`},a={state:i.state,selected:r.id===t},o=i.state===`collected`?`collected at ${I(i.stamp)}`:i.state===`dry`?`marked dry at ${I(i.stamp)}`:`pending collection`;return(0,b.jsxs)(`g`,{className:`wqs-pin`,role:`button`,tabIndex:0,"aria-pressed":a.selected,"aria-label":`${r.id} — ${r.name}, ${o}`,onClick:()=>n(r.id),onKeyDown:e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),n(r.id))},children:[(0,b.jsx)(`circle`,{cx:r.x,cy:r.y,r:16,fill:`transparent`}),a.selected&&(0,b.jsx)(`circle`,{cx:r.x,cy:r.y,r:13.5,fill:`none`,stroke:S,strokeWidth:2}),a.state===`dry`?(0,b.jsxs)(`g`,{children:[(0,b.jsx)(`polygon`,{points:`${r.x},${r.y-10} ${r.x+10},${r.y+8} ${r.x-10},${r.y+8}`,fill:A,stroke:k,strokeWidth:2,strokeLinejoin:`round`}),(0,b.jsx)(`line`,{x1:r.x,y1:r.y-4,x2:r.x,y2:r.y+2,stroke:k,strokeWidth:2,strokeLinecap:`round`}),(0,b.jsx)(`circle`,{cx:r.x,cy:r.y+5.4,r:1.2,fill:k})]}):a.state===`collected`?(0,b.jsxs)(`g`,{children:[(0,b.jsx)(`circle`,{cx:r.x,cy:r.y,r:9,fill:S}),(0,b.jsx)(`path`,{d:`M ${r.x-4} ${r.y} l 3 3 l 5.5 -6`,fill:`none`,stroke:C,strokeWidth:2.2,strokeLinecap:`round`,strokeLinejoin:`round`})]}):(0,b.jsx)(`circle`,{cx:r.x,cy:r.y,r:9,fill:`var(--color-background-body)`,stroke:`var(--color-text-secondary)`,strokeWidth:2.4,strokeDasharray:`3 3`}),(0,b.jsx)(`text`,{x:r.x,y:r.y-16,textAnchor:`middle`,fontSize:11,fontWeight:600,fill:`var(--color-text-primary)`,stroke:`var(--color-background-muted)`,strokeWidth:3,paintOrder:`stroke`,pointerEvents:`none`,children:r.id})]},r.id)})]})}function ce({row:e}){let t=W[e.hold];return(0,b.jsxs)(`div`,{className:`wqs-holdcell`,children:[(0,b.jsxs)(`span`,{className:`wqs-holdchip`,style:{color:t.color,background:t.tint},children:[e.hold===`expiring`||e.hold===`nosample`?(0,b.jsx)(i,{icon:p,size:`xsm`,color:`inherit`}):e.hold===`ok`?(0,b.jsx)(i,{icon:l,size:`xsm`,color:`inherit`}):e.hold===`tight`?(0,b.jsx)(i,{icon:u,size:`xsm`,color:`inherit`}):null,t.label]}),e.expiresMin!=null&&e.labMarginMin!=null?(0,b.jsxs)(`span`,{className:`wqs-holdsub`,children:[`expires `,I(e.expiresMin),` ·`,` `,e.labMarginMin<0?`${L(e.labMarginMin)} vs 13:55 receipt`:`${L(e.labMarginMin)} margin`]}):(0,b.jsx)(`span`,{className:`wqs-holdsub`,children:e.hold===`awaiting`?`hold ${e.analyte.holdLabel} once drawn`:`run exception logged`})]})}function q(){let[e,t]=(0,y.useState)([]),[n,w]=(0,y.useState)(`S-05`),[T,E]=(0,y.useState)(``),D=(0,y.useMemo)(()=>{let t=new Map;for(let n of B)t.set(n.id,ie(n,e));return t},[e]),O=(0,y.useMemo)(()=>[...B].sort((e,t)=>e.order-t.order).map(e=>({site:e,status:D.get(e.id)??{state:`pending`},bottles:U(e,D.get(e.id)??{state:`pending`})})),[D]),j=O.filter(e=>e.status.state===`collected`).length,R=O.filter(e=>e.status.state===`dry`).length,G=O.flatMap(e=>e.bottles),K=G.filter(e=>e.hold===`ok`||e.hold===`tight`||e.hold===`expiring`).length,q=G.filter(e=>e.hold===`expiring`).length,J=G.filter(e=>e.hold===`tight`).length,Y=G.filter(e=>e.labMarginMin!=null).sort((e,t)=>(e.labMarginMin??0)-(t.labMarginMin??0)).slice(0,6),X=V.get(n)??B[0],Z=D.get(X.id)??{state:`pending`},le=U(X,Z),Q=M+F*e.length,ue=()=>{Z.state===`pending`&&(t(e=>{let t=M+F*e.length;return[...e,{siteId:X.id,kind:`collected`,stamp:t}]}),E(`${X.id} collected at ${I(Q)} — ${X.panel.length} bottles on ice, custody event appended, hold clocks started.`))},de=()=>{Z.state===`pending`&&(t(e=>{let t=M+F*e.length;return[...e,{siteId:X.id,kind:`dry`,stamp:t}]}),E(`${X.id} marked dry at ${I(Q)} — ${X.panel.length} bottles canceled, run exception logged.`))},fe=()=>{!(`viaEvent`in Z)||!Z.viaEvent||(t(e=>e.filter(e=>e.siteId!==X.id)),E(`Field log for ${X.id} undone — site is pending again.`))},$=e=>{w(e);let t=V.get(e);t!=null&&E(`Selected ${e} — ${t.name}.`)},pe=Z.state===`dry`?[{title:`Bottle set prepared`,meta:`05:40 · staging, Cooler C2`,done:!0},{title:`Site dry — no flow, no sample`,meta:`${I(Z.stamp)} · ${z.crew}`,done:!0,alert:!0},{title:`On ice — Cooler C2`,meta:`Not applicable — no sample`,done:!1},{title:`Courier pickup`,meta:`Not applicable — no sample`,done:!1},{title:`Lab receipt — ${z.lab}`,meta:`Not applicable — no sample`,done:!1}]:[{title:`Bottle set prepared`,meta:`05:40 · staging, Cooler C2`,done:!0},{title:`Sample collected`,meta:Z.state===`collected`?`${I(Z.stamp)} · ${z.crew}`:`Pending · next crew stamp ${I(Q)}`,done:Z.state===`collected`},{title:`On ice — Cooler C2`,meta:Z.state===`collected`?`${I(Z.stamp)} · with collection · wet ice`:`Follows collection`,done:Z.state===`collected`},{title:`Courier pickup`,meta:`${I(N)} · staging`,done:!1},{title:`Lab receipt — ${z.lab}`,meta:`${I(P)} · scheduled`,done:!1}];return(0,b.jsxs)(`div`,{className:x,children:[(0,b.jsx)(`style`,{children:ae}),(0,b.jsx)(`div`,{className:`wqs-vh`,"aria-live":`polite`,children:T}),(0,b.jsx)(g,{height:`fill`,header:(0,b.jsx)(ne,{hasDivider:!0,children:(0,b.jsxs)(te,{gap:3,vAlign:`center`,wrap:`wrap`,children:[(0,b.jsx)(`span`,{className:`wqs-brandmark`,children:(0,b.jsx)(oe,{})}),(0,b.jsx)(h,{size:`fill`,children:(0,b.jsxs)(m,{gap:0,children:[(0,b.jsxs)(re,{level:1,children:[`Tributary · Run `,z.id]}),(0,b.jsxs)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:[z.title,` · `,z.crew]})]})}),(0,b.jsxs)(`div`,{className:`wqs-chiprow`,children:[(0,b.jsxs)(`span`,{className:`wqs-chip`,"data-tone":`brand`,children:[(0,b.jsx)(i,{icon:u,size:`xsm`,color:`inherit`}),`Field clock `,I(M)]}),(0,b.jsxs)(`span`,{className:`wqs-chip`,children:[(0,b.jsx)(i,{icon:c,size:`xsm`,color:`inherit`}),j,`/`,B.length,` sites collected`]}),(0,b.jsxs)(`span`,{className:`wqs-chip`,children:[(0,b.jsx)(i,{icon:l,size:`xsm`,color:`inherit`}),K,` bottles on ice`]}),q>0&&(0,b.jsxs)(`span`,{className:`wqs-chip`,"data-tone":`expire`,children:[(0,b.jsx)(i,{icon:p,size:`xsm`,color:`inherit`}),q,` expiring`]}),J>0&&(0,b.jsxs)(`span`,{className:`wqs-chip`,"data-tone":`tight`,children:[(0,b.jsx)(i,{icon:u,size:`xsm`,color:`inherit`}),J,` tight`]}),q===0&&J===0&&(0,b.jsxs)(`span`,{className:`wqs-chip`,"data-tone":`ok`,children:[(0,b.jsx)(i,{icon:f,size:`xsm`,color:`inherit`}),`Holds clear`]}),R>0&&(0,b.jsxs)(`span`,{className:`wqs-chip`,"data-tone":`expire`,children:[R,` site`,R===1?``:`s`,` dry`]}),(0,b.jsxs)(`span`,{className:`wqs-chip`,children:[(0,b.jsx)(i,{icon:ee,size:`xsm`,color:`inherit`}),`Courier `,I(N),` → lab `,I(P)]})]})]})}),content:(0,b.jsx)(_,{padding:0,role:`main`,label:`Sampling run`,children:(0,b.jsxs)(`div`,{className:`wqs-frame`,children:[(0,b.jsxs)(`div`,{className:`wqs-work`,children:[(0,b.jsxs)(`div`,{className:`wqs-mapstage`,children:[(0,b.jsx)(se,{statuses:D,selectedId:n,onSelect:$}),(0,b.jsxs)(`div`,{className:`wqs-maplegend`,"aria-hidden":!0,children:[(0,b.jsxs)(`span`,{className:`wqs-legendrow`,children:[(0,b.jsxs)(`svg`,{width:14,height:14,viewBox:`0 0 14 14`,children:[(0,b.jsx)(`circle`,{cx:7,cy:7,r:5.5,fill:S}),(0,b.jsx)(`path`,{d:`M 4.4 7 l 1.8 1.8 l 3.4 -3.8`,fill:`none`,stroke:C,strokeWidth:1.6,strokeLinecap:`round`})]}),`Collected`]}),(0,b.jsxs)(`span`,{className:`wqs-legendrow`,children:[(0,b.jsx)(`svg`,{width:14,height:14,viewBox:`0 0 14 14`,children:(0,b.jsx)(`circle`,{cx:7,cy:7,r:5,fill:`none`,stroke:`var(--color-text-secondary)`,strokeWidth:1.8,strokeDasharray:`2.4 2.4`})}),`Pending`]}),(0,b.jsxs)(`span`,{className:`wqs-legendrow`,children:[(0,b.jsx)(`svg`,{width:14,height:14,viewBox:`0 0 14 14`,children:(0,b.jsx)(`polygon`,{points:`7,1.5 13,12.5 1,12.5`,fill:A,stroke:k,strokeWidth:1.4,strokeLinejoin:`round`})}),`Dry / exception`]})]})]}),(0,b.jsxs)(`div`,{className:`wqs-manifest`,role:`region`,"aria-label":`Bottle manifest`,children:[(0,b.jsxs)(`div`,{className:`wqs-manifesthead`,"aria-hidden":!0,children:[(0,b.jsx)(`span`,{children:`Bottle`}),(0,b.jsx)(`span`,{children:`Analyte · method`}),(0,b.jsx)(`span`,{children:`Container · preservative`}),(0,b.jsx)(`span`,{children:`Hold status`})]}),O.map(e=>(0,b.jsxs)(`div`,{children:[(0,b.jsxs)(`button`,{type:`button`,className:`wqs-grouprow`,"aria-pressed":e.site.id===n,onClick:()=>$(e.site.id),children:[(0,b.jsx)(`span`,{className:`wqs-groupcode`,children:e.site.id}),(0,b.jsx)(`span`,{className:`wqs-groupname`,children:e.site.name}),(0,b.jsxs)(`span`,{className:`wqs-groupmeta`,children:[e.status.state===`collected`?`collected ${I(e.status.stamp)}`:e.status.state===`dry`?`dry ${I(e.status.stamp)}`:`stop ${e.site.order} · pending`,` · `,e.bottles.length,` bottle`,e.bottles.length===1?``:`s`]})]}),e.bottles.map(t=>(0,b.jsxs)(`div`,{className:`wqs-bottlerow`,"data-selected":e.site.id===n,children:[(0,b.jsx)(`span`,{className:`wqs-bottleid`,children:t.bottleId}),(0,b.jsxs)(`span`,{className:`wqs-analyte`,children:[(0,b.jsxs)(`span`,{className:`wqs-primary`,children:[t.analyte.label,t.isFieldDup?` — field duplicate`:``]}),(0,b.jsxs)(`span`,{className:`wqs-secondary`,children:[t.analyte.method,` · hold `,t.analyte.holdLabel]})]}),(0,b.jsxs)(`span`,{className:`wqs-container`,children:[t.analyte.container,` · `,t.analyte.preservative]}),(0,b.jsx)(ce,{row:t})]},t.bottleId))]},e.site.id))]})]}),(0,b.jsxs)(`div`,{className:`wqs-rail`,role:`complementary`,"aria-label":`Site custody`,children:[(0,b.jsxs)(`div`,{className:`wqs-railsection`,children:[(0,b.jsxs)(`span`,{className:`wqs-overline`,children:[`Stop `,X.order,` of `,B.length,` · `,H[X.kind]]}),(0,b.jsxs)(`h2`,{className:`wqs-railtitle`,children:[X.id,` — `,X.name]}),X.note!=null&&(0,b.jsx)(`div`,{className:`wqs-notebox`,children:X.note}),(0,b.jsx)(`div`,{className:`wqs-chiprow`,children:Z.state===`collected`?(0,b.jsxs)(`span`,{className:`wqs-chip`,"data-tone":`ok`,children:[(0,b.jsx)(i,{icon:f,size:`xsm`,color:`inherit`}),`Collected `,I(Z.stamp)]}):Z.state===`dry`?(0,b.jsxs)(`span`,{className:`wqs-chip`,"data-tone":`expire`,children:[(0,b.jsx)(i,{icon:p,size:`xsm`,color:`inherit`}),`Dry `,I(Z.stamp)]}):(0,b.jsxs)(`span`,{className:`wqs-chip`,children:[(0,b.jsx)(i,{icon:o,size:`xsm`,color:`inherit`}),`Pending · `,le.length,` bottles staged`]})}),(0,b.jsxs)(`div`,{className:`wqs-actions`,children:[Z.state===`pending`&&(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(v,{label:`Log collection · ${I(Q)}`,icon:(0,b.jsx)(i,{icon:a,size:`sm`}),onClick:ue}),(0,b.jsx)(v,{label:`Mark site dry`,variant:`secondary`,icon:(0,b.jsx)(i,{icon:p,size:`sm`}),onClick:de})]}),`viaEvent`in Z&&Z.viaEvent&&(0,b.jsx)(v,{label:`Undo field log`,variant:`ghost`,icon:(0,b.jsx)(i,{icon:d,size:`sm`}),onClick:fe}),Z.state===`collected`&&!(`viaEvent`in Z&&Z.viaEvent)&&(0,b.jsx)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:`Logged before this session — custody locked.`})]})]}),(0,b.jsxs)(`div`,{className:`wqs-railsection`,children:[(0,b.jsx)(`span`,{className:`wqs-overline`,children:`Chain of custody`}),(0,b.jsx)(`div`,{className:`wqs-spine`,children:pe.map(e=>(0,b.jsxs)(`div`,{className:`wqs-event`,"data-done":e.done,"data-alert":e.alert===!0,children:[(0,b.jsx)(`span`,{className:`wqs-eventdot`,"aria-hidden":!0}),(0,b.jsxs)(`div`,{className:`wqs-eventbody`,children:[(0,b.jsx)(`div`,{className:`wqs-eventtitle`,children:e.title}),(0,b.jsx)(`div`,{className:`wqs-eventmeta`,children:e.meta})]})]},e.title))}),(0,b.jsx)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:z.cooler})]}),(0,b.jsxs)(`div`,{className:`wqs-railsection`,children:[(0,b.jsxs)(`span`,{className:`wqs-overline`,children:[`Tightest holds · vs `,I(P),` lab receipt`]}),Y.map(e=>{let t=W[e.hold];return(0,b.jsxs)(`div`,{className:`wqs-deadline`,style:{background:t.tint},children:[(0,b.jsx)(i,{icon:s,size:`sm`,color:`secondary`}),(0,b.jsxs)(`div`,{className:`wqs-deadlinebody`,children:[(0,b.jsx)(`div`,{className:`wqs-deadlineid`,children:e.bottleId}),(0,b.jsxs)(`div`,{className:`wqs-deadlinemeta`,children:[e.analyte.label,` · collected`,` `,e.collectedMin==null?`—`:I(e.collectedMin),` · expires `,e.expiresMin==null?`—`:I(e.expiresMin)]})]}),(0,b.jsx)(`span`,{className:`wqs-margin`,style:{color:t.color},children:e.labMarginMin==null?`—`:L(e.labMarginMin)})]},e.bottleId)}),Y.some(e=>e.hold===`expiring`)&&(0,b.jsxs)(`div`,{className:`wqs-notebox`,children:[`A bottle expires before the `,I(P),` receipt — radio the courier for an early walk-in at `,z.lab,`, or the result is reported with a hold-time qualifier.`]})]})]})]})})})]})}export{q as default};