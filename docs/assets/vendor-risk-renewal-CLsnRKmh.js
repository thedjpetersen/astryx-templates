import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Icon-BmUexiPD.js";import{t as i}from"./archive-CiAPN9cK.js";import{t as a}from"./arrow-up-right-D3Zjq3aQ.js";import{t as o}from"./bell-ring-BsDLOu3p.js";import{t as s}from"./clipboard-check-D8HAF_1A.js";import{t as c}from"./history-BF_kbOcp.js";import{t as l}from"./mail-DPtgyodR.js";import{t as u}from"./shield-alert-7055uYjz.js";import{t as d}from"./undo-2-BjiY7y5-.js";import{o as f,w as p}from"./index-Z40q0Y4M.js";import{n as m,t as h}from"./LayoutContent-CCL91W7X.js";import{t as ee}from"./LayoutHeader-Cy2mWoMf.js";var g=e(t(),1),_=n(),v=`tpl-vendor-risk-renewal`,y=`light-dark(#BE123C, #FB7185)`,b=`light-dark(#FFFFFF, #300711)`,x=`light-dark(rgba(190, 18, 60, 0.08), rgba(251, 113, 133, 0.14))`,S=`light-dark(#15803D, #4ADE80)`,C=`light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))`,w=`light-dark(#92400E, #FBBF24)`,T=`light-dark(rgba(146, 64, 14, 0.10), rgba(251, 191, 36, 0.14))`,E=`light-dark(#B45309, #FDBA74)`,D=`light-dark(rgba(180, 83, 9, 0.10), rgba(253, 186, 116, 0.14))`,O=`light-dark(#B42318, #F97066)`,k=`light-dark(rgba(180, 35, 24, 0.10), rgba(249, 112, 102, 0.14))`,A=new Map([{id:`soc2`,label:`SOC 2 Type II report (FY26)`,weight:3,hint:`Bridge letters accepted to 90 days past period end.`},{id:`pentest`,label:`Annual penetration test summary`,weight:2,hint:`Executive summary + remediation SLAs; full report not required.`},{id:`dpa`,label:`Signed DPA — 2026 template`,weight:2,hint:`Legal reissued the template Mar 2026; pre-2026 signatures are gaps.`},{id:`sig`,label:`SIG Lite questionnaire`,weight:2,hint:`Shared-assessments SIG Lite 2026; scoped answers acceptable.`},{id:`insurance`,label:`Certificate of insurance — cyber $5M`,weight:1,hint:`Must name Vetlane Holdings as certificate holder.`},{id:`subproc`,label:`Subprocessor list review`,weight:1,hint:`Diff against the list attached to the current order form.`},{id:`bcdr`,label:`BC/DR test evidence`,weight:1,hint:`Most recent failover exercise within 12 months.`},{id:`access`,label:`Quarterly access review`,weight:1,hint:`Named-admin roster reconciled against the SSO group.`}].map(e=>[e.id,e])),j=[{id:`lane-30`,label:`Next 30 days`,sublabel:`renewal papers due now`,maxDays:30},{id:`lane-60`,label:`31–60 days`,sublabel:`evidence collection window`,maxDays:60},{id:`lane-90`,label:`61–90 days`,sublabel:`kickoff notices sent`,maxDays:90},{id:`lane-far`,label:`90+ days`,sublabel:`monitoring only`,maxDays:1/0}],M=`Priya Natarajan`,N=`PN`,P=`Jul 9`,F=`Thu Jul 9, 2026`,I=[{id:`streamlyne`,name:`Streamlyne Analytics`,category:`Data platform`,tier:1,renewalDate:`Jul 12, 2026`,daysToRenewal:3,acv:184e3,acvLabel:`$184,000`,owner:`Priya Natarajan`,ownerInitials:`PN`,itemIds:[`soc2`,`pentest`,`dpa`,`sig`,`insurance`,`subproc`,`access`]},{id:`fastpath`,name:`Fastpath Payments`,category:`Payment processing`,tier:1,renewalDate:`Jul 24, 2026`,daysToRenewal:15,acv:312e3,acvLabel:`$312,000`,owner:`Marcus Bell`,ownerInitials:`MB`,itemIds:[`soc2`,`pentest`,`dpa`,`sig`,`insurance`,`access`]},{id:`cloudmoor`,name:`Cloudmoor Hosting`,category:`Infrastructure`,tier:1,renewalDate:`Aug 5, 2026`,daysToRenewal:27,acv:228500,acvLabel:`$228,500`,owner:`Priya Natarajan`,ownerInitials:`PN`,itemIds:[`soc2`,`pentest`,`dpa`,`insurance`,`bcdr`,`access`]},{id:`heliodesk`,name:`Heliodesk CX`,category:`Support suite`,tier:2,renewalDate:`Aug 14, 2026`,daysToRenewal:36,acv:96400,acvLabel:`$96,400`,owner:`Tomás Rivera`,ownerInitials:`TR`,itemIds:[`soc2`,`dpa`,`sig`,`insurance`,`access`]},{id:`quillbase`,name:`Quillbase Docs`,category:`Documentation`,tier:3,renewalDate:`Aug 28, 2026`,daysToRenewal:50,acv:18900,acvLabel:`$18,900`,owner:`Tomás Rivera`,ownerInitials:`TR`,itemIds:[`dpa`,`sig`,`insurance`]},{id:`nimbus`,name:`Nimbus Payroll`,category:`HR & payroll`,tier:1,renewalDate:`Sep 18, 2026`,daysToRenewal:71,acv:142e3,acvLabel:`$142,000`,owner:`Aiko Tanabe`,ownerInitials:`AT`,itemIds:[`soc2`,`pentest`,`dpa`,`insurance`,`access`]},{id:`brightsend`,name:`Brightsend Email`,category:`Marketing comms`,tier:2,renewalDate:`Oct 2, 2026`,daysToRenewal:85,acv:54e3,acvLabel:`$54,000`,owner:`Marcus Bell`,ownerInitials:`MB`,itemIds:[`soc2`,`dpa`,`sig`,`insurance`]},{id:`loomworks`,name:`Loomworks Design Cloud (fka Atelier Loom GmbH)`,category:`Design tooling`,tier:3,renewalDate:`Oct 30, 2026`,daysToRenewal:113,acv:27600,acvLabel:`$27,600`,owner:`Tomás Rivera`,ownerInitials:`TR`,itemIds:[`dpa`,`sig`,`insurance`]},{id:`vantage`,name:`Vantage Legal AI`,category:`Legal research`,tier:2,renewalDate:`Dec 1, 2026`,daysToRenewal:145,acv:88e3,acvLabel:`$88,000`,owner:`Aiko Tanabe`,ownerInitials:`AT`,itemIds:[`soc2`,`dpa`,`sig`,`insurance`]}],L=new Map(I.map(e=>[e.id,e])),R={streamlyne:{soc2:{status:`gap`,stamp:`Expired Apr 30`,note:`FY25 report aged out; FY26 audit fieldwork finished Jun 19 per their CISO.`},pentest:{status:`pending`,stamp:`Requested Jun 24`},dpa:{status:`verified`,stamp:`Verified May 28`},sig:{status:`pending`,stamp:`Requested Jun 24`},insurance:{status:`verified`,stamp:`Verified Jun 2`},subproc:{status:`gap`,stamp:`Stale since Mar 14`,note:`Two new subprocessors announced Jun 30 are not on the reviewed list.`},access:{status:`verified`,stamp:`Verified Jul 1`}},fastpath:{soc2:{status:`verified`,stamp:`Verified Jun 11`},pentest:{status:`verified`,stamp:`Verified Jun 11`},dpa:{status:`verified`,stamp:`Verified Apr 22`},sig:{status:`verified`,stamp:`Verified Jun 11`},insurance:{status:`pending`,stamp:`Requested Jul 2`,note:`Broker reissuing with Vetlane Holdings as certificate holder.`},access:{status:`verified`,stamp:`Verified Jul 6`}},cloudmoor:{soc2:{status:`verified`,stamp:`Verified May 15`},pentest:{status:`gap`,stamp:`Overdue since Jun 1`,note:`Vendor slipped their Q2 test to late July — inside our renewal window.`},dpa:{status:`verified`,stamp:`Verified May 15`},insurance:{status:`verified`,stamp:`Verified May 20`},bcdr:{status:`pending`,stamp:`Requested Jun 30`},access:{status:`verified`,stamp:`Verified Jul 6`}},heliodesk:{soc2:{status:`verified`,stamp:`Verified Jun 4`},dpa:{status:`pending`,stamp:`Sent for signature Jun 26`},sig:{status:`pending`,stamp:`Requested Jun 18`},insurance:{status:`verified`,stamp:`Verified Jun 4`},access:{status:`verified`,stamp:`Verified Jun 30`}},quillbase:{dpa:{status:`verified`,stamp:`Verified May 8`},sig:{status:`verified`,stamp:`Verified May 8`},insurance:{status:`pending`,stamp:`Requested Jul 7`}},nimbus:{soc2:{status:`pending`,stamp:`Requested Jun 12`,note:`Report under NDA portal; access approved, download pending.`},pentest:{status:`verified`,stamp:`Verified Jun 12`},dpa:{status:`verified`,stamp:`Verified Mar 30`},insurance:{status:`verified`,stamp:`Verified Jun 12`},access:{status:`pending`,stamp:`Requested Jul 6`}},brightsend:{soc2:{status:`verified`,stamp:`Verified Jun 20`},dpa:{status:`verified`,stamp:`Verified Jun 20`},sig:{status:`verified`,stamp:`Verified Jun 20`},insurance:{status:`verified`,stamp:`Verified Jun 20`}},loomworks:{dpa:{status:`gap`,stamp:`On 2023 template`,note:`Refused the 2026 template in April; legal drafting a rider instead.`},sig:{status:`verified`,stamp:`Verified Feb 12`},insurance:{status:`verified`,stamp:`Verified Feb 12`}},vantage:{soc2:{status:`pending`,stamp:`Requested Jun 27`},dpa:{status:`verified`,stamp:`Verified Jan 15`},sig:{status:`pending`,stamp:`Requested Jun 27`},insurance:{status:`verified`,stamp:`Verified Jan 15`}}},z=[{id:`led-3`,vendorId:`streamlyne`,text:`Quarterly access review verified — SSO roster reconciled, 2 stale admins removed.`,stamp:`Jul 1`,by:`PN`},{id:`led-2`,vendorId:`cloudmoor`,text:`BC/DR evidence requested via vendor portal; auto-reminder set for Jul 14.`,stamp:`Jun 30`,by:`PN`},{id:`led-1`,vendorId:`streamlyne`,text:`Escalated to Priya Natarajan — SOC 2 gap inside the 45-day window.`,stamp:`Jun 26`,by:`MB`}],B={critical:{label:`Critical`,color:O,tint:k,rank:0},elevated:{label:`Elevated`,color:E,tint:D,rank:1},watch:{label:`Watch`,color:w,tint:T,rank:2},clear:{label:`Clear`,color:S,tint:C,rank:3}},V={verified:{label:`Verified`,color:S,tint:C},pending:{label:`Pending`,color:w,tint:T},gap:{label:`Gap`,color:O,tint:k}};function H(e,t){let n=0,r=0,i=0,a=0,o=0,s=0,c=0;for(let l of e.itemIds){let u=A.get(l),d=t[e.id]?.[l];u===void 0||d===void 0||(a+=u.weight,d.status===`verified`?(n+=u.weight,c+=1):d.status===`pending`?(r+=u.weight,s+=1):(i+=u.weight,o+=1))}let l=e.daysToRenewal,u;return u=i>=3||i>=1&&l<=30?`critical`:i>=1||r>=3&&l<=60?`elevated`:r>=1?`watch`:`clear`,{vendor:e,verifiedWeight:n,pendingWeight:r,gapWeight:i,totalWeight:a,gapCount:o,pendingCount:s,verifiedCount:c,readinessPct:a===0?100:Math.round(n/a*100),grade:u,isEscalated:i>=1&&l<=45}}function U(e){for(let t of j)if(e.daysToRenewal<=t.maxDays)return t.id;return`lane-far`}function W(e){return`$${e.toLocaleString(`en-US`)}`}var te=`
.${v} {
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.${v} *,
.${v} *::before,
.${v} *::after {
  box-sizing: border-box;
}
.${v} button {
  font: inherit;
  color: inherit;
}
.${v} button:focus-visible,
.${v} [role='option']:focus-visible {
  outline: 2px solid ${y};
  outline-offset: 2px;
}

/* ---- header ------------------------------------------------------------ */
.${v}.topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 16px;
}
.${v} .brandCluster {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.${v} .brandMark {
  display: inline-flex;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: ${y};
  color: ${b};
}
.${v} .brandText {
  min-width: 0;
}
.${v} .eyebrow {
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.${v} .pageTitle {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
}
.${v} .asOf {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.${v} .kpiStrip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-inline-start: auto;
}
.${v} .kpiTile {
  display: flex;
  min-height: 64px;
  min-width: 108px;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: 8px 12px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-surface);
}
.${v} .kpiValue {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.${v} .kpiDelta {
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.${v} .kpiLabel {
  font-size: 11px;
  color: var(--color-text-secondary);
}

/* ---- workspace grid ------------------------------------------------------ */
.${v}.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 356px;
  gap: 12px;
  align-items: start;
  width: 100%;
  padding: 12px 16px 20px;
}
.${v} .runwayColumn {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 12px;
}

/* ---- lanes --------------------------------------------------------------- */
.${v} .lane {
  display: grid;
  grid-template-columns: 148px minmax(0, 1fr);
  gap: 12px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-surface);
  padding: 12px;
}
.${v} .laneLabel {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding-top: 2px;
}
.${v} .laneName {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
}
.${v} .laneSub {
  margin: 0;
  font-size: 11px;
  color: var(--color-text-secondary);
}
.${v} .laneStats {
  margin-top: auto;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.${v} .laneTiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(212px, 1fr));
  gap: 12px;
  min-width: 0;
}

