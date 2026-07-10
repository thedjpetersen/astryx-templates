import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Icon-CbuLE4XT.js";import{t as i}from"./clipboard-check-B3vgI9W0.js";import{t as a}from"./eraser-CEsijDgW.js";import{t as o}from"./move-IS2jgGDn.js";import{A as s,w as c}from"./index-CfmeJ-SX.js";import{n as l,t as u}from"./LayoutContent-CCL91W7X.js";import{t as d}from"./LayoutHeader-Cy2mWoMf.js";import{t as f}from"./LayoutPanel-Cqp-l8I4.js";import{t as ee}from"./useMediaQuery-BvG63aw7.js";import{t as p}from"./useToast-DotJwVwZ.js";var m=s(`package-x`,[[`path`,{d:`M12 22V12`,key:`d0xqtd`}],[`path`,{d:`m16.5 14.5 5 5`,key:`ozpm51`}],[`path`,{d:`m16.5 19.5 5-5`,key:`syf6b9`}],[`path`,{d:`M21 10.5V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l.13-.074`,key:`isw6gs`}],[`path`,{d:`M3.29 7 12 12l8.71-5`,key:`19ckod`}],[`path`,{d:`m7.5 4.27 8.997 5.148`,key:`9yrvtv`}]]),h=e(t(),1),g=n(),_=`light-dark(#A61E3C, #FF8FA8)`,v=`light-dark(#FFFFFF, #2B060F)`,y=`light-dark(rgba(166, 30, 60, 0.10), rgba(255, 143, 168, 0.14))`,b=`light-dark(#15803D, #4ADE80)`,x=`light-dark(rgba(21, 128, 61, 0.12), rgba(74, 222, 128, 0.16))`,S=`light-dark(#B42318, #F97066)`,C=`light-dark(rgba(180, 35, 24, 0.10), rgba(249, 112, 102, 0.14))`,w=`light-dark(#B45309, #FDB022)`,T=`light-dark(rgba(180, 83, 9, 0.12), rgba(253, 176, 34, 0.14))`,E={cola:{wash:`light-dark(rgba(122, 40, 24, 0.16), rgba(214, 108, 84, 0.22))`,ink:`light-dark(#7A2818, #D66C54)`,label:`Cola`},citrus:{wash:`light-dark(rgba(58, 122, 28, 0.16), rgba(148, 210, 106, 0.22))`,ink:`light-dark(#3A7A1C, #94D26A)`,label:`Citrus`},craft:{wash:`light-dark(rgba(146, 100, 16, 0.16), rgba(226, 178, 92, 0.22))`,ink:`light-dark(#926410, #E2B25C)`,label:`Craft soda`},water:{wash:`light-dark(rgba(22, 96, 154, 0.14), rgba(112, 184, 240, 0.20))`,ink:`light-dark(#16609A, #70B8F0)`,label:`Water`},energy:{wash:`light-dark(rgba(104, 52, 158, 0.14), rgba(184, 140, 236, 0.20))`,ink:`light-dark(#68349E, #B88CEC)`,label:`Energy`},iso:{wash:`light-dark(rgba(186, 74, 16, 0.14), rgba(244, 148, 96, 0.20))`,ink:`light-dark(#BA4A10, #F49460)`,label:`Isotonic`}},D=`
.tpl-retail-planogram-audit {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.tpl-retail-planogram-audit *,
.tpl-retail-planogram-audit *::before,
.tpl-retail-planogram-audit *::after {
  box-sizing: border-box;
}
.tpl-retail-planogram-audit button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  margin: 0;
  padding: 0;
  text-align: inherit;
  cursor: pointer;
}
.tpl-retail-planogram-audit button:focus-visible,
.tpl-retail-planogram-audit [tabindex]:focus-visible {
  outline: 2px solid ${_};
  outline-offset: 2px;
}
.tpl-retail-planogram-audit .pa-num {
  font-variant-numeric: tabular-nums;
}
.tpl-retail-planogram-audit .pa-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ---- header ---- */
.tpl-retail-planogram-audit .pa-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  min-width: 0;
  width: 100%;
}
.tpl-retail-planogram-audit .pa-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: ${_};
  color: ${v};
  flex: none;
}
.tpl-retail-planogram-audit .pa-header-id {
  min-width: 0;
  flex: 1 1 auto;
}
.tpl-retail-planogram-audit .pa-header-title {
  font-size: 15px;
  font-weight: 650;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-retail-planogram-audit .pa-header-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-retail-planogram-audit .pa-header-chips {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex: none;
}
.tpl-retail-planogram-audit .pa-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: var(--border-width, 1px) solid var(--color-border);
  background: var(--color-background-card);
  font-size: 12px;
  white-space: nowrap;
}
.tpl-retail-planogram-audit .pa-chip b {
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}
.tpl-retail-planogram-audit .pa-chip-label {
  color: var(--color-text-secondary);
}
@media (max-width: 480px) {
  .tpl-retail-planogram-audit .pa-chip-label,
  .tpl-retail-planogram-audit .pa-header-sub .pa-city {
    display: none;
  }
}

/* ---- main column ---- */
.tpl-retail-planogram-audit .pa-scroll {
  height: 100%;
  min-height: 0;
  overflow-y: auto;
}
.tpl-retail-planogram-audit .pa-main {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  min-width: 0;
}
.tpl-retail-planogram-audit .pa-section-title {
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.tpl-retail-planogram-audit .pa-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  min-height: 24px;
}

