import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import bgImage from '../../assets/48ngay.png'

const REGISTER_LINK =
  'https://khoahocdrivemh.pro.vn/course/602-khoa-hoc-48-ngay-lay-goc-ting-anh-toan-dien-cung-co-mai-phuong-vip'

const SUPPORT_PAGE_LINK = 'https://www.facebook.com/profile.php?id=61589431153655'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '' })
  const [error, setError] = useState(location.state?.error || '')
  const [showRegisterLink, setShowRegisterLink] = useState(false)

  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/48ngay'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setShowRegisterLink(false)

    const result = await login(form.email)
    setLoading(false)

    if (!result.success) {
      setError(result.error)
      setShowRegisterLink(result.errorType === 'unregistered')
      return
    }

    navigate(from, { replace: true })
  }

  return (
    <div className="login-page" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="login-shell">
        <aside className="login-promo" aria-hidden="true">
          <p className="login-brand">48 Ngày Lấy Gốc Tiếng Anh</p>
          <h2>Học gọn, rõ, dễ theo dõi trên mọi thiết bị.</h2>
          <p className="login-promo-text">
            Chỉ cần đăng nhập bằng email đã đăng ký để tiếp tục học, làm bài tập và luyện từ vựng.
          </p>

          <div className="login-promo-list">
            <div>
              <span>01</span>
              <p>Video, tài liệu, bài tập và đáp án nằm chung một nơi.</p>
            </div>
            <div>
              <span>02</span>
              <p>Giao diện tối ưu cho điện thoại, máy tính bảng và laptop.</p>
            </div>
            <div>
              <span>03</span>
              <p>Hỗ trợ nhanh nếu bạn chưa có tài khoản web hoặc gặp lỗi.</p>
            </div>
          </div>
        </aside>

        <div className="login-card">
          <div className="login-card-header">
            <p className="login-kicker">Học viên đã đăng ký</p>
            <h1>Đăng nhập</h1>
            <p className="login-subtitle">Nhập email của bạn để vào hệ thống học tập.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  email: event.target.value,
                }))
              }
            />

            {error && <p className="error-message">{error}</p>}

            {showRegisterLink && (
              <p className="register-help">
                Bạn hãy đăng ký trước tại đây hoặc IB admin:{' '}
                <a href={REGISTER_LINK} target="_blank" rel="noreferrer">
                  {REGISTER_LINK}
                </a>
              </p>
            )}

            <button className="btn btn-primary login-submit" type="submit" disabled={loading}>
              {loading ? 'Đang kiểm tra...' : 'Đăng nhập'}
            </button>

            <p className="support-note">
              Nếu chưa có tài khoản web hoặc có vấn đề gì, ib page{' '}
              <a href={SUPPORT_PAGE_LINK} target="_blank" rel="noreferrer">
                {SUPPORT_PAGE_LINK}
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
