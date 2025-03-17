import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthButton } from '../components/AuthButton';
import '../styles/auth.css';

export const LoginPage: React.FC = () => {
  const { loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = () => {
    loginWithRedirect({
      appState: {
        returnTo: '/',
      },
    });
  };

  const handleSignUp = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
        prompt: 'login',
      },
      appState: {
        returnTo: '/',
      },
    });
  };

  const handleAdminLogin = () => {
    if (window.prompt('Username:') === 'admin' && window.prompt('Password:') === 'admin') {
      sessionStorage.setItem('userRole', 'admin');
      sessionStorage.setItem('isAuthenticated', 'true');
      navigate('/', { replace: true });
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Welcome</h2>
        <p>Sign in or create an account to continue</p>
        <AuthButton
          onClick={handleLogin}
          icon="box-arrow-in-right"
          label="Log In"
        />
        <AuthButton
          onClick={handleSignUp}
          icon="person-plus"
          label="Sign Up"
          variant="outline-primary"
        />
        <AuthButton
          onClick={handleAdminLogin}
          icon="person-lock"
          label="Admin Login"
          // variant="secondary"
        />
      </div>
    </div>
  );
};
