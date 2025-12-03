import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, MapPin, Clock, TrendingUp, Filter } from 'lucide-react';
import SocialActions from '../components/SocialActions';
import { getTrendingReports } from '../utils/socialFeatures';

const CommunityFeed = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All Issues');
  const [sortBy, setSortBy] = useState('recent'); // recent, trending, popular
  const [allIssues, setAllIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  
  const filters = ['All Issues', 'Potholes', 'Streetlights', 'Garbage', 'Water Leaks', 'Public Safety', 'Other'];
  
  useEffect(() => {
    loadIssues();
  }, []);

  useEffect(() => {
    filterAndSortIssues();
  }, [activeFilter, sortBy, allIssues]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadIssues = () => {
    // Load from localStorage (real reports from users)
    const reportedIssues = JSON.parse(localStorage.getItem('reportedIssues') || '[]');
    
    // Add some demo issues if none exist
    const demoIssues = reportedIssues.length === 0 ? [
      {
        id: 1,
        title: 'Large Pothole on Main Street',
        description: 'Deep pothole causing vehicle damage',
        location: '123 Main Street, New York, NY',
        category: 'Potholes',
        status: 'open',
        priority: 'high',
        reportedBy: 'demo1',
        reporterName: 'John Doe',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        image: null,
        aiAnalysis: { priority: 'high', confidence: 0.9, analysis: 'Large pothole detected with high confidence' }
      },
      {
        id: 2,
        title: 'Overflowing Garbage Bin',
        description: 'Garbage bin overflowing, attracting pests',
        location: '456 Park Avenue, New York, NY',
        category: 'Garbage',
        status: 'in-progress',
        priority: 'medium',
        reportedBy: 'demo2',
        reporterName: 'Jane Smith',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        image: null,
        aiAnalysis: { priority: 'medium', confidence: 0.8, analysis: 'Moderate garbage accumulation detected' }
      },
      {
        id: 3,
        title: 'Broken Street Light',
        description: 'Street light not working, safety concern at night',
        location: '789 Broadway, New York, NY',
        category: 'Streetlights',
        status: 'resolved',
        priority: 'low',
        reportedBy: 'demo3',
        reporterName: 'Mike Johnson',
        createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        image: null,
        aiAnalysis: { priority: 'low', confidence: 0.7, analysis: 'Street light issue detected' }
      }
    ] : [];
    
    const combinedIssues = [...reportedIssues, ...demoIssues];
    setAllIssues(combinedIssues);
  };

  const filterAndSortIssues = () => {
    let filtered = allIssues;
    
    // Apply category filter
    if (activeFilter !== 'All Issues') {
      filtered = filtered.filter(issue => 
        issue.category.toLowerCase().includes(activeFilter.toLowerCase()) ||
        activeFilter.toLowerCase().includes(issue.category.toLowerCase())
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'trending':
        const trendingReports = getTrendingReports();
        filtered = filtered.sort((a, b) => {
          const aTrending = trendingReports.find(t => t.id === a.id);
          const bTrending = trendingReports.find(t => t.id === b.id);
          return (bTrending?.trendingScore || 0) - (aTrending?.trendingScore || 0);
        });
        break;
      case 'popular':
        // Sort by social engagement (likes + comments + shares)
        filtered = filtered.sort((a, b) => {
          const aEngagement = (a.socialStats?.totalEngagement || 0);
          const bEngagement = (b.socialStats?.totalEngagement || 0);
          return bEngagement - aEngagement;
        });
        break;
      case 'recent':
      default:
        filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
    
    setFilteredIssues(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    return `${Math.floor(diffInWeeks / 4)}mo ago`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl p-8 text-white mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Home className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Community Feed</h1>
        </div>
        <p className="text-cyan-100 text-lg">Latest civic issues and community reports</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="recent">Most Recent</option>
            <option value="trending">Trending</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-6">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">No issues found for the selected filter.</p>
            <button 
              onClick={() => navigate('/report')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Report New Issue
            </button>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div key={issue.id} className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors overflow-hidden">
              {/* Report Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white hover:text-blue-400 cursor-pointer">
                        {issue.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                        {issue.status.replace('-', ' ')}
                      </span>
                      {issue.priority && (
                        <span className={`text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                          {issue.priority.toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    {issue.description && (
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{issue.description}</p>
                    )}
                    
                    <div className="flex items-center text-gray-400 text-sm mb-3">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{issue.location}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{getTimeAgo(issue.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>by</span>
                        <span className="text-blue-400">{issue.reporterName || 'Anonymous'}</span>
                      </div>
                      {issue.category && (
                        <span className="bg-gray-700 px-2 py-1 rounded text-xs">
                          {issue.category}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {issue.isRepost && (
                    <div className="flex items-center space-x-1 text-purple-400 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>Reposted</span>
                    </div>
                  )}
                </div>

                {/* Image */}
                {issue.image && (
                  <div className="mb-4">
                    <img 
                      src={issue.image} 
                      alt={issue.title}
                      className="w-full max-h-64 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* AI Analysis */}
                {issue.aiAnalysis && (
                  <div className="bg-gray-700 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-blue-400 text-sm font-medium">AI Analysis</span>
                      <span className="text-xs text-gray-400">
                        {Math.round(issue.aiAnalysis.confidence * 100)}% confidence
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{issue.aiAnalysis.analysis}</p>
                  </div>
                )}

                {/* Resolution Information */}
                {issue.status === 'resolved' && issue.resolvedByName && (
                  <div className="bg-green-900/20 border border-green-700 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-green-400 text-sm font-medium">✅ Resolved</span>
                    </div>
                    <p className="text-green-300 text-sm">
                      Resolved by <span className="font-medium">{issue.resolvedByName}</span>
                      {issue.resolvedByRole && (
                        <span className="text-green-400">
                          {' '}({issue.resolvedByRole.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())})
                        </span>
                      )}
                    </p>
                    <p className="text-green-400 text-xs mt-1">
                      Completed on {new Date(issue.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Repost Message */}
                {issue.isRepost && issue.repostMessage && (
                  <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-3 mb-4">
                    <p className="text-purple-300 text-sm italic">"{issue.repostMessage}"</p>
                  </div>
                )}
              </div>

              {/* Social Actions */}
              <div className="px-6 pb-6">
                <SocialActions reportId={issue.id} reportTitle={issue.title} compact={true} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {filteredIssues.length > 0 && (
        <div className="text-center mt-8">
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Load More Reports
          </button>
        </div>
      )}
    </div>
  );
};

export default CommunityFeed;