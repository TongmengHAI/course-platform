import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from '../pages/DashboardPage';
import StudentDashboardPage from '../pages/StudentDashboardPage';
import InstructorDashboardPage from '../pages/InstructorDashboardPage';
import Navbar from '../components/Navbar';

export default function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes for Student */}
        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/" element={<StudentDashboardPage />} />
        </Route>

        {/* Protected Routes for Instructor */}
        <Route element={<ProtectedRoute allowedRoles={["instructor"]} />}>
          <Route path="/instructor/dashboard" element={<InstructorDashboardPage />} />
        </Route>

        {/* Protected Routes for Admin */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<DashboardPage />} />

        </Route>

        {/* Fallback routing */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
