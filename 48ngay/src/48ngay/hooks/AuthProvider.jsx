import { useMemo, useState } from 'react'
import {
  getCurrentUser,
  isAuthenticated,
  login as loginService,
  logout as logoutService,
  getDlCurrentUser,
  isDlAuthenticated,
  dlLogin as dlLoginService,
  dlRegister as dlRegisterService,
  dlLogout as dlLogoutService,
  refreshUserProfile as refreshUserProfileService,
} from '../services/authService'
import { AuthContext } from './authContext'

function AuthProvider({ children }) {
  const [user, setUser] = useState(getCurrentUser())
  const [dlUser, setDlUser] = useState(getDlCurrentUser())

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      dlUser,
      isDlLoggedIn: Boolean(dlUser),
      login: async (email) => {
        const result = await loginService(email)
        if (result.success) {
          setUser(result.user)
        }
        return result
      },
      logout: () => {
        logoutService()
        setUser(null)
      },
      dlLogin: async (email, password) => {
        const result = await dlLoginService(email, password)
        if (result.success) {
          setDlUser(result.user)
        }
        return result
      },
      dlRegister: async (name, email, password) => {
        const result = await dlRegisterService(name, email, password)
        if (result.success) {
          setDlUser(result.user)
        }
        return result
      },
      dlLogout: () => {
        dlLogoutService()
        setDlUser(null)
      },
      refreshUser: async () => {
        if (!dlUser?.email) return { success: false }
        const result = await refreshUserProfileService(dlUser.email)
        if (result.success) {
          setDlUser(result.user)
        }
        return result
      },
    }),
    [user, dlUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
