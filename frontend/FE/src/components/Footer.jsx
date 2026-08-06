import React from 'react';
import FeatureHighlights from './FeatureHighlights';
import { FaFacebookF, FaEnvelope, FaPhone, FaMapMarkerAlt, FaArrowUp, FaGraduationCap, FaCertificate, FaUsers, FaStar } from 'react-icons/fa';
import ZaloIcon from './ZaloIcon';
import './Footer.css';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <FeatureHighlights />
      <footer className="footer">
        {/* Decorative top wave */}
        <div className="footer-wave">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1200,60 L1200,120 L0,120 Z" fill="currentColor"></path>
          </svg>
        </div>

        {/* Main Footer Content */}
        <div className="footer-container">
          <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section company-section">
            <div className="footer-logo">
              <div className="logo-icon">
                <FaGraduationCap />
              </div>
              <div>
                <h3>Khóa Học Drive MH</h3>
                <p className="footer-tagline">Nâng tầm kỹ năng </p>
              </div>
            </div>
            <p className="footer-description">
              Chúng tôi cung cấp các khóa học  chất lượng cao, giúp bạn phát triển sự nghiệp trong lĩnh vực công nghệ, ngoại ngữ, ...
            </p>
            
            {/* Stats */}
            <div className="footer-stats">
              <div className="stat-item">
                <FaUsers />
                <span>5K+ Học viên</span>
              </div>
              <div className="stat-item">
                <FaCertificate />
                <span>100+ Khóa học</span>
              </div>
              <div className="stat-item">
                <FaStar />
                <span>4.8/5 Đánh giá</span>
              </div>
            </div>

            <div className="footer-social">
              <a href="https://www.facebook.com/profile.php?id=61576866410924" target="_blank" rel="noopener noreferrer" className="social-link facebook">
                <FaFacebookF />
              </a>
              <a href="https://zalo.me/0328028026" target="_blank" rel="noopener noreferrer" className="social-link zalo">
                <ZaloIcon size={32} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-title">Liên kết nhanh</h4>
            <ul className="footer-links">
              <li><a href="/">Trang chủ</a></li>
              <li><a href="/">Khóa học</a></li>
              <li><a href="/about">Giới thiệu</a></li>
            </ul>
          </div>

          {/* Courses */}
          <div className="footer-section">
            <h4 className="footer-title">Danh mục khóa học</h4>
            <ul className="footer-links">
              <li>Công nghệ thông tin</li>
              <li>Ngoại ngữ</li>
              <li>Chỉnh sửa ảnh</li>
              <li>Trung học phổ thông</li>
            </ul>
          </div>

          
          {/* Contact */}
          <div className="footer-section contact-section">
            <h4 className="footer-title">Thông tin liên hệ</h4>
            <div className="contact-info">
              <div className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <span>Hà Nội, Việt Nam</span>
              </div>
              <div className="contact-item">
                <FaPhone className="contact-icon" />
                <span>0328028026</span>
              </div>
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <span>khoahocdrive0604@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="copyright">
            <p>© 2025 Khóa Học Drive MH</p>
          </div>
        </div>
        
        {/* Scroll to top button đã bị ẩn theo yêu cầu */}
      </div>
      </footer>
    </>
  );
};

export default Footer;
