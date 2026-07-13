import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-DlKHZgO2.js";import{t as i}from"./Icon-DNqmP2EH.js";import{t as a}from"./arrow-up-right-DQJGzBi1.js";import{t as o}from"./crown-B1YzNOQV.js";import{t as s}from"./flask-conical-CVjt0kaM.js";import{t as c}from"./gauge-BLNhozx8.js";import{t as l}from"./scale-Bb212Kl3.js";import{t as u}from"./undo-2-FolzW3zf.js";import{A as d,b as f,o as p,v as m}from"./index-CZ0XLKUx.js";import{t as h}from"./HStack-2WTukjNp.js";import{t as g}from"./StackItem-Ca9P7L2I.js";import{n as ee,t as _}from"./LayoutContent-CCL91W7X.js";import{t as te}from"./LayoutHeader-Cy2mWoMf.js";import{t as v}from"./Heading-BBqhYPTB.js";import{t as y}from"./Badge-0Tj9omHc.js";import{t as b}from"./Button-Cj_m5AlK.js";var x=d(`arrow-down-right`,[[`path`,{d:`m7 7 10 10`,key:`1fmybs`}],[`path`,{d:`M17 7v10H7`,key:`6fjiku`}]]),S=e(t(),1),C=n(),w=`tpl-prompt-experiment-lab`,T=`light-dark(#4D7C0F, #A3E635)`,E=`light-dark(#FFFFFF, #1A2E05)`,D=`light-dark(rgba(77, 124, 15, 0.12), rgba(163, 230, 53, 0.16))`,O=`light-dark(rgba(77, 124, 15, 0.42), rgba(163, 230, 53, 0.42))`,k=`light-dark(rgba(77, 124, 15, 0.26), rgba(163, 230, 53, 0.26))`,A=`light-dark(rgba(77, 124, 15, 0.14), rgba(163, 230, 53, 0.14))`,j=`light-dark(#DC2626, #F87171)`,M=`light-dark(rgba(220, 38, 38, 0.10), rgba(248, 113, 113, 0.14))`,N=`light-dark(#B45309, #F5A623)`,P=`light-dark(#15803D, #4ADE80)`,F=`ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace`,I=[{key:`acc`,label:`Accuracy`,weight:.3,blurb:`Resolution matches the order ledger`},{key:`grd`,label:`Groundedness`,weight:.25,blurb:`Every claim cites a retrieved record`},{key:`pol`,label:`Policy compliance`,weight:.2,blurb:`Follows refund policy RP-22`},{key:`tone`,label:`Tone`,weight:.15,blurb:`Warm, direct, no apology loops`},{key:`brv`,label:`Brevity`,weight:.1,blurb:`Resolves in ≤3 turns where possible`}],L=[{id:`ctl`,name:`v3.2 · production`,shortName:`v3.2`,rev:`prm_9f21c4`,hypothesis:`Current production system prompt — baseline under test.`,graded:1240,scores:{acc:82,grd:78,pol:91,tone:84,brv:70},p50Latency:`2.4 s`,costPer1k:`$0.81`,promptLines:[{text:`You are Halcyon, the refund specialist for`},{text:`Nortech Home. Verify identity, look up the`},{text:`order, then apply policy RP-22 exactly.`},{text:`Never promise timelines beyond policy.`}]},{id:`va`,name:`A · terse-policy`,shortName:`A`,rev:`prm_b04e77`,hypothesis:`Cutting the policy digest to 6 bullet rules trades grounding for speed.`,graded:402,scores:{acc:84,grd:80,pol:88,tone:80,brv:88},p50Latency:`1.9 s`,costPer1k:`$0.62`,promptLines:[{text:`You are Halcyon, the refund specialist for`},{text:`Nortech Home. Verify identity, look up the`},{text:`Policy digest (6 rules, keep terse):`,added:!0},{text:`RP-22 §2 window · §4 exceptions · §7 escalate.`,added:!0}]},{id:`vb`,name:`B · chain-of-check`,shortName:`B`,rev:`prm_3d98a0`,hypothesis:`A mandatory self-check pass before answering cuts invented order ids.`,graded:512,scores:{acc:88,grd:86,pol:93,tone:82,brv:74},p50Latency:`3.1 s`,costPer1k:`$1.04`,promptLines:[{text:`You are Halcyon, the refund specialist for`},{text:`Nortech Home. Verify identity, look up the`},{text:`Before replying, verify: every order id and`,added:!0},{text:`amount appears verbatim in a retrieved record.`,added:!0}]},{id:`vc`,name:`C · few-shot refunds w/ escalation exemplars`,shortName:`C`,rev:`prm_57cc19`,hypothesis:`Three worked refund exemplars steady tone but bloat the context.`,graded:486,scores:{acc:86,grd:84,pol:90,tone:84,brv:78},p50Latency:`2.7 s`,costPer1k:`$0.93`,promptLines:[{text:`You are Halcyon, the refund specialist for`},{text:`Nortech Home. Verify identity, look up the`},{text:`Worked examples (3): partial refund, exchange`,added:!0},{text:`credit, and an escalation hand-off transcript.`,added:!0}]}],R=[{id:`fc-order`,label:`Invents an order number`,severity:`critical`,counts:{ctl:9,va:11,vb:2,vc:6},excerpt:{before:[`user: I returned the standing desk two weeks ago.`,`      Where is my refund?`],fail:`agent: Order #88412-R was refunded on July 9 —`,after:[`       you should see it in 2–3 days.`,`ledger: no order #88412-R exists for this account.`]},judgeNote:`The retrieved record set contains orders #71203 and #71944 only; the cited id and date are fabricated.`},{id:`fc-idcheck`,label:`Skips identity verification`,severity:`critical`,counts:{ctl:3,va:3,vb:0,vc:5},excerpt:{before:[`user: Cancel my order and refund the card on file.`],fail:`agent: Done — I have issued the refund to your Visa.`,after:[`policy: RP-22 §1 requires a verified email or last-4`,`        match before any account mutation.`]},judgeNote:`Refund issued with zero verification turns; RP-22 §1 is an unconditional gate.`},{id:`fc-window`,label:`Over-promises refund window`,severity:`major`,counts:{ctl:14,va:6,vb:5,vc:4},excerpt:{before:[`user: How long until the money is back?`],fail:`agent: At most 24 hours, guaranteed.`,after:[`policy: RP-22 §5 commits to 5–10 business days.`]},judgeNote:`Committed to a timeline policy does not authorize.`},{id:`fc-doc`,label:`Cites retired policy doc RP-19 §4.2 (superseded 2025-11)`,severity:`major`,counts:{ctl:11,va:8,vb:4,vc:9},excerpt:{before:[`user: Why was my restocking fee 15%?`],fail:`agent: Per policy RP-19 §4.2 the fee is 15%.`,after:[`policy: RP-22 §6 replaced it — the fee is 10%.`]},judgeNote:`RP-19 was retired from retrieval in Nov 2025; citing it is a stale-grounding failure.`},{id:`fc-tone`,label:`Apology loop / robotic tone`,severity:`minor`,counts:{ctl:7,va:12,vb:6,vc:3},excerpt:{before:[`user: This is the third time I am asking.`],fail:`agent: I sincerely apologize. I apologize for the inconvenience. Apologies again for…`,after:[`rubric: tone — one apology, then act.`]},judgeNote:`Three stacked apologies with no state change between them.`}],z=64,B=12,V=400,H=877,U=2;function W(e){return L.find(t=>t.id===e)??L[0]}function G(e){return I.reduce((t,n)=>t+n.weight*e.scores[n.key],0)}function K(e,t){return e.counts[t]/W(t).graded*1e3}function q(e){return e.toFixed(1)}function J(e){return e.toLocaleString(`en-US`)}function Y(e){let t=e.toFixed(1);return e>0?`+${t}`:t}function ne(e){let t=H+e*U,n=Math.floor(t/60)%24,r=t%60;return`${String(n).padStart(2,`0`)}:${String(r).padStart(2,`0`)}`}function re(e,t,n){if(t===n)return`on-par`;let r=K(e,t),i=K(e,n);return i===0?r===0?`on-par`:`regression`:r>i*1.2?`regression`:r<i*.8?`improved`:`on-par`}function X(e,t){let n=W(e),r=W(t),i=G(n),a=G(r),o=R.filter(n=>n.severity===`critical`&&K(n,e)>K(n,t));return[{id:`graded`,label:`≥ ${V} graded samples`,pass:n.graded>=V,detail:`${J(n.graded)} graded`},{id:`overall`,label:`Overall beats champion`,pass:i>a,detail:`${i.toFixed(1)} vs ${a.toFixed(1)}`},{id:`critical`,label:`No critical regression`,pass:o.length===0,detail:o.length===0?`all critical rates ≤ champion`:o.map(n=>`${q(K(n,e))} vs ${q(K(n,t))}/1k`).join(` · `)}]}function ie(e){let t={};for(let n of L)t[n.id]=n.id===e?z:B;return t}function Z(e,t){if(e===t)return T;let n=L.filter(e=>e.id!==t).findIndex(t=>t.id===e);return[O,k,A][n]??A}var Q={critical:`critical`,major:`major`,minor:`minor`},$={critical:j,major:N,minor:`var(--color-text-secondary)`},ae=`
.${w} {
  font-family: var(--font-family-sans);
}
.${w} button {
  font: inherit;
  color: inherit;
}
.${w} .pel-focusable:focus-visible {
  outline: 2px solid ${T};
  outline-offset: 2px;
}
.${w} .pel-num {
  font-variant-numeric: tabular-nums;
}
.${w} .pel-mono {
  font-family: ${F};
}
.${w} .pel-header-row {
  padding: var(--spacing-2) var(--spacing-4);
  min-height: 56px;
  box-sizing: border-box;
}
.${w} .pel-mark {
  display: inline-flex;
  flex-shrink: 0;
  color: ${T};
}
.${w} .pel-header-chips {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.${w} .pel-content {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
/* --- allocation strip: 20px segmented bar + 24px legend row -------------- */
.${w} .pel-alloc {
  flex-shrink: 0;
  min-height: 72px;
  box-sizing: border-box;
  padding: var(--spacing-2) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}
.${w} .pel-alloc-caption {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.${w} .pel-alloc-bar {
  display: flex;
  height: 20px;
  border-radius: 4px;
  overflow: hidden;
  border: var(--border-width) solid var(--color-border);
}
.${w} .pel-alloc-seg {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  font-size: 11px;
  font-weight: 600;
}
.${w} .pel-alloc-seg + .pel-alloc-seg {
  border-inline-start: var(--border-width) solid var(--color-border);
}
.${w} .pel-alloc-seg--champion {
  background: ${T};
  color: ${E};
}
.${w} .pel-alloc-legend {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  min-height: 24px;
  flex-wrap: wrap;
}
.${w} .pel-alloc-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
  min-width: 0;
}
.${w} .pel-alloc-swatch {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  border: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}
/* --- variant comparison grid --------------------------------------------- */
/* Hand-rolled grid (not the DS grid) so the column count can change under
   media queries without inline styles defeating them. */
.${w} .pel-grid {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(4, minmax(232px, 1fr));
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  align-content: start;
  box-sizing: border-box;
}
.${w} .pel-col {
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.${w} .pel-col--champion {
  border-color: ${T};
  box-shadow: inset 0 2px 0 0 ${T};
}
.${w} .pel-col-head {
  min-height: 64px;
  box-sizing: border-box;
  padding: var(--spacing-2) var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.${w} .pel-col-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
}
.${w} .pel-col-name {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.${w} .pel-role-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}
.${w} .pel-role-chip--champion {
  background: ${T};
  color: ${E};
}
.${w} .pel-role-chip--challenger {
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
}
.${w} .pel-overall {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
}
.${w} .pel-overall-value {
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.${w} .pel-delta-up {
  color: ${P};
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  font-weight: 600;
}
.${w} .pel-delta-down {
  color: ${j};
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  font-weight: 600;
}
.${w} .pel-col-section {
  padding: var(--spacing-2) var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}
.${w} .pel-col-section:last-child {
  border-bottom: none;
}
.${w} .pel-section-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
/* --- prompt diff excerpt -------------------------------------------------- */
.${w} .pel-prompt {
  border: var(--border-width) solid var(--color-border);
  border-radius: 6px;
  padding: var(--spacing-2);
  font-family: ${F};
  font-size: 11px;
  line-height: 1.6;
  overflow-x: auto;
}
.${w} .pel-prompt-line {
  white-space: pre;
  color: var(--color-text-secondary);
}
.${w} .pel-prompt-line--added {
  color: ${T};
  background: ${D};
  border-radius: 2px;
}
/* --- rubric bars: 34px rows, 6px track ------------------------------------ */
.${w} .pel-rubric-row {
  min-height: 34px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 3px;
  justify-content: center;
}
.${w} .pel-rubric-meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--spacing-2);
  font-size: 11px;
}
.${w} .pel-rubric-name {
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${w} .pel-rubric-score {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  font-variant-numeric: tabular-nums;
}
.${w} .pel-rubric-track {
  position: relative;
  height: 6px;
  border-radius: 3px;
  background: var(--color-background-secondary, ${D});
  overflow: visible;
}
.${w} .pel-rubric-fill {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  border-radius: 3px;
  background: ${T};
  opacity: 0.75;
}
.${w} .pel-rubric-fill--champion {
  opacity: 1;
}
/* Champion baseline tick: 2px marker at the champion's score position. */
.${w} .pel-rubric-tick {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 2px;
  background: ${T};
}
/* --- failure-cluster chips: 26px (40px on touch layouts) ------------------ */
.${w} .pel-cluster-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-height: 26px;
  box-sizing: border-box;
  padding: 2px 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: transparent;
  cursor: pointer;
  text-align: start;
  min-width: 0;
}
.${w} .pel-cluster-chip[aria-pressed='true'] {
  border-color: ${T};
  background: ${D};
}
.${w} .pel-cluster-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.${w} .pel-cluster-label {
  flex: 1;
  min-width: 0;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-text-primary);
}
.${w} .pel-cluster-rate {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}
.${w} .pel-cluster-tag {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}
.${w} .pel-cluster-tag--regression {
  color: ${j};
}
.${w} .pel-cluster-tag--improved {
  color: ${P};
}
/* --- stats + gates --------------------------------------------------------- */
.${w} .pel-stats {
  display: flex;
  gap: var(--spacing-2);
}
.${w} .pel-stat {
  flex: 1;
  min-width: 0;
  min-height: 44px;
  box-sizing: border-box;
  border: var(--border-width) solid var(--color-border);
  border-radius: 6px;
  padding: 4px 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.${w} .pel-stat-value {
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.${w} .pel-stat-label {
  font-size: 10px;
  color: var(--color-text-secondary);
}
.${w} .pel-gate-row {
  min-height: 24px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  min-width: 0;
}
.${w} .pel-gate-pass {
  color: ${P};
  display: inline-flex;
  flex-shrink: 0;
}
.${w} .pel-gate-fail {
  color: ${j};
  display: inline-flex;
  flex-shrink: 0;
}
.${w} .pel-gate-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text-secondary);
}
.${w} .pel-promote-note {
  font-size: 11px;
  color: var(--color-text-secondary);
}
/* --- bench bar: min 128, inspector fill + 300px log ------------------------ */
.${w} .pel-bench {
  flex-shrink: 0;
  min-height: 128px;
  box-sizing: border-box;
  border-top: var(--border-width) solid var(--color-border);
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
}
.${w} .pel-bench-inspect {
  padding: var(--spacing-2) var(--spacing-4);
  border-inline-end: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
  overflow-y: auto;
  max-height: 220px;
}
.${w} .pel-bench-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.${w} .pel-bench-rates {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.${w} .pel-bench-rate {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${w} .pel-bench-rate--champion {
  border-color: ${T};
  color: ${T};
}
.${w} .pel-excerpt {
  border: var(--border-width) solid var(--color-border);
  border-radius: 6px;
  padding: var(--spacing-2);
  font-family: ${F};
  font-size: 11px;
  line-height: 1.6;
  overflow-x: auto;
}
.${w} .pel-excerpt-line {
  white-space: pre-wrap;
  color: var(--color-text-secondary);
}
.${w} .pel-excerpt-fail {
  white-space: pre-wrap;
  color: ${j};
  background: ${M};
  border-radius: 2px;
}
.${w} .pel-bench-log {
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-height: 220px;
}
.${w} .pel-log-head {
  padding: var(--spacing-2) var(--spacing-3) 0;
}
.${w} .pel-log-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-1) var(--spacing-3) var(--spacing-2);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}
.${w} .pel-log-row {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  font-size: 12px;
}
.${w} .pel-log-clock {
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}
.${w} .pel-log-body {
  min-width: 0;
  flex: 1;
}
/* --- responsive subtraction ------------------------------------------------ */
@media (max-width: 900px) {
  .${w} .pel-grid {
    grid-template-columns: repeat(2, minmax(232px, 1fr));
  }
  .${w} .pel-bench {
    grid-template-columns: minmax(0, 1fr) 240px;
  }
}
@media (max-width: 600px) {
  .${w} .pel-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .${w} .pel-bench {
    grid-template-columns: minmax(0, 1fr);
  }
  .${w} .pel-bench-inspect {
    border-inline-end: none;
    border-bottom: var(--border-width) solid var(--color-border);
  }
  .${w} .pel-cluster-chip {
    min-height: 40px;
  }
}
@media (prefers-reduced-motion: no-preference) {
  .${w} .pel-cluster-chip,
  .${w} .pel-bench-rate {
    transition: background-color 120ms ease, border-color 120ms ease;
  }
}
`;function oe(){return(0,C.jsx)(`span`,{className:`pel-mark`,"aria-hidden":!0,children:(0,C.jsxs)(`svg`,{width:`20`,height:`20`,viewBox:`0 0 20 20`,fill:`none`,children:[(0,C.jsx)(`path`,{d:`M3 10h4c1.6 0 2.4-1 3.4-2.4C11.5 6 12.6 5 14.5 5`,stroke:`currentColor`,strokeWidth:`1.8`,strokeLinecap:`round`}),(0,C.jsx)(`path`,{d:`M10 10c.9 1.1 1.6 2.2 2.4 3.1.7.8 1.4 1.4 2.6 1.7`,stroke:`currentColor`,strokeWidth:`1.8`,strokeLinecap:`round`}),(0,C.jsx)(`circle`,{cx:`3`,cy:`10`,r:`1.7`,fill:`currentColor`}),(0,C.jsx)(`circle`,{cx:`16`,cy:`5`,r:`2.3`,fill:`currentColor`}),(0,C.jsx)(`circle`,{cx:`16`,cy:`15`,r:`1.9`,stroke:`currentColor`,strokeWidth:`1.4`})]})})}function se({dim:e,score:t,championScore:n,isChampion:r}){let i=t-n;return(0,C.jsxs)(`div`,{className:`pel-rubric-row`,children:[(0,C.jsxs)(`div`,{className:`pel-rubric-meta`,children:[(0,C.jsxs)(`span`,{className:`pel-rubric-name`,title:`${e.label} — ${e.blurb}`,children:[e.label,` `,(0,C.jsxs)(`span`,{className:`pel-num`,children:[`·`,(e.weight*100).toFixed(0),`%`]})]}),(0,C.jsxs)(`span`,{className:`pel-rubric-score`,children:[(0,C.jsx)(`strong`,{className:`pel-num`,children:t}),!r&&i!==0&&(0,C.jsx)(`span`,{className:i>0?`pel-delta-up`:`pel-delta-down`,children:Y(i)})]})]}),(0,C.jsxs)(`div`,{className:`pel-rubric-track`,role:`img`,"aria-label":`${e.label}: ${t} of 100${r?` (champion baseline)`:`, champion at ${n}`}`,children:[(0,C.jsx)(`span`,{className:r?`pel-rubric-fill pel-rubric-fill--champion`:`pel-rubric-fill`,style:{width:`${t}%`}}),!r&&(0,C.jsx)(`span`,{className:`pel-rubric-tick`,style:{insetInlineStart:`calc(${n}% - 1px)`}})]})]})}function ce({cluster:e,variantId:t,championId:n,isSelected:r,onSelect:o}){let s=K(e,t),c=re(e,t,n);return(0,C.jsxs)(`button`,{type:`button`,className:`pel-cluster-chip pel-focusable`,"aria-pressed":r,"aria-label":`${e.label} — ${Q[e.severity]}, ${e.counts[t]} hits, ${q(s)} per 1k${c===`on-par`?``:`, ${c} vs champion`}`,onClick:()=>o(e.id),children:[(0,C.jsx)(`span`,{className:`pel-cluster-dot`,style:{background:$[e.severity]},"aria-hidden":!0}),(0,C.jsx)(`span`,{className:`pel-cluster-label`,children:e.label}),(0,C.jsxs)(`span`,{className:`pel-cluster-rate`,children:[q(s),`/1k`]}),c!==`on-par`&&(0,C.jsx)(`span`,{className:`pel-cluster-tag pel-cluster-tag--${c}`,"aria-hidden":!0,children:(0,C.jsx)(i,{icon:c===`regression`?a:x,size:`xsm`,color:`inherit`})})]})}function le({variant:e,championId:t,allocationPct:n,selectedClusterId:a,onSelectCluster:s,onPromote:c}){let l=e.id===t,u=W(t),d=G(e),p=d-G(u),h=l?[]:X(e.id,t),g=h.length>0&&h.every(e=>e.pass);return(0,C.jsxs)(`section`,{className:l?`pel-col pel-col--champion`:`pel-col`,"aria-label":`Variant ${e.name}${l?` (champion)`:``}`,children:[(0,C.jsxs)(`header`,{className:`pel-col-head`,children:[(0,C.jsxs)(`div`,{className:`pel-col-title`,children:[(0,C.jsx)(`span`,{className:`pel-col-name`,title:e.name,children:e.name}),(0,C.jsxs)(`span`,{className:l?`pel-role-chip pel-role-chip--champion`:`pel-role-chip pel-role-chip--challenger`,children:[l&&(0,C.jsx)(i,{icon:o,size:`xsm`,color:`inherit`}),l?`CHAMPION`:`CHALLENGER`]})]}),(0,C.jsxs)(`div`,{className:`pel-overall`,children:[(0,C.jsx)(`span`,{className:`pel-overall-value`,children:d.toFixed(1)}),!l&&p!==0&&(0,C.jsxs)(`span`,{className:p>0?`pel-delta-up`:`pel-delta-down`,children:[Y(p),` vs champion`]}),(0,C.jsx)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:(0,C.jsxs)(`span`,{className:`pel-num`,children:[n,`% traffic · `,J(e.graded),` graded`]})})]})]}),(0,C.jsxs)(`div`,{className:`pel-col-section`,children:[(0,C.jsx)(`span`,{className:`pel-section-label`,children:`Prompt diff vs v3.2`}),(0,C.jsx)(`div`,{className:`pel-prompt`,tabIndex:0,role:`region`,"aria-label":`Prompt excerpt for ${e.name}`,children:e.promptLines.map((e,t)=>(0,C.jsxs)(`div`,{className:e.added===!0?`pel-prompt-line pel-prompt-line--added`:`pel-prompt-line`,children:[e.added===!0?`+ `:`  `,e.text]},t))}),(0,C.jsx)(r,{type:`supporting`,size:`sm`,color:`secondary`,maxLines:2,children:e.hypothesis})]}),(0,C.jsxs)(`div`,{className:`pel-col-section`,children:[(0,C.jsx)(`span`,{className:`pel-section-label`,children:`Judge rubric · weighted`}),I.map(t=>(0,C.jsx)(se,{dim:t,score:e.scores[t.key],championScore:u.scores[t.key],isChampion:l},t.key))]}),(0,C.jsxs)(`div`,{className:`pel-col-section`,children:[(0,C.jsx)(`span`,{className:`pel-section-label`,children:`Failure clusters`}),R.map(n=>(0,C.jsx)(ce,{cluster:n,variantId:e.id,championId:t,isSelected:a===n.id,onSelect:s},n.id))]}),(0,C.jsx)(`div`,{className:`pel-col-section`,children:(0,C.jsxs)(`div`,{className:`pel-stats`,children:[(0,C.jsxs)(`div`,{className:`pel-stat`,children:[(0,C.jsx)(`span`,{className:`pel-stat-value`,children:e.p50Latency}),(0,C.jsx)(`span`,{className:`pel-stat-label`,children:`p50 latency`})]}),(0,C.jsxs)(`div`,{className:`pel-stat`,children:[(0,C.jsx)(`span`,{className:`pel-stat-value`,children:e.costPer1k}),(0,C.jsx)(`span`,{className:`pel-stat-label`,children:`cost / 1k runs`})]})]})}),(0,C.jsx)(`div`,{className:`pel-col-section`,children:l?(0,C.jsxs)(`div`,{className:`pel-gate-row`,children:[(0,C.jsx)(`span`,{className:`pel-gate-pass`,"aria-hidden":!0,children:(0,C.jsx)(i,{icon:o,size:`xsm`,color:`inherit`})}),(0,C.jsxs)(`span`,{className:`pel-gate-text`,children:[`Serving `,n,`% — baseline for every delta and tick.`]})]}):(0,C.jsxs)(C.Fragment,{children:[(0,C.jsx)(`span`,{className:`pel-section-label`,children:`Promotion gates`}),h.map(e=>(0,C.jsxs)(`div`,{className:`pel-gate-row`,children:[(0,C.jsx)(`span`,{className:e.pass?`pel-gate-pass`:`pel-gate-fail`,"aria-hidden":!0,children:(0,C.jsx)(i,{icon:e.pass?f:m,size:`xsm`,color:`inherit`})}),(0,C.jsxs)(`span`,{className:`pel-gate-text`,title:`${e.label} — ${e.detail}`,children:[e.label,` · `,(0,C.jsx)(`span`,{className:`pel-num`,children:e.detail})]})]},e.id)),(0,C.jsx)(b,{label:g?`Promote to champion`:`Gates not met`,variant:g?`primary`:`secondary`,size:`md`,isDisabled:!g,icon:(0,C.jsx)(i,{icon:o,size:`sm`}),onClick:()=>c(e.id)}),!g&&(0,C.jsxs)(`span`,{className:`pel-promote-note`,children:[h.filter(e=>!e.pass).length,` of `,h.length,` `,`gates failing — see ✗ rows above.`]})]})})]})}function ue(){let[e,t]=(0,S.useState)(`ctl`),[n,a]=(0,S.useState)([]),[d,f]=(0,S.useState)(0),[m,x]=(0,S.useState)(`fc-order`),[T,E]=(0,S.useState)(``),D=W(e),O=ie(e),k=R.find(e=>e.id===m)??R[0],A=(0,S.useMemo)(()=>L.filter(t=>t.id!==e&&X(t.id,e).every(e=>e.pass)).length,[e]),j=L.reduce((e,t)=>e+t.graded,0),M=n=>{if(!X(n,e).every(e=>e.pass))return;let r=W(n),i=W(e),o=ne(d);t(n),f(e=>e+1),a(e=>[{id:`evt-${o}-${n}`,clockLabel:o,variantId:n,previousChampionId:i.id,summary:`Promoted ${r.shortName} (${G(r).toFixed(1)}) over ${i.shortName} (${G(i).toFixed(1)}) — ramp reflowed to ${z}/${B}/${B}/${B}`},...e]),E(`${r.name} promoted to champion. Traffic reflowed to ${z} percent; rubric deltas, baseline ticks, cluster tags, and promotion gates re-derived against the new baseline.`)},N=()=>{let e=n[0];if(e===void 0)return;let r=W(e.previousChampionId);t(e.previousChampionId),a(e=>e.slice(1)),E(`Promotion undone — ${r.name} restored as champion and every derived surface reverted.`)},P=e=>{x(e);let t=R.find(t=>t.id===e);t!==void 0&&E(`Inspecting failure cluster: ${t.label}`)},F=(0,C.jsxs)(`div`,{className:`pel-alloc`,children:[(0,C.jsxs)(`div`,{className:`pel-alloc-caption`,children:[(0,C.jsxs)(r,{type:`label`,size:`sm`,color:`secondary`,children:[`Cohort allocation — ramp policy `,z,`% champion ·`,` `,B,`% per challenger`]}),(0,C.jsxs)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:[(0,C.jsx)(`span`,{className:`pel-num`,children:J(j)}),` graded of the Jul 8–15 traffic slice`]})]}),(0,C.jsx)(`div`,{className:`pel-alloc-bar`,role:`img`,"aria-label":`Traffic allocation: ${L.map(e=>`${e.shortName} ${O[e.id]} percent`).join(`, `)}`,children:L.map(t=>{let n=t.id===e;return(0,C.jsx)(`span`,{className:n?`pel-alloc-seg pel-alloc-seg--champion`:`pel-alloc-seg`,style:{width:`${O[t.id]}%`,background:n?void 0:Z(t.id,e)},children:n&&(0,C.jsxs)(`span`,{className:`pel-num`,children:[O[t.id],`%`]})},t.id)})}),(0,C.jsx)(`div`,{className:`pel-alloc-legend`,children:L.map(t=>(0,C.jsxs)(`span`,{className:`pel-alloc-legend-item`,children:[(0,C.jsx)(`span`,{className:`pel-alloc-swatch`,style:{background:Z(t.id,e)},"aria-hidden":!0}),(0,C.jsxs)(`span`,{className:`pel-num`,children:[t.shortName,` · `,O[t.id],`%`]}),t.id===e&&(0,C.jsx)(i,{icon:o,size:`xsm`,color:`inherit`})]},t.id))})]}),I=(0,C.jsxs)(`div`,{className:`pel-bench`,children:[(0,C.jsxs)(`div`,{className:`pel-bench-inspect`,children:[(0,C.jsxs)(`div`,{className:`pel-bench-head`,children:[(0,C.jsx)(`span`,{className:`pel-cluster-dot`,style:{background:$[k.severity]},"aria-hidden":!0}),(0,C.jsx)(v,{level:5,accessibilityLevel:2,maxLines:1,children:k.label}),(0,C.jsx)(y,{label:Q[k.severity],variant:k.severity===`critical`?`error`:k.severity===`major`?`warning`:`neutral`})]}),(0,C.jsx)(`div`,{className:`pel-bench-rates`,children:L.map(t=>(0,C.jsxs)(`span`,{className:t.id===e?`pel-bench-rate pel-bench-rate--champion`:`pel-bench-rate`,children:[(0,C.jsx)(`strong`,{children:t.shortName}),q(K(k,t.id)),`/1k`,(0,C.jsxs)(`span`,{children:[`(`,k.counts[t.id],`)`]})]},t.id))}),(0,C.jsxs)(`div`,{className:`pel-excerpt`,tabIndex:0,role:`region`,"aria-label":`Graded transcript excerpt for ${k.label}`,children:[k.excerpt.before.map((e,t)=>(0,C.jsx)(`div`,{className:`pel-excerpt-line`,children:e},`b-${t}`)),(0,C.jsx)(`div`,{className:`pel-excerpt-fail`,children:k.excerpt.fail}),k.excerpt.after.map((e,t)=>(0,C.jsx)(`div`,{className:`pel-excerpt-line`,children:e},`a-${t}`))]}),(0,C.jsxs)(r,{type:`supporting`,size:`sm`,color:`secondary`,maxLines:2,children:[(0,C.jsx)(i,{icon:p,size:`xsm`,color:`inherit`}),` Judge note: `,k.judgeNote]})]}),(0,C.jsxs)(`div`,{className:`pel-bench-log`,children:[(0,C.jsx)(`div`,{className:`pel-log-head`,children:(0,C.jsx)(r,{type:`label`,size:`sm`,color:`secondary`,children:`Promotion log`})}),(0,C.jsxs)(`div`,{className:`pel-log-scroll`,children:[n.map((e,t)=>(0,C.jsxs)(`div`,{className:`pel-log-row`,children:[(0,C.jsx)(`span`,{className:`pel-log-clock`,children:e.clockLabel}),(0,C.jsxs)(`div`,{className:`pel-log-body`,children:[(0,C.jsx)(r,{type:`body`,size:`sm`,children:e.summary}),t===0&&(0,C.jsx)(b,{label:`Undo`,variant:`ghost`,size:`sm`,icon:(0,C.jsx)(i,{icon:u,size:`sm`}),onClick:N})]})]},e.id)),(0,C.jsxs)(`div`,{className:`pel-log-row`,children:[(0,C.jsx)(`span`,{className:`pel-log-clock`,children:`Jul 8`}),(0,C.jsx)(`div`,{className:`pel-log-body`,children:(0,C.jsxs)(r,{type:`body`,size:`sm`,color:`secondary`,children:[`EXP-114 started — v3.2 set as champion, ramp`,` `,(0,C.jsx)(`span`,{className:`pel-num`,children:`64/12/12/12`}),`, judge atlas-8 rubric v4.`]})})]})]})]})]});return(0,C.jsxs)(`div`,{className:w,style:{height:`100dvh`,width:`100%`},children:[(0,C.jsx)(`style`,{children:ae}),(0,C.jsx)(ee,{height:`fill`,header:(0,C.jsx)(te,{hasDivider:!0,children:(0,C.jsx)(`div`,{className:`pel-header-row`,children:(0,C.jsxs)(h,{gap:3,vAlign:`center`,wrap:`wrap`,children:[(0,C.jsx)(g,{size:`fill`,style:{minWidth:0},children:(0,C.jsxs)(h,{gap:2,vAlign:`center`,children:[(0,C.jsx)(oe,{}),(0,C.jsx)(v,{level:1,maxLines:1,children:`Variant — Prompt Experiment Lab`}),(0,C.jsx)(y,{label:`EXP-114 · Refund agent system prompt`,variant:`neutral`})]})}),(0,C.jsxs)(`div`,{className:`pel-header-chips`,children:[(0,C.jsx)(y,{label:`Champion: ${D.shortName} · ${G(D).toFixed(1)}`,variant:`success`}),(0,C.jsx)(y,{label:`${A} promotable`,variant:A>0?`info`:`neutral`}),(0,C.jsxs)(h,{gap:1,vAlign:`center`,children:[(0,C.jsx)(i,{icon:c,size:`sm`,color:`secondary`}),(0,C.jsxs)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:[(0,C.jsx)(`span`,{className:`pel-num`,children:J(j)}),` `,`graded`]})]}),(0,C.jsxs)(h,{gap:1,vAlign:`center`,children:[(0,C.jsx)(i,{icon:l,size:`sm`,color:`secondary`}),(0,C.jsx)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:`Judge: atlas-8 · rubric v4`})]}),(0,C.jsxs)(h,{gap:1,vAlign:`center`,children:[(0,C.jsx)(i,{icon:s,size:`sm`,color:`secondary`}),(0,C.jsx)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:`Wed Jul 15 2026`})]})]})]})})}),content:(0,C.jsx)(_,{padding:0,children:(0,C.jsxs)(`div`,{className:`pel-content`,children:[(0,C.jsx)(`div`,{"aria-live":`polite`,style:{position:`absolute`,width:1,height:1,margin:-1,padding:0,overflow:`hidden`,clipPath:`inset(50%)`,whiteSpace:`nowrap`},children:T}),F,(0,C.jsx)(`div`,{className:`pel-grid`,children:L.map(t=>(0,C.jsx)(le,{variant:t,championId:e,allocationPct:O[t.id],selectedClusterId:m,onSelectCluster:P,onPromote:M},t.id))}),I]})})})]})}export{ue as default};