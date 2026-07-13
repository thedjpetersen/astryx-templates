import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-zBEZLbyF.js";import{t as i}from"./Icon-C7Tu044I.js";import{t as a}from"./file-code-corner-Cn3V2frS.js";import{t as o}from"./file-text-B0xnk4Ep.js";import{t as s}from"./folder-Lbp75sY3.js";import{t as c}from"./history-D5CXSwAS.js";import{t as l}from"./link-2-CFa-NHax.js";import{t as ee}from"./rotate-ccw-ByfrhOGN.js";import{s as te,w as ne}from"./index-Csn9cgK2.js";import{t as u}from"./HStack-2WTukjNp.js";import{t as d}from"./VStack-B8U-hI0Y.js";import{t as f}from"./StackItem-Ca9P7L2I.js";import{n as p,t as m}from"./LayoutContent-CCL91W7X.js";import{t as re}from"./LayoutHeader-Cy2mWoMf.js";import{t as ie}from"./Heading-7iAMrwFB.js";import{t as ae}from"./Badge-0Tj9omHc.js";import{t as h}from"./Button-DSFH9r96.js";import{t as g}from"./Divider-BHIBe6GQ.js";import{t as oe}from"./StatusDot-sQCtn0hI.js";import{t as se}from"./Popover-CfDx0YqN.js";import{t as ce}from"./TextInput-DlydPvPW.js";import{t as le}from"./TreeList-B-cPr03D.js";import{t as ue}from"./Dialog-CIi02MAt.js";import{t as de}from"./Markdown-5-7Y18Pu.js";import{t as fe}from"./DialogHeader-Dv7QlU8X.js";import{t as pe}from"./Banner-RYuXkKDw.js";import{t as me}from"./CodeBlock-D3roxmVo.js";import{t as he}from"./Avatar-DyaNw-yT.js";import{i as ge,n as _,r as v,t as _e}from"./ChatSystemMessage-CviOeYd5.js";import{t as y}from"./ChatLayout-BD1XFIn5.js";import{t as b}from"./TextArea-CWGbjA5V.js";import{n as ve,t as x}from"./SegmentedControlItem-fgmDI7nJ.js";import{n as ye,t as S}from"./Tab-Duk5Y9DK.js";import{n as be,t as C}from"./BreadcrumbItem-DI3TMJoy.js";var w=e(t(),1),T=n(),E={body:{height:`min(540px, 62vh)`},bodyRow:{height:`100%`},rail:{width:280,height:`100%`,borderRight:`var(--border-width) solid var(--color-border)`,display:`flex`,flexDirection:`column`},railHeader:{padding:`var(--spacing-3)`,paddingBottom:`var(--spacing-2)`},railScroll:{flex:1,overflowY:`auto`,paddingInline:`var(--spacing-2)`,paddingBottom:`var(--spacing-3)`},railScrollCompact:{maxHeight:220,overflowY:`auto`,paddingInline:`var(--spacing-2)`,paddingBottom:`var(--spacing-2)`},viewer:{height:`100%`,minWidth:0,display:`flex`,flexDirection:`column`},viewerToolbar:{padding:`var(--spacing-3)`,paddingBottom:`var(--spacing-2)`},viewerToolbarWrap:{flexWrap:`wrap`},viewerScroll:{flex:1,overflowY:`auto`,paddingInline:`var(--spacing-4)`,paddingBottom:`var(--spacing-4)`},viewerScrollCompact:{paddingInline:`var(--spacing-3)`,paddingBottom:`var(--spacing-3)`},eyebrow:{fontSize:11,letterSpacing:`0.08em`,textTransform:`uppercase`},eyebrowRow:{paddingInline:`var(--spacing-2)`,paddingBlock:`var(--spacing-2)`},noMatches:{padding:`var(--spacing-3)`},popoverBody:{padding:`var(--spacing-3)`},versionRow:{paddingBlock:`var(--spacing-2)`},chatColumn:{height:`100%`,maxWidth:760,marginInline:`auto`},composerCard:{border:`var(--border-width) solid var(--color-border)`,borderRadius:`var(--radius-container)`,backgroundColor:`var(--color-background-card)`,padding:`var(--spacing-3)`,marginBlock:`var(--spacing-2)`}};function xe(e){let[t,n]=(0,w.useState)(0);return(0,w.useEffect)(()=>{let t=e.current;if(t==null)return;let r=new ResizeObserver(e=>{let t=e[0]?.contentRect;t!=null&&n(t.width)});return r.observe(t),()=>r.disconnect()},[e]),t}var D=`Atlas Copilot`,Se=`queue migration prep`,Ce={personal:`Personal`,team:`Atlas team`},O=[{id:`p-memory`,path:`memory/MEMORY.md`,size:`4.2 KB`,edited:`2 hours ago`,language:`markdown`,content:`# Memory Index

