import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,t as n}from"./jsx-runtime-CIxEorsV.js";import{t as r}from"./Text-zBEZLbyF.js";import{t as i}from"./Icon-C7Tu044I.js";import{t as a}from"./mail-oPmC9AxR.js";import{t as o}from"./message-square-mBFId3sY.js";import{t as s}from"./printer-Bjr7rAJA.js";import{t as c}from"./search-x-B_t8PdOA.js";import{t as l}from"./send-BCcYh7fj.js";import{t as ee}from"./truck-C0CCZbTc.js";import{t as u}from"./undo-2-CfDlmZD0.js";import{w as d}from"./index-Csn9cgK2.js";import{t as f}from"./HStack-2WTukjNp.js";import{t as te}from"./VStack-B8U-hI0Y.js";import{t as p}from"./StackItem-Ca9P7L2I.js";import{n as ne,t as re}from"./LayoutContent-CCL91W7X.js";import{t as ie}from"./LayoutHeader-Cy2mWoMf.js";import{t as ae}from"./LayoutPanel-Cqp-l8I4.js";import{t as m}from"./Heading-7iAMrwFB.js";import{t as h}from"./Badge-0Tj9omHc.js";import{t as g}from"./useMediaQuery-BvG63aw7.js";import{t as oe}from"./Divider-BHIBe6GQ.js";import{t as _}from"./EmptyState-DntueKUI.js";import{n as v,t as y}from"./SegmentedControlItem-fgmDI7nJ.js";import{t as se}from"./useToast-rxZOsO6G.js";var b=e(t(),1),x=n(),S=`light-dark(#166534, #66D19E)`,C=`light-dark(#FFFFFF, #08281A)`,w=`light-dark(rgba(22, 101, 52, 0.10), rgba(102, 209, 158, 0.14))`,T=`light-dark(#B42318, #F97066)`,E=`light-dark(rgba(180, 35, 24, 0.08), rgba(249, 112, 102, 0.14))`,D=`light-dark(#B45309, #F5B458)`,O=`light-dark(rgba(180, 83, 9, 0.10), rgba(245, 180, 88, 0.14))`,k=`ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace`,A=`
.tpl-library-hold-fulfillment {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
}
.tpl-library-hold-fulfillment .lhf-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.tpl-library-hold-fulfillment .lhf-btn:disabled {
  cursor: default;
  opacity: 0.55;
}
.tpl-library-hold-fulfillment .lhf-btn:focus-visible,
.tpl-library-hold-fulfillment .lhf-action:focus-visible,
.tpl-library-hold-fulfillment .lhf-resolve:focus-visible,
.tpl-library-hold-fulfillment .lhf-sendbtn:focus-visible {
  outline: 2px solid ${S};
  outline-offset: 2px;
}
.tpl-library-hold-fulfillment .lhf-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.tpl-library-hold-fulfillment .lhf-pane {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.tpl-library-hold-fulfillment .lhf-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

/* ---- run-spine strip: 68px, pinned above the scrolling sheet ---- */
.tpl-library-hold-fulfillment .lhf-spinestrip {
  height: 68px;
  flex: none;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding-inline: var(--spacing-3);
  border-block-end: var(--border-width) solid var(--color-border);
}
.tpl-library-hold-fulfillment .lhf-spine {
  flex: 1;
  min-width: 120px;
  display: flex;
  gap: 8px;
}
.tpl-library-hold-fulfillment .lhf-spinegroup {
  display: flex;
  gap: 2px;
  flex: 1;
}
.tpl-library-hold-fulfillment .lhf-spinecell {
  height: 12px;
  flex: 1;
  min-width: 6px;
  border-radius: 2px;
  background: var(--color-border);
  transition: background-color 160ms ease;
}
.tpl-library-hold-fulfillment .lhf-spinecell[data-s='pulled'] {
  background: ${S};
}
.tpl-library-hold-fulfillment .lhf-spinecell[data-s='missing'] {
  background: ${T};
}
.tpl-library-hold-fulfillment .lhf-spinecell[data-s='reassigned'],
.tpl-library-hold-fulfillment .lhf-spinecell[data-s='cancelled'] {
  background: ${D};
}
.tpl-library-hold-fulfillment .lhf-spinestats {
  display: flex;
  gap: var(--spacing-3);
  align-items: baseline;
  flex: none;
}
.tpl-library-hold-fulfillment .lhf-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}
.tpl-library-hold-fulfillment .lhf-statnum {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}
.tpl-library-hold-fulfillment .lhf-statnum[data-tone='brand'] {
  color: ${S};
}
.tpl-library-hold-fulfillment .lhf-statnum[data-tone='miss'] {
  color: ${T};
}
.tpl-library-hold-fulfillment .lhf-statlabel {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* ---- sticky 40px stack-range headers ---- */
.tpl-library-hold-fulfillment .lhf-grouphead {
  position: sticky;
  top: 0;
  z-index: 5;
  height: 40px;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding-inline: var(--spacing-3);
  background: var(--color-background);
  border-block-end: var(--border-width) solid var(--color-border);
}
.tpl-library-hold-fulfillment .lhf-grouprange {
  font-family: ${k};
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-text-primary);
  white-space: nowrap;
}
.tpl-library-hold-fulfillment .lhf-groupwhere {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
}
.tpl-library-hold-fulfillment .lhf-grouptally {
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.tpl-library-hold-fulfillment .lhf-grouptally[data-done='true'] {
  color: ${S};
}
.tpl-library-hold-fulfillment .lhf-locator {
  flex: none;
  display: block;
}

/* ---- 56px item rows ---- */
.tpl-library-hold-fulfillment .lhf-row {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--spacing-3);
  min-height: 56px;
  padding: 6px var(--spacing-3);
  border-block-end: var(--border-width) solid var(--color-border);
  transition: background-color 160ms ease;
}
.tpl-library-hold-fulfillment .lhf-row[data-s='pulled'] {
  background: ${w};
}
.tpl-library-hold-fulfillment .lhf-row[data-s='missing'] {
  background: ${E};
}
.tpl-library-hold-fulfillment .lhf-row[data-s='reassigned'],
.tpl-library-hold-fulfillment .lhf-row[data-s='cancelled'] {
  background: ${O};
}
.tpl-library-hold-fulfillment .lhf-callcell {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: flex-start;
}
.tpl-library-hold-fulfillment .lhf-callno {
  font-family: ${k};
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  white-space: nowrap;
}
.tpl-library-hold-fulfillment .lhf-titlecell {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.tpl-library-hold-fulfillment .lhf-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-library-hold-fulfillment .lhf-row[data-s='cancelled'] .lhf-title {
  text-decoration: line-through;
  color: var(--color-text-secondary);
}
.tpl-library-hold-fulfillment .lhf-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-library-hold-fulfillment .lhf-chiprow {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}
.tpl-library-hold-fulfillment .lhf-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 20px;
  padding-inline: 7px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-secondary);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.tpl-library-hold-fulfillment .lhf-chip[data-tone='brand'] {
  border-color: transparent;
  background: ${w};
  color: ${S};
  font-weight: 600;
}
.tpl-library-hold-fulfillment .lhf-chip[data-tone='miss'] {
  border-color: transparent;
  background: ${E};
  color: ${T};
  font-weight: 600;
}
.tpl-library-hold-fulfillment .lhf-chip[data-tone='warn'] {
  border-color: transparent;
  background: ${O};
  color: ${D};
  font-weight: 600;
}
.tpl-library-hold-fulfillment .lhf-actions {
  display: flex;
  gap: 6px;
  align-items: center;
  flex: none;
}
.tpl-library-hold-fulfillment .lhf-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 40px;
  min-width: 40px;
  padding-inline: 10px;
  border-radius: 8px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 120ms ease, border-color 120ms ease;
}
.tpl-library-hold-fulfillment .lhf-action[data-kind='pull'] {
  border-color: ${S};
  background: ${S};
  color: ${C};
}
.tpl-library-hold-fulfillment .lhf-action[data-kind='miss'] {
  color: ${T};
}
@media (hover: hover) {
  .tpl-library-hold-fulfillment .lhf-action[data-kind='miss']:hover {
    background: ${E};
  }
  .tpl-library-hold-fulfillment .lhf-action[data-kind='undo']:hover {
    background: ${w};
  }
}

/* ---- end panel: exception lane + notice queue ---- */
.tpl-library-hold-fulfillment .lhf-sectionhead {
  height: 36px;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding-inline: var(--spacing-3);
  position: sticky;
  top: 0;
  z-index: 4;
  background: var(--color-background);
  border-block-end: var(--border-width) solid var(--color-border);
}
.tpl-library-hold-fulfillment .lhf-overline {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.tpl-library-hold-fulfillment .lhf-card {
  margin: var(--spacing-3);
  border: var(--border-width) solid ${T};
  border-radius: 10px;
  overflow: hidden;
}
.tpl-library-hold-fulfillment .lhf-cardhead {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  background: ${E};
}
.tpl-library-hold-fulfillment .lhf-cardbody {
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
.tpl-library-hold-fulfillment .lhf-hint {
  font-size: 12px;
  line-height: 1.45;
  color: var(--color-text-secondary);
}
.tpl-library-hold-fulfillment .lhf-resolve {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 40px;
  padding: 6px 10px;
  border-radius: 8px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  text-align: start;
  transition: border-color 120ms ease;
}
.tpl-library-hold-fulfillment .lhf-resolve:disabled {
  cursor: default;
  opacity: 0.55;
}
@media (hover: hover) {
  .tpl-library-hold-fulfillment .lhf-resolve:hover:enabled {
    border-color: ${S};
  }
}
.tpl-library-hold-fulfillment .lhf-resolve small {
  display: block;
  font-size: 11px;
  font-weight: 400;
  color: var(--color-text-secondary);
}
.tpl-library-hold-fulfillment .lhf-noticerow {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 52px;
  padding: 6px var(--spacing-3);
  border-block-end: var(--border-width) solid var(--color-border);
}
.tpl-library-hold-fulfillment .lhf-noticetext {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.tpl-library-hold-fulfillment .lhf-sentrow {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
  min-height: 36px;
  padding: 4px var(--spacing-3);
  font-variant-numeric: tabular-nums;
}
.tpl-library-hold-fulfillment .lhf-batchbar {
  padding: var(--spacing-3);
  border-block-end: var(--border-width) solid var(--color-border);
}
.tpl-library-hold-fulfillment .lhf-sendbtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 40px;
  border-radius: 8px;
  border: var(--border-width) solid ${S};
  background: ${S};
  color: ${C};
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.tpl-library-hold-fulfillment .lhf-sendbtn:disabled {
  border-color: var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: default;
}

/* ---- responsive subtraction ---- */
@media (max-width: 480px) {
  .tpl-library-hold-fulfillment .lhf-row {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas: 'call actions' 'title actions' 'chips actions';
    row-gap: 4px;
  }
  .tpl-library-hold-fulfillment .lhf-callcell {
    grid-area: call;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }
  .tpl-library-hold-fulfillment .lhf-titlecell {
    grid-area: title;
    display: contents;
  }
  .tpl-library-hold-fulfillment .lhf-titlestack {
    grid-area: title;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .tpl-library-hold-fulfillment .lhf-chiprow {
    grid-area: chips;
  }
  .tpl-library-hold-fulfillment .lhf-actions {
    grid-area: actions;
    flex-direction: column;
    align-items: stretch;
  }
  .tpl-library-hold-fulfillment .lhf-locator {
    display: none;
  }
  .tpl-library-hold-fulfillment .lhf-stat[data-optional='true'] {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .tpl-library-hold-fulfillment .lhf-spinecell,
  .tpl-library-hold-fulfillment .lhf-row,
  .tpl-library-hold-fulfillment .lhf-action,
  .tpl-library-hold-fulfillment .lhf-resolve {
    transition: none;
  }
}
`,j={central:{id:`central`,name:`Central`,code:`CEN`},eastgate:{id:`eastgate`,name:`Eastgate`,code:`EAS`},rivernorth:{id:`rivernorth`,name:`River North`,code:`RVN`}},M={okafor:{id:`okafor`,card:`P-4471`,name:`M. Okafor`,contact:`email`},lindqvist:{id:`lindqvist`,card:`P-2093`,name:`A. Lindqvist`,contact:`sms`},reyes:{id:`reyes`,card:`P-8815`,name:`M. Reyes`,contact:`email`},chen:{id:`chen`,card:`P-1207`,name:`L. Chen`,contact:`sms`},abara:{id:`abara`,card:`P-6634`,name:`C. Abara`,contact:`email`},whitfield:{id:`whitfield`,card:`P-0388`,name:`E. Whitfield`,contact:`print`},dalal:{id:`dalal`,card:`P-5520`,name:`R. Dalal`,contact:`email`},moreau:{id:`moreau`,card:`P-3961`,name:`S. Moreau`,contact:`sms`},kim:{id:`kim`,card:`P-7742`,name:`J. Kim`,contact:`email`},santos:{id:`santos`,card:`P-9106`,name:`D. Santos`,contact:`print`}},N={book:`Book`,folio:`Folio / oversize`,disc:`DVD`,audio:`Audiobook`},P=[{id:`g-fic-ag`,range:`FIC A–G`,floor:`Floor 1`,aisles:`Aisles 12–14`,aisleFrom:12,aisleTo:14},{id:`g-fic-hp`,range:`FIC H–P`,floor:`Floor 1`,aisles:`Aisles 15–17`,aisleFrom:15,aisleTo:17},{id:`g-nonfic`,range:`641–759`,floor:`Floor 2`,aisles:`Aisles 03–06`,aisleFrom:3,aisleTo:6},{id:`g-media`,range:`J PIC & MEDIA`,floor:`Ground`,aisles:`Aisles 21–22`,aisleFrom:21,aisleTo:22}],F=24,I=[{id:`i-01`,rangeId:`g-fic-ag`,callNo:`FIC ADI`,title:`Half of a Yellow Sun`,author:`Adichie, Chimamanda Ngozi`,format:`book`,patron:`okafor`,pickup:`central`,placed:`Jul 2`,expires:`Jul 16`,searchHint:`Check the A–C reshelving cart at the Floor 1 desk.`},{id:`i-02`,rangeId:`g-fic-ag`,callNo:`FIC ATK`,title:`Life After Life`,author:`Atkinson, Kate`,format:`book`,patron:`lindqvist`,pickup:`eastgate`,placed:`Jul 3`,expires:`Jul 17`,nextCopy:{branch:`rivernorth`,callNo:`FIC ATK c.2`},searchHint:`Two copies at Central — the second may be on display.`},{id:`i-03`,rangeId:`g-fic-ag`,callNo:`FIC BEN`,title:`The Vanishing Half`,author:`Bennett, Brit`,format:`book`,patron:`reyes`,pickup:`central`,placed:`Jun 30`,expires:`Jul 14`,searchHint:`Recently returned — start with the sorting room bins.`},{id:`i-04`,rangeId:`g-fic-ag`,callNo:`FIC CLA`,title:`Piranesi`,author:`Clarke, Susanna`,format:`book`,patron:`chen`,pickup:`rivernorth`,placed:`Jul 5`,expires:`Jul 19`,searchHint:`Slim spine — often pushed behind FIC CLE.`},{id:`i-05`,rangeId:`g-fic-hp`,callNo:`FIC LEB`,title:`The Extraordinary Adventures of Arsène Lupin, Gentleman-Burglar — Annotated Centennial Edition`,author:`Leblanc, Maurice`,format:`book`,patron:`whitfield`,pickup:`central`,placed:`Jun 27`,expires:`Jul 11`,nextCopy:{branch:`eastgate`,callNo:`FIC LEB c.2`},searchHint:`Annotated edition is 6 cm thick — check the oversize overflow at the end of Aisle 17.`},{id:`i-06`,rangeId:`g-fic-hp`,callNo:`FIC MOR`,title:`Beloved`,author:`Morrison, Toni`,format:`book`,patron:`abara`,pickup:`central`,placed:`Jul 4`,expires:`Jul 18`,searchHint:`High-turnover title — check the returns chute cart.`},{id:`i-07`,rangeId:`g-fic-hp`,callNo:`FIC NGU`,title:`The Sympathizer`,author:`Nguyen, Viet Thanh`,format:`book`,patron:`dalal`,pickup:`eastgate`,placed:`Jul 1`,expires:`Jul 15`,searchHint:`Book-club season — a copy may be on the staff-picks table.`},{id:`i-08`,rangeId:`g-fic-hp`,callNo:`FIC OZE`,title:`A Tale for the Time Being`,author:`Ozeki, Ruth`,format:`book`,patron:`moreau`,pickup:`central`,placed:`Jul 6`,expires:`Jul 20`,searchHint:`Check adjacent range FIC P — frequently misfiled.`},{id:`i-09`,rangeId:`g-nonfic`,callNo:`641.5 OTT`,title:`Ottolenghi Simple`,author:`Ottolenghi, Yotam`,format:`book`,patron:`kim`,pickup:`central`,placed:`Jul 3`,expires:`Jul 17`,searchHint:`Cookbooks drift — sweep 641.5 both directions.`},{id:`i-10`,rangeId:`g-nonfic`,callNo:`709 GOM`,title:`The Story of Art`,author:`Gombrich, E. H.`,format:`folio`,patron:`santos`,pickup:`eastgate`,placed:`Jun 29`,expires:`Jul 13`,shelfNote:`FOLIO — shelved flat on the top shelf; ladder at aisle end.`,searchHint:`Folio shelf only — never interfiled with the octavos.`},{id:`i-11`,rangeId:`g-nonfic`,callNo:`746.43 ZIM`,title:`Knitting Without Tears`,author:`Zimmermann, Elizabeth`,format:`book`,patron:`lindqvist`,pickup:`central`,placed:`Jul 7`,expires:`Jul 21`,searchHint:`Craft circle meets Wednesdays — check the program room.`},{id:`i-12`,rangeId:`g-media`,callNo:`J PIC WIL`,title:`Knuffle Bunny: A Cautionary Tale`,author:`Willems, Mo`,format:`book`,patron:`moreau`,pickup:`rivernorth`,placed:`Jul 2`,expires:`Jul 16`,searchHint:`Picture books live face-out — scan bins W–Z twice.`},{id:`i-13`,rangeId:`g-media`,callNo:`DVD 791.43 EVE`,title:`Everything Everywhere All at Once`,author:`Kwan & Scheinert, dirs.`,format:`disc`,patron:`okafor`,pickup:`central`,placed:`Jul 5`,expires:`Jul 19`,shelfNote:`Verify the disc is in the case before pulling.`,searchHint:`Empty display cases point to the locked media drawer.`},{id:`i-14`,rangeId:`g-media`,callNo:`CD AUD FIC WHI`,title:`The Underground Railroad (audio, 10 discs)`,author:`Whitehead, Colson`,format:`audio`,patron:`abara`,pickup:`eastgate`,placed:`Jun 26`,expires:`Jul 11`,shelfNote:`Count the discs — set circulates incomplete.`,searchHint:`Audio sets migrate to the listening-corner rack.`}],ce={"i-03":{status:`pulled`},"i-05":{status:`missing`,exceptionClock:`08:12`},"i-07":{status:`pulled`},"i-12":{status:`pulled`}},L=[`08:31`,`08:35`,`08:39`,`08:43`,`08:47`,`08:51`,`08:55`,`08:59`,`09:03`,`09:07`,`09:11`,`09:15`,`09:19`,`09:23`],R=[`11:00`,`11:45`,`12:30`,`13:15`,`14:00`,`14:45`],z=[{id:`b-0915`,clock:`09:15`,count:2,summary:`2 notices · 1 ready · 1 transit (run PR-2607-A, first sweep)`}],B={ready:`READY`,transit:`TRANSIT`,delay:`DELAY`,cancelled:`CANCELLED`},V={ready:`brand`,transit:`warn`,delay:`warn`,cancelled:`miss`};function H(e,t){let n=M[e.patron],r=j[e.pickup];switch(t.status){case`pulled`:return e.pickup===`central`?{key:`${e.id}:ready`,kind:`ready`,item:e,patron:n,line:`Ready at Central holds shelf · expires ${e.expires}`}:{key:`${e.id}:transit`,kind:`transit`,item:e,patron:n,line:`Routing Central → ${r.name} · ready notice on arrival`};case`reassigned`:{let t=e.nextCopy?j[e.nextCopy.branch]:r;return{key:`${e.id}:transit`,kind:`transit`,item:e,patron:n,line:`Next copy routing ${t.name} → ${r.name}`}}case`missing`:return{key:`${e.id}:delay`,kind:`delay`,item:e,patron:n,line:`Hold paused — shelf search open since ${t.exceptionClock??`08:31`}`};case`cancelled`:return{key:`${e.id}:cancelled`,kind:`cancelled`,item:e,patron:n,line:`Only copy unaccounted for — hold cancelled with apology`};default:return null}}function U(e,t){return e[t]??{status:`pending`}}function W(e){return e===`pulled`||e===`reassigned`||e===`cancelled`}var G={email:{icon:a,label:`email`},sms:{icon:o,label:`SMS`},print:{icon:s,label:`print postcard`}};function le({size:e=22}){return(0,x.jsxs)(`svg`,{width:e,height:e,viewBox:`0 0 22 22`,role:`img`,"aria-label":`Stacks`,style:{color:S,flex:`none`},children:[(0,x.jsx)(`rect`,{x:`3`,y:`4`,width:`4`,height:`14`,rx:`1`,fill:`currentColor`}),(0,x.jsx)(`rect`,{x:`9`,y:`6`,width:`4`,height:`12`,rx:`1`,fill:`currentColor`,opacity:`0.75`}),(0,x.jsx)(`rect`,{x:`17.2`,y:`4.4`,width:`4`,height:`13`,rx:`1`,fill:`currentColor`,opacity:`0.55`,transform:`rotate(12 17.2 4.4)`}),(0,x.jsx)(`rect`,{x:`2`,y:`18.6`,width:`18`,height:`1.6`,rx:`0.8`,fill:`currentColor`})]})}function ue({format:e}){let t={width:16,height:16,viewBox:`0 0 16 16`,role:`img`,"aria-label":N[e],style:{color:`var(--color-text-secondary)`,flex:`none`}};switch(e){case`book`:return(0,x.jsxs)(`svg`,{...t,children:[(0,x.jsx)(`rect`,{x:`4.5`,y:`2`,width:`7`,height:`12`,rx:`1`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.4`}),(0,x.jsx)(`line`,{x1:`6.8`,y1:`2.6`,x2:`6.8`,y2:`13.4`,stroke:`currentColor`,strokeWidth:`1`})]});case`folio`:return(0,x.jsxs)(`svg`,{...t,children:[(0,x.jsx)(`rect`,{x:`1.5`,y:`5`,width:`13`,height:`6.5`,rx:`1`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.4`}),(0,x.jsx)(`line`,{x1:`1.5`,y1:`7.4`,x2:`14.5`,y2:`7.4`,stroke:`currentColor`,strokeWidth:`1`}),(0,x.jsx)(`path`,{d:`M5 2.8h6`,stroke:`currentColor`,strokeWidth:`1.2`,strokeLinecap:`round`})]});case`disc`:return(0,x.jsxs)(`svg`,{...t,children:[(0,x.jsx)(`circle`,{cx:`8`,cy:`8`,r:`6`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.4`}),(0,x.jsx)(`circle`,{cx:`8`,cy:`8`,r:`1.6`,fill:`currentColor`})]});case`audio`:return(0,x.jsxs)(`svg`,{...t,children:[(0,x.jsx)(`path`,{d:`M3 10v-1.5a5 5 0 0 1 10 0V10`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.4`,strokeLinecap:`round`}),(0,x.jsx)(`rect`,{x:`2`,y:`9.4`,width:`3`,height:`4.2`,rx:`1`,fill:`currentColor`}),(0,x.jsx)(`rect`,{x:`11`,y:`9.4`,width:`3`,height:`4.2`,rx:`1`,fill:`currentColor`})]});default:return null}}function de({range:e}){let t=72/F,n=(e.aisleFrom-1)*t,r=(e.aisleTo-e.aisleFrom+1)*t;return(0,x.jsxs)(`svg`,{className:`lhf-locator`,width:72,height:12,viewBox:`0 0 72 12`,"aria-hidden":`true`,children:[(0,x.jsx)(`rect`,{x:`0.5`,y:`2.5`,width:71,height:7,rx:`2`,fill:`none`,stroke:`var(--color-border)`,strokeWidth:`1`}),(0,x.jsx)(`rect`,{x:n+1,y:`4`,width:Math.max(r-2,2),height:4,rx:`1.5`,fill:S})]})}function K(){let e=se(),[t,n]=(0,b.useState)(ce),[a,o]=(0,b.useState)(()=>new Set),[s,S]=(0,b.useState)(z),[C,w]=(0,b.useState)(0),[T,E]=(0,b.useState)(``),[D,O]=(0,b.useState)(`run`),N=g(`(max-width: 760px)`),F=g(`(max-width: 1100px)`),K=I.filter(e=>U(t,e.id).status===`pulled`).length,q=I.filter(e=>W(U(t,e.id).status)).length,J=I.filter(e=>U(t,e.id).status===`missing`),fe=I.filter(e=>U(t,e.id).status===`pending`).length,Y=I.flatMap(e=>{let n=H(e,U(t,e.id));return n!==null&&!a.has(n.key)?[n]:[]}),pe=e=>{let n=I.filter(t=>t.rangeId===e);return{handled:n.filter(e=>W(U(t,e.id).status)).length,total:n.length}},me=t=>{n(e=>({...e,[t.id]:{status:`pulled`}}));let r=j[t.pickup],i=t.pickup===`central`?`ready notice queued`:`transit slip to ${r.name} queued`;e({body:`${t.callNo} pulled — ${i}`,isAutoHide:!0}),E(`${t.title} marked pulled. ${q+1} of ${I.length} handled. Notice queued for ${M[t.patron].name}.`)},X=t=>{let r=L[Math.min(C,L.length-1)];n(e=>({...e,[t.id]:{status:`missing`,exceptionClock:r}})),w(e=>e+1),e({body:`${t.callNo} not on shelf — exception opened at ${r}`,isAutoHide:!0}),E(`${t.title} reported not on shelf. Exception opened in the shelf-exception lane; delay notice queued for ${M[t.patron].name}.`)},he=t=>{n(e=>{let n={...e};return delete n[t.id],n}),e({body:`${t.callNo} back to pending`,isAutoHide:!0}),E(`${t.title} reset to pending. Its queued notice was withdrawn.`)},ge=t=>{n(e=>({...e,[t.id]:{status:`pulled`}})),e({body:`${t.callNo} found on the sorting cart — pulled`,isAutoHide:!0}),E(`Exception resolved: ${t.title} found and pulled. Ready notice queued.`)},_e=t=>{if(!t.nextCopy)return;let r=j[t.nextCopy.branch];n(e=>({...e,[t.id]:{status:`reassigned`,exceptionClock:U(e,t.id).exceptionClock}})),e({body:`Hold moved to ${t.nextCopy.callNo} at ${r.name}`,isAutoHide:!0}),E(`Exception resolved: next copy at ${r.name} will fill the hold for ${M[t.patron].name}. Transit notice queued.`)},ve=t=>{n(e=>({...e,[t.id]:{status:`cancelled`,exceptionClock:U(e,t.id).exceptionClock}})),e({body:`Hold cancelled for ${M[t.patron].name} — apology queued`,isAutoHide:!0}),E(`Exception resolved: hold on ${t.title} cancelled. Apology notice queued for ${M[t.patron].name} via ${G[M[t.patron].contact].label}.`)},ye=()=>{if(Y.length===0)return;let t=s.length-z.length,n=R[Math.min(t,R.length-1)],r=Y.filter(e=>e.kind===`ready`).length,i=Y.filter(e=>e.kind===`transit`).length,a=Y.length-r-i,c=[`${Y.length} notice${Y.length===1?``:`s`}`,`${r} ready`,`${i} transit`];a>0&&c.push(`${a} delay/cancel`),o(e=>{let t=new Set(e);for(let e of Y)t.add(e.key);return t}),S(e=>[...e,{id:`b-${n.replace(`:`,``)}-${e.length}`,clock:n,count:Y.length,summary:c.join(` · `)}]),e({body:`Batch sent at ${n} — ${Y.length} notice${Y.length===1?``:`s`}`,isAutoHide:!0}),E(`Notice batch sent at ${n}: ${c.join(`, `)}. Queue is empty.`)},be=(0,x.jsxs)(`div`,{className:`lhf-spinestrip`,children:[(0,x.jsx)(`div`,{className:`lhf-spine`,role:`img`,"aria-label":`Run progress: ${q} of ${I.length} handled, ${J.length} open exception${J.length===1?``:`s`}`,children:P.map(e=>(0,x.jsx)(`div`,{className:`lhf-spinegroup`,children:I.filter(t=>t.rangeId===e.id).map(e=>(0,x.jsx)(`div`,{className:`lhf-spinecell`,"data-s":U(t,e.id).status,title:`${e.callNo} — ${U(t,e.id).status}`},e.id))},e.id))}),(0,x.jsxs)(`div`,{className:`lhf-spinestats`,children:[(0,x.jsxs)(`div`,{className:`lhf-stat`,children:[(0,x.jsx)(`span`,{className:`lhf-statnum`,"data-tone":`brand`,children:K}),(0,x.jsx)(`span`,{className:`lhf-statlabel`,children:`pulled`})]}),(0,x.jsxs)(`div`,{className:`lhf-stat`,children:[(0,x.jsx)(`span`,{className:`lhf-statnum`,"data-tone":`miss`,children:J.length}),(0,x.jsx)(`span`,{className:`lhf-statlabel`,children:`exceptions`})]}),(0,x.jsxs)(`div`,{className:`lhf-stat`,"data-optional":`true`,children:[(0,x.jsx)(`span`,{className:`lhf-statnum`,children:fe}),(0,x.jsx)(`span`,{className:`lhf-statlabel`,children:`to go`})]}),(0,x.jsxs)(`div`,{className:`lhf-stat`,"data-optional":`true`,children:[(0,x.jsxs)(`span`,{className:`lhf-statnum`,children:[q,`/`,I.length]}),(0,x.jsx)(`span`,{className:`lhf-statlabel`,children:`handled`})]})]})]}),xe=e=>{let n=U(t,e.id),r=M[e.patron],a=j[e.pickup],o=n.status===`pending`,s=e.expires===`Jul 11`,l=(()=>{switch(n.status){case`pulled`:return(0,x.jsx)(`span`,{className:`lhf-chip`,"data-tone":`brand`,children:`pulled`});case`missing`:return(0,x.jsxs)(`span`,{className:`lhf-chip`,"data-tone":`miss`,children:[`exception open · `,n.exceptionClock]});case`reassigned`:return(0,x.jsxs)(`span`,{className:`lhf-chip`,"data-tone":`warn`,children:[`next copy`,` `,e.nextCopy?j[e.nextCopy.branch].code:``]});case`cancelled`:return(0,x.jsx)(`span`,{className:`lhf-chip`,"data-tone":`miss`,children:`hold cancelled`});default:return null}})();return(0,x.jsxs)(`div`,{className:`lhf-row`,"data-s":n.status,children:[(0,x.jsxs)(`div`,{className:`lhf-callcell`,children:[(0,x.jsx)(`span`,{className:`lhf-callno`,children:e.callNo}),(0,x.jsx)(ue,{format:e.format})]}),(0,x.jsxs)(`div`,{className:`lhf-titlecell`,children:[(0,x.jsxs)(`div`,{className:`lhf-titlestack`,children:[(0,x.jsx)(`span`,{className:`lhf-title`,title:e.title,children:e.title}),(0,x.jsxs)(`span`,{className:`lhf-sub`,children:[e.author,e.shelfNote?` — ${e.shelfNote}`:``]})]}),(0,x.jsxs)(`div`,{className:`lhf-chiprow`,children:[(0,x.jsxs)(`span`,{className:`lhf-chip`,children:[r.name,` · `,r.card]}),(0,x.jsxs)(`span`,{className:`lhf-chip`,children:[`pickup `,F?a.code:a.name]}),s&&(0,x.jsxs)(`span`,{className:`lhf-chip`,"data-tone":`warn`,children:[`expires `,e.expires]}),l]})]}),(0,x.jsx)(`div`,{className:`lhf-actions`,children:o?(0,x.jsxs)(x.Fragment,{children:[(0,x.jsxs)(`button`,{type:`button`,className:`lhf-action`,"data-kind":`pull`,onClick:()=>me(e),children:[(0,x.jsx)(i,{icon:d,size:`sm`,color:`inherit`}),`Pulled`]}),(0,x.jsxs)(`button`,{type:`button`,className:`lhf-action`,"data-kind":`miss`,onClick:()=>X(e),children:[(0,x.jsx)(i,{icon:c,size:`sm`,color:`inherit`}),`Not on shelf`]})]}):(0,x.jsxs)(`button`,{type:`button`,className:`lhf-action`,"data-kind":`undo`,"aria-label":`Undo — set ${e.callNo} back to pending`,onClick:()=>he(e),children:[(0,x.jsx)(i,{icon:u,size:`sm`,color:`inherit`}),`Undo`]})})]},e.id)},Z=(0,x.jsxs)(`div`,{className:`lhf-pane`,children:[be,(0,x.jsx)(`div`,{className:`lhf-scroll`,children:P.map(e=>{let t=pe(e.id);return(0,x.jsxs)(`section`,{"aria-label":`Stack range ${e.range}`,children:[(0,x.jsxs)(`div`,{className:`lhf-grouphead`,children:[(0,x.jsx)(`span`,{className:`lhf-grouprange`,children:e.range}),(0,x.jsxs)(`span`,{className:`lhf-groupwhere`,children:[e.floor,` · `,e.aisles]}),(0,x.jsx)(de,{range:e}),(0,x.jsxs)(`span`,{className:`lhf-grouptally`,"data-done":t.handled===t.total?`true`:`false`,children:[t.handled,`/`,t.total]})]}),I.filter(t=>t.rangeId===e.id).map(xe)]},e.id)})})]}),Q=(0,x.jsxs)(`section`,{"aria-label":`Shelf exceptions`,children:[(0,x.jsxs)(`div`,{className:`lhf-sectionhead`,children:[(0,x.jsx)(`span`,{className:`lhf-overline`,children:`Shelf exceptions`}),(0,x.jsx)(p,{size:`fill`,children:(0,x.jsx)(`span`,{})}),(0,x.jsx)(h,{label:String(J.length),variant:J.length>0?`error`:`neutral`})]}),J.length===0?(0,x.jsx)(_,{title:`No open exceptions`,description:`Items marked “Not on shelf” land here with search hints and next-step resolutions.`}):J.map(e=>{let n=U(t,e.id),a=M[e.patron];return(0,x.jsxs)(`div`,{className:`lhf-card`,children:[(0,x.jsxs)(`div`,{className:`lhf-cardhead`,children:[(0,x.jsx)(i,{icon:c,size:`sm`,color:`inherit`}),(0,x.jsxs)(te,{gap:0,children:[(0,x.jsx)(r,{type:`body`,maxLines:2,children:e.title}),(0,x.jsxs)(r,{type:`supporting`,color:`secondary`,maxLines:1,children:[(0,x.jsx)(`span`,{style:{fontFamily:k,fontSize:11.5},children:e.callNo}),` `,`· not on shelf at `,n.exceptionClock,` · hold for`,` `,a.name]})]})]}),(0,x.jsxs)(`div`,{className:`lhf-cardbody`,children:[(0,x.jsx)(`p`,{className:`lhf-hint`,children:e.searchHint}),(0,x.jsxs)(`button`,{type:`button`,className:`lhf-resolve`,onClick:()=>ge(e),children:[(0,x.jsx)(i,{icon:d,size:`sm`,color:`inherit`}),(0,x.jsxs)(`span`,{children:[`Found on sorting cart`,(0,x.jsx)(`small`,{children:`Marks pulled · queues the patron notice`})]})]}),(0,x.jsxs)(`button`,{type:`button`,className:`lhf-resolve`,disabled:!e.nextCopy,onClick:()=>_e(e),children:[(0,x.jsx)(i,{icon:ee,size:`sm`,color:`inherit`}),(0,x.jsxs)(`span`,{children:[e.nextCopy?`Transfer next copy — ${e.nextCopy.callNo} at ${j[e.nextCopy.branch].name}`:`Transfer next copy`,(0,x.jsx)(`small`,{children:e.nextCopy?`Reassigns the hold · queues a transit notice`:`No circulating copy at another branch`})]})]}),(0,x.jsxs)(`button`,{type:`button`,className:`lhf-resolve`,onClick:()=>ve(e),children:[(0,x.jsx)(i,{icon:l,size:`sm`,color:`inherit`}),(0,x.jsxs)(`span`,{children:[`Cancel hold & notify`,(0,x.jsxs)(`small`,{children:[`Apology via `,G[a.contact].label]})]})]})]})]},e.id)})]}),$=(0,x.jsxs)(`section`,{"aria-label":`Patron notice queue`,children:[(0,x.jsxs)(`div`,{className:`lhf-sectionhead`,children:[(0,x.jsx)(`span`,{className:`lhf-overline`,children:`Patron notices`}),(0,x.jsx)(p,{size:`fill`,children:(0,x.jsx)(`span`,{})}),(0,x.jsx)(h,{label:`${Y.length} pending`,variant:Y.length>0?`info`:`neutral`})]}),(0,x.jsx)(`div`,{className:`lhf-batchbar`,children:(0,x.jsxs)(`button`,{type:`button`,className:`lhf-sendbtn`,disabled:Y.length===0,onClick:ye,children:[(0,x.jsx)(i,{icon:l,size:`sm`,color:`inherit`}),Y.length===0?`Queue empty — nothing to send`:`Send batch (${Y.length})`]})}),Y.length===0?(0,x.jsx)(_,{title:`No pending notices`,description:`Pulling items and resolving exceptions queues READY, TRANSIT, DELAY, and CANCELLED notices here.`}):Y.map(e=>{let t=G[e.patron.contact];return(0,x.jsxs)(`div`,{className:`lhf-noticerow`,children:[(0,x.jsx)(`span`,{className:`lhf-chip`,"data-tone":V[e.kind],children:B[e.kind]}),(0,x.jsxs)(`div`,{className:`lhf-noticetext`,children:[(0,x.jsxs)(`span`,{className:`lhf-title`,title:e.item.title,children:[e.patron.name,` · `,e.item.title]}),(0,x.jsx)(`span`,{className:`lhf-sub`,children:e.line})]}),(0,x.jsxs)(`span`,{title:`Delivery: ${t.label}`,children:[(0,x.jsx)(i,{icon:t.icon,size:`sm`,color:`secondary`}),(0,x.jsxs)(`span`,{className:`lhf-vh`,children:[`Delivery: `,t.label]})]})]},e.key)}),(0,x.jsx)(`div`,{className:`lhf-sectionhead`,style:{position:`static`},children:(0,x.jsx)(`span`,{className:`lhf-overline`,children:`Sent batches`})}),s.map(e=>(0,x.jsxs)(`div`,{className:`lhf-sentrow`,children:[(0,x.jsx)(`span`,{className:`lhf-callno`,children:e.clock}),(0,x.jsx)(r,{type:`supporting`,color:`secondary`,maxLines:1,children:e.summary})]},e.id))]}),Se=(0,x.jsx)(`div`,{className:`lhf-pane`,children:(0,x.jsxs)(`div`,{className:`lhf-scroll`,children:[Q,(0,x.jsx)(oe,{}),$]})}),Ce=D===`exceptions`?(0,x.jsx)(`div`,{className:`lhf-pane`,children:(0,x.jsx)(`div`,{className:`lhf-scroll`,children:Q})}):D===`notices`?(0,x.jsx)(`div`,{className:`lhf-pane`,children:(0,x.jsx)(`div`,{className:`lhf-scroll`,children:$})}):Z;return(0,x.jsxs)(`div`,{className:`tpl-library-hold-fulfillment`,children:[(0,x.jsx)(`style`,{children:A}),(0,x.jsx)(ne,{height:`fill`,header:(0,x.jsx)(ie,{hasDivider:!0,children:(0,x.jsxs)(f,{gap:3,vAlign:`center`,children:[(0,x.jsx)(p,{size:`fill`,style:{minWidth:0},children:(0,x.jsxs)(f,{gap:2,vAlign:`center`,children:[(0,x.jsx)(le,{}),(0,x.jsx)(m,{level:1,maxLines:1,children:`Stacks — Hold pick run`}),!N&&(0,x.jsx)(r,{type:`supporting`,color:`secondary`,maxLines:1,children:`PR-2607-A · Maplewood Central · generated 07:45`})]})}),N&&(0,x.jsxs)(v,{label:`Console view`,value:D,onChange:e=>O(e),size:`sm`,style:{"--size-element-sm":`40px`},children:[(0,x.jsx)(y,{value:`run`,label:`Run`}),(0,x.jsx)(y,{value:`exceptions`,label:`Exc (${J.length})`}),(0,x.jsx)(y,{value:`notices`,label:`Notices (${Y.length})`})]})]})}),end:N?void 0:(0,x.jsx)(ae,{hasDivider:!0,width:F?300:336,padding:0,label:`Exceptions and notices`,children:Se}),content:(0,x.jsxs)(re,{padding:0,children:[(0,x.jsx)(`div`,{"aria-live":`polite`,className:`lhf-vh`,children:T}),N?Ce:Z]})})]})}export{K as default};