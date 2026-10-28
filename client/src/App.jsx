import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Team from './pages/Team';
import Leaves from './pages/Leaves';
import LeaveRequests from './pages/LeaveRequests';
import Attendance from './pages/Attendance';
import AttendanceReport from './pages/AttendanceReport';
import Announcements from './pages/Announcements';
import Trainings from './pages/Trainings';
import Profile from './pages/Profile';

// Only logged in users (and optionally only some roles) can open a page
function Protected({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="vh-100 d-flex align-items-center justify-content-center"><div className="spinner-border text-primary" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<Protected roles={['hr']}><Employees /></Protected>} />
        <Route path="/team" element={<Protected roles={['manager']}><Team /></Protected>} />
        <Route path="/leaves" element={<Protected roles={['employee', 'manager']}><Leaves /></Protected>} />
        <Route path="/leave-requests" element={<Protected roles={['hr', 'manager']}><LeaveRequests /></Protected>} />
        <Route path="/attendance" element={<Protected roles={['employee', 'manager']}><Attendance /></Protected>} />
        <Route path="/attendance-report" element={<Protected roles={['hr', 'manager']}><AttendanceReport /></Protected>} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/trainings" element={<Trainings />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
