import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ContentList from './pages/ContentList';
import ContentEditor from './pages/ContentEditor';
import ContentTypeList from './pages/ContentTypeList';
import ContentTypeEditor from './pages/ContentTypeEditor';
import MediaPage from './pages/MediaPage';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/content"
              element={
                <ProtectedRoute>
                  <ContentList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/content/new"
              element={
                <ProtectedRoute>
                  <ContentEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/content/edit/:id"
              element={
                <ProtectedRoute>
                  <ContentEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/content-types"
              element={
                <ProtectedRoute>
                  <ContentTypeList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/content-types/new"
              element={
                <ProtectedRoute>
                  <ContentTypeEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/media"
              element={
                <ProtectedRoute>
                  <MediaPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
