// Convex Auth configuration
// Docs: https://docs.convex.dev/auth
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
