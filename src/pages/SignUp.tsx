import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';
import '../styles/auth.css';

export const SignUpPage: React.FC = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSignUp = () => {
    loginWithRedirect({
      // screen_hint: 'signup' as any,
      appState: {
        returnTo: '/',
      },
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create Account</h2>
        <p>Start visualizing your data today</p>
        <button className="btn btn-primary w-100" onClick={handleSignUp}>
          <i className="bi bi-person-plus me-2"></i>
          Sign Up
        </button>
        <p className="mt-3 text-center">
          Already have an account?{' '}
          <button 
            className="btn btn-link p-0"
            onClick={() => loginWithRedirect()}
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};
