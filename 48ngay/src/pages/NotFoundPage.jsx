import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="panel" style={{ textAlign: 'center', padding: '100px 20px', maxWidth: '600px', margin: '0 auto', color: '#fff' }}>
      <h1 style={{ fontSize: '6rem', margin: '0 0 20px', color: '#f56565' }}>404</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>Không tìm thấy trang</h2>
      <p style={{ fontSize: '1.1rem', marginBottom: '40px', color: '#94a3b8' }}>Đường dẫn này không tồn tại hoặc đã bị di chuyển.</p>
      <Link to="/" className="btn btn-primary" style={{ display: 'inline-block' }}>
        Quay lại trang chủ
      </Link>
    </section>
  )
}

export default NotFoundPage
