/**
 * GET /api/search-books?q=...&maxResults=20
 * Proxies the Google Books API to avoid exposing API keys client-side.
 */
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get("q") ?? "";
  const maxResults = Math.min(
    Number(url.searchParams.get("maxResults") ?? "12"),
    40,
  );

  if (!query.trim()) {
    return new Response(JSON.stringify({ items: [], totalItems: 0 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = import.meta.env.GOOGLE_BOOKS_API_KEY ?? "";
  const apiUrl = new URL("https://www.googleapis.com/books/v1/volumes");
  apiUrl.searchParams.set("q", query);
  apiUrl.searchParams.set("maxResults", String(maxResults));
  if (apiKey) apiUrl.searchParams.set("key", apiKey);

  const res = await fetch(apiUrl.toString());
  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
};
