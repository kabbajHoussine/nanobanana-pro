import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import type { AspectRatio, Quality } from "@/utils/resolutions";
import { getResolution } from "@/utils/resolutions";
import type { Element } from "@/utils/elements";
import { useElements, type ApiElement } from "@/hooks/use-elements";
import { parsePromptForElements } from "@/utils/prompt-parser";
import type { GeneratedImage } from "@/utils/history";
import { getHistory, saveToHistory } from "@/utils/history";
import { PromptInput } from "./prompt-input";
import { AspectRatioPicker } from "./aspect-ratio-picker";
import { ElementsModal } from "./elements-modal";
import { ImageLightbox } from "./image-lightbox";
import { GenerationHistory } from "./generation-history";
import { Sparkles, LayoutGrid, Loader2 } from "lucide-react";

// Helper to fetch image from URL and convert to base64
async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix
      const base64Data = base64.split(",")[1] || base64;
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [quality, setQuality] = useState<Quality>("standard");
  const [isElementsModalOpen, setIsElementsModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(
    null
  );

  // Load elements from API
  const { elements, isLoading } = useElements();

  // Load history on mount
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // oRPC mutation
  const generateMutation = useMutation(
    orpc.image.generate.mutationOptions({
      onSuccess: (result) => {
        // Save to history
        const savedImage = saveToHistory({
          base64: result.base64,
          prompt: result.prompt,
          resolution: result.resolution,
        });
        setHistory(getHistory());
        setUploadedFiles([]);
      },
    })
  );

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const { cleanedPrompt, references } = parsePromptForElements(prompt);
    const inputImages: string[] = [];

    // Collect base64 from elements by fetching from their imgbb URLs
    for (const ref of references) {
      const element = elements.find((e: ApiElement) => e.handle === ref.handle);
      if (element) {
        try {
          const base64 = await fetchImageAsBase64(element.imageUrl);
          inputImages.push(base64);
        } catch (err) {
          console.error(`Failed to fetch image for ${ref.handle}:`, err);
        }
      }
    }

    // Add manual uploads
    inputImages.push(...uploadedFiles);

    await generateMutation.mutateAsync({
      prompt: cleanedPrompt,
      resolution: getResolution(aspectRatio, quality),
      inputImages,
    });
  };

  const handleFileUpload = (base64: string) => {
    setUploadedFiles((prev) => [...prev, base64]);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Map API elements to the format expected by PromptInput
  const promptInputElements: Element[] = elements.map((el: ApiElement) => ({
    handle: el.handle,
    base64: "", // Not used for display, PromptInput will need updating
    createdAt: new Date(el.createdAt).getTime(),
  }));

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h1 className="font-semibold text-lg">Nano Banana Pro</h1>
        </div>
        <button
          type="button"
          onClick={() => setIsElementsModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <LayoutGrid className="w-4 h-4" />
          Elements ({elements.length})
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* History Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">
              Generation History
            </h2>
            <GenerationHistory
              images={history}
              onImageClick={setSelectedImage}
            />
          </div>
        </div>

        {/* Bottom Input Bar */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <PromptInput
                  value={prompt}
                  onChange={setPrompt}
                  onSubmit={handleGenerate}
                  onFileUpload={handleFileUpload}
                  elements={promptInputElements}
                  uploadedFiles={uploadedFiles}
                  onRemoveFile={handleRemoveFile}
                  isGenerating={generateMutation.isPending}
                />
              </div>
              <AspectRatioPicker
                aspectRatio={aspectRatio}
                quality={quality}
                onAspectRatioChange={setAspectRatio}
                onQualityChange={setQuality}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ElementsModal
        isOpen={isElementsModalOpen}
        onClose={() => setIsElementsModalOpen(false)}
      />

      <ImageLightbox
        image={selectedImage}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}
