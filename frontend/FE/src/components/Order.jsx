import React, { useEffect, useState } from 'react';
import orderService from '../services/orderService';
import { showToast } from '../utils/toast';
import { FaEye, FaEdit, FaTrash, FaPlus, FaCheckCircle } from 'react-icons/fa';
import Pagination from './Pagination';
import LoadingPlaceholder from './LoadingPlaceholder';

export default function Order() {
  const [orderList, setOrderList] = useState([]);
  const [orderPage, setOrderPage] = useState(0);
  const [orderSize, setOrderSize] = useState(20);
  const [orderTotalPages, setOrderTotalPages] = useState(1);
  const [orderSearch, setOrderSearch] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderModalMode, setOrderModalMode] = useState('view');
  const [orderForm, setOrderForm] = useState({
    orderId: '',
    totalAmount: '',
    discountAmount: '',
    finalAmount: '',
    status: '',
    email: '',
    phone: '',
    description: '',
    discountCode: '',
    items: [],
  });
  const [orderErrors, setOrderErrors] = useState({});
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailToUpdate, setEmailToUpdate] = useState('');
  const [orderIdToUpdate, setOrderIdToUpdate] = useState(null);

  // Debounce search để tránh gọi API liên tục khi user đang gõ
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(orderSearch);
    }, 300); // Đợi 300ms sau khi user ngừng gõ

    return () => clearTimeout(timer);
  }, [orderSearch]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoadingOrder(true);
        let res;

        // Sử dụng API search nếu có từ khóa tìm kiếm, ngược lại dùng getAll
        if (searchDebounce && searchDebounce.trim()) {
          res = await orderService.search(orderPage, orderSize, searchDebounce.trim(), 'id', 'desc');
        } else {
          res = await orderService.getAll(orderPage, orderSize, 'id', 'desc');
        }

        let allData = [];
        let totalPages = 1;

        if (res.data && res.data.data) {
          if (res.data.data.content && Array.isArray(res.data.data.content)) {
            // Response có pagination
            allData = res.data.data.content;
            totalPages = res.data.data.totalPages || 1;
          } else if (Array.isArray(res.data.data)) {
            // Response không có pagination
            allData = res.data.data;
            totalPages = Math.ceil(allData.length / orderSize);
          }
        } else if (Array.isArray(res.data)) {
          allData = res.data;
          totalPages = Math.ceil(allData.length / orderSize);
        }

        // Sắp xếp theo ID giảm dần
        allData.sort((a, b) => {
          const idA = a.orderId || a.id || 0;
          const idB = b.orderId || b.id || 0;
          return idB - idA;
        });

        setOrderList(allData);
        setOrderTotalPages(totalPages);
      } catch (err) {
        setOrderList([]);
        setOrderTotalPages(1);
      } finally {
        setLoadingOrder(false);
      }
    };

    fetchOrder();
  }, [orderPage, orderSize, searchDebounce]);

  // Handler to update order status to SUCCESS
  const handleUpdateToSuccess = async (orderId) => {
    if (!window.confirm('Cập nhật trạng thái đơn hàng sang SUCCESS?')) return;
    try {
      setLoadingOrder(true);
      const resp = await orderService.update(orderId, 'SUCCESS');
      const message = resp?.data?.message || 'Cập nhật trạng thái thành công';
      showToast(message, 'success');
      // refresh list after update
      setOrderPage(0);
      const res = await orderService.getAll(0, orderSize, 'id', 'desc');
      if (res.data && res.data.data && Array.isArray(res.data.data.content)) {
        setOrderList(res.data.data.content);
        setOrderTotalPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Không thể cập nhật trạng thái';
      showToast(errMsg, 'error');
    } finally {
      setLoadingOrder(false);
    }
  };

  // Handler to open email update modal
  const handleOpenEmailModal = (order) => {
    setOrderIdToUpdate(order.orderId || order.id);
    setEmailToUpdate(order.email || '');
    setShowEmailModal(true);
  };

  // Handler to update email
  const handleUpdateEmail = async () => {
    if (!emailToUpdate || !emailToUpdate.trim()) {
      showToast('Vui lòng nhập email', 'error');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToUpdate)) {
      showToast('Email không hợp lệ', 'error');
      return;
    }
    try {
      setLoadingOrder(true);
      const resp = await orderService.updateEmail(orderIdToUpdate, emailToUpdate);
      const message = resp?.data?.message || 'Cập nhật email thành công';
      showToast(message, 'success');
      setShowEmailModal(false);
      // refresh list after update
      const res = await orderService.getAll(orderPage, orderSize, 'id', 'desc');
      if (res.data && res.data.data && Array.isArray(res.data.data.content)) {
        setOrderList(res.data.data.content);
        setOrderTotalPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Không thể cập nhật email';
      showToast(errMsg, 'error');
    } finally {
      setLoadingOrder(false);
    }
  };

  return (
    <div className="section-table-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Danh sách đơn hàng</h2>
      </div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Tìm kiếm theo ID, email hoặc SĐT..."
          value={orderSearch}
          onChange={e => { setOrderSearch(e.target.value); setOrderPage(0); }}
          style={{ padding: '8px', borderRadius: 6, border: '1px solid #ddd', width: 240 }}
        />
        {loadingOrder && <span style={{ color: '#666', fontSize: '14px' }}>Đang tìm kiếm...</span>}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: '#f0f4ff' }}>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>ID</th>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>Tổng tiền</th>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>Giảm giá</th>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>Thành tiền</th>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>Trạng thái</th>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>Email</th>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>SĐT</th>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>Ngày tạo</th>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>Mô tả</th>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>Mã giảm giá</th>
            <th style={{ padding: '8px', border: '1px solid #eee', textAlign: 'center' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orderList.map((order, idx) => (
            <tr key={order.orderId || idx}>
              <td style={{ padding: '8px', border: '1px solid #eee' }}>{order.orderId}</td>
              <td style={{ padding: '8px', border: '1px solid #eee' }}>{order.totalAmount}</td>
              <td style={{ padding: '8px', border: '1px solid #eee' }}>{order.discountAmount}</td>
              <td style={{ padding: '8px', border: '1px solid #eee' }}>{order.finalAmount}</td>
              <td style={{ padding: '8px', border: '1px solid #eee' }}>{order.status}</td>
              <td style={{ padding: '8px', border: '1px solid #eee' }}>{order.email}</td>
              <td style={{ padding: '8px', border: '1px solid #eee' }}>{order.phone}</td>
              <td style={{ padding: '8px', border: '1px solid #eee' }}>{order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</td>
              <td style={{ padding: '8px', border: '1px solid #eee' }}>{order.description}</td>
              <td style={{ padding: '8px', border: '1px solid #eee' }}>{order.discountCode}</td>
              <td style={{ padding: '8px', border: '1px solid #eee', textAlign: 'center' }}>
                <button style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 18, marginRight: 8, cursor: 'pointer' }} title="Xem"
                  onClick={() => {
                    setSelectedOrder(order);
                    setOrderModalMode('view');
                    setShowOrderModal(true);
                  }}><FaEye /></button>
                <button aria-label="Cập nhật email" style={{ background: 'none', border: 'none', color: '#f59e42', fontSize: 18, marginRight: 8, cursor: 'pointer' }} title="Cập nhật email"
                  onClick={() => handleOpenEmailModal(order)}>
                  <FaEdit />
                </button>
                <button aria-label="Đánh dấu SUCCESS" style={{ background: 'none', border: 'none', color: '#10b981', fontSize: 18, marginRight: 8, cursor: 'pointer' }} title="Đánh dấu SUCCESS"
                  onClick={() => handleUpdateToSuccess(order.orderId || order.id)}>
                  <FaCheckCircle />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
        <Pagination
          currentPage={orderPage + 1}
          totalPages={orderTotalPages}
          onPageChange={page => setOrderPage(page - 1)}
        />
      </div>
      {showOrderModal && selectedOrder && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 340, minHeight: 200, boxShadow: '0 2px 16px #0001', position: 'relative' }}>
            <button onClick={() => setShowOrderModal(false)} style={{ position: 'absolute', top: 10, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>×</button>
            {loadingOrder ? (
              <LoadingPlaceholder count={1} height={120} />
            ) : (
              <div>
                <h3>Thông tin đơn hàng</h3>
                <div><b>ID:</b> {selectedOrder.orderId}</div>
                <div><b>Tổng tiền:</b> {selectedOrder.totalAmount}</div>
                <div><b>Giảm giá:</b> {selectedOrder.discountAmount}</div>
                <div><b>Thành tiền:</b> {selectedOrder.finalAmount}</div>
                <div><b>Trạng thái:</b> {selectedOrder.status}</div>
                <div><b>Email:</b> {selectedOrder.email}</div>
                <div><b>SĐT:</b> {selectedOrder.phone}</div>
                <div><b>Mô tả:</b> {selectedOrder.description}</div>
                <div><b>Ngày tạo:</b> {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : ''}</div>
                <div><b>Mã giảm giá:</b> {selectedOrder.discountCode}</div>
                <div><b>Chi tiết đơn hàng:</b></div>
                <ul style={{ paddingLeft: 20 }}>
                  {(selectedOrder.items || []).map((item, idx) => (
                    <li key={idx}>
                      {item.courseName ? <b>{item.courseName}</b> : null} - SL: {item.quantity} - Giá mua: {item.totalPrice}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      {showEmailModal && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 400, boxShadow: '0 2px 16px #0001', position: 'relative' }}>
            <button onClick={() => setShowEmailModal(false)} style={{ position: 'absolute', top: 10, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>×</button>
            <h3 style={{ marginBottom: 16 }}>Cập nhật Email</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Email mới:</label>
              <input
                type="email"
                value={emailToUpdate}
                onChange={e => setEmailToUpdate(e.target.value)}
                placeholder="Nhập email mới"
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowEmailModal(false)}
                style={{ padding: '10px 20px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateEmail}
                disabled={loadingOrder}
                style={{ padding: '10px 20px', borderRadius: 6, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', opacity: loadingOrder ? 0.6 : 1 }}
              >
                {loadingOrder ? 'Đang cập nhật...' : 'Cập nhật'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
