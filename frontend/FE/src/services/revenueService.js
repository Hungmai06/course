import axios from 'axios';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/revenue`;

const revenueService = {
  getMonthlyRevenue: () => {
    const token = localStorage.getItem('accessToken');
    return axios.get(`${BASE_URL}/monthly`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  getDailyRevenue: (month) => {
    const token = localStorage.getItem('accessToken');
    return axios.get(`${BASE_URL}/daily?month=${month}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
};

export default revenueService;
