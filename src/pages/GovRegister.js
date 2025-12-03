import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Phone, Building2, Shield } from 'lucide-react';

const GovRegister = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: '',
    department: '',
    employeeId: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Email validation (Government email only)
    const emailRegex = /^[^\s@]+@[^\s@]+\.gov\.in$/;
    if (!formData.email) {
      newErrors.email = 'Official email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid government email address (must end with .gov.in)';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Phone Number validation (must start with +91)
    const phoneRegex = /^\+91[6-9]\d{9}$/;
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number starting with +91 followed by 10 digits';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Government role is required';
    }

    // Employee ID validation
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    } else if (formData.employeeId.trim().length < 4) {
      newErrors.employeeId = 'Employee ID must be at least 4 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Check if email already exists
      const govUsers = JSON.parse(localStorage.getItem('govUsers') || '[]');
      const existingUser = govUsers.find(u => u.email === formData.email);
      
      if (existingUser) {
        throw new Error('An account with this email already exists. Please use a different email or sign in.');
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const selectedRole = govRoles.find(role => role.value === formData.role);
      
      const newGovUser = {
        id: 'gov-' + Date.now(),
        name: formData.fullName,
        email: formData.email,
        password: formData.password, // In real app, this should be hashed
        phone: formData.phoneNumber,
        role: formData.role,
        department: selectedRole.dept,
        employeeId: formData.employeeId,
        reportsResolved: 0,
        joinDate: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        }),
        isGovUser: true
      };
      
      // Save to government users list
      govUsers.push(newGovUser);
      localStorage.setItem('govUsers', JSON.stringify(govUsers));
      
      // Auto login after registration
      localStorage.setItem('token', 'gov-token-' + newGovUser.id);
      localStorage.setItem('user', JSON.stringify(newGovUser));
      
      navigate('/gov-dashboard', { state: { message: 'Government account created successfully! Welcome to Kartavya.' } });
    } catch (error) {
      console.error('Government registration failed:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Auto-format phone number with +91 prefix
    if (name === 'phoneNumber') {
      // Remove all non-digits
      const digits = value.replace(/\D/g, '');
      
      if (digits.length === 0) {
        processedValue = '';
      } else if (digits.startsWith('91') && digits.length <= 12) {
        // If starts with 91, add + prefix
        processedValue = '+' + digits;
      } else if (!digits.startsWith('91') && digits.length <= 10) {
        // If doesn't start with 91, add +91 prefix
        processedValue = '+91' + digits;
      } else if (digits.length > 12) {
        // Prevent more than 12 digits (91 + 10 digits)
        return;
      } else {
        processedValue = value;
      }
    }

    // Auto-set department when role is selected
    if (name === 'role') {
      const selectedRole = govRoles.find(role => role.value === value);
      setFormData({
        ...formData,
        [name]: processedValue,
        department: selectedRole ? selectedRole.dept : ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: processedValue
      });
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border-4 border-white/30 shadow-2xl">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Government Registration</h1>
          <p className="text-blue-200">Create Official Government Account</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="flex items-center space-x-2 mb-6">
            <Shield className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-semibold text-white">Official Registration</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                {errors.submit}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full bg-white/10 border ${errors.fullName ? 'border-red-500' : 'border-white/20'} rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>}
            </div>

            {/* Email and Phone Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className={`w-full bg-white/10 border ${errors.email ? 'border-red-500' : 'border-white/20'} rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
                    placeholder="yourname@department.gov.in"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={`w-full bg-white/10 border ${errors.phoneNumber ? 'border-red-500' : 'border-white/20'} rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
                    placeholder="+91XXXXXXXXXX"
                    maxLength="13"
                  />
                </div>
                {errors.phoneNumber && <p className="text-red-400 text-sm mt-1">{errors.phoneNumber}</p>}
              </div>
            </div>

            {/* Role and Employee ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className={`w-full bg-white/10 border ${errors.role ? 'border-red-500' : 'border-white/20'} rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none`}
                  >
                    <option value="" className="bg-gray-800">Select Your Role</option>
                    {govRoles.map((role) => (
                      <option key={role.value} value={role.value} className="bg-gray-800">
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.role && <p className="text-red-400 text-sm mt-1">{errors.role}</p>}
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Employee ID *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    className={`w-full bg-white/10 border ${errors.employeeId ? 'border-red-500' : 'border-white/20'} rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
                    placeholder="EMP001234"
                  />
                </div>
                {errors.employeeId && <p className="text-red-400 text-sm mt-1">{errors.employeeId}</p>}
              </div>
            </div>

            {/* Department Display */}
            {formData.role && (
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Department
                </label>
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-300">
                  {formData.department}
                </div>
              </div>
            )}

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className={`w-full bg-white/10 border ${errors.password ? 'border-red-500' : 'border-white/20'} rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full bg-white/10 border ${errors.confirmPassword ? 'border-red-500' : 'border-white/20'} rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent`}
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 text-yellow-600 bg-white/10 border-white/20 rounded focus:ring-yellow-500 mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-300">
                I certify that I am an authorized government employee and agree to the{' '}
                <button type="button" className="text-yellow-400 hover:text-yellow-300 underline">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-yellow-400 hover:text-yellow-300 underline">
                  Government Code of Conduct
                </button>
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Creating Government Account...' : 'Create Government Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Already have a government account?{' '}
              <button 
                onClick={() => navigate('/gov-login')}
                className="text-yellow-400 hover:text-yellow-300 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>

          {/* Back to Public */}
          <div className="mt-4 text-center">
            <button 
              onClick={() => navigate('/login')}
              className="text-blue-400 hover:text-blue-300 font-medium text-sm"
            >
              ← Back to Public Login
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-red-500/10 rounded-lg p-4 border border-red-500/20">
          <p className="text-red-200 text-xs text-center">
            🔒 Government accounts require verification. Only authorized personnel should register.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GovRegister;