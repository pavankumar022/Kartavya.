import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';

const LocationServiceStatus = ({ showDetails = false }) => {
  const [serviceStatus, setServiceStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkServiceAvailability();
  }, []);

  const checkServiceAvailability = async () => {
    setLoading(true);
    
    const services = {
      googleMaps: {
        name: 'Google Maps',
        available: !!(process.env.REACT_APP_GOOGLE_MAPS_API_KEY && 
                     process.env.REACT_APP_GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY'),
        accuracy: 'Very High',
        icon: '🗺️'
      },
      geoapify: {
        name: 'Geoapify',
        available: !!(process.env.REACT_APP_GEOAPIFY_API_KEY && 
                     process.env.REACT_APP_GEOAPIFY_API_KEY !== 'YOUR_GEOAPIFY_API_KEY'),
        accuracy: 'High',
        icon: '🌍'
      },
      here: {
        name: 'HERE Maps',
        available: !!(process.env.REACT_APP_HERE_API_KEY && 
                     process.env.REACT_APP_HERE_API_KEY !== 'YOUR_HERE_API_KEY'),
        accuracy: 'Very High',
        icon: '📍'
      },
      mapbox: {
        name: 'MapBox',
        available: !!(process.env.REACT_APP_MAPBOX_API_KEY && 
                     process.env.REACT_APP_MAPBOX_API_KEY !== 'YOUR_MAPBOX_API_KEY'),
        accuracy: 'High',
        icon: '🗾'
      },
      positionstack: {
        name: 'Positionstack',
        available: !!(process.env.REACT_APP_POSITIONSTACK_API_KEY && 
                     process.env.REACT_APP_POSITIONSTACK_API_KEY !== 'YOUR_POSITIONSTACK_API_KEY'),
        accuracy: 'Medium',
        icon: '🌐'
      },
      nominatim: {
        name: 'OpenStreetMap',
        available: true, // Always available (free)
        accuracy: 'Medium',
        icon: '🆓'
      },
      photon: {
        name: 'Photon',
        available: true, // Always available (free)
        accuracy: 'Medium',
        icon: '⚡'
      }
    };

    setServiceStatus(services);
    setLoading(false);
  };

  const availableServices = Object.values(serviceStatus).filter(s => s.available);
  const premiumServices = Object.values(serviceStatus).filter(s => s.available && s.name !== 'OpenStreetMap' && s.name !== 'Photon');

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-400 text-sm">
        <Wifi className="w-4 h-4 animate-pulse" />
        <span>Checking location services...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Summary Status */}
      <div className="flex items-center space-x-2">
        {premiumServices.length > 0 ? (
          <CheckCircle className="w-4 h-4 text-green-400" />
        ) : (
          <AlertCircle className="w-4 h-4 text-yellow-400" />
        )}
        <span className="text-sm text-gray-300">
          {premiumServices.length > 0 ? (
            <>
              <span className="text-green-400 font-medium">Premium Location Services Active</span>
              <span className="text-gray-400"> • {premiumServices.length} premium + {availableServices.length - premiumServices.length} free providers</span>
            </>
          ) : (
            <>
              <span className="text-yellow-400 font-medium">Free Services Only</span>
              <span className="text-gray-400"> • {availableServices.length} free providers available</span>
            </>
          )}
        </span>
      </div>

      {/* Detailed Status */}
      {showDetails && (
        <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
          <h4 className="text-white text-sm font-medium mb-2">📡 Location Service Providers</h4>
          
          {/* Premium Services */}
          {premiumServices.length > 0 && (
            <div className="space-y-1">
              <h5 className="text-green-300 text-xs font-medium">Premium Services (API Key Required)</h5>
              {Object.entries(serviceStatus).map(([key, service]) => {
                if (!service.available || service.name === 'OpenStreetMap' || service.name === 'Photon') return null;
                
                return (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-gray-300">{service.icon} {service.name}</span>
                    </div>
                    <span className="text-green-400">{service.accuracy}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Free Services */}
          <div className="space-y-1">
            <h5 className="text-blue-300 text-xs font-medium">Free Services</h5>
            {Object.entries(serviceStatus).map(([key, service]) => {
              if (service.name !== 'OpenStreetMap' && service.name !== 'Photon') return null;
              
              return (
                <div key={key} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-blue-400" />
                    <span className="text-gray-300">{service.icon} {service.name}</span>
                  </div>
                  <span className="text-blue-400">{service.accuracy}</span>
                </div>
              );
            })}
          </div>

          {/* Unavailable Premium Services */}
          {Object.values(serviceStatus).some(s => !s.available && s.name !== 'OpenStreetMap' && s.name !== 'Photon') && (
            <div className="space-y-1">
              <h5 className="text-gray-400 text-xs font-medium">Available with API Keys</h5>
              {Object.entries(serviceStatus).map(([key, service]) => {
                if (service.available || service.name === 'OpenStreetMap' || service.name === 'Photon') return null;
                
                return (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <XCircle className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-500">{service.icon} {service.name}</span>
                    </div>
                    <span className="text-gray-500">{service.accuracy}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Setup Instructions */}
          {premiumServices.length === 0 && (
            <div className="mt-3 p-2 bg-blue-900/20 border border-blue-500/30 rounded text-xs">
              <p className="text-blue-300 font-medium mb-1">💡 Get Premium Accuracy</p>
              <p className="text-gray-300">
                Add API keys to <code className="bg-gray-700 px-1 rounded">.env</code> file for premium location services.
                See <code className="bg-gray-700 px-1 rounded">.env.premium.example</code> for setup instructions.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationServiceStatus;