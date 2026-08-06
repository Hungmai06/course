import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="DolphinLearn Logo" className="w-6 h-6 object-contain" />
              <span className="font-display text-lg font-bold text-primary">DolphinLearn</span>
            </div>
            <p className="text-sm text-text-muted max-w-sm leading-relaxed">
              Nền tảng học ngoại ngữ miễn phí. Chia sẻ tài liệu, học từ vựng và phát triển kỹ năng ngôn ngữ mỗi ngày.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4">Khám phá</h4>
            <ul className="space-y-2.5">
              <li><Link to="/documents" className="text-sm text-text-muted hover:text-primary transition-colors">Tài liệu học tập</Link></li>
              <li><Link to="/vocabulary" className="text-sm text-text-muted hover:text-primary transition-colors">Bộ sưu tập từ vựng</Link></li>
              <li><Link to="/48ngay" className="text-sm text-text-muted hover:text-primary transition-colors">Khóa 48 Ngày</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm mb-4">Hỗ trợ</h4>
            <ul className="space-y-2.5">
              <li><Link to="#" className="text-sm text-text-muted hover:text-primary transition-colors">Về chúng tôi</Link></li>
              <li><Link to="#" className="text-sm text-text-muted hover:text-primary transition-colors">Liên hệ</Link></li>
              <li><Link to="#" className="text-sm text-text-muted hover:text-primary transition-colors">Điều khoản</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 text-center">
          <p className="text-xs text-text-muted">© 2024 DolphinLearn. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}
