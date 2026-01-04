---
description: How to deploy the Travel-ERP application to Vercel
---

# Deploying to Vercel

## Prerequisites
- A [Vercel account](https://vercel.com/signup)
- Git repository (GitHub, GitLab, or Bitbucket)
- Optional: PostgreSQL database (Vercel Postgres, Neon, Supabase, etc.)

## Steps

### 1. Push Your Code to Git
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### 2. Import Project in Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your repository
4. Vercel will auto-detect the configuration from `vercel.json`

### 3. Configure Environment Variables (Optional)
If you want persistent data, add these in Vercel Dashboard > Settings > Environment Variables:
- `DATABASE_URL` - Your PostgreSQL connection string
- `SESSION_SECRET` - A random secure string
- `PAYPAL_CLIENT_ID` - PayPal API client ID
- `PAYPAL_CLIENT_SECRET` - PayPal API secret
- `PAYMOB_API_KEY` - Paymob API key

### 4. Deploy
Click "Deploy" and Vercel will:
1. Build the frontend with Vite
2. Deploy the API as serverless functions
3. Serve static files from `dist/public`

### 5. Access Your App
Your app will be available at:
- `https://your-project.vercel.app`

## Notes

### In-Memory Storage (Demo Mode)
By default, the Vercel deployment uses **in-memory storage** for demo purposes. This means:
- Data resets when serverless functions cold-start
- Not suitable for production with real users

### Persistent Database
For production, connect a PostgreSQL database:
1. Create a database on [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Vercel Postgres](https://vercel.com/storage/postgres)
2. Add the `DATABASE_URL` environment variable in Vercel
3. Run `npx drizzle-kit push` locally to set up the schema

### Local Development
```powershell
$env:DATABASE_URL=''; $env:NODE_ENV='development'; npx tsx server/index.ts
```

## Files Created for Vercel
- `vercel.json` - Deployment configuration
- `api/index.js` - Serverless API handler
