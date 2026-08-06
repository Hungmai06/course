import React, { useEffect, useState } from 'react';
import billService from '../services/billService';
import Pagination from './Pagination';
import LoadingPlaceholder from './LoadingPlaceholder';

export default function Bill() {
  const [bills, setBills] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounce(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);

        if (searchDebounce && searchDebounce.trim()) {
          // fetch a large result set and filter client-side by description
          const res = await billService.getAll(0, 1000);
          const all = (res.data && res.data.data && res.data.data.content) || res.data && res.data.data || res.data || [];
          const filtered = all.filter((b) => (b.description || '').toLowerCase().includes(searchDebounce.toLowerCase()));
          const pages = Math.max(1, Math.ceil(filtered.length / size));
          const slice = filtered.slice(page * size, page * size + size);
          setBills(slice);
          setTotalPages(pages);
        } else {
          const res = await billService.getAll(page, size);
          const content = (res.data && res.data.data && res.data.data.content) || [];
          const pages = (res.data && res.data.data && res.data.data.totalPages) || 1;
          setBills(content);
          setTotalPages(pages);
        }
      } catch (err) {
        setBills([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [page, size, searchDebounce]);

  return (
    <div className="section-table-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Danh sách bill</h2>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Tìm kiếm theo mô tả..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          style={{ padding: '8px', borderRadius: 6, border: '1px solid #ddd', width: 320 }}
        />
        {loading && <span style={{ color: '#666', fontSize: '14px' }}>Đang tải...</span>}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: '#f0f4ff' }}>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>ID</th>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>Mã</th>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>Tổng tiền</th>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>Mô tả</th>
            <th style={{ padding: '8px', border: '1px solid #eee' }}>Ngày tạo</th>
            <th style={{ padding: '8px', border: '1px solid #eee', textAlign: 'center' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6}><LoadingPlaceholder count={3} height={48} /></td></tr>
          ) : (
            bills.map((b, idx) => (
              <tr key={b.id || b.billId || idx}>
                <td style={{ padding: '8px', border: '1px solid #eee' }}>{b.id ?? b.billId}</td>
                <td style={{ padding: '8px', border: '1px solid #eee' }}>{b.code || ''}</td>
                <td style={{ padding: '8px', border: '1px solid #eee' }}>{typeof b.amount !== 'undefined' ? Number(b.amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : ''}</td>
                <td style={{ padding: '8px', border: '1px solid #eee' }}>{b.description}</td>
                <td style={{ padding: '8px', border: '1px solid #eee' }}>{b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}</td>
                <td style={{ padding: '8px', border: '1px solid #eee', textAlign: 'center' }}>
                  <button
                    style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 14, cursor: 'pointer' }}
                    onClick={() => { setSelectedBill(b); setShowModal(true); }}
                  >Xem</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
        <Pagination currentPage={page + 1} totalPages={totalPages} onPageChange={(p) => setPage(p - 1)} />
      </div>

      {showModal && selectedBill && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 24, minWidth: 360, boxShadow: '0 2px 16px #0001', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>×</button>
            <h3>Chi tiết bill</h3>
            <div><b>ID:</b> {selectedBill.id ?? selectedBill.billId}</div>
            <div><b>Tổng tiền:</b> {typeof selectedBill.amount !== 'undefined' ? Number(selectedBill.amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : ''}</div>
            <div><b>Mô tả:</b> {selectedBill.description}</div>
            <div><b>Ngày tạo:</b> {selectedBill.createdAt ? new Date(selectedBill.createdAt).toLocaleString() : ''}</div>
            <div style={{ marginTop: 12 }}>
              <b>Chi tiết:</b>
              <ul style={{ paddingLeft: 20 }}>
                {(selectedBill.items || []).map((it, i) => (
                  <li key={i}>{it.name || it.courseName || it.title} - SL: {it.quantity} - Giá: {it.price || it.totalPrice}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
