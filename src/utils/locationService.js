// Enhanced location service with multiple providers and map selection

// Comprehensive location service configuration with multiple premium providers
const LOCATION_CONFIG = {
  // OpenStreetMap Nominatim (Free, no API key required)
  nominatim: {
    baseUrl: 'https://nominatim.openstreetmap.org',
    reverseGeocode: '/reverse',
    search: '/search'
  },
  
  // Photon (Free backup geocoding service)
  photon: {
    baseUrl: 'https://photon.komoot.io',
    api: '/api'
  },
  
  // Google Maps APIs (Premium, requires API key)
  googleMaps: {
    baseUrl: 'https://maps.googleapis.com/maps/api',
    apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
    geolocationUrl: 'https://www.googleapis.com/geolocation/v1/geolocate',
    placesUrl: 'https://maps.googleapis.com/maps/api/place',
    geocodeUrl: 'https://maps.googleapis.com/maps/api/geocode'
  },
  
  // Geoapify (Premium, high accuracy)
  geoapify: {
    baseUrl: 'https://api.geoapify.com/v1',
    apiKey: process.env.REACT_APP_GEOAPIFY_API_KEY || 'YOUR_GEOAPIFY_API_KEY',
    reverseGeocode: '/geocode/reverse',
    search: '/geocode/search',
    places: '/places'
  },
  
  // Positionstack (Premium, global coverage)
  positionstack: {
    baseUrl: 'https://api.positionstack.com/v1',
    apiKey: process.env.REACT_APP_POSITIONSTACK_API_KEY || 'YOUR_POSITIONSTACK_API_KEY',
    reverseGeocode: '/reverse',
    forward: '/forward'
  },
  
  // MapBox (Premium alternative)
  mapbox: {
    baseUrl: 'https://api.mapbox.com',
    apiKey: process.env.REACT_APP_MAPBOX_API_KEY || 'YOUR_MAPBOX_API_KEY',
    geocoding: '/geocoding/v5/mapbox.places'
  },
  
  // HERE Maps (Premium, enterprise grade)
  here: {
    baseUrl: 'https://revgeocode.search.hereapi.com/v1',
    apiKey: process.env.REACT_APP_HERE_API_KEY || 'YOUR_HERE_API_KEY',
    reverseGeocode: '/revgeocode'
  }
};

// Enhanced geolocation with maximum accuracy
export const getCurrentLocationAccurate = (forceRefresh = false) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    // Maximum accuracy geolocation options
    const options = {
      enableHighAccuracy: true,
      timeout: 30000, // 30 seconds for better accuracy
      maximumAge: forceRefresh ? 0 : 10000 // Force fresh data if requested, otherwise 10 seconds cache
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        try {
          // Get detailed address information
          const addressInfo = await reverseGeocode(latitude, longitude);
          
          resolve({
            coordinates: { lat: latitude, lng: longitude },
            accuracy: accuracy,
            address: addressInfo,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          // Even if reverse geocoding fails, return coordinates
          resolve({
            coordinates: { lat: latitude, lng: longitude },
            accuracy: accuracy,
            address: {
              formatted: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              components: {}
            },
            timestamp: new Date().toISOString()
          });
        }
      },
      (error) => {
        let errorMessage = 'Unable to get your location. ';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable. Try manual selection.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Try manual selection.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      options
    );
  });
};

// Premium multi-provider reverse geocoding with intelligent fallback
export const reverseGeocode = async (lat, lng) => {
  const providers = [];
  
  // Priority order: Premium APIs first for best accuracy, then free APIs
  
  // 1. Google Maps (Premium - highest accuracy)
  if (LOCATION_CONFIG.googleMaps.apiKey && LOCATION_CONFIG.googleMaps.apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY') {
    providers.push({
      name: 'Google Maps',
      fn: () => reverseGeocodeGoogle(lat, lng),
      priority: 1
    });
  }
  
  // 2. Geoapify (Premium - high accuracy, detailed data)
  if (LOCATION_CONFIG.geoapify.apiKey && LOCATION_CONFIG.geoapify.apiKey !== 'YOUR_GEOAPIFY_API_KEY') {
    providers.push({
      name: 'Geoapify',
      fn: () => reverseGeocodeGeoapify(lat, lng),
      priority: 2
    });
  }
  
  // 3. HERE Maps (Premium - enterprise grade)
  if (LOCATION_CONFIG.here.apiKey && LOCATION_CONFIG.here.apiKey !== 'YOUR_HERE_API_KEY') {
    providers.push({
      name: 'HERE Maps',
      fn: () => reverseGeocodeHere(lat, lng),
      priority: 3
    });
  }
  
  // 4. MapBox (Premium alternative)
  if (LOCATION_CONFIG.mapbox.apiKey && LOCATION_CONFIG.mapbox.apiKey !== 'YOUR_MAPBOX_API_KEY') {
    providers.push({
      name: 'MapBox',
      fn: () => reverseGeocodeMapbox(lat, lng),
      priority: 4
    });
  }
  
  // 5. Positionstack (Premium - global coverage)
  if (LOCATION_CONFIG.positionstack.apiKey && LOCATION_CONFIG.positionstack.apiKey !== 'YOUR_POSITIONSTACK_API_KEY') {
    providers.push({
      name: 'Positionstack',
      fn: () => reverseGeocodePositionstack(lat, lng),
      priority: 5
    });
  }
  
  // 6. OpenStreetMap Nominatim (Free - good accuracy)
  providers.push({
    name: 'Nominatim',
    fn: () => reverseGeocodeNominatim(lat, lng),
    priority: 6
  });
  
  // 7. Photon (Free backup)
  providers.push({
    name: 'Photon',
    fn: () => reverseGeocodePhoton(lat, lng),
    priority: 7
  });
  
  // Try providers in priority order
  for (const provider of providers) {
    try {
      console.log(`Trying ${provider.name} for reverse geocoding...`);
      const result = await provider.fn();
      if (result && result.formatted) {
        console.log(`✅ ${provider.name} succeeded`);
        return result;
      }
    } catch (error) {
      console.warn(`❌ ${provider.name} reverse geocoding failed:`, error);
    }
  }

  // Ultimate fallback to coordinates
  console.warn('All reverse geocoding providers failed, using coordinates');
  return {
    formatted: `${lat.toFixed(8)}, ${lng.toFixed(8)}`,
    components: {
      latitude: lat,
      longitude: lng
    },
    provider: 'Coordinates Only'
  };
};

