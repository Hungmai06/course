import React from 'react';
import './About.css';
import Navbar from "../components/Navbar";
import Footer from '../components/Footer';

const features = [
  { icon: '📚', title: 'Hệ thống khóa học phong phú', content: 'Hơn 1000+ khóa học các lĩnh vực Lập trình, Marketing, Thiết kế,... được cập nhật liên tục.' },
  { icon: '👨‍🏫', title: 'Giảng viên tâm huyết', content: 'Chuyên gia hàng đầu truyền đạt kiến thức dễ hiểu, truyền cảm hứng học tập hiệu quả.' },
  { icon: '💡', title: 'Phương pháp học hiện đại', content: 'Kết hợp video sinh động, thực hành sát thực tế, kiểm tra đánh giá hiệu quả.' },
  { icon: '🌍', title: 'Học mọi lúc mọi nơi', content: 'Chỉ cần thiết bị kết nối internet là bạn có thể học bất cứ khi nào, bất cứ đâu.' },
];

const commitments = [
  { icon: '🎯', text: 'Kiến thức chuyên môn vững vàng' },
  { icon: '🛠️', text: 'Kỹ năng thực hành thành thạo' },
  { icon: '🏆', text: 'Tăng cường khả năng cạnh tranh' },
  { icon: '💼', text: 'Nâng cao cơ hội nghề nghiệp' },
  { icon: '✨', text: 'Tự tin chinh phục mục tiêu' },
];

const utilities = [
  { icon: '🛡️', title: 'Uy Tín Chất Lượng', desc: 'Được kiểm tra và học thử trước khi mua' },
  { icon: '⚡', title: 'Kích Hoạt Nhanh', desc: 'Kích hoạt tự động trong 1–2 phút' },
  { icon: '💰', title: 'Giá Cực Tiết Kiệm', desc: 'Khóa học giá rẻ nhất thị trường' },
  { icon: '🤝', title: 'Hỗ Trợ 24/7', desc: 'Liên hệ Fanpage hoặc Zalo để được hỗ trợ' },
];

const About = () => {
  return (
    <div className="about-page">
      <Navbar />

      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <span className="about-hero-badge">🎓 Nền tảng học tập #1 Việt Nam</span>
          <h1 className="about-hero-title">Khóa Học Drive MH</h1>
          <p className="about-hero-sub">
            Chắp cánh ước mơ thành công — hơn <strong>1000+</strong> khóa học chất lượng cao,
            giá tốt nhất, kích hoạt tự động trong tích tắc.
          </p>
          <div className="about-stats">
            <div className="about-stat">
              <span className="about-stat-num">1000+</span>
              <span className="about-stat-label">Khóa học</span>
            </div>
            <div className="about-stat-divider" />
            <div className="about-stat">
              <span className="about-stat-num">5000+</span>
              <span className="about-stat-label">Học viên</span>
            </div>
            <div className="about-stat-divider" />
            <div className="about-stat">
              <span className="about-stat-num">1–2 phút</span>
              <span className="about-stat-label">Kích hoạt</span>
            </div>
          </div>
        </div>
      </section>

      <div className="about-body">

        {/* TẠI SAO CHỌN */}
        <section className="about-section">
          <div className="about-section-header">
            <h2>Tại sao nên chọn chúng tôi?</h2>
            <p>Những lý do hàng nghìn học viên tin tưởng lựa chọn Khóa Học Drive MH</p>
          </div>
          <div className="about-features-grid">
            {features.map((f, i) => (
              <div className="about-feature-card" key={i}>
                <div className="about-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CAM KẾT */}
        <section className="about-section about-commitment">
          <div className="about-section-header">
            <h2>Cam kết của chúng tôi</h2>
            <p>Chúng tôi đảm bảo mang lại giá trị thực sự cho từng học viên</p>
          </div>
          <div className="about-commitment-list">
            {commitments.map((c, i) => (
              <div className="about-commitment-item" key={i}>
                <span className="about-commitment-icon">{c.icon}</span>
                <span>{c.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* TIỆN ÍCH */}
        <section className="about-section">
          <div className="about-section-header">
            <h2>Dịch vụ nổi bật</h2>
            <p>Trải nghiệm mua sắm và học tập tốt nhất</p>
          </div>
          <div className="about-utility-grid">
            {utilities.map((u, i) => (
              <div className="about-utility-card" key={i}>
                <div className="about-utility-icon">{u.icon}</div>
                <h4>{u.title}</h4>
                <p>{u.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* LIÊN HỆ */}
        <section className="about-section">
          <div className="about-section-header">
            <h2>Liên hệ với chúng tôi</h2>
            <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
          </div>
          <div className="about-contact-grid">
            <a href="http://khoahocdrivemh.pro.vn/" target="_blank" rel="noopener noreferrer" className="about-contact-card">
              <span className="about-contact-icon">🌐</span>
              <div><strong>Website</strong><p>khoahocdrivemh.pro.vn</p></div>
            </a>
            <a href="tel:0328028026" className="about-contact-card">
              <span className="about-contact-icon">📞</span>
              <div><strong>Hotline</strong><p>0328 028 026</p></div>
            </a>
            <a href="mailto:khoahocdrive0604@gmail.com" className="about-contact-card">
              <span className="about-contact-icon">📧</span>
              <div><strong>Email</strong><p>khoahocdrive0604@gmail.com</p></div>
            </a>
          </div>
        </section>

        {/* CTA BOTTOM */}
        <section className="about-cta-bottom">
          <h2>Sẵn sàng bắt đầu hành trình học tập?</h2>
          <p>Truy cập ngay để khám phá hàng nghìn khóa học và đăng ký học ngay hôm nay!</p>
          <a href="http://khoahocdrivemh.pro.vn/" target="_blank" rel="noopener noreferrer" className="about-cta-btn">
            Khám phá ngay →
          </a>
        </section>

      </div>
      <Footer />
    </div>
  );
};

export default About;