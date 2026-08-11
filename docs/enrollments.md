# 🎓 Enrollment & Dashboard UI — Zero to Completed

A step-by-step guide for integrating the Enrollment API trigger and updating Student and Instructor dashboards in the **Online Course Platform** frontend.

> **Stack:** React 19 · Ant Design (`antd`) · Axios
> **You will update:** `CourseDetailPage.jsx` (Enrollment button), `StudentDashboardPage.jsx` (learning list), and `InstructorDashboardPage.jsx` (owned courses catalog table).
> **You will learn:** Fetching associated relationship data, rendering lists, binding API mutation actions to UI clicks, and handling empty states.

---

## 📚 Table of Contents

1. [Part A — Adding "Enroll Now" to the Course Detail Page](#part-a---adding-enroll-now-to-the-course-detail-page)
2. [Part B — Loading Enrolled Courses on Student Dashboard](#part-b---loading-enrolled-courses-on-student-dashboard)
3. [Part C — Listing Owned Courses on Instructor Dashboard](#part-c---listing-owned-courses-on-instructor-dashboard)
4. [Testing the Enrollment UI Flow](#testing-the-enrollment-ui-flow)
5. [Common Errors & Fixes](#common-errors--fixes)
6. [Completion Checklist](#completion-checklist)

---

## Part A — Adding "Enroll Now" to the Course Detail Page

Open `src/pages/CourseDetailPage.jsx`. We need to:
1. Access the logged-in user's role from `useAuth()`.
2. Add a `handleEnroll` handler that calls `POST /enrollments` with the current course ID.
3. Render an **"Enroll Now"** button if the user is a **Student**.

`src/pages/CourseDetailPage.jsx`
```jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spin, Typography, Tag, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext'; // ⬅️ Import useAuth

const { Title, Paragraph, Text } = Typography;

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // ⬅️ Get user state
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false); // ⬅️ Local loading state

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

  // ⬅️ Enrollment handler
  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await api.post('/enrollments', { courseId: course.id });
      message.success("Successfully enrolled in course!");
      navigate('/student/dashboard');
    } catch (err) {
      console.error("Enrollment failed:", err);
      // Errors (like "Already enrolled") are handled by Axios response interceptor toasts
    } finally {
      setEnrolling(false);
    }
  };

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
            
            {/* ⬅️ Conditionally render Enroll button for students */}
            {user?.role === 'student' && (
              <Button
                type="primary"
                size="large"
                loading={enrolling}
                onClick={handleEnroll}
                className="bg-indigo-600 hover:bg-indigo-700 border-none font-bold rounded-xl h-12 shadow-sm cursor-pointer"
              >
                Enroll Now
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
```

---

## Part B — Loading Enrolled Courses on Student Dashboard

Modify the Student Dashboard to fetch the enrolled courses list from `GET /enrollments/my-courses` on mount, showing cards for each class.

`src/pages/StudentDashboardPage.jsx`
```jsx
import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Row, Col, Statistic, Avatar, Spin } from 'antd';
import { BookOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const { Title, Paragraph, Text } = Typography;

export default function StudentDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const response = await api.get('/enrollments/my-courses');
        setCourses(response.data || []);
      } catch (err) {
        console.error("Dashboard courses load failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-10 px-6 md:px-12 text-left">
      <div className="max-w-6xl mx-auto animate-fadeIn">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-4">
            <Avatar size={64} icon={<UserOutlined />} className="bg-indigo-600 shadow-md" />
            <div>
              <Title level={3} className="m-0 text-slate-800 font-bold">Welcome back, {user?.username}!</Title>
              <Paragraph className="text-slate-500 m-0">Role: <span className="font-semibold text-indigo-600 uppercase">{user?.role}</span></Paragraph>
            </div>
          </div>
          <Button type="primary" danger icon={<LogoutOutlined />} onClick={() => { logout(); navigate('/login'); }} className="rounded-xl font-semibold h-11 border-none hover:opacity-90 cursor-pointer">
            Sign Out
          </Button>
        </div>

        {/* Dashboard Statistics */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={12}>
            <Card className="shadow-xs rounded-xl border border-slate-100">
              <Statistic
                title={<span className="text-slate-400 font-semibold uppercase tracking-wider text-xs">Active Enrolled Courses</span>}
                value={courses.length}
                prefix={<BookOutlined className="text-indigo-500 mr-2" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card className="shadow-xs rounded-xl border border-slate-100 bg-indigo-600 text-white">
              <h3 className="m-0 text-white font-bold text-lg">Explore Catalog</h3>
              <p className="text-indigo-100 text-xs mt-1 mb-4">Register in fresh courses to enhance your technical knowledge.</p>
              <Button onClick={() => navigate('/courses')} className="bg-white hover:bg-slate-50 text-indigo-600 font-bold border-none rounded-lg h-9 shadow-sm cursor-pointer">
                Browse Courses
              </Button>
            </Card>
          </Col>
        </Row>

        <Title level={4} className="font-bold text-slate-800 mb-4">My Learning List</Title>

        {loading ? (
          <div className="flex justify-center py-10"><Spin size="large" /></div>
        ) : (
          <Row gutter={[24, 24]}>
            {courses.length === 0 ? (
              <Col span={24}>
                <Card className="text-center py-12 border border-dashed border-slate-200">
                  <Text className="text-slate-400 block mb-4">You are not enrolled in any courses yet.</Text>
                  <Button type="primary" onClick={() => navigate('/courses')} className="bg-indigo-600 hover:bg-indigo-700 border-none rounded-lg font-semibold">Start Learning</Button>
                </Card>
              </Col>
            ) : (
              courses.map((course) => (
                <Col xs={24} sm={12} lg={8} key={course.id}>
                  <Card className="shadow-xs rounded-xl border border-slate-100 flex flex-col h-full hover:shadow-md transition">
                    <Title level={5} className="m-0 font-bold text-slate-800">{course.title}</Title>
                    <Paragraph className="text-slate-500 text-xs mt-2 line-clamp-2">{course.description}</Paragraph>
                    <div className="border-t border-slate-50 pt-3 mt-4 flex items-center justify-between">
                      <span className="text-xs text-slate-400">By {course.instructor?.username || 'Instructor'}</span>
                      <Button type="primary" size="small" onClick={() => navigate(`/courses/${course.id}`)} className="bg-indigo-600 border-none rounded-md font-semibold text-xs cursor-pointer">Enter Course</Button>
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

## Part C — Listing Owned Courses on Instructor Dashboard

Modify the Instructor Dashboard page to load courses created by this instructor using the URL query parameter `?instructorId=X` and render them in a clean Ant Design table with edit routes.

`src/pages/InstructorDashboardPage.jsx`
```jsx
import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Row, Col, Avatar, Table, Space, Spin } from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined, LogoutOutlined } from '@ant-design/icons';
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
        const response = await api.get('/courses', { params: { instructorId: user?.id } });
        setCourses(response.data || []);
      } catch (err) {
        console.error("Error loading owned courses:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchCreatedCourses();
  }, [user]);

  const columns = [
    {
      title: 'Course Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span className="font-bold text-slate-700">{text}</span>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (val) => `$ ${val}`,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => navigate(`/instructor/courses/edit/${record.id}`)} className="rounded-md font-semibold text-xs flex items-center">
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-10 px-6 md:px-12 text-left">
      <div className="max-w-6xl mx-auto animate-fadeIn">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-4">
            <Avatar size={64} icon={<UserOutlined />} className="bg-indigo-600 shadow-md" />
            <div>
              <Title level={3} className="m-0 text-slate-800 font-bold">Welcome back, {user?.username}!</Title>
              <Paragraph className="text-slate-500 m-0">Role: <span className="font-semibold text-indigo-600 uppercase">{user?.role}</span></Paragraph>
            </div>
          </div>
          <Button type="primary" danger icon={<LogoutOutlined />} onClick={() => { logout(); navigate('/login'); }} className="rounded-xl font-semibold h-11 border-none hover:opacity-90 cursor-pointer">
            Sign Out
          </Button>
        </div>

        {/* Action Toolbar */}
        <div className="flex justify-between items-center mb-6">
          <Title level={4} className="font-bold text-slate-800 m-0">Course Administration</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/instructor/courses/new')} className="bg-indigo-600 hover:bg-indigo-700 border-none font-bold rounded-lg px-4 h-10 cursor-pointer flex items-center">
            New Course
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spin size="large" /></div>
        ) : (
          <Card className="shadow-xs border border-slate-100 rounded-xl overflow-hidden p-0">
            <Table
              dataSource={courses}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
```

---

## Testing the Enrollment UI Flow

1. Log in as a **student**.
2. Go to **Browse Courses** in the Navbar navigation.
3. Click a course card to go to the Details page.
4. Click **Enroll Now**.
   - Verify that you see a success toast message.
   - Verify that you are redirected to the Student Dashboard.
   - Check "My Learning List" to verify the enrolled course is listed as a card.

---

## Common Errors & Fixes

| Symptom | Cause | Remedy |
|---|---|---|
| Student logs in but dashboard displays endless loading spinner | API endpoint `/enrollments/my-courses` is failing or returned an error. | Open browser console network tab; verify authorization token header has valid bearer token. |
| Clicking "Enroll Now" repeatedly shows network errors | Double-clicking creates concurrent requests; the second request fails because of unique constraint checks. | Add `enrolling` state hook to disable button while request is pending. |
| Table row key console errors | Missing unique key values in dataset. | Map `rowKey="id"` inside table component bindings. |

---

## Completion Checklist

- [ ] Attached user role selectors to render conditional buttons in `CourseDetailPage.jsx`.
- [ ] Programmed enrollment handlers to make API POST calls with target parameters.
- [ ] Programmed queries fetching active learning elements on Student Dashboard.
- [ ] Integrated empty-state fallbacks routing student accounts to the Catalog view.
- [ ] Connected custom query parameters filtering created lists in Instructor Dashboard.
- [ ] Rendered listing tables supporting pagination and custom edit action buttons.