// OpenStreetMap Nominatim reverse geocoding with English language preference
const reverseGeocodeNominatim = async (lat, lng) => {
  // Force English language and add more specific parameters for better accuracy
  const url = `${LOCATION_CONFIG.nominatim.baseUrl}${LOCATION_CONFIG.nominatim.reverseGeocode}?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en&extratags=1&namedetails=1`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Kartavya-CivicTech-App/1.0',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });
  
  if (!response.ok) throw new Error('Nominatim request failed');
  
  const data = await response.json();
  
  if (!data || !data.display_name) {
    throw new Error('No address found');
  }

  // Build a more accurate English address
  const components = {
    house_number: data.address?.house_number,
    road: data.address?.road,
    neighbourhood: data.address?.neighbourhood || data.address?.suburb,
    suburb: data.address?.suburb,
    city: data.address?.city || data.address?.town || data.address?.village,
    state: data.address?.state,
    postcode: data.address?.postcode,
    country: data.address?.country,
    latitude: parseFloat(data.lat),
    longitude: parseFloat(data.lon)
  };

  // Create a cleaner English formatted address
  const addressParts = [];
  
  // Add house number and road
  if (components.house_number && components.road) {
    addressParts.push(`${components.house_number} ${components.road}`);
  } else if (components.road) {
    addressParts.push(components.road);
  }
  
  // Add neighbourhood/area
  if (components.neighbourhood && components.neighbourhood !== components.city) {
    addressParts.push(components.neighbourhood);
  }
  
  // Add city
  if (components.city) {
    addressParts.push(components.city);
  }
  
  // Add state and postcode
  if (components.state) {
    const statePostcode = components.postcode ? 
      `${components.state} ${components.postcode}` : 
      components.state;
    addressParts.push(statePostcode);
  }
  
  // Add country if not India (to keep addresses concise for local use)
  if (components.country && components.country.toLowerCase() !== 'india') {
    addressParts.push(components.country);
  }

  const formattedAddress = addressParts.length > 0 ? 
    addressParts.join(', ') : 
    data.display_name;

  return {
    formatted: formattedAddress,
    components: components,
    provider: 'OpenStreetMap',
    originalResponse: data.display_name // Keep original for debugging
  };
};

// Photon reverse geocoding (backup)
const reverseGeocodePhoton = async (lat, lng) => {
  const url = `${LOCATION_CONFIG.photon.baseUrl}${LOCATION_CONFIG.photon.api}?lat=${lat}&lon=${lng}&limit=1`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Photon request failed');
  
  const data = await response.json();
  
  if (!data.features || data.features.length === 0) {
    throw new Error('No address found');
  }

  const feature = data.features[0];
  const props = feature.properties;

  return {
    formatted: `${props.name || ''} ${props.street || ''}, ${props.city || ''}, ${props.state || ''}, ${props.country || ''}`.trim(),
    components: {
      name: props.name,
      street: props.street,
      city: props.city,
      state: props.state,
      country: props.country,
      postcode: props.postcode,
      latitude: feature.geometry.coordinates[1],
      longitude: feature.geometry.coordinates[0]
    },
    provider: 'Photon'
  };
};

// Google Maps reverse geocoding (Premium - highest accuracy)
const reverseGeocodeGoogle = async (lat, lng) => {
  if (!LOCATION_CONFIG.googleMaps.apiKey || LOCATION_CONFIG.googleMaps.apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    throw new Error('Google Maps API key not configured');
  }

  const url = `${LOCATION_CONFIG.googleMaps.baseUrl}/geocode/json?latlng=${lat},${lng}&key=${LOCATION_CONFIG.googleMaps.apiKey}&language=en&result_type=street_address|route|neighborhood|locality`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Google Maps request failed: ${response.status}`);
  
  const data = await response.json();
  
  if (data.status !== 'OK' || !data.results || data.results.length === 0) {
    throw new Error(`Google Maps API error: ${data.status}`);
  }

  const result = data.results[0];
  const components = {};
  
  result.address_components.forEach(component => {
    const types = component.types;
    if (types.includes('street_number')) components.house_number = component.long_name;
    if (types.includes('route')) components.road = component.long_name;
    if (types.includes('sublocality') || types.includes('neighborhood')) components.neighbourhood = component.long_name;
    if (types.includes('locality')) components.city = component.long_name;
    if (types.includes('administrative_area_level_2')) components.district = component.long_name;
    if (types.includes('administrative_area_level_1')) components.state = component.long_name;
    if (types.includes('postal_code')) components.postcode = component.long_name;
    if (types.includes('country')) components.country = component.long_name;
  });

  return {
    formatted: result.formatted_address,
    components: {
      ...components,
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng
    },
    provider: 'Google Maps',
    confidence: 'very_high',
    place_id: result.place_id,
    geometry_type: result.geometry.location_type
  };
};

// Geoapify reverse geocoding (Premium - high accuracy, detailed data)
const reverseGeocodeGeoapify = async (lat, lng) => {
  if (!LOCATION_CONFIG.geoapify.apiKey || LOCATION_CONFIG.geoapify.apiKey === 'YOUR_GEOAPIFY_API_KEY') {
    throw new Error('Geoapify API key not configured');
  }

  const url = `${LOCATION_CONFIG.geoapify.baseUrl}${LOCATION_CONFIG.geoapify.reverseGeocode}?lat=${lat}&lon=${lng}&apiKey=${LOCATION_CONFIG.geoapify.apiKey}&lang=en&format=json`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Geoapify request failed: ${response.status}`);
  
  const data = await response.json();
  
  if (!data.results || data.results.length === 0) {
    throw new Error('No address found from Geoapify');
  }

  const result = data.results[0];
  
  const components = {
    house_number: result.housenumber,
    road: result.street,
    neighbourhood: result.suburb || result.district,
    city: result.city,
    county: result.county,
    state: result.state,
    postcode: result.postcode,
    country: result.country,
    latitude: result.lat,
    longitude: result.lon
  };

  // Build formatted address
  const addressParts = [];
  if (components.house_number && components.road) {
    addressParts.push(`${components.house_number} ${components.road}`);
  } else if (components.road) {
    addressParts.push(components.road);
  }
  
  if (components.neighbourhood && components.neighbourhood !== components.city) {
    addressParts.push(components.neighbourhood);
  }
  
  if (components.city) {
    addressParts.push(components.city);
  }
  
  if (components.state) {
    const stateText = components.postcode ? 
      `${components.state} ${components.postcode}` : 
      components.state;
    addressParts.push(stateText);
  }

  return {
    formatted: addressParts.join(', ') || result.formatted,
    components: components,
    provider: 'Geoapify',
    confidence: 'high',
    place_id: result.place_id,
    accuracy: result.rank?.confidence || 'high'
  };
};

