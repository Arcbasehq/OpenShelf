import type { APIRoute } from "astro";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

function getClient() {
  const url = import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.CONVEX_URL;
  if (!url) throw new Error("CONVEX_URL is not set");
  return new ConvexHttpClient(url);
}

export const POST: APIRoute = async ({ request }) => {
  const userId = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!userId) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const client = getClient();

  try {
    if (body.remove && body.bookId) {
      await client.mutation(api.favorites.remove, {
        userId: userId as any,
        bookId: body.bookId,
      });
      return new Response(JSON.stringify({ ok: true, action: "removed" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const id = await client.mutation(api.favorites.add, {
      userId: userId as any,
      googleId: body.googleId,
      title: body.title,
      authors: body.authors ?? [],
      thumbnail: body.thumbnail,
      description: body.description,
    });

    return new Response(JSON.stringify({ ok: true, action: "added", id }), {
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
