import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import Pagination from "./Pagination";
import CourseItem from "./CourseItem"; // nếu bạn dùng CourseItem riêng
import { showToast } from '../utils/toast';
import "./CourseHome.css"
import CourseCombo from "./CourseCombo";
function CourseHome() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // true lần đầu
  const [isRefreshing, setIsRefreshing] = useState(false); // loading khi đổi trang
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCourses();
  }, [page]);

  const fetchCourses = async () => {
    // Nếu đã có data, chỉ set isRefreshing thay vì loading
    if (data.length > 0) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/course/?page=${page - 1}&size=16`);
      setData(res.data.data.content || []);
      setTotalPages(res.data.data.totalPages || 1);
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
      {/* Hiển thị indicator nhỏ khi đang refresh */}
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
          // Skeleton animated - hiển ngay lập tức
          Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i} 
              className="course-skeleton" 
              style={{ 
                width: '23%', 
                margin: '1%', 
                minHeight: 200, 
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
                borderRadius: 12 
              }} 
            />
          ))
        ) : data.length > 0 ? (
          data.map((course) => (
            <CourseItem key={course.id} course={course} />
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '1.2rem', color: '#666' }}>
              Không có khóa học nào.
            </p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}

export default CourseHome;
