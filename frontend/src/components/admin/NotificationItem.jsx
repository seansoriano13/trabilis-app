import React from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import {
  getNotificationIcon,
  getPriorityColor,
  getPriorityBorderColor,
  getNotificationTitle,
  getNotificationDescription,
  formatNotificationTime,
  isNotificationUnread,
  getActionUrl,
  getDetailUrl,
} from '../../utils/notificationHelpers'

const NotificationItem = ({
  notification,
  currentUserId,
  onMarkAsRead,
  onClick,
}) => {
  const navigate = useNavigate()
  const IconComponent = getNotificationIcon(
    notification.category,
    notification.booking_type
  )
  const isUnread = isNotificationUnread(notification, currentUserId)
  const actionUrl = getActionUrl(notification)

  const handleClick = async (e) => {
    e.preventDefault()

    // Mark as read if unread
    if (isUnread && onMarkAsRead) {
      onMarkAsRead(notification.id)
    }

    // Call onClick callback if provided
    if (onClick) {
      onClick(notification)
    }

    // Try to get detail URL first, fallback to action URL
    try {
      const detailUrl = await getDetailUrl(notification)
      navigate(detailUrl)
    } catch (error) {
      console.error('Error getting detail URL:', error)
      // Fallback to action URL
      if (actionUrl) {
        navigate(actionUrl)
      }
    }
  }

  return (
    <div
      className={clsx(
        'admin-nav__notification-item',
        isUnread && 'admin-nav__notification-item--unread'
      )}
    >
      <div
        className='admin-nav__notification-link'
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      >
        <div
          className={clsx(
            'admin-nav__notification-icon',
            getPriorityColor(notification.priority)
          )}
        >
          <IconComponent size={16} />
        </div>

        <div className='admin-nav__notification-content'>
          <div className='admin-nav__notification-header'>
            <div className='admin-nav__notification-title'>
              {getNotificationTitle(notification)}
            </div>
            <div className='admin-nav__notification-badge'>
              <span
                className={clsx(
                  'admin-nav__notification-priority-badge',
                  getPriorityColor(notification.priority)
                )}
              >
                {notification.priority}
              </span>
            </div>
          </div>

          <div className='admin-nav__notification-desc'>
            {getNotificationDescription(notification)}
          </div>

          <div className='admin-nav__notification-footer'>
            <div className='admin-nav__notification-time'>
              {formatNotificationTime(notification.created_at)}
            </div>
            {notification.booking_reference && (
              <div className='admin-nav__notification-reference'>
                {notification.booking_reference}
              </div>
            )}
          </div>
        </div>

        {isUnread && (
          <div className='admin-nav__notification-unread-indicator'>
            <div className='admin-nav__notification-dot'></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationItem
