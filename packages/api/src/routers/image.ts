import { togetherai } from "@ai-sdk/togetherai";
import { generateImage } from "ai";
import { z } from "zod";
import { protectedProcedure } from "../index";
import { uploadToImgbb } from "../utils/imgbb";

const generateInputSchema = z.object({
  prompt: z.string().min(1),
  resolution: z.string().regex(/^\d+x\d+$/), // e.g., "1376x768"
  inputImages: z.array(z.string()), // base64 strings
});

// Model that supports image editing/editing with reference images
const MODEL = "black-forest-labs/FLUX.1-kontext-pro";

export const imageRouter = {
  generate: protectedProcedure
    .input(generateInputSchema)
    .handler(async ({ input }) => {
      // Together AI only supports one reference image
      // If multiple @handles are used, only the first one is used
      let imageUrl: string | undefined;
      if (input.inputImages.length > 0) {
        imageUrl = await uploadToImgbb(input.inputImages[0]!);
      }

      const result = await generateImage({
        model: togetherai.image(MODEL),
        prompt: input.prompt,
        size: input.resolution as `${number}x${number}`,
        providerOptions: {
          togetherai: {
            image_url: imageUrl,
          },
        },
      });

      const base64 = result.images?.[0]?.base64;
      if (!base64) throw new Error("Image generation failed");

      // Upload to imgbb instead of saving locally
      const generatedImageUrl = await uploadToImgbb(base64);

      return {
        base64,
        imageUrl: generatedImageUrl,
        prompt: input.prompt,
        resolution: input.resolution,
      };
    }),
};