// HERE Maps reverse geocoding (Premium - enterprise grade)
const reverseGeocodeHere = async (lat, lng) => {
  if (!LOCATION_CONFIG.here.apiKey || LOCATION_CONFIG.here.apiKey === 'YOUR_HERE_API_KEY') {
    throw new Error('HERE Maps API key not configured');
  }

  const url = `${LOCATION_CONFIG.here.baseUrl}${LOCATION_CONFIG.here.reverseGeocode}?at=${lat},${lng}&apiKey=${LOCATION_CONFIG.here.apiKey}&lang=en-US`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HERE Maps request failed: ${response.status}`);
  
  const data = await response.json();
  
  if (!data.items || data.items.length === 0) {
    throw new Error('No address found from HERE Maps');
  }

  const result = data.items[0];
  const address = result.address;
  
  const components = {
    house_number: address.houseNumber,
    road: address.street,
    neighbourhood: address.district,
    city: address.city,
    county: address.county,
    state: address.state,
    postcode: address.postalCode,
    country: address.countryName,
    latitude: result.position.lat,
    longitude: result.position.lng
  };

  return {
    formatted: result.address.label,
    components: components,
    provider: 'HERE Maps',
    confidence: 'very_high',
    place_id: result.id,
    result_type: result.resultType
  };
};

// MapBox reverse geocoding (Premium alternative)
const reverseGeocodeMapbox = async (lat, lng) => {
  if (!LOCATION_CONFIG.mapbox.apiKey || LOCATION_CONFIG.mapbox.apiKey === 'YOUR_MAPBOX_API_KEY') {
    throw new Error('MapBox API key not configured');
  }

  const url = `${LOCATION_CONFIG.mapbox.baseUrl}${LOCATION_CONFIG.mapbox.geocoding}/${lng},${lat}.json?access_token=${LOCATION_CONFIG.mapbox.apiKey}&language=en&types=address,poi,place,locality,neighborhood`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`MapBox request failed: ${response.status}`);
  
  const data = await response.json();
  
  if (!data.features || data.features.length === 0) {
    throw new Error('No address found from MapBox');
  }

  const result = data.features[0];
  const context = result.context || [];
  
  const components = {
    latitude: result.center[1],
    longitude: result.center[0]
  };

  // Parse context for address components
  context.forEach(item => {
    if (item.id.startsWith('neighborhood')) components.neighbourhood = item.text;
    if (item.id.startsWith('locality')) components.city = item.text;
    if (item.id.startsWith('place')) components.city = item.text;
    if (item.id.startsWith('region')) components.state = item.text;
    if (item.id.startsWith('postcode')) components.postcode = item.text;
    if (item.id.startsWith('country')) components.country = item.text;
  });

  // Extract street info from place name
  if (result.properties?.address) {
    components.road = result.text;
    components.house_number = result.properties.address;
  } else if (result.place_type?.includes('address')) {
    components.road = result.text;
  }

  return {
    formatted: result.place_name,
    components: components,
    provider: 'MapBox',
    confidence: 'high',
    place_id: result.id,
    relevance: result.relevance
  };
};

// Positionstack reverse geocoding (Premium - global coverage)
const reverseGeocodePositionstack = async (lat, lng) => {
  if (!LOCATION_CONFIG.positionstack.apiKey || LOCATION_CONFIG.positionstack.apiKey === 'YOUR_POSITIONSTACK_API_KEY') {
    throw new Error('Positionstack API key not configured');
  }

  const url = `${LOCATION_CONFIG.positionstack.baseUrl}${LOCATION_CONFIG.positionstack.reverseGeocode}?access_key=${LOCATION_CONFIG.positionstack.apiKey}&query=${lat},${lng}&language=en&limit=1`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Positionstack request failed: ${response.status}`);
  
  const data = await response.json();
  
  if (!data.data || data.data.length === 0) {
    throw new Error('No address found from Positionstack');
  }

  const result = data.data[0];
  
  const components = {
    house_number: result.number,
    road: result.street,
    neighbourhood: result.neighbourhood,
    city: result.locality,
    county: result.county,
    state: result.region,
    postcode: result.postal_code,
    country: result.country,
    latitude: result.latitude,
    longitude: result.longitude
  };

  // Build formatted address
  const addressParts = [];
  if (components.house_number && components.road) {
    addressParts.push(`${components.house_number} ${components.road}`);
  } else if (components.road) {
    addressParts.push(components.road);
  }
  
  if (components.neighbourhood && components.neighbourhood !== components.city) {
    addressParts.push(components.neighbourhood);
  }
  
  if (components.city) {
    addressParts.push(components.city);
  }
  
  if (components.state) {
    const stateText = components.postcode ? 
      `${components.state} ${components.postcode}` : 
      components.state;
    addressParts.push(stateText);
  }

  return {
    formatted: addressParts.join(', ') || result.label,
    components: components,
    provider: 'Positionstack',
    confidence: result.confidence || 'medium',
    place_id: result.name,
    accuracy: result.accuracy
  };
};

// Search for locations (for manual selection)
export const searchLocations = async (query, limit = 5) => {
  const results = [];

  // Try Nominatim search
  try {
    const nominatimResults = await searchNominatim(query, limit);
    results.push(...nominatimResults);
  } catch (error) {
    console.warn('Nominatim search failed:', error);
  }

  // Try Photon search as backup
  if (results.length < limit) {
    try {
      const photonResults = await searchPhoton(query, limit - results.length);
      results.push(...photonResults);
    } catch (error) {
      console.warn('Photon search failed:', error);
    }
  }

  return results.slice(0, limit);
};

// Nominatim location search with English preference
const searchNominatim = async (query, limit) => {
  const url = `${LOCATION_CONFIG.nominatim.baseUrl}${LOCATION_CONFIG.nominatim.search}?format=json&q=${encodeURIComponent(query)}&limit=${limit}&addressdetails=1&countrycodes=in&accept-language=en&extratags=1&namedetails=1`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Kartavya-CivicTech-App/1.0',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });
  
  if (!response.ok) throw new Error('Search request failed');
  
  const data = await response.json();
  
  return data.map(item => {
    // Create cleaner English display name
    const addressParts = [];
    
    if (item.address?.road) {
      addressParts.push(item.address.road);
    }
    if (item.address?.neighbourhood || item.address?.suburb) {
      addressParts.push(item.address.neighbourhood || item.address.suburb);
    }
    if (item.address?.city || item.address?.town || item.address?.village) {
      addressParts.push(item.address.city || item.address.town || item.address.village);
    }
    if (item.address?.state) {
      addressParts.push(item.address.state);
    }
    
    const cleanName = addressParts.length > 0 ? 
      addressParts.join(', ') : 
      item.display_name;

    return {
      id: item.place_id,
      name: cleanName,
      coordinates: {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      },
      type: item.type,
      importance: item.importance,
      provider: 'OpenStreetMap'
    };
  });
};

// Photon location search
const searchPhoton = async (query, limit) => {
  const url = `${LOCATION_CONFIG.photon.baseUrl}${LOCATION_CONFIG.photon.api}?q=${encodeURIComponent(query)}&limit=${limit}`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Search request failed');
  
  const data = await response.json();
  
  return data.features.map(feature => ({
    id: feature.properties.osm_id,
    name: `${feature.properties.name || ''} ${feature.properties.street || ''}, ${feature.properties.city || ''}, ${feature.properties.state || ''}`.trim(),
    coordinates: {
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0]
    },
    type: feature.properties.osm_type,
    provider: 'Photon'
  }));
};

