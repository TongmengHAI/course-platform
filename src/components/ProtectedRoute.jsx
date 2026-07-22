import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spin, Result, Button } from 'antd';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spin size="large" tip="Loading authentication status..." />
      </div>
    );
  }

  // Not logged in -> Redirect to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role authorization check
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="p-8">
        <Result
          status="403"
          title="403 Forbidden"
          subTitle={`Sorry, your role (${user?.role}) is not authorized to view this page.`}
          extra={
            <Button type="primary" href="/">
              Return Home
            </Button>
          }
        />
      </div>
    );
  }

  return <Outlet />;
}
