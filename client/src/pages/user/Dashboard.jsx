// ===== Install this package first =====
// npm install html5-qrcode

// ===== pages/Dashboard.jsx (Complete File) =====
import React, { useState, useEffect, useRef } from 'react';
import {
  Wallet, Send, QrCode, Gift, TrendingUp, ArrowUpRight, ArrowDownLeft,
  Bell, Settings, LogOut, User, Shield, CreditCard, ChevronRight, Users,
  X, Copy, Check, Loader, AlertCircle, Camera, ScanLine, Trophy, Crown,
  Medal, Award, Star, Sparkles, DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api.js';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Swat from 'sweetalert2'
import UserRedemptionTracker from './UserRedemptionTracker';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQRPopup, setShowQRPopup] = useState(false);
  const [showSendMoneyPopup, setShowSendMoneyPopup] = useState(false);
  const [showScanPopup, setShowScanPopup] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [showUpiPinPopup, setShowUpiPinPopup] = useState(false);
  const [upiPin, setUpiPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pendingPayment, setPendingPayment] = useState(null);
  const [topCashbackUsers, setTopCashbackUsers] = useState([]);
  const [showRedeemPopup, setShowRedeemPopup] = useState(false);
  const [redeemCodeInput, setRedeemCodeInput] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState({ type: '', text: '' });
  const [showCashbackRedeemPopup, setShowCashbackRedeemPopup] = useState(false);
  const [cashbackRedeemForm, setCashbackRedeemForm] = useState({
    cashbackAmount: '',
    userUpiId: ''
  });
  const [cashbackRedeemLoading, setcashbackRedeemLoading] = useState(false);
  const [cashbackRedeemMessage, setCashbackRedeemMessage] = useState({ type: '', text: '' });
  const scannerRef = useRef(null);

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    recipientUpiId: '',
    amount: '',
    description: ''
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUserData();
    fetchRecentTransactions();
    fetchTopCashbackUsers();
  }, []);

  const fetchUserData = async () => {
    try {
      const authCheck = await api.post(
        '/auth/is-auth',
        {},
        { withCredentials: true }
      );

      if (!authCheck.data.success) {
        navigate('/login', { replace: true });
        return;
      }

      const response = await axios.get(
        '/user/data',
        { withCredentials: true }
      );

      if (response.data.success) {
        setUserData(response.data.userData);
      } else {
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await axios.get(
        '/user/recent-transactions',
        { withCredentials: true }
      );

      if (response.data.success) {
        setRecentTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleCashbackRedeem = async (e) => {
    e.preventDefault();

    const cashback = parseInt(cashbackRedeemForm.cashbackAmount);

    if (cashback < 100) {
      setCashbackRedeemMessage({
        type: 'error',
        text: 'Minimum redemption is 100 cashback points'
      });
      return;
    }

    if (!cashbackRedeemForm.userUpiId) {
      setCashbackRedeemMessage({
        type: 'error',
        text: 'Please enter your UPI ID'
      });
      return;
    }

    setcashbackRedeemLoading(true);
    setCashbackRedeemMessage({ type: '', text: '' });

    try {
      const response = await axios.post(
        '/cashback/request-redemption',
        cashbackRedeemForm,
        { withCredentials: true }
      );

      if (response.data.success) {
        setCashbackRedeemMessage({
          type: 'success',
          text: response.data.message
        });

        await fetchUserData();

        setTimeout(() => {
          setShowCashbackRedeemPopup(false);
          setCashbackRedeemForm({ cashbackAmount: '', userUpiId: '' });
          setCashbackRedeemMessage({ type: '', text: '' });
        }, 3000);
      } else {
        setCashbackRedeemMessage({
          type: 'error',
          text: response.data.message
        });
      }
    } catch (error) {
      setCashbackRedeemMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to submit request'
      });
    } finally {
      setcashbackRedeemLoading(false);
    }
  };

  const fetchTopCashbackUsers = async () => {
    try {
      const response = await axios.get(
        '/user/leaderboard',
        { withCredentials: true }
      );

      if (response.data.success) {
        setTopCashbackUsers(response.data.leaderboard.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        '/auth/logout',
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login', { replace: true });
    }
  };

  const handleSendVerifyOtp = async () => {
    try {
      const response = await axios.post(
        '/auth/send-verify-otp',
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        alert('OTP sent to your email!');
        navigate('/email-verify');
      } else {
        alert(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Failed to send OTP. Please try again.');
    }
  };

  // const handleActionClick = (label) => {
  //   if (label === 'Cards') {
  //     setShowQRPopup(true);
  //   } else if (label === 'Scan QR') {
  //     setShowScanPopup(true);
  //     setScanning(false);
  //   } else if (label === 'Send Money') {
  //     setShowSendMoneyPopup(true);
  //     setPaymentForm({ recipientUpiId: '', amount: '', description: '' });
  //     setPaymentMessage({ type: '', text: '' });
  //   }
  // };

  const handleActionClick = (label) => {
    if (label === 'Cards') {
      setShowQRPopup(true);
    } else if (label === 'Scan QR') {
      setShowScanPopup(true);
      setScanning(false);
    } else if (label === 'Send Money') {
      setShowSendMoneyPopup(true);
      setPaymentForm({ recipientUpiId: '', amount: '', description: '' });
      setPaymentMessage({ type: '', text: '' });
    } else if (label === 'Redeem') {
      setShowRedeemPopup(true);
      setRedeemCodeInput('');
      setRedeemMessage({ type: '', text: '' });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentChange = (e) => {
    setPaymentForm({
      ...paymentForm,
      [e.target.name]: e.target.value
    });
    setPaymentMessage({ type: '', text: '' });
  };

  const handleSendMoney = async (e) => {
    e.preventDefault();

    setPendingPayment(paymentForm);
    setShowUpiPinPopup(true);
    setUpiPin('');
    setPinError('');
    setPaymentMessage({ type: '', text: '' });
  };

  const handleRedeemCode = async (e) => {
    e.preventDefault();

    if (!redeemCodeInput || redeemCodeInput.trim().length === 0) {
      setRedeemMessage({
        type: 'error',
        text: 'Please enter a redeem code'
      });
      return;
    }

    setRedeemLoading(true);
    setRedeemMessage({ type: '', text: '' });

    try {
      const response = await axios.post(
        '/user/redeem-code',
        { code: redeemCodeInput.toUpperCase() },
        { withCredentials: true }
      );

      if (response.data.success) {
        setRedeemMessage({
          type: 'success',
          text: response.data.message
        });

        // Refresh user data to show updated balance
        await fetchUserData();

        // Clear input and close popup after 3 seconds
        setTimeout(() => {
          setShowRedeemPopup(false);
          setRedeemCodeInput('');
          setRedeemMessage({ type: '', text: '' });
        }, 3000);
      } else {
        setRedeemMessage({
          type: 'error',
          text: response.data.message
        });
      }
    } catch (error) {
      setRedeemMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to redeem code'
      });
    } finally {
      setRedeemLoading(false);
    }
  };

  const processPaymentWithPin = async () => {
    if (!upiPin || upiPin.length < 4) {
      setPinError('Please enter a valid PIN');
      return;
    }

    setPaymentLoading(true);
    setPinError('');

    try {
      const response = await axios.post(
        '/user/send-money',
        {
          ...pendingPayment,
          upiPin: upiPin
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        const cashbackMsg = response.data.transaction.cashback > 0
          ? ` + ₹${response.data.transaction.cashback} cashback (${response.data.transaction.cashbackPercent}%)`
          : '';

        setPaymentMessage({
          type: 'success',
          text: `₹${pendingPayment.amount} sent successfully!${cashbackMsg}`
        });

        setShowUpiPinPopup(false);
        setUpiPin('');
        setPendingPayment(null);

        await fetchUserData();
        await fetchRecentTransactions();
        await fetchTopCashbackUsers();

        setTimeout(() => {
          setShowSendMoneyPopup(false);
          setPaymentForm({ recipientUpiId: '', amount: '', description: '' });
          setPaymentMessage({ type: '', text: '' });
        }, 3000);
      } else {
        setPinError(response.data.message);
      }
    } catch (error) {
      setPinError(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const startScanning = () => {
    setScanning(true);

    setTimeout(() => {
      const scanner = new Html5QrcodeScanner('qr-reader', {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      });

      scanner.render(onScanSuccess, onScanError);
      scannerRef.current = scanner;
    }, 100);
  };

  const onScanSuccess = (decodedText) => {
    console.log('QR Code scanned:', decodedText);

    if (scannerRef.current) {
      scannerRef.current.clear();
    }

    setShowScanPopup(false);
    setShowSendMoneyPopup(true);
    setPaymentForm({
      recipientUpiId: decodedText,
      amount: '',
      description: ''
    });
    setPaymentMessage({ type: '', text: '' });
  };

  const onScanError = (error) => {
    console.warn(error);
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    setScanning(false);
    setShowScanPopup(false);
  };

  const quickActions = [
    { icon: Send, label: 'Send Money', color: 'from-blue-500 to-cyan-500' },
    { icon: QrCode, label: 'Scan QR', color: 'from-purple-500 to-pink-500' },
    { icon: Gift, label: 'Redeem', color: 'from-orange-500 to-red-500' },
    { icon: CreditCard, label: 'Get QR', color: 'from-emerald-500 to-teal-500' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date) => {
    const now = new Date();
    const transactionDate = new Date(date);
    const diffMs = now - transactionDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return transactionDate.toLocaleDateString('en-IN');
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-orange-500';
      case 2: return 'from-gray-300 to-gray-400';
      case 3: return 'from-orange-400 to-amber-600';
      default: return 'from-purple-500 to-pink-500';
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2: return <Medal className="w-5 h-5 text-gray-300" />;
      case 3: return <Award className="w-5 h-5 text-orange-400" />;
      default: return <Star className="w-4 h-4 text-purple-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">MudraPay</h1>
                <p className="text-xs text-gray-400">Welcome back!</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-gray-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-300" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400 flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Info Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-slate-900" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{userData?.name}</h2>
                    <p className="text-gray-400 text-sm">{userData?.email}</p>
                    <p className="text-emerald-400 text-sm font-mono mt-1">{userData?.upiId}</p>
                  </div>
                </div>
                {!userData?.isAccountVerified && (
                  <button
                    onClick={handleSendVerifyOtp}
                    className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-lg text-sm font-semibold hover:bg-yellow-500/20 transition-colors"
                  >
                    Verify Email
                  </button>
                )}
              </div>

              {!userData?.isAccountVerified && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <p className="text-yellow-400 text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Please verify your email to unlock all features
                  </p>
                </div>
              )}

              {userData?.isAccountVerified && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                  <p className="text-emerald-400 text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    ✓ Account verified
                  </p>
                </div>
              )}
            </div>

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl p-6 text-slate-900 shadow-lg shadow-emerald-500/20">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-slate-900/70 text-sm font-semibold mb-1">Total Balance</p>
                  <h3 className="text-4xl font-bold">
                    {formatCurrency(userData?.balance || 0)}
                  </h3>
                </div>
                <Wallet className="w-8 h-8" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowDownLeft className="w-4 h-4" />
                    <span className="text-xs font-semibold">Received</span>
                  </div>
                  <p className="text-lg font-bold">
                    {formatCurrency(userData?.credited || 0)}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-xs font-semibold">Sent</span>
                  </div>
                  <p className="text-lg font-bold">
                    {formatCurrency(userData?.debited || 0)}
                  </p>
                </div>
              </div>
            </div>
            

            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleActionClick(action.label)}
                    className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all hover:scale-105"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-white text-center">{action.label}</p>
                  </button>
                ))}
              </div>
            </div>

          <UserRedemptionTracker userData={userData} />

            {/* Recent Transactions */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
                <button
                  onClick={() => navigate('/transactions')}
                  className="text-emerald-400 text-sm font-semibold hover:text-emerald-300 flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {recentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.transactionId}
                      className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${transaction.type === 'credit'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                          } rounded-lg flex items-center justify-center`}>
                          {transaction.type === 'credit' ? (
                            <ArrowDownLeft className="w-5 h-5" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-semibold text-sm">
                              {transaction.type === 'credit'
                                ? `From ${transaction.from.name}`
                                : `To ${transaction.to.name}`
                              }
                            </p>
                            {transaction.cashback > 0 && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded text-xs font-bold">
                                <Gift className="w-3 h-3" />
                                {transaction.cashbackPercent}%
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-xs">{formatDate(transaction.timestamp)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${transaction.type === 'credit' ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                          {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                        {transaction.cashback > 0 && (
                          <p className="text-orange-400 text-xs font-semibold">
                            +{formatCurrency(transaction.cashback)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Cashback Champions Mini Leaderboard */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-lg font-bold text-white">Top Cashback Champions</h3>
                </div>
                <button
                  onClick={() => navigate('/leaderboard')}
                  className="text-yellow-400 text-sm font-semibold hover:text-yellow-300 flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {topCashbackUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No rankings yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topCashbackUsers.map((user, index) => {
                    const rank = index + 1;
                    const isCurrentUser = user.upiId === userData?.upiId;

                    return (
                      <div
                        key={user.upiId}
                        className={`flex items-center justify-between p-4 rounded-xl transition-all ${isCurrentUser
                          ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50'
                          : 'bg-white/5 hover:bg-white/10'
                          }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-12 h-12 bg-gradient-to-br ${getRankColor(rank)} rounded-xl flex items-center justify-center shadow-lg`}>
                            {getRankIcon(rank)}
                          </div>
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-900" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-white font-semibold">{user.name}</h4>
                              {isCurrentUser && (
                                <span className="px-2 py-0.5 bg-yellow-500/30 border border-yellow-500/50 text-yellow-300 rounded text-xs font-bold">
                                  You
                                </span>
                              )}
                              {rank === 1 && (
                                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                              )}
                            </div>
                            <p className="text-gray-400 text-xs font-mono">{user.upiId}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 justify-end mb-1">
                            <Gift className="w-4 h-4 text-orange-400" />
                            <p className="text-white font-bold">{formatCurrency(user.totalCashback)}</p>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-400 text-xs">
                            <span className="font-semibold">
                              {rank === 1 ? 'Gold' : rank === 2 ? 'Silver' : 'Bronze'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Challenge Card */}
              <div className="mt-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-sm mb-1">Keep Earning!</h4>
                    <p className="text-gray-400 text-xs mb-2">
                      Make more transactions to climb the leaderboard and earn cashback rewards
                    </p>
                    <button
                      onClick={() => navigate('/leaderboard')}
                      className="text-yellow-400 text-xs font-semibold hover:text-yellow-300 flex items-center gap-1"
                    >
                      View Full Rankings <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">This Month</p>
                      <p className="text-white font-bold">{formatCurrency(userData?.credited || 0)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Transactions</p>
                      <p className="text-white font-bold">{recentTransactions.length}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Gift className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Cashback Earned</p>
                      <p className="text-white font-bold">{formatCurrency(userData?.totalCashback || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6">
              <TrendingUp className="w-10 h-10 text-purple-400 mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Explore Stock Market</h3>
              <p className="text-gray-300 text-sm mb-4">Trade you own value using MudraPay Balance</p>
              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all"
                onClick={() => navigate('/stocks')}>
                Open Now
              </button>
            </div>

            {/* Redeem Card */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6">
              <Gift className="w-10 h-10 text-purple-400 mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Redeem Money</h3>
              <p className="text-gray-300 text-sm mb-4">Enter your points and get instant money to your Account</p>
              <button
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all"
                onClick={() => {
                  setShowCashbackRedeemPopup(true);
                  setCashbackRedeemForm({ cashbackAmount: '', userUpiId: '' });
                  setCashbackRedeemMessage({ type: '', text: '' });
                }}
              >
                Redeem Now
              </button>
            </div>

            {/* Support Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Need Help?</h3>
              <p className="text-gray-400 text-sm mb-4">Our support team is available 24/7</p>
              <button className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold py-3 rounded-xl hover:bg-emerald-500/20 transition-all">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cashback Redemption Popup */}
      {showCashbackRedeemPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full relative animate-scale-in">
            <button
              onClick={() => {
                setShowCashbackRedeemPopup(false);
                setCashbackRedeemForm({ cashbackAmount: '', userUpiId: '' });
                setCashbackRedeemMessage({ type: '', text: '' });
              }}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Redeem Cashback</h2>
              <p className="text-gray-400">Convert your cashback to real money</p>
            </div>

            {/* Exchange Rate Info */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-400 text-sm font-semibold">100 Cashback Points</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400" />
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-400 text-sm font-semibold">₹1 INR</span>
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-2 text-center">
                Available: {formatCurrency(userData?.totalCashback || 0)} cashback
              </p>
            </div>

            {cashbackRedeemMessage.text && (
              <div className={`flex items-center gap-3 p-4 rounded-xl mb-4 ${cashbackRedeemMessage.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}>
                {cashbackRedeemMessage.type === 'success' ? (
                  <Check size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
                <span className="text-sm font-medium">{cashbackRedeemMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleCashbackRedeem} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Cashback Amount to Redeem
                </label>
                <input
                  type="number"
                  value={cashbackRedeemForm.cashbackAmount}
                  onChange={(e) => {
                    const amount = e.target.value;
                    setCashbackRedeemForm({
                      ...cashbackRedeemForm,
                      cashbackAmount: amount
                    });
                    setCashbackRedeemMessage({ type: '', text: '' });
                  }}
                  placeholder="Min: 100 points"
                  min="100"
                  max={userData?.totalCashback || 0}
                  disabled={cashbackRedeemLoading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all disabled:opacity-50"
                />
                {cashbackRedeemForm.cashbackAmount >= 100 && (
                  <p className="text-emerald-400 text-sm mt-2 text-center">
                    You will receive: ₹{(cashbackRedeemForm.cashbackAmount / 100).toFixed(2)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Your UPI ID (for receiving payment)
                </label>
                <input
                  type="text"
                  value={cashbackRedeemForm.userUpiId}
                  onChange={(e) => {
                    setCashbackRedeemForm({
                      ...cashbackRedeemForm,
                      userUpiId: e.target.value
                    });
                    setCashbackRedeemMessage({ type: '', text: '' });
                  }}
                  placeholder="yourname@paytm / yourname@phonepe"
                  disabled={cashbackRedeemLoading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all disabled:opacity-50"
                />
                <p className="text-gray-500 text-xs mt-2">
                  Enter your real UPI ID to receive money in your bank account
                </p>
              </div>

              <button
                type="submit"
                disabled={cashbackRedeemLoading || !cashbackRedeemForm.cashbackAmount || !cashbackRedeemForm.userUpiId}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {cashbackRedeemLoading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <DollarSign size={20} />
                    Submit Redemption Request
                  </>
                )}
              </button>
            </form>

            {/* Info Card */}
            <div className="mt-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm mb-1">Important Information</h4>
                  <ul className="text-gray-400 text-xs space-y-1">
                    <li>• Minimum redemption: 100 cashback points</li>
                    <li>• Processing time: 24-48 hours</li>
                    <li>• Money will be sent to your UPI ID</li>
                    <li>• Each request requires admin approval</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Popup (Cards) */}
      {showQRPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full relative animate-scale-in">
            <button
              onClick={() => setShowQRPopup(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-slate-900" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Your QR Code</h2>
              <p className="text-gray-400 mb-6">Scan this code to receive payments</p>

              <div className="bg-white p-6 rounded-2xl mb-6">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${userData?.upiId}`}
                  alt="QR Code"
                  className="mx-auto"
                />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                <p className="text-gray-400 text-xs mb-1">Your UPI ID</p>
                <div className="flex items-center justify-between">
                  <p className="text-white font-mono font-semibold">{userData?.upiId}</p>
                  <button
                    onClick={() => copyToClipboard(userData?.upiId)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowQRPopup(false)}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold py-3 rounded-xl hover:shadow-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Popup (Scan QR) */}
      {showScanPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full relative animate-scale-in">
            <button
              onClick={stopScanning}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Scan QR Code</h2>
              <p className="text-gray-400 mb-6">Position the QR code within the frame</p>

              {!scanning ? (
                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-8">
                    <ScanLine className="w-24 h-24 text-purple-400 mx-auto mb-4" />
                    <p className="text-gray-400">Ready to scan</p>
                  </div>
                  <button
                    onClick={startScanning}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all"
                  >
                    Start Camera
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div id="qr-reader" className="rounded-xl overflow-hidden"></div>
                  <button
                    onClick={stopScanning}
                    className="w-full bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-all"
                  >
                    Stop Scanning
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send Money Popup */}
      {showSendMoneyPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full relative animate-scale-in">
            <button
              onClick={() => {
                setShowSendMoneyPopup(false);
                setPaymentForm({ recipientUpiId: '', amount: '', description: '' });
                setPaymentMessage({ type: '', text: '' });
              }}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Send Payment</h2>
              <p className="text-gray-400">Enter recipient details</p>
            </div>

            {paymentMessage.text && (
              <div className={`flex items-center gap-3 p-4 rounded-xl mb-4 ${paymentMessage.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}>
                {paymentMessage.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                <span className="text-sm font-medium">{paymentMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSendMoney} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Recipient UPI ID
                </label>
                <input
                  type="text"
                  name="recipientUpiId"
                  value={paymentForm.recipientUpiId}
                  onChange={handlePaymentChange}
                  placeholder="example@mudra.pay"
                  required
                  disabled={paymentLoading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={paymentForm.amount}
                  onChange={handlePaymentChange}
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  required
                  disabled={paymentLoading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  name="description"
                  value={paymentForm.description}
                  onChange={handlePaymentChange}
                  placeholder="Payment for..."
                  disabled={paymentLoading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={paymentLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {paymentLoading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    Send Money
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* UPI PIN Verification Popup */}
      {showUpiPinPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full relative animate-scale-in">
            <button
              onClick={() => {
                setShowUpiPinPopup(false);
                setUpiPin('');
                setPinError('');
                setPendingPayment(null);
              }}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-slate-900" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Enter UPI PIN</h2>
              <p className="text-gray-400">Verify your identity to complete payment</p>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-4 text-left">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm">Amount</span>
                  <span className="text-white font-bold text-lg">₹{pendingPayment?.amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">To</span>
                  <span className="text-white text-sm font-mono">{pendingPayment?.recipientUpiId}</span>
                </div>
              </div>
            </div>

            {pinError && (
              <div className="flex items-center gap-2 p-3 rounded-xl mb-4 bg-red-500/10 border border-red-500/30 text-red-400">
                <AlertCircle size={18} />
                <span className="text-sm font-medium">{pinError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  UPI PIN
                </label>
                <input
                  type="password"
                  value={upiPin}
                  onChange={(e) => {
                    setUpiPin(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setPinError('');
                  }}
                  placeholder="Enter 4-6 digit PIN"
                  maxLength="6"
                  autoFocus
                  disabled={paymentLoading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Default PIN is 1234 (Change it in settings)
                </p>
              </div>

              <button
                onClick={processPaymentWithPin}
                disabled={paymentLoading || !upiPin || upiPin.length < 4}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {paymentLoading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Verifying...
                  </>
                ) : (
                  <>
                    Confirm Payment
                    <Check size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Redeem Code Popup */}
      {showRedeemPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full relative animate-scale-in">
            <button
              onClick={() => {
                setShowRedeemPopup(false);
                setRedeemCodeInput('');
                setRedeemMessage({ type: '', text: '' });
              }}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Redeem Gift Code</h2>
              <p className="text-gray-400">Enter your code and get instant rewards</p>
            </div>

            {redeemMessage.text && (
              <div className={`flex items-center gap-3 p-4 rounded-xl mb-4 ${redeemMessage.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}>
                {redeemMessage.type === 'success' ? (
                  <Check size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
                <span className="text-sm font-medium">{redeemMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleRedeemCode} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Redeem Code
                </label>
                <input
                  type="text"
                  value={redeemCodeInput}
                  onChange={(e) => {
                    setRedeemCodeInput(e.target.value.toUpperCase());
                    setRedeemMessage({ type: '', text: '' });
                  }}
                  placeholder="Enter code (e.g., ABC123XYZ)"
                  maxLength="20"
                  disabled={redeemLoading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-center text-xl font-mono tracking-wider placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all disabled:opacity-50 uppercase"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Enter the gift code you received
                </p>
              </div>

              <button
                type="submit"
                disabled={redeemLoading || !redeemCodeInput}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {redeemLoading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Redeeming...
                  </>
                ) : (
                  <>
                    <Gift size={20} />
                    Redeem Now
                  </>
                )}
              </button>
            </form>

            {/* Info Card */}
            <div className="mt-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm mb-1">How it works</h4>
                  <ul className="text-gray-400 text-xs space-y-1">
                    <li>• Enter your unique gift code</li>
                    <li>• Amount will be added instantly</li>
                    <li>• Each code can be used only once</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease;
        }
        
        #qr-reader {
          border: 2px solid rgba(147, 51, 234, 0.3);
        }
        
        #qr-reader__dashboard_section {
          display: none !important;
        }
        
        #qr-reader video {
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
