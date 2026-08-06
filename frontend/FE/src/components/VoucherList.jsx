
import React, { useEffect, useState } from 'react';
import VoucherItem from './VoucherItem';
import { getAllVouchers } from '../services/voucherService';
import './VoucherList.css';
import LoadingPlaceholder from './LoadingPlaceholder';

const VoucherList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await getAllVouchers();
        
        if (result.success) {
          setVouchers(result.data || []);
        } else {
          setError(result.message);
          setVouchers([]);
        }
      } catch (error) {
        setError('Không thể tải danh sách voucher');
        setVouchers([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVouchers();
  }, []);

  if (loading) {
    return (
      <div className="voucher-list-container">
        <h2>🎁 Danh sách mã giảm giá</h2>
        <LoadingPlaceholder count={4} height={120} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="voucher-list-container">
        <h2>🎁 Danh sách mã giảm giá</h2>
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="voucher-list-container">
      <h2>🎁 Danh sách mã giảm giá</h2>
      {vouchers.length > 0 ? (
        <div className="voucher-grid">
          {vouchers.map((voucher, index) => (
            <VoucherItem 
              key={voucher.code || index} 
              voucher={voucher} 
            />
          ))}
        </div>
      ) : (
        <div className="empty-message">
          <p>📭 Hiện tại không có mã giảm giá nào.</p>
        </div>
      )}
    </div>
  );
};

export default VoucherList;
