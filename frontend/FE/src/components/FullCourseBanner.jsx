import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaShoppingCart, FaCreditCard, FaArrowRight, FaCrown, FaCheckCircle } from 'react-icons/fa';
import courseService from '../services/courseService';
import cartService from '../services/cartService';
import { showToast } from '../utils/toast';
import './FullCourseBanner.css';

const DEFAULT_FULL_COURSE = {
  name: 'TRỌN BỘ FULL TẤT CẢ KHÓA HỌC DRIVE MH',
  avatar: '/bn.png',
  linkTest: '',
  linkTest2: '',
  oldPrice: 100000000,
  newPrice: 599000,
  isFullCourse: true,
};

const FullCourseBanner = () => {
  const [fullCourse, setFullCourse] = useState(DEFAULT_FULL_COURSE);
  const navigate = useNavigate();

  useEffect(() => {
    courseService.getFullCourse()
      .then(res => {
        const data = res.data?.data || res.data;
        if (data) {
          setFullCourse(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => {
        console.error('Error fetching full course banner:', err);
      });
  }, []);

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p || 0);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    try {
      await cartService.addToCart(fullCourse);
      window.dispatchEvent(new Event('cartUpdated'));
      showToast('✅ Đã thêm Full Gói Khóa Học vào giỏ hàng!', 'success');
    } catch (err) {
      showToast('❌ Lỗi khi thêm vào giỏ hàng', 'error');
    }
  };

  const handleBuyNow = async (e) => {
    e.stopPropagation();
    try {
      await cartService.addToCart(fullCourse);
      window.dispatchEvent(new Event('cartUpdated'));
      navigate('/cart');
    } catch (err) {
      showToast('❌ Lỗi khi chuyển đến thanh toán', 'error');
    }
  };

  const handleOpenLinkTest = (e, url) => {
    e.stopPropagation();
    if (url) {
      window.open(url, '_blank');
    } else {
      navigate('/full-course');
    }
  };

  return (
    <div className="full-banner-wrapper" onClick={() => navigate('/full-course')}>
      <div className="full-banner-card-split">
        
        {/* LEFT 2/3 COLUMN: IMAGE FULL SIZE */}
        <div className="banner-split-2thirds-image">
          <img 
            src={fullCourse.avatar || "/bn.png"} 
            alt="Full Khóa Học Banner" 
            className="banner-2thirds-img" 
            onError={(e) => { e.target.onerror = null; e.target.src = '/bn.png'; }}
          />
          <div className="banner-vip-badge-tag">
            <FaCrown /> HOT DEAL 599K
          </div>
        </div>

        {/* RIGHT 1/3 COLUMN: SLEEK ACTION PANEL */}
        <div className="banner-split-1third-panel">
          <span className="panel-badge">🔥 CHỈ 599K / TRỌN ĐỜI</span>
          
          <h3 className="panel-title">{fullCourse.name}</h3>

          <div className="panel-price-card">
            <span className="panel-label">Giá ưu đãi hôm nay:</span>
            <div className="panel-price-row">
              {fullCourse.oldPrice && fullCourse.oldPrice > fullCourse.newPrice && (
                <span className="panel-old-price">{formatPrice(fullCourse.oldPrice)} đ</span>
              )}
              <span className="panel-new-price">{formatPrice(fullCourse.newPrice)} đ</span>
            </div>
          </div>

          <div className="panel-actions-list">
            <button className="panel-btn btn-panel-buy" onClick={handleBuyNow}>
              <FaCreditCard /> Mua ngay 599K
            </button>

            <button 
              className="panel-btn btn-panel-test" 
              onClick={(e) => handleOpenLinkTest(e, fullCourse.linkTest)}
            >
              <FaPlay /> Xem thử {fullCourse.linkTest2 ? '1' : ''}
            </button>

            {fullCourse.linkTest2 && (
              <button 
                className="panel-btn btn-panel-test-2" 
                onClick={(e) => handleOpenLinkTest(e, fullCourse.linkTest2)}
              >
                <FaPlay /> Xem thử 2
              </button>
            )}

            <button className="panel-btn btn-panel-cart" onClick={handleAddToCart}>
              <FaShoppingCart /> Thêm giỏ hàng
            </button>

            <button className="panel-btn btn-panel-detail" onClick={(e) => { e.stopPropagation(); navigate('/full-course'); }}>
              Xem chi tiết <FaArrowRight />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FullCourseBanner;
