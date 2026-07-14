import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-BnkU7x5-.js";import{t as i}from"./Icon-BmUexiPD.js";import{t as a}from"./badge-dollar-sign-D2a2WoAd.js";import{t as o}from"./calendar-days-CnFIrA85.js";import{t as s}from"./inbox-oEmLtFNx.js";import{t as c}from"./mail-DPtgyodR.js";import{t as l}from"./play-B5xzfyrW.js";import{i as u,o as d,w as f}from"./index-Z40q0Y4M.js";import{t as p}from"./HStack-2WTukjNp.js";import{t as m}from"./VStack-B8U-hI0Y.js";import{t as h}from"./StackItem-Ca9P7L2I.js";import{n as g,t as ee}from"./LayoutContent-CCL91W7X.js";import{t as te}from"./LayoutHeader-Cy2mWoMf.js";import{t as _}from"./Heading-Tiw04pWH.js";import{t as v}from"./Button-C1oieFea.js";import{t as y}from"./Divider-BHIBe6GQ.js";import{t as ne}from"./Token-BbuN13BY.js";import{t as re}from"./Avatar-DyaNw-yT.js";var b=e(t(),1),x=n(),S=`light-dark(#C2186B, #F978C2)`,C=`light-dark(rgba(194, 24, 107, 0.08), rgba(249, 120, 194, 0.14))`,w=`light-dark(#DC2626, #F87171)`,T=`light-dark(rgba(220, 38, 38, 0.10), rgba(248, 113, 113, 0.16))`,E=`light-dark(rgba(220, 38, 38, 0.20), rgba(248, 113, 113, 0.24))`,ie=`light-dark(#0B7A2C, #4ADE80)`,D=`light-dark(#A16207, #FBBF24)`,O={vpn:{label:`VPN`,color:`light-dark(#0B69D4, #4C9EFF)`,soft:`light-dark(rgba(11, 105, 212, 0.10), rgba(76, 158, 255, 0.16))`},devtools:{label:`Dev tools`,color:`light-dark(#7C3AED, #A78BFA)`,soft:`light-dark(rgba(124, 58, 237, 0.10), rgba(167, 139, 250, 0.16))`},coffee:{label:`Coffee`,color:`light-dark(#B45309, #FBBF24)`,soft:`light-dark(rgba(180, 83, 9, 0.10), rgba(251, 191, 36, 0.16))`},d2c:{label:`D2C`,color:`light-dark(#0B7A2C, #4ADE80)`,soft:`light-dark(rgba(11, 122, 44, 0.10), rgba(74, 222, 128, 0.16))`}},k=12,A=`var(--font-family-code, ui-monospace, monospace)`,j=`tpl-creator-sponsorship-calendar`,ae=`
.${j} {
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.${j}.csc-root { height: 100dvh; width: 100%; }
.${j} button { font-family: inherit; }
.${j} .csc-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.${j} .csc-fade { transition: background-color 160ms ease, opacity 160ms ease, border-color 160ms ease; }
@keyframes csc-land {
  from { opacity: 0; }
  to { opacity: 1; }
}
.${j} .csc-land { animation: csc-land 260ms ease; }
@media (prefers-reduced-motion: reduce) {
  .${j} .csc-fade { transition: none; }
  .${j} .csc-land { animation: none; }
}

/* Header bar 52px ---------------------------------------------------------*/
.${j} .csc-header {
  display: flex;
  align-items: center;
  gap: ${k}px;
  height: 52px;
  padding: 0 ${k}px;
}
.${j} .csc-mono {
  font-family: ${A};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${j} .csc-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${j} .csc-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: var(--border-width) solid ${S};
  background: ${C};
  color: ${S};
  white-space: nowrap;
}
.${j} .csc-chip.is-conflict {
  border-color: ${w};
  background: ${T};
  color: ${w};
}
.${j} .csc-ticker {
  font-size: 12px;
  color: var(--color-text-secondary);
  max-width: 230px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* View + calendar column --------------------------------------------------*/
.${j} .csc-view {
  display: flex;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  position: relative;
}
.${j} .csc-cal-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.${j} .csc-weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  height: 28px;
  align-items: center;
  padding: 0 ${k}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}
.${j} .csc-weekday {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
}
.${j} .csc-cal-scroll { flex: 1; min-height: 0; overflow-y: auto; padding: 0 ${k}px; }

/* Week rows 116px = 24px date row + 4 lanes x 22px + 4px pad --------------*/
.${j} .csc-week {
  position: relative;
  height: 116px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${j} .csc-week-days {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}
.${j} .csc-day {
  border-right: var(--border-width) solid var(--color-border);
  padding: 3px 6px 0;
}
.${j} .csc-day:last-child { border-right: none; }
.${j} .csc-day.is-outside { background: var(--color-background-muted); }
.${j} .csc-day-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  border-radius: 999px;
  font-family: ${A};
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${j} .csc-day-num.is-today {
  border: 2px solid ${S};
  color: ${S};
  font-weight: 700;
}
/* Conflict band — hatched overlay across the exact overlap days, behind
   the bars (z 1 vs bar z 2). Geometry (45° stripes) carries the state. */
.${j} .csc-conflict-band {
  position: absolute;
  top: 24px;
  bottom: 2px;
  z-index: 1;
  background-image: repeating-linear-gradient(45deg, ${E} 0px, ${E} 3px, transparent 3px, transparent 9px);
  border-left: 2px solid ${w};
  border-right: 2px solid ${w};
  pointer-events: none;
}
/* Span bars — real buttons, 20px tall in a 22px lane. */
.${j} .csc-bar {
  appearance: none;
  position: absolute;
  z-index: 2;
  height: 20px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 6px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 5px;
  cursor: pointer;
  overflow: hidden;
  color: var(--color-text-primary);
}
.${j} .csc-bar[aria-pressed='true'] {
  border-color: ${S};
  box-shadow: 0 0 0 1px ${S};
}
.${j} .csc-bar.is-cont-right { border-top-right-radius: 0; border-bottom-right-radius: 0; border-right-style: dashed; }
.${j} .csc-bar.is-cont-left { border-top-left-radius: 0; border-bottom-left-radius: 0; border-left-style: dashed; }
.${j} .csc-bar-accent {
  width: 3px;
  align-self: stretch;
  flex-shrink: 0;
  margin-left: -6px;
  border-radius: 5px 0 0 5px;
}
.${j} .csc-bar-text {
  font-size: 11px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${j} .csc-bar-value {
  font-family: ${A};
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}
.${j} .csc-deliv {
  position: absolute;
  top: 6px;
  width: 8px;
  height: 8px;
  transform: translateX(-50%) rotate(45deg);
  border: var(--border-width) solid var(--color-background);
}
.${j} .csc-legend {
  display: flex;
  align-items: center;
  gap: ${k}px;
  height: 32px;
  padding: 0 ${k}px;
  border-top: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
  overflow: hidden;
}
.${j} .csc-legend-key {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  font-size: 11px;
  color: var(--color-text-secondary);
}

/* Rail ---------------------------------------------------------------------*/
.${j} .csc-rail {
  flex: none;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-left: var(--border-width) solid var(--color-border);
  background: var(--color-background);
}
.${j} .csc-rail.is-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  box-shadow: var(--shadow-overlay, 0 8px 24px rgba(0, 0, 0, 0.18));
}
.${j} .csc-rail-scroll { flex: 1; min-height: 0; overflow-y: auto; padding: ${k}px; }
.${j} .csc-rail-head {
  display: flex;
  align-items: center;
  gap: ${k}px;
  height: 44px;
  padding: 0 ${k}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}
.${j} .csc-offer {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  padding: ${k/2}px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.${j} .csc-offer.is-declined { opacity: 0.55; }
.${j} .csc-offer-warn {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 6px;
  border-radius: var(--radius-container);
  background: ${T};
  color: ${w};
}
.${j} .csc-ledger-row {
  display: flex;
  align-items: center;
  gap: ${k/2}px;
  min-height: 40px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${j} .csc-ledger-row:last-child { border-bottom: none; }
.${j} .csc-ledger-row.is-highlight { background: ${C}; }
.${j} .csc-cp-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex-shrink: 0;
}
.${j} .csc-rail-totals {
  display: flex;
  align-items: center;
  gap: ${k}px;
  height: 44px;
  padding: 0 ${k}px;
  border-top: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}
.${j} .csc-deliv-row {
  appearance: none;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  gap: ${k/2}px;
  width: 100%;
  min-height: 40px;
  padding: 0 ${k/2}px;
  cursor: pointer;
  text-align: left;
  color: var(--color-text-primary);
  border-radius: var(--radius-container);
}
.${j} .csc-deliv-box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 2px solid var(--color-border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.${j} .csc-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${k/2}px;
  padding: ${k*2}px ${k}px;
  text-align: center;
}
.${j} .csc-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
`,M=[];for(let e=0;e<35;e+=1)e<3?M.push({num:28+e,month:`Jun`,inJuly:!1}):e<34?M.push({num:e-2,month:`Jul`,inJuly:!0}):M.push({num:1,month:`Aug`,inJuly:!1});var N=12,oe=`Fri 10 Jul 2026`,se=[`Sun`,`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`],ce=[0,7,14,21,28],P=`D-198`,le=`D-201`,ue=[{id:P,brand:`Loamly`,category:`d2c`,value:6500,status:`active`,startIdx:4,endIdx:11,flightLabel:`Jul 2 – Jul 9`,exclDays:3,exclStartIdx:1,exclEndIdx:14,exclLabel:`D2C exclusive Jun 29 – Jul 12`,deliverables:[{id:`dl-1`,kind:`video`,label:`YT integration (90s)`,dayIdx:9,dateLabel:`Jul 7`,done:!0},{id:`dl-2`,kind:`short`,label:`Short — raised-bed reveal`,dayIdx:11,dateLabel:`Jul 9`,done:!0}],checkpoints:[{kind:`signing`,amount:1950,dueLabel:`Paid 20 Jun`,sortKey:20260620,paid:!0},{kind:`delivery`,amount:3250,dueLabel:`Due 9 Jul`,sortKey:20260709},{kind:`net30`,amount:1300,dueLabel:`Due 8 Aug`,sortKey:20260808}],contact:`sasha@loamly.example`},{id:le,brand:`TunnelPeak`,category:`vpn`,value:18e3,status:`active`,startIdx:8,endIdx:19,flightLabel:`Jul 6 – Jul 17`,exclDays:7,exclStartIdx:1,exclEndIdx:26,exclLabel:`VPN exclusive Jun 29 – Jul 24`,deliverables:[{id:`tp-1`,kind:`video`,label:`YT integration (120s)`,dayIdx:10,dateLabel:`Jul 8`,done:!0},{id:`tp-2`,kind:`newsletter`,label:`Newsletter feature`,dayIdx:16,dateLabel:`Jul 14`,done:!1},{id:`tp-3`,kind:`short`,label:`Short — travel router bit`,dayIdx:18,dateLabel:`Jul 16`,done:!1}],checkpoints:[{kind:`signing`,amount:5400,dueLabel:`Paid 29 Jun`,sortKey:20260629,paid:!0},{kind:`delivery`,amount:9e3,dueLabel:`Due 17 Jul`,sortKey:20260717},{kind:`net30`,amount:3600,dueLabel:`Due 16 Aug`,sortKey:20260816}],contact:`partnerships@tunnelpeak.example`,note:`Category exclusivity is contractual — a competing VPN flight inside the window is a breach.`},{id:`D-204`,brand:`Hexcode`,category:`devtools`,value:12e3,status:`active`,startIdx:22,endIdx:33,flightLabel:`Jul 20 – Jul 31`,exclDays:5,exclStartIdx:17,exclEndIdx:38,exclLabel:`Dev-tools exclusive Jul 15 – Aug 5`,deliverables:[{id:`hx-1`,kind:`video`,label:`YT deep-dive review`,dayIdx:24,dateLabel:`Jul 22`,done:!1},{id:`hx-2`,kind:`newsletter`,label:`Newsletter walkthrough`,dayIdx:30,dateLabel:`Jul 28`,done:!1}],checkpoints:[{kind:`signing`,amount:3600,dueLabel:`Paid 6 Jul`,sortKey:20260706,paid:!0},{kind:`delivery`,amount:6e3,dueLabel:`Due 31 Jul`,sortKey:20260731},{kind:`net30`,amount:2400,dueLabel:`Due 30 Aug`,sortKey:20260830}],contact:`creators@hexcode.example`},{id:`O-311`,brand:`NordShield`,category:`vpn`,value:22e3,status:`pending`,startIdx:15,endIdx:24,flightLabel:`Jul 13 – Jul 22`,exclDays:7,exclStartIdx:8,exclEndIdx:31,exclLabel:`Wants VPN exclusive Jul 6 – Jul 29`,deliverables:[{id:`ns-1`,kind:`video`,label:`YT integration (120s)`,dayIdx:17,dateLabel:`Jul 15`,done:!1},{id:`ns-2`,kind:`short`,label:`Short — speed test`,dayIdx:22,dateLabel:`Jul 20`,done:!1}],checkpoints:[{kind:`signing`,amount:6600,dueLabel:`Due on accept (10 Jul)`,sortKey:20260710},{kind:`delivery`,amount:11e3,dueLabel:`Due 22 Jul`,sortKey:20260722},{kind:`net30`,amount:4400,dueLabel:`Due 21 Aug`,sortKey:20260821}],contact:`talent@nordshield.example`,note:`Highest CPM offer this quarter. Flight sits inside the TunnelPeak window.`},{id:`O-314`,brand:`Brewline`,category:`coffee`,value:4200,status:`pending`,startIdx:10,endIdx:16,flightLabel:`Jul 8 – Jul 14`,exclDays:0,exclStartIdx:10,exclEndIdx:16,exclLabel:`No exclusivity ask`,deliverables:[{id:`bl-1`,kind:`short`,label:`Short — morning bench brew`,dayIdx:13,dateLabel:`Jul 11`,done:!1},{id:`bl-2`,kind:`newsletter`,label:`Newsletter mention`,dayIdx:16,dateLabel:`Jul 14`,done:!1}],checkpoints:[{kind:`signing`,amount:1260,dueLabel:`Due on accept (10 Jul)`,sortKey:20260710},{kind:`delivery`,amount:2100,dueLabel:`Due 14 Jul`,sortKey:20260714},{kind:`net30`,amount:840,dueLabel:`Due 13 Aug`,sortKey:20260813}],contact:`hey@brewline.example`},{id:`O-317`,brand:`Stackfoundry`,category:`devtools`,value:9800,status:`pending`,startIdx:29,endIdx:34,flightLabel:`Jul 27 – Aug 7`,continuesPastGrid:!0,exclDays:5,exclStartIdx:24,exclEndIdx:34,exclLabel:`Wants dev-tools exclusive Jul 22 – Aug 12`,deliverables:[{id:`sf-1`,kind:`video`,label:`YT sponsored segment`,dayIdx:31,dateLabel:`Jul 29`,done:!1}],checkpoints:[{kind:`signing`,amount:2940,dueLabel:`Due on accept (10 Jul)`,sortKey:20260710},{kind:`delivery`,amount:4900,dueLabel:`Due 7 Aug`,sortKey:20260807},{kind:`net30`,amount:1960,dueLabel:`Due 6 Sep`,sortKey:20260906}],contact:`sponsor@stackfoundry.example`},{id:`O-319`,brand:`Kilnworks Ceramics Studio & Makerspace of Portland`,category:`d2c`,value:3e3,status:`pending`,startIdx:26,endIdx:28,flightLabel:`Jul 24 – Jul 26`,exclDays:0,exclStartIdx:26,exclEndIdx:28,exclLabel:`No exclusivity ask`,deliverables:[{id:`kw-1`,kind:`short`,label:`Short — studio tour`,dayIdx:27,dateLabel:`Jul 25`,done:!1}],checkpoints:[{kind:`signing`,amount:900,dueLabel:`Due on accept (10 Jul)`,sortKey:20260710},{kind:`delivery`,amount:1500,dueLabel:`Due 26 Jul`,sortKey:20260726},{kind:`net30`,amount:600,dueLabel:`Due 25 Aug`,sortKey:20260825}],contact:`kiln@kilnworkspdx.example`}],F={name:`Mara Chen`,handle:`@marabuilds`,channel:`workshop + maker tech`},I={video:`YT`,short:`SH`,newsletter:`NL`};function L(e){return`$${Math.round(e).toString().replace(/\B(?=(\d{3})+(?!\d))/g,`,`)}`}function R(e){let t=M[e];return t==null?`—`:`${t.month} ${t.num}`}function de(e){let t=e.filter(e=>e.status===`active`),n=[];for(let e of t)for(let r of t){if(e.id===r.id||e.category!==r.category)continue;let t=Math.max(e.exclStartIdx,r.startIdx,0),i=Math.min(e.exclEndIdx,r.endIdx,34);t<=i&&n.push({offenderId:r.id,holderId:e.id,startIdx:t,endIdx:i})}return n}function z(e,t){let n=[];for(let r of t){if(r.status!==`active`||r.category!==e.category)continue;let t=Math.max(r.exclStartIdx,e.startIdx)<=Math.min(r.exclEndIdx,e.endIdx),i=Math.max(e.exclStartIdx,r.startIdx)<=Math.min(e.exclEndIdx,r.endIdx);t?n.push(`Flight breaches ${r.brand} — ${r.exclLabel}`):i&&n.push(`Asked window covers the live ${r.brand} flight`)}return n}function B(e,t){return t.paid===!0?`paid`:t.kind===`signing`||t.kind===`delivery`&&e.deliverables.length>0&&e.deliverables.every(e=>e.done)?`invoiced`:`scheduled`}var V={paid:{label:`Paid`,color:ie},invoiced:{label:`Invoiced`,color:D},scheduled:{label:`Scheduled`,color:`var(--color-text-secondary)`}},H={signing:`Signing 30%`,delivery:`Delivery 50%`,net30:`Net-30 20%`};function fe(e){let t=[];for(let n of e)if(n.status===`active`)for(let e of n.checkpoints)t.push({dealId:n.id,brand:n.brand,checkpoint:e,state:B(n,e)});return t.sort((e,t)=>e.checkpoint.sortKey===t.checkpoint.sortKey?e.dealId.localeCompare(t.dealId):e.checkpoint.sortKey-t.checkpoint.sortKey),t}function pe(e){let t=e.filter(e=>e.status===`active`).sort((e,t)=>e.startIdx===t.startIdx?e.id.localeCompare(t.id):e.startIdx-t.startIdx),n=[],r=new Map;for(let e of t){let t=n.findIndex(t=>t<e.startIdx);t===-1?(t=n.length,n.push(e.endIdx)):n[t]=e.endIdx,r.set(e.id,t)}return r}function U(e,t,n){let r=e+6,i=[];for(let a of t)a.status!==`active`||a.startIdx>r||a.endIdx<e||i.push({deal:a,lane:n.get(a.id)??0,segStart:Math.max(a.startIdx,e),segEnd:Math.min(a.endIdx,r),contLeft:a.startIdx<e,contRight:a.endIdx>r||a.continuesPastGrid===!0&&r>=34});return i}function me(e){let[t,n]=(0,b.useState)(0);return(0,b.useEffect)(()=>{let t=e.current;if(t==null)return;let r=new ResizeObserver(e=>{let t=e[0]?.contentRect;t!=null&&n(t.width)});return r.observe(t),()=>r.disconnect()},[e]),t}function he(){return(0,x.jsxs)(`svg`,{width:24,height:24,viewBox:`0 0 24 24`,"aria-hidden":!0,style:{flexShrink:0},children:[(0,x.jsx)(`rect`,{x:3,y:4,width:18,height:17,rx:2.5,fill:`none`,stroke:S,strokeWidth:2}),(0,x.jsx)(`path`,{d:`M3 9h18`,stroke:S,strokeWidth:2}),(0,x.jsx)(`rect`,{x:6.5,y:12.5,width:11,height:4,rx:2,fill:S})]})}function W(e){return`${e/7*100}%`}function G(e){return`${e/7*100}%`}function K({segment:e,weekStart:t,isSelected:n,hasConflict:r,justLanded:i,barDetail:a,onSelect:o}){let{deal:s,lane:c,segStart:l,segEnd:u,contLeft:f,contRight:p}=e,m=O[s.category],h=u-l+1,g=s.deliverables.filter(e=>e.done).length;return(0,x.jsxs)(`button`,{type:`button`,className:`csc-bar csc-focusable csc-fade${f?` is-cont-left`:``}${p?` is-cont-right`:``}${i?` csc-land`:``}`,style:{left:`calc(${W(l-t)} + 1px)`,width:`calc(${G(h)} - 2px)`,top:24+c*22,background:m.soft},"aria-pressed":n,onClick:()=>o(s.id),"aria-label":`${s.brand}, ${m.label}, ${s.flightLabel}, ${L(s.value)}, ${g} of ${s.deliverables.length} deliverables done${r?`, exclusivity conflict`:``}`,children:[(0,x.jsx)(`span`,{className:`csc-bar-accent`,style:{background:m.color},"aria-hidden":!0}),r?(0,x.jsx)(`span`,{style:{color:w,display:`inline-flex`,flexShrink:0},"aria-hidden":!0,children:(0,x.jsx)(d,{size:11,strokeWidth:2.5})}):null,a===`initial`?(0,x.jsx)(`span`,{className:`csc-bar-text`,"aria-hidden":!0,children:s.brand.slice(0,1)}):(0,x.jsx)(`span`,{className:`csc-bar-text`,"aria-hidden":!0,children:s.brand}),a===`full`&&!f?(0,x.jsx)(`span`,{className:`csc-bar-value`,"aria-hidden":!0,children:L(s.value)}):null,p?(0,x.jsx)(`span`,{className:`csc-bar-value`,style:{marginLeft:`auto`},"aria-hidden":!0,children:`→`}):null,s.deliverables.map(e=>e.dayIdx>=l&&e.dayIdx<=u?(0,x.jsx)(`span`,{className:`csc-deliv`,style:{left:`${(e.dayIdx-l+.5)/h*100}%`,background:e.done?m.color:`var(--color-background)`,boxShadow:`inset 0 0 0 1.5px ${m.color}`},"aria-hidden":!0},e.id):null)]})}function ge({weekStart:e,deals:t,lanes:n,conflicts:r,selectedDealId:i,conflictedDealIds:a,justLandedId:o,barDetail:s,onSelect:c}){let l=U(e,t,n),u=e+6,d=r.map(t=>({...t,startIdx:Math.max(t.startIdx,e),endIdx:Math.min(t.endIdx,u)})).filter(e=>e.startIdx<=e.endIdx);return(0,x.jsxs)(`div`,{className:`csc-week`,children:[(0,x.jsx)(`div`,{className:`csc-week-days`,"aria-hidden":!0,children:Array.from({length:7},(t,n)=>{let r=e+n,i=M[r];return i==null?(0,x.jsx)(`span`,{className:`csc-day`},r):(0,x.jsx)(`span`,{className:`csc-day${i.inJuly?``:` is-outside`}`,children:(0,x.jsx)(`span`,{className:`csc-day-num${r===N?` is-today`:``}`,children:i.num===1||r===0?`${i.month} ${i.num}`:i.num})},r)})}),d.map(t=>(0,x.jsx)(`span`,{className:`csc-conflict-band`,style:{left:W(t.startIdx-e),width:G(t.endIdx-t.startIdx+1)},"aria-hidden":!0},`${t.offenderId}-${t.holderId}`)),l.map(t=>(0,x.jsx)(K,{segment:t,weekStart:e,isSelected:i===t.deal.id,hasConflict:a.has(t.deal.id),justLanded:o===t.deal.id,barDetail:s,onSelect:c},t.deal.id))]})}function _e({offer:e,conflictNotes:t,onAccept:n,onDecline:a}){let o=O[e.category],s=e.status===`declined`;return(0,x.jsxs)(`div`,{className:`csc-offer${s?` is-declined`:``}`,children:[(0,x.jsxs)(p,{gap:2,vAlign:`center`,children:[(0,x.jsx)(`span`,{"aria-hidden":!0,style:{width:8,height:8,borderRadius:2,background:o.color,flexShrink:0}}),(0,x.jsx)(`span`,{className:`csc-mono`,style:{color:`var(--color-text-secondary)`},children:e.id}),(0,x.jsx)(h,{size:`fill`,children:(0,x.jsx)(r,{type:`label`,size:`sm`,maxLines:1,children:(0,x.jsx)(`span`,{style:s?{textDecoration:`line-through`}:void 0,children:e.brand})})}),(0,x.jsx)(`span`,{className:`csc-mono`,style:{fontWeight:700},children:L(e.value)})]}),(0,x.jsxs)(r,{type:`supporting`,size:`xsm`,color:`secondary`,hasTabularNumbers:!0,maxLines:1,children:[e.flightLabel,` · `,o.label,` · `,e.deliverables.length,` deliverable`,e.deliverables.length===1?``:`s`,` · `,e.exclLabel]}),e.note!=null&&!s?(0,x.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,maxLines:2,children:e.note}):null,t.length>0&&!s?(0,x.jsxs)(`div`,{className:`csc-offer-warn`,children:[(0,x.jsx)(`span`,{style:{display:`inline-flex`,flexShrink:0,paddingTop:1},"aria-hidden":!0,children:(0,x.jsx)(d,{size:12,strokeWidth:2.5})}),(0,x.jsx)(m,{gap:0,children:t.map(e=>(0,x.jsx)(r,{type:`supporting`,size:`xsm`,color:`inherit`,maxLines:2,children:e},e))})]}):null,s?(0,x.jsxs)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:[`Declined `,oe,` — kept for the quarter log.`]}):(0,x.jsxs)(p,{gap:2,vAlign:`center`,children:[(0,x.jsx)(v,{label:t.length>0?`Accept anyway`:`Accept`,variant:t.length>0?`secondary`:`primary`,size:`sm`,icon:(0,x.jsx)(i,{icon:f,size:`sm`}),onClick:n}),(0,x.jsx)(v,{label:`Decline`,variant:`ghost`,size:`sm`,icon:(0,x.jsx)(i,{icon:u,size:`sm`}),onClick:a})]})]})}function ve({deal:e,conflicts:t,dealById:n,onToggleDeliverable:i}){let a=O[e.category],o=e.deliverables.filter(e=>e.done).length,s=t.filter(t=>t.offenderId===e.id||t.holderId===e.id);return(0,x.jsxs)(m,{gap:2,children:[(0,x.jsxs)(p,{gap:2,vAlign:`center`,children:[(0,x.jsx)(`span`,{"aria-hidden":!0,style:{width:10,height:10,borderRadius:2,background:a.color,flexShrink:0}}),(0,x.jsx)(h,{size:`fill`,children:(0,x.jsx)(_,{level:3,maxLines:1,children:e.brand})}),(0,x.jsx)(ne,{size:`sm`,color:`default`,label:a.label})]}),(0,x.jsxs)(r,{type:`supporting`,size:`xsm`,color:`secondary`,hasTabularNumbers:!0,children:[e.flightLabel,` · `,L(e.value),` · `,e.exclLabel,` · `,e.contact]}),s.map(t=>{let i=n.get(t.offenderId===e.id?t.holderId:t.offenderId);return(0,x.jsxs)(`div`,{className:`csc-offer-warn`,role:`status`,children:[(0,x.jsx)(`span`,{style:{display:`inline-flex`,flexShrink:0,paddingTop:1},"aria-hidden":!0,children:(0,x.jsx)(d,{size:12,strokeWidth:2.5})}),(0,x.jsx)(r,{type:`supporting`,size:`xsm`,color:`inherit`,maxLines:2,children:t.offenderId===e.id?`This flight breaches ${i?.brand??`—`} exclusivity ${R(t.startIdx)} – ${R(t.endIdx)}.`:`${i?.brand??`—`} flight sits inside this deal's window ${R(t.startIdx)} – ${R(t.endIdx)}.`})]},`${t.offenderId}-${t.holderId}`)}),(0,x.jsxs)(m,{gap:0,children:[(0,x.jsxs)(p,{gap:2,vAlign:`center`,children:[(0,x.jsx)(`span`,{className:`csc-label`,children:`Deliverables`}),(0,x.jsxs)(`span`,{className:`csc-mono`,style:{color:`var(--color-text-secondary)`},children:[o,`/`,e.deliverables.length]})]}),e.deliverables.map(t=>(0,x.jsxs)(`button`,{type:`button`,className:`csc-deliv-row csc-focusable csc-fade`,"aria-pressed":t.done,onClick:()=>i(e.id,t.id),"aria-label":`${t.label}, ${t.dateLabel}, ${t.done?`done — press to reopen`:`open — press to mark done`}`,children:[(0,x.jsx)(`span`,{className:`csc-deliv-box`,style:t.done?{background:a.color,borderColor:a.color}:void 0,"aria-hidden":!0,children:t.done?(0,x.jsx)(f,{size:11,strokeWidth:3,color:`var(--color-background)`}):null}),(0,x.jsx)(`span`,{className:`csc-mono`,style:{width:22,flexShrink:0,color:`var(--color-text-secondary)`},children:I[t.kind]}),(0,x.jsx)(h,{size:`fill`,children:(0,x.jsx)(r,{type:`body`,size:`sm`,maxLines:1,children:t.label})}),(0,x.jsx)(`span`,{className:`csc-mono`,style:{color:`var(--color-text-secondary)`},children:t.dateLabel})]},t.id))]})]})}function ye({entries:e,selectedDealId:t,showDealColumn:n}){return(0,x.jsx)(m,{gap:0,children:e.map(e=>{let i=V[e.state];return(0,x.jsxs)(`div`,{className:`csc-ledger-row csc-fade${t===e.dealId?` is-highlight`:``}`,children:[(0,x.jsx)(`span`,{className:`csc-cp-dot`,style:e.state===`paid`?{background:i.color}:e.state===`invoiced`?{border:`2px solid ${i.color}`}:{border:`2px dashed var(--color-border)`},"aria-hidden":!0}),(0,x.jsx)(h,{size:`fill`,children:(0,x.jsxs)(m,{gap:0,children:[(0,x.jsxs)(p,{gap:2,vAlign:`center`,children:[(0,x.jsx)(r,{type:`body`,size:`sm`,maxLines:1,children:H[e.checkpoint.kind]}),n?(0,x.jsx)(`span`,{className:`csc-mono`,style:{color:`var(--color-text-secondary)`},children:e.brand.length>14?`${e.brand.slice(0,13)}…`:e.brand}):null]}),(0,x.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,hasTabularNumbers:!0,maxLines:1,children:n?e.checkpoint.dueLabel:`${e.brand} · ${e.checkpoint.dueLabel}`})]})}),(0,x.jsx)(`span`,{className:`csc-mono`,style:{fontWeight:600},children:L(e.checkpoint.amount)}),(0,x.jsx)(`span`,{className:`csc-mono`,style:{width:64,textAlign:`right`,color:i.color,fontSize:10},children:i.label})]},`${e.dealId}-${e.checkpoint.kind}`)})})}function q(){let[e,t]=(0,b.useState)(ue),[n,f]=(0,b.useState)(le),[ne,C]=(0,b.useState)(!1),[T,D]=(0,b.useState)(null),[k,A]=(0,b.useState)(`July book loaded — 3 live campaigns, 4 offers waiting.`),M=(0,b.useRef)(null),N=(0,b.useRef)(null),P=me(M),I=P===0||P>=1200,R=P>0&&P<1e3,B=P>0&&P<640,V=B?P:I&&!R?400:360,H=B?`initial`:I?`full`:`brand`,U=(0,b.useMemo)(()=>new Map(e.map(e=>[e.id,e])),[e]),W=(0,b.useMemo)(()=>pe(e),[e]),G=(0,b.useMemo)(()=>de(e),[e]),K=(0,b.useMemo)(()=>{let e=new Set;for(let t of G)e.add(t.offenderId),e.add(t.holderId);return e},[G]),q=(0,b.useMemo)(()=>fe(e),[e]),J=e.reduce((e,t)=>e+(t.status===`active`?t.value:0),0),be=q.reduce((e,t)=>e+(t.state===`paid`?t.checkpoint.amount:0),0),xe=J-be,Y=(0,b.useMemo)(()=>{let e=new Set;for(let t of G)e.add([t.offenderId,t.holderId].sort().join(`+`));return e.size},[G]),X=e.filter(e=>e.status===`pending`),Se=e.filter(e=>e.status===`declined`),Z=n==null?null:U.get(n)??null,Q=(e,n)=>{t(t=>t.map(t=>t.id===e?{...t,...n}:t))},Ce=e=>{f(e),R&&C(!0)},$=t=>{let n=z(t,e);Q(t.id,{status:`active`}),D(t.id),f(t.id),A(n.length>0?`${t.id} ${t.brand} accepted with an exclusivity conflict — bands hatched, ${L(t.value)} booked.`:`${t.id} ${t.brand} accepted — bar landed ${t.flightLabel}, 3 checkpoints added, ${L(t.value)} booked.`)},we=e=>{Q(e.id,{status:`declined`}),n===e.id&&f(null),A(`${e.id} ${e.brand} declined — logged, calendar unchanged.`)},Te=(e,t)=>{let n=U.get(e);if(n==null)return;let r=n.deliverables.map(e=>e.id===t?{...e,done:!e.done}:e);Q(e,{deliverables:r});let i=r.length>0&&r.every(e=>e.done),a=n.deliverables.find(e=>e.id===t);A(i?`${n.brand}: all deliverables in — delivery checkpoint moved to Invoiced.`:`${n.brand}: ${a?.label??`deliverable`} ${a?.done===!0?`reopened`:`marked done`}.`)},Ee=()=>{C(!1),(N.current?.querySelector(`button`))?.focus()},De=!R||ne;return(0,x.jsxs)(`div`,{ref:M,className:`${j} csc-root`,children:[(0,x.jsx)(`style`,{children:ae}),(0,x.jsxs)(g,{height:`fill`,children:[(0,x.jsx)(te,{children:(0,x.jsxs)(`div`,{className:`csc-header`,children:[(0,x.jsx)(he,{}),(0,x.jsxs)(m,{gap:0,children:[(0,x.jsx)(r,{type:`label`,size:`sm`,children:`Adlane`}),(0,x.jsxs)(`span`,{className:`csc-mono`,style:{color:`var(--color-text-secondary)`,fontSize:10},children:[F.handle,` · July 2026 · `,oe]})]}),(0,x.jsx)(h,{size:`fill`,children:(0,x.jsx)(`span`,{})}),(0,x.jsx)(`span`,{className:`csc-ticker`,"aria-live":`polite`,children:k}),Y>0?(0,x.jsxs)(`span`,{className:`csc-chip is-conflict`,"aria-label":`${Y} exclusivity conflict${Y===1?``:`s`} on the calendar`,children:[(0,x.jsx)(d,{size:12,strokeWidth:2.5,"aria-hidden":!0}),(0,x.jsx)(`span`,{className:`csc-mono`,style:{color:`inherit`,fontWeight:700},children:Y}),B?null:(0,x.jsxs)(r,{type:`supporting`,size:`xsm`,color:`inherit`,children:[`conflict`,Y===1?``:`s`]})]}):null,(0,x.jsxs)(`span`,{className:`csc-chip`,"aria-label":`Booked July revenue ${L(J)}, derived from accepted deals`,children:[(0,x.jsx)(i,{icon:a,size:`xsm`,color:`inherit`}),(0,x.jsx)(`span`,{className:`csc-mono`,style:{color:`inherit`,fontWeight:700},children:L(J)}),B?null:(0,x.jsx)(r,{type:`supporting`,size:`xsm`,color:`inherit`,children:`booked`})]}),R?(0,x.jsx)(`div`,{ref:N,style:{display:`inline-flex`},children:(0,x.jsx)(v,{label:`Offers (${X.length})`,variant:`secondary`,size:`sm`,icon:(0,x.jsx)(i,{icon:s,size:`sm`}),onClick:()=>C(e=>!e)})}):null,(0,x.jsx)(re,{size:`small`,name:F.name,alt:`${F.name}, ${F.handle}`})]})}),(0,x.jsx)(ee,{children:(0,x.jsxs)(`div`,{className:`csc-view`,children:[(0,x.jsxs)(`div`,{className:`csc-cal-col`,children:[(0,x.jsx)(`div`,{className:`csc-weekday-row`,"aria-hidden":!0,children:se.map(e=>(0,x.jsx)(`span`,{className:`csc-weekday`,children:B?e.slice(0,1):e},e))}),(0,x.jsx)(`div`,{className:`csc-cal-scroll`,children:ce.map(t=>(0,x.jsx)(ge,{weekStart:t,deals:e,lanes:W,conflicts:G,selectedDealId:n,conflictedDealIds:K,justLandedId:T,barDetail:H,onSelect:Ce},t))}),(0,x.jsxs)(`div`,{className:`csc-legend`,children:[B?null:Object.keys(O).map(e=>(0,x.jsxs)(`span`,{className:`csc-legend-key`,children:[(0,x.jsx)(`span`,{"aria-hidden":!0,style:{width:8,height:8,borderRadius:2,background:O[e].color}}),O[e].label]},e)),(0,x.jsxs)(`span`,{className:`csc-legend-key`,children:[(0,x.jsx)(`span`,{"aria-hidden":!0,style:{width:14,height:10,backgroundImage:`repeating-linear-gradient(45deg, ${E} 0px, ${E} 3px, transparent 3px, transparent 9px)`,border:`1px solid ${w}`}}),`exclusivity conflict`]}),(0,x.jsxs)(`span`,{className:`csc-legend-key`,children:[(0,x.jsx)(`span`,{"aria-hidden":!0,style:{width:8,height:8,transform:`rotate(45deg)`,background:`var(--color-text-secondary)`}}),`deliverable`]}),(0,x.jsx)(h,{size:`fill`,children:(0,x.jsx)(`span`,{})}),(0,x.jsxs)(`span`,{className:`csc-mono`,style:{fontSize:10,color:`var(--color-text-secondary)`},children:[e.filter(e=>e.status===`active`).length,` live · `,X.length,` pending`]})]})]}),De?(0,x.jsxs)(`aside`,{className:`csc-rail${R?` is-overlay`:``}`,style:{width:V},"aria-label":`Offers and payouts`,onKeyDown:e=>{e.key===`Escape`&&R&&Ee()},children:[(0,x.jsxs)(`div`,{className:`csc-rail-head`,children:[(0,x.jsx)(i,{icon:c,size:`sm`,color:`secondary`}),(0,x.jsx)(h,{size:`fill`,children:(0,x.jsxs)(_,{level:2,children:[`Offer inbox · `,X.length]})}),R?(0,x.jsx)(v,{label:`Close panel`,isIconOnly:!0,variant:`ghost`,size:`sm`,icon:(0,x.jsx)(i,{icon:u,size:`sm`}),onClick:Ee}):null]}),(0,x.jsx)(`div`,{className:`csc-rail-scroll`,children:(0,x.jsxs)(m,{gap:3,children:[X.length===0&&Se.length===0?(0,x.jsxs)(`div`,{className:`csc-empty`,children:[(0,x.jsx)(i,{icon:s,size:`lg`,color:`secondary`}),(0,x.jsx)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:`Inbox zero — every July offer is resolved.`})]}):(0,x.jsxs)(m,{gap:2,children:[X.map(t=>(0,x.jsx)(_e,{offer:t,conflictNotes:z(t,e),onAccept:()=>$(t),onDecline:()=>we(t)},t.id)),Se.map(e=>(0,x.jsx)(_e,{offer:e,conflictNotes:[],onAccept:()=>$(e),onDecline:()=>we(e)},e.id))]}),(0,x.jsx)(y,{}),Z!=null&&Z.status===`active`?(0,x.jsx)(ve,{deal:Z,conflicts:G,dealById:U,onToggleDeliverable:Te}):(0,x.jsxs)(p,{gap:2,vAlign:`center`,children:[(0,x.jsx)(i,{icon:l,size:`xsm`,color:`secondary`}),(0,x.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Select a campaign bar to see deliverables and conflicts.`})]}),(0,x.jsx)(y,{}),(0,x.jsxs)(m,{gap:1,children:[(0,x.jsxs)(p,{gap:2,vAlign:`center`,children:[(0,x.jsx)(i,{icon:o,size:`xsm`,color:`secondary`}),(0,x.jsx)(`span`,{className:`csc-label`,children:`Payout checkpoints · 30/50/20`})]}),(0,x.jsx)(ye,{entries:q,selectedDealId:n,showDealColumn:I})]})]})}),(0,x.jsxs)(`div`,{className:`csc-rail-totals`,children:[(0,x.jsxs)(m,{gap:0,children:[(0,x.jsx)(`span`,{className:`csc-label`,children:`Collected`}),(0,x.jsx)(`span`,{className:`csc-mono`,style:{fontWeight:700,color:ie},children:L(be)})]}),(0,x.jsxs)(m,{gap:0,children:[(0,x.jsx)(`span`,{className:`csc-label`,children:`Outstanding`}),(0,x.jsx)(`span`,{className:`csc-mono`,style:{fontWeight:700},children:L(xe)})]}),(0,x.jsx)(h,{size:`fill`,children:(0,x.jsx)(`span`,{})}),(0,x.jsxs)(m,{gap:0,children:[(0,x.jsx)(`span`,{className:`csc-label`,children:`Booked Jul`}),(0,x.jsx)(`span`,{className:`csc-mono`,style:{fontWeight:700,color:S},children:L(J)})]})]})]}):null]})})]})]})}export{q as default};