/* ---- bay switcher (44px row) ---- */
.tpl-retail-planogram-audit .pa-bays {
  display: flex;
  gap: var(--spacing-2);
  min-height: 44px;
}
.tpl-retail-planogram-audit .pa-bay-tab {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  padding: 6px 12px;
  border-radius: 10px;
  border: var(--border-width, 1px) solid var(--color-border);
  background: var(--color-background-card);
  min-height: 44px;
}
.tpl-retail-planogram-audit .pa-bay-tab[aria-pressed='true'] {
  border-color: ${_};
  background: ${y};
}
.tpl-retail-planogram-audit .pa-bay-tab-name {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-retail-planogram-audit .pa-bay-tab-meta {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.tpl-retail-planogram-audit .pa-bay-tab[aria-pressed='true'] .pa-bay-tab-name {
  color: ${_};
}

/* ---- shelf schematic wall ----
   Shelf band = 104px: 78px product zone sitting on an 8px shelf rail with
   an 18px price rail below. Position tiles are real buttons whose flex
   grows by planogram units (each shelf sums to 24 units). */
.tpl-retail-planogram-audit .pa-wall {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: var(--spacing-3);
  border: var(--border-width, 1px) solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background-card);
}
.tpl-retail-planogram-audit .pa-shelf {
  display: flex;
  flex-direction: column;
}
.tpl-retail-planogram-audit .pa-shelf-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--color-text-secondary);
  min-height: 20px;
}
.tpl-retail-planogram-audit .pa-shelf-label .pa-shelf-done {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: ${b};
  font-weight: 600;
}
.tpl-retail-planogram-audit .pa-shelf-band {
  display: flex;
  align-items: stretch;
  gap: 3px;
  height: 78px;
  border-bottom: 8px solid var(--color-border);
  border-radius: 2px 2px 0 0;
}
.tpl-retail-planogram-audit .pa-price-rail {
  display: flex;
  gap: 3px;
  height: 18px;
  background: var(--color-background-muted);
  border-radius: 0 0 3px 3px;
}
.tpl-retail-planogram-audit .pa-price-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  overflow: hidden;
  white-space: nowrap;
  min-width: 0;
}
@media (max-width: 760px) {
  .tpl-retail-planogram-audit .pa-price-rail {
    display: none;
  }
}

/* Position tile — width via flex-grow = planogram units. */
.tpl-retail-planogram-audit .pa-tile {
  position: relative;
  flex: var(--pa-units) 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
  padding: 4px 3px 3px;
  border-radius: 6px 6px 0 0;
  border: var(--border-width, 1px) solid transparent;
  border-bottom: none;
  background: var(--pa-wash);
  transition: background-color 150ms ease, border-color 150ms ease;
}
.tpl-retail-planogram-audit .pa-tile[aria-pressed='true'] {
  border-color: ${_};
  box-shadow: inset 0 0 0 1px ${_};
}
.tpl-retail-planogram-audit .pa-tile-sku {
  max-width: 100%;
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-retail-planogram-audit .pa-tile-glyphs {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  min-height: 40px;
}
/* Verdict skins — the same verdict map paints checklist rows. */
.tpl-retail-planogram-audit .pa-tile.is-ok {
  background: ${x};
}
.tpl-retail-planogram-audit .pa-tile.is-missing {
  background: repeating-linear-gradient(
    135deg,
    ${C} 0 6px,
    transparent 6px 12px
  );
  border-color: ${S};
  border-bottom: none;
}
.tpl-retail-planogram-audit .pa-tile.is-missing .pa-tile-glyphs {
  opacity: 0.25;
}
.tpl-retail-planogram-audit .pa-tile.is-misplaced {
  background: ${T};
  border-style: dashed;
  border-color: ${w};
  border-bottom: none;
}
.tpl-retail-planogram-audit .pa-tile-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
}
.tpl-retail-planogram-audit .pa-tile-badge.is-ok {
  background: ${b};
  color: var(--color-background-card);
}
.tpl-retail-planogram-audit .pa-tile-badge.is-missing {
  background: ${S};
  color: var(--color-background-card);
}
.tpl-retail-planogram-audit .pa-tile-badge.is-misplaced {
  background: ${w};
  color: var(--color-background-card);
}

/* Legend row under the wall. */
.tpl-retail-planogram-audit .pa-legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2) var(--spacing-3);
  padding-top: 2px;
}
.tpl-retail-planogram-audit .pa-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--color-text-secondary);
}
.tpl-retail-planogram-audit .pa-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex: none;
}

