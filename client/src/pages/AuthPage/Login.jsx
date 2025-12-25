import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, CheckCircle, AlertCircle, Loader, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // ✅ Check if user is already logged in
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

      if (response.data.success) {
        // User is already logged in, redirect to dashboard
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.log('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(
        'http://localhost:8000/api/auth/login',
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
      } else {
        setMessage({ type: 'error', text: response.data.message });
        setLoading(false);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Login failed. Please try again.'
      });
      setLoading(false);
    }
  };

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setMessage({ type: '', text: '' });

  //   try {
  //     const response = await axios.post(
  //       'http://localhost:8000/api/auth/login',
  //       formData,
  //       { withCredentials: true }
  //     );

  //     if (response.data.success) {
  //       setMessage({
  //         type: 'success',
  //         text: 'Login successful! Redirecting...'
  //       });

  //       // Check auth status and redirect accordingly
  //       const authCheck = await axios.post(
  //         'http://localhost:8000/api/auth/is-auth',
  //         {},
  //         { withCredentials: true }
  //       );

  //       setTimeout(() => {
  //         if (authCheck.data.success) {
  //           if (authCheck.data.isAdmin) {
  //             // Admin - go to AdminDashboard
  //             navigate('/admin-dashboard', { replace: true });
  //           } else {
  //             // Regular user - go to Dashboard
  //             navigate('/dashboard', { replace: true });
  //           }
  //         } else {
  //           navigate('/login', { replace: true });
  //         }
  //       }, 1000);
  //     } else {
  //       setMessage({
  //         type: 'error',
  //         text: response.data.message
  //       });
  //     }
  //   } catch (error) {
  //     setMessage({
  //       type: 'error',
  //       text: error.response?.data?.message || 'Login failed'
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(
        'http://localhost:8000/api/auth/login',
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: 'Login successful! Redirecting...'
        });

        // ✅ Check auth immediately after login
        const authCheck = await axios.post(
          'http://localhost:8000/api/auth/is-auth',
          {},
          { withCredentials: true }
        );

        console.log('✅ Auth check after login:', authCheck.data);

        // ✅ Small delay to ensure cookies are set
        setTimeout(() => {
          if (authCheck.data.success) {
            if (authCheck.data.isAdmin) {
              console.log('🔐 Redirecting to Admin Dashboard');
              navigate('/admin-dashboard', { replace: true });
            } else {
              console.log('👤 Redirecting to User Dashboard');
              navigate('/dashboard', { replace: true });
            }
          } else {
            navigate('/login', { replace: true });
          }
        }, 500); // ✅ 500ms delay ensures proper state transition
      } else {
        setMessage({
          type: 'error',
          text: response.data.message
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Login failed'
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loader while checking authentication
  if (loading && !message.text) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img
              src="/src/assets/mudraPayLogo.png"
              alt="MudraPay Logo"
              className="w-16 h-16 object-contain rounded-2xl shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Welcome Back User
          </h1>
          <p className="text-gray-400">Login to continue MudraPay</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Message Display */}
          {message.text && (
            <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 ${message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
              {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400/60" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-200">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/reset-password')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400/60" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-400 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Logging in...
                </>
              ) : (
                <>
                  Login
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors"
              >
                Create account
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Protected by bank-level encryption
        </p>
      </div>
    </div>
  );
};

export default Login;
