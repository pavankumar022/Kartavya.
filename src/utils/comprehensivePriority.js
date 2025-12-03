// Comprehensive priority system combining AI, location, social engagement, and government routing

import { analyzeImageForPriority, getTimeBasedPriority, adjustPriority } from './aiAnalysis';
import { calculateLocationPriority, isNearCriticalInfrastructure, getAreaRiskAssessment } from './locationPriority';
import { calculateEngagementScore, getCommunityImpactMultiplier, generateEngagementReport } from './socialEngagement';

// Priority levels with numeric values for calculation
const PRIORITY_VALUES = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
};

const VALUE_TO_PRIORITY = {
  1: 'low',
  2: 'medium', 
  3: 'high',
  4: 'critical'
};

// Government department routing based on category and location
const GOVERNMENT_DEPARTMENTS = {
  potholes: {
    primary: 'Public Works Department (PWD)',
    secondary: 'Municipal Corporation',
    emergency: 'Traffic Police (if blocking traffic)'
  },
  garbage: {
    primary: 'Sanitation Department',
    secondary: 'Municipal Corporation',
    emergency: 'Health Department (if health hazard)'
  },
  streetlights: {
    primary: 'Electrical Department',
    secondary: 'Municipal Corporation',
    emergency: 'Police (if safety concern)'
  },
  waterLeaks: {
    primary: 'Water Supply Department',
    secondary: 'Municipal Corporation',
    emergency: 'Fire Department (if major leak)'
  },
  trafficIssues: {
    primary: 'Traffic Police',
    secondary: 'Transport Department',
    emergency: 'Emergency Services'
  },
  publicSafety: {
    primary: 'Police Department',
    secondary: 'Municipal Corporation',
    emergency: 'Emergency Services'
  }
};

// Calculate comprehensive priority score
export const calculateComprehensivePriority = async (issue) => {
  const results = {
    aiAnalysis: null,
    locationAnalysis: null,
    socialAnalysis: null,
    finalPriority: 'medium',
    priorityScore: 2,
    governmentRouting: null,
    recommendations: [],
    detailedAnalysis: ''
  };

  try {
    // 1. AI Analysis (if image available)
    if (issue.image && issue.category) {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = issue.image;
      });

      results.aiAnalysis = await analyzeImageForPriority(img, issue.category);
      
      // Apply time-based adjustments
      const timeAdjustment = getTimeBasedPriority(issue.category);
      if (timeAdjustment.adjustment !== 'none') {
        results.aiAnalysis.finalPriority = adjustPriority(
          results.aiAnalysis.priority, 
          issue.category, 
          timeAdjustment
        );
        results.aiAnalysis.timeAdjustment = timeAdjustment;
      } else {
        results.aiAnalysis.finalPriority = results.aiAnalysis.priority;
      }
    }

    // 2. Location Analysis
    if (issue.coordinates) {
      results.locationAnalysis = await calculateLocationPriority(issue.coordinates);
    }

    // 3. Social Engagement Analysis
    if (issue.socialMetrics) {
      results.socialAnalysis = calculateEngagementScore(issue);
    }

    // 4. Calculate Final Priority with Tier System
    const priorityResult = await calculateFinalPriorityScore(
      results.aiAnalysis,
      results.locationAnalysis,
      results.socialAnalysis
    );

    results.priorityScore = priorityResult.score;
    results.priorityTier = priorityResult.tier;
    results.tierName = priorityResult.tierName;

    // Convert score to priority level
    results.finalPriority = VALUE_TO_PRIORITY[Math.round(Math.min(results.priorityScore, 4))];

    // 5. Government Department Routing
    results.governmentRouting = await determineGovernmentRouting(
      issue,
      results.finalPriority,
      results.locationAnalysis
    );

    // 6. Generate Recommendations
    results.recommendations = generateComprehensiveRecommendations(
      results.aiAnalysis,
      results.locationAnalysis,
      results.socialAnalysis,
      results.finalPriority
    );

    // 7. Generate Detailed Analysis
    results.detailedAnalysis = generateDetailedAnalysis(results);

    return results;

  } catch (error) {
    console.error('Error in comprehensive priority calculation:', error);
    return {
      ...results,
      finalPriority: 'medium',
      priorityScore: 2,
      detailedAnalysis: `Priority calculation failed: ${error.message}. Using default medium priority.`
    };
  }
};

