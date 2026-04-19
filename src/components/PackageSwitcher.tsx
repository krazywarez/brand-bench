import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { PackageSlot } from '../hooks/usePackages';

interface Props {
  slots: PackageSlot[];
  activeId: string;
  onSwitch: (id: string) => void;
  onCreate: () => void;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
}

interface MenuState {
  id: string;
  top: number;
  left: number;
}

export function PackageSwitcher({ slots, activeId, onSwitch, onCreate, onRemove, onRename, onDuplicate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [menu, setMenu] = useState<MenuState | null>(null);

  // Close dropdown on any outside click
  useEffect(() => {
    if (!menu) return;
    const handler = () => setMenu(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [menu]);

  const openMenu = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (menu?.id === id) { setMenu(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenu({ id, top: rect.bottom + 4, left: rect.left });
  };

  const commitRename = (id: string) => {
    const name = draft.trim();
    if (name) onRename(id, name);
    setEditingId(null);
  };

  return (
    <div className="pkg-switcher">
      {slots.map(slot => (
        <div
          key={slot.id}
          className={`pkg-tab${slot.id === activeId ? ' active' : ''}`}
          onClick={() => slot.id !== activeId && onSwitch(slot.id)}
        >
          {editingId === slot.id ? (
            <input
              autoFocus
              className="pkg-tab-input"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={() => commitRename(slot.id)}
              onKeyDown={e => {
                if (e.key === 'Enter') commitRename(slot.id);
                if (e.key === 'Escape') setEditingId(null);
              }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span
              className="pkg-tab-name"
              onDoubleClick={e => {
                e.stopPropagation();
                setDraft(slot.name);
                setEditingId(slot.id);
              }}
            >
              {slot.name}
            </span>
          )}

          <div className="pkg-tab-actions">
            <button
              className="pkg-tab-menu-btn"
              title="Options"
              onClick={e => openMenu(slot.id, e)}
            >
              ···
            </button>
            {slots.length > 1 && (
              <button
                className="pkg-tab-close"
                title="Remove"
                onClick={e => { e.stopPropagation(); onRemove(slot.id); }}
              >
                ×
              </button>
            )}
          </div>
        </div>
      ))}

      <button className="pkg-new-btn" onClick={onCreate} title="New package">+</button>

      {/* Dropdown rendered in a portal to escape overflow clipping */}
      {menu && createPortal(
        <div
          className="pkg-tab-dropdown"
          style={{ position: 'fixed', top: menu.top, left: menu.left }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={() => {
            const slot = slots.find(s => s.id === menu.id);
            if (slot) { setDraft(slot.name); setEditingId(slot.id); }
            setMenu(null);
          }}>Rename</button>
          <button onClick={() => { onDuplicate(menu.id); setMenu(null); }}>Duplicate</button>
          {slots.length > 1 && (
            <button className="danger" onClick={() => { onRemove(menu.id); setMenu(null); }}>Delete</button>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
