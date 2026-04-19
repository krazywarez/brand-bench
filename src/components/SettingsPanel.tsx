import { useState, useEffect } from 'react';
import type { OllamaSettings } from '../hooks/useSettings';
import { testOllamaConnection } from '../engine/aiGenerator';

interface Props {
  settings: OllamaSettings;
  onChange: (next: Partial<OllamaSettings>) => void;
  onClose: () => void;
}

type TestState =
  | { status: 'idle' }
  | { status: 'testing' }
  | { status: 'ok'; models: string[] }
  | { status: 'error'; message: string };

export function SettingsPanel({ settings, onChange, onClose }: Props) {
  const [url, setUrl] = useState(settings.baseUrl);
  const [model, setModel] = useState(settings.model);
  const [test, setTest] = useState<TestState>({ status: 'idle' });

  // Commit field on blur/enter
  const commitUrl = () => onChange({ baseUrl: url });
  const commitModel = (m: string) => { setModel(m); onChange({ model: m }); };

  const runTest = async () => {
    onChange({ baseUrl: url }); // save current URL first
    setTest({ status: 'testing' });
    try {
      const models = await testOllamaConnection(url);
      setTest({ status: 'ok', models });
    } catch (err) {
      setTest({ status: 'error', message: (err as Error).message });
    }
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <span className="settings-title">Settings</span>
          <button className="settings-close" onClick={onClose}>×</button>
        </div>

        <div className="settings-body">
          {/* AI toggle */}
          <div className="settings-section">
            <div className="settings-section-label">AI Generation</div>
            <label className="settings-toggle-row">
              <div className="settings-toggle-info">
                <span className="settings-toggle-name">Use Ollama</span>
                <span className="settings-toggle-desc">
                  Replace template generation with a local AI model
                </span>
              </div>
              <button
                className={`toggle${settings.enabled ? ' on' : ''}`}
                onClick={() => onChange({ enabled: !settings.enabled })}
                role="switch"
                aria-checked={settings.enabled}
              >
                <span className="toggle-thumb" />
              </button>
            </label>
          </div>

          {/* Ollama config */}
          {settings.enabled && (
            <div className="settings-section">
              <div className="settings-section-label">Ollama</div>

              <div className="settings-field">
                <label className="settings-field-label">Server URL</label>
                <div className="settings-field-row">
                  <input
                    className="settings-input"
                    type="url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onBlur={commitUrl}
                    onKeyDown={e => e.key === 'Enter' && commitUrl()}
                    placeholder="empty = same-origin proxy (recommended)"
                    spellCheck={false}
                  />
                  <button
                    className={`btn settings-test-btn${test.status === 'testing' ? ' testing' : ''}`}
                    onClick={runTest}
                    disabled={test.status === 'testing'}
                  >
                    {test.status === 'testing' ? 'Testing…' : 'Test'}
                  </button>
                </div>

                {test.status === 'ok' && (
                  <div className="settings-status ok">
                    Connected · {test.models.length} model{test.models.length !== 1 ? 's' : ''} available
                  </div>
                )}
                {test.status === 'error' && (
                  <div className="settings-status error">{test.message}</div>
                )}
              </div>

              <div className="settings-field">
                <label className="settings-field-label">Model</label>
                <input
                  className="settings-input"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  onBlur={() => commitModel(model)}
                  onKeyDown={e => e.key === 'Enter' && commitModel(model)}
                  placeholder="llama3.2"
                  spellCheck={false}
                />
                {test.status === 'ok' && test.models.length > 0 && (
                  <div className="settings-model-list">
                    {test.models.map(m => (
                      <button
                        key={m}
                        className={`settings-model-item${m === model ? ' active' : ''}`}
                        onClick={() => commitModel(m)}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
                <div className="settings-field-hint">
                  Pull a model first: <code>ollama pull llama3.2</code>
                </div>
              </div>
            </div>
          )}

          {/* Help */}
          <div className="settings-section settings-help">
            <div className="settings-section-label">About Ollama</div>
            <p>
              Ollama runs AI models locally on your machine — no API key, no data sent externally.
              Install from <strong>ollama.com</strong>, then pull any model to get started.
            </p>
            <p>
              Leave <strong>Server URL</strong> empty to route through the app's
              own server (works automatically with the Docker setup). For local
              dev, set it to <code>http://localhost:11434</code> and ensure CORS
              is open: <code>OLLAMA_ORIGINS=* ollama serve</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
