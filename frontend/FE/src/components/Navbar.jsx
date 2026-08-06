import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaChevronDown,
  FaHome,
  FaBook,
} from "react-icons/fa";
import logoImg from "../assets/logo.png";
import "./Navbar.css";
import { showToast } from "../utils/toast";
import { categoryService } from "../services/categoryService";
import LoadingPlaceholder from './LoadingPlaceholder';
import cartService from "../services/cartService";
import LogoutButton from "./LogoutButton";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navigate = useNavigate();

  // Close mobile menu on resize
  useEffect(() => {
    const closeMenu = () => setShowMobileMenu(false);
    window.addEventListener("resize", closeMenu);
    return () => window.removeEventListener("resize", closeMenu);
  }, []);

  const location = useLocation();
  const isCategoryActive =
    location.pathname === "/courses/category" ||
    (location.search && location.search.includes("category="));

  useEffect(() => {
    const checkAuth = () => {
      const accessToken = localStorage.getItem("accessToken");
      const userData = localStorage.getItem("userInfo");
      const roleName = localStorage.getItem("roleName");

      if (accessToken && userData) {
        try {
          setIsLoggedIn(true);
          setUserInfo({ ...JSON.parse(userData), roleName });
        } catch (error) {
          localStorage.clear();
          setIsLoggedIn(false);
          setUserInfo(null);
        }
      } else {
        setIsLoggedIn(false);
        setUserInfo(null);
      }
    };

    checkAuth();
    loadCartCount();

    window.addEventListener("storage", checkAuth);
    window.addEventListener("cartUpdated", loadCartCount);

    const onLoggedIn = () => {
      checkAuth();
      loadCartCount();
    };
    const onLoggedOut = () => {
      checkAuth();
      loadCartCount();
    };

    window.addEventListener("userLoggedIn", onLoggedIn);
    window.addEventListener("userLoggedOut", onLoggedOut);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("cartUpdated", loadCartCount);
      window.removeEventListener("userLoggedIn", onLoggedIn);
      window.removeEventListener("userLoggedOut", onLoggedOut);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCartCount = async () => {
    try {
      const count = await cartService.getCartCount();
      setCartItemsCount(count);
    } catch {
      setCartItemsCount(0);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await categoryService.getAll();
        if (Array.isArray(res.data?.data)) {
          setCategories(res.data.data);
        }
      } catch (error) {
        showToast("Không thể tải danh mục. Vui lòng thử lại sau.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategorySelect = (category) => {
    setShowCategoryMenu(false);
    setShowMobileMenu(false);
    navigate(`/courses/category?category=${encodeURIComponent(category.name)}`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserInfo(null);
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu((prev) => !prev);
  };

  return (
    <nav className="navbar">
      <div className="navbar-top">
        {/* Hamburger (Mobile) - Moved to Start */}
        <button
          className={`navbar-hamburger ${showMobileMenu ? "open" : ""}`}
          onClick={() => setShowMobileMenu((prev) => !prev)}
          aria-label="Menu"
        >
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
        </button>

        {/* Logo */}
        <div className="navbar-logo">
          <Link to="/" className="logo-link">
            <img src={logoImg} alt="Logo" className="navbar-logo-image" />
          </Link>
        </div>

        {/* Search */}
        <div className="navbar-search">
          <form onSubmit={handleSearch} className="search-form">
            <span className="search-prefix" aria-hidden>
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Tìm khóa học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              aria-label="Tìm khóa học"
            />
            <button
              type="button"
              className="search-button"
              onClick={handleSearch}
            >
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* Desktop Navigation Links */}
        <div className="desktop-nav-links">
          <div className="category-dropdown-container">
            <div
              className={`nav-link-item category-toggle-btn ${showCategoryMenu ? 'active' : ''}`}
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
            >
              <FaBook className="nav-icon" /> Danh mục
            </div>
            {showCategoryMenu && (
              <div className="category-dropdown-list">
                {loading ? (
                  <div className="dropdown-item text-muted">Đang tải...</div>
                ) : (
                  categories.map((category, index) => (
                    <div key={index}>
                      <Link
                        to={`/courses/category?category=${encodeURIComponent(category.name)}`}
                        className="dropdown-item"
                        onClick={() => setShowCategoryMenu(false)}
                      >
                        {category.name}
                      </Link>
                      {index < categories.length - 1 && <div className="dropdown-divider" />}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <Link to="/combo" className="nav-link-item">Combo</Link>
          <Link to="/khoa-hoc-free" className="nav-link-item">Khóa Học Free</Link>
          <Link to="/help" className="nav-link-item">Thông tin</Link>
          <Link to="/guide-purchase" className="nav-link-item">Hướng dẫn</Link>
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {/* Cart */}
          <Link to="/cart" className="cart-link" aria-label="Đi đến giỏ hàng">
            <button type="button" className="notification-btn" aria-label="Giỏ hàng">
              <FaShoppingCart className="icon-cart" aria-hidden="true" />
              {cartItemsCount > 0 && (
                <span className="notification-badge">{cartItemsCount}</span>
              )}
            </button>
          </Link>

          {/* User */}
          {isLoggedIn ? (
            <div className="user-profile" onClick={toggleUserMenu} role="button" tabIndex={0}>
              <div className="user-avatar">
                {userInfo?.avatar ? (
                  <img
                    src={userInfo.avatar}
                    alt="Avatar"
                    style={{ width: "100%", height: "100%", borderRadius: "50%" }}
                  />
                ) : (
                  <FaUser />
                )}
              </div>
              <span className="user-name">
                {userInfo?.firstName}
              </span>
              <FaChevronDown className={`dropdown-icon ${showUserMenu ? "open" : ""}`} />

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="dropdown-item user-info" style={{ background: '#f9f9f9' }}>
                    <FaUser />
                    <span>{userInfo?.username}</span>
                  </div>
                  <div className="dropdown-divider" />
                  {userInfo?.roleName === "ADMIN" ? (
                    <>
                      <Link to="/admin" className="dropdown-item">🔒 Quản trị</Link>
                      <Link to="/" className="dropdown-item"><FaHome /> Trang chủ</Link>
                    </>
                  ) : (
                    <>
                      <Link to="/profile" className="dropdown-item"><FaUser /> Hồ sơ</Link>
                      <Link to="/courses" className="dropdown-item"><FaBook /> Khóa học của tôi</Link>
                    </>
                  )}
                  <div className="dropdown-divider" />
                  <div className="dropdown-item logout-btn">
                    <LogoutButton className="logout-button-dropdown" onLogout={handleLogout} />
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile Search Bar Centered */}
      <div id="mobile-search-bar" className="mobile-search-bar-container">
        <form onSubmit={handleSearch} className="mobile-search-form">
          <FaSearch style={{ color: '#666', marginLeft: '12px' }} />
          <input
            type="text"
            placeholder="Tìm khóa học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mobile-search-input-field"
          />
          <button type="submit" className="mobile-search-submit">Tìm kiếm</button>
        </form>
      </div>

      {/* MOBILE MENU overlay */}
      {showMobileMenu && (
        <>
          <div className="navbar-mobile-overlay" onClick={() => setShowMobileMenu(false)}></div>
          <div className="navbar-mobile-menu">
            <Link to="/" className="nav-item" onClick={() => setShowMobileMenu(false)}>Trang chủ</Link>

            {/* Added Category Section for Mobile */}
            <div className="mobile-category-section" style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 'bold', color: '#009EFF', textTransform: 'uppercase' }}>
                DANH MỤC KHÓA HỌC
              </h4>
              {loading ? (
                <div style={{ fontSize: '13px', color: '#888' }}>Đang tải...</div>
              ) : categories.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {categories.map((category) => (
                    <div
                      key={category.id || category.name}
                      onClick={() => handleCategorySelect(category)}
                      style={{
                        backgroundColor: '#009EFF',
                        color: 'white',
                        padding: '12px 0',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                      }}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: '#888' }}>Trống</div>
              )}
            </div>

            <Link to="/combo" className="nav-item" onClick={() => setShowMobileMenu(false)}>Combo tiết kiệm</Link>
            <Link to="/khoa-hoc-free" className="nav-item" onClick={() => setShowMobileMenu(false)}>Khóa Học Free</Link>
            <Link to="/help" className="nav-item" onClick={() => setShowMobileMenu(false)}>Thông tin</Link>
            <Link to="/guide-purchase" className="nav-item" onClick={() => setShowMobileMenu(false)}>Hướng dẫn mua</Link>

          </div>
        </>
      )}
    </nav>
  );
};
export default Navbar;
