import React from 'react'
import clsx from 'clsx'
import {
  getFilterOptions,
  getBookingTypeFilterOptions,
} from '../../utils/notificationHelpers'

const NotificationFilters = ({
  activeFilter,
  onFilterChange,
  unreadOnly,
  onUnreadOnlyChange,
  assignedToMe,
  onAssignedToMeChange,
  bookingType,
  onBookingTypeChange,
  filterCounts = {},
  userRole,
}) => {
  const filterOptions = getFilterOptions()
  const bookingTypeOptions = getBookingTypeFilterOptions()

  return (
    <div className='admin-nav__notification-filters'>
      {/* Filter Tabs */}
      <div className='admin-nav__notification-tabs'>
        {filterOptions.map((filter) => {
          // Hide error filter from non-admins
          if (filter.value === 'error' && userRole !== 'admin') {
            return null
          }

          return (
            <button
              key={filter.value}
              className={clsx(
                'admin-nav__notification-tab',
                activeFilter === filter.value &&
                  'admin-nav__notification-tab--active'
              )}
              onClick={() => onFilterChange(filter.value)}
            >
              <span className='admin-nav__notification-tab-label'>
                {filter.label}
              </span>
              {filterCounts[filter.value] > 0 && (
                <span className='admin-nav__notification-tab-count'>
                  {filterCounts[filter.value] > 99
                    ? '99+'
                    : filterCounts[filter.value]}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Additional Filters */}
      <div className='admin-nav__notification-extra-filters'>
        <div className='admin-nav__notification-toggle-group'>
          <label className='admin-nav__notification-toggle'>
            <input
              type='checkbox'
              checked={unreadOnly}
              onChange={(e) => onUnreadOnlyChange(e.target.checked)}
            />
            <span className='admin-nav__notification-toggle-label'>
              Unread Only
            </span>
          </label>
        </div>

        <div className='admin-nav__notification-toggle-group'>
          <label className='admin-nav__notification-toggle'>
            <input
              type='checkbox'
              checked={assignedToMe}
              onChange={(e) => onAssignedToMeChange(e.target.checked)}
            />
            <span className='admin-nav__notification-toggle-label'>
              Assigned to Me
            </span>
          </label>
        </div>

        <div className='admin-nav__notification-select-group'>
          <label className='admin-nav__notification-select-label'>
            Booking Type:
          </label>
          <select
            value={bookingType}
            onChange={(e) => onBookingTypeChange(e.target.value)}
            className='admin-nav__notification-select'
          >
            {bookingTypeOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default NotificationFilters
