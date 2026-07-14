import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-DgVzIcJL.js";import{t as i}from"./Icon-Bv9dUoit.js";import{t as a}from"./arrow-down-to-line-BMQZFake.js";import{t as o}from"./banknote-tx6yYufc.js";import{t as s}from"./circle-alert-DSoyiBhz.js";import{t as c}from"./locate-C5xAWKXr.js";import{t as l}from"./lock-B5eQTk6V.js";import{t as u}from"./zap-CT8lVUHC.js";import{_ as d,i as f,w as p,x as m}from"./index-784iMtOZ.js";import{n as h,t as ee}from"./LayoutContent-CCL91W7X.js";import{t as te}from"./LayoutHeader-Cy2mWoMf.js";import{t as g}from"./useMediaQuery-BvG63aw7.js";import{t as _}from"./Button-CPJJaCfy.js";import{t as v}from"./CheckboxInput-CDAMVVf2.js";import{t as ne}from"./Token-2lwv0FA8.js";import{t as re}from"./Avatar-DyaNw-yT.js";var y=e(t(),1),b=n(),x=`light-dark(#1D4ED8, #60A5FA)`,S=`light-dark(rgba(29, 78, 216, 0.08), rgba(96, 165, 250, 0.14))`,C=`var(--color-data-categorical-green, light-dark(#0B991F, #34C759))`,w=`light-dark(rgba(11, 153, 31, 0.10), rgba(52, 199, 89, 0.16))`,T=`var(--color-data-categorical-orange, light-dark(#B45309, #FBBF24))`,E=`light-dark(rgba(180, 83, 9, 0.10), rgba(251, 191, 36, 0.16))`,D=`light-dark(#DC2626, #F87171)`,O=`light-dark(rgba(220, 38, 38, 0.09), rgba(248, 113, 113, 0.15))`,k=`light-dark(rgba(60, 60, 67, 0.14), rgba(235, 235, 245, 0.16))`,A=12,j=`var(--font-family-code, ui-monospace, monospace)`,ie=`
.tpl-treasury-cash-position {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.tpl-treasury-cash-position .tcp-header-bar {
  display: flex;
  align-items: center;
  gap: ${A}px;
  height: 48px;
  padding: 0 ${A}px;
  min-width: 0;
}
.tpl-treasury-cash-position .tcp-group-line {
  display: flex;
  align-items: baseline;
  gap: ${A/2}px;
  min-width: 0;
  overflow: hidden;
}
.tpl-treasury-cash-position .tcp-mono {
  font-family: ${j};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.tpl-treasury-cash-position .tcp-section-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.tpl-treasury-cash-position .tcp-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 12px;
  white-space: nowrap;
  color: var(--color-text-secondary);
  background: transparent;
}
.tpl-treasury-cash-position .tcp-view-root {
  display: flex;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  position: relative;
}
.tpl-treasury-cash-position .tcp-main-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
/* Stat band — 64px, four derived tiles. */
.tpl-treasury-cash-position .tcp-stat-band {
  display: flex;
  align-items: stretch;
  gap: ${A}px;
  height: 64px;
  padding: ${A/2}px ${A}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
  overflow: hidden;
}
.tpl-treasury-cash-position .tcp-stat {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1px;
  min-width: 0;
}
.tpl-treasury-cash-position .tcp-stat-value {
  font-family: ${j};
  font-size: 17px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
/* Matrix scrollport — the fade hint lives on this NON-scrolling wrapper. */
.tpl-treasury-cash-position .tcp-matrix-viewport {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.tpl-treasury-cash-position .tcp-scroller {
  flex: 1;
  min-height: 0;
  overflow: auto;
  position: relative;
}
.tpl-treasury-cash-position .tcp-scroll-hint {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 44px;
  z-index: 5;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 3px;
  background: linear-gradient(to right, transparent, var(--color-background) 72%);
}
.tpl-treasury-cash-position .tcp-grid {
  position: relative;
  width: max-content;
  min-width: 100%;
}
.tpl-treasury-cash-position .tcp-grid-row {
  display: flex;
  align-items: stretch;
}
.tpl-treasury-cash-position .tcp-rail-cell {
  position: sticky;
  left: 0;
  z-index: 3;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 ${A}px;
  background: var(--color-background);
  border-right: var(--border-width) solid var(--color-border);
  border-bottom: var(--border-width) solid var(--color-border);
  min-width: 0;
}
.tpl-treasury-cash-position .tcp-head-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 1px;
  height: 40px;
  padding: 0 ${A}px;
  flex-shrink: 0;
  border-bottom: var(--border-width) solid var(--color-border);
  background: var(--color-background);
}
.tpl-treasury-cash-position .tcp-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 0;
  height: 44px;
  padding: 0 ${A}px;
  flex-shrink: 0;
  border-bottom: var(--border-width) solid var(--color-border);
  font-family: ${j};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.tpl-treasury-cash-position button.tcp-cell {
  appearance: none;
  border-left: none;
  border-top: none;
  border-right: none;
  background: transparent;
  cursor: pointer;
  color: inherit;
}
.tpl-treasury-cash-position .tcp-cell-restricted {
  background-image: repeating-linear-gradient(
    45deg, ${k} 0px, ${k} 2px, transparent 2px, transparent 8px);
}
.tpl-treasury-cash-position .tcp-total-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 36px;
  padding: 0 ${A}px;
  flex-shrink: 0;
  border-top: var(--border-width) solid var(--color-border);
  font-family: ${j};
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  background: var(--color-background);
}
/* Settlement strip — 6 lanes x 18px + 18px axis. */
.tpl-treasury-cash-position .tcp-settle {
  flex-shrink: 0;
  border-top: var(--border-width) solid var(--color-border);
  padding: ${A/2}px ${A}px;
}
.tpl-treasury-cash-position .tcp-lane {
  display: flex;
  align-items: center;
  gap: ${A/2}px;
  height: 18px;
}
.tpl-treasury-cash-position .tcp-lane-label {
  width: 108px;
  flex-shrink: 0;
  font-family: ${j};
  font-size: 10px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-treasury-cash-position .tcp-lane-track {
  position: relative;
  flex: 1;
  height: 8px;
  border-radius: 999px;
  background: var(--color-background-muted);
  overflow: visible;
}
.tpl-treasury-cash-position .tcp-lane-status {
  width: 148px;
  flex-shrink: 0;
  font-family: ${j};
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
}
/* Sweep queue rail. */
.tpl-treasury-cash-position .tcp-rail {
  flex: none;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-left: var(--border-width) solid var(--color-border);
  background: var(--color-background);
}
.tpl-treasury-cash-position .tcp-rail-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 6;
  box-shadow: var(--shadow-overlay, 0 8px 24px rgba(0, 0, 0, 0.18));
}
.tpl-treasury-cash-position .tcp-rail-head {
  display: flex;
  align-items: center;
  gap: ${A/2}px;
  height: 40px;
  padding: 0 ${A}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}
.tpl-treasury-cash-position .tcp-rail-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${A}px;
}
.tpl-treasury-cash-position .tcp-sweep-card {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  padding: ${A/2}px ${A}px ${A}px;
  margin-bottom: ${A}px;
  display: flex;
  flex-direction: column;
  gap: ${A/2}px;
  min-height: 96px;
  cursor: pointer;
}
.tpl-treasury-cash-position .tcp-sweep-card[data-selected='true'] {
  border-color: ${x};
  background: ${S};
}
.tpl-treasury-cash-position .tcp-sweep-head {
  display: flex;
  align-items: center;
  gap: ${A/2}px;
  min-width: 0;
}
.tpl-treasury-cash-position .tcp-window-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.tpl-treasury-cash-position .tcp-log-row {
  display: flex;
  align-items: baseline;
  gap: ${A/2}px;
  min-height: 28px;
  padding: 3px 0;
  border-bottom: var(--border-width) solid var(--color-border);
}
/* Legend strip — bottom-left corner owner, 32px. */
.tpl-treasury-cash-position .tcp-legend {
  display: flex;
  align-items: center;
  gap: ${A}px;
  height: 32px;
  padding: 0 ${A}px;
  border-top: var(--border-width) solid var(--color-border);
  overflow: hidden;
  flex-shrink: 0;
}
.tpl-treasury-cash-position .tcp-legend-key {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
/* Shared interactive plumbing. */
.tpl-treasury-cash-position button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}
.tpl-treasury-cash-position .tcp-fade {
  transition: color 160ms ease, background-color 160ms ease,
    border-color 160ms ease, opacity 160ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .tpl-treasury-cash-position .tcp-fade {
    transition: none;
  }
}
.tpl-treasury-cash-position .tcp-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
/* 390px embed / full-screen phone. */
@media (max-width: 640px) {
  .tpl-treasury-cash-position .tcp-group-line {
    display: none;
  }
  .tpl-treasury-cash-position .tcp-stat-band {
    height: auto;
    flex-wrap: wrap;
  }
  .tpl-treasury-cash-position .tcp-stat {
    flex: 1 1 40%;
  }
  .tpl-treasury-cash-position .tcp-lane-status {
    width: 84px;
  }
  .tpl-treasury-cash-position .tcp-lane-label {
    width: 64px;
  }
}
`,M=[`USD`,`EUR`,`GBP`,`JPY`,`BRL`,`CNY`],N={USD:1,EUR:1.1,GBP:1.3,JPY:.007,BRL:.2,CNY:.14},P=`E-NYC`,F=`E-FRA`,I=`E-AMS`,L=`E-LON`,R=`E-TYO`,z=`E-SAO`,B=`E-SHA`,V=[{id:P,name:`Northwind Treasury Center LLC (NY IHB)`,shortName:`NY IHB`,city:`New York`},{id:F,name:`Northwind Manufacturing GmbH`,shortName:`Frankfurt`,city:`Frankfurt`},{id:I,name:`Northwind Advanced Materials Coöperatief U.A.`,shortName:`Amsterdam`,city:`Amsterdam`},{id:L,name:`Northwind UK Ltd`,shortName:`London`,city:`London`},{id:R,name:`Northwind Japan KK`,shortName:`Tokyo`,city:`Tokyo`},{id:z,name:`Northwind do Brasil Ltda`,shortName:`São Paulo`,city:`São Paulo`,restricted:`BCB registration required`},{id:B,name:`Northwind (Shanghai) Trading Co., Ltd`,shortName:`Shanghai`,city:`Shanghai`,restricted:`SAFE quota applies`}],H=new Map(V.map((e,t)=>[e.id,t])),U=new Map(V.map(e=>[e.id,e])),ae={[P]:{USD:42.6},[F]:{USD:1.2,EUR:9.4},[I]:{EUR:5.8},[L]:{USD:.8,GBP:6.7},[R]:{USD:.4,JPY:980},[z]:{USD:.6,BRL:31.5},[B]:{CNY:45}},oe={[F]:{EUR:3.4},[I]:{EUR:3.3},[L]:{GBP:3.2},[R]:{JPY:580,USD:1},[z]:{BRL:13.5}},W=`11:20 ET`,se=.4444,G=[{ccy:`USD`,system:`Fedwire`,state:`open`,openFrac:.25,cutoffFrac:1,statusLine:`cutoff 18:00 · 6h40m left`,shortStatus:`open 6h40m`},{ccy:`EUR`,system:`TARGET2`,state:`closing`,openFrac:0,cutoffFrac:.5,statusLine:`cutoff 12:00 · 0h40m left`,shortStatus:`closes 0h40m`},{ccy:`GBP`,system:`CHAPS`,state:`open`,openFrac:0,cutoffFrac:.6111,statusLine:`cutoff 13:20 · 2h00m left`,shortStatus:`open 2h00m`},{ccy:`JPY`,system:`BOJ-NET`,state:`closed`,openFrac:0,cutoffFrac:0,statusLine:`closed 03:00 · reopens 19:30`,shortStatus:`cutoff passed`},{ccy:`BRL`,system:`SPB`,state:`open`,openFrac:.1667,cutoffFrac:.9167,statusLine:`cutoff 17:00 · 5h40m left`,shortStatus:`open 5h40m`},{ccy:`CNY`,system:`CNAPS`,state:`closed`,openFrac:0,cutoffFrac:0,statusLine:`closed 04:30 · reopens 20:30`,shortStatus:`cutoff passed`}],K=new Map(G.map(e=>[e.ccy,e])),ce=[{id:`SWP-2201`,srcEntityId:F,ccy:`EUR`,amount:6,usdAmount:6.6,note:`ZBA sweep to concentration target · leaves €3.40M operating floor`,status:`proposed`},{id:`SWP-2202`,srcEntityId:I,ccy:`EUR`,amount:2.5,usdAmount:2.75,note:`Weekly pool sweep · leaves €3.30M operating floor`,status:`proposed`},{id:`SWP-2203`,srcEntityId:L,ccy:`GBP`,amount:3.5,usdAmount:4.55,note:`ZBA sweep · leaves £3.20M operating floor`,status:`proposed`},{id:`SWP-2204`,srcEntityId:R,ccy:`JPY`,amount:400,usdAmount:2.8,note:`Quarterly repatriation · leaves ¥580M operating floor`,status:`proposed`},{id:`SWP-2205`,srcEntityId:z,ccy:`BRL`,amount:18,usdAmount:3.6,note:`Intercompany dividend · CADOC registration BR-2214-C`,gate:`cadoc`,status:`proposed`}],le=[`11:21 ET`,`11:22 ET`,`11:24 ET`,`11:26 ET`,`11:29 ET`],ue=[{time:`09:02 ET`,text:`SWP-2198 executed · GBP 2.20M @ 1.3000 -> $2.86M · London -> NY IHB`},{time:`07:31 ET`,text:`Rate card refreshed (5 pairs) · desk operator O. Calloway`},{time:`06:45 ET`,text:`Prior-day reconciliation complete · 0 breaks`}],de={name:`Owen Calloway`,initials:`OC`},fe=`Northwind Industrial Group · value date Wed 8 Jul 2026`;function q(e,t){return e===`JPY`?t.toFixed(0):t.toFixed(2)}function J(e){return`$${e.toFixed(2)}M`}function Y(e){return`${(e*100).toFixed(1)}%`}function X(e,t){let n=e[t]??{};return M.reduce((e,t)=>e+(n[t]??0)*N[t],0)}function pe(e){return V.reduce((t,n)=>t+X(e,n.id),0)}function me(e,t){return V.reduce((n,r)=>n+(e[r.id]?.[t]??0),0)}function he(e){return V.filter(e=>e.restricted!=null).reduce((t,n)=>t+X(e,n.id),0)}function ge(e,t,n,r){let i=oe[e.id]?.[t];return i!=null&&n<i-.005?`deficit`:r?`sweep-source`:i!=null&&Math.abs(n-i)<=.005?`at-floor`:e.restricted==null?`plain`:`restricted`}function _e(e){let[t,n]=(0,y.useState)(0);return(0,y.useEffect)(()=>{let t=e.current;if(t==null)return;let r=new ResizeObserver(e=>{let t=e[0]?.contentRect;t!=null&&n(t.width)});return r.observe(t),()=>r.disconnect()},[e]),t}function ve(){return(0,b.jsxs)(`svg`,{width:24,height:24,viewBox:`0 0 24 24`,"aria-hidden":!0,style:{flexShrink:0},children:[(0,b.jsx)(`line`,{x1:4,y1:7,x2:20,y2:7,stroke:x,strokeWidth:2.2,strokeLinecap:`round`}),(0,b.jsx)(`line`,{x1:4,y1:12,x2:16,y2:12,stroke:x,strokeWidth:2.2,strokeLinecap:`round`,opacity:.65}),(0,b.jsx)(`line`,{x1:4,y1:17,x2:12,y2:17,stroke:x,strokeWidth:2.2,strokeLinecap:`round`,opacity:.4}),(0,b.jsx)(`circle`,{cx:18.5,cy:16,r:3.2,fill:`none`,stroke:x,strokeWidth:2})]})}var Z=40,Q=44;function $(e,t,n){let r=M.indexOf(n);return{x:e.entityW+r*e.ccyW+e.ccyW/2,y:Z+t*Q+Q/2}}function ye(e,t){let n=$(e,H.get(t.srcEntityId)??0,t.ccy),r=$(e,H.get(P)??0,`USD`),i=r.y+14,a=n.x,o=Math.max(n.y-70,r.y),s=r.x+40,c=i+30;return`M ${n.x} ${n.y-12} C ${a} ${o}, ${s} ${c}, ${r.x+8} ${i}`}function be({sweeps:e,geometry:t,selectedId:n,gridHeight:r,gridWidth:i}){return(0,b.jsxs)(`svg`,{"aria-hidden":!0,width:i,height:r,viewBox:`0 0 ${i} ${r}`,style:{position:`absolute`,top:0,left:0,zIndex:2,pointerEvents:`none`},children:[(0,b.jsxs)(`defs`,{children:[(0,b.jsx)(`marker`,{id:`tcp-arrowhead-brand`,viewBox:`0 0 8 8`,refX:7,refY:4,markerWidth:7,markerHeight:7,orient:`auto-start-reverse`,children:(0,b.jsx)(`path`,{d:`M 0 0 L 8 4 L 0 8 z`,fill:x})}),(0,b.jsx)(`marker`,{id:`tcp-arrowhead-danger`,viewBox:`0 0 8 8`,refX:7,refY:4,markerWidth:7,markerHeight:7,orient:`auto-start-reverse`,children:(0,b.jsx)(`path`,{d:`M 0 0 L 8 4 L 0 8 z`,fill:D})})]}),e.map(e=>{let r=K.get(e.ccy),i=e.status===`proposed`&&r?.state===`closed`,a=n===e.id,o=e.status===`executed`?C:i?D:x;return(0,b.jsx)(`path`,{className:`tcp-fade`,d:ye(t,e),fill:`none`,stroke:o,strokeWidth:a?3:1.75,strokeDasharray:e.status===`executed`?void 0:i?`3 4`:`6 5`,opacity:e.status===`executed`?a?.8:.45:a?1:.75,markerEnd:e.status===`executed`?void 0:i?`url(#tcp-arrowhead-danger)`:`url(#tcp-arrowhead-brand)`},e.id)})]})}function xe({children:e}){let t=(0,y.useRef)(null),[n,r]=(0,y.useState)(!1),a=(0,y.useCallback)(()=>{let e=t.current;e!=null&&r(e.scrollWidth-e.clientWidth-e.scrollLeft>1)},[]);return(0,y.useEffect)(()=>{let e=t.current;if(e==null)return;a();let n=new ResizeObserver(a);return n.observe(e),()=>n.disconnect()},[a]),(0,b.jsxs)(`div`,{className:`tcp-matrix-viewport`,children:[(0,b.jsx)(`div`,{ref:t,className:`tcp-scroller`,onScroll:a,children:e}),n?(0,b.jsx)(`div`,{className:`tcp-scroll-hint`,"aria-hidden":!0,children:(0,b.jsx)(i,{icon:m,size:`xsm`,color:`secondary`})}):null]})}function Se({balances:e,sweeps:t,geometry:n,selectedId:r,onSelectSweep:i}){let{entityW:a,ccyW:o,showLegalNames:s}=n,c=a+M.length*o,u=Z+V.length*Q,d=new Map;for(let e of t)e.status===`proposed`&&d.set(`${e.srcEntityId}:${e.ccy}`,e);let f=t.find(e=>e.id===r)??null;return(0,b.jsxs)(`div`,{className:`tcp-grid`,role:`table`,"aria-label":`Entity by currency cash matrix, native millions`,children:[(0,b.jsx)(be,{sweeps:t,geometry:n,selectedId:r,gridWidth:c,gridHeight:u}),(0,b.jsxs)(`div`,{className:`tcp-grid-row`,role:`row`,children:[(0,b.jsx)(`div`,{className:`tcp-rail-cell`,role:`columnheader`,style:{width:a,height:Z,zIndex:4},children:(0,b.jsx)(`span`,{className:`tcp-section-label`,children:`Entity`})}),M.map(e=>{let t=K.get(e);return(0,b.jsxs)(`div`,{className:`tcp-head-cell`,role:`columnheader`,style:{width:o},children:[(0,b.jsx)(`span`,{className:`tcp-mono`,style:{fontWeight:600},children:e}),(0,b.jsx)(`span`,{className:`tcp-mono`,style:{fontSize:9,color:t?.state===`closed`?D:t?.state===`closing`?T:`var(--color-text-secondary)`},children:t?.state===`closed`?`closed`:t?.shortStatus})]},e)})]}),V.map(t=>{let n=e[t.id]??{},c=f!=null&&(f.srcEntityId===t.id||t.id===P);return(0,b.jsxs)(`div`,{className:`tcp-grid-row`,role:`row`,children:[(0,b.jsxs)(`div`,{className:`tcp-rail-cell`,role:`rowheader`,style:{width:a,height:Q,backgroundColor:c?`var(--color-background-muted)`:void 0},children:[t.restricted==null?null:(0,b.jsx)(`span`,{title:t.restricted,style:{display:`inline-flex`,flexShrink:0,color:`var(--color-text-secondary)`},children:(0,b.jsx)(l,{size:11,strokeWidth:2.5,"aria-label":`Restricted — ${t.restricted}`})}),(0,b.jsx)(`span`,{style:{fontSize:12,fontWeight:t.id===P?600:400,minWidth:0,overflow:`hidden`,textOverflow:`ellipsis`,whiteSpace:`nowrap`},title:t.name,children:s?t.name:t.shortName}),(0,b.jsx)(`span`,{style:{flex:1},"aria-hidden":!0}),(0,b.jsx)(`span`,{className:`tcp-mono`,style:{fontSize:10,color:`var(--color-text-secondary)`},children:J(X(e,t.id))})]}),M.map(e=>{let a=n[e],s=a==null?void 0:d.get(`${t.id}:${e}`),c=a==null?`plain`:ge(t,e,a,s!=null),l=f!=null&&(f.srcEntityId===t.id&&f.ccy===e||t.id===P&&e===`USD`),u=oe[t.id]?.[e],p={width:o,boxShadow:l?`inset 0 0 0 2px ${x}`:c===`deficit`?`inset 0 0 0 1px ${D}`:c===`at-floor`?`inset 0 0 0 1px ${C}`:void 0},m=a==null?(0,b.jsx)(`span`,{"aria-hidden":!0,style:{color:`var(--color-text-secondary)`,opacity:.5},children:`—`}):(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(`span`,{style:{color:c===`deficit`?D:void 0},children:q(e,a)}),c===`deficit`&&u!=null?(0,b.jsx)(`span`,{style:{fontSize:9,color:D},children:`floor ${q(e,u)}`}):c===`at-floor`?(0,b.jsx)(`span`,{style:{fontSize:9,color:C},children:`at floor`}):null]});return s!=null&&a!=null?(0,b.jsxs)(`button`,{type:`button`,role:`cell`,className:`tcp-cell tcp-fade${t.restricted==null?``:` tcp-cell-restricted`}`,style:p,"aria-label":`${t.shortName} ${e} ${q(e,a)} million — proposed sweep ${s.id}, select`,"aria-pressed":r===s.id,onClick:()=>i(s.id),children:[m,(0,b.jsx)(`span`,{"aria-hidden":!0,style:{position:`absolute`,top:5,right:5,width:6,height:6,borderRadius:999,backgroundColor:x}})]},e):(0,b.jsx)(`div`,{role:`cell`,className:`tcp-cell${t.restricted==null?``:` tcp-cell-restricted`}`,style:p,"aria-label":a==null?`${t.shortName} holds no ${e}`:`${t.shortName} ${e} ${q(e,a)} million${c===`deficit`?`, below operating floor`:c===`at-floor`?`, at operating floor`:``}`,children:m},e)})]},t.id)}),(0,b.jsxs)(`div`,{className:`tcp-grid-row`,role:`row`,children:[(0,b.jsxs)(`div`,{className:`tcp-rail-cell`,role:`rowheader`,style:{width:a,height:36,borderTop:`var(--border-width) solid var(--color-border)`},children:[(0,b.jsx)(`span`,{className:`tcp-section-label`,children:`Group total`}),(0,b.jsx)(`span`,{style:{flex:1},"aria-hidden":!0}),(0,b.jsx)(`span`,{className:`tcp-mono`,style:{fontWeight:600},children:J(pe(e))})]}),M.map(t=>(0,b.jsx)(`div`,{className:`tcp-total-cell`,role:`cell`,style:{width:o},children:q(t,me(e,t))},t))]})]})}function Ce(){let e=G.map(e=>`${e.ccy} ${e.system} ${e.statusLine}`).join(`; `);return(0,b.jsxs)(`div`,{className:`tcp-settle`,"aria-label":`Settlement windows`,children:[(0,b.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:A/2,height:18},children:[(0,b.jsx)(`span`,{className:`tcp-section-label`,children:`Settlement windows · 06:00–18:00 ET`}),(0,b.jsx)(`span`,{style:{flex:1},"aria-hidden":!0}),(0,b.jsx)(`span`,{className:`tcp-mono`,style:{fontSize:10,color:`var(--color-text-secondary)`},children:`now ${W}`})]}),(0,b.jsxs)(`div`,{style:{position:`relative`},"aria-hidden":!0,children:[G.map(e=>(0,b.jsxs)(`div`,{className:`tcp-lane`,children:[(0,b.jsx)(`span`,{className:`tcp-lane-label`,children:`${e.ccy} · ${e.system}`}),(0,b.jsx)(`span`,{className:`tcp-lane-track`,children:e.state===`closed`?null:(0,b.jsx)(`span`,{style:{position:`absolute`,top:0,bottom:0,left:`${e.openFrac*100}%`,width:`${(e.cutoffFrac-e.openFrac)*100}%`,borderRadius:999,backgroundColor:e.state===`closing`?T:C,opacity:.55}})}),(0,b.jsx)(`span`,{className:`tcp-lane-status`,style:e.state===`closed`?{color:D}:e.state===`closing`?{color:T}:void 0,children:e.statusLine})]},e.ccy)),(0,b.jsx)(`span`,{style:{position:`absolute`,top:0,bottom:0,left:`calc(114px + (100% - 114px - 154px) * ${se})`,width:2,backgroundColor:`var(--color-text-primary)`,opacity:.55}})]}),(0,b.jsx)(`span`,{className:`tcp-vh`,children:`Settlement windows as of ${W}: ${e}.`})]})}function we(e){return e==null?null:(0,b.jsxs)(`span`,{className:`tcp-window-chip`,style:e.state===`closed`?{backgroundColor:O,color:D}:e.state===`closing`?{backgroundColor:E,color:T}:{backgroundColor:w,color:C},children:[(0,b.jsx)(d,{size:10,strokeWidth:2.5,"aria-hidden":!0}),e.shortStatus]})}function Te({width:e,isOverlay:t,sweeps:n,log:o,selectedId:l,cadocConfirmed:d,executableCount:m,onSelect:h,onExecute:ee,onExecuteAll:te,onCadocChange:g,onClose:re}){let y=n.filter(e=>e.status===`proposed`),x=n.filter(e=>e.status===`executed`);return(0,b.jsxs)(`aside`,{className:`tcp-rail${t?` tcp-rail-overlay`:``}`,style:{width:e},"aria-label":`Sweep queue and action log`,children:[(0,b.jsxs)(`div`,{className:`tcp-rail-head`,children:[(0,b.jsx)(i,{icon:a,size:`sm`,color:`secondary`}),(0,b.jsx)(`h2`,{className:`tcp-vh`,children:`Sweep queue`}),(0,b.jsx)(r,{type:`label`,size:`sm`,children:`Sweep queue`}),(0,b.jsx)(`span`,{style:{flex:1},"aria-hidden":!0}),(0,b.jsx)(_,{label:`Execute all (${m})`,variant:`secondary`,size:`sm`,isDisabled:m===0,icon:(0,b.jsx)(i,{icon:u,size:`sm`}),onClick:te}),t?(0,b.jsx)(_,{label:`Close sweep queue`,isIconOnly:!0,variant:`ghost`,size:`sm`,icon:(0,b.jsx)(i,{icon:f,size:`sm`}),onClick:re}):null]}),(0,b.jsxs)(`div`,{className:`tcp-rail-scroll`,children:[y.length===0?(0,b.jsx)(`div`,{style:{padding:`${A}px 0`},children:(0,b.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Queue clear — every window-eligible sweep has settled. The JPY repatriation re-queues when BOJ-NET reopens at 19:30 ET.`})}):null,y.map(e=>{let t=U.get(e.srcEntityId),n=K.get(e.ccy),a=n?.state===`closed`,o=e.gate===`cadoc`&&!d,u=l===e.id;return(0,b.jsxs)(`div`,{className:`tcp-sweep-card tcp-fade`,"data-selected":u,onClick:()=>h(e.id),children:[(0,b.jsxs)(`div`,{className:`tcp-sweep-head`,children:[(0,b.jsx)(`span`,{className:`tcp-mono`,style:{fontWeight:600},children:e.id}),we(n),(0,b.jsx)(`span`,{style:{flex:1},"aria-hidden":!0}),e.gate===`cadoc`?(0,b.jsx)(ne,{size:`sm`,color:d?`green`:`gray`,label:`CADOC`}):null,(0,b.jsx)(`span`,{onClick:e=>e.stopPropagation(),children:(0,b.jsx)(_,{label:`${u?`Deselect`:`Locate`} ${e.id} in the matrix`,isIconOnly:!0,variant:`ghost`,size:`sm`,icon:(0,b.jsx)(i,{icon:c,size:`sm`}),onClick:()=>h(e.id)})})]}),(0,b.jsx)(`span`,{className:`tcp-mono`,style:{fontSize:12},children:`${t?.shortName} -> NY IHB · ${e.ccy} ${q(e.ccy,e.amount)}M @ ${N[e.ccy].toFixed(4)} -> ${J(e.usdAmount)}`}),(0,b.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,maxLines:2,children:e.note}),e.gate===`cadoc`?(0,b.jsx)(`div`,{onClick:e=>e.stopPropagation(),children:(0,b.jsx)(v,{label:`CADOC BR-2214-C confirmed on file`,value:d,onChange:g})}):null,a?(0,b.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:6,color:D},children:[(0,b.jsx)(s,{size:12,strokeWidth:2.5,"aria-hidden":!0}),(0,b.jsx)(r,{type:`supporting`,size:`xsm`,color:`inherit`,maxLines:2,children:`BOJ-NET cutoff passed 03:00 ET — resubmit after the 19:30 ET reopen.`})]}):(0,b.jsx)(`div`,{onClick:e=>e.stopPropagation(),children:(0,b.jsx)(_,{label:o?`Confirm CADOC to execute`:`Execute ${e.id}`,variant:`primary`,size:`sm`,isDisabled:o,onClick:()=>ee(e.id)})})]},e.id)}),x.length>0?(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(`span`,{className:`tcp-section-label`,children:`Settled this session`}),x.map(e=>{let t=U.get(e.srcEntityId);return(0,b.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:6,minHeight:32},children:[(0,b.jsx)(p,{size:13,strokeWidth:3,color:C,"aria-hidden":!0}),(0,b.jsx)(`span`,{className:`tcp-mono`,style:{fontSize:11,color:`var(--color-text-secondary)`},children:`${e.id} · ${t?.shortName} · ${J(e.usdAmount)} · ${e.executedAt??``}`})]},e.id)}),(0,b.jsx)(`div`,{style:{height:A/2},"aria-hidden":!0})]}):null,(0,b.jsx)(`span`,{className:`tcp-section-label`,children:`Action log`}),(0,b.jsx)(`div`,{role:`log`,"aria-label":`Treasury action log`,children:o.map((e,t)=>(0,b.jsxs)(`div`,{className:`tcp-log-row`,children:[(0,b.jsx)(`span`,{className:`tcp-mono`,style:{fontSize:10,color:`var(--color-text-secondary)`,flexShrink:0},children:e.time}),(0,b.jsx)(`span`,{style:{fontSize:11,minWidth:0},children:e.text})]},`${e.time}-${t}`))})]})]})}function Ee(){return(0,b.jsxs)(`div`,{className:`tcp-legend`,"aria-label":`Matrix encoding legend`,children:[(0,b.jsxs)(`span`,{className:`tcp-legend-key`,children:[(0,b.jsx)(`span`,{"aria-hidden":!0,style:{width:6,height:6,borderRadius:999,backgroundColor:x}}),(0,b.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Proposed sweep source`})]}),(0,b.jsxs)(`span`,{className:`tcp-legend-key`,children:[(0,b.jsx)(`svg`,{width:20,height:8,"aria-hidden":!0,children:(0,b.jsx)(`line`,{x1:0,y1:4,x2:20,y2:4,stroke:x,strokeWidth:1.75,strokeDasharray:`6 5`})}),(0,b.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Pending`})]}),(0,b.jsxs)(`span`,{className:`tcp-legend-key`,children:[(0,b.jsx)(`svg`,{width:20,height:8,"aria-hidden":!0,children:(0,b.jsx)(`line`,{x1:0,y1:4,x2:20,y2:4,stroke:C,strokeWidth:1.75,opacity:.6})}),(0,b.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Settled`})]}),(0,b.jsxs)(`span`,{className:`tcp-legend-key`,children:[(0,b.jsx)(`span`,{"aria-hidden":!0,style:{width:10,height:10,boxShadow:`inset 0 0 0 1px ${D}`}}),(0,b.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Below floor`})]}),(0,b.jsxs)(`span`,{className:`tcp-legend-key`,children:[(0,b.jsx)(`span`,{"aria-hidden":!0,style:{width:10,height:10,boxShadow:`inset 0 0 0 1px ${C}`}}),(0,b.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`At floor`})]}),(0,b.jsxs)(`span`,{className:`tcp-legend-key`,children:[(0,b.jsx)(`span`,{"aria-hidden":!0,style:{width:14,height:10,border:`var(--border-width) solid var(--color-border)`,backgroundImage:`repeating-linear-gradient(45deg, ${k} 0px, ${k} 2px, transparent 2px, transparent 5px)`}}),(0,b.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Restricted jurisdiction`})]})]})}var De={balances:ae,sweeps:ce,log:ue,execCount:0};function Oe(e,t){let n=e.sweeps.find(e=>e.id===t);if(n==null||n.status!==`proposed`)return e;let r=U.get(n.srcEntityId),i=le[Math.min(e.execCount,le.length-1)],a={...e.balances[n.srcEntityId]??{}},o={...e.balances[P]??{}};return a[n.ccy]=Math.round(((a[n.ccy]??0)-n.amount)*100)/100,o.USD=Math.round(((o.USD??0)+n.usdAmount)*100)/100,{balances:{...e.balances,[n.srcEntityId]:a,[P]:o},sweeps:e.sweeps.map(e=>e.id===t?{...e,status:`executed`,executedAt:i}:e),log:[{time:i,text:`${n.id} executed · ${n.ccy} ${q(n.ccy,n.amount)}M @ ${N[n.ccy].toFixed(4)} -> ${J(n.usdAmount)} · ${r?.shortName??n.srcEntityId} -> NY IHB`},...e.log],execCount:e.execCount+1}}function ke(e){return e instanceof HTMLElement&&(e.tagName===`INPUT`||e.tagName===`TEXTAREA`||e.isContentEditable)}function Ae(){let e=(0,y.useRef)(null),t=_e(e),n=g(`(max-width: 1279px)`),i=g(`(max-width: 1023px)`),s=t>0?t<1180:n,c=t>0?t<960:i,l=s?{entityW:190,ccyW:104,showLegalNames:!1}:{entityW:210,ccyW:112,showLegalNames:!0},u=c?320:s?300:340,[f,p]=(0,y.useState)(De),[m,_]=(0,y.useState)(null),[v,ne]=(0,y.useState)(!1),[x,S]=(0,y.useState)(!1),[C,w]=(0,y.useState)(``),E=(0,y.useRef)(null),D=pe(f.balances),O=f.balances[P]?.USD??0,k=D>0?O/D:0,A=he(f.balances),j=f.sweeps.filter(e=>e.status===`proposed`),M=(0,y.useCallback)(e=>e.status===`proposed`&&K.get(e.ccy)?.state!==`closed`&&(e.gate!==`cadoc`||v),[v]),N=j.filter(M).length,F=j.filter(e=>K.get(e.ccy)?.state===`closed`).length,I=j.filter(e=>e.gate===`cadoc`&&!v&&K.get(e.ccy)?.state!==`closed`).length,L=(0,y.useCallback)(e=>{let t=f.sweeps.find(t=>t.id===e);if(t==null||!M(t))return;let n=U.get(t.srcEntityId);p(t=>Oe(t,e));let r=D>0?(O+t.usdAmount)/D:0;w(`${t.id} executed: ${t.ccy} ${q(t.ccy,t.amount)} million swept from ${n?.shortName??`source`} to the in-house bank. Concentration now ${Y(r)}.`)},[f.sweeps,M,D,O]),R=(0,y.useCallback)(()=>{let e=f.sweeps.filter(M);if(e.length===0)return;p(t=>e.reduce((e,t)=>Oe(e,t.id),t));let t=e.reduce((e,t)=>e+t.usdAmount,0),n=D>0?(O+t)/D:0;w(`${e.length} sweeps executed, ${J(t)} concentrated to the in-house bank. Concentration now ${Y(n)}.`)},[f.sweeps,M,D,O]),z=(0,y.useCallback)(e=>{_(t=>t===e?null:e)},[]),B=(0,y.useCallback)(()=>{S(!1),E.current?.focus()},[]),V=e=>{e.key!==`Escape`||ke(e.target)||(c&&x?B():m!=null&&_(null))},H=!c||x;return(0,b.jsxs)(`div`,{className:`tpl-treasury-cash-position`,onKeyDown:V,children:[(0,b.jsx)(`style`,{children:ie}),(0,b.jsx)(`span`,{"aria-live":`polite`,role:`status`,className:`tcp-vh`,children:C}),(0,b.jsx)(h,{height:`fill`,header:(0,b.jsx)(te,{padding:0,hasDivider:!0,children:(0,b.jsxs)(`div`,{className:`tcp-header-bar`,children:[(0,b.jsx)(ve,{}),(0,b.jsx)(r,{type:`label`,size:`sm`,children:`Ledgerline`}),(0,b.jsx)(`h1`,{className:`tcp-vh`,children:`Ledgerline treasury cash position — Northwind Industrial Group`}),(0,b.jsxs)(`div`,{className:`tcp-group-line`,children:[(0,b.jsx)(r,{type:`label`,size:`sm`,maxLines:1,children:`Cash position`}),(0,b.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,maxLines:1,children:fe})]}),(0,b.jsx)(`span`,{style:{flex:1},"aria-hidden":!0}),(0,b.jsxs)(`span`,{className:`tcp-chip`,children:[(0,b.jsx)(d,{size:12,"aria-hidden":!0}),(0,b.jsx)(`span`,{className:`tcp-mono`,style:{color:`inherit`},children:W})]}),(0,b.jsxs)(`span`,{className:`tcp-chip`,children:[(0,b.jsx)(o,{size:12,"aria-hidden":!0}),`Base USD`]}),c?(0,b.jsxs)(`button`,{type:`button`,ref:E,className:`tcp-chip tcp-fade`,style:{cursor:`pointer`,fontFamily:`inherit`},"aria-expanded":x,onClick:()=>S(e=>!e),children:[(0,b.jsx)(a,{size:12,"aria-hidden":!0}),`Sweeps · ${j.length}`]}):null,(0,b.jsx)(re,{name:de.name,size:`small`})]})}),content:(0,b.jsx)(ee,{padding:0,children:(0,b.jsxs)(`div`,{ref:e,className:`tcp-view-root`,children:[(0,b.jsxs)(`div`,{className:`tcp-main-col`,children:[(0,b.jsxs)(`div`,{className:`tcp-stat-band`,children:[(0,b.jsxs)(`div`,{className:`tcp-stat`,style:{minWidth:128},children:[(0,b.jsx)(`span`,{className:`tcp-section-label`,children:`Group position`}),(0,b.jsx)(`span`,{className:`tcp-stat-value`,children:J(D)})]}),(0,b.jsxs)(`div`,{className:`tcp-stat`,style:{minWidth:148},children:[(0,b.jsx)(`span`,{className:`tcp-section-label`,children:`IHB concentration`}),(0,b.jsxs)(`span`,{className:`tcp-stat-value tcp-fade`,children:[Y(k),(0,b.jsx)(`span`,{style:{fontSize:11,fontWeight:400,color:`var(--color-text-secondary)`},children:` · ${J(O)}`})]})]}),(0,b.jsxs)(`div`,{className:`tcp-stat`,style:{minWidth:128},children:[(0,b.jsx)(`span`,{className:`tcp-section-label`,children:`Trapped cash`}),(0,b.jsxs)(`span`,{className:`tcp-stat-value tcp-fade`,style:{color:A>10?T:void 0},children:[J(A),(0,b.jsx)(`span`,{style:{fontSize:11,fontWeight:400,color:`var(--color-text-secondary)`},children:` · ${Y(D>0?A/D:0)}`})]})]}),(0,b.jsxs)(`div`,{className:`tcp-stat`,style:{minWidth:148},children:[(0,b.jsx)(`span`,{className:`tcp-section-label`,children:`Sweeps pending`}),(0,b.jsxs)(`span`,{className:`tcp-stat-value`,children:[j.length,(0,b.jsx)(`span`,{style:{fontSize:11,fontWeight:400,color:`var(--color-text-secondary)`},children:` · ${N} ready · ${I} gated · ${F} blocked`})]})]}),(0,b.jsx)(`span`,{style:{flex:1},"aria-hidden":!0}),(0,b.jsxs)(`div`,{className:`tcp-stat`,style:{alignItems:`flex-end`},children:[(0,b.jsx)(`span`,{className:`tcp-section-label`,children:`Rate card 07:30 ET`}),(0,b.jsx)(`span`,{className:`tcp-mono`,style:{fontSize:10,color:`var(--color-text-secondary)`},children:`EUR 1.1000 · GBP 1.3000 · JPY 0.0070`}),(0,b.jsx)(`span`,{className:`tcp-mono`,style:{fontSize:10,color:`var(--color-text-secondary)`},children:`BRL 0.2000 · CNY 0.1400`})]})]}),(0,b.jsx)(xe,{children:(0,b.jsx)(Se,{balances:f.balances,sweeps:f.sweeps,geometry:l,selectedId:m,onSelectSweep:z})}),(0,b.jsx)(Ce,{}),(0,b.jsx)(Ee,{})]}),H?(0,b.jsx)(Te,{width:u,isOverlay:c,sweeps:f.sweeps,log:f.log,selectedId:m,cadocConfirmed:v,executableCount:N,onSelect:z,onExecute:L,onExecuteAll:R,onCadocChange:ne,onClose:B}):null]})})})]})}export{Ae as default};