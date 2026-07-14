import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-DoyyW0Xq.js";import{t as i}from"./Icon-Cbr2QWU5.js";import{t as a}from"./arrow-left-CNa18LST.js";import{t as o}from"./arrow-right-CkxqNtnn.js";import{t as s}from"./circle-alert-DH9LgxJm.js";import{t as c}from"./rocket-Dd-Lyoqf.js";import{t as l}from"./shield-alert-C7r1haKS.js";import{t as u}from"./user-round-x-Bzh_n_2j.js";import{a as d,i as f,w as p}from"./index-BwFrdgVW.js";import{t as m}from"./HStack-2WTukjNp.js";import{t as h}from"./VStack-B8U-hI0Y.js";import{t as g}from"./StackItem-Ca9P7L2I.js";import{n as ee,t as te}from"./LayoutContent-CCL91W7X.js";import{t as _}from"./LayoutHeader-Cy2mWoMf.js";import{t as v}from"./Heading-CEfXHtdE.js";import{t as y}from"./useMediaQuery-BvG63aw7.js";import{t as b}from"./Button-DdhUiDLb.js";import{t as x}from"./Divider-BHIBe6GQ.js";import{t as S}from"./Token-JT3SYFA7.js";import{t as C}from"./Avatar-DyaNw-yT.js";var w=e(t(),1),T=n(),E=`light-dark(#E4573D, #FF8C73)`,D=`light-dark(#B93A24, #FF9B85)`,O=`light-dark(rgba(228, 87, 61, 0.16), rgba(255, 140, 115, 0.20))`,ne=`var(--color-data-categorical-green, light-dark(#0B991F, #34C759))`,k=`var(--color-data-categorical-orange, light-dark(#B45309, #FBBF24))`,A=`light-dark(rgba(180, 83, 9, 0.10), rgba(251, 191, 36, 0.16))`,j=`light-dark(#DC2626, #F87171)`,M=`light-dark(rgba(220, 38, 38, 0.08), rgba(248, 113, 113, 0.14))`,N=`light-dark(rgba(60, 60, 67, 0.14), rgba(235, 235, 245, 0.16))`,P=12,F=`var(--font-family-code, ui-monospace, monospace)`,I=`tpl-feature-adoption-cohort`,re=`
.${I} {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.${I} button {
  font-family: inherit;
}
.${I} .fac-fade {
  transition: background-color 160ms ease, opacity 160ms ease, border-color 160ms ease, color 160ms ease;
}
.${I} .fac-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.${I} .fac-row:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}
@media (prefers-reduced-motion: reduce) {
  .${I} .fac-fade { transition: none; }
}

