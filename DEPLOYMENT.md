# Trabilis Deployment Guide

This guide covers deploying the Trabilis application with the backend on Render and the frontend on Vercel.

## 📋 Pre-Deployment Checklist

- [ ] All API keys and credentials are ready
- [ ] Supabase database is set up with proper tables and RLS policies
- [ ] Stripe account is configured with products/pricing (if applicable)
- [ ] Domain names are ready (optional)
- [ ] Code is pushed to a Git repository (GitHub recommended)

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and API keys

### 2. Set Up Database Schema

Import your database schema using the Supabase SQL Editor or migration tool.

### 3. Configure Row Level Security (RLS)

Ensure proper RLS policies are in place for security.

## 🔧 Backend Deployment (Render)

### 1. Prepare Your Repository

Ensure your code is pushed to GitHub, GitLab, or Bitbucket.

### 2. Create a New Web Service

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your repository
4. Configure the service:
   - **Name**: `trabilis-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your production branch)
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid plan for production)

### 3. Set Environment Variables

In the Render dashboard, add these environment variables:

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-app.vercel.app
BACKEND_URL=https://your-app.onrender.com

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Amadeus
AMADEUS_API_KEY=your-amadeus-key
AMADEUS_API_SECRET=your-amadeus-secret

# Stripe
STRIPE_SECRET_KEY=sk_live_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Brevo
BREVO_API_KEY=your-brevo-key
BREVO_FROM_EMAIL=noreply@yourdomain.com

# JWT
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=1d

# Image Upload
IMG_BB_API_KEY=your-imgbb-key
IMG_BB_API_URL=https://api.imgbb.com/1/upload
TINIFY_API_KEY=your-tinify-key
```

### 4. Configure Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-app.onrender.com/api/v1/webhooks/stripe`
3. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 5. Deploy

Click "Create Web Service" and wait for deployment to complete.

Note your backend URL: `https://your-app.onrender.com`

## 🎨 Frontend Deployment (Vercel)

### 1. Prepare Your Repository

Ensure your code is pushed to GitHub, GitLab, or Bitbucket.

### 2. Import Project to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3. Set Environment Variables

In Vercel project settings → Environment Variables, add:

```env
VITE_BACKEND_URL=https://your-app.onrender.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPEN_WEATHER_API_KEY=your-weather-api-key
```

### 4. Deploy

Click "Deploy" and wait for build to complete.

Note your frontend URL: `https://your-app.vercel.app`

### 5. Update Backend CORS

Go back to Render and update `FRONTEND_URL` with your actual Vercel URL.

## 🔄 Post-Deployment Steps

### 1. Update Environment Variables

Ensure both frontend and backend are using the correct production URLs:

**Backend:**
- `FRONTEND_URL` = Your Vercel URL
- `BACKEND_URL` = Your Render URL

**Frontend:**
- `VITE_BACKEND_URL` = Your Render URL

### 2. Test the Application

1. Visit your frontend URL
2. Test user flows:
   - Search for flights
   - Browse tour packages
   - Submit visa inquiry
   - Test payment flow (use Stripe test cards)
3. Test admin panel
4. Verify emails are sent

### 3. Configure Custom Domains (Optional)

**Vercel:**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

**Render:**
1. Go to Service Settings → Custom Domains
2. Add your custom domain
3. Configure DNS records as instructed

### 4. Monitor Your Application

**Render:**
- Check logs in the Render dashboard
- Set up notifications for errors

**Vercel:**
- Monitor build and function logs
- Set up analytics (optional)

**Supabase:**
- Monitor database performance
- Check API usage

## 🔐 Security Considerations

1. **Use Strong Secrets**: Generate strong random strings for `JWT_SECRET`
2. **Separate Keys**: Use different API keys for development and production
3. **HTTPS Only**: Both Render and Vercel provide HTTPS by default
4. **Environment Variables**: Never commit `.env` files to version control
5. **Rotate Keys**: Regularly rotate API keys and secrets
6. **Monitor Logs**: Regularly check application logs for suspicious activity

## 🐛 Troubleshooting

### Backend Won't Start
- Check Render logs for errors
- Verify all required environment variables are set
- Check that `NODE_ENV` is set to `production`

### Frontend Can't Connect to Backend
- Verify `VITE_BACKEND_URL` is correct
- Check CORS configuration on backend
- Ensure backend is running and healthy

### Database Connection Fails
- Verify Supabase credentials
- Check Supabase project is active
- Ensure IP restrictions allow Render's IPs (if configured)

### Stripe Webhooks Not Working
- Verify webhook URL is correct
- Check webhook secret matches Stripe dashboard
- Test webhook with Stripe CLI

### Images Not Uploading
- Verify ImgBB API key is valid
- Check Tinify API key (if using compression)
- Review backend logs for errors

### Emails Not Sending
- Verify Brevo API key is valid
- Check sender email is verified in Brevo
- Review Brevo dashboard for send status

## 🚀 Continuous Deployment

Both Render and Vercel support automatic deployments:

- **Auto-deploy on Push**: Both platforms can automatically deploy when you push to your main branch
- **Preview Deployments**: Vercel creates preview deployments for pull requests
- **Rollback**: Both platforms allow quick rollback to previous versions

## 📊 Monitoring and Maintenance

### Performance Monitoring
- Use Vercel Analytics for frontend performance
- Monitor Render metrics for backend performance
- Check Supabase dashboard for database queries

### Regular Maintenance
- Keep dependencies updated (`npm update`)
- Monitor API usage and costs
- Review and rotate secrets periodically
- Back up your database regularly

## 💰 Cost Estimates

### Free Tier Limits
- **Render**: 750 hours/month free (may sleep after inactivity)
- **Vercel**: 100GB bandwidth/month
- **Supabase**: 500MB database, 1GB file storage, 2GB bandwidth

### When to Upgrade
- High traffic (consider paid Render instance)
- Need guaranteed uptime (Render paid plans don't sleep)
- More database storage/bandwidth needed
- Production use cases

## 📞 Support Resources

- **Render**: [render.com/docs](https://render.com/docs)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)

---

Need help? Contact: lindelatravelctws@gmail.com

