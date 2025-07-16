import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://my-react-app-weo4.onrender.com"
});

// Debug logs for Vite
console.log('API baseURL:', api.defaults.baseURL);
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('Environment:', import.meta.env.MODE);

export default api;
