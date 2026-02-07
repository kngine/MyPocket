/**
 * Client-side article storage for standalone (Netlify) mode.
 * Saves to localStorage on the user's device.
 */

const STORAGE_KEY = "mypocket-articles";
const NEXT_ID_KEY = "mypocket-next-id";

export interface Article {
  id: number;
  url: string;
  title: string;
  description: string | null;
  content: string | null;
  isRead: boolean;
  archived: boolean;
  tags: string[];
  createdAt: string;
}

export interface InsertArticle {
  url: string;
  title: string;
  description?: string | null;
  content?: string | null;
  isRead?: boolean;
  archived?: boolean;
  tags?: string[];
}

function loadArticles(): Article[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveArticles(articles: Article[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

function nextId(): number {
  const raw = localStorage.getItem(NEXT_ID_KEY);
  const n = raw ? parseInt(raw, 10) : 1;
  localStorage.setItem(NEXT_ID_KEY, String(n + 1));
  return n;
}

export function getArticles(): Promise<Article[]> {
  const articles = loadArticles();
  return Promise.resolve(
    [...articles].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );
}

export function getArticle(id: number): Promise<Article | null> {
  const articles = loadArticles();
  const article = articles.find((a) => a.id === id);
  return Promise.resolve(article ?? null);
}

export function createArticle(data: InsertArticle): Promise<Article> {
  const articles = loadArticles();
  const article: Article = {
    id: nextId(),
    url: data.url,
    title: data.title,
    description: data.description ?? null,
    content: data.content ?? null,
    isRead: data.isRead ?? false,
    archived: data.archived ?? false,
    tags: data.tags ?? [],
    createdAt: new Date().toISOString(),
  };
  articles.push(article);
  saveArticles(articles);
  return Promise.resolve(article);
}

export function updateArticle(
  id: number,
  updates: Partial<InsertArticle>
): Promise<Article> {
  const articles = loadArticles();
  const idx = articles.findIndex((a) => a.id === id);
  if (idx === -1) return Promise.reject(new Error("Article not found"));
  const existing = articles[idx];
  const updated: Article = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
  };
  articles[idx] = updated;
  saveArticles(articles);
  return Promise.resolve(updated);
}

export function deleteArticle(id: number): Promise<void> {
  const articles = loadArticles().filter((a) => a.id !== id);
  saveArticles(articles);
  return Promise.resolve();
}

export function importArticles(
  items: InsertArticle[]
): Promise<{ count: number }> {
  const articles = loadArticles();
  const created: Article[] = [];
  for (const data of items) {
    const article: Article = {
      id: nextId(),
      url: data.url,
      title: data.title,
      description: data.description ?? null,
      content: data.content ?? null,
      isRead: data.isRead ?? false,
      archived: data.archived ?? false,
      tags: data.tags ?? [],
      createdAt: new Date().toISOString(),
    };
    articles.push(article);
    created.push(article);
  }
  saveArticles(articles);
  return Promise.resolve({ count: created.length });
}
