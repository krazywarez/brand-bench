import { useState, useCallback } from 'react';

export interface PackageSlot {
  id: string;
  name: string;
  createdAt: string;
  storageKey: string;
}

interface PackagesStore {
  activeId: string;
  slots: PackageSlot[];
}

const STORE_KEY = 'bw:packages';
const LEGACY_KEY = 'bw:workspace';

function makeId(): string {
  return `pkg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeSlot(name: string, id = makeId()): PackageSlot {
  return { id, name, createdAt: new Date().toISOString(), storageKey: `bw:ws:${id}` };
}

function loadStore(): PackagesStore {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }

  // First run — migrate any legacy single-workspace data into the first slot
  const firstSlot = makeSlot('Package 1');
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) localStorage.setItem(firstSlot.storageKey, legacy);
  } catch { /* ignore */ }

  const store: PackagesStore = { activeId: firstSlot.id, slots: [firstSlot] };
  saveStore(store);
  return store;
}

function saveStore(store: PackagesStore): void {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch { /* ignore */ }
}

function withActive(prev: PackagesStore, id: string): PackagesStore {
  return prev.activeId === id ? prev : { ...prev, activeId: id };
}

function withNewSlot(prev: PackagesStore): PackagesStore {
  const slot = makeSlot(`Package ${prev.slots.length + 1}`);
  // New slot has no data in localStorage — useWorkspace will start fresh
  return { activeId: slot.id, slots: [...prev.slots, slot] };
}

function withoutSlot(prev: PackagesStore, id: string): PackagesStore {
  if (prev.slots.length <= 1) return prev;
  const target = prev.slots.find(s => s.id === id);
  try { if (target) localStorage.removeItem(target.storageKey); } catch { /* ignore */ }
  const slots = prev.slots.filter(s => s.id !== id);
  const activeId = prev.activeId === id ? slots[0].id : prev.activeId;
  return { activeId, slots };
}

function withRenamed(prev: PackagesStore, id: string, name: string): PackagesStore {
  return { ...prev, slots: prev.slots.map(s => s.id === id ? { ...s, name } : s) };
}

function withDuplicate(prev: PackagesStore, id: string): PackagesStore {
  const source = prev.slots.find(s => s.id === id);
  if (!source) return prev;
  const newSlot = makeSlot(`${source.name} copy`);
  try {
    const data = localStorage.getItem(source.storageKey);
    if (data) localStorage.setItem(newSlot.storageKey, data);
  } catch { /* ignore */ }
  return { activeId: newSlot.id, slots: [...prev.slots, newSlot] };
}

export function usePackages() {
  const [store, setStore] = useState<PackagesStore>(loadStore);

  const activeSlot = store.slots.find(s => s.id === store.activeId) ?? store.slots[0];

  // Apply a change and save it; a change that returns the same store is a no-op.
  const update = useCallback((change: (prev: PackagesStore) => PackagesStore) => {
    setStore(prev => {
      const next = change(prev);
      if (next !== prev) saveStore(next);
      return next;
    });
  }, []);

  // useWorkspace saves directly to each slot's storageKey on every change,
  // so switching just needs to update activeId — no snapshot/copy required.
  const switchTo = useCallback((id: string) => update(prev => withActive(prev, id)), [update]);
  const createNew = useCallback(() => update(withNewSlot), [update]);
  const remove = useCallback((id: string) => update(prev => withoutSlot(prev, id)), [update]);
  const rename = useCallback((id: string, name: string) => update(prev => withRenamed(prev, id, name)), [update]);
  const duplicate = useCallback((id: string) => update(prev => withDuplicate(prev, id)), [update]);

  return { slots: store.slots, activeId: store.activeId, activeSlot, switchTo, createNew, remove, rename, duplicate };
}
