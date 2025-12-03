import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, MapPin, Clock, AlertCircle, CheckCircle, XCircle, Brain, TrendingUp } from 'lucide-react';
import SocialActions from '../components/SocialActions';

const MyReports = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Load user's reports from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const allIssues = JSON.parse(localStorage.getItem('reportedIssues') || '[]');
    const userReports = allIssues.filter(issue => issue.reportedBy === user.id);
    setReports(userReports);

    // Show success message if redirected from report submission
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [location]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      default:
        return 'text-green-400';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-green-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Reports</h1>
          <p className="text-gray-400">Track the status of your reported issues ({reports.length} total)</p>
        </div>
        <button
          onClick={() => navigate('/report')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Report New Issue
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Reports Yet</h3>
          <p className="text-gray-400 mb-6">You haven't reported any issues yet. Start making a difference in your community!</p>
          <button 
            onClick={() => navigate('/report')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Add New Report
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(report.status)}
                    <h3 className="text-lg font-semibold text-white">{report.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-400 text-sm mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{report.location}</span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(report.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`font-medium ${getPriorityColor(report.priority)}`}>
                        {report.priority.toUpperCase()} Priority
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-blue-400">{report.category}</span>
                      {report.aiAnalysis && (
                        <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                          AI
                        </span>
                      )}
                    </div>
                  </div>

                  {report.description && (
                    <p className="text-gray-300 text-sm mb-3">{report.description}</p>
                  )}

                  {report.image && (
                    <div className="mb-3">
                      <img 
                        src={report.image} 
                        alt="Issue evidence" 
                        className="w-full max-h-48 object-cover rounded-lg border border-gray-600"
                      />
                    </div>
                  )}

                  {/* AI Analysis Display */}
                  {report.aiAnalysis && (
                    <div className="bg-gray-700 rounded-lg p-3 mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Brain className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 text-sm font-medium">AI Analysis</span>
                        <span className="text-xs text-gray-400">
                          {Math.round(report.aiAnalysis.confidence * 100)}% confidence
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{report.aiAnalysis.analysis}</p>
                    </div>
                  )}

                  {/* Resolution Information */}
                  {report.status === 'resolved' && report.resolvedByName && (
                    <div className="bg-green-900/20 border border-green-700 rounded-lg p-3 mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm font-medium">✅ Issue Resolved</span>
                      </div>
                      <p className="text-green-300 text-sm">
                        Thank you for reporting! This issue was resolved by{' '}
                        <span className="font-medium">{report.resolvedByName}</span>
                        {report.resolvedByRole && (
                          <span className="text-green-400">
                            {' '}({report.resolvedByRole.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())})
                          </span>
                        )}
                      </p>
                      <p className="text-green-400 text-xs mt-1">
                        Completed on {new Date(report.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {/* Repost indicator */}
                  {report.isRepost && (
                    <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-3 mb-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 text-sm font-medium">Reposted</span>
                      </div>
                      {report.repostMessage && (
                        <p className="text-purple-300 text-sm italic">"{report.repostMessage}"</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Social Actions */}
              <div className="pt-4 border-t border-gray-700">
                <SocialActions reportId={report.id} reportTitle={report.title} compact={true} />
              </div>

              {/* Report Metadata */}
              <div className="flex items-center justify-between pt-3 text-xs text-gray-500">
                <span>Report ID: {report.id}</span>
                <span>Created: {formatDate(report.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReports;