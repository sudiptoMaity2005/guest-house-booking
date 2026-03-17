import axios from 'axios';

const API = axios.create({
    //baseURL: 'https://guest-house-booking-v0j1.onrender.com/api', 
    baseURL: 'http://localhost:5001/api'
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;