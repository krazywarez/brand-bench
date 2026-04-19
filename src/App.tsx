import { useState, useEffect } from 'react';
import { useWorkspace } from './hooks/useWorkspace';
import { usePackages } from './hooks/usePackages';
import { useSettings } from './hooks/useSettings';
import type { PackageSlot } from './hooks/usePackages';
import { InputPanel } from './components/InputPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { PackageSwitcher } from './components/PackageSwitcher';
import { SettingsPanel } from './components/SettingsPanel';
import type { BrandOutputs } from './types';

interface WorkspaceShellProps {
  storageKey: string;
  slots: PackageSlot[];
  activeId: string;
  onSwitch: (id: string) => void;
  onCreate: () => void;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onOpenSettings: () => void;
  aiEnabled: boolean;
}

function WorkspaceShell({
  storageKey, slots, activeId,
  onSwitch, onCreate, onRemove, onRename, onDuplicate,
  onOpenSettings, aiEnabled,
}: WorkspaceShellProps) {
  const {
    inputs, setInputs, outputs, isGenerating, generateMode, generateError,
    locked, runGenerate, cancelGenerate, updateEdit, toggleLock,
    undo, redo, canUndo, canRedo,
  } = useWorkspace(storageKey);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key !== 'z') return;
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const handleEdit = <K extends keyof BrandOutputs>(key: K, value: BrandOutputs[K]) =>
    updateEdit(key, value);

  const generateLabel = isGenerating
    ? 'Cancel'
    : outputs
      ? (aiEnabled ? `Regenerate` : 'Regenerate')
      : (aiEnabled ? 'Generate with AI' : 'Generate');

  return (
    <>
      <header className="app-header">
        <div className="app-header-left">
          <span className="app-wordmark">Brand<span>bench</span></span>
          <PackageSwitcher
            slots={slots} activeId={activeId}
            onSwitch={onSwitch} onCreate={onCreate}
            onRemove={onRemove} onRename={onRename} onDuplicate={onDuplicate}
          />
        </div>
        <div className="app-header-right">
          {outputs && (
            <>
              <button className="btn btn-ghost" onClick={undo} disabled={!canUndo} title="Undo (⌘Z)">Undo</button>
              <button className="btn btn-ghost" onClick={redo} disabled={!canRedo} title="Redo (⌘⇧Z)">Redo</button>
            </>
          )}
          {aiEnabled && (
            <span className="ai-badge" title={`AI mode: ${generateMode}`}>AI</span>
          )}
          <button className="btn btn-ghost settings-open-btn" onClick={onOpenSettings} title="Settings">⚙</button>
        </div>
      </header>

      <div className="app-shell">
        <InputPanel
          inputs={inputs}
          onChange={setInputs}
          onGenerate={isGenerating ? cancelGenerate : runGenerate}
          isGenerating={isGenerating}
          generateLabel={generateLabel}
        />
        <PreviewPanel
          inputs={inputs}
          outputs={outputs}
          locked={locked}
          onToggleLock={toggleLock}
          onEdit={handleEdit}
          isGenerating={isGenerating}
          generateMode={generateMode}
          generateError={generateError}
          onGenerate={runGenerate}
        />
      </div>
    </>
  );
}

export default function App() {
  const { slots, activeId, activeSlot, switchTo, createNew, remove, rename, duplicate } = usePackages();
  const { settings, setSettings } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <WorkspaceShell
        key={activeId}
        storageKey={activeSlot.storageKey}
        slots={slots} activeId={activeId}
        onSwitch={switchTo} onCreate={createNew}
        onRemove={remove} onRename={rename} onDuplicate={duplicate}
        onOpenSettings={() => setSettingsOpen(true)}
        aiEnabled={settings.enabled}
      />
      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </>
  );
}
