// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Elevator Compliance Console',
  description:
    "Liftledger portfolio elevator-compliance console for Marlowe Property Group, frozen at Jun 3, 2026 (day 518 of a fixed Jan 1, 2025 epoch): a 46px header bar (shaft mark with the one #2B8A3E chevron, frozen as-of chip, 'M. Okafor · QEI-2214' inspector chip), a 72px portfolio meter strip whose 71% numeral, four-segment bar, and four clickable 44px stat chips (12 compliant · 3 due ≤90d · 1 in grace · 1 in violation) all derive live from 17 cars across 6 buildings; a 300px building rail (44px rows, derived x/y chips that sum to the strip, pinned '6 buildings · 17 cars' footer, 46-char Wexford-Anthracite name stressing truncation); a center scroll column with the ShaftBankDiagram — true vertical SVG shafts with per-landing ticks, Harrow's dashed skipped floor 13, brand-fill car markers, 8px status dots, and a condensed 8px-pitch mode for the 34-floor Wexford tower — above a 17-row × 36px CAT1/CAT5 schedule table with per-row mini regulatory-window bands; and a 380px detail aside carrying the full ComplianceWindowBand (valid → due-window → 45°-hatched grace → violation zones on a fixed 1095-day domain, hard cutoff tick at the Jul 18, 2026 cure deadline, dashed today marker; the Canal freight car omits the grace zone), certificate facts, and a ViolationCureStepper (<ol>, aria-current='step') pinned to a '45 days to cure' pill for open DOB violation V*040126LL10-01 on device 1P10462, plus the fully-cured historical VIO_QPS4 all-done stepper. One state owner (a flat Record of cars + violations mutated only by update(id, patch)) makes the signature ripple: 'Log CAT1 test' flips the band zones, the shaft dot (danger → success), Harrow's rail chip (1/3 → 2/3), the meter (71% → 76% with resizing segments), and the stepper ('File AOC' next) in one beat. Responsive bands key off CONTAINER width via a ResizeObserver: ≥1180px full; 980–1179px rail 260/aside 320, Building column drops; 760–979px aside becomes a right overlay panel; <760px rail collapses to 64px initials chips and the meter condenses to 48px. Choose over grid-feeder-console when the regulated topology is VERTICAL transportation with certificate windows and legal cure deadlines, not an electrical one-line with switching orders; choose over court-docketing-console when deadlines attach to physical assets' test certificates rather than docket entries and service chains; choose over pharmacy-verification-queue when the gate is a regulatory calendar band per asset, not an item-by-item human release queue; choose over cert-key-inventory when 'certificates' mean building-department paper with shafts and inspectors, not TLS keys.",
  category: 'Property Operations',
  componentsUsed: [
    'Avatar',
    'Button',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'StackItem',
    'StatusDot',
    'Text',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
