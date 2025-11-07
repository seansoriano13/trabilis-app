import { supabase } from '../config/supabaseClient.js'

let adminNotificationsSupportsPnr = true

const normalizeInsertPayload = (payload) =>
  Array.isArray(payload) ? payload : [payload]

const stripPnrField = (record = {}) => {
  const { pnr, ...rest } = record
  return rest
}

const isMissingPnrColumnError = (error) => {
  if (!error || typeof error.message !== 'string') return false
  const message = error.message.toLowerCase()
  return message.includes('pnr') && message.includes('column')
}

export const insertAdminNotification = async (records, options = {}) => {
  const rows = normalizeInsertPayload(records)
  const attemptInsert = (payload) =>
    supabase.from('admin_notifications').insert(payload, options)

  if (!adminNotificationsSupportsPnr) {
    return attemptInsert(rows.map(stripPnrField))
  }

  const result = await attemptInsert(rows)

  if (result.error && isMissingPnrColumnError(result.error)) {
    adminNotificationsSupportsPnr = false
    console.warn(
      '⚠️ SUPABASE WARN - admin_notifications.pnr column not detected. Retrying insert without pnr field.'
    )

    const retry = await attemptInsert(rows.map(stripPnrField))
    return retry
  }

  return result
}

export const resetAdminNotificationsPnrFlag = () => {
  adminNotificationsSupportsPnr = true
}

