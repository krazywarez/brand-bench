import { useState } from 'react';

export interface OllamaSettings {
  enabled: boolean;
  baseUrl: string;
  model: string;
}

const DEFAULTS: OllamaSettings = {
  enabled: false,
  baseUrl: 'http://localhost:11434',
  model: 'llama3.2',
};

const KEY = 'bw:settings';

function load(): OllamaSettings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

// Non-reactive read — used inside callbacks without needing the hook
export function readSettings(): OllamaSettings {
  return load();
}

export function useSettings() {
  const [settings, setSettingsRaw] = useState<OllamaSettings>(load);

  const setSettings = (next: Partial<OllamaSettings>) => {
    const merged = { ...settings, ...next };
    try { localStorage.setItem(KEY, JSON.stringify(merged)); } catch { /* ignore */ }
    setSettingsRaw(merged);
  };

  return { settings, setSettings };
}
