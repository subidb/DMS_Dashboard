# Deployment Guide

## Overview

This guide covers deploying the DMS Dashboard with frontend on Vercel and backend on a separate hosting service.

## Deployment Options

### Option 1: Monorepo (Recommended for Vercel)

**Structure**: Single repository with both frontend and backend
- **Frontend**: Deploy `dms-frontend/` subdirectory to Vercel
- **Backend**: Deploy `backend/` to Railway/Render/AWS separately

**Pros**:
- ✅ Single repository to manage
- ✅ Easy to keep frontend/backend in sync
- ✅ Vercel supports monorepo deployments
- ✅ Shared documentation and scripts

**Cons**:
- ⚠️ Slightly more complex CI/CD setup
- ⚠️ Need to configure Vercel for subdirectory

### Option 2: Separate Repositories

**Structure**: Two separate repositories
- **Frontend Repo**: `dms-frontend/` only
- **Backend Repo**: `backend/` only

**Pros**:
- ✅ Simpler deployment (each service independent)
- ✅ Separate access controls
- ✅ Independent versioning

**Cons**:
- ⚠️ Need to maintain two repositories
- ⚠️ Harder to keep in sync
- ⚠️ More complex for shared code/types

## Recommended: Monorepo Approach

For Vercel deployment, we recommend keeping a monorepo and deploying the frontend subdirectory.

## Frontend Deployment (Vercel)

### Step 1: Push to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/dms-dashboard.git
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `dms-frontend` (important!)
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `.next` (default)

### Step 3: Configure Environment Variables

In Vercel project settings, add:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com
```

**Important**: Replace with your actual backend URL (e.g., Railway, Render, AWS)

### Step 4: Deploy

Vercel will automatically:
- Install dependencies
- Build the Next.js app
- Deploy to production

## Backend Deployment Options

### Option A: Railway (Easiest)

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Configure:
   - **Root Directory**: `backend`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables:
   ```
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-bucket
   OPENAI_API_KEY=your_key (optional)
   SECRET_KEY=your_secret
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   ```
6. Railway will provide a URL like: `https://your-app.railway.app`

### Option B: Render

1. Go to https://render.com
2. Create new "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (same as Railway)
6. Render provides: `https://your-app.onrender.com`

### Option C: AWS (EC2/ECS/Lambda)

For AWS deployment, see AWS-specific documentation.

## Configuration Updates

### Update Frontend Environment

After backend is deployed, update Vercel environment variable:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com
```

### Update Backend CORS

In `backend/app/config.py`, ensure `ALLOWED_ORIGINS` includes your Vercel URL:

```python
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-custom-domain.com
```

## Monorepo Vercel Configuration

Create `vercel.json` in root directory:

```json
{
  "buildCommand": "cd dms-frontend && npm run build",
  "outputDirectory": "dms-frontend/.next",
  "installCommand": "cd dms-frontend && npm install",
  "framework": "nextjs",
  "rootDirectory": "dms-frontend"
}
```

Or configure in Vercel dashboard:
- **Root Directory**: `dms-frontend`
- **Build Command**: `npm run build` (runs in dms-frontend)
- **Output Directory**: `.next`

## Separate Repository Setup (Alternative)

If you prefer separate repositories:

### Frontend Repository

```bash
# Create new repo for frontend
cd dms-frontend
git init
git add .
git commit -m "Initial frontend commit"
git remote add origin https://github.com/yourusername/dms-frontend.git
git push -u origin main
```

### Backend Repository

```bash
# Create new repo for backend
cd backend
git init
git add .
git commit -m "Initial backend commit"
git remote add origin https://github.com/yourusername/dms-backend.git
git push -u origin main
```

**Note**: You'll need to update `.gitignore` files accordingly.

## Environment Variables Summary

### Frontend (Vercel)
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL

### Backend (Railway/Render/AWS)
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region (e.g., us-east-1)
- `AWS_S3_BUCKET` - S3 bucket name
- `OPENAI_API_KEY` - OpenAI API key (optional)
- `SECRET_KEY` - Application secret key
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins

## Testing Deployment

1. **Test Backend**: 
   ```bash
   curl https://your-backend-url.com/health
   ```

2. **Test Frontend**:
   - Visit your Vercel URL
   - Check browser console for API errors
   - Verify API calls are going to correct backend URL

## Troubleshooting

### Frontend can't connect to backend
- Check `NEXT_PUBLIC_API_BASE_URL` in Vercel
- Verify backend is running and accessible
- Check CORS settings in backend
- Verify `ALLOWED_ORIGINS` includes Vercel URL

### CORS errors
- Add Vercel URL to `ALLOWED_ORIGINS` in backend
- Restart backend after updating CORS
- Check browser console for specific CORS error

### Build failures
- Check Vercel build logs
- Verify all dependencies in `package.json`
- Ensure `NEXT_PUBLIC_API_BASE_URL` is set

## Next Steps

1. Deploy backend first (get URL)
2. Update frontend environment variable with backend URL
3. Deploy frontend to Vercel
4. Test end-to-end functionality
5. Set up custom domain (optional)

