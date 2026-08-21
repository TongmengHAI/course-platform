import React, { useEffect, useState } from 'react';
import { Card, Input, Select, Row, Col, Typography, Spin, Button, Tag, Rate } from 'antd';
import { SearchOutlined, BookOutlined, FilterOutlined, StarFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function CourseCatalogPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState(undefined);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (level) params.level = level;
      
      const response = await api.get('/courses', { params });
      setCourses(response.data || []);
    } catch (err) {
      console.error("Error loading catalog data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [search, level]);

  const getLevelTagColor = (lvl) => {
    if (lvl === 'Beginner') return 'success';
    if (lvl === 'Intermediate') return 'processing';
    return 'warning';
  };

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-10 px-6 md:px-12 text-left animate-fadeIn">
      <div className="max-w-6xl mx-auto">
        
        {/* Modern Hero Section */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 md:p-12 mb-10 relative overflow-hidden shadow-md">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="text-2xs font-bold tracking-wider uppercase bg-indigo-500/30 text-indigo-200 px-3 py-1 rounded-full border border-indigo-500/20">
              E-Learning Hub
            </span>
            <Title level={1} className="text-white font-extrabold mt-4 mb-4 tracking-tight m-0" style={{ color: 'white' }}>
              Expand Your Skills
            </Title>
            <Paragraph className="text-slate-300 text-sm md:text-base mb-0 font-normal leading-relaxed">
              Explore professional course tracks led by domain experts. Start learning and upgrading your developer career path today.
            </Paragraph>
          </div>
        </div>

        {/* Toolbar Filter panel */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs justify-between items-center">
          <div className="flex items-center gap-2">
            <FilterOutlined className="text-indigo-600 text-lg" />
            <Text className="font-bold text-slate-700 text-sm">Filter Options</Text>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Input
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Search by title, desc..."
              allowClear
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-80 h-10 rounded-xl"
            />
            <Select
              placeholder="Difficulty Level"
              allowClear
              onChange={setLevel}
              className="w-full sm:w-48 h-10"
            >
              <Option value="Beginner">Beginner</Option>
              <Option value="Intermediate">Intermediate</Option>
              <Option value="Advanced">Advanced</Option>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spin size="large" /></div>
        ) : (
          <Row gutter={[24, 24]}>
            {courses.length === 0 ? (
              <Col span={24}>
                <Card className="text-center py-16 rounded-2xl border border-dashed border-slate-200">
                  <BookOutlined className="text-4xl text-slate-300 mb-3" />
                  <Title level={4} className="text-slate-700 m-0">No Courses Found</Title>
                  <Paragraph className="text-slate-400 mt-1">Try adjusting your filters or search keywords.</Paragraph>
                </Card>
              </Col>
            ) : (
              courses.map((course) => (
                <Col xs={24} sm={12} lg={8} key={course.id}>
                  <Card
                    hoverable
                    className="shadow-xs rounded-2xl border border-slate-100/80 overflow-hidden hover-lift flex flex-col h-full bg-white relative"
                    styles={{ body: { padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' } }}
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Tag color={getLevelTagColor(course.level)} className="font-semibold px-2 py-0.5 rounded-md border-none uppercase text-3xs">
                        {course.level || 'All Levels'}
                      </Tag>
                      <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{course.category || 'Development'}</span>
                    </div>
                    
                    <Title level={4} className="m-0 text-slate-800 font-bold tracking-tight line-clamp-1 mb-2 hover:text-indigo-600 transition">
                      {course.title}
                    </Title>
                    
                    <Paragraph className="text-slate-500 text-xs leading-relaxed mt-1 flex-grow line-clamp-3 mb-6">
                      {course.description}
                    </Paragraph>

                    <div className="flex items-center gap-1.5 mb-4">
                      <StarFilled className="text-amber-400 text-xs" />
                      <Text className="text-slate-700 font-bold text-xs">4.7</Text>
                      <Text className="text-slate-400 text-2xs">(42 reviews)</Text>
                    </div>
                    
                    <div className="border-t border-slate-100 pt-4 flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className="text-slate-400 text-3xs uppercase font-bold tracking-wider">Fee</span>
                        <Text className="font-extrabold text-lg text-indigo-600">${course.price || 0}</Text>
                      </div>
                      <Button type="primary" className="bg-indigo-600 hover:bg-indigo-700 border-none font-semibold rounded-xl text-xs px-4 h-9 cursor-pointer">
                        Explore
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        )}
      </div>
    </div>
  );
}