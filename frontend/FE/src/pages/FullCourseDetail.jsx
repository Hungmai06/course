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

  const defaultDriveLink = 'https://drive.google.com/drive/folders/1RJ5xX2am3KivbbzzmEZ6Y3lkSB4CfFpN?usp=drive_link';

  useEffect(() => {
    courseService.getFullCourse()
      .then(res => {
        const data = res.data?.data || res.data;
        if (data) {
          setCourse({
            ...data,
            oldPrice: data.oldPrice && data.oldPrice > 0 ? data.oldPrice : 100000000,
            newPrice: data.newPrice && data.newPrice > 0 ? data.newPrice : 599000,
            linkDrive: data.linkDrive || defaultDriveLink,
            linkDrive2: data.linkDrive2 || defaultDriveLink,
            linkTest: data.linkTest || defaultDriveLink,
            linkTest2: data.linkTest2 || defaultDriveLink,
          });
        }
      })
      .catch(err => {
        console.error('Error loading full course detail:', err);
        showToast('Không thể tải thông tin Full Khóa Học', 'error');
      })
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0);

  const formatDescription = (desc) => {
    if (!desc || !desc.trim()) {
      return `
        <h3>🎉 Bạn sẽ có gì trong gói Full Khóa Học?</h3>
        <ul>
          <li><strong>1000+ Khóa học chọn lọc:</strong> Đầy đủ các lĩnh vực Lập trình, Ngoại ngữ, Thiết kế đồ họa, Marketing, Kinh doanh online...</li>
          <li><strong>Hệ thống 2 Link Google Drive:</strong> Link chính và Link dự phòng đồng bộ tốc độ cao.</li>
          <li><strong>Cập nhật miễn phí:</strong> Khóa học mới được upload và làm mới liên tục mỗi ngày.</li>
          <li><strong>Xem online & Tải về offline:</strong> Thoải mái xem trực tuyến hoặc tải trọn bộ về máy cá nhân lưu trữ.</li>
        </ul>
      `;
    }
    // If desc contains HTML tags (like <p>, <h3>, <ul>, <br>), return directly
    if (/<[a-z][\s\S]*>/i.test(desc)) {
      return desc;
    }
    // Otherwise convert plain text lines to HTML paragraphs
    return desc
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => `<p style="margin-bottom: 12px; line-height: 1.7;">${line}</p>`)
      .join('');
  };

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
      question: "Link Khóa Học 1 và Link Khóa Học 2 có gì khác nhau?",
      answer: "Cả 2 link đều chứa đầy đủ 100% kho tài liệu và video bài giảng, giúp bạn có 2 đường dẫn truy cập song song tốc độ cao."
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
                  <div className="feature-name">2 Link Google Drive</div>
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
                    __html: formatDescription(course.description)
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
                <div className="access-guide-content">
                  <div className="guide-card">
                    {/* Method 1 */}
                    <div className="guide-method-section">
                      <h4 className="method-title">👉 Cách 1: Nhận link học tự động qua Gmail (Khuyên dùng)</h4>
                      
                      <div className="guide-step">
                        <div className="step-number">1</div>
                        <div className="step-details">
                          <h4>Kiểm tra Hộp thư đến (Inbox)</h4>
                          <p>Sau khi thanh toán thành công, hệ thống sẽ tự động gửi email chứa liên kết Google Drive của trọn bộ khóa học vào Gmail của bạn ngay lập tức.</p>
                        </div>
                      </div>

                      <div className="guide-step">
                        <div className="step-number">2</div>
                        <div className="step-details">
                          <h4>Kiểm tra thư mục Thư rác (Spam) nếu không nhận được</h4>
                          <p>Nếu không tìm thấy email trong <strong>Hộp thư đến</strong>, bạn vui lòng kiểm tra thư mục <strong>Thư rác (Spam)</strong> hoặc <strong>Quảng cáo (Promotions)</strong> như hướng dẫn bên dưới:</p>
                          <div className="guide-image-container">
                            <img 
                              src="/assets/anhgmail.png" 
                              alt="Hướng dẫn kiểm tra hộp thư đến và thư rác trong Gmail" 
                              className="gmail-guide-img"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Method 2 */}
                    <div className="guide-method-section">
                      <h4 className="method-title">👉 Cách 2: Học trực tiếp trên Website</h4>
                      
                      <div className="guide-step">
                        <div className="step-number">1</div>
                        <div className="step-details">
                          <h4>Truy cập trang web</h4>
                          <p>Đăng nhập vào tài khoản của bạn trên website và truy cập trang chi tiết <strong>Full Khóa Học</strong> hoặc trang <strong>Khóa học của tôi</strong>.</p>
                        </div>
                      </div>

                      <div className="guide-step">
                        <div className="step-number">2</div>
                        <div className="step-details" style={{ width: '100%' }}>
                          <h4>Lấy Link Google Drive trực tiếp</h4>
                          <p>Sau khi thanh toán thành công, các nút <strong>"🚀 Link khóa học 1"</strong> và <strong>"🚀 Link khóa học 2"</strong> sẽ mở khóa để bạn truy cập Google Drive học và tải bài giảng bất cứ lúc nào.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="guide-support-box">
                    <span className="support-icon">💬</span>
                    <div className="support-text">
                      <strong>Bạn cần hỗ trợ nhanh?</strong> Hãy nhấn nút <strong>"Trao đổi KH"</strong> ở phía trên hoặc liên hệ trực tiếp qua Zalo / Fanpage Facebook để được kỹ thuật viên hỗ trợ 24/7!
                    </div>
                  </div>
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
