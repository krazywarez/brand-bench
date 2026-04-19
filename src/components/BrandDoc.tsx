import { useRef, useState } from 'react';
import type { BrandInputs, BrandOutputs, ColorSwatch, LockedSections, Typography } from '../types';
import { CopyButton } from './CopyButton';

// ── Editable text ─────────────────────────────────────────────────────────────

interface EditableProps {
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}

function Editable({ value, onChange, multiline = false }: EditableProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onChange(draft);
  };

  if (!editing) {
    return (
      <div
        className="editable-text"
        onClick={() => { setDraft(value); setEditing(true); }}
        title="Click to edit"
        style={{ whiteSpace: multiline ? 'pre-wrap' : 'normal', padding: '2px 4px', margin: '-2px -4px' }}
      >
        {value}
      </div>
    );
  }

  if (multiline) {
    return (
      <textarea
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        autoFocus
        className="editable-text editing"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Escape') { setEditing(false); setDraft(value); } }}
        style={{
          width: '100%',
          resize: 'vertical',
          minHeight: 80,
          padding: '4px 6px',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 1.65,
          background: 'var(--bg-2)',
          border: '1px solid var(--border-3)',
          borderRadius: 3,
          color: 'var(--text)',
          outline: 'none',
        }}
      />
    );
  }

  return (
    <input
      ref={ref as React.RefObject<HTMLInputElement>}
      autoFocus
      className="editable-text editing"
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') { setEditing(false); setDraft(value); }
      }}
      style={{
        width: '100%',
        padding: '2px 6px',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        background: 'var(--bg-2)',
        border: '1px solid var(--border-3)',
        borderRadius: 3,
        color: 'var(--text)',
        outline: 'none',
      }}
    />
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  locked: boolean;
  onToggleLock: () => void;
  copyText?: string;
  children: React.ReactNode;
}

function Section({ title, locked, onToggleLock, copyText, children }: SectionProps) {
  return (
    <div className={`doc-section${locked ? ' is-locked' : ''}`}>
      <div className="doc-section-header">
        <div className="doc-section-title">{title}</div>
        <div className="doc-section-actions">
          {copyText && <CopyButton text={copyText} label="Copy" />}
          <button
            type="button"
            className={`section-lock${locked ? ' locked' : ''}`}
            onClick={onToggleLock}
            title={locked ? 'Locked — click to unlock' : 'Lock to preserve on regenerate'}
          >
            {locked ? '● locked' : '○ lock'}
          </button>
        </div>
      </div>
      <div className="doc-section-body">
        {children}
      </div>
    </div>
  );
}

// ── Editable list item ────────────────────────────────────────────────────────

interface EditableListProps {
  items: string[];
  onChange: (items: string[]) => void;
  numbered?: boolean;
}

