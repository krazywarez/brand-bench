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
    allDirections.push(
      {
        id: 'terminal-minimal',
        name: 'Terminal Minimal',
        description:
          'Dark background, monospace type throughout, no ornament. Functional and uncompromising. Every element earns its place.',
        palette: 'Near-black ground (#0d0d0d), off-white text (#e0e0e0), single muted accent (amber or green).',
        typography: 'Monospace primary — JetBrains Mono or Iosevka. Consistent weight. No italic.',
        references: 'htop, k9s, the Stripe CLI, Linear issue view.',
      },
      {
        id: 'technical-document',
        name: 'Technical Document',
        description:
          'Off-white ground, dense information layout, RFC/spec aesthetic. Designed for reading, not scanning. Typography does all the work.',
        palette: 'Warm white (#f5f3ef), dark text (#1a1a1a), minimal color — one functional accent only.',
        typography: 'Sans-serif (Inter or similar) for body, mono for code. Tight line height. Strong hierarchy through size and weight alone.',
        references: 'Stripe docs, Oxide Computer RFCs, GNU manpages reformatted.',
      },
      {
        id: 'precision-interface',
        name: 'Precision Interface',
        description:
          'Neutral mid-range palette, strong grid, engineering-tool aesthetic. Balanced between document and application. Calm but capable.',
        palette: 'Mid-grey ground (#f0f0f0 or #1c1c1c), charcoal type, restrained use of blue or slate as action color.',
        typography: 'Sans-serif for UI, mono for data. Clear size differentiation. No decorative weight use.',
        references: 'Figma sidebar, Retool, Zed editor, TablePlus.',
      }
    );
  }

  if (catType === 'creative' || catType === 'personal') {
    allDirections.push(
      {
        id: 'editorial',
        name: 'Editorial',
        description:
          'Strong typographic hierarchy, restrained palette, print-design influences. Work foreground, everything else background.',
        palette: 'Off-white or cream (#f7f4ef), near-black type, accent used once — a single warm or cool tone.',
        typography: 'A good serif for display, neutral sans for body. Generous leading. No decorative fonts.',
        references: 'Are.na, Typewolf, Emigre back catalog, Letterform Archive.',
      },
      {
        id: 'quiet-studio',
        name: 'Quiet Studio',
        description:
          'Neutral and considered. Nothing decorative. Space used to direct attention, not fill it.',
        palette: 'Warm white (#fafaf8) or deep neutral (#141414), type-only color use. No gradients.',
        typography: 'One typeface family, two weights. Let leading and spacing create rhythm.',
        references: 'Pentagram case studies, Swiss International Style, Muji product design.',
      },
      {
        id: 'contemporary-craft',
        name: 'Contemporary Craft',
        description:
          'Tactile references — paper, grain, texture — applied with restraint. Warmth without nostalgia.',
        palette: 'Off-white base with a warm paper tone, subtle texture overlays, earthy accent.',
        typography: 'Mix: display serif + utility sans. Comfortable reading size. Generous margins.',
        references: 'Oak Studio, Analog, Offscreen Magazine, Present & Correct.',
      }
    );
  }

  if (catType === 'product' || catType === 'services') {
    allDirections.push(
      {
        id: 'focused-product',
        name: 'Focused Product',
        description:
          'Clean, professional, information-forward. Looks like it was built to be used, not to be admired. Trust through clarity.',
        palette: 'White or light grey ground, dark neutral type, one brand color used only for primary actions.',
        typography: 'Neutral sans-serif, systematic sizing, no personality — the product is the personality.',
        references: 'Linear, Cron (v1), Vercel dashboard, Raycast.',
      },
      {
        id: 'minimal-commerce',
        name: 'Minimal Commerce',
        description:
          'Premium restraint. No decorative elements. White space signals quality. Type-driven.',
        palette: 'White ground, black type, one warm accent for selective emphasis.',
        typography: 'A refined sans-serif. Large display size for key claims. Small, tracked caps for labels.',
        references: 'Stripe marketing, Basecamp, Arc browser landing page.',
      },
      {
        id: 'structured-trust',
        name: 'Structured Trust',
        description:
          'Grid-heavy, methodical, legible. Communicates that things are in order. More function, less flourish.',
        palette: 'Light neutral ground, two text weights (body + emphasis), a contained accent color.',
        typography: 'Professional sans-serif — GT Walsheim or Plus Jakarta or similar. Tight tracking for headings.',
        references: 'Harvest app, FreshBooks, Notion, Loom landing page.',
      }
    );
  }

  if (allDirections.length === 0) {
    allDirections.push(
      {
        id: 'type-forward',
        name: 'Type Forward',
        description:
          'Typography as the only design element. No illustration, no photography, no pattern. Words do everything.',
        palette: 'Black and white, one optional accent. No gradients.',
        typography: 'One great typeface. Multiple weights. Extreme size contrast. Nothing else needed.',
        references: 'Early Bloomberg Businessweek covers, Helvetica film poster, The Economist.',
      },
      {
        id: 'system-neutral',
        name: 'System Neutral',
        description:
          'Invisible design — system fonts, default spacing, no signature. The brand is in the content, not the container.',
        palette: 'System defaults. One custom color — the brand color. Everything else inherited.',
        typography: 'System UI stack. Optimized for the OS it runs on.',
        references: 'HN, iA Writer, Pinboard, older Stripe.',
      }
    );
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

function generateColorPalette(ctx: GenContext): ColorPalette {
  type SwatchEntry = [string, string, string]; // [name, hex, role]
  type PaletteSet = SwatchEntry[][];

  const palettes: Record<string, PaletteSet> = {
    developer: [
      [
        ['Background', '#0d1117', 'background'],
        ['Surface', '#161b22', 'neutral'],
        ['Border', '#30363d', 'neutral'],
        ['Primary', '#58a6ff', 'primary'],
        ['Accent', '#3fb950', 'accent'],
        ['Text', '#f0f6fc', 'text'],
      ],
      [
        ['Background', '#0a0010', 'background'],
        ['Surface', '#160025', 'neutral'],
        ['Neutral', '#2d1f3d', 'neutral'],
        ['Primary', '#7c3aed', 'primary'],
        ['Accent', '#a78bfa', 'accent'],
        ['Text', '#e2d9f3', 'text'],
      ],
      [
        ['Background', '#0a0a0a', 'background'],
        ['Surface', '#141414', 'neutral'],
        ['Neutral', '#292929', 'neutral'],
        ['Primary', '#e5e5e5', 'primary'],
        ['Accent', '#c9a96e', 'accent'],
        ['Text', '#f5f5f5', 'text'],
      ],
    ],
    creative: [
      [
        ['Background', '#faf7f2', 'background'],
        ['Surface', '#f5efe4', 'neutral'],
        ['Neutral', '#e8d9c4', 'neutral'],
        ['Primary', '#c07850', 'primary'],
        ['Accent', '#4a7c5f', 'accent'],
        ['Text', '#1a1410', 'text'],
      ],
      [
        ['Background', '#0f0f0f', 'background'],
        ['Surface', '#1a1a1a', 'neutral'],
        ['Neutral', '#2e2e2e', 'neutral'],
        ['Primary', '#ff6b35', 'primary'],
        ['Accent', '#ffd700', 'accent'],
        ['Text', '#f8f8f8', 'text'],
      ],
      [
        ['Background', '#f8f4ef', 'background'],
        ['Surface', '#efe9e0', 'neutral'],
        ['Neutral', '#d4c4b0', 'neutral'],
        ['Primary', '#8b5e3c', 'primary'],
        ['Accent', '#6b8f71', 'accent'],
        ['Text', '#2c2018', 'text'],
      ],
    ],
    product: [
      [
        ['Background', '#fafbfc', 'background'],
        ['Surface', '#f0f4f8', 'neutral'],
        ['Neutral', '#d1dce8', 'neutral'],
        ['Primary', '#2563eb', 'primary'],
        ['Accent', '#7c3aed', 'accent'],
        ['Text', '#1e293b', 'text'],
      ],
      [
        ['Background', '#0f172a', 'background'],
        ['Surface', '#1e293b', 'neutral'],
        ['Neutral', '#334155', 'neutral'],
        ['Primary', '#6366f1', 'primary'],
        ['Accent', '#22d3ee', 'accent'],
        ['Text', '#f1f5f9', 'text'],
      ],
      [
        ['Background', '#f0fafa', 'background'],
        ['Surface', '#e0f5f5', 'neutral'],
        ['Neutral', '#b2dede', 'neutral'],
        ['Primary', '#0d9488', 'primary'],
        ['Accent', '#f59e0b', 'accent'],
        ['Text', '#134e4a', 'text'],
      ],
    ],
    services: [
      [
        ['Background', '#f8fafd', 'background'],
        ['Surface', '#edf2fa', 'neutral'],
        ['Neutral', '#ccd9ee', 'neutral'],
        ['Primary', '#1d4ed8', 'primary'],
        ['Accent', '#0f9e6e', 'accent'],
        ['Text', '#1a2038', 'text'],
      ],
      [
        ['Background', '#0c1421', 'background'],
        ['Surface', '#152035', 'neutral'],
        ['Neutral', '#243450', 'neutral'],
        ['Primary', '#3b82f6', 'primary'],
        ['Accent', '#34d399', 'accent'],
        ['Text', '#f8fafc', 'text'],
      ],
      [
        ['Background', '#faf8f5', 'background'],
        ['Surface', '#f0ebe0', 'neutral'],
        ['Neutral', '#d9cdb8', 'neutral'],
        ['Primary', '#78523a', 'primary'],
        ['Accent', '#2d6a4f', 'accent'],
        ['Text', '#1c1410', 'text'],
      ],
    ],
    personal: [
      [
        ['Background', '#fffef9', 'background'],
        ['Surface', '#fdf8ee', 'neutral'],
        ['Neutral', '#f0e6cc', 'neutral'],
        ['Primary', '#c9a96e', 'primary'],
        ['Accent', '#7c9e87', 'accent'],
        ['Text', '#2d2d2d', 'text'],
      ],
      [
        ['Background', '#fafafa', 'background'],
        ['Surface', '#f5f5f5', 'neutral'],
        ['Neutral', '#e5e5e5', 'neutral'],
        ['Primary', '#171717', 'primary'],
        ['Accent', '#737373', 'accent'],
        ['Text', '#404040', 'text'],
      ],
      [
        ['Background', '#f9f8ff', 'background'],
        ['Surface', '#f0eeff', 'neutral'],
        ['Neutral', '#ddd8f7', 'neutral'],
        ['Primary', '#4f46e5', 'primary'],
        ['Accent', '#ec4899', 'accent'],
        ['Text', '#1e1b4b', 'text'],
      ],
    ],
    general: [
      [
        ['Background', '#111111', 'background'],
        ['Surface', '#1a1a1a', 'neutral'],
        ['Neutral', '#2e2e2e', 'neutral'],
        ['Primary', '#c9a96e', 'primary'],
        ['Accent', '#6b8f71', 'accent'],
        ['Text', '#dedede', 'text'],
      ],
      [
        ['Background', '#ffffff', 'background'],
        ['Surface', '#f5f5f5', 'neutral'],
        ['Neutral', '#e0e0e0', 'neutral'],
        ['Primary', '#1a1a1a', 'primary'],
        ['Accent', '#3b82f6', 'accent'],
        ['Text', '#333333', 'text'],
      ],
      [
        ['Background', '#0f0f1a', 'background'],
        ['Surface', '#1a1a2e', 'neutral'],
        ['Neutral', '#252545', 'neutral'],
        ['Primary', '#4f8ef7', 'primary'],
        ['Accent', '#a78bfa', 'accent'],
        ['Text', '#e2e8f0', 'text'],
      ],
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
