## Quick Checklist
- [x] Phase 1.1: Replace 9 remaining alert() calls with snackbar
- [x] Phase 1.2: Fix notification badge (99+)
- [x] Phase 1.3: COMPLETED → APPROVED naming
- [x] Phase 2.1: Show staff names in visa processing
- [x] Phase 2.2: Fix view inquiry button (undefined → inquiry.id)
- [x] Phase 2.3: Auto-assign visa inquiries
- [x] Phase 2.4: Add processing status dropdown
- [x] Phase 2.5: Inquiry-to-processing conversion
- [x] Phase 2.6: 🚨 Assignment synchronization (CRITICAL - COMPLETED)
  - [x] Backend sync logic for tour booking and visa processing assignments
  - [x] Assignment status synchronization between related records
  - [x] Staff assignment sync when tour booking is assigned/reassigned
  - [x] Migration script to fix existing mismatched data
  - [x] Full testing of assignment synchronization flow
- [x] Phase 3.1: Fix pagination color (blue → white), make the pagination  styles consistent
- [x] Phase 3.2: Fix pagination position
- [x] Phase 3.3: Fix destination grid (5 → 6 items)
- [x] Phase 3.4: Add visa details to PDF
- [x] Phase 3.5: Fix customization in PDF
- [x] Phase 3.6: Add visa disclaimer to T&C
- [x] Phase 3.7: Add unsaved changes warning
- [x] Phase 4.1: Add Flight tab to TourBookingDetail
- [x] Phase 4.2: Add visa status display
- [x] Phase 4.3: Add visa status editing
- [x] Phase 4.4: Add flight linking via booking reference
- [x] Phase 5.1: Track Flight button in success page
- [x] Phase 5.2: Real-time flight tracking
- [x] Phase 5.3: "No Flights Found" UI
- [x] Phase 5.4: Flight cancellation (admin)
- [ ] Phase 5.5: Send flight email (admin)
- [x] Phase 6.1: Country calling code selector
- [ ] Phase 7.1: Panellum lazy loading
- [ ] Phase 7.2: Verify Tinify compression
- [ ] Phase 8.1: Sales Report tab
- [ ] Phase 8.2: Ratings tab
- [ ] Phase 9.1: Role-based data filtering
- [ ] Phase 9.2: Payment security (reservation fee)
- [ ] Phase 9.3: Refund system
- [ ] Phase 10.1: Botpress knowledge base
- [ ] Phase 10.2: Botpress integration
- [ ] Phase 10.3: Testing suite
- [ ] Phase 11.1: Code quality improvements
- [ ] Phase 11.2: Documentation
- [ ] Phase 11.3: Production setup
- [ ] Phase 11.4: Deployment checklist

# Trabilis Production Turnover Plan

## Phase 1: Critical Bugs & Notifications (1-2 days)

### 1.1 Replace Remaining alert() with Snackbar

- **Files**: 2 files with 9 remaining alert() calls
    - `frontend/src/pages/admin/TourBookingDetail.jsx` (5 alerts)
    - `frontend/src/pages/admin/FlightBookingDetail.jsx` (4 alerts)
- **Action**: Replace with `showSuccess()`, `showError()`, `showInfo()`, or `showWarning()`
- **Note**: Snackbar already implemented and used in 13 files ✅

### 1.2 Admin Notification Badge Fix

- **File**: `frontend/src/components/admin/AdminNavbar.jsx`
- **Change**: `{notifications.length}` → `{notifications.length > 99 ? '99+' : notifications.length}`
- **Verify**: Fetch limit is at least 100 (change `.limit(50)` to `.limit(100)` if needed)

### 1.3 Assignment Status Naming

- **Files**: All admin pages showing assignment status
- **Change**: Replace all "COMPLETED" → "APPROVED" in UI text
- **Database**: Update enum if needed: `assignment_status CHECK ... 'completed'` → `'approved'`

