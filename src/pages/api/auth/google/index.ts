import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const clientId = import.meta.env.GOOGLE_CLIENT_ID;
  const redirectUri = import.meta.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return new Response("Google OAuth not configured.", { status: 500 });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  return Response.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    302,
  );
};
