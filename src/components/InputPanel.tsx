import type { BrandInputs } from '../types';
import { TokenInput } from './TokenInput';

const TONE_SUGGESTIONS = ['minimal', 'technical', 'calm', 'bold', 'warm', 'dry', 'focused', 'sharp'];
const AVOID_SUGGESTIONS = ['buzzwords', 'hype', 'startup language', 'passive voice', 'corporate tone', 'exclamation points', 'superlatives'];

interface Props {
  inputs: BrandInputs;
  onChange: (inputs: BrandInputs) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  generateLabel?: string;
}

export function InputPanel({ inputs, onChange, onGenerate, isGenerating, generateLabel }: Props) {
  const set = <K extends keyof BrandInputs>(key: K) =>
    (value: BrandInputs[K]) => onChange({ ...inputs, [key]: value });

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onGenerate();
    }
  };

  const canGenerate = inputs.name.trim().length > 0 && inputs.purpose.trim().length > 0;

  return (
    <div className="input-panel" onKeyDown={handleKey}>
      <div className="input-section">
        <div className="input-section-label">Project</div>
        <div className="field">
          <label className="field-label" htmlFor="f-name">Name</label>
          <input
            id="f-name"
            className="field-input"
            placeholder="e.g. Foundry"
            value={inputs.name}
            onChange={e => set('name')(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="f-category">Category</label>
          <input
            id="f-category"
            className="field-input"
            placeholder="e.g. developer tool, design studio"
            value={inputs.category}
            onChange={e => set('category')(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="f-purpose">One-line purpose</label>
          <input
            id="f-purpose"
            className="field-input"
            placeholder="e.g. deploy microservices without boilerplate"
            value={inputs.purpose}
            onChange={e => set('purpose')(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="f-audience">Audience</label>
          <input
            id="f-audience"
            className="field-input"
            placeholder="e.g. backend engineers"
            value={inputs.audience}
            onChange={e => set('audience')(e.target.value)}
          />
        </div>
      </div>

      <div className="input-section">
        <div className="input-section-label">Voice</div>
        <div className="field">
          <TokenInput
            label="Tone attributes"
            values={inputs.tone}
            onChange={set('tone')}
            suggestions={TONE_SUGGESTIONS}
            placeholder="Add tone..."
          />
        </div>
        <div className="field" style={{ marginTop: 8 }}>
          <TokenInput
            label="Avoid"
            values={inputs.avoid}
            onChange={set('avoid')}
            suggestions={AVOID_SUGGESTIONS}
            placeholder="Add avoid..."
          />
        </div>
      </div>

      <div className="input-section">
        <div className="input-section-label">Notes</div>
        <div className="field">
          <label className="field-label sr-only" htmlFor="f-notes">Notes & constraints</label>
          <textarea
            id="f-notes"
            className="field-textarea"
            placeholder="Optional: constraints, context, inspirations, or anything the brand package should reflect."
            value={inputs.notes}
            onChange={e => set('notes')(e.target.value)}
            rows={4}
          />
        </div>
      </div>

      <div className="generate-area">
        <button
          className={`btn-generate${isGenerating ? ' generating' : ''}`}
          onClick={onGenerate}
          disabled={!isGenerating && !canGenerate}
          title={!canGenerate ? 'Enter a name and purpose to generate' : 'Generate brand package (⌘Enter)'}
        >
          {generateLabel ?? (isGenerating ? 'Generating…' : 'Generate brand package')}
        </button>
        {!canGenerate && (
          <div style={{ marginTop: 7, fontSize: 11, color: 'var(--text-4)', textAlign: 'center' }}>
            Name and purpose required
          </div>
        )}
        {canGenerate && !isGenerating && (
          <div style={{ marginTop: 7, fontSize: 11, color: 'var(--text-4)', textAlign: 'center' }}>
            ⌘ Enter to generate
          </div>
        )}
      </div>
    </div>
  );
}