---

## Phase 2: Visa Processing Bugs (2-3 days) 🔥 PRIORITY

### 2.1 Show Staff Names in Assignment

- **File**: `frontend/src/components/admin/VisaProcessingModal.jsx`
- **Fix**: Fetch staff details using `assigned_to` UUID, display `${first_name} ${last_name}` instead of UUID
- **Cache**: Store fetched staff names to avoid repeated API calls

### 2.2 Fix View Inquiry Button

- **File**: Visa processing list component
- **Fix**: Change `onClick={() => handleView(undefined)}` → `onClick={() => handleView(inquiry.id)}`
- **Verify**: `inquiry.id` exists in data structure

### 2.3 Auto-Assignment for Visa Inquiries

- **File**: `backend/src/controllers/visaInquiryController.js`
- **Add**: After inquiry creation, call `autoAssignBooking('visa-inquiry', inquiry.id)`
- **Test**: Verify assignment service supports 'visa-inquiry' type

### 2.4 Add Processing Status Field

- **File**: `frontend/src/components/admin/VisaProcessingModal.jsx`
- **Add**: Dropdown for status (PENDING, IN_PROGRESS, APPROVED, REJECTED)
- **Backend**: Create endpoint to update visa processing status

### 2.5 Inquiry-to-Processing Conversion

- **File**: `frontend/src/pages/admin/VisaInquiries.jsx`
- **Add**: "Convert to Processing" button for completed inquiries
- **Backend**: Create `/visa-processings/convert-from-inquiry` endpoint
- **Logic**: Create visa_processing record, link to inquiry, update inquiry status to 'CONVERTED'

### 2.6 Visa Status Synchronization 🚨 CRITICAL BUG

**Problem**: When passenger visa_status changes from 'needs_processing' to anything else, the visa_processings record remains active and visible.

**Business Rules:**

- **FROM 'needs_processing' TO other:**
    - If status = PENDING → Auto-cancel with note
    - If status = IN_PROGRESS → Show warning modal, require confirmation to cancel
    - If status = APPROVED → Show warning, allow change but keep processing visible
    - If status = REJECTED/CANCELLED → Allow change freely
- **TO 'needs_processing' FROM other:**
    - Check for CANCELLED visa_processing with same passenger_index
    - Reactivate existing record (status → PENDING)
    - If none exists, create new record
- **Display Logic:**
    - Show CANCELLED visa_processings in grey with strikethrough
    - Send notification to assigned staff when processing auto-cancelled

**Files to Modify:**

1. **Backend: `backend/src/controllers/admin/tourController.js`**
    - Add endpoint: `PUT /admin/tours/:id/passengers/:index/visa-status`
    - Validate changes against visa_processings state
    - Auto-cancel or reactivate as needed
    - Send notification to assigned staff
2. **Backend: `backend/src/routes/adminRoutes.js`**
    - Add route: `router.put('/tours/:id/passengers/:index/visa-status', updatePassengerVisaStatus)`

3. **Frontend: `frontend/src/pages/admin/TourBookingDetail.jsx`**
    - Update `handleVisaStatusChange()` to call new endpoint
    - Add confirmation modal for IN_PROGRESS status changes
    - Add warning modal for APPROVED status changes
    - Show success message after sync
    - Refresh booking data after update

4. **Frontend: `frontend/src/components/admin/VisaProcessingModal.jsx`**
    - When creating new processing, auto-update passenger_details.visa_status to 'needs_processing'
    - Show warning if passenger current status is not 'needs_processing'

5. **Backend: `backend/src/controllers/visaProcessingController.js`**
    - Update `createVisaProcessing()` to sync passenger_details.visa_status

**CSS Updates:**

- Add `.visa-processing--cancelled` class with grey color and strikethrough

**Testing Checklist:**

