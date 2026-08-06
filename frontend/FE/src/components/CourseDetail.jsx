import React, { useState, useEffect } from 'react';
import axios from '../services/axiosInstance';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import courseService from '../services/courseService';
import { FaStar, FaUsers, FaPlay, FaArrowLeft, FaQuestionCircle, FaClock, FaBook, FaLock } from 'react-icons/fa';
import cartService from '../services/cartService';
import { showToast } from '../utils/toast';
import { slugify } from '../utils/slugify';
import './CourseDetail.css';
import Navbar from './Navbar';
import LoadingPlaceholder from './LoadingPlaceholder';
import CourseItem from './CourseItem';

const CourseDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams();
  // normalize incoming slug (decode and keep safe string)
  const rawSlug = decodeURIComponent(slug || '');

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [randomCourses, setRandomCourses] = useState([]);
  const [isPurchased, setIsPurchased] = useState(false);
  const [activeTab, setActiveTab] = useState('content'); // 'content' or 'access'

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const courseFromState = location.state?.courseData;
        if (courseFromState) {
          const c = {
            ...courseFromState,
            // subtitle: `Share Khóa Học: ${courseFromState.name}`,
            description: courseFromState.description || "Khóa học hot giúp bạn chinh phục thị trường tuyển dụng.",
            duration: "40 giờ",
            lessons: 120
          };
          setCourse(c);
          return;
        }

        // 1. Try to fetch by slug from backend
        try {
          const res = await axios.get(`/course/slug/${rawSlug}`);
          const c = res?.data?.data || res?.data;
          if (c) {
            const cleanSlug = c.slug || slugify(c.name || c.title || '');
            setCourse(c);
            if (cleanSlug !== rawSlug) {
              navigate(`/course/${cleanSlug}`, { replace: true, state: { courseData: c } });
            }
            return;
          }
        } catch (errSlug) {
          // Fallback if slug search fails
        }

        // 2. Fallback: If slug contains a numeric id prefix like "123-name", fetch by id
        const numericIdMatch = rawSlug.match(/^([0-9]+)(?:-|$)/);
        if (numericIdMatch) {
          const numericId = numericIdMatch[1];
          // use axios instance (normalized baseURL) to avoid duplicate /api/v1 issues
          const res = await axios.get(`/course/${numericId}/detail`);
          const c = res?.data?.data || res?.data;
          if (c) {
            setCourse(c);
            const cleanSlug = c.slug || slugify(c.name || c.title || '');
            navigate(`/course/${cleanSlug}`, { replace: true, state: { courseData: c } });
            return;
          }
        }

        // 3. Fallback: Otherwise try search by slug (convert dashes to spaces)
        // allow underscores in shared links and normalize
        const normalizedSlug = rawSlug.replace(/_/g, '-');
        const keyword = normalizedSlug.replace(/-/g, ' ');
        try {
          const res = await courseService.searchCourse({ keyword, page: 0, size: 10 });
          const items = res?.data?.data?.content || res?.data?.data || res?.data || [];
          let found = null;
          if (Array.isArray(items)) {
            found = items.find(it => {
              const nameSlug = it.slug || slugify(it.name || it.title || '');
              // compare against normalizedSlug (underscores -> hyphens) and rawSlug
              return nameSlug === normalizedSlug || nameSlug === rawSlug;
            }) || items[0];
          }
          if (found) {
            setCourse(found);
            const canonical = found.slug || slugify(found.name || found.title || '');
            if (canonical !== rawSlug) {
              navigate(`/course/${canonical}`, { replace: true, state: { courseData: found } });
            }
            return;
          }
        } catch (errSearch) {
          // search failed, fall through
        }

        // Not found
        setCourse(null);
      } catch (error) {
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [rawSlug, location.state]);

  // Fetch related courses
  useEffect(() => {
    if (course?.nameAuthor) {
      const fetchRelated = async () => {
        try {
          const res = await courseService.searchCourse({ keyword: course.nameAuthor, page: 0, size: 5 });
          const items = res?.data?.data?.content || res?.data?.data || res?.data || [];
          if (Array.isArray(items)) {
            setRelatedCourses(items.filter(c => c.id !== course.id).slice(0, 4));
          }
        } catch (err) {
          console.log('Error fetching related courses:', err);
        }
      };
      fetchRelated();
    }
  }, [course]);

  // Fetch 10 random courses for right sidebar
  useEffect(() => {
    const fetchRandomCourses = async () => {
      try {
        const randomCourses = await courseService.getRandomCourses(course?.id);
        if (Array.isArray(randomCourses)) {
          setRandomCourses(randomCourses);
        }
      } catch (err) {
        console.log('Error fetching random courses:', err);
      }
    };
    if (course?.id) {
      fetchRandomCourses();
    }
  }, [course?.id]);

  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (!course?.id) return;
      try {
        const roleName = localStorage.getItem('roleName');
        if (roleName === 'ADMIN') {
          setIsPurchased(true);
          return;
        }

        const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
        const userId = userInfo?.id;
        if (userId) {
          const res = await courseService.getCoursesByUserId(userId);
          const myCourses = res.data || [];
          const purchased = myCourses.some(c => c.id === course.id);
          setIsPurchased(purchased);
        }
      } catch (err) {
        console.error('Error checking course purchase status:', err);
      }
    };
    checkPurchaseStatus();
  }, [course]);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price);

  const sanitizeCourseDescription = (html) => {
    if (!html) return '';
    if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
      return String(html).replace(/<img\b[^>]*>/gi, '');
    }

    const parser = new DOMParser();
    const document = parser.parseFromString(String(html), 'text/html');
    document.querySelectorAll('img').forEach((img) => img.remove());
    return document.body.innerHTML;
  };

  const handleGoBack = () => navigate(-1);

  const handleAddToCart = async () => {
    try {
      await cartService.addToCart(course);
      window.dispatchEvent(new Event('cartUpdated'));
      showToast('✅ Đã thêm khóa học vào giỏ hàng!', 'success');
    } catch (error) {
      showToast('❌ Lỗi khi thêm vào giỏ hàng', 'error');
    }
  };

  const handleBuyNow = async () => {
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
      question: "Đặt hàng xong tôi nhận được email ở đâu?",
      answer: "Email xác nhận được gửi ngay sau khi đặt hàng thành công."
    },
    {
      question: "Tôi cần hỗ trợ thì liên hệ ai?",
      answer: "Bạn có thể inbox fanpage hoặc chat trên website để được hỗ trợ."
    }
  ];

  if (loading) {
    return <div className="course-detail-container"><LoadingPlaceholder count={1} height={220} /></div>;
  }

  if (!course) {
    return <div className="course-detail-container"><p>Không tìm thấy khóa học</p></div>;
  }

  return (
    <div>
      <Navbar />
      <div className="course-detail-container">
        <button onClick={handleGoBack} className="back-button">
          <FaArrowLeft /> Quay lại
        </button>

        <div className="course-detail-wrapper">
          {/* 3-PART HORIZONTAL LAYOUT: Image | Info | Features */}
          <div className="course-detail-header">
            {/* PART 1: Image (Left) */}
            <div className="course-image-section">
              <div className="course-image-card-large">
                <img 
                  src={course.avatar || '/placeholder-course.jpg'}
                  alt={course.name}
                  className="course-detail-image-large"
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(course.name || 'Course')}&background=random&size=300`; }}
                />
              </div>
            </div>

            {/* PART 2: Title & Price (Middle) */}
            <div className="course-info-section">
              <h1 className="course-title">{course.name}</h1>
              <div className="price-display">
                {course.oldPrice && course.oldPrice > course.newPrice && (
                  <span className="old-price">{formatPrice(course.oldPrice)} đ</span>
                )}
                <span className="new-price">{formatPrice(course.newPrice)} đ</span>
              </div>
            </div>

            {/* PART 3: Features Sidebar (Right) */}
            <div className="course-features-section">
              <div className="course-header-features-wrapper">
                <div className="feature-item">
                  <img src="/assets/daydubaigiang2.png" alt="Dạy Dù Bài Giảng" className="feature-icon" />
                  <div className="feature-text">
                    <div className="feature-name">Dạy Dù Bài Giảng</div>
                    <div className="feature-subtitle">Video bài giảng và tài liệu giảng mô tả</div>
                  </div>
                </div>

                <div className="feature-item">
                  <img src="/assets/hoconlinetienloi.png" alt="Học Online Tiện Lợi" className="feature-icon" />
                  <div className="feature-text">
                    <div className="feature-name">Học Online Tiện Lợi</div>
                    <div className="feature-subtitle">Học online trên drive & hoàn toàn có thể Download khóa học</div>
                  </div>
                </div>

                <div className="feature-item">
                  <img src="/assets/kichhoatnhanh2.png" alt="Kích Hoạt Nhanh" className="feature-icon" />
                  <div className="feature-text">
                    <div className="feature-name">Kích Hoạt Nhanh</div>
                    <div className="feature-subtitle">Kích hoạt khóa học từ động ngay lập tức 24/7</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BUTTONS ROW - Below Header */}
          <div className="action-buttons-container">
            <div className="action-buttons-left">
              <button className="btn-action-orange" onClick={() => window.open('https://www.facebook.com/profile.php?id=61566711116017', '_blank')}>
                💬 Trao đổi KH
              </button>
              <button className="btn-action-green" onClick={() => window.open(course.linkTest, '_blank')}>
                <FaPlay /> Học thử
              </button>
            </div>
            
            <div className="action-buttons-right">
              {course.linkDrive && (
                <button className="btn-action-learn" onClick={() => window.open(course.linkDrive, '_blank')}>
                  🚀 Học ngay tại đây
                </button>
              )}
              <button className="btn-action-dark-blue" onClick={handleAddToCart}>
                🛒 Thêm giỏ hàng
              </button>
              <button className="btn-action-light-blue" onClick={handleBuyNow}>
                💳 Thanh toán ngay
              </button>
            </div>
          </div>

          {/* MIDDLE: Content & Random Courses - 2 Column Layout */}
          <div className="course-detail-content">
            <div className="content-section">
              <div className="detail-tabs">
                <button 
                  className={`detail-tab ${activeTab === 'content' ? 'active' : ''}`}
                  onClick={() => setActiveTab('content')}
                >
                  <span className="section-icon">📚</span>
                  <span>Nội dung khóa học</span>
                </button>
                <button 
                  className={`detail-tab ${activeTab === 'access' ? 'active' : ''}`}
                  onClick={() => setActiveTab('access')}
                >
                  <span className="section-icon">🔑</span>
                  <span>Nhận khóa học</span>
                </button>
              </div>

              {activeTab === 'content' ? (
                <>
                  {course.linkDrive && (
                    <div className="purchased-course-banner">
                      <div className="purchased-banner-icon">🎉</div>
                      <div className="purchased-banner-text">
                        <h4>Thanh toán và Học ngay trên Google Drive!</h4>
                        <p>Nhấp vào nút bên dưới để bắt đầu học ngay trên Google Drive.</p>
                      </div>
                      <a href={course.linkDrive} target="_blank" rel="noopener noreferrer" className="purchased-banner-btn">
                        🚀 Học ngay tại đây
                      </a>
                    </div>
                  )}
                  <div className="content-text">
                    <div dangerouslySetInnerHTML={{ __html: sanitizeCourseDescription(course.description) }} />
                  </div>
                </>
              ) : (
                <div className="access-guide-content">
                  <div className="guide-card">
                    {/* Method 1 */}
                    <div className="guide-method-section">
                      <h4 className="method-title">👉 Cách 1: Nhận link học tự động qua Gmail (Khuyên dùng)</h4>
                      
                      <div className="guide-step">
                        <div className="step-number">1</div>
                        <div className="step-details">
                          <h4>Kiểm tra Hộp thư đến (Inbox)</h4>
                          <p>Sau khi thanh toán thành công, hệ thống sẽ tự động gửi email chứa liên kết Google Drive của khóa học vào Gmail của bạn ngay lập tức.</p>
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
                          <p>Truy cập vào trang web và vào trang chi tiết khóa học bạn đã mua.</p>
                        </div>
                      </div>

                      <div className="guide-step">
                        <div className="step-number">2</div>
                        <div className="step-details" style={{ width: '100%' }}>
                          <h4>Vào học ngay tại đây</h4>
                          <p>Sau khi thanh toán thành công, nút <strong>"🚀 Học ngay tại đây"</strong> sẽ xuất hiện bên dưới:</p>
                          {course.linkDrive ? (
                            <div className="purchased-course-banner" style={{ marginTop: '12px', width: '100%' }}>
                              <div className="purchased-banner-icon">🎉</div>
                              <div className="purchased-banner-text">
                                <h4>Thanh toán và Học ngay trên Google Drive!</h4>
                                <p>Nhấp vào nút bên dưới để bắt đầu học ngay trên Google Drive.</p>
                              </div>
                              <a href={course.linkDrive} target="_blank" rel="noopener noreferrer" className="purchased-banner-btn">
                                🚀 Học ngay tại đây
                              </a>
                            </div>
                          ) : (
                            <div className="locked-course-banner" style={{ marginTop: '12px', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '20px' }}>🔒</span>
                              <div>
                                <h5 style={{ margin: 0, fontWeight: 700, color: '#64748b', fontSize: '14px' }}>Nút "Học ngay" sẽ kích hoạt tại đây sau khi hệ thống xác nhận thanh toán.</h5>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="guide-support-box">
                    <span className="support-icon">💬</span>
                    <div className="support-text">
                      <strong>Bạn cần hỗ trợ nhanh?</strong> Hãy nhấn nút <strong>"Trao đổi KH"</strong> ở trên hoặc chat trực tiếp với đội ngũ hỗ trợ của chúng tôi để được trợ giúp 24/7.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="random-courses-section">
              <h3 className="section-title">
                <span className="section-icon">🎓</span>
                <span>Khóa học ngẫu nhiên</span>
              </h3>
              <div className="random-courses-grid">
                {randomCourses.length > 0 ? (
                  randomCourses.map((randomCourse) => (
                    <div 
                      key={randomCourse.id} 
                      className="random-course-card"
                      onClick={() => {
                        const slug = randomCourse.slug || slugify(randomCourse.name || randomCourse.title || '');
                        navigate(`/course/${slug}`, { state: { courseData: randomCourse } });
                      }}
                    >
                      <div className="random-course-image-large">
                        <img 
                          src={randomCourse.avatar || '/placeholder-course.jpg'} 
                          alt={randomCourse.name}
                          onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(randomCourse.name || randomCourse.title || 'Course')}&background=random&size=300`; }}
                        />
                      </div>
                      <div className="random-course-details">
                        <div className="random-course-name-large">{randomCourse.name || randomCourse.title}</div>
                        <div className="random-course-pricing">
                          {randomCourse.oldPrice && randomCourse.oldPrice > randomCourse.newPrice && (
                            <span className="random-old-price">{formatPrice(randomCourse.oldPrice)} đ</span>
                          )}
                          <span className="random-course-price-large">{formatPrice(randomCourse.newPrice)} đ</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-courses">Đang tải khóa học...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