// Google Geolocation API for enhanced accuracy
export const getCurrentLocationWithGoogleGeolocation = async (forceRefresh = false) => {
  try {
    // First try Google Geolocation API for maximum accuracy
    if (LOCATION_CONFIG.googleMaps.apiKey && LOCATION_CONFIG.googleMaps.apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY') {
      const googleLocation = await getLocationFromGoogleGeolocation();
      if (googleLocation) {
        return googleLocation;
      }
    }
    
    // Fallback to enhanced GPS location
    return await getCurrentLocationAccurate(forceRefresh);
  } catch (error) {
    console.warn('Google Geolocation failed, using GPS fallback:', error);
    return getCurrentLocationAccurate(forceRefresh);
  }
};

// Get fresh location with multiple attempts for better accuracy
export const getFreshLocation = async (maxAttempts = 3) => {
  let bestLocation = null;
  let bestAccuracy = Infinity;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Location attempt ${attempt}/${maxAttempts}...`);
      
      // Force fresh data on each attempt
      const location = await getCurrentLocationAccurate(true);
      
      // Keep the most accurate reading
      if (location.accuracy < bestAccuracy) {
        bestLocation = location;
        bestAccuracy = location.accuracy;
      }
      
      // If we get very accurate reading (under 20m), use it immediately
      if (location.accuracy < 20) {
        console.log(`High accuracy achieved: ±${location.accuracy}m`);
        return location;
      }
      
      // Wait a bit between attempts for GPS to stabilize
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.warn(`Location attempt ${attempt} failed:`, error);
      if (attempt === maxAttempts && !bestLocation) {
        throw error;
      }
    }
  }
  
  if (bestLocation) {
    console.log(`Best location found with ±${bestLocation.accuracy}m accuracy`);
    return bestLocation;
  }
  
  throw new Error('Failed to get location after multiple attempts');
};

// Google Geolocation API implementation
const getLocationFromGoogleGeolocation = async () => {
  try {
    // Collect WiFi and cell tower data for Google Geolocation API
    const requestBody = {
      considerIp: true,
      wifiAccessPoints: await getWiFiAccessPoints(),
      cellTowers: await getCellTowers()
    };

    const response = await fetch(
      `${LOCATION_CONFIG.googleMaps.geolocationUrl}?key=${LOCATION_CONFIG.googleMaps.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(`Google Geolocation API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.location) {
      // Get detailed address using reverse geocoding
      const addressInfo = await reverseGeocodeGoogle(data.location.lat, data.location.lng);
      
      return {
        coordinates: {
          lat: data.location.lat,
          lng: data.location.lng
        },
        accuracy: data.accuracy || 100,
        address: addressInfo,
        timestamp: new Date().toISOString(),
        source: 'google_geolocation',
        provider: 'Google Geolocation API'
      };
    }
    
    throw new Error('No location data from Google Geolocation API');
  } catch (error) {
    console.warn('Google Geolocation API failed:', error);
    return null;
  }
};

// Collect WiFi access points for Google Geolocation (browser limitations apply)
const getWiFiAccessPoints = async () => {
  // Note: Modern browsers limit WiFi scanning for privacy
  // This is a placeholder for when the API is available
  try {
    if ('navigator' in window && 'wifi' in navigator) {
      // Future WiFi API (not yet widely supported)
      return [];
    }
    return [];
  } catch (error) {
    return [];
  }
};

// Collect cell tower information (browser limitations apply)
const getCellTowers = async () => {
  // Note: Modern browsers don't expose cell tower data for privacy
  // This is a placeholder for when the API is available
  try {
    if ('navigator' in window && 'connection' in navigator) {
      const connection = navigator.connection;
      if (connection && connection.type === 'cellular') {
        // Future cellular API (not yet widely supported)
        return [];
      }
    }
    return [];
  } catch (error) {
    return [];
  }
};

// Enhanced location with multiple Google services
export const getCurrentLocationWithGoogleServices = async () => {
  try {
    // Method 1: Try Google Geolocation API first
    const googleGeoLocation = await getCurrentLocationWithGoogleGeolocation();
    if (googleGeoLocation && googleGeoLocation.accuracy < 100) {
      return googleGeoLocation;
    }

    // Method 2: Enhanced GPS with Google Places nearby search
    const gpsLocation = await getCurrentLocationAccurate();
    
    // Enhance with Google Places API if available
    if (LOCATION_CONFIG.googleMaps.apiKey && window.google && window.google.maps) {
      try {
        const enhancedLocation = await enhanceLocationWithGooglePlaces(gpsLocation);
        return enhancedLocation;
      } catch (error) {
        console.warn('Google Places enhancement failed:', error);
      }
    }
    
    return gpsLocation;
  } catch (error) {
    console.error('All Google location services failed:', error);
    return getCurrentLocationAccurate();
  }
};

// Enhance location with Google Places API
const enhanceLocationWithGooglePlaces = async (baseLocation) => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      reject(new Error('Google Maps Places API not loaded'));
      return;
    }

    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    
    const request = {
      location: new window.google.maps.LatLng(
        baseLocation.coordinates.lat, 
        baseLocation.coordinates.lng
      ),
      radius: 50, // Very small radius for precise location
      type: ['establishment', 'point_of_interest']
    };
    
    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
        const nearestPlace = results[0];
        
        // Get detailed place information
        const detailRequest = {
          placeId: nearestPlace.place_id,
          fields: ['name', 'formatted_address', 'geometry', 'types', 'vicinity']
        };
        
        service.getDetails(detailRequest, (place, detailStatus) => {
          if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK) {
            resolve({
              ...baseLocation,
              coordinates: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              },
              address: {
                ...baseLocation.address,
                formatted: place.formatted_address || baseLocation.address.formatted,
                nearbyPlace: place.name,
                placeTypes: place.types,
                vicinity: place.vicinity,
                enhanced: true,
                provider: 'Google Places'
              },
              accuracy: Math.min(baseLocation.accuracy || 100, 20), // Enhanced accuracy
              source: 'google_places_enhanced'
            });
          } else {
            resolve(baseLocation);
          }
        });
      } else {
        resolve(baseLocation);
      }
    });
  });
};

// Get nearby places of interest
export const getNearbyPlaces = async (lat, lng, radius = 1000) => {
  try {
    // Use Overpass API to get nearby amenities
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"~"^(hospital|school|college|university|clinic|pharmacy|police|fire_station)$"](around:${radius},${lat},${lng});
        way["amenity"~"^(hospital|school|college|university|clinic|pharmacy|police|fire_station)$"](around:${radius},${lat},${lng});
        relation["amenity"~"^(hospital|school|college|university|clinic|pharmacy|police|fire_station)$"](around:${radius},${lat},${lng});
      );
      out center meta;
    `;
    
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query
    });
    
    if (!response.ok) throw new Error('Overpass API request failed');
    
    const data = await response.json();
    
    return data.elements.map(element => {
      const lat = element.lat || element.center?.lat;
      const lon = element.lon || element.center?.lon;
      
      return {
        id: element.id,
        name: element.tags?.name || `${element.tags?.amenity} facility`,
        type: element.tags?.amenity,
        coordinates: { lat, lng: lon },
        distance: calculateDistance(lat, lon, lat, lng)
      };
    }).filter(place => place.coordinates.lat && place.coordinates.lng);
    
  } catch (error) {
    console.warn('Failed to get nearby places:', error);
    return [];
  }
};

