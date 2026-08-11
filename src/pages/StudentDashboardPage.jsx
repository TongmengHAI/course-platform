import React from 'react';
import { Card, Typography, Button, Row, Col, Statistic, Avatar } from 'antd';
import { BookOutlined, UserOutlined, FileTextOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Title, Paragraph } = Typography;

export default function StudentDashboardPage() {
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
          {/* <Col xs={24} sm={12} lg={8}>
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
          </Col> */}
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