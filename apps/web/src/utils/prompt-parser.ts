export interface ParsedPrompt {
  cleanedPrompt: string; // @handles replaced with "Reference Image N"
  references: {
    // Ordered list of handles found
    handle: string;
    refIndex: number; // 1-based index
  }[];
}

export function parsePromptForElements(prompt: string): ParsedPrompt {
  const handleRegex = /@[\w]+/g;
  const matches = Array.from(prompt.matchAll(handleRegex));

  const references: { handle: string; refIndex: number }[] = [];
  const seenHandles = new Map<string, number>();

  // First pass: identify unique handles and assign indices
  for (const match of matches) {
    const handle = match[0];
    if (!seenHandles.has(handle)) {
      seenHandles.set(handle, seenHandles.size + 1);
    }
  }

  // Build references array
  for (const [handle, refIndex] of seenHandles) {
    references.push({ handle, refIndex });
  }

  // Sort by refIndex to maintain order
  references.sort((a, b) => a.refIndex - b.refIndex);

  // Second pass: replace handles with reference text
  let cleanedPrompt = prompt;
  for (const [handle, refIndex] of seenHandles) {
    cleanedPrompt = cleanedPrompt.replace(
      new RegExp(handle, "g"),
      `Reference Image ${refIndex}`
    );
  }

  return { cleanedPrompt, references };
}

export function extractHandles(prompt: string): string[] {
  const handleRegex = /@[\w]+/g;
  const matches = prompt.match(handleRegex);
  return matches ? Array.from(new Set(matches)) : [];
}
