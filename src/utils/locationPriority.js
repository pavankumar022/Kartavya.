// Location-based priority system for civic issues

// Critical infrastructure types with priority weights
const CRITICAL_INFRASTRUCTURE = {
  hospitals: {
    weight: 10,
    radius: 2000, // 2km
    keywords: ['hospital', 'medical', 'clinic', 'emergency', 'health center', 'dispensary']
  },
  schools: {
    weight: 9,
    radius: 1500, // 1.5km
    keywords: ['school', 'college', 'university', 'education', 'academy', 'institute']
  },
  emergencyServices: {
    weight: 10,
    radius: 2500, // 2.5km
    keywords: ['police', 'fire station', 'ambulance', 'emergency']
  },
  publicTransport: {
    weight: 7,
    radius: 1000, // 1km
    keywords: ['bus stop', 'metro', 'railway', 'station', 'transport hub']
  },
  markets: {
    weight: 6,
    radius: 800, // 800m
    keywords: ['market', 'mall', 'shopping', 'bazaar', 'commercial']
  },
  religiousPlaces: {
    weight: 5,
    radius: 1000, // 1km
    keywords: ['temple', 'mosque', 'church', 'gurudwara', 'religious']
  }
};

// Population density categories
const POPULATION_DENSITY = {
  veryHigh: { threshold: 10000, multiplier: 2.0 }, // >10k people per km²
  high: { threshold: 5000, multiplier: 1.7 },     // 5k-10k people per km²
  medium: { threshold: 2000, multiplier: 1.3 },   // 2k-5k people per km²
  low: { threshold: 500, multiplier: 1.0 },       // 500-2k people per km²
  veryLow: { threshold: 0, multiplier: 0.8 }      // <500 people per km²
};

// Calculate distance between two coordinates (Haversine formula)
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

  return R * c; // Distance in meters
};

// Enhanced function to get nearby infrastructure with more comprehensive data
const getNearbyInfrastructure = async (lat, lng, radius = 5000) => {
  // Enhanced mock data with more hospitals, schools, and colleges within 5km
  // In production, integrate with Google Places API or government facility databases
  const mockInfrastructure = [
    // Hospitals within 5km
    { type: 'hospitals', name: 'City General Hospital', lat: lat + 0.01, lng: lng + 0.01 },
    { type: 'hospitals', name: 'Emergency Medical Center', lat: lat - 0.02, lng: lng + 0.015 },
    { type: 'hospitals', name: 'District Hospital', lat: lat + 0.025, lng: lng - 0.02 },
    { type: 'hospitals', name: 'Community Health Center', lat: lat - 0.015, lng: lng - 0.01 },
    
    // Schools within 5km
    { type: 'schools', name: 'Government Primary School', lat: lat - 0.005, lng: lng + 0.008 },
    { type: 'schools', name: 'Municipal High School', lat: lat + 0.012, lng: lng - 0.008 },
    { type: 'schools', name: 'Public Secondary School', lat: lat - 0.018, lng: lng + 0.012 },
    { type: 'schools', name: 'Government College', lat: lat + 0.02, lng: lng + 0.018 },
    { type: 'schools', name: 'Technical Institute', lat: lat - 0.025, lng: lng - 0.015 },
    { type: 'schools', name: 'University Campus', lat: lat + 0.03, lng: lng - 0.025 },
    
    // Emergency Services
    { type: 'emergencyServices', name: 'Police Station', lat: lat + 0.008, lng: lng - 0.005 },
    { type: 'emergencyServices', name: 'Fire Station', lat: lat - 0.012, lng: lng + 0.01 },
    
    // Other infrastructure
    { type: 'publicTransport', name: 'Bus Terminal', lat: lat + 0.003, lng: lng - 0.002 },
    { type: 'publicTransport', name: 'Metro Station', lat: lat - 0.01, lng: lng + 0.005 },
    { type: 'markets', name: 'Central Market', lat: lat - 0.008, lng: lng - 0.005 },
    { type: 'religiousPlaces', name: 'Community Temple', lat: lat + 0.006, lng: lng + 0.004 }
  ];

  // Calculate actual distances and filter by radius
  return mockInfrastructure
    .map(place => ({
      ...place,
      distance: calculateDistance(lat, lng, place.lat, place.lng)
    }))
    .filter(place => place.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
};

// Estimate population density based on location (mock implementation)
const estimatePopulationDensity = async (lat, lng) => {
  // Mock implementation - in production, use census data or demographic APIs
  // This could integrate with government census data or commercial APIs
  
  // Simple heuristic based on coordinates (very basic)
  const urbanCenters = [
    { lat: 28.6139, lng: 77.2090, density: 12000 }, // Delhi
    { lat: 19.0760, lng: 72.8777, density: 15000 }, // Mumbai
    { lat: 12.9716, lng: 77.5946, density: 8000 },  // Bangalore
    // Add more cities as needed
  ];

  let estimatedDensity = 1000; // Default rural density
  
  // Find nearest urban center and estimate density
  for (const center of urbanCenters) {
    const distance = calculateDistance(lat, lng, center.lat, center.lng);
    if (distance < 50000) { // Within 50km of urban center
      const proximityFactor = Math.max(0.1, 1 - (distance / 50000));
      estimatedDensity = Math.max(estimatedDensity, center.density * proximityFactor);
    }
  }

  return Math.round(estimatedDensity);
};

// Get population density category
const getPopulationDensityCategory = (density) => {
  if (density > POPULATION_DENSITY.veryHigh.threshold) return 'veryHigh';
  if (density > POPULATION_DENSITY.high.threshold) return 'high';
  if (density > POPULATION_DENSITY.medium.threshold) return 'medium';
  if (density > POPULATION_DENSITY.low.threshold) return 'low';
  return 'veryLow';
};

// Calculate location-based priority score
export const calculateLocationPriority = async (coordinates) => {
  if (!coordinates || !coordinates.lat || !coordinates.lng) {
    return {
      score: 1.0,
      factors: [],
      analysis: 'No location data available'
    };
  }

  const { lat, lng } = coordinates;
  const factors = [];
  let totalScore = 1.0;

  try {
    // Get nearby critical infrastructure
    const nearbyInfrastructure = await getNearbyInfrastructure(lat, lng);
    
    // Calculate infrastructure proximity score
    let infrastructureScore = 1.0;
    const criticalNearby = [];

    for (const place of nearbyInfrastructure) {
      const infraType = CRITICAL_INFRASTRUCTURE[place.type];
      if (infraType && place.distance <= infraType.radius) {
        const proximityFactor = 1 - (place.distance / infraType.radius);
        const weightedScore = 1 + (infraType.weight * proximityFactor * 0.1);
        infrastructureScore = Math.max(infrastructureScore, weightedScore);
        
        criticalNearby.push({
          type: place.type,
          name: place.name,
          distance: place.distance,
          impact: weightedScore
        });
      }
    }

    // Get population density
    const populationDensity = await estimatePopulationDensity(lat, lng);
    const densityCategory = getPopulationDensityCategory(populationDensity);
    const densityMultiplier = POPULATION_DENSITY[densityCategory].multiplier;

    // Calculate final score
    totalScore = infrastructureScore * densityMultiplier;

    // Add analysis factors
    if (criticalNearby.length > 0) {
      factors.push({
        type: 'critical_infrastructure',
        impact: infrastructureScore,
        details: criticalNearby
      });
    }

    factors.push({
      type: 'population_density',
      impact: densityMultiplier,
      details: {
        density: populationDensity,
        category: densityCategory,
        description: getDensityDescription(densityCategory)
      }
    });

    return {
      score: Math.min(totalScore, 3.0), // Cap at 3x multiplier
      factors,
      analysis: generateLocationAnalysis(criticalNearby, densityCategory, populationDensity)
    };

  } catch (error) {
    console.error('Error calculating location priority:', error);
    return {
      score: 1.0,
      factors: [],
      analysis: 'Location analysis failed - using default priority'
    };
  }
};

// Generate human-readable location analysis
const generateLocationAnalysis = (criticalNearby, densityCategory, populationDensity) => {
  let analysis = '';

  if (criticalNearby.length > 0) {
    const topCritical = criticalNearby
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 3);
    
    analysis += `🏥 Critical infrastructure nearby: `;
    analysis += topCritical.map(place => 
      `${place.name} (${Math.round(place.distance)}m)`
    ).join(', ');
    analysis += '. ';
  }

  analysis += `👥 Population density: ${getDensityDescription(densityCategory)} `;
  analysis += `(~${populationDensity.toLocaleString()} people/km²). `;

  if (criticalNearby.length > 0) {
    analysis += `High priority due to proximity to essential services.`;
  } else if (densityCategory === 'veryHigh' || densityCategory === 'high') {
    analysis += `High priority due to dense population.`;
  } else {
    analysis += `Standard priority for this area.`;
  }

  return analysis;
};

