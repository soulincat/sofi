# Artist portfolio

Next.js + Tailwind. Work index and project pages. Content can come from:

1. **Offline import** (default when committed): `src/data/site-import.json` + `public/site-import/**` from `npm run download:site` — no Tumblr API key.
2. **Sanity** — set `NEXT_PUBLIC_SANITY_PROJECT_ID` (and dataset) in production.
3. **Tumblr API** — optional env keys.
4. **Demo** grey placeholders if nothing else is configured.

```bash
npm install
npm run dev
```

## Deploy (e.g. Vercel)

- Connect the repo and deploy the **`main`** branch.
- Set env vars in the project dashboard (see `.env.example`): at minimum `NEXT_PUBLIC_SANITY_*` if you use Studio, plus optional site metadata / Instagram URL.
- If the site should use the **crawled** copy, commit **`src/data/site-import.json`** and **`public/site-import/`** so the build serves those assets. The importer wins over Sanity for project list + `/work/*` when the manifest has projects.
- Re-run **`npm run download:site`** locally when the live Tumblr site changes, then commit the updated JSON + images.

## Admin (`/admin`)

- **`/admin`** is **Sanity Studio** (embedded in Next). Editors log in with Sanity accounts you invite in [sanity.io/manage](https://www.sanity.io/manage).
- Requires **`NEXT_PUBLIC_SANITY_PROJECT_ID`** and **`NEXT_PUBLIC_SANITY_DATASET`** at build/runtime. Add your deploy URL to Sanity CORS (e.g. `npx sanity cors add https://your-domain.vercel.app --credentials`).
- While **`site-import.json`** is present with projects, the **public** work pages read the import, not Sanity — Studio is still useful to edit content for a future switch (remove or empty the manifest to use Sanity again) or to maintain CV-style data if you wire it later.

## Import from the public site

```bash
npm run download:site
```

Optional: `SITE_IMPORT_BASE=https://example.art`, `SITE_IMPORT_OCR=0` to skip text-image OCR. Tunables: `SITE_IMPORT_OCR_MIN_WORDS`, `SITE_IMPORT_OCR_MIN_CONFIDENCE` (see `.env.example`). OCR skips slides that don’t look like captions (year / medium keywords); posts without a match keep all images — you can add an `intro` array by hand in `site-import.json` (Portable Text–shaped blocks, same shape as in generated files).

See `.env.example` for all variables.
