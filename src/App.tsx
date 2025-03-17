import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Dashboard from './pages/Dashboard';
import JobDetails from './pages/JobDetails';
import {LoginPage} from './pages/Login';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { Auth0ProviderWithNavigate } from './auth/auth0-provider-with-navigate';

function App() {
  return (
    <BrowserRouter>
      <Auth0ProviderWithNavigate>
        <ErrorBoundary>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="jobs/:jobId" element={<JobDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </Auth0ProviderWithNavigate>
    </BrowserRouter>
  );
}

export default App;
