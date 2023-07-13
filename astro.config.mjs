import { defineConfig } from 'astro/config';
import solidJs from "@astrojs/solid-js";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import htmlMinifier from "astro-html-minifier";
const EXCLUDE_FROM_SITEMAP = ['/404', '/5xx', '/async/'];


// https://astro.build/config
export default defineConfig({
  site: 'https://www.getnoter.com',
  trailingSlash: 'never',
  integrations: [
    solidJs(),
    sitemap({
      filter: page => {
        for (let route of EXCLUDE_FROM_SITEMAP) {
          if (page.includes(route)) {
            return false;
          }
        }
        
        return true;
      },
      changefreq: 'weekly',
      lastmod: new Date(),
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-US'
        }
      }
    }),
    htmlMinifier({
      html: {
        keepComments: true  // Solid.js requires comments to function correctly, so must keepComments=true
      }
    })],
  output: "server",
  adapter: cloudflare({
    mode: 'advanced'
  }),
  vite: {
    envPrefix: 'VITE_',
  }
});