// Calculate distance between two points (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

// Validate coordinates
export const validateCoordinates = (lat, lng) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  
  if (isNaN(latitude) || isNaN(longitude)) {
    return { valid: false, error: 'Invalid coordinates format' };
  }
  
  if (latitude < -90 || latitude > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90' };
  }
  
  if (longitude < -180 || longitude > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180' };
  }
  
  return { valid: true, lat: latitude, lng: longitude };
};

// Format address for display with improved English formatting
export const formatAddress = (addressComponents) => {
  if (!addressComponents) return '';
  
  const parts = [];
  
  // Building number and street
  if (addressComponents.house_number && addressComponents.road) {
    parts.push(`${addressComponents.house_number} ${addressComponents.road}`);
  } else if (addressComponents.road) {
    parts.push(addressComponents.road);
  }
  
  // Area/Neighbourhood (avoid duplicates)
  if (addressComponents.neighbourhood && 
      addressComponents.neighbourhood !== addressComponents.city &&
      addressComponents.neighbourhood !== addressComponents.suburb) {
    parts.push(addressComponents.neighbourhood);
  } else if (addressComponents.suburb && 
             addressComponents.suburb !== addressComponents.city) {
    parts.push(addressComponents.suburb);
  }
  
  // City
  if (addressComponents.city) {
    parts.push(addressComponents.city);
  }
  
  // State with postcode
  if (addressComponents.state) {
    const stateText = addressComponents.postcode ? 
      `${addressComponents.state} ${addressComponents.postcode}` : 
      addressComponents.state;
    parts.push(stateText);
  } else if (addressComponents.postcode) {
    parts.push(addressComponents.postcode);
  }
  
  return parts.join(', ');
};

// Get ultra-detailed location with maximum accuracy and comprehensive address data
export const getUltraDetailedLocation = async (forceRefresh = false) => {
  try {
    console.log('Getting ultra-detailed location with maximum precision...');
    
    // Step 1: Get multiple GPS readings for best accuracy
    const gpsReadings = [];
    const maxReadings = 3;
    
    for (let i = 0; i < maxReadings; i++) {
      try {
        const reading = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude,
                altitudeAccuracy: position.coords.altitudeAccuracy,
                heading: position.coords.heading,
                speed: position.coords.speed,
                timestamp: position.timestamp
              });
            },
            reject,
            {
              enableHighAccuracy: true,
              timeout: 15000 + (i * 5000), // Increasing timeout for better accuracy
              maximumAge: 0 // Always fresh
            }
          );
        });
        
        gpsReadings.push(reading);
        console.log(`GPS reading ${i + 1}: ±${reading.accuracy}m accuracy`);
        
        // If we get very high accuracy, we can stop early
        if (reading.accuracy < 5) {
          console.log('Ultra-high accuracy achieved, stopping early');
          break;
        }
        
        // Wait between readings for GPS to stabilize
        if (i < maxReadings - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        console.warn(`GPS reading ${i + 1} failed:`, error);
      }
    }
    
    if (gpsReadings.length === 0) {
      throw new Error('Could not get any GPS readings');
    }
    
    // Find the most accurate reading
    const bestReading = gpsReadings.reduce((best, current) => 
      current.accuracy < best.accuracy ? current : best
    );
    
    console.log(`Best GPS accuracy: ±${bestReading.accuracy}m from ${gpsReadings.length} readings`);
    
    // Step 2: Get comprehensive address data from ALL available sources
    const addressSources = [];
    let detailedAddress = null;
    let bestAccuracyAddress = null;
    let highestConfidence = 0;
    
    // Define all available providers with their priority and expected accuracy
    const addressProviders = [
      {
        name: 'Google Maps',
        priority: 1,
        expectedAccuracy: 'very_high',
        fn: async () => {
          if (LOCATION_CONFIG.googleMaps.apiKey && LOCATION_CONFIG.googleMaps.apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY') {
            return await reverseGeocodeGoogle(bestReading.lat, bestReading.lng);
          }
          throw new Error('API key not available');
        }
      },
      {
        name: 'Geoapify',
        priority: 2,
        expectedAccuracy: 'high',
        fn: async () => {
          if (LOCATION_CONFIG.geoapify.apiKey && LOCATION_CONFIG.geoapify.apiKey !== 'YOUR_GEOAPIFY_API_KEY') {
            return await reverseGeocodeGeoapify(bestReading.lat, bestReading.lng);
          }
          throw new Error('API key not available');
        }
      },
      {
        name: 'HERE Maps',
        priority: 3,
        expectedAccuracy: 'very_high',
        fn: async () => {
          if (LOCATION_CONFIG.here.apiKey && LOCATION_CONFIG.here.apiKey !== 'YOUR_HERE_API_KEY') {
            return await reverseGeocodeHere(bestReading.lat, bestReading.lng);
          }
          throw new Error('API key not available');
        }
      },
      {
        name: 'MapBox',
        priority: 4,
        expectedAccuracy: 'high',
        fn: async () => {
          if (LOCATION_CONFIG.mapbox.apiKey && LOCATION_CONFIG.mapbox.apiKey !== 'YOUR_MAPBOX_API_KEY') {
            return await reverseGeocodeMapbox(bestReading.lat, bestReading.lng);
          }
          throw new Error('API key not available');
        }
      },
      {
        name: 'Positionstack',
        priority: 5,
        expectedAccuracy: 'medium',
        fn: async () => {
          if (LOCATION_CONFIG.positionstack.apiKey && LOCATION_CONFIG.positionstack.apiKey !== 'YOUR_POSITIONSTACK_API_KEY') {
            return await reverseGeocodePositionstack(bestReading.lat, bestReading.lng);
          }
          throw new Error('API key not available');
        }
      },
      {
        name: 'Nominatim',
        priority: 6,
        expectedAccuracy: 'medium',
        fn: async () => {
          const nominatimResult = await fetch(
            `${LOCATION_CONFIG.nominatim.baseUrl}/reverse?format=json&lat=${bestReading.lat}&lon=${bestReading.lng}&zoom=18&addressdetails=1&extratags=1&namedetails=1&accept-language=en`,
            {
              headers: {
                'User-Agent': 'Kartavya-CivicTech-App/1.0',
                'Accept-Language': 'en-US,en;q=0.9'
              }
            }
          );
          
          if (nominatimResult.ok) {
            const nominatimData = await nominatimResult.json();
            return await processNominatimDetailedResponse(nominatimData);
          }
          throw new Error('Nominatim request failed');
        }
      },
      {
        name: 'Photon',
        priority: 7,
        expectedAccuracy: 'medium',
        fn: async () => {
          const photonResult = await fetch(
            `${LOCATION_CONFIG.photon.baseUrl}/api?lat=${bestReading.lat}&lon=${bestReading.lng}&limit=1`
          );
          
          if (photonResult.ok) {
            const photonData = await photonResult.json();
            if (photonData.features && photonData.features.length > 0) {
              return await processPhotonDetailedResponse(photonData.features[0]);
            }
          }
          throw new Error('Photon request failed');
        }
      }
    ];
    
    // Try all providers simultaneously for maximum data collection
    const providerPromises = addressProviders.map(async (provider) => {
      try {
        console.log(`🔍 Querying ${provider.name}...`);
        const result = await provider.fn();
        console.log(`✅ ${provider.name} succeeded`);
        
        // Calculate confidence score
        let confidence = 0.5; // base confidence
        
        // Adjust confidence based on provider reputation
        if (provider.expectedAccuracy === 'very_high') confidence += 0.3;
        else if (provider.expectedAccuracy === 'high') confidence += 0.2;
        else if (provider.expectedAccuracy === 'medium') confidence += 0.1;
        
        // Adjust confidence based on data completeness
        if (result.components?.road) confidence += 0.1;
        if (result.components?.house_number) confidence += 0.1;
        if (result.components?.postcode) confidence += 0.05;
        if (result.components?.city) confidence += 0.05;
        
        return {
          provider: provider.name,
          priority: provider.priority,
          confidence: Math.min(confidence, 1.0),
          data: result,
          success: true
        };
      } catch (error) {
        console.warn(`❌ ${provider.name} failed:`, error.message);
        return {
          provider: provider.name,
          priority: provider.priority,
          confidence: 0,
          data: null,
          success: false,
          error: error.message
        };
      }
    });
    
    // Wait for all providers to complete (with timeout)
    const providerResults = await Promise.allSettled(providerPromises);
    
    // Process successful results
    providerResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.success) {
        const providerResult = result.value;
        addressSources.push(providerResult);
        
        // Select the best address based on confidence and priority
        if (providerResult.confidence > highestConfidence || 
            (providerResult.confidence === highestConfidence && providerResult.priority < (bestAccuracyAddress?.priority || Infinity))) {
          highestConfidence = providerResult.confidence;
          bestAccuracyAddress = providerResult;
          detailedAddress = providerResult.data;
        }
      }
    });
    
    // If we have multiple sources, create a merged comprehensive address
    if (addressSources.length > 1) {
      console.log(`🔄 Merging data from ${addressSources.length} sources...`);
      detailedAddress = createComprehensiveAddress(addressSources, bestAccuracyAddress);
    }
    
    console.log(`📍 Address resolution complete. Best source: ${bestAccuracyAddress?.provider || 'None'} (confidence: ${(highestConfidence * 100).toFixed(1)}%)`);
    
    // Enhance with cross-provider validation
    if (addressSources.length >= 2) {
      detailedAddress = await validateAndEnhanceAddress(detailedAddress, addressSources);
    }
    
    // Step 3: Get nearby landmarks and points of interest
    const nearbyPOIs = await getNearbyPointsOfInterest(bestReading.lat, bestReading.lng);
    
    // Step 4: Create comprehensive location object
    const comprehensiveLocation = {
      coordinates: {
        lat: bestReading.lat,
        lng: bestReading.lng
      },
      accuracy: bestReading.accuracy,
      altitude: bestReading.altitude,
      altitudeAccuracy: bestReading.altitudeAccuracy,
      heading: bestReading.heading,
      speed: bestReading.speed,
      address: detailedAddress || {
        formatted: `${bestReading.lat.toFixed(8)}, ${bestReading.lng.toFixed(8)}`,
        components: {},
        provider: 'GPS Coordinates'
      },
      nearbyPOIs: nearbyPOIs,
      addressSources: addressSources,
      gpsReadings: gpsReadings,
      timestamp: new Date().toISOString(),
      source: 'ultra_detailed',
      enhanced: true,
      precision: 'ultra_high'
    };
    
    console.log('Ultra-detailed location complete:', comprehensiveLocation);
    return comprehensiveLocation;
    
  } catch (error) {
    console.error('Ultra-detailed location failed:', error);
    throw error;
  }
};

