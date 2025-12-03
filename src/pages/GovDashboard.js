import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Eye, 
  Trash2, 
  TrendingUp,
  MapPin,
  Calendar,
  Filter,
  Search
} from 'lucide-react';

const GovDashboard = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Check if user is government official
    if (!user.isGovUser) {
      navigate('/login');
      return;
    }
    
    loadReports();
  }, [user, navigate]);

  useEffect(() => {
    filterReports();
  }, [reports, filterStatus, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadReports = () => {
    const allReports = JSON.parse(localStorage.getItem('reportedIssues') || '[]');
    setReports(allReports);
    
    // Calculate stats
    const newStats = {
      total: allReports.length,
      pending: allReports.filter(r => r.status === 'open').length,
      inProgress: allReports.filter(r => r.status === 'in-progress').length,
      completed: allReports.filter(r => r.status === 'resolved').length,
      cancelled: allReports.filter(r => r.status === 'cancelled').length
    };
    setStats(newStats);
  };

  const filterReports = () => {
    let filtered = reports;
    
    // Filter by status
    if (filterStatus !== 'all') {
      const statusMap = {
        'pending': 'open',
        'in-progress': 'in-progress',
        'completed': 'resolved',
        'cancelled': 'cancelled'
      };
      filtered = filtered.filter(report => report.status === statusMap[filterStatus]);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredReports(filtered);
  };

  const updateReportStatus = (reportId, newStatus) => {
    const updatedReports = reports.map(report => {
      if (report.id === reportId) {
        const updatedReport = {
          ...report,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          resolvedBy: newStatus === 'resolved' ? user.id : report.resolvedBy,
          resolvedByName: newStatus === 'resolved' ? user.name : report.resolvedByName,
          resolvedByRole: newStatus === 'resolved' ? user.role : report.resolvedByRole
        };
        return updatedReport;
      }
      return report;
    });
    
    setReports(updatedReports);
    localStorage.setItem('reportedIssues', JSON.stringify(updatedReports));
    
    // Update government user's resolved count
    if (newStatus === 'resolved') {
      updateGovUserStats(user.id);
    }
    
    loadReports(); // Refresh stats
  };

  const updateGovUserStats = (userId) => {
    const govUsers = JSON.parse(localStorage.getItem('govUsers') || '[]');
    const updatedGovUsers = govUsers.map(govUser => {
      if (govUser.id === userId) {
        return {
          ...govUser,
          reportsResolved: (govUser.reportsResolved || 0) + 1
        };
      }
      return govUser;
    });
    
    localStorage.setItem('govUsers', JSON.stringify(updatedGovUsers));
    
    // Update current user in localStorage
    const updatedUser = { ...user, reportsResolved: (user.reportsResolved || 0) + 1 };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const deleteReport = (reportId) => {
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      const updatedReports = reports.filter(report => report.id !== reportId);
      setReports(updatedReports);
      localStorage.setItem('reportedIssues', JSON.stringify(updatedReports));
      loadReports();
      setShowDetailModal(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Government Dashboard</h1>
              <p className="text-blue-200 text-sm">{user.name} - {user.department}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/gov-authorities')}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              View Authorities
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-gray-400 text-sm">Total Reports</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-gray-400 text-sm">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-3">
              <XCircle className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-gray-400 text-sm">Cancelled</p>
                <p className="text-2xl font-bold">{stats.cancelled}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search reports by title, description, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold">Reports Management</h2>
            <p className="text-gray-400 text-sm">Manage and track civic issue reports</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Report</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">{report.title}</div>
                        <div className="text-sm text-gray-400 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {report.location.substring(0, 50)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-600 text-gray-200 px-2 py-1 rounded text-xs">
                        {report.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${getPriorityColor(report.priority)}`}>
                        {report.priority?.toUpperCase() || 'MEDIUM'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-400 hover:text-blue-300 p-1"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteReport(report.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Delete Report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredReports.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No reports found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Report Details</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Report Info */}
              <div>
                <h4 className="font-semibold text-lg mb-2">{selectedReport.title}</h4>
                <p className="text-gray-300 mb-4">{selectedReport.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Category:</span>
                    <span className="ml-2 text-white">{selectedReport.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Priority:</span>
                    <span className={`ml-2 font-medium ${getPriorityColor(selectedReport.priority)}`}>
                      {selectedReport.priority?.toUpperCase() || 'MEDIUM'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedReport.status)}`}>
                      {selectedReport.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Reported:</span>
                    <span className="ml-2 text-white">{new Date(selectedReport.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h5 className="font-medium mb-2">Location</h5>
                <p className="text-gray-300 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {selectedReport.location}
                </p>
              </div>

              {/* Image */}
              {selectedReport.image && (
                <div>
                  <h5 className="font-medium mb-2">Evidence</h5>
                  <img 
                    src={selectedReport.image} 
                    alt="Report evidence"
                    className="w-full max-h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* AI Analysis */}
              {selectedReport.aiAnalysis && (
                <div>
                  <h5 className="font-medium mb-2">AI Analysis</h5>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-gray-300 text-sm">{selectedReport.aiAnalysis.analysis}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Confidence: {Math.round(selectedReport.aiAnalysis.confidence * 100)}%
                    </p>
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div>
                <h5 className="font-medium mb-3">Update Status</h5>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateReportStatus(selectedReport.id, 'in-progress')}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition-colors"
                    disabled={selectedReport.status === 'in-progress'}
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => updateReportStatus(selectedReport.id, 'resolved')}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm transition-colors"
                    disabled={selectedReport.status === 'resolved'}
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={() => updateReportStatus(selectedReport.id, 'cancelled')}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition-colors"
                    disabled={selectedReport.status === 'cancelled'}
                  >
                    Cancel Report
                  </button>
                </div>
              </div>

              {/* Resolution Info */}
              {selectedReport.status === 'resolved' && selectedReport.resolvedByName && (
                <div>
                  <h5 className="font-medium mb-2">Resolved By</h5>
                  <div className="bg-green-900/20 border border-green-700 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <p className="text-green-200 font-medium">{selectedReport.resolvedByName}</p>
                    </div>
                    <p className="text-green-300 text-sm">
                      {selectedReport.resolvedByRole?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Government Official'}
                    </p>
                    <p className="text-green-400 text-xs mt-1">
                      Resolved on {new Date(selectedReport.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Reporter Info */}
              <div>
                <h5 className="font-medium mb-2">Reported By</h5>
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-white">{selectedReport.reporterName || 'Anonymous'}</p>
                  <p className="text-gray-400 text-sm">{selectedReport.reporterEmail || 'No email provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovDashboard;