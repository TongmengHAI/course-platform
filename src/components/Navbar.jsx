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
      <div className="flex items-center gap-6">
        {/* Logo link now routes to catalog when logged in, otherwise login page */}
        <Link to={isAuthenticated ? "/courses" : "/login"} className="text-xl font-bold text-indigo-600 flex items-center gap-2 tracking-tight">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600">
            <BookOutlined />
          </div>
          <span className="font-heading font-extrabold text-slate-800 text-lg">CoursePlatform</span>
        </Link>

        {/* Browse courses menu link only visible when logged in */}
        {isAuthenticated && (
          <Link to="/courses" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition ml-2">
            Browse Courses
          </Link>
        )}
      </div>

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