/* ---- facing detail strip (min 148px workbench) ---- */
.tpl-retail-planogram-audit .pa-detail {
  display: flex;
  gap: var(--spacing-3);
  min-height: 148px;
  padding: var(--spacing-3);
  border: var(--border-width, 1px) solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background-card);
}
.tpl-retail-planogram-audit .pa-detail-glyph {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  flex: none;
  border-radius: 10px;
  background: var(--pa-wash);
}
.tpl-retail-planogram-audit .pa-detail-body {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
.tpl-retail-planogram-audit .pa-detail-name {
  font-size: 14px;
  font-weight: 650;
  line-height: 1.3;
}
.tpl-retail-planogram-audit .pa-detail-meta {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--spacing-2) var(--spacing-3);
}
@media (max-width: 760px) {
  .tpl-retail-planogram-audit .pa-detail {
    flex-direction: column;
  }
  .tpl-retail-planogram-audit .pa-detail-glyph {
    width: 100%;
    min-height: 64px;
  }
  .tpl-retail-planogram-audit .pa-detail-meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.tpl-retail-planogram-audit .pa-meta-label {
  font-size: 10px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.tpl-retail-planogram-audit .pa-meta-value {
  font-size: 12.5px;
  font-weight: 550;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Verdict buttons — 40x40 minimum everywhere they appear. */
.tpl-retail-planogram-audit .pa-verdicts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  align-items: center;
}
.tpl-retail-planogram-audit .pa-verdict-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 8px;
  border: var(--border-width, 1px) solid var(--color-border);
  background: var(--color-background-card);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text-secondary);
  transition: background-color 120ms ease, border-color 120ms ease;
}
.tpl-retail-planogram-audit .pa-verdict-btn.v-ok[aria-pressed='true'] {
  color: ${b};
  border-color: ${b};
  background: ${x};
}
.tpl-retail-planogram-audit .pa-verdict-btn.v-missing[aria-pressed='true'] {
  color: ${S};
  border-color: ${S};
  background: ${C};
}
.tpl-retail-planogram-audit .pa-verdict-btn.v-misplaced[aria-pressed='true'] {
  color: ${w};
  border-color: ${w};
  background: ${T};
}
.tpl-retail-planogram-audit .pa-verdict-clear {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 10px;
  border-radius: 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.tpl-retail-planogram-audit .pa-verdict-clear:hover {
  background: var(--color-background-muted);
}

/* ---- district rollup (36px store rows) ---- */
.tpl-retail-planogram-audit .pa-district {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--spacing-3);
  border: var(--border-width, 1px) solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background-card);
}
.tpl-retail-planogram-audit .pa-store-row {
  display: grid;
  grid-template-columns: 148px minmax(0, 1fr) 44px;
  align-items: center;
  gap: var(--spacing-3);
  min-height: 36px;
}
@media (max-width: 480px) {
  .tpl-retail-planogram-audit .pa-store-row {
    grid-template-columns: 104px minmax(0, 1fr) 44px;
  }
}
.tpl-retail-planogram-audit .pa-store-name {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-retail-planogram-audit .pa-store-row.is-live .pa-store-name {
  font-weight: 650;
  color: ${_};
}
.tpl-retail-planogram-audit .pa-store-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--color-background-muted);
  overflow: hidden;
}
.tpl-retail-planogram-audit .pa-store-fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 999px;
  background: var(--color-text-secondary);
  transition: width 200ms ease;
}
.tpl-retail-planogram-audit .pa-store-row.is-live .pa-store-fill {
  background: ${_};
}
.tpl-retail-planogram-audit .pa-store-pct {
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-align: right;
}
.tpl-retail-planogram-audit .pa-district-foot {
  padding-top: var(--spacing-2);
  font-size: 11px;
  color: var(--color-text-secondary);
}

