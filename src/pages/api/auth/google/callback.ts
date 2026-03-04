import type { APIRoute } from "astro";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error || !code) {
    return Response.redirect(new URL("/login?error=google_denied", url.origin).toString(), 302);
  }

  const clientId = import.meta.env.GOOGLE_CLIENT_ID;
  const clientSecret = import.meta.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = import.meta.env.GOOGLE_REDIRECT_URI;
  const convexUrl = import.meta.env.PUBLIC_CONVEX_URL || import.meta.env.CONVEX_URL;

  if (!clientId || !clientSecret || !redirectUri || !convexUrl) {
    return new Response("Server misconfigured.", { status: 500 });
  }

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("Google token exchange failed:", err);
      return Response.redirect(new URL("/login?error=google_failed", url.origin).toString(), 302);
    }

    const tokens = await tokenRes.json();

    // Get user info from Google
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoRes.ok) {
      return Response.redirect(new URL("/login?error=google_failed", url.origin).toString(), 302);
    }

    const googleUser = await userInfoRes.json();
    const { email, name, picture } = googleUser;

    if (!email) {
      return Response.redirect(new URL("/login?error=google_no_email", url.origin).toString(), 302);
    }

    // Find or create user in Convex
    const client = new ConvexHttpClient(convexUrl);
    const result = await client.mutation(api.auth.googleSignIn, {
      email,
      name: name || email.split("@")[0],
      avatarUrl: picture || "",
    });

    // Build redirect with auth data as query params (picked up by the landing page script)
    const successUrl = new URL("/api/auth/google/success", url.origin);
    successUrl.searchParams.set("token", result.userId);
    successUrl.searchParams.set("name", result.name);
    successUrl.searchParams.set("email", result.email);

    return Response.redirect(successUrl.toString(), 302);
  } catch (err) {
    console.error("Google OAuth error:", err);
    return Response.redirect(new URL("/login?error=google_failed", url.origin).toString(), 302);
  }
};
