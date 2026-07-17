import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useStore from './stores/useStore';
import Toast from './components/Toast';
import LoginPage from './pages/LoginPage';
import UserLayout from './pages/UserLayout';
import HomePage from './pages/HomePage';
import TasksPage from './pages/TasksPage';
import LeaderboardPage from './pages/LeaderboardPage';
import WalletPage from './pages/WalletPage';
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminTasks from './pages/AdminTasks';
import AdminApprovals from './pages/AdminApprovals';
import AdminPayouts from './pages/AdminPayouts';
import AdminUsers from './pages/AdminUsers';

function ProtectedRoute({ children }) {
  const { user, loading } = useStore();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AdminRoute({ children }) {
  const { userData, loading } = useStore();
  if (loading) return <LoadingScreen />;
  if (!userData || userData.role !== 'admin') return <Navigate to="/" />;
  return children;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const { init, toasts } = useStore();
  useEffect(() => { init(); }, []);

  return (
    <div className="min-h-screen bg-darkBg">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
          <Route index element={<HomePage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="wallet" element={<WalletPage />} />
        </Route>
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="tasks" element={<AdminTasks />} />
          <Route path="approvals" element={<AdminApprovals />} />
          <Route path="payouts" element={<AdminPayouts />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>
      <Toast toasts={toasts} />
    </div>
  );
}
