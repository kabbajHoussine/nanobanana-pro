import { createFileRoute } from "@tanstack/react-router";

import { ImageGenerator } from "@/components/image-generator";

export const Route = createFileRoute("/generate")({
  component: ImageGenerator,
});