Long-lived notes the assistant loads at session start.

- **Deploy ritual** — ship train leaves Tuesday 10:00 PT; ping #atlas-release before promoting
- **Sandbox quotas** — shared nodes cap at 8 vCPU; request burst tokens from infra a day ahead
- **Queue migration** — consumer lag flattens once \`prefetch=64\`; window confirmed July 15

## Standing preferences

1. Summaries as bullets, five max
2. Include token estimates on long-context work
3. Never auto-archive sessions tagged \`keep\`
`,versions:[{id:`p-memory-v14`,label:`v14`,savedAt:`Jul 13 · 09:42`,author:`you`,delta:`+18 −4`},{id:`p-memory-v13`,label:`v13`,savedAt:`Jul 11 · 16:08`,author:`assistant`,delta:`+6 −2`},{id:`p-memory-v12`,label:`v12`,savedAt:`Jul 9 · 08:15`,author:`you`,delta:`+41 −0`,snapshot:`# Memory Index

Long-lived notes the assistant loads at session start.

- **Deploy ritual** — ship train leaves Tuesday 10:00 PT
- **Sandbox quotas** — shared nodes cap at 8 vCPU

## Standing preferences

1. Summaries as bullets, five max
`}]},{id:`p-note-0710`,path:`notes/2026-07-10.md`,size:`2.8 KB`,edited:`3 days ago`,language:`markdown`,content:`# Daily note — July 10

## Focus

- [x] Review Priya's schema diff
- [ ] Finish rollout plan for the queue migration
- [ ] Draft on-call handoff for next week

## Worth keeping

> Migration window confirmed for **July 15, 06:00 UTC** — infra wants a dry run on the 14th.

Consumer lag flattened after setting \`prefetch=64\` on the staging consumers.
`,versions:[{id:`p-note-0710-v5`,label:`v5`,savedAt:`Jul 10 · 17:31`,author:`you`,delta:`+9 −1`},{id:`p-note-0710-v4`,label:`v4`,savedAt:`Jul 10 · 11:02`,author:`assistant`,delta:`+14 −0`},{id:`p-note-0710-v3`,label:`v3`,savedAt:`Jul 10 · 08:47`,author:`you`,delta:`+3 −3`}]},{id:`p-note-retro`,path:`notes/release-retro.md`,size:`3.5 KB`,edited:`Jun 30`,language:`markdown`,content:`# Release retro — 2026.26

**What went well**

- Canary caught the config regression before the 1% rollout
- Rollback rehearsal paid off: 4 minutes to restore

**What to change**

- Freeze window was announced late; automate the calendar hold
- Alert routing sent pages to the old rotation
`,versions:[{id:`p-note-retro-v3`,label:`v3`,savedAt:`Jun 30 · 15:20`,author:`you`,delta:`+7 −2`},{id:`p-note-retro-v2`,label:`v2`,savedAt:`Jun 30 · 14:05`,author:`assistant`,delta:`+22 −0`},{id:`p-note-retro-v1`,label:`v1`,savedAt:`Jun 30 · 13:58`,author:`you`,delta:`+11 −0`}]},{id:`p-script-backups`,path:`scripts/rotate-backups.sh`,size:`1.1 KB`,edited:`Jun 24`,language:`bash`,content:`#!/usr/bin/env bash
set -euo pipefail

KEEP=14
DEST="$HOME/backups/workspace"

find "$DEST" -name '*.tar.zst' -mtime +"$KEEP" -print -delete
tar --zstd -cf "$DEST/ws-$(date +%F).tar.zst" ~/workspace
echo "kept last $KEEP days in $DEST"
`,versions:[{id:`p-script-backups-v4`,label:`v4`,savedAt:`Jun 24 · 10:12`,author:`you`,delta:`+2 −2`},{id:`p-script-backups-v3`,label:`v3`,savedAt:`Jun 20 · 09:44`,author:`assistant`,delta:`+5 −1`},{id:`p-script-backups-v2`,label:`v2`,savedAt:`Jun 17 · 18:30`,author:`you`,delta:`+9 −0`}]}],k={personal:O,team:[{id:`t-runbook-deploy`,path:`runbooks/deploy-checklist.md`,size:`5.0 KB`,edited:`yesterday`,language:`markdown`,content:`# Deploy checklist

Run top to bottom; do not skip the canary soak.

1. Confirm the release branch is green on CI
2. Post the freeze notice in **#atlas-release**
3. Promote to canary and soak for 30 minutes
4. Watch \`error_rate\` and \`p95_latency\` dashboards
5. Promote to 100% or roll back — no partial states overnight

## Rollback

\`\`\`bash
atlasctl release rollback --env prod --to last-good
\`\`\`
`,versions:[{id:`t-runbook-deploy-v9`,label:`v9`,savedAt:`Jul 12 · 15:06`,author:`Dana`,delta:`+12 −8`},{id:`t-runbook-deploy-v8`,label:`v8`,savedAt:`Jul 8 · 11:40`,author:`assistant`,delta:`+4 −4`},{id:`t-runbook-deploy-v7`,label:`v7`,savedAt:`Jul 1 · 09:12`,author:`Marcus`,delta:`+16 −2`}]},{id:`t-note-standup`,path:`notes/standup-2026-07-09.md`,size:`1.9 KB`,edited:`4 days ago`,language:`markdown`,content:`# Standup — July 9

**Priya** — schema diff ready for review; blocked on staging creds

**Marcus** — queue migration dry run scheduled for July 14

**Dana** — closing out alert-routing cleanup; two rotations left
`,versions:[{id:`t-note-standup-v2`,label:`v2`,savedAt:`Jul 9 · 10:18`,author:`assistant`,delta:`+6 −0`},{id:`t-note-standup-v1`,label:`v1`,savedAt:`Jul 9 · 10:05`,author:`Priya`,delta:`+18 −0`},{id:`t-note-standup-v0`,label:`v0`,savedAt:`Jul 9 · 09:58`,author:`Priya`,delta:`+2 −0`}]},{id:`t-script-seed`,path:`scripts/seed-sandbox.sh`,size:`0.8 KB`,edited:`Jun 18`,language:`bash`,content:`#!/usr/bin/env bash
set -euo pipefail

atlasctl sandbox reset --env team-atlas --yes
atlasctl fixtures load ./fixtures/atlas-seed.json
echo "sandbox seeded with 240 fixture rows"
`,versions:[{id:`t-script-seed-v3`,label:`v3`,savedAt:`Jun 18 · 14:22`,author:`Marcus`,delta:`+1 −1`},{id:`t-script-seed-v2`,label:`v2`,savedAt:`Jun 12 · 16:51`,author:`assistant`,delta:`+3 −0`},{id:`t-script-seed-v1`,label:`v1`,savedAt:`Jun 12 · 16:44`,author:`Marcus`,delta:`+8 −0`}]}]},A={markdown:o,bash:a};function j(e){let t=e.split(`/`);return t[t.length-1]}function we(e,t,n,r,a){let o=r.trim().toLowerCase(),c=o.length===0?e:e.filter(e=>e.path.toLowerCase().includes(o)),l=new Map;for(let e of c){let t=e.path.split(`/`)[0],r={id:e.id,label:j(e.path),description:`${e.size} · ${e.edited}`,startContent:(0,T.jsx)(i,{icon:A[e.language],size:`sm`,color:`secondary`}),isSelected:e.id===n,onClick:()=>a(e.id)},o=l.get(t);o==null?l.set(t,[r]):o.push(r)}return Array.from(l.entries()).map(([e,n])=>({id:`folder-${t}-${e}`,label:e,isExpanded:!0,startContent:(0,T.jsx)(i,{icon:s,size:`sm`,color:`secondary`}),children:n}))}function M(){let[e,t]=(0,w.useState)(!0),[n,a]=(0,w.useState)(`personal`),[o,A]=(0,w.useState)(O[0].id),[j,M]=(0,w.useState)(``),[N,P]=(0,w.useState)(`rendered`),[Te,F]=(0,w.useState)({}),[I,L]=(0,w.useState)(!1),R=(0,w.useRef)(null),z=xe(R),B=z>0&&z<=640;(0,w.useEffect)(()=>{if(!I)return;let e=setTimeout(()=>L(!1),2e3);return()=>clearTimeout(e)},[I]);let V=k[n],H=V.find(e=>e.id===o)??V[0],U=H.versions.find(e=>e.id===Te[H.id]),W=U?.snapshot??H.content,G=H.language===`markdown`,K=N===`source`||!G,Ee=e=>{let t=e;a(t),A(k[t][0].id),M(``)},De=e=>{A(e),P(`rendered`)},Oe=e=>{F(t=>({...t,[H.id]:e}))},q=()=>{F(e=>{let t={...e};return delete t[H.id],t})},J=we(V,n,H.id,j,De),Y=H.path.split(`/`),X=(0,T.jsxs)(d,{gap:2,style:E.railHeader,children:[(0,T.jsxs)(ye,{value:n,onChange:Ee,size:`sm`,hasDivider:!0,children:[(0,T.jsx)(S,{value:`personal`,label:`Personal`}),(0,T.jsx)(S,{value:`team`,label:`Atlas team`})]}),(0,T.jsx)(ce,{label:`Search files`,isLabelHidden:!0,size:`sm`,placeholder:`Search files…`,startIcon:(0,T.jsx)(i,{icon:te,size:`sm`,color:`secondary`}),value:j,onChange:M})]}),Z=(0,T.jsxs)(T.Fragment,{children:[(0,T.jsxs)(u,{gap:2,vAlign:`center`,style:E.eyebrowRow,children:[(0,T.jsx)(f,{size:`fill`,children:(0,T.jsx)(r,{type:`label`,size:`sm`,color:`secondary`,style:E.eyebrow,children:`All files`})}),(0,T.jsxs)(r,{type:`supporting`,color:`secondary`,hasTabularNumbers:!0,children:[V.length,` files`]})]}),J.length>0?(0,T.jsx)(le,{items:J,density:`compact`}):(0,T.jsx)(`div`,{style:E.noMatches,children:(0,T.jsxs)(r,{type:`supporting`,color:`secondary`,children:[`No files match “`,j.trim(),`”`]})})]}),ke=(0,T.jsx)(`div`,{style:E.popoverBody,children:(0,T.jsxs)(d,{gap:0,children:[(0,T.jsx)(r,{type:`label`,size:`sm`,color:`secondary`,style:E.eyebrow,children:`Version history`}),H.versions.map((e,t)=>{let n=U==null?t===0:U.id===e.id;return(0,T.jsxs)(d,{gap:0,children:[(0,T.jsxs)(u,{gap:2,vAlign:`center`,style:E.versionRow,children:[(0,T.jsx)(f,{size:`fill`,children:(0,T.jsxs)(d,{gap:0,children:[(0,T.jsxs)(u,{gap:2,vAlign:`center`,children:[(0,T.jsx)(r,{type:`label`,size:`sm`,children:e.label}),n&&(0,T.jsx)(ae,{label:`Current`,variant:`info`})]}),(0,T.jsxs)(r,{type:`supporting`,color:`secondary`,children:[e.savedAt,` · `,e.author,` · `,e.delta]})]})}),!n&&(0,T.jsx)(h,{label:`Restore ${e.label}`,variant:`secondary`,size:`sm`,icon:(0,T.jsx)(i,{icon:ee,size:`sm`,color:`inherit`}),onClick:()=>Oe(e.id),children:`Restore`})]}),t<H.versions.length-1&&(0,T.jsx)(g,{})]},e.id)})]})}),Q=(0,T.jsxs)(d,{gap:2,style:E.viewerToolbar,children:[(0,T.jsxs)(u,{gap:2,vAlign:`center`,style:B?E.viewerToolbarWrap:void 0,children:[(0,T.jsx)(f,{size:`fill`,children:(0,T.jsxs)(be,{children:[(0,T.jsx)(C,{children:Ce[n]}),Y.map((e,t)=>(0,T.jsx)(C,{isCurrent:t===Y.length-1,children:e},e))]})}),(0,T.jsxs)(ve,{value:K?`source`:`rendered`,onChange:P,label:`View mode`,size:`sm`,children:[(0,T.jsx)(x,{value:`rendered`,label:`Rendered`}),(0,T.jsx)(x,{value:`source`,label:`Source`})]}),(0,T.jsx)(se,{label:`Version history`,placement:`below`,alignment:`end`,width:300,content:ke,children:(0,T.jsx)(h,{label:`History`,variant:`ghost`,size:`sm`,icon:(0,T.jsx)(i,{icon:c,size:`sm`,color:`inherit`})})}),(0,T.jsx)(h,{label:I?`Link copied`:`Share`,variant:I?`secondary`:`primary`,size:`sm`,icon:(0,T.jsx)(i,{icon:I?ne:l,size:`sm`,color:`inherit`}),onClick:()=>L(!0)})]}),(0,T.jsxs)(r,{type:`supporting`,color:`secondary`,children:[`Edited `,H.edited,` · `,H.size,` ·`,` `,H.versions.length,` versions`]}),U!=null&&(0,T.jsx)(pe,{status:`info`,title:`Restored ${U.label}`,description:U.snapshot==null?`Snapshot from ${U.savedAt} is now current.`:`Snapshot from ${U.savedAt} is now shown below.`,endContent:(0,T.jsx)(h,{label:`Undo`,variant:`ghost`,size:`sm`,onClick:q})})]}),$=(0,T.jsx)(`div`,{style:{...E.viewerScroll,...B?E.viewerScrollCompact:void 0},children:K?(0,T.jsxs)(d,{gap:2,children:[!G&&N===`rendered`&&(0,T.jsx)(r,{type:`supporting`,color:`secondary`,children:`Plain-text file — showing source`}),(0,T.jsx)(me,{code:W,language:G?`markdown`:`bash`,size:`sm`,width:`100%`})]}):(0,T.jsx)(de,{density:`compact`,headingLevelStart:2,children:W})}),Ae=B?(0,T.jsx)(`div`,{ref:R,children:(0,T.jsxs)(d,{gap:0,children:[X,(0,T.jsx)(`div`,{style:E.railScrollCompact,children:Z}),(0,T.jsx)(g,{}),Q,$]})}):(0,T.jsx)(`div`,{ref:R,style:E.body,children:(0,T.jsxs)(u,{gap:0,style:E.bodyRow,vAlign:`stretch`,children:[(0,T.jsxs)(`div`,{style:E.rail,children:[X,(0,T.jsx)(`div`,{style:E.railScroll,children:Z})]}),(0,T.jsx)(f,{size:`fill`,children:(0,T.jsxs)(`div`,{style:E.viewer,children:[Q,$]})})]})}),je=(0,T.jsx)(`div`,{style:E.composerCard,children:(0,T.jsxs)(d,{gap:2,children:[(0,T.jsx)(b,{label:`Message ${D}`,isLabelHidden:!0,rows:2,placeholder:`Type a message…`,value:``,onChange:()=>{}}),(0,T.jsxs)(u,{gap:2,vAlign:`center`,children:[(0,T.jsx)(r,{type:`supporting`,color:`secondary`,children:`The assistant can read and edit workspace files`}),(0,T.jsx)(f,{size:`fill`}),(0,T.jsx)(h,{label:`Send`,size:`sm`,onClick:()=>{}})]})]})});return(0,T.jsx)(p,{height:`fill`,header:(0,T.jsx)(re,{hasDivider:!0,children:(0,T.jsxs)(u,{gap:3,vAlign:`center`,children:[(0,T.jsx)(f,{size:`fill`,children:(0,T.jsxs)(u,{gap:2,vAlign:`center`,children:[(0,T.jsx)(ie,{level:1,children:Se}),(0,T.jsx)(oe,{variant:`success`,label:`Agent idle`})]})}),(0,T.jsx)(h,{label:`Workspace files`,variant:`secondary`,size:`sm`,icon:(0,T.jsx)(i,{icon:s,size:`sm`,color:`inherit`}),onClick:()=>t(!0)})]})}),content:(0,T.jsxs)(m,{padding:0,children:[(0,T.jsx)(`div`,{style:E.chatColumn,children:(0,T.jsx)(y,{composer:je,children:(0,T.jsxs)(ge,{density:`balanced`,children:[(0,T.jsx)(_e,{variant:`divider`,children:`Monday, July 13`}),(0,T.jsx)(v,{sender:`user`,children:(0,T.jsx)(_,{children:`Pull up the migration notes before the dry run — I want to confirm the window we agreed on.`})}),(0,T.jsx)(v,{sender:`assistant`,avatar:(0,T.jsx)(he,{name:D,size:`small`}),children:(0,T.jsx)(_,{name:D,children:`The July 10 daily note has the confirmed window: July 15, 06:00 UTC, with a dry run on the 14th. Opening the workspace files so you can double-check.`})})]})})}),(0,T.jsx)(ue,{isOpen:e,onOpenChange:t,purpose:`info`,width:`min(940px, 94vw)`,maxHeight:`min(720px, 88vh)`,children:(0,T.jsx)(p,{header:(0,T.jsx)(fe,{title:`Workspace files`,subtitle:`Files the assistant reads and edits in this workspace`,onOpenChange:t,hasDivider:!0}),content:(0,T.jsx)(m,{padding:0,children:Ae})})})]})})}export{M as default};