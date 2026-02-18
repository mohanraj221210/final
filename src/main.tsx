import { createRoot } from 'react-dom/client'
import './index.css'
import 'react-toastify/dist/ReactToastify.css';
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
import Wardenlogin from './pages/warden/WardenLogin'
import WardenDashboard from './pages/warden/WardenDashboard'
import PendingOutpass from './pages/warden/PendingOutpass'
import OutpassList from './pages/warden/OutpassList'
import WardenStudentView from './pages/warden/WardenStudentView'
import WardenProfile from './pages/warden/WardenProfile'
import WatchmanProfile from './pages/watchman/WatchmanProfile'
import WatchmanLogin from './pages/watchman/WatchmanLogin'
import WatchmanDashboard from './pages/watchman/WatchmanDashboard'
import WatchmanOutpassList from './pages/watchman/WatchmanOutpassList'
import WatchmanStudentView from './pages/watchman/WatchmanStudentView'
import YearInchargeLogin from './pages/year-incharge/YearInchargeLogin'
import YearInchargeDashboard from './pages/year-incharge/YearInchargeDashboard'
import YearInchargePendingOutpass from './pages/year-incharge/YearInchargePendingOutpass'
import YearInchargeOutpassList from './pages/year-incharge/YearInchargeOutpassList'
import YearInchargeStudentView from './pages/year-incharge/YearInchargeStudentView'
import YearInchargeProfile from './pages/year-incharge/YearInchargeProfile'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageStaff from './pages/admin/ManageStaff'
import ManageYearIncharge from './pages/admin/ManageYearIncharge'
import ManageWarden from './pages/admin/ManageWarden'
import ManageSecurity from './pages/admin/ManageSecurity'
import ManageBus from './pages/admin/ManageBus'
import AdminProfile from './pages/admin/AdminProfile'
import StaffDetailsAdmin from './pages/admin/StaffDetailsAdmin'
import StaffStudentList from './pages/admin/StaffStudentList'
import StudentDetailsAdmin from './pages/admin/StudentDetailsAdmin'
import YearInchargeDetailsAdmin from './pages/admin/YearInchargeDetailsAdmin'
import WardenDetailsAdmin from './pages/admin/WardenDetailsAdmin'
import SecurityDetailsAdmin from './pages/admin/SecurityDetailsAdmin'
import BusDetailsAdmin from './pages/admin/BusDetailsAdmin'
import OutpassAdmin from './pages/admin/OutpassAdmin'



import AxiosInterceptor from './components/AxiosInterceptor'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AxiosInterceptor />
    <Routes>
      <Route path="/admin-login" element={<AdminLogin />} />
      {/* Admin Protected Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/manage-staff" element={
        <ProtectedRoute>
          <ManageStaff />
        </ProtectedRoute>
      } />
      <Route path="/admin/manage-year-incharge" element={
        <ProtectedRoute>
          <ManageYearIncharge />
        </ProtectedRoute>
      } />
      <Route path="/admin/manage-warden" element={
        <ProtectedRoute>
          <ManageWarden />
        </ProtectedRoute>
      } />
      <Route path="/admin/manage-security" element={
        <ProtectedRoute>
          <ManageSecurity />
        </ProtectedRoute>
      } />
      <Route path="/admin/manage-bus" element={
        <ProtectedRoute>
          <ManageBus />
        </ProtectedRoute>
      } />
      <Route path="/admin/outpass" element={
        <ProtectedRoute>
          <OutpassAdmin />
        </ProtectedRoute>
      } />
      <Route path="/admin/profile" element={
        <ProtectedRoute>
          <AdminProfile />
        </ProtectedRoute>
      } />
      <Route path="/admin/staff-details/:id" element={
        <ProtectedRoute>
          <StaffDetailsAdmin />
        </ProtectedRoute>
      } />
      <Route path="/admin/staff/:id/students" element={
        <ProtectedRoute>
          <StaffStudentList />
        </ProtectedRoute>
      } />
      <Route path="/admin/student-details/:id" element={
        <ProtectedRoute>
          <StudentDetailsAdmin />
        </ProtectedRoute>
      } />
      <Route path="/admin/year-incharge-details/:id" element={
        <ProtectedRoute>
          <YearInchargeDetailsAdmin />
        </ProtectedRoute>
      } />
      <Route path="/admin/warden-details/:id" element={
        <ProtectedRoute>
          <WardenDetailsAdmin />
        </ProtectedRoute>
      } />
      <Route path="/admin/security-details/:id" element={
        <ProtectedRoute>
          <SecurityDetailsAdmin />
        </ProtectedRoute>
      } />
      <Route path="/admin/bus-details/:id" element={
        <ProtectedRoute>
          <BusDetailsAdmin />
        </ProtectedRoute>
      } />

      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/wardenlogin" element={<Wardenlogin />} />
      <Route path="/watchmanlogin" element={<WatchmanLogin />} />
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login initialType="student" />} />
      <Route path="/student-login" element={<Login initialType="student" />} />
      <Route path="/staff-login" element={<Login initialType="staff" />} />
      <Route path="/wardenlogin" element={<Wardenlogin />} />
      <Route path="/warden-login" element={<Wardenlogin />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/watchman-dashboard" element={
        <ProtectedRoute>
          <WatchmanDashboard />
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
      <Route path="/watchman-profile" element={
        <ProtectedRoute>
          <WatchmanProfile />
        </ProtectedRoute>
      } />
      <Route path="/watchman/outpass-list" element={
        <ProtectedRoute>
          <WatchmanOutpassList />
        </ProtectedRoute>
      } />
      <Route path="/watchman/student/:id" element={
        <ProtectedRoute>
          <WatchmanStudentView />
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

      {/* Year Incharge Routes */}
      <Route path="/year-incharge-login" element={<YearInchargeLogin />} />
      <Route path="/year-incharge-dashboard" element={
        <ProtectedRoute>
          <YearInchargeDashboard />
        </ProtectedRoute>
      } />
      <Route path="/year-incharge/pending-outpass" element={
        <ProtectedRoute>
          <YearInchargePendingOutpass />
        </ProtectedRoute>
      } />
      <Route path="/year-incharge/outpass-list" element={
        <ProtectedRoute>
          <YearInchargeOutpassList />
        </ProtectedRoute>
      } />
      <Route path="/year-incharge/student/:id" element={
        <ProtectedRoute>
          <YearInchargeStudentView />
        </ProtectedRoute>
      } />
      <Route path="/year-incharge-profile" element={
        <ProtectedRoute>
          <YearInchargeProfile />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Login />} />
    </Routes>
  </BrowserRouter>
)
