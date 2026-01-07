import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles.css'
import Welcome from './pages/Welcome'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/login'
import StaffDashboard from './pages/StaffDashboard'
import StaffProfile from './pages/StaffProfile'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Staffs from './pages/Staffs'
import Subjects from './pages/Subjects'
import SubjectDetails from './pages/SubjectDetails'
import Profile from './pages/Profile'
import Outpass from './pages/Outpass'
import PassApproval from './pages/PassApproval'
import Wardenlogin from './pages/warden/WardenLogin'
import WardenDashboard from './pages/warden/WardenDashboard'
import PendingOutpass from './pages/warden/PendingOutpass'
import OutpassList from './pages/warden/OutpassList'
import WardenStudentView from './pages/warden/WardenStudentView'
import WardenProfile from './pages/warden/WardenProfile'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/wardenlogin" element={<Wardenlogin />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/warden-dashboard" element={
          <ProtectedRoute>
            <WardenDashboard />
          </ProtectedRoute>
        } />
        <Route path="/warden-profile" element={
          <ProtectedRoute>
            <WardenProfile />
          </ProtectedRoute>
        } />
        <Route path="/warden/pending-outpass" element={
          <ProtectedRoute>
            <PendingOutpass />
          </ProtectedRoute>
        } />
        <Route path="/warden/outpass-list" element={
          <ProtectedRoute>
            <OutpassList />
          </ProtectedRoute>
        } />
        <Route path="/warden/student/:id" element={
          <ProtectedRoute>
            <WardenStudentView />
          </ProtectedRoute>
        } />
        <Route path="/staff-dashboard" element={
          <ProtectedRoute>
            <StaffDashboard />
          </ProtectedRoute>
        } />
        <Route path="/staffs" element={
          <ProtectedRoute>
            <Staffs />
          </ProtectedRoute>
        } />
        <Route path="/staffs/:id" element={
          <ProtectedRoute>
            <StaffProfile />
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

        {/* Fallback */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
