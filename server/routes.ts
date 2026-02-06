
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

// Internally uses Replit AI Integrations for OpenAI access, 
// does not require your own API key, and charges are billed to your credits.
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.articles.list.path, async (req, res) => {
    const articles = await storage.getArticles();
    res.json(articles);
  });

  app.get(api.articles.get.path, async (req, res) => {
    const article = await storage.getArticle(Number(req.params.id));
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json(article);
  });

  app.post(api.articles.create.path, async (req, res) => {
    try {
      const input = api.articles.create.input.parse(req.body);
      
      // Attempt to extract content using AI
      let content = input.content;
      let title = input.title;
      let description = input.description;

      if (!content || content.length < 100) {
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: "You are a web scraper and content extractor. Given a URL, provide a clean text version of the main article content, a title, and a brief description. Return as JSON with keys: title, description, content."
              },
              {
                role: "user",
                content: `Extract content from this URL: ${input.url}`
              }
            ],
            response_format: { type: "json_object" }
          });
          
          const result = JSON.parse(response.choices[0].message.content || "{}");
          title = result.title || title;
          description = result.description || description;
          content = result.content || content;
        } catch (aiError) {
          console.error("AI Content Extraction Error:", aiError);
        }
      }

      const article = await storage.createArticle({
        ...input,
        title,
        description,
        content
      });
      res.status(201).json(article);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.articles.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.articles.update.input.parse(req.body);
      
      const existing = await storage.getArticle(id);
      if (!existing) {
        return res.status(404).json({ message: 'Article not found' });
      }

      const updated = await storage.updateArticle(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.articles.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getArticle(id);
    if (!existing) {
      return res.status(404).json({ message: 'Article not found' });
    }
    await storage.deleteArticle(id);
    res.status(204).send();
  });

  // Export
  app.get(api.articles.export.path, async (req, res) => {
    const articles = await storage.getArticles();
    res.json(articles);
  });

  // Import
  app.post(api.articles.import.path, async (req, res) => {
    try {
      const input = api.articles.import.input.parse(req.body);
      const created = await storage.bulkCreateArticles(input.articles);
      res.json({ count: created.length });
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}

// Optional: Seed function
async function seedDatabase() {
  const existing = await storage.getArticles();
  if (existing.length === 0) {
    await storage.createArticle({
      title: "The Future of Web Development",
      url: "https://example.com/future-web",
      description: "An in-depth look at where the web is heading in the next decade.",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      isRead: false,
    });
    await storage.createArticle({
      title: "10 Tips for Productivity",
      url: "https://example.com/productivity",
      description: "Boost your workflow with these simple tricks.",
      content: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      isRead: true,
    });
  }
}
