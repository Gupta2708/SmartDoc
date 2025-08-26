import React from 'react';

const ErrorAlert = ({ error }) => (
  <div style={{
    background: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #f5c6cb',
    marginTop: '15px'
  }}>
    {error}
  </div>
);

export default ErrorAlert;
