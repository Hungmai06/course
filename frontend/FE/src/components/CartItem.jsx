
import React from 'react';
import { FaStar, FaUsers } from 'react-icons/fa';

function CartItem({ item, onUpdate, onDelete }) {
  
  const course = item.course || {};
  const avatarRaw = item.avatar || course.avatar || course.image || item.image || item.thumbnail || course.thumbnail;
  let avatar = avatarRaw;
  if (!avatarRaw || typeof avatarRaw !== 'string' || avatarRaw.trim() === '' || avatarRaw === 'null' || avatarRaw === 'undefined') {
    avatar = '/placeholder-course.jpg';
  } else if (avatarRaw.startsWith('/uploads/')) {
    avatar = `${import.meta.env.VITE_API_BASE_URL}${avatarRaw}`;
  } else if (!avatarRaw.startsWith('http')) {
    avatar = '/placeholder-course.jpg';
  }

  const name = item.courseName || item.name || course.title || course.name || 'Khoá học';
  const author = item.nameAuthor || course.author || course.nameAuthor || course.instructor || '';
  const category = item.nameCategory || course.category || course.nameCategory || '';
  const price = item.price || course.price || 0;
  const quantity = item.quantity || 1;
  const rating = item.rating || course.rating || 4.5;
  const ratingCount = item.ratingCount || course.ratingCount || 124;
  const studentCount = item.studentCount || course.studentCount || 1234;

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price);
  const handleIncrease = () => onUpdate(item.courseId, 1);
  const handleDecrease = () => onUpdate(item.courseId, -1);
  const handleDelete = () => onDelete(item.courseId);

  return (
    <div className="course-item cart-item" style={{ 
      borderBottom: "1px solid #ccc", 
      padding: "20px", 
      display: "flex", 
      gap: "15px",
      alignItems: "flex-start"
    }}>
      
      <div className="course-image cart-item-image" style={{ flexShrink: 0 }}>
        <img
          src={avatar}
          alt={name}
          width={100}
          height={80}
          style={{ 
            borderRadius: "8px", 
            objectFit: "cover",
            border: "1px solid #ddd"
          }}
          onError={e => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Course')}&background=random&size=300`; }}
        />
      </div>

    
      <div className="course-content cart-item-info" style={{ flex: 1 }}>
        <div className="course-header cart-item-header" style={{ marginBottom: "10px" }}>
          <h3 style={{ 
            margin: "0 0 8px 0", 
            fontSize: "18px", 
            fontWeight: "bold",
            color: "#333"
          }}>{name}</h3>
          {author && (
            <p style={{ margin: "4px 0", color: "#666", fontSize: "14px" }}>
              👨‍🏫 Tác giả: {author}
            </p>
          )}
          {category && (
            <p style={{ margin: "4px 0", color: "#666", fontSize: "14px" }}>
              📚 Danh mục: {category}
            </p>
          )}
        </div>

       
        <div className="course-stats cart-item-stats" style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <div className="rating">
            <FaStar className="star-icon" />
            <span className="rating-score">{rating}</span>
            <span className="rating-count">({ratingCount})</span>
          </div>
          <div className="students">
            <FaUsers className="users-icon" />
            <span className="student-count">{studentCount} học viên</span>
          </div>
        </div>

       
        <div className="course-pricing cart-item-details" style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "8px",
          marginBottom: "15px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontWeight: "500", minWidth: "80px" }}>💰 Giá:</span>
            <span style={{ fontSize: "16px", fontWeight: "bold", color: "#e74c3c" }}>
              {formatPrice(price)}₫
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontWeight: "500", minWidth: "80px" }}>📦 Số lượng:</span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button 
                onClick={handleDecrease}
                disabled={quantity <= 1}
                style={{
                  width: "30px",
                  height: "30px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: quantity <= 1 ? "#f5f5f5" : "#fff",
                  cursor: quantity <= 1 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                -
              </button>
              <span style={{ 
                minWidth: "30px", 
                textAlign: "center",
                fontSize: "16px",
                fontWeight: "bold"
              }}>{quantity}</span>
              <button 
                onClick={handleIncrease}
                style={{
                  width: "30px",
                  height: "30px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                +
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontWeight: "500", minWidth: "80px" }}>💯 Tổng:</span>
            <span style={{ 
              fontSize: "18px", 
              fontWeight: "bold", 
              color: "#27ae60" 
            }}>{formatPrice(price * quantity)}₫</span>
          </div>
        </div>

       
        <div className="course-item-actions cart-item-actions">
          <button 
            onClick={handleDelete}
            style={{
              padding: "8px 16px",
              backgroundColor: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
            onMouseOver={e => e.target.style.backgroundColor = "#c0392b"}
            onMouseOut={e => e.target.style.backgroundColor = "#e74c3c"}
          >
            🗑️ Xóa khỏi giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartItem;