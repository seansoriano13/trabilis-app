# Manual Testing Guide for Cancellation System

## 🎯 Overview

This guide provides step-by-step instructions for manually testing the flight cancellation system with email verification. Follow these scenarios to ensure the system works correctly.

## 🚀 Prerequisites

### 1. Environment Setup

```bash
# Start backend server
cd backend
npm start

# Start frontend (in new terminal)
cd frontend
npm run dev
```

### 2. Access URLs

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Admin Dashboard**: http://localhost:5173/admin

### 3. Test Data Setup

You'll need at least one booking in each status:

- `PENDING_PAYMENT` - Can be cancelled (no refund needed)
- `PAID_PENDING_BOOKING` - Can be cancelled (full refund)
- `BOOKED` - Can be cancelled (non-refundable)
- `CANCELLED` - Already cancelled (should fail)
- `PENDING_TICKETING` - Can be cancelled by admin only

---

## 📋 Test Scenarios

### Scenario 1: Customer Cancellation Flow (Happy Path)

#### Step 1: Access Booking Tracking

1. Open browser and go to http://localhost:5173
2. Navigate to "Track Booking" or go directly to http://localhost:5173/track-booking
3. Enter a valid booking reference and email address
4. Click "Track Booking"

**Expected Result**: Booking details should be displayed

#### Step 2: Request Cancellation

1. On the booking details page, look for "Cancel Booking" button
2. Click "Cancel Booking"
3. Enter cancellation reason (optional)
4. Click "Request Cancellation"

**Expected Result**:

- Success message: "Cancellation request submitted. Please check your email for verification."
- Email should be sent to the registered email address

#### Step 3: Check Email

1. Check the email inbox for the registered email address
2. Look for email with subject: "Confirm Flight Cancellation - [BOOKING_REF]"
3. Verify email contains:
    - Customer name
    - Booking reference
    - Total amount
    - Cancellation reason
    - Verification link

**Expected Result**: Professional-looking email with all booking details

#### Step 4: Verify Cancellation

1. Click the verification link in the email
2. You should be redirected to a cancellation confirmation page
3. The page should show cancellation success

**Expected Result**:

- Page shows "Booking cancelled successfully"
- Booking status updated to "CANCELLED"
- Confirmation email sent

#### Step 5: Verify Database Updates

1. Check admin dashboard at http://localhost:5173/admin
2. Login with admin credentials
3. Go to "Flights" section
4. Find the cancelled booking
5. Verify status is "CANCELLED"
6. Check cancellation timestamp and reason

**Expected Result**: Booking shows as cancelled with proper metadata

---

### Scenario 2: Error Handling Tests

#### Test 2.1: Invalid Booking Reference

1. Go to track booking page
2. Enter invalid booking reference (e.g., "INVALID-123")
3. Enter valid email
4. Click "Track Booking"

**Expected Result**: Error message "Booking not found"

#### Test 2.2: Wrong Email Address

1. Go to track booking page
2. Enter valid booking reference
3. Enter wrong email address
4. Click "Track Booking"

**Expected Result**: Error message "Email address does not match the booking"

#### Test 2.3: Already Cancelled Booking

1. Try to cancel a booking that's already cancelled
2. Follow the cancellation flow

**Expected Result**: Error message "Booking is already cancelled"

#### Test 2.4: Expired Token

1. Request cancellation
2. Wait for token to expire (1 hour) or use an old token
3. Try to verify with expired token

**Expected Result**: Error message "Invalid or expired token"

---

### Scenario 3: Admin Cancellation Flow

#### Step 1: Access Admin Dashboard

1. Go to http://localhost:5173/admin
2. Login with admin credentials
3. Navigate to "Flights" section

**Expected Result**: List of all flight bookings displayed

#### Step 2: Single Booking Cancellation

1. Find a cancellable booking (status: PENDING_PAYMENT, PAID_PENDING_BOOKING, BOOKED, or PENDING_TICKETING)
2. Click on the booking to view details
3. Look for "Cancel Booking" button
4. Click "Cancel Booking"
5. Enter cancellation reason
6. Confirm cancellation (double confirmation)

**Expected Result**:

- Booking status updated to "CANCELLED"
- Confirmation email sent to customer
- Admin notification displayed

#### Step 3: Bulk Cancellation

1. Select multiple cancellable bookings using checkboxes
2. Click "Bulk Cancel" button
3. Enter cancellation reason
4. Confirm bulk cancellation

**Expected Result**:

- All selected bookings cancelled
- Individual confirmation emails sent
- Bulk operation summary displayed

#### Step 4: Verify Admin Notifications

1. Check for real-time notifications
2. Verify cancellation statistics updated
3. Check admin activity log

**Expected Result**:

- Real-time notification received
- Statistics reflect cancelled bookings
- Activity log shows admin actions

---

### Scenario 4: Email Testing

#### Test 4.1: Email Template Rendering

1. Request cancellation for a booking
2. Check the verification email
3. Verify email template includes:
    - Company branding
    - Customer name
    - Booking details
    - Flight information
    - Total amount
    - Verification button
    - Contact information

**Expected Result**: Professional, well-formatted email

#### Test 4.2: Email Delivery

1. Test with different email providers (Gmail, Yahoo, Outlook)
2. Check spam folder
3. Verify email arrives within 30 seconds

**Expected Result**: Email delivered to inbox within 30 seconds

#### Test 4.3: Confirmation Email

