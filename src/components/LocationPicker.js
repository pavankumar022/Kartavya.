
import { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader, CheckCircle, Map } from 'lucide-react';
import { reverseGeocode, formatAddress } from '../utils/locationService';

const LocationPicker = ({ onLocationSelect, initialLocation = null }) => {
  const [currentLocation, setCurrentLocation] = useState(initialLocation);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 }); // Default to Bangalore
  const [selectedCoords, setSelectedCoords] = useState(null);

  useEffect(() => {
    if (initialLocation) {
      setCurrentLocation(initialLocation);
      setMapCenter(initialLocation.coordinates);
    }
  }, [initialLocation]);

  // Get GPS location using standard Geolocation API
  const handleGetGPSLocation = async () => {
    setLoading(true);

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Get address information
          let addressInfo;
          try {
            addressInfo = await reverseGeocode(lat, lng);
          } catch (addressErr) {
            console.warn('Address lookup failed:', addressErr);
            addressInfo = {
              formatted: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
              components: {}
            };
          }

          const locationData = {
            coordinates: { lat, lng },
            accuracy: position.coords.accuracy,
            address: addressInfo,
            timestamp: new Date().toISOString(),
            source: 'gps'
          };

          setCurrentLocation(locationData);
          setMapCenter({ lat, lng });
          onLocationSelect(locationData);

        } catch (err) {
          console.error('Error processing location:', err);
          alert('Failed to process location data. Please try again.');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLoading(false);
        let errorMessage = 'Failed to get location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred.';
        }
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // Handle map click (for manual coordinate selection)
  const handleMapClick = async (lat, lng) => {
    setSelectedCoords({ lat, lng });
    setLoading(true);

    try {
      const addressInfo = await reverseGeocode(lat, lng);

      const locationData = {
        coordinates: { lat, lng },
        address: addressInfo,
        accuracy: 5, // Manual selection is very accurate
        timestamp: new Date().toISOString(),
        source: 'manual'
      };

      setCurrentLocation(locationData);
      onLocationSelect(locationData);
    } catch (err) {
      console.warn('Failed to get address for selected location:', err);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced map component with satellite view
  const EnhancedMap = () => {
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapType, setMapType] = useState('satellite');
    const [zoom, setZoom] = useState(15);

    useEffect(() => {
      setMapLoaded(true);
    }, []);

    return (
      <div className="relative w-full h-80 bg-gray-700 rounded-lg overflow-hidden">
        {/* Map Type Controls */}
        <div className="absolute top-2 left-2 z-10 flex space-x-1">
          {['satellite', 'street', 'hybrid'].map((type) => (
            <button
              key={type}
              onClick={() => setMapType(type)}
              className={`px-2 py-1 text-xs rounded ${mapType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-black/70 text-white hover:bg-black/90'
                }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-2 right-2 z-10 flex flex-col space-y-1">
          <button
            onClick={() => setZoom(Math.min(zoom + 1, 18))}
            className="w-8 h-8 bg-black/70 text-white hover:bg-black/90 rounded flex items-center justify-center text-lg font-bold"
          >
            +
          </button>
          <button
            onClick={() => setZoom(Math.max(zoom - 1, 8))}
            className="w-8 h-8 bg-black/70 text-white hover:bg-black/90 rounded flex items-center justify-center text-lg font-bold"
          >
            −
          </button>
        </div>

        {!mapLoaded ? (
          <div className="flex items-center justify-center h-full">
            <Loader className="w-6 h-6 animate-spin text-blue-400" />
            <span className="ml-2 text-gray-300">Loading map...</span>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {/* Enhanced map with satellite imagery */}
            <div
              className="w-full h-full cursor-crosshair relative"
              style={{
                backgroundImage: mapType === 'satellite'
                  ? `url("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${Math.floor((1 - Math.log(Math.tan(mapCenter.lat * Math.PI / 180) + 1 / Math.cos(mapCenter.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))}/${Math.floor((mapCenter.lng + 180) / 360 * Math.pow(2, zoom))}")`
                  : mapType === 'hybrid'
                    ? `url("https://mt1.google.com/vt/lyrs=y&x=${Math.floor((mapCenter.lng + 180) / 360 * Math.pow(2, zoom))}&y=${Math.floor((1 - Math.log(Math.tan(mapCenter.lat * Math.PI / 180) + 1 / Math.cos(mapCenter.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))}&z=${zoom}")`
                    : `url("https://tile.openstreetmap.org/${zoom}/${Math.floor((mapCenter.lng + 180) / 360 * Math.pow(2, zoom))}/${Math.floor((1 - Math.log(Math.tan(mapCenter.lat * Math.PI / 180) + 1 / Math.cos(mapCenter.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))}.png")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // More accurate coordinate conversion based on zoom level
                const latRange = 180 / Math.pow(2, zoom - 8);
                const lngRange = 360 / Math.pow(2, zoom - 8);

                const lat = mapCenter.lat + (latRange * (rect.height / 2 - y) / rect.height);
                const lng = mapCenter.lng + (lngRange * (x - rect.width / 2) / rect.width);

                handleMapClick(lat, lng);
              }}
            >
              {/* Center crosshair */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-6 h-6 relative">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 transform -translate-y-1/2"></div>
                  <div className="absolute left-1/2 top-0 w-0.5 h-full bg-red-500 transform -translate-x-1/2"></div>
                  <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
              </div>

              {/* Selected location marker */}
              {selectedCoords && (
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: '60%',
                    top: '40%'
                  }}
                >
                  <div className="relative">
                    <MapPin className="w-8 h-8 text-blue-500 drop-shadow-lg" />
                    <div className="absolute -bottom-1 left-1/2 w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2 animate-ping"></div>
                  </div>
                </div>
              )}

              {/* Current location marker */}
              {currentLocation && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
                    <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Map overlay info */}
            <div className="absolute bottom-2 left-2 bg-black/90 text-white text-xs px-3 py-2 rounded-lg max-w-52">
              <div className="font-medium text-yellow-300">📍 Interactive Map</div>
              <div>🛰️ {mapType.charAt(0).toUpperCase() + mapType.slice(1)} view</div>
              <div className="text-gray-300">Click anywhere for precise selection</div>
            </div>

            {/* Coordinates display */}
            <div className="absolute bottom-2 right-2 bg-black/90 text-white text-xs px-3 py-2 rounded-lg">
              <div className="font-medium text-blue-300">🌐 Coordinates</div>
              <div>Lat: {mapCenter.lat.toFixed(6)}</div>
              <div>Lng: {mapCenter.lng.toFixed(6)}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Current Location Display */}
      {currentLocation && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 space-y-3">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-green-300 font-medium mb-1">📍 Selected Location</h4>
              <p className="text-gray-300 text-sm">
                {currentLocation.address?.formatted || formatAddress(currentLocation.address?.components)}
              </p>

              <div className="mt-2 space-y-1">
                <p className="text-gray-400 text-xs">
                  🌐 {currentLocation.coordinates.lat.toFixed(6)}, {currentLocation.coordinates.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Methods */}
      <div className="space-y-4">
        {/* Primary GPS Location Button */}
        <button
          onClick={handleGetGPSLocation}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          {loading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <Navigation className="w-5 h-5" />
          )}
          <div className="text-left flex-1">
            <div className="font-medium">Get Current Location</div>
            <div className="text-xs text-blue-200">
              Use GPS for best accuracy
            </div>
          </div>
        </button>

        {/* Secondary Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Map Selection */}
          <button
            onClick={() => setShowMap(!showMap)}
            className="flex items-center justify-center space-x-3 p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Map className="w-4 h-4" />
            <span>{showMap ? 'Hide Map' : 'Select on Map'}</span>
          </button>

          {/* Quick Location (if available) */}
          {currentLocation && (
            <button
              onClick={() => onLocationSelect(currentLocation)}
              className="flex items-center justify-center space-x-3 p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Use Current</span>
            </button>
          )}
        </div>
      </div>

      {/* Map Interface */}
      {showMap && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Select Location on Map</h4>
          <EnhancedMap />
          <p className="text-gray-400 text-sm mt-2">
            Click anywhere on the map to select that location.
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
