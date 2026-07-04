// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'TTRPG Encounter Tracker',
  description:
    "Game-master combat console for Torchward (quarantined #B3452E ember mark) running 'Session 14 — The Hollowmere Crypts', frozen at Round 3 with Korrin Blackbriar's turn active: a 44px session header (hexagon TorchwardMark + wordmark left; 'Round 3' pill + primary End Turn right — the signature action), a 72px InitiativeRibbon (56x56 monogram tokens with 3px threshold-colored HP strips, a sliding EMBER caret + 2px outline on the active token, an 'R3→R4' round-divider pill, Vess the Pale Warden parked as a dashed 40x40 HOLD token on the 24px upper rail with a 'Re-enter at current turn' popover, and Brother Aldous Penn down at 0/38 rendered 40% opacity with a skull), a 32px All/Party/Foes + Down filter row over 48px combatant rows (24px duration-hexagon condition clusters whose outlines deplete segment-by-segment — the Ghast carries 5 conditions to exercise the max-4 '+1' overflow — plus AC shield chips that highlight the last roll made against them in the ledger, 120x6 HPBars whose click opens an Apply Damage popover, and the 47-char Grand Inquisitor Malachai of the Sundered Choir of Vhalen forcing ellipsis), a 380px StatblockAside (64px identity header with AC chip, 6-column 44px ability grid with dual score+mod fields, 44px action rows reusing the ledger chip record, Apply Damage / Add Condition popover forms), and a 220px/36px RollLedgerDrawer of 40px rows — 12 precomputed entries whose damage sums reconcile every HP delta by hand (17 vs Seraphine = 51−34; 32 vs Vess = 120−88; zero entries touch untouched Bone Sentinel B at 25/25), per-die expression chips with struck dropped advantage dice (LGR_11: 'd20: 8' dropped, 'd20: 17' kept), an 8-chip fireball SAVE row omitting its vs-AC segment, HIT/MISS/SAVE/CRIT verdict badges, and '→ Seraphine 34/51' consequence buttons. Every End Turn pops an 8-turn deterministic script: the caret slides, the outgoing combatant's condition rings each lose a segment (expiries pop off and post system ledger lines + a pinned toast), pre-rolled entries append and their damage patches re-derive HP in rows, ribbon strips, and aside simultaneously, and the R3→R4 wrap increments the header pill. Responsive bands key off measured container width: <1000px the aside becomes a header-button Dialog, <860px the ribbon condenses to 40px tokens and rows drop AC chips, <720px the drawer collapses to a pre-composed summary bar that expands as an upward overlay. Choose over kds-expo-line when the advancing clock is TURNS in a cyclic initiative order — one End Turn fanning out expiring status effects and ledger-audited HP — not wall-clock ticket aging on a kitchen rail; choose over grid-feeder-console when consequences replay from a pre-authored turn script against combatant entities rather than a breaker-state topology cascade; choose over trial-site-monitor when rows are living combatants with duration-encoded conditions and an initiative ribbon, not participants in a visit-window matrix; choose over matter-workspace when the surface is a real-time table console with a scripted engine, not a document-and-deadline matter hub.",
  category: 'Gaming - Tabletop Companion',
  componentsUsed: [
    'Button',
    'Dialog',
    'DialogHeader',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'LayoutContent',
    'NumberInput',
    'Popover',
    'SegmentedControl',
    'SegmentedControlItem',
    'Selector',
    'Text',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
