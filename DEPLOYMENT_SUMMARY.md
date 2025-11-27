# Quick Deployment Summary

## Recommended Approach: **Monorepo** (Single Repository)

Keep everything in one repository and deploy:
- **Frontend** → Vercel (from `dms-frontend/` subdirectory)
- **Backend** → Railway/Render (from `backend/` subdirectory)

## Why Monorepo?

✅ **Easier to manage** - Single repository
✅ **Vercel supports it** - Can deploy subdirectory
✅ **Keep in sync** - Frontend and backend changes together
✅ **Shared documentation** - One README for everything

## Deployment Steps

### 1. Push to GitHub (Monorepo)

```bash
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/yourusername/dms-dashboard.git
git push -u origin main
```

### 2. Deploy Frontend to Vercel

1. Go to https://vercel.com → New Project
2. Import your GitHub repository
3. **Configure**:
   - **Root Directory**: `dms-frontend`
   - **Framework**: Next.js (auto-detected)
4. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com
   ```
   (Add this AFTER backend is deployed)
5. Deploy!

### 3. Deploy Backend to Railway

1. Go to https://railway.app → New Project
2. Deploy from GitHub repo
3. **Configure**:
   - **Root Directory**: `backend`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables**:
   ```
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-bucket
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   SECRET_KEY=your_secret_key
   ```
5. Railway provides URL: `https://your-app.railway.app`

### 4. Update Frontend Environment

After backend is deployed:
1. Go to Vercel → Your Project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_BASE_URL` to your Railway URL
3. Redeploy frontend

## Alternative: Separate Repositories

If you prefer separate repos:

### Frontend Repo
```bash
cd dms-frontend
git init
git add .
git commit -m "Frontend"
git remote add origin https://github.com/yourusername/dms-frontend.git
git push -u origin main
```

### Backend Repo
```bash
cd backend
git init
git add .
git commit -m "Backend"
git remote add origin https://github.com/yourusername/dms-backend.git
git push -u origin main
```

Then deploy each separately.

## Files Created

- ✅ `vercel.json` - Vercel configuration for monorepo
- ✅ `DEPLOYMENT_GUIDE.md` - Detailed deployment guide
- ✅ `dms-frontend/.env.example` - Frontend environment template

## Next Steps

1. **Choose approach** (Monorepo recommended)
2. **Push to GitHub**
3. **Deploy backend first** (get URL)
4. **Deploy frontend** (use backend URL)
5. **Test and verify**

See `DEPLOYMENT_GUIDE.md` for complete instructions.

