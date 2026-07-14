import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Icon-QWhqeGsc.js";import{t as i}from"./activity-BJFOaE5r.js";import{t as a}from"./bed-double-p8-zTiVd.js";import{t as o}from"./clipboard-list-DlFUkmiS.js";import{t as s}from"./door-closed-BEClqo5o.js";import{t as c}from"./fan-Cv3wiC0F.js";import{t as l}from"./shield-CngYQDgn.js";import{t as u}from"./wind-zO9Ry9cd.js";import{i as d}from"./index-DDmS-Cgf.js";import{n as f,t as p}from"./LayoutContent-CCL91W7X.js";import{t as m}from"./LayoutHeader-Cy2mWoMf.js";var h=e(t(),1),g=n(),_=`light-dark(#0F766E, #4CD9CC)`,v=`light-dark(#FFFFFF, #06302B)`,y=`light-dark(rgba(15, 118, 110, 0.10), rgba(76, 217, 204, 0.14))`,b=`light-dark(#92400E, #F2B84B)`,x=`light-dark(rgba(180, 83, 9, 0.12), rgba(242, 184, 75, 0.14))`,S=`light-dark(#1D4ED8, #8AB4FF)`,C=`light-dark(rgba(29, 78, 216, 0.10), rgba(138, 180, 255, 0.14))`,w=`light-dark(#B42318, #FF8A7A)`,T=`light-dark(rgba(180, 35, 24, 0.10), rgba(255, 138, 122, 0.14))`,E=[{id:`4W`,name:`4 West — Med-Surg`,descriptor:`6 semi-private rooms + 2 private`},{id:`5T`,name:`5 Tower — Telemetry`,descriptor:`10 private monitored rooms`},{id:`MICU`,name:`MICU-2`,descriptor:`8 private rooms · 204/205 negative pressure`},{id:`OBS`,name:`Observation`,descriptor:`6 open bays · no isolation capability`}],D={none:`Standard precautions`,contact:`Contact isolation`,droplet:`Droplet isolation`,airborne:`Airborne isolation`,protective:`Protective environment`},O=[{id:`4w-401a`,unitId:`4W`,label:`401-A`,isPrivate:!1,telemetry:!1,negPressure:!1,state:`occupied`,occupant:`H. Vance`,note:`LOS 3d`},{id:`4w-401b`,unitId:`4W`,label:`401-B`,isPrivate:!1,telemetry:!1,negPressure:!1,state:`occupied`,occupant:`C. Amado`,note:`LOS 1d`},{id:`4w-402a`,unitId:`4W`,label:`402-A`,isPrivate:!1,telemetry:!1,negPressure:!1,state:`dc-pending`,occupant:`L. Petrov`,note:`DC order 14:00 · ride pending`},{id:`4w-402b`,unitId:`4W`,label:`402-B`,isPrivate:!1,telemetry:!1,negPressure:!1,state:`occupied`,occupant:`M. Duarte`,note:`LOS 5d`},{id:`4w-403a`,unitId:`4W`,label:`403-A`,isPrivate:!1,telemetry:!1,negPressure:!1,state:`occupied`,occupant:`J. Okon`,note:`LOS 2d`},{id:`4w-403b`,unitId:`4W`,label:`403-B`,isPrivate:!1,telemetry:!1,negPressure:!1,state:`available`,occupant:null,note:`Clean 12:40`},{id:`4w-404a`,unitId:`4W`,label:`404-A`,isPrivate:!1,telemetry:!1,negPressure:!1,state:`occupied`,occupant:`R. Feld`,note:`LOS 4d`},{id:`4w-404b`,unitId:`4W`,label:`404-B`,isPrivate:!1,telemetry:!1,negPressure:!1,state:`blocked`,occupant:null,note:`Facilities · HVAC fault`},{id:`4w-405a`,unitId:`4W`,label:`405-A`,isPrivate:!1,telemetry:!1,negPressure:!1,state:`occupied`,occupant:`S. Ngata`,note:`LOS 1d`},{id:`4w-405b`,unitId:`4W`,label:`405-B`,isPrivate:!1,telemetry:!1,negPressure:!1,state:`cleaning`,occupant:null,note:`EVS started 13:10`},{id:`4w-406a`,unitId:`4W`,label:`406-A`,isPrivate:!1,telemetry:!1,negPressure:!1,state:`occupied`,occupant:`B. Corr`,note:`LOS 6d`},{id:`4w-406b`,unitId:`4W`,label:`406-B`,isPrivate:!1,telemetry:!1,negPressure:!1,state:`dc-pending`,occupant:`A. Slate`,note:`DC order 11:30 · awaiting PT`},{id:`4w-407`,unitId:`4W`,label:`407`,isPrivate:!0,telemetry:!1,negPressure:!1,state:`available`,occupant:null,note:`Clean 09:55`},{id:`4w-408`,unitId:`4W`,label:`408`,isPrivate:!0,telemetry:!1,negPressure:!1,state:`occupied`,occupant:`E. Marsh`,note:`Contact iso · LOS 8d`},{id:`5t-501`,unitId:`5T`,label:`501`,isPrivate:!0,telemetry:!0,negPressure:!1,state:`occupied`,occupant:`G. Havel`,note:`LOS 2d`},{id:`5t-502`,unitId:`5T`,label:`502`,isPrivate:!0,telemetry:!0,negPressure:!1,state:`occupied`,occupant:`N. Iwu`,note:`LOS 1d`},{id:`5t-503`,unitId:`5T`,label:`503`,isPrivate:!0,telemetry:!0,negPressure:!1,state:`dc-pending`,occupant:`F. Reyna`,note:`DC order 13:15 · scripts ready`},{id:`5t-504`,unitId:`5T`,label:`504`,isPrivate:!0,telemetry:!0,negPressure:!1,state:`available`,occupant:null,note:`Clean 12:05`},{id:`5t-505`,unitId:`5T`,label:`505`,isPrivate:!0,telemetry:!0,negPressure:!1,state:`occupied`,occupant:`K. Brandt`,note:`LOS 3d`},{id:`5t-506`,unitId:`5T`,label:`506`,isPrivate:!0,telemetry:!0,negPressure:!1,state:`occupied`,occupant:`O. Sesay`,note:`LOS 2d`},{id:`5t-507`,unitId:`5T`,label:`507`,isPrivate:!0,telemetry:!0,negPressure:!1,state:`cleaning`,occupant:null,note:`EVS started 12:48`},{id:`5t-508`,unitId:`5T`,label:`508`,isPrivate:!0,telemetry:!0,negPressure:!1,state:`occupied`,occupant:`D. Quill`,note:`LOS 4d`},{id:`5t-509`,unitId:`5T`,label:`509`,isPrivate:!0,telemetry:!0,negPressure:!1,state:`available`,occupant:null,note:`Clean 11:20`},{id:`5t-510`,unitId:`5T`,label:`510`,isPrivate:!0,telemetry:!0,negPressure:!1,state:`occupied`,occupant:`P. Anand`,note:`LOS 1d`},{id:`micu-201`,unitId:`MICU`,label:`201`,isPrivate:!0,telemetry:!0,negPressure:!1,state:`occupied`,occupant:`T. Ibarra`,note:`Vent · LOS 5d`},{id:`micu-202`,unitId:`MICU`,label:`202`,isPrivate:!0,telemetry:!0,negPressure:!1,state:`occupied`,occupant:`W. Cho`,note:`LOS 2d`},{id:`micu-203`,unitId:`MICU`,label:`203`,isPrivate:!0,telemetry:!0,negPressure:!1,state:`occupied`,occupant:`V. Roan`,note:`CRRT · LOS 3d`},{id:`micu-204`,unitId:`MICU`,label:`204`,isPrivate:!0,telemetry:!0,negPressure:!0,state:`available`,occupant:null,note:`Neg-pressure verified 10:30`},{id:`micu-205`,unitId:`MICU`,label:`205`,isPrivate:!0,telemetry:!0,negPressure:!0,state:`occupied`,occupant:`Y. Toure`,note:`Airborne iso · LOS 2d`},{id:`micu-206`,unitId:`MICU`,label:`206`,isPrivate:!0,telemetry:!0,negPressure:!1,state:`occupied`,occupant:`Z. Kellen`,note:`LOS 1d`},{id:`micu-207`,unitId:`MICU`,label:`207`,isPrivate:!0,telemetry:!0,negPressure:!1,state:`occupied`,occupant:`I. Faro`,note:`LOS 6d`},{id:`micu-208`,unitId:`MICU`,label:`208`,isPrivate:!0,telemetry:!0,negPressure:!1,state:`available`,occupant:null,note:`Clean 13:02`},{id:`obs-1`,unitId:`OBS`,label:`OBS-1`,isPrivate:!1,telemetry:!1,negPressure:!1,state:`occupied`,occupant:`U. Pryce`,note:`Obs 9h`},{id:`obs-2`,unitId:`OBS`,label:`OBS-2`,isPrivate:!1,telemetry:!1,negPressure:!1,state:`available`,occupant:null,note:`Clean 12:15`},{id:`obs-3`,unitId:`OBS`,label:`OBS-3`,isPrivate:!1,telemetry:!1,negPressure:!1,state:`occupied`,occupant:`Q. Salas`,note:`Obs 14h`},{id:`obs-4`,unitId:`OBS`,label:`OBS-4`,isPrivate:!1,telemetry:!1,negPressure:!1,state:`cleaning`,occupant:null,note:`EVS started 13:22`},{id:`obs-5`,unitId:`OBS`,label:`OBS-5`,isPrivate:!1,telemetry:!1,negPressure:!1,state:`available`,occupant:null,note:`Clean 10:48`},{id:`obs-6`,unitId:`OBS`,label:`OBS-6`,isPrivate:!1,telemetry:!1,negPressure:!1,state:`occupied`,occupant:`X. Marek`,note:`Obs 4h`}],k=[{id:`A-4102`,patient:`M. Okafor`,ageSex:`67F`,dx:`CHF exacerbation, BNP 1,840`,source:`ED bay 6`,units:[`5T`],telemetry:!0,isolation:`none`,boardedHours:6.4},{id:`A-4096`,patient:`D. Reyes`,ageSex:`54M`,dx:`Cellulitis L leg, MRSA history`,source:`ED bay 11`,units:[`4W`],telemetry:!1,isolation:`contact`,boardedHours:4.1},{id:`A-4107`,patient:`S. Whitfield`,ageSex:`73M`,dx:`Syncope, monitor for arrhythmia`,source:`ED bay 2`,units:[`5T`],telemetry:!0,isolation:`none`,boardedHours:3.6},{id:`A-4110`,patient:`P. Lindqvist`,ageSex:`81F`,dx:`Pulmonary TB rule-out, cavitary lesion on CT`,source:`ED resus 1`,units:[`MICU`],telemetry:!0,isolation:`airborne`,boardedHours:2.8},{id:`A-4114`,patient:`R. Chaudhary`,ageSex:`45M`,dx:`Neutropenic fever day 9 post-consolidation chemo, ANC 210`,source:`Direct — Oncology clinic`,units:[`4W`,`5T`],telemetry:!1,isolation:`protective`,boardedHours:1.2},{id:`A-4088`,patient:`T. Boone`,ageSex:`38M`,dx:`Post-op lap appendectomy, overnight obs`,source:`PACU`,units:[`4W`],telemetry:!1,isolation:`none`,boardedHours:.9}];function A(e,t){return t.state===`available`?e.units.includes(t.unitId)?e.telemetry&&!t.telemetry?{ok:!1,reason:`${t.label} has no telemetry — ${e.patient} requires continuous monitoring.`}:e.isolation===`airborne`&&!t.negPressure?{ok:!1,reason:`${t.label} is not negative pressure — airborne isolation requires a negative-pressure room.`}:(e.isolation===`contact`||e.isolation===`droplet`||e.isolation===`protective`)&&!t.isPrivate?{ok:!1,reason:`${t.label} is a ${t.unitId===`OBS`?`shared open bay`:`semi-private room`} — ${D[e.isolation].toLowerCase()} requires a private room.`}:{ok:!0}:{ok:!1,reason:`${t.label} is on ${t.unitId} — ${e.patient} is accepted for ${e.units.join(` or `)}.`}:{ok:!1,reason:`${t.label} is ${{occupied:`occupied`,"dc-pending":`occupied with a pending discharge`,cleaning:`still with EVS`,blocked:`blocked by facilities`,assigned:`already assigned to an incoming patient`,available:`available`}[t.state]}.`}}var j=`
.tpl-hospital-bed-flow-command {
  --hbf-accent: ${_};
  --hbf-on-accent: ${v};
  --hbf-accent-tint: ${y};
  --hbf-dc-text: ${b};
  --hbf-dc-tint: ${x};
  --hbf-clean-text: ${S};
  --hbf-clean-tint: ${C};
  --hbf-block-text: ${w};
  --hbf-block-tint: ${T};
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
  height: 100%;
  min-height: 0;
}
.tpl-hospital-bed-flow-command *,
.tpl-hospital-bed-flow-command *::before,
.tpl-hospital-bed-flow-command *::after {
  box-sizing: border-box;
}
.tpl-hospital-bed-flow-command button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.tpl-hospital-bed-flow-command button:focus-visible {
  outline: 2px solid var(--hbf-accent);
  outline-offset: 2px;
}
.tpl-hospital-bed-flow-command .hbf-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ---- header ------------------------------------------------------------- */
.tpl-hospital-bed-flow-command .hbf-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  width: 100%;
}
.tpl-hospital-bed-flow-command .hbf-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
}
.tpl-hospital-bed-flow-command .hbf-brand-mark {
  flex: none;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: var(--hbf-accent);
  color: var(--hbf-on-accent);
}
.tpl-hospital-bed-flow-command .hbf-brand-name {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.tpl-hospital-bed-flow-command .hbf-brand-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.tpl-hospital-bed-flow-command .hbf-stats {
  display: flex;
  gap: var(--spacing-2);
  margin-inline-start: auto;
  flex-wrap: wrap;
}
/* 60px stat tiles (density grid). */
.tpl-hospital-bed-flow-command .hbf-stat {
  min-width: 108px;
  height: 60px;
  padding: 8px 12px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}
.tpl-hospital-bed-flow-command .hbf-stat-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.tpl-hospital-bed-flow-command .hbf-stat-value {
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}
.tpl-hospital-bed-flow-command .hbf-stat-value.is-accent { color: var(--hbf-accent); }
.tpl-hospital-bed-flow-command .hbf-stat-value.is-warn { color: var(--hbf-dc-text); }

/* ---- body grid ------------------------------------------------------------
   Hand-rolled minmax(0,1fr)/328px grid (not LayoutPanel) so the <=900px
   restructure — rail reordered ABOVE the floor as a horizontal strip — stays
   a pure CSS media query; a DS panel would pin its width inline. */
.tpl-hospital-bed-flow-command .hbf-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 328px;
  gap: 12px;
  padding: 12px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
.tpl-hospital-bed-flow-command .hbf-floor {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-inline-end: 4px;
}
.tpl-hospital-bed-flow-command .hbf-rail {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ---- unit sections -------------------------------------------------------- */
.tpl-hospital-bed-flow-command .hbf-unit {
  border: var(--border-width) solid var(--color-border);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
/* 44px unit header row (density grid). */
.tpl-hospital-bed-flow-command .hbf-unit-head {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}
.tpl-hospital-bed-flow-command .hbf-unit-name {
  font-size: 14px;
  font-weight: 700;
  margin: 0;
}
.tpl-hospital-bed-flow-command .hbf-unit-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.tpl-hospital-bed-flow-command .hbf-unit-count {
  margin-inline-start: auto;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.tpl-hospital-bed-flow-command .hbf-unit-count strong {
  color: var(--hbf-accent);
  font-weight: 700;
}

/* 12px segmented census bar (density grid); segments animate width. */
.tpl-hospital-bed-flow-command .hbf-census {
  display: flex;
  height: 12px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--color-background-muted);
}
.tpl-hospital-bed-flow-command .hbf-census-seg {
  height: 100%;
  transition: width 240ms ease;
}
.tpl-hospital-bed-flow-command .hbf-census-seg.is-occupied { background: color-mix(in oklab, var(--color-text-secondary) 55%, var(--color-background-muted)); }
.tpl-hospital-bed-flow-command .hbf-census-seg.is-dc { background: var(--hbf-dc-text); }
.tpl-hospital-bed-flow-command .hbf-census-seg.is-assigned { background: var(--hbf-accent); }
.tpl-hospital-bed-flow-command .hbf-census-seg.is-cleaning { background: var(--hbf-clean-text); }
.tpl-hospital-bed-flow-command .hbf-census-seg.is-blocked { background: var(--hbf-block-text); }
.tpl-hospital-bed-flow-command .hbf-census-seg.is-available { background: color-mix(in oklab, var(--hbf-accent) 22%, var(--color-background-muted)); }
.tpl-hospital-bed-flow-command .hbf-legend {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.tpl-hospital-bed-flow-command .hbf-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.tpl-hospital-bed-flow-command .hbf-legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: none;
}

/* ---- bed tiles: minmax(96px,1fr) × 64px on an 8px grid gap ---------------- */
.tpl-hospital-bed-flow-command .hbf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 8px;
}
.tpl-hospital-bed-flow-command .hbf-tile {
  position: relative;
  height: 64px;
  padding: 6px 8px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  transition: border-color 160ms ease, background-color 160ms ease, opacity 160ms ease;
}
.tpl-hospital-bed-flow-command .hbf-tile-top {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}
.tpl-hospital-bed-flow-command .hbf-tile-id {
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.tpl-hospital-bed-flow-command .hbf-tile-caps {
  margin-inline-start: auto;
  display: inline-flex;
  gap: 3px;
  color: var(--color-text-secondary);
}
.tpl-hospital-bed-flow-command .hbf-tile-caps svg { display: block; }
.tpl-hospital-bed-flow-command .hbf-tile-sub {
  font-size: 11px;
  line-height: 1.25;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* State coats. Occupied stays quiet; everything actionable gets a hue. */
.tpl-hospital-bed-flow-command .hbf-tile.is-occupied { background: var(--color-background-muted); }
.tpl-hospital-bed-flow-command .hbf-tile.is-occupied .hbf-tile-id { color: var(--color-text-secondary); }
.tpl-hospital-bed-flow-command .hbf-tile.is-dc-pending { background: var(--hbf-dc-tint); border-color: color-mix(in srgb, var(--hbf-dc-text) 45%, var(--color-border)); }
.tpl-hospital-bed-flow-command .hbf-tile.is-dc-pending .hbf-tile-sub { color: var(--hbf-dc-text); }
.tpl-hospital-bed-flow-command .hbf-tile.is-cleaning { background: var(--hbf-clean-tint); border-color: color-mix(in srgb, var(--hbf-clean-text) 45%, var(--color-border)); }
.tpl-hospital-bed-flow-command .hbf-tile.is-cleaning .hbf-tile-sub { color: var(--hbf-clean-text); }
.tpl-hospital-bed-flow-command .hbf-tile.is-blocked { background: var(--hbf-block-tint); border-color: color-mix(in srgb, var(--hbf-block-text) 45%, var(--color-border)); cursor: not-allowed; }
.tpl-hospital-bed-flow-command .hbf-tile.is-blocked .hbf-tile-sub { color: var(--hbf-block-text); }
.tpl-hospital-bed-flow-command .hbf-tile.is-available { background: var(--hbf-accent-tint); border-color: color-mix(in srgb, var(--hbf-accent) 45%, var(--color-border)); }
.tpl-hospital-bed-flow-command .hbf-tile.is-available .hbf-tile-sub { color: var(--hbf-accent); }
.tpl-hospital-bed-flow-command .hbf-tile.is-assigned { background: var(--hbf-accent); border-color: var(--hbf-accent); }
.tpl-hospital-bed-flow-command .hbf-tile.is-assigned .hbf-tile-id,
.tpl-hospital-bed-flow-command .hbf-tile.is-assigned .hbf-tile-sub,
.tpl-hospital-bed-flow-command .hbf-tile.is-assigned .hbf-tile-caps { color: var(--hbf-on-accent); }
/* Armed-admit targeting: compatible beds pulse, the rest recede. */
.tpl-hospital-bed-flow-command .hbf-tile.is-target {
  border-color: var(--hbf-accent);
  box-shadow: 0 0 0 1px var(--hbf-accent);
  animation: hbf-target-pulse 1.4s ease-in-out infinite;
}
.tpl-hospital-bed-flow-command .hbf-tile.is-dim { opacity: 0.45; }
.tpl-hospital-bed-flow-command .hbf-tile.is-refused {
  border-color: var(--hbf-block-text);
  box-shadow: 0 0 0 1px var(--hbf-block-text);
  animation: hbf-refuse-shake 320ms ease;
}
@keyframes hbf-target-pulse {
  0%, 100% { box-shadow: 0 0 0 1px var(--hbf-accent); }
  50% { box-shadow: 0 0 0 3px color-mix(in srgb, var(--hbf-accent) 55%, transparent); }
}
@keyframes hbf-refuse-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}
@media (hover: hover) {
  .tpl-hospital-bed-flow-command .hbf-tile:not(.is-blocked):hover {
    border-color: color-mix(in srgb, var(--color-text-primary) 35%, var(--color-border));
  }
  .tpl-hospital-bed-flow-command .hbf-tile.is-target:hover {
    border-color: var(--hbf-accent);
    background: color-mix(in srgb, var(--hbf-accent) 22%, var(--color-background-body));
  }
}

/* ---- pending-admit rail ---------------------------------------------------- */
.tpl-hospital-bed-flow-command .hbf-rail-head {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
}
.tpl-hospital-bed-flow-command .hbf-rail-title {
  font-size: 13px;
  font-weight: 700;
  margin: 0;
}
.tpl-hospital-bed-flow-command .hbf-rail-sum {
  margin-inline-start: auto;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.tpl-hospital-bed-flow-command .hbf-admit {
  width: 100%;
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color 160ms ease, background-color 160ms ease;
}
.tpl-hospital-bed-flow-command .hbf-admit.is-armed {
  border-color: var(--hbf-accent);
  background: var(--hbf-accent-tint);
  box-shadow: 0 0 0 1px var(--hbf-accent);
}
@media (hover: hover) {
  .tpl-hospital-bed-flow-command .hbf-admit:hover {
    border-color: color-mix(in srgb, var(--color-text-primary) 35%, var(--color-border));
  }
}
.tpl-hospital-bed-flow-command .hbf-admit-top {
  display: flex;
  align-items: center;
  gap: 6px;
}
.tpl-hospital-bed-flow-command .hbf-admit-name {
  font-size: 13px;
  font-weight: 600;
}
.tpl-hospital-bed-flow-command .hbf-admit-agesex {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.tpl-hospital-bed-flow-command .hbf-board-chip {
  margin-inline-start: auto;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--color-background-muted);
  color: var(--color-text-secondary);
  white-space: nowrap;
}
/* Boarding-age ramp: >=4h amber, >=6h red (thresholds in BOARDING_WARN/CRIT). */
.tpl-hospital-bed-flow-command .hbf-board-chip.is-warn { background: var(--hbf-dc-tint); color: var(--hbf-dc-text); }
.tpl-hospital-bed-flow-command .hbf-board-chip.is-crit { background: var(--hbf-block-tint); color: var(--hbf-block-text); }
.tpl-hospital-bed-flow-command .hbf-admit-dx {
  font-size: 12px;
  line-height: 1.35;
  color: var(--color-text-primary);
}
.tpl-hospital-bed-flow-command .hbf-admit-src {
  font-size: 11px;
  color: var(--color-text-secondary);
}
.tpl-hospital-bed-flow-command .hbf-needs {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.tpl-hospital-bed-flow-command .hbf-need {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.tpl-hospital-bed-flow-command .hbf-need.is-iso { border-color: color-mix(in srgb, var(--hbf-block-text) 45%, var(--color-border)); color: var(--hbf-block-text); }
.tpl-hospital-bed-flow-command .hbf-admit-hint {
  font-size: 11px;
  font-weight: 600;
  color: var(--hbf-accent);
}

/* ---- notice + shift log ----------------------------------------------------- */
.tpl-hospital-bed-flow-command .hbf-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.4;
}
.tpl-hospital-bed-flow-command .hbf-notice.is-refusal {
  background: var(--hbf-block-tint);
  color: var(--hbf-block-text);
  border: var(--border-width) solid color-mix(in srgb, var(--hbf-block-text) 45%, var(--color-border));
}
.tpl-hospital-bed-flow-command .hbf-notice.is-info {
  background: var(--hbf-accent-tint);
  color: var(--hbf-accent);
  border: var(--border-width) solid color-mix(in srgb, var(--hbf-accent) 45%, var(--color-border));
}
.tpl-hospital-bed-flow-command .hbf-notice-dismiss {
  margin-inline-start: auto;
  flex: none;
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  color: inherit;
}
.tpl-hospital-bed-flow-command .hbf-log {
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tpl-hospital-bed-flow-command .hbf-log-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin: 0;
}
.tpl-hospital-bed-flow-command .hbf-log-row {
  font-size: 12px;
  line-height: 1.35;
  color: var(--color-text-secondary);
  display: flex;
  gap: 6px;
}
.tpl-hospital-bed-flow-command .hbf-log-row::before {
  content: '';
  flex: none;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--hbf-accent);
  margin-top: 5px;
}
.tpl-hospital-bed-flow-command .hbf-log-empty {
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* ---- responsive: subtraction + reorder, never a squeeze ---------------------- */
@media (max-width: 900px) {
  .tpl-hospital-bed-flow-command .hbf-body {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
    overflow-y: auto;
  }
  .tpl-hospital-bed-flow-command .hbf-rail {
    order: -1;
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 4px;
  }
  .tpl-hospital-bed-flow-command .hbf-rail-head,
  .tpl-hospital-bed-flow-command .hbf-notice,
  .tpl-hospital-bed-flow-command .hbf-log { flex: none; }
  .tpl-hospital-bed-flow-command .hbf-admit { min-width: 280px; max-width: 280px; }
  .tpl-hospital-bed-flow-command .hbf-log { min-width: 260px; }
  .tpl-hospital-bed-flow-command .hbf-floor { overflow-y: visible; }
}
@media (max-width: 560px) {
  .tpl-hospital-bed-flow-command .hbf-brand-sub { display: none; }
  .tpl-hospital-bed-flow-command .hbf-stats { margin-inline-start: 0; width: 100%; }
  .tpl-hospital-bed-flow-command .hbf-stat { flex: 1 1 40%; min-width: 0; }
  .tpl-hospital-bed-flow-command .hbf-grid { grid-template-columns: repeat(auto-fill, minmax(88px, 1fr)); }
  .tpl-hospital-bed-flow-command .hbf-admit { min-width: 252px; max-width: 252px; }
}
@media (prefers-reduced-motion: reduce) {
  .tpl-hospital-bed-flow-command .hbf-tile.is-target,
  .tpl-hospital-bed-flow-command .hbf-tile.is-refused { animation: none; }
  .tpl-hospital-bed-flow-command .hbf-tile,
  .tpl-hospital-bed-flow-command .hbf-admit,
  .tpl-hospital-bed-flow-command .hbf-census-seg { transition: none; }
}
`;function M(){return(0,g.jsx)(`span`,{className:`hbf-brand-mark`,"aria-hidden":!0,children:(0,g.jsx)(`svg`,{width:16,height:16,viewBox:`0 0 16 16`,fill:`none`,children:(0,g.jsx)(`path`,{d:`M2 3v10M2 9h12M14 13V9M4.5 9V6.5A1.5 1.5 0 0 1 6 5h4a3 3 0 0 1 3 3v1`,stroke:`currentColor`,strokeWidth:1.6,strokeLinecap:`round`,strokeLinejoin:`round`})})})}var N=[{state:`occupied`,label:`Occupied`},{state:`dc-pending`,label:`DC pending`},{state:`assigned`,label:`Assigned`},{state:`cleaning`,label:`Cleaning`},{state:`blocked`,label:`Blocked`},{state:`available`,label:`Available`}],P={occupied:`color-mix(in oklab, var(--color-text-secondary) 55%, var(--color-background-muted))`,"dc-pending":`var(--hbf-dc-text)`,assigned:`var(--hbf-accent)`,cleaning:`var(--hbf-clean-text)`,blocked:`var(--hbf-block-text)`,available:`color-mix(in oklab, var(--hbf-accent) 22%, var(--color-background-muted))`};function F({unitBeds:e}){let t=new Map;for(let n of e)t.set(n.state,(t.get(n.state)??0)+1);let n=e.length;return(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)(`div`,{className:`hbf-census`,role:`img`,"aria-label":`Census: ${N.filter(e=>(t.get(e.state)??0)>0).map(e=>`${t.get(e.state)} ${e.label.toLowerCase()}`).join(`, `)} of ${n} beds`,children:N.map(e=>{let r=t.get(e.state)??0;return r>0?(0,g.jsx)(`div`,{className:`hbf-census-seg is-${e.state}`,style:{width:`${r/n*100}%`}},e.state):null})}),(0,g.jsx)(`div`,{className:`hbf-legend`,"aria-hidden":!0,children:N.map(e=>{let n=t.get(e.state)??0;return n>0?(0,g.jsxs)(`span`,{className:`hbf-legend-item`,children:[(0,g.jsx)(`span`,{className:`hbf-legend-dot`,style:{background:P[e.state]}}),e.label,` `,n]},e.state):null})})]})}var I={occupied:`occupied`,"dc-pending":`discharge pending — tap to complete discharge`,cleaning:`with EVS — tap to mark clean`,available:`available`,blocked:`blocked`,assigned:`assigned to incoming — tap to release`};function L({bed:e,targeting:t,isRefused:n,onActivate:a}){let o=e.state===`available`||e.state===`cleaning`||e.state===`blocked`||e.occupant==null?e.note:`${e.occupant}${e.state===`dc-pending`?` · DC`:``}`,l=`Bed ${e.label}, ${e.unitId}, ${I[e.state]}${t===`target`?` — compatible with the armed admit, tap to assign`:``}`;return(0,g.jsxs)(`button`,{type:`button`,className:[`hbf-tile`,`is-${e.state}`,t===`target`?`is-target`:``,t===`dim`?`is-dim`:``,n?`is-refused`:``].filter(Boolean).join(` `),"aria-label":l,onClick:()=>a(e),children:[(0,g.jsxs)(`span`,{className:`hbf-tile-top`,children:[(0,g.jsx)(`span`,{className:`hbf-tile-id`,children:e.label}),(0,g.jsxs)(`span`,{className:`hbf-tile-caps`,children:[e.negPressure?(0,g.jsx)(r,{icon:c,size:`xsm`,color:`inherit`}):null,e.telemetry?(0,g.jsx)(r,{icon:i,size:`xsm`,color:`inherit`}):null,e.isPrivate?(0,g.jsx)(r,{icon:s,size:`xsm`,color:`inherit`}):null]})]}),(0,g.jsx)(`span`,{className:`hbf-tile-sub`,children:o})]})}var R=4,z=6;function B({admit:e,isArmed:t,onToggle:n}){let a=e.boardedHours>=z?`hbf-board-chip is-crit`:e.boardedHours>=R?`hbf-board-chip is-warn`:`hbf-board-chip`;return(0,g.jsxs)(`button`,{type:`button`,className:`hbf-admit${t?` is-armed`:``}`,"aria-pressed":t,"aria-label":`${e.patient}, ${e.ageSex}, ${e.dx}. Needs ${e.units.join(` or `)}${e.telemetry?`, telemetry`:``}, ${D[e.isolation].toLowerCase()}. Boarding ${e.boardedHours.toFixed(1)} hours. ${t?`Armed — pick a highlighted bed, or tap again to cancel.`:`Tap to arm for assignment.`}`,onClick:()=>n(e),children:[(0,g.jsxs)(`span`,{className:`hbf-admit-top`,children:[(0,g.jsx)(`span`,{className:`hbf-admit-name`,children:e.patient}),(0,g.jsx)(`span`,{className:`hbf-admit-agesex`,children:e.ageSex}),(0,g.jsxs)(`span`,{className:a,children:[e.boardedHours.toFixed(1),` h`]})]}),(0,g.jsx)(`span`,{className:`hbf-admit-dx`,children:e.dx}),(0,g.jsxs)(`span`,{className:`hbf-admit-src`,children:[e.id,` · `,e.source]}),(0,g.jsxs)(`span`,{className:`hbf-needs`,"aria-hidden":!0,children:[(0,g.jsx)(`span`,{className:`hbf-need`,children:e.units.join(` / `)}),e.telemetry?(0,g.jsxs)(`span`,{className:`hbf-need`,children:[(0,g.jsx)(r,{icon:i,size:`xsm`,color:`inherit`}),`TELE`]}):null,e.isolation===`none`?null:(0,g.jsxs)(`span`,{className:`hbf-need is-iso`,children:[(0,g.jsx)(r,{icon:e.isolation===`airborne`?u:l,size:`xsm`,color:`inherit`}),D[e.isolation]]})]}),t?(0,g.jsx)(`span`,{className:`hbf-admit-hint`,children:`Assign mode — tap a highlighted bed. Esc or tap again to cancel.`}):null]})}function V(){let[e,t]=(0,h.useState)(O),[n,i]=(0,h.useState)(k),[s,c]=(0,h.useState)(()=>new Map),[l,u]=(0,h.useState)(null),[_,v]=(0,h.useState)(null),[y,b]=(0,h.useState)(null),[x,S]=(0,h.useState)([]),[C,w]=(0,h.useState)(``),T=l==null?null:n.find(e=>e.id===l)??null,D=(0,h.useMemo)(()=>n.filter(e=>!s.has(e.id)),[n,s]),N=D.reduce((e,t)=>e+t.boardedHours,0),P=e.filter(e=>e.state===`available`).length,I=e.filter(e=>e.state===`occupied`||e.state===`dc-pending`||e.state===`assigned`).length,R=Math.round(I/e.length*100),z=(0,h.useMemo)(()=>{if(T==null)return null;let t=new Map;for(let n of e)t.set(n.id,A(T,n).ok?`target`:`dim`);return t},[T,e]),V=e=>{S(t=>[e,...t].slice(0,6))},H=e=>{w(e)},U=t=>{if(v(null),b(null),l===t.id){u(null),H(`Assignment cancelled for ${t.patient}.`);return}u(t.id);let n=e.filter(e=>A(t,e).ok);H(n.length>0?`${t.patient} armed. ${n.length} compatible bed${n.length===1?``:`s`}: ${n.map(e=>e.label).join(`, `)}.`:`${t.patient} armed, but no compatible bed is open right now.`)},W=(e,n)=>{t(t=>t.map(t=>t.id===n.id?{...t,state:`assigned`,occupant:e.patient,note:`Incoming · ${e.id}`}:t)),c(t=>{let r=new Map(t);return r.set(e.id,n.id),r}),u(null),b(null),v({kind:`info`,text:`${e.patient} assigned to ${n.label} (${n.unitId}). Boarding clock stopped at ${e.boardedHours.toFixed(1)} h.`}),V(`Assigned ${e.patient} (${e.id}) → ${n.label} ${n.unitId}`),H(`${e.patient} assigned to bed ${n.label} on ${n.unitId}. ${n.unitId} census updated.`)},G=(e,t,n)=>{v({kind:`refusal`,text:`Refused: ${n}`}),b(t.id),H(`Refused. ${n}`)},K=e=>{let r=null;for(let[t,n]of s)n===e.id&&(r=t);let i=n.find(e=>e.id===r)??null;t(t=>t.map(t=>t.id===e.id?{...t,state:`available`,occupant:null,note:`Held clean`}:t)),r!=null&&c(e=>{let t=new Map(e);return t.delete(r),t});let a=i?.patient??`incoming patient`;v({kind:`info`,text:`${e.label} released — ${a} returned to the pending queue.`}),V(`Released ${e.label} — ${a} back to queue`),H(`Bed ${e.label} released. ${a} is pending again.`)},q=e=>{t(t=>t.map(t=>t.id===e.id?{...t,state:`cleaning`,occupant:null,note:`EVS requested`}:t)),V(`Discharged ${e.occupant??`patient`} from ${e.label} — EVS requested`),H(`Discharge complete in ${e.label}. Bed sent to EVS.`)},J=e=>{t(t=>t.map(t=>t.id===e.id?{...t,state:`available`,occupant:null,note:`Just cleaned`}:t)),V(`${e.label} cleaned — now available`),H(`Bed ${e.label} is clean and available.`)},Y=e=>{if(b(null),T!=null){let t=A(T,e);t.ok?W(T,e):G(T,e,t.reason);return}switch(e.state){case`dc-pending`:q(e);break;case`cleaning`:J(e);break;case`assigned`:K(e);break;case`available`:H(`Bed ${e.label} is available. Arm a pending admit to assign it.`);break;case`blocked`:H(`Bed ${e.label} is blocked: ${e.note??`facilities hold`}.`);break;default:H(`Bed ${e.label} is occupied by ${e.occupant??`a patient`} (${e.note??`no note`}).`);break}};return(0,g.jsxs)(`div`,{className:`tpl-hospital-bed-flow-command`,onKeyDown:e=>{e.key===`Escape`&&l!=null&&(e.stopPropagation(),u(null),H(`Assignment cancelled.`))},children:[(0,g.jsx)(`style`,{children:j}),(0,g.jsx)(f,{height:`fill`,header:(0,g.jsx)(m,{hasDivider:!0,children:(0,g.jsxs)(`div`,{className:`hbf-head`,children:[(0,g.jsxs)(`div`,{className:`hbf-brand`,children:[(0,g.jsx)(M,{}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`h1`,{className:`hbf-brand-name`,style:{margin:0},children:`Wardline · St. Alder Regional`}),(0,g.jsx)(`div`,{className:`hbf-brand-sub`,children:`Bed flow command · Day shift · 38 staffed beds`})]})]}),(0,g.jsxs)(`div`,{className:`hbf-stats`,children:[(0,g.jsxs)(`div`,{className:`hbf-stat`,children:[(0,g.jsx)(`span`,{className:`hbf-stat-label`,children:`Available beds`}),(0,g.jsx)(`span`,{className:`hbf-stat-value is-accent`,children:P})]}),(0,g.jsxs)(`div`,{className:`hbf-stat`,children:[(0,g.jsx)(`span`,{className:`hbf-stat-label`,children:`Pending admits`}),(0,g.jsx)(`span`,{className:`hbf-stat-value`,children:D.length})]}),(0,g.jsxs)(`div`,{className:`hbf-stat`,children:[(0,g.jsx)(`span`,{className:`hbf-stat-label`,children:`Boarding hrs`}),(0,g.jsx)(`span`,{className:`hbf-stat-value${N>=12?` is-warn`:``}`,children:N.toFixed(1)})]}),(0,g.jsxs)(`div`,{className:`hbf-stat`,children:[(0,g.jsx)(`span`,{className:`hbf-stat-label`,children:`Occupancy`}),(0,g.jsxs)(`span`,{className:`hbf-stat-value`,children:[R,`%`]})]})]})]})}),content:(0,g.jsxs)(p,{padding:0,role:`main`,label:`Bed flow command`,children:[(0,g.jsx)(`div`,{"aria-live":`polite`,className:`hbf-vh`,children:C}),(0,g.jsxs)(`div`,{className:`hbf-body`,children:[(0,g.jsx)(`div`,{className:`hbf-floor`,"aria-label":`Unit floor`,children:E.map(t=>{let n=e.filter(e=>e.unitId===t.id),r=n.filter(e=>e.state===`available`).length;return(0,g.jsxs)(`section`,{className:`hbf-unit`,children:[(0,g.jsxs)(`div`,{className:`hbf-unit-head`,children:[(0,g.jsx)(`h2`,{className:`hbf-unit-name`,children:t.name}),(0,g.jsx)(`span`,{className:`hbf-unit-desc`,children:t.descriptor}),(0,g.jsxs)(`span`,{className:`hbf-unit-count`,children:[(0,g.jsx)(`strong`,{children:r}),` open · `,n.length,` beds`]})]}),(0,g.jsx)(F,{unitBeds:n}),(0,g.jsx)(`div`,{className:`hbf-grid`,children:n.map(e=>(0,g.jsx)(L,{bed:e,targeting:z?.get(e.id)??null,isRefused:y===e.id,onActivate:Y},e.id))})]},t.id)})}),(0,g.jsxs)(`div`,{className:`hbf-rail`,"aria-label":`Pending admits`,children:[(0,g.jsxs)(`div`,{className:`hbf-rail-head`,children:[(0,g.jsx)(r,{icon:o,size:`sm`,color:`secondary`}),(0,g.jsx)(`h2`,{className:`hbf-rail-title`,children:`Pending admits`}),(0,g.jsxs)(`span`,{className:`hbf-rail-sum`,children:[D.length,` waiting · `,N.toFixed(1),` h`]})]}),_==null?null:(0,g.jsxs)(`div`,{className:`hbf-notice is-${_.kind}`,role:_.kind===`refusal`?`alert`:void 0,children:[(0,g.jsx)(r,{icon:_.kind===`refusal`?d:a,size:`sm`,color:`inherit`}),(0,g.jsx)(`span`,{style:{flex:1},children:_.text}),(0,g.jsx)(`button`,{type:`button`,className:`hbf-notice-dismiss`,"aria-label":`Dismiss notice`,onClick:()=>{v(null),b(null)},children:(0,g.jsx)(r,{icon:d,size:`xsm`,color:`inherit`})})]}),D.length===0?(0,g.jsxs)(`div`,{className:`hbf-log`,children:[(0,g.jsx)(`p`,{className:`hbf-log-title`,children:`Queue clear`}),(0,g.jsx)(`span`,{className:`hbf-log-empty`,children:`Every pending admit has a bed. Boarding clock at 0.0 h.`})]}):D.map(e=>(0,g.jsx)(B,{admit:e,isArmed:l===e.id,onToggle:U},e.id)),(0,g.jsxs)(`div`,{className:`hbf-log`,children:[(0,g.jsx)(`p`,{className:`hbf-log-title`,children:`Shift log`}),x.length===0?(0,g.jsx)(`span`,{className:`hbf-log-empty`,children:`No moves yet this session. Tap a discharge-pending or cleaning tile to advance it; arm an admit to assign a bed.`}):x.map((e,t)=>(0,g.jsx)(`span`,{className:`hbf-log-row`,children:e},`${e}-${t}`))]})]})]})]})})]})}export{V as default};