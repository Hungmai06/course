
import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Home from "./pages/Home";
import CoursesByCategory from './components/CoursesByCategory';
const CourseDetail = lazy(() => import('./components/CourseDetail'));
import Cart from './pages/Cart';
import { initAuthEvents, cleanupAuthEvents } from './utils/authEventHandler';
import BeforePayment from "./pages/BeforePayment";
import Profile from "./pages/Profile";
import GetMyCourse from "./pages/GetMyCourse";
import SearchPage from './pages/Search';
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
import tokenManager from './utils/tokenManager';
import GuidePurchase from './pages/GuidePurchase';
import ForgotPassword from './pages/ForgotPassword';
import Combo from "./pages/Combo";
import TopLoadingBar from "./components/TopLoadingBar";
import FloatingSocialButtons from "./components/FloatingSocialButtons";
import GlobalBanner from "./components/GlobalBanner";
import English48Days from "./48ngayfree/English48Days";
import FreeCourses from "./pages/FreeCourses";
import FreeCourseDetail from "./pages/FreeCourseDetail";
import ReviewSach from "./pages/ReviewSach";

import FullCourseDetail from "./pages/FullCourseDetail";

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, search]);
  return null;
}

function App() {
  useEffect(() => {
    // Initialize auth event listeners
    initAuthEvents();
    tokenManager.initTokenTimer();
    // Cleanup on unmount
    return () => {
      cleanupAuthEvents();
      if (tokenManager && typeof tokenManager.clearTokenTimer === 'function') {
        tokenManager.clearTokenTimer();
      }
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <TopLoadingBar />
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }} aria-hidden />}>
        <Routes>
          {/* Public routes - không cần đăng nhập */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/courses/category" element={<CoursesByCategory />} />
          <Route path="/course/:slug" element={<CourseDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/help" element={<About />} />
          <Route path="/before-payment" element={<BeforePayment />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/courses" element={<GetMyCourse />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/guide-purchase" element={<GuidePurchase />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/combo" element={<Combo />} />
          <Route path="/khoa-hoc-free" element={<FreeCourses />} />
          <Route path="/khoa-hoc-free/:id" element={<FreeCourseDetail />} />
          <Route path="/full-course" element={<FullCourseDetail />} />
          <Route path="/48-ngay-lay-goc-tieng-anh-free" element={<FreeCourses />} />
          <Route path="/review-sach" element={<ReviewSach />} />
          {/* Protected routes - chỉ dành cho admin */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
      <GlobalBanner />
      {/* <FloatingSocialGroup /> */}
      <FloatingSocialButtons />
    </Router>
  );
}

export default App;
