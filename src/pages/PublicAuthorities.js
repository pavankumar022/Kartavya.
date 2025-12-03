import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Award, 
  Calendar, 
  Phone, 
  Mail,
  ArrowLeft,
  Users,
  CheckCircle,
  Star,
  Search,
  Filter,
  Scale,
  TrendingUp,
  Shield
} from 'lucide-react';

const PublicAuthorities = () => {
  const navigate = useNavigate();
  const [authorities, setAuthorities] = useState([]);
  const [filteredAuthorities, setFilteredAuthorities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [sortBy, setSortBy] = useState('performance'); // performance, name, department

  useEffect(() => {
    loadAuthorities();
  }, []);

  useEffect(() => {
    filterAndSortAuthorities();
  }, [authorities, searchTerm, filterDepartment, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAuthorities = () => {
    const govUsers = JSON.parse(localStorage.getItem('govUsers') || '[]');
    setAuthorities(govUsers);
  };

  const filterAndSortAuthorities = () => {
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
    
    // Sort authorities
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'performance':
          return (b.reportsResolved || 0) - (a.reportsResolved || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'department':
          return a.department.localeCompare(b.department);
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
      'public_prosecutor': 'Public Prosecutor',
      'chief_secretary': 'Chief Secretary',
      'district_collector': 'District Collector',
      'sub_collector': 'Sub Collector',
      'tehsildar': 'Tehsildar',
      'block_development_officer': 'Block Development Officer',
      'municipal_commissioner': 'Municipal Commissioner',
      'mayor': 'Mayor',
      'ward_councillor': 'Ward Councillor',
      'city_planner': 'City Planner',
      'police_commissioner': 'Police Commissioner',
      'superintendent_police': 'Superintendent of Police',
      'deputy_superintendent_police': 'Deputy SP',
      'inspector_police': 'Police Inspector',
      'traffic_inspector': 'Traffic Inspector',
      'chief_engineer_pwd': 'Chief Engineer PWD',
      'executive_engineer': 'Executive Engineer',
      'assistant_engineer': 'Assistant Engineer',
      'junior_engineer': 'Junior Engineer',
      'chief_medical_officer': 'Chief Medical Officer',
      'district_health_officer': 'District Health Officer',
      'medical_superintendent': 'Medical Superintendent',
      'public_health_engineer': 'Public Health Engineer',
      'district_education_officer': 'District Education Officer',
      'block_education_officer': 'Block Education Officer',
      'principal_government_college': 'Principal',
      'electricity_superintendent': 'Electricity Superintendent',
      'water_supply_engineer': 'Water Supply Engineer',
      'sanitation_inspector': 'Sanitation Inspector',
      'fire_chief': 'Fire Chief',
      'transport_commissioner': 'Transport Commissioner',
      'forest_conservator': 'Conservator of Forests',
      'divisional_forest_officer': 'Divisional Forest Officer',
      'pollution_control_officer': 'Pollution Control Officer',
      'environmental_engineer': 'Environmental Engineer',
      'district_treasury_officer': 'District Treasury Officer',
      'commercial_tax_officer': 'Commercial Tax Officer',
      'excise_inspector': 'Excise Inspector',
      'district_agriculture_officer': 'District Agriculture Officer',
      'veterinary_officer': 'Veterinary Officer',
      'cooperative_inspector': 'Cooperative Inspector',
      'district_social_welfare_officer': 'District Social Welfare Officer',
      'child_development_officer': 'Child Development Officer',
      'disability_commissioner': 'Disability Commissioner'
    };
    return roleMap[role] || role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getDepartments = () => {
    const departments = [...new Set(authorities.map(auth => auth.department))];
    return departments.sort();
  };

  const getPerformanceLevel = (reportsResolved) => {
    if (reportsResolved >= 50) return { level: 'Excellent', color: 'text-green-400', bgColor: 'bg-green-900/20' };
    if (reportsResolved >= 25) return { level: 'Very Good', color: 'text-blue-400', bgColor: 'bg-blue-900/20' };
    if (reportsResolved >= 10) return { level: 'Good', color: 'text-yellow-400', bgColor: 'bg-yellow-900/20' };
    if (reportsResolved >= 5) return { level: 'Average', color: 'text-orange-400', bgColor: 'bg-orange-900/20' };
    return { level: 'New', color: 'text-gray-400', bgColor: 'bg-gray-900/20' };
  };

  const topPerformers = filteredAuthorities.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Government Authorities</h1>
              <p className="text-green-200 text-sm">Public Directory of Government Officials</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/register')}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Join as Citizen
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Top Performers Section */}
        {topPerformers.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Top Performing Officials</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topPerformers.map((authority, index) => {
                return (
                  <div key={authority.id} className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-lg p-6 border-2 border-yellow-400/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {authority.name.charAt(0)}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-yellow-400">#{index + 1}</div>
                      </div>
                      <Star className="w-6 h-6 text-yellow-400" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-1">{authority.name}</h3>
                    <p className="text-yellow-200 text-sm mb-2">{getRoleDisplayName(authority.role)}</p>
                    <p className="text-yellow-300 text-xs mb-3">{authority.department}</p>
                    
                    <div className="bg-yellow-400/10 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-200 text-sm">Reports Resolved</span>
                        <span className="text-yellow-400 font-bold text-lg">{authority.reportsResolved || 0}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
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
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="performance">Sort by Performance</option>
                <option value="name">Sort by Name</option>
                <option value="department">Sort by Department</option>
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
                    <span className="text-gray-300 text-sm truncate">{authority.email}</span>
                  </div>
                  {authority.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 text-sm">{authority.phone}</span>
                    </div>
                  )}
                </div>

                {/* Performance Stats */}
                <div className={`${performance.bgColor} rounded-lg p-3 mb-4 border border-gray-600`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300 text-sm">Reports Resolved</span>
                    </div>
                    <span className="text-white font-bold text-lg">{authority.reportsResolved || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs">Performance Level</span>
                    <span className={`text-xs font-medium ${performance.color}`}>
                      {performance.level}
                    </span>
                  </div>
                </div>

                {/* Join Date */}
                <div className="flex items-center space-x-2 text-gray-400 text-xs mb-3">
                  <Calendar className="w-3 h-3" />
                  <span>In service since {authority.joinDate}</span>
                </div>

                {/* Performance Badge */}
                {(authority.reportsResolved || 0) > 20 && (
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 text-xs font-medium">Outstanding Service</span>
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

        {/* Summary Stats */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <span>Government Service Summary</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{authorities.length}</div>
              <div className="text-gray-400 text-sm">Total Officials</div>
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
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {authorities.filter(auth => (auth.reportsResolved || 0) > 10).length}
              </div>
              <div className="text-gray-400 text-sm">High Performers</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Join the Civic Movement</h3>
          <p className="text-blue-100 mb-4">
            Report civic issues and help these dedicated officials serve your community better
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Register as Citizen
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Login to Report Issues
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicAuthorities;