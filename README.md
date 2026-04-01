# Artist portfolio

Next.js + Tailwind portfolio with a Git-backed editor.

Content source priority:

1. `content/projects.json` (canonical, edited from browser)
2. optional `src/data/site-import.json` fallback
3. demo placeholders

```bash
npm install
npm run dev
```

## Deploy (e.g. Vercel)

- Connect the repo and deploy the **`main`** branch.
- Set env vars from `.env.example`: `EDIT_PASSWORD`, `EDIT_SESSION_SECRET`, and GitHub repo write vars.
- The Save action writes updated `content/projects.json` and uploaded media files under `public/uploads/**`, then commits to GitHub via API.

## Edit mode (user-friendly flow)

- Open `/?edit=1` and unlock with password.
- Drop files to create a new project on homepage.
- Save opens `/work/<slug>?edit=1`.
- On project page in edit mode, update title/place/date/description, add/remove media, save.

## Optional bootstrap import

```bash
npm run download:site
```

Optional: `SITE_IMPORT_BASE=https://example.art`, `SITE_IMPORT_OCR=0` to skip text-image OCR.

See `.env.example` for all variables.
