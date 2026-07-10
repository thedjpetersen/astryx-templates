import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Hospital Bed Flow Command',
  description:
    'Wardline house-supervisor surface: a four-unit floor grid of state-coded 64px bed tiles (occupied, discharge-pending, cleaning, blocked, available, assigned) with per-unit segmented census bars, beside a 328px pending-admit rail with boarding-age chips and a shift log. Arming an admit highlights compatible beds and dims the rest; assigning re-derives census bars, boarding hours, and availability stats, while isolation, telemetry, or unit mismatches refuse with the exact failing rule. Discharge → EVS clean → available → assign is a fully tappable lifecycle with deterministic fixtures.',
  category: 'Healthcare - Hospital Bed Flow Command',
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent', 'Icon'],
} satisfies AstryxPageTemplate;

export default template;
