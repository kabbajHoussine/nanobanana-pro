import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import type { AspectRatio, Quality } from "@/utils/resolutions";
import { getResolution } from "@/utils/resolutions";
import type { Element } from "@/utils/elements";
import { getElements, getElementByHandle } from "@/utils/elements";
import { parsePromptForElements } from "@/utils/prompt-parser";
import type { GeneratedImage } from "@/utils/history";
import { getHistory, saveToHistory } from "@/utils/history";
import { PromptInput } from "./prompt-input";
import { AspectRatioPicker } from "./aspect-ratio-picker";
import { ElementsModal } from "./elements-modal";
import { ImageLightbox } from "./image-lightbox";
import { GenerationHistory } from "./generation-history";
import { Sparkles, LayoutGrid } from "lucide-react";

export function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [quality, setQuality] = useState<Quality>("standard");
  const [elements, setElements] = useState<Element[]>([]);
  const [isElementsModalOpen, setIsElementsModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(
    null
  );

  // Load elements and history on mount
  useEffect(() => {
    setElements(getElements());
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

    // Collect base64 from elements
    for (const ref of references) {
      const element = getElementByHandle(ref.handle);
      if (element) inputImages.push(element.base64);
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

  const handleElementsChange = () => {
    setElements(getElements());
  };

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
                  elements={elements}
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
        onElementsChange={handleElementsChange}
      />

      <ImageLightbox
        image={selectedImage}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}
