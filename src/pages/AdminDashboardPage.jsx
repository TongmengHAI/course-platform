import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Row, Col, Avatar, Table, Space, Spin, Tag, Statistic } from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined, LogoutOutlined, BookOutlined, TeamOutlined, TrophyOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const { Title, Paragraph, Text } = Typography;

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Platform metrics
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalInstructors: 0
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // 1. Fetch courses globally
        const coursesResponse = await api.get('/courses', { params: { limit: 100 } });
        const courseList = coursesResponse.data || [];
        setCourses(courseList);

        // 2. Fetch real student count
        const studentsResponse = await api.get('/users', { params: { role: 'student', limit: 1 } });
        const studentCount = studentsResponse.pagination?.total || studentsResponse.data?.length || 0;

        // 3. Fetch real instructor count
        const instructorsResponse = await api.get('/users', { params: { role: 'instructor', limit: 1 } });
        const instructorCount = instructorsResponse.pagination?.total || instructorsResponse.data?.length || 0;

        setStats({
          totalCourses: coursesResponse.pagination?.total || courseList.length,
          totalStudents: studentCount,
          totalInstructors: instructorCount
        });
      } catch (err) {
        console.error("Error loading admin dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const getLevelTagColor = (lvl) => {
    if (lvl === 'Beginner') return 'success';
    if (lvl === 'Intermediate') return 'processing';
    return 'warning';
  };

  const columns = [
    {
      title: 'Course Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span className="font-bold text-slate-800 text-sm">{text}</span>,
    },
    {
      title: 'Instructor',
      dataIndex: 'instructor',
      key: 'instructor',
      render: (instructor) => <span className="text-slate-600 font-medium text-xs">{instructor?.username || 'System Admin'}</span>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <span className="text-slate-500 font-medium text-xs">{text || 'N/A'}</span>,
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (level) => (
        <Tag color={getLevelTagColor(level)} className="font-semibold uppercase text-3xs border-none rounded-md px-2 py-0.5 m-0">
          {level || 'All Levels'}
        </Tag>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (val) => <span className="font-bold text-slate-700 text-sm">${val || 0}</span>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="default"
            icon={<EditOutlined className="text-indigo-600" />} 
            onClick={() => navigate(`/instructor/courses/edit/${record.id}`)} 
            className="rounded-xl font-bold text-xs flex items-center h-8 cursor-pointer border-slate-200"
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-10 px-6 md:px-12 text-left">
      <div className="max-w-6xl mx-auto animate-fadeIn">
        
        {/* Modern Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-800 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
          <div className="flex items-center gap-4 z-10">
            <Avatar size={64} icon={<UserOutlined />} className="bg-white/20 border border-white/30 text-white shadow-sm" />
            <div>
              <Title level={3} className="m-0 text-white font-extrabold tracking-tight" style={{ color: 'white' }}>
                Welcome back, {user?.username}!
              </Title>
              <Text className="text-indigo-200 text-xs block mt-1">Platform Administrator Control Center.</Text>
            </div>
          </div>
          <Button 
            type="default" 
            icon={<LogoutOutlined />} 
            onClick={() => { logout(); navigate('/login'); }} 
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl font-semibold h-10 px-5 cursor-pointer z-10"
            style={{ color: 'white' }}
          >
            Sign Out
          </Button>
        </div>

        {/* Platform metrics */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={8}>
            <Card className="shadow-xs hover-lift rounded-2xl border border-slate-100/80 bg-white" styles={{ body: { padding: '24px' } }}>
              <Statistic
                title={<span className="text-slate-400 font-semibold uppercase tracking-wider text-xs">Total Courses</span>}
                value={stats.totalCourses}
                prefix={<BookOutlined className="text-indigo-500 mr-2" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-xs hover-lift rounded-2xl border border-slate-100/80 bg-white" styles={{ body: { padding: '24px' } }}>
              <Statistic
                title={<span className="text-slate-400 font-semibold uppercase tracking-wider text-xs">Platform Students</span>}
                value={stats.totalStudents}
                prefix={<TeamOutlined className="text-purple-500 mr-2" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-xs hover-lift rounded-2xl border border-slate-100/80 bg-white" styles={{ body: { padding: '24px' } }}>
              <Statistic
                title={<span className="text-slate-400 font-semibold uppercase tracking-wider text-xs">Active Instructors</span>}
                value={stats.totalInstructors}
                prefix={<TrophyOutlined className="text-amber-500 mr-2" />}
              />
            </Card>
          </Col>
        </Row>

        {/* Action Toolbar */}
        <div className="flex justify-between items-center mb-6">
          <Title level={4} className="font-bold text-slate-800 m-0 tracking-tight">Platform Course Administration</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => navigate('/instructor/courses/new')} 
            className="bg-indigo-600 hover:bg-indigo-700 border-none font-bold rounded-xl px-4 h-10 cursor-pointer flex items-center shadow-xs"
          >
            New Course
          </Button>
        </div>

        {/* Course Table */}
        {loading ? (
          <div className="flex justify-center py-20"><Spin size="large" /></div>
        ) : (
          <Card className="shadow-xs border border-slate-100/80 rounded-2xl overflow-hidden p-0 bg-white">
            <Table
              dataSource={courses}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              className="border-none"
            />
          </Card>
        )}
      </div>
    </div>
  );
}