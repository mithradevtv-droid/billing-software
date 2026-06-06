# Render Deployment Guide

Complete step-by-step guide to deploy LedgerOne Billing System on Render.

## 📋 Prerequisites

- GitHub account
- Render account (free at [render.com](https://render.com))
- Git installed locally

## 🎯 Step 1: Prepare Repository for Deployment

### 1.1 Initialize Git (if not already done)

```bash
cd /mnt/c/Users/mitradev/billing-system
git init
git add .
git commit -m "Initial commit: LedgerOne Billing System"
```

### 1.2 Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Create repository: `billing-system`
3. Do NOT initialize with README (we already have one)
4. Click "Create repository"

### 1.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/billing-system.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## 🚀 Step 2: Deploy on Render

### 2.1 Create Web Service

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** button
3. Select **"Web Service"**
4. Connect GitHub account if prompted

### 2.2 Select Repository

1. Search for `billing-system` repository
2. Click "Connect"
3. Fill in deployment settings:

| Field | Value |
|-------|-------|
| **Name** | `billing-system` |
| **Environment** | `Node` |
| **Region** | Choose closest to your location |
| **Branch** | `main` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | `Free` |

### 2.3 Set Environment Variables

1. Scroll down to **"Environment"** section
2. Add variables:

```
NODE_ENV = production
```

3. Click "Create Web Service"

## 💾 Step 3: Configure Persistent Storage (Database)

This is **critical** for SQLite database persistence!

### 3.1 Add Disk to Service

After service is created:

1. Go to your service dashboard
2. Click **"Disks"** tab (left sidebar)
3. Click **"Add Disk"**
4. Configure:

| Field | Value |
|-------|-------|
| **Name** | `billing_db` |
| **Mount Path** | `/opt/render/project/src` |
| **Size** | `1 GB` |

5. Click "Add Disk"

### 3.2 Verify Database Path

The app automatically detects production and uses the persistent disk path:
- Development: `./billing.db` (local)
- Production: `/opt/render/project/src/billing.db` (persistent)

## ✅ Step 4: Verify Deployment

### 4.1 Check Build Status

1. Go to service dashboard
2. Watch logs in **"Logs"** section
3. You should see:
   ```
   ✓ Ready in XX.Xs
   ```

### 4.2 Test Application

1. Click service URL (at top of dashboard)
2. You should see homepage at `https://your-app-name.onrender.com`
3. Navigate to billing page: `https://your-app-name.onrender.com/billing`

### 4.3 Check Database

1. Open browser console (F12)
2. Navigate to billing page
3. Check API calls in Network tab:
   - `/api/settings` ✅
   - `/api/products` ✅
   - `/api/customers` ✅

## 🔄 Step 5: Continuous Deployment

### 5.1 Auto-Deploy on Push

Render automatically redeploys when you push to main:

```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main

# Render automatically rebuilds and deploys
```

### 5.2 Manual Redeploy

If needed, manually redeploy from Render dashboard:

1. Go to service settings
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

## 🛠️ Step 6: Troubleshooting

### Issue: "Build failed"

**Check:**
- Node version compatibility: `node -v` (should be 18+)
- Dependencies install: `npm install` locally
- TypeScript errors: `npm run build` locally
- Environment variables set correctly

**Fix:**
```bash
# Delete node_modules and lock file
rm -rf node_modules package-lock.json
npm install
git add .
git commit -m "Fix: update dependencies"
git push origin main
```

### Issue: "Database errors / 404 on products"

**Check:**
- Disk is attached: Go to Disks tab, verify `billing_db` exists
- Mount path is `/opt/render/project/src`
- API endpoints working: Check Network tab in DevTools

**Fix:**
1. Delete old disk
2. Create new disk with correct settings
3. Redeploy service

### Issue: "Cold start timeout"

**Solution:**
Upgrade from Free to Starter plan ($7/month):
- No cold starts
- Better performance
- Faster deployments

## 📊 Monitoring

### View Logs

In Render dashboard:
1. Go to service → **"Logs"** tab
2. View real-time logs
3. Filter by type (Build, Deploy, Runtime)

### Check Performance

1. Service → **"Metrics"** tab
2. Monitor:
   - CPU usage
   - Memory usage
   - Request count
   - Response time

## 🔐 Security Best Practices

1. **Never commit secrets:**
   ```bash
   # Use .gitignore (already configured)
   # Secrets in Render dashboard only
   ```

2. **Enable Render authentication:**
   - Service → Settings → Toggle "Private Service"

3. **Regular backups:**
   - Download database regularly
   - Backup command: (see section below)

## 💾 Backup Database

### Download Database

```bash
# Via Render dashboard:
1. Go to Disks tab
2. Click "Download backup"
3. Save billing.db locally

# Or via SSH (Paid plans only):
ssh render@YOUR_SERVICE_HOST
cp /opt/render/project/src/billing.db ~/backup.db
```

### Restore Database

1. Create new disk
2. Upload database file via Render dashboard
3. Redeploy service

## 📈 Scaling Up (Future)

When you need to scale:

### Option 1: Upgrade Render Plan
- Free → Starter ($7/month)
- Better performance, no cold starts

### Option 2: Use PostgreSQL
- Migrate from SQLite to PostgreSQL
- Set up on Render (free tier available)
- Scale database separately

## 🎓 Useful Commands

```bash
# Local testing (production mode)
NODE_ENV=production npm run build
NODE_ENV=production npm start

# Check build size
npm run build
du -sh .next/

# Monitor service
curl -I https://your-app-name.onrender.com

# View recent pushes
git log --oneline -5
```

## ✨ Features After Deployment

Your deployed app includes:

✅ Billing invoice creation  
✅ GST calculations  
✅ Product inventory  
✅ Customer database  
✅ Tax reports (GSTR1)  
✅ Persistent database  
✅ 24/7 availability  

## 📞 Support

If issues occur:

1. **Check Render docs**: [render.com/docs](https://render.com/docs)
2. **View service logs**: Render dashboard → Logs
3. **Test locally first**: `npm run build && npm start`
4. **Check database**: Verify disk is attached and mounted

## 🎉 Deployment Complete!

Your LedgerOne Billing System is now live!

**URL**: `https://your-app-name.onrender.com`

---

**Next Steps:**
- Share URL with team members
- Set up domain (in Render settings)
- Configure SSL certificate (automatic with Render)
- Monitor and maintain database
