import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import cartService from "../services/cartService";
import orderService from "../services/orderService";
import courseService from "../services/courseService";
import './Cart.css';
import Navbar from "../components/Navbar";
import VoucherItem from "../components/VoucherItem";
import VoucherList from "../components/VoucherList";
import { getAllVouchers } from "../services/voucherService";
import Footer from "../components/Footer";
import { showToast } from '../utils/toast';
function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = JSON.parse(localStorage.getItem('userInfo') || 'null');
      const userId = user?.id;
      const isLoggedIn = user && userId;

      let cartData = null;
      if (isLoggedIn) {
        const res = await cartService.getCart(userId);
        cartData = res.data?.data || res.data;
      } else {
        const res = await cartService.getCart();
        cartData = res.data?.data || res.data;
      }

      // Sync Full Course price dynamically from DB if full course is in cart
      try {
        const fullCourseRes = await courseService.getFullCourse();
        const fcData = fullCourseRes.data?.data || fullCourseRes.data;
        if (fcData && cartData && Array.isArray(cartData.items)) {
          const fcPrice = (fcData.newPrice !== undefined && fcData.newPrice !== null) ? Number(fcData.newPrice) : 0;
          let updated = false;
          cartData.items = cartData.items.map(item => {
            const isFc = item.isFullCourse || String(item.courseId) === '-1' || String(item.courseId) === '854' || 
              (item.courseName && item.courseName.toLowerCase().includes('trọn bộ'));
            if (isFc) {
              updated = true;
              return { ...item, price: fcPrice, isFullCourse: true };
            }
            return item;
          });
          if (updated) {
            cartData.totalPrice = cartData.items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);
          }
        }
      } catch (fcErr) {
        // ignore if fc price fetch fails
      }

      setCart(cartData);
    } catch (err) {
      setError('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchCart();

    // Listen for cart updates
    const handleCartUpdate = (event) => {
      if (event.detail && event.detail.cart) {
        setCart(event.detail.cart);
      } else {
        fetchCart(); // Fallback: refetch if no detail
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    // Listen for cartCleared event (sau khi thanh toán thành công)
    const handleCartCleared = () => {
      fetchCart();
    };
    window.addEventListener('cartCleared', handleCartCleared);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('cartCleared', handleCartCleared);
    };
  }, []);

  const handleUpdate = async (courseId, quantityChange) => {
    try {
      // Check if user is logged in
      const user = JSON.parse(localStorage.getItem('userInfo') || 'null');
      const userId = user?.id;  // userInfo is userResponse object

      await cartService.updateCartItem(userId, courseId, quantityChange);
      // Cart will be updated via event listener
    } catch (err) {
      setError('Không thể cập nhật giỏ hàng');
    }
  };

  const handleDelete = async (courseId) => {
    try {
      // Check if user is logged in
      const user = JSON.parse(localStorage.getItem('userInfo') || 'null');
      const userId = user?.id;  // userInfo is userResponse object

      await cartService.removeCartItem(userId, courseId);
      // Cart will be updated via event listener
    } catch (err) {
      setError('Không thể xóa sản phẩm');
    }
  };

  const handleQuantityChange = async (courseId, newQuantity) => {
    // Find current item to calculate quantity change
    const currentItem = cart.items.find(item => item.courseId === courseId);
    if (currentItem) {
      const quantityChange = newQuantity - currentItem.quantity;
      await handleUpdate(courseId, quantityChange);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleConfirmOrder = async () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      showToast('Giỏ hàng trống!', 'warning');
      return;
    }
    try {
      setIsProcessingPayment(true);
      // Cho phép cả khách và user xác nhận đơn hàng, nhập thông tin ở bước tiếp theo
      let user = JSON.parse(localStorage.getItem('userInfo') || 'null');
      const courseIds = cart.items.map(item => (item.course?.id || item.courseId));
      // Lấy thông tin chi tiết các khóa học
      const courses = cart.items.map(item => ({
        id: item.course?.id || item.courseId,
        title: item.course?.title || item.courseName || '',
        price: item.course?.price || item.price || 0,
        quantity: item.quantity || 1
      }));
      // Tổng số lượng đơn khóa học
      const totalQuantity = cart.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      // Tính tổng tiền gốc và tổng tiền sau giảm giá
      const totalPrice = cart.totalPrice || courses.reduce((sum, c) => sum + c.price, 0);
      const finalAmount = totalPrice - (voucherDiscount || 0);
      const orderData = {
        courseIds,
        courses,
        totalQuantity,
        couponCode: appliedVoucher ? appliedVoucher.code : null,
        fullName: user?.fullName || user?.username || '',
        email: user?.email || '',
        phone: user?.phone || '',
        totalPrice,
        finalAmount
      };
      // Chuyển sang trang BeforePayment, truyền dữ liệu orderData
      navigate('/before-payment', { state: { orderInfo: orderData } });
    } catch (error) {
      showToast('Có lỗi xảy ra khi xác nhận đơn hàng!', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };


  const [userVouchers, setVouchers] = useState([]);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getAllVouchers();

        if (result.success) {

          const activeVouchers = (result.data || []).filter(v => v.active === true);
          setVouchers(activeVouchers);
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

  const handleApplyVoucher = () => {
    const code = voucherCode.trim().toUpperCase();
    const voucher = userVouchers.find(v => v.code.toUpperCase() === code && v.active === true);

    if (!voucher) {
      showToast("❌ Mã giảm giá không hợp lệ, không tồn tại hoặc đã ngừng hoạt động.", 'error');
      return;
    }

    const now = new Date();
    const start = new Date(voucher.startDate);
    const expired = new Date(voucher.expiredDate);

    if (now < start) {
      showToast("⚠️ Mã giảm giá chưa đến thời gian bắt đầu.", 'warning');
      return;
    }

    if (now > expired) {
      showToast("⚠️ Mã giảm giá đã hết hạn.", 'warning');
      return;
    }


    if (cart.totalPrice < voucher.minimumOrder) {
      showToast(`⚠️ Đơn hàng tối thiểu ${formatPrice(voucher.minimumOrder)} để dùng mã này.`, 'warning');
      return;
    }

    const discount = Math.round((cart.totalPrice * voucher.discountPercent) / 100);
    setAppliedVoucher(voucher);
    setVoucherDiscount(discount);

    showToast(`✅ Mã giảm giá áp dụng thành công. Giảm ${formatPrice(discount)}`, 'success');
  };


  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherDiscount(0);
    setVoucherCode('');
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', alignItems: 'center' }}>
          <div className="cart-page">
            <div className="skeleton-cart">
              <div className="skeleton-item" />
              <div className="skeleton-item" />
              <div className="skeleton-item" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', alignItems: 'center' }}>
          <div className="cart-page">
            <div className="error">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div>
        <Navbar />
        <div style={{ marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center', alignItems: 'center', minHeight: 140 }}>
          {userVouchers.filter(v => v.active === true).length > 0 ? (
            userVouchers.filter(v => v.active === true).map(v => (
              <div key={v.id || v.code} style={{ transform: 'scale(1.18)', minWidth: 180, minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <VoucherItem voucher={v} />
              </div>
            ))
          ) : (
            <div>Không có mã giảm giá nào đang hoạt động.</div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', minHeight: '60vh', alignItems: 'center' }}>
          <div className="cart-page">
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h3>Giỏ hàng trống</h3>
              <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
              <Link to="/" className="continue-shopping-btn">
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', minHeight: '100vh', paddingBottom: '40px' }}>
      <Navbar />
      <div style={{
        marginBottom: 32,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 32,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 140
      }}>
        {userVouchers.filter(v => v.active === true).length > 0 ? (
          userVouchers.filter(v => v.active === true).map(v => (
            <div key={v.id || v.code} style={{ transform: 'scale(1.18)', minWidth: 140, minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <VoucherItem voucher={v} />
            </div>
          ))
        ) : (
          <div>Không có mã giảm giá nào đang hoạt động.</div>
        )}
      </div>
      <div className="section-gray-bg" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
        <div className="cart-page">
          <div className="cart-header">
            <h1 className="cart-title">Giỏ hàng của bạn</h1>
            <div className="cart-count">{cart.items.length} sản phẩm</div>
          </div>

          <div className="cart-container">
            <div className="cart-items-section">
              <div className="cart-items-header">
                <div>Sản phẩm</div>
                <div className="item-price-header">Đơn giá</div>
                <div>Số lượng</div>
                <div className="item-total-header">Thành tiền</div>
                <div></div>
              </div>

              <div className="cart-items-list">
                {cart.items.map((item) => {
                  const course = item.course || {};
                  // Ưu tiên lấy ảnh từ item.imageUrl (localStorage), sau đó mới đến các trường khác
                  const avatarRaw = item.imageUrl || item.avatar || course.avatar || course.image || item.image || item.thumbnail || course.thumbnail;
                  let avatar = avatarRaw;
                  if (!avatarRaw || typeof avatarRaw !== 'string' || avatarRaw.trim() === '' || avatarRaw === 'null' || avatarRaw === 'undefined') {
                    avatar = '/placeholder-course.jpg';
                  } else if (avatarRaw.startsWith('/uploads/')) {
                    avatar = `${import.meta.env.VITE_API_BASE_URL}${avatarRaw}`;
                  } else if (!avatarRaw.startsWith('http')) {
                    avatar = '/placeholder-course.jpg';
                  }
                  const name = item.courseName || item.name || course.title || course.name || 'Khoá học';
                  const author = item.nameAuthor || course.author || course.nameAuthor || course.instructor || 'Giảng viên';
                  const price = item.price || course.price || 0;
                  return (
                    <div key={item.courseId} className="cart-item-row">
                      <div className="item-info">
                        <img
                          src={avatar}
                          alt={name}
                          className="item-image"
                          style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }}
                          onError={e => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Course')}&background=random&size=300`; }}
                        />
                        <div className="item-details">
                          <h4>{name}</h4>
                          <p>{author}</p>
                        </div>
                      </div>
                      <div className="item-price">
                        {formatPrice(price)}
                      </div>
                      <div className="quantity-controls">
                        <button
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item.courseId, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item.courseId, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="item-total">
                        {formatPrice(price * item.quantity)}
                      </div>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(item.courseId)}
                        title="Xóa sản phẩm"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="cart-summary">
              <h2 className="summary-title">Tóm tắt đơn hàng</h2>

              {/* Ô nhập mã giảm giá */}
              <div className="voucher-section">
                <div className="voucher-input-group">
                  <input
                    type="text"
                    className="voucher-input"
                    placeholder="Nhập mã giảm giá"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    disabled={appliedVoucher}
                  />
                  {!appliedVoucher ? (
                    <button
                      className="voucher-apply-btn"
                      onClick={handleApplyVoucher}
                      disabled={!voucherCode.trim()}
                    >
                      Áp dụng
                    </button>
                  ) : (
                    <button
                      className="voucher-remove-btn"
                      onClick={handleRemoveVoucher}
                    >
                      Xóa
                    </button>
                  )}
                </div>
                {appliedVoucher && (
                  <div className="applied-voucher">
                    ✅ Mã "{appliedVoucher.code}" - Giảm {appliedVoucher.discountPercent}%
                  </div>
                )}
              </div>

              <div className="summary-row">
                <span className="summary-label">Tạm tính:</span>
                <span className="summary-value">{formatPrice(cart.totalPrice || 0)}</span>
              </div>


              <div className="summary-row">
                <span className="summary-label">Giảm giá:</span>
                <span className="summary-value">-{formatPrice(voucherDiscount)}</span>
              </div>

              <div className="summary-row total">
                <span className="summary-label">Tổng cộng:</span>
                <span className="summary-value total">{formatPrice((cart.totalPrice || 0) - voucherDiscount)}</span>
              </div>

              {!orderConfirmed ? (
                <button
                  className="checkout-btn"
                  onClick={handleConfirmOrder}
                  disabled={isProcessingPayment || !cart?.items?.length}
                >
                  {isProcessingPayment ? 'Đang xử lý...' : 'Tiến hành thanh toán'}
                </button>
              ) : (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                    Vui lòng xác nhận đơn hàng để tiến hành thanh toán VietQR
                  </p>
                </div>
              )}

              <Link to="/" className="continue-shopping-btn" style={{ marginTop: '15px' }}>
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Cart;
