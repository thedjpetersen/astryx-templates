/**
 * StyleX integration probe.
 *
 * Intentionally imported nowhere: it exists to prove that stylex.create()
 * compiles under the current Vite + TypeScript setup, including conditional
 * :hover and @media styles. Note: colors always go through var(--color-*)
 * theme tokens so dark mode keeps working.
 */
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  probe: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    paddingBlock: '8px',
    paddingInline: {
      default: '14px',
      '@media (max-width: 640px)': '10px',
    },
    borderRadius: '8px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    color: 'var(--color-text-primary)',
    backgroundColor: {
      default: 'transparent',
      ':hover': 'var(--color-accent-muted)',
    },
    fontSize: {
      default: '14px',
      '@media (max-width: 640px)': '13px',
    },
    cursor: 'pointer',
  },
});

export function StylexProbe() {
  return (
    <button type="button" {...stylex.props(styles.probe)}>
      StyleX probe
    </button>
  );
}
