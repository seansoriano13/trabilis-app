import {
  FiHome,
  FiPackage,
  FiNavigation,
  FiShield,
  FiUsers,
  FiBell,
  FiAlertTriangle,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiUser,
  FiTrendingUp,
} from 'react-icons/fi'

/**
 * Get appropriate icon for notification based on category and booking type
 */
export const getNotificationIcon = (category, bookingType) => {
  if (category === 'error') {
    return FiAlertTriangle
  }

  if (category === 'assignment') {
    return FiUser
  }

  if (category === 'status') {
    return FiCheckCircle
  }

  if (category === 'reminder') {
    return FiClock
  }

  // Default to booking type icons
  if (bookingType === 'flight') {
    return FiNavigation
  }

  if (bookingType === 'tour') {
    return FiPackage
  }

  if (bookingType === 'visa') {
    return FiShield
  }

  return FiBell
}

/**
 * Get color class based on priority
 */
export const getPriorityColor = (priority) => {
  const colors = {
    low: 'text-gray-500 bg-gray-100',
    medium: 'text-blue-600 bg-blue-100',
    high: 'text-orange-600 bg-orange-100',
    critical: 'text-red-600 bg-red-100',
  }
  return colors[priority] || colors.medium
}

/**
 * Get border color based on priority
 */
export const getPriorityBorderColor = (priority) => {
  const colors = {
    low: 'border-gray-200',
    medium: 'border-blue-200',
    high: 'border-orange-200',
    critical: 'border-red-200',
  }
  return colors[priority] || colors.medium
}

/**
 * Get category label for display
 */
export const getCategoryLabel = (category) => {
  const labels = {
    booking: 'New Booking',
    assignment: 'Assignment',
    status: 'Status Update',
    error: 'Error Alert',
    reminder: 'Reminder',
  }
  return labels[category] || 'Notification'
}

/**
 * Get booking type label
 */
export const getBookingTypeLabel = (bookingType) => {
  const labels = {
    flight: 'Flight',
    tour: 'Tour',
    visa: 'Visa',
  }
  return labels[bookingType] || 'Booking'
}

/**
 * Format notification time to "X time ago" format
 */
export const formatNotificationTime = (timestamp) => {
  const now = new Date()
  const notificationTime = new Date(timestamp)
  const diffInSeconds = Math.floor((now - notificationTime) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return notificationTime.toLocaleDateString()
}

/**
 * Get notification title based on type and data
 */
export const getNotificationTitle = (notification) => {
  const { type, category, booking_type } = notification

  if (category === 'error') {
    return 'System Error'
  }

  if (category === 'assignment') {
    return type?.includes('reassign')
      ? 'Booking Reassigned'
      : 'Booking Assigned'
  }

  if (category === 'status') {
    return 'Status Updated'
  }

  if (category === 'reminder') {
    return 'Reminder'
  }

  // Default booking notifications
  if (booking_type === 'flight') {
    return 'New Flight Booking'
  }

  if (booking_type === 'tour') {
    return 'New Tour Booking'
  }

  if (booking_type === 'visa') {
    return 'New Visa Inquiry'
  }

  return 'New Booking'
}

/**
 * Get notification description with booking reference
 */
export const getNotificationDescription = (notification) => {
  const { message, booking_reference, booking_type } = notification

  if (message) {
    return message
  }

  if (booking_reference) {
    return `${getBookingTypeLabel(booking_type)} booking ${booking_reference}`
  }

  return 'New notification'
}

/**
 * Check if notification is unread
 */
export const isNotificationUnread = (notification, currentUserId) => {
  const readBy = notification.read_by || []
  return !readBy.includes(currentUserId)
}

/**
 * Get filter options for notification categories
 */
export const getFilterOptions = () => [
  { value: 'all', label: 'All', count: 0 },
  { value: 'booking', label: 'New Bookings', count: 0 },
  { value: 'assignment', label: 'Assignments', count: 0 },
  { value: 'status', label: 'Status Updates', count: 0 },
  { value: 'error', label: 'Errors', count: 0 },
  { value: 'reminder', label: 'Reminders', count: 0 },
]

/**
 * Get booking type filter options
 */
export const getBookingTypeFilterOptions = () => [
  { value: 'all', label: 'All Types' },
  { value: 'flight', label: 'Flights' },
  { value: 'tour', label: 'Tours' },
  { value: 'visa', label: 'Visa Inquiries' },
]

/**
 * Generate action URL for notification
 */
export const getActionUrl = (notification) => {
  // Extract booking information from notification
  const { booking_reference, booking_type, event_type } = notification

  // Determine booking type from reference if not explicitly set
  let type = booking_type
  if (!type) {
    if (booking_reference?.startsWith('TRB-FLT-')) {
      type = 'flight'
    } else if (booking_reference?.startsWith('TRB-TOUR-')) {
      type = 'tour'
    } else if (
      booking_reference?.startsWith('TRB-VISA-') ||
      booking_reference?.startsWith('VI-')
    ) {
      type = 'visa'
    } else if (booking_reference?.startsWith('VP-')) {
      type = 'visa_processing'
    } else if (booking_reference?.startsWith('TRB-')) {
      // Generic TRB reference, determine from event type
      if (event_type?.includes('tour')) {
        type = 'tour'
      } else if (event_type?.includes('flight')) {
        type = 'flight'
      }
    }
  }

  // Return list pages for now - detail navigation will be handled in NotificationItem
  switch (type) {
    case 'flight':
      return '/admin/flights'
    case 'tour':
      return '/admin/tour-sales'
    case 'visa':
    case 'visa_processing':
      return '/admin/visa-inquiries'
    default:
      return '/admin/dashboard'
  }
}

// Resolve booking reference to get booking ID for detail navigation
export const resolveBookingReference = async (bookingReference) => {
  try {
    console.log('🔍 Resolving booking reference:', bookingReference)
    // Import adminClient dynamically to avoid circular dependencies
    const { default: adminClient } = await import('../api/adminClient.js')

    const response = await adminClient.get(
      `/dashboard/resolve?ref=${encodeURIComponent(bookingReference)}`
    )
    console.log('✅ Resolve response:', response.data)
    const data = response.data

    if (data.success) {
      return {
        booking_id: data.id,
        booking_type: data.type,
      }
    }
    return null
  } catch (error) {
    console.error('❌ Error resolving booking reference:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    return null
  }
}

// Generate detail URL from booking reference
export const getDetailUrl = async (notification) => {
  const { booking_reference } = notification

  if (!booking_reference) {
    return getActionUrl(notification) // Fallback to list page
  }

  // Try to resolve the booking reference
  const resolved = await resolveBookingReference(booking_reference)

  if (resolved) {
    const { booking_id, booking_type } = resolved

    switch (booking_type) {
      case 'flight':
        return `/admin/flights/${booking_id}`
      case 'tour':
        return `/admin/tour-sales/${booking_id}`
      case 'visa':
        return `/admin/visa-inquiries/${booking_id}`
      case 'visa_processing':
        return `/admin/visa-inquiries/${booking_id}` // Visa processings are managed in the same page
      default:
        return getActionUrl(notification)
    }
  }

  // Fallback to list page if resolution fails
  return getActionUrl(notification)
}