function EditableList({ items, onChange, numbered = true }: EditableListProps) {
  const updateAt = (i: number, v: string) => {
    const next = [...items];
    next[i] = v;
    onChange(next);
  };

  if (numbered) {
    return (
      <div className="numbered-list">
        {items.map((item, i) => (
          <div key={i} className="numbered-item">
            <span className="numbered-item-num">{i + 1}.</span>
            <div
              className="numbered-item-text"
              contentEditable
              suppressContentEditableWarning
              onBlur={e => updateAt(i, e.currentTarget.textContent ?? '')}
              onKeyDown={e => { if (e.key === 'Escape') e.currentTarget.blur(); }}
            >
              {item}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bullet-list">
      {items.map((item, i) => (
        <div key={i} className="bullet-item">
          {item}
        </div>
      ))}
    </div>
  );
}

// ── Typography section ────────────────────────────────────────────────────────

function TypographySection({ typography }: { typography: Typography }) {
  return (
    <div className="type-section">
      <div className="type-fonts">
        <div className="type-font-row">
          <span className="type-font-role">Primary</span>
          <span className="type-font-name">{typography.primary}</span>
        </div>
        {typography.secondary !== typography.primary && (
          <div className="type-font-row">
            <span className="type-font-role">Secondary</span>
            <span className="type-font-name">{typography.secondary}</span>
          </div>
        )}
        <div className="type-font-row">
          <span className="type-font-role">Monospace</span>
          <span className="type-font-name" style={{ fontFamily: 'var(--font-mono)' }}>{typography.mono}</span>
        </div>
        <div className="type-pair-note">{typography.pairNote}</div>
      </div>

      <div className="type-scale">
        <div className="type-scale-header">
          <span>Style</span>
          <span>Size</span>
          <span>Weight</span>
          <span className="type-scale-usage">Usage</span>
        </div>
        {typography.scale.map(token => (
          <div key={token.label} className="type-scale-row">
            <span className="type-scale-label">{token.label}</span>
            <span className="type-scale-size">{token.size}</span>
            <span className="type-scale-weight">{token.weight}</span>
            <span className="type-scale-usage">{token.usage}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Color swatch card ─────────────────────────────────────────────────────────

interface ColorSwatchCardProps {
  swatch: ColorSwatch;
  onChange: (s: ColorSwatch) => void;
  onRemove: () => void;
}

function ColorSwatchCard({ swatch, onChange, onRemove }: ColorSwatchCardProps) {
  const [nameEditing, setNameEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(swatch.name);
  const [hexEditing, setHexEditing] = useState(false);
  const [hexDraft, setHexDraft] = useState(swatch.hex);

  const commitName = () => {
    setNameEditing(false);
    const v = nameDraft.trim();
    if (v && v !== swatch.name) onChange({ ...swatch, name: v });
  };

  const commitHex = () => {
    setHexEditing(false);
    const v = hexDraft.trim().toLowerCase();
    const normalized = v.startsWith('#') ? v : `#${v}`;
    if (/^#[0-9a-f]{6}$/.test(normalized)) {
      onChange({ ...swatch, hex: normalized });
    } else {
      setHexDraft(swatch.hex);
    }
  };

  return (
    <div className="color-swatch-card">
      <div className="color-swatch-preview" style={{ background: swatch.hex }}>
        <input
          type="color"
          className="color-swatch-picker"
          value={swatch.hex}
          onChange={e => onChange({ ...swatch, hex: e.target.value })}
          title="Pick color"
        />
        <button className="color-swatch-remove" onClick={onRemove} title="Remove">×</button>
      </div>
      <div className="color-swatch-info">
        {nameEditing ? (
          <input
            autoFocus
            className="color-swatch-field-input"
            value={nameDraft}
            onChange={e => setNameDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={e => {
              if (e.key === 'Enter') commitName();
              if (e.key === 'Escape') { setNameEditing(false); setNameDraft(swatch.name); }
            }}
          />
        ) : (
          <div className="color-swatch-name" onClick={() => { setNameDraft(swatch.name); setNameEditing(true); }} title="Click to edit">
            {swatch.name}
          </div>
        )}
        {hexEditing ? (
          <input
            autoFocus
            className="color-swatch-field-input color-swatch-hex-input"
            value={hexDraft}
            onChange={e => setHexDraft(e.target.value)}
            onBlur={commitHex}
            onKeyDown={e => {
              if (e.key === 'Enter') commitHex();
              if (e.key === 'Escape') { setHexEditing(false); setHexDraft(swatch.hex); }
            }}
          />
        ) : (
          <div className="color-swatch-hex" onClick={() => { setHexDraft(swatch.hex); setHexEditing(true); }} title="Click to edit">
            {swatch.hex}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main BrandDoc ─────────────────────────────────────────────────────────────

interface Props {
  inputs: BrandInputs;
  outputs: BrandOutputs;
  locked: LockedSections;
  onToggleLock: (section: keyof LockedSections) => void;
  onEdit: <K extends keyof BrandOutputs>(key: K, value: BrandOutputs[K]) => void;
}

export function BrandDoc({ inputs, outputs, locked, onToggleLock, onEdit }: Props) {
  const paletteCopy = outputs.palette.swatches
    .map(s => `${s.name}: ${s.hex}`)
    .join('\n');

  const updateSwatch = (index: number, updated: ColorSwatch) => {
    const swatches = [...outputs.palette.swatches];
    swatches[index] = updated;
    onEdit('palette', { swatches });
  };

  const removeSwatch = (index: number) => {
    const swatches = outputs.palette.swatches.filter((_, i) => i !== index);
    onEdit('palette', { swatches });
  };

  const addSwatch = () => {
    const id = `s${Date.now()}`;
    onEdit('palette', {
      swatches: [...outputs.palette.swatches, { id, name: 'New Color', hex: '#888888', role: 'accent' }],
    });
  };

  const messagingCopy = [
    'Titles:',
    ...outputs.titles.map((t, i) => `${i + 1}. ${t}`),
    '',
    'Taglines:',
    ...outputs.taglines.map((t, i) => `${i + 1}. ${t}`),
  ].join('\n');

  return (
    <div className="brand-doc">
      <div className="brand-doc-header">
        <div className="brand-doc-title">{inputs.name || 'Brand Package'}</div>
        <div className="brand-doc-meta">
          {inputs.category && (
            <span className="brand-doc-meta-item">
              <span className="brand-doc-meta-label">category</span>
              {inputs.category}
            </span>
          )}
          {inputs.audience && (
            <span className="brand-doc-meta-item">
              <span className="brand-doc-meta-label">audience</span>
              {inputs.audience}
            </span>
          )}
        </div>
      </div>

      {/* Overview */}
      <Section title="Overview" locked={locked.overview} onToggleLock={() => onToggleLock('overview')} copyText={outputs.overview}>
        <Editable value={outputs.overview} onChange={v => onEdit('overview', v)} multiline />
      </Section>

      {/* Positioning */}
      <Section title="Positioning" locked={locked.positioning} onToggleLock={() => onToggleLock('positioning')} copyText={outputs.positioning}>
        <Editable value={outputs.positioning} onChange={v => onEdit('positioning', v)} multiline />
      </Section>

      {/* Tone */}
      <Section title="Tone & Voice" locked={locked.tone} onToggleLock={() => onToggleLock('tone')}>
        <div className="tone-grid">
          <div className="tone-row">
            <div className="tone-row-label">Attributes</div>
            <div className="tone-tags">
              {outputs.tone.attributes.map(a => (
                <span key={a} className="tone-tag">{a}</span>
              ))}
            </div>
          </div>
          <div className="tone-row">
            <div className="tone-row-label">Voice</div>
            <div className="tone-row-value">{outputs.tone.voiceNotes}</div>
          </div>
          {outputs.tone.avoidList.length > 0 && (
            <div className="tone-row">
              <div className="tone-row-label">Avoid</div>
              <div className="tone-row-value">{outputs.tone.avoidList.join(', ')}</div>
            </div>
          )}
          {outputs.tone.examplePhrases.length > 0 && (
            <div className="tone-row">
              <div className="tone-row-label">Example phrases</div>
              <div className="tone-phrases">
                {outputs.tone.examplePhrases.map((p, i) => (
                  <div key={i} className="tone-phrase">{p}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Messaging */}
      <Section title="Messaging" locked={locked.messaging} onToggleLock={() => onToggleLock('messaging')} copyText={messagingCopy}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, marginBottom: 10 }}>Titles</div>
            <EditableList items={outputs.titles} onChange={v => onEdit('titles', v)} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, marginBottom: 10 }}>Subtitles</div>
            <EditableList items={outputs.subtitles} onChange={v => onEdit('subtitles', v)} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, marginBottom: 10 }}>Taglines</div>
            <EditableList items={outputs.taglines} onChange={v => onEdit('taglines', v)} />
          </div>
        </div>
      </Section>

      {/* Visual Directions */}
      <Section title="Visual Direction" locked={locked.visual} onToggleLock={() => onToggleLock('visual')}>
        <div className="directions-grid">
          {outputs.visualDirections.map(dir => (
            <div key={dir.id} className="direction-card">
              <div className="direction-name">{dir.name}</div>
              <div className="direction-desc">{dir.description}</div>
              <div className="direction-attrs">
                <div className="direction-attr">
                  <span className="direction-attr-label">Palette</span>
                  <span className="direction-attr-value">{dir.palette}</span>
                </div>
                <div className="direction-attr">
                  <span className="direction-attr-label">Typography</span>
                  <span className="direction-attr-value">{dir.typography}</span>
                </div>
                <div className="direction-attr">
                  <span className="direction-attr-label">References</span>
                  <span className="direction-attr-value">{dir.references}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Color Palette */}
      <Section title="Color Palette" locked={locked.palette} onToggleLock={() => onToggleLock('palette')} copyText={paletteCopy}>
        <div className="color-palette">
          {outputs.palette.swatches.map((swatch, i) => (
            <ColorSwatchCard
              key={swatch.id}
              swatch={swatch}
              onChange={updated => updateSwatch(i, updated)}
              onRemove={() => removeSwatch(i)}
            />
          ))}
          <button className="color-swatch-add" onClick={addSwatch} title="Add color">
            +
          </button>
        </div>
      </Section>

      {/* Typography */}
      <Section title="Typography" locked={locked.typography} onToggleLock={() => onToggleLock('typography')}>
        <TypographySection typography={outputs.typography} />
      </Section>

      {/* Logo Concepts */}
      <Section title="Logo Concepts" locked={locked.logo} onToggleLock={() => onToggleLock('logo')}>
        <div className="logo-grid">
          {outputs.logoConcepts.map(lc => (
            <div key={lc.id} className="logo-card">
              <div className="logo-card-title">{lc.title}</div>
              <div className="logo-card-concept">{lc.concept}</div>
              <div className="logo-card-attrs">
                <div className="logo-card-attr">
                  <span className="logo-card-attr-label">Mark</span>
                  <span className="logo-card-attr-value">{lc.mark}</span>
                </div>
                <div className="logo-card-attr">
                  <span className="logo-card-attr-label">Execution</span>
                  <span className="logo-card-attr-value">{lc.execution}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Usage Examples */}
      <Section title="Usage Examples" locked={locked.usage} onToggleLock={() => onToggleLock('usage')}>
        <div className="usage-grid">
          {outputs.usageExamples.map((ex, i) => (
            <div key={i} className="usage-item">
              <div className="usage-context">{ex.context}</div>
              <div className="usage-text" style={{ position: 'relative' }}>
                {ex.text}
                <div className="usage-copy">
                  <CopyButton text={ex.text} label="Copy" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Constraints */}
      <Section title="Constraints" locked={locked.constraints} onToggleLock={() => onToggleLock('constraints')}>
        <div className="constraints-list">
          {outputs.constraints.map((c, i) => (
            <div key={i} className="constraint-item">{c}</div>
          ))}
        </div>
      </Section>
    </div>
  );
}
