import{a as e,n as t,t as n}from"./jsx-runtime-n5LQ9ujS.js";import{t as r}from"./Text-BQfOmxHl.js";import{t as i}from"./Icon-CfWJt7_7.js";import{t as ee}from"./download-BlAOhpL_.js";import{t as a}from"./file-braces-C9-kI5Ns.js";import{t as o}from"./file-code-32TCdxLg.js";import{t as s}from"./file-text-BkrtGLq9.js";import{t as c}from"./folder-BxCODM6I.js";import{t as te}from"./history-DlKqYA94.js";import{t as ne}from"./inbox-BTuc89Mv.js";import{t as re}from"./rotate-ccw-DplzSiSF.js";import{t as ie}from"./share-2-DXJyPCg6.js";import{t as ae}from"./upload-Defqjlka.js";import{i as l,s as u}from"./index-ChspgpTx.js";import{t as d}from"./HStack-6ehxTJSr.js";import{t as f}from"./VStack-C_fZqkMs.js";import{t as p}from"./StackItem-Im0gYeHY.js";import{n as oe,t as se}from"./LayoutContent-CWrnTg4F.js";import{t as ce}from"./LayoutHeader-CjEbEGn-.js";import{t as m}from"./LayoutPanel-I2ZhwSWC.js";import{t as h}from"./Heading-B6uvyN4z.js";import{t as le}from"./Badge-DZeWS3aO.js";import{t as g}from"./useMediaQuery-CPLsSUhI.js";import{t as _}from"./Button-Cq8OImZL.js";import{t as v}from"./Divider-C5P7aUb1.js";import{t as y}from"./EmptyState-AU4zWk2i.js";import{t as ue}from"./TextInput-DK4MTiws.js";import{t as de}from"./Markdown-DDOkWARx.js";import{t as b}from"./CodeBlock-CMyZzA0K.js";import{t as x}from"./IconButton-ChGBgiEu.js";import{n as S,t as C}from"./SegmentedControlItem-CVpqjs2t.js";import{t as w}from"./Timestamp-v9tuxbf9.js";import{n as T,t as E}from"./ListItem-CLQ0MZQg.js";import{n as fe,t as D}from"./Tab-D1TDa4-Y.js";import{t as pe}from"./TreeList-Ca6jryv1.js";import{n as me,t as he}from"./BreadcrumbItem-BkEgEmhV.js";import{t as O}from"./Skeleton-Bdb6rNv8.js";var k=e(t(),1),A=n(),j={pane:{display:`flex`,flexDirection:`column`,height:`100%`,minHeight:0},paneSearch:{padding:`var(--spacing-3) var(--spacing-3) var(--spacing-2)`},paneScroll:{flex:1,minHeight:0,overflowY:`auto`,padding:`0 var(--spacing-2) var(--spacing-3)`},paneFootnote:{padding:`var(--spacing-2) var(--spacing-3)`},previewHeader:{alignItems:`center`,padding:`var(--spacing-2) var(--spacing-4)`,flexWrap:`wrap`},breadcrumbTrail:{minWidth:0,overflow:`hidden`},previewBody:{flex:1,minHeight:0,overflowY:`auto`,padding:`var(--spacing-4)`},emptyStateFill:{height:`100%`,display:`flex`,alignItems:`center`,justifyContent:`center`},historyPane:{display:`flex`,flexDirection:`column`,height:`100%`,minHeight:0},historyHeader:{alignItems:`center`,padding:`var(--spacing-3) var(--spacing-3) var(--spacing-2)`},historyScroll:{flex:1,minHeight:0,overflowY:`auto`,padding:`0 var(--spacing-2) var(--spacing-3)`},visuallyHidden:{position:`absolute`,width:`1px`,height:`1px`,margin:`-1px`,padding:0,overflow:`hidden`,clipPath:`inset(50%)`,whiteSpace:`nowrap`}},M={"file-chart":{id:`file-chart`,path:`src/components/chart.tsx`,kind:`code`,language:`tsx`,modified:`2026-06-28T14:32:00`,content:`import {useMemo} from 'react';

import {scaleLinear} from '../lib/scales';
import type {Series} from '../types';

interface TrendChartProps {
  series: Series;
  width: number;
  height: number;
}

/** Sparkline-style trend chart used on the overview cards. */
export function TrendChart({series, width, height}: TrendChartProps) {
  const path = useMemo(() => {
    const x = scaleLinear([0, series.points.length - 1], [0, width]);
    const y = scaleLinear(series.extent, [height, 0]);
    return series.points
      .map((point, index) => {
        const command = index === 0 ? 'M' : 'L';
        return command + x(index).toFixed(1) + ' ' + y(point).toFixed(1);
      })
      .join(' ');
  }, [series, width, height]);

  return (
    <svg viewBox={'0 0 ' + width + ' ' + height} role="img">
      <title>{series.label}</title>
      <path d={path} fill="none" strokeWidth={1.5} />
    </svg>
  );
}
`},"file-data-table":{id:`file-data-table`,path:`src/components/data-table.tsx`,kind:`code`,language:`tsx`,modified:`2026-06-26T09:18:00`,content:`import type {Row} from '../types';

interface DataTableProps {
  rows: Row[];
  onRowClick: (id: string) => void;
}

/** Dense read-only table for the metrics drill-down view. */
export function DataTable({rows, onRowClick}: DataTableProps) {
  return (
    <table>
      <tbody>
        {rows.map(row => (
          <tr key={row.id} onClick={() => onRowClick(row.id)}>
            <td>{row.label}</td>
            <td>{row.value.toLocaleString('en-US')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
`},"file-filter-bar":{id:`file-filter-bar`,path:`src/components/filter-bar.tsx`,kind:`code`,language:`tsx`,modified:`2026-06-27T16:05:00`,content:`import {useState} from 'react';

const SEGMENTS = ['24h', '7d', '30d', '90d'] as const;

/** Time-range filter bar shared by every dashboard page. */
export function FilterBar({onChange}: {onChange: (range: string) => void}) {
  const [range, setRange] = useState<string>('7d');
  return (
    <div role="radiogroup" aria-label="Time range">
      {SEGMENTS.map(segment => (
        <button
          key={segment}
          role="radio"
          aria-checked={segment === range}
          onClick={() => {
            setRange(segment);
            onChange(segment);
          }}>
          {segment}
        </button>
      ))}
    </div>
  );
}
`},"file-readme":{id:`file-readme`,path:`README.md`,kind:`markdown`,language:`markdown`,modified:`2026-06-21T11:40:00`,content:`# pulse-web

Frontend for the Pulse analytics dashboard.

## Getting started

1. Install dependencies with pnpm install
2. Copy app.config.json.example to app.config.json
3. Run pnpm dev and open localhost:3000

## Project layout

- **src/components** — presentational building blocks (charts, tables)
- **src/hooks** — data-fetching and viewport hooks
- **app.config.json** — per-environment API endpoints and feature flags

## Conventions

Components are function-only, typed props, no default exports outside
route files. Charts read from the shared scale helpers in src/lib.
`},"file-config":{id:`file-config`,path:`app.config.json`,kind:`config`,language:`json`,modified:`2026-06-24T08:52:00`,content:`{
  "apiBaseUrl": "https://api.pulse.example.com/v2",
  "refreshIntervalSeconds": 30,
  "featureFlags": {
    "newFilterBar": true,
    "denseTableMode": false,
    "exportToCsv": true
  },
  "retention": {
    "rawEventsDays": 30,
    "rollupsDays": 365
  }
}
`},"file-notes":{id:`file-notes`,path:`notes.md`,kind:`markdown`,language:`markdown`,modified:`2026-06-29T18:10:00`,content:`# Scratch notes

- Ask design about the empty-state illustration for exports
- The p95 chart clips on 4k displays — file a bug with a screenshot
- Try the new scaleLog helper on the retention curve
`},"file-query":{id:`file-query`,path:`scratch/query.ts`,kind:`code`,language:`ts`,modified:`2026-06-25T13:27:00`,content:`/** One-off query helper — not shipped, personal scratch only. */
export async function fetchSlowQueries(limit: number) {
  const response = await fetch('/api/debug/slow-queries?limit=' + limit);
  if (!response.ok) {
    throw new Error('slow-queries failed: ' + response.status);
  }
  return response.json();
}
`}},ge={workspace:[{kind:`dir`,id:`dir-src`,label:`src`,isExpanded:!0,children:[{kind:`dir`,id:`dir-components`,label:`components`,isExpanded:!0,children:[{kind:`file`,fileId:`file-chart`},{kind:`file`,fileId:`file-data-table`},{kind:`file`,fileId:`file-filter-bar`}]},{kind:`dir`,id:`dir-hooks`,label:`hooks`,isExpanded:!0,isLoading:!0}]},{kind:`file`,fileId:`file-readme`},{kind:`file`,fileId:`file-config`}],personal:[{kind:`dir`,id:`dir-scratch`,label:`scratch`,isExpanded:!0,children:[{kind:`file`,fileId:`file-query`}]},{kind:`file`,fileId:`file-notes`}]},N={workspace:[`file-chart`,`file-data-table`,`file-filter-bar`,`file-readme`,`file-config`],personal:[`file-query`,`file-notes`]},P={"file-chart":[{id:`v14`,label:`v14 — Add accessible title to the svg`,author:`Rowan Ellis`,size:`2.4 KB`,savedAt:`2026-06-28T14:32:00`},{id:`v13`,label:`v13 — Memoize the path computation`,author:`Ines Duarte`,size:`2.3 KB`,savedAt:`2026-06-27T10:04:00`},{id:`v12`,label:`v12 — Switch to shared scale helpers`,author:`Rowan Ellis`,size:`2.1 KB`,savedAt:`2026-06-24T17:46:00`},{id:`v11`,label:`v11 — Initial sparkline extraction`,author:`Theo Malik`,size:`1.8 KB`,savedAt:`2026-06-19T09:12:00`}],"file-readme":[{id:`v3`,label:`v3 — Document the config copy step`,author:`Ines Duarte`,size:`1.1 KB`,savedAt:`2026-06-21T11:40:00`},{id:`v2`,label:`v2 — Add project layout section`,author:`Rowan Ellis`,size:`0.9 KB`,savedAt:`2026-06-15T15:22:00`}]},F={code:o,markdown:s,config:a};function I(e){let t=e.split(`/`);return t[t.length-1]}function L(e){return[112,88].map((t,n)=>({id:`${e}-loading-${n}`,label:(0,A.jsx)(O,{width:t,height:12,radius:1,index:n}),startContent:(0,A.jsx)(O,{width:16,height:16,radius:1,index:n}),isDisabled:!0}))}function R(e,t,n){return e.map(e=>{if(e.kind===`dir`)return{id:e.id,label:e.label,isExpanded:e.isExpanded,startContent:(0,A.jsx)(i,{icon:c,size:`sm`,color:`secondary`}),children:e.isLoading?L(e.id):R(e.children??[],t,n)};let r=M[e.fileId];return{id:r.id,label:I(r.path),startContent:(0,A.jsx)(i,{icon:F[r.kind],size:`sm`,color:`secondary`}),endContent:(0,A.jsx)(w,{value:r.modified,format:`date`}),isSelected:r.id===t,onClick:()=>n(r.id)}})}function _e(e,t){let n=t.trim().toLowerCase();return n===``?[]:N[e].map(e=>{let t=M[e];return{file:t,index:t.path.toLowerCase().indexOf(n)}}).filter(e=>e.index>=0).sort((e,t)=>e.index-t.index||e.file.path.length-t.file.path.length)}function ve({path:e,matchIndex:t,matchLength:n}){return(0,A.jsxs)(r,{type:`body`,color:`secondary`,display:`inline`,maxLines:1,children:[e.slice(0,t),(0,A.jsx)(r,{as:`span`,type:`inherit`,weight:`semibold`,color:`primary`,display:`inline`,children:e.slice(t,t+n)}),e.slice(t+n)]})}function z(){let[e,t]=(0,k.useState)(`workspace`),[n,a]=(0,k.useState)({workspace:`file-chart`,personal:`file-notes`}),[s,c]=(0,k.useState)(`history`),[O,L]=(0,k.useState)(``),[z,B]=(0,k.useState)({}),[ye,be]=(0,k.useState)(``),[xe,V]=(0,k.useState)(!1),H=g(`(max-width: 768px)`),U=e===`uploads`?`workspace`:e,W=M[n[U]],Se=N[U].length,G=e=>{a(t=>({...t,[U]:e})),V(!0)},Ce=(0,k.useMemo)(()=>R(ge[U],W.id,G),[U,W.id]),K=(0,k.useMemo)(()=>_e(U,O),[U,O]),we=O.trim()!==``,q=P[W.id]??[],Te=z[W.id]??q[0]?.id,Ee=e=>{B(t=>({...t,[W.id]:e.id})),be(`Restored ${I(W.path)} to ${e.label}`)},De=e=>{t(e),L(``),V(!1)},J=(0,A.jsxs)(`div`,{style:j.pane,children:[(0,A.jsx)(`div`,{style:j.paneSearch,children:(0,A.jsx)(ue,{label:`Search files`,isLabelHidden:!0,size:`sm`,placeholder:`Search files...`,startIcon:u,hasClear:!0,value:O,onChange:L})}),(0,A.jsx)(`div`,{style:j.paneScroll,children:we?K.length===0?(0,A.jsx)(y,{isCompact:!0,icon:(0,A.jsx)(i,{icon:u,size:`lg`}),title:`No matches`,description:`Nothing in ${U===`workspace`?`workspace files`:`personal files`} matches "${O.trim()}".`}):(0,A.jsx)(T,{density:`compact`,hasDividers:!1,header:(0,A.jsxs)(r,{type:`supporting`,color:`secondary`,children:[K.length,` `,K.length===1?`match`:`matches`,` — fuzzy, best path match first`]}),children:K.map(({file:e,index:t})=>(0,A.jsx)(E,{label:(0,A.jsx)(ve,{path:e.path,matchIndex:t,matchLength:O.trim().length}),startContent:(0,A.jsx)(i,{icon:F[e.kind],size:`sm`,color:`secondary`}),isSelected:e.id===W.id,onClick:()=>G(e.id)},e.id))}):(0,A.jsx)(pe,{density:`compact`,items:Ce,header:(0,A.jsx)(r,{type:`label`,size:`sm`,color:`secondary`,children:U===`workspace`?`pulse-web · main`:`Personal`})})}),(0,A.jsx)(v,{}),(0,A.jsx)(`div`,{style:j.paneFootnote,children:(0,A.jsxs)(d,{gap:1,vAlign:`center`,children:[(0,A.jsxs)(r,{type:`supporting`,color:`secondary`,hasTabularNumbers:!0,children:[Se,` files`]}),(0,A.jsx)(r,{type:`supporting`,color:`secondary`,children:`· synced`}),(0,A.jsx)(w,{value:`2026-06-30T07:15:00`,format:`date_time`})]})})]}),Y=W.path.split(`/`),Oe=(0,A.jsxs)(d,{gap:2,style:j.previewHeader,children:[H&&(0,A.jsx)(_,{label:`All files`,variant:`ghost`,size:`sm`,onClick:()=>V(!1)}),(0,A.jsx)(p,{size:`fill`,style:j.breadcrumbTrail,children:(0,A.jsx)(me,{variant:`supporting`,label:`File path`,children:Y.map((e,t)=>(0,A.jsx)(he,{isCurrent:t===Y.length-1,onClick:t===Y.length-1?void 0:()=>{},children:e},`${t}-${e}`))})}),(0,A.jsxs)(S,{label:`View mode`,size:`sm`,value:s,onChange:e=>c(e),children:[(0,A.jsx)(C,{value:`code`,label:`Code`}),(0,A.jsx)(C,{value:`rendered`,label:`Rendered`}),(0,A.jsx)(C,{value:`history`,label:`History`})]}),(0,A.jsx)(x,{label:`Share ${I(W.path)}`,tooltip:`Share`,icon:(0,A.jsx)(i,{icon:ie,size:`sm`,color:`inherit`}),variant:`ghost`,size:`sm`,onClick:()=>{}}),(0,A.jsx)(x,{label:`Download ${I(W.path)}`,tooltip:`Download`,icon:(0,A.jsx)(i,{icon:ee,size:`sm`,color:`inherit`}),variant:`ghost`,size:`sm`,onClick:()=>{}})]}),ke=s===`rendered`?W.kind===`markdown`?(0,A.jsx)(de,{children:W.content}):(0,A.jsx)(`div`,{style:j.emptyStateFill,children:(0,A.jsx)(y,{icon:(0,A.jsx)(i,{icon:o,size:`lg`}),title:`No rendered preview`,description:`${I(W.path)} is source code — only Markdown files render in the browser.`,actions:(0,A.jsx)(_,{label:`View code`,variant:`secondary`,onClick:()=>c(`code`)})})}):(0,A.jsx)(b,{code:W.content,language:W.language,title:I(W.path),hasLineNumbers:!0,hasCopyButton:!0,isWrapped:!0,width:`100%`}),X=(0,A.jsxs)(`div`,{style:j.pane,children:[Oe,(0,A.jsx)(v,{}),(0,A.jsx)(`div`,{style:j.previewBody,children:ke})]}),Ae=(0,A.jsxs)(`div`,{style:j.historyPane,children:[(0,A.jsxs)(d,{gap:2,style:j.historyHeader,children:[(0,A.jsx)(p,{size:`fill`,children:(0,A.jsxs)(f,{gap:0,children:[(0,A.jsx)(h,{level:5,accessibilityLevel:2,children:`Version history`}),(0,A.jsx)(r,{type:`supporting`,color:`secondary`,maxLines:1,children:I(W.path)})]})}),(0,A.jsx)(x,{label:`Close history`,tooltip:`Close history`,icon:(0,A.jsx)(i,{icon:l,size:`sm`,color:`inherit`}),variant:`ghost`,size:`sm`,onClick:()=>c(`code`)})]}),(0,A.jsx)(v,{}),(0,A.jsx)(`div`,{style:j.historyScroll,children:q.length===0?(0,A.jsx)(y,{isCompact:!0,icon:(0,A.jsx)(i,{icon:te,size:`lg`}),title:`No earlier versions`,description:`This file has only been saved once — edits will appear here.`}):(0,A.jsx)(T,{density:`compact`,hasDividers:!1,children:q.map(e=>(0,A.jsx)(E,{label:e.label,description:(0,A.jsxs)(d,{gap:1,vAlign:`center`,wrap:`wrap`,children:[(0,A.jsx)(w,{value:e.savedAt,format:`date_time`}),(0,A.jsxs)(r,{type:`supporting`,color:`secondary`,maxLines:1,children:[`· `,e.author]}),(0,A.jsxs)(r,{type:`supporting`,color:`secondary`,hasTabularNumbers:!0,maxLines:1,children:[`· `,e.size]})]}),endContent:e.id===Te?(0,A.jsx)(le,{label:`Current`,variant:`neutral`}):(0,A.jsx)(_,{label:`Restore`,variant:`ghost`,size:`sm`,icon:(0,A.jsx)(i,{icon:re,size:`sm`}),onClick:()=>Ee(e)})},e.id))})})]}),je=(0,A.jsx)(`div`,{style:j.emptyStateFill,children:(0,A.jsx)(y,{icon:(0,A.jsx)(i,{icon:ne,size:`lg`}),title:`No uploads yet`,description:`Files you attach to a conversation land here, ready to reference from any session.`,actions:(0,A.jsx)(_,{label:`Upload files`,variant:`primary`,icon:(0,A.jsx)(i,{icon:ae,size:`sm`}),onClick:()=>{}})})}),Z=e===`uploads`,Me=s===`history`&&!H&&!Z,Q=(0,A.jsxs)(d,{gap:2,vAlign:`center`,children:[(0,A.jsx)(h,{level:1,children:`Files`}),(0,A.jsx)(r,{type:`supporting`,color:`secondary`,children:`Pulse Analytics`})]}),$=(0,A.jsxs)(fe,{value:e,onChange:De,size:`sm`,children:[(0,A.jsx)(D,{value:`workspace`,label:`Workspace files`}),(0,A.jsx)(D,{value:`personal`,label:`Personal`}),(0,A.jsx)(D,{value:`uploads`,label:`Uploads`})]}),Ne=Z?je:H?xe?X:J:X;return(0,A.jsx)(oe,{height:`fill`,header:(0,A.jsx)(ce,{hasDivider:!0,children:H?(0,A.jsxs)(f,{gap:2,children:[Q,$]}):(0,A.jsxs)(d,{gap:3,vAlign:`center`,children:[(0,A.jsx)(p,{size:`fill`,children:Q}),$]})}),start:!H&&!Z?(0,A.jsx)(m,{width:300,padding:0,children:J}):void 0,end:Me?(0,A.jsx)(m,{width:320,padding:0,children:Ae}):void 0,content:(0,A.jsxs)(se,{padding:0,children:[(0,A.jsx)(`div`,{"aria-live":`polite`,style:j.visuallyHidden,children:ye}),Ne]})})}export{z as default};