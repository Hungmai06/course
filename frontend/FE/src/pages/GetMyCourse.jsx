import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import courseService from '../services/courseService';
import Footer from '../components/Footer';
import LoadingPlaceholder from '../components/LoadingPlaceholder';
import './GetMyCourse.css';
function GetMyCourse() {
  // State cho filter section
  const [filterSections, setFilterSections] = useState([
    { title: '', content: '' }
  ]);

  // Handler cho filter section
  const handleFilterSectionChange = (idx, field, value) => {
    setFilterSections(prev => prev.map((sec, i) => i === idx ? { ...sec, [field]: value } : sec));
  };
  const handleAddFilterSection = () => {
    setFilterSections(prev => [...prev, { title: '', content: '' }]);
  };
  const handleRemoveFilterSection = (idx) => {
    setFilterSections(prev => prev.filter((_, i) => i !== idx));
  };
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
  const fetchMyCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const userId = userInfo?.id;

      if (!userId) {
        setError('Bạn cần đăng nhập để xem khóa học của mình.');
        setLoading(false);
        return;
      }

      const res = await courseService.getCoursesByUserId(userId);
      setCourses(res.data || []);
    } catch (err) {
      setError(err.message || 'Lỗi khi lấy dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  fetchMyCourses();
}, []);

  return (
    <div>
      <Navbar />
      <div className="my-course-page">
        <h1>Khóa học của tôi</h1>
        {loading ? (
          <LoadingPlaceholder count={4} height={140} />
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : courses.length === 0 ? (
          <div className="empty-state">Bạn chưa có khóa học nào.</div>
        ) : (
          <div className="my-course-list">
            {courses.map(course => (
              <div key={course.id} className="my-course-card">
                <img
                  src={course.avatar || course.image || course.thumbnail || '/placeholder-course.jpg'}
                  alt={course.name}
                  onError={e => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(course.name || 'Course')}&background=random&size=300`; }}
                />
                <h3>{course.name}</h3>
                <p className="course-author">Tác giả: {course.nameAuthor || course.author || course.instructor || 'Chưa cập nhật'}</p>
                <p className="course-category">Danh mục: {course.category || course.nameCategory || 'Chưa cập nhật'}</p>
                {course.linkDrive && (
                  <a
                    href={course.linkDrive}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="learn-button"
                  >
                    Học ngay
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default GetMyCourse;
