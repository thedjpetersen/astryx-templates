import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-DoyyW0Xq.js";import{t as i}from"./Icon-Cbr2QWU5.js";import{t as a}from"./circle-alert-DH9LgxJm.js";import{t as o}from"./eye-BFwSQBGh.js";import{t as s}from"./key-round-DB2kWcbR.js";import{t as c}from"./lock-Dx8eqSSK.js";import{t as l}from"./play-CcU_siS7.js";import{t as u}from"./shield-check-C7FDlswJ.js";import{t as d}from"./trash-2-B4357QVT.js";import{C as f,a as p,f as m,h,i as ee,w as g,x as _}from"./index-BwFrdgVW.js";import{t as v}from"./HStack-2WTukjNp.js";import{t as y}from"./VStack-B8U-hI0Y.js";import{t as b}from"./StackItem-Ca9P7L2I.js";import{n as te,t as ne}from"./LayoutContent-CCL91W7X.js";import{t as re}from"./LayoutHeader-Cy2mWoMf.js";import{t as x}from"./Heading-CEfXHtdE.js";import{t as S}from"./useMediaQuery-BvG63aw7.js";import{t as C}from"./Button-DdhUiDLb.js";import{t as w}from"./Divider-BHIBe6GQ.js";import{t as T}from"./Token-JT3SYFA7.js";import{t as ie}from"./Avatar-DyaNw-yT.js";var E=e(t(),1),D=n(),O=`light-dark(#0C8F6C, #34D9A8)`,k=`light-dark(#047857, #6EE7C7)`,A=`light-dark(rgba(12, 143, 108, 0.12), rgba(52, 217, 168, 0.16))`,j=`var(--color-data-categorical-green, light-dark(#0B991F, #34C759))`,M=`light-dark(#DC2626, #F87171)`,ae=`light-dark(rgba(220, 38, 38, 0.08), rgba(248, 113, 113, 0.14))`,N=`var(--color-data-categorical-orange, light-dark(#B45309, #FBBF24))`,P=12,F=`var(--font-family-code, ui-monospace, monospace)`,I=`tpl-partner-onboarding-portal`,oe=`
.${I} {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.${I} button {
  font-family: inherit;
}
.${I} .pop-fade {
  transition: background-color 160ms ease, opacity 160ms ease, border-color 160ms ease, color 160ms ease;
}
.${I} .pop-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.${I} .pop-test-row:focus-visible,
.${I} .pop-milestone-row:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}
@media (prefers-reduced-motion: reduce) {
  .${I} .pop-fade { transition: none; }
}

