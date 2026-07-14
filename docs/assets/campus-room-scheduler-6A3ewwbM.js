import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Icon-CLHSQIsB.js";import{t as i}from"./accessibility-hrNTZOxM.js";import{t as a}from"./arrow-left-lDMrUf6i.js";import{t as o}from"./flask-conical-U5LbBOZP.js";import{t as s}from"./plus-DcCKTwde.js";import{t as c}from"./projector-C5UZujMh.js";import{t as l}from"./users-CZ_ErO4t.js";import{t as u}from"./video-yiZOk68P.js";import{i as d,o as f}from"./index-CcGpqB1l.js";import{n as p,t as m}from"./LayoutContent-CCL91W7X.js";import{t as h}from"./LayoutHeader-Cy2mWoMf.js";var g=e(t(),1),_=n(),v=`tpl-campus-room-scheduler`,y=`light-dark(#0369A1, #7DD3FC)`,b=`light-dark(#FFFFFF, #082F49)`,x={org:`Roomloom`,title:`Fall 2026 · Schedule Draft 3`,subtitle:`Registrar scheduling`},S=.7,C=.9,w=[{id:`m1`,group:`MWF`,time:`8:00`},{id:`m2`,group:`MWF`,time:`9:10`},{id:`m3`,group:`MWF`,time:`10:20`},{id:`m4`,group:`MWF`,time:`11:30`},{id:`m5`,group:`MWF`,time:`12:40`},{id:`t1`,group:`TTh`,time:`8:00`},{id:`t2`,group:`TTh`,time:`9:35`},{id:`t3`,group:`TTh`,time:`11:10`},{id:`t4`,group:`TTh`,time:`12:45`}],T=w.filter(e=>e.group===`MWF`).length,E={accessible:{label:`Step-free access`,icon:i},av:{label:`AV / projector`,icon:c},lab:{label:`Lab benches`,icon:o},capture:{label:`Lecture capture`,icon:u}},ee=[`accessible`,`av`,`lab`,`capture`],D=[{id:`oak101`,code:`OAK 101`,kindLine:`Tiered lecture hall`,capacity:150,features:[`accessible`,`av`,`capture`]},{id:`oak210`,code:`OAK 210`,kindLine:`Flat lecture room`,capacity:64,features:[`accessible`,`av`]},{id:`hum112`,code:`HUM 112`,kindLine:`Seminar · 1898 wing, stairs only`,capacity:24,features:[`av`]},{id:`hum305`,code:`HUM 305`,kindLine:`Seminar · chalkboard only`,capacity:18,features:[]},{id:`sci240`,code:`SCI 240`,kindLine:`Wet lab`,capacity:28,features:[`accessible`,`av`,`lab`]},{id:`sci118`,code:`SCI 118`,kindLine:`Flex lecture / lab`,capacity:48,features:[`accessible`,`av`,`lab`]},{id:`wexb04`,code:`WEX B04`,kindLine:`Wexler Commons Flexible Studio (dividable)`,capacity:40,features:[`accessible`]},{id:`lib022`,code:`LIB 022`,kindLine:`Basement classroom · stairs only`,capacity:32,features:[`av`,`capture`]}],O=new Map(D.map(e=>[e.id,e])),k=[{id:`bio204`,code:`BIO 204`,title:`Genetics`,enrollment:46,pattern:`TTh`,required:[`av`],accommodation:!1},{id:`eng101`,code:`ENG 101-03`,title:`College Composition`,enrollment:22,pattern:`MWF`,required:[`av`],accommodation:!1},{id:`chem110`,code:`CHEM 110L`,title:`General Chemistry Lab A`,enrollment:26,pattern:`TTh`,required:[`lab`],accommodation:!1},{id:`psy100`,code:`PSY 100`,title:`Intro to Psychology`,enrollment:138,pattern:`MWF`,required:[`av`,`capture`],accommodation:!1},{id:`his212`,code:`HIS 212`,title:`The Atlantic World`,enrollment:31,pattern:`TTh`,required:[`av`],accommodation:!1},{id:`math152`,code:`MATH 152`,title:`Calculus II`,enrollment:58,pattern:`MWF`,required:[`av`],accommodation:!1},{id:`soc301`,code:`SOC 301`,title:`Qualitative Methods`,enrollment:17,pattern:`TTh`,required:[`av`],accommodation:!0},{id:`phil240`,code:`PHIL 240`,title:`Ethics of Care`,enrollment:23,pattern:`MWF`,required:[],accommodation:!1},{id:`bio310`,code:`BIO 310L`,title:`Microbiology Lab`,enrollment:27,pattern:`MWF`,required:[`av`,`lab`],accommodation:!1},{id:`econ101`,code:`ECON 101`,title:`Principles of Microeconomics`,enrollment:142,pattern:`TTh`,required:[`av`,`capture`],accommodation:!1},{id:`cs215`,code:`CS 215`,title:`Data Structures`,enrollment:44,pattern:`MWF`,required:[`av`],accommodation:!0},{id:`art130`,code:`ART 130`,title:`Studio Foundations`,enrollment:36,pattern:`TTh`,required:[],accommodation:!1},{id:`ling480`,code:`LING 480`,title:`Field Methods in Language Documentation and Description`,enrollment:12,pattern:`TTh`,required:[`av`],accommodation:!1},{id:`wri205`,code:`WRI 205`,title:`Creative Nonfiction Workshop`,enrollment:20,pattern:`MWF`,required:[`av`],accommodation:!0}],A=new Map(k.map(e=>[e.id,e])),j={bio204:{roomId:`sci118`,blockId:`t2`},eng101:{roomId:`hum112`,blockId:`m2`},chem110:{roomId:`sci240`,blockId:`t3`},psy100:{roomId:`oak101`,blockId:`m3`},his212:{roomId:`lib022`,blockId:`t1`},math152:{roomId:`oak210`,blockId:`m1`}};function M(e,t,n,r){if(n.group!==e.pattern)return{kind:`pattern`};if(r!=null)return{kind:`occupied`};if(e.accommodation&&!t.features.includes(`accessible`))return{kind:`access`};if(t.capacity<e.enrollment)return{kind:`overcap`};let i=e.required.filter(e=>!t.features.includes(e));if(i.length>0)return{kind:`feature`,missing:i};let a=e.enrollment/t.capacity;return a>=C?{kind:`tight`,projected:a}:{kind:`ok`,projected:a}}function N(e){return e>=C?`hot`:e>=S?`warm`:`cool`}function P(e,t,n){switch(n.kind){case`access`:return`${e.code} carries a mobility accommodation and ${t.code} has no step-free access. Pick a room with the step-free badge.`;case`overcap`:return`${e.code} enrolls ${e.enrollment} but ${t.code} seats ${t.capacity} — over capacity by ${e.enrollment-t.capacity}.`;case`feature`:return`${t.code} is missing ${n.missing.map(e=>E[e].label.toLowerCase()).join(` and `)} required by ${e.code}.`;case`occupied`:return`That block in ${t.code} is already scheduled. Pick an open cell.`;case`pattern`:return`${e.code} meets ${e.pattern} — this column is a different pattern.`;default:return``}}function F(e){return`${Math.round(e*100)}%`}var I=`
.${v} {
  --rl-accent: ${y};
  --rl-on-accent: ${b};
  --rl-accent-border: color-mix(in srgb, ${y} 45%, var(--color-border));
  --rl-wash-cool: color-mix(in srgb, ${y} 10%, var(--color-background-card));
  --rl-wash-warm: color-mix(in srgb, ${y} 24%, var(--color-background-card));
  --rl-wash-hot: color-mix(in srgb, ${y} 40%, var(--color-background-card));
  color: var(--color-text-primary);
  font-family: var(--font-family-sans, var(--font-family-body, system-ui, sans-serif));
}
.${v} *,
.${v} *::before,
.${v} *::after {
  box-sizing: border-box;
}
.${v} h1,
.${v} h2,
.${v} h3,
.${v} p,
.${v} ul,
.${v} ol,
.${v} li {
  margin: 0;
  padding: 0;
}
.${v} ul,
.${v} ol {
  list-style: none;
}
.${v} button {
  background: none;
  border: 0;
  color: inherit;
  cursor: pointer;
  font: inherit;
  padding: 0;
  text-align: inherit;
}
.${v} button:focus-visible {
  outline: 2px solid var(--rl-accent);
  outline-offset: -2px;
}
.${v} .num {
  font-variant-numeric: tabular-nums;
}

