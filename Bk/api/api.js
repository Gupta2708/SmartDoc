import axios from 'axios'

const api = axios.create({
  baseURL: "https://my-react-app-weo4.onrender.com"
});

// Remove ANY localhost overrides for production
console.log('API baseURL:', api.defaults.baseURL);
console.log('Current hostname:', window.location.hostname);
console.log('Environment:', process.env.NODE_ENV);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

export default api;
