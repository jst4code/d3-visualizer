import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';

export const ProtectedComponent = () => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  if (!isAuthenticated) {
    return <button onClick={() => loginWithRedirect()}>Log In</button>;
  }

  return (
    <div>
      <h1>Welcome {user?.name}</h1>
      <button onClick={() => logout()}>Log Out</button>
    </div>
  );
};
