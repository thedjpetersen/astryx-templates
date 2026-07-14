import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-o6Mx44T8.js";import{t as i}from"./Icon-CLHSQIsB.js";import{t as a}from"./anchor-BYwADVtM.js";import{t as o}from"./ship-DrRL7MAf.js";import{t as s}from"./waves-horizontal-BCsxrLhK.js";import{A as c,S as l,i as u,o as d,x as f}from"./index-CcGpqB1l.js";import{t as p}from"./Tooltip-XDRm9Z-w.js";import{t as m}from"./HStack-2WTukjNp.js";import{t as h}from"./VStack-B8U-hI0Y.js";import{t as g}from"./StackItem-Ca9P7L2I.js";import{n as ee,t as te}from"./LayoutContent-CCL91W7X.js";import{t as ne}from"./LayoutHeader-Cy2mWoMf.js";import{t as _}from"./Heading-D2LUKpOk.js";import{t as v}from"./useMediaQuery-BvG63aw7.js";import{t as y}from"./Button-DzizYIpc.js";import{t as b}from"./Divider-BHIBe6GQ.js";import{t as re}from"./StatusDot-sQCtn0hI.js";import{t as x}from"./Token-DUekYPIP.js";import{t as S}from"./Avatar-DyaNw-yT.js";var C=c(`construction`,[[`rect`,{x:`2`,y:`6`,width:`20`,height:`8`,rx:`1`,key:`1estib`}],[`path`,{d:`M17 14v7`,key:`7m2elx`}],[`path`,{d:`M7 14v7`,key:`1cm7wv`}],[`path`,{d:`M17 3v3`,key:`1v4jwn`}],[`path`,{d:`M7 3v3`,key:`7o6guu`}],[`path`,{d:`M10 14 2.3 6.3`,key:`1023jk`}],[`path`,{d:`m14 6 7.7 7.7`,key:`1s8pl2`}],[`path`,{d:`m8 6 8 8`,key:`hl96qh`}]]),w=e(t(),1),T=n(),E=`light-dark(#1E3A8A, #93C5FD)`,D=`light-dark(#DC2626, #F87171)`,O=`light-dark(rgba(220, 38, 38, 0.08), rgba(248, 113, 113, 0.14))`,k=`light-dark(#B45309, #FBBF24)`,A=`light-dark(rgba(180, 83, 9, 0.10), rgba(251, 191, 36, 0.16))`,j=`var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))`,ie=`light-dark(rgba(1, 113, 227, 0.10), rgba(76, 158, 255, 0.14))`,M=`light-dark(#475569, #94A3B8)`,N=`light-dark(rgba(71, 85, 105, 0.10), rgba(148, 163, 184, 0.16))`,P=`light-dark(rgba(220, 38, 38, 0.30), rgba(248, 113, 113, 0.34))`,F=12,I=`var(--font-family-code, ui-monospace, monospace)`,ae=`tpl-port-berth-planner`,L=`.${ae}`,oe=`
${L} { height: 100dvh; width: 100%; font-family: var(--font-family-sans); }
${L} .pbp-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
${L} .pbp-fade { transition: opacity 160ms ease, background-color 160ms ease, box-shadow 160ms ease; }
${L} .pbp-header {
  display: flex; align-items: center; gap: ${F}px;
  height: 48px; padding: 0 ${F}px;
}
${L} .pbp-logo { display: inline-flex; align-items: center; flex-shrink: 0; }
${L} .pbp-mono {
  font-family: ${I}; font-size: 12px;
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
${L} .pbp-sectionlabel {
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--color-text-secondary); white-space: nowrap;
}
${L} .pbp-chip {
  display: inline-flex; align-items: center; gap: 6px;
  height: 24px; padding: 0 8px; border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background);
  font-size: 12px; font-variant-numeric: tabular-nums; white-space: nowrap;
  color: var(--color-text-primary);
}
${L} .pbp-chip-danger { border-color: ${D}; background: ${O}; color: ${D}; }
${L} .pbp-chip-warn { border-color: ${k}; background: ${A}; color: ${k}; }
${L} .pbp-viewroot {
  display: flex; height: 100%; min-height: 0;
  overflow: hidden; position: relative;
}
${L} .pbp-maincol { flex: 1; min-width: 0; display: flex; flex-direction: column; min-height: 0; }
/* Anchorage strip 48px — waiting arrivals as dashed chips. */
${L} .pbp-anchorage {
  display: flex; align-items: center; gap: ${F}px; height: 48px;
  padding: 0 ${F}px; flex-shrink: 0; overflow: hidden;
  border-bottom: var(--border-width) solid var(--color-border);
}
${L} .pbp-anchorchip {
  appearance: none; display: inline-flex; align-items: center; gap: 6px;
  height: 32px; padding: 0 10px; border-radius: 999px;
  border: 1.5px dashed ${M}; background: transparent;
  font-family: inherit; font-size: 12px; color: var(--color-text-primary);
  cursor: pointer; white-space: nowrap;
}
${L} .pbp-anchorchip[aria-pressed="true"] { background: ${N}; }
/* Non-scrolling wrapper that owns the right-edge overflow affordance — the
   fade must NOT live on the scroller itself or it scrolls away with the
   content. */
