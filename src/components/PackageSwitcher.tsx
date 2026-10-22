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

interface TabMenuProps {
  menu: MenuState;
  canDelete: boolean;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
}

/** A tab's options dropdown, rendered in a portal to escape overflow clipping. */
function TabMenu({ menu, canDelete, onRename, onDuplicate, onDelete, onClose }: TabMenuProps) {
  return createPortal(
    <div
      className="pkg-tab-dropdown"
      style={{ position: 'fixed', top: menu.top, left: menu.left }}
      onClick={e => e.stopPropagation()}
    >
      <button onClick={() => { onRename(); onClose(); }}>Rename</button>
      <button onClick={() => { onDuplicate(); onClose(); }}>Duplicate</button>
      {canDelete && (
        <button className="danger" onClick={() => { onDelete(); onClose(); }}>Delete</button>
      )}
    </div>,
    document.body
  );
}

interface PackageTabProps {
  slot: PackageSlot;
  active: boolean;
  editing: boolean;
  draft: string;
  canRemove: boolean;
  onDraft: (value: string) => void;
  onSwitch: () => void;
  onStartRename: () => void;
  onCommit: () => void;
  onCancel: () => void;
  onMenu: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onRemove: () => void;
}

function PackageTab(props: PackageTabProps) {
  const { slot, active, editing, draft, canRemove } = props;
  return (
    <div
      className={`pkg-tab${active ? ' active' : ''}`}
      onClick={() => !active && props.onSwitch()}
    >
      {editing ? (
        <input
          autoFocus
          className="pkg-tab-input"
          value={draft}
          onChange={e => props.onDraft(e.target.value)}
          onBlur={props.onCommit}
          onKeyDown={e => {
            if (e.key === 'Enter') props.onCommit();
            if (e.key === 'Escape') props.onCancel();
          }}
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <span
          className="pkg-tab-name"
          onDoubleClick={e => { e.stopPropagation(); props.onStartRename(); }}
        >
          {slot.name}
        </span>
      )}

      <div className="pkg-tab-actions">
        <button
          className="pkg-tab-menu-btn"
          title="Options"
          onClick={props.onMenu}
        >
          ···
        </button>
        {canRemove && (
          <button
            className="pkg-tab-close"
            title="Remove"
            onClick={e => { e.stopPropagation(); props.onRemove(); }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
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

  const startRename = (slot: PackageSlot) => {
    setDraft(slot.name);
    setEditingId(slot.id);
  };

  const commitRename = (id: string) => {
    const name = draft.trim();
    if (name) onRename(id, name);
    setEditingId(null);
  };

  return (
    <div className="pkg-switcher">
      {slots.map(slot => (
        <PackageTab
          key={slot.id}
          slot={slot}
          active={slot.id === activeId}
          editing={editingId === slot.id}
          draft={draft}
          canRemove={slots.length > 1}
          onDraft={setDraft}
          onSwitch={() => onSwitch(slot.id)}
          onStartRename={() => startRename(slot)}
          onCommit={() => commitRename(slot.id)}
          onCancel={() => setEditingId(null)}
          onMenu={e => openMenu(slot.id, e)}
          onRemove={() => onRemove(slot.id)}
        />
      ))}

      <button className="pkg-new-btn" onClick={onCreate} title="New package">+</button>

      {menu && (
        <TabMenu
          menu={menu}
          canDelete={slots.length > 1}
          onRename={() => {
            const slot = slots.find(s => s.id === menu.id);
            if (slot) startRename(slot);
          }}
          onDuplicate={() => onDuplicate(menu.id)}
          onDelete={() => onRemove(menu.id)}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  );
}
