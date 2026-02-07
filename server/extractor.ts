import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export interface ExtractedContent {
  title: string;
  description: string;
  content: string;
  siteName?: string;
}

export async function extractContentFromUrl(url: string): Promise<ExtractedContent | null> {
  try {
    // Fetch the URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MyPocket/1.0; +https://github.com)',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    
    // Parse with JSDOM
    const dom = new JSDOM(html, { url });
    const document = dom.window.document;

    // Extract metadata
    const getMetaContent = (names: string[]): string => {
      for (const name of names) {
        const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
        if (meta) {
          const content = meta.getAttribute('content');
          if (content) return content;
        }
      }
      return '';
    };

    // Try to extract with Readability (used by Firefox Reader View)
    const reader = new Readability(document);
    const article = reader.parse();

    if (!article) {
      console.error('Readability could not parse article');
      return null;
    }

    // Get title (prefer Open Graph, fall back to Readability, then document title)
    const title = 
      getMetaContent(['og:title', 'twitter:title']) ||
      article.title ||
      document.title ||
      'Untitled';

    // Get description
    const description =
      getMetaContent(['og:description', 'twitter:description', 'description']) ||
      article.excerpt ||
      '';

    // Get site name
    const siteName = getMetaContent(['og:site_name', 'twitter:site']) || '';

    return {
      title: title.trim(),
      description: description.trim(),
      content: article.content,
      siteName: siteName.trim(),
    };
  } catch (error) {
    console.error(`Error extracting content from ${url}:`, error);
    return null;
  }
}
