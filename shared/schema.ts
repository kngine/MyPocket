
import { pgTable, text, serial, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"), // Simplified content storage
  isRead: boolean("is_read").default(false).notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertArticleSchema = createInsertSchema(articles).omit({ 
  id: true, 
  createdAt: true 
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

// Specific schemas for API interactions
export type CreateArticleRequest = InsertArticle;
export type UpdateArticleRequest = Partial<InsertArticle>;
export type BulkImportRequest = { articles: InsertArticle[] };
