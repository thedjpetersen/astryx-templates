import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{i as r,t as i,x as a}from"./themeProps-C0N1XsMS.js";import{t as o}from"./getKey-D1BTilm0.js";import{t as s}from"./Text-DlKHZgO2.js";import{t as c}from"./ChatComposer-BJifiG-n.js";import{t as l}from"./Icon-DNqmP2EH.js";import{t as u}from"./plus-BL8QrUxz.js";import{t as d}from"./refresh-cw-Czdjsukm.js";import{t as f}from"./Stack-D1osmZNA.js";import{t as p}from"./HStack-2WTukjNp.js";import{t as m}from"./StackItem-Ca9P7L2I.js";import{n as h,t as g}from"./LayoutContent-CCL91W7X.js";import{t as _}from"./LayoutHeader-Cy2mWoMf.js";import{t as v}from"./LayoutPanel-Cqp-l8I4.js";import{t as y}from"./Heading-BBqhYPTB.js";import{t as b}from"./Badge-0Tj9omHc.js";import{n as x}from"./VisuallyHidden-GwTplhyF.js";import{t as S}from"./useMediaQuery-BvG63aw7.js";import{t as C}from"./Button-Cj_m5AlK.js";import{t as w}from"./Divider-BHIBe6GQ.js";import{t as T}from"./Selector-MHFrlr1z.js";import{t as E}from"./StatusDot-sQCtn0hI.js";import{t as D}from"./CodeBlock-BJj4etYB.js";import{t as O}from"./IconButton-BcMuE21n.js";import{t as k}from"./Timestamp-mI6kyBux.js";import{i as A,n as j,r as M,t as N}from"./ChatSystemMessage-ssxcbRYz.js";import{t as P}from"./ChatMessageMetadata-DTO2gJfF.js";import{t as F}from"./ChatLayout-CqDPWNYP.js";import{t as I}from"./Avatar-DyaNw-yT.js";import{n as L,t as R}from"./SegmentedControlItem-BDZ-RlbU.js";var z=e(t(),1),B=n(),V={root:{k1xSpc:`x78zum5`,kXwgrk:`xdt5ytf`,keoZOQ:`xtbrsbv`,$$css:!0},statusIcon:{kVAEAm:`x1n2onr6`,k1xSpc:`x3nfvp2`,kGNEyG:`x6s0dn4`,kjj79g:`xl56j7k`,kmuXW:`x2lah0s`,kzqmXN:`x1kky2od`,kZKoxP:`xlup9mm`,kaIpWk:`xjspbzw`,$$css:!0},nodePill:{kmuXW:`x2lah0s`,$$css:!0},colorPending:{kMwMTN:`xnbbluu`,$$css:!0},colorRunning:{kMwMTN:`xqwr325`,$$css:!0},colorComplete:{kMwMTN:`xtjic6`,$$css:!0},colorError:{kMwMTN:`xjt36v0`,$$css:!0}},H={pending:`clock`,running:null,complete:`check`,error:`close`},U={pending:V.colorPending,running:V.colorRunning,complete:V.colorComplete,error:V.colorError};function W(e){return o(e.key,()=>[e.name,e.status??`complete`,e.target??``,e.node??``,e.duration??``,e.additions?.toString()??``,e.deletions?.toString()??``,e.errorMessage??``].join(``))}function G({call:e}){let t=e.status??`complete`,n=e.resultDetail!=null,[r,i]=(0,z.useState)(!1),o=n?()=>i(e=>!e):void 0,s=(0,B.jsxs)(`div`,{role:n?`button`:void 0,tabIndex:n?0:void 0,onClick:o,onKeyDown:n?e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),o?.())}:void 0,...{0:{className:`x78zum5 x6s0dn4 x1s4dlld xjwf9q1 x13f7esw`},1:{className:`x78zum5 x6s0dn4 x1s4dlld xjwf9q1 x13f7esw x1ypdohk xh6dtrn x7a5moj xtedp8i xe9uy6x`}}[!!n<<0],children:[(0,B.jsx)(`span`,{title:t===`error`?e.errorMessage:void 0,...a(V.statusIcon,U[t]),children:t===`running`||t===`pending`?(0,B.jsx)(x,{size:`sm`,shade:`subtle`}):(0,B.jsxs)(B.Fragment,{children:[(0,B.jsx)(`span`,{className:`x10l6tqk x10a8y8t x1pjcqnp xtwfq29 x1xyvc85`}),(0,B.jsx)(`span`,{className:`x1n2onr6 x3nfvp2`,children:(0,B.jsx)(l,{icon:H[t]??`check`,size:`xsm`,color:`inherit`})})]})}),(0,B.jsx)(`span`,{className:`x141an7d x1ltkj2j x9m5x89 x1e4wzip xv1l7n4 xuxw1ft xb3r6kr xlyipyv xs83m0k x13n9wmd`,children:e.name}),e.node!=null&&(0,B.jsx)(b,{label:e.node,variant:`neutral`,xstyle:V.nodePill}),e.target!=null&&(0,B.jsx)(`span`,{className:`x141an7d x1ltkj2j x9ynric xnbbluu xuxw1ft xb3r6kr xlyipyv x1g3ib7 xeuugli`,children:e.target}),(e.additions!=null||e.deletions!=null||e.stats!=null)&&(0,B.jsxs)(`span`,{className:`x78zum5 x6s0dn4 xzye2dw x141an7d x1ltkj2j x9ynric xnbbluu x2lah0s`,children:[e.additions!=null&&(0,B.jsxs)(`span`,{className:`xtjic6`,children:[`+`,e.additions]}),e.deletions!=null&&(0,B.jsxs)(`span`,{className:`xjt36v0`,children:[`-`,e.deletions]}),e.stats]}),e.duration!=null&&t===`complete`&&(0,B.jsx)(`span`,{className:`x141an7d x1ltkj2j x9ynric xnbbluu xuxw1ft x2lah0s`,children:e.duration}),n&&(0,B.jsx)(`span`,{...{0:{className:`x3nfvp2 x6s0dn4 xl56j7k x2lah0s x6jxa94 x1v9usgg xnbbluu x1ob6yzd xvc5jky`},1:{className:`x3nfvp2 x6s0dn4 xl56j7k x2lah0s x6jxa94 x1v9usgg xnbbluu x1ob6yzd xvc5jky x19jd1h0`}}[!!r<<0],children:(0,B.jsx)(l,{icon:`chevronDown`,size:`xsm`,color:`inherit`})})]});return n?(0,B.jsxs)(`div`,{children:[s,r&&(0,B.jsx)(`div`,{className:`x1f43n9v x1wesfrj`,children:e.resultDetail})]}):s}function K(e){let{calls:t,label:n,isExpanded:o,defaultIsExpanded:s,onExpandedChange:c,xstyle:u,className:d,style:f,ref:p,...m}=e,[h,g]=(0,z.useState)(s??!1),_=o!==void 0,v=_?o:h,y=(0,z.useCallback)(()=>{let e=!v;_||g(e),c?.(e)},[v,_,c]);if(t.length===0)return null;if(t.length===1)return(0,B.jsx)(`div`,{ref:p,...r(i(`chat-tool-calls`),a(V.root,u),d,f),...m,children:(0,B.jsx)(G,{call:t[0]})});let b=t[t.length-1],S=b.status??`complete`;return(0,B.jsxs)(`div`,{ref:p,...r(i(`chat-tool-calls`),a(V.root,u),d,f),...m,children:[(0,B.jsxs)(`div`,{role:`button`,tabIndex:0,"aria-expanded":v,onClick:y,onKeyDown:e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),y())},className:`x78zum5 x6s0dn4 x1s4dlld xjwf9q1 x13f7esw x1ypdohk`,children:[v?(0,B.jsxs)(B.Fragment,{children:[(0,B.jsx)(`span`,{className:`x3nfvp2 x6s0dn4 xl56j7k x2lah0s x1kky2od xlup9mm xv1l7n4`,children:(0,B.jsx)(l,{icon:`wrench`,size:`sm`,color:`inherit`})}),(0,B.jsxs)(`span`,{className:`x141an7d x1ltkj2j x9ynric x1e4wzip xv1l7n4`,children:[t.length,` tool calls`]})]}):(0,B.jsxs)(B.Fragment,{children:[(0,B.jsx)(`span`,{...a(V.statusIcon,U[S]),children:S===`running`||S===`pending`?(0,B.jsx)(x,{size:`sm`,shade:`subtle`}):(0,B.jsxs)(B.Fragment,{children:[(0,B.jsx)(`span`,{className:`x10l6tqk x10a8y8t x1pjcqnp xtwfq29 x1xyvc85`}),(0,B.jsx)(`span`,{className:`x1n2onr6 x3nfvp2`,children:(0,B.jsx)(l,{icon:H[S]??`check`,size:`xsm`,color:`inherit`})})]})}),(0,B.jsx)(`span`,{className:`x141an7d x1ltkj2j x9m5x89 x1e4wzip xv1l7n4 xuxw1ft xb3r6kr xlyipyv xs83m0k x13n9wmd`,children:b.name}),b.target!=null&&(0,B.jsx)(`span`,{className:`x141an7d x1ltkj2j x9ynric xnbbluu xuxw1ft xb3r6kr xlyipyv x1g3ib7 xeuugli`,children:b.target})]}),(0,B.jsx)(`span`,{className:`x3nfvp2 x6s0dn4 x1lsbc85 x141an7d x1ltkj2j x9ynric xnbbluu x2lah0s`,children:!v&&(0,B.jsxs)(B.Fragment,{children:[(0,B.jsx)(l,{icon:`wrench`,size:`xsm`,color:`inherit`}),t.length]})}),(0,B.jsx)(`span`,{...{0:{className:`x3nfvp2 x6s0dn4 xl56j7k x2lah0s x6jxa94 x1v9usgg xnbbluu x1ob6yzd`},1:{className:`x3nfvp2 x6s0dn4 xl56j7k x2lah0s x6jxa94 x1v9usgg xnbbluu x1ob6yzd x19jd1h0`}}[!!v<<0],children:(0,B.jsx)(l,{icon:`chevronDown`,size:`xsm`,color:`inherit`})})]}),(0,B.jsx)(`div`,{...{0:{className:`xrvj5dj xihq33y xb0j27v`},1:{className:`xrvj5dj xb0j27v x1tu4anv`}}[!!v<<0],children:(0,B.jsx)(`div`,{className:`xb3r6kr x2lwn1j`,children:(0,B.jsx)(`div`,{className:`x78zum5 xdt5ytf x7a5moj xtedp8i`,children:t.map(e=>(0,B.jsx)(G,{call:e},W(e)))})})})]})}K.displayName=`ChatToolCalls`;var q={chatColumn:{height:`100%`,minHeight:0},chatFill:{flex:1,minHeight:0},artifactColumn:{height:`100%`,minHeight:0},artifactHeader:{alignItems:`center`,paddingInline:`var(--spacing-4)`,paddingBlock:`var(--spacing-3)`,flexWrap:`wrap`},artifactTitle:{minWidth:0},artifactBody:{minHeight:0,overflowY:`auto`,padding:`var(--spacing-4)`},artifactFooter:{alignItems:`center`,paddingInline:`var(--spacing-4)`,paddingBlock:`var(--spacing-2)`},versionChipRow:{paddingTop:`var(--spacing-1)`},headerTitle:{minWidth:0},buttonTapTarget:{height:40},iconTapTarget:{width:40,height:40},segmentedTapTarget:{"--size-element-sm":`40px`}},J=`Churn risk scoring query`,Y=`atlas-swe-2`,X=`churn_risk_scores.sql`,Z={you:{name:`Dana Whitfield`},assistant:{name:`Forge Assist`}},Q=[{id:`v1`,label:`v1 · Baseline 30-day score`,savedAt:`2026-07-01T14:02:00`,code:`-- churn_risk_scores.sql
-- v1: baseline churn-risk score from 30-day product activity.
WITH activity AS (
  SELECT
    account_id,
    COUNT(*) AS events_30d,
    COUNT(DISTINCT user_id) AS active_seats
  FROM product_events
  WHERE event_at >= DATE '2026-06-01'
  GROUP BY account_id
)
SELECT
  a.account_id,
  acc.plan_tier,
  a.events_30d,
  a.active_seats,
  ROUND(1.0 - LEAST(a.events_30d / 500.0, 1.0), 3) AS churn_risk
FROM activity a
JOIN accounts acc
  ON acc.id = a.account_id
ORDER BY churn_risk DESC;`},{id:`v2`,label:`v2 · 90-day window with decay`,savedAt:`2026-07-01T14:09:00`,code:`-- churn_risk_scores.sql
-- v2: 90-day trailing window; recent weeks weigh more (0.85 decay).
WITH weekly AS (
  SELECT
    account_id,
    DATE_TRUNC('week', event_at) AS week_start,
    COUNT(*) AS events,
    COUNT(DISTINCT user_id) AS active_seats
  FROM product_events
  WHERE event_at >= DATE '2026-04-02'
  GROUP BY account_id, DATE_TRUNC('week', event_at)
),
decayed AS (
  SELECT
    account_id,
    SUM(events * POWER(0.85,
      DATE_DIFF('week', week_start, DATE '2026-07-01'))) AS weighted_events,
    MAX(active_seats) AS peak_seats
  FROM weekly
  GROUP BY account_id
)
SELECT
  d.account_id,
  acc.plan_tier,
  ROUND(d.weighted_events, 1) AS weighted_events,
  d.peak_seats,
  ROUND(1.0 - LEAST(d.weighted_events / 1200.0, 1.0), 3) AS churn_risk
FROM decayed d
JOIN accounts acc
  ON acc.id = d.account_id
ORDER BY churn_risk DESC;`},{id:`v3`,label:`v3 · Plan-tier weights + tickets`,savedAt:`2026-07-01T14:17:00`,code:`-- churn_risk_scores.sql
-- v3: adds plan-tier weighting and an open-ticket pressure signal.
WITH weekly AS (
  SELECT
    account_id,
    DATE_TRUNC('week', event_at) AS week_start,
    COUNT(*) AS events,
    COUNT(DISTINCT user_id) AS active_seats
  FROM product_events
  WHERE event_at >= DATE '2026-04-02'
  GROUP BY account_id, DATE_TRUNC('week', event_at)
),
decayed AS (
  SELECT
    account_id,
    SUM(events * POWER(0.85,
      DATE_DIFF('week', week_start, DATE '2026-07-01'))) AS weighted_events,
    MAX(active_seats) AS peak_seats
  FROM weekly
  GROUP BY account_id
),
tickets AS (
  SELECT
    account_id,
    COUNT(*) FILTER (WHERE status = 'open') AS open_tickets
  FROM support_tickets
  WHERE opened_at >= DATE '2026-04-02'
  GROUP BY account_id
)
SELECT
  d.account_id,
  acc.plan_tier,
  ROUND(d.weighted_events, 1) AS weighted_events,
  COALESCE(t.open_tickets, 0) AS open_tickets,
  ROUND(
    (1.0 - LEAST(d.weighted_events / 1200.0, 1.0))
      * CASE acc.plan_tier
          WHEN 'enterprise' THEN 1.25
          WHEN 'growth' THEN 1.0
          ELSE 0.8
        END
      + LEAST(COALESCE(t.open_tickets, 0) * 0.03, 0.15),
    3) AS churn_risk
FROM decayed d
JOIN accounts acc
  ON acc.id = d.account_id
LEFT JOIN tickets t
  ON t.account_id = d.account_id
ORDER BY churn_risk DESC;`}],$=Q[Q.length-1].id,ee=[{id:`m1`,sender:`user`,time:`2026-07-01T14:01:00`,text:`Write a SQL query that scores every account for churn risk using product activity. We are on Trino; the events live in product_events.`},{id:`m2`,sender:`assistant`,time:`2026-07-01T14:02:00`,text:`Created churn_risk_scores.sql. v1 scores each account on 30-day event volume normalized against a 500-events/month healthy baseline, joined to accounts for plan tier. Accounts sort riskiest first.`,toolCall:{name:`create_artifact`,duration:`1.8s`,additions:21,deletions:0},versionId:`v1`},{id:`m3`,sender:`user`,time:`2026-07-01T14:07:00`,text:`30 days is too twitchy — accounts look churned after one quiet sprint. Can we look at a 90-day window but still favor recent behavior?`},{id:`m4`,sender:`assistant`,time:`2026-07-01T14:09:00`,text:`Updated to v2: activity is bucketed by week over a 90-day trailing window, then exponentially decayed at 0.85 per week — a quiet fortnight now dents the score instead of zeroing it. The healthy baseline moves to 1,200 weighted events.`,toolCall:{name:`update_artifact`,duration:`2.4s`,additions:19,deletions:8},versionId:`v2`},{id:`m5`,sender:`user`,time:`2026-07-01T14:14:00`,text:`Nice. Last thing: enterprise accounts deserve extra caution, and open support tickets should push risk up a bit.`},{id:`m6`,sender:`assistant`,time:`2026-07-01T14:17:00`,text:`Done in v3. Enterprise scores are amplified 1.25x (starter dampened to 0.8x), and each open ticket adds 0.03 risk, capped at +0.15 so tickets nudge rather than dominate. Ready to run against the warehouse.`,toolCall:{name:`update_artifact`,duration:`2.1s`,additions:24,deletions:3},versionId:`v3`}];function te({message:e,isCompact:t,onOpenVersion:n}){let r=e.sender===`user`;return(0,B.jsxs)(M,{sender:e.sender,avatar:r?void 0:(0,B.jsx)(I,{name:Z.assistant.name,size:`small`}),children:[(0,B.jsx)(j,{name:r?void 0:Z.assistant.name,metadata:(0,B.jsx)(P,{timestamp:(0,B.jsx)(k,{value:e.time,format:`time`})}),children:e.text}),e.toolCall!=null&&(0,B.jsx)(K,{calls:[{key:`${e.id}-tool`,name:e.toolCall.name,target:X,status:`complete`,duration:e.toolCall.duration,additions:e.toolCall.additions,deletions:e.toolCall.deletions}]}),e.versionId!=null&&(0,B.jsx)(`div`,{style:q.versionChipRow,children:(0,B.jsx)(C,{label:`Open ${X} · ${e.versionId}`,variant:`secondary`,size:`sm`,style:t?q.buttonTapTarget:void 0,onClick:()=>n(e.versionId)})})]})}function ne(){let[e,t]=(0,z.useState)($),[n,r]=(0,z.useState)(!1),[i,a]=(0,z.useState)(``),[o,x]=(0,z.useState)(`artifact`),j=S(`(max-width: 768px)`),M=S(`(max-width: 1200px)`),P=j?q.buttonTapTarget:void 0,I=Q.find(t=>t.id===e)??Q[Q.length-1],V=I.code.split(`
`).length,H=e=>{t(e),r(!1)},U=e=>{H(e),j&&x(`artifact`)},W=()=>{typeof navigator<`u`&&navigator.clipboard!=null&&navigator.clipboard.writeText(I.code),r(!0)},G=(0,B.jsx)(f,{direction:`vertical`,style:q.chatColumn,children:(0,B.jsx)(m,{size:`fill`,style:q.chatFill,children:(0,B.jsx)(F,{composer:(0,B.jsx)(c,{placeholder:`Ask Forge Assist to refine the query...`,value:i,onChange:a,onSubmit:()=>a(``)}),children:(0,B.jsxs)(A,{density:`balanced`,children:[(0,B.jsx)(N,{variant:`divider`,children:`Wednesday, July 1`}),(0,B.jsx)(N,{children:`Forge Assist can create and edit workspace files.`}),ee.map(e=>(0,B.jsx)(te,{message:e,isCompact:j,onOpenVersion:U},e.id))]})})})}),K=(0,B.jsxs)(f,{direction:`vertical`,style:q.artifactColumn,children:[(0,B.jsxs)(p,{gap:2,style:q.artifactHeader,children:[(0,B.jsx)(m,{size:`fill`,style:q.artifactTitle,children:(0,B.jsxs)(p,{gap:2,vAlign:`center`,children:[(0,B.jsx)(y,{level:3,maxLines:1,children:X}),(0,B.jsx)(b,{label:`SQL`,variant:`neutral`})]})}),(0,B.jsx)(T,{label:`Version`,isLabelHidden:!0,size:`sm`,options:Q.map(e=>({value:e.id,label:e.label})),value:I.id,onChange:H,style:P}),(0,B.jsx)(C,{label:n?`Copied`:`Copy`,variant:`secondary`,size:`sm`,style:P,onClick:W}),(0,B.jsx)(C,{label:`Open in editor`,size:`sm`,style:P,onClick:()=>{}})]}),(0,B.jsx)(w,{}),(0,B.jsx)(m,{size:`fill`,style:q.artifactBody,children:(0,B.jsx)(D,{code:I.code,language:`sql`,width:`100%`,hasLineNumbers:!0})}),(0,B.jsx)(w,{}),(0,B.jsxs)(p,{gap:2,style:q.artifactFooter,children:[(0,B.jsx)(m,{size:`fill`,children:(0,B.jsxs)(s,{type:`supporting`,color:`secondary`,maxLines:1,children:[V,` lines · generated by `,Y]})}),(0,B.jsxs)(s,{type:`supporting`,color:`secondary`,children:[`Saved `,(0,B.jsx)(k,{value:I.savedAt,format:`time`})]})]})]});return(0,B.jsx)(h,{height:`fill`,header:(0,B.jsx)(_,{hasDivider:!0,children:(0,B.jsxs)(p,{gap:3,vAlign:`center`,children:[(0,B.jsx)(m,{size:`fill`,style:q.headerTitle,children:(0,B.jsxs)(p,{gap:2,vAlign:`center`,children:[(0,B.jsx)(y,{level:1,maxLines:1,children:J}),!j&&(0,B.jsx)(b,{label:Y,variant:`neutral`}),!j&&(0,B.jsx)(E,{variant:`success`,label:`All changes saved`})]})}),j&&(0,B.jsxs)(L,{label:`Workspace view`,value:o,onChange:x,size:`sm`,style:q.segmentedTapTarget,children:[(0,B.jsx)(R,{label:`Chat`,value:`chat`}),(0,B.jsx)(R,{label:`Artifact`,value:`artifact`})]}),(0,B.jsx)(O,{label:`Regenerate response`,tooltip:`Regenerate response`,icon:(0,B.jsx)(l,{icon:d,size:`sm`,color:`inherit`}),variant:`ghost`,style:j?q.iconTapTarget:void 0,onClick:()=>{}}),j?(0,B.jsx)(O,{label:`New session`,tooltip:`New session`,icon:(0,B.jsx)(l,{icon:u,size:`sm`,color:`inherit`}),variant:`ghost`,style:q.iconTapTarget,onClick:()=>{}}):(0,B.jsx)(C,{label:`New session`,variant:`secondary`,icon:(0,B.jsx)(l,{icon:u,size:`sm`}),onClick:()=>{}})]})}),start:j?void 0:(0,B.jsx)(v,{hasDivider:!0,width:M?340:400,padding:0,label:`Conversation`,children:G}),content:(0,B.jsx)(g,{padding:0,children:j&&o===`chat`?G:K})})}export{ne as default};