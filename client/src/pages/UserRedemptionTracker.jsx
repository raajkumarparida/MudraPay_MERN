import React, { useState, useEffect } from 'react';
import {
  Gift, DollarSign, Clock, CheckCircle, XCircle, AlertCircle,
  Calendar, Eye, X, ArrowUpRight, Loader, RefreshCw, History
} from 'lucide-react';
import axios from 'axios';

const UserRedemptionTracker = ({ userData }) => {
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRedemption, setSelectedRedemption] = useState(null);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);

  useEffect(() => {
    fetchRedemptions();
  }, []);

  const fetchRedemptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        'https://mudrapay-mern.onrender.com/api/cashback/my-redemptions',
        { withCredentials: true }
      );

      if (response.data.success) {
        setRedemptions(response.data.redemptions);
      }
    } catch (error) {
      console.error('Error fetching redemptions:', error);
    } finally {
      setLoading(false);
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
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending':
        return 'Your request is being reviewed by admin';
      case 'approved':
        return 'Request approved! Payment will be sent soon';
      case 'completed':
        return 'Payment sent successfully to your UPI ID';
      case 'rejected':
        return 'Request rejected. Cashback has been refunded';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-center py-8">
          <Loader className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <History className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">My Redemptions</h3>
              <p className="text-xs text-gray-400">Track your cashback redemption requests</p>
            </div>
          </div>
          <button
            onClick={fetchRedemptions}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {redemptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-gray-400 mb-2">No redemption requests yet</p>
            <p className="text-gray-500 text-sm">
              Redeem your cashback points to see them here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {redemptions.map((redemption) => (
              <div
                key={redemption._id}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all cursor-pointer"
                onClick={() => {
                  setSelectedRedemption(redemption);
                  setShowDetailsPopup(true);
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-lg text-xs font-bold ${getStatusColor(redemption.status)}`}>
                        {getStatusIcon(redemption.status)}
                        {redemption.status.charAt(0).toUpperCase() + redemption.status.slice(1)}
                      </span>
                      {redemption.status === 'pending' && (
                        <span className="text-xs text-gray-500 animate-pulse">● Processing</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mb-1">{getStatusMessage(redemption.status)}</p>
                  </div>
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Gift className="w-4 h-4 text-orange-400" />
                      <span className="text-xs text-gray-400">Cashback</span>
                    </div>
                    <p className="text-orange-400 font-bold">{redemption.cashbackAmount} points</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-gray-400">Amount</span>
                    </div>
                    <p className="text-emerald-400 font-bold">{formatCurrency(redemption.inrAmount)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-400">{formatDate(redemption.requestedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-purple-400 text-xs font-semibold">
                    View Details
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Popup */}
      {showDetailsPopup && selectedRedemption && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-2xl w-full relative animate-scale-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowDetailsPopup(false);
                setSelectedRedemption(null);
              }}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Redemption Details</h2>
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm font-bold ${getStatusColor(selectedRedemption.status)}`}>
                {getStatusIcon(selectedRedemption.status)}
                {selectedRedemption.status.charAt(0).toUpperCase() + selectedRedemption.status.slice(1)}
              </span>
            </div>

            {/* Status Message */}
            <div className={`mb-6 p-4 rounded-xl border ${
              selectedRedemption.status === 'pending' ? 'bg-orange-500/10 border-orange-500/30' :
              selectedRedemption.status === 'approved' ? 'bg-blue-500/10 border-blue-500/30' :
              selectedRedemption.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/30' :
              'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  selectedRedemption.status === 'pending' ? 'bg-orange-500/20' :
                  selectedRedemption.status === 'approved' ? 'bg-blue-500/20' :
                  selectedRedemption.status === 'completed' ? 'bg-emerald-500/20' :
                  'bg-red-500/20'
                }`}>
                  {getStatusIcon(selectedRedemption.status)}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold mb-1 ${
                    selectedRedemption.status === 'pending' ? 'text-orange-400' :
                    selectedRedemption.status === 'approved' ? 'text-blue-400' :
                    selectedRedemption.status === 'completed' ? 'text-emerald-400' :
                    'text-red-400'
                  }`}>
                    {getStatusMessage(selectedRedemption.status)}
                  </p>
                  {selectedRedemption.status === 'pending' && (
                    <p className="text-gray-400 text-xs">
                      Estimated processing time: 24-48 hours
                    </p>
                  )}
                  {selectedRedemption.status === 'approved' && (
                    <p className="text-gray-400 text-xs">
                      Admin will send payment to your UPI ID soon
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Amount Details */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Amount Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-400 text-sm">Cashback Points</span>
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-400 font-bold text-lg">{selectedRedemption.cashbackAmount}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-400 text-sm">You Will Receive</span>
                  <span className="text-emerald-400 font-bold text-xl">{formatCurrency(selectedRedemption.inrAmount)}</span>
                </div>
                <div className="text-center text-gray-500 text-xs pt-2 border-t border-white/10">
                  Exchange Rate: 100 Cashback Points = ₹1 INR
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                Payment Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Payment Method</span>
                  <span className="text-white font-mono text-sm">UPI Transfer</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Your UPI ID</span>
                  <span className="text-white font-mono text-sm">{selectedRedemption.userUpiId}</span>
                </div>
                {selectedRedemption.transactionProof && (
                  <div className="flex justify-between items-center p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <span className="text-emerald-400 text-sm font-semibold">Transaction ID</span>
                    <span className="text-emerald-400 font-mono text-sm">{selectedRedemption.transactionProof}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Request Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-white text-sm font-semibold">Request Submitted</p>
                    <p className="text-gray-400 text-xs">{formatDate(selectedRedemption.requestedAt)}</p>
                  </div>
                </div>

                {selectedRedemption.approvedAt && (
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 ${selectedRedemption.status === 'rejected' ? 'bg-red-500/20' : 'bg-emerald-500/20'} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <div className={`w-3 h-3 ${selectedRedemption.status === 'rejected' ? 'bg-red-400' : 'bg-emerald-400'} rounded-full`}></div>
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-white text-sm font-semibold">
                        {selectedRedemption.status === 'rejected' ? 'Request Rejected' : 'Request Approved'}
                      </p>
                      <p className="text-gray-400 text-xs">{formatDate(selectedRedemption.approvedAt)}</p>
                      {selectedRedemption.approvedBy && (
                        <p className="text-gray-500 text-xs mt-1">by {selectedRedemption.approvedBy.adminName}</p>
                      )}
                    </div>
                  </div>
                )}

                {selectedRedemption.completedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-white text-sm font-semibold">Payment Completed</p>
                      <p className="text-gray-400 text-xs">{formatDate(selectedRedemption.completedAt)}</p>
                      <p className="text-emerald-400 text-xs mt-1">✓ Money sent to your UPI ID</p>
                    </div>
                  </div>
                )}

                {selectedRedemption.status === 'pending' && !selectedRedemption.approvedAt && (
                  <div className="flex items-start gap-3 opacity-50">
                    <div className="w-8 h-8 bg-gray-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-3 h-3 border-2 border-gray-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-gray-400 text-sm">Awaiting Admin Approval</p>
                      <p className="text-gray-500 text-xs">Usually takes 24-48 hours</p>
                    </div>
                  </div>
                )}

                {selectedRedemption.status === 'approved' && !selectedRedemption.completedAt && (
                  <div className="flex items-start gap-3 opacity-50">
                    <div className="w-8 h-8 bg-gray-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-3 h-3 border-2 border-gray-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-gray-400 text-sm">Payment Processing</p>
                      <p className="text-gray-500 text-xs">Admin will send payment soon</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rejection Reason */}
            {selectedRedemption.rejectionReason && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-red-400 text-sm font-bold mb-1">Rejection Reason</p>
                    <p className="text-gray-300 text-sm">{selectedRedemption.rejectionReason}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      ✓ Your {selectedRedemption.cashbackAmount} cashback points have been refunded
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowDetailsPopup(false)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all"
            >
              Close
            </button>
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
    </>
  );
};

export default UserRedemptionTracker;