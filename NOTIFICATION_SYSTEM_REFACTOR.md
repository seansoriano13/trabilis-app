# 🔔 Notification System Refactor Implementation Plan

**Project:** Trabilis-App  
**Module:** Admin Notification System Refactor & Enhancement  
**Date:** October 19, 2025

---

## 1. 🎯 Goal

Refactor and enhance the admin notification system to provide better visibility, organization, and actionability for employees. The system will support role-based filtering, read/unread tracking, notification categorization, and direct navigation to relevant booking details.

---

## 2. 🎁 Core Features / Functions

- **Filter tabs** for notification categories (All / New Bookings / Assignments / Status Updates / Errors)
- **Read/unread tracking** per user with badge count showing only unread notifications
- **Direct navigation** to specific booking detail pages when clicking notifications
- **Role-based filtering** to show only relevant notifications per employee role and assignments
- **Enhanced notification types**:
  - New flight/tour bookings
  - Assignment notifications (assigned to me)
  - Reassignment notifications
  - Status updates (assignment status changes)
  - Payment confirmations
  - Cancellations
  - Visa inquiry assignments
  - Error alerts (for admins only)
  - Ticketing deadline reminders
- **Visual distinction** with icons, colors, and clear formatting per notification type
- **Mark as read** functionality (automatic on click + manual mark all as read)
- **Notification persistence** across page reloads
- **Real-time updates** via Pusher for instant notifications

---

## 3. 🔗 Dependencies

### Existing Infrastructure

- ✅ Supabase `admin_notifications` table
- ✅ Pusher integration for real-time notifications
- ✅ Admin authentication and role management
- ✅ Booking systems (flights, tours, visa inquiries)
- ✅ Assignment system (appointmentController.js)

### Database Schema Updates Needed

- Add `read_by` column (JSONB array storing user IDs who read the notification)
- Add `category` column (enum: 'booking', 'assignment', 'status', 'error', 'reminder')
- Add `priority` column (enum: 'low', 'medium', 'high', 'critical')
- Add `action_url` column (direct link to booking detail)
- Add `related_user_id` column (for assigned_to filtering)
- Ensure `booking_type` column exists ('flight', 'tour', 'visa')
- Ensure `booking_id` column exists (numeric ID for direct navigation)

---

## 4. 📋 Implementation Plan

### Phase 1: Database Schema & Backend Updates

#### Step 1.1: Create Database Migration

- Create migration file: `backend/migrations/enhance_admin_notifications.sql`
- Add columns:
  - `read_by JSONB DEFAULT '[]'::jsonb` (array of user IDs who read the notification)
  - `category TEXT DEFAULT 'booking'` (booking, assignment, status, error, reminder)
  - `priority TEXT DEFAULT 'medium'` (low, medium, high, critical)
  - `action_url TEXT` (URL to navigate when clicked)
  - `related_user_id UUID` (foreign key to admins table, for filtering)
  - `booking_id INTEGER` (direct reference to booking numeric ID)
- Add index on `read_by` using GIN for JSONB queries
- Add index on `related_user_id` for faster filtering
- Add index on `category` for filter queries

#### Step 1.2: Update Notification Creation Logic

Update all files that create notifications to include new fields:

**Files to update:**

- `backend/src/services/createAmadeusOrderService.js`
- `backend/src/controllers/webhookController.js`
- `backend/src/controllers/admin/appointmentController.js`
- `backend/src/controllers/admin/flightController.js`
- `backend/src/controllers/admin/tourController.js`
- `backend/src/controllers/visaInquiryController.js`
- `backend/src/middlewares/errorHandler.js`
- `backend/src/services/cancellationService.js`

**Updates needed:**

- Add `category` field to each notification insert
- Add `priority` field based on notification type
- Add `action_url` field (e.g., `/admin/flights/${bookingId}` or `/admin/tours/${bookingId}`)
- Add `related_user_id` field (for assignments, set to `assigned_to` user)
- Add `booking_id` field (numeric ID from database)
- Ensure `booking_type` is always set correctly

#### Step 1.3: Create New API Endpoints

Add to `backend/src/controllers/admin/dashboardController.js`:

```javascript
// GET /api/admin/dashboard/admin_notifications?category=all&unread_only=true&assigned_to_me=false
export const getAdminNotifications = async (req, res) => {
  // Support filtering by:
  // - category (all, booking, assignment, status, error, reminder)
  // - unread_only (boolean)
  // - assigned_to_me (boolean, filter by related_user_id === current user)
  // - booking_type (flight, tour, visa, all)
}

// POST /api/admin/dashboard/admin_notifications/mark-read
export const markNotificationsAsRead = async (req, res) => {
  // Mark single or multiple notifications as read
  // Add current user ID to read_by array
}

// POST /api/admin/dashboard/admin_notifications/mark-all-read
export const markAllNotificationsAsRead = async (req, res) => {
  // Mark all notifications for current user as read
}

// GET /api/admin/dashboard/admin_notifications/unread-count
export const getUnreadNotificationCount = async (req, res) => {
  // Return count of unread notifications for current user
  // Optionally grouped by category
}
```

