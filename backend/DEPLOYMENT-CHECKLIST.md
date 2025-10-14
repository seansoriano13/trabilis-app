# 🚀 Trabilis Backend Deployment Checklist

## ✅ Pre-Deployment Status

### 🔧 Core Fixes Applied
- [x] **PDF Generation Fixed** - Syntax error in `brevoEmailService.js` resolved
- [x] **Email Service Working** - All email functions tested and working
- [x] **Puppeteer Optimized** - Production-ready configuration for Render
- [x] **Debug Logs Optimized** - Reduced logging in production mode
- [x] **Test Files Organized** - Moved to `tests/` directory

### 📁 File Structure Cleaned
```
backend/
├── src/
│   └── services/
│       └── brevoEmailService.js ✅ (Fixed & Optimized)
├── tests/
│   ├── test-pdf-simple.js
│   ├── test-pdf-generation.js
│   ├── test-pdf-with-payload.js
│   ├── test-summary.js
│   ├── examples/
│   │   ├── example-flight-payload.json
│   │   ├── example-tour-payload.json
│   │   └── test-*.pdf
│   └── docs/
│       └── PDF-TESTING-README.md
├── DEPLOYMENT-GUIDE.md
├── DEPLOYMENT-CHECKLIST.md
└── production.env.example
```

## 🚀 Render Deployment Steps

### 1. Environment Variables Setup
Copy these to your Render environment variables:

**Required:**
- `NODE_ENV=production`
- `BREVO_API_KEY=your_brevo_api_key`
- `BREVO_FROM_EMAIL=your_from_email`
- `SUPABASE_URL=your_supabase_url`
- `SUPABASE_ANON_KEY=your_supabase_anon_key`
- `AMADEUS_API_KEY=your_amadeus_api_key`
- `AMADEUS_API_SECRET=your_amadeus_api_secret`
- `STRIPE_SECRET_KEY=your_stripe_secret_key`
- `STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret`

**Optional (Render-optimized):**
- `PUPPETEER_USER_DATA_DIR=/tmp/puppeteer-user-data`
- `PUPPETEER_USE_SYSTEM_CHROME=false`
- `RENDER_EXTERNAL_URL=your_render_url`
- `BACKEND_URL=your_backend_url`

### 2. Build Configuration
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Node Version:** 18.x or 20.x (recommended)

### 3. Memory & Performance
- **Free Tier:** 512MB RAM (may be tight for PDF generation)
- **Paid Tier:** Recommended for production (1GB+ RAM)
- **PDF Generation:** ~50-100MB during processing
- **Expected Time:** 4-7 seconds per PDF

## 🧪 Post-Deployment Testing

### Quick Health Check
```bash
curl "https://your-render-url.onrender.com/api/health"
```

### Test PDF Generation
```bash
# Test mock flight PDF
curl "https://your-render-url.onrender.com/api/test/mock-pdf"

# Test real booking PDF (if you have a booking reference)
curl "https://your-render-url.onrender.com/api/test/real-pdf?bookingReference=YOUR_REF"
```

### Test Email Service
```bash
# Test flight confirmation email
curl -X POST "https://your-render-url.onrender.com/api/test/flight-email" \
  -H "Content-Type: application/json" \
  -d '{"bookingReference":"TRB-FLT-TEST123","testEmail":"test@example.com"}'

# Test tour confirmation email
curl -X POST "https://your-render-url.onrender.com/api/test/tour-email" \
  -H "Content-Type: application/json" \
  -d '{"testEmail":"test@example.com","tourTitle":"Test Tour"}'
```

## 🔍 Monitoring & Troubleshooting

### Key Metrics to Watch
- **Memory Usage:** Should stay under 400MB on free tier
- **Response Time:** PDF generation <10 seconds
- **Error Rate:** Should be <1%
- **Email Delivery:** Monitor Brevo dashboard

### Common Issues & Solutions

#### 1. PDF Generation Fails
**Symptoms:** 500 error, timeout, or memory issues
**Solutions:**
- Check Render logs for Puppeteer errors
- Verify `@sparticuz/chromium` is installed
- Consider upgrading to paid tier for more memory
- Check if `NODE_ENV=production` is set

#### 2. Email Sending Fails
**Symptoms:** Emails not received, API errors
**Solutions:**
- Verify Brevo API key is correct
- Check email format and content
- Verify recipient email addresses
- Check Brevo rate limits (300/day on free tier)

#### 3. Memory Issues
**Symptoms:** Service crashes, out of memory errors
**Solutions:**
- Upgrade to paid Render tier
- Monitor memory usage in dashboard
- Consider reducing PDF complexity
- Implement PDF caching if needed

### Debug Commands
```bash
# Check service status
curl "https://your-render-url.onrender.com/api/health"

# List available booking references
curl "https://your-render-url.onrender.com/api/test/booking-references"

# Debug specific booking
curl "https://your-render-url.onrender.com/api/test/debug-booking?bookingReference=YOUR_REF"
```

## ✅ Final Verification Checklist

Before going live, verify:

- [ ] Service starts without errors
- [ ] Health check endpoint responds
- [ ] PDF generation works (test with mock data)
- [ ] Email sending works (test with real email)
- [ ] Database connections are working
- [ ] All API endpoints respond correctly
- [ ] Error handling is working properly
- [ ] Logs are being generated correctly
- [ ] Memory usage is within limits
- [ ] Response times are acceptable

## 🎯 Success Criteria

**Deployment is successful when:**
1. ✅ Service runs without crashes
2. ✅ PDF generation completes in <10 seconds
3. ✅ Emails are delivered successfully
4. ✅ All API endpoints respond correctly
5. ✅ Memory usage stays under limits
6. ✅ Error rates are <1%

## 🚨 Emergency Rollback

If issues occur:
1. Check Render logs for specific errors
2. Verify environment variables are correct
3. Test with mock data to isolate issues
4. Consider rolling back to previous version
5. Contact support if needed

---

**Ready for deployment! 🚀**

The PDF generation issue has been fixed and the service is optimized for Render deployment.
