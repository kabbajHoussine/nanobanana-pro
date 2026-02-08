export interface Element {
  handle: string; // e.g., "@Riley" (stored with @ prefix)
  base64: string; // base64 image data
  createdAt: number; // timestamp
}

const STORAGE_KEY = "nano-banana-elements";

export function getElements(): Element[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveElement(element: Omit<Element, "createdAt">): Element {
  const elements = getElements();
  const newElement: Element = {
    ...element,
    createdAt: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...elements, newElement]));
  return newElement;
}

export function deleteElement(handle: string): void {
  const elements = getElements().filter((e) => e.handle !== handle);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(elements));
}

export function getElementByHandle(handle: string): Element | undefined {
  return getElements().find((e) => e.handle === handle);
}

export function handleExists(handle: string): boolean {
  return getElements().some((e) => e.handle === handle);
}

export async function migrateElementsToDatabase(
  createElement: (data: { handle: string; base64Image: string }) => Promise<unknown>
): Promise<void> {
  const elements = getElements();
  if (elements.length === 0) return;

  for (const el of elements) {
    await createElement({
      handle: el.handle,
      base64Image: el.base64,
    });
  }
  // Clear localStorage after migration
  localStorage.removeItem(STORAGE_KEY);
}
