"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const STORAGE_KEY = "spotistats-sidebar-collapsed";

export const SIDEBAR_WIDTH_EXPANDED = 240;
export const SIDEBAR_WIDTH_COLLAPSED = 64;

type SidebarContextValue = {
  collapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  sidebarWidth: number;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

let collapsedMemory = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function readStoredCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

if (typeof window !== "undefined") {
  collapsedMemory = readStoredCollapsed();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    collapsedMemory = readStoredCollapsed();
    emit();
  };

  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  return collapsedMemory;
}

function getServerSnapshot() {
  return false;
}

function writeCollapsed(next: boolean) {
  collapsedMemory = next;
  try {
    localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // Ignore storage access errors (private mode, etc.)
  }
  emit();
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const collapsed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        toggleCollapsed: () => writeCollapsed(!getSnapshot()),
        setCollapsed: writeCollapsed,
        sidebarWidth: collapsed
          ? SIDEBAR_WIDTH_COLLAPSED
          : SIDEBAR_WIDTH_EXPANDED,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
