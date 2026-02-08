import { togetherai } from "@ai-sdk/togetherai";
import { generateImage } from "ai";
import { z } from "zod";
import { protectedProcedure } from "../index";
import { mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const generateInputSchema = z.object({
  prompt: z.string().min(1),
  resolution: z.string().regex(/^\d+x\d+$/), // e.g., "1376x768"
  inputImages: z.array(z.string()), // base64 strings
});

export const imageRouter = {
  generate: protectedProcedure
    .input(generateInputSchema)
    .handler(async ({ input }) => {
      const result = await generateImage({
        model: togetherai.image("google/gemini-3-pro-image"),
        prompt: input.prompt,
        size: input.resolution as `${number}x${number}`,
        providerOptions: {
          togetherai: {
            input_images: input.inputImages,
          },
        },
      });

      const base64 = result.images?.[0]?.base64;
      if (!base64) throw new Error("Image generation failed");

      // Save to server
      const uploadDir = path.join(process.cwd(), "upload");
      await mkdir(uploadDir, { recursive: true });
      const fileName = `${crypto.randomUUID()}.png`;
      const filePath = path.join(uploadDir, fileName);
      await Bun.write(filePath, Buffer.from(base64, "base64"));

      return {
        base64,
        imageUrl: `/upload/${fileName}`,
        prompt: input.prompt,
        resolution: input.resolution,
      };
    }),
};
