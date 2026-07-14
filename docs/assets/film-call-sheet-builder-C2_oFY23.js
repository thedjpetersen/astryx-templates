import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-BnkU7x5-.js";import{t as i}from"./Icon-BmUexiPD.js";import{t as a}from"./chevron-up-54xuz1fC.js";import{t as o}from"./lock-CAxym6LF.js";import{t as s}from"./send-BlpVdoyO.js";import{t as c}from"./truck-B8dXjP5_.js";import{t as l}from"./utensils-B2nqoDB5.js";import{C as u,_ as d,o as f,w as p}from"./index-Z40q0Y4M.js";import{t as ee}from"./Tooltip-XDRm9Z-w.js";import{n as te,t as ne}from"./LayoutContent-CCL91W7X.js";import{t as re}from"./LayoutHeader-Cy2mWoMf.js";import{t as m}from"./Heading-Tiw04pWH.js";import{t as ie}from"./Button-C1oieFea.js";import{t as ae}from"./Avatar-DyaNw-yT.js";var h=e(t(),1),g=n(),_=`tpl-film-call-sheet-builder`,v=`light-dark(#856A00, #F5D90A)`,y=`light-dark(rgba(133, 106, 0, 0.10), rgba(245, 217, 10, 0.13))`,oe=`light-dark(#1D4ED8, #93C5FD)`,se=`light-dark(rgba(29, 78, 216, 0.09), rgba(147, 197, 253, 0.14))`,b=`light-dark(#15803D, #4ADE80)`,x=`light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))`,ce=`light-dark(#7E22CE, #D8B4FE)`,S=`light-dark(rgba(126, 34, 206, 0.08), rgba(216, 180, 254, 0.14))`,C=`light-dark(#B91C1C, #F87171)`,w=`light-dark(rgba(185, 28, 28, 0.10), rgba(248, 113, 113, 0.14))`,T=`light-dark(#B45309, #FBBF24)`,E=`light-dark(rgba(180, 83, 9, 0.10), rgba(251, 191, 36, 0.14))`,D=`var(--font-family-code, ui-monospace, monospace)`,le=`
.${_} {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.${_} .fcs-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.${_} .fcs-mono {
  font-family: ${D};
  font-variant-numeric: tabular-nums;
}
.${_} button:focus-visible {
  outline: 2px solid ${v};
  outline-offset: 1px;
}
.${_} .fcs-fade {
  transition: background-color 160ms ease, border-color 160ms ease,
    color 160ms ease, opacity 160ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .${_} .fcs-fade { transition: none; }
}

/* ---- Header bar 48px ---- */
.${_} .fcs-headRow {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  width: 100%;
  min-height: 48px;
  min-width: 0;
}
.${_} .fcs-brandCol { display: flex; flex-direction: column; min-width: 0; }
.${_} .fcs-brandLine { display: flex; align-items: center; gap: 7px; min-width: 0; }
.${_} .fcs-brandName { font-size: 14px; font-weight: 650; letter-spacing: 0.01em; }
.${_} .fcs-brandProd {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${_} .fcs-brandSub {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
}
.${_} .fcs-spring { flex: 1; }
.${_} .fcs-headChip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding-inline: 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  border: var(--border-width) solid transparent;
}
.${_} .fcs-headChip.is-blocked { color: ${C}; background: ${w}; }
.${_} .fcs-headChip.is-ready { color: ${b}; background: ${x}; }
.${_} .fcs-headChip.is-published { color: ${v}; background: ${y}; }

/* ---- Frame: board + 376px rail. Hand-rolled grid so the <=980px restack
   is a real media query, not a squeezed flex row. ---- */
.${_} .fcs-frame {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 376px;
  height: 100%;
  min-height: 0;
}
.${_} .fcs-main {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
}
.${_} .fcs-boardScroll {
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-3);
}
.${_} .fcs-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-3);
  align-items: start;
}
.${_} .fcs-rail {
  min-height: 0;
  border-left: var(--border-width) solid var(--color-border);
  background: var(--color-background-card);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
}

