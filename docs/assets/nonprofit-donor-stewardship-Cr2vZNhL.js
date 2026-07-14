import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Icon-Cbr2QWU5.js";import{t as i}from"./building-qwyWOOZP.js";import{t as a}from"./calendar-heart-N2HdjocS.js";import{t as o}from"./handshake-MO5XkN50.js";import{t as s}from"./landmark-BXoJaoU6.js";import{t as c}from"./mail-Ey95ZdMG.js";import{t as l}from"./pen-line-BCBaL8nP.js";import{t as u}from"./phone-Cu4NrZF7.js";import{t as d}from"./sparkles-DHpkielZ.js";import{t as f}from"./user-round-C4T8PGCp.js";import{i as p}from"./index-BwFrdgVW.js";import{n as m,t as h}from"./LayoutContent-CCL91W7X.js";import{t as g}from"./LayoutHeader-Cy2mWoMf.js";var _=e(t(),1),v=n(),y=`tpl-nonprofit-donor-stewardship`,b=`light-dark(#86198F, #F0ABFC)`,x=`light-dark(#FFFFFF, #3D0A44)`,S={org:`Stewardly`,name:`Every Child Reads`,goal:24e5,cycle:`FY26 · Q1 close Sep 30`},C=60,w=5,T=3,E=[{id:`qualify`,label:`Qualify`,moneyLabel:`targets`},{id:`cultivate`,label:`Cultivate`,moneyLabel:`targets`},{id:`solicit`,label:`Solicit`,moneyLabel:`open asks`},{id:`steward`,label:`Steward`,moneyLabel:`committed`}],D={pn:{initials:`PN`,name:`Priya Natarajan`},mw:{initials:`MW`,name:`Marcus Webb`},es:{initials:`ES`,name:`Elena Sosa`}},O=[`pn`,`mw`,`es`],k=[{id:`visit`,label:`Site visit`,weight:18,icon:o},{id:`call`,label:`Phone call`,weight:12,icon:u},{id:`event`,label:`Event invite`,weight:10,icon:a},{id:`note`,label:`Handwritten note`,weight:8,icon:l},{id:`thanks`,label:`Thank-you email`,weight:5,icon:c}],A=new Map(k.map(e=>[e.id,e])),j={individual:{label:`Individual`,icon:f},foundation:{label:`Foundation`,icon:s},corporate:{label:`Corporate`,icon:i},daf:{label:`DAF / trust`,icon:s}},M=[{id:`d-okafor`,name:`Marguerite Okafor`,kind:`individual`,stage:`steward`,officer:`pn`,amount:45e4,vehicle:`5-yr pledge · $90K/yr · current`,riskScore:22,history:[{dateLabel:`Jul 8`,daysAgo:1,type:`thanks`,note:`Thanked her for the Q2 installment; she asked about naming the Westside reading room.`},{dateLabel:`Jun 19`,daysAgo:20,type:`visit`,note:`Site visit to the Lincoln Elementary cohort — brought her granddaughter, stayed for story hour.`},{dateLabel:`May 30`,daysAgo:40,type:`call`,note:`Quarterly check-in; confirmed summer travel dates so the fall ask lands after Labor Day.`}]},{id:`d-hollenbeck`,name:`The Hollenbeck–Aizenberg Family Charitable Remainder Unitrust`,kind:`daf`,stage:`steward`,officer:`mw`,amount:3e5,vehicle:`CRUT distribution · 2 installments behind`,riskScore:68,history:[{dateLabel:`May 12`,daysAgo:58,type:`note`,note:`Mailed the pledge-schedule reminder to the trustee. No reply as of July.`},{dateLabel:`Mar 27`,daysAgo:104,type:`call`,note:`Trustee says distributions wait on their fiscal close; asked us to re-send wiring instructions.`}]},{id:`d-calloway`,name:`Calloway Family Foundation`,kind:`foundation`,stage:`steward`,officer:`es`,amount:25e4,vehicle:`3-yr grant · interim report due Sep 15`,riskScore:41,history:[{dateLabel:`Jun 30`,daysAgo:9,type:`note`,note:`Sent the mid-year literacy outcomes memo ahead of the September report.`},{dateLabel:`Apr 22`,daysAgo:78,type:`call`,note:`Program officer wants third-grade reading-level data broken out by school in the next report.`}]},{id:`d-brightwater`,name:`Brightwater Paper Co.`,kind:`corporate`,stage:`steward`,officer:`mw`,amount:12e4,vehicle:`Sponsorship + employee match`,riskScore:35,history:[{dateLabel:`Jul 7`,daysAgo:2,type:`call`,note:`CSR lead confirmed the match portal reopens Aug 1; wants co-branded bookplate art by then.`},{dateLabel:`Jun 3`,daysAgo:36,type:`event`,note:`Invited their leadership team to the fall kickoff; three RSVPs so far.`}]},{id:`d-reyes`,name:`Dean & Alma Reyes`,kind:`individual`,stage:`steward`,officer:`es`,amount:85e3,vehicle:`Pledge · paid 40% · balance $51K`,riskScore:74,history:[{dateLabel:`Jan 12`,daysAgo:178,type:`event`,note:`Attended the winter gala. No contact since — their last two installments are unscheduled.`}]},{id:`d-adeyemi`,name:`Yusuf Adeyemi-Grant`,kind:`individual`,stage:`solicit`,officer:`pn`,amount:2e5,vehicle:`Proposal delivered Jun 26`,riskScore:58,history:[{dateLabel:`Jul 6`,daysAgo:3,type:`call`,note:`Left voicemail — second attempt since the proposal went out. Assistant says he is traveling.`},{dateLabel:`Jun 26`,daysAgo:13,type:`note`,note:`Hand-delivered the $200K proposal with the tutoring-corps budget he asked for.`}]},{id:`d-trask`,name:`Nell Trask`,kind:`individual`,stage:`solicit`,officer:`pn`,amount:15e4,vehicle:`Ask meeting set · Jul 17`,riskScore:30,history:[{dateLabel:`Jul 7`,daysAgo:2,type:`call`,note:`Confirmed the July 17 ask meeting; she wants the ED in the room.`},{dateLabel:`Jun 11`,daysAgo:28,type:`visit`,note:`Walked her through the new-readers wing plans; she lingered on the family literacy lab.`}]},{id:`d-ferris`,name:`Ferris & Wong LLP`,kind:`corporate`,stage:`solicit`,officer:`mw`,amount:75e3,vehicle:`Partner vote this month`,riskScore:45,history:[{dateLabel:`Jun 24`,daysAgo:15,type:`note`,note:`Sent the one-pager their managing partner requested for the July partners meeting.`}]},{id:`d-nakamura`,name:`Priscilla Nakamura`,kind:`individual`,stage:`cultivate`,officer:`es`,amount:1e5,vehicle:`Warm — two tours attended`,riskScore:52,history:[{dateLabel:`Jun 14`,daysAgo:25,type:`event`,note:`Joined the volunteer reader orientation; asked pointed questions about per-student cost.`}]},{id:`d-fitch`,name:`Ambrose Fitch`,kind:`individual`,stage:`cultivate`,officer:`mw`,amount:5e4,vehicle:`Legacy society member`,riskScore:26,history:[{dateLabel:`Jul 6`,daysAgo:3,type:`note`,note:`Birthday card with a photo from the spring read-a-thon he sponsored.`},{dateLabel:`May 20`,daysAgo:50,type:`call`,note:`Talked estate planning timing; his attorney meets him in August.`}]},{id:`d-sablecreek`,name:`The Sable Creek Donor-Advised Fund`,kind:`daf`,stage:`cultivate`,officer:`pn`,amount:6e4,vehicle:`Advisor gatekeeps contact`,riskScore:63,history:[{dateLabel:`Apr 30`,daysAgo:70,type:`note`,note:`Quarterly update mailed via the fund advisor — no direct channel to the family yet.`}]},{id:`d-ibarra`,name:`Tomás Ibarra`,kind:`individual`,stage:`qualify`,officer:`es`,amount:25e3,vehicle:`Board referral · June`,riskScore:38,history:[{dateLabel:`Jun 20`,daysAgo:19,type:`call`,note:`Intro call via board chair — ran a bilingual bookstore for 20 years, wants to help sourcing.`}]},{id:`d-okonjo`,name:`Winnie Okonjo-Bell`,kind:`individual`,stage:`qualify`,officer:`mw`,amount:4e4,vehicle:`Event walk-in · high engagement`,riskScore:55,history:[{dateLabel:`Jul 8`,daysAgo:1,type:`event`,note:`Came to the summer open house unprompted and signed up for the newsletter and a tour.`}]},{id:`d-voss`,name:`Harriet Voss`,kind:`individual`,stage:`qualify`,officer:`pn`,amount:15e3,vehicle:`From Jun 30 wealth screen`,riskScore:47,history:[]}];function N(e){return e>=C?`high`:e>=30?`watch`:`steady`}var P={high:`At risk`,watch:`Watch`,steady:`On track`},F={qualify:{high:`Discovery call before month end`,watch:`Screen giving history, then intro call`,steady:`Invite to a classroom story hour`},cultivate:{high:`Officer coffee — re-anchor the vision`,watch:`Program tour with a student reader`,steady:`Share the Q3 literacy outcomes memo`},solicit:{high:`ED joins the ask meeting`,watch:`Send the tailored proposal follow-up`,steady:`Set the ask date`},steward:{high:`Site visit + pledge schedule reset`,watch:`Handwritten impact note`,steady:`Quarterly impact report is enough`}};function I(e,t){return F[e][N(t)]}function L(e){return`$${e.toLocaleString(`en-US`)}`}function R(e){if(e>=1e6){let t=e/1e6;return`$${t.toFixed(t>=10?1:2).replace(/\.?0+$/,``)}M`}return`$${Math.round(e/1e3)}K`}function z(e){let t=e.history[0];if(t==null)return`Never touched`;let n=A.get(t.type),r=t.daysAgo===0?`today`:`${t.daysAgo}d ago`;return`${n?.label??t.type} · ${r}`}function B(e){let t=0,n=0;for(let r of e)r.stage===`steward`&&(r.riskScore>=C?n+=r.amount:t+=r.amount);return{secured:t,atRisk:n,securedPct:t/S.goal*100,atRiskPct:n/S.goal*100,committed:t+n}}function V(e){let t=0;for(let n of e)for(let e of n.history)e.daysAgo<=T&&(t+=1);return t}var H={qualify:`Target`,cultivate:`Target`,solicit:`Ask`,steward:`Committed`},U=`
.${y} {
  --nds-accent: ${b};
  --nds-on-accent: ${x};
  --nds-accent-wash: color-mix(in srgb, ${b} 12%, var(--color-background-card));
  --nds-accent-border: color-mix(in srgb, ${b} 40%, var(--color-border));
  color: var(--color-text-primary);
  font-family: var(--font-family-sans, var(--font-family-body, system-ui, sans-serif));
}
.${y} *,
.${y} *::before,
.${y} *::after {
  box-sizing: border-box;
}
.${y} h1,
.${y} h2,
.${y} h3,
.${y} p,
.${y} ul,
.${y} ol,
.${y} li {
  margin: 0;
  padding: 0;
}
.${y} ul,
.${y} ol {
  list-style: none;
}
.${y} button {
  background: none;
  border: 0;
  color: inherit;
  cursor: pointer;
  font: inherit;
  padding: 0;
  text-align: inherit;
}
.${y} button:focus-visible,
.${y} textarea:focus-visible {
  border-radius: 6px;
  outline: 2px solid var(--nds-accent);
  outline-offset: 2px;
}
.${y} .num {
  font-variant-numeric: tabular-nums;
}

