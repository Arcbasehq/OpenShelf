import type { APIRoute } from "astro";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

export const POST: APIRoute = async ({ request }) => {
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
    await client.mutation(api.auth.deleteAccount, {
      userId: userId as any,
    });
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Account deletion failed." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
