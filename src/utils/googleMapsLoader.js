// Google Maps JavaScript API loader with enhanced geolocation services

const GOOGLE_MAPS_CONFIG = {
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
  libraries: ['places', 'geometry', 'drawing'],
  version: 'weekly',
  language: 'en',
  region: 'IN' // India region for better local results
};

let isGoogleMapsLoaded = false;
let googleMapsPromise = null;

// Load Google Maps JavaScript API
export const loadGoogleMaps = () => {
  if (isGoogleMapsLoaded && window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    // Check if API key is configured
    if (!GOOGLE_MAPS_CONFIG.apiKey || GOOGLE_MAPS_CONFIG.apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
      console.warn('Google Maps API key not configured. Using fallback location services.');
      reject(new Error('Google Maps API key not configured'));
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;
    
    // Construct API URL with all required libraries
    const apiUrl = new URL('https://maps.googleapis.com/maps/api/js');
    apiUrl.searchParams.set('key', GOOGLE_MAPS_CONFIG.apiKey);
    apiUrl.searchParams.set('libraries', GOOGLE_MAPS_CONFIG.libraries.join(','));
    apiUrl.searchParams.set('v', GOOGLE_MAPS_CONFIG.version);
    apiUrl.searchParams.set('language', GOOGLE_MAPS_CONFIG.language);
    apiUrl.searchParams.set('region', GOOGLE_MAPS_CONFIG.region);
    
    script.src = apiUrl.toString();

    // Set up callback
    window.initGoogleMaps = () => {
      isGoogleMapsLoaded = true;
      console.log('Google Maps API loaded successfully');
      resolve(window.google.maps);
      delete window.initGoogleMaps;
    };

    script.onerror = (error) => {
      console.error('Failed to load Google Maps API:', error);
      reject(new Error('Failed to load Google Maps API'));
    };

    // Add callback parameter
    apiUrl.searchParams.set('callback', 'initGoogleMaps');
    script.src = apiUrl.toString();

    // Append to document
    document.head.appendChild(script);

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!isGoogleMapsLoaded) {
        reject(new Error('Google Maps API loading timeout'));
      }
    }, 10000);
  });

  return googleMapsPromise;
};

// Check if Google Maps is available
export const isGoogleMapsAvailable = () => {
  return isGoogleMapsLoaded && window.google && window.google.maps;
};

// Initialize Google Maps services for enhanced location
export const initializeGoogleLocationServices = async () => {
  try {
    await loadGoogleMaps();
    
    // Verify required services are available
    if (!window.google.maps.places) {
      throw new Error('Google Places API not available');
    }

    console.log('Google location services initialized successfully');
    return true;
  } catch (error) {
    console.warn('Google location services initialization failed:', error);
    return false;
  }
};