- [ ] Change PENDING processing → visa_status cancels automatically
- [ ] Change IN_PROGRESS processing → shows confirmation modal
- [ ] Change APPROVED processing → shows warning, allows change
- [ ] Change back to 'needs_processing' → reactivates CANCELLED record
- [ ] Create new processing → auto-updates passenger visa_status
- [ ] Assigned staff receives cancellation notification
- [ ] CANCELLED processings display in grey

---

## Phase 3: Tour Visual Bugs & Features (1-2 days)

### 3.1 Fix Pagination Color

- **File**: CSS file with `.tours__pagination--active`
- **Change**: `background-color: blue` → `background-color: white`

### 3.2 Fix Pagination Position

- **File**: Tour page component
- **Fix**: Move pagination inside `.w-full.px-4.lg:px-8...` wrapper (not below it)

### 3.3 Fix Destination Grid (5→6 items)

- **File**: Component with `grid-cols-3` showing destinations
- **Debug**: Check if only 5 items in data or if 6th item is hidden
- **Fix**: Ensure 6 items render in 2 rows × 3 columns

### 3.4 Add Visa Details to PDF

- **File**: `backend/src/services/templates/tour.html`
- **Add**: Section showing passenger visa details (status, type, expiry)
- **File**: `backend/src/services/brevoEmailService.js`
- **Update**: Pass visa data to PDF template

### 3.5 Fix Customization in PDF

- **File**: `backend/src/services/brevoEmailService.js`
- **Fix**: Fetch `tour_booking_customizations`, filter removed inclusions, mark rest days in itinerary
- **Verify**: PDF reflects actual customizations (removed groups, rest days, customization fee)

### 3.6 Add Visa Disclaimer to T&C

- **File**: `frontend/src/pages/client/TourBooking.jsx`
- **Add**: In T&C modal (lines 307-360), add disclaimer section if any passenger has "already_has" visa status
- **Content**: "You are responsible for ensuring visa validity... Lindela Travel not liable..."

### 3.7 Unsaved Changes Warning

- **File**: `frontend/src/pages/admin/AdminTour.jsx` (Create Tour)
- **Add**: `beforeunload` event listener if `hasUnsavedChanges === true`
- **Show**: Warning banner when form has unsaved changes

---

## Phase 4: Tour Booking Enhancements (1-2 days)

### 4.1 Add Flight Tab to TourBookingDetail

- **File**: `frontend/src/pages/admin/TourBookingDetail.jsx`
- **Add**: "Flights" tab alongside "Overview" (line 44)
- **Display**: Show `flight_details` (outbound/return) from `tour_bookings` table
- **Empty State**: "No flight information available" if no flights linked

### 4.2 Add Visa Status Display

- **File**: `frontend/src/pages/admin/TourBookingDetail.jsx`
- **Add**: Visa status section in Overview tab showing passenger visa details
- **Display**: visa_status, visa_type, existing_visa_status, visa_expiry_date for each passenger

### 4.3 Add Visa Status Editing

- **File**: `frontend/src/pages/admin/TourBookingDetail.jsx`
- **Add**: "Edit" button for each passenger's visa status
- **Modal**: Allow updating visa_status, visa_type, existing_visa_status, visa_expiry_date
- **Backend**: Create endpoint to update passenger visa data in `tour_bookings.passenger_details`

### 4.4 Flight Linking via Booking Reference

- **File**: `frontend/src/pages/admin/TourBookingDetail.jsx` (Flight tab)
- **Add**: Input field for flight booking reference (TRB-FLT-XXXXXX)
- **Add**: "Link Flight" button
- **Backend**: Create endpoint to verify booking reference, fetch flight data, link to tour
- **File**: `backend/src/controllers/tourBookingController.js`
- **Logic**: Get `amadeus_order_id` from `flight_bookings`, call `amadeus.booking.flightOrder(id).get()`, store in `tour_bookings.flight_details`

---

## Phase 5: Flight Enhancements (1 day)

### 5.1 Track Flight Button in Success Page

