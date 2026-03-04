import type { APIRoute } from "astro";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

function getClient() {
  const url = import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.CONVEX_URL;
  if (!url) throw new Error("CONVEX_URL is not set");
  return new ConvexHttpClient(url);
}

export const GET: APIRoute = async ({ request }) => {
  const userId = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!userId) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const client = getClient();
    const favorites = await client.query(api.favorites.list, { userId: userId as any });

    return new Response(JSON.stringify(favorites), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
