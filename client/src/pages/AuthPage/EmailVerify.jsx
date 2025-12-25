import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EmailVerify = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Move to next input
    if (element.value !== '' && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter complete OTP' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(
        'https://mudrapay-mern.onrender.com/api/auth/verify-acount',
        { otp: otpValue },
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Email verified successfully!' });
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: response.data.message });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Verification failed. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(
        'https://mudrapay-mern.onrender.com/api/auth/send-verify-otp',
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'New OTP sent to your email!' });
        setOtp(['', '', '', '', '', '']);
      } else {
        setMessage({ type: 'error', text: response.data.message });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to resend OTP. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10 pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl shadow-lg shadow-emerald-500/30 mb-4">
            <Mail className="w-8 h-8 text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-400">We've sent a 6-digit code to your email</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Message Display */}
          {message.text && (
            <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
              {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-4 text-center">
                Enter 6-Digit Code
              </label>
              <div className="flex gap-3 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    disabled={loading}
                    className="w-12 h-14 text-center text-2xl font-bold bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Code expires in 24 hours
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Email
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendOtp}
              disabled={loading}
              className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors disabled:opacity-50"
            >
              Resend OTP
            </button>
          </div>

          {/* Back to Dashboard */}
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 text-sm hover:text-white transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Check your spam folder if you don't see the email
        </p>
      </div>
    </div>
  );
};

export default EmailVerify;
