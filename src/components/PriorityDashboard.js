import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Clock, Users, Brain, Building, TrendingUp, Hospital, School, MessageCircle } from 'lucide-react';
import { createGovernmentPriorityQueue, generateGovernmentReport } from '../utils/governmentQueue';

const PriorityDashboard = () => {
  const [priorityQueue, setPriorityQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [governmentReport, setGovernmentReport] = useState(null);

  useEffect(() => {
    loadAndProcessIssues();
  }, []);

  const loadAndProcessIssues = async () => {
    setLoading(true);
    try {
      // Load issues from localStorage
      const rawIssues = JSON.parse(localStorage.getItem('reportedIssues') || '[]');
      
      // Create government priority queue with tier system
      const queue = await createGovernmentPriorityQueue(rawIssues);
      setPriorityQueue(queue);
      
      // Generate government report
      const report = generateGovernmentReport(queue);
      setGovernmentReport(report);
    } catch (error) {
      console.error('Error processing issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 1: return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 2: return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 3: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 1: return <Hospital className="w-6 h-6" />;
      case 2: return <MessageCircle className="w-6 h-6" />;
      case 3: return <Building className="w-6 h-6" />;
      default: return <AlertTriangle className="w-6 h-6" />;
    }
  };

  if (!priorityQueue) {
    return <div>Loading...</div>;
  }

  const filteredIssues = filter === 'all' 
    ? priorityQueue.sortedIssues 
    : priorityQueue.tiers[`tier${filter}`] || [];

  const tierStats = {
    1: priorityQueue.tiers.tier1.length,
    2: priorityQueue.tiers.tier2.length,
    3: priorityQueue.tiers.tier3.length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading priority analysis...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Government Priority Dashboard</h1>
          <p className="text-gray-400">AI-powered issue prioritization for efficient governance</p>
        </div>
        <button
          onClick={loadAndProcessIssues}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Refresh Analysis
        </button>
      </div>

      {/* Tier Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(priorityQueue.summary).map(([tierKey, tierInfo]) => {
          const tierNum = parseInt(tierKey.replace('tier', ''));
          return (
            <div
              key={tierKey}
              className={`p-6 rounded-lg border-2 ${getTierColor(tierNum)} cursor-pointer transition-all hover:scale-105`}
              onClick={() => setFilter(filter === tierNum ? 'all' : tierNum)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getTierIcon(tierNum)}
                  <div>
                    <p className="text-lg font-bold">{tierInfo.name}</p>
                    <p className="text-sm opacity-80">{tierInfo.urgency}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{tierInfo.count}</p>
                  <p className="text-xs opacity-60">issues</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm">{tierInfo.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span>Response Time:</span>
                  <span className="font-medium">{tierInfo.responseTime}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-700">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 transition-colors ${
            filter === 'all'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          All Issues ({priorityQueue.sortedIssues.length})
        </button>
        {[1, 2, 3].map((tier) => (
          <button
            key={tier}
            onClick={() => setFilter(tier)}
            className={`px-4 py-2 transition-colors ${
              filter === tier
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Tier {tier} ({tierStats[tier]})
          </button>
        ))}
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No issues found for the selected filter.
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className={`bg-gray-800 rounded-lg p-6 border-l-4 ${
                issue.priorityTier === 1 ? 'border-red-500' :
                issue.priorityTier === 2 ? 'border-orange-400' :
                'border-yellow-400'
              }`}
            >
              {/* Issue Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-2">
                      {getTierIcon(issue.priorityTier)}
                      <span className="text-sm font-medium text-gray-300">TIER {issue.priorityTier}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white">{issue.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTierColor(issue.priorityTier)}`}>
                      {issue.tierName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {issue.location}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {issue.reporterName}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    {issue.priorityScore?.toFixed(1) || '2.0'}/4.0
                  </div>
                  <div className="text-xs text-gray-400">Priority Score</div>
                </div>
              </div>

              {/* Issue Description */}
              <p className="text-gray-300 mb-4">{issue.description}</p>

              {/* Tier Justification */}
              <div className="mb-4 p-3 bg-gray-700/30 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-2">🎯 Priority Justification:</h4>
                {issue.priorityTier === 1 && (
                  <div className="text-sm text-red-300">
                    <Hospital className="w-4 h-4 inline mr-2" />
                    <strong>CRITICAL INFRASTRUCTURE:</strong> Located within 5km of hospitals, schools, or emergency services. 
                    Immediate government attention required.
                  </div>
                )}
                {issue.priorityTier === 2 && (
                  <div className="text-sm text-orange-300">
                    <MessageCircle className="w-4 h-4 inline mr-2" />
                    <strong>HIGH COMMUNITY ENGAGEMENT:</strong> Significant public concern with {issue.analysis?.socialAnalysis?.score || 0} engagement points. 
                    Community expects prompt response.
                  </div>
                )}
                {issue.priorityTier === 3 && (
                  <div className="text-sm text-yellow-300">
                    <Building className="w-4 h-4 inline mr-2" />
                    <strong>URBAN INFRASTRUCTURE:</strong> Located in populated urban area. 
                    Standard processing with regular monitoring.
                  </div>
                )}
              </div>

              {/* Comprehensive Analysis Summary */}
              {issue.comprehensiveAnalysis && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* AI Analysis */}
                  {issue.comprehensiveAnalysis.aiAnalysis && (
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <Brain className="w-4 h-4 mr-2 text-blue-400" />
                        <span className="text-sm font-medium text-white">AI Analysis</span>
                      </div>
                      <div className="text-xs text-gray-300">
                        <div>Confidence: {Math.round(issue.comprehensiveAnalysis.aiAnalysis.confidence * 100)}%</div>
                        <div className="mt-1 truncate">
                          {issue.comprehensiveAnalysis.aiAnalysis.analysis.substring(0, 80)}...
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Location Analysis */}
                  {issue.comprehensiveAnalysis.locationAnalysis && (
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <MapPin className="w-4 h-4 mr-2 text-green-400" />
                        <span className="text-sm font-medium text-white">Location Impact</span>
                      </div>
                      <div className="text-xs text-gray-300">
                        <div>Multiplier: {issue.comprehensiveAnalysis.locationAnalysis.score.toFixed(1)}x</div>
                        <div className="mt-1">
                          {issue.comprehensiveAnalysis.locationAnalysis.factors.length} factors
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Government Routing */}
                  {issue.comprehensiveAnalysis.governmentRouting && (
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <Building className="w-4 h-4 mr-2 text-purple-400" />
                        <span className="text-sm font-medium text-white">Department</span>
                      </div>
                      <div className="text-xs text-gray-300">
                        <div className="font-medium">
                          {issue.comprehensiveAnalysis.governmentRouting.primaryDepartment}
                        </div>
                        <div className="mt-1 text-yellow-300">
                          ETA: {issue.comprehensiveAnalysis.governmentRouting.estimatedResponseTime}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
                    Assign Team
                  </button>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">
                    Update Status
                  </button>
                  {issue.finalPriority === 'critical' && (
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">
                      Emergency Response
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  {issue.socialMetrics && (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      <span>{issue.socialMetrics.likes || 0} community reactions</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PriorityDashboard;