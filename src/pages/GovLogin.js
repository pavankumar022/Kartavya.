import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Shield, Building2, Scale } from 'lucide-react';

const GovLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Government roles with their departments (expanded list)
  const govRoles = [
    // High Court & Judicial
    { value: 'high_court_judge', label: 'High Court Judge', dept: 'High Court' },
    { value: 'district_judge', label: 'District Judge', dept: 'District Court' },
    { value: 'magistrate', label: 'Magistrate', dept: 'Magistrate Court' },
    { value: 'public_prosecutor', label: 'Public Prosecutor', dept: 'Public Prosecution' },
    
    // Administrative
    { value: 'chief_secretary', label: 'Chief Secretary', dept: 'State Government' },
    { value: 'district_collector', label: 'District Collector', dept: 'District Administration' },
    { value: 'sub_collector', label: 'Sub Collector', dept: 'Sub Division' },
    { value: 'tehsildar', label: 'Tehsildar', dept: 'Revenue Department' },
    { value: 'block_development_officer', label: 'Block Development Officer', dept: 'Rural Development' },
    
    // Municipal & Urban
    { value: 'municipal_commissioner', label: 'Municipal Commissioner', dept: 'Municipal Corporation' },
    { value: 'mayor', label: 'Mayor', dept: 'Municipal Corporation' },
    { value: 'ward_councillor', label: 'Ward Councillor', dept: 'Local Government' },
    { value: 'city_planner', label: 'City Planner', dept: 'Urban Development' },
    
    // Police & Security
    { value: 'police_commissioner', label: 'Police Commissioner', dept: 'Police Department' },
    { value: 'superintendent_police', label: 'Superintendent of Police', dept: 'District Police' },
    { value: 'deputy_superintendent_police', label: 'Deputy SP', dept: 'Police Department' },
    { value: 'inspector_police', label: 'Police Inspector', dept: 'Police Station' },
    { value: 'traffic_inspector', label: 'Traffic Inspector', dept: 'Traffic Police' },
    
    // Public Works & Infrastructure
    { value: 'chief_engineer_pwd', label: 'Chief Engineer PWD', dept: 'Public Works Department' },
    { value: 'executive_engineer', label: 'Executive Engineer', dept: 'PWD' },
    { value: 'assistant_engineer', label: 'Assistant Engineer', dept: 'PWD' },
    { value: 'junior_engineer', label: 'Junior Engineer', dept: 'PWD' },
    
    // Health & Medical
    { value: 'chief_medical_officer', label: 'Chief Medical Officer', dept: 'Health Department' },
    { value: 'district_health_officer', label: 'District Health Officer', dept: 'Health Department' },
    { value: 'medical_superintendent', label: 'Medical Superintendent', dept: 'Government Hospital' },
    { value: 'public_health_engineer', label: 'Public Health Engineer', dept: 'Health Department' },
    
    // Education
    { value: 'district_education_officer', label: 'District Education Officer', dept: 'Education Department' },
    { value: 'block_education_officer', label: 'Block Education Officer', dept: 'Education Department' },
    { value: 'principal_government_college', label: 'Principal', dept: 'Government College' },
    
    // Utilities & Services
    { value: 'electricity_superintendent', label: 'Electricity Superintendent', dept: 'Electricity Board' },
    { value: 'water_supply_engineer', label: 'Water Supply Engineer', dept: 'Water Department' },
    { value: 'sanitation_inspector', label: 'Sanitation Inspector', dept: 'Municipal Corporation' },
    { value: 'fire_chief', label: 'Fire Chief', dept: 'Fire Department' },
    { value: 'transport_commissioner', label: 'Transport Commissioner', dept: 'Transport Department' },
    
    // Environment & Forest
    { value: 'forest_conservator', label: 'Conservator of Forests', dept: 'Forest Department' },
    { value: 'divisional_forest_officer', label: 'Divisional Forest Officer', dept: 'Forest Department' },
    { value: 'pollution_control_officer', label: 'Pollution Control Officer', dept: 'Pollution Control Board' },
    { value: 'environmental_engineer', label: 'Environmental Engineer', dept: 'Environment Department' },
    
    // Revenue & Finance
    { value: 'district_treasury_officer', label: 'District Treasury Officer', dept: 'Treasury Department' },
    { value: 'commercial_tax_officer', label: 'Commercial Tax Officer', dept: 'Commercial Tax Department' },
    { value: 'excise_inspector', label: 'Excise Inspector', dept: 'Excise Department' },
    
    // Agriculture & Rural
    { value: 'district_agriculture_officer', label: 'District Agriculture Officer', dept: 'Agriculture Department' },
    { value: 'veterinary_officer', label: 'Veterinary Officer', dept: 'Animal Husbandry' },
    { value: 'cooperative_inspector', label: 'Cooperative Inspector', dept: 'Cooperative Department' },
    
    // Social Welfare
    { value: 'district_social_welfare_officer', label: 'District Social Welfare Officer', dept: 'Social Welfare' },
    { value: 'child_development_officer', label: 'Child Development Officer', dept: 'Women & Child Development' },
    { value: 'disability_commissioner', label: 'Disability Commissioner', dept: 'Social Justice Department' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate form
      if (!formData.email || !formData.password || !formData.role) {
        throw new Error('Please fill all required fields');
      }

      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      // Check if government user exists
      const govUsers = JSON.parse(localStorage.getItem('govUsers') || '[]');
      const user = govUsers.find(u => u.email === formData.email && u.role === formData.role);
      
      if (!user) {
        throw new Error('Invalid credentials or role. Please contact system administrator.');
      }
      
      if (user.password !== formData.password) {
        throw new Error('Invalid password. Please try again.');
      }
      
      // Login successful
      localStorage.setItem('token', 'gov-token-' + user.id);
      localStorage.setItem('user', JSON.stringify(user));
      
      navigate('/gov-dashboard');
    } catch (error) {
      console.error('Government login failed:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear errors when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border-4 border-white/30 shadow-2xl">
            <Scale className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Government Authority Portal</h1>
          <p className="text-blue-200">Authorized Government Personnel Only</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="flex items-center space-x-2 mb-6">
            <Shield className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-semibold text-white">Secure Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                {errors.submit}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Official Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="yourname@department.gov.in"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Government Role *
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none"
                  required
                >
                  <option value="" className="bg-gray-800">Select Your Role</option>
                  {govRoles.map((role) => (
                    <option key={role.value} value={role.value} className="bg-gray-800">
                      {role.label} - {role.dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Minimum 8 characters"
                  required
                  minLength="8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Password must be at least 8 characters</p>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Need a government account?{' '}
              <button 
                onClick={() => navigate('/gov-register')}
                className="text-yellow-400 hover:text-yellow-300 font-medium"
              >
                Register Here
              </button>
            </p>
          </div>

          {/* Back to Public Login */}
          <div className="mt-4 text-center">
            <button 
              onClick={() => navigate('/login')}
              className="text-blue-400 hover:text-blue-300 font-medium text-sm"
            >
              ← Back to Public Login
            </button>
          </div>
        </div>

        {/* Public View Authorities */}
        <div className="mt-6 bg-green-500/10 rounded-lg p-4 border border-green-500/20">
          <div className="text-center">
            <h3 className="text-green-200 font-medium mb-2">For Citizens</h3>
            <p className="text-green-100 text-sm mb-3">
              View government authorities and their performance
            </p>
            <button
              onClick={() => navigate('/public-authorities')}
              className="bg-green-600/20 hover:bg-green-600/30 text-green-200 py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center space-x-2 mx-auto"
            >
              <Building2 className="w-4 h-4" />
              <span>View Government Authorities</span>
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-4 bg-red-500/10 rounded-lg p-4 border border-red-500/20">
          <p className="text-red-200 text-xs text-center">
            🔒 This is a secure government portal. Unauthorized access is prohibited and monitored.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GovLogin;