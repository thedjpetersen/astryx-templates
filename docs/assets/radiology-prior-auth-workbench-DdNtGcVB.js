import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-DAwHU7YM.js";import{t as i}from"./Icon-QWhqeGsc.js";import{t as a}from"./badge-check-BcKh7OaW.js";import{t as o}from"./database-S9sPUaut.js";import{t as s}from"./file-text-D-7LY0xi.js";import{t as c}from"./paperclip-BBDEmt6s.js";import{t as l}from"./send-L-WBmF6l.js";import{b as u,i as ee,o as d,s as f,v as te}from"./index-DDmS-Cgf.js";import{t as p}from"./Tooltip-XDRm9Z-w.js";import{t as m}from"./HStack-2WTukjNp.js";import{t as ne}from"./VStack-B8U-hI0Y.js";import{t as h}from"./StackItem-Ca9P7L2I.js";import{n as re,t as ie}from"./LayoutContent-CCL91W7X.js";import{t as ae}from"./LayoutHeader-Cy2mWoMf.js";import{t as oe}from"./Heading-BqGjHnff.js";import{t as se}from"./Badge-0Tj9omHc.js";import{t as g}from"./Button-BqXaaLop.js";var _=e(t(),1),v=n(),y=`tpl-radiology-prior-auth-workbench`,b=`light-dark(#0E7490, #4DD4EC)`,x=`light-dark(rgba(14, 116, 144, 0.10), rgba(77, 212, 236, 0.14))`,S=`light-dark(#15803D, #4ADE80)`,C=`light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))`,w=`light-dark(#B45309, #F5B458)`,T=`light-dark(rgba(180, 83, 9, 0.12), rgba(245, 180, 88, 0.16))`,E=`light-dark(#DC2626, #F87171)`,D=`light-dark(rgba(220, 38, 38, 0.10), rgba(248, 113, 113, 0.14))`,O=[{id:`A-24187`,patient:`Elena Vasquez`,demo:`54F · MRN 004-1187`,cpt:`72148`,study:`MRI lumbar spine without contrast`,studyShort:`MRI lumbar`,modality:`MRI`,icd:`M54.16 · M51.26`,payer:`Meridian Health PPO`,payerShort:`Meridian PPO`,policyRef:`MER-RAD-014`,orderedBy:`N. Oyelaran, MD · PM&R`,due:`Due Jul 9 · 14:00`,dueTone:`normal`,status:`review`,base:12,rules:[{id:`c1`,code:`C1`,text:`≥ 6 weeks of documented conservative therapy (PT, chiropractic, or home program)`,weight:14,initial:{sourceId:`d-pt`,verified:!0}},{id:`c2`,code:`C2`,text:`Progressive neurologic deficit or radiculopathy on exam`,weight:16},{id:`c3`,code:`C3`,text:`Plain radiographs of the lumbar spine within 90 days`,weight:18},{id:`c4`,code:`C4`,text:`No lumbar MRI within the prior 12 months`,weight:12,initial:{sourceId:`s-claims`,verified:!0}},{id:`c5`,code:`C5`,text:`Documented failure of an adequate NSAID trial`,weight:14,initial:{sourceId:`p-nsaid`,verified:!1}}],sources:[{id:`p-radic`,kind:`passage`,label:`H&P — exam findings`,meta:`Clinical note · Jul 6 2026`,ruleIds:[`c2`]},{id:`p-pt`,kind:`passage`,label:`H&P — conservative course`,meta:`Clinical note · Jul 6 2026`,ruleIds:[`c1`]},{id:`p-nsaid`,kind:`passage`,label:`H&P — medication trial`,meta:`Clinical note · Jul 6 2026`,ruleIds:[`c5`]},{id:`p-xray`,kind:`passage`,label:`H&P — imaging summary`,meta:`Clinical note · Jul 6 2026`,ruleIds:[`c3`]},{id:`d-pt`,kind:`document`,label:`PT discharge summary — Meridian Rehab`,meta:`PDF · 16 visits · Jun 12 2026`,ruleIds:[`c1`]},{id:`d-xray`,kind:`document`,label:`Lumbar spine X-ray report — Meridian Imaging`,meta:`Report · acc MI-77410 · May 22 2026`,ruleIds:[`c3`]},{id:`d-meds`,kind:`document`,label:`Pharmacy fill history`,meta:`CSV · naproxen, meloxicam · Jul 1 2026`,ruleIds:[`c5`]},{id:`s-claims`,kind:`system`,label:`Claims history check — no lumbar MRI since Jul 2025`,meta:`Auto-verified · payer clearinghouse`,ruleIds:[`c4`]}],note:[{heading:`History of present illness`,segments:[`54-year-old female with 9 weeks of axial low back pain radiating below the left knee into the dorsal foot after a lifting injury on 2026-05-04. `,{p:`p-radic`,text:`Interval exam shows new left ankle dorsiflexion weakness (4/5) and a positive straight-leg raise at 40 degrees.`},` Denies bowel or bladder change; no saddle anesthesia.`]},{heading:`Conservative management`,segments:[{p:`p-pt`,text:`Completed 8 weeks of directed physical therapy at Meridian Rehab (16 visits, discharged 2026-06-12) without durable relief.`},` `,{p:`p-nsaid`,text:`Trialed naproxen 500 mg BID for 6 weeks, stopped for epigastric pain; then meloxicam 15 mg daily for 3 weeks without benefit.`}]},{heading:`Imaging & plan`,segments:[{p:`p-xray`,text:`Weight-bearing lumbar radiographs 2026-05-22 show grade 1 L4–L5 spondylolisthesis without acute fracture.`},` No advanced lumbar imaging in the prior 12 months. Requesting MRI lumbar spine without contrast (CPT 72148) for progressive left L5 radiculopathy.`]}]},{id:`A-24186`,patient:`Marcus Webb`,demo:`61M · MRN 002-8834`,cpt:`71260`,study:`CT chest with contrast`,studyShort:`CT chest`,modality:`CT`,icd:`R91.1`,payer:`Lakeshore Medicare Advantage`,payerShort:`Lakeshore MA`,policyRef:`LKS-RAD-201`,orderedBy:`A. Reyes, MD · Pulmonology`,due:`Due Jul 9 · 11:30`,dueTone:`normal`,status:`review`,base:15,rules:[{id:`w1`,code:`W1`,text:`Prior imaging identifying the nodule under surveillance`,weight:16,initial:{sourceId:`d-prior-ct`,verified:!0}},{id:`w2`,code:`W2`,text:`Follow-up interval consistent with Fleischner Society guidance`,weight:14},{id:`w3`,code:`W3`,text:`Ordered by pulmonology or with documented specialty referral`,weight:10,initial:{sourceId:`s-referral`,verified:!0}}],sources:[{id:`p-nodule`,kind:`passage`,label:`Note — index finding`,meta:`Clinical note · Jul 2 2026`,ruleIds:[`w1`]},{id:`p-fleisch`,kind:`passage`,label:`Note — surveillance rationale`,meta:`Clinical note · Jul 2 2026`,ruleIds:[`w2`]},{id:`d-prior-ct`,kind:`document`,label:`CT chest report — index study`,meta:`Report · acc MI-88213 · Jan 9 2026`,ruleIds:[`w1`]},{id:`s-referral`,kind:`system`,label:`Referral check — Lakeshore Pulmonology on file`,meta:`Auto-verified · referral #LP-2091`,ruleIds:[`w3`]}],note:[{heading:`Indication`,segments:[`61-year-old male, 30 pack-year former smoker (quit 2019). `,{p:`p-nodule`,text:`CT chest 2026-01-09 identified an 8 mm solid right-upper-lobe nodule (accession MI-88213).`}]},{heading:`Surveillance rationale`,segments:[{p:`p-fleisch`,text:`Per Fleischner Society guidance for a single solid 8 mm nodule in a high-risk patient, follow-up CT at 6–12 months is indicated; this order falls at month 6.`},` Referred from Lakeshore Pulmonology, Dr. A. Reyes.`]}]},{id:`A-24185`,patient:`Priya Raghavan`,demo:`38F · MRN 006-2251`,cpt:`70553`,study:`MRI brain with and without contrast`,studyShort:`MRI brain`,modality:`MRI`,icd:`G50.0`,payer:`Meridian Health PPO`,payerShort:`Meridian PPO`,policyRef:`MER-RAD-032`,orderedBy:`T. Nakagawa, MD · Neurology`,due:`Due Jul 10 · 09:00`,dueTone:`normal`,status:`review`,base:10,rules:[{id:`r1`,code:`R1`,text:`Symptoms consistent with a cranial neuropathy`,weight:12,initial:{sourceId:`p-tn`,verified:!0}},{id:`r2`,code:`R2`,text:`No MRI brain within the prior 6 months`,weight:10,initial:{sourceId:`s-claims-b`,verified:!0}},{id:`r3`,code:`R3`,text:`Neurology consult on file`,weight:12,initial:{sourceId:`d-neuro`,verified:!0}}],sources:[{id:`p-tn`,kind:`passage`,label:`Note — presentation`,meta:`Clinical note · Jul 5 2026`,ruleIds:[`r1`]},{id:`d-neuro`,kind:`document`,label:`Neurology consult — T. Nakagawa, MD`,meta:`PDF · Jul 3 2026`,ruleIds:[`r3`]},{id:`s-claims-b`,kind:`system`,label:`Claims history check — no MRI brain since 2024`,meta:`Auto-verified · payer clearinghouse`,ruleIds:[`r2`]}],note:[{heading:`Indication`,segments:[{p:`p-tn`,text:`New-onset right V2 lancinating facial pain, seconds-long, triggered by chewing — clinically trigeminal neuralgia.`},` MRI brain with and without contrast requested to exclude a compressive lesion. All MER-RAD-032 criteria verified at intake by K. Ellison, RN.`]}]},{id:`A-24183`,patient:`Dale Kowalczyk-Brennan`,demo:`72M · MRN 001-0492`,cpt:`74178`,study:`CT abdomen and pelvis with contrast`,studyShort:`CT abd/pelvis`,modality:`CT`,icd:`R10.84`,payer:`Beacon State Medicaid`,payerShort:`Beacon Medicaid`,policyRef:`BSM-RAD-118`,orderedBy:`External — Ridgeline Family Medicine`,due:`Due today · 17:30`,dueTone:`urgent`,status:`review`,base:16,rules:[{id:`k1`,code:`K1`,text:`Documented red-flag symptoms or acute abdomen findings`,weight:18},{id:`k2`,code:`K2`,text:`Prior ultrasound or plain film where clinically applicable`,weight:15},{id:`k3`,code:`K3`,text:`Renal function documented within 30 days (contrast study)`,weight:12,initial:{sourceId:`d-renal`,verified:!1}},{id:`k4`,code:`K4`,text:`No duplicate CT abdomen/pelvis within 30 days`,weight:10,initial:{sourceId:`s-dup`,verified:!0}}],sources:[{id:`d-renal`,kind:`document`,label:`Outside lab fax — eGFR 54`,meta:`Scan · legibility poor · Jun 30 2026`,ruleIds:[`k3`]},{id:`s-dup`,kind:`system`,label:`Duplicate-study check — none in 30 days`,meta:`Auto-verified · payer clearinghouse`,ruleIds:[`k4`]}],note:[{heading:`External progress note (scanned)`,segments:[`72-year-old male with two weeks of vague abdominal discomfort. Exam benign; vitals stable. Outside labs pending; no imaging on file at Meridian. Referral packet did not include red-flag documentation or prior imaging.`]}]},{id:`A-24181`,patient:`Janet Okafor`,demo:`45F · MRN 003-7719`,cpt:`73221`,study:`MRI shoulder without contrast, right`,studyShort:`MRI shoulder`,modality:`MRI`,icd:`M75.101`,payer:`Meridian Health PPO`,payerShort:`Meridian PPO`,policyRef:`MER-RAD-021`,orderedBy:`S. Marsh, DO · Orthopedics`,due:`Submitted Jul 7 · 16:12`,dueTone:`normal`,status:`submitted`,base:11,rules:[{id:`o1`,code:`O1`,text:`≥ 4 weeks conservative therapy for rotator cuff pathology`,weight:14,initial:{sourceId:`d-ortho`,verified:!0}},{id:`o2`,code:`O2`,text:`Weakness or positive impingement signs on exam`,weight:12,initial:{sourceId:`d-ortho`,verified:!0}}],sources:[{id:`d-ortho`,kind:`document`,label:`Ortho clinic note — S. Marsh, DO`,meta:`PDF · Jul 1 2026`,ruleIds:[`o1`,`o2`]}],note:[{heading:`Packet summary`,segments:[`Submitted to Meridian Health PPO on Jul 7 at 16:12 with the ortho clinic note attached. Awaiting payer determination — turnaround SLA 72 h.`]}]},{id:`A-24180`,patient:`Sam Delgado`,demo:`29M · MRN 007-5580`,cpt:`70486`,study:`CT maxillofacial (sinus) without contrast`,studyShort:`CT sinus`,modality:`CT`,icd:`J32.4`,payer:`Lakeshore Medicare Advantage`,payerShort:`Lakeshore MA`,policyRef:`LKS-RAD-090`,orderedBy:`External — Harborview ENT`,due:`Denied Jul 7 · appeal window 30d`,dueTone:`urgent`,status:`denied`,base:20,denialReason:`Medical-necessity criterion D1 not met — maximal medical therapy not documented before imaging.`,rules:[{id:`d1`,code:`D1`,text:`≥ 4 weeks maximal medical therapy for chronic sinusitis`,weight:17},{id:`d2`,code:`D2`,text:`Symptoms persisting beyond 12 weeks`,weight:12,initial:{sourceId:`d-ent`,verified:!0}}],sources:[{id:`d-ent`,kind:`document`,label:`ENT note — symptom timeline`,meta:`PDF · Jun 24 2026`,ruleIds:[`d2`]}],note:[{heading:`Denial summary`,segments:[`Payer peer reviewer found no documentation of an adequate antibiotic + intranasal steroid course. Peer-to-peer scheduled Jul 10 · 08:30 with Dr. Feld (Lakeshore medical director).`]}]}],ce=new Map(O.map(e=>[e.id,e]));function le(){let e={};for(let t of O)for(let n of t.rules)n.initial!==void 0&&(e[`${t.id}.${n.id}`]={...n.initial});return e}function k(e,t){return e.sources.filter(e=>e.ruleIds.includes(t))}function A(e,t,n){let r=n[`${e.id}.${t.id}`];return r===void 0?k(e,t.id).length>0?`available`:`missing`:r.verified?`satisfied`:`unverified`}function j(e,t){return e===`satisfied`?0:e===`unverified`?Math.ceil(t/2):t}function M(e,t){return e.rules.reduce((n,r)=>n+j(A(e,r,t),r.weight),e.base)}function N(e){return e<25?`low`:e<50?`moderate`:`high`}function P(e,t){return e.rules.every(n=>A(e,n,t)===`satisfied`)}var F={low:`low`,moderate:`moderate`,high:`high`},ue=`
.${y} {
  font-family: var(--font-family-sans);
}
.${y} button {
  font: inherit;
  color: inherit;
}
.${y} .rpa-focusable:focus-visible {
  outline: 2px solid ${b};
  outline-offset: 2px;
}
.${y} .rpa-header-row {
  padding: var(--spacing-2) var(--spacing-4);
  min-height: 56px;
  box-sizing: border-box;
}
.${y} .rpa-mark {
  display: inline-flex;
  flex-shrink: 0;
  color: ${b};
}
.${y} .rpa-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 2px 10px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${y} .rpa-chip strong { color: var(--color-text-primary); font-weight: 700; }
.${y} .rpa-chip--ok { color: ${S}; border-color: ${S}; background: ${C}; }
.${y} .rpa-chip--ok strong { color: ${S}; }
.${y} .rpa-chip--risk { color: ${E}; border-color: ${E}; background: ${D}; }
.${y} .rpa-chip--risk strong { color: ${E}; }
/* --- frame ---------------------------------------------------------------- */
.${y} .rpa-frame {
  height: 100%;
  min-height: 0;
  display: flex;
  position: relative;
}
/* --- queue: 300px, 76px rows ----------------------------------------------- */
.${y} .rpa-queue {
  flex: 0 0 300px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-right: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
}
.${y} .rpa-queue-head {
  flex-shrink: 0;
  padding: var(--spacing-2) var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.${y} .rpa-queue-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.${y} .rpa-qrow {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  width: 100%;
  min-height: 76px;
  box-sizing: border-box;
  padding: var(--spacing-2) var(--spacing-3);
  border: none;
  border-bottom: var(--border-width) solid var(--color-border);
  background: transparent;
  text-align: start;
  cursor: pointer;
}
.${y} .rpa-qrow[aria-pressed='true'] {
  background: ${x};
  box-shadow: inset 3px 0 0 ${b};
}
.${y} .rpa-qrow-top {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.${y} .rpa-qrow-name {
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
}
/* 22px live risk pip */
.${y} .rpa-pip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  height: 22px;
  box-sizing: border-box;
  padding: 0 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
}
.${y} .rpa-pip--low { color: ${S}; border-color: ${S}; background: ${C}; }
.${y} .rpa-pip--moderate { color: ${w}; border-color: ${w}; background: ${T}; }
.${y} .rpa-pip--high { color: ${E}; border-color: ${E}; background: ${D}; }
.${y} .rpa-qrow-line {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${y} .rpa-due--urgent { color: ${E}; font-weight: 600; }
/* --- work column ------------------------------------------------------------ */
.${y} .rpa-work {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
/* verdict banner: 44px */
.${y} .rpa-verdict {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  box-sizing: border-box;
  padding: var(--spacing-1) var(--spacing-4);
  font-size: 13px;
  font-weight: 600;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${y} .rpa-verdict strong { font-variant-numeric: tabular-nums; }
.${y} .rpa-verdict--ready { color: ${S}; background: ${C}; }
.${y} .rpa-verdict--blocked-moderate { color: ${w}; background: ${T}; }
.${y} .rpa-verdict--blocked-high { color: ${E}; background: ${D}; }
.${y} .rpa-verdict--submitted { color: var(--color-text-secondary); background: var(--color-background-muted); }
.${y} .rpa-verdict--denied { color: ${E}; background: ${D}; }
/* patient banner: min 84px, gauge on the trailing edge */
.${y} .rpa-patient {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-2) var(--spacing-5);
  min-height: 84px;
  box-sizing: border-box;
  padding: var(--spacing-2) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${y} .rpa-patient-main {
  flex: 1 1 320px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.${y} .rpa-patient-title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 14px;
  font-weight: 700;
}
.${y} .rpa-patient-title .rpa-demo {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.${y} .rpa-patient-line {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.${y} .rpa-gauge {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.${y} .rpa-gauge-num {
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.${y} .rpa-gauge-cap {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
/* --- panes: rules + evidence -------------------------------------------------- */
.${y} .rpa-panes {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(320px, 1fr) 384px;
}
.${y} .rpa-pane {
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-3) var(--spacing-4);
}
.${y} .rpa-pane--evidence {
  border-left: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
}
.${y} .rpa-pane-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: var(--spacing-2);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.${y} .rpa-pane-head .rpa-pane-meta {
  margin-inline-start: auto;
  font-weight: 600;
  letter-spacing: normal;
  text-transform: none;
  font-variant-numeric: tabular-nums;
}
/* criterion rows: min 64px */
.${y} .rpa-rule {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 64px;
  box-sizing: border-box;
  padding: var(--spacing-2) 0;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${y} .rpa-rule-top {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.${y} .rpa-rule-code {
  flex-shrink: 0;
  width: 26px;
  font-size: 12px;
  font-weight: 700;
  color: ${b};
  font-variant-numeric: tabular-nums;
}
.${y} .rpa-rule--active .rpa-rule-code { text-decoration: underline; }
.${y} .rpa-rule-text {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  line-height: 1.35;
}
.${y} .rpa-rule-weight {
  flex-shrink: 0;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${y} .rpa-rule-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  align-self: flex-start;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
}
.${y} .rpa-rule-status--satisfied { color: ${S}; border-color: ${S}; background: ${C}; }
.${y} .rpa-rule-status--unverified { color: ${w}; border-color: ${w}; background: ${T}; }
.${y} .rpa-rule-status--missing { color: ${E}; border-color: ${E}; background: ${D}; }
.${y} .rpa-rule-linked {
  font-size: 11.5px;
  color: var(--color-text-secondary);
}
.${y} .rpa-rule-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-2);
}
/* Density-grid contract: criterion + submit actions keep a 40px hit box
   even though the DS small button renders shorter. */
.${y} .rpa-rule-actions button,
.${y} .rpa-submit button {
  min-height: 40px;
}
/* --- evidence pane ------------------------------------------------------------ */
.${y} .rpa-note-section { margin-bottom: var(--spacing-3); }
.${y} .rpa-note-heading {
  font-size: 12px;
  font-weight: 700;
  margin: 0 0 4px;
  color: var(--color-text-primary);
}
.${y} .rpa-note-body {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--color-text-primary);
}
.${y} .rpa-passage {
  border-radius: 3px;
  padding: 0 1px;
}
.${y} .rpa-passage--attached {
  background: ${x};
  box-shadow: inset 0 -2px 0 ${b};
}
.${y} .rpa-passage--candidate {
  background: ${T};
  box-shadow: inset 0 -2px 0 ${w};
}
.${y} .rpa-passage-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-inline-start: 4px;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
  vertical-align: 1px;
  border: var(--border-width) solid ${b};
  color: ${b};
  background: var(--color-background-surface);
  white-space: nowrap;
}
.${y} .rpa-passage-tag--unverified { border-color: ${w}; color: ${w}; }
.${y} .rpa-attach-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-inline-start: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  border: var(--border-width) solid ${b};
  background: var(--color-background-surface);
  color: ${b};
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
/* document tray rows: 48px */
.${y} .rpa-doc {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  box-sizing: border-box;
  padding: var(--spacing-1) 0;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${y} .rpa-doc--candidate {
  background: ${T};
  border-radius: var(--radius-container, 8px);
  padding-inline: var(--spacing-2);
}
.${y} .rpa-doc-glyph {
  display: inline-flex;
  flex-shrink: 0;
  color: var(--color-text-secondary);
}
.${y} .rpa-doc-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.${y} .rpa-doc-label {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${y} .rpa-doc-meta {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${y} .rpa-callout {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-container, 8px);
  border: var(--border-width) solid ${E};
  background: ${D};
  color: ${E};
  font-size: 12px;
  font-weight: 600;
  margin-bottom: var(--spacing-3);
}
.${y} .rpa-locating {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: 999px;
  border: var(--border-width) solid ${w};
  background: ${T};
  color: ${w};
  font-size: 12px;
  font-weight: 600;
  margin-bottom: var(--spacing-3);
}
/* --- submit bar: 56px --------------------------------------------------------- */
.${y} .rpa-submit {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  min-height: 56px;
  box-sizing: border-box;
  padding: var(--spacing-2) var(--spacing-4);
  border-top: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
}
.${y} .rpa-submit-note {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  min-width: 0;
}
.${y} .rpa-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
/* --- responsive subtraction ----------------------------------------------------- */
@media (max-width: 920px) {
  .${y} .rpa-panes {
    display: block;
    overflow-y: auto;
  }
  .${y} .rpa-pane { overflow-y: visible; }
  .${y} .rpa-pane--evidence {
    border-left: none;
    border-top: var(--border-width) solid var(--color-border);
  }
}
@media (max-width: 640px) {
  .${y} .rpa-frame { flex-direction: column; }
  .${y} .rpa-queue {
    flex: 0 0 auto;
    border-right: none;
    border-bottom: var(--border-width) solid var(--color-border);
  }
  .${y} .rpa-queue-scroll {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
  }
  .${y} .rpa-qrow {
    flex: 0 0 200px;
    min-height: 64px;
    border-bottom: none;
    border-right: var(--border-width) solid var(--color-border);
  }
  .${y} .rpa-qrow-line--payer { display: none; }
}
`;function de({size:e=22}){return(0,v.jsx)(`span`,{className:`rpa-mark`,"aria-hidden":`true`,children:(0,v.jsxs)(`svg`,{width:e,height:e,viewBox:`0 0 22 22`,fill:`none`,children:[(0,v.jsx)(`circle`,{cx:`11`,cy:`11`,r:`9.2`,stroke:`currentColor`,strokeWidth:`1.6`}),(0,v.jsx)(`path`,{d:`M11 3.4 L14.8 9.9 H7.2 Z`,fill:`currentColor`,opacity:`0.9`}),(0,v.jsx)(`path`,{d:`M11 3.4 L14.8 9.9 H7.2 Z`,fill:`currentColor`,opacity:`0.65`,transform:`rotate(120 11 11)`}),(0,v.jsx)(`path`,{d:`M11 3.4 L14.8 9.9 H7.2 Z`,fill:`currentColor`,opacity:`0.4`,transform:`rotate(240 11 11)`})]})})}function I(e,t,n,r){let i=(r-90)*Math.PI/180;return{x:e+n*Math.cos(i),y:t+n*Math.sin(i)}}function L(e,t,n,r,i){let a=I(e,t,n,r),o=I(e,t,n,i),s=+(i-r>180);return`M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${n} ${n} 0 ${s} 1 ${o.x.toFixed(2)} ${o.y.toFixed(2)}`}var R={low:S,moderate:w,high:E};function fe({score:e,tier:t}){let n=Math.min(e,100),r=-120+240*n/100;return(0,v.jsxs)(`div`,{className:`rpa-gauge`,children:[(0,v.jsxs)(`svg`,{width:72,height:48,viewBox:`0 0 72 48`,"aria-hidden":`true`,children:[(0,v.jsx)(`path`,{d:L(36,40,28,-120,120),fill:`none`,stroke:`var(--color-border)`,strokeWidth:6,strokeLinecap:`round`}),n>0&&(0,v.jsx)(`path`,{d:L(36,40,28,-120,r),fill:`none`,stroke:R[t],strokeWidth:6,strokeLinecap:`round`})]}),(0,v.jsxs)(`div`,{role:`status`,"aria-label":`Denial risk ${e}, ${F[t]}`,children:[(0,v.jsx)(`div`,{className:`rpa-gauge-num`,style:{color:R[t]},children:e}),(0,v.jsxs)(`div`,{className:`rpa-gauge-cap`,children:[`denial risk · `,F[t]]})]})]})}var pe={satisfied:{label:`Satisfied`,cls:`rpa-rule-status--satisfied`,icon:u},unverified:{label:`Attached · unverified`,cls:`rpa-rule-status--unverified`,icon:c},available:{label:`Not documented · evidence in chart`,cls:`rpa-rule-status--missing`,icon:d},missing:{label:`Not documented · no chart evidence`,cls:`rpa-rule-status--missing`,icon:d}};function z(){let[e,t]=(0,_.useState)(le),[n,b]=(0,_.useState)(()=>new Set),[x,S]=(0,_.useState)(()=>new Set),[C,w]=(0,_.useState)(`A-24187`),[T,E]=(0,_.useState)(`c2`),[D,I]=(0,_.useState)(``),L=ce.get(C)??O[0],R=e=>n.has(e.id)?`submitted`:e.status,z=R(L)!==`review`,B=(0,_.useMemo)(()=>{let t=0,r=0,i=0;for(let a of O)(n.has(a.id)?`submitted`:a.status)===`review`&&(t+=1,P(a,e)&&(r+=1),N(M(a,e))===`high`&&(i+=1));return{inReview:t,ready:r,high:i}},[e,n]),V=M(L,e),H=N(V),U=P(L,e),W=L.rules.map(t=>({rule:t,status:A(L,t,e)})),G=W.filter(e=>e.status===`satisfied`).length,K=W.filter(e=>e.status===`unverified`).length,q=L.rules.length-G-K,J=T===null?void 0:L.rules.find(e=>e.id===T),Y=J===void 0?[]:k(L,J.id),X=(e,t,n)=>{let r=M(e,n),i=N(r),a=P(e,n);I(`${t} ${e.id} denial risk ${r}, ${F[i]}.`+(a?` All criteria satisfied — ready to submit.`:``))},Z=(n,r)=>{let i=L.rules.find(e=>e.id===n);if(i===void 0||z)return;let a={...e,[`${L.id}.${n}`]:{sourceId:r.id,verified:!1}};t(a),E(null),X(L,`${i.code} evidence attached from ${r.label} — pending verification.`,a)},me=n=>{let r=`${L.id}.${n}`,i=e[r],a=L.rules.find(e=>e.id===n);if(i===void 0||a===void 0||z)return;let o={...e,[r]:{...i,verified:!0}};t(o),X(L,`${a.code} verified.`,o)},he=n=>{let r=`${L.id}.${n}`,i=L.rules.find(e=>e.id===n);if(e[r]===void 0||i===void 0||z)return;let a={...e};delete a[r],t(a),X(L,`${i.code} evidence detached.`,a)},ge=e=>{let t=L.rules.find(t=>t.id===e);t===void 0||z||(S(t=>new Set(t).add(`${L.id}.${e}`)),I(`Outside records requested for ${t.code}. The criterion stays unmet until documents arrive — denial risk unchanged at ${V}.`))},_e=()=>{!U||z||(b(e=>new Set(e).add(L.id)),E(null),I(`${L.id} submitted to ${L.payer} with ${L.rules.length} of ${L.rules.length} criteria satisfied — denial risk ${V}, ${F[H]}.`))},ve=e=>{w(e),E(null)},ye=e=>{E(t=>t===e?null:e)},be=(0,v.jsx)(ae,{children:(0,v.jsx)(`div`,{className:`rpa-header-row`,children:(0,v.jsxs)(m,{gap:3,vAlign:`center`,wrap:`wrap`,children:[(0,v.jsx)(de,{}),(0,v.jsx)(h,{size:`fill`,style:{minWidth:0},children:(0,v.jsxs)(ne,{gap:0,children:[(0,v.jsxs)(m,{gap:2,vAlign:`center`,wrap:`wrap`,children:[(0,v.jsx)(oe,{level:2,children:`Aperia · Prior-Auth Workbench`}),(0,v.jsx)(se,{label:`Radiology`,variant:`neutral`})]}),(0,v.jsx)(r,{type:`supporting`,color:`secondary`,children:`Meridian Imaging Partners · Wed Jul 8, 2026 · pre-cert desk K. Ellison, RN`})]})}),(0,v.jsxs)(`span`,{className:`rpa-chip`,children:[`In review `,(0,v.jsx)(`strong`,{children:B.inReview})]}),(0,v.jsxs)(`span`,{className:`rpa-chip ${B.ready>0?`rpa-chip--ok`:``}`,children:[(0,v.jsx)(i,{icon:u,size:`xsm`,color:`inherit`}),`Ready `,(0,v.jsx)(`strong`,{children:B.ready})]}),(0,v.jsxs)(`span`,{className:`rpa-chip ${B.high>0?`rpa-chip--risk`:`rpa-chip--ok`}`,children:[(0,v.jsx)(i,{icon:d,size:`xsm`,color:`inherit`}),`High risk `,(0,v.jsx)(`strong`,{children:B.high})]})]})})}),xe=(0,v.jsxs)(`aside`,{className:`rpa-queue`,"aria-label":`Authorization queue`,children:[(0,v.jsxs)(`div`,{className:`rpa-queue-head`,children:[`Auth queue · `,O.length]}),(0,v.jsx)(`div`,{className:`rpa-queue-scroll`,children:O.map(t=>{let n=M(t,e),r=N(n),i=R(t),a=i===`review`&&P(t,e),o=i===`submitted`?`Submitted`:i===`denied`?`Denied`:a?`Ready`:`In review`;return(0,v.jsxs)(`button`,{type:`button`,className:`rpa-qrow rpa-focusable`,"aria-pressed":t.id===C,onClick:()=>ve(t.id),children:[(0,v.jsxs)(`span`,{className:`rpa-qrow-top`,children:[(0,v.jsx)(`span`,{className:`rpa-qrow-name`,children:t.patient}),(0,v.jsx)(`span`,{className:`rpa-pip rpa-pip--${r}`,"aria-label":`Denial risk ${n}, ${F[r]}`,children:n})]}),(0,v.jsxs)(`span`,{className:`rpa-qrow-line`,children:[t.id,` · CPT `,t.cpt,` · `,t.studyShort,` · `,o]}),(0,v.jsxs)(`span`,{className:`rpa-qrow-line rpa-qrow-line--payer`,children:[t.payerShort,` ·`,` `,(0,v.jsx)(`span`,{className:t.dueTone===`urgent`?`rpa-due--urgent`:void 0,children:t.due})]})]},t.id)})})]}),Q=R(L),$;$=Q===`submitted`?(0,v.jsxs)(`div`,{className:`rpa-verdict rpa-verdict--submitted`,children:[(0,v.jsx)(i,{icon:l,size:`sm`,color:`inherit`}),`Submitted to `,L.payer,` — awaiting determination (SLA 72 h).`]}):Q===`denied`?(0,v.jsxs)(`div`,{className:`rpa-verdict rpa-verdict--denied`,children:[(0,v.jsx)(i,{icon:te,size:`sm`,color:`inherit`}),`Denied — `,L.denialReason??`see payer letter.`]}):U?(0,v.jsxs)(`div`,{className:`rpa-verdict rpa-verdict--ready`,children:[(0,v.jsx)(i,{icon:u,size:`sm`,color:`inherit`}),`Ready to submit — all `,L.rules.length,` criteria satisfied · denial risk`,` `,(0,v.jsx)(`strong`,{children:V}),` (`,F[H],`).`]}):(0,v.jsxs)(`div`,{className:`rpa-verdict ${H===`high`?`rpa-verdict--blocked-high`:`rpa-verdict--blocked-moderate`}`,children:[(0,v.jsx)(i,{icon:d,size:`sm`,color:`inherit`}),`Submission blocked — `,q,` not documented · `,K,` unverified · denial risk `,(0,v.jsx)(`strong`,{children:V}),` (`,F[H],`).`]});let Se=(0,v.jsxs)(`section`,{className:`rpa-pane`,"aria-label":`Payer criteria checklist`,children:[(0,v.jsxs)(`div`,{className:`rpa-pane-head`,children:[`Payer criteria — `,L.policyRef,` · `,L.payerShort,(0,v.jsxs)(`span`,{className:`rpa-pane-meta`,children:[G,`/`,L.rules.length,` satisfied`]})]}),W.map(({rule:t,status:n})=>{let r=e[`${L.id}.${t.id}`],o=r===void 0?void 0:L.sources.find(e=>e.id===r.sourceId),s=pe[n],c=j(n,t.weight),l=T===t.id,u=x.has(`${L.id}.${t.id}`);return(0,v.jsxs)(`div`,{className:`rpa-rule${l?` rpa-rule--active`:``}`,children:[(0,v.jsxs)(`div`,{className:`rpa-rule-top`,children:[(0,v.jsx)(`span`,{className:`rpa-rule-code`,children:t.code}),(0,v.jsx)(`span`,{className:`rpa-rule-text`,children:t.text}),(0,v.jsx)(p,{content:`Weight ${t.weight} — adds ${c} to the score right now (unmet ${t.weight}, unverified ${Math.ceil(t.weight/2)}, satisfied 0)`,children:(0,v.jsxs)(`span`,{className:`rpa-rule-weight`,children:[`+`,c,`/`,t.weight]})})]}),(0,v.jsxs)(m,{gap:2,vAlign:`center`,wrap:`wrap`,children:[(0,v.jsxs)(`span`,{className:`rpa-rule-status ${s.cls}`,children:[(0,v.jsx)(i,{icon:s.icon,size:`xsm`,color:`inherit`}),s.label]}),o!==void 0&&(0,v.jsxs)(`span`,{className:`rpa-rule-linked`,children:[r!==void 0&&r.verified?`Verified from`:`Attached from`,` `,o.label]}),u&&n===`missing`&&(0,v.jsx)(`span`,{className:`rpa-rule-linked`,children:`Outside records requested Jul 8`})]}),!z&&(0,v.jsxs)(`div`,{className:`rpa-rule-actions`,children:[(n===`available`||n===`missing`)&&(0,v.jsx)(g,{label:l?`Stop locating`:`Locate evidence`,variant:`secondary`,size:`sm`,icon:(0,v.jsx)(i,{icon:f,size:`sm`,color:`inherit`}),onClick:()=>ye(t.id)}),n===`unverified`&&(0,v.jsx)(g,{label:`Verify`,variant:`primary`,size:`sm`,icon:(0,v.jsx)(i,{icon:a,size:`sm`,color:`inherit`}),onClick:()=>me(t.id)}),r!==void 0&&(0,v.jsx)(g,{label:`Detach`,variant:`ghost`,size:`sm`,icon:(0,v.jsx)(i,{icon:ee,size:`sm`,color:`inherit`}),onClick:()=>he(t.id)}),n===`missing`&&!u&&(0,v.jsx)(g,{label:`Request outside records`,variant:`ghost`,size:`sm`,onClick:()=>ge(t.id)})]})]},t.id)})]}),Ce=L.sources.filter(e=>e.kind!==`passage`),we=(0,v.jsxs)(`section`,{className:`rpa-pane rpa-pane--evidence`,"aria-label":`Clinical evidence`,children:[(0,v.jsxs)(`div`,{className:`rpa-pane-head`,children:[`Clinical evidence`,(0,v.jsxs)(`span`,{className:`rpa-pane-meta`,children:[L.sources.length,` sources · `,Ce.length,` in tray`]})]}),J!==void 0&&Y.length>0&&(0,v.jsxs)(`div`,{className:`rpa-locating`,role:`status`,children:[(0,v.jsx)(i,{icon:f,size:`xsm`,color:`inherit`}),`Locating for `,J.code,` — `,Y.length,` candidate`,Y.length===1?``:`s`,` highlighted below.`]}),J!==void 0&&Y.length===0&&(0,v.jsxs)(`div`,{className:`rpa-callout`,role:`status`,children:[(0,v.jsx)(i,{icon:d,size:`sm`,color:`inherit`}),(0,v.jsxs)(`span`,{children:[`No matching passage or document in the chart for `,J.code,`. The referral packet is the gap — request outside records from the ordering practice.`]})]}),L.note.map(t=>(0,v.jsxs)(`div`,{className:`rpa-note-section`,children:[(0,v.jsx)(`h3`,{className:`rpa-note-heading`,children:t.heading}),(0,v.jsx)(`p`,{className:`rpa-note-body`,children:t.segments.map((t,n)=>{if(typeof t==`string`)return(0,v.jsx)(`span`,{children:t},n);let r=L.sources.find(e=>e.id===t.p),o=L.rules.find(n=>e[`${L.id}.${n.id}`]?.sourceId===t.p),s=o===void 0?void 0:e[`${L.id}.${o.id}`],l=J!==void 0&&r!==void 0&&r.ruleIds.includes(J.id)&&o===void 0;return(0,v.jsxs)(`span`,{children:[(0,v.jsx)(`span`,{className:`rpa-passage${o===void 0?l?` rpa-passage--candidate`:``:` rpa-passage--attached`}`,children:t.text}),o!==void 0&&s!==void 0&&(0,v.jsxs)(`span`,{className:`rpa-passage-tag${s.verified?``:` rpa-passage-tag--unverified`}`,children:[o.code,s.verified?(0,v.jsx)(i,{icon:a,size:`xsm`,color:`inherit`}):` · unverified`]}),l&&J!==void 0&&r!==void 0&&!z&&(0,v.jsxs)(`button`,{type:`button`,className:`rpa-attach-btn rpa-focusable`,onClick:()=>Z(J.id,r),children:[(0,v.jsx)(i,{icon:c,size:`xsm`,color:`inherit`}),`Attach to `,J.code]})]},n)})})]},t.heading)),(0,v.jsx)(`div`,{className:`rpa-pane-head`,style:{marginTop:`var(--spacing-3)`},children:`Chart documents & system checks`}),Ce.map(t=>{let n=L.rules.find(n=>e[`${L.id}.${n.id}`]?.sourceId===t.id),r=n===void 0?void 0:e[`${L.id}.${n.id}`],l=J!==void 0&&t.ruleIds.includes(J.id)&&n===void 0;return(0,v.jsxs)(`div`,{className:`rpa-doc${l?` rpa-doc--candidate`:``}`,children:[(0,v.jsx)(`span`,{className:`rpa-doc-glyph`,children:(0,v.jsx)(i,{icon:t.kind===`system`?o:s,size:`sm`,color:`inherit`})}),(0,v.jsxs)(`span`,{className:`rpa-doc-text`,children:[(0,v.jsx)(`span`,{className:`rpa-doc-label`,children:t.label}),(0,v.jsx)(`span`,{className:`rpa-doc-meta`,children:t.meta})]}),n!==void 0&&r!==void 0&&(0,v.jsxs)(`span`,{className:`rpa-passage-tag${r.verified?``:` rpa-passage-tag--unverified`}`,children:[n.code,r.verified?(0,v.jsx)(i,{icon:a,size:`xsm`,color:`inherit`}):` · unverified`]}),l&&J!==void 0&&!z&&(0,v.jsxs)(`button`,{type:`button`,className:`rpa-attach-btn rpa-focusable`,onClick:()=>Z(J.id,t),children:[(0,v.jsx)(i,{icon:c,size:`xsm`,color:`inherit`}),`Attach to `,J.code]})]},t.id)})]}),Te=(0,v.jsxs)(`div`,{className:`rpa-submit`,children:[(0,v.jsx)(`span`,{className:`rpa-submit-note`,children:Q===`review`?`${G}/${L.rules.length} criteria satisfied · denial risk ${V} (${F[H]}) · ${L.due}`:Q===`submitted`?`Packet locked — submitted with denial risk ${V} (${F[H]}).`:`Packet locked — denied. Prepare the appeal from the payer letter.`}),(0,v.jsx)(h,{size:`fill`}),Q===`review`&&(U?(0,v.jsx)(g,{label:`Submit to ${L.payerShort}`,variant:`primary`,size:`sm`,icon:(0,v.jsx)(i,{icon:l,size:`sm`,color:`inherit`}),onClick:_e}):(0,v.jsx)(p,{content:`Blocked — ${q+K} criteria still open`,children:(0,v.jsx)(`span`,{children:(0,v.jsx)(g,{label:`Submit to ${L.payerShort}`,variant:`primary`,size:`sm`,isDisabled:!0,icon:(0,v.jsx)(i,{icon:l,size:`sm`,color:`inherit`})})})}))]});return(0,v.jsxs)(`div`,{className:y,style:{height:`100dvh`,width:`100%`},children:[(0,v.jsx)(`style`,{children:ue}),(0,v.jsx)(re,{height:`fill`,header:be,content:(0,v.jsx)(ie,{padding:0,children:(0,v.jsxs)(`div`,{className:`rpa-frame`,children:[(0,v.jsx)(`div`,{"aria-live":`polite`,className:`rpa-vh`,children:D}),xe,(0,v.jsxs)(`div`,{className:`rpa-work`,children:[$,(0,v.jsxs)(`div`,{className:`rpa-patient`,children:[(0,v.jsxs)(`div`,{className:`rpa-patient-main`,children:[(0,v.jsxs)(`span`,{className:`rpa-patient-title`,children:[L.patient,(0,v.jsx)(`span`,{className:`rpa-demo`,children:L.demo})]}),(0,v.jsxs)(`span`,{className:`rpa-patient-line`,children:[L.study,` · CPT `,L.cpt,` · ICD-10 `,L.icd]}),(0,v.jsxs)(`span`,{className:`rpa-patient-line`,children:[L.payer,` · policy `,L.policyRef,` · ordered by `,L.orderedBy]})]}),(0,v.jsx)(fe,{score:V,tier:H})]}),(0,v.jsxs)(`div`,{className:`rpa-panes`,children:[Se,we]}),Te]})]})})})]})}export{z as default};