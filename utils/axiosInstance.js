import axios from 'axios';

// const API_BASE_URL = `http://172.28.81.186:5000`;
const API_BASE_URL = `http://192.168.1.155:5000`;
// const API_BASE_URL = `http://192.168.1.126:5000`;
// const API_BASE_URL = `http://192.168.1.119:5000`;
// const API_BASE_URL = `http://172.28.43.252:5000`;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 50000,
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);


export default axiosInstance;
