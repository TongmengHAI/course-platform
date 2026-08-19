# 📚 Course Management UI — Zero to Completed

A step-by-step guide for building the Course Catalog, Detail Page, and Creator/Editor Form template inside the **Online Course Platform** frontend.

> **Stack:** React 19 · Ant Design (`antd`) · Axios · React Router DOM
> **You will build:** `CourseCatalogPage.jsx`, `CourseDetailPage.jsx`, `CourseEditorPage.jsx` and configure their routes.
> **You will learn:** Fetching listings from APIs, applying search queries and filters, using React Router path parameters, and building Ant Design Forms.
## 👥 Access Matrix & Roles

Here is a breakdown of what each user role is permitted to perform in the course management flow:

| Role | Browse Catalog (`/courses`) | View Detail (`/courses/:id`) | Create Course | Edit Course | UI Page Views |
|---|:---:|:---:|:---:|:---:|---|
| **Guest (Unauthenticated)** | ❌ | ❌ | ❌ | ❌ | Redirected to `/login` |
| **Student** | ✅ | ✅ | ❌ | ❌ | `CourseCatalogPage`, `CourseDetailPage` |
| **Instructor** | ✅ | ✅ | ✅ (Own) | ✅ (Own) | All catalog views + `CourseEditorPage` |
| **Admin** | ✅ | ✅ | ✅ (All) | ✅ (All) | All catalog views + `CourseEditorPage` |

> [!NOTE]
> Instructors are authorized to create and manage their own courses on the database level, while Admins have permission to manage all courses globally.

---

## 📚 Table of Contents