/* ---- heat tiles — one <button> each -------------------------------------- */
.${v} .tile {
  position: relative;
  display: flex;
  min-height: 128px;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  border: var(--border-width) solid var(--color-border);
  border-inline-start: 4px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-body);
  text-align: start;
  cursor: pointer;
}
.${v} .tile[aria-pressed='true'] {
  box-shadow: inset 0 0 0 1px ${y}, 0 0 0 2px ${y};
}
@media (hover: hover) {
  .${v} .tile:hover {
    background: ${x};
  }
}
.${v} .tileTop {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.${v} .tileName {
  min-width: 0;
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${v} .tierBadge {
  flex-shrink: 0;
  padding: 1px 6px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${v} .tileMetaRow {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  min-width: 0;
  flex-wrap: wrap;
}
.${v} .daysChip {
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${v} .heatBar {
  display: flex;
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--color-background-muted);
}
.${v} .heatSeg {
  height: 100%;
}
.${v} .tileFoot {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}
.${v} .gradePill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
}
.${v} .footStat {
  color: var(--color-text-secondary);
}
.${v} .footStat strong {
  color: var(--color-text-primary);
  font-weight: 700;
}

/* ---- escalation queue ----------------------------------------------------- */
.${v} .escalation {
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-surface);
  padding: 12px;
}
.${v} .escalationHead {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.${v} .sectionTitle {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
}
.${v} .escalationCount {
  display: inline-flex;
  min-width: 22px;
  justify-content: center;
  padding: 1px 7px;
  border-radius: 999px;
  background: ${k};
  color: ${O};
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.${v} .escalationList {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}
.${v} .escalationRow {
  display: flex;
  min-height: 64px;
  align-items: center;
  gap: 10px;
  padding: 8px 4px;
  border-top: var(--border-width) solid var(--color-border);
}
.${v} .escalationBody {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.${v} .escalationName {
  margin: 0;
  overflow: hidden;
  font-size: 12.5px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${v} .escalationMeta {
  margin: 0;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.${v} .ownerDot {
  display: inline-flex;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--color-background-muted);
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-secondary);
}
.${v} .escalationOpen {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-body);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
@media (hover: hover) {
  .${v} .escalationOpen:hover {
    background: ${x};
  }
}
.${v} .emptyState {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 4px;
  border-top: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 12px;
}
.${v} .emptyState .emptyGlyph {
  color: ${S};
  display: inline-flex;
}

/* ---- attestation pane ------------------------------------------------------ */
.${v} .pane {
  position: sticky;
  top: 12px;
  display: flex;
  min-width: 0;
  flex-direction: column;
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-surface);
}
.${v} .paneHeader {
  display: flex;
  gap: 12px;
  padding: 14px 14px 12px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${v} .paneHeadText {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.${v} .paneVendor {
  margin: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.25;
}
.${v} .paneMeta {
  margin: 0;
  font-size: 11.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.${v} .arcWrap {
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}
.${v} .arcValue {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.${v} .paneToolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 11.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.${v} .undoButton {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  gap: 5px;
  margin-inline-start: auto;
  padding: 4px 10px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-body);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.${v} .undoButton:disabled {
  opacity: 0.45;
  cursor: default;
}
@media (hover: hover) {
  .${v} .undoButton:not(:disabled):hover {
    background: ${x};
  }
}

/* ---- checklist rows --------------------------------------------------------- */
.${v} .checkList {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 4px 14px;
  list-style: none;
}
.${v} .checkRow {
  display: flex;
  min-height: 56px;
  flex-direction: column;
  gap: 6px;
  padding: 10px 0;
}
.${v} .checkRow + .checkRow {
  border-top: var(--border-width) solid var(--color-border);
}
.${v} .checkTop {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
}
.${v} .checkGlyph {
  flex-shrink: 0;
  margin-top: 1px;
  display: inline-flex;
}
.${v} .checkBody {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.${v} .checkLabel {
  margin: 0;
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.3;
}
.${v} .checkStamp {
  margin: 0;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.${v} .checkNote {
  margin: 0;
  font-size: 11px;
  line-height: 1.45;
  color: var(--color-text-secondary);
}
.${v} .weightTag {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  padding-top: 2px;
}
.${v} .checkActions {
  display: flex;
  gap: 6px;
}
.${v} .checkButton {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-body);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.${v} .checkButton.verify {
  border-color: ${S};
  color: ${S};
}
@media (hover: hover) {
  .${v} .checkButton.verify:hover {
    background: ${C};
  }
  .${v} .checkButton.request:hover {
    background: ${T};
  }
}
.${v} .checkButton.request {
  border-color: ${w};
  color: ${w};
}

/* ---- activity ledger ---------------------------------------------------------- */
.${v} .ledger {
  padding: 10px 14px 14px;
  border-top: var(--border-width) solid var(--color-border);
}
.${v} .ledgerList {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
}
.${v} .ledgerRow {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}
.${v} .ledgerText {
  margin: 0;
  min-width: 0;
  flex: 1;
  font-size: 11.5px;
  line-height: 1.45;
  color: var(--color-text-secondary);
}
.${v} .ledgerText strong {
  color: var(--color-text-primary);
  font-weight: 600;
}
.${v} .ledgerStamp {
  flex-shrink: 0;
  font-size: 10.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  padding-top: 1px;
}

/* ---- a11y utility ----------------------------------------------------------- */
.${v} .visuallyHidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ---- responsive subtraction ---------------------------------------------------- */
@media (max-width: 900px) {
  .${v}.workspace {
    grid-template-columns: minmax(0, 1fr);
  }
  .${v} .pane {
    position: static;
  }
  .${v} .lane {
    grid-template-columns: 108px minmax(0, 1fr);
  }
}
@media (max-width: 620px) {
  .${v} .lane {
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
  }
  .${v} .laneLabel {
    flex-direction: row;
    align-items: baseline;
    gap: 8px;
  }
  .${v} .laneStats {
    margin-top: 0;
    margin-inline-start: auto;
  }
  .${v} .kpiStrip {
    width: 100%;
    margin-inline-start: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .${v} .tileMetaRow .acvMeta {
    display: none;
  }
  .${v} .checkActions {
    flex-direction: column;
  }
  .${v} .checkButton {
    justify-content: center;
    width: 100%;
  }
}
@media (prefers-reduced-motion: no-preference) {
  .${v} .tile,
  .${v} .heatSeg,
  .${v} .checkButton,
  .${v} .escalationOpen {
    transition: background-color 120ms ease, box-shadow 120ms ease, flex-grow 160ms ease;
  }
}
`;function ne(){return(0,_.jsxs)(`svg`,{width:`20`,height:`20`,viewBox:`0 0 20 20`,fill:`none`,"aria-hidden":`true`,children:[(0,_.jsx)(`path`,{d:`M10 1.8 16.8 4.4v5.2c0 4.1-2.9 7.2-6.8 8.6-3.9-1.4-6.8-4.5-6.8-8.6V4.4L10 1.8Z`,stroke:`currentColor`,strokeWidth:`1.6`,strokeLinejoin:`round`}),(0,_.jsx)(`path`,{d:`M10 5.6v2.6M10 10.4v2.6`,stroke:`currentColor`,strokeWidth:`1.6`,strokeLinecap:`round`})]})}function re({status:e}){let t=V[e].color;return e===`verified`?(0,_.jsxs)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 16 16`,"aria-hidden":`true`,style:{color:t},children:[(0,_.jsx)(`circle`,{cx:`8`,cy:`8`,r:`7`,fill:`currentColor`,opacity:`0.18`}),(0,_.jsx)(`circle`,{cx:`8`,cy:`8`,r:`7`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`}),(0,_.jsx)(`path`,{d:`m5 8.2 2 2L11 6`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.7`,strokeLinecap:`round`,strokeLinejoin:`round`})]}):e===`pending`?(0,_.jsxs)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 16 16`,"aria-hidden":`true`,style:{color:t},children:[(0,_.jsx)(`circle`,{cx:`8`,cy:`8`,r:`7`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`}),(0,_.jsx)(`path`,{d:`M8 8 V2.6 A5.4 5.4 0 0 1 8 13.4 Z`,fill:`currentColor`,opacity:`0.55`})]}):(0,_.jsxs)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 16 16`,"aria-hidden":`true`,style:{color:t},children:[(0,_.jsx)(`circle`,{cx:`8`,cy:`8`,r:`7`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeDasharray:`3 2.4`}),(0,_.jsx)(`path`,{d:`M8 4.6v4`,stroke:`currentColor`,strokeWidth:`1.7`,strokeLinecap:`round`}),(0,_.jsx)(`circle`,{cx:`8`,cy:`11.4`,r:`1`,fill:`currentColor`})]})}function ie({pct:e,color:t}){let n=2*Math.PI*26,r=e/100*n;return(0,_.jsxs)(`svg`,{width:`64`,height:`64`,viewBox:`0 0 64 64`,"aria-hidden":`true`,children:[(0,_.jsx)(`circle`,{cx:`32`,cy:`32`,r:26,fill:`none`,stroke:`var(--color-background-muted)`,strokeWidth:`6`}),(0,_.jsx)(`circle`,{cx:`32`,cy:`32`,r:26,fill:`none`,stroke:t,strokeWidth:`6`,strokeLinecap:`round`,strokeDasharray:`${r} ${n-r}`,transform:`rotate(-90 32 32)`})]})}function G({value:e,delta:t,label:n,tone:r}){return(0,_.jsxs)(`div`,{className:`kpiTile`,children:[(0,_.jsxs)(`span`,{className:`kpiValue`,style:r===void 0?void 0:{color:r},children:[e,t!==void 0&&(0,_.jsx)(`span`,{className:`kpiDelta`,style:{color:S},children:t})]}),(0,_.jsx)(`span`,{className:`kpiLabel`,children:n})]})}function ae({derived:e,isSelected:t,onSelect:n}){let{vendor:r,grade:i}=e,a=B[i],o=r.daysToRenewal<=30;return(0,_.jsxs)(`button`,{type:`button`,className:`tile`,style:{borderInlineStartColor:a.color},"aria-pressed":t,"aria-label":`${r.name} — ${a.label}, renews ${r.renewalDate} in ${r.daysToRenewal} days, ${e.gapCount} gaps, ${e.readinessPct}% ready`,onClick:()=>n(r.id),children:[(0,_.jsxs)(`span`,{className:`tileTop`,children:[(0,_.jsx)(`span`,{className:`tileName`,children:r.name}),(0,_.jsxs)(`span`,{className:`tierBadge`,children:[`T`,r.tier]})]}),(0,_.jsxs)(`span`,{className:`tileMetaRow`,children:[(0,_.jsxs)(`span`,{className:`daysChip`,style:{background:o?k:`var(--color-background-muted)`,color:o?O:`var(--color-text-secondary)`},children:[r.daysToRenewal,`d`]}),(0,_.jsx)(`span`,{children:r.renewalDate}),(0,_.jsxs)(`span`,{className:`acvMeta`,children:[`· `,r.acvLabel,` ACV`]})]}),(0,_.jsxs)(`span`,{className:`heatBar`,"aria-hidden":`true`,children:[(0,_.jsx)(`span`,{className:`heatSeg`,style:{flexGrow:e.verifiedWeight,backgroundColor:S}}),(0,_.jsx)(`span`,{className:`heatSeg`,style:{flexGrow:e.pendingWeight,backgroundColor:w}}),(0,_.jsx)(`span`,{className:`heatSeg`,style:{flexGrow:e.gapWeight,backgroundColor:O}})]}),(0,_.jsxs)(`span`,{className:`tileFoot`,children:[(0,_.jsx)(`span`,{className:`gradePill`,style:{background:a.tint,color:a.color},children:a.label}),(0,_.jsxs)(`span`,{className:`footStat`,children:[(0,_.jsxs)(`strong`,{children:[e.readinessPct,`%`]}),` ready`]}),(0,_.jsxs)(`span`,{className:`footStat`,children:[(0,_.jsx)(`strong`,{children:e.gapCount}),` `,e.gapCount===1?`gap`:`gaps`]})]})]})}function K(){let[e,t]=(0,g.useState)(R),[n,y]=(0,g.useState)(`streamlyne`),[b,x]=(0,g.useState)(z),[C,w]=(0,g.useState)([]),[T,E]=(0,g.useState)(``),D=(0,g.useRef)(100),k=(0,g.useMemo)(()=>{let t=new Map;for(let n of I)t.set(n.id,H(n,e));return t},[e]),K=(0,g.useMemo)(()=>[...k.values()],[k]),q=(0,g.useMemo)(()=>{let e=0,t=0,n=0,r=0;for(let i of K)e+=i.verifiedWeight,t+=i.totalWeight,n+=i.gapCount,i.isEscalated&&(r+=1);let i=I.filter(e=>e.daysToRenewal<=30);return{readinessPct:t===0?100:Math.round(e/t*100),verifiedWeight:e,totalWeight:t,gapItems:n,escalations:r,dueSoonCount:i.length,bookTotal:I.reduce((e,t)=>e+t.acv,0)}},[K]),J=(0,g.useMemo)(()=>K.filter(e=>e.isEscalated).sort((e,t)=>e.vendor.daysToRenewal-t.vendor.daysToRenewal),[K]),Y=k.get(n)??K[0],X=Y.vendor,Z=b.filter(e=>e.vendorId===X.id),Q=(n,r,i)=>{let a=L.get(n),o=A.get(r),s=e[n]?.[r];if(a===void 0||o===void 0||s===void 0)return;let c=H(a,e).isEscalated,l=i===`verified`?{status:`verified`,stamp:`Verified ${P}`}:{status:`pending`,stamp:`Requested ${P}`},u={...e,[n]:{...e[n],[r]:l}};D.current+=1;let d=`led-${D.current}`,f=i===`verified`?`verified`:`requested from vendor`,p={id:d,vendorId:n,text:`${o.label} ${f}.`,stamp:P,by:N};t(u),x(e=>[p,...e]),w(e=>[{vendorId:n,itemId:r,prev:s,ledgerId:d},...e]);let m=H(a,u),h=[`${o.label} ${f} for ${a.name}.`,`Vendor now ${m.readinessPct}% ready, grade ${B[m.grade].label}.`];c&&!m.isEscalated&&h.push(`Removed from the escalation queue.`),E(h.join(` `))},oe=()=>{let e=C[0];if(e===void 0)return;t(t=>({...t,[e.vendorId]:{...t[e.vendorId],[e.itemId]:e.prev}})),x(t=>t.filter(t=>t.id!==e.ledgerId)),w(e=>e.slice(1));let n=A.get(e.itemId);E(`Undid the last attestation change${n===void 0?``:` on ${n.label}`}.`)},$=B[Y.grade];return(0,_.jsx)(`div`,{style:{height:`100dvh`,width:`100%`},children:(0,_.jsxs)(m,{height:`fill`,children:[(0,_.jsx)(`style`,{children:te}),(0,_.jsx)(ee,{children:(0,_.jsxs)(`div`,{className:`${v} topbar`,children:[(0,_.jsxs)(`div`,{className:`brandCluster`,children:[(0,_.jsx)(`span`,{className:`brandMark`,children:(0,_.jsx)(ne,{})}),(0,_.jsxs)(`div`,{className:`brandText`,children:[(0,_.jsx)(`p`,{className:`eyebrow`,children:`Vetlane / Third-party risk`}),(0,_.jsx)(`h1`,{className:`pageTitle`,children:`Renewal runway`}),(0,_.jsxs)(`p`,{className:`asOf`,children:[`As of `,F,` · `,I.length,` vendors in book`]})]})]}),(0,_.jsxs)(`div`,{className:`kpiStrip`,role:`group`,"aria-label":`Portfolio attestation metrics`,children:[(0,_.jsx)(G,{value:`${q.readinessPct}%`,label:`Portfolio readiness · ${q.verifiedWeight}/${q.totalWeight} wt`}),(0,_.jsx)(G,{value:String(q.gapItems),label:`Open gaps`,tone:q.gapItems>0?O:S}),(0,_.jsx)(G,{value:String(q.escalations),label:`Escalations`,tone:q.escalations>0?O:S}),(0,_.jsx)(G,{value:String(q.dueSoonCount),label:`Renewals ≤ 30d`}),(0,_.jsx)(G,{value:W(q.bookTotal),label:`Renewal book ACV`})]})]})}),(0,_.jsx)(h,{children:(0,_.jsxs)(`div`,{className:`${v} workspace`,children:[(0,_.jsx)(`div`,{"aria-live":`polite`,className:`${v} visuallyHidden`,children:T}),(0,_.jsxs)(`div`,{className:`runwayColumn`,children:[j.map(e=>{let t=K.filter(t=>U(t.vendor)===e.id).sort((e,t)=>e.vendor.daysToRenewal-t.vendor.daysToRenewal),r=t.reduce((e,t)=>e+t.vendor.acv,0);return(0,_.jsxs)(`section`,{className:`lane`,"aria-label":`Renewals ${e.label}`,children:[(0,_.jsxs)(`div`,{className:`laneLabel`,children:[(0,_.jsx)(`h2`,{className:`laneName`,children:e.label}),(0,_.jsx)(`p`,{className:`laneSub`,children:e.sublabel}),(0,_.jsxs)(`p`,{className:`laneStats`,children:[t.length,` `,t.length===1?`vendor`:`vendors`,` ·`,` `,W(r)]})]}),(0,_.jsx)(`div`,{className:`laneTiles`,children:t.map(e=>(0,_.jsx)(ae,{derived:e,isSelected:e.vendor.id===n,onSelect:y},e.vendor.id))})]},e.id)}),(0,_.jsxs)(`section`,{className:`escalation`,"aria-label":`Escalation queue`,children:[(0,_.jsxs)(`div`,{className:`escalationHead`,children:[(0,_.jsx)(r,{icon:o,size:`sm`,color:`secondary`}),(0,_.jsx)(`h2`,{className:`sectionTitle`,children:`Escalation queue`}),(0,_.jsx)(`span`,{className:`escalationCount`,children:J.length}),(0,_.jsx)(`span`,{className:`laneSub`,style:{marginInlineStart:`auto`},children:`gap weight ≥ 1 inside 45 days`})]}),J.length===0?(0,_.jsxs)(`div`,{className:`emptyState`,children:[(0,_.jsx)(`span`,{className:`emptyGlyph`,children:(0,_.jsx)(r,{icon:s,size:`sm`,color:`inherit`})}),`No open escalations — every renewal inside 45 days is gap-free.`]}):(0,_.jsx)(`ul`,{className:`escalationList`,children:J.map(t=>{let n=t.vendor.itemIds.filter(n=>e[t.vendor.id]?.[n]?.status===`gap`).map(e=>A.get(e)?.label??e);return(0,_.jsxs)(`li`,{className:`escalationRow`,children:[(0,_.jsx)(`span`,{style:{display:`inline-flex`,flexShrink:0,color:O},"aria-hidden":`true`,children:(0,_.jsx)(r,{icon:u,size:`sm`,color:`inherit`})}),(0,_.jsxs)(`div`,{className:`escalationBody`,children:[(0,_.jsx)(`p`,{className:`escalationName`,children:t.vendor.name}),(0,_.jsxs)(`p`,{className:`escalationMeta`,children:[`Renews `,t.vendor.renewalDate,` · `,t.vendor.daysToRenewal,`d · blocking: `,n.join(` · `)]})]}),(0,_.jsx)(`span`,{className:`ownerDot`,title:`Owner: ${t.vendor.owner}`,children:t.vendor.ownerInitials}),(0,_.jsxs)(`button`,{type:`button`,className:`escalationOpen`,onClick:()=>y(t.vendor.id),children:[`Open checklist`,(0,_.jsx)(r,{icon:a,size:`xsm`})]})]},t.vendor.id)})})]})]}),(0,_.jsxs)(`aside`,{className:`pane`,"aria-label":`Attestation checklist for ${X.name}`,children:[(0,_.jsxs)(`div`,{className:`paneHeader`,children:[(0,_.jsxs)(`div`,{className:`paneHeadText`,children:[(0,_.jsx)(`h2`,{className:`paneVendor`,children:X.name}),(0,_.jsxs)(`p`,{className:`paneMeta`,children:[`Tier `,X.tier,` · `,X.category,` · `,X.acvLabel,` `,`ACV`]}),(0,_.jsxs)(`p`,{className:`paneMeta`,children:[`Renews `,X.renewalDate,` (`,X.daysToRenewal,`d) · owner`,` `,X.owner]}),(0,_.jsxs)(`p`,{className:`paneMeta`,children:[(0,_.jsx)(`span`,{className:`gradePill`,style:{background:$.tint,color:$.color},children:$.label}),` `,Y.verifiedCount,` verified · `,Y.pendingCount,` pending ·`,` `,Y.gapCount,` `,Y.gapCount===1?`gap`:`gaps`]})]}),(0,_.jsxs)(`div`,{className:`arcWrap`,"aria-hidden":`true`,children:[(0,_.jsx)(ie,{pct:Y.readinessPct,color:$.color}),(0,_.jsxs)(`span`,{className:`arcValue`,children:[Y.readinessPct,`%`]})]})]}),(0,_.jsxs)(`div`,{className:`paneToolbar`,children:[(0,_.jsxs)(`span`,{children:[`Weighted `,Y.verifiedWeight,`/`,Y.totalWeight,` · signed in as`,` `,M]}),(0,_.jsxs)(`button`,{type:`button`,className:`undoButton`,onClick:oe,disabled:C.length===0,children:[(0,_.jsx)(r,{icon:d,size:`xsm`}),`Undo`]})]}),(0,_.jsx)(`ul`,{className:`checkList`,children:X.itemIds.map(t=>{let n=A.get(t),i=e[X.id]?.[t];if(n===void 0||i===void 0)return null;let a=V[i.status];return(0,_.jsxs)(`li`,{className:`checkRow`,children:[(0,_.jsxs)(`div`,{className:`checkTop`,children:[(0,_.jsx)(`span`,{className:`checkGlyph`,children:(0,_.jsx)(re,{status:i.status})}),(0,_.jsxs)(`div`,{className:`checkBody`,children:[(0,_.jsx)(`p`,{className:`checkLabel`,children:n.label}),(0,_.jsxs)(`p`,{className:`checkStamp`,style:{color:a.color},children:[a.label,` · `,i.stamp]}),i.note!==void 0&&(0,_.jsx)(`p`,{className:`checkNote`,children:i.note})]}),(0,_.jsxs)(`span`,{className:`weightTag`,children:[`×`,n.weight]})]}),i.status!==`verified`&&(0,_.jsxs)(`div`,{className:`checkActions`,children:[(0,_.jsxs)(`button`,{type:`button`,className:`checkButton verify`,onClick:()=>Q(X.id,t,`verified`),children:[(0,_.jsx)(r,{icon:p,size:`xsm`}),`Record attestation`]}),i.status===`gap`&&(0,_.jsxs)(`button`,{type:`button`,className:`checkButton request`,onClick:()=>Q(X.id,t,`pending`),children:[(0,_.jsx)(r,{icon:l,size:`xsm`}),`Request evidence`]})]})]},t)})}),(0,_.jsxs)(`div`,{className:`ledger`,children:[(0,_.jsxs)(`div`,{className:`escalationHead`,style:{marginBottom:0},children:[(0,_.jsx)(r,{icon:c,size:`sm`,color:`secondary`}),(0,_.jsx)(`h2`,{className:`sectionTitle`,children:`Activity`})]}),Z.length===0?(0,_.jsxs)(`p`,{className:`ledgerText`,style:{marginTop:8},children:[(0,_.jsx)(`span`,{style:{display:`inline-flex`,verticalAlign:`-2px`,marginInlineEnd:6},children:(0,_.jsx)(r,{icon:i,size:`xsm`,color:`secondary`})}),`No activity logged for this vendor yet.`]}):(0,_.jsx)(`ul`,{className:`ledgerList`,children:Z.map(e=>(0,_.jsxs)(`li`,{className:`ledgerRow`,children:[(0,_.jsx)(`span`,{className:`ownerDot`,style:{width:22,height:22},children:e.by}),(0,_.jsx)(`p`,{className:`ledgerText`,children:e.text}),(0,_.jsx)(`span`,{className:`ledgerStamp`,children:e.stamp})]},e.id))}),Y.gapCount>0&&(0,_.jsxs)(`p`,{className:`ledgerText`,style:{marginTop:10},children:[(0,_.jsx)(`span`,{style:{display:`inline-flex`,verticalAlign:`-2px`,marginInlineEnd:6,color:O},children:(0,_.jsx)(r,{icon:f,size:`xsm`,color:`inherit`})}),(0,_.jsxs)(`strong`,{children:[Y.gapCount,` `,Y.gapCount===1?`gap blocks`:`gaps block`,` `,`renewal sign-off.`]}),` `,`Recording an attestation clears it from the heat bar, re-derives the portfolio readiness stat, and updates the escalation queue.`]})]})]})]})})]})})}export{K as default};