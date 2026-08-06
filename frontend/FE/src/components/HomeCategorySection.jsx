import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaShoppingCart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { showToast } from '../utils/toast';
import cartService from '../services/cartService';
import { itemService } from '../services/itemService';
import { slugify } from '../utils/slugify';
import CourseItem from './CourseItem';
import axios from 'axios';
import './HomeCategorySection.css';
import './CourseCombo.css'; // Ensure we have the styles

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const HomeCategorySection = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Slider state
  const [index, setIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [isHovered, setIsHovered] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragEnd, setDragEnd] = useState(0);
  const autoplayRef = useRef(null);
  const trackRef = useRef(null);
  const navigate = useNavigate();

  const FETCH_SIZE = 15;
  const AUTOPLAY_INTERVAL = 3000;

  // Responsive itemsPerView
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 768) {
        setItemsPerView(2); // Mobile
      } else if (w < 1024) {
        setItemsPerView(3); // Tablet
      } else {
        setItemsPerView(4); // Desktop
      }
    };
    handleResize(); // Initialize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load song song courses (priority cao) và categories khi component mount
  useEffect(() => {
    // Fetch courses NGAY LẬP TỨC (priority cao)
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/v1/course/?page=0&size=${FETCH_SIZE}`);
        const list = res.data?.data?.content || [];
        setCourses(list);
      } catch (error) {
        console.error('Không thể tải khóa học:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    // Fetch categories song song (có thể load chậm hơn)
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await itemService.getAll();
        if (res.data && res.data.data) {
          setCategories(res.data.data);
        } else if (Array.isArray(res.data)) {
          setCategories(res.data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Failed to fetch menu items", error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    // Gọi song song - courses sẽ được ưu tiên hiển thị trước
    fetchCourses();
    fetchCategories();
  }, []);

  // INFINITE SLIDER LOGIC
  const displayList = useMemo(() => {
    if (!courses || courses.length === 0) return [];
    // Clone first itemsPerView items and append to end for infinite loop effect
    const clones = courses.slice(0, itemsPerView);
    return courses.concat(clones);
  }, [courses, itemsPerView]);

  const itemWidthPercent = 100 / itemsPerView;

  // Auto-slide
  useEffect(() => {
    if (!displayList.length) return;
    if (autoplayRef.current) clearInterval(autoplayRef.current);

    if (!isHovered && courses.length > itemsPerView) {
      autoplayRef.current = setInterval(() => {
        setIndex(prev => prev + 1);
      }, AUTOPLAY_INTERVAL);
    }
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current); };
  }, [displayList.length, isHovered, courses.length, itemsPerView]);

  // Handle Loop Reset (Transition End)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const handleTransitionEnd = () => {
      if (index >= courses.length) {
        // We reached the cloned items, reset to index 0 instantly
        track.style.transition = 'none';
        setIndex(index - courses.length);
        // force reflow
        track.offsetHeight;
        track.style.transition = '';
      }
    };
    track.addEventListener('transitionend', handleTransitionEnd);
    return () => track.removeEventListener('transitionend', handleTransitionEnd);
  }, [index, courses.length]);


  const handleCategoryClick = (item) => {
    const keyword = item.itemName || item.name || (typeof item === 'string' ? item : 'Item');
    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
  };

  const goTo = (i) => setIndex(i);

  // Drag & Swipe handlers
  const handleDragStart = (e) => {
    setDragStart(e.clientX || (e.touches && e.touches[0].clientX) || 0);
  };

  const handleDragEnd = (e) => {
    setDragEnd(e.clientX || (e.changedTouches && e.changedTouches[0].clientX) || 0);
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeDistance = dragStart - dragEnd;
    const threshold = 50; // Minimum drag distance to trigger slide change

    if (Math.abs(swipeDistance) > threshold) {
      if (swipeDistance > 0) {
        // Swipe left - go to next
        setIndex(prev => prev + 1);
      } else {
        // Swipe right - go to previous
        setIndex(prev => Math.max(0, prev - 1));
      }
    }
  };

  return (
    <section className="home-category-section">
      <div className="home-category-container">
        {/* Left: Category Menu */}
        <div className="category-menu-container">
          <h2 className="category-menu-title">DANH MỤC KHÓA HỌC</h2>
          <div className="category-grid">
            {loadingCategories ? null : categories.length > 0 ? (
              categories.map((item, index) => (
                <div
                  key={item.id || index}
                  className="category-keyword-item category-keyword-item--animate"
                  onClick={() => handleCategoryClick(item)}
                >
                  {item.itemName || item.name || (typeof item === 'string' ? item : 'Item')}
                </div>
              ))
            ) : (
              <div style={{ color: '#666', textAlign: 'center', gridColumn: '1 / -1', padding: '20px' }}>
                Không có danh mục nào
              </div>
            )}
          </div>
        </div>

        {/* Right Column Wrapper: Contains Slider AND Banner */}
        <div className="right-column-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '30px', minWidth: 0 }}>
          {/* Right: Latest Courses Slider (Re-designed with Combo Style) */}
          <div className="latest-courses">
            <h2 className="latest-courses-title">CÁC KHÓA HỌC MỚI NHẤT</h2>

            {loading ? (
              <div className="combo-viewport" style={{ width: '100%', overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {Array.from({ length: itemsPerView }).map((_, i) => (
                    <div key={i} style={{ 
                      width: `calc(${100 / itemsPerView}% - 16px)`, 
                      minHeight: 200, 
                      background: '#f3f4f6', 
                      borderRadius: 8,
                      flexShrink: 0
                    }} />
                  ))}
                </div>
              </div>
            ) : courses.length > 0 ? (
              <div
                className="combo-slider"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onMouseDown={handleDragStart}
                onMouseUp={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchEnd={handleDragEnd}
                style={{ position: 'relative', overflow: 'hidden', cursor: 'grab' }}
              >
                {/* Viewport */}
                <div className="combo-viewport" style={{ width: '100%', overflow: 'hidden' }}>
                  <div
                    className="combo-track"
                    ref={trackRef}
                    style={{
                      display: 'flex',
                      transform: `translateX(-${index * itemWidthPercent}%)`,
                      // Standard combo transition
                      transition: 'transform 600ms cubic-bezier(0.22,1,0.36,1)'
                    }}
                  >
                    {displayList.map((course, idx) => (
                      <div
                        key={course.id ? `${course.id}-${idx}` : idx}
                        className="combo-item"
                        style={{
                          width: `${itemWidthPercent}%`,
                          flexShrink: 0,
                          padding: '0 8px' // Spacing between items
                        }}
                      >
                        {/* Use shared CourseItem component for consistency */}
                        <CourseItem course={course} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
                Không có khóa học nào
              </div>
            )}

            {/* Dots */}
            {courses.length > 0 && (
              <div className="combo-dots" style={{ marginTop: '15px' }}>
                {courses.slice(0, courses.length).map((_, i) => (
                  <button
                    key={i}
                    className={`combo-dot ${i === (index % courses.length) ? 'active' : ''}`}
                    onClick={() => goTo(i)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Promo Banner (Aligned with Slider) */}
          <div className="promo-banner" style={{ margin: 0, maxWidth: 'none', boxSizing: 'border-box' }}>
            <h3 className="promo-title">KHÓA HỌC DRIVE MH - SHARE HƠN 1000+ KHÓA HỌC ONLINE</h3>
            <p className="promo-description">
              Website khóa học online uy tín, giá rẻ, tự động, chất lượng và nhanh chóng nhất hiện nay.
              Share hàng ngàn khóa học chất lượng nhất từ tất cả các lĩnh vực.
              Liên tục cập nhật các khóa học mới đáp ứng nhu cầu của các bạn.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeCategorySection;
