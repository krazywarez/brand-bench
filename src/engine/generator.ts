import type {
  BrandInputs,
  BrandOutputs,
  ToneGuidance,
  VisualDirection,
  LogoConcept,
  UsageExample,
  ColorPalette,
  ColorSwatch,
  Typography,
  TypographyToken,
} from '../types';
import DIRECTIONS from './directions.json';

type CategoryType = 'developer' | 'creative' | 'product' | 'services' | 'personal' | 'general';

interface GenContext {
  name: string;
  category: string;
  purpose: string;
  audience: string;
  tone: string[];
  avoid: string[];
  notes: string;
  catType: CategoryType;
  hasTone: (t: string) => boolean;
  hasAvoid: (a: string) => boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function detectCategory(raw: string): CategoryType {
  const c = raw.toLowerCase();
  if (/\b(dev|developer|tool|cli|sdk|api|library|lib|framework|plugin|compiler|linter|utility)\b/.test(c))
    return 'developer';
  if (/\b(design|creative|studio|agency|art|visual|branding|illustration|photography)\b/.test(c))
    return 'creative';
  if (/\b(saas|platform|service|app|software|product|startup|dashboard)\b/.test(c))
    return 'product';
  if (/\b(consult|advisory|freelance|firm|practice|coach|training)\b/.test(c))
    return 'services';
  if (/\b(personal|portfolio|blog|brand|me|writer|designer|maker|creator)\b/.test(c))
    return 'personal';
  return 'general';
}

function buildContext(inputs: BrandInputs): GenContext {
  const catType = detectCategory(inputs.category);
  const hasTone = (t: string) =>
    inputs.tone.some(x => x.toLowerCase().includes(t.toLowerCase()));
  const hasAvoid = (a: string) =>
    inputs.avoid.some(x => x.toLowerCase().includes(a.toLowerCase()));

  return {
    name: inputs.name.trim() || 'Untitled',
    category: inputs.category.trim() || 'project',
    purpose: inputs.purpose.trim() || 'solve a specific problem',
    audience: inputs.audience.trim() || 'its intended users',
    tone: inputs.tone,
    avoid: inputs.avoid,
    notes: inputs.notes.trim(),
    catType,
    hasTone,
    hasAvoid,
  };
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  while (result.length < n && copy.length > 0) {
    const i = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(i, 1)[0]);
  }
  return result;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Overview ─────────────────────────────────────────────────────────────────

function generateOverview(ctx: GenContext): string {
  const { name, category, purpose, audience, catType } = ctx;

  const base = pick([
    `${name} is a ${category} for ${audience}. ${cap(purpose)}.`,
    `A ${category} built for ${audience}. ${name} is built to ${purpose}.`,
    `${name} helps ${audience} ${purpose}.`,
    `${name} is a ${category} built to ${purpose}. Made for ${audience}.`,
  ]);

  let suffix = '';
  if (ctx.hasTone('minimal')) suffix = ' Nothing more.';
  else if (ctx.hasTone('technical')) suffix = ' Stays out of the way while doing its job.';
  else if (ctx.hasTone('calm')) suffix = ' Designed to reduce friction, not add to it.';
  else if (ctx.hasTone('bold')) suffix = ' No compromises.';
  else if (ctx.hasTone('warm')) suffix = ' Made with care.';
  else if (catType === 'developer') suffix = ' Built to stay composable and predictable.';
  else if (catType === 'creative') suffix = ' Work that speaks before the introduction.';

  return base + suffix;
}

// ── Positioning ───────────────────────────────────────────────────────────────

function generatePositioning(ctx: GenContext): string {
  const { name, catType } = ctx;

  const templates: Record<CategoryType, string[]> = {
    developer: [
      `${name} sits in the space between "build it yourself" and "platform lock-in." It's a workflow layer, not an abstraction. You keep control; ${name} handles the repetitive parts.`,
      `Most tools in this space try to do too much. ${name} doesn't. It handles exactly what it promises — then stays out of your way.`,
      `${name} is not a platform. It's a tool. You own the infrastructure; ${name} owns the workflow. That distinction matters.`,
    ],
    creative: [
      `${name} is defined by its process as much as its output. The work should be recognizable without a logo — that's the goal.`,
      `${name} occupies a deliberate position: between personal and professional, between output and craft. Not trying to be everything. Trying to be specific.`,
      `There's no shortage of creative work. ${name} earns attention through quality and consistency, not volume or novelty.`,
    ],
    product: [
      `${name} doesn't try to replace your existing workflow. It fits into it. The goal is to reduce friction in a specific, measurable place.`,
      `The space ${name} plays in has no shortage of tools. What it offers is focus — one problem, done well, with clear boundaries.`,
      `${name} is built for people who've tried the alternatives and found them too complicated, too expensive, or too broad.`,
    ],
    services: [
      `${name} is not a generalist practice. It works on a specific type of problem with a specific type of client. That specificity is the positioning.`,
      `Clients come to ${name} when they need someone who has solved this problem before. The brand should communicate experience, not aspiration.`,
      `${name} does one thing well and charges accordingly. Clarity of scope is the offer.`,
    ],
    personal: [
      `${name} is a deliberate presence — not a portfolio, not a platform, not a personal brand in the marketing sense. A clear point of view, consistently expressed.`,
      `${name} doesn't try to appeal to everyone. It's built around a specific set of interests and a specific way of working.`,
      `There are a lot of personal sites. ${name} is distinct by being specific — not broad, not aspirational, not trying to cover every base.`,
    ],
    general: [
      `${name} occupies a clear position: built for a specific audience with a specific need. Not trying to be everything.`,
      `${name} is not for everyone. That's intentional. Clarity of purpose is more valuable than breadth of appeal.`,
    ],
  };

  return pick(templates[catType] ?? templates.general);
}

// ── Tone Guidance ─────────────────────────────────────────────────────────────

function generateToneGuidance(ctx: GenContext): ToneGuidance {
  const { name, purpose, tone, avoid, catType, hasTone } = ctx;

  const voiceMap: Record<string, string> = {
    minimal: 'Short sentences. No adjectives unless load-bearing. Direct.',
    technical: 'Precise nouns, specific verbs. Write for experts. Avoid explaining what the reader already knows.',
    calm: 'Measured pace. Confident statements. No urgency cues. Let the work speak.',
    bold: 'Strong verbs. Active voice. Make a claim and stand behind it.',
    warm: 'Approachable but not casual. Human without being informal.',
    dry: 'Deadpan. Understate. Trust the reader to get it.',
    focused: 'Stay on topic. One idea per sentence. Cut the rest.',
  };

  const catVoiceDefaults: Record<CategoryType, string> = {
    developer: 'Write for engineers. Assume technical literacy. Specificity earns trust.',
    creative: 'Lead with the work. Copy should serve the visual, not explain it.',
    product: 'Clear over clever. Features earn their mention by solving something real.',
    services: "Experience over enthusiasm. What you've done, not what you'll do.",
    personal: 'First person where appropriate. Honest and considered.',
    general: 'Clear, direct, grounded. Earn attention with specificity.',
  };

  const toneVoiceParts = tone.map(t => voiceMap[t.toLowerCase()]).filter(Boolean);
  const voiceNotes =
    toneVoiceParts.length > 0
      ? toneVoiceParts.join(' ')
      : catVoiceDefaults[catType] ?? catVoiceDefaults.general;

  const avoidDefaults: Record<CategoryType, string[]> = {
    developer: ['"seamlessly"', '"game-changing"', '"powerful" as an adjective', 'passive voice'],
    creative: ['"unique"', '"innovative"', '"passion-driven"', 'agency-speak'],
    product: ['"revolutionary"', '"disrupts"', '"leverage"', '"synergy"'],
    services: ['"partner"', '"solutions"', '"holistic"', '"best-in-class"'],
    personal: ['"journey"', '"passionate about"', '"thought leader"', '"excited to announce"'],
    general: ['"world-class"', '"cutting-edge"', '"innovative"', '"paradigm"'],
  };

  const avoidList = [
    ...avoid,
    ...(avoidDefaults[catType] ?? avoidDefaults.general).filter(
      a => !avoid.some(ua => ua.toLowerCase().includes(a.toLowerCase().replace(/"/g, '')))
    ),
  ];

  const phrasesByTone: string[] = [];
  if (hasTone('minimal')) phrasesByTone.push(`"${name}. ${cap(purpose)}."`);
  if (hasTone('technical'))
    phrasesByTone.push('"Typed, composable, deterministic."');
  if (hasTone('calm'))
    phrasesByTone.push('"Reliable tools, clearly documented, quietly maintained."');
  if (hasTone('bold')) phrasesByTone.push('"Pick it up. It works. Put it down."');
  if (hasTone('warm'))
    phrasesByTone.push('"Made for people who care about their tools."');

  const catPhrases: Record<CategoryType, string[]> = {
    developer: [
      '"One command. Done."',
      '"Less ceremony. More output."',
      '"Configure once. Forget about it."',
    ],
    creative: [
      '"The work is the argument."',
      '"No portfolio lorem ipsum."',
      '"Good work, clearly presented."',
    ],
    product: [
      '"It fits where you already work."',
      '"No setup tax."',
      '"Does one thing. Does it well."',
    ],
    services: [
      '"You\'ve seen this problem before. So have we."',
      '"Specific outcomes, clear process."',
      '"We don\'t do vague."',
    ],
    personal: [
      '"This is what I work on."',
      '"Specific interests, honest opinions."',
      '"No personal brand. Just work."',
    ],
    general: [
      '"Built for a reason."',
      '"Useful before impressive."',
      '"Does what it says."',
    ],
  };

  const allPhrases = [
    ...phrasesByTone,
    ...(catPhrases[catType] ?? catPhrases.general),
  ];

  return {
    attributes: tone.length > 0 ? tone : ['direct', 'clear'],
    voiceNotes,
    avoidList,
    examplePhrases: pickN(allPhrases, Math.min(4, allPhrases.length)),
  };
}

// ── Titles ────────────────────────────────────────────────────────────────────

function generateTitles(ctx: GenContext): string[] {
  const { name, category, purpose, audience, hasTone } = ctx;

  const purposeWords = purpose.split(/\s+/);
  const coreVerb = purposeWords[0] ?? 'build';
  const audienceShort = audience.split(/\s+/).slice(0, 3).join(' ');

  // Distinct structural patterns — each must look meaningfully different
  const variants: string[] = [
    `${name} — ${category} for ${audienceShort}`,
    `${name} / ${audience}`,
    `${name}: ${cap(coreVerb)} without ceremony`,
    `${name} for ${audienceShort}`,
    `${name} — built to ${coreVerb}`,
  ];

  // Tone-specific variants
  if (hasTone('minimal')) variants.push(`${name}.`);
  if (hasTone('technical')) {
    variants.push(`${name} — ${category} utility`);
    variants.push(`${name} — ${coreVerb}, ship, repeat`);
  }
  if (hasTone('bold')) {
    variants.push(`${name}. Built for ${audienceShort}.`);
    variants.push(`${name}. No ceremony.`);
  }
  if (hasTone('calm')) variants.push(`${name} — a ${category} for ${audienceShort}`);

  // Deduplicate and ensure first is always bare name
  const pool = variants.filter(v => v !== name);
  const extras = pickN(pool, 2);
  return [name, ...extras];
}

// ── Subtitles ─────────────────────────────────────────────────────────────────

function generateSubtitles(ctx: GenContext): string[] {
  const { name, category, purpose, audience } = ctx;
  const purposeShort = purpose.split(/\s+/).slice(0, 6).join(' ');

  const all: string[] = [
    `${cap(category)} for ${audience}.`,
    `${cap(purpose)}.`,
    `A ${category} built to ${purpose}.`,
    `Built for ${audience} who need to ${purposeShort}.`,
    `${name}: the ${category} for ${audience}.`,
    `${cap(category)}. For ${audience}.`,
    `${cap(purpose)}. No overhead.`,
    `The ${category} for ${audience} who know what they need.`,
  ];

  return pickN(all, 3);
}

// ── Taglines ──────────────────────────────────────────────────────────────────

function generateTaglines(ctx: GenContext): string[] {
  const { category, purpose, audience, catType, hasTone } = ctx;

  const purposeWords = purpose.split(/\s+/);
  const coreVerb = purposeWords[0] ?? 'build';
  // Take only the object noun (skip prepositions like "without", "for", "with")
  const stopWords = new Set(['without', 'with', 'for', 'and', 'or', 'the', 'a', 'an']);
  const coreNounWords = purposeWords.slice(1).filter(w => !stopWords.has(w.toLowerCase()));
  const coreNoun = coreNounWords[0] || 'your work';
  const audienceShort = audience.split(/\s+/).slice(0, 2).join(' ');

  const catTaglines: Record<CategoryType, string[]> = {
    developer: [
      `${cap(coreVerb)}, ship, move on.`,
      `Less boilerplate. More control.`,
      `${cap(category)} that stays out of your way.`,
      `One command. Done.`,
      `Configure once. Forget about it.`,
      `Less ceremony. More output.`,
      `Built for ${audienceShort} who ship.`,
      `${cap(coreNoun)}, no overhead.`,
    ],
    creative: [
      `The work is the argument.`,
      `Good work, clearly presented.`,
      `No introduction needed.`,
      `${cap(coreNoun)}, done properly.`,
      `Craft over noise.`,
      `Say less. Show more.`,
      `Quality, consistently.`,
    ],
    product: [
      `Does one thing. Does it well.`,
      `Fits where you already work.`,
      `No setup tax.`,
      `Built for ${audienceShort}.`,
      `${cap(coreVerb)} without the friction.`,
      `One less problem.`,
      `Useful before impressive.`,
    ],
    services: [
      `You've seen this problem before. So have we.`,
      `Specific outcomes. Clear process.`,
      `Experience, not enthusiasm.`,
      `We don't do vague.`,
      `The result is the product.`,
      `Built for the problem you actually have.`,
    ],
    personal: [
      `This is what I work on.`,
      `Specific interests. Honest opinions.`,
      `Work, not performance.`,
      `Making things that matter.`,
      `No brand. Just work.`,
    ],
    general: [
      `Built for a reason.`,
      `Useful before impressive.`,
      `Does what it says.`,
      `${cap(coreVerb)} without the noise.`,
      `For ${audienceShort} who know what they want.`,
    ],
  };

  const toneTaglines: string[] = [];
  if (hasTone('minimal')) toneTaglines.push(`${cap(coreVerb)}. Ship.`, `Simple by design.`);
  if (hasTone('calm'))
    toneTaglines.push(`Reliable tools, quietly maintained.`, `Steady. Dependable. Yours.`);
  if (hasTone('bold'))
    toneTaglines.push(`Pick it up. It works.`, `No compromises.`, `Built to be used.`);
  if (hasTone('technical'))
    toneTaglines.push(`Typed. Composable. Predictable.`, `Deterministic by design.`);

  const pool = [...(catTaglines[catType] ?? catTaglines.general), ...toneTaglines];
  return pickN(pool, 3);
}

// ── Visual Directions ─────────────────────────────────────────────────────────

function generateVisualDirections(ctx: GenContext): VisualDirection[] {
  const { catType, hasTone } = ctx;

  const allDirections: VisualDirection[] = [];

  if (catType === 'developer' || hasTone('technical') || hasTone('minimal')) {
    allDirections.push(...DIRECTIONS.technical);
  }
  if (catType === 'creative' || catType === 'personal') {
    allDirections.push(...DIRECTIONS.creative);
  }
  if (catType === 'product' || catType === 'services') {
    allDirections.push(...DIRECTIONS.product);
  }
  if (allDirections.length === 0) {
    allDirections.push(...DIRECTIONS.fallback);
  }

  return pickN(allDirections, Math.min(3, allDirections.length));
}

// ── Logo Concepts ─────────────────────────────────────────────────────────────

function generateLogoConcepts(ctx: GenContext): LogoConcept[] {
  const { name, catType } = ctx;
  const initial = name.charAt(0).toUpperCase();
  const initials =
    name
      .split(/\s+/)
      .slice(0, 2)
      .map(w => w.charAt(0).toUpperCase())
      .join('') || initial;

  const concepts: LogoConcept[] = [];

  if (catType === 'developer') {
    concepts.push(
      {
        id: 'geometric-letterform',
        title: 'Geometric Letterform',
        concept: `The letter "${initial}" treated as a structural element — not styled, just precise. Think grid construction, not calligraphy.`,
        mark: 'Monoweight geometric construction. Works at 16px and 1600px. No gradients, no effects.',
        execution:
          'Build on a strict grid. Consider negative space as intentional, not leftover. Test at 16×16 favicon size first.',
      },
      {
        id: 'wordmark-mono',
        title: 'Wordmark in Mono',
        concept: `"${name}" set in a monospace typeface, tracked slightly loose. The choice of mono is the signal.`,
        mark: 'Wordmark only. No icon. The name is the mark.',
        execution:
          'Try JetBrains Mono, Iosevka, or Commit Mono at medium weight. Adjust tracking. Optically align.',
      },
      {
        id: 'abstract-structure',
        title: 'Abstract Structure',
        concept:
          'A geometric mark suggesting assembly, layering, or composition — aligned with the product metaphor.',
        mark: 'Two or three simple shapes in precise relation. No ornamentation.',
        execution:
          'Explore grid fragments, interlocking forms, or stacked bars. Test inversion on dark and light.',
      }
    );
  } else if (catType === 'creative' || catType === 'personal') {
    concepts.push(
      {
        id: 'custom-wordmark',
        title: 'Custom Wordmark',
        concept: `"${name}" as a custom letterform — not a font off the shelf, but drawn. The craft shows.`,
        mark: 'Wordmark with subtle custom refinements: adjusted spacing, modified terminals, intentional details.',
        execution:
          'Start with a base typeface. Modify key letterforms. The goal is invisible craft, not obvious customization.',
      },
      {
        id: 'monogram',
        title: 'Monogram',
        concept: `"${initials}" as a tight, legible monogram. Simple enough to stamp, refined enough to scale up.`,
        mark: 'Two letterforms in structural relation. Not overlapping decoratively — compositionally.',
        execution:
          'Grid-align. Consider positive/negative figure-ground play. Must read clearly at 24px.',
      }
    );
  } else {
    concepts.push(
      {
        id: 'clean-wordmark',
        title: 'Wordmark',
        concept: `"${name}" set in a well-chosen typeface, thoughtfully spaced. No icon needed.`,
        mark: 'Wordmark. The typeface selection and spacing carry the identity.',
        execution:
          'Choose a typeface with character but not personality. Adjust tracking. Optically center.',
      },
      {
        id: 'initial-mark',
        title: `"${initial}" Mark`,
        concept: `A standalone "${initial}" mark that works as a favicon, app icon, and small-scale identifier.`,
        mark: 'Single letter, geometric or structured. Consistent weight with wordmark.',
        execution:
          'Build on an 8-unit grid. Test at 16px, 32px, and 512px. Must work in one color.',
      }
    );
  }

  concepts.push({
    id: 'symbol-plus-wordmark',
    title: 'Symbol + Wordmark System',
    concept:
      'A mark system: standalone symbol for small contexts, symbol + name for full contexts. Flexible.',
    mark: 'Two formats: symbol alone, symbol left-aligned with wordmark right.',
    execution:
      'Define the relationship (size ratio, spacing) precisely. Lock it. Never deviate. Test both formats in context.',
  });

  return pickN(concepts, 2);
}

// ── Usage Examples ────────────────────────────────────────────────────────────

function generateUsageExamples(ctx: GenContext): UsageExample[] {
  const { name, category, purpose, audience, catType } = ctx;
  // Take a clean verb phrase for landing copy — stop before prepositions
  const stopWords = new Set(['without', 'for', 'with', 'and', 'or', 'the', 'a', 'an', 'via', 'using']);
  const purposeWords = purpose.split(/\s+/);
  const heroWords: string[] = [];
  for (const w of purposeWords) {
    if (stopWords.has(w.toLowerCase()) && heroWords.length > 0) break;
    heroWords.push(w);
  }
  const heroVerb = heroWords.join(' ') || purpose;

  const examples: UsageExample[] = [
    {
      context: 'README header',
      text: `# ${name}\n\n${cap(category)} for ${audience}. ${cap(purpose)}.`,
    },
    {
      context: 'Landing page hero',
      text: `${cap(heroVerb)} without ceremony.\n\n${name} is a ${category} built for ${audience} who need to ${purpose}.`,
    },
    {
      context: 'Social / bio',
      text: `Building ${name} — ${category} for ${audience}. ${cap(purpose)}, no overhead.`,
    },
    {
      context: 'One-liner',
      text: `${name}: ${category} built to ${purpose}.`,
    },
  ];

  if (catType === 'developer') {
    examples.push({
      context: 'Package registry description',
      text: `${name} is a ${category} for ${audience}. ${cap(purpose)}. No configuration required.`,
    });
    examples.push({
      context: 'CLI help text intro',
      text: `${name} — ${cap(purpose)}.`,
    });
  }

  if (catType === 'creative' || catType === 'personal') {
    examples.push({
      context: 'Portfolio about line',
      text: `${name} is the practice of ${audience.split(/\s+/).slice(0, 2).join(' ')} ${heroVerb}.`,
    });
  }

  if (catType === 'product') {
    examples.push({
      context: 'App store description',
      text: `${name} is a ${category} for ${audience}. It ${purpose} — without the complexity of larger platforms.`,
    });
  }

  return examples.slice(0, 6);
}

// ── Constraints ───────────────────────────────────────────────────────────────

function generateConstraints(ctx: GenContext): string[] {
  const { tone, avoid, hasTone } = ctx;
  const list: string[] = [];

  if (tone.length > 0) {
    list.push(`Tone: ${tone.join(', ')}.`);
  }

  if (avoid.length > 0) {
    list.push(`Avoid: ${avoid.join(', ')}.`);
  }

  if (hasTone('minimal')) {
    list.push('Headlines: 6 words maximum.');
    list.push('Body copy: 2 sentences per paragraph maximum.');
  }

  if (hasTone('technical')) {
    list.push('Assume reader has domain knowledge. Skip definitions.');
    list.push('Prefer specific nouns over categorical ones (say the actual thing).');
  }

  if (hasTone('calm')) {
    list.push('No urgency language ("act now", "limited time", "don\'t miss").');
    list.push('No exclamation points.');
  }

  if (hasTone('bold')) {
    list.push('Active voice always. No passive constructions.');
    list.push('Every claim should be substantiable.');
  }

  list.push('No em dashes in casual contexts. Use a period or restructure.');
  list.push('Spell out numbers under 10 in prose. Use numerals for data.');
  list.push('One idea per sentence. Split if in doubt.');

  return list;
}

// ── Typography ────────────────────────────────────────────────────────────────

export const TYPE_SCALE: TypographyToken[] = [
  { label: 'Display',    size: '56px', weight: '700', lineHeight: '1.1',  usage: 'Hero headlines, major landing sections' },
  { label: 'Heading 1',  size: '40px', weight: '700', lineHeight: '1.2',  usage: 'Page titles, primary headers' },
  { label: 'Heading 2',  size: '28px', weight: '600', lineHeight: '1.25', usage: 'Section headers, card titles' },
  { label: 'Heading 3',  size: '20px', weight: '600', lineHeight: '1.3',  usage: 'Sub-section headers, feature titles' },
  { label: 'Body Large', size: '18px', weight: '400', lineHeight: '1.6',  usage: 'Lead paragraphs, key descriptions' },
  { label: 'Body',       size: '16px', weight: '400', lineHeight: '1.65', usage: 'Default body copy' },
  { label: 'Caption',    size: '13px', weight: '400', lineHeight: '1.5',  usage: 'Meta info, timestamps, helper text' },
  { label: 'Label',      size: '11px', weight: '600', lineHeight: '1.4',  usage: 'UI labels, tags, overlines' },
];

type FontPair = { primary: string; secondary: string; mono: string; pairNote: string };

const FONT_PAIRS: Record<string, FontPair[]> = {
  developer: [
    { primary: 'Geist',         secondary: 'Geist',         mono: 'Geist Mono',       pairNote: 'Single-family system. Clean, neutral, interface-optimized.' },
    { primary: 'Inter',         secondary: 'Inter',         mono: 'JetBrains Mono',   pairNote: 'Inter for all UI copy; JetBrains Mono for code.' },
    { primary: 'IBM Plex Sans', secondary: 'IBM Plex Sans', mono: 'IBM Plex Mono',    pairNote: 'IBM Plex family — coherent, technical, widely legible.' },
  ],
  creative: [
    { primary: 'Playfair Display',    secondary: 'Lato',       mono: 'Courier Prime', pairNote: 'High-contrast editorial serif for display; Lato for body.' },
    { primary: 'Fraunces',            secondary: 'DM Sans',    mono: 'DM Mono',       pairNote: 'Optical-size serif for headlines; DM Sans for body. Expressive and modern.' },
    { primary: 'Cormorant Garamond',  secondary: 'Nunito Sans', mono: 'Courier Prime', pairNote: 'Refined luxury serif for display; Nunito Sans for readable body.' },
  ],
  product: [
    { primary: 'Plus Jakarta Sans', secondary: 'Plus Jakarta Sans', mono: 'DM Mono',        pairNote: 'Jakarta Sans at varying weights; DM Mono for data and code.' },
    { primary: 'Inter',             secondary: 'Inter',             mono: 'Fira Code',       pairNote: 'Inter throughout — modern, neutral, excellent hinting.' },
    { primary: 'Manrope',           secondary: 'Manrope',           mono: 'JetBrains Mono',  pairNote: 'Geometric Manrope for all UI; JetBrains Mono for code blocks.' },
  ],
  services: [
    { primary: 'Libre Baskerville', secondary: 'Source Sans 3', mono: 'Source Code Pro', pairNote: 'Baskerville for authority and trust; Source Sans for approachable body.' },
    { primary: 'Merriweather',      secondary: 'Open Sans',     mono: 'Roboto Mono',     pairNote: 'Merriweather for credibility; Open Sans keeps body warm.' },
    { primary: 'Lora',              secondary: 'Nunito Sans',   mono: 'Courier Prime',   pairNote: 'Lora brings warmth to headlines; Nunito Sans lightens the reading.' },
  ],
  personal: [
    { primary: 'Lora',              secondary: 'Nunito',       mono: 'DM Mono',       pairNote: 'Lora for expressive headlines; Nunito for friendly body copy.' },
    { primary: 'DM Serif Display',  secondary: 'DM Sans',      mono: 'DM Mono',       pairNote: 'Unified DM family. Serif display for character; sans for clarity.' },
    { primary: 'Playfair Display',  secondary: 'Source Sans 3', mono: 'Courier Prime', pairNote: 'Playfair adds personality; Source Sans 3 grounds body text.' },
  ],
  general: [
    { primary: 'Inter',             secondary: 'Inter',        mono: 'JetBrains Mono', pairNote: 'Inter throughout with weight variation. Universal starting point.' },
    { primary: 'Plus Jakarta Sans', secondary: 'Lora',         mono: 'Fira Code',      pairNote: 'Geometric sans for UI; Lora serif for long-form content.' },
    { primary: 'Manrope',           secondary: 'Merriweather', mono: 'Source Code Pro', pairNote: 'Friendly geometric sans paired with a trusted editorial serif.' },
  ],
};

function generateTypography(ctx: GenContext): Typography {
  const pairs = FONT_PAIRS[ctx.catType] ?? FONT_PAIRS.general;
  return { ...pick(pairs), scale: TYPE_SCALE };
}

// ── Color Palette ─────────────────────────────────────────────────────────────

function makeSwatches(entries: [string, string, string][]): ColorSwatch[] {
  return entries.map(([name, hex, role], i) => ({ id: `s${i}`, name, hex, role }));
}

type SwatchEntry = [string, string, string]; // [name, hex, role]

/** A six-swatch palette: background, surface, neutral, primary, accent, text. */
function sixTone(
  [background, surface, neutral, primary, accent, text]: [string, string, string, string, string, string],
  neutralName = 'Neutral',
): SwatchEntry[] {
  return [
    ['Background', background, 'background'],
    ['Surface', surface, 'neutral'],
    [neutralName, neutral, 'neutral'],
    ['Primary', primary, 'primary'],
    ['Accent', accent, 'accent'],
    ['Text', text, 'text'],
  ];
}

function generateColorPalette(ctx: GenContext): ColorPalette {
  type PaletteSet = SwatchEntry[][];

  const palettes: Record<string, PaletteSet> = {
    developer: [
      sixTone(['#0d1117', '#161b22', '#30363d', '#58a6ff', '#3fb950', '#f0f6fc'], 'Border'),
      sixTone(['#0a0010', '#160025', '#2d1f3d', '#7c3aed', '#a78bfa', '#e2d9f3']),
      sixTone(['#0a0a0a', '#141414', '#292929', '#e5e5e5', '#c9a96e', '#f5f5f5']),
    ],
    creative: [
      sixTone(['#faf7f2', '#f5efe4', '#e8d9c4', '#c07850', '#4a7c5f', '#1a1410']),
      sixTone(['#0f0f0f', '#1a1a1a', '#2e2e2e', '#ff6b35', '#ffd700', '#f8f8f8']),
      sixTone(['#f8f4ef', '#efe9e0', '#d4c4b0', '#8b5e3c', '#6b8f71', '#2c2018']),
    ],
    product: [
      sixTone(['#fafbfc', '#f0f4f8', '#d1dce8', '#2563eb', '#7c3aed', '#1e293b']),
      sixTone(['#0f172a', '#1e293b', '#334155', '#6366f1', '#22d3ee', '#f1f5f9']),
      sixTone(['#f0fafa', '#e0f5f5', '#b2dede', '#0d9488', '#f59e0b', '#134e4a']),
    ],
    services: [
      sixTone(['#f8fafd', '#edf2fa', '#ccd9ee', '#1d4ed8', '#0f9e6e', '#1a2038']),
      sixTone(['#0c1421', '#152035', '#243450', '#3b82f6', '#34d399', '#f8fafc']),
      sixTone(['#faf8f5', '#f0ebe0', '#d9cdb8', '#78523a', '#2d6a4f', '#1c1410']),
    ],
    personal: [
      sixTone(['#fffef9', '#fdf8ee', '#f0e6cc', '#c9a96e', '#7c9e87', '#2d2d2d']),
      sixTone(['#fafafa', '#f5f5f5', '#e5e5e5', '#171717', '#737373', '#404040']),
      sixTone(['#f9f8ff', '#f0eeff', '#ddd8f7', '#4f46e5', '#ec4899', '#1e1b4b']),
    ],
    general: [
      sixTone(['#111111', '#1a1a1a', '#2e2e2e', '#c9a96e', '#6b8f71', '#dedede']),
      sixTone(['#ffffff', '#f5f5f5', '#e0e0e0', '#1a1a1a', '#3b82f6', '#333333']),
      sixTone(['#0f0f1a', '#1a1a2e', '#252545', '#4f8ef7', '#a78bfa', '#e2e8f0']),
    ],
  };

  const pool = palettes[ctx.catType] ?? palettes.general;
  return { swatches: makeSwatches(pick(pool) as SwatchEntry[]) };
}

// ── Entry point ───────────────────────────────────────────────────────────────

export function generate(inputs: BrandInputs): BrandOutputs {
  const ctx = buildContext(inputs);

  return {
    overview: generateOverview(ctx),
    positioning: generatePositioning(ctx),
    tone: generateToneGuidance(ctx),
    titles: generateTitles(ctx),
    subtitles: generateSubtitles(ctx),
    taglines: generateTaglines(ctx),
    visualDirections: generateVisualDirections(ctx),
    palette: generateColorPalette(ctx),
    typography: generateTypography(ctx),
    logoConcepts: generateLogoConcepts(ctx),
    usageExamples: generateUsageExamples(ctx),
    constraints: generateConstraints(ctx),
  };
}
