import React from 'react';

const Button = ({ children, onClick, type = 'button', className = '', ...props }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={` text-white py-2 px-4 rounded transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
