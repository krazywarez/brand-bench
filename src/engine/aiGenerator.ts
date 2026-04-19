import type { BrandInputs, BrandOutputs } from '../types';
import type { OllamaSettings } from '../hooks/useSettings';
import { sanitizeOutputs } from '../lib/sanitize';

const SYSTEM_PROMPT = `You are an expert brand strategist and copywriter. Generate a complete brand identity package as a JSON object. Be specific and creative — every output must feel crafted for the exact brand described, not generic. Use the project details to inform all choices: tone, color palette, typography, and messaging.`;

function buildUserPrompt(inputs: BrandInputs): string {
  const lines = [
    'Generate a brand package for this project.',
    '',
    'PROJECT DETAILS:',
    `Name: ${inputs.name || 'Untitled'}`,
    `Category: ${inputs.category || 'general'}`,
    `Purpose: ${inputs.purpose || 'not specified'}`,
    `Target audience: ${inputs.audience || 'not specified'}`,
    inputs.tone.length ? `Tone words: ${inputs.tone.join(', ')}` : '',
    inputs.avoid.length ? `Words/phrases to avoid: ${inputs.avoid.join(', ')}` : '',
    inputs.notes ? `Additional notes: ${inputs.notes}` : '',
    '',
    'Return ONLY a valid JSON object with exactly this structure:',
    '',
    JSON.stringify({
      overview: 'One crisp sentence: what this project is and who it helps',
      positioning: '2–3 sentence strategic positioning statement — what makes this brand distinct',
      tone: {
        attributes: ['attribute1', 'attribute2', 'attribute3', 'attribute4'],
        voiceNotes: '2–3 sentences describing how the brand writes and speaks',
        avoidList: ['thing to never say or do', 'another thing to avoid'],
        examplePhrases: ['A phrase that shows the brand voice', 'Another example', 'A third example'],
      },
      titles: ['Title option 1', 'Title option 2', 'Title option 3'],
      subtitles: ['Subtitle option 1', 'Subtitle option 2', 'Subtitle option 3'],
      taglines: ['Short punchy tagline', 'Alternative tagline', 'Third tagline option'],
      palette: {
        swatches: [
          { id: 's0', name: 'Background', hex: '#hexcode', role: 'background' },
          { id: 's1', name: 'Surface', hex: '#hexcode', role: 'neutral' },
          { id: 's2', name: 'Primary', hex: '#hexcode', role: 'primary' },
          { id: 's3', name: 'Accent', hex: '#hexcode', role: 'accent' },
          { id: 's4', name: 'Text', hex: '#hexcode', role: 'text' },
        ],
      },
      typography: {
        primary: 'Primary font name (e.g. Inter, Playfair Display)',
        secondary: 'Secondary font name or same as primary',
        mono: 'Monospace font name (e.g. JetBrains Mono, Fira Code)',
        pairNote: 'One sentence on why this pairing fits the brand',
      },
      visualDirections: [
        { id: 'v1', name: 'Direction name', description: '2–3 sentence visual direction description', palette: 'Color mood description', typography: 'Type style description', references: 'Visual references and inspirations' },
        { id: 'v2', name: 'Direction name', description: '2–3 sentence description', palette: 'Color mood', typography: 'Type style', references: 'Visual references' },
        { id: 'v3', name: 'Direction name', description: '2–3 sentence description', palette: 'Color mood', typography: 'Type style', references: 'Visual references' },
      ],
      logoConcepts: [
        { id: 'l1', title: 'Logo concept name', concept: 'Concept description and rationale', mark: 'Mark/symbol description', execution: 'Execution and usage guidelines' },
        { id: 'l2', title: 'Second concept name', concept: 'Concept description', mark: 'Mark description', execution: 'Execution guidelines' },
      ],
      usageExamples: [
        { context: 'README headline', text: 'Actual example copy here' },
        { context: 'Landing page hero', text: 'Actual example copy here' },
        { context: 'Social bio', text: 'Actual example copy here' },
        { context: 'Email subject line', text: 'Actual example copy here' },
      ],
      constraints: [
        'A specific copy rule',
        'Another brand constraint',
        'A third constraint',
        'A fourth constraint',
      ],
    }, null, 2),
  ];

  return lines.filter(l => l !== null).join('\n');
}

function validate(raw: unknown): BrandOutputs {
  const result = sanitizeOutputs(raw);
  if (!result) {
    const preview = JSON.stringify(raw)?.slice(0, 300) ?? '(unparseable)';
    throw new Error(`Model returned an unexpected structure. Try a larger model.\n\nGot: ${preview}`);
  }
  return result;
}

export async function generateWithAI(
  inputs: BrandInputs,
  settings: OllamaSettings,
  signal?: AbortSignal,
): Promise<BrandOutputs> {
  // Empty baseUrl means "same origin" — nginx proxies /api/ to Ollama internally.
  // A full URL (e.g. http://localhost:11434) is used as-is for local dev.
  const base = settings.baseUrl ? settings.baseUrl.replace(/\/$/, '') : '';
  const url = `${base}/api/chat`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        model: settings.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(inputs) },
        ],
        format: 'json',
        stream: false,
      }),
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    const target = settings.baseUrl || '(same origin /api/)';
    throw new Error(`Cannot reach Ollama at ${target}. Is it running?`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    if (res.status === 404) throw new Error(`Model "${settings.model}" not found. Pull it first: ollama pull ${settings.model}`);
    throw new Error(`Ollama error ${res.status}: ${text.slice(0, 120)}`);
  }

  const data = await res.json() as { message?: { content?: string } };
  const content = data?.message?.content;
  if (!content) throw new Error('Empty response from Ollama');

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Ollama returned invalid JSON. Try a larger model.');
  }

  // validate() calls sanitizeOutputs(), which injects TYPE_SCALE for fresh AI output
  return validate(parsed);
}

// Test connectivity and return available model names
export async function testOllamaConnection(baseUrl: string): Promise<string[]> {
  const base = baseUrl ? baseUrl.replace(/\/$/, '') : '';
  const url = `${base}/api/tags`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`Ollama responded with ${res.status}`);
  const data = await res.json() as { models?: Array<{ name: string }> };
  return (data.models ?? []).map(m => m.name.replace(/:latest$/, ''));
}
