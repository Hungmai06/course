import { useState, useEffect, useRef } from 'react'
import { Outlet, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AuthModal from '../components/AuthModal'
import { useAuth } from '../../48ngay/hooks/useAuth'

export default function DLLayout() {
  const { isDlLoggedIn, refreshUser } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  const hasRefreshed = useRef(false)

  useEffect(() => {
    if (isDlLoggedIn && refreshUser && !hasRefreshed.current) {
      hasRefreshed.current = true
      refreshUser()
    }
  }, [isDlLoggedIn])

  useEffect(() => {
    const auth = searchParams.get('auth')
    if (auth === 'login' || auth === 'register') {
      setAuthMode(auth)
      setIsAuthOpen(true)
    } else {
      setIsAuthOpen(false)
    }
  }, [searchParams])

  const handleCloseAuth = () => {
    setIsAuthOpen(false)
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('auth')
    setSearchParams(newParams)
  }

  return (
    <div className="dl-app flex flex-col md:flex-row min-h-screen bg-slate-50/50">
      <Navbar />
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      <AuthModal isOpen={isAuthOpen} initialMode={authMode} onClose={handleCloseAuth} />
    </div>
  )
}

