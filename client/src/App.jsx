import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthRedirect from './components/shared/AuthRedirect';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Login from './pages/AuthPage/Login';
import Register from './pages/AuthPage/Register';
import EmailVerify from './pages/AuthPage/EmailVerify';
import ResetPassword from './pages/AuthPage/ResetPassword';
import Dashboard from './pages/user/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import LandingPage from './pages/LandingPage';
import Leaderboard from './pages/user/Leaderboard';
import TransactionHistory from './pages/user/TransactionHistory';
import StockPage from './pages/user/StockPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/landing" element={<LandingPage />} />

        {/* Default route - checks auth and redirects automatically */}
        <Route path="/" element={<AuthRedirect />} />

        {/* Public Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected USER routes (requireAdmin={false}) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireAdmin={false}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stocks"
          element={
            <ProtectedRoute requireAdmin={false}>
              <StockPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute requireAdmin={false}>
              <Leaderboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute requireAdmin={false}>
              <TransactionHistory />
            </ProtectedRoute>
          }
        />

        {/* Protected ADMIN route (requireAdmin={true}) */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to auth check */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;