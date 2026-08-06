const AUTH_KEY = 'english48.auth'
const DL_AUTH_KEY = 'dolphinlearn.auth'
const DRIVE_NOTICE_KEY = 'english48.driveNoticeSeen'
const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
const KEYWORD = 'Khóa Học 48 Ngày Lấy Gốc Tiếng Anh Toàn Diện Cùng Cô Mai Phương (VIP)'

export async function login(email) {
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail) {
    return { success: false, error: 'Vui lòng nhập email để đăng nhập.' }
  }

  try {
    const url = `${API_BASE}/api/v1/english/check-english-48-ngay?email=${encodeURIComponent(normalizedEmail)}&keyword=${encodeURIComponent(KEYWORD)}`
    const response = await fetch(url)

    if (!response.ok) {
      return {
        success: false,
        error: 'Không thể kết nối đến máy chủ. Vui lòng thử lại.',
      }
    }

    const isAllowed = await response.json()

    if (!isAllowed) {
      return {
        success: false,
        errorType: 'unregistered',
        error: 'Email này chưa có trong danh sách học viên.',
      }
    }

    const authPayload = {
      email: normalizedEmail,
      loggedInAt: new Date().toISOString(),
    }

    sessionStorage.removeItem(DRIVE_NOTICE_KEY)
    localStorage.setItem(AUTH_KEY, JSON.stringify(authPayload))
    return { success: true, user: authPayload }
  } catch {
    return {
      success: false,
      error: 'Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.',
    }
  }
}

export function logout() {
  sessionStorage.removeItem(DRIVE_NOTICE_KEY)
  localStorage.removeItem(AUTH_KEY)
}

export function getCurrentUser() {
  const raw = localStorage.getItem(AUTH_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return Boolean(getCurrentUser())
}

export function getDlCurrentUser() {
  const raw = localStorage.getItem(DL_AUTH_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function isDlAuthenticated() {
  return Boolean(getDlCurrentUser())
}

export function dlLogout() {
  localStorage.removeItem(DL_AUTH_KEY)
}

export async function dlLogin(email, password) {
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail || !password) {
    return { success: false, error: 'Vui lòng điền đầy đủ email và mật khẩu.' }
  }

  try {
    const response = await fetch(`${API_BASE}/api/v1/english/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: normalizedEmail, password }),
    })

    if (!response.ok) {
      return {
        success: false,
        error: 'Lỗi kết nối đến máy chủ. Vui lòng thử lại.',
      }
    }

    const result = await response.json()

    if (result.code !== 200 || !result.data) {
      return {
        success: false,
        error: result.message || 'Email hoặc mật khẩu không chính xác.',
      }
    }

    const user = result.data
    const authPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points,
      streak: user.streak,
      avatarUrl: user.avatarUrl,
      loggedInAt: new Date().toISOString(),
    }

    localStorage.setItem(DL_AUTH_KEY, JSON.stringify(authPayload))
    return { success: true, user: authPayload }
  } catch (err) {
    return {
      success: false,
      error: 'Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.',
    }
  }
}

export async function dlRegister(name, email, password) {
  const normalizedEmail = email.trim().toLowerCase()

  if (!name || !normalizedEmail || !password) {
    return { success: false, error: 'Vui lòng điền đầy đủ thông tin.' }
  }

  try {
    const response = await fetch(`${API_BASE}/api/v1/english/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email: normalizedEmail, password }),
    })

    if (!response.ok) {
      return {
        success: false,
        error: 'Lỗi kết nối đến máy chủ. Vui lòng thử lại.',
      }
    }

    const result = await response.json()

    if (result.code !== 201 || !result.data) {
      return {
        success: false,
        error: result.message || 'Đăng ký không thành công.',
      }
    }

    const user = result.data
    const authPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points,
      streak: user.streak,
      avatarUrl: user.avatarUrl,
      loggedInAt: new Date().toISOString(),
    }

    localStorage.setItem(DL_AUTH_KEY, JSON.stringify(authPayload))
    return { success: true, user: authPayload }
  } catch (err) {
    return {
      success: false,
      error: 'Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.',
    }
  }
}

export async function refreshUserProfile(email) {
  if (!email) return { success: false, error: 'Email không hợp lệ.' }

  try {
    const response = await fetch(`${API_BASE}/api/v1/english/users/profile?email=${encodeURIComponent(email)}`)
    if (!response.ok) {
      return { success: false, error: 'Không thể lấy thông tin người dùng.' }
    }

    const result = await response.json()
    if (result.code !== 200 || !result.data) {
      return { success: false, error: result.message || 'Lỗi khi lấy thông tin.' }
    }

    const user = result.data
    const existing = JSON.parse(localStorage.getItem(DL_AUTH_KEY) || '{}')
    const authPayload = {
      ...existing,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points,
      streak: user.streak,
      avatarUrl: user.avatarUrl,
    }
    localStorage.setItem(DL_AUTH_KEY, JSON.stringify(authPayload))
    return { success: true, user: authPayload }
  } catch (err) {
    return { success: false, error: 'Lỗi kết nối máy chủ.' }
  }
}

