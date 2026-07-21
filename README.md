# My Takes Map

Personal map of movies and books on Engagement ↔ Detachment and Comfort ↔ Challenge axes.

## Local development

```bash
source ~/.nvm/nvm.sh && nvm use 20
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data

Items live in `data/items.json`. Covers are in `public/covers/`.

On Vercel the site is **read-only** for visitors (no persistent writes). Use local admin to edit, then redeploy.

## Admin (local / private)

Copy `.env.example` → `.env.local` and set secrets. Public deploy should **omit** `NEXT_PUBLIC_IS_ADMIN`.

## Production build

```bash
npm run build
npm start
```
