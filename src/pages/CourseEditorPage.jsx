import React, { useEffect, useState } from 'react';
import { Card, Form, Input, InputNumber, Select, Button, Spin, message, Typography, Row, Col, Tag, Avatar } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, BookOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

export default function CourseEditorPage() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Watch form fields dynamically to feed the Live Preview Card on the right
  const watchTitle = Form.useWatch('title', form);
  const watchDescription = Form.useWatch('description', form);
  const watchCategory = Form.useWatch('category', form);
  const watchLevel = Form.useWatch('level', form);
  const watchPrice = Form.useWatch('price', form);

  useEffect(() => {
    if (isEditMode) {
      const fetchCourse = async () => {
        setLoading(true);
        try {
          const response = await api.get(`/courses/${id}`);
          const data = response.data;
          form.setFieldsValue({
            title: data.title,
            description: data.description,
            category: data.category,
            level: data.level,
            price: data.price,
          });
        } catch (err) {
          console.error("Error loading course details for editor:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    }
  }, [id, isEditMode, form]);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      if (isEditMode) {
        await api.put(`/courses/${id}`, values);
        message.success("Course details updated successfully!");
      } else {
        await api.post('/courses', values);
        message.success("Course created successfully!");
      }
      navigate('/instructor/dashboard');
    } catch (err) {
      console.error("Failed to submit course data:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getLevelTagColor = (lvl) => {
    if (lvl === 'Beginner') return 'success';
    if (lvl === 'Intermediate') return 'processing';
    return 'warning';
  };

  if (loading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-10 px-6 md:px-12 text-left animate-fadeIn">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Toolbar */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/instructor/dashboard')} 
            className="rounded-xl font-bold h-10 border-slate-200 text-slate-600 cursor-pointer shadow-xs"
          >
            Back
          </Button>
          <Title level={3} className="m-0 font-extrabold text-slate-800 tracking-tight">
            {isEditMode ? "Edit Course Details" : "Create New Course"}
          </Title>
        </div>

        <Row gutter={[32, 32]}>
          {/* Left Column: Form Editor Card */}
          <Col xs={24} lg={15}>
            <Card className="shadow-xs rounded-2xl border border-slate-100/80 p-4 md:p-6 bg-white">
              <Form
                form={form}
                onFinish={onFinish}
                layout="vertical"
                size="large"
                requiredMark={false}
              >
                <Form.Item
                  name="title"
                  label={<span className="font-bold text-slate-700 text-xs">Course Title</span>}
                  rules={[{ required: true, message: "Please enter the course title!" }]}
                >
                  <Input placeholder="e.g., Introduction to React & Tailwind" className="rounded-xl" />
                </Form.Item>

                <Form.Item
                  name="description"
                  label={<span className="font-bold text-slate-700 text-xs">Course Description</span>}
                  rules={[{ required: true, message: "Please enter the course description!" }]}
                >
                  <Input.TextArea rows={5} placeholder="Describe the topics covered and syllabus modules..." className="rounded-xl" />
                </Form.Item>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Form.Item
                    name="category"
                    label={<span className="font-bold text-slate-700 text-xs">Category</span>}
                    rules={[{ required: true, message: "Please select a category!" }]}
                  >
                    <Select placeholder="Choose field category">
                      <Option value="Programming">Programming</Option>
                      <Option value="Design">Design</Option>
                      <Option value="Marketing">Marketing</Option>
                      <Option value="Business">Business</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="level"
                    label={<span className="font-bold text-slate-700 text-xs">Difficulty Level</span>}
                    rules={[{ required: true, message: "Please select a difficulty level!" }]}
                  >
                    <Select placeholder="Choose target level">
                      <Option value="Beginner">Beginner</Option>
                      <Option value="Intermediate">Intermediate</Option>
                      <Option value="Advanced">Advanced</Option>
                    </Select>
                  </Form.Item>
                </div>

                <Form.Item
                  name="price"
                  label={<span className="font-bold text-slate-700 text-xs">Price (USD)</span>}
                  rules={[{ required: true, message: "Please enter a course fee!" }]}
                  initialValue={0}
                >
                  <InputNumber 
                    min={0} 
                    className="w-full rounded-xl" 
                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                    parser={value => value.replace(/\$\s?|(,*)/g, '')} 
                  />
                </Form.Item>

                <Form.Item className="mt-8 mb-2">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    icon={<SaveOutlined />}
                    block
                    className="bg-indigo-600 hover:bg-indigo-700 border-none font-bold rounded-xl h-11 cursor-pointer shadow-xs"
                  >
                    Save Course Details
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Right Column: Live Card Preview */}
          <Col xs={24} lg={9}>
            <div className="sticky top-24">
              <Text className="text-slate-400 block text-xs font-bold uppercase tracking-wider mb-4">Live Preview</Text>
              
              <Card
                className="shadow-md rounded-2xl border border-slate-100 overflow-hidden flex flex-col h-full bg-white relative"
                styles={{ body: { padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' } }}
              >
                <div className="flex items-center justify-between mb-4">
                  <Tag color={getLevelTagColor(watchLevel || 'Beginner')} className="font-semibold px-2 py-0.5 rounded-md border-none uppercase text-3xs m-0">
                    {watchLevel || 'Beginner'}
                  </Tag>
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{watchCategory || 'Programming'}</span>
                </div>
                
                <Title level={4} className="m-0 text-slate-800 font-bold tracking-tight line-clamp-2 mb-2 min-h-[48px]">
                  {watchTitle || 'Untitled Course Curriculum'}
                </Title>
                
                <Paragraph className="text-slate-400 text-xs leading-relaxed mt-1 flex-grow line-clamp-3 mb-6 min-h-[54px] whitespace-pre-wrap">
                  {watchDescription || 'Fill in the description fields to preview the course card snippet in real time.'}
                </Paragraph>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                  <div className="flex items-center gap-2">
                    <Avatar size="small" icon={<UserOutlined />} className="bg-indigo-100 text-indigo-600" />
                    <span className="text-slate-500 font-semibold text-xs">Instructor</span>
                  </div>
                  <span className="font-extrabold text-indigo-600 text-lg">
                    ${watchPrice !== undefined && watchPrice !== null ? watchPrice : '0'}
                  </span>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}