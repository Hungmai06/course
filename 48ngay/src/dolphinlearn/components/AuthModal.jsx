import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../48ngay/hooks/useAuth'
import logo from '../assets/logo.png'

export default function AuthModal({ isOpen, initialMode = 'login', onClose }) {
  const [mode, setMode] = useState(initialMode) // 'login' or 'register'
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { dlLogin, dlRegister } = useAuth()
  const navigate = useNavigate()

  // Reset states when modal mode changes or modal opens
  useEffect(() => {
    setMode(initialMode)
    setError('')
    setEmail('')
    setName('')
    setPassword('')
    setShowPassword(false)
  }, [initialMode, isOpen])

  // Disable body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await dlLogin(email, password)
    setLoading(false)
    if (result.success) {
      onClose()
      if (result.user?.role === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } else {
      setError(result.error)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await dlRegister(name, email, password)
    setLoading(false)
    if (result.success) {
      onClose()
      navigate('/')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/65 transition-all duration-300">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Content Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl p-8 md:p-10 shadow-2xl overflow-hidden border border-slate-100 z-10 transition-transform duration-300 scale-100 max-h-[90vh] overflow-y-auto dl-no-scrollbar">
        {/* Background Blobs inside Modal */}
        <div className="absolute top-[-15%] left-[-15%] w-[250px] h-[250px] rounded-full bg-blue-400/20 blur-[60px] dl-animate-blob pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[250px] h-[250px] rounded-full bg-emerald-300/10 blur-[60px] dl-animate-blob-delay-1 pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100/50 flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]">close</span>
        </button>

        {/* Brand/Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-1.5 group mb-2">
            <img src={logo} alt="DolphinLearn Logo" className="w-8 h-8 object-contain" />
            <span className="font-display text-xl font-extrabold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              DolphinLearn
            </span>
          </div>
          <h2 className="font-display text-2xl font-extrabold text-slate-800">
            {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </h2>
          <p className="text-xs text-text-muted mt-1 text-center">
            {mode === 'login' ? 'Nhập tài khoản của bạn để vào học' : 'Đăng ký miễn phí chỉ trong vài giây'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2 p-3.5 mb-5 bg-red-50 border border-red-200/60 rounded-2xl text-xs text-red-600 animate-pulse">
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 relative z-10">
          <button 
            type="button" 
            onClick={() => setMode('login')} 
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${mode === 'login' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Đăng nhập
          </button>
          <button 
            type="button" 
            onClick={() => setMode('register')} 
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${mode === 'register' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Đăng ký
          </button>
        </div>

        {/* Forms */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Địa chỉ Email</label>
              <div className="dl-input-wrapper">
                <span className="material-symbols-outlined dl-input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
                  mail
                </span>
                <input 
                  type="email" 
                  className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm text-slate-800 font-medium" 
                  placeholder="name@example.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mật khẩu</label>
              <div className="dl-input-wrapper">
                <span className="material-symbols-outlined dl-input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
                  lock
                </span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="w-full pl-11 pr-12 py-3 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm text-slate-800 font-medium" 
                  placeholder="Nhập mật khẩu" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="btn btn-primary w-full mt-2 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">login</span>
                  Đăng nhập
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Họ và tên</label>
              <div className="dl-input-wrapper">
                <span className="material-symbols-outlined dl-input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
                  person
                </span>
                <input 
                  type="text" 
                  className="w-full pl-11 pr-4 py-2.5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm text-slate-800 font-medium" 
                  placeholder="Nguyễn Văn A" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Địa chỉ Email</label>
              <div className="dl-input-wrapper">
                <span className="material-symbols-outlined dl-input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
                  mail
                </span>
                <input 
                  type="email" 
                  className="w-full pl-11 pr-4 py-2.5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm text-slate-800 font-medium" 
                  placeholder="name@example.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mật khẩu</label>
              <div className="dl-input-wrapper">
                <span className="material-symbols-outlined dl-input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
                  lock
                </span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="w-full pl-11 pr-12 py-2.5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm text-slate-800 font-medium" 
                  placeholder="Tối thiểu 8 ký tự" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full mt-2 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              Đăng ký miễn phí
            </button>
          </form>
        )}



        {/* bottom text switcher */}
        <p className="text-center mt-6 text-xs text-text-muted">
          {mode === 'login' ? (
            <>
              Chưa có tài khoản?{' '}
              <button 
                onClick={() => setMode('register')} 
                className="text-primary font-bold hover:underline hover:text-primary-dark cursor-pointer focus:outline-none"
              >
                Đăng ký miễn phí
              </button>
            </>
          ) : (
            <>
              Đã có tài khoản?{' '}
              <button 
                onClick={() => setMode('login')} 
                className="text-primary font-bold hover:underline hover:text-primary-dark cursor-pointer focus:outline-none"
              >
                Đăng nhập
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
