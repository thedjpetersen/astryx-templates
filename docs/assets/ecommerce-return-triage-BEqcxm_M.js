import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Icon-Cbr2QWU5.js";import{t as i}from"./arrow-left-right-s5KLlIH8.js";import{t as a}from"./ban-VaDQsSI3.js";import{t as o}from"./package-search-BywAfG_v.js";import{t as s}from"./truck-ez4Xj2SE.js";import{t as c}from"./undo-2-CiNTBph6.js";import{t as l}from"./wallet-CwwqnXOK.js";import{n as u,t as ee}from"./LayoutContent-CCL91W7X.js";import{t as d}from"./LayoutHeader-Cy2mWoMf.js";import{t as f}from"./LayoutPanel-Cqp-l8I4.js";import{t as p}from"./useMediaQuery-BvG63aw7.js";import{t as m}from"./useToast-DudMxDUg.js";var h=e(t(),1),g=n(),_=`light-dark(#0C7076, #4FD8CE)`,v=`light-dark(#FFFFFF, #04302D)`,y=`light-dark(rgba(12, 112, 118, 0.10), rgba(79, 216, 206, 0.14))`,b=`light-dark(#15803D, #4ADE80)`,x=`light-dark(rgba(21, 128, 61, 0.12), rgba(74, 222, 128, 0.16))`,S=`light-dark(#B45309, #FDB022)`,C=`light-dark(rgba(180, 83, 9, 0.12), rgba(253, 176, 34, 0.14))`,w=`light-dark(#B42318, #F97066)`,T=`light-dark(rgba(180, 35, 24, 0.10), rgba(249, 112, 102, 0.14))`,E=`light-dark(#6D28D9, #C4B5FD)`,D=`light-dark(rgba(109, 40, 217, 0.10), rgba(196, 181, 253, 0.14))`,O=`
.tpl-ecommerce-return-triage {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.tpl-ecommerce-return-triage *,
.tpl-ecommerce-return-triage *::before,
.tpl-ecommerce-return-triage *::after {
  box-sizing: border-box;
}
.tpl-ecommerce-return-triage button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  margin: 0;
  padding: 0;
  text-align: inherit;
  cursor: pointer;
}
.tpl-ecommerce-return-triage button:disabled {
  cursor: default;
}
.tpl-ecommerce-return-triage button:focus-visible {
  outline: 2px solid ${_};
  outline-offset: 2px;
}
.tpl-ecommerce-return-triage .rt-num {
  font-variant-numeric: tabular-nums;
}
.tpl-ecommerce-return-triage .rt-vh {
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
.tpl-ecommerce-return-triage .rt-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  min-width: 0;
  width: 100%;
}
.tpl-ecommerce-return-triage .rt-mark {
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
.tpl-ecommerce-return-triage .rt-header-id {
  min-width: 0;
  flex: 1 1 auto;
}
.tpl-ecommerce-return-triage .rt-header-title {
  font-size: 15px;
  font-weight: 650;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-ecommerce-return-triage .rt-header-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-ecommerce-return-triage .rt-header-chips {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex: none;
}
.tpl-ecommerce-return-triage .rt-chip {
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
.tpl-ecommerce-return-triage .rt-chip b {
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}
.tpl-ecommerce-return-triage .rt-chip-label {
  color: var(--color-text-secondary);
}
@media (max-width: 480px) {
  .tpl-ecommerce-return-triage .rt-chip-label {
    display: none;
  }
}

/* ---- main column ---- */
.tpl-ecommerce-return-triage .rt-scroll {
  height: 100%;
  min-height: 0;
  overflow-y: auto;
}
.tpl-ecommerce-return-triage .rt-main {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  min-width: 0;
}
.tpl-ecommerce-return-triage .rt-section-title {
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

/* ---- disposition tally strip (64px cells) ---- */
.tpl-ecommerce-return-triage .rt-tallies {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--spacing-2);
}
@media (max-width: 760px) {
  .tpl-ecommerce-return-triage .rt-tallies {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.tpl-ecommerce-return-triage .rt-tally {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  min-height: 64px;
  padding: 8px 12px;
  border: var(--border-width, 1px) solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-card);
  min-width: 0;
}
.tpl-ecommerce-return-triage .rt-tally-label {
  font-size: 10.5px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-ecommerce-return-triage .rt-tally-value {
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}
.tpl-ecommerce-return-triage .rt-tally-value.d-refund { color: ${_}; }
.tpl-ecommerce-return-triage .rt-tally-value.d-exchange { color: ${E}; }
.tpl-ecommerce-return-triage .rt-tally-value.d-deny { color: ${w}; }
.tpl-ecommerce-return-triage .rt-tally-sub {
  font-size: 10.5px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-ecommerce-return-triage .rt-pattern-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.tpl-ecommerce-return-triage .rt-pattern-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 999px;
  color: ${w};
  background: ${T};
}

/* ---- reason-cluster board: 2x2 lanes on desktop, 1-col <=760px ---- */
.tpl-ecommerce-return-triage .rt-board {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--spacing-3);
  align-items: start;
}
@media (max-width: 760px) {
  .tpl-ecommerce-return-triage .rt-board {
    grid-template-columns: minmax(0, 1fr);
  }
}
.tpl-ecommerce-return-triage .rt-lane {
  display: flex;
  flex-direction: column;
  border: var(--border-width, 1px) solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background-muted);
  padding: var(--spacing-2);
  gap: 8px;
  min-width: 0;
}
.tpl-ecommerce-return-triage .rt-lane-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  min-height: 40px;
  padding: 0 4px;
}
.tpl-ecommerce-return-triage .rt-lane-name {
  font-size: 12.5px;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-ecommerce-return-triage .rt-lane-meta {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.tpl-ecommerce-return-triage .rt-lane-empty {
  padding: var(--spacing-3);
  font-size: 12px;
  color: var(--color-text-secondary);
  text-align: center;
}

/* Case card — 92px min, real button. */
.tpl-ecommerce-return-triage .rt-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 92px;
  padding: 10px 12px;
  border-radius: 10px;
  border: var(--border-width, 1px) solid var(--color-border);
  background: var(--color-background-card);
  min-width: 0;
  transition: border-color 120ms ease, background-color 120ms ease;
}
.tpl-ecommerce-return-triage .rt-card[aria-pressed='true'] {
  border-color: ${_};
  box-shadow: inset 0 0 0 1px ${_};
  background: ${y};
}
.tpl-ecommerce-return-triage .rt-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
}
.tpl-ecommerce-return-triage .rt-card-rma {
  font-size: 11px;
  font-weight: 650;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}
.tpl-ecommerce-return-triage .rt-score-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  padding: 1px 7px;
  border-radius: 999px;
}
.tpl-ecommerce-return-triage .rt-score-pill.b-low { color: ${b}; background: ${x}; }
.tpl-ecommerce-return-triage .rt-score-pill.b-elevated { color: ${S}; background: ${C}; }
.tpl-ecommerce-return-triage .rt-score-pill.b-high { color: ${w}; background: ${T}; }
.tpl-ecommerce-return-triage .rt-card-name {
  font-size: 12.5px;
  font-weight: 550;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-ecommerce-return-triage .rt-card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
}
.tpl-ecommerce-return-triage .rt-grade {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-weight: 600;
}
.tpl-ecommerce-return-triage .rt-grade.g-transit {
  color: ${S};
}

/* ---- inspection detail panel ---- */
.tpl-ecommerce-return-triage .rt-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.tpl-ecommerce-return-triage .rt-panel-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 var(--spacing-3) var(--spacing-3);
}
.tpl-ecommerce-return-triage .rt-panel-head {
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tpl-ecommerce-return-triage .rt-panel-rma {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.tpl-ecommerce-return-triage .rt-panel-rma h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.tpl-ecommerce-return-triage .rt-cluster-chip {
  font-size: 10.5px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  border: var(--border-width, 1px) solid var(--color-border);
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.tpl-ecommerce-return-triage .rt-panel-sub {
  font-size: 11.5px;
  color: var(--color-text-secondary);
}
.tpl-ecommerce-return-triage .rt-block {
  padding: var(--spacing-2) 0;
  border-top: var(--border-width, 1px) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
.tpl-ecommerce-return-triage .rt-block-title {
  font-size: 10.5px;
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.tpl-ecommerce-return-triage .rt-item-name {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
}
.tpl-ecommerce-return-triage .rt-kv-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-2) var(--spacing-3);
}
.tpl-ecommerce-return-triage .rt-kv-label {
  font-size: 10px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.tpl-ecommerce-return-triage .rt-kv-value {
  font-size: 12.5px;
  font-weight: 550;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-ecommerce-return-triage .rt-note {
  font-size: 12px;
  line-height: 1.45;
  color: var(--color-text-secondary);
}

/* Fraud meter + signal rows (40px). */
.tpl-ecommerce-return-triage .rt-meter-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tpl-ecommerce-return-triage .rt-meter-svg {
  width: 100%;
  height: auto;
  display: block;
}
.tpl-ecommerce-return-triage .rt-signal-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 40px;
  border-bottom: var(--border-width, 1px) solid var(--color-border);
}
.tpl-ecommerce-return-triage .rt-signal-row:last-child {
  border-bottom: none;
}
.tpl-ecommerce-return-triage .rt-signal-label {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-ecommerce-return-triage .rt-signal-weight {
  flex: none;
  font-size: 11px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  padding: 1px 7px;
  border-radius: 999px;
  background: var(--color-background-muted);
  color: var(--color-text-secondary);
}
.tpl-ecommerce-return-triage .rt-signal-none {
  font-size: 12px;
  color: var(--color-text-secondary);
  padding: var(--spacing-2) 0;
}

/* Routing tray — 44px buttons; refuses while inbound. */
.tpl-ecommerce-return-triage .rt-tray {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
.tpl-ecommerce-return-triage .rt-tray-row {
  display: flex;
  gap: var(--spacing-2);
}
.tpl-ecommerce-return-triage .rt-route-btn {
  flex: 1 1 0;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 10px;
  border-radius: 10px;
  border: var(--border-width, 1px) solid var(--color-border);
  background: var(--color-background-card);
  font-size: 12.5px;
  font-weight: 650;
  transition: background-color 120ms ease, border-color 120ms ease;
}
.tpl-ecommerce-return-triage .rt-route-btn.d-refund { color: ${_}; }
.tpl-ecommerce-return-triage .rt-route-btn.d-exchange { color: ${E}; }
.tpl-ecommerce-return-triage .rt-route-btn.d-deny { color: ${w}; }
.tpl-ecommerce-return-triage .rt-route-btn.d-refund:not(:disabled):hover { background: ${y}; border-color: ${_}; }
.tpl-ecommerce-return-triage .rt-route-btn.d-exchange:not(:disabled):hover { background: ${D}; border-color: ${E}; }
.tpl-ecommerce-return-triage .rt-route-btn.d-deny:not(:disabled):hover { background: ${T}; border-color: ${w}; }
.tpl-ecommerce-return-triage .rt-route-btn:disabled {
  opacity: 0.45;
}
.tpl-ecommerce-return-triage .rt-tray-note {
  font-size: 11.5px;
  line-height: 1.4;
  color: var(--color-text-secondary);
}
.tpl-ecommerce-return-triage .rt-tray-note.is-blocked {
  color: ${S};
  font-weight: 550;
}
.tpl-ecommerce-return-triage .rt-routed-stamp {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  min-height: 44px;
  padding: 0 12px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 650;
}
.tpl-ecommerce-return-triage .rt-routed-stamp.d-refund { color: ${_}; background: ${y}; }
.tpl-ecommerce-return-triage .rt-routed-stamp.d-exchange { color: ${E}; background: ${D}; }
.tpl-ecommerce-return-triage .rt-routed-stamp.d-deny { color: ${w}; background: ${T}; }

/* Session log — 44px rows with per-row Undo. */
.tpl-ecommerce-return-triage .rt-log-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 44px;
  border-bottom: var(--border-width, 1px) solid var(--color-border);
}
.tpl-ecommerce-return-triage .rt-log-row:last-child {
  border-bottom: none;
}
.tpl-ecommerce-return-triage .rt-log-main {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.tpl-ecommerce-return-triage .rt-log-line {
  font-size: 12px;
  font-weight: 550;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-ecommerce-return-triage .rt-log-line .d-refund { color: ${_}; }
.tpl-ecommerce-return-triage .rt-log-line .d-exchange { color: ${E}; }
.tpl-ecommerce-return-triage .rt-log-line .d-deny { color: ${w}; }
.tpl-ecommerce-return-triage .rt-log-sub {
  font-size: 10.5px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-ecommerce-return-triage .rt-undo-btn {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 40px;
  padding: 0 10px;
  border-radius: 8px;
  border: var(--border-width, 1px) solid var(--color-border);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--color-text-secondary);
}
.tpl-ecommerce-return-triage .rt-undo-btn:hover {
  background: var(--color-background-muted);
}
.tpl-ecommerce-return-triage .rt-log-empty {
  font-size: 12px;
  color: var(--color-text-secondary);
  padding: var(--spacing-2) 0;
}

/* Reduced motion: collapse the only transitions (color-only). */
@media (prefers-reduced-motion: reduce) {
  .tpl-ecommerce-return-triage .rt-card,
  .tpl-ecommerce-return-triage .rt-route-btn {
    transition: none;
  }
}
`,k=[{id:`fit`,name:`Fit & sizing`,hint:`size swaps, comfort returns`},{id:`damaged`,name:`Damaged in transit`,hint:`carrier claims eligible`},{id:`nad`,name:`Not as described`,hint:`listing accuracy review`},{id:`mind`,name:`Changed mind`,hint:`standard 30-day window`}],A={velocity:{label:`High return velocity (4+ in 90d)`,weight:25,pattern:`Velocity abuse`},serial:{label:`Serial number mismatch vs shipped unit`,weight:40,pattern:`Serial swap`},wardrobe:{label:`Wear indicators on inspection photos`,weight:20,pattern:`Wardrobing`},window:{label:`Filed on last eligible day of window`,weight:10,pattern:`Window gaming`},priceDrop:{label:`Repurchased same SKU at lower price`,weight:30,pattern:`Price arbitrage`},address:{label:`Return address differs from delivery`,weight:15,pattern:`Address mismatch`},shortWeight:{label:`Inbound parcel 38% under shipped weight`,weight:35,pattern:`Short-ship weight`},emptyBox:{label:`Prior empty-box claim on account`,weight:45,pattern:`Empty box`}};function j(e){let t=e.signals.reduce((e,t)=>e+A[t].weight,0);return Math.min(100,t)}function M(e){return e>=60?`high`:e>=30?`elevated`:`low`}var N={low:`low`,elevated:`elevated`,high:`high`};function P(e){return e.signals.length===0?null:A[[...e.signals].sort((e,t)=>A[t].weight-A[e].weight)[0]].pattern}function F(e){let t=Math.floor(e/100),n=String(e%100).padStart(2,`0`);return`$${t.toLocaleString(`en-US`)}.${n}`}var I=[{id:`RMA-30412`,orderId:`ORD-88213`,cluster:`fit`,customer:{name:`Dana Whitfield`,lifetimeOrders:24,returns12mo:1},item:{sku:`FW-2214-95`,name:`Meridian Trail Runner GTX Low, Basalt, W 9.5`,price:`$129.00`,priceCents:12900},requested:`exchange`,grade:`A`,daysSinceDelivery:6,photos:2,signals:[],note:`Runs a half size small per customer; wants W 10. Box and tags intact — clean exchange candidate.`},{id:`RMA-30398`,orderId:`ORD-88102`,cluster:`fit`,customer:{name:`Miles Arceneaux`,lifetimeOrders:7,returns12mo:2},item:{sku:`AP-1108-MS`,name:`Halcyon Merino Base Layer Crew, Heather Slate, M`,price:`$78.00`,priceCents:7800},requested:`refund`,grade:`B`,daysSinceDelivery:12,photos:1,signals:[`window`],note:`Filed on day 30 of 30. Light pilling at cuff — grade B; resellable as open-box.`},{id:`RMA-30371`,orderId:`ORD-87944`,cluster:`fit`,customer:{name:`Priya Raghunathan`,lifetimeOrders:41,returns12mo:5},item:{sku:`AP-3301-CL`,name:`Northgate Alpine Bib, Carbon, L — pro fit kit with suspenders and gusset`,price:`$249.00`,priceCents:24900},requested:`exchange`,grade:`A`,daysSinceDelivery:3,photos:3,signals:[`velocity`],note:`Fifth return this year but all size-related; account is high-LTV. Wants XL.`},{id:`RMA-30355`,orderId:`ORD-87820`,cluster:`fit`,customer:{name:`Renata Solis`,lifetimeOrders:3,returns12mo:2},item:{sku:`AP-1740-TS`,name:`Coveline Wrap Dress, Terracotta, S`,price:`$96.00`,priceCents:9600},requested:`refund`,grade:null,daysSinceDelivery:9,photos:0,signals:[`velocity`,`address`],note:`Label created, parcel not yet scanned at dock. Return address differs from delivery address.`},{id:`RMA-30340`,orderId:`ORD-87701`,cluster:`fit`,customer:{name:`Theo Brandt`,lifetimeOrders:12,returns12mo:4},item:{sku:`FW-4410-44`,name:`Ferro Cycling Shoe SPD, 44`,price:`$145.00`,priceCents:14500},requested:`refund`,grade:`C`,daysSinceDelivery:27,photos:4,signals:[`wardrobe`,`window`,`velocity`],note:`Cleat marks and sole wear across 27 days — inspection photos show sustained outdoor use.`},{id:`RMA-30410`,orderId:`ORD-88190`,cluster:`damaged`,customer:{name:`June Okonkwo`,lifetimeOrders:18,returns12mo:0},item:{sku:`HM-5521-JN`,name:`Lumen 4-qt Enameled Dutch Oven, Juniper`,price:`$89.00`,priceCents:8900},requested:`refund`,grade:`C`,daysSinceDelivery:4,photos:4,signals:[],note:`Chipped enamel on rim, carton crushed at corner. Carrier claim CL-99120 already opened.`},{id:`RMA-30402`,orderId:`ORD-88144`,cluster:`damaged`,customer:{name:`Harlan Pruitt`,lifetimeOrders:5,returns12mo:1},item:{sku:`EL-7788-4K`,name:`Solace 27-inch 4K Monitor`,price:`$329.00`,priceCents:32900},requested:`refund`,grade:`C`,daysSinceDelivery:2,photos:5,signals:[`shortWeight`],note:`Panel cracked — but inbound parcel weighed 38% under shipped. Verify panel serial before crediting.`},{id:`RMA-30389`,orderId:`ORD-88061`,cluster:`damaged`,customer:{name:`Sofia Marchetti`,lifetimeOrders:9,returns12mo:1},item:{sku:`HM-3302-BR`,name:`Aria Table Lamp, Brass`,price:`$64.00`,priceCents:6400},requested:`refund`,grade:null,daysSinceDelivery:5,photos:2,signals:[],note:`Customer photos show bent shade arm. Parcel inbound — carrier scan expected tomorrow.`},{id:`RMA-30366`,orderId:`ORD-87890`,cluster:`damaged`,customer:{name:`Wes Tanaka`,lifetimeOrders:31,returns12mo:2},item:{sku:`HM-6114-GS`,name:`Cascade 12-pc Glassware Set`,price:`$48.00`,priceCents:4800},requested:`exchange`,grade:`C`,daysSinceDelivery:8,photos:3,signals:[],note:`Three tumblers shattered; rest intact. Customer wants a replacement set, not credit.`},{id:`RMA-30351`,orderId:`ORD-87766`,cluster:`damaged`,customer:{name:`Gable Fontaine`,lifetimeOrders:4,returns12mo:3},item:{sku:`EL-2200-PB`,name:`Voltaic 20,000 mAh Power Bank`,price:`$59.00`,priceCents:5900},requested:`refund`,grade:`B`,daysSinceDelivery:15,photos:1,signals:[`emptyBox`,`shortWeight`],note:`"Arrived dead" claim; unit received is a different production batch. Account has a prior empty-box claim.`},{id:`RMA-30407`,orderId:`ORD-88171`,cluster:`nad`,customer:{name:`Imogen Vasquez`,lifetimeOrders:14,returns12mo:1},item:{sku:`BD-8812-QF`,name:`Juniper & Ash Linen Duvet, Queen, Fog`,price:`$168.00`,priceCents:16800},requested:`refund`,grade:`A`,daysSinceDelivery:7,photos:2,signals:[`priceDrop`],note:`"Grayer than photos." Same SKU repurchased 40 minutes later at the markdown price.`},{id:`RMA-30393`,orderId:`ORD-88077`,cluster:`nad`,customer:{name:`Corin Ashby`,lifetimeOrders:6,returns12mo:4},item:{sku:`EL-9903-WN`,name:`Backbeat Studio Headphones, Walnut`,price:`$199.00`,priceCents:19900},requested:`refund`,grade:`B`,daysSinceDelivery:10,photos:3,signals:[`serial`,`priceDrop`],note:`Returned unit serial does not match the shipped unit. Shipped serial still registers online weekly.`},{id:`RMA-30377`,orderId:`ORD-87961`,cluster:`nad`,customer:{name:`Anselm Duarte`,lifetimeOrders:22,returns12mo:1},item:{sku:`HM-4419-PO`,name:`Tessera Ceramic Pour-Over Set`,price:`$54.00`,priceCents:5400},requested:`exchange`,grade:`A`,daysSinceDelivery:5,photos:1,signals:[],note:`Listing said 4-cup; carafe is 2-cup. Listing copy fix filed as CX-4471. Wants the larger set.`},{id:`RMA-30348`,orderId:`ORD-87712`,cluster:`nad`,customer:{name:`Lena Korhonen`,lifetimeOrders:10,returns12mo:3},item:{sku:`BG-1177-35`,name:`Atlas Convertible Backpack 35L`,price:`$139.00`,priceCents:13900},requested:`refund`,grade:`B`,daysSinceDelivery:21,photos:2,signals:[`wardrobe`,`window`],note:`Airline tag residue on handle; "straps thinner than advertised." Filed on final eligible day.`},{id:`RMA-30405`,orderId:`ORD-88160`,cluster:`mind`,customer:{name:`Ottilie Reyes`,lifetimeOrders:16,returns12mo:1},item:{sku:`HM-2216-OT`,name:`Fable & Fir Wool Throw, Oat`,price:`$72.00`,priceCents:7200},requested:`refund`,grade:`A`,daysSinceDelivery:3,photos:0,signals:[],note:`Unopened, gift duplicate. Straightforward restock.`},{id:`RMA-30386`,orderId:`ORD-88019`,cluster:`mind`,customer:{name:`Booker Lindqvist`,lifetimeOrders:8,returns12mo:0},item:{sku:`HM-7730-CI`,name:`Kindling Cast Iron Skillet, 12-inch`,price:`$45.00`,priceCents:4500},requested:`refund`,grade:`A`,daysSinceDelivery:6,photos:0,signals:[],note:`Never seasoned, factory wax intact. First return on the account.`},{id:`RMA-30362`,orderId:`ORD-87858`,cluster:`mind`,customer:{name:`Saskia Ferreira`,lifetimeOrders:2,returns12mo:2},item:{sku:`KA-8850-EG`,name:`Sundial Espresso Grinder`,price:`$289.00`,priceCents:28900},requested:`refund`,grade:`A`,daysSinceDelivery:1,photos:1,signals:[`velocity`,`priceDrop`],note:`Returned day after delivery; identical grinder ordered from the outlet listing at $214.`},{id:`RMA-30337`,orderId:`ORD-87655`,cluster:`mind`,customer:{name:`Ezra Nakagawa`,lifetimeOrders:27,returns12mo:2},item:{sku:`OF-3340-XL`,name:`Prism Desk Mat XL, Charcoal`,price:`$32.00`,priceCents:3200},requested:`refund`,grade:`B`,daysSinceDelivery:18,photos:0,signals:[`window`],note:`Desk rearranged; mat no longer fits. Minor corner curl — grade B.`}];function L(e){return I.find(t=>t.id===e)??I[0]}var R=`Thu Jul 9 · shift A · dock 3`,z=`M. Calloway`,B={refund:{label:`Refund`,pastLabel:`Refunded`,className:`d-refund`},exchange:{label:`Exchange`,pastLabel:`Exchanged`,className:`d-exchange`},deny:{label:`Deny`,pastLabel:`Denied`,className:`d-deny`}};function V(){return(0,g.jsxs)(`svg`,{width:`18`,height:`18`,viewBox:`0 0 18 18`,"aria-hidden":!0,children:[(0,g.jsx)(`rect`,{x:`2`,y:`7`,width:`14`,height:`9`,rx:`1.5`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`}),(0,g.jsx)(`path`,{d:`M13 4.5 H7.5 M7.5 4.5 L10 2 M7.5 4.5 L10 7`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,strokeLinecap:`round`,strokeLinejoin:`round`})]})}function H({score:e,band:t}){let n=e=>8+284*e/100,r=n(e),i=t===`high`?w:t===`elevated`?S:b;return(0,g.jsxs)(`svg`,{className:`rt-meter-svg`,viewBox:`0 0 300 62`,role:`img`,"aria-label":`Fraud signal meter: score ${e} of 100, ${N[t]} band`,children:[(0,g.jsx)(`rect`,{x:n(0),y:24,width:n(30)-n(0),height:14,rx:3,style:{fill:x}}),(0,g.jsx)(`rect`,{x:n(30),y:24,width:n(60)-n(30),height:14,style:{fill:C}}),(0,g.jsx)(`rect`,{x:n(60),y:24,width:n(100)-n(60),height:14,rx:3,style:{fill:T}}),[30,60].map(e=>(0,g.jsx)(`line`,{x1:n(e),y1:22,x2:n(e),y2:40,stroke:`var(--color-border)`,strokeWidth:1},e)),(0,g.jsx)(`rect`,{x:n(0),y:28,width:Math.max(0,r-n(0)),height:6,rx:3,style:{fill:i}}),(0,g.jsx)(`polygon`,{points:`${r-5},14 ${r+5},14 ${r},23`,style:{fill:i}}),(0,g.jsx)(`text`,{x:Math.min(Math.max(r,22),278),y:10,textAnchor:`middle`,style:{fill:i,fontSize:12,fontWeight:700,fontVariantNumeric:`tabular-nums`},children:e}),(0,g.jsx)(`text`,{x:n(0),y:54,style:{fill:`var(--color-text-secondary)`,fontSize:9},children:`0 · low`}),(0,g.jsx)(`text`,{x:n(30),y:54,style:{fill:`var(--color-text-secondary)`,fontSize:9},children:`30 · elevated`}),(0,g.jsx)(`text`,{x:n(60),y:54,style:{fill:`var(--color-text-secondary)`,fontSize:9},children:`60 · high`}),(0,g.jsx)(`text`,{x:n(100),y:54,textAnchor:`end`,style:{fill:`var(--color-text-secondary)`,fontSize:9},children:`100`})]})}var U=[{caseId:`RMA-30405`,disposition:`refund`},{caseId:`RMA-30393`,disposition:`deny`}];function W(){let e=m(),t=p(`(max-width: 760px)`),[n,_]=(0,h.useState)(U),[v,y]=(0,h.useState)(`RMA-30402`),[b,x]=(0,h.useState)(``),S=(0,h.useMemo)(()=>{let e=new Map;for(let t of n)e.set(t.caseId,t.disposition);return e},[n]),C=I.filter(e=>!S.has(e.id)),w=n.filter(e=>e.disposition===`refund`).reduce((e,t)=>e+L(t.caseId).item.priceCents,0),T=n.filter(e=>e.disposition===`exchange`).length,E=n.filter(e=>e.disposition===`deny`).length,D=(0,h.useMemo)(()=>{let e=new Map;for(let t of n){if(t.disposition!==`deny`)continue;let n=L(t.caseId);if(j(n)<60)continue;let r=P(n);r!==null&&e.set(r,(e.get(r)??0)+1)}return e},[n]),N=[...D.values()].reduce((e,t)=>e+t,0),W=L(v),G=j(W),K=M(G),q=S.get(v)??null,J=W.grade===null,Y=e=>C.filter(t=>t.cluster===e),te=e=>Y(e).reduce((e,t)=>e+t.item.priceCents,0),X=(t,r)=>{let i=L(t);if(i.grade===null||S.has(t))return;let a=[...n,{caseId:t,disposition:r}];_(a);let o=j(i),s=r===`deny`&&o>=60?P(i):null,c=r===`refund`?` ${F(i.item.priceCents)}`:``;e({body:`${i.id} → ${B[r].pastLabel}${c}${s===null?``:` · pattern flagged: ${s}`}`,isAutoHide:!0}),x(`${i.id} routed ${B[r].label}. ${I.length-a.length} cases open.${s===null?``:` Fraud pattern ${s} flagged.`}`)},Z=t=>{let n=L(t);_(e=>e.filter(e=>e.caseId!==t)),y(t),e({body:`${n.id} routing undone — back in triage`,isAutoHide:!0}),x(`${n.id} routing undone. Case returned to its lane.`)},ne=(0,g.jsx)(`section`,{"aria-label":`Disposition tallies`,children:(0,g.jsxs)(`div`,{className:`rt-tallies`,children:[(0,g.jsxs)(`div`,{className:`rt-tally`,children:[(0,g.jsx)(`span`,{className:`rt-tally-label`,children:`Refunded`}),(0,g.jsx)(`span`,{className:`rt-tally-value d-refund`,children:F(w)}),(0,g.jsxs)(`span`,{className:`rt-tally-sub`,children:[n.filter(e=>e.disposition===`refund`).length,` case`,n.filter(e=>e.disposition===`refund`).length===1?``:`s`,` `,`this session`]})]}),(0,g.jsxs)(`div`,{className:`rt-tally`,children:[(0,g.jsx)(`span`,{className:`rt-tally-label`,children:`Exchanges`}),(0,g.jsx)(`span`,{className:`rt-tally-value d-exchange`,children:T}),(0,g.jsx)(`span`,{className:`rt-tally-sub`,children:`replacement units queued`})]}),(0,g.jsxs)(`div`,{className:`rt-tally`,children:[(0,g.jsx)(`span`,{className:`rt-tally-label`,children:`Denied`}),(0,g.jsx)(`span`,{className:`rt-tally-value d-deny`,children:E}),(0,g.jsxs)(`span`,{className:`rt-tally-sub`,children:[F(n.filter(e=>e.disposition===`deny`).reduce((e,t)=>e+L(t.caseId).item.priceCents,0)),` `,`loss avoided`]})]}),(0,g.jsxs)(`div`,{className:`rt-tally`,children:[(0,g.jsx)(`span`,{className:`rt-tally-label`,children:`Fraud patterns flagged`}),(0,g.jsx)(`span`,{className:`rt-tally-value`,children:N}),D.size===0?(0,g.jsx)(`span`,{className:`rt-tally-sub`,children:`denials at score ≥60 flag here`}):(0,g.jsx)(`span`,{className:`rt-pattern-chips`,children:[...D.entries()].map(([e,t])=>(0,g.jsxs)(`span`,{className:`rt-pattern-chip`,children:[e,t>1?` ×${t}`:``]},e))})]})]})}),re=(0,g.jsx)(`section`,{"aria-label":`Reason-cluster triage board`,children:(0,g.jsx)(`div`,{className:`rt-board`,children:k.map(e=>{let t=Y(e.id);return(0,g.jsxs)(`div`,{className:`rt-lane`,children:[(0,g.jsxs)(`div`,{className:`rt-lane-head`,children:[(0,g.jsxs)(`span`,{style:{minWidth:0},children:[(0,g.jsx)(`span`,{className:`rt-lane-name`,children:e.name}),(0,g.jsx)(`br`,{}),(0,g.jsx)(`span`,{className:`rt-lane-meta`,children:e.hint})]}),(0,g.jsxs)(`span`,{className:`rt-lane-meta rt-num`,children:[t.length,` open · `,F(te(e.id))]})]}),t.length===0?(0,g.jsx)(`div`,{className:`rt-lane-empty`,children:`Lane clear — every case routed. Undo from the session log to reopen one.`}):t.map(e=>{let t=j(e),n=M(t);return(0,g.jsxs)(`button`,{type:`button`,className:`rt-card`,"aria-pressed":e.id===v,"aria-label":`${e.id}, ${e.item.name}, fraud score ${t}, ${e.grade===null?`inbound`:`grade ${e.grade}`}`,onClick:()=>y(e.id),children:[(0,g.jsxs)(`span`,{className:`rt-card-top`,children:[(0,g.jsx)(`span`,{className:`rt-card-rma`,children:e.id}),(0,g.jsx)(`span`,{className:`rt-score-pill b-${n}`,children:t})]}),(0,g.jsx)(`span`,{className:`rt-card-name`,children:e.item.name}),(0,g.jsxs)(`span`,{className:`rt-card-meta`,children:[(0,g.jsx)(`span`,{children:e.item.price}),(0,g.jsx)(`span`,{children:`·`}),(0,g.jsxs)(`span`,{children:[e.daysSinceDelivery,`d since delivery`]}),(0,g.jsx)(`span`,{children:`·`}),e.grade===null?(0,g.jsxs)(`span`,{className:`rt-grade g-transit`,children:[(0,g.jsx)(r,{icon:s,size:`xsm`,color:`inherit`}),`inbound`]}):(0,g.jsxs)(`span`,{className:`rt-grade`,children:[`grade `,e.grade]})]})]},e.id)})]},e.id)})})}),Q=k.find(e=>e.id===W.cluster)??k[0],ie=(0,g.jsx)(`div`,{className:`rt-tray`,role:`group`,"aria-label":`Route ${W.id}`,children:q===null?(0,g.jsxs)(g.Fragment,{children:[(0,g.jsxs)(`div`,{className:`rt-tray-row`,children:[(0,g.jsxs)(`button`,{type:`button`,className:`rt-route-btn d-refund`,disabled:J,onClick:()=>X(W.id,`refund`),children:[(0,g.jsx)(r,{icon:l,size:`sm`,color:`inherit`}),`Refund`]}),(0,g.jsxs)(`button`,{type:`button`,className:`rt-route-btn d-exchange`,disabled:J,onClick:()=>X(W.id,`exchange`),children:[(0,g.jsx)(r,{icon:i,size:`sm`,color:`inherit`}),`Exchange`]}),(0,g.jsxs)(`button`,{type:`button`,className:`rt-route-btn d-deny`,disabled:J,onClick:()=>X(W.id,`deny`),children:[(0,g.jsx)(r,{icon:a,size:`sm`,color:`inherit`}),`Deny`]})]}),J?(0,g.jsx)(`div`,{className:`rt-tray-note is-blocked`,children:`Routing blocked — no arrival scan yet. Grade the unit at the dock before any disposition.`}):(0,g.jsxs)(`div`,{className:`rt-tray-note`,children:[`Refund credits `,F(W.item.priceCents),` to the original tender. Denying at score ≥60 flags the case's fraud pattern.`]})]}):(0,g.jsxs)(g.Fragment,{children:[(0,g.jsxs)(`div`,{className:`rt-routed-stamp ${B[q].className}`,children:[(0,g.jsxs)(`span`,{children:[B[q].pastLabel,q===`refund`?` ${F(W.item.priceCents)}`:``]}),(0,g.jsxs)(`button`,{type:`button`,className:`rt-undo-btn`,onClick:()=>Z(W.id),children:[(0,g.jsx)(r,{icon:c,size:`xsm`,color:`inherit`}),`Undo`]})]}),(0,g.jsxs)(`div`,{className:`rt-tray-note`,children:[`Undo returns `,W.id,` to the `,Q.name,` lane and reverses every tally it moved.`]})]})}),ae=(0,g.jsxs)(`div`,{className:`rt-block`,children:[(0,g.jsx)(`span`,{className:`rt-block-title`,children:`Session log`}),n.length===0?(0,g.jsx)(`div`,{className:`rt-log-empty`,children:`No routings yet this session — dispositions land here with an undo.`}):[...n].reverse().map(e=>{let t=L(e.caseId);return(0,g.jsxs)(`div`,{className:`rt-log-row`,children:[(0,g.jsxs)(`div`,{className:`rt-log-main`,children:[(0,g.jsxs)(`span`,{className:`rt-log-line`,children:[t.id,` →`,` `,(0,g.jsxs)(`span`,{className:B[e.disposition].className,children:[B[e.disposition].pastLabel,e.disposition===`refund`?` ${F(t.item.priceCents)}`:``]})]}),(0,g.jsx)(`span`,{className:`rt-log-sub`,children:t.item.name})]}),(0,g.jsxs)(`button`,{type:`button`,className:`rt-undo-btn`,"aria-label":`Undo routing for ${t.id}`,onClick:()=>Z(e.caseId),children:[(0,g.jsx)(r,{icon:c,size:`xsm`,color:`inherit`}),`Undo`]})]},e.caseId)})]}),$=(0,g.jsxs)(`div`,{className:`rt-panel`,children:[(0,g.jsxs)(`div`,{className:`rt-panel-head`,children:[(0,g.jsxs)(`div`,{className:`rt-panel-rma`,children:[(0,g.jsx)(`h2`,{children:W.id}),(0,g.jsx)(`span`,{className:`rt-cluster-chip`,children:Q.name})]}),(0,g.jsxs)(`span`,{className:`rt-panel-sub`,children:[W.orderId,` · requested`,` `,W.requested===`refund`?`refund`:`exchange`,` ·`,` `,W.photos,` photo`,W.photos===1?``:`s`,` on file`]})]}),(0,g.jsxs)(`div`,{className:`rt-panel-scroll`,children:[(0,g.jsxs)(`div`,{className:`rt-block`,children:[(0,g.jsx)(`span`,{className:`rt-block-title`,children:`Item`}),(0,g.jsx)(`span`,{className:`rt-item-name`,children:W.item.name}),(0,g.jsxs)(`div`,{className:`rt-kv-grid`,children:[(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`div`,{className:`rt-kv-label`,children:`SKU`}),(0,g.jsx)(`div`,{className:`rt-kv-value`,children:W.item.sku})]}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`div`,{className:`rt-kv-label`,children:`Value`}),(0,g.jsx)(`div`,{className:`rt-kv-value`,children:W.item.price})]}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`div`,{className:`rt-kv-label`,children:`Condition`}),(0,g.jsx)(`div`,{className:`rt-kv-value`,children:W.grade===null?`inbound`:`grade ${W.grade}`})]})]}),(0,g.jsx)(`p`,{className:`rt-note`,children:W.note})]}),(0,g.jsxs)(`div`,{className:`rt-block`,children:[(0,g.jsx)(`span`,{className:`rt-block-title`,children:`Customer`}),(0,g.jsxs)(`div`,{className:`rt-kv-grid`,children:[(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`div`,{className:`rt-kv-label`,children:`Name`}),(0,g.jsx)(`div`,{className:`rt-kv-value`,children:W.customer.name})]}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`div`,{className:`rt-kv-label`,children:`Lifetime orders`}),(0,g.jsx)(`div`,{className:`rt-kv-value`,children:W.customer.lifetimeOrders})]}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`div`,{className:`rt-kv-label`,children:`Returns · 12 mo`}),(0,g.jsx)(`div`,{className:`rt-kv-value`,children:W.customer.returns12mo})]})]})]}),(0,g.jsxs)(`div`,{className:`rt-block`,children:[(0,g.jsxs)(`span`,{className:`rt-block-title`,children:[`Fraud signals — score `,G,`/100`]}),(0,g.jsx)(`div`,{className:`rt-meter-wrap`,children:(0,g.jsx)(H,{score:G,band:K})}),W.signals.length===0?(0,g.jsx)(`div`,{className:`rt-signal-none`,children:`No fraud signals on this case — the meter reads 0.`}):W.signals.map(e=>(0,g.jsxs)(`div`,{className:`rt-signal-row`,children:[(0,g.jsx)(`span`,{className:`rt-signal-label`,children:A[e].label}),(0,g.jsxs)(`span`,{className:`rt-signal-weight`,children:[`+`,A[e].weight]})]},e))]}),(0,g.jsxs)(`div`,{className:`rt-block`,children:[(0,g.jsx)(`span`,{className:`rt-block-title`,children:`Refund routing`}),ie]}),ae]})]});return(0,g.jsxs)(`div`,{className:`tpl-ecommerce-return-triage`,children:[(0,g.jsx)(`style`,{children:O}),(0,g.jsx)(u,{height:`fill`,header:(0,g.jsx)(d,{hasDivider:!0,children:(0,g.jsxs)(`div`,{className:`rt-header`,children:[(0,g.jsx)(`span`,{className:`rt-mark`,"aria-hidden":!0,children:(0,g.jsx)(V,{})}),(0,g.jsxs)(`div`,{className:`rt-header-id`,children:[(0,g.jsx)(`h1`,{className:`rt-header-title`,children:`Retriage · Returns Triage`}),(0,g.jsxs)(`div`,{className:`rt-header-sub`,children:[R,` · inspector `,z]})]}),(0,g.jsxs)(`div`,{className:`rt-header-chips`,children:[(0,g.jsxs)(`span`,{className:`rt-chip`,children:[(0,g.jsx)(r,{icon:o,size:`xsm`,color:`secondary`}),(0,g.jsx)(`span`,{className:`rt-chip-label`,children:`Open`}),(0,g.jsxs)(`b`,{children:[C.length,`/`,I.length]})]}),(0,g.jsxs)(`span`,{className:`rt-chip`,children:[(0,g.jsx)(`span`,{className:`rt-chip-label`,children:`Refunded`}),(0,g.jsx)(`b`,{children:F(w)})]})]})]})}),end:t?void 0:(0,g.jsx)(f,{hasDivider:!0,width:360,padding:0,label:`Inspection detail`,children:$}),content:(0,g.jsxs)(ee,{padding:0,children:[(0,g.jsx)(`div`,{"aria-live":`polite`,className:`rt-vh`,children:b}),(0,g.jsx)(`div`,{className:`rt-scroll`,children:(0,g.jsxs)(`div`,{className:`rt-main`,children:[ne,re,t&&$]})})]})})]})}export{W as default};