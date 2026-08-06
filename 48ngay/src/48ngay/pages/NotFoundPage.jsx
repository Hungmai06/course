import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="panel">
      <h1>404</h1>
      <p>Trang bạn tìm không tồn tại.</p>
      <Link to="/" className="btn btn-primary">
        Về dashboard
      </Link>
    </section>
  )
}

export default NotFoundPage
