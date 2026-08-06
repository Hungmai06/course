import React from 'react';
import { FaShoppingCart, FaStar, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import cartService from '../services/cartService';
import { showToast } from '../utils/toast';
import { slugify } from '../utils/slugify';
import './CourseItem.css';

const CourseItem = ({ course }) => {
  const navigate = useNavigate();

  const discountPercent = course.oldPrice > course.newPrice
    ? Math.round(((course.oldPrice - course.newPrice) / course.oldPrice) * 100)
    : 0;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const handleCourseClick = () => {
    const slug = course.slug || slugify(course.name || course.title || '');
    navigate(`/course/${slug}`, {
      state: { courseData: course }
    });
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    try {
      await cartService.addToCart(course);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      showToast('✅ Đã thêm khóa học vào giỏ hàng!', 'success');
    } catch (error) {
      showToast('❌ Có lỗi xảy ra khi thêm vào giỏ hàng', 'error');
    }
  };

  const handleBuyNow = async (e) => {
    e.stopPropagation();
    try {
      await cartService.addToCart(course);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      navigate('/cart');
    } catch (error) {
      showToast('❌ Có lỗi xảy ra', 'error');
    }
  };

  return (
    <div className="course-item" onClick={handleCourseClick}>
      {/* Badge giảm giá */}
      {discountPercent > 0 && (
        <div className="discount-badge">
          -{discountPercent}%
        </div>
      )}

      {/* Hình ảnh khóa học */}
      <div className="course-image">
        <img
          src={course.avatar || '/placeholder-course.jpg'}
          alt={course.name}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(course.name || 'Course')}&background=random&size=300`;
          }}
        />
      </div>

      {/* Nội dung khóa học */}
      <div className="course-content">
        <div className="course-header">
          <h3 className="course-item-title">{course.name}</h3>
          <p className="course-author">Tác giả: {course.nameAuthor}</p>
        </div>

        {/* Giá */}
        <div className="course-pricing">
          {course.oldPrice && course.oldPrice > course.newPrice && (
            <span className="old-price">{formatPrice(course.oldPrice)}₫</span>
          )}
          <span className="new-price">{formatPrice(course.newPrice)}₫</span>
        </div>

        {/* Actions: Split into 2 buttons */}
        <div className="course-actions">
          {/* Buy Now: Primary */}
          <button className="action-btn btn-buy-now" onClick={handleBuyNow}>
            Mua ngay
          </button>
          {/* Add to Cart: Secondary - Text instead of Icon */}
          <button className="action-btn btn-add-cart" onClick={handleAddToCart}>
            Thêm giỏ
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseItem;
