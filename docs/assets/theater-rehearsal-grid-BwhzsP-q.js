import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-DAwHU7YM.js";import{t as i}from"./Icon-QWhqeGsc.js";import{t as a}from"./calendar-days-Bw5-cQz-.js";import{t as o}from"./clock-3-Cv-QfdxR.js";import{t as s}from"./door-open-JSe8LQ2c.js";import{t as c}from"./users-BO0o6pj-.js";import{b as l,i as ee,o as u}from"./index-DDmS-Cgf.js";import{t as d}from"./Tooltip-XDRm9Z-w.js";import{t as f}from"./HStack-2WTukjNp.js";import{t as p}from"./StackItem-Ca9P7L2I.js";import{n as m,t as h}from"./LayoutContent-CCL91W7X.js";import{t as g}from"./LayoutHeader-Cy2mWoMf.js";import{t as _}from"./Heading-BqGjHnff.js";import{t as v}from"./Badge-0Tj9omHc.js";import{t as y}from"./Button-BqXaaLop.js";var b=e(t(),1),x=n(),S=`tpl-theater-rehearsal-grid`,C=`light-dark(#A61E4D, #F06595)`,w=`light-dark(#FFFFFF, #2B0714)`,T=`light-dark(rgba(166, 30, 77, 0.12), rgba(240, 101, 149, 0.16))`,E=`light-dark(#B45309, #F5A623)`,D=`light-dark(rgba(180, 83, 9, 0.12), rgba(245, 166, 35, 0.16))`,O=`light-dark(#15803D, #4ADE80)`,k=`light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))`,A=[{id:`mon`,label:`Mon`,date:`Jul 13`},{id:`tue`,label:`Tue`,date:`Jul 14`},{id:`wed`,label:`Wed`,date:`Jul 15`},{id:`thu`,label:`Thu`,date:`Jul 16`},{id:`fri`,label:`Fri`,date:`Jul 17`},{id:`sat`,label:`Sat`,date:`Jul 18`}],j=[{id:`aft`,label:`AFT`,time:`2:00–5:00p`},{id:`eve`,label:`EVE`,time:`6:30–9:30p`}];function M(e){let t=e.split(`-`)[0];return A.find(e=>e.id===t)}function N(e){let t=e.split(`-`)[1];return j.find(e=>e.id===t)}function P(e){return`${M(e).label} ${N(e).label}`}function F(e){let t=M(e),n=N(e);return`${t.label} ${t.date} · ${n.label} ${n.time}`}var I=[{id:`am`,name:`Amara Ellison`,role:`Maren`,initials:`AE`,unavailable:[{slot:`sat-eve`,reason:`family commitment`}]},{id:`jt`,name:`Jonah Trask`,role:`Theo`,initials:`JT`,unavailable:[{slot:`mon-eve`,reason:`ferry-line shift`},{slot:`tue-eve`,reason:`ferry-line shift`}]},{id:`pk`,name:`Priya Kellner`,role:`Ida`,initials:`PK`,unavailable:[{slot:`fri-aft`,reason:`clinic shift`}]},{id:`do`,name:`Marcus Okafor`,role:`Dez`,initials:`MO`,unavailable:[{slot:`wed-aft`,reason:`teaches percussion`}]},{id:`lb`,name:`Lena Brook`,role:`Grandmother Ash`,initials:`LB`,unavailable:[{slot:`thu-eve`,reason:`evening seminar`},{slot:`fri-eve`,reason:`evening seminar`}]},{id:`rt`,name:`Ruben Tal`,role:`Callum`,initials:`RT`,unavailable:[{slot:`sat-aft`,reason:`wedding gig`}]},{id:`sw`,name:`Sofia Whitehall`,role:`June / u.s. Maren`,initials:`SW`,unavailable:[{slot:`thu-aft`,reason:`voice class`}]},{id:`gh`,name:`Gideon Hale`,role:`Fisherman / ensemble`,initials:`GH`,unavailable:[{slot:`mon-aft`,reason:`boat charter`}]}],L=Object.fromEntries(I.map(e=>[e.id,e]));function R(e,t){return L[e].unavailable.find(e=>e.slot===t)??null}var z=[{id:`s11`,code:`1.1`,title:`Arrival — the cottage at low tide`,pages:`pp. 1–8`,pageCount:8,cast:[`am`,`jt`,`lb`]},{id:`s12`,code:`1.2`,title:`Nets and ledgers`,pages:`pp. 9–14`,pageCount:6,cast:[`jt`,`do`,`gh`]},{id:`s13`,code:`1.3`,title:`Ida's bargain`,pages:`pp. 15–21`,pageCount:7,cast:[`pk`,`am`,`rt`]},{id:`s14`,code:`1.4`,title:`The letter that should have stayed unsent (storm flashback)`,pages:`pp. 22–26`,pageCount:5,cast:[`am`,`lb`,`sw`,`gh`],note:`Needs rain loop cue from sound.`},{id:`s15`,code:`1.5`,title:`Supper, interrupted`,pages:`pp. 27–34`,pageCount:8,cast:[`am`,`jt`,`pk`,`do`,`lb`,`rt`],note:`Full table setting — props pull required.`},{id:`s16`,code:`1.6`,title:`Callum on the breakwater`,pages:`pp. 35–38`,pageCount:4,cast:[`rt`,`gh`]},{id:`s21`,code:`2.1`,title:`Morning after the blow`,pages:`pp. 39–45`,pageCount:7,cast:[`am`,`jt`,`pk`]},{id:`s22`,code:`2.2`,title:`Dez counts the boats`,pages:`pp. 46–50`,pageCount:5,cast:[`do`,`gh`,`sw`]},{id:`s23`,code:`2.3`,title:`Grandmother Ash speaks plainly`,pages:`pp. 51–57`,pageCount:7,cast:[`lb`,`am`]},{id:`s24`,code:`2.4`,title:`The auction`,pages:`pp. 58–66`,pageCount:9,cast:[`jt`,`do`,`pk`,`rt`,`gh`],note:`Fight call: staged shove — fight captain must be present.`},{id:`s25`,code:`2.5`,title:`June's confession`,pages:`pp. 67–71`,pageCount:5,cast:[`sw`,`am`,`rt`]},{id:`s26`,code:`2.6`,title:`Cedar smoke — finale`,pages:`pp. 72–80`,pageCount:9,cast:[`am`,`jt`,`pk`,`do`,`lb`,`rt`,`sw`,`gh`],note:`Full company. Music rehearsal folds in here.`}],B=z.reduce((e,t)=>e+t.pageCount,0),V=[{id:`studio-a`,name:`Studio A`,features:`Sprung floor · upright piano`,holds:[`mon-aft`,`tue-aft`,`wed-aft`,`thu-eve`,`sat-aft`]},{id:`studio-b`,name:`Studio B`,features:`Mirror wall · full tape-out`,holds:[`mon-eve`,`tue-eve`,`thu-aft`,`fri-aft`]},{id:`annex`,name:`Annex Black Box`,features:`True ground plan · props access`,holds:[`wed-eve`,`fri-eve`,`sat-aft`,`sat-eve`]}],H=Object.fromEntries(V.map(e=>[e.id,e])),U=V.reduce((e,t)=>e+t.holds.length,0),W={s11:{slot:`mon-aft`,roomId:`studio-a`},s12:{slot:`mon-eve`,roomId:`studio-b`},s13:{slot:`tue-aft`,roomId:`studio-a`},s14:{slot:`thu-aft`,roomId:`studio-b`},s15:{slot:`wed-eve`,roomId:`annex`},s16:null,s21:null,s22:null,s23:null,s24:null,s25:null,s26:null};function G(e){let t=[],n=new Map;for(let t of z){let r=e[t.id];if(r!=null)for(let e of t.cast){let i=n.get(r.slot)??[];i.push({sceneId:t.id,actorId:e}),n.set(r.slot,i)}}let r=0,i=0;for(let a of z){let o=e[a.id];if(o!=null){r+=1,i+=a.pageCount;for(let e of a.cast){let r=R(e,o.slot);if(r!=null){t.push({sceneId:a.id,actorId:e,slot:o.slot,kind:`unavailable`,reason:r.reason});continue}let i=(n.get(o.slot)??[]).filter(t=>t.actorId===e&&t.sceneId!==a.id);if(i.length>0){let n=z.find(e=>e.id===i[0].sceneId);t.push({sceneId:a.id,actorId:e,slot:o.slot,kind:`double-booked`,reason:`also called for ${n?n.code:`another scene`} in this slot`})}}}}let a=new Map;for(let e of t)a.set(`${e.sceneId}:${e.actorId}`,e);let o={},s={},c={};for(let n of I)s[n.id]=z.filter(e=>e.cast.includes(n.id)).length,o[n.id]=z.filter(t=>t.cast.includes(n.id)&&e[t.id]!=null).length,c[n.id]=t.some(e=>e.actorId===n.id);let l=z.filter(t=>e[t.id]!=null).length;return{scheduledScenes:r,scheduledPages:i,coveragePct:Math.round(i/B*100),conflicts:t,conflictByCell:a,actorScheduled:o,actorTotal:s,actorHasConflict:c,freeHolds:U-l,consumedHolds:l}}function K(e){let t=new Map;for(let n of V)for(let r of n.holds){let i=z.find(t=>{let i=e[t.id];return i!=null&&i.roomId===n.id&&i.slot===r})??null;t.set(`${n.id}:${r}`,{slot:r,roomId:n.id,scene:i})}return t}function q(e,t,n){let r=[];for(let i of e.cast){let a=R(i,t);if(a!=null){r.push({actorId:i,reason:a.reason});continue}let o=z.find(r=>{if(r.id===e.id)return!1;let a=n[r.id];return a!=null&&a.slot===t&&r.cast.includes(i)});o!=null&&r.push({actorId:i,reason:`also called for ${o.code} in this slot`})}return r}var J=`
.${S} {
  font-family: var(--font-family-sans);
}
.${S} button {
  font: inherit;
  color: inherit;
}
.${S} .trg-focusable:focus-visible {
  outline: 2px solid ${C};
  outline-offset: 2px;
}
.${S} .trg-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
/* --- header (56px) ------------------------------------------------------- */
.${S} .trg-header-row {
  padding: var(--spacing-2) var(--spacing-4);
  min-height: 56px;
  box-sizing: border-box;
}
.${S} .trg-mark {
  display: inline-flex;
  flex-shrink: 0;
  color: ${C};
}
.${S} .trg-overline {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${C};
  white-space: nowrap;
}
/* --- content column ------------------------------------------------------ */
.${S} .trg-content {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.${S} .trg-body {
  flex: 1;
  min-height: 0;
  display: flex;
}
/* --- stat strip (44px) --------------------------------------------------- */
.${S} .trg-stats {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 44px;
  box-sizing: border-box;
  padding: var(--spacing-1) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
  overflow-x: auto;
}
.${S} .trg-stat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 2px 10px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  background: var(--color-background-surface);
  white-space: nowrap;
}
.${S} .trg-stat strong {
  color: var(--color-text-primary);
  font-weight: 700;
}
.${S} .trg-stat--brand {
  border-color: ${C};
  color: ${C};
  background: ${T};
}
.${S} .trg-stat--brand strong { color: ${C}; }
.${S} .trg-stat--warn {
  border-color: ${E};
  color: ${E};
  background: ${D};
}
.${S} .trg-stat--warn strong { color: ${E}; }
.${S} .trg-stat--ok {
  border-color: ${O};
  color: ${O};
  background: ${k};
}
.${S} .trg-stat--ok strong { color: ${O}; }
/* Coverage ring: 28px SVG inside the 44px strip. */
.${S} .trg-ring {
  flex-shrink: 0;
  display: inline-flex;
}
/* --- matrix -------------------------------------------------------------- */
.${S} .trg-matrix-scroll {
  flex: 1;
  min-width: 0;
  overflow: auto;
}
.${S} .trg-matrix {
  display: grid;
  grid-template-columns: 240px repeat(${I.length}, 60px);
  width: max-content;
  min-width: 100%;
}
/* Corner cell + actor header row: 64px, sticky top. */
.${S} .trg-corner {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 6;
  height: 64px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: 0 var(--spacing-3);
  background: var(--color-background-surface);
  border-bottom: var(--border-width) solid var(--color-border);
  border-right: var(--border-width) solid var(--color-border);
}
.${S} .trg-corner-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${S} .trg-corner-meta {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${S} .trg-actorhead {
  position: sticky;
  top: 0;
  z-index: 5;
  height: 64px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 4px 2px;
  background: var(--color-background-surface);
  border-bottom: var(--border-width) solid var(--color-border);
  border-left: none;
  border-right: none;
  border-top: none;
  cursor: pointer;
}
.${S} .trg-actorhead[aria-pressed='true'] {
  background: ${T};
  box-shadow: inset 0 -2px 0 0 ${C};
}
.${S} .trg-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: ${C};
  border: var(--border-width) solid ${C};
  background: ${T};
}
.${S} .trg-actorhead[aria-pressed='true'] .trg-avatar {
  background: ${C};
  color: ${w};
}
.${S} .trg-actorname {
  max-width: 56px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-secondary);
}
.${S} .trg-actorwarn {
  position: absolute;
  top: 4px;
  right: 4px;
  display: inline-flex;
  color: ${E};
}
/* Scene rows: 44px; the scene cell is a sticky-left 240px button. */
.${S} .trg-scenecell {
  position: sticky;
  left: 0;
  z-index: 4;
  height: 44px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1px;
  padding: 4px var(--spacing-3);
  text-align: left;
  background: var(--color-background-surface);
  border: none;
  border-bottom: var(--border-width) solid var(--color-border);
  border-right: var(--border-width) solid var(--color-border);
  cursor: pointer;
  overflow: hidden;
}
.${S} .trg-scenecell[aria-pressed='true'] {
  background: ${T};
  box-shadow: inset 3px 0 0 0 ${C};
}
.${S} .trg-scenetitle {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
}
.${S} .trg-scenetitle .trg-code {
  font-variant-numeric: tabular-nums;
  color: ${C};
  flex-shrink: 0;
}
.${S} .trg-scenetitle .trg-name {
  overflow: hidden;
  text-overflow: ellipsis;
}
.${S} .trg-scenemeta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${S} .trg-scenemeta--set { color: ${C}; }
.${S} .trg-scenemeta--conflict { color: ${E}; }
/* Matrix body cells: 44px, pip-centered. */
.${S} .trg-cell {
  height: 44px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: var(--border-width) solid var(--color-border);
}
.${S} .trg-row--dim .trg-cell,
.${S} .trg-row--dim.trg-scenecell {
  opacity: 0.4;
}
/* Pips: 18px. Hollow = cast but unscheduled; fill = rehearsing; warn = !. */
.${S} .trg-pip {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
}
.${S} .trg-pip--open {
  border: 2px solid light-dark(rgba(166, 30, 77, 0.45), rgba(240, 101, 149, 0.5));
}
.${S} .trg-pip--set {
  background: ${C};
  color: ${w};
}
.${S} .trg-pip--warn {
  background: ${E};
  color: light-dark(#FFFFFF, #241503);
}
/* Footer row: 36px per-actor coverage counts, sticky bottom. */
.${S} .trg-foot {
  position: sticky;
  bottom: 0;
  z-index: 4;
  height: 36px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  background: var(--color-background-surface);
  border-top: var(--border-width) solid var(--color-border);
}
.${S} .trg-foot--label {
  left: 0;
  position: sticky;
  z-index: 5;
  justify-content: flex-start;
  padding: 0 var(--spacing-3);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-right: var(--border-width) solid var(--color-border);
}
.${S} .trg-foot--full { color: ${O}; }
.${S} .trg-foot--conflict { color: ${E}; }
/* Focused-actor strip (appears over the matrix top when an actor header is
   pressed): unavailability chips for that actor. */
.${S} .trg-focusstrip {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
  padding: var(--spacing-1) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
  background: ${T};
  font-size: 12px;
  color: var(--color-text-primary);
}
.${S} .trg-focusstrip strong { color: ${C}; }
.${S} .trg-unavail-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px;
  border-radius: 999px;
  border: var(--border-width) solid ${E};
  color: ${E};
  background: ${D};
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
/* --- room-hold rail (300px) ---------------------------------------------- */
.${S} .trg-rail {
  width: 300px;
  flex-shrink: 0;
  box-sizing: border-box;
  border-left: var(--border-width) solid var(--color-border);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.${S} .trg-rail-head {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-background-surface);
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.${S} .trg-room {
  padding: var(--spacing-2) var(--spacing-3) var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${S} .trg-room-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary);
}
.${S} .trg-room-name .trg-room-free {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${S} .trg-room-features {
  margin: 2px 0 var(--spacing-2);
  font-size: 11px;
  color: var(--color-text-secondary);
}
.${S} .trg-holds {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
/* Hold chips: 40px rows. Consumed chips wear the brand tint + scene code;
   free chips are dashed; place-target chips become solid brand buttons. */
.${S} .trg-hold {
  min-height: 40px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: var(--radius-container, 8px);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  font-size: 12px;
  text-align: left;
}
.${S} .trg-hold-slot {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: var(--color-text-primary);
  width: 64px;
  flex-shrink: 0;
}
.${S} .trg-hold-what {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text-secondary);
}
.${S} .trg-hold--consumed {
  border-color: ${C};
  background: ${T};
}
.${S} .trg-hold--consumed .trg-hold-what { color: ${C}; font-weight: 600; }
.${S} .trg-hold--consumed.trg-hold--conflict {
  border-color: ${E};
  background: ${D};
}
.${S} .trg-hold--consumed.trg-hold--conflict .trg-hold-what { color: ${E}; }
.${S} .trg-hold--free {
  border-style: dashed;
}
.${S} button.trg-hold--target {
  border-style: solid;
  border-color: ${C};
  background: ${T};
  cursor: pointer;
}
.${S} button.trg-hold--target .trg-hold-what {
  color: ${C};
  font-weight: 700;
}
.${S} .trg-hold-warncount {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: ${E};
  border: var(--border-width) solid ${E};
  background: ${D};
  white-space: nowrap;
}
.${S} .trg-hold-okcount {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
  color: ${O};
  border: var(--border-width) solid ${O};
  background: ${k};
  white-space: nowrap;
}
/* --- detail bar (min 96px) ----------------------------------------------- */
.${S} .trg-detail {
  flex-shrink: 0;
  min-height: 96px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  padding: var(--spacing-2) var(--spacing-4);
  border-top: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
}
.${S} .trg-detail-title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
}
.${S} .trg-detail-title .trg-code { color: ${C}; font-variant-numeric: tabular-nums; }
.${S} .trg-detail-meta {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${S} .trg-castchips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.${S} .trg-castchip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 9px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
}
.${S} .trg-castchip--warn {
  border-color: ${E};
  color: ${E};
  background: ${D};
}
.${S} .trg-detail-hint {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.${S} .trg-detail-hint strong { color: ${C}; }
/* --- responsive subtraction ---------------------------------------------- */
@media (max-width: 900px) {
  .${S} .trg-matrix {
    grid-template-columns: 240px repeat(${I.length}, 48px);
  }
  .${S} .trg-scenemeta { display: none; }
  .${S} .trg-scenecell { justify-content: center; }
  .${S} .trg-rail { width: 260px; }
}
@media (max-width: 640px) {
  .${S} .trg-body { flex-direction: column; }
  .${S} .trg-matrix-scroll { flex: none; max-height: 46dvh; }
  .${S} .trg-matrix {
    grid-template-columns: 132px repeat(${I.length}, 48px);
  }
  .${S} .trg-scenetitle { font-size: 11.5px; }
  .${S} .trg-rail {
    width: 100%;
    border-left: none;
    border-top: var(--border-width) solid var(--color-border);
    flex: 1;
    min-height: 0;
  }
}
@media (prefers-reduced-motion: no-preference) {
  .${S} .trg-hold,
  .${S} .trg-pip,
  .${S} .trg-scenecell,
  .${S} .trg-actorhead {
    transition: background-color 120ms ease, border-color 120ms ease,
      opacity 120ms ease;
  }
}
`;function Y(){return(0,x.jsx)(`span`,{className:`trg-mark`,"aria-hidden":!0,children:(0,x.jsxs)(`svg`,{width:`22`,height:`22`,viewBox:`0 0 22 22`,fill:`none`,children:[(0,x.jsx)(`path`,{d:`M8.2 2.4 L13.4 2.4 L18.4 16.2 L3.2 16.2 Z`,fill:`currentColor`,opacity:`0.32`}),(0,x.jsx)(`rect`,{x:`7.4`,y:`1.2`,width:`7.2`,height:`3.4`,rx:`1.7`,fill:`currentColor`}),(0,x.jsx)(`ellipse`,{cx:`10.8`,cy:`16.2`,rx:`6.4`,ry:`1.9`,fill:`currentColor`,opacity:`0.75`}),(0,x.jsx)(`rect`,{x:`1`,y:`19`,width:`20`,height:`1.6`,rx:`0.8`,fill:`currentColor`})]})})}function X({pct:e}){let t=2*Math.PI*11,n=e/100*t;return(0,x.jsx)(`span`,{className:`trg-ring`,"aria-hidden":!0,children:(0,x.jsxs)(`svg`,{width:`28`,height:`28`,viewBox:`0 0 28 28`,fill:`none`,children:[(0,x.jsx)(`circle`,{cx:`14`,cy:`14`,r:11,stroke:`var(--color-border)`,strokeWidth:`3.5`}),(0,x.jsx)(`circle`,{cx:`14`,cy:`14`,r:11,stroke:C,strokeWidth:`3.5`,strokeLinecap:`round`,strokeDasharray:`${n} ${t-n}`,transform:`rotate(-90 14 14)`})]})})}function Z({scene:e,actor:t,pip:n,conflict:r,isDim:i}){let a;return n===`warn`&&r!=null?a=`${t.name} — ${r.reason} — conflicts with ${e.code} @ ${P(r.slot)}`:n===`set`?a=`${t.name} rehearses ${e.code}`:n===`open`&&(a=`${t.name} is in ${e.code} (not yet scheduled)`),(0,x.jsxs)(`div`,{className:`trg-cell${i?` trg-row--dim`:``}`,title:a,children:[n===`open`&&(0,x.jsx)(`span`,{className:`trg-pip trg-pip--open`}),n===`set`&&(0,x.jsx)(`span`,{className:`trg-pip trg-pip--set`}),n===`warn`&&(0,x.jsx)(`span`,{className:`trg-pip trg-pip--warn`,children:`!`})]})}function Q({scene:e,assignment:t,conflictCount:n,isSelected:r,isDim:i,onSelect:a}){let o=t==null?null:H[t.roomId],s=t!=null&&o!=null?`${P(t.slot)} · ${o.name}`:`Unscheduled`,c=`Scene ${e.code}, ${e.title}, ${e.pages}, ${t!=null&&o!=null?`scheduled ${F(t.slot)} in ${o.name}${n>0?`, ${n} conflict${n===1?``:`s`}`:``}`:`unscheduled`}`;return(0,x.jsxs)(`button`,{type:`button`,className:`trg-scenecell trg-focusable${i?` trg-row--dim`:``}`,"aria-pressed":r,"aria-label":c,onClick:()=>a(e.id),children:[(0,x.jsxs)(`span`,{className:`trg-scenetitle`,children:[(0,x.jsx)(`span`,{className:`trg-code`,children:e.code}),(0,x.jsx)(`span`,{className:`trg-name`,children:e.title})]}),(0,x.jsxs)(`span`,{className:`trg-scenemeta${n>0?` trg-scenemeta--conflict`:t==null?``:` trg-scenemeta--set`}`,children:[e.pages,` · `,e.pageCount,`pp · `,s,n>0&&` · ${n} conflict${n===1?``:`s`}`]})]})}function te({hold:e,selectedScene:t,conflictCountForConsumer:n,schedule:r,onPlace:a}){let o=P(e.slot);if(e.scene!=null){let t=n>0;return(0,x.jsxs)(`div`,{className:`trg-hold trg-hold--consumed${t?` trg-hold--conflict`:``}`,title:`${e.scene.code} ${e.scene.title} — ${F(e.slot)}`,children:[(0,x.jsx)(`span`,{className:`trg-hold-slot`,children:o}),(0,x.jsxs)(`span`,{className:`trg-hold-what`,children:[e.scene.code,` · `,e.scene.title]}),t&&(0,x.jsxs)(`span`,{className:`trg-hold-warncount`,children:[(0,x.jsx)(i,{icon:u,size:`xsm`,color:`inherit`}),n]})]})}if(t!=null){let n=q(t,e.slot,r),s=n.map(e=>L[e.actorId].name.split(` `)[0]).join(`, `);return(0,x.jsxs)(`button`,{type:`button`,className:`trg-hold trg-hold--target trg-focusable`,"aria-label":`Place scene ${t.code} into ${H[e.roomId].name}, ${F(e.slot)}${n.length>0?`, would create ${n.length} conflict${n.length===1?``:`s`}: ${s}`:`, no conflicts`}`,title:n.length>0?n.map(e=>`${L[e.actorId].name}: ${e.reason}`).join(`
`):void 0,onClick:()=>a(t.id,e.slot,e.roomId),children:[(0,x.jsx)(`span`,{className:`trg-hold-slot`,children:o}),(0,x.jsxs)(`span`,{className:`trg-hold-what`,children:[`Place `,t.code,` here`]}),n.length>0?(0,x.jsxs)(`span`,{className:`trg-hold-warncount`,children:[(0,x.jsx)(i,{icon:u,size:`xsm`,color:`inherit`}),n.length]}):(0,x.jsxs)(`span`,{className:`trg-hold-okcount`,children:[(0,x.jsx)(i,{icon:l,size:`xsm`,color:`inherit`}),`clear`]})]})}return(0,x.jsxs)(`div`,{className:`trg-hold trg-hold--free`,title:F(e.slot),children:[(0,x.jsx)(`span`,{className:`trg-hold-slot`,children:o}),(0,x.jsx)(`span`,{className:`trg-hold-what`,children:`Held — free`})]})}function $(){let[e,t]=(0,b.useState)(W),[n,C]=(0,b.useState)(`s26`),[w,T]=(0,b.useState)(null),[E,D]=(0,b.useState)(``),A=(0,b.useMemo)(()=>G(e),[e]),j=(0,b.useMemo)(()=>K(e),[e]),M=n==null?null:z.find(e=>e.id===n)??null,N=M==null?null:e[M.id],R=w==null?null:L[w],$=e=>A.conflicts.filter(t=>t.sceneId===e).length,re=(n,r,i)=>{let a=z.find(e=>e.id===n);if(a==null)return;let o=q(a,r,e);t(e=>({...e,[n]:{slot:r,roomId:i}}));let s=H[i];D(`Scene ${a.code} placed ${F(r)} in ${s.name}. `+(o.length>0?`${o.length} conflict${o.length===1?``:`s`}: ${o.map(e=>L[e.actorId].name).join(`, `)}.`:`No conflicts.`))},ie=n=>{let r=z.find(e=>e.id===n),i=e[n];r==null||i==null||(t(e=>({...e,[n]:null})),D(`Scene ${r.code} cleared from ${P(i.slot)} — the ${H[i.roomId].name} hold is free again.`))},ae=(0,x.jsx)(g,{hasDivider:!0,children:(0,x.jsx)(`div`,{className:`trg-header-row`,children:(0,x.jsxs)(f,{gap:3,vAlign:`center`,wrap:`wrap`,children:[(0,x.jsx)(Y,{}),(0,x.jsx)(p,{size:`fill`,style:{minWidth:0},children:(0,x.jsxs)(f,{gap:3,vAlign:`center`,wrap:`wrap`,children:[(0,x.jsx)(`span`,{className:`trg-overline`,children:`Greenroom`}),(0,x.jsx)(_,{level:2,children:`Salt & Cedar — rehearsal grid`}),(0,x.jsx)(v,{label:`Fairweather Rep`,variant:`neutral`})]})}),(0,x.jsxs)(f,{gap:2,vAlign:`center`,children:[(0,x.jsx)(i,{icon:a,size:`sm`,color:`secondary`}),(0,x.jsx)(r,{type:`supporting`,color:`secondary`,hasTabularNumbers:!0,children:`Week of Jul 13–18, 2026 · tech Aug 3 · first preview Aug 6`})]})]})})}),oe=(0,x.jsxs)(`div`,{className:`trg-stats`,role:`status`,"aria-label":`Week readiness`,children:[(0,x.jsx)(X,{pct:A.coveragePct}),(0,x.jsxs)(`span`,{className:`trg-stat trg-stat--brand`,children:[(0,x.jsxs)(`strong`,{children:[A.coveragePct,`%`]}),` coverage ·`,` `,(0,x.jsx)(`strong`,{children:A.scheduledPages}),`/`,B,` pp`]}),(0,x.jsxs)(`span`,{className:`trg-stat`,children:[(0,x.jsx)(i,{icon:o,size:`xsm`,color:`inherit`}),(0,x.jsx)(`strong`,{children:A.scheduledScenes}),`/`,z.length,` scenes scheduled`]}),(0,x.jsxs)(`span`,{className:`trg-stat ${A.conflicts.length>0?`trg-stat--warn`:`trg-stat--ok`}`,children:[A.conflicts.length>0?(0,x.jsx)(i,{icon:u,size:`xsm`,color:`inherit`}):(0,x.jsx)(i,{icon:l,size:`xsm`,color:`inherit`}),(0,x.jsx)(`strong`,{children:A.conflicts.length}),` conflict`,A.conflicts.length===1?``:`s`]}),(0,x.jsxs)(`span`,{className:`trg-stat`,children:[(0,x.jsx)(i,{icon:s,size:`xsm`,color:`inherit`}),(0,x.jsx)(`strong`,{children:A.freeHolds}),`/`,U,` holds free`]}),(0,x.jsxs)(`span`,{className:`trg-stat`,children:[(0,x.jsx)(i,{icon:c,size:`xsm`,color:`inherit`}),(0,x.jsx)(`strong`,{children:I.length}),` company`]})]}),se=(0,x.jsx)(`div`,{className:`trg-matrix-scroll`,children:(0,x.jsxs)(`div`,{className:`trg-matrix`,"aria-label":`Actor by scene coverage matrix`,children:[(0,x.jsxs)(`div`,{className:`trg-corner`,children:[(0,x.jsx)(`span`,{className:`trg-corner-title`,children:`Scene ↓ · Actor →`}),(0,x.jsxs)(`span`,{className:`trg-corner-meta`,children:[z.length,` scenes · `,B,` pages`]})]}),I.map(e=>(0,x.jsxs)(`button`,{type:`button`,style:{position:`relative`},className:`trg-actorhead trg-focusable`,"aria-pressed":w===e.id,"aria-label":`${e.name} as ${e.role}. ${A.actorScheduled[e.id]} of ${A.actorTotal[e.id]} scenes scheduled.${A.actorHasConflict[e.id]?` Has a conflict.`:``} Toggle to focus.`,title:`${e.name} — ${e.role}`,onClick:()=>T(t=>t===e.id?null:e.id),children:[A.actorHasConflict[e.id]&&(0,x.jsx)(`span`,{className:`trg-actorwarn`,"aria-hidden":!0,children:(0,x.jsx)(i,{icon:u,size:`xsm`,color:`inherit`})}),(0,x.jsx)(`span`,{className:`trg-avatar`,"aria-hidden":!0,children:e.initials}),(0,x.jsx)(`span`,{className:`trg-actorname`,children:e.name.split(` `)[0]})]},e.id)),z.map(t=>{let r=e[t.id],i=$(t.id),a=w!=null&&!t.cast.includes(w);return(0,x.jsxs)(ne,{children:[(0,x.jsx)(Q,{scene:t,assignment:r,conflictCount:i,isSelected:n===t.id,isDim:a,onSelect:e=>C(t=>t===e?null:e)}),I.map(e=>{let n=t.cast.includes(e.id),i=A.conflictByCell.get(`${t.id}:${e.id}`)??null;return(0,x.jsx)(Z,{scene:t,actor:e,pip:n?i==null?r==null?`open`:`set`:`warn`:`out`,conflict:i,isDim:a},e.id)})]},t.id)}),(0,x.jsx)(`div`,{className:`trg-foot trg-foot--label`,children:`Scheduled / in show`}),I.map(e=>{let t=A.actorScheduled[e.id],n=A.actorTotal[e.id];return(0,x.jsxs)(`div`,{className:`trg-foot${A.actorHasConflict[e.id]?` trg-foot--conflict`:t===n?` trg-foot--full`:``}`,title:`${e.name}: ${t} of ${n} scenes scheduled`,children:[t,`/`,n]},e.id)})]})}),ce=(0,x.jsxs)(`aside`,{className:`trg-rail`,"aria-label":`Room holds`,children:[(0,x.jsxs)(`div`,{className:`trg-rail-head`,children:[(0,x.jsx)(i,{icon:s,size:`xsm`,color:`inherit`}),`Room holds · week of Jul 13`,(0,x.jsxs)(`span`,{style:{marginLeft:`auto`,fontVariantNumeric:`tabular-nums`},children:[A.freeHolds,` free`]})]}),V.map(t=>{let n=t.holds.map(e=>j.get(`${t.id}:${e}`)),r=n.filter(e=>e.scene==null).length;return(0,x.jsxs)(`section`,{className:`trg-room`,"aria-label":t.name,children:[(0,x.jsxs)(`div`,{className:`trg-room-name`,children:[(0,x.jsx)(i,{icon:s,size:`xsm`,color:`inherit`}),t.name,(0,x.jsxs)(`span`,{className:`trg-room-free`,children:[r,`/`,n.length,` free`]})]}),(0,x.jsx)(`p`,{className:`trg-room-features`,children:t.features}),(0,x.jsx)(`div`,{className:`trg-holds`,children:n.map(t=>(0,x.jsx)(te,{hold:t,selectedScene:M!=null&&(N==null||N.slot!==t.slot||N.roomId!==t.roomId)?M:null,conflictCountForConsumer:t.scene==null?0:$(t.scene.id),schedule:e,onPlace:re},`${t.roomId}:${t.slot}`))})]},t.id)})]}),le=(0,x.jsx)(`div`,{className:`trg-detail`,children:M==null?(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(r,{type:`body`,weight:`semibold`,children:`No scene selected`}),(0,x.jsx)(`span`,{className:`trg-detail-hint`,children:`Click a scene row to select it, then place it into any free room hold on the right. Coverage, conflicts, and holds re-derive together.`})]}):(0,x.jsxs)(x.Fragment,{children:[(0,x.jsxs)(`div`,{style:{minWidth:0},children:[(0,x.jsxs)(`div`,{className:`trg-detail-title`,children:[(0,x.jsx)(`span`,{className:`trg-code`,children:M.code}),(0,x.jsx)(`span`,{style:{overflow:`hidden`,textOverflow:`ellipsis`,whiteSpace:`nowrap`},children:M.title})]}),(0,x.jsxs)(`div`,{className:`trg-detail-meta`,children:[M.pages,` · `,M.pageCount,`pp ·`,` `,N==null?`unscheduled`:`${F(N.slot)} · ${H[N.roomId].name}`,M.note!=null&&` · ${M.note}`]})]}),(0,x.jsx)(`div`,{className:`trg-castchips`,"aria-label":`Cast availability`,children:M.cast.map(e=>{let t=L[e],n=A.conflictByCell.get(`${M.id}:${e}`)??null;return(0,x.jsx)(d,{content:n==null?`${t.name} — ${t.role}`:`${t.name}: ${n.reason}`,children:(0,x.jsxs)(`span`,{className:`trg-castchip${n==null?``:` trg-castchip--warn`}`,children:[n!=null&&(0,x.jsx)(i,{icon:u,size:`xsm`,color:`inherit`}),t.name.split(` `)[0],` `,(0,x.jsxs)(`em`,{children:[`(`,t.role,`)`]})]})},e)})}),(0,x.jsx)(p,{size:`fill`,children:(0,x.jsx)(`span`,{className:`trg-detail-hint`,children:N==null?(0,x.jsxs)(x.Fragment,{children:[`Pick a `,(0,x.jsx)(`strong`,{children:`free hold`}),` in the rail — each shows the conflicts it would create.`]}):(0,x.jsxs)(x.Fragment,{children:[`Placed. Pick another `,(0,x.jsx)(`strong`,{children:`free hold`}),` to move it, or clear it.`]})})}),N!=null&&(0,x.jsx)(y,{label:`Clear hold`,variant:`ghost`,size:`sm`,icon:(0,x.jsx)(i,{icon:ee,size:`sm`,color:`inherit`}),onClick:()=>ie(M.id)})]})});return(0,x.jsxs)(`div`,{className:S,style:{height:`100dvh`,width:`100%`},children:[(0,x.jsx)(`style`,{children:J}),(0,x.jsx)(m,{height:`fill`,header:ae,content:(0,x.jsx)(h,{padding:0,children:(0,x.jsxs)(`div`,{className:`trg-content`,children:[(0,x.jsx)(`div`,{"aria-live":`polite`,className:`trg-vh`,children:E}),oe,R!=null&&(0,x.jsxs)(`div`,{className:`trg-focusstrip`,children:[(0,x.jsx)(`strong`,{children:R.name}),(0,x.jsxs)(`span`,{children:[R.role,` · in`,` `,A.actorTotal[R.id],` scenes ·`,` `,A.actorScheduled[R.id],` scheduled`]}),R.unavailable.length===0?(0,x.jsxs)(`span`,{className:`trg-unavail-chip`,style:{borderColor:O,color:O,background:k},children:[(0,x.jsx)(i,{icon:l,size:`xsm`,color:`inherit`}),`fully available`]}):R.unavailable.map(e=>(0,x.jsxs)(`span`,{className:`trg-unavail-chip`,children:[(0,x.jsx)(i,{icon:u,size:`xsm`,color:`inherit`}),P(e.slot),` — `,e.reason]},e.slot))]}),(0,x.jsxs)(`div`,{className:`trg-body`,children:[se,ce]}),le]})})})]})}function ne({children:e}){return(0,x.jsx)(`div`,{style:{display:`contents`},children:e})}export{$ as default};