1. Complete a cancellation
2. Check for confirmation email
3. Verify confirmation email content

**Expected Result**: Confirmation email with cancellation details

---

### Scenario 5: Mobile Responsiveness

#### Test 5.1: Mobile Cancellation Flow

1. Open the app on mobile device or use browser dev tools
2. Navigate to track booking
3. Request cancellation
4. Check email on mobile
5. Click verification link
6. Complete cancellation

**Expected Result**: All steps work smoothly on mobile

#### Test 5.2: Mobile Admin Dashboard

1. Access admin dashboard on mobile
2. Test booking management
3. Test cancellation operations

**Expected Result**: Admin functions work on mobile

---

### Scenario 6: Performance Testing

#### Test 6.1: Response Times

1. Measure time for each step:
    - Booking lookup: < 2 seconds
    - Cancellation request: < 2 seconds
    - Email sending: < 30 seconds
    - Token verification: < 2 seconds
    - Database updates: < 1 second

**Expected Result**: All operations complete within expected timeframes

#### Test 6.2: Concurrent Cancellations

1. Open multiple browser tabs
2. Request cancellations simultaneously
3. Verify all requests processed correctly

**Expected Result**: No conflicts or data corruption

---

## 🔍 Verification Checklist

### Customer Flow Verification

- [ ] Booking tracking works
- [ ] Cancellation request submitted successfully
- [ ] Verification email sent and received
- [ ] Email template renders correctly
- [ ] Verification link works
- [ ] Cancellation completed successfully
- [ ] Confirmation email sent
- [ ] Database updated correctly

### Admin Flow Verification

- [ ] Admin dashboard accessible
- [ ] Booking list displays correctly
- [ ] Single cancellation works
- [ ] Bulk cancellation works
- [ ] Real-time notifications work
- [ ] Statistics update correctly
- [ ] Activity log records actions

### Error Handling Verification

- [ ] Invalid booking reference rejected
- [ ] Wrong email address rejected
- [ ] Already cancelled booking rejected
- [ ] Expired token rejected
- [ ] Network errors handled gracefully
- [ ] Database errors handled gracefully

### Email Verification

- [ ] Verification email sent
- [ ] Confirmation email sent
- [ ] Email templates render correctly
- [ ] Email delivered to inbox
- [ ] Email links work correctly
- [ ] Email content is accurate

### Performance Verification

- [ ] Response times meet requirements
- [ ] Concurrent operations work
- [ ] No memory leaks
- [ ] Database queries optimized
- [ ] Email delivery is fast

---

## 🐛 Common Issues & Solutions

### Issue 1: Email Not Received

**Symptoms**: Cancellation request succeeds but no email received
**Solutions**:

- Check spam folder
- Verify email service configuration
- Check Brevo API key
- Test with different email address

### Issue 2: Token Verification Fails

**Symptoms**: Email received but verification link doesn't work
**Solutions**:

- Check token expiration (1 hour limit)
- Verify IP/User-Agent validation
- Check database token storage
- Test with fresh token

### Issue 3: Admin Cancellation Fails

**Symptoms**: Admin can't cancel bookings
**Solutions**:

- Check admin authentication
- Verify booking status allows cancellation
- Check admin permissions
- Verify database connection

### Issue 4: Real-time Notifications Not Working

**Symptoms**: Admin doesn't receive real-time updates
**Solutions**:

- Check Pusher configuration
- Verify WebSocket connection
- Check browser console for errors
- Test with different browser

---

## 📊 Test Results Template

### Test Execution Log

```
Date: ___________
Tester: ___________
Environment: ___________

Customer Flow Tests:
- [ ] Booking tracking: PASS/FAIL
- [ ] Cancellation request: PASS/FAIL
- [ ] Email verification: PASS/FAIL
- [ ] Token verification: PASS/FAIL
- [ ] Confirmation: PASS/FAIL

Admin Flow Tests:
- [ ] Dashboard access: PASS/FAIL
- [ ] Single cancellation: PASS/FAIL
- [ ] Bulk cancellation: PASS/FAIL
- [ ] Notifications: PASS/FAIL

Error Handling Tests:
- [ ] Invalid booking: PASS/FAIL
- [ ] Wrong email: PASS/FAIL
- [ ] Expired token: PASS/FAIL

Performance Tests:
- [ ] Response times: PASS/FAIL
- [ ] Concurrent operations: PASS/FAIL

Issues Found:
1. ________________
2. ________________
3. ________________

Overall Result: PASS/FAIL
```

---

## 🎯 Success Criteria

### Functional Requirements

- [ ] Customer can request cancellation via email
- [ ] Email verification works correctly
- [ ] Admin can cancel bookings individually and in bulk
- [ ] Refunds process according to policy
- [ ] Real-time notifications work
- [ ] Error handling is robust

### Performance Requirements

- [ ] Cancellation request < 2 seconds
- [ ] Email delivery < 30 seconds
- [ ] Admin operations < 5 seconds
- [ ] Database queries optimized

### Security Requirements

- [ ] Tokens are secure and expire properly
- [ ] Email verification prevents unauthorized access
- [ ] Admin operations require authentication
- [ ] Sensitive data is protected

---

## 📞 Support

If you encounter issues during testing:

1. Check the browser console for errors
2. Check the backend logs for errors
3. Verify all environment variables are set
4. Test with different browsers/devices
5. Check network connectivity
6. Verify database connection

**Happy Testing! 🚀**
