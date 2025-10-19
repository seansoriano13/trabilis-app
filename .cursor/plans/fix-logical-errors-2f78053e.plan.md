<!-- 2f78053e-f91e-483c-80fb-39bab7550e82 aa640eef-9444-4eb8-a408-42b7f56ed3d3 -->
# Fix Critical Logical Errors in Booking & Cancellation System

## Current Module: Logical Error Fixes (Race Conditions & Consistency)

### 1. Goal

Fix all critical logical errors identified in the recent code analysis, focusing on race conditions, database consistency issues, route completeness, and error handling to ensure reliable booking and cancellation operations.

### 2. Core Features / Functions

- Add missing cancellation API endpoints to booking routes
- Implement atomic operations for booking status updates
- Fix race conditions in Amadeus order creation
- Improve error handling in webhook processing
- Add proper validation for all cancellation operations
- Implement database transactions for critical operations
- Fix inconsistent status checking logic across frontend/backend

### 3. Dependencies

- Both cancellation systems (email verification + direct) are already implemented
- Routes are registered in server.js
- Cancellation services exist
- Database schema supports required fields

### 4. Implementation Plan

#### Step 1: Add Missing Cancellation Endpoints to Booking Routes

**File**: `backend/src/routes/bookingRoutes.js`

Add the missing endpoints that CancellationModal.jsx expects:

```javascript
import { getCancellationInfo } from '../services/cancellationService.js'

// Add these routes:
router.get('/cancellation-info', async (req, res) => {
    try {
        const { booking_reference } = req.query
        const info = await getCancellationInfo(booking_reference)
        res.json(info)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.post('/cancel', async (req, res) => {
    // This route is for client-side cancellation (not admin)
    // Will redirect to email verification flow
    res.status(400).json({ 
        error: 'Direct cancellation not allowed. Please use email verification.',
        redirectTo: '/api/v1/cancel-booking/request'
    })
})
```

#### Step 2: Add Atomic Status Check in createAmadeusOrder

**File**: `backend/src/services/createAmadeusOrderService.js`

Replace lines 23-39 with atomic check-and-update:

```javascript
// Use Supabase's atomic update with conditions
const { data: booking, error: updateError } = await supabase
    .from('flight_bookings')
    .update({ 
        status: 'PROCESSING_ORDER',
        processing_started_at: new Date().toISOString()
    })
    .eq('booking_reference', bookingReference)
    .eq('status', 'PAID_PENDING_BOOKING') // Only update if still in this status
    .select()
    .single()

if (updateError || !booking) {
    throw new Error(
        `Booking ${bookingReference} is not in PAID_PENDING_BOOKING status or already being processed`
    )
}
```

Then at the end, add rollback on failure:

```javascript
// In catch block (line 287), add:
await supabase
    .from('flight_bookings')
    .update({ 
        status: 'PAID_PENDING_BOOKING', // Rollback to previous state
        processing_started_at: null
    })
    .eq('booking_reference', bookingReference)
    .eq('status', 'PROCESSING_ORDER')
```

#### Step 3: Improve Webhook Error Handling

**File**: `backend/src/controllers/webhookController.js`

Replace lines 330-337 with better error handling:

```javascript
// Store booking ID for tracking
const bookingId = bookingData.id

// Create Amadeus order asynchronously with proper error tracking
createAmadeusOrder(booking_reference)
    .then((result) => {
        console.log(`[WEBHOOK] ✅ Order creation completed for ${booking_reference}`)
    })
    .catch(async (err) => {
        console.error(
            `[WEBHOOK] ❌ CRITICAL ERROR during Amadeus order creation for ${booking_reference}:`,
            err
        )
        
        // Notify admin of the failure via Pusher
        try {
            await pusher.trigger('admin-alerts', 'booking-failed', {
                bookingReference: booking_reference,
                bookingId: bookingId,
                error: err.message,
                needsManualIntervention: true
            })
        } catch (notifyError) {
            console.error('[WEBHOOK] Failed to send failure notification:', notifyError)
        }
    })
```

#### Step 4: Fix Status Checking Inconsistency

**File**: `frontend/src/pages/client/TrackBooking.jsx`

