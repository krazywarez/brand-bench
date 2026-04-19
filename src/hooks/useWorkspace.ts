import { useState, useCallback, useRef } from 'react';
import type { BrandInputs, BrandOutputs, LockedSections, WorkspaceState } from '../types';
import { generate } from '../engine/generator';
import { generateWithAI } from '../engine/aiGenerator';
import { readSettings } from './useSettings';
import { sanitizeOutputs } from '../lib/sanitize';

const DEFAULT_INPUTS: BrandInputs = {
  name: '',
  category: '',
  purpose: '',
  audience: '',
  tone: [],
  avoid: [],
  notes: '',
};

const DEFAULT_LOCKED: LockedSections = {
  overview: false,
  positioning: false,
  tone: false,
  messaging: false,
  visual: false,
  palette: false,
  typography: false,
  logo: false,
  usage: false,
  constraints: false,
};

function loadState(storageKey: string): Partial<WorkspaceState> {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const state = JSON.parse(raw) as Partial<WorkspaceState>;
      // Always run through sanitizeOutputs — coerces any corrupted/legacy field
      // (e.g. AI-returned objects in string fields) so React never crashes on render.
      if (state.outputs) {
        state.outputs = sanitizeOutputs(state.outputs) ?? null;
        if (!state.outputs) state.edits = {};
      }
      return state;
    }
  } catch { /* ignore */ }
  return {};
}

function saveState(storageKey: string, state: WorkspaceState): void {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* ignore */ }
}

function applyLocks(
  merged: BrandOutputs,
  locked: LockedSections,
  outputs: BrandOutputs | null,
  edits: Partial<BrandOutputs>,
): BrandOutputs {
  if (!outputs) return merged;
  if (locked.overview)    merged.overview    = edits.overview    ?? outputs.overview;
  if (locked.positioning) merged.positioning = edits.positioning ?? outputs.positioning;
  if (locked.tone)        merged.tone        = edits.tone        ?? outputs.tone;
  if (locked.messaging) {
    merged.titles    = edits.titles    ?? outputs.titles;
    merged.subtitles = edits.subtitles ?? outputs.subtitles;
    merged.taglines  = edits.taglines  ?? outputs.taglines;
  }
  if (locked.visual)      merged.visualDirections = edits.visualDirections ?? outputs.visualDirections;
  if (locked.palette)     merged.palette          = edits.palette          ?? outputs.palette;
  if (locked.typography)  merged.typography       = edits.typography       ?? outputs.typography;
  if (locked.logo)        merged.logoConcepts     = edits.logoConcepts     ?? outputs.logoConcepts;
  if (locked.usage)       merged.usageExamples    = edits.usageExamples    ?? outputs.usageExamples;
  if (locked.constraints) merged.constraints      = edits.constraints      ?? outputs.constraints;
  return merged;
}