${L} .pbp-boardviewport { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; }
${L} .pbp-scroller { flex: 1; min-height: 0; overflow: auto; position: relative; }
${L} .pbp-scrollhint {
  position: absolute; top: 0; right: 0; bottom: 0; width: 44px; z-index: 5;
  pointer-events: none; display: flex; align-items: center; justify-content: flex-end;
  padding-right: 3px;
  background: linear-gradient(to right, transparent, var(--color-background) 72%);
}
/* Time ruler 28px — sticky above tide strip + lanes inside the scroller. */
${L} .pbp-ruler {
  position: sticky; top: 0; z-index: 3; display: flex; height: 28px;
  background: var(--color-background);
}
${L} .pbp-rulerlabelcell {
  position: sticky; left: 0; z-index: 4; flex-shrink: 0;
  display: flex; align-items: flex-end; padding: 0 ${F}px 4px;
  background: var(--color-background);
  border-right: var(--border-width) solid var(--color-border);
  border-bottom: var(--border-width) solid var(--color-border);
}
${L} .pbp-rulertrack {
  position: relative; flex-shrink: 0;
  border-bottom: var(--border-width) solid var(--color-border);
}
${L} .pbp-hourtick {
  position: absolute; top: 16px; bottom: 0;
  border-left: var(--border-width) solid var(--color-border);
}
${L} .pbp-hourlabel {
  position: absolute; top: 2px; transform: translateX(-50%);
  font-family: ${I}; font-size: 10px; font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary); white-space: nowrap;
}
/* Tide strip 64px — the curve underlay row. */
${L} .pbp-tiderow { display: flex; align-items: stretch; height: 64px; }
${L} .pbp-tidelabel {
  position: sticky; left: 0; z-index: 2; flex-shrink: 0;
  display: flex; flex-direction: column; justify-content: center; gap: 1px;
  padding: 0 ${F}px; overflow: hidden;
  background: var(--color-background);
  border-right: var(--border-width) solid var(--color-border);
  border-bottom: var(--border-width) solid var(--color-border);
}
${L} .pbp-tidetrack {
  position: relative; flex-shrink: 0; overflow: hidden;
  border-bottom: var(--border-width) solid var(--color-border);
}
/* Berth lanes 68px. */
${L} .pbp-lane { display: flex; align-items: stretch; height: 68px; }
${L} .pbp-lanelabel {
  position: sticky; left: 0; z-index: 2; flex-shrink: 0;
  display: flex; flex-direction: column; justify-content: center; gap: 1px;
  padding: 0 ${F}px; overflow: hidden;
  background: var(--color-background);
  border-right: var(--border-width) solid var(--color-border);
  border-bottom: var(--border-width) solid var(--color-border);
}
${L} .pbp-lanelabel-name {
  font-size: 12px; font-weight: 600; color: var(--color-text-primary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
${L} .pbp-lanelabel-sub {
  font-size: 10px; color: var(--color-text-secondary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
${L} .pbp-lanetrack {
  position: relative; flex-shrink: 0;
  border-bottom: var(--border-width) solid var(--color-border);
}
${L} .pbp-lanegrid {
  position: absolute; top: 0; bottom: 0;
  border-left: var(--border-width) solid var(--color-border);
  opacity: 0.5; pointer-events: none;
}
/* Vessel block — a real button, 52px tall, centered in the 68px lane. */
${L} .pbp-block {
  position: absolute; top: 8px; height: 52px;
  appearance: none; border: none; margin: 0;
  display: flex; flex-direction: column; align-items: flex-start;
  justify-content: center; gap: 2px;
  padding: 0 8px; border-radius: 6px;
  background: ${N};
  box-shadow: inset 0 0 0 1px ${M};
  font-family: inherit; font-size: 12px; color: var(--color-text-primary);
  cursor: pointer; overflow: hidden; white-space: nowrap; text-align: left;
}
${L} .pbp-block:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
/* BRAND usage 2 of 2: the selected block's 2px harbor-navy outline. */
${L} .pbp-block-selected { box-shadow: inset 0 0 0 2px ${E}; }
${L} .pbp-block-violation {
  background-image: repeating-linear-gradient(45deg, ${P} 0px, ${P} 2px, transparent 2px, transparent 9px);
  box-shadow: inset 0 0 0 1px ${D};
}
${L} .pbp-block-selected.pbp-block-violation { box-shadow: inset 0 0 0 2px ${E}, inset 0 0 0 3px ${D}; }
${L} .pbp-blockline { display: flex; align-items: center; gap: 6px; max-width: 100%; }
${L} .pbp-blockname {
  overflow: hidden; text-overflow: ellipsis; min-width: 0; font-weight: 600;
}
${L} .pbp-cranetag {
  display: inline-flex; align-items: center; height: 14px; padding: 0 4px;
  border-radius: 3px; flex-shrink: 0;
  border: var(--border-width) solid var(--color-border);
  font-family: ${I}; font-size: 9px; color: var(--color-text-secondary);
}
${L} .pbp-cranetag-clash { border-color: ${k}; color: ${k}; background: ${A}; }
${L} .pbp-badge {
  display: inline-flex; align-items: center; gap: 3px; flex-shrink: 0;
  font-family: ${I}; font-size: 10px; font-variant-numeric: tabular-nums;
}
${L} .pbp-badge-danger { color: ${D}; }
${L} .pbp-badge-warn { color: ${k}; }
@keyframes pbp-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
${L} .pbp-pulse { animation: pbp-pulse 2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  ${L} .pbp-pulse { animation: none; }
  ${L} .pbp-fade { transition: none; }
}
/* Legend strip 30px. */
${L} .pbp-legend {
  display: flex; align-items: center; gap: ${F}px; height: 30px;
  padding: 0 ${F}px; overflow: hidden; flex-shrink: 0;
  border-top: var(--border-width) solid var(--color-border);
}
${L} .pbp-legendkey { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
/* Aside 340px (320 mid; 340 overlay under 980). */
${L} .pbp-aside {
  flex: none; display: flex; flex-direction: column; min-height: 0;
  border-left: var(--border-width) solid var(--color-border);
  background: var(--color-background);
}
${L} .pbp-aside-overlay {
  position: absolute; top: 0; right: 0; bottom: 0; width: 340px; z-index: 6;
  box-shadow: var(--shadow-overlay, 0 8px 24px rgba(0, 0, 0, 0.18));
}
${L} .pbp-asidehead {
  display: flex; align-items: center; gap: ${F}px; height: 56px;
  padding: 0 ${F}px; flex-shrink: 0;
  border-bottom: var(--border-width) solid var(--color-border);
}
${L} .pbp-asidescroll { flex: 1; min-height: 0; overflow-y: auto; padding: ${F}px; }
${L} .pbp-asidefooter {
  display: flex; align-items: center; height: 32px; flex-shrink: 0;
  padding: 0 ${F}px;
  border-top: var(--border-width) solid var(--color-border);
}
${L} .pbp-detailrow { display: flex; align-items: center; gap: ${F}px; min-height: 32px; }
${L} .pbp-detaillabel { width: 84px; flex-shrink: 0; }
${L} .pbp-nudgegroup { display: inline-flex; align-items: center; gap: 6px; height: 40px; }
/* Crane toggle chips 28px — real buttons with aria-pressed. */
${L} .pbp-cranebtn {
  appearance: none; display: inline-flex; align-items: center; gap: 4px;
  height: 28px; padding: 0 10px; border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: transparent; font-family: ${I}; font-size: 11px;
  color: var(--color-text-primary); cursor: pointer; white-space: nowrap;
}
${L} .pbp-cranebtn[aria-pressed="true"] {
  background: ${N}; border-color: ${M}; font-weight: 600;
}
${L} .pbp-cranebtn-clash { border-color: ${k}; color: ${k}; background: ${A}; }
/* Berth reassign rows — 44px buttons with fit notes. */
${L} .pbp-berthbtn {
  appearance: none; display: flex; align-items: center; gap: ${F/2}px;
  width: 100%; min-height: 44px; padding: 0 ${F/2}px;
  border-radius: var(--radius-container);
  border: var(--border-width) solid var(--color-border);
  background: transparent; font-family: inherit; font-size: 12px;
  color: var(--color-text-primary); cursor: pointer; text-align: left;
}
${L} .pbp-berthbtn[aria-pressed="true"] { background: var(--color-background-muted); border-color: ${M}; }
${L} .pbp-berthbtn:disabled { cursor: not-allowed; opacity: 0.55; }
${L} .pbp-violationrow {
  display: flex; align-items: center; gap: 6px; min-height: 32px;
  padding: 0 ${F/2}px; border-radius: var(--radius-container);
  background: ${O}; color: ${D}; overflow: hidden;
}
${L} .pbp-violationrow-warn { background: ${A}; color: ${k}; }
/* Berth roster rows 44px. */
${L} .pbp-rosterrow {
  display: flex; align-items: center; gap: ${F/2}px; min-height: 44px;
  padding: 0 ${F/2}px; border-radius: var(--radius-container);
}
${L} .pbp-rosterrow-active { background: var(--color-background-muted); }
${L} .pbp-emptystate {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: ${F/2}px; padding: ${F*2}px;
  text-align: center;
}
${L} .pbp-visuallyhidden {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
`,R=6,z=4320,B=60,se=[`Thu`,`Fri`,`Sat`,`Sun`];function V(e){let t=R*60+e,n=se[Math.floor(t/1440)]??`Sun`,r=Math.floor(t/60)%24,i=t%60;return`${n} ${String(r).padStart(2,`0`)}:${String(i).padStart(2,`0`)}`}function H(e){let t=R*60+e,n=Math.floor(t/60)%24,r=t%60;return`${String(n).padStart(2,`0`)}:${String(r).padStart(2,`0`)}`}function U(e){let t=e>0?`+`:e<0?`−`:`±`,n=Math.abs(e),r=Math.floor(n/60),i=n%60;return`${t}${r}h ${String(i).padStart(2,`0`)}m`}var W=[4.2,5.4,6.2,6,5.1,3.9,2.7,1.8,1.3,1.5,2.3,3.5,4.7,5.7,6.3,6.1,5.3,4.1,2.9,1.9,1.4,1.4,2,3.1,4.3,5.3,5.9,6.3,5.9,5.2,4.2,3,1.9,1.4,1.6,2.4,3.6,4.8,5.8,6.3,6.2,5.4,4.2,3,2,1.5,1.4,2.1,3.2,4.4,5.4,6.1,6.3,5.8,4.8,3.6,2.4,1.6,1.3,1.6,2.5,3.7,4.9,5.9,6.3,6.1,5.2,4,2.8,1.8,1.3,1.5,2.3];function G(e){let t=Math.min(Math.max(e/60,0),72),n=Math.floor(t),r=t-n,i=W[n]??W[W.length-1];return i+((W[Math.min(n+1,W.length-1)]??i)-i)*r}function ce(e,t){let n=Math.min(G(e),G(t)),r=Math.ceil(e/60),i=Math.floor(t/60);for(let e=r;e<=i;e+=1){let t=W[Math.min(Math.max(e,0),72)];t!=null&&t<n&&(n=t)}return n}var K=`B1`,le=`B2`,ue=`B3`,de=`B4`,fe=`V-CORSTEN`,pe=`V-BALTIC`,me=`V-ARNA`,he=`V-MERIDIAN`,ge=`V-SABLE`,_e=`V-PELAGIA`,ve={name:`Marta Oyelaran`,initials:`MO`},q=.8,ye=12.4,be=1,xe=28,Se=2,Ce=[{id:K,name:`Berth 1 · Deepwater`,depthM:15.2,loaMaxM:330,craneIds:[`QC1`,`QC2`,`QC3`]},{id:le,name:`Berth 2 · Main quay`,depthM:14.4,loaMaxM:300,craneIds:[`QC3`,`QC4`]},{id:ue,name:`Berth 3 · Main quay`,depthM:12.6,loaMaxM:260,craneIds:[`QC4`,`QC5`]},{id:de,name:`Berth 4 · Feeder`,depthM:10.5,loaMaxM:185,craneIds:[`QC6`]}],J=new Map(Ce.map(e=>[e.id,e])),we=[{id:fe,name:`MV Corsten Reach`,voyage:`AEX-4 · 026W`,imo:`9743218`,loaM:294,beamM:40,draftM:13.6,moves:1840,berthId:K,etbMin:120,proFormaEtdMin:1500,craneIds:[`QC1`,`QC2`,`QC3`],requestedGangs:3,cargoNote:`412 reefers · 18 OOG flats aft`},{id:pe,name:`MV Baltic Merit`,voyage:`NSX-2 · 114E`,imo:`9587412`,loaM:252,beamM:35.2,draftM:13.3,moves:1120,berthId:ue,etbMin:240,proFormaEtdMin:1560,craneIds:[`QC4`,`QC5`],requestedGangs:2,cargoNote:`Laden import leg · deep sailing draft`},{id:me,name:`MV Arna Trader`,voyage:`FDR-9 · 891N`,imo:`9412776`,loaM:168,beamM:27.2,draftM:8.9,moves:420,berthId:de,etbMin:300,proFormaEtdMin:1260,craneIds:[`QC6`],requestedGangs:1,cargoNote:`Feeder relay to Skarven Sund`},{id:he,name:`MV Meridian Voyager Atlantic Express`,voyage:`AEX-4 · 027W`,imo:`9812043`,loaM:289,beamM:42.8,draftM:12.1,moves:1510,berthId:le,etbMin:1620,proFormaEtdMin:3300,craneIds:[`QC3`,`QC4`],requestedGangs:2,cargoNote:`388 reefers · hazmat class 3 on deck`},{id:ge,name:`MV Sable Wind`,voyage:`NSX-2 · 115W`,imo:`9650327`,loaM:199,beamM:30.4,draftM:10.2,moves:610,berthId:K,etbMin:1740,proFormaEtdMin:3120,craneIds:[`QC1`],requestedGangs:1,cargoNote:`Export empties sweep · 84 flat racks`},{id:_e,name:`MV Pelagia Dawn`,voyage:`MDS-7 · 442S`,imo:`9705589`,loaM:228,beamM:32.3,draftM:11.8,moves:940,berthId:null,etbMin:1440,proFormaEtdMin:2760,craneIds:[],requestedGangs:2,cargoNote:`At anchorage — awaiting berth assignment`}];function Y(e){return e.berthId==null?e.requestedGangs:e.craneIds.length}function X(e){let t=Math.max(Y(e),1);return(Math.ceil(e.moves/(xe*t))+Se)*60}function Z(e){return e.etbMin+X(e)}function Te(e){let t=[],n=e.filter(e=>e.berthId!=null);for(let e of n){let n=J.get(e.berthId??``);if(n==null)continue;let r=e.etbMin,i=Z(e),a=n.depthM+ce(r,Math.min(i,z)),o=e.draftM+q;a<o&&t.push({kind:`grounding`,vesselId:e.id,severity:`danger`,message:`Grounding risk at ${n.id}: ${a.toFixed(1)} m water at low tide < ${o.toFixed(1)} m required (${e.draftM.toFixed(1)} m draft + ${q.toFixed(1)} m UKC)`});let s=e.draftM+be-ye;i<=z&&s>0&&G(i)<s&&t.push({kind:`sailing-tide`,vesselId:e.id,severity:`danger`,message:`Sailing tide: ${G(i).toFixed(1)} m at ETD ${V(i)} < ${s.toFixed(1)} m needed for the 12.4 m channel`}),e.loaM>n.loaMaxM&&t.push({kind:`berth-overlap`,vesselId:e.id,severity:`danger`,message:`LOA ${e.loaM} m exceeds ${n.id} limit ${n.loaMaxM} m`}),e.craneIds.length===0&&t.push({kind:`no-crane`,vesselId:e.id,severity:`warn`,message:`No crane gang assigned — schedule assumes 1 gang (${Math.ceil(e.moves/xe)+Se} h alongside)`})}for(let e=0;e<n.length;e+=1)for(let r=e+1;r<n.length;r+=1){let i=n[e],a=n[r];if(i.etbMin<Z(a)&&Z(i)>a.etbMin){i.berthId===a.berthId&&t.push({kind:`berth-overlap`,vesselId:i.id,severity:`danger`,message:`${i.berthId} double-booked: ${i.name} and ${a.name} overlap ${V(Math.max(i.etbMin,a.etbMin))}–${V(Math.min(Z(i),Z(a)))}`});for(let e of i.craneIds)a.craneIds.includes(e)&&t.push({kind:`crane-double`,vesselId:i.id,severity:`warn`,message:`${e} double-booked: ${i.name} and ${a.name} overlap ${V(Math.max(i.etbMin,a.etbMin))}–${V(Math.min(Z(i),Z(a)))}`})}}return t}function Ee(e,t){let n=new Set;if(e.berthId==null)return n;for(let r of t)if(!(r.id===e.id||r.berthId==null)&&e.etbMin<Z(r)&&Z(e)>r.etbMin)for(let t of e.craneIds)r.craneIds.includes(t)&&n.add(t);return n}function De(e,t){let n=t.filter(t=>t.vesselId===e.id),r=[`${e.name}, voyage ${e.voyage}`,e.berthId==null?`at anchorage, ETA ${V(e.etbMin)}`:`berth ${e.berthId}, alongside ${V(e.etbMin)} to ${V(Z(e))}`,`${e.moves} moves, ${Y(e)} gang${Y(e)===1?``:`s`}`];return n.length>0&&r.push(`${n.length} violation${n.length===1?``:`s`}: ${n.map(e=>e.kind).join(`, `)}`),e.berthId!=null&&r.push(`arrow keys shift the window in 1 hour steps`),r.join(`, `)}function Oe(e){let[t,n]=(0,w.useState)(0);return(0,w.useEffect)(()=>{let t=e.current;if(t==null)return;let r=new ResizeObserver(e=>{let t=e[0]?.contentRect;t!=null&&n(t.width)});return r.observe(t),()=>r.disconnect()},[e]),t}function ke(){return(0,T.jsxs)(`svg`,{width:24,height:24,viewBox:`0 0 24 24`,"aria-hidden":!0,style:{flexShrink:0},children:[(0,T.jsx)(`path`,{d:`M3 8 H21`,fill:`none`,stroke:E,strokeWidth:2,strokeLinecap:`round`}),(0,T.jsx)(`circle`,{cx:8,cy:5,r:1.6,fill:E}),(0,T.jsx)(`circle`,{cx:16,cy:5,r:1.6,fill:E}),(0,T.jsx)(`path`,{d:`M3 14 Q7.5 10.5 12 14 T21 14`,fill:`none`,stroke:E,strokeWidth:2,strokeLinecap:`round`,opacity:.6}),(0,T.jsx)(`path`,{d:`M3 19 Q7.5 15.5 12 19 T21 19`,fill:`none`,stroke:E,strokeWidth:2,strokeLinecap:`round`,opacity:.35})]})}var Ae=7;function Q(e){return 60-e/Ae*56}function je({trackW:e,pxPerHour:t,selected:n}){let r=`M${W.map((e,n)=>`${(n*t).toFixed(1)},${Q(e).toFixed(1)}`).join(` L`)}`,i=`${r} L${e},64 L0,64 Z`,a=n!=null&&n.berthId!=null?n.draftM+be-ye:0,o=a>0,s=n!=null&&n.berthId!=null?Z(n):null,c=`Tide curve, ${W.length} hourly heights from 1.3 to 6.3 metres above chart datum`+(o&&n!=null?`. ${n.name} needs at least ${a.toFixed(1)} metres to sail the channel`:``);return(0,T.jsxs)(`svg`,{width:e,height:64,viewBox:`0 0 ${e} 64`,role:`img`,"aria-label":c,style:{display:`block`},children:[[2,4,6].map(t=>(0,T.jsxs)(`g`,{children:[(0,T.jsx)(`line`,{x1:0,y1:Q(t),x2:e,y2:Q(t),stroke:`var(--color-border)`,strokeWidth:1,opacity:.5}),(0,T.jsxs)(`text`,{x:2,y:Q(t)-2,fontSize:8,fontFamily:`ui-monospace, monospace`,fill:`var(--color-text-secondary)`,children:[t,`m`]})]},t)),(0,T.jsx)(`path`,{d:i,fill:ie,stroke:`none`}),(0,T.jsx)(`path`,{d:r,fill:`none`,stroke:j,strokeWidth:1.5}),o?(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(`line`,{x1:0,y1:Q(a),x2:e,y2:Q(a),stroke:D,strokeWidth:1.5,strokeDasharray:`5 4`}),(0,T.jsx)(`text`,{x:4,y:Q(a)+10,fontSize:9,fontFamily:`ui-monospace, monospace`,fill:D,children:`sail ≥ ${a.toFixed(1)}m`})]}):null,s!=null&&s<=z?(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(`line`,{x1:s/60*t,y1:4,x2:s/60*t,y2:60,stroke:M,strokeWidth:1.5,strokeDasharray:`2 3`}),(0,T.jsx)(`circle`,{cx:s/60*t,cy:Q(G(s)),r:3,fill:o&&G(s)<a?D:j})]}):null]})}var Me={grounding:a,"sailing-tide":s,"crane-double":C,"berth-overlap":o,"no-crane":C};function Ne({vessel:e,violations:t,clashed:n,pxPerMin:r,isSelected:i,compact:a,onSelect:o,onShift:s,registerRef:c}){let l=t.filter(t=>t.vesselId===e.id),u=l.some(e=>e.severity===`danger`),d=Z(e),f=[`pbp-block`,`pbp-fade`,i?`pbp-block-selected`:``,u?`pbp-block-violation`:``].filter(Boolean).join(` `),p=Array.from(new Set(l.map(e=>e.kind)));return(0,T.jsxs)(`button`,{type:`button`,ref:c(e.id),className:f,style:{left:e.etbMin*r,width:Math.max((d-e.etbMin)*r,64)},"aria-pressed":i,"aria-label":De(e,t),onClick:()=>o(e.id),onKeyDown:t=>{t.key===`ArrowLeft`?(t.preventDefault(),s(e.id,-60)):t.key===`ArrowRight`&&(t.preventDefault(),s(e.id,B))},children:[(0,T.jsxs)(`span`,{className:`pbp-blockline`,children:[(0,T.jsx)(`span`,{className:`pbp-blockname`,children:a?e.voyage:e.name}),p.map(e=>{let t=Me[e],n=e===`grounding`||e===`sailing-tide`||e===`berth-overlap`;return(0,T.jsx)(`span`,{className:`pbp-badge ${n?`pbp-badge-danger`:`pbp-badge-warn`}${n&&!i?` pbp-pulse`:``}`,"aria-hidden":!0,children:(0,T.jsx)(t,{size:11,strokeWidth:2.5})},e)})]}),a?null:(0,T.jsxs)(`span`,{className:`pbp-blockline`,children:[(0,T.jsxs)(`span`,{className:`pbp-mono`,style:{fontSize:10,color:`var(--color-text-secondary)`},children:[H(e.etbMin),`–`,H(d),` · `,e.moves.toLocaleString(`en-US`),` mv`]}),e.craneIds.map(e=>(0,T.jsx)(`span`,{className:`pbp-cranetag${n.has(e)?` pbp-cranetag-clash`:``}`,"aria-hidden":!0,children:e},e))]})]})}var Pe=Array.from({length:25},(e,t)=>t*3);function Fe({vessels:e,violations:t,selectedId:n,geometry:r,onSelect:i,onShift:a,registerRef:o}){let{railW:s,pxPerHour:c,showLaneSub:l,compactBlocks:u}=r,d=72*c,f=c/60,p=e.find(e=>e.id===n)??null;return(0,T.jsxs)(`div`,{style:{width:`max-content`,minWidth:`100%`},children:[(0,T.jsxs)(`div`,{className:`pbp-ruler`,style:{width:s+d},children:[(0,T.jsx)(`div`,{className:`pbp-rulerlabelcell`,style:{width:s},children:(0,T.jsx)(`span`,{className:`pbp-sectionlabel`,children:`Berths`})}),(0,T.jsx)(`div`,{className:`pbp-rulertrack`,style:{width:d},children:Pe.map(e=>{let t=e*60,n=(e+R)%24==0,r=e%6==0;return(0,T.jsxs)(`span`,{children:[(0,T.jsx)(`span`,{className:`pbp-hourtick`,style:{left:e*c,top:n?10:16},"aria-hidden":!0}),r?(0,T.jsx)(`span`,{className:`pbp-hourlabel`,style:e===0?{left:2,transform:`none`}:e===72?{left:d-2,transform:`translateX(-100%)`}:{left:e*c},children:n?V(t).slice(0,3):H(t)}):null]},e)})})]}),(0,T.jsxs)(`div`,{className:`pbp-tiderow`,style:{width:s+d},children:[(0,T.jsxs)(`div`,{className:`pbp-tidelabel`,style:{width:s},children:[(0,T.jsx)(`span`,{className:`pbp-sectionlabel`,children:`Tide`}),(0,T.jsx)(`span`,{className:`pbp-lanelabel-sub`,children:`m above CD · LW 1.3 / HW 6.3`})]}),(0,T.jsx)(`div`,{className:`pbp-tidetrack`,style:{width:d},children:(0,T.jsx)(je,{trackW:d,pxPerHour:c,selected:p})})]}),Ce.map(r=>{let p=e.filter(e=>e.berthId===r.id),m=p.length===0?`clear`:p.map(e=>`${e.name} ${V(e.etbMin)} to ${V(Z(e))}`).join(`; `);return(0,T.jsxs)(`div`,{className:`pbp-lane`,style:{width:s+d},children:[(0,T.jsxs)(`div`,{className:`pbp-lanelabel`,style:{width:s},children:[(0,T.jsx)(`span`,{className:`pbp-lanelabel-name`,children:l?r.name:r.id}),(0,T.jsxs)(`span`,{className:`pbp-lanelabel-sub`,children:[r.depthM.toFixed(1),` m CD · LOA ≤ `,r.loaMaxM,` m`]}),l?(0,T.jsx)(`span`,{className:`pbp-lanelabel-sub`,children:r.craneIds.join(` · `)}):null]}),(0,T.jsxs)(`div`,{className:`pbp-lanetrack`,style:{width:d},role:`group`,"aria-label":`${r.name}, ${r.depthM.toFixed(1)} metres at chart datum. ${m}`,children:[Pe.map(e=>e%6==0&&e!==0&&e!==72?(0,T.jsx)(`span`,{className:`pbp-lanegrid`,style:{left:e*c},"aria-hidden":!0},e):null),p.map(r=>(0,T.jsx)(Ne,{vessel:r,violations:t,clashed:Ee(r,e),pxPerMin:f,isSelected:n===r.id,compact:u,onSelect:i,onShift:a,registerRef:o},r.id))]})]},r.id)})]})}function Ie({children:e}){let t=(0,w.useRef)(null),[n,r]=(0,w.useState)(!1),a=(0,w.useCallback)(()=>{let e=t.current;e!=null&&r(e.scrollWidth-e.clientWidth-e.scrollLeft>1)},[]);return(0,w.useEffect)(()=>{let e=t.current;if(e==null)return;a();let n=new ResizeObserver(a);return n.observe(e),()=>n.disconnect()},[a]),(0,T.jsxs)(`div`,{className:`pbp-boardviewport`,children:[(0,T.jsx)(`div`,{ref:t,className:`pbp-scroller`,onScroll:a,children:e}),n?(0,T.jsx)(`div`,{className:`pbp-scrollhint`,"aria-hidden":!0,children:(0,T.jsx)(i,{icon:f,size:`xsm`,color:`secondary`})}):null]})}function Le(){return(0,T.jsxs)(`div`,{className:`pbp-legend`,"aria-label":`Board encoding legend`,children:[(0,T.jsxs)(`span`,{className:`pbp-legendkey`,children:[(0,T.jsx)(`span`,{"aria-hidden":!0,style:{width:18,height:10,borderRadius:3,background:N,boxShadow:`inset 0 0 0 1px ${M}`}}),(0,T.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Vessel alongside`})]}),(0,T.jsxs)(`span`,{className:`pbp-legendkey`,children:[(0,T.jsx)(`span`,{"aria-hidden":!0,style:{width:18,height:10,borderRadius:3,boxShadow:`inset 0 0 0 1px ${D}`,backgroundImage:`repeating-linear-gradient(45deg, ${P} 0px, ${P} 2px, transparent 2px, transparent 6px)`}}),(0,T.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Violation`})]}),(0,T.jsxs)(`span`,{className:`pbp-legendkey`,children:[(0,T.jsx)(a,{size:11,strokeWidth:2.5,"aria-hidden":!0,style:{color:D}}),(0,T.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Grounding`})]}),(0,T.jsxs)(`span`,{className:`pbp-legendkey`,children:[(0,T.jsx)(s,{size:11,strokeWidth:2.5,"aria-hidden":!0,style:{color:D}}),(0,T.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Sailing tide`})]}),(0,T.jsxs)(`span`,{className:`pbp-legendkey`,children:[(0,T.jsx)(C,{size:11,strokeWidth:2.5,"aria-hidden":!0,style:{color:k}}),(0,T.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Crane clash`})]}),(0,T.jsxs)(`span`,{className:`pbp-legendkey`,children:[(0,T.jsx)(`svg`,{width:20,height:10,viewBox:`0 0 20 10`,"aria-hidden":!0,children:(0,T.jsx)(`path`,{d:`M0 8 Q5 1 10 5 T20 4`,fill:`none`,stroke:j,strokeWidth:1.5})}),(0,T.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Tide (m CD)`})]})]})}function Re({waiting:e,selectedId:t,onSelect:n}){return(0,T.jsxs)(`div`,{className:`pbp-anchorage`,children:[(0,T.jsx)(`span`,{className:`pbp-sectionlabel`,children:`Anchorage`}),e.length===0?(0,T.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Clear — every arrival has a berth`}):e.map(e=>(0,T.jsxs)(`button`,{type:`button`,className:`pbp-anchorchip pbp-focusable pbp-fade`,"aria-pressed":t===e.id,"aria-label":`${e.name}, waiting at anchorage, ETA ${V(e.etbMin)} — open berth assignment`,onClick:()=>n(e.id),children:[(0,T.jsx)(a,{size:12,strokeWidth:2.5,"aria-hidden":!0}),(0,T.jsx)(`span`,{className:`pbp-mono`,children:e.voyage}),e.name,(0,T.jsxs)(`span`,{className:`pbp-mono`,style:{color:`var(--color-text-secondary)`},children:[`ETA `,H(e.etbMin)]})]},e.id))]})}function $({label:e,value:t,sub:n}){return(0,T.jsxs)(`div`,{className:`pbp-detailrow`,children:[(0,T.jsx)(`span`,{className:`pbp-sectionlabel pbp-detaillabel`,children:e}),(0,T.jsx)(g,{size:`fill`,children:(0,T.jsxs)(h,{gap:0,children:[(0,T.jsx)(r,{type:`body`,size:`sm`,hasTabularNumbers:!0,children:t}),n==null?null:(0,T.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,hasTabularNumbers:!0,children:n})]})})]})}function ze(e,t,n){if(t.loaM>e.loaMaxM)return{ok:!1,refused:!0,note:`LOA ${t.loaM} m > ${e.loaMaxM} m limit — refused`};let r=e.depthM+1.3,i=t.draftM+q,a=r<i?`${(i-r).toFixed(1)} m short at LW`:`${(r-i).toFixed(1)} m spare at LW`,o=n.find(n=>n.id!==t.id&&n.berthId===e.id&&t.etbMin<Z(n)&&t.etbMin+X(t)>n.etbMin),s=o==null?``:` · overlaps ${o.name}`;return{ok:r>=i&&o==null,refused:!1,note:`${a}${s}`}}function Be({isOverlay:e,width:t,vessels:n,violations:a,selected:s,totalDelayMin:c,onClose:d,onSelect:p,onShift:ee,onToggleCrane:te,onAssignBerth:ne}){let v=s==null?[]:a.filter(e=>e.vesselId===s.id),S=s?.berthId==null?void 0:J.get(s.berthId),w=s==null?new Set:Ee(s,n),E=n.filter(e=>e.berthId!=null).sort((e,t)=>e.etbMin-t.etbMin);return(0,T.jsxs)(`aside`,{className:`pbp-aside${e?` pbp-aside-overlay`:``}`,style:e?void 0:{width:t},"aria-label":`Vessel detail and berth roster`,children:[(0,T.jsxs)(`div`,{className:`pbp-asidehead`,children:[s==null?(0,T.jsx)(_,{level:2,children:`Berth plan`}):(0,T.jsx)(g,{size:`fill`,children:(0,T.jsxs)(h,{gap:0,children:[(0,T.jsxs)(m,{gap:2,vAlign:`center`,children:[(0,T.jsx)(`span`,{className:`pbp-mono`,children:s.voyage}),(0,T.jsx)(`span`,{style:{flexShrink:0},children:(0,T.jsx)(x,{size:`sm`,color:s.berthId==null?`gray`:v.some(e=>e.severity===`danger`)?`red`:`green`,label:s.berthId==null?`anchorage`:s.berthId})})]}),(0,T.jsx)(_,{level:2,maxLines:1,children:s.name})]})}),e?(0,T.jsx)(y,{label:`Close vessel detail`,isIconOnly:!0,variant:`ghost`,size:`sm`,icon:(0,T.jsx)(i,{icon:u,size:`sm`}),onClick:d}):null]}),(0,T.jsx)(`div`,{className:`pbp-asidescroll`,children:s==null?(0,T.jsxs)(`div`,{className:`pbp-emptystate`,children:[(0,T.jsx)(i,{icon:o,size:`lg`,color:`secondary`}),(0,T.jsx)(_,{level:3,children:`Nothing selected`}),(0,T.jsx)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:`Select a vessel block or an anchorage chip`})]}):(0,T.jsxs)(h,{gap:3,children:[(0,T.jsxs)(h,{gap:1,children:[(0,T.jsx)($,{label:`Particulars`,value:`LOA ${s.loaM.toFixed(0)} m · beam ${s.beamM.toFixed(1)} m · draft ${s.draftM.toFixed(1)} m`,sub:`IMO ${s.imo} · ${s.cargoNote}`}),(0,T.jsx)($,{label:`Workload`,value:`${s.moves.toLocaleString(`en-US`)} moves · ${Y(s)} gang${Y(s)===1?``:`s`}`,sub:`ceil(${s.moves} / (28 × ${Math.max(Y(s),1)})) + 2 h lashing = ${X(s)/60} h alongside`}),s.berthId==null?(0,T.jsx)($,{label:`ETA`,value:V(s.etbMin),sub:`Off the fairway — assign a berth below`}):(0,T.jsx)($,{label:`Window`,value:`${V(s.etbMin)} → ${V(Z(s))}`,sub:`Pro-forma ETD ${V(s.proFormaEtdMin)} · ${U(Z(s)-s.proFormaEtdMin)}`})]}),s.berthId==null?null:(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(b,{}),(0,T.jsxs)(h,{gap:1,children:[(0,T.jsx)(`span`,{className:`pbp-sectionlabel`,children:`Shift window (1-hour steps)`}),(0,T.jsxs)(`div`,{className:`pbp-nudgegroup`,children:[(0,T.jsx)(y,{label:`Shift 1 hour earlier`,variant:`secondary`,size:`sm`,icon:(0,T.jsx)(i,{icon:l,size:`sm`}),onClick:()=>ee(s.id,-60)}),(0,T.jsxs)(`span`,{className:`pbp-mono`,style:{minWidth:128,textAlign:`center`},children:[H(s.etbMin),` – `,H(Z(s))]}),(0,T.jsx)(y,{label:`Shift 1 hour later`,variant:`secondary`,size:`sm`,icon:(0,T.jsx)(i,{icon:f,size:`sm`}),onClick:()=>ee(s.id,B)})]})]}),S==null?null:(0,T.jsxs)(h,{gap:1,children:[(0,T.jsxs)(`span`,{className:`pbp-sectionlabel`,children:[`Crane gangs — `,S.id,` rail`]}),(0,T.jsx)(m,{gap:2,vAlign:`center`,wrap:`wrap`,children:S.craneIds.map(e=>{let t=s.craneIds.includes(e);return(0,T.jsxs)(`button`,{type:`button`,className:`pbp-cranebtn pbp-focusable pbp-fade${w.has(e)?` pbp-cranebtn-clash`:``}`,"aria-pressed":t,"aria-label":`${e} ${t?`assigned — remove gang`:`available — add gang`}${w.has(e)?`, double-booked`:``}`,onClick:()=>te(s.id,e),children:[(0,T.jsx)(C,{size:12,strokeWidth:2.5,"aria-hidden":!0}),e]},e)})}),(0,T.jsxs)(r,{type:`supporting`,size:`xsm`,color:`secondary`,hasTabularNumbers:!0,children:[Y(s),` gang`,Y(s)===1?``:`s`,` → `,X(s)/60,` h alongside · ETD`,` `,V(Z(s))]})]})]}),(0,T.jsx)(b,{}),(0,T.jsxs)(h,{gap:1,children:[(0,T.jsx)(`span`,{className:`pbp-sectionlabel`,children:s.berthId==null?`Assign berth`:`Reassign berth`}),Ce.map(e=>{let t=ze(e,s,n),i=s.berthId===e.id;return(0,T.jsxs)(`button`,{type:`button`,className:`pbp-berthbtn pbp-focusable pbp-fade`,"aria-pressed":i,disabled:t.refused,"aria-label":`${e.name}: ${t.refused?t.note:`${t.note}${i?`, current berth`:``}`}`,onClick:()=>ne(s.id,e.id),children:[(0,T.jsx)(`span`,{className:`pbp-mono`,style:{width:24,flexShrink:0},children:e.id}),(0,T.jsx)(g,{size:`fill`,children:(0,T.jsxs)(h,{gap:0,children:[(0,T.jsxs)(r,{type:`body`,size:`sm`,maxLines:1,children:[e.name,` · `,e.depthM.toFixed(1),` m`]}),(0,T.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,maxLines:1,hasTabularNumbers:!0,children:t.note})]})}),i?(0,T.jsx)(`span`,{style:{flexShrink:0},children:(0,T.jsx)(x,{size:`sm`,color:`blue`,label:`current`})}):null]},e.id)})]}),(0,T.jsx)(b,{}),v.length>0?(0,T.jsxs)(h,{gap:1,children:[(0,T.jsx)(`span`,{className:`pbp-sectionlabel`,children:`Violations`}),v.map((e,t)=>{let n=Me[e.kind];return(0,T.jsxs)(`div`,{className:`pbp-violationrow${e.severity===`warn`?` pbp-violationrow-warn`:``}`,children:[(0,T.jsx)(n,{size:12,strokeWidth:2.5,"aria-hidden":!0,style:{flexShrink:0}}),(0,T.jsx)(r,{type:`supporting`,size:`xsm`,color:`inherit`,maxLines:2,children:e.message})]},`${e.kind}-${t}`)})]}):(0,T.jsxs)(m,{gap:2,vAlign:`center`,children:[(0,T.jsx)(re,{variant:`success`,label:`No violations`}),(0,T.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`No violations on this call`})]}),(0,T.jsx)(b,{}),(0,T.jsxs)(h,{gap:1,children:[(0,T.jsx)(`span`,{className:`pbp-sectionlabel`,children:`Berth roster — by ETB`}),(0,T.jsx)(`ol`,{style:{listStyle:`none`,margin:0,padding:0},"aria-label":`Alongside vessels in ETB order`,children:E.map(e=>{let t=s.id===e.id,n=Z(e)-e.proFormaEtdMin;return(0,T.jsx)(`li`,{children:(0,T.jsxs)(`button`,{type:`button`,className:`pbp-rosterrow pbp-focusable pbp-fade${t?` pbp-rosterrow-active`:``}`,style:{width:`100%`,appearance:`none`,border:`none`,background:t?void 0:`transparent`,font:`inherit`,color:`inherit`,cursor:`pointer`,textAlign:`left`},"aria-pressed":t,onClick:()=>p(e.id),children:[(0,T.jsx)(`span`,{className:`pbp-mono`,style:{width:24,flexShrink:0,color:`var(--color-text-secondary)`},children:e.berthId}),(0,T.jsx)(g,{size:`fill`,children:(0,T.jsxs)(h,{gap:0,children:[(0,T.jsx)(r,{type:`body`,size:`sm`,maxLines:1,children:e.name}),(0,T.jsxs)(r,{type:`supporting`,size:`xsm`,color:`secondary`,maxLines:1,hasTabularNumbers:!0,children:[V(e.etbMin),` → `,V(Z(e))]})]})}),(0,T.jsx)(`span`,{className:`pbp-mono`,style:{flexShrink:0,color:n>0?k:`var(--color-text-secondary)`},children:U(n)})]})},e.id)})})]})]})}),(0,T.jsx)(`div`,{className:`pbp-asidefooter`,children:(0,T.jsxs)(r,{type:`supporting`,size:`xsm`,color:`secondary`,hasTabularNumbers:!0,children:[`Σ `,U(c),` vs pro-forma · `,E.length,` alongside`]})})]})}function Ve(e){return e instanceof HTMLElement&&(e.tagName===`INPUT`||e.tagName===`TEXTAREA`||e.isContentEditable)}function He(){let e=(0,w.useRef)(null),t=Oe(e),n=v(`(max-width: 1179px)`),i=v(`(max-width: 979px)`),a=t>0?t<1180:n,s=t>0?t<980:i,c=a&&!s?320:340,l=s?120:a?140:152,u=s?t:Math.max(t-c,0),f=u>0?(u-l-F)/72:8,m={railW:l,pxPerHour:Math.min(Math.max(f,8),14),showLaneSub:!s,compactBlocks:s},[h,g]=(0,w.useState)(we),[_,y]=(0,w.useState)(null),[b,re]=(0,w.useState)(!1),[x,C]=(0,w.useState)(``),E=(0,w.useRef)(new Map),D=(0,w.useCallback)(e=>t=>{let n=E.current;t==null?n.delete(e):n.set(e,t)},[]),O=Te(h),k=O.filter(e=>e.severity===`danger`).length,A=O.length-k,j=h.filter(e=>e.berthId!=null).reduce((e,t)=>e+(Z(t)-t.proFormaEtdMin),0),ie=h.filter(e=>e.berthId==null),M=_==null?null:h.find(e=>e.id===_)??null,N=(0,w.useCallback)(e=>{y(e),re(!0)},[]),P=(0,w.useCallback)((e,t,n)=>{let r=e.find(e=>e.id===t);if(r==null)return;let i=Te(e).filter(e=>e.vesselId===t),a=i.length>0?`${i.length} violation${i.length===1?``:`s`}: ${i.map(e=>e.kind).join(`, `)}`:`no violations`;C(`${n} ${r.name}: ${V(r.etbMin)} to ${V(Z(r))}, ${a}.`)},[]),I=(0,w.useCallback)((e,t)=>{g(n=>{let r=n.find(t=>t.id===e);if(r==null||r.berthId==null)return n;let i=X(r),a=Math.min(Math.max(r.etbMin+t,0),z-i);if(a===r.etbMin)return n;let o=n.map(t=>t.id===e?{...t,etbMin:a}:t);return P(o,e,`Shifted`),o}),y(e)},[P]),L=(0,w.useCallback)((e,t)=>{g(n=>{let r=n.find(t=>t.id===e);if(r==null||r.berthId==null)return n;let i=J.get(r.berthId);if(i==null||!i.craneIds.includes(t))return n;let a=r.craneIds.includes(t)?r.craneIds.filter(e=>e!==t):[...r.craneIds,t],o=n.map(t=>t.id===e?{...t,craneIds:a}:t);return P(o,e,`${a.length} gangs on`),o})},[P]),R=(0,w.useCallback)((e,t)=>{let n=J.get(t);g(r=>{let i=r.find(t=>t.id===e);if(i==null||n==null||i.berthId===t)return r;if(i.loaM>n.loaMaxM)return C(`Refused: ${i.name} LOA ${i.loaM} metres exceeds ${n.id} limit ${n.loaMaxM} metres.`),r;let a=i.craneIds.filter(e=>n.craneIds.includes(e)),o=a.length>0?a:n.craneIds.slice(0,Math.min(i.requestedGangs,n.craneIds.length)),s=r.map(n=>n.id===e?{...n,berthId:t,craneIds:o}:n);return P(s,e,`Assigned to ${n.id}:`),s}),y(e)},[P]),B=(0,w.useCallback)(()=>{re(!1),_!=null&&E.current.get(_)?.focus()},[_]),se=e=>{e.key!==`Escape`||Ve(e.target)||(s&&b?B():_!=null&&y(null))},H=!s||b;return(0,T.jsxs)(`div`,{className:ae,onKeyDown:se,children:[(0,T.jsx)(`style`,{children:oe}),(0,T.jsx)(`span`,{"aria-live":`polite`,role:`status`,className:`pbp-visuallyhidden`,children:x}),(0,T.jsx)(ee,{height:`fill`,header:(0,T.jsx)(ne,{padding:0,hasDivider:!0,children:(0,T.jsxs)(`div`,{className:`pbp-header`,children:[(0,T.jsx)(`span`,{className:`pbp-logo`,children:(0,T.jsx)(ke,{})}),(0,T.jsx)(r,{type:`label`,size:`sm`,children:`Quayside`}),(0,T.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,maxLines:1,children:`Anselm Bay Container Terminal · berth plan · Thu 16 – Sun 19 Jul 2026`}),(0,T.jsx)(`span`,{style:{flex:1},"aria-hidden":!0}),(0,T.jsx)(p,{content:`Grounding, sailing-tide, berth and crane violations across the plan`,children:(0,T.jsxs)(`span`,{className:`pbp-chip${k>0?` pbp-chip-danger`:A>0?` pbp-chip-warn`:``}`,children:[(0,T.jsx)(d,{size:12,strokeWidth:2.5,"aria-hidden":!0}),O.length,` violation`,O.length===1?``:`s`]})}),(0,T.jsx)(p,{content:`Total ETD delta vs the pro-forma schedule, alongside vessels`,children:(0,T.jsxs)(`span`,{className:`pbp-chip${j>0?` pbp-chip-warn`:``}`,children:[(0,T.jsx)(o,{size:12,strokeWidth:2.5,"aria-hidden":!0}),U(j),` vs pro-forma`]})}),(0,T.jsx)(S,{name:ve.name,size:`small`})]})}),content:(0,T.jsx)(te,{padding:0,children:(0,T.jsxs)(`div`,{ref:e,className:`pbp-viewroot`,children:[(0,T.jsxs)(`div`,{className:`pbp-maincol`,children:[(0,T.jsx)(Re,{waiting:ie,selectedId:_,onSelect:N}),(0,T.jsx)(Ie,{children:(0,T.jsx)(Fe,{vessels:h,violations:O,selectedId:_,geometry:m,onSelect:N,onShift:I,registerRef:D})}),(0,T.jsx)(Le,{})]}),H?(0,T.jsx)(Be,{isOverlay:s,width:c,vessels:h,violations:O,selected:M,totalDelayMin:j,onClose:B,onSelect:N,onShift:I,onToggleCrane:L,onAssignBerth:R}):null]})})})]})}export{He as default};