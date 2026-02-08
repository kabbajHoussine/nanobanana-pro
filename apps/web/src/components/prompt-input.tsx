import { useState, useRef, useEffect, useCallback } from "react";
import type { Element } from "@/utils/elements";
import { getElements } from "@/utils/elements";
import { Paperclip, X } from "lucide-react";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onFileUpload: (base64: string) => void;
  elements: Element[];
  uploadedFiles: string[];
  onRemoveFile: (index: number) => void;
  isGenerating: boolean;
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
  onFileUpload,
  elements,
  uploadedFiles,
  onRemoveFile,
  isGenerating,
}: PromptInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filter, setFilter] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get filtered elements based on current filter
  const filteredElements = elements.filter((el) =>
    el.handle.toLowerCase().includes(filter.toLowerCase())
  );

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const newCursorPos = e.target.selectionStart || 0;
    onChange(newValue);
    setCursorPosition(newCursorPos);

    // Check if we should show @mention dropdown
    const textBeforeCursor = newValue.slice(0, newCursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Only show if no space after @ (meaning we're still typing the handle)
      if (!textAfterAt.includes(" ")) {
        setFilter(textAfterAt);
        setShowDropdown(true);
        setSelectedIndex(0);
      } else {
        setShowDropdown(false);
      }
    } else {
      setShowDropdown(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || filteredElements.length === 0) {
      if (e.key === "Enter" && !isGenerating) {
        e.preventDefault();
        onSubmit();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredElements.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        selectElement(filteredElements[selectedIndex]);
        break;
      case "Escape":
        setShowDropdown(false);
        break;
    }
  };

  // Select an element from dropdown
  const selectElement = (element: Element) => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    const textBeforeAt = value.slice(0, lastAtIndex);
    const textAfterCursor = value.slice(cursorPosition);

    const newValue = `${textBeforeAt}${element.handle} ${textAfterCursor}`;
    onChange(newValue);
    setShowDropdown(false);

    // Restore cursor position after handle + space
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = lastAtIndex + element.handle.length + 1;
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        inputRef.current.focus();
      }
    }, 0);
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix if present
      const base64Data = base64.split(",")[1] || base64;
      onFileUpload(base64Data);
    };
    reader.readAsDataURL(file);

    // Reset file input
    e.target.value = "";
  };

  return (
    <div className="relative w-full">
      {/* @mention dropdown */}
      {showDropdown && filteredElements.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
          {filteredElements.map((element, index) => (
            <button
              key={element.handle}
              type="button"
              onClick={() => selectElement(element)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                index === selectedIndex ? "bg-neutral-100 dark:bg-neutral-800" : ""
              }`}
            >
              <img
                src={`data:image/png;base64,${element.base64}`}
                alt={element.handle}
                className="w-8 h-8 rounded object-cover"
              />
              <span className="text-sm font-medium">{element.handle}</span>
            </button>
          ))}
        </div>
      )}

      {/* Uploaded files preview */}
      {uploadedFiles.length > 0 && (
        <div className="flex gap-2 mb-2 flex-wrap">
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="relative flex items-center gap-2 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full"
            >
              <img
                src={`data:image/png;base64,${file}`}
                alt="Upload"
                className="w-6 h-6 rounded object-cover"
              />
              <button
                type="button"
                onClick={() => onRemoveFile(index)}
                className="p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input container */}
      <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full px-4 py-3 shadow-sm">
        {/* File upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors shrink-0"
          disabled={isGenerating}
        >
          <Paperclip className="w-5 h-5 text-neutral-500" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Describe your image... Use @ to reference elements"
          className="flex-1 bg-transparent outline-none text-sm"
          disabled={isGenerating}
        />

        {/* Submit button */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim() || isGenerating}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          {isGenerating ? "Generating..." : "Generate"}
        </button>
      </div>
    </div>
  );
}
