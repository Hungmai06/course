import React, { useState, useEffect } from "react";
import HomeCategorySection from "../components/HomeCategorySection";
import CategoryCoursesSection from "../components/CategoryCoursesSection";
import Navbar from "../components/Navbar";
import FullCourseBanner from "../components/FullCourseBanner";
import Footer from "../components/Footer";
import { categoryService } from "../services/categoryService";
import "./Home.css";

const Home = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryService
      .getAll()
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => setCategories([]));
  }, []);

  return (
    <div>
      <Navbar />
      <FullCourseBanner />
      <HomeCategorySection />

      {categories.map((category) => (
        <CategoryCoursesSection
          key={category.id || category.name || category.categoryName}
          category={category}
        />
      ))}

      <Footer />
    </div>
  );
};

export default Home;
