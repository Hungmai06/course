import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import CourseItem from "./CourseItem";
import { showToast } from '../utils/toast';
import "./CourseCombo.css"

function CourseCombo() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
        setLoading(true);
        const categoryName = "COMBO TIẾT KIỆM";
        const res = await axios.get(
        `${API_BASE_URL}/api/v1/course/category/?page=0&size=8&name=${encodeURIComponent(categoryName)}`
        );
        setData(res.data.data.content || []);
    } catch (error) {
      showToast(`Lỗi khi tải khóa học: ${error?.message || error}`, 'error');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = () => {
    navigate(`/courses/category?category=${encodeURIComponent("COMBO TIẾT KIỆM")}`);
  };

  return (
    <div>      
      <div className="combo-grid-container">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i} 
              style={{ 
                minHeight: 360, 
                background: '#f3f4f6', 
                borderRadius: 8,
              }} 
            />
          ))
        ) : data.length > 0 ? (
          <>
            <div className="combo-courses-grid">
              {data.map((course) => (
                <div key={course.id} className="combo-grid-item">
                  <CourseItem course={course} />
                </div>
              ))}
            </div>

            <div className="load-more-container">
              <button className="load-more-btn" onClick={handleViewAll}>
                Xem thêm
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666', gridColumn: '1 / -1' }}>
            <p style={{ fontSize: '1.2rem', color: '#666' }}>
              Không có khóa học combo nào.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseCombo;
