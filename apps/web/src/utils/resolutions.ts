export type AspectRatio = "16:9" | "1:1" | "9:16" | "4:3" | "21:9";
export type Quality = "standard" | "high" | "ultra";

export const ASPECT_RATIOS: {
  value: AspectRatio;
  label: string;
  icon: string;
}[] = [
  { value: "16:9", label: "16:9 (Default)", icon: "Monitor" },
  { value: "1:1", label: "1:1 (Square)", icon: "Square" },
  { value: "9:16", label: "9:16 (Portrait)", icon: "Smartphone" },
  { value: "4:3", label: "4:3 (Standard)", icon: "Image" },
  { value: "21:9", label: "21:9 (Cinematic)", icon: "Film" },
];

export const RESOLUTIONS: Record<AspectRatio, Record<Quality, string>> = {
  "16:9": {
    standard: "1376x768",
    high: "2752x1536",
    ultra: "5504x3072",
  },
  "1:1": {
    standard: "1024x1024",
    high: "2048x2048",
    ultra: "4096x4096",
  },
  "9:16": {
    standard: "768x1376",
    high: "1536x2752",
    ultra: "3072x5504",
  },
  "4:3": {
    standard: "1200x896",
    high: "2400x1792",
    ultra: "4800x3584",
  },
  "21:9": {
    standard: "1584x672",
    high: "3168x1344",
    ultra: "6336x2688",
  },
};

export function getResolution(
  aspectRatio: AspectRatio,
  quality: Quality
): string {
  return RESOLUTIONS[aspectRatio][quality];
}
