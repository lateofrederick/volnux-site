# Product Apps Migration (Netlify Free)

This repository now has product app workspaces under `apps/`:

- `apps/eventhub`
- `apps/mesh-runtime`
- `apps/pointy`

The existing root app remains the marketing/docs surface during migration.

## Styling

- **EventHub** (`apps/eventhub`) uses **plain CSS** from `prototypes/eventhub.html` / `event-detail.html` (see `src/styles/eventhub-layout.css`, `eventhub-detail.css`, `eventhub-shell.css`). Tailwind was removed from that app.
- **Marketing**, **Mesh**, and **Pointy** still use **Tailwind** today; migrating them to the same prototype CSS pattern is straightforward but requires large template passes (replace utility classes with the class names from `prototypes/home-static.html`, `mesh-runtime-static.html`, `pointy-wizard.html`).

## Local commands

- Marketing app: `npm run dev` → **http://localhost:5173**
- EventHub app: `npm run dev:eventhub` → **http://localhost:5174**
- Mesh app shell: `npm run dev:mesh` → **http://localhost:5175**
- Pointy app shell: `npm run dev:pointy` → **http://localhost:5176**

Ports are set in each package’s `vite.config.ts` (not in `.env`).

## Environment variables (one file for local dev)

1. Copy **`.env.example`** at the repository root to **`.env`**.
2. Uncomment and set values as needed. The file is gitignored.

**Marketing site** (root `npm run dev`) reads `VITE_EVENTHUB_URL`, `VITE_MESH_URL`, `VITE_POINTY_URL`, and `VITE_CHANGELOG_URL` from that root `.env`.

**EventHub, Mesh, and Pointy** are configured with `envDir` pointing at the **same repository root**, so they also read that `.env` — mainly **`VITE_MARKETING_URL`** (e.g. `http://localhost:5173` when the marketing dev server is running).

In **production**, set the same variables in the host UI (e.g. Netlify site settings); you do not commit `.env`.

## Netlify setup (free plan friendly)

Create one Netlify site per app, all connected to this same repo/branch:

1. **EventHub site**
   - Base directory: `apps/eventhub`
   - Build command: `npm run build`
   - Publish directory: `dist`
2. **Mesh Runtime site**
   - Base directory: `apps/mesh-runtime`
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Pointy site**
   - Base directory: `apps/pointy`
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Marketing site** (existing root app)
   - Base directory: repository root
   - Build command: `npm run build`
   - Publish directory: `dist`

Each app has its own `netlify.toml` with SPA redirect to `index.html`.

## Cross-site product links

The marketing app now supports external product URLs via env vars:

- `VITE_EVENTHUB_URL`
- `VITE_MESH_URL`
- `VITE_POINTY_URL`
- `VITE_CHANGELOG_URL`

If unset, links fall back to internal `/products/*` routes.

Set these env vars in Netlify for the marketing site once product sites are live.

The marketing routes `/products/eventhub` and `/products/eventhub/events/:slug` redirect to `VITE_EVENTHUB_URL` when it is set (must be an `http` or `https` URL). If unset, they show a short notice instead of embedding the app.

`/products/mesh-runtime` redirects to `VITE_MESH_URL` when set the same way; otherwise it shows a short notice.

Optional on the **EventHub** Netlify site: `VITE_MARKETING_URL` — base URL for the “Marketing site” link in the app chrome (defaults to `https://volnux.netlify.app`).

Optional on the **Mesh Runtime** Netlify site: `VITE_MARKETING_URL` — used for the header logo, Docs link, footer links, and “Back to marketing” on the page (defaults to `https://volnux.netlify.app`).

`/products/pointy-lang` redirects to `VITE_POINTY_URL` when set (same rules as EventHub/Mesh); otherwise it shows a short notice.

Optional on the **Pointy** Netlify site: `VITE_MARKETING_URL` — used for the menubar volnux logo link (defaults to `https://volnux.netlify.app`).
