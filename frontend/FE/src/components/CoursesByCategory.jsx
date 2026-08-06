import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import './CoursesByCategory.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import Pagination from "./Pagination";
import CourseItem from "./CourseItem";
import Navbar from "./Navbar";
import "./CourseHome.css";
import { showToast } from '../utils/toast';
import Footer from "./Footer";

function CourseByCategory() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const [searchParams] = useSearchParams();
  const categoryName = searchParams.get("category") || "";

  useEffect(() => {
    // Reset về trang 1 khi category thay đổi
    setPage(1);
    setData([]);
    setLoading(true);
  }, [categoryName]);

  useEffect(() => {
    fetchCourses();
  }, [page, categoryName]);

  const fetchCourses = async () => {
    if (data.length > 0) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/course/category/?page=${page - 1}&size=16&name=${categoryName}`
      );
      setData(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch (error) {
      showToast(`Lỗi khi tải khóa học: ${error?.message || error}`, 'error');
      setData([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="course-container">
        <h1 className="course-title">
          Khóa học thuộc danh mục: <strong className="category-highlight">{categoryName || "Tất cả"}</strong>
        </h1>

        {isRefreshing && (
          <div style={{ 
            textAlign: 'center', 
            padding: '10px', 
            color: '#0891b2', 
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Đang tải...
          </div>
        )}

        <div className="course-list">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="course-skeleton" style={{ width: '23%', margin: '1%', minHeight: 140, background: '#f3f4f6', borderRadius: 8 }} />
            ))
          ) : data.length > 0 ? (
            data.map((course, idx) => <CourseItem key={idx} course={course} />)
          ) : (
            <div style={{ 
              textAlign: "center", 
              padding: '60px 20px',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              margin: '0 auto',
              maxWidth: '600px'
            }}>
              <p style={{ 
                fontSize: '1.2rem', 
                color: '#666',
                margin: '0'
              }}>
                Không có khóa học nào trong danh mục này.
              </p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div style={{ marginTop: '40px' }}>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default CourseByCategory;
