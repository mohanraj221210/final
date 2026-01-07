import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles.css'
import Welcome from './pages/Welcome'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/login'
import StaffDashboard from './pages/staff/StaffDashboard'
import StaffProfile from './pages/staff/StaffProfile'
import StaffNotices from './pages/staff/StaffNotices'
import StudentDetails from './pages/staff/StudentDetails'
import StudentRegistration from './pages/staff/StudentRegistration'
import StudentNotices from './pages/student/StudentNotices'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/student/Dashboard'
import Staffs from './pages/student/Staffs'
import Subjects from './pages/student/Subjects'
import SubjectDetails from './pages/student/SubjectDetails'
import Profile from './pages/student/Profile'
import Outpass from './pages/student/OutpassDetails'
import PassApproval from './pages/staff/PassApproval'
import OutpassDetails from './pages/student/OutpassDetails'
import NewOutpass from './pages/student/NewOutpass'
import StudentViewStaffProfile from './pages/student/StudentViewStaffProfile'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />


        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/staff-dashboard" element={
          <ProtectedRoute>
            <StaffDashboard />
          </ProtectedRoute>
        } />
        <Route path="/staff-notice" element={
          <ProtectedRoute>
            <StaffNotices />
          </ProtectedRoute>
        } />
        <Route path="/staff-registration" element={
          <ProtectedRoute>
            <StudentRegistration />
          </ProtectedRoute>
        } />
        <Route path="/staff/student-details/:id" element={
          <ProtectedRoute>
            <StudentDetails />
          </ProtectedRoute>
        } />
        <Route path="/student-notice" element={
          <ProtectedRoute>
            <StudentNotices />
          </ProtectedRoute>
        } />
        <Route path="/staff-profile" element={
          <ProtectedRoute>
            <StaffProfile />
          </ProtectedRoute>
        } />
        <Route path="/staffs" element={
          <ProtectedRoute>
            <Staffs />
          </ProtectedRoute>
        } />
        <Route path="/staffs/:id" element={
          <ProtectedRoute>
            <StudentViewStaffProfile />
          </ProtectedRoute>
        } />
        <Route path="/subjects" element={
          <ProtectedRoute>
            <Subjects />
          </ProtectedRoute>
        } />
        <Route path="/subjects/:id" element={
          <ProtectedRoute>
            <SubjectDetails />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/outpass" element={
          <ProtectedRoute>
            <Outpass />
          </ProtectedRoute>
        } />
        <Route path="/passapproval" element={
          <ProtectedRoute>
            <PassApproval />
          </ProtectedRoute>
        } />
        <Route path="/outpass/:id" element={
          <ProtectedRoute>
            <OutpassDetails />
          </ProtectedRoute>
        } />
        <Route path="/new-outpass" element={
          <ProtectedRoute>
            <NewOutpass />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  </StrictMode >,
)
