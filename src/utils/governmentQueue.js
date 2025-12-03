// Government Priority Queue System
// Implements the exact 3-tier priority system as requested

import { calculateComprehensivePriority } from './comprehensivePriority';

// Create government priority queue with strict tier ordering
export const createGovernmentPriorityQueue = async (issues) => {
  const processedIssues = [];

  // Process each issue with comprehensive analysis
  for (const issue of issues) {
    try {
      const analysis = await calculateComprehensivePriority(issue);
      processedIssues.push({
        ...issue,
        analysis,
        priorityTier: analysis.priorityTier,
        priorityScore: analysis.priorityScore,
        tierName: analysis.tierName,
        finalPriority: analysis.finalPriority
      });
    } catch (error) {
      console.error(`Error processing issue ${issue.id}:`, error);
      // Default to tier 3 if processing fails
      processedIssues.push({
        ...issue,
        priorityTier: 3,
        priorityScore: 2.0,
        tierName: 'STANDARD',
        finalPriority: 'medium'
      });
    }
  }

  // Sort by tier first, then by score within each tier
  const sortedIssues = processedIssues.sort((a, b) => {
    // Primary sort: by tier (1 = highest priority)
    if (a.priorityTier !== b.priorityTier) {
      return a.priorityTier - b.priorityTier;
    }
    
    // Secondary sort: by score within same tier (higher score first)
    return b.priorityScore - a.priorityScore;
  });

  // Group by tiers for government dashboard
  const tiers = {
    tier1: sortedIssues.filter(issue => issue.priorityTier === 1),
    tier2: sortedIssues.filter(issue => issue.priorityTier === 2),
    tier3: sortedIssues.filter(issue => issue.priorityTier === 3)
  };

  return {
    sortedIssues,
    tiers,
    summary: generateQueueSummary(tiers)
  };
};

// Generate summary for government dashboard
const generateQueueSummary = (tiers) => {
  return {
    tier1: {
      count: tiers.tier1.length,
      name: 'CRITICAL INFRASTRUCTURE',
      description: 'Issues near hospitals, schools, colleges (within 5km)',
      urgency: 'IMMEDIATE ACTION REQUIRED',
      responseTime: '1-2 hours',
      color: 'red'
    },
    tier2: {
      count: tiers.tier2.length,
      name: 'HIGH COMMUNITY ENGAGEMENT',
      description: 'Issues with high likes, comments, and community concern',
      urgency: 'HIGH PRIORITY',
      responseTime: '4-8 hours',
      color: 'orange'
    },
    tier3: {
      count: tiers.tier3.length,
      name: 'URBAN INFRASTRUCTURE',
      description: 'Issues in high-density urban areas and city infrastructure',
      urgency: 'STANDARD PRIORITY',
      responseTime: '1-3 days',
      color: 'yellow'
    }
  };
};

// Get next issue for government action
export const getNextIssueForAction = (priorityQueue) => {
  const { sortedIssues } = priorityQueue;
  
  // Find first unassigned issue
  const nextIssue = sortedIssues.find(issue => 
    issue.status === 'open' || issue.status === 'reported'
  );

  if (!nextIssue) return null;

  return {
    issue: nextIssue,
    recommendation: generateActionRecommendation(nextIssue),
    department: getDepartmentAssignment(nextIssue),
    timeline: getActionTimeline(nextIssue)
  };
};

// Generate action recommendation for government
const generateActionRecommendation = (issue) => {
  const tier = issue.priorityTier;
  const analysis = issue.analysis;
  
  let recommendation = '';

  if (tier === 1) {
    recommendation = `🚨 CRITICAL: Issue near ${analysis.locationAnalysis?.factors.find(f => f.type === 'critical_infrastructure')?.details[0]?.name || 'critical infrastructure'}. `;
    recommendation += 'Immediate deployment required. Coordinate with facility management. ';
    recommendation += 'Consider emergency protocols if blocking access routes.';
  } else if (tier === 2) {
    const engagement = analysis.socialAnalysis;
    recommendation = `📢 HIGH ENGAGEMENT: Community showing strong concern (${engagement?.score || 0} engagement points). `;
    recommendation += 'Public response expected. Prepare status updates for community. ';
    recommendation += 'Monitor social media for escalation.';
  } else {
    recommendation = `🏙️ URBAN AREA: Issue in populated area. `;
    recommendation += 'Standard response protocols. ';
    recommendation += 'Schedule within regular maintenance cycles.';
  }

  // Add AI analysis insights
  if (analysis.aiAnalysis) {
    recommendation += ` AI Assessment: ${analysis.aiAnalysis.analysis.substring(0, 100)}...`;
  }

  return recommendation;
};

// Get department assignment based on issue type and priority
const getDepartmentAssignment = (issue) => {
  const category = issue.category?.toLowerCase().replace(' (coming soon)', '') || 'other';
  const tier = issue.priorityTier;
  
  const baseDepartments = {
    potholes: 'Public Works Department (PWD)',
    garbage: 'Sanitation Department',
    streetlights: 'Electrical Department',
    waterleaks: 'Water Supply Department',
    trafficissues: 'Traffic Police',
    publicsafety: 'Police Department'
  };

  const department = baseDepartments[category] || 'Municipal Corporation';
  
  // Add escalation for high-priority tiers
  const escalation = [];
  if (tier === 1) {
    escalation.push('District Collector');
    escalation.push('Emergency Coordination Center');
  } else if (tier === 2) {
    escalation.push('Municipal Commissioner');
    escalation.push('Public Relations Office');
  }

  return {
    primary: department,
    escalation,
    contactRequired: tier <= 2 // Require immediate contact for tier 1 & 2
  };
};

