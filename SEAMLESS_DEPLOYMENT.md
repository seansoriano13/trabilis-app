# 🚀 Seamless Deployment Guide

Your Trabilis app is now configured for **seamless deployment**! URLs auto-detect based on the environment, so the same `.env` files work in development and production.

## ✨ What's Different Now?

### Before (Manual Configuration)
- ❌ Had to manually change `NODE_ENV` for production
- ❌ Had to manually change `BACKEND_URL` for deployment
- ❌ Had to manually change `FRONTEND_URL` for deployment
- ❌ Different `.env` files for dev and production

### After (Auto-Detection) ✅
- ✅ `NODE_ENV` auto-set by Render
- ✅ `BACKEND_URL` auto-detected from `RENDER_EXTERNAL_URL`
- ✅ `FRONTEND_URL` defaults to production URL in production
- ✅ **Same `.env` files work everywhere!**

## 🎯 How It Works

### Backend Auto-Detection
```javascript
// Automatically uses:
// - RENDER_EXTERNAL_URL in production (provided by Render)
// - http://localhost:3001 in development
const BACKEND_URL = process.env.RENDER_EXTERNAL_URL || 
                    process.env.BACKEND_URL || 
                    `http://localhost:${port}`
```

### Frontend Auto-Detection
```javascript
// Automatically uses:
// - VITE_BACKEND_URL in production
// - http://localhost:3001 in development (via Vite proxy)
const BACKEND_URL = isProduction
    ? import.meta.env.VITE_BACKEND_URL
    : 'http://localhost:3001'
```

## 📦 Deployment Steps (Super Simple!)

### 1. Backend on Render

1. **Go to render.com** → New Web Service
2. **Connect your repository**
3. **Configure:**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Add Environment Variables:**
   - Copy ALL variables from `backend/.env`
   - Paste into Render dashboard
   - **That's it!** No need to change URLs or NODE_ENV
5. **Optional:** Set `FRONTEND_URL=https://trabilis.vercel.app` (only if you have a custom domain)

### 2. Frontend on Vercel

1. **Go to vercel.com** → New Project
2. **Import your repository**
3. **Configure:**
   - Root Directory: `frontend`
   - Framework: Vite
4. **Add Environment Variables:**
   - Copy ALL variables from `frontend/.env`
   - Paste into Vercel dashboard
   - The `VITE_BACKEND_URL` should already be set to your Render URL!
5. **Deploy!**

## 🎉 That's It!

### What You Upload (Never Change These!)

**backend/.env:**
```env
# Supabase keys
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# API keys
AMADEUS_API_KEY=...
STRIPE_SECRET_KEY=...
BREVO_API_KEY=...
# ... etc (all your API keys)
```

**frontend/.env:**
```env
# Supabase
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# Backend URL (production)
VITE_BACKEND_URL=https://trabilis.onrender.com

# Other APIs
VITE_OPEN_WEATHER_API_KEY=...
```

## 🔄 How Auto-Detection Works

### In Development:
```
Backend:  http://localhost:3001 (auto-detected)
Frontend: http://localhost:5173 (auto-detected)
CORS:     Allows localhost origins
```

### In Production (Render + Vercel):
```
Backend:  https://trabilis.onrender.com (from RENDER_EXTERNAL_URL)
Frontend: https://trabilis.vercel.app (from Vercel)
CORS:     Allows your Vercel domain
```

### Environment Variables That Auto-Set:

| Variable | Development | Production | Source |
|----------|-------------|------------|--------|
| `NODE_ENV` | `development` | `production` | Render auto-sets |
| `PORT` | `3001` | Dynamic | Render provides |
| `BACKEND_URL` | `localhost:3001` | `RENDER_EXTERNAL_URL` | Auto-detected |
| `FRONTEND_URL` | `localhost:5173` | `trabilis.vercel.app` | Auto-detected |

## 🛠️ Updating for Production

### If You Deploy to Different URLs

**Only if your URLs are different**, add to Render:
```env
FRONTEND_URL=https://your-custom-domain.com
```

**And update Vercel:**
```env
VITE_BACKEND_URL=https://your-backend.onrender.com
```

But for the default setup (trabilis.onrender.com + trabilis.vercel.app), you don't need to do anything!

## 🎯 Key Benefits

1. **✅ Upload Once**: Same `.env` works everywhere
2. **✅ No Manual Changes**: URLs auto-detect
3. **✅ No Mistakes**: Can't forget to change NODE_ENV
4. **✅ Preview Deploys**: Vercel preview URLs automatically work
5. **✅ Easy Updates**: Just push code, everything adapts

## 📝 What Changed in Your Code

### Backend (`server.js`):
- Auto-detects URLs from environment
- Auto-configures CORS based on detected environment
- Shows environment info on startup

### Frontend (`config.js`):
- New configuration file for centralized settings
- Auto-detects production vs development
- Logs configuration in development

### Email Service:
- Uses auto-detected backend URL
- Works seamlessly in dev and production

## 🔍 Troubleshooting

### Backend Logs Show Wrong URL?
Check the startup logs:
```
🌍 Environment: PRODUCTION
🔗 Backend URL: https://trabilis.onrender.com
🔗 Frontend URL: https://trabilis.vercel.app
```

If these are wrong, check your environment variables.

### CORS Errors?
The backend logs will show:
```
⚠️  CORS blocked request from origin: https://some-url.com
   Allowed origins: https://trabilis.vercel.app, ...
```

This tells you exactly what origins are allowed.

### Frontend Can't Connect?
Check browser console for the config log:
```
🔧 Frontend Configuration:
   Environment: PRODUCTION
   Backend URL: https://trabilis.onrender.com
```

## 🎊 You're Done!

Your deployment is now truly seamless. Just:
1. Upload your `.env` files to Render and Vercel
2. Deploy
3. It just works! ✨

No more manual URL changes, no more forgetting to set NODE_ENV, no more different configs for different environments!

---

Need help? Check `DEPLOYMENT.md` for detailed instructions or contact: lindelatravelctws@gmail.com