// Calculate final priority score with strict hierarchy
const calculateFinalPriorityScore = async (aiAnalysis, locationAnalysis, socialAnalysis) => {
  let baseScore = 2; // Default medium priority
  let priorityTier = 3; // Default to tier 3 (lowest)

  // TIER 1: CRITICAL INFRASTRUCTURE PROXIMITY (ALWAYS HIGHEST PRIORITY)
  // Check if near hospitals, schools, colleges within 5km
  if (locationAnalysis && locationAnalysis.factors) {
    const criticalInfra = locationAnalysis.factors.find(f => f.type === 'critical_infrastructure');
    if (criticalInfra && criticalInfra.details) {
      // Check for hospitals, schools, colleges within 5km
      const nearCriticalInfra = criticalInfra.details.filter(place => 
        (place.type === 'hospitals' || place.type === 'schools' || place.type === 'emergencyServices') && 
        place.distance <= 5000 // 5km radius
      );
      
      if (nearCriticalInfra.length > 0) {
        priorityTier = 1; // HIGHEST PRIORITY TIER
        // Base score starts at 3.5 for critical infrastructure
        baseScore = 3.5;
        
        // Add bonus based on proximity and number of facilities
        const proximityBonus = nearCriticalInfra.reduce((bonus, place) => {
          const proximityFactor = 1 - (place.distance / 5000); // Closer = higher bonus
          return bonus + (proximityFactor * 0.3);
        }, 0);
        
        baseScore += proximityBonus;
        baseScore = Math.min(baseScore, 4.0); // Cap at critical
      }
    }
  }

  // TIER 2: SOCIAL ENGAGEMENT (SECOND PRIORITY)
  // Only applies if not in Tier 1
  if (priorityTier > 1 && socialAnalysis) {
    const engagementLevel = socialAnalysis.level;
    const totalEngagement = socialAnalysis.score || 0;
    
    // Check if qualifies for Tier 2 based on engagement thresholds
    if (engagementLevel === 'viral' || engagementLevel === 'tier2_high' || engagementLevel === 'tier2_medium') {
      priorityTier = 2;
      
      if (engagementLevel === 'viral') {
        baseScore = 3.8; // Very high priority for viral content
      } else if (engagementLevel === 'tier2_high') {
        baseScore = 3.4; // High engagement
      } else if (engagementLevel === 'tier2_medium') {
        baseScore = 3.0; // Medium-high engagement
      }
      
      // Add engagement bonus based on total score
      const engagementBonus = Math.min(totalEngagement / 300, 0.2); // Small bonus
      baseScore += engagementBonus;
    }
  }

  // TIER 3: URBAN INFRASTRUCTURE & POPULATION DENSITY (THIRD PRIORITY)
  // Only applies if not in Tier 1 or 2
  if (priorityTier > 2 && locationAnalysis) {
    const densityFactor = locationAnalysis.factors.find(f => f.type === 'population_density');
    if (densityFactor) {
      const density = densityFactor.details.density;
      const category = densityFactor.details.category;
      
      if (category === 'veryHigh' || category === 'high') {
        baseScore = 2.5; // Medium-high for urban areas
        
        // Add density bonus
        const densityBonus = Math.min(density / 15000, 0.4); // Max 0.4 bonus
        baseScore += densityBonus;
      } else if (category === 'medium') {
        baseScore = 2.2;
      }
    }
  }

  // AI Analysis Enhancement (applies to all tiers)
  if (aiAnalysis) {
    const aiScore = PRIORITY_VALUES[aiAnalysis.finalPriority || aiAnalysis.priority];
    const aiBonus = (aiScore - 2) * 0.2; // Small AI-based adjustment
    baseScore += aiBonus;
  }

  return {
    score: Math.min(baseScore, 4.0),
    tier: priorityTier,
    tierName: getTierName(priorityTier)
  };
};

// Get tier name for display
const getTierName = (tier) => {
  switch (tier) {
    case 1: return 'CRITICAL INFRASTRUCTURE';
    case 2: return 'HIGH COMMUNITY ENGAGEMENT';
    case 3: return 'URBAN INFRASTRUCTURE';
    default: return 'STANDARD';
  }
};