/* ---- header bar 48px ---------------------------------------------------- */
.${I} .fac-header-bar {
  display: flex;
  align-items: center;
  gap: ${P}px;
  height: 48px;
  padding: 0 ${P}px;
}
.${I} .fac-mono {
  font-family: ${F};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${I} .fac-section-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${I} .fac-header-stat {
  font-family: ${F};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* ---- view root + main column -------------------------------------------- */
.${I} .fac-view-root {
  display: flex;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  position: relative;
}
.${I} .fac-main-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* ---- funnel band 184px = 44 headers + 128 svg + 12 pad ------------------- */
.${I} .fac-funnel-band {
  /* Content-sized to exactly 44 + 128 + 12 = 184px; the hairline border
     sits outside the sum so the SVG never loses its last row of pixels. */
  flex-shrink: 0;
  padding: 0 ${P}px ${P}px;
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
}
.${I} .fac-funnel-headers {
  display: flex;
  height: 44px;
  flex-shrink: 0;
}
.${I} .fac-stage-head {
  appearance: none;
  border: none;
  background: transparent;
  flex: 1;
  min-width: 0;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  color: var(--color-text-primary);
  border-radius: var(--radius-container, 8px);
}
.${I} .fac-stage-head[aria-pressed='true'] {
  background-color: var(--color-background-muted);
}
.${I} .fac-stage-count {
  font-family: ${F};
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}
.${I} .fac-stage-share {
  font-family: ${F};
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${I} .fac-stage-label {
  font-size: 12px;
  white-space: nowrap;
}
.${I} .fac-funnel-svg-wrap {
  height: 128px;
  flex-shrink: 0;
}

/* ---- toolbar 40px --------------------------------------------------------- */
.${I} .fac-toolbar {
  display: flex;
  align-items: center;
  gap: ${P/2}px;
  height: 40px;
  padding: 0 ${P}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
  overflow: hidden;
}
.${I} .fac-chip {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background);
  font-size: 11px;
  font-family: ${F};
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}
.${I} .fac-chip[aria-pressed='true'] {
  border-color: ${D};
  background-color: ${O};
}
.${I} .fac-chip-blocked[aria-pressed='true'] {
  border-color: ${k};
  background-color: ${A};
}

/* ---- account table -------------------------------------------------------- */
.${I} .fac-table-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.${I} .fac-thead {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 ${P}px;
  background-color: var(--color-background);
  border-bottom: var(--border-width) solid var(--color-border);
  box-sizing: border-box;
}
.${I} .fac-row {
  appearance: none;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  width: 100%;
  height: 44px;
  padding: 0 ${P}px 0 0;
  cursor: pointer;
  text-align: left;
  color: var(--color-text-primary);
  border-bottom: var(--border-width) solid var(--color-border);
  box-sizing: border-box;
}
.${I} .fac-row[aria-pressed='true'] {
  background-color: var(--color-background-muted);
}
.${I} .fac-row-accent {
  width: 3px;
  align-self: stretch;
  flex-shrink: 0;
  margin-right: ${P-3}px;
}
.${I} .fac-cell-account {
  display: flex;
  align-items: center;
  gap: ${P/2}px;
  flex: 1;
  min-width: 140px;
}
.${I} .fac-account-name {
  font-size: 13px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${I} .fac-cell {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 5px;
}
.${I} .fac-cell-num {
  justify-content: flex-end;
  font-family: ${F};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.${I} .fac-blocker-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 20px;
  padding: 0 7px;
  border-radius: 999px;
  border: var(--border-width) solid ${k};
  background-color: ${A};
  color: ${k};
  font-size: 11px;
  white-space: nowrap;
  max-width: 148px;
  overflow: hidden;
}
.${I} .fac-blocker-chip > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${I} .fac-blocker-pip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: var(--border-width) solid ${k};
  background-color: ${A};
  color: ${k};
  font-family: ${F};
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

/* ---- footer strip 32px ----------------------------------------------------- */
.${I} .fac-footer-strip {
  display: flex;
  align-items: center;
  gap: ${P}px;
  height: 32px;
  padding: 0 ${P}px;
  border-top: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
  overflow: hidden;
}
.${I} .fac-legend-key {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  color: var(--color-text-secondary);
  font-size: 11px;
}

/* ---- aside ------------------------------------------------------------------ */
.${I} .fac-aside {
  flex: none;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-left: var(--border-width) solid var(--color-border);
  background-color: var(--color-background);
  box-sizing: border-box;
}
.${I} .fac-aside-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 340px;
  z-index: 5;
  box-shadow: var(--shadow-overlay, 0 8px 24px rgba(0, 0, 0, 0.18));
}
.${I} .fac-aside-identity {
  display: flex;
  align-items: center;
  gap: ${P}px;
  height: 64px;
  padding: 0 ${P}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
  box-sizing: border-box;
}
.${I} .fac-aside-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${P}px;
}
.${I} .fac-aside-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${P/2}px;
  height: 48px;
  padding: 0 ${P}px;
  border-top: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
  box-sizing: border-box;
}
.${I} .fac-metric-row {
  display: flex;
  align-items: center;
  gap: ${P}px;
  min-height: 44px;
  padding: 0 ${P/2}px;
  box-sizing: border-box;
}
.${I} .fac-metric-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  width: 96px;
  flex-shrink: 0;
}
.${I} .fac-stage-path {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 ${P/2}px;
}
.${I} .fac-stage-path-seg {
  flex: 1;
  height: 3px;
  border-radius: 999px;
  background-color: var(--color-border);
}
.${I} .fac-util-track {
  position: relative;
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background-color: ${N};
  overflow: hidden;
}
.${I} .fac-util-fill {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  border-radius: 999px;
}
.${I} .fac-action-panel {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  padding: ${P}px;
  display: flex;
  flex-direction: column;
  gap: ${P/2}px;
}
.${I} .fac-refusal {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: ${P/2}px;
  border-radius: var(--radius-container, 8px);
  background-color: ${M};
  color: ${j};
  font-size: 12px;
}
.${I} .fac-blocker-row {
  display: flex;
  align-items: center;
  gap: ${P/2}px;
  min-height: 40px;
  padding: 0 ${P/2}px;
}
.${I} .fac-log-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 0;
}
.${I} .fac-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${P/2}px;
  padding: ${P*2}px;
  text-align: center;
}
.${I} .fac-visually-hidden {
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

/* ---- 390px embed iframe (viewport queries DO fire there) ------------------- */
@media (max-width: 720px) {
  .${I} .fac-cell-arr { display: none; }
  .${I} .fac-stage-share { display: none; }
  .${I} .fac-stage-label { font-size: 10px; }
  .${I} .fac-aside-overlay { width: min(340px, 100vw); }
  .${I} .fac-header-stat { display: none; }
}
`,L=[{id:`invited`,label:`Invited`,short:`INV`,definition:`Beta access granted, nothing published yet`},{id:`activated`,label:`Activated`,short:`ACT`,definition:`First automation published and run`},{id:`habitual`,label:`Habitual`,short:`HAB`,definition:`4+ runs per week for 4 consecutive weeks`},{id:`expanded`,label:`Expanded`,short:`EXP`,definition:`Add-on seats purchased on an expansion order`}],R={invited:0,activated:1,habitual:2,expanded:3},z=4,B=4,V=.8,H={mara:{name:`Mara Ellison`,role:`Growth PM`,initials:`ME`},jonah:{name:`Jonah Reyes`,role:`CSM`},priya:{name:`Priya Natarajan`,role:`CSM`},sam:{name:`Sam Whitcomb`,role:`CSM`}},U=`9 Jul 2026 · 15:04`,W={"BLK-11":{id:`BLK-11`,kind:`technical`,label:`SSO SAML misconfig`,detail:`SAML assertion rejects the Automation Studio audience URI; their IdP admin has the corrected metadata but has not redeployed.`},"BLK-14":{id:`BLK-14`,kind:`security`,label:`Security review pending`,detail:`Legal ops will not enable outbound webhooks until the vendor security questionnaire clears their review board (meets Tuesdays).`},"BLK-17":{id:`BLK-17`,kind:`champion`,label:`Champion departed`,detail:`Admin owner left the company 26 Jun; no replacement admin has accepted the workspace-owner invite yet.`}},ie=[{id:`ACC-1401`,name:`Northwind Logistics`,tier:`Growth`,stage:`invited`,arrDisplay:`$96K`,arrK:96,seatsUsed:18,seatsLicensed:40,automationsPublished:1,weeklyRuns:[0,0,0,1,0,2,1,0],lastActivity:`6 Jul 2026`,csm:H.jonah.name,champion:`Dee Halvorsen`,blockers:[W[`BLK-11`]],activity:[{stamp:`22 Jun 2026 · 10:12`,actor:H.jonah.name,text:`Beta access granted; kickoff call booked.`},{stamp:`30 Jun 2026 · 16:40`,actor:H.jonah.name,text:`First automation published, but SSO blocks the run scheduler for non-admin users. Raised BLK-11.`},{stamp:`6 Jul 2026 · 09:05`,actor:`Cohora`,text:`Usage ping: 1 manual run this week, scheduler still gated.`}]},{id:`ACC-1379`,name:`Halcyon Credit Union`,tier:`Enterprise`,stage:`invited`,arrDisplay:`$132K`,arrK:132,seatsUsed:44,seatsLicensed:120,automationsPublished:0,weeklyRuns:[0,0,1,0,0,0,1,1],lastActivity:`3 Jul 2026`,csm:H.priya.name,champion:`Marcus Oyelaran`,blockers:[],activity:[{stamp:`15 Jun 2026 · 11:00`,actor:H.priya.name,text:`Invited to the Q3 cohort; champion wants a sandbox walkthrough before publishing anything.`},{stamp:`3 Jul 2026 · 14:22`,actor:H.priya.name,text:`Walkthrough done. Drafting a loan-doc routing automation, not yet published.`}]},{id:`ACC-1412`,name:`Bluepeak Manufacturing Cooperative of Saskatchewan`,tier:`Growth`,stage:`invited`,arrDisplay:`$84K`,arrK:84,seatsUsed:9,seatsLicensed:35,automationsPublished:0,weeklyRuns:[0,0,0,0,0,0,0,0],lastActivity:`18 Jun 2026`,csm:H.sam.name,champion:`Renate Kowalczyk`,blockers:[],activity:[{stamp:`18 Jun 2026 · 13:30`,actor:H.sam.name,text:`Access granted at renewal. No logins since the kickoff email; flagged for a re-engagement sequence.`}]},{id:`ACC-1355`,name:`Veritable Insurance Group`,tier:`Enterprise`,stage:`invited`,arrDisplay:`$210K`,arrK:210,seatsUsed:82,seatsLicensed:150,automationsPublished:1,weeklyRuns:[0,0,0,0,1,2,2,3],lastActivity:`8 Jul 2026`,csm:H.priya.name,champion:`Ines Fabbri`,blockers:[],activity:[{stamp:`11 Jun 2026 · 09:15`,actor:H.priya.name,text:`Invited; claims-intake team is the target squad.`},{stamp:`2 Jul 2026 · 15:48`,actor:`Cohora`,text:`First automation published: "FNOL intake triage". 3 runs last week.`},{stamp:`8 Jul 2026 · 10:02`,actor:H.priya.name,text:`Champion confirms the triage flow is in daily use — ready for activation verification.`}]},{id:`ACC-1420`,name:`Orbital Freight`,tier:`Growth`,stage:`invited`,arrDisplay:`$58K`,arrK:58,seatsUsed:12,seatsLicensed:20,automationsPublished:0,weeklyRuns:[0,1,0,0,1,0,0,1],lastActivity:`30 Jun 2026`,csm:H.jonah.name,champion:`Theo Brandt`,blockers:[],activity:[{stamp:`30 Jun 2026 · 11:55`,actor:H.jonah.name,text:`Champion exploring templates; wants the carrier-update recipe we shipped in June.`}]},{id:`ACC-1288`,name:`Helix Biosystems`,tier:`Enterprise`,stage:`activated`,arrDisplay:`$176K`,arrK:176,seatsUsed:61,seatsLicensed:80,automationsPublished:4,weeklyRuns:[0,2,4,5,6,5,7,6],lastActivity:`8 Jul 2026`,csm:H.priya.name,champion:`Dr. Lena Okafor`,blockers:[],activity:[{stamp:`26 May 2026 · 10:30`,actor:`Cohora`,text:`Activation: "Sample-batch QC alerts" published and run.`},{stamp:`23 Jun 2026 · 09:12`,actor:H.priya.name,text:`Lab ops added three more automations; runs holding above threshold four weeks straight.`},{stamp:`8 Jul 2026 · 08:44`,actor:`Cohora`,text:`Habit signal: 6 runs last week, 4-week streak intact.`}]},{id:`ACC-1307`,name:`Cinder Analytics`,tier:`Growth`,stage:`activated`,arrDisplay:`$64K`,arrK:64,seatsUsed:14,seatsLicensed:25,automationsPublished:2,weeklyRuns:[0,1,2,3,5,2,4,3],lastActivity:`7 Jul 2026`,csm:H.sam.name,champion:`Beatriz Lunde`,blockers:[],activity:[{stamp:`9 Jun 2026 · 14:20`,actor:`Cohora`,text:`Activation: "Weekly churn digest" published.`},{stamp:`7 Jul 2026 · 17:01`,actor:H.sam.name,text:`Usage is spiky — runs dip whenever their data-refresh job slips. Not habit-eligible yet.`}]},{id:`ACC-1264`,name:`Marlowe & Voss LLP`,tier:`Growth`,stage:`activated`,arrDisplay:`$88K`,arrK:88,seatsUsed:22,seatsLicensed:30,automationsPublished:3,weeklyRuns:[1,2,3,4,4,3,5,4],lastActivity:`6 Jul 2026`,csm:H.jonah.name,champion:`Gideon Marlowe`,blockers:[W[`BLK-14`]],activity:[{stamp:`2 Jun 2026 · 09:40`,actor:`Cohora`,text:`Activation: "Matter-intake conflict check" published.`},{stamp:`24 Jun 2026 · 12:15`,actor:H.jonah.name,text:`Webhook automations blocked pending the security review board — raised BLK-14.`}]},{id:`ACC-1332`,name:`Copperline Energy`,tier:`Enterprise`,stage:`activated`,arrDisplay:`$142K`,arrK:142,seatsUsed:47,seatsLicensed:90,automationsPublished:5,weeklyRuns:[1,3,4,4,5,6,4,5],lastActivity:`9 Jul 2026`,csm:H.priya.name,champion:`Anya Petrenko`,blockers:[],activity:[{stamp:`19 May 2026 · 15:00`,actor:`Cohora`,text:`Activation: "Outage-ticket escalation" published.`},{stamp:`9 Jul 2026 · 07:58`,actor:`Cohora`,text:`Habit signal: 4-week streak at or above 4 runs/week.`}]},{id:`ACC-1298`,name:`Atlas Parcel`,tier:`Growth`,stage:`activated`,arrDisplay:`$120K`,arrK:120,seatsUsed:33,seatsLicensed:50,automationsPublished:3,weeklyRuns:[0,1,3,4,4,5,5,4],lastActivity:`8 Jul 2026`,csm:H.sam.name,champion:`Kofi Mensah`,blockers:[],activity:[{stamp:`3 Jun 2026 · 10:05`,actor:`Cohora`,text:`Activation: "Failed-delivery rebook" published.`},{stamp:`8 Jul 2026 · 16:30`,actor:H.sam.name,text:`Depot leads asking for run quotas — good habit signal, watch seat counts.`}]},{id:`ACC-1341`,name:`Fernbrook Health`,tier:`Enterprise`,stage:`activated`,arrDisplay:`$154K`,arrK:154,seatsUsed:58,seatsLicensed:110,automationsPublished:2,weeklyRuns:[0,2,3,3,4,5,6,5],lastActivity:`7 Jul 2026`,csm:H.jonah.name,champion:`Sana Qureshi`,blockers:[],activity:[{stamp:`10 Jun 2026 · 13:45`,actor:`Cohora`,text:`Activation: "Referral fax-to-task" published.`},{stamp:`7 Jul 2026 · 11:20`,actor:H.jonah.name,text:`Clinic ops runs it every intake shift now; four straight weeks above threshold.`}]},{id:`ACC-1150`,name:`Quill Commerce`,tier:`Growth`,stage:`habitual`,arrDisplay:`$98K`,arrK:98,seatsUsed:31,seatsLicensed:60,automationsPublished:7,weeklyRuns:[4,5,5,6,5,7,6,6],lastActivity:`9 Jul 2026`,csm:H.sam.name,champion:`Yuki Tanaka`,blockers:[],activity:[{stamp:`28 Apr 2026 · 09:00`,actor:`Cohora`,text:`Promoted to Habitual — 4-week streak confirmed.`},{stamp:`9 Jul 2026 · 08:15`,actor:H.sam.name,text:`Utilization at 52% — not enough seat pressure to log expansion yet.`}]},{id:`ACC-1177`,name:`Trellis HR`,tier:`Growth`,stage:`habitual`,arrDisplay:`$112K`,arrK:112,seatsUsed:39,seatsLicensed:45,automationsPublished:6,weeklyRuns:[5,6,4,5,6,5,4,4],lastActivity:`2 Jul 2026`,csm:H.jonah.name,blockers:[W[`BLK-17`]],activity:[{stamp:`12 May 2026 · 10:10`,actor:`Cohora`,text:`Promoted to Habitual — onboarding-packet automations run daily.`},{stamp:`26 Jun 2026 · 17:55`,actor:H.jonah.name,text:`Champion resigned. Workspace-owner invite pending with the HRIS lead — raised BLK-17.`}]},{id:`ACC-1189`,name:`Saltbox Media`,tier:`Growth`,stage:`habitual`,arrDisplay:`$76K`,arrK:76,seatsUsed:24,seatsLicensed:25,automationsPublished:9,weeklyRuns:[4,4,6,7,8,7,9,8],lastActivity:`9 Jul 2026`,csm:H.priya.name,champion:`Callum Reid`,blockers:[],activity:[{stamp:`5 May 2026 · 12:00`,actor:`Cohora`,text:`Promoted to Habitual — ad-trafficking flows run before every campaign.`},{stamp:`9 Jul 2026 · 09:40`,actor:H.priya.name,text:`24 of 25 seats in use; champion asked for add-on pricing. Expansion-ready.`}]},{id:`ACC-1203`,name:`Ironvale Robotics`,tier:`Enterprise`,stage:`habitual`,arrDisplay:`$187K`,arrK:187,seatsUsed:46,seatsLicensed:48,automationsPublished:11,weeklyRuns:[5,5,6,6,7,8,7,9],lastActivity:`8 Jul 2026`,csm:H.priya.name,champion:`Hannele Virtanen`,blockers:[],activity:[{stamp:`21 Apr 2026 · 14:30`,actor:`Cohora`,text:`Promoted to Habitual — factory-floor exception routing.`},{stamp:`8 Jul 2026 · 13:05`,actor:H.priya.name,text:`Procurement pre-approved a 24-seat add-on; waiting on our order log.`}]},{id:`ACC-1042`,name:`Summit Ledger`,tier:`Enterprise`,stage:`expanded`,arrDisplay:`$205K`,arrK:205,seatsUsed:128,seatsLicensed:140,automationsPublished:14,weeklyRuns:[6,7,7,8,8,9,8,9],lastActivity:`9 Jul 2026`,csm:H.jonah.name,champion:`Rosa Delgado`,blockers:[],expansionOrderId:`EXP-3012`,activity:[{stamp:`17 Mar 2026 · 09:30`,actor:`Cohora`,text:`Expansion order EXP-3012 logged: +40 seats at renewal.`},{stamp:`9 Jul 2026 · 07:12`,actor:`Cohora`,text:`Close-books automations ran 9 times last week — cohort high.`}]},{id:`ACC-1018`,name:`Pacifica Rail`,tier:`Enterprise`,stage:`expanded`,arrDisplay:`$240K`,arrK:240,seatsUsed:190,seatsLicensed:220,automationsPublished:17,weeklyRuns:[7,7,8,7,9,8,9,8],lastActivity:`8 Jul 2026`,csm:H.priya.name,champion:`Owen Nakagawa`,blockers:[],expansionOrderId:`EXP-3027`,activity:[{stamp:`2 Apr 2026 · 11:45`,actor:`Cohora`,text:`Expansion order EXP-3027 logged: +80 seats for the dispatch division.`},{stamp:`8 Jul 2026 · 15:20`,actor:H.priya.name,text:`Reference call recorded for the Q3 cohort webinar.`}]},{id:`ACC-1096`,name:`Davenport Retail Group`,tier:`Growth`,stage:`expanded`,arrDisplay:`$158K`,arrK:158,seatsUsed:71,seatsLicensed:85,automationsPublished:12,weeklyRuns:[5,6,6,7,7,8,7,8],lastActivity:`7 Jul 2026`,csm:H.sam.name,champion:`Imani Walker`,blockers:[],expansionOrderId:`EXP-3033`,activity:[{stamp:`19 May 2026 · 16:10`,actor:`Cohora`,text:`Expansion order EXP-3033 logged: +25 seats across store ops.`},{stamp:`7 Jul 2026 · 10:38`,actor:H.sam.name,text:`Planogram-reset automation now templated for all regions.`}]}],ae=3041,oe={invited:{label:`Verify activation`,toStage:`activated`},activated:{label:`Promote to Habitual`,toStage:`habitual`},habitual:{label:`Log expansion order`,toStage:`expanded`},expanded:null};function G(e){return e.weeklyRuns.slice(-4).filter(e=>e<z).length}function K(e){return e.seatsLicensed===0?0:e.seatsUsed/e.seatsLicensed}function se(e){if(e.blockers.length>0){let t=e.blockers[0];return`Open blocker ${t.id} — ${t.label}. Resolve it before advancing.`}switch(e.stage){case`invited`:return e.automationsPublished>=1?null:`No automation published yet — activation requires at least one published automation.`;case`activated`:{let t=G(e);return t===0?null:`${t} of the last ${B} weeks fell below the ${z}-run habit threshold.`}case`habitual`:{let t=K(e);return t>=V?null:`Seat utilization ${Math.round(t*100)}% is under the ${Math.round(V*100)}% expansion signal.`}case`expanded`:return`Already at the final stage.`}}function ce(e){let[t,n]=(0,w.useState)(0);return(0,w.useEffect)(()=>{let t=e.current;if(t==null)return;let r=new ResizeObserver(e=>{let t=e[0]?.contentRect;t!=null&&n(t.width)});return r.observe(t),()=>r.disconnect()},[e]),t}function le(){return(0,T.jsxs)(`svg`,{width:24,height:24,viewBox:`0 0 24 24`,"aria-hidden":!0,style:{flexShrink:0},children:[(0,T.jsx)(`path`,{d:`M3 5h18l-4 5H7L3 5z`,fill:E,opacity:.45}),(0,T.jsx)(`path`,{d:`M7 11h10l-3 4h-4l-3-4z`,fill:E,opacity:.75}),(0,T.jsx)(`circle`,{cx:12,cy:19,r:2.2,fill:E})]})}function q({stage:e,size:t=14}){let n=`currentColor`,r=t/2,i=t*.28;return(0,T.jsxs)(`svg`,{width:t,height:t,viewBox:`0 0 ${t} ${t}`,"aria-hidden":!0,style:{flexShrink:0},children:[e===`invited`?(0,T.jsx)(`circle`,{cx:r,cy:r,r:i,fill:`none`,stroke:n,strokeWidth:1.5}):null,e===`activated`?(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(`circle`,{cx:r,cy:r,r:i,fill:`none`,stroke:n,strokeWidth:1.5}),(0,T.jsx)(`path`,{d:`M ${r} ${r-i} A ${i} ${i} 0 0 1 ${r} ${r+i} Z`,fill:n})]}):null,e===`habitual`?(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(`circle`,{cx:r,cy:r,r:i,fill:n}),(0,T.jsx)(`circle`,{cx:r,cy:r,r:i+2.5,fill:`none`,stroke:n,strokeWidth:1})]}):null,e===`expanded`?(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(`circle`,{cx:r,cy:r,r:i,fill:n}),[0,90,180,270].map(e=>(0,T.jsx)(`line`,{x1:r,y1:r-i-1.5,x2:r,y2:r-i-3.5,stroke:n,strokeWidth:1.5,transform:`rotate(${e} ${r} ${r})`},e))]}):null]})}var ue=10;function J({runs:e,width:t,ariaLabel:n}){let r=t/(e.length-1),i=e=>18-e/ue*16,a=e.map((e,t)=>`${(t*r).toFixed(1)},${i(e).toFixed(1)}`).join(` `),o=e.every(e=>e===0),s=i(z);return(0,T.jsxs)(`svg`,{width:t,height:20,viewBox:`0 0 ${t} 20`,role:`img`,"aria-label":n,children:[(0,T.jsx)(`line`,{x1:0,y1:s,x2:t,y2:s,stroke:N,strokeWidth:1,strokeDasharray:`3 3`}),o?(0,T.jsx)(`line`,{x1:0,y1:18,x2:t,y2:18,stroke:`var(--color-border)`,strokeWidth:1.5}):(0,T.jsx)(`polyline`,{points:a,fill:`none`,stroke:E,strokeWidth:1.5,strokeLinejoin:`round`})]})}var Y=128,X=6,Z=6;function de({counts:e,total:t,width:n,activeStages:r,onToggleStage:i}){let a=L.map((t,n)=>L.slice(n).reduce((t,n)=>t+e[n.id],0)),o=n/L.length,s=Y/2,c=r.size>0;return(0,T.jsxs)(`div`,{className:`fac-funnel-band`,children:[(0,T.jsx)(`div`,{className:`fac-funnel-headers`,role:`group`,"aria-label":`Adoption stages — click to filter the table`,children:L.map(n=>{let a=r.has(n.id),o=t===0?0:Math.round(e[n.id]/t*100);return(0,T.jsxs)(`button`,{type:`button`,className:`fac-stage-head fac-focusable fac-fade`,"aria-pressed":a,"aria-label":`${n.label}: ${e[n.id]} accounts, ${o}% of cohort. ${a?`Filtering table — press to clear.`:`Press to filter the table to this stage.`}`,onClick:()=>i(n.id),children:[(0,T.jsx)(`span`,{style:{color:D,display:`inline-flex`},children:(0,T.jsx)(q,{stage:n.id})}),(0,T.jsx)(`span`,{className:`fac-stage-label`,children:n.label}),(0,T.jsx)(`span`,{className:`fac-stage-count`,children:e[n.id]}),(0,T.jsxs)(`span`,{className:`fac-stage-share`,children:[o,`%`]})]},n.id)})}),(0,T.jsx)(`div`,{className:`fac-funnel-svg-wrap`,children:n>0?(0,T.jsxs)(`svg`,{width:n,height:Y,viewBox:`0 0 ${n} ${Y}`,"aria-hidden":!0,children:[L.slice(0,-1).map((e,t)=>{let n=o*t+o/2+Z/2,i=o*(t+1)+o/2-Z/2,l=a[t]*X,u=a[t+1]*X,d=(n+i)/2,f=`M ${n} ${s-l/2} C ${d} ${s-l/2}, ${d} ${s-u/2}, ${i} ${s-u/2}`,p=`L ${i} ${s+u/2} C ${d} ${s+u/2}, ${d} ${s+l/2}, ${n} ${s+l/2} Z`,m=a[t]-a[t+1];return(0,T.jsxs)(`g`,{className:`fac-fade`,opacity:c&&!r.has(e.id)&&!r.has(L[t+1].id)?.3:1,children:[(0,T.jsx)(`path`,{d:`${f} ${p}`,fill:O}),m>0?(0,T.jsx)(`text`,{x:d,y:s+l/2+14,textAnchor:`middle`,fontSize:10,fontFamily:`var(--font-family-code, ui-monospace, monospace)`,fill:`var(--color-text-secondary)`,children:`−${m} held at ${e.label.toLowerCase()}`}):null]},e.id)}),L.map((e,t)=>{let n=o*t+o/2-Z/2,i=Math.max(a[t]*X,4);return(0,T.jsxs)(`g`,{className:`fac-fade`,opacity:c&&!r.has(e.id)?.3:1,children:[(0,T.jsx)(`rect`,{x:n,y:s-i/2,width:Z,height:i,rx:2,fill:E}),(0,T.jsx)(`text`,{x:n+Z/2,y:s-i/2-5,textAnchor:`middle`,fontSize:10,fontFamily:`var(--font-family-code, ui-monospace, monospace)`,fill:`var(--color-text-secondary)`,children:`≥${e.short} ${a[t]}`})]},e.id)})]}):null})]})}var Q={technical:d,security:l,champion:u};function fe({account:e,isSelected:t,geometry:n,onSelect:r,rowRef:a}){let o=L[R[e.stage]],s=K(e);return(0,T.jsxs)(`button`,{type:`button`,ref:a,className:`fac-row fac-fade`,"aria-pressed":t,"aria-label":`${e.name}, ${o.label}, ${e.arrDisplay} ARR${e.blockers.length>0?`, ${e.blockers.length} open blocker${e.blockers.length>1?`s`:``}`:``}`,onClick:r,children:[(0,T.jsx)(`span`,{className:`fac-row-accent`,style:{backgroundColor:t?E:`transparent`},"aria-hidden":!0}),(0,T.jsxs)(`span`,{className:`fac-cell-account`,children:[(0,T.jsx)(`span`,{className:`fac-mono`,style:{color:`var(--color-text-secondary)`},children:e.id}),(0,T.jsx)(`span`,{className:`fac-account-name`,children:e.name}),(0,T.jsx)(`span`,{style:{flexShrink:0},children:(0,T.jsx)(S,{size:`sm`,color:`default`,label:e.tier})})]}),(0,T.jsx)(`span`,{className:`fac-cell fac-cell-num fac-cell-arr`,style:{width:64},children:e.arrDisplay}),n.showSeats?(0,T.jsxs)(`span`,{className:`fac-cell fac-cell-num`,style:{width:84,color:s>=V?void 0:`var(--color-text-secondary)`},children:[e.seatsUsed,`/`,e.seatsLicensed]}):null,n.showSpark?(0,T.jsx)(`span`,{className:`fac-cell`,style:{width:n.sparkW+P},children:(0,T.jsx)(J,{runs:e.weeklyRuns,width:n.sparkW,ariaLabel:`Weekly runs, last 8 weeks: ${e.weeklyRuns.join(`, `)}`})}):null,(0,T.jsxs)(`span`,{className:`fac-cell`,style:{width:104,color:D},children:[(0,T.jsx)(q,{stage:e.stage}),(0,T.jsx)(`span`,{style:{fontSize:12,color:`var(--color-text-primary)`},children:o.label})]}),(0,T.jsx)(`span`,{className:`fac-cell`,style:{width:n.compactBlockers?28:160},children:e.blockers.length===0?(0,T.jsx)(`span`,{style:{fontSize:11,color:`var(--color-text-secondary)`},"aria-hidden":!0,children:`—`}):n.compactBlockers?(0,T.jsx)(`span`,{className:`fac-blocker-pip`,"aria-label":`${e.blockers.length} open blockers`,children:e.blockers.length}):(0,T.jsxs)(`span`,{className:`fac-blocker-chip`,children:[(0,T.jsx)(i,{icon:Q[e.blockers[0].kind],size:`xsm`,color:`inherit`}),(0,T.jsx)(`span`,{children:e.blockers[0].label})]})}),n.showLastActivity?(0,T.jsx)(`span`,{className:`fac-cell fac-cell-num`,style:{width:82,color:`var(--color-text-secondary)`},children:e.lastActivity}):null]})}function pe({accounts:e,selectedId:t,geometry:n,onSelect:a,rowRefs:o,emptyReason:c}){let l=e=>t=>{let n=o.current;n!=null&&(t==null?n.delete(e):n.set(e,t))};return(0,T.jsxs)(`div`,{className:`fac-table-scroll`,children:[(0,T.jsxs)(`div`,{className:`fac-thead`,"aria-hidden":!0,children:[(0,T.jsx)(`span`,{className:`fac-section-label`,style:{flex:1,paddingLeft:P},children:`Account`}),(0,T.jsx)(`span`,{className:`fac-section-label fac-cell-arr`,style:{width:64,textAlign:`right`},children:`ARR`}),n.showSeats?(0,T.jsx)(`span`,{className:`fac-section-label`,style:{width:84,textAlign:`right`},children:`Seats`}):null,n.showSpark?(0,T.jsx)(`span`,{className:`fac-section-label`,style:{width:n.sparkW+P},children:`Runs · 8w`}):null,(0,T.jsx)(`span`,{className:`fac-section-label`,style:{width:104},children:`Stage`}),(0,T.jsx)(`span`,{className:`fac-section-label`,style:{width:n.compactBlockers?28:160},children:n.compactBlockers?`Blk`:`Blockers`}),n.showLastActivity?(0,T.jsx)(`span`,{className:`fac-section-label`,style:{width:82},children:`Last seen`}):null]}),e.length===0&&c!=null?(0,T.jsxs)(`div`,{className:`fac-empty`,children:[(0,T.jsx)(i,{icon:s,size:`lg`,color:`secondary`}),(0,T.jsx)(v,{level:2,children:`No accounts match`}),(0,T.jsx)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:c})]}):e.map(e=>(0,T.jsx)(fe,{account:e,isSelected:t===e.id,geometry:n,onSelect:()=>a(e.id),rowRef:l(e.id)},e.id))]})}function me({accounts:e}){let t=e.reduce((e,t)=>e+t.arrK,0),n=e.filter(e=>e.stage===`expanded`).reduce((e,t)=>e+t.arrK,0);return(0,T.jsxs)(`div`,{className:`fac-footer-strip`,children:[L.map(e=>(0,T.jsxs)(`span`,{className:`fac-legend-key`,children:[(0,T.jsx)(`span`,{style:{color:D,display:`inline-flex`},children:(0,T.jsx)(q,{stage:e.id,size:12})}),e.label]},e.id)),(0,T.jsx)(`span`,{style:{flex:1},"aria-hidden":!0}),(0,T.jsx)(`span`,{className:`fac-mono`,style:{color:`var(--color-text-secondary)`},children:`Cohort ARR $${(t/1e3).toFixed(2)}M · Expanded $${n}K`})]})}function $({label:e,children:t}){return(0,T.jsxs)(`div`,{className:`fac-metric-row`,children:[(0,T.jsx)(`span`,{className:`fac-metric-label`,children:e}),(0,T.jsx)(g,{size:`fill`,children:t})]})}function he({account:e,isOverlay:t,refusalNote:n,sparkW:l,onClose:u,onAdvance:d,onRegress:ee,onResolveBlocker:te}){if(e==null)return(0,T.jsxs)(`div`,{className:`fac-empty`,children:[(0,T.jsx)(i,{icon:c,size:`lg`,color:`secondary`}),(0,T.jsx)(v,{level:2,children:`No account selected`}),(0,T.jsx)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:`Select a table row to review its lifecycle`})]});let _=R[e.stage],y=oe[e.stage],C=se(e),w=K(e),A=Math.round(w*100),j=G(e);return(0,T.jsxs)(T.Fragment,{children:[(0,T.jsxs)(`div`,{className:`fac-aside-identity`,children:[(0,T.jsx)(g,{size:`fill`,children:(0,T.jsxs)(h,{gap:0,children:[(0,T.jsxs)(m,{gap:2,vAlign:`center`,children:[(0,T.jsx)(`span`,{className:`fac-mono`,style:{color:`var(--color-text-secondary)`},children:e.id}),(0,T.jsx)(`span`,{style:{flexShrink:0},children:(0,T.jsx)(S,{size:`sm`,color:`default`,label:e.tier})}),e.expansionOrderId==null?null:(0,T.jsx)(`span`,{style:{flexShrink:0},children:(0,T.jsx)(S,{size:`sm`,color:`green`,label:e.expansionOrderId})})]}),(0,T.jsx)(v,{level:2,maxLines:1,children:e.name})]})}),t?(0,T.jsx)(b,{label:`Close account panel`,isIconOnly:!0,variant:`ghost`,size:`sm`,icon:(0,T.jsx)(i,{icon:f,size:`sm`}),onClick:u}):null]}),(0,T.jsx)(`div`,{className:`fac-aside-scroll`,children:(0,T.jsxs)(h,{gap:3,children:[(0,T.jsxs)(h,{gap:1,children:[(0,T.jsx)(`span`,{className:`fac-section-label`,children:`Adoption stage`}),(0,T.jsx)(`div`,{className:`fac-stage-path`,"aria-label":`Stage ${_+1} of ${L.length}: ${L[_].label}`,children:L.map((e,t)=>(0,T.jsxs)(h,{gap:1,style:{flex:1},children:[(0,T.jsx)(`span`,{className:`fac-stage-path-seg fac-fade`,style:t<=_?{backgroundColor:E}:void 0}),(0,T.jsx)(r,{type:`supporting`,size:`xsm`,color:t===_?`primary`:`secondary`,children:e.short})]},e.id))}),(0,T.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:L[_].definition})]}),(0,T.jsx)(x,{}),(0,T.jsxs)(h,{gap:0,children:[(0,T.jsx)($,{label:`ARR`,children:(0,T.jsxs)(r,{type:`body`,size:`sm`,hasTabularNumbers:!0,children:[e.arrDisplay,` · CSM `,e.csm]})}),(0,T.jsx)($,{label:`Seats`,children:(0,T.jsxs)(m,{gap:2,vAlign:`center`,children:[(0,T.jsx)(`span`,{className:`fac-mono`,children:`${e.seatsUsed}/${e.seatsLicensed}`}),(0,T.jsx)(`span`,{className:`fac-util-track`,"aria-label":`Seat utilization ${A}%`,children:(0,T.jsx)(`span`,{className:`fac-util-fill fac-fade`,style:{width:`${Math.min(A,100)}%`,backgroundColor:w>=V?ne:E}})}),(0,T.jsxs)(`span`,{className:`fac-mono`,style:{color:`var(--color-text-secondary)`},children:[A,`%`]})]})}),(0,T.jsx)($,{label:`Automations`,children:(0,T.jsxs)(r,{type:`body`,size:`sm`,hasTabularNumbers:!0,children:[e.automationsPublished,` published`]})}),(0,T.jsx)($,{label:`Runs · 8w`,children:(0,T.jsxs)(m,{gap:2,vAlign:`center`,children:[(0,T.jsx)(J,{runs:e.weeklyRuns,width:l,ariaLabel:`Weekly runs, last 8 weeks: ${e.weeklyRuns.join(`, `)}`}),(0,T.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,hasTabularNumbers:!0,children:j===0?`habit streak ${B}w`:`${j}/${B}w below ${z}`})]})}),(0,T.jsx)($,{label:`Champion`,children:e.champion==null?(0,T.jsx)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:`None — workspace-owner invite pending`}):(0,T.jsx)(r,{type:`body`,size:`sm`,children:e.champion})})]}),(0,T.jsx)(x,{}),e.blockers.length>0?(0,T.jsxs)(h,{gap:1,children:[(0,T.jsx)(`span`,{className:`fac-section-label`,children:`Open blockers`}),e.blockers.map(t=>(0,T.jsxs)(`div`,{className:`fac-blocker-row`,children:[(0,T.jsx)(`span`,{style:{color:k,display:`inline-flex`,flexShrink:0},children:(0,T.jsx)(i,{icon:Q[t.kind],size:`sm`,color:`inherit`})}),(0,T.jsx)(g,{size:`fill`,children:(0,T.jsxs)(h,{gap:0,children:[(0,T.jsxs)(m,{gap:2,vAlign:`center`,children:[(0,T.jsx)(`span`,{className:`fac-mono`,children:t.id}),(0,T.jsx)(r,{type:`label`,size:`xsm`,children:t.label})]}),(0,T.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:t.detail})]})}),(0,T.jsx)(b,{label:`Resolve`,variant:`secondary`,size:`sm`,onClick:()=>te(e.id,t.id)})]},t.id)),(0,T.jsx)(x,{})]}):null,(0,T.jsxs)(`div`,{className:`fac-action-panel`,style:C==null&&y!=null?{borderColor:D,backgroundColor:O}:void 0,children:[(0,T.jsx)(`span`,{className:`fac-section-label`,children:`Lifecycle action`}),y==null?(0,T.jsxs)(m,{gap:2,vAlign:`center`,children:[(0,T.jsx)(i,{icon:p,size:`sm`,color:`secondary`}),(0,T.jsxs)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:[`Final stage — expansion order `,e.expansionOrderId??`—`,` on file.`]})]}):(0,T.jsxs)(T.Fragment,{children:[(0,T.jsxs)(m,{gap:2,vAlign:`center`,children:[(0,T.jsx)(b,{label:y.label,variant:`primary`,size:`sm`,icon:(0,T.jsx)(i,{icon:o,size:`sm`}),isDisabled:C!=null,onClick:()=>d(e.id)}),(0,T.jsxs)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:[`→ `,L[R[y.toStage]].label]})]}),C==null?(0,T.jsxs)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:[`Eligible — all gates for `,L[R[y.toStage]].label.toLowerCase(),` pass.`]}):(0,T.jsxs)(`div`,{className:`fac-refusal`,role:`note`,children:[(0,T.jsx)(i,{icon:s,size:`xsm`,color:`inherit`}),(0,T.jsx)(`span`,{children:C})]})]}),n==null?null:(0,T.jsxs)(`div`,{className:`fac-refusal`,role:`alert`,children:[(0,T.jsx)(i,{icon:s,size:`xsm`,color:`inherit`}),(0,T.jsx)(`span`,{children:n})]}),_>0?(0,T.jsxs)(m,{gap:2,vAlign:`center`,children:[(0,T.jsx)(b,{label:`Regress one stage`,variant:`ghost`,size:`sm`,icon:(0,T.jsx)(i,{icon:a,size:`sm`}),onClick:()=>ee(e.id)}),(0,T.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Correction — logs to the account.`})]}):null]}),(0,T.jsxs)(h,{gap:1,children:[(0,T.jsx)(`span`,{className:`fac-section-label`,children:`Activity`}),(0,T.jsx)(`div`,{role:`log`,"aria-label":`${e.name} activity`,children:[...e.activity].reverse().map((e,t)=>(0,T.jsxs)(`div`,{className:`fac-log-row`,children:[(0,T.jsxs)(m,{gap:2,vAlign:`center`,children:[(0,T.jsx)(r,{type:`label`,size:`xsm`,children:e.actor}),(0,T.jsx)(`span`,{className:`fac-mono`,style:{fontSize:11,color:`var(--color-text-secondary)`},children:e.stamp})]}),(0,T.jsx)(r,{type:`body`,size:`sm`,children:e.text})]},`${e.stamp}-${t}`))})]})]})}),(0,T.jsx)(`div`,{className:`fac-aside-footer`,children:(0,T.jsxs)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:[`Q3 cohort · `,H.mara.name]})})]})}function ge(e){return e instanceof HTMLElement&&(e.tagName===`INPUT`||e.tagName===`TEXTAREA`||e.isContentEditable)}function _e(e){let t={invited:0,activated:0,habitual:0,expanded:0};for(let n of e)t[n.stage]+=1;return t}function ve(){let e=(0,w.useRef)(null),t=ce(e),n=y(`(max-width: 1279px)`),a=y(`(max-width: 1023px)`),o=t>0?t<1200:n,c=t>0?t<1e3:a,l=c?340:o?320:360,u=c?{showSeats:!1,showSpark:!1,showLastActivity:!1,sparkW:56,compactBlockers:!0}:o?{showSeats:!1,showSpark:!0,showLastActivity:!0,sparkW:56,compactBlockers:!0}:{showSeats:!0,showSpark:!0,showLastActivity:!0,sparkW:72,compactBlockers:!1},d=Math.max(0,(c?t:t-l)-P*2-1),[p,m]=(0,w.useState)(ie),[h,g]=(0,w.useState)(null),[v,b]=(0,w.useState)(()=>new Set),[x,E]=(0,w.useState)(!1),[D,O]=(0,w.useState)(!1),[ne,k]=(0,w.useState)(null),[A,j]=(0,w.useState)(``),[M,N]=(0,w.useState)(ae),F=(0,w.useRef)(new Map),V=(0,w.useCallback)(e=>{g(e),k(null),O(!0)},[]),W=(0,w.useCallback)(()=>{O(!1),h!=null&&F.current.get(h)?.focus()},[h]),G=e=>{e.key!==`Escape`||ge(e.target)||(c&&D?W():h!=null&&g(null))},K=(0,w.useCallback)(e=>{let t=p.find(t=>t.id===e);if(t==null)return;let n=oe[t.stage];if(n==null)return;let r=se(t);if(r!=null){k(r),j(`${t.name} not moved: ${r}`);return}let i=t.stage===`habitual`?`EXP-${M}`:void 0;i!=null&&N(e=>e+1),m(t=>t.map(t=>{if(t.id!==e)return t;let r=t.stage===`invited`?`Activation verified — moved to Activated.`:t.stage===`activated`?`Habit threshold confirmed (${B}w at ≥${z} runs) — moved to Habitual.`:`Expansion order ${i} logged — moved to Expanded.`;return{...t,stage:n.toStage,expansionOrderId:i??t.expansionOrderId,lastActivity:`9 Jul 2026`,activity:[...t.activity,{stamp:U,actor:H.mara.name,text:r}]}})),k(null);let a=_e(p.map(t=>t.id===e?{...t,stage:n.toStage}:t));j(`${t.name} moved to ${L[R[n.toStage]].label}. `+L.map(e=>`${e.label} ${a[e.id]}`).join(`, `)+`.`)},[p,M]),q=(0,w.useCallback)(e=>{let t=p.find(t=>t.id===e);if(t==null)return;let n=R[t.stage];if(n===0)return;let r=L[n-1].id,i=t.stage===`expanded`?t.expansionOrderId:void 0;m(t=>t.map(t=>t.id===e?{...t,stage:r,expansionOrderId:i==null?t.expansionOrderId:void 0,activity:[...t.activity,{stamp:U,actor:H.mara.name,text:i==null?`Correction: regressed to ${L[n-1].label}.`:`Correction: regressed to ${L[n-1].label}; expansion order ${i} voided.`}]}:t)),k(null);let a=_e(p.map(t=>t.id===e?{...t,stage:r}:t));j(`${t.name} regressed to ${L[n-1].label}. `+L.map(e=>`${e.label} ${a[e.id]}`).join(`, `)+`.`)},[p]),ue=(0,w.useCallback)((e,t)=>{m(n=>n.map(n=>{if(n.id!==e)return n;let r=n.blockers.find(e=>e.id===t);return r==null?n:{...n,blockers:n.blockers.filter(e=>e.id!==t),lastActivity:`9 Jul 2026`,activity:[...n.activity,{stamp:U,actor:H.mara.name,text:`Blocker ${r.id} (${r.label}) resolved.`}]}})),k(null),j(`Blocker ${t} resolved.`)},[]),J=_e(p),Y=p.length,X=Y-J.invited,Z=`Activation ${(X/Math.max(Y,1)*100).toFixed(1)}% · ${X}/${Y} past Invited`,Q=p.filter(e=>e.blockers.length>0).length,fe=(0,w.useCallback)(e=>{b(t=>{let n=new Set(t);return n.has(e)?n.delete(e):n.add(e),n})},[]),$=[...p].filter(e=>(v.size===0||v.has(e.stage))&&(!x||e.blockers.length>0)).sort((e,t)=>{let n=R[e.stage]-R[t.stage];return n===0?t.arrK-e.arrK:n}),ve=$.length===0?x?`No blocked accounts in the selected stages — clear a filter to see rows.`:`No accounts in the selected stages.`:null,ye=h==null?null:p.find(e=>e.id===h)??null,be=!c||D;return(0,T.jsxs)(`div`,{className:I,onKeyDown:G,children:[(0,T.jsx)(`style`,{children:re}),(0,T.jsx)(`span`,{"aria-live":`polite`,role:`status`,className:`fac-visually-hidden`,children:A}),(0,T.jsx)(ee,{height:`fill`,header:(0,T.jsx)(_,{padding:0,hasDivider:!0,children:(0,T.jsxs)(`div`,{className:`fac-header-bar`,children:[(0,T.jsx)(le,{}),(0,T.jsx)(r,{type:`label`,size:`sm`,children:`Cohora`}),(0,T.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,maxLines:1,children:`Automation Studio · Q3 enterprise cohort · Lumen Suite`}),(0,T.jsx)(`span`,{style:{flexShrink:0},children:(0,T.jsx)(S,{size:`sm`,color:`green`,label:`Live`})}),(0,T.jsx)(`span`,{style:{flex:1},"aria-hidden":!0}),(0,T.jsx)(`span`,{className:`fac-header-stat`,children:Z}),(0,T.jsx)(C,{name:H.mara.name,size:`small`})]})}),content:(0,T.jsx)(te,{padding:0,children:(0,T.jsxs)(`div`,{ref:e,className:`fac-view-root`,children:[(0,T.jsxs)(`div`,{className:`fac-main-col`,children:[(0,T.jsx)(de,{counts:J,total:Y,width:d,activeStages:v,onToggleStage:fe}),(0,T.jsxs)(`div`,{className:`fac-toolbar`,children:[(0,T.jsx)(`span`,{className:`fac-section-label`,children:`Accounts`}),(0,T.jsxs)(`button`,{type:`button`,className:`fac-chip fac-chip-blocked fac-focusable fac-fade`,"aria-pressed":x,onClick:()=>E(e=>!e),children:[(0,T.jsx)(i,{icon:s,size:`xsm`,color:`inherit`}),`Blocked · ${Q}`]}),v.size>0||x?(0,T.jsxs)(`button`,{type:`button`,className:`fac-chip fac-focusable fac-fade`,onClick:()=>{b(new Set),E(!1)},children:[(0,T.jsx)(i,{icon:f,size:`xsm`,color:`inherit`}),`Clear filters`]}):null,(0,T.jsx)(`span`,{style:{flex:1},"aria-hidden":!0}),(0,T.jsx)(`span`,{className:`fac-mono`,style:{color:`var(--color-text-secondary)`},children:`${$.length} of ${Y} accounts`})]}),(0,T.jsx)(pe,{accounts:$,selectedId:h,geometry:u,onSelect:V,rowRefs:F,emptyReason:ve}),(0,T.jsx)(me,{accounts:p})]}),be?(0,T.jsx)(`aside`,{"aria-label":`Account lifecycle detail`,className:`fac-aside${c?` fac-aside-overlay`:``}`,style:c?void 0:{width:l},children:(0,T.jsx)(he,{account:ye,isOverlay:c,refusalNote:ne,sparkW:120,onClose:W,onAdvance:K,onRegress:q,onResolveBlocker:ue})}):null]})})})]})}export{ve as default};