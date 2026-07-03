import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Language Learning Path',
  description:
    "Duolingo-style learning home for the fictional startup Lingora (single amber accent): a header with the lowercase wordmark, ES course chip, and streak-flame / gem / hearts counter chips beside the learner Avatar; a centered amber unit banner (Section 3 · Unit 12 — Ordering at a café, 7/12 lessons) whose Guidebook chip expands three key phrases with audio buttons; then an SVG serpentine trail threading 14 extruded nodes — 7 done amber lessons (listening/speaking glyphs, crown pips), the active star node with halo and floating START callout, 4 locked lessons, an opened treasure chest, and a locked castle checkpoint gate — where selecting any node opens an anchored bubble with Start (+20 XP), Review (+5 XP), or locked messaging. A 340px right rail carries three Cards: streak flame (day 47, Mon–Sun week dots, 2 streak freezes), Sapphire league top-10 with promotion/demotion zones tinted and 'you' at #4 (15 XP back), and daily quests with ProgressBars whose finished quest claims +30 gems straight into the header counter; below 1120px the rail re-renders as a card grid under the trail. Choose over course-lesson-player when the surface is the gamified skill-path home (nodes, streaks, leagues, quests), not an in-lesson video/quiz player; choose over habit-streak-tracker when the streak is one widget inside a language course, not the whole product; choose over nonogram-pixel-reveal or sudoku-logic-coach when progress flows through a curriculum trail rather than a single puzzle board.",
  category: 'Startup Showcase',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'HStack',
    'Heading',
    'Icon',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'LayoutPanel',
    'ProgressBar',
    'StackItem',
    'Text',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
