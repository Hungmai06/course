import { useEffect, useState } from "react";
import "./ReviewSach.css";
import { useSEO } from "../hooks/useSEO";

const SHOPEE_LINK = "https://s.shopee.vn/8KmufuFQ2y";

const ReviewSach = () => {
  useSEO({
    title: 'Review sách Tiếng Anh cho người mới bắt đầu',
    description: 'Đánh giá chi tiết sách Tiếng Anh cho người bắt đầu Moonbook (Level A1-A2). Cam kết chính hãng 100%, lời giải chi tiết tặng kèm khoá học online.',
    keywords: 'review sách tiếng anh, sách tiếng anh cho người bắt đầu, moonbook level a1 a2, tự học tiếng anh'
  })

  const [countdown, setCountdown] = useState(0.8);

  useEffect(() => {
    // Redirect after 800ms to give a split second to read the book details
    const redirectTimer = setTimeout(() => {
      window.location.replace(SHOPEE_LINK);
    }, 800);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) return 0;
        return parseFloat((prev - 0.1).toFixed(1));
      });
    }, 100);

    return () => {
      clearTimeout(redirectTimer);
      clearInterval(countdownInterval);
    };
  }, []);

  return (
    <div className="redirect-container">
      <div className="redirect-card">
        {/* Shopee Mall Header Tag */}
        <div className="mall-badge-header">
          <span className="shopee-mall-tag">Mall</span>
          <span className="partner-tag">ĐỐI TÁC CHÍNH THỨC</span>
        </div>

        <div className="book-preview-content">
          {/* Left Column: Book Cover Mockup */}
          <div className="book-cover-container">
            <div className="book-cover">
              <div className="book-brand">Moon</div>
              <div className="book-tag">SÁCH MỚI PHÁT HÀNH</div>
              <div className="book-title-main">TIẾNG ANH</div>
              <div className="book-title-sub">CHO NGƯỜI BẮT ĐẦU</div>
              <div className="book-level">LEVEL A1 - A2</div>
              <div className="book-badge">TẶNG KÈM KHOÁ HỌC</div>
            </div>
            <div className="book-shadow"></div>
          </div>

          {/* Right Column: Book Details */}
          <div className="book-info-container">
            <h1 className="book-title">
              Sách Tiếng anh cho người bắt đầu Moonbook (Level A1-A2)
            </h1>
            
            <div className="rating-row">
              <div className="stars">
                <span className="material-symbols-outlined" style={{ color: '#f59e0b', fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ color: '#f59e0b', fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ color: '#f59e0b', fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ color: '#f59e0b', fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ color: '#f59e0b', fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="rating-score">4.9</span>
              </div>
              <span className="divider">|</span>
              <span className="rating-count">53,2k Đánh giá</span>
              <span className="divider">|</span>
              <span className="sold-count">120k+ Đã bán</span>
            </div>

            <div className="price-box">
              <span className="price-current">164.000đ</span>
              <span className="price-original">260.000đ</span>
              <span className="discount-badge">-34%</span>
            </div>

            <ul className="promo-list">
              <li style={{ display: 'flex', alignItems: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: '18px', fontVariationSettings: "'FILL' 1", marginRight: '8px' }}>card_giftcard</span>
                <span>Tặng kèm Khóa Học Online học kèm</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: '18px', fontVariationSettings: "'FILL' 1", marginRight: '8px' }}>check_circle</span>
                <span>Lời giải chi tiết từng bài học</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: '18px', fontVariationSettings: "'FILL' 1", marginRight: '8px' }}>workspace_premium</span>
                <span>Cam kết chính hãng 100% - Đổi trả 7 ngày</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Redirecting Progress Footer */}
        <div className="redirect-footer">
          <div className="redirect-status-row">
            <div className="loading-spinner-small"></div>
            <span>Đang chuyển hướng an toàn tới Shopee... ({countdown}s)</span>
          </div>
          <div className="redirect-progress-bar">
            <div className="redirect-progress-fill"></div>
          </div>
          <button 
            className="manual-redirect-btn"
            onClick={() => window.location.replace(SHOPEE_LINK)}
          >
            <span className="material-symbols-outlined" style={{ marginRight: '8px' }}>shopping_cart</span> Đến Shopee Ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewSach;
