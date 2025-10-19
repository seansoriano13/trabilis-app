# Comprehensive Testing Plan for Trabilis App

## 🎯 Overview

This testing plan covers the flight cancellation system with email verification implemented since commit `de24d6d21da3129b7981d75763cdadd4642852bc`. The plan includes hybrid testing with automation for eligible features and manual testing for complex user flows.

## 📋 Recent Changes to Test

### Core Features Added:

1. **Customer Cancellation Flow** - Email verification system
2. **Admin Cancellation Management** - Bulk operations and dashboard
3. **Token-based Security** - Secure cancellation tokens with expiration
4. **Email Integration** - Brevo email service for verification and confirmations
5. **Real-time Notifications** - Pusher integration for admin alerts
6. **Refund Processing** - Stripe integration for different cancellation scenarios

---

## 🧪 Testing Strategy

### 1. Automated Testing (API & Unit Tests)

#### A. Cancellation API Tests

**File**: `backend/tests/cancellation-api.test.js`

```javascript
// Test cases to implement:
- POST /api/v1/cancel-booking/request - Request cancellation
- POST /api/v1/cancel-booking/verify - Verify cancellation token
- GET /api/v1/cancel-booking/status - Check token status
- POST /api/v1/cancel-booking/resend - Resend verification email
- POST /api/v1/admin/cancellation/cancel - Admin cancellation
- GET /api/v1/admin/cancellation/status/:booking_reference - Get status
```

#### B. Token Service Tests

**File**: `backend/tests/cancellation-token.test.js`

```javascript
// Test cases:
- Token generation and validation
- Token expiration handling
- IP/User-Agent security validation
- Token cleanup and invalidation
```

#### C. Email Service Tests

**File**: `backend/tests/email-service.test.js`

```javascript
// Test cases:
- Cancellation verification email sending
- Cancellation confirmation email sending
- Email template rendering
- Error handling for email failures
```

### 2. Integration Testing

#### A. End-to-End Cancellation Flow

**File**: `backend/tests/integration/cancellation-flow.test.js`

```javascript
// Complete flow tests:
1. Customer requests cancellation
2. Email verification sent
3. Customer clicks verification link
4. Cancellation processed
5. Confirmation email sent
6. Admin notifications triggered
7. Database updated correctly
```

#### B. Admin Dashboard Integration

**File**: `backend/tests/integration/admin-cancellation.test.js`

```javascript
// Admin flow tests:
1. Admin views cancellation dashboard
2. Bulk cancellation operations
3. Real-time notifications
4. Cancellation statistics
5. Refund processing
```

### 3. Manual Testing Scenarios

#### A. Customer Cancellation Flow

1. **Valid Cancellation Request**
    - Go to booking tracking page
    - Enter valid booking reference and email
    - Submit cancellation request
    - Check email for verification link
    - Click verification link
    - Verify cancellation success

2. **Invalid Scenarios**
    - Wrong email address
    - Invalid booking reference
    - Already cancelled booking
    - Expired booking
    - Booking that has departed

3. **Token Expiration**
    - Request cancellation
    - Wait for token to expire (1 hour)
    - Try to verify with expired token
    - Verify proper error handling

#### B. Admin Cancellation Flow

1. **Single Booking Cancellation**
    - Login to admin dashboard
    - Find a cancellable booking
    - Initiate cancellation with reason
    - Verify double confirmation
    - Check cancellation success

2. **Bulk Cancellation**
    - Select multiple cancellable bookings
    - Initiate bulk cancellation
    - Verify all bookings cancelled
    - Check admin notifications

3. **Cancellation Statistics**
    - View cancellation dashboard
    - Check statistics accuracy
    - Verify real-time updates

---

## 🚀 Quick Start Testing

### 1. Automated Test Setup

```bash
# Install testing dependencies
cd backend
npm install --save-dev jest supertest

# Run automated tests
npm test

# Run specific test suites
npm test -- --testNamePattern="cancellation"
npm test -- --testNamePattern="email"
```

