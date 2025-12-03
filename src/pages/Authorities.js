import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Building2, 
  CheckCircle, 
  Search, 
  Filter,
  Users,
  Award,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  Eye,
  UserCheck
} from 'lucide-react';

const Authorities = () => {
  const navigate = useNavigate();
  const [authorities, setAuthorities] = useState([]);
  const [filteredAuthorities, setFilteredAuthorities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // all, online, offline
  const [sortBy, setSortBy] = useState('performance');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Check if user is authenticated citizen
    if (!user.id || user.isGovUser) {
      navigate('/login');
      return;
    }
    
    loadAuthorities();
  }, [user, navigate]);

  useEffect(() => {
    filterAndSortAuthorities();
  }, [authorities, searchTerm, filterDepartment, filterStatus, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAuthorities = () => {
    const govUsers = JSON.parse(localStorage.getItem('govUsers') || '[]');
    
    // Add online status based on recent activity (simulated)
    const authoritiesWithStatus = govUsers.map(auth => ({
      ...auth,
      isOnline: Math.random() > 0.3, // Simulate 70% online rate
      lastSeen: new Date(Date.now() - Math.random() * 86400000).toISOString() // Random last seen within 24h
    }));
    
    setAuthorities(authoritiesWithStatus);
  };

  const filterAndSortAuthorities = () => {
    let filtered = authorities;
    
    // Filter by department
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(auth => 
        auth.department.toLowerCase().includes(filterDepartment.toLowerCase())
      );
    }
    
    // Filter by online status
    if (filterStatus === 'online') {
      filtered = filtered.filter(auth => auth.isOnline);
    } else if (filterStatus === 'offline') {
      filtered = filtered.filter(auth => !auth.isOnline);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(auth => 
        auth.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auth.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auth.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort authorities
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'performance':
          return (b.reportsResolved || 0) - (a.reportsResolved || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'department':
          return a.department.localeCompare(b.department);
        case 'status':
          return b.isOnline - a.isOnline;
        default:
          return 0;
      }
    });
    
    setFilteredAuthorities(filtered);
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'high_court_judge': 'High Court Judge',
      'district_judge': 'District Judge',
      'magistrate': 'Magistrate',
      'municipal_commissioner': 'Municipal Commissioner',
      'district_collector': 'District Collector',
      'police_commissioner': 'Police Commissioner',
      'traffic_inspector': 'Traffic Inspector',
      'public_works_engineer': 'Public Works Engineer',
      'chief_medical_officer': 'Chief Medical Officer',
      'fire_chief': 'Fire Chief',
      'mayor': 'Mayor'
    };
    return roleMap[role] || role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getDepartments = () => {
    const departments = [...new Set(authorities.map(auth => auth.department))];
    return departments.sort();
  };

  const getPerformanceLevel = (reportsResolved) => {
    if (reportsResolved >= 50) return { level: 'Excellent', color: 'text-green-400', icon: '🏆' };
    if (reportsResolved >= 25) return { level: 'Very Good', color: 'text-blue-400', icon: '⭐' };
    if (reportsResolved >= 10) return { level: 'Good', color: 'text-yellow-400', icon: '👍' };
    if (reportsResolved >= 5) return { level: 'Average', color: 'text-orange-400', icon: '📈' };
    return { level: 'New', color: 'text-gray-400', icon: '🆕' };
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const onlineAuthorities = authorities.filter(auth => auth.isOnline);
  const totalResolved = authorities.reduce((sum, auth) => sum + (auth.reportsResolved || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Government Authorities</h1>
        </div>
        <p className="text-blue-100 text-lg">Connect with government officials working for your community</p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{authorities.length}</div>
            <div className="text-blue-200 text-sm">Total Officials</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-300">{onlineAuthorities.length}</div>
            <div className="text-blue-200 text-sm">Online Now</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-300">{totalResolved}</div>
            <div className="text-blue-200 text-sm">Issues Resolved</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-300">{getDepartments().length}</div>
            <div className="text-blue-200 text-sm">Departments</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, department, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Departments</option>
                {getDepartments().map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="performance">Sort by Performance</option>
              <option value="name">Sort by Name</option>
              <option value="department">Sort by Department</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Authorities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAuthorities.map((authority) => {
          const performance = getPerformanceLevel(authority.reportsResolved || 0);
          return (
            <div key={authority.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              {/* Profile Header */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {authority.name.charAt(0)}
                    </span>
                  </div>
                  {/* Online Status Indicator */}
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-800 ${
                    authority.isOnline ? 'bg-green-400' : 'bg-gray-500'
                  }`}></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{authority.name}</h3>
                  <p className="text-blue-400 text-sm">{getRoleDisplayName(authority.role)}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${authority.isOnline ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                    <span className="text-xs text-gray-400">
                      {authority.isOnline ? 'Online' : `Last seen ${getTimeAgo(authority.lastSeen)}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Department */}
              <div className="flex items-center space-x-2 mb-3">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">{authority.department}</span>
              </div>

              {/* Limited Contact Info (for citizens) */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 text-sm">
                    {authority.email.split('@')[0]}@***
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 text-sm">
                    {authority.phone ? `${authority.phone.substring(0, 6)}****` : 'Not available'}
                  </span>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="bg-gray-700 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 text-sm">Issues Resolved</span>
                  </div>
                  <span className="text-white font-bold">{authority.reportsResolved || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Performance</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs">{performance.icon}</span>
                    <span className={`text-xs font-medium ${performance.color}`}>
                      {performance.level}
                    </span>
                  </div>
                </div>
              </div>

              {/* Join Date */}
              <div className="flex items-center space-x-2 text-gray-400 text-xs mb-3">
                <Calendar className="w-3 h-3" />
                <span>Serving since {authority.joinDate}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate('/report')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>Report Issue</span>
                </button>
                {authority.isOnline && (
                  <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm transition-colors">
                    <UserCheck className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Performance Badge */}
              {(authority.reportsResolved || 0) > 25 && (
                <div className="mt-3 flex items-center space-x-2">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-xs font-medium">Top Performer</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredAuthorities.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No authorities found matching your criteria</p>
        </div>
      )}

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Need Help with an Issue?</h3>
        <p className="text-green-100 mb-4">
          Report your civic issues and connect with the right government authorities
        </p>
        <button
          onClick={() => navigate('/report')}
          className="bg-white text-green-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
        >
          <TrendingUp className="w-5 h-5" />
          <span>Report New Issue</span>
        </button>
      </div>
    </div>
  );
};

export default Authorities;