import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Auth.css';
import userService from '../services/userService';
import { showToast } from '../utils/toast';
import Navbar from '../components/Navbar';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // no image upload in simplified register form

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email không được để trống';
    if (!formData.username) newErrors.username = 'Tên đăng nhập không được để trống';
    if (!formData.password) newErrors.password = 'Mật khẩu không được để trống';
    if (formData.password && formData.password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const apiData = {
          email: formData.email,
          username: formData.username,
          password: formData.password,
          vip: 'ENGLISH_48_NGAY'
        };
        const response = await userService.createUser(apiData);
        if (response.data.status && response.data.status !== 200) {
          showToast(response.data.message, 'error');
          setErrors({ general: response.data.message });
        } else if (response.data.error) {
          showToast(response.data.message, 'error');
          setErrors({ general: response.data.message });
        } else {
          showToast('Đăng ký thành công! Chào mừng bạn đến với Khóa Học Drive MH!', 'success');
          navigate('/login');
        }
      } catch (error) {
        if (error.response) {
          const { data } = error.response;
          showToast(data.message || 'Có lỗi xảy ra từ server.', 'error');
          setErrors({ general: data.message || 'Có lỗi xảy ra từ server.' });
        } else if (error.request) {
          showToast('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.', 'error');
          setErrors({ general: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.' });
        } else {
          showToast('Có lỗi xảy ra. Vui lòng thử lại.', 'error');
          setErrors({ general: 'Có lỗi xảy ra. Vui lòng thử lại.' });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div>
      <Navbar />
    <div className="auth-container">
      <div className="auth-wrapper">
        {/* Left Side - Image */}
        <div className="auth-image-section">
          <div className="auth-image">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
              alt="Students studying" 
            />
            <div className="image-overlay">
              <h2>Bắt đầu hành trình học tập</h2>
              <p>Tham gia cộng đồng học viên và phát triển bản thân</p>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            <div className="auth-header">
              <h2>Tạo tài khoản mới</h2>
              <div className="auth-tabs">
                <Link to="/login" className="auth-tab">
                  Đăng nhập
                </Link>
                <Link to="/register" className="auth-tab active">
                  Đăng ký
                </Link>
              </div>
            </div>

            <p className="auth-subtitle">
              Tạo tài khoản để truy cập vào hàng ngàn khóa học chất lượng cao
            </p>

            <form onSubmit={handleSubmit}>
              {/* General Error Message */}
              {errors.general && (
                <div style={{ marginBottom: 16 ,alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
                  <span style={{ color: 'red', fontWeight: 'bold' }}>{errors.general}</span>
                </div>
              )}

              

              <div className="form-group">
                <label htmlFor="email">Địa chỉ Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ email của bạn"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  required
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="username">Tên đăng nhập</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nhập tên đăng nhập của bạn"
                  className={`form-input ${errors.username ? 'error' : ''}`}
                  required
                />
                {errors.username && <span className="error-message">{errors.username}</span>}
              </div>

              

              <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu của bạn"
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              

              <button type="submit" className="auth-button" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Đang đăng ký...
                  </>
                ) : (
                  'Đăng ký'
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Đã có tài khoản?{' '}
                <Link to="/login" className="auth-link">
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
       </div>
  );
};

export default Register;
