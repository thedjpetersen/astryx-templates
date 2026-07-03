// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (the Lumen Route brand, one demo
 *   account — ada.chen@lumenroute.com with the obviously fake password
 *   Solar-Batteries-42 — a wrong-password fixture 'hunter2', a weak
 *   password fixture 'sunshine', the one-time code 481 093, and a resend
 *   countdown that always starts at 24 seconds)
 * @output Variant-switched auth showcase presenting four full sign-in /
 *   registration screens inside a framed browser viewport: a centered
 *   sign-in card with email/password, remember-me CheckboxInput, and SSO
 *   Buttons; a split-brand variant pairing the same form with a gradient
 *   testimonial panel; a registration form with a live password-strength
 *   ProgressBar meter, rule checklist, and terms Checkbox; and a
 *   passwordless flow that advances from email entry to a six-box
 *   verification-code input with paste support, auto-advance, and a
 *   resend countdown. Validation is real: malformed emails and weak
 *   passwords show inline errors, submitting with the fixture password
 *   shows a loading Button then a success screen, any other password
 *   shakes the card behind a wrong-password Banner, and the code input
 *   auto-advances, backspaces across boxes, and accepts a pasted code.
 *   A demo toolbar pre-fills fixtures or triggers each error path so
 *   every state is reachable without typing.
 * @position Page template; emitted by `astryx template auth-sign-in-showcase`
 *
 * Frame: Layout height="fill". LayoutHeader carries the page title, a
 * caption naming the selected pattern, and the variant switcher
 * (SegmentedControl on desktop, Selector at phone widths). LayoutContent
 * scrolls a single column: the demo toolbar Card, then the framed
 * viewport — a bordered browser chrome (traffic-light dots + fake URL
 * per variant) whose screen area centers the active auth screen on a
 * variant-specific gradient wash. contentWidth={1040} caps the column.
 *
 * Responsive contract:
 * - Switcher: SegmentedControl in the header >640px; <=640px it becomes
 *   a full-width Selector under the title so four labels never squeeze.
 * - Demo toolbar Buttons wrap onto extra rows at any width; each is a
 *   full-height (~36-40px) Button, no icon-only targets.
 * - Split-brand variant: two columns (gradient testimonial panel 45% |
 *   form 55%) above 900px; <=900px the panel collapses to a compact
 *   gradient strip stacked above the form — single pane at 375px.
 * - Viewport screen padding drops from spacing-6 to spacing-3 <=640px;
 *   auth cards are width:100% with maxWidth 400-440 so they fill a
 *   375px screen minus padding. Code boxes are 44px square tap targets
 *   and the row wraps never — six boxes fit a 375px card.
 * - All interactions are click/tap + keyboard; nothing is hover-only
 *   (the SSO and toolbar Buttons toast on click, not on hover).
 *
 * Container policy (auth-showcase archetype): exactly one primary
 * container per variant — the auth Card centered in the framed viewport.
 * The split variant adds the single gradient brand panel beside it; the
 * demo toolbar is a separate muted Card above the frame so demo controls
 * never read as part of the product screen.
 *
 * Fixture policy: fixed strings only — no Date.now, no Math.random. The
 * loading Buttons and code verification use short bounded setTimeouts to
 * reveal pre-written outcomes, and the resend countdown is a plain
 * decrementing counter seeded at 24; no clock is ever read.
 */

import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Divider} from '@astryxdesign/core/Divider';
import {FieldStatus} from '@astryxdesign/core/FieldStatus';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Link} from '@astryxdesign/core/Link';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {TextInput} from '@astryxdesign/core/TextInput';
import {useToast} from '@astryxdesign/core/Toast';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  FlaskConicalIcon,
  GlobeIcon,
  KeyRoundIcon,
  MailIcon,
  MinusIcon,
  SparklesIcon,
} from 'lucide-react';

// ============= FIXTURES =============
// Deterministic demo account. The password is an obviously fake fixture
// (it is printed on the toolbar Button) and never resembles a credential.

const BRAND = {
  product: 'Lumen Route',
  tagline: 'Dispatch, routing, and fleet telemetry in one console.',
} as const;

const FIXTURES = {
  name: 'Ada Chen',
  email: 'ada.chen@lumenroute.com',
  password: 'Solar-Batteries-42',
  wrongPassword: 'hunter2',
  weakPassword: 'sunshine',
  code: '481093',
} as const;

const CODE_LENGTH = 6;
const RESEND_SECONDS = 24;
const SUBMIT_DELAY_MS = 900;
const VERIFY_DELAY_MS = 700;

const TESTIMONIAL = {
  quote:
    'We moved 40 dispatchers onto Lumen Route in a week. The drivers noticed before the managers did — routes just stopped colliding.',
  author: 'Maya Okafor',
  role: 'Fleet operations director, Harbor & Vine',
  initials: 'MO',
  stats: [
    {value: '3,200+', label: 'routes/day'},
    {value: '99.95%', label: 'uptime'},
    {value: '4.9/5', label: 'dispatcher rating'},
  ],
} as const;

// ---- variants ----

type VariantId = 'centered' | 'split' | 'register' | 'passwordless';

