# 🎓 Step 3 — Enrollment Flow (Frontend)

This step adds the enrollment experience to the frontend and connects it to the backend enrollment API.

> Advanced extension after this step: instructor dashboard summary, enrolled student list, and course curriculum editing.

> Stack: React 19 · Ant Design · Axios · React Router
> You will build: course detail enrollment action and student dashboard enrollment list.
> You will learn: secure UI state, user role checks, order of operations, and clean empty-state design.

---

## 1. Enrollment flow overview

The user experience should feel simple and trustworthy:

1. Student sees course detail page.
2. Student clicks `Enroll Now`.
3. UI sends a request to the backend.
4. On success, the app redirects to the dashboard.
5. Dashboard loads enrolled courses and shows them as active learning materials.
6. If enrollment fails, show a clear message.

A clean, reliable flow matters more than complex animations.

### Important bug notes before building this step

- Do not show the enroll button for guests, instructors, or admins unless the page is intentionally designed for them.
- Do not trust the browser state alone. Always rely on the backend response and the authenticated user.
- If the user is already enrolled, show a clear state such as `Already enrolled` instead of allowing a duplicate request.
- Redirect users to `/login` when they are not authenticated.
- Keep loading and error states clear so students know whether the request is still processing or failed.

---

## 2. Frontend rules

- Only `student` can see the enroll action.
- If not logged in, route to `/login`.
- If already enrolled, disable or replace the button with `Already enrolled`.
- Keep the CTA clear and large enough for mobile users.
- Use success/error messages from Ant Design `message` API.

---

## 3. UI layout

The frontend should include this structure:

- header with course title and tags
- course description block
- pricing and instructor info panel
- `Enroll Now` button in the right panel
- student dashboard cards for enrolled courses

This is a clean, medium-complexity layout for a production MVP.

---

## 4. Developer flow

### 4.1 Full frontend implementation: course detail page

File to create or update: `src/pages/CourseDetailPage.jsx`

```jsx
import { useState } from 'react';
import { message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'student') {
      message.warning('Only students can enroll in courses');
      return;
    }

    try {
      setLoading(true);
      await api.post('/enrollments', { courseId: Number(id) });
      message.success('Enrollment successful');
      navigate('/student/dashboard');
    } catch (err) {
      message.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleEnroll} disabled={loading}>
        {loading ? 'Processing...' : 'Enroll Now'}
      </button>
    </div>
  );
};

export default CourseDetailPage;
```

### 4.2 Full frontend implementation: student dashboard

File to create or update: `src/pages/StudentDashboardPage.jsx`

```jsx
import { useEffect, useState } from 'react';
import { message } from 'antd';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const StudentDashboardPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMyCourses = async () => {
      try {
        const res = await api.get('/enrollments/my-courses');
        setCourses(res.data?.data || res.data || []);
      } catch (err) {
        message.error('Unable to load your enrolled courses');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'student') {
      loadMyCourses();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <p>Loading your courses...</p>;
  }

  return (
    <div>
      {courses.length === 0 ? (
        <p>You have not enrolled in any course yet.</p>
      ) : (
        courses.map((course) => (
          <div key={course.id}>
            <h3>{course.title}</h3>
            <p>{course.description}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default StudentDashboardPage;
```

Use cards, not tables, for this view. It is friendlier and easier to scan for students.

---

## 5. UX/UI notes for beginners

- Use one primary CTA per page.
- Use empty states instead of blank spaces.
- Keep button labels short and action-oriented.
- Prefer consistent spacing and calm colors.
- Avoid placing too much information in a single card.

---

## 6. Critical beginner mistakes to avoid

- Showing the enroll button for admins/instructors.
- Not redirecting unauthenticated users to login.
- Not checking for duplicate enrollment.
- Showing technical backend errors directly to users.
- Overcomplicating the design with too many animations or widgets.

---

## 7. Testing checklist

- [ ] Student can enroll from course detail page
- [ ] Student dashboard displays the enrolled course
- [ ] Duplicate enroll is blocked with clear feedback
- [ ] Guest user is redirected to login
- [ ] Instructor/admin cannot enroll
- [ ] Empty state looks clean and intentional

## 8. Completion checklist

- [ ] `Enroll Now` button added to course detail page
- [ ] Student dashboard fetches enrolled courses
- [ ] Empty state included
- [ ] Role checks implemented
- [ ] User feedback is clear and friendly
