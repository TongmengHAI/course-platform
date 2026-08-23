# 📖 Step 4 — Lessons and Progress Flow (Frontend)

This step adds the learning interface: a student opens a course, sees the syllabus, and marks lessons complete.

> Advanced extension after this step: instructor dashboard metrics, student list, and curriculum editor.

> Stack: React 19 · Ant Design · Axios · React Router
> You will build: a lesson viewer, syllabus navigation, progress tracking UI, and student dashboard progress summary.
> You will learn: content structure, simple navigation, completion toggles, and clean UX for a learning experience.

---

## 1. Learning flow overview

A simple student journey could be:

1. Student enters course from dashboard.
2. Application loads the syllabus and progress data.
3. Student sees course sections and lesson list.
4. Student clicks a lesson.
5. Student reads the content and marks the lesson complete.
6. Dashboard progress updates.

This keeps the experience consistent and easy to trust.

### Important bug notes before building this step

- Do not render lesson content for a user who is not enrolled in the course.
- Do not assume the student is allowed to complete lessons just because the button is visible.
- Keep loading and empty states clear while syllabus and progress data are being fetched.
- Do not forget to sync local state after success so the UI matches the backend.
- Use a simple, stable lesson list order instead of showing random content ordering.

---

## 2. Page structure

The page should use a clean two-panel layout:

- left panel: syllabus sidebar
- right panel: active lesson content
- top area: course title and completion indicator
- bottom area: prev/next navigation and completion toggle

This is enough without being too advanced.

---

## 3. UI implementation tips

- Use a sidebar list of sections and lessons.
- Show a check icon for completed lessons.
- Use `Menu` or `Collapse` from Ant Design for sections.
- Use a `Checkbox` or button to mark lesson completed.
- Keep the reading panel large and readable.
- Avoid overloading with too many controls.

---

## 4. Full frontend implementation

File to create or update: `src/components/LessonViewer.jsx`

```jsx
import { useState } from 'react';
import { message } from 'antd';
import api from '../services/api';

const LessonViewer = ({ lessonId, courseId }) => {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleToggleComplete = async (checked) => {
    try {
      setLoading(true);
      await api.post('/enrollments/progress', {
        lessonId: Number(lessonId),
        isCompleted: checked,
      });

      setCompleted(checked);
      message.success(checked ? 'Lesson marked complete' : 'Progress updated');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to update lesson progress');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button disabled={loading} onClick={() => handleToggleComplete(!completed)}>
      {loading ? 'Updating...' : completed ? 'Completed' : 'Mark as complete'}
    </button>
  );
};

export default LessonViewer;
```

The frontend should keep local `completed` state in sync after each update. This keeps the UI responsive and simple to understand.

---

## 5. Student dashboard progress display

This is the actual dashboard implementation for progress summary. The student should see a progress bar and a text summary so they know how far they are in each course.

File to create or update: `src/pages/StudentDashboardPage.jsx`

```jsx
import { useEffect, useState } from 'react';
import { Progress, message } from 'antd';
import api from '../services/api';

const StudentDashboardPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const enrolledRes = await api.get('/enrollments/my-courses');
        const enrolledCourses = enrolledRes.data?.data || [];

        const dataWithProgress = await Promise.all(
          enrolledCourses.map(async (course) => {
            const progressRes = await api.get(`/enrollments/${course.id}/progress`);
            const completedLessons = progressRes.data?.data?.length || 0;
            const totalLessons = course.lessons?.length || 0;
            const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

            return {
              ...course,
              completedLessons,
              totalLessons,
              percent,
            };
          })
        );

        setCourses(dataWithProgress);
      } catch (err) {
        message.error('Unable to load progress summary');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <p>Loading your dashboard...</p>;
  }

  return (
    <div>
      {courses.map((course) => (
        <div key={course.id}>
          <h3>{course.title}</h3>
          <Progress percent={course.percent} size="small" />
          <p>
            {course.completedLessons} of {course.totalLessons} lessons completed
          </p>
        </div>
      ))}
    </div>
  );
};

export default StudentDashboardPage;
```

This helps the student understand their learning momentum without making the design too noisy.

---

## 6. UX/UI notes

- Use one clear action for lesson completion.
- Keep the sidebar compact and easy to scan.
- Use consistent typography and spacing.
- Show only relevant data, not all metadata.
- Use empty/loading states if the course or progress data is not ready.

---

## 7. Critical beginner mistakes to avoid

- Not checking if a student is enrolled before rendering course lessons.
- Loading too much data at once with no sorting.
- Not updating local state after a completion action.
- Using tiny buttons or poor contrast.
- Overdesigning the lesson viewer before the flow works properly.

---

## 8. Testing checklist

- [ ] Student can open course syllabus
- [ ] Sidebar displays sections and lessons clearly
- [ ] Lesson completion updates the UI immediately
- [ ] Dashboard progress updates after completion
- [ ] Unenrolled user cannot enter lesson path
- [ ] Empty and loading states work as expected

## 9. Completion checklist

- [ ] Lesson viewer page created
- [ ] Sidebar navigation added
- [ ] Progress state is synced with backend
- [ ] Student dashboard shows completion status
- [ ] UX remains clean and easy to follow
