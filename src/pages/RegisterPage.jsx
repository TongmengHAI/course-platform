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
