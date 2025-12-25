import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader } from 'lucide-react';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/auth/is-auth',
        {},
        { withCredentials: true }
      );

      if (!response.data.success) {
        // Not authenticated - redirect to login
        navigate('/login', { replace: true });
        return;
      }

      const { isAdmin } = response.data;

      // If route requires admin but user is not admin
      if (requireAdmin && !isAdmin) {
        navigate('/dashboard', { replace: true });
        return;
      }

      // If route is for regular users but user is admin
      if (!requireAdmin && isAdmin) {
        navigate('/admin-dashboard', { replace: true });
        return;
      }

      setAuthorized(true);
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-emerald-400 mx-auto mb-4" />
          <p className="text-gray-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  return authorized ? children : null;
};

export default ProtectedRoute;