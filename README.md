# InvoiceSmarty

Invoicing, quotes, payments, projects, expenses and time tracking, with a customer portal.
Built with Next.js, TypeORM (PostgreSQL) and Tailwind CSS.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Environment variables (see `.env`): database connection (`DATABASE_URL` or `DB_HOST`, `DB_PORT`,
`DB_USER`, `DB_PASSWORD`, `DB_NAME`), `ENCRYPTION_KEY`, and `AUTH_SECRET`.

## Database

Tables are created automatically when `DB_SYNCHRONIZE=true` (or when connecting with `DB_HOST`).
On production, run `scripts/add-performance-indexes.sql` once to add the query indexes.

## Scripts

- `npm run dev` - development server
- `npm run build` / `npm start` - production build and server
- `npm run lint` - lint