// Process Nominatim response with maximum detail extraction
const processNominatimDetailedResponse = async (data) => {
  if (!data || !data.display_name) {
    throw new Error('Invalid Nominatim response');
  }
  
  const address = data.address || {};
  
  // Extract all possible address components
  const components = {
    // Building details
    house_number: address.house_number,
    building: address.building,
    
    // Street details
    road: address.road,
    pedestrian: address.pedestrian,
    footway: address.footway,
    
    // Area details
    neighbourhood: address.neighbourhood,
    suburb: address.suburb,
    quarter: address.quarter,
    district: address.district,
    borough: address.borough,
    
    // City details
    city: address.city,
    town: address.town,
    village: address.village,
    municipality: address.municipality,
    
    // Administrative areas
    county: address.county,
    state_district: address.state_district,
    state: address.state,
    region: address.region,
    
    // Postal
    postcode: address.postcode,
    
    // Country
    country: address.country,
    country_code: address.country_code,
    
    // Coordinates
    latitude: parseFloat(data.lat),
    longitude: parseFloat(data.lon),
    
    // Additional details
    place_id: data.place_id,
    osm_type: data.osm_type,
    osm_id: data.osm_id,
    licence: data.licence
  };
  
  // Create detailed formatted address
  const addressParts = [];
  
  // Building and street
  if (components.house_number && components.road) {
    addressParts.push(`${components.house_number} ${components.road}`);
  } else if (components.building && components.road) {
    addressParts.push(`${components.building}, ${components.road}`);
  } else if (components.road) {
    addressParts.push(components.road);
  }
  
  // Area/Neighbourhood
  const area = components.neighbourhood || components.suburb || components.quarter || components.district;
  if (area && area !== components.city) {
    addressParts.push(area);
  }
  
  // City
  const city = components.city || components.town || components.village || components.municipality;
  if (city) {
    addressParts.push(city);
  }
  
  // State and postal
  if (components.state) {
    const stateText = components.postcode ? 
      `${components.state} ${components.postcode}` : 
      components.state;
    addressParts.push(stateText);
  }
  
  // Country (if not India)
  if (components.country && components.country.toLowerCase() !== 'india') {
    addressParts.push(components.country);
  }
  
  return {
    formatted: addressParts.join(', '),
    components: components,
    provider: 'OpenStreetMap Nominatim',
    confidence: 'high',
    originalResponse: data.display_name
  };
};

