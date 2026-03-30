import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const updateFreelancerProfile = (data) => API.put('/freelancer/profile', data);

// ── Projects ──
export const createProject = (data) => API.post('/projects', data);
export const getProjects = (params) => API.get('/projects', { params });
export const getProject = (id) => API.get(`/projects/${id}`);
export const updateProject = (id, data) => API.put(`/projects/${id}`, data);
export const closeProject = (id) => API.delete(`/projects/${id}`);
export const getClientProjects = () => API.get('/projects/client/my');
export const selectFreelancer = (projectId, data) => API.post(`/projects/${projectId}/select-freelancer`, data);

// ── Auctions ──
export const createAuction = (data) => API.post('/auctions', data);
export const getAuction = (id) => API.get(`/auctions/${id}`);
export const closeAuction = (id) => API.put(`/auctions/${id}/close`);
export const getRankedBids = (auctionId) => API.get(`/auctions/${auctionId}/ranked-bids`);
export const getAllAuctions = () => API.get('/auctions');

// ── Bids ──
export const submitBid = (data) => API.post('/bids', data);
export const getBidsByAuction = (auctionId) => API.get(`/bids/auction/${auctionId}`);
export const getMyBids = () => API.get('/bids/my');
export const updateBid = (id, data) => API.put(`/bids/${id}`, data);
export const deleteBid = (id) => API.delete(`/bids/${id}`);

// ── Feedback ──
export const submitFeedback = (data) => API.post('/feedbacks', data);
export const getFreelancerFeedbacks = (id) => API.get(`/feedbacks/freelancer/${id}`);
export const getProjectFeedback = (id) => API.get(`/feedbacks/project/${id}`);

// ── Payments ──
export const makePayment = (data) => API.post('/payments', data);
export const getMyPayments = () => API.get('/payments/my');
export const getProjectPayment = (id) => API.get(`/payments/project/${id}`);

// ── Admin ──
export const adminGetUsers = () => API.get('/admin/users');
export const adminUpdateUser = (id, data) => API.put(`/admin/users/${id}`, data);
export const adminDeleteUser = (id) => API.delete(`/admin/users/${id}`);
export const adminToggleBlock = (id) => API.put(`/admin/users/${id}/block`);
export const adminGetStats = () => API.get('/admin/stats');
export const adminGetProjects = () => API.get('/admin/projects');
export const adminMonitorAuctions = () => API.get('/admin/auctions');

export default API;
