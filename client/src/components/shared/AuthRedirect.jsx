import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Loader } from 'lucide-react';
import api from "../../api/api.js"

const AuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      const response = await api.post(
        '/auth/is-auth',
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        const { isAdmin } = response.data;
        
        // Direct routing based on admin status
        if (isAdmin) {
          // Admin user - go directly to AdminDashboard
          navigate('/admin-dashboard', { replace: true });
        } else {
          // Regular user - go to Dashboard
          navigate('/dashboard', { replace: true });
        }
      } else {
        // Not authenticated - go to login
        navigate('/landing', { replace: true });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // On error, redirect to login
      navigate('/landing', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Shield className="w-10 h-10 text-slate-900" />
        </div>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400 mx-auto mb-4"></div>
        <p className="text-gray-400 text-lg font-semibold">Checking authentication...</p>
        <p className="text-gray-500 text-sm mt-2">Please wait</p>
      </div>
    </div>
  );
};

export default AuthRedirect;