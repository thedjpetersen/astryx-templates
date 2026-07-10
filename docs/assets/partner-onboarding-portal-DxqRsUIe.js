var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Partnerly partner portal for
 *   Brightpath Systems integrating "Brightpath Sync" against Partnerly
 *   Connect API v2026-06. Eight conformance tests CT-01…CT-08 seeded as
 *   4 pass + 2 fail + 2 not-run (the toolbar chips derive 4/2/2 from the
 *   row set, never typed); six onboarding milestones seeded 3 done
 *   (Agreement 12 Jun, App registered 18 Jun, Webhook verified 30 Jun) +
 *   Sandbox conformance in progress + Production credentials gated +
 *   Launch review locked, so header readiness derives 3/6 = 50% at load.
 *   Console transcripts are scripted string arrays per test and outcome;
 *   run timestamps come from a fixed 6-entry RUN_STAMPS cycle indexed by
 *   the run counter. Suite "today" anchor: Thu 9 Jul 2026. No clock
 *   reads, no randomness, no timers, no network assets.
 * @output Partner Onboarding Portal — Partnerly, a partner engineer's
 *   working surface: a milestone stepper rail whose active step carries a
 *   live progress-arc glyph (green-test fraction), a sandbox test console
 *   with per-test Run buttons, scripted pass/fail transcripts appending
 *   to a role="log" console pane, and a credential vault whose
 *   production-key section is GATED on all eight conformance tests going
 *   green. The signature interaction: Run appends the test's transcript
 *   deterministically, flips its status glyph, re-derives the toolbar
 *   pass/fail chips and the stepper's progress arc; the two seeded
 *   failures (CT-04 webhook signature, CT-07 idempotency replay) each
 *   expose a documented remediation — applying the fix and re-running
 *   turns them green; at 8/8 the Sandbox-conformance milestone ticks, the
 *   vault gate unlocks, and issuing production credentials ticks the next
 *   milestone and rewrites the header readiness — every consequence
 *   flows from one state owner.
 * @position Page template; emitted by \`astryx template partner-onboarding-portal\`
 *
 * Frame: root 100dvh div (scope class tpl-partner-onboarding-portal) >
 *   Layout height="fill".
 *   header bar 48px (Partnerly mark + portal title + SANDBOX token |
 *   derived readiness stat + partner avatar)
 *   | view root (flex, height 100%, minHeight 0, overflow hidden)
 *     | milestone rail 280px (56px milestone rows, own scroll, footer
 *       32px support line)
 *     | main column (toolbar 40px: suite label + Run-all + derived
 *       pass/fail chips > test list: 40px rows with expandable 88px
 *       remediation drawer > console pane 240px, role=log, own scroll,
 *       32px console header)
 *     | vault panel 340px (32px section headers, 44px key rows, 32px
 *       gate-checklist rows, own scroll).
 * Container policy: app-shell archetype — rails, rows, a console pane,
 *   and panels; no Cards. The console is a muted token surface
 *   (--color-background-muted), never a hardcoded dark pane.
 * Color policy: token-pure chrome. ONE quarantined mint brand accent as
 *   two declared faces of one hue: BRAND (fills only —
 *   light-dark(#0C8F6C, #34D9A8); #0C8F6C on white = 4.1:1, #34D9A8 on
 *   #1E1E1E = 9.2:1, both ≥3:1 for non-text graphics) drives the
 *   Partnerly mark, milestone tick fills, the progress arc, and the
 *   expanded test row's 3px accent bar; BRAND_TEXT (light-dark(#047857,
 *   #6EE7C7); #047857 on white = 5.5:1, #6EE7C7 on #1E1E1E = 11.0:1) is
 *   the only brand-tinted text. Pass/fail ride the data-viz categorical
 *   vars with repo-standard light-dark fallbacks; every status pairs
 *   with a shape channel (check / cross / hollow dot / lock / arc),
 *   never color alone.
 * Density grid (verbatim, repeated everywhere): header bar 48px;
 *   milestone rail 280px (mid band 240px, narrow 200px); milestone rows
 *   56px; rail footer 32px; toolbar 40px; test rows 40px; remediation
 *   drawer 88px; console pane 240px with 32px header and 18px line
 *   height; vault 340px (mid 300px, narrow overlay 340px); vault key
 *   rows 44px; gate rows 32px; single gutter GUTTER = 12 (all padding
 *   and margins are 12 or 6); mono metadata 12px (console 11px); body
 *   13px; section labels 11px uppercase tracking 0.06em.
 * Responsive contract — CONTAINER width via useElementWidth(viewRootRef)
 *   ResizeObserver (the demo stage is ~1045–1075px inside a 1440px
 *   window, so viewport media queries would lie there; a viewport query
 *   covers only the first pre-observer frame):
 *   - W >= 1200: rail 280px, vault 340px, endpoint mono column shown.
 *   - 1000 <= W < 1200 (canonical demo band): rail 240px (sub-lines
 *     truncate), vault 300px, the test duration column drops. 240 + 300
 *     leaves a ≥460px main column at 1045px — nothing squeezes.
 *   - W < 1000: vault leaves the flex flow and becomes a 340px absolute
 *     overlay (right 0, shadow, toggled by the toolbar Vault button,
 *     auto-opens when the gate unlocks, X closes, Escape closes and
 *     restores focus to the Vault button); rail 200px and the endpoint
 *     column drops.
 *   - <= 720px CSS media query (the 390px embed iframe, where viewport
 *     queries DO fire): the rail collapses to 56px glyph-only rows
 *     (labels hidden), the console shrinks to 200px, and the overlay
 *     vault clamps to min(340px, 100vw).
 * Fixture policy: all mutations flow through ONE owner over {tests,
 *   console lines, credentials}. Milestone states, chips, arcs, gate
 *   satisfaction, and readiness are DERIVED every render from that
 *   state — nothing is stored twice. Run transcripts are scripted
 *   arrays; the only sequence is the run counter that picks the next
 *   frozen RUN_STAMPS entry.
 * Corner map: top-left Partnerly mark + portal title; top-right
 *   readiness stat + avatar; bottom-left rail footer support line;
 *   bottom-right the vault panel's gate region (locked panel, issue
 *   action, or issued key rows depending on gate state).
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from 'react';

import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  LockIcon,
  PlayIcon,
  ShieldCheckIcon,
  Trash2Icon,
  WrenchIcon,
  XIcon,
} from 'lucide-react';

import {HStack, Layout, LayoutContent, LayoutHeader, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark()
// pair. Data-viz categorical tokens are NOT injected by the demo, so each
// carries the repo-standard fallback.
// ---------------------------------------------------------------------------

// THE quarantined mint brand accent, two declared faces of one hue.
// BRAND is FILLS ONLY: #0C8F6C on white = 4.1:1, #34D9A8 on #1E1E1E = 9.2:1
// (both clear the 3:1 non-text graphics bar). Used by the Partnerly mark,
// milestone tick fills, the conformance progress arc, and the expanded test
// row's 3px accent bar.
const BRAND = 'light-dark(#0C8F6C, #34D9A8)';
// BRAND_TEXT is the only brand-tinted text: #047857 on white = 5.5:1,
// #6EE7C7 on #1E1E1E = 11.0:1 (both clear 4.5:1).
const BRAND_TEXT = 'light-dark(#047857, #6EE7C7)';
// Soft brand wash for the unlocked vault gate and pressed chips.
const BRAND_SOFT = 'light-dark(rgba(12, 143, 108, 0.12), rgba(52, 217, 168, 0.16))';

const PASS_GREEN = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
// Danger: #DC2626 on white = 4.5:1, #F87171 on #1E1E1E = 6.6:1.
const FAIL_RED = 'light-dark(#DC2626, #F87171)';
const FAIL_SOFT = 'light-dark(rgba(220, 38, 38, 0.08), rgba(248, 113, 113, 0.14))';
// Warning: #B45309 on white = 4.6:1, #FBBF24 on #1E1E1E = 9.9:1.
const WARN = 'var(--color-data-categorical-orange, light-dark(#B45309, #FBBF24))';

// Density grid law: ALL padding/margins on this page are GUTTER or GUTTER/2.
const GUTTER = 12;
const MONO = 'var(--font-family-code, ui-monospace, monospace)';

// Scope class — every selector in TEMPLATE_CSS is prefixed with this.
const SCOPE = 'tpl-partner-onboarding-portal';

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — the entire stylesheet, injected once via <style>. Every
// selector is scoped under .tpl-partner-onboarding-portal. Transitions
// animate color/opacity only and collapse under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = \`
.\${SCOPE} {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.\${SCOPE} button {
  font-family: inherit;
}
.\${SCOPE} .pop-fade {
  transition: background-color 160ms ease, opacity 160ms ease, border-color 160ms ease, color 160ms ease;
}
.\${SCOPE} .pop-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.\${SCOPE} .pop-test-row:focus-visible,
.\${SCOPE} .pop-milestone-row:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}
@media (prefers-reduced-motion: reduce) {
  .\${SCOPE} .pop-fade { transition: none; }
}

/* ---- header bar 48px ---------------------------------------------------- */
.\${SCOPE} .pop-header-bar {
  display: flex;
  align-items: center;
  gap: \${GUTTER}px;
  height: 48px;
  padding: 0 \${GUTTER}px;
}
.\${SCOPE} .pop-mono {
  font-family: \${MONO};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.\${SCOPE} .pop-section-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.\${SCOPE} .pop-header-stat {
  font-family: \${MONO};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* ---- view root ------------------------------------------------------------ */
.\${SCOPE} .pop-view-root {
  display: flex;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  position: relative;
}
.\${SCOPE} .pop-main-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* ---- milestone rail: 56px rows + 32px footer ------------------------------ */
.\${SCOPE} .pop-rail {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-right: var(--border-width) solid var(--color-border);
  box-sizing: border-box;
}
.\${SCOPE} .pop-rail-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.\${SCOPE} .pop-milestone-row {
  display: flex;
  align-items: center;
  gap: \${GUTTER / 2}px;
  width: 100%;
  min-height: 56px;
  padding: 0 \${GUTTER}px;
  border-bottom: var(--border-width) solid var(--color-border);
  box-sizing: border-box;
  text-align: left;
}
.\${SCOPE} .pop-milestone-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.\${SCOPE} .pop-milestone-label {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .pop-milestone-sub {
  font-family: \${MONO};
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .pop-rail-footer {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 \${GUTTER}px;
  border-top: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
  box-sizing: border-box;
  overflow: hidden;
}

/* ---- toolbar 40px ----------------------------------------------------------- */
.\${SCOPE} .pop-toolbar {
  display: flex;
  align-items: center;
  gap: \${GUTTER / 2}px;
  height: 40px;
  padding: 0 \${GUTTER}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
  overflow: hidden;
}
.\${SCOPE} .pop-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background);
  font-size: 11px;
  font-family: \${MONO};
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  white-space: nowrap;
  flex-shrink: 0;
}

/* ---- test list: 40px rows + 88px remediation drawer ------------------------- */
.\${SCOPE} .pop-test-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.\${SCOPE} .pop-test-row {
  appearance: none;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  gap: \${GUTTER / 2}px;
  width: 100%;
  height: 40px;
  padding: 0 \${GUTTER}px 0 0;
  cursor: pointer;
  text-align: left;
  color: var(--color-text-primary);
  border-bottom: var(--border-width) solid var(--color-border);
  box-sizing: border-box;
}
.\${SCOPE} .pop-test-row[aria-expanded='true'] {
  background-color: var(--color-background-muted);
}
.\${SCOPE} .pop-test-accent {
  width: 3px;
  align-self: stretch;
  flex-shrink: 0;
  margin-right: \${GUTTER - 3}px;
}
.\${SCOPE} .pop-test-name {
  font-size: 13px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .pop-endpoint {
  font-family: \${MONO};
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .pop-drawer {
  display: flex;
  align-items: flex-start;
  gap: \${GUTTER}px;
  min-height: 88px;
  padding: \${GUTTER}px \${GUTTER}px \${GUTTER}px \${GUTTER * 2}px;
  border-bottom: var(--border-width) solid var(--color-border);
  background-color: var(--color-background-muted);
  box-sizing: border-box;
}

/* ---- console pane 240px, 32px header, 18px lines ----------------------------- */
.\${SCOPE} .pop-console {
  flex-shrink: 0;
  height: 240px;
  display: flex;
  flex-direction: column;
  border-top: var(--border-width) solid var(--color-border);
  box-sizing: border-box;
}
.\${SCOPE} .pop-console-head {
  display: flex;
  align-items: center;
  gap: \${GUTTER / 2}px;
  height: 32px;
  padding: 0 \${GUTTER}px;
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
  box-sizing: border-box;
}
.\${SCOPE} .pop-console-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: \${GUTTER / 2}px \${GUTTER}px;
  background-color: var(--color-background-muted);
}
.\${SCOPE} .pop-console-line {
  display: flex;
  gap: \${GUTTER / 2}px;
  font-family: \${MONO};
  font-size: 11px;
  line-height: 18px;
  font-variant-numeric: tabular-nums;
  white-space: pre-wrap;
  word-break: break-word;
}
.\${SCOPE} .pop-console-stamp {
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

/* ---- vault panel -------------------------------------------------------------- */
.\${SCOPE} .pop-vault {
  flex: none;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-left: var(--border-width) solid var(--color-border);
  background-color: var(--color-background);
  box-sizing: border-box;
}
.\${SCOPE} .pop-vault-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 340px;
  z-index: 5;
  box-shadow: var(--shadow-overlay, 0 8px 24px rgba(0, 0, 0, 0.18));
}
.\${SCOPE} .pop-vault-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: \${GUTTER}px;
}
.\${SCOPE} .pop-vault-section-head {
  display: flex;
  align-items: center;
  gap: \${GUTTER / 2}px;
  height: 32px;
}
.\${SCOPE} .pop-key-row {
  display: flex;
  align-items: center;
  gap: \${GUTTER / 2}px;
  min-height: 44px;
  padding: 0 \${GUTTER / 2}px;
  box-sizing: border-box;
}
.\${SCOPE} .pop-key-value {
  font-family: \${MONO};
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .pop-gate-row {
  display: flex;
  align-items: center;
  gap: \${GUTTER / 2}px;
  height: 32px;
  padding: 0 \${GUTTER / 2}px;
  box-sizing: border-box;
}
.\${SCOPE} .pop-gate-locked {
  display: flex;
  flex-direction: column;
  gap: \${GUTTER / 2}px;
  padding: \${GUTTER}px;
  border: var(--border-width) dashed var(--color-border);
  border-radius: var(--radius-container, 8px);
  color: var(--color-text-secondary);
}
.\${SCOPE} .pop-gate-open {
  display: flex;
  flex-direction: column;
  gap: \${GUTTER / 2}px;
  padding: \${GUTTER}px;
  border: var(--border-width) solid \${BRAND_TEXT};
  border-radius: var(--radius-container, 8px);
  background-color: \${BRAND_SOFT};
}
.\${SCOPE} .pop-visually-hidden {
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
  .\${SCOPE} .pop-rail { width: 56px !important; }
  .\${SCOPE} .pop-milestone-copy { display: none; }
  .\${SCOPE} .pop-rail-footer { display: none; }
  .\${SCOPE} .pop-milestone-row { justify-content: center; padding: 0; }
  .\${SCOPE} .pop-console { height: 200px; }
  .\${SCOPE} .pop-endpoint { display: none; }
  .\${SCOPE} .pop-vault-overlay { width: min(340px, 100vw); }
  .\${SCOPE} .pop-header-stat { display: none; }
}
\`;

// ---------------------------------------------------------------------------
// DOMAIN TYPES + META TABLES — vocabulary before components.
// ---------------------------------------------------------------------------

type TestStatus = 'pass' | 'fail' | 'not-run';
type LineKind = 'header' | 'cmd' | 'info' | 'pass' | 'fail';

interface TranscriptLine {
  at: string; // fixed relative offset, e.g. '+142ms' — scripted, never timed
  kind: Exclude<LineKind, 'header'>;
  text: string;
}

interface Remediation {
  title: string;
  detail: string;
  actionLabel: string;
  logText: string; // console line appended when the fix is applied
}

interface ConformanceTest {
  id: string;
  name: string;
  method: string;
  path: string;
  msDisplay: string; // dual field with the scripted transcript durations
  status: TestStatus;
  lastRun?: string; // fixture string; omit-when-undefined for not-run rows
  needsFix: boolean; // scripted first-run failure
  fixApplied: boolean;
  remediation?: Remediation;
  passLines: TranscriptLine[];
  failLines?: TranscriptLine[]; // only the two seeded failures carry these
}

interface ConsoleLine {
  id: number;
  stamp: string; // '' for transcript lines (they carry their own offsets)
  kind: LineKind;
  text: string;
}

interface CredentialKey {
  id: string;
  label: string;
  value: string; // full fixture literal
  masked: string; // display twin
  secret: boolean; // secret keys start hidden behind the reveal toggle
}

// ---------------------------------------------------------------------------
// FIXTURES — one deterministic world: Brightpath Systems ("Brightpath
// Sync", app_id bp_sync_7741) onboarding onto Partnerly Connect API
// v2026-06. Signed-in user: partner engineer Noor Siddiqui. Today anchor:
// Thu 9 Jul 2026. Seeded results: CT-01/02/03/05 pass, CT-04/07 fail,
// CT-06/08 not-run (chips derive 4/2/2 from these rows).
// ---------------------------------------------------------------------------

const PEOPLE = {
  noor: {name: 'Noor Siddiqui', role: 'Partner engineer', initials: 'NS'},
  elliot: {name: 'Elliot Vance', role: 'Partnerly partner manager'},
};

const APP = {
  partner: 'Brightpath Systems',
  appName: 'Brightpath Sync',
  appId: 'bp_sync_7741',
  apiVersion: 'v2026-06',
};

// Frozen run clock — the run counter indexes into this cycle; there is no
// timer and no Date behind any stamp on this page.
const RUN_STAMPS = ['15:04:12', '15:06:47', '15:09:03', '15:11:28', '15:14:55', '15:18:31'];
const TODAY_LABEL = '9 Jul 2026';
const SEED_RUN_LABEL = '8 Jul 2026 · 17:41';

// Retired vs rotated webhook secrets — CT-04's failure narrative. The
// retired value appearing in the fail transcript is the debugging clue.
const RETIRED_WEBHOOK_SECRET = 'whsec_bp_s4nd_0617';
const ROTATED_WEBHOOK_SECRET = 'whsec_bp_s4nd_0630';

const INITIAL_TESTS: ConformanceTest[] = [
  {
    id: 'CT-01',
    name: 'OAuth client-credentials grant',
    method: 'POST',
    path: '/v2026-06/oauth/token',
    msDisplay: '96 ms',
    status: 'pass',
    lastRun: SEED_RUN_LABEL,
    needsFix: false,
    fixApplied: false,
    passLines: [
      {at: '+0ms', kind: 'cmd', text: '▶ CT-01 OAuth client-credentials grant'},
      {at: '+12ms', kind: 'info', text: 'POST /v2026-06/oauth/token → 200 (84 ms)'},
      {at: '+96ms', kind: 'info', text: 'assert token_type=Bearer ✓ · expires_in=3600 ✓ · scope=orders:write refunds:write ✓'},
      {at: '+96ms', kind: 'pass', text: '✔ CT-01 passed (96 ms)'},
    ],
  },
  {
    id: 'CT-02',
    name: 'Account link handshake',
    method: 'POST',
    path: '/v2026-06/partner/links',
    msDisplay: '143 ms',
    status: 'pass',
    lastRun: SEED_RUN_LABEL,
    needsFix: false,
    fixApplied: false,
    passLines: [
      {at: '+0ms', kind: 'cmd', text: '▶ CT-02 Account link handshake'},
      {at: '+21ms', kind: 'info', text: \`POST /v2026-06/partner/links {app_id: \${APP.appId}} → 201 plink_4Krm2N\`},
      {at: '+108ms', kind: 'info', text: 'GET /v2026-06/partner/links/plink_4Krm2N → status=active ✓'},
      {at: '+143ms', kind: 'pass', text: '✔ CT-02 passed (143 ms)'},
    ],
  },
  {
    id: 'CT-03',
    name: 'Order create + capture',
    method: 'POST',
    path: '/v2026-06/orders',
    msDisplay: '182 ms',
    status: 'pass',
    lastRun: SEED_RUN_LABEL,
    needsFix: false,
    fixApplied: false,
    passLines: [
      {at: '+0ms', kind: 'cmd', text: '▶ CT-03 Order create + capture'},
      {at: '+15ms', kind: 'info', text: 'POST /v2026-06/orders amount=2450 currency=USD → 201 ord_8XcW3p'},
      {at: '+121ms', kind: 'info', text: 'POST /v2026-06/orders/ord_8XcW3p/capture → 200 captured=2450 ✓'},
      {at: '+182ms', kind: 'pass', text: '✔ CT-03 passed (182 ms)'},
    ],
  },
  {
    // Seeded failure #1 — fix = rotate the connector's webhook secret.
    id: 'CT-04',
    name: 'Webhook signature round-trip',
    method: 'POST',
    path: 'https://sandbox.brightpath.dev/hooks/partnerly',
    msDisplay: '210 ms',
    status: 'fail',
    lastRun: SEED_RUN_LABEL,
    needsFix: true,
    fixApplied: false,
    remediation: {
      title: 'Connector signs with the retired webhook secret',
      detail:
        \`Your endpoint verifies X-Partnerly-Signature with \${RETIRED_WEBHOOK_SECRET}, but the sandbox secret was rotated on 30 Jun. Update PARTNERLY_WEBHOOK_SECRET to the current value from the vault, then re-run.\`,
      actionLabel: 'Apply rotated secret',
      logText: \`⚙ config: PARTNERLY_WEBHOOK_SECRET updated \${RETIRED_WEBHOOK_SECRET} → \${ROTATED_WEBHOOK_SECRET}\`,
    },
    failLines: [
      {at: '+0ms', kind: 'cmd', text: '▶ CT-04 Webhook signature round-trip'},
      {at: '+18ms', kind: 'info', text: 'emit partner.order.updated → https://sandbox.brightpath.dev/hooks/partnerly'},
      {at: '+142ms', kind: 'info', text: 'endpoint replied 200 in 124 ms'},
      {at: '+188ms', kind: 'info', text: \`verify X-Partnerly-Signature v1=9f41c2… against \${ROTATED_WEBHOOK_SECRET}\`},
      {at: '+210ms', kind: 'fail', text: \`✘ signature mismatch — payload signed with retired \${RETIRED_WEBHOOK_SECRET} (rotated 30 Jun)\`},
      {at: '+210ms', kind: 'fail', text: '✘ CT-04 failed (210 ms) — see remediation in the test drawer'},
    ],
    passLines: [
      {at: '+0ms', kind: 'cmd', text: '▶ CT-04 Webhook signature round-trip'},
      {at: '+18ms', kind: 'info', text: 'emit partner.order.updated → https://sandbox.brightpath.dev/hooks/partnerly'},
      {at: '+139ms', kind: 'info', text: 'endpoint replied 200 in 121 ms'},
      {at: '+186ms', kind: 'info', text: 'verify X-Partnerly-Signature v1=6c0d88… ✓ · timestamp skew 41 ms ✓'},
      {at: '+204ms', kind: 'pass', text: '✔ CT-04 passed (204 ms)'},
    ],
  },
  {
    id: 'CT-05',
    name: 'Refund full + partial',
    method: 'POST',
    path: '/v2026-06/refunds',
    msDisplay: '164 ms',
    status: 'pass',
    lastRun: SEED_RUN_LABEL,
    needsFix: false,
    fixApplied: false,
    passLines: [
      {at: '+0ms', kind: 'cmd', text: '▶ CT-05 Refund full + partial'},
      {at: '+19ms', kind: 'info', text: 'POST /v2026-06/refunds order=ord_8XcW3p amount=2450 → 201 ref_2LqV8d ✓'},
      {at: '+98ms', kind: 'info', text: 'POST /v2026-06/refunds order=ord_5TnB1k amount=900 of 2100 → 201 partial ✓'},
      {at: '+164ms', kind: 'pass', text: '✔ CT-05 passed (164 ms)'},
    ],
  },
  {
    id: 'CT-06',
    name: 'Pagination cursor stability',
    method: 'GET',
    path: '/v2026-06/orders?limit=25',
    msDisplay: '88 ms',
    status: 'not-run',
    needsFix: false,
    fixApplied: false,
    passLines: [
      {at: '+0ms', kind: 'cmd', text: '▶ CT-06 Pagination cursor stability'},
      {at: '+11ms', kind: 'info', text: 'GET /v2026-06/orders?limit=25 → 200, 25 rows, cursor=eyJvZmZzZXQiOjI1fQ'},
      {at: '+54ms', kind: 'info', text: 'GET page 2 via cursor → 200, 25 rows, no overlap with page 1 ✓'},
      {at: '+88ms', kind: 'pass', text: '✔ CT-06 passed (88 ms)'},
    ],
  },
  {
    // Seeded failure #2 — fix = enable the connector's idempotency store.
    id: 'CT-07',
    name: 'Idempotency key replay',
    method: 'POST',
    path: '/v2026-06/orders',
    msDisplay: '121 ms',
    status: 'fail',
    lastRun: SEED_RUN_LABEL,
    needsFix: true,
    fixApplied: false,
    remediation: {
      title: 'Idempotency store disabled in the connector config',
      detail:
        'Replaying an Idempotency-Key must return the ORIGINAL object. Your connector has idempotency_store: off, so the replay created a second order. Enable the store (24 h retention) and re-run.',
      actionLabel: 'Enable idempotency store',
      logText: '⚙ config: idempotency_store off → on (retention 24 h)',
    },
    failLines: [
      {at: '+0ms', kind: 'cmd', text: '▶ CT-07 Idempotency key replay'},
      {at: '+9ms', kind: 'info', text: 'POST /v2026-06/orders Idempotency-Key: bp-7f2e-0709 → 201 ord_9Q9wKm'},
      {at: '+67ms', kind: 'info', text: 'replay same Idempotency-Key → 201 ord_9RaTx4'},
      {at: '+121ms', kind: 'fail', text: '✘ replay returned a NEW object (expected ord_9Q9wKm) — duplicate order created'},
      {at: '+121ms', kind: 'fail', text: '✘ CT-07 failed (121 ms) — see remediation in the test drawer'},
    ],
    passLines: [
      {at: '+0ms', kind: 'cmd', text: '▶ CT-07 Idempotency key replay'},
      {at: '+9ms', kind: 'info', text: 'POST /v2026-06/orders Idempotency-Key: bp-7f2e-0709 → 201 ord_9Q9wKm'},
      {at: '+61ms', kind: 'info', text: 'replay same Idempotency-Key → 200 ord_9Q9wKm (replayed=true) ✓'},
      {at: '+118ms', kind: 'pass', text: '✔ CT-07 passed (118 ms)'},
    ],
  },
  {
    id: 'CT-08',
    name: 'Error taxonomy mapping',
    method: 'POST',
    path: '/v2026-06/orders',
    msDisplay: '74 ms',
    status: 'not-run',
    needsFix: false,
    fixApplied: false,
    passLines: [
      {at: '+0ms', kind: 'cmd', text: '▶ CT-08 Error taxonomy mapping'},
      {at: '+8ms', kind: 'info', text: 'POST /v2026-06/orders amount=-5 → 422 error.code=amount_invalid ✓'},
      {at: '+41ms', kind: 'info', text: 'POST with expired token → 401 error.code=token_expired ✓ · retriable=false ✓'},
      {at: '+74ms', kind: 'pass', text: '✔ CT-08 passed (74 ms)'},
    ],
  },
];

// Seeded console history — yesterday's run #0, summarized. Line ids < 100;
// live lines start at 100 via the nextLineId counter.
const INITIAL_CONSOLE: ConsoleLine[] = [
  {id: 1, stamp: '17:41:22', kind: 'header', text: \`── conformance run · \${SEED_RUN_LABEL} · 6 of 8 executed ──\`},
  {id: 2, stamp: '', kind: 'pass', text: '✔ CT-01 OAuth client-credentials grant (96 ms)'},
  {id: 3, stamp: '', kind: 'pass', text: '✔ CT-02 Account link handshake (143 ms)'},
  {id: 4, stamp: '', kind: 'pass', text: '✔ CT-03 Order create + capture (182 ms)'},
  {id: 5, stamp: '', kind: 'fail', text: '✘ CT-04 Webhook signature round-trip — signature mismatch'},
  {id: 6, stamp: '', kind: 'pass', text: '✔ CT-05 Refund full + partial (164 ms)'},
  {id: 7, stamp: '', kind: 'fail', text: '✘ CT-07 Idempotency key replay — duplicate object on replay'},
  {id: 8, stamp: '', kind: 'info', text: 'CT-06, CT-08 skipped (not yet run) · summary: 4 pass / 2 fail'},
];

// Sandbox credentials — always available. Secret values start masked
// behind the reveal toggle; the masked twin is a display field, not a
// recomputation.
const SANDBOX_KEYS: CredentialKey[] = [
  {
    id: 'sb-pk',
    label: 'Publishable key',
    value: 'pk_test_bp_51PLYQd8m2XKa93VtqEw7Hn4',
    masked: 'pk_test_bp_51PL••••••••••••••••7Hn4',
    secret: false,
  },
  {
    id: 'sb-sk',
    label: 'Secret key',
    value: 'sk_test_bp_9mA2Rf6TzXqLd07wJcVe5Bp1',
    masked: 'sk_test_bp_9mA2••••••••••••••••5Bp1',
    secret: true,
  },
  {
    id: 'sb-wh',
    label: 'Webhook secret',
    value: ROTATED_WEBHOOK_SECRET,
    masked: 'whsec_bp_s4nd_••••',
    secret: true,
  },
];

// Production credentials — EXIST only after the vault gate opens and the
// issue action runs; until then the vault renders the locked gate panel.
const PRODUCTION_KEYS: CredentialKey[] = [
  {
    id: 'pr-pk',
    label: 'Publishable key',
    value: 'pk_live_bp_72MZR4nJc6TQd18SueYw3Bk9',
    masked: 'pk_live_bp_72MZ••••••••••••••••3Bk9',
    secret: false,
  },
  {
    id: 'pr-sk',
    label: 'Secret key',
    value: 'sk_live_bp_4Xw8Qn1KvRt6Ma20pZgY7Jd5',
    masked: 'sk_live_bp_4Xw8••••••••••••••••7Jd5',
    secret: true,
  },
  {
    id: 'pr-wh',
    label: 'Webhook secret',
    value: 'whsec_bp_l1ve_0709',
    masked: 'whsec_bp_l1ve_••••',
    secret: true,
  },
];

// ---------------------------------------------------------------------------
// MILESTONES — the six-step ladder. States are DERIVED from {tests,
// prodIssued} every render; nothing about milestone progress is stored.
// ---------------------------------------------------------------------------

type MilestoneState = 'done' | 'active' | 'gated' | 'locked';

interface MilestoneView {
  id: string;
  index: number;
  label: string;
  sub: string;
  state: MilestoneState;
  arcFraction?: number; // only the active conformance step carries an arc
}

function deriveMilestones(greenCount: number, gateOpen: boolean, prodIssued: boolean): MilestoneView[] {
  const conformanceDone = greenCount === 8;
  return [
    {id: 'agreement', index: 1, label: 'Agreement signed', sub: 'Countersigned 12 Jun 2026', state: 'done'},
    {id: 'app', index: 2, label: 'App registered', sub: \`app_id \${APP.appId} · 18 Jun 2026\`, state: 'done'},
    {id: 'webhook', index: 3, label: 'Webhook endpoint verified', sub: 'Echo challenge OK · 30 Jun 2026', state: 'done'},
    {
      id: 'conformance',
      index: 4,
      label: 'Sandbox conformance',
      sub: \`\${greenCount}/8 tests green\`,
      state: conformanceDone ? 'done' : 'active',
      arcFraction: conformanceDone ? undefined : greenCount / 8,
    },
    {
      id: 'credentials',
      index: 5,
      label: 'Production credentials',
      sub: prodIssued ? \`Issued \${TODAY_LABEL}\` : gateOpen ? 'Gate open — ready to issue' : 'Gated on conformance 8/8',
      state: prodIssued ? 'done' : gateOpen ? 'active' : 'gated',
    },
    {
      id: 'launch',
      index: 6,
      label: 'Launch review',
      sub: prodIssued ? \`Book with \${PEOPLE.elliot.name}\` : 'Opens after credentials',
      state: prodIssued ? 'active' : 'locked',
    },
  ];
}

// ---------------------------------------------------------------------------
// HOOK — container-width ResizeObserver (repo pattern; see responsive
// contract in the header comment). Width 0 = first pre-observer frame; the
// caller falls back to a viewport query for that frame only.
// ---------------------------------------------------------------------------

function useElementWidth(ref: RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) {
        setWidth(rect.width);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

// ---------------------------------------------------------------------------
// PARTNERLY MARK — 24px inline SVG: two interlocked rounded links (the
// partnership handshake), drawn in the quarantined BRAND fill.
// ---------------------------------------------------------------------------

function PartnerlyMark() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden style={{flexShrink: 0}}>
      <rect x={3} y={7} width={12} height={10} rx={5} fill="none" stroke={BRAND} strokeWidth={2.4} />
      <rect x={9} y={7} width={12} height={10} rx={5} fill="none" stroke={BRAND} strokeWidth={2.4} opacity={0.55} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// TestStatusGlyph — 16px; SHAPE carries the status (never color alone):
// pass = solid disc + check, fail = solid disc + cross, not-run = dashed
// hollow circle.
// ---------------------------------------------------------------------------

function TestStatusGlyph({status}: {status: TestStatus}) {
  if (status === 'not-run') {
    return (
      <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden style={{flexShrink: 0}}>
        <circle
          cx={8}
          cy={8}
          r={5.5}
          fill="none"
          stroke="var(--color-text-secondary)"
          strokeWidth={1.5}
          strokeDasharray="2.5 2.5"
        />
      </svg>
    );
  }
  const bg = status === 'pass' ? PASS_GREEN : FAIL_RED;
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden style={{flexShrink: 0}}>
      <circle cx={8} cy={8} r={6.5} fill={bg} />
      {status === 'pass' ? (
        <path d="M5 8.2 7.2 10.4 11 5.8" fill="none" stroke="var(--color-background)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M5.6 5.6 10.4 10.4 M10.4 5.6 5.6 10.4" fill="none" stroke="var(--color-background)" strokeWidth={1.8} strokeLinecap="round" />
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// MilestoneGlyph — 24px stepper glyph with a LIVE progress arc on the
// active conformance step (the in-progress pie-wedge idea from the bar
// apps): done = BRAND disc + check; active = track ring + BRAND arc for
// arcFraction (a Badge can't say "6/8 through conformance"); gated =
// hollow ring + lock; locked = dashed ring.
// ---------------------------------------------------------------------------

function arcPath(cx: number, cy: number, r: number, fraction: number): string {
  const clamped = Math.max(0, Math.min(fraction, 0.9999));
  const angle = -Math.PI / 2 + clamped * Math.PI * 2;
  const x = cx + r * Math.cos(angle);
  const y = cy + r * Math.sin(angle);
  const largeArc = clamped > 0.5 ? 1 : 0;
  return \`M \${cx} \${cy - r} A \${r} \${r} 0 \${largeArc} 1 \${x.toFixed(3)} \${y.toFixed(3)}\`;
}

function MilestoneGlyph({state, arcFraction}: {state: MilestoneState; arcFraction?: number}) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden style={{flexShrink: 0}}>
      {state === 'done' ? (
        <>
          <circle cx={12} cy={12} r={9} fill={BRAND} />
          <path d="M8 12.4 10.8 15.2 16 8.8" fill="none" stroke="var(--color-background)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
      {state === 'active' ? (
        <>
          <circle cx={12} cy={12} r={9} fill="none" stroke="var(--color-border)" strokeWidth={2.5} />
          {arcFraction != null && arcFraction > 0 ? (
            <path d={arcPath(12, 12, 9, arcFraction)} fill="none" stroke={BRAND} strokeWidth={2.5} strokeLinecap="round" />
          ) : null}
          <circle cx={12} cy={12} r={3} fill={BRAND} />
        </>
      ) : null}
      {state === 'gated' ? (
        <>
          <circle cx={12} cy={12} r={9} fill="none" stroke="var(--color-text-secondary)" strokeWidth={1.5} />
          <path
            d="M9.5 12v-1.8a2.5 2.5 0 0 1 5 0V12 M8.8 12h6.4v4.2H8.8z"
            fill="none"
            stroke="var(--color-text-secondary)"
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
        </>
      ) : null}
      {state === 'locked' ? (
        <circle
          cx={12}
          cy={12}
          r={9}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={2}
          strokeDasharray="3.5 3.5"
        />
      ) : null}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// MILESTONE RAIL — 56px rows. Actionable steps (conformance, credentials)
// render as real <button>s that deep-link into the surface that advances
// them; completed and locked steps are static rows.
// ---------------------------------------------------------------------------

interface MilestoneRailProps {
  milestones: MilestoneView[];
  railW: number;
  onOpenConformance: () => void;
  onOpenVault: () => void;
}

function MilestoneRail({milestones, railW, onOpenConformance, onOpenVault}: MilestoneRailProps) {
  return (
    <nav className="pop-rail" style={{width: railW}} aria-label="Onboarding milestones">
      <div className="pop-rail-scroll">
        {milestones.map(milestone => {
          const onPress =
            milestone.id === 'conformance'
              ? onOpenConformance
              : milestone.id === 'credentials'
                ? onOpenVault
                : null;
          const body = (
            <>
              <MilestoneGlyph state={milestone.state} arcFraction={milestone.arcFraction} />
              <span className="pop-milestone-copy">
                <span
                  className="pop-milestone-label"
                  style={milestone.state === 'locked' ? {color: 'var(--color-text-secondary)'} : undefined}>
                  {milestone.index}. {milestone.label}
                </span>
                <span className="pop-milestone-sub">{milestone.sub}</span>
              </span>
              {onPress != null ? (
                <span style={{marginLeft: 'auto', display: 'inline-flex', flexShrink: 0}}>
                  <Icon icon={ChevronRightIcon} size="xsm" color="secondary" />
                </span>
              ) : null}
            </>
          );
          if (onPress != null) {
            return (
              <button
                key={milestone.id}
                type="button"
                className="pop-milestone-row pop-fade"
                style={{appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer', color: 'inherit', borderBottom: 'var(--border-width) solid var(--color-border)'}}
                aria-label={\`\${milestone.label}: \${milestone.sub}\`}
                onClick={onPress}>
                {body}
              </button>
            );
          }
          return (
            <div key={milestone.id} className="pop-milestone-row">
              {body}
            </div>
          );
        })}
      </div>
      {/* Bottom-left corner owner: the rail footer support line. */}
      <div className="pop-rail-footer">
        <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
          Partner manager · {PEOPLE.elliot.name}
        </Text>
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// TEST LIST — 40px rows. The expand affordance and the Run button are
// SIBLING interactive elements (never nested buttons): the left button
// owns select/expand, the right DS Button owns Run. The remediation
// drawer renders under a failing row once expanded.
// ---------------------------------------------------------------------------

interface TestGeometry {
  showEndpoint: boolean;
  showDuration: boolean;
}

interface TestRowProps {
  test: ConformanceTest;
  expanded: boolean;
  geometry: TestGeometry;
  onToggleExpand: () => void;
  onRun: () => void;
  onApplyFix: () => void;
  rowRef: (el: HTMLButtonElement | null) => void;
}

const STATUS_LABEL: Record<TestStatus, string> = {
  pass: 'passing',
  fail: 'failing',
  'not-run': 'not yet run',
};

function TestRow({test, expanded, geometry, onToggleExpand, onRun, onApplyFix, rowRef}: TestRowProps) {
  const willPass = !test.needsFix || test.fixApplied;
  return (
    <>
      <div style={{display: 'flex', alignItems: 'stretch'}}>
        <button
          type="button"
          ref={rowRef}
          className="pop-test-row pop-fade"
          style={{flex: 1, minWidth: 0, borderBottom: expanded ? 'none' : undefined}}
          aria-expanded={expanded}
          aria-label={\`\${test.id} \${test.name}, \${STATUS_LABEL[test.status]}\${test.lastRun != null ? \`, last run \${test.lastRun}\` : ''}. \${expanded ? 'Collapse' : 'Expand'} details.\`}
          onClick={onToggleExpand}>
          {/* BRAND fill: the expanded row's 3px accent bar. */}
          <span
            className="pop-test-accent"
            style={{backgroundColor: expanded ? BRAND : 'transparent'}}
            aria-hidden
          />
          <Icon icon={expanded ? ChevronDownIcon : ChevronRightIcon} size="xsm" color="secondary" />
          <TestStatusGlyph status={test.status} />
          <span className="pop-mono" style={{color: 'var(--color-text-secondary)', width: 44, flexShrink: 0}}>
            {test.id}
          </span>
          <span className="pop-test-name">{test.name}</span>
          {geometry.showEndpoint ? (
            <span className="pop-endpoint" style={{marginLeft: 'auto', maxWidth: 220}}>
              {test.method} {test.path}
            </span>
          ) : (
            <span style={{marginLeft: 'auto'}} aria-hidden />
          )}
          {geometry.showDuration ? (
            <span className="pop-mono" style={{color: 'var(--color-text-secondary)', width: 52, textAlign: 'right', flexShrink: 0}}>
              {test.status === 'not-run' ? '—' : test.msDisplay}
            </span>
          ) : null}
        </button>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: \`0 \${GUTTER}px 0 \${GUTTER / 2}px\`,
            borderBottom: expanded ? 'none' : 'var(--border-width) solid var(--color-border)',
            flexShrink: 0,
          }}>
          <Button
            label={\`Run \${test.id}\`}
            variant="secondary"
            size="sm"
            icon={<Icon icon={PlayIcon} size="sm" />}
            isIconOnly
            onClick={onRun}
          />
        </span>
      </div>
      {expanded ? (
        <div className="pop-drawer">
          <span style={{color: willPass ? BRAND_TEXT : WARN, display: 'inline-flex', flexShrink: 0, paddingTop: 2}}>
            <Icon icon={willPass ? ShieldCheckIcon : WrenchIcon} size="sm" color="inherit" />
          </span>
          <StackItem size="fill">
            <VStack gap={1}>
              <HStack gap={2} vAlign="center">
                <span className="pop-mono">{test.method}</span>
                <span className="pop-mono" style={{color: 'var(--color-text-secondary)'}}>
                  {test.path}
                </span>
                <span className="pop-mono" style={{color: 'var(--color-text-secondary)'}}>
                  · {test.msDisplay}
                </span>
                {test.lastRun != null ? (
                  <span className="pop-mono" style={{color: 'var(--color-text-secondary)'}}>
                    · last run {test.lastRun}
                  </span>
                ) : (
                  <span className="pop-mono" style={{color: 'var(--color-text-secondary)'}}>
                    · never run
                  </span>
                )}
              </HStack>
              {test.remediation != null && !test.fixApplied ? (
                <>
                  <Text type="label" size="sm">
                    {test.remediation.title}
                  </Text>
                  <Text type="supporting" size="xsm" color="secondary">
                    {test.remediation.detail}
                  </Text>
                  <HStack gap={2} vAlign="center">
                    <Button
                      label={test.remediation.actionLabel}
                      variant="primary"
                      size="sm"
                      icon={<Icon icon={WrenchIcon} size="sm" />}
                      onClick={onApplyFix}
                    />
                    <Text type="supporting" size="xsm" color="secondary">
                      Logs to the console, then re-run {test.id}.
                    </Text>
                  </HStack>
                </>
              ) : test.remediation != null && test.fixApplied && test.status !== 'pass' ? (
                <HStack gap={2} vAlign="center">
                  <span style={{flexShrink: 0}}>
                    <Token size="sm" color="orange" label="Fix applied" />
                  </span>
                  <Text type="supporting" size="xsm" color="secondary">
                    Configuration updated — re-run {test.id} to verify.
                  </Text>
                </HStack>
              ) : (
                <Text type="supporting" size="xsm" color="secondary">
                  {test.status === 'pass'
                    ? 'All assertions green in the last run — transcript is in the console.'
                    : 'Ready to run — the scripted assertions and transcript will append to the console.'}
                </Text>
              )}
            </VStack>
          </StackItem>
        </div>
      ) : null}
    </>
  );
}

// ---------------------------------------------------------------------------
// CONSOLE PANE — 240px, role="log". New transcripts append at the bottom;
// an effect pins the scroller to the latest line. The clear action is a
// real mutation (line counter keeps increasing — ids never reset).
// ---------------------------------------------------------------------------

const LINE_COLOR: Record<LineKind, string | undefined> = {
  header: 'var(--color-text-secondary)',
  cmd: undefined, // inherits --color-text-primary
  info: 'var(--color-text-secondary)',
  pass: PASS_GREEN,
  fail: FAIL_RED,
};

function ConsolePane({lines, onClear}: {lines: ConsoleLine[]; onClear: () => void}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // Pin to the newest line whenever the log grows (scroll position is
  // presentation state, so an effect — not a data mutation — owns it).
  useEffect(() => {
    const el = scrollRef.current;
    if (el != null) {
      el.scrollTop = el.scrollHeight;
    }
  }, [lines.length]);
  return (
    <section className="pop-console" aria-label="Sandbox console">
      <div className="pop-console-head">
        <span className="pop-section-label">Sandbox console</span>
        <span style={{flex: 1}} aria-hidden />
        {/* Bottom-right corner owner: the console line count. */}
        <span className="pop-mono" style={{color: 'var(--color-text-secondary)'}}>
          {lines.length} lines
        </span>
        <Button
          label="Clear console"
          variant="ghost"
          size="sm"
          isIconOnly
          icon={<Icon icon={Trash2Icon} size="sm" />}
          onClick={onClear}
        />
      </div>
      <div ref={scrollRef} className="pop-console-scroll" role="log" aria-live="polite">
        {lines.length === 0 ? (
          <span className="pop-console-line" style={{color: 'var(--color-text-secondary)'}}>
            Console cleared — run a conformance test to append its transcript.
          </span>
        ) : (
          lines.map(line => (
            <span
              key={line.id}
              className="pop-console-line"
              style={{
                color: LINE_COLOR[line.kind],
                fontWeight: line.kind === 'cmd' || line.kind === 'header' ? 600 : undefined,
                marginTop: line.kind === 'header' ? 6 : undefined,
              }}>
              {line.stamp !== '' ? <span className="pop-console-stamp">{line.stamp}</span> : null}
              <span>{line.text}</span>
            </span>
          ))
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// CREDENTIAL VAULT — sandbox keys always available (secrets behind reveal
// toggles); the production section is a GATE: a derived checklist over the
// live test set, a locked panel until 8/8 green, an issue action once the
// gate opens, and the issued key rows after. Copy state persists until the
// next copy (no timers on this page).
// ---------------------------------------------------------------------------

interface KeyRowProps {
  credential: CredentialKey;
  revealed: boolean;
  copied: boolean;
  onToggleReveal: () => void;
  onCopy: () => void;
}

function KeyRow({credential, revealed, copied, onToggleReveal, onCopy}: KeyRowProps) {
  const shown = credential.secret && !revealed ? credential.masked : credential.value;
  return (
    <div className="pop-key-row">
      <span style={{color: 'var(--color-text-secondary)', display: 'inline-flex', flexShrink: 0}}>
        <Icon icon={KeyRoundIcon} size="sm" color="inherit" />
      </span>
      <StackItem size="fill">
        <VStack gap={0}>
          <Text type="supporting" size="xsm" color="secondary">
            {credential.label}
          </Text>
          <span className="pop-key-value">{shown}</span>
        </VStack>
      </StackItem>
      {credential.secret ? (
        <Button
          label={revealed ? \`Hide \${credential.label}\` : \`Reveal \${credential.label}\`}
          variant="ghost"
          size="sm"
          isIconOnly
          icon={<Icon icon={revealed ? EyeOffIcon : EyeIcon} size="sm" />}
          onClick={onToggleReveal}
        />
      ) : null}
      <Button
        label={copied ? \`\${credential.label} copied\` : \`Copy \${credential.label}\`}
        variant="ghost"
        size="sm"
        isIconOnly
        icon={<Icon icon={copied ? CheckIcon : CopyIcon} size="sm" />}
        onClick={onCopy}
      />
    </div>
  );
}

interface GateItem {
  id: string;
  label: string;
  satisfied: boolean;
  sub?: string;
}

interface VaultPanelProps {
  isOverlay: boolean;
  width: number;
  gateItems: GateItem[];
  gateOpen: boolean;
  prodIssued: boolean;
  greenCount: number;
  revealedKeys: ReadonlySet<string>;
  copiedKeyId: string | null;
  onToggleReveal: (id: string) => void;
  onCopy: (credential: CredentialKey) => void;
  onIssue: () => void;
  onClose: () => void;
}

function VaultPanel({
  isOverlay,
  width,
  gateItems,
  gateOpen,
  prodIssued,
  greenCount,
  revealedKeys,
  copiedKeyId,
  onToggleReveal,
  onCopy,
  onIssue,
  onClose,
}: VaultPanelProps) {
  return (
    <aside
      className={\`pop-vault\${isOverlay ? ' pop-vault-overlay' : ''}\`}
      style={isOverlay ? undefined : {width}}
      aria-label="Credential vault">
      <div className="pop-vault-scroll">
        <VStack gap={2}>
          <div className="pop-vault-section-head">
            <Heading level={2}>Credential vault</Heading>
            <span style={{flex: 1}} aria-hidden />
            {isOverlay ? (
              <Button
                label="Close vault"
                isIconOnly
                variant="ghost"
                size="sm"
                icon={<Icon icon={XIcon} size="sm" />}
                onClick={onClose}
              />
            ) : null}
          </div>
          <div className="pop-vault-section-head">
            <span className="pop-section-label">Sandbox</span>
            <span style={{flexShrink: 0}}>
              <Token size="sm" color="orange" label="Test mode" />
            </span>
          </div>
          <VStack gap={0}>
            {SANDBOX_KEYS.map(credential => (
              <KeyRow
                key={credential.id}
                credential={credential}
                revealed={revealedKeys.has(credential.id)}
                copied={copiedKeyId === credential.id}
                onToggleReveal={() => onToggleReveal(credential.id)}
                onCopy={() => onCopy(credential)}
              />
            ))}
          </VStack>
          <Text type="supporting" size="xsm" color="secondary">
            Webhook secret rotated 30 Jun 2026 — connectors signing with the retired value will fail CT-04.
          </Text>
          <Divider />
          <div className="pop-vault-section-head">
            <span className="pop-section-label">Production gate</span>
            <span style={{flexShrink: 0}}>
              {prodIssued ? (
                <Token size="sm" color="green" label="Issued" />
              ) : gateOpen ? (
                <Token size="sm" color="green" label="Open" />
              ) : (
                <Token size="sm" color="default" label="Locked" />
              )}
            </span>
          </div>
          {/* Derived gate checklist — each row re-checks the live test set. */}
          <VStack gap={0} role="list" aria-label="Production gate checklist">
            {gateItems.map(item => (
              <div key={item.id} className="pop-gate-row" role="listitem">
                {item.satisfied ? (
                  <span style={{color: PASS_GREEN, display: 'inline-flex', flexShrink: 0}}>
                    <Icon icon={CheckIcon} size="xsm" color="inherit" />
                  </span>
                ) : (
                  <span style={{color: WARN, display: 'inline-flex', flexShrink: 0}}>
                    <Icon icon={CircleAlertIcon} size="xsm" color="inherit" />
                  </span>
                )}
                <Text type="body" size="sm" color={item.satisfied ? 'primary' : 'secondary'}>
                  {item.label}
                </Text>
                {item.sub != null ? (
                  <span className="pop-mono" style={{marginLeft: 'auto', color: 'var(--color-text-secondary)'}}>
                    {item.sub}
                  </span>
                ) : null}
              </div>
            ))}
          </VStack>
          {prodIssued ? (
            <>
              <VStack gap={0}>
                {PRODUCTION_KEYS.map(credential => (
                  <KeyRow
                    key={credential.id}
                    credential={credential}
                    revealed={revealedKeys.has(credential.id)}
                    copied={copiedKeyId === credential.id}
                    onToggleReveal={() => onToggleReveal(credential.id)}
                    onCopy={() => onCopy(credential)}
                  />
                ))}
              </VStack>
              <Text type="supporting" size="xsm" color="secondary">
                Issued {TODAY_LABEL} by {PEOPLE.noor.name}. Live keys inherit the sandbox webhook route until launch review.
              </Text>
            </>
          ) : gateOpen ? (
            <div className="pop-gate-open">
              <HStack gap={2} vAlign="center">
                <span style={{color: BRAND_TEXT, display: 'inline-flex'}}>
                  <Icon icon={ShieldCheckIcon} size="sm" color="inherit" />
                </span>
                <Text type="label" size="sm">
                  All checks green — gate open
                </Text>
              </HStack>
              <Text type="supporting" size="xsm" color="secondary">
                Issuing creates the live key pair and ticks milestone 5. This is logged to the console.
              </Text>
              <HStack gap={2}>
                <Button
                  label="Issue production credentials"
                  variant="primary"
                  size="sm"
                  icon={<Icon icon={KeyRoundIcon} size="sm" />}
                  onClick={onIssue}
                />
              </HStack>
            </div>
          ) : (
            <div className="pop-gate-locked">
              <HStack gap={2} vAlign="center">
                <Icon icon={LockIcon} size="sm" color="secondary" />
                <Text type="label" size="sm" color="secondary">
                  Production keys locked
                </Text>
              </HStack>
              <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                Unlocks when all 8 conformance tests are green — currently {greenCount}/8. Fix and re-run the failing tests in the sandbox console.
              </Text>
            </div>
          )}
        </VStack>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// PAGE — THE single state owner over {tests, console, credentials}. A test
// run is ONE state update whose consequences surface in the console log,
// the status glyph, the toolbar chips, the stepper's progress arc, the
// vault gate checklist, and the header readiness simultaneously.
// ---------------------------------------------------------------------------

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
  );
}

/** Scripted outcome for a run of \`test\` given its current fix state. */
function runOutcome(test: ConformanceTest): {status: TestStatus; lines: TranscriptLine[]} {
  const passes = !test.needsFix || test.fixApplied;
  if (passes) {
    return {status: 'pass', lines: test.passLines};
  }
  return {status: 'fail', lines: test.failLines ?? test.passLines};
}

export default function PartnerOnboardingPortalTemplate() {
  // Responsive bands measured on the VIEW ROOT container, not the viewport
  // (see responsive contract). Width 0 = first pre-observer frame; viewport
  // queries cover only that frame.
  const viewRootRef = useRef<HTMLDivElement | null>(null);
  const viewWidth = useElementWidth(viewRootRef);
  const isViewportMid = useMediaQuery('(max-width: 1279px)');
  const isViewportNarrow = useMediaQuery('(max-width: 1023px)');
  const isMid = viewWidth > 0 ? viewWidth < 1200 : isViewportMid;
  const isNarrow = viewWidth > 0 ? viewWidth < 1000 : isViewportNarrow;

  const railW = isNarrow ? 200 : isMid ? 240 : 280;
  const vaultW = isMid ? 300 : 340;
  const testGeometry: TestGeometry = {
    showEndpoint: !isNarrow,
    showDuration: !isMid && !isNarrow,
  };

  // ---- THE single state owner ---------------------------------------------
  const [tests, setTests] = useState<ConformanceTest[]>(INITIAL_TESTS);
  const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>(INITIAL_CONSOLE);
  const [nextLineId, setNextLineId] = useState(100);
  const [runCounter, setRunCounter] = useState(0);
  const [expandedTestId, setExpandedTestId] = useState<string | null>('CT-04');
  const [prodIssued, setProdIssued] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<ReadonlySet<string>>(() => new Set());
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [vaultOverlayOpen, setVaultOverlayOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const rowRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const vaultButtonRef = useRef<HTMLButtonElement | null>(null);

  // ---- Derived (never stored twice) ----------------------------------------
  const greenCount = tests.filter(t => t.status === 'pass').length;
  const failCount = tests.filter(t => t.status === 'fail').length;
  const notRunCount = tests.filter(t => t.status === 'not-run').length;
  const gateItems: GateItem[] = [
    {id: 'conformance', label: 'All conformance tests green', satisfied: greenCount === 8, sub: \`\${greenCount}/8\`},
    {id: 'webhook', label: 'Webhook endpoint verified', satisfied: true, sub: '30 Jun'},
    {id: 'mtls', label: 'Mutual TLS client cert uploaded', satisfied: true, sub: '18 Jun'},
  ];
  const gateOpen = gateItems.every(item => item.satisfied);
  const milestones = deriveMilestones(greenCount, gateOpen, prodIssued);
  const doneMilestones = milestones.filter(m => m.state === 'done').length;
  const readinessLine = \`Readiness \${Math.round((doneMilestones / milestones.length) * 100)}% · \${doneMilestones}/\${milestones.length} milestones\`;

  // ---- Signature interaction: run tests, transcripts append ---------------
  const runTests = useCallback(
    (ids: string[]) => {
      const stamp = RUN_STAMPS[runCounter % RUN_STAMPS.length];
      const runNumber = runCounter + 1;
      setRunCounter(n => n + 1);
      const targets = tests.filter(t => ids.includes(t.id));
      if (targets.length === 0) return;
      const newLines: ConsoleLine[] = [];
      let lineId = nextLineId;
      newLines.push({
        id: lineId++,
        stamp,
        kind: 'header',
        text: \`── run #\${runNumber} · \${TODAY_LABEL} \${stamp} · \${targets.length === 1 ? targets[0].id : \`\${targets.length} tests\`} ──\`,
      });
      const outcomes = new Map<string, TestStatus>();
      for (const test of targets) {
        const outcome = runOutcome(test);
        outcomes.set(test.id, outcome.status);
        for (const line of outcome.lines) {
          newLines.push({id: lineId++, stamp: line.at, kind: line.kind, text: line.text});
        }
      }
      setNextLineId(lineId);
      setConsoleLines(prev => [...prev, ...newLines]);
      setTests(prev =>
        prev.map(t =>
          outcomes.has(t.id)
            ? {...t, status: outcomes.get(t.id) as TestStatus, lastRun: \`\${TODAY_LABEL} · \${stamp.slice(0, 5)}\`}
            : t,
        ),
      );
      // Post-run derivations for the announcement + gate unlock.
      const nextGreen = tests.filter(t =>
        outcomes.has(t.id) ? outcomes.get(t.id) === 'pass' : t.status === 'pass',
      ).length;
      const ranSummary = targets
        .map(t => \`\${t.id} \${outcomes.get(t.id) === 'pass' ? 'passed' : 'failed'}\`)
        .join(', ');
      if (nextGreen === 8 && greenCount < 8) {
        setAnnouncement(
          \`\${ranSummary}. All 8 conformance tests green — sandbox conformance milestone complete, production credential gate open.\`,
        );
        // The contract's auto-open: surface the unlocked vault on the
        // narrow band, where it lives off-canvas.
        setVaultOverlayOpen(true);
      } else {
        setAnnouncement(\`\${ranSummary}. \${nextGreen} of 8 tests green.\`);
      }
    },
    [tests, runCounter, nextLineId, greenCount],
  );

  const applyFix = useCallback(
    (id: string) => {
      const test = tests.find(t => t.id === id);
      if (test?.remediation == null || test.fixApplied) return;
      setTests(prev => prev.map(t => (t.id === id ? {...t, fixApplied: true} : t)));
      setConsoleLines(prev => [
        ...prev,
        {id: nextLineId, stamp: '', kind: 'info', text: test.remediation!.logText},
      ]);
      setNextLineId(n => n + 1);
      setAnnouncement(\`\${test.remediation.title} — fix applied. Re-run \${id} to verify.\`);
    },
    [tests, nextLineId],
  );

  const issueCredentials = useCallback(() => {
    if (!gateOpen || prodIssued) return;
    setProdIssued(true);
    setConsoleLines(prev => [
      ...prev,
      {
        id: nextLineId,
        stamp: '',
        kind: 'pass',
        text: \`✔ credentials: production key pair issued (…\${PRODUCTION_KEYS[0].value.slice(-4)}) · milestone 5 complete\`,
      },
    ]);
    setNextLineId(n => n + 1);
    setAnnouncement(
      'Production credentials issued. Milestone 5 complete — launch review is now available.',
    );
  }, [gateOpen, prodIssued, nextLineId]);

  const clearConsole = useCallback(() => {
    setConsoleLines([]);
    setAnnouncement('Console cleared.');
  }, []);

  // ---- Vault interactions ---------------------------------------------------
  const toggleReveal = useCallback((id: string) => {
    setRevealedKeys(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const copyKey = useCallback((credential: CredentialKey) => {
    // Clipboard write is best-effort (sandboxed frames may refuse); the
    // copied state + announcement never depend on it. State persists until
    // the next copy — no timers on this page.
    try {
      void navigator.clipboard?.writeText(credential.value).catch(() => undefined);
    } catch {
      // ignored — UI state below is the source of truth for the demo
    }
    setCopiedKeyId(credential.id);
    setAnnouncement(\`\${credential.label} copied.\`);
  }, []);

  const openVault = useCallback(() => {
    setVaultOverlayOpen(true);
  }, []);

  const closeVault = useCallback(() => {
    setVaultOverlayOpen(false);
    vaultButtonRef.current?.focus();
  }, []);

  const focusConformance = useCallback(() => {
    // Milestone 4 deep-link: focus the first non-green test row.
    const target = tests.find(t => t.status !== 'pass') ?? tests[0];
    setExpandedTestId(target.id);
    rowRefs.current.get(target.id)?.focus();
  }, [tests]);

  // Escape layering: vault overlay first, then the expanded drawer.
  const handleRootKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape' || isTypingTarget(event.target)) return;
    if (isNarrow && vaultOverlayOpen) {
      closeVault();
    } else if (expandedTestId != null) {
      setExpandedTestId(null);
    }
  };

  const registerRowRef = (id: string) => (el: HTMLButtonElement | null) => {
    const map = rowRefs.current;
    if (el == null) map.delete(id);
    else map.set(id, el);
  };

  const vaultVisible = !isNarrow || vaultOverlayOpen;

  return (
    <div className={SCOPE} onKeyDown={handleRootKeyDown}>
      <style>{TEMPLATE_CSS}</style>
      <span aria-live="polite" role="status" className="pop-visually-hidden">
        {announcement}
      </span>
      <Layout
        height="fill"
        header={
          <LayoutHeader padding={0} hasDivider>
            <div className="pop-header-bar">
              {/* Top-left corner: Partnerly mark + portal title. */}
              <PartnerlyMark />
              <Text type="label" size="sm">
                Partnerly
              </Text>
              <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
                Partner Portal · {APP.partner} · {APP.appName} · {APP.apiVersion}
              </Text>
              <span style={{flexShrink: 0}}>
                <Token size="sm" color="orange" label="SANDBOX" />
              </span>
              <span style={{flex: 1}} aria-hidden />
              {/* Top-right corner: derived readiness stat + avatar. */}
              <span className="pop-header-stat">{readinessLine}</span>
              <Avatar name={PEOPLE.noor.name} size="small" />
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div ref={viewRootRef} className="pop-view-root">
              <MilestoneRail
                milestones={milestones}
                railW={railW}
                onOpenConformance={focusConformance}
                onOpenVault={isNarrow ? openVault : () => vaultButtonRef.current?.focus()}
              />
              <div className="pop-main-col">
                <div className="pop-toolbar">
                  <span className="pop-section-label">Conformance suite</span>
                  <Button
                    label="Run all"
                    variant="primary"
                    size="sm"
                    icon={<Icon icon={PlayIcon} size="sm" />}
                    onClick={() => runTests(tests.map(t => t.id))}
                  />
                  {/* Derived tallies — recomputed from the row set. */}
                  <span className="pop-chip" style={{color: PASS_GREEN, borderColor: PASS_GREEN}}>
                    <Icon icon={CheckIcon} size="xsm" color="inherit" />
                    {\`\${greenCount} pass\`}
                  </span>
                  <span
                    className="pop-chip"
                    style={failCount > 0 ? {color: FAIL_RED, borderColor: FAIL_RED, backgroundColor: FAIL_SOFT} : undefined}>
                    <Icon icon={XIcon} size="xsm" color="inherit" />
                    {\`\${failCount} fail\`}
                  </span>
                  <span className="pop-chip" style={{color: 'var(--color-text-secondary)'}}>
                    {\`\${notRunCount} not run\`}
                  </span>
                  <span style={{flex: 1}} aria-hidden />
                  {isNarrow ? (
                    <button
                      type="button"
                      ref={vaultButtonRef}
                      className="pop-chip pop-focusable pop-fade"
                      style={{cursor: 'pointer', ...(gateOpen && !prodIssued ? {borderColor: BRAND_TEXT, backgroundColor: BRAND_SOFT} : {})}}
                      aria-expanded={vaultOverlayOpen}
                      onClick={openVault}>
                      <Icon icon={KeyRoundIcon} size="xsm" color="inherit" />
                      Vault
                    </button>
                  ) : null}
                </div>
                <div className="pop-test-scroll">
                  {tests.map(test => (
                    <TestRow
                      key={test.id}
                      test={test}
                      expanded={expandedTestId === test.id}
                      geometry={testGeometry}
                      onToggleExpand={() =>
                        setExpandedTestId(prev => (prev === test.id ? null : test.id))
                      }
                      onRun={() => runTests([test.id])}
                      onApplyFix={() => applyFix(test.id)}
                      rowRef={registerRowRef(test.id)}
                    />
                  ))}
                </div>
                <ConsolePane lines={consoleLines} onClear={clearConsole} />
              </div>
              {vaultVisible ? (
                <VaultPanel
                  isOverlay={isNarrow}
                  width={vaultW}
                  gateItems={gateItems}
                  gateOpen={gateOpen}
                  prodIssued={prodIssued}
                  greenCount={greenCount}
                  revealedKeys={revealedKeys}
                  copiedKeyId={copiedKeyId}
                  onToggleReveal={toggleReveal}
                  onCopy={copyKey}
                  onIssue={issueCredentials}
                  onClose={closeVault}
                />
              ) : null}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};