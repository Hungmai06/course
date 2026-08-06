import React, { useEffect, useState } from 'react';
import './Search.css';
import { useLocation } from 'react-router-dom';
import CourseItem from '../components/CourseItem';
import Pagination from '../components/Pagination';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SearchPage = () => {
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const size = 8; // Không cần setSize nếu bạn dùng cố định
  const [totalPages, setTotalPages] = useState(1);

  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get('keyword') || '';

  // Reset page về 1 nếu keyword thay đổi
  useEffect(() => {
    setPage(1);
  }, [keyword]);

  // Fetch dữ liệu theo keyword + page
  useEffect(() => {
    if (!keyword.trim()) {
      setCourses([]);
      setLoading(false);
      return;
    }

    if (courses.length > 0) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    // debounce requests by 300ms and support aborting previous fetch
    const controller = new AbortController();
    const handler = setTimeout(() => {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/course/search?keyword=${encodeURIComponent(keyword)}&page=${page - 1}&size=${size}`, { signal: controller.signal })
        .then(res => {
          if (!res.ok) throw new Error('Không thể tìm kiếm khóa học');
          return res.json();
        })
        .then(data => {
          setCourses((data.data && data.data.content) || []);
          setTotalPages((data.data && data.data.totalPages) || 1);
        })
        .catch(err => {
          if (err.name === 'AbortError') return;
          setError(err.message || 'Lỗi khi tìm kiếm');
          setCourses([]);
          setTotalPages(1);
        })
        .finally(() => {
          setLoading(false);
          setIsRefreshing(false);
        });
    }, 300);

    return () => {
      clearTimeout(handler);
      controller.abort();
    };
  }, [keyword, page]);

  return (
    <div>
      <Navbar />
      <div style={{ minHeight: '100vh', background: '#f7f8fa', padding: '40px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '28px' }}>
            Kết quả tìm kiếm cho: <span style={{ color: '#6366f1' }}>{keyword}</span>
          </h2>

          {isRefreshing && (
            <div style={{ 
              textAlign: 'center', 
              padding: '10px', 
              color: '#0891b2', 
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '20px'
            }}>
              Đang tải...
            </div>
          )}
          
          {loading ? (
            <div className="search-course-list">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ width: '23%', margin: '1%', minHeight: 140, background: '#f3f4f6', borderRadius: 8 }} />
              ))}
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', color: 'red', margin: '40px 0' }}>{error}</div>
          ) : courses.length === 0 ? (
            <div style={{ textAlign: 'center', margin: '40px 0' }}>Không tìm thấy khóa học nào phù hợp.</div>
          ) : (
            <>
              <div className="search-course-list">
                {courses.map(course => (
                  <CourseItem key={course.id} course={course} />
                ))}
              </div>

              {totalPages > 1 && (
                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SearchPage;
