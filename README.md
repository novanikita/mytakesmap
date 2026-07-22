# My Takes Map

Personal map of movies and books. Accounts at `/{username}`.

**Live:** [https://www.mytakesmap.space](https://www.mytakesmap.space)

## Production checklist

1. **Neon Postgres** — [console.neon.tech](https://console.neon.tech) → create project → copy connection string → `DATABASE_URL`
2. **Auth** — `AUTH_SECRET` (`openssl rand -base64 32`) and `AUTH_URL=https://www.mytakesmap.space`
3. **Vercel Blob** — Vercel → Storage → Blob → connect to project → `BLOB_READ_WRITE_TOKEN`
4. Add all three in Vercel → Project → Settings → Environment Variables (Production)
5. Deploy (`git push` or Redeploy)

Build runs `prisma migrate deploy` automatically.

## Local development

```bash
# .env — same Neon DATABASE_URL works locally
AUTH_SECRET=...
DATABASE_URL=postgresql://...
# BLOB optional locally (falls back to public/covers)

npm install
npx prisma migrate deploy
npm run dev
```

Register at `/register`, map at `/{username}`.
