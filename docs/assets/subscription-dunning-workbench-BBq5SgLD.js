import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-zBEZLbyF.js";import{t as i}from"./Icon-C7Tu044I.js";import{t as a}from"./badge-check-DLU_OC_7.js";import{t as o}from"./circle-dollar-sign-CtOxflqM.js";import{t as s}from"./credit-card-BNz-tDp5.js";import{t as c}from"./flag-TYtlXcFG.js";import{t as l}from"./rotate-ccw-ByfrhOGN.js";import{t as u}from"./send-BCcYh7fj.js";import{t as d}from"./shield-alert-DgzMBwN5.js";import{t as f}from"./split-DXz19grD.js";import{i as p}from"./index-Csn9cgK2.js";import{t as m}from"./HStack-2WTukjNp.js";import{t as h}from"./VStack-B8U-hI0Y.js";import{t as g}from"./StackItem-Ca9P7L2I.js";import{n as ee,t as _}from"./LayoutContent-CCL91W7X.js";import{t as v}from"./LayoutHeader-Cy2mWoMf.js";import{t as y}from"./Heading-7iAMrwFB.js";import{t as b}from"./Button-DSFH9r96.js";import{t as x}from"./Divider-BHIBe6GQ.js";import{t as S}from"./Token-cKlN-xvK.js";import{t as C}from"./Avatar-DyaNw-yT.js";var w=e(t(),1),T=n(),E=`light-dark(#1D39C4, #91A7FF)`,D=`light-dark(rgba(29, 57, 196, 0.08), rgba(145, 167, 255, 0.14))`,O=`light-dark(#0B7A2C, #4ADE80)`,k=`light-dark(rgba(11, 122, 44, 0.10), rgba(74, 222, 128, 0.14))`,A=`light-dark(#A16207, #FBBF24)`,j=`light-dark(rgba(161, 98, 7, 0.12), rgba(251, 191, 36, 0.16))`,M=`light-dark(#DC2626, #F87171)`,N=`light-dark(rgba(220, 38, 38, 0.08), rgba(248, 113, 113, 0.14))`,P=`light-dark(rgba(60, 60, 67, 0.18), rgba(235, 235, 245, 0.20))`,F=12,I=`var(--font-family-code, ui-monospace, monospace)`,L=`tpl-subscription-dunning-workbench`,te=`
.${L} {
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.${L}.sdw-root { height: 100dvh; width: 100%; }
.${L} button { font-family: inherit; }
.${L} .sdw-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.${L} .sdw-fade { transition: background-color 160ms ease, opacity 160ms ease, border-color 160ms ease; }
@media (prefers-reduced-motion: reduce) {
  .${L} .sdw-fade { transition: none; }
}

/* Header bar 52px ---------------------------------------------------------*/
.${L} .sdw-header {
  display: flex;
  align-items: center;
  gap: ${F}px;
  height: 52px;
  padding: 0 ${F}px;
}
.${L} .sdw-mono {
  font-family: ${I};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${L} .sdw-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${L} .sdw-forecast-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: var(--border-width) solid ${E};
  background: ${D};
  color: ${E};
  white-space: nowrap;
}
.${L} .sdw-ticker {
  font-size: 12px;
  color: var(--color-text-secondary);
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Funnel strip 96px -------------------------------------------------------*/
.${L} .sdw-funnel {
  display: flex;
  align-items: stretch;
  gap: ${F/2}px;
  height: 96px;
  padding: ${F/2}px ${F}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}
.${L} .sdw-funnel.is-narrow { flex-wrap: wrap; height: auto; }
.${L} .sdw-stage {
  appearance: none;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  background: transparent;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: 3px;
  padding: 0 ${F}px;
  cursor: pointer;
  text-align: left;
  color: var(--color-text-primary);
}
.${L} .sdw-funnel.is-narrow .sdw-stage { flex: 1 1 40%; min-height: 64px; }
.${L} .sdw-stage[aria-pressed='true'] {
  border-color: ${E};
  background: ${D};
}
.${L} .sdw-stage-bar {
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: var(--color-border);
  position: relative;
  overflow: hidden;
}
.${L} .sdw-stage-bar > span {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  border-radius: 999px;
}
.${L} .sdw-stage-arrow {
  align-self: center;
  flex-shrink: 0;
  color: var(--color-text-secondary);
  display: inline-flex;
}

/* View root + queue -------------------------------------------------------*/
.${L} .sdw-view {
  display: flex;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  position: relative;
}
.${L} .sdw-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.${L} .sdw-axis {
  display: flex;
  align-items: stretch;
  gap: ${F}px;
  height: 32px;
  padding: 0 ${F}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}
.${L} .sdw-scroll { flex: 1; min-height: 0; overflow-y: auto; }
.${L} .sdw-queue-footer {
  display: flex;
  align-items: center;
  gap: ${F}px;
  height: 32px;
  padding: 0 ${F}px;
  border-top: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
  overflow: hidden;
}

/* Account rows 64px -------------------------------------------------------*/
.${L} .sdw-row {
  appearance: none;
  border: none;
  border-bottom: var(--border-width) solid var(--color-border);
  background: transparent;
  display: flex;
  align-items: center;
  gap: ${F}px;
  width: 100%;
  min-height: 64px;
  padding: 0 ${F}px;
  cursor: pointer;
  text-align: left;
  color: var(--color-text-primary);
}
.${L} .sdw-row[aria-pressed='true'] { background: var(--color-background-muted); }
.${L} .sdw-row-accent {
  width: 3px;
  align-self: stretch;
  flex-shrink: 0;
  margin-left: -${F}px;
}
.${L} .sdw-id-col {
  width: 176px;
  min-width: 0;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.${L} .sdw-id-col.is-wide { width: 220px; }
.${L} .sdw-company {
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${L} .sdw-row-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
}
.${L} .sdw-decline-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  font-family: ${I};
  font-size: 10px;
  white-space: nowrap;
  flex-shrink: 0;
}
.${L} .sdw-decline-pip {
  width: 8px;
  height: 8px;
  border-radius: 2px; /* square pip = decline family, round dot = attempt */
  flex-shrink: 0;
}
.${L} .sdw-mrr-col {
  width: 72px;
  flex-shrink: 0;
  text-align: right;
  font-family: ${I};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

/* Timeline lane 24px ------------------------------------------------------*/
.${L} .sdw-lane-col { flex: 1; min-width: 120px; position: relative; }
/* .sdw-lane is a <span> inside a non-flex parent — inline boxes ignore
   height, so it must be display:block for the 24px lane to exist. */
.${L} .sdw-lane { position: relative; height: 24px; display: block; }
.${L} .sdw-lane-day-label { display: block; }
.${L} .sdw-lane-track {
  position: absolute;
  left: 0;
  right: 0;
  top: 11px;
  height: 2px;
  background: var(--color-border);
}
.${L} .sdw-lane-hatch {
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(45deg, ${P} 0px, ${P} 2px, transparent 2px, transparent 8px);
}
.${L} .sdw-dot {
  position: absolute;
  top: 8px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  transform: translateX(-50%);
}
.${L} .sdw-slash {
  position: absolute;
  top: 11px;
  width: 12px;
  height: 2px;
  transform: translateX(-50%) rotate(-45deg);
}
.${L} .sdw-today {
  position: absolute;
  top: 2px;
  bottom: 2px;
  width: 2px;
  transform: translateX(-50%);
  background: var(--color-text-secondary);
}
.${L} .sdw-axis-lane { position: relative; flex: 1; min-width: 120px; }
.${L} .sdw-axis-tick {
  position: absolute;
  bottom: 0;
  width: 1px;
  height: 6px;
  background: var(--color-border);
  transform: translateX(-50%);
}
.${L} .sdw-axis-num {
  position: absolute;
  bottom: 8px;
  transform: translateX(-50%);
  font-family: ${I};
  font-size: 10px;
  color: var(--color-text-secondary);
}

/* Aside — PlaybookPane ----------------------------------------------------*/
.${L} .sdw-aside {
  flex: none;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-left: var(--border-width) solid var(--color-border);
  background: var(--color-background);
}
.${L} .sdw-aside.is-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  box-shadow: var(--shadow-overlay, 0 8px 24px rgba(0, 0, 0, 0.18));
}
.${L} .sdw-aside-head {
  display: flex;
  align-items: center;
  gap: ${F}px;
  height: 64px;
  padding: 0 ${F}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}
.${L} .sdw-aside-scroll { flex: 1; min-height: 0; overflow-y: auto; padding: ${F}px; }
.${L} .sdw-aside-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${F/2}px;
  height: 52px;
  padding: 0 ${F}px;
  border-top: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}
.${L} .sdw-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${F/2}px;
  padding: ${F*2}px;
  text-align: center;
}
.${L} .sdw-heavy-row {
  display: flex;
  align-items: center;
  gap: ${F}px;
  min-height: 44px;
  padding: 0 ${F/2}px;
}

