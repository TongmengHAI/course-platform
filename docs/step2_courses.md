# 📚 Course Management UI — Zero to Completed

A step-by-step guide for building the Course Catalog, Detail Page, and Creator/Editor Form template inside the **Online Course Platform** frontend.

> **Stack:** React 19 · Ant Design (`antd`) · Axios · React Router DOM
> **You will build:** `CourseCatalogPage.jsx`, `CourseDetailPage.jsx`, `CourseEditorPage.jsx` and configure their routes.
> **You will learn:** Fetching listings from APIs, applying search queries and filters, using React Router path parameters, and building Ant Design Forms.

---

## 📚 Table of Contents

1. [Part A — Setting Up Routes & Navigation](#part-a---setting-up-routes--navigation)
2. [Part B — Building the Course Catalog Page](#part-b---building-the-course-catalog-page)
3. [Part C — Building the Course Detail Page](#part-c---building-the-course-detail-page)
4. [Part D — Building the Course Editor Page (Create & Edit)](#part-d---building-the-course-editor-page-create--edit)
5. [Common Errors & Fixes](#common-errors--fixes)
6. [Completion Checklist](#completion-checklist)

---

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
Add a "Browse Courses" tab in the navbar visible to all authenticated accounts.

`src/components/Navbar.jsx`
```jsx
// Add adjacent to your logo brand inside Navbar.jsx return statement:
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
import { Card, Input, Select, Row, Col, Typography, Spin, Button } from 'antd';
import { SearchOutlined, BookOutlined } from '@ant-design/icons';
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

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-10 px-6 md:px-12 text-left animate-fadeIn">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Title level={2} className="font-bold text-slate-800 m-0">Course Catalog</Title>
          <Text className="text-slate-500">Explore learning material led by domain experts</Text>
        </div>

        {/* Toolbar Filter panel */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <Input
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Search courses..."
            allowClear
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md h-10"
          />
          <Select
            placeholder="Filter by Level"
            allowClear
            onChange={setLevel}
            className="w-48 h-10"
          >
            <Option value="Beginner">Beginner</Option>
            <Option value="Intermediate">Intermediate</Option>
            <Option value="Advanced">Advanced</Option>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spin size="large" /></div>
        ) : (
          <Row gutter={[24, 24]}>
            {courses.map((course) => (
              <Col xs={24} sm={12} lg={8} key={course.id}>
                <Card
                  hoverable
                  className="shadow-xs rounded-2xl border border-slate-100 overflow-hidden hover-lift flex flex-col h-full"
                  bodyStyle={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded text-xs uppercase">{course.level || 'All Levels'}</span>
                    <span className="text-slate-400 text-xs">{course.category}</span>
                  </div>
                  <Title level={4} className="m-0 text-slate-800 font-bold line-clamp-1">{course.title}</Title>
                  <Paragraph className="text-slate-500 text-sm mt-2 flex-grow line-clamp-2">{course.description}</Paragraph>
                  <div className="border-t border-slate-50 pt-3 mt-4 flex items-center justify-between">
                    <Text className="font-bold text-lg text-indigo-600">${course.price || 0}</Text>
                    <Button type="link" className="font-semibold p-0">View Course →</Button>
                  </div>
                </Card>
              </Col>
            ))}
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
import { Card, Button, Spin, Typography, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
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

  if (loading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;
  if (!course) return <div className="text-center py-20"><Text type="danger">Course not found</Text></div>;

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-10 px-6 md:px-12 text-left">
      <div className="max-w-4xl mx-auto">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/courses')} className="mb-6 rounded-lg font-semibold">
          Back to Catalog
        </Button>

        <Card className="shadow-xs rounded-2xl border border-slate-100 p-4 bg-white animate-fadeIn">
          <div className="flex items-center gap-3 mb-4">
            <Tag color="indigo" className="m-0 font-semibold px-2 py-0.5 rounded text-xs uppercase">{course.level}</Tag>
            <Tag className="m-0 text-slate-500 font-semibold px-2 py-0.5 rounded text-xs uppercase">{course.category}</Tag>
          </div>

          <Title level={2} className="font-extrabold text-slate-800 m-0 mb-4">{course.title}</Title>
          <Paragraph className="text-slate-600 text-base leading-relaxed mb-6 whitespace-pre-wrap">{course.description}</Paragraph>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-8">
            <div>
              <Text className="text-slate-400 block text-xs font-semibold uppercase tracking-wider">Instructor</Text>
              <Text className="font-bold text-slate-700 text-base">{course.instructor?.username || 'Unknown'}</Text>
            </div>
            <div>
              <Text className="text-slate-400 block text-xs font-semibold uppercase tracking-wider">Course Fee</Text>
              <Text className="font-extrabold text-2xl text-indigo-600">${course.price}</Text>
            </div>
          </div>
        </Card>
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
      <div className="max-w-2xl mx-auto">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/instructor/dashboard')} className="mb-6 rounded-lg font-semibold">
          Back to Dashboard
        </Button>

        <Card className="shadow-xs rounded-2xl border border-slate-100 p-4">
          <Title level={3} className="font-bold text-slate-800 mt-0 mb-6">
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
              label={<span className="font-semibold text-slate-600">Course Title</span>}
              rules={[{ required: true, message: "Please enter the course title!" }]}
            >
              <Input placeholder="e.g., Introduction to React & Tailwind" />
            </Form.Item>

            <Form.Item
              name="description"
              label={<span className="font-semibold text-slate-600">Course Description</span>}
              rules={[{ required: true, message: "Please enter the course description!" }]}
            >
              <Input.TextArea rows={5} placeholder="Describe the topics covered and syllabus modules..." />
            </Form.Item>

            <Form.Item
              name="category"
              label={<span className="font-semibold text-slate-600">Category</span>}
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
              label={<span className="font-semibold text-slate-600">Course Difficulty Level</span>}
              rules={[{ required: true, message: "Please select a difficulty level!" }]}
            >
              <Select placeholder="Choose target level">
                <Option value="Beginner">Beginner</Option>
                <Option value="Intermediate">Intermediate</Option>
                <Option value="Advanced">Advanced</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="price"
              label={<span className="font-semibold text-slate-600">Price (USD)</span>}
              rules={[{ required: true, message: "Please enter a course fee!" }]}
              initialValue={0}
            >
              <InputNumber min={0} className="w-full" formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
            </Form.Item>

            <Form.Item className="mt-8 mb-2">
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                icon={<SaveOutlined />}
                block
                className="bg-indigo-600 hover:bg-indigo-700 border-none h-12 text-base rounded-xl cursor-pointer"
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
