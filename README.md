# Noter Landing

This is the Noter landing page

## Environment

### Requirements
- Node 20 & npm
- Stripe account or API keys (public and secret keys)
- Discord webhook
- [Noter backend](https://github.com/pocolifo/noter-backend)

### Setup procedure
1. Get your Stripe API keys, Discord webhook URL, and run the Noter backend
2. Clone this repository
3. Install all dependencies with `npm install` in the repository
4. Create a `.env` file in the root of the repository
5. Use the following format for `.env` and fill in appropriate information:

```properties
# Discord webhook URL
VITE_DISCORD_CONTACT_WEBHOOK_URL=https://discord.com/api/webhooks/0123456789/abcdefghijklmnopqrstuvwxyz

# This is the Noter backend root URL
VITE_API_URL=http://127.0.0.1:8000
```

### Development
- If you are just making minor UI changes, you don't have to use Cloudflare Wrangler (which enables Cloudflare features in local development).
    - Run `npm run dev`
    - Supports auto-reload.
- If you are developing changes or using the app in such a way that it depends on Cloudflare Workers (contact form, registration), then you'll have to use Cloudflare Wrangler.
    - Run `npm run build` and then `npm run preview`
    - **Does not support auto-reload.** You'll need to re-run these commands every time a change is made.


## Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:3000`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## Built with Astro and Solid

- [Astro website](https://astro.build)
- [Astro documentation](https://docs.astro.build)
- [Solid website](https://www.solidjs.com/)