- **File**: `frontend/src/pages/client/FlightBookingSuccess.jsx`
- **Replace**: "Refresh status" button (lines 259-266) with "Track Flight" button
- **Action**: Navigate to `/track-booking` with `{ bookingRef, bookingType: 'flight', autoSearch: true }`

### 5.2 Real-Time Flight Tracking

- **File**: `frontend/src/pages/client/TrackBooking.jsx`
- **Add**: Auto-search if `location.state.autoSearch === true`
- **Backend**: `backend/src/controllers/trackBookingController.js`
- **Logic**: Get `amadeus_order_id` from database, call `amadeus.booking.flightOrder(id).get()` for live data
- **Fallback**: Use database data if Amadeus API fails

### 5.3 "No Flights Found" UI

- **File**: `frontend/src/pages/client/FlightSearchResults.jsx`
- **Add**: Empty state component when `searchResults.length === 0`
- **Content**: "No Flights Found" message with suggestions (adjust dates, try nearby airports)
- **Button**: "Modify Search" to return to search page with pre-filled criteria

### 5.4 Flight Cancellation (Admin)

- **File**: `frontend/src/pages/admin/FlightBookingDetail.jsx`
- **Add**: "Cancel Flight" button with modal (reason, notes)
- **Backend**: Create `/flights/:id/cancel` endpoint
- **Logic**: Call `amadeus.booking.flightOrder(id).delete()`, update database status to 'CANCELLED', send email

### 5.5 Send Updated Flight Email (Admin)

- **File**: `frontend/src/pages/admin/FlightBookingDetail.jsx`
- **Add**: "Send Email" button with modal (email type: update/reminder/checkin)
- **Backend**: Create `/flights/:id/send-email` endpoint using Brevo

---

## Phase 6: Visa Form Enhancement (0.5 day)

### 6.1 Country Calling Code Selector

- **File**: `frontend/src/pages/client/ImmigrationVisaConsultancy.jsx`
- **Change**: Line 42 simple text input → country code dropdown + phone input (same pattern as PassengerDetails.jsx lines 382-414)
- **Import**: `import countries from '../../data/CountryCodes.json'`
- **Structure**: `mobile_number: { countryCallingCode: '63', number: '' }`
- **Backend**: Update to handle new format: `+${countryCallingCode}${number}`

---

## Phase 7: Performance Optimization (0.5-1 day)

### 7.1 Panellum 360° Lazy Loading

- **File**: Components using Panellum viewer
- **Add**: Intersection Observer to load viewer only when visible
- **Logic**: Initialize Panellum only when element enters viewport

### 7.2 Verify Tinify Image Compression

- **File**: `backend/src/services/imageUploadService.js`
- **Add**: Comprehensive logging (original size, compressed size, compression ratio)
- **Test**: Upload image, verify console shows compression stats
- **Fix**: If not compressing, verify TINIFY_API_KEY is set correctly

---

## Phase 8: New Admin Tabs (2-3 days)

### 8.1 Sales Report Tab

- **File**: `frontend/src/pages/admin/SalesReport.jsx` (CREATE)
- **Features**:
    - Date range picker
    - Travel class filter (Economy/Business/First)
    - Key metrics: Total Revenue, Total Bookings, Avg Booking Value, Top Destination
    - Top 10 Travelers table (per class) with name, email, total spent, booking count
    - Select travelers checkbox
    - "Send Promo Email" button for selected travelers
    - Export to CSV button
- **Backend**: `backend/src/controllers/salesReportController.js` (CREATE)
- **Endpoints**: `/admin/sales-report`, `/admin/sales-report/export`, `/admin/promotional-emails`

### 8.2 Ratings Tab

