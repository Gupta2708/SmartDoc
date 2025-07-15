import axios from 'axios'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://my-react-app-weo4.onrender.com"
});

// // Force the correct baseURL for network access
// if (window.location.hostname === '192.168.29.210') {
//   api.defaults.baseURL = 'http://192.168.29.210:8102';
// }

// Add this for debugging
console.log('API baseURL:', api.defaults.baseURL);
console.log('Current hostname:', window.location.hostname);

export default api;