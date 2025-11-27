import React from 'react';

const TakrawApp = () => {
  return (
    <div style={{ 
      backgroundColor: '#1a1a1a', 
      color: 'white', 
      padding: '40px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
        ✅ 部署成功！
      </h1>
      <p style={{ fontSize: '24px' }}>
        足毽計分板測試版本
      </p>
    </div>
  );
};

export default TakrawApp;
