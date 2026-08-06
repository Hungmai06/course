import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;

const authService = {
 
  login: (credentials) => {
    
    return axios.post(`${BASE_URL}/login`, credentials);
  },

 
  refreshToken: (refreshToken) => {
    return axios.post(`${BASE_URL}/refresh-token`, { refreshToken });
  },


  sendOtp: (username) => {
    return axios.post(`${BASE_URL}/forgot-password`, { username });
  },


  resetPassword: (resetData) => {

    return axios.post(`${BASE_URL}/reset-password`, resetData);
  }
};

export default authService;
