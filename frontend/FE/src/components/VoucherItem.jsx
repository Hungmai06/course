
import React from 'react';
import './VoucherItem.css';


const VoucherItem = ({ voucher }) => {
  const {
    code,
    discountPercent,
    minimumOrder,
    startDate,
    expiredDate
  } = voucher;

  
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '0đ';
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(0) + 'tr';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + 'k';
    }
    return amount.toLocaleString('vi-VN') + 'đ';
  };

 
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

 
 const isExpired = () => {
  if (!expiredDate) return false;
  try {
    const today = new Date();
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startDay = startDate ? new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth(), new Date(startDate).getDate()) : null;
    const expiredDay = expiredDate ? new Date(new Date(expiredDate).getFullYear(), new Date(expiredDate).getMonth(), new Date(expiredDate).getDate()) : null;
    if (startDay && todayDay < startDay) return false; 
    if (expiredDay && todayDay > expiredDay) return true; 
    return false; 
  } catch (error) {
    return false;
  }
};

  const expired = isExpired();

  return (
    <div className={`voucher-card ${expired ? 'expired' : ''}`}>
      <div className="voucher-header">
        <span className="voucher-icon">Mã giảm giá</span>
        <strong className="voucher-code">{code || 'VOUCHER'}</strong>
      </div>
      <div className="voucher-body">
        <div className="discount-info">
          <span className="discount-percent">{discountPercent || 0}%</span>
          <span className="discount-label">GIẢM GIÁ</span>
        </div>
        <div className="voucher-details">
          <p><span>Tối thiểu:</span> {formatCurrency(minimumOrder)}</p>
          <p><span>Bắt đầu:</span> {formatDate(startDate)}</p>
          <p><span>Kết thúc:</span> {formatDate(expiredDate)}</p>
        </div>
        { expired  && <div className="expired-badge">Đã hết hạn</div>}
      </div>
    </div>
  );
};

export default VoucherItem;
