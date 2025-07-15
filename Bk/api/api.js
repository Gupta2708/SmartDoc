import axios from 'axios'

const api = axios.create({
  baseURL: window.location.hostname === 'localhost' 
    ? 'http://localhost:8102'
    : window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8102'
    : window.location.hostname.startsWith('192.168.')
    ? `http://${window.location.hostname}:8102`
    : `http://${window.location.hostname}:8102`
});

// Force the correct baseURL for network access
if (window.location.hostname === '192.168.29.210') {
  api.defaults.baseURL = 'http://192.168.29.210:8102';
}

// Add this for debugging
console.log('API baseURL:', api.defaults.baseURL);
console.log('Current hostname:', window.location.hostname);

export default api;