const VARIANTS: Array<{
  id: VariantId;
  label: string;
  caption: string;
  url: string;
}> = [
  {
    id: 'centered',
    label: 'Centered',
    caption: 'Centered sign-in card with SSO',
    url: 'app.lumenroute.com/sign-in',
  },
  {
    id: 'split',
    label: 'Split brand',
    caption: 'Sign-in beside a gradient testimonial panel',
    url: 'app.lumenroute.com/sign-in?v=brand',
  },
  {
    id: 'register',
    label: 'Registration',
    caption: 'Create-account form with password-strength meter',
    url: 'app.lumenroute.com/register',
  },
  {
    id: 'passwordless',
    label: 'Passwordless',
    caption: 'Email a one-time code, then six-box verification',
    url: 'app.lumenroute.com/sign-in/code',
  },
];

// ---- validation ----

// Deliberately simple: enough to catch "no @" and "no domain" while the
// user types. Real submission validation belongs server-side.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): string | null {
  if (email.trim() === '') {
    return 'Email is required.';
  }
  if (!EMAIL_PATTERN.test(email.trim())) {
    return 'Enter a valid email address, like name@company.com.';
  }
  return null;
}

interface StrengthRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

const STRENGTH_RULES: StrengthRule[] = [
  {
    id: 'length',
    label: 'At least 12 characters',
    test: password => password.length >= 12,
  },
  {
    id: 'upper',
    label: 'One uppercase letter',
    test: password => /[A-Z]/.test(password),
  },
  {id: 'digit', label: 'One number', test: password => /\d/.test(password)},
  {
    id: 'symbol',
    label: 'One symbol (like - or !)',
    test: password => /[^A-Za-z0-9]/.test(password),
  },
];

type MeterVariant = 'neutral' | 'error' | 'warning' | 'accent' | 'success';

// Index = number of rules passed (0-4).
const STRENGTH_METER: Array<{label: string; variant: MeterVariant}> = [
  {label: 'Enter a password', variant: 'neutral'},
  {label: 'Weak', variant: 'error'},
  {label: 'Fair', variant: 'warning'},
  {label: 'Good', variant: 'accent'},
  {label: 'Strong', variant: 'success'},
];

function strengthScore(password: string): number {
  if (password === '') {
    return 0;
  }
  return STRENGTH_RULES.filter(rule => rule.test(password)).length;
}

// ============= STYLES =============

const MONO_FONT =
  "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";

// One-shot shake for the wrong-password and wrong-code paths. Re-triggered
// by remounting the wrapper with a fresh key.
const SHAKE_KEYFRAMES = `
@keyframes auth-card-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-10px); }
  40% { transform: translateX(9px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(4px); }
}`;

const styles: Record<string, CSSProperties> = {
  // ---- framed viewport ----
  frame: {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
  },
  chromeBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-3)',
    borderBottom: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background)',
  },
  chromeDots: {display: 'flex', gap: 6, flexShrink: 0},
  chromeDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: 'var(--color-border)',
  },
  chromeUrl: {
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 999,
    paddingBlock: 2,
    paddingInline: 'var(--spacing-3)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: MONO_FONT,
    fontSize: 12,
    color: 'var(--color-text-secondary)',
  },
  chromeSpacer: {width: 42, flexShrink: 0},
  screen: {
    minHeight: 560,
    display: 'grid',
    placeItems: 'center',
    padding: 'var(--spacing-6)',
  },
  screenCompact: {
    minHeight: 480,
    display: 'grid',
    placeItems: 'center',
    padding: 'var(--spacing-3)',
  },
  // Variant-specific washes behind the centered card. Fixed hexes so the
  // screens read the same in both themes.
  washCentered: {
    background: 'linear-gradient(160deg, #eef2ff 0%, #fdf4ff 55%, #fff7ed 100%)',
  },
  washSplit: {
    background: 'linear-gradient(160deg, #f8fafc 0%, #eef2ff 100%)',
  },
  washRegister: {
    background: 'linear-gradient(160deg, #ecfeff 0%, #eef2ff 60%, #fdf4ff 100%)',
  },
  washPasswordless: {
    background: 'linear-gradient(160deg, #fafaf9 0%, #ecfeff 100%)',
  },
  // ---- auth cards ----
  authCard: {width: '100%', maxWidth: 400},
  authCardWide: {width: '100%', maxWidth: 440},
  cardSurface: {backgroundColor: '#ffffff', borderColor: '#e2e8f0'},
  fullWidth: {width: '100%'},
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'grid',
    placeItems: 'center',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 60%, #db2777 100%)',
    flexShrink: 0,
  },
  // ---- split-brand panel ----
  splitGrid: {
    display: 'grid',
    gridTemplateColumns: '9fr 11fr',
    gap: 'var(--spacing-5)',
    alignItems: 'stretch',
    width: '100%',
    maxWidth: 880,
  },
  splitStacked: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 'var(--spacing-4)',
    width: '100%',
    maxWidth: 440,
  },
  brandPanel: {
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 'var(--spacing-6)',
    color: '#ffffff',
    background: 'linear-gradient(150deg, #4338ca 0%, #7c3aed 55%, #db2777 100%)',
  },
  brandStrip: {
    borderRadius: 'var(--radius-container)',
    paddingBlock: 'var(--spacing-3)',
    paddingInline: 'var(--spacing-4)',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #4338ca 0%, #7c3aed 55%, #db2777 100%)',
  },
  brandQuote: {
    margin: 0,
    fontSize: 17,
    lineHeight: 1.55,
    fontWeight: 500,
  },
  brandDim: {color: 'rgba(255, 255, 255, 0.75)'},
  brandInitials: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0,
  },
  brandStatRow: {
    display: 'flex',
    gap: 'var(--spacing-5)',
    flexWrap: 'wrap',
  },
  brandStatValue: {fontSize: 18, fontWeight: 700, lineHeight: 1.2},
  brandStatLabel: {fontSize: 12, color: 'rgba(255, 255, 255, 0.75)'},
  // ---- passwordless code boxes ----
  codeRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    justifyContent: 'center',
  },
  codeInput: {
    width: 44,
    height: 52,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 600,
    fontFamily: MONO_FONT,
    color: '#0f172a',
    backgroundColor: '#ffffff',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    // Six 44px boxes + five 8px gaps = 304px: fits a 375px screen with
    // room to spare, so the row never wraps or shrinks below tap size.
    flexShrink: 0,
  },
  codeInputError: {
    width: 44,
    height: 52,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 600,
    fontFamily: MONO_FONT,
    color: '#0f172a',
    backgroundColor: '#ffffff',
    border: '1px solid var(--color-error)',
    borderRadius: 'var(--radius-container)',
    flexShrink: 0,
  },
  // ---- misc ----
  shake: {animation: 'auth-card-shake 320ms ease'},
  successBody: {minHeight: 120},
  dividerLabelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
  },
  dividerLine: {flex: 1},
};

