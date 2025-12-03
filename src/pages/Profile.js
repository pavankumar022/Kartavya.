import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, Calendar, Award, Settings, Trophy, Star, Target } from 'lucide-react';
import { calculateUserPoints, getUserAchievements, getNextAchievement, getTierByReports } from '../utils/achievements';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [isEditing, setIsEditing] = useState(false);
  const [userStats, setUserStats] = useState({
    reportsSubmitted: 0,
    issuesResolved: 0,
    communityPoints: 0,
    badgesEarned: 0
  });
  const [achievements, setAchievements] = useState([]);
  const [nextAchievement, setNextAchievement] = useState(null);
  const [userTier, setUserTier] = useState(null);
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    state: user.state || '',
    city: user.city || '',
    pincode: user.pincode || '',
    joinDate: user.joinDate || 'January 2024'
  });

  useEffect(() => {
    loadUserStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserStats = () => {
    // Get user's reports
    const allIssues = JSON.parse(localStorage.getItem('reportedIssues') || '[]');
    const userReports = allIssues.filter(issue => issue.reportedBy === user.id);
    const resolvedReports = userReports.filter(report => report.status === 'resolved');
    
    // Calculate points and achievements
    const points = calculateUserPoints(user.id);
    const userAchievements = getUserAchievements(user.id);
    const nextAch = getNextAchievement(user.id);
    const tier = getTierByReports(userReports.length);
    
    setUserStats({
      reportsSubmitted: userReports.length,
      issuesResolved: resolvedReports.length,
      communityPoints: points,
      badgesEarned: userAchievements.length
    });
    
    setAchievements(userAchievements);
    setNextAchievement(nextAch);
    setUserTier(tier);
  };

  const handleSave = () => {
    // Update user data
    const updatedUser = { ...user, ...formData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {formData.name?.[0] || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{formData.name || 'User'}</h2>
              <p className="text-gray-400">Community Member</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <User className="w-4 h-4" />
                    <span>{formData.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Mail className="w-4 h-4" />
                    <span>{formData.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <span>📱</span>
                    <span>{formData.phone || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  State
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <MapPin className="w-4 h-4" />
                    <span>{formData.state || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  City
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <span>🏙️</span>
                    <span>{formData.city || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Pincode
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength="6"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <span>📮</span>
                    <span>{formData.pincode || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Member Since
                </label>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span>{formData.joinDate}</span>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}


          </div>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Community Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Reports Submitted</span>
                <span className="text-white font-semibold">{userStats.reportsSubmitted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Issues Resolved</span>
                <span className="text-white font-semibold">{userStats.issuesResolved}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Community Points</span>
                <span className="text-white font-semibold">{userStats.communityPoints}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Badges Earned</span>
                <span className="text-white font-semibold">{userStats.badgesEarned}</span>
              </div>
              
              {/* User Tier */}
              {userTier && (
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Current Tier</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${userTier.color}`}></div>
                      <span className="text-white font-semibold">{userTier.name}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Achievements Section */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Achievements</h3>
            </div>
            
            {achievements.length === 0 ? (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No badges earned yet</p>
                <p className="text-gray-500 text-sm mt-2">Start reporting issues to earn your first badge!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Earned Achievements */}
                <div className="grid grid-cols-2 gap-3">
                  {achievements.map((achievement) => {
                    // Determine achievement tier based on requirement
                    const getTierStyle = (requirement) => {
                      if (requirement >= 50) return { 
                        borderColor: 'border-yellow-400', 
                        bgColor: 'bg-gradient-to-br from-yellow-900/30 to-orange-900/30',
                        dotColor: 'bg-yellow-400'
                      };
                      if (requirement >= 25) return { 
                        borderColor: 'border-purple-400', 
                        bgColor: 'bg-gradient-to-br from-purple-900/30 to-pink-900/30',
                        dotColor: 'bg-purple-400'
                      };
                      if (requirement >= 15) return { 
                        borderColor: 'border-blue-400', 
                        bgColor: 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30',
                        dotColor: 'bg-blue-400'
                      };
                      if (requirement >= 10) return { 
                        borderColor: 'border-green-400', 
                        bgColor: 'bg-gradient-to-br from-green-900/30 to-emerald-900/30',
                        dotColor: 'bg-green-400'
                      };
                      if (requirement >= 5) return { 
                        borderColor: 'border-cyan-400', 
                        bgColor: 'bg-gradient-to-br from-cyan-900/30 to-teal-900/30',
                        dotColor: 'bg-cyan-400'
                      };
                      return { 
                        borderColor: 'border-gray-400', 
                        bgColor: 'bg-gradient-to-br from-gray-900/30 to-slate-900/30',
                        dotColor: 'bg-gray-400'
                      };
                    };

                    const tierStyle = getTierStyle(achievement.requirement);

                    return (
                      <div
                        key={achievement.id}
                        className={`relative p-3 rounded-lg border-2 ${tierStyle.borderColor} ${tierStyle.bgColor} transition-all hover:scale-105`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-1">{achievement.icon}</div>
                          <div className="text-xs font-semibold text-white mb-1">
                            {achievement.name}
                          </div>
                          <div className="text-xs text-gray-300">
                            {achievement.description}
                          </div>
                        </div>
                        
                        {/* Tier indicator */}
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${tierStyle.dotColor} border-2 border-gray-800`}></div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Next Achievement Progress */}
                {nextAchievement && (
                  <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-white">Next Achievement</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-lg opacity-50">{nextAchievement.icon}</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white mb-1">
                          {nextAchievement.name}
                        </div>
                        <div className="text-xs text-gray-400 mb-2">
                          {nextAchievement.description}
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, (userStats.reportsSubmitted / nextAchievement.requirement) * 100)}%`
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {userStats.reportsSubmitted} / {nextAchievement.requirement} reports
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Achievement Stats */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <Star className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Achievement Stats</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Total Badges</span>
                <span className="text-white font-semibold">{achievements.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Completion Rate</span>
                <span className="text-white font-semibold">
                  {achievements.length > 0 ? Math.round((achievements.length / 20) * 100) : 0}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Rarest Badge</span>
                <span className="text-white font-semibold">
                  {achievements.length > 0 ? achievements[achievements.length - 1]?.name : 'None'}
                </span>
              </div>
              
              {nextAchievement && (
                <div className="pt-3 border-t border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">Progress to next badge:</div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (userStats.reportsSubmitted / nextAchievement.requirement) * 100)}%`
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 text-center">
                    {nextAchievement.requirement - userStats.reportsSubmitted} more reports needed
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;