/* ---- end panel: checklist + follow-ups ---- */
.tpl-retail-planogram-audit .pa-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.tpl-retail-planogram-audit .pa-panel-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 var(--spacing-3) var(--spacing-3);
}
.tpl-retail-planogram-audit .pa-panel-head {
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-2);
}
/* Shelf group header — 32px, sticky inside the panel scroll. */
.tpl-retail-planogram-audit .pa-group-head {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  min-height: 32px;
  background: var(--color-background-body);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.tpl-retail-planogram-audit .pa-group-count {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}
.tpl-retail-planogram-audit .pa-group-count.is-done {
  color: ${b};
}
/* Checklist row — 56px: select button + three 40x40 verdict squares. */
.tpl-retail-planogram-audit .pa-check-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 56px;
  border-bottom: var(--border-width, 1px) solid var(--color-border);
}
.tpl-retail-planogram-audit .pa-check-row:last-child {
  border-bottom: none;
}
.tpl-retail-planogram-audit .pa-check-main {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 6px 4px;
  border-radius: 8px;
  min-height: 48px;
  justify-content: center;
}
.tpl-retail-planogram-audit .pa-check-main[aria-pressed='true'] {
  background: ${y};
}
.tpl-retail-planogram-audit .pa-check-name {
  font-size: 12.5px;
  font-weight: 550;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-retail-planogram-audit .pa-check-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-retail-planogram-audit .pa-check-actions {
  display: flex;
  gap: 4px;
  flex: none;
}
.tpl-retail-planogram-audit .pa-square {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: var(--border-width, 1px) solid var(--color-border);
  color: var(--color-text-secondary);
  background: var(--color-background-card);
}
.tpl-retail-planogram-audit .pa-square.v-ok[aria-pressed='true'] {
  color: ${b};
  border-color: ${b};
  background: ${x};
}
.tpl-retail-planogram-audit .pa-square.v-missing[aria-pressed='true'] {
  color: ${S};
  border-color: ${S};
  background: ${C};
}
.tpl-retail-planogram-audit .pa-square.v-misplaced[aria-pressed='true'] {
  color: ${w};
  border-color: ${w};
  background: ${T};
}

/* Follow-ups lane. */
.tpl-retail-planogram-audit .pa-task {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  padding: var(--spacing-2) 0;
  border-bottom: var(--border-width, 1px) solid var(--color-border);
}
.tpl-retail-planogram-audit .pa-task:last-child {
  border-bottom: none;
}
.tpl-retail-planogram-audit .pa-task-icon {
  flex: none;
  display: inline-flex;
  margin-top: 1px;
}
.tpl-retail-planogram-audit .pa-task-icon.is-missing { color: ${S}; }
.tpl-retail-planogram-audit .pa-task-icon.is-misplaced { color: ${w}; }
.tpl-retail-planogram-audit .pa-task-text {
  font-size: 12px;
  line-height: 1.35;
  min-width: 0;
}
.tpl-retail-planogram-audit .pa-task-text b {
  font-weight: 650;
}
.tpl-retail-planogram-audit .pa-empty {
  padding: var(--spacing-3) 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* Reduced motion: collapse the only transitions (color/width). */
@media (prefers-reduced-motion: reduce) {
  .tpl-retail-planogram-audit .pa-tile,
  .tpl-retail-planogram-audit .pa-verdict-btn,
  .tpl-retail-planogram-audit .pa-store-fill {
    transition: none;
  }
}
`,O=[{id:`bay-12`,name:`Carbonated Soft Drinks`,aisle:`Aisle 4 · Bay 12`,planogramRev:`POG CSD-4B rev 2026.06`},{id:`bay-13`,name:`Hydration & Energy`,aisle:`Aisle 4 · Bay 13`,planogramRev:`POG HYD-2A rev 2026.05`}];function k(e,t,n,r,i,a,o,s,c,l,u){return{id:`p-${e}-s${t}-${n}`,bay:e,shelf:t,pos:n,units:r,facings:i,sku:a,name:o,size:s,price:c,family:l,glyph:u}}var A=[k(`bay-12`,1,1,5,5,`CSD-1104`,`Cascara Cola Classic`,`20 oz`,`$2.49`,`cola`,`bottle`),k(`bay-12`,1,2,5,5,`CSD-1105`,`Cascara Cola Zero`,`20 oz`,`$2.49`,`cola`,`bottle`),k(`bay-12`,1,3,4,4,`CSD-1131`,`Brightleaf Citrus Twist`,`20 oz`,`$2.29`,`citrus`,`bottle`),k(`bay-12`,1,4,5,5,`CSD-1160`,`Pemberly Ginger Ale`,`20 oz`,`$2.59`,`craft`,`bottle`),k(`bay-12`,1,5,5,5,`CSD-1178`,`Nimbus Sparkling Lime`,`20 oz`,`$1.99`,`water`,`bottle`),k(`bay-12`,2,1,4,2,`CSD-2210`,`Cascara Cola Classic 12-pk`,`12 oz ×12`,`$6.99`,`cola`,`multipack`),k(`bay-12`,2,2,4,2,`CSD-2211`,`Cascara Cola Zero 12-pk`,`12 oz ×12`,`$6.99`,`cola`,`multipack`),k(`bay-12`,2,3,4,2,`CSD-2240`,`Brightleaf Citrus 12-pk`,`12 oz ×12`,`$6.79`,`citrus`,`multipack`),k(`bay-12`,2,4,4,2,`CSD-2262`,`Pemberly Ginger Ale 12-pk`,`12 oz ×12`,`$7.49`,`craft`,`multipack`),k(`bay-12`,2,5,4,2,`CSD-2280`,`Nimbus Sparkling Variety 12-pk`,`12 oz ×12`,`$5.99`,`water`,`multipack`),k(`bay-12`,2,6,4,2,`CSD-2291`,`Foxglove Root Beer 12-pk`,`12 oz ×12`,`$7.29`,`craft`,`multipack`),k(`bay-12`,3,1,4,2,`CSD-3310`,`Cascara Cola Classic`,`2 L`,`$2.79`,`cola`,`twoLiter`),k(`bay-12`,3,2,4,2,`CSD-3311`,`Cascara Cola Zero`,`2 L`,`$2.79`,`cola`,`twoLiter`),k(`bay-12`,3,3,4,2,`CSD-3340`,`Brightleaf Citrus Twist`,`2 L`,`$2.59`,`citrus`,`twoLiter`),k(`bay-12`,3,4,4,2,`CSD-3355`,`Foxglove Root Beer`,`2 L`,`$2.89`,`craft`,`twoLiter`),k(`bay-12`,3,5,4,2,`CSD-3372`,`Valu-Pop Cola`,`2 L`,`$1.19`,`cola`,`twoLiter`),k(`bay-12`,3,6,4,2,`CSD-3380`,`Nimbus Tonic`,`2 L`,`$2.19`,`water`,`twoLiter`),k(`bay-12`,4,1,4,2,`CSD-4410`,`Cascara Cola Classic 24-pk case`,`12 oz ×24`,`$12.99`,`cola`,`caseBox`),k(`bay-12`,4,2,3,1,`CSD-4411`,`Cascara Cola Zero 24-pk case`,`12 oz ×24`,`$12.99`,`cola`,`caseBox`),k(`bay-12`,4,3,3,1,`CSD-4440`,`Brightleaf Citrus 24-pk case`,`12 oz ×24`,`$12.49`,`citrus`,`caseBox`),k(`bay-12`,4,4,4,2,`CSD-4462`,`Pemberly Small-Batch Blood Orange Ginger Ale Collector 24`,`12 oz ×24`,`$16.99`,`craft`,`caseBox`),k(`bay-12`,4,5,3,1,`CSD-4471`,`Valu-Pop Variety 24-pk case`,`12 oz ×24`,`$8.99`,`cola`,`caseBox`),k(`bay-12`,4,6,4,2,`CSD-4480`,`Nimbus Sparkling 24-pk case`,`12 oz ×24`,`$10.99`,`water`,`caseBox`),k(`bay-12`,4,7,3,1,`CSD-4491`,`Foxglove Root Beer 24-pk case`,`12 oz ×24`,`$13.99`,`craft`,`caseBox`),k(`bay-13`,1,1,5,5,`HYD-1502`,`Voltcharge Original`,`16 oz`,`$3.29`,`energy`,`can`),k(`bay-13`,1,2,5,5,`HYD-1503`,`Voltcharge Zero Sugar`,`16 oz`,`$3.29`,`energy`,`can`),k(`bay-13`,1,3,4,4,`HYD-1521`,`Ionix Berry Surge`,`16 oz`,`$2.99`,`energy`,`can`),k(`bay-13`,1,4,5,5,`HYD-1522`,`Ionix Tropical Rush`,`16 oz`,`$2.99`,`energy`,`can`),k(`bay-13`,1,5,5,5,`HYD-1540`,`Kestrel Yerba Mate`,`15.5 oz`,`$3.49`,`craft`,`can`),k(`bay-13`,2,1,4,2,`HYD-2610`,`Voltcharge Original 4-pk`,`16 oz ×4`,`$9.99`,`energy`,`multipack`),k(`bay-13`,2,2,4,2,`HYD-2611`,`Ionix Berry 4-pk`,`16 oz ×4`,`$8.99`,`energy`,`multipack`),k(`bay-13`,2,3,4,4,`HYD-2630`,`Aquaflow Electrolyte Citrus`,`28 oz`,`$2.19`,`iso`,`bottle`),k(`bay-13`,2,4,4,4,`HYD-2631`,`Aquaflow Electrolyte Zero`,`28 oz`,`$2.19`,`iso`,`bottle`),k(`bay-13`,2,5,4,4,`HYD-2650`,`Peakline Isotonic Orange`,`28 oz`,`$1.89`,`iso`,`bottle`),k(`bay-13`,2,6,4,4,`HYD-2651`,`Peakline Isotonic Glacier`,`28 oz`,`$1.89`,`iso`,`bottle`),k(`bay-13`,3,1,5,5,`HYD-3710`,`Nimbus Spring Water`,`1 L`,`$1.49`,`water`,`bottle`),k(`bay-13`,3,2,5,5,`HYD-3711`,`Nimbus Spring Sport Cap`,`700 mL`,`$1.29`,`water`,`bottle`),k(`bay-13`,3,3,4,4,`HYD-3730`,`Clearbrook Alkaline pH9`,`1 L`,`$2.29`,`water`,`bottle`),k(`bay-13`,3,4,5,5,`HYD-3731`,`Clearbrook Alkaline pH9`,`1.5 L`,`$2.99`,`water`,`bottle`),k(`bay-13`,3,5,5,5,`HYD-3750`,`Aquaflow Powder Sticks 10-ct`,`10 ct`,`$5.49`,`iso`,`pouch`),k(`bay-13`,4,1,4,2,`HYD-4810`,`Nimbus Spring 24-pk case`,`500 mL ×24`,`$4.99`,`water`,`caseBox`),k(`bay-13`,4,2,4,2,`HYD-4811`,`Clearbrook Alkaline 12-pk case`,`1 L ×12`,`$18.99`,`water`,`caseBox`),k(`bay-13`,4,3,4,2,`HYD-4830`,`Aquaflow Electrolyte 12-pk case`,`28 oz ×12`,`$21.99`,`iso`,`caseBox`),k(`bay-13`,4,4,4,2,`HYD-4831`,`Peakline Isotonic 12-pk case`,`28 oz ×12`,`$17.99`,`iso`,`caseBox`),k(`bay-13`,4,5,4,2,`HYD-4850`,`Voltcharge 12-pk case`,`16 oz ×12`,`$26.99`,`energy`,`caseBox`),k(`bay-13`,4,6,4,2,`HYD-4851`,`Ionix Variety 12-pk case`,`16 oz ×12`,`$23.99`,`energy`,`caseBox`)],j=[{id:`s-208`,name:`#208 Maple Grove`,pct:96},{id:`s-221`,name:`#221 Larkspur`,pct:91},{id:`s-219`,name:`#219 Prairie Ridge`,pct:88},{id:`s-233`,name:`#233 Fenwick`,pct:83},{id:`s-227`,name:`#227 Beacon Hill`,pct:74}],M=`Thu Jul 9 · 10:42 AM`,N=`D. Okafor (district 7)`,P={ok:{label:`Compliant`,short:`OK`,className:`is-ok`},missing:{label:`Missing / OOS`,short:`OOS`,className:`is-missing`},misplaced:{label:`Misplaced`,short:`MISPL`,className:`is-misplaced`}};function F(e,t){return A.filter(n=>n.bay===e&&n.shelf===t)}function I(e){return A.find(t=>t.id===e)??A[0]}var L={1:`Shelf 1 · eye level`,2:`Shelf 2`,3:`Shelf 3`,4:`Shelf 4 · base deck`};function R({glyph:e,ink:t,height:n=36}){let r={fill:t,fillOpacity:.55,stroke:t,strokeWidth:1.2};switch(e){case`can`:return(0,g.jsxs)(`svg`,{width:n*.42,height:n,viewBox:`0 0 10 24`,"aria-hidden":!0,children:[(0,g.jsx)(`rect`,{x:`1`,y:`3`,width:`8`,height:`20`,rx:`1.6`,...r}),(0,g.jsx)(`line`,{x1:`1.4`,y1:`5.5`,x2:`8.6`,y2:`5.5`,stroke:t,strokeWidth:`0.8`}),(0,g.jsx)(`ellipse`,{cx:`5`,cy:`3`,rx:`4`,ry:`1.4`,fill:t})]});case`bottle`:return(0,g.jsxs)(`svg`,{width:n*.4,height:n,viewBox:`0 0 10 26`,"aria-hidden":!0,children:[(0,g.jsx)(`rect`,{x:`3.4`,y:`0.5`,width:`3.2`,height:`2.4`,rx:`0.6`,fill:t}),(0,g.jsx)(`path`,{d:`M3.4 3 L2 7.5 L2 24 Q2 25.4 3.4 25.4 L6.6 25.4 Q8 25.4 8 24 L8 7.5 L6.6 3 Z`,...r})]});case`twoLiter`:return(0,g.jsxs)(`svg`,{width:n*.5,height:n,viewBox:`0 0 13 26`,"aria-hidden":!0,children:[(0,g.jsx)(`rect`,{x:`5`,y:`0.5`,width:`3`,height:`2.6`,rx:`0.6`,fill:t}),(0,g.jsx)(`path`,{d:`M5 3.4 L3 8 L3 23.4 Q3 25.4 5 25.4 L8 25.4 Q10 25.4 10 23.4 L10 8 L8 3.4 Z`,...r}),(0,g.jsx)(`line`,{x1:`3.4`,y1:`12`,x2:`9.6`,y2:`12`,stroke:t,strokeWidth:`0.8`}),(0,g.jsx)(`line`,{x1:`3.4`,y1:`18`,x2:`9.6`,y2:`18`,stroke:t,strokeWidth:`0.8`})]});case`multipack`:return(0,g.jsxs)(`svg`,{width:n*1.05,height:n*.72,viewBox:`0 0 30 20`,"aria-hidden":!0,children:[(0,g.jsx)(`rect`,{x:`1`,y:`4`,width:`28`,height:`15`,rx:`1.6`,...r}),(0,g.jsx)(`path`,{d:`M1 8 L8 1.5 L22 1.5 L29 8`,fill:`none`,stroke:t,strokeWidth:`1.2`}),(0,g.jsx)(`circle`,{cx:`8`,cy:`12`,r:`2`,fill:t}),(0,g.jsx)(`circle`,{cx:`15`,cy:`12`,r:`2`,fill:t}),(0,g.jsx)(`circle`,{cx:`22`,cy:`12`,r:`2`,fill:t})]});case`caseBox`:return(0,g.jsxs)(`svg`,{width:n*1.15,height:n*.66,viewBox:`0 0 32 18`,"aria-hidden":!0,children:[(0,g.jsx)(`rect`,{x:`1`,y:`1`,width:`30`,height:`16`,rx:`1.4`,...r}),(0,g.jsx)(`line`,{x1:`1`,y1:`6`,x2:`31`,y2:`6`,stroke:t,strokeWidth:`1`}),(0,g.jsx)(`rect`,{x:`11`,y:`9`,width:`10`,height:`5`,rx:`1`,fill:t})]});case`pouch`:return(0,g.jsxs)(`svg`,{width:n*.62,height:n,viewBox:`0 0 16 26`,"aria-hidden":!0,children:[(0,g.jsx)(`path`,{d:`M3 2 L13 2 L14.5 24 Q14.5 25.4 13 25.4 L3 25.4 Q1.5 25.4 1.5 24 Z`,...r}),(0,g.jsx)(`line`,{x1:`3`,y1:`5`,x2:`13.4`,y2:`5`,stroke:t,strokeWidth:`1.4`})]})}}function z(){return(0,g.jsxs)(`svg`,{width:`18`,height:`18`,viewBox:`0 0 18 18`,"aria-hidden":!0,children:[(0,g.jsx)(`line`,{x1:`2`,y1:`4`,x2:`16`,y2:`4`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`}),(0,g.jsx)(`line`,{x1:`2`,y1:`9`,x2:`9`,y2:`9`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`}),(0,g.jsx)(`line`,{x1:`2`,y1:`14`,x2:`7`,y2:`14`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`}),(0,g.jsx)(`path`,{d:`M10.5 12.5 L13 15 L17 9.5`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`})]})}var B={"p-bay-12-s1-1":`ok`,"p-bay-12-s1-2":`ok`,"p-bay-12-s1-3":`ok`,"p-bay-12-s1-4":`misplaced`,"p-bay-12-s1-5":`ok`,"p-bay-12-s2-3":`missing`},V=j.reduce((e,t)=>e+t.pct,0);function H(){let e=p(),t=ee(`(max-width: 760px)`),[n,s]=(0,h.useState)(`bay-12`),[_,v]=(0,h.useState)(`p-bay-12-s2-3`),[y,b]=(0,h.useState)(B),[x,S]=(0,h.useState)(``),C=Object.keys(y).length,w=Object.values(y).filter(e=>e===`ok`).length,T=C===0?null:Math.round(w/C*100),k=Math.round(T===null?V/j.length:(V+T)/(j.length+1)),H=(0,h.useMemo)(()=>A.filter(e=>{let t=y[e.id];return t===`missing`||t===`misplaced`}),[y]),U=O.find(e=>e.id===n)??O[0],W=I(_),G=y[_]??null,K=e=>A.filter(t=>t.bay===e&&y[t.id]!==void 0).length,q=e=>A.filter(t=>t.bay===e).length,J=e=>{let t=I(e);v(e),t.bay!==n&&s(t.bay)},Y=(t,n)=>{let r=I(t),i={...y};n===null?delete i[t]:i[t]=n;let a=Object.keys(i).length,o=Object.values(i).filter(e=>e===`ok`).length,s=a===0?null:Math.round(o/a*100);if(b(i),v(t),n===null){e({body:`${r.sku} verdict cleared`,isAutoHide:!0}),S(`${r.sku} verdict cleared.`);return}let c=n===`missing`?` — replenish follow-up added`:n===`misplaced`?` — reset follow-up added`:``;e({body:`${r.sku} marked ${P[n].label} · compliance ${s??0}%${c}`,isAutoHide:!0}),S(`${r.sku} marked ${P[n].label}. Audited ${a} of ${A.length}, compliance ${s??0} percent.`)},X=(e,t)=>{Y(e,y[e]===t?null:t)},te=e=>{let t=F(n,e),i=t.filter(e=>y[e.id]!==void 0).length,a=i===t.length;return(0,g.jsxs)(`div`,{className:`pa-shelf`,children:[(0,g.jsxs)(`div`,{className:`pa-shelf-label`,children:[(0,g.jsx)(`span`,{children:L[e]}),(0,g.jsxs)(`span`,{className:`pa-num`,children:[i,`/`,t.length]}),a&&(0,g.jsxs)(`span`,{className:`pa-shelf-done`,children:[(0,g.jsx)(r,{icon:c,size:`xsm`,color:`inherit`}),`audited`]})]}),(0,g.jsx)(`div`,{className:`pa-shelf-band`,role:`group`,"aria-label":L[e],children:t.map(e=>{let t=y[e.id],n=E[e.family],i=Math.min(e.facings,4);return(0,g.jsxs)(`button`,{type:`button`,className:`pa-tile${t===void 0?``:` ${P[t].className}`}`,style:{"--pa-units":e.units,"--pa-wash":n.wash},"aria-pressed":e.id===_,"aria-label":`${e.sku} ${e.name}, shelf ${e.shelf} position ${e.pos}${t===void 0?`, not audited`:`, marked ${P[t].label}`}`,onClick:()=>J(e.id),children:[t!==void 0&&(0,g.jsx)(`span`,{className:`pa-tile-badge ${P[t].className}`,"aria-hidden":!0,children:(0,g.jsx)(r,{icon:t===`ok`?c:t===`missing`?m:o,size:`xsm`,color:`inherit`})}),(0,g.jsx)(`span`,{className:`pa-tile-glyphs`,"aria-hidden":!0,children:Array.from({length:i},(t,r)=>(0,g.jsx)(R,{glyph:e.glyph,ink:n.ink,height:e.glyph===`multipack`||e.glyph===`caseBox`?30:36},r))}),(0,g.jsx)(`span`,{className:`pa-tile-sku`,children:e.sku})]},e.id)})}),(0,g.jsx)(`div`,{className:`pa-price-rail`,"aria-hidden":!0,children:t.map(e=>(0,g.jsx)(`span`,{className:`pa-price-cell`,style:{flex:`${e.units} 1 0`},children:e.price},e.id))})]},`${n}-s${e}`)},ne=(0,g.jsxs)(`section`,{"aria-label":`Shelf schematic — ${U.name}`,children:[(0,g.jsxs)(`div`,{className:`pa-section-head`,children:[(0,g.jsx)(`span`,{className:`pa-section-title`,children:`Shelf schematic`}),(0,g.jsx)(`span`,{className:`pa-bay-tab-meta`,children:U.planogramRev})]}),(0,g.jsxs)(`div`,{className:`pa-wall`,children:[[1,2,3,4].map(e=>te(e)),(0,g.jsx)(`div`,{className:`pa-legend`,"aria-hidden":!0,children:Object.keys(E).map(e=>(0,g.jsxs)(`span`,{className:`pa-legend-item`,children:[(0,g.jsx)(`span`,{className:`pa-legend-dot`,style:{background:E[e].ink,opacity:.7}}),E[e].label]},e))})]})]}),Z=E[W.family],re=(0,g.jsx)(`section`,{"aria-label":`Facing detail`,children:(0,g.jsxs)(`div`,{className:`pa-detail`,style:{"--pa-wash":Z.wash},children:[(0,g.jsx)(`span`,{className:`pa-detail-glyph`,"aria-hidden":!0,children:(0,g.jsx)(R,{glyph:W.glyph,ink:Z.ink,height:52})}),(0,g.jsxs)(`div`,{className:`pa-detail-body`,children:[(0,g.jsx)(`div`,{className:`pa-detail-name`,children:W.name}),(0,g.jsxs)(`div`,{className:`pa-detail-meta`,children:[(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`div`,{className:`pa-meta-label`,children:`SKU`}),(0,g.jsx)(`div`,{className:`pa-meta-value`,children:W.sku})]}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`div`,{className:`pa-meta-label`,children:`Slot`}),(0,g.jsxs)(`div`,{className:`pa-meta-value`,children:[`S`,W.shelf,` · P`,W.pos]})]}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`div`,{className:`pa-meta-label`,children:`Facings`}),(0,g.jsxs)(`div`,{className:`pa-meta-value`,children:[`×`,W.facings,` (`,W.units,`u)`]})]}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`div`,{className:`pa-meta-label`,children:`Tag price`}),(0,g.jsxs)(`div`,{className:`pa-meta-value`,children:[W.price,` · `,W.size]})]})]}),(0,g.jsxs)(`div`,{className:`pa-verdicts`,role:`group`,"aria-label":`Verdict for ${W.sku}`,children:[Object.keys(P).map(e=>(0,g.jsxs)(`button`,{type:`button`,className:`pa-verdict-btn v-${e}`,"aria-pressed":G===e,onClick:()=>X(W.id,e),children:[(0,g.jsx)(r,{icon:e===`ok`?c:e===`missing`?m:o,size:`sm`,color:`inherit`}),P[e].label]},e)),G!==null&&(0,g.jsxs)(`button`,{type:`button`,className:`pa-verdict-clear`,onClick:()=>Y(W.id,null),children:[(0,g.jsx)(r,{icon:a,size:`sm`,color:`inherit`}),`Clear`]})]})]})]})}),Q=T===null?`—`:`${T}%`,ie=[...j.map(e=>({...e,isLive:!1})),{id:`s-214`,name:`#214 Cedar Falls (this audit)`,pct:T??0,isLive:!0}].sort((e,t)=>t.pct-e.pct),ae=(0,g.jsxs)(`section`,{"aria-label":`District compliance rollup`,children:[(0,g.jsxs)(`div`,{className:`pa-section-head`,children:[(0,g.jsx)(`span`,{className:`pa-section-title`,children:`District 7 rollup`}),(0,g.jsxs)(`span`,{className:`pa-bay-tab-meta`,children:[`mean `,k,`% · `,j.length+1,` stores`]})]}),(0,g.jsxs)(`div`,{className:`pa-district`,children:[ie.map(e=>(0,g.jsxs)(`div`,{className:`pa-store-row${e.isLive?` is-live`:``}`,children:[(0,g.jsx)(`span`,{className:`pa-store-name`,children:e.name}),(0,g.jsx)(`span`,{className:`pa-store-bar`,role:`img`,"aria-label":`${e.name}: ${e.isLive?Q:`${e.pct}%`} compliant`,children:(0,g.jsx)(`span`,{className:`pa-store-fill`,style:{width:`${e.isLive?T??0:e.pct}%`}})}),(0,g.jsx)(`span`,{className:`pa-store-pct`,children:e.isLive?Q:`${e.pct}%`})]},e.id)),(0,g.jsx)(`div`,{className:`pa-district-foot`,children:`Store #214 recomputes from this audit's verdicts; sibling stores are last week's certified walks.`})]})]}),oe=(0,g.jsx)(`section`,{"aria-label":`Audit checklist`,children:[1,2,3,4].map(e=>{let t=F(n,e),i=t.filter(e=>y[e.id]!==void 0).length;return(0,g.jsxs)(`div`,{children:[(0,g.jsxs)(`div`,{className:`pa-group-head`,children:[(0,g.jsx)(`span`,{children:L[e]}),(0,g.jsxs)(`span`,{className:`pa-group-count pa-num${i===t.length?` is-done`:``}`,children:[i,`/`,t.length]})]}),t.map(e=>{let t=y[e.id];return(0,g.jsxs)(`div`,{className:`pa-check-row`,children:[(0,g.jsxs)(`button`,{type:`button`,className:`pa-check-main`,"aria-pressed":e.id===_,"aria-label":`Select ${e.sku} ${e.name}`,onClick:()=>J(e.id),children:[(0,g.jsx)(`span`,{className:`pa-check-name`,children:e.name}),(0,g.jsxs)(`span`,{className:`pa-check-sub`,children:[e.sku,` · ×`,e.facings,` · `,e.price]})]}),(0,g.jsx)(`div`,{className:`pa-check-actions`,role:`group`,"aria-label":`Verdict for ${e.sku}`,children:Object.keys(P).map(n=>(0,g.jsx)(`button`,{type:`button`,className:`pa-square v-${n}`,"aria-pressed":t===n,"aria-label":`Mark ${e.sku} ${P[n].label}`,onClick:()=>X(e.id,n),children:(0,g.jsx)(r,{icon:n===`ok`?c:n===`missing`?m:o,size:`sm`,color:`inherit`})},n))})]},`cl-${e.id}`)})]},`cl-${n}-${e}`)})}),se=(0,g.jsxs)(`section`,{"aria-label":`Follow-up tasks`,children:[(0,g.jsxs)(`div`,{className:`pa-group-head`,children:[(0,g.jsx)(`span`,{children:`Follow-ups`}),(0,g.jsx)(`span`,{className:`pa-group-count pa-num`,children:H.length})]}),H.length===0?(0,g.jsx)(`div`,{className:`pa-empty`,children:`No follow-ups yet — Missing and Misplaced verdicts mint replenish and reset tasks here.`}):H.map(e=>{let t=y[e.id];return(0,g.jsxs)(`div`,{className:`pa-task`,children:[(0,g.jsx)(`span`,{className:`pa-task-icon ${P[t].className}`,children:(0,g.jsx)(r,{icon:t===`missing`?m:o,size:`sm`,color:`inherit`})}),(0,g.jsx)(`span`,{className:`pa-task-text`,children:t===`missing`?(0,g.jsxs)(g.Fragment,{children:[`Replenish `,(0,g.jsx)(`b`,{children:e.sku}),` — `,e.name,` (`,e.facings,` facings,`,` `,e.bay===`bay-12`?`Bay 12`:`Bay 13`,` S`,e.shelf,` P`,e.pos,`)`]}):(0,g.jsxs)(g.Fragment,{children:[`Reset `,(0,g.jsx)(`b`,{children:e.sku}),` to`,` `,e.bay===`bay-12`?`Bay 12`:`Bay 13`,` shelf `,e.shelf,`, position `,e.pos,` per `,e.bay===`bay-12`?O[0].planogramRev:O[1].planogramRev]})})]},`task-${e.id}`)})]}),$=(0,g.jsxs)(`div`,{className:`pa-panel`,children:[(0,g.jsx)(`div`,{className:`pa-panel-head`,children:(0,g.jsxs)(`span`,{className:`pa-section-title`,children:[`Audit checklist — `,U.name]})}),(0,g.jsxs)(`div`,{className:`pa-panel-scroll`,children:[oe,se]})]}),ce=(0,g.jsx)(`div`,{className:`pa-bays`,role:`group`,"aria-label":`Bay switcher`,children:O.map(e=>(0,g.jsxs)(`button`,{type:`button`,className:`pa-bay-tab`,"aria-pressed":e.id===n,onClick:()=>s(e.id),children:[(0,g.jsxs)(`span`,{style:{minWidth:0},children:[(0,g.jsx)(`span`,{className:`pa-bay-tab-name`,children:e.name}),(0,g.jsx)(`br`,{}),(0,g.jsx)(`span`,{className:`pa-bay-tab-meta`,children:e.aisle})]}),(0,g.jsxs)(`span`,{className:`pa-bay-tab-meta pa-num`,children:[K(e.id),`/`,q(e.id)]})]},e.id))});return(0,g.jsxs)(`div`,{className:`tpl-retail-planogram-audit`,children:[(0,g.jsx)(`style`,{children:D}),(0,g.jsx)(l,{height:`fill`,header:(0,g.jsx)(d,{hasDivider:!0,children:(0,g.jsxs)(`div`,{className:`pa-header`,children:[(0,g.jsx)(`span`,{className:`pa-mark`,"aria-hidden":!0,children:(0,g.jsx)(z,{})}),(0,g.jsxs)(`div`,{className:`pa-header-id`,children:[(0,g.jsx)(`h1`,{className:`pa-header-title`,children:`Shelfright · Planogram Audit`}),(0,g.jsxs)(`div`,{className:`pa-header-sub`,children:[`Store #214`,(0,g.jsx)(`span`,{className:`pa-city`,children:` — Cedar Falls`}),` ·`,` `,M,` · `,N]})]}),(0,g.jsxs)(`div`,{className:`pa-header-chips`,children:[(0,g.jsxs)(`span`,{className:`pa-chip`,children:[(0,g.jsx)(r,{icon:i,size:`xsm`,color:`secondary`}),(0,g.jsx)(`span`,{className:`pa-chip-label`,children:`Audited`}),(0,g.jsxs)(`b`,{children:[C,`/`,A.length]})]}),(0,g.jsxs)(`span`,{className:`pa-chip`,children:[(0,g.jsx)(`span`,{className:`pa-chip-label`,children:`Compliance`}),(0,g.jsx)(`b`,{children:T===null?`—`:`${T}%`})]})]})]})}),end:t?void 0:(0,g.jsx)(f,{hasDivider:!0,width:336,padding:0,label:`Audit checklist`,children:$}),content:(0,g.jsxs)(u,{padding:0,children:[(0,g.jsx)(`div`,{"aria-live":`polite`,className:`pa-vh`,children:x}),(0,g.jsx)(`div`,{className:`pa-scroll`,children:(0,g.jsxs)(`div`,{className:`pa-main`,children:[ce,ne,re,ae,t&&$]})})]})})]})}export{H as default};