# Step 7 - Instructor Advanced Features (Frontend)

This step adds the instructor side of the platform after the student flow is already working.

At this level, the frontend should feel like a real course management dashboard, not just a simple admin page. Instructors need to see their own course performance, manage content, and keep the course experience organized.

> Stack: React 19 · Ant Design · Axios · React Router
> You will build: instructor dashboard summary, student list, course editor flow, and publish controls.
> You will learn: role-based access, summary cards, content editing UI, and clean workflow design.

---

## 1. What this step is about

The instructor can do the following:

1. Open the instructor dashboard
2. See summary cards such as total courses and enrollments
3. List their created courses
4. Open the course editor to update title, description, category, and price
5. Add new sections and lessons
6. Publish or draft a course
7. See and manage only their own courses

This step is intentionally advanced and should come after the student flow is stable.

---

## 2. Instructor dashboard flow

A simple frontend flow looks like this:

1. Instructor logs in.
2. App routes to `/instructor/dashboard`.
3. Dashboard fetches `GET /instructor/dashboard`.
4. Dashboard displays summary cards.
5. Instructor opens a course to edit or review.
6. Instructor updates the curriculum or publish state.
7. App goes back to the dashboard.

This flow should feel organized and simple, not crowded.

---

## 3. Frontend rules

- Only `instructor` and `admin` can access instructor pages.
- Students should not see instructor-only pages or actions.
- Instructors should see only their own courses unless they are admin.
- Keep loading and empty states for each summary card and table.
- Use simple forms and one clear action per section.
- Do not over-design the curriculum editor before the core flow works.

---

## 4. Full frontend implementation

### 4.1 Instructor dashboard page

This is the real implementation pattern used in the app.

File to create or update: `src/pages/InstructorDashboardPage.jsx`

```jsx
import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Row, Col, Avatar, Table, Space, Spin, Tag } from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const { Title, Text } = Typography;

export default function InstructorDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreatedCourses = async () => {
      try {
        const params = {};

        if (user?.role !== 'admin' && user?.id) {
          params.instructorId = user.id;
        }

        const response = await api.get('/courses', { params });
        setCourses(response.data || []);
      } catch (err) {
        console.error('Error loading owned courses:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchCreatedCourses();
    }
  }, [user]);

  const getLevelTagColor = (level) => {
    if (level === 'Beginner') return 'success';
    if (level === 'Intermediate') return 'processing';
    return 'warning';
  };

  const columns = [
    {
      title: 'Course Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span className="font-bold text-slate-800 text-sm">{text}</span>
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <span className="text-slate-500 font-medium text-xs">{text || 'N/A'}</span>
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (level) => (
        <Tag color={getLevelTagColor(level)} className="font-semibold uppercase text-3xs border-none rounded-md px-2 py-0.5 m-0">
          {level || 'All Levels'}
        </Tag>
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (val) => <span className="font-bold text-slate-700 text-sm">${val || 0}</span>
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
      )
    }
  ];

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-10 px-6 md:px-12 text-left">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-900 text-white rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 z-10">
            <Avatar size={64} icon={<UserOutlined />} className="bg-white/20 border border-white/30 text-white shadow-sm" />
            <div>
              <Title level={3} className="m-0 text-white font-extrabold tracking-tight" style={{ color: 'white' }}>
                Welcome back, {user?.username}!
              </Title>
              <Text className="text-indigo-200 text-xs block mt-1">
                {user?.role === 'admin' ? 'Manage and edit all platform courses.' : 'Manage and edit your course curriculum.'}
              </Text>
            </div>
          </div>

          <Button
            type="default"
            icon={<LogoutOutlined />}
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl font-semibold h-10 px-5 cursor-pointer z-10"
            style={{ color: 'white' }}
          >
            Sign Out
          </Button>
        </div>

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

This is a practical dashboard for a bootcamp project: simple, clear, and functional.

---

### 4.2 Course editor page

This page is used for both create and edit course details. The instructor fills in title, description, category, and price.

File to create or update: `src/pages/CourseEditorPage.jsx`

```jsx
import React, { useEffect, useState } from 'react';
import { Card, Form, Input, InputNumber, Select, Button, Spin, message, Typography, Row, Col, Tag } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