// Process Photon response with detail extraction
const processPhotonDetailedResponse = async (feature) => {
  const props = feature.properties;
  const coords = feature.geometry.coordinates;
  
  const components = {
    name: props.name,
    street: props.street,
    housenumber: props.housenumber,
    city: props.city,
    district: props.district,
    county: props.county,
    state: props.state,
    country: props.country,
    postcode: props.postcode,
    osm_type: props.osm_type,
    osm_id: props.osm_id,
    latitude: coords[1],
    longitude: coords[0]
  };
  
  const addressParts = [];
  
  if (components.housenumber && components.street) {
    addressParts.push(`${components.housenumber} ${components.street}`);
  } else if (components.name && components.street) {
    addressParts.push(`${components.name}, ${components.street}`);
  } else if (components.street) {
    addressParts.push(components.street);
  } else if (components.name) {
    addressParts.push(components.name);
  }
  
  if (components.district && components.district !== components.city) {
    addressParts.push(components.district);
  }
  
  if (components.city) {
    addressParts.push(components.city);
  }
  
  if (components.state) {
    const stateText = components.postcode ? 
      `${components.state} ${components.postcode}` : 
      components.state;
    addressParts.push(stateText);
  }
  
  return {
    formatted: addressParts.join(', '),
    components: components,
    provider: 'Photon',
    confidence: 'medium'
  };
};

// Create comprehensive address from multiple sources
const createComprehensiveAddress = (addressSources, bestSource) => {
  const comprehensive = { ...bestSource.data };
  const allComponents = {};
  const sourceMap = {};
  
  // Collect all components from all sources
  addressSources.forEach(source => {
    if (source.success && source.data?.components) {
      Object.entries(source.data.components).forEach(([key, value]) => {
        if (value && value.trim && value.trim() !== '') {
          if (!allComponents[key]) {
            allComponents[key] = [];
            sourceMap[key] = [];
          }
          if (!allComponents[key].includes(value)) {
            allComponents[key].push(value);
            sourceMap[key].push(source.provider);
          }
        }
      });
    }
  });
  
  // Create consensus components (use most common value or highest priority source)
  const consensusComponents = {};
  Object.entries(allComponents).forEach(([key, values]) => {
    if (values.length === 1) {
      consensusComponents[key] = values[0];
    } else {
      // Use value from highest priority source
      const sources = sourceMap[key];
      let bestValue = values[0];
      let bestPriority = Infinity;
      
      values.forEach((value, index) => {
        const source = addressSources.find(s => s.provider === sources[index]);
        if (source && source.priority < bestPriority) {
          bestPriority = source.priority;
          bestValue = value;
        }
      });
      
      consensusComponents[key] = bestValue;
    }
  });
  
  // Build enhanced formatted address
  const addressParts = [];
  
  if (consensusComponents.house_number && consensusComponents.road) {
    addressParts.push(`${consensusComponents.house_number} ${consensusComponents.road}`);
  } else if (consensusComponents.road) {
    addressParts.push(consensusComponents.road);
  }
  
  if (consensusComponents.neighbourhood && consensusComponents.neighbourhood !== consensusComponents.city) {
    addressParts.push(consensusComponents.neighbourhood);
  }
  
  if (consensusComponents.city) {
    addressParts.push(consensusComponents.city);
  }
  
  if (consensusComponents.state) {
    const stateText = consensusComponents.postcode ? 
      `${consensusComponents.state} ${consensusComponents.postcode}` : 
      consensusComponents.state;
    addressParts.push(stateText);
  }
  
  return {
    ...comprehensive,
    formatted: addressParts.join(', ') || comprehensive.formatted,
    components: consensusComponents,
    provider: `Multi-Source (${addressSources.filter(s => s.success).length} providers)`,
    confidence: 'very_high',
    sources: addressSources.filter(s => s.success).map(s => s.provider),
    consensus: true
  };
};

// Validate and enhance address using cross-provider verification
const validateAndEnhanceAddress = async (address, sources) => {
  const validationResults = {
    streetVerified: false,
    cityVerified: false,
    stateVerified: false,
    postcodeVerified: false,
    coordinatesVerified: false
  };
  
  const successfulSources = sources.filter(s => s.success);
  
  if (successfulSources.length < 2) {
    return address; // Need at least 2 sources for validation
  }
  
  // Cross-validate key components
  const componentCounts = {};
  
  successfulSources.forEach(source => {
    const components = source.data?.components || {};
    
    ['road', 'city', 'state', 'postcode'].forEach(key => {
      if (components[key]) {
        if (!componentCounts[key]) componentCounts[key] = {};
        const value = components[key].toLowerCase().trim();
        componentCounts[key][value] = (componentCounts[key][value] || 0) + 1;
      }
    });
  });
  
  // Determine validation status
  Object.entries(componentCounts).forEach(([component, counts]) => {
    const values = Object.keys(counts);
    const maxCount = Math.max(...Object.values(counts));
    const totalSources = successfulSources.length;
    
    // Consider verified if majority of sources agree
    if (maxCount >= Math.ceil(totalSources / 2)) {
      switch (component) {
        case 'road': validationResults.streetVerified = true; break;
        case 'city': validationResults.cityVerified = true; break;
        case 'state': validationResults.stateVerified = true; break;
        case 'postcode': validationResults.postcodeVerified = true; break;
      }
    }
  });
  
  // Coordinate validation (check if coordinates are consistent)
  const coordinates = successfulSources.map(s => s.data?.components).filter(c => c?.latitude && c?.longitude);
  if (coordinates.length >= 2) {
    const avgLat = coordinates.reduce((sum, c) => sum + c.latitude, 0) / coordinates.length;
    const avgLng = coordinates.reduce((sum, c) => sum + c.longitude, 0) / coordinates.length;
    
    // Check if all coordinates are within reasonable distance (100m)
    const allWithinRange = coordinates.every(c => {
      const distance = calculateDistance(c.latitude, c.longitude, avgLat, avgLng);
      return distance <= 100;
    });
    
    validationResults.coordinatesVerified = allWithinRange;
  }
  
  // Calculate overall confidence based on validation
  const verifiedCount = Object.values(validationResults).filter(v => v).length;
  const totalChecks = Object.keys(validationResults).length;
  const validationConfidence = verifiedCount / totalChecks;
  
  return {
    ...address,
    validation: validationResults,
    validationConfidence: validationConfidence,
    verified: validationConfidence >= 0.6, // 60% of checks passed
    crossValidated: true
  };
};

// Merge address data from multiple sources (legacy function, kept for compatibility)
const mergeAddressData = (primary, secondary) => {
  const merged = { ...primary };
  
  // Fill in missing components from secondary source
  Object.keys(secondary.components || {}).forEach(key => {
    if (!merged.components[key] && secondary.components[key]) {
      merged.components[key] = secondary.components[key];
    }
  });
  
  // Use more detailed formatted address if available
  if (secondary.formatted && secondary.formatted.length > merged.formatted.length) {
    merged.formatted = secondary.formatted;
  }
  
  merged.sources = [primary.provider, secondary.provider];
  
  return merged;
};

