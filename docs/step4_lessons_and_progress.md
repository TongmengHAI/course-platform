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
import { Layout, Menu, Typography, Checkbox, Spin, Button, App, Card, Row, Col } from 'antd';
import { ArrowLeftOutlined, CheckCircleFilled, PlayCircleOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Sider, Content } = Layout;
const { Title, Paragraph } = Typography;

export default function LessonViewerPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp(); // ⬅️ Contextual message API
  
  const [loading, setLoading] = useState(true);
  const [syllabus, setSyllabus] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [updating, setUpdating] = useState(false);
  
  // Navigation states
  const [prevLessonId, setPrevLessonId] = useState(null);
  const [nextLessonId, setNextLessonId] = useState(null);

  const fetchCourseData = async () => {
    try {
      // 1. Fetch full syllabus (sections & lessons list)
      const syllabusRes = await api.get(`/courses/${courseId}/syllabus`);
      const syllabusData = syllabusRes.data || [];
      setSyllabus(syllabusData);

      // 2. Fetch student completion list
      const progressRes = await api.get(`/enrollments/${courseId}/progress`);
      const completedIds = progressRes.data
        .filter(item => item.is_completed)
        .map(item => item.lesson.id);
      setCompletedLessons(completedIds);

      // Find active lesson context & setup navigation pointers
      let foundLesson = null;
      let allLessons = [];
      
      syllabusData.forEach(section => {
        if (section.lessons) {
          allLessons.push(...section.lessons);
        }
      });

      const currentIndex = allLessons.findIndex(l => l.id === Number(lessonId));
      if (currentIndex !== -1) {
        foundLesson = allLessons[currentIndex];
        
        // Prev / Next pointers
        setPrevLessonId(currentIndex > 0 ? allLessons[currentIndex - 1].id : null);
        setNextLessonId(currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].id : null);
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
      <Sider width={320} className="bg-slate-50 border-r border-slate-100 py-6 px-3" theme="light">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/student/dashboard')} 
          className="w-full mb-6 rounded-xl font-bold h-10 border-slate-200 text-slate-600 cursor-pointer"
        >
          Back to Dashboard
        </Button>
        <div className="font-extrabold text-slate-800 text-xs px-3 mb-4 uppercase tracking-wider">Course Curriculum</div>
        
        <div className="overflow-y-auto max-h-[60vh] space-y-4">
          {syllabus.map(section => (
            <div key={section.id} className="mb-2">
              <div className="font-bold text-slate-400 text-2xs px-3 mb-2 uppercase tracking-wide">{section.title}</div>
              <Menu
                mode="inline"
                selectedKeys={[lessonId]}
                className="bg-transparent border-none"
                onClick={({ key }) => navigate(`/student/courses/${courseId}/lessons/${key}`)}
              >
                {section.lessons.map(lesson => (
                  <Menu.Item key={lesson.id} icon={
                    completedLessons.includes(lesson.id) ? 
                    <CheckCircleFilled className="text-emerald-500 text-sm" /> : 
                    <PlayCircleOutlined className="text-slate-400 text-sm" />
                  } className="rounded-xl my-1 h-9 flex items-center">
                    <span className="text-slate-700 text-xs font-semibold">{lesson.title}</span>
                  </Menu.Item>
                ))}
              </Menu>
            </div>
          ))}
        </div>
      </Sider>

      {/* Lesson View panel */}
      <Content className="p-8 md:p-12 bg-white flex flex-col justify-between h-[85vh]">
        {activeLesson ? (
          <div className="max-w-3xl flex-grow">
            <div className="flex items-center gap-2 mb-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <PlayCircleOutlined /> Active Lesson
            </div>
            <Title level={2} className="font-extrabold text-slate-800 tracking-tight m-0 mb-6">{activeLesson.title}</Title>
            <Paragraph className="text-slate-600 text-sm md:text-base leading-relaxed mb-8 whitespace-pre-wrap">
              {activeLesson.content || "This lesson content is empty."}
            </Paragraph>

            <Card className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-2 mt-12">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-800 text-sm">Finished learning?</div>
                  <div className="text-emerald-600/70 text-xs mt-0.5">Check this box to record your learning progress stats.</div>
                </div>
                <Checkbox
                  checked={completedLessons.includes(Number(lessonId))}
                  onChange={handleToggleComplete}
                  disabled={updating}
                  className="font-bold scale-125 text-emerald-600 cursor-pointer"
                >
                  Completed
                </Checkbox>
              </div>
            </Card>
            
            {/* Navigation Buttons Row */}
            <Row justify="space-between" align="middle" className="mt-10 border-t border-slate-100 pt-6">
              <Col>
                <Button 
                  icon={<LeftOutlined />} 
                  disabled={!prevLessonId} 
                  onClick={() => navigate(`/student/courses/${courseId}/lessons/${prevLessonId}`)}
                  className="rounded-xl font-bold h-10 px-4 cursor-pointer"
                >
                  Previous
                </Button>
              </Col>
              <Col>
                <Button 
                  type="primary"
                  icon={<RightOutlined />} 
                  disabled={!nextLessonId} 
                  onClick={() => navigate(`/student/courses/${courseId}/lessons/${nextLessonId}`)}
                  className="bg-indigo-600 hover:bg-indigo-700 border-none rounded-xl font-bold h-10 px-4 cursor-pointer"
                >
                  Next Lesson
                </Button>
              </Col>
            </Row>
          </div>
        ) : (
          <div className="text-center py-20">
            <PlayCircleOutlined className="text-4xl text-slate-300 mb-3" />
            <Title level={4} className="text-slate-500 m-0">Select a lesson to begin learning.</Title>
          </div>
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
// We render the progress bar inside the polished course card layout:

{courses.map((course) => {
  const progressPercent = course.completedCount && course.totalLessonsCount ? 
    Math.round((course.completedCount / course.totalLessonsCount) * 100) : 0;

  return (
    <Col xs={24} sm={12} lg={8} key={course.id}>
      <Card 
        hoverable
        className="shadow-xs rounded-2xl border border-slate-100/80 overflow-hidden flex flex-col h-full bg-white transition hover-lift"
        styles={{ body: { padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' } }}
        onClick={() => navigate(`/courses/${course.id}`)}
      >
        <div className="flex items-center justify-between mb-4">
          <Tag color={getLevelTagColor(course.level)} className="font-semibold px-2 py-0.5 rounded-md border-none uppercase text-3xs">
            {course.level}
          </Tag>
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{course.category || 'Development'}</span>
        </div>

        <Title level={5} className="m-0 font-bold text-slate-800 line-clamp-1 mb-2">{course.title}</Title>
        <Paragraph className="text-slate-500 text-xs leading-relaxed mt-1 flex-grow line-clamp-2 mb-4">{course.description}</Paragraph>
        
        {/* Modern Progress Bar Widget */}
        <div className="mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
          <div className="flex justify-between items-center text-3xs font-bold text-slate-400 mb-1">
            <span>CURRICULUM PROGRESS</span>
            <span className="text-indigo-600">{progressPercent}%</span>
          </div>
          <Progress percent={progressPercent} size="small" showInfo={false} strokeColor="#4f46e5" trailColor="#e2e8f0" />
        </div>

        <div className="border-t border-slate-100 pt-4 mt-auto flex items-center justify-between">
          <span className="text-xs text-slate-400">By <span className="font-semibold text-slate-600">{course.instructor?.username || 'Instructor'}</span></span>
          <Button 
            type="link" 
            size="small" 
            onClick={(e) => {
              e.stopPropagation(); // Stop card click navigation
              navigate(`/student/courses/${course.id}/lessons/${course.firstLessonId || 1}`);
            }}
            className="font-bold p-0"
          >
            Start Learning →
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
