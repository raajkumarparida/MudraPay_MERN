import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart,
  ArrowUpRight, ArrowDownRight, RefreshCw, ShoppingCart, Wallet,
  Activity, Award, AlertCircle, Check, X, Loader, Eye, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StockPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [showTradePopup, setShowTradePopup] = useState(false);
  const [tradeType, setTradeType] = useState('buy');
  const [quantity, setQuantity] = useState('');
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeMessage, setTradeMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('market');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchData();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchStocks();
      if (activeTab === 'portfolio') {
        fetchPortfolio();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const checkAuth = async () => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/auth/is-auth',
        {},
        { withCredentials: true }
      );

      if (!response.data.success) {
        navigate('/login', { replace: true });
      }
    } catch (error) {
      navigate('/login', { replace: true });
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUserData(),
        fetchStocks(),
        fetchPortfolio(),
        fetchTransactions()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8000/api/user/data',
        { withCredentials: true }
      );

      if (response.data.success) {
        setUserData(response.data.userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchStocks = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8000/api/stocks/all',
        { withCredentials: true }
      );

      if (response.data.success) {
        setStocks(response.data.stocks);
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8000/api/stocks/portfolio',
        { withCredentials: true }
      );

      if (response.data.success) {
        setPortfolio(response.data.portfolio);
        setPortfolioSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8000/api/stocks/transactions',
        { withCredentials: true }
      );

      if (response.data.success) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleTradeClick = (stock, type) => {
    setSelectedStock(stock);
    setTradeType(type);
    setQuantity('');
    setTradeMessage({ type: '', text: '' });
    setShowTradePopup(true);
  };

  const handleTrade = async (e) => {
    e.preventDefault();

    if (!quantity || quantity <= 0) {
      setTradeMessage({ type: 'error', text: 'Please enter valid quantity' });
      return;
    }

    setTradeLoading(true);
    setTradeMessage({ type: '', text: '' });

    try {
      const endpoint = tradeType === 'buy' 
        ? 'http://localhost:8000/api/stocks/buy'
        : 'http://localhost:8000/api/stocks/sell';

      const response = await axios.post(
        endpoint,
        {
          symbol: selectedStock.symbol,
          companyName: selectedStock.name,
          quantity: parseInt(quantity),
          pricePerShare: selectedStock.price
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setTradeMessage({ type: 'success', text: response.data.message });
        
        // Refresh data
        await fetchUserData();
        await fetchPortfolio();
        await fetchTransactions();

        setTimeout(() => {
          setShowTradePopup(false);
          setQuantity('');
          setTradeMessage({ type: '', text: '' });
        }, 2000);
      } else {
        setTradeMessage({ type: 'error', text: response.data.message });
      }
    } catch (error) {
      setTradeMessage({
        type: 'error',
        text: error.response?.data?.message || 'Trade failed'
      });
    } finally {
      setTradeLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-16 w-16 text-emerald-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading stock market...</p>
        </div>
      </div>
    );
  }

  const calculateTotal = () => {
    if (!selectedStock || !quantity) return 0;
    return selectedStock.price * parseInt(quantity || 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-300 rotate-180" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Stock Market</h1>
                <p className="text-xs text-gray-400">Live Trading Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                <p className="text-xs text-gray-400">Balance</p>
                <p className="text-lg font-bold text-emerald-400">
                  {formatCurrency(userData?.balance || 0)}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                disabled={refreshing}
              >
                <RefreshCw className={`w-5 h-5 text-gray-300 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Summary Cards */}
        {portfolioSummary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">Total Invested</p>
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(portfolioSummary.totalInvested)}
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">Current Value</p>
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(portfolioSummary.totalCurrentValue)}
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">Total P&L</p>
                {portfolioSummary.totalProfitLoss >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
              </div>
              <p className={`text-2xl font-bold ${
                portfolioSummary.totalProfitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {formatCurrency(portfolioSummary.totalProfitLoss)}
                <span className="text-sm ml-2">
                  ({portfolioSummary.totalProfitLossPercent.toFixed(2)}%)
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('market')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'market'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Market
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'portfolio'
                ? 'bg-purple-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'transactions'
                ? 'bg-emerald-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Transactions
          </button>
        </div>

        {/* Market Tab */}
        {activeTab === 'market' && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Available Stocks</h2>
              <p className="text-gray-400 text-sm mt-1">Real-time stock prices</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-gray-400 font-semibold text-sm">Symbol</th>
                    <th className="text-left p-4 text-gray-400 font-semibold text-sm">Company</th>
                    <th className="text-right p-4 text-gray-400 font-semibold text-sm">Price</th>
                    <th className="text-right p-4 text-gray-400 font-semibold text-sm">Change</th>
                    <th className="text-center p-4 text-gray-400 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock) => (
                    <tr key={stock.symbol} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <p className="text-white font-bold font-mono">{stock.symbol}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-white text-sm">{stock.name}</p>
                      </td>
                      <td className="p-4 text-right">
                        <p className="text-white font-bold">{formatCurrency(stock.price)}</p>
                      </td>
                      <td className="p-4 text-right">
                        <div className={`inline-flex items-center gap-1 ${
                          stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {stock.change >= 0 ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                          <span className="font-semibold">
                            {Math.abs(stock.change).toFixed(2)} ({Math.abs(stock.changePercent).toFixed(2)}%)
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleTradeClick(stock, 'buy')}
                            className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-semibold hover:bg-emerald-500/30 transition-all"
                          >
                            Buy
                          </button>
                          <button
                            onClick={() => handleTradeClick(stock, 'sell')}
                            className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-500/30 transition-all"
                          >
                            Sell
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">My Portfolio</h2>
              <p className="text-gray-400 text-sm mt-1">Your stock holdings</p>
            </div>

            {portfolio.length === 0 ? (
              <div className="p-12 text-center">
                <PieChart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No holdings yet</p>
                <p className="text-gray-500 text-sm">Start investing to build your portfolio</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-gray-400 font-semibold text-sm">Symbol</th>
                      <th className="text-right p-4 text-gray-400 font-semibold text-sm">Qty</th>
                      <th className="text-right p-4 text-gray-400 font-semibold text-sm">Avg Price</th>
                      <th className="text-right p-4 text-gray-400 font-semibold text-sm">Current Price</th>
                      <th className="text-right p-4 text-gray-400 font-semibold text-sm">Invested</th>
                      <th className="text-right p-4 text-gray-400 font-semibold text-sm">Current Value</th>
                      <th className="text-right p-4 text-gray-400 font-semibold text-sm">P&L</th>
                      <th className="text-center p-4 text-gray-400 font-semibold text-sm">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((holding) => (
                      <tr key={holding.symbol} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="text-white font-bold font-mono">{holding.symbol}</p>
                            <p className="text-gray-400 text-xs">{holding.companyName}</p>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <p className="text-white font-semibold">{holding.quantity}</p>
                        </td>
                        <td className="p-4 text-right">
                          <p className="text-gray-300">{formatCurrency(holding.averagePrice)}</p>
                        </td>
                        <td className="p-4 text-right">
                          <p className="text-white font-semibold">{formatCurrency(holding.currentPrice)}</p>
                        </td>
                        <td className="p-4 text-right">
                          <p className="text-gray-300">{formatCurrency(holding.totalInvested)}</p>
                        </td>
                        <td className="p-4 text-right">
                          <p className="text-white font-bold">{formatCurrency(holding.currentValue)}</p>
                        </td>
                        <td className="p-4 text-right">
                          <div className={`${
                            holding.profitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            <p className="font-bold">{formatCurrency(holding.profitLoss)}</p>
                            <p className="text-xs">
                              ({holding.profitLoss >= 0 ? '+' : ''}{holding.profitLossPercent.toFixed(2)}%)
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleTradeClick({
                              symbol: holding.symbol,
                              name: holding.companyName,
                              price: holding.currentPrice
                            }, 'sell')}
                            className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-500/30 transition-all"
                          >
                            Sell
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Stock Transaction History</h2>
              <p className="text-gray-400 text-sm mt-1">Your recent stock trades</p>
            </div>

            {transactions.length === 0 ? (
              <div className="p-12 text-center">
                <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No stock transactions yet</p>
                <p className="text-gray-500 text-sm">Your trades will appear here</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-3">
                  {transactions.map((txn) => (
                    <div
                      key={txn._id}
                      className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          txn.type === 'buy'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {txn.type === 'buy' ? (
                            <ShoppingCart className="w-6 h-6" />
                          ) : (
                            <DollarSign className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-bold">{txn.symbol}</p>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              txn.type === 'buy'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {txn.type.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm">
                            {txn.quantity} shares @ {formatCurrency(txn.pricePerShare)}
                          </p>
                          <p className="text-gray-500 text-xs">{formatDate(txn.timestamp)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          txn.type === 'buy' ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                          {txn.type === 'buy' ? '-' : '+'}{formatCurrency(txn.totalAmount)}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {txn.type === 'buy' ? 'Invested' : 'Received'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trade Popup */}
      {showTradePopup && selectedStock && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full relative animate-scale-in">
            <button
              onClick={() => {
                setShowTradePopup(false);
                setQuantity('');
                setTradeMessage({ type: '', text: '' });
              }}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="text-center mb-6">
              <div className={`w-16 h-16 bg-gradient-to-br rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                tradeType === 'buy'
                  ? 'from-emerald-500 to-teal-500'
                  : 'from-red-500 to-orange-500'
              }`}>
                {tradeType === 'buy' ? (
                  <ShoppingCart className="w-8 h-8 text-white" />
                ) : (
                  <DollarSign className="w-8 h-8 text-white" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {tradeType === 'buy' ? 'Buy' : 'Sell'} Stock
              </h2>
              <p className="text-gray-400">{selectedStock.name}</p>
            </div>

            {/* Stock Info */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Symbol</span>
                <span className="text-white font-bold font-mono">{selectedStock.symbol}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Current Price</span>
                <span className="text-emerald-400 font-bold">{formatCurrency(selectedStock.price)}</span>
              </div>
            </div>

            {tradeMessage.text && (
              <div className={`flex items-center gap-3 p-4 rounded-xl mb-4 ${
                tradeMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {tradeMessage.type === 'success' ? (
                  <Check size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
                <span className="text-sm font-medium">{tradeMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleTrade} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    setTradeMessage({ type: '', text: '' });
                  }}
                  placeholder="Enter quantity"
                  min="1"
                  disabled={tradeLoading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all disabled:opacity-50"
                />
              </div>

              {quantity && (
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Total Amount</span>
                    <span className="text-white text-xl font-bold">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Available Balance</span>
                  <span className="text-emerald-400 font-semibold">
                    {formatCurrency(userData?.balance || 0)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={tradeLoading || !quantity}
                className={`w-full font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  tradeType === 'buy'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                    : 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                }`}
              >
                {tradeLoading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    {tradeType === 'buy' ? 'Buy Now' : 'Sell Now'}
                  </>
                )}
              </button>
            </form>
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

export default StockPage;