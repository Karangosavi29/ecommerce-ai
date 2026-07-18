import { useEffect, useState } from "react";

const STORAGE_KEY = "recently-viewed-ids";
const MAX_ITEMS = 10;

function readIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}


export function recordProductView(productId: string) {
  const existing = readIds().filter((id) => id !== productId);
  const updated = [productId, ...existing].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function useRecentlyViewedIds(): string[] {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(readIds());
  }, []);

  return ids;
}