/* ---- header: 56px topbar + 44px coverage strip -------------------------- */
.${y}.topbar {
  align-items: center;
  display: flex;
  gap: var(--spacing-3);
  min-height: 56px;
  padding: var(--spacing-2) var(--spacing-4);
}
.${y} .brandCluster {
  align-items: center;
  display: flex;
  flex: none;
  gap: var(--spacing-3);
  min-width: 0;
}
.${y} .brandMark {
  align-items: center;
  background: var(--nds-accent);
  border-radius: 10px;
  color: var(--nds-on-accent);
  display: inline-flex;
  flex: none;
  height: 36px;
  justify-content: center;
  width: 36px;
}
.${y} .brandText {
  min-width: 0;
}
.${y} .eyebrow {
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  line-height: 1.3;
  text-transform: uppercase;
  white-space: nowrap;
}
.${y} h1 {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${y} .topbarSpring {
  flex: 1 1 auto;
  min-width: 0;
}
.${y} .officerChips {
  display: flex;
  flex: none;
  gap: var(--spacing-1);
  overflow-x: auto;
}
.${y} .officerChip {
  align-items: center;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-secondary);
  display: inline-flex;
  flex: none;
  gap: 6px;
  min-height: 40px;
  padding: 0 12px;
  transition: background-color 140ms ease, border-color 140ms ease, color 140ms ease;
}
@media (hover: hover) {
  .${y} .officerChip:hover {
    background: var(--color-overlay-hover);
  }
}
.${y} .officerChip[aria-pressed='true'] {
  background: var(--nds-accent);
  border-color: var(--nds-accent);
  color: var(--nds-on-accent);
}
.${y} .officerChip .chipCount {
  font-size: 11px;
  font-weight: 700;
}
.${y} .officerChip .chipLabel {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.${y} .weekCounter {
  align-items: baseline;
  color: var(--color-text-secondary);
  display: flex;
  flex: none;
  font-size: 12px;
  gap: 6px;
  white-space: nowrap;
}
.${y} .weekCounter strong {
  color: var(--color-text-primary);
  font-size: 15px;
  font-weight: 700;
}

.${y}.coverage {
  align-items: center;
  border-top: var(--border-width) solid var(--color-border);
  display: flex;
  gap: var(--spacing-4);
  min-height: 44px;
  padding: var(--spacing-1) var(--spacing-4);
}
.${y} .coverageBarWrap {
  flex: 1 1 auto;
  min-width: 160px;
}
.${y} .coverageBar {
  background: var(--color-background-muted);
  border-radius: 999px;
  display: flex;
  height: 10px;
  overflow: hidden;
}
.${y} .coverageSecured {
  background: var(--nds-accent);
  transition: width 420ms cubic-bezier(0.22, 1, 0.36, 1);
}
/* At-risk band: warning hatch — reads as "counted, but not safe". */
.${y} .coverageAtRisk {
  background: repeating-linear-gradient(
    -45deg,
    var(--color-warning) 0 4px,
    var(--color-warning-muted) 4px 8px
  );
  transition: width 420ms cubic-bezier(0.22, 1, 0.36, 1);
}
.${y} .coverageLegend {
  align-items: center;
  color: var(--color-text-secondary);
  display: flex;
  flex: none;
  flex-wrap: wrap;
  font-size: 12px;
  gap: var(--spacing-1) var(--spacing-3);
  white-space: nowrap;
}
.${y} .legendSwatch {
  border-radius: 3px;
  display: inline-block;
  height: 10px;
  margin-right: 5px;
  vertical-align: -1px;
  width: 10px;
}
.${y} .legendSwatch.secured {
  background: var(--nds-accent);
}
.${y} .legendSwatch.atRisk {
  background: repeating-linear-gradient(
    -45deg,
    var(--color-warning) 0 3px,
    var(--color-warning-muted) 3px 6px
  );
}
.${y} .coverageLegend strong {
  color: var(--color-text-primary);
  font-weight: 700;
}

/* ---- board ---------------------------------------------------------------- */
.${y}.boardwrap {
  background: var(--color-background-body);
  height: 100%;
  min-height: 0;
  overflow: hidden;
  position: relative;
}
.${y} .board {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(232px, 1fr));
  height: 100%;
  min-height: 0;
  overflow: hidden auto;
  padding: var(--spacing-3) var(--spacing-4) var(--spacing-4);
}
.${y} .stageCol {
  background: var(--color-background-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
.${y} .stageHeader {
  align-items: center;
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex: none;
  gap: var(--spacing-2);
  min-height: 44px;
  padding: 0 var(--spacing-3);
}
.${y} .stageName {
  font-size: 13px;
  font-weight: 700;
}
.${y} .stageCount {
  background: var(--color-background-muted);
  border-radius: 999px;
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 700;
  min-width: 20px;
  padding: 2px 7px;
  text-align: center;
}
.${y} .stageMoney {
  color: var(--color-text-secondary);
  font-size: 12px;
  margin-left: auto;
  white-space: nowrap;
}
.${y} .stageMoney strong {
  color: var(--color-text-primary);
  font-weight: 700;
}
.${y} .stageRiskBadge {
  align-items: center;
  background: var(--color-error-muted);
  border-radius: 999px;
  color: var(--color-text-primary);
  display: inline-flex;
  font-size: 11px;
  font-weight: 700;
  gap: 4px;
  padding: 2px 8px;
}
.${y} .cardList {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-2);
}
.${y} .emptyCol {
  border: var(--border-width) dashed var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.5;
  margin: var(--spacing-2);
  padding: var(--spacing-4) var(--spacing-3);
  text-align: center;
}

/* ---- donor card: one <button>, 12px padding, 40px dial ------------------- */
.${y} .donorCard {
  background: var(--color-background-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  display: block;
  padding: 12px;
  transition: border-color 140ms ease, background-color 140ms ease;
  width: 100%;
}
@media (hover: hover) {
  .${y} .donorCard:hover {
    background: var(--color-overlay-hover);
    border-color: var(--nds-accent-border);
  }
}
.${y} .donorCard[aria-pressed='true'] {
  background: var(--nds-accent-wash);
  border-color: var(--nds-accent);
}
.${y} .cardTop {
  align-items: flex-start;
  display: flex;
  gap: var(--spacing-2);
}
.${y} .kindGlyph {
  color: var(--color-icon-secondary);
  flex: none;
  margin-top: 1px;
}
.${y} .donorName {
  flex: 1 1 auto;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
  min-width: 0;
  overflow-wrap: anywhere;
}
.${y} .officerDot {
  align-items: center;
  background: var(--color-background-muted);
  border-radius: 999px;
  color: var(--color-text-secondary);
  display: inline-flex;
  flex: none;
  font-size: 10px;
  font-weight: 700;
  height: 22px;
  justify-content: center;
  letter-spacing: 0.04em;
  width: 26px;
}
.${y} .cardAmount {
  color: var(--color-text-secondary);
  display: block;
  font-size: 12px;
  line-height: 1.4;
  margin-top: 4px;
}
.${y} .cardAmount strong {
  color: var(--color-text-primary);
  font-weight: 700;
}
.${y} .cardRiskRow {
  align-items: center;
  display: flex;
  gap: var(--spacing-2);
  margin-top: 8px;
}
.${y} .tierPill {
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  white-space: nowrap;
}
.${y} .tierPill.high { background: var(--color-error-muted); }
.${y} .tierPill.watch { background: var(--color-warning-muted); }
.${y} .tierPill.steady { background: var(--color-success-muted); }
.${y} .lastTouch {
  color: var(--color-text-secondary);
  flex: 1 1 auto;
  font-size: 11px;
  min-width: 0;
  overflow: hidden;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${y} .nbaChip {
  align-items: center;
  background: var(--nds-accent-wash);
  border: var(--border-width) solid var(--nds-accent-border);
  border-radius: 6px;
  color: var(--color-text-primary);
  display: flex;
  font-size: 11px;
  font-weight: 600;
  gap: 6px;
  line-height: 1.35;
  margin-top: 8px;
  min-height: 28px;
  padding: 4px 8px;
}
.${y} .nbaChip .nbaIcon {
  color: var(--nds-accent);
  display: inline-flex;
  flex: none;
}

/* ---- risk dial ------------------------------------------------------------ */
.${y} .riskDial {
  flex: none;
}
.${y} .riskDial .dialTrack {
  stroke: var(--color-background-muted);
}
.${y} .riskDial .dialArc {
  transition: stroke-dasharray 420ms cubic-bezier(0.22, 1, 0.36, 1);
}
.${y} .riskDial.high .dialArc { stroke: var(--color-error); }
.${y} .riskDial.watch .dialArc { stroke: var(--color-warning); }
.${y} .riskDial.steady .dialArc { stroke: var(--color-success); }
.${y} .riskDial .dialValue {
  fill: var(--color-text-primary);
  font-family: inherit;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

/* ---- touch composer drawer: 360px absolute overlay ----------------------- */
.${y} .drawerScrim {
  background: transparent;
  inset: 0;
  position: absolute;
  z-index: 4;
}
.${y} .drawer {
  background: var(--color-background-card);
  border-left: var(--border-width) solid var(--color-border);
  bottom: 0;
  box-shadow: -12px 0 32px var(--color-shadow, rgba(0, 0, 0, 0.18));
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: absolute;
  right: 0;
  top: 0;
  width: 360px;
  z-index: 5;
}
.${y} .drawerHeader {
  align-items: flex-start;
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex: none;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
}
.${y} .drawerTitleBlock {
  flex: 1 1 auto;
  min-width: 0;
}
.${y} .drawerDonorName {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
}
.${y} .drawerMeta {
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.4;
  margin-top: 2px;
}
.${y} .drawerClose {
  align-items: center;
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  display: inline-flex;
  flex: none;
  height: 40px;
  justify-content: center;
  width: 40px;
}
@media (hover: hover) {
  .${y} .drawerClose:hover {
    background: var(--color-overlay-hover);
  }
}
.${y} .drawerBody {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: var(--spacing-3);
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-3);
}
.${y} .drawerDialRow {
  align-items: center;
  display: flex;
  gap: var(--spacing-3);
}
.${y} .drawerDialCopy {
  flex: 1 1 auto;
  min-width: 0;
}
.${y} .drawerDialCopy .nbaNow {
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.45;
  margin-top: 4px;
}
.${y} .drawerDialCopy .nbaNow strong {
  color: var(--color-text-primary);
  font-weight: 600;
}
.${y} .sectionLabel {
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.${y} .touchTypeList {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}
.${y} .touchTypeRow {
  align-items: center;
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  display: flex;
  gap: var(--spacing-2);
  min-height: 44px;
  padding: 0 var(--spacing-3);
  transition: border-color 140ms ease, background-color 140ms ease;
}
@media (hover: hover) {
  .${y} .touchTypeRow:hover {
    background: var(--color-overlay-hover);
  }
}
.${y} .touchTypeRow[aria-pressed='true'] {
  background: var(--nds-accent-wash);
  border-color: var(--nds-accent);
}
.${y} .touchTypeRow .touchIcon {
  color: var(--color-icon-secondary);
  display: inline-flex;
  flex: none;
}
.${y} .touchTypeRow[aria-pressed='true'] .touchIcon {
  color: var(--nds-accent);
}
.${y} .touchTypeLabel {
  flex: 1 1 auto;
  font-size: 13px;
  font-weight: 600;
}
.${y} .touchWeight {
  color: var(--color-text-secondary);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${y} .noteField {
  background: var(--color-background-body);
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-primary);
  font: inherit;
  font-size: 13px;
  line-height: 1.5;
  min-height: 72px;
  padding: var(--spacing-2) var(--spacing-3);
  resize: vertical;
  width: 100%;
}
.${y} .previewLine {
  background: var(--color-background-muted);
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.55;
  padding: var(--spacing-2) var(--spacing-3);
}
.${y} .previewLine strong {
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}
.${y} .logButton {
  align-items: center;
  background: var(--nds-accent);
  border-radius: 8px;
  color: var(--nds-on-accent);
  display: flex;
  font-size: 13px;
  font-weight: 700;
  gap: var(--spacing-2);
  justify-content: center;
  min-height: 40px;
  padding: 0 var(--spacing-3);
  width: 100%;
}
@media (hover: hover) {
  .${y} .logButton:hover {
    filter: brightness(1.08);
  }
}
.${y} .historyList {
  border-top: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  padding-top: var(--spacing-2);
}
.${y} .historyRow {
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  gap: var(--spacing-2);
  min-height: 44px;
  padding: var(--spacing-2) 0;
}
.${y} .historyRow:last-child {
  border-bottom: 0;
}
.${y} .historyIcon {
  color: var(--color-icon-secondary);
  flex: none;
  margin-top: 2px;
}
.${y} .historyCopy {
  flex: 1 1 auto;
  min-width: 0;
}
.${y} .historyHead {
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 600;
}
.${y} .historyHead strong {
  color: var(--color-text-primary);
}
.${y} .historyNote {
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.5;
  margin-top: 2px;
}
.${y} .historyEmpty {
  border: var(--border-width) dashed var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.5;
  padding: var(--spacing-3);
  text-align: center;
}

/* ---- a11y helpers ---------------------------------------------------------- */
.${y} .visuallyHidden,
.${y}.visuallyHidden {
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

/* ---- responsive: subtraction, not squeeze --------------------------------- */
@media (max-width: 980px) {
  .${y} .board {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }
  .${y} .stageCol {
    flex: none;
    scroll-snap-align: start;
    width: 272px;
  }
  .${y}.coverage {
    align-items: flex-start;
    flex-direction: column;
    gap: var(--spacing-1);
    padding-bottom: var(--spacing-2);
  }
}
@media (max-width: 640px) {
  .${y}.topbar {
    flex-wrap: wrap;
    padding-bottom: var(--spacing-2);
  }
  .${y} .topbarSpring {
    display: none;
  }
  .${y} .officerChips {
    flex: 1 1 100%;
    order: 3;
  }
  .${y} .drawer {
    width: 100%;
  }
}
@media (prefers-reduced-motion: reduce) {
  .${y} *,
  .${y} *::before,
  .${y} *::after {
    animation-duration: 0ms !important;
    transition-duration: 0ms !important;
  }
}
`;function W(){return(0,v.jsxs)(`svg`,{width:`20`,height:`20`,viewBox:`0 0 20 20`,fill:`none`,"aria-hidden":`true`,children:[(0,v.jsx)(`path`,{d:`M3 12c0 3.3 3.1 5.5 7 5.5s7-2.2 7-5.5`,stroke:`currentColor`,strokeWidth:`1.8`,strokeLinecap:`round`}),(0,v.jsx)(`path`,{d:`M10 13V6.5`,stroke:`currentColor`,strokeWidth:`1.8`,strokeLinecap:`round`}),(0,v.jsx)(`circle`,{cx:`10`,cy:`4.4`,r:`1.9`,fill:`currentColor`}),(0,v.jsx)(`path`,{d:`M10 9.5c1.9 0 3.2-1.2 3.6-3-1.9 0-3.2 1.2-3.6 3z`,fill:`currentColor`})]})}function G(e,t,n){let r=210*Math.PI/180,i=-30*Math.PI/180,a=e+n*Math.cos(r),o=t-n*Math.sin(r),s=e+n*Math.cos(i),c=t-n*Math.sin(i);return`M ${a.toFixed(2)} ${o.toFixed(2)} A ${n} ${n} 0 1 1 ${s.toFixed(2)} ${c.toFixed(2)}`}function K({value:e,size:t,label:n}){let r=N(e),i=t===64?26:16,a=t===64?6:4.5,o=t/2,s=G(o,o,i);return(0,v.jsxs)(`svg`,{className:`riskDial ${r}`,width:t,height:t,viewBox:`0 0 ${t} ${t}`,role:`img`,"aria-label":n,children:[(0,v.jsx)(`path`,{className:`dialTrack`,d:s,fill:`none`,strokeWidth:a,strokeLinecap:`round`,pathLength:100}),(0,v.jsx)(`path`,{className:`dialArc`,d:s,fill:`none`,strokeWidth:a,strokeLinecap:`round`,pathLength:100,strokeDasharray:`${Math.max(.5,e)} 100`}),(0,v.jsx)(`text`,{className:`dialValue`,x:o,y:o+(t===64?6:4.5),textAnchor:`middle`,fontSize:t===64?17:11,children:e})]})}function q({donor:e,isOpen:t,onOpen:n}){let i=j[e.kind],a=N(e.riskScore);return(0,v.jsx)(`li`,{children:(0,v.jsxs)(`button`,{type:`button`,id:`nds-card-${e.id}`,className:`donorCard`,"aria-pressed":t,"aria-label":`${e.name} — ${H[e.stage]} ${L(e.amount)}, risk ${e.riskScore} (${P[a]}). Open the touch composer.`,onClick:()=>n(e.id),children:[(0,v.jsxs)(`span`,{className:`cardTop`,children:[(0,v.jsx)(`span`,{className:`kindGlyph`,title:i.label,children:(0,v.jsx)(r,{icon:i.icon,size:`sm`,color:`inherit`})}),(0,v.jsx)(`span`,{className:`donorName`,children:e.name}),(0,v.jsx)(`span`,{className:`officerDot`,title:D[e.officer].name,children:D[e.officer].initials})]}),(0,v.jsxs)(`span`,{className:`cardAmount`,children:[H[e.stage],` `,(0,v.jsx)(`strong`,{className:`num`,children:L(e.amount)}),` · `,e.vehicle]}),(0,v.jsxs)(`span`,{className:`cardRiskRow`,children:[(0,v.jsx)(K,{value:e.riskScore,size:40,label:`Pledge risk ${e.riskScore} of 100`}),(0,v.jsx)(`span`,{className:`tierPill ${a}`,children:P[a]}),(0,v.jsx)(`span`,{className:`lastTouch`,children:z(e)})]}),(0,v.jsxs)(`span`,{className:`nbaChip`,children:[(0,v.jsx)(`span`,{className:`nbaIcon`,children:(0,v.jsx)(r,{icon:d,size:`xsm`,color:`inherit`})}),I(e.stage,e.riskScore)]})]})})}function J({donor:e,onClose:t,onLog:n}){let[i,a]=(0,_.useState)(`call`),[o,s]=(0,_.useState)(``),c=(0,_.useRef)(null);(0,_.useEffect)(()=>{a(`call`),s(``),c.current?.focus({preventScroll:!0})},[e.id]);let l=A.get(i),f=l?.weight??0,m=Math.max(w,e.riskScore-f),h=N(m),g=I(e.stage,m),y=e.stage===`steward`&&e.riskScore>=C&&m<C;return(0,v.jsxs)(`div`,{ref:c,className:`drawer`,role:`dialog`,"aria-label":`Touch composer for ${e.name}`,tabIndex:-1,onKeyDown:e=>{e.key===`Escape`&&(e.stopPropagation(),t())},children:[(0,v.jsxs)(`div`,{className:`drawerHeader`,children:[(0,v.jsxs)(`div`,{className:`drawerTitleBlock`,children:[(0,v.jsx)(`h2`,{className:`drawerDonorName`,children:e.name}),(0,v.jsxs)(`p`,{className:`drawerMeta`,children:[E.find(t=>t.id===e.stage)?.label,` ·`,` `,H[e.stage],` `,(0,v.jsx)(`span`,{className:`num`,children:L(e.amount)}),` ·`,` `,D[e.officer].name]})]}),(0,v.jsx)(`button`,{type:`button`,className:`drawerClose`,"aria-label":`Close the touch composer`,onClick:t,children:(0,v.jsx)(r,{icon:p,size:`sm`,color:`inherit`})})]}),(0,v.jsxs)(`div`,{className:`drawerBody`,children:[(0,v.jsxs)(`div`,{className:`drawerDialRow`,children:[(0,v.jsx)(K,{value:e.riskScore,size:64,label:`Pledge risk ${e.riskScore} of 100 — ${P[N(e.riskScore)]}`}),(0,v.jsxs)(`div`,{className:`drawerDialCopy`,children:[(0,v.jsx)(`span`,{className:`tierPill ${N(e.riskScore)}`,children:P[N(e.riskScore)]}),(0,v.jsxs)(`p`,{className:`nbaNow`,children:[`Next best action:`,` `,(0,v.jsx)(`strong`,{children:I(e.stage,e.riskScore)})]})]})]}),(0,v.jsx)(`p`,{className:`sectionLabel`,id:`nds-touch-types-${e.id}`,children:`Log a stewardship touch`}),(0,v.jsx)(`div`,{className:`touchTypeList`,role:`group`,"aria-labelledby":`nds-touch-types-${e.id}`,children:k.map(e=>(0,v.jsxs)(`button`,{type:`button`,className:`touchTypeRow`,"aria-pressed":i===e.id,onClick:()=>a(e.id),children:[(0,v.jsx)(`span`,{className:`touchIcon`,children:(0,v.jsx)(r,{icon:e.icon,size:`sm`,color:`inherit`})}),(0,v.jsx)(`span`,{className:`touchTypeLabel`,children:e.label}),(0,v.jsxs)(`span`,{className:`touchWeight`,children:[`eases −`,e.weight]})]},e.id))}),(0,v.jsx)(`label`,{className:`visuallyHidden`,htmlFor:`nds-note-${e.id}`,children:`Touch note`}),(0,v.jsx)(`textarea`,{id:`nds-note-${e.id}`,className:`noteField`,placeholder:`What happened? (optional — lands in the history timeline)`,value:o,onChange:e=>s(e.target.value)}),(0,v.jsxs)(`p`,{className:`previewLine`,children:[`Logging a `,l?.label.toLowerCase(),` eases risk`,` `,(0,v.jsx)(`strong`,{children:e.riskScore}),` → `,(0,v.jsx)(`strong`,{children:m}),` (`,P[h],`). Next action becomes “`,g,`”.`,y?` Moves ${L(e.amount)} from at-risk to secured on the campaign bar.`:``]}),(0,v.jsxs)(`button`,{type:`button`,className:`logButton`,onClick:()=>n(e.id,i,o.trim()),children:[(0,v.jsx)(r,{icon:d,size:`sm`,color:`inherit`}),`Log `,l?.label.toLowerCase()]}),(0,v.jsx)(`p`,{className:`sectionLabel`,children:`Touch history`}),e.history.length===0?(0,v.jsx)(`p`,{className:`historyEmpty`,children:`No touches yet — this record was created from the Jun 30 wealth screen. The first logged touch starts the timeline.`}):(0,v.jsx)(`ol`,{className:`historyList`,children:e.history.map((e,t)=>{let n=A.get(e.type);return(0,v.jsxs)(`li`,{className:`historyRow`,children:[(0,v.jsx)(`span`,{className:`historyIcon`,children:(0,v.jsx)(r,{icon:n?.icon??u,size:`sm`,color:`inherit`})}),(0,v.jsxs)(`span`,{className:`historyCopy`,children:[(0,v.jsxs)(`span`,{className:`historyHead`,children:[(0,v.jsx)(`strong`,{children:n?.label??e.type}),` · `,e.dateLabel,e.daysAgo===0?` (today)`:``]}),e.note!==``&&(0,v.jsx)(`p`,{className:`historyNote`,children:e.note})]})]},`${e.dateLabel}-${t}`)})})]})]})}function Y(){let[e,t]=(0,_.useState)(M),[n,r]=(0,_.useState)(`all`),[i,a]=(0,_.useState)(null),[o,s]=(0,_.useState)(``),c=(0,_.useMemo)(()=>B(e),[e]),l=(0,_.useMemo)(()=>V(e),[e]),u=(0,_.useMemo)(()=>n===`all`?e:e.filter(e=>e.officer===n),[e,n]),d=(0,_.useMemo)(()=>{let e=new Map;for(let t of E)e.set(t.id,[]);for(let t of u)e.get(t.stage)?.push(t);return e},[u]),f=(0,_.useMemo)(()=>{let t={pn:0,mw:0,es:0};for(let n of e)t[n.officer]+=1;return t},[e]),p=i==null?null:e.find(e=>e.id===i)??null,b=(0,_.useCallback)(()=>{a(e=>{if(e!=null){let t=document.getElementById(`nds-card-${e}`);t instanceof HTMLElement&&t.focus({preventScroll:!0})}return null})},[]),x=(0,_.useCallback)((e,n,r)=>{let i=A.get(n);i!=null&&t(t=>{let a=t.find(t=>t.id===e);if(a==null)return t;let o=a.riskScore,c=Math.max(w,o-i.weight),l=a.stage===`steward`&&o>=C&&c<C;return s(`Logged ${i.label.toLowerCase()} for ${a.name}. Risk ${o} to ${c} (${P[N(c)]}). Next action: ${I(a.stage,c)}.${l?` ${L(a.amount)} moved from at-risk to secured.`:``}`),t.map(t=>t.id===e?{...t,riskScore:c,history:[{dateLabel:`Today`,daysAgo:0,type:n,note:r===``?`${i.label} logged from the stewardship desk.`:r},...t.history]}:t)})},[]),T=Math.max(0,100-c.securedPct-c.atRiskPct);return(0,v.jsx)(m,{height:`fill`,header:(0,v.jsxs)(g,{hasDivider:!0,padding:0,children:[(0,v.jsx)(`style`,{children:U}),(0,v.jsxs)(`div`,{style:{width:`100%`},children:[(0,v.jsxs)(`div`,{className:`${y} topbar`,children:[(0,v.jsxs)(`div`,{className:`brandCluster`,children:[(0,v.jsx)(`span`,{className:`brandMark`,"aria-hidden":`true`,children:(0,v.jsx)(W,{})}),(0,v.jsxs)(`div`,{className:`brandText`,children:[(0,v.jsxs)(`p`,{className:`eyebrow`,children:[S.org,` · `,S.cycle]}),(0,v.jsxs)(`h1`,{children:[S.name,` — Donor Stewardship Desk`]})]})]}),(0,v.jsx)(`div`,{className:`topbarSpring`}),(0,v.jsxs)(`div`,{className:`officerChips`,role:`group`,"aria-label":`Filter by gift officer`,children:[(0,v.jsxs)(`button`,{type:`button`,className:`officerChip`,"aria-pressed":n===`all`,onClick:()=>r(`all`),children:[(0,v.jsx)(`span`,{className:`chipLabel`,children:`All officers`}),(0,v.jsx)(`span`,{className:`chipCount num`,children:e.length})]}),O.map(e=>(0,v.jsxs)(`button`,{type:`button`,className:`officerChip`,"aria-pressed":n===e,"aria-label":`Show ${D[e].name}'s portfolio, ${f[e]} donors`,onClick:()=>r(t=>t===e?`all`:e),children:[(0,v.jsx)(`span`,{className:`chipLabel`,children:D[e].initials}),(0,v.jsx)(`span`,{className:`chipCount num`,children:f[e]})]},e))]}),(0,v.jsxs)(`p`,{className:`weekCounter`,children:[(0,v.jsx)(`strong`,{className:`num`,children:l}),` touches this week`]})]}),(0,v.jsxs)(`div`,{className:`${y} coverage`,children:[(0,v.jsx)(`div`,{className:`coverageBarWrap`,children:(0,v.jsxs)(`div`,{className:`coverageBar`,role:`img`,"aria-label":`Campaign coverage: ${L(c.secured)} secured and ${L(c.atRisk)} at risk of the ${R(S.goal)} goal`,children:[(0,v.jsx)(`span`,{className:`coverageSecured`,style:{width:`${c.securedPct}%`}}),(0,v.jsx)(`span`,{className:`coverageAtRisk`,style:{width:`${c.atRiskPct}%`}}),(0,v.jsx)(`span`,{style:{width:`${T}%`},"aria-hidden":`true`})]})}),(0,v.jsxs)(`p`,{className:`coverageLegend`,children:[(0,v.jsxs)(`span`,{children:[(0,v.jsx)(`span`,{className:`legendSwatch secured`,"aria-hidden":`true`}),`Secured`,` `,(0,v.jsx)(`strong`,{className:`num`,children:L(c.secured)})]}),(0,v.jsxs)(`span`,{children:[(0,v.jsx)(`span`,{className:`legendSwatch atRisk`,"aria-hidden":`true`}),`At risk`,` `,(0,v.jsx)(`strong`,{className:`num`,children:L(c.atRisk)})]}),(0,v.jsxs)(`span`,{children:[`Goal`,` `,(0,v.jsx)(`strong`,{className:`num`,children:R(S.goal)}),` `,`· `,(0,v.jsxs)(`strong`,{className:`num`,children:[Math.floor(c.securedPct),`%`]}),` `,`secured`]})]})]})]})]}),content:(0,v.jsx)(h,{padding:0,role:`main`,label:`Gift-stage board`,children:(0,v.jsxs)(`div`,{className:`${y} boardwrap`,children:[(0,v.jsx)(`div`,{"aria-live":`polite`,className:`visuallyHidden`,children:o}),(0,v.jsx)(`div`,{className:`board`,children:E.map(e=>{let t=d.get(e.id)??[],r=t.reduce((e,t)=>e+t.amount,0),o=t.filter(e=>e.riskScore>=C).length;return(0,v.jsxs)(`section`,{className:`stageCol`,"aria-label":`${e.label} — ${t.length} donors`,children:[(0,v.jsxs)(`header`,{className:`stageHeader`,children:[(0,v.jsx)(`h2`,{className:`stageName`,children:e.label}),(0,v.jsx)(`span`,{className:`stageCount num`,children:t.length}),o>0&&(0,v.jsxs)(`span`,{className:`stageRiskBadge`,title:`${o} donor${o===1?``:`s`} at risk`,children:[(0,v.jsx)(`span`,{className:`num`,children:o}),` at risk`]}),(0,v.jsxs)(`span`,{className:`stageMoney`,children:[e.moneyLabel,` `,(0,v.jsx)(`strong`,{className:`num`,children:R(r)})]})]}),t.length===0?(0,v.jsxs)(`p`,{className:`emptyCol`,children:[`No `,e.label.toLowerCase(),` donors in`,` `,n===`all`?`this view`:`${D[n].name}'s portfolio`,`. Clear the officer filter to see the full board.`]}):(0,v.jsx)(`ul`,{className:`cardList`,children:t.map(e=>(0,v.jsx)(q,{donor:e,isOpen:i===e.id,onOpen:a},e.id))})]},e.id)})}),p!=null&&(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(`button`,{type:`button`,className:`drawerScrim`,"aria-label":`Close the touch composer`,onClick:b}),(0,v.jsx)(J,{donor:p,onClose:b,onLog:x})]})]})})})}export{Y as default};