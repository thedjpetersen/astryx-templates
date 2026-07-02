import {defineTheme} from '@astryxdesign/core/theme';

/**
 * Astryx brand theme — the same thin brand layer astryx-sheet and
 * astryx-editor use over the design-system defaults:
 *
 *   1. PRIMARY    — warm near-black ink that drives primary text/icons AND all
 *      accent tokens, so buttons, links, focus rings, and tints read as
 *      near-black rather than blue.
 *   2. BRAND_BLUE — the Astryx blue, reserved for the logo mark only. Exposed
 *      as the custom var --color-brand and never wired to a semantic token.
 *
 * Beyond that: cream body in light mode, Figtree typography, a +4px radius
 * bump, semibold display headings, and pill buttons. The neutral gray ramp
 * (surfaces, borders, secondary/disabled text) stays at the system defaults.
 */

const PRIMARY = 'light-dark(#15110C, #DFE2E5)';
const PRIMARY_MUTED = 'light-dark(rgba(21, 17, 12, 0.08), rgba(223, 226, 229, 0.14))';
export const BRAND_BLUE = 'light-dark(#225BFF, #3D87FF)';

const FIGTREE_STACK =
  '"Figtree", "Figtree Variable", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const astryxTheme = defineTheme({
  name: 'astryx',
  tokens: {
    '--color-accent': PRIMARY,
    '--color-text-accent': PRIMARY,
    '--color-icon-accent': PRIMARY,
    '--color-accent-muted': PRIMARY_MUTED,
    // On-accent ink must invert with the accent: near-black accent in light
    // mode gets white labels, near-white accent in dark mode gets near-black.
    '--color-on-accent': 'light-dark(#FFFFFF, #15110C)',
    '--color-background-body': 'light-dark(#F8F4ED, #111112)',
    '--color-text-primary': PRIMARY,
    '--color-icon-primary': PRIMARY,
    '--text-display-1-weight': 'var(--font-weight-semibold)',
    '--text-display-2-weight': 'var(--font-weight-semibold)',
    '--text-display-3-weight': 'var(--font-weight-semibold)',
    '--radius-inner': '8px',
    '--radius-element': '12px',
    '--radius-container': '16px',
    '--radius-page': '32px',
    '--color-brand': BRAND_BLUE,
  },
  typography: {
    body: {family: 'Figtree', fallbacks: FIGTREE_STACK},
    heading: {family: 'Figtree', fallbacks: FIGTREE_STACK},
  },
  components: {
    button: {
      base: {
        borderRadius: 'var(--radius-full)',
      },
    },
  },
});

// The theme CSS is pre-compiled to ./astryxTheme.css (imported by main.tsx)
// via `pnpm build:theme`, so the Theme component skips runtime <style>
// injection. Re-run the script whenever the tokens above change.
astryxTheme.__built = true;
