import React from 'react';

const LoadingSpinner = () => (
  <div style={{ textAlign: 'center', padding: '30px', marginTop: '20px' }}>
    <div style={{
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #007bff',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 20px'
    }}></div>
    <p style={{ color: '#333', fontSize: '1.1rem', margin: '10px 0' }}>
      Processing your driving license with Gemini AI...
    </p>
  </div>
);

export default LoadingSpinner;
