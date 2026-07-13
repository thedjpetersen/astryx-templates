import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-DlKHZgO2.js";import{t as i}from"./Icon-DNqmP2EH.js";import{t as a}from"./file-text-Ba54uQGG.js";import{t as o}from"./gavel-ezKqK6Xt.js";import{t as s}from"./minus-7K_0hrAa.js";import{t as c}from"./scale-Bb212Kl3.js";import{t as ee}from"./shield-alert-CQq3gtNR.js";import{i as l,w as u}from"./index-CZ0XLKUx.js";import{n as te,t as ne}from"./LayoutContent-CCL91W7X.js";import{t as re}from"./LayoutHeader-Cy2mWoMf.js";import{t as d}from"./Heading-BBqhYPTB.js";import{t as ie}from"./Badge-0Tj9omHc.js";import{t as f}from"./useToast-Cnc9vFF7.js";var p=e(t(),1),m=n(),h=`tpl-pharmacy-formulary-review`,g=`
.${h} {
  --pfr-accent: light-dark(#047857, #34D399);
  --pfr-accent-tint: light-dark(rgba(4, 120, 87, 0.10), rgba(52, 211, 153, 0.14));
  --pfr-against: light-dark(#B42318, #F97066);
  --pfr-against-tint: light-dark(rgba(180, 35, 24, 0.10), rgba(249, 112, 102, 0.14));
  --pfr-abstain: light-dark(#B54708, #FDB022);
  --pfr-abstain-tint: light-dark(rgba(181, 71, 8, 0.10), rgba(253, 176, 34, 0.16));
  color: var(--color-text-primary);
  font-family: var(--font-family-sans);
}
.${h} *,
.${h} *::before,
.${h} *::after {
  box-sizing: border-box;
}
.${h} button {
  font-family: inherit;
}
.${h} button:focus-visible {
  outline: 2px solid var(--pfr-accent);
  outline-offset: 2px;
}

/* ---- header ---- */
.${h} .brandLockup {
  align-items: center;
  display: flex;
  gap: var(--spacing-2);
  min-width: 0;
}
.${h} .brandMark {
  flex: none;
}
.${h} .brandMeta {
  display: grid;
  gap: 1px;
  min-width: 0;
}
.${h} .headerRow {
  align-items: center;
  display: flex;
  gap: var(--spacing-3);
  min-height: 56px;
  min-width: 0;
  width: 100%;
}
.${h} .headerRight {
  align-items: center;
  display: flex;
  flex: none;
  gap: var(--spacing-2);
}
.${h} .attendanceChip {
  align-items: center;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-secondary);
  display: inline-flex;
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  gap: 6px;
  height: 24px;
  padding: 0 10px;
  white-space: nowrap;
}

/* ---- 3-column session frame ----
   Hand-rolled grid: the <=920px restack below needs media queries that a
   DS grid's inline styles would defeat. 296px rail + 344px recorder leaves
   ~400px for the docket at the ~1045px demo stage. */
.${h} .frame {
  display: grid;
  grid-template-columns: 296px minmax(0, 1fr) 344px;
  height: 100%;
  min-height: 0;
}
.${h} .pane {
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
}
.${h} .paneMatrix {
  border-right: var(--border-width) solid var(--color-border);
}
.${h} .paneRecorder {
  border-left: var(--border-width) solid var(--color-border);
}
.${h} .paneSection {
  flex: none;
  padding: var(--spacing-3);
}
.${h} .paneSection + .paneSection {
  border-top: var(--border-width) solid var(--color-border);
}
.${h} .sectionLabel {
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.06em;
  margin: 0 0 var(--spacing-2);
  text-transform: uppercase;
}

/* ---- coverage matrix: 36px rows ---- */
.${h} .matrixScroll {
  overflow-x: auto;
}
.${h} .matrix {
  border-collapse: collapse;
  min-width: 264px;
  width: 100%;
}
.${h} .matrix th,
.${h} .matrix td {
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 12px;
  height: 36px;
  padding: 0 4px;
}
.${h} .matrix thead th {
  color: var(--color-text-secondary);
  font-size: 10.5px;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-align: center;
  text-transform: uppercase;
}
.${h} .matrix thead th.clsHead {
  text-align: left;
}
.${h} .matrix .clsName {
  color: var(--color-text-primary);
  font-weight: 550;
  max-width: 122px;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${h} .matrix tr.clsActive .clsName {
  color: var(--pfr-accent);
}
.${h} .matrix tr.clsActive td {
  background: var(--pfr-accent-tint);
}
.${h} .matrix td.cell {
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  text-align: center;
}
.${h} .matrix td.cell .cellPill {
  border: var(--border-width) solid transparent;
  border-radius: 6px;
  display: inline-block;
  line-height: 22px;
  min-width: 24px;
  padding: 0 2px;
}
/* Selected motion's movement: dashed FROM cell, solid TO cell. */
.${h} .matrix td.cellFrom .cellPill {
  border-color: var(--pfr-accent);
  border-style: dashed;
  color: var(--color-text-primary);
}
.${h} .matrix td.cellTo .cellPill {
  border-color: var(--pfr-accent);
  color: var(--color-text-primary);
}
/* Cells already moved by a ratified motion this session. */
.${h} .matrix td.cellChanged .cellPill {
  background: var(--pfr-accent-tint);
  color: var(--pfr-accent);
  font-weight: 650;
}
.${h} .matrix tfoot td,
.${h} .matrix tfoot th {
  border-bottom: none;
  color: var(--color-text-secondary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  height: 32px;
  text-align: center;
}
.${h} .matrix tfoot th {
  text-align: left;
}
.${h} .matrixLegend {
  color: var(--color-text-secondary);
  font-size: 11px;
  line-height: 1.5;
  margin: var(--spacing-2) 0 0;
}
.${h} .matrixLegend b {
  color: var(--color-text-primary);
  font-weight: 600;
}

/* ---- session minutes: 40px rows ---- */
.${h} .minutes {
  display: grid;
  gap: 0;
  list-style: none;
  margin: 0;
  padding: 0;
}
.${h} .minuteRow {
  align-items: baseline;
  display: grid;
  gap: var(--spacing-2);
  grid-template-columns: 40px minmax(0, 1fr);
  min-height: 40px;
  padding: var(--spacing-1) 0;
}
.${h} .minuteRow + .minuteRow {
  border-top: var(--border-width) solid var(--color-border);
}
.${h} .minuteClock {
  color: var(--color-text-secondary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}
.${h} .minuteText {
  color: var(--color-text-primary);
  font-size: 12px;
  line-height: 1.45;
}
.${h} .minuteRow.minuteNew .minuteText {
  color: var(--pfr-accent);
}

/* ---- docket column ---- */
.${h} .docketHead {
  background: var(--color-background);
  border-bottom: var(--border-width) solid var(--color-border);
  padding: var(--spacing-3);
  position: sticky;
  top: 0;
  z-index: 2;
}
.${h} .filterRow {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
  margin-top: var(--spacing-2);
}
.${h} .filterChip {
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
.${h} .filterChip[aria-pressed="true"] {
  background: var(--pfr-accent-tint);
  border-color: var(--pfr-accent);
  color: var(--pfr-accent);
  font-weight: 600;
}
.${h} .docketBody {
  display: grid;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
}
.${h} .docketEmpty {
  border: var(--border-width) dashed var(--color-border);
  border-radius: 10px;
  color: var(--color-text-secondary);
  font-size: 12.5px;
  line-height: 1.5;
  padding: var(--spacing-5) var(--spacing-3);
  text-align: center;
}

/* ---- motion cards ---- */
.${h} .motionCard {
  background: transparent;
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  color: inherit;
  cursor: pointer;
  display: grid;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  text-align: left;
  width: 100%;
}
.${h} .motionCard[aria-pressed="true"] {
  border-color: var(--pfr-accent);
  box-shadow: inset 3px 0 0 var(--pfr-accent);
}
.${h} .motionTop {
  align-items: center;
  display: flex;
  gap: var(--spacing-2);
}
.${h} .motionId {
  color: var(--color-text-secondary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.${h} .spring {
  flex: 1;
}
.${h} .motionTitle {
  font-size: 13.5px;
  font-weight: 620;
  line-height: 1.35;
  margin: 0;
}
.${h} .motionMetaRow {
  align-items: center;
  color: var(--color-text-secondary);
  display: flex;
  flex-wrap: wrap;
  font-size: 11.5px;
  gap: var(--spacing-2);
}
.${h} .moveChip {
  align-items: center;
  border: var(--border-width) solid var(--color-border);
  border-radius: 6px;
  display: inline-flex;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  gap: 4px;
  height: 20px;
  padding: 0 6px;
  white-space: nowrap;
}
.${h} .moveChip .moveTo {
  color: var(--pfr-accent);
}
.${h} .evidenceRow {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
}
.${h} .evidenceChip {
  align-items: center;
  background: var(--color-background-muted);
  border-radius: 5px;
  color: var(--color-text-secondary);
  display: inline-flex;
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  gap: 4px;
  height: 20px;
  padding: 0 6px;
  white-space: nowrap;
}
.${h} .motionFoot {
  align-items: center;
  display: flex;
  gap: var(--spacing-2);
}
.${h} .ballotDots {
  display: inline-flex;
  flex: none;
  gap: 3px;
}
.${h} .ballotDot {
  background: var(--color-background-muted);
  border-radius: 999px;
  height: 6px;
  width: 6px;
}
.${h} .ballotDot.dotFilled {
  background: var(--pfr-accent);
}
.${h} .ballotCount {
  color: var(--color-text-secondary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* ---- tally bar: 10px track ---- */
.${h} .tallyBar {
  background: var(--color-background-muted);
  border-radius: 999px;
  display: flex;
  height: 10px;
  overflow: hidden;
  width: 100%;
}
.${h} .tallyBar.tallyCompact {
  height: 8px;
}
.${h} .tallySeg {
  height: 100%;
  transition: width 220ms ease;
}
.${h} .tallySeg.segFor {
  background: var(--pfr-accent);
}
.${h} .tallySeg.segAgainst {
  background: var(--pfr-against);
}
.${h} .tallySeg.segAbstain {
  background: var(--pfr-abstain);
}
.${h} .tallyLegend {
  color: var(--color-text-secondary);
  display: flex;
  flex-wrap: wrap;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  gap: var(--spacing-2);
}
.${h} .tallyLegend .lgFor {
  color: var(--pfr-accent);
  font-weight: 600;
}
.${h} .tallyLegend .lgAgainst {
  color: var(--pfr-against);
  font-weight: 600;
}
.${h} .tallyLegend .lgAbstain {
  color: var(--pfr-abstain);
  font-weight: 600;
}

/* ---- readiness chips ---- */
.${h} .stateChip {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  flex: none;
  font-size: 10.5px;
  font-weight: 650;
  gap: 4px;
  height: 20px;
  letter-spacing: 0.02em;
  padding: 0 8px;
  white-space: nowrap;
}
.${h} .stateChip.stCollecting {
  background: var(--color-background-muted);
  color: var(--color-text-secondary);
}
.${h} .stateChip.stPassing {
  background: var(--pfr-accent-tint);
  color: var(--pfr-accent);
}
.${h} .stateChip.stFailing {
  background: var(--pfr-against-tint);
  color: var(--pfr-against);
}
.${h} .stateChip.stRatified {
  background: var(--pfr-accent);
  /* On-accent text: #FFFFFF on #047857 ≈ 5.5:1 (light); #06251B on
     #34D399 ≈ 8:1 (dark) — white on #34D399 would fail at ~1.9:1. */
  color: light-dark(#FFFFFF, #06251B);
}
.${h} .stateChip.stFailed {
  background: var(--pfr-against);
  /* #FFFFFF on #B42318 ≈ 6.6:1 (light); #2A0A08 on #F97066 ≈ 5.6:1 (dark). */
  color: light-dark(#FFFFFF, #2A0A08);
}

/* ---- vote recorder ---- */
.${h} .recorderHead {
  display: grid;
  gap: var(--spacing-2);
}
.${h} .recorderTitle {
  font-size: 14px;
  font-weight: 650;
  line-height: 1.35;
  margin: 0;
}
.${h} .recorderRationale {
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
}
.${h} .recorderRationale b {
  color: var(--color-text-primary);
  font-weight: 600;
}
.${h} .tallyStack {
  display: grid;
  gap: var(--spacing-2);
}
.${h} .quorumMeter {
  display: grid;
  gap: 6px;
}
.${h} .quorumTrack {
  display: flex;
  gap: 4px;
}
.${h} .quorumSeg {
  background: var(--color-background-muted);
  border-radius: 3px;
  flex: 1;
  height: 12px;
  transition: background-color 180ms ease;
}
.${h} .quorumSeg.qFilled {
  background: var(--pfr-accent);
}
.${h} .quorumSeg.qOverflow {
  background: var(--pfr-accent);
  flex: none;
  opacity: 0.45;
  width: 18px;
}
.${h} .quorumLabel {
  color: var(--color-text-secondary);
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
}
.${h} .quorumLabel.qMet {
  color: var(--pfr-accent);
  font-weight: 600;
}

/* ---- roster: 48px rows, 28px ballot buttons ---- */
.${h} .roster {
  display: grid;
  list-style: none;
  margin: 0;
  padding: 0;
}
.${h} .rosterRow {
  align-items: center;
  display: grid;
  gap: var(--spacing-2);
  grid-template-columns: 28px minmax(0, 1fr) auto;
  min-height: 48px;
  padding: var(--spacing-1) 0;
}
.${h} .rosterRow + .rosterRow {
  border-top: var(--border-width) solid var(--color-border);
}
.${h} .memberAvatar {
  align-items: center;
  background: var(--color-background-muted);
  border-radius: 999px;
  color: var(--color-text-secondary);
  display: inline-flex;
  font-size: 10px;
  font-weight: 650;
  height: 28px;
  justify-content: center;
  letter-spacing: 0.02em;
  width: 28px;
}
.${h} .memberMeta {
  display: grid;
  gap: 1px;
  min-width: 0;
}
.${h} .memberName {
  font-size: 12.5px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${h} .memberRole {
  color: var(--color-text-secondary);
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${h} .memberRecused {
  color: var(--pfr-abstain);
  font-size: 11px;
  font-weight: 600;
}
.${h} .ballotGroup {
  display: inline-flex;
  gap: 4px;
}
.${h} .ballotBtn {
  align-items: center;
  background: transparent;
  border: var(--border-width) solid var(--color-border);
  border-radius: 7px;
  color: var(--color-text-secondary);
  cursor: pointer;
  display: inline-flex;
  height: 28px;
  justify-content: center;
  padding: 0;
  width: 32px;
}
.${h} .ballotBtn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
.${h} .ballotBtn.bFor[aria-pressed="true"] {
  background: var(--pfr-accent-tint);
  border-color: var(--pfr-accent);
  color: var(--pfr-accent);
}
.${h} .ballotBtn.bAgainst[aria-pressed="true"] {
  background: var(--pfr-against-tint);
  border-color: var(--pfr-against);
  color: var(--pfr-against);
}
.${h} .ballotBtn.bAbstain[aria-pressed="true"] {
  background: var(--pfr-abstain-tint);
  border-color: var(--pfr-abstain);
  color: var(--pfr-abstain);
}

/* ---- decision gate ---- */
.${h} .gate {
  display: grid;
  gap: var(--spacing-2);
}
.${h} .gateBtn {
  align-items: center;
  border: var(--border-width) solid transparent;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  font-size: 12.5px;
  font-weight: 650;
  gap: var(--spacing-2);
  justify-content: center;
  min-height: 40px;
  padding: 0 var(--spacing-3);
  width: 100%;
}
.${h} .gateBtn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.${h} .gateBtn.gatePrimary {
  background: var(--pfr-accent);
  /* On-accent text math is at .stateChip.stRatified above. */
  color: light-dark(#FFFFFF, #06251B);
}
.${h} .gateBtn.gateDanger {
  background: transparent;
  border-color: var(--pfr-against);
  color: var(--pfr-against);
}
.${h} .gateHint {
  color: var(--color-text-secondary);
  font-size: 11.5px;
  line-height: 1.5;
}
.${h} .decidedBanner {
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  display: grid;
  gap: 4px;
  padding: var(--spacing-2) var(--spacing-3);
}
.${h} .decidedBanner.dbRatified {
  background: var(--pfr-accent-tint);
  border-color: var(--pfr-accent);
}
.${h} .decidedBanner.dbFailed {
  background: var(--pfr-against-tint);
  border-color: var(--pfr-against);
}
.${h} .decidedTitle {
  font-size: 12.5px;
  font-weight: 650;
}
.${h} .dbRatified .decidedTitle {
  color: var(--pfr-accent);
}
.${h} .dbFailed .decidedTitle {
  color: var(--pfr-against);
}
.${h} .decidedMeta {
  color: var(--color-text-secondary);
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  line-height: 1.5;
}

.${h} .visuallyHidden {
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

/* ---- responsive: restack under 920px (subtraction, not squeeze) ---- */
@media (max-width: 920px) {
  .${h} .frame {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  .${h} .pane {
    overflow-y: visible;
  }
  .${h} .paneMatrix {
    border-right: none;
    border-top: var(--border-width) solid var(--color-border);
    order: 3;
  }
  .${h} .paneDocket {
    order: 1;
  }
  .${h} .paneRecorder {
    border-left: none;
    border-top: var(--border-width) solid var(--color-border);
    order: 2;
  }
  .${h} .docketHead {
    position: static;
  }
}

/* ---- 390px embed: 44px hit targets, header sheds the attendance chip ---- */
@media (max-width: 560px) {
  .${h} .attendanceChip {
    display: none;
  }
  .${h} .ballotBtn {
    height: 44px;
    width: 40px;
  }
  .${h} .rosterRow {
    min-height: 56px;
  }
  .${h} .filterChip {
    min-height: 40px;
  }
  .${h} .motionCard {
    padding: var(--spacing-3) var(--spacing-2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .${h} .tallySeg,
  .${h} .quorumSeg {
    transition: none;
  }
}
`,_=6,v=[{id:`t1`,label:`T1`},{id:`t2`,label:`T2`},{id:`t3`,label:`T3`},{id:`pa`,label:`PA/ST`},{id:`nc`,label:`NC`}],y={t1:`Tier 1 (generic)`,t2:`Tier 2 (preferred)`,t3:`Tier 3 (non-preferred)`,pa:`PA / step therapy`,nc:`Not covered`},b=[{id:`raghavan`,name:`Dr. Priya Raghavan`,initials:`PR`,role:`Chair · Clinical Pharmacy`},{id:`osei`,name:`Dr. Samuel Osei`,initials:`SO`,role:`Infectious Diseases`},{id:`vasquez`,name:`Dr. Elena Vasquez`,initials:`EV`,role:`Cardiology`},{id:`chen`,name:`Dr. Marcus Chen`,initials:`MC`,role:`Endocrinology`},{id:`weiss`,name:`Dr. Hannah Weiss`,initials:`HW`,role:`Psychiatry`},{id:`okafor`,name:`Teresa Okafor, RN`,initials:`TO`,role:`Nursing Practice Council`},{id:`lindqvist`,name:`David Lindqvist, PharmD`,initials:`DL`,role:`Drug Information Service`},{id:`njoroge`,name:`Grace Njoroge`,initials:`GN`,role:`Pharmacy Benefits & Finance`},{id:`ellison`,name:`Dr. Robert Ellison`,initials:`RE`,role:`Quality & Patient Safety`}],x=[{id:`cls-statin`,name:`Statins & lipid agents`,base:{t1:5,t2:2,t3:1,pa:1,nc:1}},{id:`cls-glp1`,name:`GLP-1 receptor agonists`,base:{t1:0,t2:2,t3:2,pa:1,nc:2}},{id:`cls-sglt2`,name:`SGLT2 inhibitors`,base:{t1:0,t2:2,t3:1,pa:0,nc:1}},{id:`cls-doac`,name:`Direct oral anticoagulants`,base:{t1:0,t2:2,t3:1,pa:0,nc:1}},{id:`cls-dmard`,name:`Biologic DMARDs`,base:{t1:0,t2:1,t3:2,pa:3,nc:1}},{id:`cls-ics`,name:`Inhaled corticosteroids / LABA`,base:{t1:2,t2:2,t3:1,pa:0,nc:1}},{id:`cls-ssri`,name:`SSRIs & SNRIs`,base:{t1:6,t2:2,t3:0,pa:0,nc:0}}],S=[{id:`M-2026-038`,title:`Add tirzepatide (Zepbound) 2.5–15 mg pen to Tier 3 with prior authorization and BMI ≥ 30 documentation`,classId:`cls-glp1`,from:`nc`,to:`pa`,requestedBy:`Endocrinology service line`,rationale:`SURMOUNT-4 sustained −25.3% mean body weight at 88 weeks. Budget impact is the docket’s largest; PA criteria mirror the semaglutide policy to prevent dual-agent overlap.`,evidence:[`Monograph 18 pp`,`Budget impact $1.42M/yr`,`Forecast 640 members`],recused:[]},{id:`M-2026-039`,title:`Move rosuvastatin 40 mg to Tier 1 at generic parity`,classId:`cls-statin`,from:`t2`,to:`t1`,requestedBy:`Pharmacy Benefits & Finance`,rationale:`Generic price is now within 4% of atorvastatin; parity removes a step-down prior-notification burden on 2,118 current utilizers.`,evidence:[`Cost delta −$0.11/day`,`Utilization 2,118 members`],recused:[]},{id:`M-2026-040`,title:`Add edoxaban (Savaysa) to Tier 3 non-preferred`,classId:`cls-doac`,from:`nc`,to:`t3`,requestedBy:`Anticoagulation stewardship`,rationale:`Closes the renal-dosing gap for CrCl 15–50 mL/min where apixaban interactions preclude use; expected volume is under 40 members.`,evidence:[`Monograph 11 pp`,`Forecast 38 members`],recused:[]},{id:`M-2026-041`,title:`Require adalimumab-adaz step before ustekinumab in new starts`,classId:`cls-dmard`,from:`t3`,to:`pa`,requestedBy:`Specialty pharmacy program`,rationale:`The biosimilar step saves $31,800 per naive start, but rheumatology cites a 14-week median delay to effective therapy in the crossover cohort. Committee opinion is split.`,evidence:[`Budget impact −$860K/yr`,`Crossover cohort n=212`,`Rheumatology dissent memo`],recused:[]},{id:`M-2026-042`,title:`Move fluticasone/salmeterol DPI (Wixela) to Tier 1`,classId:`cls-ics`,from:`t2`,to:`t1`,requestedBy:`Population health — asthma registry`,rationale:`Registry adherence rises 9 points when maintenance inhalers carry a $0 generic copay; device technique is interchangeable with the brand DPI.`,evidence:[`Adherence +9.2 pts`,`Cost delta −$14.60/mo`],recused:[]},{id:`M-2026-043`,title:`Move vilazodone (Viibryd) to Tier 3 non-preferred`,classId:`cls-ssri`,from:`t2`,to:`t3`,requestedBy:`Drug Information Service`,rationale:`No comparative-efficacy advantage over six Tier 1 generics in the 2026 class review; 94% of new starts show no prior generic trial.`,evidence:[`Class review 22 pp`,`New starts 117/qtr`],recused:[]},{id:`M-2026-044`,title:`Add bexagliflozin (Brenzavvy) to Tier 2 preferred`,classId:`cls-sglt2`,from:`nc`,to:`t2`,requestedBy:`Pharmacy Benefits & Finance`,rationale:`Acquisition cost is 71% below the preferred SGLT2 pair. Dr. Ellison is recused: declared advisory-board honoraria from the manufacturer (Feb 2026 COI filing).`,evidence:[`Cost delta −71%`,`Monograph 9 pp`,`COI filing on record`],recused:[`ellison`]}],ae={"M-2026-038":{raghavan:`for`,osei:`for`,vasquez:`against`,chen:`for`,okafor:`for`,lindqvist:`abstain`},"M-2026-039":{chen:`for`,njoroge:`for`},"M-2026-040":{},"M-2026-041":{raghavan:`against`,osei:`for`,vasquez:`against`,weiss:`against`,lindqvist:`for`,ellison:`abstain`},"M-2026-042":{},"M-2026-043":{weiss:`for`,okafor:`abstain`,njoroge:`for`},"M-2026-044":{raghavan:`for`,chen:`for`,njoroge:`for`,vasquez:`against`,osei:`against`}},C=[{clock:`13:32`,text:`Session opened. 9 of 9 voting members present; quorum threshold set at 6 ballots.`},{clock:`13:38`,text:`Consent agenda ratified — M-2026-037, annual insulin biosimilar interchange list renewal.`},{clock:`13:44`,text:`Dr. Ellison’s conflict declaration on M-2026-044 read into the record; recusal accepted.`}],w=827,T=3;function E(e){let t=w+e*T;return`${String(Math.floor(t/60)).padStart(2,`0`)}:${String(t%60).padStart(2,`0`)}`}function D(e,t){let n=0,r=0,i=0;for(let a of b){if(e.recused.includes(a.id))continue;let o=t[a.id];o===`for`?n+=1:o===`against`?r+=1:o===`abstain`&&(i+=1)}let a=n+r+i,o=a>=_;return{forCount:n,againstCount:r,abstainCount:i,recorded:a,eligible:b.length-e.recused.length,quorumMet:o,carries:o&&n>r}}function O(e){return e.quorumMet?e.carries?`passing`:`failing`:`collecting`}function k(e){return x.find(t=>t.id===e)??x[0]}function oe(e){return S.find(t=>t.id===e)??S[0]}function A(e){return v.find(t=>t.id===e)?.label??e}function se(){return(0,m.jsxs)(`svg`,{className:`brandMark`,width:`26`,height:`26`,viewBox:`0 0 26 26`,fill:`none`,"aria-hidden":!0,style:{color:`var(--pfr-accent)`},children:[(0,m.jsx)(`rect`,{x:`6.5`,y:`3.5`,width:`14`,height:`17`,rx:`2.5`,stroke:`currentColor`,strokeWidth:`1.6`}),(0,m.jsx)(`path`,{d:`M5 7.5v12A3.5 3.5 0 0 0 8.5 23H18`,stroke:`currentColor`,strokeWidth:`1.6`,strokeLinecap:`round`}),(0,m.jsx)(`path`,{d:`M10.5 11.5l2.2 2.2 4-4.4`,stroke:`currentColor`,strokeWidth:`1.8`,strokeLinecap:`round`,strokeLinejoin:`round`})]})}function j({tally:e,isCompact:t}){let n=t=>t/e.eligible*100;return(0,m.jsxs)(`div`,{className:`tallyBar${t===!0?` tallyCompact`:``}`,role:`img`,"aria-label":`Tally: ${e.forCount} for, ${e.againstCount} against, ${e.abstainCount} abstaining, ${e.eligible-e.recorded} not yet recorded of ${e.eligible} eligible`,children:[(0,m.jsx)(`span`,{className:`tallySeg segFor`,style:{width:`${n(e.forCount)}%`}}),(0,m.jsx)(`span`,{className:`tallySeg segAgainst`,style:{width:`${n(e.againstCount)}%`}}),(0,m.jsx)(`span`,{className:`tallySeg segAbstain`,style:{width:`${n(e.abstainCount)}%`}})]})}function M({tally:e}){let t=[];for(let n=0;n<_;n+=1)t.push((0,m.jsx)(`span`,{className:`quorumSeg${n<Math.min(e.recorded,_)?` qFilled`:``}`},n));let n=Math.max(0,e.recorded-_);return(0,m.jsxs)(`div`,{className:`quorumMeter`,children:[(0,m.jsxs)(`div`,{className:`quorumTrack`,role:`img`,"aria-label":e.quorumMet?`Quorum met: ${e.recorded} ballots recorded, quorum is ${_}`:`${e.recorded} of ${_} ballots toward quorum`,children:[t,n>0&&(0,m.jsx)(`span`,{className:`quorumSeg qOverflow`})]}),(0,m.jsx)(`span`,{className:`quorumLabel${e.quorumMet?` qMet`:``}`,children:e.quorumMet?`Quorum met — ${e.recorded} of ${e.eligible} eligible ballots recorded`:`${e.recorded} of ${_} ballots toward quorum (${e.eligible} eligible)`})]})}function N({readiness:e,decision:t}){return t===`ratified`?(0,m.jsx)(`span`,{className:`stateChip stRatified`,children:`Ratified`}):t===`failed`?(0,m.jsx)(`span`,{className:`stateChip stFailed`,children:`Failed`}):e===`passing`?(0,m.jsx)(`span`,{className:`stateChip stPassing`,children:`At quorum · passing`}):e===`failing`?(0,m.jsx)(`span`,{className:`stateChip stFailing`,children:`At quorum · failing`}):(0,m.jsx)(`span`,{className:`stateChip stCollecting`,children:`Collecting ballots`})}var ce=[{id:`all`,label:`All`},{id:`open`,label:`Open`},{id:`ready`,label:`Ready to ratify`},{id:`decided`,label:`Decided`}];function P(){let e=f(),[t,n]=(0,p.useState)(ae),[w,T]=(0,p.useState)({}),[P,le]=(0,p.useState)(C),[F,ue]=(0,p.useState)(S[0].id),[I,L]=(0,p.useState)(`all`),[R,z]=(0,p.useState)(``),B=(0,p.useMemo)(()=>{let e={};for(let n of S)e[n.id]=D(n,t[n.id]??{});return e},[t]),V=S.filter(e=>w[e.id]!==void 0).length,H=(0,p.useMemo)(()=>S.filter(e=>w[e.id]===`ratified`),[w]),U=(0,p.useMemo)(()=>{let e={},t={};for(let n of x)e[n.id]={...n.base},t[n.id]={};for(let n of H)--e[n.classId][n.from],e[n.classId][n.to]+=1,t[n.classId][n.from]=!0,t[n.classId][n.to]=!0;return{cells:e,changed:t}},[H]),W=oe(F),G=B[W.id],K=O(G),q=w[W.id],J=k(W.classId),Y=t[W.id]??{},de={all:S.length,open:S.filter(e=>w[e.id]===void 0).length,ready:S.filter(e=>w[e.id]===void 0&&O(B[e.id])===`passing`).length,decided:V},X=S.filter(e=>I===`open`?w[e.id]===void 0:I===`ready`?w[e.id]===void 0&&O(B[e.id])===`passing`:I===`decided`?w[e.id]!==void 0:!0),Z=(e,t)=>{if(q!==void 0)return;let r=b.find(t=>t.id===e),i=Y[e],a={...Y},o;i===t?(delete a[e],o=`ballot cleared for ${r?.name??e}`):(a[e]=t,o=`${r?.name??e} recorded ${t}`),n(e=>({...e,[W.id]:a}));let s=D(W,a),c=O(s);z(`${W.id}: ${o}. ${s.forCount} for, ${s.againstCount} against, ${s.abstainCount} abstaining — ${c===`collecting`?`${s.recorded} of ${_} toward quorum`:c===`passing`?`at quorum and passing`:`at quorum and failing`}.`)},Q=t=>{if(q!==void 0)return;let n=G,r=E(V),i=`${n.forCount}–${n.againstCount}, ${n.abstainCount} abstaining`,a={clock:r,text:t===`ratified`?`${W.id} ratified ${i}. ${J.name}: agent moves ${A(W.from)} → ${A(W.to)}.`:`${W.id} recorded as failed ${i}. Coverage matrix unchanged.`,isNew:!0};T(e=>({...e,[W.id]:t})),le(e=>[...e.map(e=>({...e,isNew:!1})),a]),e({body:t===`ratified`?`${W.id} ratified ${i} — ${J.name} matrix updated`:`${W.id} failed ${i} — recorded in minutes`,isAutoHide:!0}),z(t===`ratified`?`${W.id} ratified. ${J.name} coverage moved from ${y[W.from]} to ${y[W.to]}.`:`${W.id} recorded as failed. Coverage matrix unchanged.`)},fe=(0,m.jsxs)(`aside`,{className:`pane paneMatrix`,"aria-label":`Therapeutic class coverage matrix and session minutes`,children:[(0,m.jsxs)(`div`,{className:`paneSection`,children:[(0,m.jsx)(`h2`,{className:`sectionLabel`,children:`Coverage matrix`}),(0,m.jsx)(`div`,{className:`matrixScroll`,children:(0,m.jsxs)(`table`,{className:`matrix`,children:[(0,m.jsx)(`thead`,{children:(0,m.jsxs)(`tr`,{children:[(0,m.jsx)(`th`,{className:`clsHead`,scope:`col`,children:`Class`}),v.map(e=>(0,m.jsx)(`th`,{scope:`col`,title:y[e.id],children:e.label},e.id))]})}),(0,m.jsx)(`tbody`,{children:x.map(e=>{let t=e.id===W.classId;return(0,m.jsxs)(`tr`,{className:t?`clsActive`:void 0,children:[(0,m.jsx)(`th`,{className:`clsName`,scope:`row`,title:e.name,children:e.name}),v.map(n=>{let r=U.cells[e.id][n.id],i=U.changed[e.id][n.id]===!0,a=t&&q===void 0&&n.id===W.from,o=t&&q===void 0&&n.id===W.to;return(0,m.jsxs)(`td`,{className:[`cell`,a?`cellFrom`:``,o?`cellTo`:``,i?`cellChanged`:``].filter(Boolean).join(` `),children:[(0,m.jsx)(`span`,{className:`cellPill`,children:r}),(a||o)&&(0,m.jsx)(`span`,{className:`visuallyHidden`,children:a?`moves out under the selected motion`:`gains under the selected motion`})]},n.id)})]},e.id)})}),(0,m.jsx)(`tfoot`,{children:(0,m.jsxs)(`tr`,{children:[(0,m.jsx)(`th`,{scope:`row`,children:`46 agents`}),v.map(e=>(0,m.jsx)(`td`,{children:x.reduce((t,n)=>t+U.cells[n.id][e.id],0)},e.id))]})})]})}),(0,m.jsxs)(`p`,{className:`matrixLegend`,children:[(0,m.jsx)(`b`,{children:`T1`}),` generic · `,(0,m.jsx)(`b`,{children:`T2`}),` preferred · `,(0,m.jsx)(`b`,{children:`T3`}),` non-preferred · `,(0,m.jsx)(`b`,{children:`PA/ST`}),` `,`prior auth / step therapy · `,(0,m.jsx)(`b`,{children:`NC`}),` not covered. Dashed cell = moves out under the selected motion; solid outline = gains. Filled cells were changed by a ratification this session.`]})]}),(0,m.jsxs)(`div`,{className:`paneSection`,children:[(0,m.jsx)(`h2`,{className:`sectionLabel`,children:`Session minutes`}),(0,m.jsx)(`ol`,{className:`minutes`,children:P.map((e,t)=>(0,m.jsxs)(`li`,{className:`minuteRow${e.isNew===!0?` minuteNew`:``}`,children:[(0,m.jsx)(`span`,{className:`minuteClock`,children:e.clock}),(0,m.jsx)(`span`,{className:`minuteText`,children:e.text})]},`${e.clock}-${t}`))})]})]}),pe=(0,m.jsxs)(`section`,{className:`pane paneDocket`,"aria-label":`Motion docket`,children:[(0,m.jsxs)(`div`,{className:`docketHead`,children:[(0,m.jsx)(d,{level:4,accessibilityLevel:2,children:`Q3 docket`}),(0,m.jsx)(`div`,{className:`filterRow`,role:`group`,"aria-label":`Docket filters`,children:ce.map(e=>(0,m.jsxs)(`button`,{type:`button`,className:`filterChip`,"aria-pressed":I===e.id,onClick:()=>L(e.id),children:[e.label,(0,m.jsxs)(`span`,{"aria-hidden":!0,children:[`(`,de[e.id],`)`]})]},e.id))})]}),(0,m.jsx)(`div`,{className:`docketBody`,children:X.length===0?(0,m.jsx)(`div`,{className:`docketEmpty`,children:`No motions match this filter yet. Record ballots in the vote recorder — motions land in “Ready to ratify” the moment they reach quorum with a passing majority.`}):X.map(e=>{let t=B[e.id],n=O(t),r=w[e.id],o=k(e.classId),s=[];for(let e=0;e<_;e+=1)s.push((0,m.jsx)(`span`,{className:`ballotDot${e<Math.min(t.recorded,_)?` dotFilled`:``}`},e));return(0,m.jsxs)(`button`,{type:`button`,className:`motionCard`,"aria-pressed":e.id===F,onClick:()=>ue(e.id),children:[(0,m.jsxs)(`span`,{className:`motionTop`,children:[(0,m.jsx)(`span`,{className:`motionId`,children:e.id}),(0,m.jsx)(`span`,{className:`spring`}),(0,m.jsx)(N,{readiness:n,decision:r})]}),(0,m.jsx)(`span`,{className:`motionTitle`,children:e.title}),(0,m.jsxs)(`span`,{className:`motionMetaRow`,children:[(0,m.jsx)(`span`,{children:o.name}),(0,m.jsxs)(`span`,{className:`moveChip`,children:[A(e.from),(0,m.jsx)(`span`,{"aria-hidden":!0,children:`→`}),(0,m.jsx)(`span`,{className:`moveTo`,children:A(e.to)}),(0,m.jsxs)(`span`,{className:`visuallyHidden`,children:[`— moves from `,y[e.from],` to `,y[e.to]]})]})]}),(0,m.jsx)(`span`,{className:`evidenceRow`,children:e.evidence.map(e=>(0,m.jsxs)(`span`,{className:`evidenceChip`,children:[(0,m.jsx)(i,{icon:a,size:`sm`,color:`inherit`}),e]},e))}),(0,m.jsxs)(`span`,{className:`motionFoot`,children:[(0,m.jsx)(j,{tally:t,isCompact:!0}),(0,m.jsx)(`span`,{className:`ballotDots`,"aria-hidden":!0,children:s}),(0,m.jsxs)(`span`,{className:`ballotCount`,children:[t.recorded,`/`,_]})]})]},e.id)})})]}),$=_-G.recorded,me=(0,m.jsxs)(`aside`,{className:`pane paneRecorder`,"aria-label":`Vote recorder`,children:[(0,m.jsxs)(`div`,{className:`paneSection recorderHead`,children:[(0,m.jsx)(`h2`,{className:`sectionLabel`,children:`Vote recorder`}),(0,m.jsxs)(`div`,{className:`motionTop`,children:[(0,m.jsx)(`span`,{className:`motionId`,children:W.id}),(0,m.jsx)(`span`,{className:`spring`}),(0,m.jsx)(N,{readiness:K,decision:q})]}),(0,m.jsx)(`p`,{className:`recorderTitle`,children:W.title}),(0,m.jsxs)(`div`,{className:`motionMetaRow`,children:[(0,m.jsx)(`span`,{children:J.name}),(0,m.jsxs)(`span`,{className:`moveChip`,children:[A(W.from),(0,m.jsx)(`span`,{"aria-hidden":!0,children:`→`}),(0,m.jsx)(`span`,{className:`moveTo`,children:A(W.to)})]})]}),(0,m.jsxs)(`p`,{className:`recorderRationale`,children:[(0,m.jsxs)(`b`,{children:[`Requested by `,W.requestedBy,`.`]}),` `,W.rationale]})]}),(0,m.jsxs)(`div`,{className:`paneSection`,children:[(0,m.jsx)(`h3`,{className:`sectionLabel`,children:`Tally`}),(0,m.jsxs)(`div`,{className:`tallyStack`,children:[(0,m.jsx)(j,{tally:G}),(0,m.jsxs)(`div`,{className:`tallyLegend`,children:[(0,m.jsxs)(`span`,{className:`lgFor`,children:[G.forCount,` For`]}),(0,m.jsxs)(`span`,{className:`lgAgainst`,children:[G.againstCount,` Against`]}),(0,m.jsxs)(`span`,{className:`lgAbstain`,children:[G.abstainCount,` Abstain`]}),(0,m.jsxs)(`span`,{children:[G.eligible-G.recorded,` unrecorded`]})]}),(0,m.jsx)(M,{tally:G})]})]}),(0,m.jsxs)(`div`,{className:`paneSection`,children:[(0,m.jsx)(`h3`,{className:`sectionLabel`,children:`Roster — record ballots`}),(0,m.jsx)(`ul`,{className:`roster`,children:b.map(e=>{let t=W.recused.includes(e.id),n=t?void 0:Y[e.id],r=t||q!==void 0;return(0,m.jsxs)(`li`,{className:`rosterRow`,children:[(0,m.jsx)(`span`,{className:`memberAvatar`,"aria-hidden":!0,children:e.initials}),(0,m.jsxs)(`span`,{className:`memberMeta`,children:[(0,m.jsx)(`span`,{className:`memberName`,children:e.name}),t?(0,m.jsx)(`span`,{className:`memberRecused`,children:`Recused — conflict declared`}):(0,m.jsx)(`span`,{className:`memberRole`,children:e.role})]}),(0,m.jsxs)(`span`,{className:`ballotGroup`,role:`group`,"aria-label":`Ballot for ${e.name}`,children:[(0,m.jsx)(`button`,{type:`button`,className:`ballotBtn bFor`,"aria-pressed":n===`for`,"aria-label":`${e.name}: vote for`,disabled:r,onClick:()=>Z(e.id,`for`),children:(0,m.jsx)(i,{icon:u,size:`sm`,color:`inherit`})}),(0,m.jsx)(`button`,{type:`button`,className:`ballotBtn bAgainst`,"aria-pressed":n===`against`,"aria-label":`${e.name}: vote against`,disabled:r,onClick:()=>Z(e.id,`against`),children:(0,m.jsx)(i,{icon:l,size:`sm`,color:`inherit`})}),(0,m.jsx)(`button`,{type:`button`,className:`ballotBtn bAbstain`,"aria-pressed":n===`abstain`,"aria-label":`${e.name}: abstain`,disabled:r,onClick:()=>Z(e.id,`abstain`),children:(0,m.jsx)(i,{icon:s,size:`sm`,color:`inherit`})})]})]},e.id)})})]}),(0,m.jsxs)(`div`,{className:`paneSection gate`,children:[(0,m.jsx)(`h3`,{className:`sectionLabel`,children:`Decision`}),q===void 0?(0,m.jsxs)(m.Fragment,{children:[(0,m.jsxs)(`button`,{type:`button`,className:`gateBtn gatePrimary`,disabled:K!==`passing`,onClick:()=>Q(`ratified`),children:[(0,m.jsx)(i,{icon:o,size:`sm`,color:`inherit`}),`Ratify motion`]}),(0,m.jsxs)(`button`,{type:`button`,className:`gateBtn gateDanger`,disabled:!G.quorumMet,onClick:()=>Q(`failed`),children:[(0,m.jsx)(i,{icon:ee,size:`sm`,color:`inherit`}),`Record as failed`]}),(0,m.jsx)(`span`,{className:`gateHint`,children:K===`collecting`?`Needs ${$} more ballot${$===1?``:`s`} to reach quorum. Abstentions count toward quorum but not toward the majority.`:K===`passing`?`Quorum met with a passing majority — ratifying moves the agent count in the coverage matrix and enters the result in the minutes.`:`Quorum met but the majority opposes. Record as failed, or keep collecting ballots.`})]}):(0,m.jsxs)(`div`,{className:`decidedBanner ${q===`ratified`?`dbRatified`:`dbFailed`}`,children:[(0,m.jsx)(`span`,{className:`decidedTitle`,children:q===`ratified`?`Motion ratified`:`Motion failed`}),(0,m.jsxs)(`span`,{className:`decidedMeta`,children:[G.forCount,`–`,G.againstCount,`,`,` `,G.abstainCount,` abstaining ·`,` `,q===`ratified`?`${J.name}: ${A(W.from)} → ${A(W.to)} applied to the matrix`:`coverage matrix unchanged`,` `,`· entered in minutes`]})]})]})]});return(0,m.jsxs)(`div`,{className:h,style:{height:`100dvh`,width:`100%`},children:[(0,m.jsx)(`style`,{children:g}),(0,m.jsx)(te,{height:`fill`,header:(0,m.jsx)(re,{hasDivider:!0,children:(0,m.jsxs)(`div`,{className:`headerRow`,children:[(0,m.jsxs)(`div`,{className:`brandLockup`,children:[(0,m.jsx)(se,{}),(0,m.jsxs)(`div`,{className:`brandMeta`,children:[(0,m.jsx)(d,{level:5,accessibilityLevel:1,maxLines:1,children:`Compendia · P&T Committee`}),(0,m.jsx)(r,{type:`supporting`,size:`sm`,color:`secondary`,maxLines:1,children:`Q3 formulary session — Jul 14, 2026`})]})]}),(0,m.jsx)(`span`,{className:`spring`}),(0,m.jsxs)(`div`,{className:`headerRight`,children:[(0,m.jsx)(ie,{label:`${V} of ${S.length} decided`,variant:V===S.length?`success`:`neutral`}),(0,m.jsxs)(`span`,{className:`attendanceChip`,children:[(0,m.jsx)(i,{icon:c,size:`sm`,color:`inherit`}),`9 present · quorum`,` `,_]})]})]})}),content:(0,m.jsxs)(ne,{padding:0,children:[(0,m.jsx)(`div`,{"aria-live":`polite`,className:`visuallyHidden`,children:R}),(0,m.jsxs)(`div`,{className:`frame`,children:[fe,pe,me]})]})})]})}export{P as default};