Replace lines 146-156 with consistent status checking:

```javascript
const canCancelBooking = (booking) => {
    if (!booking) return false
    
    // ALWAYS use database booking status from result.bookingStatus
    // Never use Amadeus flight status for cancellation eligibility
    const status = result.bookingStatus
    
    if (!status) {
        console.warn('No booking status available for cancellation check')
        return false
    }
    
    const cancellableStatuses = ['PENDING_PAYMENT', 'PAID_PENDING_BOOKING', 'BOOKED']
    return cancellableStatuses.includes(status)
}
```

#### Step 5: Add Transaction Support for Cancellations

**File**: `backend/src/services/cancellationService.js`

Wrap the cancellation logic (lines 158-176) in a transaction-like pattern:

```javascript
// Before line 158, add validation step
const { data: currentBooking, error: validationError } = await supabase
    .from('flight_bookings')
    .select('status, amadeus_order_id')
    .eq('booking_reference', bookingReference)
    .single()

if (validationError || !currentBooking) {
    throw new Error('Booking not found or already modified')
}

// Check if status changed during cancellation process
if (currentBooking.status !== booking.status) {
    throw new Error(`Booking status changed during cancellation. Please retry.`)
}

// Now perform the update with status check
const { error: updateError } = await supabase
    .from('flight_bookings')
    .update(updateData)
    .eq('booking_reference', bookingReference)
    .eq('status', booking.status) // Atomic check: only update if status hasn't changed

if (updateError) {
    throw new Error(`Database update error: ${updateError.message}`)
}
```

#### Step 6: Add Input Validation for Admin Cancellation

**File**: `backend/src/controllers/admin/flightController.js`

Replace lines 1298-1322 with proper validation:

```javascript
export const cancelFlightBooking = async (req, res) => {
    try {
        const { id } = req.params
        const { reason, refund_amount } = req.body

        // Validate ID
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ 
                success: false,
                error: 'Valid booking ID is required',
            })
        }

        // Check if booking exists and get current status
        const { data: existingBooking, error: fetchError } = await supabase
            .from('flight_bookings')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError) {
            console.error('Database error:', fetchError)
            return res.status(500).json({ 
                success: false,
                error: 'Database error occurred',
            })
        }
        
        if (!existingBooking) {
            return res.status(404).json({ 
                success: false,
                error: 'Booking not found',
            })
        }
```

#### Step 7: Fix Missing bookingService Export

**File**: `backend/src/services/bookingService.js`

The file only exports `checkBookingStatus` but it's querying only flight_bookings. Add tour booking support:

```javascript
export async function checkBookingStatus(bookingReference, bookingType = 'flight') {
    try {
        const tableName = bookingType === 'flight' ? 'flight_bookings' : 'tour_bookings'
        const selectFields = bookingType === 'flight' 
            ? 'status, search_criteria, pnr'
            : 'status, package_dates(*)'
        
        const { data, error } = await supabase
            .from(tableName)
            .select(selectFields)
            .eq('booking_reference', bookingReference)
            .single()

        if (error || !data) {
            throw new Error(`Booking ${bookingReference} not found`)
        }

        return {
            status: data.status,
            searchCriteria: data.search_criteria,
            pnr: data.pnr,
            bookingType: bookingType
        }
    } catch (error) {
        console.error(`Failed to check status for ${bookingReference}:`, error)
        throw new Error(`Failed to check booking status: ${error.message}`)
    }
}
```

#### Step 8: Add Error Recovery in createAmadeusOrder

**File**: `backend/src/services/createAmadeusOrderService.js`

After line 280 (in the catch block), improve the refund handling:

