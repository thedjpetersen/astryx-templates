# Batch 4 brief — Full landing & marketing pages

You are authoring ONE page template for /Users/thedeej/dj-code/astryx-templates.

FIRST read `/Users/thedeej/dj-code/astryx-templates/reviews/navi-brief.md`
sections BEFORE its "TEMPLATE SPECS" heading — file/doc conventions,
naming hygiene, responsive rules (useElementWidth ResizeObserver — the
inline demo stage is ~1045px wide, viewport media queries only fire in
the separate 390px phone iframe), and the quality bar apply verbatim
(ignore that file's spec list). THEN skim
`/Users/thedeej/dj-code/astryx-templates/templates/saas-landing-page.tsx`
as the closest exemplar for full-page marketing chrome. Deliver exactly
`templates/<id>.tsx` + `templates/<id>.doc.ts`, run `pnpm typecheck`
(zero errors in YOUR files; other authors run concurrently), and return
`<id> | <Human Name> | Marketing | <one-line description ≤110 chars>`.

## Landing-page contract

- These are COMPLETE vertical-specific marketing pages, not section
  showcases (the catalog already has marketing-* section galleries —
  heroes, bentos, CTAs, social proof, footers, navbars, FAQ, team,
  blog — and a generic saas-landing-page and pricing-plans page; do
  not rebuild those as your centerpiece, but DO compose their
  vocabulary into your page).
- Shape: long-scroll page inside `Layout height="fill"` (LayoutContent
  padding 0, inner sections own their insets) with a sticky top navbar
  (brand mark + 3-5 anchor links + CTA; anchors smooth-scroll to real
  section ids) and a proper footer. 1040-1160px max content column;
  full-bleed tinted bands alternate with plain bands.
- One invented brand per page with a distinct accent personality: ONE
  quarantined accent literal is allowed as `light-dark(#hex, #hex)`
  with a contrast-math comment; everything else token-pure. Art =
  hue-gradient tiles, schematic SVG compositions, monograms — no
  network images, no real logos (invent customer/partner names).
- Responsive: measure the page with useElementWidth; ≥3 breakpoints of
  real reflow (e.g. 3-col → 2-col → single column; nav links collapse
  into a menu button + dropdown at compact widths). Must look right at
  390px in the phone artboard.
- Motion: tasteful scroll-reveals (IntersectionObserver, fire once —
  rise+fade 12px), number count-ups on first view, and ONE signature
  interactive hero moment per spec. All gated by prefers-reduced-motion
  (matchMedia; reveals render visible, counters render final).
- Interactivity: tab switchers, calculators, toggles, and accordions
  must actually work; primary CTAs may open a working email-capture
  field or fire a confirmation state inline (no dead buttons in the
  hero). Forms validate (email regex) with inline error text.
- Deterministic fixtures only. No Date.now()/Math.random(); countdown
  timers start from a fixture value and tick with setInterval.
- Density: real copy — headline + subhead + 3-6 sections of concrete,
  vertical-appropriate content with specific invented numbers, names,
  quotes. No lorem ipsum.

---

# TEMPLATE SPECS (author ONLY yours)

## 1. devtool-terminal-landing — "Dev Tool Landing"
Dark-first landing for a CLI build tool ("Quarry"). Hero: headline +
a terminal window whose install command types itself in a loop
(`curl -fsSL quarry.dev/install | sh` → output lines appear staged,
then a success check; replay button; reduced-motion renders the final
frame). Nav CTA `Star on GitHub ★ 24.1k`. Sections: 3-up "why" cards;
a before/after build-time comparison with animated benchmark bars
(4 rows, count-up seconds, competitor names invented); a code-diff
feature pane with tabs (Config / Cache / CI) swapping annotated
CodeBlocks; a logos strip of 6 invented companies (monogram tiles);
quickstart 3-step row with copyable commands; footer with version
badge `v3.2 · MIT`.

## 2. ai-assistant-landing — "AI Assistant Landing"
Landing for an AI work assistant ("Murmur"). Hero: split layout —
copy left, right a framed chat demo that AUTOPLAYS a scripted
3-turn conversation (typing dots → user ask → assistant reply with a
tool-call chip → artifact card), then loops via replay button;
pause on hover; reduced-motion shows the completed transcript.
Sections: capability grid (6 cards: Draft, Research, Automate,
Summarize, Code, Schedule — each with a tiny schematic); a
"works where you work" integration row (8 invented app tiles); a
security strip (SOC 2 badge chips + "your data is never trained on"
copy); prompt-examples carousel (scroll-snap chips that fill a demo
input); tiered CTA band (Try free / Book demo). Footer.

## 3. mobile-app-landing — "Mobile App Landing"
Landing for a habit-tracker app ("Stride"). Hero: copy + store badge
buttons (drawn as bordered pseudo-badges, no real marks) beside a
CSS phone frame (390-ish rounded device) whose screen cycles 3 app
screens with a crossfade every 3s (dots below; click to jump;
reduced-motion static first screen). Sections: alternating feature
rows (3) each pairing copy with a phone-frame vignette; a ratings
wall (4.9 average, 5 review cards with star rows); a stats band
(count-ups: 2.4M habits tracked · 180 countries · 4.9★); FAQ
accordion (5 items); a QR-style download card (schematic QR grid)
+ email-me-a-link capture with validation. Footer.

## 4. open-source-project-landing — "Open Source Project Page"
Project page for an OSS state library ("tessera"). Hero: package
name + one-line pitch + install command with package-manager tabs
(npm / pnpm / yarn / bun swap the CodeBlock) + copy button; star /
fork / license stat chips. Sections: a 30-second example (side-by-
side Before with boilerplate vs After CodeBlocks); release timeline
(4 versions with semver Badges and highlight bullets); contributors
avatar wall (24 monogram tiles, count caption); sponsors band with
3 tiers of monogram tiles; star-history sparkline (SVG polyline,
fixed points, draw-on when revealed); "used by" strip; docs/community
link cards (Docs / Discord / GitHub). Footer with license note.

## 5. conference-event-landing — "Conference Landing"
Landing for a 2-day dev conference ("Interface 2026 · Oct 8-9 ·
Lisbon"). Hero: dated headline over a gradient composition + a
countdown (starts from fixture `86d 04:12:33`, ticks) + Get tickets
CTA scrolling to tiers. Sections: speaker grid (8 gradient-monogram
cards w/ role + talk title, hover lift); agenda with Day 1 / Day 2
TabList swapping a time-table (track columns collapse to accordion
when compact); ticket tiers (Early bird struck-through as sold out,
Regular highlighted, Team) with per-tier feature lists and seats-left
meters; venue section with a schematic map SVG + travel notes;
sponsor logo wall by tier; past-edition stats band (count-ups) and a
photo-tile collage; newsletter capture. Footer.

## 6. waitlist-coming-soon — "Waitlist Coming Soon"
Single-purpose pre-launch page ("Foldline — spatial notes"). Hero:
oversized wordmark with a slow ambient gradient drift (reduced-motion
static), one-line teaser, and an email capture that on valid submit
flips to a position card — `You're #1,247 in line` (count-up) with a
personal referral link + Copy button and a `Skip ahead` explainer:
each referral moves you up 50 spots — a small interactive demo
stepper (+1 referral → position animates down, progress bar toward
"next 100" fills). Sections: 3 teaser feature blurbs behind
frosted "revealing soon" cards (one unblurred); a launch progress
meter (Design ✓ · Private beta ● · Public launch ○) with dated
milestones; social links row; minimal footer. Keep it under 3
viewport-heights — this archetype is about restraint.

## 7. changelog-whats-new — "Public Changelog"
Product changelog page ("Ledgerline Changelog"). Header band: title,
subscribe-by-email capture, RSS chip, and tag filter ToggleButtons
(New / Improved / Fixed / Security) that live-filter entries.
Entries (8, grouped by month with sticky month labels): version chip
(`v2.14`), date, tag chips per item, bullet lists, and for two
entries a media block (schematic screenshot composition with a
caption; one has a small before/after slider — a draggable divider
over two tinted panes, with a button fallback). One entry marked
`Breaking` with a warning-tinted callout and migration snippet
CodeBlock. Load-more reveals 4 older entries with a stagger. Footer
links to docs/status.

## 8. careers-jobs-landing — "Careers Page"
Careers page for a 60-person startup ("Halyard"). Hero: mission
headline + a photo-tile collage (5 gradient tiles with candid
captions) + `12 open roles` CTA scrolling to the list. Sections:
values grid (4 cards with short honest copy); benefits band (6
compact rows with icons: equity, health, remote-first, retreat,
learning budget, 20 days min PTO); the roles list — department
filter chips (Engineering 6 / Design 2 / GTM 4) + location Selector
live-filtering 12 role rows (title, team, location chips, comp range
on two rows, `New` badge), each expanding inline to a summary +
Apply button that reveals an application mini-form (name/email/link,
validation, success state); hiring-process timeline (4 steps with
durations); a "life here" quote carousel from 3 employees. Footer.

## 9. security-trust-center — "Trust Center"
Security/trust page for a data platform ("Vantage Trust Center").
Hero: short assurance headline + live-status row (StatusDot
operational + `99.98% uptime (90d)` + link chip). Sections:
compliance badge wall (SOC 2 Type II / ISO 27001 / GDPR / HIPAA
cards with schematic seals, `Report available` chips — clicking
opens a request-access email capture); security practices accordion
grouped by Category (Encryption, Access, Infrastructure, People —
12 total rows with concrete copy); a data-flow schematic SVG
(client → edge → vault) with hover tooltips on nodes; subprocessor
Table (6 rows: vendor, purpose, region, DPA chip); responsible
disclosure card with a `security.txt` CodeBlock and PGP fingerprint
mono row; changelog strip of last 3 security updates. Footer.

## 10. api-platform-landing — "API Platform Landing"
Landing for a shipping-rates API ("Parcelrate"). Hero: split —
copy + a live-looking request/response pane: language TabList
(curl / Node / Python) swaps the request CodeBlock; a `Send request`
button "runs" it (staged 600ms spinner then a JSON response
CodeBlock slides in with a `212ms` latency chip; deterministic).
Sections: endpoint showcase Table (5 endpoints: method Badges,
path mono, purpose); pricing calculator — a requests/month Slider
(10k-10M log steps) driving a tabular price readout and per-tier
highlighting; SDK grid (6 language tiles with install commands on
hover/tap); uptime + latency stats band (count-ups, p99 chip); a
docs-quality teaser (3-pane screenshot composition); dev
testimonial cards (2). Footer with status + docs links.

## 11. product-comparison-landing — "Comparison Landing"
"Switch from" page: invented brand "Northbeam" vs incumbent
"Gridware". Hero: `Northbeam vs Gridware` headline + one-line
verdict + `Migrate in a weekend` CTA. Centerpiece: a sticky-header
comparison Table (12 dimension rows × 2 columns: check/cross/
partial chips with footnote markers; sticky first column when
compact) with a category filter row (Pricing / Speed / Support /
Integrations) that scroll-jumps and highlights row groups. Sections:
3 "why teams switch" cards with concrete stats; a migration path
timeline (Export → Map → Import → Verify with per-step durations
and a copyable CLI command); a switcher testimonial with before/
after metric chips; honest "when Gridware is a better fit" callout
(2 bullets — credibility beat); pricing-at-a-glance band; FAQ (4).
Footnotes section anchoring the table markers. Footer.

## 12. newsletter-creator-landing — "Newsletter Landing"
Landing for a weekly design-engineering newsletter ("Overshoot").
Hero: issue-count eyebrow (`Issue #142 · every Tuesday`), headline,
subscribe capture (validates; success flips to a `Check your inbox`
card with a resend link), social-proof caption `18,204 readers ·
54% open rate` with reader avatar cluster. Sections: a sample-issue
reader — a framed scrollable excerpt of one issue (3 sections with
real-feeling copy + a code tip + a links list) with a `Read issue
#141` swap toggle; an archive grid of 6 issue cards (number, title,
teaser, read-time) with a topic filter chip row; testimonial wall
(masonry-ish CSS columns, 6 short quotes); a sponsor slot card
(`Reach 18k design engineers` + rate + availability chips); about-
the-author row. Minimal footer.

## 13. fintech-card-landing — "Fintech Card Landing"
Landing for a team spend card ("Keel"). Hero: copy + an interactive
gradient card render (rounded SVG/CSS card with mono number
`5412 •••• 3742`) that TILTS toward the pointer (transform
rotateX/rotateY from pointer position, spring back on leave;
reduced-motion static) with a flip-on-click back face showing
controls. Sections: three control features (freeze, per-merchant
limits, receipts auto-match) as rows with schematic vignettes; a
fee comparison table (Keel vs 2 invented banks: 6 fee rows, zero
rows tinted success); real-time spend feed mock (5 transactions
sliding in on reveal with category chips); an interest/rewards
calculator (monthly-spend Slider → cashback count-up); compliance
footnote band (FDIC-partner + invented member disclosures in honest
small print); CTA + footer.

## 14. course-cohort-landing — "Cohort Course Landing"
Landing for a 6-week systems-design course ("Load-Bearing").
Hero: promise headline, next-cohort card (`Cohort 9 · starts Sep 14
· 18 of 40 seats left` with a seats meter), price + `Save $200
until Aug 1` chip. Sections: outcomes row (4 concrete "you will
ship" bullets with check draw-ons on reveal); curriculum accordion
by week (6 weeks: topics, live-session times, project deliverable;
week 1 expanded by default); instructor bio split with credibility
chips (invented company history + student count); student project
gallery (4 gradient composition cards with captions); testimonial
trio with role chips; cohort comparison (Self-paced vs Cohort
columns); pricing card with payment-plan toggle (1× $1,200 / 3×
$420 — totals update honestly) + guarantee note; FAQ (5); apply
CTA band with email capture. Footer.

## 15. nonprofit-donation-landing — "Nonprofit Campaign Landing"
Campaign page for a river-restoration nonprofit ("Clearwater
Fund — Restore the Alder"). Hero: mission headline over a schematic
river illustration, campaign progress card (`$68,450 of $100,000` —
bar fills on reveal + count-up, `912 donors · 23 days left`).
Centerpiece: donation widget — One-time/Monthly SegmentedControl,
amount chips ($25/$50/$100/$250/custom NumberInput) where each
amount live-updates an impact line (`$50 = 12 native saplings`),
and a Donate button firing an inline thank-you state with a
share-link row. Sections: impact stories carousel (3 cards with
gradient art + quotes); where-money-goes breakdown (SVG donut +
legend rows summing to 100%, honest overhead slice); milestones
timeline (3 completed w/ dates, 2 upcoming); transparency band
(annual-report link cards, EIN mono row); corporate-match callout
with employer search-ish input (static suggest list). Footer.

## 16. agency-portfolio-landing — "Agency Portfolio Landing"
Studio site for a product design agency ("Fathom & Co"). Hero:
oversized statement headline with a marquee strip of client
monograms (slow CSS scroll loop, pauses on hover, reduced-motion
static). Sections: case-study grid (4 large cards: gradient
composition, client, one-line outcome with a count-up metric chip;
hover reveals a `View case` overlay; clicking expands an inline
case panel with challenge/approach/results rows and a metric trio);
capabilities two-column list (Strategy / Design / Engineering with
sub-bullets); process band (4 steps with week ranges); a selected-
press row (3 invented publication quotes); team strip (6 monogram
avatars + roles); an availability card (`Booking Q4 · 2 slots`) with
a project-inquiry mini-form (budget Selector, timeline Selector,
email — validates, success state). Footer.

## 17. hardware-product-landing — "Hardware Product Landing"
Landing for a smart desk sensor ("Perch"). Hero: copy + a schematic
product render (layered SVG) with an EXPLODED-VIEW toggle — layers
translate apart with labels and hairline leader lines (spring,
reduced-motion instant). Sections: spec highlights grid (6 tiles:
battery 14 mo, range, sensors, materials — tabular values);
in-the-box row (4 outlined item glyphs); a configurator card —
color swatches (3, swaps render tint) and pack size (1/3/5 with
per-unit price math updating a tabular total + savings chip) +
preorder CTA with email capture; shipping timeline (Reserve today →
Ships Nov → 30-day trial) with dated steps; compatibility strip
(invented ecosystem tiles); review quotes (3, star rows); FAQ (4)
including an honest battery footnote. Footer with warranty note.

## 18. marketplace-duo-landing — "Two-Sided Marketplace Landing"
Landing for a gear-rental marketplace ("Loanshark → rename: Lendly"
— pick a neutral invented name like "Kitloop"). Signature: an
audience toggle in the hero (`I want to rent` / `I want to earn`)
that swaps headline, CTA, hero vignette, AND retints the accent
sections down the page (two quarantined accent literals, both with
contrast math — sanctioned exception for this spec). Renter path
sections: category tile grid (8), how-it-works 3 steps, trust/
insurance band, review wall. Earner path sections (swapped in):
earnings calculator (item-type Selector + weekly-availability
Slider → monthly estimate count-up with honest range), payout/
protection cards, top-earner stories. Shared: stats band, city
availability chips (12), FAQ tabs per audience, footer. The toggle
is sticky in the navbar after scroll.

## 19. book-author-landing — "Book Launch Landing"
Launch page for a technical book ("The Interface Layer" by an
invented author). Hero: 3D-ish book cover (CSS perspective card
with spine, slight idle sway, hover straightens; reduced-motion
flat), title/subtitle, `Read a sample` + retailer buttons row (4
bordered pseudo-retailer buttons). Sections: a sample-chapter
reader — framed prose excerpt with a page-progress bar and
next/prev page controls (3 fixture pages, page-turn slide);
what-you-will-learn grid (6 chips → expands to chapter outline
accordion, 12 chapters with page counts); praise wall (5 quote
cards with roles); author bio split with speaking/press chips;
formats card (Hardcover $39 / Ebook $24 / Bundle $49 highlighted,
launch-week bonus list); newsletter capture for a free chapter
(validates, success state); footer with ISBN mono row.

## 20. press-media-kit — "Press & Media Kit"
Press page for a scale-up ("Relay Robotics Press Kit"). Header:
one-paragraph boilerplate with a Copy button + `Download kit (.zip
24 MB)` pseudo-button + press contact card. Sections: fast-facts
grid (founded, HQ, headcount, funding, customers — tabular, each
with a copy-on-click affordance); logo assets grid (4 tiles:
light/dark/mono/glyph on checkered backgrounds with per-tile
Download chips) plus a usage dos/don'ts split (3 ✓ rows, 3 ✗ rows
with tinted mini-previews of misuse: stretched, recolored,
low-contrast); product screenshots row (3 schematic compositions
with resolution captions); leadership headshots row (3 monogram
tiles + name/title + download chips); brand color swatch row (5
swatches: name, hex mono, Copy with copied feedback); coverage
list (6 rows: invented outlet, headline, date, external-link
glyph); founding-story timeline (5 dated milestones). Footer.
