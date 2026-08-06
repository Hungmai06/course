import React, { useEffect, useState } from 'react';
import couponService from '../services/couponService';
import { FaEye, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import Pagination from './Pagination';
import LoadingPlaceholder from './LoadingPlaceholder';

export default function Coupon() {
  const toInputDate = (val) => {
    if (!val && val !== 0) return '';
    try {
      // If already a string in the expected format, keep first 16 chars
      if (typeof val === 'string') {
        if (val.length >= 16 && /T/.test(val)) return val.slice(0, 16);
        // try parseable string -> Date
      }
      const d = new Date(val);
      if (isNaN(d.getTime())) return '';
      const pad = (n) => String(n).padStart(2, '0');
      const YYYY = d.getFullYear();
      const MM = pad(d.getMonth() + 1);
      const DD = pad(d.getDate());
      const hh = pad(d.getHours());
      const mm = pad(d.getMinutes());
      return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
    } catch (e) {
      return '';
    }
  };
  const [couponModalMode, setCouponModalMode] = useState('view');
  const [couponList, setCouponList] = useState([]);
  const [couponPage, setCouponPage] = useState(0);
  const [couponSize, setCouponSize] = useState(8);
  const [couponTotalPages, setCouponTotalPages] = useState(1);
  const [couponSearch, setCouponSearch] = useState('');
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountPercent: '',
    minimumOrder: '',
    expiredDate: '',
    startDate: '',
    active: true,
  });
  const [couponErrors, setCouponErrors] = useState({});
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        let res = await couponService.getAll();
        let allData = res.data.data || res.data;
        
       
        if (couponSearch) {
          allData = allData.filter(c => c.code.toLowerCase().includes(couponSearch.toLowerCase()));
        }
        
        
        allData.sort((a, b) => (a.id || 0) - (b.id || 0));
        
       
        const totalPages = Math.ceil(allData.length / couponSize);
        const startIndex = couponPage * couponSize;
        const endIndex = startIndex + couponSize;
        const currentPageData = allData.slice(startIndex, endIndex);
        
        setCouponList(currentPageData);
        setCouponTotalPages(totalPages);
      } catch (err) {
        setCouponList([]);
        setCouponTotalPages(1);
      }
    };
    fetchCoupon();
  }, [couponPage, couponSize, couponSearch]);

  const handleCreateCoupon = async e => {
    e.preventDefault();
    const errs = {};
    if (!couponForm.code) errs.code = 'Code không được để trống';
    if (!couponForm.discountPercent) errs.discountPercent = 'Discount % không được để trống';
    if (!couponForm.minimumOrder) errs.minimumOrder = 'Minimum order không được để trống';
    if (!couponForm.startDate) errs.startDate = 'Start date không được để trống';
    if (!couponForm.expiredDate) errs.expiredDate = 'Expired date không được để trống';
    setCouponErrors(errs);
    if (Object.keys(errs).length > 0) return;
    await couponService.create({
      code: couponForm.code,
      discountPercent: couponForm.discountPercent,
      minimumOrder: couponForm.minimumOrder,
      startDate: couponForm.startDate ? new Date(couponForm.startDate).toISOString() : null,
      expiredDate: couponForm.expiredDate ? new Date(couponForm.expiredDate).toISOString() : null,
      active: couponForm.active === true || couponForm.active === 'true',
    });
    setShowCouponModal(false);
    setCouponForm({ code: '', discountPercent: '', minimumOrder: '', expiredDate: '', startDate: '', active: true });
    setCouponErrors({});
    setCouponPage(0);
    
    
    const res = await couponService.getAll();
    let allData = res.data.data || res.data;
    allData.sort((a, b) => (a.id || 0) - (b.id || 0));
    const totalPages = Math.ceil(allData.length / couponSize);
    const currentPageData = allData.slice(0, couponSize);
    setCouponList(currentPageData);
    setCouponTotalPages(totalPages);
  };
  const handleEditCoupon = async e => {
    e.preventDefault();
    const errs = {};
    if (!couponForm.code) errs.code = 'Code không được để trống';
    if (!couponForm.discountPercent) errs.discountPercent = 'Discount % không được để trống';
    if (!couponForm.minimumOrder) errs.minimumOrder = 'Minimum order không được để trống';
    if (!couponForm.startDate) errs.startDate = 'Start date không được để trống';
    if (!couponForm.expiredDate) errs.expiredDate = 'Expired date không được để trống';
    setCouponErrors(errs);
    if (Object.keys(errs).length > 0) return;
    await couponService.update(selectedCoupon.id, {
      code: couponForm.code,
      discountPercent: couponForm.discountPercent,
      minimumOrder: couponForm.minimumOrder,
      startDate: couponForm.startDate ? new Date(couponForm.startDate).toISOString() : null,
      expiredDate: couponForm.expiredDate ? new Date(couponForm.expiredDate).toISOString() : null,
      active: couponForm.active === true || couponForm.active === 'true',
    });
    setShowCouponModal(false);
    setCouponForm({ code: '', discountPercent: '', minimumOrder: '', expiredDate: '', startDate: '', active: true });
    setCouponErrors({});
    
    
    const res = await couponService.getAll();
    let allData = res.data.data || res.data;
    allData.sort((a, b) => (a.id || 0) - (b.id || 0));
    const totalPages = Math.ceil(allData.length / couponSize);
    const startIndex = couponPage * couponSize;
    const endIndex = startIndex + couponSize;
    const currentPageData = allData.slice(startIndex, endIndex);
    setCouponList(currentPageData);
    setCouponTotalPages(totalPages);
  };
  const handleDeleteCoupon = async id => {
    if (!window.confirm('Bạn có chắc muốn xóa mã giảm giá này?')) return;
    await couponService.remove(id);
    
    
    const res = await couponService.getAll();
    let allData = res.data.data || res.data;
    allData.sort((a, b) => (a.id || 0) - (b.id || 0));
    const totalPages = Math.ceil(allData.length / couponSize);
    const startIndex = couponPage * couponSize;
    const endIndex = startIndex + couponSize;
    const currentPageData = allData.slice(startIndex, endIndex);
    setCouponList(currentPageData);
    setCouponTotalPages(totalPages);
  };

  return (
    <div className="section-table-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Danh sách mã giảm giá</h2>
        <button
          style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          type="button"
          onClick={() => {
            setCouponForm({ code: '', discountPercent: '', minimumOrder: '', expiredDate: '', startDate: '' });
            setCouponErrors({});
            setCouponModalMode('create');
            setShowCouponModal(true);
          }}
        >
          <FaPlus /> Tạo mới
        </button>
      </div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
        <input
          type="text"
          placeholder="Tìm kiếm mã giảm giá..."
          value={couponSearch}
          onChange={e => { setCouponSearch(e.target.value); setCouponPage(0); }}
          style={{ padding: '8px', borderRadius: 6, border: '1px solid #ddd', width: 240 }}
        />
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: '#f0f4ff' }}>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>ID</th>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>Code</th>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>% Giảm</th>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>Đơn tối thiểu</th>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>Ngày bắt đầu</th>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>Ngày hết hạn</th>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>Trạng thái</th>
            <th style={{ padding: '8px', border: '1px solid #eee', textAlign: 'center' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {couponList.map((coupon, idx) => (
            <tr key={coupon.id || idx}>
              <td style={{ padding: '8px', border: '1px solid #eee' }}>{coupon.id}</td>
              <td style={{ padding: '8px', border: '1px solid #eee' }}>{coupon.code}</td>
              <td style={{ padding: '8px', border: '1px solid #eee' }}>{coupon.discountPercent}</td>
              <td style={{ padding: '8px', border: '1px solid #eee' }}>{coupon.minimumOrder}</td>
              <td style={{ padding: '8px', border: '1px solid #eee' }}>{coupon.startDate ? new Date(coupon.startDate).toLocaleString() : ''}</td>
              <td style={{ padding: '8px', border: '1px solid #eee' }}>{coupon.expiredDate ? new Date(coupon.expiredDate).toLocaleString() : ''}</td>
              <td style={{ padding: '8px', border: '1px solid #eee' }}>
                {coupon.active ? <span style={{color: 'green', fontWeight: 'bold'}}>Đang hoạt động</span> : <span style={{color: 'red'}}>Ngừng</span>}
              </td>
              <td style={{ padding: '8px', border: '1px solid #eee', textAlign: 'center' }}>
                <button type="button" style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 18, marginRight: 8, cursor: 'pointer' }} title="Xem"
                  onClick={() => {
                    setSelectedCoupon(coupon);
                    setCouponForm({
                      code: coupon.code,
                      discountPercent: coupon.discountPercent,
                      minimumOrder: coupon.minimumOrder,
                      startDate: toInputDate(coupon.startDate),
                      expiredDate: toInputDate(coupon.expiredDate),
                    });
                    setCouponModalMode('view');
                    setShowCouponModal(true);
                  }}><FaEye /></button>
                <button type="button" style={{ background: 'none', border: 'none', color: '#8b5cf6', fontSize: 18, marginRight: 8, cursor: 'pointer' }} title="Sửa"
                  onClick={() => {
                    setSelectedCoupon(coupon);
                    setCouponForm({
                      code: coupon.code,
                      discountPercent: coupon.discountPercent,
                      minimumOrder: coupon.minimumOrder,
                      startDate: toInputDate(coupon.startDate),
                      expiredDate: toInputDate(coupon.expiredDate),
                    });
                    setCouponModalMode('edit');
                    setShowCouponModal(true);
                  }}><FaEdit /></button>
                <button type="button" style={{ background: 'none', border: 'none', color: '#dc3545', fontSize: 18, cursor: 'pointer' }} title="Xóa"
                  onClick={() => handleDeleteCoupon(coupon.id)}><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
        <Pagination
          currentPage={couponPage + 1}
          totalPages={couponTotalPages}
          onPageChange={page => setCouponPage(page - 1)}
        />
      </div>
      {showCouponModal && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 340, minHeight: 200, boxShadow: '0 2px 16px #0001', position: 'relative' }}>
            <button onClick={() => setShowCouponModal(false)} style={{ position: 'absolute', top: 10, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>×</button>
            {loadingCoupon ? (
              <LoadingPlaceholder count={1} height={120} />
            ) : couponModalMode === 'view' && selectedCoupon ? (
              <div>
                <h3>Thông tin mã giảm giá</h3>
                <div><b>ID:</b> {selectedCoupon.id}</div>
                <div><b>Code:</b> {selectedCoupon.code}</div>
                <div><b>% Giảm:</b> {selectedCoupon.discountPercent}</div>
                <div><b>Đơn tối thiểu:</b> {selectedCoupon.minimumOrder}</div>
                <div><b>Ngày bắt đầu:</b> {selectedCoupon.startDate ? new Date(selectedCoupon.startDate).toLocaleString() : ''}</div>
                <div><b>Ngày hết hạn:</b> {selectedCoupon.expiredDate ? new Date(selectedCoupon.expiredDate).toLocaleString() : ''}</div>
              </div>
            ) : couponModalMode === 'edit' && selectedCoupon ? (
              <form onSubmit={handleEditCoupon} style={{ minWidth: 320 }}>
                <div style={{ marginBottom: 16 }}>
                  <label>Trạng thái:</label>
                  <select value={couponForm.active ? 'true' : 'false'} onChange={e => setCouponForm(f => ({ ...f, active: e.target.value === 'true' }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}>
                    <option value="true">Đang hoạt động</option>
                    <option value="false">Ngừng</option>
                  </select>
                </div>
                <h3>Cập nhật mã giảm giá</h3>
                <div style={{ marginBottom: 16 }}>
                  <label>Code:</label>
                  <input value={couponForm.code} onChange={e => setCouponForm(f => ({ ...f, code: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                  {couponErrors.code && <div style={{ color: 'red', fontSize: 13 }}>{couponErrors.code}</div>}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label>% Giảm:</label>
                  <input type="number" value={couponForm.discountPercent} onChange={e => setCouponForm(f => ({ ...f, discountPercent: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                  {couponErrors.discountPercent && <div style={{ color: 'red', fontSize: 13 }}>{couponErrors.discountPercent}</div>}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label>Đơn tối thiểu:</label>
                  <input type="number" value={couponForm.minimumOrder} onChange={e => setCouponForm(f => ({ ...f, minimumOrder: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                  {couponErrors.minimumOrder && <div style={{ color: 'red', fontSize: 13 }}>{couponErrors.minimumOrder}</div>}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label>Ngày bắt đầu:</label>
                  <input type="datetime-local" value={couponForm.startDate} onChange={e => setCouponForm(f => ({ ...f, startDate: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                  {couponErrors.startDate && <div style={{ color: 'red', fontSize: 13 }}>{couponErrors.startDate}</div>}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label>Ngày hết hạn:</label>
                  <input type="datetime-local" value={couponForm.expiredDate} onChange={e => setCouponForm(f => ({ ...f, expiredDate: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                  {couponErrors.expiredDate && <div style={{ color: 'red', fontSize: 13 }}>{couponErrors.expiredDate}</div>}
                </div>
                <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer' }}>Lưu</button>
              </form>
            ) : couponModalMode === 'create' ? (
              <form onSubmit={handleCreateCoupon} style={{ minWidth: 320 }}>
                <div style={{ marginBottom: 16 }}>
                  <label>Trạng thái:</label>
                  <select value={couponForm.active ? 'true' : 'false'} onChange={e => setCouponForm(f => ({ ...f, active: e.target.value === 'true' }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}>
                    <option value="true">Đang hoạt động</option>
                    <option value="false">Ngừng</option>
                  </select>
                </div>
                <h3>Tạo mã giảm giá mới</h3>
                <div style={{ marginBottom: 16 }}>
                  <label>Code:</label>
                  <input value={couponForm.code} onChange={e => setCouponForm(f => ({ ...f, code: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                  {couponErrors.code && <div style={{ color: 'red', fontSize: 13 }}>{couponErrors.code}</div>}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label>% Giảm:</label>
                  <input type="number" value={couponForm.discountPercent} onChange={e => setCouponForm(f => ({ ...f, discountPercent: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                  {couponErrors.discountPercent && <div style={{ color: 'red', fontSize: 13 }}>{couponErrors.discountPercent}</div>}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label>Đơn tối thiểu:</label>
                  <input type="number" value={couponForm.minimumOrder} onChange={e => setCouponForm(f => ({ ...f, minimumOrder: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                  {couponErrors.minimumOrder && <div style={{ color: 'red', fontSize: 13 }}>{couponErrors.minimumOrder}</div>}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label>Ngày bắt đầu:</label>
                  <input type="datetime-local" value={couponForm.startDate} onChange={e => setCouponForm(f => ({ ...f, startDate: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                  {couponErrors.startDate && <div style={{ color: 'red', fontSize: 13 }}>{couponErrors.startDate}</div>}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label>Ngày hết hạn:</label>
                  <input type="datetime-local" value={couponForm.expiredDate} onChange={e => setCouponForm(f => ({ ...f, expiredDate: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                  {couponErrors.expiredDate && <div style={{ color: 'red', fontSize: 13 }}>{couponErrors.expiredDate}</div>}
                </div>
                <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer' }}>Tạo mới</button>
              </form>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
