var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (16 caption cues for the two-speaker
 *   interview 'interview-cut-02' spanning 00:00:01.200 → 00:02:38.900, with
 *   English/Spanish/German text variants per cue; playhead seeded at
 *   00:00:54.300 so cue 7 — ANDRE's budget line — is the active caption)
 * @output Subtitle/caption editing workbench: top-left, a 16:9 mock player
 *   stage (CSS gradient "footage", scene note, timecode chip) rendering the
 *   active cue as a real caption overlay — black scrim pill, two-line max —
 *   with a transport row (prev/play/next, rate SegmentedControl, mute and
 *   caption toggles), a cue strip that maps every cue as a colored block
 *   (accent normal, amber CPS, red overlap) under a playhead line, and a
 *   scrub Slider; top-right, a cue inspector Card with In/Out timecode TextInputs,
 *   ±100ms nudge IconButtons, duration + CPS readouts, a character-count
 *   FieldStatus that flips to error past 42 chars/line, and the cue text
 *   TextArea; bottom, a full-width scrolling cue Table (#, in, out, dur,
 *   speaker, text, issue Badges) where the row containing the playhead is
 *   highlighted and two rows carry validation flags — 'CPS 23' amber on cue 4
 *   and a red 'Overlaps next by 300ms' between cues 11–12; a footer Toolbar
 *   offers Add cue / Split / Merge / Shift all ±100ms
 * @position Page template; emitted by \`astryx template subtitle-cue-editor\`
 *
 * Frame: Layout height="fill", no page scroll. LayoutHeader carries the
 * track chrome ('interview-cut-02 · captions' title, language Selector,
 * issues Badge, ghost Preview + primary 'Export .srt' Buttons). LayoutContent
 * (padding 0) splits vertically: an upper content-height region (player stage
 * capped at 700px wide on the left, inspector 380px right), a lower cue-table
 * region that fills the remaining height with its own scroll, and a 48px
 * footer operations Toolbar. Choose over
 * transcript-annotator when the user edits timing/text of caption cues
 * against a playhead, and over video-clip-timeline when the timeline is a
 * cue table, not multi-track lanes.
 *
 * Responsive contract:
 * - >1100px: header | (stage ≤700px + inspector 380 fixed) content-height |
 *   table fills remaining height | 48px toolbar. Only the table region
 *   scrolls internally.
 * - <=1100px: the inspector stacks below the stage; the upper region scrolls
 *   vertically as one column and the table region keeps a fixed 45% height.
 * - <=768px: the header drops the ghost Preview button; transport, nudge,
 *   and footer cue-operation controls grow to 40px touch targets (icon
 *   glyphs stay "sm" so the rows read the same, just with more padding).
 * - The header row and the transport row wrap (flexWrap) instead of
 *   clipping, so the rate control, mute/captions toggles, and the primary
 *   Export button stay reachable at phone widths; the cue table keeps its
 *   662px of pixel columns plus a >=220px text column and scrolls
 *   horizontally (overflowX) below that.
 * - The caption overlay sizes with the stage via container-query units, so
 *   the same pill reads correctly at any stage width; timecodes keep tabular
 *   numbers so scrubbing never jitters.
 *
 * Container policy (edit-workbench archetype): frame-first rows and panels;
 * the only Cards are the player stage surface and the cue inspector. All
 * validation (CPS > 17, line > 42 chars, cue overlap) is recomputed live
 * from the edited fixture state — no clocks, randomness, or network media.
 */

import {useEffect, useState, type CSSProperties} from 'react';

import {
  CaptionsIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ClapperboardIcon,
  DownloadIcon,
  EyeIcon,
  MergeIcon,
  MinusIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  SkipBackIcon,
  SkipForwardIcon,
  SplitIcon,
  Volume2Icon,
  VolumeXIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Field} from '@astryxdesign/core/Field';
import {FieldStatus} from '@astryxdesign/core/FieldStatus';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Slider} from '@astryxdesign/core/Slider';
import {Switch} from '@astryxdesign/core/Switch';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn, TablePlugin} from '@astryxdesign/core/Table';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  fill: {height: '100%', minHeight: 0},
  // Upper region: stage + inspector. Content-height on desktop so the cue
  // table below gets the remaining space; scrolls internally when the
  // inspector stacks below the stage (<=1100px).
  upperScroll: {
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  stageColumn: {minWidth: 0},
  // Cap the stage so a wide viewport doesn't let the 16:9 player swallow the
  // vertical budget that belongs to the cue table.
  stageColumnCapped: {minWidth: 0, width: '100%', maxWidth: 700},
  inspectorColumn: {width: 380, flexShrink: 0},
  // Mock player surface: CSS gradients only — no <video>, no network media.
  // containerType makes cqw units track the rendered stage width so the
  // caption pill scales with the stage.
  stage: {
    position: 'relative',
    width: '100%',
    height: '100%',
    background:
      'radial-gradient(120% 90% at 30% 20%, #2A3B50 0%, #16202E 55%, #0B111B 100%)',
    containerType: 'inline-size',
    overflow: 'hidden',
    colorScheme: 'dark',
  },
  stageCard: {overflow: 'hidden', boxShadow: 'var(--shadow-high)'},
  // Faux key light + floor line so the "footage" reads as an interview set.
  stageGlow: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 34%), linear-gradient(0deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 28%)',
  },
  sceneNote: {
    position: 'absolute',
    top: '4.5%',
    left: '4%',
    color: 'rgba(255,255,255,0.55)',
    fontSize: 'clamp(10px, 1.8cqw, 13px)',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  timecodeChip: {
    position: 'absolute',
    top: '4.5%',
    right: '4%',
    padding: '2px 8px',
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'var(--font-family-code, monospace)',
    fontSize: 'clamp(10px, 1.9cqw, 13px)',
    fontVariantNumeric: 'tabular-nums',
  },
  // The caption overlay: black scrim pill, centered, hard two-line clamp.
  captionPill: {
    position: 'absolute',
    left: '50%',
    bottom: '6.5%',
    transform: 'translateX(-50%)',
    maxWidth: '86%',
    padding: '0.35em 0.85em',
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.72)',
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 'clamp(12px, 3.1cqw, 24px)',
    lineHeight: 1.35,
    whiteSpace: 'pre-line',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  // Cue strip: one colored block per cue over a muted rail, playhead line on
  // top — the legible companion to the scrub Slider below it.
  cueStrip: {
    position: 'relative',
    height: 34,
    borderRadius: 6,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  cueBlock: {position: 'absolute', top: 7, bottom: 7, borderRadius: 3},
  stripPlayhead: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    marginLeft: -1,
    backgroundColor: 'var(--color-accent)',
  },
  // Lower region: fills the height left by the content-height upper region on
  // desktop (fixed ~45% when stacked); table scrolls inside it.
  tableRegion: {
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  tableHeaderRow: {
    padding: 'var(--spacing-2) var(--spacing-4)',
  },
  tableScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    // Pixel columns total 662px; narrow viewports scroll the table
    // horizontally instead of collapsing the proportional text column.
    overflowX: 'auto',
    paddingInline: 'var(--spacing-4)',
    paddingBottom: 'var(--spacing-2)',
  },
  footerToolbar: {minHeight: 48},
  timecodeInput: {fontFamily: 'var(--font-family-code, monospace)'},
  // Header and transport rows reflow onto extra lines at phone widths
  // rather than clipping the rate control / Export button.
  headerRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-2)'},
  transportRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-1)'},
  // <=768px: grow the sm controls to 40px touch targets (the 28px "sm" box
  // is fine for pointers but too small for thumbs); icon glyphs stay "sm".
  tapTarget: {width: 40, height: 40},
  tapTargetWide: {height: 40},
};

// ============= DATA =============
// Deterministic fixtures: fixed cue times in milliseconds, three language
// variants per cue. No clocks, no randomness, no media assets.

const TRACK_NAME = 'interview-cut-02';
const DURATION_MS = 160_000; // 00:02:40.000 program length
const INITIAL_PLAYHEAD_MS = 54_300; // inside cue 7
const CPS_LIMIT = 17;
const LINE_LIMIT = 42;

type LangCode = 'en' | 'es' | 'de';
type Speaker = 'MAYA' | 'ANDRE';

const LANGS: LangCode[] = ['en', 'es', 'de'];

const LANGUAGE_OPTIONS = [
  {value: 'en', label: 'English'},
  {value: 'es', label: 'Spanish'},
  {value: 'de', label: 'German'},
];

interface Cue {
  id: number;
  speaker: Speaker;
  inMs: number;
  outMs: number;
  text: Record<LangCode, string>;
}

// 16 cues, 00:00:01.200 → 00:02:38.900, as compact tuples:
// [inMs, outMs, speaker, en, es, de]. Cue 4 runs hot (45 chars in 2.0s →
// CPS 23); cue 11's out-time spills 300ms into cue 12. Gaps around 00:34 and
// 01:44 are b-roll with no dialogue.
const CUE_FIXTURES: [number, number, Speaker, string, string, string][] = [
  [1_200, 5_600, 'MAYA', 'Thanks for sitting down\\nwith us again, Andre.', 'Gracias por acompañarnos\\nde nuevo, Andre.', 'Danke, dass du dir wieder\\nZeit für uns nimmst, Andre.'],
  [6_100, 11_800, 'ANDRE', "Glad to be back. Last time we talked,\\nthe hardware hadn't even taped out.", 'Un placer volver. La última vez,\\nel hardware ni siquiera existía.', 'Gern. Beim letzten Gespräch\\ngab es die Hardware noch gar nicht.'],
  [12_400, 17_300, 'MAYA', 'Six months in — what surprised you most?', 'Seis meses después,\\n¿qué te sorprendió más?', 'Sechs Monate später —\\nwas hat dich am meisten überrascht?'],
  [17_700, 19_700, 'ANDRE', 'We sold out the first run\\nin under four hours.', 'Agotamos la primera tirada\\nen menos de cuatro horas.', 'Die erste Auflage war in\\nweniger als vier Stunden weg.'],
  [20_300, 26_900, 'ANDRE', 'And not to collectors — to schools,\\nto repair shops, to people who use it.', 'Y no a coleccionistas: a escuelas,\\na talleres, a gente que lo usa.', 'Und nicht an Sammler — an Schulen,\\nWerkstätten, an Leute, die es nutzen.'],
  [46_800, 51_900, 'MAYA', 'So where does the budget actually go now?', 'Entonces, ¿a dónde va\\nrealmente el presupuesto?', 'Wohin fließt das Budget\\ndenn jetzt wirklich?'],
  [52_400, 56_100, 'ANDRE', "The budget isn't the number —\\nit's where you spend it.", 'El presupuesto no es la cifra,\\nsino dónde lo gastas.', 'Das Budget ist nicht die Zahl —\\nsondern wofür man es ausgibt.'],
  [56_600, 61_400, 'ANDRE', 'Most of ours goes to testing.\\nUnglamorous, endless testing.', 'Casi todo va a pruebas.\\nPruebas interminables y sin glamur.', 'Das meiste geht in Tests.\\nUnglamouröse, endlose Tests.'],
  [62_000, 68_300, 'MAYA', 'Is that why the recall never happened?', '¿Por eso nunca hubo\\nuna retirada del producto?', 'Gab es deshalb nie\\neinen Rückruf?'],
  [68_900, 74_600, 'ANDRE', "That's exactly why\\nthe recall never happened.", 'Exactamente por eso\\nnunca hubo una retirada.', 'Genau deshalb gab es\\nnie einen Rückruf.'],
  [75_200, 81_500, 'MAYA', "Let's talk about the factory tour video.", 'Hablemos del vídeo\\nde la visita a la fábrica.', 'Reden wir über das Video\\nder Fabrikführung.'],
  [81_200, 87_400, 'ANDRE', 'Ha — the forklift clip.\\nThat was not staged, I promise.', 'Ja — lo de la carretilla.\\nNo fue un montaje, lo prometo.', 'Ha — der Gabelstapler-Clip.\\nDas war nicht gestellt, versprochen.'],
  [88_000, 95_600, 'MAYA', 'It has four million views.\\nMarketing must love you.', 'Tiene cuatro millones de visitas.\\nMarketing debe adorarte.', 'Vier Millionen Aufrufe.\\nDas Marketing muss dich lieben.'],
  [96_200, 103_800, 'ANDRE', "Marketing tolerates me.\\nThere's a difference.", 'Marketing me tolera.\\nHay una diferencia.', 'Das Marketing toleriert mich.\\nDas ist ein Unterschied.'],
  [128_700, 135_400, 'MAYA', 'Last one: what does year two look like?', 'Última pregunta:\\n¿cómo será el segundo año?', 'Letzte Frage:\\nwie sieht Jahr zwei aus?'],
  [151_600, 158_900, 'ANDRE', 'Fewer surprises. Which, in hardware,\\nis the whole dream.', 'Menos sorpresas. Que, en hardware,\\nes el sueño completo.', 'Weniger Überraschungen. Und das ist\\nin der Hardware der ganze Traum.'],
];

const INITIAL_CUES: Cue[] = CUE_FIXTURES.map(
  ([inMs, outMs, speaker, en, es, de], index) => ({
    id: index + 1,
    speaker,
    inMs,
    outMs,
    text: {en, es, de},
  }),
);

/** Fixed camera notes shown on the mock stage, keyed by playhead position. */
const SCENE_NOTES: {untilMs: number; label: string}[] = [
  {untilMs: 20_000, label: 'wide two-shot · set A'},
  {untilMs: 46_000, label: 'b-roll · workshop floor'},
  {untilMs: 90_000, label: 'close-up · Andre'},
  {untilMs: 130_000, label: 'close-up · Maya'},
  {untilMs: Number.POSITIVE_INFINITY, label: 'wide two-shot · set A'},
];

const SPEAKER_BADGE: Record<Speaker, 'blue' | 'purple'> = {
  MAYA: 'blue',
  ANDRE: 'purple',
};

// ============= TIME HELPERS =============

const pad2 = (v: number) => String(v).padStart(2, '0');

/** ms → 'HH:MM:SS.mmm'. */
function formatTimecode(ms: number): string {
  const v = Math.max(0, Math.round(ms));
  const h = Math.floor(v / 3_600_000);
  const m = Math.floor(v / 60_000) % 60;
  const s = Math.floor(v / 1_000) % 60;
  return \`\${pad2(h)}:\${pad2(m)}:\${pad2(s)}.\${String(v % 1000).padStart(3, '0')}\`;
}

/** 'HH:MM:SS.mmm' → ms, or null when the string isn't a full timecode. */
function parseTimecode(value: string): number | null {
  const match = /^(\\d{2}):(\\d{2}):(\\d{2})\\.(\\d{3})$/.exec(value.trim());
  if (match == null) {
    return null;
  }
  const [, h, m, s, ms] = match;
  return (
    Number(h) * 3_600_000 + Number(m) * 60_000 + Number(s) * 1_000 + Number(ms)
  );
}

const durationSec = (cue: Cue) => (cue.outMs - cue.inMs) / 1000;

/** Characters-per-second for one language variant (newlines excluded). */
function cueCps(cue: Cue, lang: LangCode): number {
  return cue.text[lang].replace(/\\n/g, '').length / durationSec(cue);
}

function longestLine(cue: Cue, lang: LangCode): number {
  return Math.max(...cue.text[lang].split('\\n').map(line => line.length));
}

interface CueIssue {
  label: string;
  variant: 'warning' | 'error';
}

/** Live validation: CPS over 17, any line over 42 chars, overlap with next. */
function issuesForCue(cue: Cue, next: Cue | undefined, lang: LangCode): CueIssue[] {
  const issues: CueIssue[] = [];
  const cps = cueCps(cue, lang);
  if (cps > CPS_LIMIT) {
    issues.push({label: \`CPS \${Math.round(cps)}\`, variant: 'warning'});
  }
  const maxLine = longestLine(cue, lang);
  if (maxLine > LINE_LIMIT) {
    issues.push({label: \`\${maxLine}/\${LINE_LIMIT} chars\`, variant: 'error'});
  }
  if (next != null && cue.outMs > next.inMs) {
    issues.push({
      label: \`Overlaps next by \${cue.outMs - next.inMs}ms\`,
      variant: 'error',
    });
  }
  return issues;
}

// ============= TABLE ROW MODEL =============

type CueRow = {
  id: number;
  index: number; // 0-based position in the cue list
  speaker: Speaker;
  inMs: number;
  outMs: number;
  text: string; // active-language variant
  issues: CueIssue[];
};

// ============= PAGE =============

export default function SubtitleCueEditorTemplate() {
  const [cues, setCues] = useState<Cue[]>(INITIAL_CUES);
  const [playheadMs, setPlayheadMs] = useState(INITIAL_PLAYHEAD_MS);
  const [selectedId, setSelectedId] = useState(7);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState('1');
  const [isMuted, setIsMuted] = useState(false);
  const [hasCaptions, setHasCaptions] = useState(true);
  const [lang, setLang] = useState<LangCode>('en');
  const [showIssuesOnly, setShowIssuesOnly] = useState(false);
  // In-flight timecode text while an In/Out TextInput is being edited.
  const [timeDraft, setTimeDraft] = useState<{
    cueId: number;
    field: 'in' | 'out';
    value: string;
  } | null>(null);

  const isStacked = useMediaQuery('(max-width: 1100px)');
  const isCompact = useMediaQuery('(max-width: 768px)');
  // 40px thumb targets on phones; undefined keeps the 28px desktop box.
  const tapTargetStyle = isCompact ? styles.tapTarget : undefined;
  const wideTapTargetStyle = isCompact ? styles.tapTargetWide : undefined;

  // ---- derived state ----
  const activeCue =
    cues.find(cue => cue.inMs <= playheadMs && playheadMs < cue.outMs) ?? null;
  const selectedIndex = Math.max(
    0,
    cues.findIndex(cue => cue.id === selectedId),
  );
  const selectedCue = cues[selectedIndex];
  const nextOfSelected = cues[selectedIndex + 1];

  const rows: CueRow[] = cues.map((cue, index) => ({
    id: cue.id,
    index,
    speaker: cue.speaker,
    inMs: cue.inMs,
    outMs: cue.outMs,
    text: cue.text[lang],
    issues: issuesForCue(cue, cues[index + 1], lang),
  }));
  const issueCount = rows.reduce((sum, row) => sum + row.issues.length, 0);
  const hasErrorIssue = rows.some(row =>
    row.issues.some(issue => issue.variant === 'error'),
  );
  const visibleRows = showIssuesOnly
    ? rows.filter(row => row.issues.length > 0)
    : rows;

  const selectedCps = cueCps(selectedCue, lang);
  const selectedLongestLine = longestLine(selectedCue, lang);
  const selectedIssues = issuesForCue(selectedCue, nextOfSelected, lang);

  // ---- playback (UI state only — no media element) ----
  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }
    const stepMs = 100 * Number(rate);
    const timer = setInterval(() => {
      setPlayheadMs(prev => Math.min(DURATION_MS, prev + stepMs));
    }, 100);
    return () => clearInterval(timer);
  }, [isPlaying, rate]);

  useEffect(() => {
    if (playheadMs >= DURATION_MS) {
      setIsPlaying(false);
    }
  }, [playheadMs]);

  // The inspector follows the playhead: entering a cue selects it.
  useEffect(() => {
    const cue = cues.find(c => c.inMs <= playheadMs && playheadMs < c.outMs);
    if (cue != null) {
      setSelectedId(cue.id);
    }
  }, [playheadMs, cues]);

  const seekTo = (ms: number) => {
    setPlayheadMs(Math.min(DURATION_MS, Math.max(0, ms)));
    setTimeDraft(null);
  };

  const skipToCue = (direction: -1 | 1) => {
    const target =
      direction === 1
        ? cues.find(cue => cue.inMs > playheadMs)
        : [...cues].reverse().find(cue => cue.inMs < playheadMs - 400);
    if (target != null) {
      seekTo(target.inMs);
      setSelectedId(target.id);
    }
  };

  // Space toggles play, J/K jump between cues (skipped while typing).
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target != null &&
        /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(target.tagName)
      ) {
        return;
      }
      if (event.key === ' ') {
        event.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (event.key === 'j') {
        skipToCue(-1);
      } else if (event.key === 'k') {
        skipToCue(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // skipToCue is recreated per render from these two values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cues, playheadMs]);

  // ---- cue edits ----
  const updateCue = (id: number, update: (cue: Cue) => Cue) => {
    setCues(prev => prev.map(cue => (cue.id === id ? update(cue) : cue)));
  };

  const nudge = (field: 'in' | 'out', deltaMs: number) => {
    setTimeDraft(null);
    updateCue(selectedId, cue =>
      field === 'in'
        ? {
            ...cue,
            inMs: Math.min(cue.outMs - 100, Math.max(0, cue.inMs + deltaMs)),
          }
        : {...cue, outMs: Math.max(cue.inMs + 100, cue.outMs + deltaMs)},
    );
  };

  const handleTimecodeChange = (field: 'in' | 'out', value: string) => {
    setTimeDraft({cueId: selectedId, field, value});
    const parsed = parseTimecode(value);
    if (parsed == null) {
      return;
    }
    updateCue(selectedId, cue =>
      field === 'in'
        ? {...cue, inMs: Math.min(cue.outMs - 100, Math.max(0, parsed))}
        : {...cue, outMs: Math.max(cue.inMs + 100, parsed)},
    );
  };

  const timecodeValue = (field: 'in' | 'out') =>
    timeDraft != null &&
    timeDraft.cueId === selectedId &&
    timeDraft.field === field
      ? timeDraft.value
      : formatTimecode(field === 'in' ? selectedCue.inMs : selectedCue.outMs);

  const handleTextChange = (value: string) => {
    updateCue(selectedId, cue => ({
      ...cue,
      text: {...cue.text, [lang]: value},
    }));
  };

  // ---- footer operations ----
  const addCue = () => {
    const newId = Math.max(...cues.map(cue => cue.id)) + 1;
    const inMs = selectedCue.outMs + 200;
    const cue: Cue = {
      id: newId,
      speaker: selectedCue.speaker === 'MAYA' ? 'ANDRE' : 'MAYA',
      inMs,
      outMs: inMs + 1_600,
      text: {en: '(new cue)', es: '(nueva pista)', de: '(neuer Cue)'},
    };
    setCues(prev => [
      ...prev.slice(0, selectedIndex + 1),
      cue,
      ...prev.slice(selectedIndex + 1),
    ]);
    setSelectedId(newId);
    seekTo(inMs);
  };

  const splitCue = () => {
    const cue = selectedCue;
    const canSplitAtPlayhead =
      playheadMs > cue.inMs + 200 && playheadMs < cue.outMs - 200;
    const splitMs = canSplitAtPlayhead
      ? playheadMs
      : Math.round((cue.inMs + cue.outMs) / 2 / 100) * 100;
    const firstText = {} as Record<LangCode, string>;
    const secondText = {} as Record<LangCode, string>;
    for (const code of LANGS) {
      const lines = cue.text[code].split('\\n');
      firstText[code] = lines[0];
      secondText[code] = lines.length > 1 ? lines.slice(1).join('\\n') : '…';
    }
    const newId = Math.max(...cues.map(c => c.id)) + 1;
    setCues(prev => [
      ...prev.slice(0, selectedIndex),
      {...cue, outMs: splitMs, text: firstText},
      {...cue, id: newId, inMs: splitMs, text: secondText},
      ...prev.slice(selectedIndex + 1),
    ]);
  };

  const mergeCue = () => {
    if (nextOfSelected == null) {
      return;
    }
    const merged = {} as Record<LangCode, string>;
    for (const code of LANGS) {
      merged[code] =
        \`\${selectedCue.text[code].replace(/\\n/g, ' ')} \${nextOfSelected.text[code].replace(/\\n/g, ' ')}\`;
    }
    setCues(prev => [
      ...prev.slice(0, selectedIndex),
      {...selectedCue, outMs: nextOfSelected.outMs, text: merged},
      ...prev.slice(selectedIndex + 2),
    ]);
  };

  const shiftAll = (deltaMs: number) => {
    setCues(prev =>
      prev.map(cue => ({
        ...cue,
        inMs: Math.max(0, cue.inMs + deltaMs),
        outMs: Math.max(100, cue.outMs + deltaMs),
      })),
    );
  };

  // ---- table ----
  const columns: TableColumn<CueRow>[] = [
    {
      key: 'num',
      header: '#',
      width: pixel(48),
      align: 'end',
      renderCell: row => (
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {row.index + 1}
        </Text>
      ),
    },
    {
      key: 'in',
      header: 'In',
      width: pixel(132),
      renderCell: row => (
        <Text type="code" hasTabularNumbers style={{whiteSpace: 'nowrap'}}>
          {formatTimecode(row.inMs)}
        </Text>
      ),
    },
    {
      key: 'out',
      header: 'Out',
      width: pixel(132),
      renderCell: row => (
        <Text type="code" hasTabularNumbers style={{whiteSpace: 'nowrap'}}>
          {formatTimecode(row.outMs)}
        </Text>
      ),
    },
    {
      key: 'dur',
      header: 'Dur',
      width: pixel(64),
      align: 'end',
      renderCell: row => (
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {((row.outMs - row.inMs) / 1000).toFixed(1)}s
        </Text>
      ),
    },
    {
      key: 'speaker',
      header: 'Speaker',
      width: pixel(96),
      renderCell: row => (
        <Badge label={row.speaker} variant={SPEAKER_BADGE[row.speaker]} />
      ),
    },
    {
      key: 'text',
      header: 'Text',
      // Floor keeps the caption text legible at phone widths; the scroll
      // container (styles.tableScroll) picks up the overflow horizontally.
      width: proportional(2, {minWidth: 220}),
      renderCell: row => (
        <Text type="body" maxLines={1}>
          {row.text.replace(/\\n/g, '  ⏎  ')}
        </Text>
      ),
    },
    {
      key: 'issues',
      header: 'Issues',
      width: pixel(190),
      renderCell: row =>
        row.issues.length === 0 ? (
          <Text type="supporting" color="secondary">
            —
          </Text>
        ) : (
          <HStack gap={1}>
            {row.issues.map(issue => (
              <Badge
                key={issue.label}
                label={issue.label}
                variant={issue.variant}
              />
            ))}
          </HStack>
        ),
    },
  ];

  // Row seek + playhead highlight: clicking a row seats the playhead at the
  // cue's in-time; the row containing the playhead gets the accent wash.
  const rowSeekPlugin: TablePlugin<CueRow> = {
    transformBodyRow: (props, item) => ({
      ...props,
      htmlProps: {
        ...props.htmlProps,
        onClick: () => {
          seekTo(item.inMs);
          setSelectedId(item.id);
        },
        style: {
          ...props.htmlProps.style,
          cursor: 'pointer',
          backgroundColor:
            activeCue != null && item.id === activeCue.id
              ? 'var(--color-accent-muted)'
              : item.id === selectedId
                ? 'var(--color-background-muted)'
                : undefined,
        },
      },
    }),
  };

  const sceneNote =
    SCENE_NOTES.find(note => playheadMs < note.untilMs) ?? SCENE_NOTES[0];

  // ---- inspector ----
  const timecodeField = (field: 'in' | 'out', label: string) => (
    <HStack gap={1} vAlign="end">
      <TextInput
        label={label}
        value={timecodeValue(field)}
        onChange={value => handleTimecodeChange(field, value)}
        onBlur={() => setTimeDraft(null)}
        size="sm"
        width={122}
        style={styles.timecodeInput}
      />
      <IconButton
        label={\`Nudge \${label.toLowerCase()} −100 ms\`}
        tooltip="−100 ms"
        icon={<Icon icon={MinusIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={tapTargetStyle}
        onClick={() => nudge(field, -100)}
      />
      <IconButton
        label={\`Nudge \${label.toLowerCase()} +100 ms\`}
        tooltip="+100 ms"
        icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={tapTargetStyle}
        onClick={() => nudge(field, 100)}
      />
    </HStack>
  );

  const inspector = (
    <Card padding={4}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={2}>Cue {selectedIndex + 1}</Heading>
          </StackItem>
          <Badge
            label={selectedCue.speaker}
            variant={SPEAKER_BADGE[selectedCue.speaker]}
          />
          {activeCue != null && activeCue.id === selectedId && (
            <Badge label="At playhead" variant="info" />
          )}
        </HStack>

        <HStack gap={4} style={{flexWrap: 'wrap'}}>
          {timecodeField('in', 'In')}
          {timecodeField('out', 'Out')}
        </HStack>

        <Field label="Timing" inputID="cue-timing-readout">
          <div id="cue-timing-readout">
            <HStack gap={2} vAlign="center">
              <Text type="supporting" color="secondary" hasTabularNumbers>
                Duration {durationSec(selectedCue).toFixed(1)}s
              </Text>
              <Text type="supporting" color="secondary">
                ·
              </Text>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                CPS {selectedCps.toFixed(1)} / {CPS_LIMIT}
              </Text>
              {selectedCps > CPS_LIMIT && (
                <Badge
                  label={\`CPS \${Math.round(selectedCps)}\`}
                  variant="warning"
                />
              )}
            </HStack>
          </div>
        </Field>

        <TextArea
          label={\`Cue text (\${LANGUAGE_OPTIONS.find(o => o.value === lang)?.label})\`}
          value={selectedCue.text[lang]}
          onChange={handleTextChange}
          rows={3}
          description="One caption line per row — two lines max on screen."
        />
        <FieldStatus
          variant="detached"
          type={selectedLongestLine > LINE_LIMIT ? 'error' : 'success'}
          message={
            selectedLongestLine > LINE_LIMIT
              ? \`Longest line \${selectedLongestLine}/\${LINE_LIMIT} characters — over limit\`
              : \`Longest line \${selectedLongestLine}/\${LINE_LIMIT} characters\`
          }
        />

        {selectedIssues.some(issue => issue.label.startsWith('Overlaps')) && (
          <FieldStatus
            variant="detached"
            type="error"
            message={\`Out-time overlaps cue \${selectedIndex + 2} — pull it back or nudge the next cue.\`}
          />
        )}
      </VStack>
    </Card>
  );

  // ---- stage ----
  const stage = (
    <VStack
      gap={2}
      style={isStacked ? styles.stageColumn : styles.stageColumnCapped}>
      <Card padding={0} style={styles.stageCard}>
        <AspectRatio ratio={16 / 9}>
          <div style={styles.stage}>
            <div style={styles.stageGlow} aria-hidden />
            <span style={styles.sceneNote}>{sceneNote.label}</span>
            <span style={styles.timecodeChip}>
              {formatTimecode(playheadMs)}
            </span>
            {hasCaptions && activeCue != null && (
              <div style={styles.captionPill}>{activeCue.text[lang]}</div>
            )}
          </div>
        </AspectRatio>
      </Card>

      <HStack gap={1} vAlign="center" style={styles.transportRow}>
        <IconButton
          label="Previous cue"
          tooltip="Previous cue · J"
          icon={<Icon icon={SkipBackIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          style={tapTargetStyle}
          onClick={() => skipToCue(-1)}
        />
        <Tooltip
          content={
            <HStack gap={2} vAlign="center">
              <Text type="supporting" color="inherit">
                {isPlaying ? 'Pause' : 'Play'}
              </Text>
              <Kbd keys="space" />
            </HStack>
          }>
          <IconButton
            label={isPlaying ? 'Pause' : 'Play'}
            icon={
              <Icon
                icon={isPlaying ? PauseIcon : PlayIcon}
                size="sm"
                color="inherit"
              />
            }
            variant="secondary"
            size="sm"
            style={tapTargetStyle}
            onClick={() => setIsPlaying(prev => !prev)}
          />
        </Tooltip>
        <IconButton
          label="Next cue"
          tooltip="Next cue · K"
          icon={<Icon icon={SkipForwardIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          style={tapTargetStyle}
          onClick={() => skipToCue(1)}
        />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {formatTimecode(playheadMs)} / {formatTimecode(DURATION_MS)}
          {isPlaying ? \` · playing \${rate}×\` : ''}
        </Text>
        <StackItem size="fill">
          <span />
        </StackItem>
        <SegmentedControl
          label="Playback rate"
          value={rate}
          onChange={setRate}
          size="sm">
          <SegmentedControlItem value="0.5" label="0.5×" />
          <SegmentedControlItem value="1" label="1×" />
          <SegmentedControlItem value="1.5" label="1.5×" />
        </SegmentedControl>
        <IconButton
          label={isMuted ? 'Unmute' : 'Mute'}
          tooltip={isMuted ? 'Unmute' : 'Mute'}
          icon={
            <Icon
              icon={isMuted ? VolumeXIcon : Volume2Icon}
              size="sm"
              color="inherit"
            />
          }
          variant="ghost"
          size="sm"
          style={tapTargetStyle}
          onClick={() => setIsMuted(prev => !prev)}
        />
        <IconButton
          label={hasCaptions ? 'Hide captions' : 'Show captions'}
          tooltip={hasCaptions ? 'Hide captions' : 'Show captions'}
          icon={<Icon icon={CaptionsIcon} size="sm" color="inherit" />}
          variant={hasCaptions ? 'secondary' : 'ghost'}
          size="sm"
          style={tapTargetStyle}
          onClick={() => setHasCaptions(prev => !prev)}
        />
      </HStack>

      {/* Cue strip (visual affordance, click to seek) + accessible scrub
          Slider. Blocks tint amber/red when the cue carries an issue. */}
      <VStack gap={1}>
        <div
          style={styles.cueStrip}
          aria-hidden
          onClick={event => {
            const rect = event.currentTarget.getBoundingClientRect();
            const ratio = (event.clientX - rect.left) / rect.width;
            seekTo(Math.round((ratio * DURATION_MS) / 100) * 100);
          }}>
          {rows.map(row => {
            const hasError = row.issues.some(
              issue => issue.variant === 'error',
            );
            const hasWarning = row.issues.some(
              issue => issue.variant === 'warning',
            );
            const isActive = activeCue != null && row.id === activeCue.id;
            return (
              <div
                key={row.id}
                title={\`Cue \${row.index + 1} · \${formatTimecode(row.inMs)}\`}
                style={{
                  ...styles.cueBlock,
                  left: \`\${(row.inMs / DURATION_MS) * 100}%\`,
                  width: \`max(\${((row.outMs - row.inMs) / DURATION_MS) * 100}%, 3px)\`,
                  backgroundColor: hasError
                    ? 'var(--color-error)'
                    : hasWarning
                      ? 'var(--color-warning)'
                      : 'var(--color-accent)',
                  opacity: isActive ? 1 : 0.55,
                }}
              />
            );
          })}
          <div
            style={{
              ...styles.stripPlayhead,
              left: \`\${(playheadMs / DURATION_MS) * 100}%\`,
            }}
          />
        </div>
        <Slider
          label="Playhead"
          isLabelHidden
          min={0}
          max={DURATION_MS}
          step={100}
          value={playheadMs}
          onChange={seekTo}
          formatValue={formatTimecode}
          width="100%"
        />
      </VStack>
    </VStack>
  );

  const upperRegion = (
    <div
      style={{
        ...styles.upperScroll,
        // Desktop: content-height so the cue table owns the leftover space.
        // Stacked: flexible with internal scroll above the fixed-height table.
        flex: isStacked ? '1 1 auto' : '0 0 auto',
      }}>
      {isStacked ? (
        <VStack gap={4}>
          {stage}
          {inspector}
        </VStack>
      ) : (
        <HStack gap={4} vAlign="start">
          <StackItem size="fill" style={styles.stageColumn}>
            {stage}
          </StackItem>
          <div style={styles.inspectorColumn}>{inspector}</div>
        </HStack>
      )}
    </div>
  );

  const tableRegion = (
    <div
      style={{
        ...styles.tableRegion,
        flex: isStacked ? '0 0 45%' : '1 1 auto',
      }}>
      <div style={styles.tableHeaderRow}>
        <HStack gap={3} vAlign="center">
          <Heading level={2}>Cues</Heading>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {cues.length} cues · {formatTimecode(cues[0].inMs)} →{' '}
            {formatTimecode(cues[cues.length - 1].outMs)}
          </Text>
          <StackItem size="fill">
            <span />
          </StackItem>
          <Switch
            label="Show issues only"
            value={showIssuesOnly}
            onChange={setShowIssuesOnly}
          />
        </HStack>
      </div>
      <div style={styles.tableScroll}>
        <Table<CueRow>
          data={visibleRows}
          columns={columns}
          idKey="id"
          density="compact"
          hasHover
          plugins={{rowSeek: rowSeekPlugin}}
          emptyState={
            <Text type="supporting" color="secondary">
              No cues with issues — nice work.
            </Text>
          }
        />
      </div>
    </div>
  );

  const footerToolbar = (
    <Toolbar
      label="Cue operations"
      size="sm"
      gap={1}
      dividers={['top']}
      style={styles.footerToolbar}
      startContent={
        <>
          <Button
            label="Add cue"
            variant="ghost"
            size="sm"
            style={wideTapTargetStyle}
            icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
            onClick={addCue}
          />
          <Button
            label="Split"
            variant="ghost"
            size="sm"
            style={wideTapTargetStyle}
            icon={<Icon icon={SplitIcon} size="sm" color="inherit" />}
            tooltip="Split the selected cue at the playhead"
            onClick={splitCue}
          />
          <Button
            label="Merge"
            variant="ghost"
            size="sm"
            style={wideTapTargetStyle}
            icon={<Icon icon={MergeIcon} size="sm" color="inherit" />}
            tooltip="Merge the selected cue with the next one"
            isDisabled={nextOfSelected == null}
            onClick={mergeCue}
          />
        </>
      }
      endContent={
        <HStack gap={1} vAlign="center">
          <Text type="supporting" color="secondary">
            Shift all
          </Text>
          <IconButton
            label="Shift all cues −100 ms"
            tooltip="−100 ms"
            icon={<Icon icon={ChevronsLeftIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            style={tapTargetStyle}
            onClick={() => shiftAll(-100)}
          />
          <IconButton
            label="Shift all cues +100 ms"
            tooltip="+100 ms"
            icon={<Icon icon={ChevronsRightIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            style={tapTargetStyle}
            onClick={() => shiftAll(100)}
          />
        </HStack>
      }
    />
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" style={styles.headerRow}>
            <StackItem size="fill">
              <HStack gap={2} vAlign="center" style={styles.headerRow}>
                <Icon icon={ClapperboardIcon} size="md" color="secondary" />
                <Heading level={1}>{TRACK_NAME} · captions</Heading>
                <Badge
                  label={\`\${issueCount} \${issueCount === 1 ? 'issue' : 'issues'}\`}
                  variant={
                    hasErrorIssue
                      ? 'error'
                      : issueCount > 0
                        ? 'warning'
                        : 'success'
                  }
                />
              </HStack>
            </StackItem>
            <Selector
              label="Caption language"
              isLabelHidden
              options={LANGUAGE_OPTIONS}
              value={lang}
              onChange={value => setLang(value as LangCode)}
              size="sm"
              width={132}
            />
            {!isCompact && (
              <Button
                label="Preview"
                variant="ghost"
                size="sm"
                icon={<Icon icon={EyeIcon} size="sm" color="inherit" />}
                tooltip="Play the selected cue from its in-time"
                onClick={() => {
                  seekTo(selectedCue.inMs);
                  setIsPlaying(true);
                }}
              />
            )}
            <Button
              label="Export .srt"
              variant="primary"
              size="sm"
              icon={<Icon icon={DownloadIcon} size="sm" color="inherit" />}
              tooltip={\`Download \${TRACK_NAME}.\${lang}.srt\`}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0}>
          <VStack gap={0} style={styles.fill}>
            {upperRegion}
            <Divider />
            {tableRegion}
            {footerToolbar}
          </VStack>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};