import { defineConfig } from 'astro/config';
import compress from "astro-compress";
import solidJs from "@astrojs/solid-js";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  integrations: [
    compress({
      svg: false
    }),
    solidJs()
  ],
  output: "server",
  adapter: cloudflare()
});