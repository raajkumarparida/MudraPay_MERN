import React, { useState, useEffect } from 'react';
import {
  Shield, Gift, TrendingUp, Users, DollarSign, Activity,
  LogOut, RefreshCw, Plus, Copy, Check, Eye, EyeOff,
  Calendar, Clock, AlertCircle, CheckCircle, XCircle,
  Loader, ArrowUpRight, ArrowDownLeft, Crown, Search,
  Filter, Download, Settings, Bell, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api.js';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [redeemCodes, setRedeemCodes] = useState([]);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('codes'); // 'codes' or 'cashback'

  // Cashback redemption states
  const [cashbackRequests, setCashbackRequests] = useState([]);
  const [cashbackStats, setCashbackStats] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });
  const [showApprovePopup, setShowApprovePopup] = useState(false);
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [showCompletePopup, setShowCompletePopup] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [transactionProof, setTransactionProof] = useState('');
  const [copiedUpi, setCopiedUpi] = useState('');

  // Create form state
  const [createForm, setCreateForm] = useState({
    amount: '',
    description: ''
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createMessage, setCreateMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    checkAdminAuth();
    fetchAdminData();
    fetchCashbackRequests();
  }, []);

  useEffect(() => {
    if (activeTab === 'cashback') {
      fetchCashbackRequests();
    }
  }, [filterStatus, activeTab]);

  const checkAdminAuth = async () => {
    try {
      const authCheck = await api.post(
        '/auth/is-auth',
        {},
        { withCredentials: true }
      );

      if (!authCheck.data.success) {
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/login', { replace: true });
    }
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      const [statsRes, codesRes] = await Promise.all([
        api.get('/admin/redeem-stats', { withCredentials: true }),
        api.get('/admin/redeem-codes', { withCredentials: true })
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      if (codesRes.data.success) {
        setRedeemCodes(codesRes.data.redeemCodes);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCashbackRequests = async () => {
    try {
      const response = await api.get(
        `/cashback/redemption-requests?status=${filterStatus}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setCashbackRequests(response.data.requests);
        setCashbackStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching cashback requests:', error);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      setActionLoading(true);
      setActionMessage({ type: '', text: '' });

      const response = await api.post(
        '/cashback/approve-redemption',
        { redemptionId: requestId },
        { withCredentials: true }
      );

      if (response.data.success) {
        setActionMessage({
          type: 'success',
          text: 'Redemption request approved successfully'
        });
        
        await fetchCashbackRequests();
        
        setTimeout(() => {
          setShowApprovePopup(false);
          setShowDetailsPopup(false);
          setActionMessage({ type: '', text: '' });
        }, 2000);
      } else {
        setActionMessage({
          type: 'error',
          text: response.data.message || 'Failed to approve request'
        });
      }
    } catch (error) {
      setActionMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to approve request'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (requestId) => {
    try {
      setActionLoading(true);
      setActionMessage({ type: '', text: '' });

      const response = await api.post(
        '/cashback/complete-redemption',
        { 
          redemptionId: requestId,
          transactionProof 
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setActionMessage({
          type: 'success',
          text: 'Redemption marked as completed'
        });
        
        await fetchCashbackRequests();
        
        setTimeout(() => {
          setShowCompletePopup(false);
          setShowDetailsPopup(false);
          setActionMessage({ type: '', text: '' });
          setTransactionProof('');
        }, 2000);
      } else {
        setActionMessage({
          type: 'error',
          text: response.data.message || 'Failed to complete request'
        });
      }
    } catch (error) {
      setActionMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to complete request'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    if (!rejectionReason.trim()) {
      setActionMessage({
        type: 'error',
        text: 'Please provide a rejection reason'
      });
      return;
    }

    try {
      setActionLoading(true);
      setActionMessage({ type: '', text: '' });

      const response = await api.post(
        '/cashback/reject-redemption',
        { 
          redemptionId: requestId,
          reason: rejectionReason 
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setActionMessage({
          type: 'success',
          text: 'Redemption request rejected and cashback refunded'
        });
        
        await fetchCashbackRequests();
        
        setTimeout(() => {
          setShowRejectPopup(false);
          setShowDetailsPopup(false);
          setActionMessage({ type: '', text: '' });
          setRejectionReason('');
        }, 2000);
      } else {
        setActionMessage({
          type: 'error',
          text: response.data.message || 'Failed to reject request'
        });
      }
    } catch (error) {
      setActionMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to reject request'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', {}, { withCredentials: true });
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login', { replace: true });
    }
  };

  const handleCreateFormChange = (e) => {
    setCreateForm({
      ...createForm,
      [e.target.name]: e.target.value
    });
    setCreateMessage({ type: '', text: '' });
  };

  const handleCreateRedeemCode = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateMessage({ type: '', text: '' });

    try {
      const response = await api.post(
        '/admin/create-redeem-code',
        createForm,
        { withCredentials: true }
      );

      if (response.data.success) {
        setCreateMessage({
          type: 'success',
          text: `Code created: ${response.data.redeemCode.code}`
        });
        setCreateForm({ amount: '', description: '' });
        
        await fetchAdminData();

        setTimeout(() => {
          setShowCreatePopup(false);
          setCreateMessage({ type: '', text: '' });
        }, 3000);
      } else {
        setCreateMessage({
          type: 'error',
          text: response.data.message || 'Failed to create code'
        });
      }
    } catch (error) {
      setCreateMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create code'
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const copyToClipboard = (text, type = 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(''), 2000);
    } else {
      setCopiedUpi(text);
      setTimeout(() => setCopiedUpi(''), 2000);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-500/20 border-orange-500/30 text-orange-400';
      case 'approved':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
      case 'completed':
        return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
      case 'rejected':
        return 'bg-red-500/20 border-red-500/30 text-red-400';
      default:
        return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'approved':
        return <CheckCircle className="w-3 h-3" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      case 'rejected':
        return <XCircle className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const filteredCodes = redeemCodes.filter(code => {
    const matchesStatus = 
      filterStatus === 'all' ? true :
      filterStatus === 'redeemed' ? code.isRedeemed :
      filterStatus === 'pending' ? !code.isRedeemed : true;

    const matchesSearch = 
      code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (code.redeemedBy?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const filteredCashbackRequests = cashbackRequests.filter(request => {
    const matchesSearch = 
      request.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.userUpiId.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const statCards = [
    {
      title: 'Total Codes',
      value: stats?.totalCodes || 0,
      icon: Gift,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      tab: 'codes'
    },
    {
      title: 'Redeemed',
      value: stats?.redeemedCodes || 0,
      icon: CheckCircle,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
      tab: 'codes'
    },
    {
      title: 'Pending Codes',
      value: stats?.pendingCodes || 0,
      icon: Clock,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-400',
      tab: 'codes'
    },
    {
      title: 'Cashback Requests',
      value: cashbackStats?.pending || 0,
      icon: DollarSign,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400',
      tab: 'cashback',
      clickable: true
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading admin dashboard...</p>
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
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-xs text-gray-400">MudraPay Management</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  fetchAdminData();
                  fetchCashbackRequests();
                }}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5 text-gray-300" />
              </button>
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-gray-300" />
                {cashbackStats?.pending > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              onClick={() => stat.clickable && setActiveTab('cashback')}
              className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all ${
                stat.clickable ? 'cursor-pointer hover:bg-white/10 hover:scale-105' : 'hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <div className={`px-2 py-1 bg-gradient-to-r ${stat.color} rounded-lg`}>
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
              {stat.clickable && stat.value > 0 && (
                <p className="text-xs text-gray-500 mt-2">Click to review</p>
              )}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 mb-8 inline-flex">
          <button
            onClick={() => setActiveTab('codes')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'codes'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Redeem Codes
            </div>
          </button>
          <button
            onClick={() => setActiveTab('cashback')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all relative ${
              activeTab === 'cashback'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Cashback Requests
              {cashbackStats?.pending > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold">
                  {cashbackStats.pending}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Redeem Codes Tab Content */}
        {activeTab === 'codes' && (
          <>
            {/* Action Bar */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex-1 w-full sm:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search codes, descriptions, or users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="flex bg-white/5 rounded-xl p-1 flex-1 sm:flex-initial">
                    {['all', 'pending', 'redeemed'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                          filterStatus === status
                            ? 'bg-emerald-500 text-white'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowCreatePopup(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all whitespace-nowrap"
                  >
                    <Plus className="w-5 h-5" />
                    Create Code
                  </button>
                </div>
              </div>
            </div>

            {/* Redeem Codes Table */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden mb-8">
              <div className="p-6 border-b border-white/10">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Redeem Codes</h2>
                  <span className="text-sm text-gray-400">
                    {filteredCodes.length} {filteredCodes.length === 1 ? 'code' : 'codes'}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                {filteredCodes.length === 0 ? (
                  <div className="text-center py-12">
                    <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">No codes found</p>
                    <p className="text-gray-500 text-sm">
                      {searchQuery || filterStatus !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Create your first redeem code'}
                    </p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-4 text-gray-400 font-semibold text-sm">Code</th>
                        <th className="text-left p-4 text-gray-400 font-semibold text-sm">Amount</th>
                        <th className="text-left p-4 text-gray-400 font-semibold text-sm">Status</th>
                        <th className="text-left p-4 text-gray-400 font-semibold text-sm">Created</th>
                        <th className="text-left p-4 text-gray-400 font-semibold text-sm">Redeemed By</th>
                        <th className="text-left p-4 text-gray-400 font-semibold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCodes.map((code) => (
                        <tr key={code._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div>
                              <p className="text-white font-mono font-bold">{code.code}</p>
                              <p className="text-gray-400 text-xs mt-1">{code.description}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-emerald-400 font-bold">{formatCurrency(code.amount)}</p>
                          </td>
                          <td className="p-4">
                            {code.isRedeemed ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold">
                                <CheckCircle className="w-3 h-3" />
                                Redeemed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-lg text-xs font-semibold">
                                <Clock className="w-3 h-3" />
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-white text-sm">{formatDate(code.timestamp)}</p>
                              <p className="text-gray-400 text-xs">by {code.createdBy.name}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            {code.isRedeemed ? (
                              <div>
                                <p className="text-white text-sm font-semibold">{code.redeemedBy.name}</p>
                                <p className="text-gray-400 text-xs font-mono">{code.redeemedBy.upiId}</p>
                                <p className="text-gray-500 text-xs">{formatDate(code.redeemedAt)}</p>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => copyToClipboard(code.code, 'code')}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              title="Copy code"
                            >
                              {copiedCode === code.code ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Quick Stats</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400">Redemption Rate</span>
                    <span className="text-purple-400 font-bold">
                      {stats?.totalCodes ? Math.round((stats.redeemedCodes / stats.totalCodes) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400">Avg. Code Value</span>
                    <span className="text-purple-400 font-bold">
                      {formatCurrency(stats?.totalCodes ? (stats.totalAmount / stats.totalCodes) : 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Cashback Requests Tab Content */}
        {activeTab === 'cashback' && (
          <>
            {/* Cashback Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-400" />
                  </div>
                  <p className="text-gray-400 text-sm">Pending</p>
                </div>
                <p className="text-2xl font-bold text-orange-400">{cashbackStats?.pending || 0}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-gray-400 text-sm">Approved</p>
                </div>
                <p className="text-2xl font-bold text-blue-400">{cashbackStats?.approved || 0}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-gray-400 text-sm">Completed</p>
                </div>
                <p className="text-2xl font-bold text-emerald-400">{cashbackStats?.completed || 0}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <p className="text-gray-400 text-sm">Rejected</p>
                </div>
                <p className="text-2xl font-bold text-red-400">{cashbackStats?.rejected || 0}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex-1 w-full sm:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or UPI ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="flex bg-white/5 rounded-xl p-1 flex-1 sm:flex-initial">
                    {['all', 'pending', 'approved', 'completed', 'rejected'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                          filterStatus === status
                            ? 'bg-purple-500 text-white'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={fetchCashbackRequests}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className="w-5 h-5 text-gray-300" />
                  </button>
                </div>
              </div>
            </div>

            {/* Cashback Requests Table */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Cashback Redemption Requests</h2>
                  <span className="text-sm text-gray-400">
                    {filteredCashbackRequests.length} {filteredCashbackRequests.length === 1 ? 'request' : 'requests'}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                {filteredCashbackRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">No redemption requests found</p>
                    <p className="text-gray-500 text-sm">
                      {searchQuery || filterStatus !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Requests will appear here'}
                    </p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-4 text-gray-400 font-semibold text-sm">User</th>
                        <th className="text-left p-4 text-gray-400 font-semibold text-sm">Cashback</th>
                        <th className="text-left p-4 text-gray-400 font-semibold text-sm">INR Amount</th>
                        <th className="text-left p-4 text-gray-400 font-semibold text-sm">UPI ID</th>
                        <th className="text-left p-4 text-gray-400 font-semibold text-sm">Status</th>
                        <th className="text-left p-4 text-gray-400 font-semibold text-sm">Requested</th>
                        <th className="text-left p-4 text-gray-400 font-semibold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCashbackRequests.map((request) => (
                        <tr key={request._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-semibold text-sm">{request.userName}</p>
                                <p className="text-gray-400 text-xs">{request.userEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Gift className="w-4 h-4 text-orange-400" />
                              <p className="text-orange-400 font-bold">{request.cashbackAmount}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-emerald-400" />
                              <p className="text-emerald-400 font-bold">{formatCurrency(request.inrAmount)}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <p className="text-white font-mono text-sm">{request.userUpiId}</p>
                              <button
                                onClick={() => copyToClipboard(request.userUpiId, 'upi')}
                                className="p-1 hover:bg-white/10 rounded transition-colors"
                              >
                                {copiedUpi === request.userUpiId ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 border rounded-lg text-xs font-semibold ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <p className="text-white text-sm">{formatDate(request.requestedAt)}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDetailsPopup(true);
                                setActionMessage({ type: '', text: '' });
                              }}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4 text-gray-400" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create Redeem Code Popup */}
      {showCreatePopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full relative animate-scale-in">
            <button
              onClick={() => {
                setShowCreatePopup(false);
                setCreateForm({ amount: '', description: '' });
                setCreateMessage({ type: '', text: '' });
              }}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5 text-gray-400" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Create Redeem Code</h2>
              <p className="text-gray-400">Generate a new gift code</p>
            </div>

            {createMessage.text && (
              <div className={`flex items-center gap-3 p-4 rounded-xl mb-4 ${
                createMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {createMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span className="text-sm font-medium">{createMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateRedeemCode} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={createForm.amount}
                  onChange={handleCreateFormChange}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  required
                  disabled={createLoading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={createForm.description}
                  onChange={handleCreateFormChange}
                  placeholder="Gift code description..."
                  rows="3"
                  disabled={createLoading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all disabled:opacity-50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={createLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {createLoading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    Create Code
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Request Details Popup */}
      {showDetailsPopup && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-2xl w-full relative animate-scale-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowDetailsPopup(false);
                setSelectedRequest(null);
                setActionMessage({ type: '', text: '' });
              }}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5 text-gray-400" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Redemption Request Details</h2>
              <span className={`inline-flex items-center gap-2 px-3 py-1 border rounded-lg text-sm font-semibold ${getStatusColor(selectedRequest.status)}`}>
                {getStatusIcon(selectedRequest.status)}
                {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
              </span>
            </div>

            {actionMessage.text && (
              <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {actionMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span className="text-sm font-medium">{actionMessage.text}</span>
              </div>
            )}

            {/* User Info */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" />
                User Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Name</span>
                  <span className="text-white font-semibold">{selectedRequest.userName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Email</span>
                  <span className="text-white font-mono text-sm">{selectedRequest.userEmail}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">UPI ID</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-mono text-sm">{selectedRequest.userUpiId}</span>
                    <button
                      onClick={() => copyToClipboard(selectedRequest.userUpiId, 'upi')}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      {copiedUpi === selectedRequest.userUpiId ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Amount Info */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Amount Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Cashback Points</span>
                  <span className="text-orange-400 font-bold text-lg">{selectedRequest.cashbackAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Converted Amount</span>
                  <span className="text-emerald-400 font-bold text-xl">{formatCurrency(selectedRequest.inrAmount)}</span>
                </div>
                <div className="text-center text-gray-500 text-xs pt-2 border-t border-white/10">
                  100 Cashback Points = ₹1 INR
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">Request Submitted</p>
                    <p className="text-gray-400 text-xs">{formatDate(selectedRequest.requestedAt)}</p>
                  </div>
                </div>
                {selectedRequest.approvedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-semibold">
                        {selectedRequest.status === 'rejected' ? 'Rejected' : 'Approved'}
                      </p>
                      <p className="text-gray-400 text-xs">{formatDate(selectedRequest.approvedAt)}</p>
                      {selectedRequest.approvedBy && (
                        <p className="text-gray-500 text-xs">by {selectedRequest.approvedBy.adminName}</p>
                      )}
                    </div>
                  </div>
                )}
                {selectedRequest.completedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-semibold">Completed</p>
                      <p className="text-gray-400 text-xs">{formatDate(selectedRequest.completedAt)}</p>
                      {selectedRequest.transactionProof && (
                        <p className="text-gray-500 text-xs font-mono">UTR: {selectedRequest.transactionProof}</p>
                      )}
                    </div>
                  </div>
                )}
                {selectedRequest.rejectionReason && (
                  <div className="flex items-start gap-3 mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-red-400 text-sm font-semibold mb-1">Rejection Reason</p>
                      <p className="text-gray-300 text-xs">{selectedRequest.rejectionReason}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {selectedRequest.status === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowApprovePopup(true)}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  Approve
                </button>
                <button
                  onClick={() => setShowRejectPopup(true)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <XCircle size={20} />
                  Reject
                </button>
              </div>
            )}

            {selectedRequest.status === 'approved' && (
              <button
                onClick={() => setShowCompletePopup(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                Mark as Completed
              </button>
            )}
          </div>
        </div>
      )}

      {/* Approve Confirmation */}
      {showApprovePopup && selectedRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full relative animate-scale-in">
            <button
              onClick={() => setShowApprovePopup(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5 text-gray-400" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Approve Request?</h2>
              <p className="text-gray-400 mb-4">
                You are about to approve cashback redemption for {selectedRequest.userName}
              </p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm">Amount to Send</span>
                  <span className="text-emerald-400 font-bold text-lg">{formatCurrency(selectedRequest.inrAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">To UPI</span>
                  <span className="text-white font-mono text-sm">{selectedRequest.userUpiId}</span>
                </div>
              </div>
            </div>

            {actionMessage.text && (
              <div className={`flex items-center gap-3 p-4 rounded-xl mb-4 ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {actionMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span className="text-sm font-medium">{actionMessage.text}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowApprovePopup(false)}
                disabled={actionLoading}
                className="flex-1 bg-white/5 border border-white/10 text-white font-semibold py-3 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprove(selectedRequest._id)}
                disabled={actionLoading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Approve
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Confirmation */}
      {showCompletePopup && selectedRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full relative animate-scale-in">
            <button
              onClick={() => {
                setShowCompletePopup(false);
                setTransactionProof('');
                setActionMessage({ type: '', text: '' });
              }}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5 text-gray-400" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Complete Payment</h2>
              <p className="text-gray-400 mb-4">
                Confirm that you have sent {formatCurrency(selectedRequest.inrAmount)} to the user
              </p>
            </div>

            {actionMessage.text && (
              <div className={`flex items-center gap-3 p-4 rounded-xl mb-4 ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {actionMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span className="text-sm font-medium">{actionMessage.text}</span>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Transaction Proof (UTR/Reference Number)
              </label>
              <input
                type="text"
                value={transactionProof}
                onChange={(e) => {
                  setTransactionProof(e.target.value);
                  setActionMessage({ type: '', text: '' });
                }}
                placeholder="Enter UTR or transaction ID"
                disabled={actionLoading}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all disabled:opacity-50"
              />
              <p className="text-gray-500 text-xs mt-2">
                Optional: Add transaction reference for record keeping
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCompletePopup(false);
                  setTransactionProof('');
                  setActionMessage({ type: '', text: '' });
                }}
                disabled={actionLoading}
                className="flex-1 bg-white/5 border border-white/10 text-white font-semibold py-3 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleComplete(selectedRequest._id)}
                disabled={actionLoading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Complete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation */}
      {showRejectPopup && selectedRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full relative animate-scale-in">
            <button
              onClick={() => {
                setShowRejectPopup(false);
                setRejectionReason('');
                setActionMessage({ type: '', text: '' });
              }}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5 text-gray-400" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Reject Request?</h2>
              <p className="text-gray-400 mb-4">
                The cashback will be refunded to {selectedRequest.userName}'s account
              </p>
            </div>

            {actionMessage.text && (
              <div className={`flex items-center gap-3 p-4 rounded-xl mb-4 ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {actionMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span className="text-sm font-medium">{actionMessage.text}</span>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  setActionMessage({ type: '', text: '' });
                }}
                placeholder="Explain why this request is being rejected..."
                rows="4"
                disabled={actionLoading}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all disabled:opacity-50 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectPopup(false);
                  setRejectionReason('');
                  setActionMessage({ type: '', text: '' });
                }}
                disabled={actionLoading}
                className="flex-1 bg-white/5 border border-white/10 text-white font-semibold py-3 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedRequest._id)}
                disabled={actionLoading || !rejectionReason.trim()}
                className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle size={20} />
                    Reject
                  </>
                )}
              </button>
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
      `}</style>
    </div>
  );
};

export default AdminDashboard;