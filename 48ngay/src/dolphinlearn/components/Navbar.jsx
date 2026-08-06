import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../48ngay/hooks/useAuth'
import logo from '../assets/logo.png'

export default function Navbar() {
  const { isDlLoggedIn, dlUser, dlLogout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
      isActive
        ? 'bg-blue-50 text-blue-600 border-b-[3px] border-blue-200 shadow-sm active:translate-y-[2px] active:border-b-0'
        : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600 border-b-[3px] border-transparent hover:border-slate-200 active:translate-y-[2px] active:border-b-0'
    }`

  return (
    <header className="w-full md:w-64 h-16 md:h-screen sticky top-0 z-50 bg-white border-b md:border-b-0 md:border-r border-slate-200/80 flex flex-row md:flex-col justify-between md:items-stretch px-6 md:px-4 py-0 md:py-8 shadow-sm md:shadow-none shrink-0">
      {/* Top Part: Logo & Mobile Hamburger */}
      <div className="flex md:flex-col justify-between items-center md:items-start w-full md:w-auto md:mb-8">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logo} alt="DolphinLearn Logo" className="w-9 h-9 object-contain group-hover:scale-105 transition-transform" />
          <span className="font-display text-xl font-black text-primary tracking-tight">DolphinLearn</span>
        </Link>

        {/* Mobile menu trigger */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-slate-700">{isMobileMenuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Middle Part: Navigation Links (Desktop only, vertical list) */}
      <nav className="hidden md:flex flex-col gap-1.5 flex-1">
        <NavLink to="/" end className={linkClass}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Trang chủ
        </NavLink>
        <NavLink to="/documents" className={linkClass}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-folder"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
          Tài liệu
        </NavLink>
        <NavLink to="/vocabulary" className={linkClass}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-languages"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
          Từ vựng
        </NavLink>
        <NavLink to="/leaderboard" className={linkClass}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart-3"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
          Bảng xếp hạng
        </NavLink>
        <NavLink to="/community" className={linkClass}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Cộng đồng
        </NavLink>
        <NavLink to="/48ngay" className={linkClass}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-days"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
          48 Ngày
        </NavLink>
        {dlUser?.role === 'ADMIN' && (
          <NavLink to="/admin" className={linkClass}>
            <span className="material-symbols-outlined text-[20px] text-amber-600">admin_panel_settings</span>
            Quản trị (Admin)
          </NavLink>
        )}
      </nav>

      {/* Bottom Part: User Details / Auth Buttons (Desktop only) */}
      <div className="hidden md:flex flex-col gap-4 border-t border-slate-100 pt-6 mt-auto">
        {isDlLoggedIn ? (
          <div className="space-y-4">
            {/* User Metrics */}
            <div className="flex justify-around items-center bg-slate-50 rounded-2xl py-2 px-1">
              <span className="flex items-center gap-1 text-[11px] font-black text-accent-dark" title="Streak">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                {dlUser?.streak || 0} ngày
              </span>
              <span className="flex items-center gap-1 text-[11px] font-black text-primary" title="XP">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                {dlUser?.points || 0} XP
              </span>
            </div>

            {/* Profile Info and Dropdown/Logout */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                className="w-full flex items-center justify-between gap-2 p-2.5 rounded-2xl hover:bg-slate-50 transition-all border border-slate-100 cursor-pointer text-left"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="material-symbols-outlined text-primary text-[24px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
                  <div className="truncate">
                    <p className="text-xs font-extrabold text-slate-800 truncate">{dlUser?.name || dlUser?.email?.split('@')[0]}</p>
                    <p className="text-[10px] text-slate-400 truncate">{dlUser?.email}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-sm" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none' }}>keyboard_arrow_down</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[60] py-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    Trang cá nhân
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">dashboard</span>
                    Bảng điều khiển
                  </Link>
                  <button 
                    onClick={dlLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link to="?auth=login" className="w-full text-center py-2.5 text-xs font-extrabold text-slate-600 hover:text-primary transition-colors">
              Đăng nhập
            </Link>
            <Link to="?auth=register" className="w-full text-center py-3 text-sm font-bold bg-blue-600 hover:bg-blue-700 !text-white rounded-xl border-b-4 border-blue-900 active:border-b-0 active:translate-y-1 transition-all shadow-sm" style={{ color: '#ffffff' }}>
              Đăng ký miễn phí
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 border-b border-slate-200 bg-white shadow-xl md:hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-6 py-4 flex flex-col gap-2">
            <NavLink to="/" end onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `text-sm font-semibold py-2 transition-colors ${isActive ? 'text-primary' : 'text-slate-600'}`}>Trang chủ</NavLink>
            <NavLink to="/documents" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `text-sm font-semibold py-2 transition-colors ${isActive ? 'text-primary' : 'text-slate-600'}`}>Tài liệu</NavLink>
            <NavLink to="/vocabulary" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `text-sm font-semibold py-2 transition-colors ${isActive ? 'text-primary' : 'text-slate-600'}`}>Từ vựng</NavLink>
            <NavLink to="/leaderboard" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `text-sm font-semibold py-2 transition-colors ${isActive ? 'text-primary' : 'text-slate-600'}`}>Bảng xếp hạng</NavLink>
            <NavLink to="/community" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `text-sm font-semibold py-2 transition-colors ${isActive ? 'text-primary' : 'text-slate-600'}`}>Cộng đồng</NavLink>
            <NavLink to="/48ngay" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `text-sm font-semibold py-2 transition-colors ${isActive ? 'text-primary' : 'text-slate-600'}`}>48 Ngày</NavLink>
            
            {isDlLoggedIn ? (
              <div className="flex flex-col gap-1.5 pt-4 border-t border-slate-100">
                <div className="px-3 py-2 bg-slate-50 rounded-xl mb-2">
                  <p className="text-[10px] font-bold text-slate-400">Tài khoản</p>
                  <p className="text-xs font-black text-slate-800">{dlUser?.name || dlUser?.email?.split('@')[0]}</p>
                  <p className="text-[10px] text-slate-500">{dlUser?.email}</p>
                </div>
                <NavLink to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold py-2 text-slate-600 hover:text-primary transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                  Trang cá nhân
                </NavLink>
                <NavLink to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold py-2 text-slate-600 hover:text-primary transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">dashboard</span>
                  Bảng điều khiển
                </NavLink>
                {dlUser?.role === 'ADMIN' && (
                  <NavLink to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold py-2 text-amber-700 hover:text-amber-800 transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-amber-600">admin_panel_settings</span>
                    Trang Quản trị
                  </NavLink>
                )}
                <button 
                  onClick={() => {
                    dlLogout()
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full text-left py-2 text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
                <Link to="?auth=login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center py-2.5 text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
                  Đăng nhập
                </Link>
                <Link to="?auth=register" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center py-3 text-sm font-bold bg-blue-600 hover:bg-blue-700 !text-white rounded-xl border-b-4 border-blue-900 active:border-b-0 active:translate-y-1 transition-all shadow-sm" style={{ color: '#ffffff' }}>
                  Đăng ký miễn phí
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
