
import { db } from "./db";
import {
  articles,
  type InsertArticle,
  type UpdateArticleRequest,
  type Article
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getArticles(): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, updates: UpdateArticleRequest): Promise<Article>;
  deleteArticle(id: number): Promise<void>;
  bulkCreateArticles(articlesList: InsertArticle[]): Promise<Article[]>;
}

export class DatabaseStorage implements IStorage {
  async getArticles(): Promise<Article[]> {
    return await db.select().from(articles).orderBy(desc(articles.createdAt));
  }

  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const [article] = await db.insert(articles).values(insertArticle).returning();
    return article;
  }

  async updateArticle(id: number, updates: UpdateArticleRequest): Promise<Article> {
    const [updated] = await db.update(articles)
      .set(updates)
      .where(eq(articles.id, id))
      .returning();
    return updated;
  }

  async deleteArticle(id: number): Promise<void> {
    await db.delete(articles).where(eq(articles.id, id));
  }

  async bulkCreateArticles(articlesList: InsertArticle[]): Promise<Article[]> {
    if (articlesList.length === 0) return [];
    return await db.insert(articles).values(articlesList).returning();
  }
}

export const storage = new DatabaseStorage();
