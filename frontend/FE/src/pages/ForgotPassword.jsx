import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import Navbar from '../components/Navbar';
import '../pages/Auth.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Nhập username, 2: Nhập mật khẩu email gửi về và mật khẩu mới
  const [formData, setFormData] = useState({
    username: '',
    newPassword: '', // mật khẩu email gửi về
    passwordReset: '', // mật khẩu mới muốn đặt
    confirmPasswordReset: '' // xác nhận mật khẩu mới
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Gửi yêu cầu gửi mật khẩu mới về email
  const handleSendNewPassword = async (e) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      setError('Vui lòng nhập username');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await authService.sendOtp(formData.username);
      if (response.data && response.data.error) {
        throw new Error(response.data.message || response.data.error);
      }
      setMessage('Mật khẩu mới đã được gửi về email của bạn. Vui lòng kiểm tra email!');
      setStep(2);
    } catch (error) {
      let errorMessage = '';
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || error.response.data.error || 'Có lỗi xảy ra khi gửi mật khẩu.';
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Có lỗi xảy ra khi gửi mật khẩu. Vui lòng thử lại.';
      }
      if (errorMessage.toLowerCase().includes('user không tồn tại') ||
          errorMessage.toLowerCase().includes('user not found') ||
          errorMessage.toLowerCase().includes('không tìm thấy') ||
          errorMessage.toLowerCase().includes('not found')) {
        setError('Username không tồn tại trong hệ thống. Vui lòng kiểm tra lại username.');
        setFormData(prev => ({ ...prev, username: '' }));
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

 
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!formData.newPassword.trim()) {
      setError('Vui lòng nhập mật khẩu đã nhận qua email');
      return;
    }
    if (!formData.passwordReset.trim()) {
      setError('Vui lòng nhập mật khẩu mới muốn đặt');
      return;
    }
    if (formData.passwordReset !== formData.confirmPasswordReset) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (formData.passwordReset.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const resetData = {
        username: formData.username,
        newPassword: formData.newPassword, // mật khẩu email gửi về
        passwordReset: formData.passwordReset // mật khẩu mới muốn đặt
      };
      const response = await authService.resetPassword(resetData);
      if (response.data && response.data.data) {
        const responseData = response.data.data;
        if (typeof responseData === 'string' && responseData.toLowerCase().includes('thông tin không hợp lệ')) {
          setError('Mật khẩu email không hợp lệ. Vui lòng kiểm tra lại mật khẩu đã nhận qua email.');
          setFormData(prev => ({ ...prev, newPassword: '' }));
          return;
        }
      }
      setMessage('Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...');
      setFormData({
        username: '',
        newPassword: '',
        passwordReset: '',
        confirmPasswordReset: ''
      });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      let errorMessage = '';
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || error.response.data.data || error.response.data.error || 'Có lỗi xảy ra khi đặt lại mật khẩu.';
      } else {
        errorMessage = 'Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.';
      }
      if (errorMessage.toLowerCase().includes('thông tin không hợp lệ') ||
          errorMessage.toLowerCase().includes('invalid') ||
          errorMessage.toLowerCase().includes('mật khẩu không hợp lệ') ||
          errorMessage.toLowerCase().includes('invalid password')) {
        setError('Mật khẩu email không hợp lệ. Vui lòng kiểm tra lại mật khẩu đã nhận qua email.');
        setFormData(prev => ({ ...prev, newPassword: '' }));
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Gửi lại mật khẩu mới về email
  const handleResendNewPassword = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await authService.sendOtp(formData.username);
      setMessage('Mật khẩu mới đã được gửi lại! Hãy kiểm tra email của bạn.');
      setFormData(prev => ({ ...prev, newPassword: '' }));
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Có lỗi xảy ra khi gửi lại mật khẩu. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Quay lại bước 1
  const handleBackToStep1 = () => {
    setStep(1);
    setFormData(prev => ({
      ...prev,
      newPassword: '',
      passwordReset: '',
      confirmPasswordReset: ''
    }));
    setError('');
    setMessage('');
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
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Password recovery" 
              />
              <div className="image-overlay">
                <h2>Khôi phục mật khẩu</h2>
                <p>Lấy lại quyền truy cập vào tài khoản của bạn</p>
              </div>
            </div>
          </div>

          {/* Right Side - Forgot Password Form */}
          <div className="auth-form-section">
            <div className="auth-form-container">
              <div className="auth-header">
                <h2>🔐 Quên Mật Khẩu</h2>
                <p className="auth-subtitle">
                  {step === 1 
                    ? 'Nhập username của bạn để nhận mật khẩu mới qua email'
                    : 'Nhập mật khẩu đã nhận qua email và mật khẩu mới muốn đặt'
                  }
                </p>
              </div>

              {/* Hiển thị thông báo */}
              {message && (
                <div style={{
                  backgroundColor: '#d4edda',
                  color: '#155724',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  marginBottom: '15px',
                  border: '1px solid #c3e6cb',
                  fontSize: '14px',
                  textAlign: 'center'
                }}>
                  ✅ {message}
                </div>
              )}

              {/* Hiển thị lỗi */}
              {error && (
                <div style={{
                  backgroundColor: '#f8d7da',
                  color: '#721c24',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  marginBottom: '15px',
                  border: '1px solid #f5c6cb',
                  fontSize: '14px',
                  textAlign: 'center'
                }}>
                  ❌ {error}
                </div>
              )}

              {/* Bước 1: Nhập username */}
              {step === 1 && (
                <form onSubmit={handleSendNewPassword} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="username">Username </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Nhập username của bạn"
                      className="form-input"
                      required
                      disabled={loading}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="auth-button"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="loading-spinner"></span>
                        Đang gửi...
                      </>
                    ) : (
                      '📧 Gửi mật khẩu mới'
                    )}
                  </button>
                </form>
              )}

              {/* Bước 2: Nhập mật khẩu email gửi về và mật khẩu mới muốn đặt */}
              {step === 2 && (
                <form onSubmit={handleResetPassword} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="username-display">Username</label>
                    <input
                      type="text"
                      id="username-display"
                      value={formData.username}
                      className="form-input"
                      disabled
                      style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="newPassword">Mật khẩu đã nhận qua email</label>
                    <input
                      type="text"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Nhập mật khẩu đã nhận qua email"
                      className="form-input"
                      required
                      disabled={loading}
                    />
                    <div style={{ marginTop: '8px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={handleResendNewPassword}
                        disabled={loading}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#10b981',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          textDecoration: 'underline'
                        }}
                      >
                        {loading ? 'Đang gửi...' : '🔄 Gửi lại mật khẩu'}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="passwordReset">Mật khẩu mới muốn đặt</label>
                    <input
                      type="password"
                      id="passwordReset"
                      name="passwordReset"
                      value={formData.passwordReset}
                      onChange={handleInputChange}
                      placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                      className="form-input"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirmPasswordReset">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      id="confirmPasswordReset"
                      name="confirmPasswordReset"
                      value={formData.confirmPasswordReset}
                      onChange={handleInputChange}
                      placeholder="Nhập lại mật khẩu mới"
                      className="form-input"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      type="button"
                      onClick={handleBackToStep1}
                      disabled={loading}
                      className="auth-button"
                      style={{
                        flex: 1,
                        backgroundColor: loading ? '#ccc' : '#6c757d'
                      }}
                    >
                      ⬅️ Quay lại
                    </button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="auth-button"
                      style={{ flex: 2 }}
                    >
                      {loading ? (
                        <>
                          <span className="loading-spinner"></span>
                          Đang xử lý...
                        </>
                      ) : (
                        '✅ Xác nhận'
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Link quay lại đăng nhập */}
              <div className="auth-footer">
                <p>
                  Nhớ mật khẩu? {' '}
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

export default ForgotPassword;