/* Path radio rows 56px ----------------------------------------------------*/
.${L} .sdw-path-row {
  appearance: none;
  width: 100%;
  min-height: 56px;
  display: flex;
  align-items: center;
  gap: ${F}px;
  padding: 6px ${F/2}px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  background: transparent;
  cursor: pointer;
  text-align: left;
  color: var(--color-text-primary);
}
.${L} .sdw-path-row[aria-checked='true'] {
  border-color: ${E};
  background: ${D};
}
.${L} .sdw-path-days {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
}
.${L} .sdw-path-pip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 16px;
  padding: 0 3px;
  border-radius: 4px;
  border: var(--border-width) solid var(--color-border);
  font-family: ${I};
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}

/* Template rows + A/B chips -----------------------------------------------*/
.${L} .sdw-template-row {
  appearance: none;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
  padding: ${F/2}px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  background: transparent;
  cursor: pointer;
  text-align: left;
  color: var(--color-text-primary);
}
.${L} .sdw-template-row[aria-checked='true'] {
  border-color: ${E};
  background: ${D};
}
.${L} .sdw-ab-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 20px;
  padding: 0 7px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background);
  font-family: ${I};
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: var(--color-text-secondary);
}
.${L} .sdw-ab-chip.is-active {
  border-color: ${E};
  color: ${E};
}
.${L} .sdw-ab-toggle {
  display: inline-flex;
  align-items: center;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  overflow: hidden;
  flex-shrink: 0;
}
.${L} .sdw-ab-btn {
  appearance: none;
  border: none;
  background: transparent;
  height: 26px;
  min-width: 40px;
  padding: 0 10px;
  font-size: 12px;
  color: var(--color-text-secondary);
  cursor: pointer;
}
.${L} .sdw-ab-btn[aria-checked='true'] {
  background: var(--color-background-muted);
  color: var(--color-text-primary);
  font-weight: 600;
}
.${L} .sdw-preview {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container);
  background: var(--color-background-muted);
  padding: ${F/2}px ${F}px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.${L} .sdw-attempt-row {
  display: flex;
  align-items: center;
  gap: ${F/2}px;
  min-height: 32px;
}
.${L} .sdw-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
`,R=21,ne=`Mon 6 Jul 2026`,z=.68,B=[`failed`,`retrying`,`engaged`,`recovered`,`churned`],V={failed:{label:`Failed`,color:M,soft:N},retrying:{label:`Retrying`,color:E,soft:D},engaged:{label:`Engaged`,color:A,soft:j},recovered:{label:`Recovered`,color:O,soft:k},churned:{label:`Churned`,color:`var(--color-text-secondary)`,soft:`var(--color-background-muted)`}},H=`P-STD`,U=`P-SMART`,W=`P-GRACE`,G=`T-1`,K=`T-2`,q=`T-3`,J=[{id:H,name:`Standard 3-touch`,blurb:`Fixed retries with an email before each attempt. The safe default.`,retryDays:[3,7,14],recoveryRate:.31},{id:U,name:`Smart retry`,blurb:`Retries aligned to issuer approval windows; front-loads attempts.`,retryDays:[1,4,9,16],recoveryRate:.42},{id:W,name:`Grace + pause`,blurb:`Slower cadence; access pauses at day 10. Lowest support volume.`,retryDays:[5,12,20],recoveryRate:.26}],Y=new Map(J.map(e=>[e.id,e])),X=[{id:G,name:`Card expired heads-up`,bestFor:`expired_card`,variants:[{id:`A`,subject:`Your card on file has expired`,bodyPreview:`Hi {company} team — the card ending {last4} on your {plan} plan expired, so the {amount} renewal did not go through. Update it in one click and nothing is interrupted.`,openPct:61,clickPct:24,recoveredPct:19,sends:1842},{id:`B`,subject:`Action needed: keep {company} shipping`,bodyPreview:`{company}: your {plan} renewal of {amount} was declined (expired card). Labels keep printing for 7 more days while you update payment.`,openPct:55,clickPct:29,recoveredPct:23,sends:1798}]},{id:K,name:`Payment failed — quick fix`,bestFor:`insufficient_funds · do_not_honor`,variants:[{id:`A`,subject:`We could not process your payment`,bodyPreview:`Hi {company} — your bank declined the {amount} charge for the {plan} plan. We will retry automatically; you can also pay now or switch cards.`,openPct:48,clickPct:17,recoveredPct:14,sends:3210},{id:`B`,subject:`{company}, your invoice needs a nudge`,bodyPreview:`The {amount} charge for {plan} bounced (bank said "try again"). One tap to retry now — most soft declines clear on a same-day manual retry.`,openPct:52,clickPct:21,recoveredPct:17,sends:3155}]},{id:q,name:`Workspace paused notice`,bestFor:`grace path · day 10+`,variants:[{id:`A`,subject:`Your {plan} workspace is paused`,bodyPreview:`{company}: after several attempts we paused label printing. Your data is safe for 90 days — reactivate any time by settling {amount}.`,openPct:67,clickPct:31,recoveredPct:26,sends:964},{id:`B`,subject:`Paused — but 30 seconds fixes it`,bodyPreview:`Printing for {company} is on hold over an unpaid {amount}. Reactivate now and this month is on us if it was our processing error.`,openPct:63,clickPct:35,recoveredPct:28,sends:921}]}],re=new Map(X.map(e=>[e.id,e])),ie={insufficient_funds:{hard:!1},expired_card:{hard:!0},do_not_honor:{hard:!1},processor_declined:{hard:!1},fraud_suspected:{hard:!0}},ae=[{id:`AC-1046`,company:`Harborlight Legal`,plan:`Team`,seats:12,mrr:420,declineCode:`expired_card`,failedOn:`3 Jul 2026`,dayIndex:3,stage:`failed`,attempts:[{day:0,dateLabel:`3 Jul 2026`,outcome:`failed`,code:`expired_card`,note:`Renewal charge declined at issuer`}],cardBrand:`Visa`,last4:`4821`},{id:`AC-1029`,company:`Copperline Robotics`,plan:`Scale`,seats:64,mrr:2150,declineCode:`fraud_suspected`,failedOn:`4 Jul 2026`,dayIndex:2,stage:`failed`,attempts:[{day:0,dateLabel:`4 Jul 2026`,outcome:`failed`,code:`fraud_suspected`,note:`Issuer flagged the charge — do not blind-retry`}],cardBrand:`Amex`,last4:`1005`,note:`High value — issuer fraud flag. Confirm with the account owner before applying any retry path.`},{id:`AC-1052`,company:`Fernworks Studio`,plan:`Solo`,seats:1,mrr:49,declineCode:`insufficient_funds`,failedOn:`5 Jul 2026`,dayIndex:1,stage:`failed`,attempts:[{day:0,dateLabel:`5 Jul 2026`,outcome:`failed`,code:`insufficient_funds`}],cardBrand:`Visa`,last4:`7710`},{id:`AC-1041`,company:`Brightloop Analytics`,plan:`Scale`,seats:40,mrr:1240,declineCode:`insufficient_funds`,failedOn:`28 Jun 2026`,dayIndex:8,stage:`retrying`,pathId:U,templateId:K,variantId:`A`,attempts:[{day:0,dateLabel:`28 Jun 2026`,outcome:`failed`,code:`insufficient_funds`},{day:1,dateLabel:`29 Jun 2026`,outcome:`failed`,code:`insufficient_funds`},{day:4,dateLabel:`2 Jul 2026`,outcome:`failed`,code:`do_not_honor`}],cardBrand:`Mastercard`,last4:`3348`},{id:`AC-1038`,company:`Nimbus Freight`,plan:`Scale`,seats:28,mrr:980,declineCode:`do_not_honor`,failedOn:`24 Jun 2026`,dayIndex:12,stage:`retrying`,pathId:H,templateId:K,variantId:`B`,attempts:[{day:0,dateLabel:`24 Jun 2026`,outcome:`failed`,code:`do_not_honor`},{day:3,dateLabel:`27 Jun 2026`,outcome:`failed`,code:`do_not_honor`},{day:7,dateLabel:`1 Jul 2026`,outcome:`failed`,code:`processor_declined`}],cardBrand:`Visa`,last4:`9034`},{id:`AC-1033`,company:`Quill & Ledger Bookkeeping Collective of Sacramento`,plan:`Team`,seats:9,mrr:360,declineCode:`processor_declined`,failedOn:`1 Jul 2026`,dayIndex:5,stage:`retrying`,pathId:W,templateId:K,variantId:`A`,attempts:[{day:0,dateLabel:`1 Jul 2026`,outcome:`failed`,code:`processor_declined`},{day:5,dateLabel:`6 Jul 2026`,outcome:`failed`,code:`processor_declined`,note:`Grace retry 1 of 3 ran this morning`}],cardBrand:`Mastercard`,last4:`5561`},{id:`AC-1019`,company:`Mistral Media`,plan:`Solo`,seats:2,mrr:29,declineCode:`insufficient_funds`,failedOn:`17 Jun 2026`,dayIndex:19,stage:`retrying`,pathId:U,templateId:K,variantId:`B`,attempts:[{day:0,dateLabel:`17 Jun 2026`,outcome:`failed`,code:`insufficient_funds`},{day:1,dateLabel:`18 Jun 2026`,outcome:`failed`,code:`insufficient_funds`},{day:4,dateLabel:`21 Jun 2026`,outcome:`failed`,code:`insufficient_funds`},{day:9,dateLabel:`26 Jun 2026`,outcome:`failed`,code:`insufficient_funds`},{day:16,dateLabel:`3 Jul 2026`,outcome:`failed`,code:`insufficient_funds`,note:`Final scheduled retry failed — churns at day 21`}],cardBrand:`Visa`,last4:`2287`,note:`All smart retries exhausted. Churns Wed 8 Jul unless the customer acts.`},{id:`AC-1024`,company:`Atlas Verde`,plan:`Team`,seats:7,mrr:310,declineCode:`expired_card`,failedOn:`21 Jun 2026`,dayIndex:15,stage:`engaged`,pathId:H,templateId:G,variantId:`B`,attempts:[{day:0,dateLabel:`21 Jun 2026`,outcome:`failed`,code:`expired_card`},{day:3,dateLabel:`24 Jun 2026`,outcome:`failed`,code:`expired_card`},{day:7,dateLabel:`28 Jun 2026`,outcome:`failed`,code:`expired_card`}],cardBrand:`Visa`,last4:`0442`,note:`Clicked "update card" from T-1/B on 4 Jul — new card not saved yet.`},{id:`AC-1015`,company:`Beaconworks`,plan:`Team`,seats:15,mrr:540,declineCode:`do_not_honor`,failedOn:`12 Jun 2026`,dayIndex:21,stage:`recovered`,pathId:U,templateId:K,variantId:`A`,resolvedDay:6,attempts:[{day:0,dateLabel:`12 Jun 2026`,outcome:`failed`,code:`do_not_honor`},{day:1,dateLabel:`13 Jun 2026`,outcome:`failed`,code:`do_not_honor`},{day:4,dateLabel:`16 Jun 2026`,outcome:`failed`,code:`do_not_honor`},{day:6,dateLabel:`18 Jun 2026`,outcome:`recovered`,note:`Customer paid from the T-2/A email link`}],cardBrand:`Mastercard`,last4:`6119`},{id:`AC-1011`,company:`Driftline Surfco`,plan:`Solo`,seats:1,mrr:59,declineCode:`expired_card`,failedOn:`8 Jun 2026`,dayIndex:21,stage:`churned`,pathId:H,templateId:G,variantId:`A`,resolvedDay:21,attempts:[{day:0,dateLabel:`8 Jun 2026`,outcome:`failed`,code:`expired_card`},{day:3,dateLabel:`11 Jun 2026`,outcome:`failed`,code:`expired_card`},{day:7,dateLabel:`15 Jun 2026`,outcome:`failed`,code:`expired_card`},{day:14,dateLabel:`22 Jun 2026`,outcome:`failed`,code:`expired_card`}],cardBrand:`Visa`,last4:`8873`,note:`Window closed 29 Jun with no engagement. Subscription cancelled.`}],Z={name:`Renata Voss`,initials:`RV`,role:`Billing recovery`};function Q(e){return`$${Math.round(e).toString().replace(/\B(?=(\d{3})+(?!\d))/g,`,`)}`}function oe(e){let t={failed:{count:0,mrr:0},retrying:{count:0,mrr:0},engaged:{count:0,mrr:0},recovered:{count:0,mrr:0},churned:{count:0,mrr:0}};for(let n of e)t[n.stage].count+=1,t[n.stage].mrr+=n.mrr;return t}function se(e){let t=0;for(let n of e)if(n.stage===`retrying`){let e=n.pathId==null?void 0:Y.get(n.pathId);t+=n.mrr*(e?.recoveryRate??0)}else n.stage===`engaged`&&(t+=n.mrr*z);return t}function ce(e){if(e.stage!==`retrying`&&e.stage!==`failed`)return[];let t=e.pathId==null?void 0:Y.get(e.pathId);return t==null?[]:t.retryDays.filter(t=>t>e.dayIndex)}function le(e,t){return e.replace(/\{company\}/g,t.company).replace(/\{plan\}/g,t.plan).replace(/\{amount\}/g,`${Q(t.mrr)}/mo`).replace(/\{last4\}/g,t.last4)}function ue(e){let[t,n]=(0,w.useState)(0);return(0,w.useEffect)(()=>{let t=e.current;if(t==null)return;let r=new ResizeObserver(e=>{let t=e[0]?.contentRect;t!=null&&n(t.width)});return r.observe(t),()=>r.disconnect()},[e]),t}function de(){return(0,T.jsxs)(`svg`,{width:24,height:24,viewBox:`0 0 24 24`,"aria-hidden":!0,style:{flexShrink:0},children:[(0,T.jsx)(`rect`,{x:3,y:5,width:18,height:5,rx:1.5,fill:`none`,stroke:E,strokeWidth:2}),(0,T.jsx)(`path`,{d:`M6 14c0 3.3 2.7 6 6 6s6-2.7 6-6`,fill:`none`,stroke:E,strokeWidth:2,strokeLinecap:`round`}),(0,T.jsx)(`path`,{d:`M18 14l-2.4 2.4M18 14l2.4 2.4`,fill:`none`,stroke:E,strokeWidth:2,strokeLinecap:`round`})]})}function fe({rollup:e,totalMrr:t,activeStage:n,isNarrow:r,onToggleStage:i}){return(0,T.jsx)(`div`,{className:`sdw-funnel${r?` is-narrow`:``}`,role:`group`,"aria-label":`Recovery funnel — stage filters`,children:B.map((a,o)=>{let s=V[a],{count:c,mrr:l}=e[a],u=t>0?l/t*100:0,d=n===a;return(0,T.jsxs)(w.Fragment,{children:[o>0&&!r?(0,T.jsx)(`span`,{className:`sdw-stage-arrow`,"aria-hidden":!0,children:(0,T.jsx)(`svg`,{width:10,height:10,viewBox:`0 0 10 10`,children:(0,T.jsx)(`path`,{d:`M2 1l5 4-5 4`,fill:`none`,stroke:`currentColor`,strokeWidth:1.5})})}):null,(0,T.jsxs)(`button`,{type:`button`,className:`sdw-stage sdw-focusable sdw-fade`,"aria-pressed":d,onClick:()=>i(a),"aria-label":`${s.label}: ${c} accounts, ${Q(l)} monthly. ${d?`Filter on — press to clear`:`Press to filter the queue`}`,children:[(0,T.jsx)(`span`,{className:`sdw-label`,style:{color:s.color},children:s.label}),(0,T.jsxs)(m,{gap:2,vAlign:`end`,children:[(0,T.jsx)(`span`,{className:`sdw-mono`,style:{fontSize:18,fontWeight:700},children:c}),(0,T.jsxs)(`span`,{className:`sdw-mono`,style:{color:`var(--color-text-secondary)`},children:[Q(l),`/mo`]})]}),(0,T.jsx)(`span`,{className:`sdw-stage-bar`,"aria-hidden":!0,children:(0,T.jsx)(`span`,{className:`sdw-fade`,style:{width:`${u}%`,background:s.color}})})]})]},a)})})}function $(e){return`${e/R*100}%`}function pe({account:e}){let t=ce(e),n=e.resolvedDay,r=e.stage===`recovered`||e.stage===`churned`;return(0,T.jsxs)(`span`,{className:`sdw-lane`,"aria-hidden":!0,children:[(0,T.jsx)(`span`,{className:`sdw-lane-track`}),r&&n!=null?(0,T.jsx)(`span`,{className:`sdw-lane-hatch`,style:{left:$(n),right:0}}):null,(0,T.jsx)(`span`,{style:{position:`absolute`,left:0,top:7,width:8,height:8,borderRadius:2,background:M}}),e.attempts.map(e=>e.day===0?null:e.outcome===`recovered`?(0,T.jsx)(`span`,{className:`sdw-dot`,style:{left:$(e.day),background:O,width:10,height:10,top:7}},`a-${e.day}`):(0,T.jsxs)(`span`,{children:[(0,T.jsx)(`span`,{className:`sdw-dot`,style:{left:$(e.day),background:M}}),(0,T.jsx)(`span`,{className:`sdw-slash`,style:{left:$(e.day),background:M}})]},`a-${e.day}`)),t.map(e=>(0,T.jsx)(`span`,{className:`sdw-dot`,style:{left:$(e),background:`transparent`,border:`2px solid ${E}`}},`s-${e}`)),e.stage===`churned`&&n!=null?(0,T.jsx)(`span`,{style:{position:`absolute`,left:`calc(${$(n)} - 5px)`,top:7,width:10,height:10,color:`var(--color-text-secondary)`},children:(0,T.jsx)(`svg`,{width:10,height:10,viewBox:`0 0 10 10`,children:(0,T.jsx)(`path`,{d:`M1 1l8 8M9 1l-8 8`,stroke:`currentColor`,strokeWidth:2})})}):null,r?null:(0,T.jsx)(`span`,{className:`sdw-today`,style:{left:$(Math.min(e.dayIndex,R))}})]})}function me(e){let t=ce(e),n=e.attempts.filter(e=>e.outcome===`failed`).map(e=>e.day),r=[`declined ${e.failedOn}`,`day ${Math.min(e.dayIndex,R)} of ${R}`,`${n.length} failed attempt${n.length===1?``:`s`} on days ${n.join(`, `)}`];return t.length>0?r.push(`retries scheduled days ${t.join(`, `)}`):e.stage===`retrying`?r.push(`no retries remain in the window`):e.stage===`failed`&&r.push(`no retry path applied`),e.stage===`recovered`&&e.resolvedDay!=null&&r.push(`recovered day ${e.resolvedDay}`),e.stage===`churned`&&r.push(`churned at window close`),r.join(`; `)}function he({labelEvery:e,idColWide:t,showMrr:n}){let r=[];for(let e=0;e<=R;e+=1)r.push(e);return(0,T.jsxs)(`div`,{className:`sdw-axis`,"aria-hidden":!0,children:[(0,T.jsx)(`span`,{className:`sdw-row-accent`,style:{background:`transparent`}}),(0,T.jsx)(`span`,{className:`sdw-id-col${t?` is-wide`:``}`,style:{justifyContent:`flex-end`},children:(0,T.jsx)(`span`,{className:`sdw-label`,style:{paddingBottom:6},children:`Account`})}),n?(0,T.jsx)(`span`,{className:`sdw-mrr-col sdw-label`,style:{alignSelf:`flex-end`,paddingBottom:6},children:`MRR`}):null,(0,T.jsx)(`span`,{className:`sdw-axis-lane`,children:r.map(t=>(0,T.jsxs)(`span`,{children:[(0,T.jsx)(`span`,{className:`sdw-axis-tick`,style:{left:$(t),...t%e===0?{height:10}:null}}),t%e===0?(0,T.jsx)(`span`,{className:`sdw-axis-num`,style:{left:$(t)},children:t===0?`d0`:t}):null]},t))})]})}function ge({account:e,isSelected:t,idColWide:n,showMrr:r,showDeclineText:i,onSelect:a}){let o=V[e.stage],s=ie[e.declineCode].hard;return(0,T.jsxs)(`button`,{type:`button`,className:`sdw-row sdw-focusable sdw-fade`,"data-account-row":e.id,"aria-pressed":t,onClick:a,"aria-label":`${e.company}, ${e.id}, ${o.label}, ${Q(e.mrr)} monthly, ${e.declineCode}; ${me(e)}`,children:[(0,T.jsx)(`span`,{className:`sdw-row-accent`,style:{background:t?E:`transparent`},"aria-hidden":!0}),(0,T.jsxs)(`span`,{className:`sdw-id-col${n?` is-wide`:``}`,children:[(0,T.jsx)(`span`,{className:`sdw-company`,children:e.company}),(0,T.jsxs)(`span`,{className:`sdw-row-meta`,children:[(0,T.jsx)(`span`,{className:`sdw-mono`,style:{color:`var(--color-text-secondary)`},children:e.id}),(0,T.jsxs)(`span`,{className:`sdw-decline-chip`,style:{color:s?M:A,background:s?N:j},children:[(0,T.jsx)(`span`,{className:`sdw-decline-pip`,style:{background:`currentColor`,...s?null:{borderRadius:999}}}),i?e.declineCode:null]}),n?(0,T.jsxs)(`span`,{className:`sdw-mono`,style:{color:`var(--color-text-secondary)`,fontSize:10},children:[e.plan,` · `,e.seats,` seat`,e.seats===1?``:`s`]}):null]})]}),r?(0,T.jsx)(`span`,{className:`sdw-mrr-col`,children:Q(e.mrr)}):null,(0,T.jsxs)(`span`,{className:`sdw-lane-col`,children:[(0,T.jsx)(pe,{account:e}),(0,T.jsx)(`span`,{className:`sdw-mono sdw-lane-day-label`,style:{fontSize:10,color:`var(--color-text-secondary)`},children:e.stage===`recovered`&&e.resolvedDay!=null?`recovered d${e.resolvedDay}`:e.stage===`churned`?`window closed`:`day ${e.dayIndex} of ${R}`})]})]})}function _e({draftPathId:e,account:t,onPick:n}){return(0,T.jsx)(`div`,{role:`radiogroup`,"aria-label":`Retry path`,children:(0,T.jsx)(h,{gap:2,children:J.map(i=>{let a=e===i.id,o=i.retryDays.filter(e=>e>t.dayIndex).length;return(0,T.jsxs)(`button`,{type:`button`,role:`radio`,"aria-checked":a,className:`sdw-path-row sdw-focusable sdw-fade`,onClick:()=>n(i.id),children:[(0,T.jsx)(`span`,{"aria-hidden":!0,style:{width:14,height:14,borderRadius:999,flexShrink:0,border:`2px solid ${a?E:`var(--color-border)`}`,background:a?E:`transparent`,boxShadow:a?`inset 0 0 0 3px var(--color-background)`:void 0}}),(0,T.jsx)(g,{size:`fill`,children:(0,T.jsxs)(h,{gap:0,children:[(0,T.jsxs)(m,{gap:2,vAlign:`center`,children:[(0,T.jsx)(r,{type:`label`,size:`sm`,children:i.name}),(0,T.jsxs)(`span`,{className:`sdw-mono`,style:{color:O},children:[Math.round(i.recoveryRate*100),`% rec`]})]}),(0,T.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,maxLines:2,children:i.blurb})]})}),(0,T.jsx)(`span`,{className:`sdw-path-days`,"aria-label":`Retries on days ${i.retryDays.join(`, `)}; ${o} remain for this account`,children:i.retryDays.map(e=>(0,T.jsxs)(`span`,{className:`sdw-path-pip`,style:e<=t.dayIndex?{textDecoration:`line-through`,opacity:.5}:a?{borderColor:E,color:E}:void 0,children:[`d`,e]},e))})]},i.id)})})})}function ve({draftTemplateId:e,draftVariantId:t,onPickTemplate:n,onPickVariant:i}){return(0,T.jsx)(`div`,{role:`radiogroup`,"aria-label":`Outreach template`,children:(0,T.jsxs)(h,{gap:2,children:[X.map(i=>{let a=e===i.id;return(0,T.jsxs)(`button`,{type:`button`,role:`radio`,"aria-checked":a,className:`sdw-template-row sdw-focusable sdw-fade`,onClick:()=>n(i.id),children:[(0,T.jsxs)(m,{gap:2,vAlign:`center`,children:[(0,T.jsx)(`span`,{className:`sdw-mono`,style:{color:`var(--color-text-secondary)`},children:i.id}),(0,T.jsx)(g,{size:`fill`,children:(0,T.jsx)(r,{type:`label`,size:`sm`,maxLines:1,children:i.name})}),(0,T.jsx)(`span`,{className:`sdw-mono`,style:{fontSize:10,color:`var(--color-text-secondary)`},children:i.bestFor})]}),(0,T.jsx)(m,{gap:2,vAlign:`center`,wrap:`wrap`,children:i.variants.map(e=>(0,T.jsxs)(`span`,{className:`sdw-ab-chip${a&&t===e.id?` is-active`:``}`,"aria-label":`Variant ${e.id}: ${e.openPct} percent open, ${e.clickPct} percent click, ${e.recoveredPct} percent recovered across ${e.sends} sends`,children:[(0,T.jsx)(`strong`,{children:e.id}),e.openPct,`% open · `,e.clickPct,`% click · `,e.recoveredPct,`% rec`]},e.id))})]},i.id)}),e==null?null:(0,T.jsx)(`div`,{className:`sdw-ab-toggle`,role:`radiogroup`,"aria-label":`Copy variant`,children:[`A`,`B`].map(e=>(0,T.jsxs)(`button`,{type:`button`,role:`radio`,"aria-checked":t===e,className:`sdw-ab-btn sdw-focusable sdw-fade`,onClick:()=>i(e),children:[`Variant `,e]},e))})]})})}function ye({account:e,templateId:t,variantId:n}){let a=re.get(t),o=a?.variants.find(e=>e.id===n);return a==null||o==null?null:(0,T.jsxs)(`div`,{className:`sdw-preview`,children:[(0,T.jsxs)(m,{gap:2,vAlign:`center`,children:[(0,T.jsx)(i,{icon:u,size:`xsm`,color:`secondary`}),(0,T.jsxs)(`span`,{className:`sdw-mono`,style:{fontSize:10,color:`var(--color-text-secondary)`},children:[a.id,`/`,o.id,` → billing@`,e.company.split(` `)[0]?.toLowerCase()??`account`,`.example`]})]}),(0,T.jsx)(r,{type:`label`,size:`sm`,maxLines:2,children:le(o.subject,e)}),(0,T.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,maxLines:4,children:le(o.bodyPreview,e)})]})}function be({account:e}){return(0,T.jsx)(h,{gap:0,children:e.attempts.map(e=>(0,T.jsxs)(`div`,{className:`sdw-attempt-row`,children:[(0,T.jsx)(`span`,{"aria-hidden":!0,style:{width:8,height:8,flexShrink:0,borderRadius:e.outcome===`recovered`?999:2,background:e.outcome===`recovered`?O:M}}),(0,T.jsxs)(`span`,{className:`sdw-mono`,style:{width:32,flexShrink:0,color:`var(--color-text-secondary)`},children:[`d`,e.day]}),(0,T.jsx)(`span`,{className:`sdw-mono`,style:{width:88,flexShrink:0},children:e.dateLabel}),(0,T.jsx)(g,{size:`fill`,children:(0,T.jsx)(r,{type:`supporting`,size:`xsm`,color:e.outcome===`recovered`?`primary`:`secondary`,maxLines:1,children:e.outcome===`recovered`?e.note??`Payment recovered`:e.note??e.code??`attempt failed`})})]},`${e.day}-${e.outcome}`))})}function xe({width:e,isOverlay:t,account:n,draft:o,forecastDeltaLabel:u,onClose:ee,onDraft:_,onApply:v,onMarkRecovered:C,onMarkChurned:w}){let E=n?.stage===`recovered`||n?.stage===`churned`,D=n!=null&&!E&&o.pathId!=null&&o.templateId!=null&&(n.stage===`failed`||o.pathId!==n.pathId||o.templateId!==n.templateId||o.variantId!==n.variantId);return(0,T.jsx)(`aside`,{className:`sdw-aside${t?` is-overlay`:``}`,style:{width:e},"aria-label":`Recovery playbook`,children:n==null?(0,T.jsxs)(`div`,{className:`sdw-empty`,children:[(0,T.jsx)(i,{icon:f,size:`lg`,color:`secondary`}),(0,T.jsx)(y,{level:2,children:`No account selected`}),(0,T.jsx)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:`Pick a row to draft its retry path and outreach copy`})]}):(0,T.jsxs)(T.Fragment,{children:[(0,T.jsxs)(`div`,{className:`sdw-aside-head`,children:[(0,T.jsx)(g,{size:`fill`,children:(0,T.jsxs)(h,{gap:0,children:[(0,T.jsxs)(m,{gap:2,vAlign:`center`,children:[(0,T.jsx)(`span`,{className:`sdw-mono`,style:{color:`var(--color-text-secondary)`},children:n.id}),(0,T.jsx)(S,{size:`sm`,color:n.stage===`recovered`?`green`:n.stage===`churned`?`gray`:n.stage===`engaged`?`yellow`:n.stage===`retrying`?`blue`:`red`,label:V[n.stage].label})]}),(0,T.jsx)(y,{level:2,maxLines:1,children:n.company})]})}),t?(0,T.jsx)(b,{label:`Close playbook`,isIconOnly:!0,variant:`ghost`,size:`sm`,icon:(0,T.jsx)(i,{icon:p,size:`sm`}),onClick:ee}):null]}),(0,T.jsx)(`div`,{className:`sdw-aside-scroll`,children:(0,T.jsxs)(h,{gap:3,children:[(0,T.jsxs)(`div`,{className:`sdw-heavy-row`,children:[(0,T.jsx)(i,{icon:s,size:`sm`,color:`secondary`}),(0,T.jsx)(g,{size:`fill`,children:(0,T.jsxs)(h,{gap:0,children:[(0,T.jsxs)(r,{type:`body`,size:`sm`,hasTabularNumbers:!0,children:[n.cardBrand,` ···`,n.last4,` · `,Q(n.mrr),`/mo · `,n.plan,` · `,n.seats,` `,`seat`,n.seats===1?``:`s`]}),(0,T.jsxs)(r,{type:`supporting`,size:`xsm`,color:`secondary`,hasTabularNumbers:!0,children:[`Declined `,n.failedOn,` (`,n.declineCode,`) · day`,` `,Math.min(n.dayIndex,R),` of `,R]})]})})]}),n.note==null?null:(0,T.jsxs)(m,{gap:2,vAlign:`center`,children:[(0,T.jsx)(i,{icon:n.declineCode===`fraud_suspected`?d:c,size:`xsm`,color:`secondary`}),(0,T.jsx)(g,{size:`fill`,children:(0,T.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:n.note})})]}),(0,T.jsx)(x,{}),E?(0,T.jsxs)(h,{gap:1,children:[(0,T.jsx)(`span`,{className:`sdw-label`,children:`Outcome`}),(0,T.jsx)(r,{type:`body`,size:`sm`,children:n.stage===`recovered`?`Recovered on day ${n.resolvedDay} via ${n.templateId}/${n.variantId} on the ${Y.get(n.pathId??``)?.name??`—`} path.`:`Window closed without recovery. Subscription cancelled at day 21.`})]}):(0,T.jsxs)(T.Fragment,{children:[(0,T.jsxs)(h,{gap:1,children:[(0,T.jsx)(`span`,{className:`sdw-label`,children:`Retry path`}),(0,T.jsx)(_e,{draftPathId:o.pathId,account:n,onPick:e=>_({pathId:e})})]}),(0,T.jsxs)(h,{gap:1,children:[(0,T.jsxs)(m,{gap:2,vAlign:`center`,children:[(0,T.jsx)(i,{icon:f,size:`xsm`,color:`secondary`}),(0,T.jsx)(`span`,{className:`sdw-label`,children:`Outreach copy · A/B benchmarks`})]}),(0,T.jsx)(ve,{draftTemplateId:o.templateId,draftVariantId:o.variantId,onPickTemplate:e=>_({templateId:e}),onPickVariant:e=>_({variantId:e})})]}),o.templateId==null?null:(0,T.jsx)(ye,{account:n,templateId:o.templateId,variantId:o.variantId}),u==null?null:(0,T.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,hasTabularNumbers:!0,children:u})]}),(0,T.jsx)(x,{}),(0,T.jsxs)(h,{gap:1,children:[(0,T.jsx)(`span`,{className:`sdw-label`,children:`Attempt log`}),(0,T.jsx)(be,{account:n})]})]})}),(0,T.jsx)(`div`,{className:`sdw-aside-footer`,children:E?(0,T.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Case closed — no actions remain`}):(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(b,{label:`Mark churned`,variant:`ghost`,size:`sm`,icon:(0,T.jsx)(i,{icon:c,size:`sm`}),onClick:w}),(0,T.jsx)(b,{label:`Mark recovered`,variant:`secondary`,size:`sm`,icon:(0,T.jsx)(i,{icon:a,size:`sm`}),onClick:C}),(0,T.jsx)(b,{label:n.stage===`failed`?`Apply path`:`Update path`,variant:`primary`,size:`sm`,isDisabled:!D,icon:(0,T.jsx)(i,{icon:l,size:`sm`}),onClick:v})]})})]})})}function Se(){let[e,t]=(0,w.useState)(ae),[n,a]=(0,w.useState)(`AC-1046`),[s,c]=(0,w.useState)(null),[l,u]=(0,w.useState)({pathId:null,templateId:G,variantId:`A`}),[d,f]=(0,w.useState)(`Queue loaded — 10 accounts in the 21-day window.`),p=(0,w.useRef)(null),y=ue(p),b=y===0||y>=1200,x=y>0&&y<1e3,S=y>0&&y<640,D=S?y:b&&!x?400:360,k=(0,w.useMemo)(()=>oe(e),[e]),A=(0,w.useMemo)(()=>e.reduce((e,t)=>e+t.mrr,0),[e]),j=(0,w.useMemo)(()=>se(e),[e]),N=n==null?null:e.find(e=>e.id===n)??null,P=s==null?e:e.filter(e=>e.stage===s),F=(e,n)=>{t(t=>t.map(t=>t.id===e?{...t,...n}:t))},I=e=>{(p.current?.querySelector(`[data-account-row="${e}"]`))?.focus()},z=e=>{a(e.id),u({pathId:e.pathId??null,templateId:e.templateId??(e.declineCode===`expired_card`?G:K),variantId:e.variantId??`A`})},B=e=>{c(t=>t===e?null:e)},H=(()=>{if(N==null||l.pathId==null||N.stage!==`failed`&&N.stage!==`retrying`)return null;let e=Y.get(l.pathId)?.recoveryRate??0,t=N.stage===`retrying`&&N.pathId!=null?Y.get(N.pathId)?.recoveryRate??0:0,n=N.mrr*(e-t);return Math.round(n)===0?null:`Applying moves the recovery forecast ${n>0?`up`:`down`} ${Q(Math.abs(n))}/mo (${Q(j)} → ${Q(j+n)}).`})(),U=()=>{if(N==null||l.pathId==null||l.templateId==null)return;let e=Y.get(l.pathId);e!=null&&(F(N.id,{pathId:l.pathId,templateId:l.templateId,variantId:l.variantId,stage:N.stage===`failed`?`retrying`:N.stage}),f(`${e.name} + ${l.templateId}/${l.variantId} applied to ${N.id} — schedule redrawn, forecast re-derived.`))},W=()=>{if(N==null)return;let e=Math.min(N.dayIndex,R);F(N.id,{stage:`recovered`,resolvedDay:e,attempts:[...N.attempts,{day:e,dateLabel:`6 Jul 2026`,outcome:`recovered`,note:`Marked recovered by ${Z.name}`}]}),f(`${N.id} marked recovered — ${Q(N.mrr)}/mo moved to Recovered.`)},q=()=>{N!=null&&(F(N.id,{stage:`churned`,resolvedDay:Math.min(N.dayIndex,R)}),f(`${N.id} marked churned — removed from the recovery forecast.`))},J=()=>{let e=n;a(null),e!=null&&I(e)},X=!x||N!=null;return(0,T.jsxs)(`div`,{ref:p,className:`${L} sdw-root`,children:[(0,T.jsx)(`style`,{children:te}),(0,T.jsxs)(ee,{height:`fill`,children:[(0,T.jsx)(v,{children:(0,T.jsxs)(`div`,{className:`sdw-header`,children:[(0,T.jsx)(de,{}),(0,T.jsxs)(h,{gap:0,children:[(0,T.jsx)(r,{type:`label`,size:`sm`,children:`Dunwell`}),(0,T.jsxs)(`span`,{className:`sdw-mono`,style:{color:`var(--color-text-secondary)`,fontSize:10},children:[`Parcelbase · Jul 2026 cycle · `,ne]})]}),(0,T.jsx)(g,{size:`fill`,children:(0,T.jsx)(`span`,{})}),(0,T.jsx)(`span`,{className:`sdw-ticker`,"aria-live":`polite`,children:d}),(0,T.jsxs)(`span`,{className:`sdw-forecast-chip`,"aria-label":`Recovery forecast ${Q(j)} per month, derived from retrying and engaged accounts`,children:[(0,T.jsx)(i,{icon:o,size:`xsm`,color:`inherit`}),(0,T.jsxs)(`span`,{className:`sdw-mono`,style:{color:`inherit`,fontWeight:700},children:[Q(j),`/mo`]}),S?null:(0,T.jsx)(r,{type:`supporting`,size:`xsm`,color:`inherit`,children:`forecast`})]}),(0,T.jsx)(C,{size:`small`,name:Z.name,alt:`${Z.name}, ${Z.role}`})]})}),(0,T.jsx)(_,{children:(0,T.jsxs)(h,{gap:0,style:{height:`100%`,minHeight:0},children:[(0,T.jsx)(fe,{rollup:k,totalMrr:A,activeStage:s,isNarrow:S,onToggleStage:B}),(0,T.jsxs)(`div`,{className:`sdw-view`,children:[(0,T.jsxs)(`div`,{className:`sdw-main`,children:[(0,T.jsx)(he,{labelEvery:b?3:7,idColWide:b,showMrr:!S}),(0,T.jsxs)(`div`,{className:`sdw-scroll`,children:[P.map(e=>(0,T.jsx)(ge,{account:e,isSelected:n===e.id,idColWide:b,showMrr:!S,showDeclineText:!x,onSelect:()=>z(e)},e.id)),P.length===0?(0,T.jsx)(`div`,{className:`sdw-empty`,children:(0,T.jsxs)(r,{type:`supporting`,size:`sm`,color:`secondary`,children:[`No accounts in `,s==null?`this`:V[s].label,` — clear the funnel filter to see the full queue.`]})}):null]}),(0,T.jsxs)(`div`,{className:`sdw-queue-footer`,children:[(0,T.jsxs)(r,{type:`supporting`,size:`xsm`,color:`secondary`,hasTabularNumbers:!0,children:[P.length,` of `,e.length,` accounts`,s==null?``:` · ${V[s].label} only`,` · `,Q(A),`/mo at risk this cycle`]}),(0,T.jsx)(g,{size:`fill`,children:(0,T.jsx)(`span`,{})}),x?null:(0,T.jsxs)(m,{gap:3,vAlign:`center`,children:[(0,T.jsxs)(`span`,{className:`sdw-mono`,style:{fontSize:10,color:`var(--color-text-secondary)`},children:[(0,T.jsx)(`span`,{"aria-hidden":!0,style:{display:`inline-block`,width:8,height:8,borderRadius:2,background:M,marginRight:4}}),`failed`]}),(0,T.jsxs)(`span`,{className:`sdw-mono`,style:{fontSize:10,color:`var(--color-text-secondary)`},children:[(0,T.jsx)(`span`,{"aria-hidden":!0,style:{display:`inline-block`,width:8,height:8,borderRadius:999,border:`2px solid ${E}`,marginRight:4}}),`scheduled`]}),(0,T.jsxs)(`span`,{className:`sdw-mono`,style:{fontSize:10,color:`var(--color-text-secondary)`},children:[(0,T.jsx)(`span`,{"aria-hidden":!0,style:{display:`inline-block`,width:8,height:8,borderRadius:999,background:O,marginRight:4}}),`recovered`]})]})]})]}),X?(0,T.jsx)(xe,{width:D,isOverlay:x,account:N,draft:l,forecastDeltaLabel:H,onClose:J,onDraft:e=>u(t=>({...t,...e})),onApply:U,onMarkRecovered:W,onMarkChurned:q}):null]})]})})]})]})}export{Se as default};