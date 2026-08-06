import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CourseItem from "./CourseItem";
import "./CourseCombo.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function CategoryCoursesSection({ category }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const categoryName = category?.name || category?.categoryName || "";

  useEffect(() => {
    if (!categoryName) return;
    setLoading(true);
    setCourses([]);
    
    axios
      .get(`${API_BASE_URL}/api/v1/course/category/?page=0&size=8&name=${encodeURIComponent(categoryName)}`)
      .then((res) => {
        setCourses(res.data?.data?.content || []);
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [categoryName]);

  const handleViewAll = () => {
    navigate(`/courses/category?category=${encodeURIComponent(categoryName)}`);
  };

  if (!loading && courses.length === 0) return null;

  return (
    <section className="section-gray-bg">
      <div className="section-container">
        <div className="content-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", padding: "0 8px" }}>
            <h2 className="section-title" style={{ margin: 0 }}>{categoryName}</h2>
          </div>

          {loading ? (
            <div className="combo-courses-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ 
                  minHeight: 360, 
                  background: '#f3f4f6', 
                  borderRadius: 8,
                }} />
              ))}
            </div>
          ) : courses.length > 0 ? (
            <>
              <div className="combo-courses-grid">
                {courses.map((course) => (
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
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default CategoryCoursesSection;
