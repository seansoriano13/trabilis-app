/**
 * Decode JWT token to get user information
 * @param {string} token - JWT token
 * @returns {object|null} Decoded token payload or null if invalid
 */
export const decodeJWT = (token) => {
  if (!token) return null

  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

/**
 * Get current admin user from localStorage
 * @returns {object|null} User object with id, email, role
 */
export const getCurrentAdmin = () => {
  const token = localStorage.getItem('adminToken')
  if (!token) return null

  const decoded = decodeJWT(token)
  return decoded
    ? {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      }
    : null
}

/**
 * Check if current user has a specific role
 * @param {string|string[]} roles - Role or array of roles to check
 * @returns {boolean}
 */
export const hasRole = (roles) => {
  const user = getCurrentAdmin()
  if (!user) return false

  const roleArray = Array.isArray(roles) ? roles : [roles]
  return roleArray.includes(user.role)
}

/**
 * Check if current user is an admin (not just accounting/consultant)
 * @returns {boolean}
 */
export const isAdmin = () => {
  return hasRole('admin')
}

