import { useState, useRef, useEffect } from "react";
import { useElements, type ApiElement } from "@/hooks/use-elements";
import { X, Trash2, Plus, Upload, AlertCircle, Loader2 } from "lucide-react";

interface ElementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onElementsChange?: () => void;
}

type View = "grid" | "upload";

export function ElementsModal({
  isOpen,
  onClose,
  onElementsChange,
}: ElementsModalProps) {
  const { elements, isLoading, createElement, deleteElement, isCreating, isDeleting } = useElements();
  const [view, setView] = useState<View>("grid");
  const [uploadFile, setUploadFile] = useState<string | null>(null);
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset view when modal opens
  useEffect(() => {
    if (isOpen) {
      setView("grid");
      setUploadFile(null);
      setHandle("");
      setError(null);
    }
  }, [isOpen]);

  // Handle file selection for upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(",")[1] || base64;
      setUploadFile(base64Data);
      setView("upload");
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  // Check if handle already exists in current elements
  const handleExists = (checkHandle: string): boolean => {
    return elements.some((e: ApiElement) => e.handle === checkHandle);
  };

  // Handle saving new element
  const handleSave = async () => {
    setError(null);

    // Validate handle
    const trimmedHandle = handle.trim();
    if (!trimmedHandle) {
      setError("Please enter a handle");
      return;
    }

    // Ensure @ prefix
    const finalHandle = trimmedHandle.startsWith("@")
      ? trimmedHandle
      : `@${trimmedHandle}`;

    // Check for valid handle format (alphanumeric and underscores only after @)
    const handleRegex = /^@[\w-]+$/;
    if (!handleRegex.test(finalHandle)) {
      setError("Handle must contain only letters, numbers, underscores, and hyphens");
      return;
    }

    // Check for duplicates
    if (handleExists(finalHandle)) {
      setError("This handle is already in use");
      return;
    }

    if (!uploadFile) {
      setError("Please select an image");
      return;
    }

    try {
      // Save element via API
      await createElement({
        handle: finalHandle,
        base64Image: uploadFile,
      });

      // Go back to grid
      setView("grid");
      setUploadFile(null);
      setHandle("");
      onElementsChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save element");
    }
  };

  // Handle deleting an element
  const handleDelete = async (elementId: string, elementHandle: string) => {
    if (confirm(`Are you sure you want to delete ${elementHandle}?`)) {
      try {
        await deleteElement({ id: elementId });
        onElementsChange?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete element");
      }
    }
  };

  // Handle closing modal
  const handleClose = () => {
    setView("grid");
    setUploadFile(null);
    setHandle("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold">
            {view === "grid" ? "Your Elements" : "Add Element"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {view === "grid" ? (
            <>
              {/* Grid View */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : elements.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No elements yet</h3>
                  <p className="text-neutral-500 mb-6 max-w-sm mx-auto">
                    Upload reference images and assign them @handles to use in
                    your prompts
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Your First Element
                  </button>
                </div>
              ) : (
                <>
                  {/* Elements Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-6">
                    {elements.map((element: ApiElement) => (
                      <div
                        key={element.id}
                        className="group relative aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden"
                      >
                        <img
                          src={element.imageUrl}
                          alt={element.handle}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <span className="text-white text-sm font-medium">
                            {element.handle}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDelete(element.id, element.handle)}
                          disabled={isDeleting}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Element Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors flex items-center justify-center gap-2 text-neutral-500 hover:text-blue-600"
                  >
                    <Plus className="w-5 h-5" />
                    Add Element
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              {/* Upload Form */}
              <div className="space-y-4">
                {/* Image Preview */}
                {uploadFile && (
                  <div className="aspect-video bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
                    <img
                      src={`data:image/png;base64,${uploadFile}`}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* Handle Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Handle <span className="text-neutral-400">(e.g., @Riley)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                      @
                    </span>
                    <input
                      type="text"
                      value={handle.replace(/^@/, "")}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="element_handle"
                      className="w-full pl-8 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setView("grid");
                      setUploadFile(null);
                      setHandle("");
                      setError(null);
                    }}
                    className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isCreating}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Element
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
