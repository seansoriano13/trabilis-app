# Render SMTP Migration Guide

## Problem
Starting September 26th, 2024, Render's free tier will block outbound traffic to SMTP ports 25, 465, and 587. This affects your current Gmail SMTP implementation.

## Solution
We've migrated your email service from Gmail SMTP to Resend, which uses HTTPS API calls instead of SMTP ports.

## What Changed

### 1. New Email Service
- **File**: `backend/src/services/resendEmailService.js`
- **Replaces**: `backend/src/services/emailService.js`
- **Uses**: Resend API instead of Gmail SMTP

### 2. Updated Controllers
All controllers now import from the new Resend service:
- `backend/src/controllers/testController.js`
- `backend/src/controllers/visaInquiryController.js`
- `backend/src/controllers/admin/flightController.js`
- `backend/src/controllers/admin/tourController.js`
- `backend/src/controllers/webhookController.js`
- `backend/src/services/bookingService.js`

### 3. New Dependencies
- Added `resend` package to `package.json`

## Required Environment Variables

Add these to your `.env` file:

```bash
# Resend Email Configuration (REQUIRED)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=Trabilis <onboarding@resend.dev>

# Legacy Gmail SMTP (DEPRECATED - Can be removed)
# GMAIL_SMTP_USER=your_gmail@gmail.com
# GMAIL_SMTP_PASS=your_app_password
# GMAIL_SMTP_FROM=your_gmail@gmail.com
```

## Setup Instructions

### 1. Get Resend API Key
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to your environment variables

### 2. Configure Domain (Optional but Recommended)
1. In Resend dashboard, add your domain
2. Verify your domain with DNS records
3. Update `RESEND_FROM_EMAIL` to use your domain

### 3. Deploy to Render
1. Add the new environment variables to your Render service
2. Deploy your updated code
3. Test email functionality

## Benefits of Resend

### Free Tier
- **3,000 emails/month**
- **100 emails/day**
- **No SMTP port restrictions**

### Paid Plans
- **$20/month** for 50,000 emails
- Better deliverability than Gmail SMTP
- Detailed analytics and tracking
- Modern API with better error handling

## Testing

### 1. Test Email Sending
```bash
# Test flight confirmation email
curl -X POST http://localhost:3000/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{"bookingReference": "your_booking_ref"}'
```

### 2. Check Logs
Look for these success messages:
- `✅ Flight confirmation email sent via Resend`
- `✅ Tour confirmation email sent via Resend`
- `✅ Visa inquiry confirmation email sent via Resend`

## Rollback Plan

If you need to rollback:
1. Revert all import statements to use `emailService.js`
2. Keep Gmail SMTP environment variables
3. Deploy the rollback

## Support

- **Resend Documentation**: https://resend.com/docs
- **Render SMTP Blocking**: https://render.com/changelog/free-web-services-will-no-longer-allow-outbound-traffic-to-smtp-ports

## Migration Checklist

- [x] Install Resend package
- [x] Create new email service
- [x] Update all controller imports
- [x] Test email functionality
- [ ] Add Resend API key to environment
- [ ] Deploy to Render
- [ ] Verify emails are working
- [ ] Remove old Gmail SMTP variables (optional)
