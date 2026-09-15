import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlay, FaShoppingCart, FaCreditCard, FaComments, FaCheckCircle, FaStar, FaShieldAlt, FaRocket, FaLock } from 'react-icons/fa';
import courseService from '../services/courseService';
import cartService from '../services/cartService';
import { showToast } from '../utils/toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingPlaceholder from '../components/LoadingPlaceholder';
import './FullCourseDetail.css';

const FullCourseDetail = () => {
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content'); // 'content' or 'access'
  const [expandedFaq, setExpandedFaq] = useState(null);

  useEffect(() => {
    courseService.getFullCourse()
      .then(res => {
        const data = res.data?.data || res.data;
        if (data) {
          setCourse(data);
        }
      })
      .catch(err => {
        console.error('Error loading full course detail:', err);
        showToast('Không thể tải thông tin Full Khóa Học', 'error');
      })
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0);

  const handleAddToCart = async () => {
    if (!course) return;
    try {
      await cartService.addToCart(course);
      window.dispatchEvent(new Event('cartUpdated'));
      showToast('✅ Đã thêm Trọn Bộ Full Khóa Học vào giỏ hàng!', 'success');
    } catch (error) {
      showToast('❌ Lỗi khi thêm vào giỏ hàng', 'error');
    }
  };

  const handleBuyNow = async () => {
    if (!course) return;
    try {
      await cartService.addToCart(course);
      window.dispatchEvent(new Event('cartUpdated'));
      navigate('/cart');
    } catch (error) {
      showToast('❌ Lỗi khi chuyển đến giỏ hàng', 'error');
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqData = [
    {
      question: "Gói Full Khóa Học bao gồm những nội dung gì?",
      answer: "Gói Full bao gồm tất cả các khóa học thuộc mọi chuyên ngành trên website (Lập trình, Tiếng Anh, Marketing, Thiết kế, v.v.), có đầy đủ video bài giảng, tài liệu và mã nguồn đi kèm."
    },
    {
      question: "Tôi có được cập nhật bài học mới trong tương lai không?",
      answer: "Có! Bạn sẽ nhận được 2 link Google Drive tốc độ cao được cập nhật liên tục 24/7 hoàn toàn miễn phí trọn đời."
    },
    {
      question: "Sự khác biệt giữa Link Khóa Học 1 và Link Khóa Học 2 là gì?",
      answer: "Link 1 là Server chính, Link 2 là Server dự phòng song song. Cả 2 link đều chứa đầy đủ 100% tài nguyên, giúp bạn truy cập liên tục không lo gián đoạn."
    }
  ];

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="full-course-detail-container" style={{ padding: '40px' }}>
          <LoadingPlaceholder count={1} height={300} />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div>
        <Navbar />
        <div className="full-course-detail-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2>Chưa tìm thấy gói Full Khóa Học</h2>
          <button onClick={() => navigate('/')} className="back-button" style={{ marginTop: '20px' }}>
            <FaArrowLeft /> Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const thumbnail = course.avatar || '/bn.png';

  return (
    <div>
      <Navbar />
      <div className="full-course-detail-container">
        
        {/* TOP BAR / NAVIGATION BACK */}
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft /> Quay lại
        </button>

        <div className="full-course-wrapper">
          {/* HEADER SECTION: Image | Info | Features */}
          <div className="full-course-header-row">
            
            {/* PART 1: Image (Left) */}
            <div className="full-course-image-box">
              <div className="full-course-image-card">
                <img 
                  src={thumbnail}
                  alt={course.name}
                  className="full-course-detail-img"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/bn.png'; }}
                />
                <span className="full-course-vip-tag">🔥 TRỌN BỘ VIP</span>
              </div>
            </div>

            {/* PART 2: Title & Price (Middle) */}
            <div className="full-course-title-box">
              <span className="full-course-category-badge">GOI COMBO TỔNG BẢN QUYỀN</span>
              <h1 className="full-course-main-title">{course.name}</h1>
              
              <div className="full-course-rating-row">
                <span className="stars">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                </span>
                <span className="rating-text">5.0 (990+ đánh giá tích cực)</span>
              </div>

              <div className="full-course-price-display">
                {course.oldPrice && course.oldPrice > course.newPrice && (
                  <span className="full-course-old-price">{formatPrice(course.oldPrice)} đ</span>
                )}
                <span className="full-course-new-price">{formatPrice(course.newPrice)} đ</span>
                <span className="full-course-save-tag">TIẾT KIỆM 80%</span>
              </div>
            </div>

            {/* PART 3: Features Sidebar (Right) */}
            <div className="full-course-features-box">
              <div className="feature-item">
                <img src="/assets/daydubaigiang2.png" alt="Đầy đủ bài giảng" className="feature-icon" onError={(e) => { e.target.style.display = 'none'; }} />
                <div className="feature-text">
                  <div className="feature-name">Đầy Đủ 1000+ Khóa Học</div>
                  <div className="feature-subtitle">Tất cả video HD + Bài tập + Source code</div>
                </div>
              </div>

              <div className="feature-item">
                <img src="/assets/hoconlinetienloi.png" alt="Học Online" className="feature-icon" onError={(e) => { e.target.style.display = 'none'; }} />
                <div className="feature-text">
                  <div className="feature-name">Google Drive Dự Phòng</div>
                  <div className="feature-subtitle">Tích hợp 2 Server Drive tốc độ cao</div>
                </div>
              </div>

              <div className="feature-item">
                <img src="/assets/kichhoatnhanh2.png" alt="Kích hoạt 24/7" className="feature-icon" onError={(e) => { e.target.style.display = 'none'; }} />
                <div className="feature-text">
                  <div className="feature-name">Kích Hoạt Tự Động 24/7</div>
                  <div className="feature-subtitle">Nhận link xem & tải ngay sau khi thanh toán</div>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS ROW - Designed with all normal course buttons + 2 preview & 2 drive links */}
          <div className="full-course-action-buttons">
            <div className="action-buttons-left">
              <button 
                className="btn-action-orange" 
                onClick={() => window.open('https://www.facebook.com/profile.php?id=61566711116017', '_blank')}
              >
                <FaComments /> Trao đổi KH
              </button>

              {/* 2 LINK XEM THỬ */}
              {course.linkTest && (
                <button 
                  className="btn-action-green" 
                  onClick={() => window.open(course.linkTest, '_blank')}
                >
                  <FaPlay /> Xem thử 1
                </button>
              )}

              {course.linkTest2 && (
                <button 
                  className="btn-action-teal" 
                  onClick={() => window.open(course.linkTest2, '_blank')}
                >
                  <FaPlay /> Xem thử 2
                </button>
              )}
            </div>

            <div className="action-buttons-right">
              {/* 2 LINK KHÓA HỌC / DRIVE */}
              {course.linkDrive && (
                <button 
                  className="btn-action-learn" 
                  onClick={() => window.open(course.linkDrive, '_blank')}
                >
                  <FaRocket /> Link khóa học 1
                </button>
              )}

              {course.linkDrive2 && (
                <button 
                  className="btn-action-purple" 
                  onClick={() => window.open(course.linkDrive2, '_blank')}
                >
                  <FaRocket /> Link khóa học 2
                </button>
              )}

              <button className="btn-action-dark-blue" onClick={handleAddToCart}>
                <FaShoppingCart /> Thêm giỏ hàng
              </button>

              <button className="btn-action-light-blue" onClick={handleBuyNow}>
                <FaCreditCard /> Thanh toán ngay
              </button>
            </div>
          </div>

          {/* MAIN CONTENT & TABS */}
          <div className="full-course-main-content">
            <div className="detail-tabs">
              <button 
                className={`detail-tab ${activeTab === 'content' ? 'active' : ''}`}
                onClick={() => setActiveTab('content')}
              >
                <span>📚 Nội dung trọn bộ khóa học</span>
              </button>
              <button 
                className={`detail-tab ${activeTab === 'access' ? 'active' : ''}`}
                onClick={() => setActiveTab('access')}
              >
                <span>🔑 Quyền lợi & Hướng dẫn nhận khóa học</span>
              </button>
            </div>

            {activeTab === 'content' ? (
              <div className="tab-panel content-panel">
                <div 
                  className="course-description-html"
                  dangerouslySetInnerHTML={{ 
                    __html: course.description || `
                      <h3>🎉 Bạn sẽ có gì trong gói Full Khóa Học?</h3>
                      <ul>
                        <li><strong>1000+ Khóa học chọn lọc:</strong> Đầy đủ các lĩnh vực Lập trình, Ngoại ngữ, Thiết kế đồ họa, Marketing, Kinh doanh online...</li>
                        <li><strong>Hệ thống 2 Link Google Drive:</strong> Link chính và Link dự phòng đồng bộ tốc độ cao.</li>
                        <li><strong>Cập nhật miễn phí:</strong> Khóa học mới được upload và làm mới liên tục mỗi ngày.</li>
                        <li><strong>Xem online & Tải về offline:</strong> Thoải mái xem trực tuyến hoặc tải trọn bộ về máy cá nhân lưu trữ.</li>
                      </ul>
                    ` 
                  }} 
                />

                {/* FAQ ACCORDION */}
                <div className="faq-section">
                  <h3>❓ Câu Hỏi Thường Gặp</h3>
                  <div className="faq-list">
                    {faqData.map((faq, idx) => (
                      <div key={idx} className={`faq-item ${expandedFaq === idx ? 'expanded' : ''}`}>
                        <div className="faq-question" onClick={() => toggleFaq(idx)}>
                          <span>{faq.question}</span>
                          <span className="faq-toggle-icon">{expandedFaq === idx ? '−' : '+'}</span>
                        </div>
                        {expandedFaq === idx && (
                          <div className="faq-answer">
                            <p>{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="tab-panel access-panel">
                <div className="access-info-card">
                  <FaShieldAlt className="shield-icon" />
                  <h4>Cam Kết Chất Lượng & Quyền Lợi VIP</h4>
                  <ul>
                    <li><FaCheckCircle className="icon-check" /> Quyền truy cập trọn đời không giới hạn thời gian.</li>
                    <li><FaCheckCircle className="icon-check" /> Link Drive riêng biệt, băng thông cực nhanh.</li>
                    <li><FaCheckCircle className="icon-check" /> Hỗ trợ kỹ thuật 24/7 qua Zalo & Facebook Fanpage.</li>
                  </ul>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FullCourseDetail;
