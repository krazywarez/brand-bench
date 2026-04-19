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

export function usePackages() {
  const [store, setStore] = useState<PackagesStore>(loadStore);

  const activeSlot = store.slots.find(s => s.id === store.activeId) ?? store.slots[0];

  // useWorkspace saves directly to each slot's storageKey on every change,
  // so switching just needs to update activeId — no snapshot/copy required.
  const switchTo = useCallback((id: string) => {
    setStore(prev => {
      if (prev.activeId === id) return prev;
      const next = { ...prev, activeId: id };
      saveStore(next);
      return next;
    });
  }, []);

  const createNew = useCallback(() => {
    setStore(prev => {
      const slot = makeSlot(`Package ${prev.slots.length + 1}`);
      // New slot has no data in localStorage — useWorkspace will start fresh
      const next = { activeId: slot.id, slots: [...prev.slots, slot] };
      saveStore(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setStore(prev => {
      if (prev.slots.length <= 1) return prev;
      const target = prev.slots.find(s => s.id === id);
      try { if (target) localStorage.removeItem(target.storageKey); } catch { /* ignore */ }
      const slots = prev.slots.filter(s => s.id !== id);
      const activeId = prev.activeId === id ? slots[0].id : prev.activeId;
      const next = { activeId, slots };
      saveStore(next);
      return next;
    });
  }, []);

  const rename = useCallback((id: string, name: string) => {
    setStore(prev => {
      const slots = prev.slots.map(s => s.id === id ? { ...s, name } : s);
      const next = { ...prev, slots };
      saveStore(next);
      return next;
    });
  }, []);

  const duplicate = useCallback((id: string) => {
    setStore(prev => {
      const source = prev.slots.find(s => s.id === id);
      if (!source) return prev;
      const newSlot = makeSlot(`${source.name} copy`);
      try {
        const data = localStorage.getItem(source.storageKey);
        if (data) localStorage.setItem(newSlot.storageKey, data);
      } catch { /* ignore */ }
      const next = { activeId: newSlot.id, slots: [...prev.slots, newSlot] };
      saveStore(next);
      return next;
    });
  }, []);

  return { slots: store.slots, activeId: store.activeId, activeSlot, switchTo, createNew, remove, rename, duplicate };
}