```javascript
// Issue refund with proper error handling
if (bookingData?.stripe_checkout_id) {
    try {
        const refund = await stripe.refunds.create({
            payment_intent: bookingData.stripe_checkout_id,
            amount: Math.round(bookingData.total_amount * 100),
            reason: 'requested_by_customer',
            metadata: {
                booking_reference: bookingReference,
                reason: 'Amadeus order creation failed'
            }
        })
        
        // Update booking with refund information
        await supabase
            .from('flight_bookings')
            .update({ 
                refund_id: refund.id,
                refund_amount: refund.amount / 100,
                refund_status: 'issued'
            })
            .eq('booking_reference', bookingReference)
            
        console.log(`[AMADEUS ORDER] ✅ Refund issued: ${refund.id} for ${bookingReference}`)
    } catch (stripeError) {
        console.error(`[AMADEUS ORDER] ❌ Failed to issue refund for ${bookingReference}:`, stripeError)
        
        // Critical: Manual intervention needed
        await supabase.from('admin_notifications').insert({
            type: 'refund_failed',
            message: `URGENT: Failed to refund ${bookingReference}. Manual refund required.`,
            booking_reference: bookingReference,
            created_at: new Date().toISOString(),
            priority: 'critical'
        })
    }
}
```

#### Step 9: Add Concurrent Request Protection

**File**: `backend/src/services/createAmadeusOrderService.js`

Add a simple in-memory lock at the top of the file:

```javascript
// At the top of the file, after imports
const processingBookings = new Set()

export async function createAmadeusOrder(bookingReference) {
    // Check if already processing
    if (processingBookings.has(bookingReference)) {
        throw new Error(`Order creation already in progress for ${bookingReference}`)
    }
    
    // Add to processing set
    processingBookings.add(bookingReference)
    
    try {
        // ... existing code ...
        
        // At the very end of function (line 279), remove from set:
        processingBookings.delete(bookingReference)
        return result
        
    } catch (error) {
        // Also remove from set on error (in catch block at line 344)
        processingBookings.delete(bookingReference)
        throw error
    }
}
```

#### Step 10: Fix Refund Logic Documentation

**File**: `backend/src/services/cancellationService.js`

Update lines 138-156 to clarify the refund policy:

```javascript
// 5. Handle refund based on status and policy
let refundResult = {
    success: false,
    amount: 0,
    reason: 'No refund needed',
    refundId: null
}

if (booking.stripe_checkout_id) {
    if (booking.status === 'PENDING_PAYMENT') {
        // No refund needed - payment not processed yet
        refundResult = {
            success: true,
            amount: 0,
            reason: 'Payment not processed yet'
        }
        console.log(`[CANCELLATION] No refund needed for ${bookingReference} - payment not processed`)
    } else if (booking.status === 'PAID_PENDING_BOOKING') {
        // Full refund - order not yet created with airline
        try {
            const refund = await stripe.refunds.create({
                payment_intent: booking.stripe_checkout_id,
                amount: Math.round(booking.total_amount * 100),
                metadata: { booking_reference: bookingReference }
            })
            refundResult = {
                success: true,
                amount: booking.total_amount,
                reason: 'Order not yet confirmed with airline',
                refundId: refund.id
            }
        } catch (refundError) {
            console.error(`[CANCELLATION] Refund failed for ${bookingReference}:`, refundError)
            refundResult = {
                success: false,
                amount: 0,
                reason: `Refund processing failed: ${refundError.message}`
            }
        }
    } else {
        // BOOKED or later: Non-refundable per policy
        refundResult = {
            success: true,
            amount: 0,
            reason: 'Non-refundable: Booking confirmed with airline'
        }
        console.log(`[CANCELLATION] No refund for ${bookingReference} - non-refundable policy applies`)
    }
}
```

### 5. Testing Checklist

- Test cancellation with email verification flow
- Test admin cancellation through both systems
- Verify race condition protection by simulating concurrent requests
- Test refund logic for different booking statuses
- Verify atomic status updates work correctly
- Test error recovery when Amadeus order creation fails
- Verify webhook continues after async order creation
- Test status consistency between frontend and backend

### 6. Next Module Suggestion

After fixing these logical errors, the next logical module would be:

- **Performance Optimization & Monitoring**: Add detailed logging, performance metrics, and alerting for critical operations
- **OR Integration Testing Suite**: Create comprehensive tests for all booking flows

---

## Progress Tracker

### Completed Modules

- Initial booking system implementation
- Email verification cancellation system
- Admin cancellation system

### Current Module

- Fix Critical Logical Errors (Race Conditions & Consistency)

### Upcoming Modules

- Performance Optimization & Monitoring
- Integration Testing Suite
- Refactoring for Better Architecture (deferred for discussion)