// ============= SMALL PIECES =============

function BrandHeader({subtitle}: {subtitle: string}) {
  return (
    <VStack gap={3}>
      <HStack gap={3} vAlign="center">
        <div style={styles.brandMark} aria-hidden>
          <Icon icon={SparklesIcon} size="sm" />
        </div>
        <Text weight="bold">{BRAND.product}</Text>
      </HStack>
      <Heading level={2}>{subtitle}</Heading>
    </VStack>
  );
}

// "── or ──" separator between the credential form and the SSO buttons.
function OrDivider() {
  return (
    <div style={styles.dividerLabelRow}>
      <div style={styles.dividerLine}>
        <Divider />
      </div>
      <Text type="supporting" color="secondary">
        or
      </Text>
      <div style={styles.dividerLine}>
        <Divider />
      </div>
    </div>
  );
}

// Password field with a reveal toggle. The error message renders detached
// below the row so the input and eye button stay height-aligned.
function PasswordField({
  label,
  value,
  error,
  isRevealed,
  onChange,
  onToggleReveal,
}: {
  label: string;
  value: string;
  error: string | null;
  isRevealed: boolean;
  onChange: (value: string) => void;
  onToggleReveal: () => void;
}) {
  return (
    <VStack gap={1}>
      <HStack gap={2} vAlign="end">
        <StackItem size="fill">
          <TextInput
            type={isRevealed ? 'text' : 'password'}
            label={label}
            value={value}
            onChange={onChange}
          />
        </StackItem>
        <IconButton
          label={isRevealed ? 'Hide password' : 'Show password'}
          icon={<Icon icon={isRevealed ? EyeOffIcon : EyeIcon} size="sm" />}
          variant="secondary"
          onClick={onToggleReveal}
        />
      </HStack>
      {error != null && (
        <FieldStatus type="error" variant="detached" message={error} />
      )}
    </VStack>
  );
}

// Green-check success screen shared by all three flows.
function SuccessScreen({
  title,
  detail,
  actionLabel,
  onAction,
}: {
  title: string;
  detail: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <VStack gap={3} hAlign="center" style={styles.successBody}>
      <Icon icon="success" size="lg" color="success" />
      <Text weight="bold">{title}</Text>
      <div style={{textAlign: 'center'}}>
        <Text type="supporting" color="secondary">
          {detail}
        </Text>
      </div>
      <Button label={actionLabel} variant="secondary" onClick={onAction} />
    </VStack>
  );
}

// ============= PAGE =============

