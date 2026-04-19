import type { BrandInputs, BrandOutputs, LockedSections } from '../types';
import { BrandDoc } from './BrandDoc';
import { CopyButton } from './CopyButton';
import { toMarkdown, toJSON, toHTML, downloadFile } from '../lib/export';

interface Props {
  inputs: BrandInputs;
  outputs: BrandOutputs | null;
  locked: LockedSections;
  onToggleLock: (section: keyof LockedSections) => void;
  onEdit: <K extends keyof BrandOutputs>(key: K, value: BrandOutputs[K]) => void;
  isGenerating: boolean;
  generateMode?: 'template' | string;
  generateError?: string | null;
  onGenerate?: () => void;
}

export function PreviewPanel({ inputs, outputs, locked, onToggleLock, onEdit, isGenerating, generateMode, generateError, onGenerate }: Props) {
  const handleExportMd = () => {
    if (!outputs) return;
    downloadFile(toMarkdown(inputs, outputs), `${inputs.name || 'brand'}-package.md`, 'text/markdown');
  };

  const handleExportJson = () => {
    if (!outputs) return;
    downloadFile(toJSON(inputs, outputs), `${inputs.name || 'brand'}-package.json`, 'application/json');
  };

  const handleExportHtml = () => {
    if (!outputs) return;
    downloadFile(toHTML(inputs, outputs), `${inputs.name || 'brand'}-guidelines.html`, 'text/html');
  };

  const fullMarkdown = outputs ? toMarkdown(inputs, outputs) : '';

  return (
    <div className="preview-panel">
      <div className="preview-toolbar">
        <div className="preview-toolbar-left">
          <span className="preview-doc-label">
            {outputs ? 'Brand Package' : 'Preview'}
          </span>
          {outputs && (
            <span style={{ fontSize: 11, color: 'var(--text-4)' }}>
              · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>
        {outputs && (
          <div className="preview-toolbar-right">
            <CopyButton text={fullMarkdown} label="Copy all" />
          </div>
        )}
      </div>

      {generateError && (
        <div className="generate-error">
          <span className="generate-error-icon">⚠</span>
          <span className="generate-error-msg">{generateError}</span>
          {onGenerate && (
            <button className="generate-error-retry btn btn-ghost" onClick={onGenerate}>
              Try template instead
            </button>
          )}
        </div>
      )}

      <div className="preview-scroll">
        {isGenerating ? (
          <div className="empty-state">
            <div className="empty-state-title" style={{ color: 'var(--text-3)' }}>
              {generateMode && generateMode !== 'template'
                ? `Thinking with ${generateMode}…`
                : 'Generating…'}
            </div>
            {generateMode && generateMode !== 'template' && (
              <div className="empty-state-sub">This may take 15–60 seconds depending on your hardware</div>
            )}
          </div>
        ) : outputs ? (
          <BrandDoc
            inputs={inputs}
            outputs={outputs}
            locked={locked}
            onToggleLock={onToggleLock}
            onEdit={onEdit}
          />
        ) : (
          <div className="empty-state">
            <div className="empty-state-title">No package generated yet</div>
            <div className="empty-state-sub">Fill in the project details and click Generate</div>
          </div>
        )}
      </div>

      {outputs && (
        <div className="export-bar">
          <span className="export-bar-left">
            Export
          </span>
          <div className="export-bar-right">
            <button className="btn" onClick={handleExportMd}>
              Export Markdown
            </button>
            <button className="btn" onClick={handleExportJson}>
              Export JSON
            </button>
            <button className="btn" onClick={handleExportHtml}>
              Export HTML
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
