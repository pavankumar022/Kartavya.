import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CommunityFeed from './pages/CommunityFeed';
import ReportIssue from './pages/ReportIssue';
import MyReports from './pages/MyReports';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import GovLogin from './pages/GovLogin';
import GovRegister from './pages/GovRegister';
import GovDashboard from './pages/GovDashboard';
import GovAuthorities from './pages/GovAuthorities';
import PublicAuthorities from './pages/PublicAuthorities';
import Authorities from './pages/Authorities';
import { isAuthenticated } from './utils/auth';
import './styles/global.css';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

// Government Protected Route wrapper
const GovProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return isAuthenticated() && user.isGovUser ? children : <Navigate to="/gov-login" />;
};

// Root route component that always shows landing page
const RootRoute = () => {
  return <Landing />;
};

function App() {
  // Check for reset parameter to clear localStorage for testing
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reset') === 'true') {
      localStorage.clear();
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.reload();
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Root route - always redirects based on auth status */}
        <Route path="/" element={<RootRoute />} />
        
        {/* Public routes */}
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/gov-login" element={<GovLogin />} />
        <Route path="/gov-register" element={<GovRegister />} />
        <Route path="/public-authorities" element={<PublicAuthorities />} />
        
        {/* Protected routes with Layout */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/feed" element={
          <ProtectedRoute>
            <Layout>
              <CommunityFeed />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/report" element={
          <ProtectedRoute>
            <Layout>
              <ReportIssue />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-reports" element={
          <ProtectedRoute>
            <Layout>
              <MyReports />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/authorities" element={
          <ProtectedRoute>
            <Layout>
              <Authorities />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <Layout>
              <Leaderboard />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Government routes */}
        <Route path="/gov-dashboard" element={
          <GovProtectedRoute>
            <GovDashboard />
          </GovProtectedRoute>
        } />
        <Route path="/gov-authorities" element={
          <GovProtectedRoute>
            <GovAuthorities />
          </GovProtectedRoute>
        } />

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;