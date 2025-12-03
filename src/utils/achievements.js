// Achievement and Points System

// Points per action
export const POINTS = {
  REPORT_SUBMITTED: 100,
  REPORT_RESOLVED: 50,
  COMMUNITY_SUPPORT: 25
};

// Achievement definitions
export const ACHIEVEMENTS = {
  FIRST_REPORT: {
    id: 'first_report',
    name: 'First Step',
    description: 'Submitted your first civic report',
    icon: '🎯',
    requirement: 1,
    type: 'reports'
  },
  FIFTH_REPORT: {
    id: 'fifth_report',
    name: 'Community Helper',
    description: 'Submitted 5 civic reports',
    icon: '🌟',
    requirement: 5,
    type: 'reports'
  },
  TENTH_REPORT: {
    id: 'tenth_report',
    name: 'Civic Champion',
    description: 'Submitted 10 civic reports',
    icon: '🏆',
    requirement: 10,
    type: 'reports'
  },
  FIFTEENTH_REPORT: {
    id: 'fifteenth_report',
    name: 'Change Maker',
    description: 'Submitted 15 civic reports',
    icon: '💎',
    requirement: 15,
    type: 'reports'
  },
  TWENTIETH_REPORT: {
    id: 'twentieth_report',
    name: 'Community Leader',
    description: 'Submitted 20 civic reports',
    icon: '👑',
    requirement: 20,
    type: 'reports'
  }
};

// Generate achievements for multiples of 5
export const generateAchievements = (maxReports = 100) => {
  const achievements = { ...ACHIEVEMENTS };
  
  for (let i = 25; i <= maxReports; i += 5) {
    const tier = getTierByReports(i);
    achievements[`report_${i}`] = {
      id: `report_${i}`,
      name: `${tier.name} Reporter`,
      description: `Submitted ${i} civic reports`,
      icon: tier.icon,
      requirement: i,
      type: 'reports'
    };
  }
  
  return achievements;
};

// Tier system for badges
export const getTierByReports = (reportCount) => {
  if (reportCount >= 50) {
    return { name: 'Legendary', icon: '🌟', color: 'from-yellow-400 to-orange-500', textColor: 'text-yellow-100' };
  } else if (reportCount >= 25) {
    return { name: 'Master', icon: '💎', color: 'from-purple-500 to-pink-500', textColor: 'text-purple-100' };
  } else if (reportCount >= 15) {
    return { name: 'Expert', icon: '🏆', color: 'from-blue-500 to-cyan-500', textColor: 'text-blue-100' };
  } else if (reportCount >= 10) {
    return { name: 'Advanced', icon: '🎖️', color: 'from-green-500 to-emerald-500', textColor: 'text-green-100' };
  } else if (reportCount >= 5) {
    return { name: 'Intermediate', icon: '🌟', color: 'from-indigo-500 to-blue-500', textColor: 'text-indigo-100' };
  } else {
    return { name: 'Beginner', icon: '🎯', color: 'from-gray-500 to-gray-600', textColor: 'text-gray-100' };
  }
};

// Leaderboard tier system based on points
export const getLeaderboardTier = (rank) => {
  if (rank <= 3) {
    return { 
      name: 'Gold', 
      icon: '🥇', 
      color: 'from-yellow-400 to-yellow-600', 
      textColor: 'text-yellow-100',
      bgColor: 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20',
      borderColor: 'border-yellow-400'
    };
  } else if (rank <= 15) {
    return { 
      name: 'Silver', 
      icon: '🥈', 
      color: 'from-gray-300 to-gray-500', 
      textColor: 'text-gray-100',
      bgColor: 'bg-gradient-to-r from-gray-400/20 to-gray-500/20',
      borderColor: 'border-gray-400'
    };
  } else if (rank <= 30) {
    return { 
      name: 'Bronze', 
      icon: '🥉', 
      color: 'from-orange-400 to-orange-600', 
      textColor: 'text-orange-100',
      bgColor: 'bg-gradient-to-r from-orange-500/20 to-orange-600/20',
      borderColor: 'border-orange-400'
    };
  } else {
    return { 
      name: 'Member', 
      icon: '👤', 
      color: 'from-gray-600 to-gray-700', 
      textColor: 'text-gray-200',
      bgColor: 'bg-gradient-to-r from-gray-600/20 to-gray-700/20',
      borderColor: 'border-gray-500'
    };
  }
};

// Calculate user points
export const calculateUserPoints = (userId) => {
  const allIssues = JSON.parse(localStorage.getItem('reportedIssues') || '[]');
  const userReports = allIssues.filter(issue => issue.reportedBy === userId);
  
  let totalPoints = 0;
  
  // Points for submitted reports
  totalPoints += userReports.length * POINTS.REPORT_SUBMITTED;
  
  // Bonus points for resolved reports
  const resolvedReports = userReports.filter(issue => issue.status === 'resolved');
  totalPoints += resolvedReports.length * POINTS.REPORT_RESOLVED;
  
  return totalPoints;
};

// Get user achievements
export const getUserAchievements = (userId) => {
  const allIssues = JSON.parse(localStorage.getItem('reportedIssues') || '[]');
  const userReports = allIssues.filter(issue => issue.reportedBy === userId);
  const reportCount = userReports.length;
  
  const achievements = generateAchievements();
  const earnedAchievements = [];
  
  Object.values(achievements).forEach(achievement => {
    if (achievement.type === 'reports' && reportCount >= achievement.requirement) {
      earnedAchievements.push(achievement);
    }
  });
  
  return earnedAchievements.sort((a, b) => b.requirement - a.requirement);
};

// Get next achievement to unlock
export const getNextAchievement = (userId) => {
  const allIssues = JSON.parse(localStorage.getItem('reportedIssues') || '[]');
  const userReports = allIssues.filter(issue => issue.reportedBy === userId);
  const reportCount = userReports.length;
  
  const achievements = generateAchievements();
  
  const nextAchievement = Object.values(achievements)
    .filter(achievement => achievement.type === 'reports' && reportCount < achievement.requirement)
    .sort((a, b) => a.requirement - b.requirement)[0];
  
  return nextAchievement;
};

// Get leaderboard data
export const getLeaderboardData = () => {
  const allUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const allIssues = JSON.parse(localStorage.getItem('reportedIssues') || '[]');
  
  const leaderboard = allUsers.map(user => {
    const userReports = allIssues.filter(issue => issue.reportedBy === user.id);
    const points = calculateUserPoints(user.id);
    const tier = getTierByReports(userReports.length);
    
    return {
      ...user,
      reportCount: userReports.length,
      points: points,
      tier: tier
    };
  }).sort((a, b) => b.points - a.points);
  
  // Add rank and leaderboard tier
  return leaderboard.map((user, index) => ({
    ...user,
    rank: index + 1,
    leaderboardTier: getLeaderboardTier(index + 1)
  }));
};