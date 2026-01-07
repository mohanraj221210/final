import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles.css'
import Welcome from './pages/Welcome'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/login'
import StaffDashboard from './pages/StaffDashboard'
import StaffProfile from './pages/StaffProfile'
import StaffNotices from './pages/StaffNotices'
import StudentNotices from './pages/StudentNotices'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Staffs from './pages/Staffs'
import Subjects from './pages/Subjects'
import SubjectDetails from './pages/SubjectDetails'
import Profile from './pages/Profile'
import Outpass from './pages/OutpassDetails'
import PassApproval from './pages/PassApproval'
import OutpassDetails from './pages/OutpassDetails'
import NewOutpass from './pages/NewOutpass'
import StudentViewStaffProfile from './pages/StudentViewStaffProfile'


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
