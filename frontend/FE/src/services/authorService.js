import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/author`;

const authorService = {
  create: (data) => {
    const token = localStorage.getItem('accessToken');
    return axios.post(`${BASE_URL}/`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  getAll: () => {
   
    return axios.get(`${BASE_URL}/`);
  },
  findById: (id) => {
    const token = localStorage.getItem('accessToken');
    return axios.get(`${BASE_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  update: (id, data) => {
    const token = localStorage.getItem('accessToken');
    return axios.put(`${BASE_URL}/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  remove: (id) => {
    const token = localStorage.getItem('accessToken');
    return axios.delete(`${BASE_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
};

export default authorService;
