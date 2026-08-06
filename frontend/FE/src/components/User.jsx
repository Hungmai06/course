
import React, { useEffect, useState } from 'react';
import userService from '../services/userService';
import { FaEye, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import Pagination from './Pagination';
import LoadingPlaceholder from './LoadingPlaceholder';
import { showToast } from '../utils/toast';

export default function User() {
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm, setUserForm] = useState({ email: '', username: '', password: '', confirmPassword: '', vip: '' });
  const [loadingUser, setLoadingUser] = useState(false);
  const [userErrors, setUserErrors] = useState({});
  const [responseData, setResponseData] = useState(null);
  const [userPage, setUserPage] = useState(0);
  const [userSize, setUserSize] = useState(8);
  const [userSearch, setUserSearch] = useState('');

  const generateRandomUsername = (length = 6) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i += 1) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  
  const refreshData = async () => {
    try {
   
      let initialRes;
      if (userSearch) {
        initialRes = await userService.searchUser({ credential: userSearch, page: 0, size: 1 });
      } else {
        initialRes = await userService.getAllUsers(0, 1);
      }
      
      let totalElements = 0;
      if (initialRes && initialRes.data && initialRes.data.data) {
        totalElements = initialRes.data.data.totalElements || 0;
      }
      
      
      if (totalElements > 0) {
        let res;
        if (userSearch) {
          res = await userService.searchUser({ credential: userSearch, page: 0, size: totalElements });
        } else {
          res = await userService.getAllUsers(0, totalElements);
        }
        
        let allData = [];
        if (res && res.data && res.data.data && res.data.data.content) {
          allData = res.data.data.content;
        }
        
        
        allData.sort((a, b) => (a.id || 0) - (b.id || 0));
        
      
        const totalPages = Math.ceil(allData.length / userSize);
        const startIndex = userPage * userSize;
        const endIndex = startIndex + userSize;
        const currentPageData = allData.slice(startIndex, endIndex);
        
        setResponseData({
          data: {
            content: currentPageData,
            totalPages: totalPages
          }
        });
      } else {
        setResponseData({
          data: {
            content: [],
            totalPages: 1
          }
        });
      }
    } catch (error) {
      setResponseData({
        data: {
          content: [],
          totalPages: 1
        }
      });
    }
  };

  useEffect(() => {
    refreshData();
  }, [userPage, userSize, userSearch]);

  useEffect(() => {
    if (showUserModal && modalMode === 'create' && !userForm.username) {
      const randomUsername = generateRandomUsername(6);
      setUserForm(f => ({ ...f, username: randomUsername, password: randomUsername, confirmPassword: randomUsername }));
    }
  }, [showUserModal, modalMode, userForm.username]);

  return (
    <div className="section-table-container">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
        padding: '16px 18px',
        borderRadius: 14,
        background: 'linear-gradient(135deg, #f7f9ff 0%, #eef3ff 100%)',
        border: '1px solid #e5e9ff'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, color: '#1f2a44' }}>Danh sách người dùng</h2>
          <p style={{ margin: '6px 0 0', color: '#5b6785', fontSize: 13 }}>Quản lý tài khoản theo email, username và gói VIP</p>
        </div>
        <button
          style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 18px rgba(99,102,241,0.25)' }}
          onClick={() => {
            const randomUsername = generateRandomUsername(6);
            setUserForm({ email: '', username: randomUsername, password: randomUsername, confirmPassword: randomUsername, vip: '' });
            setUserErrors({});
            setModalMode('create');
            setShowUserModal(true);
          }}
        >
          <FaPlus /> Tạo mới
        </button>
      </div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
        <input
          type="text"
          placeholder="Tìm kiếm theo email hoặc username..."
          value={userSearch}
          onChange={e => { setUserSearch(e.target.value); setUserPage(0); }}
          style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #d7def5', width: 320, outline: 'none', boxShadow: '0 2px 8px rgba(31,42,68,0.04)' }}
        />
      </div>
      <div style={{ border: '1px solid #e8ecfa', borderRadius: 14, overflow: 'hidden', background: '#fff', boxShadow: '0 8px 24px rgba(31,42,68,0.06)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead>
          <tr style={{ background: '#f6f8ff' }}>
            <th style={{ padding: '12px 10px', borderBottom: '1px solid #e8ecfa', color: '#31416f', fontWeight: 700 }}>ID</th>
            <th style={{ padding: '12px 10px', borderBottom: '1px solid #e8ecfa', color: '#31416f', fontWeight: 700 }}>Email</th>
            <th style={{ padding: '12px 10px', borderBottom: '1px solid #e8ecfa', color: '#31416f', fontWeight: 700 }}>UserName</th>
            <th style={{ padding: '12px 10px', borderBottom: '1px solid #e8ecfa', color: '#31416f', fontWeight: 700 }}>VIP</th>
            <th style={{ padding: '12px 10px', borderBottom: '1px solid #e8ecfa', color: '#31416f', fontWeight: 700, textAlign: 'center' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            const users = (responseData?.data?.content || []).slice();
            if (userPage === 0 && users.length > 0) {
              let minIdx = 0;
              for (let i = 1; i < users.length; ++i) {
                if ((users[i].id || 0) < (users[minIdx].id || 0)) minIdx = i;
              }
              if (minIdx !== 0) {
                const [minUser] = users.splice(minIdx, 1);
                users.unshift(minUser);
              }
            }
            return users.map((user, idx) => (
              <tr key={user.id || idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#fbfcff' }}>
                <td style={{ padding: '10px', borderBottom: '1px solid #f0f2fa', color: '#3b4566' }}>{user.id}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #f0f2fa', color: '#1f2a44' }}>{user.email}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #f0f2fa', color: '#1f2a44', fontWeight: 600 }}>{user.username}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #f0f2fa' }}>
                  {user.vip ? (
                    <span style={{ background: '#e8f7ee', color: '#166534', border: '1px solid #bbf7d0', borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 700 }}>
                      {user.vip}
                    </span>
                  ) : null}
                </td>
                <td style={{ padding: '10px', borderBottom: '1px solid #f0f2fa', textAlign: 'center' }}>
                  <button
                    style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 18, marginRight: 8, cursor: 'pointer' }}
                    title="Xem"
                    onClick={async () => {
                      setLoadingUser(true);
                      const res = await userService.getUserById(user.id);
                      setSelectedUser(res.data.data);
                      setModalMode('view');
                      setShowUserModal(true);
                      setLoadingUser(false);
                    }}
                  ><FaEye /></button>
                  <button
                    style={{ background: 'none', border: 'none', color: '#8b5cf6', fontSize: 18, marginRight: 8, cursor: 'pointer' }}
                    title="Sửa"
                    onClick={async () => {
                      setLoadingUser(true);
                      const res = await userService.getUserById(user.id);
                      setSelectedUser(res.data.data);
                      setUserForm({
                        email: res.data.data.email || '',
                        username: res.data.data.username || '',
                        vip: res.data.data.vip || '',
                        password: '',
                      });
                      setModalMode('edit');
                      setShowUserModal(true);
                      setLoadingUser(false);
                    }}
                  ><FaEdit /></button>
                  <button
                    style={{ background: 'none', border: 'none', color: '#dc3545', fontSize: 18, cursor: 'pointer' }}
                    title="Xóa"
                    onClick={async () => {
                      if (window.confirm('Bạn có chắc muốn xóa user này?')) {
                        await userService.deleteUser(user.id);
                        refreshData();
                      }
                    }}
                  ><FaTrash /></button>
                </td>
              </tr>
            ));
          })()}
        </tbody>
      </table>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
        <Pagination
          currentPage={userPage + 1}
          totalPages={responseData?.data?.totalPages || 1}
          onPageChange={page => setUserPage(page - 1)}
        />
      </div>
      {showUserModal && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 340, minHeight: 200, boxShadow: '0 2px 16px #0001', position: 'relative' }}>
            <button onClick={() => setShowUserModal(false)} style={{ position: 'absolute', top: 10, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>×</button>
            {loadingUser ? (
              <LoadingPlaceholder count={1} height={120} />
            ) : modalMode === 'view' && selectedUser ? (
              <div>
                <h3>Thông tin người dùng</h3>
                <div><b>ID:</b> {selectedUser.id}</div>
                <div><b>Email:</b> {selectedUser.email}</div>
                <div><b>Username:</b> {selectedUser.username}</div>
                {selectedUser.vip ? <div><b>Vip:</b> {selectedUser.vip}</div> : null}
              </div>
            ) : modalMode === 'edit' && selectedUser ? (
              <form onSubmit={async e => {
                e.preventDefault();
                if (!userForm.email) {
                  showToast('Vui lòng nhập Email!', 'warning');
                  return;
                }
                if (!userForm.username) {
                  showToast('Vui lòng nhập Username!', 'warning');
                  return;
                }
                const userData = {
                  email: userForm.email,
                  username: userForm.username,
                  vip: userForm.vip || null,
                  password: userForm.password || ''
                };
                await userService.updateUser(selectedUser.id, userData, true);
                setShowUserModal(false);
                // Refresh data với sắp xếp toàn bộ
                let res;
                if (userSearch) {
                  res = await userService.searchUser({ credential: userSearch, page: 0, size: 1000 });
                } else {
                  res = await userService.getAllUsers(0, 1000);
                }
                
                let allData = [];
                if (res && res.data && res.data.data && res.data.data.content) {
                  allData = res.data.data.content;
                }
                
                // Sắp xếp toàn bộ dữ liệu theo ID tăng dần
                allData.sort((a, b) => (a.id || 0) - (b.id || 0));
                
                // Tính toán phân trang từ dữ liệu đã sắp xếp
                const totalPages = Math.ceil(allData.length / userSize);
                const startIndex = userPage * userSize;
                const endIndex = startIndex + userSize;
                const currentPageData = allData.slice(startIndex, endIndex);
                
                setResponseData({
                  data: {
                    content: currentPageData,
                    totalPages: totalPages
                  }
                });
              }}>
                <h3>Cập nhật người dùng</h3>
                <div style={{ marginBottom: 12 }}>
                  <label>Username:</label>
                  <input value={userForm.username} onChange={e => setUserForm(f => ({ ...f, username: e.target.value }))} style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label>Email:</label>
                  <input value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label>Mật khẩu mới (Bỏ trống nếu không đổi):</label>
                  <input type="password" value={userForm.password || ''} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))} placeholder="Nhập mật khẩu mới..." style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label>Vip:</label>
                  <select value={userForm.vip || ''} onChange={e => setUserForm(f => ({ ...f, vip: e.target.value || '' }))} style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc' }}>
                    <option value="">-- Không có VIP --</option>
                    <option value="ENGLISH_48_NGAY">ENGLISH_48_NGAY</option>
                  </select>
                </div>
                <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer' }}>Lưu</button>
              </form>
            ) : modalMode === 'create' ? (
              <form onSubmit={async e => {
                e.preventDefault();
                const newErrors = {};
                if (!userForm.email) newErrors.email = 'Email không được để trống';
                if (!userForm.username) newErrors.username = 'Tên đăng nhập không được để trống';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (userForm.email && !emailRegex.test(userForm.email)) newErrors.email = 'Email không hợp lệ';
                const finalUsername = (userForm.username || '').trim() || generateRandomUsername(6);
                const finalPassword = finalUsername;
                setUserErrors(newErrors);
                if (Object.keys(newErrors).length > 0) return;
                const apiData = {
                  email: userForm.email,
                  username: finalUsername,
                  password: finalPassword,
                  vip: userForm.vip || null
                };
                await userService.createUser(apiData);
                setShowUserModal(false);
                // Refresh data với sắp xếp toàn bộ
                let res;
                if (userSearch) {
                  res = await userService.searchUser({ credential: userSearch, page: 0, size: 1000 });
                } else {
                  res = await userService.getAllUsers(0, 1000);
                }
                
                let allData = [];
                if (res && res.data && res.data.data && res.data.data.content) {
                  allData = res.data.data.content;
                }
                
                // Sắp xếp toàn bộ dữ liệu theo ID tăng dần
                allData.sort((a, b) => (a.id || 0) - (b.id || 0));
                
                // Tính toán phân trang từ dữ liệu đã sắp xếp
                const totalPages = Math.ceil(allData.length / userSize);
                const startIndex = userPage * userSize;
                const endIndex = startIndex + userSize;
                const currentPageData = allData.slice(startIndex, endIndex);
                
                setResponseData({
                  data: {
                    content: currentPageData,
                    totalPages: totalPages
                  }
                });
              }} style={{ maxWidth: 540, background: '#f8fafd', borderRadius: 12, padding: 24, boxShadow: '0 2px 16px #0002', margin: '0 auto' }}>
                <h2 style={{ textAlign: 'center', marginBottom: 24, color: '#6366f1', fontWeight: 700 }}>Tạo người dùng mới</h2>
                <div style={{ display: 'flex', gap: 24 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontWeight: 500 }}>Email</label>
                      <input value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', marginTop: 4 }} />
                      {userErrors.email && <div style={{ color: 'red', fontSize: 13 }}>{userErrors.email}</div>}
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontWeight: 500 }}>Tên đăng nhập</label>
                      <input value={userForm.username} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', marginTop: 4, background: '#f9fafb' }} />
                      {userErrors.username && <div style={{ color: 'red', fontSize: 13 }}>{userErrors.username}</div>}
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontWeight: 500 }}>Mật khẩu (trùng Username)</label>
                      <input type="text" value={userForm.password} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', marginTop: 4, background: '#f9fafb' }} />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontWeight: 500 }}>Xác nhận mật khẩu (trùng Username)</label>
                      <input type="text" value={userForm.confirmPassword} readOnly style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', marginTop: 4, background: '#f9fafb' }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontWeight: 500 }}>Vip</label>
                      <select value={userForm.vip || ''} onChange={e => setUserForm(f => ({ ...f, vip: e.target.value || '' }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', marginTop: 4 }}>
                        <option value="">-- Không có VIP --</option>
                        <option value="ENGLISH_48_NGAY">ENGLISH_48_NGAY</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button type="submit" style={{ marginTop: 24, width: '100%', background: 'linear-gradient(90deg,#6366f1,#7c3aed)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 700, fontSize: 17, letterSpacing: 1, boxShadow: '0 2px 8px #6366f13a', cursor: 'pointer', transition: 'background 0.2s' }}>Tạo mới</button>
              </form>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
