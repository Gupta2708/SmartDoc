import axios from 'axios'

const api = axios.create({
    baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://127.0.0.1:8102/'
        : '/api/'
});

// Use it right away or export it
export default api;
