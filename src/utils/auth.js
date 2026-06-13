const ADMIN_TOKEN_KEY = 'relic_admin_token'
const ADMIN_USER_KEY = 'relic_admin_user'
const ADMIN_ROLE = 'administrator'

export function parseJwtPayload(token) {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, '=')
    return JSON.parse(decodeURIComponent(escape(window.atob(padded))))
  } catch (error) {
    return null
  }
}

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export function isValidAdminToken(token = getAdminToken()) {
  if (!token) return false
  const payload = parseJwtPayload(token)
  if (!payload || payload.role !== ADMIN_ROLE) return false
  if (!payload.exp || payload.exp * 1000 <= Date.now()) return false
  return true
}

export function setAdminSession(token, username) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
  localStorage.setItem(ADMIN_USER_KEY, username)
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
  localStorage.removeItem(ADMIN_USER_KEY)
}
