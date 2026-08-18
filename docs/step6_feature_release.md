# 🔄 Production Feature Release Guide — Frontend Updates (Ratings & Reviews)

A step-by-step tutorial for building the Ratings & Reviews user interface inside the **Online Course Platform** frontend, and deploying the updates to your live production website.

> **New UI Component**: Course Ratings, Stars widget, Comments list, and Submit form block.
> **You will update**: `CourseDetailPage.jsx` and compile static bundle updates for production rollout.
> **You will learn**: Using Ant Design `<Rate />` and `<List />` inputs, binding query lists, and hot-updating static CDN services.

---

## 📚 Table of Contents

1. [Local Development: Implementing the Review UI](#local-development-implementing-the-review-ui)
2. [Step 1 — Fetching and Displaying Reviews in `CourseDetailPage.jsx`](#step-1---fetching-and-displaying-reviews-in-coursedetailpagejsx)
3. [Step 2 — Building the Review Submission Form block](#step-2---building-the-review-submission-form-block)
4. [Step 3 — Deploying Frontend Updates Live](#step-3---deploying-frontend-updates-live)
5. [Completion Checklist](#completion-checklist)

---

## Local Development: Implementing the Review UI

We update our course details screen to render:
- Existing user comments and star badges.
- A submission text block let active student profiles post ratings.

---

## Step 1 — Fetching and Displaying Reviews in `CourseDetailPage.jsx`

Open `src/pages/CourseDetailPage.jsx` and update it to fetch and render reviews.

`src/pages/CourseDetailPage.jsx`
```jsx
import { Rate, List, Form, Input } from 'antd'; // ⬅️ Add imports

// Inside CourseDetailPage component:
const [reviews, setReviews] = useState([]);

const fetchReviews = async () => {
  try {
    const response = await api.get(`/courses/${id}/reviews`);
    setReviews(response.data || []);
  } catch (err) {
    console.error("Failed to load reviews:", err);
  }
};

useEffect(() => {
  // Fetch reviews alongside course details
  fetchReviews();
}, [id]);

// Add rendering code inside details card:
{/* Add this inside the left column below the syllabus card */}
<Card className="shadow-xs rounded-2xl border border-slate-100 p-6 bg-white mt-8">
  <Title level={4} className="font-extrabold text-slate-800 m-0 mb-6">Student Reviews</Title>
  <List
    dataSource={reviews}
    itemLayout="horizontal"
    renderItem={item => (
      <List.Item className="border-b border-slate-100/60 py-4 last:border-none">
        <List.Item.Meta
          title={
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 text-sm">{item.user?.username || 'Student'}</span>
              <Rate disabled defaultValue={item.rating} className="text-2xs text-amber-400" />
            </div>
          }
          description={<p className="m-0 text-slate-500 text-xs mt-1 leading-relaxed">{item.comment}</p>}
        />
      </List.Item>
    )}
  />
</Card>
```

---

## Step 2 — Building the Review Submission Form block

Add a form block inside the page, restricting the visibility so only logged-in students can leave a rating feedback comment.

`src/pages/CourseDetailPage.jsx`
```jsx
// Inside CourseDetailPage component:
const [submittingReview, setSubmittingReview] = useState(false);
const [form] = Form.useForm();

const handleAddReview = async (values) => {
  setSubmittingReview(true);
  try {
    await api.post(`/courses/${id}/reviews`, {
      rating: values.rating,
      comment: values.comment
    });
    message.success("Review posted successfully!");
    form.resetFields();
    fetchReviews(); // Reload listing dynamically
  } catch (err) {
    console.error("Failed to post review:", err);
  } finally {
    setSubmittingReview(false);
  }
};

// Render inside the reviews Card under the List component:
{user?.role === 'student' && (
  <div className="mt-8 pt-8 border-t border-slate-100">
    <Title level={5} className="m-0 font-bold text-slate-800 mb-4">Leave your Feedback</Title>
    <Form form={form} onFinish={handleAddReview} layout="vertical" requiredMark={false}>
      <Form.Item name="rating" label={<span className="font-bold text-slate-600 text-xs">Rating</span>} rules={[{ required: true, message: "Please select stars!" }]}>
        <Rate className="text-amber-400" />
      </Form.Item>
      <Form.Item name="comment" label={<span className="font-bold text-slate-600 text-xs">Comment</span>}>
        <Input.TextArea rows={3} placeholder="Write your review here..." className="rounded-xl" />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={submittingReview} className="bg-indigo-600 hover:bg-indigo-700 border-none font-bold rounded-xl h-10 px-5 shadow-xs cursor-pointer">
        Submit Feedback
      </Button>
    </Form>
  </div>
)}
```

---

## Step 3 — Deploying Frontend Updates Live

Once checked locally, publish the bundle updates.

### 3.1 Option A: Deployed on Vercel / Netlify (Continuous Deployment)
Continuous deployment triggers automatically upon push:
```bash
git add .
git commit -m "feat: implement reviews and ratings UI interface"
git push origin main
```
*Vercel / Netlify webhooks will intercept the push, compile `npm run build` on their server, and swap active CDNs automatically in 1–2 minutes.*

### 3.2 Option B: Deployed on VPS (Manual static deployment)
Compile the project locally and sync the output directory to the server VM:
```bash
# 1. Compile project assets
npm run build

# 2. Sync to the server static target folder (overwrites previous files)
scp -r ./dist/* root@<YOUR_VPS_IP>:/var/www/course-platform/
```

---

## Completion Checklist

- [ ] Integrated Ant Design `Rate` and `List` input elements.
- [ ] Programmed dynamic review loading in `CourseDetailPage.jsx`.
- [ ] Added reviews form validation locks.
- [ ] Pushed commits to primary main branch on GitHub.
- [ ] Recompiled static bundle distributions via build command tools.
- [ ] Deployed compiled distributable folder to live web services.
