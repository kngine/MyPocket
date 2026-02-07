/**
 * Call Netlify function to extract article content from a URL (standalone mode).
 */
export interface ExtractedContent {
  title: string;
  description: string;
  content: string;
}

export async function extractContentFromUrl(
  url: string
): Promise<ExtractedContent | null> {
  const res = await fetch("/.netlify/functions/extract-content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.ok || !data.title) return null;
  return {
    title: data.title,
    description: data.description || "",
    content: data.content || "",
  };
}
