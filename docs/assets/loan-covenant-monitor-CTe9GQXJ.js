import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-DAwHU7YM.js";import{t as i}from"./Icon-QWhqeGsc.js";import{t as a}from"./chevron-up-D08Bgh8_.js";import{t as o}from"./file-check-corner-CVO6r1xc.js";import{t as s}from"./file-clock-_MG4oN2V.js";import{t as c}from"./gauge-BC1Ekvn4.js";import{t as l}from"./plus-Bx8j3GSv.js";import{t as u}from"./rotate-ccw-DxNZDBwe.js";import{t as d}from"./scale-CsJ87bta.js";import{t as f}from"./send-L-WBmF6l.js";import{t as p}from"./shield-alert-fiPiXJCM.js";import{C as m,i as h}from"./index-DDmS-Cgf.js";import{n as g,t as _}from"./LayoutContent-CCL91W7X.js";import{t as v}from"./LayoutHeader-Cy2mWoMf.js";import{t as y}from"./useMediaQuery-BvG63aw7.js";import{t as b}from"./Button-BqXaaLop.js";import{t as x}from"./Divider-BHIBe6GQ.js";import{t as S}from"./Token-Dz6zLK7e.js";import{t as C}from"./Avatar-DyaNw-yT.js";import{t as w}from"./Slider-BwU8XLFd.js";var T=e(t(),1),E=n(),D=`light-dark(#BE123C, #FB7185)`,O=`light-dark(rgba(190, 18, 60, 0.08), rgba(251, 113, 133, 0.14))`,k=`var(--color-data-categorical-green, light-dark(#0B991F, #34C759))`,ee=`var(--color-data-categorical-orange, light-dark(#B45309, #FBBF24))`,A=`light-dark(rgba(180, 83, 9, 0.10), rgba(251, 191, 36, 0.16))`,j=`light-dark(#DC2626, #F87171)`,M=`light-dark(rgba(220, 38, 38, 0.09), rgba(248, 113, 113, 0.15))`,N=12,P=`var(--font-family-code, ui-monospace, monospace)`,te=`
.tpl-loan-covenant-monitor {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.tpl-loan-covenant-monitor .lcm-header-bar {
  display: flex;
  align-items: center;
  gap: ${N}px;
  height: 48px;
  padding: 0 ${N}px;
  min-width: 0;
}
.tpl-loan-covenant-monitor .lcm-borrower-line {
  display: flex;
  align-items: baseline;
  gap: ${N/2}px;
  min-width: 0;
  overflow: hidden;
}
.tpl-loan-covenant-monitor .lcm-mono {
  font-family: ${P};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.tpl-loan-covenant-monitor .lcm-section-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.tpl-loan-covenant-monitor .lcm-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: transparent;
  font-size: 12px;
  white-space: nowrap;
  color: var(--color-text-secondary);
}
.tpl-loan-covenant-monitor .lcm-view-root {
  display: flex;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  position: relative;
}
.tpl-loan-covenant-monitor .lcm-main-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
/* Forecast bench — min 88px, wraps rather than squeezing the sliders. */
.tpl-loan-covenant-monitor .lcm-bench {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: ${N}px ${N*2}px;
  min-height: 88px;
  padding: ${N/2}px ${N}px ${N}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}
.tpl-loan-covenant-monitor .lcm-bench-readout {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 148px;
}
.tpl-loan-covenant-monitor .lcm-scenario-row {
  display: flex;
  align-items: center;
  gap: ${N/2}px;
  flex-wrap: wrap;
}
.tpl-loan-covenant-monitor .lcm-scenario-btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: transparent;
  font-family: inherit;
  font-size: 12px;
  color: var(--color-text-secondary);
  cursor: pointer;
}
.tpl-loan-covenant-monitor .lcm-scenario-btn[aria-pressed='true'] {
  border-color: ${D};
  background: ${O};
  color: var(--color-text-primary);
  font-weight: 600;
}
/* Gauge wall — width-driven auto-fill grid; columns subtract, panels never
   squeeze (dial box and sparkbar strip are fixed-size). */