export default function CourseEditorPage() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
          console.error('Error loading course details:', err);
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
        message.success('Course updated successfully!');
      } else {
        await api.post('/courses', values);
        message.success('Course created successfully!');
      }

      navigate('/instructor/dashboard');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save course');
    } finally {
      setSubmitting(false);
    }
  };

  const getLevelTagColor = (level) => {
    if (level === 'Beginner') return 'success';
    if (level === 'Intermediate') return 'processing';
    return 'warning';
  };

  if (loading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-10 px-6 md:px-12 text-left">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/instructor/dashboard')}
            className="rounded-xl font-bold h-10 border-slate-200 text-slate-600 cursor-pointer shadow-xs"
          >
            Back
          </Button>
          <Title level={3} className="m-0 font-extrabold text-slate-800 tracking-tight">
            {isEditMode ? 'Edit Course Details' : 'Create New Course'}
          </Title>
        </div>

        <Row gutter={[32, 32]}>
          <Col xs={24} lg={15}>
            <Card className="shadow-xs rounded-2xl border border-slate-100/80 p-4 md:p-6 bg-white">
              <Form form={form} onFinish={onFinish} layout="vertical" size="large" requiredMark={false}>
                <Form.Item
                  name="title"
                  label={<span className="font-bold text-slate-700 text-xs">Course Title</span>}
                  rules={[{ required: true, message: 'Please enter the course title!' }]}
                >
                  <Input placeholder="e.g., Introduction to React & Tailwind" className="rounded-xl" />
                </Form.Item>

                <Form.Item
                  name="description"
                  label={<span className="font-bold text-slate-700 text-xs">Course Description</span>}
                  rules={[{ required: true, message: 'Please enter the course description!' }]}
                >
                  <Input.TextArea rows={5} placeholder="Describe what students will learn..." className="rounded-xl" />
                </Form.Item>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Form.Item
                    name="category"
                    label={<span className="font-bold text-slate-700 text-xs">Category</span>}
                    rules={[{ required: true, message: 'Please select a category!' }]}
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
                    rules={[{ required: true, message: 'Please select a difficulty level!' }]}
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
                  rules={[{ required: true, message: 'Please enter a course fee!' }]}
                  initialValue={0}
                >
                  <InputNumber
                    min={0}
                    className="w-full rounded-xl"
                    formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|[,]/g, '')}
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

          <Col xs={24} lg={9}>
            <div className="sticky top-24">
              <Text className="text-slate-400 block text-xs font-bold uppercase tracking-wider mb-4">Live Preview</Text>

              <Card className="shadow-md rounded-2xl border border-slate-100 overflow-hidden bg-white">
                <div className="flex items-center justify-between mb-4">
                  <Tag color={getLevelTagColor(watchLevel || 'Beginner')} className="font-semibold px-2 py-0.5 rounded-md border-none uppercase text-3xs m-0">
                    {watchLevel || 'Beginner'}
                  </Tag>
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{watchCategory || 'Programming'}</span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-800 mb-2">{watchTitle || 'Course Title'}</h3>
                <p className="text-sm text-slate-600 leading-6">
                  {watchDescription || 'This is where a short course description will appear.'}
                </p>

                <div className="mt-5 flex justify-between items-center border-t border-slate-100 pt-4">
                  <span className="text-xs uppercase tracking-wider text-slate-400">Price</span>
                  <span className="text-lg font-extrabold text-indigo-600">
                    ${watchPrice || 0}
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
```

This page keeps the course editor simple, clear, and classroom friendly.

---

### 4.3 Curriculum editor pattern

This is the next advanced step after course details. The instructor can add sections and lessons in a very simple form.

File to create: `src/components/CurriculumEditor.jsx`

```jsx
import React, { useState } from 'react';
import { Button, Input, Card, Form, message, Space } from 'antd';
import api from '../services/api';

const CurriculumEditor = ({ courseId }) => {
  const [sections, setSections] = useState([]);
  const [sectionTitle, setSectionTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const addSection = async () => {
    if (!sectionTitle.trim()) {
      message.warning('Please enter a section title');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(`/courses/${courseId}/sections`, {
        title: sectionTitle,
        sort_order: sections.length + 1
      });

      setSections((prev) => [...prev, res.data.data]);
      setSectionTitle('');
      message.success('Section added');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to add section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Curriculum" style={{ marginTop: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input
          value={sectionTitle}
          onChange={(e) => setSectionTitle(e.target.value)}
          placeholder="Section title"
        />
        <Button type="primary" onClick={addSection} loading={loading}>
          Add Section
        </Button>

        {sections.map((section) => (
          <Card key={section.id} size="small" style={{ marginTop: 8 }}>
            <strong>{section.title}</strong>
          </Card>
        ))}
      </Space>
    </Card>
  );
};

export default CurriculumEditor;
```

This is a good beginner-friendly version of a curriculum editor.

---

### 4.4 Publish toggle pattern

```jsx
const handlePublish = async (courseId, nextStatus) => {
  try {
    await api.patch(`/courses/${courseId}/publish`, {
      is_published: nextStatus,
    });

    message.success(nextStatus ? 'Course published' : 'Course moved to draft');
  } catch (err) {
    message.error(err.response?.data?.message || 'Failed to update course status');
  }
};
```

The UI can then render a button like:

```jsx
<Button onClick={() => handlePublish(course.id, true)}>
  Publish
</Button>
```

---

## 5. UX/UI notes for beginners

- Use summary cards instead of too much raw data.
- Keep the dashboard simple and readable.
- Show empty states when there are no courses or students.
- Use one main action per card: edit or publish.
- Keep buttons and text large enough for mobile screens.
- Keep the curriculum editor vertical and easy to understand.

---

## 6. Critical beginner mistakes to avoid

- Showing instructor links to students.
- Allowing instructors to edit another teacher's course.
- Forgetting to hide edit controls for the wrong course.
- Using a very complex editor before the basic flow works.
- Not handling loading and empty states.
- Mixing backend logic into the frontend page.

---

## 7. Testing checklist

- [ ] Instructor can open the dashboard
- [ ] Dashboard shows summary cards and course list
- [ ] Instructor sees their own courses only
- [ ] Course editor opens for create and edit
- [ ] Course can be saved successfully
- [ ] Section can be added
- [ ] Lesson can be added under the section
- [ ] Course can be published or moved back to draft
- [ ] Student cannot access instructor pages

## 8. Completion checklist

- [ ] Instructor dashboard page created
- [ ] Summary cards and tables implemented
- [ ] Course editor works for create and edit
- [ ] Curriculum editor pattern added
- [ ] Publish/draft flow implemented
- [ ] Role-based access enforced
- [ ] Simple and clean UI kept for classroom use

This step is an advanced extension after the student flow is stable. It makes the platform feel more realistic and business-ready without making the UI too complicated.
