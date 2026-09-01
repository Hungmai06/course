import React, { useState, useEffect, useRef } from 'react';
import orderService from '../services/orderService';
import vietQrService from '../services/vietQrService';
import { useLocation, useNavigate } from 'react-router-dom';
import './BeforePayment.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { generateDescription } from '../utils/generateDescription';
import { BANK_INFO } from '../constants/bankInfo';
import { clearCart } from '../utils/cartLocalStorage';
import { syncLocalCartToDB } from '../utils/syncCart';

function BeforePayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const pollingInterval = useRef(null);
  const order = location.state?.orderInfo && typeof location.state.orderInfo === 'object' ? location.state.orderInfo : null;
  const courseDetails = order && Array.isArray(order.courses) ? order.courses : [];

  // Nếu muốn bỏ việc kiểm tra trạng thái sau khi hiển thị QR,
  // có thể truyền query `?skipCheck=1` hoặc `location.state.skipCheck = true`
  const skipCheck = (() => {
    try {
      const params = new URLSearchParams(location.search);
      return params.get('skipCheck') === '1' || location.state?.skipCheck;
    } catch (e) {
      return false;
    }
  })();

  const [fullName, setFullName] = useState(order?.fullName || '');
  const [email, setEmail] = useState(order?.email || '');
  const [phone, setPhone] = useState(order?.phone || '');
  const [description, setDescription] = useState(generateDescription());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [orderCreated, setOrderCreated] = useState(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [alertShown, setAlertShown] = useState(false);
  const [checkCount, setCheckCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 phút = 600 giây
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 4000); // Hiển thị 4 giây
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      showNotification(`📋 Đã copy ${label}`, 'info');
    }).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showNotification(`📋 Đã copy ${label}`, 'info');
    });
  };

  const checkPaymentStatus = async () => {
    try {
      setCheckCount(prev => prev + 1);
      const result = await vietQrService.checkPayment(description);
      
      // Kiểm tra thanh toán thành công trực tiếp
      if (result === true || result === 'true' || String(result).toLowerCase() === 'true') {
        setPaymentStatus('success');
        setIsCheckingPayment(false);
        
        if (pollingInterval.current) {
          if (typeof pollingInterval.current === 'function') {
            pollingInterval.current();
          } else {
            clearInterval(pollingInterval.current);
          }
          pollingInterval.current = null;
        }
        
        if (!alertShown) {
          setAlertShown(true);
          showNotification('✅ Thanh toán VietQR thành công!', 'success');
          
          // Lưu thông tin để chuyển sang PaymentResult
          localStorage.setItem('paymentDescription', description);
          localStorage.setItem('paymentAmount', (orderCreated?.finalAmount || order.finalAmount)?.toString() || '0');
          
          setTimeout(() => {
            navigate('/payment-result?status=success&description=' + encodeURIComponent(description));
          }, 2000);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  };


  // If caller wants to skip to QR view (for testing or direct link), support it via
  // location.state.forceShowQr or URL query param ?showQr=1
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const wantShowQr = params.get('showQr') === '1' || location.state?.forceShowQr;
      if (wantShowQr && order) {
        const desc = description || order.description || '';
        const amount = order.finalAmount || (order.totalPrice || 0);
        const fallbackQrUrl = vietQrService.generatePublicQrUrl(
          BANK_INFO.PRIMARY_BANK.bankCode,
          BANK_INFO.PRIMARY_BANK.accountNumber,
          amount,
          desc,
          BANK_INFO.PRIMARY_BANK.accountName
        );

        setQrCodeData({
          qrCodeUrl: fallbackQrUrl,
          bankInfo: {
            bankName: BANK_INFO.PRIMARY_BANK.bankName,
            accountNumber: BANK_INFO.PRIMARY_BANK.accountNumber,
            accountName: BANK_INFO.PRIMARY_BANK.accountName
          },
          orderId: order.orderId || order.id || 'FORCE',
          amount,
          description: desc,
          isFallback: true
        });
        setShowQrCode(true);
        localStorage.setItem('paymentDescription', desc);
        localStorage.setItem('currentOrderId', (order.orderId || order.id || 'FORCE'));
        // start polling (will check by description) unless caller requested skipping checks
        if (!skipCheck) {
          startPaymentPolling(order.orderId || order.id || 'FORCE', desc);
        }
      }
    } catch (err) {
      // ignore
    }
  }, [location.search, location.state, order]);

  const startPaymentPolling = (orderId, description) => {
    // Dừng polling cũ nếu có
    if (pollingInterval.current && typeof pollingInterval.current === 'function') {
      pollingInterval.current();
      pollingInterval.current = null;
    }

    setIsCheckingPayment(true);
    setPaymentStatus('checking');
    setCheckCount(0); // Reset số lần kiểm tra
    setTimeLeft(600); // Reset thời gian (10 phút)
    
  // ...
    
    // Kiểm tra thanh toán với interval 30 giây, tối đa 20 lần
    const startCustomPolling = () => {
      pollingInterval.current = setInterval(async () => {
        // Kiểm tra nếu đã đạt giới hạn số lần kiểm tra
        if (checkCount >= 40) {
          // ...
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
          
          setPaymentStatus('timeout');
          setIsCheckingPayment(false);
          
          if (!alertShown) {
            setAlertShown(true);
            showNotification('⏰ Hết thời gian kiểm tra tự động! Nếu đã chuyển khoản, vui lòng liên hệ Admin.', 'warning');
            
            setTimeout(() => {
              navigate('/payment-result?status=timeout&description=' + encodeURIComponent(description));
            }, 2000);
          }
          return;
        }
        
        // Kiểm tra trạng thái thanh toán
        const success = await checkPaymentStatus();
        
        if (success) {
          // Thanh toán thành công, dừng polling
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
        }
      }, 30000); // 30 giây
    };
    
    // Bắt đầu polling
    startCustomPolling();
    
    // Countdown timer để hiển thị thời gian còn lại
    const countdownInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    // Cleanup function - chạy khi component unmount
    return () => {
  // ...
      if (pollingInterval.current && typeof pollingInterval.current === 'function') {
        pollingInterval.current();
        pollingInterval.current = null;
      }
    };
  }, []);

  // Effect để dừng polling khi paymentStatus thành công
  useEffect(() => {
    if (paymentStatus === 'success') {
      if (pollingInterval.current && typeof pollingInterval.current === 'function') {
        pollingInterval.current();
        pollingInterval.current = null;
      }
    }
  }, [paymentStatus]);

  if (!order) {
    return (
      <div className="before-payment-wrapper error">
        <h2>Không có thông tin đơn hàng!</h2>
        <p>Vui lòng quay lại giỏ hàng để chọn sản phẩm và xác nhận đơn hàng.</p>
      </div>
    );
  }

  const validate = () => {
    if (!fullName.trim()) return 'Vui lòng nhập họ tên';
    if (!email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Email không hợp lệ';
    if (!phone.trim() || !/^\d{9,12}$/.test(phone)) return 'Số điện thoại không hợp lệ';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setIsSubmitting(true);

    const payload = {
      courseIds: Array.isArray(order.courseIds) ? order.courseIds : courseDetails.map(c => c.id),
      couponCode: order.couponCode || order.voucherCode || '',
      fullName,
      email,
      phone,
      description
    };

    try {
      const orderRes = await orderService.createOrder(payload);
        if (orderRes.success && orderRes.data && orderRes.data.orderId) {
        setOrderCreated(orderRes.data);

        const qrRes = await vietQrService.createQrCode({
          orderId: orderRes.data.orderId,
          amount: orderRes.data.finalAmount || order.finalAmount,
          description: description || 'Thanh toán đơn hàng'
        });
        
          if (qrRes.success && qrRes.data) {
          let qrCodeUrl = qrRes.data.qrCodeUrl || qrRes.data.qrData;
          
          // Xử lý base64 string
          if (qrCodeUrl && !qrCodeUrl.startsWith('data:image') && !qrCodeUrl.startsWith('http')) {
            if (qrCodeUrl.startsWith('iVBORw0KG') || qrCodeUrl.length > 100) {
              qrCodeUrl = `data:image/png;base64,${qrCodeUrl}`;
            }
          }

          setQrCodeData({
            ...qrRes.data,
            qrCodeUrl: qrCodeUrl || '',
            isFallback: false
          });
          setShowQrCode(true);
          
          localStorage.setItem('paymentDescription', description || 'Thanh toán đơn hàng');
          localStorage.setItem('currentOrderId', orderRes.data.orderId);
          
          if (!skipCheck) {
            startPaymentPolling(orderRes.data.orderId, description);
          }
          
          // Clear cart
          clearCart();
        } else {
          const fallbackQrUrl = vietQrService.generatePublicQrUrl(
            BANK_INFO.PRIMARY_BANK.bankCode,
            BANK_INFO.PRIMARY_BANK.accountNumber,
            orderRes.data.finalAmount || order.finalAmount,
            description,
            BANK_INFO.PRIMARY_BANK.accountName
          );
          
          setQrCodeData({
            qrCodeUrl: fallbackQrUrl,
            bankInfo: {
              bankName: BANK_INFO.PRIMARY_BANK.bankName,
              accountNumber: BANK_INFO.PRIMARY_BANK.accountNumber,
              accountName: BANK_INFO.PRIMARY_BANK.accountName
            },
            orderId: orderRes.data.orderId,
            amount: orderRes.data.finalAmount || order.finalAmount,
            description: description,
            isFallback: true
          });
          setShowQrCode(true);
          
          localStorage.setItem('paymentDescription', description || 'Thanh toán đơn hàng');
          localStorage.setItem('currentOrderId', orderRes.data.orderId);
          
          if (!skipCheck) {
            startPaymentPolling(orderRes.data.orderId, description);
          }
        }
      } else {
        setError(orderRes.message || 'Không thể tạo đơn hàng.');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi xử lý thanh toán.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar />
      
      {/* Notification Component */}
      {notification.show && (
        <div className={`notification notification-${notification.type}`}>
          <div className="notification-content">
            <span className="notification-message">{notification.message}</span>
            <button 
              className="notification-close"
              onClick={() => setNotification({ show: false, message: '', type: '' })}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="before-payment-wrapper">
        {!showQrCode ? (
          <>
            <h1 className="before-payment-title">Xác nhận thông tin trước thanh toán</h1>
            <form className="before-payment-form" onSubmit={handleSubmit}>
              <div className="form-sections">
                <div className="form-left">
                  <h2>Thông tin cá nhân</h2>
                  <label>Họ tên:</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} />
                  <label>Email(Nhập đúng kiểu abc@gmail.com):</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  <label>Số điện thoại:</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} />
                  <label>Mô tả:</label>
                  <input type="text" value={description} readOnly />
                </div>

                <div className="form-right">
                  <h2>Thông tin đơn hàng</h2>
                  <p><strong>Mã giảm giá/Voucher:</strong> <span className="voucher">{order.couponCode || order.voucherCode || '---'}</span></p>
                  <p><strong>Số lượng đơn khóa học:</strong> <b>{order.totalQuantity || courseDetails.length}</b></p>
                  <div>
                    <strong>Danh sách khóa học đã chọn:</strong>
                    <ul>
                      {courseDetails.map((course, idx) => (
                        <li key={idx}>
                          <b>{course.title}</b> - <span className="price">{course.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p><strong>Tổng tiền gốc:</strong> <span className="price">{order.totalPrice?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span></p>
                  <p className="total-final">Thành tiền sau giảm giá: {order.finalAmount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                </div>
              </div>

              {error && <div className="error-text">{error}</div>}

              <div className="submit-wrapper">
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang xác nhận...' : 'Tiếp tục thanh toán'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="qr-payment-section">
            <h1 className="before-payment-title">Thanh toán bằng QR Code</h1>
            
            <div className="payment-layout-container">
              <div className="left-payment-section">
                <div className="qr-code-display">
                  <h3>Quét mã QR để thanh toán</h3>
                
                  {qrCodeData?.isFallback && (
                   <div></div>
                  )}
                
                  {qrCodeData?.qrCodeUrl ? (
                    <div className="qr-image-container">
                      <img 
                        src={qrCodeData.qrCodeUrl} 
                        alt="QR Code thanh toán" 
                        className="qr-image"
                        onLoad={() => {
                          // ...
                        }}
                        onError={(e) => {
                          if (e.target.dataset.triedFallback !== 'true') {
                            e.target.dataset.triedFallback = 'true';
                            const fallbackUrl = vietQrService.generatePublicQrUrl(
                              BANK_INFO.PRIMARY_BANK.bankCode,
                              BANK_INFO.PRIMARY_BANK.accountNumber,
                              qrCodeData?.amount || order?.finalAmount,
                              description,
                              BANK_INFO.PRIMARY_BANK.accountName
                            );
                            if (fallbackUrl) {
                              e.target.src = fallbackUrl;
                              return;
                            }
                          }
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}

                      />
                      <div className="qr-fallback" style={{ display: 'none' }}>
                        <p>⚠️ Không thể hiển thị QR Code</p>
                        <p>Vui lòng sử dụng thông tin chuyển khoản bên dưới</p>
                      </div>
                    </div>
                  ) : (
                    <div className="qr-loading">
                      <div style={{ minHeight: 120 }} aria-hidden />
                    </div>
                  )}
                </div>

                <div className="manual-transfer-info">
                  <h4>Hoặc chuyển khoản thủ công:</h4>
                  <div className="transfer-details">
                    <h5>🏦 {BANK_INFO.PRIMARY_BANK.bankName}</h5>
                    <p><strong>Số tài khoản:</strong> 
                      <span>{BANK_INFO.PRIMARY_BANK.accountNumber}</span>
                      <button onClick={() => copyToClipboard(BANK_INFO.PRIMARY_BANK.accountNumber, 'số tài khoản')}>
                        📋
                      </button>
                    </p>
                    <p><strong>Tên tài khoản:</strong> {BANK_INFO.PRIMARY_BANK.accountName}</p>
                    <p><strong>Số tiền:</strong> 
                      <span>{(orderCreated?.finalAmount || order.finalAmount)?.toLocaleString('vi-VN')} VNĐ</span>
                      <button onClick={() => copyToClipboard((orderCreated?.finalAmount || order.finalAmount)?.toString() || '0', 'số tiền')}>
                        📋
                      </button>
                    </p>
                    <p><strong>Nội dung:</strong> 
                      <span>{description}</span>
                      <button onClick={() => copyToClipboard(description, 'nội dung chuyển khoản')}>
                        📋
                      </button>
                    </p>
                  </div>
                </div>
              </div>

              <div className="right-qr-section">
                <div className="payment-info">
                  <h3>Thông tin thanh toán</h3>
                  <p><strong>Mã đơn hàng:</strong> {orderCreated?.orderId}</p>
                  <p><strong>Số tiền:</strong> {(orderCreated?.finalAmount || order.finalAmount)?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                  <p><strong>Nội dung:</strong> {description}</p>
                </div>
                <div className="payment-instructions-section">
                  <h3>Hướng dẫn thanh toán:</h3>
                  <ol className="payment-steps">
                    <li>Mở ứng dụng ngân hàng trên điện thoại</li>
                    <li>Chọn chức năng quét mã QR hoặc chuyển khoản</li>
                    <li>Quét mã QR hoặc nhập thông tin chuyển khoản</li>
                    <li>Kiểm tra thông tin và xác nhận thanh toán</li>
                    <li>Lưu lại biên lai giao dịch</li>
                  </ol>
                  
                  <div className="payment-note">
                    <p><strong>Lưu ý:</strong></p>
                    <ul>
                      <li>Vui lòng chuyển khoản đúng số tiền và nội dung</li>
                      <li>Đơn hàng sẽ được xử lý trong 3-5 phút</li>
                      <li>Liên hệ hỗ trợ nếu có vấn đề</li>
                    </ul>
                  </div>
                  
                  <div className="action-buttons">
                    {paymentStatus === 'success' && (
                      <div className="payment-success">
                        ✅ Thanh toán thành công! Đang chuyển hướng...
                      </div>
                    )}

                    {paymentStatus === 'checking' && isCheckingPayment && (
                      <div className="payment-checking">
                        🔍 Đang kiểm tra giao dịch...
                      </div>
                    )}

                    {paymentStatus === 'timeout' && (
                      <div className="payment-timeout">
                        ⏰ Hết thời gian kiểm tra tự động
                      </div>
                    )}
                    
                    <button 
                      className="back-btn"
                      onClick={() => window.history.back()}
                    >
                      ⬅️ Quay lại
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default BeforePayment;