// Get enhanced location using Google services
export const getEnhancedLocationWithGoogle = async () => {
  try {
    // Ensure Google Maps is loaded
    await loadGoogleMaps();

    // Use Google's geolocation with enhanced accuracy
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      // Enhanced geolocation options
      const options = {
        enableHighAccuracy: true,
        timeout: 25000, // 25 seconds for maximum accuracy
        maximumAge: 10000 // 10 seconds cache for fresh data
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          try {
            // Enhance with Google Places API
            const service = new window.google.maps.places.PlacesService(document.createElement('div'));
            
            const request = {
              location: new window.google.maps.LatLng(latitude, longitude),
              radius: Math.min(accuracy, 100), // Use GPS accuracy as search radius
              type: ['establishment']
            };

            service.nearbySearch(request, async (results, status) => {
              let enhancedAddress = {
                formatted: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                components: {
                  latitude,
                  longitude
                }
              };

              // If we found nearby places, enhance the address
              if (status === window.google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                const nearestPlace = results[0];
                
                // Get detailed place information
                const detailRequest = {
                  placeId: nearestPlace.place_id,
                  fields: ['name', 'formatted_address', 'address_components', 'geometry', 'types']
                };

                service.getDetails(detailRequest, (place, detailStatus) => {
                  if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK) {
                    const addressComponents = {};
                    
                    if (place.address_components) {
                      place.address_components.forEach(component => {
                        const types = component.types;
                        if (types.includes('street_number')) addressComponents.house_number = component.long_name;
                        if (types.includes('route')) addressComponents.road = component.long_name;
                        if (types.includes('neighborhood')) addressComponents.neighbourhood = component.long_name;
                        if (types.includes('locality')) addressComponents.city = component.long_name;
                        if (types.includes('administrative_area_level_1')) addressComponents.state = component.long_name;
                        if (types.includes('postal_code')) addressComponents.postcode = component.long_name;
                        if (types.includes('country')) addressComponents.country = component.long_name;
                      });
                    }

                    enhancedAddress = {
                      formatted: place.formatted_address || enhancedAddress.formatted,
                      components: {
                        ...addressComponents,
                        latitude,
                        longitude
                      },
                      nearbyPlace: place.name,
                      placeTypes: place.types,
                      provider: 'Google Maps'
                    };
                  }

                  resolve({
                    coordinates: { lat: latitude, lng: longitude },
                    accuracy: accuracy,
                    address: enhancedAddress,
                    timestamp: new Date().toISOString(),
                    source: 'google_enhanced',
                    provider: 'Google Maps Enhanced'
                  });
                });
              } else {
                // No nearby places found, use basic geocoding
                try {
                  const geocoder = new window.google.maps.Geocoder();
                  const geocodeRequest = {
                    location: { lat: latitude, lng: longitude }
                  };

                  geocoder.geocode(geocodeRequest, (results, geocodeStatus) => {
                    if (geocodeStatus === 'OK' && results[0]) {
                      const result = results[0];
                      const addressComponents = {};
                      
                      result.address_components.forEach(component => {
                        const types = component.types;
                        if (types.includes('street_number')) addressComponents.house_number = component.long_name;
                        if (types.includes('route')) addressComponents.road = component.long_name;
                        if (types.includes('neighborhood')) addressComponents.neighbourhood = component.long_name;
                        if (types.includes('locality')) addressComponents.city = component.long_name;
                        if (types.includes('administrative_area_level_1')) addressComponents.state = component.long_name;
                        if (types.includes('postal_code')) addressComponents.postcode = component.long_name;
                        if (types.includes('country')) addressComponents.country = component.long_name;
                      });

                      enhancedAddress = {
                        formatted: result.formatted_address,
                        components: {
                          ...addressComponents,
                          latitude,
                          longitude
                        },
                        provider: 'Google Geocoder'
                      };
                    }

                    resolve({
                      coordinates: { lat: latitude, lng: longitude },
                      accuracy: accuracy,
                      address: enhancedAddress,
                      timestamp: new Date().toISOString(),
                      source: 'google_geocoder',
                      provider: 'Google Maps Geocoder'
                    });
                  });
                } catch (geocodeError) {
                  // Fallback to basic location
                  resolve({
                    coordinates: { lat: latitude, lng: longitude },
                    accuracy: accuracy,
                    address: enhancedAddress,
                    timestamp: new Date().toISOString(),
                    source: 'gps_basic',
                    provider: 'GPS'
                  });
                }
              }
            });
          } catch (error) {
            // Fallback to basic GPS location
            resolve({
              coordinates: { lat: latitude, lng: longitude },
              accuracy: accuracy,
              address: {
                formatted: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                components: { latitude, longitude }
              },
              timestamp: new Date().toISOString(),
              source: 'gps_fallback',
              provider: 'GPS'
            });
          }
        },
        (error) => {
          reject(error);
        },
        options
      );
    });
  } catch (error) {
    throw new Error(`Google enhanced location failed: ${error.message}`);
  }
};

// Search places using Google Places API
export const searchPlacesWithGoogle = async (query, location = null) => {
  try {
    await loadGoogleMaps();

    return new Promise((resolve, reject) => {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      
      const request = {
        query: query,
        fields: ['place_id', 'name', 'formatted_address', 'geometry', 'types'],
      };

      // Add location bias if provided
      if (location) {
        request.locationBias = {
          center: new window.google.maps.LatLng(location.lat, location.lng),
          radius: 10000 // 10km radius
        };
      }

      service.textSearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const places = results.map(place => ({
            id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            coordinates: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            },
            types: place.types,
            provider: 'Google Places'
          }));
          resolve(places);
        } else {
          reject(new Error(`Google Places search failed: ${status}`));
        }
      });
    });
  } catch (error) {
    throw new Error(`Google Places search error: ${error.message}`);
  }
};