import React, { useEffect, useState } from 'react';
import CourseCombo from '../components/CourseCombo';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
const Combo = () => {

  return (
    <div>
      <Navbar />
      <div className="p-6">
       <h1 style={{ textAlign: 'center', fontSize: '40px', fontWeight: 'bold', marginBottom: '30px' }}>
          Combo khóa học tiết kiệm</h1>
       <CourseCombo />
       <Footer />
      </div>
    </div>
  );
};

export default Combo;