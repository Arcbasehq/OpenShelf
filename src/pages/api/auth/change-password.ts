import type { APIRoute } from "astro";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { createHash } from "node:crypto";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export const POST: APIRoute = async ({ request }) => {
  const userId = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!userId) {
    return new Response(
      JSON.stringify({ error: "Not authenticated." }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  const { currentPassword, newPassword } = await request.json();
  if (!currentPassword || !newPassword) {
    return new Response(
      JSON.stringify({ error: "Current and new passwords are required." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (newPassword.length < 8) {
    return new Response(
      JSON.stringify({ error: "New password must be at least 8 characters." }),
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
    await client.mutation(api.auth.changePassword, {
      userId: userId as any,
      currentPasswordHash: hashPassword(currentPassword),
      newPasswordHash: hashPassword(newPassword),
    });
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Password change failed." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
};
