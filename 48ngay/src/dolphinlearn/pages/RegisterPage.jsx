import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../48ngay/hooks/useAuth'
import dolphinLogin from '../assets/dolphin-login.png'
import logo from '../assets/logo.png'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { dlRegister } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await dlRegister(name, email, password)
    setLoading(false)
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="dl-app min-h-screen flex relative overflow-hidden bg-slate-50">
      {/* Decorative Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[100px] dl-animate-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-300/10 blur-[120px] dl-animate-blob-delay-1" />

      {/* Left panel (Mascot and Welcome text) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#1d4ed8] via-primary to-primary-light flex-col items-center justify-center p-16 relative overflow-hidden shadow-2xl">
        {/* Floating background elements */}
        <div className="absolute top-[12%] left-[10%] w-16 h-16 rounded-full bg-white/10 blur-md dl-animate-blob" />
        <div className="absolute top-[35%] right-[8%] w-20 h-20 rounded-full bg-white/8 blur-lg dl-animate-blob-delay-2" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col items-center max-w-md">
          <div className="dl-mascot-hover mb-8">
            <img 
              src={dolphinLogin} 
              alt="Mascot" 
              className="w-56 drop-shadow-[0_20px_50px_rgba(255,255,255,0.3)] transition-transform duration-500 hover:scale-105" 
            />
          </div>
          <h2 className="font-display text-3xl font-extrabold text-white text-center mb-3 tracking-tight">
            Bắt đầu hành trình! 🚀
          </h2>
          <p className="text-white/85 text-center leading-relaxed text-base">
            Tạo tài khoản miễn phí để lưu tiến trình học tập, mở khóa tài liệu và luyện từ vựng mỗi ngày.
          </p>
        </div>

        {/* Dynamic Wave Footer */}
        <svg className="absolute bottom-0 left-0 w-full opacity-20" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,96L60,90.7C120,85,240,75,360,80C480,85,600,96,720,96C840,96,960,85,1080,80C1200,75,1320,80,1380,82.7L1440,85L1440,120L0,120Z" fill="white" />
        </svg>
      </div>

      {/* Right panel (Form container) */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-md dl-glass-card rounded-3xl p-8 md:p-10 shadow-2xl transition-all duration-300 hover:shadow-primary/5">
          <div className="flex flex-col items-center mb-6">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <img src={logo} alt="DolphinLearn Logo" className="w-9 h-9 object-contain group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-display text-2xl font-extrabold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                DolphinLearn
              </span>
            </Link>
            <h1 className="font-display text-2xl font-extrabold text-slate-800">Tạo tài khoản</h1>
            <p className="text-sm text-text-muted mt-1 text-center">Đăng ký hoàn toàn miễn phí chỉ trong vài giây</p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-4 mb-6 bg-red-50 border border-red-200/60 rounded-2xl text-sm text-red-600 animate-pulse">
              <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Họ và tên</label>
              <div className="dl-input-wrapper">
                <span className="material-symbols-outlined dl-input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] transition-all duration-200 pointer-events-none">
                  person
                </span>
                <input 
                  type="text" 
                  className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm text-slate-800 font-medium" 
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
                <span className="material-symbols-outlined dl-input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] transition-all duration-200 pointer-events-none">
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
                <span className="material-symbols-outlined dl-input-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] transition-all duration-200 pointer-events-none">
                  lock
                </span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="w-full pl-11 pr-12 py-3 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm text-slate-800 font-medium" 
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
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 px-6 py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                  Đăng ký miễn phí
                </>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200/80"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-50/0 px-3 text-slate-400 font-semibold tracking-wider">Đăng ký nhanh bằng</span>
            </div>
          </div>

          {/* Social signup buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button type="button" className="btn w-full">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>
            <button type="button" className="btn w-full">
              <svg className="w-4 h-4 fill-slate-800" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          <p className="text-center mt-6 text-sm text-text-muted">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline hover:text-primary-dark transition-colors">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

