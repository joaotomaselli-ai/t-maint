import { useSyncExternalStore, useCallback } from "react";
import { fmtCurrency } from "@/lib/api";

const KEY = "tmaint:hideMoney";
const listeners = new Set<() => void>();

function getSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

export function toggleMoneyHidden() {
  const next = !getSnapshot();
  window.localStorage.setItem(KEY, next ? "1" : "0");
  listeners.forEach(l => l());
}

export function useMoneyHidden(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export function useMoney() {
  const hidden = useMoneyHidden();
  return useCallback((n: number) => (hidden ? "R$ •••••" : fmtCurrency(n)), [hidden]);
}
