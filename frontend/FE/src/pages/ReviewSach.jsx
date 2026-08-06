import React, { useEffect, useState } from "react";
import { FaStar, FaShoppingCart, FaCheckCircle, FaAward, FaGift } from "react-icons/fa";
import "./ReviewSach.css";

const SHOPEE_LINK = "https://s.shopee.vn/8KmufuFQ2y";

const ReviewSach = () => {
  const [countdown, setCountdown] = useState(1.0);

  useEffect(() => {
    // Nếu user quay lại /review-sach sau khi đã redirect (browser restore, back button...),
    // tự redirect về trang gốc đã lưu thay vì show trang này lại
    const alreadyRedirected = sessionStorage.getItem("review_sach_redirected");
    if (alreadyRedirected) {
      sessionStorage.removeItem("review_sach_redirected");
      const returnUrl = localStorage.getItem("review_sach_return_url") || "/";
      localStorage.removeItem("review_sach_return_url");
      window.location.replace(returnUrl);
      return;
    }

    // Redirect after 1000ms (1s) to give a split second to read the book details
    const redirectTimer = setTimeout(() => {
      // Đánh dấu đã redirect để nếu user quay lại /review-sach sẽ thoát sang trang gốc
      sessionStorage.setItem("review_sach_redirected", "true");
      window.location.href = SHOPEE_LINK;
    }, 1000);

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
                <FaStar className="star-icon" />
                <FaStar className="star-icon" />
                <FaStar className="star-icon" />
                <FaStar className="star-icon" />
                <FaStar className="star-icon" />
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
              <li>
                <FaGift className="promo-icon" />
                <span>Tặng kèm Khóa Học Online học kèm</span>
              </li>
              <li>
                <FaCheckCircle className="promo-icon" />
                <span>Lời giải chi tiết từng bài học</span>
              </li>
              <li>
                <FaAward className="promo-icon" />
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
            <FaShoppingCart style={{ marginRight: '8px' }} /> Đến Shopee Ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewSach;