/* ---- topbar: 56px ---------------------------------------------------------- */
.${v}.topbar {
  align-items: center;
  display: flex;
  gap: var(--spacing-3);
  min-height: 56px;
  padding: var(--spacing-2) var(--spacing-4);
}
.${v} .brandCluster {
  align-items: center;
  display: flex;
  flex: none;
  gap: var(--spacing-3);
  min-width: 0;
}
.${v} .brandMark {
  align-items: center;
  background: var(--rl-accent);
  border-radius: 10px;
  color: var(--rl-on-accent);
  display: inline-flex;
  flex: none;
  height: 36px;
  justify-content: center;
  width: 36px;
}
.${v} .eyebrow {
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  line-height: 1.3;
  text-transform: uppercase;
  white-space: nowrap;
}
.${v} h1 {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${v} .topbarSpring {
  flex: 1 1 auto;
  min-width: 0;
}
.${v} .kpiRow {
  display: flex;
  flex: none;
  gap: var(--spacing-2);
  overflow-x: auto;
}
.${v} .kpiChip {
  align-items: baseline;
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  display: inline-flex;
  flex: none;
  font-size: 12px;
  gap: 6px;
  min-height: 28px;
  padding: 4px 10px;
  white-space: nowrap;
}
.${v} .kpiChip strong {
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 700;
}

/* ---- workspace: 264px rail + grid panel ----------------------------------- */
.${v}.workspace {
  background: var(--color-background-body);
  display: grid;
  gap: 12px;
  grid-template-columns: 264px minmax(0, 1fr);
  height: 100%;
  min-height: 0;
  overflow: hidden;
  padding: var(--spacing-3) var(--spacing-4) var(--spacing-4);
}
.${v} .panel {
  background: var(--color-background-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
.${v} .railHeader {
  align-items: center;
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex: none;
  gap: var(--spacing-2);
  min-height: 44px;
  padding: 0 var(--spacing-3);
}
.${v} .railTitle {
  font-size: 13px;
  font-weight: 700;
}
.${v} .railCount {
  background: var(--color-background-muted);
  border-radius: 999px;
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 700;
  margin-left: auto;
  padding: 2px 8px;
}
.${v} .railHint {
  border-bottom: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
  flex: none;
  font-size: 11px;
  line-height: 1.45;
  padding: var(--spacing-2) var(--spacing-3);
}
.${v} .queueList {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-2);
}
.${v} .queueEmpty {
  border: var(--border-width) dashed var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.5;
  margin: var(--spacing-2);
  padding: var(--spacing-4) var(--spacing-3);
  text-align: center;
}

/* ---- queue card: 68px min, whole card is the arming button ---------------- */
.${v} .queueCard {
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  display: block;
  min-height: 68px;
  padding: 10px 12px;
  transition: border-color 140ms ease, background-color 140ms ease;
  width: 100%;
}
@media (hover: hover) {
  .${v} .queueCard:hover {
    background: var(--color-overlay-hover);
    border-color: var(--rl-accent-border);
  }
}
.${v} .queueCard[aria-pressed='true'] {
  background: var(--rl-wash-cool);
  border-color: var(--rl-accent);
}
.${v} .queueTop {
  align-items: baseline;
  display: flex;
  gap: var(--spacing-2);
}
.${v} .queueCode {
  flex: none;
  font-size: 13px;
  font-weight: 700;
}
.${v} .queueTitle {
  color: var(--color-text-secondary);
  flex: 1 1 auto;
  font-size: 12px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${v} .queueMeta {
  align-items: center;
  display: flex;
  gap: var(--spacing-2);
  margin-top: 6px;
}
.${v} .metaChip {
  align-items: center;
  background: var(--color-background-muted);
  border-radius: 5px;
  color: var(--color-text-secondary);
  display: inline-flex;
  font-size: 11px;
  font-weight: 600;
  gap: 4px;
  padding: 2px 6px;
  white-space: nowrap;
}
.${v} .metaChip.pattern {
  background: var(--rl-wash-cool);
  color: var(--color-text-primary);
}
.${v} .featureIcons {
  align-items: center;
  color: var(--color-icon-secondary);
  display: inline-flex;
  gap: 4px;
  margin-left: auto;
}
.${v} .featureIcons .accommodation {
  color: var(--rl-accent);
  display: inline-flex;
}

/* ---- banner (refusal / arming hint) ---------------------------------------- */
.${v} .banner {
  align-items: flex-start;
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex: none;
  font-size: 12px;
  gap: var(--spacing-2);
  line-height: 1.45;
  padding: var(--spacing-2) var(--spacing-3);
}
.${v} .banner.refusal {
  background: var(--color-error-muted);
}
.${v} .banner.arming {
  background: var(--rl-wash-cool);
}
.${v} .banner .bannerIcon {
  color: var(--color-error);
  display: inline-flex;
  flex: none;
  margin-top: 1px;
}
.${v} .banner.arming .bannerIcon {
  color: var(--rl-accent);
}
.${v} .banner .bannerText {
  flex: 1 1 auto;
  min-width: 0;
}
.${v} .banner .bannerText strong {
  font-weight: 700;
}
.${v} .bannerDismiss {
  align-items: center;
  align-self: center;
  border-radius: 8px;
  color: var(--color-text-secondary);
  display: inline-flex;
  flex: none;
  height: 40px;
  justify-content: center;
  margin: -8px 0;
  width: 40px;
}
@media (hover: hover) {
  .${v} .bannerDismiss:hover {
    background: var(--color-overlay-hover);
  }
}

/* ---- schedule grid ---------------------------------------------------------- */
.${v} .gridScroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}
.${v} .schedule {
  display: grid;
  grid-template-columns: 172px repeat(9, minmax(56px, 1fr));
  min-width: 100%;
}
.${v} .headCell {
  align-items: center;
  background: var(--color-background-card);
  border-bottom: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
  display: flex;
  font-size: 11px;
  font-weight: 700;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 2;
}
.${v} .groupHead {
  height: 28px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.${v} .timeHead {
  font-variant-numeric: tabular-nums;
  height: 32px;
  top: 28px;
}
.${v} .cornerCell {
  justify-content: flex-start;
  padding-left: var(--spacing-3);
  position: sticky;
  left: 0;
  z-index: 3;
}
/* Visual seam between the MWF and TTh groups. */
.${v} .groupStart {
  border-left: 2px solid var(--color-border-emphasized, var(--color-border));
}
.${v} .roomCell {
  background: var(--color-background-card);
  border-bottom: var(--border-width) solid var(--color-border);
  border-right: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 2px;
  justify-content: center;
  left: 0;
  min-height: 56px;
  padding: 6px var(--spacing-3) 6px;
  position: sticky;
  z-index: 1;
}
.${v} .roomTop {
  align-items: baseline;
  display: flex;
  gap: 6px;
  min-width: 0;
}
.${v} .roomCode {
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.${v} .roomCap {
  color: var(--color-text-secondary);
  font-size: 11px;
  white-space: nowrap;
}
.${v} .roomKind {
  color: var(--color-text-secondary);
  font-size: 10px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${v} .roomFoot {
  align-items: center;
  display: flex;
  gap: 6px;
}
.${v} .roomFeatures {
  align-items: center;
  color: var(--color-icon-secondary);
  display: inline-flex;
  flex: none;
  gap: 3px;
}
.${v} .utilTrack {
  background: var(--color-background-muted);
  border-radius: 999px;
  flex: 1 1 auto;
  height: 4px;
  min-width: 24px;
  overflow: hidden;
}
.${v} .utilFill {
  background: var(--rl-accent);
  display: block;
  height: 100%;
  transition: width 320ms cubic-bezier(0.22, 1, 0.36, 1);
}
.${v} .utilPct {
  color: var(--color-text-secondary);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* ---- cells ------------------------------------------------------------------ */
.${v} .cell {
  align-items: center;
  border-bottom: var(--border-width) solid var(--color-border);
  border-right: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 1px;
  justify-content: center;
  min-height: 56px;
  overflow: hidden;
  padding: 4px;
  position: relative;
  transition: background-color 140ms ease, box-shadow 140ms ease, opacity 140ms ease;
  width: 100%;
}
.${v} .cellCode {
  font-size: 11px;
  font-weight: 700;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${v} .cellFill {
  color: var(--color-text-secondary);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
/* Occupied: enrollment-pressure shading; text stays text-primary. */
.${v} .cell.occupied.cool { background: var(--rl-wash-cool); }
.${v} .cell.occupied.warm { background: var(--rl-wash-warm); }
.${v} .cell.occupied.hot { background: var(--rl-wash-hot); }
@media (hover: hover) {
  .${v} .cell.occupied:hover {
    box-shadow: inset 0 0 0 2px var(--rl-accent-border);
  }
}
.${v} .cell.inspected {
  box-shadow: inset 0 0 0 2px var(--rl-accent);
}
/* Armed-placement verdict styling. */
.${v} .cell.eligible {
  box-shadow: inset 0 0 0 1.5px var(--rl-accent-border);
}
.${v} .cell.eligible .cellGhost {
  align-items: center;
  color: var(--rl-accent);
  display: inline-flex;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  gap: 2px;
}
@media (hover: hover) {
  .${v} .cell.eligible:hover {
    background: var(--rl-wash-cool);
    box-shadow: inset 0 0 0 2px var(--rl-accent);
  }
}
.${v} .cell.tight .cellGhost {
  color: var(--color-text-primary);
}
.${v} .cell.tight {
  background: var(--color-warning-muted);
}
.${v} .cell.conflict {
  background: var(--color-error-muted);
  cursor: not-allowed;
}
.${v} .cell.conflict .conflictIcon {
  color: var(--color-error);
  display: inline-flex;
}
.${v} .cell.mismatch {
  background: var(--color-warning-muted);
  cursor: not-allowed;
}
.${v} .cell.mismatch .conflictIcon {
  color: var(--color-text-secondary);
  display: inline-flex;
}
.${v} .cell.dimmed {
  cursor: default;
  opacity: 0.45;
}
.${v} .cell.occupiedLocked {
  cursor: not-allowed;
  opacity: 0.6;
}
.${v} .conflictNote {
  color: var(--color-text-secondary);
  font-size: 9px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
/* Accommodation refusal: a quick horizontal shake on the refused cell. */
@keyframes ${v}-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  50% { transform: translateX(4px); }
  75% { transform: translateX(-2px); }
}
.${v} .cell.shaking {
  animation: ${v}-shake 320ms ease;
}

/* ---- inspector strip: 56px --------------------------------------------------- */
.${v} .inspector {
  align-items: center;
  border-top: var(--border-width) solid var(--color-border);
  display: flex;
  flex: none;
  gap: var(--spacing-3);
  min-height: 56px;
  padding: var(--spacing-1) var(--spacing-3);
}
.${v} .inspectorText {
  flex: 1 1 auto;
  min-width: 0;
}
.${v} .inspectorTitle {
  font-size: 13px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${v} .inspectorMeta {
  color: var(--color-text-secondary);
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${v} .returnButton {
  align-items: center;
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  display: inline-flex;
  flex: none;
  font-size: 12px;
  font-weight: 600;
  gap: 6px;
  min-height: 40px;
  padding: 0 var(--spacing-3);
}
@media (hover: hover) {
  .${v} .returnButton:hover {
    background: var(--color-overlay-hover);
  }
}
.${v} .inspectorClose {
  align-items: center;
  border-radius: 8px;
  color: var(--color-text-secondary);
  display: inline-flex;
  flex: none;
  height: 40px;
  justify-content: center;
  width: 40px;
}
@media (hover: hover) {
  .${v} .inspectorClose:hover {
    background: var(--color-overlay-hover);
  }
}

/* ---- legend strip: 36px -------------------------------------------------------- */
.${v} .legend {
  align-items: center;
  border-top: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
  display: flex;
  flex: none;
  flex-wrap: wrap;
  font-size: 11px;
  gap: var(--spacing-1) var(--spacing-3);
  min-height: 36px;
  padding: var(--spacing-1) var(--spacing-3);
}
.${v} .legendItem {
  align-items: center;
  display: inline-flex;
  gap: 5px;
  white-space: nowrap;
}
.${v} .legendSwatch {
  border: var(--border-width) solid var(--color-border);
  border-radius: 3px;
  display: inline-block;
  height: 10px;
  width: 10px;
}
.${v} .legendSwatch.cool { background: var(--rl-wash-cool); }
.${v} .legendSwatch.warm { background: var(--rl-wash-warm); }
.${v} .legendSwatch.hot { background: var(--rl-wash-hot); }
.${v} .legendSwatch.conflict { background: var(--color-error-muted); }

/* ---- a11y helpers ---------------------------------------------------------------- */
.${v} .visuallyHidden {
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

/* ---- responsive: subtraction, not squeeze ------------------------------------ */
@media (max-width: 900px) {
  .${v}.workspace {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
  }
  .${v} .railPanel {
    max-height: 176px;
  }
  .${v} .queueList {
    flex-direction: row;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }
  .${v} .queueCard {
    flex: none;
    scroll-snap-align: start;
    width: 248px;
  }
  .${v} .schedule {
    grid-template-columns: 132px repeat(9, 64px);
    min-width: max-content;
  }
}
@media (max-width: 640px) {
  .${v}.topbar {
    flex-wrap: wrap;
    padding-bottom: var(--spacing-2);
  }
  .${v} .topbarSpring {
    display: none;
  }
  .${v} .kpiRow {
    flex: 1 1 100%;
    order: 3;
  }
  .${v} .kpiChip {
    min-height: 40px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .${v} *,
  .${v} *::before,
  .${v} *::after {
    animation-duration: 0ms !important;
    transition-duration: 0ms !important;
  }
}
`;function L(){return(0,_.jsxs)(`svg`,{width:`20`,height:`20`,viewBox:`0 0 20 20`,fill:`none`,"aria-hidden":`true`,children:[(0,_.jsx)(`path`,{d:`M5 3v14M10 3v14M15 3v14`,stroke:`currentColor`,strokeWidth:`1.6`,strokeLinecap:`round`}),(0,_.jsx)(`path`,{d:`M2 10c2 0 2-2.6 4-2.6S8 12.6 10 12.6 12 7.4 14 7.4s2 2.6 4 2.6`,stroke:`currentColor`,strokeWidth:`1.6`,strokeLinecap:`round`})]})}function R({section:e,isArmed:t,onArm:n}){return(0,_.jsx)(`li`,{children:(0,_.jsxs)(`button`,{type:`button`,id:`crs-queue-${e.id}`,className:`queueCard`,"aria-pressed":t,"aria-label":`${e.code} ${e.title}, ${e.enrollment} students, ${e.pattern}${e.accommodation?`, mobility accommodation on file`:``}. ${t?`Armed — pick a grid cell, or press again to cancel.`:`Select to place.`}`,onClick:()=>n(e.id),children:[(0,_.jsxs)(`span`,{className:`queueTop`,children:[(0,_.jsx)(`span`,{className:`queueCode`,children:e.code}),(0,_.jsx)(`span`,{className:`queueTitle`,children:e.title})]}),(0,_.jsxs)(`span`,{className:`queueMeta`,children:[(0,_.jsxs)(`span`,{className:`metaChip num`,children:[(0,_.jsx)(r,{icon:l,size:`xsm`,color:`inherit`}),e.enrollment]}),(0,_.jsx)(`span`,{className:`metaChip pattern`,children:e.pattern}),(0,_.jsxs)(`span`,{className:`featureIcons`,children:[e.required.map(e=>{let t=E[e];return(0,_.jsx)(`span`,{title:`Requires ${t.label.toLowerCase()}`,children:(0,_.jsx)(r,{icon:t.icon,size:`xsm`,color:`inherit`})},e)}),e.accommodation&&(0,_.jsx)(`span`,{className:`accommodation`,title:`Mobility accommodation — step-free access required`,children:(0,_.jsx)(r,{icon:i,size:`xsm`,color:`inherit`})})]})]})]})})}function z({room:e,block:t,occupant:n,verdict:a,armedSection:o,isInspected:c,isShaking:l,isGroupStart:u,onActivate:d,onShakeEnd:p}){let m=[`cell`];u&&m.push(`groupStart`);let h=null,g=`${e.code}, ${t.group} ${t.time}`;if(n!=null){let t=n.enrollment/e.capacity;m.push(`occupied`,N(t)),c&&m.push(`inspected`),o!=null&&m.push(`occupiedLocked`),g+=` — ${n.code}, ${n.enrollment} of ${e.capacity} seats (${F(t)} full). ${o==null?`Open inspector.`:`Already scheduled.`}`,h=(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(`span`,{className:`cellCode`,children:n.code}),(0,_.jsxs)(`span`,{className:`cellFill num`,children:[n.enrollment,`/`,e.capacity]})]})}else if(a==null)m.push(`dimmed`),g+=` — open. Select a section from the queue first.`;else switch(a.kind){case`ok`:case`tight`:m.push(`eligible`),a.kind===`tight`&&m.push(`tight`),g+=` — open. Place ${o?.code??``} here, projected ${o?.enrollment??0} of ${e.capacity} seats${a.kind===`tight`?` (tight fit)`:``}.`,h=(0,_.jsxs)(`span`,{className:`cellGhost`,children:[(0,_.jsx)(r,{icon:s,size:`xsm`,color:`inherit`}),o?.enrollment,`/`,e.capacity]});break;case`pattern`:m.push(`dimmed`),g+=` — different meeting pattern than ${o?.code??``}.`;break;case`access`:m.push(`conflict`),l&&m.push(`shaking`),g+=` — refused: no step-free access and ${o?.code??``} carries a mobility accommodation.`,h=(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(`span`,{className:`conflictIcon`,children:(0,_.jsx)(r,{icon:i,size:`xsm`,color:`inherit`})}),(0,_.jsx)(`span`,{className:`conflictNote`,children:`no access`})]});break;case`overcap`:m.push(`conflict`),g+=` — over capacity: ${o?.enrollment??0} students, ${e.capacity} seats.`,h=(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(`span`,{className:`conflictIcon`,children:(0,_.jsx)(r,{icon:f,size:`xsm`,color:`inherit`})}),(0,_.jsxs)(`span`,{className:`conflictNote num`,children:[e.capacity,` < `,o?.enrollment]})]});break;case`feature`:{m.push(`mismatch`);let e=a.missing.map(e=>E[e].label.toLowerCase()).join(`, `);g+=` — missing ${e}.`,h=(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(`span`,{className:`conflictIcon`,children:(0,_.jsx)(r,{icon:E[a.missing[0]].icon,size:`xsm`,color:`inherit`})}),(0,_.jsx)(`span`,{className:`conflictNote`,children:`missing`})]});break}default:break}return(0,_.jsx)(`button`,{type:`button`,className:m.join(` `),"aria-label":g,onClick:()=>d(e.id,t.id),onAnimationEnd:l?p:void 0,children:h})}var B=(e,t)=>`${e}:${t}`;function V(){let[e,t]=(0,g.useState)(j),[n,o]=(0,g.useState)(null),[c,u]=(0,g.useState)(null),[y,b]=(0,g.useState)(null),[S,C]=(0,g.useState)(null),[N,V]=(0,g.useState)(``),H=(0,g.useMemo)(()=>{let t=new Map;for(let[n,r]of Object.entries(e))t.set(B(r.roomId,r.blockId),n);return t},[e]),te=(0,g.useMemo)(()=>{let t=new Map;for(let n of Object.values(e))t.set(n.roomId,(t.get(n.roomId)??0)+1);return t},[e]),U=(0,g.useMemo)(()=>k.filter(t=>e[t.id]==null),[e]),W=(0,g.useMemo)(()=>{let t=0,n=0;for(let[r,i]of Object.entries(e)){let e=A.get(r),a=O.get(i.roomId);e!=null&&a!=null&&(t+=e.enrollment,n+=a.capacity)}let r=Object.keys(e).length;return{placed:r,total:k.length,seatFill:n>0?t/n:0,blocksUsed:r,totalBlocks:D.length*w.length}},[e]),G=n==null?null:A.get(n)??null,K=c==null?null:H.get(B(c.roomId,c.blockId))??null,q=K==null?null:A.get(K)??null,J=(0,g.useCallback)(e=>{u(null),b(null),C(null),o(t=>{if(t===e)return V(`Placement cancelled.`),null;let n=A.get(e);return n!=null&&V(`Placing ${n.code} — ${n.pattern}, ${n.enrollment} students. Eligible cells show projected seat fill; Escape cancels.`),e})},[]),Y=(0,g.useCallback)((e,n)=>{let r=O.get(e),i=w.find(e=>e.id===n);if(r==null||i==null)return;let a=B(e,n),s=H.get(a)??null;if(G==null){s==null?V(`Select a section from the queue first, then pick a cell.`):(u({roomId:e,blockId:n}),b(null));return}let c=M(G,r,i,s??void 0);if(c.kind===`ok`||c.kind===`tight`){let a=U.length-1;t(t=>({...t,[G.id]:{roomId:e,blockId:n}})),o(null),b(null),C(null),V(`Placed ${G.code} in ${r.code}, ${i.group} ${i.time} — ${G.enrollment} of ${r.capacity} seats (${F(G.enrollment/r.capacity)}).${c.kind===`tight`?` Tight fit — over 90% of the room.`:``} ${a} section${a===1?``:`s`} left to place.`);return}let l=P(G,r,c);b(l),V(`Refused: ${l}`),c.kind===`access`&&C(a)},[G,H,U.length]),X=(0,g.useCallback)(()=>{if(c==null||q==null)return;let e=O.get(c.roomId),n=w.find(e=>e.id===c.blockId);t(e=>{let t={...e};return delete t[q.id],t}),u(null),V(`Returned ${q.code} to the queue from ${e?.code??``} ${n?.group??``} ${n?.time??``}.`)},[c,q]),Z=(0,g.useCallback)(()=>C(null),[]),ne=(0,g.useCallback)(e=>{e.key===`Escape`&&(n==null?c!=null&&u(null):(o(null),b(null),V(`Placement cancelled.`)))},[n,c]),Q=c==null?null:O.get(c.roomId)??null,$=c==null?null:w.find(e=>e.id===c.blockId)??null;return(0,_.jsx)(p,{height:`fill`,header:(0,_.jsxs)(h,{hasDivider:!0,padding:0,children:[(0,_.jsx)(`style`,{children:I}),(0,_.jsxs)(`div`,{className:`${v} topbar`,children:[(0,_.jsxs)(`div`,{className:`brandCluster`,children:[(0,_.jsx)(`span`,{className:`brandMark`,"aria-hidden":`true`,children:(0,_.jsx)(L,{})}),(0,_.jsxs)(`div`,{style:{minWidth:0},children:[(0,_.jsxs)(`p`,{className:`eyebrow`,children:[x.org,` · `,x.subtitle]}),(0,_.jsx)(`h1`,{children:x.title})]})]}),(0,_.jsx)(`div`,{className:`topbarSpring`}),(0,_.jsxs)(`div`,{className:`kpiRow`,role:`group`,"aria-label":`Draft status`,children:[(0,_.jsxs)(`span`,{className:`kpiChip`,children:[`Placed`,` `,(0,_.jsxs)(`strong`,{className:`num`,children:[W.placed,`/`,W.total]})]}),(0,_.jsxs)(`span`,{className:`kpiChip`,title:`Enrollment across placed sections vs the capacity of their rooms`,children:[`Seat fill`,` `,(0,_.jsx)(`strong`,{className:`num`,children:W.placed>0?F(W.seatFill):`—`})]}),(0,_.jsxs)(`span`,{className:`kpiChip`,children:[`Blocks used`,` `,(0,_.jsxs)(`strong`,{className:`num`,children:[W.blocksUsed,`/`,W.totalBlocks]})]})]})]})]}),content:(0,_.jsx)(m,{padding:0,role:`main`,label:`Room scheduling workspace`,children:(0,_.jsxs)(`div`,{className:`${v} workspace`,onKeyDown:ne,children:[(0,_.jsx)(`div`,{"aria-live":`polite`,className:`visuallyHidden`,children:N}),(0,_.jsxs)(`section`,{className:`panel railPanel`,"aria-label":`Unplaced sections`,children:[(0,_.jsxs)(`div`,{className:`railHeader`,children:[(0,_.jsx)(`h2`,{className:`railTitle`,children:`To schedule`}),(0,_.jsx)(`span`,{className:`railCount num`,children:U.length})]}),(0,_.jsx)(`p`,{className:`railHint`,children:`Select a section, then pick a cell in the grid. Cells refuse rooms that break capacity, features, or a mobility accommodation.`}),U.length===0?(0,_.jsx)(`p`,{className:`queueEmpty`,children:`Every section is placed. Click any scheduled cell to review or return it to the queue.`}):(0,_.jsx)(`ul`,{className:`queueList`,children:U.map(e=>(0,_.jsx)(R,{section:e,isArmed:n===e.id,onArm:J},e.id))})]}),(0,_.jsxs)(`section`,{className:`panel`,"aria-label":`Week by room availability grid`,children:[y==null?G==null?null:(0,_.jsxs)(`div`,{className:`banner arming`,role:`status`,children:[(0,_.jsx)(`span`,{className:`bannerIcon`,children:(0,_.jsx)(r,{icon:s,size:`sm`,color:`inherit`})}),(0,_.jsxs)(`p`,{className:`bannerText`,children:[`Placing `,(0,_.jsx)(`strong`,{children:G.code}),` ·`,` `,G.pattern,` · `,G.enrollment,` students — eligible cells preview their seat fill. Press Escape to cancel.`]})]}):(0,_.jsxs)(`div`,{className:`banner refusal`,role:`status`,children:[(0,_.jsx)(`span`,{className:`bannerIcon`,children:(0,_.jsx)(r,{icon:f,size:`sm`,color:`inherit`})}),(0,_.jsx)(`p`,{className:`bannerText`,children:y}),(0,_.jsx)(`button`,{type:`button`,className:`bannerDismiss`,"aria-label":`Dismiss refusal message`,onClick:()=>b(null),children:(0,_.jsx)(r,{icon:d,size:`xsm`,color:`inherit`})})]}),(0,_.jsx)(`div`,{className:`gridScroll`,children:(0,_.jsxs)(`div`,{className:`schedule`,children:[(0,_.jsx)(`div`,{className:`headCell groupHead cornerCell`,"aria-hidden":`true`}),(0,_.jsx)(`div`,{className:`headCell groupHead`,style:{gridColumn:`span 5`},children:`Mon · Wed · Fri`}),(0,_.jsx)(`div`,{className:`headCell groupHead groupStart`,style:{gridColumn:`span 4`},children:`Tue · Thu`}),(0,_.jsx)(`div`,{className:`headCell timeHead cornerCell`,"aria-hidden":`true`}),w.map((e,t)=>(0,_.jsx)(`div`,{className:`headCell timeHead${t===T?` groupStart`:``}`,children:e.time},e.id)),D.map(e=>{let t=te.get(e.id)??0;return(0,_.jsxs)(`div`,{style:{display:`contents`},children:[(0,_.jsxs)(`div`,{className:`roomCell`,children:[(0,_.jsxs)(`span`,{className:`roomTop`,children:[(0,_.jsx)(`span`,{className:`roomCode`,children:e.code}),(0,_.jsxs)(`span`,{className:`roomCap num`,children:[(0,_.jsx)(r,{icon:l,size:`xsm`,color:`inherit`}),` `,e.capacity]})]}),(0,_.jsx)(`span`,{className:`roomKind`,title:e.kindLine,children:e.kindLine}),(0,_.jsxs)(`span`,{className:`roomFoot`,children:[(0,_.jsx)(`span`,{className:`roomFeatures`,children:ee.filter(t=>e.features.includes(t)).map(e=>(0,_.jsx)(`span`,{title:E[e].label,children:(0,_.jsx)(r,{icon:E[e].icon,size:`xsm`,color:`inherit`})},e))}),(0,_.jsx)(`span`,{className:`utilTrack`,role:`img`,"aria-label":`${e.code} utilization: ${t} of ${w.length} blocks`,children:(0,_.jsx)(`span`,{className:`utilFill`,style:{width:`${t/w.length*100}%`}})}),(0,_.jsxs)(`span`,{className:`utilPct num`,children:[t,`/`,w.length]})]})]}),w.map((t,n)=>{let r=B(e.id,t.id),i=H.get(r)??null,a=i==null?null:A.get(i)??null,o=G==null?null:M(G,e,t,i??void 0),s=c!=null&&c.roomId===e.id&&c.blockId===t.id;return(0,_.jsx)(z,{room:e,block:t,occupant:a,verdict:o,armedSection:G,isInspected:s,isShaking:S===r,isGroupStart:n===T,onActivate:Y,onShakeEnd:Z},r)})]},e.id)})]})}),q!=null&&Q!=null&&$!=null&&(0,_.jsxs)(`div`,{className:`inspector`,role:`region`,"aria-label":`Placement inspector`,children:[(0,_.jsxs)(`div`,{className:`inspectorText`,children:[(0,_.jsxs)(`p`,{className:`inspectorTitle`,children:[q.code,` · `,q.title]}),(0,_.jsxs)(`p`,{className:`inspectorMeta num`,children:[Q.code,` · `,$.group,` `,$.time,` · `,q.enrollment,`/`,Q.capacity,` seats (`,F(q.enrollment/Q.capacity),` `,`full)`]})]}),(0,_.jsxs)(`button`,{type:`button`,className:`returnButton`,onClick:X,children:[(0,_.jsx)(r,{icon:a,size:`sm`,color:`inherit`}),`Return to queue`]}),(0,_.jsx)(`button`,{type:`button`,className:`inspectorClose`,"aria-label":`Close inspector`,onClick:()=>u(null),children:(0,_.jsx)(r,{icon:d,size:`sm`,color:`inherit`})})]}),(0,_.jsxs)(`div`,{className:`legend`,"aria-label":`Grid legend`,children:[(0,_.jsx)(`span`,{className:`legendItem`,children:`Seat-fill shading:`}),(0,_.jsxs)(`span`,{className:`legendItem`,children:[(0,_.jsx)(`span`,{className:`legendSwatch cool`,"aria-hidden":`true`}),`under 70%`]}),(0,_.jsxs)(`span`,{className:`legendItem`,children:[(0,_.jsx)(`span`,{className:`legendSwatch warm`,"aria-hidden":`true`}),`70–89%`]}),(0,_.jsxs)(`span`,{className:`legendItem`,children:[(0,_.jsx)(`span`,{className:`legendSwatch hot`,"aria-hidden":`true`}),`90%+`]}),(0,_.jsxs)(`span`,{className:`legendItem`,children:[(0,_.jsx)(`span`,{className:`legendSwatch conflict`,"aria-hidden":`true`}),`refused while placing`]}),(0,_.jsxs)(`span`,{className:`legendItem`,children:[(0,_.jsx)(r,{icon:i,size:`xsm`,color:`inherit`}),`step-free required`]})]})]})]})})})}export{V as default};