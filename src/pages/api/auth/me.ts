import type { APIRoute } from "astro";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

export const GET: APIRoute = async ({ request }) => {
  const userId = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!userId) {
    return new Response(
      JSON.stringify({ error: "Not authenticated." }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  const convexUrl = import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.CONVEX_URL;
  if (!convexUrl) {
    return new Response(
      JSON.stringify({ error: "Server misconfigured." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const client = new ConvexHttpClient(convexUrl);

  try {
    const user = await client.query(api.auth.getUser, { userId: userId as any });
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found." }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }
    const { passwordHash, ...safeUser } = user as any;
    return new Response(JSON.stringify(safeUser), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
