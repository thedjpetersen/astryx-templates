var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic therapy-site fixture for Therapy Availability Booking. No Date.now(),
 *   no Math.random(), no timers, and no network assets. The fixture includes
 *   four component cards, a four-step care pathway, a trust/search panel,
 *   three audience modes, and fixed therapy-site resource links.
 * @output Therapy Availability Booking: Therapy website experience for a first-session availability picker, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clients who need a calm path from therapist fit to a confirmed appointment. The primary and secondary CTAs
 *   announce through a dismissible toast; the audience segmented control
 *   changes the pathway heading; selecting a component card updates the
 *   adjacent detail panel and contrast tint.
 * @position Page template; emitted by \`astryx template therapy-availability-booking\`
 *
 * Frame: public therapy-website surface with a slim brand header, a large
 *   matching hero, a dark trust/search panel, a responsive component card
 *   grid, a right-side pathway inspector, and a full-width support resource
 *   band. This follows the marketing/product templates' framed-specimen
 *   pattern while staying quieter and care-oriented.
 * Interaction contract: no dead buttons. CTAs raise a toast, mode chips are
 *   proper pressed buttons, feature cards keep a visible selected state, and
 *   all support affordances are visible without hover. Urgent-help language
 *   stays informational; this is not an emergency workflow.
 * Responsive contract: above 760px the hero and content use two-column grids;
 *   below 760px the header stacks, nav scrolls horizontally, and all panels
 *   become a single column. Controls keep at least 38px height and wrap
 *   instead of forcing horizontal page overflow.
 * Container policy: repeated items are individual cards or pills only; the
 *   page sections are unframed bands or single panels, with no card nesting.
 */

import {useMemo, useState, type CSSProperties} from 'react';
import {
  ArrowRightIcon,
  CalendarCheckIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  Clock3Icon,
  HeartHandshakeIcon,
  LockKeyholeIcon,
  MessageCircleIcon,
  SearchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersIcon,
  VideoIcon,
} from 'lucide-react';

type Tone = 'mint' | 'blue' | 'violet' | 'amber';
type IconKey = 'search' | 'shield' | 'calendar' | 'heart';
type IconComponent = typeof CalendarCheckIcon;

type FeatureCard = {
  title: string;
  detail: string;
  metric: string;
  icon: IconKey;
  tone: Tone;
};

type PathStep = {
  label: string;
  value: string;
  detail: string;
};

const SCOPE = "tpl-therapy-availability-booking";
const PAGE = {
  brand: 'KindPath Therapy',
  eyebrow: "Scheduling",
  title: "Therapy Availability Booking",
  focus: "a first-session availability picker",
  audience: "clients who need a calm path from therapist fit to a confirmed appointment",
  primary: "Book session",
  secondary: "Ask a question",
  metric: "14",
  metricLabel: "slots this week",
  metricCaption: "Time zones, modality, and cancellation details sit beside the slot grid.",
  searchPlaceholder: "Search video visits, in-person, or hold slot",
} as const;

const TAGS = [
  "video visits",
  "in-person",
  "hold slot"
] as const;
const MODES = ['For clients', 'For clinicians', 'For coordinators'] as const;
const FEATURES: FeatureCard[] = [
  {
    "title": "Tell us what you need",
    "detail": "Captures what clients who need a calm path from therapist fit to a confirmed appointment need before they commit, then keeps the next action obvious and low-pressure.",
    "metric": "Book session",
    "icon": "search",
    "tone": "mint"
  },
  {
    "title": "Find a trusted fit",
    "detail": "Highlights license, specialty, modality, availability, and payment context for a first-session availability picker.",
    "metric": "14",
    "icon": "shield",
    "tone": "blue"
  },
  {
    "title": "Know the next step",
    "detail": "Shows exactly what happens after book session, from confirmation to secure prep materials.",
    "metric": "4 steps",
    "icon": "calendar",
    "tone": "violet"
  },
  {
    "title": "Support at every step",
    "detail": "Keeps urgent help, privacy, and contact options visible while the primary flow stays calm.",
    "metric": "Always on",
    "icon": "heart",
    "tone": "amber"
  }
];
const STEPS: PathStep[] = [
  {
    "label": "Explore",
    "value": "video visits",
    "detail": "Visitors can understand a first-session availability picker without reading dense clinical copy."
  },
  {
    "label": "Check fit",
    "value": "in-person",
    "detail": "This step explains who it is for, what to expect, and what information stays private."
  },
  {
    "label": "Plan next step",
    "value": "hold slot",
    "detail": "Scheduling, payment, consent, and support paths stay close to the main decision."
  },
  {
    "label": "Begin care",
    "value": "14",
    "detail": "Time zones, modality, and cancellation details sit beside the slot grid."
  }
];
const RESOURCES = [
  "Scheduling guide",
  "Privacy expectations",
  "Care team contact",
  "Accessibility notes"
] as const;

const ICONS: Record<IconKey, IconComponent> = {
  search: SearchIcon,
  shield: ShieldCheckIcon,
  calendar: CalendarCheckIcon,
  heart: HeartHandshakeIcon,
};

const palette: Record<Tone, {background: string; border: string; text: string; soft: string}> = {
  mint: {
    background: 'light-dark(#E6F6F0, #12352A)',
    border: 'light-dark(#8AD4B8, #2F8F73)',
    text: 'light-dark(#086247, #8DE5C4)',
    soft: 'light-dark(rgba(8, 98, 71, 0.10), rgba(141, 229, 196, 0.16))',
  },
  blue: {
    background: 'light-dark(#EAF2FF, #132B46)',
    border: 'light-dark(#9BBDF5, #4C86D8)',
    text: 'light-dark(#1E5AA8, #9DC4FF)',
    soft: 'light-dark(rgba(30, 90, 168, 0.10), rgba(157, 196, 255, 0.16))',
  },
  violet: {
    background: 'light-dark(#F0ECFF, #2B2147)',
    border: 'light-dark(#B8A8F3, #7C64D8)',
    text: 'light-dark(#5B45AA, #C7BAFF)',
    soft: 'light-dark(rgba(91, 69, 170, 0.10), rgba(199, 186, 255, 0.16))',
  },
  amber: {
    background: 'light-dark(#FFF4DA, #3F2A0D)',
    border: 'light-dark(#E7BF68, #B9862F)',
    text: 'light-dark(#7A4D06, #F2C76D)',
    soft: 'light-dark(rgba(122, 77, 6, 0.10), rgba(242, 199, 109, 0.16))',
  },
};

export default function TherapyAvailabilityBooking() {
  const [mode, setMode] = useState<(typeof MODES)[number]>(MODES[0]);
  const [activeTitle, setActiveTitle] = useState(FEATURES[0].title);
  const [toast, setToast] = useState<string | null>(null);
  const activeCard = useMemo(
    () => FEATURES.find(card => card.title === activeTitle) ?? FEATURES[0],
    [activeTitle],
  );
  const activeTone = palette[activeCard.tone];

  return (
    <main className={SCOPE} style={styles.shell}>
      <style>{\`
        .\${SCOPE} * { box-sizing: border-box; }
        .\${SCOPE} button { font: inherit; }
        .\${SCOPE} button:focus-visible,
        .\${SCOPE} a:focus-visible { outline: 3px solid color-mix(in srgb, var(--color-focus-ring, #5B6CF9) 70%, transparent); outline-offset: 3px; }
        @media (max-width: 760px) {
          .\${SCOPE} .topbar { align-items: flex-start; flex-direction: column; }
          .\${SCOPE} .nav { width: 100%; overflow-x: auto; padding-bottom: 2px; }
          .\${SCOPE} .heroGrid,
          .\${SCOPE} .contentGrid { grid-template-columns: 1fr; }
        }
      \`}</style>

      <header className="topbar" style={styles.topbar}>
        <div style={styles.brandCluster}>
          <div style={styles.brandMark} aria-hidden="true">
            <HeartHandshakeIcon size={22} strokeWidth={2.2} />
          </div>
          <div>
            <div style={styles.brand}>{PAGE.brand}</div>
            <div style={styles.brandSub}>Care that fits your life</div>
          </div>
        </div>
        <nav className="nav" aria-label="Therapy website sections" style={styles.nav}>
          {['Find care', 'Insurance', 'Resources', 'Support'].map(item => (
            <a key={item} href="#experience" style={styles.navLink}>
              {item}
            </a>
          ))}
        </nav>
      </header>

      <section className="heroGrid" style={styles.heroGrid}>
        <div style={styles.heroCopy}>
          <div style={styles.eyebrow}>
            <SparklesIcon size={16} strokeWidth={2.1} aria-hidden="true" />
            {PAGE.eyebrow}
          </div>
          <h1 style={styles.title}>{PAGE.title}</h1>
          <p style={styles.subtitle}>
            Explore {PAGE.focus} with clear options for {PAGE.audience}.
          </p>
          <div style={styles.segmented} aria-label="Experience mode">
            {MODES.map(item => {
              const isActive = item === mode;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  style={{
                    ...styles.segment,
                    ...(isActive ? styles.segmentActive : {}),
                  }}
                  aria-pressed={isActive}
                >
                  {item}
                </button>
              );
            })}
          </div>
          <div style={styles.actions}>
            <button
              type="button"
              onClick={() => setToast(\`\${PAGE.primary} opened for \${PAGE.title}.\`)}
              style={styles.primaryButton}
            >
              {PAGE.primary}
              <ArrowRightIcon size={18} strokeWidth={2.1} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setToast(\`\${PAGE.secondary} selected for \${PAGE.eyebrow.toLowerCase()}.\`)}
              style={styles.secondaryButton}
            >
              {PAGE.secondary}
            </button>
          </div>
        </div>

        <aside style={styles.matchPanel} aria-label="Therapy match controls">
          <div style={styles.panelHeader}>
            <SearchIcon size={18} strokeWidth={2.1} aria-hidden="true" />
            <span>Find the right support</span>
          </div>
          <label style={styles.searchBox}>
            <span style={styles.fieldLabel}>Search need, specialty, or logistics</span>
            <span style={styles.inputMock}>{PAGE.searchPlaceholder}</span>
          </label>
          <div style={styles.tagWrap}>
            {TAGS.map(tag => (
              <span key={tag} style={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
          <div style={styles.metricCard}>
            <div>
              <div style={styles.metricValue}>{PAGE.metric}</div>
              <div style={styles.metricLabel}>{PAGE.metricLabel}</div>
            </div>
            <div style={styles.metricIcon} aria-hidden="true">
              <CheckCircle2Icon size={22} strokeWidth={2.2} />
            </div>
          </div>
          <p style={styles.caption}>{PAGE.metricCaption}</p>
        </aside>
      </section>

      <section id="experience" className="contentGrid" style={styles.contentGrid}>
        <div style={styles.cardGrid} aria-label="Experience components">
          {FEATURES.map(card => {
            const Icon = ICONS[card.icon];
            const tone = palette[card.tone];
            const isActive = card.title === activeTitle;
            return (
              <button
                key={card.title}
                type="button"
                onClick={() => setActiveTitle(card.title)}
                aria-pressed={isActive}
                style={{
                  ...styles.featureCard,
                  borderColor: isActive ? tone.border : 'var(--color-border-subtle, #DDD8CF)',
                  background: isActive ? tone.background : 'var(--color-bg-surface, #FFFFFF)',
                }}
              >
                <span style={{...styles.iconBadge, background: tone.soft, color: tone.text}}>
                  <Icon size={20} strokeWidth={2.1} aria-hidden="true" />
                </span>
                <span style={styles.cardText}>
                  <span style={styles.cardTitle}>{card.title}</span>
                  <span style={styles.cardDetail}>{card.detail}</span>
                </span>
                <span style={{...styles.cardMetric, color: tone.text}}>{card.metric}</span>
              </button>
            );
          })}
        </div>

        <aside style={styles.sidePanel} aria-label="Care pathway">
          <div style={styles.sideHeader}>
            <ClipboardListIcon size={18} strokeWidth={2.1} aria-hidden="true" />
            <span>{mode} pathway</span>
          </div>
          <ol style={styles.stepList}>
            {STEPS.map((step, index) => (
              <li key={step.label} style={styles.stepItem}>
                <span style={styles.stepIndex}>{index + 1}</span>
                <span style={styles.stepContent}>
                  <span style={styles.stepTopline}>
                    <span>{step.label}</span>
                    <span style={styles.stepValue}>{step.value}</span>
                  </span>
                  <span style={styles.stepDetail}>{step.detail}</span>
                </span>
              </li>
            ))}
          </ol>
          <div style={{...styles.activeDetail, borderColor: activeTone.border, background: activeTone.background}}>
            <div style={styles.activeHeader}>
              <LockKeyholeIcon size={17} strokeWidth={2.1} aria-hidden="true" />
              Current focus
            </div>
            <strong style={styles.activeTitle}>{activeCard.title}</strong>
            <p style={styles.activeCopy}>{activeCard.detail}</p>
          </div>
        </aside>
      </section>

      <section style={styles.resourceBand} aria-label="Therapy support resources">
        <div style={styles.resourceIntro}>
          <UsersIcon size={18} strokeWidth={2.1} aria-hidden="true" />
          <span>Crisis, privacy, and care-team information stays easy to reach.</span>
        </div>
        <div style={styles.resourceList}>
          {RESOURCES.map((resource, index) => {
            const Icon = index === 0 ? Clock3Icon : index === 1 ? ShieldCheckIcon : index === 2 ? MessageCircleIcon : VideoIcon;
            return (
              <span key={resource} style={styles.resourcePill}>
                <Icon size={16} strokeWidth={2.1} aria-hidden="true" />
                {resource}
              </span>
            );
          })}
        </div>
      </section>

      {toast ? (
        <div role="status" aria-live="polite" style={styles.toast}>
          <span>{toast}</span>
          <button type="button" onClick={() => setToast(null)} style={styles.toastDismiss}>
            Dismiss
          </button>
        </div>
      ) : null}
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  shell: {
    minHeight: '100dvh',
    padding: 24,
    color: 'var(--color-fg-primary, #191714)',
    background:
      'linear-gradient(180deg, var(--color-bg-canvas, #F7F4EE) 0%, var(--color-bg-muted, #EFEAE1) 100%)',
    fontFamily: 'var(--font-family-body, Inter, system-ui, sans-serif)',
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
    maxWidth: 1180,
    margin: '0 auto 24px',
  },
  brandCluster: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    color: 'light-dark(#0E6A51, #8DE5C4)',
    background: 'light-dark(#E6F6F0, #12352A)',
    border: '1px solid light-dark(#A8DAC7, #2F8F73)',
    flex: '0 0 auto',
  },
  brand: {
    fontSize: 17,
    fontWeight: 750,
    lineHeight: 1.1,
  },
  brandSub: {
    color: 'var(--color-fg-secondary, #6B6257)',
    fontSize: 13,
    marginTop: 3,
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  navLink: {
    color: 'var(--color-fg-secondary, #625A52)',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 650,
    padding: '10px 12px',
    borderRadius: 999,
    border: '1px solid var(--color-border-subtle, #DDD8CF)',
    background: 'var(--color-bg-surface, #FFFFFF)',
    whiteSpace: 'nowrap',
  },
  heroGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.15fr) minmax(300px, 0.85fr)',
    gap: 18,
    maxWidth: 1180,
    margin: '0 auto',
  },
  heroCopy: {
    borderRadius: 8,
    padding: 28,
    minHeight: 420,
    background: 'var(--color-bg-surface, #FFFFFF)',
    border: '1px solid var(--color-border-subtle, #DDD8CF)',
    boxShadow: '0 18px 45px rgba(45, 37, 28, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 22,
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    width: 'fit-content',
    color: 'light-dark(#5B45AA, #C7BAFF)',
    background: 'light-dark(#F0ECFF, #2B2147)',
    border: '1px solid light-dark(#D5CCFF, #6B56BF)',
    borderRadius: 999,
    padding: '8px 11px',
    fontSize: 13,
    fontWeight: 750,
  },
  title: {
    maxWidth: 760,
    margin: 0,
    fontSize: 50,
    lineHeight: 0.95,
    letterSpacing: 0,
    overflowWrap: 'anywhere',
  },
  subtitle: {
    maxWidth: 680,
    margin: 0,
    color: 'var(--color-fg-secondary, #625A52)',
    fontSize: 18,
    lineHeight: 1.55,
  },
  segmented: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    padding: 5,
    width: 'fit-content',
    borderRadius: 8,
    background: 'var(--color-bg-muted, #F2EEE7)',
    border: '1px solid var(--color-border-subtle, #DDD8CF)',
  },
  segment: {
    minHeight: 38,
    border: 0,
    borderRadius: 8,
    padding: '0 12px',
    color: 'var(--color-fg-secondary, #625A52)',
    background: 'transparent',
    cursor: 'pointer',
    fontWeight: 700,
  },
  segmentActive: {
    color: 'var(--color-fg-primary, #191714)',
    background: 'var(--color-bg-surface, #FFFFFF)',
    boxShadow: '0 1px 2px rgba(45, 37, 28, 0.12)',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
  },
  primaryButton: {
    minHeight: 48,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 9,
    border: 0,
    borderRadius: 8,
    padding: '0 18px',
    color: 'light-dark(#FFFFFF, #06251B)',
    background: 'light-dark(#0E6A51, #8DE5C4)',
    cursor: 'pointer',
    fontWeight: 800,
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 8,
    padding: '0 18px',
    border: '1px solid var(--color-border-subtle, #D8D1C7)',
    background: 'var(--color-bg-surface, #FFFFFF)',
    color: 'var(--color-fg-primary, #191714)',
    cursor: 'pointer',
    fontWeight: 800,
  },
  toast: {
    position: 'fixed',
    right: 20,
    bottom: 20,
    zIndex: 20,
    maxWidth: 360,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 14px',
    borderRadius: 8,
    color: '#FFFFFF',
    background: 'light-dark(#1E1A16, #111111)',
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.22)',
    fontSize: 14,
    fontWeight: 750,
  },
  toastDismiss: {
    minHeight: 34,
    border: '1px solid rgba(255, 255, 255, 0.24)',
    borderRadius: 999,
    padding: '0 10px',
    color: '#FFFFFF',
    background: 'rgba(255, 255, 255, 0.10)',
    cursor: 'pointer',
    fontWeight: 800,
  },
  matchPanel: {
    borderRadius: 8,
    padding: 20,
    background: 'light-dark(#1E1A16, #111111)',
    color: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    minHeight: 420,
    boxShadow: '0 18px 45px rgba(45, 37, 28, 0.14)',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    fontWeight: 800,
  },
  searchBox: {
    display: 'grid',
    gap: 8,
    padding: 14,
    borderRadius: 8,
    background: 'rgba(255, 255, 255, 0.09)',
    border: '1px solid rgba(255, 255, 255, 0.14)',
  },
  fieldLabel: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 12,
    fontWeight: 750,
  },
  inputMock: {
    minHeight: 48,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    padding: '0 14px',
    background: '#FFFFFF',
    color: '#1E1A16',
    fontSize: 14,
    fontWeight: 700,
  },
  tagWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderRadius: 999,
    padding: '8px 10px',
    background: 'rgba(255, 255, 255, 0.10)',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    color: 'rgba(255, 255, 255, 0.86)',
    fontSize: 13,
    fontWeight: 750,
  },
  metricCard: {
    marginTop: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    padding: 16,
    borderRadius: 8,
    background: 'rgba(141, 229, 196, 0.14)',
    border: '1px solid rgba(141, 229, 196, 0.32)',
  },
  metricValue: {
    fontSize: 36,
    lineHeight: 1,
    fontWeight: 850,
    fontVariantNumeric: 'tabular-nums',
  },
  metricLabel: {
    color: 'rgba(255, 255, 255, 0.74)',
    fontSize: 13,
    fontWeight: 750,
    marginTop: 5,
    textTransform: 'uppercase',
  },
  metricIcon: {
    width: 46,
    height: 46,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    color: '#8DE5C4',
    background: 'rgba(255, 255, 255, 0.10)',
  },
  caption: {
    margin: 0,
    color: 'rgba(255, 255, 255, 0.72)',
    lineHeight: 1.45,
    fontSize: 14,
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(300px, 380px)',
    gap: 18,
    maxWidth: 1180,
    margin: '18px auto 0',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(245px, 1fr))',
    gap: 12,
  },
  featureCard: {
    minHeight: 176,
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto',
    gap: 14,
    textAlign: 'left',
    border: '1px solid var(--color-border-subtle, #DDD8CF)',
    borderRadius: 8,
    padding: 18,
    cursor: 'pointer',
    color: 'var(--color-fg-primary, #191714)',
    boxShadow: '0 10px 28px rgba(45, 37, 28, 0.06)',
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
  },
  cardText: {
    display: 'grid',
    gap: 7,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 850,
    lineHeight: 1.2,
  },
  cardDetail: {
    color: 'var(--color-fg-secondary, #625A52)',
    fontSize: 14,
    lineHeight: 1.45,
  },
  cardMetric: {
    fontSize: 13,
    fontWeight: 850,
  },
  sidePanel: {
    borderRadius: 8,
    padding: 18,
    background: 'var(--color-bg-surface, #FFFFFF)',
    border: '1px solid var(--color-border-subtle, #DDD8CF)',
    boxShadow: '0 10px 28px rgba(45, 37, 28, 0.06)',
  },
  sideHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 15,
    fontWeight: 850,
    marginBottom: 14,
  },
  stepList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'grid',
    gap: 10,
  },
  stepItem: {
    display: 'grid',
    gridTemplateColumns: '34px minmax(0, 1fr)',
    gap: 10,
    alignItems: 'start',
  },
  stepIndex: {
    width: 34,
    height: 34,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    color: 'light-dark(#0E6A51, #8DE5C4)',
    background: 'light-dark(#E6F6F0, #12352A)',
    fontWeight: 850,
    fontVariantNumeric: 'tabular-nums',
  },
  stepContent: {
    display: 'grid',
    gap: 4,
    minWidth: 0,
  },
  stepTopline: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    fontSize: 14,
    fontWeight: 850,
  },
  stepValue: {
    color: 'var(--color-fg-secondary, #625A52)',
    fontSize: 12,
    whiteSpace: 'nowrap',
  },
  stepDetail: {
    color: 'var(--color-fg-secondary, #625A52)',
    fontSize: 13,
    lineHeight: 1.45,
  },
  activeDetail: {
    marginTop: 18,
    border: '1px solid',
    borderRadius: 8,
    padding: 14,
  },
  activeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    color: 'var(--color-fg-secondary, #625A52)',
    fontSize: 12,
    fontWeight: 850,
    textTransform: 'uppercase',
  },
  activeTitle: {
    display: 'block',
    marginTop: 9,
    fontSize: 16,
  },
  activeCopy: {
    margin: '6px 0 0',
    color: 'var(--color-fg-secondary, #625A52)',
    fontSize: 13,
    lineHeight: 1.45,
  },
  resourceBand: {
    maxWidth: 1180,
    margin: '18px auto 0',
    borderRadius: 8,
    padding: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    flexWrap: 'wrap',
    background: 'var(--color-bg-surface, #FFFFFF)',
    border: '1px solid var(--color-border-subtle, #DDD8CF)',
  },
  resourceIntro: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    color: 'var(--color-fg-secondary, #625A52)',
    fontSize: 14,
    fontWeight: 700,
  },
  resourceList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  resourcePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    minHeight: 36,
    borderRadius: 999,
    padding: '0 11px',
    color: 'var(--color-fg-primary, #191714)',
    background: 'var(--color-bg-muted, #F2EEE7)',
    border: '1px solid var(--color-border-subtle, #DDD8CF)',
    fontSize: 13,
    fontWeight: 800,
  },
};
`;export{e as default};