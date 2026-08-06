import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaStar, FaUsers, FaCheckCircle } from 'react-icons/fa';
import './Banner.css';

const Banner = () => {
  return (
    <section className="banner">
      <div className="banner-container">
        
        <div className="banner-bg-decoration">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
          <div className="floating-shape shape-4"></div>
        </div>

       
        <div className="banner-content">
          <div className="banner-text">
            <h1 className="banner-title">
              Share Khóa Học 
              <br />
              <br />
              <div style={{ fontSize: '40px' }} >Công nghệ, Ngoại Ngữ,<br /> Marketing,...</div>
              <br />
              <span className="highlight-text" style={{ fontSize: '45px' }} >Uy tín, Chất lượng</span>
            </h1>
            
            <p className="banner-description">
              Học hiệu quả với các khóa học chất lượng cao từ các 
              giảng viên kinh nghiệm. Nâng cao kỹ năng coding với hơn 1000+ bài học.
            </p>

            <div className="banner-stats">
              <div className="stat-item">
                <FaUsers className="stat-icon" />
                <span className="stat-text">5,000+ Học viên</span>
              </div>
              <div className="stat-item">
                <FaStar className="stat-icon" />
                <span className="stat-text">4.8/5 Đánh giá</span>
              </div>
              <div className="stat-item">
                <FaCheckCircle className="stat-icon" />
                <span className="stat-text">100+ Khóa học</span>
              </div>
            </div>

            <div className="banner-buttons">
              <Link to="/" className="btn-primary">
                <FaPlay className="btn-icon" />
                Xem Khóa Học
              </Link>
              <a href="https://drive.google.com/drive/folders/1RJ5xX2am3KivbbzzmEZ6Y3lkSB4CfFpN?usp=drive_link" className="btn-secondary">
                Feedback từ Học Viên
              </a>
            </div>
          </div>

          <div className="banner-visual">
           
            <div className="feature-card card-1">
              <div className="feature-icon">
                <FaPlay />
              </div>
              <div className="feature-info">
                <h4>Video HD</h4>
                <p>Chất lượng cao 1080p</p>
                <div className="feature-badge">
                  <span>🎥 Full HD</span>
                </div>
              </div>
            </div>

            <div className="feature-card card-2">
              <div className="feature-icon">
                <FaCheckCircle />
              </div>
              <div className="feature-info">
                <h4>Chứng chỉ</h4>
                <p>Được công nhận</p>
                <div className="completion-indicator">
                  <div className="completion-ring">
                    <svg viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e0e0e0"
                        strokeWidth="2"
                      />
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#667eea"
                        strokeWidth="2"
                        strokeDasharray="85, 100"
                      />
                    </svg>
                    <span className="completion-text">85%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="stats-card">
              <div className="stats-grid">
                <div className="stat-block">
                  <div className="stat-number">5K+</div>
                  <div className="stat-label">Học viên</div>
                </div>
                <div className="stat-block">
                  <div className="stat-number">100+</div>
                  <div className="stat-label">Khóa học</div>
                </div>
                <div className="stat-block">
                  <div className="stat-number">4.8★</div>
                  <div className="stat-label">Đánh giá</div>
                </div>
                <div className="stat-block">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Hỗ trợ</div>
                </div>
              </div>
            </div>

            <div className="tech-showcase">
              <div className="tech-icons">
                <div className="tech-icon react">⚛️</div>
                <div className="tech-icon js">🟨</div>
                <div className="tech-icon python">🐍</div>
                <div className="tech-icon node">🟢</div>
              </div>
              <p>Công nghệ hàng đầu</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