Update routes in `backend/src/routes/adminRoutes.js`:

```javascript
router.get('/dashboard/admin_notifications', getAdminNotifications)
router.post('/dashboard/admin_notifications/mark-read', markNotificationsAsRead)
router.post(
  '/dashboard/admin_notifications/mark-all-read',
  markAllNotificationsAsRead
)
router.get(
  '/dashboard/admin_notifications/unread-count',
  getUnreadNotificationCount
)
```

#### Step 1.4: Add Ticketing Deadline Reminder Notifications

- Create cron job or scheduled task to check `flight_bookings` for upcoming ticketing deadlines
- Send notifications 24 hours before deadline for BOOKED flights without tickets
- Category: 'reminder', Priority: 'high'
- Related to: assigned accounting staff

#### Step 1.5: Add Cancellation Notifications

Update `backend/src/services/cancellationService.js`:

- When booking is cancelled, create notification
- Notify assigned staff and admin
- Category: 'status', Priority: 'medium'

#### Step 1.6: Add Visa Inquiry Notifications

Update `backend/src/controllers/visaInquiryController.js`:

- Create notifications when visa inquiries are submitted
- Create notifications when visa inquiries are assigned
- Category: 'booking' for new inquiries, 'assignment' for assignments

---

### Phase 2: Frontend UI Components

#### Step 2.1: Create Notification Filter Component

Create `frontend/src/components/admin/NotificationFilters.jsx`:

- Tab-based filter UI (All, New Bookings, Assignments, Status Updates, Errors, Reminders)
- Active tab highlighting
- Count badge per tab showing unread count
- Toggle for "Unread Only"
- Toggle for "Assigned to Me"

#### Step 2.2: Create Enhanced Notification Item Component

Create `frontend/src/components/admin/NotificationItem.jsx`:

- Props: notification object, onRead callback, onNavigate callback
- Display:
  - Icon based on category and booking_type
  - Color coding by priority (low=gray, medium=blue, high=orange, critical=red)
  - Unread indicator (bold text + dot)
  - Time ago display (e.g., "2 hours ago")
  - Clear title and message
  - Booking reference prominently displayed
- Click handler: mark as read + navigate to action_url

#### Step 2.3: Create Notification Category Icons Helper

Create `frontend/src/utils/notificationHelpers.js`:

```javascript
export const getNotificationIcon = (category, bookingType) => {
  // Return appropriate React Icon based on category and booking type
}

export const getNotificationColor = (priority) => {
  // Return color class based on priority
}

export const getCategoryLabel = (category) => {
  // Return human-readable category label
}

export const formatNotificationTime = (timestamp) => {
  // Return "X time ago" format
}
```

#### Step 2.4: Update AdminNavbar Component

Update `frontend/src/components/admin/AdminNavbar.jsx`:

**State Updates:**

- Add `activeFilter` state (default: 'all')
- Add `unreadOnly` state (default: true)
- Add `assignedToMe` state (default: false based on role)
- Add `unreadCount` state
- Add `notificationsByCategory` state (grouped counts)

**Fetch Logic:**

- Fetch notifications with filter parameters
- Fetch unread count separately for badge
- Update fetch on filter changes
- Automatic refetch on Pusher events

**Pusher Updates:**

- Listen to all notification event types
- Update unread count on new notifications
- Show toast/alert for high-priority notifications
- Refresh notification list on events

**UI Updates:**

- Add NotificationFilters component to dropdown
- Replace current notification list with NotificationItem components
- Add "Mark All as Read" button in header
- Update badge to show only unread count
- Add empty state per filter category

#### Step 2.5: Create Notification Dropdown Styles

Update `frontend/src/components/admin/AdminNavbar.css`:

- Styles for filter tabs
- Styles for priority colors (background/border)
- Styles for unread indicators
- Styles for category icons
- Animation for new notifications
- Hover states for interactive elements

---

### Phase 3: Navigation & Routing Integration

#### Step 3.1: Create Booking Detail Pages (if not existing)

Check and create/update these pages:

- `frontend/src/pages/admin/FlightBookingDetail.jsx`
- `frontend/src/pages/admin/TourBookingDetail.jsx`
- `frontend/src/pages/admin/VisaInquiryDetail.jsx`

Each page should:

