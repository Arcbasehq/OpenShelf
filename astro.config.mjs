// @ts-check
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://openshelf.vercel.app",
  output: "server",
  adapter: vercel(),
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes("/api/") &&
        !page.includes("/login") &&
        !page.includes("/signup") &&
        !page.includes("/settings") &&
        !page.includes("/favorites"),
    }),
  ],
});
