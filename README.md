# MON SHOP (Node.js + Postgres)

Runs locally like a XAMPP/WAMP style app and deploys to Vercel with Neon Postgres.

## Prereqs
- Node.js LTS
- Postgres (local) or Neon (cloud Postgres)

## 1) Local Setup
```bash
git clone <your-repo-url>
cd monshop-business
cp .env.example .env
# Edit .env with your local connection string
createdb monshop
psql -U postgres -d monshop -f schema.sql

npm install
npm start
# open http://localhost:3000
```

## 2) Deploy with GitHub + Vercel
- Push this folder to GitHub (branch: main).
- In Vercel:
  - Import the repo.
  - Add Environment Variables:
    - `DATABASE_URL` = your Neon Postgres connection string
    - `JWT_SECRET` = strong random secret
  - Deploy.

## API Quick Reference
- POST `/api/register` { username, email?, password }
- POST `/api/login` { username, password }
- GET  `/api/me` (Bearer token)
- GET  `/api/items` (Bearer token)
- POST `/api/items` { name, code?, price, date_registered? } (Bearer token)
- POST `/api/stock/in` { item_id, qty, date? } (Bearer token)
- POST `/api/stock/out` { item_id, qty, unit_price, client_name?, date? } (Bearer token)
- GET  `/api/stock/summary` (Bearer token)

## Notes
- For Neon + Vercel you don't need to run `schema.sql` from your server. Create tables once using Neon's SQL editor.
- If you want to seed an admin user, use `scripts/seed-admin.js` then `npm run seed:admin`.
