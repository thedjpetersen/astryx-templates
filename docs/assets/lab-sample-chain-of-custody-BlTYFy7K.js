import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Icon-Bv9dUoit.js";import{t as i}from"./flask-conical-BFyOaFFI.js";import{t as a}from"./rotate-ccw-DLPUmPRU.js";import{_ as o,i as s,o as c}from"./index-784iMtOZ.js";import{n as l,t as u}from"./LayoutContent-CCL91W7X.js";import{t as d}from"./LayoutHeader-Cy2mWoMf.js";var f=e(t(),1),p=n(),m=`light-dark(#6D28D9, #B6A3F7)`,h=`light-dark(#FFFFFF, #231447)`,g=`light-dark(rgba(109, 40, 217, 0.08), rgba(182, 163, 247, 0.12))`,_=`light-dark(#92400E, #F2B84B)`,v=`light-dark(rgba(180, 83, 9, 0.12), rgba(242, 184, 75, 0.14))`,y=`light-dark(#B42318, #FF8A7A)`,b=`light-dark(rgba(180, 35, 24, 0.10), rgba(255, 138, 122, 0.14))`,x=`light-dark(#15703B, #6FD597)`,S=`light-dark(rgba(21, 112, 59, 0.10), rgba(111, 213, 151, 0.14))`,C=`light-dark(rgba(24, 18, 43, 0.18), rgba(0, 0, 0, 0.55))`,w=[`draw`,`pickup`,`receipt`,`accession`],T={draw:{label:`Drawn`,action:`Record draw`},pickup:{label:`Courier pickup`,action:`Record courier pickup`},receipt:{label:`Lab receipt`,action:`Record lab receipt`},accession:{label:`Accessioned`,action:`Record accession`},recollect:{label:`Recollect requested`,action:`Request recollect`}},E={lavender:{cap:`light-dark(#9D8CE0, #B0A2ED)`,label:`Lavender · EDTA`},pink:{cap:`light-dark(#E58BB4, #F0A3C6)`,label:`Pink · EDTA crossmatch`},gold:{cap:`light-dark(#D9A917, #E7C24D)`,label:`Gold · SST`},lightblue:{cap:`light-dark(#5BA7DC, #7FBDE8)`,label:`Light blue · citrate`},gray:{cap:`light-dark(#8E959D, #A8AFB8)`,label:`Gray · NaF/KOx`},green:{cap:`light-dark(#4E9E63, #6FBE84)`,label:`Green · lithium heparin`},culture:{cap:`light-dark(#7A5C3E, #A3805C)`,label:`Culture bottle set`},clear:{cap:`light-dark(#B9C0C7, #CDD3D9)`,label:`Sterile · no additive`},yellow:{cap:`light-dark(#C9B93A, #DACD5E)`,label:`Urine collection cup`}},D=872,O=4,k=.4;function A(e){let t=Math.floor(e/60),n=e%60;return`${String(t).padStart(2,`0`)}:${String(n).padStart(2,`0`)}`}var j=[{id:`SP-24-018327`,patient:`K. Osei · ····4821`,panel:`CBC with differential`,tube:`lavender`,site:`Draw Site 12 — Fairview`,priority:`routine`,drawMin:730,windowMin:1440,recollect:!1,events:[{stage:`draw`,timeMin:730,actor:`M. Arendt, phlebotomy`},{stage:`pickup`,timeMin:745,actor:`Courier R-7 · T. Vidal`,note:`Cooler 3, ambient`},{stage:`receipt`,timeMin:810,actor:`Central receiving · J. Mun`},{stage:`accession`,timeMin:818,actor:`L. Ortiz`,note:`Acc #A-55201`}]},{id:`SP-24-018330`,patient:`R. Calder · ····9032`,panel:`Basic metabolic panel`,tube:`gold`,site:`Draw Site 12 — Fairview`,priority:`routine`,drawMin:735,windowMin:480,recollect:!1,events:[{stage:`draw`,timeMin:735,actor:`M. Arendt, phlebotomy`},{stage:`pickup`,timeMin:745,actor:`Courier R-7 · T. Vidal`,note:`Cooler 3, ambient`},{stage:`receipt`,timeMin:810,actor:`Central receiving · J. Mun`},{stage:`accession`,timeMin:821,actor:`L. Ortiz`,note:`Acc #A-55202`}]},{id:`SP-24-018334`,patient:`D. Whelan · ····2214`,panel:`Lactate, plasma — confirm POC`,tube:`gray`,site:`ED phlebotomy`,priority:`stat`,drawMin:850,windowMin:30,recollect:!1,events:[{stage:`draw`,timeMin:850,actor:`S. Kwan, RN`,note:`On ice per protocol`},{stage:`pickup`,timeMin:858,actor:`Tube station 4 → core lab`,note:`Pneumatic send`}]},{id:`SP-24-018336`,patient:`A. Mireles · ····7748`,panel:`Ammonia, plasma — on ice`,tube:`lavender`,site:`ICU-4`,priority:`stat`,drawMin:845,windowMin:30,recollect:!1,events:[{stage:`draw`,timeMin:845,actor:`B. Ferro, RN`,note:`Ice slurry, capped`}]},{id:`SP-24-018338`,patient:`H. Stroud · ····1189`,panel:`Prothrombin time / INR`,tube:`lightblue`,site:`Draw Site 3 — Northgate`,priority:`routine`,drawMin:800,windowMin:240,recollect:!1,events:[{stage:`draw`,timeMin:800,actor:`P. Ilic, phlebotomy`,note:`Full draw, no clots`},{stage:`pickup`,timeMin:812,actor:`Courier R-3 · K. Adeyemi`,note:`Route 3 north loop`}]},{id:`SP-24-018339`,patient:`H. Stroud · ····1189`,panel:`Activated PTT`,tube:`lightblue`,site:`Draw Site 3 — Northgate`,priority:`routine`,drawMin:801,windowMin:240,recollect:!1,events:[{stage:`draw`,timeMin:801,actor:`P. Ilic, phlebotomy`},{stage:`pickup`,timeMin:812,actor:`Courier R-3 · K. Adeyemi`,note:`Route 3 north loop`}]},{id:`SP-24-018341`,patient:`W. Nakato · ····5507`,panel:`Blood culture ×2, set A (aerobic + anaerobic)`,tube:`culture`,site:`ED bay 9`,priority:`stat`,drawMin:820,windowMin:120,recollect:!1,events:[{stage:`draw`,timeMin:820,actor:`S. Kwan, RN`,note:`Two-site draw, 10 mL each`},{stage:`pickup`,timeMin:838,actor:`Courier R-5 · M. Grau`},{stage:`receipt`,timeMin:866,actor:`Micro receiving · F. Ellery`,note:`To incubator queue`}]},{id:`SP-24-018342`,patient:`J. Paz · ····6631`,panel:`Type and screen`,tube:`pink`,site:`L&D triage`,priority:`stat`,drawMin:860,windowMin:180,recollect:!1,events:[{stage:`draw`,timeMin:860,actor:`C. Roth, RN`,note:`Armband verified ×2`}]},{id:`SP-24-018345`,patient:`E. Fontaine · ····3390`,panel:`Heparin-induced thrombocytopenia PF4 IgG ELISA, send-out`,tube:`gold`,site:`Draw Site 3 — Northgate`,priority:`routine`,drawMin:780,windowMin:480,recollect:!1,events:[{stage:`draw`,timeMin:780,actor:`P. Ilic, phlebotomy`},{stage:`pickup`,timeMin:795,actor:`Courier R-3 · K. Adeyemi`},{stage:`receipt`,timeMin:840,actor:`Central receiving · J. Mun`},{stage:`accession`,timeMin:846,actor:`P. Deng`,note:`Acc #A-55214 · batch to ref lab 16:00`}]},{id:`SP-24-018326`,patient:`T. Ibarra · ····8873`,panel:`Ionized calcium`,tube:`green`,site:`ICU-4`,priority:`stat`,drawMin:815,windowMin:60,recollect:!1,events:[{stage:`draw`,timeMin:815,actor:`B. Ferro, RN`,note:`Anaerobic, capped`},{stage:`pickup`,timeMin:826,actor:`Tube station 7 → core lab`,note:`Pneumatic send`},{stage:`receipt`,timeMin:852,actor:`Central receiving · J. Mun`},{stage:`accession`,timeMin:858,actor:`P. Deng`,note:`Acc #A-55217`}]},{id:`SP-24-018319`,patient:`N. Vasquez · ····0456`,panel:`CSF cell count, tube 3 — irreplaceable specimen`,tube:`clear`,site:`OR 2 — neurosurgery`,priority:`stat`,drawMin:802,windowMin:60,recollect:!1,events:[{stage:`draw`,timeMin:802,actor:`Dr. Y. Halloran`,note:`Hand-carry ordered`},{stage:`pickup`,timeMin:815,actor:`OR runner · D. Small`},{stage:`receipt`,timeMin:864,actor:`Central receiving · J. Mun`,note:`Runner diverted to code — delay documented`,exception:`Received 2 min past the 60-min stability window (deadline 14:22).`}]},{id:`SP-24-018347`,patient:`G. Brandt · ····7702`,panel:`Urine culture, clean catch`,tube:`yellow`,site:`Draw Site 12 — Fairview`,priority:`routine`,drawMin:855,windowMin:120,recollect:!1,events:[{stage:`draw`,timeMin:855,actor:`M. Arendt, phlebotomy`,note:`Refrigerate if delayed`}]}],M={awaiting:`Awaiting pickup`,transit:`In transit`,received:`Received`,accessioned:`Accessioned`};function N(e){let t=new Set(e.events.map(e=>e.stage));return t.has(`accession`)?`accessioned`:t.has(`receipt`)?`received`:t.has(`pickup`)?`transit`:`awaiting`}function P(e){return e.events.some(e=>e.exception!=null)}function F(e){let t=new Set(e.events.map(e=>e.stage));for(let e of w)if(!t.has(e))return e;return null}function I(e,t){let n=e.drawMin+e.windowMin;if(N(e)===`accessioned`){let t=e.events.find(e=>e.stage===`accession`),r=P(e);return{tone:r?`expired`:`closed`,text:`closed ${A(t?.timeMin??n)}`,detail:r?`Chain closed with a stability exception.`:`Chain closed inside the stability window.`}}let r=n-t;if(P(e)||r<=0){let t=Math.max(0,-r);return{tone:`expired`,text:P(e)?`exception`:`over by ${t} min`,detail:P(e)?`Stability exception on the chain — escalate or annotate.`:`Stability window exceeded by ${t} min (deadline ${A(n)}).`}}let i=Math.round(e.windowMin*k),a=L(r);return{tone:r<=i?`warn`:`ok`,text:`${a} left`,detail:`${a} left in the ${e.windowMin}-min window (deadline ${A(n)}).`}}function L(e){return e<120?`${e} min`:`${(e/60).toFixed(1)} h`}var R=`
.tpl-lab-sample-chain-of-custody {
  --lcc-accent: ${m};
  --lcc-on-accent: ${h};
  --lcc-accent-tint: ${g};
  --lcc-warn-text: ${_};
  --lcc-warn-tint: ${v};
  --lcc-err-text: ${y};
  --lcc-err-tint: ${b};
  --lcc-ok-text: ${x};
  --lcc-ok-tint: ${S};
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
  height: 100%;
  min-height: 0;
}
.tpl-lab-sample-chain-of-custody *,
.tpl-lab-sample-chain-of-custody *::before,
.tpl-lab-sample-chain-of-custody *::after {
  box-sizing: border-box;
}
.tpl-lab-sample-chain-of-custody button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.tpl-lab-sample-chain-of-custody button:focus-visible {
  outline: 2px solid var(--lcc-accent);
  outline-offset: 2px;
}
.tpl-lab-sample-chain-of-custody .lcc-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ---- header --------------------------------------------------------------- */
.tpl-lab-sample-chain-of-custody .lcc-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  width: 100%;
}
.tpl-lab-sample-chain-of-custody .lcc-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
}
.tpl-lab-sample-chain-of-custody .lcc-brand-mark {
  flex: none;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: var(--lcc-accent);
  color: var(--lcc-on-accent);
}
.tpl-lab-sample-chain-of-custody .lcc-brand-name {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin: 0;
}
.tpl-lab-sample-chain-of-custody .lcc-brand-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
}
/* Action-driven lab clock readout. */
.tpl-lab-sample-chain-of-custody .lcc-clock {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.tpl-lab-sample-chain-of-custody .lcc-clock strong {
  color: var(--color-text-primary);
  font-weight: 700;
}
.tpl-lab-sample-chain-of-custody .lcc-stats {
  display: flex;
  gap: var(--spacing-2);
  margin-inline-start: auto;
  flex-wrap: wrap;
}
/* 60px stat tiles (density grid). */
.tpl-lab-sample-chain-of-custody .lcc-stat {
  min-width: 104px;
  height: 60px;
  padding: 8px 12px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}
.tpl-lab-sample-chain-of-custody .lcc-stat-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.tpl-lab-sample-chain-of-custody .lcc-stat-value {
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}
.tpl-lab-sample-chain-of-custody .lcc-stat-value.is-accent { color: var(--lcc-accent); }
.tpl-lab-sample-chain-of-custody .lcc-stat-value.is-err { color: var(--lcc-err-text); }

/* ---- body grid --------------------------------------------------------------
   Hand-rolled minmax(0,1fr)/340px grid (not LayoutPanel) so the <=900px
   restructure — rail undocks into a fixed right-edge drawer — is pure CSS. */
.tpl-lab-sample-chain-of-custody .lcc-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 12px;
  padding: 12px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
.tpl-lab-sample-chain-of-custody .lcc-main {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ---- filter strip: 32px chips ------------------------------------------------ */
.tpl-lab-sample-chain-of-custody .lcc-filters {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  flex: none;
}
.tpl-lab-sample-chain-of-custody .lcc-chip {
  height: 32px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
  transition: border-color 160ms ease, background-color 160ms ease, color 160ms ease;
}
.tpl-lab-sample-chain-of-custody .lcc-chip[aria-pressed='true'] {
  background: var(--lcc-accent);
  border-color: var(--lcc-accent);
  color: var(--lcc-on-accent);
}
.tpl-lab-sample-chain-of-custody .lcc-chip-count {
  font-variant-numeric: tabular-nums;
}
@media (hover: hover) {
  .tpl-lab-sample-chain-of-custody .lcc-chip:not([aria-pressed='true']):hover {
    border-color: color-mix(in srgb, var(--color-text-primary) 35%, var(--color-border));
    color: var(--color-text-primary);
  }
}

/* ---- ledger: 64px rows --------------------------------------------------------- */
.tpl-lab-sample-chain-of-custody .lcc-ledger {
  min-height: 0;
  overflow-y: auto;
  border: var(--border-width) solid var(--color-border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
}
.tpl-lab-sample-chain-of-custody .lcc-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 64px;
  padding: 8px 12px;
  border-bottom: var(--border-width) solid var(--color-border);
  transition: background-color 160ms ease;
}
.tpl-lab-sample-chain-of-custody .lcc-row:last-child { border-bottom: none; }
.tpl-lab-sample-chain-of-custody .lcc-row[aria-pressed='true'] {
  background: var(--lcc-accent-tint);
  box-shadow: inset 3px 0 0 var(--lcc-accent);
}
@media (hover: hover) {
  .tpl-lab-sample-chain-of-custody .lcc-row:not([aria-pressed='true']):hover {
    background: color-mix(in srgb, var(--color-text-primary) 4%, transparent);
  }
}
.tpl-lab-sample-chain-of-custody .lcc-row.is-exception {
  box-shadow: inset 3px 0 0 var(--lcc-err-text);
}
.tpl-lab-sample-chain-of-custody .lcc-row.is-exception[aria-pressed='true'] {
  background: var(--lcc-err-tint);
}
.tpl-lab-sample-chain-of-custody .lcc-tube { flex: none; }
.tpl-lab-sample-chain-of-custody .lcc-ident {
  flex: none;
  width: 168px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.tpl-lab-sample-chain-of-custody .lcc-ident-id {
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 6px;
}
.tpl-lab-sample-chain-of-custody .lcc-stat-chip {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--lcc-err-tint);
  color: var(--lcc-err-text);
}
.tpl-lab-sample-chain-of-custody .lcc-ident-patient {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-lab-sample-chain-of-custody .lcc-panel {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.tpl-lab-sample-chain-of-custody .lcc-panel-name {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-lab-sample-chain-of-custody .lcc-panel-site {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* Custody spine: 132px track, 14px nodes, 2px connectors. */
.tpl-lab-sample-chain-of-custody .lcc-spine { flex: none; width: 132px; }
.tpl-lab-sample-chain-of-custody .lcc-spine svg { display: block; }
/* 22px hold chips (density grid). */
.tpl-lab-sample-chain-of-custody .lcc-hold {
  flex: none;
  min-width: 92px;
  height: 22px;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  transition: background-color 200ms ease, color 200ms ease;
}
.tpl-lab-sample-chain-of-custody .lcc-hold.is-ok { background: var(--lcc-ok-tint); color: var(--lcc-ok-text); }
.tpl-lab-sample-chain-of-custody .lcc-hold.is-warn { background: var(--lcc-warn-tint); color: var(--lcc-warn-text); }
.tpl-lab-sample-chain-of-custody .lcc-hold.is-expired { background: var(--lcc-err-tint); color: var(--lcc-err-text); }
.tpl-lab-sample-chain-of-custody .lcc-hold.is-closed { background: var(--color-background-muted); color: var(--color-text-secondary); }

/* ---- custody rail ---------------------------------------------------------------- */
.tpl-lab-sample-chain-of-custody .lcc-rail {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  border: var(--border-width) solid var(--color-border);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--color-background-body);
}
.tpl-lab-sample-chain-of-custody .lcc-rail-close { display: none; }
.tpl-lab-sample-chain-of-custody .lcc-rail-head {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.tpl-lab-sample-chain-of-custody .lcc-rail-id {
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  margin: 0;
}
.tpl-lab-sample-chain-of-custody .lcc-rail-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.tpl-lab-sample-chain-of-custody .lcc-window {
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.tpl-lab-sample-chain-of-custody .lcc-window strong {
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}
/* Event ledger rows: dot + time + actor + note. */
.tpl-lab-sample-chain-of-custody .lcc-events {
  display: flex;
  flex-direction: column;
}
.tpl-lab-sample-chain-of-custody .lcc-event {
  position: relative;
  padding: 8px 0 8px 22px;
}
.tpl-lab-sample-chain-of-custody .lcc-event::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 14px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--lcc-accent);
}
.tpl-lab-sample-chain-of-custody .lcc-event::after {
  content: '';
  position: absolute;
  left: 8px;
  top: 26px;
  bottom: -6px;
  width: 2px;
  background: var(--color-border);
}
.tpl-lab-sample-chain-of-custody .lcc-event:last-child::after { display: none; }
.tpl-lab-sample-chain-of-custody .lcc-event.is-exception::before { background: var(--lcc-err-text); }
.tpl-lab-sample-chain-of-custody .lcc-event-top {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 12px;
}
.tpl-lab-sample-chain-of-custody .lcc-event-stage { font-weight: 600; }
.tpl-lab-sample-chain-of-custody .lcc-event-time {
  margin-inline-start: auto;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.tpl-lab-sample-chain-of-custody .lcc-event-actor,
.tpl-lab-sample-chain-of-custody .lcc-event-note {
  font-size: 11px;
  color: var(--color-text-secondary);
  line-height: 1.35;
}
.tpl-lab-sample-chain-of-custody .lcc-event-exc {
  margin-top: 4px;
  font-size: 11px;
  line-height: 1.4;
  padding: 6px 8px;
  border-radius: 8px;
  background: var(--lcc-err-tint);
  color: var(--lcc-err-text);
}
/* Rail actions: primary record button + recollect escalation. */
.tpl-lab-sample-chain-of-custody .lcc-action {
  min-height: 40px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  background: var(--lcc-accent);
  color: var(--lcc-on-accent);
  transition: opacity 160ms ease;
}
@media (hover: hover) {
  .tpl-lab-sample-chain-of-custody .lcc-action:hover { opacity: 0.88; }
}
.tpl-lab-sample-chain-of-custody .lcc-action.is-danger {
  background: transparent;
  border: var(--border-width) solid color-mix(in srgb, var(--lcc-err-text) 45%, var(--color-border));
  color: var(--lcc-err-text);
}
.tpl-lab-sample-chain-of-custody .lcc-action-note {
  font-size: 11px;
  line-height: 1.4;
  color: var(--color-text-secondary);
}
.tpl-lab-sample-chain-of-custody .lcc-done {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--lcc-ok-text);
  font-weight: 600;
}
.tpl-lab-sample-chain-of-custody .lcc-empty {
  padding: 24px 12px;
  text-align: center;
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* ---- responsive: drawer at <=900px, subtraction at <=560px ------------------------ */
@media (max-width: 900px) {
  .tpl-lab-sample-chain-of-custody .lcc-body {
    grid-template-columns: minmax(0, 1fr);
  }
  .tpl-lab-sample-chain-of-custody .lcc-rail {
    position: fixed;
    inset-block: 0;
    inset-inline-end: 0;
    width: min(340px, 92vw);
    border-radius: 12px 0 0 12px;
    box-shadow: -12px 0 32px ${C};
    z-index: 30;
  }
  .tpl-lab-sample-chain-of-custody .lcc-rail.is-drawer-closed { display: none; }
  .tpl-lab-sample-chain-of-custody .lcc-rail-close {
    display: grid;
    place-items: center;
    flex: none;
    width: 40px;
    height: 40px;
    margin-inline-start: auto;
    border-radius: 8px;
    color: var(--color-text-secondary);
  }
}
@media (max-width: 560px) {
  .tpl-lab-sample-chain-of-custody .lcc-brand-sub { display: none; }
  .tpl-lab-sample-chain-of-custody .lcc-stats { margin-inline-start: 0; width: 100%; }
  .tpl-lab-sample-chain-of-custody .lcc-stat { flex: 1 1 40%; min-width: 0; }
  .tpl-lab-sample-chain-of-custody .lcc-panel { display: none; }
  .tpl-lab-sample-chain-of-custody .lcc-ident { flex: 1 1 auto; width: auto; }
  .tpl-lab-sample-chain-of-custody .lcc-spine { width: 96px; }
  .tpl-lab-sample-chain-of-custody .lcc-hold { min-width: 76px; }
}
/* Next-node pulse on the custody spine (opacity only — SVG-safe). */
@keyframes lcc-node-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
.tpl-lab-sample-chain-of-custody .lcc-spine-next {
  animation: lcc-node-pulse 1.6s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .tpl-lab-sample-chain-of-custody .lcc-chip,
  .tpl-lab-sample-chain-of-custody .lcc-row,
  .tpl-lab-sample-chain-of-custody .lcc-hold,
  .tpl-lab-sample-chain-of-custody .lcc-action { transition: none; }
  .tpl-lab-sample-chain-of-custody .lcc-spine-next { animation: none; }
}
`;function z(){return(0,p.jsx)(`span`,{className:`lcc-brand-mark`,"aria-hidden":!0,children:(0,p.jsxs)(`svg`,{width:16,height:16,viewBox:`0 0 16 16`,fill:`none`,children:[(0,p.jsx)(`circle`,{cx:4,cy:8,r:2.4,stroke:`currentColor`,strokeWidth:1.5}),(0,p.jsx)(`circle`,{cx:12,cy:8,r:2.4,stroke:`currentColor`,strokeWidth:1.5}),(0,p.jsx)(`path`,{d:`M6.4 8h3.2`,stroke:`currentColor`,strokeWidth:1.5,strokeLinecap:`round`})]})})}function B({tube:e}){return(0,p.jsx)(`span`,{className:`lcc-tube`,title:E[e].label,"aria-hidden":!0,children:(0,p.jsxs)(`svg`,{width:16,height:28,viewBox:`0 0 16 28`,children:[(0,p.jsx)(`rect`,{x:3.5,y:1,width:9,height:5,rx:1.5,fill:E[e].cap,stroke:`var(--color-border)`,strokeWidth:1}),(0,p.jsx)(`path`,{d:`M4.5 7h7v14.5a3.5 3.5 0 0 1-7 0Z`,fill:`var(--color-background-muted)`,stroke:`var(--color-border)`,strokeWidth:1}),(0,p.jsx)(`path`,{d:`M5.5 13h5v8.3a2.5 2.5 0 0 1-5 0Z`,fill:E[e].cap,opacity:.45})]})})}function V({sample:e}){let t=new Map(e.events.map(e=>[e.stage,e])),n=F(e),r=[10,47,84,121];return(0,p.jsx)(`span`,{className:`lcc-spine`,"aria-hidden":!0,children:(0,p.jsxs)(`svg`,{width:`100%`,height:20,viewBox:`0 0 132 20`,preserveAspectRatio:`xMidYMid meet`,children:[w.slice(0,-1).map((e,n)=>{let i=r[n],a=r[n+1],o=t.has(w[n+1]);return(0,p.jsx)(`line`,{x1:i+7,y1:10,x2:a-7,y2:10,stroke:o?`var(--lcc-accent)`:`var(--color-border)`,strokeWidth:2},e)}),w.map((e,i)=>{let a=t.get(e),o=e===n;return a==null?(0,p.jsx)(`circle`,{cx:r[i],cy:10,r:6,fill:`none`,stroke:o?`var(--lcc-accent)`:`var(--color-border)`,strokeWidth:2,className:o?`lcc-spine-next`:void 0},e):(0,p.jsx)(`circle`,{cx:r[i],cy:10,r:7,fill:a.exception==null?`var(--lcc-accent)`:`var(--lcc-err-text)`},e)})]})})}function H({sample:e,hold:t,isSelected:n,onSelect:r}){let i=N(e),a=P(e);return(0,p.jsxs)(`button`,{type:`button`,className:`lcc-row${a?` is-exception`:``}`,"aria-pressed":n,"aria-label":`${e.id}, ${e.panel}, ${E[e.tube].label}, ${e.priority===`stat`?`STAT, `:``}${M[i]}${a?`, stability exception`:``}. ${t.detail}`,onClick:()=>r(e.id),children:[(0,p.jsx)(B,{tube:e.tube}),(0,p.jsxs)(`span`,{className:`lcc-ident`,children:[(0,p.jsxs)(`span`,{className:`lcc-ident-id`,children:[e.id,e.priority===`stat`?(0,p.jsx)(`span`,{className:`lcc-stat-chip`,children:`STAT`}):null]}),(0,p.jsx)(`span`,{className:`lcc-ident-patient`,children:e.patient})]}),(0,p.jsxs)(`span`,{className:`lcc-panel`,children:[(0,p.jsx)(`span`,{className:`lcc-panel-name`,children:e.panel}),(0,p.jsxs)(`span`,{className:`lcc-panel-site`,children:[e.site,` · drawn `,A(e.drawMin)]})]}),(0,p.jsx)(V,{sample:e}),(0,p.jsx)(`span`,{className:`lcc-hold is-${t.tone}`,children:t.text})]})}var U=[{id:`all`,label:`All`},{id:`awaiting`,label:`Awaiting pickup`},{id:`transit`,label:`In transit`},{id:`received`,label:`Received`},{id:`accessioned`,label:`Accessioned`},{id:`exceptions`,label:`Exceptions`}];function W(){let[e,t]=(0,f.useState)(j),[n,m]=(0,f.useState)(D),[h,g]=(0,f.useState)(`all`),[_,v]=(0,f.useState)(j[3].id),[y,b]=(0,f.useState)(!1),[x,S]=(0,f.useState)(``),C=(0,f.useMemo)(()=>{let t={all:e.length,awaiting:0,transit:0,received:0,accessioned:0,exceptions:0};for(let n of e)t[N(n)]+=1,P(n)&&(t.exceptions+=1);return t},[e]),w=e.length-C.exceptions,E=Math.round(w/e.length*100),k=(0,f.useMemo)(()=>e.filter(e=>h===`all`?!0:h===`exceptions`?P(e):N(e)===h),[e,h]),L=_==null?null:e.find(e=>e.id===_)??null,V=L==null?null:I(L,n),W=L==null?null:F(L),G=t=>{v(t),b(!0);let r=e.find(e=>e.id===t);if(r!=null){let e=I(r,n);S(`${r.id} selected — ${M[N(r)]}. ${e.detail}`)}};return(0,p.jsxs)(`div`,{className:`tpl-lab-sample-chain-of-custody`,children:[(0,p.jsx)(`style`,{children:R}),(0,p.jsx)(l,{height:`fill`,header:(0,p.jsx)(d,{hasDivider:!0,children:(0,p.jsxs)(`div`,{className:`lcc-head`,children:[(0,p.jsxs)(`div`,{className:`lcc-brand`,children:[(0,p.jsx)(z,{}),(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`h1`,{className:`lcc-brand-name`,children:`Chainpoint · Central Lab`}),(0,p.jsx)(`div`,{className:`lcc-brand-sub`,children:`Specimen chain of custody · Meridian Health draw network`})]})]}),(0,p.jsxs)(`span`,{className:`lcc-clock`,children:[(0,p.jsx)(r,{icon:o,size:`xsm`,color:`inherit`}),`Lab clock `,(0,p.jsx)(`strong`,{children:A(n)})]}),(0,p.jsxs)(`div`,{className:`lcc-stats`,children:[(0,p.jsxs)(`div`,{className:`lcc-stat`,children:[(0,p.jsx)(`span`,{className:`lcc-stat-label`,children:`Awaiting pickup`}),(0,p.jsx)(`span`,{className:`lcc-stat-value`,children:C.awaiting})]}),(0,p.jsxs)(`div`,{className:`lcc-stat`,children:[(0,p.jsx)(`span`,{className:`lcc-stat-label`,children:`In transit`}),(0,p.jsx)(`span`,{className:`lcc-stat-value is-accent`,children:C.transit})]}),(0,p.jsxs)(`div`,{className:`lcc-stat`,children:[(0,p.jsx)(`span`,{className:`lcc-stat-label`,children:`Exceptions`}),(0,p.jsx)(`span`,{className:`lcc-stat-value${C.exceptions>0?` is-err`:``}`,children:C.exceptions})]}),(0,p.jsxs)(`div`,{className:`lcc-stat`,children:[(0,p.jsx)(`span`,{className:`lcc-stat-label`,children:`Clean chains`}),(0,p.jsxs)(`span`,{className:`lcc-stat-value`,children:[w,`/`,e.length,` · `,E,`%`]})]})]})]})}),content:(0,p.jsxs)(u,{padding:0,role:`main`,label:`Specimen custody ledger`,children:[(0,p.jsx)(`div`,{"aria-live":`polite`,className:`lcc-vh`,children:x}),(0,p.jsxs)(`div`,{className:`lcc-body`,children:[(0,p.jsxs)(`div`,{className:`lcc-main`,children:[(0,p.jsx)(`div`,{className:`lcc-filters`,role:`group`,"aria-label":`Filter by custody status`,children:U.map(e=>(0,p.jsxs)(`button`,{type:`button`,className:`lcc-chip`,"aria-pressed":h===e.id,onClick:()=>g(e.id),children:[e.label,(0,p.jsx)(`span`,{className:`lcc-chip-count`,children:C[e.id]})]},e.id))}),(0,p.jsx)(`div`,{className:`lcc-ledger`,"aria-label":`Specimen ledger`,children:k.length===0?(0,p.jsx)(`div`,{className:`lcc-empty`,children:`No specimens in this lane right now — every chain here has moved on. Pick another status or All.`}):k.map(e=>(0,p.jsx)(H,{sample:e,hold:I(e,n),isSelected:_===e.id,onSelect:G},e.id))})]}),L==null?null:(0,p.jsxs)(`aside`,{className:`lcc-rail${y?``:` is-drawer-closed`}`,"aria-label":`Custody detail for ${L.id}`,children:[(0,p.jsxs)(`div`,{className:`lcc-rail-head`,children:[(0,p.jsx)(B,{tube:L.tube}),(0,p.jsxs)(`div`,{style:{minWidth:0,flex:1},children:[(0,p.jsx)(`h2`,{className:`lcc-rail-id`,children:L.id}),(0,p.jsxs)(`div`,{className:`lcc-rail-sub`,children:[L.panel,(0,p.jsx)(`br`,{}),L.patient,` · `,L.site]})]}),(0,p.jsx)(`button`,{type:`button`,className:`lcc-rail-close`,"aria-label":`Close custody detail`,onClick:()=>b(!1),children:(0,p.jsx)(r,{icon:s,size:`sm`,color:`inherit`})})]}),(0,p.jsxs)(`div`,{className:`lcc-window`,children:[(0,p.jsxs)(`span`,{children:[`Stability window `,(0,p.jsxs)(`strong`,{children:[L.windowMin,` min`]}),` from draw at `,(0,p.jsx)(`strong`,{children:A(L.drawMin)}),` — deadline`,` `,(0,p.jsx)(`strong`,{children:A(L.drawMin+L.windowMin)})]}),V==null?null:(0,p.jsx)(`span`,{className:`lcc-hold is-${V.tone}`,style:{alignSelf:`flex-start`},children:V.text})]}),(0,p.jsx)(`div`,{className:`lcc-events`,"aria-label":`Custody events`,children:L.events.map((e,t)=>(0,p.jsxs)(`div`,{className:`lcc-event${e.exception==null?``:` is-exception`}`,children:[(0,p.jsxs)(`div`,{className:`lcc-event-top`,children:[(0,p.jsx)(`span`,{className:`lcc-event-stage`,children:T[e.stage].label}),(0,p.jsx)(`span`,{className:`lcc-event-time`,children:A(e.timeMin)})]}),(0,p.jsx)(`div`,{className:`lcc-event-actor`,children:e.actor}),e.note==null?null:(0,p.jsx)(`div`,{className:`lcc-event-note`,children:e.note}),e.exception==null?null:(0,p.jsxs)(`div`,{className:`lcc-event-exc`,role:`alert`,children:[(0,p.jsx)(r,{icon:c,size:`xsm`,color:`inherit`}),` `,e.exception]})]},`${e.stage}-${t}`))}),W==null?(0,p.jsxs)(`span`,{className:`lcc-done`,children:[(0,p.jsx)(r,{icon:i,size:`sm`,color:`inherit`}),`Chain complete — accessioned and in the LIS.`]}):(0,p.jsxs)(p.Fragment,{children:[(0,p.jsxs)(`button`,{type:`button`,className:`lcc-action`,onClick:()=>{if(L==null||W==null)return;let e=W,r=L.drawMin+L.windowMin,i=n>r,a={draw:`Recorded at console`,pickup:`Courier dispatch · console`,receipt:`Central receiving · console`,accession:`Accessioning · console`,recollect:`Console escalation`};t(t=>t.map(t=>t.id===L.id?{...t,events:[...t.events,{stage:e,timeMin:n,actor:a[e],...i?{exception:`Recorded ${n-r} min past the ${t.windowMin}-min stability window (deadline ${A(r)}).`}:{}}]}:t)),m(e=>e+O),S(i?`${T[e].label} recorded for ${L.id} at ${A(n)} — STABILITY EXCEPTION, ${n-r} min past the window. Lab clock is now ${A(n+O)}.`:`${T[e].label} recorded for ${L.id} at ${A(n)}. Lab clock is now ${A(n+O)} — hold timers updated on every open specimen.`)},children:[(0,p.jsx)(r,{icon:i,size:`sm`,color:`inherit`}),T[W].action,` · `,A(n)]}),(0,p.jsxs)(`span`,{className:`lcc-action-note`,children:[`Recording stamps the event at the lab clock and advances it`,` `,O,` minutes — hold timers on every open specimen re-derive.`]})]}),P(L)&&!L.recollect?(0,p.jsxs)(`button`,{type:`button`,className:`lcc-action is-danger`,onClick:()=>{L!=null&&(t(e=>e.map(e=>e.id===L.id?{...e,recollect:!0,events:[...e.events,{stage:`recollect`,timeMin:n,actor:`Console escalation`,note:`Recollect requested from ${e.site}; original specimen held for review.`}]}:e)),m(e=>e+O),S(`Recollect requested for ${L.id}. Lab clock is now ${A(n+O)}.`))},children:[(0,p.jsx)(r,{icon:a,size:`sm`,color:`inherit`}),`Request recollect from `,L.site]}):null,L.recollect?(0,p.jsx)(`span`,{className:`lcc-action-note`,children:`Recollect requested — original specimen held for pathologist review.`}):null]})]})]})})]})}export{W as default};