// Determine government department routing
const determineGovernmentRouting = async (issue, finalPriority, locationAnalysis) => {
  const category = issue.category?.toLowerCase().replace(' (coming soon)', '') || 'other';
  const departments = GOVERNMENT_DEPARTMENTS[category] || {
    primary: 'Municipal Corporation',
    secondary: 'General Administration',
    emergency: 'Emergency Services'
  };

  const routing = {
    primaryDepartment: departments.primary,
    secondaryDepartment: departments.secondary,
    escalationPath: [],
    urgencyLevel: finalPriority,
    estimatedResponseTime: getEstimatedResponseTime(finalPriority, category),
    specialInstructions: []
  };

  // Add escalation based on priority
  if (finalPriority === 'critical') {
    routing.escalationPath = [
      departments.emergency,
      departments.primary,
      'District Collector Office',
      'State Government'
    ];
    routing.specialInstructions.push('Immediate escalation required');
    routing.specialInstructions.push('24-hour monitoring');
  } else if (finalPriority === 'high') {
    routing.escalationPath = [
      departments.primary,
      departments.emergency,
      'Municipal Commissioner'
    ];
    routing.specialInstructions.push('Fast-track processing');
  } else {
    routing.escalationPath = [
      departments.primary,
      departments.secondary
    ];
  }

  // Add location-specific routing
  if (locationAnalysis && locationAnalysis.factors) {
    const criticalInfra = locationAnalysis.factors.find(f => f.type === 'critical_infrastructure');
    if (criticalInfra) {
      routing.specialInstructions.push('Coordinate with facility management');
      
      // Add specific department based on infrastructure type
      const infraDetails = criticalInfra.details;
      for (const place of infraDetails) {
        if (place.type === 'hospitals') {
          routing.escalationPath.unshift('Health Department');
        } else if (place.type === 'schools') {
          routing.escalationPath.unshift('Education Department');
        } else if (place.type === 'emergencyServices') {
          routing.escalationPath.unshift('Emergency Services Coordination');
        }
      }
    }
  }

  return routing;
};

// Get estimated response time based on priority and category
const getEstimatedResponseTime = (priority, category) => {
  const baseTimes = {
    potholes: { critical: '2-4 hours', high: '24-48 hours', medium: '3-7 days', low: '1-2 weeks' },
    garbage: { critical: '1-2 hours', high: '4-8 hours', medium: '1-3 days', low: '3-7 days' },
    streetlights: { critical: '2-6 hours', high: '12-24 hours', medium: '2-5 days', low: '1-2 weeks' },
    waterLeaks: { critical: '1-3 hours', high: '6-12 hours', medium: '1-3 days', low: '3-7 days' },
    trafficIssues: { critical: '30 minutes', high: '2-4 hours', medium: '1-2 days', low: '3-7 days' },
    publicSafety: { critical: '15-30 minutes', high: '1-2 hours', medium: '4-8 hours', low: '1-2 days' }
  };

  return baseTimes[category]?.[priority] || baseTimes.potholes[priority];
};

// Generate comprehensive recommendations
const generateComprehensiveRecommendations = (aiAnalysis, locationAnalysis, socialAnalysis, finalPriority) => {
  const recommendations = [];

  // Priority-based recommendations
  if (finalPriority === 'critical') {
    recommendations.push('🚨 CRITICAL: Immediate government intervention required');
    recommendations.push('📞 Alert emergency services and relevant departments');
    recommendations.push('📢 Public notification may be necessary');
    recommendations.push('⏱️ Implement 24-hour monitoring');
  } else if (finalPriority === 'high') {
    recommendations.push('⚡ HIGH PRIORITY: Fast-track through government channels');
    recommendations.push('📋 Assign dedicated case officer');
    recommendations.push('📅 Set strict resolution timeline');
  }

  // AI-based recommendations
  if (aiAnalysis) {
    if (aiAnalysis.confidence > 0.8) {
      recommendations.push(`🤖 AI Analysis: High confidence (${Math.round(aiAnalysis.confidence * 100)}%) - reliable assessment`);
    }
    
    if (aiAnalysis.advancedMetrics) {
      if (aiAnalysis.advancedMetrics.garbageInPotholes > 0) {
        recommendations.push('🗑️ Combined issue: Address both pothole and garbage problems');
      }
    }
  }

  // Location-based recommendations
  if (locationAnalysis) {
    const criticalInfra = locationAnalysis.factors.find(f => f.type === 'critical_infrastructure');
    if (criticalInfra) {
      recommendations.push('🏥 Near critical infrastructure: Coordinate with facility management');
      recommendations.push('🚑 Consider emergency service access requirements');
    }

    const density = locationAnalysis.factors.find(f => f.type === 'population_density');
    if (density && (density.details.category === 'veryHigh' || density.details.category === 'high')) {
      recommendations.push('👥 High population area: Public safety priority');
      recommendations.push('📢 Community notification recommended');
    }
  }

  // Social engagement recommendations
  if (socialAnalysis) {
    if (socialAnalysis.level === 'viral') {
      recommendations.push('🔥 Viral issue: Prepare for media attention');
      recommendations.push('📱 Monitor social media for updates');
    } else if (socialAnalysis.level === 'high') {
      recommendations.push('📈 High community interest: Regular updates needed');
    }
  }

  return recommendations;
};

