import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Camera } from 'lucide-react';

const ProfileDropdown = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem('profileImage') || null
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowImageUpload(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        setProfileImage(imageData);
        localStorage.setItem('profileImage', imageData);
        setShowImageUpload(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 hover:bg-white/10 rounded-lg p-2 transition-colors"
      >
        <div className="relative">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
            />
          ) : (
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
        </div>
        <span className="text-sm font-medium">{user.name || 'User'}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
          {/* Profile Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div 
                className="relative cursor-pointer group"
                onClick={() => setShowImageUpload(!showImageUpload)}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/20 group-hover:opacity-75 transition-opacity"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center group-hover:opacity-75 transition-opacity">
                    <span className="text-white font-bold text-lg">
                      {user.name?.[0] || 'U'}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{user.name || 'User'}</p>
                <p className="text-sm text-gray-400">{user.email}</p>
                <p className="text-xs text-gray-500">
                  {user.city}, {user.state}
                </p>
              </div>
            </div>

            {showImageUpload && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg transition-colors"
                  >
                    Upload Photo
                  </button>
                  {profileImage && (
                    <button
                      onClick={() => {
                        setProfileImage(null);
                        localStorage.removeItem('profileImage');
                        setShowImageUpload(false);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                navigate('/profile');
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
            
            <button
              onClick={() => {
                navigate('/my-reports');
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <User className="w-4 h-4" />
              <span>My Reports</span>
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-700 py-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;