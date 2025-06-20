import React from 'react';

const Button = ({ children, onClick, type = 'button', className = '', ...props }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
