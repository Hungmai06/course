import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../48ngay/hooks/useAuth'

export default function DLProtectedRoute() {
  const { isDlLoggedIn } = useAuth()
  const location = useLocation()

  if (!isDlLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
