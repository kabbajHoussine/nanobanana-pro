import { useState, useRef, useEffect } from "react";
import type { AspectRatio, Quality } from "@/utils/resolutions";
import { ASPECT_RATIOS, getResolution } from "@/utils/resolutions";
import { Monitor, Square, Smartphone, Image, Film, Check } from "lucide-react";

interface AspectRatioPickerProps {
  aspectRatio: AspectRatio;
  quality: Quality;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onQualityChange: (quality: Quality) => void;
}

const iconMap = {
  Monitor,
  Square,
  Smartphone,
  Image,
  Film,
};

const qualityOptions: { value: Quality; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "high", label: "High" },
  { value: "ultra", label: "Ultra" },
];

export function AspectRatioPicker({
  aspectRatio,
  quality,
  onAspectRatioChange,
  onQualityChange,
}: AspectRatioPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentRatio = ASPECT_RATIOS.find((r) => r.value === aspectRatio);
  const CurrentIcon = currentRatio ? iconMap[currentRatio.icon as keyof typeof iconMap] : Monitor;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm"
      >
        <CurrentIcon className="w-4 h-4" />
        <span className="hidden sm:inline">{aspectRatio}</span>
        <span className="text-neutral-400">|</span>
        <span className="capitalize">{quality}</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-72 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg z-50 p-4">
          {/* Aspect Ratio Section */}
          <div className="mb-4">
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2 block">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-5 gap-2">
              {ASPECT_RATIOS.map((ratio) => {
                const Icon = iconMap[ratio.icon as keyof typeof iconMap];
                return (
                  <button
                    key={ratio.value}
                    type="button"
                    onClick={() => onAspectRatioChange(ratio.value)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                      aspectRatio === ratio.value
                        ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                        : "hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{ratio.value}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quality Section */}
          <div>
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2 block">
              Quality
            </label>
            <div className="flex gap-2">
              {qualityOptions.map((q) => (
                <button
                  key={q.value}
                  type="button"
                  onClick={() => onQualityChange(q.value)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    quality === q.value
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent"
                  }`}
                >
                  {quality === q.value && <Check className="w-4 h-4" />}
                  <span className="capitalize">{q.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Resolution preview */}
          <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 text-center">
            <span className="text-xs text-neutral-500">
              Resolution: {getResolution(aspectRatio, quality)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
