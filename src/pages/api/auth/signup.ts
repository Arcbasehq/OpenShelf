import type { APIRoute } from "astro";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { createHash } from "node:crypto";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export const POST: APIRoute = async ({ request }) => {
  const { name, email, password } = await request.json();

  if (!email || !password || !name) {
    return new Response(
      JSON.stringify({ error: "Name, email, and password are required." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
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
    const passwordHash = hashPassword(password);
    const result = await client.mutation(api.auth.signUp, {
      name,
      email,
      passwordHash,
    });

    // Use the Convex user ID as a simple session token
    const token = result.userId;

    return new Response(
      JSON.stringify({ token, name, email }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    const message = err.message?.includes("already exists")
      ? "An account with this email already exists."
      : err.message || "Sign-up failed.";

    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
};
