import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Users, 
  MapPin,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  Eye,
  Award,
  Star,
  Trophy
} from 'lucide-react';
import { calculateUserPoints, getUserAchievements, getNextAchievement, getTierByReports } from '../utils/achievements';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({
    totalReports: 3,
    resolved: 1,
    inProgress: 1,
    mySupport: 0
  });
  const [userReportsCount, setUserReportsCount] = useState(0);
  const [userPoints, setUserPoints] = useState(0);
  const [userAchievements, setUserAchievements] = useState([]);
  const [nextAchievement, setNextAchievement] = useState(null);
  const [userTier, setUserTier] = useState(null);
  const [userReports, setUserReports] = useState([]);

  useEffect(() => {
    // Load user's reports count and achievements
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const allIssues = JSON.parse(localStorage.getItem('reportedIssues') || '[]');
    const userReportsData = allIssues.filter(issue => issue.reportedBy === user.id);
    
    setUserReportsCount(userReportsData.length);
    setUserReports(userReportsData.slice(0, 3)); // Show latest 3 reports
    setUserPoints(calculateUserPoints(user.id));
    setUserAchievements(getUserAchievements(user.id));
    setNextAchievement(getNextAchievement(user.id));
    setUserTier(getTierByReports(userReportsData.length));

    // Update community stats
    const resolvedCount = allIssues.filter(issue => issue.status === 'resolved').length;
    const inProgressCount = allIssues.filter(issue => issue.status === 'in-progress').length;
    
    setStats({
      totalReports: allIssues.length,
      resolved: resolvedCount,
      inProgress: inProgressCount,
      mySupport: 0
    });
  }, [location]);
  
  const [recentIssues] = useState([
    {
      id: 1,
      title: 'Large Pothole on Main Street',
      location: 'Main Street, New York, NY',
      timeAgo: 'over 1 year ago',
      votes: 8,
      status: 'open',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Overflowing Garbage Bin',
      location: '5th Park Avenue, New York, NY',
      timeAgo: 'over 1 year ago',
      votes: 3,
      status: 'in-progress',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Broken Street Light',
      location: '789 Broadway, New York, NY',
      timeAgo: 'over 1 year ago',
      votes: 0,
      status: 'resolved',
      priority: 'low'
    }
  ]);

  // const user = JSON.parse(localStorage.getItem('user') || '{}');

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const IssueCard = ({ issue }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'resolved': return 'text-green-400';
        case 'in-progress': return 'text-yellow-400';
        default: return 'text-red-400';
      }
    };

    const getPriorityIcon = (priority) => {
      switch (priority) {
        case 'high': return <AlertCircle className="w-4 h-4 text-red-400" />;
        case 'medium': return <Clock className="w-4 h-4 text-yellow-400" />;
        default: return <Lightbulb className="w-4 h-4 text-green-400" />;
      }
    };

    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getPriorityIcon(issue.priority)}
            <h3 className="font-medium text-white">{issue.title}</h3>
          </div>
          <span className={`text-sm font-medium ${getStatusColor(issue.status)}`}>
            {issue.status.replace('-', ' ')}
          </span>
        </div>
        
        <div className="flex items-center text-gray-400 text-sm mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{issue.location}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{issue.timeAgo}</span>
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>{issue.votes}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
            <p className="text-blue-100 mb-4">Thank you for making your community better. You have {userPoints} points!</p>
            
            {/* User Tier Badge */}
            {userTier && (
              <div className={`inline-flex items-center space-x-2 bg-gradient-to-r ${userTier.color} px-4 py-2 rounded-full mb-4`}>
                <span className="text-xl">{userTier.icon}</span>
                <span className={`font-semibold ${userTier.textColor}`}>{userTier.name} Reporter</span>
              </div>
            )}
            
            <div className="flex space-x-4">
              <button 
                onClick={() => navigate('/feed')}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                View Community
              </button>
              <button 
                onClick={() => navigate('/leaderboard')}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Trophy className="w-4 h-4" />
                <span>Leaderboard</span>
              </button>
            </div>
          </div>
          
          <div className="text-right space-y-4">
            <div>
              <div className="text-4xl font-bold">{userReportsCount}</div>
              <div className="text-blue-100 text-sm">Reports Made</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-300">{userPoints}</div>
              <div className="text-blue-100 text-sm">Points Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-300">{userAchievements.length}</div>
              <div className="text-blue-100 text-sm">Badges Earned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={TrendingUp}
          title="Total Reports"
          value={stats.totalReports}
          subtitle="Community-wide"
          color="bg-blue-600"
        />
        <StatCard
          icon={CheckCircle}
          title="Resolved"
          value={stats.resolved}
          subtitle="33% success rate"
          color="bg-green-600"
        />
        <StatCard
          icon={Clock}
          title="In Progress"
          value={stats.inProgress}
          subtitle="Being worked on"
          color="bg-yellow-600"
        />
        <StatCard
          icon={Users}
          title="My Support"
          value={stats.mySupport}
          subtitle="Issues Supported"
          color="bg-purple-600"
        />
      </div>

      {/* Achievements Section */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Award className="w-6 h-6 text-yellow-400" />
            <span>Achievements</span>
          </h2>
          <span className="text-sm text-gray-400">{userAchievements.length} earned</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {userAchievements.slice(0, 4).map((achievement) => (
            <div key={achievement.id} className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">{achievement.icon}</div>
              <div className="text-xs font-semibold text-yellow-200">{achievement.name}</div>
              <div className="text-xs text-gray-400 mt-1">{achievement.description}</div>
            </div>
          ))}
        </div>
        
        {nextAchievement && (
          <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl opacity-50">{nextAchievement.icon}</div>
                <div>
                  <div className="text-sm font-medium text-white">{nextAchievement.name}</div>
                  <div className="text-xs text-gray-400">{nextAchievement.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-400">{userReportsCount}/{nextAchievement.requirement}</div>
                <div className="text-xs text-gray-500">reports</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (userReportsCount / nextAchievement.requirement) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Community Issues</h2>
            <button 
              onClick={() => navigate('/feed')}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">My Recent Reports</h2>
            <button 
              onClick={() => navigate('/my-reports')}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              View All
            </button>
          </div>
          
          {userReports.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400 mb-4">You haven't reported any issues yet.</p>
              <button 
                onClick={() => navigate('/report')}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                Add New Report
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {userReports.map((report) => (
                <div key={report.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        report.status === 'resolved' ? 'bg-green-400' :
                        report.status === 'in-progress' ? 'bg-yellow-400' : 'bg-red-400'
                      }`}></div>
                      <h3 className="font-medium text-white">{report.title}</h3>
                      {report.aiAnalysis && (
                        <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">AI</span>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      report.status === 'resolved' ? 'text-green-400' :
                      report.status === 'in-progress' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {report.status.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-400 text-sm mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{report.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${
                        report.priority === 'high' ? 'text-red-400' :
                        report.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {report.priority.toUpperCase()}
                      </span>
                      <span className="text-blue-400">{report.category}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => navigate('/report')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Add New Report</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;