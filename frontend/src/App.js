import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import ClientDashboard from './pages/client/ClientDashboard';
import ClientProjects from './pages/client/ClientProjects';
import PostProject from './pages/client/PostProject';
import ProjectDetail from './pages/client/ProjectDetail';
import ClientPayments from './pages/client/ClientPayments';

import FreelancerDashboard from './pages/freelancer/FreelancerDashboard';
import BrowseProjects from './pages/freelancer/BrowseProjects';
import FreelancerProjectDetail from './pages/freelancer/FreelancerProjectDetail';
import MyBids from './pages/freelancer/MyBids';
import FreelancerProfile from './pages/freelancer/FreelancerProfile';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProjects from './pages/admin/AdminProjects';
import AdminAuctions from './pages/admin/AdminAuctions';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

        {/* Client routes */}
        <Route path="/client/dashboard" element={<ProtectedRoute role="client"><ClientDashboard /></ProtectedRoute>} />
        <Route path="/client/projects" element={<ProtectedRoute role="client"><ClientProjects /></ProtectedRoute>} />
        <Route path="/client/projects/new" element={<ProtectedRoute role="client"><PostProject /></ProtectedRoute>} />
        <Route path="/client/projects/:id" element={<ProtectedRoute role="client"><ProjectDetail /></ProtectedRoute>} />
        <Route path="/client/payments" element={<ProtectedRoute role="client"><ClientPayments /></ProtectedRoute>} />

        {/* Freelancer routes */}
        <Route path="/freelancer/dashboard" element={<ProtectedRoute role="freelancer"><FreelancerDashboard /></ProtectedRoute>} />
        <Route path="/freelancer/projects" element={<ProtectedRoute role="freelancer"><BrowseProjects /></ProtectedRoute>} />
        <Route path="/freelancer/projects/:id" element={<ProtectedRoute role="freelancer"><FreelancerProjectDetail /></ProtectedRoute>} />
        <Route path="/freelancer/bids" element={<ProtectedRoute role="freelancer"><MyBids /></ProtectedRoute>} />
        <Route path="/freelancer/profile" element={<ProtectedRoute role="freelancer"><FreelancerProfile /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/projects" element={<ProtectedRoute role="admin"><AdminProjects /></ProtectedRoute>} />
        <Route path="/admin/auctions" element={<ProtectedRoute role="admin"><AdminAuctions /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