// Generate detailed analysis text
const generateDetailedAnalysis = (results) => {
  let analysis = '';

  // Overall priority
  analysis += `🎯 FINAL PRIORITY: ${results.finalPriority.toUpperCase()} (Score: ${results.priorityScore.toFixed(2)}/4.0)\n\n`;

  // AI Analysis
  if (results.aiAnalysis) {
    analysis += `🤖 AI ANALYSIS:\n`;
    analysis += `${results.aiAnalysis.analysis}\n`;
    if (results.aiAnalysis.timeAdjustment && results.aiAnalysis.timeAdjustment.reason) {
      analysis += `⏰ Time factor: ${results.aiAnalysis.timeAdjustment.reason}\n`;
    }
    analysis += `Confidence: ${Math.round(results.aiAnalysis.confidence * 100)}%\n\n`;
  }

  // Location Analysis
  if (results.locationAnalysis) {
    analysis += `📍 LOCATION ANALYSIS:\n`;
    analysis += `${results.locationAnalysis.analysis}\n`;
    analysis += `Location multiplier: ${results.locationAnalysis.score.toFixed(2)}x\n\n`;
  }

  // Social Analysis
  if (results.socialAnalysis) {
    analysis += `👥 SOCIAL ENGAGEMENT:\n`;
    analysis += `${results.socialAnalysis.analysis}\n`;
    analysis += `Engagement level: ${results.socialAnalysis.level.toUpperCase()}\n\n`;
  }

  // Government Routing
  if (results.governmentRouting) {
    analysis += `🏛️ GOVERNMENT ROUTING:\n`;
    analysis += `Primary: ${results.governmentRouting.primaryDepartment}\n`;
    analysis += `Response time: ${results.governmentRouting.estimatedResponseTime}\n`;
    analysis += `Escalation: ${results.governmentRouting.escalationPath.join(' → ')}\n\n`;
  }

  // Recommendations
  if (results.recommendations.length > 0) {
    analysis += `💡 RECOMMENDATIONS:\n`;
    results.recommendations.forEach(rec => {
      analysis += `• ${rec}\n`;
    });
  }

  return analysis;
};

// Quick priority assessment for real-time use
export const getQuickPriorityAssessment = async (issue) => {
  const assessment = {
    priority: 'medium',
    score: 2,
    factors: [],
    quickAnalysis: ''
  };

  // Quick AI check
  if (issue.category) {
    const category = issue.category.toLowerCase();
    if (['potholes', 'garbage'].includes(category.replace(' (coming soon)', ''))) {
      assessment.factors.push('AI analysis available');
    }
  }

  // Quick location check
  if (issue.coordinates) {
    const isNearCritical = await isNearCriticalInfrastructure(issue.coordinates);
    if (isNearCritical) {
      assessment.priority = 'high';
      assessment.score = 3;
      assessment.factors.push('Near critical infrastructure');
    }
  }

  // Quick social check
  if (issue.socialMetrics) {
    const likes = issue.socialMetrics.likes || 0;
    const urgentFlags = issue.socialMetrics.urgentFlags || 0;
    
    if (urgentFlags > 3 || likes > 50) {
      assessment.priority = 'high';
      assessment.score = Math.max(assessment.score, 3);
      assessment.factors.push('High community concern');
    }
  }

  assessment.quickAnalysis = `Quick assessment: ${assessment.priority.toUpperCase()} priority based on ${assessment.factors.join(', ') || 'standard criteria'}.`;

  return assessment;
};

// Batch process multiple issues for priority ranking
export const batchProcessPriorities = async (issues) => {
  const processedIssues = [];

  for (const issue of issues) {
    try {
      const comprehensiveAnalysis = await calculateComprehensivePriority(issue);
      processedIssues.push({
        ...issue,
        comprehensiveAnalysis,
        finalPriority: comprehensiveAnalysis.finalPriority,
        priorityScore: comprehensiveAnalysis.priorityScore
      });
    } catch (error) {
      console.error(`Error processing issue ${issue.id}:`, error);
      processedIssues.push({
        ...issue,
        finalPriority: 'medium',
        priorityScore: 2,
        comprehensiveAnalysis: {
          detailedAnalysis: `Processing failed: ${error.message}`
        }
      });
    }
  }

  // Sort by priority score (highest first)
  return processedIssues.sort((a, b) => b.priorityScore - a.priorityScore);
};

// Export priority system status
export const getPrioritySystemStatus = () => {
  return {
    aiAnalysis: {
      available: true,
      supportedCategories: ['potholes', 'garbage'],
      upcomingCategories: ['streetlights', 'waterLeaks', 'trafficIssues', 'publicSafety']
    },
    locationAnalysis: {
      available: true,
      features: ['critical infrastructure detection', 'population density estimation', 'risk assessment']
    },
    socialEngagement: {
      available: true,
      features: ['engagement scoring', 'sentiment analysis', 'trending detection']
    },
    governmentRouting: {
      available: true,
      departments: Object.keys(GOVERNMENT_DEPARTMENTS).length,
      features: ['automatic routing', 'escalation paths', 'response time estimation']
    }
  };
};