### 2. Manual Testing Setup

```bash
# Start backend server
cd backend
npm start

# Start frontend (in new terminal)
cd frontend
npm run dev

# Access URLs:
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
# Admin: http://localhost:5173/admin
```

### 3. Test Data Setup

```bash
# Create test bookings for cancellation testing
node backend/tests/setup/create-test-bookings.js

# Create test cancellation scenarios
node backend/tests/setup/create-cancellation-scenarios.js
```

---

## 📊 Test Scenarios Matrix

| Feature                       | Test Type | Priority | Status     |
| ----------------------------- | --------- | -------- | ---------- |
| Customer cancellation request | Automated | High     | ⏳ Pending |
| Email verification flow       | Manual    | High     | ⏳ Pending |
| Token security validation     | Automated | High     | ⏳ Pending |
| Admin single cancellation     | Manual    | High     | ⏳ Pending |
| Admin bulk cancellation       | Manual    | Medium   | ⏳ Pending |
| Refund processing             | Manual    | High     | ⏳ Pending |
| Real-time notifications       | Manual    | Medium   | ⏳ Pending |
| Error handling                | Automated | High     | ⏳ Pending |
| Email template rendering      | Manual    | Medium   | ⏳ Pending |
| Database consistency          | Automated | High     | ⏳ Pending |

---

## 🔧 Test Environment Setup

### 1. Environment Variables

```bash
# Required for testing
TEST_SUPABASE_URL=your_test_supabase_url
TEST_SUPABASE_ANON_KEY=your_test_supabase_key
BREVO_API_KEY=your_brevo_api_key
STRIPE_SECRET_KEY=your_stripe_test_key
PUSHER_APP_ID=your_pusher_app_id
PUSHER_APP_KEY=your_pusher_key
PUSHER_APP_SECRET=your_pusher_secret
```

### 2. Test Database Setup

```sql
-- Create test tables if needed
-- (Use existing tables with test data)
```

### 3. Mock Services

```javascript
// Mock external services for testing
- Amadeus API (for flight operations)
- Stripe API (for payment/refund testing)
- Brevo API (for email testing)
- Pusher (for notification testing)
```

---

## 📝 Test Execution Checklist

### Pre-Testing Setup

- [ ] Backend server running
- [ ] Frontend application running
- [ ] Test database configured
- [ ] Environment variables set
- [ ] Test data created
- [ ] Email service configured

### Automated Tests

- [ ] Run API endpoint tests
- [ ] Run service layer tests
- [ ] Run integration tests
- [ ] Check test coverage
- [ ] Fix any failing tests

### Manual Tests

- [ ] Customer cancellation flow
- [ ] Admin cancellation operations
- [ ] Email verification process
- [ ] Error handling scenarios
- [ ] Real-time notifications
- [ ] Mobile responsiveness

### Post-Testing

- [ ] Clean up test data
- [ ] Document test results
- [ ] Report any issues found
- [ ] Update test documentation

---

## 🐛 Common Issues & Solutions

### 1. Email Not Sending

- Check Brevo API key configuration
- Verify email template exists
- Check SMTP settings

### 2. Token Verification Failing

- Check token expiration logic
- Verify IP/User-Agent validation
- Check database token storage

### 3. Admin Notifications Not Working

- Verify Pusher configuration
- Check admin authentication
- Test real-time connection

### 4. Refund Processing Issues

- Check Stripe test keys
- Verify payment intent status
- Test refund scenarios

---

## 📈 Success Criteria

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

## 🎯 Next Steps

1. **Implement automated tests** for core cancellation APIs
2. **Set up test environment** with proper configuration
3. **Create test data** for various scenarios
4. **Execute manual testing** for user flows
5. **Document findings** and fix any issues
6. **Set up continuous testing** for future changes

---

**Note**: This is a capstone project, so focus on functionality over enterprise-level testing. The goal is to ensure the cancellation system works correctly and provides a good user experience.