// Get action timeline based on priority tier
const getActionTimeline = (issue) => {
  const tier = issue.priorityTier;
  
  const timelines = {
    1: {
      acknowledgment: '15 minutes',
      teamDispatch: '1 hour',
      onSiteArrival: '2 hours',
      statusUpdate: '30 minutes',
      resolution: '4-8 hours'
    },
    2: {
      acknowledgment: '1 hour',
      teamDispatch: '4 hours',
      onSiteArrival: '8 hours',
      statusUpdate: '2 hours',
      resolution: '1-2 days'
    },
    3: {
      acknowledgment: '4 hours',
      teamDispatch: '1 day',
      onSiteArrival: '2 days',
      statusUpdate: '1 day',
      resolution: '3-7 days'
    }
  };

  return timelines[tier] || timelines[3];
};

// Filter issues by specific criteria for government dashboard
export const filterIssuesByGovernmentCriteria = (issues, criteria) => {
  return issues.filter(issue => {
    // Filter by tier
    if (criteria.tier && issue.priorityTier !== criteria.tier) {
      return false;
    }

    // Filter by department
    if (criteria.department) {
      const dept = getDepartmentAssignment(issue);
      if (!dept.primary.toLowerCase().includes(criteria.department.toLowerCase())) {
        return false;
      }
    }

    // Filter by location type
    if (criteria.locationType) {
      const analysis = issue.analysis;
      if (criteria.locationType === 'critical_infrastructure') {
        const hasInfra = analysis?.locationAnalysis?.factors.some(f => f.type === 'critical_infrastructure');
        if (!hasInfra) return false;
      }
    }

    // Filter by urgency level
    if (criteria.urgency) {
      if (criteria.urgency === 'immediate' && issue.priorityTier !== 1) return false;
      if (criteria.urgency === 'high' && issue.priorityTier > 2) return false;
    }

    return true;
  });
};

// Generate government report
export const generateGovernmentReport = (priorityQueue) => {
  const { tiers, summary } = priorityQueue;
  
  const report = {
    timestamp: new Date().toISOString(),
    totalIssues: tiers.tier1.length + tiers.tier2.length + tiers.tier3.length,
    criticalIssues: tiers.tier1.length,
    highPriorityIssues: tiers.tier2.length,
    standardIssues: tiers.tier3.length,
    
    // Immediate action required
    immediateAction: tiers.tier1.map(issue => ({
      id: issue.id,
      title: issue.title,
      location: issue.location,
      nearbyFacility: issue.analysis?.locationAnalysis?.factors
        .find(f => f.type === 'critical_infrastructure')?.details[0]?.name || 'Unknown',
      department: getDepartmentAssignment(issue).primary,
      timeline: getActionTimeline(issue)
    })),
    
    // High engagement issues
    highEngagement: tiers.tier2.map(issue => ({
      id: issue.id,
      title: issue.title,
      engagementScore: issue.analysis?.socialAnalysis?.score || 0,
      communityLevel: issue.analysis?.socialAnalysis?.level || 'unknown',
      department: getDepartmentAssignment(issue).primary
    })),
    
    // Department workload
    departmentWorkload: calculateDepartmentWorkload(priorityQueue.sortedIssues),
    
    // Recommendations
    recommendations: generateSystemRecommendations(tiers)
  };

  return report;
};

// Calculate workload per department
const calculateDepartmentWorkload = (issues) => {
  const workload = {};
  
  issues.forEach(issue => {
    const dept = getDepartmentAssignment(issue).primary;
    if (!workload[dept]) {
      workload[dept] = { total: 0, tier1: 0, tier2: 0, tier3: 0 };
    }
    
    workload[dept].total++;
    workload[dept][`tier${issue.priorityTier}`]++;
  });

  return workload;
};

// Generate system recommendations for government
const generateSystemRecommendations = (tiers) => {
  const recommendations = [];

  if (tiers.tier1.length > 5) {
    recommendations.push({
      type: 'CRITICAL_OVERLOAD',
      message: `${tiers.tier1.length} critical infrastructure issues require immediate attention. Consider emergency resource allocation.`,
      action: 'Deploy additional emergency teams'
    });
  }

  if (tiers.tier2.length > 10) {
    recommendations.push({
      type: 'HIGH_ENGAGEMENT',
      message: `${tiers.tier2.length} issues have high community engagement. Public response strategy needed.`,
      action: 'Prepare public communications and status updates'
    });
  }

  const totalIssues = tiers.tier1.length + tiers.tier2.length + tiers.tier3.length;
  if (totalIssues > 50) {
    recommendations.push({
      type: 'SYSTEM_CAPACITY',
      message: `${totalIssues} total issues in queue. Consider increasing processing capacity.`,
      action: 'Review resource allocation and staffing levels'
    });
  }

  return recommendations;
};