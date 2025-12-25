import React, { useState, useEffect } from 'react';
import {
  Trophy, Gift, TrendingUp, Crown, Medal, Star, ChevronLeft,
  Sparkles, Award, ArrowUp, ArrowDown, User, Zap, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api.js';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllRanks, setShowAllRanks] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get(
        '/user/data',
        { withCredentials: true }
      );
      if (response.data.success) {
        setUserData(response.data.userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get(
        '/user/leaderboard',
        { withCredentials: true }
      );

      if (response.data.success) {
        setLeaderboardData(response.data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
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

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-orange-500';
      case 2:
        return 'from-gray-300 to-gray-400';
      case 3:
        return 'from-orange-400 to-amber-600';
      default:
        return 'from-purple-500 to-pink-500';
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-8 h-8 text-yellow-400" />;
      case 2:
        return <Medal className="w-7 h-7 text-gray-300" />;
      case 3:
        return <Award className="w-7 h-7 text-orange-400" />;
      default:
        return <Star className="w-5 h-5 text-purple-400" />;
    }
  };

  const getCardSize = (rank) => {
    switch (rank) {
      case 1:
        return 'scale-110 z-20';
      case 2:
        return 'scale-95 z-10';
      case 3:
        return 'scale-95 z-10';
      default:
        return 'scale-100';
    }
  };

  const getUserRank = () => {
    const userIndex = leaderboardData.findIndex(
      (user) => user.upiId === userData?.upiId
    );
    return userIndex !== -1 ? userIndex + 1 : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  const topThree = leaderboardData.slice(0, 3);
  const restOfLeaderboard = leaderboardData.slice(3);
  const userRank = getUserRank();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-300" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Cashback Winners</h1>
                <p className="text-xs text-gray-400">Top cashback earners</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border border-yellow-500/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-yellow-400 text-sm font-semibold">Your Rank</p>
                <p className="text-white text-2xl font-bold">
                  {userRank ? `#${userRank}` : 'Unranked'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Gift className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-orange-400 text-sm font-semibold">Total Cashback</p>
                <p className="text-white text-2xl font-bold">
                  {formatCurrency(userData?.totalCashback || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {topThree.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Trophy className="w-6 h-24 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Top Champions</h2>
            </div>

            <div className="flex items-end justify-center gap-4 mb-8">
              {/* 2nd Place */} 
              {topThree[1] && (
                <div className={`flex-1 max-w-xs ${getCardSize(2)} transition-all duration-300`}>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                    <div className="text-center mb-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${getRankColor(2)} rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                        {getRankIcon(2)}
                      </div>
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-gray-400">
                        <User className="w-6 h-6 text-gray-300" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">{topThree[1].name}</h3>
                      <p className="text-gray-400 text-xs font-mono">{topThree[1].upiId}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 mb-3">
                      <p className="text-gray-400 text-xs mb-1">Total Cashback</p>
                      <p className="text-white text-xl font-bold">{formatCurrency(topThree[1].totalCashback)}</p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-gray-300 text-sm">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold">Silver Rank</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {topThree[0] && (
                <div className={`flex-1 max-w-xs ${getCardSize(1)} transition-all duration-300`}>
                  <div className="relative">
                    {/* Crown decoration */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                      <Crown className="w-12 h-12 text-yellow-400 animate-pulse" />
                    </div>
                    
                    <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border-2 border-yellow-500/50 rounded-2xl p-6 shadow-2xl shadow-yellow-500/20">
                      <div className="text-center mb-4">
                        <div className={`w-20 h-20 bg-gradient-to-br ${getRankColor(1)} rounded-full flex items-center justify-center mx-auto mb-3 shadow-2xl animate-pulse`}>
                          {getRankIcon(1)}
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2 border-4 border-yellow-400/50">
                          <User className="w-8 h-8 text-slate-900" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">{topThree[0].name}</h3>
                        <p className="text-yellow-400 text-xs font-mono font-semibold">{topThree[0].upiId}</p>
                      </div>
                      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 mb-3 border border-yellow-500/30">
                        <p className="text-yellow-400 text-xs mb-1 font-semibold">Total Cashback</p>
                        <p className="text-white text-2xl font-bold">{formatCurrency(topThree[0].totalCashback)}</p>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm">
                        <Sparkles className="w-5 h-5" />
                        <span className="font-bold">Gold Champion</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className={`flex-1 max-w-xs ${getCardSize(3)} transition-all duration-300`}>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                    <div className="text-center mb-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${getRankColor(3)} rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                        {getRankIcon(3)}
                      </div>
                      <div className="w-12 h-12 bg-orange-700 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-orange-400">
                        <User className="w-6 h-6 text-orange-300" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">{topThree[2].name}</h3>
                      <p className="text-gray-400 text-xs font-mono">{topThree[2].upiId}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 mb-3">
                      <p className="text-gray-400 text-xs mb-1">Total Cashback</p>
                      <p className="text-white text-xl font-bold">{formatCurrency(topThree[2].totalCashback)}</p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-gray-300 text-sm">
                      <Award className="w-4 h-4 text-orange-400" />
                      <span className="font-semibold">Bronze Rank</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rest of Rankings */}
        {restOfLeaderboard.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Other Rankings</h3>
              </div>
              {!showAllRanks && restOfLeaderboard.length > 5 && (
                <button
                  onClick={() => setShowAllRanks(true)}
                  className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg text-sm font-semibold hover:bg-purple-500/30 transition-all"
                >
                  View All ({restOfLeaderboard.length})
                </button>
              )}
            </div>

            <div className="space-y-3">
              {(showAllRanks ? restOfLeaderboard : restOfLeaderboard.slice(0, 5)).map((user, index) => {
                const rank = index + 4;
                const isCurrentUser = user.upiId === userData?.upiId;

                return (
                  <div
                    key={user.upiId}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                      isCurrentUser
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 ${
                        isCurrentUser
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                          : 'bg-gradient-to-br from-slate-700 to-slate-600'
                      } rounded-xl flex items-center justify-center font-bold text-white text-lg`}>
                        #{rank}
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-semibold">{user.name}</h4>
                          {isCurrentUser && (
                            <span className="px-2 py-0.5 bg-purple-500/30 border border-purple-500/50 text-purple-300 rounded text-xs font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm font-mono">{user.upiId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        <Gift className="w-4 h-4 text-orange-400" />
                        <p className="text-white font-bold">{formatCurrency(user.totalCashback)}</p>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-400 text-xs">
                        <Zap className="w-3 h-3" />
                        <span>Active</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {showAllRanks && restOfLeaderboard.length > 5 && (
              <button
                onClick={() => setShowAllRanks(false)}
                className="w-full mt-4 px-4 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-xl font-semibold hover:bg-white/10 transition-all"
              >
                Show Less
              </button>
            )}
          </div>
        )}

        {leaderboardData.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Rankings Yet</h3>
            <p className="text-gray-400">Start earning cashback to appear on the leaderboard!</p>
          </div>
        )}
      </div>

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
      `}</style>
    </div>
  );
};

export default Leaderboard;