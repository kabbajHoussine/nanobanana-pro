import { useEffect } from "react";
import { X, Download, Clock } from "lucide-react";

interface ImageLightboxProps {
  image: {
    base64: string;
    prompt: string;
    createdAt: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function downloadImage(base64: string, filename: string) {
  const link = document.createElement("a");
  link.href = `data:image/png;base64,${base64}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function ImageLightbox({ image, isOpen, onClose }: ImageLightboxProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !image) return null;

  const handleDownload = () => {
    const timestamp = new Date().toISOString().split("T")[0];
    const sanitizedPrompt = image.prompt
      .slice(0, 30)
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const filename = `generated_${sanitizedPrompt}_${timestamp}.png`;
    downloadImage(image.base64, filename);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative w-full h-full max-w-6xl max-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full hover:bg-neutral-200 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Image Container */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
          <img
            src={`data:image/png;base64,${image.base64}`}
            alt={image.prompt}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Footer - Prompt Info */}
        <div className="px-4 py-4 sm:px-6 sm:py-6 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white text-sm sm:text-base leading-relaxed max-w-3xl">
            {image.prompt}
          </p>
          <div className="flex items-center gap-2 mt-2 text-white/50 text-xs sm:text-sm">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            {formatDate(image.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}
