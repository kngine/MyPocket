import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

async function extractContentFromUrl(url: string): Promise<{
  title: string;
  description: string;
  content: string;
} | null> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; MyPocket/1.0; +https://github.com)",
    },
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) return null;
  const html = await response.text();
  const dom = new JSDOM(html, { url });
  const document = dom.window.document;

  const getMeta = (names: string[]): string => {
    for (const name of names) {
      const meta = document.querySelector(
        `meta[name="${name}"], meta[property="${name}"]`
      );
      const content = meta?.getAttribute("content");
      if (content) return content;
    }
    return "";
  };

  const reader = new Readability(document);
  const article = reader.parse();
  if (!article) return null;

  const title =
    getMeta(["og:title", "twitter:title"]) ||
    article.title ||
    document.title ||
    "Untitled";
  const description =
    getMeta(["og:description", "twitter:description", "description"]) ||
    article.excerpt ||
    "";

  return {
    title: title.trim(),
    description: description.trim(),
    content: article.content,
  };
}

export const handler = async (event: { httpMethod: string; body: string | null }) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let url: string;
  try {
    const body = JSON.parse(event.body ?? "{}");
    url = body.url;
    if (!url || typeof url !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing or invalid url" }),
        headers: { "Content-Type": "application/json" },
      };
    }
    new URL(url);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request body or url" }),
      headers: { "Content-Type": "application/json" },
    };
  }

  try {
    const result = await extractContentFromUrl(url);
    if (!result) {
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: false, extracted: null }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, ...result }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };
  } catch (err) {
    console.error("extract-content error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Extraction failed" }),
      headers: { "Content-Type": "application/json" },
    };
  }
};