// Get density description
const getDensityDescription = (category) => {
  const descriptions = {
    veryHigh: 'Very High (Urban Core)',
    high: 'High (Dense Urban)',
    medium: 'Medium (Suburban)',
    low: 'Low (Rural/Outskirts)',
    veryLow: 'Very Low (Remote)'
  };
  return descriptions[category] || 'Unknown';
};

// Check if location is near critical infrastructure
export const isNearCriticalInfrastructure = async (coordinates, infrastructureType = null) => {
  if (!coordinates) return false;

  const nearbyInfrastructure = await getNearbyInfrastructure(
    coordinates.lat, 
    coordinates.lng, 
    2000 // 2km radius
  );

  if (infrastructureType) {
    return nearbyInfrastructure.some(place => place.type === infrastructureType);
  }

  return nearbyInfrastructure.length > 0;
};

// Get area risk assessment
export const getAreaRiskAssessment = async (coordinates) => {
  const locationPriority = await calculateLocationPriority(coordinates);
  
  let riskLevel = 'low';
  if (locationPriority.score >= 2.5) riskLevel = 'critical';
  else if (locationPriority.score >= 2.0) riskLevel = 'high';
  else if (locationPriority.score >= 1.5) riskLevel = 'medium';

  return {
    riskLevel,
    score: locationPriority.score,
    factors: locationPriority.factors,
    recommendations: generateRecommendations(riskLevel, locationPriority.factors)
  };
};

// Generate recommendations based on risk assessment
const generateRecommendations = (riskLevel, factors) => {
  const recommendations = [];

  if (riskLevel === 'critical' || riskLevel === 'high') {
    recommendations.push('Immediate government attention required');
    recommendations.push('Fast-track resolution process');
    recommendations.push('Regular monitoring and updates');
  }

  const hasCriticalInfra = factors.some(f => f.type === 'critical_infrastructure');
  if (hasCriticalInfra) {
    recommendations.push('Coordinate with facility management');
    recommendations.push('Consider emergency service access');
  }

  const densityFactor = factors.find(f => f.type === 'population_density');
  if (densityFactor && (densityFactor.details.category === 'veryHigh' || densityFactor.details.category === 'high')) {
    recommendations.push('Public safety priority');
    recommendations.push('Community notification recommended');
  }

  return recommendations;
};