- **Database**: Create `ratings` and `rating_emails` tables
- **Automated Email**: Create cron job to send rating emails day after tour ends
- **Client Form**: `frontend/src/pages/client/RateTour.jsx` (CREATE)
- **Rating Fields**: Overall (1-5), Guide (1-5), Accommodation (1-5), Transportation (1-5), Staff (1-5), Feedback (text)
- **Admin View**: `frontend/src/pages/admin/Ratings.jsx` (CREATE)
- **Features**: Filter by tour/employee/rating/date, export to CSV

---

## Phase 9: Access Control & Security (1-2 days)

### 9.1 Role-Based Data Filtering

- **Backend**: All booking controllers
- **Logic**: If user role is not admin/super_admin, filter `assigned_to === current_user.id`
- **Apply**: Flight bookings, tour bookings, visa processings

### 9.2 Payment Security

- **File**: `frontend/src/pages/client/TourBooking.jsx` (lines 296-309)
- **Fix**: Show reservation fee section ONLY if `reservation_per_pax > 0`
- **Add**: "No reservation fee required" message if fee is 0

### 9.3 Refund System Research

- **Task**: Document Stripe refund API requirements
- **Create**: `/admin/refunds` endpoint (create refund, check status)
- **Admin UI**: Add "Refund" button in booking details with amount input and reason dropdown

---

## Phase 10: Chatbot & Testing (1-2 days)

### 10.1 Botpress Knowledge Base

- **File**: `botpress-kb.md` (CREATE)
- **Content**: FAQs for flights, tours, visas, payments, bookings, contact info
- **Setup**: Create Botpress account, upload knowledge base, configure responses

### 10.2 Botpress Integration

- **File**: `frontend/src/App.jsx`
- **Add**: Botpress webchat widget with custom config (colors, persistent menu)

### 10.3 Testing Suite

- **Create**: Manual testing checklist covering all features
- **Test**: All critical paths (flight booking, tour booking, visa inquiry, admin functions)
- **Verify**: Payments work, emails send, PDFs generate, real-time tracking works

---

## Phase 11: Final Polish & Production (1 day)

### 11.1 Code Quality

- **Task**: Add comments to complex business logic
- **Task**: Improve variable naming (no single letters, descriptive names)
- **Task**: Extract complex inline logic into separate functions

### 11.2 Documentation

- **Create**: API documentation with all endpoints, request/response formats, error codes
- **Create**: Admin user guide (login, booking management, reports, troubleshooting)
- **Create**: Customer help center (how to book, track, FAQs)

### 11.3 Production Setup

- **Create**: Environment variables documentation
- **Create**: Production configuration file
- **Add**: Health check endpoint (`/api/health`)
- **Add**: Comprehensive error logging (winston)
- **Add**: Performance monitoring middleware

### 11.4 Deployment Checklist

- **Verify**: All environment variables set
- **Verify**: External APIs working (Amadeus, Stripe, Brevo, Tinify)
- **Verify**: Database migrations applied
- **Verify**: HTTPS enabled, CORS configured
- **Test**: All critical paths in production
- **Monitor**: Error logs, performance metrics

---

## Implementation Order Summary

**CRITICAL: Complete Phase 2.6 (Visa Sync) FIRST** - Prevents data integrity issues and orphaned records

1. **Phase 1-2** (3-4 days): Fix all bugs - snackbar, notifications, **visa sync (PRIORITY)**, assignments
2. **Phase 3-4** (2-4 days): Tour enhancements - visual bugs, PDF fixes, flight linking, visa editing (easier with Phase 2.6 done)
3. **Phase 5-6** (1.5 days): Flight features - tracking, cancellation, email, visa form
4. **Phase 7** (1 day): Optimize performance - Panellum, Tinify
5. **Phase 8** (2-3 days): New admin tabs - sales reports, ratings
6. **Phase 9** (1-2 days): Security - access control, refunds
7. **Phase 10** (1-2 days): Chatbot and testing
8. **Phase 11** (1 day): Documentation and production deployment

**Total: 12.5-19 days (2.5-4 weeks)**

---