/* ---- header bar 48px ---------------------------------------------------- */
.${I} .pop-header-bar {
  display: flex;
  align-items: center;
  gap: ${P}px;
  height: 48px;
  padding: 0 ${P}px;
}
.${I} .pop-mono {
  font-family: ${F};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.${I} .pop-section-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${I} .pop-header-stat {
  font-family: ${F};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* ---- view root ------------------------------------------------------------ */
.${I} .pop-view-root {
  display: flex;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  position: relative;
}
.${I} .pop-main-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* ---- milestone rail: 56px rows + 32px footer ------------------------------ */
.${I} .pop-rail {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-right: var(--border-width) solid var(--color-border);
  box-sizing: border-box;
}
.${I} .pop-rail-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.${I} .pop-milestone-row {
  display: flex;
  align-items: center;
  gap: ${P/2}px;
  width: 100%;
  min-height: 56px;
  padding: 0 ${P}px;
  border-bottom: var(--border-width) solid var(--color-border);
  box-sizing: border-box;
  text-align: left;
}
.${I} .pop-milestone-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.${I} .pop-milestone-label {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${I} .pop-milestone-sub {
  font-family: ${F};
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${I} .pop-rail-footer {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 ${P}px;
  border-top: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
  box-sizing: border-box;
  overflow: hidden;
}

/* ---- toolbar 40px ----------------------------------------------------------- */
.${I} .pop-toolbar {
  display: flex;
  align-items: center;
  gap: ${P/2}px;
  height: 40px;
  padding: 0 ${P}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
  overflow: hidden;
}
.${I} .pop-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background);
  font-size: 11px;
  font-family: ${F};
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  white-space: nowrap;
  flex-shrink: 0;
}

/* ---- test list: 40px rows + 88px remediation drawer ------------------------- */
.${I} .pop-test-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.${I} .pop-test-row {
  appearance: none;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  gap: ${P/2}px;
  width: 100%;
  height: 40px;
  padding: 0 ${P}px 0 0;
  cursor: pointer;
  text-align: left;
  color: var(--color-text-primary);
  border-bottom: var(--border-width) solid var(--color-border);
  box-sizing: border-box;
}
.${I} .pop-test-row[aria-expanded='true'] {
  background-color: var(--color-background-muted);
}
.${I} .pop-test-accent {
  width: 3px;
  align-self: stretch;
  flex-shrink: 0;
  margin-right: ${P-3}px;
}
.${I} .pop-test-name {
  font-size: 13px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${I} .pop-endpoint {
  font-family: ${F};
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${I} .pop-drawer {
  display: flex;
  align-items: flex-start;
  gap: ${P}px;
  min-height: 88px;
  padding: ${P}px ${P}px ${P}px ${P*2}px;
  border-bottom: var(--border-width) solid var(--color-border);
  background-color: var(--color-background-muted);
  box-sizing: border-box;
}

/* ---- console pane 240px, 32px header, 18px lines ----------------------------- */
.${I} .pop-console {
  flex-shrink: 0;
  height: 240px;
  display: flex;
  flex-direction: column;
  border-top: var(--border-width) solid var(--color-border);
  box-sizing: border-box;
}
.${I} .pop-console-head {
  display: flex;
  align-items: center;
  gap: ${P/2}px;
  height: 32px;
  padding: 0 ${P}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
  box-sizing: border-box;
}
.${I} .pop-console-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${P/2}px ${P}px;
  background-color: var(--color-background-muted);
}
.${I} .pop-console-line {
  display: flex;
  gap: ${P/2}px;
  font-family: ${F};
  font-size: 11px;
  line-height: 18px;
  font-variant-numeric: tabular-nums;
  white-space: pre-wrap;
  word-break: break-word;
}
.${I} .pop-console-stamp {
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

/* ---- vault panel -------------------------------------------------------------- */
.${I} .pop-vault {
  flex: none;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-left: var(--border-width) solid var(--color-border);
  background-color: var(--color-background);
  box-sizing: border-box;
}
.${I} .pop-vault-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 340px;
  z-index: 5;
  box-shadow: var(--shadow-overlay, 0 8px 24px rgba(0, 0, 0, 0.18));
}
.${I} .pop-vault-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${P}px;
}
.${I} .pop-vault-section-head {
  display: flex;
  align-items: center;
  gap: ${P/2}px;
  height: 32px;
}
.${I} .pop-key-row {
  display: flex;
  align-items: center;
  gap: ${P/2}px;
  min-height: 44px;
  padding: 0 ${P/2}px;
  box-sizing: border-box;
}
.${I} .pop-key-value {
  font-family: ${F};
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${I} .pop-gate-row {
  display: flex;
  align-items: center;
  gap: ${P/2}px;
  height: 32px;
  padding: 0 ${P/2}px;
  box-sizing: border-box;
}
.${I} .pop-gate-locked {
  display: flex;
  flex-direction: column;
  gap: ${P/2}px;
  padding: ${P}px;
  border: var(--border-width) dashed var(--color-border);
  border-radius: var(--radius-container, 8px);
  color: var(--color-text-secondary);
}
.${I} .pop-gate-open {
  display: flex;
  flex-direction: column;
  gap: ${P/2}px;
  padding: ${P}px;
  border: var(--border-width) solid ${k};
  border-radius: var(--radius-container, 8px);
  background-color: ${A};
}
.${I} .pop-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

/* ---- 390px embed iframe (viewport queries DO fire there) --------------------- */
@media (max-width: 720px) {
  .${I} .pop-rail { width: 56px !important; }
  .${I} .pop-milestone-copy { display: none; }
  .${I} .pop-rail-footer { display: none; }
  .${I} .pop-milestone-row { justify-content: center; padding: 0; }
  .${I} .pop-console { height: 200px; }
  .${I} .pop-endpoint { display: none; }
  .${I} .pop-vault-overlay { width: min(340px, 100vw); }
  .${I} .pop-header-stat { display: none; }
}
`,L={noor:{name:`Noor Siddiqui`,role:`Partner engineer`,initials:`NS`},elliot:{name:`Elliot Vance`,role:`Partnerly partner manager`}},R={partner:`Brightpath Systems`,appName:`Brightpath Sync`,appId:`bp_sync_7741`,apiVersion:`v2026-06`},z=[`15:04:12`,`15:06:47`,`15:09:03`,`15:11:28`,`15:14:55`,`15:18:31`],B=`9 Jul 2026`,V=`8 Jul 2026 · 17:41`,H=`whsec_bp_s4nd_0617`,U=`whsec_bp_s4nd_0630`,se=[{id:`CT-01`,name:`OAuth client-credentials grant`,method:`POST`,path:`/v2026-06/oauth/token`,msDisplay:`96 ms`,status:`pass`,lastRun:V,needsFix:!1,fixApplied:!1,passLines:[{at:`+0ms`,kind:`cmd`,text:`▶ CT-01 OAuth client-credentials grant`},{at:`+12ms`,kind:`info`,text:`POST /v2026-06/oauth/token → 200 (84 ms)`},{at:`+96ms`,kind:`info`,text:`assert token_type=Bearer ✓ · expires_in=3600 ✓ · scope=orders:write refunds:write ✓`},{at:`+96ms`,kind:`pass`,text:`✔ CT-01 passed (96 ms)`}]},{id:`CT-02`,name:`Account link handshake`,method:`POST`,path:`/v2026-06/partner/links`,msDisplay:`143 ms`,status:`pass`,lastRun:V,needsFix:!1,fixApplied:!1,passLines:[{at:`+0ms`,kind:`cmd`,text:`▶ CT-02 Account link handshake`},{at:`+21ms`,kind:`info`,text:`POST /v2026-06/partner/links {app_id: ${R.appId}} → 201 plink_4Krm2N`},{at:`+108ms`,kind:`info`,text:`GET /v2026-06/partner/links/plink_4Krm2N → status=active ✓`},{at:`+143ms`,kind:`pass`,text:`✔ CT-02 passed (143 ms)`}]},{id:`CT-03`,name:`Order create + capture`,method:`POST`,path:`/v2026-06/orders`,msDisplay:`182 ms`,status:`pass`,lastRun:V,needsFix:!1,fixApplied:!1,passLines:[{at:`+0ms`,kind:`cmd`,text:`▶ CT-03 Order create + capture`},{at:`+15ms`,kind:`info`,text:`POST /v2026-06/orders amount=2450 currency=USD → 201 ord_8XcW3p`},{at:`+121ms`,kind:`info`,text:`POST /v2026-06/orders/ord_8XcW3p/capture → 200 captured=2450 ✓`},{at:`+182ms`,kind:`pass`,text:`✔ CT-03 passed (182 ms)`}]},{id:`CT-04`,name:`Webhook signature round-trip`,method:`POST`,path:`https://sandbox.brightpath.dev/hooks/partnerly`,msDisplay:`210 ms`,status:`fail`,lastRun:V,needsFix:!0,fixApplied:!1,remediation:{title:`Connector signs with the retired webhook secret`,detail:`Your endpoint verifies X-Partnerly-Signature with ${H}, but the sandbox secret was rotated on 30 Jun. Update PARTNERLY_WEBHOOK_SECRET to the current value from the vault, then re-run.`,actionLabel:`Apply rotated secret`,logText:`⚙ config: PARTNERLY_WEBHOOK_SECRET updated ${H} → ${U}`},failLines:[{at:`+0ms`,kind:`cmd`,text:`▶ CT-04 Webhook signature round-trip`},{at:`+18ms`,kind:`info`,text:`emit partner.order.updated → https://sandbox.brightpath.dev/hooks/partnerly`},{at:`+142ms`,kind:`info`,text:`endpoint replied 200 in 124 ms`},{at:`+188ms`,kind:`info`,text:`verify X-Partnerly-Signature v1=9f41c2… against ${U}`},{at:`+210ms`,kind:`fail`,text:`✘ signature mismatch — payload signed with retired ${H} (rotated 30 Jun)`},{at:`+210ms`,kind:`fail`,text:`✘ CT-04 failed (210 ms) — see remediation in the test drawer`}],passLines:[{at:`+0ms`,kind:`cmd`,text:`▶ CT-04 Webhook signature round-trip`},{at:`+18ms`,kind:`info`,text:`emit partner.order.updated → https://sandbox.brightpath.dev/hooks/partnerly`},{at:`+139ms`,kind:`info`,text:`endpoint replied 200 in 121 ms`},{at:`+186ms`,kind:`info`,text:`verify X-Partnerly-Signature v1=6c0d88… ✓ · timestamp skew 41 ms ✓`},{at:`+204ms`,kind:`pass`,text:`✔ CT-04 passed (204 ms)`}]},{id:`CT-05`,name:`Refund full + partial`,method:`POST`,path:`/v2026-06/refunds`,msDisplay:`164 ms`,status:`pass`,lastRun:V,needsFix:!1,fixApplied:!1,passLines:[{at:`+0ms`,kind:`cmd`,text:`▶ CT-05 Refund full + partial`},{at:`+19ms`,kind:`info`,text:`POST /v2026-06/refunds order=ord_8XcW3p amount=2450 → 201 ref_2LqV8d ✓`},{at:`+98ms`,kind:`info`,text:`POST /v2026-06/refunds order=ord_5TnB1k amount=900 of 2100 → 201 partial ✓`},{at:`+164ms`,kind:`pass`,text:`✔ CT-05 passed (164 ms)`}]},{id:`CT-06`,name:`Pagination cursor stability`,method:`GET`,path:`/v2026-06/orders?limit=25`,msDisplay:`88 ms`,status:`not-run`,needsFix:!1,fixApplied:!1,passLines:[{at:`+0ms`,kind:`cmd`,text:`▶ CT-06 Pagination cursor stability`},{at:`+11ms`,kind:`info`,text:`GET /v2026-06/orders?limit=25 → 200, 25 rows, cursor=eyJvZmZzZXQiOjI1fQ`},{at:`+54ms`,kind:`info`,text:`GET page 2 via cursor → 200, 25 rows, no overlap with page 1 ✓`},{at:`+88ms`,kind:`pass`,text:`✔ CT-06 passed (88 ms)`}]},{id:`CT-07`,name:`Idempotency key replay`,method:`POST`,path:`/v2026-06/orders`,msDisplay:`121 ms`,status:`fail`,lastRun:V,needsFix:!0,fixApplied:!1,remediation:{title:`Idempotency store disabled in the connector config`,detail:`Replaying an Idempotency-Key must return the ORIGINAL object. Your connector has idempotency_store: off, so the replay created a second order. Enable the store (24 h retention) and re-run.`,actionLabel:`Enable idempotency store`,logText:`⚙ config: idempotency_store off → on (retention 24 h)`},failLines:[{at:`+0ms`,kind:`cmd`,text:`▶ CT-07 Idempotency key replay`},{at:`+9ms`,kind:`info`,text:`POST /v2026-06/orders Idempotency-Key: bp-7f2e-0709 → 201 ord_9Q9wKm`},{at:`+67ms`,kind:`info`,text:`replay same Idempotency-Key → 201 ord_9RaTx4`},{at:`+121ms`,kind:`fail`,text:`✘ replay returned a NEW object (expected ord_9Q9wKm) — duplicate order created`},{at:`+121ms`,kind:`fail`,text:`✘ CT-07 failed (121 ms) — see remediation in the test drawer`}],passLines:[{at:`+0ms`,kind:`cmd`,text:`▶ CT-07 Idempotency key replay`},{at:`+9ms`,kind:`info`,text:`POST /v2026-06/orders Idempotency-Key: bp-7f2e-0709 → 201 ord_9Q9wKm`},{at:`+61ms`,kind:`info`,text:`replay same Idempotency-Key → 200 ord_9Q9wKm (replayed=true) ✓`},{at:`+118ms`,kind:`pass`,text:`✔ CT-07 passed (118 ms)`}]},{id:`CT-08`,name:`Error taxonomy mapping`,method:`POST`,path:`/v2026-06/orders`,msDisplay:`74 ms`,status:`not-run`,needsFix:!1,fixApplied:!1,passLines:[{at:`+0ms`,kind:`cmd`,text:`▶ CT-08 Error taxonomy mapping`},{at:`+8ms`,kind:`info`,text:`POST /v2026-06/orders amount=-5 → 422 error.code=amount_invalid ✓`},{at:`+41ms`,kind:`info`,text:`POST with expired token → 401 error.code=token_expired ✓ · retriable=false ✓`},{at:`+74ms`,kind:`pass`,text:`✔ CT-08 passed (74 ms)`}]}],ce=[{id:1,stamp:`17:41:22`,kind:`header`,text:`── conformance run · ${V} · 6 of 8 executed ──`},{id:2,stamp:``,kind:`pass`,text:`✔ CT-01 OAuth client-credentials grant (96 ms)`},{id:3,stamp:``,kind:`pass`,text:`✔ CT-02 Account link handshake (143 ms)`},{id:4,stamp:``,kind:`pass`,text:`✔ CT-03 Order create + capture (182 ms)`},{id:5,stamp:``,kind:`fail`,text:`✘ CT-04 Webhook signature round-trip — signature mismatch`},{id:6,stamp:``,kind:`pass`,text:`✔ CT-05 Refund full + partial (164 ms)`},{id:7,stamp:``,kind:`fail`,text:`✘ CT-07 Idempotency key replay — duplicate object on replay`},{id:8,stamp:``,kind:`info`,text:`CT-06, CT-08 skipped (not yet run) · summary: 4 pass / 2 fail`}],W=[{id:`sb-pk`,label:`Publishable key`,value:`pk_test_bp_51PLYQd8m2XKa93VtqEw7Hn4`,masked:`pk_test_bp_51PL••••••••••••••••7Hn4`,secret:!1},{id:`sb-sk`,label:`Secret key`,value:`sk_test_bp_9mA2Rf6TzXqLd07wJcVe5Bp1`,masked:`sk_test_bp_9mA2••••••••••••••••5Bp1`,secret:!0},{id:`sb-wh`,label:`Webhook secret`,value:U,masked:`whsec_bp_s4nd_••••`,secret:!0}],G=[{id:`pr-pk`,label:`Publishable key`,value:`pk_live_bp_72MZR4nJc6TQd18SueYw3Bk9`,masked:`pk_live_bp_72MZ••••••••••••••••3Bk9`,secret:!1},{id:`pr-sk`,label:`Secret key`,value:`sk_live_bp_4Xw8Qn1KvRt6Ma20pZgY7Jd5`,masked:`sk_live_bp_4Xw8••••••••••••••••7Jd5`,secret:!0},{id:`pr-wh`,label:`Webhook secret`,value:`whsec_bp_l1ve_0709`,masked:`whsec_bp_l1ve_••••`,secret:!0}];function le(e,t,n){let r=e===8;return[{id:`agreement`,index:1,label:`Agreement signed`,sub:`Countersigned 12 Jun 2026`,state:`done`},{id:`app`,index:2,label:`App registered`,sub:`app_id ${R.appId} · 18 Jun 2026`,state:`done`},{id:`webhook`,index:3,label:`Webhook endpoint verified`,sub:`Echo challenge OK · 30 Jun 2026`,state:`done`},{id:`conformance`,index:4,label:`Sandbox conformance`,sub:`${e}/8 tests green`,state:r?`done`:`active`,arcFraction:r?void 0:e/8},{id:`credentials`,index:5,label:`Production credentials`,sub:n?`Issued ${B}`:t?`Gate open — ready to issue`:`Gated on conformance 8/8`,state:n?`done`:t?`active`:`gated`},{id:`launch`,index:6,label:`Launch review`,sub:n?`Book with ${L.elliot.name}`:`Opens after credentials`,state:n?`active`:`locked`}]}function ue(e){let[t,n]=(0,E.useState)(0);return(0,E.useEffect)(()=>{let t=e.current;if(t==null)return;let r=new ResizeObserver(e=>{let t=e[0]?.contentRect;t!=null&&n(t.width)});return r.observe(t),()=>r.disconnect()},[e]),t}function de(){return(0,D.jsxs)(`svg`,{width:24,height:24,viewBox:`0 0 24 24`,"aria-hidden":!0,style:{flexShrink:0},children:[(0,D.jsx)(`rect`,{x:3,y:7,width:12,height:10,rx:5,fill:`none`,stroke:O,strokeWidth:2.4}),(0,D.jsx)(`rect`,{x:9,y:7,width:12,height:10,rx:5,fill:`none`,stroke:O,strokeWidth:2.4,opacity:.55})]})}function K({status:e}){return e===`not-run`?(0,D.jsx)(`svg`,{width:16,height:16,viewBox:`0 0 16 16`,"aria-hidden":!0,style:{flexShrink:0},children:(0,D.jsx)(`circle`,{cx:8,cy:8,r:5.5,fill:`none`,stroke:`var(--color-text-secondary)`,strokeWidth:1.5,strokeDasharray:`2.5 2.5`})}):(0,D.jsxs)(`svg`,{width:16,height:16,viewBox:`0 0 16 16`,"aria-hidden":!0,style:{flexShrink:0},children:[(0,D.jsx)(`circle`,{cx:8,cy:8,r:6.5,fill:e===`pass`?j:M}),e===`pass`?(0,D.jsx)(`path`,{d:`M5 8.2 7.2 10.4 11 5.8`,fill:`none`,stroke:`var(--color-background)`,strokeWidth:1.8,strokeLinecap:`round`,strokeLinejoin:`round`}):(0,D.jsx)(`path`,{d:`M5.6 5.6 10.4 10.4 M10.4 5.6 5.6 10.4`,fill:`none`,stroke:`var(--color-background)`,strokeWidth:1.8,strokeLinecap:`round`})]})}function fe(e,t,n,r){let i=Math.max(0,Math.min(r,.9999)),a=-Math.PI/2+i*Math.PI*2,o=e+n*Math.cos(a),s=t+n*Math.sin(a),c=+(i>.5);return`M ${e} ${t-n} A ${n} ${n} 0 ${c} 1 ${o.toFixed(3)} ${s.toFixed(3)}`}function q({state:e,arcFraction:t}){return(0,D.jsxs)(`svg`,{width:24,height:24,viewBox:`0 0 24 24`,"aria-hidden":!0,style:{flexShrink:0},children:[e===`done`?(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)(`circle`,{cx:12,cy:12,r:9,fill:O}),(0,D.jsx)(`path`,{d:`M8 12.4 10.8 15.2 16 8.8`,fill:`none`,stroke:`var(--color-background)`,strokeWidth:2,strokeLinecap:`round`,strokeLinejoin:`round`})]}):null,e===`active`?(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)(`circle`,{cx:12,cy:12,r:9,fill:`none`,stroke:`var(--color-border)`,strokeWidth:2.5}),t!=null&&t>0?(0,D.jsx)(`path`,{d:fe(12,12,9,t),fill:`none`,stroke:O,strokeWidth:2.5,strokeLinecap:`round`}):null,(0,D.jsx)(`circle`,{cx:12,cy:12,r:3,fill:O})]}):null,e===`gated`?(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)(`circle`,{cx:12,cy:12,r:9,fill:`none`,stroke:`var(--color-text-secondary)`,strokeWidth:1.5}),(0,D.jsx)(`path`,{d:`M9.5 12v-1.8a2.5 2.5 0 0 1 5 0V12 M8.8 12h6.4v4.2H8.8z`,fill:`none`,stroke:`var(--color-text-secondary)`,strokeWidth:1.4,strokeLinejoin:`round`})]}):null,e===`locked`?(0,D.jsx)(`circle`,{cx:12,cy:12,r:9,fill:`none`,stroke:`var(--color-border)`,strokeWidth:2,strokeDasharray:`3.5 3.5`}):null]})}function pe({milestones:e,railW:t,onOpenConformance:n,onOpenVault:a}){return(0,D.jsxs)(`nav`,{className:`pop-rail`,style:{width:t},"aria-label":`Onboarding milestones`,children:[(0,D.jsx)(`div`,{className:`pop-rail-scroll`,children:e.map(e=>{let t=e.id===`conformance`?n:e.id===`credentials`?a:null,r=(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)(q,{state:e.state,arcFraction:e.arcFraction}),(0,D.jsxs)(`span`,{className:`pop-milestone-copy`,children:[(0,D.jsxs)(`span`,{className:`pop-milestone-label`,style:e.state===`locked`?{color:`var(--color-text-secondary)`}:void 0,children:[e.index,`. `,e.label]}),(0,D.jsx)(`span`,{className:`pop-milestone-sub`,children:e.sub})]}),t==null?null:(0,D.jsx)(`span`,{style:{marginLeft:`auto`,display:`inline-flex`,flexShrink:0},children:(0,D.jsx)(i,{icon:_,size:`xsm`,color:`secondary`})})]});return t==null?(0,D.jsx)(`div`,{className:`pop-milestone-row`,children:r},e.id):(0,D.jsx)(`button`,{type:`button`,className:`pop-milestone-row pop-fade`,style:{appearance:`none`,border:`none`,background:`transparent`,cursor:`pointer`,color:`inherit`,borderBottom:`var(--border-width) solid var(--color-border)`},"aria-label":`${e.label}: ${e.sub}`,onClick:t,children:r},e.id)})}),(0,D.jsx)(`div`,{className:`pop-rail-footer`,children:(0,D.jsxs)(r,{type:`supporting`,size:`xsm`,color:`secondary`,maxLines:1,children:[`Partner manager · `,L.elliot.name]})})]})}var J={pass:`passing`,fail:`failing`,"not-run":`not yet run`};function me({test:e,expanded:t,geometry:n,onToggleExpand:a,onRun:o,onApplyFix:s,rowRef:c}){let d=!e.needsFix||e.fixApplied;return(0,D.jsxs)(D.Fragment,{children:[(0,D.jsxs)(`div`,{style:{display:`flex`,alignItems:`stretch`},children:[(0,D.jsxs)(`button`,{type:`button`,ref:c,className:`pop-test-row pop-fade`,style:{flex:1,minWidth:0,borderBottom:t?`none`:void 0},"aria-expanded":t,"aria-label":`${e.id} ${e.name}, ${J[e.status]}${e.lastRun==null?``:`, last run ${e.lastRun}`}. ${t?`Collapse`:`Expand`} details.`,onClick:a,children:[(0,D.jsx)(`span`,{className:`pop-test-accent`,style:{backgroundColor:t?O:`transparent`},"aria-hidden":!0}),(0,D.jsx)(i,{icon:t?f:_,size:`xsm`,color:`secondary`}),(0,D.jsx)(K,{status:e.status}),(0,D.jsx)(`span`,{className:`pop-mono`,style:{color:`var(--color-text-secondary)`,width:44,flexShrink:0},children:e.id}),(0,D.jsx)(`span`,{className:`pop-test-name`,children:e.name}),n.showEndpoint?(0,D.jsxs)(`span`,{className:`pop-endpoint`,style:{marginLeft:`auto`,maxWidth:220},children:[e.method,` `,e.path]}):(0,D.jsx)(`span`,{style:{marginLeft:`auto`},"aria-hidden":!0}),n.showDuration?(0,D.jsx)(`span`,{className:`pop-mono`,style:{color:`var(--color-text-secondary)`,width:52,textAlign:`right`,flexShrink:0},children:e.status===`not-run`?`—`:e.msDisplay}):null]}),(0,D.jsx)(`span`,{style:{display:`flex`,alignItems:`center`,padding:`0 ${P}px 0 ${P/2}px`,borderBottom:t?`none`:`var(--border-width) solid var(--color-border)`,flexShrink:0},children:(0,D.jsx)(C,{label:`Run ${e.id}`,variant:`secondary`,size:`sm`,icon:(0,D.jsx)(i,{icon:l,size:`sm`}),isIconOnly:!0,onClick:o})})]}),t?(0,D.jsxs)(`div`,{className:`pop-drawer`,children:[(0,D.jsx)(`span`,{style:{color:d?k:N,display:`inline-flex`,flexShrink:0,paddingTop:2},children:(0,D.jsx)(i,{icon:d?u:p,size:`sm`,color:`inherit`})}),(0,D.jsx)(b,{size:`fill`,children:(0,D.jsxs)(y,{gap:1,children:[(0,D.jsxs)(v,{gap:2,vAlign:`center`,children:[(0,D.jsx)(`span`,{className:`pop-mono`,children:e.method}),(0,D.jsx)(`span`,{className:`pop-mono`,style:{color:`var(--color-text-secondary)`},children:e.path}),(0,D.jsxs)(`span`,{className:`pop-mono`,style:{color:`var(--color-text-secondary)`},children:[`· `,e.msDisplay]}),e.lastRun==null?(0,D.jsx)(`span`,{className:`pop-mono`,style:{color:`var(--color-text-secondary)`},children:`· never run`}):(0,D.jsxs)(`span`,{className:`pop-mono`,style:{color:`var(--color-text-secondary)`},children:[`· last run `,e.lastRun]})]}),e.remediation!=null&&!e.fixApplied?(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)(r,{type:`label`,size:`sm`,children:e.remediation.title}),(0,D.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:e.remediation.detail}),(0,D.jsxs)(v,{gap:2,vAlign:`center`,children:[(0,D.jsx)(C,{label:e.remediation.actionLabel,variant:`primary`,size:`sm`,icon:(0,D.jsx)(i,{icon:p,size:`sm`}),onClick:s}),(0,D.jsxs)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:[`Logs to the console, then re-run `,e.id,`.`]})]})]}):e.remediation!=null&&e.fixApplied&&e.status!==`pass`?(0,D.jsxs)(v,{gap:2,vAlign:`center`,children:[(0,D.jsx)(`span`,{style:{flexShrink:0},children:(0,D.jsx)(T,{size:`sm`,color:`orange`,label:`Fix applied`})}),(0,D.jsxs)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:[`Configuration updated — re-run `,e.id,` to verify.`]})]}):(0,D.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:e.status===`pass`?`All assertions green in the last run — transcript is in the console.`:`Ready to run — the scripted assertions and transcript will append to the console.`})]})})]}):null]})}var Y={header:`var(--color-text-secondary)`,cmd:void 0,info:`var(--color-text-secondary)`,pass:j,fail:M};function he({lines:e,onClear:t}){let n=(0,E.useRef)(null);return(0,E.useEffect)(()=>{let e=n.current;e!=null&&(e.scrollTop=e.scrollHeight)},[e.length]),(0,D.jsxs)(`section`,{className:`pop-console`,"aria-label":`Sandbox console`,children:[(0,D.jsxs)(`div`,{className:`pop-console-head`,children:[(0,D.jsx)(`span`,{className:`pop-section-label`,children:`Sandbox console`}),(0,D.jsx)(`span`,{style:{flex:1},"aria-hidden":!0}),(0,D.jsxs)(`span`,{className:`pop-mono`,style:{color:`var(--color-text-secondary)`},children:[e.length,` lines`]}),(0,D.jsx)(C,{label:`Clear console`,variant:`ghost`,size:`sm`,isIconOnly:!0,icon:(0,D.jsx)(i,{icon:d,size:`sm`}),onClick:t})]}),(0,D.jsx)(`div`,{ref:n,className:`pop-console-scroll`,role:`log`,"aria-live":`polite`,children:e.length===0?(0,D.jsx)(`span`,{className:`pop-console-line`,style:{color:`var(--color-text-secondary)`},children:`Console cleared — run a conformance test to append its transcript.`}):e.map(e=>(0,D.jsxs)(`span`,{className:`pop-console-line`,style:{color:Y[e.kind],fontWeight:e.kind===`cmd`||e.kind===`header`?600:void 0,marginTop:e.kind===`header`?6:void 0},children:[e.stamp===``?null:(0,D.jsx)(`span`,{className:`pop-console-stamp`,children:e.stamp}),(0,D.jsx)(`span`,{children:e.text})]},e.id))})]})}function X({credential:e,revealed:t,copied:n,onToggleReveal:a,onCopy:c}){let l=e.secret&&!t?e.masked:e.value;return(0,D.jsxs)(`div`,{className:`pop-key-row`,children:[(0,D.jsx)(`span`,{style:{color:`var(--color-text-secondary)`,display:`inline-flex`,flexShrink:0},children:(0,D.jsx)(i,{icon:s,size:`sm`,color:`inherit`})}),(0,D.jsx)(b,{size:`fill`,children:(0,D.jsxs)(y,{gap:0,children:[(0,D.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:e.label}),(0,D.jsx)(`span`,{className:`pop-key-value`,children:l})]})}),e.secret?(0,D.jsx)(C,{label:t?`Hide ${e.label}`:`Reveal ${e.label}`,variant:`ghost`,size:`sm`,isIconOnly:!0,icon:(0,D.jsx)(i,{icon:t?m:o,size:`sm`}),onClick:a}):null,(0,D.jsx)(C,{label:n?`${e.label} copied`:`Copy ${e.label}`,variant:`ghost`,size:`sm`,isIconOnly:!0,icon:(0,D.jsx)(i,{icon:n?g:h,size:`sm`}),onClick:c})]})}function ge({isOverlay:e,width:t,gateItems:n,gateOpen:o,prodIssued:l,greenCount:d,revealedKeys:f,copiedKeyId:p,onToggleReveal:m,onCopy:h,onIssue:_,onClose:b}){return(0,D.jsx)(`aside`,{className:`pop-vault${e?` pop-vault-overlay`:``}`,style:e?void 0:{width:t},"aria-label":`Credential vault`,children:(0,D.jsx)(`div`,{className:`pop-vault-scroll`,children:(0,D.jsxs)(y,{gap:2,children:[(0,D.jsxs)(`div`,{className:`pop-vault-section-head`,children:[(0,D.jsx)(x,{level:2,children:`Credential vault`}),(0,D.jsx)(`span`,{style:{flex:1},"aria-hidden":!0}),e?(0,D.jsx)(C,{label:`Close vault`,isIconOnly:!0,variant:`ghost`,size:`sm`,icon:(0,D.jsx)(i,{icon:ee,size:`sm`}),onClick:b}):null]}),(0,D.jsxs)(`div`,{className:`pop-vault-section-head`,children:[(0,D.jsx)(`span`,{className:`pop-section-label`,children:`Sandbox`}),(0,D.jsx)(`span`,{style:{flexShrink:0},children:(0,D.jsx)(T,{size:`sm`,color:`orange`,label:`Test mode`})})]}),(0,D.jsx)(y,{gap:0,children:W.map(e=>(0,D.jsx)(X,{credential:e,revealed:f.has(e.id),copied:p===e.id,onToggleReveal:()=>m(e.id),onCopy:()=>h(e)},e.id))}),(0,D.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Webhook secret rotated 30 Jun 2026 — connectors signing with the retired value will fail CT-04.`}),(0,D.jsx)(w,{}),(0,D.jsxs)(`div`,{className:`pop-vault-section-head`,children:[(0,D.jsx)(`span`,{className:`pop-section-label`,children:`Production gate`}),(0,D.jsx)(`span`,{style:{flexShrink:0},children:l?(0,D.jsx)(T,{size:`sm`,color:`green`,label:`Issued`}):o?(0,D.jsx)(T,{size:`sm`,color:`green`,label:`Open`}):(0,D.jsx)(T,{size:`sm`,color:`default`,label:`Locked`})})]}),(0,D.jsx)(y,{gap:0,role:`list`,"aria-label":`Production gate checklist`,children:n.map(e=>(0,D.jsxs)(`div`,{className:`pop-gate-row`,role:`listitem`,children:[e.satisfied?(0,D.jsx)(`span`,{style:{color:j,display:`inline-flex`,flexShrink:0},children:(0,D.jsx)(i,{icon:g,size:`xsm`,color:`inherit`})}):(0,D.jsx)(`span`,{style:{color:N,display:`inline-flex`,flexShrink:0},children:(0,D.jsx)(i,{icon:a,size:`xsm`,color:`inherit`})}),(0,D.jsx)(r,{type:`body`,size:`sm`,color:e.satisfied?`primary`:`secondary`,children:e.label}),e.sub==null?null:(0,D.jsx)(`span`,{className:`pop-mono`,style:{marginLeft:`auto`,color:`var(--color-text-secondary)`},children:e.sub})]},e.id))}),l?(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)(y,{gap:0,children:G.map(e=>(0,D.jsx)(X,{credential:e,revealed:f.has(e.id),copied:p===e.id,onToggleReveal:()=>m(e.id),onCopy:()=>h(e)},e.id))}),(0,D.jsxs)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:[`Issued `,B,` by `,L.noor.name,`. Live keys inherit the sandbox webhook route until launch review.`]})]}):o?(0,D.jsxs)(`div`,{className:`pop-gate-open`,children:[(0,D.jsxs)(v,{gap:2,vAlign:`center`,children:[(0,D.jsx)(`span`,{style:{color:k,display:`inline-flex`},children:(0,D.jsx)(i,{icon:u,size:`sm`,color:`inherit`})}),(0,D.jsx)(r,{type:`label`,size:`sm`,children:`All checks green — gate open`})]}),(0,D.jsx)(r,{type:`supporting`,size:`xsm`,color:`secondary`,children:`Issuing creates the live key pair and ticks milestone 5. This is logged to the console.`}),(0,D.jsx)(v,{gap:2,children:(0,D.jsx)(C,{label:`Issue production credentials`,variant:`primary`,size:`sm`,icon:(0,D.jsx)(i,{icon:s,size:`sm`}),onClick:_})})]}):(0,D.jsxs)(`div`,{className:`pop-gate-locked`,children:[(0,D.jsxs)(v,{gap:2,vAlign:`center`,children:[(0,D.jsx)(i,{icon:c,size:`sm`,color:`secondary`}),(0,D.jsx)(r,{type:`label`,size:`sm`,color:`secondary`,children:`Production keys locked`})]}),(0,D.jsxs)(r,{type:`supporting`,size:`xsm`,color:`secondary`,hasTabularNumbers:!0,children:[`Unlocks when all 8 conformance tests are green — currently `,d,`/8. Fix and re-run the failing tests in the sandbox console.`]})]})]})})})}function _e(e){return e instanceof HTMLElement&&(e.tagName===`INPUT`||e.tagName===`TEXTAREA`||e.isContentEditable)}function ve(e){return!e.needsFix||e.fixApplied?{status:`pass`,lines:e.passLines}:{status:`fail`,lines:e.failLines??e.passLines}}function Z(){let e=(0,E.useRef)(null),t=ue(e),n=S(`(max-width: 1279px)`),a=S(`(max-width: 1023px)`),o=t>0?t<1200:n,c=t>0?t<1e3:a,u=c?200:o?240:280,d=o?300:340,f={showEndpoint:!c,showDuration:!o&&!c},[p,m]=(0,E.useState)(se),[h,_]=(0,E.useState)(ce),[v,y]=(0,E.useState)(100),[b,x]=(0,E.useState)(0),[w,O]=(0,E.useState)(`CT-04`),[N,P]=(0,E.useState)(!1),[F,V]=(0,E.useState)(()=>new Set),[H,U]=(0,E.useState)(null),[W,K]=(0,E.useState)(!1),[fe,q]=(0,E.useState)(``),J=(0,E.useRef)(new Map),Y=(0,E.useRef)(null),X=p.filter(e=>e.status===`pass`).length,Z=p.filter(e=>e.status===`fail`).length,ye=p.filter(e=>e.status===`not-run`).length,be=[{id:`conformance`,label:`All conformance tests green`,satisfied:X===8,sub:`${X}/8`},{id:`webhook`,label:`Webhook endpoint verified`,satisfied:!0,sub:`30 Jun`},{id:`mtls`,label:`Mutual TLS client cert uploaded`,satisfied:!0,sub:`18 Jun`}],Q=be.every(e=>e.satisfied),$=le(X,Q,N),xe=$.filter(e=>e.state===`done`).length,Se=`Readiness ${Math.round(xe/$.length*100)}% · ${xe}/${$.length} milestones`,Ce=(0,E.useCallback)(e=>{let t=z[b%z.length],n=b+1;x(e=>e+1);let r=p.filter(t=>e.includes(t.id));if(r.length===0)return;let i=[],a=v;i.push({id:a++,stamp:t,kind:`header`,text:`── run #${n} · ${B} ${t} · ${r.length===1?r[0].id:`${r.length} tests`} ──`});let o=new Map;for(let e of r){let t=ve(e);o.set(e.id,t.status);for(let e of t.lines)i.push({id:a++,stamp:e.at,kind:e.kind,text:e.text})}y(a),_(e=>[...e,...i]),m(e=>e.map(e=>o.has(e.id)?{...e,status:o.get(e.id),lastRun:`${B} · ${t.slice(0,5)}`}:e));let s=p.filter(e=>o.has(e.id)?o.get(e.id)===`pass`:e.status===`pass`).length,c=r.map(e=>`${e.id} ${o.get(e.id)===`pass`?`passed`:`failed`}`).join(`, `);s===8&&X<8?(q(`${c}. All 8 conformance tests green — sandbox conformance milestone complete, production credential gate open.`),K(!0)):q(`${c}. ${s} of 8 tests green.`)},[p,b,v,X]),we=(0,E.useCallback)(e=>{let t=p.find(t=>t.id===e);t?.remediation==null||t.fixApplied||(m(t=>t.map(t=>t.id===e?{...t,fixApplied:!0}:t)),_(e=>[...e,{id:v,stamp:``,kind:`info`,text:t.remediation.logText}]),y(e=>e+1),q(`${t.remediation.title} — fix applied. Re-run ${e} to verify.`))},[p,v]),Te=(0,E.useCallback)(()=>{!Q||N||(P(!0),_(e=>[...e,{id:v,stamp:``,kind:`pass`,text:`✔ credentials: production key pair issued (…${G[0].value.slice(-4)}) · milestone 5 complete`}]),y(e=>e+1),q(`Production credentials issued. Milestone 5 complete — launch review is now available.`))},[Q,N,v]),Ee=(0,E.useCallback)(()=>{_([]),q(`Console cleared.`)},[]),De=(0,E.useCallback)(e=>{V(t=>{let n=new Set(t);return n.has(e)?n.delete(e):n.add(e),n})},[]),Oe=(0,E.useCallback)(e=>{try{navigator.clipboard?.writeText(e.value).catch(()=>void 0)}catch{}U(e.id),q(`${e.label} copied.`)},[]),ke=(0,E.useCallback)(()=>{K(!0)},[]),Ae=(0,E.useCallback)(()=>{K(!1),Y.current?.focus()},[]),je=(0,E.useCallback)(()=>{let e=p.find(e=>e.status!==`pass`)??p[0];O(e.id),J.current.get(e.id)?.focus()},[p]),Me=e=>{e.key!==`Escape`||_e(e.target)||(c&&W?Ae():w!=null&&O(null))},Ne=e=>t=>{let n=J.current;t==null?n.delete(e):n.set(e,t)},Pe=!c||W;return(0,D.jsxs)(`div`,{className:I,onKeyDown:Me,children:[(0,D.jsx)(`style`,{children:oe}),(0,D.jsx)(`span`,{"aria-live":`polite`,role:`status`,className:`pop-visually-hidden`,children:fe}),(0,D.jsx)(te,{height:`fill`,header:(0,D.jsx)(re,{padding:0,hasDivider:!0,children:(0,D.jsxs)(`div`,{className:`pop-header-bar`,children:[(0,D.jsx)(de,{}),(0,D.jsx)(r,{type:`label`,size:`sm`,children:`Partnerly`}),(0,D.jsxs)(r,{type:`supporting`,size:`xsm`,color:`secondary`,maxLines:1,children:[`Partner Portal · `,R.partner,` · `,R.appName,` · `,R.apiVersion]}),(0,D.jsx)(`span`,{style:{flexShrink:0},children:(0,D.jsx)(T,{size:`sm`,color:`orange`,label:`SANDBOX`})}),(0,D.jsx)(`span`,{style:{flex:1},"aria-hidden":!0}),(0,D.jsx)(`span`,{className:`pop-header-stat`,children:Se}),(0,D.jsx)(ie,{name:L.noor.name,size:`small`})]})}),content:(0,D.jsx)(ne,{padding:0,children:(0,D.jsxs)(`div`,{ref:e,className:`pop-view-root`,children:[(0,D.jsx)(pe,{milestones:$,railW:u,onOpenConformance:je,onOpenVault:c?ke:()=>Y.current?.focus()}),(0,D.jsxs)(`div`,{className:`pop-main-col`,children:[(0,D.jsxs)(`div`,{className:`pop-toolbar`,children:[(0,D.jsx)(`span`,{className:`pop-section-label`,children:`Conformance suite`}),(0,D.jsx)(C,{label:`Run all`,variant:`primary`,size:`sm`,icon:(0,D.jsx)(i,{icon:l,size:`sm`}),onClick:()=>Ce(p.map(e=>e.id))}),(0,D.jsxs)(`span`,{className:`pop-chip`,style:{color:j,borderColor:j},children:[(0,D.jsx)(i,{icon:g,size:`xsm`,color:`inherit`}),`${X} pass`]}),(0,D.jsxs)(`span`,{className:`pop-chip`,style:Z>0?{color:M,borderColor:M,backgroundColor:ae}:void 0,children:[(0,D.jsx)(i,{icon:ee,size:`xsm`,color:`inherit`}),`${Z} fail`]}),(0,D.jsx)(`span`,{className:`pop-chip`,style:{color:`var(--color-text-secondary)`},children:`${ye} not run`}),(0,D.jsx)(`span`,{style:{flex:1},"aria-hidden":!0}),c?(0,D.jsxs)(`button`,{type:`button`,ref:Y,className:`pop-chip pop-focusable pop-fade`,style:{cursor:`pointer`,...Q&&!N?{borderColor:k,backgroundColor:A}:{}},"aria-expanded":W,onClick:ke,children:[(0,D.jsx)(i,{icon:s,size:`xsm`,color:`inherit`}),`Vault`]}):null]}),(0,D.jsx)(`div`,{className:`pop-test-scroll`,children:p.map(e=>(0,D.jsx)(me,{test:e,expanded:w===e.id,geometry:f,onToggleExpand:()=>O(t=>t===e.id?null:e.id),onRun:()=>Ce([e.id]),onApplyFix:()=>we(e.id),rowRef:Ne(e.id)},e.id))}),(0,D.jsx)(he,{lines:h,onClear:Ee})]}),Pe?(0,D.jsx)(ge,{isOverlay:c,width:d,gateItems:be,gateOpen:Q,prodIssued:N,greenCount:X,revealedKeys:F,copiedKeyId:H,onToggleReveal:De,onCopy:Oe,onIssue:Te,onClose:Ae}):null]})})})]})}export{Z as default};