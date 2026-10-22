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
const DEFAULT_SWATCHES = [
  { id: 's0', name: 'Background', hex: '#ffffff', role: 'background' },
  { id: 's1', name: 'Surface',    hex: '#f5f5f5', role: 'neutral'    },
  { id: 's2', name: 'Primary',    hex: '#2563eb', role: 'primary'    },
  { id: 's3', name: 'Accent',     hex: '#7c3aed', role: 'accent'     },
  { id: 's4', name: 'Text',       hex: '#111111', role: 'text'       },
];

/** The value as a plain record, or an empty one if it is not an object. */
function record(v: unknown): Record<string, unknown> {
  return (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
}

/** Unwrap single-key envelopes: {"brand_package": {...}} → {...} */
function unwrapEnvelope(r: Record<string, unknown>): Record<string, unknown> {
  const keys = Object.keys(r);
  if (keys.length === 1 && r[keys[0]] && typeof r[keys[0]] === 'object') {
    return r[keys[0]] as Record<string, unknown>;
  }
  return r;
}

/** Must have at least one recognisable content field. */
const CONTENT_FIELDS = ['overview', 'positioning', 'tone', 'titles', 'palette'];

function mapList<T>(v: unknown, map: (item: Record<string, unknown>, i: number) => T): T[] {
  return Array.isArray(v) ? v.map((item: unknown, i: number) => map(record(item), i)) : [];
}

function sanitizeSwatches(palette: Record<string, unknown>) {
  // Accept swatches under palette.swatches or palette.colors
  const rawSwatches = Array.isArray(palette.swatches) ? palette.swatches
    : Array.isArray(palette.colors) ? palette.colors
    : [];
  if (!rawSwatches.length) return DEFAULT_SWATCHES;
  return mapList(rawSwatches, (sw, i) => ({
    id:   str(sw.id,   `s${i}`),
    name: str(sw.name, 'Color'),
    hex:  normalizeHex(str(sw.hex ?? sw.color ?? sw.value, '#888888')),
    role: str(sw.role ?? sw.type, 'accent'),
  }));
}

export function sanitizeOutputs(raw: unknown): BrandOutputs | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = unwrapEnvelope(raw as Record<string, unknown>);
  if (!CONTENT_FIELDS.some(k => r[k])) return null;

  const tone = record(r.tone);
  const typo = record(r.typography);
  const swatches = sanitizeSwatches(record(r.palette));

  const visualDirections = mapList(r.visualDirections, (d, i) => ({
    id:          str(d.id,          `v${i + 1}`),
    name:        str(d.name,        `Direction ${i + 1}`),
    description: str(d.description, ''),
    palette:     str(d.palette,     ''),
    typography:  str(d.typography,  ''),
    references:  str(d.references,  ''),
  }));

  const logoConcepts = mapList(r.logoConcepts, (c, i) => ({
    id:        str(c.id,        `l${i + 1}`),
    title:     str(c.title,     `Concept ${i + 1}`),
    concept:   str(c.concept,   ''),
    mark:      str(c.mark,      ''),
    execution: str(c.execution, ''),
  }));

  const usageExamples = mapList(r.usageExamples, (e) => ({
    context: str(e.context, 'Example'),
    text:    str(e.text,    ''),
  }));

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