.tpl-loan-covenant-monitor .lcm-wall-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${N}px;
}
.tpl-loan-covenant-monitor .lcm-wall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${N}px;
}
.tpl-loan-covenant-monitor .lcm-panel {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  background: var(--color-background);
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.tpl-loan-covenant-monitor .lcm-panel-head {
  display: flex;
  align-items: center;
  gap: ${N/2}px;
  height: 40px;
  padding: 0 ${N}px;
  border-bottom: var(--border-width) solid var(--color-border);
  min-width: 0;
}
.tpl-loan-covenant-monitor .lcm-panel-name {
  font-size: 13px;
  font-weight: 600;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tpl-loan-covenant-monitor .lcm-panel-body {
  display: flex;
  align-items: center;
  gap: ${N}px;
  padding: ${N}px;
  flex-wrap: wrap;
}
.tpl-loan-covenant-monitor .lcm-panel-foot {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0 ${N}px ${N/2}px;
  margin-top: auto;
}
.tpl-loan-covenant-monitor .lcm-foot-row {
  display: flex;
  align-items: center;
  gap: ${N/2}px;
  min-height: 32px;
}
.tpl-loan-covenant-monitor .lcm-status-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.tpl-loan-covenant-monitor .lcm-def-toggle {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 12px;
  color: var(--color-text-secondary);
  cursor: pointer;
}
.tpl-loan-covenant-monitor .lcm-def-body {
  padding: 0 0 ${N/2}px;
}
/* Sparkbars — 36px bars + 16px axis = 56px strip. */
.tpl-loan-covenant-monitor .lcm-sparks {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 36px;
}
.tpl-loan-covenant-monitor .lcm-spark-axis {
  display: flex;
  gap: 4px;
  height: 16px;
  align-items: center;
}
/* Waiver desk drawer. */
.tpl-loan-covenant-monitor .lcm-drawer {
  flex: none;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-left: var(--border-width) solid var(--color-border);
  background: var(--color-background);
}
.tpl-loan-covenant-monitor .lcm-drawer-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 6;
  box-shadow: var(--shadow-overlay, 0 8px 24px rgba(0, 0, 0, 0.18));
}
.tpl-loan-covenant-monitor .lcm-drawer-head {
  display: flex;
  align-items: center;
  gap: ${N/2}px;
  height: 40px;
  padding: 0 ${N}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}
.tpl-loan-covenant-monitor .lcm-drawer-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${N}px;
}
.tpl-loan-covenant-monitor .lcm-rank-row {
  display: flex;
  align-items: center;
  gap: ${N/2}px;
  min-height: 48px;
  padding: 0 ${N/2}px;
  border-bottom: var(--border-width) solid var(--color-border);
  min-width: 0;
}
.tpl-loan-covenant-monitor .lcm-rank-num {
  width: 18px;
  flex-shrink: 0;
  font-family: ${P};
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.tpl-loan-covenant-monitor .lcm-pkg-row {
  display: flex;
  align-items: center;
  gap: ${N/2}px;
  min-height: 40px;
}
.tpl-loan-covenant-monitor .lcm-drawer-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${N/2}px;
  height: 48px;
  padding: 0 ${N}px;
  border-top: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}
