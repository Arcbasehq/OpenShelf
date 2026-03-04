import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const name = url.searchParams.get("name") || "";
  const email = url.searchParams.get("email") || "";

  // Return an HTML page that stores auth data in localStorage then redirects
  const html = `<!DOCTYPE html>
<html>
<head><title>Signing in...</title></head>
<body>
<p>Signing you in...</p>
<script>
  localStorage.setItem("convex_token", ${JSON.stringify(token)});
  localStorage.setItem("user_name", ${JSON.stringify(name)});
  localStorage.setItem("user_email", ${JSON.stringify(email)});
  window.location.href = "/favorites";
</script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
};
