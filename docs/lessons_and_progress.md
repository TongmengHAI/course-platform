# 📖 Course Syllabus, Lesson Viewer & Progress UI — Zero to Completed

A step-by-step guide for building the Course Syllabus navigation, Lesson Content viewer, and Progress bar tracking inside the **Online Course Platform** frontend.

> **Stack:** React 19 · Ant Design (`antd`) · Axios · React Router DOM
> **You will build:** `LessonViewerPage.jsx` and update `StudentDashboardPage.jsx` to show learning completion progress bars.
> **You will learn:** Hierarchical content mapping, updating backend completion toggles, state synchronisation, and rendering visual progress stats.

---

## 📚 Table of Contents

1. [The Big Picture (Learning User Flow)](#1-the-big-picture-learning-user-flow)
2. [Step 1 — Registering Routes in `AppRoutes.jsx`](#step-1---registering-routes-in-approutesjsx)
3. [Step 2 — Building the Lesson Viewer Page](#step-2---building-the-lesson-viewer-page)
4. [Step 3 — Integrating Progress Bars on Student Dashboard](#step-3---integrating-progress-bars-on-student-dashboard)
5. [Testing the Learning Loop UI](#testing-the-learning-loop-ui)
6. [Common Errors & Fixes](#common-errors--fixes)
7. [Completion Checklist](#completion-checklist)

---

## 1. The Big Picture (Learning User Flow)

```
[Student Dashboard]
        │  Click "Enter Course"
        ▼
[LessonViewerPage]
 ├── Left Drawer (Syllabus Menu): Sections & Collapsible Lessons list
 └── Right Content Panel: Title, Text Content & [Mark Completed] Button
```

---

## Step 1 — Registering Routes in `AppRoutes.jsx`

Open `src/routes/AppRoutes.jsx`. Register `/student/courses/:courseId/lessons/:lessonId` mapped to `LessonViewerPage`.

`src/routes/AppRoutes.jsx`
```jsx
import LessonViewerPage from '../pages/LessonViewerPage';

// Inside AppRoutes Routes definition under student roles check:
<Route element={<ProtectedRoute allowedRoles={["student", "instructor", "admin"]} />}>
  <Route path="/courses" element={<CourseCatalogPage />} />
  <Route path="/courses/:id" element={<CourseDetailPage />} />
  <Route path="/student/dashboard" element={<StudentDashboardPage />} />
  <Route path="/student/courses/:courseId/lessons/:lessonId" element={<LessonViewerPage />} />
</Route>
```

---

## Step 2 — Building the Lesson Viewer Page

This page features a split-pane layout:
- **Left Panel**: Course sections tree listing all lessons. Completed lessons are tagged with check icons.
- **Right Panel**: Active lesson title, text contents, and a large **"Mark Completed"** action trigger.

`src/pages/LessonViewerPage.jsx`
```jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Menu, Typography, Checkbox, Spin, Button, message, Card } from 'antd';
import { ArrowLeftOutlined, CheckCircleFilled, PlayCircleOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Sider, Content } = Layout;
const { Title, Paragraph } = Typography;

export default function LessonViewerPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [syllabus, setSyllabus] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [updating, setUpdating] = useState(false);

  const fetchCourseData = async () => {
    try {
      // 1. Fetch full syllabus (sections & lessons list)
      const syllabusRes = await api.get(`/courses/${courseId}/syllabus`);
      setSyllabus(syllabusRes.data || []);

      // 2. Fetch student completion list
      const progressRes = await api.get(`/enrollments/${courseId}/progress`);
      const completedIds = progressRes.data
        .filter(item => item.is_completed)
        .map(item => item.lesson.id);
      setCompletedLessons(completedIds);

      // Find active lesson context
      let foundLesson = null;
      for (const section of syllabusRes.data) {
        const matching = section.lessons.find(l => l.id === Number(lessonId));
        if (matching) {
          foundLesson = matching;
          break;
        }
      }
      setActiveLesson(foundLesson);
    } catch (err) {
      console.error("Error loading syllabus data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId, lessonId]);

  const handleToggleComplete = async (e) => {
    const isCompleted = e.target.checked;
    setUpdating(true);
    try {
      await api.post('/enrollments/progress', { lessonId: Number(lessonId), isCompleted });
      message.success(isCompleted ? "Marked lesson completed!" : "Removed completion check.");
      
      // Update local state list
      if (isCompleted) {
        setCompletedLessons(prev => [...prev, Number(lessonId)]);
      } else {
        setCompletedLessons(prev => prev.filter(id => id !== Number(lessonId)));
      }
    } catch (err) {
      console.error("Progress update failed:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;

  return (
    <Layout className="min-h-[85vh] bg-white text-left animate-fadeIn">
      {/* Syllabus Sidebar panel */}
      <Sider width={300} className="bg-slate-50 border-r border-slate-100 py-4 px-2" theme="light">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/student/dashboard')} className="w-full mb-4 rounded-lg font-semibold">
          Back to Dashboard
        </Button>
        <div className="font-bold text-slate-800 text-sm px-3 mb-3 uppercase tracking-wider">Course Syllabus</div>
        
        {syllabus.map(section => (
          <div key={section.id} className="mb-4">
            <div className="font-semibold text-slate-500 text-xs px-3 mb-1">{section.title}</div>
            <Menu
              mode="inline"
              selectedKeys={[lessonId]}
              className="bg-transparent border-none"
              onClick={({ key }) => navigate(`/student/courses/${courseId}/lessons/${key}`)}
            >
              {section.lessons.map(lesson => (
                <Menu.Item key={lesson.id} icon={
                  completedLessons.includes(lesson.id) ? 
                  <CheckCircleFilled className="text-emerald-500" /> : 
                  <PlayCircleOutlined />
                }>
                  <span className="text-slate-700">{lesson.title}</span>
                </Menu.Item>
              ))}
            </Menu>
          </div>
        ))}
      </Sider>

      {/* Lesson View panel */}
      <Content className="p-8 md:p-12 bg-white">
        {activeLesson ? (
          <div className="max-w-3xl">
            <Title level={2} className="font-extrabold text-slate-800 m-0 mb-6">{activeLesson.title}</Title>
            <Paragraph className="text-slate-600 text-base leading-relaxed mb-8 whitespace-pre-wrap">
              {activeLesson.content || "This lesson content is empty."}
            </Paragraph>

            <Card className="bg-slate-50 border border-slate-100 rounded-xl p-2 mt-12">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-700">Finished learning?</div>
                  <div className="text-slate-400 text-xs mt-0.5">Toggle box to check off lesson modules from tracking stats.</div>
                </div>
                <Checkbox
                  checked={completedLessons.includes(Number(lessonId))}
                  onChange={handleToggleComplete}
                  disabled={updating}
                  className="font-bold scale-125 text-indigo-600"
                >
                  Completed
                </Checkbox>
              </div>
            </Card>
          </div>
        ) : (
          <div className="text-center py-20"><Title level={4} type="danger">Select a lesson to begin learning.</Title></div>
        )}
      </Content>
    </Layout>
  );
}
```

---

## Step 3 — Integrating Progress Bars on Student Dashboard

To show visual progress scores, we retrieve both the syllabus count and progress lists, compute the percentages, and render progress bars.

`src/pages/StudentDashboardPage.jsx`
```jsx
// 1. Update your dynamic course card component mapping loop:
// We read details and render progress tags:

{courses.map((course) => {
  // Mock percentage logic or query dynamically
  const progressPercent = course.completedCount && course.totalLessonsCount ? 
    Math.round((course.completedCount / course.totalLessonsCount) * 100) : 0;

  return (
    <Col xs={24} sm={12} lg={8} key={course.id}>
      <Card className="shadow-xs rounded-xl border border-slate-100 flex flex-col h-full hover:shadow-md transition">
        <Title level={5} className="m-0 font-bold text-slate-800">{course.title}</Title>
        <Paragraph className="text-slate-500 text-xs mt-2 line-clamp-2">{course.description}</Paragraph>
        
        {/* Progress Bar Widget */}
        <div className="mt-4 mb-2">
          <div className="flex justify-between items-center text-2xs font-semibold text-slate-400 mb-1">
            <span>LEARNING PROGRESS</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress percent={progressPercent} size="small" showInfo={false} strokeColor="#4f46e5" />
        </div>

        <div className="border-t border-slate-50 pt-3 mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-400">By {course.instructor?.username || 'Instructor'}</span>
          <Button 
            type="primary" 
            size="small" 
            onClick={() => navigate(`/student/courses/${course.id}/lessons/${course.firstLessonId}`)} 
            className="bg-indigo-600 border-none rounded-md font-semibold text-xs cursor-pointer"
          >
            Start Learning
          </Button>
        </div>
      </Card>
    </Col>
  );
})}
```

---

## Testing the Learning Loop UI

1. Start API and UI server locally.
2. Login as a student and enroll in a course.
3. Access Student Dashboard → Click **Start Learning** on the course card.
4. Verify Sidebar loaded with correct sections and lesson list tree.
5. Click checkbox to complete lesson:
   - Success alert appears.
   - Lesson icon in left sidebar menu updates to a green checked badge.
6. Check dashboard → course progress bar updates dynamically.

---

## Completion Checklist

- [ ] Registered `/student/courses/:courseId/lessons/:lessonId` route inside `AppRoutes.jsx`.
- [ ] Created collapsible left-sidebar loading sections and lessons.
- [ ] Programmed checkboxes triggering progress post mutations on click.
- [ ] Added sidebar item icon swaps updating to green checkmarks on completed items.
- [ ] Programmed progress bar statistics updates rendering inside Student Dashboard.