/* Legend strip — bottom-left corner owner, 32px. */
.tpl-loan-covenant-monitor .lcm-legend {
  display: flex;
  align-items: center;
  gap: ${N}px;
  height: 32px;
  padding: 0 ${N}px;
  border-top: var(--border-width) solid var(--color-border);
  overflow: hidden;
  flex-shrink: 0;
}
.tpl-loan-covenant-monitor .lcm-legend-key {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
/* Shared interactive plumbing. */
.tpl-loan-covenant-monitor button:focus-visible,
.tpl-loan-covenant-monitor .lcm-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.tpl-loan-covenant-monitor .lcm-fade {
  transition: color 160ms ease, background-color 160ms ease,
    border-color 160ms ease, opacity 160ms ease;
}
.tpl-loan-covenant-monitor .lcm-marker-move {
  transition: transform 160ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .tpl-loan-covenant-monitor .lcm-fade,
  .tpl-loan-covenant-monitor .lcm-marker-move {
    transition: none;
  }
}
.tpl-loan-covenant-monitor .lcm-vh {
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
/* 390px embed / full-screen phone: bench stacks, borrower line drops.
   These queries are real in the embed iframe; the inline demo band is
   handled by the container-width bands instead. */
@media (max-width: 640px) {
  .tpl-loan-covenant-monitor .lcm-borrower-line {
    display: none;
  }
  .tpl-loan-covenant-monitor .lcm-bench {
    align-items: stretch;
    flex-direction: column;
  }
  .tpl-loan-covenant-monitor .lcm-bench-readout {
    min-width: 0;
  }
  .tpl-loan-covenant-monitor .lcm-legend {
    gap: ${N/2}px;
  }
}
`,ne=`Harlan Fabrication Holdings, LLC`,re=`TLB $85.0M + RCF $20.0M · Agent Stonebriar Bank, N.A.`,ie=`Q2-2026`,ae=`Certificate due 14 Aug 2026`,oe={name:`Maya Lindqvist`,initials:`ML`},F=105,I=12.5,L=I/1e4*F*1e6,R={ebitda:38.4,totalDebt:151.2,seniorDebt:88.9,cash:11.5,cashInterest:13.1,schedAmort:4.3,capex:9.8,cashTaxes:3.2,revolverAvail:12.8},z=.0925;function se(e,t,n){return{...e,ebitda:e.ebitda*(1+t/100),totalDebt:e.totalDebt+n,seniorDebt:e.seniorDebt+n,cashInterest:e.cashInterest+z*n}}var B=`C-LEV`,V=`C-INT`,H=`C-FCC`,ce=`C-SSL`,le=`C-CAP`,ue=`C-LIQ`,U=[`Q3-24`,`Q4-24`,`Q1-25`,`Q2-25`,`Q3-25`,`Q4-25`,`Q1-26`,`Q2-26`];function W(e,t,n){return U.map((r,i)=>({q:r,value:e[i],limit:t[i],waivedRef:n?.[i]}))}var G=e=>U.map(()=>e),K=[{id:B,clause:`§7.11(a)`,name:`Maximum Total Net Leverage Ratio`,shortName:`Total net leverage`,kind:`max`,unit:`x`,limit:4,domainMin:2.5,domainMax:5.5,forecastSensitive:!0,compute:e=>(e.totalDebt-e.cash)/e.ebitda,definition:`Consolidated Total Net Debt to Consolidated EBITDA for the four-quarter period then ended. Stepped down 4.25x -> 4.00x at the 31 Mar 2026 test. Netting is capped at $25.0M of unrestricted cash. Equity-cure rights: up to two cures in any four-quarter period, no consecutive quarters (§8.04). Q1-25 breach (4.31x vs 4.25x) was waived under W-2025-04.`,history:W([4.42,4.36,4.31,4.12,3.98,3.83,3.72,3.64],[4.5,4.5,4.25,4.25,4.25,4.25,4,4],{2:`W-2025-04`})},{id:V,clause:`§7.11(b)`,name:`Minimum Interest Coverage Ratio`,shortName:`Interest coverage`,kind:`min`,unit:`x`,limit:2.5,domainMin:1.5,domainMax:4,forecastSensitive:!0,compute:e=>e.ebitda/e.cashInterest,definition:`Consolidated EBITDA to Consolidated Cash Interest Expense for the four-quarter period then ended. Cash interest excludes PIK on the Harlan sub notes but includes commitment fees on the undrawn revolver. No cure rights attach to this covenant.`,history:W([2.61,2.66,2.58,2.71,2.78,2.84,2.9,2.93],G(2.5))},{id:H,clause:`§7.11(c)`,name:`Minimum Consolidated Fixed Charge Coverage Ratio (excl. Permitted Ridgeway Capex)`,shortName:`Fixed charge coverage`,kind:`min`,unit:`x`,limit:1.2,domainMin:.8,domainMax:2,forecastSensitive:!0,compute:e=>(e.ebitda-e.capex-e.cashTaxes)/(e.cashInterest+e.schedAmort),definition:`(Consolidated EBITDA − Unfinanced Capex − Cash Taxes) to Fixed Charges (cash interest + scheduled amortization). Permitted Ridgeway Capex (as defined in §1.01) is excluded from the numerator deduction up to $4.0M per fiscal year while the Ridgeway facility remains under construction.`,history:W([1.28,1.31,1.25,1.33,1.38,1.41,1.44,1.46],G(1.2))},{id:ce,clause:`§7.11(d)`,name:`Maximum Senior Secured Net Leverage`,shortName:`Senior secured leverage`,kind:`max`,unit:`x`,limit:3,domainMin:1,domainMax:4,forecastSensitive:!0,compute:e=>(e.seniorDebt-e.cash)/e.ebitda,definition:`Senior Secured Net Debt (TLB outstanding plus revolver drawings, net of unrestricted cash) to Consolidated EBITDA. Springing test — tested only while revolver utilization exceeds 35% of commitments; utilization at 30 Jun 2026 was 36.0% including LCs, so the covenant is live this quarter.`,history:W([2.55,2.48,2.41,2.33,2.24,2.15,2.08,2.02],G(3))},{id:le,clause:`§7.12`,name:`Maximum Capital Expenditures (TTM)`,shortName:`Capex cap`,kind:`max`,unit:`$M`,limit:12,domainMin:6,domainMax:14,forecastSensitive:!1,compute:e=>e.capex,definition:`Trailing-twelve-month capital expenditures, tested quarterly against a $12.0M cap with a 50% carry-forward of unused basket (max carry $3.0M). The bench sliders do not touch capex, so this covenant is not forecast-sensitive on this surface.`,history:W([11.2,10.9,11.6,10.4,10.1,9.9,9.7,9.8],G(12))},{id:ue,clause:`§7.13`,name:`Minimum Liquidity`,shortName:`Minimum liquidity`,kind:`min`,unit:`$M`,limit:10,domainMin:0,domainMax:30,forecastSensitive:!1,compute:e=>e.cash+e.revolverAvail,definition:`Unrestricted cash plus undrawn revolver availability ($20.0M commitments − $6.0M drawn − $1.2M LCs = $12.8M available), tested monthly. Add-on proceeds fund Ridgeway day-one and paydowns come from escrowed asset-sale proceeds, so the bench sliders leave both cash and availability unchanged — not forecast-sensitive here.`,history:W([15.2,16.8,14.1,18.9,20.4,21.7,23,24.3],G(10))}],de=new Map(K.map(e=>[e.id,e])),fe=[{id:`base`,label:`Base`,ebitdaPct:0,debtDelta:0},{id:`ridgeway`,label:`Ridgeway add-on +$24M`,ebitdaPct:0,debtDelta:24},{id:`soft`,label:`Soft landing −12%`,ebitdaPct:-12,debtDelta:0},{id:`stress`,label:`Stress −22% / +$24M`,ebitdaPct:-22,debtDelta:24}];function pe(e,t){return e.kind===`max`?(e.limit-t)/e.limit:(t-e.limit)/e.limit}var me=.1;function q(e,t){let n=pe(e,t);return n<0?`breach`:n<me?`watch`:`compliant`}var J={compliant:k,watch:ee,breach:j},he={compliant:`light-dark(rgba(11, 153, 31, 0.10), rgba(52, 199, 89, 0.16))`,watch:A,breach:M},ge={compliant:`Compliant`,watch:`Watch`,breach:`Projected breach`};function Y(e,t){return e.unit===`x`?`${t.toFixed(2)}x`:`$${t.toFixed(1)}M`}function _e(e){return`${e.kind===`max`?`≤`:`≥`} ${Y(e,e.limit)}`}function ve(e){let t=e*100;return`${t>=0?`+`:`−`}${Math.abs(t).toFixed(0)}%`}function ye(e){return`$${Math.round(e).toLocaleString(`en-US`)}`}function be(e,t){let n=se(R,e,t);return K.map(e=>{let t=e.compute(R),r=e.forecastSensitive?e.compute(n):t;return{covenant:e,actual:t,forecast:r,actualStatus:q(e,t),forecastStatus:q(e,r),forecastHeadroom:pe(e,r)}})}function xe(e){let[t,n]=(0,T.useState)(0);return(0,T.useEffect)(()=>{let t=e.current;if(t==null)return;let r=new ResizeObserver(e=>{let t=e[0]?.contentRect;t!=null&&n(t.width)});return r.observe(t),()=>r.disconnect()},[e]),t}function Se(){return(0,E.jsxs)(`svg`,{width:24,height:24,viewBox:`0 0 24 24`,"aria-hidden":!0,style:{flexShrink:0},children:[(0,E.jsx)(`path`,{d:`M 4 16 A 8.5 8.5 0 1 1 20 16`,fill:`none`,stroke:D,strokeWidth:2.4,strokeLinecap:`round`}),(0,E.jsx)(`line`,{x1:12,y1:14,x2:17,y2:7.5,stroke:D,strokeWidth:2,strokeLinecap:`round`}),(0,E.jsx)(`circle`,{cx:12,cy:14,r:2,fill:D})]})}var Ce=168,we=100,X=84,Te=88,Z=64;function Q(e,t){let n=Math.PI*(1-e);return{x:X+t*Math.cos(n),y:Te-t*Math.sin(n)}}function $(e,t,n){let r=Q(e,n),i=Q(t,n);return`M ${r.x.toFixed(2)} ${r.y.toFixed(2)} A ${n} ${n} 0 0 1 ${i.x.toFixed(2)} ${i.y.toFixed(2)}`}function Ee({covenant:e,actual:t,forecast:n,forecastStatus:r,actualStatus:i,showForecast:a}){let{domainMin:o,domainMax:s,limit:c,kind:l}=e,u=s-o,d=e=>Math.min(Math.max((e-o)/u,0),1),f=d(t),p=d(n),m=d(c),h=Q(m,Z-9),g=Q(m,73),_=Q(f,Z-13),v=Q(p,Z),y=l===`max`?$(m,1,Z):$(0,m,Z);return(0,E.jsxs)(`svg`,{width:Ce,height:we,viewBox:`0 0 ${Ce} ${we}`,role:`img`,"aria-label":`${e.shortName}: actual ${Y(e,t)} against limit ${_e(e)}${a?`, forecast ${Y(e,n)} (${ge[r].toLowerCase()})`:``}`,style:{flexShrink:0},children:[(0,E.jsx)(`path`,{d:$(0,1,Z),fill:`none`,stroke:`var(--color-border)`,strokeWidth:10}),(0,E.jsx)(`path`,{d:y,fill:`none`,stroke:M,strokeWidth:10}),(0,E.jsx)(`path`,{d:l===`max`?$(0,f,Z):$(f,1,Z),fill:`none`,stroke:J[i],strokeWidth:4,opacity:.85}),(0,E.jsx)(`line`,{x1:h.x,y1:h.y,x2:g.x,y2:g.y,stroke:j,strokeWidth:2}),(0,E.jsx)(`line`,{x1:X,y1:Te,x2:_.x,y2:_.y,stroke:`var(--color-text-primary)`,strokeWidth:2,strokeLinecap:`round`}),(0,E.jsx)(`circle`,{cx:X,cy:Te,r:3.5,fill:`var(--color-text-primary)`}),a?(0,E.jsx)(`circle`,{className:`lcm-marker-move`,cx:v.x,cy:v.y,r:5,fill:`var(--color-background)`,stroke:D,strokeWidth:2.5}):null,(0,E.jsx)(`text`,{x:X-Z,y:99,textAnchor:`middle`,fontSize:9,fontFamily:`var(--font-family-code, ui-monospace, monospace)`,fill:`var(--color-text-secondary)`,children:e.unit===`x`?o.toFixed(1):o.toFixed(0)}),(0,E.jsx)(`text`,{x:148,y:99,textAnchor:`middle`,fontSize:9,fontFamily:`var(--font-family-code, ui-monospace, monospace)`,fill:`var(--color-text-secondary)`,children:e.unit===`x`?s.toFixed(1):s.toFixed(0)})]})}var De=36,Oe=13;function ke({covenant:e}){let{domainMin:t,domainMax:n}=e,r=n-t,i=e=>Math.min(Math.max((e-t)/r,.04),1)*De,a=e.history.map(t=>`${t.q} ${Y(e,t.value)} vs ${Y(e,t.limit)}${t.waivedRef==null?``:` (breached, waived ${t.waivedRef})`}`).join(`; `);return(0,E.jsxs)(`div`,{style:{minWidth:0},children:[(0,E.jsx)(`div`,{className:`lcm-sparks`,"aria-hidden":!0,children:e.history.map((t,n)=>{let r=q({...e,limit:t.limit},t.value)===`breach`,a=n===e.history.length-1,o=i(t.value),s=i(t.limit);return(0,E.jsxs)(`span`,{title:`${t.q}: ${Y(e,t.value)} vs ${e.kind===`max`?`≤`:`≥`} ${Y(e,t.limit)}${t.waivedRef==null?``:` — waived ${t.waivedRef}`}`,style:{position:`relative`,width:Oe,height:De,flexShrink:0},children:[(0,E.jsx)(`span`,{className:`lcm-fade`,style:{position:`absolute`,bottom:0,left:0,width:`100%`,height:o,borderRadius:2,backgroundColor:r?j:a?J[q(e,t.value)]:`var(--color-border)`}}),(0,E.jsx)(`span`,{style:{position:`absolute`,bottom:s-1,left:-1,width:15,height:2,backgroundColor:`var(--color-text-secondary)`}})]},t.q)})}),(0,E.jsx)(`div`,{className:`lcm-spark-axis`,"aria-hidden":!0,children:e.history.map((e,t)=>(0,E.jsx)(`span`,{style:{width:Oe,flexShrink:0,fontSize:8,fontFamily:P,color:`var(--color-text-secondary)`,textAlign:`center`,overflow:`hidden`},children:t%2==1?e.q.slice(0,2):``},e.q))}),(0,E.jsx)(`span`,{className:`lcm-vh`,children:`Eight-quarter history for ${e.shortName}: ${a}.`})]})}function Ae({derived:e,benchActive:t,inPackage:n,packageLocked:s,defOpen:c,onToggleDef:u,onAddToPackage:d}){let{covenant:f,actual:h,forecast:g,actualStatus:_,forecastStatus:v,forecastHeadroom:y}=e,x=t&&f.forecastSensitive,S=x?v:_,C=`${ve(pe(f,h))} headroom`;return(0,E.jsxs)(`section`,{className:`lcm-panel`,"aria-label":`${f.shortName} covenant`,children:[(0,E.jsxs)(`div`,{className:`lcm-panel-head`,children:[(0,E.jsx)(`span`,{className:`lcm-mono`,style:{color:`var(--color-text-secondary)`},children:f.clause}),(0,E.jsx)(`h3`,{className:`lcm-panel-name`,title:f.name,children:f.name}),(0,E.jsx)(`span`,{style:{flex:1},"aria-hidden":!0}),(0,E.jsxs)(`span`,{className:`lcm-status-chip lcm-fade`,style:{backgroundColor:he[S],color:J[S]},children:[S===`breach`?(0,E.jsx)(p,{size:11,strokeWidth:2.5,"aria-hidden":!0}):null,ge[S]]})]}),(0,E.jsxs)(`div`,{className:`lcm-panel-body`,children:[(0,E.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:2},children:[(0,E.jsx)(Ee,{covenant:f,actual:h,forecast:g,forecastStatus:v,actualStatus:_,showForecast:x}),(0,E.jsxs)(`span`,{className:`lcm-mono`,style:{fontSize:15,fontWeight:600},children:[Y(f,h),(0,E.jsx)(`span`,{style:{color:`var(--color-text-secondary)`,fontWeight:400},children:` ${_e(f)}`})]})]}),(0,E.jsx)(ke,{covenant:f})]}),(0,E.jsxs)(`div`,{className:`lcm-panel-foot`,children:[(0,E.jsx)(`div`,{className:`lcm-foot-row`,children:(0,E.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,hasTabularNumbers:!0,maxLines:1,children:f.forecastSensitive?x?`Forecast ${Y(f,g)} (${ve(y)} headroom) · actual ${C}`:`${C} · forecast tracks the bench`:`${C} · not forecast-sensitive`})}),(0,E.jsxs)(`div`,{className:`lcm-foot-row`,children:[(0,E.jsxs)(`button`,{type:`button`,className:`lcm-def-toggle lcm-fade`,"aria-expanded":c,onClick:u,children:[c?(0,E.jsx)(a,{size:13,"aria-hidden":!0}):(0,E.jsx)(m,{size:13,"aria-hidden":!0}),`Definition ${f.clause}`]}),(0,E.jsx)(`span`,{style:{flex:1},"aria-hidden":!0}),n?(0,E.jsxs)(`span`,{className:`lcm-status-chip`,style:{backgroundColor:O,color:D},children:[(0,E.jsx)(o,{size:11,strokeWidth:2.5,"aria-hidden":!0}),`In waiver pkg`]}):x&&v===`breach`?(0,E.jsx)(b,{label:`Add to waiver package`,variant:`secondary`,size:`sm`,isDisabled:s,icon:(0,E.jsx)(i,{icon:l,size:`sm`}),onClick:d}):null]}),c?(0,E.jsx)(`div`,{className:`lcm-def-body`,children:(0,E.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:f.definition})}):null]})]})}function je({ebitdaPct:e,debtDelta:t,benchActive:n,adjusted:r,onEbitdaPct:a,onDebtDelta:o,onReset:s}){let c=fe.find(n=>n.ebitdaPct===e&&n.debtDelta===t);return(0,E.jsxs)(`div`,{className:`lcm-bench`,role:`group`,"aria-label":`Forecast bench`,children:[(0,E.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:2,minWidth:200,flex:`0 1 240px`},children:(0,E.jsx)(w,{label:`EBITDA Δ (%)`,value:e,min:-25,max:15,step:1,valueDisplay:`text`,formatValue:e=>`${e>=0?`+`:`−`}${Math.abs(e)}% -> $${(R.ebitda*(1+e/100)).toFixed(1)}M TTM`,onChange:a})}),(0,E.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:2,minWidth:200,flex:`0 1 240px`},children:(0,E.jsx)(w,{label:`Incremental debt ($M)`,value:t,min:-20,max:30,step:1,valueDisplay:`text`,formatValue:e=>`${e>=0?`+`:`−`}$${Math.abs(e)}M -> $${(R.totalDebt+e).toFixed(1)}M total`,onChange:o})}),(0,E.jsxs)(`div`,{className:`lcm-bench-readout`,children:[(0,E.jsx)(`span`,{className:`lcm-section-label`,children:`Adjusted inputs`}),(0,E.jsx)(`span`,{className:`lcm-mono`,style:{color:`var(--color-text-secondary)`},children:`EBITDA $${r.ebitda.toFixed(1)}M · Net debt $${(r.totalDebt-r.cash).toFixed(1)}M`}),(0,E.jsx)(`span`,{className:`lcm-mono`,style:{color:`var(--color-text-secondary)`},children:`Cash interest $${r.cashInterest.toFixed(1)}M @ SOFR+450 on Δ`})]}),(0,E.jsxs)(`div`,{className:`lcm-scenario-row`,role:`group`,"aria-label":`Scenario presets`,children:[fe.map(e=>(0,E.jsx)(`button`,{type:`button`,className:`lcm-scenario-btn lcm-fade`,"aria-pressed":c?.id===e.id,onClick:()=>{a(e.ebitdaPct),o(e.debtDelta)},children:e.label},e.id)),n?(0,E.jsx)(b,{label:`Reset`,variant:`ghost`,size:`sm`,icon:(0,E.jsx)(i,{icon:u,size:`sm`}),onClick:s}):null]})]})}function Me({width:e,isOverlay:t,derivedList:n,benchActive:a,packageIds:c,packageSent:u,debtDelta:p,onClose:m,onAdd:g,onRemove:_,onSend:v,onReopen:y}){let C=c.length*L;return(0,E.jsxs)(`aside`,{className:`lcm-drawer${t?` lcm-drawer-overlay`:``}`,style:{width:e},"aria-label":`Waiver desk`,children:[(0,E.jsxs)(`div`,{className:`lcm-drawer-head`,children:[(0,E.jsx)(i,{icon:d,size:`sm`,color:`secondary`}),(0,E.jsx)(`h2`,{className:`lcm-vh`,children:`Waiver desk`}),(0,E.jsx)(r,{type:`label`,size:`sm`,children:`Waiver desk`}),(0,E.jsx)(`span`,{style:{flex:1},"aria-hidden":!0}),u?(0,E.jsx)(S,{size:`sm`,color:`green`,label:`Sent to counsel`}):(0,E.jsx)(S,{size:`sm`,color:`default`,label:`Draft`}),t?(0,E.jsx)(b,{label:`Close waiver desk`,isIconOnly:!0,variant:`ghost`,size:`sm`,icon:(0,E.jsx)(i,{icon:h,size:`sm`}),onClick:m}):null]}),(0,E.jsxs)(`div`,{className:`lcm-drawer-scroll`,children:[(0,E.jsx)(`span`,{className:`lcm-section-label`,children:`Forecast ranking`}),a?null:(0,E.jsx)(`div`,{style:{padding:`${N/2}px 0 ${N}px`},children:(0,E.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Bench idle — projections match Q2-26 actuals. Drag a forecast slider to stress the book; covenants re-rank by projected headroom as you drag.`})}),(0,E.jsx)(`div`,{role:`list`,"aria-label":`Covenants ranked by forecast headroom`,children:n.map((e,t)=>{let{covenant:n,forecast:r,forecastStatus:a,forecastHeadroom:s}=e,d=c.includes(n.id);return(0,E.jsxs)(`div`,{role:`listitem`,className:`lcm-rank-row`,children:[(0,E.jsx)(`span`,{className:`lcm-rank-num`,children:t+1}),(0,E.jsxs)(`div`,{style:{minWidth:0,flex:1,display:`flex`,flexDirection:`column`},children:[(0,E.jsx)(`span`,{style:{fontSize:12,fontWeight:600,overflow:`hidden`,textOverflow:`ellipsis`,whiteSpace:`nowrap`},children:n.shortName}),(0,E.jsx)(`span`,{className:`lcm-mono`,style:{fontSize:11,color:`var(--color-text-secondary)`},children:`${n.clause} · fcst ${Y(n,r)} vs ${_e(n)}`})]}),(0,E.jsx)(`span`,{className:`lcm-status-chip lcm-fade`,style:{backgroundColor:he[a],color:J[a],fontVariantNumeric:`tabular-nums`},children:ve(s)}),a===`breach`&&!d?(0,E.jsx)(b,{label:`Add ${n.shortName} to waiver package`,isIconOnly:!0,variant:`secondary`,size:`sm`,isDisabled:u,icon:(0,E.jsx)(i,{icon:l,size:`sm`}),onClick:()=>g(n.id)}):d?(0,E.jsx)(o,{size:14,color:D,"aria-label":`In package`}):null]},n.id)})}),(0,E.jsx)(`div`,{style:{height:N},"aria-hidden":!0}),(0,E.jsx)(x,{}),(0,E.jsx)(`div`,{style:{height:N},"aria-hidden":!0}),(0,E.jsx)(`span`,{className:`lcm-section-label`,children:`Waiver package · ${c.length} covenant${c.length===1?``:`s`}`}),c.length===0?(0,E.jsx)(`div`,{style:{padding:`${N/2}px 0`},children:(0,E.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Empty. Add projected-breach covenants from the ranking above or from a gauge panel — both write to the same package.`})}):(0,E.jsx)(`div`,{role:`list`,"aria-label":`Covenants in waiver package`,children:c.map(e=>{let t=de.get(e);return t==null?null:(0,E.jsxs)(`div`,{role:`listitem`,className:`lcm-pkg-row`,children:[(0,E.jsx)(s,{size:14,color:D,"aria-hidden":!0}),(0,E.jsxs)(`div`,{style:{minWidth:0,flex:1,display:`flex`,flexDirection:`column`},children:[(0,E.jsx)(`span`,{style:{fontSize:12,fontWeight:600},children:t.shortName}),(0,E.jsx)(`span`,{className:`lcm-mono`,style:{fontSize:11,color:`var(--color-text-secondary)`},children:`${t.clause} · fee ${ye(L)}`})]}),(0,E.jsx)(b,{label:`Remove ${t.shortName} from package`,isIconOnly:!0,variant:`ghost`,size:`sm`,isDisabled:u,icon:(0,E.jsx)(i,{icon:h,size:`sm`}),onClick:()=>_(e)})]},e)})}),c.length>0?(0,E.jsxs)(`div`,{style:{paddingTop:N/2,display:`flex`,flexDirection:`column`,gap:2},children:[(0,E.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,hasTabularNumbers:!0,children:`Fee basis: ${I} bps × $${F.toFixed(1)}M commitments = ${ye(L)} per covenant.`}),p>0?(0,E.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,hasTabularNumbers:!0,children:`Includes incremental-facility consent for the +$${p}M add-on (§2.14 most-favored-nation check applies).`}):null,u?(0,E.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Sent to Ashworth & Crane LLP, 8 Jul 2026 16:40 — package locked pending counsel mark-up. Reopen to edit.`}):null]}):null]}),(0,E.jsxs)(`div`,{className:`lcm-drawer-foot`,children:[(0,E.jsx)(`span`,{className:`lcm-mono`,style:{fontWeight:600},children:c.length>0?`Fees ${ye(C)}`:`No fees accrued`}),u?(0,E.jsx)(b,{label:`Reopen draft`,variant:`secondary`,size:`sm`,onClick:y}):(0,E.jsx)(b,{label:`Send to counsel`,variant:`primary`,size:`sm`,isDisabled:c.length===0,icon:(0,E.jsx)(i,{icon:f,size:`sm`}),onClick:v})]})]})}function Ne(){return(0,E.jsxs)(`div`,{className:`lcm-legend`,"aria-label":`Dial encoding legend`,children:[(0,E.jsxs)(`span`,{className:`lcm-legend-key`,children:[(0,E.jsx)(`span`,{"aria-hidden":!0,style:{width:12,height:2,backgroundColor:`var(--color-text-primary)`}}),(0,E.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Actual (Q2-26)`})]}),(0,E.jsxs)(`span`,{className:`lcm-legend-key`,children:[(0,E.jsx)(`span`,{"aria-hidden":!0,style:{width:9,height:9,borderRadius:999,border:`2.5px solid ${D}`,backgroundColor:`var(--color-background)`}}),(0,E.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Forecast`})]}),(0,E.jsxs)(`span`,{className:`lcm-legend-key`,children:[(0,E.jsx)(`span`,{"aria-hidden":!0,style:{width:2,height:12,backgroundColor:j}}),(0,E.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Covenant limit`})]}),(0,E.jsxs)(`span`,{className:`lcm-legend-key`,children:[(0,E.jsx)(`span`,{"aria-hidden":!0,style:{width:8,height:12,borderRadius:2,backgroundColor:j}}),(0,E.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Breached quarter (waived)`})]}),(0,E.jsxs)(`span`,{className:`lcm-legend-key`,children:[(0,E.jsx)(`span`,{"aria-hidden":!0,style:{width:12,height:2,backgroundColor:`var(--color-text-secondary)`}}),(0,E.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Per-quarter limit notch`})]})]})}function Pe(e){return e instanceof HTMLElement&&(e.tagName===`INPUT`||e.tagName===`TEXTAREA`||e.isContentEditable)}function Fe(){let e=(0,T.useRef)(null),t=xe(e),n=y(`(max-width: 1279px)`),i=y(`(max-width: 1023px)`),a=t>0?t<1180:n,o=t>0?t<980:i,l=o?320:a?300:340,[u,f]=(0,T.useState)(0),[p,m]=(0,T.useState)(0),[h,b]=(0,T.useState)([]),[x,S]=(0,T.useState)(!1),[w,D]=(0,T.useState)(()=>new Set),[O,k]=(0,T.useState)(!1),[ee,A]=(0,T.useState)(``),N=(0,T.useRef)(null),P=u!==0||p!==0,F=(0,T.useMemo)(()=>se(R,u,p),[u,p]),I=(0,T.useMemo)(()=>be(u,p),[u,p]),L=(0,T.useMemo)(()=>[...I].sort((e,t)=>e.forecastHeadroom-t.forecastHeadroom),[I]),z=I.filter(e=>(P?e.forecastStatus:e.actualStatus)===`breach`),B=z.length,V=(0,T.useRef)(0);(0,T.useEffect)(()=>{B!==V.current&&(A(B===0?`Forecast: no covenants projected in breach.`:`Forecast: ${B} covenant${B===1?``:`s`} projected in breach — ${z.map(e=>e.covenant.shortName).join(`, `)}.`),V.current=B)},[B,z]);let H=(0,T.useCallback)(e=>{b(t=>t.includes(e)?t:[...t,e])},[]),ce=(0,T.useCallback)(e=>{b(t=>t.filter(t=>t!==e))},[]),le=(0,T.useCallback)(e=>{D(t=>{let n=new Set(t);return n.has(e)?n.delete(e):n.add(e),n})},[]),ue=(0,T.useCallback)(()=>{f(0),m(0)},[]),U=(0,T.useCallback)(()=>{S(!0),A(`Waiver package sent to counsel and locked.`)},[]),W=(0,T.useCallback)(()=>{S(!1),A(`Waiver package reopened for editing.`)},[]),G=(0,T.useCallback)(()=>{k(!1),N.current?.focus()},[]),K=e=>{e.key!==`Escape`||Pe(e.target)||(o&&O?G():w.size>0&&D(new Set))},de=!o||O;return(0,E.jsxs)(`div`,{className:`tpl-loan-covenant-monitor`,onKeyDown:K,children:[(0,E.jsx)(`style`,{children:te}),(0,E.jsx)(`span`,{"aria-live":`polite`,role:`status`,className:`lcm-vh`,children:ee}),(0,E.jsx)(g,{height:`fill`,header:(0,E.jsx)(v,{padding:0,hasDivider:!0,children:(0,E.jsxs)(`div`,{className:`lcm-header-bar`,children:[(0,E.jsx)(Se,{}),(0,E.jsx)(r,{type:`label`,size:`sm`,children:`Covena`}),(0,E.jsx)(`h1`,{className:`lcm-vh`,children:`Covena loan covenant monitor — ${ne}`}),(0,E.jsxs)(`div`,{className:`lcm-borrower-line`,children:[(0,E.jsx)(r,{type:`label`,size:`sm`,maxLines:1,children:ne}),(0,E.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,maxLines:1,children:re})]}),(0,E.jsx)(`span`,{style:{flex:1},"aria-hidden":!0}),(0,E.jsxs)(`span`,{className:`lcm-chip`,children:[(0,E.jsx)(s,{size:12,"aria-hidden":!0}),a?`Cert due 14 Aug`:`${ie} · ${ae}`]}),(0,E.jsxs)(`span`,{className:`lcm-chip lcm-fade`,role:`status`,style:B>0?{borderColor:j,backgroundColor:M,color:j}:void 0,children:[(0,E.jsx)(c,{size:12,"aria-hidden":!0}),(0,E.jsx)(`span`,{className:`lcm-mono`,style:{color:`inherit`},children:B}),P?`projected breaches`:`breaches`]}),o?(0,E.jsxs)(`button`,{type:`button`,ref:N,className:`lcm-scenario-btn lcm-fade`,"aria-expanded":O,onClick:()=>k(e=>!e),children:[(0,E.jsx)(d,{size:13,"aria-hidden":!0}),`Waiver desk · ${h.length}`]}):null,(0,E.jsx)(C,{name:oe.name,size:`small`})]})}),content:(0,E.jsx)(_,{padding:0,children:(0,E.jsxs)(`div`,{ref:e,className:`lcm-view-root`,children:[(0,E.jsxs)(`div`,{className:`lcm-main-col`,children:[(0,E.jsx)(je,{ebitdaPct:u,debtDelta:p,benchActive:P,adjusted:F,onEbitdaPct:f,onDebtDelta:m,onReset:ue}),(0,E.jsx)(`div`,{className:`lcm-wall-scroll`,children:(0,E.jsx)(`div`,{className:`lcm-wall`,children:I.map(e=>(0,E.jsx)(Ae,{derived:e,benchActive:P,inPackage:h.includes(e.covenant.id),packageLocked:x,defOpen:w.has(e.covenant.id),onToggleDef:()=>le(e.covenant.id),onAddToPackage:()=>H(e.covenant.id)},e.covenant.id))})}),(0,E.jsx)(Ne,{})]}),de?(0,E.jsx)(Me,{width:l,isOverlay:o,derivedList:L,benchActive:P,packageIds:h,packageSent:x,debtDelta:p,onClose:G,onAdd:H,onRemove:ce,onSend:U,onReopen:W}):null]})})})]})}export{Fe as default};