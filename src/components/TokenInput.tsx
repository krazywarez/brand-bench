import { useState, useRef, KeyboardEvent } from 'react';

interface Props {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}

export function TokenInput({ label, values, onChange, suggestions = [], placeholder = 'Type and press Enter' }: Props) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const add = (val: string) => {
    const trimmed = val.trim().toLowerCase();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setDraft('');
  };

  const remove = (val: string) => {
    onChange(values.filter(v => v !== val));
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && draft.trim()) {
      e.preventDefault();
      add(draft);
    } else if (e.key === 'Backspace' && !draft && values.length > 0) {
      remove(values[values.length - 1]);
    }
  };

  const availableSuggestions = suggestions.filter(s => !values.includes(s));

  return (
    <div className="token-field">
      <label className="field-label">{label}</label>
      <div
        className="token-container"
        onClick={() => inputRef.current?.focus()}
      >
        {values.map(v => (
          <span key={v} className="token">
            {v}
            <button
              type="button"
              className="token-remove"
              onClick={e => { e.stopPropagation(); remove(v); }}
              aria-label={`Remove ${v}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="token-input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => { if (draft.trim()) add(draft); }}
          placeholder={values.length === 0 ? placeholder : ''}
          aria-label={label}
        />
      </div>
      {availableSuggestions.length > 0 && (
        <div className="token-suggestions">
          {availableSuggestions.map(s => (
            <button
              key={s}
              type="button"
              className={`token-suggestion${values.includes(s) ? ' active' : ''}`}
              onClick={() => add(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
