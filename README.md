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
- Save actions commit `content/projects.json`, `content/cv.json`, `content/contact.json`, and uploaded media under `public/uploads/**` via GitHub API.

## Edit mode (user-friendly flow)

- **Edit password:** set `EDIT_PASSWORD` in `.env.local` locally and in your host’s environment variables (e.g. Vercel). It is **not** stored in the repo — open `.env.local` on your machine or check the dashboard where you deploy.
- Open `/?edit=1` and unlock with that password.
- Drop files to create a new project on homepage.
- Save opens `/work/<slug>?edit=1`.
- On project page in edit mode, update title/place/date/description, add/remove media, save.
- CV: `/about?edit=1` — intro, sections, entries; **Save CV** commits `content/cv.json`.
- Contact: `/contact?edit=1` — heading, optional body, Instagram + Substack URLs; **Save contact** commits `content/contact.json`.

## Optional bootstrap import

```bash
npm run download:site
```

Optional: `SITE_IMPORT_BASE=https://example.art`, `SITE_IMPORT_OCR=0` to skip text-image OCR.

See `.env.example` for all variables.
