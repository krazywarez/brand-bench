/**
 * Defensive coercion helpers for AI-generated brand outputs.
 * AI models sometimes return structured objects instead of plain strings/arrays;
 * these helpers normalise any value to the expected type so React never receives
 * an object where it expects a renderable child.
 */
import type { BrandOutputs } from '../types';
import { TYPE_SCALE } from '../engine/generator';

// ---------------------------------------------------------------------------
// Primitive coercions
// ---------------------------------------------------------------------------

/** Coerce any value to a non-empty string. */
export function str(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    for (const k of ['text', 'content', 'value', 'description', 'name', 'label']) {
      if (typeof o[k] === 'string' && o[k]) return o[k] as string;
    }
    const vals = Object.values(o).filter(x => typeof x === 'string') as string[];
    if (vals.length) return vals.join(' — ');
  }
  return fallback;
}

/** Coerce any value to an array of non-empty strings. */
export function strArr(v: unknown, fallback: string[] = []): string[] {
  if (Array.isArray(v)) return v.map(x => str(x)).filter(Boolean);
  if (typeof v === 'string' && v) return [v];
  if (v && typeof v === 'object') return [str(v)].filter(Boolean);
  return fallback;
}

function normalizeHex(hex: string): string {
  const h = hex.trim().toLowerCase();
  const clean = h.startsWith('#') ? h : `#${h}`;
  return /^#[0-9a-f]{6}$/.test(clean) ? clean : '#888888';
}

// ---------------------------------------------------------------------------
// Full output sanitiser — safe to call on any untrusted value
// ---------------------------------------------------------------------------

/**
 * Recursively coerce every field of a brand output object to its expected type.
 * Returns `null` if the input is clearly not a valid brand output at all.
 */
export function sanitizeOutputs(raw: unknown): BrandOutputs | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  // Must have at least the core keys to be worth keeping
  if (!r.overview && !r.positioning && !r.tone) return null;

  const tone = (r.tone && typeof r.tone === 'object' ? r.tone : {}) as Record<string, unknown>;
  const typo = (r.typography && typeof r.typography === 'object' ? r.typography : {}) as Record<string, unknown>;
  const palette = (r.palette && typeof r.palette === 'object' ? r.palette : {}) as Record<string, unknown>;

  const swatches = Array.isArray(palette.swatches)
    ? palette.swatches.map((s: unknown, i: number) => {
        const sw = (s && typeof s === 'object' ? s : {}) as Record<string, unknown>;
        return {
          id:   str(sw.id,   `s${i}`),
          name: str(sw.name, 'Color'),
          hex:  normalizeHex(str(sw.hex, '#888888')),
          role: str(sw.role, 'accent'),
        };
      })
    : [];

  if (!swatches.length) return null;

  const visualDirections = Array.isArray(r.visualDirections)
    ? r.visualDirections.map((v: unknown, i: number) => {
        const d = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
        return {
          id:          str(d.id,          `v${i + 1}`),
          name:        str(d.name,        `Direction ${i + 1}`),
          description: str(d.description, ''),
          palette:     str(d.palette,     ''),
          typography:  str(d.typography,  ''),
          references:  str(d.references,  ''),
        };
      })
    : [];

  const logoConcepts = Array.isArray(r.logoConcepts)
    ? r.logoConcepts.map((v: unknown, i: number) => {
        const c = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
        return {
          id:        str(c.id,        `l${i + 1}`),
          title:     str(c.title,     `Concept ${i + 1}`),
          concept:   str(c.concept,   ''),
          mark:      str(c.mark,      ''),
          execution: str(c.execution, ''),
        };
      })
    : [];

  const usageExamples = Array.isArray(r.usageExamples)
    ? r.usageExamples.map((v: unknown) => {
        const e = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
        return {
          context: str(e.context, 'Example'),
          text:    str(e.text,    ''),
        };
      })
    : [];

  // Preserve an existing valid scale (already-saved data) or fall back to default
  const existingScale = Array.isArray(typo.scale) ? typo.scale : TYPE_SCALE;

  return {
    overview:    str(r.overview,    ''),
    positioning: str(r.positioning, ''),
    tone: {
      attributes:     strArr(tone.attributes,     []),
      voiceNotes:     str(tone.voiceNotes,     ''),
      avoidList:      strArr(tone.avoidList,      []),
      examplePhrases: strArr(tone.examplePhrases, []),
    },
    titles:    strArr(r.titles,    []),
    subtitles: strArr(r.subtitles, []),
    taglines:  strArr(r.taglines,  []),
    palette:   { swatches },
    typography: {
      primary:   str(typo.primary,   'Inter'),
      secondary: str(typo.secondary, 'Inter'),
      mono:      str(typo.mono,      'JetBrains Mono'),
      pairNote:  str(typo.pairNote,  ''),
      scale:     existingScale,
    },
    visualDirections,
    logoConcepts,
    usageExamples,
    constraints: strArr(r.constraints, []),
  };
}
