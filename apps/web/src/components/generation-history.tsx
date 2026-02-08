import type { GeneratedImage } from "@/utils/history";
import { formatRelativeTime } from "@/utils/history";

interface GenerationHistoryProps {
  images: GeneratedImage[];
  onImageClick: (image: GeneratedImage) => void;
}

function truncatePrompt(prompt: string, maxLength: number = 60): string {
  if (prompt.length <= maxLength) return prompt;
  return prompt.slice(0, maxLength).trim() + "...";
}

export function GenerationHistory({
  images,
  onImageClick,
}: GenerationHistoryProps) {
  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500">
        <p>No generated images yet.</p>
        <p className="text-sm mt-1">
          Start by typing a prompt and clicking Generate.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {images.map((image) => (
        <button
          key={image.id}
          type="button"
          onClick={() => onImageClick(image)}
          className="group relative aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
        >
          <img
            src={`data:image/png;base64,${image.base64}`}
            alt={image.prompt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-white text-xs line-clamp-2 leading-relaxed">
              {truncatePrompt(image.prompt)}
            </p>
            <p className="text-white/60 text-xs mt-1">
              {formatRelativeTime(image.createdAt)}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
