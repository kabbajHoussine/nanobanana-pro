import crypto from "crypto";

import { db } from "@nanobanana-pro/db";
import { element } from "@nanobanana-pro/db/schema/element";
import { and, desc, eq } from "drizzle-orm";
import z from "zod";

import { protectedProcedure } from "../index";
import { uploadToImgbb } from "../utils/imgbb";

const createElementSchema = z.object({
  handle: z
    .string()
    .min(1)
    .regex(/^@[\w-]+$/), // Must start with @
  base64Image: z.string(), // Base64 image data to upload to imgbb
});

const deleteElementSchema = z.object({
  id: z.string(),
});

export const elementRouter = {
  list: protectedProcedure.handler(async ({ context }) => {
    const elements = await db.query.element.findMany({
      where: eq(element.userId, context.session.user.id),
      orderBy: desc(element.createdAt),
    });
    return elements;
  }),

  create: protectedProcedure
    .input(createElementSchema)
    .handler(async ({ context, input }) => {
      // Upload to imgbb
      const imageUrl = await uploadToImgbb(input.base64Image);

      // Create element record
      const newElement = await db
        .insert(element)
        .values({
          id: crypto.randomUUID(),
          userId: context.session.user.id,
          handle: input.handle,
          imageUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return newElement[0];
    }),

  delete: protectedProcedure
    .input(deleteElementSchema)
    .handler(async ({ context, input }) => {
      // Ensure user owns the element before deleting
      const deleted = await db
        .delete(element)
        .where(
          and(
            eq(element.id, input.id),
            eq(element.userId, context.session.user.id)
          )
        )
        .returning();

      if (deleted.length === 0) {
        throw new Error("Element not found or access denied");
      }

      return { success: true };
    }),
};
