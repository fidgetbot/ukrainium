# Ukrainium

A Next.js 14 + PostgreSQL application deployed on Railway.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma 5
- **Auth:** Custom session-based auth with bcryptjs
- **Styling:** Tailwind CSS
- **Hosting:** Railway

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your local PostgreSQL credentials
```

3. Generate Prisma client and run migrations:
```bash
npx prisma generate
npx prisma migrate dev
```

4. Run the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Railway Deployment

### Prerequisites

- [Railway CLI](https://docs.railway.app/develop/cli) installed
- GitHub account with Railway app authorized

### Deploy Steps

1. **Create GitHub repository:**
```bash
gh repo create fidgetbot/ukrainium --public --source=. --push
```

2. **Install Railway CLI:**
```bash
brew install railway
railway login
```

3. **Create Railway project:**
```bash
railway init
```

4. **Add PostgreSQL service:**
In Railway dashboard, click "New" → "Database" → "Add PostgreSQL"

5. **Link your service:**
```bash
railway service link ukrainium
```

6. **Set environment variables:**
```bash
# Get DATABASE_URL from Railway PostgreSQL service
railway variable set DATABASE_URL="your-postgresql-url"
railway variable set AUTH_SECRET="your-secret-key-min-32-chars"
railway variable set NODE_ENV=production
```

7. **Deploy:**
```bash
railway up
```

8. **Run database migrations:**
```bash
railway run npm run migrate:deploy
```

9. **Get your public URL:**
```bash
railway domain
```

### Auto-deploy from GitHub

Once set up in Railway dashboard, pushing to GitHub will auto-deploy:

```bash
git add .
git commit -m "Your changes"
git push
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run migrate:deploy` - Deploy database migrations
- `npm run db:transcriptions` - Recompute and backfill word transcriptions
- `npx prisma studio` - Open Prisma database GUI

## Updating Transcriptions

If the transcription rules change, update `prisma/seed-transcriptions.ts` and rerun:

```bash
npm run db:transcriptions
```

To update the Railway production database after deploy, run the same backfill script in Railway's environment so it uses the production `DATABASE_URL`:

```bash
railway run npm run db:transcriptions
```

This updates the stored transcription values in PostgreSQL directly. No schema migration is needed.

## Features

- User registration & login
- Session-based authentication
- Protected dashboard
- PostgreSQL persistence
- Railway-ready deployment

## License

MIT