export default function AuthSignInShowcaseTemplate() {
  const toast = useToast();

  // Responsive contract: Selector switcher + tighter screen <=640px;
  // the split-brand panel collapses to a strip <=900px.
  const isPhone = useMediaQuery('(max-width: 640px)');
  const isSplitStacked = useMediaQuery('(max-width: 900px)');

  const [variant, setVariant] = useState<VariantId>('centered');
  const activeVariant =
    VARIANTS.find(item => item.id === variant) ?? VARIANTS[0];

  // ---- sign-in state (shared by centered + split so switching between
  // the two presentation variants keeps the typed values) ----
  type SignInPhase = 'idle' | 'loading' | 'success' | 'wrong';
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInAttempted, setSignInAttempted] = useState(false);
  const [signInPhase, setSignInPhase] = useState<SignInPhase>('idle');
  // Incremented per failed attempt; keys the shake wrapper so the
  // animation re-triggers on every wrong submit.
  const [signInShakeCount, setSignInShakeCount] = useState(0);

  // ---- registration state ----
  type RegPhase = 'idle' | 'loading' | 'success';
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [regAttempted, setRegAttempted] = useState(false);
  const [regPhase, setRegPhase] = useState<RegPhase>('idle');

  // ---- passwordless state ----
  type CodeStep = 'email' | 'code' | 'success';
  const [plEmail, setPlEmail] = useState('');
  const [plAttempted, setPlAttempted] = useState(false);
  const [plStep, setPlStep] = useState<CodeStep>('email');
  const [plSending, setPlSending] = useState(false);
  const [plVerifying, setPlVerifying] = useState(false);
  const [codeDigits, setCodeDigits] = useState<string[]>(
    Array(CODE_LENGTH).fill(''),
  );
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeShakeCount, setCodeShakeCount] = useState(0);
  const [resendLeft, setResendLeft] = useState(RESEND_SECONDS);
  const codeRefs = useRef<Array<HTMLInputElement | null>>([]);

  // ---- bounded demo timers (cleared on unmount) ----
  const signInTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const regTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const plSendTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const plVerifyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      for (const timer of [signInTimer, regTimer, plSendTimer, plVerifyTimer]) {
        if (timer.current != null) {
          clearTimeout(timer.current);
        }
      }
    },
    [],
  );

  // Resend countdown: a plain decrementing counter, one bounded timeout
  // per tick. Seeded at RESEND_SECONDS whenever the code step opens.
  useEffect(() => {
    if (plStep !== 'code' || resendLeft <= 0) {
      return undefined;
    }
    const tick = setTimeout(
      () => setResendLeft(seconds => Math.max(0, seconds - 1)),
      1000,
    );
    return () => clearTimeout(tick);
  }, [plStep, resendLeft]);

  // ============= SIGN-IN LOGIC =============

  const signInEmailError = signInAttempted
    ? validateEmail(signInEmail)
    : null;
  const signInPasswordError =
    signInAttempted && signInPassword === '' ? 'Password is required.' : null;

  const submitSignIn = () => {
    setSignInAttempted(true);
    if (validateEmail(signInEmail) != null || signInPassword === '') {
      setSignInShakeCount(count => count + 1);
      return;
    }
    setSignInPhase('loading');
    if (signInTimer.current != null) {
      clearTimeout(signInTimer.current);
    }
    signInTimer.current = setTimeout(() => {
      if (signInPassword === FIXTURES.password) {
        setSignInPhase('success');
      } else {
        setSignInPhase('wrong');
        setSignInShakeCount(count => count + 1);
      }
    }, SUBMIT_DELAY_MS);
  };

  const resetSignIn = () => {
    setSignInEmail('');
    setSignInPassword('');
    setRememberMe(true);
    setShowSignInPassword(false);
    setSignInAttempted(false);
    setSignInPhase('idle');
  };

  const ssoToast = (provider: string) =>
    toast({
      body: `Demo only — ${provider} SSO would redirect to the provider's consent screen here.`,
      uniqueID: `auth-sso-${provider}`,
    });

  // ============= REGISTRATION LOGIC =============

  const regScore = strengthScore(regPassword);
  const regMeter = STRENGTH_METER[regScore];
  const regNameError =
    regAttempted && regName.trim() === '' ? 'Full name is required.' : null;
  const regEmailError = regAttempted ? validateEmail(regEmail) : null;
  const regPasswordError =
    regAttempted && regScore < 3
      ? 'Password is too weak — meet at least three of the rules below.'
      : null;
  const regTermsError =
    regAttempted && !agreeTerms
      ? 'You must accept the terms to create an account.'
      : null;

  const submitRegister = () => {
    setRegAttempted(true);
    const isValid =
      regName.trim() !== '' &&
      validateEmail(regEmail) == null &&
      regScore >= 3 &&
      agreeTerms;
    if (!isValid) {
      return;
    }
    setRegPhase('loading');
    if (regTimer.current != null) {
      clearTimeout(regTimer.current);
    }
    regTimer.current = setTimeout(() => setRegPhase('success'), SUBMIT_DELAY_MS);
  };

  const resetRegister = () => {
    setRegName('');
    setRegEmail('');
    setRegPassword('');
    setShowRegPassword(false);
    setAgreeTerms(false);
    setRegAttempted(false);
    setRegPhase('idle');
  };

  // ============= PASSWORDLESS LOGIC =============

  const plEmailError = plAttempted ? validateEmail(plEmail) : null;

  const openCodeStep = () => {
    setPlStep('code');
    setPlSending(false);
    setCodeDigits(Array(CODE_LENGTH).fill(''));
    setCodeError(null);
    setResendLeft(RESEND_SECONDS);
  };

  const submitPlEmail = () => {
    setPlAttempted(true);
    if (validateEmail(plEmail) != null) {
      return;
    }
    setPlSending(true);
    if (plSendTimer.current != null) {
      clearTimeout(plSendTimer.current);
    }
    plSendTimer.current = setTimeout(openCodeStep, SUBMIT_DELAY_MS);
  };

  const verifyCode = (digits: string[]) => {
    setPlVerifying(true);
    setCodeError(null);
    if (plVerifyTimer.current != null) {
      clearTimeout(plVerifyTimer.current);
    }
    plVerifyTimer.current = setTimeout(() => {
      setPlVerifying(false);
      if (digits.join('') === FIXTURES.code) {
        setPlStep('success');
      } else {
        setCodeError(
          `That code didn't match. The demo code is ${FIXTURES.code.slice(0, 3)} ${FIXTURES.code.slice(3)}.`,
        );
        setCodeShakeCount(count => count + 1);
        setCodeDigits(Array(CODE_LENGTH).fill(''));
        codeRefs.current[0]?.focus();
      }
    }, VERIFY_DELAY_MS);
  };

  const applyDigits = (digits: string[]) => {
    setCodeDigits(digits);
    if (digits.every(digit => digit !== '')) {
      verifyCode(digits);
    }
  };

  const handleCodeChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    const next = [...codeDigits];
    next[index] = digit;
    applyDigits(next);
    if (digit !== '' && index < CODE_LENGTH - 1) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Backspace' && codeDigits[index] === '' && index > 0) {
      // Empty box: backspace clears and refocuses the previous box.
      event.preventDefault();
      const next = [...codeDigits];
      next[index - 1] = '';
      setCodeDigits(next);
      codeRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodePaste = (
    index: number,
    event: ClipboardEvent<HTMLInputElement>,
  ) => {
    const pasted = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, CODE_LENGTH - index);
    if (pasted === '') {
      return;
    }
    event.preventDefault();
    const next = [...codeDigits];
    for (let offset = 0; offset < pasted.length; offset++) {
      next[index + offset] = pasted[offset];
    }
    applyDigits(next);
    const focusIndex = Math.min(index + pasted.length, CODE_LENGTH - 1);
    codeRefs.current[focusIndex]?.focus();
  };

  const resendCode = () => {
    setCodeDigits(Array(CODE_LENGTH).fill(''));
    setCodeError(null);
    setResendLeft(RESEND_SECONDS);
    toast({
      body: `New code sent to ${plEmail.trim()} — it's still ${FIXTURES.code.slice(0, 3)} ${FIXTURES.code.slice(3)} in this demo.`,
      uniqueID: 'auth-resend',
    });
    codeRefs.current[0]?.focus();
  };

  const resetPasswordless = () => {
    setPlEmail('');
    setPlAttempted(false);
    setPlStep('email');
    setPlSending(false);
    setPlVerifying(false);
    setCodeDigits(Array(CODE_LENGTH).fill(''));
    setCodeError(null);
    setResendLeft(RESEND_SECONDS);
  };

  // ============= DEMO TOOLBAR =============
  // Pre-fills fixtures and triggers error paths so every state on the
  // active screen is reachable without typing.

  const fillValidSignIn = () => {
    setSignInEmail(FIXTURES.email);
    setSignInPassword(FIXTURES.password);
    setSignInAttempted(false);
    setSignInPhase('idle');
  };

  const fillWrongSignIn = () => {
    setSignInEmail(FIXTURES.email);
    setSignInPassword(FIXTURES.wrongPassword);
    setSignInAttempted(false);
    setSignInPhase('idle');
  };

  const fillStrongProfile = () => {
    setRegName(FIXTURES.name);
    setRegEmail(FIXTURES.email);
    setRegPassword(FIXTURES.password);
    setAgreeTerms(true);
    setRegAttempted(false);
    setRegPhase('idle');
  };

  const fillWeakPassword = () => {
    setRegName(FIXTURES.name);
    setRegEmail(FIXTURES.email);
    setRegPassword(FIXTURES.weakPassword);
    setAgreeTerms(false);
    setRegAttempted(true);
    setRegPhase('idle');
  };

  const jumpToCodeStep = () => {
    setPlEmail(FIXTURES.email);
    setPlAttempted(false);
    openCodeStep();
  };

  const fillFixtureCode = () => {
    applyDigits(FIXTURES.code.split(''));
  };

  const fillWrongCode = () => {
    applyDigits('000000'.split(''));
  };

  const toolbarActions: Array<{
    id: string;
    label: string;
    onClick: () => void;
    isDisabled?: boolean;
  }> =
    variant === 'register'
      ? [
          {
            id: 'strong',
            label: 'Pre-fill strong profile',
            onClick: fillStrongProfile,
          },
          {
            id: 'weak',
            label: `Trigger weak password ('${FIXTURES.weakPassword}')`,
            onClick: fillWeakPassword,
          },
          {id: 'reset', label: 'Reset screen', onClick: resetRegister},
        ]
      : variant === 'passwordless'
        ? [
            {
              id: 'jump',
              label: 'Jump to code entry',
              onClick: jumpToCodeStep,
            },
            {
              id: 'code',
              label: `Fill code ${FIXTURES.code.slice(0, 3)} ${FIXTURES.code.slice(3)}`,
              onClick: fillFixtureCode,
              isDisabled: plStep !== 'code' || plVerifying,
            },
            {
              id: 'badcode',
              label: 'Trigger wrong code',
              onClick: fillWrongCode,
              isDisabled: plStep !== 'code' || plVerifying,
            },
            {id: 'reset', label: 'Reset screen', onClick: resetPasswordless},
          ]
        : [
            {
              id: 'valid',
              label: 'Pre-fill fixture credentials',
              onClick: fillValidSignIn,
            },
            {
              id: 'wrong',
              label: `Trigger wrong password ('${FIXTURES.wrongPassword}')`,
              onClick: fillWrongSignIn,
            },
            {id: 'reset', label: 'Reset screen', onClick: resetSignIn},
          ];

  // ============= SIGN-IN CARD (centered + split) =============

  const signInForm = (
    <VStack gap={4}>
      <BrandHeader subtitle={`Sign in to ${BRAND.product}`} />
      {signInPhase === 'wrong' && (
        <Banner
          status="error"
          title="Wrong password"
          description="That password didn't match this account. Use the demo toolbar to pre-fill the working fixture credentials."
        />
      )}
      <TextInput
        type="email"
        label="Email"
        placeholder="name@company.com"
        value={signInEmail}
        onChange={setSignInEmail}
        status={
          signInEmailError != null
            ? {type: 'error', message: signInEmailError}
            : undefined
        }
      />
      <PasswordField
        label="Password"
        value={signInPassword}
        error={signInPasswordError}
        isRevealed={showSignInPassword}
        onChange={setSignInPassword}
        onToggleReveal={() => setShowSignInPassword(show => !show)}
      />
      <HStack gap={3} vAlign="center">
        <StackItem size="fill">
          <CheckboxInput
            label="Remember me"
            size="md"
            value={rememberMe}
            onChange={setRememberMe}
          />
        </StackItem>
        <Link
          onClick={() =>
            toast({
              body: 'Demo only — a reset link would be emailed here.',
              uniqueID: 'auth-forgot',
            })
          }>
          Forgot password?
        </Link>
      </HStack>
      <Button
        label="Sign in"
        variant="primary"
        isLoading={signInPhase === 'loading'}
        style={styles.fullWidth}
        onClick={submitSignIn}
      />
      <OrDivider />
      <VStack gap={2}>
        <Button
          label="Continue with Google"
          variant="secondary"
          icon={<Icon icon={GlobeIcon} size="sm" />}
          style={styles.fullWidth}
          onClick={() => ssoToast('Google')}
        />
        <Button
          label="Continue with GitHub"
          variant="secondary"
          icon={<Icon icon={KeyRoundIcon} size="sm" />}
          style={styles.fullWidth}
          onClick={() => ssoToast('GitHub')}
        />
      </VStack>
      <HStack gap={2} vAlign="center">
        <Text type="supporting" color="secondary">
          New to {BRAND.product}?
        </Text>
        <Link onClick={() => setVariant('register')}>Create an account</Link>
      </HStack>
      <Link onClick={() => setVariant('passwordless')}>
        Email me a one-time code instead
      </Link>
    </VStack>
  );

  const signInCard = (
    <div
      key={`signin-shake-${signInShakeCount}`}
      style={{
        ...styles.authCard,
        ...(signInShakeCount > 0 ? styles.shake : undefined),
      }}>
      <Card padding={5} style={styles.cardSurface}>
        {signInPhase === 'success' ? (
          <SuccessScreen
            title={`Signed in as ${signInEmail.trim()}`}
            detail={
              rememberMe
                ? 'This device will stay signed in for 30 days.'
                : 'This session ends when the browser closes.'
            }
            actionLabel="Back to sign-in"
            onAction={resetSignIn}
          />
        ) : (
          signInForm
        )}
      </Card>
    </div>
  );

  // ============= SPLIT-BRAND PANEL =============

  const brandPanel = (
    <div style={styles.brandPanel}>
      <VStack gap={3}>
        <HStack gap={3} vAlign="center">
          <div style={styles.brandMark} aria-hidden>
            <Icon icon={SparklesIcon} size="sm" />
          </div>
          <span style={{fontWeight: 700}}>{BRAND.product}</span>
        </HStack>
        <span style={styles.brandDim}>{BRAND.tagline}</span>
      </VStack>
      <VStack gap={4}>
        <blockquote style={styles.brandQuote}>
          &ldquo;{TESTIMONIAL.quote}&rdquo;
        </blockquote>
        <HStack gap={3} vAlign="center">
          <div style={styles.brandInitials} aria-hidden>
            {TESTIMONIAL.initials}
          </div>
          <VStack gap={0}>
            <span style={{fontWeight: 600}}>{TESTIMONIAL.author}</span>
            <span style={{...styles.brandDim, fontSize: 13}}>
              {TESTIMONIAL.role}
            </span>
          </VStack>
        </HStack>
        <div style={styles.brandStatRow}>
          {TESTIMONIAL.stats.map(stat => (
            <div key={stat.label}>
              <div style={styles.brandStatValue}>{stat.value}</div>
              <div style={styles.brandStatLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </VStack>
    </div>
  );

  // <=900px the panel collapses to this strip so the screen stays single
  // pane at phone widths while the brand voice survives.
  const brandStrip = (
    <div style={styles.brandStrip}>
      <span style={{fontWeight: 600}}>
        &ldquo;Routes just stopped colliding.&rdquo;
      </span>{' '}
      <span style={styles.brandDim}>
        — {TESTIMONIAL.author}, {TESTIMONIAL.role}
      </span>
    </div>
  );

  // ============= REGISTRATION CARD =============

  const registerCard = (
    <div style={styles.authCardWide}>
      <Card padding={5} style={styles.cardSurface}>
        {regPhase === 'success' ? (
          <SuccessScreen
            title={`Welcome, ${regName.trim()}!`}
            detail={`We sent a confirmation link to ${regEmail.trim()}. Click it within 24 hours to activate your workspace.`}
            actionLabel="Back to registration"
            onAction={resetRegister}
          />
        ) : (
          <VStack gap={4}>
            <BrandHeader subtitle="Create your account" />
            <TextInput
              label="Full name"
              placeholder="First and last name"
              value={regName}
              onChange={setRegName}
              status={
                regNameError != null
                  ? {type: 'error', message: regNameError}
                  : undefined
              }
            />
            <TextInput
              type="email"
              label="Work email"
              placeholder="name@company.com"
              value={regEmail}
              onChange={setRegEmail}
              status={
                regEmailError != null
                  ? {type: 'error', message: regEmailError}
                  : undefined
              }
            />
            <PasswordField
              label="Password"
              value={regPassword}
              error={regPasswordError}
              isRevealed={showRegPassword}
              onChange={setRegPassword}
              onToggleReveal={() => setShowRegPassword(show => !show)}
            />
            {/* Live strength meter: fills and recolors on every keystroke. */}
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <StackItem size="fill">
                  <ProgressBar
                    value={regScore}
                    max={STRENGTH_RULES.length}
                    label="Password strength"
                    isLabelHidden
                    variant={regMeter.variant}
                  />
                </StackItem>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {regMeter.label}
                </Text>
              </HStack>
              <VStack gap={1}>
                {STRENGTH_RULES.map(rule => {
                  const passed = rule.test(regPassword);
                  return (
                    <HStack gap={2} vAlign="center" key={rule.id}>
                      <Icon
                        icon={passed ? CheckIcon : MinusIcon}
                        size="sm"
                        color={passed ? 'success' : 'secondary'}
                      />
                      <Text
                        type="supporting"
                        color={passed ? 'primary' : 'secondary'}>
                        {rule.label}
                      </Text>
                    </HStack>
                  );
                })}
              </VStack>
            </VStack>
            <VStack gap={1}>
              <CheckboxInput
                label="I agree to the Terms of Service and Privacy Policy"
                description="Required to create a workspace. You can export or delete your data at any time."
                size="md"
                value={agreeTerms}
                onChange={setAgreeTerms}
              />
              {regTermsError != null && (
                <FieldStatus
                  type="error"
                  variant="detached"
                  message={regTermsError}
                />
              )}
            </VStack>
            <Button
              label="Create account"
              variant="primary"
              isLoading={regPhase === 'loading'}
              style={styles.fullWidth}
              onClick={submitRegister}
            />
            <HStack gap={2} vAlign="center">
              <Text type="supporting" color="secondary">
                Already have an account?
              </Text>
              <Link onClick={() => setVariant('centered')}>Sign in</Link>
            </HStack>
          </VStack>
        )}
      </Card>
    </div>
  );

  // ============= PASSWORDLESS CARD =============

  const codeBoxes = (
    <div
      key={`code-shake-${codeShakeCount}`}
      style={{
        ...styles.codeRow,
        ...(codeShakeCount > 0 ? styles.shake : undefined),
      }}>
      {codeDigits.map((digit, index) => (
        <input
          // Fixed-length row: index identity is stable by construction.
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          ref={node => {
            codeRefs.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          aria-label={`Digit ${index + 1} of ${CODE_LENGTH}`}
          style={codeError != null ? styles.codeInputError : styles.codeInput}
          value={digit}
          disabled={plVerifying}
          onChange={event => handleCodeChange(index, event.target.value)}
          onKeyDown={event => handleCodeKeyDown(index, event)}
          onPaste={event => handleCodePaste(index, event)}
        />
      ))}
    </div>
  );

  const passwordlessCard = (
    <div style={styles.authCard}>
      <Card padding={5} style={styles.cardSurface}>
        {plStep === 'success' ? (
          <SuccessScreen
            title={`Signed in as ${plEmail.trim()}`}
            detail="No password stored, nothing to forget. We'll email a fresh code next time."
            actionLabel="Start over"
            onAction={resetPasswordless}
          />
        ) : plStep === 'email' ? (
          <VStack gap={4}>
            <BrandHeader subtitle="Sign in without a password" />
            <Text type="supporting" color="secondary">
              Enter your email and we&rsquo;ll send a six-digit code that
              signs you in on this device.
            </Text>
            <TextInput
              type="email"
              label="Email"
              placeholder="name@company.com"
              value={plEmail}
              onChange={setPlEmail}
              status={
                plEmailError != null
                  ? {type: 'error', message: plEmailError}
                  : undefined
              }
            />
            <Button
              label="Email me a code"
              variant="primary"
              icon={<Icon icon={MailIcon} size="sm" />}
              isLoading={plSending}
              style={styles.fullWidth}
              onClick={submitPlEmail}
            />
            <Link onClick={() => setVariant('centered')}>
              Use a password instead
            </Link>
          </VStack>
        ) : (
          <VStack gap={4}>
            <BrandHeader subtitle="Check your email" />
            <Text type="supporting" color="secondary">
              We sent a six-digit code to <Text weight="bold">{plEmail.trim()}</Text>.
              Enter it below — paste works too.
            </Text>
            {codeError != null && (
              <Banner status="error" title="Code rejected" description={codeError} />
            )}
            {codeBoxes}
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                {plVerifying ? (
                  <Text type="supporting" color="secondary">
                    Checking code…
                  </Text>
                ) : resendLeft > 0 ? (
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    Resend available in 0:{String(resendLeft).padStart(2, '0')}
                  </Text>
                ) : (
                  <Link onClick={resendCode}>Resend code</Link>
                )}
              </StackItem>
              <Link
                onClick={() => {
                  setPlStep('email');
                  setCodeError(null);
                }}>
                Change email
              </Link>
            </HStack>
          </VStack>
        )}
      </Card>
    </div>
  );

  // ============= FRAMED VIEWPORT =============

  const screenWash: Record<VariantId, CSSProperties> = {
    centered: styles.washCentered,
    split: styles.washSplit,
    register: styles.washRegister,
    passwordless: styles.washPasswordless,
  };

  let screenBody: ReactNode;
  switch (variant) {
    case 'centered':
      screenBody = signInCard;
      break;
    case 'split':
      screenBody = isSplitStacked ? (
        <div style={styles.splitStacked}>
          {brandStrip}
          {signInCard}
        </div>
      ) : (
        <div style={styles.splitGrid}>
          {brandPanel}
          {signInCard}
        </div>
      );
      break;
    case 'register':
      screenBody = registerCard;
      break;
    case 'passwordless':
      screenBody = passwordlessCard;
      break;
  }

  const viewportFrame = (
    <div style={styles.frame}>
      {/* Fake browser chrome: dots + per-variant URL, no real navigation. */}
      <div style={styles.chromeBar}>
        <div style={styles.chromeDots} aria-hidden>
          <span style={styles.chromeDot} />
          <span style={styles.chromeDot} />
          <span style={styles.chromeDot} />
        </div>
        <div style={styles.chromeUrl}>{activeVariant.url}</div>
        {!isPhone && <div style={styles.chromeSpacer} aria-hidden />}
      </div>
      <div
        style={{
          ...(isPhone ? styles.screenCompact : styles.screen),
          ...screenWash[variant],
        }}>
        {screenBody}
      </div>
    </div>
  );

  // ============= SWITCHER + TOOLBAR =============

  const switcher = isPhone ? (
    <Selector
      label="Auth pattern"
      isLabelHidden
      options={VARIANTS.map(item => ({value: item.id, label: item.label}))}
      value={variant}
      onChange={value => setVariant(value as VariantId)}
    />
  ) : (
    <SegmentedControl
      label="Auth pattern"
      value={variant}
      onChange={value => setVariant(value as VariantId)}
      size="sm">
      {VARIANTS.map(item => (
        <SegmentedControlItem
          key={item.id}
          label={item.label}
          value={item.id}
        />
      ))}
    </SegmentedControl>
  );

  const demoToolbar = (
    <Card padding={3}>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <HStack gap={2} vAlign="center">
          <Icon icon={FlaskConicalIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary">
            Demo toolbar
          </Text>
        </HStack>
        {toolbarActions.map(action => (
          <Button
            key={action.id}
            label={action.label}
            variant="secondary"
            size="sm"
            isDisabled={action.isDisabled}
            onClick={action.onClick}
          />
        ))}
      </HStack>
    </Card>
  );

  // ============= FRAME =============

  return (
    <Layout
      height="fill"
      contentWidth={1040}
      header={
        <LayoutHeader hasDivider>
          {isPhone ? (
            <VStack gap={3}>
              <VStack gap={1}>
                <Heading level={1}>Sign-in &amp; registration</Heading>
                <Text type="supporting" color="secondary">
                  {activeVariant.caption}
                </Text>
              </VStack>
              {switcher}
            </VStack>
          ) : (
            <HStack gap={3} vAlign="center">
              <StackItem size="fill">
                <VStack gap={1}>
                  <Heading level={1}>Sign-in &amp; registration</Heading>
                  <Text type="supporting" color="secondary">
                    {activeVariant.caption}
                  </Text>
                </VStack>
              </StackItem>
              {switcher}
            </HStack>
          )}
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <style>{SHAKE_KEYFRAMES}</style>
          <VStack gap={4}>
            {demoToolbar}
            {viewportFrame}
          </VStack>
        </LayoutContent>
      }
    />
  );
}
