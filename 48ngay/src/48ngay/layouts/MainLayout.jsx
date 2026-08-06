import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Navbar from '../../dolphinlearn/components/Navbar'
import Footer from '../../dolphinlearn/components/Footer'
import { useAuth } from '../hooks/useAuth'

const DRIVE_NOTICE_KEY = 'english48.driveNoticeSeen'

function MainLayout() {
  const { isLoggedIn, user, logout } = useAuth()
  const navigate = useNavigate()
  const [showDriveNotice, setShowDriveNotice] = useState(
    () => sessionStorage.getItem(DRIVE_NOTICE_KEY) !== '1',
  )

  const closeDriveNotice = () => {
    sessionStorage.setItem(DRIVE_NOTICE_KEY, '1')
    setShowDriveNotice(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/48ngay/login', { replace: true })
  }

  return (
    <div className="dl-app flex flex-col md:flex-row min-h-screen bg-slate-50/50">
      <Navbar />
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Logout bar for 48 Ngày */}
        {isLoggedIn && (
          <div className="english48-logout-bar">
            <span className="english48-logout-email">
              <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle' }}>person</span>
              {user?.email || 'Học viên'}
            </span>
            <button
              type="button"
              className="english48-logout-btn"
              onClick={handleLogout}
              title="Đăng xuất khỏi khóa học 48 Ngày"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
              Đăng xuất
            </button>
          </div>
        )}
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>

      {isLoggedIn && showDriveNotice && (
        <div className="drive-notice-overlay" role="dialog" aria-modal="true" aria-labelledby="drive-notice-title">
          <div className="drive-notice-card">
            <h2 id="drive-notice-title">Thông báo quan trọng</h2>
            <p>Vui lòng đăng nhập Google Drive trước khi học:</p>

            <ol className="drive-notice-steps">
              <li>Mở trình duyệt web: Google, Google Chrome, Safari, Microsoft Edge, Firefox hoặc Cốc Cốc.</li>
              <li>
                Truy cập trang Drive:
                <a href="https://drive.google.com" target="_blank" rel="noreferrer"> drive.google.com</a>.
              </li>
              <li>Nếu chưa đăng nhập, nhập Gmail của bạn đã đăng kí trên web hoặc với admin và nhấn Tiếp theo.</li>
              <li>Nhập mật khẩu rồi nhấn Tiếp theo.</li>
              <li>Nếu bật bảo mật 2 lớp, hãy xác nhận trên điện thoại hoặc nhập mã xác minh.</li>
            </ol>

            <p className="drive-notice-reminder">
              Lưu ý: Bạn phải đăng nhập bằng đúng tài khoản Gmail đã đăng ký khóa học.
            </p>

            <button type="button" className="btn btn-primary" onClick={closeDriveNotice}>
              Tôi đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MainLayout
