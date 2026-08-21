import React from 'react';
import { Card, Form, Input, Button, Typography, App } from 'antd';
import { PhoneOutlined, LockOutlined, LoginOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { message } = App.useApp(); // ⬅️ Contextual message API

  const onFinish = async (values) => {
    try {
      const user = await login(values.phone, values.password);
      message.success(`Welcome back, ${user.username || 'User'}!`);
      
      // Redirect based on User Role
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'instructor') navigate('/instructor/dashboard');
      else navigate('/student/dashboard');
      // if (user.role === 'admin') console.log('Welcome to Admin Dashboard');
      // else if (user.role === 'instructor') console.log('Welcome to Instructor Dashboard');
      // else console.log('Welcome to Student Dashboard');
    } catch (err) {
      console.error('Login error:', err);
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