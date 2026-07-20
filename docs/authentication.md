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
      
      // Backend response shape: { message: "...", data: { token: "...", user: { id, username, phone, role } } }
      const { token, user: userData, id, username, role } = response.data || {};
      const authenticatedUser = userData || { id, username, phone, role };
      
      localStorage.setItem('token', token || response.data?.token);
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
import { UserOutlined, PhoneOutlined, LockOutlined, UserAddOutlined } from '@ant-design/icons';
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
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-md rounded-lg">
        <div className="text-center mb-6">
          <Title level={3}>Create an Account</Title>
          <Text type="secondary">Join our Online Course Platform</Text>
        </div>

        <Form
          name="register_form"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          initialValues={{ role: 'student' }}
        >
          <Form.Item
            name="username"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter your username!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="John Doe" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true, message: 'Please enter your phone number!' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="0123456789" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item name="role" label="Account Type">
            <Select>
              <Option value="student">Student (Learn courses)</Option>
              <Option value="instructor">Instructor (Teach courses)</Option>
            </Select>
          </Form.Item>

          <Form.Item className="mt-6">
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              icon={<UserAddOutlined />}
            >
              Register Account
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <Text>Already have an account? </Text>
          <Link to="/login">Log in here</Link>
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
import { PhoneOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
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
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-md rounded-lg">
        <div className="text-center mb-6">
          <Title level={3}>Welcome Back</Title>
          <Text type="secondary">Sign in to your learning dashboard</Text>
        </div>

        <Form
          name="login_form"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true, message: 'Please enter your phone number!' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="0123456789" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item className="mt-6">
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              icon={<LoginOutlined />}
            >
              Log In
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <Text>Don't have an account? </Text>
          <Link to="/register">Register now</Link>
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
import { Layout, Menu, Button, Dropdown, Avatar, Space, Tag } from 'antd';
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
        <div className="py-1">
          <div className="font-bold">{user?.username}</div>
          <Tag color="blue" className="mt-1">{user?.role?.toUpperCase()}</Tag>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'My Dashboard',
      onClick: () => navigate(`/${user?.role}/dashboard`),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <Header className="bg-white px-8 flex justify-between items-center shadow-sm border-b">
      <Link to="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
        <BookOutlined /> CoursePlatform
      </Link>

      <div>
        {isAuthenticated ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space className="cursor-pointer">
              <Avatar icon={<UserOutlined />} className="bg-blue-500" />
              <span className="font-medium text-gray-700">{user?.username}</span>
            </Space>
          </Dropdown>
        ) : (
          <Space>
            <Button onClick={() => navigate('/login')}>Login</Button>
            <Button type="primary" onClick={() => navigate('/register')}>Register</Button>
          </Space>
        )}
      </div>
    </Header>
  );
}
```

---

## 11. 🧪 Testing with the Backend API

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

## 12. 🛠 Common Errors & Fixes

| Symptom | Likely Cause | Fix |
|---|---|---|
| Request sent without token header | Interceptor not attached / token key mismatch | Confirm `localStorage.getItem('token')` key matches in `api.js` |
| Endless redirect loop to `/login` | `401` interceptor triggering on non-auth requests | Check backend API response status code; ensure API returns `401` only when token is missing or invalid |
| Page refreshed and logged out | Auth state not initialized from `localStorage` | Initialize `useState(() => JSON.parse(localStorage.getItem('user')))` in `AuthContext.jsx` |
| `antd` form validation styling missing | Missing stylesheet import in `main.jsx` / `index.css` | Import `index.css` or verify Ant Design v5 `ConfigProvider` |

---

## 13. 📋 Completion Checklist

- [ ] Installed `antd`, `@ant-design/icons`, `axios`, `react-router-dom`.
- [ ] Created `api.js` with request interceptor (`Authorization: Bearer token`).
- [ ] Built `AuthContext.jsx` with `login()`, `register()`, and `logout()` methods.
- [ ] Created `LoginPage.jsx` and `RegisterPage.jsx` using Ant Design Forms.
- [ ] Created `ProtectedRoute.jsx` for auth & role checking.
- [ ] Integrated `Navbar.jsx` with user avatar dropdown menu.