- Accept `id` parameter from route
- Fetch booking details by ID
- Display comprehensive booking information
- Show assignment status
- Allow status updates
- Show notification history for this booking

#### Step 3.2: Update Admin Routes

Update `frontend/src/App.jsx` or admin routing file:

```javascript
<Route path="/admin/flights/:id" element={<FlightBookingDetail />} />
<Route path="/admin/tours/:id" element={<TourBookingDetail />} />
<Route path="/admin/visa-inquiries/:id" element={<VisaInquiryDetail />} />
```

#### Step 3.3: Implement Auto-Mark-as-Read on Navigation

In AdminNavbar.jsx:

- When notification is clicked, call API to mark as read
- Then navigate using `useNavigate()` from react-router-dom
- Update local state to reflect read status
- Decrement unread count

---

### Phase 4: Role-Based Filtering & Permissions

#### Step 4.1: Update Notification Fetch Logic

In `backend/src/controllers/admin/dashboardController.js`:

- Filter notifications based on user role:
  - **Admin**: See all notifications
  - **Accounting**: See all bookings + assignments to them + status updates for their bookings
  - **Travel Consultant**: See tour bookings + assignments to them

#### Step 4.2: Add Related User Filtering

- When `assigned_to_me=true`, filter by `related_user_id = current_user_id`
- Include notifications where user is in `assigned_to` or `assigned_by` fields

#### Step 4.3: Hide Error Notifications from Non-Admins

- Error category notifications only visible to admin role
- Filter in backend query, not frontend

---

### Phase 5: Testing & Polish

#### Step 5.1: Test Notification Creation

- Create test bookings (flight, tour)
- Verify notifications are created with correct fields
- Verify Pusher events are triggered
- Check category, priority, action_url are correct

#### Step 5.2: Test Filtering

- Test each filter tab
- Test "Unread Only" toggle
- Test "Assigned to Me" toggle
- Test combinations of filters
- Verify counts are accurate

#### Step 5.3: Test Navigation

- Click notifications and verify navigation
- Verify auto-mark-as-read works
- Test notification for non-existent bookings (error handling)
- Test back navigation

#### Step 5.4: Test Role-Based Access

- Login as admin, accounting, travel consultant
- Verify each sees appropriate notifications
- Verify assigned notifications work correctly
- Verify error notifications only for admin

#### Step 5.5: Test Real-Time Updates

- Open admin panel in two browser tabs
- Create booking in one tab
- Verify notification appears in other tab
- Verify unread count updates in real-time

#### Step 5.6: UI/UX Polish

- Ensure responsive design works on mobile
- Test notification dropdown on small screens
- Verify animations are smooth
- Check color contrast for accessibility
- Test keyboard navigation

---

## 5. ⏭️ Next Module Suggestion

After completing the notification system refactor, suggested next modules:

1. **Dashboard Analytics Enhancement** - Improve admin dashboard with better metrics and visualizations
2. **Booking Assignment Workflow** - Create dedicated assignment management interface
3. **Email Notification Templates** - Enhance email notifications to match in-app notifications
4. **Audit Log System** - Track all admin actions and changes for compliance
5. **Search & Filter Enhancement** - Global search for bookings, notifications, and users

---

## 📊 Progress Tracker

### ✅ Completed Modules

- (None yet - this is the starting module)

### 🔜 Current Module

- **Admin Notification System Refactor & Enhancement**
  - Status: Planning Phase
  - Expected Duration: 2-3 days
  - Files to modify: ~15 files
  - New files to create: ~5 files

### ⏭️ Upcoming Modules (Suggested)

1. Dashboard Analytics Enhancement
2. Booking Assignment Workflow
3. Email Notification Templates
4. Audit Log System
5. Search & Filter Enhancement

---

## 📝 Implementation Notes

### Database Considerations

- Existing notifications should be backfilled with default values
- Consider notification retention policy (auto-delete after 90 days?)
- Index optimization for large notification tables

### Performance Considerations

- Limit notification fetch to last 100 or paginate
- Use database indexes for fast filtering
- Cache unread counts in Redis if needed (future optimization)

### Security Considerations

- Ensure users can only mark their own notifications as read
- Verify action_urls are internal to prevent XSS
- Validate booking_id exists before allowing navigation

### UX Considerations

- Don't auto-refresh notifications too frequently (max every 30 seconds)
- Show loading states during fetch
- Provide clear empty states
- Consider browser notifications for critical alerts (future enhancement)

---

## 🚀 Ready to Begin

When you say **"Next module"** or **"Start implementation"**, I will begin with **Phase 1: Database Schema & Backend Updates**, starting with Step 1.1.

---

**Last Updated:** October 19, 2025
