// ===== pages/TransactionHistory.jsx (UPDATED WITH CASHBACK) =====
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowUpRight, ArrowDownLeft, Calendar, Filter,
  Download, Search, Loader, Gift
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api.js';

const TransactionHistory = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, credit, debit
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCashbackEarned, setTotalCashbackEarned] = useState(0);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get(
        '/user/transactions',
        { withCredentials: true }
      );

      if (response.data.success) {
        setTransactions(response.data.transactions);
        
        // ✅ Calculate total cashback from all transactions
        const totalCashback = response.data.transactions.reduce((sum, t) => {
          return sum + (t.cashback || 0);
        }, 0);
        setTotalCashbackEarned(totalCashback);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
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
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.type === filter;
    const matchesSearch = 
      transaction.from.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.to.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Transaction ID', 'From', 'To', 'Amount', 'Cashback', 'Cashback %', 'Type', 'Status'];
    const rows = filteredTransactions.map(t => [
      formatDate(t.timestamp),
      t.transactionId,
      t.from.name,
      t.to.name,
      t.amount,
      t.cashback || 0,
      t.cashbackPercent || 0,
      t.type,
      t.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_cashback_${Date.now()}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-16 w-16 text-emerald-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">Transaction History</h1>
                <p className="text-xs text-gray-400">{transactions.length} total transactions</p>
              </div>
            </div>

            {/* ✅ NEW: Total Cashback Earned Badge */}
            <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-4 py-2 rounded-full">
              <Gift className="w-5 h-5 text-orange-400" />
              <div className="text-right">
                <p className="text-xs text-orange-400">Total Cashback Earned</p>
                <p className="text-orange-400 font-bold">{formatCurrency(totalCashbackEarned)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Filter & Export */}
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Transactions</option>
                <option value="credit">Received</option>
                <option value="debit">Sent</option>
              </select>

              <button
                onClick={exportToCSV}
                disabled={filteredTransactions.length === 0}
                className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={18} />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No transactions found</p>
              <p className="text-gray-500 text-sm mt-2">
                {searchTerm ? 'Try a different search term' : 'Make your first transaction to see it here'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.transactionId}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 ${
                        transaction.type === 'credit'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      } rounded-lg flex items-center justify-center flex-shrink-0`}>
                        {transaction.type === 'credit' ? (
                          <ArrowDownLeft className="w-6 h-6" />
                        ) : (
                          <ArrowUpRight className="w-6 h-6" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-white font-semibold text-lg">
                                {transaction.type === 'credit'
                                  ? `From ${transaction.from.name}`
                                  : `To ${transaction.to.name}`
                                }
                              </p>
                              {/* ✅ NEW: Cashback Badge in History */}
                              {transaction.cashback > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-full text-xs font-bold">
                                  <Gift className="w-3 h-3" />
                                  {transaction.cashbackPercent}% Cashback
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm font-mono">
                              {transaction.type === 'credit'
                                ? transaction.from.upiId
                                : transaction.to.upiId
                              }
                            </p>
                          </div>

                          <div className="text-right">
                            <p className={`text-xl font-bold ${
                              transaction.type === 'credit' ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </p>
                            {/* ✅ NEW: Show cashback earned */}
                            {transaction.cashback > 0 && (
                              <p className="text-orange-400 text-sm font-bold mt-1">
                                +{formatCurrency(transaction.cashback)} earned
                              </p>
                            )}
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                              transaction.status === 'success'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : transaction.status === 'pending'
                                ? 'bg-yellow-500/10 text-yellow-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}>
                              {transaction.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <p className="text-gray-400">{transaction.description}</p>
                            <p className="text-gray-500 text-xs mt-1">
                              {formatDate(transaction.timestamp)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-500 text-xs">Transaction ID</p>
                            <p className="text-gray-400 text-xs font-mono">{transaction.transactionId}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
