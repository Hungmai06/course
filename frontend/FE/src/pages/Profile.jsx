import React, { useEffect, useState } from 'react';
import userService from '../services/userService';
import Navbar from '../components/Navbar';
import LoadingPlaceholder from '../components/LoadingPlaceholder';
import '../pages/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
      const userId = userInfo?.id;
      if (!userId) {
        setError('Không tìm thấy thông tin người dùng.');
        setLoading(false);
        return;
      }
      const res = await userService.getUserById(userId);
      setUser(res.data.data);
      setFormData(res.data.data);
    } catch (err) {
      setError('Không thể tải thông tin người dùng.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUser();
  }, []);

  const handleEdit = () => {
    setEditMode(true);
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const handleCancel = () => {
    setEditMode(false);
    setUpdateError(null);
    setUpdateSuccess(false);
    setFormData(user);
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setAvatarFile(files[0]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(false);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
      const userId = userInfo?.id;
      
      const data = {
        email: formData.email,
        username: formData.username,
        password: formData.password || ''
      };
      
      await userService.updateUser(userId, data);
      setEditMode(false);
      setUpdateSuccess(true);
      fetchUser();
    } catch (err) {
      setUpdateError('Cập nhật thông tin thất bại.');
    } finally {
      setUpdateLoading(false);
    }
  };
  return (
    <>
      <Navbar />
      <div className="profile-page-bg">
        <div className="profile-container">
          <h2>Thông tin cá nhân</h2>
          {loading ? (
            <LoadingPlaceholder count={1} height={160} />
          ) : error ? (
            <div className="profile-error">{error}</div>
          ) : !user ? (
            <div className="profile-empty">Không có dữ liệu người dùng.</div>
          ) : (
            <>
              {updateSuccess && (
                <div className="profile-success">Cập nhật thành công!</div>
              )}
              {updateError && (
                <div className="profile-error">{updateError}</div>
              )}
              {!editMode ? (
                <>
                  <div className="profile-info-box">
                    <p><b>ID:</b> {user.id}</p>
                    <p><b>Username:</b> {user.username}</p>
                    <p><b>Email:</b> {user.email}</p>
                    <p><b>Hạng:</b> {user.vip}</p>
                  </div>
                  <button className="profile-edit-btn" onClick={handleEdit}>Cập nhật thông tin</button>
                </>
              ) : (
                <form className="profile-edit-form" onSubmit={handleSubmit} encType="multipart/form-data">
                  <div className="profile-info-box">
                    <label><b>Username:</b>
                      <input type="text" name="username" value={formData.username || ''} onChange={handleChange} required />
                    </label>
                    <label><b>Email:</b>
                      <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required />
                    </label>
                    <label><b>Mật khẩu mới (Để trống nếu không đổi):</b>
                      <input type="password" name="password" value={formData.password || ''} onChange={handleChange} placeholder="Nhập mật khẩu mới..." />
                    </label>
                  </div>
                  <div className="profile-edit-actions">
                    <button type="submit" disabled={updateLoading}>{updateLoading ? 'Đang cập nhật...' : 'Lưu thay đổi'}</button>
                    <button type="button" onClick={handleCancel}>Hủy</button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
