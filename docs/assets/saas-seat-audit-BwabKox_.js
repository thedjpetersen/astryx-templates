import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-DoyyW0Xq.js";import{t as i}from"./Icon-Cbr2QWU5.js";import{t as a}from"./archive-COGDTU_v.js";import{t as o}from"./arrow-right-CkxqNtnn.js";import{t as s}from"./calendar-clock-Dd9MpIIF.js";import{t as c}from"./download-CI9oh67M.js";import{t as l}from"./lock-Dx8eqSSK.js";import{t as u}from"./minus-CtvAoOD3.js";import{t as d}from"./plus-BKhKp8kL.js";import{t as f}from"./trending-down-BOvqerSa.js";import{t as p}from"./users-DfoCx9NM.js";import{i as m,s as h,w as g}from"./index-BwFrdgVW.js";import{t as _}from"./Tooltip-XDRm9Z-w.js";import{t as v}from"./HStack-2WTukjNp.js";import{t as y}from"./VStack-B8U-hI0Y.js";import{t as b}from"./StackItem-Ca9P7L2I.js";import{n as x,t as ee}from"./LayoutContent-CCL91W7X.js";import{t as S}from"./LayoutHeader-Cy2mWoMf.js";import{t as te}from"./LayoutPanel-Cqp-l8I4.js";import{t as C}from"./Heading-CEfXHtdE.js";import{t as w}from"./Badge-0Tj9omHc.js";import{t as ne}from"./useMediaQuery-BvG63aw7.js";import{t as T}from"./Button-DdhUiDLb.js";import{t as E}from"./Divider-BHIBe6GQ.js";import{t as re}from"./TextInput-Bs7bG3J7.js";import{t as D}from"./IconButton-CxkvCg4-.js";var O=e(t(),1),k=n(),A=`light-dark(#8A6400, #F2C24B)`,j=`light-dark(#FFFFFF, #241A00)`,M=`light-dark(rgba(138, 100, 0, 0.10), rgba(242, 194, 75, 0.14))`,N=`light-dark(#C13515, #FF9A80)`,P=`light-dark(rgba(193, 53, 21, 0.10), rgba(255, 154, 128, 0.14))`,F=`light-dark(#0A66C2, #6CB4F5)`,I=`
.tpl-saas-seat-audit {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
}
.tpl-saas-seat-audit .ssa-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.tpl-saas-seat-audit .ssa-btn:disabled { cursor: default; }
.tpl-saas-seat-audit button:focus-visible,
.tpl-saas-seat-audit input:focus-visible {
  outline: 2px solid ${A};
  outline-offset: 2px;
}
.tpl-saas-seat-audit .ssa-num { font-variant-numeric: tabular-nums; }
.tpl-saas-seat-audit .ssa-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ---- header --------------------------------------------------------- */
.tpl-saas-seat-audit .ssa-header-row {
  min-height: 56px;
  padding: var(--spacing-2) var(--spacing-4);
  box-sizing: border-box;
}
.tpl-saas-seat-audit .ssa-brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${A};
  color: ${j};
  flex-shrink: 0;
}
.tpl-saas-seat-audit .ssa-renewal-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  border: var(--border-width) solid ${A};
  color: ${A};
  background: ${M};
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

