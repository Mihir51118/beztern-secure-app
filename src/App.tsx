import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import EmployeeAttendance from './pages/EmployeeAttendance';
import ShopVisit from './pages/ShopVisit';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/attendance" 
                element={
                  <ProtectedRoute>
                    <EmployeeAttendance />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/shop-visit" 
                element={
                  <ProtectedRoute>
                    <ShopVisit />
                  </ProtectedRoute>
                } 
              />
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;