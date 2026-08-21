import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spin, Typography, Tag, Divider, Collapse, Row, Col } from 'antd';
import { ArrowLeftOutlined, PlayCircleOutlined, GlobalOutlined, FieldTimeOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Title, Paragraph, Text } = Typography;

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/courses/${id}`);
        setCourse(response.data);
      } catch (err) {
        console.error("Error loading course details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const getLevelTagColor = (lvl) => {
    if (lvl === 'Beginner') return 'success';
    if (lvl === 'Intermediate') return 'processing';
    return 'warning';
  };

  if (loading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;
  if (!course) return <div className="text-center py-20"><Text type="danger">Course not found</Text></div>;

  // Mock syllabus data for visual placeholder layout
  const syllabusItems = [
    {
      key: '1',
      label: <span className="font-bold text-slate-700">Section 1: Course Fundamentals</span>,
      children: (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2"><PlayCircleOutlined className="text-indigo-600" /> <Text>1.1 Core introduction setup</Text></div>
          <div className="flex items-center gap-2"><PlayCircleOutlined className="text-indigo-600" /> <Text>1.2 Reviewing developer toolkit basics</Text></div>
        </div>
      ),
    }
  ];

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-10 px-6 md:px-12 text-left">
      <div className="max-w-5xl mx-auto">
        
        {/* Back Button */}
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/courses')} className="mb-6 rounded-xl font-semibold border-slate-200">
          Back to Catalog
        </Button>

        {/* Two Column Layout */}
        <Row gutter={[28, 28]}>
          
          {/* Left Column: Course details & Syllabus */}
          <Col xs={24} md={15}>
            <div className="flex items-center gap-2.5 mb-4">
              <Tag color={getLevelTagColor(course.level)} className="m-0 font-semibold px-2 py-0.5 rounded-md border-none uppercase text-3xs">
                {course.level}
              </Tag>
              <Tag className="m-0 text-slate-500 font-semibold px-2 py-0.5 rounded-md border-slate-200 uppercase text-3xs">
                {course.category}
              </Tag>
            </div>

            <Title level={2} className="font-extrabold text-slate-800 tracking-tight m-0 mb-6">
              {course.title}
            </Title>

            <Card className="shadow-xs rounded-2xl border border-slate-100 p-2 bg-white mb-8">
              <Title level={4} className="font-bold text-slate-800 mb-4 mt-0">About Course</Title>
              <Paragraph className="text-slate-600 text-sm leading-relaxed mb-0 whitespace-pre-wrap">
                {course.description || "No description provided."}
              </Paragraph>
            </Card>

            <Card className="shadow-xs rounded-2xl border border-slate-100 p-2 bg-white">
              <Title level={4} className="font-bold text-slate-800 mb-4 mt-0">Syllabus Curriculum</Title>
              <Collapse items={syllabusItems} defaultActiveKey={['1']} className="bg-slate-50 border-none rounded-xl" />
            </Card>
          </Col>

          {/* Right Column: Sticky Pricing & Action Panel */}
          <Col xs={24} md={9}>
            <Card className="shadow-md rounded-2xl border border-slate-100 bg-white sticky top-24 p-2">
              <div className="text-center mb-6">
                <Text className="text-slate-400 block text-xs font-bold uppercase tracking-wider mb-1">Fee</Text>
                <Title level={1} className="font-extrabold text-indigo-600 m-0 tracking-tight" style={{ color: '#4f46e5' }}>
                  ${course.price}
                </Title>
              </div>

              <Divider className="my-4 border-slate-100" />

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <GlobalOutlined className="text-slate-400 text-lg" />
                  <Text className="text-slate-600 text-xs">Self-paced learning structure</Text>
                </div>
                <div className="flex items-center gap-3">
                  <FieldTimeOutlined className="text-slate-400 text-lg" />
                  <Text className="text-slate-600 text-xs">Lifetime access to content</Text>
                </div>
                <div className="flex items-center gap-3">
                  <SafetyCertificateOutlined className="text-slate-400 text-lg" />
                  <Text className="text-slate-600 text-xs">Certificate on final milestone completion</Text>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                <Text className="text-slate-400 block text-3xs uppercase font-bold tracking-wider mb-1">Instructor</Text>
                <Text className="font-bold text-slate-800 text-sm block">{course.instructor?.username || 'Unknown'}</Text>
                <Text className="text-slate-400 text-xs">{course.instructor?.email || 'instructor@test.com'}</Text>
              </div>

              {/* Action Button Area (Enrollment hooks will bind here in Step 3) */}
              <div className="space-y-2">
                <Button type="primary" block size="large" className="bg-indigo-600 hover:bg-indigo-700 border-none font-bold rounded-xl h-11 cursor-pointer">
                  Explore Mode
                </Button>
              </div>
            </Card>
          </Col>

        </Row>
      </div>
    </div>
  );
}