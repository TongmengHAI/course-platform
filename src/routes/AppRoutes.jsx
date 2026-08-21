import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import StudentDashboardPage from '../pages/StudentDashboardPage';
import InstructorDashboardPage from '../pages/InstructorDashboardPage';
import AdminDashboardPage from '../pages/AdminDashboardPage'; // ⬅️ Import Admin Dashboard

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

        {/* Protected Routes for Instructor */}
        <Route element={<ProtectedRoute allowedRoles={["instructor", "admin"]} />}>
          <Route path="/instructor/dashboard" element={<InstructorDashboardPage />} />
          <Route path="/instructor/courses/new" element={<CourseEditorPage />} />
          <Route path="/instructor/courses/edit/:id" element={<CourseEditorPage />} />
        </Route>

        {/* Protected Routes for Admin only */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Route>

        {/* Fallback routing */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}