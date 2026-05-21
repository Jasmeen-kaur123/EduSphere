import InstructorCourses from './pages/InstructorCourses'
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import InstructorDashboard from './pages/InstructorDashboard'
import CreateCourse from './pages/CreateCourse'
import InstructorStudents from './pages/InstructorStudents'
import Assignments from './pages/Assignments'
import InstructorAssignments from './pages/InstructorAssignments'
import CreateAssignment from './pages/CreateAssignment'  // ✅ FIXED: was missing
import Courses from './pages/Courses'
import Browse from './pages/Browse'
import Grades from './pages/Grades'
import Schedule from './pages/Schedule'
import CourseDetail from './pages/CourseDetail'
import ProtectedRoute from './components/ProtectedRoute'


export default function App(){
  return (
    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["student"]}><Dashboard/></ProtectedRoute>} />
      <Route path="/courses" element={<ProtectedRoute allowedRoles={["student"]}><Courses/></ProtectedRoute>} />
      <Route path="/browse" element={<ProtectedRoute allowedRoles={["student"]}><Browse/></ProtectedRoute>} />
      <Route path="/course/:id" element={<ProtectedRoute allowedRoles={["student"]}><CourseDetail/></ProtectedRoute>} />
      <Route path="/grades" element={<ProtectedRoute allowedRoles={["student"]}><Grades/></ProtectedRoute>} />
      <Route path="/schedule" element={<ProtectedRoute allowedRoles={["student"]}><Schedule/></ProtectedRoute>} />
      <Route path="/instructor" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorDashboard/></ProtectedRoute>} />
      <Route
  path="/instructor/courses"
  element={
    <ProtectedRoute allowedRoles={["instructor"]}>
      <InstructorCourses/>
    </ProtectedRoute>
  }
/>
      <Route path="/create-course" element={<ProtectedRoute allowedRoles={["instructor"]}><CreateCourse/></ProtectedRoute>} />
      <Route path="/instructor/students" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorStudents/></ProtectedRoute>} />
      <Route path="/assignments" element={<ProtectedRoute allowedRoles={["student"]}><Assignments/></ProtectedRoute>} />
      <Route path="/instructor/assignments" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorAssignments/></ProtectedRoute>} />
      <Route path="/create-assignment" element={<ProtectedRoute allowedRoles={["instructor"]}><CreateAssignment/></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
  path="/instructor/course/edit/:id"
  element={
    <ProtectedRoute allowedRoles={["instructor"]}>
      <CreateCourse />
    </ProtectedRoute>
  }
/>
    </Routes>
  )
}