// Get nearby points of interest for context
const getNearbyPointsOfInterest = async (lat, lng, radius = 200) => {
  try {
    const query = `
      [out:json][timeout:15];
      (
        node["amenity"~"^(hospital|school|college|university|clinic|pharmacy|police|fire_station|bank|atm|restaurant|cafe|fuel|bus_station|railway_station)$"](around:${radius},${lat},${lng});
        node["shop"~"^(supermarket|convenience|mall)$"](around:${radius},${lat},${lng});
        node["tourism"~"^(hotel|attraction)$"](around:${radius},${lat},${lng});
        node["highway"~"^(bus_stop)$"](around:${radius},${lat},${lng});
      );
      out center meta;
    `;
    
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
    
    if (!response.ok) throw new Error('Overpass API request failed');
    
    const data = await response.json();
    
    return data.elements.map(element => {
      const distance = calculateDistance(lat, lng, element.lat, element.lon);
      
      return {
        id: element.id,
        name: element.tags?.name || `${element.tags?.amenity || element.tags?.shop || element.tags?.tourism} facility`,
        type: element.tags?.amenity || element.tags?.shop || element.tags?.tourism || element.tags?.highway,
        coordinates: { lat: element.lat, lng: element.lon },
        distance: Math.round(distance),
        tags: element.tags
      };
    })
    .filter(poi => poi.coordinates.lat && poi.coordinates.lng)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 10); // Top 10 nearest POIs
    
  } catch (error) {
    console.warn('Failed to get nearby POIs:', error);
    return [];
  }
};

// Get premium location with all available providers
export const getPremiumLocation = async (forceRefresh = false) => {
  try {
    console.log('🚀 Starting premium location detection with all providers...');
    
    // Step 1: Get high-accuracy GPS coordinates
    const gpsLocation = await getCurrentLocationAccurate(forceRefresh);
    console.log(`📍 GPS Location: ${gpsLocation.coordinates.lat.toFixed(8)}, ${gpsLocation.coordinates.lng.toFixed(8)} (±${gpsLocation.accuracy}m)`);
    
    // Step 2: Use premium multi-provider reverse geocoding
    const premiumAddress = await reverseGeocode(gpsLocation.coordinates.lat, gpsLocation.coordinates.lng);
    
    // Step 3: Get nearby POIs for context
    const nearbyPOIs = await getNearbyPointsOfInterest(gpsLocation.coordinates.lat, gpsLocation.coordinates.lng);
    
    return {
      ...gpsLocation,
      address: premiumAddress,
      nearbyPOIs: nearbyPOIs,
      enhanced: true,
      premium: true,
      source: 'premium_multi_provider'
    };
    
  } catch (error) {
    console.error('Premium location failed, falling back to enhanced:', error);
    return getEnhancedLocation(forceRefresh);
  }
};

// Get enhanced location with better accuracy and English formatting (fallback method)
export const getEnhancedLocation = async (forceRefresh = false) => {
  try {
    console.log('Getting enhanced location with English formatting...');
    
    // Get high-accuracy GPS coordinates
    const gpsLocation = await getCurrentLocationAccurate(forceRefresh);
    
    // Try multiple reverse geocoding services for best English result
    let bestAddress = null;
    let addressSources = [];
    
    // Try Nominatim with English preference
    try {
      const nominatimAddress = await reverseGeocodeNominatim(
        gpsLocation.coordinates.lat, 
        gpsLocation.coordinates.lng
      );
      addressSources.push(nominatimAddress);
      bestAddress = nominatimAddress;
    } catch (error) {
      console.warn('Nominatim failed:', error);
    }
    
    // Try Photon as backup
    try {
      const photonAddress = await reverseGeocodePhoton(
        gpsLocation.coordinates.lat, 
        gpsLocation.coordinates.lng
      );
      addressSources.push(photonAddress);
      
      // Use Photon if Nominatim failed or if Photon has better data
      if (!bestAddress || (photonAddress.components?.road && !bestAddress.components?.road)) {
        bestAddress = photonAddress;
      }
    } catch (error) {
      console.warn('Photon failed:', error);
    }
    
    // Fallback to coordinates if all services fail
    if (!bestAddress) {
      bestAddress = {
        formatted: `${gpsLocation.coordinates.lat.toFixed(6)}, ${gpsLocation.coordinates.lng.toFixed(6)}`,
        components: {
          latitude: gpsLocation.coordinates.lat,
          longitude: gpsLocation.coordinates.lng
        },
        provider: 'Coordinates'
      };
    }
    
    return {
      ...gpsLocation,
      address: bestAddress,
      addressSources: addressSources, // For debugging
      enhanced: true
    };
    
  } catch (error) {
    console.error('Enhanced location failed:', error);
    throw error;
  }
};

// Clear any cached location data and force fresh reading
export const clearLocationCache = () => {
  // Clear any browser location cache
  if ('geolocation' in navigator && 'clearWatch' in navigator.geolocation) {
    // Clear any active watches
    navigator.geolocation.clearWatch();
  }
  
  // Clear localStorage cache if any
  try {
    localStorage.removeItem('kartavya_last_location');
    localStorage.removeItem('kartavya_location_timestamp');
  } catch (error) {
    console.warn('Could not clear location cache:', error);
  }
  
  console.log('Location cache cleared');
};

// Get ultra-precise location with multiple methods
export const getUltraPreciseLocation = async () => {
  // Clear any cached data first
  clearLocationCache();
  
  const results = [];
  const maxAttempts = 5;
  
  console.log('Starting ultra-precise location detection...');
  
  // Method 1: Multiple GPS readings with increasing timeout
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const timeout = 10000 + (i * 5000); // Increasing timeout for better accuracy
      const location = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              coordinates: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              },
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
              attempt: i + 1
            });
          },
          reject,
          {
            enableHighAccuracy: true,
            timeout: timeout,
            maximumAge: 0 // Always fresh
          }
        );
      });
      
      results.push(location);
      console.log(`GPS attempt ${i + 1}: ±${location.accuracy}m accuracy`);
      
      // If we get very high accuracy, we can stop early
      if (location.accuracy < 10) {
        console.log('Ultra-high accuracy achieved, stopping early');
        break;
      }
      
      // Wait between attempts for GPS to stabilize
      if (i < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
    } catch (error) {
      console.warn(`GPS attempt ${i + 1} failed:`, error);
    }
  }
  
  if (results.length === 0) {
    throw new Error('Could not get any GPS readings');
  }
  
  // Find the most accurate reading
  const bestResult = results.reduce((best, current) => 
    current.accuracy < best.accuracy ? current : best
  );
  
  console.log(`Best accuracy: ±${bestResult.accuracy}m from ${results.length} attempts`);
  
  // Get detailed address for the best location
  const addressInfo = await reverseGeocode(bestResult.coordinates.lat, bestResult.coordinates.lng);
  
  return {
    coordinates: bestResult.coordinates,
    accuracy: bestResult.accuracy,
    address: addressInfo,
    timestamp: new Date().toISOString(),
    source: 'ultra_precise',
    attempts: results.length,
    allReadings: results
  };
};