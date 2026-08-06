import React, { useState, useEffect } from 'react';
import './GlobalBanner.css';
import { FaTelegramPlane, FaFacebookF, FaTimes, FaGift } from 'react-icons/fa';

const GlobalBanner = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    useEffect(() => {
        const neverShow = localStorage.getItem('globalBannerDismissed');
        const shownThisSession = sessionStorage.getItem('bannerShownThisSession');

        // Chỉ hiển thị nếu chưa chọn "Không hiển thị lại" và chưa hiển thị trong phiên làm việc này
        if (!neverShow && !shownThisSession) {
            const timer = setTimeout(() => {
                setIsVisible(true);
                sessionStorage.setItem('bannerShownThisSession', 'true');
            }, 500); // Thêm độ trễ nhỏ để trải nghiệm mượt mà hơn
            
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        if (dontShowAgain) {
            localStorage.setItem('globalBannerDismissed', 'true');
        }
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="global-banner-overlay">
            <div className="global-banner-content">
                <button className="global-banner-close" onClick={handleClose} aria-label="Close">
                    <FaTimes />
                </button>
                
                <div className="global-banner-header">
                    <div className="icon-circle">
                        <FaGift className="header-icon" />
                    </div>
                    <h2>Chào mừng bạn!</h2>
                </div>
                
                <div className="global-banner-body">
                    <p className="banner-subtitle">
                        Bạn có câu hỏi về khóa học hoặc cần hỗ trợ? <br/>
                        Hãy tham gia cộng đồng của chúng tôi ngay nhé!
                    </p>
                    
                    <div className="global-banner-links">
                        <a href="https://t.me/+RMs9Vg_unTw1NGZl" target="_blank" rel="noopener noreferrer" className="banner-btn telegram-btn">
                            <span className="btn-icon-wrapper"><FaTelegramPlane /></span>
                            <span className="btn-text">Tham gia nhóm Telegram</span>
                        </a>
                        <a href="https://www.facebook.com/profile.php?id=61566711116017" target="_blank" rel="noopener noreferrer" className="banner-btn facebook-btn">
                            <span className="btn-icon-wrapper"><FaFacebookF /></span>
                            <span className="btn-text">Theo dõi Page Facebook</span>
                        </a>
                    </div>
                </div>
                
                <div className="global-banner-footer">
                    <label className="checkbox-container">
                        <input 
                            type="checkbox" 
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                        />
                        Không hiển thị lại thông báo này
                    </label>
                    <button className="btn-close-bottom" onClick={handleClose}>Tuyệt vời, Đóng!</button>
                </div>
            </div>
        </div>
    );
};

export default GlobalBanner;
