export interface GeneratedImage {
  id: string;
  base64: string;
  prompt: string;
  resolution: string;
  createdAt: number;
}

const HISTORY_KEY = "nano-banana-history";
const MAX_HISTORY_ITEMS = 50;

export function getHistory(): GeneratedImage[] {
  const stored = localStorage.getItem(HISTORY_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveToHistory(image: Omit<GeneratedImage, "id" | "createdAt">): GeneratedImage {
  const history = getHistory();
  const newImage: GeneratedImage = {
    ...image,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };

  // Add to beginning, limit to MAX_HISTORY_ITEMS
  const updatedHistory = [newImage, ...history].slice(0, MAX_HISTORY_ITEMS);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));

  return newImage;
}

export function deleteFromHistory(id: string): void {
  const history = getHistory().filter((img) => img.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (seconds < 60) {
    return "just now";
  } else if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  } else if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  } else {
    return new Date(timestamp).toLocaleDateString();
  }
}