export function useWorkspace(storageKey = 'bw:workspace') {
  const saved = loadState(storageKey);

  const [inputs, setInputsRaw]   = useState<BrandInputs>(saved.inputs ?? DEFAULT_INPUTS);
  const [outputs, setOutputs]    = useState<BrandOutputs | null>(saved.outputs ?? null);
  const [edits, setEditsRaw]     = useState<Partial<BrandOutputs>>(saved.edits ?? {});
  const [locked, setLocked]      = useState<LockedSections>(saved.locked ?? DEFAULT_LOCKED);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateMode, setGenerateMode] = useState<'template' | string>('template');
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const editStack = useRef<Array<Partial<BrandOutputs>>>([saved.edits ?? {}]);
  const stackIdx  = useRef(0);
  const abortRef  = useRef<AbortController | null>(null);

  const stateRef = useRef({ inputs, outputs, edits, locked });
  stateRef.current = { inputs, outputs, edits, locked };

  const syncUndoRedo = () => {
    setCanUndo(stackIdx.current > 0);
    setCanRedo(stackIdx.current < editStack.current.length - 1);
  };

  const setEdits = useCallback((next: Partial<BrandOutputs>, pushHistory: boolean) => {
    if (pushHistory) {
      editStack.current = editStack.current.slice(0, stackIdx.current + 1);
      editStack.current.push(next);
      stackIdx.current = editStack.current.length - 1;
    }
    setEditsRaw(next);
    syncUndoRedo();
  }, []);

  const persistInputs = useCallback((value: BrandInputs) => {
    const { outputs, edits, locked } = stateRef.current;
    saveState(storageKey, { inputs: value, outputs, edits, locked });
  }, [storageKey]);

  const setInputs = useCallback((next: BrandInputs | ((prev: BrandInputs) => BrandInputs)) => {
    setInputsRaw(prev => {
      const value = typeof next === 'function' ? next(prev) : next;
      persistInputs(value);
      return value;
    });
  }, [persistInputs]);

  const runGenerate = useCallback(async () => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;

    const { inputs, outputs, edits, locked } = stateRef.current;
    const settings = readSettings();

    setIsGenerating(true);
    setGenerateError(null);
    setGenerateMode(settings.enabled ? settings.model : 'template');

    try {
      let newOutputs: BrandOutputs;

      if (settings.enabled) {
        newOutputs = await generateWithAI(inputs, settings, abort.signal);
      } else {
        await new Promise(r => setTimeout(r, 120));
        if (abort.signal.aborted) return;
        newOutputs = generate(inputs);
      }

      if (abort.signal.aborted) return;

      const merged = applyLocks({ ...newOutputs }, locked, outputs, edits);
      setOutputs(merged);
      editStack.current = [{}];
      stackIdx.current  = 0;
      setEditsRaw({});
      syncUndoRedo();
      saveState(storageKey, { inputs, outputs: merged, edits: {}, locked });
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setGenerateError((err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  }, [storageKey]);

  const cancelGenerate = useCallback(() => {
    abortRef.current?.abort();
    setIsGenerating(false);
    setGenerateError(null);
  }, []);

  const updateEdit = useCallback(<K extends keyof BrandOutputs>(key: K, value: BrandOutputs[K]) => {
    const { inputs, outputs, locked } = stateRef.current;
    const next = { ...stateRef.current.edits, [key]: value };
    setEdits(next, true);
    saveState(storageKey, { inputs, outputs, edits: next, locked });
  }, [storageKey, setEdits]);

  const undo = useCallback(() => {
    if (stackIdx.current <= 0) return;
    stackIdx.current -= 1;
    const prev = editStack.current[stackIdx.current];
    const { inputs, outputs, locked } = stateRef.current;
    setEdits(prev, false);
    saveState(storageKey, { inputs, outputs, edits: prev, locked });
  }, [storageKey, setEdits]);

  const redo = useCallback(() => {
    if (stackIdx.current >= editStack.current.length - 1) return;
    stackIdx.current += 1;
    const next = editStack.current[stackIdx.current];
    const { inputs, outputs, locked } = stateRef.current;
    setEdits(next, false);
    saveState(storageKey, { inputs, outputs, edits: next, locked });
  }, [storageKey, setEdits]);

  const toggleLock = useCallback((section: keyof LockedSections) => {
    setLocked(prev => {
      const next = { ...prev, [section]: !prev[section] };
      const { inputs, outputs, edits } = stateRef.current;
      saveState(storageKey, { inputs, outputs, edits, locked: next });
      return next;
    });
  }, [storageKey]);

  const effectiveOutputs: BrandOutputs | null = outputs ? { ...outputs, ...edits } : null;

  return {
    inputs,
    setInputs,
    outputs: effectiveOutputs,
    isGenerating,
    generateMode,
    generateError,
    locked,
    runGenerate,
    cancelGenerate,
    updateEdit,
    toggleLock,
    undo,
    redo,
    canUndo,
    canRedo,
    hasOutput: outputs !== null,
  };
}
