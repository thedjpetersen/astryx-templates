import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-o6Mx44T8.js";import{t as i}from"./Icon-CLHSQIsB.js";import{t as a}from"./arrow-right-ClPurbmp.js";import{t as o}from"./ban-B8VocOAy.js";import{t as s}from"./circle-dollar-sign-m66fKcKU.js";import{t as c}from"./file-text-CvLsiOnq.js";import{t as l}from"./mail-C6CQHzbR.js";import{t as u}from"./phone-BQD1-6Ly.js";import{t as d}from"./receipt-vGmjNXJl.js";import{A as f,C as p,x as m}from"./index-CcGpqB1l.js";import{n as ee,t as h}from"./LayoutContent-CCL91W7X.js";import{t as te}from"./LayoutHeader-Cy2mWoMf.js";import{t as ne}from"./Heading-D2LUKpOk.js";import{t as re}from"./Badge-0Tj9omHc.js";import{t as ie}from"./useToast-DRqH0ZEi.js";var g=f(`calculator`,[[`rect`,{width:`16`,height:`20`,x:`4`,y:`2`,rx:`2`,key:`1nb95v`}],[`line`,{x1:`8`,x2:`16`,y1:`6`,y2:`6`,key:`x4nwl0`}],[`line`,{x1:`16`,x2:`16`,y1:`14`,y2:`18`,key:`wjye3r`}],[`path`,{d:`M16 10h.01`,key:`1m94wz`}],[`path`,{d:`M12 10h.01`,key:`1nrarc`}],[`path`,{d:`M8 10h.01`,key:`19clt8`}],[`path`,{d:`M12 14h.01`,key:`1etili`}],[`path`,{d:`M8 14h.01`,key:`6423bh`}],[`path`,{d:`M12 18h.01`,key:`mhygvu`}],[`path`,{d:`M8 18h.01`,key:`lrp35t`}]]),_=e(t(),1),v=n(),y=`tpl-claims-recovery-ledger`,b=`
.${y} {
  --crl-accent: light-dark(#4338CA, #A5B4FC);
  --crl-accent-tint: light-dark(rgba(67, 56, 202, 0.08), rgba(165, 180, 252, 0.12));
  --crl-recovered: light-dark(#067647, #75E0A7);
  --crl-recovered-tint: light-dark(rgba(6, 118, 71, 0.10), rgba(117, 224, 167, 0.14));
  --crl-warn: light-dark(#B54708, #FDB022);
  --crl-warn-tint: light-dark(rgba(181, 71, 8, 0.10), rgba(253, 176, 34, 0.16));
  --crl-crit: light-dark(#B42318, #F97066);
  --crl-crit-tint: light-dark(rgba(180, 35, 24, 0.10), rgba(249, 112, 102, 0.14));
  color: var(--color-text-primary);
  font-family: var(--font-family-sans);
}
.${y} *,
.${y} *::before,
.${y} *::after {
  box-sizing: border-box;
}
.${y} button {
  font-family: inherit;
}
.${y} button:focus-visible {
  outline: 2px solid var(--crl-accent);
  outline-offset: 2px;
}

/* ---- header ---- */
.${y} .headerRow {
  align-items: center;
  display: flex;
  gap: var(--spacing-3);
  min-height: 56px;
  min-width: 0;
  width: 100%;
}
.${y} .brandLockup {
  align-items: center;
  display: flex;
  gap: var(--spacing-2);
  min-width: 0;
}
.${y} .brandMeta {
  display: grid;
  gap: 1px;
  min-width: 0;
}
.${y} .spring {
  flex: 1;
}
.${y} .asOfChip {
  align-items: center;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-secondary);
  display: inline-flex;
  flex: none;
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  gap: 6px;
  height: 24px;
  padding: 0 10px;
  white-space: nowrap;
}

/* ---- scroll column ---- */
.${y} .surface {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
}

/* ---- aging waterfall band: 120px bars, 148px incl. labels ---- */
.${y} .bandSection {
  border-bottom: var(--border-width) solid var(--color-border);
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-2);
}
.${y} .bandScroll {
  overflow-x: auto;
}
.${y} .band {
  align-items: flex-end;
  display: flex;
  gap: var(--spacing-3);
  min-width: 560px;
}
.${y} .bucketCol {
  background: transparent;
  border: var(--border-width) solid transparent;
  border-radius: 8px;
  cursor: pointer;
  display: grid;
  flex: 1;
  gap: 4px;
  min-width: 72px;
  padding: var(--spacing-1);
}
.${y} .bucketCol[aria-pressed="true"] {
  background: var(--crl-accent-tint);
  border-color: var(--crl-accent);
}
.${y} .bucketTotal {
  color: var(--color-text-primary);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  font-weight: 650;
  text-align: center;
}
.${y} .bucketBar {
  align-items: stretch;
  display: flex;
  flex-direction: column;
  height: 120px;
  justify-content: flex-end;
}
.${y} .bucketSeg {
  background: var(--crl-accent);
  min-height: 3px;
  transition: height 220ms ease, opacity 220ms ease;
}
.${y} .bucketSeg:first-child {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
.${y} .bucketBar.bbEmpty {
  border-bottom: 2px dashed var(--color-border);
}
.${y} .bucketLabel {
  color: var(--color-text-secondary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  text-align: center;
  white-space: nowrap;
}
.${y} .bucketCol[aria-pressed="true"] .bucketLabel {
  color: var(--crl-accent);
  font-weight: 600;
}
.${y} .bandDivider {
  align-items: center;
  align-self: stretch;
  color: var(--color-text-secondary);
  display: flex;
  flex: none;
  padding-bottom: 22px;
}
.${y} .terminalCol {
  display: grid;
  flex: none;
  gap: 4px;
  min-width: 84px;
  padding: var(--spacing-1);
}
.${y} .terminalBar {
  align-items: stretch;
  display: flex;
  flex-direction: column;
  height: 120px;
  justify-content: flex-end;
}
.${y} .terminalFill {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  min-height: 4px;
  transition: height 220ms ease;
}
.${y} .terminalFill.tRecovered {
  background: var(--crl-recovered);
}
.${y} .terminalFill.tWrittenOff {
  background: var(--color-background-muted);
  border: var(--border-width) solid var(--color-border);
}
.${y} .bucketTotal.tRecoveredText {
  color: var(--crl-recovered);
}
.${y} .bandLegend {
  color: var(--color-text-secondary);
  font-size: 11px;
  line-height: 1.5;
  margin: var(--spacing-2) 0 0;
}
.${y} .bandLegend b {
  color: var(--color-text-primary);
  font-weight: 600;
}

/* ---- stat strip: 64px tiles ---- */
.${y} .statStrip {
  border-bottom: var(--border-width) solid var(--color-border);
  display: grid;
  gap: var(--spacing-2);
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding: var(--spacing-2) var(--spacing-3);
}
.${y} .statTile {
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  display: grid;
  gap: 2px;
  min-height: 64px;
  padding: var(--spacing-2) var(--spacing-3);
}
.${y} .statLabel {
  color: var(--color-text-secondary);
  font-size: 10.5px;
  font-weight: 650;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.${y} .statValue {
  font-size: 17px;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}
.${y} .statValue.svAccent {
  color: var(--crl-accent);
}
.${y} .statValue.svRecovered {
  color: var(--crl-recovered);
}
.${y} .statHint {
  color: var(--color-text-secondary);
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
}

/* ---- sticky filter bar: 28px chips ---- */
.${y} .filterBar {
  align-items: center;
  background: var(--color-background);
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
  padding: var(--spacing-2) var(--spacing-3);
  position: sticky;
  top: 0;
  z-index: 3;
}
.${y} .filterChip {
  align-items: center;
  background: transparent;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-secondary);
  cursor: pointer;
  display: inline-flex;
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  gap: 5px;
  min-height: 28px;
  padding: 0 10px;
}
.${y} .filterChip[aria-pressed="true"] {
  background: var(--crl-accent-tint);
  border-color: var(--crl-accent);
  color: var(--crl-accent);
  font-weight: 600;
}
.${y} .bucketEcho {
  align-items: center;
  background: var(--crl-accent-tint);
  border: var(--border-width) solid var(--crl-accent);
  border-radius: 999px;
  color: var(--crl-accent);
  cursor: pointer;
  display: inline-flex;
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  gap: 5px;
  min-height: 28px;
  padding: 0 10px;
}
.${y} .sortGroup {
  display: inline-flex;
  gap: 4px;
  margin-left: auto;
}

/* ---- ledger: 44px rows ----
   Hand-rolled grid table: the <=860px / <=640px column subtraction below
   needs media queries that a DS Table's inline styles would defeat.
   Columns: 28 chevron · 96 case · flex payer · 64 reason · 96 aging ·
   132 stage · 110 amount · 110 yield. */
.${y} .ledgerHead,
.${y} .caseRow {
  align-items: center;
  display: grid;
  gap: var(--spacing-2);
  grid-template-columns: 28px 96px minmax(0, 1fr) 64px 96px 132px 110px 110px;
  padding: 0 var(--spacing-3);
}
.${y} .ledgerHead {
  border-bottom: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 10.5px;
  font-weight: 650;
  letter-spacing: 0.04em;
  min-height: 36px;
  text-transform: uppercase;
}
.${y} .caseRow {
  background: transparent;
  border: 0;
  border-bottom: var(--border-width) solid var(--color-border);
  color: inherit;
  cursor: pointer;
  min-height: 44px;
  text-align: left;
  width: 100%;
}
.${y} .caseRow[aria-expanded="true"] {
  background: var(--crl-accent-tint);
  border-bottom-color: transparent;
}
.${y} .caseRow.rowClosed .payerName,
.${y} .caseRow.rowClosed .caseId {
  color: var(--color-text-secondary);
}
.${y} .cellRight {
  text-align: right;
}
.${y} .chev {
  align-items: center;
  color: var(--color-text-secondary);
  display: inline-flex;
  justify-content: center;
}
.${y} .caseId {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  font-weight: 650;
  white-space: nowrap;
}
.${y} .payerCell {
  display: grid;
  gap: 1px;
  min-width: 0;
}
.${y} .payerName {
  font-size: 12.5px;
  font-weight: 550;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${y} .payerSub {
  color: var(--color-text-secondary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${y} .reasonChip {
  align-items: center;
  background: var(--color-background-muted);
  border-radius: 5px;
  color: var(--color-text-secondary);
  display: inline-flex;
  font-size: 10.5px;
  font-weight: 650;
  height: 20px;
  justify-content: center;
  letter-spacing: 0.04em;
  padding: 0 6px;
  width: fit-content;
}
.${y} .agingCell {
  align-items: center;
  display: inline-flex;
  gap: 6px;
}
.${y} .agingDays {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${y} .agingChip {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  font-size: 10px;
  font-weight: 650;
  height: 18px;
  padding: 0 6px;
  white-space: nowrap;
}
.${y} .agingChip.agCalm {
  background: var(--color-background-muted);
  color: var(--color-text-secondary);
}
.${y} .agingChip.agWarn {
  background: var(--crl-warn-tint);
  color: var(--crl-warn);
}
.${y} .agingChip.agCrit {
  background: var(--crl-crit-tint);
  color: var(--crl-crit);
}
.${y} .stageChip {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  font-weight: 650;
  gap: 4px;
  height: 20px;
  padding: 0 8px;
  white-space: nowrap;
  width: fit-content;
}
.${y} .stageChip.sgIdentified {
  background: var(--color-background-muted);
  color: var(--color-text-secondary);
}
.${y} .stageChip.sgOpen {
  background: var(--crl-accent-tint);
  color: var(--crl-accent);
}
.${y} .stageChip.sgRecovered {
  background: var(--crl-recovered-tint);
  color: var(--crl-recovered);
}
.${y} .stageChip.sgWrittenOff {
  background: var(--color-background-muted);
  color: var(--color-text-secondary);
  text-decoration: line-through;
}
.${y} .money {
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${y} .money.mStrong {
  font-weight: 650;
}
.${y} .money.mYield {
  color: var(--crl-accent);
  font-weight: 600;
}
.${y} .money.mMuted {
  color: var(--color-text-secondary);
  text-decoration: line-through;
}
.${y} .money.mRecovered {
  color: var(--crl-recovered);
  font-weight: 650;
}

/* ---- expanded evidence packet: 36px doc rows ---- */
.${y} .packet {
  background: var(--crl-accent-tint);
  border-bottom: var(--border-width) solid var(--color-border);
  padding: 0 var(--spacing-3) var(--spacing-3)
    calc(28px + var(--spacing-3) + var(--spacing-2));
}
.${y} .packetInner {
  background: var(--color-background);
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  display: grid;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
}
.${y} .packetLabel {
  color: var(--color-text-secondary);
  font-size: 10.5px;
  font-weight: 650;
  letter-spacing: 0.05em;
  margin: 0;
  text-transform: uppercase;
}
.${y} .docList {
  display: grid;
  list-style: none;
  margin: 0;
  padding: 0;
}
.${y} .docRow {
  align-items: center;
  display: grid;
  gap: var(--spacing-2);
  grid-template-columns: 20px 84px minmax(0, 1fr) 56px 64px auto;
  min-height: 36px;
}
.${y} .docRow + .docRow {
  border-top: var(--border-width) solid var(--color-border);
}
.${y} .docIcon {
  align-items: center;
  color: var(--color-text-secondary);
  display: inline-flex;
}
.${y} .docId {
  color: var(--color-text-secondary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${y} .docLabel {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${y} .docPages,
.${y} .docAdded {
  color: var(--color-text-secondary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
}
.${y} .docStatus {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  font-size: 10px;
  font-weight: 650;
  height: 18px;
  padding: 0 6px;
}
.${y} .docStatus.dsAttached {
  background: var(--crl-recovered-tint);
  color: var(--crl-recovered);
}
.${y} .docStatus.dsRequested {
  background: var(--crl-warn-tint);
  color: var(--crl-warn);
}
.${y} .docEmpty {
  border: var(--border-width) dashed var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.5;
  padding: var(--spacing-3);
  text-align: center;
}
.${y} .packetNote {
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
}
.${y} .packetNote b {
  color: var(--color-text-primary);
  font-weight: 600;
}
.${y} .packetFoot {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}
.${y} .advanceBtn {
  align-items: center;
  background: var(--crl-accent);
  border: 0;
  border-radius: 8px;
  /* On-accent text: #FFFFFF on #4338CA ≈ 7.9:1 (light); #1E1B4B on
     #A5B4FC ≈ 7.4:1 (dark) — white on #A5B4FC would fail at ~1.7:1. */
  color: light-dark(#FFFFFF, #1E1B4B);
  cursor: pointer;
  display: inline-flex;
  font-size: 12px;
  font-weight: 650;
  gap: 6px;
  min-height: 40px;
  padding: 0 var(--spacing-3);
}
.${y} .advanceBtn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.${y} .writeOffBtn {
  align-items: center;
  background: transparent;
  border: var(--border-width) solid var(--crl-crit);
  border-radius: 8px;
  color: var(--crl-crit);
  cursor: pointer;
  display: inline-flex;
  font-size: 12px;
  font-weight: 650;
  gap: 6px;
  min-height: 40px;
  padding: 0 var(--spacing-3);
}
.${y} .gateReason {
  color: var(--crl-warn);
  font-size: 11.5px;
  font-weight: 600;
}
.${y} .yieldEcho {
  color: var(--color-text-secondary);
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
}
.${y} .closedBanner {
  border-radius: 8px;
  display: grid;
  gap: 2px;
  padding: var(--spacing-2) var(--spacing-3);
}
.${y} .closedBanner.cbRecovered {
  background: var(--crl-recovered-tint);
}
.${y} .closedBanner.cbWrittenOff {
  background: var(--color-background-muted);
}
.${y} .closedTitle {
  font-size: 12.5px;
  font-weight: 650;
}
.${y} .cbRecovered .closedTitle {
  color: var(--crl-recovered);
}
.${y} .closedMeta {
  color: var(--color-text-secondary);
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  line-height: 1.5;
}
.${y} .ledgerEmpty {
  border: var(--border-width) dashed var(--color-border);
  border-radius: 10px;
  color: var(--color-text-secondary);
  font-size: 12.5px;
  line-height: 1.5;
  margin: var(--spacing-3);
  padding: var(--spacing-5) var(--spacing-3);
  text-align: center;
}

.${y} .visuallyHidden {
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

/* ---- <=860px: subtract the reason column ---- */
@media (max-width: 860px) {
  .${y} .ledgerHead,
  .${y} .caseRow {
    grid-template-columns: 28px 96px minmax(0, 1fr) 96px 132px 110px 110px;
  }
  .${y} .colReason {
    display: none;
  }
  .${y} .band {
    gap: var(--spacing-2);
  }
}

/* ---- <=640px (390px embed): subtract stage + yield; 40px targets ---- */
@media (max-width: 640px) {
  .${y} .ledgerHead,
  .${y} .caseRow {
    gap: var(--spacing-1);
    grid-template-columns: 24px 88px minmax(0, 1fr) 84px 96px;
  }
  .${y} .colYield,
  .${y} .colStage {
    display: none;
  }
  .${y} .statStrip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .${y} .filterChip,
  .${y} .bucketEcho {
    min-height: 40px;
  }
  .${y} .asOfChip {
    display: none;
  }
  .${y} .packet {
    padding-left: var(--spacing-3);
  }
  .${y} .docRow {
    grid-template-columns: 20px minmax(0, 1fr) 64px auto;
  }
  .${y} .docId,
  .${y} .docPages {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .${y} .bucketSeg,
  .${y} .terminalFill {
    transition: none;
  }
}
`,x={identified:{label:`Identified`,probability:.35,action:`Send payer notice`,next:`notified`},notified:{label:`Notified`,probability:.55,action:`Record acknowledgement`,next:`acknowledged`},acknowledged:{label:`Acknowledged`,probability:.75,action:`Schedule repayment`,next:`scheduled`},scheduled:{label:`Scheduled`,probability:.92,action:`Post recovery`,next:`recovered`},recovered:{label:`Recovered`,probability:1,action:null,next:null},written_off:{label:`Written off`,probability:0,action:null,next:null}},S=[`identified`,`notified`,`acknowledged`,`scheduled`],C=[{id:`b0`,label:`0–30d`,min:0,max:30},{id:`b1`,label:`31–60d`,min:31,max:60},{id:`b2`,label:`61–90d`,min:61,max:90},{id:`b3`,label:`91–120d`,min:91,max:120},{id:`b4`,label:`120+d`,min:121,max:null}];function w(e){return e<=30?`b0`:e<=60?`b1`:e<=90?`b2`:e<=120?`b3`:`b4`}var T={DUP:`Duplicate payment`,COB:`COB — primary liability`,UNB:`Unbundled procedure codes`,FSV:`Fee schedule variance`,CRB:`Credit balance`,MNA:`Medical necessity audit`,TFD:`Timely filing dispute`},E={meridian:`Meridian Health Plan`,cascadia:`Cascadia BlueShield`,atlas:`Atlas Workers' Comp`,pinnacle:`Pinnacle Medicare Advantage`,consolidated:`Consolidated Mutual Health & Casualty of the Northern Plains`},D={eob:c,worksheet:g,letter:l,remit:d,call:u};function O(e,t,n,r,i,a=`attached`){return{id:e,kind:t,label:n,pages:r,addedOn:i,status:a}}var k=[{id:`RCP-2026-041`,payerId:`meridian`,claim:`CLM-88104-C`,reason:`DUP`,amountCents:1248e3,daysOut:12,openedOn:`Jun 26`,stage:`notified`,closedOn:``,owner:`J. Whitfield`,note:`Same-day duplicate of the professional claim; both remits cleared. Notice cites the second trace number.`,evidence:[O(`DOC-5201`,`remit`,`Duplicate remittance pair (835)`,4,`Jun 26`),O(`DOC-5202`,`worksheet`,`Overpayment worksheet`,2,`Jun 27`),O(`DOC-5203`,`letter`,`Payer notice — first demand`,1,`Jun 30`)]},{id:`RCP-2026-039`,payerId:`cascadia`,claim:`CLM-87911-A`,reason:`COB`,amountCents:321455,daysOut:19,openedOn:`Jun 19`,stage:`identified`,closedOn:``,owner:`A. Romero`,note:`Commercial primary discovered after our payment; COB questionnaire back from the member is outstanding.`,evidence:[O(`DOC-5188`,`eob`,`Primary carrier EOB`,3,`Jun 19`),O(`DOC-5189`,`worksheet`,`COB questionnaire`,2,`Jun 20`,`requested`)]},{id:`RCP-2026-036`,payerId:`meridian`,claim:`CLM-87740-B`,reason:`UNB`,amountCents:84260,daysOut:27,openedOn:`Jun 11`,stage:`identified`,closedOn:``,owner:`K. Tran`,note:`Venipuncture billed separately from the E/M visit; NCCI edit supports rebundling.`,evidence:[O(`DOC-5164`,`worksheet`,`Audit worksheet — NCCI edit 99213/36415`,2,`Jun 11`),O(`DOC-5165`,`eob`,`Coding review memo`,1,`Jun 12`)]},{id:`RCP-2026-034`,payerId:`atlas`,claim:`CLM-87652-D`,reason:`FSV`,amountCents:690512,daysOut:38,openedOn:`May 31`,stage:`acknowledged`,closedOn:``,owner:`M. Adeyemi`,note:`Paid at the 2024 fee schedule after the 2026 update; adjuster acknowledged the variance on Jun 24.`,evidence:[O(`DOC-5142`,`worksheet`,`Fee schedule extract — 2026 vs paid`,3,`May 31`),O(`DOC-5143`,`letter`,`Acknowledgement letter`,1,`Jun 24`),O(`DOC-5144`,`call`,`Adjuster call log`,1,`Jun 24`)]},{id:`RCP-2026-031`,payerId:`cascadia`,claim:`CLM-87488-A`,reason:`CRB`,amountCents:173328,daysOut:44,openedOn:`May 25`,stage:`notified`,closedOn:``,owner:`J. Whitfield`,note:`Patient and plan both paid the coinsurance; credit sits on the account pending payer instruction.`,evidence:[O(`DOC-5120`,`worksheet`,`Credit balance report`,2,`May 25`),O(`DOC-5121`,`letter`,`Payer notice — refund offer`,1,`Jun 2`)]},{id:`RCP-2026-029`,payerId:`pinnacle`,claim:`CLM-87301-E`,reason:`DUP`,amountCents:2466e3,daysOut:52,openedOn:`May 17`,stage:`scheduled`,closedOn:``,owner:`A. Romero`,note:`Repayment agreement signed; recoupment posts against the Jul 15 remittance cycle.`,evidence:[O(`DOC-5098`,`remit`,`Duplicate remittance pair (835)`,6,`May 17`),O(`DOC-5099`,`letter`,`Repayment agreement — countersigned`,2,`Jun 20`),O(`DOC-5100`,`remit`,`ERA preview — Jul 15 cycle`,1,`Jul 1`)]},{id:`RCP-2026-027`,payerId:`consolidated`,claim:`CLM-87215-F`,reason:`COB`,amountCents:911874,daysOut:59,openedOn:`May 10`,stage:`notified`,closedOn:``,owner:`K. Tran`,note:`Auto liability carrier is primary per the police report; payer’s COB unit has the demand under review.`,evidence:[O(`DOC-5076`,`eob`,`Primary carrier EOB`,2,`May 10`),O(`DOC-5077`,`letter`,`Payer notice — subrogation demand`,3,`May 21`),O(`DOC-5078`,`call`,`COB unit call log`,1,`Jun 18`)]},{id:`RCP-2026-024`,payerId:`pinnacle`,claim:`CLM-86987-E`,reason:`MNA`,amountCents:14823019,daysOut:66,openedOn:`May 3`,stage:`acknowledged`,closedOn:``,owner:`M. Adeyemi`,note:`Inpatient stay reclassified to observation on audit; appeal window lapsed Jun 30 with no provider appeal.`,evidence:[O(`DOC-5044`,`worksheet`,`Audit findings — DRG 291 → observation`,44,`May 3`),O(`DOC-5045`,`eob`,`Medical records receipt`,1,`May 9`),O(`DOC-5046`,`letter`,`Acknowledgement letter`,1,`Jun 2`),O(`DOC-5047`,`letter`,`Appeal-window lapse memo`,1,`Jul 1`)]},{id:`RCP-2026-022`,payerId:`meridian`,claim:`CLM-86854-C`,reason:`CRB`,amountCents:4210,daysOut:73,openedOn:`Apr 26`,stage:`identified`,closedOn:``,owner:`K. Tran`,note:`Small-balance copay credit surfaced by the quarterly sweep; worksheet auto-generation is queued.`,evidence:[]},{id:`RCP-2026-019`,payerId:`atlas`,claim:`CLM-86620-D`,reason:`FSV`,amountCents:437790,daysOut:88,openedOn:`Apr 11`,stage:`scheduled`,closedOn:``,owner:`J. Whitfield`,note:`Carrier agreed to reprice; check scheduled with the Jul 20 payment run.`,evidence:[O(`DOC-4988`,`worksheet`,`Fee schedule extract`,2,`Apr 11`),O(`DOC-4989`,`letter`,`Repayment agreement`,1,`Jun 9`)]},{id:`RCP-2026-016`,payerId:`cascadia`,claim:`CLM-86412-A`,reason:`UNB`,amountCents:225e3,daysOut:97,openedOn:`Apr 2`,stage:`acknowledged`,closedOn:``,owner:`A. Romero`,note:`Therapy units billed individually across the same session; payer coding unit concurs with rebundling.`,evidence:[O(`DOC-4952`,`eob`,`Coding review — 97110 units`,2,`Apr 2`),O(`DOC-4953`,`letter`,`Acknowledgement letter`,1,`May 14`)]},{id:`RCP-2026-014`,payerId:`pinnacle`,claim:`CLM-86200-E`,reason:`DUP`,amountCents:1890540,daysOut:104,openedOn:`Mar 26`,stage:`notified`,closedOn:``,owner:`M. Adeyemi`,note:`First demand unanswered for 45 days; second notice drafted and queued for certified mail.`,evidence:[O(`DOC-4901`,`remit`,`Duplicate remittance pair (835)`,5,`Mar 26`),O(`DOC-4902`,`letter`,`Payer notice — first demand`,1,`Apr 8`),O(`DOC-4903`,`letter`,`Second notice — certified`,1,`Jul 2`,`requested`)]},{id:`RCP-2026-011`,payerId:`meridian`,claim:`CLM-85977-B`,reason:`COB`,amountCents:761283,daysOut:131,openedOn:`Feb 27`,stage:`scheduled`,closedOn:``,owner:`J. Whitfield`,note:`Medicare primary confirmed; conditional payment recoupment scheduled against the Jul 22 cycle.`,evidence:[O(`DOC-4844`,`eob`,`Primary carrier EOB`,2,`Feb 27`),O(`DOC-4845`,`letter`,`Repayment agreement`,2,`May 30`),O(`DOC-4846`,`call`,`COB unit call log`,1,`Jun 12`)]},{id:`RCP-2026-008`,payerId:`atlas`,claim:`CLM-85714-D`,reason:`MNA`,amountCents:1104800,daysOut:142,openedOn:`Feb 16`,stage:`identified`,closedOn:``,owner:`A. Romero`,note:`Oldest open balance on the ledger. Records request to the treating clinic is still outstanding — escalate before the 180-day contract bar.`,evidence:[O(`DOC-4790`,`worksheet`,`Audit findings — utilization review`,12,`Feb 16`),O(`DOC-4791`,`eob`,`Records request — treating clinic`,1,`Feb 20`,`requested`)]},{id:`RCP-2026-005`,payerId:`cascadia`,claim:`CLM-85510-A`,reason:`CRB`,amountCents:512075,daysOut:159,openedOn:`Jan 30`,stage:`recovered`,closedOn:`Jun 30`,owner:`A. Romero`,note:`Refund check 004417 cleared Jun 30; account credit zeroed.`,evidence:[O(`DOC-4711`,`worksheet`,`Credit balance report`,2,`Jan 30`),O(`DOC-4712`,`remit`,`Refund check 004417 — cleared`,1,`Jun 30`)]},{id:`RCP-2026-003`,payerId:`consolidated`,claim:`CLM-85342-F`,reason:`TFD`,amountCents:286400,daysOut:149,openedOn:`Feb 9`,stage:`written_off`,closedOn:`May 22`,owner:`K. Tran`,note:`Payer’s timely-filing denial upheld on second-level review; balance written off May 22 per policy FIN-114.`,evidence:[O(`DOC-4730`,`letter`,`Denial upheld — second-level review`,2,`May 20`)]}];function A(e){let t=e<0?`-`:``,n=Math.abs(e),r=Math.floor(n/100),i=String(n%100).padStart(2,`0`);return`${t}$${String(r).replace(/\B(?=(\d{3})+(?!\d))/g,`,`)}.${i}`}function j(e){if(e>=1e6){let t=e/1e5;return`$${(Math.round(t*10)/10).toLocaleString(`en-US`,{minimumFractionDigits:1,maximumFractionDigits:1})}K`}let t=Math.round(e/100);return`$${String(t).replace(/\B(?=(\d{3})+(?!\d))/g,`,`)}`}function M(e){return e.stage===`recovered`||e.stage===`written_off`?0:Math.round(e.amountCents*x[e.stage].probability)}function N(e){return e.stage!==`recovered`&&e.stage!==`written_off`}function ae(e){return e>120?`agCrit`:e>60?`agWarn`:`agCalm`}function P(e){return e.evidence.filter(e=>e.status===`attached`).length}function F(e){return e.stage===`identified`&&P(e)===0?`Notice blocked — attach at least one evidence document before demanding repayment.`:null}function I(){return(0,v.jsxs)(`svg`,{width:`26`,height:`26`,viewBox:`0 0 26 26`,fill:`none`,"aria-hidden":!0,style:{color:`var(--crl-accent)`,flex:`none`},children:[(0,v.jsx)(`path`,{d:`M21 11a8 8 0 1 0-2.3 6.2`,stroke:`currentColor`,strokeWidth:`1.8`,strokeLinecap:`round`}),(0,v.jsx)(`path`,{d:`M21 5.5V11h-5.5`,stroke:`currentColor`,strokeWidth:`1.8`,strokeLinecap:`round`,strokeLinejoin:`round`}),(0,v.jsx)(`path`,{d:`M5 22h16`,stroke:`currentColor`,strokeWidth:`1.8`,strokeLinecap:`round`})]})}function L(){let e=ie(),[t,n]=(0,_.useState)(k),[c,l]=(0,_.useState)(null),[u,d]=(0,_.useState)(`open`),[f,g]=(0,_.useState)(null),[O,P]=(0,_.useState)(`oldest`),[L,R]=(0,_.useState)(``),z=t.filter(N),B=z.reduce((e,t)=>e+t.amountCents,0),V=z.reduce((e,t)=>e+M(t),0),H=t.filter(e=>e.stage===`recovered`),U=H.reduce((e,t)=>e+t.amountCents,0),W=t.filter(e=>e.stage===`written_off`),G=W.reduce((e,t)=>e+t.amountCents,0),K=(0,_.useMemo)(()=>{let e={b0:{identified:0,notified:0,acknowledged:0,scheduled:0},b1:{identified:0,notified:0,acknowledged:0,scheduled:0},b2:{identified:0,notified:0,acknowledged:0,scheduled:0},b3:{identified:0,notified:0,acknowledged:0,scheduled:0},b4:{identified:0,notified:0,acknowledged:0,scheduled:0}};for(let n of t)N(n)&&(e[w(n.daysOut)][n.stage]+=n.amountCents);return e},[t]),q=(0,_.useMemo)(()=>{let e={b0:0,b1:0,b2:0,b3:0,b4:0};for(let t of C)e[t.id]=S.reduce((e,n)=>e+K[t.id][n],0);return e},[K]),J=(0,_.useMemo)(()=>{let e={b0:0,b1:0,b2:0,b3:0,b4:0};for(let n of t)N(n)&&(e[w(n.daysOut)]+=1);return e},[t]),oe=Math.max(...C.map(e=>q[e.id]),U,G,1),Y=e=>Math.round(e/oe*120),se=(0,_.useMemo)(()=>{let e={identified:0,notified:0,acknowledged:0,scheduled:0};for(let n of t)N(n)&&(e[n.stage]+=1);return e},[t]),ce=t.length-z.length,X=(0,_.useMemo)(()=>[...t.filter(e=>!(u===`open`&&!N(e)||u===`closed`&&N(e)||u!==`open`&&u!==`closed`&&e.stage!==u||f!==null&&(!N(e)||w(e.daysOut)!==f)))].sort((e,t)=>O===`oldest`?t.daysOut-e.daysOut:t.amountCents-e.amountCents),[t,u,f,O]),Z=(e,t)=>{n(n=>n.map(n=>n.id===e?{...n,...t}:n))},le=t=>{let n=F(t);if(n!==null){R(`${t.id}: ${n}`);return}let r=x[t.stage].next;if(r===null)return;let i=w(t.daysOut),a=C.find(e=>e.id===i)?.label??``;if(r===`recovered`){Z(t.id,{stage:`recovered`,closedOn:`Jul 8`});let n=q[i]-t.amountCents;e({body:`${t.id} recovered ${A(t.amountCents)} — ${a} bucket now ${A(n)}`,isAutoHide:!0}),R(`${t.id} recovered ${A(t.amountCents)}. Dollars moved from the ${a} aging bucket to the recovered pool; recovered QTD is now ${A(U+t.amountCents)}.`);return}let o=M(t),s=Math.round(t.amountCents*x[r].probability);Z(t.id,{stage:r}),e({body:`${t.id} → ${x[r].label} — expected yield +${A(s-o)}`,isAutoHide:!0}),R(`${t.id} advanced to ${x[r].label}. Expected yield rose ${A(s-o)} to ${A(V-o+s)} total.`)},ue=t=>{let n=w(t.daysOut),r=C.find(e=>e.id===n)?.label??``;Z(t.id,{stage:`written_off`,closedOn:`Jul 8`}),e({body:`${t.id} written off ${A(t.amountCents)} — removed from ${r}`,isAutoHide:!0}),R(`${t.id} written off ${A(t.amountCents)}. Dollars left the ${r} aging bucket; written-off total is now ${A(G+t.amountCents)}.`)},Q=e=>{let t=f===e?null:e;g(t);let n=C.find(t=>t.id===e)?.label??``;R(t===null?`Bucket scope cleared — showing all aging buckets.`:`Ledger scoped to the ${n} aging bucket (${J[e]} open cases, ${A(q[e])}).`)},de=(0,v.jsxs)(`section`,{className:`bandSection`,"aria-label":`Aging waterfall`,children:[(0,v.jsx)(`div`,{className:`bandScroll`,children:(0,v.jsxs)(`div`,{className:`band`,children:[C.map(e=>{let t=q[e.id],n=J[e.id];return(0,v.jsxs)(`button`,{type:`button`,className:`bucketCol`,"aria-pressed":f===e.id,"aria-label":`${e.label} aging bucket: ${A(t)} across ${n} open case${n===1?``:`s`}. ${f===e.id?`Selected — click to clear the bucket scope.`:`Click to scope the ledger to this bucket.`}`,onClick:()=>Q(e.id),children:[(0,v.jsx)(`span`,{className:`bucketTotal`,children:j(t)}),(0,v.jsx)(`span`,{className:`bucketBar${t===0?` bbEmpty`:``}`,"aria-hidden":!0,children:S.filter(t=>K[e.id][t]>0).map(t=>(0,v.jsx)(`span`,{className:`bucketSeg`,style:{height:Y(K[e.id][t]),opacity:x[t].probability}},t))}),(0,v.jsxs)(`span`,{className:`bucketLabel`,children:[e.label,` · `,n]})]},e.id)}),(0,v.jsx)(`span`,{className:`bandDivider`,"aria-hidden":!0,children:(0,v.jsx)(i,{icon:a,size:`sm`,color:`inherit`})}),(0,v.jsxs)(`div`,{className:`terminalCol`,role:`img`,"aria-label":`Recovered pool: ${A(U)} across ${H.length} case${H.length===1?``:`s`}`,children:[(0,v.jsx)(`span`,{className:`bucketTotal tRecoveredText`,children:j(U)}),(0,v.jsx)(`span`,{className:`terminalBar`,"aria-hidden":!0,children:(0,v.jsx)(`span`,{className:`terminalFill tRecovered`,style:{height:Y(U)}})}),(0,v.jsxs)(`span`,{className:`bucketLabel`,children:[`Recovered · `,H.length]})]}),(0,v.jsxs)(`div`,{className:`terminalCol`,role:`img`,"aria-label":`Written-off pool: ${A(G)} across ${W.length} case${W.length===1?``:`s`}`,children:[(0,v.jsx)(`span`,{className:`bucketTotal`,children:j(G)}),(0,v.jsx)(`span`,{className:`terminalBar`,"aria-hidden":!0,children:(0,v.jsx)(`span`,{className:`terminalFill tWrittenOff`,style:{height:Y(G)}})}),(0,v.jsxs)(`span`,{className:`bucketLabel`,children:[`Written off · `,W.length]})]})]})}),(0,v.jsxs)(`p`,{className:`bandLegend`,children:[`Bars are open dollars by aging bucket; `,(0,v.jsx)(`b`,{children:`fill opacity = stage recovery probability`}),` (Identified 35% · Notified 55% · Acknowledged 75% · Scheduled 92%), so a bucket solidifies as its cases advance. Click a bucket to scope the ledger. Posting a recovery moves its dollars into the green pool on the right.`]})]}),fe=(0,v.jsxs)(`section`,{className:`statStrip`,"aria-label":`Recovery totals`,children:[(0,v.jsxs)(`div`,{className:`statTile`,children:[(0,v.jsx)(`span`,{className:`statLabel`,children:`Gross open`}),(0,v.jsx)(`span`,{className:`statValue`,children:A(B)}),(0,v.jsxs)(`span`,{className:`statHint`,children:[z.length,` open cases`]})]}),(0,v.jsxs)(`div`,{className:`statTile`,children:[(0,v.jsx)(`span`,{className:`statLabel`,children:`Expected yield`}),(0,v.jsx)(`span`,{className:`statValue svAccent`,children:A(V)}),(0,v.jsx)(`span`,{className:`statHint`,children:`probability-weighted, live`})]}),(0,v.jsxs)(`div`,{className:`statTile`,children:[(0,v.jsx)(`span`,{className:`statLabel`,children:`Recovered QTD`}),(0,v.jsx)(`span`,{className:`statValue svRecovered`,children:A(U)}),(0,v.jsxs)(`span`,{className:`statHint`,children:[H.length,` case`,H.length===1?``:`s`,` posted`]})]}),(0,v.jsxs)(`div`,{className:`statTile`,children:[(0,v.jsx)(`span`,{className:`statLabel`,children:`Written off`}),(0,v.jsx)(`span`,{className:`statValue`,children:A(G)}),(0,v.jsxs)(`span`,{className:`statHint`,children:[W.length,` case`,W.length===1?``:`s`,` per policy FIN-114`]})]})]}),pe=[{id:`open`,label:`All open`,count:z.length},...S.map(e=>({id:e,label:x[e].label,count:se[e]})),{id:`closed`,label:`Closed`,count:ce}],$=f===null?null:C.find(e=>e.id===f)??null,me=(0,v.jsxs)(`div`,{className:`filterBar`,role:`group`,"aria-label":`Ledger filters`,children:[pe.map(e=>(0,v.jsxs)(`button`,{type:`button`,className:`filterChip`,"aria-pressed":u===e.id,onClick:()=>d(e.id),children:[e.label,(0,v.jsxs)(`span`,{"aria-hidden":!0,children:[`(`,e.count,`)`]})]},e.id)),$!==null&&(0,v.jsxs)(`button`,{type:`button`,className:`bucketEcho`,"aria-label":`Clear the ${$.label} bucket scope`,onClick:()=>Q($.id),children:[$.label,` bucket ×`]}),(0,v.jsxs)(`span`,{className:`sortGroup`,role:`group`,"aria-label":`Sort order`,children:[(0,v.jsx)(`button`,{type:`button`,className:`filterChip`,"aria-pressed":O===`oldest`,onClick:()=>P(`oldest`),children:`Oldest first`}),(0,v.jsx)(`button`,{type:`button`,className:`filterChip`,"aria-pressed":O===`largest`,onClick:()=>P(`largest`),children:`Largest first`})]})]}),he=(0,v.jsxs)(`div`,{className:`ledgerHead`,"aria-hidden":!0,children:[(0,v.jsx)(`span`,{}),(0,v.jsx)(`span`,{children:`Case`}),(0,v.jsx)(`span`,{children:`Payer / claim`}),(0,v.jsx)(`span`,{className:`colReason`,children:`Reason`}),(0,v.jsx)(`span`,{children:`Aging`}),(0,v.jsx)(`span`,{className:`colStage`,children:`Stage`}),(0,v.jsx)(`span`,{className:`cellRight`,children:`Amount`}),(0,v.jsx)(`span`,{className:`cellRight colYield`,children:`Exp. yield`})]}),ge=e=>{let t=x[e.stage],n=F(e),r=M(e);return(0,v.jsx)(`div`,{className:`packet`,children:(0,v.jsxs)(`div`,{className:`packetInner`,children:[(0,v.jsxs)(`p`,{className:`packetLabel`,children:[`Evidence packet · `,e.evidence.length,` document`,e.evidence.length===1?``:`s`,` ·`,` `,T[e.reason],` · `,e.owner]}),e.evidence.length===0?(0,v.jsxs)(`div`,{className:`docEmpty`,children:[`No evidence attached yet. `,e.note]}):(0,v.jsx)(`ul`,{className:`docList`,children:e.evidence.map(e=>(0,v.jsxs)(`li`,{className:`docRow`,children:[(0,v.jsx)(`span`,{className:`docIcon`,children:(0,v.jsx)(i,{icon:D[e.kind],size:`sm`,color:`inherit`})}),(0,v.jsx)(`span`,{className:`docId`,children:e.id}),(0,v.jsx)(`span`,{className:`docLabel`,children:e.label}),(0,v.jsxs)(`span`,{className:`docPages`,children:[e.pages,` pp`]}),(0,v.jsx)(`span`,{className:`docAdded`,children:e.addedOn}),(0,v.jsx)(`span`,{className:`docStatus ${e.status===`attached`?`dsAttached`:`dsRequested`}`,children:e.status})]},e.id))}),e.evidence.length>0&&(0,v.jsxs)(`p`,{className:`packetNote`,children:[(0,v.jsx)(`b`,{children:`Working note.`}),` `,e.note]}),N(e)?(0,v.jsxs)(`div`,{className:`packetFoot`,children:[(0,v.jsxs)(`button`,{type:`button`,className:`advanceBtn`,disabled:n!==null,onClick:()=>le(e),children:[(0,v.jsx)(i,{icon:t.next===`recovered`?s:a,size:`sm`,color:`inherit`}),t.action]}),(0,v.jsxs)(`button`,{type:`button`,className:`writeOffBtn`,onClick:()=>ue(e),children:[(0,v.jsx)(i,{icon:o,size:`sm`,color:`inherit`}),`Write off`]}),n===null?(0,v.jsxs)(`span`,{className:`yieldEcho`,children:[x[e.stage].label,` ·`,` `,Math.round(t.probability*100),`% × `,A(e.amountCents),` `,`= `,A(r),` expected`]}):(0,v.jsx)(`span`,{className:`gateReason`,children:n})]}):(0,v.jsxs)(`div`,{className:`closedBanner ${e.stage===`recovered`?`cbRecovered`:`cbWrittenOff`}`,children:[(0,v.jsx)(`span`,{className:`closedTitle`,children:e.stage===`recovered`?`Recovered ${A(e.amountCents)}`:`Written off ${A(e.amountCents)}`}),(0,v.jsxs)(`span`,{className:`closedMeta`,children:[`Closed `,e.closedOn,` · opened `,e.openedOn,` ·`,` `,e.note]})]})]})})};return(0,v.jsxs)(`div`,{className:y,style:{height:`100dvh`,width:`100%`},children:[(0,v.jsx)(`style`,{children:b}),(0,v.jsx)(ee,{height:`fill`,header:(0,v.jsx)(te,{hasDivider:!0,children:(0,v.jsxs)(`div`,{className:`headerRow`,children:[(0,v.jsxs)(`div`,{className:`brandLockup`,children:[(0,v.jsx)(I,{}),(0,v.jsxs)(`div`,{className:`brandMeta`,children:[(0,v.jsx)(ne,{level:5,accessibilityLevel:1,maxLines:1,children:`Recoup · Recovery Ledger`}),(0,v.jsx)(r,{type:`supporting`,size:`sm`,color:`secondary`,maxLines:1,children:`Payment integrity — overpayments & subrogation`})]})]}),(0,v.jsx)(`span`,{className:`spring`}),(0,v.jsx)(re,{label:`${z.length} open · ${j(B)}`,variant:`neutral`}),(0,v.jsx)(`span`,{className:`asOfChip`,children:`As of Jul 8, 2026`})]})}),content:(0,v.jsxs)(h,{padding:0,children:[(0,v.jsx)(`div`,{"aria-live":`polite`,className:`visuallyHidden`,children:L}),(0,v.jsxs)(`div`,{className:`surface`,children:[de,fe,me,(0,v.jsxs)(`section`,{"aria-label":`Recovery ledger`,children:[he,X.length===0?(0,v.jsx)(`div`,{className:`ledgerEmpty`,children:`No cases match the current scope. Clear the bucket chip or pick a different stage — closed cases live under the “Closed” filter and ignore bucket scopes.`}):X.map(e=>{let t=c===e.id,n=N(e),r=x[e.stage],a=M(e),o=E[e.payerId],s=e.stage===`identified`?`sgIdentified`:e.stage===`recovered`?`sgRecovered`:e.stage===`written_off`?`sgWrittenOff`:`sgOpen`;return(0,v.jsxs)(`div`,{children:[(0,v.jsxs)(`button`,{type:`button`,className:`caseRow${n?``:` rowClosed`}`,"aria-expanded":t,"aria-label":`${e.id}, ${o}, ${T[e.reason]}, ${A(e.amountCents)}, ${r.label}${n?`, ${e.daysOut} days outstanding`:`, closed ${e.closedOn}`}. ${t?`Collapse`:`Expand`} evidence packet.`,onClick:()=>l(t=>t===e.id?null:e.id),children:[(0,v.jsx)(`span`,{className:`chev`,"aria-hidden":!0,children:(0,v.jsx)(i,{icon:t?p:m,size:`sm`,color:`inherit`})}),(0,v.jsx)(`span`,{className:`caseId`,children:e.id}),(0,v.jsxs)(`span`,{className:`payerCell`,children:[(0,v.jsx)(`span`,{className:`payerName`,children:o}),(0,v.jsxs)(`span`,{className:`payerSub`,children:[e.claim,` · `,e.owner]})]}),(0,v.jsx)(`span`,{className:`colReason`,children:(0,v.jsx)(`span`,{className:`reasonChip`,title:T[e.reason],children:e.reason})}),(0,v.jsx)(`span`,{className:`agingCell`,children:n?(0,v.jsxs)(v.Fragment,{children:[(0,v.jsxs)(`span`,{className:`agingDays`,children:[e.daysOut,`d`]}),(0,v.jsx)(`span`,{className:`agingChip ${ae(e.daysOut)}`,children:C.find(t=>t.id===w(e.daysOut))?.label??``})]}):(0,v.jsxs)(`span`,{className:`agingDays`,children:[`— `,e.closedOn]})}),(0,v.jsx)(`span`,{className:`colStage`,children:(0,v.jsxs)(`span`,{className:`stageChip ${s}`,children:[r.label,n&&(0,v.jsxs)(`span`,{"aria-hidden":!0,children:[`· `,Math.round(r.probability*100),`%`]})]})}),(0,v.jsx)(`span`,{className:`money cellRight${e.stage===`written_off`?` mMuted`:e.stage===`recovered`?` mRecovered`:` mStrong`}`,children:A(e.amountCents)}),(0,v.jsx)(`span`,{className:`colYield cellRight`,children:(0,v.jsx)(`span`,{className:`money${n?` mYield`:``}`,children:n?A(a):`—`})})]}),t&&ge(e)]},e.id)})]})]})]})})]})}export{L as default};