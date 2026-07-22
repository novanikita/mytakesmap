# My Takes Map

Personal map of movies and books on Engagement ↔ Detachment and Comfort ↔ Challenge axes.

**Live:** [https://www.mytakesmap.space](https://www.mytakesmap.space)

## How publishing works

```
local edit  →  git commit  →  git push (main)  →  Vercel auto-deploy  →  mytakesmap.space
```

1. Change data or code locally (`data/items.json`, `public/covers/`, …)
2. Commit and push to `main`
3. Vercel rebuilds Production automatically
4. Site updates at [www.mytakesmap.space](https://www.mytakesmap.space) in ~1–2 minutes

Do **not** edit production by hand. Always ship through Git.

### One-time: connect GitHub → Vercel

If a push does not update the site:

1. Open [Vercel → Project → Settings → Git](https://vercel.com/dashboard)
2. Connect repository `novanikita/mytakesmap`
3. Production Branch = `main`
4. Save, then **Deployments → Redeploy** the latest commit from `main`

## Local development

```bash
source ~/.nvm/nvm.sh && nvm use 20
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data

Items live in `data/items.json`. Covers are AVIF files in `public/covers/`.

On Vercel the site is **read-only** for visitors (no persistent writes). Edit locally, then push.

## Admin (local / private)

Copy `.env.example` → `.env.local` and set secrets. Public deploy should **omit** `NEXT_PUBLIC_IS_ADMIN`.

## Production build (local check)

```bash
npm run build
npm start
```
