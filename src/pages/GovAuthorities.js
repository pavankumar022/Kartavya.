import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Calendar, 
  Phone, 
  Mail,
  ArrowLeft,
  Users,
  CheckCircle,
  Star,
  Search,
  Filter
} from 'lucide-react';

const GovAuthorities = () => {
  const navigate = useNavigate();
  const [authorities, setAuthorities] = useState([]);
  const [filteredAuthorities, setFilteredAuthorities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Check if user is government official
    if (!user.isGovUser) {
      navigate('/login');
      return;
    }
    
    loadAuthorities();
  }, [user, navigate]);

  useEffect(() => {
    filterAuthorities();
  }, [authorities, searchTerm, filterDepartment]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAuthorities = () => {
    const govUsers = JSON.parse(localStorage.getItem('govUsers') || '[]');
    setAuthorities(govUsers);
  };

  const filterAuthorities = () => {
    let filtered = authorities;
    
    // Filter by department
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(auth => 
        auth.department.toLowerCase().includes(filterDepartment.toLowerCase())
      );
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(auth => 
        auth.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auth.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auth.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredAuthorities(filtered);
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'municipal_commissioner': 'Municipal Commissioner',
      'district_collector': 'District Collector',
      'police_commissioner': 'Police Commissioner',
      'public_works_engineer': 'Public Works Engineer',
      'health_officer': 'Chief Health Officer',
      'traffic_inspector': 'Traffic Inspector',
      'ward_councillor': 'Ward Councillor',
      'electricity_officer': 'Electricity Officer',
      'water_supply_engineer': 'Water Supply Engineer',
      'environmental_officer': 'Environmental Officer',
      'fire_chief': 'Fire Chief',
      'transport_officer': 'Transport Officer'
    };
    return roleMap[role] || role;
  };

  const getDepartments = () => {
    const departments = [...new Set(authorities.map(auth => auth.department))];
    return departments;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/gov-dashboard')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Government Authorities</h1>
              <p className="text-blue-200 text-sm">Directory of Government Officials</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-blue-200 text-sm">{user.name} - {user.department}</span>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Search and Filter */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
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
          </div>
        </div>

        {/* Authorities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuthorities.map((authority) => (
            <div key={authority.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              {/* Profile Header */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {authority.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{authority.name}</h3>
                  <p className="text-blue-400 text-sm">{getRoleDisplayName(authority.role)}</p>
                </div>
              </div>

              {/* Department */}
              <div className="flex items-center space-x-2 mb-3">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">{authority.department}</span>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 text-sm">{authority.email}</span>
                </div>
                {authority.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">{authority.phone}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="bg-gray-700 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 text-sm">Reports Resolved</span>
                  </div>
                  <span className="text-white font-semibold">{authority.reportsResolved || 0}</span>
                </div>
              </div>

              {/* Join Date */}
              <div className="flex items-center space-x-2 text-gray-400 text-xs">
                <Calendar className="w-3 h-3" />
                <span>Joined {authority.joinDate}</span>
              </div>

              {/* Performance Badge */}
              {(authority.reportsResolved || 0) > 20 && (
                <div className="mt-3 flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-xs font-medium">Top Performer</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredAuthorities.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No authorities found matching your criteria</p>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Department Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{authorities.length}</div>
              <div className="text-gray-400 text-sm">Total Authorities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{getDepartments().length}</div>
              <div className="text-gray-400 text-sm">Departments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {authorities.reduce((sum, auth) => sum + (auth.reportsResolved || 0), 0)}
              </div>
              <div className="text-gray-400 text-sm">Total Reports Resolved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovAuthorities;