import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import AdminPortal from './pages/AdminPortal';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Check for existing user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }

    // Load mock initial applied jobs
    const initialApps = [
      {
        jobTitle: 'Senior Frontend Architect (React)',
        company: 'Vortex Labs',
        appliedDate: '07/10/2026',
        status: 'Under Review'
      }
    ];
    setAppliedJobs(initialApps);
  }, []);

  // Handle successful login
  const handleLogin = (authResponse) => {
    // authResponse: { accessToken, refreshToken, tokenType, userId, email, fullName, role }
    const { accessToken, refreshToken, tokenType, ...userData } = authResponse;
    localStorage.setItem('token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  // Add applied job
  const addAppliedJob = (job) => {
    setAppliedJobs((prev) => [job, ...prev]);
  };

  // Display Toast Notification
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route 
            path="/" 
            element={
              <Home 
                user={user}
                addAppliedJob={addAppliedJob} 
                showToast={showToast} 
              />
            } 
          />
          <Route 
            path="/auth" 
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthPage 
                  onLogin={handleLogin} 
                  showToast={showToast} 
                />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              user ? (
                <Dashboard 
                  user={user} 
                  appliedJobs={appliedJobs} 
                  showToast={showToast} 
                />
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />
          <Route 
            path="/admin" 
            element={
              user && user.role === 'ADMIN' ? (
                <AdminPortal user={user} showToast={showToast} />
              ) : user ? (
                <Navigate to="/" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Global Toast Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
              {toast.message}
            </span>
          </div>
        ))}
      </div>
    </Router>
  );
}

export default App;