/* ---- Day column ---- */
.${_} .fcs-dayCol {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  background: var(--color-background-card);
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}
.${_} .fcs-dayHead {
  min-height: 64px;
  padding: 8px 10px;
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.${_} .fcs-dayTitleRow { display: flex; align-items: center; gap: 6px; min-width: 0; }
.${_} .fcs-dayName { font-size: 12px; font-weight: 700; white-space: nowrap; }
.${_} .fcs-dayDate {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
}
.${_} .fcs-pubBadge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 18px;
  padding-inline: 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 650;
  color: ${v};
  background: ${y};
  white-space: nowrap;
  flex-shrink: 0;
}
.${_} .fcs-dayStatRow {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-wrap: wrap;
}
.${_} .fcs-dayStat {
  font-size: 10px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.${_} .fcs-dayStat.is-bad { color: ${C}; font-weight: 650; }
.${_} .fcs-dayStat.is-tight { color: ${T}; font-weight: 650; }
.${_} .fcs-dayBody {
  display: flex;
  flex-direction: column;
  padding: 8px;
  gap: 6px;
  min-width: 0;
}

/* ---- Scene strip (56px, real button, 4px color edge) ---- */
.${_} .fcs-strip {
  font: inherit;
  color: inherit;
  text-align: left;
  margin: 0;
  cursor: pointer;
  min-height: 56px;
  padding: 6px 8px 6px 12px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  min-width: 0;
}
.${_} .fcs-stripEdge {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 6px 0 0 6px;
}
.${_} .fcs-strip.is-selected {
  border-color: ${v};
  box-shadow: inset 0 0 0 1px ${v};
  background: ${y};
}
@media (hover: hover) {
  .${_} .fcs-strip:hover { background: var(--color-background-muted); }
  .${_} .fcs-strip.is-selected:hover { background: ${y}; }
}
.${_} .fcs-stripTop { display: flex; align-items: center; gap: 6px; min-width: 0; }
.${_} .fcs-sceneNum {
  font-family: ${D};
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.${_} .fcs-ieTag {
  display: inline-flex;
  align-items: center;
  height: 16px;
  padding-inline: 5px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
  flex-shrink: 0;
}
.${_} .fcs-stripSet {
  font-size: 11px;
  line-height: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
}
.${_} .fcs-stripMeta {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  font-size: 10px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.${_} .fcs-stripCast {
  font-family: ${D};
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.${_} .fcs-stripPages { white-space: nowrap; flex-shrink: 0; }
.${_} .fcs-stripEst { white-space: nowrap; flex-shrink: 0; }
.${_} .fcs-penaltyFlag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: ${C};
  font-size: 10px;
  font-weight: 650;
  white-space: nowrap;
  flex-shrink: 0;
}
.${_} .fcs-lockGlyph {
  color: var(--color-text-secondary);
  display: inline-flex;
  flex-shrink: 0;
}

/* ---- Derived interstitial rows (24px, dashed — not draggable) ---- */
.${_} .fcs-derivedRow {
  min-height: 24px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border: 1px dashed var(--color-border);
  border-radius: 5px;
  font-size: 10px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  min-width: 0;
}
.${_} .fcs-derivedRow.is-lunch { color: ${b}; border-color: ${b}; background: ${x}; }
.${_} .fcs-derivedRow.is-lateLunch { color: ${C}; border-color: ${C}; background: ${w}; }
.${_} .fcs-derivedLabel {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

/* ---- Legend strip 32px (bottom-left corner owner) ---- */
.${_} .fcs-legend {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  min-height: 32px;
  padding: 0 var(--spacing-3);
  border-top: var(--border-width) solid var(--color-border);
  overflow-x: auto;
}
.${_} .fcs-legendKey {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${_} .fcs-legendSwatch { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }

/* ---- Rail: scene detail ---- */
.${_} .fcs-detail {
  padding: var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.${_} .fcs-overline {
  font-size: 11px;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
}
.${_} .fcs-detailTitleRow { display: flex; align-items: center; gap: 7px; min-width: 0; }
.${_} .fcs-detailFacts {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2px 10px;
  font-size: 11px;
}
.${_} .fcs-factLabel {
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 10px;
  white-space: nowrap;
  align-self: baseline;
}
.${_} .fcs-factValue { font-variant-numeric: tabular-nums; min-width: 0; }
.${_} .fcs-moveRow { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.${_} .fcs-dayBtn {
  font: inherit;
  margin: 0;
  cursor: pointer;
  height: 28px;
  padding-inline: 10px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: transparent;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.${_} .fcs-dayBtn:disabled { opacity: 0.4; cursor: not-allowed; }
.${_} .fcs-dayBtn.is-current {
  color: ${v};
  border-color: ${v};
  background: ${y};
}
@media (hover: hover) {
  .${_} .fcs-dayBtn:not(:disabled):not(.is-current):hover {
    background: var(--color-background-muted);
    color: var(--color-text-primary);
  }
}
.${_} .fcs-nudgeBtn {
  font: inherit;
  margin: 0;
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.${_} .fcs-nudgeBtn:disabled { opacity: 0.35; cursor: not-allowed; }
@media (hover: hover) {
  .${_} .fcs-nudgeBtn:not(:disabled):hover {
    color: var(--color-text-primary);
    background: var(--color-background-muted);
  }
}

/* ---- Call table (36px rows) ---- */
.${_} .fcs-callTable {
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}
.${_} .fcs-callHead {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${_} .fcs-dayTab {
  font: inherit;
  margin: 0;
  cursor: pointer;
  height: 24px;
  padding-inline: 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: transparent;
  font-size: 10px;
  font-weight: 650;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${_} .fcs-dayTab[aria-pressed='true'] {
  color: ${v};
  border-color: ${v};
  background: ${y};
}
.${_} .fcs-callScroll { min-height: 0; overflow-y: auto; padding-bottom: var(--spacing-2); }
.${_} .fcs-callRow {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 11px;
  min-width: 0;
}
.${_} .fcs-callRow.is-section {
  font-size: 10px;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  min-height: 28px;
  background: var(--color-background-muted);
  border-bottom: none;
}
.${_} .fcs-callLabel {
  min-width: 0;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${_} .fcs-callSub {
  font-size: 10px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${_} .fcs-callTime {
  font-family: ${D};
  font-variant-numeric: tabular-nums;
  font-size: 11px;
  white-space: nowrap;
  flex-shrink: 0;
}
.${_} .fcs-callTime.is-bad { color: ${C}; font-weight: 700; }
.${_} .fcs-castNum {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-family: ${D};
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

/* ---- Publish gate panel (rail foot, bottom-right corner owner) ---- */
.${_} .fcs-gate {
  border-top: var(--border-width) solid var(--color-border);
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.${_} .fcs-gateReqRow { display: flex; flex-wrap: wrap; gap: 6px; }
.${_} .fcs-req {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding-inline: 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
}
.${_} .fcs-req.is-pass { color: ${b}; background: ${x}; border-color: transparent; }
.${_} .fcs-req.is-fail { color: ${C}; background: ${w}; border-color: transparent; }
.${_} .fcs-req.is-tight { color: ${T}; background: ${E}; border-color: transparent; }
.${_} .fcs-gateFoot { display: flex; align-items: center; gap: var(--spacing-2); justify-content: flex-end; }

/* ---- <=980px: rail restacks under the board ---- */
@media (max-width: 980px) {
  .${_} .fcs-frame { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto auto; }
  .${_} .fcs-rail { border-left: none; border-top: var(--border-width) solid var(--color-border); }
  .${_} .fcs-callScroll { max-height: 396px; }
}

/* ---- <=640px (390px embed): one day column per row ---- */
@media (max-width: 640px) {
  .${_} .fcs-board { grid-template-columns: minmax(0, 1fr); }
  .${_} .fcs-brandSub { display: none; }
  .${_} .fcs-brandProd { display: none; }
}
`,O=`13 Jul 2026`,ue=`NORTHLIGHT`,de=`Gravel Road Pictures`,k=`Priya Anand`,A=30,j=45,M=60,N=300,P=360,F=660,I=720;function L(e){let t=(e%1440+1440)%1440,n=Math.floor(t/60),r=t%60;return`${n}:${r<10?`0`:``}${r}`}function R(e){let t=Math.floor(e/60),n=e%60;return t===0?`${n}m`:n===0?`${t}h`:`${t}h${n<10?`0`:``}${n}`}function z(e){let t=Math.floor(e/8),n=e%8;return t===0?`${n}/8`:n===0?`${t} 0/8`:`${t} ${n}/8`}var B=[{num:1,name:`Elias Ward`,character:`Ray Harrow`,hmuMinutes:50},{num:2,name:`Nadia Sohn`,character:`June Harrow`,hmuMinutes:75},{num:5,name:`Marcus Bell`,character:`Deputy Cole`,hmuMinutes:40},{num:6,name:`Ana Reyes`,character:`Tess`,hmuMinutes:45},{num:7,name:`Peter Okafor`,character:`Vernon`,hmuMinutes:30}],fe=new Map(B.map(e=>[e.num,e])),V=30,H=new Map([{id:`SC-42`,num:`42`,ie:`INT`,dn:`DAY`,set:`Harrow House — Kitchen`,location:`Stage 3`,castNums:[1,2],pagesLabel:`1 2/8`,pagesEighths:10,estMinutes:90,synopsis:`Ray burns the letter; June catches him at the sink.`},{id:`SC-43`,num:`43`,ie:`INT`,dn:`DAY`,set:`Harrow House — Kitchen`,location:`Stage 3`,castNums:[1,2,6],pagesLabel:`4/8`,pagesEighths:4,estMinutes:60,synopsis:`Tess arrives with the county paperwork; breakfast goes cold.`},{id:`SC-24`,num:`24`,ie:`EXT`,dn:`DAY`,set:`Farmhouse — Yard`,location:`Millbrook Farm`,castNums:[1,5],pagesLabel:`1 4/8`,pagesEighths:12,estMinutes:180,synopsis:`Deputy Cole walks the fence line with Ray; the dog finds the culvert.`},{id:`SC-47`,num:`47`,ie:`INT`,dn:`NIGHT`,set:`Harrow House — Hallway`,location:`Stage 3`,castNums:[2],pagesLabel:`6/8`,pagesEighths:6,estMinutes:90,synopsis:`June listens at the study door; the floorboard gives her away.`},{id:`SC-51`,num:`51`,ie:`INT`,dn:`NIGHT`,set:`Harrow House — Study`,location:`Stage 3`,castNums:[1,2,7],pagesLabel:`1 1/8`,pagesEighths:9,estMinutes:105,synopsis:`Vernon names his price. June sees the ledger for the first time.`},{id:`SC-52`,num:`52`,ie:`INT`,dn:`NIGHT`,set:`Harrow House — Study`,location:`Stage 3`,castNums:[1,7],pagesLabel:`5/8`,pagesEighths:5,estMinutes:60,synopsis:`Ray signs. Vernon leaves the pen behind.`},{id:`SC-25`,num:`25`,ie:`EXT`,dn:`DAY`,set:`Farmhouse — Yard, apple orchard boundary fence (continuation)`,location:`Millbrook Farm`,castNums:[1,5],pagesLabel:`2 1/8`,pagesEighths:17,estMinutes:165,synopsis:`Continuation of the fence-line walk; Cole photographs the cut wire.`},{id:`SC-26`,num:`26`,ie:`EXT`,dn:`DAY`,set:`Farmhouse — Barn`,location:`Millbrook Farm`,castNums:[1,5,6],pagesLabel:`1 3/8`,pagesEighths:11,estMinutes:150,synopsis:`Tess shows them the empty stalls; Cole finds the second padlock.`},{id:`SC-28`,num:`28`,ie:`INT`,dn:`DAY`,set:`Barn — Tack Room`,location:`Millbrook Farm`,castNums:[5,6],pagesLabel:`1 0/8`,pagesEighths:8,estMinutes:90,synopsis:`Cole and Tess compare dates; the feed receipts do not add up.`},{id:`SC-31`,num:`31`,ie:`EXT`,dn:`DAWN`,set:`Ridge Road — Overlook`,location:`Ridge Rd`,castNums:[1,2],pagesLabel:`1 2/8`,pagesEighths:10,estMinutes:105,synopsis:`Magic hour: Ray and June watch the valley lights come up.`},{id:`SC-33`,num:`33`,ie:`EXT`,dn:`DAY`,set:`Ridge Road — Moving Car`,location:`Ridge Rd`,castNums:[1,2],pagesLabel:`2 0/8`,pagesEighths:16,estMinutes:150,synopsis:`The argument in the car; June makes Ray pull over.`},{id:`SC-34`,num:`34`,ie:`INT`,dn:`DAY`,set:`Car (process trailer)`,location:`Ridge Rd`,castNums:[1,2],pagesLabel:`1 1/8`,pagesEighths:9,estMinutes:90,synopsis:`Coverage of the argument; June reads the ledger page aloud.`}].map(e=>[e.id,e])),U=[{id:`D14`,label:`Day 14`,date:`Wed 15 Jul`,unitNote:`Stage 3 · Harrow House sets`,crewCallMin:420,hardOutMin:1140},{id:`D15`,label:`Day 15`,date:`Thu 16 Jul`,unitNote:`Millbrook Farm (location)`,crewCallMin:420,hardOutMin:1140},{id:`D16`,label:`Day 16`,date:`Fri 17 Jul`,unitNote:`Ridge Rd (dawn unit)`,crewCallMin:390,hardOutMin:1110}],W=new Map(U.map(e=>[e.id,e])),G={D14:[`SC-42`,`SC-43`,`SC-24`,`SC-47`,`SC-51`,`SC-52`],D15:[`SC-25`,`SC-26`,`SC-28`],D16:[`SC-31`,`SC-33`,`SC-34`]};function K(e,t){let n=[],r=new Map,i=[],a=0,o=null,s=null;for(let e of t){s!=null&&e.location!==s&&(n.push({type:`move`,startOffset:a,fromLocation:s,toLocation:e.location}),a+=j),o==null&&a>=N&&(o=a,n.push({type:`lunch`,startOffset:a,isLate:a>P}),a+=M);let t=a;a+=e.estMinutes;let c=o==null&&a>P;c&&i.push(e.id),n.push({type:`scene`,scene:e,startOffset:t,endOffset:a,mealPenalty:c});for(let n of e.castNums)r.has(n)||r.set(n,t);s=e.location}let c=e.crewCallMin+A,l=c+a;return{day:e,entries:n,totalEighths:t.reduce((e,t)=>e+t.pagesEighths,0),totalSceneMinutes:t.reduce((e,t)=>e+t.estMinutes,0),lunchOffset:o,mealPenaltySceneIds:i,firstShotMin:c,wrapMin:l,hardOutOk:l<=e.hardOutMin,castOnSetOffset:r}}function pe(e,t){return t==null?null:t.crewCallMin+1440-e.wrapMin}function me(){return(0,g.jsxs)(`svg`,{width:22,height:22,viewBox:`0 0 22 22`,"aria-hidden":!0,style:{flexShrink:0},children:[(0,g.jsx)(`path`,{d:`M3 9.5 18.5 6l.8 3.4L3.8 12.9Z`,fill:`none`,stroke:v,strokeWidth:1.7,strokeLinejoin:`round`}),(0,g.jsx)(`path`,{d:`M6 8.8 8 5.6M10.5 7.8l2-3.2M15 6.8l2-3.2`,stroke:v,strokeWidth:1.7,strokeLinecap:`round`}),(0,g.jsx)(`rect`,{x:3.5,y:12.5,width:15,height:6.5,rx:1.2,fill:`none`,stroke:v,strokeWidth:1.7}),(0,g.jsx)(`circle`,{cx:7,cy:15.7,r:1.1,fill:v})]})}function q(e){let t=`${e.ie===`INT`?`I`:`E`}·${e.dn===`DAY`?`D`:e.dn===`NIGHT`?`N`:`DAWN`}`;return e.dn===`DAWN`?{tag:t,color:ce,tint:S}:e.dn===`NIGHT`?e.ie===`INT`?{tag:t,color:oe,tint:se}:{tag:t,color:b,tint:x}:e.ie===`EXT`?{tag:t,color:v,tint:y}:{tag:t,color:`var(--color-text-secondary)`,tint:`var(--color-background-muted)`}}function J({scene:e,isSelected:t,isLocked:n,mealPenalty:r,onSelect:i}){let a=q(e),s=[`Scene ${e.num}`,`${e.ie} ${e.dn}`,e.set,`cast ${e.castNums.join(`, `)}`,`${e.pagesLabel} pages`,`estimated ${R(e.estMinutes)}`];return r&&s.push(`meal penalty risk`),n&&s.push(`day published — locked`),(0,g.jsxs)(`button`,{type:`button`,className:`fcs-strip fcs-fade${t?` is-selected`:``}`,"aria-pressed":t,"aria-label":s.join(`, `),onClick:i,children:[(0,g.jsx)(`span`,{className:`fcs-stripEdge`,style:{background:a.color},"aria-hidden":!0}),(0,g.jsxs)(`span`,{className:`fcs-stripTop`,children:[(0,g.jsx)(`span`,{className:`fcs-sceneNum`,children:e.num}),(0,g.jsx)(`span`,{className:`fcs-ieTag`,style:{color:a.color,background:a.tint},children:a.tag}),(0,g.jsx)(`span`,{className:`fcs-stripSet`,children:e.set}),n?(0,g.jsx)(`span`,{className:`fcs-lockGlyph`,"aria-hidden":!0,children:(0,g.jsx)(o,{size:11})}):null]}),(0,g.jsxs)(`span`,{className:`fcs-stripMeta`,children:[(0,g.jsx)(`span`,{className:`fcs-stripCast`,children:e.castNums.join(` `)}),(0,g.jsxs)(`span`,{className:`fcs-stripPages`,children:[e.pagesLabel,` pgs`]}),(0,g.jsx)(`span`,{className:`fcs-stripEst`,children:R(e.estMinutes)}),r?(0,g.jsxs)(`span`,{className:`fcs-penaltyFlag`,children:[(0,g.jsx)(l,{size:10,"aria-hidden":!0}),`MEAL`]}):null]})]})}function he({schedule:e,publishedLine:t,turnaroundIn:n,selectedSceneId:r,onSelectScene:i}){let{day:a}=e,o=L(e.wrapMin),s=t!=null,u=n!=null&&n<F,f=n!=null&&n>=F&&n<I;return(0,g.jsxs)(`section`,{className:`fcs-dayCol`,"aria-label":`${a.label}, ${a.date}`,children:[(0,g.jsxs)(`header`,{className:`fcs-dayHead`,children:[(0,g.jsxs)(`div`,{className:`fcs-dayTitleRow`,children:[(0,g.jsx)(`span`,{className:`fcs-dayName`,children:a.label}),(0,g.jsxs)(`span`,{className:`fcs-dayDate`,children:[a.date,` · `,a.unitNote]}),s?(0,g.jsxs)(`span`,{className:`fcs-pubBadge`,children:[(0,g.jsx)(p,{size:10,"aria-hidden":!0}),`Published`]}):null]}),(0,g.jsxs)(`div`,{className:`fcs-dayStatRow`,children:[(0,g.jsxs)(`span`,{className:`fcs-dayStat`,children:[(0,g.jsx)(d,{size:10,"aria-hidden":!0}),`call `,L(a.crewCallMin)]}),(0,g.jsxs)(`span`,{className:`fcs-dayStat`,children:[z(e.totalEighths),` pgs`]}),(0,g.jsxs)(`span`,{className:`fcs-dayStat${e.hardOutOk?``:` is-bad`}`,children:[`wrap `,o,e.hardOutOk?``:` › out ${L(a.hardOutMin)}`]}),e.mealPenaltySceneIds.length>0?(0,g.jsxs)(`span`,{className:`fcs-dayStat is-bad`,children:[(0,g.jsx)(l,{size:10,"aria-hidden":!0}),`penalty ×`,e.mealPenaltySceneIds.length]}):null,u||f?(0,g.jsxs)(`span`,{className:`fcs-dayStat ${u?`is-bad`:`is-tight`}`,children:[`TA `,R(n??0)]}):null]})]}),(0,g.jsx)(`div`,{className:`fcs-dayBody`,children:e.entries.length===0?(0,g.jsx)(`div`,{className:`fcs-derivedRow`,children:(0,g.jsx)(`span`,{className:`fcs-derivedLabel`,children:`No scenes boarded — send a strip here`})}):e.entries.map(t=>{if(t.type===`move`)return(0,g.jsxs)(`div`,{className:`fcs-derivedRow`,"aria-label":`Derived company move, 45 minutes, ${t.fromLocation} to ${t.toLocation}`,children:[(0,g.jsx)(c,{size:11,"aria-hidden":!0}),(0,g.jsxs)(`span`,{className:`fcs-derivedLabel`,children:[`Move `,j,`m · `,t.fromLocation,` → `,t.toLocation]})]},`move-${t.startOffset}`);if(t.type===`lunch`){let n=L(e.firstShotMin+t.startOffset);return(0,g.jsxs)(`div`,{className:`fcs-derivedRow ${t.isLate?`is-lateLunch`:`is-lunch`}`,"aria-label":`Derived lunch, 60 minutes, ${n}${t.isLate?`, past the 6 hour line`:``}`,children:[(0,g.jsx)(l,{size:11,"aria-hidden":!0}),(0,g.jsxs)(`span`,{className:`fcs-derivedLabel`,children:[`Lunch `,M,`m · `,n,t.isLate?` · past 6h`:``]})]},`lunch-${t.startOffset}`)}return(0,g.jsx)(J,{scene:t.scene,isSelected:r===t.scene.id,isLocked:s,mealPenalty:t.mealPenalty,onSelect:()=>i(t.scene.id)},t.scene.id)})})]})}function Y({min:e,isBad:t}){return(0,g.jsx)(`span`,{className:`fcs-callTime${t===!0?` is-bad`:``}`,children:L(e)})}function ge({schedule:e}){let{day:t}=e,n=B.filter(t=>e.castOnSetOffset.has(t.num));return(0,g.jsxs)(`div`,{className:`fcs-callScroll`,children:[(0,g.jsx)(`div`,{className:`fcs-callRow is-section`,children:(0,g.jsxs)(`span`,{className:`fcs-callLabel`,children:[`Unit — `,t.label]})}),(0,g.jsxs)(`div`,{className:`fcs-callRow`,children:[(0,g.jsx)(`span`,{className:`fcs-callLabel`,children:`Crew call`}),(0,g.jsx)(Y,{min:t.crewCallMin})]}),(0,g.jsxs)(`div`,{className:`fcs-callRow`,children:[(0,g.jsx)(`span`,{className:`fcs-callLabel`,children:`Shooting call (first shot)`}),(0,g.jsx)(Y,{min:e.firstShotMin})]}),(0,g.jsxs)(`div`,{className:`fcs-callRow`,children:[(0,g.jsxs)(`span`,{className:`fcs-callLabel`,children:[`Lunch (auto-placed)`,e.lunchOffset==null?(0,g.jsx)(`span`,{className:`fcs-callSub`,children:` — short day, none`}):null]}),e.lunchOffset==null?(0,g.jsx)(`span`,{className:`fcs-callTime`,children:`—`}):(0,g.jsx)(Y,{min:e.firstShotMin+e.lunchOffset,isBad:e.lunchOffset>P})]}),(0,g.jsxs)(`div`,{className:`fcs-callRow`,children:[(0,g.jsx)(`span`,{className:`fcs-callLabel`,children:`Estimated wrap`}),(0,g.jsx)(Y,{min:e.wrapMin,isBad:!e.hardOutOk})]}),(0,g.jsxs)(`div`,{className:`fcs-callRow`,children:[(0,g.jsx)(`span`,{className:`fcs-callLabel`,children:`Hard out`}),(0,g.jsx)(Y,{min:t.hardOutMin})]}),(0,g.jsx)(`div`,{className:`fcs-callRow is-section`,children:(0,g.jsx)(`span`,{className:`fcs-callLabel`,children:`Cast — pickup · HMU · on set`})}),n.length===0?(0,g.jsx)(`div`,{className:`fcs-callRow`,children:(0,g.jsx)(`span`,{className:`fcs-callLabel`,children:(0,g.jsxs)(`span`,{className:`fcs-callSub`,children:[`No cast boarded on `,t.label,`.`]})})}):n.map(t=>{let n=e.firstShotMin+(e.castOnSetOffset.get(t.num)??0),r=n-t.hmuMinutes,i=r-V;return(0,g.jsxs)(`div`,{className:`fcs-callRow`,children:[(0,g.jsx)(`span`,{className:`fcs-castNum`,"aria-hidden":!0,children:t.num}),(0,g.jsxs)(`span`,{className:`fcs-callLabel`,children:[t.name,(0,g.jsx)(`br`,{}),(0,g.jsx)(`span`,{className:`fcs-callSub`,children:t.character})]}),(0,g.jsx)(`span`,{className:`fcs-vh`,children:`Cast ${t.num} ${t.name} as ${t.character}: pickup ${L(i)}, hair and makeup ${L(r)}, on set ${L(n)}`}),(0,g.jsx)(Y,{min:i}),(0,g.jsx)(Y,{min:r}),(0,g.jsx)(Y,{min:n})]},t.num)})]})}function _e(e,t){let n=pe(e,t),r=n==null||n>=F,i=n!=null&&n>=F&&n<I,a=e.mealPenaltySceneIds.length,o=+!e.hardOutOk+(a===0?0:1)+ +!r;return{hardOutOk:e.hardOutOk,penaltyCount:a,turnaround:n,turnaroundOk:r,turnaroundTight:i,allPass:o===0,failCount:o}}var ve={order:G,published:{D14:null,D15:null,D16:null}};function ye(){let[e,t]=(0,h.useState)(ve),[n,c]=(0,h.useState)(null),[d,y]=(0,h.useState)(`D14`),[se,x]=(0,h.useState)(``),S=(e,t)=>(e[t]??[]).map(e=>H.get(e)).filter(e=>e!=null),C=U.map(t=>K(t,S(e.order,t.id))),w=new Map(C.map(e=>[e.day.id,e])),T=C.map((e,t)=>_e(e,U[t+1])),E=new Map(C.map((e,t)=>[e.day.id,T[t]])),D=t=>U.find(n=>(e.order[n.id]??[]).includes(t))?.id,A=n==null?null:H.get(n)??null,j=n==null?void 0:D(n),M=W.get(d)??U[0],N=w.get(M.id)??C[0],P=E.get(M.id)??T[0],F=U[U.findIndex(e=>e.id===M.id)+1],I=e.published[M.id]??null,z=e=>{c(t=>t===e?null:e);let t=D(e);t!=null&&y(t)},B=(n,r)=>{let i=D(n);if(i==null||i===r||e.published[i]!=null||e.published[r]!=null)return;let a={...e.order,[i]:(e.order[i]??[]).filter(e=>e!==n),[r]:[...e.order[r]??[],n]};t(e=>({...e,order:a})),y(r);let o=W.get(i),s=W.get(r);if(o!=null&&s!=null){let e=K(o,S(a,i)),t=K(s,S(a,r)),c=H.get(n);x(`Scene ${c?.num??n} sent to ${s.label}. ${o.label} wrap now ${L(e.wrapMin)}; ${s.label} wrap now ${L(t.wrapMin)}.`)}},V=(n,r)=>{let i=D(n);if(i==null||e.published[i]!=null)return;let a=e.order[i]??[],o=a.indexOf(n),s=o+r;if(o<0||s<0||s>=a.length)return;let c=[...a];c[o]=c[s],c[s]=n,t(e=>({...e,order:{...e.order,[i]:c}}));let l=H.get(n);x(`Scene ${l?.num??n} moved ${r===-1?`earlier`:`later`} in ${W.get(i)?.label??i}.`)},G=n=>{let r=E.get(n);if(r==null||!r.allPass||e.published[n]!=null)return;let i=`Published ${O} · sent to 58 recipients`;t(e=>({...e,published:{...e.published,[n]:i}})),x(`${W.get(n)?.label??n} call sheet published. Strips on that day are locked.`)},J=U.find(t=>e.published[t.id]==null)??U[U.length-1],Y=E.get(J.id)??T[0],ye=e.published[J.id]==null?Y.allPass?(0,g.jsxs)(`span`,{className:`fcs-headChip is-ready fcs-fade`,children:[(0,g.jsx)(s,{size:12,"aria-hidden":!0}),J.label,` ready to publish`]}):(0,g.jsxs)(`span`,{className:`fcs-headChip is-blocked fcs-fade`,children:[(0,g.jsx)(f,{size:12,"aria-hidden":!0}),J.label,` blocked · `,Y.failCount]}):(0,g.jsxs)(`span`,{className:`fcs-headChip is-published fcs-fade`,children:[(0,g.jsx)(p,{size:12,"aria-hidden":!0}),J.label,` published`]}),X=A!=null&&j!=null?w.get(j)?.entries.find(e=>e.type===`scene`&&e.scene.id===A.id):void 0,Z=j==null?void 0:w.get(j),Q=j!=null&&e.published[j]!=null,$=A!=null&&j!=null?(e.order[j]??[]).indexOf(A.id):-1,be=j==null?0:(e.order[j]??[]).length;return(0,g.jsxs)(`div`,{className:_,children:[(0,g.jsx)(`style`,{children:le}),(0,g.jsx)(`div`,{className:`fcs-vh`,"aria-live":`polite`,children:se}),(0,g.jsx)(te,{height:`fill`,header:(0,g.jsx)(re,{hasDivider:!0,children:(0,g.jsxs)(`div`,{className:`fcs-headRow`,children:[(0,g.jsx)(me,{}),(0,g.jsxs)(`div`,{className:`fcs-brandCol`,children:[(0,g.jsxs)(`div`,{className:`fcs-brandLine`,children:[(0,g.jsx)(`span`,{className:`fcs-brandName`,children:`Callslate`}),(0,g.jsxs)(`span`,{className:`fcs-brandProd`,children:[ue,` — `,de,` · strip board, Days 14–16`]})]}),(0,g.jsxs)(`span`,{className:`fcs-brandSub`,children:[`1st AD `,k,` · today Mon `,O,` · Day 14 sheet due 18:00`]})]}),(0,g.jsx)(`div`,{className:`fcs-spring`}),ye,(0,g.jsx)(ae,{name:k,size:`small`})]})}),content:(0,g.jsx)(ne,{padding:0,children:(0,g.jsxs)(`div`,{className:`fcs-frame`,children:[(0,g.jsxs)(`main`,{className:`fcs-main`,children:[(0,g.jsx)(`div`,{className:`fcs-boardScroll`,children:(0,g.jsx)(`div`,{className:`fcs-board`,children:C.map((t,r)=>{let i=r>0?C[r-1]:void 0,a=i==null?null:pe(i,t.day);return(0,g.jsx)(he,{schedule:t,publishedLine:e.published[t.day.id]??null,turnaroundIn:a,selectedSceneId:n,onSelectScene:z},t.day.id)})})}),(0,g.jsxs)(`div`,{className:`fcs-legend`,"aria-label":`Strip color legend`,children:[(0,g.jsxs)(`span`,{className:`fcs-legendKey`,children:[(0,g.jsx)(`span`,{className:`fcs-legendSwatch`,style:{background:v}}),`EXT·D`]}),(0,g.jsxs)(`span`,{className:`fcs-legendKey`,children:[(0,g.jsx)(`span`,{className:`fcs-legendSwatch`,style:{border:`var(--border-width) solid var(--color-border)`}}),`INT·D`]}),(0,g.jsxs)(`span`,{className:`fcs-legendKey`,children:[(0,g.jsx)(`span`,{className:`fcs-legendSwatch`,style:{background:oe}}),`INT·N`]}),(0,g.jsxs)(`span`,{className:`fcs-legendKey`,children:[(0,g.jsx)(`span`,{className:`fcs-legendSwatch`,style:{background:b}}),`EXT·N`]}),(0,g.jsxs)(`span`,{className:`fcs-legendKey`,children:[(0,g.jsx)(`span`,{className:`fcs-legendSwatch`,style:{background:ce}}),`DAWN`]}),(0,g.jsxs)(`span`,{className:`fcs-legendKey`,children:[(0,g.jsx)(`span`,{className:`fcs-legendSwatch`,style:{border:`1px dashed var(--color-border)`,borderRadius:3}}),`derived move / lunch`]}),(0,g.jsxs)(`span`,{className:`fcs-legendKey`,children:[(0,g.jsx)(l,{size:10,"aria-hidden":!0}),`meal-penalty risk`]})]})]}),(0,g.jsxs)(`aside`,{className:`fcs-rail`,"aria-label":`Scene detail, call times, and publish gate`,children:[(0,g.jsx)(`div`,{className:`fcs-detail`,children:A!=null&&Z!=null?(0,g.jsxs)(g.Fragment,{children:[(0,g.jsxs)(`span`,{className:`fcs-overline`,children:[`Scene detail — `,W.get(j??``)?.label,Q?` (published, locked)`:``]}),(0,g.jsxs)(`div`,{className:`fcs-detailTitleRow`,children:[(0,g.jsxs)(`span`,{className:`fcs-sceneNum`,children:[`Sc `,A.num]}),(0,g.jsx)(`span`,{className:`fcs-ieTag`,style:{color:q(A).color,background:q(A).tint},children:q(A).tag})]}),(0,g.jsx)(m,{level:2,maxLines:2,children:A.set}),(0,g.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:A.synopsis}),(0,g.jsxs)(`div`,{className:`fcs-detailFacts`,children:[(0,g.jsx)(`span`,{className:`fcs-factLabel`,children:`Cast`}),(0,g.jsx)(`span`,{className:`fcs-factValue`,children:A.castNums.map(e=>{let t=fe.get(e);return t==null?String(e):`${e} ${t.name}`}).join(` · `)}),(0,g.jsx)(`span`,{className:`fcs-factLabel`,children:`Pages`}),(0,g.jsxs)(`span`,{className:`fcs-factValue`,children:[A.pagesLabel,` (`,A.pagesEighths,`/8)`]}),(0,g.jsx)(`span`,{className:`fcs-factLabel`,children:`Est`}),(0,g.jsx)(`span`,{className:`fcs-factValue`,children:R(A.estMinutes)}),(0,g.jsx)(`span`,{className:`fcs-factLabel`,children:`Location`}),(0,g.jsx)(`span`,{className:`fcs-factValue`,children:A.location}),X==null?null:(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)(`span`,{className:`fcs-factLabel`,children:`Sched`}),(0,g.jsxs)(`span`,{className:`fcs-factValue`,children:[L(Z.firstShotMin+X.startOffset),`–`,L(Z.firstShotMin+X.endOffset),X.mealPenalty?` · MEAL PENALTY RISK`:``]})]})]}),(0,g.jsxs)(`div`,{className:`fcs-moveRow`,role:`group`,"aria-label":`Send scene to another day`,children:[(0,g.jsx)(`span`,{className:`fcs-overline`,children:`Send to`}),U.map(t=>{let n=t.id===j,r=e.published[t.id]!=null;return(0,g.jsxs)(`button`,{type:`button`,className:`fcs-dayBtn fcs-fade${n?` is-current`:``}`,disabled:n||r||Q,"aria-label":n?`${t.label} (current day)`:r?`${t.label} is published and locked`:Q?`Cannot move — ${W.get(j??``)?.label} is published`:`Send scene ${A.num} to ${t.label}`,onClick:()=>B(A.id,t.id),children:[r&&!n?(0,g.jsx)(o,{size:11,"aria-hidden":!0}):null,t.label]},t.id)})]}),(0,g.jsxs)(`div`,{className:`fcs-moveRow`,role:`group`,"aria-label":`Reorder scene within its day`,children:[(0,g.jsx)(`span`,{className:`fcs-overline`,children:`Order`}),(0,g.jsx)(`button`,{type:`button`,className:`fcs-nudgeBtn fcs-fade`,disabled:Q||$<=0,"aria-label":`Move scene ${A.num} earlier in the day`,onClick:()=>V(A.id,-1),children:(0,g.jsx)(a,{size:14,"aria-hidden":!0})}),(0,g.jsx)(`button`,{type:`button`,className:`fcs-nudgeBtn fcs-fade`,disabled:Q||$>=be-1,"aria-label":`Move scene ${A.num} later in the day`,onClick:()=>V(A.id,1),children:(0,g.jsx)(u,{size:14,"aria-hidden":!0})}),(0,g.jsxs)(r,{type:`supporting`,size:`xsm`,color:`secondary`,hasTabularNumbers:!0,children:[`Strip `,$+1,` of `,be]})]})]}):(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)(`span`,{className:`fcs-overline`,children:`Scene detail`}),(0,g.jsx)(m,{level:2,children:`No strip selected`}),(0,g.jsx)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:`Select a strip on the board to see its schedule window, send it to another day, or reorder it. Sending Sc 24 off Day 14 clears both the hard-out overrun and the meal-penalty risk.`})]})}),(0,g.jsxs)(`div`,{className:`fcs-callTable`,children:[(0,g.jsxs)(`div`,{className:`fcs-callHead`,children:[(0,g.jsx)(`span`,{className:`fcs-overline`,children:`Call times`}),(0,g.jsx)(`span`,{className:`fcs-spring`}),U.map(e=>(0,g.jsx)(`button`,{type:`button`,className:`fcs-dayTab fcs-fade`,"aria-pressed":d===e.id,onClick:()=>y(e.id),children:e.label.replace(`Day `,`D`)},e.id))]}),(0,g.jsx)(ge,{schedule:N})]}),(0,g.jsxs)(`div`,{className:`fcs-gate`,"aria-label":`Publish gate for ${M.label}`,children:[(0,g.jsxs)(`span`,{className:`fcs-overline`,children:[`Publish gate — `,M.label,` · `,M.date]}),(0,g.jsxs)(`div`,{className:`fcs-gateReqRow`,children:[(0,g.jsxs)(`span`,{className:`fcs-req fcs-fade ${P.hardOutOk?`is-pass`:`is-fail`}`,children:[P.hardOutOk?(0,g.jsx)(p,{size:11,"aria-hidden":!0}):(0,g.jsx)(f,{size:11,"aria-hidden":!0}),`Wrap `,L(N.wrapMin),P.hardOutOk?``:` > out ${L(M.hardOutMin)}`]}),(0,g.jsxs)(`span`,{className:`fcs-req fcs-fade ${P.penaltyCount===0?`is-pass`:`is-fail`}`,children:[P.penaltyCount===0?(0,g.jsx)(p,{size:11,"aria-hidden":!0}):(0,g.jsx)(l,{size:11,"aria-hidden":!0}),`Meal penalty · `,P.penaltyCount]}),(0,g.jsxs)(`span`,{className:`fcs-req fcs-fade ${P.turnaroundOk?P.turnaroundTight?`is-tight`:`is-pass`:`is-fail`}`,children:[P.turnaroundOk?(0,g.jsx)(p,{size:11,"aria-hidden":!0}):(0,g.jsx)(f,{size:11,"aria-hidden":!0}),P.turnaround==null?`Turnaround · last board day`:`Turnaround ${R(P.turnaround)} → ${F?.label??``}`]})]}),(0,g.jsx)(`div`,{className:`fcs-gateFoot`,children:I==null?(0,g.jsxs)(g.Fragment,{children:[P.allPass?null:(0,g.jsxs)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:[`Clear `,P.failCount,` requirement`,P.failCount===1?``:`s`,` to publish`]}),(0,g.jsx)(ie,{label:`Publish ${M.label} call sheet`,variant:`primary`,size:`sm`,icon:(0,g.jsx)(i,{icon:s,size:`sm`}),isDisabled:!P.allPass,onClick:()=>G(M.id),children:`Publish`})]}):(0,g.jsx)(ee,{content:`Distribution: cast, crew, studio safety, transpo`,children:(0,g.jsxs)(`span`,{className:`fcs-req is-pass`,children:[(0,g.jsx)(p,{size:11,"aria-hidden":!0}),I]})})})]})]})]})})})]})}export{ye as default};