/* ---- content column --------------------------------------------------- */
.tpl-saas-seat-audit .ssa-main {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
/* On the stacked (<=980px) layout the whole main column scrolls instead
   of the table alone, so the tray section is reachable. */
.tpl-saas-seat-audit .ssa-main.ssa-main-stacked { overflow-y: auto; }
.tpl-saas-seat-audit .ssa-main.ssa-main-stacked .ssa-table-scroll {
  flex: none;
  overflow-y: visible;
  min-height: auto;
}
.tpl-saas-seat-audit .ssa-band {
  flex-shrink: 0;
  display: flex;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
  align-items: stretch;
}
.tpl-saas-seat-audit .ssa-kpis {
  display: grid;
  grid-template-columns: repeat(2, minmax(148px, 1fr));
  gap: 12px;
  flex-shrink: 0;
}
.tpl-saas-seat-audit .ssa-kpi {
  height: 88px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: 0 14px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  background: var(--color-background-surface);
  min-width: 0;
}
.tpl-saas-seat-audit .ssa-kpi-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.tpl-saas-seat-audit .ssa-kpi-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.tpl-saas-seat-audit .ssa-kpi-sub {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---- histogram --------------------------------------------------------- */
.tpl-saas-seat-audit .ssa-histo {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  background: var(--color-background-surface);
  box-sizing: border-box;
}
.tpl-saas-seat-audit .ssa-histo-scroll {
  display: flex;
  gap: 8px;
  align-items: stretch;
  overflow-x: auto;
  min-width: 0;
}
.tpl-saas-seat-audit .ssa-bucket {
  width: 96px;
  min-width: 72px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
  border-radius: 8px;
  padding: 6px 6px 8px;
  border: var(--border-width) solid transparent;
}
.tpl-saas-seat-audit .ssa-bucket[aria-pressed='true'] {
  border-color: ${A};
  background: ${M};
}
@media (hover: hover) {
  .tpl-saas-seat-audit .ssa-bucket:hover { background: var(--color-background-muted); }
  .tpl-saas-seat-audit .ssa-bucket[aria-pressed='true']:hover { background: ${M}; }
}
.tpl-saas-seat-audit .ssa-bucket-plot {
  height: 112px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.tpl-saas-seat-audit .ssa-bucket-bar {
  width: 70%;
  border-radius: 4px 4px 0 0;
  background: var(--color-background-muted);
  border: var(--border-width) solid var(--color-border);
  border-bottom: none;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
/* Flagged share of the bucket — an accent block at the base of the bar so a
   bucket reads "N seats, M flagged" at a glance. */
.tpl-saas-seat-audit .ssa-bucket-flagged { width: 100%; background: ${A}; }
.tpl-saas-seat-audit .ssa-bucket-count {
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}
.tpl-saas-seat-audit .ssa-bucket-range {
  font-size: 10.5px;
  font-weight: 600;
  text-align: center;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.tpl-saas-seat-audit .ssa-bucket-flag-note {
  font-size: 10px;
  text-align: center;
  color: ${A};
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  min-height: 12px;
}

/* ---- filter row --------------------------------------------------------- */
.tpl-saas-seat-audit .ssa-filter-row {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: var(--spacing-2) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
}
.tpl-saas-seat-audit .ssa-search { width: 240px; max-width: 100%; }
.tpl-saas-seat-audit .ssa-seg {
  display: inline-flex;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  overflow: hidden;
  flex-shrink: 0;
}
.tpl-saas-seat-audit .ssa-seg button {
  min-height: 28px;
  padding: 2px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.tpl-saas-seat-audit .ssa-seg button[aria-pressed='true'] {
  background: ${A};
  color: ${j};
}
.tpl-saas-seat-audit .ssa-bucket-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px 3px 10px;
  border-radius: 999px;
  border: var(--border-width) solid ${A};
  background: ${M};
  color: ${A};
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.tpl-saas-seat-audit .ssa-bucket-pill .ssa-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  color: inherit;
}

/* ---- drift table --------------------------------------------------------- */
.tpl-saas-seat-audit .ssa-table-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.tpl-saas-seat-audit .ssa-table { width: 100%; border-collapse: collapse; }
.tpl-saas-seat-audit .ssa-table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  height: 32px;
  box-sizing: border-box;
  padding: 0 10px;
  background: var(--color-background-body);
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  text-align: left;
  white-space: nowrap;
}
.tpl-saas-seat-audit .ssa-table thead th.ssa-col-right { text-align: right; }
.tpl-saas-seat-audit .ssa-table tbody td {
  height: 48px;
  box-sizing: border-box;
  padding: 4px 10px;
  border-bottom: var(--border-width) solid var(--color-border);
  vertical-align: middle;
  font-size: 12.5px;
  color: var(--color-text-primary);
}
.tpl-saas-seat-audit tbody tr.ssa-row-batched { background: ${M}; }
@media (hover: hover) {
  .tpl-saas-seat-audit .ssa-table tbody tr:hover { background: var(--color-background-muted); }
  .tpl-saas-seat-audit tbody tr.ssa-row-batched:hover { background: ${M}; }
}
.tpl-saas-seat-audit .ssa-seat-name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 190px;
}
.tpl-saas-seat-audit .ssa-seat-email {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 190px;
}
.tpl-saas-seat-audit .ssa-tier-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.tpl-saas-seat-audit .ssa-tier-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.tpl-saas-seat-audit .ssa-action-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}
.tpl-saas-seat-audit .ssa-action-reclaim { color: ${N}; background: ${P}; }
.tpl-saas-seat-audit .ssa-action-downgrade { color: ${F}; background: light-dark(rgba(10, 102, 194, 0.10), rgba(108, 180, 245, 0.14)); }
.tpl-saas-seat-audit .ssa-drift-note {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 210px;
  display: block;
  margin-top: 2px;
}
.tpl-saas-seat-audit .ssa-cell-num {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.tpl-saas-seat-audit .ssa-savings-val { font-weight: 700; }
.tpl-saas-seat-audit .ssa-spark {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 22px;
  width: 108px;
}
.tpl-saas-seat-audit .ssa-spark span {
  flex: 1;
  min-height: 2px;
  border-radius: 1px;
  background: var(--color-border);
}
.tpl-saas-seat-audit .ssa-spark span.ssa-spark-on { background: ${A}; }
/* Add/remove batch control — 40px hit target inside a 48px row. */
.tpl-saas-seat-audit .ssa-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  font-family: inherit;
  cursor: pointer;
}
.tpl-saas-seat-audit .ssa-add-btn[aria-pressed='true'] {
  border-color: ${A};
  background: ${A};
  color: ${j};
}
.tpl-saas-seat-audit .ssa-lock-reason {
  display: block;
  margin-top: 2px;
  font-size: 10.5px;
  font-weight: 600;
  color: ${N};
  white-space: normal;
  max-width: 210px;
}
.tpl-saas-seat-audit .ssa-empty { padding: var(--spacing-8) var(--spacing-4); text-align: center; }

/* ---- reclaim tray --------------------------------------------------------- */
.tpl-saas-seat-audit .ssa-tray {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.tpl-saas-seat-audit .ssa-tray-stacked {
  border-top: var(--border-width) solid var(--color-border);
  height: auto;
}
.tpl-saas-seat-audit .ssa-tray-header {
  flex-shrink: 0;
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
}
.tpl-saas-seat-audit .ssa-tray-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-3) var(--spacing-4) var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.tpl-saas-seat-audit .ssa-tray-stacked .ssa-tray-scroll { overflow-y: visible; }
.tpl-saas-seat-audit .ssa-savings-counter {
  border: var(--border-width) solid ${A};
  border-radius: var(--radius-container);
  background: ${M};
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.tpl-saas-seat-audit .ssa-savings-big {
  font-size: 26px;
  font-weight: 800;
  color: ${A};
  font-variant-numeric: tabular-nums;
  line-height: 1.15;
}
.tpl-saas-seat-audit .ssa-savings-meter {
  height: 6px;
  border-radius: 3px;
  background: var(--color-background-muted);
  border: var(--border-width) solid var(--color-border);
  overflow: hidden;
  margin-top: 6px;
}
.tpl-saas-seat-audit .ssa-savings-meter > span {
  display: block;
  height: 100%;
  background: ${A};
}
/* Tier bars — "Today" vs "After plan"; both bars keep the 240-seat scale so
   executed reclaims read as a hatched gap at the end of the after bar. */
.tpl-saas-seat-audit .ssa-tierbar-row { display: flex; flex-direction: column; gap: 3px; }
.tpl-saas-seat-audit .ssa-tierbar-label {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.tpl-saas-seat-audit .ssa-tierbar {
  display: flex;
  height: 16px;
  border-radius: 5px;
  overflow: hidden;
  border: var(--border-width) solid var(--color-border);
}
.tpl-saas-seat-audit .ssa-tierbar > span { display: block; height: 100%; }
.tpl-saas-seat-audit .ssa-tierseg-ent { background: ${A}; }
.tpl-saas-seat-audit .ssa-tierseg-pro { background: ${F}; }
.tpl-saas-seat-audit .ssa-tierseg-viewer { background: var(--color-background-muted); }
.tpl-saas-seat-audit .ssa-tierseg-gap {
  background: repeating-linear-gradient(-45deg, transparent 0 4px, ${P} 4px 8px);
}
.tpl-saas-seat-audit .ssa-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  font-size: 10.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.tpl-saas-seat-audit .ssa-legend i {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 2px;
  margin-right: 4px;
  border: var(--border-width) solid var(--color-border);
  vertical-align: -1px;
  font-style: normal;
}
.tpl-saas-seat-audit .ssa-tray-group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.tpl-saas-seat-audit .ssa-tray-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 56px;
  box-sizing: border-box;
  padding: 6px 8px 6px 12px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  background: var(--color-background-surface);
}
.tpl-saas-seat-audit .ssa-tray-item-main { min-width: 0; flex: 1; }
.tpl-saas-seat-audit .ssa-tray-item-name {
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-saas-seat-audit .ssa-tray-item-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
}
.tpl-saas-seat-audit .ssa-export-entry {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 11.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.tpl-saas-seat-audit .ssa-export-check {
  display: inline-flex;
  color: light-dark(#137333, #57D48F);
  flex-shrink: 0;
  margin-top: 1px;
}

/* ---- responsive subtraction (fires in fullscreen + the 390px embed) ---- */
@media (max-width: 640px) {
  .tpl-saas-seat-audit .ssa-band { flex-direction: column; }
  .tpl-saas-seat-audit .ssa-kpis { grid-template-columns: repeat(2, 1fr); }
  .tpl-saas-seat-audit .ssa-col-lastactive,
  .tpl-saas-seat-audit .ssa-col-activity { display: none; }
  .tpl-saas-seat-audit .ssa-seat-name,
  .tpl-saas-seat-audit .ssa-seat-email { max-width: 130px; }
}
@media (prefers-reduced-motion: no-preference) {
  .tpl-saas-seat-audit .ssa-tierbar > span { transition: width 240ms ease; }
  .tpl-saas-seat-audit .ssa-bucket,
  .tpl-saas-seat-audit .ssa-add-btn {
    transition: background-color 140ms ease, border-color 140ms ease;
  }
}
`,L={enterprise:{label:`Enterprise`,annual:948,monthly:79,dot:A},pro:{label:`Pro`,annual:540,monthly:45,dot:F},viewer:{label:`Viewer`,annual:144,monthly:12,dot:`var(--color-text-secondary)`}},R={enterprise:64,pro:132,viewer:44},z=240,B=[{id:`0`,range:`0 days`,total:9},{id:`1-5`,range:`1–5`,total:16},{id:`6-15`,range:`6–15`,total:24},{id:`16-30`,range:`16–30`,total:40},{id:`31-60`,range:`31–60`,total:63},{id:`61-90`,range:`61–90`,total:88}],V=[{id:`s01`,name:`Priya Natarajan`,email:`priya.natarajan@lumenary.com`,dept:`Finance`,tier:`enterprise`,action:`reclaim`,savings:948,lastActive:`Feb 19`,daysActive90:0,bucket:`0`,weeks:[0,0,0,0,0,0,0,0,0,0,0,0],driftNote:`No sign-in for 141 days; owns 0 dashboards`},{id:`s02`,name:`Miguel Duarte`,email:`miguel.duarte@lumenary.com`,dept:`Sales Ops`,tier:`pro`,action:`reclaim`,savings:540,lastActive:`Mar 02`,daysActive90:0,bucket:`0`,weeks:[0,0,0,0,0,0,0,0,0,0,0,0],driftNote:`Team migrated to the Salesforce connector in Q1`},{id:`s03`,name:`Hannah Beck`,email:`hannah.beck@lumenary.com`,dept:`Marketing`,tier:`enterprise`,action:`reclaim`,savings:948,lastActive:`Jan 27`,daysActive90:0,bucket:`0`,weeks:[0,0,0,0,0,0,0,0,0,0,0,0],driftNote:`On extended leave; seat idle since January`},{id:`s04`,name:`Aleksandrina Konstantinopolous-Whitfield`,email:`aleksandrina.konstantinopolous-whitfield@lumenary.com`,dept:`Customer Success`,tier:`pro`,action:`reclaim`,savings:540,lastActive:`Mar 11`,daysActive90:0,bucket:`0`,weeks:[0,0,0,0,0,0,0,0,0,0,0,0],driftNote:`Duplicate of her Datawell SSO alias seat`},{id:`s05`,name:`Tom Alvarez`,email:`tom.alvarez@ext.lumenary.com`,dept:`Engineering`,tier:`enterprise`,action:`reclaim`,savings:948,lastActive:`Dec 12`,daysActive90:0,bucket:`0`,weeks:[0,0,0,0,0,0,0,0,0,0,0,0],driftNote:`Contractor offboarded via HRIS Apr 1 — SSO already suspended`},{id:`s06`,name:`Jonah Kim`,email:`jonah.kim@lumenary.com`,dept:`Legal`,tier:`pro`,action:`reclaim`,savings:540,lastActive:`Feb 06`,daysActive90:0,bucket:`0`,weeks:[0,0,0,0,0,0,0,0,0,0,0,0],driftNote:`Requested access for one audit; never returned`},{id:`s07`,name:`Renee Okafor`,email:`renee.okafor@lumenary.com`,dept:`Support`,tier:`pro`,action:`reclaim`,savings:540,lastActive:`Mar 22`,daysActive90:0,bucket:`0`,weeks:[0,0,0,0,0,0,0,0,0,0,0,0],driftNote:`Moved to Tier-1 queue; uses the embedded views only`},{id:`s08`,name:`David Lindgren`,email:`david.lindgren@lumenary.com`,dept:`IT`,tier:`enterprise`,action:`reclaim`,savings:948,lastActive:`Jan 15`,daysActive90:0,bucket:`0`,weeks:[0,0,0,0,0,0,0,0,0,0,0,0],driftNote:`Break-glass admin seat superseded by svc-datawell-admin`},{id:`s09`,name:`svc-boardroom (shared display)`,email:`svc-boardroom@lumenary.com`,dept:`Facilities`,tier:`pro`,action:`reclaim`,savings:540,lastActive:`—`,daysActive90:0,bucket:`0`,weeks:[0,0,0,0,0,0,0,0,0,0,0,0],driftNote:`Boardroom wallboard login; zero interactive sessions`,lockReason:`Locked: reserved under Datawell SOW #DW-7 through renewal`},{id:`s10`,name:`Grace Whitcombe`,email:`grace.whitcombe@lumenary.com`,dept:`Product`,tier:`enterprise`,toTier:`pro`,action:`downgrade`,savings:408,lastActive:`Jul 02`,daysActive90:4,bucket:`1-5`,weeks:[0,1,0,0,1,0,0,1,0,0,0,1],driftNote:`Views dashboards only — no Enterprise modeling features used`},{id:`s11`,name:`Omar Haddad`,email:`omar.haddad@lumenary.com`,dept:`Design`,tier:`enterprise`,toTier:`pro`,action:`downgrade`,savings:408,lastActive:`Jun 24`,daysActive90:3,bucket:`1-5`,weeks:[1,0,0,0,1,0,0,0,0,1,0,0],driftNote:`Last touched the SQL runner in the previous contract year`},{id:`s12`,name:`Lena Vogel`,email:`lena.vogel@lumenary.com`,dept:`Finance`,tier:`enterprise`,toTier:`pro`,action:`downgrade`,savings:408,lastActive:`Jul 01`,daysActive90:5,bucket:`1-5`,weeks:[0,1,1,0,0,1,0,0,1,0,1,0],driftNote:`Month-end close checks only; Pro covers scheduled exports`},{id:`s13`,name:`Sam Torres`,email:`sam.torres@lumenary.com`,dept:`Sales`,tier:`pro`,toTier:`viewer`,action:`downgrade`,savings:396,lastActive:`Jun 28`,daysActive90:8,bucket:`6-15`,weeks:[1,1,0,1,0,1,1,0,1,0,1,1],driftNote:`Opens shared pipeline dashboards; never edits`},{id:`s14`,name:`Ivy Chen`,email:`ivy.chen@lumenary.com`,dept:`Support`,tier:`pro`,toTier:`viewer`,action:`downgrade`,savings:396,lastActive:`Jul 06`,daysActive90:11,bucket:`6-15`,weeks:[1,2,1,0,1,2,0,1,1,0,1,1],driftNote:`Reads the CSAT board daily; Viewer covers read-only`},{id:`s15`,name:`Noel Baptiste`,email:`noel.baptiste@lumenary.com`,dept:`Ops`,tier:`pro`,toTier:`viewer`,action:`downgrade`,savings:396,lastActive:`Jul 03`,daysActive90:9,bucket:`6-15`,weeks:[0,1,1,1,0,1,2,0,1,0,1,1],driftNote:`Subscribed digests only — zero ad-hoc queries in 90d`},{id:`s16`,name:`Ruth Adeyemi`,email:`ruth.adeyemi@lumenary.com`,dept:`HR`,tier:`pro`,toTier:`viewer`,action:`downgrade`,savings:396,lastActive:`Jul 07`,daysActive90:14,bucket:`6-15`,weeks:[2,1,1,2,0,1,1,2,1,1,1,1],driftNote:`Headcount board reader; edit rights unused since March`}],H=new Map(V.map(e=>[e.id,e])),U=V.reduce((e,t)=>e+t.savings,0),W=V.filter(e=>e.lockReason===void 0).reduce((e,t)=>e+t.savings,0),G={};for(let e of V)G[e.bucket]=(G[e.bucket]??0)+1;var K=Math.max(...B.map(e=>e.total));function q(e){return`$${e.toLocaleString(`en-US`)}`}function ie(){return(0,k.jsxs)(`svg`,{width:`18`,height:`18`,viewBox:`0 0 18 18`,"aria-hidden":`true`,focusable:`false`,children:[(0,k.jsx)(`rect`,{x:`1`,y:`1`,width:`7`,height:`7`,rx:`2`,fill:`currentColor`}),(0,k.jsx)(`rect`,{x:`10.75`,y:`1.75`,width:`5.5`,height:`5.5`,rx:`1.6`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeDasharray:`2.4 1.8`}),(0,k.jsx)(`rect`,{x:`1`,y:`10`,width:`7`,height:`7`,rx:`2`,fill:`currentColor`}),(0,k.jsx)(`rect`,{x:`10`,y:`10`,width:`7`,height:`7`,rx:`2`,fill:`currentColor`})]})}function J({icon:e,label:t,value:n,sub:r}){return(0,k.jsxs)(`div`,{className:`ssa-kpi`,children:[(0,k.jsxs)(`span`,{className:`ssa-kpi-label`,children:[(0,k.jsx)(i,{icon:e,size:`xsm`,color:`inherit`}),t]}),(0,k.jsx)(`span`,{className:`ssa-kpi-value`,children:n}),(0,k.jsx)(`span`,{className:`ssa-kpi-sub`,children:r})]})}function ae({bucket:e,isActive:t,onToggle:n}){let r=G[e.id]??0,i=Math.max(10,Math.round(e.total/K*100)),a=e.total>0?Math.round(r/e.total*100):0;return(0,k.jsxs)(`button`,{type:`button`,className:`ssa-btn ssa-bucket`,"aria-pressed":t,onClick:()=>n(e.id),"aria-label":`${e.range} active days — ${e.total} seats, ${r} flagged. ${t?`Clear this filter.`:`Filter the table to this band.`}`,children:[(0,k.jsx)(`span`,{className:`ssa-bucket-plot`,children:(0,k.jsx)(`span`,{className:`ssa-bucket-bar`,style:{height:`${i}%`},children:(0,k.jsx)(`span`,{className:`ssa-bucket-flagged`,style:{height:`${a}%`}})})}),(0,k.jsx)(`span`,{className:`ssa-bucket-count`,children:e.total}),(0,k.jsx)(`span`,{className:`ssa-bucket-range`,children:e.range}),(0,k.jsx)(`span`,{className:`ssa-bucket-flag-note`,children:r>0?`${r} flagged`:`\xA0`})]})}function oe({tier:e}){let t=L[e];return(0,k.jsxs)(`span`,{className:`ssa-tier-chip`,children:[(0,k.jsx)(`span`,{className:`ssa-tier-dot`,style:{background:t.dot}}),t.label]})}function se({seat:e}){return(0,k.jsx)(`span`,{className:`ssa-spark`,role:`img`,"aria-label":`${e.daysActive90} active days in the last 90`,children:e.weeks.map((e,t)=>(0,k.jsx)(`span`,{className:e>0?`ssa-spark-on`:void 0,style:{height:`${Math.max(2,Math.round(e/7*22))}px`}},t))})}function ce({seat:e}){if(e.action===`reclaim`)return(0,k.jsxs)(`span`,{className:`ssa-action-tag ssa-action-reclaim`,children:[(0,k.jsx)(i,{icon:a,size:`xsm`,color:`inherit`}),`Reclaim`]});let t=e.toTier===void 0?``:L[e.toTier].label;return(0,k.jsxs)(`span`,{className:`ssa-action-tag ssa-action-downgrade`,children:[(0,k.jsx)(i,{icon:o,size:`xsm`,color:`inherit`}),`→ ${t}`]})}function Y({label:e,counts:t,reclaimedGap:n}){let r=t.enterprise+t.pro+t.viewer;return(0,k.jsxs)(`div`,{className:`ssa-tierbar-row`,children:[(0,k.jsxs)(`span`,{className:`ssa-tierbar-label`,children:[(0,k.jsx)(`span`,{children:e}),(0,k.jsxs)(`span`,{children:[r,` seats`]})]}),(0,k.jsxs)(`div`,{className:`ssa-tierbar`,role:`img`,"aria-label":`${e}: ${t.enterprise} Enterprise, ${t.pro} Pro, ${t.viewer} Viewer${n>0?`, ${n} reclaimed`:``}`,children:[(0,k.jsx)(`span`,{className:`ssa-tierseg-ent`,style:{width:`${t.enterprise/z*100}%`}}),(0,k.jsx)(`span`,{className:`ssa-tierseg-pro`,style:{width:`${t.pro/z*100}%`}}),(0,k.jsx)(`span`,{className:`ssa-tierseg-viewer`,style:{width:`${t.viewer/z*100}%`}}),n>0&&(0,k.jsx)(`span`,{className:`ssa-tierseg-gap`,style:{width:`${n/z*100}%`}})]})]})}function le({isStacked:e,batchedSeats:t,batchedTotal:n,afterCounts:o,reclaimedGap:s,exportLog:l,onRemove:u,onClear:d,onExport:p}){let m=t.filter(e=>e.action===`reclaim`),h=t.filter(e=>e.action===`downgrade`),_=W>0?Math.round(n/W*100):0;return(0,k.jsxs)(`div`,{className:`ssa-tray${e?` ssa-tray-stacked`:``}`,children:[(0,k.jsx)(`div`,{className:`ssa-tray-header`,children:(0,k.jsxs)(v,{gap:2,vAlign:`center`,children:[(0,k.jsx)(b,{size:`fill`,children:(0,k.jsxs)(y,{gap:0,children:[(0,k.jsx)(C,{level:2,children:`Reclaim plan`}),(0,k.jsxs)(r,{type:`supporting`,color:`secondary`,hasTabularNumbers:!0,children:[t.length,` of `,V.length,` flagged seats batched`]})]})}),(0,k.jsx)(T,{label:`Clear`,variant:`ghost`,size:`sm`,isDisabled:t.length===0,onClick:d})]})}),(0,k.jsxs)(`div`,{className:`ssa-tray-scroll`,children:[(0,k.jsxs)(`div`,{className:`ssa-savings-counter`,children:[(0,k.jsx)(r,{type:`supporting`,color:`secondary`,children:`Projected renewal savings`}),(0,k.jsxs)(`span`,{className:`ssa-savings-big`,children:[q(n),`/yr`]}),(0,k.jsxs)(r,{type:`supporting`,color:`secondary`,hasTabularNumbers:!0,children:[`of `,q(W),` addressable · `,q(U),` identified`]}),(0,k.jsx)(`div`,{className:`ssa-savings-meter`,"aria-hidden":`true`,children:(0,k.jsx)(`span`,{style:{width:`${_}%`}})})]}),(0,k.jsxs)(y,{gap:2,children:[(0,k.jsx)(Y,{label:`Today`,counts:R,reclaimedGap:0}),(0,k.jsx)(Y,{label:`After plan`,counts:o,reclaimedGap:s}),(0,k.jsxs)(`div`,{className:`ssa-legend`,children:[(0,k.jsxs)(`span`,{children:[(0,k.jsx)(`i`,{style:{background:A}}),` Enterprise `,q(L.enterprise.annual),`/yr`]}),(0,k.jsxs)(`span`,{children:[(0,k.jsx)(`i`,{style:{background:F}}),` Pro `,q(L.pro.annual),`/yr`]}),(0,k.jsxs)(`span`,{children:[(0,k.jsx)(`i`,{style:{background:`var(--color-background-muted)`}}),` Viewer`,` `,q(L.viewer.annual),`/yr`]}),(0,k.jsxs)(`span`,{children:[(0,k.jsx)(`i`,{style:{background:`repeating-linear-gradient(-45deg, transparent 0 3px, ${P} 3px 6px)`}}),` `,`Reclaimed`]})]})]}),(0,k.jsx)(E,{}),t.length===0?(0,k.jsx)(r,{type:`supporting`,color:`secondary`,children:`No seats batched yet. Use “Batch” on a flagged row — savings and the after-plan bar update as you build.`}):(0,k.jsxs)(y,{gap:3,children:[m.length>0&&(0,k.jsxs)(y,{gap:1,children:[(0,k.jsxs)(`span`,{className:`ssa-tray-group-title`,children:[(0,k.jsx)(i,{icon:a,size:`xsm`,color:`inherit`}),`Reclaim · `,m.length]}),m.map(e=>(0,k.jsx)(X,{seat:e,onRemove:u},e.id))]}),h.length>0&&(0,k.jsxs)(y,{gap:1,children:[(0,k.jsxs)(`span`,{className:`ssa-tray-group-title`,children:[(0,k.jsx)(i,{icon:f,size:`xsm`,color:`inherit`}),`Downgrade · `,h.length]}),h.map(e=>(0,k.jsx)(X,{seat:e,onRemove:u},e.id))]})]}),(0,k.jsx)(T,{label:`Export reclaim plan (${t.length})`,variant:`primary`,size:`sm`,icon:(0,k.jsx)(i,{icon:c,size:`sm`,color:`inherit`}),isDisabled:t.length===0,onClick:p}),l.length>0&&(0,k.jsxs)(y,{gap:1,children:[(0,k.jsx)(`span`,{className:`ssa-tray-group-title`,children:`Export log`}),l.map(e=>(0,k.jsxs)(`span`,{className:`ssa-export-entry`,children:[(0,k.jsx)(`span`,{className:`ssa-export-check`,children:(0,k.jsx)(i,{icon:g,size:`xsm`,color:`inherit`})}),e]},e))]})]})]})}function X({seat:e,onRemove:t}){let n=e.action===`reclaim`?`${L[e.tier].label} · ${q(e.savings)}/yr back`:`${L[e.tier].label} → ${e.toTier===void 0?``:L[e.toTier].label} · ${q(e.savings)}/yr back`;return(0,k.jsxs)(`div`,{className:`ssa-tray-item`,children:[(0,k.jsxs)(`div`,{className:`ssa-tray-item-main`,children:[(0,k.jsx)(`div`,{className:`ssa-tray-item-name`,children:e.name}),(0,k.jsx)(`div`,{className:`ssa-tray-item-sub`,children:n})]}),(0,k.jsx)(D,{label:`Remove ${e.name} from the batch`,tooltip:`Remove from batch`,variant:`ghost`,size:`sm`,icon:(0,k.jsx)(i,{icon:u,size:`sm`}),onClick:()=>t(e.id)})]})}function Z(){let e=ne(`(max-width: 980px)`),[t,n]=(0,O.useState)(()=>new Set([`s03`,`s07`,`s11`])),[o,c]=(0,O.useState)(null),[u,T]=(0,O.useState)(`all`),[E,D]=(0,O.useState)(``),[A,j]=(0,O.useState)(null),[M,N]=(0,O.useState)([]),[P,F]=(0,O.useState)(``),L=(0,O.useMemo)(()=>V.filter(e=>t.has(e.id)),[t]),z=L.reduce((e,t)=>e+t.savings,0),{afterCounts:W,reclaimedGap:K}=(0,O.useMemo)(()=>{let e={...R},t=0;for(let n of L)n.action===`reclaim`?(--e[n.tier],t+=1):n.toTier!==void 0&&(--e[n.tier],e[n.toTier]+=1);return{afterCounts:e,reclaimedGap:t}},[L]),Y=(0,O.useMemo)(()=>{let e=E.trim().toLowerCase();return V.filter(t=>!(o!==null&&t.bucket!==o||u!==`all`&&t.action!==u||e.length>0&&!t.name.toLowerCase().includes(e)&&!t.email.toLowerCase().includes(e)&&!t.dept.toLowerCase().includes(e)))},[o,u,E]),X=o===null?void 0:B.find(e=>e.id===o),Z=X===void 0?0:X.total-(G[X.id]??0),Q=e=>{let t=H.get(e);if(t!==void 0){if(t.lockReason!==void 0){j(e),F(`${t.name} cannot be batched. ${t.lockReason}.`);return}j(null),n(n=>{let r=new Set(n);return r.has(e)?(r.delete(e),F(`${t.name} removed from the batch. Projected savings ${q(z-t.savings)} per year.`)):(r.add(e),F(`${t.name} added to the batch. Projected savings ${q(z+t.savings)} per year.`)),r})}},ue=e=>{c(t=>t===e?null:e)},de=()=>{let e=L.filter(e=>e.action===`reclaim`).length,t=L.length-e,n=`Draft v${M.length+1} — ${e} reclaims · ${t} downgrades · ${q(z)}/yr`;N(e=>[n,...e]),F(`Reclaim plan exported. ${n}.`)},fe=(0,k.jsx)(S,{children:(0,k.jsx)(`div`,{className:`ssa-header-row`,children:(0,k.jsxs)(v,{gap:3,vAlign:`center`,wrap:`wrap`,children:[(0,k.jsx)(`span`,{className:`ssa-brand-mark`,children:(0,k.jsx)(ie,{})}),(0,k.jsx)(b,{size:`fill`,style:{minWidth:0},children:(0,k.jsxs)(y,{gap:0,children:[(0,k.jsxs)(v,{gap:2,vAlign:`center`,wrap:`wrap`,children:[(0,k.jsx)(C,{level:1,children:`Seatsmith`}),(0,k.jsx)(w,{label:`Datawell Analytics`,variant:`neutral`}),(0,k.jsx)(w,{label:`Contract #DW-2024-118`,variant:`neutral`})]}),(0,k.jsx)(r,{type:`supporting`,color:`secondary`,hasTabularNumbers:!0,children:`Lumenary Inc workspace · 240 assigned seats · audit refreshed Jul 10, 06:00`})]})}),(0,k.jsxs)(`span`,{className:`ssa-renewal-badge`,children:[(0,k.jsx)(i,{icon:s,size:`xsm`,color:`inherit`}),`Renews Sep 30 · 82 days`]})]})})}),pe=(0,k.jsxs)(`div`,{className:`ssa-band`,children:[(0,k.jsxs)(`div`,{className:`ssa-kpis`,children:[(0,k.jsx)(J,{icon:p,label:`Licensed seats`,value:`240`,sub:`64 Ent · 132 Pro · 44 Viewer`}),(0,k.jsx)(J,{icon:g,label:`Active last 30d`,value:`187`,sub:`78% of assigned seats`}),(0,k.jsx)(J,{icon:a,label:`Flagged seats`,value:String(V.length),sub:`${q(U)}/yr identified`}),(0,k.jsx)(J,{icon:f,label:`Batched savings`,value:`${q(z)}/yr`,sub:`${L.length} seats in the plan`})]}),(0,k.jsxs)(`div`,{className:`ssa-histo`,children:[(0,k.jsxs)(v,{gap:2,vAlign:`center`,children:[(0,k.jsx)(b,{size:`fill`,children:(0,k.jsx)(r,{type:`label`,children:`Seat utilization — active days, last 90`})}),(0,k.jsx)(r,{type:`supporting`,color:`secondary`,hasTabularNumbers:!0,children:`240 seats · click a band to filter`})]}),(0,k.jsx)(`div`,{className:`ssa-histo-scroll`,children:B.map(e=>(0,k.jsx)(ae,{bucket:e,isActive:o===e.id,onToggle:ue},e.id))})]})]}),me=(0,k.jsxs)(`div`,{className:`ssa-filter-row`,children:[(0,k.jsx)(`div`,{className:`ssa-search`,children:(0,k.jsx)(re,{label:`Search flagged seats`,isLabelHidden:!0,size:`sm`,width:`100%`,placeholder:`Search name, email, or team…`,startIcon:(0,k.jsx)(i,{icon:h,size:`sm`}),value:E,onChange:D})}),(0,k.jsx)(`div`,{className:`ssa-seg`,role:`group`,"aria-label":`Filter by recommended action`,children:[{id:`all`,label:`All · ${V.length}`},{id:`reclaim`,label:`Reclaim · ${V.filter(e=>e.action===`reclaim`).length}`},{id:`downgrade`,label:`Downgrade · ${V.filter(e=>e.action===`downgrade`).length}`}].map(e=>(0,k.jsx)(`button`,{type:`button`,"aria-pressed":u===e.id,onClick:()=>T(e.id),children:e.label},e.id))}),X!==void 0&&(0,k.jsxs)(`span`,{className:`ssa-bucket-pill`,children:[X.range,` active days · `,X.total,` seats`,(0,k.jsx)(`button`,{type:`button`,className:`ssa-btn`,"aria-label":`Clear the ${X.range} activity filter`,onClick:()=>c(null),children:(0,k.jsx)(i,{icon:m,size:`xsm`,color:`inherit`})})]}),(0,k.jsx)(b,{size:`fill`}),(0,k.jsxs)(r,{type:`supporting`,color:`secondary`,hasTabularNumbers:!0,children:[Y.length,` of `,V.length,` flagged shown`]})]}),he=(0,k.jsx)(`div`,{className:`ssa-table-scroll`,children:Y.length===0?(0,k.jsx)(`div`,{className:`ssa-empty`,children:(0,k.jsxs)(y,{gap:1,children:[(0,k.jsx)(r,{type:`label`,children:X!==void 0&&Z>0&&E.trim().length===0?`No drift in the ${X.range} band`:`No flagged seats match`}),(0,k.jsx)(r,{type:`supporting`,color:`secondary`,hasTabularNumbers:!0,children:X!==void 0&&Z>0&&E.trim().length===0?`${Z} seats in this band are sized correctly — nothing to reclaim.`:`Adjust the search or clear the filters to see the full flagged set.`})]})}):(0,k.jsxs)(`table`,{className:`ssa-table`,children:[(0,k.jsx)(`caption`,{className:`ssa-visually-hidden`,children:`Entitlement drift — flagged seats with recommended reclaim or downgrade actions`}),(0,k.jsx)(`thead`,{children:(0,k.jsxs)(`tr`,{children:[(0,k.jsx)(`th`,{scope:`col`,children:`Seat`}),(0,k.jsx)(`th`,{scope:`col`,children:`Tier`}),(0,k.jsx)(`th`,{scope:`col`,className:`ssa-col-lastactive`,children:`Last active`}),(0,k.jsx)(`th`,{scope:`col`,className:`ssa-col-activity`,children:`12-week activity`}),(0,k.jsx)(`th`,{scope:`col`,children:`Recommendation`}),(0,k.jsx)(`th`,{scope:`col`,className:`ssa-col-right`,children:`$/yr back`}),(0,k.jsx)(`th`,{scope:`col`,className:`ssa-col-right`,children:`Batch`})]})}),(0,k.jsx)(`tbody`,{children:Y.map(e=>{let n=t.has(e.id),r=e.lockReason!==void 0;return(0,k.jsxs)(`tr`,{className:n?`ssa-row-batched`:void 0,children:[(0,k.jsxs)(`td`,{children:[(0,k.jsx)(`div`,{className:`ssa-seat-name`,children:e.name}),(0,k.jsx)(`div`,{className:`ssa-seat-email`,children:e.email})]}),(0,k.jsx)(`td`,{children:(0,k.jsx)(oe,{tier:e.tier})}),(0,k.jsxs)(`td`,{className:`ssa-col-lastactive`,children:[(0,k.jsx)(`span`,{className:`ssa-num`,children:e.lastActive}),(0,k.jsx)(`span`,{className:`ssa-drift-note`,children:e.dept})]}),(0,k.jsx)(`td`,{className:`ssa-col-activity`,children:(0,k.jsx)(se,{seat:e})}),(0,k.jsxs)(`td`,{children:[(0,k.jsx)(ce,{seat:e}),(0,k.jsx)(`span`,{className:`ssa-drift-note`,title:e.driftNote,children:e.driftNote})]}),(0,k.jsx)(`td`,{className:`ssa-cell-num`,children:(0,k.jsx)(`span`,{className:`ssa-savings-val`,children:q(e.savings)})}),(0,k.jsx)(`td`,{className:`ssa-cell-num`,children:r?(0,k.jsxs)(k.Fragment,{children:[(0,k.jsx)(_,{content:e.lockReason??``,children:(0,k.jsxs)(`button`,{type:`button`,className:`ssa-add-btn`,"aria-pressed":!1,"aria-label":`${e.name} is contract-locked and cannot be batched`,onClick:()=>Q(e.id),children:[(0,k.jsx)(i,{icon:l,size:`xsm`,color:`inherit`}),`Locked`]})}),A===e.id&&(0,k.jsx)(`span`,{className:`ssa-lock-reason`,role:`status`,children:e.lockReason})]}):(0,k.jsxs)(`button`,{type:`button`,className:`ssa-add-btn`,"aria-pressed":n,"aria-label":n?`Remove ${e.name} from the reclaim batch`:`Add ${e.name} to the reclaim batch — ${q(e.savings)} per year back`,onClick:()=>Q(e.id),children:[(0,k.jsx)(i,{icon:n?g:d,size:`xsm`,color:`inherit`}),n?`Batched`:`Batch`]})})]},e.id)})})]})}),$=(0,k.jsx)(le,{isStacked:e,batchedSeats:L,batchedTotal:z,afterCounts:W,reclaimedGap:K,exportLog:M,onRemove:Q,onClear:()=>{n(new Set),F(`Batch cleared. Projected savings $0 per year.`)},onExport:de});return(0,k.jsxs)(`div`,{className:`tpl-saas-seat-audit`,children:[(0,k.jsx)(`style`,{children:I}),(0,k.jsx)(x,{height:`fill`,header:fe,content:(0,k.jsx)(ee,{padding:0,children:(0,k.jsxs)(`div`,{className:`ssa-main${e?` ssa-main-stacked`:``}`,children:[(0,k.jsx)(`div`,{"aria-live":`polite`,className:`ssa-visually-hidden`,children:P}),pe,me,he,e&&$]})}),end:e?void 0:(0,k.jsx)(te,{width:336,padding:0,hasDivider:!0,label:`Reclaim plan tray`,children:$})})]})}export{Z as default};