1. [Access Matrix & Roles](#-access-matrix--roles)
2. [Part A — Setting Up Routes & Navigation](#part-a---setting-up-routes--navigation)
3. [Part B — Building the Course Catalog Page](#part-b---building-the-course-catalog-page)
4. [Part C — Building the Course Detail Page](#part-c---building-the-course-detail-page)
5. [Part D — Building the Course Editor Page (Create & Edit)](#part-d---building-the-course-editor-page-create--edit)
6. [Part E — Listing Owned Courses on Instructor Dashboard](#part-e---listing-owned-courses-on-instructor-dashboard)
7. [Common Errors & Fixes](#common-errors--fixes)
8. [Completion Checklist](#completion-checklist)

## Part A — Setting Up Routes & Navigation

We map routes to link users to the catalog and editor views.

### Step A.1 — Configure Route Mappings in `AppRoutes.jsx`
Open `src/routes/AppRoutes.jsx` and import/register the catalog, detail, and editor pages.

`src/routes/AppRoutes.jsx`
```jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import StudentDashboardPage from '../pages/StudentDashboardPage';
import InstructorDashboardPage from '../pages/InstructorDashboardPage';

// Import newly built pages
import CourseCatalogPage from '../pages/CourseCatalogPage';
import CourseDetailPage from '../pages/CourseDetailPage';
import CourseEditorPage from '../pages/CourseEditorPage';
import Navbar from '../components/Navbar';

export default function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes for Student & All roles */}
        <Route element={<ProtectedRoute allowedRoles={["student", "instructor", "admin"]} />}>
          <Route path="/courses" element={<CourseCatalogPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/student/dashboard" element={<StudentDashboardPage />} />
        </Route>

        {/* Protected Routes for Instructor only */}
        <Route element={<ProtectedRoute allowedRoles={["instructor", "admin"]} />}>
          <Route path="/instructor/dashboard" element={<InstructorDashboardPage />} />
          <Route path="/admin/dashboard" element={<InstructorDashboardPage />} />
          <Route path="/instructor/courses/new" element={<CourseEditorPage />} />
          <Route path="/instructor/courses/edit/:id" element={<CourseEditorPage />} />
        </Route>

        {/* Fallback routing */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
```

### Step A.2 — Integrate Catalog link in `Navbar.jsx`
Update the Logo brand link to direct authenticated users to the courses page, and add a "Browse Courses" tab in the navbar.

`src/components/Navbar.jsx`
```jsx
// Open src/components/Navbar.jsx and update the logo link destination and add "Browse Courses":
return (
  <Header className="bg-white/85 backdrop-blur-md sticky top-0 z-50 px-6 md:px-12 flex justify-between items-center shadow-xs border-b border-slate-100 h-16 w-full">
    {/* 1. Direct logged-in users to catalog instead of login */}
    <Link to={isAuthenticated ? "/courses" : "/login"} className="text-xl font-bold text-indigo-600 flex items-center gap-2 tracking-tight">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600">
        <BookOutlined />
      </div>
      <span className="font-heading font-extrabold text-slate-800 text-lg">CoursePlatform</span>
    </Link>

    <div>
      {/* 2. Show navigation tab when logged in */}
      {isAuthenticated && (
        <Link to="/courses" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition ml-8">
          Browse Courses
        </Link>
      )}
```

---

## Part B — Building the Course Catalog Page

The Catalog fetches courses from `GET /courses` and allows students to filter by skill level and search titles/descriptions.

`src/pages/CourseCatalogPage.jsx`
```jsx
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
```

---

## Part C — Building the Course Detail Page

This fetches data for a single course via route ID parameters (`GET /courses/:id`). Enrollment rendering logic will be implemented here (see the Enrollments Guide).

`src/pages/CourseDetailPage.jsx`
```jsx
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
```

---

## Part D — Building the Course Editor Page (Create & Edit)

This page handles both Course Creation and Editing based on whether an `id` path parameter is present in the URL.

`src/pages/CourseEditorPage.jsx`
```jsx
import React, { useEffect, useState } from 'react';
import { Card, Form, Input, InputNumber, Select, Button, Spin, message, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const { Title } = Typography;
const { Option } = Select;

export default function CourseEditorPage() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  if (loading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-10 px-6 md:px-12 text-left">
      <div className="max-w-2xl mx-auto animate-fadeIn">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/instructor/dashboard')} 
          className="mb-6 rounded-xl font-bold h-10 border-slate-200 text-slate-600 cursor-pointer"
        >
          Back to Dashboard
        </Button>

        <Card className="shadow-xs rounded-2xl border border-slate-100/80 p-6 md:p-8 bg-white">
          <Title level={3} className="font-extrabold text-slate-800 tracking-tight mt-0 mb-6">
            {isEditMode ? "Edit Course Information" : "Create New Course"}
          </Title>

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
      </div>
    </div>
  );
}
```

---

## Part E — Listing Owned Courses on Instructor Dashboard

Modify the Instructor Dashboard page to load courses created by this instructor using the URL query parameter `?instructorId=X` and render them in a clean Ant Design table with edit routes.

`src/pages/InstructorDashboardPage.jsx`
```jsx
import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Row, Col, Avatar, Table, Space, Spin, Tag } from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined, LogoutOutlined, BookOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const { Title, Paragraph, Text } = Typography;

export default function InstructorDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreatedCourses = async () => {
      try {
        // Admins can manage all courses globally; Instructors manage only their own
        const params = {};
        if (user?.role !== 'admin' && user?.id) {
          params.instructorId = user.id;
        }

        const response = await api.get('/courses', { params });
        setCourses(response.data || []);
      } catch (err) {
        console.error("Error loading owned courses:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchCreatedCourses();
  }, [user]);

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
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-900 text-white rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
          <div className="flex items-center gap-4 z-10">
            <Avatar size={64} icon={<UserOutlined />} className="bg-white/20 border border-white/30 text-white shadow-sm" />
            <div>
              <Title level={3} className="m-0 text-white font-extrabold tracking-tight" style={{ color: 'white' }}>
                Welcome back, {user?.username}!
              </Title>
              <Text className="text-indigo-200 text-xs block mt-1">{user?.role === 'admin' ? "Manage and edit all platform course curricula tracks (Admin mode)." : "Manage and edit your course curricula tracks."}</Text>
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

        {/* Action Toolbar */}
        <div className="flex justify-between items-center mb-6">
          <Title level={4} className="font-bold text-slate-800 m-0 tracking-tight">Course Administration</Title>
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
```

---

## Common Errors & Fixes

| Symptom | Cause | Remedy |
|---|---|---|
| Level select filter resets page listings incorrectly | API query parameter expects matching case levels ("Beginner", not "beginner"). | Keep key Option values mapped exact match string casing in API expectations. |
| Non-Instructors can type Editor URL and access form | Routing permissions are not properly guarded. | Verify path routes `/instructor/*` are wrapped by `ProtectedRoute` specifying `allowedRoles={["instructor"]}`. |

---

## Completion Checklist

- [ ] Registered routing links inside `src/routes/AppRoutes.jsx` for all pages.
- [ ] Added navigation header tabs linking back to the Catalog page.
- [ ] Programmed catalog listings containing search and dropdown inputs.
- [ ] Created detail layouts showing instructor, price details, and level labels.
- [ ] Coded form bindings adapting dynamic values depending on mode checks.
- [ ] Tested security route guards blocking students trying to edit courses.
