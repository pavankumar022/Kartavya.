import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Star, Crown, Users } from 'lucide-react';
import { getLeaderboardData } from '../utils/achievements';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const data = getLeaderboardData();
    setLeaderboardData(data);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserData = data.find(u => u.id === user.id);
    setCurrentUser(currentUserData);
  }, []);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-orange-400" />;
      default: return <Star className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPositionSuffix = (rank) => {
    if (rank % 10 === 1 && rank % 100 !== 11) return 'st';
    if (rank % 10 === 2 && rank % 100 !== 12) return 'nd';
    if (rank % 10 === 3 && rank % 100 !== 13) return 'rd';
    return 'th';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h1 className="text-3xl font-bold text-white">Community Leaderboard</h1>
        </div>
        <p className="text-gray-400">Top contributors making Bharat better through civic action</p>
      </div>

      {/* Current User Stats */}
      {currentUser && (
        <div className={`${currentUser.leaderboardTier.bgColor} border ${currentUser.leaderboardTier.borderColor} rounded-xl p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getRankIcon(currentUser.rank)}
                <span className="text-2xl font-bold text-white">#{currentUser.rank}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{currentUser.name}</h3>
                <p className="text-gray-300">Your Position</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{currentUser.points}</div>
              <div className="text-gray-300 text-sm">Points</div>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {leaderboardData.slice(0, 3).map((user, index) => (
          <div key={user.id} className={`${user.leaderboardTier.bgColor} border ${user.leaderboardTier.borderColor} rounded-xl p-6 text-center ${index === 0 ? 'md:order-2 transform md:scale-105' : index === 1 ? 'md:order-1' : 'md:order-3'}`}>
            <div className="mb-4">
              {getRankIcon(user.rank)}
            </div>
            <div className="mb-4">
              {localStorage.getItem('profileImage') && user.id === JSON.parse(localStorage.getItem('user') || '{}').id ? (
                <img
                  src={localStorage.getItem('profileImage')}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-white/20"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold text-xl">{user.name?.[0] || 'U'}</span>
                </div>
              )}
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{user.name}</h3>
            <div className={`inline-flex items-center space-x-1 bg-gradient-to-r ${user.tier.color} px-3 py-1 rounded-full mb-3`}>
              <span className="text-sm">{user.tier.icon}</span>
              <span className={`text-xs font-semibold ${user.tier.textColor}`}>{user.tier.name}</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white">{user.points}</div>
              <div className="text-sm text-gray-300">Points</div>
              <div className="text-sm text-gray-400">{user.reportCount} Reports</div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Leaderboard */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Full Rankings</span>
          </h2>
        </div>
        
        <div className="divide-y divide-gray-700">
          {leaderboardData.map((user) => (
            <div key={user.id} className={`px-6 py-4 hover:bg-gray-700/50 transition-colors ${user.id === JSON.parse(localStorage.getItem('user') || '{}').id ? 'bg-blue-900/20' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 w-12">
                    {getRankIcon(user.rank)}
                    <span className="font-bold text-white">#{user.rank}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {localStorage.getItem('profileImage') && user.id === JSON.parse(localStorage.getItem('user') || '{}').id ? (
                      <img
                        src={localStorage.getItem('profileImage')}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border border-white/20"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{user.name?.[0] || 'U'}</span>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-semibold text-white">{user.name}</h3>
                      <div className="flex items-center space-x-2">
                        <div className={`inline-flex items-center space-x-1 bg-gradient-to-r ${user.tier.color} px-2 py-1 rounded-full`}>
                          <span className="text-xs">{user.tier.icon}</span>
                          <span className={`text-xs font-medium ${user.tier.textColor}`}>{user.tier.name}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${user.leaderboardTier.bgColor} ${user.leaderboardTier.textColor}`}>
                          {user.rank}{getPositionSuffix(user.rank)} Place
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xl font-bold text-white">{user.points}</div>
                  <div className="text-sm text-gray-400">{user.reportCount} reports</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">Ranking Tiers</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">🥇</div>
            <div className="text-sm font-semibold text-yellow-400">Gold</div>
            <div className="text-xs text-gray-400">Top 3</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🥈</div>
            <div className="text-sm font-semibold text-gray-400">Silver</div>
            <div className="text-xs text-gray-400">4th - 15th</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🥉</div>
            <div className="text-sm font-semibold text-orange-400">Bronze</div>
            <div className="text-xs text-gray-400">16th - 30th</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">👤</div>
            <div className="text-sm font-semibold text-gray-400">Member</div>
            <div className="text-xs text-gray-400">31st+</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;