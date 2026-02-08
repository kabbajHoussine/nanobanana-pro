import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const element = pgTable(
  "element",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    handle: text("handle").notNull(), // e.g., "@Riley"
    imageUrl: text("image_url").notNull(), // imgbb URL
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("element_userId_idx").on(table.userId),
    index("element_handle_idx").on(table.handle),
  ]
);

export const elementRelations = relations(element, ({ one }) => ({
  user: one(user, {
    fields: [element.userId],
    references: [user.id],
  }),
}));
