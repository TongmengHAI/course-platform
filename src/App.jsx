import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#4f46e5', // Beautiful Indigo
          borderRadius: 8,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        },
        components: {
          Button: {
            controlHeightLG: 46,
            fontWeight: 600,
          },
          Input: {
            controlHeightLG: 46,
          },
          Select: {
            controlHeightLG: 46,
          },
        },
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}
