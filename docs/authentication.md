# 🔐 Frontend Authentication — Zero to Completed (React + Ant Design)

A step-by-step guide for building the client-side authentication system for the **Online Course Platform**, from an empty folder to a secure, state-managed React login flow.

> **Stack:** React 19 · Ant Design (`antd`) · Ant Design Icons (`@ant-design/icons`) · Axios · React Router DOM
> **You will build:** `LoginPage`, `RegisterPage`, `AuthContext`, Axios JWT Interceptor, and `ProtectedRoute`
> **You will learn:** JWT token handling, local storage persistence, reactive auth state, form validation, role-based route protection, and Ant Design UI integration.

---

## 📚 Table of Contents

1. [What is Frontend Authentication?](#1-what-is-frontend-authentication)
2. [The Big Picture (Client Request & Token Flow)](#2-the-big-picture-client-request--token-flow)
3. [Project Architecture](#3-project-architecture)
4. [Prerequisites & Setup](#4-prerequisites--setup)
5. [Step 1 — The Axios HTTP Service (Token Interceptor)](#step-1--the-axios-http-service-token-interceptor)
6. [Step 2 — The Auth Context & Provider (`AuthContext.jsx`)](#step-2--the-auth-context--provider-authcontextjsx)
7. [Step 3 — The Register Page (Ant Design Form)](#step-3--the-register-page-ant-design-form)
8. [Step 4 — The Login Page (Ant Design Form)](#step-4--the-login-page-ant-design-form)
9. [Step 5 — Protected Routes & Role Guards](#step-5--protected-routes--role-guards)
10. [Step 6 — User Navigation Dropdown (Header Avatar)](#step-6--user-navigation-dropdown-header-avatar)
11. [Testing with the Backend API](#11-testing-with-the-backend-api)
12. [Common Errors & Fixes](#12-common-errors--fixes)
13. [Completion Checklist](#13-completion-checklist)

---

## 1. What is Frontend Authentication?

While backend authentication validates credentials and signs JWT tokens, **frontend authentication** manages:

1. **State persistence**: Storing the JWT token and user info in browser memory (`localStorage` / `sessionStorage`).
2. **Request decoration**: Automatically adding the `Authorization: Bearer <token>` header to all outgoing API requests.
3. **Route protection**: Blocking unauthenticated visitors from accessing private pages like `/student/dashboard` or `/instructor/courses`.
4. **Session expiry handling**: Automatically clearing expired tokens when receiving a `401 Unauthorized` response and redirecting to `/login`.

---

## 2. 🔄 The Big Picture (Client Request & Token Flow)

```
User (Browser)
   │  Fills Form & Clicks "Log in"
   ▼
[LoginPage Component] ──▶ authContext.login(phone, password)
                                │
                                ▼
                       [Axios Service (api.js)]
                                │  POST http://localhost:5000/auth/login
                                ▼
                       Express Backend API
                                │  Validates & Returns { data: { token, user } }
                                ▼
[Axios Interceptor] ──▶ Save token & user to localStorage
                                │
                                ▼
[AuthContext State] ──▶ Set user state ──▶ Re-render App
                                │
                                ▼
[React Router] ──▶ Navigate to /student/dashboard or /instructor/dashboard
```

---

## 3. 🏗 Project Architecture

```
course-platform-web/
├── index.html
├── src/
│   ├── main.jsx                   # Theme ConfigProvider + Root render
│   ├── App.jsx                    # AppRoutes + AuthProvider
│   ├── services/
│   │   └── api.js                 # Axios instance with token interceptor & 401 handling
│   ├── context/
│   │   └── AuthContext.jsx        # Global Auth state + login/register/logout methods
│   ├── components/
│   │   ├── ProtectedRoute.jsx     # Route guard (Auth & Role checking)
│   │   └── Navbar.jsx             # Top Header with User Dropdown & Avatar
│   ├── pages/
│   │   ├── LoginPage.jsx          # Login Form using Ant Design
│   │   ├── RegisterPage.jsx       # Registration Form using Ant Design
│   │   └── DashboardPage.jsx      # Protected Dashboard view
│   └── routes/
│       └── AppRoutes.jsx          # Application route definitions
└── docs/
    ├── frontend_guidelines.md
    └── authentication.md          # ⬅️ This file
```

---

## 4. ⚙ Prerequisites & Setup

Run in `course-platform-web`:

```bash
npm install antd @ant-design/icons axios react-router-dom
```

---

## Step 1 — The Axios HTTP Service (`src/services/api.js`)

> **Goal:** Create a central Axios instance that attaches the JWT token to every request and handles 401 token expiration globally.

`src/services/api.js`

```javascript
import axios from 'axios';
import { message } from 'antd';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1) Attach Token to Request Headers automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2) Handle Global Errors & 401 Expiration
api.interceptors.response.use(
  (response) => response.data, // Unwrap backend envelope: returns { message, data, pagination }
  (error) => {
    const status = error.response?.status;
    const errMsg = error.response?.data?.message || 'An error occurred. Please try again.';

    if (status === 401) {
      message.error('Session expired. Please login again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (status === 403) {
      message.error('Forbidden: You do not have permission.');
    } else {
      message.error(errMsg);
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

## Step 2 — The Auth Context & Provider (`src/context/AuthContext.jsx`)

> **Goal:** Provide global auth state (`user`, `token`, `isAuthenticated`, `loading`) to any component in the app.

`src/context/AuthContext.jsx`

```jsx
import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Read initial user from localStorage for persistent login across page refreshes
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  // Login handler: POST /auth/login
  const login = async (phone, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { phone, password });
      
      // Backend response shape: { message: "...", data: { id, username, phone, role }, token: "..." }
      const token = response.token;
      const authenticatedUser = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(authenticatedUser));
      
      setUser(authenticatedUser);
      return authenticatedUser;
    } finally {
      setLoading(false);
    }
  };

  // Register handler: POST /auth/register
  const register = async (username, phone, password, role = 'student') => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { username, phone, password, role });
      return response;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

## Step 3 — The Register Page (`src/pages/RegisterPage.jsx`)

> **Goal:** Allow new students or instructors to register using Ant Design's `<Form />`, `<Input />`, and `<Select />`.

`src/pages/RegisterPage.jsx`

```jsx
import React from 'react';
import { Card, Form, Input, Select, Button, Typography, message } from 'antd';
import { UserOutlined, PhoneOutlined, LockOutlined, UserAddOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      await register(values.username, values.phone, values.password, values.role);
      message.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      // Error handled by Axios response interceptor
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-radial from-slate-50 to-slate-200/50 p-6 relative overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-200/40 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-200/30 rounded-full filter blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md shadow-xl rounded-2xl border border-slate-100/80 glass-card hover-lift p-4 z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 mb-3">
            <BookOutlined className="text-2xl" />
          </div>
          <Title level={2} className="m-0 text-slate-800 font-bold tracking-tight">Create an Account</Title>
          <Text className="text-slate-500 block mt-1">Join our Online Course Platform</Text>
        </div>

        <Form
          name="register_form"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          initialValues={{ role: 'student' }}
          requiredMark={false}
        >
          <Form.Item
            name="username"
            label={<span className="font-semibold text-slate-600">Full Name</span>}
            rules={[{ required: true, message: 'Please enter your username!' }]}
          >
            <Input prefix={<UserOutlined className="text-slate-400" />} placeholder="John Doe" />
          </Form.Item>

          <Form.Item
            name="phone"
            label={<span className="font-semibold text-slate-600">Phone Number</span>}
            rules={[{ required: true, message: 'Please enter your phone number!' }]}
          >
            <Input prefix={<PhoneOutlined className="text-slate-400" />} placeholder="0123456789" />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span className="font-semibold text-slate-600">Password</span>}
            rules={[
              { required: true, message: 'Please enter your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password prefix={<LockOutlined className="text-slate-400" />} placeholder="Create a password" />
          </Form.Item>

          <Form.Item name="role" label={<span className="font-semibold text-slate-600">Account Type</span>}>
            <Select dropdownStyle={{ borderRadius: '12px' }}>
              <Option value="student">Student (Learn courses)</Option>
              <Option value="instructor">Instructor (Teach courses)</Option>
            </Select>
          </Form.Item>

          <Form.Item className="mt-8 mb-2">
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              icon={<UserAddOutlined />}
              className="bg-indigo-600 hover:bg-indigo-700 border-none h-12 text-base rounded-xl cursor-pointer"
            >
              Register Account
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-6 border-t border-slate-100 pt-4">
          <Text className="text-slate-500">Already have an account? </Text>
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">Log in here</Link>
        </div>
      </Card>
    </div>
  );
}
```

---

## Step 4 — The Login Page (`src/pages/LoginPage.jsx`)

`src/pages/LoginPage.jsx`

```jsx
import React from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { PhoneOutlined, LockOutlined, LoginOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const user = await login(values.phone, values.password);
      message.success(`Welcome back, ${user.username || 'User'}!`);
      
      // Redirect based on User Role
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'instructor') navigate('/instructor/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      // Error handled by Axios response interceptor
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-radial from-slate-50 to-slate-200/50 p-6 relative overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-200/40 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-200/30 rounded-full filter blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md shadow-xl rounded-2xl border border-slate-100/80 glass-card hover-lift p-4 z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 mb-3">
            <BookOutlined className="text-2xl" />
          </div>
          <Title level={2} className="m-0 text-slate-800 font-bold tracking-tight">Welcome Back</Title>
          <Text className="text-slate-500 block mt-1">Sign in to your learning dashboard</Text>
        </div>

        <Form
          name="login_form"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="phone"
            label={<span className="font-semibold text-slate-600">Phone Number</span>}
            rules={[{ required: true, message: 'Please enter your phone number!' }]}
          >
            <Input prefix={<PhoneOutlined className="text-slate-400" />} placeholder="Enter your phone number" />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span className="font-semibold text-slate-600">Password</span>}
            rules={[{ required: true, message: 'Please enter your password!' }]}
          >
            <Input.Password prefix={<LockOutlined className="text-slate-400" />} placeholder="Enter password" />
          </Form.Item>

          <Form.Item className="mt-8 mb-2">
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              icon={<LoginOutlined />}
              className="bg-indigo-600 hover:bg-indigo-700 border-none h-12 text-base rounded-xl cursor-pointer"
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-6 border-t border-slate-100 pt-4">
          <Text className="text-slate-500">Don't have an account? </Text>
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">Register now</Link>
        </div>
      </Card>
    </div>
  );
}
```

---

## Step 5 — Protected Routes & Role Guards (`src/components/ProtectedRoute.jsx`)

> **Goal:** Prevent unauthorized access to private routes. Shows Ant Design `Spin` while checking status, and `Result` status 403 if role check fails.

`src/components/ProtectedRoute.jsx`

```jsx
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
```

---

## Step 6 — User Navigation Dropdown (`src/components/Navbar.jsx`)

> **Goal:** Render user avatar and dropdown menu with Logout option when authenticated.

`src/components/Navbar.jsx`

```jsx
import React from 'react';
import { Layout, Button, Dropdown, Avatar, Space, Tag } from 'antd';
import { UserOutlined, LogoutOutlined, DashboardOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header } = Layout;

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <div className="py-2 px-1">
          <div className="font-bold text-slate-800 text-sm">{user?.username}</div>
          <div className="text-xs text-slate-400 mt-0.5">{user?.phone}</div>
          <Tag color="indigo" className="mt-2 font-semibold tracking-wide border-none rounded-md px-2 py-0.5 text-2xs uppercase bg-indigo-50 text-indigo-600">
            {user?.role}
          </Tag>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'dashboard',
      icon: <DashboardOutlined className="text-slate-500" />,
      label: <span className="font-medium text-slate-700">My Dashboard</span>,
      onClick: () => navigate(`/${user?.role}/dashboard`),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <span className="font-medium">Logout</span>,
      danger: true,
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <Header className="bg-white/85 backdrop-blur-md sticky top-0 z-50 px-6 md:px-12 flex justify-between items-center shadow-xs border-b border-slate-100 h-16 w-full">
      <Link to="/" className="text-xl font-bold text-indigo-600 flex items-center gap-2 tracking-tight">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600">
          <BookOutlined />
        </div>
        <span className="font-heading font-extrabold text-slate-800 text-lg">CoursePlatform</span>
      </Link>

      <div>
        {isAuthenticated ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" dropdownStyle={{ borderRadius: '12px', padding: '4px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            <Space className="cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition duration-150">
              <Avatar icon={<UserOutlined />} className="bg-indigo-500 border border-indigo-200" />
              <span className="font-medium text-slate-700 hidden sm:inline-block">{user?.username}</span>
            </Space>
          </Dropdown>
        ) : (
          <Space size="middle">
            <Button type="text" onClick={() => navigate('/login')} className="font-semibold text-slate-600 hover:text-slate-900">
              Sign In
            </Button>
            <Button type="primary" onClick={() => navigate('/register')} className="bg-indigo-600 hover:bg-indigo-700 border-none font-semibold rounded-lg shadow-xs shadow-indigo-600/10 px-4 h-9 cursor-pointer">
              Register
            </Button>
          </Space>
        )}
      </div>
    </Header>
  );
}
```

---

## Step 7 — The Application Router (`src/routes/AppRoutes.jsx`)

> **Goal:** Configure routing structure mapping paths to public pages or protected layouts under role-based authorization blocks.

`src/routes/AppRoutes.jsx`

```jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import Navbar from '../components/Navbar';

export default function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes for Student */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student/dashboard" element={<DashboardPage />} />
        </Route>

        {/* Protected Routes for Instructor */}
        <Route element={<ProtectedRoute allowedRoles={['instructor']} />}>
          <Route path="/instructor/dashboard" element={<DashboardPage />} />
        </Route>

        {/* Protected Routes for Admin */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<DashboardPage />} />
        </Route>

        {/* Fallback routing */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
```

---

## Step 8 — The Root Component with Theme Config (`src/App.jsx`)

> **Goal:** Inject Ant Design ConfigProvider for branding customization (Indigo color palette) and provide the Auth context.

`src/App.jsx`

```jsx
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
          colorPrimary: '#4f46e5', // Indigo primary color
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
```

---

## Step 9 — The App Entry Point (`src/main.jsx`)

`src/main.jsx`

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

---

## Step 10 — The Protected Dashboard View (`src/pages/DashboardPage.jsx`)

`src/pages/DashboardPage.jsx`

```jsx
import React from 'react';
import { Card, Typography, Button, Row, Col, Statistic, Avatar } from 'antd';
import { BookOutlined, UserOutlined, FileTextOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Title, Paragraph } = Typography;

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-10 px-6 md:px-12">
      <div className="max-w-6xl mx-auto text-left">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-4">
            <Avatar size={64} icon={<UserOutlined />} className="bg-indigo-600 shadow-md" />
            <div>
              <Title level={3} className="m-0 text-slate-800 font-bold">Welcome back, {user?.username}!</Title>
              <Paragraph className="text-slate-500 m-0">You are logged in as an <span className="font-semibold text-indigo-600 uppercase">{user?.role}</span></Paragraph>
            </div>
          </div>
          <Button type="primary" danger icon={<LogoutOutlined />} onClick={logout} className="rounded-xl font-semibold h-11 border-none hover:opacity-90 cursor-pointer">
            Sign Out
          </Button>
        </div>

        {/* Dashboard Stats / Grid */}
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-xs hover-lift rounded-xl border border-slate-100/80">
              <Statistic
                title={<span className="text-slate-400 font-semibold uppercase tracking-wider text-xs">Active Courses</span>}
                value={4}
                prefix={<BookOutlined className="text-indigo-500 mr-2" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-xs hover-lift rounded-xl border border-slate-100/80">
              <Statistic
                title={<span className="text-slate-400 font-semibold uppercase tracking-wider text-xs">Certificates</span>}
                value={2}
                prefix={<FileTextOutlined className="text-purple-500 mr-2" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={24} lg={8}>
            <Card className="shadow-xs hover-lift rounded-xl border border-slate-100/80 bg-indigo-600 text-white">
              <div className="py-1">
                <h3 className="m-0 text-white font-bold text-lg font-heading">Explore New Courses</h3>
                <p className="text-indigo-100 text-xs mt-1 mb-4">Discover trending classes and elevate your skillset today.</p>
                <Button className="bg-white hover:bg-slate-50 text-indigo-600 font-bold border-none rounded-lg h-9 shadow-sm cursor-pointer">
                  Browse Catalog
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
```

---

## Step 11 — The Styling Configuration (`src/index.css`)

`src/index.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

@import "tailwindcss";

:root {
  --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-heading: 'Outfit', sans-serif;
}

body {
  margin: 0;
  font-family: var(--font-sans);
  background: radial-gradient(circle at 50% 0%, #ffffff 0%, #f3f4f6 100%);
  color: #1f2937;
  min-height: 100vh;
}

#root {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* Smooth glassmorphic effect */
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
}

/* Custom interactive animation classes */
.hover-lift {
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.1);
}

/* Custom scrollbars */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
```

---

## 12. 🧪 Testing with the Backend API

1. Start your backend API server on port 5000 (`http://localhost:5000`).
2. Start your frontend development server (`npm run dev`).
3. Navigate to `http://localhost:5173/register`:
   - Fill in Username, Phone Number, Password, and Role.
   - Click **Register Account**.
4. You should see an Ant Design success message and be redirected to `/login`.
5. Enter credentials on `/login` and submit.
6. Verify that:
   - The token is saved in `localStorage` (`token` and `user`).
   - The user profile avatar appears in the top navigation header.
   - Accessing `/student/dashboard` or `/instructor/dashboard` works according to your role.

---

## 13. 🛠 Common Errors & Fixes

| Symptom | Likely Cause | Fix |
|---|---|---|
| Request sent without token header | Interceptor not attached / token key mismatch | Confirm `localStorage.getItem('token')` key matches in `api.js` |
| Endless redirect loop to `/login` | `401` interceptor triggering on non-auth requests | Check backend API response status code; ensure API returns `401` only when token is missing or invalid |
| Page refreshed and logged out | Auth state not initialized from `localStorage` | Initialize `useState(() => JSON.parse(localStorage.getItem('user')))` in `AuthContext.jsx` |
| `antd` form validation styling missing | Missing stylesheet import in `main.jsx` / `index.css` | Import `index.css` or verify Ant Design v5 `ConfigProvider` |

---

## 14. 📋 Completion Checklist

- [x] Installed `antd`, `@ant-design/icons`, `axios`, `react-router-dom`.
- [x] Created `api.js` with request interceptor (`Authorization: Bearer token`).
- [x] Built `AuthContext.jsx` with `login()`, `register()`, and `logout()` methods.
- [x] Created `LoginPage.jsx` and `RegisterPage.jsx` using Ant Design Forms.
- [x] Created `ProtectedRoute.jsx` for auth & role checking.
- [x] Integrated `Navbar.jsx` with user avatar dropdown menu.
- [x] Added `AppRoutes.jsx` for central routing structure configuration.
- [x] Integrated `ConfigProvider` custom branding in `App.jsx`.
- [x] Configured `main.jsx` and `index.css` for custom typography and styling.
- [x] Added dynamic cards and status checks to `DashboardPage.jsx`.

