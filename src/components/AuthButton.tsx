import React from 'react';

interface AuthButtonProps {
  onClick: () => void;
  icon: string;
  label: string;
  variant?: 'primary' | 'outline-primary';
}

export const AuthButton: React.FC<AuthButtonProps> = ({ 
  onClick, 
  icon, 
  label, 
  variant = 'primary' 
}) => {
  return (
    <button 
      className={`btn btn-${variant} w-100 mb-3`} 
      onClick={onClick}
    >
      <i className={`bi bi-${icon} me-2`}></i>
      {label}
    </button>
  );
};
